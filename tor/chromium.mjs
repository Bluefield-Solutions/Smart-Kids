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
export const WELT_VON = (ebene) => String(ebene).startsWith('rechnen') ? 'rechnen' : 'erdkunde';

/** Von der Weltenwahl in die Ebenenwahl der Welt, in der `ebene` liegt. */
export async function zurEbenenwahl(seite, ebene = 'kontinente') {
  await seite.waitForSelector('.schirm.da [data-welt]', { timeout: 15000 });
  await alleinIm(seite);
  await seite.click(`.schirm.da [data-welt="${WELT_VON(ebene)}"]`);
  await seite.waitForSelector('.schirm.da [data-ebene]', { timeout: 15000 });
  await alleinIm(seite);
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
