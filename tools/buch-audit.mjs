/* Audit-Werkzeug fuer das Forscherbuch: jede Kapitelseite, voller Stand,
   drei Groessen. Kein Tor - ein BLICKWERKZEUG (Regel 4). */
import fs from 'node:fs';
import { oeffneBuch, AUS } from './buch-oeffnen.mjs';

const GROESSEN = [
  { n: 'telefon', w: 844, h: 390 },   // das Zielgeraet
  { n: 'ipad',    w: 1180, h: 820 },
  { n: 'eng',     w: 667, h: 375 },   // die engste Groesse, die passt faehrt
];

const befunde = [];

for (const g of GROESSEN) {
  const { b, s, server } = await oeffneBuch({ breite: g.w, hoehe: g.h });
  /* Der Helfer gibt nur die Kennungen; hier werden Titel und Zahl
     mitgelesen, weil der Bericht sie nennt. */
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
  await b.close(); server.close();
}
fs.writeFileSync(`${AUS}/mass.json`, JSON.stringify(befunde, null, 1));
console.log('Kapitel:', JSON.parse(fs.readFileSync(`${AUS}/kapitel.json`)).map(k=>`${k.titel} (${k.zahl})`).join(' · '));
console.log('');
for (const f of befunde)
  console.log(`  ${f.groesse.padEnd(20)} ${f.kapitel.padEnd(16)} Kasten ${String(f.kasten).padStart(4)}×${String(f.sichtbar).padStart(3)} · `
    + `Inhalt ${String(f.inhalt).padStart(4)} · genutzt ${String(f.genutzt).padStart(3)} %${f.rollt ? ' · ROLLT' : ''}`);
