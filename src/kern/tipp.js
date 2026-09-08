/* DER TIPP (S12) — wieviele falsche Antworten der Ausweg wegnimmt.
 *
 * „Weiß ich nicht" ist richtig: ein Kind muss aussteigen duerfen. Nur
 * kostete der Knopf nichts und brachte nichts - ein Druck, die Loesung
 * steht da. Seit S12 hat er zwei Stufen, und die erste nimmt falsche
 * Antworten weg.
 *
 * WIEVIELE, ist eine Rechnung und keine Entscheidung je Bildschirm.
 * Stuende sie an den fuenf Auswahlschirmen einzeln, stuende sie fuenfmal
 * da - und was zweimal dasteht, veraltet einmal (Regel 6). Und sie steht
 * hier statt im Spiel, weil sie damit ohne Browser zu pruefen ist: eine
 * Zahl, die man nur im Bild sehen kann, wird selten nachgerechnet.
 *
 * Die Regel:
 *   - hoechstens die HAELFTE der falschen Antworten, aufgerundet
 *   - aber nie so viele, dass keine falsche mehr uebrig ist
 *
 * Der zweite Teil ist der wichtige. Bei zwei Antworten gibt es genau
 * eine falsche; sie wegzunehmen waere die LOESUNG und kein Tipp. Dort
 * faellt die erste Stufe deshalb ganz aus, und der Knopf loest sofort
 * auf - ehrlicher als ein Knopf, der beim ersten Druck nichts tut.
 *
 *   falsche:  1  2  3  4  5  6
 *   weg:      0  1  2  2  3  3
 */
export const tippMenge = (falsche) => {
  const f = Number.isFinite(falsche) ? Math.floor(falsche) : 0;
  if (f < 2) return 0;
  return Math.min(Math.ceil(f / 2), f - 1);
};
