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
