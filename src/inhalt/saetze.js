/* Ein Satz zum Mitnehmen (D3).
 *
 * REFERENZABGLEICH (Schritt 0 der Arbeitsweise).
 *
 * Drei Vorbilder, und was sie WIRKLICH tun:
 *
 * 1. Der Kinder-Weltatlas. Neben jedem Land steht ein Kasten mit fuenf
 *    Zahlen: Flaeche, Einwohner, Hauptstadt, Waehrung, Sprache. Was er
 *    tut: er macht das Land nachschlagbar. Was er NICHT tut: einem Kind
 *    etwas geben, das es weitererzaehlt. Fuenf Zahlen behaelt niemand.
 *    Zu uebernehmen: nichts - das ist die Gegenlage.
 *
 * 2. Das Sammelkartenspiel (Panini, Pokemon). Auf der Rueckseite steht
 *    EIN Satz, und der ist immer dieselbe Sorte Satz: das Besondere.
 *    Was es tut: es gibt dem Kind einen Satz in die Hand, den es
 *    jemandem sagen kann - „weisst du, dass ...". Genau das ist die
 *    Waehrung auf dem Schulhof.
 *    Zu uebernehmen: EIN Satz, und er handelt vom Besonderen.
 *
 * 3. „Wissen macht Ah!" und die Sendung mit der Maus. Sie erklaeren nie
 *    ein Land, sie erzaehlen eine Sache: der Nil fliesst nach NORDEN.
 *    Was sie tun: sie waehlen etwas Anschauliches statt etwas
 *    Vollstaendiges - lieber ein Stiefel als eine Einwohnerzahl.
 *    Zu uebernehmen: anschaulich vor vollstaendig.
 *
 * SOLL, daraus abgeleitet - und jedes Stueck ist gemessen (`npm run
 * saetze`, in der Kette als Teil von `inhalt`):
 *
 *   a) JEDES gespielte Gebiet hat einen Satz. Einer, der nur bei den
 *      beruehmten Laendern kommt, ist eine Auszeichnung fuer manche und
 *      eine Luecke fuer die anderen - und Fiona spielt Australien.
 *   b) GENAU EIN Satz. Zwei sind ein Absatz, und ein Absatz wird nicht
 *      weitererzaehlt.
 *   c) Er nennt das Gebiet BEIM NAMEN. „Dort ist es warm" haengt an
 *      nichts; „In Aegypten stehen die Pyramiden" haengt am Namen, und
 *      der ist genau das, was gerade gelernt wurde.
 *   d) Er ist KURZ genug, um gesprochen zu werden - Fiona liest nicht,
 *      sie hoert. Gemessen an Zeichen, nicht geschaetzt.
 *
 * Was hier NICHT steht: Einwohnerzahlen, Waehrungen, Hauptstaedte. Die
 * Hauptstadt ist eine eigene Ebene; sie hier noch einmal zu nennen waere
 * dieselbe Auskunft an zwei Stellen (Regel 6: was zweimal dasteht,
 * veraltet einmal).
 */

/* Die Kennungen sind die des Vorrats: Kontinente ihre id, Bundeslaender
   ihr ISO-Kuerzel, Laender ihr Dreibuchstabencode. Eine flache Tabelle
   und keine Schachtelung je Erdteil - wer einen Satz sucht, kennt die
   Kennung, nicht den Erdteil, in dem sie steht. */
export const SAETZE = {
  // --- Die sechs Erdteile ---------------------------------------------
  afrika:      'In Afrika fließt der Nil, der längste Fluss der Erde.',
  asien:       'In Asien steht der Mount Everest, der höchste Berg der Erde.',
  australien:  'Australien ist der einzige Erdteil, der zugleich ein Land ist.',
  europa:      'Europa ist der zweitkleinste Erdteil und hat trotzdem über vierzig Länder.',
  nordamerika: 'In Nordamerika liegen die Großen Seen, die größten Süßwasserseen der Erde.',
  suedamerika: 'In Südamerika wächst der Amazonas-Regenwald, der größte Wald der Erde.',

  // --- Die sechzehn Bundeslaender --------------------------------------
  'DE-BW': 'In Baden-Württemberg liegt der Schwarzwald, und dort entspringt die Donau.',
  'DE-BY': 'Bayern ist das größte Bundesland und hat die höchsten Berge Deutschlands.',
  'DE-BE': 'Berlin ist die Hauptstadt und die größte Stadt Deutschlands.',
  'DE-BB': 'Brandenburg hat sehr viele Seen und liegt rings um Berlin.',
  'DE-HB': 'Bremen ist das kleinste Bundesland und besteht aus zwei Städten.',
  'DE-HH': 'Hamburg hat den größten Hafen Deutschlands.',
  'DE-HE': 'In Hessen liegt Frankfurt mit dem größten Flughafen Deutschlands.',
  'DE-MV': 'In Mecklenburg-Vorpommern liegt die Müritz, der größte See ganz in Deutschland.',
  'DE-NI': 'An Niedersachsen liegt das Wattenmeer — bei Ebbe kann man dort laufen.',
  'DE-NW': 'In Nordrhein-Westfalen wohnen mehr Menschen als in jedem anderen Bundesland.',
  'DE-RP': 'Durch Rheinland-Pfalz fließt der Rhein, vorbei an vielen Burgen.',
  'DE-SL': 'Das Saarland ist das kleinste Bundesland mit eigener Fläche außerhalb der Städte.',
  'DE-SN': 'In Sachsen liegt die Sächsische Schweiz mit ihren Sandsteinfelsen.',
  'DE-ST': 'In Sachsen-Anhalt steht der Brocken, der höchste Berg Norddeutschlands.',
  'DE-SH': 'Schleswig-Holstein liegt zwischen zwei Meeren: Nordsee und Ostsee.',
  'DE-TH': 'Thüringen wird das grüne Herz Deutschlands genannt und liegt in der Mitte.',

  // --- Europa ----------------------------------------------------------
  FRA: 'In Frankreich steht der Eiffelturm.',
  UKR: 'Die Ukraine ist das größte Land, das ganz in Europa liegt.',
  RUS: 'Russland ist das größte Land der Erde und reicht bis weit nach Asien.',
  CZE: 'Tschechien hat kein Meer — es ist von allen Seiten von Land umgeben.',
  DEU: 'Deutschland hat neun Nachbarländer.',
  LUX: 'Luxemburg ist eines der kleinsten Länder Europas.',
  BEL: 'In Belgien spricht man Niederländisch, Französisch und Deutsch.',
  ESP: 'Spanien liegt auf einer großen Halbinsel, fast rundum vom Meer umgeben.',
  DNK: 'Dänemark besteht aus einer Halbinsel und vielen hundert Inseln.',
  ROU: 'Durch Rumänien fließt die Donau ins Schwarze Meer.',
  POL: 'Polen ist Deutschlands Nachbar im Osten.',
  GBR: 'Das Vereinigte Königreich liegt auf Inseln — hin kommt man mit Schiff, Flugzeug oder durch einen Tunnel.',
  GRC: 'Griechenland hat mehr als tausend Inseln.',
  AUT: 'Österreich liegt mitten in den Alpen.',
  ITA: 'Italien sieht auf der Karte aus wie ein Stiefel.',
  CHE: 'In der Schweiz werden vier Sprachen gesprochen.',
  NLD: 'Ein großer Teil der Niederlande liegt tiefer als das Meer.',

  // --- Afrika ----------------------------------------------------------
  ETH: 'In Äthiopien wurde der Kaffee entdeckt.',
  KEN: 'In Kenia leben Elefanten und Löwen in großen Schutzgebieten.',
  TZA: 'In Tansania steht der Kilimandscharo, der höchste Berg Afrikas.',
  MAR: 'In Marokko liegt der Hohe Atlas — ein Gebirge mit Schnee, mitten in der Wärme.',
  COD: 'In der DR Kongo wächst der zweitgrößte Regenwald der Erde.',
  ZAF: 'Südafrika hat drei Hauptstädte statt einer.',
  SDN: 'Im Sudan treffen der Blaue und der Weiße Nil aufeinander.',
  NGA: 'In Nigeria leben mehr Menschen als in jedem anderen Land Afrikas.',
  AGO: 'Angola liegt im Süden Afrikas, am Atlantischen Ozean.',
  DZA: 'Algerien ist das größte Land Afrikas — der größte Teil davon ist Sahara.',
  UGA: 'In Uganda liegt ein Teil des Victoriasees, des größten Sees Afrikas.',
  EGY: 'In Ägypten stehen die Pyramiden, und dort fließt der Nil.',

  // --- Asien -----------------------------------------------------------
  IDN: 'Indonesien besteht aus mehr als siebzehntausend Inseln.',
  IND: 'In Indien leben mehr Menschen als in jedem anderen Land der Erde.',
  CHN: 'In China steht die Chinesische Mauer, das längste Bauwerk der Welt.',
  VNM: 'Vietnam ist lang und schmal und liegt am Meer.',
  TUR: 'Die Türkei liegt in zwei Erdteilen: in Europa und in Asien.',
  IRN: 'Im Iran gibt es große Wüsten und hohe Berge mit Schnee.',
  PAK: 'In Pakistan steht der K2, der zweithöchste Berg der Erde.',
  THA: 'Thailand ist bekannt für seine Elefanten und goldenen Tempel.',
  MMR: 'In Myanmar stehen tausende goldene Pagoden.',
  BGD: 'In Bangladesch münden zwei große Flüsse ins Meer.',
  PHL: 'Die Philippinen bestehen aus mehr als siebentausend Inseln.',
  JPN: 'Japan liegt auf Inseln, und dort bebt oft die Erde.',

  // --- Nordamerika ------------------------------------------------------
  USA: 'Die USA haben fünfzig Bundesstaaten.',
  CAN: 'Kanada ist das zweitgrößte Land der Erde.',
  MEX: 'In Mexiko wurde die Schokolade erfunden.',
  GRL: 'Grönland ist die größte Insel der Erde und fast ganz von Eis bedeckt.',

  // --- Mittelamerika ----------------------------------------------------
  CRI: 'Costa Rica hat keine Armee.',
  NIC: 'In Nicaragua liegt der größte See Mittelamerikas.',
  HTI: 'Haiti teilt sich eine Insel mit der Dominikanischen Republik.',
  DOM: 'Die Dominikanische Republik liegt auf derselben Insel wie Haiti.',
  SLV: 'El Salvador ist das kleinste Land auf dem Festland Mittelamerikas.',
  GTM: 'In Guatemala stehen alte Städte der Maya mitten im Regenwald.',
  CUB: 'Kuba ist die größte Insel der Karibik.',
  HND: 'Vor Honduras liegen lange Korallenriffe im Meer.',
  PAN: 'In Panama verbindet ein Kanal zwei Ozeane.',

  // --- Suedamerika ------------------------------------------------------
  CHL: 'Chile ist sehr lang und sehr schmal.',
  BOL: 'In Bolivien liegt der größte Salzsee der Erde.',
  PER: 'In Peru liegt Machu Picchu, eine alte Stadt hoch in den Bergen.',
  ARG: 'In Argentinien liegt Patagonien, wo der Wind fast nie aufhört.',
  SUR: 'Suriname ist das kleinste Land Südamerikas.',
  GUY: 'In Guyana stürzt ein Wasserfall über zweihundert Meter in die Tiefe.',
  BRA: 'Brasilien ist das größte Land Südamerikas.',
  URY: 'Uruguay ist eines der kleinsten Länder Südamerikas.',
  ECU: 'Durch Ecuador verläuft der Äquator — daher hat es seinen Namen.',
  COL: 'Kolumbien grenzt an zwei Ozeane.',
  PRY: 'Paraguay hat kein Meer.',
  VEN: 'In Venezuela stürzt der höchste Wasserfall der Erde herab.',

  // --- Australien und Ozeanien ------------------------------------------
  PNG: 'In Papua-Neuguinea werden mehr als achthundert Sprachen gesprochen.',
  AUS: 'In Australien leben Kängurus und Koalas — wild sonst nirgends.',
  NZL: 'Neuseeland besteht aus zwei großen Inseln.',
};

/**
 * Der Satz zu einem Gebiet - oder `null`, wenn es keinen gibt.
 *
 * Kein Ersatzsatz, keine Notausgabe. Ein „Dieses Land ist schoen" waere
 * schlimmer als gar nichts: es sieht auf dem Bildschirm aus wie ein
 * Satz zum Mitnehmen und ist keiner, und das Tor koennte die Luecke
 * nicht mehr von einem Treffer unterscheiden - eine Pruefung, die eine
 * Luecke fuer einen Treffer haelt, meldet nie etwas (Regel 1).
 */
export function satzZu(id) {
  return SAETZE[id] || null;
}
