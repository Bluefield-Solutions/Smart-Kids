/**
 * DEUTSCH — der bayerische Grundwortschatz 3/4 als Lernstoff.
 *
 * Die Quelle ist amtlich und liegt im Wortlaut daneben:
 * `docs/referenz/ISB-Grundwortschatz-34.txt` - der ausgelesene Text der
 * Datei „Grundwortschatz fuer die Jahrgangsstufen 3 und 4" des ISB. Was
 * hier steht, ist die STRUKTURIERTE Fassung davon; das Tor `deutsch`
 * liest die Referenz unabhaengig und vergleicht beide.
 *
 * Warum die Gruppe die Ebene ist und nicht das Thema: die Liste ordnet
 * jedes Wort GENAU EINEM Uebungsschwerpunkt zu und sagt das ausdruecklich
 * („um durch eine doppelte Nennung die Darstellung nicht unnoetig zu
 * erweitern"). Eine Ebene je Phaenomen bildet also die amtliche
 * Gliederung eins zu eins ab - und nur so traegt die Begruendung beim
 * Fehler: eine Ebene, eine Regel.
 *
 * EIN EINTRAG IST EINE WORTFAMILIE, nicht ein Wort. Die Liste schreibt
 * „Abend - Abende - abends" und „bleiben - blieben", weil das PAAR die
 * Strategie ist: verlaengern, ableiten, in die Vergangenheit setzen.
 * Gefragt wird eine der Formen, die Begruendung zeigt das ganze Paar.
 *
 * DIE LISTE HAELT IHR EIGENES VERSPRECHEN NICHT GANZ. „zusammen" steht
 * bei der Mitlautverdopplung UND im Haeufigkeitswortschatz, „voll" im
 * Haeufigkeitswortschatz UND bei <V>, „nie" bei <ie> UND im
 * Haeufigkeitswortschatz. Das ist kein Lesefehler, es steht so da. Fuer
 * uns heisst das: eine Lerneinheit gehoert zu genau einer Ebene, und
 * welche das ist, entscheidet `HEIMAT` weiter unten - sichtbar und
 * begruendet, nicht stillschweigend durch die Reihenfolge einer Schleife.
 */

import { SAETZE } from './deutsch-saetze.js';

/** Die 25 Gruppen der amtlichen Liste, in ihrer Reihenfolge. */
export const GRUPPEN = [
  { id:'silben', titel:'Silben trennen', farbe:1,
    amtlich:'Wörter, wenn möglich, nach Schreibsilben am Zeilenende trennen',
    woerter:['Boden','Ding','etwas','Finger','Fisch','Flasche','gegen','gehören',
      'genau','gerade','Geschichte','Gesicht','gleich','Hals','helfen','heute',
      'lachen','Licht','Loch','Luft','machen','Mensch','Milch','Nase','neben',
      'neu','oben','reich','reiten','Sache','schenken','schlecht','Seite',
      'sprechen','springen','Stein','tanken','Tasche','Wagen','weinen','Woche',
      'Zeitung'] },

  { id:'r-nach-vokal', titel:'r nach dem Selbstlaut', farbe:2,
    amtlich:'Wörter mit <r> nach Vokal (vokalisiertes <r>)',
    woerter:['Arm','Dorf','dort','Eltern','Erde','erst','gern','gestern','kurz',
      'merken','morgen','schwer','sofort','stark','Tür','werfen','Wurst'] },

  { id:'ie', titel:'Wörter mit ie', farbe:3,
    amtlich:'Wörter mit <ie>',
    woerter:['Beispiel',['Brief','Briefe'],'geschrieben',['lesen','liest'],
      ['nie','niemals'],['riechen','riecht'],['schieben','schiebt'],'schwierig',
      ['tief','tiefer'],['Tier','Tiere'],'verlieren',['ziehen','zieht'],
      ['zielen','zielt'],'Zwiebel'] },

  { id:'mitlautverdopplung', titel:'Doppelte Mitlaute', farbe:4,
    amtlich:'Mitlautverdopplung',
    woerter:['dumm','essen','kommen','schlimm','schwimmen','schnell','stellen',
      'vergessen','Zimmer','zusammen'] },

  { id:'tz', titel:'Wörter mit tz', farbe:5,
    amtlich:'Wörter mit <tz>',
    woerter:['Platz','Pfütze','plötzlich','schützen'] },

  { id:'ck', titel:'Wörter mit ck', farbe:6,
    amtlich:'Wörter mit <ck>',
    woerter:[['Glück','glücklich'],['Schreck','erschrecken'],'Stück','verstecken',
      'zurück'] },

  { id:'silben-h', titel:'Das h zwischen den Silben', farbe:7,
    amtlich:'Wörter mit silbentrennendem <h>',
    woerter:['blühen','drehen','gehen',['Kuh','Kühe'],['Schuh','Schuhe'],'sehen',
      'stehen',['Zeh','Zehen']] },

  { id:'verhaertung', titel:'Verlängern hilft', farbe:1,
    amtlich:'Verhärtung',
    woerter:[['Abend','Abende','abends'],['Berg','Berge'],['erlauben','erlaubt'],
      ['fremd','fremder'],['Geld','Gelder'],['lieben','liebt'],['liegen','liegt'],
      ['rund','runder'],['steigen','steigt'],['werden','wird']] },

  { id:'umlautung', titel:'Von a zu ä', farbe:2,
    amtlich:'Umlautung',
    woerter:[['alt','älter'],['Ast','Äste'],['lang','länger'],['laufen','läuft'],
      ['Nacht','Nächte'],['Saft','Säfte']] },

  { id:'flektiert', titel:'Kleine Wörter im Satz', farbe:3,
    amtlich:'Flektierte Wörter im Satzzusammenhang richtig schreiben',
    woerter:[['am','an'],['dein','deinem','deinen'],['dem','den'],
      ['dies','diesem','diesen'],['ein','einem','einen'],['euer','eurem','euren'],
      ['ganz','ganzem','ganzen'],['ihm','ihn','ihnen'],['ihr','ihre','ihrem','ihren'],
      ['im','in'],['jede','jedem','jeden'],['kein','keinem','keinen'],
      ['mein','meinem','meinen'],['mich','mir'],['sein','seinem','seinen'],'seit',
      ['uns','unserem','unseren'],['vom','von'],['welche','welchem','welchen'],
      ['wem','wen'],['zu','zum','zur']] },

  { id:'umlaut-verhaertung', titel:'Umlaut und Verlängern', farbe:4,
    amtlich:'Umlautung und Auslautverhärtung, auch miteinander und mit anderen Fällen kombiniert',
    woerter:[['Arzt','Ärzte'],['backen','Bäcker'],['Band','Bänder'],['Hand','Hände'],
      ['kaufen','Verkäufer'],['Land','Länder'],['lassen','lässt'],['Mann','Männer'],
      ['Rad','Räder'],['stark','stärker'],['Wald','Wälder']] },

  { id:'praeteritum', titel:'Gestern war es so', farbe:5,
    amtlich:'Flexions- und Präteritumsformen von Verben richtig schreiben, auf Vokallänge achten',
    woerter:[['bleiben','blieben'],['essen','aßen'],['fallen','fielen'],
      ['geben','gaben'],['gehen','gingen'],['halten','hielten'],['heißen','hießen'],
      ['kommen','kamen'],['können','konnten'],['lassen','ließen'],['laufen','liefen'],
      ['lesen','liest','lasen'],['liegen','lagen'],['müssen','mussten'],
      ['rufen','riefen'],['scheinen','schienen'],['schieben','schoben'],
      ['singen','sangen'],['sitzen','saßen'],['schlafen','schliefen'],
      ['schneiden','schnitten'],['schreiben','schrieben'],['steigen','stiegen'],
      ['schwimmen','schwammen'],['tragen','trugen'],['trinken','tranken'],
      ['vergessen','vergaßen'],['ziehen','zogen']] },

  { id:'haeufig', titel:'Wörter, die oft kommen', farbe:6,
    amtlich:'Wörter aus dem Häufigkeitswortschatz',
    woerter:['ab','bin','bis','bist','dann','hier','hin','immer','ins','man',
      ['nicht','nichts'],'nie','nur','ob','oft','sehr','voll','wann','warum',
      'wenig','wie','wieder','zu','zuletzt','zusammen'] },

  { id:'ss', titel:'Wörter mit ß', farbe:7,
    amtlich:'<ß>',
    woerter:['außer','draußen','heißen','Straße'] },

  /* DIE ELF KLEINEN GRUPPEN, ZU EINER EBENE GEBUENDELT.
   *
   * Die Buendelungsregel kommt aus der Liste selbst und nicht aus mir:
   * gebuendelt wird genau das, was dort unter der Ueberschrift „Woerter
   * mit nicht-regelhaften Rechtschreibbesonderheiten" steht. Eine Kachel
   * fuer das eine Wort „Christ" waere keine Ebene, sondern ein Kruemel -
   * und elf solche Kacheln machen die Wand unlesbar.
   *
   * VERLOREN GEHT DABEI NICHTS: jedes Wort traegt seine `besonderheit`
   * mit, und die Begruendung beim Fehler nennt sie beim Namen. Die
   * Gliederung der Liste steht also weiter in den Daten - nur nicht in
   * der Kachelwand. */
  { id:'merkwoerter', titel:'Wörter zum Merken', farbe:1,
    amtlich:'Wörter mit nicht-regelhaften Rechtschreibbesonderheiten',
    merk:true,
    woerter:['Christ','vielleicht','vier','voll','Handy','Fuchs','links','Taxi',
      'Text','sechs','Pizza','Skizze','Stadt','verwandt','erzählen','fahren',
      'wahr','zehn','Haar','Meer','Schnee','See','Käfer','Käfig','Märchen',
      'Tiger','Maschine','Familie','Laib'] },
];

/** Welche Besonderheit ein Merkwort traegt - die Untergliederung der Liste. */
export const BESONDERHEIT = {
  Christ:'Ch', vielleicht:'V', vier:'V', voll:'V', Handy:'y',
  Fuchs:'ks', links:'ks', Taxi:'ks', Text:'ks', sechs:'ks',
  Pizza:'zz', Skizze:'zz', Stadt:'dt', verwandt:'dt',
  erzählen:'dehnungs-h', fahren:'dehnungs-h', wahr:'dehnungs-h', zehn:'dehnungs-h',
  Haar:'doppelvokal', Meer:'doppelvokal', Schnee:'doppelvokal', See:'doppelvokal',
  'Käfer':'ae', 'Käfig':'ae', 'Märchen':'ae',
  Tiger:'i-statt-ie', Maschine:'i-statt-ie', Familie:'i-statt-ie',
  Laib:'ai',
};

/**
 * WO EINE FORM ZU HAUSE IST — die 19 Faelle, in denen die amtliche Liste
 * dieselbe Form in ZWEI Gruppen fuehrt.
 *
 * Die Liste sagt von sich: „Jedes Wort des Grundwortschatzes ist nur
 * einem Uebungsschwerpunkt zugeordnet." Nachgezaehlt am ausgelesenen
 * Text stimmt das 19 Mal nicht. Fuenfzehn davon sind harmlos und
 * vermutlich gewollt: bei den Praeteritumsformen steht die Grundform
 * daneben, damit man sieht, wovon abgeleitet wird - gelernt wird dort
 * „aßen", nicht „essen". Vier sind echte Doppelungen: „nie", „zusammen",
 * „zu" und „voll" stehen je zweimal als Lernwort da.
 *
 * ENTSCHIEDEN WIRD NACH EINEM SATZ, nicht von Fall zu Fall: eine Form
 * gehoert in die Ebene, in der sie das MUSTER ihrer eigenen Schwierigkeit
 * ist. „zusammen" hat ein Doppel-m, also gehoert es zur
 * Mitlautverdopplung und nicht in den Haeufigkeitswortschatz, der von
 * sich sagt, dass es dort keine Strategie gibt. „voll" wird mit <V>
 * geschrieben, also ist es ein Merkwort. Und „essen" ist das Muster fuer
 * das Doppel-s; in „essen - aßen" ist es die Ausgangsform.
 *
 * Wo eine Form NICHT zu Hause ist, verschwindet sie nicht - sie steht
 * dort als Beleg in der Begruendung („essen - aßen"), nur ohne eigenen
 * Leitner-Stand. Sonst haette Lea denselben Gegenstand zweimal zu lernen
 * und beide Staende gingen auseinander.
 */
export const HEIMAT = {
  // Die Grundform gehoert zu ihrem eigenen Muster, nicht zum Praeteritum.
  lesen:'ie', liest:'ie', schieben:'ie', ziehen:'ie',
  essen:'mitlautverdopplung', kommen:'mitlautverdopplung',
  schwimmen:'mitlautverdopplung', vergessen:'mitlautverdopplung',
  gehen:'silben-h', liegen:'verhaertung', steigen:'verhaertung',
  laufen:'umlautung', lassen:'umlaut-verhaertung', 'heißen':'ss',
  stark:'r-nach-vokal',
  // Die vier echten Doppelungen: die Ebene MIT Strategie gewinnt.
  nie:'ie', zusammen:'mitlautverdopplung', zu:'flektiert', voll:'merkwoerter',
};

/** Alle Formen eines Eintrags, in der Reihenfolge der Liste. */
export const formenVon = (eintrag) => Array.isArray(eintrag) ? eintrag : [eintrag];

/**
 * Die Lerneinheiten: jede Form ein Gegenstand mit eigenem Leitner-Stand.
 *
 * `paar` ist der ganze Eintrag und wird in der Begruendung gezeigt -
 * das Paar IST die Strategie, und ohne es waere die Regel eine
 * Behauptung ohne Beleg.
 */
export const EINHEITEN = GRUPPEN.flatMap(g =>
  g.woerter.flatMap(eintrag => {
    const formen = formenVon(eintrag);
    return formen
      .filter(w => (HEIMAT[w] || g.id) === g.id)
      .map(w => ({ id:`de:${w}`, wort:w, gruppe:g.id, paar:formen,
                   besonderheit: BESONDERHEIT[w] || null }));
  }));

/** Die Lerneinheiten einer Ebene. */
export const einheitenVon = (gruppeId) => EINHEITEN.filter(e => e.gruppe === gruppeId);

/** Eine Gruppe an ihrer Kennung. */
export const gruppeVon = (id) => GRUPPEN.find(g => g.id === id);

/**
 * DIE BEGRUENDUNG, DIE VOR DER LOESUNG KOMMT.
 *
 * Wer falsch schreibt, bekommt zuerst die REGEL zu sehen und erst danach
 * das richtige Wort. Das ist der Unterschied zwischen „das war falsch"
 * und „so findest du es selbst": eine Loesung kann man abschreiben, eine
 * Regel traegt zum naechsten Wort derselben Ebene.
 *
 * Der BELEG steht immer dabei, und zwar das ganze Paar aus der amtlichen
 * Liste. „Verlaengere: Abend - Abende" ist eine Anweisung mit Beweis;
 * „verlaengere das Wort" allein ist ein Merksatz, den man aufsagen kann,
 * ohne ihn anzuwenden.
 *
 * `%` ist die Stelle, an der der Beleg eingesetzt wird.
 */
export const REGELN = {
  silben:            'Sprich das Wort in Silben mit. Jede Silbe hat einen Selbstlaut: %.',
  'r-nach-vokal':    'Nach dem Selbstlaut hörst du kaum ein r — geschrieben wird es trotzdem: %.',
  ie:                'Ein langes i schreibst du mit ie: %.',
  mitlautverdopplung:'Der Selbstlaut davor ist kurz — dann kommt der Mitlaut doppelt: %.',
  tz:                'Nach einem kurzen Selbstlaut schreibst du tz: %.',
  ck:                'Nach einem kurzen Selbstlaut schreibst du ck: %.',
  'silben-h':        'Zwischen zwei Silben steht ein h, das du nicht hörst: %.',
  verhaertung:       'Verlängere das Wort, dann hörst du den Laut: %.',
  umlautung:         'Leite vom Grundwort ab — aus a wird ä: %.',
  flektiert:         'Das kleine Wort richtet sich nach dem Satz: %.',
  'umlaut-verhaertung':'Leite ab und verlängere — dann hörst du beides: %.',
  praeteritum:       'Die Gestern-Form. Achte darauf, ob der Selbstlaut lang oder kurz ist: %.',
  haeufig:           'Dieses Wort kommt sehr oft vor. Präge es dir ein: %.',
  ss:                'Nach einem langen Selbstlaut oder einem Doppellaut schreibst du ß: %.',
};

/** Die elf Besonderheiten der Merkwoerter — hier geht die Gliederung der
 *  amtlichen Liste NICHT verloren, sie wandert nur aus der Kachelwand in
 *  die Begruendung. */
export const MERKREGELN = {
  Ch:            'Dieses Wort beginnt mit Ch und wird wie ein K gesprochen: %.',
  V:             'Du hörst ein f, geschrieben wird ein V: %.',
  y:             'Ein Wort aus dem Englischen — es behält sein y: %.',
  ks:            'Den ks-Laut hörst du, aber du kannst ihn nicht ableiten. Merke dir: %.',
  zz:            'Ein Wort aus dem Italienischen, mit zz: %.',
  dt:            'Hier stehen d und t nebeneinander, obwohl du nur ein t hörst: %.',
  'dehnungs-h':  'Ein h, das du nicht hörst. Es macht den Selbstlaut lang: %.',
  doppelvokal:   'Der Selbstlaut steht doppelt und wird lang gesprochen: %.',
  ae:            'Zu diesem Wort gibt es kein Grundwort mit a. Das ä musst du dir merken: %.',
  'i-statt-ie':  'Ein langes i — aber ohne e: %.',
  ai:            'Den Laut ei schreibst du hier mit ai: %.',
};

/**
 * Die Begruendung zu EINER Lerneinheit, mit eingesetztem Beleg.
 *
 * Der Beleg ist das ganze Paar, wenn es eines gibt („Abend - Abende"),
 * sonst das Wort selbst. Ein Paar aus einem Wort waere ein Gedankenstrich
 * ins Leere.
 */
export function regelZu(einheit){
  const vorlage = einheit.besonderheit
    ? MERKREGELN[einheit.besonderheit]
    : REGELN[einheit.gruppe];
  const beleg = einheit.paar.length > 1 ? einheit.paar.join(' – ') : einheit.wort;
  return (vorlage || '%').replace('%', beleg);
}

/**
 * DIE DREI FALSCHEN SCHREIBWEISEN — und warum sie nicht gewürfelt sind.
 *
 * Beim ERSTEN Treffen mit einem Wort stehen vier Schreibweisen zur Wahl.
 * Eine ausgedachte Verdrehung („Bodne") faellt sofort auf und prueft
 * nichts; was geprueft werden soll, ist genau der Fehler, den ein Kind
 * in der dritten Klasse WIRKLICH macht - und der haengt am Phaenomen:
 * bei der Mitlautverdopplung schreibt man einen Konsonanten statt zwei,
 * bei der Verhaertung t statt d, bei <ie> ein blosses i.
 *
 * Deshalb kommen die Ablenker aus einer Tafel von Umformungen je Gruppe
 * und nicht aus dem Zufall. Ein Kind, das hier die richtige Karte
 * antippt, hat die Falle GESEHEN - und das ist der Sinn des ersten
 * Treffens, bevor es beim zweiten frei tippt.
 *
 * BEI DEN KLEINEN WOERTERN IM SATZ sind die Ablenker die anderen Formen
 * DESSELBEN Eintrags („dem" gegen „den"). Dort ist die Verwechslung
 * nicht orthografisch, sondern grammatisch, und eine erfundene
 * Falschschreibung ginge an der Sache vorbei.
 */
const UMFORMUNGEN = {
  verhaertung:        [[/d$/,'t'], [/b$/,'p'], [/g$/,'k'], [/d(?=[st])/,'t'],
                       [/b(?=[st])/,'p'], [/g(?=[st])/,'k']],
  umlautung:          [[/äu/,'eu'], [/ä/,'e'], [/Ä/,'E']],
  'umlaut-verhaertung':[[/äu/,'eu'], [/ä/,'e'], [/Ä/,'E'], [/ss/,'s']],
  /* Drei ECHTE Fehler: einfach statt doppelt, ß statt ss, und die
     Dehnung statt der Schaerfung („ehsen") - genau die drei, die in
     einem Diktat der dritten Klasse vorkommen. */
  mitlautverdopplung: [[/([bdfgklmnprst])\1/,'$1'], [/ss/,'ß'],
                       [/([aeiou])([bdfgklmnprst])\2/,'$1h$2']],
  ie:                 [[/ie/,'i'], [/ie/,'ih'], [/ie/,'ieh']],
  tz:                 [[/tz/,'z'], [/tz/,'ts'], [/tz/,'zz']],
  ck:                 [[/ck/,'k'], [/ck/,'kk'], [/ck/,'ckk']],
  'silben-h':         [[/h/,''], [/h/,'hh']],
  ss:                 [[/ß/,'ss'], [/ß/,'s'], [/ß/,'sz']],
  praeteritum:        [[/ß/,'ss'], [/ie/,'i'], [/([aeiou])([bdfgklmnprst])(en)$/,'$1$2$2$3'],
                       [/ah/,'a'], [/eh/,'e']],
  'r-nach-vokal':     [[/r(?=[a-zäöü]?$)/,''], [/er$/,'a'], [/r/,'rr']],
  silben:             [[/([bdfgklmnprst])(e[nr]?)$/,'$1$1$2'], [/ei/,'ie'],
                       [/([aeiou])([bdgklmnpt])/,'$1$2$2'], [/e$/,'']],
  haeufig:            [[/([bdfgklmnprst])$/,'$1$1'], [/ie/,'i'], [/e/,'ä'], [/i/,'ie']],
};

/** Umformungen je Besonderheit der Merkwörter. */
const UMFORM_MERK = {
  Ch:           [[/^Ch/,'K'], [/^Ch/,'Sch']],
  V:            [[/v/,'f'], [/V/,'F']],
  y:            [[/y/,'i'], [/y/,'ie']],
  ks:           [[/x/,'ks'], [/chs/,'ks'], [/ks/,'x'], [/chs/,'x']],
  zz:           [[/zz/,'z'], [/zz/,'tz']],
  dt:           [[/dt/,'t'], [/dt/,'d'], [/dt/,'tt']],
  'dehnungs-h': [[/h/,''], [/ah/,'aa'], [/eh/,'ee']],
  doppelvokal:  [[/([aeo])\1/,'$1'], [/([aeo])\1/,'$1h']],
  ae:           [[/ä/,'e'], [/Ä/,'E']],
  'i-statt-ie': [[/i/,'ie'], [/i(?=[^e])/,'ih']],
  ai:           [[/ai/,'ei'], [/ai/,'ay']],
};

/* Wenn nichts greift: die vier Fehler, die ueber ALLEN Gruppen die
   haeufigsten sind. Sie stehen ganz hinten und nicht vorn - ein
   allgemeiner Fehler ist besser als keiner und schlechter als der
   richtige. */
const NOTFALL = [[/([bdfgklmnprst])([aeiou])/,'$1$1$2'], [/ei/,'ie'], [/ie/,'ei'],
                 [/([aeiou])/,'$1h'], [/e$/,'']];

/**
 * Drei falsche Schreibweisen zu einem Wort — immer drei, immer
 * verschieden, nie das Wort selbst.
 */
export function verschreiber(einheit){
  const w = einheit.wort;
  const aus = [];
  const nimm = (k) => {
    if (!k || k === w || aus.includes(k)) return;
    aus.push(k);
  };
  /* Die kleinen Woerter im Satz: die anderen Formen desselben Eintrags.
     Dort ist die Verwechslung grammatisch, nicht orthografisch. */
  if (einheit.gruppe === 'flektiert')
    for (const f of einheit.paar) nimm(f);
  const tafeln = [
    einheit.besonderheit ? UMFORM_MERK[einheit.besonderheit] : null,
    UMFORMUNGEN[einheit.gruppe],
    NOTFALL,
  ];
  for (const tafel of tafeln) {
    if (!tafel) continue;
    for (const [suche, ersatz] of tafel) { if (aus.length >= 3) break; nimm(w.replace(suche, ersatz)); }
    if (aus.length >= 3) break;
  }
  /* Letzte Rettung fuer sehr kurze Woerter („Ast", „ab", „ob"): erst den
     Selbstlaut verdoppeln (aab), dann einen Mitlaut. Ohne diesen Zweig
     blieben drei Lerneinheiten bei zwei Ablenkern stehen, und die Wahl
     haette drei Karten statt vier. */
  for (let i = 0; i < w.length && aus.length < 3; i++)
    if ('aeiouäöü'.includes(w[i].toLowerCase())) nimm(w.slice(0, i + 1) + w[i] + w.slice(i + 1));
  for (let i = w.length - 1; i >= 1 && aus.length < 3; i--)
    nimm(w.slice(0, i) + w[i] + w.slice(i));
  return aus.slice(0, 3);
}

/** Die drei Sätze zu einem Wort. */
export const saetzeZu = (wort) => SAETZE[wort] || [];

/**
 * Der Gegenstand, wie ihn der Bildschirm braucht — Wort, Regel, Sätze,
 * falsche Schreibweisen. EINE Stelle, an der das zusammengesetzt wird.
 */
export const gegenstandZu = (e) => ({
  id: e.id, wort: e.wort, gruppe: e.gruppe, paar: e.paar,
  besonderheit: e.besonderheit, regel: regelZu(e),
  saetze: saetzeZu(e.wort), falsch: verschreiber(e),
});
