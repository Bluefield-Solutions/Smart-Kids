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
import { LAENDER } from '../src/inhalt/erdkunde.js';

const EUROPA_MASKE = [[
  [-32,36],[-12,34],[10,34],[26,34],[28,35],[41,37],[41,43],[47,44],
  [52,47],[52,51],[59,55],[62,60],[66,68],[60,70],[40,70],[32,72],
  [-10,72],[-32,66],[-32,36]
]];
fs.writeFileSync('/tmp/europa-maske.json', JSON.stringify(
  { type:'FeatureCollection', features:[{ type:'Feature', properties:{},
    geometry:{ type:'Polygon', coordinates:EUROPA_MASKE } }] }));

/* Der Ausschnitt Mittelamerika - ein Rechteck in Grad.
 *
 * WARUM ein eigener Ausschnitt und keine Nebenkarte in der Ecke: gemessen.
 * Auf 844 x 390 hat die Nordamerikakarte 362 x 288 Punkte, und darin sind
 * die neun kleinen Laender zwischen 4,1 (El Salvador) und 16,9 Punkten
 * (Kuba) gross - neun von zwoelf unter der Fingergrenze von 44. Die Frage
 * war, wie gross ein Ausschnitt sein muss, damit sie ohne Nadel zu treffen
 * sind. Gerechnet mit derselben Projektion, die hier backt:
 *
 *     Kasten     GTM HTI CUB DOM HND NIC SLV CRI PAN   >=44  >=20
 *     120 x  90   16  10  39  14  23  19   9  22  23      0     4
 *     260 x 195   35  23  85  29  51  41  20  47  49      4     8
 *     362 x 288   49  31 118  41  71  57  27  66  69      6     9
 *     480 x 288   57  36 136  47  82  66  32  76  79      7     9
 *     600 x 450   81  52 196  68 117  95  45 110 114      9     9
 *
 * Eine Nebenkarte, die in eine Ecke passt, ist 120 bis 180 Punkte breit -
 * dort ist KEIN einziges Land zu treffen. Erst der ganze Kartenkasten
 * bringt alle neun ueber 20 Punkte, und damit ueber die Schwelle, ab der
 * die App keine Nadel mehr setzt. Der Ausschnitt musste also die Karte
 * werden, nicht ein Kasten darin - und eine eigene Karte ist eine eigene
 * Ebene.
 *
 * Das Rechteck laesst absichtlich Mexiko und Kolumbien angeschnitten: sie
 * sind hier Umgebung, kein Ziel, und ein Kartenrand mitten durch ein
 * Nachbarland ist das, was jeder Atlas an dieser Stelle auch tut. Alle
 * NEUN Ziele liegen vollstaendig innerhalb (gemessen: lon -92,2 bis -60,5,
 * lat 5,5 bis 26,9). */
const MITTELAMERIKA_MASKE = [[
  [-93,5.5],[-62,5.5],[-62,26.5],[-93,26.5],[-93,5.5]
]];
fs.writeFileSync('/tmp/mittelamerika-maske.json', JSON.stringify(
  { type:'FeatureCollection', features:[{ type:'Feature', properties:{},
    geometry:{ type:'Polygon', coordinates:MITTELAMERIKA_MASKE } }] }));

/* OZEANIEN endet bei 180 Grad - und zwar, weil die Erde dort aufhoert,
 * gerechnet zu werden.
 *
 * Der Erdteil reicht in den Rohdaten ueber die Datumsgrenze: Fidschi,
 * Kiribati und Tonga liegen zu beiden Seiten von 180. Der Rahmen des
 * Erdteils spannt sich dadurch ueber fast die ganze Kugel, die azimutale
 * Projektion setzt ihren Mittelpunkt mitten in den Pazifik - und
 * herausgekommen ist eine Karte, auf der AUSTRALIEN GAR NICHT ZU SEHEN
 * war, nur Neuseeland und ein gruener Splitter.
 *
 * Die Maske schneidet auf 110 bis 180 Grad Ost und 50 Grad Sued bis zum
 * Aequator. Darin liegen die drei Ziele vollstaendig (Australien 113-154,
 * Papua-Neuguinea 141-156, Neuseeland 166-179); die Inseln jenseits der
 * Grenze fallen weg. Sie waeren auf dieser Karte ohnehin Punkte. */
const OZEANIEN_MASKE = [[
  [110,-50],[180,-50],[180,0],[110,0],[110,-50]
]];
fs.writeFileSync('/tmp/ozeanien-maske.json', JSON.stringify(
  { type:'FeatureCollection', features:[{ type:'Feature', properties:{},
    geometry:{ type:'Polygon', coordinates:OZEANIEN_MASKE } }] }));

/* WAS GESPIELT WIRD, STEHT IN `src/inhalt/erdkunde.js` - auch hier.
 *
 * Bis P11 hielt dieses Werkzeug seine eigene Liste: zwoelf Laender je
 * Kontinent, mit Namen und Reihenfolge. Als Europa auf siebzehn wuchs
 * (D2c, die neun Nachbarn), wurde sie nicht mitgezogen - und weil die
 * Hauptstaedte NUR fuer Laender dieser Liste gebacken werden, standen
 * Prag, Wien, Bern, Kopenhagen und Luxemburg nirgends. Auf der Ebene
 * „Hauptstaedte in Europa" fehlten sie, und kein Tor hat es gemerkt: die
 * Ebene war vollstaendig, sie war nur kleiner als der Vorrat.
 *
 * Das ist dieselbe Lehre wie in D2c, eine Ebene tiefer: die Geometrie ist
 * der Vorrat, `erdkunde.js` ist die Ware. Ein zweites Verzeichnis dessen,
 * was gespielt wird, veraltet - und zwar leise (Regel 6).
 *
 * Was die Liste dort ordnet, gilt weiter: `rang` ist eine LERNTIEFE, ein
 * Profil spielt `rang <= laenderTiefe`. Wer sie umsortiert, aendert, was
 * die Kinder ueben - und zwar unbemerkt, weil ihr Leitner-Stand an der
 * Kennung haengt und nicht am Rang.
 *
 * Was die Namen kosten: NICHTS an Geometrie. Jedes Land des Kontinents
 * wird ohnehin gebacken und ausgeliefert - die namenlosen als `umgebung`,
 * damit die Karte vollstaendig aussieht. Fuenf Laender mehr benennen
 * heisst, fuenf Formen von `umgebung` nach `laender` zu schieben; dazu
 * kommen nur Name, Rang, Anker und - in Europa - die Hauptstadt.
 */
const zieleAus = (id) => (LAENDER[id] || [])
  .slice().sort((a, b) => a.rang - b.rang).map(l => [l.a3, l.name]);

const EBENEN = [
  { id:'asien', name:'Asien', ne:'Asia', projektion:'kegel' },
  { id:'afrika', name:'Afrika', ne:'Africa', projektion:'azimutal' },
  /* `hauptstaedte` backt zusaetzlich die Lage der Hauptstadt je Zielland
   * (R6). Nur hier, nicht ueberall: es sind siebzehn Punkte zu je rund
   * 45 Byte, und fuer die vier anderen Kontinente gibt es keine Ebene,
   * die sie braucht. Ein Vorrat, den niemand liest, ist Ballast im
   * Nachladepaket. */
  { id:'europa', name:'Europa', ne:'Europe', projektion:'kegel', klippen:true,
    hauptstaedte:true },
  { id:'nordamerika', name:'Nordamerika', ne:'North America', projektion:'kegel' },
  /* Mittelamerika und die Karibik - derselbe Erdteil, eigener Massstab.
   *
   * `dazu` holt Kolumbien und Venezuela dazu: Panama grenzt an Kolumbien,
   * und ein Kartenrand, hinter dem nichts liegt, sieht aus wie das Ende
   * der Welt. Sie kommen aus einem anderen CONTINENT-Wert und stehen in
   * keiner Zielliste - sie werden Umgebung, wie jedes Land ohne Rang.
   *
   * `maske` schneidet auf das Rechteck zu, sonst zoege Mexiko den
   * Massstab wieder auseinander. */
  { id:'mittelamerika', name:'Mittelamerika', ne:'North America',
    dazu:'South America', maske:'/tmp/mittelamerika-maske.json',
    projektion:'kegel' },
  { id:'suedamerika', name:'Südamerika', ne:'South America', projektion:'azimutal' },
  /* Ozeanien. Der Erdteil heisst in den Rohdaten „Oceania", die Kennung
   * hier `australien` - so heisst auch der Kontinent auf der Weltkarte,
   * und zwei Namen fuer dasselbe Gebiet waeren eine Stelle mehr, die
   * veraltet. Azimutal wie Afrika und Suedamerika: der Erdteil liegt um
   * keinen Breitenkreis herum, sondern um einen Punkt. */
  { id:'australien', name:'Ozeanien', ne:'Oceania', projektion:'azimutal',
    maske:'/tmp/ozeanien-maske.json' },
].map(k => ({ ...k, ziele: zieleAus(k.id) }));

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
  const erdteile = [k.ne, ...(k.dazu ? [k.dazu] : [])];
  let geo = { type:'FeatureCollection', features: roh.features
    .filter(f => erdteile.includes(f.properties.CONTINENT))
    .map(f => ({ type:'Feature',
      properties:{ a3:f.properties.ADM0_A3, name: ziele.get(f.properties.ADM0_A3) || null,
                   rang: [...ziele.keys()].indexOf(f.properties.ADM0_A3) + 1 || null },
      geometry:f.geometry })) };
  if (k.klippen) geo = await shaper(geo, '-clip /tmp/europa-maske.json');
  if (k.maske)   geo = await shaper(geo, `-clip ${k.maske}`);

  const fehlend = [...ziele.keys()].filter(a3 => !geo.features.some(f=>f.properties.a3===a3));
  if (fehlend.length) throw new Error(`${k.name}: Zielländer nicht gefunden: ${fehlend.join(', ')}`);

  // G3: Topologie ueber ALLE Laender des Kontinents, vor dem Vereinfachen.
  const topo = await shaper(geo, '-clean');
  const zeilen = {};
  const perStufe = [];
  for (const st of STUFEN) {
    const projSt = passe(projektionFuer(k.projektion, topo), topo, st.breitePx);
    /* Die Insel, auf der die Hauptstadt liegt, bleibt - siehe
       `inselnFiltern`. Ohne das war Daenemark Juetland, und Kopenhagen
       lag im Meer. */
    const g = inselnFiltern(topo, projSt, 4, (q) => {
      const hs = q.rang && hauptstadtVon.get(q.a3);
      return hs ? [hs.lonlat] : [];
    });
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
     * dieser Stufe - sonst laege der Punkt neben dem Land (Regel 5: jede
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

/* Das Verzeichnis der Karten - EINMAL, erzeugt.
 *
 * Dieselbe Tafel `{ europa: LAENDER_EUROPA_GROB, ... }` stand von Hand an
 * DREI Stellen: im Bau, im Tor `inhalt` und im Tor `spielprobe`. Mit der
 * sechsten Karte (Mittelamerika, A6) sind prompt alle drei nacheinander
 * rot geworden, jede mit einer anderen Meldung, und die dritte behauptete,
 * neun Laender haetten „keine Flaeche auf der Karte" - eine Karte, die
 * daneben lag.
 *
 * Wer eine Karte backt, traegt sie jetzt nirgends mehr nach: diese Datei
 * entsteht aus derselben Schleife, die die Karten schreibt, und kann ihr
 * deshalb nicht hinterherhinken. */
{
  const ids = Object.keys(ausgabe);
  fs.writeFileSync(path.join(AUS,'karten.grob.js'),
    `// ERZEUGT von tools/backen-laender.mjs - nicht von Hand aendern.\n`+
    ids.map(id => `import { LAENDER_${id.toUpperCase()}_GROB } `
      + `from './laender-${id}.grob.js';`).join('\n') + '\n\n'
    + `/** Jede Laenderkarte unter ihrem Schluessel - der Schluessel ist der,\n`
    + ` *  unter dem sie in \`src/inhalt/erdkunde.js\` ihre Ziele hat. */\n`
    + `export const KARTEN_GROB = {\n`
    + ids.map(id => `  ${id}: LAENDER_${id.toUpperCase()}_GROB,`).join('\n')
    + `\n};\n`);
  console.log(`\n  Kartenverzeichnis: ${ids.length} Karten in src/geo/karten.grob.js`);
}
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
