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
  /* `rhythmus` IST HIER RAUS (P20) - und diesmal nicht, weil es falsch
   * zaehlte, sondern weil die Frist selbst weg ist.
   *
   * Es stand hier und schlug an, wenn der letzte volle Probenlauf mehr
   * als drei Tage zurueckliegt. Das hat getan, was es sollte: es hat den
   * Lauf erzwungen. Nur kostet der Lauf auf diesem Rechner zwei bis vier
   * Stunden, und der Nutzer will Anforderungen stellen und kurz
   * nachsehen, nicht auf eine Nacht warten.
   *
   * DIE ENTSCHEIDUNG IST SEINE, und sie ist ausdruecklich: die
   * Gegenproben laufen nur noch, wenn er es sagt. Sie werden weiter
   * GESCHRIEBEN - jede neue Zusage bekommt ihre Probe, das kostet zwei
   * Minuten und haelt die Liste vollstaendig. Gefahren werden sie auf
   * Zuruf.
   *
   * Was damit verlorengeht, steht in `docs/Lernkiste-BACKLOG.md` unter
   * B23 - damit es niemand fuer ein Versehen haelt. `npm run rhythmus`
   * gibt es weiter; wer wissen will, wie alt die Nachweise sind, fragt.
   */
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
  /* `inhalt` STAND BEI DEN BILLIGEN TOREN und gehoert nicht mehr dorthin
     (I23).
     Es prueft ueberwiegend die Quelle und lief deshalb vor dem Bau. Seit
     I22 liest EINE seiner sechzehn Pruefungen die Paartafel „Was ist
     groesser?" - und die entsteht erst beim Bauen. Hier gab es immer ein
     `dist/` von vorhin, auf dem Runner nie: dort brach das Tor mit
     „ENOENT: dist/index.html" ab und riss die ganze Kette mit, eine
     Sekunde nach dem Start.
     Ein abgestuerztes Tor besteht jede Gegenprobe (Regel 11) - und
     dieses ist nicht einmal mehr dazu gekommen. Also faehrt es jetzt
     nach dem Bau: eine Zeile spaeter, dreieinhalb Sekunden teurer, und
     es liest, was die Kinder wirklich bekommen - geprueft wird `dist/`
     und nicht der Prototyp (Regel 7). */
  { name: 'inhalt', datei: 'tor/inhalt.mjs' },
  { name: 'budget', datei: 'tor/budget.mjs' },
  /* `anker` MUSS hier stehen und nicht bei den billigen Toren (Q48).
     Es liest das gebaute Buendel; vorher gaebe es nichts zu lesen, und ein
     altes Buendel waere schlimmer als keines. Es kostet unter einer
     Sekunde und haette den Groenland-Fall in dieser Zeit gefunden - der
     volle Probenlauf brauchte 150 Minuten dafuer. */
  { name: 'anker', datei: 'tor/anker.mjs' },
  /* `vielfalt` haelt fest, was der Inhalt-Audit gemessen hat: keine Ebene
     darf weniger als zwei volle Runden Vorrat haben. Ohne diese Zeile
     waere der Audit eine Momentaufnahme - der Befund, den er gefunden hat
     („beim zweiten Start kommen dieselben Saetze"), kann jederzeit
     zurueckkehren, und zwar leise: eine Ebene fuer ein neues Profil
     freigeben kostet eine Zeile und halbiert den Vorrat nicht sichtbar.

     Es steht hier und nicht bei den Browsertoren, obwohl es Chromium
     startet: es misst `vorrat()` im GEBAUTEN Buendel und ist in 1,9 s
     durch - es laedt die Seite einmal und zeichnet nichts. */
  { name: 'vielfalt', datei: 'tools/vielfalt.mjs', args: ['--tor'] },
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
  /* Die Tonleiter des Forscherbuchs (Buch-Audit II, Runde 0): wieviele
     verschiedene Schriftstufen, Radien und Abstaende es traegt. Eine
     Ratsche, kein Soll - sie darf nur strenger werden. */
  { name: 'tonleiter',  datei: 'tools/buch-feinmass.mjs', args: ['--tor'], ms: 20000 },
];

/* Ein geteiltes Tor OHNE Deckungsart waere still ungeprueft - genau die
 * Luecke, gegen die die Deckung da ist. Also hier nachsehen, nicht dort. */
for (const t of MIT_BROWSER)
  if (t.teile && !t.deckung)
    throw new Error(`tor/kette-liste.mjs: \`${t.name}\` teilt sich in ${t.teile}, `
      + 'sagt aber nicht, wie der Läufer die Deckung nachzählt (`deckung`)');

/** Alle Namen der Kette, in der Reihenfolge, in der sie starten. */
export const ALLE = [...OHNE_BROWSER, BAU, ...NACH_DEM_BAU, ...MIT_BROWSER].map(t => t.name);

/* ---------------------------------------------------------------------
 * Welche Tore eine geaenderte Datei ueberhaupt betreffen KANN.
 *
 * Der Anlass ist gemessen, nicht gefuehlt: eine Runde kostete rund 37
 * Minuten Maschinenzeit, und davon entfielen auf die Gegenproben fuenf.
 * Der groesste einzelne Posten war ein voller Kettenlauf (3,3 min) nach
 * einer Aenderung, die nur `docs/` angefasst hatte - dort kann kein
 * Browsertor etwas anderes sehen als vorher.
 *
 * DREI DINGE MACHEN DAS UNGEFAEHRLICH, und sie muessen zusammen gelten:
 *
 *   1. Die billigen Tore laufen IMMER, ohne Zuordnung. Zusammen unter
 *      fuenfzehn Sekunden - da ist nichts zu sparen und deshalb auch
 *      nichts falsch zu machen. Die Zuordnung entscheidet nur ueber die
 *      Browsertore.
 *   2. Was hier nicht steht, faellt auf ALLE Tore zurueck. Eine Datei,
 *      die niemand eingetragen hat, ist die gefaehrlichste - sie bekommt
 *      den vollen Lauf, nicht keinen.
 *   3. Es ersetzt den vollen Lauf nicht. `--betroffen` sagt in jedem Lauf
 *      selbst dazu, dass vor dem Einchecken `npm run tor` faellig ist.
 *
 * Und der Einwand aus `tools/kette.mjs` steht: „ein Schalter, mit dem man
 * sich Tore aussuchen kann, ist eine Art, die Kette still abzuschalten".
 * Er gilt - deshalb nimmt `--betroffen` KEINE Liste entgegen. Aussuchen
 * kann ich nichts; ich kann nur Dateien aendern, und was ich geaendert
 * habe, sagt `git`.
 *
 * Reihenfolge zaehlt: das erste passende Muster gewinnt.
 */
export const BETRIFFT = [
  /* Dokumente. `inhalt` und `regeln` lesen sie und laufen ohnehin immer;
     ein Browser sieht von einer Zeile im Backlog nichts. */
  { muster: /^(docs\/|CLAUDE\.md$|README\.md$)/,        tore: [] },
  /* Der Auslieferungs- und Probenauftrag. Laeuft auf dem Runner, nicht
     hier - und `dist/` aendert sich davon nicht. */
  { muster: /^(\.github\/|\.gitignore$)/,               tore: [] },
  /* Der Probenstand und die Probenliste gehoeren `proben`, nicht der
     Kette. `rhythmus` liest den Stand und laeuft immer. */
  { muster: /^tor\/proben(-liste\.mjs|-stand\.json)$/,  tore: [] },
  /* Die Vorbilder sind das Soll von `ansicht` und von sonst niemandem. */
  { muster: /^tor\/vorbilder\//,                        tore: ['ansicht'] },
  /* Die Kettenliste selbst: sie bestimmt, WAS laeuft, und `inhalt` haelt
     sie gegen CLAUDE.md. Wer daran dreht, bekommt alles. */
  { muster: /^tor\/kette-liste\.mjs$/,                  tore: null },
  /* Ein einzelnes Tor betrifft genau sich selbst. Ein Tor kann kein
     anderes rot machen - sie teilen keine Datei ausser dieser Liste, und
     die steht eine Zeile hoeher. */
  { muster: /^tor\/([a-z]+)\.mjs$/,                     tore: (m) => [m[1]] },
  { muster: /^tor\/([a-z]+)-stand\.json$/,              tore: (m) => [m[1]] },
];

/** Die Tore, die eine Liste geaenderter Dateien betreffen kann.
 *  `null` heisst: alles - entweder weil eine Datei nichts trifft oder
 *  weil sie ausdruecklich alles betrifft. */
export function betroffeneTore(dateien) {
  const aus = new Set();
  for (const d of dateien) {
    const weg = d.replace(/\\/g, '/');
    const treffer = BETRIFFT.find(b => b.muster.test(weg));
    if (!treffer) return null;                       // unbekannt -> alles
    const t = typeof treffer.tore === 'function'
      ? treffer.tore(weg.match(treffer.muster)) : treffer.tore;
    if (t === null) return null;                     // ausdruecklich alles
    for (const n of t) aus.add(n);
  }
  return aus;
}
