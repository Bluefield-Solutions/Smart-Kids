// Die Fakten. Kein Code, nur Daten - bewacht vom Tor `inhalt`.
//
// aussprache[] ist der Korpus fuer den Sprachabgleich: wie Kinder es sagen
// und wie eine Erkennung es hoert. Er waechst mit echten Aufnahmen (M4);
// was hier steht, ist die ERFUNDENE Haelfte - sie dient dem Einstellen,
// nicht dem Beweis (Befund L10).
//
// ablenker[] ist bei Ebene 4 das Eigentliche: fuenf Bundeslaender haben eine
// Hauptstadt, die NICHT ihre groesste Stadt ist. Dort sitzt der Irrtum, den
// fast jeder Erwachsene teilt.

export const STAND = { jahr: 2025, quelle: 'Natural Earth 1:10m / 1:50m, Einwohnerzahlen 2025' };

// Antarktika ist KEIN Kontinent in diesem Spiel - nachgefragt und
// entschieden, nicht vergessen.
//
// Auf der Weltkarte (Natural-Earth-Projektion) wird die Antarktis zu einem
// breiten Band am unteren Rand, das ueber die ganze Kartenbreite laeuft: als
// Umriss unkenntlich, und beim Ziehen kaum vom Kartenrand zu unterscheiden.
// Sie bekam deshalb eine eigene polare Aufsicht - eine zweite Kartenart fuer
// ein einziges Gebiet, und ein Kind, das gerade sechs Umrisse nebeneinander
// gelernt hat, sah bei der siebten ploetzlich die Welt von oben.
//
// Sechs Kontinente, eine Karte. Die polare Aufsicht liegt weiter in
// `tools/backen-antarktika.mjs`, falls sie einmal gebraucht wird.
export const KONTINENTE = [
  { id:'europa', name:'Europa', aliasse:['Europäa'],
    aussprache:['euopa','oiropa','europa','eropa'], runde:1 },
  { id:'afrika', name:'Afrika', aliasse:[],
    aussprache:['afrikaa','afika','affrika'], runde:1 },
  { id:'australien', name:'Australien und Ozeanien', aliasse:['Australien','Ozeanien'],
    aussprache:['australjen','austraalien','australiä','aus straßen','australien'], runde:1 },
  { id:'suedamerika', name:'Südamerika', aliasse:['Sued Amerika'],
    aussprache:['süd amerika','suedamerika','südamerka'], runde:1 },
  { id:'nordamerika', name:'Nordamerika', aliasse:['Amerika','Nord Amerika'],
    aussprache:['nord amerika','amerika','nordamerka'], runde:2 },
  { id:'asien', name:'Asien', aliasse:[],
    aussprache:['asjen','aasien','asien'], runde:2 },
];

/** Ebene 2. rang 1..5; Fiona sieht 1..3, Lea 1..5. */
export const LAENDER = {
  asien:[
    { a3:'IND', name:'Indien', rang:1, aussprache:['indien','indjen'] },
    { a3:'CHN', name:'China', rang:2, aussprache:['china','kina','schina'] },
    { a3:'IDN', name:'Indonesien', rang:3, aussprache:['indonesien','indonesjen'] },
    { a3:'PAK', name:'Pakistan', rang:4, aussprache:['pakistan','packistan'] },
    { a3:'BGD', name:'Bangladesch', rang:5, aliasse:['Bangladesh'], aussprache:['bangladesch','bangladesh'] },
    { a3:'JPN', name:'Japan', rang:6, aussprache:['japan','jappan'] },
    { a3:'PHL', name:'Philippinen', rang:7, aliasse:['Philippinen'], aussprache:['philippinen','filippinen'] },
    { a3:'VNM', name:'Vietnam', rang:8, aussprache:['vietnam','wietnam'] },
    { a3:'TUR', name:'Türkei', rang:9, aliasse:['Tuerkei'], aussprache:['türkei','tuerkei'] },
    { a3:'IRN', name:'Iran', rang:10, aussprache:['iran','iiran'] },
    { a3:'THA', name:'Thailand', rang:11, aussprache:['thailand','tailand'] },
    { a3:'MMR', name:'Myanmar', rang:12, aliasse:['Birma'], aussprache:['myanmar','birma'] },
  ],
  afrika:[
    { a3:'NGA', name:'Nigeria', rang:1, aussprache:['nigeria','nigeeria'] },
    { a3:'ETH', name:'Äthiopien', rang:2, aliasse:['Aethiopien'], aussprache:['ätiopien','etiopien'] },
    { a3:'EGY', name:'Ägypten', rang:3, aliasse:['Aegypten'], aussprache:['ägüpten','egypten','ägypten'] },
    { a3:'COD', name:'DR Kongo', rang:4, aliasse:['Kongo','Demokratische Republik Kongo'], aussprache:['kongo','de er kongo'] },
    { a3:'TZA', name:'Tansania', rang:5, aliasse:['Tanzania'], aussprache:['tansania','tanzania'] },
    { a3:'ZAF', name:'Südafrika', rang:6, aliasse:['Suedafrika'], aussprache:['südafrika','suedafrika'] },
    { a3:'KEN', name:'Kenia', rang:7, aliasse:['Kenya'], aussprache:['kenia','kenya'] },
    { a3:'UGA', name:'Uganda', rang:8, aussprache:['uganda','ugandaa'] },
    { a3:'DZA', name:'Algerien', rang:9, aussprache:['algerien','algerjen'] },
    { a3:'SDN', name:'Sudan', rang:10, aussprache:['sudan','suudan'] },
    { a3:'MAR', name:'Marokko', rang:11, aliasse:['Marocco'], aussprache:['marokko','marocco'] },
    { a3:'AGO', name:'Angola', rang:12, aussprache:['angola','anggola'] },
  ],
  /* Europa: Deutschland und dann SEINE NACHBARN.
   *
   * `rang` ist keine Rangliste, sondern eine Lerntiefe: ein Profil spielt
   * `rang <= laenderTiefe`. Bis D2c war die Reihenfolge die
   * Einwohnerzahl, und fuenf der neun Nachbarn Deutschlands kamen ueber-
   * haupt nicht vor - Daenemark, Luxemburg, die Schweiz, Oesterreich und
   * Tschechien. Fuer ein Kind in Deutschland ist das die falsche
   * Reihenfolge: die Ukraine ist groesser als Oesterreich, aber
   * Oesterreich ist nebenan.
   *
   * Deshalb stehen auf 4 bis 12 GENAU die neun Nachbarn, nach
   * Einwohnerzahl geordnet. Davor die drei, die schon vorher zuerst kamen
   * (Russland, Deutschland, Vereinigtes Koenigreich) - sie bleiben, wo
   * sie waren, damit Fiona mit ihrer Tiefe 3 dieselben drei behaelt wie
   * gestern. Dahinter der Rest, ebenfalls nach Einwohnerzahl.
   *
   * Niemand verliert etwas: Lea steht jetzt auf 13 statt 5 und hat damit
   * alles, was sie hatte (Italien ist die 13), plus die neun Nachbarn.
   *
   * HAUPTSTAEDTE: die fuenf Neuen haben keine. Sie werden in
   * `tools/backen-laender.mjs` nur fuer Laender mit `rang` gebacken, und
   * ihre Lage kommt aus den Natural-Earth-Rohdaten - 400 MB, die zum
   * Bauen und Spielen niemand braucht. Ein `npm run backen` mit den
   * Rohdaten traegt sie nach; bis dahin fehlen die fuenf auf der Ebene
   * „Hauptstaedte in Europa" und stehen nur auf der Laenderebene. Das ist
   * kein Zufall, sondern haengt an einer Zeile: `if (!stueck.rang)
   * continue;`. */
  europa:[
    { a3:'RUS', name:'Russland', rang:1, aussprache:['russland','ruslant'],
      satz:'So groß, dass es auf zwei Kontinente passt.' },
    { a3:'DEU', name:'Deutschland', rang:2, aussprache:['deutschland','doitschland'] },
    { a3:'GBR', name:'Vereinigtes Königreich', rang:3, aliasse:['England','Großbritannien','Britannien'],
      aussprache:['england','großbritannien','vereinigtes königreich'],
      /* `wovon` ist die Praepositionalform fuer die Hauptstadtfrage.
       *
       * Die meisten Laendernamen sind im Deutschen artikellos - „die
       * Hauptstadt von Polen" stimmt einfach. Vier nicht, und der erste
       * Anlauf fragte prompt nach der „Hauptstadt von Vereinigtes
       * Koenigreich". Deshalb steht die Form dort, wo sie eine
       * Eigenschaft des Landes ist, und nur bei den vieren; ueberall
       * sonst wird sie aus dem Namen abgeleitet. */
      wovon:'vom Vereinigten Königreich' },
    /* --- Die neun Nachbarn, nach Einwohnerzahl (D2c) ----------------- *
     *
     * `nachbarDE` steht an den Laendern selbst, nicht als Liste von
     * Kennungen im Abzeichenmodul: dieselbe Regel wie `stadtstaat` bei
     * den Bundeslaendern. Wer ein zehntes Nachbarland eintraegt, setzt
     * die Fahne - und das Abzeichen zaehlt von allein weiter. */
    { a3:'FRA', name:'Frankreich', rang:4, nachbarDE:true, aussprache:['frankreich','frangreich'] },
    { a3:'POL', name:'Polen', rang:5, nachbarDE:true, aussprache:['polen','pohlen'] },
    { a3:'NLD', name:'Niederlande', rang:6, nachbarDE:true, aliasse:['Holland'], aussprache:['niederlande','holland'],
      wovon:'von den Niederlanden' },
    { a3:'BEL', name:'Belgien', rang:7, nachbarDE:true, aussprache:['belgien','belgjen'] },
    { a3:'CZE', name:'Tschechien', rang:8, nachbarDE:true, aliasse:['Tschechische Republik','Tschechei'],
      aussprache:['tschechien','tschechjen','tschechei'] },
    { a3:'AUT', name:'Österreich', rang:9, nachbarDE:true, aliasse:['Oesterreich'],
      aussprache:['österreich','oesterreich','östereich'] },
    { a3:'CHE', name:'Schweiz', rang:10, nachbarDE:true, aliasse:['Die Schweiz'],
      aussprache:['schweiz','die schweiz','schwaiz'],
      wovon:'von der Schweiz' },
    { a3:'DNK', name:'Dänemark', rang:11, nachbarDE:true, aliasse:['Daenemark'],
      aussprache:['dänemark','daenemark','dehnemark'] },
    { a3:'LUX', name:'Luxemburg', rang:12, nachbarDE:true, aliasse:[],
      aussprache:['luxemburg','luxemburch','luxenburg'] },
    /* --- Und der Rest, ebenfalls nach Einwohnerzahl ------------------ */
    { a3:'ITA', name:'Italien', rang:13, aussprache:['italien','italjen'] },
    { a3:'ESP', name:'Spanien', rang:14, aussprache:['spanien','spanjen'] },
    { a3:'UKR', name:'Ukraine', rang:15, aussprache:['ukraine','ukrajine'],
      wovon:'von der Ukraine' },
    { a3:'ROU', name:'Rumänien', rang:16, aliasse:['Rumaenien'], aussprache:['rumänien','rumaenien'] },
    { a3:'GRC', name:'Griechenland', rang:17, aussprache:['griechenland','griechnland'] },
  ],  nordamerika:[
    { a3:'USA', name:'USA', rang:1, aliasse:['Vereinigte Staaten','Amerika'], aussprache:['u es a','usa','amerika'] },
    { a3:'MEX', name:'Mexiko', rang:2, aliasse:['Mexico'], aussprache:['mexiko','mexico'] },
    { a3:'CAN', name:'Kanada', rang:3, aliasse:['Canada'], aussprache:['kanada','canada'] },
    { a3:'GTM', name:'Guatemala', rang:4, aussprache:['guatemala','gwatemala'] },
    { a3:'HTI', name:'Haiti', rang:5, aussprache:['haiti','haitii'] },
    { a3:'CUB', name:'Kuba', rang:6, aliasse:['Cuba'], aussprache:['kuba','cuba'] },
    { a3:'DOM', name:'Dominikanische Republik', rang:7, aliasse:['Dominikanische Rep.'], aussprache:['dominikanische republik','dominikanische rep'] },
    { a3:'HND', name:'Honduras', rang:8, aussprache:['honduras','hondurass'] },
    { a3:'NIC', name:'Nicaragua', rang:9, aliasse:['Nikaragua'], aussprache:['nicaragua','nikaragua'] },
    { a3:'SLV', name:'El Salvador', rang:10, aliasse:['Salvador'], aussprache:['el salvador','salvador'] },
    { a3:'CRI', name:'Costa Rica', rang:11, aliasse:['Kostarika'], aussprache:['costa rica','kostarika'] },
    { a3:'PAN', name:'Panama', rang:12, aussprache:['panama','pannama'] },
  ],
  suedamerika:[
    { a3:'BRA', name:'Brasilien', rang:1, aussprache:['brasilien','brasiljen'] },
    { a3:'COL', name:'Kolumbien', rang:2, aliasse:['Colombia'], aussprache:['kolumbien','kolumbjen'] },
    { a3:'ARG', name:'Argentinien', rang:3, aussprache:['argentinien','argentinjen'] },
    { a3:'PER', name:'Peru', rang:4, aussprache:['peru','perru'] },
    { a3:'VEN', name:'Venezuela', rang:5, aussprache:['venezuela','wenezuela'] },
    { a3:'CHL', name:'Chile', rang:6, aussprache:['chile','schile'] },
    { a3:'ECU', name:'Ecuador', rang:7, aliasse:['Equador'], aussprache:['ecuador','equador'] },
    { a3:'BOL', name:'Bolivien', rang:8, aussprache:['bolivien','bolivjen'] },
    { a3:'PRY', name:'Paraguay', rang:9, aussprache:['paraguay','paragwai'] },
    { a3:'URY', name:'Uruguay', rang:10, aussprache:['uruguay','urugwai'] },
    { a3:'GUY', name:'Guyana', rang:11, aussprache:['guyana','gujana'] },
    { a3:'SUR', name:'Suriname', rang:12, aliasse:['Surinam'], aussprache:['suriname','surinam'] },
  ],
};

/**
 * Ebene 4. Die fuenf Faellen, bei denen die Hauptstadt NICHT die groesste
 * Stadt ist - dort sitzt der Lernwert. Ein Ablenker, auf den niemand
 * hereinfaellt, ist keiner.
 */
export const HAUPTSTADT_ABLENKER = {
  'DE-HE':['Frankfurt am Main','Kassel'],
  'DE-NW':['Köln','Dortmund'],
  'DE-SN':['Leipzig','Chemnitz'],
  'DE-ST':['Halle (Saale)','Dessau'],
  'DE-MV':['Rostock','Stralsund'],
  'DE-BW':['Karlsruhe','Mannheim'],
  'DE-BY':['Nürnberg','Augsburg'],
  'DE-NI':['Braunschweig','Osnabrück'],
  'DE-RP':['Koblenz','Ludwigshafen'],
  'DE-SH':['Lübeck','Flensburg'],
  'DE-TH':['Jena','Weimar'],
  'DE-BB':['Cottbus','Brandenburg an der Havel'],
  'DE-SL':['Neunkirchen','Homburg'],
};
/** Die fuenf, bei denen der Ablenker die GROESSTE Stadt ist. */
export const ECHTE_FALLEN = ['DE-HE','DE-NW','DE-SN','DE-ST','DE-MV'];

/**
 * Ebene „Hauptstädte in Europa" (R6). Zwei falsche Staedte je Land.
 *
 * Die HAUPTSTADT steht hier nicht: sie kommt aus Natural Earth
 * (`Admin-0 capital`, deutscher Name aus `NAME_DE`) und wird in
 * `tools/backen-laender.mjs` an das Land gebacken - dieselbe Quelle wie
 * bei den sechzehn Landeshauptstaedten.
 *
 * Die ABLENKER stehen hier, von Hand, und das ist eine Entscheidung
 * gegen eine naheliegende Ableitung. „Die zwei groessten Staedte ausser
 * der Hauptstadt" waere aus denselben Daten zu rechnen - gemessen liefert
 * das aber Unsinn:
 *
 *   - `POP_MAX` ist die BALLUNGSRAUM-Zahl. In Polen steht damit Katowice
 *     (2,7 Mio) vor Warschau (1,7 Mio); in Deutschland Stuttgart und
 *     Frankfurt vor Hamburg.
 *   - `NAME_DE` traegt historische Exonyme, die heute niemand mehr sagt:
 *     „Klausenburg" fuer Cluj-Napoca, „Galatz" fuer Galați, „Luettich"
 *     fuer Liege. Als Ablenker waeren sie nicht schwer, sondern raetselhaft.
 *
 * Ein Ablenker, auf den niemand hereinfaellt, ist keiner - und einer, den
 * niemand kennt, erst recht nicht.
 *
 * Wo ein REGIERUNGSSITZ von der Hauptstadt abweicht, steht er VORN. Das
 * ist die eine echte Falle dieser Ebene, und sie kommt aus den Daten:
 * Natural Earth fuehrt Den Haag als `Admin-0 capital alt`. Das Tor
 * `inhalt` prueft, dass die Liste hier und die Daten dort uebereinstimmen.
 */
export const HAUPTSTADT_ABLENKER_EUROPA = {
  RUS:['Sankt Petersburg','Nowosibirsk'],
  DEU:['Hamburg','München'],
  GBR:['Manchester','Birmingham'],
  FRA:['Marseille','Lyon'],
  ITA:['Mailand','Neapel'],
  ESP:['Barcelona','Sevilla'],
  UKR:['Charkiw','Odessa'],
  POL:['Krakau','Danzig'],
  ROU:['Cluj-Napoca','Konstanza'],
  NLD:['Den Haag','Rotterdam'],
  BEL:['Antwerpen','Gent'],
  GRC:['Thessaloniki','Patras'],
};
