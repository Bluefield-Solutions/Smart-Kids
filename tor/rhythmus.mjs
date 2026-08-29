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
/* Wie alt ist ein Eintrag? Gezaehlt in Runden am CODE, nicht in Tagen.
 *
 * Der Commit, den eine Probe sich notiert, ist ein schlechter Anker. Er
 * entsteht VOR dem Commit, der die Runde traegt (der Baum muss sauber
 * sein), und wird danach oft zusammengefasst oder verworfen. Lokal liegt
 * er dann noch im Objektspeicher, auf einem frischen Klon nicht mehr.
 *
 * Genau das ist passiert, und es hat die Auslieferung fuenf Runden lang
 * rot gehalten: 66 von 71 Proben zeigten auf zwei wip-Commits, die nie an
 * einem Zweig hingen. Der Kommentar, der frueher hier stand, hat den Fall
 * beschrieben UND die Loesung genannt - umgesetzt war sie nicht.
 *
 * Schlimmer als das Rot auf dem Runner war das Gruen hier: fuer einen
 * Commit, der KEIN Vorfahr von HEAD ist, rechnet
 * "git rev-list --count X..HEAD" klaglos eine Zahl aus. Sie bedeutet nur
 * nichts. Eine Zahl ohne ihre Messstelle (Regel 12).
 *
 * Deshalb zwei Wege, und der erste zaehlt nur, wenn er zaehlen darf:
 *
 *   1. Der notierte Commit ist ein Vorfahr von HEAD  ->  genau abzaehlen.
 *   2. Sonst: den Commit suchen, in dem die STANDDATEI diesen Eintrag zum
 *      ersten Mal traegt. Die Standdatei steht immer in der Historie - sie
 *      gehoert zu dem Commit, der die Runde traegt. Das ist auf jedem
 *      Klon dieselbe Antwort.
 *
 * Findet auch das nichts, ist der Eintrag noch gar nicht eingecheckt: er
 * gehoert zur laufenden Runde und ist null Runden alt. */
const git = (b) => execSync(b, { encoding:'utf8', stdio:['ignore','pipe','ignore'] }).trim();

const rundenSeit = (() => {
  const merker = new Map();
  return (commit) => {
    if (merker.has(commit)) return merker.get(commit);
    let n = null;
    try { n = +git(`git rev-list --count ${commit}..HEAD -- ${CODE.join(' ')}`); }
    catch { n = null; }
    merker.set(commit, n);
    return n;
  };
})();

const istVorfahr = (() => {
  const merker = new Map();
  return (commit) => {
    if (merker.has(commit)) return merker.get(commit);
    let ja = false;
    try { git(`git merge-base --is-ancestor ${commit} HEAD`); ja = true; } catch { ja = false; }
    merker.set(commit, ja);
    return ja;
  };
})();

/* Wo taucht ein Eintrag in der Historie der Standdatei zum ersten Mal auf?
 *
 * Einmal gelesen, fuer alle Proben zusammen: die Datei hat ein gutes
 * Dutzend Fassungen, und sie je Probe einzeln zu holen waere Arbeit ohne
 * Erkenntnis. Gelaufen wird von HEAD nach hinten; die AELTESTE Fassung,
 * die den Eintrag unveraendert traegt, gewinnt. */
const ersteFassung = (() => {
  let karte = null;
  return (name, eintrag) => {
    if (!karte) {
      karte = new Map();
      let liste = [];
      try { liste = git(`git log --format=%H -- ${STAND}`).split('\n').filter(Boolean); }
      catch { liste = []; }
      for (const c of liste) {
        let alt;
        try { alt = JSON.parse(git(`git show ${c}:${STAND}`)); } catch { continue; }
        for (const [n, e] of Object.entries(alt.proben || {}))
          karte.set(`${n}|${e.commit}|${e.zeit}`, c);   // aeltere ueberschreiben juengere
      }
    }
    return karte.get(`${name}|${eintrag.commit}|${eintrag.zeit}`) || null;
  };
})();

/** Wieviele Code-Runden liegt der Nachweis dieser Probe zurueck? */
const alterVon = (name, eintrag) => {
  if (istVorfahr(eintrag.commit)) return rundenSeit(eintrag.commit);
  const traeger = ersteFassung(name, eintrag);
  if (traeger) return rundenSeit(traeger);
  /* Weder noch: das Alter ist NICHT bestimmbar, und das ist rot.
   *
   * Hier stand `return 0` - "noch nicht eingecheckt, gehoert zur laufenden
   * Runde". Der Gedanke war falsch, und die Gegenprobe hat ihn sofort
   * gefangen: ein frisch geschriebener Nachweis traegt den AKTUELLEN Kopf,
   * und der ist ein Vorfahr von HEAD - er kommt also gar nicht bis
   * hierher. Wer hier ankommt, zeigt ins Leere.
   *
   * Eine Ausnahme, die den einzigen Fall verschluckt, fuer den die
   * Pruefung da ist, ist keine Ausnahme, sondern das Loch. */
  return null;
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
const jetzt = fs.readFileSync('tor/proben.mjs', 'utf8');
// Am ZEILENANFANG verankert. Ohne den Anker hat dieser Leser einen Namen
// aus einem KOMMENTAR mitgezaehlt - aus dem Kommentar, der genau diese
// Falle erklaert. Er meldete siebzig Proben, wo neunundsechzig stehen.
// Eintraege stehen eingerueckt am Zeilenanfang, Prosa steht hinter `*`
// oder `//`.
const namen = [...jetzt.matchAll(/^\s*\{ n:'([^']+)'/gm)].map(m => m[1]);

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
console.log(`    ältester Nachweis: ${aeltester} Runde${aeltester === 1 ? '' : 'n'} `
  + `am Code (erlaubt sind ${GRENZE})`);

const nenne = (liste, n = 4) => liste.slice(0, n).join(' · ')
  + (liste.length > n ? ` … und ${liste.length - n} weitere` : '');

if (nie.length)
  fehler.push(`${nie.length} Probe${nie.length === 1 ? ' hat' : 'n haben'} noch nie angeschlagen: `
    + `${nenne(nie)}. (\`npm run proben -- --geaendert\`)`);
if (verschollen.length)
  fehler.push(`Für ${verschollen.length} Probe${verschollen.length === 1 ? '' : 'n'} lässt sich `
    + `das Alter nicht bestimmen: ${nenne(verschollen)}. Weder ist der notierte Commit ein `
    + 'Vorfahr von HEAD, noch findet sich der Eintrag in der Historie der Standdatei. '
    + 'Ohne Historie geht beides nicht — `actions/checkout` braucht `fetch-depth: 0`.');
if (zuAlt.length)
  fehler.push(`${zuAlt.length} Nachweis${zuAlt.length === 1 ? '' : 'e'} sind älter als `
    + `${GRENZE} Runden (bis zu ${Math.max(...zuAlt.map(x => x.alter))}): `
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
console.log('  rhythmus grün: die Gegenproben sind nicht älter als drei Runden.\n');
