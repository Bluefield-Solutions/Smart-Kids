import fs from 'node:fs';
import zlib from 'node:zlib';
import { KONTINENTE_GROB } from '../src/geo/kontinente.grob.js';
import { DEUTSCHLAND_GROB } from '../src/geo/deutschland.grob.js';
import { DEUTSCHLAND_MITTEL } from '../src/geo/deutschland.mittel.js';
import { KARTEN_GROB } from '../src/geo/karten.grob.js';
import { STAEDTE } from '../src/geo/staedte.js';
import * as I from '../src/inhalt/erdkunde.js';
import { inline } from './inline.mjs';
import { polDerUnzugaenglichkeit, pfadZuRingen,
         ringeZuPolygonen, sichtfeld } from '../tools/geo-backen.mjs';

const NACHBARN = JSON.parse(fs.readFileSync(new URL('./nachbarn.json', import.meta.url)));
function vierfaerben(ids){
  const reihe=[...ids].sort((a,b)=>(NACHBARN[b]||[]).length-(NACHBARN[a]||[]).length), f={};
  for(const id of reihe){ const belegt=new Set((NACHBARN[id]||[]).map(n=>f[n]).filter(x=>x!==undefined));
    let c=0; while(belegt.has(c))c++; f[id]=c; }
  const konflikte=Object.entries(NACHBARN).flatMap(([a,ns])=>ns.filter(b=>f[a]===f[b]));
  if(konflikte.length) throw new Error('Vierfärbung: Nachbarn gleich');
  return f;
}
/** Anker fuer jede Form - der Marker im Spiel haengt daran.
 *
 * Hier stand eine EIGENE Fassung von `pfadZuPolys` mit
 * `polys.push([ring])`: jeder Ring ein Polygon ohne Loch. Dieselbe Zeile
 * stand in `tools/backen-staedte.mjs` und hat dort Brandenburg seinen
 * Anker mitten in Berlin gegeben (F16). Sie stand hier ein zweites Mal -
 * fuer die Kontinente und fuer alle sechzig Laender, also fuer Suedafrika
 * mit Lesotho darin und fuer Italien mit San Marino und dem Vatikan.
 *
 * Beide lesen jetzt dieselben Funktionen aus `geo-backen.mjs`. Was zweimal
 * dasteht, veraltet einmal - hier war es viermal (Regel 6).
 */
function ankerFuer(liste){
  return liste.map(x=>{
    const pu = polDerUnzugaenglichkeit(ringeZuPolygonen(pfadZuRingen(x.pfad)));
    return { ...x, anker: pu ? [+pu.punkt[0].toFixed(1), +pu.punkt[1].toFixed(1)] : null };
  });
}

const kont = new Map(I.KONTINENTE.map(k=>[k.id,k]));
/** Die Laenderkarten. Fuenf Kontinente - Australien hat keine - und EIN
 *  Ausschnitt: Mittelamerika, weil neun Laender dort auf der
 *  Nordamerikakarte nicht zu treffen waren (A6, Tafel in
 *  `tools/backen-laender.mjs`). Die Reihenfolge ist die der Kacheln in der
 *  Ebenenwahl; Mittelamerika steht neben Nordamerika, wo es hingehoert. */
const KACHELFOLGE = ['europa', 'afrika', 'asien',
                    'nordamerika', 'mittelamerika', 'suedamerika'];
/* Die Umrisse kommen aus dem ERZEUGTEN Verzeichnis, die Reihenfolge von
 * hier. Wer eine Karte backt und hier zu nennen vergisst, faellt sofort
 * auf - statt eine Kachel zu bekommen, die niemand sieht. */
{
  const gebacken = Object.keys(KARTEN_GROB).sort().join(',');
  const genannt = [...KACHELFOLGE].sort().join(',');
  if (gebacken !== genannt)
    throw new Error(`Kachelfolge und gebackene Karten gehen auseinander:\n`
      + `  gebacken: ${gebacken}\n  genannt:  ${genannt}`);
}
const KONT_LAENDER = KACHELFOLGE.map(id => [id, KARTEN_GROB[id]]);

/* Was auf WELCHER Karte ein Ziel ist - je Ebene, nicht je Kennung.
 *
 * Hier stand eine FLACHE Tafel `a3 -> Land` ueber alle Kontinente. Das
 * ging gut, solange jedes Land auf genau einer Karte lag. Mit dem
 * Ausschnitt Mittelamerika (A6) liegt Guatemala auf zweien - gefragt wird
 * es nur auf der einen, gezeichnet wird es auf beiden. Die flache Tafel
 * hat daraus prompt ein Ziel auf BEIDEN gemacht: der Bau meldete 81
 * Laender statt 65, weil neun doppelt zaehlten und Kolumbien und
 * Venezuela als Ziele im Ausschnitt auftauchten, wo sie nur Kuestenlinie
 * sind.
 *
 * Die Zugehoerigkeit steht in `erdkunde.js` und nirgends sonst: unter
 * welchem SCHLUESSEL ein Land dort steht, dort ist es Ziel. */
const meta = Object.fromEntries(Object.entries(I.LAENDER)
  .map(([k, l]) => [k, Object.fromEntries(l.map(x => [x.a3, x]))]));
const zielAuf = (id, a3) => (meta[id] || {})[a3] || null;

const D = {
  // Welche Kontinente es gibt, steht in `src/inhalt/erdkunde.js` - nicht in
  // den Geodaten. Der Bildvorrat haelt sieben Umrisse, gespielt werden
  // sechs: Antarktika ist ausgenommen (siehe dort). Gefiltert wird hier,
  // damit ein Umriss ohne Eintrag nicht stillschweigend mit leerem Namen
  // durchrutscht.
  kontinente: ankerFuer(KONTINENTE_GROB.filter(k=>kont.has(k.id))
    .map(k=>({ ...k, ...kont.get(k.id) }))),
  // ALLE fuenf Kontinente mit Laendern. Vorher waren nur Europa und Afrika
  // verdrahtet: die Torkette zaehlte 25 Laender, spielbar waren 10. Asien,
  // Nord- und Suedamerika lagen gebacken im Baum und waren nicht zu
  // erreichen. (Australien hat keine Laenderebene - so vereinbart.)
  /* Gefiltert wird nach dem Rang aus `erdkunde.js`, NICHT nach dem
   * gebackenen.
   *
   * Hier stand `roh.filter(l => l.rang)` - und `l` ist das gebackene
   * Stueck. Sein `rang` stammt aus dem Lauf von `backen-laender.mjs`,
   * also aus dem Stand von `erdkunde.js` an jenem Tag. Als D2c fuenf
   * Nachbarn einen Rang bekam, blieb der Bau bei sechzig Laendern: die
   * fuenf standen in `erdkunde.js`, aber im gebackenen Umriss stand
   * `rang: null`, und das Sieb war das alte.
   *
   * Dieselbe Falle wie bei den Nachbarn selbst, nur eine Ebene tiefer:
   * die Geometrie ist der Vorrat, nicht die Ware. Was gespielt wird,
   * entscheidet `erdkunde.js` - hier und nirgends sonst. */
  laender: Object.fromEntries(KONT_LAENDER.map(([id, roh]) =>
    [id, ankerFuer(roh.filter(l => zielAuf(id, l.a3))
      .map(l=>({ ...l, ...zielAuf(id, l.a3),
      // Ebene „Hauptstädte in Europa" (R6). `hauptstadt`, `ort` und
      // `regierungssitz` kommen gebacken aus `roh`; hier kommen nur die
      // Ablenker dazu - und `falle` wird ABGELEITET, nicht behauptet:
      // wahr genau dort, wo Natural Earth einen abweichenden
      // Regierungssitz kennt.
      ablenker: I.HAUPTSTADT_ABLENKER_EUROPA[l.a3] || [],
      falle: !!l.regierungssitz })))])),
  deutschland: DEUTSCHLAND_MITTEL.map(b=>{
    const s = STAEDTE.find(x=>x.id===b.id);
    return { id:b.id, name:b.name, pfad:b.pfad, hauptstadt:s.hauptstadt,
             stadtstaat:s.stadtstaat, anker:s.anker,
             ablenker: I.HAUPTSTADT_ABLENKER[b.id] || [],
             falle: I.ECHTE_FALLEN.includes(b.id) };
  }),
  farben: vierfaerben(DEUTSCHLAND_MITTEL.map(b=>b.id)),
};
// Die Weltkarte wird auf das GERAHMT, was gespielt wird.
//
// Frueher wurde sie knapp unterhalb von Antarktikas Eiskante beschnitten -
// Natural Earth zieht deren Suedkante als gerade Linie bei -90 Grad, und
// nach der Projektion stand dort ein Rechteck mit harter Unterkante,
// breiter als Afrika. Mit Antarktika ist auch dieser Sonderfall weg: acht
// Punkte Luft rundherum, wie an jedem anderen Rand auch.
const bK = (()=>{ const xs=[],ys=[];
  D.kontinente.forEach(o=>{ const m=o.pfad.match(/-?\d+\.?\d*/g).map(Number);
    for(let i=0;i<m.length;i+=2){xs.push(m[i]);ys.push(m[i+1]);} });
  return { x0:Math.min(...xs), y0:Math.min(...ys), x1:Math.max(...xs), y1:Math.max(...ys) }; })();
D.vbK = `${bK.x0-8} ${bK.y0-8} ${bK.x1-bK.x0+16} ${bK.y1-bK.y0+16}`;
D.vbD = sichtfeld(D.deutschland);

/* Silhouetten fuer die Kacheln (R2).
 *
 * Jede Ebenenkachel zeigt ihren eigenen Umriss als Wasserzeichen — ein
 * Kind, das noch nicht liest, erkennt Afrika am Bild und nicht am Wort.
 * Dafuer stehen die echten Umrisse aber NICHT zur Verfuegung: `teilen()`
 * schneidet `pfad` aus dem Startbuendel heraus, fuer Deutschland und alle
 * Laender. Auf der Ebenenwahl waeren sieben von acht Kacheln leer.
 *
 * Also eine eigene, sehr grobe Fassung — und zwar der AEUSSERE Umriss,
 * nicht die Innenzeichnung:
 *
 *   „Laender in Afrika"  ->  Afrika, nicht fuenf Laenderflecken
 *
 * Das ist nicht nur kleiner, sondern richtiger. Und es ist der einzige
 * Weg, der ueberhaupt funktioniert: gemessen zerfaellt eine Gruppe von
 * Nachbarflaechen beim Ausduennen in Scherben, weil jede ihre gemeinsame
 * Grenze anders verliert (jeder 32. Punkt: Afrika in Splittern). Ein
 * Kontinent ist EINE Flaeche und haelt.
 *
 * Gemessen: alle sechs Kontinente zusammen 5,8 KB, Deutschland 15 KB —
 * gegen 1 370 KB, die die vollen Umrisse kosten wuerden.
 */
const silhouette = (pfad, n) => {
  const stuecke = [];
  for (const t of pfad.split('M').filter(Boolean)) {
    const pk = [...t.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(m => [+m[1], +m[2]]);
    const k = pk.filter((_, i) => i % n === 0);
    if (k.length < 4) continue;                    // zu wenig fuer eine Flaeche
    stuecke.push('M' + k.map(([x, y]) => Math.round(x) + ',' + Math.round(y)).join('L') + 'Z');
  }
  return stuecke.join('');
};
{
  const roh = Object.fromEntries(KONTINENTE_GROB.map(k => [k.id, k.pfad]));
  const welt = KONTINENTE_GROB.filter(k => k.id !== 'antarktika').map(k => k.pfad).join(' ');
  const d = DEUTSCHLAND_GROB.map(b => b.pfad).join(' ');
  /* Nur die NEUN Ziele, nicht die ganze Karte.
   *
   * Der erste Anlauf legte alle 34 Formen des Ausschnitts zusammen - und
   * das Kachelbild bekam die geraden Schnittkanten der Maske mit: unten
   * rechts ein rechteckiger Block (Kolumbien und Venezuela, an der
   * Maskenkante abgeschnitten), unten eine Gerade. Als Karte ist das
   * richtig, als Zeichen sieht es aus wie ein Fehler.
   *
   * Fiona liest nicht - fuer sie IST das Kachelbild der Name. Es zeigt
   * deshalb das, wonach auf dieser Ebene gefragt wird: die Landbruecke
   * und die grossen Antillen. */
  const mittelamerikaUmriss = KARTEN_GROB.mittelamerika
    .filter(l => zielAuf('mittelamerika', l.a3)).map(l => l.pfad).join(' ');
  D.silhouetten = {
    kontinente:  { d: silhouette(welt, 16),             vb: sichtfeld([{ pfad: welt }]) },
    europa:      { d: silhouette(roh.europa, 16),       vb: sichtfeld([{ pfad: roh.europa }]) },
    afrika:      { d: silhouette(roh.afrika, 16),       vb: sichtfeld([{ pfad: roh.afrika }]) },
    asien:       { d: silhouette(roh.asien, 16),        vb: sichtfeld([{ pfad: roh.asien }]) },
    nordamerika: { d: silhouette(roh.nordamerika, 16),  vb: sichtfeld([{ pfad: roh.nordamerika }]) },
    /* Mittelamerika hat keinen Kontinentumriss - es ist ein Ausschnitt.
     * Sein Kachelbild entsteht deshalb aus den Laenderformen selbst,
     * zusammengelegt. Feiner ausgeduennt (jeder 6. statt jeder 16.
     * Punkt), weil die Formen klein sind: bei 16 zerfaellt Panama zu
     * einem Strich. */
    mittelamerika: { d: silhouette(mittelamerikaUmriss, 6),
                     vb: sichtfeld([{ pfad: mittelamerikaUmriss }]) },
    suedamerika: { d: silhouette(roh.suedamerika, 16),  vb: sichtfeld([{ pfad: roh.suedamerika }]) },
    deutschland: { d: silhouette(d, 8),                 vb: sichtfeld([{ pfad: d }]) },
  };
  const kb = Object.values(D.silhouetten).reduce((a, s) => a + s.d.length, 0) / 1024;
  console.log(`  Silhouetten fuer die Kacheln: ${kb.toFixed(1)} KB`);
}
D.vbL = Object.fromEntries(KONT_LAENDER.map(([id, roh]) => [id, sichtfeld(roh)]));
/* Die Kontinentkarte zeigt ALLE Laender des Kontinents als Umgebung (G8),
 * nicht nur die Ziele - sonst kann man durch Ausschluss raten.
 *
 * Gesiebt wird mit `zielAuf`, also mit `erdkunde.js` - wie zwanzig
 * Zeilen weiter oben und aus demselben Grund. Diese Zeile war die VIERTE,
 * die den gebackenen Rang las (D2c hat drei gefunden). Sie ist harmloser
 * als die anderen drei und deshalb durchgerutscht: ein Land, das in
 * beiden Listen steht, wird zweimal gezeichnet - grau darunter, bunt
 * darueber. Man sieht nichts, man bezahlt nur den Pfad zweimal. */
D.umgebung = Object.fromEntries(KONT_LAENDER.map(([id, roh]) =>
  [id, roh.filter(l => !zielAuf(id, l.a3)).map(l=>l.pfad)]));

// Die Kernmodule werden eingebettet - eine Datei, kein Buendler.
const module = [
  inline(new URL('../src/vergleich/vergleich.js', import.meta.url), 'Vergleich'),
  inline(new URL('../src/kern/leitner.js', import.meta.url), 'Leitner'),
  inline(new URL('../src/inhalt/rechnen.js', import.meta.url), 'Rechnen'),
  inline(new URL('../src/inhalt/schreiben.js', import.meta.url), 'Schreiben'),
  inline(new URL('../src/inhalt/abzeichen.js', import.meta.url), 'Abzeichen'),
  inline(new URL('../src/kern/klang.js', import.meta.url), 'Klang'),
  inline(new URL('../src/kern/richtung.js', import.meta.url), 'Richtung'),
  inline(new URL('../src/profil/ablage.js', import.meta.url), 'Ablage'),
  inline(new URL('../src/protokoll/protokoll.js', import.meta.url), 'Protokoll',
         { 'ablage.js': 'const A = Ablage;' }),
].join('\n');

// Fassungsstempel. Ohne ihn ist "welche Fassung laeuft auf diesem iPad?"
// nicht zu beantworten - Konzept K3, Kapitel 13.2.
const BAU = {
  fassung: process.env.LERNKISTE_FASSUNG || 'p0.4',
  datum: new Date(fs.statSync(new URL('./spiel.js', import.meta.url)).mtime).toISOString().slice(0,16).replace('T',' '),
  standJahr: I.STAND.jahr,
};

const vorlage = fs.readFileSync(new URL('./vorlage.html', import.meta.url), 'utf8');
const rumpf = '<script>' + module + '\n'
  + fs.readFileSync(new URL('./spiel.js', import.meta.url), 'utf8') + '</script>\n</body></html>';

/** Zwei Fassungen aus EINER Quelle - der Unterschied steckt nur im Kopf. */
const marken = fs.readFileSync(new URL('../src/marken/marken.css', import.meta.url), 'utf8');

/**
 * Die zwei Farben, die als HEX gebraucht werden.
 *
 * Das Manifest und das theme-color-Meta verstehen kein oklch() - jedenfalls
 * nicht ueberall, und ein System, das die Farbe nicht liest, blitzt beim
 * Start weiss auf. Sie stehen deshalb EINMAL hier und werden an beide
 * Stellen gesetzt; vorher stand `#1b2835` zweimal im Baum.
 * Ausgerechnet in Chromium aus --grund und --tinte.
 */
const HEX = { grund: '#f6f3ee', tinte: '#1b2835' };

/**
 * Die Laenderebenen werden NACHGELADEN, nicht mitgeliefert.
 *
 * Mit allen fuenf Kontinenten im Bau sprang die Seite von 297 auf 537 KB
 * gzip - fast die Haelfte davon die Umgebungskarten, also die Laender, die
 * nur als Hintergrund dienen (G8: ohne sie kann man durch Ausschluss raten).
 *
 * Gebraucht wird immer nur EIN Kontinent: wer Laender in Europa uebt,
 * braucht Asien nicht. Also liegt je Kontinent eine eigene Datei daneben,
 * und die Ebene holt sich ihre beim Start. Der Service Worker legt sie ins
 * Lager, damit es ohne Netz weiter geht.
 *
 * Im Bau als EINE Datei (zum Verschicken) bleibt alles drin - dort gibt es
 * nichts zum Nachladen.
 */
function teilen(D) {
  const leicht = { ...D, laender: {}, umgebung: {}, nachladen: true };
  const teile = {};

  // Deutschland gehoert genauso nachgeladen wie die Laender.
  //
  // Gemessen vom Tor `budget`: die eingebackene Geometrie lag bei 94,8 KB
  // gegen 90 KB, die das Konzept zusagt - und **56 davon waren
  // Deutschland**, gebraucht fuer zwei von sechzehn Ebenen. Ein Kind, das
  // Kontinente uebt, hat sechzehn Bundeslaender im Gepaeck.
  //
  // Herausgenommen wird NUR `pfad`. Der Rest - Name, Hauptstadt, Anker,
  // Ort, Stadtstaat - ist zusammen unter einem Kilobyte und wird frueh
  // gebraucht: die Ebenenwahl rechnet den Fortschritt aus, bevor eine
  // Ebene offen ist.
  teile.deutschland = { deutschland: D.deutschland, vbD: D.vbD };
  leicht.deutschland = D.deutschland.map(({ pfad, ...rest }) => rest);

  for (const k of Object.keys(D.laender)) {
    teile[k] = { laender: D.laender[k], umgebung: D.umgebung[k], vbL: D.vbL[k] };
    // Ein leichtes Verzeichnis bleibt drin: die Ebenenwahl rechnet den
    // Fortschritt aller Ebenen aus, bevor eine davon geladen ist. Dafuer
    // braucht sie die Kennungen - nicht die Umrisse.
    // `hauptstadt` bleibt im leichten Verzeichnis, obwohl der Umriss
    // herausfaellt: es ist der Name, den die Ebene „Hauptstädte in Europa"
    // ABFRAGT, und ohne ihn steht im eingebetteten Datensatz eine Aufgabe
    // ohne Antwort. Zwoelf Namen, rund 150 Byte. Nur wo es einen gibt -
    // die anderen vier Kontinente haben keine Hauptstadtebene.
    leicht.laender[k] = D.laender[k].map(l => ({ a3:l.a3, name:l.name, rang:l.rang,
      aliasse:l.aliasse, aussprache:l.aussprache,
      ...(l.hauptstadt ? { hauptstadt:l.hauptstadt } : {}) }));
    leicht.umgebung[k] = [];
  }
  return { leicht, teile };
}

function bauen(kopf, daten = D) {
  return vorlage.replace('__MARKEN__', marken)
                .replace('__THEMECOLOR__', HEX.tinte)
                .replace('__DATEN__', JSON.stringify(daten))
                .replace('__BAU__', JSON.stringify(BAU))
                .replace('__KOPF__', kopf) + rumpf;
}

const SCHRIFT = new URL('../src/schrift/', import.meta.url);
const SYMBOL  = new URL('../src/symbol/',  import.meta.url);
const schriftCss = fs.readFileSync(new URL('schrift.css', SCHRIFT), 'utf8');
const schriftDateien = fs.readdirSync(SCHRIFT).filter(f => f.endsWith('.woff2'));

/* --- Fassung 1: EINE Datei, zum Ansehen -------------------------------- */
//
// Alles drin, auch die Schrift als Daten-URI. Diese Fassung laesst sich
// verschicken und mit einem Doppelklick oeffnen - dafuer ist sie 70 KB
// groesser. Die Tore pruefen sie, weil sie ohne Server auskommt.
const eingebettet = schriftCss.replace(/url\(\.\/schrift\/([^)]+)\)/g, (_, datei) =>
  `url(data:font/woff2;base64,${fs.readFileSync(new URL(datei, SCHRIFT)).toString('base64')})`);
const einzeln = bauen(`<style>${eingebettet}</style>`);
fs.writeFileSync(new URL('./spiel.html', import.meta.url), einzeln);
console.log(`  prototyp/spiel.html  ${(einzeln.length/1024).toFixed(0)} KB`
  + `  →  ${(zlib.gzipSync(Buffer.from(einzeln)).length/1024).toFixed(0)} KB gzip  (eine Datei)`);

/* --- Fassung 2: dist/, das was ausgeliefert wird ------------------------ */
//
// Hier liegen Schrift und Symbole DANEBEN statt drin. Das ist kein
// Schoenheitsfehler, sondern der Grund, warum die App schnell startet: die
// Seite aendert sich bei jeder Auslieferung, die Schrift nie. Wer sie
// einbettet, laedt sie bei jeder Fassung neu.
const DIST = new URL('../dist/', import.meta.url);
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(new URL('schrift/', DIST), { recursive: true });

// Ausgeliefert werden nur die drei, die ein Geraet wirklich anfasst:
// 180 fuer iOS, 192 und 512 fuers Manifest. Die 1024 bleibt in src/symbol
// als Vorrat - sie waere 577 KB in jedem Lager, fuer nichts.
const symbole = [180, 192, 512];
const kopf = [
  `<link rel="manifest" href="./manifest.webmanifest">`,
  `<link rel="apple-touch-icon" href="./symbol-180.png">`,
  `<link rel="icon" type="image/png" sizes="192x192" href="./symbol-192.png">`,
  ...schriftDateien.map(f => `<link rel="preload" as="font" type="font/woff2" `
    + `href="./schrift/${f}" crossorigin>`),
  `<link rel="stylesheet" href="./schrift.css">`,
].join('\n');
const { leicht, teile } = teilen(D);
fs.mkdirSync(new URL('daten/', DIST), { recursive: true });
for (const [k, t] of Object.entries(teile))
  fs.writeFileSync(new URL(`daten/${k === 'deutschland' ? k : 'laender-' + k}.json`, DIST),
    JSON.stringify(t));

const verteilt = bauen(kopf, leicht).replace('</body></html>',
  `<script>
// Der Service Worker haelt die App offline lauffaehig und holt trotzdem bei
// jedem Start die neueste Fassung. Faellt er aus, laeuft alles wie vorher -
// nur eben ohne Netz nicht.
if ('serviceWorker' in navigator)
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js')
    .catch(e => console.warn('Service Worker nicht registriert:', e)));
</script>
</body></html>`);

fs.writeFileSync(new URL('index.html', DIST), verteilt);
fs.writeFileSync(new URL('schrift.css', DIST), schriftCss);
for (const f of schriftDateien)
  fs.copyFileSync(new URL(f, SCHRIFT), new URL('schrift/' + f, DIST));
for (const g of symbole)
  fs.copyFileSync(new URL(`symbol-${g}.png`, SYMBOL), new URL(`symbol-${g}.png`, DIST));

// GitHub Pages laesst sonst Jekyll darueberlaufen und verschluckt alles,
// was mit einem Unterstrich anfaengt. Kostet nichts, verhindert Raetselraten.
fs.writeFileSync(new URL('.nojekyll', DIST), '');

fs.writeFileSync(new URL('manifest.webmanifest', DIST), JSON.stringify({
  name: 'Smart Kids — Erdkunde',
  short_name: 'Smart Kids',
  description: 'Kontinente, Länder, Bundesländer und Landeshauptstädte '
    + 'für Fiona und Lea.',
  lang: 'de', dir: 'ltr',
  start_url: './', scope: './', id: './',
  display: 'standalone',
  orientation: 'any',
  background_color: HEX.grund,
  theme_color: HEX.tinte,
  icons: [
    { src:'./symbol-192.png',  sizes:'192x192',   type:'image/png', purpose:'any' },
    { src:'./symbol-512.png',  sizes:'512x512',   type:'image/png', purpose:'any' },
    // Die Kugel misst 75 % der Kante, die Schutzzone einer maskierbaren
    // Kachel 80 % - sie passt also hinein, egal welche Form das System
    // darum herum schneidet.
    { src:'./symbol-512.png',  sizes:'512x512',   type:'image/png', purpose:'maskable' },
  ],
}, null, 2) + '\n');

const vorrat = ['./', './index.html', './manifest.webmanifest', './schrift.css',
  ...symbole.map(g => `./symbol-${g}.png`),
  ...schriftDateien.map(f => `./schrift/${f}`),
  // Die nachgeladenen Ebenen gehoeren ins Lager, sonst ist die App ohne
  // Netz zwar da, aber ohne Laenderkarten.
  ...Object.keys(teile).map(k => `./daten/${k === 'deutschland' ? k : 'laender-' + k}.json`)];
fs.writeFileSync(new URL('sw.js', DIST),
  fs.readFileSync(new URL('./pwa/sw.js', import.meta.url), 'utf8')
    .replace('__FASSUNG__', BAU.fassung + '-' + BAU.datum.replace(/[^0-9]/g, ''))
    .replace('__VORRAT__', JSON.stringify(vorrat, null, 2)));

const distGroesse = fs.readdirSync(DIST, { recursive:true })
  .map(f => { const st = fs.statSync(new URL(f, DIST)); return st.isFile() ? st.size : 0; })
  .reduce((a, b) => a + b, 0);
console.log(`  dist/                ${(verteilt.length/1024).toFixed(0)} KB Seite`
  + `  →  ${(zlib.gzipSync(Buffer.from(verteilt)).length/1024).toFixed(0)} KB gzip`
  + `,  ${(distGroesse/1024).toFixed(0)} KB gesamt mit Schrift und Symbolen`);
const html = verteilt;
/* Jedes Land ist auf GENAU EINER Karte ein Ziel.
 *
 * Seit dem Ausschnitt Mittelamerika (A6) liegt Guatemala auf zwei Karten -
 * gezeichnet auf beiden, gefragt auf einer. Wer hier wieder eine flache
 * Tafel `a3 -> Land` einsetzt, bekommt es auf beiden als Ziel, und zu
 * sehen ist davon: nichts. Beim ersten Anlauf stand in dieser Zeile
 * prompt „81 Länder" statt 65, und ohne den Vergleich waere die Zahl
 * einfach durchgelaufen.
 *
 * Verglichen wird gegen `erdkunde.js`, also gegen die Ware. */
{
  const gebaut = Object.values(D.laender).reduce((a, l) => a + l.length, 0);
  const gewollt = Object.values(I.LAENDER).reduce((a, l) => a + l.length, 0);
  if (gebaut !== gewollt)
    throw new Error(`${gebaut} Laenderziele gebaut, ${gewollt} stehen in erdkunde.js — `
      + 'ein Land ist auf zwei Karten Ziel geworden (oder auf keiner)');
}
console.log(`  ${D.kontinente.length} Kontinente, ${Object.values(D.laender).reduce((a,l)=>a+l.length,0)} Länder in ${Object.keys(D.laender).length} Kontinenten, `
  + `${D.deutschland.length} Bundesländer, ${D.deutschland.filter(b=>!b.stadtstaat).length} Hauptstadt-Rätsel`);
console.log('  ' + Object.entries(teile).map(([k,t]) =>
  `${k} ${(zlib.gzipSync(Buffer.from(JSON.stringify(t))).length/1024).toFixed(0)} KB`).join(' · ')
  + '  (wird nachgeladen)');
