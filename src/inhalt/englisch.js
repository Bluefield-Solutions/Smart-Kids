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
  const andere = topf.filter(x => x.sorte === ziel.sorte && x.id !== ziel.id);
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
  { wort: 'chicken',  gebiet: 'tiere', motiv: 'a hen standing, seen from the side, with a comb and a rounded body' },
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
  { wort: 'hamster',  gebiet: 'tiere', motiv: 'a hamster sitting on its hind legs, seen from the side, holding a seed' },
  { wort: 'horse',    gebiet: 'tiere', motiv: 'a horse standing, seen from the side, with a mane and a tail' },
  { wort: 'mouse',    gebiet: 'tiere', motiv: 'a mouse seen from the side, with big round ears and a long thin tail' },
  { wort: 'pet',      gebiet: 'tiere', motiv: 'a child seen from the front holding a small cat in both arms' },
  { wort: 'rabbit',   gebiet: 'tiere', motiv: 'a rabbit sitting, seen from the side, with two long upright ears' },
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
  { wort: 'butter',     gebiet: 'essen', motiv: 'a rectangular block of butter on a small dish, seen from the side' },
  { wort: 'cheese',     gebiet: 'essen',
    bild: [
      { f:'gelb',       d:'M6 46 50 16c5 3 8 9 8 15v15Z' },
      { f:'gelbDunkel', d:'M6 46h52v6H6Z' },
      { f:'creme',      d:'M22 40a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm18-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'a triangular wedge of cheese seen from the side, with three round holes' },
  { wort: 'chips',      gebiet: 'essen', motiv: 'a paper cone of chips (french fries) standing upright, seen from the front' },
  { wort: 'chocolate',  gebiet: 'essen', motiv: 'a bar of chocolate seen from above, divided into six squares, one corner broken off' },
  { wort: 'drink',      gebiet: 'essen', motiv: 'a tall glass with a bent drinking straw, seen from the side' },
  { wort: 'eat',        gebiet: 'essen', motiv: 'a round empty plate seen from above with a fork on its left and a knife on its right' },
  { wort: 'egg',        gebiet: 'essen',
    bild: [
      { f:'wolke',      d:'M14 34c0-11 8-20 18-20 4 0 8 2 11 2 8 0 13 5 13 11 0 5-3 8-6 10 1 7-5 12-11 12-5 0-8-2-10-6-7 2-15-2-15-9Z' },
      { f:'gelb',       d:'M32 24a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },
      { f:'gelbDunkel', d:'M36 25c4 2 6 5 6 9 0 5-4 9-10 10 4-2 7-6 7-10 0-3-1-6-3-9Z' },
    ],
    motiv: 'a boiled egg standing in an egg cup, seen from the side' },
  { wort: 'fruit',      gebiet: 'essen', motiv: 'a bowl seen from the side, filled with an apple, a pear and a bunch of grapes' },
  { wort: 'ham',        gebiet: 'essen', motiv: 'two overlapping oval slices of ham lying flat, seen from above' },
  { wort: 'plum',       gebiet: 'essen', motiv: 'one plum seen from the front, with a short stalk and one leaf, and a vertical groove' },
  { wort: 'salad',      gebiet: 'essen', motiv: 'a bowl seen from the side, heaped with leaves of lettuce' },
  { wort: 'strawberry', gebiet: 'essen',
    bild: [
      { f:'gruen',      d:'M32 8c1 4 1 7 1 9h-2c0-2 0-5 1-9Z' },
      { f:'gruen',      d:'M32 20c-6-8-14-8-19-6 2 6 8 10 14 10h10c6 0 12-4 14-10-5-2-13-2-19 6Z' },
      { f:'rot',        d:'M32 24c9 0 17 5 17 12 0 9-9 20-17 24-8-4-17-15-17-24 0-7 8-12 17-12Z' },
      { f:'rotDunkel',  d:'M38 25c7 2 11 6 11 11 0 9-9 20-17 24 6-6 12-15 12-22 0-5-2-10-6-13Z' },
      { f:'gelb',       d:'M25 34a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm15 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },
    ],
    motiv: 'one strawberry seen from the front, pointing down, with a leafy crown and seed dots' },
  { wort: 'sweets',     gebiet: 'essen', motiv: 'three wrapped sweets with twisted ends, lying flat, seen from above' },
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
  { wort: 'class/classroom',  gebiet: 'schule', motiv: 'a classroom seen from the front: a board on the wall and two desks with chairs' },
  { wort: 'pen/pencil',       gebiet: 'schule', motiv: 'a pencil and a pen lying crossed over each other, seen from above' },
  { wort: 'picture',          gebiet: 'schule', motiv: 'a framed picture hanging on a wall, seen from the front, showing a mountain and a sun' },
  { wort: 'rubber',           gebiet: 'schule', motiv: 'a rectangular eraser seen at a slight angle, one corner worn round' },
  { wort: 'school/schoolbag', gebiet: 'schule', motiv: 'a school satchel with two buckles and shoulder straps, seen from the front' },
  { wort: 'teacher',          gebiet: 'schule', motiv: 'a grown-up standing beside a board, seen from the front, holding a pointer' },
  // --- Kleidung ---
  { wort: 'dress',    gebiet: 'kleidung', motiv: 'a dress on a coat hanger, seen from the front' },
  { wort: 'jeans',    gebiet: 'kleidung', motiv: 'a pair of jeans lying flat, seen from the front, with pockets and a belt loop' },
  { wort: 'pullover', gebiet: 'kleidung', motiv: 'a knitted pullover lying flat, seen from the front, arms spread' },
  { wort: 'shirt',    gebiet: 'kleidung',
    bild: [
      { f:'blau',       d:'M22 10h20l14 8-6 13-6-3v28H20V28l-6 3-6-13Z' },
      { f:'blauDunkel', d:'M42 10l14 8-6 13-6-3v28h-8V10Z' },
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
  { wort: 'boy',     gebiet: 'menschen', motiv: 'a boy standing, seen from the front, short hair, arms at his sides' },
  { wort: 'brother', gebiet: 'menschen', motiv: 'two boys standing side by side, seen from the front, one a head taller' },
  { wort: 'family',  gebiet: 'menschen', motiv: 'four people standing in a row, seen from the front: two grown-ups and two children' },
  { wort: 'father',  gebiet: 'menschen', motiv: 'a grown man standing, seen from the front, arms at his sides' },
  { wort: 'friend',  gebiet: 'menschen', motiv: 'two children standing side by side holding hands, seen from the front' },
  { wort: 'girl',    gebiet: 'menschen', motiv: 'a girl standing, seen from the front, long hair, arms at her sides' },
  { wort: 'mother',  gebiet: 'menschen', motiv: 'a grown woman standing, seen from the front, arms at her sides' },
  { wort: 'old',     gebiet: 'menschen', motiv: 'an old person standing bent forward, seen from the side, leaning on a walking stick' },
  { wort: 'sister',  gebiet: 'menschen', motiv: 'two girls standing side by side, seen from the front, one a head taller' },
  // --- Zuhause, Feste und Zeit ---
  { wort: 'house',           gebiet: 'zuhause', motiv: 'a small house seen from the front: a pitched roof, a door and two windows' },
  { wort: 'room',            gebiet: 'zuhause', motiv: 'a bedroom seen from the front: a bed, a window and a bedside lamp' },
  { wort: 'birthday',        gebiet: 'zuhause', motiv: 'a round birthday cake seen from the side with five burning candles' },
  { wort: 'Halloween',       gebiet: 'zuhause', motiv: 'a carved pumpkin lantern seen from the front, with triangular eyes and a grinning mouth' },
  { wort: 'Merry Christmas', gebiet: 'zuhause', motiv: 'a decorated fir tree seen from the front, with baubles and a star on top' },
  { wort: 'morning',         gebiet: 'zuhause', motiv: 'a sun rising over a straight horizon line, seen from the front, with rays' },
  { wort: 'o‘clock',         gebiet: 'zuhause', motiv: 'a round clock face seen from the front with two hands, no numerals, showing three o clock' },
  { wort: 'party',           gebiet: 'zuhause', motiv: 'three balloons on strings rising together, seen from the front' },
  { wort: 'weekend',         gebiet: 'zuhause', motiv: 'a calendar page seen from the front, a grid of blank squares, the last two squares of the bottom row filled in solid' },
  // --- Wo? Die Praepositionen. Immer DIESELBE Kiste und DERSELBE Ball. ---
  { wort: 'behind',      gebiet: 'wo', motiv: 'a closed box seen from the front with a ball behind it, only the upper half of the ball visible above the box' },
  { wort: 'in',          gebiet: 'wo', motiv: 'an open box seen from the front with a ball inside it, resting on the bottom of the box' },
  { wort: 'In front of', gebiet: 'wo', motiv: 'a closed box seen from the front with a ball in front of it, the ball overlapping the lower edge of the box' },
  { wort: 'next to',     gebiet: 'wo', motiv: 'a closed box seen from the front with a ball on the ground beside it, to the right, not touching' },
  { wort: 'on',          gebiet: 'wo', motiv: 'a closed box seen from the front with a ball resting on top of it' },
  { wort: 'under',       gebiet: 'wo', motiv: 'a table seen from the front with a ball on the floor underneath it' },
  // --- Gegensaetze und Gefuehle ---
  { wort: 'big',    gebiet: 'gegensaetze', motiv: 'two balls side by side, one very large and one very small; the large one is solid black, the small one is only an outline' },
  { wort: 'small',  gebiet: 'gegensaetze', motiv: 'two balls side by side, one very large and one very small; the small one is solid black, the large one is only an outline' },
  { wort: 'little', gebiet: 'gegensaetze', motiv: 'a grown cat and a kitten side by side, seen from the side; the kitten is solid black, the grown cat is only an outline' },
  { wort: 'cold',   gebiet: 'gegensaetze', motiv: 'a thermometer standing upright, seen from the front, its column low, with a snowflake beside it' },
  { wort: 'hot',    gebiet: 'gegensaetze', motiv: 'a thermometer standing upright, seen from the front, its column high, with a sun beside it' },
  { wort: 'happy',  gebiet: 'gegensaetze', motiv: 'a round face seen from the front with two dot eyes and a wide smiling mouth' },
  { wort: 'sad',    gebiet: 'gegensaetze', motiv: 'a round face seen from the front with two dot eyes and a downturned mouth' },
  { wort: 'good',   gebiet: 'gegensaetze', motiv: 'a hand making a thumbs-up sign, seen from the side' },
  // --- Spielen und Sport ---
  { wort: 'bike',     gebiet: 'sport', motiv: 'a bicycle seen from the side, both wheels, handlebars and saddle visible' },
  { wort: 'football', gebiet: 'sport', motiv: 'a football (soccer ball) seen from the front, with its pentagon pattern' },
  { wort: 'go',       gebiet: 'sport', motiv: 'a person walking to the right, seen from the side, one leg forward, arms swinging' },
  { wort: 'play',     gebiet: 'sport', motiv: 'a child seen from the front kicking a ball that lies on the ground' },
  { wort: 'ride',     gebiet: 'sport', motiv: 'a child riding a bicycle to the right, seen from the side' },
  { wort: 'sports',   gebiet: 'sport', motiv: 'a football, a tennis racket and a swimming goggle arranged together, seen from the front' },
  { wort: 'swim',     gebiet: 'sport', motiv: 'a person swimming front crawl, seen from the side, one arm out of the water, wavy water lines' },
  { wort: 'tennis',   gebiet: 'sport', motiv: 'a tennis racket lying at an angle with a tennis ball beside it, seen from above' },
  // --- Laender und Uebriges ---
  { wort: 'bye',              gebiet: 'rest', motiv: 'a raised open hand waving goodbye, seen from the front, with two small motion arcs' },
  { wort: 'colour',           gebiet: 'rest', motiv: 'a painter palette held from below with a brush, seen from above, six round blobs of paint on it' },
  { wort: 'England/English',  gebiet: 'rest', motiv: 'a rectangular flag on a pole, seen from the side, bearing a plain upright cross that reaches all four edges' },
  { wort: 'Germany/German',   gebiet: 'rest', motiv: 'a rectangular flag on a pole, seen from the side, divided into three equal horizontal bands, the top one solid black and the other two only outlined' },
  { wort: 'give',             gebiet: 'rest', motiv: 'a hand seen from the side holding out a small wrapped present with a ribbon' },
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
  return FREUNDE.map(f => ({ id: `en:freund:${f.id}`, name: f.richtig[0],
    satz: f.satz, luecke: f.luecke, richtig: f.richtig, falle: f.falle,
    warum: f.warum }));
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
