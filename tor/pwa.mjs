// Tore `pwa` und `offline`.
//
// Die App soll ueber Safari auf den Startbildschirm gelegt werden und von
// dort starten - ohne Adressleiste, ohne Netz, und trotzdem immer aktuell.
// Das sind drei Zusagen, die man ansehen kann und die niemand ansieht:
// ein fehlendes Symbol faellt erst auf dem iPad auf, ein kaputter Service
// Worker erst im Zug.
//
// Regel 1 gilt auch hier: die Offline-Pruefung ist erst dann eine, wenn
// sie OHNE Service Worker durchfaellt. Genau das steht unten als
// Gegenprobe - sie laeuft bei jedem Lauf mit.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import { starte, zurEbenenwahl, serviere, durchVorlauf } from './chromium.mjs';

const DIST = path.join(process.cwd(), 'dist');
const fehler = [];
const pruefe = (b, satz) => { if (!b) fehler.push(satz); };

/* ========================================================= Tor `pwa` ==== */
console.log('\n  Tor `pwa`');

const manifestPfad = path.join(DIST, 'manifest.webmanifest');
pruefe(fs.existsSync(manifestPfad), 'dist/manifest.webmanifest fehlt');
let manifest = null;
if (fs.existsSync(manifestPfad)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPfad, 'utf8')); }
  catch (e) { pruefe(false, `manifest.webmanifest ist kein gültiges JSON: ${e.message}`); }
}
if (manifest) {
  for (const feld of ['name', 'short_name', 'start_url', 'scope', 'display',
                      'background_color', 'theme_color', 'icons', 'lang'])
    pruefe(manifest[feld] !== undefined, `manifest: ${feld} fehlt`);
  pruefe(manifest.display === 'standalone',
    `manifest: display ist "${manifest.display}" — nur "standalone" startet ohne Adressleiste`);
  // Farben muessen HEX sein. oklch() im Manifest verstehen nicht alle
  // Systeme, und dann steht beim Start ein weisser Blitz vor dem Spiel.
  for (const feld of ['background_color', 'theme_color'])
    pruefe(/^#[0-9a-f]{6}$/i.test(manifest[feld] || ''),
      `manifest: ${feld} ist "${manifest[feld]}" — als Hex angeben, nicht als oklch()`);
  // Jedes genannte Symbol muss da sein UND die genannte Groesse haben.
  for (const s of manifest.icons || []) {
    const f = path.join(DIST, s.src.replace(/^\.\//, ''));
    if (!fs.existsSync(f)) { pruefe(false, `manifest nennt ${s.src}, die Datei fehlt`); continue; }
    const kopf = fs.readFileSync(f).subarray(16, 24);
    const breite = kopf.readUInt32BE(0), hoehe = kopf.readUInt32BE(4);
    pruefe(`${breite}x${hoehe}` === s.sizes,
      `${s.src} ist ${breite}×${hoehe}, das Manifest sagt ${s.sizes}`);
  }
  pruefe((manifest.icons || []).some(s => s.purpose === 'maskable'),
    'manifest: kein maskierbares Symbol — Android schneidet dann die Ecken vom normalen ab');
  console.log(`    Manifest: ${(manifest.icons||[]).length} Symbole, alle vorhanden `
    + `und in der genannten Größe`);
}

const seite = fs.existsSync(path.join(DIST, 'index.html'))
  ? fs.readFileSync(path.join(DIST, 'index.html'), 'utf8') : '';
pruefe(/rel="manifest"/.test(seite), 'index.html verweist nicht auf das Manifest');
pruefe(/rel="apple-touch-icon"/.test(seite),
  'index.html hat kein apple-touch-icon — iOS nimmt sonst ein Bildschirmfoto als Symbol');
pruefe(/apple-mobile-web-app-capable/.test(seite),
  'index.html fehlt apple-mobile-web-app-capable — dann bleibt die Adressleiste stehen');
pruefe(/serviceWorker/.test(seite), 'index.html meldet keinen Service Worker an');
pruefe(!/fonts\.(googleapis|gstatic)\.com/.test(seite),
  'index.html laedt noch Schrift von Google — offline gibt es dann keine, '
  + 'und eine Kinder-App soll bei niemandem anklopfen');

const sw = fs.existsSync(path.join(DIST, 'sw.js'))
  ? fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8') : '';
pruefe(sw.length > 0, 'dist/sw.js fehlt');
pruefe(!/__FASSUNG__|__VORRAT__/.test(sw),
  'sw.js enthält noch Platzhalter — der Bau hat sie nicht ersetzt');
const vorrat = (sw.match(/const VORRAT = (\[[\s\S]*?\]);/) || [])[1];
if (vorrat) {
  const liste = JSON.parse(vorrat);
  for (const eintrag of liste) {
    if (eintrag === './') continue;
    pruefe(fs.existsSync(path.join(DIST, eintrag.replace(/^\.\//, ''))),
      `sw.js will ${eintrag} ins Lager legen, die Datei gibt es nicht — `
      + `dann schlägt addAll fehl und der Service Worker installiert sich NIE`);
  }
  console.log(`    Service Worker: ${liste.length} Dateien im Vorrat, alle vorhanden`);
} else pruefe(false, 'sw.js: VORRAT nicht gefunden');

/* Der Lagername muss den ORT tragen, an dem der Service Worker sitzt.
 *
 * `activate` loescht JEDES Lager, dessen Name mit der eigenen Sippe
 * anfaengt und nicht das eigene ist. Solange es nur eine Installation gab,
 * war das richtig: aufraeumen, was von aelteren Fassungen uebrig ist. Mit
 * der Vorschau unter /vorschau/ gibt es zum ersten Mal ZWEI, und Cache
 * Storage gilt je Herkunft, nicht je Geltungsbereich. Ohne den Ort im Namen
 * haette jeder Blick in die Vorschau dem ausgelieferten Spiel den
 * Offline-Vorrat geloescht - und umgekehrt.
 *
 * WAS DAS HIER BEWEIST, und was nicht: geprueft wird die FORM des Namens,
 * nicht seine Wirkung. Der Beweis waere, zwei Installationen an zwei Pfaden
 * in denselben Browser zu setzen und nach der zweiten die erste ohne Netz
 * zu starten. Das steht als offener Punkt im STAND; bis dahin faengt diese
 * Pruefung wenigstens den Rueckfall auf einen festen Namen.
 */
{
  const q = fs.readFileSync('prototyp/pwa/sw.js', 'utf8');
  const sippe = q.match(/const SIPPE\s*=\s*([^;]+);/);
  pruefe(!!sippe && /self\.location/.test(sippe[1]),
    'sw.js leitet den Lagernamen nicht aus `self.location` ab — zwei Installationen '
    + 'an zwei Pfaden räumen dann einander den Offline-Vorrat ab');
  pruefe(/name\.startsWith\(SIPPE\)/.test(q),
    'sw.js räumt nach einem anderen Namen auf als dem, den es selbst vergibt');
  console.log('    Lagername trägt den Ort — zwei Installationen stören einander nicht');
}

/* ===================================================== Tor `offline` ==== */
console.log('\n  Tor `offline`');

/**
 * „Ohne Netz" wird am SERVER abgeschaltet, nicht im Browser.
 *
 * `context.setOffline(true)` deckt die Anfragen des Service Workers NICHT
 * zuverlaessig ab. Nachgemessen mit einem mitschreibenden Server: waehrend
 * der Kontext auf offline stand, hat der Server `/daten/deutschland.json`
 * und `/sw.js` ausgeliefert - der Service Worker holte munter weiter, und
 * das Tor meldete „ohne Netz kommt die App bis zu den Bundeslaendern".
 *
 * Aufgefallen ist es nur durch eine Gegenprobe: die Datei wurde aus dem
 * Vorrat des Service Workers genommen, und das Tor blieb gruen. Genau der
 * Fall, vor dem Regel 1 warnt - die Pruefung mass etwas anderes, das
 * lauter war, und bezeugte die Sache, ohne sie je geprueft zu haben.
 *
 * Jetzt wird die Verbindung am Server ABGERISSEN, nicht hoeflich mit einem
 * Fehlercode beantwortet: eine Antwort ist Netz, auch eine mit 503.
 * `setOffline` bleibt trotzdem stehen - zwei Schloesser sind besser als
 * eines, und im Browser sieht die App dann auch `navigator.onLine === false`.
 */
let netz = true;
const { server, adresse: ADRESSE } = await serviere(DIST, () => netz);

const b = await starte();

/** Startet die App und sagt, ob wirklich etwas Spielbares dasteht. */
async function laeuft(ctx, bisEbene) {
  const p = await ctx.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
  try {
    await p.goto(ADRESSE, { waitUntil: 'domcontentloaded', timeout: 8000 });
    await p.waitForSelector('[data-profil="fiona"]', { timeout: 8000 });
    // Die Laenderebenen werden NACHGELADEN. Ohne Netz muessen sie aus dem
    // Lager kommen - sonst startet die App zwar, aber die halbe App fehlt.
    if (bisEbene) {
      await p.click('[data-profil="fiona"]');
      await zurEbenenwahl(p, bisEbene);
      await p.waitForSelector(`.schirm.da [data-ebene="${bisEbene}"]`, { timeout: 8000 });
      await p.click(`.schirm.da [data-ebene="${bisEbene}"]`);
      // Seit R3 steht der Vorlauf beim ersten Betreten davor - und OHNE
      // NETZ ist das der interessantere Fall: er laedt die Karte selbst
      // nach. Kommt sie aus dem Lager, steht er da; kommt sie nicht, ist
      // das genau der Befund, den dieses Tor sucht.
      await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel',
        { timeout: 12000 });
      await durchVorlauf(p);
      await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 12000 });
      // Auf das ELEMENT zu warten reicht nicht.
      //
      // Die App baut ihre Pfade aus dem leichten Verzeichnis, das im
      // Startbündel bleibt - Name, Anker, Ort, aber kein Umriss. Fehlt die
      // nachgeladene Geometrie, steht `path.ziel` trotzdem da, nur mit
      // leerem `d`. Die Karte ist unsichtbar und das Tor meldet grün.
      //
      // Gefunden hat das die Gegenprobe „Deutschland fehlt im Lager": sie
      // nahm die Datei aus dem Vorrat, und hier blieb alles grün. Geprüft
      // wird jetzt die FLÄCHE.
      const flaeche = await p.evaluate(() => {
        const z = document.querySelector('.schirm.da .karte svg path.ziel');
        const b = z && z.getBBox ? z.getBBox() : null;
        return b ? Math.min(b.width, b.height) : 0;
      });
      if (!(flaeche > 0)) throw new Error(
        `die Karte ist leer — das gesuchte Gebiet hat keine Fläche `
        + `(die nachgeladenen Umrisse fehlen)`);
    }
    // Nicht nur "die Seite kam" - auch die Schrift muss da sein, sonst
    // stuende das Kind vor einer App in Times New Roman.
    const schrift = await p.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([document.fonts.load('700 20px "Plus Jakarta Sans"'),
                         document.fonts.load('400 20px "Andika"')]);
      return document.fonts.check('700 20px "Plus Jakarta Sans"')
          && document.fonts.check('400 20px "Andika"');
    });
    await p.close();
    return { da: true, schrift };
  } catch (e) { await p.close(); return { da: false, grund: e.message.slice(0, 90) }; }
}

/* --- Der eigentliche Beweis ------------------------------------------- */
const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
const p = await ctx.newPage({ viewport: { width: 844, height: 390 } });
await p.goto(ADRESSE, { waitUntil: 'load' });
const bereit = await p.evaluate(() => navigator.serviceWorker.ready
  .then(r => !!r.active).catch(() => false));
pruefe(bereit, 'der Service Worker wurde nicht aktiv');
// Zweiter Besuch, damit die Seite selbst im Lager liegt.
await p.goto(ADRESSE, { waitUntil: 'load' });
await p.close();

netz = false;
await ctx.setOffline(true);

// ZWEI nachgeladene Ebenen, nicht eine.
//
// Bis zur Budgetrunde lag Deutschland eingebacken in der Seite - ohne Netz
// war es also immer da, ganz gleich was der Service Worker tat. Seit es 56
// von 94 KB Geometrie gespart hat, indem es nachgeladen wird, ist es
// genauso auf das Lager angewiesen wie Asien. Eine Pruefung, die nur die
// Laenderebenen abgeht, haette den Ausfall der halben App nicht bemerkt:
// Bundeslaender und Hauptstaedte sind zwei von sechzehn Ebenen und die
// beiden, um die es bei diesen Kindern eigentlich geht.
const WEGE = [
  { ebene: 'laender:asien',  wie: 'Länder in Asien' },
  { ebene: 'bundeslaender',  wie: 'Bundesländer' },
];
const ohneNetz = { da: true, schrift: true, grund: '' };
for (const w of WEGE) {
  const r = await laeuft(ctx, w.ebene);
  pruefe(r.da, `ohne Netz kommt die App nicht bis zur nachgeladenen Ebene `
    + `„${w.wie}": ${r.grund || ''}`);
  pruefe(r.schrift, `ohne Netz fehlt bei „${w.wie}" die Schrift — sie liegt nicht im Lager`);
  console.log(`    Mit Lager, ohne Netz: ${r.da ? 'startet bis' : 'STARTET NICHT bis'} `
    + `„${w.wie}", Schrift ${r.schrift ? 'da' : 'FEHLT'}`);
  ohneNetz.da &&= r.da; ohneNetz.schrift &&= r.schrift;
}
netz = true;
await ctx.setOffline(false);

/* --- Gegenprobe: OHNE Service Worker muss dasselbe scheitern ---------- */
//
// Ohne sie misst die Pruefung oben vielleicht nur den Browser-Cache, und
// waere gruen, ohne je etwas bewiesen zu haben (Regel 1).
const ohne = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE',
  serviceWorkers: 'block' });
const p2 = await ohne.newPage({ viewport: { width: 844, height: 390 } });
await p2.goto(ADRESSE, { waitUntil: 'load' });
await p2.close();
netz = false;
await ohne.setOffline(true);
const ohneSw = await laeuft(ohne, 'bundeslaender');
netz = true;
pruefe(!ohneSw.da,
  'ohne Service Worker startet die App AUCH ohne Netz — dann misst das Tor '
  + 'den Browser-Cache und nicht den Service Worker');
console.log(`    Gegenprobe ohne Service Worker: ${ohneSw.da ? 'startet TROTZDEM' : 'startet nicht'}`
  + ` — die Pruefung oben misst wirklich das Lager`);
await ohne.close(); await ctx.close();

/* --- Tor `nachschub`: erneuert sich die App auf einer MUEDEN Leitung? --
 *
 * Der andere Fall, und der gefaehrlichere. Eine tote Leitung merkt man;
 * eine muede nicht. Die Seite wird netzzuerst geholt, mit einer
 * Reissleine von 2,5 Sekunden - und bis v403 wurde der Abruf beim
 * Zeitablauf VERWORFEN. Also landete nichts im Lager, also kam beim
 * naechsten Start wieder dieselbe alte Fassung. Auf einer Leitung, die
 * fuer 324 KB laenger als 2,5 s braucht, hat sich die App damit NIE
 * erneuert. Auf dem Geraet der Kinder stand eine sehr alte Fassung, und
 * kein Tor hat es gesagt: `offline` prueft, dass sie OHNE Netz startet,
 * und genau das tat sie ja.
 *
 * Geprueft werden drei Dinge, und alle drei muessen zugleich gelten:
 *   1. die Reissleine haelt      - der langsame Start kommt schnell
 *   2. der Nachschub kommt an    - danach liegt die NEUE Fassung im Lager
 *   3. der naechste Start zeigt sie
 *
 * Ohne (1) waere ein Kind zum Warten verurteilt, ohne (2) und (3) waere
 * es bei der alten Fassung gefangen. Eine Pruefung, die nur (1) sieht,
 * war genau die, die es gab.
 *
 * Gearbeitet wird auf einer KOPIE von dist: dieser Lauf schreibt die
 * Seite mitten im Betrieb um (das tut eine Auslieferung auch), und die
 * anderen Tore der Kette lesen dasselbe Verzeichnis. */
console.log('\n  Tor `nachschub`');
{
  const kopie = fs.mkdtempSync(path.join(os.tmpdir(), 'smartkids-nachschub-'));
  for (const d of fs.readdirSync(DIST, { withFileTypes: true })) {
    const von = path.join(DIST, d.name), nach = path.join(kopie, d.name);
    if (d.isDirectory()) fs.cpSync(von, nach, { recursive: true });
    else fs.copyFileSync(von, nach);
  }
  const seitePfad = path.join(kopie, 'index.html');
  const alteSeite = fs.readFileSync(seitePfad, 'utf8');
  const alteNr = (alteSeite.match(/"bau":"(\d+)"/) || [])[1];
  pruefe(!!alteNr, 'in der gebauten Seite steht keine Fassungsnummer — '
    + 'dann kann dieses Tor „alt" nicht von „neu" unterscheiden');

  let muede = 0;
  const { server: s2, adresse: A2 } = await serviere(kopie, () => true,
    (weg) => (weg === '/' || weg === '/index.html') ? muede : 0);
  const ctx2 = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
  const q = await ctx2.newPage({ viewport: { width: 844, height: 390 } });

  const zeigt = () => q.evaluate(() =>
    (document.getElementById('fassung')?.textContent || '?').trim().split(' ')[0]);
  const imLager = () => q.evaluate(async () => {
    for (const n of await caches.keys()) {
      const t = await (await caches.open(n)).match('./index.html');
      if (!t) continue;
      const m = (await t.text()).match(/"bau":"(\d+)"/);
      return m ? m[1] : null;
    }
    return null;
  });
  const starten = async () => {
    const t0 = Date.now();
    await q.goto(A2, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
    await q.evaluate(() => navigator.serviceWorker.ready).catch(() => {});
    await q.waitForFunction(() => !!document.getElementById('fassung'),
      null, { timeout: 15000 }).catch(() => {});
    return Date.now() - t0;
  };

  await starten(); await starten();            // Lager gefuellt, alte Fassung drin
  pruefe(await imLager() === alteNr,
    'nach zwei Starts liegt die Seite nicht im Lager — die Vorbedingung fehlt');

  // Eine NEUE Auslieferung, und ab jetzt ist die Leitung muede.
  fs.writeFileSync(seitePfad, alteSeite.replace(/"bau":"\d+"/, '"bau":"999"'));
  muede = 3500;                                 // laenger als die Reissleine
  const dauer = await starten();
  const gezeigt1 = await zeigt(), lager1 = await imLager();
  /* (1) Die Reissleine haelt. Grosszuegig gemessen: die Reissleine steht
     bei 2,5 s, der Rest ist Aufbau der Seite. Waere sie kaputt, stuende
     hier die volle Antwortzeit von 3,5 s plus Aufbau. */
  pruefe(dauer < muede,
    `der langsame Start hat ${(dauer / 1000).toFixed(1)} s gebraucht, die Leitung `
    + `braucht ${(muede / 1000).toFixed(1)} s — die Reissleine greift nicht mehr, `
    + 'ein Kind wartet auf das Netz');
  pruefe(gezeigt1 === 'v' + alteNr,
    `beim langsamen Start stand „${gezeigt1}" da statt der Fassung aus dem Lager`);
  /* (2) Der Nachschub kommt trotzdem an. DAS ist die Zusage, die gefehlt
     hat - dem Abruf ein paar Sekunden geben und dann nachsehen. */
  const bis5 = Date.now() + 8000;
  let lager2 = lager1;
  while (Date.now() < bis5 && lager2 !== '999') {
    await q.waitForTimeout(400); lager2 = await imLager();
  }
  pruefe(lager2 === '999',
    `nach dem langsamen Start liegt weiter v${lager2} im Lager statt v999 — `
    + 'die Reissleine wirft den Abruf weg, und die App erneuert sich auf einer '
    + 'müden Leitung NIE');
  // (3) Und beim naechsten Start ist sie da.
  await starten();
  const gezeigt2 = await zeigt();
  pruefe(gezeigt2 === 'v999',
    `beim zweiten Start auf der müden Leitung steht „${gezeigt2}" da statt v999`);

  console.log(`    Müde Leitung (${(muede / 1000).toFixed(1)} s je Seite): `
    + `Start nach ${(dauer / 1000).toFixed(1)} s mit v${alteNr}, `
    + `Nachschub v${lager2} im Lager, nächster Start ${gezeigt2}`);
  await ctx2.close(); s2.close();
  fs.rmSync(kopie, { recursive: true, force: true });
}

await b.close(); server.close();

if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER:`);
  fehler.forEach(f => console.log('    ✗ ' + f));
  process.exit(1);
}
console.log('\n  PWA grün: Manifest stimmt, Symbole da, ohne Netz startet sie.');
