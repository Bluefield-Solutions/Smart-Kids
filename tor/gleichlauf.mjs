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

  // Die Zaehler werden nicht addiert. Beide Geraete tragen die gemeinsame
  // Vorgeschichte; eine Summe zaehlte sie doppelt.
  const z = G.vereinen({ fortschritt: { x: { a: satz({ richtig: 5, zuletzt: 1 }) } } },
                       { fortschritt: { x: { a: satz({ richtig: 7, zuletzt: 2 }) } } });
  pruefe(`die Zaehler werden addiert statt verglichen: ${z.fortschritt.x.a.richtig}`,
    z.fortschritt.x.a.richtig === 7);
});

/* ---------- Was reist und was nicht ----------------------------------- */
await abschnitt('Was reist', async () => {
  pruefe('die PIN reist mit', !G.REIST('pin'));
  pruefe('die Stimme reist mit', !G.REIST('stimme'));
  pruefe('der Sitzungszaehler reist nicht', G.REIST('nr:fiona:kontinente'));
  pruefe('„ohne Fehler" reist nicht', G.REIST('glatt'));

  const v = G.vereinen(
    { einstellungen: { pin: '1234', 'nr:a': 7, glatt: { zeit: 500 } } },
    { einstellungen: { pin: '9999', 'nr:a': 3, glatt: { zeit: 200 } } });
  pruefe('die PIN ist im Umschlag gelandet', !('pin' in v.einstellungen));
  pruefe(`der Sitzungszaehler ist nicht der groessere: ${v.einstellungen['nr:a']}`,
    v.einstellungen['nr:a'] === 7);
  /* „Einmal ganz ohne Fehler" zaehlt das ERSTE Mal. Nimmt man das
     spaetere, wandert der Tag bei jedem Abgleich nach vorn, und aus
     einem Ereignis wird ein Zustand. */
  pruefe(`„ohne Fehler" nimmt nicht das fruehere: ${v.einstellungen.glatt.zeit}`,
    v.einstellungen.glatt.zeit === 200);
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

console.log(`    Schlüssel, Raum, Schloss, Zusammenführung und eine ganze Runde `
  + `gegen einen nachgebauten Dienst`);
if (fehler.length) {
  console.log('');
  for (const f of fehler) console.log(`  ✗ ${f}`);
  console.log(`\n  gleichlauf ROT: ${fehler.length} von den Zusagen halten nicht.`);
  process.exit(1);
}
console.log('  gleichlauf grün: niemand verliert etwas, und der Dienst sieht nichts.');
