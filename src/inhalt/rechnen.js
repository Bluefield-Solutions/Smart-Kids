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
  if (n % 1) return String(n);
  /* Bis 999, seit Eltern dazukam.
   *
   * Vorher hoerte es bei 100 auf, und alles darueber wurde als Ziffernkette
   * zurueckgegeben - „13 mal 17 ist 221" haette die Stimme als „zwei zwei
   * eins" gelesen. Beim Vorlesen ist das gleichgueltig - das Profil
   * „Eltern" laesst sich nichts vorlesen -, fuer den Nachweis nicht:
   * `gesagt` und `geloest` stehen im Protokoll, und das lesen sie.
   *
   * Deutsch setzt Hunderter voran und Zehner NACH der Einerstelle:
   * 221 = „zweihunderteinundzwanzig". Genau in dieser Reihenfolge. */
  if (n > 999) return String(n);
  if (n >= 100) {
    const h = Math.floor(n / 100), rest = n % 100;
    const vorn = (h === 1 ? '' : wort[h]) + 'hundert';
    return rest ? vorn + gesprochen(rest) : vorn;
  }
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

/* Die beiden Bauer - fuer das kleine UND das grosse Einmaleins.
 *
 * Unterschieden wird nur durch `art` und `kennung`. Frage, Ansage und
 * Loesung eines Produkts haengen nicht davon ab, wie gross die Zahlen
 * sind, und bis P8 standen sie trotzdem zweimal da: einmal fuer Lea
 * (`m…`, `d…`), einmal fuer die Eltern (`g…`, `t…`). Wer die Ansage
 * aendert, sollte sie nicht an zwei Stellen aendern muessen - im
 * Protokoll steht sie woertlich, und Eltern lesen es.
 */
function malAufgabe(art, a, b, kennung = 'm') {
  return {
    id: `${kennung}${a}*${b}`, rechenart: art, a, b, wert: a * b,
    frage: `${a} × ${b}`, name: String(a * b),
    gesagt: `Was ist ${gesprochen(a)} mal ${gesprochen(b)}?`,
    geloest: `${gesprochen(a)} mal ${gesprochen(b)} ist ${gesprochen(a * b)}`,
  };
}

function teilAufgabe(p, a, art = 'geteilt', kennung = 'd') {
  return {
    id: `${kennung}${p}:${a}`, rechenart: art, a: p, b: a, wert: p / a,
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
  if (auf.rechenart === 'plus' || auf.rechenart === 'minus')
    return ablenker(auf, wuerfel);
  if (auf.rechenart === 'mal-gross' || auf.rechenart === 'quadrat'
      || auf.rechenart === 'geteilt-gross')
    return ablenkerGross(auf, wuerfel);
  if (['doppelt', 'haelfte', 'zerlegen', 'luecke', 'prozent'].includes(auf.rechenart))
    return ablenkerNeu(auf, wuerfel);
  if (auf.rechenart === 'einheit') return ablenkerEinheit(auf, wuerfel);
  if (auf.rechenart === 'plus100' || auf.rechenart === 'minus100')
    return ablenkerZehner(auf, wuerfel);
  return ablenkerReihen(auf, wuerfel);
}


/* ---------- Rechnen für Eltern (R4) -------------------------------------------
 *
 * Drei Sorten, und alle drei sind VON NATUR AUS begrenzt - nicht
 * kuenstlich gekuerzt.
 *
 * Der erste Entwurf lautete „Plus und Minus im Zahlenraum 1000,
 * zweistellig mal einstellig, dreistellige Division". Klingt vernuenftig
 * und sind allein fuer die Addition 321 200 Aufgaben. Das bricht drei
 * Dinge auf einmal: das Forscherbuch zeichnet JEDEN Gegenstand einer
 * Ebene (dreihunderttausend Kaestchen), `spielprobe` rechnet jede Aufgabe
 * und jede angebotene Zahl nach, und der Leitner braucht Wiederholung -
 * bei 321 200 Aufgaben sieht man dieselbe nie zweimal.
 *
 * Deshalb nicht der Zahlenraum, sondern die SORTE:
 *
 *     mal-gross      11…19 x 11…19, ohne die Quadrate      72
 *     quadrat        12² bis 25²                           14
 *     geteilt-gross  die Umkehrung von `mal-gross`         72
 *                                                   gesamt 158
 *
 * `mal-gross` laesst die Quadrate aus, weil sie ihre eigene Sorte sind:
 * 13 x 13 zu koennen ist etwas anderes, als 13 x 17 zu rechnen, und wer
 * beides mischt, uebt das eine im Schatten des anderen.
 */
export const GROSS_VON = 11, GROSS_BIS = 19;
export const QUADRAT_VON = 12, QUADRAT_BIS = 25;

/** Der ganze Vorrat der Eltern: 158 Aufgaben, gezaehlt und nicht geschaetzt. */
export function grossVorrat() {
  const aus = [];
  for (let a = GROSS_VON; a <= GROSS_BIS; a++)
    for (let b = GROSS_VON; b <= GROSS_BIS; b++) {
      if (a === b) continue;                 // die Quadrate sind eigene Sorte
      aus.push(grossMal(a, b));
    }
  for (let a = QUADRAT_VON; a <= QUADRAT_BIS; a++) aus.push(grossQuadrat(a));
  for (let a = GROSS_VON; a <= GROSS_BIS; a++)
    for (let b = GROSS_VON; b <= GROSS_BIS; b++) {
      if (a === b) continue;
      aus.push(grossGeteilt(a * b, b));
    }
  return aus;
}

const grossMal = (a, b) => malAufgabe('mal-gross', a, b, 'g');

function grossQuadrat(a) {
  return {
    id: `q${a}`, rechenart: 'quadrat', a, b: a, wert: a * a,
    // Das Hochzeichen steht im Schriftschnitt (das Tor `schrift` prueft
    // jedes Zeichen); „a hoch 2" waere eine Kruecke.
    frage: `${a}²`, name: String(a * a),
    gesagt: `Was ist ${gesprochen(a)} zum Quadrat?`,
    geloest: `${gesprochen(a)} zum Quadrat ist ${gesprochen(a * a)}`,
  };
}

const grossGeteilt = (p, a) => teilAufgabe(p, a, 'geteilt-gross', 't');

/* Ablenker fuer Eltern.
 *
 * Er tippt - Ablenker braucht er nur, wenn jemand die Auswahl doch
 * einschaltet. Genommen wird trotzdem das, wonach ein Erwachsener
 * WIRKLICH danebengreift, und das ist etwas anderes als bei einem Kind:
 * nicht ±1, sondern die verrechnete Teilrechnung. 13 x 17 = 221 wird zu
 * 211 (Zehner vergessen) oder 231, und ein Quadrat zum Nachbarquadrat.
 */
export function ablenkerGross(auf, wuerfel) {
  const w = auf.wert;
  const kandidaten = auf.rechenart === 'geteilt-gross'
    ? [w + 1, w - 1, w + 2, w - 2]
    : auf.rechenart === 'quadrat'
      ? [(auf.a - 1) * (auf.a - 1), (auf.a + 1) * (auf.a + 1), w + 10, w - 10]
      : [w - 10, w + 10, w - auf.a, w + auf.b];
  const aus = [];
  for (const k of kandidaten) {
    if (k === w || k < 1 || k % 1) continue;
    if (!aus.includes(k)) aus.push(k);
    if (aus.length === 3) break;
  }
  // Aufgefuellt wird gewuerfelt, aber im Umfeld - eine Zahl, die weit weg
  // liegt, ist keine Versuchung.
  let schutz = 0;
  while (aus.length < 3 && schutz++ < 60) {
    const k = w + Math.round((wuerfel() - 0.5) * 40);
    if (k !== w && k > 0 && !aus.includes(k)) aus.push(k);
  }
  return aus.slice(0, 3);
}

/* ---------- I4: drei neue Rechenarten (Inhalt-Audit) ---------------------
 *
 * Der Vorrat der Rechenebenen war nie das Problem - Fiona hat 100
 * Aufgaben und damit 16,7 Runden. Was fehlte, war die ART: sie rechnet
 * seit einem Jahr Plus und Minus, und das ist EINE Sache, wieder und
 * wieder. Der Auftrag zum Inhalt-Audit hat ausdruecklich nach
 * Spielvarianten gefragt, nicht nur nach mehr Zeilen.
 *
 * Drei neue Ebenen, eine je Koennensstufe, und jede ist eine andere
 * FRAGE auf dem Stoff, den es schon gibt:
 *
 *   Verdoppeln (Fiona)  Doppelt, Haelfte, „was fehlt zur Zehn" - die drei
 *                       Rechnungen, die im ersten Schuljahr auswendig
 *                       sitzen sollen, weil alles andere darauf aufbaut.
 *   Was fehlt? (Lea)    `7 · ? = 42`. Dieselben Reihen, umgedrehte
 *                       Frage - und die ist schwerer, weil man die Reihe
 *                       nicht aufsagen kann, sondern suchen muss.
 *   Prozent (Eltern)    Zehn, zwanzig, fuenfundzwanzig, fuenfzig,
 *                       fuenfundsiebzig Prozent von runden Zahlen. Die
 *                       eine Rechnung, die im Alltag wirklich vorkommt.
 *
 * Alle drei sind ERZEUGT und nicht aufgelistet - dieselbe Entscheidung
 * wie oben: hundert Rechenaufgaben schreibt niemand hin.
 */

/* Fionas Verdoppeln, Halbieren und Zerlegen: 10 + 10 + 9 = 29 Aufgaben.
 *
 * Die Frage steht in Worten und nicht als Rechenzeichen: „Doppelt 4" ist
 * fuer eine Sechsjaehrige eine andere Aufgabe als „4 + 4", auch wenn
 * dieselbe Zahl herauskommt. Genau darum geht es - das Doppelte soll
 * SITZEN und nicht gerechnet werden. */
export function verdoppelnVorrat() {
  const aus = [];
  for (let a = 1; a <= 10; a++)
    aus.push({ id: `d${a}`, rechenart: 'doppelt', a, b: a, wert: a * 2,
      frage: `Doppelt ${a}`, name: String(a * 2),
      gesagt: `Was ist das Doppelte von ${gesprochen(a)}?`,
      geloest: `das Doppelte von ${gesprochen(a)} ist ${gesprochen(a * 2)}` });
  for (let a = 2; a <= 20; a += 2)
    aus.push({ id: `h${a}`, rechenart: 'haelfte', a, b: 2, wert: a / 2,
      frage: `Halb ${a}`, name: String(a / 2),
      gesagt: `Was ist die Hälfte von ${gesprochen(a)}?`,
      geloest: `die Hälfte von ${gesprochen(a)} ist ${gesprochen(a / 2)}` });
  for (let a = 1; a <= 9; a++)
    aus.push({ id: `z${a}`, rechenart: 'zerlegen', a, b: 10, wert: 10 - a,
      frage: `${a} + ? = 10`, name: String(10 - a),
      gesagt: `${gesprochen(a)} plus wieviel ist zehn?`,
      geloest: `${gesprochen(a)} plus ${gesprochen(10 - a)} ist zehn` });
  return aus;
}

/* Leas Luecken: 45 Aufgaben, aus denselben Reihen 6 bis 10.
 *
 * `7 · ? = 42` ist nicht dieselbe Aufgabe wie `7 · 6`. Wer die Reihe
 * aufsagen kann, kommt bei der ersten Form durch - bei dieser muss er
 * suchen. Deshalb eine eigene Ebene und keine Beimischung. */
export function lueckenVorrat() {
  const aus = [];
  for (const r of REIHEN)
    for (let b = 2; b <= 10; b++)
      aus.push({ id: `l${r}*${b}`, rechenart: 'luecke', a: r, b, wert: b,
        frage: `${r} × ? = ${r * b}`, name: String(b),
        gesagt: `${gesprochen(r)} mal wieviel ist ${gesprochen(r * b)}?`,
        geloest: `${gesprochen(r)} mal ${gesprochen(b)} ist ${gesprochen(r * b)}` });
  return aus;
}

/* Prozente fuer die Eltern: 50 Aufgaben.
 *
 * Fuenf Saetze mal zehn Grundwerte - und alle zehn sind durch vier
 * teilbar, damit auch 25 und 75 Prozent aufgehen. Eine Kopfrechenaufgabe
 * mit Komma waere keine Kopfrechenaufgabe. */
export const PROZENTE = [10, 20, 25, 50, 75];
export const GRUNDWERTE = [20, 40, 60, 80, 120, 160, 200, 240, 320, 400];
export function prozentVorrat() {
  const aus = [];
  for (const p of PROZENTE)
    for (const g of GRUNDWERTE)
      aus.push({ id: `pz${p}v${g}`, rechenart: 'prozent', a: p, b: g,
        wert: (g * p) / 100, frage: `${p} % von ${g}`, name: String((g * p) / 100),
        gesagt: `Wieviel sind ${p} Prozent von ${g}?`,
        geloest: `${p} Prozent von ${g} sind ${(g * p) / 100}` });
  return aus;
}

/* Die Ablenker der drei neuen Arten.
 *
 * Dieselbe Regel wie ueberall: genommen wird, wonach jemand WIRKLICH
 * danebengreift, nicht was ein Wuerfel ausspuckt.
 *
 *   doppelt    die Zahl selbst (nicht verdoppelt) und Nachbarn des
 *              Ergebnisses - der haeufigste Fehler ist, die Aufgabe gar
 *              nicht auszufuehren
 *   haelfte    das Doppelte statt der Haelfte - die Verwechslung der
 *              Richtung
 *   zerlegen   die Zahl selbst und die Gegenzahl zur Zwanzig
 *   luecke     Nachbarn des gesuchten Faktors und der andere Faktor
 *   prozent    das Ergebnis mit falschem Komma (mal zehn, durch zehn) und
 *              der Grundwert minus das Ergebnis
 */
export function ablenkerNeu(auf, wuerfel) {
  const w = auf.wert;
  let roh;
  if (auf.rechenart === 'doppelt') roh = [auf.a, w - 1, w + 1, w - 2, w + 2];
  else if (auf.rechenart === 'haelfte') roh = [auf.a * 2, auf.a, w + 1, w - 1, w + 2];
  else if (auf.rechenart === 'zerlegen') roh = [auf.a, w + 1, w - 1, 20 - auf.a, w + 2];
  else if (auf.rechenart === 'luecke') roh = [auf.a, w + 1, w - 1, w + 2, w - 2];
  else roh = [w * 10, w / 10, auf.b - w, w + 10, w - 10];
  const gut = [];
  for (const x of roh)
    if (Number.isInteger(x) && x >= 0 && x !== w && !gut.includes(x)) gut.push(x);
  // Aufgefuellt wird nur, wenn die Fehlerliste zu kurz war - das kommt bei
  // kleinen Zahlen vor („Doppelt 1" hat wenig Nachbarn ueber null).
  let n = 1;
  while (gut.length < 3) {
    for (const x of [w + n + 2, w - n - 2])
      if (x >= 0 && x !== w && !gut.includes(x) && gut.length < 3) gut.push(x);
    if (++n > 20) break;
  }
  // Gemischt wie ueberall, damit die richtige Antwort nicht immer an
  // derselben Stelle steht.
  const drei = gut.slice(0, 3);
  for (let i = drei.length - 1; i > 0; i--) {
    const j = Math.floor(wuerfel() * (i + 1));
    [drei[i], drei[j]] = [drei[j], drei[i]];
  }
  return drei;
}

/* ---------- I10: Groessen und der Zehneruebergang ------------------------
 *
 * Zwei Arten, die der Inhalt-Audit gefordert hat und die keine laengere
 * Liste sind, sondern eine andere FRAGE - beide fuer Lea.
 *
 * GROESSEN. Der Stoff der dritten Klasse und der eine, an dem das
 * Kopfrechnen aufhoert, eine Rechnung zu sein: dass ein Meter hundert
 * Zentimeter hat, ist Wissen mit einer Multiplikation dahinter. Genau das
 * gehoert in einen Leitner-Kasten.
 *
 * Gefragt wird in BEIDE Richtungen, und das ist der Lernwert: „3 m = ? cm"
 * kann man sich zusammenreimen, „300 cm = ? m" verlangt dieselbe Regel
 * rueckwaerts. Nur ganze Zahlen - „2500 g = ? kg" waere 2,5, und das
 * Eingabefeld dieser Ebene traegt `inputmode="numeric"`.
 */
export const EINHEITEN = [
  { id:'mcm',  von:'m',   nach:'cm',  mal:100,  werte:[1,2,3,5,7,10,12,20,25,40] },
  { id:'kmm',  von:'km',  nach:'m',   mal:1000, werte:[1,2,3,4,5,6,8,10,15,20] },
  { id:'cmmm', von:'cm',  nach:'mm',  mal:10,   werte:[3,5,8,12,15,24,30,45,60,90] },
  { id:'kgg',  von:'kg',  nach:'g',   mal:1000, werte:[1,2,3,4,5,7,9,12,16,25] },
  { id:'hmin', von:'h',   nach:'min', mal:60,   werte:[1,2,3,4,5,6,8,10,12,24] },
  { id:'mins', von:'min', nach:'s',   mal:60,   werte:[1,2,3,4,5,6,7,10,15,20] },
  { id:'lml',  von:'l',   nach:'ml',  mal:1000, werte:[1,2,3,4,5,6,8,10,12,20] },
];

/** 140 Aufgaben: sieben Paare mal zehn Werte mal zwei Richtungen. */
export function einheitenVorrat() {
  const aus = [];
  for (const e of EINHEITEN)
    for (const w of e.werte) {
      const gross = w * e.mal;
      /* `hin` sagt, in welche Richtung gerechnet wird - mal oder geteilt.
         Ohne dieses Feld muesste `spielprobe` es aus den Zahlen erraten,
         und raten ist genau das, was eine Nachrechnung nicht tun darf. */
      aus.push({ id: `eh${e.id}h${w}`, rechenart: 'einheit', hin: true, a: w, b: e.mal,
        wert: gross, frage: `${w} ${e.von} = ? ${e.nach}`, name: String(gross),
        gesagt: `Wieviel ${e.nach} sind ${w} ${e.von}?`,
        geloest: `${w} ${e.von} sind ${gross} ${e.nach}` });
      aus.push({ id: `eh${e.id}r${w}`, rechenart: 'einheit', hin: false, a: gross, b: e.mal,
        wert: w, frage: `${gross} ${e.nach} = ? ${e.von}`, name: String(w),
        gesagt: `Wieviel ${e.von} sind ${gross} ${e.nach}?`,
        geloest: `${gross} ${e.nach} sind ${w} ${e.von}` });
    }
  return aus;
}

/* DER ZEHNERUEBERGANG. Leas Reihen sind Malaufgaben; Plus und Minus hat
 * bei ihr nur Fiona - im Zahlenraum zehn. Was dazwischen fehlt, ist genau
 * die Stelle, an der das Rechnen im zweiten Schuljahr haengt: 47 + 8 geht
 * ueber die Fuenfzig, 63 - 7 unter die Sechzig.
 *
 * NUR Aufgaben MIT Uebergang. Ohne ihn waeren es zwei Ziffern nebeneinander
 * und keine Aufgabe - und die Ebene hiesse „Plus und Minus bis 100", was
 * sie nicht ist. Der Einer der ersten Zahl plus der Einer der zweiten muss
 * ueber zehn gehen; beim Minus muss der Einer des Abzugs groesser sein.
 */
/* DREI Zehner und nicht acht - gerechnet, nicht gegriffen.
 *
 * Der erste Anlauf ging ueber alle Zehner von 20 bis 99 und kam auf 319
 * Aufgaben. Das ist kein Vorrat, sondern eine Halde: bei zwoelf Aufgaben
 * je Sitzung sieht Lea dieselbe erst nach sechsundzwanzig Runden wieder,
 * und ein Leitner-Kasten lebt von Wiederholung mit Abstand. Er wird durch
 * einen groesseren Vorrat nicht besser, sondern wirkungslos.
 *
 * Dazu kommt, was die 319 wirklich waren: der KERN dieser Aufgabe ist das
 * Paar aus Einer und Summand (3 + 8 geht ueber zehn). Der Zehner wird nur
 * mitgeschleppt. Achtzig Zehner sind deshalb achtzigmal dieselbe Frage.
 *
 * Drei genuegen - 20, 50, 80 -, damit die Antwort nicht auswendig
 * gelernt werden kann und der Uebergang trotzdem in jedem Zehner
 * geuebt wird. Gemessen: 129 Aufgaben (75 plus, 54 minus), knapp elf
 * volle Runden. */
export function zehnerVorrat() {
  const aus = [];
  for (const z of [2, 5, 8])
    for (let e = 3; e <= 9; e++) {
      const a = z * 10 + e;
      for (const b of [6, 7, 8, 9]) {
        if (e + b <= 10) continue;               // kein Uebergang, keine Aufgabe
        if (a + b > 100) continue;
        aus.push({ id: `zp${a}+${b}`, rechenart: 'plus100', a, b, wert: a + b,
          frage: `${a} + ${b}`, name: String(a + b),
          gesagt: `Wieviel ist ${a} plus ${b}?`,
          geloest: `${a} plus ${b} ist ${a + b}` });
      }
      for (const b of [6, 7, 8, 9]) {
        if (b <= e) continue;                    // kein Uebergang nach unten
        aus.push({ id: `zm${a}-${b}`, rechenart: 'minus100', a, b, wert: a - b,
          frage: `${a} − ${b}`, name: String(a - b),
          gesagt: `Wieviel ist ${a} minus ${b}?`,
          geloest: `${a} minus ${b} ist ${a - b}` });
      }
    }
  return aus;
}

/* Die Ablenker der Groessen - und hier ist das WICHTIGE, nicht die
 * Rechnung.
 *
 * Der Fehler, den ein Kind bei „3 m = ? cm" macht, ist nie „302". Er ist
 * immer einer von dreien, und alle drei sind FAKTORFEHLER:
 *
 *   - die Zahl unveraendert stehen lassen (3 statt 300)
 *   - den falschen Faktor nehmen (30 oder 3000 statt 300)
 *   - in die falsche RICHTUNG rechnen (bei „300 cm = ? m" 30 000 statt 3)
 *
 * Ein zufaelliger Nachbar waere hier kein Ablenker, sondern ein Geschenk:
 * wer 300 rechnet und 301 danebenstehen sieht, hat keine Wahl zu treffen.
 * Die Ebene prueft den Faktor, also muessen die falschen Antworten
 * falsche Faktoren sein.
 */
export function ablenkerEinheit(auf, wuerfel) {
  const w = auf.wert;
  /* Die Reihenfolge ist die Rangfolge: erst die Zahl unveraendert (der
     haeufigste Fehler), dann ein Zehner zu wenig, dann einer zu viel.
     Der erste Anlauf hatte `w * b` mit dabei - bei „25 kg = ? g" waren
     das 25 Millionen, und eine Zahl, die niemand je antippt, ist kein
     Ablenker, sondern eine geschenkte Ausschlussmoeglichkeit. */
  const roh = [auf.a, w / 10, w * 10, w / 100, w * 100, w * 1000, w / 1000];
  const gut = [];
  for (const x of roh)
    if (Number.isInteger(x) && x > 0 && x !== w && !gut.includes(x)) gut.push(x);
  /* Kommt hier nichts mehr zusammen, ist die Aufgabe falsch gebaut - ein
     Nachbar waere kein Faktorfehler und damit kein Ablenker dieser Ebene.
     Gemessen: bei allen 140 Aufgaben reichen die sieben oben. */
  while (gut.length < 3) gut.push(w * (10 ** (gut.length + 2)));
  const drei = gut.slice(0, 3);
  for (let i = drei.length - 1; i > 0; i--) {
    const j = Math.floor(wuerfel() * (i + 1));
    [drei[i], drei[j]] = [drei[j], drei[i]];
  }
  return drei;
}

/* Die Ablenker des Zehneruebergangs - und auch hier ist der Fehler der
 * Gegenstand, nicht die Nachbarschaft.
 *
 * Wer 23 + 8 falsch rechnet, rechnet fast nie 30 oder 33. Er rechnet
 * ZWANZIGEINS: er addiert die Einer (3 + 8 = 11), schreibt die Eins hin
 * und vergisst den Uebertrag. Das ist w minus zehn.
 * Beim Minus ist es spiegelbildlich: 23 - 8 wird zu 25, weil er 8 - 3
 * rechnet statt 13 - 8 und den Zehner stehen laesst. Das ist w plus zehn.
 *
 * Diese eine Zahl MUSS unter den vier stehen, sonst prueft die Ebene den
 * Uebergang nicht - sie prueft dann nur, ob jemand ungefaehr richtig
 * rechnet. Die beiden anderen sind Verzaehler um eins; sie stehen dabei,
 * damit die richtige Antwort nicht die einzige „runde" ist.
 */
export function ablenkerZehner(auf, wuerfel) {
  const w = auf.wert;
  const uebertrag = auf.rechenart === 'plus100' ? w - 10 : w + 10;
  const roh = [uebertrag, w - 1, w + 1, w - 2, w + 2];
  const gut = [];
  for (const x of roh)
    if (Number.isInteger(x) && x >= 0 && x !== w && !gut.includes(x)) gut.push(x);
  const drei = gut.slice(0, 3);
  /* Der Uebertragsfehler bleibt drin - gemischt wird nur seine Lage.
     Ein Mischen, das ihn herauswerfen kann, nimmt der Ebene ihren
     Gegenstand: eine Pruefung, die nie etwas meldet, ist kein Beweis
     (Regel 1), und eine Ebene, deren Fehler nur manchmal dabeisteht,
     meldet nur manchmal etwas. */
  for (let i = drei.length - 1; i > 0; i--) {
    const j = Math.floor(wuerfel() * (i + 1));
    [drei[i], drei[j]] = [drei[j], drei[i]];
  }
  return drei;
}
