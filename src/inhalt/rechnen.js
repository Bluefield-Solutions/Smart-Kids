/* Was gerechnet wird.
 *
 * Die Gegenstände werden hier ERZEUGT, nicht aufgelistet. Das ist der
 * dritte Punkt aus C3 des ANTON-Abgleichs: sechzehn Bundesländer kann man
 * hinschreiben, hundert Rechenaufgaben nicht — und der Leitner braucht
 * trotzdem für jede eine feste Kennung, sonst trägt kein Fortschritt über
 * eine Sitzung hinaus.
 *
 * Die Kennung ist deshalb aus der Aufgabe abgeleitet und nicht gezählt:
 * `p3+4` ist morgen dieselbe Aufgabe wie heute, auch wenn der Vorrat in
 * anderer Reihenfolge entsteht.
 *
 * DIE VERTEILUNGEN STEHEN IM DOKUMENT, nicht hier — `docs/Lernkiste-
 * ABGLEICH-ANTON.md`, Reihe C. Das Tor `doku` legt beides nebeneinander.
 * Zwei Zahlen an zwei Orten veralten getrennt; die eine wird gepflegt, die
 * andere gilt. Genau dafür steht der Satz im Abgleich.
 */

/** Bis hierher wird gerechnet. Fionas Zahlenraum. */
export const BIS = 10;

/** Wieviel Addition, wieviel Subtraktion — als Anteil einer Sitzung. */
export const MISCHUNG_FIONA = { plus: 0.8, minus: 0.2 };

/* Die Null.
 *
 * Der Abgleich sagt „wenig mit 0 (7 + 0 lehrt nichts)". „Wenig" ist keine
 * Zahl, also ist es hier zu einer Regel geworden, und die steht so auch im
 * Dokument: die Null kommt NUR ALS ERGEBNIS vor, nie als Summand und nie
 * als Subtrahend.
 *
 *   drin:  6 − 6 = 0     was übrig bleibt, wenn man alles wegnimmt
 *   raus:  7 + 0, 7 − 0  eine Aufgabe, bei der sich nichts ändert
 *
 * Wäre die Null als Summand erlaubt, wären es 21 von 66 Additionen — ein
 * knappes Drittel aller Aufgaben. Das ist nicht „wenig".
 */

const wort = ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht',
              'neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn',
              'sechzehn','siebzehn','achtzehn','neunzehn','zwanzig'];
/** Eine Zahl, wie man sie SPRICHT. Fiona liest noch nicht. */
export const gesprochen = (n) => wort[n] ?? String(n);

/**
 * Der ganze Vorrat für Plus und Minus bis `BIS`.
 *
 *   Addition     a, b ≥ 1 und a + b ≤ 10        → 45 Aufgaben
 *   Subtraktion  1 ≤ b ≤ a ≤ 10                 → 55 Aufgaben
 *
 * `3 + 4` und `4 + 3` stehen beide drin. Für ein Kind, das rechnen lernt,
 * sind das zwei Aufgaben; dass sie dasselbe Ergebnis haben, ist gerade das,
 * was es herausfinden soll.
 */
export function vorrat(bis = BIS) {
  const aus = [];
  for (let a = 1; a <= bis - 1; a++)
    for (let b = 1; a + b <= bis; b++) aus.push(aufgabe('plus', a, b));
  for (let a = 1; a <= bis; a++)
    for (let b = 1; b <= a; b++) aus.push(aufgabe('minus', a, b));
  return aus;
}

/** Eine einzelne Aufgabe, samt Kennung, Anzeige und gesprochener Fassung. */
export function aufgabe(art, a, b) {
  const zeichen = art === 'plus' ? '+' : '−';
  const wert = art === 'plus' ? a + b : a - b;
  return {
    id: `${art[0]}${a}${zeichen}${b}`,
    rechenart: art,
    a, b,
    wert,
    frage: `${a} ${zeichen} ${b}`,
    // `name` ist, was das Programm überall sonst als „die richtige Antwort"
    // liest — Belohnung, Protokoll, Vorlesen. Bei einer Karte ist das der
    // Gebietsname, hier die Zahl.
    name: String(wert),
    gesagt: `Was ist ${gesprochen(a)} ${art === 'plus' ? 'plus' : 'minus'} ${gesprochen(b)}?`,
    // Die gesprochene Lösung. Nicht „gleich sieben", sondern „ist sieben" -
    // so sagt man es einem Kind, und so hört es sich auch vorgelesen an.
    geloest: `${gesprochen(a)} ${art === 'plus' ? 'plus' : 'minus'} ${gesprochen(b)}`
           + ` ist ${gesprochen(wert)}`,
  };
}

/**
 * Drei falsche Antworten zu einer Aufgabe — und zwar die, die ein Kind
 * WIRKLICH gibt.
 *
 * Nicht drei zufällige Zahlen: wer zufällig wählt, macht die Aufgabe
 * leichter, weil die falschen Antworten offensichtlich sind. Genommen wird
 * deshalb, wonach ein Sechsjähriger wirklich danebengreift:
 *
 *   ±1        verzählt beim Weiterzählen — der häufigste Fehler überhaupt
 *   ±2        zwei zu weit
 *   die Gegenrechnung (a − b statt a + b)  — die Aufgabe verwechselt
 *
 * Alles unter 0 und über `BIS` fällt weg: eine Antwort, die es im
 * Zahlenraum gar nicht gibt, ist keine Versuchung.
 */
export function ablenker(auf, wuerfel, bis = BIS) {
  const gegen = auf.rechenart === 'plus' ? auf.a - auf.b : auf.a + auf.b;
  const kandidaten = [auf.wert + 1, auf.wert - 1, gegen, auf.wert + 2, auf.wert - 2];
  const aus = [];
  for (const k of kandidaten) {
    if (k < 0 || k > bis || k === auf.wert || aus.includes(k)) continue;
    aus.push(k);
  }
  // Wenn die Nahen nicht reichen (bei 10 − 10 = 0 etwa), mit dem
  // aufgefüllt, was der Zahlenraum sonst hergibt.
  for (let k = 0; aus.length < 3 && k <= bis; k++)
    if (k !== auf.wert && !aus.includes(k)) aus.push(k);
  // Gemischt, damit die richtige Antwort nicht immer an derselben Stelle
  // steht — derselbe Fehler, den der Rauchtest bei den Hauptstädten fand.
  const drei = aus.slice(0, 3);
  for (let i = drei.length - 1; i > 0; i--) {
    const j = Math.floor(wuerfel() * (i + 1));
    [drei[i], drei[j]] = [drei[j], drei[i]];
  }
  return drei;
}
