// Rauchtest. Spielt den Prototyp wirklich - und prueft, was M3 bis M6
// zugesagt haben: dass der Fortschritt einen Neustart ueberlebt, dass das
// Forscherbuch fuellt, dass der Elternbereich Zahlen zeigt.
import { starte } from './chromium.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// IndexedDB braucht eine echte Herkunft. Unter file:// ist sie undurchsichtig,
// und die Ablage faellt still auf nichts zurueck - genau der Fall, den das
// Tor sonst uebersehen wuerde. Also ein winziger Server.
// Geprueft wird dist/ - das, was wirklich ausgeliefert wird. Die eine
// Datei prototyp/spiel.html ist nur zum Ansehen; sie hat weder Manifest
// noch Service Worker, also beweist ein gruener Lauf auf ihr nichts ueber
// die App auf dem Startbildschirm.
const wurzel = path.join(process.cwd(), 'dist');
const server = http.createServer((q, a) => {
  const f = path.join(wurzel, q.url === '/' ? '/index.html' : q.url);
  if (!f.startsWith(wurzel) || !fs.existsSync(f)) { a.statusCode = 404; return a.end(); }
  const typ = f.endsWith('.html') ? 'text/html; charset=utf-8'
    : f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'text/javascript'
    : f.endsWith('.png') ? 'image/png' : f.endsWith('.woff2') ? 'font/woff2'
    : f.endsWith('.webmanifest') ? 'application/manifest+json' : 'text/plain';
  a.setHeader('content-type', typ);
  a.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const ADRESSE = `http://127.0.0.1:${server.address().port}/`;

const b = await starte();
const fehler = [];
const merke = (was, e) => fehler.push(`${was}: ${e.message || e}`);

async function neueSeite(viewport, ctx) {
  const p = await ctx.newPage({ viewport, deviceScaleFactor: 2 });
  p.on('pageerror', e => fehler.push(`Seitenfehler: ${String(e).slice(0, 140)}`));
  await p.goto(ADRESSE, { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => document.fonts.ready);
  return p;
}

/**
 * Nach einer richtigen Antwort: steht der Name auf der Karte, und steht er
 * im Bild?
 *
 * Die Zusage aus G10: 14 von 16 Bundeslaendernamen passen nicht in ihr
 * Gebiet, also ist die Fahne der Normalfall. Geprueft wird deshalb beides -
 * dass ueberhaupt ein Name erscheint, dass er vollstaendig im Kartenfeld
 * liegt, und dass die Entscheidung "innen oder daneben" wirklich gemessen
 * wird und nicht immer gleich ausfaellt.
 */
async function fahnePruefen(p, wo) {
  const f = await p.evaluate(() => {
    const g = document.querySelector('.schirm.da #fahne');
    const t = g && g.querySelector('.fahnentext');
    if (!t) return null;
    const b = t.getBoundingClientRect();
    const svg = document.querySelector('.schirm.da .karte svg').getBoundingClientRect();
    return { art: g.dataset.fahne, text: t.textContent,
             drin: b.left >= svg.left - 1 && b.right <= svg.right + 1
                && b.top >= svg.top - 1 && b.bottom <= svg.bottom + 1,
             hoch: +b.height.toFixed(0) };
  });
  if (!f) { merke('fahne', new Error(`${wo}: kein Name auf der Karte`)); return null; }
  if (!f.drin) merke('fahne', new Error(`${wo}: „${f.text}" steht außerhalb des Kartenfelds`));
  if (f.hoch < 14) merke('fahne', new Error(`${wo}: „${f.text}" nur ${f.hoch} pt hoch`));
  return f.art;
}

/**
 * Wie stark ueberlagern sich zwei Bildschirme beim Wechsel?
 *
 * Der Wechsel von Aufgabe zu Aufgabe war ein Blinzeln: beide Bildschirme
 * blendeten gleichzeitig, und weil die Karte dieselbe ist, sah man nur, wie
 * sie kurz dunkler wurde. Der erste Anlauf machte daraus ein DOPPELBILD -
 * auf einem Bild aus der Mitte des Uebergangs standen die alte Lobzeile und
 * die neue Frage uebereinander, und hinter der neuen Karte lag die alte mit
 * ihrem gruen gefaerbten Treffer.
 *
 * Gesehen hat das ein Auge, kein Tor. Gemessen wird es jetzt: waehrend des
 * ganzen Wechsels darf nie mehr als EIN Bildschirm deutlich sichtbar sein.
 * Der schwaechere der beiden ist das Mass - liegt er hoch, sieht man beide.
 */
async function ueberblendungMessen(p) {
  return p.evaluate(() => new Promise(ja => {
    let schlimmste = 0;
    const bis = performance.now() + 1500;   // der Wechsel kommt 1600 ms nach der Antwort,
                                            // gemessen wird ab rund 800 ms danach
    const tick = () => {
      const s = [...document.querySelectorAll('#buehne .schirm')];
      if (s.length > 1) {
        const o = s.map(x => +getComputedStyle(x).opacity).sort((a, b) => b - a);
        schlimmste = Math.max(schlimmste, Math.min(o[0], o[1]));
      }
      if (performance.now() < bis) requestAnimationFrame(tick); else ja(schlimmste);
    };
    requestAnimationFrame(tick);
  }));
}
let ueberblendung = null;

/** Eine Aufgabe loesen: das passende Etikett auf den Anker des Ziels ziehen. */
async function loese(p) {
  // Warten, bis der Bildschirmwechsel wirklich durch ist - sonst greift der
  // Test in die alte Aufgabe.
  await p.waitForFunction(() => document.querySelectorAll('.schirm').length === 1
    && document.querySelector('.schirm.da path.ziel'), null, { timeout: 5000 });
  const info = await p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const ziel = s.querySelector('path.ziel'); if (!ziel) return null;
    const D = JSON.parse(document.getElementById('daten').textContent);
    const id = ziel.dataset.id;
    const b = D.deutschland.find(x => x.id === id);
    const svg = s.querySelector('.karte svg');
    const pt = svg.createSVGPoint(); pt.x = b.anker[0]; pt.y = b.anker[1];
    const q = pt.matrixTransform(svg.getScreenCTM());
    const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent);
    return { id, name: b.name, x: q.x, y: q.y, idx: namen.indexOf(b.name), namen };
  });
  if (!info) throw new Error('kein Ziel gefunden');
  if (info.idx < 0) throw new Error(`Etikett "${info.name}" fehlt unter ${info.namen.join(', ')}`);
  const et = (await p.$$('.schirm.da .etikett'))[info.idx];
  const a = await et.boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  await p.mouse.move(info.x, info.y, { steps: 10 });
  await p.mouse.up();
  // Erkannt wird der richtige Ausgang an der KLASSE, nicht am Wortlaut.
  // Vorher stand hier /Richtig/ - und als das Lob abwechslungsreich wurde
  // ("Klasse! Das ist Thueringen."), meldete der Rauchtest einundzwanzig
  // Fehler, obwohl jede Antwort gewertet worden war. Eine Klasse ist eine
  // Zusage des Programms; ein Satz ist Text, den jemand aendern darf.
  await p.waitForFunction(() => !!document.querySelector('.schirm.da .frage .richtigText'),
    null, { timeout: 4000 });
  return info.name;
}

/* --- Durchgang 1: spielen und ablegen --------------------------------- */
const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
let geloest = [];
const fahnenArten = new Set();
let durchgespielt = 0;
try {
  const p = await neueSeite({ width: 844, height: 390 }, ctx);
  await p.click('[data-profil="fiona"]');
  await p.waitForSelector('.schirm.da [data-ebene]');
  await p.click('[data-ebene="bundeslaender"]');
  await p.waitForSelector('.schirm.da .karte svg');
  // ZWEI Sitzungen. Ein Aufkleber braucht Fach 3, also zweimal richtig -
  // mit einer Sitzung waere das Forscherbuch immer leer, und das Tor
  // koennte den Aufkleber nie sehen.
  for (let runde = 0; runde < 2; runde++) {
    for (let n = 0; n < 6; n++) {
      if (!(await p.$('.schirm.da .karte svg'))) break;
      geloest.push(await loese(p));
      await p.waitForTimeout(700);
      const art = await fahnePruefen(p, geloest[geloest.length - 1]);
      if (art) fahnenArten.add(art);
      // Die Messung ersetzt die Wartezeit, sie kommt nicht dazu. Beim
      // ersten Anlauf stand sie VOR der Fahnenpruefung, verbrauchte 2,6 s
      // und ueberholte damit den Bildschirmwechsel - danach meldete das
      // Tor „kein Name auf der Karte", obwohl der Name dagewesen war.
      if (ueberblendung === null) ueberblendung = await ueberblendungMessen(p);
      else await p.waitForTimeout(1100);
    }
    const nochmal = await p.$('.schirm.da #nochmal');
    if (nochmal) { await nochmal.click(); await p.waitForSelector('.schirm.da .karte svg'); }
  }
  // Gemessen wird in der ZWEITEN Sitzung: dort muss stehen, was in der
  // ersten gelernt wurde. Beim ersten Anlauf hing der Fortschritt an der
  // Sitzung und war nach dem Neustart weg - der Rauchtest meldete null
  // gekonnte Gebiete, und das war richtig.
  // Fuellt sich die Karte wirklich? Die Zusage lautet: was schon sass,
  // bleibt in voller Farbe stehen und traegt einen Haken - und zwar ueber
  // den Aufgabenwechsel hinweg, denn der baut den Bildschirm neu.
  const gefuellt = await p.evaluate(() => ({
    gekonnt: document.querySelectorAll('.schirm.da path.geb.gekonnt').length,
    haken:   document.querySelectorAll('.schirm.da .haken').length,
    ruhig:   document.querySelectorAll('.schirm.da path.geb.ruhig').length,
  }));
  console.log(`  Karte nach zwei Sitzungen: ${gefuellt.gekonnt} Gebiete in voller Farbe, `
    + `${gefuellt.haken} Haken, ${gefuellt.ruhig} noch gedämpft`);
  if (gefuellt.gekonnt < 2)
    merke('gekonnt', new Error(`nur ${gefuellt.gekonnt} Gebiete stehen in voller Farbe — `
      + `der Fortschritt überlebt den Aufgabenwechsel nicht`));
  if (gefuellt.haken !== gefuellt.gekonnt)
    merke('gekonnt', new Error(`${gefuellt.gekonnt} gekonnte Gebiete, aber ${gefuellt.haken} Haken`));
  await p.screenshot({ path: '/tmp/smoke-spiel.png' });
  await p.close();
} catch (e) { merke('spielen', e); }

/* --- Durchgang 2: NEUE Seite, gleiche Herkunft. Traegt die Ablage? ---- */
let fortschritt = null;
try {
  const p = await neueSeite({ width: 1180, height: 820 }, ctx);
  await p.click('[data-profil="fiona"]');
  await p.waitForSelector('.schirm.da [data-ebene="bundeslaender"]');
  fortschritt = await p.$eval('[data-ebene="bundeslaender"] .rolle', e => e.textContent.trim());
  // Der Beweis ist die ABLAGE, nicht der Text. Ein Regex auf "0 von 16"
  // trifft die 16 und meldet gruen - genau das ist beim ersten Lauf passiert.
  const abgelegt = await p.evaluate(() => new Promise(ja => {
    const a = indexedDB.open('lernkiste');
    a.onsuccess = () => { const d = a.result;
      const t = d.transaction('fortschritt', 'readonly');
      const g = t.objectStore('fortschritt').get('fiona:bundeslaender');
      g.onsuccess = () => ja(g.result ? Object.keys(g.result).length : 0);
      g.onerror = () => ja(-1); };
    a.onerror = () => ja(-1);
  }));
  console.log(`  In der Ablage:              ${abgelegt} Gegenstände im Leitner-Stand`);
  if (abgelegt < 3) merke('ablage', new Error(`nur ${abgelegt} Gegenstände abgelegt, erwartet mindestens 3`));
  // Forscherbuch
  await p.click('#buch');
  await p.waitForSelector('.schirm.da .aufkleber');
  const kleber = await p.$$eval('.schirm.da .aufkleber.da', e => e.length);
  if (kleber < 1) merke('forscherbuch', new Error('kein einziger Aufkleber nach zwei Sitzungen'));
  const alleKleber = await p.$$eval('.schirm.da .aufkleber', e => e.length);
  await p.screenshot({ path: '/tmp/smoke-buch.png' });
  // Elternbereich
  await p.click('#zur'); await p.waitForSelector('.schirm.da #eltern');
  await p.click('#eltern'); await p.waitForSelector('.schirm.da .ziffern');
  for (let i = 0; i < 4; i++) await p.click('.schirm.da [data-z="0"]');
  await p.waitForSelector('.schirm.da .kacheln', { timeout: 4000 });
  const antworten = await p.$eval('.schirm.da .wert b', e => e.textContent);
  // Gezielt die Fassungstabelle, nicht irgendeine - die erste ist die
  // Wackelkandidatenliste, und der Bericht meldete "Niedersachsen · 2".
  const fassung = await p.evaluate(() => {
    const h = [...document.querySelectorAll('.schirm.da .gruppe')].find(x => /Diese Fassung/.test(x.textContent));
    const t = h && h.nextElementSibling;
    return t ? [...t.querySelectorAll('tr')].map(r => [...r.cells].map(c => c.textContent).join(': ')) : [];
  });
  await p.screenshot({ path: '/tmp/smoke-eltern.png', fullPage: true });
  console.log(`  Fortschritt nach Neustart:  ${fortschritt}`);
  console.log(`  Forscherbuch:               ${kleber} von ${alleKleber} Aufklebern`);
  console.log(`  Elternbereich:              ${antworten} Antworten protokolliert`);
  console.log(`  Fassungsstempel:            ${fassung.join(' · ')}`);

  /* --- „Von vorne": das Kind kommt selbst wieder an die Aufgaben ------
   *
   * Der Anlass: wer eine Ebene gekonnt hat, kam nicht mehr an sie heran.
   * Der einzige Weg zurueck ging ueber „Alles von Fiona loeschen" im
   * Elternbereich - und das loescht das ganze Profil.
   *
   * Geprueft wird die ganze Kette, nicht das Vorhandensein eines Knopfes:
   * ist Fortschritt da, steht der Knopf da; ein Tipper fragt nach; der
   * zweite loescht; danach ist die Ebene wirklich leer. Ein Knopf, der
   * dasteht und nichts tut, waere schlimmer als keiner.
   */
  // ZULETZT, denn es raeumt weg, was Forscherbuch und Elternbereich
  // brauchen. Der erste Anlauf stand davor und meldete prompt
  // „kein einziger Aufkleber" - der Test hatte sich selbst die
  // Grundlage entzogen.
  {
    // Zurueck aus dem Elternbereich in die Ebenenwahl - dort steht der Knopf.
    await p.click('.schirm.da #zur');
    await p.waitForSelector('.schirm.da [data-ebene]', { timeout: 5000 });
    await p.waitForTimeout(400);
    const knopf = await p.$('.schirm.da [data-neu="bundeslaender"]');
    if (!knopf) merke('vonvorne', new Error(
      'nach zwei Sitzungen steht kein „von vorne" an den Bundesländern'));
    else {
      const erst = await knopf.textContent();
      await knopf.click(); await p.waitForTimeout(150);
      // Der Knopf kann nach dem ersten Tipper VERSCHWUNDEN sein - naemlich
      // genau dann, wenn er schon geloescht hat. Das ist der Befund, nicht
      // ein Fehler im Test: der erste Anlauf stuerzte hier ab, statt ihn zu
      // melden, und die Gegenprobe schlug „aus einem anderen Grund" an.
      const zweiter = await p.$('.schirm.da [data-neu="bundeslaender"]');
      const nachfrage = zweiter ? (await zweiter.textContent()) : '(weg)';
      if (!/Wirklich/.test(nachfrage)) merke('vonvorne', new Error(
        `der erste Tipper löscht sofort — er fragt nicht nach (steht: „${nachfrage.trim()}")`));
      if (zweiter) await zweiter.click();
      await p.waitForTimeout(500);
      const rest = await p.evaluate(() => new Promise(ja => {
        const a = indexedDB.open('lernkiste');
        a.onsuccess = () => { const d = a.result;
          const g = d.transaction('fortschritt', 'readonly').objectStore('fortschritt')
            .get('fiona:bundeslaender');
          g.onsuccess = () => ja(g.result ? Object.keys(g.result).length : 0);
          g.onerror = () => ja(-1); };
        a.onerror = () => ja(-1);
      }));
      console.log(`  „Von vorne":                „${erst.trim()}" → nachgefragt → `
        + `${rest} Gegenstände übrig`);
      if (rest !== 0) merke('vonvorne', new Error(
        `nach „von vorne" stehen noch ${rest} Gegenstände im Leitner-Stand`));
      const weg = await p.$('.schirm.da [data-neu="bundeslaender"]');
      if (weg) merke('vonvorne', new Error(
        'der Knopf steht noch da, obwohl es keinen Fortschritt mehr gibt'));
      // Das Forscherbuch braucht Aufkleber - die Bundeslaender sind jetzt
      // leer, aber die Kontinente aus der ersten Sitzung stehen noch.
    }
  }


  if (+antworten < 3) merke('protokoll', new Error(`nur ${antworten} Einträge`));
  await p.close();
} catch (e) { merke('ablage/eltern', e); }

/* --- Durchgang 3: Hochformat, Lea tippt ------------------------------- */
try {
  const p = await neueSeite({ width: 390, height: 844 }, ctx);
  await p.click('[data-profil="lea"]');
  await p.waitForSelector('.schirm.da [data-ebene]');
  // Auf einer Ebene, auf der Lea WIRKLICH tippt. Die Bundeslaender sind
  // seit der Farbrunde eine Auswahl mit vier Moeglichkeiten - dort gibt es
  // kein Eingabefeld mehr, und der Rauchtest lief in einen Zeitablauf.
  await p.click('[data-ebene="laender:europa"]');
  await p.waitForSelector('.schirm.da .eingabe', { timeout: 15000 });
  const name = await p.evaluate(() => {
    const id = document.querySelector('.schirm.da path.ziel').dataset.id;
    const D = JSON.parse(document.getElementById('daten').textContent);
    return Object.values(D.laender).flat().find(x => x.a3 === id).name;
  });
  await p.fill('.schirm.da .eingabe', name.toLowerCase());
  await p.click('.schirm.da .knopf:has-text("Prüfen")');
  await p.waitForFunction(() => /groß/.test(document.querySelector('.schirm.da .frage')?.textContent || ''),
    null, { timeout: 4000 });
  console.log(`  Rechtschreibhinweis:        „${name.toLowerCase()}" → Großschreibung gemeldet`);
  await p.close();
} catch (e) { merke('tippen', e); }

/* --- Durchgang 4: Ebene 4 - vier Staedte, eine richtig ---------------- */
//
// Die Zusage lautet: IMMER genau vier Staedte, genau eine davon richtig,
// genau eine aus demselben Bundesland (die Falle), und die richtige klebt
// nicht auf einem Platz. Jede dieser vier Zusagen wird hier einzeln
// nachgezaehlt - und zwar fuer BEIDE Profile, weil diese Ebene als einzige
// auch bei Lea eine Auswahl ist.
const plaetze = new Set();
let ebene4 = 0;
for (const wer of ['fiona', 'lea']) {
  try {
    const eigen = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
    const p = await neueSeite({ width: 844, height: 390 }, eigen);
    await p.click(`[data-profil="${wer}"]`);
    await p.waitForSelector('.schirm.da [data-ebene]');
    await p.click('[data-ebene="hauptstaedte"]');
    // Die Einweisung zu den Stadtstaaten steht beim ersten Mal davor.
    await p.waitForSelector('.schirm.da #weiter, .schirm.da .karte svg path.ziel', { timeout: 6000 });
    const weiter = await p.$('.schirm.da #weiter');
    if (weiter) await weiter.click();
    await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 6000 });
    for (let n = 0; n < 5; n++) {
      if (!(await p.$('.schirm.da .karte svg path.ziel'))) break;
      const i = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        const D = JSON.parse(document.getElementById('daten').textContent);
        const bl = D.deutschland.find(x => x.id === s.querySelector('path.ziel').dataset.id);
        const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent.trim());
        return { land: bl.name, hs: bl.hauptstadt, ausLand: bl.ablenker, namen,
                 tippfeld: !!s.querySelector('input.eingabe') };
      });
      ebene4++;
      if (i.tippfeld) merke('ebene4', new Error(`${wer}/${i.land}: Tippfeld statt Auswahl`));
      if (i.namen.length !== 4)
        merke('ebene4', new Error(`${wer}/${i.land}: ${i.namen.length} Städte statt 4`));
      if (i.namen.filter(x => x === i.hs).length !== 1)
        merke('ebene4', new Error(`${wer}/${i.land}: die richtige Stadt steht nicht genau einmal da`));
      const gleiche = i.namen.filter(x => i.ausLand.includes(x)).length;
      if (gleiche !== 1)
        merke('ebene4', new Error(`${wer}/${i.land}: ${gleiche} Städte aus demselben Land, erwartet 1`));
      if (new Set(i.namen).size !== 4)
        merke('ebene4', new Error(`${wer}/${i.land}: doppelte Stadt unter ${i.namen.join(', ')}`));
      plaetze.add(i.namen.indexOf(i.hs));
      const ok = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da'); const z = s.querySelector('path.ziel');
        const D = JSON.parse(document.getElementById('daten').textContent);
        const bl = D.deutschland.find(x => x.id === z.dataset.id);
        const svg = s.querySelector('.karte svg'); const pt = svg.createSVGPoint();
        pt.x = bl.anker[0]; pt.y = bl.anker[1]; const q = pt.matrixTransform(svg.getScreenCTM());
        const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent.trim());
        return { x: q.x, y: q.y, idx: namen.indexOf(bl.hauptstadt) };
      });
      if (ok.idx < 0) break;
      const et = (await p.$$('.schirm.da .etikett'))[ok.idx]; const bb = await et.boundingBox();
      await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down();
      await p.mouse.move(ok.x, ok.y, { steps: 8 }); await p.mouse.up();
      await p.waitForTimeout(1100);
    }
    await eigen.close();
  } catch (e) { merke('ebene4', e); }
}
// Eine Mischung, die die richtige Antwort immer auf denselben Platz legt,
// besteht jede Einzelpruefung oben - und ist trotzdem kaputt.
if (ebene4 && plaetze.size < 3)
  merke('ebene4', new Error(`die richtige Stadt lag in ${ebene4} Aufgaben nur auf `
    + `${plaetze.size} verschiedenen Plätzen (${[...plaetze].map(x=>x+1).sort().join(', ')})`));
console.log(`  Ebene 4:                    ${ebene4} Aufgaben, immer 4 Städte, `
  + `richtige auf Platz ${[...plaetze].map(x=>x+1).sort().join('/')}`);

/* --- Durchgang 5: jede Ebene, beide Profile, eine richtige Antwort ----- */
//
// Der einfachste Test, den es gibt - und der, der gefehlt hat. Ein Kind
// gibt eine richtige Antwort; wird sie als richtig gewertet?
//
// Zwei Fehler waren hier: ein getippter Alias ("Australien" fuer den
// Kontinent "Australien und Ozeanien") wurde abgelehnt, weil die
// Rechtschreibpruefung nur den kanonischen Namen bekam. Und ein gezogenes
// Etikett landete auf dem pulsierenden Ring um das Ziel statt auf dem Ziel -
// dann passierte gar nichts.
//
// Gezogen wird bewusst NICHT auf den Anker aus den Daten, sondern auf einen
// Punkt, den ein Kind sieht: die Probe sucht selbst eine Stelle, an der das
// Gebiet obenauf liegt.
// Welche Antwortwege wirklich gegangen wurden. Eine Zeile am Ende, die
// zeigt, ob beide Kinder auf IHRE Art gespielt haben - und nicht beide auf
// dieselbe.
const wege = new Set();
const EBENEN_ALLE = ['kontinente', 'laender:europa', 'laender:afrika',
  'laender:asien', 'laender:nordamerika', 'laender:suedamerika',
  'bundeslaender', 'hauptstaedte'];
for (const wer of ['fiona', 'lea']) {
  const eigen = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
  try {
    const p = await neueSeite({ width: 1180, height: 820 }, eigen);
    await p.click(`[data-profil="${wer}"]`);
    await p.waitForSelector('.schirm.da [data-ebene]');
    const da = await p.$$eval('.schirm.da [data-ebene]', es => es.map(e => e.dataset.ebene));
    for (const e of EBENEN_ALLE)
      if (!da.includes(e)) merke('durchgang', new Error(`${wer}: Ebene „${e}" fehlt in der Auswahl`));
    for (const ebene of da) {
      await p.$eval(`.schirm.da [data-ebene="${ebene}"]`, x => x.click());
      await p.waitForTimeout(400);
      const w = await p.$('.schirm.da #weiter');
      if (w) await p.$eval('.schirm.da #weiter', x => x.click());
      await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 8000 });
      await p.waitForTimeout(400);
      const z = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        const ziel = s.querySelector('path.ziel');
        const frage = s.querySelector('.frage').textContent;
        const D = JSON.parse(document.getElementById('daten').textContent);
        const alle = [...D.kontinente, ...Object.values(D.laender).flat(), ...D.deutschland];
        const g = alle.find(x => (x.id || x.a3) === ziel.dataset.id) || {};
        const istHaupt = /Hauptstadt/.test(frage);
        // Eine Stelle suchen, an der das Ziel wirklich obenauf liegt.
        const bb = ziel.getBoundingClientRect();
        let punkt = { x: bb.left + bb.width / 2, y: bb.top + bb.height / 2 };
        const kreis = s.querySelector(`#treffer circle[data-id="${ziel.dataset.id}"]`);
        if (kreis) { const k = kreis.getBoundingClientRect();
          punkt = { x: k.left + k.width / 2, y: k.top + k.height / 2 }; }
        else for (let n = 0; n <= 8 && !punkt.gefunden; n++) for (let m = 0; m <= 8; m++) {
          const x = bb.left + bb.width * (n + .5) / 9, y = bb.top + bb.height * (m + .5) / 9;
          if (document.elementFromPoint(x, y) === ziel) { punkt = { x, y, gefunden: true }; break; }
        }
        return { name: istHaupt ? g.hauptstadt : g.name,
                 alias: (!istHaupt && g.aliasse && g.aliasse.length) ? g.aliasse[0] : null,
                 ...punkt, tippfeld: !!s.querySelector('input.eingabe'),
                 weise: s.querySelector('#weise')?.dataset.weise || null,
                 etiketten: [...s.querySelectorAll('.etikett')].map(x => x.textContent.trim()) };
      });
      // Beim Tippen den ALIAS nehmen, wenn es einen gibt - dort war der Fehler.
      const eingabe = z.tippfeld && z.alias ? z.alias : z.name;
      if (z.tippfeld) {
        await p.fill('.schirm.da .eingabe', eingabe);
        await p.$eval('.schirm.da .wahlliste .knopf', x => x.click());
      } else {
        const i = z.etiketten.indexOf(z.name);
        if (i < 0) { merke('durchgang', new Error(`${wer}/${ebene}: „${z.name}" fehlt unter `
          + `${z.etiketten.join(', ')}`)); continue; }
        const et = (await p.$$('.schirm.da .etikett'))[i];
        // Gespielt wird so, wie das Kind es spielt. Lea tippt an, Fiona
        // zieht - das steht am Umschalter, und der Test liest es dort ab
        // statt es zu wissen. Sonst prueft er einen Weg, den niemand geht.
        if (z.weise === 'antippen') {
          await et.click();
          wege.add(`${wer}: antippen`);
        } else {
          const bb = await et.boundingBox();
          await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
          await p.mouse.down();
          await p.mouse.move(z.x, z.y, { steps: 8 });
          await p.mouse.up();
          wege.add(`${wer}: ziehen`);
        }
      }
      await p.waitForTimeout(900);
      const r = await p.evaluate(() => {
        const f = document.querySelector('.schirm.da .frage');
        return (f?.querySelector('.richtigText') ? '✓ ' : '') + (f?.textContent.trim() || '');
      });
      if (!/^✓ /.test(r || ''))
        merke('durchgang', new Error(`${wer}/${ebene}: „${eingabe}" richtig `
          + `${z.tippfeld ? 'getippt' : z.weise === 'antippen' ? 'angetippt' : 'gezogen'} → „${r}"`));
      durchgespielt++;
      await p.waitForTimeout(1500);
      const zur = await p.$('.schirm.da #zur');
      if (zur) await p.$eval('.schirm.da #zur', x => x.click());
      await p.waitForSelector('.schirm.da [data-ebene]', { timeout: 8000 }).catch(() => {});
    }
    await p.close();
  } catch (e) { merke('durchgang', e); }
  await eigen.close();
}
console.log(`  Durchgespielt:              ${durchgespielt} Ebenen × Profile, jede richtige Antwort gewertet`);
console.log(`  Antwortwege:                ${[...wege].sort().join(' · ') || 'KEINE'}`);
// Voreingestellt zieht Fiona und tippt Lea an. Wird nur EIN Weg gegangen,
// ist der Umschalter entweder weg oder wirkungslos - und die Haelfte der
// Bedienung ungeprueft.
for (const soll of ['fiona: ziehen', 'lea: antippen'])
  if (!wege.has(soll))
    fehler.push(`Kein einziger Zug über „${soll}" — der Umschalter greift nicht `
      + `(gegangen wurde: ${[...wege].join(', ') || 'nichts'})`);

await ctx.close(); await b.close(); server.close();

console.log(`  Namen auf der Karte:        ${[...fahnenArten].join(' und ') || 'KEINE'}`);
// Der schwaechere der beiden Bildschirme, im schlimmsten Bild des Wechsels.
// 0,20 laesst den Rand der Ueberblendung zu und faengt das Doppelbild:
// blenden beide gleichzeitig, treffen sie sich bei etwa 0,5.
const UEBERBLENDUNG_MAX = 0.20;
console.log(`  Übergang zur nächsten:      zweiter Bildschirm höchstens `
  + `${ueberblendung === null ? '—' : ueberblendung.toFixed(2)} sichtbar `
  + `(erlaubt ${UEBERBLENDUNG_MAX})`);
if (ueberblendung === null)
  fehler.push('Der Übergang wurde nicht gemessen — die Prüfung lief nicht');
else if (ueberblendung > UEBERBLENDUNG_MAX)
  fehler.push(`Beim Wechsel sind beide Bildschirme gleichzeitig zu sehen `
    + `(der schwächere bei ${ueberblendung.toFixed(2)}) — ein Doppelbild: `
    + 'die alte Antwort steht über der neuen Frage');
// Faellt die Entscheidung IMMER gleich aus, ist sie keine Messung, sondern
// eine feste Einstellung - und der halbe Sinn der Fahne waere weg.
if (fahnenArten.size < 2)
  fehler.push(`fahne: in zwölf Aufgaben nur die Sorte „${[...fahnenArten][0] || '—'}" — `
    + `die Entscheidung „passt hinein" wird nicht wirklich gemessen`);
console.log(`  Gelöst im ersten Durchgang: ${geloest.join(', ')}`);
if (fehler.length) { console.log(`\n  ${fehler.length} FEHLER:`); fehler.forEach(f => console.log('    ✗ ' + f)); process.exit(1); }
console.log('\n  Rauchtest grün: gespielt, abgelegt, Neustart überstanden, Buch gefüllt, Eltern gelesen, getippt.');
