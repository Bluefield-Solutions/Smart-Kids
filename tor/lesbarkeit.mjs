// Tor `lesbarkeit`.
//
// Kontrast ist die eine Gestaltungseigenschaft, die sich objektiv messen
// laesst - und die einzige, bei der "sieht gut aus" und "ist lesbar"
// auseinandergehen koennen, ohne dass es jemandem auffaellt.
//
// Gemessen wird im BROWSER an der gebauten Seite, nicht an den Marken:
// `color-mix`, Verlaeufe und der Abendmodus lassen sich nicht ausrechnen,
// nur ablesen. Was hier steht, ist das, was das Kind wirklich sieht.
//
// Grenzen nach WCAG 2.2:
//   4,5:1  normaler Text
//   3,0:1  grosser Text (ab 24 px, oder 18,7 px fett) und Bedienelemente
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { starte } from './chromium.mjs';

const DIST = path.join(process.cwd(), 'dist');
const fehler = [], hinweise = [];

const server = http.createServer((q, a) => {
  const f = path.join(DIST, q.url === '/' ? '/index.html' : q.url.split('?')[0]);
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    a.statusCode = 404; return a.end();
  }
  const typ = f.endsWith('.html') ? 'text/html; charset=utf-8'
    : f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'text/javascript'
    : f.endsWith('.png') ? 'image/png' : f.endsWith('.woff2') ? 'font/woff2'
    : f.endsWith('.webmanifest') ? 'application/manifest+json' : 'text/plain';
  a.setHeader('content-type', typ);
  a.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, r));
const ADRESSE = `http://127.0.0.1:${server.address().port}/`;

/**
 * Misst jeden sichtbaren Text gegen den Grund, auf dem er WIRKLICH steht.
 *
 * Den Grund zu finden ist der schwierige Teil: ein Element mit
 * `background:transparent` erbt den Grund seines Vorfahren, und ein Verlauf
 * hat gar keine einzelne Farbe. Deshalb wird der Elternbaum hochgelaufen,
 * bis eine deckende Farbe kommt - und Verlaeufe werden an ihren beiden
 * Enden gemessen, also im schlechtesten Fall.
 */
const MESSEN = () => {
  // Die Farbe vom BROWSER ausrechnen lassen, nicht aus dem Text raten.
  //
  // `getComputedStyle().backgroundColor` liefert bei einer oklch-Marke
  // auch `oklch(...)` zurueck. Ein naiver Zahlenparser las daraus
  // [1, 0, 0] - also fast Schwarz - und das Tor meldete 34 Fehler im
  // Tagmodus, die es nicht gab. Ein Pinselstrich auf eine Leinwand und
  // ein Blick auf das Ergebnis kann nicht danebenliegen.
  const leinwand = document.createElement('canvas');
  leinwand.width = leinwand.height = 1;
  const stift = leinwand.getContext('2d', { willReadFrequently: true });
  const puffer = new Map();
  const zuRgb = (s) => {
    if (!s || s === 'transparent' || s === 'none') return null;
    if (puffer.has(s)) return puffer.get(s);
    stift.clearRect(0, 0, 1, 1);
    stift.fillStyle = '#000';            // Rueckfall, falls s unlesbar ist
    stift.fillStyle = s;
    stift.fillRect(0, 0, 1, 1);
    const d = stift.getImageData(0, 0, 1, 1).data;
    const r = d[3] === 0 ? null : [d[0], d[1], d[2], d[3] / 255];
    puffer.set(s, r);
    return r;
  };
  const rel = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * rel(r) + 0.7152 * rel(g) + 0.0722 * rel(b);
  const kontrast = (a, b) => { const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

  const grundVon = (el) => {
    let p = el;
    while (p && p !== document.documentElement) {
      const cs = getComputedStyle(p);
      // Ein Verlauf: beide Endfarben einsammeln, beide zaehlen.
      const bild = cs.backgroundImage;
      if (bild && bild !== 'none') {
        const farben = [...bild.matchAll(/rgba?\([^)]*\)/g)].map(m => zuRgb(m[0])).filter(Boolean);
        if (farben.length) return farben;
      }
      const f = zuRgb(cs.backgroundColor);
      if (f && f[3] > 0.9) return [f];
      p = p.parentElement;
    }
    return [[255, 255, 255]];
  };

  const raus = [];
  for (const el of document.querySelectorAll('.schirm.da *')) {
    if (el.children.length && ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
      continue;                                   // nur Elemente mit eigenem Text
    const text = el.textContent.trim();
    if (!text) continue;
    const b = el.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || +cs.opacity < 0.5) continue;
    const vorn = zuRgb(cs.color);
    if (!vorn) continue;
    const gross = parseFloat(cs.fontSize) >= 24
      || (parseFloat(cs.fontSize) >= 18.7 && +cs.fontWeight >= 700);
    let schlechteste = Infinity;
    for (const g of grundVon(el)) schlechteste = Math.min(schlechteste, kontrast(vorn, g));
    raus.push({ text: text.slice(0, 30).replace(/\s+/g, ' '),
                klasse: (el.className || el.tagName).toString().split(' ')[0],
                px: Math.round(parseFloat(cs.fontSize)), gross,
                k: +schlechteste.toFixed(2), noetig: gross ? 3 : 4.5 });
  }
  return raus;
};

console.log('\n  Tor `lesbarkeit`');
const b = await starte();
let gemessen = 0, knapp = 0;

for (const abend of [false, true]) {
  const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE',
    viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(ADRESSE, { waitUntil: 'load' });
  await p.evaluate(async () => { await document.fonts.ready; });
  if (abend) await p.evaluate(() => document.documentElement.setAttribute('data-abend', 'an'));
  await p.waitForTimeout(300);

  const schau = async (wo) => {
    await p.waitForTimeout(350);
    for (const m of await p.evaluate(MESSEN)) {
      gemessen++;
      if (m.k < m.noetig)
        fehler.push(`${abend ? 'Abend' : 'Tag'} · ${wo} · .${m.klasse} „${m.text}" `
          + `${m.px} px${m.gross ? ' groß' : ''}: ${m.k}:1, nötig ${m.noetig}:1`);
      else if (m.k < m.noetig * 1.15) { knapp++;
        hinweise.push(`${abend ? 'Abend' : 'Tag'} · .${m.klasse} „${m.text}": ${m.k}:1 (knapp)`); }
    }
  };

  await schau('Profilwahl');
  await p.$eval('[data-profil="fiona"]', e => e.click());
  await p.waitForSelector('.schirm.da [data-ebene]'); await schau('Ebenenwahl');
  await p.$eval('[data-ebene="bundeslaender"]', e => e.click());
  await p.waitForSelector('.schirm.da .karte svg path.ziel'); await schau('Spiel');
  await ctx.close();
}
await b.close(); server.close();

console.log(`    ${gemessen} Texte gemessen, in Tag und Abend, gegen den Grund `
  + `auf dem sie wirklich stehen`);
if (hinweise.length)
  console.log(`    ${knapp} knapp über der Grenze:\n      ${hinweise.slice(0,4).join('\n      ')}`);
if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER: zu wenig Kontrast.`);
  fehler.forEach(f => console.log('    ✗ ' + f));
  process.exit(1);
}
console.log('\n  lesbarkeit grün: jeder Text erreicht seine WCAG-Grenze.');
