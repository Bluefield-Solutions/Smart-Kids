/* Entwuerfe fuer R2 — echte Marken, echte Schrift, echte Umrisse.
 * Nur zum ANSEHEN: kein Teil der App, kein Teil der Kette. */
import fs from 'node:fs';
import path from 'node:path';
import { starte } from '../../tor/chromium.mjs';
import { DEUTSCHLAND_GROB } from '../../src/geo/deutschland.grob.js';
import { KONTINENTE_GROB } from '../../src/geo/kontinente.grob.js';
import { LAENDER_EUROPA_GROB } from '../../src/geo/laender-europa.grob.js';
import { LAENDER_AFRIKA_GROB } from '../../src/geo/laender-afrika.grob.js';
import { LAENDER_ASIEN_GROB } from '../../src/geo/laender-asien.grob.js';
import { LAENDER_NORDAMERIKA_GROB } from '../../src/geo/laender-nordamerika.grob.js';
import { LAENDER_SUEDAMERIKA_GROB } from '../../src/geo/laender-suedamerika.grob.js';

const W = '/home/user/smart-kids';
const gebaut = fs.readFileSync(path.join(W, 'dist/index.html'), 'utf8');
const KOPF = gebaut.slice(0, gebaut.indexOf('<body')) ;   // Marken, Schrift, Stil

/* Ein Umriss fuer die Bildvariante — echt, nicht gemalt. */
const bbox = (liste) => {
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (const g of liste) for (const m of g.pfad.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)) {
    const x=+m[1], y=+m[2];
    if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;
  }
  return `${x0} ${y0} ${x1-x0} ${y1-y0}`;
};
/* Jede Kachel bekommt IHREN Umriss, nicht irgendeinen.
 * Der erste Wurf gab nur den Bundeslaendern ein Bild — sieben von acht
 * Kacheln trugen also keins, und ein Entwurf, der seine eigene Idee nur
 * zu einem Achtel zeigt, ist nicht zu beurteilen. */
const UMRISS = {
  'Kontinente':   KONTINENTE_GROB,
  'Europa':       LAENDER_EUROPA_GROB,
  'Afrika':       LAENDER_AFRIKA_GROB,
  'Asien':        LAENDER_ASIEN_GROB,
  'Nordamerika':  LAENDER_NORDAMERIKA_GROB,
  'Südamerika':   LAENDER_SUEDAMERIKA_GROB,
  'Bundesländer': DEUTSCHLAND_GROB,
  'Hauptstädte':  DEUTSCHLAND_GROB,
};
const bild = (n) => {
  const l = UMRISS[n]; if (!l) return '';
  return `<svg class="bild" viewBox="${bbox(l)}" preserveAspectRatio="xMidYMid meet"
    ><path d="${l.map(g=>g.pfad).join(' ')}" fill-rule="evenodd"/></svg>`;
};

/* Der leere Stern nimmt die Farbe seiner UMGEBUNG (`currentColor`).
 * Fest auf `--tinte-3` gesetzt verschwand er in Entwurf C auf dem
 * gesaettigten Grund — `lesbarkeit` haette das spaeter ohnehin gemeldet. */
const stern = (voll) => `<svg viewBox="0 0 24 24" width="19" height="19" fill="${voll?'var(--stern)':'none'}"
  stroke="${voll?'var(--stern)':'currentColor'}" stroke-opacity="${voll?1:.55}"
  stroke-width="1.8" stroke-linejoin="round"
  ><path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z"/></svg>`;
const sterne = (n) => `<span class="st">${[0,1,2].map(i=>stern(i<n)).join('')}</span>`;
const kleber = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor"
  stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 1 9 9h-5a4 4 0 0 0-4 4v5a9 9 0 0 1 0-18z"/><path d="M12 21c2.4 0 8.6-6.2 9-9"/></svg>`;
const welt = `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor"
  stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13 13 0 0 1 0 18a13 13 0 0 1 0-18z"/></svg>`;
const rechnen = `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor"
  stroke-width="1.9" stroke-linecap="round"><path d="M4 8h7M7.5 4.5v7"/><path d="M13 12.5l7 7M20 12.5l-7 7"/></svg>`;

const EBENEN = [
  ['Die Welt','Kontinente',5,2,6,3], ['Länder in','Europa',3,0,5,0],
  ['Länder in','Afrika',2,0,5,0],    ['Länder in','Asien',4,0,5,0],
  ['Länder in','Nordamerika',7,0,5,0], ['Länder in','Südamerika',6,0,5,0],
  ['Deutschland','Bundesländer',1,5,16,1], ['Deutschland','Hauptstädte',2,0,13,0],
];

/* ---------------- Entwurf A · Ruhig ------------------------------------
 * Weisse Karte, Farbe nur als Kante links und im Zeichen. Der Fortschritt
 * ist EINE Zahl mit Ring statt Sterne + Aufkleber + Balken nebeneinander.
 * Weniger Elemente, mehr Luft — die Kachel soll nicht selbst spielen. */
const A = {
  name:'A · Ruhig',
  satz:'Farbe nur als Kante, ein Fortschritt statt dreier, viel Luft.',
  css:`
  .A .wahl{display:grid;gap:10px;grid-template-columns:repeat(4,1fr)}
  .A .k{display:flex;flex-direction:column;gap:2px;text-align:left;padding:10px 12px 10px 14px;
    background:var(--papier);border:1px solid var(--linie);border-left:5px solid var(--ton);
    border-radius:12px;position:relative;min-height:64px;justify-content:center}
  .A .ueber{font:700 10px/1 var(--f-ui);letter-spacing:.06em;text-transform:uppercase;color:var(--tinte-3)}
  .A .nm{font:800 16px/1.15 var(--f-ui);color:var(--tinte)}
  .A .ring{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px}
  .A .ring text{font:700 11px var(--f-ui);fill:var(--tinte-2)}
  .A .welt{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .A .wk{display:flex;flex-direction:column;gap:6px;align-items:flex-start;padding:16px 18px;
    background:var(--papier);border:1px solid var(--linie);border-left:6px solid var(--ton);
    border-radius:16px;color:var(--ton)}
  .A .wk .nm{font-size:22px;color:var(--tinte)}
  .A .prof{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .A .pk{display:flex;gap:12px;align-items:center;padding:14px 16px;background:var(--papier);
    border:1px solid var(--linie);border-left:6px solid var(--ton);border-radius:16px}
  .A .kreis{width:44px;height:44px;border-radius:50%;background:var(--ton);color:#fff;
    display:grid;place-items:center;font:800 20px var(--f-ui)}`,
  kachel:(u,n,f,st,ges,ganz)=>`<button class="k" style="--ton:var(--f${f})">
      <span class="ueber">${u}</span><span class="nm">${n}</span>
      <svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none"
        stroke="var(--linie)" stroke-width="4"/><circle cx="18" cy="18" r="15" fill="none"
        stroke="var(--ton)" stroke-width="4" stroke-linecap="round"
        stroke-dasharray="${(94*ges/ganz).toFixed(1)} 94" transform="rotate(-90 18 18)"
        ${ges ? '' : 'visibility="hidden"'}/>
        <text x="18" y="22" text-anchor="middle">${ges}</text></svg></button>`,
  welt:(zeichen,n,anz,ges,ganz,f)=>`<button class="wk" style="--ton:var(--f${f})">
      ${zeichen}<span class="nm">${n}</span>
      <span class="ueber">${anz} ${anz===1?'Übung':'Übungen'} · ${ges} von ${ganz}</span></button>`,
  profil:(n,alter,f)=>`<button class="pk" style="--ton:var(--f${f})">
      <span class="kreis">${n[0]}</span><span><span class="nm">${n}</span><br>
      <span class="ueber">${alter}</span></span></button>`,
};

/* ---------------- Entwurf B · Bild -------------------------------------
 * Die Kachel ZEIGT, worum es geht: der echte Umriss als Wasserzeichen.
 * Ein Kind, das nicht liest, erkennt Deutschland am Bild und nicht am
 * Wort. Farbe traegt das Bild, nicht die Flaeche. */
const B = {
  name:'B · Bild',
  satz:'Der echte Umriss als Wasserzeichen — erkennbar, bevor man liest.',
  css:`
  .B .wahl{display:grid;gap:10px;grid-template-columns:repeat(4,1fr)}
  .B .k{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;
    gap:3px;text-align:left;padding:10px 12px;min-height:70px;border-radius:14px;
    background:color-mix(in oklab, var(--ton) 16%, var(--papier));
    border:1px solid color-mix(in oklab, var(--ton) 34%, var(--papier))}
  /* Das Bild sitzt in der rechten Haelfte und wird nach links weich
     ausgeblendet — sonst laeuft der Umriss in den Namen hinein. Genau das
     passierte im ersten Wurf bei „Bundeslaender". */
  .B .k svg.bild{position:absolute;right:-4px;top:50%;transform:translateY(-50%);
    height:150%;opacity:.34;pointer-events:none;
    -webkit-mask-image:linear-gradient(to right,transparent 0,#000 55%);
    mask-image:linear-gradient(to right,transparent 0,#000 55%)}
  .B .k svg.bild path{fill:var(--ton)}
  .B .ueber{font:700 10px/1 var(--f-ui);letter-spacing:.06em;text-transform:uppercase;
    color:color-mix(in oklab, var(--ton) 60%, var(--tinte));position:relative}
  .B .nm{font:800 16px/1.15 var(--f-ui);color:var(--tinte);position:relative}
  .B .st{display:inline-flex;gap:1px;position:relative}
  .B .welt{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .B .wk{position:relative;overflow:hidden;display:flex;flex-direction:column;gap:6px;
    align-items:flex-start;padding:18px 20px;border-radius:18px;color:var(--ton);
    background:color-mix(in oklab, var(--ton) 16%, var(--papier));
    border:1px solid color-mix(in oklab, var(--ton) 34%, var(--papier))}
  .B .wk .nm{font-size:22px}
  .B .prof{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .B .pk{display:flex;gap:12px;align-items:center;padding:14px 16px;border-radius:18px;
    background:color-mix(in oklab, var(--ton) 16%, var(--papier));
    border:1px solid color-mix(in oklab, var(--ton) 34%, var(--papier))}
  .B .kreis{width:46px;height:46px;border-radius:50%;background:var(--ton);color:#fff;
    display:grid;place-items:center;font:800 21px var(--f-ui)}`,
  kachel:(u,n,f,st,ges,ganz)=>`<button class="k" style="--ton:var(--f${f})">
      ${bild(n)}<span class="ueber">${u}</span><span class="nm">${n}</span>
      ${sterne(st)}</button>`,
  welt:(zeichen,n,anz,ges,ganz,f)=>`<button class="wk" style="--ton:var(--f${f})">
      ${zeichen}<span class="nm">${n}</span>
      <span class="ueber">${anz} ${anz===1?'Übung':'Übungen'} · ${ges} von ${ganz}</span></button>`,
  profil:(n,alter,f)=>`<button class="pk" style="--ton:var(--f${f})">
      <span class="kreis">${n[0]}</span><span><span class="nm">${n}</span><br>
      <span class="ueber">${alter}</span></span></button>`,
};

/* ---------------- Entwurf C · Gross ------------------------------------
 * Die heutige Richtung, aber zu Ende gebracht: volle Farbflaeche, grosse
 * Schrift, und der Stand in EINER Zeile unter dem Namen statt in einem
 * gedraengten Fuss. Fuer die Kleinste die deutlichste. */
const C = {
  name:'C · Groß',
  satz:'Volle Farbe, große Schrift, der Stand in einer Zeile statt im Fuß.',
  css:`
  .C .wahl{display:grid;gap:11px;grid-template-columns:repeat(4,1fr)}
  .C .k{display:flex;flex-direction:column;gap:4px;text-align:left;padding:12px 14px;
    min-height:74px;border-radius:16px;background:var(--ton);color:var(--auf-flaeche);
    border:1px solid color-mix(in oklab, var(--ton) 70%, var(--tinte));
    box-shadow:0 3px 0 color-mix(in oklab, var(--ton) 62%, var(--tinte))}
  .C .ueber{font:700 10px/1 var(--f-ui);letter-spacing:.06em;text-transform:uppercase;opacity:.72}
  .C .nm{font:800 18px/1.1 var(--f-ui)}
  .C .zeile{display:flex;align-items:center;gap:8px;font:700 12px var(--f-ui);opacity:.9}
  .C .st{display:inline-flex;gap:1px}
  .C .welt{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .C .wk{display:flex;flex-direction:column;gap:8px;align-items:flex-start;padding:20px 22px;
    border-radius:20px;background:var(--ton);color:var(--auf-flaeche);
    box-shadow:0 4px 0 color-mix(in oklab, var(--ton) 62%, var(--tinte))}
  .C .wk .nm{font-size:26px}
  .C .prof{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .C .pk{display:flex;flex-direction:column;gap:6px;align-items:center;padding:16px;
    border-radius:20px;background:var(--ton);color:var(--auf-flaeche);
    box-shadow:0 4px 0 color-mix(in oklab, var(--ton) 62%, var(--tinte))}
  .C .kreis{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.55);
    display:grid;place-items:center;font:800 24px var(--f-ui);color:var(--tinte)}`,
  kachel:(u,n,f,st,ges,ganz)=>`<button class="k" style="--ton:var(--f${f})">
      <span class="ueber">${u}</span><span class="nm">${n}</span>
      <span class="zeile">${sterne(st)} ${kleber} ${ges}</span></button>`,
  welt:(zeichen,n,anz,ges,ganz,f)=>`<button class="wk" style="--ton:var(--f${f})">
      ${zeichen}<span class="nm">${n}</span>
      <span class="zeile">${anz} ${anz===1?'Übung':'Übungen'} ${kleber} ${ges} von ${ganz}</span></button>`,
  profil:(n,alter,f)=>`<button class="pk" style="--ton:var(--f${f})">
      <span class="kreis">${n[0]}</span><span class="nm">${n}</span>
      <span class="ueber">${alter}</span></button>`,
};

/* --------------- Die drei Bildschirme, je Entwurf ---------------------- */
const schirm = (inhalt, titel, marke) => `
  <div class="geraet">
    <div class="kopf"><span class="knopfchen">‹ Zurück</span><span class="marke">${marke}</span>
      <span class="rechts">▤ ⌂</span></div>
    <div class="mitte"><div class="titel">${titel}</div>${inhalt}</div>
  </div>`;

function seite(E) {
  const ebenen = EBENEN.map(([u,n,f,st,ganz,ges]) =>
    E.kachel(u, n, f, st, ges, ganz, n === 'Bundesländer')).join('');
  return `${KOPF}<body class="${E.name[0]}">
  <style>
    body{margin:0;background:var(--grund);font-family:var(--f-ui)}
    .rahmen{width:844px;margin:0 auto;padding:14px 0 22px}
    .schild{font:800 13px/1 var(--f-ui);color:var(--tinte-2);padding:8px 4px 4px}
    .geraet{width:844px;height:390px;background:var(--grund);border:1px solid var(--linie);
      border-radius:10px;overflow:hidden;display:flex;flex-direction:column;margin-bottom:16px}
    .kopf{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;
      font:700 13px var(--f-ui);color:var(--tinte-2)}
    .kopf .marke{font-weight:800;color:var(--tinte);font-size:15px}
    .mitte{flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:0 18px 16px}
    .titel{font:800 20px var(--f-ui);text-align:center;color:var(--tinte)}
    ${E.css}
  </style>
  <div class="rahmen">
    <div class="schild">${E.name} — ${E.satz}</div>
    ${schirm(`<div class="prof">${E.profil('Fiona','6 Jahre · ziehen',7)}
        ${E.profil('Lea','8 Jahre · tippen',5)}${E.profil('Eltern','schwer · tippen',2)}</div>`,
      'Wer spielt?', 'Smart Kids')}
    ${schirm(`<div class="welt">${E.welt(welt,'Erdkunde',8,12,63,5)}
        ${E.welt(rechnen,'Rechnen',1,4,100,4)}</div>`, 'Was möchtest du üben?', 'Fiona')}
    ${schirm(`<div class="wahl">${ebenen}</div>`, 'Womit möchtest du anfangen?', 'Erdkunde')}
  </div></body></html>`;
}

/* --------------- Aufnehmen -------------------------------------------- */
const ZIEL = '/tmp/claude-0/-home-user-towerfront/4a4d3588-76df-54c7-9810-611a84f37cef/scratchpad/entwuerfe';
const b = await starte();
const ctx = await b.newContext({ deviceScaleFactor: 2 });
for (const E of [A, B, C]) {
  const datei = path.join(ZIEL, `entwurf-${E.name[0]}.html`);
  fs.writeFileSync(datei, seite(E));
  const p = await ctx.newPage({ viewport:{ width: 880, height: 1400 } });
  await p.goto('file://' + datei, { waitUntil:'domcontentloaded' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(250);
  // Die ganze Seite. Ein Ausschnitt schnitt beim ersten Anlauf den dritten
  // Bildschirm ab - und genau der traegt die Ebenenkacheln.
  const hoch = await p.evaluate(() => document.querySelector('.rahmen').scrollHeight);
  await p.setViewportSize({ width: 880, height: Math.ceil(hoch) + 30 });
  await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(ZIEL, `entwurf-${E.name[0]}.png`), fullPage: true });
  console.log('  ' + E.name);
  await p.close();
}
await ctx.close(); await b.close();
