// Tor `regeln`: jeder Verweis „Regel N" zeigt auf die Regel, die gemeint ist.
//
// Der Befund, der dieses Tor ausgeloest hat (P4): von 197 Verweisen der Form
// „Regel N" zeigten **101 in die Regelliste eines ANDEREN Verzeichnisses**.
// Die gemeinten Regeln gab es alle - sie standen nur unter anderen Nummern:
// „Messstelle" ist hier 5 und nicht 12, „erst abschalten, dann messen" ist 1
// und nicht 13, „was zweimal dasteht" ist 6 und nicht 15. Die Verweise sind
// beim Schreiben aus dem Gedaechtnis entstanden, und das Gedaechtnis hatte
// die falsche Liste offen.
//
// Das ist genau der Schaden, vor dem Regel 6 warnt: eine Regel, auf die man
// sich per Nummer beruft, die es unter dieser Nummer nicht gibt, ist eine
// Begruendung, die niemand nachschlagen kann.
//
// GEPRUEFT WIRD ZWEIERLEI, und das zweite ist das eigentliche:
//
//   1. Die Nummer muss es geben. Faengt alles ab, was ueber die Liste
//      hinauszeigt - beim ersten Lauf 101 Verweise.
//   2. Im Satz daneben muss ein Wort aus der UEBERSCHRIFT dieser Regel
//      stehen. Ohne diese zweite Haelfte waere das Tor blind fuer den
//      teureren Fall: eine Nummer, die es gibt und die etwas anderes
//      meint. „Regel 3" hiess an zwoelf Stellen „ist der Eingriff
//      angekommen" - das ist hier die 10.
//
// Warum das ueberhaupt geht: die Ueberschriften sind kurz und tragen ihre
// Stichworte selbst („Jede Zahl traegt ihre Messstelle mit"). Das Tor
// zerlegt sie in Woerter ab fuenf Buchstaben und verlangt EINES davon in
// der Umgebung des Verweises. Wer eine Regel umschreibt, muss ihre Verweise
// nicht anfassen - solange ein Stichwort haelt.
import fs from 'node:fs';
import path from 'node:path';

const WURZELN = ['tor', 'tools', 'src', 'prototyp', 'docs'];
const ENDUNGEN = ['.mjs', '.js', '.md', '.html'];
/* Wie weit um den Verweis herum gesucht wird.
 *
 * 220 Zeichen sind knapp zwei Zeilen davor und zwei danach. Gemessen: mit
 * 120 fielen sieben richtige Verweise durch, weil das Stichwort einen Satz
 * weiter oben stand; mit 400 findet das Fenster Stichworte, die zu einem
 * ganz anderen Absatz gehoeren, und das Tor wird nachlaessig. */
const FENSTER = 220;
/* Woerter, die in jeder zweiten Ueberschrift stehen und deshalb nichts
 * unterscheiden. Ohne sie waere „Regel 7" (dist) durch das Wort „Tore" in
 * jeder beliebigen Umgebung zu belegen. */
const ALLERWELT = new Set(['regel', 'regeln', 'nicht', 'jede', 'jeder', 'jedes',
  'eine', 'einen', 'einem', 'dann', 'wenn', 'wird', 'werden', 'steht', 'stehen',
  'sind', 'aber', 'auch', 'noch', 'schon', 'hier', 'dort', 'diese', 'dieser',
  'tore', 'toren', 'sich', 'ihre', 'ihrer', 'ihren', 'nach', 'ueber', 'über']);

const fehler = [];

/* Die Liste - gelesen, nicht abgeschrieben.
 *
 * Erkannt wird „N. **Ueberschrift.**" im Abschnitt „Eiserne Regeln". Wer
 * eine Regel dazuschreibt, muss dieses Tor nicht anfassen. */
const claude = fs.readFileSync('CLAUDE.md', 'utf8');
const teil = claude.split('## Eiserne Regeln')[1] || '';
const REGELN = new Map(), TEXT = new Map();
for (const m of teil.matchAll(/^(\d+)\.\s+\*\*(.+?)\*\*([\s\S]*?)(?=^\d+\.\s+\*\*|^---|\n\nDie Nummern)/gms)) {
  REGELN.set(+m[1], m[2].replace(/\s+/g, ' ').trim());
  /* Die Stichworte kommen aus der GANZEN Regel, nicht nur aus ihrer
     Ueberschrift. Regel 1 hat zwei Saetze, und zitiert wird fast immer der
     zweite („wer eine Wirkung misst, schaltet sie zuerst ab"); mit der
     Ueberschrift allein fielen siebzehn richtige Verweise durch. */
  TEXT.set(+m[1], (m[2] + ' ' + m[3]).replace(/\s+/g, ' ').trim());
}

if (REGELN.size < 5) {
  console.log('\n  Tor `regeln`\n');
  console.log('  ✗ In CLAUDE.md steht keine lesbare Regelliste — dann prüft dieses Tor nichts.\n');
  process.exit(1);
}

/** Die Stichworte einer Regel: Woerter ab fuenf Buchstaben, klein. */
const stichworte = (satz) => [...new Set(satz.toLowerCase()
  .replace(/[^a-zäöüß ]/g, ' ').split(/\s+/)
  .filter(w => w.length >= 5 && !ALLERWELT.has(w)))];

const WORTE = new Map([...TEXT].map(([n, s]) => [n, stichworte(s)]));

/** Alle Dateien, in denen ein Verweis stehen kann. */
function dateien(wurzel) {
  const aus = [];
  const gehe = (p) => {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      const f = path.join(p, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules') gehe(f); }
      else if (ENDUNGEN.includes(path.extname(e.name))) aus.push(f);
    }
  };
  if (fs.existsSync(wurzel)) gehe(wurzel);
  return aus;
}

let gesamt = 0, belegt = 0;
const ohneNummer = [], ohneWort = [];
for (const w of WURZELN) for (const f of dateien(w)) {
  /* `prototyp/spiel.html` und die Entwuerfe sind GEBAUT - sie tragen
     dieselben Kommentare noch einmal. Ein Befund dort ist derselbe Befund,
     nur zweimal gezaehlt (Regel 6: was zweimal dasteht). */
  if (/^(prototyp\/spiel\.html|docs\/entwuerfe\/)/.test(f.replace(/\\/g, '/'))) continue;
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/Regel (\d+)/g)) {
    gesamt++;
    const n = +m[1];
    const zeile = t.slice(0, m.index).split('\n').length;
    if (!REGELN.has(n)) {
      ohneNummer.push(`${f}:${zeile} — „Regel ${n}", die Liste hat ${REGELN.size}`);
      continue;
    }
    const um = t.slice(Math.max(0, m.index - FENSTER), m.index + FENSTER).toLowerCase();
    if (WORTE.get(n).some(x => um.includes(x))) { belegt++; continue; }
    /* DER SCHLUESSEL IST DIE ZEILE, NICHT IHRE NUMMER (I17).
     *
     * Die Ratsche ist eine ZAHL, und der Bericht nannte deshalb den
     * Schwanz der Liste als „die neuen" - `ohneWort.slice(stand)`. Das
     * ist die Reihenfolge der Dateien, nicht die Reihenfolge des
     * Entstehens: bei I16 zeigte das Tor auf `docs/Lernkiste-STAND.md`,
     * waehrend der neue Verweis in `src/inhalt/erdkunde.js` stand. Der
     * Befund war richtig, der Fingerzeig falsch - und ein Tor, das den
     * Fehler findet und woandershin zeigt, kostet jedes Mal denselben
     * Umweg.
     *
     * Gemerkt wird jetzt die ZEILE selbst, getrimmt. Nicht ihre Nummer:
     * die verschiebt sich, sobald jemand darueber etwas einfuegt, und
     * dann waeren alle 47 „neu". Nicht die Umgebung: die aendert sich
     * schon, wenn zwei Zeilen weiter oben ein Wort anders steht. Die
     * Zeile ist genau das, was jemand SCHREIBT, wenn er einen Verweis
     * schreibt - wer sie umformuliert, hat einen neuen Verweis
     * geschrieben und soll gefragt werden. */
    ohneWort.push({
      wo: `${f}:${zeile}`,
      schluessel: `${f}|${n}|${t.split('\n')[zeile - 1].trim()}`,
      text: `${f}:${zeile} — „Regel ${n}" (${REGELN.get(n)}) — `
        + `kein Stichwort daneben (${WORTE.get(n).slice(0, 4).join(', ')})`,
    });
  }
}

/* Die Nummer ist ein FEHLER, das fehlende Stichwort eine RATSCHE.
 *
 * Warum nicht beides ein Fehler: der Stichworttest ist unscharf. Er
 * verlangt ein Wort aus der Regel in der Umgebung des Verweises, und viele
 * richtige Verweise sagen dieselbe Sache mit anderen Worten („bewies
 * deshalb nichts" fuer Regel 1). Als Fehler haette er beim ersten Lauf
 * fuenfundsechzig richtige Verweise gemeldet - ein Tor, das so oft
 * unrecht hat, wird abgeschaltet oder umgangen.
 *
 * Als Ratsche taugt er trotzdem: er darf nicht STEIGEN. Wer einen neuen
 * Verweis schreibt, der die Regel nicht benennt, macht die Zahl groesser
 * und wird gefragt. Die Vergangenheit bleibt, wie sie ist - dieselbe Bauart
 * wie `budget`. */
const STAND = 'tor/regeln-stand.json';
const stand = fs.existsSync(STAND) ? JSON.parse(fs.readFileSync(STAND, 'utf8')) : null;

console.log('\n  Tor `regeln`');
console.log(`    ${REGELN.size} Eiserne Regeln, ${gesamt} Verweise, ${belegt} mit Stichwort belegt`
  + `, ${ohneWort.length} ohne` + (stand ? ` (bestätigt: ${stand.ohneWort})` : ''));

for (const x of ohneNummer) fehler.push(`diese Regel gibt es nicht: ${x}`);
if (process.argv.includes('--neu')) {
  fs.writeFileSync(STAND, JSON.stringify({ ohneWort: ohneWort.length,
    verweise: gesamt, regeln: REGELN.size,
    stellen: ohneWort.map(x => x.schluessel).sort() }, null, 2) + '\n');
  console.log(`    Stand neu bestätigt: ${ohneWort.length} Verweise ohne Stichwort`);
} else if (stand && ohneWort.length > stand.ohneWort) {
  /* Die Ratsche bleibt die ZAHL - daran aendert sich nichts. Neu ist
     nur, dass der Bericht die richtige Stelle nennen kann. */
  const bekannt = new Set(stand.stellen || []);
  const neu = ohneWort.filter(x => !bekannt.has(x.schluessel));
  const wieviel = ohneWort.length - stand.ohneWort;
  fehler.push(`${ohneWort.length} Verweise ohne Stichwort, bestätigt sind ${stand.ohneWort} — `
    + `die ${wieviel} neuen: `
    + (stand.stellen
       ? (neu.length ? neu.slice(0, 3).map(x => x.text).join(' · ')
          /* Die Zahl ist gestiegen, und trotzdem ist keine Stelle neu:
             dann steht dieselbe Zeile jetzt oefter da. */
          : 'dieselbe Zeile steht jetzt mehrfach — ' + ohneWort
              .filter(x => ohneWort.filter(y => y.schluessel === x.schluessel).length > 1)
              .slice(0, 3).map(x => x.wo).join(' · '))
       : ohneWort.slice(stand.ohneWort).slice(0, 3).map(x => x.text).join(' · ')
         + ' — GERATEN: der bestätigte Stand hält keine Stellen, `npm run regeln -- --neu`'
         + ' trägt sie nach'));
}

if (fehler.length) {
  console.log('');
  for (const f of fehler.slice(0, 40)) console.log(`  ✗ ${f}`);
  if (fehler.length > 40) console.log(`  … und ${fehler.length - 40} weitere`);
  console.log(`\n  regeln ROT: ${fehler.length} Verweise zeigen ins Leere.\n`);
  process.exit(1);
}
console.log('\n  regeln grün: jeder Verweis zeigt auf die Regel, die er meint.\n');
