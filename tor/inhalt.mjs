// Tore `inhalt`, `topologie`, `beruehrung`, `marken`.
//
// Alle vier arbeiten auf dem, was wirklich da ist - nicht auf dem, was im
// Konzept steht. Und `doku` vergleicht am Ende beides. Eine Zahl, die
// niemand prueft, veraltet lautlos.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import * as I from '../src/inhalt/erdkunde.js';
import * as R from '../src/inhalt/rechnen.js';
import { STAEDTE } from '../src/geo/staedte.js';
import { KONTINENTE_FEIN } from '../src/geo/kontinente.fein.js';
import { DEUTSCHLAND_FEIN } from '../src/geo/deutschland.fein.js';
import { LAENDER_AFRIKA_FEIN } from '../src/geo/laender-afrika.fein.js';
import { LAENDER_ASIEN_FEIN } from '../src/geo/laender-asien.fein.js';
import { LAENDER_EUROPA_FEIN } from '../src/geo/laender-europa.fein.js';
import { LAENDER_NORDAMERIKA_FEIN } from '../src/geo/laender-nordamerika.fein.js';
import { LAENDER_SUEDAMERIKA_FEIN } from '../src/geo/laender-suedamerika.fein.js';

/** Alles, was gebacken wird - damit eine Pruefung nicht die Haelfte auslaesst. */
const GEBACKEN = {
  kontinente:   KONTINENTE_FEIN,
  deutschland:  DEUTSCHLAND_FEIN,
  // Antarktika ist raus - nachgefragt und entschieden. Die drei gebackenen
  // Dateien wurden geloescht, dieser Zeiger blieb stehen, und damit STARB
  // das ganze Tor: ein fehlender Import ist kein roter Befund, sondern ein
  // Absturz vor der ersten Pruefung. Sieben Pruefungen - inhalt,
  // topologie, beruehrung, marken, schrift, symbol, doku - haben seitdem
  // nichts mehr gesagt, und keine einzige Gegenprobe hat es gemerkt: ein
  // abgestuerztes Tor erfuellt jede Probe, die „muss rot werden" verlangt.
  // Deshalb prueft `proben` jetzt VOR jeder Probe den gesunden Stand.
  afrika:       LAENDER_AFRIKA_FEIN,
  asien:        LAENDER_ASIEN_FEIN,
  europa:       LAENDER_EUROPA_FEIN,
  nordamerika:  LAENDER_NORDAMERIKA_FEIN,
  suedamerika:  LAENDER_SUEDAMERIKA_FEIN,
};
import { vorzeichenFlaeche, ringFlaeche, imPolygon } from '../tools/geo-backen.mjs';

const fehler = [], hinweise = [];
const pruefe = (b, satz) => { if (!b) fehler.push(satz); };

/* ====================================================== Tor `inhalt` ==== */
console.log('\n  Tor `inhalt`');

const ids = new Set();
const eindeutig = (id, wo) => {
  if (ids.has(id)) fehler.push(`doppelte ID ${id} (${wo})`); ids.add(id);
};
I.KONTINENTE.forEach(k => {
  eindeutig(k.id, 'Kontinent');
  pruefe(k.name, `Kontinent ${k.id} ohne Namen`);
  pruefe(k.aussprache && k.aussprache.length >= 2,
    `Kontinent ${k.id}: mindestens zwei Aussprachevarianten nötig`);
  pruefe([1,2,3].includes(k.runde), `Kontinent ${k.id}: Runde fehlt oder ungültig`);
});
const laender = Object.entries(I.LAENDER).flatMap(([k,l])=>l.map(x=>({...x, kontinent:k})));
laender.forEach(l => {
  eindeutig(l.a3, 'Land');
  pruefe(l.name, `Land ${l.a3} ohne Namen`);
  pruefe(l.rang >= 1 && l.rang <= 5, `Land ${l.a3}: Rang außerhalb 1..5`);
  pruefe(l.aussprache && l.aussprache.length >= 2, `Land ${l.a3}: zu wenige Aussprachevarianten`);
  pruefe(I.KONTINENTE.some(k=>k.id===l.kontinent), `Land ${l.a3}: Elternknoten ${l.kontinent} fehlt`);
});
Object.entries(I.LAENDER).forEach(([k, l]) => {
  const raenge = l.map(x=>x.rang).sort().join(',');
  pruefe(raenge === '1,2,3,4,5', `${k}: Ränge sind ${raenge}, erwartet 1,2,3,4,5`);
});
STAEDTE.forEach(s => {
  eindeutig(s.id, 'Bundesland');
  pruefe(s.hauptstadt, `${s.id} ohne Hauptstadt`);
  pruefe(s.ort, `${s.id}: keine Stadtlage`);
  pruefe(s.anker, `${s.id}: kein Anker`);
  if (!s.stadtstaat)
    pruefe((I.HAUPTSTADT_ABLENKER[s.id]||[]).length >= 1,
      `${s.id}: kein Ablenker gepflegt — Ebene 4 wäre dort trivial`);
});
I.ECHTE_FALLEN.forEach(id => {
  const a = I.HAUPTSTADT_ABLENKER[id] || [];
  pruefe(a.length >= 1, `${id} ist als echte Falle geführt, hat aber keinen Ablenker`);
});
pruefe(new Date().getFullYear() - I.STAND.jahr <= 3,
  `Datenstand ${I.STAND.jahr} ist älter als drei Jahre`);

// Die Gebietszahl wird GEZAEHLT, nicht geschrieben.
const ZAHL = { kontinente:I.KONTINENTE.length, laender:laender.length,
               bundeslaender:STAEDTE.length, staedte:STAEDTE.length };
ZAHL.gesamt = ZAHL.kontinente + ZAHL.laender + ZAHL.bundeslaender + ZAHL.staedte;
console.log(`    ${ZAHL.kontinente} Kontinente + ${ZAHL.laender} Länder + `
  + `${ZAHL.bundeslaender} Bundesländer + ${ZAHL.staedte} Städte = ${ZAHL.gesamt} Gebiete`);

/* ==================================================== Tor `topologie` === */
console.log('\n  Tor `topologie`');
function pfadZuPolys(d) {
  const polys = [];
  for (const teil of d.split('M').slice(1)) {
    const z = teil.match(/-?\d+\.?\d*/g); if (!z) continue;
    const ring = []; for (let i=0;i+1<z.length;i+=2) ring.push([+z[i],+z[i+1]]);
    if (ring.length > 2) polys.push(ring);
  }
  return polys;
}
// Erwartete Teile und Loecher - aus der Wirklichkeit, nicht aus den Daten.
const ERWARTET = {
  'DE-HB': { teileMin:2, grund:'Bremen und Bremerhaven liegen 60 km auseinander' },
  'DE-BB': { loecherMin:1, grund:'Berlin liegt vollständig in Brandenburg' },
  'DE-NI': { loecherMin:1, grund:'die Stadt Bremen liegt vollständig in Niedersachsen' },
  'DE-SH': { teileMin:2, grund:'Sylt, Föhr, Amrum, Fehmarn' },
};
for (const b of DEUTSCHLAND_FEIN) {
  const e = ERWARTET[b.id]; if (!e) continue;
  if (e.teileMin) pruefe(b.teile >= e.teileMin,
    `${b.name}: ${b.teile} Teile, erwartet mindestens ${e.teileMin} — ${e.grund}`);
  if (e.loecherMin) pruefe(b.loecher >= e.loecherMin,
    `${b.name}: ${b.loecher} Löcher, erwartet mindestens ${e.loecherMin} — ${e.grund}`);
}
// Umlaufsinn IM AUSGEGEBENEN PFAD.
//
// Achtung, hier ist die Falle andersherum als bei der Eingabe: die Pfade
// liegen in Bildschirmkoordinaten, y zeigt nach UNTEN. Damit dreht sich das
// Vorzeichen der Schnürsenkelformel um. Ein Aussenring, der auf dem Schirm
// im Uhrzeigersinn laeuft - das, was d3-geo aus einem korrekten Eingabering
// macht - hat hier ein POSITIVES Vorzeichen.
//
// Das Tor hat beim ersten Lauf genau deshalb 23 von 23 Umrissen als falsch
// gemeldet. Nicht die Daten waren verkehrt, sondern die Pruefung.
let falscheRichtung = 0, entartet = 0;
for (const q of [...KONTINENTE_FEIN, ...DEUTSCHLAND_FEIN]) {
  const polys = pfadZuPolys(q.pfad);
  if (!polys.length) { entartet++; continue; }
  const groesster = polys.reduce((a,b)=>ringFlaeche(a)>ringFlaeche(b)?a:b);
  if (vorzeichenFlaeche(groesster) < 0) falscheRichtung++;
  if (ringFlaeche(groesster) <= 0) entartet++;
}
pruefe(falscheRichtung === 0,
  `${falscheRichtung} Außenringe laufen gegen den Uhrzeigersinn — d3-geo liest das als "der Rest der Kugel"`);
pruefe(entartet === 0, `${entartet} Gebiete mit Fläche 0`);
console.log(`    ${KONTINENTE_FEIN.length + DEUTSCHLAND_FEIN.length} Umrisse geprüft, `
  + `${falscheRichtung} falsch herum, ${entartet} entartet`);
// Anker liegt IM Gebiet.
//
// Ein FEHLENDER Anker liess das Tor hier mit einem TypeError abstuerzen -
// gefunden von `npm run proben`. Ein Absturz ist zwar rot, aber er sagt
// nichts: an der Stelle steht ein Stapelabzug statt eines Satzes, und das
// naechste Mal sucht jemand den Fehler im Tor statt in den Daten. Ein Tor
// muss auch kaputte Eingaben BEURTEILEN koennen, nicht nur richtige.
let ankerDraussen = 0, ankerFehlt = 0;
for (const s of STAEDTE) {
  if (!Array.isArray(s.anker) || s.anker.length !== 2
      || !Number.isFinite(s.anker[0]) || !Number.isFinite(s.anker[1])) {
    ankerFehlt++; continue;
  }
  const b = DEUTSCHLAND_FEIN.find(x=>x.id===s.id);
  if (!b) { ankerFehlt++; continue; }
  const polys = pfadZuPolys(b.pfad);
  const groesster = polys.reduce((a,c)=>ringFlaeche(a)>ringFlaeche(c)?a:c);
  if (!imPolygon(s.anker[0], s.anker[1], [groesster])) ankerDraussen++;
}
pruefe(ankerFehlt === 0, `${ankerFehlt} Gebiete haben keinen brauchbaren Anker`);
pruefe(ankerDraussen === 0, `${ankerDraussen} Anker liegen außerhalb ihres Gebiets`);
console.log(`    ${STAEDTE.length} Anker geprüft, ${ankerDraussen} außerhalb, ${ankerFehlt} fehlen`);

// Nadeln: Schnitte ohne Flaeche.
//
// Natural Earth speichert Antarktika fuer eine rechteckige Weltkarte. Der
// Umriss laeuft dort bei 180 Grad hinunter zum Pol, am unteren Rand entlang
// und bei -180 Grad wieder hinauf. Auf der Weltkarte deckt sich das mit dem
// Kartenrand und faellt nicht auf. In der polaren Aufsicht sind 180 und -180
// DIESELBE Linie: beide Schenkel liegen aufeinander und zeigen sich als
// Strich quer durch den Kontinent. Zu sehen war es nur im Bild - keines der
// Tore hat es gemeldet, weil eine Nadel weder die Flaeche noch die
// Umgrenzung noch den Umlaufsinn aendert.
//
// Erkannt wird sie daran, was sie ausmacht: zwei Punkte desselben Ringes
// fallen aufeinander, und der Weg dazwischen umschliesst nichts. Eine echte
// schmale Halbinsel hat Flaeche, eine Nadel nicht.
// Die Schwellen sind so gewaehlt, dass sie eine Naht treffen und eine
// Kuestenlinie in Ruhe lassen. Bei 1000 px Breite liegen benachbarte
// Kuestenpunkte der feinen Stufe teils enger als ein halbes Bildpunkt
// beieinander - eine blosse Deckung zweier Punkte ist deshalb KEIN Befund.
// Was eine Naht ausmacht, ist der lange Umweg, der nichts umschliesst:
// hin zum Pol und auf demselben Weg zurueck.
const NADEL_DECKUNG = 0.15;  // px, so genau fallen zwei Punkte aufeinander
const NADEL_WEG     = 20;    // px, kuerzere Umwege sind Kuestenkringel
// Die mittlere Breite trennt sauber: eine Naht laeuft auf sich selbst
// zurueck und hat exakt 0. Die duennsten ECHTEN Gebilde im Vorrat - ein
// paar Fjorde in Kanada, eine Nehrung in den USA - liegen bei 0,18 bis 0,27
// px. Dazwischen ist Platz. Sie werden als Hinweis gemeldet, nicht als
// Fehler: sie stehen so in der Wirklichkeit.
const NADEL_BREITE  = 0.05;  // px mittlere Breite - darunter ist es ein Schnitt
const DUENN_BREITE  = 0.3;   // px, darunter nur noch ein Haar breit
function nadeln(d) {
  let zahl = 0, laengste = 0, duenn = 0;
  for (const ring of pfadZuPolys(d)) {
    const eimer = new Map();
    ring.forEach((p, i) => {
      const k = `${Math.round(p[0]/NADEL_DECKUNG)},${Math.round(p[1]/NADEL_DECKUNG)}`;
      if (!eimer.has(k)) eimer.set(k, []);
      eimer.get(k).push(i);
    });
    for (const gruppe of eimer.values()) {
      for (let a = 0; a < gruppe.length; a++) for (let b = a+1; b < gruppe.length; b++) {
        const i = gruppe[a], j = gruppe[b];
        if (j - i < 3) continue;
        if (Math.hypot(ring[i][0]-ring[j][0], ring[i][1]-ring[j][1]) > NADEL_DECKUNG) continue;
        const teil = ring.slice(i, j+1);
        let weg = 0;
        for (let k = 1; k < teil.length; k++)
          weg += Math.hypot(teil[k][0]-teil[k-1][0], teil[k][1]-teil[k-1][1]);
        if (weg < NADEL_WEG) continue;
        const breite = ringFlaeche(teil) / (weg/2);
        if (breite > DUENN_BREITE) continue;
        if (breite > NADEL_BREITE) { duenn++; continue; }
        zahl++;
        if (weg > laengste) laengste = weg;
      }
    }
  }
  return { zahl, laengste, duenn };
}
let nadelZahl = 0, nadelWo = [], duennZahl = 0;
for (const [quelle, liste] of Object.entries(GEBACKEN)) {
  for (const q of liste) {
    const n = nadeln(q.pfad);
    duennZahl += n.duenn;
    if (n.zahl) { nadelZahl += n.zahl; nadelWo.push(`${quelle}/${q.name} (${n.zahl}, längste ${n.laengste.toFixed(0)} px)`); }
  }
}
if (duennZahl) hinweise.push(`${duennZahl} echte Gebilde sind nur ein Haar breit `
  + `(unter ${DUENN_BREITE} px mittlere Breite) — sie stehen so in der Wirklichkeit, `
  + `sind aber bei keiner Größe zu sehen`);
pruefe(nadelZahl === 0,
  `${nadelZahl} Nadeln ohne Fläche im Umriss: ${nadelWo.join(', ')} — auf einer anderen Projektion wird daraus ein Strich`);
console.log(`    ${Object.values(GEBACKEN).flat().length} Umrisse auf Nadeln geprüft, `
  + `${nadelZahl} gefunden, ${duennZahl} echte Haarlinien`);

/* =================================================== Tor `beruehrung` === */
console.log('\n  Tor `beruehrung`');
// Kleinste unterstuetzte Darstellung: iPhone quer, Karte 470 von 844 Punkten.
const KARTE_PX = 470, MIN_PT = 44;
const zuKlein = [];
for (const b of DEUTSCHLAND_FEIN) {
  const s = STAEDTE.find(x=>x.id===b.id);
  const durchmesserPx = s.radius * 2 * (KARTE_PX/1000);
  if (durchmesserPx < MIN_PT) zuKlein.push({ name:b.name, px:+durchmesserPx.toFixed(1) });
}
console.log(`    ${zuKlein.length} von ${DEUTSCHLAND_FEIN.length} Gebieten sind kleiner als `
  + `${MIN_PT} pt und brauchen eine entkoppelte Trefferfläche:`);
zuKlein.sort((a,b)=>a.px-b.px).forEach(z=>console.log(`      ${z.name.padEnd(24)} ${z.px} pt`));
hinweise.push(`${zuKlein.length} Gebiete brauchen eine entkoppelte Trefferfläche (Konzept 5.4)`);
// Ueberlappen sich zwei 44-pt-Kreise, gewinnt das kleinere.
let paare = 0;
const mitAnker = STAEDTE.filter(s => Array.isArray(s.anker) && s.anker.length === 2
  && Number.isFinite(s.anker[0]) && Number.isFinite(s.anker[1]));
for (let i=0;i<mitAnker.length;i++) for (let j=i+1;j<mitAnker.length;j++) {
  const a=mitAnker[i], b=mitAnker[j];
  const d = Math.hypot(a.anker[0]-b.anker[0], a.anker[1]-b.anker[1]) * (KARTE_PX/1000);
  if (d < MIN_PT) { paare++; hinweise.push(`Trefferkreise überlappen: ${a.name} / ${b.name} (${d.toFixed(0)} pt)`); }
}
console.log(`    ${paare} Paare mit überlappenden Trefferkreisen — dort gewinnt das kleinere Gebiet`);

// Bis hierher hat `beruehrung` nur BERICHTET. `npm run proben` hat das
// gemeldet: ein Tor ohne einen einzigen Fehlerpfad kann nicht rot werden,
// und von aussen sieht das aus wie eines, das alles bestanden hat.
//
// Die harte Zusage, die es zu bewachen gibt: die App baut die entkoppelte
// Trefferflaeche aus dem ANKER (`formen.filter(x => x.anker)`). Ein Gebiet,
// das zu klein ist und keinen Anker hat, bekommt keinen Kreis - und ist mit
// dem Finger dann an KEINER Stelle zu treffen. Es steht in den Daten, wird
// gezaehlt, erscheint auf der Karte und laesst sich nicht spielen.
{
  const ohneAnker = zuKlein
    .map(z => STAEDTE.find(x => x.name === z.name))
    .filter(s => !s || !Array.isArray(s.anker) || s.anker.length !== 2
      || !Number.isFinite(s.anker[0]) || !Number.isFinite(s.anker[1]));
  pruefe(ohneAnker.length === 0,
    `${ohneAnker.length} zu kleine Gebiete haben keinen Anker und damit keine `
    + `Trefferfläche — sie sind mit dem Finger nicht zu treffen`
    + (ohneAnker[0] ? ` (${ohneAnker.map(s => s?.name ?? '?').join(', ')})` : ''));
}

/* ====================================================== Tor `marken` ==== */
console.log('\n  Tor `marken`');
// NUR der Grundblock. Der Abendmodus definiert dieselben Marken absichtlich
// dunkler - beim ersten Lauf hat das Tor beide Bloecke gelesen und
// "unterschiedliche Helligkeit" gemeldet. Auch das war die Pruefung, nicht
// die Sache.
const MARKEN_ALLES = fs.readFileSync('src/marken/marken.css','utf8');
const MARKEN = MARKEN_ALLES.slice(MARKEN_ALLES.indexOf(':root {'),
                                 MARKEN_ALLES.indexOf(':root[data-abend'));
const QUELLEN = ['entwuerfe/koerper.html','entwuerfe/skript.html',
                'prototyp/spiel.js','prototyp/vorlage.html'];
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
let verstoesse = 0;
for (const q of QUELLEN) {
  if (!fs.existsSync(q)) continue;
  const t = fs.readFileSync(q,'utf8');
  if (EMOJI.test(t)) { fehler.push(`${q}: Emoji im Oberflächentext`); verstoesse++; }
  if (/filter:\s*drop-shadow/.test(t)) { fehler.push(`${q}: filter auf einem Pfad`); verstoesse++; }
  // `[^;}]*` statt `[^;]*`: die letzte Erklaerung einer Regel hat kein
  // Semikolon, also lief die Suche ueber die schliessende Klammer hinaus in
  // die naechste Regel - und meldete ein sauberes `transition:transform`
  // rot, weil zwei Zeilen weiter irgendwo `width` stand.
  const layout = t.match(/transition:[^;}]*\b(width|height|top|left|margin|padding)\b/g);
  if (layout) { fehler.push(`${q}: Animation auf Layouteigenschaft — ${layout[0]}`); verstoesse++; }
}
// Festgenagelte Masse IM MARKUP.
//
// `style="min-width:200px"` an einer Kachel hat die halbe Ebenenwahl aus
// dem Fenster geschoben - und war nicht zu finden, weil inline jede
// Stilregel schlaegt. Vier Groessen waren rot, waehrend im Stylesheet ein
// sauberes Raster stand, das gegen eine Zahl im Markup arbeitete.
//
// Erlaubt bleibt, was gerechnet wird (`${...}`) oder aus einer Marke kommt
// (`var(--r4)`). Verboten ist die nackte Zahl.
let inlineMasse = 0;
for (const q of ['prototyp/spiel.js', 'prototyp/vorlage.html']) {
  if (!fs.existsSync(q)) continue;
  for (const m of fs.readFileSync(q, 'utf8').matchAll(/style="([^"]*)"/g)) {
    const ohneRechnung = m[1].replace(/\$\{[^}]*\}/g, '');
    const zahlen = ohneRechnung.match(/-?\d*\.?\d+(px|rem|em|pt)/g);
    if (zahlen) {
      fehler.push(`${q}: festgenagelte Maße im Markup — style="${m[1]}" `
        + `(${zahlen.join(', ')}). Solche Werte gehören nach marken.css; `
        + `inline schlagen sie jede Stilregel und sind dort nicht zu finden.`);
      inlineMasse++;
    }
  }
}

// Farben, Dauern und Kanten NUR in marken.css.
//
// Das Tor pruefte bisher nur das Markup. Im Stylesheet standen vier Farben,
// eine Dauer und ein Dutzend Strichstaerken frei herum - und in spiel.js
// noch vier weitere Farben, unter anderem die der Sterne. Ein
// Gestaltungssystem, an dem man vorbeigreifen kann, ist keins.
//
// Bauteilmasse (44 pt Trefferflaeche, 76 px Mikrofon, 440 px Grenze) bleiben
// erlaubt: das sind Groessen, keine Marken. Die Grenze verlaeuft bei dem,
// was das Projekt sich vorgenommen hat - Farbe, Abstand, Radius, Strich,
// Dauer.
const SYSTEM = [
  { was:'Farbe',    muster:/oklch\([^)]*\)|#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g },
  { was:'Dauer',    muster:/(?<![\w-])\d+m?s(?![\w-])/g },
  { was:'Radius',   muster:/border-radius:\s*[^;}]*(?<![\w-])\d*\.?\d+(px|rem|em)/g },
  { was:'Strich',   muster:/border(-\w+)?:\s*[^;}]*(?<![\w-])\d*\.?\d+(px|rem|em)\s+(solid|dashed|dotted)/g },
  { was:'Abstand',  muster:/(?:^|[;{])\s*(?:gap|padding|margin)(-\w+)?:\s*[^;}]*(?<![\w-])\d*\.?\d+(px|rem)/g },
];
let amSystemVorbei = 0;
for (const q of ['prototyp/vorlage.html', 'prototyp/spiel.js']) {
  if (!fs.existsSync(q)) continue;
  let t = fs.readFileSync(q, 'utf8');
  // Der eingesetzte Markenblock ist die Quelle selbst - er darf alles.
  t = t.replace('__MARKEN__', '');
  // Kommentare zaehlen nicht.
  t = t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
       .replace(/^\s*\/\/.*$/gm, ' ');
  for (const { was, muster } of SYSTEM) {
    const treffer = [...new Set(t.match(muster) || [])];
    if (treffer.length) {
      fehler.push(`${q}: ${treffer.length} ${was}-Werte am System vorbei — `
        + `${treffer.slice(0, 4).map(x => x.trim().slice(0, 44)).join(' · ')}`
        + `${treffer.length > 4 ? ' …' : ''}. Gehört nach src/marken/marken.css.`);
      amSystemVorbei += treffer.length;
    }
  }
}

/* Jede benutzte Marke muss es geben.
 *
 * Der Audit fand `padding: var(--r3) var(--r5)` am gezogenen Schild - und
 * `--r5` gab es nicht. Das ist kein stiller Ausfall EINES Wertes: eine
 * ungueltige `var()` macht die GANZE Deklaration ungueltig, und weil
 * `padding` nicht erbt, blieb null uebrig. Der Name klebte an beiden
 * Rundungen des Schilds, seit die Regel geschrieben wurde.
 *
 * Kein Tor konnte das sehen: `passt` misst Ueberlauf, `lesbarkeit` misst
 * Kontrast, und das Vorbild im Bildvergleich hielt den Fehler als SOLL
 * fest. Ein Schreibfehler in einem Markennamen ist im Browser lautlos -
 * hier ist er es nicht mehr.
 *
 * Ausgenommen sind Marken, die im Markup gesetzt werden (`--ton`, `--rang`,
 * `--karte-ar`): sie kommen aus dem Programm, nicht aus dem System. Sie
 * muessen dort aber wirklich gesetzt werden, und genau das wird geprueft.
 */
{
  const alleQuellen = [MARKEN_ALLES, ...QUELLEN.filter(q => fs.existsSync(q))
    .map(q => fs.readFileSync(q, 'utf8'))].join('\n');
  const gesetzt = new Set([...alleQuellen.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
  // setProperty('--rang', …) definiert die Marke ebenfalls, nur ohne Doppelpunkt.
  for (const m of alleQuellen.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)) gesetzt.add(m[1]);
  // `var(--f${b.farbe})` ist ein gerechneter Name, kein fester. Solche
  // Stellen werden uebersprungen - der Name entsteht erst beim Zeichnen.
  const benutzt = [...new Set([...alleQuellen.matchAll(/var\(\s*(--[\w-]+)(\$\{)?/g)]
    .filter(m => !m[2]).map(m => m[1]))];
  const ohne = benutzt.filter(v => !gesetzt.has(v));
  pruefe(ohne.length === 0, `benutzt, aber nirgends gesetzt: ${ohne.join(', ')} — `
    + 'eine ungültige var() macht die ganze Deklaration ungültig, nicht nur den einen Wert');
  console.log(`    ${benutzt.length} benutzte Marken, alle gesetzt`);
}

pruefe(/--f1:\s*oklch/.test(MARKEN), 'Palette steht nicht in OKLCH');
// Gleiche Helligkeit auf allen sieben Flaechen - sonst ist derselbe
// Textton nicht auf allen lesbar.
//
// Bis zum Audit stand die Helligkeit siebenmal als Zahl da, und dieses Tor
// verglich die sieben Zahlen miteinander. Jetzt leiten sich die sieben aus
// EINER Marke ab; die alte Pruefung fand danach null Farben und waere rot
// geworden, ohne dass etwas kaputt war. Geprueft wird deshalb die Form,
// die die Gleichheit traegt: jede der sieben muss dieselbe Marke benutzen.
// Wer eine einzelne Farbe wieder festnagelt, faellt hier durch.
// `[^)]*` haette hier nicht gereicht: der Wert enthaelt selbst Klammern -
// oklch(var(--flaeche-l) var(--flaeche-c) 25). Der erste Anlauf zaehlte
// deshalb null von sieben und meldete einen Fehler, den es nicht gab.
const abgeleitet = (text) => [...text.matchAll(
  /--f([1-7]):\s*oklch\(\s*var\(--flaeche-l\)\s+var\(--flaeche-c\)\s+[\d.]+\s*\)/g)].length;
const helligkeit = (text) => [...text.matchAll(/--flaeche-l:\s*([\d.]+)/g)].map(m => +m[1]);
const abendTeil = MARKEN_ALLES.slice(MARKEN_ALLES.indexOf(':root[data-abend'));
const lTag = helligkeit(MARKEN), lAbend = helligkeit(abendTeil);
pruefe(abgeleitet(MARKEN) === 7,
  `nur ${abgeleitet(MARKEN)} von 7 Flächenfarben leiten sich aus --flaeche-l/--flaeche-c ab — `
  + 'eine festgenagelte Farbe fällt beim nächsten Griff an der Marke vorbei');
pruefe(lTag.length === 1, `--flaeche-l steht ${lTag.length}-mal im Tagmodus, erwartet einmal`);
pruefe(lAbend.length === 1, `--flaeche-l steht ${lAbend.length}-mal im Abendmodus, erwartet einmal`);
// Und die eine Zahl muss dunkel genug bleiben: der Textton --auf-flaeche
// liegt bei L 0,24, gemessen sind 6,1:1 bei L 0,74. Ueber 0,86 kippt das.
pruefe(lTag[0] >= 0.60 && lTag[0] <= 0.86,
  `Flächenhelligkeit ${lTag[0]} liegt außerhalb von 0,60 bis 0,86 — der dunkle Textton trägt dort nicht mehr`);
pruefe(lAbend[0] < lTag[0],
  `Abendmodus ist mit L ${lAbend[0]} nicht dunkler als der Tagmodus mit ${lTag[0]}`);
console.log(`    7 Flächenfarben aus einer Marke: L ${lTag[0]} am Tag, ${lAbend[0]} am Abend`);
console.log(`    ${verstoesse} Markenverstöße in ${QUELLEN.length} Quellen, `
  + `${inlineMasse} festgenagelte Maße im Markup, `
  + `${amSystemVorbei} Werte am System vorbei`);

/* ===================================================== Tor `schrift` === */
console.log('\n  Tor `schrift`');
//
// Die Schriften liegen nur im Schnitt `latin` im Baum - 51,6 KB statt 328.
// Das ist eine Zusage ueber den INHALT: kein angezeigter Name darf ein
// Zeichen ausserhalb dieses Bereichs brauchen. Wer sie bricht, sieht auf
// dem iPad ein leeres Kaestchen und sonst nichts - kein Absturz, keine
// Meldung, nur ein Name, den das Kind nicht lesen kann.
//
// Der Bereich wird NICHT hier festgeschrieben, sondern aus der erzeugten
// schrift.css gelesen. Aendert Google den Schnitt, wandert die Pruefung mit.
{
  const cssPfad = path.join(process.cwd(), 'src/schrift/schrift.css');
  if (!fs.existsSync(cssPfad)) {
    pruefe(false, 'src/schrift/schrift.css fehlt — `npm run schrift` wurde nie ausgeführt');
  } else {
    const css = fs.readFileSync(cssPfad, 'utf8');
    const bereiche = [];
    for (const m of css.matchAll(/U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?/g))
      bereiche.push([parseInt(m[1], 16), parseInt(m[2] || m[1], 16)]);
    pruefe(bereiche.length > 0, 'schrift.css nennt keinen einzigen Zeichenbereich');
    const drin = (c) => bereiche.some(([a, b]) => c >= a && c <= b);

    // Was geprueft wird: alles, was als Name auf dem Schirm landen kann,
    // plus der Text der Oberflaeche. Der Inhalt waechst - dort passiert es.
    const quellen = [];
    const sammle = (was, wo) => {
      if (typeof was === 'string') quellen.push([was, wo]);
      else if (Array.isArray(was)) was.forEach(x => sammle(x, wo));
      else if (was && typeof was === 'object')
        for (const [k, v] of Object.entries(was)) sammle(v, wo);
    };
    sammle(I.KONTINENTE, 'Kontinente');
    sammle(I.LAENDER, 'Länder');
    sammle(I.HAUPTSTADT_ABLENKER, 'Ablenker');
    sammle(STAEDTE.map(x => x.hauptstadt), 'Hauptstädte');
    sammle(DEUTSCHLAND_FEIN.map(x => x.name), 'Bundesländer');
    for (const [quelle, liste] of Object.entries(GEBACKEN))
      sammle(liste.map(x => x.name).filter(Boolean), quelle);
    // Kommentare zaehlen nicht: sie werden nie angezeigt. Ohne das Streichen
    // meldet das Tor genau den Kommentar rot, der seinen eigenen Befund
    // beschreibt - und der Weg aus dem Rot waere, den Grund zu loeschen.
    const ohneKommentar = (t) => t
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/^\s*\/\/.*$/gm, ' ');
    for (const datei of ['prototyp/spiel.js', 'prototyp/vorlage.html'])
      quellen.push([ohneKommentar(fs.readFileSync(path.join(process.cwd(), datei), 'utf8')), datei]);

    const fehlend = new Map();
    for (const [text, wo] of quellen)
      for (const z of text) {
        const c = z.codePointAt(0);
        if (!drin(c)) {
          const k = `U+${c.toString(16).toUpperCase().padStart(4,'0')} „${z}"`;
          if (!fehlend.has(k)) fehlend.set(k, new Set());
          fehlend.get(k).add(wo);
        }
      }
    pruefe(fehlend.size === 0, `${fehlend.size} Zeichen liegen außerhalb des Schnitts `
      + `latin: ${[...fehlend].map(([k,w])=>`${k} in ${[...w].join('/')}`).join(', ')}`);
    console.log(`    ${quellen.length} Texte gegen ${bereiche.length} Zeichenbereiche geprüft, `
      + `${fehlend.size} Zeichen ohne Schrift`);
  }
}

/* ====================================================== Tor `symbol` === */
console.log('\n  Tor `symbol`');
//
// Ein Symbol faellt nicht auf, wenn es kaputt ist - es steht auf dem
// Startbildschirm und niemand sieht es sich noch einmal an. Geprueft wird
// deshalb das Mechanische, so wie `bildtor` es im anderen Projekt tut.
{
  const NOETIG = [180, 192, 512, 1024];
  const symbolDir = path.join(process.cwd(), 'src/symbol');
  for (const g of NOETIG) {
    const f = path.join(symbolDir, `symbol-${g}.png`);
    if (!fs.existsSync(f)) { pruefe(false, `symbol-${g}.png fehlt`); continue; }
    const bild = PNG.sync.read(fs.readFileSync(f));
    pruefe(bild.width === g && bild.height === g,
      `symbol-${g}.png ist ${bild.width}×${bild.height}, erwartet ${g}×${g}`);

    // iOS legt Durchsichtigkeit auf SCHWARZ. Ein Symbol mit Alpha sieht im
    // Entwurf gut aus und auf dem Startbildschirm nach Loch.
    let durchsichtig = 0;
    for (let i = 3; i < bild.data.length; i += 4) if (bild.data[i] < 255) durchsichtig++;
    pruefe(durchsichtig === 0,
      `symbol-${g}.png hat ${durchsichtig} durchsichtige Bildpunkte — iOS legt die auf Schwarz`);

    // Nicht einfarbig. Eine leere Flaeche besteht jede andere Pruefung.
    const toene = new Set();
    for (let i = 0; i < bild.data.length; i += 4)
      toene.add((bild.data[i] >> 3 << 10) | (bild.data[i+1] >> 3 << 5) | (bild.data[i+2] >> 3));
    pruefe(toene.size > 40, `symbol-${g}.png hat nur ${toene.size} Farbtöne — vermutlich leer`);

    // Die Kugel muss INNERHALB der iOS-Maske liegen. iOS schneidet die Ecken
    // rund ab; was dort steht, ist weg. Geprueft an den vier Ecken: dort darf
    // nur Grund stehen, kein Meer und kein Land.
    const punkt = (x, y) => { const i = (bild.width * y + x) << 2;
      return [bild.data[i], bild.data[i+1], bild.data[i+2]]; };
    const mitte = punkt(g >> 1, g >> 1);
    const rand = Math.round(g * 0.045);
    let eckenWieMitte = 0;
    for (const [x, y] of [[rand,rand], [g-1-rand,rand], [rand,g-1-rand], [g-1-rand,g-1-rand]]) {
      const e = punkt(x, y);
      const d = Math.max(Math.abs(e[0]-mitte[0]), Math.abs(e[1]-mitte[1]), Math.abs(e[2]-mitte[2]));
      if (d < 40) eckenWieMitte++;
    }
    pruefe(eckenWieMitte === 0,
      `symbol-${g}.png: ${eckenWieMitte} Ecken sehen aus wie die Mitte — die Kugel läuft in die iOS-Maske`);
  }
  console.log(`    ${NOETIG.length} Größen geprüft: quadratisch, undurchsichtig, nicht leer, `
    + `Kugel innerhalb der Maske`);
}

/* ======================================================== Tor `doku` ==== */
console.log('\n  Tor `doku`');
// `../docs/…` war ein Rest aus der Zeit, als der Baum unter
// `towerfront/lernkiste/` lag. Seit dem Umzug zeigt der Pfad AUS dem
// Verzeichnis heraus, die Datei ist dort nicht, und `existsSync` war
// falsch - also lief die ganze Pruefung nicht mehr. Gemeldet hat das
// niemand: sie uebersprang sich still, und still ist gruen.
//
// Gefunden hat es `npm run proben`: die Gegenprobe drehte die Gebietszahl
// im Konzept um sieben, und das Tor blieb gruen.
//
// Ein fehlendes Konzept ist deshalb jetzt ein FEHLER, kein Achselzucken.
const KONZEPT = 'docs/Lernkiste-KONZEPT.md';
if (!fs.existsSync(KONZEPT)) {
  fehler.push(`${KONZEPT} nicht gefunden — die Doku-Prüfung kann nicht laufen `
    + '(ein Tor, das sich still überspringt, ist schlimmer als keines)');
} else {
  const t = fs.readFileSync(KONZEPT,'utf8');
  const m = t.match(/Gebiete gesamt \| \*\*(\d+)\*\*/);
  if (!m) hinweise.push('Konzept nennt keine Gebietszahl');
  else if (+m[1] !== ZAHL.gesamt)
    fehler.push(`Konzept sagt ${m[1]} Gebiete, gezählt sind ${ZAHL.gesamt} `
      + `(${ZAHL.kontinente}+${ZAHL.laender}+${ZAHL.bundeslaender}+${ZAHL.staedte})`);
  else console.log(`    Gebietszahl stimmt: ${ZAHL.gesamt}`);
}

/* Fionas Rechnen: der Code gegen den Abgleich.
 *
 * Die Verteilungen stehen im Dokument und nicht im Programm - dieselbe
 * Mechanik wie beim Tor `budget`, das seine Grenzen aus dem Konzept liest.
 * Zwei Zahlen an zwei Orten veralten getrennt: die eine wird gepflegt, die
 * andere gilt. Hier wird die gepflegte zur geltenden gemacht.
 *
 * Geprüft wird gegen den ERZEUGTEN Vorrat, nicht gegen eine dritte Liste:
 * `rechnen.js` rechnet die hundert Aufgaben aus, dieses Tor zählt sie.
 */
{
  const ABGLEICH = 'docs/Lernkiste-ABGLEICH-ANTON.md';
  if (!fs.existsSync(ABGLEICH)) {
    fehler.push(`${ABGLEICH} nicht gefunden — Fionas Rechnen lässt sich nicht prüfen`);
  } else {
    const t = fs.readFileSync(ABGLEICH, 'utf8');
    const zahl = (zeile) => {
      const m = t.match(new RegExp(`\\|\\s*${zeile}\\s*\\|\\s*(\\d+)`));
      return m ? +m[1] : null;
    };
    const soll = {
      raum:  zahl('Zahlenraum'),
      plus:  zahl('Anteil Addition'),
      minus: zahl('Anteil Subtraktion'),
      nPlus: zahl('Aufgaben mit Plus'),
      nMinus:zahl('Aufgaben mit Minus'),
    };
    const fehlend = Object.entries(soll).filter(([, v]) => v === null).map(([k]) => k);
    if (fehlend.length) {
      fehler.push(`${ABGLEICH} nennt ${fehlend.length} Werte für Fionas Rechnen nicht: `
        + `${fehlend.join(', ')} — dann prüft dieses Tor nichts`);
    } else {
      const v = R.vorrat();
      const ist = {
        raum:  R.BIS,
        plus:  Math.round(R.MISCHUNG_FIONA.plus * 100),
        minus: Math.round(R.MISCHUNG_FIONA.minus * 100),
        nPlus: v.filter(x => x.rechenart === 'plus').length,
        nMinus:v.filter(x => x.rechenart === 'minus').length,
      };
      for (const k of Object.keys(soll))
        pruefe(soll[k] === ist[k],
          `Fionas Rechnen, ${k}: der Abgleich sagt ${soll[k]}, gerechnet sind ${ist[k]}`);
      pruefe(ist.plus + ist.minus === 100,
        `Die Anteile ergeben ${ist.plus + ist.minus} statt 100 Prozent`);
      // Die Regel, die aus „wenig mit 0" geworden ist: nur als Ergebnis.
      const mitNull = v.filter(x => x.a === 0 || x.b === 0).length;
      pruefe(mitNull === 0,
        `${mitNull} Aufgaben haben die Null als Summand oder Subtrahend — `
        + 'sie soll nur als Ergebnis vorkommen');
      pruefe(v.every(x => x.wert >= 0 && x.wert <= R.BIS),
        'eine Aufgabe verlässt den Zahlenraum');
      pruefe(new Set(v.map(x => x.id)).size === v.length,
        'zwei Rechenaufgaben haben dieselbe Kennung — dann teilen sie sich einen Leitner-Stand');
      console.log(`    Fionas Rechnen: ${v.length} Aufgaben, `
        + `${ist.plus}/${ist.minus} Prozent, Zahlenraum ${ist.raum} — wie im Abgleich`);
    }
  }
}

/* Leas Reihen: derselbe Griff, andere Zahlen.
 *
 * Getrennt von Fionas Block, obwohl das halbe Gerüst dasselbe ist. Der
 * Grund steht in der Ausgabe: fällt hier etwas um, soll dastehen, WESSEN
 * Fach kaputt ist. Ein gemeinsamer Block hätte „Rechnen, nMinus: der
 * Abgleich sagt 55" gemeldet, und man müsste raten, welches Kind gemeint
 * ist.
 */
{
  const ABGLEICH = 'docs/Lernkiste-ABGLEICH-ANTON.md';
  if (fs.existsSync(ABGLEICH)) {
    const t = fs.readFileSync(ABGLEICH, 'utf8');
    const zahl = (zeile) => {
      const m = t.match(new RegExp(`\\|\\s*${zeile}\\s*\\|\\s*(\\d+)`));
      return m ? +m[1] : null;
    };
    const soll = {
      von:        zahl('Reihen von'),
      bis:        zahl('Reihen bis'),
      geteilt:    zahl('Anteil Division'),
      geteiltMax: zahl('Anteil Division höchstens'),
      nMal:       zahl('Aufgaben mit Mal'),
      nZehner:    zahl('Aufgaben mit Zehn'),
      nGeteilt:   zahl('Aufgaben mit Geteilt'),
      nLeicht:    zahl('Leichtere Aufgaben'),
    };
    const fehlend = Object.entries(soll).filter(([, v]) => v === null).map(([k]) => k);
    if (fehlend.length) {
      fehler.push(`${ABGLEICH} nennt ${fehlend.length} Werte für Leas Reihen nicht: `
        + `${fehlend.join(', ')} — dann prüft dieses Tor nichts`);
    } else {
      const v = R.reihenVorrat();
      const zaehl = (a) => v.filter(x => x.rechenart === a).length;
      const ist = {
        von:        R.REIHEN[0],
        bis:        R.REIHEN[R.REIHEN.length - 1],
        geteilt:    Math.round(R.GETEILT_STANDARD * 100),
        geteiltMax: Math.round(R.GETEILT_HOECHSTENS * 100),
        nMal:       zaehl('mal'),
        nZehner:    zaehl('zehner'),
        nGeteilt:   zaehl('geteilt'),
        nLeicht:    zaehl('leicht'),
      };
      for (const k of Object.keys(soll))
        pruefe(soll[k] === ist[k],
          `Leas Reihen, ${k}: der Abgleich sagt ${soll[k]}, gerechnet sind ${ist[k]}`);

      /* Die Mischung muss an JEDER Reglerstellung aufgehen.
       *
       * Vier Anteile, die zusammen 1 ergeben müssen, ergeben irgendwann
       * nicht mehr 1 — deshalb sind drei davon abgeleitet. Geprüft wird
       * es trotzdem: eine Ableitung, die niemand nachrechnet, ist eine
       * Behauptung.
       */
      for (let g = 0; g <= 100; g += 5) {
        const m = R.mischungLea(g / 100);
        const summe = Object.values(m).reduce((a, b) => a + b, 0);
        pruefe(Math.abs(summe - 1) < 1e-9,
          `Leas Mischung bei ${g} % Division ergibt ${summe.toFixed(4)} statt 1`);
        pruefe(m.geteilt <= R.GETEILT_HOECHSTENS + 1e-9,
          `Der Regler lässt bei ${g} % ${Math.round(m.geteilt * 100)} % Division zu — `
          + `höchstens sind ${Math.round(R.GETEILT_HOECHSTENS * 100)} %`);
        pruefe(Object.values(m).every(x => x >= 0),
          `Leas Mischung bei ${g} % hat einen negativen Anteil`);
      }

      // „weniger × 10" — und zwar nachgerechnet, nicht behauptet. Von
      // Natur aus steckt in 14 der 50 Reihenaufgaben eine Zehn; ein Anteil,
      // der nicht darunter liegt, hat nichts verringert.
      const natuerlich = ist.nZehner / (ist.nMal + ist.nZehner);
      pruefe(R.ANTEIL_ZEHNER < natuerlich,
        `Die Zehnerreihe soll seltener drankommen: von Natur aus `
        + `${Math.round(natuerlich * 100)} %, eingestellt sind `
        + `${Math.round(R.ANTEIL_ZEHNER * 100)} %`);

      // Jede Division geht auf, jede Zahl bleibt sagbar.
      const krumm = v.filter(x => !Number.isInteger(x.wert));
      pruefe(krumm.length === 0,
        `${krumm.length} Aufgaben gehen nicht auf, z. B. ${krumm[0]?.frage}`);
      pruefe(v.every(x => x.wert >= 0 && x.wert <= 100),
        'eine Aufgabe verlässt den Zahlenraum bis 100');

      // Kennungen: innerhalb Leas Vorrat und gegen Fionas.
      pruefe(new Set(v.map(x => x.id)).size === v.length,
        'zwei von Leas Aufgaben haben dieselbe Kennung');
      const fionaIds = new Set(R.vorrat().map(x => x.id));
      const doppelt = v.filter(x => fionaIds.has(x.id));
      pruefe(doppelt.length === 0,
        `${doppelt.length} Kennungen kommen in beiden Fächern vor (${doppelt[0]?.id}) — `
        + 'im Elternprotokoll stünde dann die falsche Aufgabe');

      console.log(`    Leas Reihen: ${v.length} Aufgaben `
        + `(${ist.nMal} mal, ${ist.nZehner} mit Zehn, ${ist.nGeteilt} geteilt, `
        + `${ist.nLeicht} leicht), Reihen ${ist.von} bis ${ist.bis}, `
        + `${100 - ist.geteilt}/${ist.geteilt} Prozent — wie im Abgleich`);
    }
  }
}

/* Die Kette in CLAUDE.md gegen die Kette in package.json.
 *
 * Beim Audit standen in CLAUDE.md zwölf Tore und in `npm run tor` liefen
 * vierzehn: `rhythmus`, `spielprobe`, `budget`, `passt`, `lesbarkeit` und
 * `ziehen` sind dazugekommen, ohne dass die Datei es erfahren haette. Wer
 * die Datei liest - und sie wird zu Beginn JEDER Sitzung gelesen - haelt
 * sechs Tore fuer nicht vorhanden.
 *
 * Verglichen werden Mengen, nicht Reihenfolgen: die Reihenfolge steht in
 * package.json und braucht keine zweite Fassung. Was zaehlt, ist, dass
 * kein Tor fehlt und keines erfunden ist. Regel 6.
 */
const ANWEISUNG = 'CLAUDE.md';
if (!fs.existsSync(ANWEISUNG)) {
  fehler.push(`${ANWEISUNG} nicht gefunden — die Kette lässt sich nicht vergleichen`);
} else {
  const paket = JSON.parse(fs.readFileSync('package.json','utf8'));
  const echt = new Set((paket.scripts.tor || '').split('&&')
    .map(x => x.trim().replace(/^npm run /,'')).filter(Boolean));
  // Manche Tore tragen weitere in sich: `inhalt` faehrt sieben, `pwa` zwei.
  // Sie stehen zu Recht in CLAUDE.md, aber in keiner Zeile von package.json.
  // Gezaehlt werden sie da, wo sie sich melden - an ihrer eigenen
  // Ueberschrift -, nicht in einer dritten Liste, die wieder veralten kann.
  for (const t of [...echt]) {
    const datei = `tor/${t}.mjs`;
    if (!fs.existsSync(datei)) continue;
    for (const m of fs.readFileSync(datei,'utf8')
      .matchAll(/console\.log\('\\n  Tor `([a-zäöüß-]+)`/g)) echt.add(m[1]);
  }
  const text = fs.readFileSync(ANWEISUNG,'utf8');
  const zeile = text.match(/^Kette:[\s\S]*?\n\n/m);
  if (!zeile) fehler.push(`${ANWEISUNG} nennt keine Kette (Zeile „Kette: …")`);
  else {
    const genannt = new Set([...zeile[0].matchAll(/`([a-zäöüß-]+)`/g)].map(m => m[1]));
    const fehlt = [...echt].filter(t => !genannt.has(t));
    const zuviel = [...genannt].filter(t => !echt.has(t));
    if (fehlt.length) fehler.push(`${ANWEISUNG} kennt ${fehlt.length} Tore der Kette nicht: `
      + `${fehlt.join(', ')} — die Datei wird zu Beginn jeder Sitzung gelesen`);
    if (zuviel.length) fehler.push(`${ANWEISUNG} nennt ${zuviel.length} Tore, `
      + '`npm run tor` nicht fährt: ' + zuviel.join(', '));
    if (!fehlt.length && !zuviel.length)
      console.log(`    Kette stimmt: ${echt.size} Tore in CLAUDE.md und in package.json`);
  }

  /* Die Vorschau darf nicht zur Auslieferung werden.
   *
   * `vorschau.yml` fährt nur die Tore ohne Browser - das ist der ganze
   * Sinn, anderthalb Minuten statt vier. Genau deshalb ist sie die
   * gefährlichste Datei im Baum: eine Abkürzung, die man versehentlich
   * nimmt, wäre keine Abkürzung, sondern das Ende der Torkette.
   *
   * Drei Zusagen werden hier festgehalten:
   *   1. Die Auslieferung fährt weiterhin die VOLLE Kette.
   *   2. Die Vorschau läuft nicht auf `main`.
   *   3. Was sie NICHT prüft, steht in ihr drin - namentlich, jedes Tor.
   *
   * Die dritte ist die wichtigste und die, die sonst verrottet: kommt ein
   * Tor dazu, fährt die Vorschau es nicht und verschweigt es. Wer dann
   * eine Vorschau ansieht, hält sie für geprüft.
   */
  const AUSL = '.github/workflows/auslieferung.yml';
  const VORS = '.github/workflows/vorschau.yml';
  const VERS = '.github/workflows/vorschau-versand.yml';
  if (fs.existsSync(VORS)) {
    const v = fs.readFileSync(VORS, 'utf8');
    const a = fs.existsSync(AUSL) ? fs.readFileSync(AUSL, 'utf8') : '';
    pruefe(/npm run tor:runner/.test(a),
      `${AUSL} fährt nicht mehr die volle Kette (\`npm run tor:runner\`)`);
    pruefe(!/branches:\s*\[[^\]]*\bmain\b/.test(v),
      `${VORS} läuft auf \`main\` — dann geht Ungeprüftes dorthin, wo die Kinder spielen`);

    /* Wer nach Pages schickt, schickt BEIDE Hälften.
     *
     * Pages kennt eine Seite je Verzeichnis. Ein Ablauf, der nur seine
     * eigene Hälfte hochlädt, löscht die andere - die Auslieferung die
     * Vorschau, während jemand sie ansieht, oder der Versand der Vorschau
     * das Spiel der Kinder. Geprüft wird deshalb nicht, WER was tut,
     * sondern die Eigenschaft, die das verhindert: jede Datei, die einen
     * Pages-Anhang hochlädt, muss vorher `seite-zusammenstellen.mjs`
     * gerufen haben.
     */
    const ablaeufe = fs.readdirSync('.github/workflows')
      .filter(f => f.endsWith('.yml')).map(f => ['.github/workflows/' + f]);
    for (const [datei] of ablaeufe) {
      const t = fs.readFileSync(datei, 'utf8');
      if (!/upload-pages-artifact/.test(t)) continue;
      pruefe(/tools\/seite-zusammenstellen\.mjs/.test(t),
        `${datei} lädt einen Pages-Anhang hoch, ohne die Seite zusammenzustellen — `
        + 'das löscht die andere Hälfte');
    }

    /* Und der Versand der Vorschau darf `/` nicht ungeprüft überschreiben.
     *
     * Er baut `main` neu, ohne die Kette zu fahren - das ist die
     * eingesparte Zeit. Also muss er NACHSEHEN, ob genau dieser Stand
     * schon einmal durchgegangen ist. Ohne den Schritt könnte eine
     * Vorschau einen roten `main`-Stand unter `/` schieben.
     */
    if (fs.existsSync(VERS)) {
      const w = fs.readFileSync(VERS, 'utf8');
      pruefe(/head_sha=/.test(w) && /auslieferung\.yml\/runs/.test(w),
        `${VERS} sieht nicht nach, ob dieser Stand von main die Kette bestanden hat — `
        + 'dann kann eine Vorschau Ungeprüftes unter `/` schieben');
      pruefe(/workflow_run/.test(w),
        `${VERS} wird nicht mehr durch \`workflow_run\` ausgelöst — nur so läuft er `
        + 'im Zusammenhang des Standardzweigs und darf überhaupt versenden');
    }

    // Welche Tore fährt die Vorschau wirklich? Aus ihr gelesen, nicht geraten.
    const gefahren = new Set([...v.matchAll(/node tor\/([a-zäöüß-]+)\.mjs/g)].map(m => m[1]));
    for (const t of [...gefahren]) {
      const datei = `tor/${t}.mjs`;
      if (!fs.existsSync(datei)) continue;
      for (const m of fs.readFileSync(datei, 'utf8')
        .matchAll(/console\.log\('\\n  Tor `([a-zäöüß-]+)`/g)) gefahren.add(m[1]);
    }
    const ungeprueft = [...echt].filter(t => t !== 'bauen' && !gefahren.has(t));
    const verschwiegen = ungeprueft.filter(t => !new RegExp(`\\b${t}\\b`).test(v));
    pruefe(verschwiegen.length === 0,
      `${VORS} verschweigt ${verschwiegen.length} Tore, die sie nicht fährt: `
      + `${verschwiegen.join(', ')} — wer die Vorschau ansieht, hält sie für geprüft`);
    console.log(`    Vorschau: ${gefahren.size} Tore gefahren, `
      + `${ungeprueft.length} ausdrücklich genannt und ausgelassen`);
  }
}

/* ------------------------------------------------------------- Ergebnis */
console.log('');
hinweise.forEach(h=>console.log(`  Hinweis: ${h}`));
if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER:`);
  fehler.forEach(f=>console.log(`    ✗ ${f}`));
  process.exit(1);
}
// Die Zahl wird GEZAEHLT, nicht hingeschrieben: hier stand "Alle vier Tore
// grün", während längst sechs liefen. Eine Zahl, die niemand nachrechnet,
// veraltet still.
const torZahl = (fs.readFileSync(new URL(import.meta.url), 'utf8')
  .match(/^console\.log\('\\n  Tor `/gm) || []).length;
console.log(`\n  Alle ${torZahl} Tore grün. ${ids.size} eindeutige IDs, ${ZAHL.gesamt} Gebiete.`);
