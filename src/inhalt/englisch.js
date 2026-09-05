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
export const BILDER = [
  // --- Tiere ---
  { wort: 'cat',      gebiet: 'tiere', motiv: 'a cat sitting upright, seen from the side, tail curled around its paws' },
  { wort: 'chicken',  gebiet: 'tiere', motiv: 'a hen standing, seen from the side, with a comb and a rounded body' },
  { wort: 'dog',      gebiet: 'tiere', motiv: 'a dog sitting upright, seen from the side, with floppy ears' },
  { wort: 'fish',     gebiet: 'tiere', motiv: 'a single fish seen from the side, with a fan tail and one round eye' },
  { wort: 'hamster',  gebiet: 'tiere', motiv: 'a hamster sitting on its hind legs, seen from the side, holding a seed' },
  { wort: 'horse',    gebiet: 'tiere', motiv: 'a horse standing, seen from the side, with a mane and a tail' },
  { wort: 'mouse',    gebiet: 'tiere', motiv: 'a mouse seen from the side, with big round ears and a long thin tail' },
  { wort: 'pet',      gebiet: 'tiere', motiv: 'a child seen from the front holding a small cat in both arms' },
  { wort: 'rabbit',   gebiet: 'tiere', motiv: 'a rabbit sitting, seen from the side, with two long upright ears' },
  // --- Essen und Trinken ---
  { wort: 'apple',      gebiet: 'essen', motiv: 'one apple seen from the front, with a short stalk and one leaf' },
  { wort: 'bread',      gebiet: 'essen', motiv: 'a whole loaf of bread seen from the side, with a rounded top' },
  { wort: 'butter',     gebiet: 'essen', motiv: 'a rectangular block of butter on a small dish, seen from the side' },
  { wort: 'cheese',     gebiet: 'essen', motiv: 'a triangular wedge of cheese seen from the side, with three round holes' },
  { wort: 'chips',      gebiet: 'essen', motiv: 'a paper cone of chips (french fries) standing upright, seen from the front' },
  { wort: 'chocolate',  gebiet: 'essen', motiv: 'a bar of chocolate seen from above, divided into six squares, one corner broken off' },
  { wort: 'drink',      gebiet: 'essen', motiv: 'a tall glass with a bent drinking straw, seen from the side' },
  { wort: 'eat',        gebiet: 'essen', motiv: 'a round empty plate seen from above with a fork on its left and a knife on its right' },
  { wort: 'egg',        gebiet: 'essen', motiv: 'a boiled egg standing in an egg cup, seen from the side' },
  { wort: 'fruit',      gebiet: 'essen', motiv: 'a bowl seen from the side, filled with an apple, a pear and a bunch of grapes' },
  { wort: 'ham',        gebiet: 'essen', motiv: 'two overlapping oval slices of ham lying flat, seen from above' },
  { wort: 'plum',       gebiet: 'essen', motiv: 'one plum seen from the front, with a short stalk and one leaf, and a vertical groove' },
  { wort: 'salad',      gebiet: 'essen', motiv: 'a bowl seen from the side, heaped with leaves of lettuce' },
  { wort: 'strawberry', gebiet: 'essen', motiv: 'one strawberry seen from the front, pointing down, with a leafy crown and seed dots' },
  { wort: 'sweets',     gebiet: 'essen', motiv: 'three wrapped sweets with twisted ends, lying flat, seen from above' },
  { wort: 'tea',        gebiet: 'essen', motiv: 'a teacup on a saucer, seen from the side, with a teabag string over the rim' },
  { wort: 'tomato',     gebiet: 'essen', motiv: 'one tomato seen from the front, with a five-pointed star of leaves on top' },
  { wort: 'water',      gebiet: 'essen', motiv: 'a plain glass half filled with water, seen from the side' },
  // --- In der Schule ---
  { wort: 'board',            gebiet: 'schule', motiv: 'a classroom board on two legs, seen from the front, empty' },
  { wort: 'book',             gebiet: 'schule', motiv: 'an open book seen from the front, both pages blank' },
  { wort: 'chair',            gebiet: 'schule', motiv: 'a simple wooden chair with a straight back, seen from the side' },
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
  { wort: 'shirt',    gebiet: 'kleidung', motiv: 'a shirt with a collar and buttons lying flat, seen from the front' },
  { wort: 'shoes',    gebiet: 'kleidung', motiv: 'a pair of lace-up shoes standing side by side, seen from the side' },
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
