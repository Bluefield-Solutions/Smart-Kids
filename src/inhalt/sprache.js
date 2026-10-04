/**
 * SPRACHE UNTERSUCHEN — die zweite Haelfte der Deutsch-Welt (E29).
 *
 * Der LehrplanPLUS fuehrt fuer die dritte Jahrgangsstufe im Lernbereich
 * „Sprache untersuchen" vier Dinge: Wortarten, Zeitformen, Satzarten
 * und Satzglieder. Hier stehen sie als Daten.
 *
 * WOHER DER STOFF KOMMT - und das ist der Unterschied zu den beiden
 * Rechtschreibabteilungen:
 *
 *   Wortarten   aus den 600 Lernwoertern, die schon dastehen. Jedes
 *               bekommt seine Wortart; die Ebene ist dann eine Auswahl.
 *   Zeitformen  aus den PAAREN, die die amtliche Liste selbst fuehrt
 *               („essen - aßen"), plus der Hilfsverbtafel fuer die
 *               Zukunft.
 *   Satzarten   aus EIGENEN Saetzen. Und das ist eine Abweichung von
 *   Satzglieder der Zusage „dieselben Saetze tragen beide Abteilungen",
 *               die im Konzept steht. Sie ist gemessen und nicht
 *               bequem: von den 1244 vorhandenen Saetzen sind 1136
 *               Aussagesaetze, 100 Fragen und ACHT Ausrufe. Eine Ebene,
 *               die aus acht Ausrufen zieht, fragt achtmal dasselbe.
 *               Und Satzglieder brauchen eine Auszeichnung, die kein
 *               Satz mitbringt - wer sie nachtraeglich errechnen will,
 *               rechnet eine Grammatik nach, die er nicht hat.
 *
 * Die Zusage gilt also fuer die beiden Ebenengruppen, bei denen sie
 * einzuhalten war, und fuer die beiden anderen steht hier, warum nicht.
 */
import { EINHEITEN, saetzeZu } from './deutsch.js';
import { EINHEITEN12, saetzeZu12 } from './deutsch12.js';

/**
 * DIE BEGRIFFE - zweimal dasselbe, und das ist hier kein Verstoss
 * gegen Regel 6, sondern der Gegenstand.
 *
 * Der Lehrplan sagt Nomen, Verb, Adjektiv. Viele bayerische dritte
 * Klassen sagen noch Namenwort, Tunwort, Wiewort. Welches Leas Klasse
 * benutzt, weiss niemand von uns sicher - also schaltet ein Regler im
 * Elternbereich die Beschriftung um, statt dass ich rate. Standard sind
 * die Fachbegriffe, weil die bis zum Abitur gelten.
 *
 * EINE Tafel und nicht zwei Listen nebeneinander: der Regler waehlt die
 * Spalte, nicht die Liste.
 */
export const BEGRIFFE = {
  nomen:     { fach:'Nomen',     kind:'Namenwort',
               hilfe:'Davor passt der, die oder das.' },
  verb:      { fach:'Verb',      kind:'Tunwort',
               hilfe:'Es sagt, was jemand tut.' },
  adjektiv:  { fach:'Adjektiv',  kind:'Wiewort',
               hilfe:'Es sagt, WIE etwas ist.' },
  artikel:   { fach:'Artikel',   kind:'Begleiter',
               hilfe:'Es steht vor einem Namenwort.' },
  pronomen:  { fach:'Pronomen',  kind:'Fürwort',
               hilfe:'Es steht STATT eines Namenworts.' },
  gegenwart: { fach:'Gegenwart', kind:'Gegenwart',
               hilfe:'Es passiert jetzt.' },
  vergangenheit: { fach:'Vergangenheit', kind:'Vergangenheit',
               hilfe:'Es ist schon passiert.' },
  zukunft:   { fach:'Zukunft',   kind:'Zukunft',
               hilfe:'Es passiert erst noch.' },
  aussage:   { fach:'Aussagesatz', kind:'Aussagesatz',
               hilfe:'Er sagt etwas und endet mit einem Punkt.' },
  frage:     { fach:'Fragesatz',   kind:'Fragesatz',
               hilfe:'Er fragt etwas und endet mit einem Fragezeichen.' },
  ausruf:    { fach:'Ausrufesatz', kind:'Ausrufesatz',
               hilfe:'Er ruft oder fordert und endet mit einem Ausrufezeichen.' },
  subjekt:   { fach:'Subjekt',   kind:'Satzgegenstand',
               hilfe:'Wer oder was tut etwas?' },
  praedikat: { fach:'Prädikat',  kind:'Satzaussage',
               hilfe:'Was wird getan?' },
  objekt:    { fach:'Objekt',    kind:'Ergänzung',
               hilfe:'Wen oder was betrifft es?' },
};

/** Das Wort fuer einen Begriff, je nachdem wie die Klasse spricht. */
export const begriff = (id, kindlich = false) =>
  (BEGRIFFE[id] || {})[kindlich ? 'kind' : 'fach'] || id;

/* ---------------------------------------------------------------------
 * DIE WORTARTEN
 *
 * Grossgeschrieben ist ein NOMEN - im Deutschen gibt es dazu keine
 * Ausnahme, und im Grundwortschatz schon gar nicht. Das sind 224 der
 * 600 Lerneinheiten, und sie stehen deshalb NICHT als Liste hier: eine
 * abgeschriebene Liste von 224 Woertern waere die, die beim naechsten
 * Wort veraltet (Regel 6).
 *
 * Fuer die VERBEN gilt dasselbe eine Stufe weiter: ein kleingeschriebenes
 * Wort auf -en, -ln oder -rn ist ein Infinitiv, und die zweite Form
 * eines Paares, dessen erste ein Infinitiv ist, ist eine gebeugte Form
 * desselben Verbs. Das faengt 174 von 179; die fuenf, die es nicht
 * faengt, stehen darunter mit Namen.
 *
 * Nur was sich NICHT ableiten laesst, steht als Liste da. Das sind die
 * Adjektive, die Artikel und die Pronomen - zusammen 110 Woerter.
 * ------------------------------------------------------------------- */

/* Die fuenf, die die Ableitung nicht faengt: Formen von „sein" und das
   eine Verb auf -un. */
const VERB_DAZU = ['bin', 'bist', 'ist', 'sind', 'tun'];

const ADJEKTIVE = [
  'alt', 'älter', 'blau', 'böse', 'braun', 'bunt', 'dick', 'dumm', 'dunkel',
  'eng', 'fein', 'fremd', 'fremder', 'frisch', 'ganz', 'ganzem', 'ganzen',
  'gelb', 'gelbe', 'gesund',
  'gesunde', 'glücklich', 'groß', 'grün', 'gut', 'hoch', 'klein', 'krank',
  'kurz', 'lang', 'länger', 'laut', 'leicht', 'leise', 'neu', 'plötzlich',
  'reich', 'rot', 'rund', 'runder', 'schlecht', 'schlimm', 'schnell', 'schön',
  'schwarz', 'schwer', 'schwierig', 'stark', 'stärker', 'tief', 'tiefer',
  'verwandt', 'voll', 'wahr', 'weit'];

/* NEUN Artikel, und mehr gibt es im Grundwortschatz nicht. Das ist kein
   duenner Vorrat, sondern die Sprache: „der, die, das" und ihre Faelle
   sind alles, was es gibt. `vielfalt` kennt diese Ebene deshalb als
   WELT und nicht als Liste, die wachsen koennte. */
const ARTIKEL = ['der', 'die', 'das', 'des', 'dem', 'den', 'ein', 'einem', 'einen'];

/* „sein", „ihr" und „mein" sind hier das besitzanzeigende Fuerwort und
   nicht der Infinitiv von „sein" - sie kommen aus der Ebene „Kleine
   Wörter im Satz", und dort steht die Reihe „mein - meinem - meinen".
   Die Zweideutigkeit ist echt und wird nicht weggeschwiegen: die Ebene
   fragt das Wort IM SATZ, und dort ist sie aufgeloest. */
const PRONOMEN = [
  'dein', 'deinem', 'deinen', 'dich', 'dies', 'diesem', 'diesen', 'dir', 'du',
  'er', 'es', 'euer', 'eurem', 'euren', 'ich', 'ihm', 'ihn', 'ihnen', 'ihr',
  'ihre', 'ihrem', 'ihren', 'jede', 'jedem', 'jeden', 'kein', 'keinem',
  'keinen', 'man', 'mein', 'meinem', 'meinen', 'mich', 'mir', 'sein',
  'seinem', 'seinen', 'sie', 'uns', 'unserem', 'unseren', 'was', 'welche',
  'welchem', 'welchen', 'wem', 'wen', 'wer', 'wir'];

/** Alle Lerneinheiten beider Rechtschreibabteilungen, einmal gebuendelt. */
export const ALLE_WOERTER = [...EINHEITEN, ...EINHEITEN12];

const klein = (w) => !/^[A-ZÄÖÜ]/.test(w);
const istInfinitiv = (w) => klein(w) && /(en|ln|rn)$/.test(w);

/* Die gebeugten Formen: die zweite Form eines Paares, dessen erste ein
   Infinitiv ist. „essen - aßen" gibt „aßen", „Hund - Hunde" gibt
   nichts. */
const GEBEUGT = new Set();
for (const e of ALLE_WOERTER)
  if (e.paar && istInfinitiv(e.paar[0])) for (const f of e.paar) GEBEUGT.add(f);

/**
 * Die Wortart eines Wortes — abgeleitet, wo es geht, und nachgeschlagen,
 * wo nicht. `null` heisst: keine der fuenf, die der Lehrplan fuer die
 * dritte Klasse nennt (Praeposition, Konjunktion, Adverb, Zahlwort).
 * Solche Woerter kommen in den Wortart-Ebenen nicht vor - eine Frage,
 * deren richtige Antwort nicht zur Wahl steht, ist keine Frage.
 */
export function wortartVon(wort){
  if (!klein(wort)) return 'nomen';
  if (ARTIKEL.includes(wort)) return 'artikel';
  if (PRONOMEN.includes(wort)) return 'pronomen';
  if (ADJEKTIVE.includes(wort)) return 'adjektiv';
  if (istInfinitiv(wort) || GEBEUGT.has(wort) || VERB_DAZU.includes(wort)) return 'verb';
  return null;
}

/** Die fuenf Wortarten, in der Reihenfolge, in der sie gelehrt werden. */
export const WORTARTEN = ['nomen', 'verb', 'adjektiv', 'artikel', 'pronomen'];

/** Die Woerter einer Wortart - mit dem Satz, in dem sie schon stehen. */
export const woerterMit = (art) =>
  ALLE_WOERTER.filter(e => wortartVon(e.wort) === art);

/* Der Satz, in dem das Wort schon steht - erst in 3/4 nachsehen, dann
   in 1/2. Ein Wort gehoert immer nur einer der beiden Abteilungen; die
   Reihenfolge entscheidet also nichts, sie spart nur einen Zweig. */
const satzVon = (wort) => (saetzeZu(wort)[0] || saetzeZu12(wort)[0] || null);

/* ---------------------------------------------------------------------
 * DIE ZEITFORMEN
 *
 * Die amtliche Liste 3/4 fuehrt achtundzwanzig Paare aus Grundform und
 * Praeteritum („essen - aßen"). Genau daraus bestehen die drei Ebenen,
 * und zwar in beide Richtungen:
 *
 *   Vergangenheit  „essen - gestern: wir ___"   -> aßen
 *   Gegenwart      „aßen - heute: wir ___"      -> essen
 *   Zukunft        „essen - morgen: ich ___ essen" -> werde
 *
 * „wir" ist kein Zufall: im Plural ist die Gegenwartsform dieselbe wie
 * die Grundform, und damit steht die Antwort in der Liste statt in
 * einer Beugungstabelle, die ich mir ausdenken muesste.
 *
 * Die ZUKUNFT wechselt dagegen die Person, denn sonst hiesse die
 * Antwort achtundzwanzigmal „werden". Sechs Personen, sechs Formen -
 * und das ist genau die Tafel, die ein Kind der dritten Klasse lernt.
 * ------------------------------------------------------------------- */

export const WERDEN = {
  ich: 'werde', du: 'wirst', er: 'wird',
  wir: 'werden', ihr: 'werdet', sie: 'werden',
};
const PERSONEN = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];

/** Die Paare, aus denen die drei Zeitebenen ziehen. */
export const ZEITPAARE = [];
for (const e of EINHEITEN) {
  if (e.gruppe !== 'praeteritum' || !e.paar) continue;
  /* Die Liste fuehrt bei „lesen" drei Formen („lesen - liest - lasen").
     Gebraucht werden die ERSTE (Grundform) und die LETZTE
     (Vergangenheit); die Mittlere ist die dritte Person Gegenwart und
     gehoert zur Rechtschreibung, nicht hierher. */
  const grund = e.paar[0], frueher = e.paar[e.paar.length - 1];
  if (grund === frueher) continue;
  if (ZEITPAARE.some(z => z.grund === grund)) continue;
  ZEITPAARE.push({ grund, frueher });
}

/** Die drei Zeitebenen - je eine Aufgabe je Paar. */
export const ZEITFORMEN = ['gegenwart', 'vergangenheit', 'zukunft'];

/* Die Begruendung je Zeit - sie steht bei jeder Antwort da, richtig wie
   falsch, genau wie die Rechtschreibregel beim Diktat. Sie sagt, WORAN
   man die Zeit erkennt, und nicht, wie die Form heisst: „gestern heisst
   Vergangenheit" hilft beim naechsten Verb, „schienen" nicht. */
const ZEITREGEL = {
  gegenwart: 'Heute heißt Gegenwart. Bei „wir" klingt sie wie die Grundform.',
  vergangenheit: 'Gestern heißt Vergangenheit. Dafür ändert sich der Wortstamm.',
  zukunft: 'Morgen heißt Zukunft: werden und die Grundform.',
};

/**
 * Eine Zeitaufgabe. `vorgabe` steht als Satz da, `loesung` wird getippt
 * oder gewaehlt.
 */
export function zeitAufgaben(zeit){
  return ZEITPAARE.map((z, i) => {
    if (zeit === 'vergangenheit')
      return { id:`zeit:vergangenheit:${z.grund}`, wort:z.frueher,
               vorgabe:`${z.grund} — gestern: wir %.`, hinweis:z.grund };
    if (zeit === 'gegenwart')
      return { id:`zeit:gegenwart:${z.grund}`, wort:z.grund,
               vorgabe:`${z.frueher} — heute: wir %.`, hinweis:z.frueher };
    const person = PERSONEN[i % PERSONEN.length];
    return { id:`zeit:zukunft:${z.grund}`, wort:WERDEN[person],
             vorgabe:`${z.grund} — morgen: ${person} % ${z.grund}.`,
             hinweis:person };
  });
}

/* ---------------------------------------------------------------------
 * DIE SATZARTEN
 *
 * EIGENE Saetze, und der Grund steht im Kopf dieser Datei: von den 1244
 * vorhandenen sind 1136 Aussagesaetze, 100 Fragen und ACHT Ausrufe. Zehn
 * je Art sind hier das Mindeste, damit die Ebene zwei Runden traegt.
 *
 * DAS SATZZEICHEN FEHLT, und das ist die ganze Aufgabe. Stuende es da,
 * waere die Frage „welche Satzart?" dieselbe wie „welches Zeichen steht
 * am Ende?" - und die beantwortet man, ohne den Satz gelesen zu haben.
 * So muss man ihn lesen. Das Zeichen kommt hinterher, in der Aufloesung.
 * ------------------------------------------------------------------- */

export const SATZARTEN = ['aussage', 'frage', 'ausruf'];

export const SATZARTSAETZE = [
  { satz:'Im Garten blüht der Apfelbaum', art:'aussage' },
  { satz:'Meine Schwester spielt gern Klavier', art:'aussage' },
  { satz:'Der Hund schläft unter dem Tisch', art:'aussage' },
  { satz:'Wir fahren morgen ans Meer', art:'aussage' },
  { satz:'Das Brot ist noch ganz frisch', art:'aussage' },
  { satz:'Auf der Wiese stehen zwei Pferde', art:'aussage' },
  { satz:'Mein Bruder lernt für die Probe', art:'aussage' },
  { satz:'Die Sonne scheint den ganzen Tag', art:'aussage' },
  { satz:'Im Winter liegt hier oft Schnee', art:'aussage' },
  { satz:'Unsere Klasse fährt ins Museum', art:'aussage' },

  { satz:'Wann kommst du nach Hause', art:'frage' },
  { satz:'Hast du deine Hausaufgaben schon gemacht', art:'frage' },
  { satz:'Wo liegt mein blauer Füller', art:'frage' },
  { satz:'Wer hat das Fenster aufgemacht', art:'frage' },
  { satz:'Willst du noch ein Stück Kuchen', art:'frage' },
  { satz:'Warum weint das kleine Mädchen', art:'frage' },
  { satz:'Wie viele Kinder sind heute da', art:'frage' },
  { satz:'Gehen wir nach dem Essen spazieren', art:'frage' },
  { satz:'Kennst du den Jungen von nebenan', art:'frage' },
  { satz:'Was möchtest du zum Geburtstag', art:'frage' },

  { satz:'Komm sofort herein', art:'ausruf' },
  { satz:'Pass auf den Hund auf', art:'ausruf' },
  { satz:'Wie schön das hier ist', art:'ausruf' },
  { satz:'Mach bitte das Fenster zu', art:'ausruf' },
  { satz:'Das ist ja toll', art:'ausruf' },
  { satz:'Räum endlich dein Zimmer auf', art:'ausruf' },
  { satz:'Lauf nicht so schnell', art:'ausruf' },
  { satz:'Was für ein schöner Tag', art:'ausruf' },
  { satz:'Hör mir bitte einmal zu', art:'ausruf' },
  { satz:'Gib mir sofort mein Heft zurück', art:'ausruf' },
];

/** Das Zeichen, das am Ende steht - fuer die Aufloesung. */
export const SATZZEICHEN = { aussage:'.', frage:'?', ausruf:'!' };

/* ---------------------------------------------------------------------
 * DIE SATZGLIEDER
 *
 * Auch hier eigene Saetze, und hier ist der Grund noch deutlicher: ein
 * vorhandener Satz bringt keine Auszeichnung mit, wer Subjekt und
 * Praedikat nachtraeglich errechnen will, rechnet eine Grammatik nach,
 * die er nicht hat. Dreissig Saetze, jeder mit allen dreien - das sind
 * neunzig Aufgaben.
 *
 * Gefragt wird nach dem MARKIERTEN Wort und nicht nach dem Satzglied
 * („Wo ist das Subjekt?"): so steht die Frage an EINER Stelle, und die
 * Antwort ist eine von dreien statt eines Griffs ins Ungefaehre.
 * ------------------------------------------------------------------- */

export const SATZGLIEDER = ['subjekt', 'praedikat', 'objekt'];

export const GLIEDSAETZE = [
  { satz:'Der Hund frisst den Knochen', subjekt:'Der Hund', praedikat:'frisst', objekt:'den Knochen' },
  { satz:'Meine Schwester liest ein Buch', subjekt:'Meine Schwester', praedikat:'liest', objekt:'ein Buch' },
  { satz:'Der Gärtner pflanzt einen Baum', subjekt:'Der Gärtner', praedikat:'pflanzt', objekt:'einen Baum' },
  { satz:'Die Kinder essen ihr Frühstück', subjekt:'Die Kinder', praedikat:'essen', objekt:'ihr Frühstück' },
  { satz:'Mein Vater kocht die Suppe', subjekt:'Mein Vater', praedikat:'kocht', objekt:'die Suppe' },
  { satz:'Die Lehrerin erklärt die Aufgabe', subjekt:'Die Lehrerin', praedikat:'erklärt', objekt:'die Aufgabe' },
  { satz:'Der Junge wirft den Ball', subjekt:'Der Junge', praedikat:'wirft', objekt:'den Ball' },
  { satz:'Meine Oma backt einen Kuchen', subjekt:'Meine Oma', praedikat:'backt', objekt:'einen Kuchen' },
  { satz:'Das Pferd zieht den Wagen', subjekt:'Das Pferd', praedikat:'zieht', objekt:'den Wagen' },
  { satz:'Die Katze fängt eine Maus', subjekt:'Die Katze', praedikat:'fängt', objekt:'eine Maus' },
  { satz:'Mein Onkel repariert das Fahrrad', subjekt:'Mein Onkel', praedikat:'repariert', objekt:'das Fahrrad' },
  { satz:'Die Biene sucht den Nektar', subjekt:'Die Biene', praedikat:'sucht', objekt:'den Nektar' },
  { satz:'Der Bauer füttert die Hühner', subjekt:'Der Bauer', praedikat:'füttert', objekt:'die Hühner' },
  { satz:'Meine Freundin malt ein Bild', subjekt:'Meine Freundin', praedikat:'malt', objekt:'ein Bild' },
  { satz:'Der Wind bewegt die Blätter', subjekt:'Der Wind', praedikat:'bewegt', objekt:'die Blätter' },
  { satz:'Das Kind streichelt den Hasen', subjekt:'Das Kind', praedikat:'streichelt', objekt:'den Hasen' },
  { satz:'Die Klasse schreibt eine Probe', subjekt:'Die Klasse', praedikat:'schreibt', objekt:'eine Probe' },
  { satz:'Mein Bruder putzt die Zähne', subjekt:'Mein Bruder', praedikat:'putzt', objekt:'die Zähne' },
  { satz:'Der Vogel baut ein Nest', subjekt:'Der Vogel', praedikat:'baut', objekt:'ein Nest' },
  { satz:'Die Sonne wärmt den Boden', subjekt:'Die Sonne', praedikat:'wärmt', objekt:'den Boden' },
  { satz:'Mein Opa liest die Zeitung', subjekt:'Mein Opa', praedikat:'liest', objekt:'die Zeitung' },
  { satz:'Das Mädchen öffnet die Tür', subjekt:'Das Mädchen', praedikat:'öffnet', objekt:'die Tür' },
  { satz:'Der Hase frisst das Gras', subjekt:'Der Hase', praedikat:'frisst', objekt:'das Gras' },
  { satz:'Meine Mutter sucht den Schlüssel', subjekt:'Meine Mutter', praedikat:'sucht', objekt:'den Schlüssel' },
  { satz:'Die Ente schwimmt den Fluss hinab', subjekt:'Die Ente', praedikat:'schwimmt', objekt:'den Fluss' },
  { satz:'Der Schüler hebt die Hand', subjekt:'Der Schüler', praedikat:'hebt', objekt:'die Hand' },
  { satz:'Das Eichhörnchen sammelt die Nüsse', subjekt:'Das Eichhörnchen', praedikat:'sammelt', objekt:'die Nüsse' },
  { satz:'Meine Tante gießt die Blumen', subjekt:'Meine Tante', praedikat:'gießt', objekt:'die Blumen' },
  { satz:'Der Fisch sucht einen Platz', subjekt:'Der Fisch', praedikat:'sucht', objekt:'einen Platz' },
  { satz:'Die Großeltern besuchen das Museum', subjekt:'Die Großeltern', praedikat:'besuchen', objekt:'das Museum' },
];

/** Alle Aufgaben zu den Satzgliedern: je Satz drei, eine je Glied.
 *
 * Gekuerzt werden die SAETZE und nicht die Aufgaben: wer jede dritte
 * Aufgabe wegnimmt, nimmt manchem Satz sein Objekt und manchem sein
 * Subjekt - und dann steht „Subjekt" oefter zur Wahl als „Objekt". Wer
 * bei ungleicher Verteilung immer dasselbe tippt, hat recht, ohne etwas
 * zu wissen; genau dagegen stehen die zehn Saetze je Satzart. */
export const gliedAufgaben = () => tiefer(
  /* Die Nummer kommt aus der VOLLEN Liste und nicht aus der gekuerzten.
     Sonst haette derselbe Satz je nach Tiefe eine andere Kennung - und
     eine Kennung, die sich aendert, ist ein neuer Gegenstand: Leas
     Leitner-Stand zu „Der Hund frisst den Knochen" waere beim naechsten
     Verstellen der Tiefe lautlos weg. */
  GLIEDSAETZE.map((s, nr) => ({ ...s, nr })),
  Math.floor(TIEFE / SATZGLIEDER.length)
).flatMap(s => SATZGLIEDER.map(g =>
  ({ id:`glied:${g}:${s.nr}`, satz:s.satz, teil:s[g], glied:g })));

/** Alle Aufgaben zu den Satzarten. */
export const satzartAufgaben = () => SATZARTSAETZE.map((s, i) =>
  ({ id:`satzart:${i}`, satz:s.satz, art:s.art }));

/* ---------------------------------------------------------------------
 * DIE ZEHN EBENEN, als EINE Liste - damit `spiel.js`, das Tor und die
 * Doku dieselbe Quelle haben.
 *
 * `wahl` ist die Zahl der Knoepfe auf dem Bildschirm. Fuenf Wortarten
 * sind fuenf Knoepfe; bei drei Satzarten waeren fuenf drei leere.
 * ------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
 * WIE TIEF EINE SPRACHEBENE GESPIELT WIRD (E31)
 *
 * E29 hat jede Wortartebene aus ALLEN passenden Lernwoertern gebaut.
 * Gemessen heisst das: „Nomen" hat 224 Aufgaben, „Verb" 182 - und die
 * neununddreissig Ebenen, deren Groesse aus der AMTLICHEN LISTE kommt,
 * liegen zwischen 2 und 56. Die groesste von ihnen ist „Kleine Wörter im
 * Satz" mit 56. Meine Zahlen sind das Vierfache davon, und sie sind
 * meine: der Lehrplan nennt fuer „Sprache untersuchen" Lernbereiche und
 * keine Mengen (Regel 3 - das Soll kommt aus der Referenz, nicht aus
 * mir).
 *
 * WAS DIE ZAHL ANRICHTET, und das ist kein Geschmack:
 *
 *   Ein Gegenstand braucht ZWEI richtige Antworten bis Fach 3 - dort
 *   gibt es den Aufkleber. Leas Sitzung hat acht Aufgaben. Bei 224
 *   Gegenstaenden kommt jeder also rund alle achtundzwanzig Sitzungen
 *   dran, und die Ebene waere nach SECHSUNDFUENFZIG Sitzungen voll.
 *   Mal fuenf Wortarten: zweihundertachtzig. „Wörter mit tz" ist nach
 *   EINER fertig.
 *
 *   Und der Ring auf der Kachel zeigt das an. Ein Fortschrittsbalken,
 *   der sich in einem halben Jahr nicht sichtbar bewegt, ist kein
 *   Fortschrittsbalken.
 *
 * WARUM DAS BEI DER RECHTSCHREIBUNG RICHTIG IST UND HIER NICHT:
 * dort IST jedes Wort der Gegenstand - dass „Abend" mit d geschrieben
 * wird, muss man je Wort wissen. Hier ist der Gegenstand die FAEHIGKEIT,
 * ein Nomen zu erkennen. Wer das an fuenfzig Nomen kann, kann es; die
 * anderen 174 beweisen nichts mehr.
 *
 * DIE GRENZE IST GERECHNET UND NICHT GESETZT. Sie ist die groesste
 * Ebene, die eine amtliche Liste hergibt - waechst die Liste, waechst
 * sie mit. Eine Zahl, die hier als `56` stuende, waere die, die beim
 * naechsten Grundwortschatz veraltet (Regel 6).
 *
 * Geworfen wird nichts weg: die Daten halten weiter alle 224, gespielt
 * wird bis zur Tiefe. Dieselbe Unterscheidung wie bei `laenderTiefe`.
 * ------------------------------------------------------------------- */
const groessteEbene = (einheiten) => {
  const je = {};
  for (const e of einheiten) je[e.gruppe] = (je[e.gruppe] || 0) + 1;
  return Math.max(...Object.values(je));
};
export const TIEFE = Math.max(groessteEbene(EINHEITEN), groessteEbene(EINHEITEN12));

/* GLEICHMAESSIG GEGRIFFEN und nicht vorne abgeschnitten: die Wortlisten
   stehen alphabetisch, und die ersten fuenfzig Nomen waeren alle mit A
   bis D. Derselbe Griff, mit dem der Vorlauf seine Beispiele waehlt. */
export function tiefer(liste, n = TIEFE) {
  if (liste.length <= n) return liste;
  const schritt = liste.length / n;
  return Array.from({ length: n }, (_, i) => liste[Math.floor(i * schritt)]);
}

export const EBENEN_SPRACHE = [
  { id:'nomen',        art:'wortart', titel:'Nomen',        begriff:'nomen' },
  { id:'verb',         art:'wortart', titel:'Verb',         begriff:'verb' },
  { id:'adjektiv',     art:'wortart', titel:'Adjektiv',     begriff:'adjektiv' },
  { id:'artikel',      art:'wortart', titel:'Artikel',      begriff:'artikel' },
  { id:'pronomen',     art:'wortart', titel:'Pronomen',     begriff:'pronomen' },
  { id:'gegenwart',    art:'zeit',    titel:'Gegenwart',    begriff:'gegenwart' },
  { id:'vergangenheit',art:'zeit',    titel:'Vergangenheit',begriff:'vergangenheit' },
  { id:'zukunft',      art:'zeit',    titel:'Zukunft',      begriff:'zukunft' },
  { id:'satzarten',    art:'satzart', titel:'Satzarten',    begriff:'frage' },
  { id:'satzglieder',  art:'glied',   titel:'Satzglieder',  begriff:'subjekt' },
];

export const ebeneSprache = (id) => EBENEN_SPRACHE.find(e => e.id === id);

/**
 * DIE AUFGABEN EINER EBENE.
 *
 * Die Wortartebenen ziehen aus den 600 Lernwoertern und nehmen den
 * SATZ mit, in dem das Wort schon steht - das ist die Zusage aus dem
 * Konzept („dieselben Saetze tragen beide Abteilungen"), und sie ist
 * hier wirklich eingeloest: kein zweiter Satz, kein zweites Wort.
 *
 * GEFRAGT WIRD IMMER NACH DEM MARKIERTEN - nicht „wo ist das Nomen?".
 * Eine Ebene „Nomen" zeigt also auch Verben und Artikel, und das ist
 * Absicht: wer nur Nomen sieht, lernt „immer Nomen antippen". Die
 * Ebene heisst nach dem, WORAN sie uebt, nicht nach der Antwort.
 */
export function aufgabenZu(ebeneId){
  const e = ebeneSprache(ebeneId);
  if (!e) return [];
  if (e.art === 'wortart') {
    /* Je Aufgabe ein Wort DIESER Wortart und drei aus anderen - sonst
       hiesse die Antwort achtmal dasselbe. Gemischt wird in `spiel.js`
       mit dem Sitzungskeim; hier steht nur, was zur Wahl steht. */
    /* Gekuerzt wird die WOERTERLISTE und nicht die fertige Aufgabenliste:
       so steht fest, wieviele Aufgaben herauskommen, auch wenn zu einem
       Wort kein Satz existiert. Andersherum waere die Tiefe eine
       Obergrenze und keine Zahl. */
    return tiefer(woerterMit(e.id).filter(x => satzVon(x.wort)))
      .map(x => ({ e:x, s:satzVon(x.wort) }))
      .map(({ e: x, s }) => {
        /* Die Stelle kommt aus der LUECKE und nicht aus einer Suche im
           Satz: „Mein kleiner Finger tut weh" enthaelt „ein" zweimal,
           und markiert gehoert das Wort an seinem Platz, nicht das
           erste, das so aussieht. */
        const [vor, nach] = s.split('%');
        return { id:`sprache:${e.id}:${x.id}`, vor, teil:x.wort, nach,
          satz:s.replace('%', x.wort), loesung:e.id, wahl:WORTARTEN,
          frage:'Was für ein Wort ist das markierte?' };
      });
  }
  if (e.art === 'satzart')
    return satzartAufgaben().map(a => ({
      id:`sprache:${a.id}`, satz:a.satz, vor:a.satz, teil:null, nach:'',
      loesung:a.art, wahl:SATZARTEN, zeichen:SATZZEICHEN[a.art],
      frage:'Was für ein Satz ist das?' }));
  if (e.art === 'glied')
    return gliedAufgaben().map(a => {
      const i = a.satz.indexOf(a.teil);
      return { id:`sprache:${a.id}`, satz:a.satz,
        vor:a.satz.slice(0, i), teil:a.teil, nach:a.satz.slice(i + a.teil.length),
        loesung:a.glied, wahl:SATZGLIEDER,
        frage:'Was ist der markierte Teil?' };
    });
  /* Die drei Zeitebenen sind KEINE Auswahl, sondern ein Lueckensatz -
     sie laufen auf dem Diktatbildschirm. Die falschen Schreibweisen
     sind hier keine Verschreiber, sondern die ANDEREN Zeitformen: wer
     „wir werden" statt „wir aßen" waehlt, hat die Zeit verwechselt und
     nicht sich vertippt. */
  const paare = ZEITPAARE;
  return zeitAufgaben(e.id).map((a, i) => {
    const andere = paare[(i + 1) % paare.length];
    const falsch = [...new Set([
      a.wort === a.hinweis ? andere.grund : a.hinweis,
      e.id === 'vergangenheit' ? andere.frueher : andere.grund,
      e.id === 'zukunft' ? WERDEN.wir : WERDEN.er,
    ])].filter(w => w !== a.wort).slice(0, 3);
    while (falsch.length < 3) falsch.push(paare[(i + falsch.length + 2) % paare.length].frueher);
    return { id:a.id, wort:a.wort, saetze:[a.vorgabe], falsch,
             regel:ZEITREGEL[e.id] };
  });
}
