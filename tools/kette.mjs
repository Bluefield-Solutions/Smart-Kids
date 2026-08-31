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
const KERNE = os.cpus().length;
const BREITE = +(process.env.SMARTKIDS_BECKEN
  || Math.max(2, Math.min(10, Math.round(KERNE * 2.5))));

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

console.log('');
if (befunde.length) {
  for (const b of befunde) {
    console.log(`  ${rot('✗')} ${b.name}:`);
    console.log(b.aus.split('\n').filter(z => /✗|FEHLER|ROT|Timeout/.test(z))
      .slice(0, 10).map(z => '      ' + z.trim()).join('\n')
      || b.aus.split('\n').slice(-10).map(z => '      ' + z.trimEnd()).join('\n'));
  }
  console.log(`\n  Kette ROT nach ${s(Date.now() - t0)} — `
    + `${befunde.length} von `
    + `${(PROBE ? 1 : OHNE_BROWSER.length + 1 + NACH_DEM_BAU.length) + arbeit.length} `
    + 'Läufen.\n');
  process.exit(1);
}
console.log(`  Kette grün nach ${s(Date.now() - t0)}.\n`);
