/* Die Anfahrt zum Forscherbuch — einmal, fuer alle Blickwerkzeuge.
 *
 * Sie stand in `buch-audit` und `buch-feinmass` zweimal, und `doppelt`
 * hat es beim ersten Lauf gefangen: 420 Token. Was hier steht, ist
 * WISSEN und nicht Bequemlichkeit - dass die Ablage ueber
 * `stelleAblage` gestellt wird, dass es HTTP sein muss (unter `file://`
 * schlaegt jedes Nachladen fehl) und welcher Stand „voll" heisst.
 * Dreimal dasselbe zu wissen heisst, es zweimal falsch zu haben
 * (Regel 6: was zweimal dasteht, veraltet einmal).
 */
import fs from 'node:fs';
import path from 'node:path';
import { starte, serviere, stelleAblage } from '../tor/chromium.mjs';
import { sammelbar } from '../src/inhalt/tiere.js';
import { KONTINENTE, LAENDER } from '../src/inhalt/erdkunde.js';
import { STAEDTE } from '../src/geo/staedte.js';

/** Wohin die Bilder gehen. `blick/` ist der Ort fuer Blickwerkzeuge -
    kein Tor liest hier etwas, ein Mensch sieht es an (Regel 4). */
export const AUS = process.env.LERNKISTE_BLICK || 'blick/buch-audit';
fs.mkdirSync(AUS, { recursive: true });

/** Der Stand, den ein Kind nach ein paar Wochen hat - nicht der leere.
 *  Ein halber Stand zeigt einen Grundriss, den es dann nicht mehr gibt. */
const voll = (l) => Object.fromEntries(l.map(x => [x,
  { fach: 4, hoechstes: 4, faellig: 0, richtig: 4, falsch: 0, zuletzt: 0 }]));
const halb = (l) => Object.fromEntries(l.slice(0, Math.ceil(l.length / 2)).map(x => [x,
  { fach: 2, hoechstes: 2, faellig: 0, richtig: 2, falsch: 1, zuletzt: 0 }]));

/**
 * Browser starten, Server starten, Stand setzen, Buch aufschlagen.
 *
 * @param {{breite:number,hoehe:number,szenen?:object}} wie
 * @returns {Promise<{b,ctx,s,server,kapitel:string[]}>}
 */
export async function oeffneBuch({ breite = 844, hoehe = 390, szenen = {} } = {}) {
  const { server, adresse } = await serviere(path.join(process.cwd(), 'dist'));
  const b = await starte();
  const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE',
    deviceScaleFactor: 2, viewport: { width: breite, height: hoehe } });
  const s = await ctx.newPage();
  await s.goto(adresse, { waitUntil: 'domcontentloaded' });
  await s.evaluate(async () => {
    for (const d of await indexedDB.databases()) indexedDB.deleteDatabase(d.name);
    localStorage.clear();
  });
  await s.goto(adresse, { waitUntil: 'domcontentloaded' });
  await s.waitForSelector('[data-profil="fiona"]');
  await stelleAblage(s, {
    fortschritt: {
      'fiona:kontinente':     voll(KONTINENTE.map(k => k.id)),
      'fiona:bundeslaender':  voll(STAEDTE.map(x => x.id)),
      'fiona:laender:europa': halb(LAENDER.europa.map(x => x.a3)),
      'fiona:laender:afrika': halb(LAENDER.afrika.map(x => x.a3)),
    },
    einstellungen: {
      'tiere:fiona': { ids: sammelbar().map(t => t.id), gorilla: 3, szenen },
      alles: { vorlaufGezeigt: { 'fiona:kontinente': true, 'fiona:bundeslaender': true,
        'fiona:laender:europa': true, 'fiona:laender:afrika': true } },
    } });
  await s.reload({ waitUntil: 'domcontentloaded' });
  await s.waitForSelector('[data-profil="fiona"]');
  await s.click('[data-profil="fiona"]');
  await s.waitForSelector('.schirm.da #buch');
  await s.click('.schirm.da #buch');
  await s.waitForSelector('.rollen.buch');
  await s.waitForTimeout(700);
  const kapitel = await s.$$eval('.buchreiter [data-kap]', e => e.map(x => x.dataset.kap));
  return { b, ctx, s, server, kapitel };
}
