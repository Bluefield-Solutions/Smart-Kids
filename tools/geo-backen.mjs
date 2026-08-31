// Kartenpipeline. Aus Rohdaten werden SVG-Pfade - zur BAUZEIT, nie im Spiel.
//
// Die vier Dinge, die das Grafik-Audit verlangt und die hier wirklich
// passieren (Befunde G2, G3, G6, G7):
//
//   G3  Topologie VOR der Vereinfachung. mapshaper baut aus allen Flaechen
//       gemeinsame Boegen; geteilte Grenzen werden dadurch identisch
//       vereinfacht. Ohne das entstehen Luecken entlang jeder Landgrenze.
//   G2  Das Guetemass ist die HAUSDORFF-Distanz in Bildpunkten, nicht die
//       Flaechenabweichung in Prozent. Der Vereinfachungsgrad wird per
//       Bisektion gesucht, bis die Grenze eingehalten ist - gemessen,
//       nicht geraten.
//   G6  Drei Aufloesungsstufen je Form, jede gegen ihre eigene Grenze.
//   G7  Projektion mit gesetzten Standardparallelen.

import fs from 'node:fs';
import path from 'node:path';
import mapshaper from 'mapshaper';
import * as d3 from 'd3-geo';

/* Wo die Rohdaten liegen.
 *
 * Hier stand ein fester Pfad in ein SITZUNGSVERZEICHNIS unter /tmp. Er hat
 * funktioniert, solange die Sitzung lief, in der er entstanden ist, und
 * danach nie wieder - waehrend `.gitignore` und die README beide `roh/` im
 * Arbeitsverzeichnis nennen. Drei Angaben, zwei davon einig, und die
 * dritte war die, die zaehlt.
 *
 * Zum Bauen und Spielen wird davon nichts gebraucht; eingecheckt ist das
 * gebackene Ergebnis in `src/geo/`. Gebraucht wird es nur, wer die Karten
 * neu rechnet.
 */
const ROH = process.env.LERNKISTE_ROH || path.join(process.cwd(), 'roh');
const AUS = path.join(process.cwd(), 'src/geo');

/** Eine Rohdatei lesen - oder sagen, wie man sie bekommt.
 *
 * Ohne das war der Fehler ein nacktes ENOENT auf einen Pfad, den niemand
 * gesetzt hat: die haeufigste Art, wie ein Werkzeug jemanden stehen laesst,
 * der es zum ersten Mal aufruft. */
export function rohLesen(name) {
  const datei = path.join(ROH, `${name}.geojson`);
  if (!fs.existsSync(datei)) {
    // Gedruckt und beendet, nicht geworfen: das hier ist ein Werkzeug, und
    // ein Stapelabzug ueber acht Zeilen verdeckt die Auskunft, um die es
    // geht.
    console.error(`\n  Die Rohdatei „${name}.geojson" fehlt in ${ROH}.\n`);
    console.error('  Holen:     npm run geo-holen   (rund 400 MB, Natural Earth, Public Domain)');
    console.error('  Anderswo:  LERNKISTE_ROH=<verzeichnis> npm run backen\n');
    console.error('  Zum Bauen und Spielen wird sie NICHT gebraucht — nur zum Neurechnen');
    console.error('  der Karten. Das Ergebnis liegt eingecheckt in src/geo/.\n');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}

/** Die Stufen aus Konzept K3, Kapitel 5.3b. Breite = groesste Darstellung. */
export const STUFEN = [
  { name: 'grob',   breitePx: 200  },
  { name: 'mittel', breitePx: 800  },
  { name: 'fein',   breitePx: 2000 },
];
const HAUSDORFF_GRENZE = 0.75;   // Gerätebildpunkte

/* ---------------------------------------------------------------- Geometrie */

/** Alle Ringe einer Feature-Sammlung als flache Liste von Punktfolgen. */
function ringe(geo) {
  const out = [];
  const rein = (g) => {
    if (!g) return;
    if (g.type === 'Polygon') out.push(...g.coordinates);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach(p => out.push(...p));
    else if (g.type === 'GeometryCollection') g.geometries.forEach(rein);
  };
  (geo.features || [geo]).forEach(f => rein(f.geometry || f));
  return out;
}

function projiziere(ringliste, proj) {
  return ringliste.map(r => r.map(([lon, lat]) => proj([lon, lat])).filter(Boolean));
}

/** Punkt-Segment-Abstand. */
function abstandSeg(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay, wx = px - ax, wy = py - ay;
  const L = vx * vx + vy * vy;
  let t = L > 0 ? (wx * vx + wy * vy) / L : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = ax + t * vx - px, dy = ay + t * vy - py;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Einseitige Hausdorff-Distanz: wie weit wurde das Original weggeschoben.
 * Mit Gitterindex, sonst laeuft die Bisektion nicht durch.
 */
function hausdorff(orig, verein) {
  const seg = [];
  for (const r of verein)
    for (let i = 0; i + 1 < r.length; i++)
      seg.push([r[i][0], r[i][1], r[i + 1][0], r[i + 1][1]]);
  if (!seg.length) return Infinity;

  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of seg) {
    x0 = Math.min(x0, s[0], s[2]); x1 = Math.max(x1, s[0], s[2]);
    y0 = Math.min(y0, s[1], s[3]); y1 = Math.max(y1, s[1], s[3]);
  }
  const zelle = Math.max(2, Math.min(x1 - x0, y1 - y0) / 120);
  const sp = Math.ceil((x1 - x0) / zelle) + 1, ze = Math.ceil((y1 - y0) / zelle) + 1;
  const gitter = new Map();
  const schluessel = (i, j) => i * 100000 + j;
  seg.forEach((s, k) => {
    const i0 = Math.floor((Math.min(s[0], s[2]) - x0) / zelle), i1 = Math.floor((Math.max(s[0], s[2]) - x0) / zelle);
    const j0 = Math.floor((Math.min(s[1], s[3]) - y0) / zelle), j1 = Math.floor((Math.max(s[1], s[3]) - y0) / zelle);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const t = schluessel(i, j); let a = gitter.get(t); if (!a) gitter.set(t, a = []); a.push(k);
    }
  });

  let max = 0, stelle = null;
  for (const r of orig) for (const [px, py] of r) {
    const ci = Math.floor((px - x0) / zelle), cj = Math.floor((py - y0) / zelle);
    let best = Infinity;
    for (let ring = 0; ring < Math.max(sp, ze); ring++) {
      for (let i = ci - ring; i <= ci + ring; i++) for (let j = cj - ring; j <= cj + ring; j++) {
        if (ring > 0 && Math.abs(i - ci) !== ring && Math.abs(j - cj) !== ring) continue;
        const a = gitter.get(schluessel(i, j)); if (!a) continue;
        for (const k of a) {
          const s = seg[k];
          const d = abstandSeg(px, py, s[0], s[1], s[2], s[3]);
          if (d < best) best = d;
        }
      }
      // Sobald der bisher beste Treffer naeher liegt als der noch ungeprueft
      // erreichbare Ringabstand, kann kein weiterer Ring besser werden.
      if (best <= ring * zelle) break;
    }
    if (best > max) { max = best; stelle = [px, py]; }
  }
  return { d: max, stelle };
}

/* ------------------------------------------------------------- Vereinfachen */

/**
 * Ein mapshaper-Lauf ueber eine GeoJSON-Sammlung.
 *
 * Danach wird IMMER der Umlaufsinn normalisiert - siehe `nachD3`.
 */
async function shaper(geojson, befehle) {
  const raus = await mapshaper.applyCommands(
    `-i ein.json ${befehle} -o aus.json format=geojson`,
    { 'ein.json': Buffer.from(JSON.stringify(geojson)) }
  );
  return nachD3(alsSammlung(JSON.parse(Buffer.from(raus['aus.json']).toString('utf8'))));
}

/**
 * mapshaper gibt je nach Befehl eine FeatureCollection, eine
 * GeometryCollection oder eine nackte Geometrie zurueck. `-dissolve2` etwa
 * liefert eine GeometryCollection - und die lief durch die
 * Umlaufsinn-Korrektur unveraendert hindurch, weil die nur Features kannte.
 * Ergebnis wieder: geoBounds meldete die ganze Erde. Deshalb wird die
 * Ausgabe hier auf EINE Form gebracht, bevor irgendetwas anderes passiert.
 */
function alsSammlung(geo) {
  if (!geo) return { type: 'FeatureCollection', features: [] };
  if (geo.type === 'FeatureCollection') return geo;
  if (geo.type === 'GeometryCollection')
    return { type: 'FeatureCollection',
             features: geo.geometries.map(g => ({ type: 'Feature', properties: {}, geometry: g })) };
  if (geo.type === 'Feature') return { type: 'FeatureCollection', features: [geo] };
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: geo }] };
}

/** Vorzeichenbehaftete Flaeche eines Rings. Negativ = im Uhrzeigersinn. */
function vorzeichenFlaeche(r) {
  let a = 0;
  for (let i = 0, n = r.length; i < n; i++) {
    const j = (i + 1) % n;
    a += r[i][0] * r[j][1] - r[j][0] * r[i][1];
  }
  return a / 2;
}

/**
 * Umlaufsinn auf das drehen, was d3-geo erwartet.
 *
 * Der Fallstrick, der eine halbe Stunde gekostet hat: **d3-geo erwartet den
 * ENTGEGENGESETZTEN Umlaufsinn zu RFC 7946.** Die Norm verlangt Aussenringe
 * gegen den Uhrzeigersinn; d3 rechnet spaerisch und liest genau das als "der
 * ganze Rest der Kugel". Natural Earth liefert im Uhrzeigersinn und laeuft
 * deshalb; mapshaper dreht um, und danach umschloss jedes Bundesland
 * rechnerisch den Nordpol: geoBounds meldete die ganze Erde, fitWidth
 * lieferte Massstab 0, jede Flaeche war null.
 *
 * **Rot wurde dabei nichts.** Genau deshalb prueft das Tor `topologie` den
 * Umlaufsinn, und genau deshalb wird hier normalisiert statt einem
 * Ausgabeflag vertraut.
 */
function nachD3(geo) {
  const dreh = (ring, sollNegativ) => {
    const a = vorzeichenFlaeche(ring);
    return (a < 0) === sollNegativ ? ring : ring.slice().reverse();
  };
  const poly = (p) => p.map((ring, i) => dreh(ring, i === 0));
  const rein = (g) => {
    if (!g) return g;
    if (g.type === 'Polygon') return { ...g, coordinates: poly(g.coordinates) };
    if (g.type === 'MultiPolygon') return { ...g, coordinates: g.coordinates.map(poly) };
    if (g.type === 'GeometryCollection') return { ...g, geometries: g.geometries.map(rein) };
    return g;
  };
  if (geo.type === 'FeatureCollection')
    return { ...geo, features: geo.features.map(f => ({ ...f, geometry: rein(f.geometry) })) };
  return rein(geo);
}

/**
 * Bisektion auf dem Erhaltungsanteil, bis die Hausdorff-Grenze steht.
 * `keep-shapes` verhindert, dass kleine Flaechen ganz verschwinden.
 */
async function bisAufGrenze(geojson, proj, grenze, {maxLaeufe = 11} = {}) {
  const origR = projiziere(ringe(geojson), proj);
  let unten = 0.02, oben = 1.0, besteAnteil = 1.0, bestes = geojson, besteH = 0, laeufe = 0;

  // Erst pruefen, ob ueberhaupt vereinfacht werden kann.
  for (let n = 0; n < maxLaeufe; n++) {
    const mitte = (unten + oben) / 2;
    const v = await shaper(geojson,
      `-simplify percentage=${mitte.toFixed(4)} weighted keep-shapes`);
    const h = hausdorff(origR, projiziere(ringe(v), proj));
    laeufe++;
    if (h.d <= grenze) { besteAnteil = mitte; bestes = v; besteH = h.d; oben = mitte; }
    else unten = mitte;
    if (oben - unten < 0.004) break;
  }
  return { geo: bestes, anteil: besteAnteil, hausdorff: besteH, laeufe };
}

/* -------------------------------------------------------------- Projektion */

/** G7: Standardparallelen bei 1/6 und 5/6 der Breitenausdehnung. */
function kegel(geo, breitePx, hoehePx, amtlich) {
  const b = d3.geoBounds(geo);
  const [lat0, lat1] = [b[0][1], b[1][1]];
  const p = amtlich ?? [lat0 + (lat1 - lat0) / 6, lat0 + (lat1 - lat0) * 5 / 6];
  return d3.geoConicEqualArea().parallels(p).rotate([-(b[0][0] + b[1][0]) / 2, 0]);
}

function passe(proj, geo, breitePx) {
  proj.fitWidth(breitePx, geo);
  return proj;
}

/* ------------------------------------------------------------------ Ausgabe */

function svgPfad(geo, proj, skala) {
  const pfad = d3.geoPath(proj);
  const d = pfad(geo);
  if (!d) return '';
  // auf viewBox 0..1000 bringen und auf eine Nachkommastelle runden
  return d.replace(/-?\d+\.?\d*/g, (z) => (parseFloat(z) * skala).toFixed(1));
}

function teileUndLoecher(geo) {
  const g = geo.geometry || geo;
  if (g.type === 'Polygon') return { teile: 1, loecher: g.coordinates.length - 1 };
  if (g.type === 'MultiPolygon')
    return { teile: g.coordinates.length,
             loecher: g.coordinates.reduce((s, p) => s + p.length - 1, 0) };
  return { teile: 0, loecher: 0 };
}

/* ----------------------------------------------------------- Inselregel G9 */

/** Flaeche eines projizierten Rings in Bildpunkten (Schnürsenkelformel). */
function ringFlaeche(r) {
  let a = 0;
  for (let i = 0, n = r.length; i < n; i++) {
    const j = (i + 1) % n;
    a += r[i][0] * r[j][1] - r[j][0] * r[i][1];
  }
  return Math.abs(a) / 2;
}

/**
 * G9, zweistufig: alles, was bei der feinsten Stufe mindestens `minPx` mal
 * `minPx` Bildpunkte ergibt - PLUS eine von Hand gepflegte Liste.
 *
 * Das muss VOR der Vereinfachung geschehen und nicht als Nebenwirkung von
 * ihr. Sonst faellt eine Insel weg, ohne dass jemand es entschieden hat -
 * und sie dominiert dann jede Abstandsmessung, weil ihr ganzer Umriss
 * ploetzlich weit von allem entfernt liegt.
 */
/**
 * @param halteVon (eigenschaften) => [[lon,lat], ...] - Punkte, deren Insel
 *   bleiben MUSS, auch wenn sie unter der Grenze liegt.
 *
 * Warum es das gibt: Kopenhagen liegt auf Seeland, und Seeland misst auf
 * der groben Stufe 12,7 Bildpunkte im Quadrat - knapp unter der Grenze von
 * 16. Daenemark wurde also als Juetland gezeichnet, und der Stadtpunkt der
 * Hauptstadt lag im Meer daneben. Gemeldet hat es `inhalt` in dem Moment,
 * in dem Daenemark ein gespieltes Land wurde (P11); vorher war es
 * Umgebung, und ein Umriss ohne Namen faellt niemandem auf.
 *
 * Die Grenze zu senken waere die falsche Antwort: sie holt auf JEDER
 * Karte Splitter zurueck, und die kosten Bytes ohne etwas zu zeigen.
 * Gehalten wird nur, was gebraucht wird - dieselbe Regel wie eine Zeile
 * tiefer, wo ein Gebiet nie ganz verschwinden darf.
 */
function inselnFiltern(geo, proj, minPx = 4, halteVon = null) {
  const grenze = minPx * minPx;
  let weg = 0, behalten = 0;
  const ringOk = (ring) => {
    const p = ring.map(([lon, lat]) => proj([lon, lat])).filter(Boolean);
    if (p.length < 4) return false;
    return ringFlaeche(p) >= grenze;
  };
  const polyFiltern = (poly, halte) => {
    // Ring 0 ist die Aussenkante, alles weitere sind Loecher.
    const gehalten = halte && halte.length
      && halte.some(([lon, lat]) => imRing(lon, lat, poly[0]));
    if (!ringOk(poly[0]) && !gehalten) { weg++; return null; }
    behalten++;
    return [poly[0], ...poly.slice(1).filter(ringOk)];
  };
  const features = geo.features.map(f => {
    const g = f.geometry;
    const halte = halteVon ? (halteVon(f.properties) || []) : null;
    if (g.type === 'Polygon') {
      const p = polyFiltern(g.coordinates, halte);
      // Ein Gebiet darf NIE ganz verschwinden - hier war eine Unsymmetrie:
      // ein MultiPolygon behielt unten immer seine groesste Flaeche, ein
      // einfaches Polygon fiel ersatzlos weg. Guatemala ist ein einfaches
      // Polygon und misst auf der groben Stufe rund anderthalb Bildpunkte;
      // es wurde weggefiltert, stand aber weiter in den Daten. Damit war
      // ein Zielland gebacken, gezaehlt - und nie zu sehen.
      if (!p) { behalten++; weg--; return { ...f, geometry: { type:'Polygon',
        coordinates: [g.coordinates[0]] } }; }
      return { ...f, geometry: { type: 'Polygon', coordinates: p } };
    }
    if (g.type === 'MultiPolygon') {
      const ps = g.coordinates.map(poly => polyFiltern(poly, halte)).filter(Boolean);
      // keep-shapes von Hand: die groesste Flaeche bleibt in jedem Fall.
      if (!ps.length) {
        let best = null, bestA = -1;
        for (const poly of g.coordinates) {
          const a = ringFlaeche(poly[0].map(([lo, la]) => proj([lo, la])).filter(Boolean));
          if (a > bestA) { bestA = a; best = [poly[0]]; }
        }
        return { ...f, geometry: { type: 'MultiPolygon', coordinates: [best] } };
      }
      return { ...f, geometry: { type: 'MultiPolygon', coordinates: ps } };
    }
    return f;
  }).filter(f => f.geometry);
  return { geo: { type: 'FeatureCollection', features }, weg, behalten };
}

export { ringe, projiziere, hausdorff, shaper, bisAufGrenze, kegel, passe, svgPfad,
         teileUndLoecher, ringFlaeche, inselnFiltern, nachD3, alsSammlung, vorzeichenFlaeche,
         ROH, AUS, HAUSDORFF_GRENZE };

/* -------------------------------------------------- Anker und Beschriftung */

/** Punkt-in-Polygon mit Loechern (gerade-ungerade). */
function imRing(x, y, r) {
  let drin = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) drin = !drin;
  }
  return drin;
}
function imPolygon(x, y, poly) {
  if (!imRing(x, y, poly[0])) return false;
  for (let i = 1; i < poly.length; i++) if (imRing(x, y, poly[i])) return false;  // Loch
  return true;
}
function abstandZumRand(x, y, poly) {
  let min = Infinity;
  for (const ring of poly)
    for (let i = 0; i + 1 < ring.length; i++) {
      const d = abstandSeg(x, y, ring[i][0], ring[i][1], ring[i+1][0], ring[i+1][1]);
      if (d < min) min = d;
    }
  return imPolygon(x, y, poly) ? min : -min;
}

/**
 * Pol der Unzugaenglichkeit: der Punkt IM Gebiet mit dem groessten Abstand
 * zum Rand. NICHT der Schwerpunkt - der Schwerpunkt Italiens liegt im Meer,
 * der von Bremen zwischen seinen beiden Teilen.
 *
 * Der Abstand ist zugleich der Radius des groessten Kreises, der ins Gebiet
 * passt - und entscheidet damit, ob der Name hineinpasst (Befund G10).
 */
function polDerUnzugaenglichkeit(polygone) {
  // Nur der groesste Teil - der Anker gehoert nach Bremen-Stadt, nicht
  // zwischen Bremen und Bremerhaven.
  let poly = null, best = -1;
  for (const p of polygone) {
    const a = ringFlaeche(p[0]);
    if (a > best) { best = a; poly = p; }
  }
  if (!poly) return null;
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for (const [x,y] of poly[0]) { x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y); }
  let beste = null, besterAbstand = -Infinity, schritt = Math.max(x1-x0, y1-y0) / 24;
  let mx = (x0+x1)/2, my = (y0+y1)/2;
  for (let runde = 0; runde < 7; runde++) {
    for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
      const x = mx + i*schritt, y = my + j*schritt;
      const d = abstandZumRand(x, y, poly);
      if (d > besterAbstand) { besterAbstand = d; beste = [x,y]; }
    }
    if (beste) { mx = beste[0]; my = beste[1]; }
    schritt /= 3;
  }
  return { punkt: beste, radius: besterAbstand };
}

/**
 * Einen SVG-Pfad zurueck in seine Ringe lesen.
 *
 * Stand dreimal fast gleich da - in `tools/backen-staedte.mjs`, in
 * `tor/inhalt.mjs` und hier gebraucht. Was zweimal dasteht, veraltet
 * einmal: die eine Fassung bekam die Loecher, die andere nicht.
 */
function pfadZuRingen(d) {
  const ringe = [];
  for (const teil of String(d).split('M').slice(1)) {
    const z = teil.match(/-?\d+\.?\d*/g); if (!z) continue;
    const ring = [];
    for (let i = 0; i + 1 < z.length; i += 2) ring.push([+z[i], +z[i+1]]);
    if (ring.length > 2) ringe.push(ring);
  }
  return ringe;
}

/**
 * Ringe zu Polygonen ordnen: `[aussen, loch, loch, ...]`.
 *
 * Hier lag der Fehler, der Brandenburg seinen Anker MITTEN IN BERLIN gab.
 * `backen-staedte.mjs` machte aus jedem Ring ein eigenes Polygon OHNE
 * Loch - der Kommentar daneben sagte sogar, dass Aussenringe und Loecher
 * zu trennen seien, der Code tat es nicht. Der groesste einbeschriebene
 * Kreis suchte sich daraufhin die Mitte des Rings, und die Mitte von
 * Brandenburg ist Berlin.
 *
 * Gemessen auf dem Zielgeraet (844 x 390): Brandenburgs Anker lag 1,8
 * Bildpunkte neben dem Mittelpunkt von Berlins Trefferkreis, der 10
 * Bildpunkte Radius hat. Wer „Brandenburg" auf Brandenburgs beste Stelle
 * zog, bekam „Das ist Berlin." - und `topologie` meldete gruen, weil es
 * nur gegen den AUSSENRING prueft.
 */
function ringeZuPolygonen(ringe) {
  const nachGroesse = ringe.map(r => ({ r, a: ringFlaeche(r) })).sort((x, y) => y.a - x.a);
  const polys = [];
  for (const { r } of nachGroesse) {
    const [px, py] = r[0];
    // Gesucht wird der AUSSENRING, der diesen Ring umschliesst - nicht das
    // ganze Polygon: sonst faende ein zweites Loch im selben Wirt keinen.
    const wirt = polys.find(q => imRing(px, py, q[0]));
    if (wirt) wirt.push(r); else polys.push([r]);
  }
  return polys;
}

/**
 * Der Rahmen um eine Liste von Pfaden: x0/y0/w/h in Pfadkoordinaten.
 *
 * Stand bis P8 zweimal da, einmal je Bauskript - einmal als Rechteck,
 * einmal gleich als viewBox-Zeichenkette. Wer die Zahlen liest, muss beide
 * Fassungen gleich lesen, sonst sitzt derselbe Umriss in zwei Entwuerfen
 * verschieden im Bild.
 */
function rahmen(liste) {
  const xs = [], ys = [];
  for (const o of liste) {
    const m = o.pfad.match(/-?\d+\.?\d*/g).map(Number);
    for (let i = 0; i < m.length; i += 2) { xs.push(m[i]); ys.push(m[i + 1]); }
  }
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  return { x0, y0, w: Math.max(...xs) - x0, h: Math.max(...ys) - y0 };
}

/** Derselbe Rahmen als viewBox, mit `rand` ringsum. */
function sichtfeld(liste, rand = 8) {
  const r = rahmen(liste);
  return `${r.x0 - rand} ${r.y0 - rand} ${r.w + 2 * rand} ${r.h + 2 * rand}`;
}

export { imPolygon, abstandZumRand, polDerUnzugaenglichkeit,
         pfadZuRingen, ringeZuPolygonen, rahmen, sichtfeld };
