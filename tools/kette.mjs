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

/* Die Teile von `smoke` muessen ZUSAMMEN alle Abschnitte fahren.
 *
 * Geprueft wird die MENGE, nicht die Anzahl: zwei Teile, die beide
 * `durchgang` fahren und `schreiben` keiner, kaemen sonst auf vierzehn
 * und niemand saehe es. Die Namen stehen in der Ausgabe des Teillaufs
 * selbst - beide Seiten, „was ich fahre" und „was es gibt" -, damit die
 * Liste der Abschnitte nicht zweimal dasteht und eine der beiden
 * veraltet (Regel 6).
 *
 * Sagt KEIN Teil etwas dazu, ist das ein Fehler und kein Grund
 * durchzuwinken: dann hat die Zeile ihren Namen geaendert, und diese
 * Nachzaehlung prueft seit dem Tag nichts mehr (Regel 1). */
{
  const teile = ergebnisse.filter(e => /^smoke \(/.test(e.name));
  const gefahren = new Set(), alle = new Set();
  for (const e of teile) {
    const m = e.aus.match(/ABSCHNITTE \d+\/\d+: ([^\n]*?)\s+VON: ([^\n]*)/);
    if (!m) continue;
    for (const t of m[1].split(',').filter(Boolean)) gefahren.add(t.trim());
    for (const t of m[2].split(',').filter(Boolean)) alle.add(t.trim());
  }
  if (teile.length && !alle.size) {
    console.log(`\n  ${rot('✗')} smoke: kein Teillauf nennt seine Abschnitte `
      + '(Zeile „ABSCHNITTE i/n: … VON: …") — die Nachzählung prüft nichts mehr.');
    process.exit(1);
  }
  const fehlt = [...alle].filter(t => !gefahren.has(t));
  if (fehlt.length) {
    console.log(`\n  ${rot('✗')} smoke: ${fehlt.length} Abschnitte hat kein Teil gefahren — `
      + fehlt.join(', '));
    process.exit(1);
  }
  if (alle.size)
    console.log(`    ${''.padEnd(6)}${'gefahrene Abschnitte'.padEnd(24)} `
      + `${gefahren.size} von ${alle.size}`);
}

/* Und dieselbe Frage fuer `ansicht` - nur zaehlbar statt benennbar.
 *
 * Es prueft 32 Aufnahmen; ihre Namen in jede Teilausgabe zu schreiben
 * waere eine lange Zeile fuer wenig mehr Sicherheit, denn anders als bei
 * den Abschnitten teilt `ansicht` streng nach Index und kann dieselbe
 * Aufnahme nicht zweimal vergeben. Gezaehlt reicht hier also. */
{
  const teile = ergebnisse.filter(e => /^ansicht \(/.test(e.name));
  const gezaehlt = teile.map(e => (e.aus.match(/(\d+) grün, (\d+) neu, (\d+) rot/) || [])
    .slice(1, 4).reduce((n, z) => n + (+z || 0), 0)).reduce((n, z) => n + z, 0);
  const soll = +((teile[0]?.aus.match(/der (\d+) Aufnahmen/) || [])[1] || 0);
  if (soll && gezaehlt !== soll) {
    console.log(`\n  ${rot('✗')} ansicht: ${gezaehlt} von ${soll} Aufnahmen geprüft — `
      + 'die Teile decken zusammen nicht alles ab.');
    process.exit(1);
  }
  if (soll) console.log(`    ${''.padEnd(6)}${'geprüfte Aufnahmen'.padEnd(24)} ${gezaehlt} von ${soll}`);
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
