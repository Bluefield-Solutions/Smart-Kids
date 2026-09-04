// Tor `anker`.
//
// Es prueft die NACHFRAGE der Gegenproben — und zwar die, die auf das
// GEBAUTE Buendel zeigt.
//
// Jede Gegenprobe hat zwei Haelften: den Eingriff (`such`/`ersatz`) und
// die Nachfrage (`an`), die sagt, woran man erkennt, dass er angekommen
// ist. Fuer den Eingriff prueft `inhalt` laengst, dass er genau einmal
// greift. Fuer die Nachfrage auch — aber nur, solange sie auf eine
// QUELLDATEI zeigt: `dist/index.html` ist dort ausdruecklich ausgenommen,
// weil `inhalt` VOR dem Bau laeuft und die Datei da noch nicht steht (oder
// alt ist, was schlimmer waere).
//
// Genau in diese Luecke ist eine Probe gefallen. „Grönland ist wieder nur
// Umgebung" fragte: steht „Grönland" nach dem Eingriff nicht mehr im
// Buendel? Seit D3 steht es dort immer — der Satz zum Mitnehmen nennt das
// Land. Der Eingriff kam an, die Nachfrage sagte nein, und die Probe
// bewies nichts. Gefunden hat es der volle Probenlauf, nach 150 Minuten.
//
// Dieses Tor findet denselben Fall in einer halben Sekunde. Es laeuft
// deshalb NACH `bauen`: vorher gaebe es nichts zu lesen.
//
// Zwei Fragen, und beide sind einfach:
//
//   `an.fehlt`  Der Text muss GENAU EINMAL im Buendel stehen. Steht er
//               oefter, entfernt der Eingriff nur eine Stelle und die
//               Nachfrage kann nie zutreffen. Steht er gar nicht, trifft
//               sie schon ohne Eingriff zu — dann bezeugt sie nichts.
//   `an.text`   Der Text darf im Buendel NICHT stehen. Steht er schon da,
//               ist „der Eingriff ist angekommen" wahr, bevor irgendetwas
//               passiert ist.
//
// Beides ist Regel 1 in ihrer knappsten Form: eine Nachfrage, deren
// Antwort feststeht, prueft nichts.
import fs from 'node:fs';
import { PROBEN } from './proben-liste.mjs';

const fehler = [];
const BUENDEL = 'dist/index.html';

console.log('\n  Tor `anker`');

if (!fs.existsSync(BUENDEL)) {
  console.log(`\n  anker ROT: ${BUENDEL} gibt es nicht — dieses Tor läuft nach `
    + '`bauen`, und ohne das Bündel kann es nichts lesen.\n');
  process.exit(1);
}
const buendel = fs.readFileSync(BUENDEL, 'utf8');

/* Gezaehlt wird gegen die Zahl der Proben, die WIRKLICH auf das Buendel
   zeigen — nicht gegen eine hingeschriebene. Sonst ist die Pruefung mit
   einem `continue` an der falschen Stelle abzuschalten, und die Zeile
   unten schriebe eine Null, die wie eine Auskunft aussieht. */
const aufsBuendel = PROBEN.filter(p => p.an && (p.an.datei || p.datei) === BUENDEL);
let gesehen = 0;

/* Wieviele Stellen NIMMT der Eingriff dem Text weg?
 *
 * Ohne diese Frage waere die Pruefung zu streng. „ein Fehlwurf bleibt
 * stumm" schneidet einen ganzen Block heraus, in dem „Lass es auf dem Land
 * los." ZWEIMAL steht - einmal auf dem Bildschirm, einmal gesprochen. Zwei
 * Stellen im Buendel sind dort also richtig, weil der Eingriff beide
 * mitnimmt. Der Unterschied zu Groenland ist nicht die Zahl, sondern die
 * HERKUNFT: dort kam die zweite Stelle aus einer ganz anderen Datei, und
 * die bleibt stehen.
 *
 * Gerechnet wird am Quelltext, ohne Bau: Eingriff anwenden, vorher und
 * nachher zaehlen. */
const nimmtWeg = (p, text) => {
  if (!p.datei || !fs.existsSync(p.datei)) return null;
  const alt = fs.readFileSync(p.datei, 'utf8');
  let neu;
  if (p.suchRegex) {
    const m = alt.match(p.suchRegex);
    if (!m) return null;
    neu = alt.replace(p.suchRegex, p.ersatzFn ? p.ersatzFn(m) : '');
  } else if (p.such !== undefined) {
    if (!alt.includes(p.such)) return null;
    neu = alt.replace(p.such, p.ersatz);
  } else return null;
  const vorher = alt.split(text).length - 1;
  /* Steht der Text im QUELLTEXT gar nicht, sagt diese Rechnung nichts.
     Der Bau schreibt vieles um: der Eintrag `{ a3:'GRL', name:'Grönland' }`
     wird im Buendel zu `"a3":"GRL","name":"Grönland"`, und eine Nachfrage,
     die auf die gebaute Form zeigt, ist voellig richtig - nur eben nicht
     am Quelltext nachzuzaehlen. Fuer die bleibt die Frage „steht er
     ueberhaupt da?" (Regel 5: gemessen wird, woran gemessen werden kann). */
  if (vorher === 0) return null;
  return vorher - (neu.split(text).length - 1);
};

for (const p of aufsBuendel) {
  gesehen++;
  if (p.an.fehlt !== undefined && !p.mehrfach) {
    const oft = buendel.split(p.an.fehlt).length - 1;
    const kurz = p.an.fehlt.replace(/\s+/g, ' ').slice(0, 44);
    const weg = nimmtWeg(p, p.an.fehlt);
    if (oft === 0)
      fehler.push(`„${p.n}": ihre Nachfrage verlangt, dass „${kurz}…" aus dem Bündel `
        + 'verschwindet — der Text steht dort schon jetzt nicht. Sie trifft ohne jeden '
        + 'Eingriff zu und bezeugt nichts');
    else if (weg !== null && oft > weg)
      fehler.push(`„${p.n}": ihre Nachfrage verlangt, dass „${kurz}…" aus dem Bündel `
        + `VERSCHWINDET — der Text steht dort ${oft}×, ihr Eingriff nimmt aber nur `
        + `${weg} davon weg. Die übrigen kommen woanders her und bleiben stehen; `
        + 'die Probe meldet für immer „kam nicht an"');
  }
  if (p.an.text !== undefined) {
    const oft = buendel.split(p.an.text).length - 1;
    if (oft > 0)
      fehler.push(`„${p.n}": ihre Nachfrage sucht „${p.an.text.replace(/\s+/g, ' ')
        .slice(0, 44)}…" im Bündel — der Text steht dort schon OHNE den Eingriff `
        + `(${oft}×). „Angekommen" ist damit wahr, bevor etwas passiert ist`);
  }
}

/* Und die Blindprobe unter dem Ganzen: findet dieses Tor gar keine Probe,
   die aufs Buendel zeigt, hat es nichts geprueft — und „keine Befunde"
   waere dann keine Auskunft, sondern ein Missverstaendnis. Gemessen: 78
   von 285 Proben fragen das Buendel. Fuenfzig ist die Grenze, unter der
   etwas nicht mehr stimmen kann. */
if (gesehen < 50)
  fehler.push(`nur ${gesehen} von ${PROBEN.length} Gegenproben fragen das Bündel — `
    + 'dann prüft dieses Tor fast nichts, und „keine Befunde" beweist nichts');

console.log(`    ${gesehen} Nachfragen ans gebaute Bündel geprüft `
  + `(von ${PROBEN.length} Gegenproben)`);
if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER:`);
  fehler.forEach(f => console.log(`    ✗ ${f}`));
  console.log('');
  process.exit(1);
}
console.log('\n  anker grün: jede Nachfrage ans Bündel kann etwas beweisen.\n');
