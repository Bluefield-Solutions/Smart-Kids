// Der verbindliche Wortschatz Englisch, Grundschule Bayern, Jgst. 3/4.
//
// QUELLE, und sie liegt daneben: `docs/referenz/ISB-Englisch-Wortschatz-34.txt`
// ist der Text der amtlichen PDF, Wort fuer Wort. Das Untertor `englisch`
// liest BEIDE und vergleicht sie. Damit kann diese Datei nicht still von der
// Liste abweichen - und niemand muss sich darauf verlassen, dass ich richtig
// abgeschrieben habe.
//
// Das ist Regel 3 in ihrer teuersten Form - das Soll kommt aus der
// Referenz und nicht aus mir: bei Vokabeln faellt eine erfundene Zeile
// erst auf, wenn Lea in der Schule etwas anderes lernt.
//
// WAS AMTLICH IST und was nicht:
//   amtlich  die 151 Woerter, ihre Schreibung, die 15 Zahlen, die drei
//            Waehrungszeichen
//   NICHT    die Zuordnung zu Themengebieten. Die steht in einer ZWEITEN
//            Datei des ISB („Liste empfohlener Redemittel"), die hier noch
//            fehlt. Solange sie fehlt, hat kein Wort ein Themengebiet -
//            lieber keine Zuordnung als eine erfundene.
//   NICHT    Fionas Teilmenge. Sie kommt erst, wenn die Themengebiete da
//            sind; ohne sie waere die Auswahl mein Geschmack.
//
// EIN FEHLER IN DER AMTLICHEN LISTE, hier festgehalten, damit ihn niemand
// fuer einen Abschreibfehler haelt: die PDF nummeriert von 1 bis 151, laesst
// dabei aber die 29 aus und vergibt die 39 zweimal („39. cold" und
// „39. England/English"). Es sind 151 Woerter; die Nummern der Behoerde
// stimmen nicht. Gelesen wird deshalb SPALTENWEISE, nicht nach Nummer.

/** Die 151 Woerter, in der alphabetischen Reihenfolge der Quelle. */
export const WOERTER = [
  'a/an', 'about', 'and', 'apple', 'at', 'be (am, are, is)',
  'behind', 'big', 'bike', 'birthday', 'black', 'blue',
  'board', 'book', 'boy', 'bread', 'brother', 'brown',
  'butter', 'bye', 'can/can‘t', 'cat', 'chair', 'cheese',
  'chicken', 'chips', 'chocolate', 'class/classroom', 'cold', 'colour',
  'come', 'dear', 'do/don‘t', 'dog', 'dress', 'drink',
  'eat', 'egg', 'England/English', 'family', 'father', 'fine',
  'fish', 'football', 'friend', 'from', 'fruit', 'Germany/German',
  'girl', 'give', 'go', 'good', 'great', 'green',
  'grey', 'Halloween', 'ham', 'hamster', 'happy', 'have/has (got)',
  'haven’t/ hasn´t (got)', 'he', 'hello', 'help', 'her', 'here',
  'his', 'hobby', 'horse', 'hot', 'house', 'how',
  'I / I’d / I’m / I‘ve', 'in', 'In front of', 'it', 'Its', 'jeans',
  'know', 'like', 'little', 'many', 'Merry Christmas', 'morning',
  'mother', 'mouse', 'much', 'my', 'name', 'next to',
  'no/not', 'o‘clock', 'okay/OK', 'old', 'on', 'orange',
  'party', 'pen/pencil', 'pet', 'picture', 'pink', 'play',
  'please', 'plum', 'pullover', 'put', 'rabbit', 'red',
  'ride', 'room', 'rubber', 'sad', 'salad', 'school/schoolbag',
  'she', 'shirt', 'shoes', 'sister', 'small', 'sorry',
  'sports', 'strawberry', 'sweets', 'swim', 'take', 'tea',
  'teacher', 'tennis', 'thank(s)', 'the', 'there', 'they',
  'this', 'time', 'to', 'tomato', 'under', 'very',
  'water', 'we', 'weekend', 'welcome', 'what', 'when',
  'where', 'white', 'who', 'yellow', 'yes', 'you',
  'your'
];

/** „Hinzu kommen 15 Zahlen (1-12, 15,30,45)" - aus der Quelle. */
export const ZAHLEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 30, 45];

/** „und die Waehrungseinheiten: GBP, USD, EUR" - als Zeichen wie in der Quelle. */
export const WAEHRUNG = ['\u00a3', '$', '\u20ac'];

/* Die vier Themengebiete des Lehrplans (LPP E3/4, Lernbereich 4) mit ihren
 * Sprachhandlungen und Redemitteln.
 *
 * QUELLE: `docs/referenz/ISB-Englisch-Redemittel-34.txt`, der Text der
 * amtlichen PDF „Liste empfohlener Redemittel". Das Untertor `englisch`
 * liest beide und vergleicht sie - dieselbe Bauart wie beim Wortschatz.
 *
 * WAS ES NICHT GIBT, und das ist der wichtigste Satz dieser Datei: eine
 * Zuordnung WORT -> THEMENGEBIET steht in KEINER der beiden amtlichen
 * Dateien. Der Wortschatz ist alphabetisch, die Redemittel sind
 * thematisch, und dazwischen gibt es keine Bruecke.
 *
 * Gemessen, bevor ich es geglaubt habe: von den 151 Woertern kommen
 *   60  in gar keinem Redemittel vor  (apple, butter, hamster, tomato …)
 *   54  in genau einem Themengebiet
 *   37  in mehreren
 * Eine abgeleitete Zuordnung waere also fuer zwei Drittel der Woerter
 * erfunden. Das waere die teuerste Sorte Erfindung - sie sieht amtlich
 * aus, weil sie neben amtlichen Daten steht.
 *
 * Deshalb: die Themengebiete tragen ihre REDEMITTEL, nicht ihre Woerter.
 * Das ist genug fuer alles, was ansteht - Abzeichen je Themengebiet (E9),
 * Saetze zum Selbersagen, die Reihenfolge der Ebenen. Und es entspricht
 * dem, was die Quelle selbst sagt: die Woerter werden „nicht isoliert
 * erworben, sondern stets in Verbindung mit den empfohlenen
 * Redemitteln". */
export const THEMENGEBIETE = [
  { nr: '4.1', titel: 'Familie und Freunde', handlungen: [
    { was: 'Angaben zur Person machen und erfragen',
      saetze: [
        'My name is … . What’s your name?',
        'I’m … . How old are you? I’m from Germany/… . Where are you from?',
        'This is my family. I have/I’ve (got) … .',
        'This is my (little) brother/sister … . His/Her name is … . He/She is 5/… How many brothers/sisters/… have you got?',
        'Who’s this? What’s your/her/his/its name? How old is he/she?',
        'We have a big/… house. This is my room. It’s small/… .',
      ] },
    { was: 'über (Lieblings)Tiere/Haustiere sprechen',
      saetze: [
        'This is my pet. Have you got a pet? Yes, I/we have/haven’t got a … .',
        'Its name is … . It’s black/… .',
      ] },
  ] },
  { nr: '4.2', titel: 'Schule', handlungen: [
    { was: 'jemanden ansprechen, begrüßen und verabschieden',
      saetze: [
        'Hello. Good morning. Bye-bye.',
      ] },
    { was: 'sich und andere Personen vorstellen',
      saetze: [
        'I’m … . / My name is … .',
      ] },
    { was: 'nach dem Befinden fragen; persönliches Befinden und Gefühle ausdrücken',
      saetze: [
        'How are you? I’m fine, thanks. And you? I’m (very) happy/sad/okay.',
      ] },
    { was: 'Angaben zur Schule, Klasse, Lehrkraft, Unterrichtsfach machen und erfragen',
      saetze: [
        'I’m in class … . My teacher is … . I’m … .',
        'Where is/are (the/my/your) ..., please?',
        'It’s/The … is/They are here/there/under/in front of/in/on/behind/next to Sorry, I don’t know.',
        'I like German/English/sports/… . I go to school at 7 o’clock.',
        'And you? What about you?',
        '5 girls/boys have a brother/sister/… . 7 boys/girls like/don’t like dogs/… .',
      ] },
    { was: 'Uhrzeiten angeben und erfragen',
      saetze: [
        'What time is it, please? It’s 1 → 12 o’clock / 1.30/2.30/… → 12.30 / 1.45/2.45/… → 12.45',
      ] },
    { was: 'um etwas bitten und anderen etwas geben; sich bedanken und auf Dank reagieren',
      saetze: [
        'Can I have a/your red/… book/…, please? Yes. Here you are.',
        'Thanks. You’re welcome.',
        'Have you got a …? How many … have you got? I/We have/haven’t got … .',
        'Please help/… .',
      ] },
    { was: 'um Entschuldigung bitten und auf Entschuldigungen reagieren',
      saetze: [
        'Sorry. OK.',
      ] },
  ] },
  { nr: '4.3', titel: 'Freizeit und Feste', handlungen: [
    { was: 'jemanden einladen und auf Einladungen reagieren',
      saetze: [
        'Can you come to my party? Yes. Thank you. / No. I’m sorry.',
        'Please, come to my party!',
      ] },
    { was: 'Angaben zu Festen machen und erfragen',
      saetze: [
        'Where is your party? At my house/… .',
        'When is your birthday? My birthday is … .',
      ] },
    { was: 'gratulieren und wünschen',
      saetze: [
        'Happy birthday! Merry Christmas!',
      ] },
    { was: 'Angaben zu Freizeitbeschäftigungen machen und erfragen',
      saetze: [
        'My hobby is … . Can you play/ride …? I can/I can’t … .',
        'What’s your hobby? It‘s … . I play/like tennis/… . And you? What about you?',
        'Do you like …? Yes, I do. / No, I don’t.',
        'This is my skateboard/… . Have you got a …?',
        'Yes, I/we have/haven’t got a … . It’s red/… .',
      ] },
  ] },
  { nr: '4.4', titel: 'Einkaufen', handlungen: [
    { was: 'sich in Einkaufs- bzw. Servicesituationen zurechtfinden (z. B. etwas einkaufen, Mengenangaben machen und mit Geldbeträgen umgehen)',
      saetze: [
        'Can I help you? Yes, please. / No, thank you. I take/I’d like … to eat/drink.',
        'How many …? 2/…, please. How much is …? Here you are.',
        'It’s 8 £ / $ / €.',
      ] },
    { was: 'Gefallen und Missfallen, Zustimmung und Ablehnung äußern und erfragen',
      saetze: [
        'Do you like …? Yes, I do. / No, I don’t.',
      ] },
    { was: 'um etwas bitten und anderen etwas geben; sich bedanken und auf Dank reagieren',
      saetze: [
        'Can I have …, please? Yes. Here you are.',
        'Thank you. You’re welcome.',
      ] },
  ] },
];

/* ---------- Was „Hoeren und zeigen" abfragt (E3) -------------------------
 *
 * Die App sagt ein englisches Wort, vier Bilder stehen da, das Kind tippt.
 * Die Mechanik hat die App laengst - es ist die Ebene-4-Aufgabe aus
 * Erdkunde, nur mit Bildern statt Namen.
 *
 * DIE EINSCHRAENKUNG, und sie ist der ganze Zuschnitt dieses Pakets:
 * ein Bild je Wort gibt es noch nicht (das ist E4, und das ist Malarbeit,
 * kein Code). Ohne Bild waeren die vier Moeglichkeiten Text - und ein Kind,
 * das nicht liest, bekaeme vier leere Kaesten. Fuer Fiona waere die Ebene
 * damit keine Aufgabe, sondern ein Ratespiel.
 *
 * Deshalb faengt diese Ebene mit genau den Woertern an, deren Bild sich aus
 * dem Wort SELBST ergibt und nicht gemalt werden muss:
 *
 *   die zehn Farben   ein Fleck in der Farbe. „blue" IST blau.
 *   die 15 Zahlen     die Ziffer. Fiona lernt sie gerade in der Schreibwelt.
 *
 * Das sind 25 Gegenstaende - genug fuer mehrere Sitzungen -, und beide
 * Sorten kann Fiona vom ersten Tag an bedienen. Alles Uebrige kommt mit E4
 * dazu, ohne dass sich hier etwas aendert: `vorratHoeren()` haengt an den
 * Listen, nicht an einer Aufzaehlung.
 *
 * WAS AMTLICH IST: die zehn Farbwoerter stehen in WOERTER, die 15 Zahlen in
 * ZAHLEN - beide gegen die Quelle geprueft. NICHT amtlich sind die
 * englischen Zahlwoerter („seven") und die Farbwerte: die Quelle nennt nur
 * die Ziffern und die Woerter. Das Untertor `englisch` prueft deshalb, dass
 * jedes Farbwort hier auch in WOERTER steht und jede Zahl in ZAHLEN -
 * erfinden laesst sich hier nur die Aussprache, nicht der Wortschatz.
 */

/* Die Farbwerte stehen hier und NICHT in `src/marken/marken.css`.
 *
 * Das ist kein Versehen am Gestaltungssystem vorbei, sondern der
 * Unterschied zwischen Gestaltung und Inhalt: „blue" muss blau sein, auch
 * wenn die App im Abendmodus laeuft und alles andere nachdunkelt. Eine
 * Marke, die sich mit dem Modus aendert, waere hier eine falsche Antwort.
 * Dieselbe Begruendung wie beim Maskenwert der Randblende.
 *
 * Gewaehlt sind sie so, dass je zwei nebeneinander noch zu unterscheiden
 * sind - grey gegen white gegen black ist die engste Stelle. */
export const FARBEN = [
  { wort: 'black',  farbton: '#14181c' },
  { wort: 'blue',   farbton: '#1c7ed6' },
  { wort: 'brown',  farbton: '#8a5a2b' },
  { wort: 'green',  farbton: '#2f9e44' },
  { wort: 'grey',   farbton: '#9aa2ab' },
  { wort: 'orange', farbton: '#f76707' },
  { wort: 'pink',   farbton: '#f06595' },
  { wort: 'red',    farbton: '#e03131' },
  { wort: 'white',  farbton: '#ffffff' },
  { wort: 'yellow', farbton: '#fcc419' },
];

/** Wie die 15 Zahlen der Quelle auf Englisch heissen. */
export const ZAHLWORT = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
  7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve',
  15: 'fifteen', 30: 'thirty', 45: 'forty-five',
};

/**
 * Der Vorrat der Ebene „Hoeren und zeigen".
 *
 * `sorte` ist nicht Schmuck: die drei Ablenker muessen aus DERSELBEN Sorte
 * kommen. Stuenden neben einem Farbfleck drei Ziffern, waere die Antwort
 * ohne ein Wort Englisch zu finden - die Aufgabe pruefte dann, ob ein Kind
 * einen Fleck von einer Ziffer unterscheidet.
 */
export function vorratHoeren(){
  return [
    ...FARBEN.map(f => ({ id: `en:farbe:${f.wort}`, name: f.wort, wort: f.wort,
      sorte: 'farbe', farbton: f.farbton })),
    ...ZAHLEN.map(z => ({ id: `en:zahl:${z}`, name: ZAHLWORT[z], wort: ZAHLWORT[z],
      sorte: 'zahl', ziffern: String(z) })),
    /* UND DIE VIERUNDACHTZIG ZEICHNUNGEN (E13).
     *
     * Sie lagen da und wurden nur von „Lies das Wort" benutzt - also von
     * der Fertigkeit, die der Lehrplan am NIEDRIGSTEN gewichtet. Hoeren
     * und Sprechen, die beiden, auf die es in der dritten Klasse
     * ankommt, liefen auf zehn Farben und fuenfzehn Zahlen.
     *
     * Gemessen war das der ganze Vorrat: 25 Gegenstaende fuer „Hoeren
     * und zeigen" und dieselben 25 fuer „Sag es". Eine Sitzung hat zehn
     * Aufgaben; nach zweieinhalb Sitzungen hatte ein Kind alles gesehen,
     * und danach wiederholte sich der Satz.
     *
     * Es ist KEIN neues Bild noetig. Dasselbe Kaetzchen, das Lea liest,
     * hoert sie jetzt auch - und das ist nicht dieselbe Aufgabe, sondern
     * die Umkehrung: dort steht das Wort und sie sucht das Bild, hier
     * klingt das Wort und sie sucht das Bild. Der Leitner-Stand bleibt
     * getrennt (`en:bild:` gegen `ls:`), weil das zwei Koennen sind.
     *
     * `ablenkerFuer` zieht bei `sorte:'bild'` aus demselben Topf - drei
     * Bilder neben einem Bild, nie ein Farbfleck daneben. Das stand dort
     * schon, fuer „Lies das Wort", und gilt hier unveraendert. */
    ...BILDER.filter(b => b.bild).map(b => ({
      id: `en:bild:${b.wort}`, name: b.wort, wort: b.wort,
      sorte: 'bild', gebiet: b.gebiet, bild: b.bild })),
  ];
}

/* ---------- Die vier Stolperstellen (E5) --------------------------------
 *
 * QUELLE: `docs/Lernkiste-KONZEPT-ENGLISCH.md`, § 2, Befund 4. Er nennt
 * genau vier Stellen, an denen deutschsprachige Kinder VORHERSAGBAR
 * stolpern - und das Wort „vorhersagbar" ist der ganze Grund, warum es
 * diese Ebene gibt: eine Fehlerliste zum Anstreichen waere sie nicht,
 * eine BAULISTE FUER HOERAUFGABEN ist sie.
 *
 * WARUM DAS DIE SAUBERSTE AUFGABE DER GANZEN WELT IST: die Maschine hat
 * hier keinen Messfehler. Sie hat das Wort gesagt, sie weiss welches, und
 * ein richtiger Tipp ist richtig. Kein Erkenner, keine Unsicherheit, kein
 * Urteil ueber die Aussprache eines Kindes - beurteilt wird das OHR.
 *
 * Die Paare stehen als Daten, nicht als Zufallsauswahl: ein zufaelliges
 * Paar prueft eine zufaellige Sache.
 */
export const STOLPERSTELLEN = [
  { id: 'th', name: 'Das englische th',
    grund: 'Diesen Laut gibt es im Deutschen nicht. Wer ihn durch s oder f '
         + 'ersetzt, sagt ein anderes Wort.' },
  { id: 'wv', name: 'w gegen v',
    grund: 'Das deutsche w klingt wie das englische v. Wer englisches w '
         + 'deutsch anfängt, landet beim anderen Wort.' },
  { id: 'auslaut', name: 'Hart am Wortende',
    grund: 'Im Deutschen wird am Wortende hart gesprochen — „Hund" klingt wie '
         + '„Hunt". Im Englischen ändert das das Wort.' },
  { id: 'ea', name: 'a gegen e',
    grund: 'Das englische a liegt zwischen deutschem ä und a. Wer es wie ein e '
         + 'spricht, sagt das andere Wort.' },
];

/* Die Paare. `a` ist immer das Wort mit der SCHWIERIGEN Stelle, `b` das,
 * was daraus wird, wenn man sie deutsch spricht. Die Richtung ist keine
 * Ordnungsfrage: sie ist die Aussage.
 *
 * WAS HIER ABSICHTLICH FEHLT: eine Angabe, WELCHER Buchstabe getauscht
 * wird. Sie waere abzuschreiben, und Abgeschriebenes veraltet - das Tor
 * `inhalt` rechnet es stattdessen nach und faellt, wenn ein Paar sich
 * nicht an seiner eigenen Stolperstelle unterscheidet.
 *
 * Und: die Woerter stehen NICHT im amtlichen Wortschatz, und das ist
 * richtig so. Der Wortschatz ist die Liste, die Lea koennen soll; diese
 * hier ist eine Liste von OHREN-Uebungen. „think" und „sink" lernt man
 * nicht als Vokabeln, man lernt, sie auseinanderzuhalten. Ihre Kennungen
 * tragen deshalb `lt:` und koennen mit keinem Vokabelfach kollidieren. */
export const LAUTPAARE = [
  { a: 'think', b: 'sink',  stolper: 'th' },
  { a: 'three', b: 'free',  stolper: 'th' },
  /* three/tree ist das EINZIGE Paar an der wichtigsten Stolperstelle,
     das sich malen laesst - und deshalb steht es hier. Ohne es hat
     Fiona zum `th` gar nichts. `mouth/mouse` waere das naechste
     gewesen und faellt durch: aus „mouth" wird mit der deutschen
     Ersetzung „mous" und nicht „mouse", und die Zuordnung wird
     nachgerechnet und nicht geglaubt. */
  { a: 'three', b: 'tree',  stolper: 'th' },
  { a: 'thin',  b: 'fin',   stolper: 'th' },
  { a: 'thing', b: 'sing',  stolper: 'th' },

  { a: 'wine',  b: 'vine',  stolper: 'wv' },
  { a: 'west',  b: 'vest',  stolper: 'wv' },
  { a: 'wet',   b: 'vet',   stolper: 'wv' },
  { a: 'wiper', b: 'viper', stolper: 'wv' },

  { a: 'dog',   b: 'dock',  stolper: 'auslaut' },
  { a: 'bad',   b: 'bat',   stolper: 'auslaut' },
  { a: 'cab',   b: 'cap',   stolper: 'auslaut' },
  { a: 'leave', b: 'leaf',  stolper: 'auslaut' },

  { a: 'pat',   b: 'pet',   stolper: 'ea' },
  { a: 'pan',   b: 'pen',   stolper: 'ea' },
  { a: 'man',   b: 'men',   stolper: 'ea' },
  { a: 'bad',   b: 'bed',   stolper: 'ea' },
];

/**
 * Der Vorrat zum LESEN (E7): die Woerter, die schon ein Bild haben.
 *
 * Der Lehrplan sieht ab Klasse 3 Lesen im Wortumfang ausdruecklich vor:
 * das geschriebene `cat` zu einem von vier Bildern. Fuer Fiona gibt es
 * das nicht - sie liest noch kein Deutsch.
 *
 * Der Vorrat WAECHST mit den Zeichnungen und steht nicht als Liste
 * daneben. Solange erst sechzehn Woerter einen Pfad haben, sind es
 * sechzehn; mit dem naechsten gezeichneten Wort sind es siebzehn, ohne
 * dass hier eine Zeile zu aendern waere. Eine zweite Liste ware genau die
 * Sorte, die veraltet (Regel 6): sie stuende neben `BILDER` und muesste
 * mitwachsen.
 */
export function vorratLesen(){
  return BILDER.filter(b => b.bild).map(b => ({
    id: `ls:${b.wort}`, name: b.wort, wort: b.wort,
    sorte: 'bild', gebiet: b.gebiet, bild: b.bild }));
}

/**
 * Die Zeichnungen der Lautpaare (E5 fuer Fiona).
 *
 * WARUM SIE NICHT IN `BILDER` STEHEN: `BILDER` ist der Bildplan zum
 * amtlichen Wortschatz - 86 Woerter, die Lea koennen soll. Die Lautpaare
 * sind bewusst KEINE Vokabeln, sondern Ohrenuebungen; „vine" und „cab"
 * haetten dort nichts verloren und wuerden die Zaehlung „x von 86
 * gezeichnet" verfaelschen.
 *
 * WER SCHON EIN BILD HAT, BEKOMMT KEIN ZWEITES: `dog` steht im Bildplan,
 * und `bildFuerLaut` holt es dort. Eine zweite Zeichnung desselben Hundes
 * waere die, die beim naechsten Nachbessern auseinanderlaeuft (Regel 6:
 * was zweimal dasteht, veraltet einmal).
 *
 * ES SIND ACHT UND NICHT ZEHN. `dock` war gezeichnet und ist wieder
 * herausgeflogen: der Steg sah aus wie ein Tisch, und ein Bild, das ein
 * Kind falsch benennt, macht die Hoeraufgabe zur Ratefrage. Kein Tor
 * haette das gesagt - der Pfad war gueltig, im Rahmen, gross genug und
 * eigen (Regel 4: kein Tor ersetzt den Blick).
 */
export const LAUTBILDER = {
  // th: aus „three" wird im Deutschen „tree".
  three: [
    { f:'rot',  d:'M32 6a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
    { f:'blau', d:'M17 36a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
    { f:'gelb', d:'M47 36a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
  ],
  tree: [
    { f:'braun',      d:'M28 40h8v20h-8Z' },
    { f:'gruen',      d:'M32 4c14 0 24 11 24 21s-10 19-24 19S8 35 8 25 18 4 32 4Z' },
    { f:'gruenDunkel',d:'M40 6c10 3 16 11 16 19 0 10-10 19-24 19 12-2 20-10 20-19 0-8-4-15-12-19Z' },
  ],
  // w gegen v: das deutsche w klingt wie das englische v.
  wine: [
    { f:'grau',       d:'M29 38h6v14h-6ZM18 52h28v6H18Z' },
    { f:'licht',      d:'M16 8h32v10c0 12-7 20-16 20s-16-8-16-20Z' },
    { f:'rot',        d:'M17 18h30c0 12-7 20-15 20s-15-8-15-20Z' },
    { f:'rotDunkel',  d:'M38 18h9c0 12-7 20-15 20 8-3 6-12 6-20Z' },
  ],
  vine: [
    { f:'braun',      d:'M30 4h4v12h-4Z' },
    { f:'gruen',      d:'M34 8c8-5 17-3 19 2-6 7-16 7-19-2Z' },
    { f:'lila',       d:'M20 22a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm24 0a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM32 22a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM26 36a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm12 0a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM32 50a7 7 0 1 0 0 12 7 7 0 0 0 0-12Z' },
    { f:'lilaDunkel', d:'M22 24a7 7 0 0 1 5 12c4-1 6-4 6-7 0-4-4-7-8-7-1 0-2 1-3 2Zm12 0a7 7 0 0 1 5 12c4-1 6-4 6-7 0-4-4-7-8-7-1 0-2 1-3 2Zm-6 14a7 7 0 0 1 5 12c4-1 6-4 6-7 0-4-4-7-8-7-1 0-2 1-3 2Z' },
  ],
  // Auslautverhaertung: das b am Ende klingt wie p.
  cab: [
    { f:'gelb',       d:'M26 8h12v8H26Z' },
    { f:'gelb',       d:'M16 18h26l9 14H7Z' },
    { f:'gelb',       d:'M2 32h60v14H2Z' },
    { f:'blauDunkel', d:'M19 21h11v9H12Zm15 0h6l6 9H34Z' },
    { f:'gelbDunkel', d:'M2 40h60v6H2Z' },
    { f:'tinte',      d:'M14 42a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm36 0a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z' },
    { f:'grau',       d:'M14 46a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm36 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
  ],
  cap: [
    { f:'blau',       d:'M12 36c0-13 9-22 20-22s20 9 20 22Z' },
    { f:'blauDunkel', d:'M32 14c11 0 20 9 20 22h-9c0-12-5-20-11-22Z' },
    { f:'blauDunkel', d:'M6 36h50c4 0 6 3 6 7H6Z' },
    { f:'licht',      d:'M30 10h4v5h-4Z' },
  ],
  // a gegen e: das englische a zwischen ae und a wird zum deutschen e.
  pan: [
    { f:'braunDunkel',d:'M42 26h20v7H42Z' },
    { f:'grauDunkel', d:'M8 22h34v11c0 8-6 14-14 14h-6c-8 0-14-6-14-14Z' },
    { f:'grau',       d:'M13 26h24v7c0 5-4 9-9 9h-6c-5 0-9-4-9-9Z' },
    { f:'licht',      d:'M16 28c1 5 4 9 8 11-6-1-10-6-10-11Z' },
  ],
  pen: [
    { f:'gruen',      d:'M25 4h14v32H25Z' },
    { f:'gruenDunkel',d:'M33 4h6v32h-6Z' },
    { f:'grauDunkel', d:'M39 10h6v16h-6Z' },
    { f:'grau',       d:'M25 38h14l-7 12Z' },
    { f:'tinte',      d:'M30 46h4l-2 12Z' },
  ],
};

/** Die Zeichnung zu einem Lautwort - erst die eigene, dann der Bildplan. */
export function bildFuerLaut(wort){
  return LAUTBILDER[wort] || (BILDER.find(b => b.wort === wort) || {}).bild || null;
}

/**
 * Die Paare, die sich MALEN lassen - beide Woerter, nicht nur eines.
 *
 * Fiona (6) liest nicht. Zwei geschriebene Woerter sind fuer sie kein
 * Bildschirm, sondern zwei Muster; die Ebene gaebe es dann nur dem
 * Anschein nach. Mit Bildern ist es dieselbe Aufgabe: hoeren und zeigen,
 * und was sie unterscheidet, ist genau ein Laut.
 *
 * EIN Wort mit Bild reicht nicht - dann stuende ein Bild neben einem
 * Wort, und die Antwort waere „das mit dem Bild".
 */
export function lautpaareMalbar(){
  return LAUTPAARE.filter(p => bildFuerLaut(p.a) && bildFuerLaut(p.b));
}

/**
 * Der Vorrat der Lautpaare (E5) - ZWEI Gegenstaende je Paar.
 *
 * Gefragt wird einmal nach dem einen und einmal nach dem anderen Wort.
 * Nur eine Richtung waere die halbe Uebung: wer „think" heraushoert,
 * hoert deshalb noch lange nicht „sink" heraus - und im Leitner stuende
 * ein Paar, das zur Haelfte nie geprueft wurde.
 */
export function vorratLaute({ nurMalbar = false } = {}){
  const aus = [];
  for (const p of (nurMalbar ? lautpaareMalbar() : LAUTPAARE)) {
    const st = STOLPERSTELLEN.find(s => s.id === p.stolper);
    for (const wort of [p.a, p.b]) {
      const gegen = wort === p.a ? p.b : p.a;
      /* Beide Zeichnungen haengen am STUECK und nicht am Bildschirm: der
         Schirm bekommt zwei Karten und darf nicht selbst nachschlagen
         muessen, welches Bild zu welchem Wort gehoert. */
      aus.push({ id: `lt:${p.a}-${p.b}:${wort}`, name: wort, wort,
        sorte: 'laut', gegen,
        bild: bildFuerLaut(wort), gegenBild: bildFuerLaut(gegen),
        stolper: p.stolper, stolperName: st.name, grund: st.grund });
    }
  }
  return aus;
}

/**
 * Der Vorrat zum LEGEN (E8): dieselben Woerter, Buchstabe fuer Buchstabe.
 *
 * Der Lehrplan sagt fuer Jahrgangsstufe 3 „abschreibend, mit Vorlage" -
 * also nicht frei buchstabieren, sondern das Wort danebenliegen haben und
 * es legen. Der Vorrat ist deshalb derselbe wie beim Hoeren; neu ist nur,
 * was damit getan wird.
 *
 * EIN Wort faellt heraus, und zwar gemessen, nicht nach Gefuehl:
 * `forty-five` ist das einzige mit einem Zeichen, das kein Buchstabe ist.
 * Ein Bindestrich als Karte waere keine Schreibuebung, sondern ein
 * Raetsel darueber, wo der Strich hingehoert - und ihn stillschweigend
 * wegzulassen hiesse, ein falsches Wort zum Abschreiben vorzulegen.
 * Bleiben 24 Woerter, das laengste `fifteen` mit sieben Buchstaben.
 *
 * Eigene Kennung (`lg:`) aus demselben Grund wie bei „Sag es": wer
 * `blue` gehoert und gezeigt hat, hat es damit nicht geschrieben.
 */
export function vorratLegen(){
  return vorratHoeren()
    .filter(x => /^[a-z]+$/.test(x.wort))
    .map(x => ({ ...x, id: `lg:${x.id}` }));
}

/**
 * Der Vorrat zum BAUEN (E9c): dieselben zwanzig Saetze, Wort fuer Wort.
 *
 * Eine Stufe ueber „Leg das Wort": dort sind die Karten Buchstaben und
 * das Ziel ein Wort, hier sind die Karten Woerter und das Ziel ein Satz.
 * Dasselbe Bauteil, andere Karten - das ist der ganze Unterschied, und
 * deshalb hat die Ebene fast nichts gekostet.
 *
 * Eigene Kennung (`bs:`), wie ueberall: wer einen Satz GESAGT hat, hat
 * ihn damit nicht zusammengesetzt.
 */
export function vorratBauen(){
  return vorratChunks().map(x => ({ ...x, id: `bs:${x.id}` }));
}

/**
 * Drei Ablenker zu einem Gegenstand - aus derselben Sorte, gewuerfelt mit
 * dem Keim der Aufgabe.
 *
 * Der Wuerfel kommt von aussen, wie bei `Rechnen.ablenkerFuer`: dieselbe
 * Sitzung muss dieselbe Auswahl ergeben, sonst steht bei jedem Neuzeichnen
 * etwas anderes da.
 */
export function ablenkerFuer(ziel, wuerfel, wieviel = 3){
  /* Aus welchem Topf die Ablenker kommen, entscheidet die SORTE.
   *
   * „Lies das Wort" (E7) zieht aus den gezeichneten Bildern, alle anderen
   * aus dem Hoervorrat. Ohne diese Zeile bekaeme ein Bild drei Farbflecke
   * daneben - und dann waere die Aufgabe „welches ist kein Fleck?" und
   * nicht „welches Bild heisst `cat`?". */
  const topf = ziel.sorte === 'bild' ? vorratLesen() : vorratHoeren();
  /* Gesiebt wird nach dem WORT und nicht nur nach der Kennung (E13).
     Seit „Hoeren und zeigen" dieselben Zeichnungen benutzt, gibt es
     dasselbe Bild unter zwei Kennungen (`en:bild:cat` und `ls:cat`) -
     und zwei gleiche Katzen nebeneinander waeren keine Aufgabe, sondern
     ein Fehler, den das Kind sich selbst erklaeren muesste. */
  const andere = topf.filter(x => x.sorte === ziel.sorte
    && x.id !== ziel.id && x.wort !== ziel.wort);
  for (let i = andere.length - 1; i > 0; i--) {
    const j = Math.floor(wuerfel() * (i + 1));
    [andere[i], andere[j]] = [andere[j], andere[i]];
  }
  return andere.slice(0, wieviel);
}

/* ---------- Die Bilder (E4) ----------------------------------------------
 *
 * 140 Woerter wollen Bilder, sagt das Konzept - und das ist Arbeit und kein
 * Code. Was hier steht, ist der PLAN dafuer: welches Wort ein Bild bekommt,
 * und WAS darauf zu sehen sein soll. Die Zeichnung selbst kommt danach.
 *
 * Zwei Listen, und jedes der 151 Woerter steht in genau einer davon:
 *
 *   BILDER    Wort + Motiv. Das Motiv ist englisch und wortwoertlich das,
 *             was im Bild-Prompt landet - `tools/bildprompt.mjs` setzt es
 *             ein, ohne es umzuschreiben.
 *   NUR_WORT  Funktionswoerter. „about", „please", „the" - man kann sie
 *             nicht malen, und ein Bild dafuer waere geraten. Sie lernt man
 *             im SATZ (E9, E11), nicht am Bild.
 *
 * Die zehn Farben stehen in KEINER der beiden: ihr Bild ist der Farbfleck
 * aus E3, es muss niemand malen. Das Untertor `englisch` rechnet die drei
 * Mengen zusammen und verlangt, dass sie die 151 genau einmal decken - eine
 * Einteilung, die man vergessen kann, waere in einem Jahr keine mehr.
 *
 * EIN WORT AUS `BILDER` HAT ENTWEDER `bild` ODER `ohneBild`, nie keins von
 * beiden. `bild` ist die Zeichnung, `ohneBild` der GRUND, warum es keine
 * gibt - als Text und nicht als Kommentar, weil ein Kommentar fuer ein
 * Werkzeug nicht da ist. Vorher war beides dasselbe: ein vergessenes Wort
 * und ein absichtlich weggelassenes sahen im Datensatz gleich aus, und die
 * Zaehlung „84 von 86" las sich wie zwei offene Posten, obwohl der Plan
 * fertig war. Eine Pruefung, die den Unterschied nicht sehen kann, meldet
 * ihn nie (Regel 1) - `inhalt` verlangt jetzt eines von beiden.
 *
 * WAS HIER MEINE ENTSCHEIDUNG IST, und das gehoert dazu: die Einteilung
 * selbst. Das ISB sagt nicht, welches Wort man malen kann - beide amtlichen
 * Listen kennen den Unterschied gar nicht. Amtlich ist die Wortliste; die
 * Spalte daneben ist meine. Deshalb steht sie hier und nicht im
 * Referenzverzeichnis.
 */

/** Die Themenblaetter - je Blatt EIN Prompt, je Prompt zehn Felder. */
export const BILDGEBIETE = [
  { id: 'tiere',       titel: 'Tiere' },
  { id: 'essen',       titel: 'Essen und Trinken' },
  { id: 'schule',      titel: 'In der Schule' },
  { id: 'kleidung',    titel: 'Kleidung' },
  { id: 'menschen',    titel: 'Menschen und Familie',
    /* Ein `hinweis` steht im Prompt UNTER dem Stil und ueber den Feldern.
       Er gilt fuer das ganze Blatt und sagt, was die zehn Felder
       miteinander zu tun haben - das kann kein einzelnes Motiv sagen. */
    hinweis: 'All the people on this sheet are drawn in the same way: the same '
      + 'proportions, the same simple round head, no faces except two dot eyes '
      + 'and a mouth. Only height, hair and clothing tell them apart.' },
  { id: 'zuhause',     titel: 'Zuhause, Feste und Zeit' },
  { id: 'wo',          titel: 'Wo? — die Praepositionen',
    /* Der wichtigste Hinweis von allen. Auf diesem Blatt ist der
       Unterschied zwischen den Feldern die ganze Lehre: waeren Kiste und
       Ball je Feld anders gezeichnet, lernte ein Kind „mal ist da eine
       Kiste und mal ein Korb" statt „auf, unter, neben". */
    hinweis: 'Every panel on this sheet shows THE SAME closed box and THE SAME '
      + 'ball, drawn identically, in the same size and the same position on the '
      + 'ground line. The ONLY difference between the panels is where the ball '
      + 'is. Panel 6 shows a table instead of the box, because a ball cannot lie '
      + 'under a box that stands on the floor.' },
  { id: 'gegensaetze', titel: 'Gegensaetze und Gefuehle',
    hinweis: 'Where a panel shows a pair, both halves are drawn identically apart '
      + 'from the one property the word is about, and the half that the word '
      + 'means is the solid black one.' },
  { id: 'sport',       titel: 'Spielen und Sport' },
  { id: 'rest',        titel: 'Laender und Uebriges' },
];

/* Wort, Themenblatt, Motiv.
 *
 * Das Motiv ist ENGLISCH, weil der Prompt englisch ist - eine deutsche
 * Beschreibung muesste beim Einsetzen uebersetzt werden, und dabei geht
 * genau die Genauigkeit verloren, um die es hier geht.
 *
 * Es beschreibt EINEN Gegenstand in EINER Haltung. „a cat" reicht nicht -
 * ein Bildermacher zeichnet dann zehnmal etwas anderes, mal von vorn, mal
 * springend, und die zehn Felder passen nicht zusammen. Deshalb steht die
 * Ansicht dabei. */
/** Der Rahmen, in dem ein Bild gezeichnet ist. Quadratisch, 64 Einheiten -
 *  dieselbe Groesse fuer alle 86, sonst laesst sich kein Blatt schneiden. */
export const BILD_RAHMEN = '0 0 64 64';

/**
 * Die Farben der Bilder - EINE Tafel fuer alle.
 *
 * Vorher war jedes Bild eine einzige Flaeche in Tinte. Das war schnell
 * gezeichnet und schlecht zu erkennen: ein Apfel und eine Tomate sind als
 * schwarzer Umriss fast dasselbe, und ein Kind, das ein Wort noch nicht
 * kennt, hat nichts als die Silhouette. Farbe ist hier kein Schmuck,
 * sondern der zweite Hinweis neben der Form - rot und rund mit Blatt ist
 * ein Apfel, rot und flach mit gruener Krone eine Tomate.
 *
 * ZWEI TOENE JE FARBE, hell und dunkel: der dunkle liegt als Schattenseite
 * auf der rechten Haelfte, und daraus wird aus einer Scheibe ein Koerper.
 * Ohne ihn sehen zwoelf flache Kreise aus wie zwoelf Aufkleber.
 *
 * SIE STEHT HIER UND NICHT IM STILBLATT. Ein Bild wird als `<path fill>`
 * gezeichnet, nicht als Klasse - sonst braeuchte jede der sechzehn
 * Zeichnungen eigene Regeln im CSS, und die Farbtafel stuende an zwei
 * Orten (Regel 6: was zweimal dasteht, veraltet einmal).
 */
export const BILDFARBEN = {
  rot:'#E4572E', rotDunkel:'#B23A18',
  gruen:'#3FA34D', gruenDunkel:'#2A7638',
  blau:'#3D7DD6', blauDunkel:'#2A5AA3',
  gelb:'#F2B705', gelbDunkel:'#C99000',
  braun:'#A9703F', braunDunkel:'#7C4E27',
  lila:'#8E5AA8', lilaDunkel:'#6B3F82',
  grau:'#9AA7B4', grauDunkel:'#6B7784',
  tinte:'#2B3440', creme:'#FBEFD8', wolke:'#DCE3EA', licht:'#FFFFFF',
};

/**
 * Ein Bild als SVG - die EINZIGE Stelle, an der aus Flaechen Markup wird.
 *
 * Drei Bildschirme zeigen dieselben Zeichnungen: „Lies das Wort" (E7),
 * „Zwei Wörter, ein Laut" mit Bildern (E5b) und der Vorlauf. Drei
 * Fassungen waeren drei Urteile darueber, wie ein Bild aussieht, und beim
 * naechsten Umbau veraltet eines davon (Regel 6).
 *
 * Eine unbekannte Farbe wird NICHT stillschweigend schwarz: sie faellt auf
 * `tinte` zurueck, und das Tor `inhalt` meldet sie. Ein Tippfehler im
 * Farbnamen ist sonst ein Bild, das aussieht wie vorher - einfarbig.
 */
export function bildSvg(stuecke, klasse = 'wortbild'){
  return `<svg class="${klasse}" viewBox="${BILD_RAHMEN}" aria-hidden="true">`
    + (stuecke || []).map(s =>
        `<path d="${s.d}" fill="${BILDFARBEN[s.f] || BILDFARBEN.tinte}" fill-rule="evenodd"/>`
      ).join('')
    + '</svg>';
}
export const BILDER = [
  // --- Tiere ---
  { wort: 'cat',      gebiet: 'tiere',
    bild: [
      { f:'braun',      d:'M2 56c9 0 14-6 14-13h5c0 11-8 18-19 18Z' },
      { f:'braun',      d:'M20 34h24a6 6 0 0 1 6 6v18H14V40a6 6 0 0 1 6-6Z' },
      { f:'creme',      d:'M32 42c4 0 6 3 6 7v9H26v-9c0-4 2-7 6-7Z' },
      { f:'braun',      d:'M17 20 14 5l13 5Z' },
      { f:'braun',      d:'M47 20 50 5 37 10Z' },
      { f:'braun',      d:'M32 8c-9 0-16 6-16 14s7 14 16 14 16-6 16-14S41 8 32 8Z' },
      { f:'braunDunkel',d:'M40 9c5 2 8 7 8 13 0 8-7 14-16 14 7-2 12-7 12-14 0-5-2-10-4-13Z' },
      { f:'rot',        d:'M19 16 17 8l7 3Z' },
      { f:'rot',        d:'M45 16 47 8l-7 3Z' },
      { f:'creme',      d:'M32 26c5 0 9 2 9 5s-4 5-9 5-9-2-9-5 4-5 9-5Z' },
      { f:'gruen',      d:'M25 17a3 4 0 1 0 0 8 3 4 0 0 0 0-8Z' },
      { f:'gruen',      d:'M39 17a3 4 0 1 0 0 8 3 4 0 0 0 0-8Z' },
      { f:'tinte',      d:'M25 18a1 3 0 1 0 0 6 1 3 0 0 0 0-6Z' },
      { f:'tinte',      d:'M39 18a1 3 0 1 0 0 6 1 3 0 0 0 0-6Z' },
      { f:'rot',        d:'M29 27h6l-3 4Z' },
    ],
    motiv: 'a cat sitting upright, seen from the side, tail curled around its paws' },
  { wort: 'chicken',  gebiet: 'tiere',
    bild: [
      { f:'grau',   d:'M16 32 4 22l5 12-5 12 12-8Z' },
      { f:'creme',  d:'M14 38c0-10 9-18 20-18s20 8 20 18-9 16-20 16-20-6-20-16Z' },
      { f:'gelb',   d:'M26 52h4v8h-4Zm12 0h4v8h-4Z' },
      { f:'creme',  d:'M40 10a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },
      { f:'rot',    d:'M36 6c2 0 3 1 3 3 1-2 4-2 4 1 1-2 3-1 3 2v2h-10Z' },
      { f:'gelb',   d:'M49 18h8l-8 6Z' },
      { f:'tinte',  d:'M43 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'a hen standing, seen from the side, with a comb and a rounded body' },
  { wort: 'dog',      gebiet: 'tiere',
    bild: [
      { f:'braunDunkel',d:'M21 20c-5 1-9 7-9 14s4 13 9 14ZM43 20c5 1 9 7 9 14s-4 13-9 14Z' },
      { f:'braun',      d:'M32 10c-7 0-12 5-12 12v11c0 10 5 17 12 17s12-7 12-17V22c0-7-5-12-12-12Z' },
      { f:'creme',      d:'M32 32c5 0 9 3 9 7s-4 8-9 8-9-4-9-8 4-7 9-7Z' },
      { f:'tinte',      d:'M26 22a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
      { f:'tinte',      d:'M32 34c3 0 5 2 5 3 0 2-2 3-5 3s-5-1-5-3c0-1 2-3 5-3Z' },
    ],
    motiv: 'a dog sitting upright, seen from the side, with floppy ears' },
  { wort: 'fish',     gebiet: 'tiere',
    bild: [
      { f:'blauDunkel', d:'M40 22 58 10l-4 22 4 22-18-12Z' },
      { f:'blau',       d:'M6 32c9-14 26-18 37-11 5 3 9 7 11 11-2 4-6 8-11 11-11 7-28 3-37-11Z' },
      { f:'blauDunkel', d:'M26 16c5-4 11-5 15-2-5 0-10 2-13 5Z' },
      { f:'creme',      d:'M12 38c9 7 22 9 30 4-8 8-22 6-30-4Z' },
      { f:'licht',      d:'M18 23a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z' },
      { f:'tinte',      d:'M19 26a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
    ],
    motiv: 'a single fish seen from the side, with a fan tail and one round eye' },
  { wort: 'hamster',  gebiet: 'tiere',
    bild: [
      { f:'braun',  d:'M18 14a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm28 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
      { f:'braun',  d:'M32 14c12 0 21 9 21 21s-9 21-21 21-21-9-21-21 9-21 21-21Z' },
      { f:'braunDunkel', d:'M38 16c9 3 15 10 15 19 0 12-9 21-21 21 9-3 16-11 16-21 0-8-4-15-10-19Z' },
      { f:'creme',  d:'M32 32c8 0 14 5 14 11s-6 12-14 12-14-6-14-12 6-11 14-11Z' },
      { f:'tinte',  d:'M24 26a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm16 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
      { f:'rot',    d:'M29 33h6l-3 4Z' },
      { f:'gelb',   d:'M32 44a4 5 0 1 0 0 10 4 5 0 0 0 0-10Z' },
    ],
    motiv: 'a hamster sitting on its hind legs, seen from the side, holding a seed' },
  { wort: 'horse',    gebiet: 'tiere',
    bild: [
      { f:'braunDunkel', d:'M8 30c-5 3-6 10-4 16h5c-2-6-1-11 2-13Z' },
      { f:'braun',  d:'M14 28h24a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6v-6a6 6 0 0 1 6-6Z' },
      { f:'braun',  d:'M36 32l6-18h8l-4 20Z' },
      { f:'braun',  d:'M42 8h14l2 8-6 6h-8Z' },
      { f:'braun',  d:'M44 3h4l-2 6Z' },
      { f:'braun',  d:'M12 46h6v14h-6Zm10 0h5v14h-5Zm9 0h5v14h-5Zm8 0h6v14h-6Z' },
      { f:'braunDunkel', d:'M42 12h7l-4 14h-6Z' },
      { f:'tinte',  d:'M50 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'a horse standing, seen from the side, with a mane and a tail' },
  { wort: 'mouse',    gebiet: 'tiere',
    bild: [
      { f:'grauDunkel', d:'M42 46c10 0 17-7 17-16h-5c0 6-5 11-12 11Z' },
      { f:'grau',   d:'M18 14a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z' },
      { f:'rot',    d:'M18 20a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z' },
      { f:'grau',   d:'M26 26c10 0 20 7 20 15s-9 13-20 13-18-5-18-13 8-15 18-15Z' },
      { f:'creme',  d:'M28 40c6 0 10 3 10 7s-4 7-10 7-10-3-10-7 4-7 10-7Z' },
      { f:'tinte',  d:'M22 34a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm14 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
      { f:'rot',    d:'M42 40h6l-3 4Z' },
    ],
    motiv: 'a mouse seen from the side, with big round ears and a long thin tail' },
  { wort: 'pet',      gebiet: 'tiere',
    ohneBild: '„pet" ist eine Sammelbezeichnung, und jedes Bild dafuer waere '
      + 'eine Katze oder ein Hund - beide stehen schon in dieser Liste. Drei '
      + 'Karten mit demselben Tier und drei verschiedenen Woertern darunter '
      + 'machen aus „Lies das Wort" ein Ratespiel.',
    motiv: 'a child seen from the front holding a small cat in both arms' },
  { wort: 'rabbit',   gebiet: 'tiere',
    bild: [
      { f:'creme',  d:'M20 4c4 0 7 6 7 14s-3 12-7 12-7-4-7-12S16 4 20 4Zm24 0c4 0 7 6 7 14s-3 12-7 12-7-4-7-12S40 4 44 4Z' },
      { f:'rot',    d:'M20 10c2 0 3 3 3 8s-1 7-3 7-3-2-3-7 1-8 3-8Zm24 0c2 0 3 3 3 8s-1 7-3 7-3-2-3-7 1-8 3-8Z' },
      { f:'creme',  d:'M32 28c11 0 19 8 19 18s-8 14-19 14-19-4-19-14 8-18 19-18Z' },
      { f:'tinte',  d:'M25 42a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm14 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
      { f:'rot',    d:'M29 50h6l-3 4Z' },
    ],
    motiv: 'a rabbit sitting, seen from the side, with two long upright ears' },
  // --- Essen und Trinken ---
  { wort: 'apple',      gebiet: 'essen',
    bild: [
      { f:'braunDunkel', d:'M30 6h4v14h-4Z' },
      { f:'gruen',       d:'M34 10c7-5 15-3 17 2-5 6-14 6-17-2Z' },
      { f:'rot',         d:'M32 18c-5-5-14-4-17 4-3 9 2 24 9 30 3 2 5 2 8 0 7-6 12-21 9-30-3-8-12-9-9-4Z' },
      { f:'rot',         d:'M32 18c5-5 14-4 17 4 3 9-2 24-9 30-3 2-5 2-8 0V18Z' },
      { f:'rotDunkel',   d:'M38 20c5 0 9 3 11 8 2 8-2 20-8 26 5-8 8-19 6-26-1-4-5-7-9-8Z' },
      { f:'licht',       d:'M20 28c1-4 4-6 7-6 2 0 2 3 0 3-3 1-4 2-5 4-1 2-3 1-2-1Z' },
    ],
    motiv: 'one apple seen from the front, with a short stalk and one leaf' },
  { wort: 'bread',      gebiet: 'essen',
    bild: [
      { f:'braun',      d:'M8 38c0-13 11-22 24-22s24 9 24 22v10a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z' },
      { f:'braunDunkel',d:'M8 44h48v4a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z' },
      { f:'creme',      d:'M18 30l6-8 3 2-6 8Zm11 0 6-8 3 2-6 8Zm11 0 6-8 3 2-6 8Z' },
    ],
    motiv: 'a whole loaf of bread seen from the side, with a rounded top' },
  { wort: 'butter',     gebiet: 'essen',
    bild: [
      { f:'licht',  d:'M4 44h56v10H4Z' },
      { f:'gelb',   d:'M12 24h34l10 8v12H22l-10-8Z' },
      { f:'gelbDunkel', d:'M46 24l10 8v12h-10Z' },
      { f:'creme',  d:'M12 24h34l-8 6H20Z' },
    ],
    motiv: 'a rectangular block of butter on a small dish, seen from the side' },
  { wort: 'cheese',     gebiet: 'essen',
    bild: [
      { f:'gelb',       d:'M6 46 50 16c5 3 8 9 8 15v15Z' },
      { f:'gelbDunkel', d:'M6 46h52v6H6Z' },
      { f:'creme',      d:'M22 40a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm18-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'a triangular wedge of cheese seen from the side, with three round holes' },
  { wort: 'chips',      gebiet: 'essen',
    bild: [
      { f:'gelb',   d:'M22 8h5v22h-5Zm8-4h5v26h-5Zm8 4h5v22h-5Z' },
      { f:'rot',    d:'M16 26h32l-4 32H20Z' },
      { f:'rotDunkel', d:'M34 26h14l-4 32h-10Z' },
      { f:'licht',  d:'M18 34h28l-1 8H19Z' },
    ],
    motiv: 'a paper cone of chips (french fries) standing upright, seen from the front' },
  { wort: 'chocolate',  gebiet: 'essen',
    bild: [
      { f:'braunDunkel', d:'M10 10h44v44H10Z' },
      { f:'braun',  d:'M14 14h16v16H14Zm20 0h16v16H34ZM14 34h16v16H14Zm20 0h16v16H34Z' },
      { f:'creme',  d:'M40 4h20v14H40Z' },
    ],
    motiv: 'a bar of chocolate seen from above, divided into six squares, one corner broken off' },
  { wort: 'drink',      gebiet: 'essen',
    bild: [
      { f:'gelb',   d:'M18 20h28l-4 38a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4Z' },
      { f:'gelbDunkel', d:'M36 20h10l-4 38a4 4 0 0 1-4 4h-8c4 0 6-2 6-4Z' },
      { f:'rot',    d:'M42 4h6l-6 18h-6Z' },
      { f:'licht',  d:'M22 28h20l-1 8H23Z' },
    ],
    motiv: 'a tall glass with a bent drinking straw, seen from the side' },
  { wort: 'eat',        gebiet: 'essen',
    bild: [
      { f:'licht',  d:'M32 16a19 19 0 1 0 0 38 19 19 0 0 0 0-38Z' },
      { f:'wolke',  d:'M32 24a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
      { f:'grauDunkel', d:'M4 6h2v12H4Zm4 0h2v12H8Zm4 0h2v12h-2Z' },
      { f:'grauDunkel', d:'M3 18h12v4c0 3-2 5-4 5v31H7V27c-2 0-4-2-4-5Z' },
      { f:'grauDunkel', d:'M56 6c3 0 5 5 5 10s-2 9-4 10v32h-4V26c-2-1-4-5-4-10s2-10 5-10Z' },
    ],
    motiv: 'a round empty plate seen from above with a fork on its left and a knife on its right' },
  { wort: 'egg',        gebiet: 'essen',
    bild: [
      { f:'wolke',      d:'M14 34c0-11 8-20 18-20 4 0 8 2 11 2 8 0 13 5 13 11 0 5-3 8-6 10 1 7-5 12-11 12-5 0-8-2-10-6-7 2-15-2-15-9Z' },
      { f:'gelb',       d:'M32 24a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },
      { f:'gelbDunkel', d:'M36 25c4 2 6 5 6 9 0 5-4 9-10 10 4-2 7-6 7-10 0-3-1-6-3-9Z' },
    ],
    motiv: 'a boiled egg standing in an egg cup, seen from the side' },
  { wort: 'fruit',      gebiet: 'essen',
    bild: [
      { f:'braun',  d:'M6 38h52c0 12-11 20-26 20S6 50 6 38Z' },
      { f:'rot',    d:'M20 22a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },
      { f:'gelb',   d:'M40 20a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
      { f:'gruen',  d:'M30 12a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'braunDunkel', d:'M6 38h52v6H6Z' },
    ],
    motiv: 'a bowl seen from the side, filled with an apple, a pear and a bunch of grapes' },
  /* KEINE SCHEIBEN MEHR, sondern eine Keule mit Knochen. Die alte
     Zeichnung war „zwei ovale Scheiben von oben" - bei 76 Bildpunkten ist
     das ein roter Ball, und der Zellvergleich hat sie mit „tomato" zu
     58 % gleich gemessen (Grenze 55 %). Beides rund, beides rot: wer
     „ham" liest und auf die Tomate tippt, hat nichts falsch gemacht. Die
     Keule ist schief, hat einen Knochen und ist mit nichts sonst im
     Vorrat zu verwechseln. */
  { wort: 'ham',        gebiet: 'essen',
    bild: [
      { f:'creme',     d:'M13 51a24 15 -45 1 1 34-34 24 15 -45 1 1-34 34Z' },
      { f:'rot',       d:'M15 49a21 12 -45 1 1 30-30 21 12 -45 1 1-30 30Z' },
      { f:'rotDunkel', d:'M24 40a14 5 -45 1 1 20-20 14 5 -45 1 1-20 20Z' },
      { f:'creme',     d:'M45 25 40 20 52 8 57 13Z' },
      { f:'creme',     d:'M57 8a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
      { f:'creme',     d:'M51 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
    ],
    motiv: 'a ham on the bone lying at an angle, seen from the side, with a pale rind and the bone sticking out at the narrow end' },
  { wort: 'plum',       gebiet: 'essen',
    bild: [
      { f:'lila',   d:'M32 16c10 0 18 9 18 20s-8 22-18 22-18-11-18-22 8-20 18-20Z' },
      { f:'lilaDunkel', d:'M38 18c7 4 12 11 12 18 0 11-8 22-18 22 8-4 14-13 14-22 0-7-3-13-8-18Z' },
      { f:'gruen',  d:'M32 16c-2-6 2-10 8-12 1 6-2 11-8 12Z' },
      { f:'licht',  d:'M22 28c2-4 6-7 9-7 2 0 2 3 0 3-3 1-5 3-6 5-1 2-4 1-3-1Z' },
    ],
    motiv: 'one plum seen from the front, with a short stalk and one leaf, and a vertical groove' },
  { wort: 'salad',      gebiet: 'essen',
    bild: [
      { f:'gruen',  d:'M14 34c-4-8 2-15 9-13-1-7 9-11 13-6 5-4 13 0 12 6 7 2 8 9 4 13Z' },
      { f:'gruenDunkel', d:'M40 21c6 2 7 9 3 13h-9c4-3 7-8 6-13Z' },
      { f:'rot',    d:'M22 24a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm22 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
      { f:'licht',  d:'M6 34h52c0 13-11 22-26 22S6 47 6 34Z' },
      { f:'wolke',  d:'M6 34h52v5H6Z' },
    ],
    motiv: 'a bowl seen from the side, heaped with leaves of lettuce' },
  { wort: 'strawberry', gebiet: 'essen',
    bild: [
      { f:'gruen',      d:'M32 8c1 4 1 7 1 9h-2c0-2 0-5 1-9Z' },
      { f:'gruen',      d:'M32 20c-6-8-14-8-19-6 2 6 8 10 14 10h10c6 0 12-4 14-10-5-2-13-2-19 6Z' },
      { f:'rot',        d:'M32 24c9 0 17 5 17 12 0 9-9 20-17 24-8-4-17-15-17-24 0-7 8-12 17-12Z' },
      { f:'rotDunkel',  d:'M38 25c7 2 11 6 11 11 0 9-9 20-17 24 6-6 12-15 12-22 0-5-2-10-6-13Z' },
      { f:'gelb',       d:'M25 34a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm15 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'one strawberry seen from the front, pointing down, with a leafy crown and seed dots' },
  { wort: 'sweets',     gebiet: 'essen',
    bild: [
      { f:'rot',    d:'M22 22h20v20H22Z' },
      { f:'rotDunkel', d:'M32 22h10v20H32Z' },
      { f:'gruen',  d:'M22 24 8 16v32l14-8Z' },
      { f:'gruen',  d:'M42 24l14-8v32l-14-8Z' },
      { f:'licht',  d:'M26 26h6v4h-6Z' },
    ],
    motiv: 'three wrapped sweets with twisted ends, lying flat, seen from above' },
  { wort: 'tea',        gebiet: 'essen',
    bild: [
      { f:'grau',       d:'M6 52h44v6H6Z' },
      { f:'rot',        d:'M10 20h34v18a17 17 0 0 1-34 0Z' },
      { f:'rotDunkel',  d:'M36 20h8v18a17 17 0 0 1-17 17c9-2 9-9 9-17Z' },
      { f:'rot',        d:'M46 24h6a9 9 0 0 1 0 18h-4a20 20 0 0 0 2-6h2a4 4 0 0 0 0-8h-6Z' },
      { f:'braun',      d:'M14 24h26v6a13 13 0 0 1-26 0Z' },
    ],
    motiv: 'a teacup on a saucer, seen from the side, with a teabag string over the rim' },
  { wort: 'tomato',     gebiet: 'essen',
    bild: [
      { f:'rot',        d:'M32 20c12 0 21 8 21 18s-9 18-21 18-21-8-21-18 9-18 21-18Z' },
      { f:'rotDunkel',  d:'M40 22c8 3 13 9 13 16 0 9-9 18-21 18 12-2 19-9 19-18 0-7-4-13-11-16Z' },
      { f:'gruen',      d:'M32 12c1 0 2 2 2 5l7-3-2 6 8 1-8 4 3 5-8-2-2 6-3-6-8 2 3-5-8-4 8-1-2-6 7 3c0-3 1-5 3-5Z' },
      { f:'licht',      d:'M19 32c2-4 6-6 10-6 2 0 2 3 0 3-4 1-6 2-8 5-1 2-3 0-2-2Z' },
    ],
    motiv: 'one tomato seen from the front, with a five-pointed star of leaves on top' },
  { wort: 'water',      gebiet: 'essen',
    bild: [
      { f:'grau',       d:'M14 12h36l-4 42a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6Z' },
      { f:'blau',       d:'M17 30h30l-2 24a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4Z' },
      { f:'blauDunkel', d:'M17 30h30l-1 6H18Z' },
      { f:'licht',      d:'M22 16h4l2 38h-4Z' },
    ],
    motiv: 'a plain glass half filled with water, seen from the side' },
  // --- In der Schule ---
  { wort: 'board',            gebiet: 'schule',
    bild: [
      { f:'braun',      d:'M2 6h60v38H2Z' },
      { f:'gruen',      d:'M6 10h52v30H6Z' },
      { f:'braun',      d:'M14 44l-6 16h6l4-12Zm36 0 6 16h-6l-4-12Z' },
      { f:'licht',      d:'M12 18h26v3H12Zm0 8h34v3H12Zm0 8h18v3H12Z' },
    ],
    motiv: 'a classroom board on two legs, seen from the front, empty' },
  { wort: 'book',             gebiet: 'schule',
    bild: [
      { f:'blauDunkel', d:'M29 14h6v38h-6Z' },
      { f:'blau',       d:'M3 12c10-3 19-2 26 4v34c-7-6-16-7-26-4Z' },
      { f:'blau',       d:'M61 12c-10-3-19-2-26 4v34c7-6 16-7 26-4Z' },
      { f:'creme',      d:'M8 18c7-2 13-1 18 3v27c-5-4-11-5-18-3Zm48 0c-7-2-13-1-18 3v27c5-4 11-5 18-3Z' },
    ],
    motiv: 'an open book seen from the front, both pages blank' },
  { wort: 'chair',            gebiet: 'schule',
    bild: [
      { f:'braun',      d:'M16 4h26a5 5 0 0 1 5 5v25H11V9a5 5 0 0 1 5-5Z' },
      { f:'braunDunkel',d:'M8 34h48v9H8Z' },
      { f:'braun',      d:'M13 43h8v17h-8Zm30 0h8v17h-8Z' },
      { f:'creme',      d:'M18 11h22v4H18Zm0 8h22v4H18Z' },
    ],
    motiv: 'a simple wooden chair with a straight back, seen from the side' },
  { wort: 'class/classroom',  gebiet: 'schule',
    bild: [
      { f:'braun',  d:'M4 4h56v6H4Z' },
      { f:'gruen',  d:'M8 10h48v18H8Z' },
      { f:'licht',  d:'M14 16h24v3H14Zm0 6h16v3H14Z' },
      { f:'braun',  d:'M4 34h24v6H4Zm4 6h4v14H8Zm16 0h4v14h-4Z' },
      { f:'braun',  d:'M36 34h24v6H36Zm4 6h4v14h-4Zm16 0h4v14h-4Z' },
      { f:'braunDunkel', d:'M4 34h24v3H4Zm32 0h24v3H36Z' },
    ],
    motiv: 'a classroom seen from the front: a board on the wall and two desks with chairs' },
  { wort: 'pen/pencil',       gebiet: 'schule',
    bild: [
      { f:'gelb',   d:'M22 6h20v36H22Z' },
      { f:'gelbDunkel', d:'M34 6h8v36h-8Z' },
      { f:'rot',    d:'M22 2h20v6H22Z' },
      { f:'creme',  d:'M22 42h20l-10 16Z' },
      { f:'tinte',  d:'M27 50h10l-5 8Z' },
    ],
    motiv: 'a pencil and a pen lying crossed over each other, seen from above' },
  { wort: 'picture',          gebiet: 'schule',
    bild: [
      { f:'braun',  d:'M4 10h56v44H4Z' },
      { f:'blau',   d:'M10 16h44v32H10Z' },
      { f:'gelb',   d:'M44 22a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
      { f:'gruen',  d:'M10 48 26 26l10 14 8-10 10 18Z' },
      { f:'gruenDunkel', d:'M36 40l8-10 10 18H40Z' },
    ],
    motiv: 'a framed picture hanging on a wall, seen from the front, showing a mountain and a sun' },
  { wort: 'rubber',           gebiet: 'schule',
    bild: [
      { f:'rot',    d:'M8 24 46 12l10 12-38 14Z' },
      { f:'rotDunkel', d:'M18 38 8 26v12l10 12Z' },
      { f:'creme',  d:'M8 26 46 14l4 5-38 13Z' },
      { f:'licht',  d:'M18 38 8 38v12l10-12Z' },
    ],
    motiv: 'a rectangular eraser seen at a slight angle, one corner worn round' },
  { wort: 'school/schoolbag', gebiet: 'schule',
    bild: [
      { f:'braunDunkel', d:'M16 14c0-6 7-10 16-10s16 4 16 10v6H16Z' },
      { f:'braun',  d:'M8 20h48v34a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z' },
      { f:'braunDunkel', d:'M8 32h48v14H8Z' },
      { f:'gelb',   d:'M26 32h4v14h-4Zm8 0h4v14h-4Z' },
      { f:'creme',  d:'M8 20h48v5H8Z' },
    ],
    motiv: 'a school satchel with two buckles and shoulder straps, seen from the front' },
  { wort: 'teacher',          gebiet: 'schule',
    bild: [
      { f:'braun',  d:'M34 4h28v28H34Z' },
      { f:'gruen',  d:'M38 8h20v20H38Z' },
      { f:'licht',  d:'M42 13h12v3H42Zm0 6h8v3h-8Z' },
      { f:'braunDunkel', d:'M18 10a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z' },
      { f:'creme',  d:'M18 14a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z' },
      { f:'rot',    d:'M18 28c8 0 14 6 14 14v18H4V42c0-8 6-14 14-14Z' },
      { f:'grauDunkel', d:'M30 36h24v4H30Z' },
    ],
    motiv: 'a grown-up standing beside a board, seen from the front, holding a pointer' },
  // --- Kleidung ---
  { wort: 'dress',    gebiet: 'kleidung',
    bild: [
      { f:'grauDunkel', d:'M31 4h2v7h-2Z' },
      { f:'grauDunkel', d:'M18 11h28v3H18Z' },
      { f:'lila',   d:'M26 14h12l2 10 10 34H14l10-34Z' },
      { f:'lilaDunkel', d:'M32 14h6l2 10 10 34H32Z' },
      { f:'licht',  d:'M23 30h18v5H23Z' },
    ],
    motiv: 'a dress on a coat hanger, seen from the front' },
  { wort: 'jeans',    gebiet: 'kleidung',
    bild: [
      { f:'blau',   d:'M16 10h32v14l-4 36h-10l-2-24-2 24H20l-4-36Z' },
      { f:'blauDunkel', d:'M32 10h16v14l-4 36h-10l-2-24Z' },
      { f:'braun',  d:'M16 10h32v6H16Z' },
      { f:'creme',  d:'M20 20h8v8h-8Zm16 0h8v8h-8Z' },
    ],
    motiv: 'a pair of jeans lying flat, seen from the front, with pockets and a belt loop' },
  { wort: 'pullover', gebiet: 'kleidung',
    bild: [
      { f:'rot',    d:'M22 12h20l14 8-6 14-6-4v28H20V30l-6 4-6-14Z' },
      { f:'rotDunkel', d:'M42 12l14 8-6 14-6-4v28h-8V12Z' },
      { f:'creme',  d:'M24 12h16v6H24Z' },
      { f:'creme',  d:'M20 52h24v6H20Z' },
    ],
    motiv: 'a knitted pullover lying flat, seen from the front, arms spread' },
  /* GRUEN UND NICHT BLAU: neben „jeans" stand hier ein zweites blaues
     Kleidungsstueck, und der Zellvergleich mass beide zu 54 % gleich.
     Jeans sind blau - das ist am Wort; ein Hemd hat jede Farbe, also
     traegt hier das Hemd die Aenderung. */
  { wort: 'shirt',    gebiet: 'kleidung',
    bild: [
      { f:'gruen',       d:'M22 10h20l14 8-6 13-6-3v28H20V28l-6 3-6-13Z' },
      { f:'gruenDunkel', d:'M42 10l14 8-6 13-6-3v28h-8V10Z' },
      { f:'creme',      d:'M26 10h12l-6 8Z' },
      { f:'licht',      d:'M31 28h2v3h-2Zm0 8h2v3h-2Zm0 8h2v3h-2Z' },
    ],
    motiv: 'a shirt with a collar and buttons lying flat, seen from the front' },
  { wort: 'shoes',    gebiet: 'kleidung',
    bild: [
      { f:'rot',        d:'M6 30c0-2 2-4 4-4h4l3 9 10 4c3 1 4 3 4 6v2H5Z' },
      { f:'licht',      d:'M5 47h26v5H5Z' },
      { f:'tinte',      d:'M5 51h26v2H5Z' },
      { f:'tinte',      d:'M12 31h9v2h-9Zm2 5h9v2h-9Z' },
      { f:'rot',        d:'M35 30c0-2 2-4 4-4h4l3 9 10 4c3 1 4 3 4 6v2H34Z' },
      { f:'licht',      d:'M34 47h26v5H34Z' },
      { f:'tinte',      d:'M34 51h26v2H34Z' },
      { f:'tinte',      d:'M41 31h9v2h-9Zm2 5h9v2h-9Z' },
    ],
    motiv: 'a pair of lace-up shoes standing side by side, seen from the side' },
  // --- Menschen und Familie ---
  { wort: 'boy',     gebiet: 'menschen',
    bild: [
      { f:'braunDunkel', d:'M32 6c8 0 13 5 13 12H19c0-7 5-12 13-12Z' },
      { f:'creme',  d:'M32 10a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
      { f:'blau',   d:'M32 32c9 0 16 7 16 16v14H16V48c0-9 7-16 16-16Z' },
      { f:'blauDunkel', d:'M36 33c7 2 12 8 12 15v14h-8V44c0-5-2-9-4-11Z' },
      { f:'tinte',  d:'M27 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'a boy standing, seen from the front, short hair, arms at his sides' },
  { wort: 'brother', gebiet: 'menschen',
    bild: [
      { f:'braunDunkel', d:'M18 8c6 0 10 4 10 9H8c0-5 4-9 10-9Z' },
      { f:'creme',  d:'M18 11a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z' },
      { f:'blau',   d:'M18 29c8 0 13 6 13 14v19H5V43c0-8 5-14 13-14Z' },
      { f:'braunDunkel', d:'M46 20c5 0 9 4 9 8H37c0-4 4-8 9-8Z' },
      { f:'creme',  d:'M46 23a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'gruen',  d:'M46 39c7 0 11 5 11 12v11H35V51c0-7 4-12 11-12Z' },
    ],
    motiv: 'two boys standing side by side, seen from the front, one a head taller' },
  { wort: 'family',  gebiet: 'menschen',
    bild: [
      { f:'tinte',  d:'M12 8c5 0 8 3 8 7H4c0-4 3-7 8-7Z' },
      { f:'creme',  d:'M12 10a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'gruen',  d:'M12 26c7 0 11 5 11 12v22H1V38c0-7 4-12 11-12Z' },
      { f:'lilaDunkel', d:'M30 8c6 0 10 5 10 11v14h-4V22H24v11h-4V19c0-6 4-11 10-11Z' },
      { f:'creme',  d:'M30 11a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'lila',   d:'M30 27c6 0 10 4 11 10l2 23H17l2-23c1-6 5-10 11-10Z' },
      { f:'braunDunkel', d:'M48 26c4 0 7 3 7 6H41c0-3 3-6 7-6Z' },
      { f:'creme',  d:'M48 28a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z' },
      { f:'blau',   d:'M48 42c5 0 9 4 9 9v9H39v-9c0-5 4-9 9-9Z' },
    ],
    motiv: 'four people standing in a row, seen from the front: two grown-ups and two children' },
  { wort: 'father',  gebiet: 'menschen',
    bild: [
      { f:'tinte',  d:'M32 2c8 0 13 5 13 12H19C19 7 24 2 32 2Z' },
      { f:'creme',  d:'M32 6a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
      { f:'tinte',  d:'M26 22h12v3H26Z' },
      { f:'gruen',  d:'M32 28c10 0 17 7 17 17v17H15V45c0-10 7-17 17-17Z' },
      { f:'gruenDunkel', d:'M36 29c8 2 13 8 13 16v17h-9V42c0-6-2-11-4-13Z' },
    ],
    motiv: 'a grown man standing, seen from the front, arms at his sides' },
  { wort: 'friend',  gebiet: 'menschen',
    bild: [
      { f:'braunDunkel', d:'M18 10c6 0 10 4 10 9H8c0-5 4-9 10-9Z' },
      { f:'creme',  d:'M18 13a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z' },
      { f:'blau',   d:'M18 31c8 0 13 6 13 14v17H5V45c0-8 5-14 13-14Z' },
      { f:'braun',  d:'M46 8c8 0 12 6 12 13v15h-5V24H39v12h-5V21c0-7 4-13 12-13Z' },
      { f:'creme',  d:'M46 13a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z' },
      { f:'rot',    d:'M46 31c7 0 11 5 12 11l2 20H32l2-20c1-6 5-11 12-11Z' },
      { f:'creme',  d:'M27 46h10v6H27Z' },
    ],
    motiv: 'two children standing side by side holding hands, seen from the front' },
  { wort: 'girl',    gebiet: 'menschen',
    bild: [
      { f:'braun',  d:'M32 4c10 0 15 7 15 16v20h-6V22H23v18h-6V20C17 11 22 4 32 4Z' },
      { f:'creme',  d:'M32 10a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
      { f:'rot',    d:'M32 32c8 0 12 5 14 12l4 18H14l4-18c2-7 6-12 14-12Z' },
      { f:'rotDunkel', d:'M36 33c5 2 8 6 10 11l4 18h-9l-3-18c-1-5-1-9-2-11Z' },
      { f:'tinte',  d:'M27 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'a girl standing, seen from the front, long hair, arms at her sides' },
  { wort: 'mother',  gebiet: 'menschen',
    bild: [
      { f:'lilaDunkel', d:'M32 2c10 0 16 7 16 17v24h-7V20H23v23h-7V19C16 9 22 2 32 2Z' },
      { f:'creme',  d:'M32 8a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
      { f:'lila',   d:'M32 30c9 0 15 6 16 15l2 17H14l2-17c1-9 7-15 16-15Z' },
      { f:'tinte',  d:'M27 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'a grown woman standing, seen from the front, arms at her sides' },
  /* GEBEUGT UND IN BRAUN, wie das Motiv es immer schon sagte. Gezeichnet
     war eine aufrechte Figur mit creme Kopf und dunkelblauem Rumpf - also
     dasselbe wie „boy", nur mit grauem Haar und einem Stock daneben. Der
     Zellvergleich mass beide zu 60 % gleich, sobald Toene statt Namen
     verglichen werden (`blau` und `blauDunkel` sind 15,7 CIELAB
     auseinander und damit derselbe Ton). Zwei Menschen, die sich nur in
     der Haarfarbe unterscheiden, sind fuer ein Kind eine Muenze. Jetzt
     entscheidet die HALTUNG, und die sieht man auch klein noch. */
  { wort: 'old',     gebiet: 'menschen',
    bild: [
      { f:'grau',       d:'M22 6c9 0 13 5 13 12H9c0-7 4-12 13-12Z' },
      { f:'creme',      d:'M22 10a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },
      { f:'grau',       d:'M14 24h14v4H14Z' },
      { f:'braun',      d:'M12 62c-1-14 1-25 8-33 8 2 15 10 19 20 3 5 4 9 4 13Z' },
      { f:'braunDunkel',d:'M26 34c7 4 12 11 15 19 1 3 2 6 2 9h-8c0-9-4-20-9-28Z' },
      { f:'tinte',      d:'M50 28h4v34h-4Z' },
      { f:'tinte',      d:'M46 26h12v5H46Z' },
    ],
    motiv: 'an old person standing bent forward, seen from the side, leaning on a walking stick' },
  { wort: 'sister',  gebiet: 'menschen',
    bild: [
      { f:'braun',  d:'M18 6c8 0 12 6 12 13v17h-5V22H11v14H6V19C6 12 10 6 18 6Z' },
      { f:'creme',  d:'M18 11a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z' },
      { f:'rot',    d:'M18 29c6 0 10 4 12 10l3 23H3l3-23c2-6 6-10 12-10Z' },
      { f:'braun',  d:'M46 20c7 0 11 5 11 11v13h-4V33H42v11h-5V31c0-6 4-11 9-11Z' },
      { f:'creme',  d:'M46 24a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'lila',   d:'M46 40c5 0 9 4 10 9l2 13H34l2-13c1-5 5-9 10-9Z' },
    ],
    motiv: 'two girls standing side by side, seen from the front, one a head taller' },
  // --- Zuhause, Feste und Zeit ---
  { wort: 'house',           gebiet: 'zuhause',
    bild: [
      { f:'rot',    d:'M32 4 60 26H4Z' },
      { f:'rotDunkel', d:'M32 4 60 26H32Z' },
      { f:'creme',  d:'M10 26h44v34H10Z' },
      { f:'braun',  d:'M26 40h12v20H26Z' },
      { f:'blau',   d:'M14 32h12v12H14Zm24 0h12v12H38Z' },
      { f:'gelb',   d:'M35 50a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'a small house seen from the front: a pitched roof, a door and two windows' },
  { wort: 'room',            gebiet: 'zuhause',
    bild: [
      { f:'wolke',  d:'M4 6h56v38H4Z' },
      { f:'braun',  d:'M4 44h56v16H4Z' },
      { f:'blau',   d:'M10 12h18v18H10Z' },
      { f:'licht',  d:'M18 12h2v18h-2Zm-8 8h18v2H10Z' },
      { f:'rot',    d:'M34 30h24v14H34Z' },
      { f:'rotDunkel', d:'M34 24h6v20h-6Z' },
    ],
    motiv: 'a bedroom seen from the front: a bed, a window and a bedside lamp' },
  { wort: 'birthday',        gebiet: 'zuhause',
    bild: [
      { f:'gelb',   d:'M31 4c1 3 1 5 0 8h2c-1-3-1-5 0-8Z' },
      { f:'creme',  d:'M30 12h4v8h-4Z' },
      { f:'rot',    d:'M12 20h40v14H12Z' },
      { f:'creme',  d:'M12 34h40v22H12Z' },
      { f:'rotDunkel', d:'M12 20h40v5H12Z' },
      { f:'braun',  d:'M8 56h48v6H8Z' },
    ],
    motiv: 'a round birthday cake seen from the side with five burning candles' },
  { wort: 'Halloween',       gebiet: 'zuhause',
    bild: [
      { f:'gruen',  d:'M30 6h5v12h-5Z' },
      { f:'rot',    d:'M32 16c14 0 24 10 24 22s-10 22-24 22S8 50 8 38s10-22 24-22Z' },
      { f:'rotDunkel', d:'M38 18c10 4 18 11 18 20 0 12-10 22-24 22 12-3 20-11 20-22 0-8-5-15-14-20Z' },
      { f:'gelb',   d:'M18 32l8-4 4 10h-10Zm28 0-8-4-4 10h10Z' },
      { f:'gelb',   d:'M18 46h28c-2 6-7 10-14 10s-12-4-14-10Zm8 0 3 5 3-5Z' },
    ],
    motiv: 'a carved pumpkin lantern seen from the front, with triangular eyes and a grinning mouth' },
  { wort: 'Merry Christmas', gebiet: 'zuhause',
    bild: [
      { f:'braun',  d:'M28 52h8v10h-8Z' },
      { f:'gruen',  d:'M32 4 48 26H16Zm0 16 20 24H12Zm0 16 24 22H8Z' },
      { f:'gelb',   d:'M32 0l3 6 6 1-5 5 2 6-6-3-6 3 2-6-5-5 6-1Z' },
      { f:'rot',    d:'M22 30a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm20 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM30 46a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },
    ],
    motiv: 'a decorated fir tree seen from the front, with baubles and a star on top' },
  { wort: 'morning',         gebiet: 'zuhause',
    bild: [
      { f:'gelb',   d:'M32 16a18 18 0 1 0 0 36 18 18 0 0 0 0-36Z' },
      { f:'gelbDunkel', d:'M30 2h4v10h-4ZM8 20l3-3 7 7-3 3Zm45 4 7-7 3 3-7 7ZM2 34h10v4H2Zm50 0h10v4H52Z' },
      { f:'braunDunkel', d:'M2 48h60v6H2Z' },
      { f:'gruen',  d:'M2 54h60v8H2Z' },
    ],
    motiv: 'a sun rising over a straight horizon line, seen from the front, with rays' },
  { wort: 'o‘clock',         gebiet: 'zuhause',
    bild: [
      { f:'grauDunkel', d:'M32 4a28 28 0 1 0 0 56 28 28 0 0 0 0-56Z' },
      { f:'licht',  d:'M32 9a23 23 0 1 0 0 46 23 23 0 0 0 0-46Z' },
      { f:'tinte',  d:'M30 16h4v18h-4Z' },
      { f:'tinte',  d:'M32 30h16v4H32Z' },
      { f:'rot',    d:'M32 28a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' },
    ],
    motiv: 'a round clock face seen from the front with two hands, no numerals, showing three o clock' },
  { wort: 'party',           gebiet: 'zuhause',
    bild: [
      { f:'grau',   d:'M18 30c2 10 6 20 12 28h-2c-8-8-12-18-13-28Zm28 0c-2 10-6 20-12 28h2c8-8 12-18 13-28Z' },
      { f:'rot',    d:'M18 4a12 14 0 1 0 0 28 12 14 0 0 0 0-28Z' },
      { f:'blau',   d:'M46 4a12 14 0 1 0 0 28 12 14 0 0 0 0-28Z' },
      { f:'gelb',   d:'M32 14a12 14 0 1 0 0 28 12 14 0 0 0 0-28Z' },
      { f:'licht',  d:'M13 12c1-3 3-5 5-5 2 0 2 3 0 3-2 1-3 2-3 3-1 2-3 1-2-1Z' },
    ],
    motiv: 'three balloons on strings rising together, seen from the front' },
  { wort: 'weekend',         gebiet: 'zuhause',
    bild: [
      { f:'grauDunkel', d:'M18 4h5v10h-5Zm23 0h5v10h-5Z' },
      { f:'licht',  d:'M6 10h52v50H6Z' },
      { f:'blau',   d:'M6 10h52v12H6Z' },
      { f:'wolke',  d:'M12 28h8v8h-8Zm12 0h8v8h-8Zm12 0h8v8h-8Zm-24 12h8v8h-8Zm12 0h8v8h-8Z' },
      { f:'rot',    d:'M36 40h8v8h-8Zm12 0h8v8h-8Z' },
    ],
    motiv: 'a calendar page seen from the front, a grid of blank squares, the last two squares of the bottom row filled in solid' },
  // --- Wo? Die Praepositionen. Immer DIESELBE Kiste und DERSELBE Ball. ---
  { wort: 'behind',      gebiet: 'wo',
    bild: [
      { f:'rot',    d:'M32 16a13 13 0 1 0 0 26 13 13 0 0 0 0-26Z' },
      { f:'grau',   d:'M12 34h40v24H12Z' },
      { f:'grauDunkel', d:'M12 34h40v5H12Z' },
    ],
    motiv: 'a closed box seen from the front with a ball behind it, only the upper half of the ball visible above the box' },
  { wort: 'in',          gebiet: 'wo',
    bild: [
      { f:'grauDunkel', d:'M10 18h44v8H10Z' },
      { f:'rot',    d:'M32 22a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z' },
      { f:'grau',   d:'M10 34h44v24H10Z' },
      { f:'grauDunkel', d:'M10 34h44v4H10Z' },
    ],
    motiv: 'an open box seen from the front with a ball inside it, resting on the bottom of the box' },
  { wort: 'In front of', gebiet: 'wo',
    bild: [
      { f:'grau',   d:'M12 14h40v28H12Z' },
      { f:'grauDunkel', d:'M12 14h40v5H12Z' },
      { f:'rot',    d:'M32 34a13 13 0 1 0 0 26 13 13 0 0 0 0-26Z' },
    ],
    motiv: 'a closed box seen from the front with a ball in front of it, the ball overlapping the lower edge of the box' },
  { wort: 'next to',     gebiet: 'wo',
    bild: [
      { f:'grau',   d:'M6 24h28v30H6Z' },
      { f:'grauDunkel', d:'M6 24h28v5H6Z' },
      { f:'rot',    d:'M48 28a12 12 0 1 0 0 24 12 12 0 0 0 0-24Z' },
    ],
    motiv: 'a closed box seen from the front with a ball on the ground beside it, to the right, not touching' },
  { wort: 'on',          gebiet: 'wo',
    bild: [
      { f:'rot',    d:'M32 6a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
      { f:'grau',   d:'M14 30h36v26H14Z' },
      { f:'grauDunkel', d:'M14 30h36v5H14Z' },
    ],
    motiv: 'a closed box seen from the front with a ball resting on top of it' },
  { wort: 'under',       gebiet: 'wo',
    bild: [
      { f:'grau',   d:'M14 8h36v26H14Z' },
      { f:'grauDunkel', d:'M14 29h36v5H14Z' },
      { f:'rot',    d:'M32 38a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },
    ],
    motiv: 'a table seen from the front with a ball on the floor underneath it' },
  // --- Gegensaetze und Gefuehle ---
  { wort: 'big',    gebiet: 'gegensaetze',
    bild: [
      { f:'grau',   d:'M52 46a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'rot',    d:'M26 4a24 24 0 1 0 0 48 24 24 0 0 0 0-48Z' },
      { f:'rotDunkel', d:'M32 5c12 3 20 13 20 23 0 13-11 24-24 24 11-3 19-13 19-24 0-9-6-18-15-23Z' },
    ],
    motiv: 'two balls side by side, one very large and one very small; the large one is solid black, the small one is only an outline' },
  { wort: 'small',  gebiet: 'gegensaetze',
    bild: [
      { f:'grau',   d:'M26 4a24 24 0 1 0 0 48 24 24 0 0 0 0-48Z' },
      { f:'rot',    d:'M52 46a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
    ],
    motiv: 'two balls side by side, one very large and one very small; the small one is solid black, the large one is only an outline' },
  { wort: 'little', gebiet: 'gegensaetze',
    ohneBild: '„little" heisst dasselbe wie „small", und beide bekaemen '
      + 'dieselbe Zeichnung. Zwei Karten, die gleich aussehen und verschieden '
      + 'heissen, sind keine Aufgabe - eine davon waere immer falsch, ohne '
      + 'dass ein Kind einen Fehler gemacht haette.',
    motiv: 'a grown cat and a kitten side by side, seen from the side; the kitten is solid black, the grown cat is only an outline' },
  { wort: 'cold',   gebiet: 'gegensaetze',
    bild: [
      { f:'blau',   d:'M29 2h6v60h-6Z' },
      { f:'blau',   d:'M4 17 7 12l50 29-3 5Zm3 35-3-5 50-29 3 5Z' },
      { f:'blauDunkel', d:'M20 8l12 8 12-8 3 5-15 10-15-10Zm0 48 12-8 12 8 3-5-15-10-15 10Z' },
    ],
    motiv: 'a thermometer standing upright, seen from the front, its column low, with a snowflake beside it' },
  { wort: 'hot',    gebiet: 'gegensaetze',
    bild: [
      { f:'gelb',   d:'M32 4c10 12 20 20 20 34 0 13-9 22-20 22s-20-9-20-22c0-14 10-22 20-34Z' },
      { f:'rot',    d:'M32 24c6 8 12 12 12 20 0 8-5 14-12 14s-12-6-12-14c0-8 6-12 12-20Z' },
      { f:'rotDunkel', d:'M36 30c5 6 8 10 8 14 0 8-5 14-12 14 5-3 8-8 8-14 0-5-2-9-4-14Z' },
    ],
    motiv: 'a thermometer standing upright, seen from the front, its column high, with a sun beside it' },
  { wort: 'happy',  gebiet: 'gegensaetze',
    bild: [
      { f:'gelb',   d:'M32 4a28 28 0 1 0 0 56 28 28 0 0 0 0-56Z' },
      { f:'gelbDunkel', d:'M38 6c11 4 18 14 18 26 0 15-13 28-28 28 15-2 26-14 26-28 0-11-6-21-16-26Z' },
      { f:'tinte',  d:'M22 22a4 5 0 1 0 0 10 4 5 0 0 0 0-10Zm20 0a4 5 0 1 0 0 10 4 5 0 0 0 0-10Z' },
      { f:'tinte',  d:'M18 38h28c0 8-6 14-14 14s-14-6-14-14Z' },
    ],
    motiv: 'a round face seen from the front with two dot eyes and a wide smiling mouth' },
  { wort: 'sad',    gebiet: 'gegensaetze',
    bild: [
      { f:'blau',   d:'M32 4a28 28 0 1 0 0 56 28 28 0 0 0 0-56Z' },
      { f:'blauDunkel', d:'M38 6c11 4 18 14 18 26 0 15-13 28-28 28 15-2 26-14 26-28 0-11-6-21-16-26Z' },
      { f:'tinte',  d:'M22 22a4 5 0 1 0 0 10 4 5 0 0 0 0-10Zm20 0a4 5 0 1 0 0 10 4 5 0 0 0 0-10Z' },
      { f:'tinte',  d:'M18 52c0-8 6-14 14-14s14 6 14 14c-4-5-8-8-14-8s-10 3-14 8Z' },
    ],
    motiv: 'a round face seen from the front with two dot eyes and a downturned mouth' },
  { wort: 'good',   gebiet: 'gegensaetze',
    bild: [
      { f:'creme',  d:'M22 26h6l6-14c1-4 6-6 9-3 2 2 2 5 1 8l-3 9h13c4 0 7 4 6 8l-5 20c-1 4-4 6-8 6H22Z' },
      { f:'blau',   d:'M6 26h14v34H6Z' },
      { f:'blauDunkel', d:'M14 26h6v34h-6Z' },
    ],
    motiv: 'a hand making a thumbs-up sign, seen from the side' },
  // --- Spielen und Sport ---
  { wort: 'bike',     gebiet: 'sport',
    bild: [
      { f:'grauDunkel', d:'M14 34a14 14 0 1 0 0 28 14 14 0 0 0 0-28Zm0 6a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z' },
      { f:'grauDunkel', d:'M50 34a14 14 0 1 0 0 28 14 14 0 0 0 0-28Zm0 6a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z' },
      { f:'rot',      d:'M14 46h10l10-20h10v5h-7l-9 18h22v5H14Z' },
      { f:'rot',      d:'M30 22h12v4H30Z' },
    ],
    motiv: 'a bicycle seen from the side, both wheels, handlebars and saddle visible' },
  { wort: 'football', gebiet: 'sport',
    bild: [
      { f:'licht',  d:'M32 4a28 28 0 1 0 0 56 28 28 0 0 0 0-56Z' },
      { f:'wolke',  d:'M32 4a28 28 0 1 0 0 56 28 28 0 0 0 0-56Zm0 5a23 23 0 1 1 0 46 23 23 0 0 1 0-46Z' },
      { f:'tinte',  d:'M32 16l11 8-4 13H25l-4-13Z' },
      { f:'tinte',  d:'M12 26l6 10-6 8-4-8Zm40 0-6 10 6 8 4-8ZM24 48h16l3 8-11 5-11-5Z' },
    ],
    motiv: 'a football (soccer ball) seen from the front, with its pentagon pattern' },
  { wort: 'go',       gebiet: 'sport',
    bild: [
      { f:'braunDunkel', d:'M36 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'blau',   d:'M34 20c6 0 10 4 12 9l4 11-6 3-4-9-4 12 8 12-5 4-11-15 3-14-6 5-2 10-6-1 3-14Z' },
      { f:'blauDunkel', d:'M46 29l4 11-6 3-4-9Z' },
      { f:'braun',  d:'M22 52h10v6H20Zm18 6h10v6H36Z' },
    ],
    motiv: 'a person walking to the right, seen from the side, one leg forward, arms swinging' },
  { wort: 'play',     gebiet: 'sport',
    bild: [
      { f:'rot',    d:'M8 40h20v20H8Z' },
      { f:'blau',   d:'M32 40h20v20H32Z' },
      { f:'gelb',   d:'M20 18h20v20H20Z' },
      { f:'gruen',  d:'M20 4h20v12H20Z' },
      { f:'licht',  d:'M14 46h8v8h-8Zm24 0h8v8h-8Zm-12-22h8v8h-8Z' },
    ],
    motiv: 'a child seen from the front kicking a ball that lies on the ground' },
  { wort: 'ride',     gebiet: 'sport',
    bild: [
      { f:'grauDunkel', d:'M14 40a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z' },
      { f:'grauDunkel', d:'M50 40a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z' },
      { f:'grau',   d:'M14 50h8l8-14h8v4h-6l-6 14h24v4H14Z' },
      { f:'creme',  d:'M34 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'rot',    d:'M32 20c6 0 10 4 11 9l3 9-6 2-3-7-4 9h-9l-4-9-5 4-4-5 9-8c3-3 7-4 12-4Z' },
    ],
    motiv: 'a child riding a bicycle to the right, seen from the side' },
  { wort: 'sports',   gebiet: 'sport',
    bild: [
      { f:'rot',    d:'M18 4h10l6 16h-8Z' },
      { f:'blau',   d:'M36 4h10L38 20h-8Z' },
      { f:'gelb',   d:'M32 20a21 21 0 1 0 0 42 21 21 0 0 0 0-42Z' },
      { f:'gelbDunkel', d:'M38 22c9 3 15 10 15 19 0 12-9 21-21 21 9-3 16-11 16-21 0-8-4-15-10-19Z' },
      { f:'licht',  d:'M32 28l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1Z' },
    ],
    motiv: 'a football, a tennis racket and a swimming goggle arranged together, seen from the front' },
  { wort: 'swim',     gebiet: 'sport',
    bild: [
      { f:'creme',  d:'M16 12a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z' },
      { f:'rot',    d:'M24 26c8-2 14 2 18 8l14-6 3 6-18 8c-4 2-8 1-11-2l-6-6Z' },
      { f:'blau',   d:'M2 44c8 0 8 6 16 6s8-6 16-6 8 6 16 6 8-6 14-6v6c-6 0-6 6-14 6s-8-6-16-6-8 6-16 6-8-6-16-6Z' },
    ],
    motiv: 'a person swimming front crawl, seen from the side, one arm out of the water, wavy water lines' },
  { wort: 'tennis',   gebiet: 'sport',
    bild: [
      { f:'gelb',   d:'M48 6a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },
      { f:'braun',  d:'M12 40 4 56l6 4 10-16Z' },
      { f:'rot',    d:'M22 12a16 20 0 1 0 0 40 16 20 0 0 0 0-40Zm0 6a10 14 0 1 1 0 28 10 14 0 0 1 0-28Z' },
      { f:'wolke',  d:'M21 18h2v28h-2Zm-9 13h20v2H12Z' },
    ],
    motiv: 'a tennis racket lying at an angle with a tennis ball beside it, seen from above' },
  // --- Laender und Uebriges ---
  { wort: 'bye',              gebiet: 'rest',
    bild: [
      { f:'blau',   d:'M46 6c8 6 12 15 12 24h-5c0-8-3-15-9-20Zm-2 10c5 4 7 9 7 14h-5c0-4-2-7-5-10Z' },
      { f:'creme',  d:'M18 28V10c0-3 2-5 5-5s5 2 5 5v14l2-16c0-3 3-5 6-4 3 0 5 3 4 6l-2 15 3-10c1-3 4-4 6-3 3 1 4 4 3 7l-5 19c-3 10-9 15-17 15-6 0-11-3-14-8l-7-11c-2-3-1-6 2-7 3-1 5 0 7 2Z' },
      { f:'braun',  d:'M18 46h20v4H18Z' },
    ],
    motiv: 'a raised open hand waving goodbye, seen from the front, with two small motion arcs' },
  { wort: 'colour',           gebiet: 'rest',
    bild: [
      { f:'creme',  d:'M30 6c16 0 28 10 28 22 0 8-6 12-12 12h-6c-4 0-6 3-6 6 0 4-3 8-8 8C14 54 4 42 4 28 4 15 15 6 30 6Z' },
      { f:'rot',    d:'M16 20a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
      { f:'blau',   d:'M28 14a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
      { f:'gruen',  d:'M42 18a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
      { f:'gelb',   d:'M18 38a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
    ],
    motiv: 'a painter palette held from below with a brush, seen from above, six round blobs of paint on it' },
  { wort: 'England/English',  gebiet: 'rest',
    bild: [
      { f:'blau',   d:'M4 16h56v32H4Z' },
      { f:'licht',  d:'M4 16h10l46 28v4H50L4 20Z' },
      { f:'licht',  d:'M60 16H50L4 44v4h10l46-28Z' },
      { f:'rot',    d:'M4 17h6l50 30v2h-6L4 19Zm56 0h-6L4 47v2h6l50-30Z' },
      { f:'licht',  d:'M26 16h12v32H26ZM4 26h56v12H4Z' },
      { f:'rot',    d:'M28 16h8v32h-8ZM4 28h56v8H4Z' },
    ],
    motiv: 'a rectangular flag on a pole, seen from the side, bearing a plain upright cross that reaches all four edges' },
  { wort: 'Germany/German',   gebiet: 'rest',
    bild: [
      { f:'tinte',  d:'M4 16h56v11H4Z' },
      { f:'rot',    d:'M4 27h56v11H4Z' },
      { f:'gelb',   d:'M4 38h56v10H4Z' },
    ],
    motiv: 'a rectangular flag on a pole, seen from the side, divided into three equal horizontal bands, the top one solid black and the other two only outlined' },
  { wort: 'give',             gebiet: 'rest',
    bild: [
      { f:'rot',    d:'M12 4h40v13H12Z' },
      { f:'gelb',   d:'M28 4h8v13h-8Z' },
      { f:'rotDunkel', d:'M16 17h32v18H16Z' },
      { f:'gelb',   d:'M28 17h8v18h-8Z' },
      { f:'creme',  d:'M8 40c3-3 8-3 11 0l5 5h24c4 0 7 3 7 7s-3 7-7 7H24c-5 0-9-2-12-5l-6-6c-3-3-2-6 2-8Z' },
      { f:'wolke',  d:'M24 45h24v4H24Z' },
    ],
    motiv: 'a hand seen from the side holding out a small wrapped present with a ribbon' },
];

/* Die Funktionswoerter. Sie bekommen KEIN Bild - nicht aus Faulheit,
   sondern weil ein Bild fuer „about" oder „the" geraten waere, und ein
   geratenes Bild lehrt das Falsche. Sie kommen im Satz vor (E9, E11). */
export const NUR_WORT = [
  'a/an', 'about', 'and', 'at', 'be (am, are, is)', 'can/can‘t', 'come',
  'dear', 'do/don‘t', 'fine', 'from', 'great', 'have/has (got)',
  'haven’t/ hasn´t (got)', 'he', 'hello', 'help', 'her', 'here', 'his',
  'hobby', 'how', 'I / I’d / I’m / I‘ve', 'it', 'Its', 'know', 'like',
  'many', 'much', 'my', 'name', 'no/not', 'okay/OK', 'please', 'put',
  'she', 'sorry', 'take', 'thank(s)', 'the', 'there', 'they', 'this',
  'time', 'to', 'very', 'we', 'welcome', 'what', 'when',
  'where', 'who', 'yes', 'you', 'your',
];

/* ---------- Falsche Freunde (E10) ----------------------------------------
 *
 * Ein deutscher Satz mit einer Falle, daneben derselbe Satz auf Englisch -
 * mit einer LUECKE genau an der Falle. Getippt wird das eine Wort.
 *
 * WARUM LUECKE UND NICHT AUSWAHL, und das ist eine Entscheidung gegen den
 * ersten Entwurf des Konzepts: § 5 Form 9 beschreibt „zwei englische
 * Fassungen stehen da, welche stimmt?" - also eine Auswahl aus zweien. Die
 * Profiltabelle im Backlog sagt fuer Stephan und Violeta aber „Auswahl
 * statt Tippen: NIE", und Tor E-f prueft das. Beides zusammen geht nicht.
 *
 * Die Tabelle gewinnt, weil sie die Referenz ist (Regel 3) - und der
 * Zuschnitt wird dadurch besser, nicht schlechter:
 *
 *   Eine Auswahl aus zweien laesst sich zur Haelfte erraten, und was man
 *   ERKENNT, wenn man es sieht, kann man noch lange nicht sagen. Genau das
 *   ist das Problem aus § 2b: Schulenglisch, das zugewachsen ist, erkennt
 *   viel und produziert wenig.
 *
 *   Bei der Luecke kommt der falsche Freund aus einem selbst. Wer bei
 *   „Ich habe einen Brief bekommen" `become` tippt, bekommt genau dort die
 *   Auskunft - und das ist ein anderer Moment als ein Haken an der
 *   richtigen von zwei Zeilen.
 *
 * `falle` ist deshalb kein Schmuck: sie wird nicht angeboten, sondern
 * ERKANNT. Tippt jemand sie, sagt die App, was das Wort wirklich heisst,
 * statt nur „falsch". Das Untertor `englisch` verlangt, dass die Falle nie
 * unter den richtigen Antworten steht - sonst waere die Aufgabe eine, die
 * den Fehler belohnt.
 *
 * DIE LISTE IST MEINE, nicht amtlich. Sie steht deshalb hier und nicht in
 * `docs/referenz/`: es sind die klassischen deutsch-englischen Fallen, und
 * sie sind fuer Deutschsprachige richtig - nicht fuer irgendwen.
 */
export const FREUNDE = [
  { id: 'get',      satz: 'Ich habe gestern einen Brief bekommen.',
    luecke: 'I ___ a letter yesterday.',
    richtig: ['got', 'received'], falle: 'became',
    warum: '„become" heißt werden, nicht bekommen.' },
  { id: 'boss',     satz: 'Mein Chef ist heute nicht da.',
    luecke: 'My ___ is not here today.',
    richtig: ['boss', 'manager'], falle: 'chef',
    warum: '„chef" ist der Koch.' },
  { id: 'mobile',   satz: 'Mein Handy ist kaputt.',
    luecke: 'My ___ is broken.',
    richtig: ['mobile', 'mobile phone', 'phone', 'cell phone', 'cellphone'], falle: 'handy',
    warum: '„handy" heißt praktisch.' },
  { id: 'possibly', satz: 'Eventuell regnet es morgen.',
    luecke: 'It will ___ rain tomorrow.',
    richtig: ['possibly', 'maybe', 'perhaps'], falle: 'eventually',
    warum: '„eventually" heißt schließlich, am Ende.' },
  { id: 'current',  satz: 'Das ist die aktuelle Fassung.',
    luecke: 'This is the ___ version.',
    richtig: ['current', 'latest'], falle: 'actual',
    warum: '„actual" heißt tatsächlich.' },
  { id: 'sensitive', satz: 'Sie ist ein sehr sensibler Mensch.',
    luecke: 'She is a very ___ person.',
    richtig: ['sensitive'], falle: 'sensible',
    warum: '„sensible" heißt vernünftig.' },
  { id: 'poison',   satz: 'Die Flasche enthält Gift.',
    luecke: 'The bottle contains ___.',
    richtig: ['poison'], falle: 'gift',
    warum: '„gift" ist das Geschenk.' },
  { id: 'skirt',    satz: 'Sie trägt einen blauen Rock.',
    luecke: 'She is wearing a blue ___.',
    richtig: ['skirt'], falle: 'rock',
    warum: '„rock" ist der Fels.' },
  { id: 'child',    satz: 'Sie haben ein Kind.',
    luecke: 'They have a ___.',
    richtig: ['child'], falle: 'kind',
    warum: '„kind" heißt nett.' },
  { id: 'soon',     satz: 'Ich bin bald zurück.',
    luecke: 'I will be back ___.',
    richtig: ['soon'], falle: 'bald',
    warum: '„bald" heißt kahl.' },
  { id: 'advice',   satz: 'Ich brauche einen Rat.',
    luecke: 'I need some ___.',
    richtig: ['advice'], falle: 'rat',
    warum: '„rat" ist die Ratte.' },
  { id: 'opinion',  satz: 'Das ist meine Meinung.',
    luecke: 'That is my ___.',
    richtig: ['opinion', 'view'], falle: 'meaning',
    warum: '„meaning" heißt Bedeutung.' },
  { id: 'mark',     satz: 'Ich habe eine gute Note bekommen.',
    luecke: 'I got a good ___.',
    richtig: ['mark', 'grade'], falle: 'note',
    warum: '„note" ist die Notiz.' },
  { id: 'factory',  satz: 'Er arbeitet in einer Fabrik.',
    luecke: 'He works in a ___.',
    richtig: ['factory', 'plant'], falle: 'fabric',
    warum: '„fabric" ist der Stoff.' },
  { id: 'brochure', satz: 'Nimm dir einen Prospekt mit.',
    luecke: 'Take a ___ with you.',
    richtig: ['brochure', 'leaflet'], falle: 'prospect',
    warum: '„prospect" heißt Aussicht.' },
  { id: 'donate',   satz: 'Wir wollen Geld spenden.',
    luecke: 'We want to ___ money.',
    richtig: ['donate', 'give'], falle: 'spend',
    warum: '„spend" heißt ausgeben.' },
  { id: 'likeable', satz: 'Er ist sehr sympathisch.',
    luecke: 'He is very ___.',
    richtig: ['likeable', 'likable', 'nice', 'pleasant'], falle: 'sympathetic',
    warum: '„sympathetic" heißt mitfühlend.' },
  { id: 'reputable', satz: 'Das ist eine seriöse Firma.',
    luecke: 'That is a ___ company.',
    richtig: ['reputable', 'respectable', 'trustworthy'], falle: 'serious',
    warum: '„serious" heißt ernst.' },
  { id: 'projector', satz: 'Der Beamer ist an.',
    luecke: 'The ___ is on.',
    richtig: ['projector'], falle: 'beamer',
    warum: '„beamer" versteht kein Englischsprachiger — im Zweifel als BMW.' },
  { id: 'tuxedo',   satz: 'Er trug einen Smoking.',
    luecke: 'He was wearing a ___.',
    richtig: ['tuxedo', 'tux', 'dinner jacket'], falle: 'smoking',
    warum: '„smoking" heißt rauchend.' },
  { id: 'vintage',  satz: 'Das ist ein schöner Oldtimer.',
    luecke: 'That is a beautiful ___.',
    richtig: ['vintage car', 'classic car'], falle: 'oldtimer',
    warum: '„old-timer" ist ein alter Mann.' },
  { id: 'so',       satz: 'Ich war müde, also bin ich gegangen.',
    luecke: 'I was tired, ___ I left.',
    richtig: ['so'], falle: 'also',
    warum: '„also" heißt auch.' },
  { id: 'commission', satz: 'Er bekommt eine Provision.',
    luecke: 'He gets a ___.',
    richtig: ['commission'], falle: 'provision',
    warum: '„provision" heißt Bereitstellung, Vorrat.' },
  { id: 'review',   satz: 'Der Film bekam eine gute Kritik.',
    luecke: 'The film got a good ___.',
    richtig: ['review'], falle: 'critic',
    warum: '„critic" ist der Kritiker, also die Person.' },
  { id: 'grammar',  satz: 'Sie geht aufs Gymnasium.',
    luecke: 'She goes to a ___.',
    richtig: ['grammar school', 'secondary school', 'high school'], falle: 'gymnasium',
    warum: '„gymnasium" ist die Turnhalle.' },
  { id: 'setmenu',  satz: 'Ich nehme das Menü.',
    luecke: 'I will take the ___.',
    richtig: ['set menu', 'set meal'], falle: 'menu',
    warum: '„menu" ist die Speisekarte.' },
  { id: 'suit',     satz: 'Sie trug ein elegantes Kostüm.',
    luecke: 'She was wearing an elegant ___.',
    richtig: ['suit'], falle: 'costume',
    warum: '„costume" ist die Verkleidung.' },
  { id: 'sparkling', satz: 'Wir trinken Sekt.',
    luecke: 'We are drinking ___.',
    richtig: ['sparkling wine', 'champagne'], falle: 'sect',
    warum: '„sect" ist die Sekte.' },
  { id: 'billion',  satz: 'Das Projekt kostet eine Milliarde Euro.',
    luecke: 'The project costs a ___ euros.',
    richtig: ['billion'], falle: 'milliard',
    warum: '„milliard" gibt es im heutigen Englisch nicht — eine Milliarde ist a billion.' },
  { id: 'checks',   satz: 'Der Schaffner kontrolliert die Fahrkarten.',
    luecke: 'The conductor ___ the tickets.',
    richtig: ['checks', 'inspects'], falle: 'controls',
    warum: '„to control" heißt steuern, nicht prüfen.' },
  /* --- I1: dreissig weitere Fallen (Inhalt-Audit) --------------------
   *
   * Gemessen hatte die Ebene 30 Fallen bei 12 Aufgaben je Sitzung: 2,5
   * Runden, bevor sich etwas wiederholt. Mit 60 sind es fuenf. Die
   * Auswahl folgt derselben Regel wie die ersten dreissig - genommen
   * wird, was ein Deutscher WIRKLICH tippt, nicht was ein Woerterbuch
   * als Kuriosum fuehrt. */
  { id: 'warehouse', satz: 'Die Ware liegt noch im Lager.',
    luecke: 'The goods are still in the ___.',
    richtig: ['warehouse', 'storeroom', 'stockroom'], falle: 'lager',
    warum: '„lager" ist ein helles Bier.' },
  { id: 'prescription', satz: 'Der Arzt hat mir ein Rezept gegeben.',
    luecke: 'The doctor gave me a ___.',
    richtig: ['prescription'], falle: 'recipe',
    warum: '„recipe" ist das Kochrezept.' },
  { id: 'label', satz: 'Auf dem Etikett steht der Preis.',
    luecke: 'The price is on the ___.',
    richtig: ['label', 'tag', 'price tag'], falle: 'etiquette',
    warum: '„etiquette" heißt Anstandsregeln.' },
  { id: 'folder', satz: 'Die Unterlagen sind in der blauen Mappe.',
    luecke: 'The papers are in the blue ___.',
    richtig: ['folder', 'file'], falle: 'map',
    warum: '„map" ist die Landkarte.' },
  { id: 'headteacher', satz: 'Der Direktor der Schule heißt Herr Weber.',
    luecke: 'The ___ of the school is Mr Weber.',
    richtig: ['headteacher', 'head teacher', 'principal', 'head'], falle: 'director',
    warum: '„director" ist der Regisseur oder ein Vorstandsmitglied.' },
  { id: 'denomination', satz: 'Nach der Konfession wird nicht gefragt.',
    luecke: 'Nobody asks about your ___.',
    richtig: ['denomination', 'religion'], falle: 'confession',
    warum: '„confession" ist das Geständnis.' },
  { id: 'screening', satz: 'Das Spiel läuft beim Public Viewing im Park.',
    luecke: 'The match is on at the ___ in the park.',
    richtig: ['screening', 'live screening', 'public screening'], falle: 'public viewing',
    warum: '„public viewing" ist im Englischen die öffentliche Aufbahrung eines Toten.' },
  { id: 'consistent', satz: 'Sie ist immer sehr konsequent.',
    luecke: 'She is always very ___.',
    richtig: ['consistent', 'determined'], falle: 'consequent',
    warum: '„consequent" heißt daraus folgend.' },
  { id: 'competition', satz: 'Die Konkurrenz ist schneller gewesen.',
    luecke: 'The ___ was faster.',
    richtig: ['competition', 'competitor', 'competitors'], falle: 'concurrence',
    warum: '„concurrence" heißt Übereinstimmung.' },
  { id: 'entrepreneur', satz: 'Ihr Vater war Unternehmer.',
    luecke: 'Her father was an ___.',
    richtig: ['entrepreneur', 'businessman'], falle: 'undertaker',
    warum: '„undertaker" ist der Bestatter.' },
  { id: 'cloakroom', satz: 'Die Jacken hängen an der Garderobe.',
    luecke: 'The coats are in the ___.',
    richtig: ['cloakroom', 'coat check'], falle: 'wardrobe',
    warum: '„wardrobe" ist der Kleiderschrank.' },
  { id: 'novella', satz: 'Er hat eine Novelle geschrieben.',
    luecke: 'He wrote a ___.',
    richtig: ['novella', 'short story'], falle: 'novel',
    warum: '„novel" ist der Roman.' },
  { id: 'wellbehaved', satz: 'Die Kinder waren den ganzen Tag brav.',
    luecke: 'The children were ___ all day.',
    richtig: ['well-behaved', 'well behaved', 'good'], falle: 'brave',
    warum: '„brave" heißt mutig.' },
  { id: 'scholarship', satz: 'Sie hat ein Stipendium bekommen.',
    luecke: 'She got a ___.',
    richtig: ['scholarship', 'grant'], falle: 'stipend',
    warum: '„stipend" ist ein kleines regelmäßiges Gehalt.' },
  { id: 'almost', satz: 'Der Zug war fast voll.',
    luecke: 'The train was ___ full.',
    richtig: ['almost', 'nearly'], falle: 'fast',
    warum: '„fast" heißt schnell.' },
  { id: 'kindof', satz: 'Welche Art von Musik magst du?',
    luecke: 'What ___ of music do you like?',
    richtig: ['kind', 'type', 'sort'], falle: 'art',
    warum: '„art" ist die Kunst.' },
  { id: 'brilliant', satz: 'Das war eine geniale Idee.',
    luecke: 'That was a ___ idea.',
    richtig: ['brilliant', 'ingenious'], falle: 'genial',
    warum: '„genial" heißt freundlich und herzlich.' },
  { id: 'confuse', satz: 'Die vielen Zahlen irritieren mich.',
    luecke: 'All these numbers ___ me.',
    richtig: ['confuse', 'puzzle'], falle: 'irritate',
    warum: '„irritate" heißt ärgern oder reizen.' },
  { id: 'deposit', satz: 'Die Kaution beträgt zwei Monatsmieten.',
    luecke: 'The ___ is two months rent.',
    richtig: ['deposit', 'security deposit'], falle: 'caution',
    warum: '„caution" heißt Vorsicht.' },
  { id: 'bonus', satz: 'Im Dezember gibt es eine Prämie.',
    luecke: 'There is a ___ in December.',
    richtig: ['bonus'], falle: 'premium',
    warum: '„premium" ist der Beitrag einer Versicherung.' },
  { id: 'shelf', satz: 'Das Buch steht im obersten Regal.',
    luecke: 'The book is on the top ___.',
    richtig: ['shelf'], falle: 'regal',
    warum: '„regal" heißt königlich.' },
  { id: 'spa', satz: 'Meine Mutter fährt zur Kur.',
    luecke: 'My mother is going to a ___.',
    richtig: ['spa', 'health resort', 'health retreat'], falle: 'cure',
    warum: '„cure" ist die Heilung selbst.' },
  { id: 'graduate', satz: 'In der Familie sind alle Akademiker.',
    luecke: 'Everyone in the family is a university ___.',
    richtig: ['graduate'], falle: 'academic',
    warum: '„academic" ist der Wissenschaftler an einer Hochschule.' },
  { id: 'bench', satz: 'Wir haben uns auf eine Bank im Park gesetzt.',
    luecke: 'We sat down on a ___ in the park.',
    richtig: ['bench'], falle: 'bank',
    warum: '„bank" ist die Bank mit dem Geld.' },
  { id: 'crisps', satz: 'Sie hat eine Tüte Chips gekauft.',
    luecke: 'She bought a bag of ___.',
    richtig: ['crisps', 'potato crisps'], falle: 'chips',
    warum: '„chips" sind in Großbritannien die Pommes frites.' },
  { id: 'tray', satz: 'Stell die Tassen auf das Tablett.',
    luecke: 'Put the cups on the ___.',
    richtig: ['tray'], falle: 'tablet',
    warum: '„tablet" ist die Tablette oder der flache Rechner.' },
  { id: 'wave', satz: 'Sie hat aus dem Zug gewinkt.',
    luecke: 'She began to ___ from the train.',
    richtig: ['wave'], falle: 'wink',
    warum: '„wink" heißt zwinkern.' },
  { id: 'pension', satz: 'Mein Onkel lebt von seiner Rente.',
    luecke: 'My uncle lives on his ___.',
    richtig: ['pension'], falle: 'rent',
    warum: '„rent" ist die Miete.' },
  { id: 'appointment', satz: 'Ich habe morgen einen Termin beim Zahnarzt.',
    luecke: 'I have an ___ at the dentist tomorrow.',
    richtig: ['appointment'], falle: 'term',
    warum: '„term" ist der Fachbegriff oder das Schulhalbjahr.' },
  { id: 'outpatients', satz: 'Er wurde in der Ambulanz behandelt.',
    luecke: 'He was treated in the ___ department.',
    richtig: ['outpatient', 'outpatients'], falle: 'ambulance',
    warum: '„ambulance" ist der Krankenwagen.' },
];

/**
 * Was ein Kind oder ein Erwachsener getippt hat, auf Vergleichsform.
 *
 * Gross- und Kleinschreibung und der Schlusspunkt sind egal - so steht es
 * im Konzept. Getrimmt wird auch der doppelte Zwischenraum: „set  menu"
 * ist dieselbe Antwort wie „set menu", und wer sich darueber freut, hat
 * kein Englisch geprueft.
 *
 * NICHT nachsichtig ist die Rechtschreibung. Bei einer Wendung waere das
 * richtig (R6), hier nicht: die Aufgabe dreht sich um EIN Wort, und wer
 * „recieved" schreibt, soll es sehen.
 */
export const wieGetippt = (t) => String(t).toLowerCase().trim()
  .replace(/[.!?]+$/, '').replace(/\s+/g, ' ');

/** Der Vorrat der Ebene „Falsche Freunde". */
export function vorratFreunde(){
  return luecken(FREUNDE, 'freund');
}

/* Aus einer Fallenliste wird ein Vorrat. EINE Stelle fuer beide Ebenen
 * (I8): „Falsche Freunde" und „Gestern und heute" tragen dieselben
 * Felder, weil sie dieselbe Aufgabe stellen - deutscher Satz, englische
 * Luecke, eine Falle, die nicht angeboten, sondern ERKANNT wird. Zwei
 * gleichlautende `map`-Aufrufe waeren Regel 6: was zweimal dasteht,
 * veraltet einmal. */
const luecken = (liste, sorte) => liste.map(f => ({
  id: `en:${sorte}:${f.id}`, name: f.richtig[0],
  satz: f.satz, luecke: f.luecke, richtig: f.richtig, falle: f.falle,
  warum: f.warum }));

/* ---------- Gestern und heute: die unregelmaessigen Verben (I8) ----------
 *
 * WARUM DIESE EBENE UND NICHT MEHR FALSCHE FREUNDE.
 *
 * Der Inhalt-Audit hat gefragt, wie oft sich etwas wiederholt, und die
 * Antwort fuer die Eltern war: zu oft. Die erste Reaktion darauf war, die
 * bestehenden Listen zu verlaengern (I1). Das hilft gegen die
 * Wiederholung und nicht gegen das Zweite, was der Nutzer gesagt hat:
 * „es muss noch viel mehr Varianten geben". Eine laengere Liste ist keine
 * Variante - es ist dieselbe Frage mit mehr Zetteln.
 *
 * Die unregelmaessigen Verben sind die andere FRAGE, und sie sind der
 * eine Stoff, an dem deutschsprachige Erwachsene lebenslang haengen
 * bleiben: man weiss, dass „buy" unregelmaessig ist, und schreibt unter
 * Druck trotzdem „buyed". Genau darum tragen sie hier dieselbe Bauform
 * wie die falschen Freunde: die Falle wird nicht angeboten, sondern
 * ERKANNT. Wer „catched" tippt, bekommt an genau dieser Stelle die drei
 * Formen zu sehen, statt nur „falsch".
 *
 * DIE FALLE IST IMMER DIE REGELMAESSIGE FORM. Das ist keine Bequemlichkeit,
 * sondern der Fehler, den es wirklich gibt: niemand schreibt „boughted",
 * alle schreiben „buyed". Drei Ausnahmen stehen unten - dort, wo BEIDE
 * Formen zugelassen sind (learnt/learned), waere die regelmaessige Form
 * richtig, und die Falle ist deshalb eine dritte, falsch geschriebene.
 *
 * GEORDNET NACH KLANG, nicht nach Alphabet: die -ought/-aught-Gruppe, die
 * Reihe i-a-u, die o-e-Gruppe, das -ew, die -t-Endungen und zuletzt die
 * vier, die sich gar nicht aendern. Wer sie in dieser Reihenfolge sieht,
 * lernt Muster; wer sie alphabetisch sieht, lernt Einzelstuecke. Der
 * Leitner mischt sie ohnehin - die Ordnung ist fuer den, der die Liste
 * pflegt.
 */
export const VERBEN = [
  // --- Die -ought/-aught-Gruppe: dieselbe Endung, sechs Verben ---
  { id: 'v-buy',    satz: 'Ich habe das Buch gestern gekauft.',
    luecke: 'I ___ the book yesterday.', richtig: ['bought'], falle: 'buyed',
    warum: '„buy" ist unregelmäßig: buy — bought — bought.' },
  { id: 'v-bring',  satz: 'Sie hat den Kuchen mitgebracht.',
    luecke: 'She ___ the cake.', richtig: ['brought'], falle: 'bringed',
    warum: '„bring" ist unregelmäßig: bring — brought — brought.' },
  { id: 'v-catch',  satz: 'Er hat den Ball gefangen.',
    luecke: 'He ___ the ball.', richtig: ['caught'], falle: 'catched',
    warum: '„catch" ist unregelmäßig: catch — caught — caught.' },
  { id: 'v-teach',  satz: 'Sie hat uns Englisch beigebracht.',
    luecke: 'She ___ us English.', richtig: ['taught'], falle: 'teached',
    warum: '„teach" ist unregelmäßig: teach — taught — taught.' },
  { id: 'v-think',  satz: 'Ich dachte, du kommst später.',
    luecke: 'I ___ you were coming later.', richtig: ['thought'], falle: 'thinked',
    warum: '„think" ist unregelmäßig: think — thought — thought.' },
  { id: 'v-fight',  satz: 'Die beiden haben sich darum gestritten.',
    luecke: 'They ___ about it.', richtig: ['fought'], falle: 'fighted',
    warum: '„fight" ist unregelmäßig: fight — fought — fought.' },

  // --- i — a — u: die Reihe, die man einmal lernt ---
  { id: 'v-begin',  satz: 'Der Film hat um acht angefangen.',
    luecke: 'The film ___ at eight.', richtig: ['began'], falle: 'beginned',
    warum: '„begin" ist unregelmäßig: begin — began — begun.' },
  { id: 'v-drink',  satz: 'Er hat den ganzen Kaffee getrunken.',
    luecke: 'He ___ all the coffee.', richtig: ['drank'], falle: 'drinked',
    warum: '„drink" ist unregelmäßig: drink — drank — drunk.' },
  { id: 'v-sing',   satz: 'Wir haben zusammen gesungen.',
    luecke: 'We ___ together.', richtig: ['sang'], falle: 'singed',
    warum: '„sing" ist unregelmäßig: sing — sang — sung.' },
  { id: 'v-swim',   satz: 'Sie ist bis zur Insel geschwommen.',
    luecke: 'She ___ to the island.', richtig: ['swam'], falle: 'swimmed',
    warum: '„swim" ist unregelmäßig: swim — swam — swum.' },
  { id: 'v-ring',   satz: 'Das Telefon hat zweimal geklingelt.',
    luecke: 'The phone ___ twice.', richtig: ['rang'], falle: 'ringed',
    warum: '„ring" ist unregelmäßig: ring — rang — rung.' },
  { id: 'v-run',    satz: 'Er ist zum Bahnhof gerannt.',
    luecke: 'He ___ to the station.', richtig: ['ran'], falle: 'runned',
    warum: '„run" ist unregelmäßig: run — ran — run.' },
  { id: 'v-win',    satz: 'Unsere Mannschaft hat gewonnen.',
    luecke: 'Our team ___ the game.', richtig: ['won'], falle: 'winned',
    warum: '„win" ist unregelmäßig: win — won — won.' },
  { id: 'v-sit',    satz: 'Ich saß die ganze Zeit hinten.',
    luecke: 'I ___ at the back the whole time.', richtig: ['sat'], falle: 'sitted',
    warum: '„sit" ist unregelmäßig: sit — sat — sat.' },

  // --- o-e: der Vokal wandert nach hinten ---
  { id: 'v-write',  satz: 'Ich habe ihr gestern geschrieben.',
    luecke: 'I ___ to her yesterday.', richtig: ['wrote'], falle: 'writed',
    warum: '„write" ist unregelmäßig: write — wrote — written.' },
  { id: 'v-drive',  satz: 'Wir sind die ganze Nacht gefahren.',
    luecke: 'We ___ all night.', richtig: ['drove'], falle: 'drived',
    warum: '„drive" ist unregelmäßig: drive — drove — driven.' },
  { id: 'v-ride',   satz: 'Sie ist mit dem Rad zur Arbeit gefahren.',
    luecke: 'She ___ her bike to work.', richtig: ['rode'], falle: 'rided',
    warum: '„ride" ist unregelmäßig: ride — rode — ridden.' },
  { id: 'v-choose', satz: 'Er hat das billigere Zimmer gewählt.',
    luecke: 'He ___ the cheaper room.', richtig: ['chose'], falle: 'choosed',
    warum: '„choose" ist unregelmäßig: choose — chose — chosen.' },
  { id: 'v-freeze', satz: 'Der See ist über Nacht zugefroren.',
    luecke: 'The lake ___ overnight.', richtig: ['froze'], falle: 'freezed',
    warum: '„freeze" ist unregelmäßig: freeze — froze — frozen.' },
  { id: 'v-speak',  satz: 'Ich habe schon mit ihm gesprochen.',
    luecke: 'I ___ to him already.', richtig: ['spoke'], falle: 'speaked',
    warum: '„speak" ist unregelmäßig: speak — spoke — spoken.' },
  { id: 'v-break',  satz: 'Sie hat sich den Arm gebrochen.',
    luecke: 'She ___ her arm.', richtig: ['broke'], falle: 'breaked',
    warum: '„break" ist unregelmäßig: break — broke — broken.' },
  { id: 'v-steal',  satz: 'Jemand hat mein Fahrrad gestohlen.',
    luecke: 'Someone ___ my bike.', richtig: ['stole'], falle: 'stealed',
    warum: '„steal" ist unregelmäßig: steal — stole — stolen.' },
  { id: 'v-wake',   satz: 'Ich bin um sechs aufgewacht.',
    luecke: 'I ___ up at six.', richtig: ['woke'], falle: 'waked',
    warum: '„wake" ist unregelmäßig: wake — woke — woken.' },
  { id: 'v-wear',   satz: 'Er hat einen blauen Mantel getragen.',
    luecke: 'He ___ a blue coat.', richtig: ['wore'], falle: 'weared',
    warum: '„wear" ist unregelmäßig: wear — wore — worn.' },
  { id: 'v-tear',   satz: 'Sie hat den Brief zerrissen.',
    luecke: 'She ___ up the letter.', richtig: ['tore'], falle: 'teared',
    warum: '„tear" ist unregelmäßig: tear — tore — torn.' },

  // --- ew: fliegen, wachsen, wissen, werfen ---
  { id: 'v-fly',    satz: 'Wir sind letztes Jahr nach Kanada geflogen.',
    luecke: 'We ___ to Canada last year.', richtig: ['flew'], falle: 'flied',
    warum: '„fly" ist unregelmäßig: fly — flew — flown; „flied" gibt es nicht.' },
  { id: 'v-grow',   satz: 'Die Firma ist schnell gewachsen.',
    luecke: 'The company ___ quickly.', richtig: ['grew'], falle: 'growed',
    warum: '„grow" ist unregelmäßig: grow — grew — grown.' },
  { id: 'v-know',   satz: 'Ich wusste die Antwort nicht.',
    luecke: 'I did not ___ the answer.', richtig: ['know'], falle: 'knowed',
    warum: '„know" ist unregelmäßig: know — knew — known. Nach „did" steht wieder die Grundform.' },
  { id: 'v-throw',  satz: 'Er hat den Zettel weggeworfen.',
    luecke: 'He ___ the note away.', richtig: ['threw'], falle: 'throwed',
    warum: '„throw" ist unregelmäßig: throw — threw — thrown.' },
  { id: 'v-draw',   satz: 'Sie hat einen Plan gezeichnet.',
    luecke: 'She ___ a plan.', richtig: ['drew'], falle: 'drawed',
    warum: '„draw" ist unregelmäßig: draw — drew — drawn.' },
  { id: 'v-blow',   satz: 'Der Wind hat den Schirm umgeweht.',
    luecke: 'The wind ___ the umbrella over.', richtig: ['blew'], falle: 'blowed',
    warum: '„blow" ist unregelmäßig: blow — blew — blown.' },

  // --- Einzelgänger ---
  { id: 'v-see',    satz: 'Ich habe sie gestern gesehen.',
    luecke: 'I ___ her yesterday.', richtig: ['saw'], falle: 'seed',
    warum: '„see" ist unregelmäßig: see — saw — seen.' },
  { id: 'v-eat',    satz: 'Wir haben schon gegessen.',
    luecke: 'We ___ before we came.', richtig: ['ate'], falle: 'eated',
    warum: '„eat" ist unregelmäßig: eat — ate — eaten.' },
  { id: 'v-fall',   satz: 'Die Preise sind stark gefallen.',
    luecke: 'Prices ___ sharply.', richtig: ['fell'], falle: 'falled',
    warum: '„fall" ist unregelmäßig: fall — fell — fallen.' },
  { id: 'v-come',   satz: 'Sie kam eine Stunde zu spät.',
    luecke: 'She ___ an hour late.', richtig: ['came'], falle: 'comed',
    warum: '„come" ist unregelmäßig: come — came — come.' },
  { id: 'v-give',   satz: 'Er hat mir seine Nummer gegeben.',
    luecke: 'He ___ me his number.', richtig: ['gave'], falle: 'gived',
    warum: '„give" ist unregelmäßig: give — gave — given.' },
  { id: 'v-take',   satz: 'Das hat drei Stunden gedauert.',
    luecke: 'It ___ three hours.', richtig: ['took'], falle: 'taked',
    warum: '„take" ist unregelmäßig: take — took — taken.' },
  { id: 'v-stand',  satz: 'Wir standen zwanzig Minuten in der Schlange.',
    luecke: 'We ___ in line for twenty minutes.', richtig: ['stood'], falle: 'standed',
    warum: '„stand" ist unregelmäßig: stand — stood — stood.' },
  { id: 'v-under',  satz: 'Ich habe kein Wort verstanden.',
    luecke: 'I ___ nothing at all.', richtig: ['understood'], falle: 'understanded',
    warum: '„understand" ist unregelmäßig: understand — understood — understood.' },
  { id: 'v-hold',   satz: 'Sie hielt die Tür für mich auf.',
    luecke: 'She ___ the door for me.', richtig: ['held'], falle: 'holded',
    warum: '„hold" ist unregelmäßig: hold — held — held.' },
  { id: 'v-find',   satz: 'Wir haben den Schlüssel wiedergefunden.',
    luecke: 'We ___ the key again.', richtig: ['found'], falle: 'finded',
    warum: '„find" ist unregelmäßig: find — found — found.' },
  { id: 'v-hear',   satz: 'Ich habe kein Wort davon gehört.',
    luecke: 'I ___ nothing about it.', richtig: ['heard'], falle: 'heared',
    warum: '„hear" ist unregelmäßig: hear — heard — heard.' },
  { id: 'v-hide',   satz: 'Er hat den Schlüssel unter der Matte versteckt.',
    luecke: 'He ___ the key under the mat.', richtig: ['hid'], falle: 'hided',
    warum: '„hide" ist unregelmäßig: hide — hid — hidden.' },
  { id: 'v-bite',   satz: 'Der Hund hat den Briefträger gebissen.',
    luecke: 'The dog ___ the postman.', richtig: ['bit'], falle: 'bited',
    warum: '„bite" ist unregelmäßig: bite — bit — bitten.' },
  { id: 'v-hang',   satz: 'Der Mantel hing hinter der Tür.',
    luecke: 'The coat ___ behind the door.', richtig: ['hung'], falle: 'hanged',
    warum: '„hang" ist unregelmäßig: hang — hung — hung. „hanged" gibt es nur beim Hängen am Galgen.' },
  { id: 'v-stick',  satz: 'Der Zettel klebte am Kühlschrank.',
    luecke: 'The note ___ to the fridge.', richtig: ['stuck'], falle: 'sticked',
    warum: '„stick" ist unregelmäßig: stick — stuck — stuck.' },
  { id: 'v-lead',   satz: 'Diese Straße führte direkt zum Hafen.',
    luecke: 'This road ___ straight to the harbour.', richtig: ['led'], falle: 'leaded',
    warum: '„lead" ist unregelmäßig: lead — led — led.' },

  // --- -t statt -ed: die halbregelmäßigen ---
  { id: 'v-feel',   satz: 'Ich fühlte mich den ganzen Tag müde.',
    luecke: 'I ___ tired all day.', richtig: ['felt'], falle: 'feeled',
    warum: '„feel" ist unregelmäßig: feel — felt — felt.' },
  { id: 'v-keep',   satz: 'Sie hat alle Briefe aufgehoben.',
    luecke: 'She ___ all the letters.', richtig: ['kept'], falle: 'keeped',
    warum: '„keep" ist unregelmäßig: keep — kept — kept.' },
  { id: 'v-sleep',  satz: 'Ich habe kaum geschlafen.',
    luecke: 'I hardly ___ at all.', richtig: ['slept'], falle: 'sleeped',
    warum: '„sleep" ist unregelmäßig: sleep — slept — slept.' },
  { id: 'v-leave',  satz: 'Er ist ohne ein Wort gegangen.',
    luecke: 'He ___ without a word.', richtig: ['left'], falle: 'leaved',
    warum: '„leave" ist unregelmäßig: leave — left — left.' },
  { id: 'v-lose',   satz: 'Ich habe meinen Ausweis verloren.',
    luecke: 'I ___ my ID.', richtig: ['lost'], falle: 'losed',
    warum: '„lose" ist unregelmäßig: lose — lost — lost.' },
  { id: 'v-mean',   satz: 'So habe ich das nicht gemeint.',
    luecke: 'That is not what I ___.', richtig: ['meant'], falle: 'meaned',
    warum: '„mean" ist unregelmäßig: mean — meant — meant.' },
  { id: 'v-meet',   satz: 'Wir haben uns letzten Sommer kennengelernt.',
    luecke: 'We ___ last summer.', richtig: ['met'], falle: 'meeted',
    warum: '„meet" ist unregelmäßig: meet — met — met.' },
  { id: 'v-pay',    satz: 'Sie hat für alle bezahlt.',
    luecke: 'She ___ for everyone.', richtig: ['paid'], falle: 'payed',
    warum: '„pay" ist unregelmäßig: pay — paid — paid.' },
  { id: 'v-say',    satz: 'Er hat nichts dazu gesagt.',
    luecke: 'He ___ nothing about it.', richtig: ['said'], falle: 'sayed',
    warum: '„say" ist unregelmäßig: say — said — said.' },
  { id: 'v-sell',   satz: 'Wir haben das Auto letzten Monat verkauft.',
    luecke: 'We ___ the car last month.', richtig: ['sold'], falle: 'selled',
    warum: '„sell" ist unregelmäßig: sell — sold — sold.' },
  { id: 'v-tell',   satz: 'Sie hat mir alles erzählt.',
    luecke: 'She ___ me everything.', richtig: ['told'], falle: 'telled',
    warum: '„tell" ist unregelmäßig: tell — told — told.' },
  { id: 'v-send',   satz: 'Ich habe die Rechnung gestern geschickt.',
    luecke: 'I ___ the invoice yesterday.', richtig: ['sent'], falle: 'sended',
    warum: '„send" ist unregelmäßig: send — sent — sent.' },
  { id: 'v-spend',  satz: 'Wir haben zu viel Geld ausgegeben.',
    luecke: 'We ___ too much money.', richtig: ['spent'], falle: 'spended',
    warum: '„spend" ist unregelmäßig: spend — spent — spent.' },
  { id: 'v-build',  satz: 'Sie haben das Haus selbst gebaut.',
    luecke: 'They ___ the house themselves.', richtig: ['built'], falle: 'builded',
    warum: '„build" ist unregelmäßig: build — built — built.' },
  { id: 'v-lend',   satz: 'Er hat mir zwanzig Euro geliehen.',
    luecke: 'He ___ me twenty euros.', richtig: ['lent'], falle: 'lended',
    warum: '„lend" ist unregelmäßig: lend — lent — lent.' },
  { id: 'v-feed',   satz: 'Ich habe die Katze schon gefüttert.',
    luecke: 'I ___ the cat already.', richtig: ['fed'], falle: 'feeded',
    warum: '„feed" ist unregelmäßig: feed — fed — fed.' },

  // --- Die vier, die sich gar nicht ändern: die schwerste Gruppe ---
  { id: 'v-put',    satz: 'Ich habe den Schlüssel auf den Tisch gelegt.',
    luecke: 'I ___ the key on the table.', richtig: ['put'], falle: 'putted',
    warum: '„put" ändert sich nicht: put — put — put.' },
  { id: 'v-cut',    satz: 'Sie hat sich in den Finger geschnitten.',
    luecke: 'She ___ her finger.', richtig: ['cut'], falle: 'cutted',
    warum: '„cut" ändert sich nicht: cut — cut — cut.' },
  { id: 'v-cost',   satz: 'Die Reparatur hat dreihundert Euro gekostet.',
    luecke: 'The repair ___ three hundred euros.', richtig: ['cost'], falle: 'costed',
    warum: '„cost" ändert sich nicht: cost — cost — cost.' },
  { id: 'v-hurt',   satz: 'Mein Rücken hat den ganzen Tag wehgetan.',
    luecke: 'My back ___ all day.', richtig: ['hurt'], falle: 'hurted',
    warum: '„hurt" ändert sich nicht: hurt — hurt — hurt.' },
  { id: 'v-let',    satz: 'Sie haben uns nicht hinein gelassen.',
    luecke: 'They did not ___ us in.', richtig: ['let'], falle: 'letted',
    warum: '„let" ändert sich nicht: let — let — let.' },
  { id: 'v-read',   satz: 'Ich habe das Buch letzten Sommer gelesen.',
    luecke: 'I ___ the book last summer.', richtig: ['read'], falle: 'readed',
    warum: '„read" ändert sich in der Schrift nicht: read — read — read. Gesprochen wird die Vergangenheit wie „red".' },

  // --- Zwei Formen sind erlaubt: beides zählt ---
  { id: 'v-learn',  satz: 'Sie hat Spanisch in der Schule gelernt.',
    luecke: 'She ___ Spanish at school.', richtig: ['learnt', 'learned'], falle: 'learnd',
    warum: '„learn" hat zwei Formen: learnt (britisch) und learned (amerikanisch). „learnd" ist keine davon.' },
  { id: 'v-dream',  satz: 'Ich habe letzte Nacht seltsam geträumt.',
    luecke: 'I ___ strange things last night.', richtig: ['dreamt', 'dreamed'], falle: 'dremt',
    warum: '„dream" hat zwei Formen: dreamt und dreamed. „dremt" ist keine davon.' },
  { id: 'v-burn',   satz: 'Der Kuchen ist im Ofen verbrannt.',
    luecke: 'The cake ___ in the oven.', richtig: ['burnt', 'burned'], falle: 'brunt',
    warum: '„burn" hat zwei Formen: burnt und burned. „brunt" ist etwas anderes.' },
];

/** Der Vorrat der Ebene „Gestern und heute". */
export function vorratVerben(){
  return luecken(VERBEN, 'verb');
}

/* ---------- Das kleine Wort: die Praepositionen (I9) ---------------------
 *
 * Die dritte Ebene in dieser Bauform, und die, an der man am haeufigsten
 * erkannt wird. Ein Deutscher, der fliessend Englisch spricht, sagt
 * „I am waiting on the bus" - und zwar nicht, weil ihm ein Wort fehlt,
 * sondern weil er das deutsche „auf" mituebersetzt. Es ist der eine
 * Fehler, den Jahre im Ausland nicht abschleifen: die Praeposition haengt
 * am Verb, nicht am Sinn, und sie muss deshalb PAARWEISE gelernt werden.
 *
 * DIE FALLE IST IMMER DIE WOERTLICHE UEBERSETZUNG. Das ist keine
 * Bequemlichkeit, sondern der Fehler, den es wirklich gibt: niemand sagt
 * „waiting under the bus", alle sagen „waiting on". Deshalb steht in
 * jedem Grund, WELCHES deutsche Wort in die Irre fuehrt - „Das deutsche
 * auf ist hier nicht on". Ohne diesen Halbsatz waere die Auskunft „so
 * heisst es eben", und das lernt niemand.
 *
 * GEORDNET NACH DER DEUTSCHEN PRAEPOSITION und nicht nach dem englischen
 * Verb: auf, von, an, ueber, mit, vor, in, zu. Wer die Liste pflegt, sieht
 * dann sofort, welche Gruppe duenn ist.
 */
export const PRAEPOSITIONEN = [
  // --- Warten, hoffen, bitten: das deutsche „auf" wird englisch „for" ---
  { id: 'p-wait',    satz: 'Wir warten seit zwanzig Minuten auf den Bus.',
    luecke: 'We have been waiting ___ the bus for twenty minutes.',
    richtig: ['for'], falle: 'on',
    warum: 'Das deutsche „auf" ist hier nicht „on": man wartet for something.' },
  { id: 'p-hope',    satz: 'Wir hoffen auf besseres Wetter.',
    luecke: 'We are hoping ___ better weather.',
    richtig: ['for'], falle: 'on',
    warum: 'Auch hier wird „auf" nicht zu „on": hope for something.' },
  { id: 'p-ask',     satz: 'Er hat um eine Verlängerung gebeten.',
    luecke: 'He asked ___ an extension.',
    richtig: ['for'], falle: 'about',
    warum: '„ask about" heißt sich erkundigen; wer etwas HABEN will, sagt ask for.' },
  { id: 'p-look',    satz: 'Ich suche seit einer Stunde meinen Ausweis.',
    luecke: 'I have been looking ___ my ID for an hour.',
    richtig: ['for'], falle: 'after',
    warum: '„look after" heißt sich kümmern um; suchen ist look for.' },
  { id: 'p-pay',     satz: 'Sie hat für alle bezahlt.',
    luecke: 'She paid ___ everyone.',
    richtig: ['for'], falle: 'to',
    warum: '„pay to" gibt es nur beim Empfänger des Geldes; wofür bezahlt wird, steht mit for.' },
  { id: 'p-famous',  satz: 'Die Stadt ist für ihre Brücken bekannt.',
    luecke: 'The town is famous ___ its bridges.',
    richtig: ['for'], falle: 'of',
    warum: '„famous of" gibt es nicht: famous for something.' },
  { id: 'p-thanks',  satz: 'Danke für deine Hilfe.',
    luecke: 'Thank you ___ your help.',
    richtig: ['for'], falle: 'of',
    warum: 'Nicht „of": thank someone for something.' },

  // --- Das deutsche „von" wird selten „from" ---
  { id: 'p-depend',  satz: 'Das hängt vom Wetter ab.',
    luecke: 'It depends ___ the weather.',
    richtig: ['on'], falle: 'from',
    warum: 'Das deutsche „von" führt hier in die Irre: „from" wäre falsch, es heißt depend on.' },
  { id: 'p-consist', satz: 'Die Prüfung besteht aus drei Teilen.',
    luecke: 'The exam consists ___ three parts.',
    richtig: ['of'], falle: 'from',
    warum: 'Nicht „from": consist of something.' },
  { id: 'p-dream',   satz: 'Sie träumt von einem eigenen Laden.',
    luecke: 'She dreams ___ having her own shop.',
    richtig: ['of', 'about'], falle: 'from',
    warum: 'Nicht „from": dream of oder dream about.' },

  // --- Das deutsche „an" wird selten „on" ---
  { id: 'p-think',   satz: 'Ich denke gerade an meine Schwester.',
    luecke: 'I am thinking ___ my sister.',
    richtig: ['of', 'about'], falle: 'on',
    warum: 'Das deutsche „an" wird hier nicht „on": think of oder think about.' },
  { id: 'p-believe', satz: 'Sie glaubt an das Projekt.',
    luecke: 'She believes ___ the project.',
    richtig: ['in'], falle: 'on',
    warum: 'Nicht „on": believe in something.' },
  { id: 'p-part',    satz: 'Er hat an dem Kurs teilgenommen.',
    luecke: 'He took part ___ the course.',
    richtig: ['in'], falle: 'on',
    warum: 'Nicht „on": take part in something.' },
  { id: 'p-remind',  satz: 'Das erinnert mich an meinen Vater.',
    luecke: 'That reminds me ___ my father.',
    richtig: ['of'], falle: 'on',
    warum: 'Nicht „on": remind someone of something.' },
  { id: 'p-interest',satz: 'Ich bin an dem Angebot interessiert.',
    luecke: 'I am interested ___ the offer.',
    richtig: ['in'], falle: 'on',
    warum: 'Nicht „on": interested in something.' },
  { id: 'p-used',    satz: 'Ich bin an den Lärm gewöhnt.',
    luecke: 'I am used ___ the noise.',
    richtig: ['to'], falle: 'on',
    warum: 'Nicht „on": be used to something.' },

  // --- Das deutsche „über" ---
  { id: 'p-laugh',   satz: 'Alle haben über den Witz gelacht.',
    luecke: 'Everybody laughed ___ the joke.',
    richtig: ['at'], falle: 'about',
    warum: '„laugh about" sagt man kaum; über einen Witz lacht man at ihn.' },
  { id: 'p-complain',satz: 'Er hat sich über den Lärm beschwert.',
    luecke: 'He complained ___ the noise.',
    richtig: ['about'], falle: 'over',
    warum: 'Das deutsche „über" ist nicht „over": complain about something.' },
  { id: 'p-worry',   satz: 'Mach dir keine Sorgen um die Kinder.',
    luecke: 'Do not worry ___ the children.',
    richtig: ['about'], falle: 'around',
    warum: 'Das deutsche „um" ist hier nicht „around": worry about somebody.' },

  // --- Das deutsche „mit" ---
  { id: 'p-married', satz: 'Sie ist seit zehn Jahren mit ihm verheiratet.',
    luecke: 'She has been married ___ him for ten years.',
    richtig: ['to'], falle: 'with',
    warum: 'Das deutsche „mit" führt hier in die Irre: „with" wäre falsch, es heißt married to.' },
  { id: 'p-full',    satz: 'Der Zug war voll mit Reisenden.',
    luecke: 'The train was full ___ passengers.',
    richtig: ['of'], falle: 'with',
    warum: 'Nicht „with": full of something.' },
  { id: 'p-angry',   satz: 'Sie war wütend auf ihren Kollegen.',
    luecke: 'She was angry ___ her colleague.',
    richtig: ['with', 'at'], falle: 'on',
    warum: 'Das deutsche „auf" wird nicht „on": angry with somebody.' },

  // --- Das deutsche „vor" ---
  { id: 'p-afraid',  satz: 'Er hat Angst vor Hunden.',
    luecke: 'He is afraid ___ dogs.',
    richtig: ['of'], falle: 'before',
    warum: 'Das deutsche „vor" ist hier nicht „before": afraid of something.' },
  { id: 'p-protect', satz: 'Der Schirm schützt vor der Sonne.',
    luecke: 'The umbrella protects you ___ the sun.',
    richtig: ['from'], falle: 'before',
    warum: 'Nicht „before": protect from something.' },
  { id: 'p-warn',    satz: 'Sie hat mich vor dem Weg gewarnt.',
    luecke: 'She warned me ___ the route.',
    richtig: ['about', 'of'], falle: 'before',
    warum: 'Nicht „before": warn somebody about something.' },

  // --- Das deutsche „in" ---
  { id: 'p-good',    satz: 'Sie ist gut in Mathe.',
    luecke: 'She is good ___ maths.',
    richtig: ['at'], falle: 'in',
    warum: 'Das deutsche „in" wird hier „at": good at something.' },
  { id: 'p-succeed', satz: 'Er war damit erfolgreich.',
    luecke: 'He succeeded ___ doing it.',
    richtig: ['in'], falle: 'with',
    warum: 'Nicht „with": succeed in doing something.' },
  { id: 'p-arrive',  satz: 'Wir sind um zehn am Flughafen angekommen.',
    luecke: 'We arrived ___ the airport at ten.',
    richtig: ['at'], falle: 'in',
    warum: 'Bei einem Ort wie einem Flughafen heißt es arrive at; „in" steht nur bei Städten und Ländern.' },

  // --- Das deutsche „zu" ---
  { id: 'p-listen',  satz: 'Sie hört gern Radio.',
    luecke: 'She likes listening ___ the radio.',
    richtig: ['to'], falle: 'at',
    warum: 'Nicht „at": listen to something.' },
  { id: 'p-congrat', satz: 'Ich gratuliere dir zu deiner neuen Stelle.',
    luecke: 'Congratulations ___ your new job.',
    richtig: ['on'], falle: 'to',
    warum: 'Das deutsche „zu" wird hier nicht „to": congratulations on something.' },
  { id: 'p-belong',  satz: 'Das Fahrrad gehört meinem Bruder.',
    luecke: 'The bike belongs ___ my brother.',
    richtig: ['to'], falle: 'of',
    warum: 'Nicht „of": belong to somebody.' },
  { id: 'p-similar', satz: 'Das ist dem letzten Fall sehr ähnlich.',
    luecke: 'This is very similar ___ the last case.',
    richtig: ['to'], falle: 'with',
    warum: 'Nicht „with": similar to something.' },

  // --- Und die, die man einzeln lernt ---
  { id: 'p-proud',   satz: 'Sie ist stolz auf ihre Tochter.',
    luecke: 'She is proud ___ her daughter.',
    richtig: ['of'], falle: 'on',
    warum: 'Das deutsche „auf" wird nicht „on": proud of somebody.' },
  { id: 'p-jealous', satz: 'Er ist neidisch auf seinen Nachbarn.',
    luecke: 'He is jealous ___ his neighbour.',
    richtig: ['of'], falle: 'on',
    warum: 'Auch hier kein „on": jealous of somebody.' },
  { id: 'p-capable', satz: 'Dazu ist sie durchaus fähig.',
    luecke: 'She is quite capable ___ it.',
    richtig: ['of'], falle: 'to',
    warum: 'Nicht „to": capable of something.' },
  { id: 'p-respons', satz: 'Wer ist für die Kasse verantwortlich?',
    luecke: 'Who is responsible ___ the till?',
    richtig: ['for'], falle: 'of',
    warum: 'Nicht „of": responsible for something.' },
  { id: 'p-suffer',  satz: 'Er leidet unter starken Kopfschmerzen.',
    luecke: 'He suffers ___ bad headaches.',
    richtig: ['from'], falle: 'under',
    warum: 'Das deutsche „unter" ist nicht „under": suffer from something.' },
  { id: 'p-rely',    satz: 'Auf sie kann man sich verlassen.',
    luecke: 'You can rely ___ her.',
    richtig: ['on'], falle: 'of',
    warum: 'Nicht „of": rely on somebody.' },
  { id: 'p-differ',  satz: 'Das unterscheidet sich vom letzten Modell.',
    luecke: 'This differs ___ the last model.',
    richtig: ['from'], falle: 'of',
    warum: 'Nicht „of": differ from something.' },
  { id: 'p-spend',   satz: 'Wir haben zu viel Geld für das Auto ausgegeben.',
    luecke: 'We spent too much money ___ the car.',
    richtig: ['on'], falle: 'for',
    warum: 'Das deutsche „für" wird hier nicht „for": spend money on something.' },
  { id: 'p-borrow',  satz: 'Ich habe mir das Buch von ihr geliehen.',
    luecke: 'I borrowed the book ___ her.',
    richtig: ['from'], falle: 'of',
    warum: 'Nicht „of": borrow something from somebody.' },
  { id: 'p-accuse',  satz: 'Man hat ihn des Betrugs beschuldigt.',
    luecke: 'They accused him ___ fraud.',
    richtig: ['of'], falle: 'for',
    warum: 'Nicht „for": accuse somebody of something.' },
  { id: 'p-blame',   satz: 'Niemand gibt dir die Schuld an dem Fehler.',
    luecke: 'Nobody blames you ___ the mistake.',
    richtig: ['for'], falle: 'of',
    warum: 'Nicht „of": blame somebody for something.' },
  { id: 'p-apply',   satz: 'Sie hat sich auf die Stelle beworben.',
    luecke: 'She applied ___ the job.',
    richtig: ['for'], falle: 'on',
    warum: 'Nicht „on": apply for a job.' },
  { id: 'p-insist',  satz: 'Er bestand auf einer Quittung.',
    luecke: 'He insisted ___ a receipt.',
    richtig: ['on'], falle: 'of',
    warum: 'Nicht „of": insist on something.' },
  { id: 'p-recover', satz: 'Sie hat sich schnell von der Grippe erholt.',
    luecke: 'She recovered quickly ___ the flu.',
    richtig: ['from'], falle: 'of',
    warum: 'Nicht „of": recover from an illness.' },
  { id: 'p-agree',   satz: 'Da bin ich ganz deiner Meinung.',
    luecke: 'I completely agree ___ you.',
    richtig: ['with'], falle: 'to',
    warum: '„agree to" gilt einem Vorschlag; einem Menschen stimmt man with zu.' },
  { id: 'p-satisf',  satz: 'Sind Sie mit dem Ergebnis zufrieden?',
    luecke: 'Are you satisfied ___ the result?',
    richtig: ['with'], falle: 'of',
    warum: 'Nicht „of": satisfied with something.' },
  { id: 'p-typical', satz: 'Das ist typisch für ihn.',
    luecke: 'That is typical ___ him.',
    richtig: ['of'], falle: 'for',
    warum: 'Das deutsche „für" wird hier nicht „for": typical of somebody.' },
  { id: 'p-ready',   satz: 'Bist du für morgen bereit?',
    luecke: 'Are you ready ___ tomorrow?',
    richtig: ['for'], falle: 'to',
    warum: 'Vor einem Hauptwort steht „for", nicht „to": ready for something.' },
  { id: 'p-stare',   satz: 'Alle starrten auf den Bildschirm.',
    luecke: 'Everybody was staring ___ the screen.',
    richtig: ['at'], falle: 'on',
    warum: 'Das deutsche „auf" wird nicht „on": stare at something.' },
  { id: 'p-invest',  satz: 'Sie haben viel in die Ausbildung gesteckt.',
    luecke: 'They invested a lot ___ training.',
    richtig: ['in'], falle: 'into',
    warum: 'Nicht „into": invest in something.' },
  { id: 'p-translate', satz: 'Übersetzen Sie den Satz bitte ins Englische.',
    luecke: 'Please translate the sentence ___ English.',
    richtig: ['into'], falle: 'in',
    warum: 'Hier reicht „in" nicht: translate into a language.' },
  { id: 'p-vote',    satz: 'Sie hat für den Vorschlag gestimmt.',
    luecke: 'She voted ___ the proposal.',
    richtig: ['for'], falle: 'about',
    warum: 'Nicht „about": vote for something.' },
  { id: 'p-care',    satz: 'Das ist ihr völlig egal.',
    luecke: 'She does not care ___ it at all.',
    richtig: ['about'], falle: 'around',
    warum: 'Nicht „around": care about something.' },
  { id: 'p-escape',  satz: 'Die Katze ist aus dem Haus entkommen.',
    luecke: 'The cat escaped ___ the house.',
    richtig: ['from'], falle: 'out',
    warum: 'Nicht „out": escape from a place.' },
  { id: 'p-share',   satz: 'Er teilt sich das Büro mit zwei Kollegen.',
    luecke: 'He shares the office ___ two colleagues.',
    richtig: ['with'], falle: 'to',
    warum: 'Nicht „to": share something with somebody.' },
  { id: 'p-hear',    satz: 'Ich habe seit Wochen nichts von ihr gehört.',
    luecke: 'I have not heard ___ her for weeks.',
    richtig: ['from'], falle: 'of',
    warum: '„hear of" heißt von der Existenz wissen; eine Nachricht bekommt man from jemandem.' },
];

/** Der Vorrat der Ebene „Das kleine Wort". */
export function vorratPraepositionen(){
  return luecken(PRAEPOSITIONEN, 'praep');
}

/* ---------- Wendungen (E11) und Hoersaetze (E12) --------------------------
 *
 * Beides fuer Stephan und Violeta, beides ohne ein einziges Bild - und
 * beide auf DENSELBEN vier Themengebieten wie Leas Wortschatz. Das ist
 * Absicht und nicht Sparsamkeit: wer am selben Abend spielt, hat dasselbe
 * Thema gehabt. Eine zweite Themenliste waere eine, die veraltet.
 *
 * E11, DIE WENDUNG UND NICHT DAS WORT. Deutsch steht da, Englisch wird
 * getippt - aber nie ein Einzelwort. Und: MEHRERE Loesungen gelten.
 * „Could we have the bill" ist genauso richtig wie „Could we get the
 * bill". Eine Wendung mit genau einer zugelassenen Antwort prueft
 * Auswendiglernen statt Koennen; das Untertor `englisch` verlangt deshalb
 * fuer JEDE Wendung mindestens zwei.
 *
 * E12, HOEREN UND SCHREIBEN. Ein ganzer Satz, einmal gesprochen, in
 * normalem Tempo - nicht buchstabiert, nicht verlangsamt. Langsames
 * Englisch uebt langsames Englisch; was am Flughafen gesprochen wird, ist
 * schnell. Ein zweites Mal Hoeren gibt es, aber es wird GEZAEHLT - nicht
 * bestraft, nur gezaehlt. Eine Zahl, die man sieht, wirkt ohne Strafe.
 *
 * Die Hoersaetze sind AUS DEN WENDUNGEN GEBAUT und nicht daneben
 * erfunden: jeder ist die erste zugelassene Antwort einer Wendung. Damit
 * kann E12 nicht von E11 abweichen - und `inhalt` rechnet genau das nach.
 */
export const WENDUNGEN = [
  // --- 4.1 Familie und Freunde ---
  { id: 'w-vorstellen', gebiet: '4.1', deutsch: 'Darf ich vorstellen — das ist meine Frau.',
    richtig: ['This is my wife.', 'Let me introduce my wife.',
              'I would like you to meet my wife.', "I'd like you to meet my wife."] },
  { id: 'w-woher',      gebiet: '4.1', deutsch: 'Wir kommen aus der Nähe von München.',
    richtig: ['We are from near Munich.', "We're from near Munich.",
              'We come from near Munich.', 'We live near Munich.'] },
  { id: 'w-kinder',     gebiet: '4.1', deutsch: 'Wir haben zwei Kinder, acht und sechs.',
    richtig: ['We have two children, eight and six.',
              "We've got two children, eight and six.",
              'We have got two children, eight and six.'] },
  { id: 'w-wiegehts',   gebiet: '4.1', deutsch: 'Wie geht es dir denn so?',
    richtig: ['How are you doing?', 'How are you?', 'How have you been?',
              "How's it going?", 'How is it going?'] },
  { id: 'w-freutmich',  gebiet: '4.1', deutsch: 'Es hat mich gefreut, Sie kennenzulernen.',
    richtig: ['It was nice to meet you.', 'It was good to meet you.',
              'Nice to meet you.', 'It was a pleasure to meet you.'] },
  // --- 4.2 Schule ---
  { id: 'w-nochmal',    gebiet: '4.2', deutsch: 'Könnten Sie das bitte noch einmal sagen?',
    richtig: ['Could you say that again, please?', 'Could you repeat that, please?',
              'Would you say that again, please?', 'Sorry, could you say that again?'] },
  { id: 'w-langsamer',  gebiet: '4.2', deutsch: 'Könnten Sie bitte etwas langsamer sprechen?',
    richtig: ['Could you speak a little more slowly, please?',
              'Could you speak more slowly, please?',
              'Could you slow down a little, please?'] },
  { id: 'w-verstehe',   gebiet: '4.2', deutsch: 'Das habe ich nicht ganz verstanden.',
    richtig: ["I didn't quite get that.", 'I did not quite get that.',
              "I didn't quite catch that.", "I'm not sure I understood that."] },
  { id: 'w-wieheisst',  gebiet: '4.2', deutsch: 'Wie heißt das auf Englisch?',
    richtig: ["What's that called in English?", 'What is that called in English?',
              "What's the English word for that?", 'How do you say that in English?'] },
  { id: 'w-frage',      gebiet: '4.2', deutsch: 'Darf ich kurz etwas fragen?',
    richtig: ['Could I ask you something?', 'May I ask you something?',
              'Can I ask you a quick question?'] },
  // --- 4.3 Freizeit und Feste ---
  { id: 'w-wochenende', gebiet: '4.3', deutsch: 'Was machst du am Wochenende?',
    richtig: ['What are you doing at the weekend?',
              'What are you up to at the weekend?',
              'What are you doing this weekend?'] },
  { id: 'w-gernemal',   gebiet: '4.3', deutsch: 'Wir würden gern mal wiederkommen.',
    richtig: ["We'd like to come back some time.",
              'We would like to come back some time.',
              "We'd love to come back again."] },
  { id: 'w-empfehlen',  gebiet: '4.3', deutsch: 'Was würden Sie uns hier empfehlen?',
    richtig: ['What would you recommend here?', 'What would you recommend?',
              'What can you recommend here?'] },
  { id: 'w-lustig',     gebiet: '4.3', deutsch: 'Das hat wirklich Spaß gemacht.',
    richtig: ['That was really good fun.', 'That was great fun.',
              'We really enjoyed that.', 'That was a lot of fun.'] },
  { id: 'w-verabreden', gebiet: '4.3', deutsch: 'Wollen wir uns morgen um sieben treffen?',
    richtig: ['Shall we meet at seven tomorrow?',
              'Should we meet at seven tomorrow?',
              'How about meeting at seven tomorrow?'] },
  // --- 4.4 Einkaufen ---
  { id: 'w-zahlen',     gebiet: '4.4', deutsch: 'Können wir bitte zahlen?',
    richtig: ['Could we get the bill, please?', 'Could we have the bill, please?',
              'Can we have the bill, please?', 'Could we pay, please?'] },
  { id: 'w-kostet',     gebiet: '4.4', deutsch: 'Was kostet das?',
    richtig: ['How much is it?', 'How much is this?', 'How much does it cost?',
              "What's the price?"] },
  { id: 'w-nurschauen', gebiet: '4.4', deutsch: 'Danke, ich schaue mich nur um.',
    richtig: ["Thanks, I'm just looking.", 'Thanks, I am just looking.',
              "Thank you, I'm just browsing.", "No thanks, I'm just looking."] },
  { id: 'w-anprobieren', gebiet: '4.4', deutsch: 'Kann ich das anprobieren?',
    richtig: ['Can I try it on?', 'Could I try it on?', 'May I try this on?'] },
  { id: 'w-karte',      gebiet: '4.4', deutsch: 'Kann ich mit Karte zahlen?',
    richtig: ['Can I pay by card?', 'Could I pay by card?', 'Do you take cards?',
              'Do you accept cards?'] },
  // --- I1: vierzig weitere Wendungen (Inhalt-Audit) -------------------
  // Zwanzig Wendungen bei zwoelf Aufgaben je Sitzung waren 1,7 Runden -
  // die zweite Sitzung war fast die erste. Mit sechzig sind es fuenf.
  // --- 4.1 Familie und Freunde ---
  { id: 'w-geburtstag', gebiet: '4.1', deutsch: 'Meine Tochter hat nächste Woche Geburtstag.',
    richtig: ["My daughter's birthday is next week.",
              "It's my daughter's birthday next week.",
              "My daughter has her birthday next week."] },
  { id: 'w-beruf',      gebiet: '4.1', deutsch: 'Ich arbeite bei einer Baufirma.',
    richtig: ['I work for a construction company.',
              'I work at a construction company.',
              "I'm with a construction company."] },
  { id: 'w-schwester',  gebiet: '4.1', deutsch: 'Meine Schwester wohnt in Berlin.',
    richtig: ['My sister lives in Berlin.', 'My sister is based in Berlin.'] },
  { id: 'w-besuch',     gebiet: '4.1', deutsch: 'Kommt ihr uns mal besuchen?',
    richtig: ['Will you come and visit us some time?',
              'Are you going to visit us some time?',
              "Why don't you come and visit us some time?"] },
  { id: 'w-verheiratet', gebiet: '4.1', deutsch: 'Wir sind seit zwölf Jahren verheiratet.',
    richtig: ['We have been married for twelve years.',
              "We've been married for twelve years."] },
  { id: 'w-eltern',     gebiet: '4.1', deutsch: 'Meine Eltern wohnen nicht weit weg.',
    richtig: ['My parents do not live far away.',
              "My parents don't live far away.", 'My parents live nearby.'] },
  { id: 'w-gruesse',    gebiet: '4.1', deutsch: 'Grüß deine Frau von mir.',
    richtig: ['Say hello to your wife from me.',
              'Give my regards to your wife.', 'Say hi to your wife from me.'] },
  { id: 'w-einladung',  gebiet: '4.1', deutsch: 'Danke für die Einladung.',
    richtig: ['Thank you for the invitation.', 'Thanks for inviting us.',
              'Thanks for having us.'] },
  { id: 'w-melden',     gebiet: '4.1', deutsch: 'Ich melde mich nächste Woche.',
    richtig: ["I'll be in touch next week.", 'I will get in touch next week.',
              "I'll let you know next week."] },
  { id: 'w-haustiere',  gebiet: '4.1', deutsch: 'Wir haben einen Hund und zwei Katzen.',
    richtig: ['We have a dog and two cats.', "We've got a dog and two cats."] },
  // --- 4.2 Sich verständigen ---
  { id: 'w-buchstabieren', gebiet: '4.2', deutsch: 'Können Sie das bitte buchstabieren?',
    richtig: ['Could you spell that, please?', 'Can you spell that, please?',
              'Would you spell that, please?'] },
  { id: 'w-aufschreiben', gebiet: '4.2', deutsch: 'Können Sie mir das aufschreiben?',
    richtig: ['Could you write that down for me?',
              'Can you write that down for me?'] },
  { id: 'w-aufdeutsch', gebiet: '4.2', deutsch: 'Was heißt das auf Deutsch?',
    richtig: ['What does that mean in German?', 'What is that in German?',
              "What's that in German?"] },
  { id: 'w-nichtgut',   gebiet: '4.2', deutsch: 'Mein Englisch ist nicht besonders gut.',
    richtig: ['My English is not very good.', "My English isn't very good.",
              "I don't speak English very well."] },
  { id: 'w-bedeutet',   gebiet: '4.2', deutsch: 'Was bedeutet dieses Wort?',
    richtig: ['What does this word mean?', 'What is the meaning of this word?'] },
  { id: 'w-richtig',    gebiet: '4.2', deutsch: 'Habe ich das richtig verstanden?',
    richtig: ['Have I got that right?', 'Did I understand that correctly?',
              'Have I understood that correctly?'] },
  { id: 'w-moment',     gebiet: '4.2', deutsch: 'Einen Moment bitte.',
    richtig: ['Just a moment, please.', 'One moment, please.',
              'Hold on a moment, please.'] },
  { id: 'w-lauter',     gebiet: '4.2', deutsch: 'Könnten Sie etwas lauter sprechen?',
    richtig: ['Could you speak up a little, please?',
              'Could you speak a little louder, please?'] },
  { id: 'w-notiere',    gebiet: '4.2', deutsch: 'Ich schreibe es mir auf.',
    richtig: ["I'll write it down.", 'I am going to write it down.',
              'Let me write that down.'] },
  { id: 'w-uebersetzen', gebiet: '4.2', deutsch: 'Wie übersetzt man das?',
    richtig: ['How do you translate that?',
              'What is the translation for that?'] },
  // --- 4.3 Freizeit und unterwegs ---
  { id: 'w-urlaub',     gebiet: '4.3', deutsch: 'Wir fahren im Sommer nach Italien.',
    richtig: ['We are going to Italy in the summer.',
              "We're going to Italy in the summer.",
              'We will go to Italy in the summer.'] },
  { id: 'w-wetter',     gebiet: '4.3', deutsch: 'Das Wetter soll morgen besser werden.',
    richtig: ['The weather is supposed to get better tomorrow.',
              'The weather should get better tomorrow.'] },
  { id: 'w-wandern',    gebiet: '4.3', deutsch: 'Wir gehen sonntags gern wandern.',
    richtig: ['We like going hiking on Sundays.',
              'We like to go hiking on Sundays.'] },
  { id: 'w-spiel',      gebiet: '4.3', deutsch: 'Schaust du heute Abend das Spiel?',
    richtig: ['Are you watching the game tonight?',
              'Are you going to watch the game tonight?',
              'Will you watch the game tonight?'] },
  { id: 'w-hotel',      gebiet: '4.3', deutsch: 'Wir haben ein Zimmer für zwei Nächte reserviert.',
    richtig: ['We have booked a room for two nights.',
              "We've booked a room for two nights.",
              'We have reserved a room for two nights.'] },
  { id: 'w-weg',        gebiet: '4.3', deutsch: 'Können Sie mir den Weg zum Bahnhof sagen?',
    richtig: ['Could you tell me the way to the station?',
              'Can you tell me how to get to the station?'] },
  { id: 'w-zug',        gebiet: '4.3', deutsch: 'Wann fährt der nächste Zug nach London?',
    richtig: ['When does the next train to London leave?',
              'What time does the next train to London leave?'] },
  { id: 'w-museum',     gebiet: '4.3', deutsch: 'Ist das Museum sonntags geöffnet?',
    richtig: ['Is the museum open on Sundays?',
              'Is the museum open on a Sunday?'] },
  { id: 'w-dauer',      gebiet: '4.3', deutsch: 'Wie lange dauert die Fahrt?',
    richtig: ['How long does the journey take?', 'How long is the journey?',
              'How long does it take to get there?'] },
  { id: 'w-foto',       gebiet: '4.3', deutsch: 'Könnten Sie ein Foto von uns machen?',
    richtig: ['Could you take a photo of us?',
              'Would you take a picture of us?'] },
  // --- 4.4 Einkaufen und Essen ---
  { id: 'w-tisch',      gebiet: '4.4', deutsch: 'Wir haben einen Tisch für vier reserviert.',
    richtig: ['We have booked a table for four.',
              'We have a table booked for four.',
              'We have a reservation for four.'] },
  { id: 'w-bestellen',  gebiet: '4.4', deutsch: 'Wir möchten gern bestellen.',
    richtig: ["We'd like to order, please.", 'We would like to order, please.',
              'Could we order, please?'] },
  { id: 'w-vegetarisch', gebiet: '4.4', deutsch: 'Haben Sie etwas Vegetarisches?',
    richtig: ['Do you have anything vegetarian?',
              'Have you got anything vegetarian?',
              'Is there anything vegetarian?'] },
  { id: 'w-geschmeckt', gebiet: '4.4', deutsch: 'Das hat sehr gut geschmeckt.',
    richtig: ['That was very good.', 'That was delicious.',
              'It tasted very good.'] },
  { id: 'w-getrennt',   gebiet: '4.4', deutsch: 'Wir zahlen getrennt.',
    richtig: ["We'd like to pay separately.", 'We are paying separately.',
              'Separate bills, please.'] },
  { id: 'w-groesse',    gebiet: '4.4', deutsch: 'Haben Sie das eine Nummer größer?',
    richtig: ['Do you have this in a larger size?',
              'Have you got this in a bigger size?'] },
  { id: 'w-umtausch',   gebiet: '4.4', deutsch: 'Kann ich das umtauschen?',
    richtig: ['Can I exchange this?', 'Could I exchange this?',
              'Is it possible to exchange this?'] },
  { id: 'w-quittung',   gebiet: '4.4', deutsch: 'Könnte ich bitte eine Quittung haben?',
    richtig: ['Could I have a receipt, please?',
              'Can I have a receipt, please?'] },
  { id: 'w-guenstiger', gebiet: '4.4', deutsch: 'Haben Sie etwas Günstigeres?',
    richtig: ['Do you have anything cheaper?', 'Have you got anything cheaper?',
              'Is there anything cheaper?'] },
  { id: 'w-nehmeich',   gebiet: '4.4', deutsch: 'Das nehme ich.',
    richtig: ["I'll take it.", 'I will take it.', "I'll take this one."] },
];

/* Die Hoersaetze (E12) - je Themengebiet drei, und JEDER ist die erste
   zugelassene Antwort einer Wendung. Erfunden wird hier nichts: die
   Kennung zeigt auf die Wendung, der Satz wird von dort geholt. So kann
   E12 nicht von E11 abweichen, und wer eine Wendung umformuliert, aendert
   den Hoersatz mit. */
export const HOERSAETZE = [
  'w-vorstellen', 'w-wiegehts', 'w-freutmich',
  'w-nochmal', 'w-verstehe', 'w-wieheisst',
  'w-wochenende', 'w-empfehlen', 'w-verabreden',
  'w-zahlen', 'w-kostet', 'w-anprobieren',
  /* I1: achtzehn dazu. Zwoelf Diktatsaetze bei zwoelf Aufgaben je
     Sitzung hiess, dass die zweite Sitzung Satz fuer Satz die erste war -
     der schaerfste Einzelbefund des Inhalt-Audits. Genommen ist nur, was
     die Neun-Woerter-Grenze haelt: ein Diktat misst das Hoeren, ab einer
     gewissen Laenge das Behalten. */
  'w-geburtstag', 'w-beruf', 'w-verheiratet', 'w-haustiere', 'w-einladung',
  'w-buchstabieren', 'w-aufschreiben', 'w-nichtgut', 'w-bedeutet',
  'w-moment', 'w-lauter', 'w-uebersetzen',
  'w-wetter', 'w-spiel', 'w-museum', 'w-dauer',
  'w-bestellen', 'w-vegetarisch', 'w-geschmeckt', 'w-guenstiger',
  'w-nehmeich', 'w-quittung',
];

/**
 * Ein ganzer Satz auf Vergleichsform.
 *
 * Gross- und Kleinschreibung, Satzzeichen und doppelte Zwischenraeume
 * sind egal - so steht es im Konzept. Der Apostroph wird vereinheitlicht:
 * eine Telefontastatur setzt gern den typografischen, die Daten tragen
 * den geraden, und daran soll niemand scheitern.
 *
 * NICHT vereinheitlicht werden Kurzformen: „I'd like" und „I would like"
 * bleiben zwei Antworten, und beide stehen in der Liste. Sie automatisch
 * gleichzusetzen hiesse zu raten, welche Kurzform gemeint war - „I'd"
 * kann „I would" und „I had" sein.
 */
export const wieGesagt = (t) => String(t).toLowerCase()
  .replace(/[‘’´`]/g, "'")
  .replace(/[.,!?;:]/g, ' ')
  .replace(/\s+/g, ' ').trim();

/* Das Themengebiet geht NICHT mit in den Vorrat - und das ist kein
 * Vergessen, sondern zweimal Absicht:
 *
 *   Es hiesse anderswo etwas anderes. `gebiet` traegt in dieser App das
 *   LAND, zu dem eine Hauptstadt gehoert („Die Hauptstadt von Spanien
 *   ist Madrid."). Ein Feld gleichen Namens mit einer Lehrplannummer
 *   darin ist genau die Doppeldeutigkeit, die beim naechsten Leser
 *   auffliegt - und `vorlaufAnsage` haette „Die Hauptstadt von 4.3"
 *   gesagt, waere nicht `deutsch` zufaellig davor abgefragt worden.
 *
 *   Und es stand als „4.3" auf der Vorlaufkachel. Fuer ein Kind wie fuer
 *   einen Erwachsenen ist das keine Auskunft, sondern eine Zeile - auf
 *   dem iPhone SE quer sechs Punkte zuviel, gemessen von `passt`.
 *
 * Geprueft wird das Gebiet trotzdem, und zwar da, wo es hingehoert: `inhalt`
 * liest `WENDUNGEN` selbst und verlangt alle vier Themengebiete. */

/** Der Vorrat der Ebene „Wendungen". */
export function vorratWendungen(){
  return WENDUNGEN.map(w => ({ id: `en:wendung:${w.id}`, name: w.richtig[0],
    deutsch: w.deutsch, richtig: w.richtig }));
}

/** Der Vorrat der Ebene „Hören und schreiben". */
export function vorratHoersaetze(){
  return HOERSAETZE.map(id => {
    const w = WENDUNGEN.find(x => x.id === id);
    return { id: `en:hoeren:${id}`, name: w.richtig[0], satzEn: w.richtig[0],
      richtig: w.richtig, deutsch: w.deutsch };
  });
}

/* ---------- Die Saetze zum Selbersagen (E9) ------------------------------
 *
 * DAS PROBLEM, und es steht dreissig Zeilen weiter oben in den Daten
 * selbst: die amtlichen Redemittel sind SCHABLONEN, keine Saetze.
 *
 *   'This is my (little) brother/sister … . His/Her name is … . He/She is 5/…'
 *
 * Das kann niemand nachsprechen. Ein Kind liest die Schraegstriche nicht
 * als Auswahl, sondern spricht sie mit; die Klammer wird zur Pause und das
 * Auslassungszeichen zum Stocken. Die Schablone ist fuer die Lehrkraft
 * geschrieben, nicht fuer die Lernende - und genau das macht sie als
 * Vorlage zum Selbersagen unbrauchbar.
 *
 * EIN CHUNK ist deshalb die Schablone EINMAL AUSGEFUELLT: ein ganzer,
 * kurzer Satz, hoechstens sieben Woerter, ohne Platzhalter, ohne
 * Schraegstrich. „This is my little brother." statt der Zeile darueber.
 *
 * WAS AMTLICH IST und was nicht - dieselbe Trennung wie ueberall in dieser
 * Datei, und sie ist hier die ganze Zusage:
 *   amtlich  die Schablone (`quelle`), Wort fuer Wort aus THEMENGEBIETE.
 *            Und jedes Wort des Satzes: es steht in WOERTER oder in
 *            NUR_WORT, sonst nirgends.
 *   MEINE    welche Schablone ausgefuellt wird und womit. Das ISB sagt
 *            nicht, welcher Satz sich zum Nachsprechen eignet.
 *
 * `quelle` ist deshalb kein Beleg zum Angucken, sondern das, was das Tor
 * nachrechnet: der String muss WOERTLICH in THEMENGEBIETE stehen, und das
 * Gebiet daneben muss dasselbe sein, in dem er steht. Ohne dieses Feld
 * waere jeder Satz eine Behauptung - und ein erfundener saehe genau aus
 * wie ein abgeleiteter, weil er neben amtlichen Daten steht. Das ist
 * Regel 3 (das Soll kommt aus der Referenz, nicht aus mir) in der Form,
 * die sie bei Vokabeln annimmt.
 *
 * WAS NICHT GEHT, und warum kein Satz es versucht - drei Verzichte, jeder
 * an einer Schablone gemessen, die sich angeboten haette:
 *
 *   NAMEN. 'My name is … . What’s your name?' braucht einen Namen, und
 *   kein Name steht im Wortschatz. „My name is Lea." waere ein erfundenes
 *   Wort in einem amtlich aussehenden Satz.
 *
 *   ZIFFERN. 'I go to school at 7 o’clock.' steht so in der Quelle - die 7
 *   steht aber in ZAHLEN und nicht in WOERTER, und die Wortprobe des Tors
 *   meldet sie. Der Satz heisst deshalb „I go to school." Die Zahlen sind
 *   in E3 zuhause, wo die Ziffer das Bild ist.
 *
 *   KURZFORMEN, DIE DIE LISTE NICHT KENNT. „It’s", „What’s", „You’re"
 *   stehen in den Redemitteln, aber nicht im Wortschatz - der kennt
 *   `I’m`, `can‘t`, `don‘t` und `haven’t`, sonst keine. Deshalb „How are
 *   you?" und nicht „What’s your name?", und deshalb „This is my room."
 *   und nicht „It’s small."
 *
 * UND EINE SCHABLONE BLEIBT GANZ AUS, obwohl sie die ergiebigste waere:
 * 'Do you like …? Yes, I do. / No, I don’t.' steht in 4.3 UND in 4.4,
 * Zeichen fuer Zeichen gleich. Ein Satz daraus koennte sein Gebiet nicht
 * beweisen - das Tor faende die Quelle in beiden und muesste jedes der
 * beiden Gebiete durchgehen lassen. Eine Pruefung, die bei einem Eintrag
 * nichts mehr entscheidet, ist fuer diesen Eintrag kein Beweis (Regel 1).
 *
 * FUENF JE GEBIET, nicht so viele wie moeglich. Vier verlangt das Tor,
 * damit es je Gebiet ein Abzeichen geben kann; der fuenfte ist die
 * Reserve, damit das Streichen eines einzelnen Satzes nicht sofort die
 * Ebene kippt. Mehr waere leicht - es gibt rund zwanzig weitere
 * ausfuellbare Schablonen -, aber ein Vorrat, der in einer Sitzung nie
 * zweimal dasselbe zeigt, uebt auch nichts zweimal.
 *
 * EINS NOCH, gemessen und nicht vermutet: diese Tabelle laesst `npm run
 * doppelt` anschlagen. Zwanzig gleichfoermige Zeilen (id, gebiet, satz,
 * quelle) ergeben einen Tokenlauf von 687, der sich mit den Tierzeilen in
 * `src/inhalt/tiere.js` deckt - ohne den Block sind es 0. Das ist
 * derselbe Fall wie bei den Laenderlisten in `src/inhalt/erdkunde.js`:
 * eine Tabelle SOLL gleichfoermig sein, sonst kann man ihre Zeilen nicht
 * nebeneinander lesen, und Zusammenlegen hiesse sie zu verstecken. Der
 * Eintrag dafuer gehoert nach `tor/doppelt-erlaubt.json` und ist noch
 * nicht drin - solange er fehlt, ist `doppelt` rot, und zwar zu Recht:
 * die Liste ist die Stelle, an der jemand HINSCHREIBT, warum etwas
 * zweimal dastehen darf.
 */
export const CHUNKS = [
  // --- 4.1 Familie und Freunde ---
  { id: 'c-familie', gebiet: '4.1', satz: 'This is my family.',
    quelle: 'This is my family. I have/I’ve (got) … .' },
  { id: 'c-bruder', gebiet: '4.1', satz: 'This is my little brother.',
    quelle: 'This is my (little) brother/sister … . His/Her name is … . He/She is 5/… How many brothers/sisters/… have you got?' },
  { id: 'c-haustier', gebiet: '4.1', satz: 'This is my pet.',
    quelle: 'This is my pet. Have you got a pet? Yes, I/we have/haven’t got a … .' },
  { id: 'c-alter', gebiet: '4.1', satz: 'How old are you?',
    quelle: 'I’m … . How old are you? I’m from Germany/… . Where are you from?' },
  { id: 'c-woher', gebiet: '4.1', satz: 'Where are you from?',
    quelle: 'I’m … . How old are you? I’m from Germany/… . Where are you from?' },
  // --- 4.2 Schule ---
  { id: 'c-morgen', gebiet: '4.2', satz: 'Good morning.',
    quelle: 'Hello. Good morning. Bye-bye.' },
  { id: 'c-wiegehts', gebiet: '4.2', satz: 'How are you?',
    quelle: 'How are you? I’m fine, thanks. And you? I’m (very) happy/sad/okay.' },
  { id: 'c-gutdanke', gebiet: '4.2', satz: "I'm fine, thanks.",
    quelle: 'How are you? I’m fine, thanks. And you? I’m (very) happy/sad/okay.' },
  { id: 'c-schule', gebiet: '4.2', satz: 'I go to school.',
    quelle: 'I like German/English/sports/… . I go to school at 7 o’clock.' },
  { id: 'c-buch', gebiet: '4.2', satz: 'Can I have a book, please?',
    quelle: 'Can I have a/your red/… book/…, please? Yes. Here you are.' },
  // --- 4.3 Freizeit und Feste ---
  { id: 'c-party', gebiet: '4.3', satz: 'Can you come to my party?',
    quelle: 'Can you come to my party? Yes. Thank you. / No. I’m sorry.' },
  { id: 'c-geburtstag', gebiet: '4.3', satz: 'Happy birthday!',
    quelle: 'Happy birthday! Merry Christmas!' },
  { id: 'c-weihnachten', gebiet: '4.3', satz: 'Merry Christmas!',
    quelle: 'Happy birthday! Merry Christmas!' },
  { id: 'c-wann', gebiet: '4.3', satz: 'When is your birthday?',
    quelle: 'When is your birthday? My birthday is … .' },
  { id: 'c-tennis', gebiet: '4.3', satz: 'I like tennis.',
    quelle: 'What’s your hobby? It‘s … . I play/like tennis/… . And you? What about you?' },
  // --- 4.4 Einkaufen ---
  { id: 'c-helfen', gebiet: '4.4', satz: 'Can I help you?',
    quelle: 'Can I help you? Yes, please. / No, thank you. I take/I’d like … to eat/drink.' },
  { id: 'c-bitte', gebiet: '4.4', satz: 'Yes, please.',
    quelle: 'Can I help you? Yes, please. / No, thank you. I take/I’d like … to eat/drink.' },
  { id: 'c-danke', gebiet: '4.4', satz: 'Thank you.',
    quelle: 'Thank you. You’re welcome.' },
  { id: 'c-hier', gebiet: '4.4', satz: 'Here you are.',
    quelle: 'Can I have …, please? Yes. Here you are.' },
  { id: 'c-kaufen', gebiet: '4.4', satz: 'Can I have tea, please?',
    quelle: 'Can I have …, please? Yes. Here you are.' },
];

/**
 * Der Vorrat der Ebene „Der Satz zum Selbersagen".
 *
 * WELCHES FELD DEN SATZ TRAEGT, und warum es drei sind - jedes davon liest
 * eine andere Stelle, und keine davon kann ich hier aendern:
 *
 *   `satzEn`  der Satz selbst, benannt wie bei `vorratHoersaetze()`. Wer
 *             beide Ebenen nebeneinander liest, soll nicht zwei Namen fuer
 *             dieselbe Sache lernen.
 *   `name`    was im Buch, im Vorlauf-Titel und im Lobsatz steht. Ohne ihn
 *             stuende dort `undefined`.
 *   `wort`    was ANGESAGT wird. `vorlaufAnsage` sagt bei einem Gegenstand
 *             mit `sorte` genau dieses Feld an, und die Kachel wird auf
 *             Englisch gestellt - das ist bei einem englischen Satz
 *             richtig. Deshalb traegt der Gegenstand auch `sorte`: ohne
 *             sie fiele er auf den Zweig `if (x.gebiet)` durch und die App
 *             saegte „Die Hauptstadt von 4.1 ist undefined."
 *
 * Alle drei kommen aus DEMSELBEN `c.satz` - es steht also nichts zweimal
 * da, was auseinanderlaufen koennte (Regel 6). Drei Leser derselben Zeile
 * sind keine drei Quellen.
 *
 * DAS GEBIET GEHT HIER MIT, anders als bei `vorratWendungen()` einen
 * Abschnitt weiter oben, wo es aus zwei guten Gruenden draussen bleibt.
 * Der Grund fuer die Ausnahme: E9 verspricht ein Abzeichen JE
 * THEMENGEBIET, und ein Gegenstand, der sein Gebiet nicht traegt, kann
 * keines verdienen. Der Preis ist genau der, den der Kommentar dort nennt
 * - `gebiet` heisst anderswo in dieser App das LAND einer Hauptstadt. Wer
 * die Spielebene baut, muss deshalb die Kachel ansehen: sie schreibt
 * `gebiet` als eigene Zeile unter den Aufkleber, und dort stuende „4.1".
 */
export function vorratChunks(){
  return CHUNKS.map(c => ({ id: `en:chunk:${c.id}`, name: c.satz, satzEn: c.satz,
    wort: c.satz, sorte: 'chunk', gebiet: c.gebiet }));
}
