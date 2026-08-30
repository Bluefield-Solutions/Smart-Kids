// Der Browser wird NICHT heruntergeladen, sondern der vorhandene benutzt.
// Playwright erwartet eine bestimmte Bauzahl; die des Bildes weicht ab.
// Ein Tor, das sich beim Fehlen des Werkzeugs still ueberspringt, ist
// schlimmer als keines - deshalb bricht das hier ab statt gruen zu melden.
import fs from 'node:fs';
import { chromium } from 'playwright';

const KANDIDATEN = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
];
export function chromiumPfad() {
  return KANDIDATEN.find(x => fs.existsSync(x)) || null;
}
export async function starte(opt = {}) {
  // Hier im Bild liegt ein fertiger Chromium an bekannter Stelle, dessen
  // Bauzahl aber nicht die ist, die Playwright erwartet - deshalb der
  // ausdrueckliche Pfad. Auf dem Runner gibt es ihn nicht; dort loest
  // Playwright selbst auf (`npx playwright install chromium` im Ablauf).
  //
  // Was NICHT passiert: sich still ueberspringen. Findet weder das eine
  // noch das andere einen Browser, bricht das Tor ab. Ein Tor, das bei
  // fehlendem Werkzeug gruen meldet, ist schlimmer als keines.
  const pfad = chromiumPfad();
  try {
    return await chromium.launch(pfad ? { executablePath: pfad, ...opt } : opt);
  } catch (e) {
    throw new Error('Kein Chromium gefunden — das Tor kann nicht laufen. '
      + `Auf einem Runner hilft \`npx playwright install --with-deps chromium\`. (${e.message})`);
  }
}

/* Der kleine Server, der `dist/` ausliefert.
 *
 * Stand SECHSMAL im Verzeichnis - in jedem Tor, das einen Browser
 * startet, Zeile fuer Zeile dieselbe. Und er hatte sechsmal denselben
 * Fehler: `q.url === '/' ? '/index.html' : q.url.split('?')[0]` liefert
 * fuer `/?flott` den Pfad `/` - ein Verzeichnis, also 404. Aufgefallen
 * ist das erst, als die Adresse zum ersten Mal eine Frage trug.
 *
 * Erst zerlegen, DANN auf `/` pruefen. Und einmal, nicht sechsmal.
 */
export async function serviere(wurzel, erreichbar = () => true) {
  const { default: fs2 } = await import('node:fs');
  const { default: path2 } = await import('node:path');
  const { default: http2 } = await import('node:http');
  const TYP = { '.html':'text/html; charset=utf-8', '.css':'text/css',
    '.js':'text/javascript', '.png':'image/png', '.woff2':'font/woff2',
    '.json':'application/json', '.webmanifest':'application/manifest+json' };
  const server = http2.createServer((q, a) => {
    /* Das Netz kann weg sein.
     *
     * `erreichbar()` ist kein Beiwerk: das Tor `offline` prueft, ob die
     * App aus ihrem Lager startet, und dafuer muss die Leitung wirklich
     * abreissen - eine 404 waere eine ANTWORT, und der Service Worker
     * verhaelt sich dann anders. Beim Zusammenlegen der sechs Server ist
     * genau diese Zeile fast verlorengegangen; `offline` wurde rot und
     * hat es gemeldet. */
    if (!erreichbar()) { q.socket.destroy(); return; }
    const ohneFrage = String(q.url).split('?')[0];
    const datei = path2.join(wurzel, ohneFrage === '/' ? '/index.html' : ohneFrage);
    if (!datei.startsWith(wurzel) || !fs2.existsSync(datei) || fs2.statSync(datei).isDirectory()) {
      a.statusCode = 404; return a.end();
    }
    a.setHeader('content-type', TYP[path2.extname(datei)] || 'text/plain');
    a.end(fs2.readFileSync(datei));
  });
  await new Promise(r => server.listen(0, r));
  return { server, adresse: `http://127.0.0.1:${server.address().port}/` };
}

/* Der Weg zur Ebenenwahl — seit D4 fuehrt er ueber die Weltenwahl.
 *
 * Sechs Tore klicken sich nach der Profilwahl in eine Ebene. Stuende der
 * neue Zwischenschritt in jedem einzeln, waere er sechsmal aufgeschrieben
 * und beim naechsten Umbau fuenfmal gepflegt. Deshalb hier, einmal.
 *
 * Die Zuordnung Ebene -> Welt steht in `spiel.js` an `art`; hier wird sie
 * an der KENNUNG abgelesen. Das ist dieselbe Auskunft an zwei Orten und
 * damit die Sorte Doppelung, die dieses Verzeichnis fuerchtet - aber ein
 * Tor, das die Antwort aus dem Prueflig holt, prueft sie nicht mehr. Der
 * Rauchtest sieht deshalb zusaetzlich nach, dass keine Kachel in der
 * falschen Welt steht und dass es beide Welten gibt.
 */
export const WELT_VON = (ebene) => String(ebene).startsWith('rechnen') ? 'rechnen'
                                : String(ebene).startsWith('schreiben') ? 'schreiben' : 'erdkunde';

/** Von der Weltenwahl in die Ebenenwahl der Welt, in der `ebene` liegt. */
export async function zurEbenenwahl(seite, ebene = 'kontinente') {
  await seite.waitForSelector('.schirm.da [data-welt]', { timeout: 15000 });
  await alleinIm(seite);
  await seite.click(`.schirm.da [data-welt="${WELT_VON(ebene)}"]`);
  await seite.waitForSelector('.schirm.da [data-ebene]', { timeout: 15000 });
  await alleinIm(seite);
}

/* Von der Ebenenwahl in die AUFGABE — seit R3 fuehrt er ueber den Vorlauf.
 *
 * Dieselbe Geschichte wie bei `zurEbenenwahl`: ein neuer Zwischenschritt,
 * und fuenf Tore klicken sich daran vorbei. Stuende er in jedem einzeln,
 * waere er fuenfmal aufgeschrieben und beim naechsten Umbau viermal
 * gepflegt.
 *
 * Der Vorlauf erscheint beim ERSTEN Betreten einer Ebene je Kind. Ein Tor
 * faengt fast immer frisch an, sieht ihn also - aber eben nicht immer
 * (der Rauchtest spielt eine Ebene mehrfach). Deshalb wird nachgesehen und
 * nicht angenommen.
 */
export async function durchVorlauf(seite) {
  const los = await seite.$('.schirm.da #los');
  if (!los) return false;
  await seite.$eval('.schirm.da #los', x => x.click());
  await alleinIm(seite);
  return true;
}

/** Eine Ebene oeffnen und bis zur ersten Aufgabe durchgehen. */
export async function zurAufgabe(seite, ebene) {
  await seite.$eval(`.schirm.da [data-ebene="${ebene}"]`, x => x.click());
  // Der Vorlauf braucht einen Augenblick: er laedt die Karte nach.
  await seite.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel, '
    + '.schirm.da .rechnung', { timeout: 20000 });
  await durchVorlauf(seite);
  await seite.waitForSelector(String(ebene).startsWith('rechnen')
    ? '.schirm.da .rechnung' : '.schirm.da .karte svg path.ziel', { timeout: 20000 });
}

/* Warten, bis der VORIGE Bildschirm weg ist.
 *
 * `zeige()` blendet ueber: der alte Bildschirm bleibt rund 340 ms liegen
 * und faengt Tipper ab. Der erste Anlauf klickte deshalb auf die
 * Weltenkarte und traf die Profilkachel darueber - Playwright meldete
 * „subtree intercepts pointer events", und vier Antwortwege fehlten.
 *
 * Nicht mit einer festen Wartezeit geloest, sondern an der Sache: es ist
 * erst einer da. Eine Zahl waere auf einem langsameren Rechner zu kurz
 * und hier zu lang.
 */
async function alleinIm(seite) {
  await seite.waitForFunction(() => document.querySelectorAll('.schirm').length === 1,
    null, { timeout: 5000 }).catch(() => {});
}

/* ---- Schreiben (N2a) ---------------------------------------------------
 *
 * Zwei Tore und ein Blickwerkzeug muessen einen Zug mit dem Zeiger
 * nachfahren. Der Weg dorthin ist derselbe wie beim Ziehen auf der Karte:
 * die Punkte stehen in KASTENPUNKTEN (0..100), und die Abbildung auf den
 * Bildschirm macht `getScreenCTM` - dieselbe Matrix, die die App benutzt.
 * Wer stattdessen den Rahmen des Feldes gegen 100 rechnet, setzt voraus,
 * dass es quadratisch IST; das war es einmal nicht, und der Zeiger landete
 * lautlos daneben.
 */
export const schreibVorlage = (seite) =>
  seite.$$eval('.schirm.da #vorlage path', p => p.map(x => x.getAttribute('d')));

export async function zeichneZug(seite, punkte) {
  const auf = await seite.evaluate((pts) => {
    const svg = document.querySelector('.schirm.da .schreibblatt');
    if (!svg) return null;
    const m = svg.getScreenCTM();
    return pts.map(([x, y]) => {
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(m); return [q.x, q.y];
    });
  }, punkte);
  if (!auf) throw new Error('zeichneZug: kein Schreibfeld auf dem Bildschirm');
  await seite.mouse.move(...auf[0]);
  await seite.mouse.down();
  for (const b of auf.slice(1)) await seite.mouse.move(...b);
  await seite.mouse.up();
}
