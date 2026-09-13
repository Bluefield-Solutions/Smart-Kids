/* Alle Zeichnungen auf EIN Blatt - zum Ansehen, nicht zum Messen.
 *
 * Aufruf:
 *   npm run bilderblatt              beide Blätter schreiben
 *   npm run bilderblatt -- --gross   nur das große
 *   npm run bilderblatt -- --karte   nur das in Kartengröße
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
 * ZWEI BLAETTER, UND DAS ZWEITE IST DAS WICHTIGERE
 *
 *   bilder-gross.png   150 Punkte je Bild, mit Wort und Wortfeld
 *                      darunter. Dafuer, ob die ZEICHNUNG stimmt -
 *                      sitzt der Henkel an der Tasse, steht das Tier auf
 *                      seinen Beinen.
 *
 *   bilder-karte.png   64 Punkte, dicht an dicht, ohne Beschriftung.
 *                      Dafuer, ob man sie ERKENNT.
 *
 * DIE 64 SIND GEMESSEN UND NICHT GEWAEHLT (Regel 5 - jede Zahl traegt
 * ihre Messstelle mit). `.wortbild` ist 76 Punkte breit; im kurzen
 * Querformat, und das IST das Zielgeraet mit 844 x 390, greift
 * `@media (max-height:440px)` und setzt sie auf 64. Wer die Bilder bei
 * 150 Punkten beurteilt, beurteilt etwas, das kein Kind je sieht.
 *
 * ---------------------------------------------------------------------
 * WAS ES NICHT IST
 *
 * Kein Tor. Es urteilt nicht und es schlaegt nicht an - es macht zwei
 * Bilder und sagt, wo sie liegen. Was daran gut oder schlecht ist, sagt
 * der Blick (Regel 4: kein Tor ersetzt den Blick). Deshalb liegen die
 * Blaetter auch in `blick/` und nicht in `tor/vorbilder/`: ein Vorbild
 * waere eine Zusage, dass sich nichts aendern darf, und hier soll sich
 * etwas aendern.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as EN from '../src/inhalt/englisch.js';
import { starte } from '../tor/chromium.mjs';

const NUR_GROSS = process.argv.includes('--gross');
const NUR_KARTE = process.argv.includes('--karte');
const AUS = path.join(process.cwd(), 'blick');

/* Die Kartengroesse auf dem Zielgeraet. Steht als Zahl hier und im
   Stilblatt - dort als `@media (max-height:440px) .wortbild{width:64px}`.
   Zwei Stellen fuer eine Zahl sind eine zuviel; dieses Werkzeug ist
   aber kein Tor, und eine Ableitung aus dem Stilblatt hiesse, es zu
   parsen. Wer die Zahl dort aendert, aendert sie hier mit - der Satz
   unter dem Blatt nennt sie, damit es auffaellt. */
const KARTE_PUNKTE = 64;
const GROSS_PUNKTE = 150;

const gemalt = EN.BILDER.filter(b => b.bild);

/** Ein Bild als SVG, in der Farbtafel des Vorrats. */
const svg = (b, px) =>
  `<svg viewBox="${EN.BILD_RAHMEN}" width="${px}" height="${px}">${
    b.bild.map(s => `<path d="${s.d}" fill="${
      EN.BILDFARBEN[s.f] || EN.BILDFARBEN.tinte}" fill-rule="evenodd"/>`).join('')
  }</svg>`;

const blattGross = () => `<div class="blatt gross">${gemalt.map(b => `
  <figure>${svg(b, GROSS_PUNKTE)}
    <figcaption><b>${b.wort}</b><span>${EN.gebietTitel(b.gebiet) || b.gebiet}</span></figcaption>
  </figure>`).join('')}</div>`;

const blattKarte = () => `<div class="blatt karte">${gemalt.map(b => `
  <div class="engkarte" title="${b.wort}">${svg(b, KARTE_PUNKTE)}</div>`).join('')}</div>`;

const STIL = `
  body{margin:0;background:#fff;font:13px/1.3 system-ui,sans-serif;color:#233}
  .blatt{display:flex;flex-wrap:wrap;gap:10px;padding:14px;align-items:flex-start}
  .blatt.gross{width:1540px}
  .blatt.karte{width:900px;gap:8px}
  figure{margin:0;width:${GROSS_PUNKTE}px;text-align:center}
  figure svg{display:block;border:1px solid #e3e6e8;border-radius:10px}
  figcaption{padding-top:3px;display:flex;flex-direction:column;line-height:1.15}
  figcaption b{font-size:12px}
  figcaption span{font-size:10px;color:#7a848c}
  /* Derselbe Kasten wie im Spiel: weisse Karte, runde Ecken, Schatten.
     Ohne ihn saehe man die Zeichnung auf Weiss und damit einen anderen
     Kontrast als das Kind. */
  .engkarte{background:#fff;border:1px solid #e3e6e8;border-radius:14px;
    padding:8px;box-shadow:0 2px 0 #e3e6e8;display:flex}
  h1{font:600 15px system-ui;margin:0;padding:14px 14px 0}
  p.messstelle{margin:2px 14px 0;color:#7a848c;font-size:12px}
`;

const b = await starte();
const seite = await b.newPage({ deviceScaleFactor: 2 });
fs.mkdirSync(AUS, { recursive: true });
const geschrieben = [];

const machen = async (name, titel, messstelle, inhalt) => {
  await seite.setContent(`<style>${STIL}</style><h1>${titel}</h1>`
    + `<p class="messstelle">${messstelle}</p>${inhalt}`);
  const ziel = path.join(AUS, `${name}.png`);
  await seite.locator('body').screenshot({ path: ziel });
  geschrieben.push(ziel);
};

if (!NUR_KARTE)
  await machen('bilder-gross', `Alle ${gemalt.length} Zeichnungen · ${GROSS_PUNKTE} Punkte`,
    'Zum Beurteilen der ZEICHNUNG: sitzt jedes Teil an seinem Platz?', blattGross());
if (!NUR_GROSS)
  await machen('bilder-karte', `Alle ${gemalt.length} Zeichnungen · ${KARTE_PUNKTE} Punkte`,
    `Zum Beurteilen der ERKENNBARKEIT. ${KARTE_PUNKTE} Punkte ist die Größe auf `
    + 'dem Zielgerät (844 × 390 quer, `@media (max-height:440px)`), nicht die '
    + '76 aus dem Stilblatt.', blattKarte());

await b.close();

const jeFeld = new Map();
for (const x of gemalt) jeFeld.set(x.gebiet, (jeFeld.get(x.gebiet) || 0) + 1);
console.log(`\n  Bilderblatt: ${gemalt.length} Zeichnungen aus ${
  EN.BILDER.length} Einträgen (${EN.BILDER.length - gemalt.length} ohne Bild)`);
console.log(`  ${[...jeFeld].map(([k, n]) => `${EN.gebietTitel(k) || k} ${n}`).join(' · ')}`);
for (const z of geschrieben) console.log(`  geschrieben: ${path.relative(process.cwd(), z)}`);
console.log('');
