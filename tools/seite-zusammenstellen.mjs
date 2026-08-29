/* Stellt zusammen, was nach GitHub Pages geht.
 *
 * Pages kennt EINE Seite je Verzeichnis. Ausgeliefert wird trotzdem
 * zweierlei:
 *
 *     /            der Standardzweig - das, was durch die volle Torkette
 *                  gegangen ist. Dort spielen die Kinder.
 *     /vorschau/   der Zweig `vorschau`, nur durch die schnellen Tore,
 *                  mit dem Wort „Vorschau" unten links im Bild.
 *
 * Aufgerufen wird das IMMER aus dem Standardzweig heraus, von beiden
 * Abläufen: von der Auslieferung und vom Versand der Vorschau. Deshalb
 * braucht es keine Rolle mehr - die eine Hälfte liegt im Baum, die andere
 * wird aus ihrem Zweig geholt und in einem Nebenbaum gebaut.
 *
 * Der erste Entwurf hatte `--rolle=haupt|vorschau`, weil der Versand der
 * Vorschau aus IHREM Zweig heraus laufen sollte. Das ging nicht: die
 * Umgebung `github-pages` nimmt Auslieferungen nur aus dem Standardzweig
 * an. Der Zweig `vorschau` wird jetzt nur noch GEPRÜFT, versandt wird von
 * main aus - und damit gibt es die zweite Rolle nicht mehr. Eine
 * Verzweigung, die niemand nimmt, ist eine Verzweigung, die niemand prüft.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const WURZEL = process.cwd();
const SEITE = path.join(WURZEL, 'seite');
const DIST = path.join(WURZEL, 'dist');

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const still = (...a) => {
  try {
    execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return true;
  } catch { return false; }
};

/* Unter `/` darf nur, was auf dem Standardzweig steht.
 *
 * Das ist die Zusage, an der die ganze Auslieferung hängt: was rot ist,
 * geht nicht auf das iPhone der Kinder. Der Versand der Vorschau stellt
 * dieselbe Seite noch einmal zusammen - liefe er aus einem anderen Zweig,
 * käme Ungeprüftes unter `/`, ohne dass jemand es bemerkt.
 */
if (!still('rev-parse', '--verify', 'origin/main'))
  throw new Error('origin/main fehlt — ohne den Standardzweig lässt sich `/` nicht füllen');
if (!still('merge-base', '--is-ancestor', 'HEAD', 'origin/main'))
  throw new Error('HEAD liegt nicht auf `main` — unter `/` darf nur, was den '
    + 'Standardzweig passiert hat. Die Vorschau wird von `main` aus versandt.');

/* Die Marke auf der Vorschau.
 *
 * Sie wird in die GEBAUTE Seite gesetzt, nicht in die App. Ein Zweig im
 * Programm, den nur die Vorschau nimmt, wäre ein Stück Code, das kein Tor
 * je sieht - und das ausgelieferte Spiel trüge ihn ungenutzt mit.
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

/** Den Vorschauzweig in einen Nebenbaum holen und dort bauen. */
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

kopieren(DIST, SEITE, false);
console.log('  /            aus diesem Baum (volle Torkette)');

if (still('rev-parse', '--verify', 'origin/vorschau')) {
  kopieren(ausZweig('vorschau'), path.join(SEITE, 'vorschau'), true);
  console.log('  /vorschau/   aus origin/vorschau, mit Marke');
} else {
  console.log('  /vorschau/   entfällt — den Zweig `vorschau` gibt es nicht');
}

fs.rmSync(path.join(WURZEL, '.zweigbaum'), { recursive: true, force: true });
try { git('worktree', 'prune'); } catch { /* egal */ }
