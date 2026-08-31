// Tor `rhythmus`.
//
// FRUEHER: ein Stand fuer ALLE Proben - ein Datum, ein Commit, eine Zahl.
// Wer eine Gegenprobe dazuschrieb, entwertete damit den Nachweis fuer alle
// anderen und musste den ganzen Satz neu fahren. Und eine Runde, die etwas
// Neues baut, schreibt fast immer eine Gegenprobe dazu - das ist ja die
// Hausregel. Also lief in der Praxis JEDE Runde der volle Satz, rund
// fuenfundzwanzig Minuten, und die Frist unten kam nie zum Zug. In einer
// einzigen Sitzung waren das vier volle Laeufe und hundert Minuten.
//
// JETZT: der Stand haelt je Probe fest, wann sie zuletzt angeschlagen hat.
// Eine neue Probe kostet dann DIESE Probe und nicht die anderen
// achtundsechzig. Die Frist unten bleibt, und erst jetzt ist sie das, was
// den vollen Lauf ausloest - so wie es immer gedacht war.
//
// `npm run proben` dauert rund fuenfundzwanzig Minuten. Das ist zu lang
// fuer jede Runde und zu kurz, um es sich zu sparen - also muss es einen
// Rhythmus geben. Und ein Rhythmus, der nur in einem Dokument steht, wird gebrochen:
// dieses Verzeichnis hat schon einmal 61 Fassungen lang eine falsche Zahl im
// Stand stehen gehabt, ohne dass es jemandem auffiel.
//
// Deshalb ist die Frist ERZWUNGEN und nicht aufgeschrieben. Dieses Tor
// kostet Millisekunden und schlaegt an, wenn der letzte volle Probenlauf
// mehr als GRENZE Tage zurueckliegt. Es ersetzt den Probenlauf nicht -
// es faengt seine haeufigste Verfallsart, naemlich dass er einfach nicht
// mehr stattfindet.
//
// WO es laeuft: nachts auf dem Runner, vor `npm run proben`, und in
// `.github/workflows/vorschau.yml`. NICHT in `npm run tor` - hier stand
// „dieses Tor steht vorn in der Kette", und das galt bis zu dem Tag, an
// dem die Gegenproben auf den Runner umgezogen sind. Danach hat der Satz
// weiter dagestanden. Er hat mehr gekostet als eine falsche Auskunft: die
// Gegenprobe „ein neues Tor steht in der Kette" suchte
// `npm run rhythmus && npm run inhalt` in package.json, fand es nicht mehr
// und bewies seitdem nichts (Regel 10, und Regel 6 gleich mit).
//
// Gezaehlt wird in TAGEN, nicht in Commits.
//
// Bis hierher zaehlte dieses Tor „Runden am Code": Commits, die src,
// prototyp, tor, tools oder package.json anfassen, seit dem Nachweis. Die
// Grenze war drei. Das klingt vernuenftig und war die falsche Groesse:
// eine einzige Arbeitssitzung macht zwanzig solche Commits, und danach
// stand das Tor auf 47 Runden Rueckstand — obwohl jede Probe am selben Tag
// bezeugt worden war. Ein Tor, das nach jeder Sitzung rot ist, ist auf dem
// Weg, ignoriert zu werden.
//
// Ein Commit ist auch kein Mass fuer Veraenderung: ich mache viele kleine,
// jemand anders macht einen grossen. Was dieses Tor WIRKLICH abfangen
// soll, steht oben — dass der volle Lauf nicht mehr stattfindet. Und das
// misst man in Tagen, nicht in Commits: der Runner faehrt ihn jede Nacht,
// also ist alles hoechstens einen Tag alt, solange er faehrt.
//
// Was es dadurch NICHT mehr misst: ob eine Probe seit ihrem Nachweis durch
// eine Code-Aenderung stumm geworden ist. Das war der einzige Grund, in
// Commits zu zaehlen — und es hat nie funktioniert, weil die Zahl an der
// Commit-Gewohnheit hing statt an der Aenderung. Diese Frage beantwortet
// jetzt `inhalt`, in einer Millisekunde und bei JEDER Aenderung: findet
// jede Probe ihren Suchtext noch? Fuenf der sieben stummen Proben, die der
// erste volle Lauf fand, haetten genau daran angeschlagen.
//
// Und die ganze Git-Rechnerei faellt damit weg. Sie hat die Auslieferung
// einmal fuenf Runden rot gehalten (notierte Commits, die nach einem
// frischen Klon nicht mehr existierten) und brauchte `fetch-depth: 0`. Ein
// Datum steht in der Datei und braucht keine Historie.
import fs from 'node:fs';

const STAND = 'tor/proben-stand.json';

/**
 * Wieviele Tage duerfen zwischen zwei Probenlaeufen liegen?
 *
 * Drei TAGE. Der Runner faehrt den vollen Satz jede Nacht; im Normalfall
 * ist also alles null oder einen Tag alt. Drei laesst ein verpasstes
 * Wochenende durch und schlaegt an, wenn der Lauf wirklich stehengeblieben
 * ist — oder wenn eine Probe drei Naechte hintereinander nicht angeschlagen
 * hat, was dasselbe Rot verdient.
 *
 * Die Zahl heisst jetzt Tage und hiess vorher Runden. Wer das verwechselt,
 * liest dieselbe Drei und meint etwas anderes.
 */
const GRENZE = Math.min(3, Number(process.env.SMARTKIDS_RHYTHMUS_MAX ?? 3));   // Tage
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

if (!stand.proben || typeof stand.proben !== 'object' || Array.isArray(stand.proben)) {
  console.log(`\n  rhythmus ROT: ${STAND} hat nicht die Form, die dieses Tor liest — `
    + 'es fehlt der Eintrag je Probe.\n');
  process.exit(1);
}

/* Ein Lauf, der unterwegs abgebrochen ist, braucht keine eigene Marke mehr.
 *
 * Frueher stand hier „lauf": "abgebrochen" - eine Marke fuer den ganzen
 * Satz. Sie ist ueberfluessig geworden: eine Probe bekommt ihren Eintrag
 * genau dann, wenn sie angeschlagen hat. Bricht ein Lauf ab, fehlen die
 * Eintraege der Proben, die nicht mehr drankamen, und das faellt unten von
 * selbst auf. Ein Zustand weniger, der falsch sein kann. */

/* Wie alt ist ein Nachweis? In Tagen, aus dem Datum in der Datei.
 *
 * Hier standen achtzig Zeilen Git: `rev-list --count`, `merge-base
 * --is-ancestor`, ein Durchgang durch alle Fassungen der Standdatei, um zu
 * finden, wo ein Eintrag zum ersten Mal auftaucht. Jede dieser Zeilen hatte
 * ihren Grund, und alle Gruende hingen daran, dass in COMMITS gezaehlt
 * wurde. Ein Datum braucht davon nichts.
 */
const HEUTE = new Date(new Date().toISOString().slice(0, 10));
const alterVon = (name, eintrag) => {
  if (!eintrag || !/^\d{4}-\d{2}-\d{2}$/.test(String(eintrag.zeit || ''))) return null;
  return Math.round((HEUTE - new Date(eintrag.zeit)) / 86400000);
};

/* Welche Proben stehen im Baum?
 *
 * Gelesen aus `tor/proben.mjs`, nicht aus einer zweiten Liste - eine Liste
 * daneben veraltet. Steht ein Name in der Datei und nicht im Stand, ist er
 * neu und ungeprueft; steht er im Stand und nicht in der Datei, ist er
 * gestrichen und der Eintrag Ballast.
 *
 * Faende dieser Ausdruck einen Namen nicht, meldete das Tor „nie gefahren"
 * — also rot. Ein Parser, der scheitert, faellt hier in die sichere
 * Richtung. */
// Gelesen als DATEN, nicht als Text. Hier stand ein Ausdruck auf den
// Quelltext von `proben.mjs`; ohne Anker am Zeilenanfang zaehlte er einen
// Namen aus einem Kommentar mit und meldete siebzig Proben, wo
// neunundsechzig standen. Seit die Liste ein eigenes Modul ist, gibt es
// nichts mehr zu klauben.
const { PROBEN } = await import('./proben-liste.mjs');
const namen = PROBEN.map(p => p.n);

const nie = namen.filter(n => !stand.proben[n]);
const zuAlt = [];
const verschollen = [];
for (const n of namen) {
  const e = stand.proben[n];
  if (!e) continue;
  const alter = alterVon(n, e);
  if (alter === null) { verschollen.push(n); continue; }
  if (alter > GRENZE) zuAlt.push({ n, alter });
}
const frisch = namen.length - nie.length - zuAlt.length - verschollen.length;
const aeltester = Math.max(0, ...namen.map(n =>
  stand.proben[n] ? (alterVon(n, stand.proben[n]) ?? 0) : 0));

console.log(`    ${namen.length} Proben im Baum, ${frisch} mit frischem Nachweis`);
console.log(`    ältester Nachweis: ${aeltester} Tag${aeltester === 1 ? '' : 'e'} `
  + `(erlaubt sind ${GRENZE})`);

const nenne = (liste, n = 4) => liste.slice(0, n).join(' · ')
  + (liste.length > n ? ` … und ${liste.length - n} weitere` : '');

if (nie.length)
  fehler.push(`${nie.length} Probe${nie.length === 1 ? ' hat' : 'n haben'} noch nie angeschlagen: `
    + `${nenne(nie)}. (\`npm run proben -- --geaendert\`)`);
if (verschollen.length)
  fehler.push(`Für ${verschollen.length} Probe${verschollen.length === 1 ? '' : 'n'} lässt sich `
    + `das Alter nicht bestimmen: ${nenne(verschollen)}. Im Stand fehlt ein gültiges `
    + 'Datum (`zeit`) — ohne das ist „wie alt" keine Frage, die sich beantworten lässt.');
if (zuAlt.length)
  fehler.push(`${zuAlt.length} Nachweis${zuAlt.length === 1 ? '' : 'e'} sind älter als `
    + `${GRENZE} Tage (bis zu ${Math.max(...zuAlt.map(x => x.alter))}): `
    + `${nenne(zuAlt.map(x => x.n))}. Eine Probe hört leise auf zu beweisen — je länger es `
    + 'her ist, desto schwerer ist der Tag zu finden, an dem es passiert ist. '
    + '(`npm run proben`)');

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
console.log(`  rhythmus grün: kein Nachweis ist älter als ${GRENZE} Tage.\n`);
