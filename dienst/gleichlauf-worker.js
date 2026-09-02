/* Der Gleichlaufdienst. Eine Datei, ein Cloudflare Worker, ein KV-Lager.
 *
 * Was er WEISS: eine Raumkennung (32 Hexzeichen) und einen Haufen Bytes.
 * Was er NICHT weiss: wer dahintersteckt, was darin steht, wieviele Kinder,
 * welche Aufgaben, welche Namen. Der Schluessel wird auf dem Geraet aus dem
 * Familiencode abgeleitet und verlaesst es nie; die Raumkennung ist ein
 * anderer Ableger desselben Codes. Auch wer dieses Lager komplett kopiert,
 * hat nichts als Zufallsrauschen.
 *
 * Deshalb steht hier auch keine Anmeldung: es gibt nichts zu schuetzen,
 * was der Schluessel nicht schon schuetzt. Wer die Raumkennung kennt, kann
 * den Inhalt UEBERSCHREIBEN - das ist der eine Angriff, der bleibt, und er
 * setzt voraus, dass man 80 Bit erraet.
 *
 * ---------------------------------------------------------------------
 * EINRICHTEN (einmal, rund fuenf Minuten)
 *
 *   1. Ein Cloudflare-Konto anlegen (kostenlos).
 *   2. `npm i -g wrangler` und `wrangler login`.
 *   3. Im Verzeichnis `dienst/`:  `wrangler kv namespace create STAND`
 *      Die Kennung, die dabei herauskommt, in `wrangler.toml` eintragen.
 *   4. `wrangler deploy`
 *   5. Die Adresse, die wrangler nennt, beim Bauen mitgeben:
 *         SMARTKIDS_GLEICHLAUF=https://... npm run bauen
 *      oder als Variable im Auslieferungs-Workflow.
 *
 * Ohne Schritt 5 ist der Abgleich AUS: die App zeigt im Elternbereich,
 * dass er nicht eingerichtet ist, und alles andere laeuft wie bisher.
 * ---------------------------------------------------------------------
 *
 * Das Protokoll ist absichtlich winzig - zwei Aufrufe:
 *
 *   GET  /v1/<raum>   ->  { fassung, stand }        fassung 0 = leer
 *   PUT  /v1/<raum>   <-  { fassung, stand }        fassung = die zuletzt
 *                                                   gelesene
 *         200  { fassung }                          angenommen
 *         409  { fassung, stand }                   jemand war schneller;
 *                                                   das ist KEIN Fehler,
 *                                                   der Client fuehrt
 *                                                   zusammen und sendet neu
 */

const GRENZE = 512 * 1024;        // ein Stand ist ein paar Kilobyte; 512 KB
                                  // ist reichlich Luft und trotzdem eine Grenze

/* Wie lange ein Raum lebt, wenn ihn niemand mehr anfasst (Audit B).
 *
 * Vorher: ewig. Ein Raum, einmal geschrieben, lag fuer immer im Lager -
 * auch der, dessen Familienschluessel jemand gewechselt hat, und auch
 * der, den ein Fremder angelegt hat. Das ist zweierlei: Kosten, die nur
 * wachsen, und ein Stand, der weiterliegt, obwohl ihn niemand mehr
 * haben will.
 *
 * Ein Verfall ist hier GEFAHRLOS, und das ist der Punkt: jedes Geraet
 * traegt seinen VOLLSTAENDIGEN Stand selbst. Der Raum ist ein
 * Treffpunkt, kein Lager. Faellt er weg, legen ihn die Geraete beim
 * naechsten Abgleich neu an und fuehren zusammen wie beim ersten Mal -
 * es geht nichts verloren, es kostet einen Abgleich.
 *
 * 180 Tage, und jedes Schreiben setzt die Frist neu. Eine Familie, die
 * ein halbes Jahr keines ihrer Geraete anfasst, hat den Gleichlauf
 * nicht mehr noetig; eine, die ihn nutzt, verlaengert ihn bei jedem
 * Speichern, ohne es zu merken.
 *
 * Cloudflare KV verlangt mindestens 60 Sekunden; 180 Tage sind weit
 * darueber und weit unter jeder Obergrenze. */
const FRIST = 180 * 24 * 60 * 60;

/* Woher Anfragen kommen duerfen (Audit B).
 *
 * Voreinstellung bleibt `*`, und das ist ehrlich so gemeint: die Adresse
 * des Dienstes steht in jeder gebauten Datei und damit oeffentlich im
 * Netz, und `curl` fragt ohnehin nicht nach Herkunft. CORS schuetzt
 * hier NICHTS gegen jemanden, der es darauf anlegt.
 *
 * Es schuetzt gegen etwas anderes, und das ist keine Kleinigkeit: gegen
 * FREMDE BROWSER als Werkzeug. Eine beliebige Seite im Netz kann sonst
 * jeden ihrer Besucher unbemerkt in diesen Dienst schreiben lassen, und
 * die Rechnung dafuer bekommt der, dem das Cloudflare-Konto gehoert.
 * Wer `HERKUNFT` in `wrangler.toml` auf seine Pages-Adresse setzt,
 * schneidet diese ganze Klasse ab und verliert dabei nichts ausser der
 * Moeglichkeit, den Dienst von einer anderen Seite aus anzusprechen.
 *
 * Mehrere Adressen mit Komma. `HERKUNFT` leer oder fehlend heisst `*`. */
const herkunftKopf = (anfrage, umgebung) => {
  const erlaubt = String(umgebung.HERKUNFT || '').split(',')
    .map(x => x.trim()).filter(Boolean);
  if (!erlaubt.length) return '*';
  const woher = anfrage.headers.get('origin') || '';
  return erlaubt.includes(woher) ? woher : erlaubt[0];
};
const KOPF = (anfrage, umgebung) => ({
  'access-control-allow-origin': herkunftKopf(anfrage, umgebung),
  'access-control-allow-methods': 'GET,PUT,OPTIONS',
  'access-control-allow-headers': 'content-type',
  /* `vary: origin` - ohne ihn liefert ein Zwischenspeicher die Antwort
   * fuer die eine Herkunft an die naechste aus, und die Erlaubnis stuende
   * dann fuer jemanden da, der sie nicht hat. */
  'vary': 'origin',
  'cache-control': 'no-store',
});
const antwort = (anfrage, umgebung, o, status = 200) => new Response(JSON.stringify(o),
  { status, headers: { ...KOPF(anfrage, umgebung), 'content-type': 'application/json' } });

export default {
  async fetch(anfrage, umgebung) {
    const sag = (o, status = 200) => antwort(anfrage, umgebung, o, status);
    if (anfrage.method === 'OPTIONS')
      return new Response(null, { headers: KOPF(anfrage, umgebung) });

    const weg = new URL(anfrage.url).pathname;
    /* Die Raumkennung wird STRENG geprueft, nicht durchgereicht.
     * Sie ist ein Schluessel im Lager; alles, was kein SHA-256-Ableger
     * ist, kann nur ein Versuch sein, an andere Schluessel zu kommen. */
    const treffer = weg.match(/^\/v1\/([0-9a-f]{32})$/);
    if (!treffer) return sag({ fehler: 'unbekannter Weg' }, 404);
    const raum = treffer[1];

    if (anfrage.method === 'GET') {
      const da = await umgebung.STAND.get(raum, { type: 'json' });
      return sag(da || { fassung: 0, stand: null });
    }

    if (anfrage.method === 'PUT') {
      /* Erst LESEN und dabei zaehlen, dann auswerten (Audit B).
       *
       * Hier stand nur `content-length` - und der ist kein Riegel: eine
       * Anfrage in Stuecken (`transfer-encoding: chunked`) hat gar
       * keinen, `+null || 0` ist null, und die Pruefung ging durch.
       * Danach las `anfrage.json()` den ganzen Koerper ein, wie gross er
       * auch war; erst die Zeile darunter sah nach, und da lag alles
       * schon im Speicher. Die eine Pruefung war Zierde, die andere kam
       * zu spaet.
       *
       * Jetzt wird der Text gelesen und seine Laenge gemessen - das ist
       * die Zahl, die zaehlt, und sie luegt nicht. Der Kopf bleibt als
       * schnelle Absage davor: wer ehrlich ankuendigt, zu viel zu
       * schicken, bekommt die 413, bevor ein Byte fliesst. */
      const angekuendigt = +anfrage.headers.get('content-length') || 0;
      if (angekuendigt > GRENZE) return sag({ fehler: 'zu gross' }, 413);
      let text;
      try { text = await anfrage.text(); } catch { return sag({ fehler: 'kein Körper' }, 400); }
      if (text.length > GRENZE) return sag({ fehler: 'zu gross' }, 413);
      let rein;
      try { rein = JSON.parse(text); } catch { return sag({ fehler: 'kein JSON' }, 400); }
      if (typeof rein?.stand !== 'string' || rein.stand.length > GRENZE)
        return sag({ fehler: 'kein Stand' }, 400);

      const da = await umgebung.STAND.get(raum, { type: 'json' });
      const jetzt = da ? +da.fassung || 0 : 0;
      /* Die Fassung ist die einzige Vorsichtsmassnahme gegen zwei Geraete,
       * die gleichzeitig senden. Wer eine alte Fassung mitbringt, bekommt
       * den aktuellen Stand zurueck und fuehrt selbst zusammen - der
       * Server entscheidet nichts, er kann es auch gar nicht: er sieht den
       * Inhalt nicht. */
      if ((+rein.fassung || 0) !== jetzt) return sag({ fassung: jetzt, stand: da?.stand ?? null }, 409);

      const neu = { fassung: jetzt + 1, stand: rein.stand, zeit: Date.now() };
      await umgebung.STAND.put(raum, JSON.stringify(neu), { expirationTtl: FRIST });
      return sag({ fassung: neu.fassung });
    }

    return sag({ fehler: 'nur GET und PUT' }, 405);
  },
};
