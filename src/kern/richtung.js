/**
 * Wohin muss das Etikett? Aus zwei Punkten ein Wort, das ein Kind versteht.
 *
 * Der Anlass ist A3 aus dem ANTON-Abgleich: bis hierher sagte die App bei
 * einem Fehlgriff auf der Karte „Nicht ganz - probier es noch einmal."
 * Das ist keine Hilfe, sondern eine Ablehnung. Mit den Daten, die ohnehin
 * da sind - dem Anker jedes Gebiets -, laesst sich sagen, WO das gesuchte
 * liegt: „Thueringen liegt weiter oben."
 *
 * Gerechnet wird in BILDSCHIRMPUNKTEN, nicht in Kartenkoordinaten: der
 * Satz beschreibt, was das Kind sieht. Auf einer gedrehten oder anders
 * ausgeschnittenen Karte waere „oben" in Kartenkoordinaten etwas anderes
 * als oben auf dem Schirm, und der Hinweis zeigte in die falsche Richtung.
 *
 * Eine eigene Datei, weil das Wort ohne Browser zu pruefen sein muss: die
 * Geometrie ist eine Rechnung, kein Bildschirm.
 */

/**
 * Ab hier lohnt sich eine Richtung ueberhaupt.
 *
 * Wer 20 Punkte danebenliegt, hat nicht in die falsche Richtung gedacht -
 * er hat den Finger nicht genau genug gesetzt. „Weiter oben" waere dort
 * falscher als gar nichts: es schickte ihn weg von der Stelle, an der er
 * fast richtig lag.
 */
export const NAH = 40;

/**
 * Ab welchem Verhaeltnis eine Achse ALLEIN genannt wird.
 *
 * Liegt das Ziel doppelt so weit oben wie rechts, ist „weiter oben" die
 * Auskunft; sonst werden beide genannt. Ohne diese Schwelle hiesse es bei
 * jedem schraegen Fall „weiter oben rechts" - vier Woerter, von denen
 * eines fast nichts beitraegt.
 */
const KLAR = 2;

/**
 * Das Wort fuer „von hier nach dort".
 *
 * `dx`, `dy` sind Bildschirmpunkte: x nach rechts, y nach UNTEN (so wie
 * der Browser rechnet). Zurueck kommt `null`, wenn es zu nah ist - dann
 * hat der Aufrufer keine Richtung zu nennen und sagt etwas anderes.
 */
export function richtungswort(dx, dy, nah = NAH) {
  if (Math.hypot(dx, dy) < nah) return null;
  const waag = dx < 0 ? 'links' : 'rechts';
  const senk = dy < 0 ? 'oben' : 'unten';
  if (Math.abs(dx) > KLAR * Math.abs(dy)) return `weiter ${waag}`;
  if (Math.abs(dy) > KLAR * Math.abs(dx)) return `weiter ${senk}`;
  return `weiter ${senk} ${waag}`;
}
