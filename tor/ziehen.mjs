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
import { starte } from './chromium.mjs';

const DIST = path.join(process.cwd(), 'dist');
const TYP = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json',
  '.css':'text/css', '.png':'image/png', '.woff2':'font/woff2', '.svg':'image/svg+xml',
  '.webmanifest':'application/manifest+json' };

/** Soll: so weit darf der Daumen einer Sechsjaehrigen danebenliegen. */
const GRENZE = 40;
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
  await p.waitForSelector('.schirm.da [data-ebene]');
  await p.click('[data-ebene="kontinente"]');
  await p.waitForFunction(() => document.querySelector('.schirm.da path.ziel'), null, { timeout: 5000 });
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
  return { ...r, leuchtet, eintraege, ziel: info.id, richtig: /Das ist /.test(r.frage) };
}

console.log('\n  Tor `ziehen`');

/* --- 1. Wie weit darf man danebenliegen? ------------------------------- */
let weiteste = 0, engste = null, welches = '';
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
// Ein Deckel-Test ueber diese Reihe waere unbrauchbar: 200 px neben
// Australien liegt ein anderer Kontinent, und den zu treffen ist eine
// falsche ANTWORT. Von aussen sieht das aus wie "nichts gefunden". Der
// Deckel wird deshalb weiter unten am offenen Meer geprueft, wo der
// Unterschied messbar ist.

/* --- 2. Ein Fehlwurf ist nie stumm -------------------------------------
 *
 * Nicht "weit daneben": 260 Bildpunkte neben Australien liegt ein anderer
 * Kontinent, und den zu treffen ist eine falsche ANTWORT, kein Fehlwurf.
 * Gesucht wird offenes Meer - ein Punkt ueber der Karte, an dem auch mit
 * voller Nachsicht nichts zu finden ist. Er wird am laufenden Spiel
 * gesucht, nicht abgeschrieben: bei einer neuen Karte gaebe es ihn sonst
 * vielleicht gar nicht mehr, und die Pruefung wuerde still bedeutungslos.
 */
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

/* --- 3. Man sieht, was gelten wird -------------------------------------- */
const nah = await ziehe(20);
console.log(`    beim Ziehen leuchtet auf: ${nah.leuchtet || 'NICHTS'}`);
if (nah.leuchtet !== nah.ziel)
  fehler.push(`Während des Zuges leuchtet ${nah.leuchtet || 'nichts'} auf, `
    + `erwartet war ${nah.ziel} — Nachsicht ohne Anzeige ist ein Würfel, den niemand sieht`);

/* --- 4. Antippen ist kein Ziehen ---------------------------------------
 *
 * Aufgehoben wird erst nach 6 Punkten Weg. Ohne diese Schwelle sprang das
 * Etikett schon bei der leisesten Beruehrung auf `position:fixed` unter den
 * Finger und wieder zurueck - und ein Kind, das nur hoeren wollte, wie der
 * Name klingt, bekam ein Zucken. Getippt wird viel: das Etikett liest sich
 * selbst vor.
 */
{
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
const { p: p4 } = await aufgabe();
const rest = await p4.evaluate(() => document.querySelectorAll('path.geb.drueber').length);
await schliesse(p4);
if (rest) fehler.push(`${rest} Gebiete leuchten, ohne dass jemand zieht`);

await b.close(); srv.close();

if (fehler.length) {
  console.log('');
  for (const f of fehler) console.log(`  ✗ ${f}`);
  console.log(`\n  ziehen ROT: ${fehler.length} Befund${fehler.length > 1 ? 'e' : ''}.\n`);
  process.exit(1);
}
console.log(`\n  ziehen grün: bis ${weiteste} px Nachsicht, sichtbar, und nie stumm.\n`);
