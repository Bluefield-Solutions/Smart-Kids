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

/**
 * Drei Ablenker zu einem Gegenstand - aus derselben Sorte, gewuerfelt mit
 * dem Keim der Aufgabe.
 *
 * Der Wuerfel kommt von aussen, wie bei `Rechnen.ablenkerFuer`: dieselbe
 * Sitzung muss dieselbe Auswahl ergeben, sonst steht bei jedem Neuzeichnen
 * etwas anderes da.
 */
export function ablenkerFuer(ziel, wuerfel, wieviel = 3){
  const andere = vorratHoeren().filter(x => x.sorte === ziel.sorte && x.id !== ziel.id);
  for (let i = andere.length - 1; i > 0; i--) {
    const j = Math.floor(wuerfel() * (i + 1));
    [andere[i], andere[j]] = [andere[j], andere[i]];
  }
  return andere.slice(0, wieviel);
}
