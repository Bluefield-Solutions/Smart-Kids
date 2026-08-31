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

/** Die neun Nachbarn Deutschlands, als Laenderkennungen (ISO alpha-3).
 *
 *  Der EINE Eintrag, der von Hand steht - Nachbarschaft ist Weltwissen und
 *  liegt in keinem unserer Datensaetze. Damit er nicht still veraltet,
 *  prueft das Tor `inhalt`, dass jede dieser neun Kennungen im Vorrat
 *  wirklich vorkommt: ein Abzeichen, dessen Menge leer ist, waere fuer
 *  immer unerreichbar und faellt sonst niemandem auf. */
export const NACHBARN = ['DNK', 'NLD', 'BEL', 'LUX', 'FRA', 'CHE', 'AUT', 'CZE', 'POL'];

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
 * `waehlt` bekommt den VOLLEN Vorrat der Ebene, nicht den des Kindes -
 * und `umfeld.erreichbar` sagt, was das Kind davon ueberhaupt bekommen
 * kann. Beides zusammen, und beides aus einem Grund:
 *
 * Fionas Laendertiefe ist DREI. Von den neun Nachbarn Deutschlands
 * liegen nur sechs in ihrem Vorrat. Gegen ihren Vorrat gerechnet hiesse
 * „alle Nachbarn" also „alle sechs, die du sehen kannst" - und das
 * Abzeichen behauptete „Du kennst alle Nachbarn von Deutschland", waehrend
 * sie drei davon nie zu Gesicht bekommen hat. Ein Abzeichen, dessen SATZ
 * nicht stimmt, ist schlimmer als keins: sein Satz ist das Einzige, was
 * es hat.
 *
 * Also: die Menge steht fest (voller Vorrat), und was ausserhalb des
 * kindlichen Vorrats liegt, wird gar nicht erst angeboten - ein Ziel, das
 * Fiona nicht erreichen kann, gehoert ihr nicht hingestellt.
 *
 * Der erste Anlauf hat das mit einer FALSCHEN Begruendung gebaut: „sonst
 * kann Fiona ein Abzeichen wieder verlieren, weil ihre Kontinentrunde
 * waechst". Die Gegenprobe hat das widerlegt, und sie hatte recht - die
 * Runde waechst genau dann, wenn die Menge voll ist, beide Rechnungen
 * kommen bei den Kontinenten immer zum selben Ergebnis. Verlieren kann
 * man ohnehin nichts: `istGesammelt` liest den Hoechststand, und der
 * steigt nur. Der Unterschied liegt allein bei den Ebenen mit FESTER
 * Tiefe, und dort ist er kein verlorenes Abzeichen, sondern ein falscher
 * Satz.
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

  { ebene:'laender:europa', id:'nachbarn', zeichen:'nachbarn',
    titel: () => 'Du kennst alle Nachbarn von Deutschland.',
    waehlt: (v) => v.filter(x => NACHBARN.includes(x.id)) },

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
      // Und nicht anbieten, was ausserhalb seines Vorrats liegt.
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
