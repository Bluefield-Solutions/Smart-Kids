/* Stellt zusammen, was nach GitHub Pages geht.
 *
 * Pages kennt EINE Seite je Verzeichnis. Ausgeliefert wird trotzdem
 * zweierlei:
 *
 *     /            das, was durch die volle Torkette gegangen ist
 *     /vorschau/   der Zweig `vorschau`, nur durch die schnellen Tore
 *
 * Der springende Punkt ist, dass BEIDE Abläufe beides zusammenstellen. Täte
 * es nur einer, würde die jeweils andere Auslieferung die fremde Hälfte
 * löschen - die Vorschau setzte das Spiel der Kinder auf einen älteren
 * Stand zurück, oder die nächste Auslieferung räumte die Vorschau weg,
 * während jemand sie gerade ansieht.
 *
 * Aufruf:
 *   node tools/seite-zusammenstellen.mjs --rolle=haupt
 *   node tools/seite-zusammenstellen.mjs --rolle=vorschau
 *
 * `--rolle` sagt, welche Hälfte im aktuellen Baum schon gebaut ist. Die
 * andere wird aus dem Zweig geholt und dort gebaut. Fehlt der andere Zweig,
 * fehlt eben diese Hälfte - laut gemeldet, nicht still.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROLLE = (process.argv.find(a => a.startsWith('--rolle=')) || '').split('=')[1];
if (ROLLE !== 'haupt' && ROLLE !== 'vorschau') {
  console.error('  --rolle=haupt oder --rolle=vorschau');
  process.exit(2);
}

const WURZEL = process.cwd();
const SEITE = path.join(WURZEL, 'seite');
const DIST = path.join(WURZEL, 'dist');

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
// `stdio: pipe` auch fuer stderr: `rev-parse --verify` auf einen Zweig, den
// es nicht gibt, schreibt „fatal: Needed a single revision" ins Protokoll.
// Das ist hier kein Fehler, sondern die Antwort - und im Ablaufprotokoll
// sieht es aus wie einer.
const gibtZweig = (name) => {
  try {
    execFileSync('git', ['rev-parse', '--verify', `origin/${name}`],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return true;
  } catch { return false; }
};

/* Die Marke auf der Vorschau.
 *
 * Sie wird in die GEBAUTE Seite gesetzt, nicht in die App. Ein Zweig im
 * Programm, den nur die Vorschau nimmt, wäre ein Stück Code, das kein Tor
 * je sieht - und das ausgelieferte Spiel trüge ihn ungenutzt mit. So ist
 * die Marke genau dort, wo die Vorschau liegt, und nirgends sonst.
 *
 * `pointer-events:none`, damit sie nichts abfängt, und unten links: oben
 * links sitzt der Schließen-Knopf, oben rechts die Sterne.
 */
const MARKE = `<div id="vorschaumarke">Vorschau</div><style>
#vorschaumarke{position:fixed;z-index:9999;pointer-events:none;
  left:calc(var(--sicher-links) + 8px); bottom:calc(var(--sicher-unten) + 8px);
  font-family:var(--f-ui); font-size:11px; font-weight:700; letter-spacing:.08em;
  text-transform:uppercase; color:var(--tinte-3); background:var(--papier);
  border:1px solid var(--linie); border-radius:var(--rund-voll);
  padding:4px 9px; opacity:.9}
</style>`;

function kopieren(von, nach, marke) {
  fs.mkdirSync(nach, { recursive: true });
  fs.cpSync(von, nach, { recursive: true });
  if (!marke) return;
  const seite = path.join(nach, 'index.html');
  const t = fs.readFileSync(seite, 'utf8');
  if (!t.includes('</body>')) throw new Error('index.html hat kein </body> — Marke nicht setzbar');
  fs.writeFileSync(seite, t.replace('</body>', MARKE + '</body>'));
}

/** Den anderen Zweig in einen Nebenbaum holen und dort bauen. */
function ausZweig(zweig) {
  const baum = path.join(WURZEL, '.zweigbaum');
  fs.rmSync(baum, { recursive: true, force: true });
  git('worktree', 'prune');
  git('worktree', 'add', '--detach', baum, `origin/${zweig}`);
  // Die Abhängigkeiten stehen schon im Hauptbaum. Ein zweites `npm ci`
  // kostet mehr als der ganze Bau.
  fs.symlinkSync(path.join(WURZEL, 'node_modules'), path.join(baum, 'node_modules'), 'dir');
  execFileSync(process.execPath, ['prototyp/bauen.mjs'], { cwd: baum, stdio: 'inherit' });
  return path.join(baum, 'dist');
}

fs.rmSync(SEITE, { recursive: true, force: true });
fs.mkdirSync(SEITE, { recursive: true });

if (ROLLE === 'haupt') {
  kopieren(DIST, SEITE, false);
  console.log('  /            aus diesem Baum (volle Torkette)');
  if (gibtZweig('vorschau')) {
    kopieren(ausZweig('vorschau'), path.join(SEITE, 'vorschau'), true);
    console.log('  /vorschau/   aus origin/vorschau, mitgenommen');
  } else {
    console.log('  /vorschau/   entfällt — den Zweig `vorschau` gibt es nicht');
  }
} else {
  kopieren(DIST, path.join(SEITE, 'vorschau'), true);
  console.log('  /vorschau/   aus diesem Baum (nur die schnellen Tore)');
  if (gibtZweig('main')) {
    kopieren(ausZweig('main'), SEITE, false);
    console.log('  /            aus origin/main, unverändert mitgenommen');
  } else {
    throw new Error('origin/main fehlt — die Vorschau würde das ausgelieferte Spiel löschen');
  }
}

fs.rmSync(path.join(WURZEL, '.zweigbaum'), { recursive: true, force: true });
try { git('worktree', 'prune'); } catch { /* egal */ }
