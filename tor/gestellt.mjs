// Gestellte Stände für die Tore.
//
// Was MEHRERE Tore stellen müssen, steht hier - einmal. Ein gestellter
// Stand ist eine Zusage: „so sieht es aus, wenn ...". Steht dieselbe
// Zusage zweimal, kann sie auseinanderlaufen, und dann fotografiert das
// eine Tor einen Bildschirm, den das andere nicht mehr prueft.
//
// Gefunden hat das `npm run doppelt` (P9): 198 Token, `tor/ansicht.mjs`
// neben `tor/smoke.mjs`.

/**
 * Der Elternvergleich: Stephan zwei von drei, Violeta eins von zwei.
 *
 * Die Zahlen sind die Sache, nicht die Zeilen. Der Vergleichsbildschirm
 * (N1) zaehlt, was beim ERSTEN Versuch richtig war:
 *
 *   Stephan  drei Aufgaben, zwei auf Anhieb   -> 2 von 3
 *   Violeta  zwei Aufgaben, eine auf Anhieb   -> 1 von 2
 *
 * Also fuehrt Stephan. Traegen beide dieselben Zahlen, zeigt die Aufnahme
 * zwar eine Tabelle, aber nicht, was sie kann: welche Zeile hervorgehoben
 * wird, waere auf jedem Bild dasselbe.
 *
 * Zwei Module mit Absicht - Rechnen und Erdkunde. „Zuletzt geübt" muss
 * auch eine Gebietskennung aufloesen koennen, nicht nur eine Aufgabe.
 *
 * `versuch` steht ausdruecklich an JEDER Zeile - auch die Einsen. „Auf
 * Anhieb oder nicht" IST der gestellte Fall; ihn als Vorgabe im Tor zu
 * lassen hat beim ersten Anlauf prompt „0 von 3" ergeben, weil das eine
 * Tor die Vorgabe setzte und das andere nicht.
 *
 * `eingabeart` und `zeit` fehlen dagegen: die haengen am Tor. `ansicht`
 * braucht feste Zeiten, weil sie auf dem Bild stehen; `smoke` nicht.
 */
export const ELTERN_VERGLEICH = [
  { profil:'stephan', ebene:'rechnen:gross',  gebietId:'g12*13', ergebnis:'richtig',
    versuch:1, dauerMs:4300 },
  { profil:'stephan', ebene:'rechnen:gross',  gebietId:'q17',    ergebnis:'richtig',
    versuch:1, dauerMs:5100 },
  { profil:'stephan', ebene:'laender:europa', gebietId:'POL',    ergebnis:'richtig',
    versuch:2, dauerMs:8200 },
  { profil:'violeta', ebene:'rechnen:gross',  gebietId:'g13*17', ergebnis:'richtig',
    versuch:1, dauerMs:3600 },
  { profil:'violeta', ebene:'laender:europa', gebietId:'ESP',    ergebnis:'gezeigt',
    versuch:3, dauerMs:11400 },
];
