// Die SCHNELLE Bahn.
//
// Was hier laeuft, laeuft bei jeder Aenderung. Was nicht hier laeuft,
// laeuft auf dem Runner, nachdem gestossen wurde - dort kostet es
// niemandes Zeit.
//
// Die Aufteilung ist gemessen, nicht geraten. Die ganze Kette dauerte
// 336 s, und 335 davon lagen im Browser:
//
//     smoke 163 · passt 54 · ziehen 48 · ansicht 43 · pwa 19 · lesbarkeit 9
//     inhalt 0,5 · spielprobe 0,1 · vergleich 0,1 · budget 0,1
//
// Und im Rauchtest wiederum:
//
//     durchgang 83 · ablage 38 · spielen 29 · regler 27 · ebene4 16 · tippen 2
//
// Hier stehen deshalb: alles, was nichts kostet, plus die ZWEI Tore, die
// am meisten fangen - der Rauchtest auf dem Hauptweg (spielt, legt ab,
// uebersteht einen Neustart) und der Bildvergleich. Beide zusammen, weil
// sie nebeneinander laufen: zwei Browser auf vier Kernen.
//
// Was ausdruecklich NICHT hier laeuft und warum:
//
//     passt        54 s. Faengt Ueberlauf auf sieben Groessen - wertvoll,
//                  aber nur wenn sich das Layout geaendert hat. Runner.
//     ziehen       48 s. Die Nachsicht beim Ziehen aendert sich fast nie.
//     durchgang    83 s. Spielt JEDE Ebene fuer beide Kinder. Das ist der
//                  gruendlichste Teil und der teuerste. Runner.
//     lesbarkeit,  Kontrast und PWA aendern sich nur mit den Marken bzw.
//     pwa/offline  dem Manifest. Runner.
//     proben       Die Gegenproben pruefen die TORE, nicht die App. Sie
//                  gehoeren in keine Runde: naechtlich auf dem Runner.
//
// Der Preis, ausgesprochen: ein Layoutfehler auf dem iPhone SE faellt
// hier nicht auf, sondern drei Minuten spaeter im Ablauf - nach dem
// Stossen. Unter `/` kommt trotzdem nichts Ungeprueftes an: die
// Auslieferung faehrt die volle Kette und schickt nur bei Gruen.
import { spawn } from 'node:child_process';

const t0 = Date.now();
const lauf = (befehl, args = []) => new Promise((fertig) => {
  const k = spawn(process.execPath, [befehl, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  let aus = '';
  k.stdout.on('data', d => aus += d);
  k.stderr.on('data', d => aus += d);
  k.on('close', code => fertig({ code, aus }));
});

const s = (ms) => `${(ms / 1000).toFixed(1)} s`;
const rot = (x) => `\x1b[31m${x}\x1b[0m`, gruen = (x) => `\x1b[32m${x}\x1b[0m`;

console.log('\n  Schnelle Bahn — was bei jeder Änderung läuft\n');

const befunde = [];
const melde = (name, r, ms) => {
  console.log(`    ${r.code === 0 ? gruen('grün') : rot('ROT ')}  ${name.padEnd(22)} ${s(ms)}`);
  if (r.code !== 0) befunde.push({ name, aus: r.aus });
};

// 1. Alles, was ohne Browser auskommt. Zusammen unter einer Sekunde.
for (const [name, datei] of [['inhalt (7 Prüfungen)', 'tor/inhalt.mjs'],
                             ['spielprobe', 'tor/spielprobe.mjs'],
                             ['vergleich', 'tor/vergleich.mjs']]) {
  const a = Date.now(); const r = await lauf(datei); melde(name, r, Date.now() - a);
  if (r.code !== 0) { console.log(r.aus.split('\n').slice(-14).join('\n')); process.exit(1); }
}

// 2. Bauen — alles Weitere prüft `dist/`, nicht die Quelle.
{ const a = Date.now(); const r = await lauf('prototyp/bauen.mjs'); melde('bauen', r, Date.now() - a);
  if (r.code !== 0) { console.log(r.aus.split('\n').slice(-14).join('\n')); process.exit(1); } }
{ const a = Date.now(); const r = await lauf('tor/budget.mjs'); melde('budget', r, Date.now() - a); }

// 3. Die zwei Browser-Tore NEBENEINANDER. Der Rechner hat vier Kerne;
//    zwei Chromium sättigen ihn nicht, drei schon (gemessen in der
//    Temporunde: die Parallelität brachte 1,5x, nicht 3x).
const a3 = Date.now();
/* Jedes Tor misst SEINE Dauer, nicht die der Gruppe.
 *
 * Im ersten Anlauf stand hier zweimal `Date.now() - a3` - beide Tore
 * meldeten damit dieselbe Zahl, naemlich die des langsameren. Ich haette
 * das kuerzere optimiert und es nicht gemerkt. Eine Zahl, die fuer zwei
 * Dinge gilt, gilt fuer keines (Regel 12). */
const mitZeit = async (name, datei, args) => {
  const a = Date.now(); const r = await lauf(datei, args); return { name, r, ms: Date.now() - a };
};
/* Drei Browser, nicht zwei.
 *
 * Der Bildvergleich war mit 42 s der Engpass - der Rauchtest brauchte 28
 * und wartete danach. Sechzehn Aufnahmen wissen nichts voneinander, also
 * laufen sie in zwei Haelften. Vier Kerne, drei Chromium: die Temporunde
 * hatte gemessen, dass das die Grenze ist. */
const beide = await Promise.all([
  mitZeit('Rauchtest (Hauptweg)', 'tor/smoke.mjs', ['--nur=spielen']),
  mitZeit('Bildvergleich (1/2)', 'tor/ansicht.mjs', ['--teil=0/2']),
  mitZeit('Bildvergleich (2/2)', 'tor/ansicht.mjs', ['--teil=1/2']),
]);
for (const x of beide) melde(x.name, x.r, x.ms);
/* Die zwei Haelften muessen ZUSAMMEN alle Aufnahmen abdecken.
 *
 * Ein Teillauf, der die Haelfte vergisst, meldet „gruen" - und niemand
 * sieht, worueber. Deshalb wird nachgezaehlt, statt es zu glauben. */
{
  const gezaehlt = beide.filter(x => /Bildvergleich/.test(x.name))
    .map(x => (x.r.aus.match(/(\d+) grün, (\d+) neu, (\d+) rot/) || []).slice(1, 4)
      .reduce((n, z) => n + (+z || 0), 0))
    .reduce((n, z) => n + z, 0);
  const soll = +((beide.find(x => /1\/2/.test(x.name))?.r.aus
    .match(/der (\d+) Aufnahmen/) || [])[1] || 0);
  if (soll && gezaehlt !== soll) {
    console.log(`\n  ${rot('✗')} Bildvergleich: ${gezaehlt} von ${soll} Aufnahmen geprüft — `
      + 'die Teile decken zusammen nicht alles ab.');
    process.exit(1);
  }
  if (soll) console.log(`    ${''.padEnd(6)}${'geprüfte Aufnahmen'.padEnd(22)} ${gezaehlt} von ${soll}`);
}
console.log(`    ${''.padEnd(6)}${'nebeneinander'.padEnd(22)} ${s(Date.now() - a3)} statt `
  + `${s(beide.reduce((n, x) => n + x.ms, 0))} nacheinander`);

console.log('');
if (befunde.length) {
  for (const b of befunde) {
    console.log(`  ${rot('✗')} ${b.name}:`);
    console.log(b.aus.split('\n').filter(z => /✗|FEHLER|ROT|Timeout/.test(z))
      .slice(0, 8).map(z => '      ' + z.trim()).join('\n') || '      (siehe oben)');
  }
  console.log(`\n  schnell ROT nach ${s(Date.now() - t0)}.\n`);
  process.exit(1);
}
console.log(`  schnell grün nach ${s(Date.now() - t0)}. `
  + 'Der Rest läuft auf dem Runner — `npm run tor` fährt ihn hier.\n');
