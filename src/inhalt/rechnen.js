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
              'sechzehn','siebzehn','achtzehn','neunzehn'];
const zehnerWort = ['','','zwanzig','dreißig','vierzig','fünfzig','sechzig',
                    'siebzig','achtzig','neunzig'];
/**
 * Eine Zahl, wie man sie SPRICHT.
 *
 * Fiona liest noch nicht — und auch für Lea steht die Zahl nicht allein da,
 * sondern in einem Satz, der als Ganzes an die Sprachausgabe geht.
 *
 * Bis 20 aus der Liste, darüber zusammengesetzt: 56 = „sechsundfünfzig".
 * Die Eins heißt im Verbund „ein", nicht „eins" — „einsundzwanzig" wäre
 * der klassische Schnitzer. Über 100 kommt hier nichts vor: der größte
 * Wert im ganzen Vorrat ist 10 × 10.
 */
export function gesprochen(n) {
  if (n < 20) return wort[n] ?? String(n);
  if (n === 100) return 'hundert';
  if (n > 100 || n % 1) return String(n);
  const z = Math.floor(n / 10), e = n % 10;
  if (e === 0) return zehnerWort[z];
  return (e === 1 ? 'ein' : wort[e]) + 'und' + zehnerWort[z];
}

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

/* ---------------------------------------------------------------------- *
 * Leas Reihen 6 bis 10.                                                   *
 * ---------------------------------------------------------------------- */

/** Welche Reihen Lea übt. */
export const REIHEN = [6, 7, 8, 9, 10];
/** Bis hierher gehen die eingestreuten leichteren Reihen. */
export const LEICHT_VON = 2, LEICHT_BIS = 5;

/* Vier Sorten, nicht zwei.
 *
 * Für Lea sind `mal`, `zehner` und `leicht` alle drei Multiplikationen —
 * sie sieht keinen Unterschied. Getrennt sind sie, weil die MISCHUNG sie
 * trennen muss, und die Mischung greift an `rechenart`:
 *
 *   mal      6 × 1 … 9 × 9   die eigentliche Arbeit
 *   zehner   alles mit 10    „weniger × 10 (zu leicht)" aus dem Abgleich —
 *                            von Natur aus 14 von 50 Aufgaben der Reihen,
 *                            also 28 %; als eigene Sorte lässt sich das
 *                            auf ein Zehntel drücken, ohne sie ganz
 *                            wegzunehmen. Die Zehnerreihe GEHÖRT zu den
 *                            Reihen 6 bis 10, sie soll nur nicht die
 *                            Sitzung füllen.
 *   geteilt  56 : 7          die Umkehrung dessen, was sie gerade übt
 *   leicht   2 × 3 … 5 × 10  die eingestreute Verschnaufpause
 *
 * Eine Sorte zu bauen, um einen ANTEIL zu steuern, ist kein Umweg: der
 * Leitner wählt nach Fälligkeit, nicht nach Sorte. Wer den Anteil im
 * Vorrat regeln wollte, müsste Aufgaben weglassen — und eine Aufgabe, die
 * nicht im Vorrat steht, kann das Kind auch nie lernen.
 */

/** Anteil Division: Voreinstellung und was der Regler höchstens hergibt. */
export const GETEILT_STANDARD = 0.10, GETEILT_HOECHSTENS = 0.50;
/** Wieviel der Multiplikationen auf Zehner und auf die leichten entfällt. */
export const ANTEIL_ZEHNER = 0.10, ANTEIL_LEICHT = 0.10;

/**
 * Die Mischung für Leas Sitzung, aus EINER Stellschraube.
 *
 * Der Regler im Elternbereich verschiebt Multiplikation gegen Division.
 * Alles andere folgt daraus: von dem, was der Multiplikation bleibt, gehen
 * je ein Zehntel an die Zehnerreihe und an die leichten Aufgaben.
 *
 * Warum abgeleitet und nicht vier Regler: vier Zahlen, die zusammen 1
 * ergeben müssen, ergeben irgendwann nicht mehr 1. Diese hier tun es
 * immer.
 */
export function mischungLea(anteilGeteilt = GETEILT_STANDARD) {
  const g = Math.min(GETEILT_HOECHSTENS, Math.max(0, anteilGeteilt));
  const m = 1 - g;
  return {
    mal:     m * (1 - ANTEIL_ZEHNER - ANTEIL_LEICHT),
    zehner:  m * ANTEIL_ZEHNER,
    leicht:  m * ANTEIL_LEICHT,
    geteilt: g,
  };
}

/** Der ganze Vorrat für Leas Reihen — 140 Aufgaben. */
export function reihenVorrat() {
  const aus = [];
  // Die Reihen selbst, ohne alles, worin eine 10 steckt.
  for (const a of REIHEN) for (let b = 1; b <= 10; b++)
    aus.push(malAufgabe(a === 10 || b === 10 ? 'zehner' : 'mal', a, b));
  // Die Umkehrung: geteilt durch die Reihe, die gerade geübt wird.
  for (const a of REIHEN) for (let b = 1; b <= 10; b++)
    aus.push(teilAufgabe(a * b, a));
  // Die Verschnaufpause.
  for (let a = LEICHT_VON; a <= LEICHT_BIS; a++) for (let b = 1; b <= 10; b++)
    aus.push(malAufgabe('leicht', a, b));
  return aus;
}

function malAufgabe(art, a, b) {
  return {
    id: `m${a}*${b}`, rechenart: art, a, b, wert: a * b,
    frage: `${a} × ${b}`, name: String(a * b),
    gesagt: `Was ist ${gesprochen(a)} mal ${gesprochen(b)}?`,
    geloest: `${gesprochen(a)} mal ${gesprochen(b)} ist ${gesprochen(a * b)}`,
  };
}

function teilAufgabe(p, a) {
  return {
    id: `d${p}:${a}`, rechenart: 'geteilt', a: p, b: a, wert: p / a,
    frage: `${p} : ${a}`, name: String(p / a),
    gesagt: `Was ist ${gesprochen(p)} geteilt durch ${gesprochen(a)}?`,
    geloest: `${gesprochen(p)} geteilt durch ${gesprochen(a)}`
           + ` ist ${gesprochen(p / a)}`,
  };
}

/**
 * Ablenker für die Reihen — wieder das, wonach ein Kind WIRKLICH greift.
 *
 * Bei Fionas Plus und Minus war das ±1 und die Gegenrechnung. Beim
 * Einmaleins ist es etwas anderes: die NACHBARN IN DER REIHE. Wer 7 × 8
 * nicht weiß, sagt 49 oder 63 — nicht 57. Deshalb ±a und ±b, und erst
 * danach die kleinen Verzähler.
 *
 * Bei der Division sind die Nachbarn im ERGEBNIS die Versuchung, nicht im
 * Dividenden: 56 : 7 wird zu 7 oder 9, nie zu 8,5.
 */
export function ablenkerReihen(auf, wuerfel) {
  const w = auf.wert;
  const nah = auf.rechenart === 'geteilt'
    ? [w + 1, w - 1, w + 2, w - 2]
    : [w + auf.a, w - auf.a, w + auf.b, w - auf.b, w + 1, w - 1];
  const aus = [];
  for (const k of nah) {
    if (k < 0 || k > 100 || k === w || aus.includes(k)) continue;
    aus.push(k);
  }
  for (let k = 1; aus.length < 3 && k <= 100; k++)
    if (k !== w && !aus.includes(k)) aus.push(k);
  const drei = aus.slice(0, 3);
  for (let i = drei.length - 1; i > 0; i--) {
    const j = Math.floor(wuerfel() * (i + 1));
    [drei[i], drei[j]] = [drei[j], drei[i]];
  }
  return drei;
}

/**
 * Der passende Ablenkersatz zur Aufgabe.
 *
 * EIN Griff für beide Fächer, weil der Rechenschirm einer ist. Stünde die
 * Verzweigung dort, müsste sie bei jedem dritten Rechenfach noch einmal
 * angefasst werden — und der Bildschirm wüsste plötzlich, was eine
 * Zehnerreihe ist.
 */
export function ablenkerFuer(auf, wuerfel) {
  return (auf.rechenart === 'plus' || auf.rechenart === 'minus')
    ? ablenker(auf, wuerfel)
    : ablenkerReihen(auf, wuerfel);
}
