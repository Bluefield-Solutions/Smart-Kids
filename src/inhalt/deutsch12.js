/**
 * DER GRUNDWORTSCHATZ DER JAHRGANGSSTUFEN 1 UND 2 - die Auffrischung.
 *
 * Quelle ist `docs/referenz/ISB-Grundwortschatz-12.txt`, der ausgelesene
 * Text der amtlichen Liste des ISB. Das Untertor `deutsch` liest ihn bei
 * jedem Lauf mit einem eigenen, groben Sieb und rechnet nach, dass hier
 * keine Woerter stehen, die dort fehlen, und keine fehlen, die dort
 * stehen (Regel 3: das Soll kommt aus der Referenz).
 *
 * GEZAEHLT, NICHT GESCHAETZT - und die Zahlen widersprechen dem
 * Konzeptpapier, das „244 Woerter" sagte:
 *
 *   245 Eintraege in 30 Gruppen der amtlichen Liste
 *   244 verschiedene Schreibungen (ein Wort steht zweimal da)
 *   280 Lerneinheiten (ein Paar wie „gehen - geht" sind zwei)
 *
 * Das Konzeptpapier hat die SCHREIBUNGEN gezaehlt. Beides ist richtig,
 * und beides heisst etwas anderes; hier steht, was der Vorrat wirklich
 * traegt.
 *
 * DIE LISTE WIDERSPRICHT SICH WIEDER. Sie sagt von sich: „Jedes Wort
 * des Grundwortschatzes ist nur einem besonderen Uebungsschwerpunkt
 * zugeordnet." In 3/4 stimmt das 19 Mal nicht, hier zweimal:
 *
 *   „suchen"  steht unter <en> UND unter <ch>
 *   „spielen" steht als Grundform von „spielen - spielt" unter <Sp>
 *             und noch einmal fuer sich unter <ie>
 *
 * `HEIMAT12` loest das nach EINEM Satz statt von Fall zu Fall: ein Wort
 * gehoert dorthin, wo seine EIGENE Schwierigkeit liegt. Die Endung -en
 * haben auch „brauchen" und „machen"; das <ch> in „suchen" ist das, was
 * man sich merken muss. Und „spielen - spielt" traegt mehr als
 * „spielen" allein, also bleibt das Paar und die Einzelnennung geht.
 *
 * ZWEI ABTEILUNGEN UND NICHT EINE, und das ist gemessen: auf dem
 * Zielgeraet (844 x 390) stehen sieben Kacheln je Reihe und drei Reihen
 * ins Bild - EINUNDZWANZIG Kacheln. Vierundzwanzig Ebenen in einer Wand
 * liefen unten heraus, so wie die Rechtschreibwand es in E26b getan
 * hat. Der Schnitt ist deshalb keiner von mir, sondern der der Liste
 * selbst: sie fuehrt ihre Gruppen unter drei Ueberschriften, und die
 * erste traegt siebzehn, die beiden anderen zusammen sieben.
 */
import { SAETZE12 } from './deutsch12-saetze.js';
import { NOTFALL, UMFORMUNGEN as GETEILT, verschreiberMit } from './deutsch.js';

/* Die Farbe steht hier NICHT noch einmal. Sie kommt aus `PRINZIP_FARBE`
   in `deutsch.js`, und `spiel.js` holt sie sich dort fuer beide
   Abteilungen - „hoeren" hat damit in 1/2 dieselbe Farbe wie in 3/4.
   Eine zweite Tafel waere eine zweite, die getrennt veraltet (Regel 6),
   und eine gleichbleibende Farbe ist ein Abrufhinweis (QS8). */

/**
 * Die ABTEILUNGEN - zwei Gruppenkacheln statt einer.
 *
 * Die Namen sind die der amtlichen Ueberschriften, auf Kachellaenge
 * gebracht: „Nutzung des phonologischen und des silbischen Prinzips"
 * ist „Hoeren und Silben", die beiden anderen zusammen sind „Ableiten
 * und Merken".
 */
export const ABTEILUNGEN = [
  { id:'laute',  titel:'Hören und Silben',
    amtlich:'Nutzung des phonologischen und des silbischen Prinzips' },
  { id:'merken', titel:'Ableiten und Merken',
    amtlich:'Nutzung des morphologischen Prinzips · Schreibungen, '
      + 'für die nicht auf Strategien zurückgegriffen wird' },
];

/**
 * Die 24 Ebenen, in der Reihenfolge der amtlichen Liste.
 *
 * `prinzip` und `titel` sind dieselben Begriffe wie in 3/4 - wo das
 * Phaenomen dasselbe ist, heisst es auch gleich. Was sich unterscheidet,
 * sind die WOERTER: in 1/2 steht „Katze", in 3/4 „Platz".
 *
 * Die sieben Gruppen der amtlichen Liste unter „nicht-regelhafte
 * Besonderheiten" (<C>, <V>, <y>, <x>, nicht hoerbares <h>, <ae> ohne
 * Ableitung, <ai>) sind EINE Ebene: eine Kachel fuer das eine Wort
 * „Baby" waere keine. `BESONDERHEIT12` sagt je Wort, worum es geht -
 * dieselbe Loesung wie bei den Merkwoertern in 3/4.
 */
export const GRUPPEN12 = [
  { id:'silben', abteilung:'laute', prinzip:'hoeren', titel:'Silben sprechen',
    amtlich:'Wörter beim Schreiben in Silben gegliedert mitsprechen',
    woerter:['Aufgabe', 'Auge', 'Auto', 'blau', 'Blume', 'Blüte', 'böse', 'braun',
      'Brot', 'Buch', 'bunt', 'Dose', 'Ende', 'Ente', 'Frau', 'Gemüse', 'grün', 'gut',
      'Hase', 'Hose', 'Kiste', 'laut', 'Löwe', 'Name', 'Oma', 'Opa', 'Rabe', 'Raupe',
      'rot', 'Salz', 'Schaf', 'Schere', 'schön', 'Schule', 'Tante', 'Telefon',
      'Tomate', 'tun', 'weit', 'Wolf', 'Wolke'] },
  { id:'er', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit er',
    amtlich:'Wörter mit <er>',
    woerter:['Bruder', 'Feder', 'Fenster', 'Schwester', 'Winter'] },
  { id:'el', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit el',
    amtlich:'Wörter mit <el>',
    woerter:['dunkel', 'Esel', 'Gabel', 'Nadel', 'Nebel', 'Onkel', 'Pinsel', 'Wurzel'] },
  { id:'en', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit en',
    amtlich:'Wörter mit <en>',
    woerter:['baden', 'finden', 'haben', 'holen', 'hören', 'malen', 'rechnen',
      'reden', 'Regen', 'rufen', 'suchen', 'wünschen'] },
  { id:'ei', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit ei',
    amtlich:'Wörter mit <Ei>/<ei>',
    woerter:['Ameise', 'Ei', 'Eis', 'fein', 'klein', 'leise', 'reisen', 'Seife',
      'Zeit', 'zwei'] },
  { id:'eu', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit eu',
    amtlich:'Wörter mit <Eu>/<eu>',
    woerter:['Euro', 'Leute', 'neu'] },
  { id:'ng', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit ng',
    amtlich:'Wörter mit <ng>',
    woerter:['bringen', 'eng', 'Junge', 'Ring', 'singen'] },
  { id:'nk', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit nk',
    amtlich:'Wörter mit <nk>',
    woerter:['Bank', 'danken', 'denken', 'krank', 'trinken'] },
  { id:'sp', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit sp',
    amtlich:'Wörter mit <Sp>/<sp>',
    woerter:['sparen', ['spielen', 'spielt'], 'Sport', ['sprechen', 'spricht']] },
  { id:'st', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit st',
    amtlich:'Wörter mit <St>/<st>',
    woerter:['Stein', 'Stern', 'Stunde'] },
  { id:'ch', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit ch',
    amtlich:'Wörter mit <ch>',
    woerter:['brauchen', 'hoch', 'leicht', 'machen', 'suchen', 'Woche'] },
  { id:'sch', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit sch',
    amtlich:'Wörter mit <Sch>/<sch>',
    woerter:['frisch', 'scheinen', 'schneiden', 'Tasche', 'Tisch'] },
  { id:'pf', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit pf',
    amtlich:'Wörter mit <Pf>/<pf>',
    woerter:['Kopf', 'Pflanze'] },
  { id:'qu', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit qu',
    amtlich:'Wörter mit <Qu>',
    woerter:['Quelle', 'Quadrat', 'Quatsch'] },
  { id:'r-nach-vokal', abteilung:'laute', prinzip:'hoeren',
    titel:'r nach dem Selbstlaut',
    amtlich:'Wörter mit <r> nach Vokal (vokalisiertes <r>)',
    woerter:['arbeiten', 'antworten', 'Birne', ['dürfen', 'darf'], 'Garten',
      'lernen', 'Partner', 'schwarz', 'turnen', 'warten', 'Wort'] },
  { id:'ie', abteilung:'laute', prinzip:'hoeren', titel:'Wörter mit ie',
    amtlich:'Wörter mit <ie>',
    woerter:['Biene', 'lieben', 'liegen', 'sieben', 'spielen', 'Wiese', 'Ziege'] },
  { id:'mitlautverdopplung', abteilung:'laute', prinzip:'hoeren',
    titel:'Doppelte Mitlaute',
    amtlich:'Wörter mit Mitlautverdopplung',
    woerter:['alle', 'Füller', 'Himmel', 'Klasse', 'können', 'müssen', 'Mutter',
      'rollen', 'sollen', 'Sommer', 'Sonne', 'Wasser', 'wollen'] },
  { id:'umlautung', abteilung:'merken', prinzip:'ableiten', titel:'Von a zu ä',
    amtlich:'Umlautung',
    woerter:[['Apfel', 'Äpfel'], ['Baum', 'Bäume'], ['Gras', 'Gräser'],
      ['Haus', 'Häuser'], ['laufen', 'läuft'], ['Maus', 'Mäuse'],
      ['schlafen', 'schläft']] },
  { id:'verhaertung', abteilung:'merken', prinzip:'ableiten',
    titel:'Verlängern hilft',
    amtlich:'Verhärtungen',
    woerter:[['Bild', 'Bilder'], ['bleiben', 'bleibt'], ['Bub', 'Buben'],
      ['fragen', 'fragt'], ['Freund', 'Freunde'], ['geben', 'gibt'],
      ['gelb', 'gelbe'], ['gesund', 'gesunde'], ['Hund', 'Hunde'],
      ['Kind', 'Kinder'], ['Kleid', 'Kleider'], ['leben', 'lebt'],
      ['legen', 'legt'], ['Pferd', 'Pferde'], ['sagen', 'sagt'],
      ['schreiben', 'schreibt'], ['Tag', 'Tage'], ['üben', 'übt'],
      ['Weg', 'Wege'], ['Wind', 'Winde'], ['zeigen', 'zeigt']] },
  { id:'haeufig', abteilung:'merken', prinzip:'merken',
    titel:'Wörter, die oft kommen',
    amtlich:'Wörter aus dem Häufigkeitswortschatz',
    woerter:['aber', 'als', 'also', 'auf', 'aus', 'bei', 'da', 'das', 'der', 'des',
      'dir', 'dich', 'die', 'doch', 'du', 'durch', 'er', 'es', 'für', 'her', 'hinter',
      'ich', 'im', 'in', 'ist', 'ja', 'mit', 'nach', 'nein', 'nicht', 'nun', 'oder',
      'schon', 'sie', 'sind', 'so', 'über', 'um', 'und', 'was', 'weil', 'weiter',
      'wer', 'wir', 'wo'] },
  { id:'ss', abteilung:'merken', prinzip:'merken', titel:'Wörter mit ß',
    amtlich:'<ß>',
    woerter:['Fuß', 'groß'] },
  { id:'tz', abteilung:'merken', prinzip:'merken', titel:'Wörter mit tz',
    amtlich:'<tz>',
    woerter:[['sitzen', 'sitzt'], 'Katze', ['Satz', 'Sätze']] },
  { id:'ck', abteilung:'merken', prinzip:'merken', titel:'Wörter mit ck',
    amtlich:'<ck>',
    woerter:['dick', 'backen'] },
  { id:'merkwoerter', abteilung:'merken', prinzip:'merken',
    titel:'Wörter zum Merken',
    amtlich:'<C> · <V>/<v> · <y> · <x> · nicht hörbares <h> · '
      + '<ä> ohne Ableitung · <ai> für Laut /aɪ/',
    woerter:['Cent', 'Clown', 'Computer', 'viel', 'Vase', 'Vater', 'Vogel', 'vor',
      'Baby', 'Hexe', 'Frühling', ['gehen', 'geht'], 'Jahr', 'Uhr', 'Zahl', 'zahlen',
      'zählen', ['Zahn', 'Zähne'], 'Mädchen', 'Hai', 'Kaiser', 'Mai'] },
];

/**
 * DIE REGEL JE EBENE - ein Satz, den ein Kind der zweiten Klasse
 * versteht, und er steht bei JEDER Antwort da, richtig wie falsch.
 *
 * Dieselbe Ueberlegung wie in 3/4: wer „Katze" auf Anhieb richtig
 * schreibt, weiss deshalb noch nicht, WARUM dort tz steht - und genau
 * das braucht er beim naechsten Wort dieser Ebene.
 */
export const REGELN12 = {
  silben: 'Sprich beim Schreiben mit: in jeder Silbe steckt ein Selbstlaut.',
  er: 'Am Ende hörst du ein a und schreibst trotzdem er.',
  el: 'Am Ende hörst du ein l und schreibst trotzdem el.',
  en: 'Am Ende hörst du nur n und schreibst trotzdem en.',
  ei: 'Du hörst ai und schreibst ei. Das ist fast immer so.',
  eu: 'Du hörst oi und schreibst eu.',
  ng: 'Hinter dem ng kommt kein g mehr: Ring, nicht Ringg.',
  nk: 'Du hörst ng und schreibst nk: Bank, nicht Bang.',
  sp: 'Am Wortanfang sprichst du schp und schreibst sp.',
  st: 'Am Wortanfang sprichst du scht und schreibst st.',
  ch: 'Das ch ist ein Laut und braucht beide Buchstaben.',
  sch: 'Das sch ist ein Laut und braucht alle drei Buchstaben.',
  pf: 'Im pf hörst du beide Buchstaben, wenn du genau hinhörst.',
  qu: 'Nach dem q kommt immer ein u.',
  'r-nach-vokal': 'Nach dem Selbstlaut hörst du kaum ein r — schreib es trotzdem.',
  ie: 'Du hörst ein langes i und schreibst ie.',
  mitlautverdopplung: 'Vor dem doppelten Mitlaut ist der Selbstlaut kurz.',
  umlautung: 'Such das verwandte Wort: steht dort a, schreibst du ä.',
  verhaertung: 'Verlängere das Wort — dann hörst du, welcher Buchstabe hingehört.',
  haeufig: 'Dieses Wort kommt in jedem zweiten Satz vor. Präg es dir ein.',
  ss: 'Nach einem langen Selbstlaut steht ß, nicht ss.',
  tz: 'Nach einem kurzen Selbstlaut steht tz, nicht z.',
  ck: 'Nach einem kurzen Selbstlaut steht ck, nicht k.',
  merkwoerter: 'Dieses Wort musst du dir merken — eine Regel gibt es nicht.',
};

/**
 * Und fuer die EINE gebuendelte Ebene je Wort, worum es geht. Die
 * Ebene traegt sieben Gruppen der amtlichen Liste, und „merk es dir"
 * allein waere fuer jede davon zu wenig.
 */
export const BESONDERHEIT12 = {
  Cent: 'Das C spricht man hier wie ein Z.',
  Clown: 'Das C spricht man hier wie ein K.',
  Computer: 'Das C spricht man hier wie ein K.',
  viel: 'Das V spricht man wie ein F.',
  Vase: 'Das V spricht man hier wie ein W.',
  Vater: 'Das V spricht man wie ein F.',
  Vogel: 'Das V spricht man wie ein F.',
  vor: 'Das V spricht man wie ein F.',
  Baby: 'Das y am Ende klingt wie ein i.',
  Hexe: 'Das x ist ein Buchstabe für zwei Laute: k und s.',
  'Frühling': 'Das h hörst du nicht — es macht das ü lang.',
  gehen: 'Das h zwischen den Silben hörst du nicht.',
  geht: 'Das h zwischen den Silben hörst du nicht.',
  Jahr: 'Das h hörst du nicht — es macht das a lang.',
  Uhr: 'Das h hörst du nicht — es macht das u lang.',
  Zahl: 'Das h hörst du nicht — es macht das a lang.',
  zahlen: 'Das h hörst du nicht — es macht das a lang.',
  'zählen': 'Das h hörst du nicht — es macht das ä lang.',
  Zahn: 'Das h hörst du nicht — es macht das a lang.',
  'Zähne': 'Das h hörst du nicht — es macht das ä lang.',
  'Mädchen': 'Hier steht ä, obwohl es kein Wort mit a dazu gibt.',
  Hai: 'Du hörst ai und schreibst auch ai. Das ist selten.',
  Kaiser: 'Du hörst ai und schreibst auch ai. Das ist selten.',
  Mai: 'Du hörst ai und schreibst auch ai. Das ist selten.',
};

/**
 * WO EIN WORT WIRKLICH HINGEHOERT.
 *
 * Die Liste sagt, jedes Wort stehe nur an einer Stelle, und haelt sich
 * hier zweimal nicht daran. Entschieden wird nach EINEM Satz: ein Wort
 * gehoert dorthin, wo seine eigene Schwierigkeit liegt.
 */
export const HEIMAT12 = {
  // Die Endung -en haben „brauchen" und „machen" auch. Das <ch> ist das,
  // was man sich merken muss.
  suchen: 'ch',
  // „spielen - spielt" traegt das Paar und das sp- am Anfang; die
  // Einzelnennung unter <ie> traegt nur das ie, das „Biene" auch hat.
  spielen: 'sp',
};

/** Alle Lerneinheiten, in der Reihenfolge der Liste. */
export const EINHEITEN12 = [];
for (const g of GRUPPEN12) {
  for (const eintrag of g.woerter) {
    const formen = Array.isArray(eintrag) ? eintrag : [eintrag];
    for (const wort of formen) {
      const heim = HEIMAT12[wort];
      if (heim && heim !== g.id) continue;
      EINHEITEN12.push({ id: `${g.id}:${wort}`, wort, gruppe: g.id,
        abteilung: g.abteilung, prinzip: g.prinzip,
        gruppeTitel: g.titel,
        paar: formen.length > 1 ? formen : null,
        regel: BESONDERHEIT12[wort] || REGELN12[g.id] });
    }
  }
}

/** Die Einheiten einer Ebene - oder einer ganzen Abteilung. */
export const einheitenVon = (gruppeId) =>
  EINHEITEN12.filter(e => e.gruppe === gruppeId);
export const einheitenDerAbteilung = (abteilungId) =>
  EINHEITEN12.filter(e => e.abteilung === abteilungId);
export const gruppeVon = (gruppeId) => GRUPPEN12.find(g => g.id === gruppeId);

/* Das laengste Wort einer Ebene - die Luecke im Satz wird so breit.
   Aus der EBENE und nicht aus dem Wort: sonst verriete die Luecke, wie
   lang die Loesung ist. */
export const laengstesWort12 = (gruppeId) => Math.max(4,
  ...einheitenVon(gruppeId).map(e => e.wort.length));

/* Die Saetze zu einer Einheit. Einer je Einheit in dieser Abteilung -
   die Wiederholung soll auffrischen, nicht noch einmal durchnehmen. */
export const saetzeZu12 = (wort) => {
  const s = SAETZE12[wort];
  return s ? (Array.isArray(s) ? s : [s]) : [];
};

/**
 * WIE EIN KIND DIESES WORT FALSCH SCHREIBT.
 *
 * Je Ebene eine kleine Tafel von Umformungen, und jede ist der Fehler,
 * den GENAU dieses Phaenomen hervorruft: wer „schp" schreibt, hat das
 * sp am Wortanfang nicht gelernt; wer „Bruda" schreibt, hat das
 * unbetonte -er gehoert statt gewusst. Ein beliebig verdrehter
 * Buchstabe waere ein anderer Test.
 *
 * `NOTFALL` ist dieselbe letzte Reihe wie in 3/4 und steht nur dann da,
 * wenn die eigene Tafel keine drei verschiedenen Fassungen hergibt.
 */
/* Die letzte Reihe und die geteilten Zeilen stehen in `deutsch.js` und
   werden von dort geholt - wo 1/2 dasselbe Phaenomen uebt (ie, tz, ck,
   ß, doppelte Mitlaute, Umlautung, Verhaertung, die haeufigen Woerter,
   das Mitsprechen, das r nach dem Selbstlaut), ist es derselbe Fehler.
   Zwei Fassungen waeren zwei, die getrennt veralten - Regel 6: was
   zweimal dasteht, veraltet einmal. */
const UMFORMUNGEN12 = {
  /* Geteilt mit 3/4 - dieselbe Schwierigkeit, dieselben Fehler. */
  silben:             GETEILT.silben,
  'r-nach-vokal':     GETEILT['r-nach-vokal'],
  ie:                 GETEILT.ie,
  mitlautverdopplung: GETEILT.mitlautverdopplung,
  umlautung:          GETEILT.umlautung,
  verhaertung:        GETEILT.verhaertung,
  ss:                 GETEILT.ss,
  tz:                 GETEILT.tz,
  ck:                 GETEILT.ck,
  /* Und die zehn Buchstabengruppen, die es nur in 1/2 gibt. Jede Zeile
     ist der Fehler, den GENAU dieses Phaenomen hervorruft: wer „schp"
     schreibt, hat das sp am Wortanfang nicht gelernt; wer „Bruda"
     schreibt, hat das unbetonte -er gehoert statt gewusst. Ein beliebig
     verdrehter Buchstabe waere ein anderer Test. */
  er:                 [[/er$/, 'a'], [/er$/, 'ä'], [/er/, 'e']],
  el:                 [[/el$/, 'l'], [/el$/, 'le'], [/el/, 'al']],
  en:                 [[/en$/, 'n'], [/en$/, 'ne'], [/en$/, 'an']],
  ei:                 [[/ei/, 'ai'], [/Ei/, 'Ai'], [/ei/, 'ie'], [/ei/, 'ey']],
  eu:                 [[/eu/, 'oi'], [/eu/, 'äu'], [/Eu/, 'Oi'], [/eu/, 'eo']],
  ng:                 [[/ng/, 'ngg'], [/ng/, 'nk'], [/ng/, 'n']],
  nk:                 [[/nk/, 'ng'], [/nk/, 'nck'], [/nk/, 'k']],
  sp:                 [[/sp/, 'schp'], [/Sp/, 'Schp'], [/sp/, 'ssp']],
  st:                 [[/st/, 'scht'], [/St/, 'Scht'], [/st/, 'sst']],
  ch:                 [[/ch/, 'sch'], [/ch/, 'h'], [/ch/, 'k']],
  sch:                [[/sch/, 'ch'], [/sch/, 'sh'], [/sch/, 's'], [/Sch/, 'Sh']],
  pf:                 [[/pf/, 'f'], [/pf/, 'p'], [/pf/, 'pff'], [/Pf/, 'F']],
  qu:                 [[/qu/, 'kw'], [/Qu/, 'Kw'], [/qu/, 'q'], [/Qu/, 'Q']],
  /* Die KUERZESTEN brauchen vier Zeilen mehr: „für", „ja" und „wo"
     haben zu wenig Buchstaben, als dass eine Verdopplung drei
     verschiedene Fassungen haette hergeben koennen - gemessen, sie
     blieben bei zweien. Es sind trotzdem keine Verlegenheiten, sondern
     die Fehler, die ein Zweitklaessler wirklich macht. */
  haeufig:            [...GETEILT.haeufig,
                       [/^f/, 'v'], [/^w/, 'v'], [/^j/, 'i'], [/ü/, 'ue']],
  /* Die EINE gebuendelte Ebene traegt sieben Besonderheiten, und jede
     hat ihren eigenen Fehler. Die Tafel wird der Reihe nach probiert;
     was auf das Wort nicht passt, faellt von selbst durch. */
  merkwoerter:        [[/C/, 'K'], [/C/, 'Z'], [/v/, 'f'], [/V/, 'F'], [/v/, 'w'],
                       [/y$/, 'i'], [/y/, 'ie'], [/x/, 'ks'], [/x/, 'chs'],
                       [/h(?=[a-zäöü])/, ''], [/ah/, 'a'], [/äh/, 'ä'],
                       [/ai/, 'ei'], [/ai/, 'ay'], [/ä/, 'e']],
};

/**
 * Drei falsche Schreibweisen zu einer Lerneinheit — immer drei, immer
 * verschieden, nie das Wort selbst. Die Maschine dahinter steht in
 * `deutsch.js` und wird hier nur mit der eigenen Tafel gerufen.
 */
export const verschreiber12 = (einheit) =>
  verschreiberMit(einheit.wort, [UMFORMUNGEN12[einheit.gruppe], NOTFALL]);

/**
 * Der Gegenstand, wie ihn der Bildschirm braucht — EINE Stelle, an der
 * Wort, Regel, Satz und falsche Schreibweisen zusammenkommen.
 */
export const gegenstandZu12 = (e) => ({
  id: e.id, wort: e.wort, gruppe: e.gruppe, paar: e.paar,
  regel: e.regel, saetze: saetzeZu12(e.wort), falsch: verschreiber12(e),
});
