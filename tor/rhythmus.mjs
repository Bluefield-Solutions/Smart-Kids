// Tor `rhythmus`.
//
// `npm run proben` dauert rund zehn Minuten. Das ist zu lang fuer jede
// Runde und zu kurz, um es sich zu sparen - also muss es einen Rhythmus
// geben. Und ein Rhythmus, der nur in einem Dokument steht, wird gebrochen:
// dieses Verzeichnis hat schon einmal 61 Fassungen lang eine falsche Zahl im
// Stand stehen gehabt, ohne dass es jemandem auffiel.
//
// Deshalb ist die Frist ERZWUNGEN und nicht aufgeschrieben. Dieses Tor
// steht vorn in der Kette, kostet Millisekunden und schlaegt an, wenn der
// letzte volle Probenlauf mehr als GRENZE Runden zurueckliegt. Es ersetzt
// den Probenlauf nicht - es faengt seine haeufigste Verfallsart, naemlich
// dass er einfach nicht mehr stattfindet.
//
// Gezaehlt werden nur Commits, die CODE anfassen. Wer eine Zeile im
// Konzept aendert, verbraucht keine Frist.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const STAND = 'tor/proben-stand.json';
const CODE = ['src', 'prototyp', 'tor', 'tools', 'package.json'];

/**
 * Wieviele Runden duerfen zwischen zwei Probenlaeufen liegen?
 *
 * Drei. Die Runde, IN der geprobt wurde, ist die erste davon - der Lauf
 * findet vor dem Commit statt (der Baum muss sauber sein), also traegt der
 * Commit den festgehaltenen Stand mit sich.
 *
 * Warum nicht oefter: zehn Minuten je Runde sind zehn Minuten, in denen
 * nichts entsteht, und bei einer Runde mit zwei geaenderten Toren haben
 * siebzehn von neunzehn Proben nichts zu pruefen, was sich geaendert haette.
 * Warum nicht seltener: eine Probe hoert LEISE auf zu beweisen, und je mehr
 * Runden dazwischenliegen, desto schwerer ist der Tag zu finden, an dem es
 * passiert ist.
 */
const GRENZE = Math.min(3, Number(process.env.SMARTKIDS_RHYTHMUS_MAX ?? 3));
// `Math.min` und nicht einfach der Wert: die Schraube darf nur STRENGER
// stellen, nie lockerer. Sie ist fuer die Gegenprobe da - anders liesse
// sich „der Lauf liegt zu lange zurueck" gar nicht ausloesen, denn wie
// lange er zurueckliegt, steht in der Historie und nicht in einer Datei,
// die man anfassen kann. Eine Schraube, die auch lockern koennte, waere
// ein Schalter zum Abstellen des Tors - und der hat in einer Kette nichts
// verloren.

const fehler = [];
console.log('\n  Tor `rhythmus`');

if (!fs.existsSync(STAND)) {
  console.log(`\n  rhythmus ROT: ${STAND} fehlt — es hat noch nie ein `
    + 'vollständiger Probenlauf stattgefunden (`npm run proben`).\n');
  process.exit(1);
}
const stand = JSON.parse(fs.readFileSync(STAND, 'utf8'));

/* Ein Probenlauf, der unterwegs abgebrochen ist, hat nichts bewiesen. Er
 * soll die Kette aufhalten, nicht sie durchwinken. */
if (stand.lauf !== 'vollständig') {
  console.log(`\n  rhythmus ROT: der letzte Probenlauf ist nicht durchgelaufen `
    + `(${STAND} sagt „${stand.lauf}").\n`);
  process.exit(1);
}

/* Gezaehlt wird ab dem Commit, in dem die STANDDATEI zuletzt anders wurde -
 * nicht ab dem Commit, den der Lauf sich notiert hat.
 *
 * Der Unterschied kostete einen Anlauf: `proben` laeuft VOR dem Commit (der
 * Baum muss sauber sein), notiert sich also den damaligen Kopf. Wird die
 * Runde danach zusammengefasst oder nachgebessert, gibt es diesen Commit
 * nicht mehr - lokal findet ihn `git` noch im Objektspeicher, auf dem
 * Runner nach einem frischen Klon nicht. Das Tor waere genau dort rot
 * geworden, wo alles in Ordnung ist.
 *
 * Die Standdatei dagegen steht immer in der Historie: sie ist Teil des
 * Commits, der die Runde traegt. `fassung` bleibt als Auskunft stehen,
 * gezaehlt wird an der Datei.
 *
 * Ohne Historie geht beides nicht - und ein Tor, das sich dann still
 * ueberspringt, ist schlimmer als keines. `actions/checkout` braucht dafuer
 * `fetch-depth: 0`. */
const standCommit = execSync(`git log -1 --format=%H -- ${STAND}`, { encoding:'utf8' }).trim();
if (!standCommit) {
  console.log(`\n  rhythmus ROT: ${STAND} taucht in der Historie nicht auf.`
    + '\n  Entweder ist er noch nicht eingecheckt, oder der Klon ist flach — '
    + '`actions/checkout` braucht `fetch-depth: 0`.\n');
  process.exit(1);
}

const seither = +execSync(
  `git rev-list --count ${standCommit}..HEAD -- ${CODE.join(' ')}`,
  { encoding:'utf8' }).trim();

console.log(`    letzter voller Lauf: ${stand.zeit}, ${stand.proben} Proben, `
  + `eingecheckt in ${standCommit.slice(0,7)}`);
console.log(`    seither ${seither} Runde${seither === 1 ? '' : 'n'} am Code `
  + `(erlaubt sind ${GRENZE})`);

if (seither > GRENZE)
  fehler.push(`Der letzte volle Probenlauf liegt ${seither} Runden zurück, erlaubt sind `
    + `${GRENZE}. Eine Probe hört leise auf zu beweisen — je länger es her ist, desto `
    + 'schwerer ist der Tag zu finden, an dem es passiert ist. (`npm run proben`)');

/* Und: ist der festgehaltene Stand ueberhaupt noch derselbe Lauf?
 *
 * Wer eine Probe dazuschreibt oder ein Tor in die Kette haengt, hat einen
 * ANDEREN Probenlauf vor sich als den festgehaltenen. Das Datum sagt darueber
 * nichts. */
const jetzt = fs.readFileSync('tor/proben.mjs', 'utf8');
const zahl = (jetzt.match(/\{ n:'/g) || []).length;
if (zahl !== stand.proben)
  fehler.push(`Es stehen ${zahl} Proben im Baum, festgehalten sind ${stand.proben} — `
    + 'der letzte Lauf war ein anderer. (`npm run proben`)');

const kette = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts.tor
  .split('&&').map(s => s.trim().replace(/^npm run /, ''))
  .filter(t => t !== 'bauen' && t !== 'rhythmus');
const neu = kette.filter(t => !stand.tore.includes(t));
if (neu.length)
  fehler.push(`Diese Tore standen beim letzten Probenlauf noch nicht in der Kette: `
    + `${neu.join(', ')}. (\`npm run proben\`)`);

console.log('');
if (fehler.length) {
  console.log(`  ${fehler.length} FEHLER:`);
  fehler.forEach(f => console.log(`    ✗ ${f}`));
  console.log('');
  process.exit(1);
}
console.log('  rhythmus grün: die Gegenproben sind nicht älter als drei Runden.\n');
