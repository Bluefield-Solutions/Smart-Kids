/* Zwei Geraete, ein Dienst: kommt der Aufkleber wirklich hinueber? (Q29)
 *
 * WARUM DAS KEIN TOR IST, sondern ein Werkzeug.
 *
 * Die Adresse des Gleichlaufdienstes steht im BAU (`SMARTKIDS_GLEICHLAUF`)
 * und nicht zur Laufzeit. Das ist Absicht: eine Adresse, die sich per
 * Aufrufparameter setzen liesse, waere ein Weg, die Aufkleber eines Kindes
 * anderswohin zu schicken - klein, aber echt. Ein Tor in der Kette
 * muesste also mit einem eigenen Bau fahren, und das kostet mehr, als es
 * einbringt.
 *
 * Also ein Werkzeug, das man von Hand faehrt - und die Naht zwischen App
 * und Dienst ist damit die eine Stelle dieser Runde, die KEIN Tor
 * bewacht. Das steht hier, damit niemand es fuer geprueft haelt.
 *
 * Fahren:
 *     SMARTKIDS_GLEICHLAUF=http://127.0.0.1:8787 npm run bauen
 *     npm run zweigeraete
 *     npm run bauen        (wieder ohne Adresse, sonst geht ein Bau mit
 *                           einer Testadresse ins Netz)
 *
 * Erwartet:
 *     A: im Stand = afrika,europa
 *     B: im Stand = afrika,asien,europa
 *     A nach dem zweiten Start: im Stand = afrika,asien,europa
 *     Steht „afrika" lesbar darin? false
 */
import http from 'node:http';
import { starte, serviere, zurEbenenwahl } from '/home/user/smart-kids/tor/chromium.mjs';

// Der Dienst - dasselbe Protokoll wie der Worker.
const lager = new Map();
const dienst = http.createServer((q, a) => {
  const kopf = { 'access-control-allow-origin':'*', 'access-control-allow-methods':'GET,PUT,OPTIONS',
                 'access-control-allow-headers':'content-type', 'content-type':'application/json' };
  if (q.method === 'OPTIONS') { a.writeHead(204, kopf); return a.end(); }
  const m = q.url.match(/^\/v1\/([0-9a-f]{32})$/);
  if (!m) { a.writeHead(404, kopf); return a.end('{}'); }
  if (q.method === 'GET') { a.writeHead(200, kopf);
    return a.end(JSON.stringify(lager.get(m[1]) || { fassung:0, stand:null })); }
  let b = ''; q.on('data', d => b += d); q.on('end', () => {
    const rein = JSON.parse(b), da = lager.get(m[1]);
    const jetzt = da ? da.fassung : 0;
    if ((rein.fassung||0) !== jetzt) { a.writeHead(409, kopf);
      return a.end(JSON.stringify(da)); }
    lager.set(m[1], { fassung: jetzt+1, stand: rein.stand });
    a.writeHead(200, kopf); a.end(JSON.stringify({ fassung: jetzt+1 }));
  });
});
await new Promise(j => dienst.listen(8787, '127.0.0.1', j));
const dienstAdresse = `http://127.0.0.1:${dienst.address().port}`;
console.log('Dienst:', dienstAdresse);

const { server, adresse } = await serviere('/home/user/smart-kids/dist');
const b = await starte();
const CODE = process.argv[2] || 'JAZ6-FDWF-BFW4-7KWK';

async function geraet(name, tun) {
  const ctx = await b.newContext({ viewport:{ width:844, height:390 },
    deviceScaleFactor:1, hasTouch:true, isMobile:true, locale:'de-DE' });
  const p = await ctx.newPage();
  await p.goto(adresse + '?flott', { waitUntil:'load' });
  await p.waitForSelector('[data-profil="fiona"]');
  const r = await tun(p);
  await ctx.close();
  return r;
}

const standSetzen = (p, ids) => p.evaluate(async (ids) => {
  const stand = {};
  for (const id of ids) stand[id] = { fach:3, hoechstes:3, faellig:0, richtig:3, falsch:0, zuletzt:Date.now() };
  await new Promise((ja,nein)=>{ const a = indexedDB.open('lernkiste',1);
    a.onsuccess = () => { const t = a.result.transaction(['fortschritt','einstellungen'],'readwrite');
      t.objectStore('fortschritt').put(stand,'fiona:kontinente');
      t.oncomplete = ja; t.onerror = () => nein(t.error); };
    a.onerror = () => nein(a.error); });
}, ids);
const schluesselSetzen = (p, code) => p.evaluate(async (code) => {
  await new Promise((ja,nein)=>{ const a = indexedDB.open('lernkiste',1);
    a.onsuccess = () => { const t = a.result.transaction('einstellungen','readwrite');
      const s = t.objectStore('einstellungen'); const g = s.get('alles');
      g.onsuccess = () => s.put({ ...(g.result||{}), familienschluessel: code }, 'alles');
      t.oncomplete = ja; t.onerror = () => nein(t.error); };
    a.onerror = () => nein(a.error); });
}, code);
const standLesen = (p) => p.evaluate(() => new Promise((ja,nein)=>{
  const a = indexedDB.open('lernkiste',1);
  a.onsuccess = () => { const t = a.result.transaction('fortschritt','readonly');
    const g = t.objectStore('fortschritt').get('fiona:kontinente');
    g.onsuccess = () => ja(Object.keys(g.result||{}).sort());
    t.onerror = () => nein(t.error); };
  a.onerror = () => nein(a.error); }));
const kleberZaehlen = async (p) => {
  await p.$eval('[data-profil="fiona"]', x => x.click());
  await p.waitForSelector('.schirm.da #buch');
  await p.$eval('.schirm.da #buch', x => x.click());
  await p.waitForSelector('.schirm.da .albumkarte, .schirm.da .aufkleber', { timeout:15000 });
  await p.waitForTimeout(400);
  return p.$$eval('.schirm.da .albumkleber', e => e.length);
};

// Geraet A: Afrika und Europa, gekoppelt.
await geraet('A', async (p) => {
  await standSetzen(p, ['afrika','europa']);
  await schluesselSetzen(p, CODE);
  await p.reload({ waitUntil:'load' });
  await p.waitForTimeout(2500);              // der Gleichlauf beim Start
  console.log('A: im Stand =', (await standLesen(p)).join(','));
});
// Geraet B: NUR Asien, derselbe Schluessel.
await geraet('B', async (p) => {
  await standSetzen(p, ['asien']);
  await schluesselSetzen(p, CODE);
  await p.reload({ waitUntil:'load' });
  await p.waitForTimeout(2500);
  console.log('B: im Stand =', (await standLesen(p)).join(','));
});
// Und A noch einmal - jetzt muss Asien dazugekommen sein.
await geraet('A2', async (p) => {
  await standSetzen(p, ['afrika','europa']);
  await schluesselSetzen(p, CODE);
  await p.reload({ waitUntil:'load' });
  await p.waitForTimeout(2500);
  console.log('A nach dem zweiten Start: im Stand =', (await standLesen(p)).join(','));
});
console.log('Im Lager des Dienstes:', [...lager.values()].map(v => v.stand.slice(0,40) + '…'));
console.log('Steht „afrika" lesbar darin?', [...lager.values()].some(v => /afrika/i.test(v.stand)));
await b.close(); server.close(); dienst.close();
