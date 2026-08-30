// Tor `vergleich` - das wichtigste, und das einzige, das sich in K1 selbst
// gemessen haette.
//
// Zwei Zahlen, nicht eine:
//   TREFFERQUOTE       wieviel von dem, was gemeint war, wird angenommen
//   FALSCH-POSITIV     wieviel von dem, was NICHT gemeint war, auch
//
// Ohne die zweite ist die Pruefung wertlos: ein Abgleich, der alles annimmt,
// hat 100 % Trefferquote und lehrt nichts.
//
// Und zwei Haelften, nicht eine: die ERFUNDENE zum Einstellen, die
// EINGEFRORENE aus echten Aufnahmen zum Beweisen. Solange die zweite fehlt,
// gilt hier KEINE Zielzahl - das Tor sagt das ausdruecklich, statt eine
// Zahl zu melden, die nichts bezeugt.
import fs from 'node:fs';
import path from 'node:path';
import { abgleich } from '../src/vergleich/vergleich.js';
import * as I from '../src/inhalt/erdkunde.js';
import { STAEDTE } from '../src/geo/staedte.js';

const ZIEL_TREFFER = 0.90, ZIEL_FALSCH = 0.02;

/** Alle Gebiete als Kandidaten, mit Aliassen und Aussprachevarianten. */
const ALLE = [
  ...I.KONTINENTE.map(k => ({ id:k.id, name:k.name, aliasse:k.aliasse, aussprache:k.aussprache })),
  ...Object.values(I.LAENDER).flat().map(l => ({ id:l.a3, name:l.name, aliasse:l.aliasse, aussprache:l.aussprache })),
  ...STAEDTE.map(s => ({ id:s.id, name:s.name, aliasse:[], aussprache:[] })),
];
const nachId = new Map(ALLE.map(k => [k.id, k]));

/* Die Kandidatenmenge einer Aufgabe - so, wie sie im SPIEL entsteht.
 *
 * Vorher: „das Ziel plus die ersten sechs Geschwister aus der Gesamtliste".
 * Fuer ein Land hiess das oft: sechs Laender von anderen Kontinenten. Im
 * Spiel stehen aber die Laender DESSELBEN Kontinents zur Wahl - und genau
 * dort sitzen die gefaehrlichen Paare: Uruguay neben Paraguay, Sudan
 * neben Suedafrika. Eine Messung an einer Menge, die es nicht gibt, misst
 * die falsche Aufgabe (Regel 12).
 */
const KONT_VON = new Map(Object.entries(I.LAENDER)
  .flatMap(([k, l]) => l.map(x => [x.a3, k])));
function menge(zielId) {
  const ziel = nachId.get(zielId);
  if (!ziel) throw new Error(`Unbekannte ID im Korpus: ${zielId}`);
  const kont = KONT_VON.get(zielId);
  if (kont) return I.LAENDER[kont].map(l => ({ id:l.a3, name:l.name,
    aliasse:l.aliasse, aussprache:l.aussprache }));
  const geschwister = ALLE.filter(k => k.id !== zielId
    && ((zielId.startsWith('DE-')) === (k.id.startsWith('DE-'))));
  return [ziel, ...geschwister.slice(0, 6)];
}

function pruefe(korpus, name) {
  let treffer = 0, trefferGes = 0, rueckfragen = 0;
  const verfehlt = [];
  for (const [zielId, eingaben] of korpus.treffer || []) {
    const kand = menge(zielId);
    for (const e of eingaben) {
      trefferGes++;
      const r = abgleich(e, kand);
      if (r.id === zielId && r.art === 'angenommen') treffer++;
      else if (r.id === zielId && r.art === 'rueckfrage') { treffer++; rueckfragen++; }
      else verfehlt.push(`${e} → ${r.art}${r.name ? ' ('+r.name+')' : ''}, erwartet ${zielId}`);
    }
  }
  let falsch = 0, falschGes = 0;
  const durchgerutscht = [];
  for (const [zielId, eingaben] of korpus.nichttreffer || []) {
    const kand = menge(zielId);
    for (const e of eingaben) {
      falschGes++;
      const r = abgleich(e, kand);
      if (r.id === zielId && r.art === 'angenommen') { falsch++; durchgerutscht.push(`${e} → ${zielId}`); }
    }
  }
  return { name, treffer, trefferGes, quote: treffer/trefferGes,
           rueckfragen, falsch, falschGes, rate: falsch/falschGes, verfehlt, durchgerutscht };
}

const erfunden = JSON.parse(fs.readFileSync(new URL('./korpus/erfunden.json', import.meta.url)));
const eingefrorenPfad = new URL('./korpus/eingefroren.json', import.meta.url);
const hatEingefroren = fs.existsSync(eingefrorenPfad);

const laeufe = [pruefe(erfunden, 'erfunden')];
if (hatEingefroren)
  laeufe.push(pruefe(JSON.parse(fs.readFileSync(eingefrorenPfad)), 'eingefroren'));

let rot = 0;
for (const r of laeufe) {
  const gilt = r.name === 'eingefroren';
  console.log(`\n  Korpus »${r.name}«${gilt ? '  — DIESE ZAHLEN GELTEN' : '  (nur zum Einstellen)'}`);
  console.log(`    Trefferquote      ${(r.quote*100).toFixed(1).padStart(5)} %   `
    + `(${r.treffer}/${r.trefferGes}, davon ${r.rueckfragen} als Rückfrage)`);
  console.log(`    Falsch-Positiv    ${(r.rate*100).toFixed(1).padStart(5)} %   (${r.falsch}/${r.falschGes})`);
  if (r.verfehlt.length) { console.log('    verfehlt:'); r.verfehlt.forEach(v=>console.log('      · '+v)); }
  if (r.durchgerutscht.length) { console.log('    durchgerutscht:'); r.durchgerutscht.forEach(v=>console.log('      ✗ '+v)); }
  /* Eine RATSCHE, keine Zielzahl.
   *
   * Auf der erfundenen Haelfte gilt keine Prozentgrenze - wer den Korpus
   * schreibt und den Abgleich einstellt, ist Pruefling und Pruefer
   * zugleich. Was aber gilt: es darf nicht MEHR durchrutschen als heute.
   * Ein Prozentsatz taugt dafuer nicht; er sinkt schon dadurch, dass der
   * Korpus waechst. Also steht die eine bekannte Ausnahme namentlich da,
   * und alles andere ist rot.
   *
   * „aussen → asien" rutscht seit K1 durch: vier Buchstaben, gleicher
   * Klang, gleiche Laenge. Sie steht hier, damit sie nicht vergessen
   * wird - nicht, weil sie in Ordnung waere. */
  const BEKANNT = ['aussen → asien'];
  const neuDurch = r.durchgerutscht.filter(v => !BEKANNT.includes(v));
  if (neuDurch.length) {
    console.log(`    ROT: ${neuDurch.length} davon ${neuDurch.length===1?'ist':'sind'} neu — `
      + `bekannt war nur „${BEKANNT.join('", „')}"`);
    rot++;
  }
  if (gilt) {
    if (r.quote < ZIEL_TREFFER) { console.log(`    ROT: unter ${ZIEL_TREFFER*100} % Trefferquote`); rot++; }
    if (r.rate > ZIEL_FALSCH)   { console.log(`    ROT: über ${ZIEL_FALSCH*100} % Falsch-Positiv`); rot++; }
  }
}

/* Jede Aussprachevariante wird gegengehoert - alle, nicht nur die im Korpus.
 *
 * Der Anlass: R5 hat 35 Laender dazugelegt (Rang 6 bis 12), jedes mit
 * zwei erfundenen Aussprachevarianten. Im Korpus stand davon nichts, und
 * damit war keine einzige je durch den Abgleich gelaufen. Eine Variante,
 * die der Abgleich nicht annimmt, ist umsonst erfunden; eine, die er dem
 * FALSCHEN Land zuschlaegt, ist schlimmer als keine.
 *
 * Das laesst sich ohne Korpus pruefen, weil beides aus den Daten selbst
 * folgt: jede Form eines Gebiets - Name, Alias, Variante - muss in der
 * Menge ihres Kontinents auf ihr eigenes Gebiet fallen. Der erfundene
 * Korpus bleibt daneben stehen; er prueft das MISSLINGEN, diese Stelle
 * das Gelingen.
 */
{
  let n = 0; const falsch = [];
  for (const [kont, liste] of Object.entries(I.LAENDER)) {
    const kand = liste.map(l => ({ id:l.a3, name:l.name,
      aliasse:l.aliasse, aussprache:l.aussprache }));
    for (const l of liste)
      for (const f of [l.name, ...(l.aliasse||[]), ...(l.aussprache||[])]) {
        n++;
        const r = abgleich(f, kand);
        if (r.id === l.a3 && r.art !== 'nochmal') continue;
        falsch.push(r.id && r.id !== l.a3
          ? `${kont}: „${f}" gehört zu ${l.name}, angenommen wurde ${r.name}`
          : `${kont}: „${f}" (${l.name}) wird gar nicht angenommen — ${r.art}`);
      }
  }
  console.log(`\n  Alle Formen aus den Daten: ${n} geprüft`
    + ` (Name, Alias, Aussprache · ${Object.keys(I.LAENDER).length} Kontinente)`);
  if (falsch.length) {
    console.log(`    ROT: ${falsch.length} Form${falsch.length===1?'':'en'} fällt durch:`);
    falsch.slice(0, 8).forEach(v => console.log('      ✗ ' + v));
    rot++;
  } else {
    console.log('    jede fällt auf ihr eigenes Gebiet');
  }
}

if (!hatEingefroren) {
  console.log('\n  Die eingefrorene Hälfte fehlt noch — sie entsteht aus echten Aufnahmen');
  console.log('  in M4. Bis dahin gilt hier KEINE Zielzahl. Die Zahlen oben sagen, dass');
  console.log('  der Abgleich eingestellt ist, nicht dass er trägt.');
  // Eine offensichtliche Fehlfunktion faengt das Tor trotzdem: ein Abgleich,
  // der alles annimmt, faellt hier durch.
  const r = laeufe[0];
  if (r.rate > 0.20) { console.log(`\n  ROT: ${(r.rate*100).toFixed(0)} % Falsch-Positiv schon auf der erfundenen Hälfte.`); rot++; }
  if (r.quote < 0.60) { console.log(`\n  ROT: ${(r.quote*100).toFixed(0)} % Trefferquote schon auf der erfundenen Hälfte.`); rot++; }
}
if (rot) process.exit(1);
