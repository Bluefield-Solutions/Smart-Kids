import { chromium } from 'playwright';
import { serviere } from './tor/chromium.mjs';
import path from 'node:path';
const { server, adresse } = await serviere(path.join(process.cwd(), 'dist'));
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:844,height:390}, hasTouch:true, isMobile:true });
await p.goto(adresse + '?flott', { waitUntil:'load' });
await p.waitForSelector('[data-profil="stephan"]');
await p.click('[data-profil="stephan"]');
await p.waitForSelector('.schirm.da [data-welt]');
await p.$eval('.schirm.da [data-welt="erdkunde"]', e => e.click());
await p.waitForTimeout(400);
if (await p.$('.schirm.da [data-gruppe="laender"]'))
  await p.$eval('.schirm.da [data-gruppe="laender"]', e => e.click());
await p.waitForSelector('.schirm.da [data-ebene="laender:mittelamerika"]:not([data-gruppe])');
await p.$eval('.schirm.da [data-ebene="laender:mittelamerika"]:not([data-gruppe])', e => e.click());
await p.waitForTimeout(1500);
for (let i=0;i<3;i++){ const l=await p.$('.schirm.da #los');
  if(l){ await p.$eval('.schirm.da #los', e=>e.click()); await p.waitForTimeout(600);} }
await p.waitForTimeout(700);
const dump = async (wo) => {
  const d = await p.evaluate(() => {
    const k = document.querySelector('.schirm.da .karte');
    const svg = k.querySelector('svg');
    const fl = svg.querySelector('#fl');
    let bb = null; try { const r = fl.getBBox();
      bb = `${r.x.toFixed(0)},${r.y.toFixed(0)} ${r.width.toFixed(0)}x${r.height.toFixed(0)}`; } catch(e){}
    const kb = k.getBoundingClientRect();
    let land = 0;
    for (let n=0;n<9;n++) for (let m=0;m<9;m++){
      const e = document.elementFromPoint(kb.left+kb.width*(n+.5)/9, kb.top+kb.height*(m+.5)/9);
      if (e && e.closest && e.closest('path.geb')) land++;
    }
    return { lupe: k.dataset.lupe||'1', tr: svg.querySelector('#lupe').getAttribute('transform'),
             vb: svg.getAttribute('viewBox'), flBB: bb, landProzent: Math.round(land/81*100) };
  });
  console.log(wo, JSON.stringify(d));
};
await dump('start ');
for (let i=0;i<9;i++){ await p.click('#lupePlus'); await p.waitForTimeout(150); }
await dump('zoom8 ');
const kb = await p.evaluate(() => { const r = document.querySelector('.schirm.da .karte')
  .getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,b:r.width,h:r.height}; });
await p.mouse.move(kb.x, kb.y); await p.mouse.down();
for (let i=1;i<=12;i++) await p.mouse.move(kb.x+kb.b*0.25*i, kb.y+kb.h*0.25*i, {steps:2});
await p.mouse.up(); await p.waitForTimeout(300);
await dump('gezogen');
await b.close(); server.close();
