/* Audit-Werkzeug fuer das Forscherbuch: jede Kapitelseite, voller Stand,
   drei Groessen. Kein Tor - ein BLICKWERKZEUG (Regel 4). */
import fs from 'node:fs';
import path from 'node:path';
import { starte, serviere, stelleAblage } from '../tor/chromium.mjs';
import { sammelbar } from '../src/inhalt/tiere.js';
import { KONTINENTE, LAENDER } from '../src/inhalt/erdkunde.js';
import { STAEDTE } from '../src/geo/staedte.js';

/* Wohin die Bilder gehen. `blick/` ist der Ort fuer Blickwerkzeuge -
   kein Tor liest hier etwas, ein Mensch sieht es an (Regel 4). */
const AUS = process.env.LERNKISTE_BLICK || 'blick/buch-audit';
fs.mkdirSync(AUS, { recursive: true });
/* UEBER HTTP, nicht ueber file://.
   Der erste Anlauf las `dist/index.html` als Datei - dann schlaegt jedes
   Nachladen fehl (`daten/deutschland.json`), die Bundeslaender haben
   keine Umrisse, und das Buch zeigt sechzehnmal „undefined". Das sah aus
   wie ein Befund und war die Messstelle (Regel 5). */
const { server, adresse } = await serviere(path.join(process.cwd(), 'dist'));
const SPIEL = adresse;
const TIERE = sammelbar().map(t => t.id);

const GROESSEN = [
  { n: 'telefon', w: 844, h: 390 },   // das Zielgeraet
  { n: 'ipad',    w: 1180, h: 820 },
  { n: 'eng',     w: 667, h: 375 },   // die engste Groesse, die passt faehrt
];

const b = await starte();
const befunde = [];

for (const g of GROESSEN) {
  /* Die Groesse gehoert an den KONTEXT. `newPage({viewport})` nimmt sie
     nicht - die Angabe faellt still weg, und alle drei Laeufe messen
     1280 x 564. Genau so ist der erste Anlauf gescheitert: drei Zeilen
     mit derselben Zahl, die wie ein Befund aussahen. Eine Zahl ohne ihre
     Messstelle ist keine (Regel 5). */
  const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE',
    deviceScaleFactor: 2, viewport: { width: g.w, height: g.h } });
  const s = await ctx.newPage();
  await s.goto(SPIEL, { waitUntil: 'domcontentloaded' });
  await s.evaluate(async () => {
    for (const d of await indexedDB.databases()) indexedDB.deleteDatabase(d.name);
    localStorage.clear();
  });
  await s.goto(SPIEL, { waitUntil: 'domcontentloaded' });
  await s.waitForSelector('[data-profil="fiona"]');
  /* Den Stand ueber `stelleAblage` setzen und NICHT ueber eine eigene
     Fassung im Seitenkontext. `tor/ansicht.mjs` hat so eine eigene, und
     das Tor `doppelt` hat diese hier prompt dagegen gehalten - 193 Token
     zweimal. Der Kommentar an `stelleAblage` sagt, was das schon einmal
     gekostet hat: sieben von zwoelf Fassungen legten die Laeden nicht an
     und liefen nur, weil vorher jemand anders die Ablage gebaut hatte
     (Regel 6: was zweimal dasteht, veraltet einmal). */
  const voll = (l) => Object.fromEntries(l.map(x => [x,
    { fach: 4, hoechstes: 4, faellig: 0, richtig: 4, falsch: 0, zuletzt: 0 }]));
  const halb = (l) => Object.fromEntries(l.slice(0, Math.ceil(l.length / 2)).map(x => [x,
    { fach: 2, hoechstes: 2, faellig: 0, richtig: 2, falsch: 1, zuletzt: 0 }]));
  await stelleAblage(s, {
    fortschritt: {
      'fiona:kontinente':      voll(KONTINENTE.map(k => k.id)),
      'fiona:bundeslaender':   voll(STAEDTE.map(b => b.id)),
      'fiona:laender:europa':  halb(LAENDER.europa.map(x => x.a3)),
      'fiona:laender:afrika':  halb(LAENDER.afrika.map(x => x.a3)),
    },
    einstellungen: {
      'tiere:fiona': { ids: TIERE, gorilla: 3, szenen: {
        'In der Stadt': { stand: ['wal','taube','schmetterling','fuchs','ratte',
          'krabbe','katze','streifenhoernchen','igel'], zeit: 1 } } },
      alles: { vorlaufGezeigt: { 'fiona:kontinente': true,
        'fiona:bundeslaender': true, 'fiona:laender:europa': true,
        'fiona:laender:afrika': true } },
    } });
  await s.reload({ waitUntil: 'domcontentloaded' });
  await s.waitForSelector('[data-profil="fiona"]');
  await s.click('[data-profil="fiona"]');
  await s.waitForSelector('.schirm.da #buch');
  await s.click('.schirm.da #buch');
  await s.waitForSelector('.rollen.buch');
  await s.waitForTimeout(700);

  const kaps = await s.$$eval('.buchreiter [data-kap]',
    els => els.map(e => ({ id: e.dataset.kap, titel: e.querySelector('.was')?.textContent,
                           zahl: e.querySelector('.reiterzahl')?.textContent })));
  fs.writeFileSync(`${AUS}/kapitel.json`, JSON.stringify(kaps, null, 1));

  for (const k of kaps) {
    await s.click(`[data-kap="${k.id}"]`);
    await s.waitForTimeout(450);
    await s.screenshot({ path: `${AUS}/${g.n}-${k.id}.png` });
    // Messen, was das Auge nicht zaehlt
    const m = await s.evaluate(() => {
      const k = document.querySelector('.rollen.buch');
      const r = k.getBoundingClientRect();
      const kinder = [...k.children];
      const unten = kinder.length ? Math.max(...kinder.map(c => c.getBoundingClientRect().bottom)) : r.top;
      return { sichtbar: Math.round(r.height), inhalt: Math.round(k.scrollHeight),
               genutzt: Math.round((unten - r.top) / r.height * 100),
               rollt: k.scrollHeight > k.clientHeight + 1,
               kasten: Math.round(r.width) };
    });
    const echt = s.viewportSize();
    befunde.push({ groesse: `${g.n} ${echt.width}x${echt.height}`,
      kapitel: k.id, titel: k.titel, ...m });
  }
  await s.close(); await ctx.close();
}
await b.close(); server.close();
fs.writeFileSync(`${AUS}/mass.json`, JSON.stringify(befunde, null, 1));
console.log('Kapitel:', JSON.parse(fs.readFileSync(`${AUS}/kapitel.json`)).map(k=>`${k.titel} (${k.zahl})`).join(' · '));
console.log('');
for (const f of befunde)
  console.log(`  ${f.groesse.padEnd(20)} ${f.kapitel.padEnd(16)} Kasten ${String(f.kasten).padStart(4)}×${String(f.sichtbar).padStart(3)} · `
    + `Inhalt ${String(f.inhalt).padStart(4)} · genutzt ${String(f.genutzt).padStart(3)} %${f.rollt ? ' · ROLLT' : ''}`);
