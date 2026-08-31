// Tor `doppelt`.
//
// „Was zweimal dasteht, veraltet einmal." Das ist Regel 6, und dieses
// Verzeichnis hat sie in einer einzigen Sitzung VIERMAL bezahlt:
//
//   pfadZuPolys         in geo-backen, backen-staedte, inhalt UND bauen.
//                       Drei Fassungen kannten Loecher, eine nicht - und
//                       die eine gab Brandenburg seinen Anker mitten in
//                       Berlin (F16, F17).
//   filter(x => x.rang) in bauen, inhalt und spielprobe: alle drei
//                       fragten den GEBACKENEN Rang. Als fuenf Nachbarn
//                       einen bekamen, baute der Bau stur sechzig Laender,
//                       und ein Tor meldete „hat keine Flaeche" (D2c).
//   die Rangpruefung    zweimal dieselbe Erwartung, in inhalt und in
//                       spielprobe - beide fielen zusammen um (D2c).
//   MIN_PT / MIN_REST   im Spiel und noch einmal in dem Tor, das sie prueft.
//
// Jedes Mal derselbe Befund: eine Fassung wurde gepflegt, die andere galt,
// und niemand sah den Unterschied. Ein Tor, das doppelte Wahrheiten
// MELDET, ist billiger als der fuenfte Fund.
//
// WAS ES NICHT KANN: es findet den TEXT, nicht die Absicht. Zwei Stellen,
// die dasselbe tun, aber verschieden geschrieben sind, entgehen ihm. Das
// steht hier, damit ihm niemand mehr zutraut, als er halten kann.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ERLAUBT = 'tor/doppelt-erlaubt.json';
const NEU = process.argv.includes('--neu');

/* So viele Token muessen sich decken.
 *
 * Geeicht, nicht gewaehlt - und geeicht an der Vergangenheit. Gemessen am
 * Baum von 55950e4, also VOR F17, als `pfadZuPolys` noch dreimal dastand:
 *
 *     Fenster   Befunde heute   findet pfadZuPolys von damals
 *        40          84                     ja
 *        50          53                     ja
 *        80          25                     ja
 *       100          16                     ja
 *       120          11                    NEIN
 *
 * 100 ist also das groesste Fenster, das den Fall noch faengt, fuer den
 * dieses Tor gebaut ist - und damit das leiseste. Wer es hoeher dreht,
 * dreht genau den Befund weg, der die Runde F16/F17 gekostet hat.
 *
 * Regel 1, umgekehrt angewandt: die Schwelle wurde nicht danach gewaehlt,
 * wie ruhig sie ist, sondern danach, ob sie den bekannten Fehler noch
 * sieht. */
const FENSTER = 100;

const VERZEICHNISSE = ['src', 'tools', 'tor', 'prototyp', 'entwuerfe'];
const AUSSEN = ['node_modules', 'geo', 'vorbilder', 'abweichungen', 'korpus'];
const fehler = [], hinweise = [];

/** Alle Quelldateien - ohne das Gebackene und ohne das Gebaute. */
function dateien(wo, aus = []) {
  for (const n of fs.readdirSync(wo, { withFileTypes: true })) {
    const p = path.join(wo, n.name);
    if (n.isDirectory()) { if (!AUSSEN.includes(n.name)) dateien(p, aus); continue; }
    if (!/\.(mjs|js)$/.test(n.name)) continue;
    // Datenberge, keine Logik: „ERZEUGT von ..." steht in ihrer ersten Zeile.
    if (/ERZEUGT von/.test(fs.readFileSync(p, 'utf8').slice(0, 200))) continue;
    aus.push(p);
  }
  return aus;
}

/* --- Normieren -------------------------------------------------------- *
 *
 * Gemessen wird in TOKEN, nicht in Zeilen - und das ist keine Feinheit,
 * sondern der Unterschied zwischen einem Tor, das anschlaegt, und einem,
 * das nichts findet.
 *
 * Der erste Anlauf verglich normierte ZEILEN. Er fand fuenfzehn
 * Dopplungen und ausgerechnet die vier nicht, fuer die er gebaut ist. Der
 * Grund stand sofort da, als ich die drei Fassungen von `pfadZuPolys`
 * nebeneinander normiert habe:
 *
 *   bauen.mjs           const #=#.#(§); if(!#) continue;
 *   backen-staedte.mjs  const # = #.#(§);
 *                       if (!#) continue;
 *
 * Dieselbe Sache, einmal auf einer Zeile, einmal auf zweien. Wer eine
 * Kopie anlegt, formatiert sie um - und ein zeilenweiser Vergleich
 * scheitert daran, ohne es zu merken.
 *
 * Bezeichner werden zu `#`, Zahlen zu `0`, Zeichenketten zu `§`.
 * Schluesselwoerter bleiben stehen: sonst sehen `for` und `if` gleich aus,
 * und jede Schleife deckt sich mit jeder anderen.
 */
const WORT = new Set(['const','let','var','function','return','if','else','for','while','of','in',
  'new','await','async','class','extends','try','catch','finally','throw','typeof','instanceof',
  'null','undefined','true','false','this','import','export','from','default','break','continue',
  'switch','case','do','delete','void','yield','static','get','set']);

/** Datei -> Folge von { t: Token, nr: Zeile }. */
function tokens(text) {
  // Blockkommentare raus, aber die Zeilenumbrueche behalten - sonst zeigen
  // alle Fundstellen dahinter auf die falsche Zeile.
  const ohne = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const aus = [];
  ohne.split('\n').forEach((z, i) => {
    let l = z.replace(/(^|[^:])\/\/.*$/, '$1');
    l = l.replace(/`[^`]*`|'[^']*'|"[^"]*"/g, '§');
    l = l.replace(/\/(?![*/])(?:[^/\\\n]|\\.)+\/[gimsuy]*/g, '§');
    for (const m of l.matchAll(/[A-Za-zÀ-ÿ_$][\w$]*|\d+(?:\.\d+)?|§|\S/g)) {
      const w = m[0];
      aus.push({ nr: i + 1,
        t: /^[A-Za-zÀ-ÿ_$]/.test(w) ? (WORT.has(w) ? w : '#') : /^\d/.test(w) ? '0' : w });
    }
  });
  return aus;
}

const alle = VERZEICHNISSE.filter(fs.existsSync).flatMap(d => dateien(d));
const strom = new Map();
for (const f of alle) strom.set(f, tokens(fs.readFileSync(f, 'utf8')));

/* --- Fenster hashen --------------------------------------------------- */
const treffer = new Map();
for (const [f, ts] of strom) {
  for (let i = 0; i + FENSTER <= ts.length; i++) {
    const von = ts[i].nr, bis = ts[i + FENSTER - 1].nr;
    // Ein Fenster, das auf EINER Zeile liegt, ist eine lange Zeile und
    // kein Zwilling - etwa eine Tabelle mit Zahlen.
    if (bis - von < 2) continue;
    const h = crypto.createHash('sha1')
      .update(ts.slice(i, i + FENSTER).map(x => x.t).join(' ')).digest('hex').slice(0, 16);
    if (!treffer.has(h)) treffer.set(h, []);
    treffer.get(h).push({ datei: f, von, bis, i });
  }
}

/* --- Zu Gruppen zusammenziehen ---------------------------------------- *
 *
 * Ein achtzigzeiliger Zwilling waere sonst dreissig Funde. Was sich
 * ueberlappt, ist EIN Befund.
 */
const roh = [];
for (const [, orte] of treffer) {
  if (orte.length < 2) continue;
  // Zwei Fenster in DERSELBEN Datei, die sich ueberlappen, sind ein
  // Fenster mit sich selbst - kein Fund.
  const echt = orte.filter((o, k) => orte.some((p, j) =>
    j !== k && (p.datei !== o.datei || Math.abs(p.i - o.i) >= FENSTER)));
  if (echt.length < 2) continue;
  roh.push(echt);
}
const gruppen = [];
for (const orte of roh.sort((a, b) => a[0].i - b[0].i)) {
  const schluessel = [...new Set(orte.map(o => o.datei))].sort().join(' · ');
  const passend = gruppen.find(g => g.schluessel === schluessel && g.orte.some(o =>
    orte.some(n => n.datei === o.datei && n.i > o.i && n.i <= o.iBis + FENSTER)));
  if (passend) {
    for (const n of orte) {
      const o = passend.orte.find(x => x.datei === n.datei
        && n.i >= x.i && n.i <= x.iBis + FENSTER);
      if (o) { o.bis = Math.max(o.bis, n.bis); o.iBis = Math.max(o.iBis, n.i); }
    }
  } else gruppen.push({ schluessel, orte: orte.map(o => ({ ...o, iBis: o.i })) });
}
// Je Dateipaar zaehlt der groesste Befund. Ein Paar, das an drei Stellen
// doppelt, ist EIN Eintrag in der Liste - sonst pflegt sie niemand.
const paare = new Map();
for (const g of gruppen) {
  /* Gezaehlt werden TOKEN, nicht Zeilen.
   *
   * Der erste Anlauf meldete die Zeilenspanne - und die zaehlt Kommentare
   * mit, die dazwischenstehen. Als ich Mulberry32 im Spiel zusammengelegt
   * und einen erklaerenden Absatz darueber geschrieben habe, meldete das
   * Tor prompt „von 5 auf 33 Zeilen gewachsen": es war nichts gewachsen
   * ausser meiner Erklaerung. Eine Zahl, die auf Kommentare anschlaegt,
   * erzieht dazu, keine zu schreiben. */
  const n = Math.max(...g.orte.map(o => o.iBis - o.i + FENSTER));
  const da = paare.get(g.schluessel);
  if (!da || n > da.token) paare.set(g.schluessel, { ...g, token: n });
}
const befunde = [...paare.values()].sort((a, b) => b.token - a.token);

/* --- Urteilen --------------------------------------------------------- */
console.log('\n  Tor `doppelt`   (was zweimal dasteht, veraltet einmal)\n');

if (NEU) {
  fs.writeFileSync(ERLAUBT, JSON.stringify(befunde.map(g => ({
    dateien: g.schluessel, token: g.token,
    wo: g.orte.map(o => `${o.datei}:${o.von}`),
    warum: 'NOCH NICHT BEGRÜNDET — hier hingehört ein Satz, warum es zweimal dastehen darf',
  })), null, 2) + '\n');
  console.log(`  ${befunde.length} Dopplungen in ${ERLAUBT} festgehalten.\n`);
  process.exit(0);
}

const erlaubt = fs.existsSync(ERLAUBT) ? JSON.parse(fs.readFileSync(ERLAUBT, 'utf8')) : [];
const nach = new Map(erlaubt.map(e => [e.dateien, e]));
const gesehen = new Set();

for (const g of befunde) {
  const e = nach.get(g.schluessel);
  const wo = g.orte.map(o => `${o.datei}:${o.von}`).join(' · ');
  if (!e) {
    fehler.push(`${g.token} Token stehen zweimal — ${wo}. Entweder zusammenlegen, oder in `
      + `${ERLAUBT} eintragen und HINSCHREIBEN, warum es zweimal dastehen darf`);
    continue;
  }
  gesehen.add(g.schluessel);
  if (/NOCH NICHT BEGRÜNDET/.test(e.warum))
    fehler.push(`die Dopplung ${wo} steht in ${ERLAUBT}, aber ohne Begründung — `
      + 'ein Eintrag ohne Satz ist ein Freibrief, kein Beschluss');
  else if (g.token > e.token + 10)
    fehler.push(`die eingetragene Dopplung „${e.warum.slice(0, 48)}…" ist von ${e.token} `
      + `auf ${g.token} Token gewachsen — ${wo}`);
  else console.log(`      ${String(g.token).padStart(4)} Token  ${wo}\n`
    + `                  ${e.warum}`);
}
for (const e of erlaubt)
  if (!gesehen.has(e.dateien))
    hinweise.push(`der Eintrag „${e.dateien}" findet keine Dopplung mehr — er kann weg`);

console.log(`\n    ${alle.length} Quelldateien · ${[...strom.values()]
  .reduce((a, t) => a + t.length, 0)} Token · ${befunde.length} Dopplungen `
  + `ab ${FENSTER} Token, ${erlaubt.length} davon eingetragen`);
hinweise.forEach(h => console.log(`\n  Hinweis: ${h}`));
if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER:`);
  fehler.forEach(f => console.log(`    ✗ ${f}`));
  console.log('');
  process.exit(1);
}
console.log('\n  doppelt grün: keine ungeklärte Dopplung.\n');
