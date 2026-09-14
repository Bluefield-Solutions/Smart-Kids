/* Die Bilderseite: alle Zeichnungen in ECHTEN Karten, im ECHTEN Stilblatt.
 *
 * Aufruf:
 *   node tools/bilderseite.mjs <zieldatei.html>
 *
 * ---------------------------------------------------------------------
 * WARUM ES DAS GIBT, OBWOHL ES DAS BILDERBLATT SCHON GAB
 *
 * Das Blatt aus E18 hat die Karte NACHGEBAUT: `.engkarte` mit 8 Punkten
 * Polster, 1 Punkt Rand, 14 Punkten Rundung. Die echte Karte hat
 * `var(--r3)`, `var(--strich)`, `var(--rund-karte)`, dazu zwei Schatten
 * und einen Lichtsaum an der Oberkante - und im kurzen Querformat ein
 * anderes Polster. Beurteilt wurde also eine Karte, die es nicht gibt.
 *
 * Der Kontrast, auf den es ankommt, entsteht am RAND der Zeichnung gegen
 * das Papier der Karte. Wer den Rand nachbaut, misst seinen eigenen
 * Nachbau - und jede Zahl traegt ihre Messstelle mit (Regel 5): gemessen
 * woran, in welcher Umgebung.
 *
 * Hier wird deshalb nichts nachgebaut:
 *   - das Stilblatt kommt aus `dist/index.html`, vollstaendig,
 *   - die Zeichnung kommt aus `Englisch.bildSvg`, also aus der Funktion,
 *     die sie auch im Spiel zeichnet,
 *   - die Groesse kommt aus der Medienabfrage, nicht aus einer Zahl hier.
 * Damit gibt es keine zweite Stelle, die veralten kann (Regel 6).
 *
 * ---------------------------------------------------------------------
 * UND WARUM ES EINE SEITE IST UND KEIN BILD
 *
 * Geurteilt wird auf dem iPhone quer. Ein PNG aus Chromium zeigt die
 * Farben dieses Rechners; erst das Geraet zeigt die Farben des Geraets -
 * sein Bildschirm, seine Helligkeit, sein Farbraum. Die Seite geht
 * deshalb mit nach Pages und ist unter `/bilder/` erreichbar. Kein Tor
 * ersetzt den Blick (Regel 4) - diese Seite auch nicht. Sie legt ihn nur
 * dorthin, wo er hingehoert.
 *
 * Die Woerter stehen zuerst NICHT da. Wer das Wort liest, erkennt die
 * Zeichnung immer - das ist die Falle, in der jede Bildabnahme sitzt, die
 * beschriftet ist. Erst schauen, dann den Schalter umlegen.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as EN from '../src/inhalt/englisch.js';

const WURZEL = process.cwd();

/** Das Stilblatt der gebauten App - vollstaendig, nicht in Auszuegen. */
export function stilblatt(gebaut = path.join(WURZEL, 'dist', 'index.html')) {
  if (!fs.existsSync(gebaut))
    throw new Error(`${path.relative(WURZEL, gebaut)} fehlt — erst \`npm run bauen\``);
  const t = fs.readFileSync(gebaut, 'utf8');
  const treffer = [...t.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  /* Ein leeres oder winziges Stilblatt waere eine Seite, die AUSSIEHT wie
     eine Bilderseite und nichts von dem zeigt, wofuer es sie gibt. Lieber
     die Auslieferung anhalten als das ausliefern. Die Grenze ist grob und
     absichtlich weit: sie faengt „gar nichts gefunden", nicht „ein paar
     Regeln weniger". */
  const stil = treffer.join('\n');
  if (stil.length < 50000)
    throw new Error(`Stilblatt aus ${path.relative(WURZEL, gebaut)} ist nur `
      + `${stil.length} Zeichen (${treffer.length} Bloecke) — das ist nicht `
      + 'das Stilblatt der App. Hat sich `prototyp/bauen.mjs` geaendert?');
  return stil;
}

/* Nur das, was die App NICHT mitbringt, weil sie eine App ist und keine
   Seite: `html,body{height:100%;overflow:hidden}` haelt den Bildschirm
   fest, damit im Spiel nichts wegrutscht. Ein Blatt mit 86 Karten muss
   sich schieben lassen. */
const SEITENSTIL = `
html,body{height:auto;overflow:auto;overscroll-behavior:auto}
/* Der Verlauf steht auf "body". Bei fester Hoehe deckt er den Bildschirm;
   auf einem Blatt, das laenger ist als der Bildschirm, deckt er nur das
   erste Fenster und darunter steht das nackte Weiss des Browsers - eine
   Karte auf Weiss hat einen anderen Kontrast als eine auf dem Grund, und
   genau der wird hier beurteilt. Der Grundton gehoert also an "html". */
html{background:var(--grund-2)}
body{padding:16px calc(var(--sicher-rechts,0px) + 16px)
     calc(var(--sicher-unten,0px) + 40px) calc(var(--sicher-links,0px) + 16px);
     font-family:var(--f-ui)}
h1{font-size:var(--s2);margin:0 0 4px}
p.messstelle{margin:0 0 14px;color:var(--tinte-3);font-size:var(--s-klein);
  line-height:1.45;max-width:62ch}
p.messstelle code{font-family:ui-monospace,monospace}
.schalter{display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;
  color:var(--tinte-2);font-size:var(--s-klein);cursor:pointer;
  border:var(--strich) solid var(--linie);border-radius:var(--rund-voll);
  padding:8px 14px;background:var(--papier);min-height:44px}
.schalter input{width:20px;height:20px}
.feld{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}
.stueck{margin:0;display:flex;flex-direction:column;align-items:center;gap:4px}
/* Die Karte ist im Spiel ein Knopf. Hier soll sie nur DASTEHEN - kein
   Zeigefinger, kein Eindruecken, aber dieselbe Flaeche und derselbe
   Rand. */
.stueck .engkarte{cursor:default}
.stueck .engkarte:active{transform:none}
figcaption{visibility:hidden;text-align:center;line-height:1.2;
  font-size:var(--s-klein);color:var(--tinte-2)}
figcaption span{display:block;font-size:11px;color:var(--tinte-3)}
/* "#woerter" steht IM Etikett, ist also kein Geschwister von ".feld" -
   "~" hat hier nichts getroffen, und das Blatt kam ohne ein einziges Wort
   heraus, obwohl der Haken sass. Beim ersten Blick sah es aus wie ein
   Blatt, das eben keine Woerter zeigt. ":has" fragt von aussen. */
body:has(#woerter:checked) figcaption{visibility:visible}
/* Welche Groesse gerade gilt, sagt die Seite selbst - aus DERSELBEN
   Medienabfrage wie die App, damit hier keine Zahl steht, die spaeter
   nicht mehr stimmt. */
.jetzt-quer{display:none}
@media (max-height:440px), (max-width:430px){
  .jetzt-hoch{display:none}
  .jetzt-quer{display:inline}
}`;

const schuetzen = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Die ganze Seite als HTML. */
export function bilderSeite(opt = {}) {
  const gemalt = EN.BILDER.filter(b => b.bild);
  const karten = gemalt.map(b => `
    <figure class="stueck">
      <div class="engkarte" lang="en">${EN.bildSvg(b.bild)}</div>
      <figcaption>${schuetzen(b.wort)}<span>${
        schuetzen(EN.gebietTitel(b.gebiet) || b.gebiet)}</span></figcaption>
    </figure>`).join('');

  return `<!doctype html>
<html lang="de"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Alle ${gemalt.length} Zeichnungen · Smart Kids</title>
<style>${stilblatt(opt.gebaut)}</style>
<style>${SEITENSTIL}</style>
</head><body>
<h1>Alle ${gemalt.length} Zeichnungen</h1>
<p class="messstelle">Echte Karten, echtes Stilblatt — dieselbe
<code>.engkarte</code> und dieselbe <code>.wortbild</code> wie im Spiel, die
Größe aus der Medienabfrage <code>(max-height:440px), (max-width:430px)</code>.
<span class="jetzt-quer">Gerade gilt die kurze Form: <strong>64 Punkte</strong>
je Zeichnung — das ist die Größe auf dem iPhone quer.</span><span
class="jetzt-hoch">Gerade gilt die lange Form: <strong>76 Punkte</strong> je
Zeichnung. Das Zielgerät ist das iPhone <em>quer</em> — dreh es, dann zeigt
diese Zeile 64.</span><br>
Die Wörter stehen mit Absicht nicht da: wer das Wort liest, erkennt jede
Zeichnung.</p>
<label class="schalter"><input type="checkbox" id="woerter"> Wörter zeigen</label>
<div class="feld">${karten}</div>
</body></html>
`;
}

/* Als Werkzeug aufgerufen: Seite schreiben. Als Modul geladen: nur die
   beiden Funktionen. */
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const ziel = process.argv[2];
  if (!ziel) { console.error('  Aufruf: node tools/bilderseite.mjs <zieldatei.html>'); process.exit(1); }
  fs.mkdirSync(path.dirname(path.resolve(ziel)), { recursive: true });
  const html = bilderSeite();
  fs.writeFileSync(ziel, html);
  console.log(`  Bilderseite: ${path.relative(WURZEL, path.resolve(ziel))} `
    + `(${(html.length / 1024).toFixed(0)} kB, ${
      EN.BILDER.filter(b => b.bild).length} Zeichnungen)`);
}
