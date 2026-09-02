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
const KOPF = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,PUT,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store',
};
const antwort = (o, status = 200) => new Response(JSON.stringify(o),
  { status, headers: { ...KOPF, 'content-type': 'application/json' } });

export default {
  async fetch(anfrage, umgebung) {
    if (anfrage.method === 'OPTIONS') return new Response(null, { headers: KOPF });

    const weg = new URL(anfrage.url).pathname;
    /* Die Raumkennung wird STRENG geprueft, nicht durchgereicht.
     * Sie ist ein Schluessel im Lager; alles, was kein SHA-256-Ableger
     * ist, kann nur ein Versuch sein, an andere Schluessel zu kommen. */
    const treffer = weg.match(/^\/v1\/([0-9a-f]{32})$/);
    if (!treffer) return antwort({ fehler: 'unbekannter Weg' }, 404);
    const raum = treffer[1];

    if (anfrage.method === 'GET') {
      const da = await umgebung.STAND.get(raum, { type: 'json' });
      return antwort(da || { fassung: 0, stand: null });
    }

    if (anfrage.method === 'PUT') {
      const laenge = +anfrage.headers.get('content-length') || 0;
      if (laenge > GRENZE) return antwort({ fehler: 'zu gross' }, 413);
      let rein;
      try { rein = await anfrage.json(); } catch { return antwort({ fehler: 'kein JSON' }, 400); }
      if (typeof rein?.stand !== 'string' || rein.stand.length > GRENZE)
        return antwort({ fehler: 'kein Stand' }, 400);

      const da = await umgebung.STAND.get(raum, { type: 'json' });
      const jetzt = da ? +da.fassung || 0 : 0;
      /* Die Fassung ist die einzige Vorsichtsmassnahme gegen zwei Geraete,
       * die gleichzeitig senden. Wer eine alte Fassung mitbringt, bekommt
       * den aktuellen Stand zurueck und fuehrt selbst zusammen - der
       * Server entscheidet nichts, er kann es auch gar nicht: er sieht den
       * Inhalt nicht. */
      if ((+rein.fassung || 0) !== jetzt) return antwort({ fassung: jetzt, stand: da?.stand ?? null }, 409);

      const neu = { fassung: jetzt + 1, stand: rein.stand, zeit: Date.now() };
      await umgebung.STAND.put(raum, JSON.stringify(neu));
      return antwort({ fassung: neu.fassung });
    }

    return antwort({ fehler: 'nur GET und PUT' }, 405);
  },
};
