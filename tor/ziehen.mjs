// Tor `ziehen`.
//
// Misst am GEBAUTEN Spiel, wie weit ein Kind danebenliegen darf - und ob es
// sieht, wohin es zieht.
//
// Der Anlass: "im FIONA-Profil kommen die Moeglichkeiten nicht richtig an".
// Nachgemessen war die Toleranz **16 Bildpunkte**, und jenseits davon
// passierte GAR NICHTS - kein Hinweis, kein Protokolleintrag, keine
// Bewegung. Das Etikett sprang zurueck, und das Kind erfuhr nie, warum.
//
// Warum kein bestehendes Tor das gesehen hat: der Rauchtest zieht auf den
// Anker, also auf den einen Punkt, der immer trifft. Er beweist damit, dass
// Ziehen FUNKTIONIERT - nicht, dass es BENUTZBAR ist. Das ist der
// Unterschied, den Regel 13 meint: wer eine Wirkung messen will, muss sie
// abschalten koennen. Hier heisst das: absichtlich danebenziehen.
//
// Drei Zusagen:
//   1. Wer bis GRENZE Bildpunkte neben das Ziel zieht, trifft es.
//   2. Wer weiter danebenliegt, bekommt eine Rueckmeldung - nie Stille.
//   3. Waehrend des Zuges leuchtet auf, was gelten wuerde.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { starte, zurEbenenwahl, durchVorlauf } from './chromium.mjs';

const DIST = path.join(process.cwd(), 'dist');
const TYP = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json',
  '.css':'text/css', '.png':'image/png', '.woff2':'font/woff2', '.svg':'image/svg+xml',
  '.webmanifest':'application/manifest+json' };

/** Soll: so weit darf der Daumen einer Sechsjaehrigen danebenliegen. */
const GRENZE = 40;

/**
 * Abschnitte.
 *
 * Voll gefahren dauert dieses Tor rund 26 Sekunden - es oeffnet fuer jeden
 * Wurf einen frischen Browserkontext, und die Messreihe allein sind zehn.
 * In der Kette laeuft es einmal, das ist in Ordnung; in `npm run proben`
 * lief es FUENFMAL, und jede der fuenf Proben interessierte sich fuer genau
 * einen Abschnitt. 129 von 288 Sekunden gingen dafuer drauf.
 *
 * `--nur=nachsicht` faehrt nur diesen Abschnitt. Voreingestellt laeuft
 * alles, und die Kette ruft es ohne Argument auf - eine Abkuerzung, die man
 * versehentlich nimmt, waere keine.
 */
const ABSCHNITTE = ['nachsicht', 'oben', 'meer', 'anzeige', 'tippen', 'rest', 'treffer'];
const gewaehlt = (process.argv.find(a => a.startsWith('--nur=')) || '').slice(6)
  .split(',').filter(Boolean);
if (gewaehlt.some(a => !ABSCHNITTE.includes(a))) {
  console.log(`\n  ziehen: „${gewaehlt.join(',')}" — bekannt sind ${ABSCHNITTE.join(', ')}\n`);
  process.exit(2);
}
const laeuft = (a) => gewaehlt.length === 0 || gewaehlt.includes(a);
/** Und so weit darf die Nachsicht NICHT reichen - sonst trifft jeder Wurf. */
const DECKEL = 140;

const fehler = [];

const srv = http.createServer((q, a) => {
  const u = q.url.split('?')[0];
  const f = path.join(DIST, u === '/' ? '/index.html' : u);
  if (!f.startsWith(DIST) || !fs.existsSync(f)) { a.writeHead(404); return a.end(); }
  a.writeHead(200, { 'content-type': TYP[path.extname(f)] || 'application/octet-stream' });
  a.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(0, r));
const port = srv.address().port;
const b = await starte();

/**
 * Eine Aufgabe oeffnen und Ziel, Anker und Etikett zurueckgeben.
 *
 * JEDER Aufruf bekommt einen frischen Kontext. Sonst haelt `localStorage`
 * den Fortschritt fest, die naechste Seite steht auf der naechsten Aufgabe -
 * und die Messreihe vergleicht zehn Weiten an zehn VERSCHIEDENEN Gebieten.
 * Genau das ist beim ersten Lauf passiert: "getroffen bis 80 px" war eine
 * Zahl ueber Australien, Europa und Afrika gemittelt, also keine.
 */
async function aufgabe() {
  const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE',
    viewport: { width: 844, height: 390 } });
  const p = await ctx.newPage();
  p.__ctx = ctx;
  await p.goto(`http://localhost:${port}/`);
  await p.waitForSelector('[data-profil="fiona"]');
  await p.click('[data-profil="fiona"]');
  await zurEbenenwahl(p, 'kontinente');
  await p.click('[data-ebene="kontinente"]');
  // Seit R3 steht der Vorlauf beim ersten Betreten davor.
  await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel', { timeout: 25000 });
  await durchVorlauf(p);
  await p.waitForFunction(() => document.querySelector('.schirm.da path.ziel'), null, { timeout: 5000 });
  // Dieselbe Falle wie in `ansicht`: `kartenGroesse()` setzt die Karte in
  // zwei Bildern, und ein Anker, der vorher gelesen wird, zeigt woanders
  // hin. Das erklaert vermutlich auch, warum die gemessene Nachsicht
  // zwischen Laeufen zwischen 60 und 80 Punkten schwankte.
  await p.waitForFunction(() => {
    const k = document.querySelector('.schirm.da .karte');
    return !!(k && k.style.width && parseFloat(k.style.width) > 0);
  }, null, { timeout: 5000 });
  await p.waitForTimeout(150);
  const info = await p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const z = s.querySelector('path.ziel');
    const svg = s.querySelector('.karte svg');
    const D = JSON.parse(document.getElementById('daten').textContent);
    const g = D.kontinente.find(x => x.id === z.dataset.id);
    const pt = svg.createSVGPoint(); pt.x = g.anker[0]; pt.y = g.anker[1];
    const q = pt.matrixTransform(svg.getScreenCTM());
    const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent);
    return { id: g.id, name: g.name, x: q.x, y: q.y, idx: namen.indexOf(g.name) };
  });
  return { p, info };
}
const schliesse = async (p) => { const c = p.__ctx; await p.close(); if (c) await c.close(); };

/**
 * Zieht das richtige Etikett um `d` Bildpunkte am Ziel vorbei.
 *
 * Die Richtung ist nicht beliebig: gezogen wird nach `richtung`, und der
 * Aufrufer nimmt eine, die ins Meer zeigt. Nach innen "daneben" waere kein
 * Fehlwurf, sondern ein Treffer im Nachbargebiet.
 */
async function ziehe(d, richtung = [-1, 1], festesZiel = null) {
  const { p, info } = await aufgabe();
  const et = (await p.$$('.schirm.da .etikett'))[info.idx];
  const a = await et.boundingBox();
  const n = Math.hypot(richtung[0], richtung[1]) || 1;
  const zx = festesZiel ? festesZiel[0] : info.x + richtung[0] / n * d;
  const zy = festesZiel ? festesZiel[1] : info.y + richtung[1] / n * d;
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  await p.mouse.move(zx, zy, { steps: 12 });
  // Waehrend des Zuges: leuchtet etwas auf?
  await p.waitForTimeout(60);
  const leuchtet = await p.evaluate(() =>
    document.querySelector('.schirm.da path.geb.drueber')?.dataset.id || null);
  // Und haengt das Schild ueberhaupt am Finger?
  //
  // Es sah einmal so aus, als taete es das: das Ziel leuchtete richtig auf,
  // weil die Umkreissuche am FINGER haengt und nicht am Schild. Das Schild
  // selbst blieb in der Antwortliste stehen - eine abgelaufene
  // CSS-Animation hielt `transform: none` fest und schlug damit den
  // Inline-Stil. Gemessen wird deshalb der Abstand vom Finger.
  const amFinger = await p.evaluate(([x, y]) => {
    const e = document.querySelector('.schirm.da .etikett.zieht');
    if (!e) return -1;
    const r = e.getBoundingClientRect();
    const dx = Math.max(r.left - x, x - r.right, 0);
    const dy = Math.max(r.top - y, y - r.bottom, 0);
    return Math.round(Math.hypot(dx, dy));
  }, [zx, zy]);
  // Was liegt mitten unter dem Schild? Die Karte - oder das Schild selbst?
  const durchSchild = await p.evaluate(([x, y]) => {
    const e = document.querySelector('.schirm.da .etikett.zieht');
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const oben = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
    return !(oben === e || e.contains(oben));
  }, [zx, zy]);
  await p.mouse.up();
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => ({
    frage: document.querySelector('.schirm.da .frage')?.textContent || '',
    hinweis: document.querySelector('.schirm.da .hinweis')?.textContent || '',
  }));
  // Wieviel steht im Protokoll? Das ist die eigentliche Frage bei einem
  // Fehlwurf: ob er einen der drei Versuche gekostet hat.
  const eintraege = await p.evaluate(() => new Promise(ja => {
    const a = indexedDB.open('lernkiste');
    a.onsuccess = () => { const d = a.result;
      if (!d.objectStoreNames.contains('protokoll')) return ja(0);
      const q = d.transaction('protokoll', 'readonly').objectStore('protokoll').getAll();
      q.onsuccess = () => ja(q.result.length); q.onerror = () => ja(-1); };
    a.onerror = () => ja(-1);
  }));
  await schliesse(p);
  return { ...r, leuchtet, amFinger, durchSchild, eintraege, ziel: info.id, richtig: /Das ist /.test(r.frage) };
}

console.log('\n  Tor `ziehen`');

/* --- 1. Wie weit darf man danebenliegen? ------------------------------- */
let weiteste = 0, engste = null, welches = '';
if (laeuft('nachsicht')) {
for (const d of [0, 10, 20, 30, 40, 60, 80, 100, 140, 200]) {
  const r = await ziehe(d);
  welches = r.ziel;
  if (r.richtig) weiteste = d;
  else if (engste === null) engste = d;
}
console.log(`    „${welches}": getroffen bis ${weiteste} px daneben, `
  + `ab ${engste ?? '—'} px nicht mehr`);
if (weiteste < GRENZE)
  fehler.push(`Nachsicht nur ${weiteste} px — ein Daumen braucht ${GRENZE}`);
}
// Ein Deckel-Test ueber diese Reihe waere unbrauchbar: 200 px neben
// Australien liegt ein anderer Kontinent, und den zu treffen ist eine
// falsche ANTWORT. Von aussen sieht das aus wie "nichts gefunden". Der
// Deckel wird deshalb weiter unten am offenen Meer geprueft, wo der
// Unterschied messbar ist.

/* --- 1b. Auch von OBEN, wo das Schild im Weg haengt ---------------------
 *
 * Das Schild haengt UNTER dem Finger. Zieht man von oben heran, liegt das
 * gesuchte Gebiet also genau dort, wo das Schild ist - und die
 * Umkreissuche testet mit `elementFromPoint`, das immer nur das OBERSTE
 * Element liefert. Ist das Schild anfassbar, verdeckt es damit jeden
 * Punkt unter sich: bis zu 60 Bildpunkte Suchradius, von denen die untere
 * Haelfte blind ist.
 *
 * Die Reihe oben zieht nach links unten und merkt davon nichts. Genau so
 * ist `npm run proben` auf die Luecke gestossen: die Gegenprobe nahm
 * `pointer-events:none` heraus, und das Tor blieb gruen.
 */
let vonOben = 0;
if (laeuft('oben')) {
for (const d of [10, 20, 30, 40]) {
  const r = await ziehe(d, [0, -1]);      // Finger ueber dem Ziel, Ziel unter dem Schild
  if (r.richtig) vonOben = d;
}
console.log(`    von oben (Schild liegt über dem Ziel): getroffen bis ${vonOben} px`);
if (vonOben < GRENZE)
  fehler.push(`Von oben trifft man nur bis ${vonOben} px — das gezogene Schild `
    + 'verdeckt sein eigenes Ziel für die Trefferprüfung (fehlt `pointer-events:none`?)');
// Weiter als 40 wird hier NICHT gemessen: bei 55 Punkten über Australiens
// Anker steht der Finger schon über Indonesien, und das gehört zu Asien.
// Die Reihe würde dann einen Nachbarn messen statt das Schild - dieselbe
// Falle wie beim Deckel weiter unten.
}

/* --- 2. Ein Fehlwurf ist nie stumm -------------------------------------
 *
 * Nicht "weit daneben": 260 Bildpunkte neben Australien liegt ein anderer
 * Kontinent, und den zu treffen ist eine falsche ANTWORT, kein Fehlwurf.
 * Gesucht wird offenes Meer - ein Punkt ueber der Karte, an dem auch mit
 * voller Nachsicht nichts zu finden ist. Er wird am laufenden Spiel
 * gesucht, nicht abgeschrieben: bei einer neuen Karte gaebe es ihn sonst
 * vielleicht gar nicht mehr, und die Pruefung wuerde still bedeutungslos.
 */
if (laeuft('meer')) {
const { p: pm, info: im } = await aufgabe();
const meer = await pm.evaluate(() => {
  const k = document.querySelector('.schirm.da .karte').getBoundingClientRect();
  const land = (x, y) => {
    const e = document.elementFromPoint(x, y);
    return !!(e && e.closest && (e.closest('path.geb') || e.closest('#treffer circle')));
  };
  for (let y = k.top + 8; y < k.bottom - 8; y += 6)
    for (let x = k.left + 8; x < k.right - 8; x += 6) {
      let frei = true;
      for (let r = 0; r <= 100 && frei; r += 10)
        for (let i = 0; i < 16 && frei; i++)
          if (land(x + Math.cos(i * Math.PI / 8) * r, y + Math.sin(i * Math.PI / 8) * r)) frei = false;
      if (frei) return [x, y];
    }
  return null;
});
await schliesse(pm);
if (!meer) fehler.push('Kein offenes Meer auf der Karte gefunden — '
  + 'die Prüfung „nie stumm" kann nicht laufen');
const weit = meer ? await ziehe(0, [0, 0], meer) : { richtig: false, hinweis: 'x', eintraege: 0 };
const stumm = !weit.richtig && !weit.hinweis.trim();
console.log(`    ins offene Meer (${meer ? meer.map(v => v.toFixed(0)).join(',') : '—'}) → `
  + `${weit.hinweis.trim() || (weit.richtig ? 'GEWERTET' : 'STILLE')}`
  + `, ${weit.eintraege} Protokolleinträge`);
if (weit.richtig) fehler.push('Ein Wurf ins offene Meer wurde als Treffer gewertet');
if (stumm) fehler.push('Ein Fehlwurf bleibt ohne jede Rückmeldung — '
  + 'das Etikett springt zurück und das Kind erfährt nicht, warum');
// Und er darf keinen Versuch kosten. Das ist zugleich der DECKEL auf die
// Nachsicht: reicht sie zu weit, findet die Umkreissuche auch im offenen
// Meer noch irgendein Gebiet, wertet es als falsche Antwort - und nach drei
// solchen Fehlgriffen loest die App auf, ohne dass das Kind je geantwortet
// haette. "Nicht gewertet" ist hier praezise messbar, "nicht richtig" nicht:
// ein getroffenes NACHBARgebiet sieht von aussen genauso aus.
if (weit.eintraege > 0)
  fehler.push(`Ein Wurf ins offene Meer hat ${weit.eintraege} Protokolleintrag/-einträge `
    + 'erzeugt — er kostet damit einen der drei Versuche, obwohl er keine Antwort war '
    + `(Nachsicht reicht zu weit; der Deckel liegt bei ${DECKEL} px)`);
}

/* --- 3. Man sieht, was gelten wird -------------------------------------- */
if (laeuft('anzeige')) {
const nah = await ziehe(20);
console.log(`    beim Ziehen leuchtet auf: ${nah.leuchtet || 'NICHTS'}`);
// Das Schild haengt `LUFT` Punkte unter dem Finger; mehr als 60 waere es
// nicht mehr am Finger, sondern irgendwo.
console.log(`    beim Ziehen hängt das Schild ${nah.amFinger} px vom Finger entfernt`);
if (nah.amFinger < 0)
  fehler.push('Während des Zuges gibt es gar kein aufgehobenes Schild');
else if (nah.amFinger > 60)
  fehler.push(`Das gezogene Schild liegt ${nah.amFinger} px vom Finger entfernt — `
    + 'es folgt ihm nicht (überschreibt eine CSS-Animation den Inline-Stil?)');
// Nimmt die Karte den Finger auch DURCH das Schild hindurch an?
//
// Das ist die Frage, die `pointer-events:none` beantwortet, und sie laesst
// sich nicht am Ergebnis messen: das Schild haengt 22 Punkte unter dem
// Finger, das Ziel liegt meist schon oberhalb davon, und weiter unten
// stehen Nachbargebiete im Weg. Gefragt wird deshalb direkt: was liegt an
// einem Punkt MITTEN im Schild? Ist es das Schild selbst, ist die untere
// Haelfte des Suchradius blind.
if (nah.durchSchild === false)
  fehler.push('Ein Punkt mitten im Schild liefert das Schild statt der Karte — '
    + 'damit ist die untere Hälfte des Suchradius blind (fehlt `pointer-events:none`?)');
console.log(`    unter dem Schild liegt: ${nah.durchSchild === null ? '—'
  : nah.durchSchild ? 'die Karte' : 'DAS SCHILD'}`);
if (nah.leuchtet !== nah.ziel)
  fehler.push(`Während des Zuges leuchtet ${nah.leuchtet || 'nichts'} auf, `
    + `erwartet war ${nah.ziel} — Nachsicht ohne Anzeige ist ein Würfel, den niemand sieht`);
}

/* --- 4. Antippen ist kein Ziehen ---------------------------------------
 *
 * Aufgehoben wird erst nach 6 Punkten Weg. Ohne diese Schwelle sprang das
 * Etikett schon bei der leisesten Beruehrung auf `position:fixed` unter den
 * Finger und wieder zurueck - und ein Kind, das nur hoeren wollte, wie der
 * Name klingt, bekam ein Zucken. Getippt wird viel: das Etikett liest sich
 * selbst vor.
 */
if (laeuft('tippen')) {
  const { p: pt, info: it } = await aufgabe();
  const et = (await pt.$$('.schirm.da .etikett'))[it.idx];
  const a = await et.boundingBox();
  await pt.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await pt.mouse.down();
  await pt.mouse.move(a.x + a.width / 2 + 3, a.y + a.height / 2 + 2);   // Wackeln, kein Zug
  // Gemessen wird bei GEDRUECKTEM Finger. Nach dem Loslassen raeumt die App
  // ohnehin auf, und dann sieht ein Zucken genauso aus wie keines - der
  // erste Anlauf dieser Pruefung blieb deshalb gruen, obwohl die Schwelle
  // ausgebaut war.
  await pt.waitForTimeout(120);
  const nach = await pt.evaluate(() => {
    const e = document.querySelector('.schirm.da .etikett');
    return { zieht: e.classList.contains('zieht'), lage: getComputedStyle(e).position,
             frage: document.querySelector('.schirm.da .frage')?.textContent || '' };
  });
  await pt.mouse.up();
  await pt.waitForTimeout(200);
  await schliesse(pt);
  console.log(`    angetippt → Lage „${nach.lage}", gezogen: ${nach.zieht ? 'JA' : 'nein'}`);
  if (nach.zieht || nach.lage === 'fixed')
    fehler.push('Ein Antippen hebt das Etikett schon auf — es zuckt, '
      + 'obwohl das Kind nur den Namen hören wollte');
  if (/Das ist /.test(nach.frage))
    fehler.push('Ein Antippen wurde als Antwort gewertet');
}

/* --- 5. Das Aufleuchten verschwindet wieder ----------------------------- */
if (laeuft('rest')) {
  const { p: p4 } = await aufgabe();
  const rest = await p4.evaluate(() => document.querySelectorAll('path.geb.drueber').length);
  await schliesse(p4);
  if (rest) fehler.push(`${rest} Gebiete leuchten, ohne dass jemand zieht`);
}

/* --- 6. Die Trefferflaechen, auf JEDER Karte und am Bildschirm (P6) ----
 *
 * Hier wird eine Zahl an ihre Messstelle geholt.
 *
 * `tor/inhalt.mjs` hat die Trefferflaechen bisher in Node gerechnet:
 * `radius * 2 * (470/1000)` - 470 Bildpunkte Kartenbreite, geteilt durch
 * eine geschaetzte viewBox-Breite von 1000. Beides ist falsch. Die Karte
 * wird in ihren Kasten EINGEPASST, und auf dem Zielgeraet (844 x 390)
 * bindet die HOEHE, nicht die Breite. Gemessen in D2c: die Node-Rechnung
 * sagte 36,1 Punkte fuer die Schweiz, der Browser 24,9 - 35 % daneben.
 * Und die Vorzeichen kippten: Node sah Oesterreich, Tschechien und Polen
 * gar nicht als „zu klein", der Browser schon.
 *
 * Zwei Zusagen werden hier geprueft, und beide gehen nur am Bildschirm:
 *
 *   1. Kein Trefferkreis verschluckt den Anker eines ANDEREN Gebiets.
 *      Das ist die Regel aus F16 - Berlins Kreis lag auf Brandenburgs
 *      Anker, und wer „Brandenburg" auf Brandenburgs beste Stelle zog,
 *      bekam „Das ist Berlin." Der Code haelt sie seither ein; geprueft
 *      hat sie niemand, und schon gar nicht auf allen sieben Karten.
 *   2. Was kleiner ist als ein Daumen, hat einen Kreis. Ein Gebiet ohne
 *      Kreis, das unter 44 Punkten liegt, steht auf der Karte und laesst
 *      sich nicht treffen.
 *
 * Die Anker kommen aus dem GEBAUTEN Stand (`dist/`), nicht aus einer
 * zweiten Rechnung: es sind dieselben Zahlen, die die App laedt.
 */
if (laeuft('treffer')) {
  const daten = JSON.parse(fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
    .match(/<script[^>]*id="daten"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const ankerVon = {};
  ankerVon['kontinente'] = daten.kontinente
    .filter(k => k.anker).map(k => ({ id: k.id, name: k.name, anker: k.anker }));
  ankerVon['bundeslaender'] = daten.deutschland
    .filter(b => b.anker).map(b => ({ id: b.id, name: b.name, anker: b.anker }));
  for (const f of fs.readdirSync(path.join(DIST, 'daten'))) {
    const m = f.match(/^laender-(.+)\.json$/); if (!m) continue;
    const j = JSON.parse(fs.readFileSync(path.join(DIST, 'daten', f), 'utf8'));
    ankerVon[`laender:${m[1]}`] = (j.laender || [])
      .filter(l => l.anker).map(l => ({ id: l.a3, name: l.name, anker: l.anker }));
  }

  const zeilen = [];
  for (const [ebene, gebiete] of Object.entries(ankerVon)) {
    const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE',
      viewport: { width: 844, height: 390 } });
    const q = await ctx.newPage();
    await q.goto(`http://localhost:${port}/`);
    // Das tiefste Profil: es spielt alle Laender, also stehen auf der
    // Karte auch die kleinen. Mit Fiona (Tiefe 3) waere die Messung ein
    // Ausschnitt und haette Luxemburg nie gesehen.
    await q.waitForSelector('[data-profil="stephan"]');
    await q.click('[data-profil="stephan"]');
    await zurEbenenwahl(q, ebene);
    await q.click(`[data-ebene="${ebene}"]`);
    await q.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel',
      { timeout: 25000 });
    await durchVorlauf(q);
    await q.waitForFunction(() => document.querySelector('.schirm.da path.geb'),
      null, { timeout: 25000 });
    // Erst wenn `kartenGroesse()` gesetzt hat, stimmt der Massstab -
    // dieselbe Falle wie oben bei `aufgabe()`.
    await q.waitForFunction(() => {
      const k = document.querySelector('.schirm.da .karte');
      return !!(k && k.style.width && parseFloat(k.style.width) > 0);
    }, null, { timeout: 5000 });
    await q.waitForTimeout(200);
    const m = await q.evaluate((gebiete) => {
      const s = document.querySelector('.schirm.da');
      const svg = s.querySelector('.karte svg');
      const ctm = svg.getScreenCTM();
      const aufSchirm = (a) => { const pt = svg.createSVGPoint();
        pt.x = a[0]; pt.y = a[1]; const r = pt.matrixTransform(ctm);
        return { x: r.x, y: r.y }; };
      const kreise = [...s.querySelectorAll('#treffer circle')].map(c => {
        const r = c.getBoundingClientRect();
        return { id: c.dataset.id, x: r.left + r.width / 2, y: r.top + r.height / 2,
                 d: +r.width.toFixed(1) };
      });
      const kreisVon = new Map(kreise.map(k => [k.id, k]));
      const flaechen = new Map([...s.querySelectorAll('path.geb')].map(pf => {
        const r = pf.getBoundingClientRect();
        return [pf.dataset.id, +Math.max(r.width, r.height).toFixed(1)];
      }));
      // P7: welche Gebiete haelt die App selbst fuer zu klein zum Antippen?
      const klein = new Set([...s.querySelectorAll('path.geb[data-klein="1"]')]
        .map(pf => pf.dataset.id));
      /* Gelesen wird mit der Regel des SPIELS, nicht mit einer eigenen.
         `zielUnter` fragt `elementFromPoint`, nimmt einen Trefferkreis
         vor dem Umriss und liefert dessen Kennung. Eine zweite Rechnung
         daneben waere eine zweite Wahrheit (Regel 15) - und sie koennte
         gruen sein, waehrend das Spiel etwas anderes tut. */
      const liest = (x, y) => {
        const e = document.elementFromPoint(x, y);
        if (!e || !e.closest) return null;
        const k = e.closest('#treffer circle');
        if (k) return k.dataset.id;
        const pf = e.closest('path.geb');
        return pf ? pf.dataset.id : null;
      };
      const verschluckt = [], ohneKreis = [];
      for (const g of gebiete) {
        if (!flaechen.has(g.id)) continue;      // nicht auf dieser Karte
        const a = aufSchirm(g.anker);
        const wird = liest(a.x, a.y);
        if (wird && wird !== g.id) {
          // Warum - fuer die Meldung: welcher fremde Kreis liegt darauf?
          const k = kreise.find(c => c.id !== g.id
            && Math.hypot(a.x - c.x, a.y - c.y) <= c.d / 2);
          verschluckt.push({ wer: g.name, wird,
            vom: k ? k.id : null, radius: k ? k.d / 2 : null,
            abstand: k ? +Math.hypot(a.x - k.x, a.y - k.y).toFixed(1) : null });
        }
        if (flaechen.get(g.id) < 44 && !kreisVon.has(g.id))
          ohneKreis.push({ name: g.name, gross: flaechen.get(g.id) });
      }
      const kb = s.querySelector('.karte').getBoundingClientRect();
      /* Die Marke muss zum gemessenen Kreis passen - sonst entscheidet die
         App nach einer Zahl, die es am Bildschirm nicht gibt. 20 ist
         `MIN_REST`, der Boden, den sie selbst setzt. */
      const marke = [];
      for (const k of kreise) {
        const zuKlein = k.d < 20;
        if (zuKlein !== klein.has(k.id))
          marke.push({ id: k.id, d: k.d, markiert: klein.has(k.id) });
      }
      return { verschluckt, ohneKreis, marke,
               nichtTippbar: kreise.filter(k => klein.has(k.id)).map(k => `${k.id} ${k.d}`),
               kasten: `${Math.round(kb.width)}×${Math.round(kb.height)}`,
               kreise: kreise.sort((x, y) => x.d - y.d).slice(0, 3),
               n: flaechen.size, klein: [...flaechen.values()].filter(v => v < 44).length };
    }, gebiete);
    await q.close(); await ctx.close();

    for (const v of m.verschluckt) fehler.push(
      `${ebene}: wer auf den Anker von ${v.wer} zeigt, bekommt ${v.wird}`
      + (v.vom ? ` — dessen Trefferkreis (Radius ${v.radius} pt) liegt darüber, `
                 + `${v.abstand} pt daneben` : '')
      + '. Das ist die Stelle, die die App selbst zeigt (F16)');
    for (const o of m.ohneKreis) fehler.push(
      `${ebene}: ${o.name} ist ${o.gross} pt groß und hat keine entkoppelte `
      + 'Trefferfläche — es ist mit dem Finger nirgends zu treffen');
    for (const k of m.marke) fehler.push(
      `${ebene}: ${k.id} hat ${k.d} pt Trefferfläche, ist aber `
      + `${k.markiert ? 'als zu klein markiert' : 'NICHT als zu klein markiert'} — `
      + 'die umgekehrte Frage entscheidet dann nach einer Zahl, die es am '
      + 'Bildschirm nicht gibt (P7)');
    zeilen.push(`      ${ebene.padEnd(20)} Karte ${m.kasten.padStart(8)} · `
      + `${m.klein} von ${m.n} unter 44 pt · kleinste Kreise `
      + (m.kreise.length ? m.kreise.map(k => `${k.id} ${k.d}`).join(', ') : '(keine)')
      + (m.nichtTippbar.length ? ` · nicht antippbar: ${m.nichtTippbar.join(', ')}` : ''));
  }
  console.log('    Trefferflächen, gemessen im Browser auf 844 × 390:');
  zeilen.forEach(z => console.log(z));
}

await b.close(); srv.close();

if (fehler.length) {
  console.log('');
  for (const f of fehler) console.log(`  ✗ ${f}`);
  console.log(`\n  ziehen ROT: ${fehler.length} Befund${fehler.length > 1 ? 'e' : ''}.\n`);
  process.exit(1);
}
console.log(`\n  ziehen grün${gewaehlt.length ? ` (nur ${gewaehlt.join(', ')})` : ''}: `
  + `${laeuft('nachsicht') ? `bis ${weiteste} px Nachsicht, ` : ''}sichtbar, und nie stumm.\n`);
