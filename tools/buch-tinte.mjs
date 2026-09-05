/* Wieviel steht ueberhaupt auf der Seite? Anteil der Bildpunkte, die
   nicht der Grund sind - im INHALTSKASTEN, nicht im ganzen Bild, sonst
   misst man Kopfzeile und Reiter mit. */
import fs from 'node:fs';
import zlib from 'node:zlib';
/* Wohin die Bilder gehen. `blick/` ist der Ort fuer Blickwerkzeuge -
   kein Tor liest hier etwas, ein Mensch sieht es an (Regel 4). */
const AUS = process.env.LERNKISTE_BLICK || 'blick/buch-audit';
fs.mkdirSync(AUS, { recursive: true });
// PNG selbst lesen: kein Paket noetig.
function png(datei) {
  const b = fs.readFileSync(datei);
  let i = 8, breite = 0, hoehe = 0, tiefe = 0, art = 0; const teile = [];
  while (i < b.length) {
    const len = b.readUInt32BE(i), typ = b.toString('ascii', i + 4, i + 8);
    if (typ === 'IHDR') { breite = b.readUInt32BE(i + 8); hoehe = b.readUInt32BE(i + 12);
      tiefe = b[i + 16]; art = b[i + 17]; }
    if (typ === 'IDAT') teile.push(b.subarray(i + 8, i + 8 + len));
    if (typ === 'IEND') break;
    i += len + 12;
  }
  if (tiefe !== 8 || (art !== 6 && art !== 2)) throw new Error('unerwartetes PNG ' + tiefe + '/' + art);
  const kn = art === 6 ? 4 : 3;
  const roh = zlib.inflateSync(Buffer.concat(teile));
  const zeile = breite * kn, aus = Buffer.alloc(hoehe * zeile);
  let p = 0;
  for (let y = 0; y < hoehe; y++) {
    const f = roh[p++]; const z = y * zeile, v = (y - 1) * zeile;
    for (let x = 0; x < zeile; x++) {
      const a = x >= kn ? aus[z + x - kn] : 0, o = y > 0 ? aus[v + x] : 0;
      const ol = (x >= kn && y > 0) ? aus[v + x - kn] : 0; const s = roh[p++];
      let w = 0;
      if (f === 0) w = s; else if (f === 1) w = s + a; else if (f === 2) w = s + o;
      else if (f === 3) w = s + ((a + o) >> 1);
      else { const q = a + o - ol, pa = Math.abs(q - a), pb = Math.abs(q - o), pc = Math.abs(q - ol);
             w = s + (pa <= pb && pa <= pc ? a : pb <= pc ? o : ol); }
      aus[z + x] = w & 255;
    }
  }
  return { breite, hoehe, kn, d: aus };
}
const mass = JSON.parse(fs.readFileSync(`${AUS}/mass.json`, 'utf8'));
console.log('  Anteil der Bildpunkte im Inhaltskasten, die nicht der weisse Grund sind\n');
for (const f of mass) {
  const g = f.groesse.split(' ')[0];
  const datei = `${AUS}/${g}-${f.kapitel}.png`;
  if (!fs.existsSync(datei)) continue;
  const { breite, hoehe, kn, d } = png(datei);
  const skala = breite / +f.groesse.split(' ')[1].split('x')[0];
  const y0 = Math.round((hoehe / skala - f.sichtbar) * skala);  // Kasten sitzt unten
  let tinte = 0, alle = 0;
  for (let y = y0; y < hoehe; y++) for (let x = 0; x < breite; x++) {
    const i = (y * breite + x) * kn;
    alle++;
    if (d[i] < 246 || d[i + 1] < 246 || d[i + 2] < 246) tinte++;
  }
  console.log(`  ${f.groesse.padEnd(20)} ${f.kapitel.padEnd(16)} Tinte ${(tinte / alle * 100).toFixed(1).padStart(5)} %`);
}
