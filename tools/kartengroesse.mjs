/* Wie gross steht der GESPIELTE Teil einer Karte auf dem Schirm?
 *
 * Der Rahmen (B20) ist in Kartenkoordinaten gemessen - und das ist nicht
 * die Messstelle, an der es zaehlt (Regel 5). Auf dem Schirm entscheidet
 * die kurze Seite: eine Karte, die schon an der Hoehe haengt, wird durch
 * einen schmaleren Rahmen nicht groesser, nur der Kasten wird schmaler.
 *
 * Gemessen wird deshalb hier: die Flaeche, die die gespielten Umrisse in
 * Bildschirmpunkten einnehmen, auf dem Zielgeraet (844 x 390).
 *
 * WAS DIE MESSUNG BEI B20 ERGEBEN HAT, und warum es dieses Werkzeug
 * ueberhaupt gibt. In Kartenkoordinaten gewann der Rahmen viel: der
 * gespielte Anteil stieg von 49-97 % auf 76-97 %. Auf dem Schirm ist
 * davon nur ein Teil angekommen, weil dort in aller Regel die HOEHE
 * begrenzt - der Kasten ist auf jeder Karte 276 Punkte hoch:
 *
 *     Suedosteuropa 29808 → 42066 pt²  (+41 %)
 *     Mittelamerika 60152 → 78824 pt²  (+31 %)
 *     Nordamerika   44571 → 47730 pt²  (+7 %)
 *     Europa        45489 → 45924 pt²  (+1 %)
 *     Afrika · Asien · Suedamerika · Australien: unveraendert
 *
 * Gewonnen hat stattdessen die BREITE - und zwar nicht die der Karte,
 * sondern die des Schirms daneben. Der Kartenkasten ist schmaler
 * geworden, weil er dem Seitenverhaeltnis des Rahmens folgt:
 *
 *     Nordamerika   347 → 226 pt   Europa        334 → 288 pt
 *     Mittelamerika 412 → 384 pt   Australien    383 → 356 pt
 *
 * Bei Nordamerika sind das 121 Punkte, die vorher leerer Kasten waren
 * und jetzt der Antwortseite gehoeren. Das ist der wirkliche Gewinn, und
 * er stand in keiner der Zahlen, mit denen die Zugabe abgeleitet wurde.
 * Eine Zahl ohne ihre Messstelle haette hier „Europa wird ein Drittel
 * groesser" behauptet (Regel 5).
 */
import { starte, serviere, zurEbenenwahl, zurAufgabe } from '../tor/chromium.mjs';

const EBENEN = ['laender:europa', 'laender:afrika', 'laender:asien',
                'laender:nordamerika', 'laender:mittelamerika',
                'laender:suedamerika', 'laender:suedosteuropa', 'laender:australien'];

const browser = await starte();
const { server, adresse } = await serviere(new URL('../dist', import.meta.url).pathname);
for (const ebene of EBENEN) {
  const p = await browser.newPage({ viewport: { width: 844, height: 390 },
    deviceScaleFactor: 1, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  try {
    await p.goto(`${adresse}/index.html?flott`, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-profil="stephan"]');
    await p.click('[data-profil="stephan"]');
    await p.waitForSelector('.schirm.da [data-welt]');
    await zurEbenenwahl(p, ebene);
    await zurAufgabe(p, ebene);
    const m = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const pfade = [...s.querySelectorAll('.karte svg path.geb')];
      if (!pfade.length) return null;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const q of pfade) {
        const k = q.getBoundingClientRect();
        if (k.width < 0.5 || k.height < 0.5) continue;
        x0 = Math.min(x0, k.left); y0 = Math.min(y0, k.top);
        x1 = Math.max(x1, k.right); y1 = Math.max(y1, k.bottom);
      }
      const sv = s.querySelector('.karte svg').getBoundingClientRect();
      return { b: Math.round(x1 - x0), h: Math.round(y1 - y0), n: pfade.length,
               kb: Math.round(sv.width), kh: Math.round(sv.height) };
    });
    console.log(`${ebene.replace('laender:', '').padEnd(15)} `
      + (m ? `gespielt ${String(m.b).padStart(3)} x ${String(m.h).padStart(3)} pt `
           + `= ${String(m.b * m.h).padStart(6)} pt²   (Kasten ${m.kb} x ${m.kh}, ${m.n} Umrisse)`
         : '(keine Karte)'));
  } catch (e) { console.log(`${ebene.padEnd(20)} FEHLER ${e.message.split('\n')[0]}`); }
  await p.close();
}
await browser.close(); server.close();
