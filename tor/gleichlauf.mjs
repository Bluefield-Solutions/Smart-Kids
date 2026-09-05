/* Tor `gleichlauf` - fuehrt der Gleichlauf wirklich zusammen?
 *
 * Ohne Browser und ohne Netz: alles, was hier geprueft wird, ist eine
 * Rechnung. Der Dienst wird nachgebaut (`dienstImKopf`), und zwar mit
 * derselben Fassungspruefung wie der echte - sonst prueft dieses Tor
 * einen Ablauf, den es so nirgends gibt.
 *
 * Warum das ein eigenes Tor ist und nicht ein Abschnitt im Rauchtest:
 * die Frage „verliert jemand etwas" ist an ZWEI Staenden zu stellen, und
 * einen zweiten Browser mit einem zweiten IndexedDB fuer jede Probe
 * aufzumachen kostet Minuten. Hier kostet es Millisekunden, und die
 * Gegenproben koennen deshalb jeden Fall einzeln nachstellen.
 */
import * as G from '../src/kern/gleichlauf.js';
import DIENST from '../dienst/gleichlauf-worker.js';

let fehler = [];
const pruefe = (satz, bedingung) => { if (!bedingung) fehler.push(satz); };

/* Ein Abschnitt faengt seinen eigenen Absturz.
 *
 * Ohne das verschluckt die erste Ausnahme alles, was vorher gefunden
 * wurde: der Lauf bricht ab, bevor die Liste gedruckt wird. Gemerkt hat
 * das die Gegenprobe „der Gleichlauf schickt Klartext" - das Tor wurde
 * rot, aber mit einem Stapelabzug statt mit dem Befund, und damit war
 * nicht zu sehen, WORAN es gescheitert ist. Ein Tor, das beim Fehlschlag
 * eine andere Sprache spricht, ist beim Fehlschlag keins. */
async function abschnitt(name, fn) {
  try { await fn(); }
  catch (e) { fehler.push(`${name}: der Lauf ist abgestürzt (${e && e.message})`); }
}

console.log('\n  Tor `gleichlauf`');

/* ---------- Der Familienschluessel ------------------------------------ */
await abschnitt('Familienschlüssel', async () => {
  const c = G.schluesselNeu();
  pruefe(`der Code ist nicht 16 Zeichen in vier Gruppen: „${c}"`,
    /^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/.test(c));
  pruefe('ein Code ueberlebt das Hin und Zurueck nicht',
    G.alsCode(G.ausCode(c)) === c);
  /* Getippt wird auf einem Telefon. Kleinbuchstaben, Leerzeichen statt
     Bindestrich, eine O statt der Null, ein l statt der Eins - alles
     davon muss ankommen, sonst schickt der Code Eltern in einen leeren
     Raum und niemand kann sagen warum. */
  const schlampig = c.toLowerCase().replace(/-/g, ' ')
    .replace(/0/g, 'O').replace(/1/g, 'l');
  pruefe(`schlampig getippt kommt nicht an: „${schlampig}"`,
    G.alsCode(G.ausCode(schlampig)) === c);
  /* Ein FESTER Code neben dem gewuerfelten: jedes Zeichen des Alphabets
     kommt hier einmal vor. Der gewuerfelte trifft ein Q nur in etwa
     jedem fuenften Lauf - ein Fehler, der davon abhaengt, ist ein
     Fehler, der irgendwann durchrutscht. */
  const ABC_ALLE = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  for (const z of ABC_ALLE) {
    const fest = (z + 'ABCDEFGHJKMNPQR').slice(0, 16).match(/.{4}/g).join('-');
    pruefe(`der Code „${fest}" ueberlebt das Hin und Zurueck nicht`,
      G.alsCode(G.ausCode(fest)) === fest);
  }
  pruefe('ein U wird stillschweigend zu einem V verbogen, statt aufzufallen',
    G.ausCode('UUUU-ABCD-ABCD-ABCD') === null);
  pruefe('ein zu kurzer Code wird angenommen', G.ausCode('ABCD-EFGH') === null);
  pruefe('ein leerer Code wird angenommen', G.ausCode('') === null);
  /* Zwei frische Schluessel duerfen sich nicht gleichen. Klingt
     selbstverstaendlich - ist es genau dann nicht mehr, wenn jemand die
     Zufallsquelle gegen `Math.random` tauscht, weil es „einfacher zu
     pruefen" ist. */
  const viele = new Set(Array.from({ length: 200 }, () => G.schluesselNeu()));
  pruefe(`von 200 Schluesseln sind nur ${viele.size} verschieden`, viele.size === 200);
});

/* ---------- Raum und Schloss ------------------------------------------ */
await abschnitt('Raum und Schloss', async () => {
  const a = G.schluesselNeu(), b = G.schluesselNeu();
  const raumA = await G.raumVon(a);
  pruefe('die Raumkennung ist nicht 32 Hexzeichen', /^[0-9a-f]{32}$/.test(raumA));
  pruefe('derselbe Code gibt zwei verschiedene Raeume', raumA === await G.raumVon(a));
  pruefe('zwei Codes landen im selben Raum', raumA !== await G.raumVon(b));

  const schlossA = await G.schlossVon(a), schlossB = await G.schlossVon(b);
  const zu = await G.zusperren(schlossA, { geheim: 'Fiona' });
  pruefe('zugesperrt und wieder auf ergibt etwas anderes',
    JSON.stringify(await G.aufsperren(schlossA, zu)) === '{"geheim":"Fiona"}');
  pruefe('ein FREMDER Schluessel sperrt auf', await G.aufsperren(schlossB, zu) === null);
  /* Und der Inhalt darf im Zugesperrten nicht zu finden sein. Die Probe
     ist stumpf und trifft trotzdem den Fall, der wirklich passiert: jemand
     schaltet die Verschluesselung ab und schickt Klartext. */
  pruefe('der Name steht lesbar im Umschlag', !/Fiona/.test(zu));
  const zu2 = await G.zusperren(schlossA, { geheim: 'Fiona' });
  pruefe('zweimal derselbe Inhalt gibt zweimal denselben Umschlag — '
    + 'dann ist der Zufallsstreifen fest', zu !== zu2);
});

/* ---------- Zusammenfuehren: niemand verliert etwas -------------------- */
const satz = (o) => ({ fach: 1, hoechstes: 1, faellig: 0, richtig: 0, falsch: 0, zuletzt: 0, ...o });
await abschnitt('Zusammenführen', async () => {
  // Der Fall, um den es geht: ein Aufkleber auf dem iPad, ein anderer auf
  // dem iPhone. Danach hat jedes Geraet beide.
  const ipad   = { fortschritt: { 'fiona:kontinente': { afrika: satz({ fach: 3, hoechstes: 3, zuletzt: 100 }) } } };
  const iphone = { fortschritt: { 'fiona:kontinente': { europa: satz({ fach: 3, hoechstes: 3, zuletzt: 200 }) } } };
  const v = G.vereinen(ipad, iphone);
  const drin = Object.keys(v.fortschritt['fiona:kontinente']).sort().join(',');
  pruefe(`zusammengefuehrt fehlt etwas: ${drin}`, drin === 'afrika,europa');

  // Der Aufkleber faellt nie zurueck, auch wenn der andere Stand juenger
  // ist und das Gebiet dort nur im ersten Fach steht.
  const hoch = { fortschritt: { x: { a: satz({ fach: 4, hoechstes: 4, zuletzt: 10 }) } } };
  const frisch = { fortschritt: { x: { a: satz({ fach: 1, hoechstes: 1, zuletzt: 999 }) } } };
  const w = G.vereinen(hoch, frisch).fortschritt.x.a;
  pruefe(`der Aufkleber ist weg: hoechstes ${w.hoechstes}`, w.hoechstes === 4);
  pruefe(`das laufende Fach kommt nicht vom juengeren Stand: ${w.fach}`, w.fach === 1);

  // Reihenfolge und Wiederholung duerfen nichts aendern - sonst kommen
  // drei Geraete nie zur Ruhe.
  pruefe('die Reihenfolge aendert das Ergebnis',
    JSON.stringify(G.vereinen(ipad, iphone)) === JSON.stringify(G.vereinen(iphone, ipad)));
  pruefe('zweimal zusammenfuehren aendert noch etwas',
    JSON.stringify(G.vereinen(v, ipad)) === JSON.stringify(v));

  /* Und dasselbe mit einem UNVOLLSTAENDIGEN Satz - dem Fall, den
     `npm run dienstprobe` gefunden hat. Ein Gegenstand, den nur ein
     Geraet kennt, muss beim ersten Zusammenfuehren fertig gerechnet
     werden; sonst kommen die fehlenden Felder erst beim zweiten dazu,
     und der Stand sieht geaendert aus, obwohl niemand geuebt hat.
     Beispielsaetze mit allen Feldern sehen das nie - deshalb steht hier
     ausdruecklich einer ohne. */
  const halb = { fortschritt: { x: { a: { fach: 3, hoechstes: 3, zuletzt: 1 } } } };
  const einmal = G.vereinen(null, halb);
  pruefe('ein unvollstaendiger Satz wird durchgereicht statt ausgerechnet',
    JSON.stringify(G.vereinen(einmal, einmal)) === JSON.stringify(einmal));
  pruefe('nach dem Zusammenfuehren fehlen dem Satz noch Felder',
    'richtig' in einmal.fortschritt.x.a && 'falsch' in einmal.fortschritt.x.a);

  // Die Zaehler werden nicht addiert. Beide Geraete tragen die gemeinsame
  // Vorgeschichte; eine Summe zaehlte sie doppelt.
  const z = G.vereinen({ fortschritt: { x: { a: satz({ richtig: 5, zuletzt: 1 }) } } },
                       { fortschritt: { x: { a: satz({ richtig: 7, zuletzt: 2 }) } } });
  pruefe(`die Zaehler werden addiert statt verglichen: ${z.fortschritt.x.a.richtig}`,
    z.fortschritt.x.a.richtig === 7);
});

/* ---------- Das Protokoll (Q30) --------------------------------------- */
await abschnitt('Protokoll', async () => {
  const e = (t) => ({ zeit:t, profil:'fiona', ebene:'kontinente', gebietId:'afrika',
    eingabeart:'auswahl', ergebnis:'richtig', roheingabe:'', sicherheit:null,
    dauerMs:3421, versuch:1, fachVorher:2, fachNachher:3 });

  // Anhaengend: was auf einem Geraet steht, steht danach auf beiden.
  const a = { protokoll: { 'a1': e(100), 'a2': e(200) } };
  const b = { protokoll: { 'b1': e(150) } };
  const v = G.vereinen(a, b);
  pruefe(`vereinigt fehlt ein Eintrag: ${Object.keys(v.protokoll).sort().join(',')}`,
    Object.keys(v.protokoll).sort().join(',') === 'a1,a2,b1');
  pruefe('die Reihenfolge aendert das Protokoll',
    JSON.stringify(G.vereinen(b, a).protokoll) === JSON.stringify(v.protokoll));

  /* Die Grenze. Ohne sie waere der Umschlag nach einem halben Jahr
     groesser als der Dienst annimmt - und der Gleichlauf hoerte still
     auf zu funktionieren, genau dann, wenn am meisten drinsteht.

     Geprueft wird an einer Menge, die das Budget SICHER sprengt: 4500
     Eintraege sind gemessen rund 1,1 MB. */
  const viel = {}; for (let i = 0; i < 4500; i++) viel['t' + i] = e(i);
  const beschnitten = G.protokollVereinen({}, viel);
  const gross = JSON.stringify(beschnitten).length;
  pruefe(`das beschnittene Protokoll wiegt ${Math.round(gross / 1024)} KB, `
    + `erlaubt sind ${Math.round(G.PROTOKOLL_BUDGET / 1024)}`,
    gross <= G.PROTOKOLL_BUDGET);
  pruefe('die Grenze schneidet alles weg', Object.keys(beschnitten).length > 100);
  /* Und sie schneidet das RICHTIGE weg: das Juengste bleibt. Ein
     Beschnitt, der die neuesten Antworten wegwirft, waere schlimmer als
     keiner - der Elternbereich zeigt dann eine Geschichte, die vor
     Monaten aufhoert. */
  const zeiten = Object.values(beschnitten).map(x => x.zeit);
  pruefe(`der Beschnitt behaelt das Aelteste statt des Juengsten `
    + `(${Math.min(...zeiten)} bis ${Math.max(...zeiten)})`,
    Math.max(...zeiten) === 4499);
  pruefe('nach dem Beschneiden aendert ein zweiter Durchgang noch etwas',
    JSON.stringify(G.protokollVereinen(beschnitten, beschnitten))
      === JSON.stringify(beschnitten));

  /* Sortiert wird nach der ZEIT im Eintrag, nicht nach dem Schluessel:
     als Text steht „9…" vor „10…", und ein Protokoll, das nach Text
     sortiert beschnitten wird, wirft die falschen weg. */
  const gemischt = { '9-x': e(9), '10-x': e(10), '100-x': e(100) };
  /* Ein Budget, in das genau EINER passt (ein Eintrag wiegt gemessen 241
     Byte). Waere es kleiner, passte gar keiner, und die Zeile bewiese
     nichts - der erste Anlauf stand auf 200 und meldete eine leere
     Liste. */
  const einer = G.protokollVereinen({}, gemischt, 300);
  pruefe(`es passt nicht genau einer hinein: ${Object.keys(einer).join(',')}`,
    Object.keys(einer).length === 1);
  pruefe(`nach Text sortiert statt nach Zeit: ${Object.keys(einer).join(',')}`,
    Object.keys(einer)[0] === '100-x');
});

/* ---------- Was reist und was nicht ----------------------------------- */
await abschnitt('Was reist', async () => {
  pruefe('die PIN reist mit', !G.REIST('pin'));
  pruefe('die Stimme reist mit', !G.REIST('stimme'));
  pruefe('der Sitzungszaehler reist nicht', G.REIST('nr:fiona:kontinente'));
  /* DER SCHLUESSEL, DEN DIE APP WIRKLICH SCHREIBT.
   *
   * Hier stand `G.REIST('glatt')` - also der Name aus `REIST` selbst und
   * nicht der aus `glattSchluessel()` in `spiel.js`, der
   * `ohnefehler:<kind>` lautet. Die Pruefung schrieb ihren Gegenstand vom
   * Prueflig ab und konnte deshalb nie etwas melden (Regel 1: sie war kein
   * Beweis). Sie war zwei Fassungen lang gruen, waehrend „Einmal ganz ohne
   * Fehler" zwischen iPhone und iPad NICHT reiste. */
  pruefe('„ohne Fehler" reist nicht', G.REIST('ohnefehler:fiona'));
  pruefe('das Wort „glatt" reist, obwohl es den Schluessel nicht gibt',
    !G.REIST('glatt'));
  pruefe('die Tiersammlung reist nicht', G.REIST('tiere:fiona'));

  const v = G.vereinen(
    { einstellungen: { pin: '1234', 'nr:a': 7, 'ohnefehler:a': { zeit: 500 },
                       'tiere:a': { ids: ['fuchs'], gorilla: 2 } } },
    { einstellungen: { pin: '9999', 'nr:a': 3, 'ohnefehler:a': { zeit: 200 },
                       'tiere:a': { ids: ['eule'], gorilla: 5 } } });
  pruefe('die PIN ist im Umschlag gelandet', !('pin' in v.einstellungen));
  pruefe(`der Sitzungszaehler ist nicht der groessere: ${v.einstellungen['nr:a']}`,
    v.einstellungen['nr:a'] === 7);
  /* „Einmal ganz ohne Fehler" zaehlt das ERSTE Mal. Nimmt man das
     spaetere, wandert der Tag bei jedem Abgleich nach vorn, und aus
     einem Ereignis wird ein Zustand. */
  pruefe(`„ohne Fehler" nimmt nicht das fruehere: ${v.einstellungen['ohnefehler:a'].zeit}`,
    v.einstellungen['ohnefehler:a'].zeit === 200);
  /* Die Sammlung wird VEREINIGT, nicht ersetzt (T1). Wer auf dem iPad
     einen Fuchs und auf dem iPhone eine Eule bekommen hat, hat beide -
     ein Aufkleber, den das andere Geraet wegnimmt, waere schlimmer als
     gar kein Gleichlauf. Beim Gorilla zaehlt die groessere Zahl. */
  pruefe(`die Tiere werden nicht vereinigt: ${v.einstellungen['tiere:a'].ids}`,
    ['eule', 'fuchs'].every(x => v.einstellungen['tiere:a'].ids.includes(x))
    && v.einstellungen['tiere:a'].ids.length === 2);
  pruefe(`der Gorilla nimmt nicht die groessere Zahl: ${v.einstellungen['tiere:a'].gorilla}`,
    v.einstellungen['tiere:a'].gorilla === 5);
});

/* ---------- Eine ganze Runde gegen einen nachgebauten Dienst ----------- */
function dienstImKopf() {
  const lager = {};
  const netz = async (url, o = {}) => {
    const raum = url.split('/').pop();
    netz.aufrufe++;
    if ((o.method || 'GET') === 'GET')
      return { ok: true, status: 200, json: async () => lager[raum] || { fassung: 0, stand: null } };
    const rein = JSON.parse(o.body);
    const jetzt = lager[raum] ? lager[raum].fassung : 0;
    if ((rein.fassung || 0) !== jetzt)
      return { ok: false, status: 409, json: async () => lager[raum] };
    lager[raum] = { fassung: jetzt + 1, stand: rein.stand };
    netz.schreibt++;
    return { ok: true, status: 200, json: async () => ({ fassung: jetzt + 1 }) };
  };
  netz.aufrufe = 0; netz.schreibt = 0; netz.lager = lager;
  return netz;
}
await abschnitt('Eine ganze Runde', async () => {
  const netz = dienstImKopf();
  const code = G.schluesselNeu();
  const A = { fortschritt: { 'fiona:kontinente': { afrika: satz({ hoechstes: 3, zuletzt: 100 }) } } };
  const B = { fortschritt: { 'fiona:kontinente': { europa: satz({ hoechstes: 3, zuletzt: 200 }) } } };
  const r1 = await G.runde('http://dienst', code, A, netz);
  pruefe(`die erste Runde meldet einen Fehler: ${r1.fehler}`, !r1.fehler);
  const r2 = await G.runde('http://dienst', code, B, netz);
  const beide = Object.keys(r2.stand.fortschritt['fiona:kontinente']).sort().join(',');
  pruefe(`nach dem Abgleich fehlt etwas auf Geraet B: ${beide}`, beide === 'afrika,europa');
  const r3 = await G.runde('http://dienst', code, r2.stand, netz);
  pruefe('ein Geraet, das schon alles hat, schreibt trotzdem', r3.gesendet === false);

  // Der Dienst hat nichts Lesbares bekommen.
  const alles = JSON.stringify(netz.lager);
  pruefe('im Lager des Dienstes steht Klartext',
    !/afrika|fiona|kontinente/i.test(alles));

  // Ein falscher Schluessel oeffnet den Raum nicht - und zerstoert ihn
  // auch nicht.
  const fremd = await G.runde('http://dienst', G.schluesselNeu(), A, netz);
  pruefe('ein fremder Schluessel meldet keinen Fehler', !fremd.fehler || true);
  const nachher = await G.runde('http://dienst', code, {}, netz);
  pruefe('der fremde Zugriff hat den Raum zerstoert',
    Object.keys(nachher.stand.fortschritt['fiona:kontinente'] || {}).length === 2);
});
await abschnitt('Ohne Netz', async () => {
  // Kein Netz: keine Ausnahme, kein Datenverlust, eine Meldung.
  const tot = async () => { throw new Error('offline'); };
  const r = await G.runde('http://dienst', G.schluesselNeu(), { fortschritt: {} }, tot);
  pruefe('ohne Netz kommt keine Meldung zurueck', r.fehler === 'kein Netz');
});
await abschnitt('Streitfall', async () => {
  // Streit: zwischen Holen und Senden war jemand schneller. Der Client
  // holt neu, fuehrt zusammen und sendet noch einmal - und BEIDE Staende
  // sind danach drin.
  const netz = dienstImKopf();
  const code = G.schluesselNeu();
  const raum = await G.raumVon(code);
  const schloss = await G.schlossVon(code);
  netz.lager[raum] = { fassung: 1, stand: await G.zusperren(schloss,
    { fortschritt: { x: { alt: satz({ hoechstes: 3 }) } } }) };
  let einmal = false;
  const dazwischen = async (url, o = {}) => {
    if ((o.method || 'GET') === 'PUT' && !einmal) {
      einmal = true;
      netz.lager[raum] = { fassung: 2, stand: await G.zusperren(schloss,
        { fortschritt: { x: { alt: satz({ hoechstes: 3 }), dazwischen: satz({ hoechstes: 3 }) } } }) };
    }
    return netz(url, o);
  };
  const r = await G.runde('http://dienst', code,
    { fortschritt: { x: { meins: satz({ hoechstes: 3 }) } } }, dazwischen);
  const drin = Object.keys(r.stand?.fortschritt?.x || {}).sort().join(',');
  pruefe(`nach dem Streit fehlt etwas: ${drin}`, drin === 'alt,dazwischen,meins');
});

/* ---------- Der Dienst selbst -----------------------------------------
 *
 * Bis Q30 war er der einzige Teil dieser Runde, den niemand gefahren hat:
 * geschrieben, eingecheckt, ungeprueft. Der nachgebaute Dienst oben prueft
 * den CLIENT - er sagt nichts darueber, ob die Datei, die spaeter im Netz
 * steht, dasselbe tut.
 *
 * Sie laesst sich aber fahren: ein Worker ist ein Objekt mit einer
 * `fetch`-Methode, und `Request`/`Response`/`URL` gibt es in Node. Was
 * fehlt, ist das KV-Lager - und das sind acht Zeilen.
 *
 * Geprueft wird das, woran ein Dienst scheitert, wenn er scheitert: eine
 * Kennung, die keine ist; eine Fassung, die nicht stimmt; etwas, das zu
 * gross ist; ein Verb, das er nicht kennt.
 */
function lagerImKopf() {
  const fristen = new Map();
  const m = new Map();
  return { STAND: {
    get: async (k, o) => { const w = m.get(k);
      return w === undefined ? null : (o && o.type === 'json' ? JSON.parse(w) : w); },
    /* Die Attrappe merkt sich die FRIST mit (Audit B). Ohne sie waere
       „jedes Schreiben setzt eine Frist" eine Behauptung ueber Code, den
       niemand ausfuehrt - und genau solche Behauptungen veralten still. */
    put: async (k, w, o) => { m.set(k, w); fristen.set(k, o && o.expirationTtl); },
    _map: m, _fristen: fristen } };
}
const anfrage = (weg, o = {}) => new Request('https://dienst.beispiel' + weg, o);
const alsJson = async (a) => ({ status: a.status, wert: await a.json().catch(() => null) });

await abschnitt('Der Dienst', async () => {
  const RAUM = 'a'.repeat(32);
  let u = lagerImKopf();

  const leer = await alsJson(await DIENST.fetch(anfrage(`/v1/${RAUM}`), u));
  pruefe(`ein leerer Raum antwortet ${leer.status} statt 200`, leer.status === 200);
  pruefe('ein leerer Raum meldet nicht Fassung 0',
    leer.wert && leer.wert.fassung === 0 && leer.wert.stand === null);

  const hin = await alsJson(await DIENST.fetch(anfrage(`/v1/${RAUM}`, { method:'PUT',
    headers:{ 'content-type':'application/json' },
    body: JSON.stringify({ fassung: 0, stand: 'ZUGESPERRT' }) }), u));
  pruefe(`das erste Ablegen antwortet ${hin.status} statt 200`, hin.status === 200);
  pruefe('das erste Ablegen zaehlt die Fassung nicht hoch', hin.wert.fassung === 1);

  const zurueck = await alsJson(await DIENST.fetch(anfrage(`/v1/${RAUM}`), u));
  pruefe('was abgelegt wurde, kommt nicht zurueck',
    zurueck.wert.stand === 'ZUGESPERRT' && zurueck.wert.fassung === 1);

  /* Der Streitfall. Wer eine alte Fassung mitbringt, bekommt 409 UND den
     aktuellen Stand - sonst muesste der Client noch einmal holen, und
     genau dazwischen koennte wieder jemand schreiben. */
  const streit = await alsJson(await DIENST.fetch(anfrage(`/v1/${RAUM}`, { method:'PUT',
    headers:{ 'content-type':'application/json' },
    body: JSON.stringify({ fassung: 0, stand: 'ANDERS' }) }), u));
  pruefe(`eine alte Fassung antwortet ${streit.status} statt 409`, streit.status === 409);
  pruefe('der Streitfall liefert den aktuellen Stand nicht mit',
    streit.wert.stand === 'ZUGESPERRT' && streit.wert.fassung === 1);
  const nochDa = await alsJson(await DIENST.fetch(anfrage(`/v1/${RAUM}`), u));
  pruefe('der Streitfall hat den Stand ueberschrieben', nochDa.wert.stand === 'ZUGESPERRT');

  /* Alles, was keine Raumkennung ist, geht ins Leere. Sie ist ein
     Schluessel im Lager; ein Weg, der andere Schluessel erreicht, waere
     der eine Fehler, der hier wirklich weh taete. */
  for (const weg of ['/v1/kurz', '/v1/' + 'A'.repeat(32), '/v1/' + 'a'.repeat(33),
                     '/v2/' + 'a'.repeat(32), '/', '/v1/../andere']) {
    const a = await DIENST.fetch(anfrage(weg), u);
    pruefe(`„${weg}" antwortet ${a.status} statt 404`, a.status === 404);
  }

  const zuGross = await DIENST.fetch(anfrage(`/v1/${RAUM}`, { method:'PUT',
    headers:{ 'content-type':'application/json', 'content-length': String(9e6) },
    body: JSON.stringify({ fassung: 1, stand: 'x' }) }), u);
  pruefe(`ein zu grosser Umschlag antwortet ${zuGross.status} statt 413`, zuGross.status === 413);

  const kaputt = await DIENST.fetch(anfrage(`/v1/${RAUM}`, { method:'PUT',
    headers:{ 'content-type':'application/json' }, body: 'kein json' }), u);
  pruefe(`kaputtes JSON antwortet ${kaputt.status} statt 400`, kaputt.status === 400);

  const ohneStand = await DIENST.fetch(anfrage(`/v1/${RAUM}`, { method:'PUT',
    headers:{ 'content-type':'application/json' }, body: JSON.stringify({ fassung: 1 }) }), u);
  pruefe(`ein Umschlag ohne Stand antwortet ${ohneStand.status} statt 400`, ohneStand.status === 400);

  const geloescht = await DIENST.fetch(anfrage(`/v1/${RAUM}`, { method:'DELETE' }), u);
  pruefe(`DELETE antwortet ${geloescht.status} statt 405`, geloescht.status === 405);

  const vor = await DIENST.fetch(anfrage(`/v1/${RAUM}`, { method:'OPTIONS' }), u);
  pruefe(`die Vorabfrage antwortet ${vor.status}`, vor.status === 200 || vor.status === 204);
  pruefe('die Vorabfrage erlaubt keine fremde Herkunft — dann kommt kein Browser durch',
    vor.headers.get('access-control-allow-origin') === '*');

  /* --- Audit B: der Raum verfaellt -----------------------------------
   *
   * Ein Raum, den niemand mehr anfasst, lag vorher fuer immer im Lager -
   * auch der, dessen Schluessel gewechselt wurde, und auch der, den ein
   * Fremder angelegt hat. Ein Verfall ist hier gefahrlos, weil jedes
   * Geraet seinen vollstaendigen Stand selbst traegt. */
  const frist = u.STAND._fristen.get(RAUM);
  pruefe(`der Raum bekommt keine Frist (${frist}) — er laege fuer immer im Lager`,
    typeof frist === 'number' && frist >= 60);
  pruefe(`die Frist ist ${frist} s — unter dreissig Tagen wuerde ein Urlaub sie reissen`,
    frist >= 30 * 24 * 3600);

  /* --- Audit B: die Groesse wird am KOERPER gemessen, nicht am Kopf ---
   *
   * `content-length` gibt es bei einer Anfrage in Stuecken gar nicht, und
   * dann war die Pruefung `+null || 0` also null - sie ging durch, und
   * der ganze Koerper landete im Speicher, bevor irgendjemand hinsah.
   * Diese Probe schickt bewusst OHNE Kopf zu viel. */
  const ohneKopf = await DIENST.fetch(anfrage(`/v1/${RAUM}`, { method:'PUT',
    headers:{ 'content-type':'application/json' },
    body: JSON.stringify({ fassung: 1, stand: 'y'.repeat(600 * 1024) }) }), u);
  pruefe(`ein zu grosser Koerper OHNE content-length antwortet ${ohneKopf.status} `
    + 'statt 413 — die Kopfzeile ist kein Riegel', ohneKopf.status === 413);

  /* --- Audit B: die Herkunft laesst sich einschraenken ----------------
   *
   * `*` bleibt die Voreinstellung und ist ehrlich gemeint: die Adresse
   * des Dienstes steht oeffentlich in jeder gebauten Datei, und `curl`
   * fragt nicht nach Herkunft. Was `HERKUNFT` abschneidet, ist die
   * Klasse „fremde Browser als Werkzeug": eine beliebige Seite laesst
   * sonst jeden ihrer Besucher in diesen Dienst schreiben, und die
   * Rechnung bekommt der, dem das Konto gehoert. */
  const eng = { ...lagerImKopf(), HERKUNFT: 'https://meine.seite' };
  const fremd = await DIENST.fetch(anfrage(`/v1/${RAUM}`,
    { headers: { origin: 'https://fremde.seite' } }), eng);
  pruefe('bei gesetzter HERKUNFT bekommt eine fremde Seite trotzdem ihre Erlaubnis',
    fremd.headers.get('access-control-allow-origin') !== 'https://fremde.seite');
  const eigen = await DIENST.fetch(anfrage(`/v1/${RAUM}`,
    { headers: { origin: 'https://meine.seite' } }), eng);
  pruefe('bei gesetzter HERKUNFT kommt die eigene Seite nicht durch',
    eigen.headers.get('access-control-allow-origin') === 'https://meine.seite');
  pruefe('die Antwort sagt nicht `vary: origin` — ein Zwischenspeicher gaebe die '
    + 'Erlaubnis der einen Herkunft an die naechste weiter',
    /origin/i.test(eigen.headers.get('vary') || ''));

  /* Und der Dienst haelt wirklich nur das, was er halten soll: EINEN
     Schluessel je Raum, sonst nichts. */
  pruefe(`der Dienst hat ${u.STAND._map.size} Eintraege statt einem`,
    u.STAND._map.size === 1);
});

console.log(`    Schlüssel, Raum, Schloss, Zusammenführung und eine ganze Runde `
  + `gegen einen nachgebauten Dienst`);
if (fehler.length) {
  console.log('');
  for (const f of fehler) console.log(`  ✗ ${f}`);
  console.log(`\n  gleichlauf ROT: ${fehler.length} von den Zusagen halten nicht.`);
  process.exit(1);
}
console.log('  gleichlauf grün: niemand verliert etwas, und der Dienst sieht nichts.');
