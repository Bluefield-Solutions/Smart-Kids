// Tor `ansicht` - visuelles Regressionstor.
//
// Kein Tor kann sagen, ob etwas schoen ist. Aber jedes Tor kann sagen, ob
// sich etwas VERAENDERT hat - und das ist bei Gestaltung fast dasselbe wert,
// weil Verfall dort schleichend passiert.
//
// Aufruf:
//   node tor/ansicht.mjs                  pruefen
//   node tor/ansicht.mjs --aktualisieren  Vorbilder erneuern (bewusst!)
//
// EHRLICH DAZU: Die Vorbilder entstehen in Chromium. Das Tor findet
// VERAENDERUNGEN, nicht iOS-Richtigkeit. Kein Tor laeuft je auf dem Geraet,
// auf dem geurteilt wird.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import http from 'node:http';
import { starte } from './chromium.mjs';

// IndexedDB braucht eine echte Herkunft, sonst faellt die Ablage still auf
// nichts zurueck und der Prototyp startet jedesmal anders. Also derselbe
// winzige Server wie im Rauchtest.
// Fotografiert wird dist/ - das, was ausgeliefert wird, samt eigener
// Schrift. Solange die Aufnahmen an prototyp/spiel.html hingen, hielten sie
// eine Fassung fest, die niemand bekommt.
const wurzel = path.join(process.cwd(), 'dist');
const server = http.createServer((q, a) => {
  const f = path.join(wurzel, q.url === '/' ? '/index.html' : q.url.split('?')[0]);
  if (!f.startsWith(wurzel) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
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
const SPIEL = `http://127.0.0.1:${server.address().port}/`;

// Dieses Tor laeuft NUR ORTSFEST, nicht auf dem Runner.
//
// Ein Bildpunktvergleich gilt nur bei gleicher Zeichenumgebung. Der Runner
// hat einen anderen Chromium-Bau, andere Ersatzschriften und andere
// Kantenglaettung; beim ersten Lauf dort waren alle sieben Aufnahmen rot,
// zwei davon mit GEAENDERTEN MASSEN - also anderem Umbruch, nicht nur
// anderen Bildpunkten. Das ist kein Befund ueber die App, sondern einer
// ueber die Maschine.
//
// Es wird ausdruecklich uebersprungen und laut gemeldet, nicht still: ein
// Tor, das sich unbemerkt ueberspringt, ist schlimmer als keines. Wer die
// Aufnahmen auf dem Runner haben will, muss die Umgebung festnageln - im
// Playwright-Abbild bauen UND die Vorbilder darin aufnehmen. Steht als
// offener Punkt im STAND.
if (process.env.SMARTKIDS_OHNE_ANSICHT === '1') {
  console.log('\n  Tor `ansicht`: ÜBERSPRUNGEN.');
  console.log('    Grund: Bildpunktvergleiche gelten nur bei gleicher Zeichenumgebung.');
  console.log('    Der Runner hat einen anderen Chromium-Bau und andere Ersatzschriften.');
  console.log('    Dieses Tor gehört an den Arbeitsplatz: `npm run ansicht`.');
  process.exit(0);
}

const VORBILDER = path.join(process.cwd(), 'tor/vorbilder');
const ABWEICHUNGEN = path.join(process.cwd(), 'tor/abweichungen');
const AKTUALISIEREN = process.argv.includes('--aktualisieren');

/** Was aufgenommen wird. Jede Aufnahme ist EINE Zeile hier. */
const AUFNAHMEN = [
  { name:'mg-fiona-kontinente', seite:'entwuerfe/mg.html', wahl:'#schirm1 .geraet' },
  { name:'mg-lea-deutschland',  seite:'entwuerfe/mg.html', wahl:'#schirm2 .geraet' },
  { name:'mg-belohnung',        seite:'entwuerfe/mg.html', wahl:'#schirm3 .geraet' },
  { name:'mg-farbstreifen',     seite:'entwuerfe/mg.html', wahl:'#s-ok' },
  { name:'karte-deutschland',   seite:'entwuerfe/mg.html', wahl:'#schirm2 .geraet svg' },
  // Der LEBENDE Prototyp, nicht der Entwurf.
  //
  // Bis hierher fotografierte das Tor nur `entwuerfe/mg.html` - gemalte
  // Bildschirme. Die Hervorhebung des Ziels (Rand, Puls, Zeiger, gedaempfte
  // Nachbarn) steckt aber in `prototyp/spiel.js`, und die hat damit KEIN Tor
  // gesehen: der Lauf blieb gruen, waehrend sich jeder Spielbildschirm
  // aenderte. Genau die Luecke, vor der Regel 8 warnt.
  { name:'spiel-kontinent',  spiel:'kontinente',    wahl:'.schirm.da' },
  { name:'spiel-bundesland', spiel:'bundeslaender', wahl:'.schirm.da' },
  // Zwei Zustaende, die nur der Blick beurteilen kann - und in beiden
  // steckte ein Fehler, den kein Tor gemeldet hat.
  //
  // `spiel-zug`: waehrend des Ziehens. Das Tor `ziehen` prueft, DASS das
  // Ziel aufleuchtet - es kann nicht sehen, dass das gezogene Etikett
  // genau dieses Ziel zudeckte. 240 x 160 Punkte Kachel ueber 60 x 50
  // Punkten Australien: gemessen gruen, in Wirklichkeit blind.
  //
  // `spiel-lob`: nach der richtigen Antwort. Der Lobsatz und der Name
  // stehen dort untereinander; ob sie passen, sagt kein Zahlenwert.
  { name:'spiel-zug', spiel:'kontinente', wahl:'.schirm.da', tun:'ziehen' },
  { name:'spiel-lob', spiel:'kontinente', wahl:'.schirm.da', tun:'loesen' },
];

/**
 * Bringt den Spielbildschirm in einen Zustand, den es sonst nur mit dem
 * Finger gibt. Gibt die Stelle zurueck, an der der Zeiger stehenbleiben
 * soll - beim Ziehen bleibt die Maus unten, sonst waere kein Zug zu sehen.
 */
async function vorfuehren(seite, was) {
  const i = await seite.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const z = s.querySelector('path.ziel');
    const svg = s.querySelector('.karte svg');
    const D = JSON.parse(document.getElementById('daten').textContent);
    const g = D.kontinente.find(x => x.id === z.dataset.id);
    const pt = svg.createSVGPoint(); pt.x = g.anker[0]; pt.y = g.anker[1];
    const q = pt.matrixTransform(svg.getScreenCTM());
    const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent);
    return { x:q.x, y:q.y, idx:namen.indexOf(g.name) };
  });
  const et = (await seite.$$('.schirm.da .etikett'))[i.idx];
  const a = await et.boundingBox();
  await seite.mouse.move(a.x + a.width/2, a.y + a.height/2);
  await seite.mouse.down();
  // 22 Punkte daneben: mitten in der Nachsicht. Genau der Fall, den ein
  // Kind trifft - und der Fall, in dem die Anzeige gebraucht wird.
  await seite.mouse.move(i.x - 22, i.y + 22, { steps: 12 });
  await seite.waitForTimeout(160);
  if (was === 'ziehen') return;
  await seite.mouse.up();
  await seite.waitForFunction(() => !!document.querySelector('.schirm.da .frage .richtigText'),
    null, { timeout: 4000 });
  await seite.waitForTimeout(600);
}

/** Zulaessige Abweichung: eine Handvoll Bildpunkte fuer Kantenglaettung. */
const GRENZE_ANTEIL = 0.0008;   // 0,08 % der Bildpunkte
const GRENZE_KANAL  = 12;       // ab hier gilt ein Bildpunkt als anders

function vergleiche(a, b) {
  if (a.width !== b.width || a.height !== b.height)
    return { masse: true, anders: Infinity, anteil: 1 };
  let anders = 0;
  const diff = new PNG({ width:a.width, height:a.height });
  for (let i = 0; i < a.data.length; i += 4) {
    const d = Math.max(Math.abs(a.data[i]-b.data[i]),
                       Math.abs(a.data[i+1]-b.data[i+1]),
                       Math.abs(a.data[i+2]-b.data[i+2]));
    if (d > GRENZE_KANAL) {
      anders++;
      diff.data[i]=255; diff.data[i+1]=0; diff.data[i+2]=0; diff.data[i+3]=255;
    } else {
      const g = 230 + (a.data[i]>>4);
      diff.data[i]=g; diff.data[i+1]=g; diff.data[i+2]=g; diff.data[i+3]=255;
    }
  }
  return { masse:false, anders, anteil: anders/(a.width*a.height), diff };
}

const browser = await starte();
// Determinismus: feste Punktdichte, feste Groesse, Bewegung aus, Datum fest.
const seite = await browser.newPage({
  viewport:{ width:1240, height:1000 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
  colorScheme: 'light',
  locale: 'de-DE',
  timezoneId: 'Europe/Berlin',
});
await seite.addInitScript(() => { Math.random = () => 0.42; });

fs.mkdirSync(VORBILDER, { recursive:true });
fs.mkdirSync(ABWEICHUNGEN, { recursive:true });

let rot = 0, neu = 0, gruen = 0;
let letzteSeite = null;
for (const a of AUFNAHMEN) {
  if (a.spiel) {
    // Frische Ablage je Aufnahme: der Keim kommt aus dem gespeicherten
    // Sitzungszaehler, ein Rest von vorher wuerde eine andere Aufgabe
    // ziehen und das Vorbild bei jedem Lauf verschieben.
    await seite.goto(SPIEL, { waitUntil:'domcontentloaded' });
    await seite.evaluate(async () => {
      for (const d of await indexedDB.databases()) indexedDB.deleteDatabase(d.name);
      localStorage.clear();
    });
    await seite.goto(SPIEL, { waitUntil:'domcontentloaded' });
    await seite.waitForSelector('[data-profil="fiona"]');
    // Ohne diese Pruefung haelt das Vorbild irgendwann die Systemschrift
    // fest, und niemand merkt es - genau so ist die erste Fassung dieser
    // Aufnahmen entstanden. Sie steht NACH dem ersten Bildschirm, weil eine
    // Schrift erst geladen wird, wenn wirklich Text mit ihr gesetzt wird.
    const daSchrift = await seite.evaluate(async () => {
      await document.fonts.ready;
      // load() statt nur check(): eine Schrift wird erst geholt, wenn Text
      // mit ihr gesetzt wird. Andika steht auf dem ersten Bildschirm nicht,
      // also meldete check() sie als fehlend, obwohl sie nur ungefragt war.
      await Promise.all([document.fonts.load('700 20px "Plus Jakarta Sans"'),
                         document.fonts.load('400 20px "Andika"')]);
      return document.fonts.check('700 20px "Plus Jakarta Sans"')
          && document.fonts.check('400 20px "Andika"');
    });
    if (!daSchrift) { console.log(`  FEHLT   ${a.name}  (die eigene Schrift wurde nicht geladen)`); rot++; continue; }
    await seite.click('[data-profil="fiona"]');
    await seite.waitForSelector('.schirm.da [data-ebene]');
    await seite.click(`[data-ebene="${a.spiel}"]`);
    await seite.waitForSelector('.schirm.da .karte svg path.ziel');
    if (a.tun) await vorfuehren(seite, a.tun);
    letzteSeite = null;
  } else if (letzteSeite !== a.seite) {
    await seite.goto('file://' + path.join(process.cwd(), a.seite), { waitUntil:'networkidle' });
    await seite.evaluate(() => document.fonts.ready);   // sonst wandert der Text
    letzteSeite = a.seite;
  }
  const el = await seite.$(a.wahl);
  if (!el) { console.log(`  FEHLT   ${a.name}  (${a.wahl} nicht gefunden)`); rot++; continue; }
  // `animations: 'disabled'` haelt laufende Animationen an und spult sie ans
  // Ende. Ohne das bleibt eine ENDLOSE Animation - der atmende Ring am
  // Mikrofonknopf - auch bei 1 ms Dauer irgendwo stehen, und das Tor meldet
  // bei jedem Lauf einen anderen Unterschied. Das Tor war nicht
  // deterministisch; gefunden hat es sich selbst.
  const jetzt = await el.screenshot({ animations: 'disabled' });
  const ziel = path.join(VORBILDER, a.name + '.png');

  if (AKTUALISIEREN || !fs.existsSync(ziel)) {
    fs.writeFileSync(ziel, jetzt);
    console.log(`  ${fs.existsSync(ziel)&&!AKTUALISIEREN?'NEU    ':'ERNEUERT'} ${a.name}`);
    neu++; continue;
  }
  const v = vergleiche(PNG.sync.read(fs.readFileSync(ziel)), PNG.sync.read(jetzt));
  if (v.masse) {
    console.log(`  ROT     ${a.name}  — Maße geändert`); rot++;
  } else if (v.anteil > GRENZE_ANTEIL) {
    fs.writeFileSync(path.join(ABWEICHUNGEN, a.name + '.png'), PNG.sync.write(v.diff));
    fs.writeFileSync(path.join(ABWEICHUNGEN, a.name + '.jetzt.png'), jetzt);
    console.log(`  ROT     ${a.name}  — ${v.anders} Bildpunkte anders `
      + `(${(v.anteil*100).toFixed(3)} %, erlaubt ${(GRENZE_ANTEIL*100).toFixed(3)} %)`);
    rot++;
  } else {
    console.log(`  grün    ${a.name}  — ${v.anders} Bildpunkte anders (${(v.anteil*100).toFixed(4)} %)`);
    gruen++;
  }
}
await browser.close();
server.close();

console.log(`\n  ${gruen} grün, ${neu} neu, ${rot} rot`);
if (rot) {
  console.log('\n  Die Unterschiede liegen in tor/abweichungen/ — rot markiert, was sich');
  console.log('  geändert hat. War die Änderung Absicht, dann:');
  console.log('      node tor/ansicht.mjs --aktualisieren');
  console.log('  und die neuen Vorbilder im SELBEN Commit einchecken. Dann steht die');
  console.log('  Veränderung im Diff und ist zu sehen.');
  process.exit(1);
}
