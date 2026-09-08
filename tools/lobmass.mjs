/* Wegwerf-Messung: was kostet die Figur die Lobzeile - und die Karte?
   Gemessen an der GEBAUTEN Datei, im Zielformat 844 x 390.
   Nicht Teil der Kette; laeuft von Hand. */
import { starte, serviere, inEbene, zeigeAufKarte } from '../tor/chromium.mjs';

const b = await starte();
const { server, adresse } = await serviere('dist');
const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
const p = await ctx.newPage();
const GROESSE = JSON.parse(process.argv[2] || '{"width":844,"height":390}');
await p.setViewportSize(GROESSE);
await p.goto(adresse, { waitUntil: 'domcontentloaded' });
await inEbene(p, 'fiona', 'kontinente');
await p.waitForSelector('.schirm.da .karte svg');

const huelle = () => p.evaluate(() => {
  const k = document.querySelector('.schirm.da .karte svg');
  let y0 = 1e9, y1 = -1e9;
  for (const g of k.querySelectorAll('path.geb')) {
    const q = g.getBoundingClientRect();
    if (q.width < 1) continue;
    y0 = Math.min(y0, q.top); y1 = Math.max(y1, q.bottom);
  }
  const f = document.querySelector('.schirm.da #frage');
  return { oben: Math.round(y0), hoch: Math.round(y1 - y0),
           frage: Math.round(f.getBoundingClientRect().height) };
});
console.log(GROESSE.width + 'x' + GROESSE.height);
console.log('vor dem Lob   ', await huelle());
/* Das Lob wird DIREKT gesetzt: `zeigeAufKarte` taugt nur fuer die
   Frage „Wo liegt X?", und gemessen werden soll die ZEILE, nicht der
   Weg dorthin. Aufgerufen wird dieselbe Funktion, die das Spiel
   aufruft - kein nachgebautes Markup. */
await p.evaluate(() => lobsatz(document.querySelector('.schirm.da'),
  'Das ist Australien.', null, 'Klasse!',
  'Australien ist der einzige Erdteil, der zugleich ein Land ist.', false));
await p.evaluate(() => new Promise(f => requestAnimationFrame(() => requestAnimationFrame(f))));
console.log('Lob mit Figur ', await huelle());
await p.evaluate(() => document.querySelectorAll('.schirm.da .frage .figur')
  .forEach(x => x.remove()));
await p.evaluate(() => new Promise(f => requestAnimationFrame(() => requestAnimationFrame(f))));
console.log('Lob ohne Figur', await huelle());
console.log('Markup:', await p.evaluate(() =>
  document.querySelector('.schirm.da #frage').innerHTML.slice(0, 300)));

await ctx.close(); await b.close();
await new Promise(r => server.close(r));
