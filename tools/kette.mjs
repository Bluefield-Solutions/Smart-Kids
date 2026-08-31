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
 * Deshalb dieser Schalter: er faehrt NUR die beiden billigsten
 * Browsertore, und zwar nebeneinander im selben Becken wie sonst. Die
 * Gegenprobe macht `pwa` rot und erwartet, dass die Kette rot wird,
 * obwohl `lesbarkeit` daneben gruen bleibt.
 *
 * Er nimmt bewusst KEINE Liste entgegen. Ein Schalter, mit dem man sich
 * Tore aussuchen kann, ist eine Art, die Kette still abzuschalten
 * (Regel 9); dieser kann nur das eine, wofuer er da ist, und sagt es in
 * jedem Lauf laut dazu. Die Auslieferung setzt ihn nirgends.
 */
const PROBE = process.env.SMARTKIDS_KETTE_PROBE === '1';

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
    + '  Nur `pwa` und `lesbarkeit`, nur für die Gegenprobe. Kein grüner Lauf.\n'
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
 * SECHS, gemessen an der vollen Kette auf demselben Rechner am selben Tag
 * (vier Kerne), nach P2 und P3:
 *
 *     Becken 3   209,5 s
 *     Becken 4   171,3 s
 *     Becken 5   151,0 s
 *     Becken 6   130,3 s   <- hier
 *     Becken 8   133,1 s
 *
 * In P1 stand hier DREI, und das war damals richtig: `smoke` brauchte am
 * Stueck 295 s und war der Boden, unter den kein Becken kam - Becken 3 und
 * 4 lagen auf 0,7 s gleichauf. Seit `smoke` in drei Teile zerfaellt und
 * `passt` nicht mehr blind wartet, ist die Kette nicht mehr durch EINEN
 * langen Lauf begrenzt, sondern durch den Durchsatz. Damit zaehlt jedes
 * weitere Band. Eine gemessene Zahl gilt fuer den Tag, an dem sie
 * gemessen wurde, und ihre Voraussetzungen gehoeren dazu.
 *
 * Mehr Baender als Kerne, und es hilft trotzdem: diese Tore RECHNEN kaum,
 * sie warten - auf einen Bildschirmwechsel, auf einen Selektor, auf den
 * eigenen Server. Ab acht kippt es, dort war es wieder langsamer.
 *
 * Der Boden ist jetzt `passt` mit rund 112 s allein. Wer weiter will,
 * teilt es nach Groessen auf - sieben, die nichts voneinander wissen.
 *
 * Laengstes zuerst: sonst startet der laengste Lauf als letzter, und alle
 * anderen Baender stehen still, waehrend er laeuft. */
/* Auf dem Runner sind es zwei Kerne, nicht vier (`ubuntu-latest`).
 *
 * Die sechs oben sind auf VIER Kernen gemessen; was auf zweien richtig
 * waere, ist hier nicht zu messen. Deshalb wird nicht die Zahl uebernommen,
 * sondern ihr Verhaeltnis: anderthalb Baender je Kern, hoechstens sechs.
 * Auf vier Kernen kommt genau die gemessene Sechs heraus, auf zweien drei.
 * Das ist eine Schaetzung und als solche gekennzeichnet - die Laufzeit des
 * Runners sagt, ob sie stimmt. */
const KERNE = os.cpus().length;
const BREITE = +(process.env.SMARTKIDS_BECKEN
  || Math.max(2, Math.min(6, Math.round(KERNE * 1.5))));

const arbeit = [];
for (const t of (PROBE ? MIT_BROWSER.filter(t => t.name === 'pwa' || t.name === 'lesbarkeit')
                       : MIT_BROWSER)) {
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
