/* Alle Zeichnungen auf EIN Blatt - zum Ansehen, nicht zum Messen.
 *
 * Aufruf:
 *   npm run bilderblatt              beide Blätter schreiben
 *   npm run bilderblatt -- --quer    nur das im Zielformat
 *   npm run bilderblatt -- --lang    nur das in der langen Form
 *
 * ---------------------------------------------------------------------
 * WARUM ES DAS GIBT
 *
 * Die Zeichnung zu „tea" war kaputt: der Henkel saß zwei Einheiten
 * neben der Tasse, die Untertasse war ein grauer Balken. Sie stand so
 * seit E4 in den Daten, und kein Tor hat es gemeldet - `inhalt` prueft
 * Motive, Blattgroessen und Aehnlichkeit, nicht Handwerk. Aufgefallen
 * ist sie, weil sie ZUFAELLIG auf einem Abnahmebild stand: eine von
 * vier Antwortkarten in `quer-lesen`.
 *
 * SIEBENUNDSECHZIG der sechsundachtzig Zeichnungen stehen auf keinem
 * einzigen Vorbild. Wer sie sehen will, muss sie suchen - und genau das
 * ist die Sorte Arbeit, die niemand macht. Dieses Werkzeug legt sie in
 * zwei Minuten nebeneinander.
 *
 * Die Zahl ist gemessen, und hier steht woran (Regel 5): eine Abschrift
 * von `tor/ansicht.mjs` hat nach jeder der 78 Aufnahmen alle `d` aus dem
 * Baum geschrieben; eine Zeichnung gilt als sichtbar, wenn ALLE ihre
 * Pfade in einer Aufnahme stehen. Neunzehn kamen so vor, 67 nie.
 * Vorher stand hier „achtundsechzig" - geschaetzt, nicht gezaehlt, und
 * um eins daneben. Genau die Sorte Zahl, vor der E17 warnt.
 *
 * ---------------------------------------------------------------------
 * DAS BLATT IST EINE AUFNAHME DER ECHTEN SEITE
 *
 * Bis E18 hat dieses Werkzeug die Karte NACHGEBAUT - 8 Punkte Polster,
 * 1 Punkt Rand, 14 Punkte Rundung, ein Schatten. Die echte Karte hat
 * `var(--r3)`, `var(--strich)`, `var(--rund-karte)`, zwei Schatten und
 * einen Lichtsaum, und im kurzen Querformat ein anderes Polster.
 * Beurteilt wurde also ein Nachbau - und der Kontrast, auf den es
 * ankommt, entsteht genau dort: am Rand der Zeichnung gegen das Papier
 * der Karte.
 *
 * Jetzt laedt das Werkzeug `tools/bilderseite.mjs` - dieselbe Seite, die
 * unter `/bilder/` ausgeliefert wird, mit dem vollstaendigen Stilblatt
 * der gebauten App. Was hier zweimal dastuende, wuerde einmal veralten
 * (Regel 6) - also steht es nur noch einmal: keine Kartenfarbe, keine
 * Rundung und keine Groesse mehr an dieser Stelle.
 *
 * ZWEI BLAETTER, UND DAS ERSTE IST DAS WICHTIGERE
 *
 *   bilder-quer.png   Fenster 844 x 390 - das Zielgeraet. Die
 *                     Medienabfrage greift, die Zeichnungen stehen bei
 *                     64 Punkten in 104er Karten. Dafuer, ob man sie
 *                     ERKENNT.
 *
 *   bilder-lang.png   Weites Fenster, lange Form: 76 Punkte in 124er
 *                     Karten - der zweite unterstuetzte Weg. Dafuer, ob
 *                     die ZEICHNUNG stimmt: sitzt der Henkel an der
 *                     Tasse, steht das Tier auf seinen Beinen.
 *
 * Die Woerter sind auf beiden Blaettern EINGESCHALTET - sonst weiss
 * hinterher niemand, welche Karte gemeint ist. Wer erkennen WILL, statt
 * zu pruefen, nimmt die Seite auf dem Geraet und laesst den Schalter aus.
 *
 * ---------------------------------------------------------------------
 * WAS ES NICHT IST
 *
 * Kein Tor. Es urteilt nicht und es schlaegt nicht an - es macht zwei
 * Bilder und sagt, wo sie liegen. Was daran gut oder schlecht ist, sagt
 * der Blick (Regel 4: kein Tor ersetzt den Blick). Deshalb liegen die
 * Blaetter in `blick/` und nicht in `tor/vorbilder/`: ein Vorbild
 * waere eine Zusage, dass sich nichts aendern darf, und hier soll sich
 * etwas aendern.
 *
 * Und es ist nicht das Geraet. Chromium zeigt die Farben dieses
 * Rechners; der Bildschirm des iPhones zeigt seine eigenen. Dafuer gibt
 * es die ausgelieferte Seite unter `/bilder/`.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as EN from '../src/inhalt/englisch.js';
import { bilderSeite } from './bilderseite.mjs';
import { starte } from '../tor/chromium.mjs';

const NUR_QUER = process.argv.includes('--quer');
const NUR_LANG = process.argv.includes('--lang');
const AUS = path.join(process.cwd(), 'blick');

/* Die beiden Fenster.
 *
 * 844 x 390 ist das Zielgeraet (iPhone quer) - die kurze Form.
 *
 * Fuer die lange Form muessen BEIDE Bedingungen der Abfrage
 * `(max-height:440px), (max-width:430px)` danebengehen: hoeher als 440
 * UND breiter als 430. Der erste Anlauf nahm dafuer 431 Punkte Breite -
 * gerade eben breit genug - und bekam ein Blatt von 862 x 30766
 * Bildpunkten: eine einzige Spalte, die niemand ansieht. Schmal ist eben
 * nicht dasselbe wie lang. Jetzt ein weites Fenster; die lange Form gilt
 * dort genauso, und alles steht nebeneinander. */
const FENSTER = {
  quer: { width: 844, height: 390, hinweis: '844 × 390 — das Zielgerät, kurze Form (64 Punkte)' },
  lang: { width: 1500, height: 900, hinweis: '1500 × 900 — lange Form (76 Punkte)' },
};

const gemalt = EN.BILDER.filter(b => b.bild);
const html = bilderSeite();

const browser = await starte();
fs.mkdirSync(AUS, { recursive: true });
const geschrieben = [];

const machen = async (name) => {
  const f = FENSTER[name];
  const seite = await browser.newPage({
    viewport: { width: f.width, height: f.height }, deviceScaleFactor: 2 });
  await seite.setContent(html);
  /* Die Woerter an: auf einem Blatt zum Nachschlagen muss dranstehen,
     was gemeint ist. Auf dem Geraet bleiben sie aus. */
  await seite.locator('#woerter').check();
  const ziel = path.join(AUS, `bilder-${name}.png`);
  await seite.screenshot({ path: ziel, fullPage: true });
  await seite.close();
  geschrieben.push([ziel, f.hinweis]);
};

if (!NUR_LANG) await machen('quer');
if (!NUR_QUER) await machen('lang');
await browser.close();

const jeFeld = new Map();
for (const x of gemalt) jeFeld.set(x.gebiet, (jeFeld.get(x.gebiet) || 0) + 1);
console.log(`\n  Bilderblatt: ${gemalt.length} Zeichnungen aus ${
  EN.BILDER.length} Einträgen (${EN.BILDER.length - gemalt.length} ohne Bild)`);
console.log(`  ${[...jeFeld].map(([k, n]) => `${EN.gebietTitel(k) || k} ${n}`).join(' · ')}`);
for (const [z, hinweis] of geschrieben)
  console.log(`  geschrieben: ${path.relative(process.cwd(), z)}  —  ${hinweis}`);
console.log('');
