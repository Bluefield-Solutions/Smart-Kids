/* Abzeichen (D2) - was ein Kind SAGEN kann, nicht wieviel es getan hat.
 *
 * REFERENZABGLEICH (Schritt 0 der Arbeitsweise).
 *
 * Drei Vorbilder, und was sie WIRKLICH tun:
 *
 * 1. Duolingo, „Achievements". Gestufte Zaehlabzeichen - „Scholar:
 *    lerne 50 Woerter", Stufe I bis X. Was es tut: es haengt eine
 *    naechste Sprosse an eine Leiter, die nie endet, und zeigt einen
 *    Balken dorthin. Was es NICHT tut: etwas ueber den Lernenden sagen.
 *    „50 Woerter" ist eine Zahl, kein Satz.
 *    Zu uebernehmen: der sichtbare naechste Schritt. Ein Abzeichen, das
 *    erst beim Erreichen erscheint, ist bis dahin unsichtbar.
 *
 * 2. Khan Academy, „Mastery". Das Abzeichen IST der Name der Faehigkeit -
 *    „Addition innerhalb von 10, gemeistert". Was es tut: es gibt dem
 *    Kind einen Satz in die Hand, den es jemandem sagen kann.
 *    Zu uebernehmen: der Text ist die Belohnung, nicht das Bild.
 *
 * 3. Das Panini-Sammelalbum. Das Album ist in benannte GRUPPEN geteilt,
 *    und „vollstaendig" gilt je Gruppe, nicht fuer das ganze Heft. Was es
 *    tut: es macht „fertig" erreichbar und gibt dem Fertigen einen Namen.
 *    Zu uebernehmen: die Menge braucht einen Namen, den ein Kind kennt,
 *    und muss klein genug sein, um sie zu Ende zu bringen.
 *
 * DAS SOLL, daraus abgeleitet:
 *   - Ein Abzeichen ist eine benannte MENGE, keine Zahl.
 *   - Sein Titel ist ein Satz in der ersten Person Singular Du.
 *   - Es ist sichtbar, BEVOR man es hat, mit dem, was noch fehlt.
 *   - Die Menge kommt aus einer REGEL ueber die Daten, nicht aus einem
 *     Verzeichnis von Kennungen - sonst gilt sie nicht fuer die vierte
 *     Ebene, und niemand merkt es.
 *
 * ABSTAND ZUM HEUTIGEN STAND, gemessen vor der Runde: null von vier. Es
 * gab Sterne (je Sitzung), Aufkleber (je Gegenstand) und den Pokal (je
 * bestandenem Test). Alle drei sind Zaehlwerke ueber EINEN Gegenstand
 * oder EINE Sitzung. Keines nennt eine Menge, und keines ergibt einen
 * Satz.
 *
 * WAS ABSICHTLICH FEHLT: „Zehn Tage hintereinander". Der ANTON-Abgleich
 * nennt es als Beispiel, und es waere leicht - das Protokoll traegt die
 * Tage. Es steht trotzdem nicht hier: A4 („Heute schon geuebt") ist mit
 * dem ausdruecklichen Zusatz „kein Streak-Zwang" aufgeschrieben, und ein
 * Abzeichen fuer zehn Tage am Stueck ist der staerkste Streak-Zwang, den
 * es gibt - es bestraft einen Krankheitstag. Das PRINZIP des Abgleichs
 * („Abzeichen, die etwas ueber das Kind sagen") wird von den Mengen
 * besser bedient als von einem Kalender.
 */

/* WARUM HIER KEIN „Du kennst alle Nachbarn von Deutschland" STEHT.
 *
 * Der ANTON-Abgleich nennt genau diesen Satz als Beispiel, und er war der
 * erste Eintrag der Tafel. Er ist wieder raus, und der Grund ist eine
 * Messung, keine Meinung: die App liefert ZWOELF europaeische Laender,
 * nicht einundfuenfzig. Die Quelldatei hat 51, gebaut werden die mit
 * `rang <= 12` - so tief geht das tiefste Profil. Von den neun Nachbarn
 * Deutschlands sind darunter genau vier: Frankreich, Belgien, Polen, die
 * Niederlande. Daenemark, Luxemburg, die Schweiz, Oesterreich und
 * Tschechien kommen im Spiel gar nicht vor.
 *
 * Das Abzeichen waere also fuer JEDES Profil unerreichbar gewesen - ein
 * Ziel, das ewig offen steht. Genau die Verfallsart, gegen die das Tor
 * `abzeichen` geschrieben ist; gefunden hat es sie erst, nachdem es gegen
 * den GELIEFERTEN Vorrat mass statt gegen die Quelldatei (Regel 12: die
 * Zahl und ihre Messstelle gehoeren zusammen).
 *
 * Ob die fuenf fehlenden Nachbarn ins Spiel sollen, ist eine Entscheidung
 * ueber den INHALT und steht als D2c im Rueckstandsverzeichnis. Bis dahin
 * gibt es das Abzeichen nicht: lieber keins als eines, das niemand
 * bekommen kann.
 */

/** Sechserreihe, Siebenerreihe - die Reihen heissen so und nicht „Reihe 6". */
const REIHENWORT = { 2:'Zweier', 3:'Dreier', 4:'Vierer', 5:'Fünfer', 6:'Sechser',
                     7:'Siebener', 8:'Achter', 9:'Neuner', 10:'Zehner' };

/* Die Tafel.
 *
 * Je Eintrag:
 *   ebene    auf welcher Ebene das Abzeichen wohnt
 *   id       Kennung, ohne die Ebene
 *   zeichen  welches Bild (siehe ABZEICHENBILD im Spiel)
 *   je       optional: EIN Eintrag wird zu mehreren, einer je Wert
 *   titel    der Satz. Bekommt den Wert aus `je` und das Umfeld.
 *   waehlt   die Regel ueber den Vorrat. Bekommt (vorrat, wert, umfeld).
 *
 * `waehlt` bekommt den VOLLEN Vorrat der Ebene, nicht den des Kindes.
 * Das ist bei den Kontinenten sichtbar: Fiona bekommt sie rundenweise,
 * anfangs nur vier von sechs. Gegen IHREN Vorrat gerechnet stuende dort
 * „Dir fehlt noch eins", obwohl es sechs Kontinente sind und drei fehlen.
 * Die Zahl neben einem Abzeichen muss die ganze Menge meinen, sonst
 * zaehlt sie etwas anderes als der Satz darueber behauptet.
 *
 * Verlieren kann man dadurch nichts: `istGesammelt` liest den
 * Hoechststand, und der steigt nur.
 *
 * Und es gibt eine zweite Regel: „was das Kind nie zu sehen bekommt,
 * wird ihm nicht angeboten."
 *
 * Sie stand hier schon einmal, fiel mit dem Nachbarn-Abzeichen weg (eine
 * Regel ohne Fall prueft niemand) - und kommt mit ihm zurueck. Denn seit
 * D2c gibt es den Fall wieder, und zwar genau einen: Deutschlands neun
 * Nachbarn liegen auf den Raengen 4 bis 12, und Fiona spielt Europa nur
 * bis Rang 3. Fuer sie waere „Du kennst alle Nachbarn von Deutschland"
 * ein Ziel, das ewig offen steht.
 *
 * Das ist NICHT dasselbe wie „steht heute nicht im Vorrat". Fionas
 * Kontinentrunde WAECHST - ihre sechs Kontinente sind alle erreichbar,
 * auch wenn heute nur vier drankommen. Die Laendertiefe waechst nicht.
 * Deshalb reicht der Vorrat als Massstab nicht, und `umfeld.erreichbar`
 * steht daneben: die Menge, die dieses Profil je zu sehen bekommt.
 */
export const TAFEL = [
  { ebene:'kontinente', id:'alle-kontinente', zeichen:'welt',
    titel: () => 'Du kennst alle Kontinente.',
    waehlt: (v) => v },

  { ebene:'bundeslaender', id:'stadtstaaten', zeichen:'stadt',
    titel: () => 'Du kennst die drei Stadtstaaten.',
    // Aus den DATEN, nicht aus einer Liste von Kennungen: `stadtstaat`
    // steht an jedem Bundesland.
    waehlt: (v) => v.filter(x => x.stadtstaat) },

  { ebene:'bundeslaender', id:'alle-bundeslaender', zeichen:'karte',
    titel: () => 'Du kennst alle sechzehn Bundesländer.',
    waehlt: (v) => v },

  { ebene:'rechnen:reihen', id:(a)=>`reihe-${a}`, zeichen:'reihe', je:[6,7,8,9,10],
    titel: (a) => `Du kannst die ${REIHENWORT[a]}reihe.`,
    waehlt: (v, a) => v.filter(x =>
      (x.rechenart === 'mal' || x.rechenart === 'zehner') && x.a === a) },

  { ebene:'rechnen:plusminus', id:'verdoppeln', zeichen:'doppelt',
    titel: () => 'Du kannst alle Verdopplungen.',
    waehlt: (v) => v.filter(x => x.rechenart === 'plus' && x.a === x.b) },

  { ebene:'schreiben:buchstaben', id:'dein-name', zeichen:'schild',
    titel: (_, u) => `Du kannst ${u.name} schreiben.`,
    // Die Buchstaben des eigenen Namens - fuer Fiona F I O N A, fuer Lea
    // L E A. Das persoenlichste Abzeichen, das sich rechnen laesst.
    waehlt: (v, _, u) => {
      const meine = new Set([...(u.name || '').toUpperCase()].filter(c => /[A-ZÄÖÜ]/.test(c)));
      return v.filter(x => meine.has(x.zeichen));
    } },

  { ebene:'schreiben:buchstaben', id:'alphabet', zeichen:'abc',
    titel: () => 'Du kannst das ganze Alphabet.',
    waehlt: (v) => v },

  /* --- D2b: vier weitere, jedes ein Satz ------------------------------ *
   *
   * Der Massstab ist derselbe wie in D2: die Menge muss aus den DATEN
   * kommen, nicht aus einer Liste von Kennungen, und der Satz muss ohne
   * Fussnote wahr sein. Was daran scheitert, steht nicht hier - „alle
   * Laender in Asien" waere zwoelf von achtundvierzig und damit eine
   * Behauptung, die das Kind spaeter als Luege erlebt.
   */

  /* Der Satz aus dem ANTON-Abgleich - seit D2c erreichbar.
   *
   * Er war der erste Eintrag dieser Tafel und flog in D2 wieder heraus:
   * fuenf der neun Nachbarn kamen im Spiel gar nicht vor. Jetzt kommen
   * sie vor. `nachbarDE` steht an den Laendern selbst, nicht als Liste
   * von Kennungen hier - dieselbe Regel wie bei `stadtstaat`. */
  { ebene:'laender:europa', id:'nachbarn-de', zeichen:'nachbarn',
    titel: () => 'Du kennst alle Nachbarn von Deutschland.',
    waehlt: (v) => v.filter(x => x.nachbarDE) },

  { ebene:'hauptstaedte', id:'alle-landeshauptstaedte', zeichen:'krone',
    titel: () => 'Du kennst alle Landeshauptstädte.',
    waehlt: (v) => v },

  /* Die andere Haelfte des Rechenvorrats - 55 von 100 Aufgaben.
   * Ein weiter Weg, und das ist in Ordnung: im Buch steht immer nur EIN
   * offenes Abzeichen, naemlich das mit den wenigsten fehlenden Stuecken.
   * Ein fernes Ziel draengt sich also nicht vor. */
  { ebene:'rechnen:plusminus', id:'minus', zeichen:'minus',
    titel: () => 'Du kannst alle Minusaufgaben.',
    waehlt: (v) => v.filter(x => x.rechenart === 'minus') },

  /* Fuenf Stueck - das kleinste Abzeichen der Tafel, und mit Absicht:
   * Fiona braucht eines, das sie erreicht, bevor das Alphabet voll ist. */
  { ebene:'schreiben:buchstaben', id:'vokale', zeichen:'vokal',
    titel: () => 'Du kennst alle Vokale.',
    waehlt: (v) => v.filter(x => 'AEIOU'.includes(x.zeichen)) },
];

/**
 * Die Abzeichen EINER Ebene, mit ihren Stuecken.
 *
 * Gibt fuer jedes zutreffende Abzeichen zurueck, aus welchen Kennungen es
 * besteht. Ob es verdient ist, entscheidet der Aufrufer am Leitner-Stand -
 * dieses Modul kennt keinen Stand und laesst sich deshalb ohne einen
 * pruefen.
 */
export function abzeichenDer(ebeneId, vorrat, umfeld = {}) {
  const aus = [];
  for (const e of TAFEL) {
    if (e.ebene !== ebeneId) continue;
    for (const wert of (e.je || [null])) {
      const teile = e.waehlt(vorrat, wert, umfeld).map(x => x.id);
      // Leer heisst: gibt es fuer dieses Kind nicht. Nicht „sofort
      // verdient" - eine leere Menge ist immer vollstaendig, und genau so
      // haette jedes Kind sofort jedes Abzeichen.
      if (!teile.length) continue;
      /* Und was das Kind nie zu sehen bekommt, wird ihm nicht angeboten.
         `erreichbar` ist optional: fehlt es, gilt alles als erreichbar -
         so kann dieses Modul weiterhin ohne Profil geprueft werden. */
      if (umfeld.erreichbar && teile.some(id => !umfeld.erreichbar.has(id))) continue;
      aus.push({
        id: typeof e.id === 'function' ? e.id(wert) : e.id,
        ebene: ebeneId, zeichen: e.zeichen,
        titel: e.titel(wert, umfeld),
        teile,
      });
    }
  }
  return aus;
}

/**
 * Verdient, wenn JEDES Stueck gesammelt ist.
 *
 * Dieselbe Schwelle wie beim Aufkleber, mit Absicht. Ein Abzeichen ist
 * eine Aussage ueber die MENGE, keine hoehere Huerde je Stueck - wer alle
 * drei Stadtstaaten als Aufkleber hat und trotzdem kein Abzeichen
 * bekaeme, haette recht mit „ich hab die doch alle".
 */
export function stand(abzeichen, hat) {
  const fehlt = abzeichen.teile.filter(id => !hat(id));
  return { ...abzeichen, fehlt: fehlt.length, offen: fehlt, verdient: fehlt.length === 0 };
}
