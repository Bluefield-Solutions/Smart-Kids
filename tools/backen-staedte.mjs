// Ebene 4: die sechzehn Landeshauptstaedte - und die Anker, die entscheiden,
// wo ein Name steht (Befund G10).
//
// Gezogen wird der Stadtname auf die FLAECHE des Bundeslands (Paarbildung,
// Befund L1). Der Stadtpunkt erscheint erst NACH der richtigen Antwort - als
// Zugabe, damit das Kind die Lage gleich mitlernt.
import fs from 'node:fs';
import path from 'node:path';
import * as d3 from 'd3-geo';
import { rohLesen, AUS, ROH, polDerUnzugaenglichkeit,
         pfadZuRingen, ringeZuPolygonen } from './geo-backen.mjs';
import { DEUTSCHLAND_FEIN } from '../src/geo/deutschland.fein.js';
// Die eingecheckte Fassung - gebraucht, wenn die Rohdaten fehlen (siehe unten).
import { STAEDTE as EINGECHECKT } from '../src/geo/staedte.js';

const STADTSTAATEN = ['DE-BE','DE-HH','DE-HB'];
const NAME_IN_NE = { 'München':'Munich', 'Köln':'Cologne', 'Nürnberg':'Nuremberg' };

/* Die STADTPUNKTE brauchen die Rohdaten, die ANKER nicht.
 *
 * Ein Anker haengt allein an `DEUTSCHLAND_FEIN`, und das liegt eingecheckt
 * im Baum. Ohne diesen Zweig haette die Berichtigung von Brandenburgs
 * Anker auf 400 MB Natural Earth gewartet - Daten, die zum Bauen und
 * Spielen niemand braucht und die auf einem frischen Rechner erst geholt
 * werden muessen.
 *
 * Fehlen sie, werden die Stadtpunkte aus der eingecheckten Fassung
 * uebernommen und NUR die Anker neu gerechnet. Der Lauf schreibt das hin,
 * damit niemand glaubt, er haette auch die Orte neu bestimmt. */
const rohDa = ['ne_10m_populated_places', 'ne_10m_admin_1_states_provinces']
  .every(n => fs.existsSync(path.join(ROH, `${n}.geojson`)));

let deOrte = [], proj = null, skala = 1;
if (rohDa) {
  const orte = rohLesen('ne_10m_populated_places');
  deOrte = orte.features.filter(f => f.properties.ADM0_A3 === 'DEU');
  // Die Deutschland-Projektion aus tools/backen-deutschland.mjs, feine Stufe.
  proj = d3.geoConicConformal().parallels([48+40/60, 53+40/60]).rotate([-10.5,0]);
  // Die Lage aus dem bereits normierten Pfadraum ableiten, indem wir die
  // Projektion mit denselben Parametern auf die Rohgeometrie fitten.
  const rohDe = rohLesen('ne_10m_admin_1_states_provinces');
  const deRoh = { type:'FeatureCollection', features: rohDe.features
    .filter(f=>f.properties.adm0_a3==='DEU')
    .map(f=>({type:'Feature',properties:{id:f.properties.iso_3166_2},geometry:f.geometry})) };
  // fitWidth auf dieselbe Bezugsbreite wie die feine Stufe, dann auf 1000 skalieren
  proj.fitWidth(2000, deRoh);
  skala = 1000/2000;
}

/* --- Pfad zurueck in Polygone lesen (fuer die Anker) -------------------
 *
 * Hier stand eine eigene Fassung, die aus JEDEM Ring ein eigenes Polygon
 * ohne Loch machte - `polys.map(r => [r])`, direkt unter einem Kommentar,
 * der das Gegenteil ankuendigte. Beides steht jetzt in `geo-backen.mjs`,
 * einmal, und `tor/inhalt.mjs` liest dieselben Funktionen.
 */

const zeilen = [];
let ohneOrt = 0;
for (const b of DEUTSCHLAND_FEIN) {
  const gesucht = NAME_IN_NE[b.hauptstadt] || b.hauptstadt;
  const treffer = deOrte.find(f =>
    [f.properties.NAME, f.properties.NAMEASCII, f.properties.NAME_DE].includes(gesucht) ||
    [f.properties.NAME, f.properties.NAMEASCII, f.properties.NAME_DE].includes(b.hauptstadt));
  let ort = null;
  if (!rohDa) {
    ort = (EINGECHECKT.find(z => z.id === b.id) || {}).ort || null;
    if (!ort) ohneOrt++;
  } else if (treffer) {
    const p = proj(treffer.geometry.coordinates);
    if (p) ort = [+(p[0]*skala).toFixed(1), +(p[1]*skala).toFixed(1)];
  } else ohneOrt++;

  const pu = polDerUnzugaenglichkeit(ringeZuPolygonen(pfadZuRingen(b.pfad)));
  zeilen.push({
    id: b.id, name: b.name, hauptstadt: b.hauptstadt,
    stadtstaat: STADTSTAATEN.includes(b.id),
    ort,
    anker: pu ? [+pu.punkt[0].toFixed(1), +pu.punkt[1].toFixed(1)] : null,
    radius: pu ? +pu.radius.toFixed(1) : 0,
  });
}

/* --- G10: passt der Name hinein? --------------------------------------- */
// Grobe Textbreite bei Schriftgroesse 20 in Andika: rund 0,58 em je Zeichen.
const BREITE_JE_ZEICHEN = 0.58 * 20;
const KARTENBREITE_PX = 470;          // wie im Entwurf 2
const proPunkt = KARTENBREITE_PX / 1000;
zeilen.forEach(z => {
  const textPx = z.name.length * BREITE_JE_ZEICHEN;
  const platzPx = z.radius * 2 * proPunkt;
  z.beschriftung = platzPx >= textPx ? 'innen' : 'fahne';
  z.platzPx = +platzPx.toFixed(0); z.textPx = +textPx.toFixed(0);
});

fs.writeFileSync(path.join(AUS,'staedte.js'),
  `// ERZEUGT von tools/backen-staedte.mjs - nicht von Hand aendern.\n`+
  `export const STAEDTE = ${JSON.stringify(zeilen)};\n`);

if (!rohDa) console.log('\n  Ohne Rohdaten gelaufen: die Stadtpunkte sind aus der\n'
  + '  eingecheckten Fassung uebernommen, NEU gerechnet sind nur die Anker.\n');
console.log(`  ${zeilen.length} Länder, ${zeilen.filter(z=>z.ort).length} Stadtlagen `
  + (rohDa ? 'gefunden' : 'übernommen') + (ohneOrt?`, ${ohneOrt} ohne`:''));
console.log(`  Stadtstaaten (keine eigene Hauptstadtfrage): `
  + zeilen.filter(z=>z.stadtstaat).map(z=>z.name).join(', '));
console.log(`  Rätsel in der Hauptrunde: ${zeilen.filter(z=>!z.stadtstaat).length}\n`);
console.log('  Beschriftung (Befund G10), Karte 470 px breit:');
for (const z of zeilen.sort((a,b)=>a.platzPx-b.platzPx))
  console.log(`    ${z.name.padEnd(24)} Platz ${String(z.platzPx).padStart(3)} px, `
    + `Text ${String(z.textPx).padStart(3)} px  →  ${z.beschriftung}`);
