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
  europa:[
    { a3:'RUS', name:'Russland', rang:1, aussprache:['russland','ruslant'],
      satz:'So groß, dass es auf zwei Kontinente passt.' },
    { a3:'DEU', name:'Deutschland', rang:2, aussprache:['deutschland','doitschland'] },
    { a3:'GBR', name:'Vereinigtes Königreich', rang:3, aliasse:['England','Großbritannien','Britannien'],
      aussprache:['england','großbritannien','vereinigtes königreich'] },
    { a3:'FRA', name:'Frankreich', rang:4, aussprache:['frankreich','frangreich'] },
    { a3:'ITA', name:'Italien', rang:5, aussprache:['italien','italjen'] },
    { a3:'ESP', name:'Spanien', rang:6, aussprache:['spanien','spanjen'] },
    { a3:'UKR', name:'Ukraine', rang:7, aussprache:['ukraine','ukrajine'] },
    { a3:'POL', name:'Polen', rang:8, aussprache:['polen','pohlen'] },
    { a3:'ROU', name:'Rumänien', rang:9, aliasse:['Rumaenien'], aussprache:['rumänien','rumaenien'] },
    { a3:'NLD', name:'Niederlande', rang:10, aliasse:['Holland'], aussprache:['niederlande','holland'] },
    { a3:'BEL', name:'Belgien', rang:11, aussprache:['belgien','belgjen'] },
    { a3:'GRC', name:'Griechenland', rang:12, aussprache:['griechenland','griechnland'] },
  ],
  nordamerika:[
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
