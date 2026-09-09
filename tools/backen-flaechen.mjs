/* Die WIRKLICHEN Flaechen der Laender - fuer die Ebene „Was ist groesser?"
 *
 * WARUM EIN EIGENES WERKZEUG und nicht ein Feld mehr in
 * `backen-laender.mjs`: dort entstehen die UMRISSE, und die sind
 * vereinfacht, beschnitten und um kleine Inseln erleichtert. Ihre Flaeche
 * ist die des Bildes, nicht die des Landes - gemessen weichen sieben
 * Laender um mehr als zehn Prozent ab, Russland auf der Europakarte um
 * 77. Die wirkliche Flaeche ist ein anderes Datum aus einer anderen
 * Rechnung, und sie gehoert deshalb in eine eigene Datei.
 *
 * WIE GERECHNET WIRD: `d3.geoArea` gibt den Flaecheninhalt eines
 * GeoJSON-Stuecks in Steradiant, also den Anteil an der Kugel. Mal dem
 * Erdradius im Quadrat sind das Quadratkilometer - auf der Kugel, nicht
 * auf einer Projektion, und damit ohne jede Verzerrung.
 *
 * Nachgeschlagen an vier Stellen (Regel 3: das Soll kommt aus der
 * Referenz):
 *
 *     Deutschland  356 379  gegen  357 592 amtlich   -0,3 %
 *     Spanien      506 327  gegen  505 990           +0,1 %
 *     Italien      300 679  gegen  301 340           -0,2 %
 *     Luxemburg      2 600  gegen    2 586           +0,5 %
 *
 * Die Abweichung ist die Grenzziehung von Natural Earth, nicht die
 * Rechnung. Frankreich steht mit 635 739 da und nicht mit 551 695: NE
 * fuehrt die Ueberseedepartements bei Frankreich, wie es die amtliche
 * Gesamtflaeche (643 801) auch tut.
 *
 * `npm run backen-flaechen` - braucht `roh/`, also die Rohdaten. Das
 * Ergebnis liegt eingecheckt in `prototyp/flaechen.json`; zum Bauen und
 * Spielen wird `roh/` nicht gebraucht.
 */
import fs from 'node:fs';
import * as d3 from 'd3-geo';
import { rohLesen } from './geo-backen.mjs';
import { LAENDER, STAND } from '../src/inhalt/erdkunde.js';

const ERDRADIUS_KM = 6371.0088;   // mittlerer Radius, IUGG

const roh = rohLesen('ne_10m_admin_0_countries');

/* Alle Kennungen, die irgendeine Karte als Ziel fuehrt. Ein Land kann auf
   zwei Karten stehen (Mexiko auf Nordamerika und als Umgebung in
   Mittelamerika) - die Flaeche ist dieselbe, die Menge deshalb ein Set. */
const ziele = new Set();
for (const liste of Object.values(LAENDER))
  for (const l of liste) ziele.add(l.a3);

/* SUMMIERT, nicht ueberschrieben: Natural Earth fuehrt einige Staaten in
   mehreren Stuecken unter derselben ADM0_A3. Wer hier das letzte nimmt,
   bekommt eine Insel statt eines Landes. */
const km2 = {};
for (const f of roh.features) {
  const a3 = f.properties.ADM0_A3;
  if (!ziele.has(a3)) continue;
  km2[a3] = (km2[a3] || 0) + d3.geoArea(f) * ERDRADIUS_KM * ERDRADIUS_KM;
}

const fehlt = [...ziele].filter(a3 => !km2[a3]);
if (fehlt.length) {
  console.error(`\n  Ohne Flaeche geblieben: ${fehlt.join(', ')}\n`);
  process.exit(1);
}

const aus = { quelle: STAND.quelle, standJahr: STAND.jahr,
              rechnung: 'd3.geoArea auf dem unvereinfachten Umriss, Erdradius 6371,0088 km',
              km2: Object.fromEntries(Object.keys(km2).sort()
                     .map(a3 => [a3, Math.round(km2[a3])])) };
fs.writeFileSync('prototyp/flaechen.json', JSON.stringify(aus, null, 1) + '\n');
console.log(`  prototyp/flaechen.json  ${Object.keys(km2).length} Länder, `
  + `${(fs.statSync('prototyp/flaechen.json').size / 1024).toFixed(1)} KB`);
