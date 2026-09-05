/* Bild-Prompts fuer E4 - je Blatt einer, je Prompt genau ZEHN Felder.
 *
 * Warum zehn auf einmal und nicht eins nach dem anderen: 86 Bilder einzeln
 * zu erzeugen heisst 86 Mal denselben Stil neu zu treffen, und getroffen
 * wird er nie ganz. Zehn Felder auf EINEM Blatt entstehen in einem Zug -
 * gleiche Strichstaerke, gleiche Groesse, gleiche Haltung. Danach wird das
 * Blatt in ein 5x2-Raster geschnitten, und das ist reine Rechnung.
 *
 * DER STIL-BLOCK STEHT HIER GENAU EINMAL und wird in jeden Prompt
 * eingesetzt (Regel 6: was zweimal dasteht, veraltet einmal). Wer ihn in
 * elf Prompts von Hand kopierte, haette elf Fassungen, und die zehnte
 * waere die alte.
 *
 * Aufruf:
 *   npm run bildprompt              alle Blaetter mit Zahlen, ohne Prompt
 *   npm run bildprompt -- tiere     DAS Blatt, vollstaendig zum Kopieren
 *   npm run bildprompt -- --alle    alle elf Prompts hintereinander
 */
import * as EN from '../src/inhalt/englisch.js';

/** Zehn Felder je Blatt. Steht einmal da und wird zweimal gebraucht. */
const JE_BLATT = 10;

/* Der unveraenderliche Teil. Er sagt DREI Dinge, und jedes hat einen Grund:
 *
 *   das RASTER    damit das Schneiden Rechnung ist und kein Augenmass
 *   den STIL      flache schwarze Flaechen auf Weiss, weil daraus SVG-Pfade
 *                 werden sollen - Grau, Verlaeufe und Schatten lassen sich
 *                 nicht nachzeichnen, sie werden beim Umwandeln zu Matsch
 *   die HALTUNG   „von der Seite", „von vorn", „aufrecht" - ohne das
 *                 zeichnet ein Bildermacher zehnmal etwas anderes, und die
 *                 zehn Felder passen nicht zusammen
 */
const STIL_KOPF = `One single image, 2500 x 1000 pixels, containing a grid of ten square
panels: five panels across and two panels down, each panel 500 x 500 pixels.
Do NOT draw the grid. No borders, no frames, no separating lines, no captions,
no letters, no numbers, no signature anywhere in the image.

Style: flat vector pictogram. Solid pure black shapes on a pure white background.
No grey, no colour, no gradients, no shading, no hatching, no texture, no
drop shadows, no perspective, no 3D. Every shape is one closed silhouette with a
clean outer contour; where a detail must read (an eye, a hole, a window), cut it
out of the black shape as white negative space rather than drawing a thin line
over it. The drawings will be traced into SVG paths, so contours must be smooth
and closed.

Composition: each subject sits centred in its own panel, upright, and fills about
70 % of the panel, leaving a clear white margin on all four sides. Nothing touches
a panel edge and nothing crosses into a neighbouring panel. All ten drawings share
the same visual weight, the same level of detail and the same apparent size.
Children aged six to eight must recognise each subject at a glance without any
text.

`;

/* Der Satz, der die Aufzaehlung ankuendigt - er steht NACH dem Hinweis des
   Blattes, damit die zehn Zeilen direkt darunter folgen und nichts
   dazwischen steht. */
const STIL_FUSS = `The ten panels, in reading order — first the top row from left to right, then the
bottom row from left to right:`;

const LEER = 'empty — leave this panel completely blank white';

/** Die Blaetter: je Gebiet Bloecke von zehn, das letzte mit leeren Feldern. */
export function blaetter(){
  const aus = [];
  for (const g of EN.BILDGEBIETE) {
    const meine = EN.BILDER.filter(b => b.gebiet === g.id);
    for (let i = 0; i < meine.length; i += JE_BLATT) {
      const teil = meine.slice(i, i + JE_BLATT);
      const nr = Math.floor(i / JE_BLATT) + 1;
      const wieviele = Math.ceil(meine.length / JE_BLATT);
      aus.push({
        id: wieviele > 1 ? `${g.id}-${nr}` : g.id,
        titel: wieviele > 1 ? `${g.titel} (${nr} von ${wieviele})` : g.titel,
        hinweis: g.hinweis || null,
        woerter: teil,
        /* Aufgefuellt wird IMMER auf zehn. Ein Blatt mit sieben Feldern
           haette ein anderes Raster, und dann stimmt die Schnittrechnung
           nicht mehr - genau der Fehler, der beim Zuschneiden nicht
           auffaellt, sondern erst am schiefen Bild. */
        felder: [...teil.map(b => b.motiv),
                 ...Array(JE_BLATT - teil.length).fill(LEER)],
      });
    }
  }
  return aus;
}

/** Ein Blatt als fertiger Prompt - zum Kopieren in einem Stueck. */
export function prompt(blatt){
  return (blatt.hinweis ? `${STIL_KOPF}\n\n${blatt.hinweis}\n\n${STIL_FUSS}\n`
                        : `${STIL_KOPF}\n\n${STIL_FUSS}\n`)
    + blatt.felder.map((m, i) => `${String(i + 1).padStart(2)}. ${m}`).join('\n')
    + '\n';
}

/* Ab hier die BEDIENUNG - und sie laeuft nur, wenn dieses Werkzeug selbst
 * aufgerufen wird. `tor/inhalt.mjs` holt sich `blaetter()` als Modul; ohne
 * diese Wache druckte das Tor mitten in seinen Bericht die Blattliste des
 * Werkzeugs. Aufgefallen ist es sofort, weil es dastand - bei einem
 * Werkzeug, das etwas SCHREIBT statt druckt, waere es das nicht. */
const SELBST = process.argv[1]
  && import.meta.url.endsWith(process.argv[1].split('/').pop());

const argumente = SELBST ? process.argv.slice(2) : null;
const alle = blaetter();

if (!SELBST) {
  // Als Modul geladen: nichts tun.
} else if (argumente.includes('--alle')) {
  for (const b of alle) {
    console.log(`\n${'='.repeat(72)}\n  ${b.titel}  —  ${b.woerter.length} Wörter`
      + `\n  ${b.woerter.map(w => w.wort).join(' · ')}\n${'='.repeat(72)}\n`);
    console.log(prompt(b));
  }
} else if (argumente.length && !argumente[0].startsWith('-')) {
  const suche = argumente.join(' ').toLowerCase();
  const treffer = alle.filter(b => b.id.includes(suche)
    || b.titel.toLowerCase().includes(suche));
  if (!treffer.length) {
    console.error(`\n  Kein Blatt zu „${suche}". Bekannt sind:\n    `
      + alle.map(b => b.id).join('\n    ') + '\n');
    process.exit(1);
  }
  for (const b of treffer) {
    console.log(`\n  ${b.titel}  —  ${b.woerter.map(w => w.wort).join(' · ')}\n`);
    console.log(prompt(b));
  }
} else {
  /* Ohne Suchtext: die Uebersicht. Sie sagt auch, was NICHT gemalt wird -
     die Zahl ohne den Rest daneben liesse „86 Bilder" wie den ganzen
     Wortschatz aussehen. */
  console.log('\n  Bild-Prompts für E4 — je Blatt zehn Felder, je Feld ein Bild\n');
  for (const b of alle)
    console.log(`    ${b.id.padEnd(14)} ${String(b.woerter.length).padStart(2)} Wörter  `
      + `${b.woerter.map(w => w.wort).join(', ')}`);
  const bilder = EN.BILDER.length;
  console.log(`\n    ${alle.length} Blätter, ${bilder} Bilder.`);
  console.log(`    Dazu ${EN.FARBEN.length} Farben (der Fleck genügt, E3) und `
    + `${EN.NUR_WORT.length} Funktionswörter ohne Bild — zusammen `
    + `${bilder + EN.FARBEN.length + EN.NUR_WORT.length} von `
    + `${EN.WOERTER.length} Wörtern des Lehrplans.`);
  console.log('\n    Einen Prompt vollständig: npm run bildprompt -- <Blatt>');
  console.log('    Alle elf auf einmal:      npm run bildprompt -- --alle\n');
}
