// Tor `budget`.
//
// Das Konzept nennt in Kapitel 8 fuenf Groessengrenzen und schreibt hinter
// drei davon „Tor `budget`". Das Tor gab es nicht. Die Zusage stand also
// da, ohne dass irgendetwas sie gehalten haette - und die Startgroesse ist
// in diesem Verzeichnis schon zweimal unbemerkt gewandert: einmal von 297
// auf 537 KB, als fuenf Kontinente verdrahtet wurden, und einmal zurueck
// auf 132, als sie nachgeladen statt eingebacken wurden. Beide Male hat es
// niemand gemessen, sondern jemand gemerkt.
//
// GRENZEN WERDEN NICHT HIER GESCHRIEBEN. Sie werden aus dem Konzept
// GELESEN. Zwei Zahlen an zwei Orten veralten getrennt voneinander - die
// eine wird gepflegt, die andere gilt, und niemand sieht den Unterschied.
// Wer die Grenze aendern will, aendert das Konzept; das Tor zieht mit.
//
// Gemessen wird GZIP, weil das die Groesse ist, die ueber die Leitung geht.
// Die rohe Groesse steht daneben, damit man sieht, was der Server spart.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const NEU = process.argv.includes('--neu');
const DIST = 'dist';
const KONZEPT = 'docs/Lernkiste-KONZEPT.md';
const STAND = 'tor/budget-stand.json';

const fehler = [], hinweise = [];
const kb = (n) => +(n / 1024).toFixed(1);
const gzip = (f) => zlib.gzipSync(fs.readFileSync(f), { level: 9 }).length;

/* --- Die Grenzen aus dem Konzept lesen -------------------------------- *
 *
 * Gesucht wird die Tabelle in Kapitel 8 ueber ihre Zeilenbeschriftung, nicht
 * ueber ihre Zeilennummer. Findet sich eine Zeile nicht mehr, ist das ein
 * FEHLER und kein Achselzucken: ein Tor, das seine eigene Grenze nicht mehr
 * findet und deshalb still nichts prueft, ist schlimmer als keines. Genau
 * diese Falle hat `doku` eine Runde lang stillgelegt.
 */
if (!fs.existsSync(KONZEPT)) {
  console.log(`\n  budget ROT: ${KONZEPT} nicht gefunden.\n`);
  process.exit(1);
}
const konzept = fs.readFileSync(KONZEPT, 'utf8');

function grenze(zeile) {
  // „| **Startbündel** gesamt, gzip | **< 400 KB** | …"
  const m = konzept.match(new RegExp(
    '\\|[^|\\n]*' + zeile + '[^|\\n]*\\|[^|\\n]*?<\\s*\\**\\s*([\\d.,]+)\\s*KB', 'i'));
  if (!m) { fehler.push(`Im Konzept steht keine Grenze für „${zeile}" mehr — `
    + 'das Tor kann sie nicht prüfen'); return null; }
  return +m[1].replace(',', '.');
}

const G = {
  start:    grenze('Startbündel'),
  geometrie:grenze('davon Geometrie'),
  schrift:  grenze('davon Schriften'),
  ebene:    grenze('Nachladbar je Ebene'),
};

/* --- Messen ------------------------------------------------------------ */
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.log('\n  budget ROT: dist/ fehlt — erst `npm run bauen`.\n');
  process.exit(1);
}

/** Alles, was beim ERSTEN Start über die Leitung geht. */
const startDateien = ['index.html', 'sw.js', 'schrift.css', 'manifest.webmanifest']
  .map(n => path.join(DIST, n)).filter(fs.existsSync);
const schriftDateien = fs.existsSync(path.join(DIST, 'schrift'))
  ? fs.readdirSync(path.join(DIST, 'schrift')).map(n => path.join(DIST, 'schrift', n))
  : [];
// Die Symbole liegen im Manifest, werden aber nicht beim Start geholt -
// iOS holt genau eines, wenn die App auf den Startbildschirm kommt.
const startGz = [...startDateien, ...schriftDateien].reduce((a, f) => a + gzip(f), 0);
const schriftGz = schriftDateien.reduce((a, f) => a + gzip(f), 0);

/** Die Geometrie im Startbündel: die grobe Stufe, eingebacken in index.html.
 *
 * MESSSTELLE, weil die Zahl sonst nichts bedeutet: gemessen wird der
 * ANTEIL, nicht die Summe. Also gzip(Seite) minus gzip(dieselbe Seite mit
 * leeren Pfaden). Der erste Anlauf packte die Pfade einzeln zusammen und
 * kam auf 91,7 KB - das ist aber die Groesse, die sie ALLEIN haetten, nicht
 * die, die sie in der Seite KOSTEN. Ein Packer arbeitet über die ganze
 * Datei; Umrisse im Kontext von Umrissen packen anders als für sich.
 */
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const ohnePfade = html.replace(/"pfad":"[^"]+"/g, '"pfad":""');
const geoGz = zlib.gzipSync(Buffer.from(html), { level: 9 }).length
            - zlib.gzipSync(Buffer.from(ohnePfade), { level: 9 }).length;

/** Die nachladbaren Ebenen, jede einzeln. */
const datenDir = path.join(DIST, 'daten');
const ebenen = fs.existsSync(datenDir)
  ? fs.readdirSync(datenDir).filter(n => n.endsWith('.json'))
      .map(n => ({ n, gz: gzip(path.join(datenDir, n)),
                   roh: fs.statSync(path.join(datenDir, n)).size }))
      .sort((a, b) => b.gz - a.gz)
  : [];

/* --- Urteilen ---------------------------------------------------------- */
console.log('\n  Tor `budget`   (gzip, so wie es über die Leitung geht)\n');

const zeile = (was, gz, gr) => {
  const ok = gr === null || kb(gz) <= gr;
  if (!ok) fehler.push(`${was}: ${kb(gz)} KB, erlaubt sind ${gr} KB`);
  console.log(`    ${ok ? ' ' : '✗'} ${was.padEnd(30)} ${String(kb(gz)).padStart(6)} KB`
    + (gr === null ? '' : `   von ${gr}`));
};

zeile('Startbündel gesamt', startGz, G.start);
zeile('davon Geometrie (grob)', geoGz, G.geometrie);
zeile('davon Schriften', schriftGz, G.schrift);
console.log('');
for (const e of ebenen)
  zeile('nachgeladen: ' + e.n.replace(/^laender-|\.json$/g, ''), e.gz, G.ebene);

/* --- Die Ratsche: gewachsen, ohne dass jemand hingesehen hat ----------- *
 *
 * Die Grenze allein reicht nicht. Zwischen 141 und 400 KB liegt viel Platz,
 * und eine Zahl, die sich in acht Runden verdoppelt, ohne je anzuschlagen,
 * ist genau die Art von Verfall, den keine Grenze faengt. Der festgehaltene
 * Stand meldet deshalb JEDES Wachstum ueber 5 % - nicht als Verbot, sondern
 * als Frage: war das Absicht?
 *
 * Neu festhalten mit `npm run budget -- --neu`. Von Hand, mit Blick darauf,
 * so wie die Vorbilder in `ansicht`.
 */
const jetzt = {
  start: kb(startGz), geometrie: kb(geoGz), schrift: kb(schriftGz),
  ebenen: Object.fromEntries(ebenen.map(e => [e.n, kb(e.gz)])),
};

if (NEU) {
  fs.writeFileSync(STAND, JSON.stringify({ zeit: new Date().toISOString().slice(0, 10),
    ...jetzt }, null, 2) + '\n');
  console.log(`\n  Stand neu festgehalten in ${STAND}.\n`);
  process.exit(0);
}

if (!fs.existsSync(STAND)) {
  fehler.push(`${STAND} fehlt — ohne festgehaltenen Stand fällt Wachstum nicht auf `
    + '(`npm run budget -- --neu`)');
} else {
  const alt = JSON.parse(fs.readFileSync(STAND, 'utf8'));
  const WACHSTUM = 1.05;
  const vergleiche = (was, a, b) => {
    if (a === undefined) { hinweise.push(`${was} ist neu — noch kein Stand dafür`); return; }
    if (b > a * WACHSTUM)
      fehler.push(`${was} ist von ${a} auf ${b} KB gewachsen (+${((b/a-1)*100).toFixed(0)} %) — `
        + 'war das Absicht? (`npm run budget -- --neu`)');
  };
  vergleiche('Startbündel', alt.start, jetzt.start);
  vergleiche('Geometrie', alt.geometrie, jetzt.geometrie);
  vergleiche('Schriften', alt.schrift, jetzt.schrift);
  for (const [n, v] of Object.entries(jetzt.ebenen)) vergleiche('Ebene ' + n, alt.ebenen?.[n], v);
  console.log(`\n    gegen den Stand vom ${alt.zeit}: `
    + `Start ${alt.start} → ${jetzt.start} KB`);
}

console.log('');
hinweise.forEach(h => console.log(`  Hinweis: ${h}`));
if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER:`);
  fehler.forEach(f => console.log(`    ✗ ${f}`));
  console.log('');
  process.exit(1);
}
console.log(`  budget grün: Start ${jetzt.start} von ${G.start} KB, `
  + `größte Ebene ${Math.max(...Object.values(jetzt.ebenen))} von ${G.ebene} KB.\n`);
