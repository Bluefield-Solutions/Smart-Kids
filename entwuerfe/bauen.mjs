// Baut die MG-Entwuerfe. Die Geometrie kommt aus src/geo, nicht aus einem
// Platzhalter - sonst entwirft man gegen etwas, das es nicht gibt.
import fs from 'node:fs';
import { KONTINENTE_GROB } from '../src/geo/kontinente.grob.js';
import { DEUTSCHLAND_FEIN } from '../src/geo/deutschland.fein.js';
import { rahmen } from '../tools/geo-backen.mjs';

/* --- G13: Vierfaerbung. Nachbarschaft ist Geografie, kein Zufall. ------- */
const NACHBARN = {
  'DE-SH':['DE-HH','DE-NI','DE-MV'], 'DE-HH':['DE-SH','DE-NI'],
  'DE-MV':['DE-SH','DE-NI','DE-BB'],
  'DE-NI':['DE-SH','DE-HH','DE-MV','DE-BB','DE-ST','DE-TH','DE-HE','DE-NW','DE-HB'],
  'DE-HB':['DE-NI'], 'DE-BB':['DE-MV','DE-NI','DE-ST','DE-SN','DE-BE'],
  'DE-BE':['DE-BB'], 'DE-ST':['DE-NI','DE-BB','DE-SN','DE-TH'],
  'DE-SN':['DE-BB','DE-ST','DE-TH','DE-BY'],
  'DE-TH':['DE-NI','DE-ST','DE-SN','DE-BY','DE-HE'],
  'DE-NW':['DE-NI','DE-HE','DE-RP'],
  'DE-HE':['DE-NI','DE-TH','DE-BY','DE-BW','DE-RP','DE-NW'],
  'DE-RP':['DE-NW','DE-HE','DE-BW','DE-SL'], 'DE-SL':['DE-RP'],
  'DE-BW':['DE-RP','DE-HE','DE-BY'], 'DE-BY':['DE-HE','DE-TH','DE-SN','DE-BW'],
};
function vierfaerben(ids) {
  // Nach absteigendem Grad einfaerben - so kommt man mit vier Farben aus.
  const reihe = [...ids].sort((a,b)=>(NACHBARN[b]||[]).length-(NACHBARN[a]||[]).length);
  const farbe = {};
  for (const id of reihe) {
    const belegt = new Set((NACHBARN[id]||[]).map(n=>farbe[n]).filter(x=>x!==undefined));
    let f = 0; while (belegt.has(f)) f++;
    farbe[id] = f;
  }
  const max = Math.max(...Object.values(farbe)) + 1;
  const konflikte = Object.entries(NACHBARN)
    .flatMap(([a,ns])=>ns.filter(b=>farbe[a]===farbe[b]).map(b=>`${a}/${b}`));
  return { farbe, benutzt: max, konflikte };
}
const vf = vierfaerben(DEUTSCHLAND_FEIN.map(b=>b.id));
console.log(`  Vierfärbung: ${vf.benutzt} Farben, ${vf.konflikte.length} Konflikte`);
if (vf.konflikte.length) throw new Error('Nachbarn gleich gefärbt: '+vf.konflikte.join(', '));

/* --- viewBox aus den echten Pfaden ------------------------------------- */
const bK = rahmen(KONTINENTE_GROB), bD = rahmen(DEUTSCHLAND_FEIN);

/* --- Ausgabe ------------------------------------------------------------ */
const daten = {
  kontinente: KONTINENTE_GROB.map(k=>({ id:k.id, name:k.name, pfad:k.pfad })),
  deutschland: DEUTSCHLAND_FEIN.map(b=>({ id:b.id, name:b.name, hauptstadt:b.hauptstadt,
                                          farbe:vf.farbe[b.id], pfad:b.pfad })),
  vbK: `${bK.x0-8} ${bK.y0-8} ${bK.w+16} ${bK.h+16}`,
  vbD: `${bD.x0-12} ${bD.y0-12} ${bD.w+24} ${bD.h+24}`,
};
fs.writeFileSync('entwuerfe/daten.json', JSON.stringify(daten));

/* Die Entwuerfe bekommen DIESELBE Schrift wie die App - selbst gehostet.
 *
 * Vorher hing im Kopf ein `<link>` auf fonts.googleapis.com. Das hat zwei
 * Dinge gekostet, und das zweite ist schlimmer:
 *
 *   ZEIT   In einer Umgebung ohne freies Netz laeuft die Anfrage in die
 *          Zeitueberschreitung: gemessen 12,5 s je Seitenaufbau, und der
 *          Bildvergleich laedt die Seite bei jedem Lauf. Das war ein
 *          Drittel seiner ganzen Dauer.
 *   WAHRHEIT  Danach steht die Seite in der ERSATZSCHRIFT da. Die Vorbilder
 *          `mg-fiona-kontinente` und `mg-lea-deutschland` zeigten seit
 *          jeher eine Systemschrift statt Plus Jakarta Sans - ein Entwurf,
 *          der die Typografie zeigen soll, zeigte eine fremde.
 *
 * Die vier Schriften des DOKUMENTS (Newsreader, Atkinson, IBM Plex Mono,
 * Nunito) fallen jetzt auf ihre Systemstapel zurueck. Das ist der bewusste
 * Preis: sie schmuecken die Prosa drumherum, nicht die Entwuerfe selbst.
 * Die zwei, auf die es ankommt, sind die der App.
 */
{
  const quelle = 'src/schrift/schrift.css';
  const css = fs.readFileSync(quelle, 'utf8')
    .replace(/url\(\.\/schrift\/([^)]+)\)/g, 'url(../src/schrift/$1)');
  fs.writeFileSync('entwuerfe/schrift.css',
    '/* Gebaut aus ' + quelle + ' — nicht von Hand aendern. */\n' + css);
  console.log('  entwuerfe/schrift.css  aus ' + quelle);
}
console.log(`  Kontinente viewBox ${daten.vbK}`);
console.log(`  Deutschland viewBox ${daten.vbD}`);
console.log(`  daten.json ${(fs.statSync('entwuerfe/daten.json').size/1024).toFixed(0)} KB`);
