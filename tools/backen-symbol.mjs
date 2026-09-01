// Das App-Symbol.
//
// Kein Clipart-Globus. Die Kuesten kommen aus DERSELBEN Quelle wie im Spiel
// (Natural Earth 1:50m) - das ist der Punkt des ganzen Projekts, und ein
// Symbol, das daneben liegt, verspricht etwas anderes als die App haelt.
//
// --- Fassung A7: kindgerecht, und woran das gemessen ist ------------------
//
// Die erste Fassung war ein Atlas-Globus: Nachthimmel, Gradnetz, feine
// Kueste auf 0,9 px genau. Auf dem Schreibtisch schoen - auf dem
// Startbildschirm eines iPads steht er zwischen bunten Kachelsymbolen und
// ist dunkel, fein und ernst. Fiona ist sechs.
//
// Drei Vorbilder, und was sie TUN (nicht, wie sie aussehen):
//
//   Duolingo        EINE Gestalt auf EINER satten Flaeche. Keine Szene,
//                   kein Verlaufsgewitter, dicke Formen. Bei 40 px sind
//                   noch drei Dinge zu unterscheiden.
//   ANTON, Khan     heller, warmer Grund; ein einziger freundlicher
//   Academy Kids    Gegenstand; runde, dicke Konturen; hohe Buntheit.
//   Swift           ein Emblem, grosszuegiger Rand, EINE Idee. Nichts,
//   Playgrounds     was man bei 40 px erst suchen muesste.
//
// Das Soll daraus: EIN Gegenstand, wenige Formen, hohe Buntheit, dicke
// Konturen, warmer Grund, und nichts, was unter 60 px zu Gries wird.
//
// Der Abstand der alten Fassung dazu, gemessen an ihrer eigenen Datei:
// Grund L 0.21-0.36 (dunkel), Buntheit C 0.038-0.05 (fast grau), Kueste
// bis auf 0,9 px verfeinert, dazu ein Gradnetz aus 12 Linien. Bei 45 px
// sind das rund 900 Kuestenpunkte auf 34 Bildpunkten Kugel - jeder Strich
// unter einem Zehntel Bildpunkt.
//
// Was diese Fassung anders macht:
//
//   Grund      warm und hell statt Nachtblau. Der Globus ist kalt, der
//              Grund warm - der Gegensatz traegt die Form, nicht ein
//              Verlauf auf der Kugel selbst.
//   Kueste     ABSICHTLICH grob: Hausdorff 3,5 px statt 0,9. Was bei 512
//              px eine Bucht ist, ist bei 45 px ein Zittern.
//   Gradnetz   weg. Zwoelf Linien sind bei 45 px zwoelf graue Punkte.
//   Aufkleber  weisser Rand und ein Schatten darunter: das Forscherbuch
//              der App sammelt Aufkleber, und der Globus ist der erste.
//   Stern      DERSELBE Zackenstern, den die App fuer eine geschaffte
//              Ebene vergibt - nicht irgendein Zierstern.
//
// Die Farben kommen weiter aus `marken.css` und stehen auch hier nur
// einmal.
//
// Erzeugt wird EINE SVG-Datei. Die PNG entstehen daraus in Chromium
// (tools/backen-symbol-png.mjs), damit im Baum nur eine Quelle liegt.
import fs from 'node:fs';
import path from 'node:path';
import * as d3 from 'd3-geo';
import { rohLesen, shaper, bisAufGrenze, inselnFiltern, ringe } from './geo-backen.mjs';

const AUS = path.join(process.cwd(), 'src/symbol');
fs.mkdirSync(AUS, { recursive: true });

const roh = rohLesen('ne_50m_admin_0_countries');
// Antarktika bleibt draussen: in dieser Aufsicht liegt es am unteren Rand
// und wird zum Streifen. Dieselbe Entscheidung wie auf der Weltkarte.
const land = await shaper({ type:'FeatureCollection', features: roh.features
  .filter(f => f.properties.CONTINENT !== 'Antarctica')
  .map(f => ({ type:'Feature', properties:{}, geometry:f.geometry })) }, '-dissolve2');

const R = 512;                       // Zeichenflaeche, quadratisch
/* Die Kugel ist kleiner geworden: 68 statt 75 Prozent der Kante.
 *
 * Zwei Gruende, beide gemessen. Die iOS-Maske schneidet die Ecken rund ab
 * und das Tor `symbol` prueft, dass die Kugel nicht hineinlaeuft - bei 75 %
 * ging das gerade so. Und ein Aufkleber braucht Luft: klebt er am Rand,
 * sieht er nicht aufgeklebt aus, sondern abgeschnitten. */
const KUGEL = R * 0.355;
const proj = d3.geoOrthographic()
  .rotate([-10, -15])                // 10 Grad Ost, 15 Grad Nord
  .clipAngle(90)
  .scale(KUGEL)
  .translate([R/2, R/2]);
const pfad = d3.geoPath(proj);

/* Vereinfachen - mit derselben Messlatte wie die Karten im Spiel, aber
 * ABSICHTLICH grob.
 *
 * Die alte Fassung ging auf 0,9 Bildpunkte. Das ist die richtige Zahl fuer
 * eine Karte, auf der ein Kind ein Land treffen soll, und die falsche fuer
 * ein Symbol: bei 45 px ist die Kugel 31 Punkte breit, ein Zehntel der
 * Zeichenflaeche - jede Bucht wird zu einem Zittern in der Kontur, und das
 * Ganze sieht bei kleiner Groesse ausgefranst aus statt rund.
 *
 * 3,5 px bei 512 sind rund 0,3 px bei 45 - genau unter der Schwelle, ab
 * der ein Strich noch etwas beitraegt. Was groesser ist als eine Bucht,
 * bleibt: Afrikas Horn, das Mittelmeer, Skandinavien. */
const gefiltert = inselnFiltern(land, proj, 8).geo;
const fein = await bisAufGrenze(gefiltert, proj, 3.5);
console.log(`  Kueste: Hausdorff ${fein.hausdorff.toFixed(2)} px bei `
  + `${ringe(fein.geo).reduce((a,x)=>a+x.length,0)} Punkten`);

const landPfad = pfad(fein.geo);
if (!landPfad) throw new Error('Kein Landpfad - die Projektion hat nichts geliefert.');

// Die Farben stehen auch hier nur EINMAL: sie kommen aus marken.css.
const marken = fs.readFileSync(path.join(process.cwd(), 'src/marken/marken.css'), 'utf8');
const holen = (name) => {
  const zeile = marken.split("\n").find(z => z.trim().startsWith("--" + name + ":"));
  const m = zeile && zeile.match(/oklch\([^)]*\)/);
  if (!m) throw new Error(`Marke --${name} steht nicht in marken.css`);
  return m[0];
};
const TINTE = holen('tinte'), STERN = holen('stern-an'), PAPIER = holen('papier');

/* Der Zackenstern der App - derselbe Pfad, nicht ein aehnlicher.
 *
 * Er steht in `prototyp/spiel.js` als `STERN_D` und wird von dort GELESEN.
 * Abgeschrieben waere er der Tag, an dem die Zacken hier laenger werden
 * als dort (Regel 6). */
const spiel = fs.readFileSync(path.join(process.cwd(), 'prototyp/spiel.js'), 'utf8');
const sternPfad = (spiel.match(/const STERN_D = '([^']+)'/) || [])[1];
if (!sternPfad) throw new Error('STERN_D steht nicht mehr in prototyp/spiel.js — '
  + 'der Stern im Symbol käme aus dem Nichts');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${R} ${R}" width="${R}" height="${R}">
  <title>Smart Kids</title>
  <defs>
    <!-- Der Grund: warmes Sonnengelb, unten satter. Warm gegen die kalte
         Kugel - der Gegensatz traegt die Form auch dann noch, wenn das
         Symbol auf 40 Punkte schrumpft und von der Kueste nichts mehr
         uebrig ist. -->
    <linearGradient id="grund" x1="0.15" y1="0" x2="0.7" y2="1">
      <stop offset="0"   stop-color="oklch(0.88 0.120 92)"/>
      <stop offset="0.55" stop-color="oklch(0.80 0.150 72)"/>
      <stop offset="1"   stop-color="oklch(0.72 0.160 52)"/>
    </linearGradient>
    <!-- Das Meer: EIN kraeftiges Blau mit einem leichten Licht von oben
         links. Kein dreistufiger Verlauf mehr - bei kleiner Groesse
         zaehlt, dass die Kugel EINE Farbe hat, nicht drei. -->
    <radialGradient id="meer" cx="0.34" cy="0.26" r="0.95">
      <stop offset="0"   stop-color="oklch(0.72 0.130 232)"/>
      <stop offset="1"   stop-color="oklch(0.58 0.150 248)"/>
    </radialGradient>
    <!-- Das Land: sattes Blattgruen. Gegen Blau ist Gruen der Gegensatz,
         den auch ein Kind sofort trennt - Sandgelb gegen Blau war bei 45
         px ein heller Fleck auf einem dunklen. -->
    <linearGradient id="landfarbe" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0"   stop-color="oklch(0.76 0.150 148)"/>
      <stop offset="1"   stop-color="oklch(0.65 0.145 152)"/>
    </linearGradient>
    <clipPath id="kugel"><circle cx="${R/2}" cy="${R/2}" r="${KUGEL}"/></clipPath>
  </defs>

  <rect width="${R}" height="${R}" fill="url(#grund)"/>

  <!-- Der Schatten des Aufklebers. GEBACKEN als weicher Kreis, nie als
       Filter: auf iOS wird aus einem Filter ueber einem Bild ein schwarzes
       Bild (Regel 11). -->
  <ellipse cx="${(R/2 + KUGEL*0.06).toFixed(1)}" cy="${(R/2 + KUGEL*0.12).toFixed(1)}"
           rx="${(KUGEL*1.15).toFixed(1)}" ry="${(KUGEL*1.13).toFixed(1)}"
           fill="oklch(0.45 0.09 55)" fill-opacity="0.28"/>

  <!-- Der weisse Aufkleberrand. Er ist das, was den Globus vom Grund
       loest - und er ist die Bildsprache des Forscherbuchs. -->
  <circle cx="${R/2}" cy="${R/2}" r="${(KUGEL*1.13).toFixed(1)}" fill="${PAPIER}"/>

  <circle cx="${R/2}" cy="${R/2}" r="${KUGEL}" fill="url(#meer)"/>

  <g clip-path="url(#kugel)">
    <path d="${landPfad}" fill="url(#landfarbe)" fill-rule="evenodd"
          stroke="${TINTE}" stroke-width="7" stroke-linejoin="round"
          paint-order="stroke fill"/>
  </g>

  <!-- Der Rand zuletzt, damit er ueber den Kuesten liegt. Dick: er ist bei
       45 px die eine Linie, die das Symbol rund macht. -->
  <circle cx="${R/2}" cy="${R/2}" r="${(KUGEL-3).toFixed(1)}" fill="none"
          stroke="${TINTE}" stroke-width="9"/>

  <!-- Der Stern der App, oben rechts auf dem Rand des Aufklebers. Er sagt,
       wofuer das hier da ist: es gibt etwas zu holen.
       
       KLEIN, und das ist gemessen: der erste Entwurf gab ihm 0,62 der
       Kugelhoehe. Damit reichte er von 106 bis -2 auf der senkrechten
       Achse - er stand oben aus dem Bild heraus, und die runde iOS-Maske
       haette den Rest genommen. Bei 0,30 liegt seine aeusserste Zacke bei
       (438, 73); der Mittelpunkt der Eckrundung liegt bei (398, 114) mit
       114 Punkten Radius, der Abstand betraegt 57 - also mit Abstand
       innerhalb der Maske.
       
       Und er ist ein ZEICHEN, kein zweiter Gegenstand: bei 45 px soll das
       Auge einen Globus sehen, an dem etwas Gelbes haengt - nicht einen
       Stern, hinter dem eine Kugel steht. -->
  <g transform="translate(${(R/2 + KUGEL*0.76).toFixed(1)} ${(R/2 - KUGEL*0.76).toFixed(1)})
                rotate(14) scale(${(KUGEL/12*0.30).toFixed(3)})">
    <path d="${sternPfad}" fill="${STERN}" stroke="${TINTE}" stroke-width="2.6"
          stroke-linejoin="round" paint-order="stroke fill"/>
  </g>
</svg>
`;
fs.writeFileSync(path.join(AUS, 'symbol.svg'), svg);
console.log(`  src/symbol/symbol.svg  ${(svg.length/1024).toFixed(1)} KB`);
console.log(`  Kugel ${(KUGEL*2/R*100).toFixed(0)} % der Kante, mit Aufkleberrand `
  + `${(KUGEL*1.13*2/R*100).toFixed(0)} % — innerhalb der iOS-Maske`);
