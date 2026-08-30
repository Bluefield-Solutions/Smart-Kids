// Ebene 2: je Kontinent die einwohnerstaerksten Laender - und der ganze
// Kontinent als Umgebung.
//
// Befund G8 aus dem Audit: Zeigt man nur die fuenf Ziele, lernt das Kind
// eine Karte, die es nicht gibt, und kann durch Ausschluss raten. Also wird
// der ganze Kontinent gezeichnet, die Ziele hervorgehoben.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import * as d3 from 'd3-geo';
import { STUFEN, rohLesen, AUS, HAUSDORFF_GRENZE, ringe, shaper, bisAufGrenze,
         passe, svgPfad, teileUndLoecher, inselnFiltern } from './geo-backen.mjs';

const EUROPA_MASKE = [[
  [-32,36],[-12,34],[10,34],[26,34],[28,35],[41,37],[41,43],[47,44],
  [52,47],[52,51],[59,55],[62,60],[66,68],[60,70],[40,70],[32,72],
  [-10,72],[-32,66],[-32,36]
]];
fs.writeFileSync('/tmp/europa-maske.json', JSON.stringify(
  { type:'FeatureCollection', features:[{ type:'Feature', properties:{},
    geometry:{ type:'Polygon', coordinates:EUROPA_MASKE } }] }));

// Stand 2025. Reihenfolge = Rang. Die ersten DREI sind Fionas Menge.
/* Zwölf Länder je Kontinent, seit Eltern dazukam (R4).
 *
 * Die ersten FÜNF stehen unverändert und in unveränderter Reihenfolge:
 * Fiona spielt Rang 1 bis 3, Lea 1 bis 5. Wer sie umsortiert, ändert,
 * was die Kinder üben - und zwar unbemerkt, weil ihr Leitner-Stand an
 * der Kennung hängt und nicht am Rang.
 *
 * Die Ränge 6 bis 12 kommen nach EINWOHNERZAHL dazu. Das ist keine
 * Bequemlichkeit, sondern die einzige Ordnung, die sich begründen lässt:
 * bekannter heißt leichter, und die Reihenfolge muss steigen, sonst ist
 * `laenderTiefe` keine Schwierigkeitsstufe, sondern eine Zufallsauswahl.
 *
 * Was das kostet: NICHTS an Geometrie. Jedes Land des Kontinents wird
 * ohnehin gebacken und ausgeliefert - die namenlosen als `umgebung`,
 * damit die Karte vollständig aussieht. Bei Europa sind das 220 von 314
 * KB. Sieben Länder mehr benennen heißt, sieben Formen von `umgebung`
 * nach `laender` zu schieben; dazu kommen nur Name, Rang und Anker.
 *
 * Das Konzept hatte das Gegenteil vermutet („zwölf Länder sprengen das
 * Budget voraussichtlich"). Gemessen stimmt es nicht - und die Messung
 * stand die ganze Zeit im gebauten Bündel.
 */
const EBENEN = [
  { id:'asien', name:'Asien', ne:'Asia', projektion:'kegel',
    ziele:[['IND','Indien'],['CHN','China'],['IDN','Indonesien'],['PAK','Pakistan'],['BGD','Bangladesch'],
           ['JPN','Japan'],['PHL','Philippinen'],['VNM','Vietnam'],['TUR','Türkei'],['IRN','Iran'],
           ['THA','Thailand'],['MMR','Myanmar']] },
  { id:'afrika', name:'Afrika', ne:'Africa', projektion:'azimutal',
    ziele:[['NGA','Nigeria'],['ETH','Äthiopien'],['EGY','Ägypten'],['COD','DR Kongo'],['TZA','Tansania'],
           ['ZAF','Südafrika'],['KEN','Kenia'],['UGA','Uganda'],['DZA','Algerien'],['SDN','Sudan'],
           ['MAR','Marokko'],['AGO','Angola']] },
  /* `hauptstaedte` backt zusaetzlich die Lage der Hauptstadt je Zielland
   * (R6). Nur hier, nicht ueberall: es sind zwoelf Punkte zu je rund
   * 45 Byte, und fuer die vier anderen Kontinente gibt es keine Ebene,
   * die sie braucht. Ein Vorrat, den niemand liest, ist Ballast im
   * Nachladepaket. */
  { id:'europa', name:'Europa', ne:'Europe', projektion:'kegel', klippen:true,
    hauptstaedte:true,
    ziele:[['RUS','Russland'],['DEU','Deutschland'],['GBR','Vereinigtes Königreich'],['FRA','Frankreich'],['ITA','Italien'],
           ['ESP','Spanien'],['UKR','Ukraine'],['POL','Polen'],['ROU','Rumänien'],['NLD','Niederlande'],
           ['BEL','Belgien'],['GRC','Griechenland']] },
  { id:'nordamerika', name:'Nordamerika', ne:'North America', projektion:'kegel',
    ziele:[['USA','USA'],['MEX','Mexiko'],['CAN','Kanada'],['GTM','Guatemala'],['HTI','Haiti'],
           ['CUB','Kuba'],['DOM','Dominikanische Republik'],['HND','Honduras'],['NIC','Nicaragua'],
           ['SLV','El Salvador'],['CRI','Costa Rica'],['PAN','Panama']] },
  { id:'suedamerika', name:'Südamerika', ne:'South America', projektion:'azimutal',
    ziele:[['BRA','Brasilien'],['COL','Kolumbien'],['ARG','Argentinien'],['PER','Peru'],['VEN','Venezuela'],
           ['CHL','Chile'],['ECU','Ecuador'],['BOL','Bolivien'],['PRY','Paraguay'],['URY','Uruguay'],
           ['GUY','Guyana'],['SUR','Suriname']] },
];

const roh = rohLesen('ne_10m_admin_0_countries');

/* Die Hauptstaedte - aus den Daten, nicht aus meinem Kopf.
 *
 * Natural Earth fuehrt sie als `Admin-0 capital` und traegt den deutschen
 * Namen selbst (`NAME_DE`): Moskau, Kiew, Bukarest, Bruessel. Das ist
 * dieselbe Quelle, aus der die sechzehn Landeshauptstaedte kommen - und
 * dieselbe Regel wie ueberall: das Soll kommt aus der Referenz.
 *
 * `Admin-0 capital alt` ist der REGIERUNGSSITZ, wo er nicht in der
 * Hauptstadt liegt. In Europa trifft das genau ein Land: die
 * Niederlande, Den Haag gegen Amsterdam. Das ist die eine echte Falle
 * dieser Ebene, und die Daten sagen sie an - ich musste sie nicht
 * behaupten. */
const orte = rohLesen('ne_10m_populated_places');
const hauptstadtVon = new Map();
const sitzVon = new Map();
for (const f of orte.features) {
  const q = f.properties;
  const ziel = q.FEATURECLA === 'Admin-0 capital' ? hauptstadtVon
             : q.FEATURECLA === 'Admin-0 capital alt' ? sitzVon : null;
  if (!ziel || ziel.has(q.ADM0_A3)) continue;
  ziel.set(q.ADM0_A3, { name: q.NAME_DE || q.NAME, lonlat: f.geometry.coordinates });
}

/** G7: Standardparallelen bei 1/6 und 5/6 der Breitenausdehnung. */
function projektionFuer(art, geo) {
  const b = d3.geoBounds(geo);
  const [lo0,la0] = b[0], [lo1,la1] = b[1];
  const mitte = -(lo0 + lo1) / 2;
  if (art === 'azimutal')
    return d3.geoAzimuthalEqualArea().rotate([mitte, -(la0+la1)/2]);
  return d3.geoConicEqualArea()
    .parallels([la0 + (la1-la0)/6, la0 + (la1-la0)*5/6]).rotate([mitte, 0]);
}

const bericht = { ebene:'laender', quelle:'Natural Earth 1:10m admin_0', standJahr:2025,
                  grenze:HAUSDORFF_GRENZE, kontinente:[] };
const ausgabe = {};
let gesamtGz = 0;
const fehlendeStaedte = [];

for (const k of EBENEN) {
  const ziele = new Map(k.ziele);
  let geo = { type:'FeatureCollection', features: roh.features
    .filter(f => f.properties.CONTINENT === k.ne)
    .map(f => ({ type:'Feature',
      properties:{ a3:f.properties.ADM0_A3, name: ziele.get(f.properties.ADM0_A3) || null,
                   rang: [...ziele.keys()].indexOf(f.properties.ADM0_A3) + 1 || null },
      geometry:f.geometry })) };
  if (k.klippen) geo = await shaper(geo, '-clip /tmp/europa-maske.json');

  const fehlend = [...ziele.keys()].filter(a3 => !geo.features.some(f=>f.properties.a3===a3));
  if (fehlend.length) throw new Error(`${k.name}: Zielländer nicht gefunden: ${fehlend.join(', ')}`);

  // G3: Topologie ueber ALLE Laender des Kontinents, vor dem Vereinfachen.
  const topo = await shaper(geo, '-clean');
  const zeilen = {};
  const perStufe = [];
  for (const st of STUFEN) {
    const projSt = passe(projektionFuer(k.projektion, topo), topo, st.breitePx);
    const g = inselnFiltern(topo, projSt, 4);
    const proj = passe(projektionFuer(k.projektion, g.geo), g.geo, st.breitePx);
    const r = await bisAufGrenze(g.geo, proj, HAUSDORFF_GRENZE);
    const skala = 1000 / st.breitePx;
    const stuecke = r.geo.features.map(f => {
      const tl = teileUndLoecher(f);
      return { a3:f.properties.a3, name:f.properties.name, rang:f.properties.rang,
               teile:tl.teile, loecher:tl.loecher,
               pfad: svgPfad({type:'FeatureCollection',features:[f]}, proj, skala) };
    }).filter(s => s.pfad);
    /* Die Stadtlage entsteht in DERSELBEN Projektion wie die Umrisse
     * dieser Stufe - sonst laege der Punkt neben dem Land (Regel 12: jede
     * Zahl traegt ihre Messstelle).
     *
     * Nur `grob`: das ist die Stufe, die `prototyp/bauen.mjs` ins Buendel
     * legt und die das Spiel zeichnet. Die anderen beiden werden hier
     * gebacken und nirgends gelesen; ein Punkt darin waere ein Vorrat
     * ohne Leser. */
    if (k.hauptstaedte && st.name === 'grob') for (const stueck of stuecke) {
      if (!stueck.rang) continue;
      const hs = hauptstadtVon.get(stueck.a3);
      if (!hs) { fehlendeStaedte.push(stueck.a3); continue; }
      const punkt = proj(hs.lonlat);
      if (!punkt) { fehlendeStaedte.push(stueck.a3); continue; }
      stueck.hauptstadt = hs.name;
      stueck.ort = [+(punkt[0]*skala).toFixed(1), +(punkt[1]*skala).toFixed(1)];
      const sitz = sitzVon.get(stueck.a3);
      if (sitz) stueck.regierungssitz = sitz.name;
    }
    zeilen[st.name] = stuecke;
    const j = JSON.stringify(stuecke);
    const gz = zlib.gzipSync(Buffer.from(j)).length;
    perStufe.push({ stufe:st.name, laender:stuecke.length, hausdorffPx:+r.hausdorff.toFixed(3),
                    punkte: ringe(r.geo).reduce((a,x)=>a+x.length,0), gzip:gz });
    if (st.name === 'mittel') gesamtGz += gz;
  }
  ausgabe[k.id] = zeilen;
  bericht.kontinente.push({ id:k.id, name:k.name, ziele:k.ziele.map(z=>z[1]), stufen:perStufe });
  const m = perStufe[1];
  console.log(`  ${k.name.padEnd(14)} ${String(m.laender).padStart(3)} Länder  `
    + `Hausdorff ${m.hausdorffPx.toFixed(2)} px  ${(m.gzip/1024).toFixed(1).padStart(6)} KB gz (mittel)`);
}

fs.mkdirSync(AUS,{recursive:true});
for (const [id, zeilen] of Object.entries(ausgabe))
  for (const [stufe, s] of Object.entries(zeilen))
    fs.writeFileSync(path.join(AUS,`laender-${id}.${stufe}.js`),
      `// ERZEUGT von tools/backen-laender.mjs - nicht von Hand aendern.\n`+
      `export const LAENDER_${id.toUpperCase()}_${stufe.toUpperCase()} = ${JSON.stringify(s)};\n`);
if (fehlendeStaedte.length)
  throw new Error(`Keine Hauptstadt gefunden fuer: ${fehlendeStaedte.join(', ')} — `
    + 'die Ebene „Hauptstädte in Europa" haette dort eine leere Antwort.');
{
  const mit = ausgabe.europa?.grob?.filter(x => x.hauptstadt) || [];
  bericht.hauptstaedte = { stufe:'grob', anzahl:mit.length,
    regierungssitze: mit.filter(x=>x.regierungssitz).map(x=>`${x.name}: ${x.regierungssitz}`) };
  console.log(`\n  Hauptstädte in Europa: ${mit.length} Lagen (Stufe grob, die das Spiel zeichnet)`);
  console.log(`    ${mit.map(x=>x.hauptstadt).join(' · ')}`);
  for (const x of mit.filter(x=>x.regierungssitz))
    console.log(`    Regierungssitz abweichend: ${x.name} — ${x.regierungssitz} statt ${x.hauptstadt}`);
}
fs.writeFileSync(path.join(AUS,'bericht-laender.json'), JSON.stringify(bericht,null,2));
console.log(`\n  Summe mittlere Stufe über alle fünf Kontinente: ${(gesamtGz/1024).toFixed(1)} KB gzip`);
