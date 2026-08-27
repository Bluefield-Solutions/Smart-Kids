// Tor `passt`.
//
// Prueft auf SECHS Geraetegroessen, dass kein bedienbares Element ueber den
// Rand seines Behaelters oder des Fensters laeuft.
//
// Warum es das braucht: die App war auf dem ZIELGERAET kaputt, und drei
// andere Tore meldeten gruen. Auf dem iPhone quer lag die vierte Antwort
// 22 Bildpunkte unter dem sichtbaren Rand der Liste, und die Ebene
// "Landeshauptstaedte" war in der Ebenenwahl gar nicht erreichbar. Auf dem
// iPad war alles in Ordnung - deshalb ist es nie aufgefallen.
//
// Der Rauchtest hat es nicht gesehen, weil er die Etiketten ueber das DOM
// sucht und nicht ueber das, was zu sehen ist: ein Element in einem
// scrollenden Behaelter EXISTIERT, es ist nur nicht da. Und das Bildtor
// fotografiert bei 1240x1000, wo alles passt.
//
// `overflow:auto` ist dabei keine Entschuldigung. Ein Kind scrollt nicht in
// einer Liste, von der es nicht weiss, dass sie weitergeht - fuer das Kind
// hat die Aufgabe drei Antworten.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { starte } from './chromium.mjs';

const DIST = path.join(process.cwd(), 'dist');
const fehler = [];

/** Die Groessen, auf denen geurteilt wird. Nicht "ein paar Breiten". */
const GERAETE = [
  { n:'iPhone quer',      w:844,  h:390,  touch:true  },   // das Zielgeraet
  { n:'iPhone SE quer',   w:667,  h:375,  touch:true  },   // das kleinste
  { n:'iPhone hoch',      w:390,  h:844,  touch:true  },
  { n:'iPad quer',        w:1180, h:820,  touch:true  },
  { n:'iPad hoch',        w:820,  h:1180, touch:true  },
  { n:'Fenster schmal',   w:700,  h:850,  touch:false },   // Schreibtisch
];

/** Kleinste Kante einer Trefferflaeche, Apple HIG. */
const MIN_PT = 44;

/**
 * Findet Elemente, die abgeschnitten sind.
 *
 * Geprueft wird gegen JEDEN Vorfahren, der beschneidet - nicht nur gegen das
 * Fenster. Der erste Anlauf pruefte nur gegen das Fenster und meldete gruen,
 * waehrend "Rheinland-Pfalz" unter dem Rand seiner eigenen Liste lag.
 */
const SUCHE = () => {
  const raus = [], klein = [], zu = [];
  const bedienbar = '.schirm.da .kachel, .schirm.da .etikett, .schirm.da .knopf, '
    + '.schirm.da .mikro, .schirm.da .zi, .schirm.da .eingabe';
  for (const el of document.querySelectorAll(bedienbar)) {
    const eb = el.getBoundingClientRect();
    if (eb.width === 0 && eb.height === 0) continue;         // nicht sichtbar
    const text = el.textContent.trim().slice(0, 26).replace(/\s+/g, ' ') || el.className;

    let p = el.parentElement, ab = null;
    while (p && p !== document.body && !ab) {
      const cs = getComputedStyle(p);
      if (/hidden|clip|auto|scroll/.test(cs.overflowY + cs.overflowX)) {
        const pb = p.getBoundingClientRect();
        const fehlt = Math.max(eb.bottom - pb.bottom, pb.top - eb.top,
                               eb.right - pb.right, pb.left - eb.left);
        if (fehlt > 1) ab = { wo: '.' + (p.className.split(' ')[0] || p.tagName.toLowerCase()), fehlt };
      }
      p = p.parentElement;
    }
    if (!ab) {
      const fehlt = Math.max(eb.bottom - innerHeight, eb.right - innerWidth, -eb.top, -eb.left);
      if (fehlt > 1) ab = { wo: 'Fenster', fehlt };
    }
    if (ab) { raus.push(`„${text}" — ${ab.fehlt.toFixed(0)} px über den Rand von ${ab.wo}`); continue; }

    // Passt der TEXT in seinen Knopf?
    //
    // Der Kasten kann sitzen und der Inhalt trotzdem darueber hinausragen:
    // ein Flex-Kind ist von sich aus mindestens so breit wie sein laengstes
    // Wort. "Landeshauptstaedte" stand so quer ueber den Rand der eigenen
    // Kachel - und dieses Tor meldete gruen, weil es Kaesten mass und nicht
    // Inhalte. Gefunden hat es das Auge, nicht die Pruefung.
    const zuBreit = el.scrollWidth - el.clientWidth;
    const zuHoch  = el.scrollHeight - el.clientHeight;
    if (zuBreit > 1 || zuHoch > 1) {
      raus.push(`„${text}" — Text steht ${Math.max(zuBreit, zuHoch).toFixed(0)} px `
        + `über den Rand des eigenen Knopfes`);
      continue;
    }
    if (Math.min(eb.width, eb.height) < 44 - 0.5)
      klein.push(`„${text}" — ${Math.min(eb.width, eb.height).toFixed(0)} pt`);

    // VERDECKT: liegt in der Mitte des Knopfes wirklich der Knopf?
    //
    // Ein Element kann vollstaendig im Bild sein und trotzdem nicht
    // bedienbar, weil etwas anderes darueber liegt. Genau das passiert auf
    // dem iPhone quer: der Kasten der Ueberschrift reicht ueber die ganze
    // Breite und deckt "Forscherbuch" und "Eltern" zu. Sichtbar ist der
    // Text - der Finger trifft trotzdem die Ueberschrift.
    const cx = eb.left + eb.width / 2, cy = eb.top + eb.height / 2;
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
    const oben = document.elementFromPoint(cx, cy);
    if (oben && oben !== el && !el.contains(oben) && !oben.contains(el)) {
      const stoerer = oben.className && typeof oben.className === 'string'
        ? '.' + oben.className.split(' ')[0] : oben.tagName.toLowerCase();
      zu.push(`„${text}" — verdeckt von ${stoerer} „${oben.textContent.trim().slice(0,22)}"`);
    }
  }
  return { raus, klein, zu };
};

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

console.log('\n  Tor `passt`');
const b = await starte();
let gesehen = 0, zuKlein = 0;

for (const g of GERAETE) {
  const ctx = await b.newContext({ hasTouch: g.touch, isMobile: g.touch, locale: 'de-DE',
    viewport: { width: g.w, height: g.h }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(ADRESSE, { waitUntil: 'load' });
  await p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([document.fonts.load('700 20px "Plus Jakarta Sans"'),
                       document.fonts.load('400 20px "Andika"')]);
  });

  const meldungen = [];
  const schau = async (name) => {
    await p.waitForTimeout(450);   // der Bildschirmwechsel muss durch sein
    const r = await p.evaluate(SUCHE);
    gesehen++;
    zuKlein += r.klein.length;
    for (const x of r.raus) meldungen.push(`${name}: ${x}`);
    for (const x of r.zu) meldungen.push(`${name}: ${x}`);
    // Zu kleine Trefferflaechen sind ein Hinweis, kein Fehler: manche
    // Knoepfe sind bewusst schmal (der Zurueck-Pfeil ist 44 hoch, aber
    // nicht 44 breit - er ist trotzdem gut zu treffen).
    for (const x of r.klein) meldungen.push(`${name}: HINWEIS zu klein ${x}`);
  };

  // Geklickt wird ueber das DOM, nicht ueber den Zeiger: ein verdeckter
  // Knopf ist ein BEFUND, kein Grund zum Abbrechen. Sonst meldet das Tor
  // einen Zeitablauf statt zu sagen, was los ist.
  const tipp = async (sel) => p.$eval(sel, el => el.click());

  await schau('Profilwahl');
  await tipp('[data-profil="fiona"]');
  await p.waitForSelector('.schirm.da [data-ebene]');
  await schau('Ebenenwahl');

  for (const [ebene, warte] of [['bundeslaender', null], ['hauptstaedte', '#weiter']]) {
    await tipp(`[data-ebene="${ebene}"]`);
    if (warte) {
      await p.waitForSelector(`.schirm.da ${warte}, .schirm.da .karte svg path.ziel`);
      const w = await p.$(`.schirm.da ${warte}`);
      if (w) { await schau('Stadtstaaten-Einweisung'); await p.$eval('.schirm.da #weiter', el=>el.click()); }
    }
    await p.waitForSelector('.schirm.da .karte svg path.ziel');
    await schau(`Spiel ${ebene}`);
    await tipp('.schirm.da #zur');
    await p.waitForSelector('.schirm.da [data-ebene]');
  }

  await tipp('.schirm.da #buch');
  await p.waitForSelector('.schirm.da .aufkleber');
  await schau('Forscherbuch');
  await tipp('.schirm.da #zur');
  await p.waitForSelector('.schirm.da #eltern');
  await tipp('.schirm.da #eltern');
  await p.waitForSelector('.schirm.da .ziffern');
  await schau('Eltern-Tor');

  const echte = meldungen.filter(m => !m.includes('HINWEIS'));
  if (echte.length) {
    console.log(`    ROT   ${g.n.padEnd(16)} ${g.w}×${g.h} — ${echte.length} nicht erreichbar`);
    echte.forEach(m => console.log(`            ${m}`));
    fehler.push(...echte.map(m => `${g.n}: ${m}`));
  } else {
    console.log(`    grün  ${g.n.padEnd(16)} ${g.w}×${g.h}`);
  }
  await ctx.close();
}
await b.close(); server.close();

console.log(`    ${GERAETE.length} Größen × ${gesehen / GERAETE.length} Bildschirme geprüft`
  + (zuKlein ? `, ${zuKlein} Trefferflächen unter ${MIN_PT} pt (Hinweis)` : ''));

if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER: Elemente laufen über den Rand.`);
  console.log('  `overflow:auto` zählt nicht als Lösung — ein Kind scrollt nicht in einer');
  console.log('  Liste, von der es nicht weiß, dass sie weitergeht. Und ein verdeckter');
  console.log('  Knopf ist sichtbar und trotzdem nicht zu treffen.');
  process.exit(1);
}
console.log('\n  passt grün: auf allen sechs Größen ist alles im Bild.');
