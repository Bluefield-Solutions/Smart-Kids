// Die volle Torkette — `npm run tor`.
//
// Was sich gegenueber der `&&`-Zeile aendert, und warum:
//
//   1. Die sechs Browsertore laufen NEBENEINANDER. Jedes faehrt seinen
//      eigenen Chromium auf einem eigenen Zufallsport (`serviere` bindet
//      auf 0) und schreibt in keine Datei, die ein anderes liest -
//      nachgesehen, nicht angenommen. Nacheinander waren sie 625 s.
//   2. Ein rotes Tor beendet den Lauf nicht mehr. Vorher sah man beim
//      ersten Rot keines der spaeteren; jetzt steht am Ende, was ALLES
//      rot ist. Fuer dieselbe Wanduhrzeit.
//
// Was sich NICHT aendert: die billigen Tore laufen weiter zuerst und
// weiter mit Abbruch beim ersten Rot. Ein Tippfehler im Inhalt soll keine
// fuenf Browserminuten kosten.
//
// Die Liste steht in `tor/kette-liste.mjs`, nicht hier - `tor/inhalt.mjs`
// liest sie ebenfalls, wenn es die Kette gegen CLAUDE.md haelt (Regel 6).
import os from 'node:os';
import { OHNE_BROWSER, BAU, NACH_DEM_BAU, MIT_BROWSER } from '../tor/kette-liste.mjs';
import { mitZeit, s, rot, gruen, grau } from './laeufer.mjs';

/* Die kurze Kette fuer die Gegenprobe.
 *
 * Ein Becken, das ein rotes Tor verschluckt, ist genau der Fehler, den es
 * hier zu fangen gilt: mit `&&` war die Weitergabe des Rueckgabewerts die
 * Sache der Shell, jetzt ist sie meine. Eine Gegenprobe dafuer muesste
 * `npm run tor` fahren - fuenf Minuten je Probe, das faehrt niemand.
 *
 * Deshalb dieser Schalter: er faehrt NUR die drei billigsten Browsertore,
 * und zwar nebeneinander im selben Becken wie sonst. Die Gegenprobe macht
 * `pwa` rot und erwartet, dass die Kette rot wird, obwohl `lesbarkeit`
 * daneben gruen bleibt.
 *
 * `ansicht` ist seit P4 dabei, und der Schalter setzt dafuer selbst
 * `SMARTKIDS_OHNE_ANSICHT` - dann kosten seine drei Teile eine halbe
 * Sekunde statt fuenfundsiebzig. Damit ist auch die Nachzaehlung geprobt,
 * die in P2 noch als ungedeckt aufgeschrieben war: eine Gegenprobe nimmt
 * das Wort ÜBERSPRUNGEN aus seiner Meldung, und die Kette muss melden,
 * dass kein Teillauf mehr seine Zahl nennt.
 *
 * Er nimmt bewusst KEINE Liste entgegen. Ein Schalter, mit dem man sich
 * Tore aussuchen kann, ist eine Art, die Kette still abzuschalten
 * (Regel 9); dieser kann nur das eine, wofuer er da ist, und sagt es in
 * jedem Lauf laut dazu. Die Auslieferung setzt ihn nirgends.
 */
const PROBE = process.env.SMARTKIDS_KETTE_PROBE === '1';
if (PROBE) process.env.SMARTKIDS_OHNE_ANSICHT = '1';

const t0 = Date.now();
const befunde = [];
const melde = ({ name, code, aus, ms }) => {
  console.log(`    ${code === 0 ? gruen('grün') : rot('ROT ')}  ${name.padEnd(24)} ${s(ms)}`);
  if (code !== 0) befunde.push({ name, aus });
};

const abbruch = (r) => {
  melde(r);
  console.log('\n' + r.aus.split('\n').slice(-18).join('\n'));
  console.log(`\n  Kette ROT nach ${s(Date.now() - t0)} — `
    + 'die billigen Tore brechen ab, damit kein Browser umsonst läuft.\n');
  process.exit(1);
};

console.log(PROBE
  ? `\n  ${rot('Torkette — KURZE Fassung (SMARTKIDS_KETTE_PROBE=1)')}\n`
    + '  Nur `pwa`, `lesbarkeit` und `ansicht` (übersprungen), nur für die '
    + 'Gegenprobe. Kein grüner Lauf.\n'
  : '\n  Torkette — die volle Runde\n');

// 1. Ohne Browser. Beim ersten Rot ist Schluss.
for (const t of (PROBE ? [] : OHNE_BROWSER)) {
  const r = await mitZeit(t.name, t.datei);
  if (r.code !== 0) abbruch(r);
  melde(r);
}

// 2. Bauen. Ohne dist/ hat kein Browsertor etwas zu pruefen.
{
  let ms = 0, letzte = null;
  for (const d of BAU.dateien) {
    const r = await mitZeit(BAU.name, d); ms += r.ms; letzte = r;
    if (r.code !== 0) abbruch({ ...r, name: `${BAU.name} (${d})`, ms });
  }
  melde({ ...letzte, name: BAU.name, ms });
}
for (const t of (PROBE ? [] : NACH_DEM_BAU)) {
  const r = await mitZeit(t.name, t.datei);
  if (r.code !== 0) abbruch(r);
  melde(r);
}

/* 3. Die Browsertore nebeneinander, in einem Becken fester Breite.
 *
 * Vier Kerne, sechs Tore, eines davon dreigeteilt - ohne Becken liefen
 * acht Chromium gleichzeitig, und jeder waere langsamer als die Summe
 * spart.
 *
 * ZEHN, gemessen an der vollen Kette auf demselben Rechner am selben Tag
 * (vier Kerne), nach P5 - also mit dreizehn Browserlaeufen:
 *
 *     Becken  6   126,3 s
 *     Becken  8   109,5 · 109,5 · 110,9 s
 *     Becken 10    97,8 · 100,1 · 101,2 s   <- hier
 *     Becken 12   109,9 s
 *     Becken 16   107,4 s
 *
 * Die Werte fuer 8 und 10 sind je dreimal gemessen: der Unterschied ist
 * reproduzierbar und kein Rauschen (Streuung unter 3 s je Einstellung).
 *
 * Diese Zahl hat sich jetzt dreimal geaendert, und jedes Mal war die alte
 * richtig gemessen und trotzdem falsch geworden:
 *
 *   P1  DREI. `smoke` brauchte am Stueck 295 s und war der Boden, unter
 *       den kein Becken kam; 3 und 4 lagen auf 0,7 s gleichauf.
 *   P3  SECHS. `smoke` zerfiel in drei Teile, `passt` wartete nicht mehr
 *       blind - nicht mehr EIN langer Lauf begrenzte, sondern der
 *       Durchsatz. „Ab acht kippt es" galt fuer die damaligen ZEHN Laeufe.
 *   P5  ZEHN. Dreizehn kleinere Laeufe, und acht kippt nicht mehr.
 *
 * Eine gemessene Zahl gilt fuer den Tag, an dem sie gemessen wurde - und
 * ihre Voraussetzungen gehoeren dazu. Hier ist die Voraussetzung die
 * ZUSAMMENSETZUNG der Kette, und die aendert sich mit jedem Umbau.
 *
 * Mehr als doppelt so viele Baender wie Kerne, und es hilft trotzdem:
 * diese Tore RECHNEN kaum, sie warten - auf einen Bildschirmwechsel, auf
 * einen Selektor, auf den eigenen Server.
 *
 * Laengstes zuerst: sonst startet der laengste Lauf als letzter, und alle
 * anderen Baender stehen still, waehrend er laeuft. */
/* Anderthalb Baender je Kern, hoechstens sechs.
 *
 * Hier stand „auf dem Runner sind es zwei Kerne, nicht vier" und daraus
 * abgeleitet, die Formel sei fuer ihn eine SCHAETZUNG. Beides war falsch:
 * `ubuntu-latest` hat vier Kerne. Der Runner schreibt es seit P1 in jeden
 * Lauf („10 Browserlaeufe, 6 nebeneinander (4 Kerne)"), ich habe es nur
 * nicht gelesen. Nachgesehen (P4):
 *
 *     Lauf 78 (Becken 3)   303 s fuer den Kettenschritt
 *     Lauf 79 (Becken 6)   130 s
 *
 * Also dieselben vier Kerne, dieselbe Sechs, und dieselbe Zeit wie hier
 * (308 s bzw. 130 s). Die Formel bleibt trotzdem eine Formel und keine
 * feste Sechs: sie soll auch stimmen, wenn der Runner sich aendert oder
 * jemand das Verzeichnis auf einer kleineren Maschine faehrt. Nur ist sie
 * fuer den heutigen Runner keine Schaetzung mehr, sondern gemessen. */
/* Und seit Q24: ZWEI Baender je Kern, nicht zweieinhalb.
 *
 * Die Zehn oben ist richtig gemessen und trotzdem falsch geworden - zum
 * vierten Mal, und wieder aus dem Grund, der dort schon steht: ihre
 * VORAUSSETZUNG hat sich geaendert. Sie lautete „diese Tore rechnen kaum,
 * sie warten". Seit Q19 stimmt das nicht mehr: der Fremdgriff laeuft in
 * jeder Seite mit und rechnet dort.
 *
 * Gemessen am selben Tag, dieselbe Kette:
 *
 *     Becken 10   dreimal ROT - dreimal ein ANDERER Zeitfehler
 *                 (`waitForFunction: Timeout 4000ms`, ein Zug, der nicht
 *                 ankam), und der Lastschnitt bei 11 auf vier Kernen
 *     Becken  8   186,6 s, gruen
 *     Becken  6   194,5 s, gruen
 *
 * Und derselbe Teil, der in der Kette scheiterte, lief ALLEIN in 94 s
 * durch. Drei verschiedene Fehler aus derselben Ursache sind kein
 * Flackern, sondern ein Befund: die Kette hat sich selbst ausgebremst.
 *
 * Die Zahlen sind je EINMAL gemessen, nicht dreimal wie oben - die
 * Maschine war an diesem Tag erkennbar langsamer als damals (dieselbe
 * Kette bei Becken 10: einmal 135 s, einmal 231 s). Fuer einen Vergleich
 * der Bestzeiten taugt das nicht; fuer die Frage „ab wann kippt es"
 * genuegt es, und die ist hier die wichtigere. */
/* Nachgemessen in Q27 - dreimal je Einstellung, ruhige Maschine, vier
 * Kerne, dieselbe Kette hintereinander weg:
 *
 *     Becken  6   159 · 157 · 155 s   Mittelwert 157   alle gruen
 *     Becken  8   135 · 133 · 134 s   Mittelwert 134   alle gruen
 *     Becken 10   136 · 135 · 131 s   Mittelwert 134   alle gruen
 *
 * Drei Dinge stehen damit fest, die vorher nur eine Vermutung waren.
 *
 * ERSTENS streut die Kette kaum: hoechstens 5 s Spanne je Einstellung,
 * also unter 4 %. Ein Unterschied von 23 s zwischen 6 und 8 ist damit
 * einer und kein Rauschen - anders als die 8 s zwischen 186,6 und 194,5
 * oben, die aus je einer Messung stammen und nichts beweisen.
 *
 * ZWEITENS ist bei 8 der Boden erreicht. Zehn Baender bringen einen
 * Wimpernschlag (134 gegen 134) - die Kette wartet dann nicht mehr auf
 * Baender, sondern auf ihren laengsten Einzellauf.
 *
 * DRITTENS, und das ist der unbequeme Teil: Becken 10 lief hier DREIMAL
 * gruen, waehrend es in Q24 dreimal rot war. Das heisst nicht, dass zehn
 * doch geht. Es heisst, dass der Kipppunkt sich nicht auf Verlangen
 * zeigt - und genau deshalb bleibt es bei acht: die Ersparnis waere eine
 * Sekunde, der Einsatz ein Lauf, der an einem anderen Tag umkippt und
 * dann wie ein Fehler im Spiel aussieht.
 *
 * Die Formel bleibt also stehen, jetzt aber mit einem Beleg statt mit
 * einer Erinnerung. Gemessen mit `SMARTKIDS_BECKEN=<n> npm run tor`. */
const KERNE = os.cpus().length;
const BREITE = +(process.env.SMARTKIDS_BECKEN
  || Math.max(2, Math.min(8, KERNE * 2)));

const arbeit = [];
const KURZ = ['pwa', 'lesbarkeit', 'ansicht'];
for (const t of (PROBE ? MIT_BROWSER.filter(t => KURZ.includes(t.name)) : MIT_BROWSER)) {
  if (!t.teile) { arbeit.push({ name: t.name, datei: t.datei, args: [], ms: t.ms }); continue; }
  for (let i = 0; i < t.teile; i++)
    arbeit.push({ name: `${t.name} (${i + 1}/${t.teile})`, datei: t.datei,
      args: [`--teil=${i}/${t.teile}`], ms: t.ms / t.teile });
}
arbeit.sort((a, b) => b.ms - a.ms);

console.log(grau(`\n    ${arbeit.length} Browserläufe, ${BREITE} nebeneinander `
  + `(${KERNE} Kerne) — längster zuerst\n`));

const a3 = Date.now();
const ergebnisse = [];
{
  let naechste = 0;
  const schluck = async () => {
    while (naechste < arbeit.length) {
      const w = arbeit[naechste++];
      ergebnisse.push(await mitZeit(w.name, w.datei, w.args));
    }
  };
  await Promise.all([...Array(Math.min(BREITE, arbeit.length))].map(schluck));
}
// In der Reihenfolge der Liste melden, nicht in der des Zieleinlaufs -
// sonst steht in jedem Lauf etwas anderes da, und man sieht keinen
// Unterschied mehr zum vorigen.
for (const w of arbeit) melde(ergebnisse.find(e => e.name === w.name));

const summe = ergebnisse.reduce((n, e) => n + e.ms, 0);
console.log(`    ${''.padEnd(6)}${'nebeneinander'.padEnd(24)} ${s(Date.now() - a3)} statt `
  + `${s(summe)} nacheinander`);

/* Die Teile eines geteilten Tores muessen ZUSAMMEN alles abdecken.
 *
 * Ein Teillauf, der die Haelfte vergisst, meldet „gruen" - und niemand
 * sieht, worueber. Eine Aufteilung ist die bequemste Gelegenheit, still
 * etwas abzuschalten: eine Pruefung, die nie etwas meldet, ist kein
 * Beweis (Regel 1).
 *
 * WIE gezaehlt wird, sagt `deckung` in der Liste, nicht diese Datei -
 * sonst muesste hier stehen, welches Tor sich wie teilt, und das stuende
 * dann zweimal da (Regel 6).
 *
 *   'namen'  Mengenvergleich an der Zeile `TEILE i/n: a|b  VON: a|b|c`,
 *            die das Tor selbst schreibt. Faengt auch den Fall, dass zwei
 *            Teile dasselbe fahren und ein dritter nichts. Getrennt mit
 *            `|`: „iPhone quer, Leiste" hat ein Komma im Namen.
 *   'zahl'   „N von M" addieren. Reicht, wo streng nach Index geteilt
 *            wird.
 *
 * Sagt kein Teil etwas dazu, ist das ein Fehler und kein Grund
 * durchzuwinken: dann hat die Zeile ihren Namen geaendert, und die
 * Nachzaehlung haette seither nichts mehr gemeldet. */
for (const t of MIT_BROWSER.filter(x => x.teile)) {
  const teile = ergebnisse.filter(e => e.name.startsWith(`${t.name} (`));
  if (!teile.length) continue;
  /* Ein Tor, das sich AUSDRUECKLICH uebersprungen hat, ist etwas anderes
   * als eines, das nichts gesagt hat.
   *
   * `ansicht` laeuft auf dem Runner nicht (`SMARTKIDS_OHNE_ANSICHT=1`) -
   * Bildpunktvergleiche gelten nur bei gleicher Zeichenumgebung. Es sagt
   * das laut, mit dem Wort ÜBERSPRUNGEN, und genau daran wird es erkannt:
   * nicht am Fehlen einer Zeile, denn „hat nichts gesagt" ist der Fall,
   * den die Nachzaehlung fangen soll.
   *
   * Gefunden hat das der Runner selbst, im ersten Lauf nach P4: die
   * Nachzaehlung war vorher nachsichtig (`if (soll && ...)`) und hat den
   * Fall stillschweigend uebergangen. Streng gemacht, meldete sie ihn -
   * zu Recht als Frage, zu Unrecht als Fehler. */
  if (teile.every(e => /ÜBERSPRUNGEN/.test(e.aus))) {
    console.log(`    ${''.padEnd(6)}${`${t.name}: übersprungen`.padEnd(24)} `
      + `${teile.length} Teile, ausdrücklich`);
    continue;
  }
  if (t.deckung === 'namen') {
    const gefahren = new Set(), alle = new Set();
    for (const e of teile) {
      const m = e.aus.match(/TEILE \d+\/\d+: ([^\n]*?)\s\sVON: ([^\n]*)/);
      if (!m) continue;
      for (const x of m[1].split('|').filter(Boolean)) gefahren.add(x.trim());
      for (const x of m[2].split('|').filter(Boolean)) alle.add(x.trim());
    }
    if (!alle.size) {
      console.log(`\n  ${rot('✗')} ${t.name}: kein Teillauf nennt seinen Anteil `
        + '(Zeile „TEILE i/n: … VON: …") — die Nachzählung prüft nichts mehr.');
      process.exit(1);
    }
    const fehlt = [...alle].filter(x => !gefahren.has(x));
    if (fehlt.length) {
      console.log(`\n  ${rot('✗')} ${t.name}: ${fehlt.length} hat kein Teil gefahren — `
        + fehlt.join(', '));
      process.exit(1);
    }
    console.log(`    ${''.padEnd(6)}${`${t.name}: gefahren`.padEnd(24)} `
      + `${gefahren.size} von ${alle.size}`);
  } else {
    const gezaehlt = teile.map(e => (e.aus.match(/(\d+) grün, (\d+) neu, (\d+) rot/) || [])
      .slice(1, 4).reduce((n, z) => n + (+z || 0), 0)).reduce((n, z) => n + z, 0);
    const soll = +((teile[0]?.aus.match(/der (\d+) Aufnahmen/) || [])[1] || 0);
    if (!soll) {
      console.log(`\n  ${rot('✗')} ${t.name}: kein Teillauf nennt seine Zahl `
        + '(„der N Aufnahmen") — die Nachzählung prüft nichts mehr.');
      process.exit(1);
    }
    if (gezaehlt !== soll) {
      console.log(`\n  ${rot('✗')} ${t.name}: ${gezaehlt} von ${soll} geprüft — `
        + 'die Teile decken zusammen nicht alles ab.');
      process.exit(1);
    }
    console.log(`    ${''.padEnd(6)}${`${t.name}: geprüft`.padEnd(24)} ${gezaehlt} von ${soll}`);
  }
}

/* Was aus dem Lauf eines roten Tores in die Kettenmeldung kommt.
 *
 * Bis Q14 stand hier ein Filter auf `✗|FEHLER|ROT|Timeout` und ein
 * Deckel bei zehn Zeilen. Auf dem eigenen Rechner faellt das nicht auf -
 * man ruft das Tor einfach noch einmal einzeln auf. Auf dem RUNNER geht
 * das nicht, und dort war die Meldung wertlos:
 *
 *     ROT   iPad quer  1180×820 — 1 nicht erreichbar
 *     3 FEHLER: Elemente laufen über den Rand.
 *
 * WELCHES Element, ueber welchen Rand, um wieviel - all das steht in den
 * eingerueckten Zeilen DIREKT unter der ROT-Zeile, und genau die hat der
 * Filter weggeworfen. Achtzehn Auslieferungen sind nacheinander rot
 * gewesen, und aus keinem Protokoll war zu lesen, woran.
 *
 * Jetzt gilt: eine Zeile mit Befundwort kommt mit, und wenn sie eine
 * ROT-Zeile ist, auch alles, was tiefer eingerueckt darunter folgt. */
function wichtigeZeilen(aus, deckel = 60) {
  const raus = [];
  let inDetail = false, tiefeDerRot = 0;
  for (const z of aus.split('\n')) {
    if (raus.length >= deckel) break;
    const tiefe = z.length - z.trimStart().length;
    if (/✗|FEHLER|ROT|Timeout/.test(z)) {
      raus.push(z); inDetail = /ROT/.test(z); tiefeDerRot = tiefe; continue;
    }
    if (!z.trim()) { inDetail = false; continue; }
    if (inDetail && tiefe > tiefeDerRot) { raus.push(z); continue; }
    inDetail = false;
  }
  return raus;
}

console.log('');
if (befunde.length) {
  for (const b of befunde) {
    console.log(`  ${rot('✗')} ${b.name}:`);
    console.log(wichtigeZeilen(b.aus).map(z => '      ' + z.trimEnd()).join('\n')
      || b.aus.split('\n').slice(-10).map(z => '      ' + z.trimEnd()).join('\n'));
  }
  console.log(`\n  Kette ROT nach ${s(Date.now() - t0)} — `
    + `${befunde.length} von `
    + `${(PROBE ? 1 : OHNE_BROWSER.length + 1 + NACH_DEM_BAU.length) + arbeit.length} `
    + 'Läufen.\n');
  process.exit(1);
}
console.log(`  Kette grün nach ${s(Date.now() - t0)}.\n`);
