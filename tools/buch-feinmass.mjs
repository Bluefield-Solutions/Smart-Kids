/* Feinmass fuer das Forscherbuch: was ein Bildschirm „gemacht" aussehen
 * laesst, ist selten Geschmack - es ist meistens eine TONLEITER.
 *
 * Gemessen wird deshalb nicht „schoen", sondern die Zahl der
 * verschiedenen Werte je Sorte: Schriftgroessen, Radien, Abstaende,
 * Farben, Schatten, Fluchtlinien. Wenige, wiederkehrende Werte sehen
 * gemacht aus; viele, einmalige sehen gewachsen aus.
 *
 * Dazu drei Dinge, die fuer ein Kind zaehlen, das NICHT LESEN kann:
 * wieviel der Flaeche Bild statt Text ist, ob jeder Griff angesagt wird
 * (`data-lesen`), und ob er mit dem Daumen zu treffen ist.
 *
 * Kein Tor - ein Blickwerkzeug (Regel 4): es urteilt nicht, es zaehlt.
 */
import fs from 'node:fs';
import { oeffneBuch, AUS } from './buch-oeffnen.mjs';

const { b, s, server, kapitel: kaps } = await oeffneBuch();

const alles = { schrift: {}, radius: {}, luft: {}, farbe: {}, grund: {}, schatten: {},
                flucht: {}, klassen: {}, jeSeite: [] };
const zaehl = (o, k) => { o[k] = (o[k] || 0) + 1; };

for (const k of kaps) {
  await s.click(`[data-kap="${k}"]`);
  await s.waitForTimeout(400);
  const m = await s.evaluate(() => {
    const schirm = document.querySelector('.schirm.da');
    const kasten = schirm.querySelector('.rollen.buch');
    const rk = kasten.getBoundingClientRect();
    const raus = { schrift: [], radius: [], luft: [], farbe: [], grund: [],
                   schatten: [], flucht: [], klassen: [], klein: [], ohneStimme: [],
                   zeichen: 0, bildFlaeche: 0, textFlaeche: 0 };
    const alle = [...schirm.querySelectorAll('*')];
    for (const e of alle) {
      const r = e.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const c = getComputedStyle(e);
      for (const kl of e.classList) raus.klassen.push(kl);
      // Schrift zaehlt nur, wo wirklich Text steht
      const eigenerText = [...e.childNodes]
        .filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join('');
      if (eigenerText) {
        raus.schrift.push(`${Math.round(parseFloat(c.fontSize))}/${c.fontWeight}`);
        raus.farbe.push(c.color);
        raus.zeichen += eigenerText.length;
        raus.textFlaeche += r.width * r.height;
      }
      const rad = parseFloat(c.borderTopLeftRadius);
      if (rad > 0.5) raus.radius.push(Math.round(rad));
      if (c.backgroundColor !== 'rgba(0, 0, 0, 0)') raus.grund.push(c.backgroundColor);
      if (c.boxShadow && c.boxShadow !== 'none') raus.schatten.push(c.boxShadow);
      for (const v of [c.paddingTop, c.paddingLeft, c.gap, c.marginTop])
        { const z = Math.round(parseFloat(v)); if (z > 0) raus.luft.push(z); }
      // Fluchtlinien: linke Kante, aber nur von Blocken im Inhaltskasten
      if (kasten.contains(e) && r.width > rk.width * 0.12)
        raus.flucht.push(Math.round(r.left - rk.left));
      if (e.tagName === 'SVG' || e.tagName === 'svg' || e.tagName === 'IMG')
        raus.bildFlaeche += r.width * r.height;
      // Griffe: Groesse und Ansage
      const griff = e.matches('button, [role="tab"], a, [onclick]');
      if (griff) {
        if (r.width < 44 || r.height < 44) raus.klein.push(
          `${(e.textContent || '').trim().slice(0, 18) || e.className} ${Math.round(r.width)}×${Math.round(r.height)}`);
        if (!e.dataset.lesen && !e.getAttribute('aria-label'))
          raus.ohneStimme.push((e.textContent || '').trim().slice(0, 22) || e.className);
      }
    }
    raus.kasten = { b: Math.round(rk.width), h: Math.round(rk.height) };
    return raus;
  });
  for (const [feld, liste] of Object.entries({ schrift: m.schrift, radius: m.radius,
        luft: m.luft, farbe: m.farbe, grund: m.grund, schatten: m.schatten,
        flucht: m.flucht, klassen: m.klassen }))
    for (const v of liste) zaehl(alles[feld], String(v));
  alles.jeSeite.push({ kapitel: k, zeichen: m.zeichen,
    bildAnteil: m.bildFlaeche / (m.bildFlaeche + m.textFlaeche || 1),
    flucht: [...new Set(m.flucht)].sort((a, c) => a - c),
    klein: m.klein, ohneStimme: m.ohneStimme });
}
await b.close(); server.close();
fs.writeFileSync(`${AUS}/feinmass.json`, JSON.stringify(alles, null, 1));

const zeig = (name, o, n = 99) => {
  const e = Object.entries(o).sort((a, c) => c[1] - a[1]);
  console.log(`\n  ${name}: ${e.length} verschiedene`);
  console.log('    ' + e.slice(0, n).map(([v, z]) => `${v}×${z}`).join('  ').slice(0, 460));
};
console.log(`\n  Feinmass am Forscherbuch, 844 x 390, voller Stand, ${kaps.length} Kapitel`);
zeig('Schriftgrössen (Grösse/Schnitt)', alles.schrift);
zeig('Eckenradien', alles.radius);
zeig('Abstände (padding · gap · margin)', alles.luft);
zeig('Textfarben', alles.farbe);
zeig('Grundfarben', alles.grund);
zeig('Schatten', alles.schatten, 6);
console.log(`\n  Klassen: ${Object.keys(alles.klassen).length} verschiedene, `
  + `${Object.values(alles.klassen).filter(z => z === 1).length} kommen genau EINMAL vor`);
console.log('\n  Je Seite');
for (const p of alles.jeSeite)
  console.log(`    ${p.kapitel.padEnd(15)} ${String(p.zeichen).padStart(4)} Zeichen · `
    + `Bildanteil ${(p.bildAnteil * 100).toFixed(0).padStart(3)} % · `
    + `${p.flucht.length} Fluchtlinien [${p.flucht.slice(0, 8).join(' ')}] · `
    + `${p.klein.length} Griffe unter 44 · ${p.ohneStimme.length} ohne Ansage`);
