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
// Die Kopfzeile von tools/schnell.mjs nannte bis dahin „passt 54 · smoke
// 163": beides von einem anderen Rechner und aus einer Zeit vor P13/P14.
// `passt` misst seit P14 JEDEN Knopf statt einer Auswahl, `smoke` hat
// seither vier Abschnitte dazubekommen. Eine geerbte Zahl gilt fuer den
// Tag, an dem sie gemessen wurde.

/** Die billigen Tore. Zusammen unter zehn Sekunden, alle ohne Browser. */
export const OHNE_BROWSER = [
  { name: 'inhalt',     datei: 'tor/inhalt.mjs' },
  { name: 'regeln',     datei: 'tor/regeln.mjs' },
  { name: 'doppelt',    datei: 'tor/doppelt.mjs' },
  { name: 'spielprobe', datei: 'tor/spielprobe.mjs' },
  { name: 'schreiben',  datei: 'tor/schreiben.mjs' },
  { name: 'vergleich',  datei: 'tor/vergleich.mjs' },
];

/* Gebaut wird zwischendrin: alles Weitere prueft `dist/`, nicht die Quelle.
 *
 * Zwei Dateien, EIN Name: die Kette in CLAUDE.md nennt `bauen` einmal, und
 * sie hat recht - es ist ein Schritt, kein Tor mit zwei Haelften. */
export const BAU = { name: 'bauen', dateien: ['entwuerfe/bauen.mjs', 'prototyp/bauen.mjs'] };

/** Misst die gebaute Datei — also nach dem Bau, aber noch ohne Browser. */
export const NACH_DEM_BAU = [
  { name: 'budget', datei: 'tor/budget.mjs' },
];

/* Die Browsertore, laengstes zuerst.
 *
 * `teile` heisst: das Tor kann sich selbst aufteilen und laeuft dann als
 * mehrere Prozesse nebeneinander. Zwei koennen das:
 *
 *   `ansicht`  prueft N Aufnahmen, die nichts voneinander wissen.
 *   `smoke`    verteilt seit P2 GANZE Abschnitte nach gemessenem Gewicht
 *              (`--teil=i/n`); `ablage` und `spielen` bleiben zusammen.
 *
 * Beide zaehlen im Laeufer nach, dass die Teile zusammen alles abdecken -
 * ein Teillauf, der die Haelfte vergisst, meldete sonst „gruen".
 */
export const MIT_BROWSER = [
  { name: 'smoke',      datei: 'tor/smoke.mjs',      ms: 293000, teile: 3 },
  { name: 'passt',      datei: 'tor/passt.mjs',      ms: 183000 },
  { name: 'ansicht',    datei: 'tor/ansicht.mjs',    ms:  79000, teile: 3 },
  { name: 'ziehen',     datei: 'tor/ziehen.mjs',     ms:  57000 },
  { name: 'lesbarkeit', datei: 'tor/lesbarkeit.mjs', ms:   9000 },
  { name: 'pwa',        datei: 'tor/pwa.mjs',        ms:   4000 },
];

/** Alle Namen der Kette, in der Reihenfolge, in der sie starten. */
export const ALLE = [...OHNE_BROWSER, BAU, ...NACH_DEM_BAU, ...MIT_BROWSER].map(t => t.name);
