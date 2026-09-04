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
