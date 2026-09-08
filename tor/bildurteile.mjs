/* Die beurteilten Bildpaare — das Soll fuer den Aehnlichkeitsvergleich (E7c).
 *
 * WARUM DIESE DATEI EXISTIERT. Die Grenzen in `tor/inhalt.mjs` sind an
 * Faellen geeicht, deren Urteil vom BLATT kommt und nicht von der
 * Rechnung (Regel 3: das Soll kommt aus der Referenz). Solange dieses
 * Urteil nur als Kommentar danebensteht, prueft es niemand: wer eine
 * Grenze verschiebt, verschiebt sie ungestraft, und die Eichung ist
 * still weg. Als Daten laesst sie sich nachrechnen - `inhalt` ordnet
 * jedes Paar mit der heutigen Regel ein und vergleicht mit dem Urteil.
 *
 * DREI PAARE SIND GESCHICHTE. `ham`, `shirt` und `old` sind genau
 * deswegen neu gezeichnet worden; ihre alten Flaechen stehen hier
 * woertlich, damit die Regel weiter an ihnen gemessen werden kann. Ein
 * Rueckfallvorrat also, und der einzige Grund, warum ueberhaupt „Fallen"
 * darin vorkommen - im heutigen Bildvorrat gibt es keine mehr.
 *
 * WER HIER ETWAS AENDERT, hat vorher hingesehen. Ein Urteil ist kein
 * Rechenergebnis; es steht hier, WEIL es keins ist.
 */

/** Wie ein Paar auf dem Blatt aussieht - `falle` oder `harmlos`. */
export const BILDURTEILE = [
  /* --- Die drei Fallen. Alle drei sind geaendert worden, und alle drei
     liegen ueber 55 % zellgleich UND ueber 75 % Deckung. --------------- */
  { a: 'ham', b: 'tomato', urteil: 'falle',
    warum: 'zwei rote Kugeln - „ham" war „zwei ovale Scheiben von oben" und bei 76 Bildpunkten nicht mehr als ein Ball',
    bildA: [
      { f:'creme', d:'M40 4h12v8H40Z' },
      { f:'creme', d:'M43 8h6v16h-6Z' },
      { f:'rot', d:'M32 18c12 0 21 9 21 21s-9 21-21 21-21-9-21-21 9-21 21-21Z' },
      { f:'rotDunkel', d:'M38 20c9 3 15 10 15 19 0 12-9 21-21 21 9-3 16-10 16-21 0-8-4-15-10-19Z' },
      { f:'creme', d:'M32 18c5 0 10 2 13 4-4 2-8 3-13 3s-9-1-13-3c3-2 8-4 13-4Z' },
    ], },
  { a: 'shirt', b: 'jeans', urteil: 'falle',
    warum: 'zwei blaue Kleidungsstuecke nebeneinander; die alte Grenze allein haette es durchgelassen',
    bildA: [
      { f:'blau', d:'M22 10h20l14 8-6 13-6-3v28H20V28l-6 3-6-13Z' },
      { f:'blauDunkel', d:'M42 10l14 8-6 13-6-3v28h-8V10Z' },
      { f:'creme', d:'M26 10h12l-6 8Z' },
      { f:'licht', d:'M31 28h2v3h-2Zm0 8h2v3h-2Zm0 8h2v3h-2Z' },
    ], },
  { a: 'old', b: 'boy', urteil: 'falle',
    warum: 'zwei Menschen mit creme Kopf und blauem Rumpf - nur die Haarfarbe trennte sie',
    bildA: [
      { f:'grau', d:'M30 4c9 0 14 5 14 13H16c0-8 5-13 14-13Z' },
      { f:'creme', d:'M30 8a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
      { f:'grau', d:'M22 22h16v4H22Z' },
      { f:'blauDunkel', d:'M30 30c9 0 15 7 15 16v16H15V46c0-9 6-16 15-16Z' },
      { f:'braun', d:'M50 26h4v34h-4Z' },
      { f:'braun', d:'M46 24h12v5H46Z' },
    ], },

  /* --- Die harmlosen. Hoch gemessen, auf dem Blatt unverwechselbar -
     jedes einzelne angesehen. Sie sind der Grund, warum die Grenze nicht
     tiefer liegen kann. ------------------------------------------------ */
  { a: 'bread', b: 'chocolate', urteil: 'harmlos',
    warum: 'runder Laib mit Kerben gegen ein flaches Rechteck mit Gitter', },
  { a: 'apple', b: 'pullover', urteil: 'harmlos',
    warum: 'Apfel gegen Pullover - nur die Hauptfarbe ist dieselbe', },
  { a: 'chair', b: 'school/schoolbag', urteil: 'harmlos',
    warum: 'Stuhl mit Lehne und Beinen gegen eine Tasche mit Griff', },
  { a: 'chicken', b: 'eat', urteil: 'harmlos',
    warum: 'Huhn gegen Besteck', },
  { a: 'bye', b: 'colour', urteil: 'harmlos',
    warum: 'eine winkende Hand gegen eine Palette', },
  { a: 'o‘clock', b: 'football', urteil: 'harmlos',
    warum: 'Zifferblatt mit Zeigern gegen ein Fuenfeckmuster - beide rund', },
  { a: 'happy', b: 'sad', urteil: 'harmlos',
    warum: 'derselbe Kreis, und der Mund entscheidet', },
  { a: 'water', b: 'jeans', urteil: 'harmlos',
    warum: 'Glas mit Rand gegen zwei Hosenbeine', },
  { a: 'strawberry', b: 'tomato', urteil: 'harmlos',
    warum: 'die Erdbeere laeuft spitz zu und hat Kerne', },
  { a: 'apple', b: 'strawberry', urteil: 'harmlos',
    warum: 'Stiel und Blatt gegen Krone und Kerne', },
  { a: 'apple', b: 'tomato', urteil: 'harmlos',
    warum: 'ein Blatt gegen einen fuenfzackigen Stern', },
  { a: 'chocolate', b: 'school/schoolbag', urteil: 'harmlos',
    warum: 'flaches Gitter gegen eine Tasche mit Deckel und Griff', },
  { a: 'bread', b: 'school/schoolbag', urteil: 'harmlos',
    warum: 'Laib gegen Tasche - beide braun', },
  { a: 'bread', b: 'fruit', urteil: 'harmlos',
    warum: 'Laib gegen eine Schale mit Fruechten', },
  { a: 'house', b: 'birthday', urteil: 'harmlos',
    warum: 'Dach gegen Kerze', },
  { a: 'cat', b: 'school/schoolbag', urteil: 'harmlos',
    warum: 'eine Katze mit Ohren und Augen', },
  { a: 'salad', b: 'birthday', urteil: 'harmlos',
    warum: 'Blattgruen auf einem Teller gegen eine Torte', },
  { a: 'football', b: 'colour', urteil: 'harmlos',
    warum: 'Fuenfeckmuster gegen bunte Kleckse', },
  { a: 'England/English', b: 'Germany/German', urteil: 'harmlos',
    warum: 'zwei Flaggen - beide fuellen den Rahmen, die Farben trennen sie', },
];
