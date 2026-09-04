// Die Torkette — als Liste, nicht als `&&`-Zeile.
//
// Frueher stand die Kette in package.json als eine Kette von `&&`. Das hat
// zwei Dinge erzwungen, die beide falsch sind:
//
//   1. ALLES lief hintereinander. Sechs der Tore fahren einen eigenen
//      Chromium auf einem eigenen Zufallsport und teilen keine Datei -
//      sie sind vollstaendig unabhaengig und liefen trotzdem nacheinander.
//   2. Beim ersten Rot war Schluss. Wer `passt` rot bekam, sah `smoke`
//      erst im naechsten Lauf, also drei Minuten spaeter.
//
// Deshalb steht die Kette jetzt hier, und `tools/kette.mjs` faehrt sie.
// `tor/inhalt.mjs` liest DIESELBE Liste, wenn es CLAUDE.md gegen die
// Wirklichkeit haelt - die Kette steht damit an genau einer Stelle
// (Regel 6).
//
// `ms` ist gemessen, nicht geschaetzt: jedes Tor allein, nacheinander,
// auf demselben Rechner am selben Tag (vier Kerne, 16 GB, dist frisch
// gebaut, Chromium aus playwright). Die Zahl dient nur der REIHENFOLGE
// im Becken - das laengste Tor zuerst, damit am Ende kein langes mehr
// wartet. Sie ist keine Zusage und kein Soll; wer sie liest, liest eine
// Momentaufnahme (Regel 5).
//
// Gemessen am 31.08.2026, jedes Tor allein:
//
//     smoke 293 · passt 183 · ansicht 79 · ziehen 57 · lesbarkeit 9 · pwa 4
//
// Seit P2 zerfaellt `smoke` in drei Teile zu rund 100 s, seit P3 braucht
// `passt` 110 statt 183 s.
//
// Die Kopfzeile von tools/schnell.mjs nannte bis dahin „passt 54 · smoke
// 163": beides von einem anderen Rechner und aus einer Zeit vor P13/P14.
// `passt` misst seit P14 JEDEN Knopf statt einer Auswahl, `smoke` hat
// seither vier Abschnitte dazubekommen. Eine geerbte Zahl gilt fuer den
// Tag, an dem sie gemessen wurde.

/** Die billigen Tore. Zusammen unter zehn Sekunden, alle ohne Browser. */
export const OHNE_BROWSER = [
  /* `rhythmus` ist zurueck in der Kette (Q39e).
   *
   * Es stand hier schon einmal und ist ausgezogen, weil es in RUNDEN AM
   * CODE zaehlte: nach einer Arbeitssitzung stand es auf 47 Runden
   * Rueckstand und loeste mitten in der Arbeit einen 25-Minuten-Lauf aus.
   * Der Grund ist weg - es zaehlt seit dem Umbau in TAGEN, und der Runner
   * haelt jede Nacht 257 der 270 Nachweise frisch.
   *
   * Zurueck muss es, weil die anderen dreizehn NUR HIER entstehen koennen:
   * zwoelf an `ansicht`, einer an der Schriftmessung in `passt`. Der
   * naechtliche Lauf laesst sie aus und darf sie deshalb auch nicht
   * anmahnen (das Tor selbst haelt sich daran). Bliebe es nur dort, gaebe
   * es niemanden, der die Frist fuer diese dreizehn ueberhaupt stellt -
   * und eine Frist, die niemand stellt, ist keine.
   *
   * Es kostet Millisekunden. */
  { name: 'rhythmus',   datei: 'tor/rhythmus.mjs' },
  { name: 'inhalt',     datei: 'tor/inhalt.mjs' },
  { name: 'regeln',     datei: 'tor/regeln.mjs' },
  { name: 'doppelt',    datei: 'tor/doppelt.mjs' },
  { name: 'spielprobe', datei: 'tor/spielprobe.mjs' },
  { name: 'schreiben',  datei: 'tor/schreiben.mjs' },
  { name: 'vergleich',  datei: 'tor/vergleich.mjs' },
  { name: 'gleichlauf', datei: 'tor/gleichlauf.mjs' },
];

/* Gebaut wird zwischendrin: alles Weitere prueft `dist/`, nicht die Quelle.
 *
 * Zwei Dateien, EIN Name: die Kette in CLAUDE.md nennt `bauen` einmal, und
 * sie hat recht - es ist ein Schritt, kein Tor mit zwei Haelften. */
export const BAU = { name: 'bauen', dateien: ['entwuerfe/bauen.mjs', 'prototyp/bauen.mjs'] };

/** Misst die gebaute Datei — also nach dem Bau, aber noch ohne Browser. */
export const NACH_DEM_BAU = [
  { name: 'budget', datei: 'tor/budget.mjs' },
  /* `anker` MUSS hier stehen und nicht bei den billigen Toren (Q48).
     Es liest das gebaute Buendel; vorher gaebe es nichts zu lesen, und ein
     altes Buendel waere schlimmer als keines. Es kostet unter einer
     Sekunde und haette den Groenland-Fall in dieser Zeit gefunden - der
     volle Probenlauf brauchte 150 Minuten dafuer. */
  { name: 'anker', datei: 'tor/anker.mjs' },
];

/* Die Browsertore, laengstes zuerst.
 *
 * `teile` heisst: das Tor kann sich selbst aufteilen und laeuft dann als
 * mehrere Prozesse nebeneinander. Drei koennen das:
 *
 *   `smoke`    verteilt seit P2 GANZE Abschnitte nach gemessenem Gewicht;
 *              `ablage` und `spielen` bleiben zusammen.
 *   `passt`    verteilt seit P4 die sieben Geraetegroessen reihum - sie
 *              kosten gemessen alle dasselbe, da ist nichts zu wiegen.
 *   `ansicht`  prueft N Aufnahmen, die nichts voneinander wissen.
 *
 * `deckung` sagt, WIE der Laeufer nachzaehlt, dass die Teile zusammen
 * alles abdecken - ein Teillauf, der die Haelfte vergisst, meldete sonst
 * „gruen", und niemand saehe es:
 *
 *   'namen'  das Tor schreibt `TEILE i/n: a|b  VON: a|b|c` und der
 *            Laeufer vergleicht MENGEN. Faengt auch den Fall, dass zwei
 *            Teile dasselbe fahren und ein drittes nichts.
 *   'zahl'   das Tor meldet „N von M" und der Laeufer addiert. Reicht,
 *            wo streng nach Index geteilt wird und dieselbe Sache nicht
 *            zweimal vergeben werden kann.
 */
export const MIT_BROWSER = [
  { name: 'smoke',      datei: 'tor/smoke.mjs',      ms: 293000, teile: 4, deckung: 'namen' },
  { name: 'passt',      datei: 'tor/passt.mjs',      ms: 110000, teile: 3, deckung: 'namen' },
  { name: 'ansicht',    datei: 'tor/ansicht.mjs',    ms:  79000, teile: 3, deckung: 'zahl' },
  { name: 'ziehen',     datei: 'tor/ziehen.mjs',     ms:  57000 },
  { name: 'lesbarkeit', datei: 'tor/lesbarkeit.mjs', ms:   9000 },
  { name: 'pwa',        datei: 'tor/pwa.mjs',        ms:   4000 },
];

/* Ein geteiltes Tor OHNE Deckungsart waere still ungeprueft - genau die
 * Luecke, gegen die die Deckung da ist. Also hier nachsehen, nicht dort. */
for (const t of MIT_BROWSER)
  if (t.teile && !t.deckung)
    throw new Error(`tor/kette-liste.mjs: \`${t.name}\` teilt sich in ${t.teile}, `
      + 'sagt aber nicht, wie der Läufer die Deckung nachzählt (`deckung`)');

/** Alle Namen der Kette, in der Reihenfolge, in der sie starten. */
export const ALLE = [...OHNE_BROWSER, BAU, ...NACH_DEM_BAU, ...MIT_BROWSER].map(t => t.name);
