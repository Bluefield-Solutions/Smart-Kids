// Die Proben — die LISTE, getrennt vom Laeufer.
//
// Sie stand mitten in `tor/proben.mjs`, und `tor/rhythmus.mjs` musste sich
// die Namen mit einem Ausdruck aus dem Quelltext klauben
// (`/^\s*\{ n:'([^']+)'/gm`). Das hat schon einmal danebengegriffen: ohne
// den Zeilenanfang zaehlte er einen Namen aus einem KOMMENTAR mit und
// meldete siebzig Proben, wo neunundsechzig standen.
//
// Jetzt liest jeder, der etwas ueber die Proben wissen will, dieselbe
// Liste — als Daten, nicht als Text. Das ist die Voraussetzung fuer die
// Pruefung in `inhalt`: findet jede Probe ihren Suchtext ueberhaupt noch?
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';

/* ---------------------------------------------------------------------- *
 * Die Proben.
 *
 * `tor`      welches npm-Skript gefahren wird
 * `datei`    was angefasst wird
 * `such`/`ersatz`  der Eingriff, als reine Textersetzung
 * `an`       Datei, in der der Eingriff ankommen MUSS, samt Erkennungstext
 * `bauen`    ob vorher gebaut werden muss (Tore, die `dist/` lesen)
 * `umgebung` Umgebungsvariablen, die SELBST der Eingriff sind - nur im
 *            Lauf mit Eingriff gesetzt
 * `stets`    Umgebungsvariablen, die den RAHMEN stellen - in beiden
 *            Laeufen gesetzt, damit sich gesund und krank nur im Eingriff
 *            unterscheiden
 * `sagt`     ein Stueck der Meldung, die das Tor bringen soll
 * ---------------------------------------------------------------------- */
export const D = 'prototyp/spiel.js', V = 'prototyp/vorlage.html', E = 'src/inhalt/erdkunde.js';
/** Die Abzeichentafel (D2). */
export const A = 'src/inhalt/abzeichen.js';
/** Die Buchstabenvorlagen samt Erkennung (N2a). */
export const S = 'src/inhalt/schreiben.js';
/** Rauschen, das kein Packer kleinbekommt - aber bei jedem Lauf dasselbe.
 *
 * Hier stand `x = (x * 1103515245 + 12345) & 0x7fffffff` - in
 * JavaScript-Gleitkomma gerechnet. Das Produkt sprengt 2^53, wird gerundet,
 * und der Generator laeuft in einen kurzen Zyklus: 24 000 Zeichen
 * schrumpften im Packer auf 10,1 KB, wo 62 Symbole rund 18 hergeben. Das
 * hiess: die Fuellung war zur Haelfte Muster, und die Probe spritzte halb
 * soviel ein, wie ihr Name behauptete.
 * `Math.imul` haelt die Rechnung in 32 Bit und ganzzahlig.
 */
function rauschen(n) {
  const z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let x = 1234567, aus = '';
  for (let i = 0; i < n; i++) { x = (Math.imul(x, 1103515245) + 12345) | 0;
    aus += z[((x >>> 7) & 0x7fffffff) % z.length]; }
  return aus;
}

/** So viel Fuellstoff, dass er GEPACKT die Zielgroesse ueberschreitet.
 *
 * Nicht geschaetzt, sondern gemessen: erzeugen, packen, nachlegen. Wieviel
 * ein Packer aus 62 Symbolen macht, ist eine Annahme - und Annahmen sind
 * genau die Sorte Zahl, die hier schon einmal falsch war.
 */
function fuellstoff(zielBytes) {
  let n = Math.ceil(zielBytes * 1.4);
  for (let i = 0; i < 8; i++) {
    const st = rauschen(n);
    const gz = zlib.gzipSync(Buffer.from(st), { level: 9 }).length;
    if (gz >= zielBytes) return st;
    n = Math.ceil(n * (zielBytes / gz) * 1.08);
  }
  throw new Error('fuellstoff: die Zielgroesse ist in acht Anlaeufen nicht erreicht');
}

/* Wieviel eingespritzt wird, haengt am STAND - nicht an einer festen Zahl.
 *
 * Regel 2, woertlich: Grenzen anteilig, nie absolut. Hier stand
 * `rauschen(24000)`. Gegen den Stand von 208 KB waren das +11,5 %, gegen
 * den von 232 KB nur noch +4,4 % - und die Ratsche fragt ab 5 %. Die Probe
 * hatte also aufgehoert zu beweisen, ohne dass irgendetwas rot geworden
 * waere. Gefunden hat es nicht sie selbst, sondern die Berichtszeile, die
 * P5 in derselben Runde hinzugefuegt hat: "+4.4 % seit der Bestaetigung -
 * noch 0.6 % bis zur Frage".
 *
 * Gerechnet wird gegen `bestaetigt.start`, also gegen genau die Zahl, mit
 * der das Tor vergleicht. Ein Zehntel davon liegt sicher ueber den fuenf
 * Prozent - und bleibt es, wie gross die App auch wird.
 */
const RATSCHE = JSON.parse(fs.readFileSync(
  path.join(path.dirname(new URL(import.meta.url).pathname), 'budget-stand.json'), 'utf8'));
const FUELLUNG = fuellstoff(Math.round(RATSCHE.bestaetigt.start * 1024 * 0.10));

/** Der aelteste Commit im Baum - weiter zurueck geht es nicht. */
const wurzelCommit = () => execSync('git rev-list --max-parents=0 HEAD', { encoding:'utf8' })
  .trim().split('\n')[0];
export const DIST = { datei: 'dist/index.html' };

export const PROBEN = [
  /* --- inhalt ------------------------------------------------------- */
  { n:'zwei Gebiete mit derselben ID', tor:'inhalt', deckt:'inhalt', datei:E,
    such:"{ id:'afrika', name:'Afrika'", ersatz:"{ id:'europa', name:'Afrika'",
    an:{ datei:E, text:"{ id:'europa', name:'Afrika'" }, sagt:'doppelte ID' },

  /* Ein Ausschnitt, den niemand erklaert hat (A6).
   *
   * `LAENDER` ist nach KARTEN geordnet; fuenf Schluessel sind Kontinente,
   * einer ist ein Ausschnitt. Das Tor laesst einen Schluessel nur durch,
   * wenn er das eine oder das andere IST - sonst wuerde ein Tippfehler im
   * Schluessel eine stille zusaetzliche Ebene erzeugen, die kein Kind
   * findet. Diese Probe nimmt die Erklaerung weg. */
  { n:'ein Kartenschlüssel ist weder Kontinent noch erklärter Ausschnitt',
    tor:'inhalt', deckt:'inhalt', datei:E,
    such:"export const AUSSCHNITTE = { mittelamerika: 'nordamerika' };",
    ersatz:"export const AUSSCHNITTE = {};",
    an:{ datei:E, text:'export const AUSSCHNITTE = {};' },
    sagt:'Elternknoten' },

  /* --- topologie ---------------------------------------------------- */
  { n:'ein Anker liegt außerhalb seines Gebiets', tor:'inhalt', deckt:'topologie', datei:'src/geo/staedte.js',
    such:'"anker":[804.7,703]', ersatz:'"anker":[5,5]',
    an:{ datei:'src/geo/staedte.js', text:'"anker":[5,5]' }, sagt:'außerhalb' },

  /* Und derselbe Fehler EINEN Schritt subtiler: der Anker im LOCH.
   *
   * Die Probe darueber schiebt ihn nach [5,5], weit vor die Kueste - das
   * hat auch die alte Fassung des Tores gefunden, die nur gegen den
   * Aussenring prueft. Genau deshalb bewies sie nichts ueber den Fall,
   * der wirklich eingetreten ist: Brandenburgs Anker lag in BERLIN, also
   * im Aussenring und im Loch. Das Tor meldete „0 Anker ausserhalb",
   * waehrend „Brandenburg" auf Brandenburgs beste Stelle gezogen mit
   * „Das ist Berlin." beantwortet wurde.
   *
   * Der eingesetzte Wert ist der Anker, der bis v-D2 wirklich in den
   * Daten stand. Eine Probe mit dem echten alten Fehler - nicht mit einem
   * ausgedachten. */
  { n:'ein Anker liegt im Loch seines Gebiets', tor:'inhalt', deckt:'topologie', datei:'src/geo/staedte.js',
    such:'"name":"Brandenburg","hauptstadt":"Potsdam","stadtstaat":false,"ort":[780.6,462.2],"anker":[874,537.7]',
    ersatz:'"name":"Brandenburg","hauptstadt":"Potsdam","stadtstaat":false,"ort":[780.6,462.2],"anker":[804.7,446.1]',
    an:{ datei:'src/geo/staedte.js', text:'"anker":[804.7,446.1]' }, sagt:'außerhalb' },

  /* Und die andere Haelfte des Prueflaufs: die sechsundsechzig Gebiete,
   * die NICHT Deutschland sind.
   *
   * Bis F17 sah `topologie` nur `STAEDTE` an - sechs Kontinente und
   * sechzig Laender hatten ebenfalls einen Anker, und keiner pruefte ihn.
   * Diese Probe nimmt einem gespielten Land den Umriss: dann ist auch
   * sein Anker weg, und ohne Anker gibt es weder Zeiger noch Haekchen
   * noch Trefferflaeche. Bleibt das Tor gruen, laeuft die Schleife gar
   * nicht ueber die Laender - und die neue Reichweite waere Zierde.
   */
  /* --- Die Hauptstaedte (P11) ------------------------------------------
   *
   * Der Fehler, der eine ganze Runde ueberlebt hat: fuenf Laender standen
   * in `erdkunde.js` und waren ohne `rang` gebacken - das Tor las den
   * GEBACKENEN Rang, sah sie also gar nicht und meldete gruen. Wer den
   * Vorrat nach dem Vorrat fragt, bekommt immer ja.
   *
   * Diese Probe stellt genau das her: ein Land, das gespielt wird und
   * nicht gebacken ist. */
  { n:'ein gespieltes Land ist gar nicht gebacken', tor:'inhalt', deckt:'inhalt',
    datei:E,
    such:"    { a3:'GRC', name:'Griechenland', rang:17,",
    ersatz:"    { a3:'GRX', name:'Griechenland', rang:17,",
    an:{ datei:E, text:"a3:'GRX'" },
    sagt:'wird gespielt und ist nicht gebacken' },

  { n:'ein gespieltes Land verliert seinen Umriss', tor:'inhalt', deckt:'topologie',
    datei:'src/geo/laender-europa.grob.js',
    /* Ohne den Rang: er steht seit P11 in `erdkunde.js` und wird von dort
       gebacken - Italien ist von 5 auf 13 gerueckt, und diese Probe
       zielte danach ins Leere. Gesucht wird jetzt, was sich nicht
       aendert, wenn jemand die Lerntiefe umsortiert. */
    suchRegex: /"a3":"ITA","name":"Italien","rang":\d+,"teile":\d+,"loecher":\d+,"pfad":"[^"]*"/,
    ersatzFn: (m) => m[0].replace(/"pfad":"[^"]*"/, '"pfad":""'),
    an:{ datei:'src/geo/laender-europa.grob.js', text:'"pfad":""' },
    sagt:'keinen brauchbaren Anker' },

  /* --- beruehrung --------------------------------------------------- */
  // Bremen ist mit 9,4 pt das kleinste Gebiet ueberhaupt - ohne Anker
  // bekommt es keinen Trefferkreis und ist mit dem Finger nirgends zu
  // fassen. Es stuende in den Daten, waere gezaehlt, laege auf der Karte
  // und liesse sich nicht spielen.
  { n:'das kleinste Gebiet verliert seinen Anker', tor:'inhalt', deckt:'beruehrung', datei:'src/geo/staedte.js',
    such:'"name":"Bremen","hauptstadt":"Bremen","stadtstaat":true,"ort":[330.2,346.7],"anker":[328.7,341.2]',
    ersatz:'"name":"Bremen","hauptstadt":"Bremen","stadtstaat":true,"ort":[330.2,346.7],"anker":null',
    an:{ datei:'src/geo/staedte.js', text:'"anker":null' }, sagt:'keinen brauchbaren Anker' },

  /* --- marken ------------------------------------------------------- */
  { n:'eine Farbe am Markensystem vorbei', tor:'inhalt', deckt:'marken', datei:V,
    such:'.frage .richtigText{color:var(--gut)}',
    ersatz:'.frage .richtigText{color:#c0392b}',
    an:{ datei:V, text:'#c0392b' }, sagt:'am System vorbei' },

  // Eine benutzte Marke, die es nicht gibt. Der Originalfehler: `--r5` stand
  // im `padding` des gezogenen Schilds und war nie definiert. Eine
  // ungueltige var() macht die GANZE Deklaration ungueltig - das Schild
  // hatte gar keine Polsterung mehr, und drei Tore sahen nichts davon.
  { n:'eine benutzte Marke gibt es nicht', tor:'inhalt', deckt:'marken', datei:V,
    such:'.sterne{display:flex;gap:var(--r1)}',
    ersatz:'.sterne{display:flex;gap:var(--gibtsnicht)}',
    an:{ datei:V, text:'var(--gibtsnicht)' },
    sagt:'nirgends gesetzt' },

  // Eine der sieben Flaechenfarben wieder festnageln. Sie leiten sich aus
  // --flaeche-l/--flaeche-c ab; wer eine einzelne festschreibt, haengt sie
  // still vom System ab - und genau so standen die Werte vorher, siebenmal
  // ausgeschrieben neben zwei Marken, die nie jemand las.
  { n:'eine Flächenfarbe hängt sich vom System ab', tor:'inhalt', deckt:'marken',
    datei:'src/marken/marken.css',
    such:'  --f3: oklch(var(--flaeche-l) var(--flaeche-c) 130);',
    ersatz:'  --f3: oklch(0.74 0.135 130);',
    an:{ datei:'src/marken/marken.css', text:'--f3: oklch(0.74 0.135 130);' },
    sagt:'leiten sich aus' },

  /* --- schrift ------------------------------------------------------ */
  /* Eindeutig: der Satz steht ZWEIMAL in spiel.js - einmal als Text im
     Hinweis, einmal als Ansage. Welcher der beiden getroffen wurde, hing
     an ihrer Reihenfolge. Fuer diese Probe ist es einerlei, welcher das
     Zeichen bekommt - aber ein Suchtext, der zwei Stellen trifft, ist
     genau die Sorte, die beim naechsten Umbau lautlos die andere trifft. */
  { n:'ein Zeichen außerhalb des geladenen Schnitts', tor:'inhalt', deckt:'schrift', datei:D,
    such:"h.textContent='Lass es auf dem Land los.'",
    ersatz:"h.textContent='Lass es auf dem Land los. ☞'",
    an:{ datei:D, text:'☞' }, sagt:'ohne Schrift' },

  /* --- symbol ------------------------------------------------------- */
  { n:'das App-Symbol hat die falsche Größe', tor:'inhalt', deckt:'symbol',
    kopie:['src/symbol/symbol-512.png', 'src/symbol/symbol-180.png'],
    datei:'src/symbol/symbol-180.png',
    an:{ gleichWie:['src/symbol/symbol-512.png','src/symbol/symbol-180.png'] },
    sagt:'symbol-180' },

  /* Der Stern laeuft in die iOS-Maske (A7).
   *
   * Genau so ist der erste Entwurf ausgesehen: bei 0,62 der Kugelhoehe
   * stand die obere Zacke aus dem Bild heraus. Die alte Eckpruefung
   * verglich mit der KUGELMITTE und war deshalb gruen - der Stern ist
   * gelb, also „nicht wie die Mitte". Gefunden hat es das Auge, nicht das
   * Tor.
   *
   * Der Eingriff sitzt in der SVG, nicht im Werkzeug, und gebaut wird mit
   * `bauen:'symbol:png'`. Beides hat einen Grund: `npm run symbol` rechnet
   * die Kueste aus `roh/` neu, und `roh/` liegt nicht in Git - in der
   * Wegwerf-Kopie, in der die Proben arbeiten, gibt es sie nicht. Der
   * erste Anlauf ist genau daran gestorben, und zwar STUMM: der
   * Wiederaufbau warf, der Teillauf hinterliess kein Ergebnis, und
   * gemeldet wurde „ein Teillauf hat kein Ergebnis hinterlassen".
   *
   * `symbol:png` backt nur die PNG aus der vorhandenen SVG. Das ist
   * genau der Schritt, der zwischen Eingriff und Tor liegt. */
  { n:'der Stern des Symbols läuft in die iOS-Maske', tor:'inhalt', deckt:'symbol',
    bauen:'symbol:png', datei:'src/symbol/symbol.svg',
    suchRegex:/(rotate\(14\) scale\()[\d.]+\)/,
    ersatzFn:m => m[1] + '9.0)',
    an:{ datei:'src/symbol/symbol.svg', text:'rotate(14) scale(9.0)' },
    sagt:'springt die Farbe' },

  /* --- doku --------------------------------------------------------- */
  { n:'das Konzept nennt eine andere Gebietszahl', tor:'inhalt', deckt:'doku',
    datei:'docs/Lernkiste-KONZEPT.md',
    suchRegex:/Gebiete gesamt \| \*\*(\d+)\*\*/, ersatzFn:(m)=>`Gebiete gesamt | **${+m[1]+7}**`,
    an:{ datei:'docs/Lernkiste-KONZEPT.md', regex:/Gebiete gesamt \| \*\*\d+\*\*/ },
    sagt:'Konzept sagt' },

  // Die Kette in CLAUDE.md gegen die Kette in package.json. Der
  // Originalfehler: die Datei lag sechs Tore zurueck - und sie wird zu
  // Beginn JEDER Sitzung gelesen.
  { n:'CLAUDE.md verschweigt ein Tor der Kette', tor:'inhalt', deckt:'doku',
    datei:'CLAUDE.md',
    such:'`schrift` · `symbol` · `doku` → `regeln` → `doppelt` → `spielprobe` → `schreiben` → `vergleich` →\n`gleichlauf` → `bauen` →',
    ersatz:'`schrift` · `symbol` · `doku` → `vergleich` → `bauen` →',
    an:{ datei:'CLAUDE.md', fehlt:'`doku` → `regeln`' },
    sagt:'Tore der Kette nicht' },

  // Die Vorschau verschweigt ein Tor, das sie nicht faehrt. Der gefaehrlichste
  // Fall an der ganzen Abkuerzung: wer eine Vorschau ansieht, in der `smoke`
  // nicht genannt ist, haelt sie fuer durchgespielt.
  { n:'die Vorschau verschweigt ein Tor, das sie nicht fährt', tor:'inhalt', deckt:'doku',
    datei:'.github/workflows/vorschau.yml',
    such:'#     smoke        spielt die App wirklich durch',
    ersatz:'#',
    an:{ datei:'.github/workflows/vorschau.yml', fehlt:'smoke        spielt' },
    sagt:'verschweigt' },

  // Und der Fall darunter: die Vorschau laeuft auf `main`. Dann geht
  // Ungeprueftes dorthin, wo die Kinder spielen.
  { n:'die Vorschau läuft auf main', tor:'inhalt', deckt:'doku',
    datei:'.github/workflows/vorschau.yml',
    such:'    branches: [vorschau]', ersatz:'    branches: [vorschau, main]',
    an:{ datei:'.github/workflows/vorschau.yml', text:'[vorschau, main]' },
    sagt:'läuft auf `main`' },

  // Ein Ablauf laedt nach Pages hoch, ohne die Seite zusammenzustellen.
  // Pages kennt eine Seite je Verzeichnis: er loescht damit die andere
  // Haelfte - die Auslieferung die Vorschau, oder umgekehrt.
  { n:'ein Ablauf schickt nur seine halbe Seite nach Pages', tor:'inhalt', deckt:'doku',
    datei:'.github/workflows/auslieferung.yml',
    such:'        run: node tools/seite-zusammenstellen.mjs',
    ersatz:'        run: echo uebersprungen',
    an:{ datei:'.github/workflows/auslieferung.yml', fehlt:'run: node tools/seite-zusammenstellen.mjs' },
    sagt:'ohne die Seite zusammenzustellen' },

  // Der Versand der Vorschau sieht nicht mehr nach, ob dieser Stand von
  // main die Kette bestanden hat. Er baut main neu, ohne sie zu fahren -
  // ohne die Nachfrage koennte eine Vorschau einen roten Stand unter `/`
  // schieben, und niemand wuerde es merken.
  // Der Eingriff zielt auf die WIRKUNG, nicht mehr auf den Blick.
  //
  // Frueher stand hier eine Zeile aus dem alten Pruefschritt (`n=$(gh api
  // ...)`). Als der Ablauf umgebaut wurde - er wartet jetzt und bleibt bei
  // rotem `main` still stehen, statt durchzufallen -, gab es diese Zeile
  // nicht mehr, und die Probe kam zwoelf Runden lang gar nicht an. Genau
  // das ist Regel 5: wer ein Tor aendert, traegt seine Gegenprobe nach.
  { n:'die Vorschau schiebt einen ungeprüften Stand unter /', tor:'inhalt', deckt:'doku',
    datei:'.github/workflows/vorschau-versand.yml',
    such:"      - id: pages\n        if: steps.kette.outputs.gruen == 'ja'\n        uses: actions/deploy-pages@v4",
    ersatz:'      - id: pages\n        uses: actions/deploy-pages@v4',
    an:{ datei:'.github/workflows/vorschau-versand.yml',
         regex:/- id: pages\n        uses: actions\/deploy-pages/ },
    sagt:'hängt nicht am Ergebnis der Torkette' },

  /* --- Rechnen ------------------------------------------------------ */
  // Der Vorrat und der Abgleich laufen auseinander. Genau dafuer stehen die
  // Zahlen im Dokument und nicht im Code.
  { n:'der Zahlenraum im Code stimmt nicht mehr mit dem Abgleich', tor:'inhalt', deckt:'doku',
    datei:'src/inhalt/rechnen.js',
    such:'export const BIS = 10;', ersatz:'export const BIS = 12;',
    an:{ datei:'src/inhalt/rechnen.js', text:'export const BIS = 12;' },
    sagt:'der Abgleich sagt' },

  // Die Null als Summand. „Wenig mit 0" ist zu einer Regel geworden - wer
  // sie aufweicht, bekommt 21 von 66 Additionen mit einer Null.
  { n:'die Null wird wieder Summand', tor:'inhalt', deckt:'doku',
    datei:'src/inhalt/rechnen.js',
    such:'    for (let b = 1; a + b <= bis; b++) aus.push(aufgabe(\'plus\', a, b));',
    ersatz:'    for (let b = 0; a + b <= bis; b++) aus.push(aufgabe(\'plus\', a, b));',
    an:{ datei:'src/inhalt/rechnen.js', text:'for (let b = 0; a + b <= bis' },
    sagt:'nur als Ergebnis' },

  // Ein Ablenker, der zufaellig die richtige Antwort ist. Vier
  // Moeglichkeiten, zwei davon richtig - und das Kind bekommt „falsch" auf
  // eine Zahl, die stimmt.
  // Angefasst wird der Riegel im AUFFUELLEN, nicht der in der ersten
  // Schleife. Der erste greift bei b >= 1 nie: ±1 und ±2 sind nie das
  // Ergebnis, und die Gegenrechnung ist es nur bei b = 0 - was der Vorrat
  // ausschliesst. Er steht trotzdem zu Recht dort (die Probe darueber
  // laesst die Null wieder als Summanden zu, und dann greift er sofort) -
  // aber probieren laesst er sich nur zusammen mit ihr. Der zweite Riegel
  // ist unbedingt lebendig: bei `10 - 10 = 0` bleiben nach ±1, ±2 und der
  // Gegenrechnung nur zwei Zahlen uebrig, und aufgefuellt wird ab 0 - also
  // genau mit der richtigen Antwort.
  { n:'eine falsche Möglichkeit ist die richtige Antwort', tor:'spielprobe',
    datei:'src/inhalt/rechnen.js',
    such:'    if (k !== auf.wert && !aus.includes(k)) aus.push(k);',
    ersatz:'    if (!aus.includes(k)) aus.push(k);',
    an:{ datei:'src/inhalt/rechnen.js', fehlt:'if (k !== auf.wert && !aus.includes(k))' },
    sagt:'ist die richtige' },

  // Fionas Rechenkachel steht auch bei Lea. Eine davon ist die falsche.
  /* Der Eingriff kam eine Weile lang NICHT an, und die Probe hat es
   * selbst gemeldet: `fehlt: "wer:['fiona']"` konnte nie zutreffen, weil
   * dieser Text seit der Schreibwelt SECHSMAL in `dist` steht - fuenf
   * bleiben stehen, wenn man einen entfernt. Ein Eingriff, der nicht
   * ankommt, sieht aus wie ein bestandenes Tor; hier hat nur der
   * Ankunftstest davor bewahrt. Jetzt am ganzen Satz verankert, der genau
   * einmal vorkommt. */
  { n:'die Rechenebene gehört plötzlich beiden Kindern', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"    art:'rechnen', wer:['fiona'], mischung: Rechnen.MISCHUNG_FIONA },",
    ersatz:"    art:'rechnen', mischung: Rechnen.MISCHUNG_FIONA },",
    an:{ ...DIST, fehlt:"art:'rechnen', wer:['fiona']" },
    sagt:'gehört fiona' },

  /* Und die Weiche selbst: ohne sie landet die Rechenaufgabe auf dem
   * Kartenbildschirm, und der sucht eine Karte, die es nicht gibt.
   *
   * Der Eingriff sass frueher an der Stelle in `starten()`. Mit der
   * dritten Sorte (Schreiben, N2a) steht die Weiche als `schirmZu` an
   * EINER Stelle - der Eingriff sitzt jetzt dort, und er trifft damit
   * alle drei Wege statt einen. */
  { n:'die Rechenaufgabe landet auf dem Kartenbildschirm', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"const schirmZu = (ebeneId) => ({ rechnen: rechenschirm, schreiben: schreibschirm }",
    ersatz:"const schirmZu = (ebeneId) => ({ }",
    an:{ ...DIST, fehlt:"rechnen: rechenschirm" },
    sagt:'durchgang' },

  /* --- pwa: der Lagername ------------------------------------------- */
  // Zurueck auf einen festen Lagernamen. Dann raeumt jede Installation der
  // anderen den Offline-Vorrat ab - die Vorschau dem Spiel der Kinder.
  { n:'der Lagername vergisst den Ort', tor:'pwa', bauen:true, datei:'prototyp/pwa/sw.js',
    such:"const SIPPE = 'smart-kids' + new URL('./', self.location).pathname.replace(/\\//g, '-');",
    ersatz:"const SIPPE = 'smart-kids-';",
    an:{ datei:'prototyp/pwa/sw.js', text:"const SIPPE = 'smart-kids-';" },
    sagt:'self.location' },

  /* --- spielprobe --------------------------------------------------- */
  // Nicht "einen Alias aus den Daten nehmen" - das ist eine erlaubte
  // Datenaenderung, und das Tor prueft zu Recht nur, was DASTEHT. Der
  // Fehler, den es fangen soll, ist der aus der Spielerrunde: die
  // Rechtschreibpruefung bekam nur den kanonischen Namen, und deshalb war
  // „Australien" getippt falsch, obwohl es als Alias eingetragen war.
  { n:'beim Tippen zählt kein Alias mehr', tor:'spielprobe',
    datei:'src/vergleich/vergleich.js',
    such:'    : [ziel.name, ...(ziel.aliasse || [])].filter(Boolean);',
    ersatz:'    : [ziel.name];',
    an:{ datei:'src/vergleich/vergleich.js', text:'    : [ziel.name];' },
    sagt:'getippt' },

  /* --- vergleich ---------------------------------------------------- */
  { n:'der Sprachabgleich erkennt nichts mehr', tor:'vergleich',
    datei:'src/vergleich/vergleich.js',
    such:'export function abgleich(eingabe, kandidaten) {',
    ersatz:"export function abgleich(eingabe, kandidaten) {\n  if (1) return { art:'nochmal' };",
    an:{ datei:'src/vergleich/vergleich.js', text:"if (1) return { art:'nochmal' };" },
    sagt:'Trefferquote' },

  /* --- passt -------------------------------------------------------- */
  { n:'ein Knopf ist breiter als das Fenster', tor:'passt', args:['--teil=0/5'], bauen:true, datei:D,
    such:"const weiter = el('button','leise');",
    ersatz:"const weiter = el('button','leise'); weiter.style.minWidth='900px';",
    an:{ ...DIST, text:"minWidth='900px'" }, sagt:'über den Rand' },

  // Der sichere Bereich. Der Fehler war nicht „zu wenig Abstand", sondern
  // dass das Polster GAR NICHT wirkte: es stand auf `body`, waehrend die
  // Buehne absolut am Fenster hing. Genau das wird hier nachgestellt.
  { n:'die Bühne beachtet den sicheren Bereich nicht', tor:'passt', args:['--teil=1/5'], bauen:true, datei:V,
    such:'  top:var(--sicher-oben); right:var(--sicher-rechts);',
    ersatz:'  top:0; right:0;',
    an:{ ...DIST, fehlt:'top:var(--sicher-oben)' },
    sagt:'im Bereich des Telefons' },

  // Zwei Kacheln liegen aufeinander.
  //
  // Der erste Anlauf schob die Kachel um 4 px - und das Tor blieb gruen,
  // ZU RECHT: die Luecke zwischen den Reihen ist groesser als 4 px, es
  // ueberlappte gar nichts. Ein Eingriff, der nichts bewirkt, sieht aus
  // wie ein bestandenes Tor (Regel 10). 60 px liegen sicher drueber.
  /* ---- Audit A: die zwei neuen Pruefungen in `passt` ---------------- */

  // Ein Kasten schneidet seinen eigenen Inhalt ab. Gefunden wurde das im
  // Forscherbuch (unter jedem Rechen-Aufkleber fehlte die halbe Zeile,
  // 11 Punkte Kasten fuer 19 Punkte Zeile) - aber `passt` sieht dort ein
  // LEERES Buch, weil sein Durchgang keine Aufkleber sammelt. Geprobt
  // wird deshalb an einem Kasten, den es wirklich sieht: die Marke traegt
  // `overflow:hidden` und keine eigene Zeilenhoehe.
  { n:'ein Kasten schneidet seine Schrift ab', tor:'passt', args:['--teil=1/5'],
    bauen:true, datei:V,
    such:'.marke{font-family:var(--f-ui);font-size:var(--s0);font-weight:700;color:var(--tinte-2);',
    ersatz:'.marke{font-family:var(--f-ui);font-size:var(--s0);font-weight:700;color:var(--tinte-2);line-height:.6;',
    an:{ ...DIST, text:'color:var(--tinte-2);line-height:.6;' },
    sagt:'wird abgeschnitten' },

  /* Die Lupenknoepfe liegen wieder AUF der Karte - der Zustand vor Q33.
   *
   * Der erste Anlauf setzte nur `position:absolute` im Stilblatt. Das
   * stellt den alten Zustand NICHT her: die Knoepfe haengen seit Q33 in
   * der Werkzeugspalte, und absolut positioniert suchen sie sich den
   * naechsten positionierten Vorfahren - also nicht die Karte. Sie landen
   * am Bildrand, verdecken nichts, und `passt` bleibt zu Recht gruen. Eine
   * Gegenprobe, die den Fehler nicht wirklich einbaut, beweist nichts.
   *
   * Jetzt haengt der Eingriff sie dorthin zurueck, wo sie waren, und gibt
   * ihnen dieselbe Lage. */
  { n:'die Lupenknöpfe liegen wieder auf der Karte', tor:'passt',
    args:['--teil=1/5'], bauen:true, datei:D,
    such:'  werkzeug.appendChild(lupen);',
    ersatz:'  lupen.style.cssText = "position:absolute;right:8px;bottom:8px;'
         + 'display:flex;flex-direction:column;gap:8px;z-index:2";\n'
         + '  s.querySelector(".karte").appendChild(lupen);',
    an:{ ...DIST, text:'s.querySelector(".karte").appendChild(lupen)' },
    sagt:'liegt auf der Karte' },

  { n:'zwei Kacheln liegen aufeinander', tor:'passt', args:['--teil=0/5'], bauen:true, datei:V,
    such:'.kachel.welt .name{font-size:var(--s3)}',
    ersatz:'.kachel.welt .name{font-size:var(--s3)}\n.wahl .kachelpaar:first-child{translate:0 60px}',
    an:{ ...DIST, text:'translate:0 60px' }, sagt:'ueberlappen sich' },

  // Das Forscherbuch war fuer `passt` unsichtbar: `.aufkleber` stand nicht
  // in seiner Auswahl. Diese Probe schiebt eine Aufkleberkarte aus dem
  // Fenster - ohne den Eintrag in der Auswahl bleibt das Tor gruen.
  { n:'eine Aufkleberkarte liegt außerhalb des Fensters', tor:'passt', args:['--teil=0/5'], bauen:true, datei:V,
    such:'.aufkleber.da{opacity:1}',
    ersatz:'.aufkleber.da{opacity:1}\n.rollen .aufkleber:first-child{position:relative;left:-500px}',
    an:{ ...DIST, text:'left:-500px' }, sagt:'über den Rand' },

  /* --- lesbarkeit --------------------------------------------------- */
  // Die DECKUNG der Vorfahren gehoert in die Kontrastrechnung.
  //
  // `opacity` wirkt auf den Teilbaum, steht im `computedStyle` des Kindes
  // aber als 1. Ohne diese Rechnung meldete das Tor 7,4:1 fuer eine
  // Schrift, die das Auge bei 3,3:1 sieht. Und die Probe prueft zugleich,
  // dass der Rundgang das FORSCHERBUCH ueberhaupt erreicht - bis R2 endete
  // er nach vier von neun Bildschirmen.
  { n:'die Deckung der Vorfahren zählt beim Kontrast nicht', tor:'lesbarkeit', bauen:true, datei:V,
    such:'  gap:var(--r1);cursor:pointer;opacity:.72}',
    ersatz:'  gap:var(--r1);cursor:pointer;opacity:.12}',
    an:{ ...DIST, text:'cursor:pointer;opacity:.12' }, sagt:':1' },

  // Das Wasserzeichen unter der Schrift.
  //
  // `lesbarkeit` lief den ELTERNBAUM hoch und sah damit nie, was als
  // GESCHWISTER hinter dem Text liegt. Diese Probe faerbt den Umriss
  // schwarz und deckend: steht er nicht in der Rechnung, aendert sich am
  // gemeldeten Kontrast nichts - und das Tor bezeugt etwas, das es nie
  // geprueft hat (Regel 1).
  { n:'das Wasserzeichen unter der Schrift zählt nicht', tor:'lesbarkeit', bauen:true, datei:V,
    such:'  height:86%;max-width:52%;opacity:.34;pointer-events:none;color:var(--ton)}',
    ersatz:'  height:86%;max-width:52%;opacity:1;pointer-events:none;color:#000}',
    an:{ ...DIST, text:'opacity:1;pointer-events:none;color:#000' }, sagt:':1' },

  /* Und der Streu unter der Schrift (G12).
   *
   * Das Tor zaehlt seit G12 nicht mehr den KASTEN der Streuschicht,
   * sondern die Motive darin - der Kasten hat weder Hintergrund noch
   * gemalte Farbe, und `cs.color` lieferte dort die geerbte Tinte, die
   * nirgends auf dem Bild steht. Sechs lesbare Texte waren rot.
   *
   * Wer ein Tor nachgibt, muss zeigen, dass es noch anschlaegt. Diese
   * Probe faerbt die Motive schwarz und deckend: bleibt das Tor gruen,
   * hat die Nachgabe die Pruefung mit erledigt (Regel 1). */
  { n:'der Streu unter der Schrift zählt nicht', tor:'lesbarkeit', bauen:true, datei:V,
    such:'.kachel .streu i{position:absolute;line-height:0;display:block;',
    ersatz:'.kachel .streu i{position:absolute;line-height:0;display:block;'
      + 'color:#000!important;opacity:1;background:#000;',
    an:{ ...DIST, text:'color:#000!important;opacity:1;background:#000;' }, sagt:':1' },

  { n:'kleiner Text wird zu hell', tor:'lesbarkeit', bauen:true, datei:'src/marken/marken.css',
    such:'--tinte-2:  oklch(0.46  0.030 250)', ersatz:'--tinte-2:  oklch(0.86  0.030 250)',
    an:{ ...DIST, text:'oklch(0.86  0.030 250)' }, sagt:':1' },

  /* Die kleine Zeile auf der Profilkachel steht wieder auf dem Streu (Q14).
   *
   * Sie hat seit Q14 ihren eigenen Grund - denselben wie die Kachel -,
   * damit der Kontrast nicht davon abhaengt, welches Motiv gerade unter
   * ihr liegt. Ohne den lag auf dem Runner der blaue Fisch darunter:
   * 4,32:1 statt 4,5, und die Auslieferung war rot, waehrend hier alles
   * gruen war. Der Eingriff nimmt den Grund wieder weg. */
  { n:'die Profilzeile steht wieder auf dem Streu', tor:'lesbarkeit', bauen:true, datei:V,
    such:'.kachel:has(.streu) .rolle{color:var(--tinte);\n  background:var(--kachelgrund);',
    ersatz:'.kachel:has(.streu) .rolle{color:var(--tinte);\n  background:none;',
    an:{ ...DIST, text:'.kachel:has(.streu) .rolle{color:var(--tinte);\n  background:none;' },
    sagt:':1' },

  /* --- Der Fassungsstempel (Q13) --------------------------------------- *
   *
   * Er steht seit Q13 auf JEDEM Bildschirm und beantwortet die einzige
   * Frage, die sich am Geraet sonst nicht beantworten laesst: laeuft hier
   * schon die neue Fassung? Drei Zusagen haengen daran, und jede hat
   * ihre Probe.
   *
   * 1. Er wird auf Kontrast gemessen. Er liegt NEBEN der Buehne, und
   *    `lesbarkeit` lief bis Q13 nur ueber `.schirm.da *` - ein Text auf
   *    jedem Bildschirm, den kein Tor ansieht, waere genau die Luecke,
   *    die Regel 1 meint. Der Eingriff bleicht ihn aus. */
  { n:'der Fassungsstempel wird zu blass', tor:'lesbarkeit', bauen:true, datei:V,
    such:'font-family:var(--f-ui);font-size:var(--s-winzig);color:var(--tinte-3);',
    ersatz:'font-family:var(--f-ui);font-size:var(--s-winzig);color:var(--grund-2);',
    an:{ ...DIST, text:'font-size:var(--s-winzig);color:var(--grund-2);' },
    sagt:':1' },

  /* 2. Er deckt nichts zu. Der erste Entwurf lag `fixed` in der Ecke und
   *    ueber der Kachel „Deutschland" - gefunden hat das `passt` im
   *    ersten Lauf. Der Eingriff schiebt ihn dorthin zurueck, wo etwas
   *    steht. */
  { n:'der Fassungsstempel deckt die Kachelwand zu', tor:'passt', bauen:true, datei:V,
    such:'  bottom:0;height:var(--fassung-hoehe);line-height:var(--fassung-hoehe);',
    ersatz:'  bottom:120px;height:var(--fassung-hoehe);line-height:var(--fassung-hoehe);',
    an:{ ...DIST, text:'bottom:120px;height:var(--fassung-hoehe)' },
    sagt:'der Fassungsstempel liegt ueber' },

  /* 3. Er steht ueberhaupt da. Ein leerer Stempel sieht aus wie kein
   *    Stempel, und wer auf dem iPhone nachsieht, haelt die alte Fassung
   *    fuer die neue. */
  { n:'der Fassungsstempel bleibt leer', tor:'passt', bauen:true, datei:D,
    such:'if (stempel) stempel.textContent = `v${BAU.bau} · ${BAU.stand}`;',
    ersatz:'if (false) stempel.textContent = `v${BAU.bau} · ${BAU.stand}`;',
    an:{ ...DIST, text:'if (false) stempel.textContent' },
    sagt:'der Fassungsstempel ist leer' },

  /* --- Das Knopfmaterial (Q15) ----------------------------------------- *
   *
   * Seit R1 steht im Stylesheet, die Tiefe sei „bei allen dieselbe
   * Mechanik". Zehn Runden lang stimmte das nicht, und niemandem ist es
   * aufgefallen: der leise Knopf war ein durchsichtiger Umriss, `warnend`
   * fuhr nach unten, ohne eine Kante zu haben, und der Lupenknopf trug
   * einen Schlagschatten. Ein Versprechen, das nur im Kommentar steht,
   * verfaellt.
   *
   * Der Eingriff nimmt dem leisen Knopf seine Kante wieder - genau der
   * Zustand von vor Q15. */
  /* --- Die Geste mit zwei Fingern (Q16) -------------------------------- *
   *
   * Die Lupe hat drei Knoepfe und eine Geste. Die Knoepfe waren dreifach
   * bezeugt, die Geste seit M4z gar nicht - und sie ist die einzige
   * Bedienung der App, die zwei Finger braucht. Der Eingriff haengt sie
   * ab: der Zweifingerzweig wird nie betreten, ein Finger schiebt weiter. */
  /* --- Die Gruppenkachel (Q17) ----------------------------------------- *
   *
   * Zwei Ebenen, eine Kachel: „Hauptstädte" fragt beim Antippen, wohin.
   * Faellt die Zusammenlegung weg, stehen wieder ELF Kacheln in Leas Wand
   * - und die elfte endet auf dem Zielgeraet ausserhalb des Fensters, ohne
   * Rollen und ohne Hinweis. Der Eingriff schaltet die Gruppierung ab. */
  /* NACHGEZOGEN in Q32, weil sie leise aufgehoert hatte zu beweisen.
   *
   * Sie erwartete „über den Rand": elf Kacheln statt zehn, und die elfte
   * laeuft aus dem Bild. Das stimmte bis Q31 - dort hat die Kachelwand
   * gelernt, ab elf Ebenen ein SECHSTEL breit zu werden, und seither
   * passen zwoelf. Der Eingriff kommt weiterhin an, `passt` bleibt aber
   * mit Recht gruen: es laeuft nichts mehr aus dem Bild.
   *
   * Zuletzt bewiesen hat sie in Q17, dreiunddreissig Fassungen vorher.
   * Genau die Verfallsart, vor der Regel 1 warnt - eine Pruefung, die
   * nie etwas meldet, ist kein Beweis, und diese hoerte auf zu melden,
   * ohne dass irgendwo etwas rot wurde.
   *
   * Nachgemessen: mit dem Eingriff meldet `passt` „11 Kacheln stehen da,
   * 12 passen" und bleibt mit Recht gruen. Auch `smoke` fing es nicht -
   * seine Gruppenschleife laeuft dann einfach leer.
   *
   * Also prueft `smoke` seit Q32 die SACHE statt einer Nebenwirkung:
   * gehoeren zwei Ebenen derselben Gruppe an, teilen sie sich EINE
   * Kachel. Dorthin zeigt diese Probe jetzt. */
  { n:'die Hauptstädte stehen wieder als zwei Kacheln da', tor:'smoke',
    args:['--teil=2/4'], bauen:true, datei:D,
    such:'    if (!b.gruppe) { aus.push(b); continue; }',
    ersatz:'    if (true) { aus.push(b); continue; }',
    an:{ ...DIST, text:'if (true) { aus.push(b); continue; }' },
    sagt:'Gruppierung greift nicht' },

  /* Regel 16: der Runner und dieser Rechner fahren denselben Browser.
   *
   * Der Eingriff laesst `starte()` die Fassung des TIP-OF-TREE-Zweigs
   * erwarten (142) statt der stabilen (141). Der Browser, der wirklich
   * startet, ist derselbe wie vorher - schlagen muss also die Pruefung
   * an, nicht das Fehlen eines Werkzeugs.
   *
   * Warum ueberhaupt eine Probe fuer eine Zeile, die nur vergleicht:
   * weil genau dieser Vergleich zwoelf Fassungen lang gefehlt hat und
   * niemandem aufgefallen ist. Faellt er wieder weg, laeuft alles gruen
   * weiter - bis zur naechsten roten Auslieferung. */
  { n:'der Runner darf wieder einen anderen Browser fahren', tor:'lesbarkeit',
    bauen:true, datei:'tor/chromium.mjs',
    such:"    soll = (j.browsers || []).find(x => x.name === 'chromium');",
    ersatz:"    soll = (j.browsers || []).find(x => x.name === 'chromium-tip-of-tree');",
    an:{ datei:'tor/chromium.mjs', text:"x.name === 'chromium-tip-of-tree'" },
    sagt:'an beiden Orten Verschiedenes' },

  /* Q19: der Fremdgriff im Rauchtest — zwei Proben, zwei Fragen.
   *
   * ERSTENS: kommt ueberhaupt etwas an? Der Eingriff schiebt die
   * Werkzeugspalte (der leise Ausweg und das Mikrofon) 60 Punkte nach
   * links ueber die Antwortliste. Genau die Sorte Rutsch, gegen die diese
   * Pruefung da ist - und auf einem Bildschirm, den `passt` nie ansteuert.
   *
   * Warum NICHT der Eingriff aus Q18 (das Auge zurueck auf den
   * Kachelnamen): gemessen, er schlaegt hier nicht an. Der Beobachter
   * verlangt einen Befund zweimal im Abstand von 300 ms, und die
   * Ebenenwahl steht im Rauchtest keine halbe Sekunde - dort wird sofort
   * eine Kachel angetippt. Kurzlebige Bildschirme sind Sache von `passt`,
   * das sie einzeln ansteuert; der Rauchtest ist fuer die, auf denen
   * gespielt wird. */
  { n:'die Werkzeugspalte rutscht auf die Antwortliste', tor:'smoke',
    args:['--teil=0/4'], bauen:true, datei:V,
    such:'  .seite{width:clamp(307px,45vw,380px);flex-direction:row;align-items:stretch;gap:var(--r2)}',
    ersatz:'  .seite{width:clamp(307px,45vw,380px);flex-direction:row;align-items:stretch;gap:var(--r2)}\n'
         + '  .werkzeug{margin-left:-60px}',
    an:{ ...DIST, text:'.werkzeug{margin-left:-60px}' },
    sagt:'des Wortes greift' },

  /* ZWEITENS: sieht er die AUFGABE? Das ist der ganze Grund, warum die
   * Pruefung zusaetzlich hier laeuft - `passt` steuert nur
   * Wahlbildschirme an. Der Eingriff laesst die Erkennung ins Leere
   * greifen; gezaehlt werden dann null Aufgabenbildschirme, und der
   * Rauchtest meldete sonst „nichts gefunden", ohne etwas Neues geprueft
   * zu haben (Regel 1). */
  { n:'der Fremdgriff sieht die Aufgabe nicht mehr', tor:'smoke',
    args:['--teil=0/4'], bauen:true, datei:'tor/fremdgriff.mjs',
    such:"    const art = s.querySelector('.karte svg, .etikett, .zahl, .eingabe, .feldreihe') ? 'aufgabe'",
    ersatz:"    const art = s.querySelector('.gibt-es-nicht') ? 'aufgabe'",
    an:{ datei:'tor/fremdgriff.mjs', text:"s.querySelector('.gibt-es-nicht')" },
    sagt:'keinen einzigen Aufgabenbildschirm' },

  /* Q20: der Weg zurueck in den Vorlauf.
   *
   * Seit Q18 gibt es auf dem Telefon kein Auge mehr an der Ebenenkachel.
   * Faellt auch der Ersatz im Buch weg, ist eine Ebene nach dem ersten
   * Betreten NICHT MEHR anzusehen - und das faellt niemandem auf, weil
   * nichts fehlt, was man sehen koennte. */
  { n:'das Buch verliert den Weg zurück in den Vorlauf', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:"      ? `<button class=\"knopf\" id=\"allesehen\" aria-label=\"${dran.titel} anschauen\"",
    ersatz:"      ? `<button class=\"knopf\" id=\"garnicht\" aria-label=\"${dran.titel} anschauen\"",
    an:{ ...DIST, text:'id=\"garnicht\"' },
    sagt:'kein Weg zurück in den Vorlauf' },

  /* Und der Rueckweg selbst: „Zurück" muss ins BUCH fuehren, nicht in die
   * Ebenenwahl. `vorlauf` hatte die Ebenenwahl fest eingebaut - mit einem
   * Knopf, der einfach `vorlauf(id)` aufruft, faellt das Kind in einen
   * Bildschirm, in dem es gar nicht war. Das sieht wie ein Fehlgriff aus
   * und ist keiner. */
  { n:'„Zurück" aus dem Vorlauf fällt in die Ebenenwahl', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:"  s.querySelector('#zur').onclick = () => zeige(zurueck || ebenenwahl);",
    ersatz:"  s.querySelector('#zur').onclick = () => zeige(ebenenwahl);",
    an:{ ...DIST, text:"onclick = () => zeige(ebenenwahl)" },
    sagt:'führt nicht ins Buch zurück' },

  /* Q23: eine Ebenenkachel ohne Bild.
   *
   * Genau so ist „Ozeanien" elf Fassungen lang durchgekommen:
   * `australien` fehlte in der Silhouettenliste, die Kachel war leer, und
   * `passt` MASS die Kachelbilder - ein fehlendes gibt nichts zu messen.
   * Neun Zeilen im Bericht fuer zehn Kacheln faellt niemandem auf.
   *
   * Fuer Fiona ist das kein Schoenheitsfehler: sie liest nicht, das
   * Kachelbild IST der Name. */
  { n:'eine Ebenenkachel hat kein Bild mehr', tor:'passt',
    args:['--teil=0/5'], bauen:true, datei:'prototyp/bauen.mjs',
    such:'    australien:  { d: silhouette(ozeanienUmriss, 4),\n'
       + '                   vb: sichtfeld([{ pfad: ozeanienUmriss }]) },',
    ersatz:'',
    an:{ ...DIST, fehlt:'"australien":{"d"' },
    sagt:'hat kein Kachelbild' },

  /* Q24: dem Kachelbild fehlt ein Ziel.
   *
   * Der Anlass war „Ozeanien": die Ebene fragt nach Papua-Neuguinea,
   * Australien und Neuseeland und zeigte den australischen
   * Kontinentumriss - zwei von drei Antworten kamen im Bild nicht vor.
   *
   * Der Eingriff laesst ein Ziel aus dem Bild fallen, und zwar bei der
   * Sorte, die der Waechter WIRKLICH nachrechnen kann: Bild und Ziele
   * aus derselben Karte. (Ozeanien wieder zum Kontinent zu erklaeren
   * waere kein Eingriff, den er sehen KANN - fuer Kontinentbilder ist die
   * Rechnung nicht anzustellen, und eine Probe, die das prueft, waere
   * keine Probe, sondern eine Behauptung.) */
  { n:'dem Kachelbild fehlt eines seiner Ziele', tor:'bauen',
    datei:'prototyp/bauen.mjs',
    such:"  const zielUmriss = (id) => (ausZielen[id] = KARTEN_GROB[id]\n"
       + "    .filter(l => zielAuf(id, l.a3)).map(l => l.pfad).join(' '));",
    ersatz:"  const zielUmriss = (id) => (ausZielen[id] = KARTEN_GROB[id]\n"
       + "    .filter(l => zielAuf(id, l.a3) && l.a3 !== 'NZL').map(l => l.pfad).join(' '));",
    an:{ datei:'prototyp/bauen.mjs', text:"l.a3 !== 'NZL'" },
    sagt:'zeigt nicht, wonach die Ebene fragt' },

  /* Und die Luecke, die die erste Fassung der Probe aufgedeckt hat: der
   * Waechter hing an dem Aufruf, den er pruefen soll. Wer ihn weglaesst,
   * schaltet ihn ab - deshalb muss jede Ebene ihre Herkunft NENNEN. */
  { n:'ein Kachelbild nennt seine Herkunft nicht', tor:'bauen',
    datei:'prototyp/bauen.mjs',
    such:"  const ozeanienUmriss = zielUmriss('australien');",
    ersatz:"  const ozeanienUmriss = roh.australien;",
    an:{ datei:'prototyp/bauen.mjs', text:'const ozeanienUmriss = roh.australien;' },
    sagt:'nennt seine Herkunft nicht' },

  /* Q25: die Nachsicht darf kein Freibrief sein.
   *
   * Seit Q25 misst der Rauchtest bei einer abgelaufenen Frist nach, ob
   * die Maschine langsamer geworden ist, und faellt dann noch einmal
   * nach. Die Gefahr dabei ist offensichtlich: ein Tor, das nach einem
   * Fehlschlag einfach laenger wartet, meldet irgendwann gar nichts mehr.
   *
   * Der Eingriff setzt eine Frist auf eine Millisekunde. Auf einer
   * gesunden Maschine ist die Rechenzeit dann NICHT hoeher als die Norm,
   * die Nachsicht greift nicht, und der Rauchtest wird rot - genau so
   * soll es sein. */
  { n:'die Nachsicht schluckt eine gerissene Frist', tor:'smoke',
    args:['--teil=0/4'], bauen:true, datei:'tor/smoke.mjs',
    such:"  await p.waitForSelector('.schirm.da .kacheln', { timeout: 4000 });",
    ersatz:"  await p.waitForSelector('.schirm.da .kacheln', { timeout: 1 });",
    an:{ datei:'tor/smoke.mjs', text:"'.schirm.da .kacheln', { timeout: 1 }" },
    sagt:'Timeout' },

  /* Q26: die Ebenenkachel wird auf dem grossen Schirm wieder flach.
   *
   * Gemessen war es verkehrt herum: auf dem iPad ist die Kachel 240 breit
   * und war trotzdem nur 112 hoch, das Bild 48 Punkte - WENIGER als die
   * 63 auf dem Telefon. Der Eingriff nimmt die Regel wieder weg.
   *
   * Anschlagen muss die Ratsche auf dem BILD („Bild pt"), nicht die auf
   * der Wandkapazitaet: die meldet nur VERLORENEN Platz, und ein Rueckbau
   * gewinnt welchen - die Wand traegt dann wieder 18 statt 12 Kacheln und
   * bliebe still. Das Bild dagegen faellt von 168 auf 89 Punkte, und das
   * ist weit ausserhalb des Bandes. */
  { n:'die Ebenenkachel wird auf dem großen Schirm wieder flach', tor:'passt',
    args:['--teil=3/5'], bauen:true, datei:V,
    such:'@media (min-width:760px) and (min-height:700px){\n'
       + '  .wahl.ebenen .kachel{min-height:160px}\n}',
    ersatz:'@media (min-width:760px) and (min-height:700px){\n'
       + '  .wahl.ebenen .kachel{min-height:112px}\n}',
    an:{ ...DIST, text:'.wahl.ebenen .kachel{min-height:112px}' },
    sagt:'Bild pt' },

  { n:'zwei Finger ziehen die Karte nicht mehr auf', tor:'ziehen',
    args:['--nur=lupe'], bauen:true, datei:D,
    such:'      if (finger.size >= 2 && start && start.d) {',
    ersatz:'      if (false && start && start.d) {',
    an:{ ...DIST, text:'if (false && start && start.d) {' },
    sagt:'zwei Finger ziehen die Karte nicht auf' },

  /* Q18: das Auge kommt auf dem Telefon zurueck.
   *
   * Es traegt dort keine Flaeche, aber eine Trefferflaeche von 44 Punkten
   * - und die passt in eine 112 Punkte hohe Kachel nur, indem sie in die
   * Namenszeile reicht. Zu sehen ist der Name, zu greifen das Auge. Der
   * Eingriff blendet es wieder ein; anschlagen muss die Fremdgriff-
   * Pruefung, nicht der Ueberlauf. */
  { n:'das Auge liegt wieder auf dem Kachelnamen', tor:'passt',
    args:['--teil=0/5'], bauen:true, datei:V,
    such:'  .wahl.ebenen .kachelpaar .schau{display:none}',
    ersatz:'  .wahl.ebenen .kachelpaar .schau{display:inline-flex}',
    an:{ ...DIST, text:'.wahl.ebenen .kachelpaar .schau{display:inline-flex}' },
    sagt:'des Wortes greift' },

  { n:'der leise Knopf verliert seine Kante', tor:'passt', bauen:true, datei:V,
    such:'  box-shadow:0 var(--kante-flach) 0 var(--knopf-kante),\n'
       + '             inset 0 var(--strich) 0 var(--knopf-licht);\n'
       + '  padding:var(--r2) var(--r4);min-height:44px;',
    ersatz:'  box-shadow:none;\n'
       + '  padding:var(--r2) var(--r4);min-height:44px;',
    an:{ ...DIST, text:'  box-shadow:none;\n  padding:var(--r2) var(--r4);min-height:44px;' },
    sagt:'hat keine Kante' },

  /* Und die Ueberblendung selbst (Q12).
   *
   * In der vollen Kette meldete `lesbarkeit` einmal sechs Fehler auf
   * einen Schlag - „Abend · Pause", alle 1:1. Genau 1:1 heisst: der
   * Bildschirm trug schon `.da`, war aber noch unsichtbar. Gemessen
   * wurde die Ueberblendung, nicht die Farbe. Seither wartet das Tor auf
   * die Deckung statt auf eine Frist.
   *
   * Der Eingriff macht JEDEN Bildschirm dauerhaft halbdurchsichtig - der
   * Fall also, den die neue Wartezeit fangen soll. Ohne sie liefe das
   * Tor darueber hinweg und meldete Kontrastzahlen, die es nie gemessen
   * hat (Regel 1: eine Pruefung, die nie etwas meldet, ist kein
   * Beweis). */
  { n:'der Bildschirm bleibt halbdurchsichtig', tor:'lesbarkeit', bauen:true, datei:V,
    such:'.schirm.da{opacity:1;pointer-events:auto}',
    ersatz:'.schirm.da{opacity:0.3;pointer-events:auto}',
    an:{ ...DIST, text:'.schirm.da{opacity:0.3;pointer-events:auto}' },
    sagt:'% Deckung' },

  /* --- doppelt ------------------------------------------------------ *
   *
   * Eingespritzt wird eine echte Kopie - und zwar als KOPIE, nicht als
   * abgeschriebener Text.
   *
   * Der erste Anlauf schrieb `zielPunkt` aus `chromium.mjs` als
   * Ersatztext in diese Liste. Das Tor hat es beim ersten Lauf gemeldet:
   * vierundsechzig Zeilen, die zweimal dastehen - einmal in
   * `chromium.mjs` und einmal hier. Es hatte recht. Eine Gegenprobe, die
   * eine halbe Datei abschreibt, veraltet genau wie jede andere Kopie,
   * und dann prueft sie eine Fassung, die es nicht mehr gibt.
   *
   * `kopie` legt stattdessen im Wegwerfbaum eine Datei ueber eine andere.
   * Damit steht die Dopplung nur waehrend der Probe da, und in der Liste
   * steht kein einziger geliehener Zeile. */
  { n:'jemand schreibt eine Funktion ab', tor:'doppelt',
    kopie:['tor/chromium.mjs', 'src/vergleich/vergleich.js'],
    an:{ gleichWie:['tor/chromium.mjs', 'src/vergleich/vergleich.js'] },
    sagt:'stehen zweimal' },

  /* Und ein Eintrag ohne Satz ist kein Beschluss, sondern ein Freibrief. */
  { n:'eine Dopplung wird ohne Begründung eingetragen', tor:'doppelt',
    datei:'tor/doppelt-erlaubt.json',
    suchRegex: /"warum": "Die Probenliste IST eine Tabelle[^"]*"/,
    ersatzFn: () => '"warum": "NOCH NICHT BEGRÜNDET"',
    an:{ datei:'tor/doppelt-erlaubt.json', text:'NOCH NICHT BEGRÜNDET' },
    sagt:'ohne Begründung' },

  /* --- budget ------------------------------------------------------- */
  // Die Grenze steht im Konzept, nicht im Tor - also wird sie dort gedreht.
  // Das prueft zugleich, dass das Tor sie wirklich VON DORT liest und nicht
  // insgeheim eine eigene Zahl mitbringt.
  { n:'das Startbündel überschreitet seine Grenze', tor:'budget', bauen:true,
    datei:'docs/Lernkiste-KONZEPT.md',
    such:'| **Startbündel** gesamt, gzip | **< 400 KB** |',
    ersatz:'| **Startbündel** gesamt, gzip | **< 100 KB** |',
    an:{ datei:'docs/Lernkiste-KONZEPT.md', text:'**< 100 KB**' },
    sagt:'erlaubt sind 100' },
  // Und die Ratsche: waechst etwas um mehr als 5 %, ohne dass jemand
  // hingesehen hat, ist das eine Frage - auch weit unterhalb der Grenze.
  //
  // Die Fuellung muss UNKOMPRIMIERBAR sein: 40 000 gleiche Buchstaben
  // schrumpfen im Packer auf ein paar Dutzend Byte, und die Probe waere an
  // der Grenze gescheitert, ohne dass jemand den Grund gesehen haette.
  // Gemessen wird gzip, also muss die Fuellung wie Rauschen aussehen.
  /* Der Fuellstoff haengt an der ERSTEN Zeile, nicht an einer Stelle im Rumpf.
   *
   * Hier stand `const LOB = [` - die Liste der Lobsprueche, die es seit der
   * Ton-Runde nicht mehr gibt (sie steht in `TON`). Der Suchtext fand
   * nichts mehr, und die Probe hat seitdem nichts bewiesen. Wo die 24 KB
   * landen, ist dem Tor `budget` gleichgueltig; also an die Stelle, die es
   * immer geben wird. */
  { n:'die Seite wächst unbemerkt', tor:'budget', bauen:true, datei:D,
    such:"const D = JSON.parse(", ersatz:"const FUELL = '" + FUELLUNG + "';\nconst D = JSON.parse(",
    an:{ ...DIST, text:'const FUELL' }, sagt:'gewachsen' },

  /* P5: der mitgeschriebene Stand darf nicht still verschwinden.
   *
   * Ohne `gesehen` misst die Ratsche weiterhin richtig - sie sagt nur
   * nicht mehr, WELCHE Runde den Platz verbraucht hat, und die Frage
   * landet wieder bei der uebernaechsten. Ein Tor, das nach einem
   * stillen Rueckbau einfach weniger SAGT, faellt keinem auf: es bleibt
   * ja gruen. Deshalb ist der fehlende Block ein Fehler, kein Hinweis.
   *
   * Gedreht wird der Schluessel, nicht der Wert: ein `gesehen` mit
   * falschen Zahlen ist eine andere Sache als gar keines. */
  { n:'der mitgeschriebene Stand verschwindet', tor:'budget', bauen:true,
    datei:'tor/budget-stand.json',
    such:'"gesehen": {', ersatz:'"gesehen_": {',
    an:{ datei:'tor/budget-stand.json', text:'"gesehen_": {' },
    sagt:'nicht beide Stände' },

  /* Eine Gegenprobe findet ihren Suchtext nicht mehr.
   *
   * Der haeufigste Verfall, und bis zu dieser Runde nur im vollen Lauf zu
   * sehen — zweiundvierzig Minuten, einmal am Tag. Jetzt in der Kette. */
  /* Die Entwuerfe holen ihre Schrift wieder aus dem Netz.
   *
   * Dann steht in den Vorbildern die Ersatzschrift - und der Aufbau
   * kostet 12,5 s Zeitueberschreitung. Genau das war jahrelang so, ohne
   * dass ein Tor etwas gesagt haette: die Schriftpruefung lief nur fuer
   * die App-Bildschirme. */
  { n:'die Entwürfe holen ihre Schrift aus dem Netz', tor:'ansicht', args:['--nur=mg-,karte-deutschland'], bauen:true,
    datei:'entwuerfe/mg.html',
    such:'<link rel="stylesheet" href="./schrift.css">',
    ersatz:'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika">',
    an:{ datei:'entwuerfe/mg.html', text:'fonts.googleapis.com' },
    sagt:'die eigene Schrift wurde nicht geladen' },

  /* Ein Tippen, das dauert, sagt es nicht mehr.
   *
   * Ohne Lager und auf 3G stand der alte Bildschirm bis zu 7,5 s da,
   * nachdem ein Kind auf „Forscherbuch" getippt hatte. */
  { n:'ein langes Warten bleibt stumm', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:D,
    such:'const WARTEZEICHEN_AB = 300;',
    ersatz:'const WARTEZEICHEN_AB = 999999;',
    an:{ ...DIST, text:'WARTEZEICHEN_AB = 999999' },
    sagt:'kein Wartezeichen' },
  /* KEINE zweite Probe fuer „das Zeichen bleibt stehen".
   *
   * Sie stand hier und wurde wieder gestrichen. Der Eingriff (die Uhr
   * nicht abbestellen) hat einen viel groesseren Schatten als gedacht:
   * die Wartezeichen stapeln sich ueber der Bedienung, und JEDER Klick
   * laeuft auf. Der Rauchtest wird rot - schon im ersten Abschnitt, mit
   * „page.click: Timeout" -, also lange bevor die eigene Pruefung
   * drankaeme. Ihr erwarteter Satz kam nie.
   *
   * Eine Gegenprobe, deren Wirkung das Tor an einer frueheren Stelle
   * umbringt, beweist nichts ueber die spaetere. Und einen erwarteten Satz
   * auf „Timeout" umzustellen hiesse, eine Zufallsmeldung zum Nachweis zu
   * erklaeren. Die Aufraeum-Zusage wird deshalb im Rauchtest geprueft
   * (nach einem schnellen Wechsel darf kein Zeichen auftauchen) und hier
   * nicht noch einmal behauptet.
   */

  /* Ein Suchtext wird zweideutig.
   *
   * Der Fall, den „steht der Text noch da" NICHT faengt: er steht noch da,
   * aber jetzt zweimal. Welche Stelle `replace` verstellt, entscheidet ab
   * dann ihre Reihenfolge. Der Eingriff hier legt eine zweite Fundstelle
   * an - als Kommentarzeile, damit das Spiel selbst unveraendert bleibt
   * und wirklich nur die Zweideutigkeit geprueft wird. */
  { n:'ein Suchtext wird zweideutig', tor:'inhalt', deckt:'inhalt', datei:D,
    such:'const schauPause = (ms) => FLOTT ? Math.min(ms, 900) : ms;',
    ersatz:'// const schauPause = (ms) => FLOTT ? Math.min(ms, 900) : ms;\n'
         + 'const schauPause = (ms) => FLOTT ? Math.min(ms, 900) : ms;',
    an:{ datei:D, text:'// const schauPause' },
    sagt:'entscheidet ihre Reihenfolge' },

  /* Angefasst wird der GEPRUEFTE Code, nicht die Probenliste.
   *
   * Zwei Anlaeufe sind daran gescheitert, dass die Probe in die Liste
   * griff, in der sie selbst steht. Der erste nahm den Suchtext einer
   * anderen Probe woertlich und traf damit als erstes seine eigene Zeile.
   * Der zweite umging das mit `SITZ[T]` - und traf dann die `fehlt`-Zeile,
   * in der derselbe Text noch einmal steht. Beide Male wurde die
   * Gegenprobe verstellt und das Ziel blieb unberuehrt; `inhalt` meldete
   * gruen.
   *
   * Der Ausweg ist nicht ein schlauerer Ausdruck, sondern ein anderes
   * Ziel: die eine Zeile in spiel.js aendern, die ZWEI Proben als
   * Suchtext tragen. Damit ist der Eingriff dort, wo im Ernstfall auch
   * gearbeitet wird - und die Liste bleibt unberuehrt. */
  { n:'eine Gegenprobe greift ins Leere', tor:'inhalt', deckt:'inhalt', datei:D,
    such:'const schauPause = (ms) => FLOTT ? Math.min(ms, 900) : ms;',
    ersatz:'const schauPause = (ms) => FLOTT ? Math.min(ms, 901) : ms;',
    an:{ datei:D, text:'Math.min(ms, 901)' },
    sagt:'steht nicht mehr in' },
  /* Und die Pruefung selbst darf nicht ins Leere greifen: liest sie keine
   * Liste mehr, ist ihr Gruen geschenkt (Regel 5). */
  { n:'die Suchtext-Prüfung liest keine Proben mehr', tor:'inhalt', deckt:'inhalt',
    datei:'tor/inhalt.mjs',
    such:'  for (const p of PROBEN) {\n    if (!p.datei) continue;',
    ersatz:'  for (const p of PROBEN) {\n    if (p.datei) continue;',
    an:{ datei:'tor/inhalt.mjs', text:'if (p.datei) continue;' },
    sagt:'greift ins Leere und beweist nichts' },

  /* --- rhythmus ----------------------------------------------------- */
  // Wie lange der Lauf zurueckliegt, steht in der HISTORIE - an einer Datei
  // ist das nicht zu drehen. Deshalb bekommt das Tor eine Schraube, die nur
  // strenger stellen kann: bei -1 ist jeder Stand zu alt.
  { n:'der letzte Probenlauf liegt zu lange zurück', tor:'rhythmus', auchWennRot:true, brauchtStand:true, nachStand:true,
    umgebung:{ SMARTKIDS_RHYTHMUS_MAX:'-1' },
    datei:'tor/proben-stand.json',
    // `mehrfach`: der Ausdruck trifft jeden Eintrag im Stand. Das ist hier
    // egal, weil er NICHTS aendert - der Eingriff ist die Schraube in der
    // Umgebung. Die Ersetzung steht nur da, damit der Lauf einen Eingriff
    // sieht.
    mehrfach:true,
    suchRegex:/"zeit": "([\d-]+)"/, ersatzFn:(m)=>`"zeit": "${m[1]}"`,   // unveraendert
    an:{ datei:'tor/proben-stand.json', regex:/"zeit": "[\d-]+"/ },
    // „älter als -1 Tage" und nicht nur „älter als": die Schraube auf -1
    // macht JEDEN Nachweis zu alt, und diese Zahl steht in der Meldung. Der
    // kurze Text stand auch dann da, wenn ohnehin ein Nachweis veraltet
    // war - also genau in der Lage, in der die Probe nichts mehr zeigt.
    sagt:'älter als -1 Tage' },
  // Frueher gab es eine Marke „abgebrochen" fuer den ganzen Satz. Es gibt
  // sie nicht mehr: eine Probe bekommt ihren Eintrag genau dann, wenn sie
  // angeschlagen hat. Ein abgebrochener Lauf hinterlaesst also LUECKEN,
  // und die faengt dieselbe Pruefung wie eine ganz neue Probe. Geprobt
  // wird deshalb die Luecke selbst.
  { n:'eine Probe hat keinen Nachweis, und es faellt nicht auf', tor:'rhythmus', auchWennRot:true,
    brauchtStand:true, nachStand:true, datei:'tor/proben-stand.json',
    /* Es verschwindet der Eintrag EINER BENANNTEN Probe, nicht der erste,
     * den ein Ausdruck findet.
     *
     * Vorher hiess die Erwartung „nie angeschlagen" - ein Satz, der auch
     * dann dasteht, wenn irgendeine andere Probe keinen Nachweis hat. Genau
     * das ist bei den vier Proben dieses Tors der Normalfall, solange sie
     * sich selbst noch nicht bezeugt haben: die Probe stellte einen
     * bestehenden Fehler nach und bewies nichts. Jetzt haengt die Erwartung
     * am NAMEN, und der steht nur in der Liste, wenn dieser Eingriff
     * angekommen ist. */
    such:'"zwei Gebiete mit derselben ID": {',
    ersatz:'"zwei Gebiete mit derselben ID (weg)": {',
    an:{ datei:'tor/proben-stand.json', text:'derselben ID (weg)": {' },
    sagt:'zwei Gebiete mit derselben ID' },
  /* Der Eingriff haengt am ANFANG der Kette, nicht an zwei bestimmten Toren.
   *
   * Hier stand `npm run rhythmus && npm run inhalt` - die Kette, wie sie
   * aussah, als `rhythmus` noch vorn darin stand. Er ist seitdem
   * herausgenommen worden (die Gegenproben bezahlt der Runner, nicht die
   * Runde), und damit fand der Suchtext nichts mehr: die Probe kam nicht
   * an und hat seitdem nichts bewiesen. Gemerkt hat es niemand, weil sie
   * nur im VOLLEN Lauf drankommt - und der lief zuletzt nachts, wo die
   * Meldung im Protokoll steht und nicht auf einem Bildschirm.
   *
   * Jetzt am Kopf der Liste verankert, nicht an einer Zeile in
   * package.json: seit P1 steht die Kette in `tor/kette-liste.mjs`, und
   * genau diese Umstellung hat den alten Suchtext entwertet - gemeldet von
   * der Suchtext-Pruefung in `inhalt`, im selben Lauf. Das Anhaengsel
   * ueberlebt jede Umsortierung der Kette. */
  /* Ein Abschnitt faellt aus der Verteilung.
   *
   * Seit P2 verteilt `smoke` seine vierzehn Abschnitte auf drei Prozesse.
   * Die Verteilung liest eine zweite Liste (`STUECKE`) - und zwei Listen,
   * die dasselbe aufzaehlen, laufen auseinander. Passiert das unbemerkt,
   * laeuft ein Abschnitt in KEINEM Teil, und alle drei melden gruen: die
   * stillste Art, einen Test abzuschalten. Eine Pruefung, die nie etwas
   * meldet, ist kein Beweis (Regel 1).
   *
   * `--teil=11/13` ist gewaehlt, damit der gesunde Lauf billig ist: bei
   * dreizehn Toepfen faellt in diesen nur `hinweis` und `streu`, zusammen
   * vier Sekunden. Die Pruefung selbst haengt nicht an i und n - sie
   * laeuft, bevor verteilt wird. */
  { n:'ein Abschnitt fehlt in der Verteilung des Rauchtests', tor:'smoke',
    args:['--teil=11/13'], bauen:true, datei:'tor/smoke.mjs',
    such:"  { teile: ['tippen'],              ms:  5 },\n",
    ersatz:'',
    an:{ datei:'tor/smoke.mjs', fehlt:"teile: ['tippen']" },
    sagt:'decken die Abschnitte nicht' },

  /* Die Nadeln werden enger und die Fäden länger.
   *
   * Zwei Zahlen ohne Referenz: wie eng zwei Nadelkoepfe stehen duerfen
   * und wie lang ein Faden sein darf. Ein ausgedachtes Soll waere hier
   * schlimmer als keines, also eine Ratsche - rot nur, wenn es
   * SCHLECHTER wird. Eine Ratsche, die nie anschlaegt, weil ihr Stand
   * nicht gelesen wird, waere allerdings gar nichts; deshalb diese Probe.
   *
   * Der Eingriff sitzt im STAND, nicht in der App: er behauptet einen
   * besseren Zustand, als heute gemessen wird. Genau so herum passiert es
   * auch wirklich - jemand bestaetigt einen Stand von einer anderen
   * Fenstergroesse und merkt nicht, dass die Karte danach schlechter
   * geworden ist. */
  /* Beide Proben zielen auf die ZEILE, nicht auf ihren Wert - und auf die
   * Ebene, die ueberhaupt noch Nadeln hat.
   *
   * Sie standen eine Runde lang als `such:'"faden": 154'`, also mit der
   * gemessenen Zahl im Suchtext. Beim ERSTEN Mal, dass die Ratsche enger
   * wurde (A5: der Kopf gab Hoehe ab, 154 wurde 134), zielten beide ins
   * Leere. Eine Ratsche ist dafuer da, sich zu bewegen; eine Gegenprobe,
   * die an ihrem Zahlenwert haengt, verfaellt planmaessig.
   *
   * Und eine Runde spaeter war auch die EBENE weg: mit dem Ausschnitt
   * Mittelamerika (A6) hat Nordamerika drei Laender und keine Nadel mehr,
   * die Ratsche fuehrt es nicht mehr. Europa ist jetzt die einzige Ebene
   * mit Nadeln - also steht sie hier. Wer eine zweite dazubekommt, darf
   * beide Proben verdoppeln; solange es nur eine gibt, waere ein
   * Ausdruck ueber „irgendeine Ebene" nur scheinbar allgemeiner. */
  { n:'die Nadelfäden sind länger geworden als bestätigt', tor:'ziehen',
    args:['--nur=treffer'], bauen:true, datei:'tor/nadeln-stand.json',
    suchRegex:/("laender:europa":\s*\{\s*"eng":\s*[\d.]+,\s*"faden":\s*)\d+/,
    ersatzFn:m => m[1] + '40',
    an:{ datei:'tor/nadeln-stand.json', text:'"faden": 40' },
    sagt:'sagt nicht „hier"' },
  /* Der Eingriff setzt die Ratsche WEIT hoch, nicht auf eine Zahl von
   * damals (Q39c).
   *
   * Hier stand 90, und das war einmal ueber dem gemessenen Wert (78,2).
   * Der Abstand ist seitdem auf 100,3 gewachsen - gut fuer die Kinder, und
   * die Probe war damit still: 100,3 ist nicht kleiner als 90. Eine
   * Gegenprobe, deren Eingriff an einer VERGANGENEN Messung haengt,
   * verfaellt mit jeder Verbesserung. Zweihundert Punkte sind mehr als die
   * halbe Kartenbreite; darueber kann kein Kopfabstand liegen. */
  { n:'zwei Nadelköpfe rücken enger zusammen als bestätigt', tor:'ziehen',
    args:['--nur=treffer'], bauen:true, datei:'tor/nadeln-stand.json',
    suchRegex:/("laender:europa":\s*\{\s*"eng":\s*)[\d.]+/,
    ersatzFn:m => m[1] + '200',
    an:{ datei:'tor/nadeln-stand.json', text:'"eng": 200' },
    sagt:'trifft den falschen' },

  /* Ein Teillauf urteilt über ein Profil, das er nicht gespielt hat.
   *
   * Seit P5 zerfaellt `durchgang` nach PROFIL - der Teil, der Lea spielt,
   * sieht Fiona nie. Die Urteile darunter („Fiona bekam nur 0 von 13
   * Aufgaben vorgelesen") haengen deshalb an `PROFILE_HIER`. Faellt diese
   * Bedingung weg, meldet jeder Teillauf einen Fehlalarm ueber etwas, das
   * er gar nicht gemessen hat - und ein Tor, das ueber Ungemessenes
   * urteilt, ist schlimmer als eines, das schweigt.
   *
   * `--teil=5/16`: bei sechzehn Toepfen faellt in diesen NUR
   * `durchgang:lea`, also rund zwanzig Sekunden statt hundert. Und genau
   * dieser Topf ist der Fall, um den es geht - er spielt Lea und soll
   * ueber Fiona nichts sagen. */
  { n:'ein Teillauf urteilt über ein Profil, das er nicht gespielt hat', tor:'smoke',
    args:['--teil=5/16'], bauen:true, ohneSofort:true, datei:'tor/smoke.mjs',
    such:"if (hier('fiona') && (gehoert.fiona || 0) < EBENEN_JE('fiona'))",
    ersatz:"if ((gehoert.fiona || 0) < EBENEN_JE('fiona'))",
    an:{ datei:'tor/smoke.mjs', fehlt:"hier('fiona') &&" },
    sagt:'Fiona bekam nur' },

  /* Ein Teillauf sagt nicht mehr, was er geprüft hat.
   *
   * Die Nachzaehlung im Laeufer war bis P4 nachsichtig: fand sie keine
   * Zahl, ging sie stillschweigend darueber hinweg. Streng gemacht,
   * meldete sie sofort einen echten Fall - `ansicht` laeuft auf dem
   * Runner ausdruecklich nicht. Das ist jetzt unterschieden: „hat sich
   * ÜBERSPRUNGEN" ist in Ordnung, „hat nichts gesagt" nicht.
   *
   * Diese Probe nimmt das Wort aus der Meldung. Damit sieht der Laeufer
   * drei Teillaeufe, die weder eine Zahl noch einen Grund nennen - und
   * genau das darf er nicht durchwinken.
   *
   * In P2 stand diese Nachzaehlung noch als ungedeckt aufgeschrieben,
   * weil sie die volle Kette gebraucht haette. Seit die kurze Fassung
   * `ansicht` mitfaehrt (uebersprungen, eine halbe Sekunde), geht es. */
  { n:'ein Teillauf nennt weder seine Zahl noch einen Grund', tor:'tor', bauen:true,
    stets:{ SMARTKIDS_KETTE_PROBE:'1' }, datei:'tor/ansicht.mjs',
    such:"console.log('\\n  Tor `ansicht`: ÜBERSPRUNGEN.');",
    ersatz:"console.log('\\n  Tor `ansicht`: laeuft hier nicht.');",
    an:{ datei:'tor/ansicht.mjs', fehlt:'ÜBERSPRUNGEN' },
    sagt:'kein Teillauf nennt seine Zahl' },

  /* Ein geteiltes Tor ohne Deckungsart.
   *
   * Seit P4 teilen sich drei Tore auf, und der Laeufer zaehlt bei jedem
   * nach, dass die Teile zusammen alles abdecken. WIE er zaehlt, sagt
   * `deckung` in `tor/kette-liste.mjs`. Faellt der Eintrag weg, zaehlt er
   * bei diesem Tor gar nicht mehr - und ein Teillauf, der die Haelfte
   * vergisst, meldete wieder gruen.
   *
   * Geprobt an `inhalt`, nicht an `tor`: `inhalt` liest dieselbe Liste
   * (fuer den Vergleich mit CLAUDE.md) und faellt beim Einlesen um. Zwei
   * Sekunden statt zwei Minuten, und geprueft ist dieselbe Zeile. */
  { n:'ein geteiltes Tor sagt nicht, wie seine Deckung gezählt wird', tor:'inhalt',
    datei:'tor/kette-liste.mjs',
    such:", teile: 3, deckung: 'namen' },\n  { name: 'ansicht'",
    ersatz:", teile: 3 },\n  { name: 'ansicht'",
    an:{ datei:'tor/kette-liste.mjs', fehlt:"teile: 3, deckung: 'namen' },\n  { name: 'ansicht'" },
    sagt:'wie der Läufer die Deckung nachzählt' },

  /* --- A4: Sprechen fuer alle, und „noch einmal hoeren" --------------- */
  { n:'Stephan darf nicht mehr sprechen', tor:'smoke', args:['--nur=sprechen'], bauen:true, datei:D,
    such:"name:'Stephan', alter:null, eingabe:['tippen','sprechen']",
    ersatz:"name:'Stephan', alter:null, eingabe:['tippen']",
    an:{ ...DIST, fehlt:"'Stephan', alter:null, eingabe:['tippen','sprechen']" },
    sagt:'kein Mikrofon' },
  /* Das Schreibfeld darf dabei nicht verschwinden: die Spracheingabe ist
   * eine Option und kein Ersatz. Der Eingriff nimmt Stephan das Tippen
   * und laesst ihm nur das Sprechen - genau die Verwechslung, gegen die
   * die zweite Haelfte der Pruefung steht. */
  { n:'die Spracheingabe verdrängt das Schreibfeld', tor:'smoke', args:['--nur=sprechen'],
    bauen:true, datei:D,
    such:"name:'Stephan', alter:null, eingabe:['tippen','sprechen']",
    ersatz:"name:'Stephan', alter:null, eingabe:['sprechen']",
    an:{ ...DIST, text:"'Stephan', alter:null, eingabe:['sprechen']" },
    sagt:'Schreibfeld ist weg' },
  { n:'Fiona kann die Aufgabe nicht noch einmal hören', tor:'smoke', args:['--nur=sprechen'],
    bauen:true, datei:D,
    such:'  nochHoerenAnhaengen(ansageText);\n',
    ersatz:'',
    an:{ ...DIST, fehlt:'nochHoerenAnhaengen(ansageText)' },
    sagt:'noch einmal hören' },
  /* Und andersherum: der Knopf haengt am Profil und nicht am Bildschirm.
   * Faellt die Bedingung weg, bekommt Lea ihn auch - und ein Knopf, der
   * ihr nichts vorliest, ist ein Knopf, der schweigt. */
  { n:'der Hörknopf hängt nicht mehr am Profil', tor:'smoke', args:['--nur=sprechen'],
    bauen:true, datei:D,
    such:'  if (!P || !P.vorlesen || !text) return null;',
    ersatz:'  if (!P || !text) return null;',
    an:{ ...DIST, fehlt:'!P.vorlesen || !text' },
    sagt:'hängt nicht am Profil' },

  /* --- die Kette selbst ------------------------------------------------
   *
   * Solange die Kette eine `&&`-Zeile war, gab die Shell den Rueckgabewert
   * weiter, und es gab nichts zu pruefen. Seit P1 faehrt `tools/kette.mjs`
   * die sechs Browsertore NEBENEINANDER und sammelt ihre Rueckgabewerte
   * selbst ein - ein `await` zu wenig, und ein rotes Tor waere still
   * gruen. Das ist die teuerste Art, ein Tor abzuschalten: alle bleiben
   * stehen, keines bezeugt noch etwas.
   *
   * Die Probe faehrt die Kette in ihrer KURZEN Fassung
   * (`SMARTKIDS_KETTE_PROBE=1`, siehe tools/kette.mjs): `pwa` und
   * `lesbarkeit` im selben Becken, zusammen elf Sekunden. `pwa` wird rot
   * gemacht, `lesbarkeit` bleibt gruen - geprueft wird also nicht nur,
   * dass ein Rot durchkommt, sondern dass es NEBEN einem Gruen durchkommt.
   * Die volle Kette waere fuenf Minuten je Probe; die faehrt niemand, und
   * eine Probe, die niemand faehrt, beweist nichts (Regel 1).
   *
   * `stets` und nicht `umgebung`: die kurze Fassung gilt fuer BEIDE
   * Laeufe. Im ersten Anlauf stand hier `umgebung`, und damit lief der
   * gesunde Lauf als VOLLE Kette - verglichen wurden eine volle gruene
   * und eine kurze rote Kette, also zwei Laeufe, die sich in mehr
   * unterscheiden als im Eingriff (Regel 14). Und 325 s statt 22. */
  { n:'das Becken verschluckt ein rotes Tor', tor:'tor', bauen:true,
    stets:{ SMARTKIDS_KETTE_PROBE:'1' }, datei:'tor/pwa.mjs',
    such:'const pruefe = (b, satz) => { if (!b) fehler.push(satz); };',
    ersatz:'const pruefe = (b, satz) => { if (!b) fehler.push(satz); };\n'
      + "pruefe(false, 'Gegenprobe: dieses Tor ist absichtlich rot');",
    an:{ datei:'tor/pwa.mjs', text:'absichtlich rot' },
    sagt:'Kette ROT' },

  /* Der rote Lauf muss nachzulesen sein (Q40).
   *
   * Der Anlass steht in `tools/kette.mjs`: ein Lauf war rot, der naechste
   * gruen, und der Grund war weg. Seitdem schreibt die Kette jeden Lauf
   * mit und einen roten in eine eigene Datei - und diese Probe haelt
   * fest, dass sie es auch SAGT. Derselbe Eingriff wie eine Zeile
   * darueber (ein absichtlich rotes `pwa` in der kurzen Fassung), aber
   * eine andere Frage: dort „wird die Kette rot", hier „findet man
   * hinterher heraus, warum".
   *
   * Verschwindet das Mitschreiben, faellt der Satz weg und die Probe
   * schlaegt nicht mehr an. */
  { n:'der rote Lauf ist hinterher nicht mehr nachzulesen', tor:'tor', bauen:true,
    stets:{ SMARTKIDS_KETTE_PROBE:'1' }, datei:'tor/pwa.mjs',
    such:'const pruefe = (b, satz) => { if (!b) fehler.push(satz); };',
    ersatz:'const pruefe = (b, satz) => { if (!b) fehler.push(satz); };\n'
      + "pruefe(false, 'Gegenprobe: dieses Tor ist absichtlich rot');",
    an:{ datei:'tor/pwa.mjs', text:'absichtlich rot' },
    sagt:'Ganz nachzulesen in .kette/rot-' },

  { n:'ein neues Tor steht in der Kette, aber nicht im Stand', tor:'rhythmus', auchWennRot:true,
    brauchtStand:true, nachStand:true, datei:'tor/kette-liste.mjs',
    such:'export const OHNE_BROWSER = [',
    ersatz:"export const OHNE_BROWSER = [\n  { name: 'neuestor', datei: 'tor/neuestor.mjs' },",
    an:{ datei:'tor/kette-liste.mjs', text:"name: 'neuestor'" },
    sagt:'noch nicht in der Kette' },
  /* Ein Nachweis, dessen Alter sich nicht bestimmen laesst.
   *
   * Das ist der Fall, der die Auslieferung fuenf Runden rot gehalten hat -
   * nur andersherum, als er hier stand: 66 Nachweise zeigten auf zwei
   * `wip`-Commits, die nie an einem Zweig hingen. Lokal fand `git` sie
   * noch im Objektspeicher, auf dem frischen Klon des Runners nicht. Das
   * Tor liest jetzt zuerst, ob der Commit ein VORFAHR ist, und faellt
   * sonst auf die Historie der Standdatei zurueck. Beide Wege scheitern
   * nur noch, wenn der Eintrag nirgends steht - und ein Tor, das dann
   * still gruen bliebe,
   * bezeugte einen Beweis, den niemand mehr nachsehen kann.
   *
   * Diese Probe stand hier zuerst als „eine Probe kam dazu, ohne dass
   * geprobt wurde" — und war damit dieselbe Pruefung wie die daneben, nur
   * von der anderen Seite. Schlimmer noch: ihr Eingriff schrieb den Text
   * `{ n:'…'` in `proben.mjs`, und genau daran liest `rhythmus` die Namen
   * ab. Sie zaehlte sich selbst mit, auch ohne Eingriff — das Tor meldete
   * siebzig Proben, wo neunundsechzig stehen. Eine Gegenprobe, die den
   * Prüfling schon im Ruhezustand verstellt, ist keine.
   */
  /* Ein Nachweis ohne bestimmbares Alter.
   *
   * Der Eingriff hiess frueher „ein Commit, den es nicht gibt" - das war
   * der Fall, der die Auslieferung fuenf Runden rot gehalten hat, solange
   * in Commits gezaehlt wurde. Seit in TAGEN gezaehlt wird, gibt es diesen
   * Fall nicht mehr; der Verfall, der bleibt, ist ein Eintrag ohne
   * gueltiges Datum. Die Probe zeigt jetzt auf ihn.
   *
   * Eine Gegenprobe umzustellen statt sie zu streichen ist hier richtig:
   * die Frage ist dieselbe geblieben („was, wenn das Alter unbekannt
   * ist?"), nur ihre Ursache ist eine andere. */
  { n:'ein Nachweis, dessen Alter sich nicht bestimmen lässt', tor:'rhythmus', auchWennRot:true,
    brauchtStand:true, nachStand:true, datei:'tor/proben-stand.json',
    /* Getroffen wird das Datum EINES EINTRAGS, nicht das der Datei.
     *
     * Ganz oben in der Standdatei steht auch ein `"zeit"` - fuer den Lauf
     * als Ganzes. Der erste Anlauf traf genau das: `rhythmus` liest es gar
     * nicht, das Alter blieb bestimmbar, und die Probe meldete „rot, aber
     * nicht deswegen". Der Eingriff kam an und traf das Falsche - die
     * unauffaelligste Art, danebenzugreifen. */
    // `mehrfach`: es gibt hundertzwanzig Eintraege, und EINER ohne
    // gueltiges Datum genuegt. Welcher, ist gleichgueltig.
    mehrfach:true,
    suchRegex:/"commit": "[0-9a-f]+",\n(\s*)"zeit": "\d{4}-\d{2}-\d{2}"/,
    ersatzFn:(m)=>`"commit": "0",\n${m[1]}"zeit": "irgendwann"`,
    an:{ datei:'tor/proben-stand.json', text:'"zeit": "irgendwann"' },
    sagt:'lässt sich das Alter nicht bestimmen' },

  /* --- Eltern (R4) ------------------------------------------------------ */
  // Der Vorrat waechst still.
  //
  // Ohne `if (a === b) continue;` kommen die neun Quadrate aus 11…19 in
  // `mal-gross` dazu - 81 statt 72. Das ist genau die Verfallsart, gegen
  // die die Zaehlung da ist: ein Vorrat, der waechst, bricht das
  // Forscherbuch und den Leitner, und von aussen sieht nichts anders aus.
  { n:'Der Vorrat der Eltern wächst still', tor:'inhalt', deckt:'doku',
    datei:'src/inhalt/rechnen.js',
    such:'      if (a === b) continue;                 // die Quadrate sind eigene Sorte',
    ersatz:'      // (Quadrate nicht mehr ausgelassen)',
    an:{ datei:'src/inhalt/rechnen.js', fehlt:'die Quadrate sind eigene Sorte' },
    sagt:'im Abgleich stehen' },
  // Das Verbot im Profil „Eltern“ faellt aus.
  { n:'Eltern bekommt doch eine Auswahl', tor:'smoke', bauen:true,
    args:['--nur=durchgang'], datei:D,
    // Gezielt wird auf `darfWaehlen` - die EINE Stelle, an der das Profil
    // verbietet. Zwei fruehere Fassungen dieser Probe bewiesen nichts:
    // die erste pruefte auf das FEHLEN von `P.kandidaten > 0`, das
    // zweimal dastand und deshalb nie fehlte (Regel 10); die zweite kam an
    // und liess das Tor gruen, weil die zweite Sperre bei `wieviel` den
    // Eingriff auffing. Seitdem gibt es nur noch eine Sperre.
    such:'  const darfWaehlen = P.kandidaten > 0;',
    ersatz:'  const darfWaehlen = true;',
    an:{ ...DIST, text: 'const darfWaehlen = true;' },
    sagt:'eine Auswahl statt eines Tippfelds' },

  /* --- Zwölf Länder (R4, zweite Hälfte) -------------------------------- */
  // Eine Luecke im Rang.
  //
  // `laenderTiefe` filtert `rang <= n`. Faellt ein Rang aus, spielt jeder,
  // der tiefer geht, still ein Land weniger - und von aussen sieht die
  // Ebene normal aus. Beide Tore lesen die Tiefe aus den PROFILEN; bis R4
  // stand die Fuenf zweimal fest hingeschrieben da.
  { n:'ein Rang fehlt in der Länderliste', tor:'inhalt', deckt:'inhalt',
    datei:'src/inhalt/erdkunde.js',
    such:"    { a3:'POL', name:'Polen', rang:5, nachbarDE:true, aussprache:['polen','pohlen'] },",
    ersatz:"    { a3:'POL', name:'Polen', rang:99, nachbarDE:true, aussprache:['polen','pohlen'] },",
    an:{ datei:'src/inhalt/erdkunde.js', text:"name:'Polen', rang:99" },
    // Ein Rang 99 ist seit D2c keine Bereichsverletzung mehr, sondern
    // eine LUECKE: die Raenge sind je Kontinent lueckenlos 1..n, und ein
    // fehlender Rang 5 heisst still ein Land weniger fuer alle, die
    // tiefer spielen. Das ist der Fehler, um den es geht.
    sagt:'lückenlos' },
  // Und die Kinder bekommen still mehr zu sehen.
  //
  // Der teuerste denkbare Fehler dieser Runde: die Raenge 6 bis 12 sind
  // fuer Eltern da. Rutschte Fionas oder Leas Tiefe mit, stuenden vor einem
  // Sechsjaehrigen ploetzlich zwoelf Laender.
  { n:'Fiona bekommt die Länder der Eltern zu sehen', tor:'smoke', bauen:true,
    args:['--nur=durchgang'], datei:D,
    // Nur das eine Feld, nicht die ganze Zeile: die Profilzeile hat seit der
    // Ton-Runde ein Feld mehr (`ton:'kind'`), und die abgeschriebene Zeile
    // traf nichts mehr. Ein Suchtext, der mehr festhaelt als noetig, geht
    // bei jeder Erweiterung kaputt.
    such:"kandidaten:4, laenderTiefe:3,",
    ersatz:"kandidaten:4, laenderTiefe:12,",
    an:{ ...DIST, text:'kandidaten:4, laenderTiefe:12' },
    sagt:'Länder im Vorlauf' },

  /* --- Hauptstädte in Europa (R6) -------------------------------------- */
  // Die Stadtlage liegt neben ihrem Land.
  //
  // Der teuerste Fehler dieser Ebene, weil er still ist: der Punkt
  // erscheint erst NACH der richtigen Antwort. Kein Rauchtest sieht ihn,
  // kein Bildvergleich - und ein Kind lernte die falsche Lage. Er
  // entsteht schon dadurch, dass die Lage in einer anderen Stufe oder
  // Projektion gerechnet wird als die Umrisse.
  { n:'eine Hauptstadt liegt neben ihrem Land', tor:'inhalt', deckt:'inhalt',
    datei:'src/geo/laender-europa.grob.js',
    such:'"hauptstadt":"Warschau","ort":[536.9,489.4]',
    ersatz:'"hauptstadt":"Warschau","ort":[136.9,889.4]',
    an:{ datei:'src/geo/laender-europa.grob.js', text:'"ort":[136.9,889.4]' },
    sagt:'liegt nicht in' },
  // Die eine echte Falle faellt aus.
  //
  // Natural Earth fuehrt Den Haag als Regierungssitz; steht er nicht vorn
  // unter den Ablenkern, ist die Frage nach Amsterdam so schwer wie die
  // nach Berlin. Geprueft wird die Liste von Hand gegen die Referenz.
  { n:'der Regierungssitz steht nicht mehr vorn', tor:'inhalt', deckt:'inhalt',
    datei:'src/inhalt/erdkunde.js',
    such:"  NLD:['Den Haag','Rotterdam'],",
    ersatz:"  NLD:['Rotterdam','Den Haag'],",
    an:{ datei:'src/inhalt/erdkunde.js', text:"NLD:['Rotterdam','Den Haag']" },
    sagt:'die eigentliche Falle fiele aus' },
  // Die Ebene zeigt die falsche Karte.
  //
  // `hauptstaedte:europa` ist nicht `laender`, und drei Stellen im
  // Programm haben den Rahmen frueher an genau dieser Art festgemacht.
  // Faellt die Ableitung aus, liegt der Deutschland-Rahmen um eine
  // Europakarte - und KEIN anderes Tor sagt etwas dazu: gespielt wird sie
  // weiter, sie sieht nur falsch aus.
  { n:'die Hauptstädte-Ebene bekommt den falschen Rahmen', tor:'ansicht', args:['--nur=quer-hauptstaedte-eu'],
    bauen:true, datei:D,
    such:"  return art === 'kontinente' ? D.vbK : kont ? D.vbL[kont] : D.vbD;",
    ersatz:"  return art === 'kontinente' ? D.vbK : art === 'laender' ? D.vbL[kont] : D.vbD;",
    an:{ ...DIST, text:"art === 'laender' ? D.vbL[kont] : D.vbD" },
    sagt:'quer-hauptstaedte-eu' },
  // Und Fiona bekommt sie doch zu sehen.
  //
  // Sie liest noch nicht, und eine Stadt hat keinen Umriss zum Ziehen.
  { n:'Fiona bekommt die Hauptstädte Europas', tor:'smoke', bauen:true,
    args:['--nur=durchgang', '--kurz'], datei:D,
    such:"    wer:['lea','stephan','violeta'], gruppe:'hauptstaedte', wo:'Europa' },",
    ersatz:"    gruppe:'hauptstaedte', wo:'Europa' },",
    an:{ ...DIST, fehlt:"wer:['lea','stephan','violeta']" },
    sagt:'steht aber in fionas Auswahl' },

  /* --- Ton je Profil und der Elternbereich als Bild -------------------- */
  // Die Eltern werden wieder angefeuert.
  //
  // „Super gemacht!" zu einem Erwachsenen, der das grosse Einmaleins
  // uebt. Der Ton ist eine Eigenschaft des Profils, und das Soll steht in
  // der Zeile „Ton" im Backlog - nicht in `spiel.js`, das diese Probe
  // faelscht.
  /* Seit N1 gibt es ZWEI Elternprofile mit denselben Werten - die Zeile
   * steht also zweimal, und die Probe verstellt beide. Genau das ist hier
   * richtig: der Ton ist fuer beide derselbe, und ein Eingriff, der nur
   * eines der beiden traefe, wuerde eine Ungleichheit erzeugen, die es
   * nicht geben darf. */
  { n:'die Eltern bekommen den kindlichen Ton', tor:'inhalt', deckt:'inhalt',
    datei:D, mehrfach:true,
    such:"          kandidaten:0, laenderTiefe:17, sitzung:12, streng:true, ton:'sachlich',",
    ersatz:"          kandidaten:0, laenderTiefe:17, sitzung:12, streng:true, ton:'kind',",
    an:{ datei:D, text:"streng:true, ton:'kind'" },
    sagt:'im Backlog steht' },
  // Und der sachliche Ton ruft doch.
  //
  // Am Bildschirm gemessen, nicht an der Liste: nach einer richtigen
  // Antwort steht das Lob in der Frage-Zeile, und ein Ausrufezeichen
  // darin ist der ganze Unterschied.
  { n:'der sachliche Ton ruft doch', tor:'smoke', bauen:true,
    args:['--nur=durchgang', '--kurz'], datei:D,
    such:"    lob:  ['Richtig.', 'Stimmt.', 'Korrekt.', 'Sitzt.'],",
    ersatz:"    lob:  ['Richtig!', 'Stimmt!', 'Korrekt!', 'Sitzt!'],",
    an:{ ...DIST, text:"['Richtig!', 'Stimmt!'" },
    sagt:'das Lob ruft' },
  // Der Rauchtest misst wieder eine andere Groesse, als er behauptet.
  //
  // `ctx.newPage()` nimmt keine Optionen; sechs Aufrufstellen nannten
  // 844x390 und liefen auf 1280x720. Eine verworfene Option wirft nicht,
  // sie tut nichts - deshalb sagt es der Test jetzt selbst.
  /* `bauen:true`, obwohl der Eingriff im TOR steht und nicht in der App.
   * Die Wegwerf-Kopie ist ein frischer Auschecker, und `dist/` steht
   * nicht in Git - ohne Bau faehrt der Rauchtest gegen nichts und ist
   * schon vor dem Eingriff rot. Die Probe meldete das selbst: „ist schon
   * OHNE Eingriff rot". */
  { n:'der Bildausschnitt wird wieder verworfen', tor:'smoke', bauen:true,
    args:['--nur=spielen'], datei:'tor/smoke.mjs',
    such:'  await p.setViewportSize(viewport);',
    ersatz:'  // (Bildausschnitt nicht gesetzt)',
    an:{ datei:'tor/smoke.mjs', fehlt:'await p.setViewportSize(viewport);' },
    sagt:'misst eine andere Größe' },
  // Die Uebersicht im Elternbereich verschwindet.
  //
  // Der Bereich hatte bis hierher gar kein Vorbild - ausgerechnet der,
  // der zuletzt um zwei Tabellen gewachsen ist.
  { n:'die Übersicht im Elternbereich fällt weg', tor:'ansicht', args:['--nur=quer-eltern'], bauen:true, datei:D,
    such:'      <table class="tab" style="margin-top:var(--r3)"><thead><tr><th>Profil</th>',
    ersatz:'      <table class="tab" hidden><thead><tr><th>Profil</th>',
    an:{ ...DIST, text:'<table class="tab" hidden>' },
    sagt:'quer-eltern' },
  // Und die Beschriftung faellt immer gleich aus.
  //
  // „innen oder daneben" muss gerechnet werden. Kommt nur eine Sorte vor,
  // ist es keine Messung, sondern eine feste Einstellung.
  { n:'die Beschriftung fällt immer gleich aus', tor:'inhalt', deckt:'inhalt',
    datei:'src/geo/staedte.js',
    // `mehrfach`: das `g` ist der Eingriff. Aus ALLEN „innen" wird
    // „fahne" - eine einzelne Stelle waere keine gleiche Beschriftung.
    mehrfach:true,
    suchRegex:/"beschriftung":"innen"/g,
    ersatzFn:()=>'"beschriftung":"fahne"',
    an:{ datei:'src/geo/staedte.js', fehlt:'"beschriftung":"innen"' },
    sagt:'nur die Sorte' },

  // Die Siegsterne kommen bei den Eltern zurueck.
  //
  // Drei Sterne heissen „alles auf Anhieb richtig" - und genau das steht
  // eine Zeile tiefer, nur genauer. Auf dem Endbildschirm der Kinder sind
  // sie richtig, bei den Eltern doppelt.
  { n:'die Siegsterne kommen bei den Eltern zurück', tor:'ansicht', args:['--nur=quer-ende-eltern'], bauen:true, datei:D,
    // Seit B2 steht davor die Weiche „Test oder Uebung"; getauscht wird
    // nur der Uebungszweig.
    such:": ton().siegsterne ? `<div class=\"siegsterne\">${sterne(n,56)}</div>` : ''}",
    ersatz:': `<div class="siegsterne">${sterne(n,56)}</div>`}',
    an:{ ...DIST, fehlt:'ton().siegsterne ?' },
    sagt:'quer-ende-eltern' },
  // Ein Schluessel fehlt in einem der beiden Toene.
  //
  // `undefined` ist falsch, nicht laut: die Siegsterne waeren fuer ALLE
  // weg, und ein Tippfehler saehe aus wie eine Entscheidung.
  { n:'ein Schlüssel fehlt im kindlichen Ton', tor:'inhalt', deckt:'inhalt', datei:D,
    such:'    siegsterne: true,',
    ersatz:'    siegsternee: true,',
    an:{ datei:D, text:'siegsternee: true' },
    sagt:'verschiedene Schlüssel' },

  /* --- Aussprache: gegengehoert -------------------------------------- */
  // Ein Vorsprung allein macht wieder einen sicheren Treffer.
  //
  // Dann wird „Irak" glatt als IRAN gewertet: zwei echte Nachbarlaender,
  // ein Buchstabe Unterschied bei vier, und der Rest Asiens weit weg.
  { n:'ein Vorsprung allein genügt wieder', tor:'vergleich', deckt:'vergleich',
    datei:'src/vergleich/vergleich.js',
    such:'export const GRENZE_NAH     = 0.22;   // Vorsprung allein genuegt nur bis hier',
    ersatz:'export const GRENZE_NAH     = 0.99;   // Vorsprung allein genuegt nur bis hier',
    an:{ datei:'src/vergleich/vergleich.js', text:'GRENZE_NAH     = 0.99' },
    // Nicht „ist neu": bei ZWEI Durchrutschern schreibt das Tor „sind
    // neu", und genau zwei laesst der gelockerte Wert durch. Ein
    // erwarteter Text, der die Einzahl mitfesthaelt, geht kaputt, sobald
    // der Eingriff einen Fall mehr oeffnet.
    sagt:'neu — bekannt war nur' },
  // Und eine Aussprachevariante faellt auf das falsche Land.
  //
  // Die 35 Laender aus R5 hatten je zwei erfundene Varianten, und keine
  // davon war je durch den Abgleich gelaufen. Jetzt laufen ALLE - Name,
  // Alias, Variante, 213 Formen.
  { n:'eine Aussprachevariante zeigt aufs falsche Land', tor:'vergleich', deckt:'vergleich',
    datei:'src/inhalt/erdkunde.js',
    such:"    { a3:'POL', name:'Polen', rang:5, nachbarDE:true, aussprache:['polen','pohlen'] },",
    ersatz:"    { a3:'POL', name:'Polen', rang:5, nachbarDE:true, aussprache:['polen','griechenland'] },",
    an:{ datei:'src/inhalt/erdkunde.js', text:"aussprache:['polen','griechenland']" },
    sagt:'angenommen wurde' },

  // Der Vorlauf zeigt wieder den ganzen Rechenvorrat.
  //
  // Hundert Karten fuer Fiona, 158 fuer die Eltern - gemessen 2,8 bis
  // 4,2 Bildschirme. R3 sagte „alle Gegenstaende der Ebene", und das war
  // fuer Gebiete gedacht; ein erzeugter Vorrat hat keine Zahl, die auf
  // einen Bildschirm passt.
  { n:'der Vorlauf zeigt wieder die ganze Tafel', tor:'smoke', bauen:true,
    args:['--nur=durchgang', '--kurz'], datei:D,
    such:'  const stuecke = vorlaufVorrat(ebeneId);',
    ersatz:'  const stuecke = vorrat(ebeneId);',
    an:{ ...DIST, fehlt:'const stuecke = vorlaufVorrat(ebeneId)' },
    sagt:'kein Blättern' },
  // Und der Vorlauf einer Rechenebene sieht anders aus.
  { n:'die Beispielkarten verlieren ihre Form', tor:'ansicht', args:['--nur=quer-vorlauf-rechnen'], bauen:true, datei:V,
    // Eindeutig, nicht `.rechenkleber{`: das steht auch als Nachfahren-
    // Regel im Vorlauf-Abschnitt, und ein zweideutiger Suchtext trifft
    // die falsche Zeile.
    such:'.rechenkleber{display:flex;',
    ersatz:'.rechenkleber{display:none;',
    an:{ ...DIST, text:'.rechenkleber{display:none;' },
    sagt:'quer-vorlauf-rechnen' },

  /* Der Aufkleber haengt wieder am LAUFENDEN Fach.
   *
   * Dann faellt er bei jeder falschen Antwort aus dem Buch - gemessen 122
   * bis 251 Verluste je Ebene in einem Jahr Spiel. `spielprobe` spielt das
   * Jahr durch und zaehlt mit. */
  { n:'Aufkleber fallen wieder aus dem Buch', tor:'spielprobe', deckt:'spielprobe',
    datei:'src/kern/leitner.js',
    such:'export const istGesammelt = (stand, id) => hoechstes(stand, id) >= HAT_AUFKLEBER;',
    ersatz:'export const istGesammelt = (stand, id) => (stand[id]?.fach ?? 1) >= HAT_AUFKLEBER;',
    an:{ datei:'src/kern/leitner.js', fehlt:'istGesammelt = (stand, id) => hoechstes' },
    sagt:'verlorene Aufkleber' },

  /* Die zweite Kontinentrunde geht wieder ZU.
   *
   * `warGesessen` fragt den Hoechststand, `istGesessen` das heutige Fach.
   * Mit dem heutigen Fach war Runde 2 an 47 von 208 Sitzungen wieder
   * verschlossen: Fiona setzte sich hin, und Asien war weg. */
  /* Am RAUCHTEST, nicht an `spielprobe`: die Regel steht in spiel.js, und
   * `spielprobe` rechnet sie nach - also bezeugt sie dort nur, dass
   * `warGesessen` monoton ist, nicht dass die App es benutzt. Der
   * Rauchtest stellt den Stand in der Ablage und schaut nach, wieviele
   * Kontinente die Ebene danach kennt. */
  { n:'eine offene Kontinentrunde geht wieder zu', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:D,
    such:'    if (!bisher.every(k => Leitner.warGesessen(stand, k.id))) break;',
    ersatz:'    if (!bisher.every(k => Leitner.istGesessen(stand, k.id))) break;',
    an:{ ...DIST, fehlt:'Leitner.warGesessen(stand, k.id)' },
    sagt:'wieder zu' },
  /* Und die Prüfung selbst darf nicht ins Leere greifen: stellt sie den
   * Rückfall gar nicht mehr her, ist ihre Zusage geschenkt. */
  /* --- Die Regelnummern (P4) --------------------------------------------
   *
   * Der Befund: von 197 Verweisen „Regel N" zeigten 101 in die Regelliste
   * eines ANDEREN Verzeichnisses. Das Tor `regeln` faengt das ab - aber
   * nur, solange es die Liste wirklich liest. Diese Probe schreibt eine
   * Nummer hin, die es nicht gibt.
   *
   * Eingegriffen wird in CLAUDE.md, nicht in einen Kommentar: damit ist
   * zugleich bewiesen, dass das Tor die Liste WIRKLICH von dort liest.
   * Der erste Anlauf schrieb eine erfundene Nummer in einen Kommentar -
   * und das Tor fand daraufhin die Probe selbst, weil ihr Suchtext in
   * `proben-liste.mjs` steht. Ein Tor, das seine eigene Gegenprobe
   * meldet, ist in diesem Verzeichnis das zweite Mal aufgefallen
   * (`doppelt` war das erste). */
  { n:'eine Regel fehlt in CLAUDE.md, die Verweise bleiben stehen', tor:'regeln',
    deckt:'regeln', datei:'CLAUDE.md',
    such:'14. **Das Modell darf nicht vom Gemessenen abhängen.**',
    ersatz:'99. **Das Modell darf nicht vom Gemessenen abhängen.**',
    an:{ datei:'CLAUDE.md', fehlt:'14. **Das Modell' },
    sagt:'diese Regel gibt es nicht' },

  /* --- Das Auge an der Kachel (P16) -------------------------------------
   *
   * Es liegt UEBER der Kachel, und die Kachel ist selbst ein Knopf. Ein
   * Tipp, der durchschlaegt, startet die Ebene statt die Karten zu zeigen
   * - und beide Wege fuehren auf einen Bildschirm, der plausibel
   * aussieht. Diese Probe laesst das Auge starten. */
  { n:'das Auge startet die Ebene statt sie zu zeigen', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:"    ev.stopPropagation(); zeige(()=>vorlauf(b.dataset.schau)); });",
    ersatz:"    ev.stopPropagation(); starten(b.dataset.schau); });",
    an:{ ...DIST, text:'ev.stopPropagation(); starten(b.dataset.schau)' },
    sagt:'führt nicht in den Vorlauf' },

  /* --- Der Wegweiser (P15) ----------------------------------------------
   *
   * Zwei Zusagen, zwei Proben. Er MUSS da sein, wenn das gesuchte Gebiet
   * an einer Nadel haengt - sonst zeigt der Zeiger in einen Pulk. Und er
   * darf bei der umgekehrten Frage NICHT da sein - dort waere er die
   * Antwort. Faellt eine der beiden aus, ist der Faden Zierat oder
   * Verrat. */
  { n:'der Wegweiser bleibt aus', tor:'smoke', args:['--nur=umgekehrt'],
    bauen:true, datei:D,
    such:"      const wegweiser = !umgekehrt && n.x.id === ziel.id ? ' nadelziel' : '';",
    ersatz:"      const wegweiser = '';",
    an:{ ...DIST, text:"const wegweiser = '';" },
    sagt:'ohne hervorgehobenen Faden' },

  { n:'der Wegweiser leuchtet auch bei der umgekehrten Frage', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"      const wegweiser = !umgekehrt && n.x.id === ziel.id ? ' nadelziel' : '';",
    ersatz:"      const wegweiser = n.x.id === ziel.id ? ' nadelziel' : '';",
    an:{ ...DIST, text:"const wegweiser = n.x.id === ziel.id" },
    sagt:'das ist die Antwort' },

  /* Und die VORAUSSETZUNG des Abschnitts (A6).
   *
   * Er stellt einen Lernstand, in dem nur die kleinen Laender einer Karte
   * faellig sind - alle anderen bekommen Fach 5 und einen Termin in
   * ferner Zukunft. Steht eine der Kennungen nicht auf dieser Karte, dann
   * bekommt eben JEDES Land Fach 5, die Sitzung ist leer, und der
   * Abschnitt haengt im Warten auf die erste Frage.
   *
   * Genau so ist er in A6 gestorben, als Mittelamerika seine eigene Karte
   * bekam und die sieben kleinen von der Nordamerikakarte verschwanden:
   * eine nackte Zeitueberschreitung, die nicht sagt, was fehlt. Seitdem
   * prueft der Abschnitt seine eigene Voraussetzung - und diese Probe
   * prueft, dass er es tut. */
  { n:'der Rauchtest stellt einen Stand für eine Karte, die es nicht gibt',
    tor:'smoke', args:['--nur=umgekehrt'], datei:'tor/smoke.mjs',
    such:"  const kleine = new Set(['BEL','LUX',",
    ersatz:"  const kleine = new Set(['XXX','LUX',",
    an:{ datei:'tor/smoke.mjs', text:"new Set(['XXX','LUX'," },
    sagt:'steht nicht auf der Europakarte' },

  /* --- Die Haken (A4) ---------------------------------------------------
   *
   * Sie sind 26 Punkte gross und stehen am Anker. In Mittelamerika liegen
   * sieben Anker so eng beieinander, dass daraus ein gruener Fleck wurde -
   * vierzehn Paare uebereinander, das engste 4,2 Punkte auseinander. Seit
   * P10 haengen diese Gebiete an einer Nadel, und der Haken haengt mit.
   * Nimmt man ihm das wieder weg, ist der Fleck sofort zurueck. */
  { n:'der Haken bleibt am Ort statt an der Nadel', tor:'ziehen',
    args:['--nur=treffer'], bauen:true, datei:D,
    such:'      const n = nadeln.find(x => x.id === h.dataset.id);',
    ersatz:'      const n = null;',
    an:{ ...DIST, text:'const n = null;' },
    sagt:'liegen aufeinander' },

  /* --- Die Sprechprobe (M4r) -------------------------------------------
   *
   * Sie soll unterscheiden, ob bei einem Versuch ein Wort ankam. Eine
   * Anzeige, die nach jedem Versuch dasselbe sagt, waere schlimmer als
   * keine: die halbe Stunde mit dem Geraet in der Hand endete dann mit
   * einer Zahl, die nichts bedeutet. Der Zaehler muss also wirklich am
   * Text haengen - genau das stellt diese Probe ab. */
  { n:'die Sprechprobe zaehlt jeden Versuch als verstanden', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:'    const mitWort   = laeufe.filter(l => l.text);',
    ersatz:'    const mitWort   = laeufe;',
    an:{ ...DIST, text:'const mitWort   = laeufe;' },
    sagt:'sie unterscheidet nicht' },

  /* --- Die Nadeln (P10) ------------------------------------------------
   *
   * Zwei Zusagen, zwei Gegenproben. Die erste gilt dem Platz: eine Nadel
   * im Meer kostet nichts, dieselbe Scheibe auf Frankreich nimmt
   * Frankreich seine Trefferflaeche. Die zweite gilt der Wirkung: ohne
   * Nadel ist Guatemala wieder unerreichbar, und „Wo liegt Guatemala?"
   * darf dann nicht gefragt werden. Faellt eine von beiden aus, ist die
   * Nadel Zierat - gezeichnet, gemessen und ohne Folgen. */
  { n:'die Nadel sucht sich keinen freien Platz mehr', tor:'ziehen',
    args:['--nur=treffer'], bauen:true, datei:D,
    such:'            if (!freiVonFlaeche(x, y)) continue;',
    ersatz:'            if (false && !freiVonFlaeche(x, y)) continue;',
    an:{ ...DIST, text:'if (false && !freiVonFlaeche' },
    sagt:'liegt auf' },

  /* --- Die Lupe (M4z) ------------------------------------------------
   *
   * Drei Zusagen, drei Proben. Sie vergroessert. Sie zielt dabei auf das
   * GESUCHTE Land und nicht auf die Mitte des Rahmens - die liegt auf der
   * Mittelamerikakarte im offenen Meer, und der erste Entwurf hat das
   * Land damit aus dem Bild geschoben. Und der Weg zurueck steht da,
   * sobald es einen gibt. */
  { n:'die Lupe vergrößert gar nicht mehr', tor:'ziehen', args:['--nur=lupe'],
    bauen:true, datei:D,
    such:'    const MAX = 8;', ersatz:'    const MAX = 1;',
    an:{ ...DIST, text:'const MAX = 1;' },
    sagt:'die Lupe vergrößert nicht' },

  { n:'die Lupe zielt auf die Mitte statt auf das Gesuchte', tor:'ziehen',
    args:['--nur=lupe'], bauen:true, datei:D,
    such:'    const anker = (!umgekehrt && zielForm && zielForm.anker)',
    ersatz:'    const anker = (false && zielForm && zielForm.anker)',
    an:{ ...DIST, text:'const anker = (false && zielForm' },
    sagt:'nicht mehr ganz im Kartenkasten' },

  /* NACHGEZOGEN in Q33: die Regel haengt jetzt an `.feld`, nicht an der
   * Karte. Die Knoepfe stehen seit Q33 in der Werkzeugspalte und sind
   * damit keine Kinder der Karte mehr - der alte Suchtext zeigte ins
   * Leere, und `npm run inhalt` hat es beim ersten Lauf gemeldet. */
  { n:'„ganze Karte" steht schon vor dem Zoomen da', tor:'ziehen',
    args:['--nur=lupe'], bauen:true, datei:V,
    such:'.feld:not(:has(.karte[data-lupe]:not([data-lupe=""]))) .lupenknopf.ganz{display:none}',
    ersatz:'.feld .lupenknopf.ganz{display:flex}',
    an:{ ...DIST, text:'.feld .lupenknopf.ganz{display:flex}' },
    sagt:'ist ein Hindernis' },

  /* Und die neue Zusage: KEIN Gebiet ohne Trefferstelle.
   *
   * Der Eingriff laesst die Nadelsuche gar nicht erst laufen (die Schleife
   * findet nie einen Platz). Dann fallen die kleinen Gebiete auf ihren
   * winzigen Kreis am Ort zurueck - und genau das muss `ziehen` melden. */
  { n:'kein Gebiet hat mehr eine Trefferstelle', tor:'ziehen',
    args:['--nur=treffer'], bauen:true, datei:D,
    such:'for (let r = MIN_PT; r <= 170 && !platz; r += 10) {',
    ersatz:'for (let r = MIN_PT; r < MIN_PT && !platz; r += 10) {',
    an:{ ...DIST, text:'r < MIN_PT && !platz' },
    sagt:'es gibt keine Stelle, an der ein Finger' },

  { n:'es gibt gar keine Nadeln mehr', tor:'smoke', args:['--nur=umgekehrt'],
    bauen:true, datei:D,
    such:'        if (kreisAmOrt(n) * 2 < MIN_REST)',
    ersatz:'        if (false)',
    an:{ ...DIST, fehlt:'if (kreisAmOrt(n) * 2 < MIN_REST)' },
    sagt:'hängt kein Gebiet an einer Nadel' },

  { n:'der Rückfall wird gar nicht mehr gestellt', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:'tor/smoke.mjs',
    such:'    const wiederFaellig = Object.fromEntries(ersteRunde.map(id =>',
    ersatz:'    const wiederFaellig = Object.fromEntries([].map(id =>',
    an:{ datei:'tor/smoke.mjs', text:'Object.fromEntries([].map(id =>' },
    sagt:'wieder zu' },
  /* Und die Probe selbst darf nicht leerlaufen: haelt der Hoechststand
   * NIE, was er verspricht, muessen die Gelegenheiten trotzdem gezaehlt
   * werden. Faellt die Zaehlung aus, meldet `spielprobe` das - eine Null
   * ohne Gelegenheit beweist nichts (Regel 5). */
  { n:'die Aufkleberprobe zählt keine Gelegenheiten mehr', tor:'spielprobe', deckt:'spielprobe',
    datei:'tor/spielprobe.mjs',
    such:'        if (hatte && !richtig) gelegenheiten++;',
    ersatz:'        if (false) gelegenheiten++;',
    an:{ datei:'tor/spielprobe.mjs', text:'if (false) gelegenheiten++;' },
    sagt:'beweist nichts' },

  /* --- Die Sitzungslaenge (Q12) ---------------------------------------- *
   *
   * Eine Ebene mit drei Gebieten gibt drei Aufgaben - gedeckelt, nicht
   * aufgefuellt. Das ist die Zusage, die eine kurze Ebene wie Ozeanien
   * ueberhaupt tragbar macht: waere sie gebrochen, bekaeme ein Kind
   * dieselben drei Gebiete zweimal in derselben Runde und haelte das mit
   * Recht fuer einen Fehler der App.
   *
   * Der Eingriff fuellt genau so auf, wie ein erster Entwurf es taete. */
  { n:'eine Sitzung stellt dasselbe Gebiet zweimal', tor:'spielprobe', deckt:'spielprobe',
    datei:'src/kern/leitner.js',
    such:'  aus = [...aus, ...rest.slice(0, Math.max(0, laenge - aus.length))]\n'
       + '    .slice(0, Math.min(laenge, alle.length));',
    ersatz:'  aus = [...aus, ...rest.slice(0, Math.max(0, laenge - aus.length))];\n'
       + '  while (aus.length < laenge && alle.length) aus.push(alle[aus.length % alle.length]);',
    an:{ datei:'src/kern/leitner.js', text:'aus.push(alle[aus.length % alle.length])' },
    sagt:'stellt denselben Gegenstand zweimal' },

  /* Und die Probe braucht ihre Gelegenheit: eine Pruefung, die nie etwas
   * meldet, ist kein Beweis (Regel 1). Faellt der kurze Fall aus der
   * Zaehlung, prueft der ganze Abschnitt nur noch
   * Selbstverstaendlichkeiten - 47 Ebenen, die alle genug Vorrat haben.
   * Eine Null ohne Gelegenheit beweist nichts. */
  { n:'die kurze Ebene faellt aus der Sitzungsmessung', tor:'spielprobe', deckt:'spielprobe',
    datei:'tor/spielprobe.mjs',
    such:'      if (eb.alle.length < laenge) kurzeFaelle++;',
    ersatz:'      if (false) kurzeFaelle++;',
    an:{ datei:'tor/spielprobe.mjs', text:'if (false) kurzeFaelle++;' },
    sagt:'beweist nichts' },

  /* Das Buch holt die Umrisse nicht mehr nach.
   *
   * Dann steht auf jeder Karte eines nachgeladenen Gebiets „undefined" -
   * der Kasten faellt ohne `pfad` auf die Rechen-Darstellung zurueck. */
  { n:'das Buch zeigt Karten ohne Umriss', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:D,
    such:'    .map(x => ebeneLaden(x.e.id).catch(()=>false)));',
    ersatz:'    .map(x => Promise.resolve(false)));',
    an:{ ...DIST, fehlt:'ebeneLaden(x.e.id)' },
    sagt:'keinen Umriss' },

  /* Und jetzt MISST es auch jemand.
   *
   * `inhalt` prueft die Tuer (jedes `setTimeout`, das einen Bildschirm
   * wechselt, nimmt `schauPause`). Das faengt die Form, nicht die Wirkung:
   * eine `schauPause`, die nichts kuerzt, kaeme durch. Der Rauchtest misst
   * deshalb die Pause auf BEIDEN Wegen, mit und ohne Schalter. */
  { n:'der Schalter kürzt keine Schaupause mehr', tor:'smoke', args:['--nur=pausen'],
    bauen:true, datei:D,
    such:'const schauPause = (ms) => FLOTT ? Math.min(ms, 900) : ms;',
    ersatz:'const schauPause = (ms) => ms;',
    an:{ ...DIST, text:'const schauPause = (ms) => ms;' },
    sagt:'kürzt diesen Weg nicht' },
  /* Und die Pause selbst wird zu kurz, um sie zu lesen. */
  { n:'das Lob ist weg, bevor ein Kind es gelesen hat', tor:'smoke', args:['--nur=pausen'],
    bauen:true, datei:D,
    such:'const schauPause = (ms) => FLOTT ? Math.min(ms, 900) : ms;',
    ersatz:'const schauPause = (ms) => FLOTT ? Math.min(ms, 900) : 300;',
    an:{ ...DIST, text:'Math.min(ms, 900) : 300;' },
    sagt:'kann ein Kind es nicht lesen' },

  /* Und die Ablesung selbst darf nicht ins Leere greifen (Q37).
   *
   * Seit die Pruefung an der ANGEFORDERTEN Zahl haengt statt an der
   * Stoppuhr, haengt ihr ganzes Urteil an dem Mantel um `setTimeout`.
   * Faengt der nichts mehr - weil jemand die Untergrenze verstellt oder
   * die App die Pause anders stellt -, waere jedes Urteil geschenkt. Der
   * Eingriff hebt die Untergrenze ueber jede Schaupause; danach wird
   * nichts mehr mitgeschrieben, und das MUSS auffallen. */
  { n:'die Schaupause wird gar nicht mehr mitgeschrieben', tor:'smoke',
    args:['--nur=pausen'], bauen:true, datei:'tor/smoke.mjs',
    such:'        if (typeof ms === \'number\' && ms >= 200) window.__angefordert.push(ms);',
    ersatz:'        if (typeof ms === \'number\' && ms >= 999999) window.__angefordert.push(ms);',
    an:{ datei:'tor/smoke.mjs', text:'ms >= 999999' },
    sagt:'gar keine Schaupause angefordert' },

  /* Eine Schaupause faellt wieder neben den Schalter.
   *
   * Genau der Fall, der 1,6 s je Kartenaufgabe gekostet hat, ohne dass
   * eines von zwanzig Toren etwas gesagt haette. */
  { n:'eine Schaupause geht wieder an `?flott` vorbei', tor:'inhalt', deckt:'inhalt',
    datei:D,
    such:'    }, schauPause(ergebnis===\'fast\' ? 2400 : 1600));',
    ersatz:'    }, ergebnis===\'fast\' ? 2400 : 1600);',
    an:{ datei:D, fehlt:'schauPause(ergebnis===' },
    sagt:'an `schauPause` vorbei' },
  /* Und die Prüfung selbst darf nicht ins Leere greifen: findet der
   * Ausdruck keinen einzigen Bildschirmwechsel mehr, ist ihr Grün
   * geschenkt (Regel 5). */
  { n:'die Schaupausen-Prüfung findet nichts mehr', tor:'inhalt', deckt:'inhalt',
    datei:'tor/inhalt.mjs',
    such:"  const treffer = rufe.filter(t => /\\bzeige\\(|^\\s*weiter\\s*,/.test(t));",
    ersatz:"  const treffer = rufe.filter(() => false);",
    an:{ datei:'tor/inhalt.mjs', text:'rufe.filter(() => false)' },
    sagt:'greift ins Leere' },

  /* Der Rohdatenpfad zeigt wieder irgendwohin.
   *
   * Er gilt dann nur auf einem Rechner, und `npm run backen` laeuft
   * ueberall sonst ins Leere - mit einem ENOENT, nicht mit einer Auskunft. */
  { n:'der Rohdatenpfad wird wieder absolut', tor:'inhalt', deckt:'inhalt',
    datei:'tools/geo-backen.mjs',
    such:"const ROH = process.env.LERNKISTE_ROH || path.join(process.cwd(), 'roh');",
    ersatz:"const ROH = process.env.LERNKISTE_ROH || '/tmp/roh';",
    an:{ datei:'tools/geo-backen.mjs', text:"|| '/tmp/roh'" },
    sagt:'relativ zum' },

  /* Die Aufkleber im Buch bekommen wieder ihre Schreibtischgroesse.
   *
   * Dann rollt das Buch auf dem Zielgeraet schon beim zweiten Aufkleber,
   * und die Vorschau steht halb unter dem Rand. */
  /* Umbenannt in Q35: die Probe hiess „das Buch rollt wieder beim zweiten
   * Aufkleber" und zeigte damit auf einen Stellvertreter, den es nicht
   * mehr gibt. Gemessen wird jetzt, ob ein ganzer Block erst UNTER der
   * Unterkante anfaengt. Der Eingriff ist derselbe geblieben - er macht
   * die Kleber so hoch, dass die Vorschau vom Bildschirm faellt. */
  { n:'ein Block im Buch fängt erst unter der Unterkante an', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:V,
    /* Gedreht wird an der ALBUMKARTE, nicht an der Kleberhoehe (Q35).
     *
     * Die alte Fassung machte `.kleber.gross .aufkleber svg` hoeher - und
     * das aendert im Buch dieses Tors gar nichts: dort stehen
     * Rechenkleber, und ein Rechenkleber hat kein `svg`, er IST die
     * Aufgabe (siehe `kleber` in spiel.js). Der Eingriff kam an, das Bild
     * blieb gleich, und die Probe bezeugte nichts. Nachgemessen: 341
     * Punkte mit 64 wie mit 112.
     *
     * Die Albumkarte ist das eine Bild in diesem Buch. Waechst sie auf
     * 300 Punkte, rutscht alles darunter vom Bildschirm - genau der
     * Zustand, den die Pruefung meint. */
    such:'  .albumkarte svg{height:96px}',
    ersatz:'  .albumkarte svg{height:300px}',
    an:{ ...DIST, text:'.albumkarte svg{height:300px}' },
    sagt:'unter der Unterkante' },

  /* Der leere Kopf nimmt wieder 68 Punkte weg.
   *
   * Auf dem Zielgeraet sind das 17 % der Bildschirmhoehe, und der ganze
   * Block darunter steht dann wieder unter der Mitte. */
  { n:'der leere Kopf nimmt wieder Platz weg', tor:'ansicht', // Endbildschirm und Pause sind die beiden, die `kopf({})` rufen - das
    // steht ueber der Funktion, und der erste Anlauf hat es trotzdem auf
    // Profil- und Weltenwahl geraten. Die haben eine Kopfzeile mit Inhalt.
    args:['--nur=quer-ende,quer-pause'], bauen:true, datei:D,
    such:'  (links || mitte || rechts)\n  ?',
    ersatz:'  true\n  ?',
    an:{ ...DIST, fehlt:'(links||mitte||rechts)' },
    sagt:'quer-ende' },
  /* Und die Pause verliert ihre Warnung. Der Knopf daneben loescht alles,
   * was das Kind in dieser Uebung gesammelt hat. */
  { n:'die Pause warnt nicht mehr vor „von vorne"', tor:'ansicht', args:['--nur=quer-pause'], bauen:true, datei:D,
    such:'      <div class="unter" id="was">Bei „von vorne" verschwindet alles, was du',
    ersatz:'      <div class="unter" id="was">Bei „von vorne" geht es weiter, was du',
    an:{ ...DIST, fehlt:'von vorne" verschwindet alles' },
    sagt:'quer-pause' },

  /* Der Vorlauf legt wieder acht Spuren an, egal wieviele Karten es sind.
   *
   * Dann stehen sechs Rechenaufgaben linksbuendig in einer Reihe von acht,
   * mit einem Loch von vierhundert Punkten rechts. */
  { n:'der Vorlauf verteilt die Karten wieder auf acht Spuren', tor:'ansicht', args:['--nur=quer-vorlauf'],
    bauen:true, datei:D,
    such:'  const gitter = vorlaufGitter(stuecke.length);',
    ersatz:'  const gitter = { reihen: 2, spalten: 8 };',
    an:{ ...DIST, fehlt:'vorlaufGitter(stuecke.length)' },
    sagt:'quer-vorlauf-rechnen' },

  /* Die Reihen teilen sich die Hoehe des Bandes nicht mehr.
   *
   * Dann haengen die Karten wieder oben, der Knopf unten, und dazwischen
   * steht ein Drittel leeres Band. */
  { n:'die Beispielkarten füllen das Band nicht mehr', tor:'ansicht', args:['--nur=quer-vorlauf'], bauen:true, datei:V,
    such:'  grid-auto-rows:minmax(min-content,1fr);justify-content:center;',
    ersatz:'  grid-auto-rows:min-content;justify-content:center;',
    an:{ ...DIST, text:'grid-auto-rows:min-content;' },
    sagt:'quer-vorlauf' },

  // Die Diphthonge verlieren ihren eigenen Code.
  //
  // Dann heisst „aussen" wieder wie „Asien": die Koelner Phonetik gibt
  // jedem Vokal die 0 und streicht sie danach. Genau diese Verwechslung
  // rutschte seit K1 durch.
  { n:'die Diphthonge verschwinden wieder', tor:'vergleich', deckt:'vergleich',
    datei:'src/vergleich/vergleich.js',
    such:"    .replace(/AEU|EU|OI|OY/g, 'Ä')\n    .replace(/AU/g, 'Ö');",
    ersatz:"    ;",
    an:{ datei:'src/vergleich/vergleich.js', fehlt:"replace(/AU/g, 'Ö')" },
    sagt:'aussen' },

  /* --- Umbruch der Fahne und die zwei Achsen des Sprechens ------------- */
  // Die Fahne bricht nicht mehr um.
  //
  // Auf dem Zielgeraet ist die Deutschlandkarte 170 Punkte breit,
  // „Mecklenburg-Vorpommern" bei 21 px Schrift 260. Ohne Umbruch laesst
  // sie sich nicht mehr in die Karte klemmen und haengt heraus. Gesehen
  // hat das erst der Rauchtest, seit er die Groesse misst, die er nennt.
  { n:'die Namensfahne bricht nicht mehr um', tor:'smoke', bauen:true,
    args:['--nur=spielen'], datei:D,
    such:'  if (!passt && tb.width + luft*2 > vbB.width * 0.98) {',
    ersatz:'  if (false) {',
    an:{ ...DIST, fehlt:'vbB.width * 0.98' },
    sagt:'steht neben der Karte' },
  // Und die App redet wieder an jedem Profil vorbei.
  //
  // Zwei Achsen: `vorlesen` gilt der Ansage der Aufgabe, der `ton` allem,
  // was die App von sich aus sagt. Faellt die zweite aus, bekommen die
  // Eltern „Super gemacht!" ins Ohr - und Lea auch, obwohl ihr Profil
  // `vorlesen: false` sagt.
  { n:'die App spricht an jedem Profil vorbei', tor:'smoke', bauen:true,
    args:['--nur=durchgang', '--kurz'], datei:D,
    such:'function sagen(text){ if (!P || ton().spricht) vorlesen(text); }',
    ersatz:'function sagen(text){ vorlesen(text); }',
    an:{ ...DIST, fehlt:'if (!P || ton().spricht) vorlesen(text)' },
    sagt:'die App spricht' },

  /* --- Der Elternbereich kennt drei Profile (R7) ----------------------- */
  // Das Protokoll kennt den Vorrat der Eltern nicht.
  //
  // `NAMEN` war aus ZWEI Vorraeten aufgezaehlt, seit R4 gibt es drei.
  // Im Elternbereich standen die 158 Aufgaben der Eltern als `g12*13` statt
  // „12 × 13" - und nichts wurde rot davon.
  { n:'das Protokoll kennt die Aufgaben der Eltern nicht', tor:'smoke', bauen:true,
    args:['--nur=durchgang'], datei:D,
    such:"for (const e of EBENEN.filter(e=>e.art==='rechnen'))\n  for (const r of vorrat(e.id)) NAMEN[r.id]=r.frage;",
    ersatz:'Rechnen.vorrat().forEach(r=>NAMEN[r.id]=r.frage);\n'
         + 'Rechnen.reihenVorrat().forEach(r=>NAMEN[r.id]=r.frage);',
    an:{ ...DIST, fehlt:"EBENEN.filter(e=>e.art==='rechnen')" },
    sagt:'Kennungen statt Aufgaben' },
  // Die Wackelkandidaten liegen wieder in einem Topf.
  //
  // Die Abnahme im Konzept (M6) lautet „Was kann LEA noch nicht?".
  // Zusammengezaehlt ueber alle Profile ist sie nicht zu beantworten -
  // und von aussen sieht die Liste genauso aus wie vorher.
  { n:'die Wackelkandidaten stehen unter keinem Namen', tor:'smoke', bauen:true,
    args:['--nur=ablage'], datei:D,
    such:'  const gespielt = profile.filter(x => x.n);',
    ersatz:'  const gespielt = [];',
    an:{ ...DIST, text:'const gespielt = []' },
    sagt:'unter keinem Profilnamen' },
  // Loeschen geht wieder nur fuer eins.
  //
  // Wer als Lea hereinkam, wurde Fionas Daten nicht los: der Knopf hing
  // am aktiven Profil statt an der Liste.
  { n:'es gibt nur einen Löschknopf', tor:'smoke', bauen:true,
    args:['--nur=ablage'], datei:D,
    such:'        ${profile.map(({ pr })=>`<button class="knopf" data-weg="${pr.id}"',
    ersatz:'        ${profile.slice(0,1).map(({ pr })=>`<button class="knopf" data-weg="${pr.id}"',
    an:{ ...DIST, text:'profile.slice(0,1).map' },
    sagt:'Löschknöpfe für' },

  /* --- Der Vorlauf (R3) ----------------------------------------------- */
  // Er kommt gar nicht mehr.
  { n:'der Vorlauf erscheint beim ersten Betreten nicht', tor:'smoke', bauen:true,
    args:['--nur=spielen'], datei:D,
    such:'    if (!Einst.vorlaufGezeigt[`${P.id}:${id}`]) zeige(()=>vorlauf(id));',
    ersatz:'    if (false) zeige(()=>vorlauf(id));',
    an:{ ...DIST, text:'if (false) zeige' }, sagt:'kommt kein Vorlauf' },
  // Er kommt, aber er ist stumm - und damit fuer Fiona leer.
  { n:'die Karten im Vorlauf sagen nichts', tor:'smoke', bauen:true,
    args:['--nur=spielen'], datei:D,
    such:"  s.querySelectorAll('[data-lesen]').forEach(b => b.onclick = () => vorlesen(b.dataset.lesen));",
    ersatz:"  s.querySelectorAll('[data-lesen]').forEach(b => b.onclick = () => {});",
    an:{ ...DIST, text:"forEach(b => b.onclick = () => {})" },
    sagt:'sagt nichts' },
  // Er zeigt nicht, was die Ebene enthaelt.
  { n:'der Vorlauf zeigt die falsche Zahl an Gebieten', tor:'smoke', bauen:true,
    args:['--nur=spielen'], datei:D,
    // `vorlaufVorrat`, nicht `vorrat`: seit der Vorlauf bei den Rechenebenen
    // nur noch Beispiele zeigt, geht er durch eine eigene Funktion. Der alte
    // Suchtext fand nichts mehr.
    such:'  const stuecke = vorlaufVorrat(ebeneId);',
    ersatz:'  const stuecke = vorlaufVorrat(ebeneId).slice(0, 4);',
    an:{ ...DIST, text:'vorlaufVorrat(ebeneId).slice(0, 4)' },
    sagt:'statt 16' },

  /* --- Die Pause (R1) ------------------------------------------------ */
  // Zwei Proben, weil zwei Dinge kaputtgehen koennen und nur eines davon
  // von aussen zu sehen ist.
  //
  // Die erste: das Loeschen loescht nicht.
  { n:'„von vorne" in der Pause löscht nichts', tor:'smoke', bauen:true, args:['--nur=ablage'],
    datei:D, such:"    await Ablage.loesche('fortschritt', `${P.id}:${Sitzung.ebeneId}`).catch(()=>{});",
    ersatz:"    /* geloescht wird nichts */",
    an:{ ...DIST, fehlt:'${P.id}:${Sitzung.ebeneId}`).catch' }, sagt:'Gegenstände im Leitner-Stand' },
  // Die zweite: es loescht, aber die Sitzung zaehlt weiter.
  //
  // Das ist der Fall, den man NICHT sieht. `starten()` liest den
  // Leitner-Stand neu; ohne `Stand = {}` begaenne die neue Runde mit den
  // alten Faechern - dieselben Aufgaben, dasselbe Fach, nur ohne Haekchen.
  // Von aussen sieht das aus wie ein sauberer Neuanfang.
  { n:'nach „von vorne" läuft die alte Sitzung weiter', tor:'smoke', bauen:true, args:['--nur=ablage'],
    // `sagen` statt `vorlesen` (Ton-Runde) - dieselbe Ursache wie beim
    // Fehlwurf. Zwei Proben, ein Umbau, beide still gestorben.
    datei:D, such:"    Stand = {};\n    sagen(`${titel} fängt wieder von vorne an.`);\n    starten(Sitzung.ebeneId);",
    ersatz:"    sagen(`${titel} fängt wieder von vorne an.`);\n    zeige(spielschirm);",
    an:{ ...DIST, text:'von vorne an.`);\n    zeige(spielschirm)' },
    sagt:'zählt weiter statt neu anzufangen' },

  /* --- ziehen (fünf) ------------------------------------------------ */
  /* P6: der Boden reisst die Regel wieder ein.
   *
   * `Math.max(rPx, MIN_REST/2)` hat die Zeile darueber aufgehoben, sobald
   * zwei Anker naeher als achtzehn Bildpunkte beieinanderlagen. Gefunden
   * hat das keiner der siebzehn Tore, weil die Zahl in Node gerechnet
   * wurde - mit einem angenommenen Kartenmassstab. Am Bildschirm sind es
   * vier Faelle: wer auf den Anker von Nicaragua zeigt, bekommt Costa
   * Rica; Guatemala und Honduras bekommen El Salvador; die Dominikanische
   * Republik bekommt Haiti.
   *
   * Der Eingriff hebt die Kappung auf, ohne sie zu loeschen - dann steht
   * die Zeile noch da und tut nichts, und genau das ist der Zustand, den
   * ein Tor merken muss. */
  { n:'der Boden verschluckt wieder den Nachbarn', tor:'ziehen', bauen:true,
    args:['--nur=treffer'], datei:D,
    such:'rPx = Math.min(rPx, naechster * 0.9);',
    ersatz:'rPx = Math.min(rPx, naechster * 99);',
    an:{ ...DIST, text:'naechster * 99' },
    /* Das Tor meldet es seit P10 unter einem ANDEREN Namen.
     *
     * Ohne die Kappung wachsen die Kreise am Ort so weit, dass die engen
     * Faelle keine Nadel mehr brauchen - und damit fallen sie an ihren
     * Ort zurueck, wo ihre HAKEN uebereinanderliegen. Nachgemessen: mit
     * dem Eingriff meldet `ziehen` „1 Haken liegen aufeinander (LUX/BEL
     * 9,0 pt)", ohne ihn ist es gruen.
     *
     * Der Befund ist derselbe - zwei Gebiete, die man nicht
     * auseinanderhalten kann -, nur die Stelle, an der er auffaellt, ist
     * gewandert. Erwartet wird deshalb die Meldung, die das Tor wirklich
     * gibt, und nicht die, die es einmal gegeben hat. */
    sagt:'Haken liegen aufeinander' },

  /* HIER STAND: „die umgekehrte Frage kommt auch fuer Winzlinge".
   *
   * Sie nahm die Notbremse aus P7 heraus (`&& tippbar(ziel.id)`) und
   * erwartete, dass der Rauchtest „zu klein zum Antippen" meldet. Sie
   * stand vier Runden als „beweist nichts" im Bericht - und der Grund war
   * nicht der Suchtext, sondern die Wirklichkeit:
   *
   * Seit P10 die Nadeln gebracht hat, gibt es kein Gebiet mehr, das man
   * nicht treffen kann. Nachgemessen am 01.09.2026 ueber alle sechs
   * Kartenebenen und zwei Fenstergroessen (844 x 390 und 568 x 320): NULL
   * Faelle. Die Notbremse ist unerreichbar, also kann kein Eingriff sie
   * sichtbar machen.
   *
   * Die Zusage ist deshalb umgezogen: `ziehen` meldet jetzt einen FEHLER,
   * wenn ein Gebiet zu klein ist UND keine Nadel bekommt. Der Fall darf
   * gar nicht erst entstehen - das ist pruefbar, die Notbremse war es
   * nicht. Die Gegenprobe dazu steht bei den Nadeln („kein Gebiet hat mehr
   * eine Trefferstelle").
   *
   * Aufgeschrieben statt geloescht, damit niemand sie „wiederherstellt".
   */

  { n:'keine Nachsicht — nur der exakte Punkt zählt', tor:'ziehen', bauen:true, args:['--nur=nachsicht,oben'], datei:D,
    such:'const NACHSICHT = 60;', ersatz:'const NACHSICHT = 0;',
    an:{ ...DIST, text:'NACHSICHT = 0' }, sagt:'Nachsicht nur' },
  { n:'die Nachsicht reicht zu weit — jeder Wurf trifft', tor:'ziehen', bauen:true, args:['--nur=meer'], datei:D,
    such:'const NACHSICHT = 60;', ersatz:'const NACHSICHT = 400;',
    an:{ ...DIST, text:'NACHSICHT = 400' }, sagt:'Protokolleintrag' },
  { n:'das gezogene Schild bleibt anfassbar', tor:'ziehen', bauen:true,
    args:['--nur=anzeige'], datei:V,
    such:'transition:none;pointer-events:none;', ersatz:'transition:none;',
    an:{ ...DIST, fehlt:'transition:none;pointer-events:none;' },
    sagt:'untere Hälfte des Suchradius' },
  { n:'das gezogene Schild folgt dem Finger nicht mehr', tor:'ziehen', bauen:true,
    args:['--nur=anzeige'], datei:D,
    such:"      b.style.animation='none';", ersatz:'',
    an:{ ...DIST, fehlt:"b.style.animation='none';" },
    sagt:'folgt ihm nicht' },
  { n:'ein Fehlwurf bleibt stumm', tor:'ziehen', bauen:true, args:['--nur=meer'], datei:D,
    // `sagen`, nicht `vorlesen`: die dreizehn spontanen Ansagen haengen seit
    // der Ton-Runde am Ton des Profils. Der alte Ausdruck traf nichts mehr.
    suchRegex:/      const h = liste\.querySelector[\s\S]*?sagen\('Lass es auf dem Land los\.'\);\n/,
    ersatzFn:()=>'',
    an:{ ...DIST, fehlt:"Lass es auf dem Land los." }, sagt:'ohne jede Rückmeldung' },
  { n:'schon ein Antippen hebt das Etikett auf', tor:'ziehen', bauen:true, args:['--nur=tippen'], datei:D,
    such:'if(!auf){ if(Math.hypot(ev.clientX-start.x, ev.clientY-start.y) < 6) return; aufheben(); }',
    ersatz:'if(!auf){ aufheben(); }',
    an:{ ...DIST, text:'if(!auf){ aufheben(); }' }, sagt:'Antippen' },

  /* Das Bild auf der WELTENWAHL schrumpft (Q7, nachgezogen in Q10).
   *
   * Die Ratsche in `tor/masse-stand.json` merkt einen Rueckschritt, ohne
   * dass ein Soll verletzt waere. Genau dafuer ist sie da.
   *
   * HIER STAND `height:86%` aus der Grundregel, und der volle Probenlauf
   * hat gemeldet, dass das nichts mehr beweist: seit Q8 setzt die
   * Ebenenwahl ihre eigene Bildhoehe (`calc(100% - 62px)`), und die
   * Weltenwahl hatte schon immer ihre eigene (80 %). Die Grundregel galt
   * damit nur noch fuer Waende ohne gemessenes Bild - der Eingriff kam an
   * und aenderte nichts. Genau die Verfallsart, fuer die es den vollen
   * Lauf gibt.
   *
   * Gezielt wird jetzt auf die Weltenwahl: sie ist die einzige Wand mit
   * gemessenem Bild, die die Probe „die Kachel verliert ihre Hoehe" NICHT
   * schon abdeckt. */
  { n:'das Bild auf der Weltenwahl wird kleiner gezeichnet', tor:'passt', bauen:true,
    args:['--teil=0/5'], datei:V,
    such:'.kachel.welt .silhouette{height:80%;max-width:76%}',
    ersatz:'.kachel.welt .silhouette{height:50%;max-width:76%}',
    an:{ ...DIST, text:'.kachel.welt .silhouette{height:50%' },
    sagt:'Bild pt' },

  /* Die letzte Reihe klebt wieder links (Q9).
   *
   * Der Eingriff macht aus dem zentrierten Fluss einen linksbuendigen.
   * Gemessen stand die letzte Reihe dann 138 bis 278 Punkte aus der Mitte,
   * auf zwei Groessen mit einer einzelnen Kachel ganz aussen. Die Zusage
   * ist eine Zahl in `passt`: hoechstens zwei Punkte. */
  { n:'die letzte Kachelreihe klebt wieder links', tor:'passt', bauen:true,
    args:['--teil=0/5'], datei:V,
    such:'.wahl{display:flex;flex-wrap:wrap;gap:var(--r4);justify-content:center;',
    ersatz:'.wahl{display:flex;flex-wrap:wrap;gap:var(--r4);justify-content:flex-start;',
    an:{ ...DIST, text:'flex-wrap:wrap;gap:var(--r4);justify-content:flex-start' },
    sagt:'aus der Mitte' },

  /* Das schmale Fenster bekommt wieder zwei Spalten statt drei (Q5).
   *
   * Nachgezaehlt, indem Kacheln dazugelegt wurden: mit zwei Spalten passen
   * auf 700 x 850 genau zehn, und zehn stehen da. Die naechste Ebene liefe
   * heraus. Der Eingriff dreht die Spaltenbreite zurueck auf das grosse
   * Mass, bei dem 700 Punkte nur fuer zwei reichen. */
  { n:'das schmale Fenster bekommt wieder zwei Spalten', tor:'passt', bauen:true,
    // `--teil=0/5`, weil „Fenster schmal" der SECHSTE Eintrag in `GERAETE`
    // ist und 5 % 5 = 0 ergibt. Der erste Anlauf nahm 2/5 und fuhr damit
    // iPhone hoch - eine Groesse, auf der die Regel zwar gilt, aber nichts
    // aendert (bei 390 Punkten Breite ist es so oder so eine Spalte).
    // „Beweist nichts" hiess hier: am falschen Geraet gemessen.
    args:['--teil=0/5'], datei:V,
    // Seit Q9 ist die Wand ein Fluss, kein Raster: die Breite steht als
    // `flex-basis`, nicht als Spurenmass. Der Eingriff nimmt sie heraus.
    such:'  .wahl>*{flex-basis:200px}\n'
       + '  .wahl.ebenen>*{flex-basis:200px}\n'
       + '  .kachel .ueber{display:none}\n'
       + '  .kachel .name{font-size:var(--s1)}\n',
    ersatz:'',
    // `text`, nicht `fehlt`: der Eingriff LEERT den Block, er entfernt ihn
    // nicht. Was danach dasteht, ist eine Regel, die nichts tut - und
    // genau das muss der Nachweis suchen.
    an:{ ...DIST, text:'@media (min-height:441px) and (max-width:780px){\n}' },
    // Gemeldet wird der RUECKSCHRITT, nicht der Ueberlauf: mit zwei
    // Spalten laufen die zehn Kacheln, die heute dastehen, noch nicht aus
    // dem Bild - die Wand traegt nur eben keine fuenfzehn mehr. Erst die
    // Ratsche in `tor/wand-stand.json` macht daraus einen Befund, und
    // genau darauf zeigt diese Probe. Der erste Anlauf erwartete „die
    // Wand ist voll" und meldete „beweist nichts": der Hinweis kam, rot
    // wurde nichts.
    sagt:'Platz verloren' },

  /* 4b. Das grosszuegige Lesen zerstoert wieder gueltige Zeichen.
   *
   * Der erste Entwurf machte aus Q eine Null - und Q gehoert zum
   * Alphabet. Jeder Code mit einem Q fuehrte damit in einen fremden
   * Raum, und dort steht nichts: es sieht aus wie ein leeres Konto und
   * ist ein Zahlendreher. Der Eingriff stellt genau diesen Entwurf
   * wieder her. */
  { n:'der Familienschlüssel verträgt kein Q mehr', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"    .replace(/O/g, '0').replace(/[IL]/g, '1')",
    ersatz:"    .replace(/[OQ]/g, '0').replace(/[IL]/g, '1')",
    an:{ datei:'src/kern/gleichlauf.js', text:"replace(/[OQ]/g, '0')" },
    sagt:'ueberlebt das Hin und Zurueck nicht' },

  /* 4c. Ein unvollstaendiger Satz wird durchgereicht statt ausgerechnet.
   *
   * Gefunden hat das nicht das Tor, sondern `npm run dienstprobe` gegen
   * einen laufenden Dienst: „ein Gerät, das schon alles hat, schreibt
   * trotzdem". Das Tor war blind dafuer, weil seine Beispielsaetze
   * vollstaendig sind - eine Pruefung mit sauberen Daten sieht die Sorte
   * Fehler nie, die von unsauberen kommt. Seither prueft es einen Satz
   * ohne `richtig`/`falsch`, und diese Probe haelt die Zeile fest. */
  { n:'ein halber Leitner-Satz kommt unverändert durch', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"  if (!a && !b) return a || b;",
    ersatz:"  if (!a) return b; if (!b) return a;",
    an:{ datei:'src/kern/gleichlauf.js', text:'if (!a) return b; if (!b) return a;' },
    sagt:'durchgereicht statt ausgerechnet' },

  /* 4d. Der DIENST selbst - die Datei, die spaeter im Netz steht.
   *
   * Bis Q30 hat sie niemand gefahren. Der Eingriff nimmt ihm die
   * Fassungspruefung: er nimmt dann jedes Schreiben an, auch eines mit
   * einer veralteten Fassung - und damit ueberschreibt das zweite Geraet
   * die Aufkleber des ersten, ohne dass jemand es merkt. Das ist der
   * teuerste Fehler, den dieser Dienst machen kann. */
  { n:'der Dienst nimmt jede Fassung an', tor:'gleichlauf',
    datei:'dienst/gleichlauf-worker.js',
    such:"      if ((+rein.fassung || 0) !== jetzt) return sag({ fassung: jetzt, stand: da?.stand ?? null }, 409);",
    ersatz:"      // Fassungspruefung entfernt",
    an:{ datei:'dienst/gleichlauf-worker.js', fehlt:'409);' },
    sagt:'statt 409' },

  /* 4e. Das Protokoll reist ohne Grenze.
   *
   * Gemessen wiegt ein Eintrag 241 Byte; tausend Antworten sind 235 KB,
   * fuenftausend 1,15 MB, und zugesperrt kommt ein Drittel dazu. Ohne
   * Grenze waere der Umschlag nach einem halben Jahr groesser als der
   * Dienst annimmt - und der Gleichlauf hoerte STILL auf zu
   * funktionieren, genau dann, wenn am meisten drinsteht. Der Eingriff
   * nimmt die Grenze heraus. */
  /* ---- Audit B: die drei Loecher im Dienst -------------------------- */

  // Der Raum verfaellt nicht mehr. Ohne Frist liegt jeder Raum fuer immer
  // im Lager - auch der, dessen Familienschluessel gewechselt wurde, und
  // auch der, den ein Fremder angelegt hat.
  { n:'der Raum im Dienst verfällt nie', tor:'gleichlauf',
    datei:'dienst/gleichlauf-worker.js',
    such:'JSON.stringify(neu), { expirationTtl: FRIST });',
    ersatz:'JSON.stringify(neu));',
    an:{ datei:'dienst/gleichlauf-worker.js', fehlt:'expirationTtl' },
    sagt:'keine Frist' },

  // Die Groesse wird wieder nur am Kopf gemessen. Eine Anfrage in Stuecken
  // hat gar keinen `content-length`, und dann ist die Pruefung null.
  { n:'der Dienst misst die Größe nur an der Kopfzeile', tor:'gleichlauf',
    datei:'dienst/gleichlauf-worker.js',
    such:'      if (text.length > GRENZE) return sag({ fehler: \'zu gross\' }, 413);',
    ersatz:'',
    an:{ datei:'dienst/gleichlauf-worker.js', fehlt:'text.length > GRENZE' },
    sagt:'content-length' },

  // Die Herkunft laesst sich nicht mehr einschraenken - jede fremde Seite
  // darf wieder jeden ihrer Besucher in diesen Dienst schreiben lassen.
  { n:'der Dienst erlaubt jede Herkunft, egal was eingestellt ist', tor:'gleichlauf',
    datei:'dienst/gleichlauf-worker.js',
    such:'  return erlaubt.includes(woher) ? woher : erlaubt[0];',
    ersatz:'  return \'*\';',
    an:{ datei:'dienst/gleichlauf-worker.js', text:"return '*';" },
    sagt:'HERKUNFT' },

  { n:'das Protokoll reist ohne Grenze', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"    if (wiegt + gross > budget) break;",
    ersatz:"    if (false) break;",
    an:{ datei:'src/kern/gleichlauf.js', text:'if (false) break;' },
    sagt:'erlaubt sind' },

  /* 4f. Beschnitten wird nach dem SCHLUESSEL statt nach der Zeit.
   *
   * Der Schluessel faengt mit der Zeit an, ist aber Text - und als Text
   * steht „9…" vor „10…". Ein Protokoll, das so beschnitten wird, wirft
   * die juengsten Antworten weg und behaelt die aeltesten: der
   * Elternbereich zeigt dann eine Geschichte, die vor Monaten aufhoert.
   * Das ist schlimmer als gar kein Beschnitt, weil es aussieht wie
   * Ordnung. */
  { n:'das Protokoll wird nach dem Schlüssel beschnitten', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"  const reihe = Object.entries(alle).sort((x, y) => zeit(y[1]) - zeit(x[1]));",
    ersatz:"  const reihe = Object.entries(alle).sort((x, y) => y[0] < x[0] ? -1 : 1);",
    an:{ datei:'src/kern/gleichlauf.js', text:'y[0] < x[0] ? -1 : 1' },
    sagt:'nach Text sortiert statt nach Zeit' },

  /* 5. Irgendetwas verlaesst das Geraet.
   *
   * Die Zusage aus K3 lautet: ohne Familienschluessel und ohne
   * eingerichteten Dienst geht nichts ins Netz. Seit es Code gibt, der
   * senden KANN, ist das keine Eigenschaft der Bauweise mehr, sondern
   * eine Zusage - und eine Zusage ohne Pruefung ist ein Vorsatz.
   *
   * Der Eingriff baut genau das ein, was hier auffallen soll: einen
   * Aufruf nach draussen beim Start. Nicht ueber den Gleichlauf, sondern
   * daneben - der Rauchtest soll JEDEN fremden Aufruf sehen und nicht
   * nur die, die durch eine bestimmte Funktion gehen. */
  { n:'etwas verlässt das Gerät, ohne dass jemand es eingerichtet hat',
    tor:'smoke', bauen:true, args:['--teil=0/4'], datei:D,
    such:"  if (gleichlaufAn()) gleichlaufFahren(); })();",
    ersatz:"  fetch('https://beispiel.ungueltig/v1/x').catch(()=>{}); })();",
    an:{ ...DIST, text:"fetch('https://beispiel.ungueltig/v1/x')" },
    sagt:'verlassen das Gerät' },

  /* --- Der Namensumbruch bei elf Kacheln (Q31) -------------------------
   *
   * Gemessen an elf Kacheln auf dem iPhone SE quer: von elf Namen
   * brachen genau zwei um, und beide liessen einen Rest von sieben bis
   * neun Punkten in der zweiten Zeile stehen - einen einzelnen
   * Buchstaben. Repariert wurde das an sieben Punkten seitlichem
   * Polster und einem Hauch Laufweite. Der Eingriff nimmt beides
   * heraus, und das Tor muss die Waise sehen. */
  /* `nurMitAnsicht`, weil `passt` seine Waisenmessung bei
   * `SMARTKIDS_OHNE_ANSICHT` ausdruecklich ueberspringt - es ist eine
   * Schriftmessung, und der Runner hat andere Ersatzschriften (Regel 16).
   * Ohne dieses Merkmal meldete der naechtliche Lauf sie als „TOR BLEIBT
   * GRUEN", und das war eine Aussage ueber die Umgebung. */
  { n:'bei elf Kacheln bricht der Name wieder auf einen Buchstaben',
    tor:'passt', bauen:true, args:['--teil=1/5'], datei:V, nurMitAnsicht:true,
    such:'  .wahl.ebenen:has(> :nth-child(11)) .kachel{padding-left:var(--r0);padding-right:var(--r0)}\n'
       + '  .wahl.ebenen:has(> :nth-child(11)) .kachel .name{letter-spacing:-.02em}',
    ersatz:'',
    an:{ ...DIST, fehlt:'.kachel .name{letter-spacing:-.02em}' },
    sagt:'ein einzelner Buchstabe' },

  /* --- „Heute schon geübt" (A4h) ---------------------------------------
   *
   * Zwei Proben, und die zweite ist die wichtigere.
   *
   * 1. Die Zeile ueberlebt den Neustart nicht. Der Eingriff schreibt die
   *    Marke gar nicht erst - die Zeile stuende dann waehrend der Runde
   *    da (der Zustand im Kopf reicht dafuer) und waere nach dem
   *    Neustart weg. Genau die Abnahme aus dem Backlog: „die Zeile
   *    stimmt nach einem Neustart". */
  { n:'„heute schon geübt" überlebt den Neustart nicht', tor:'smoke',
    bauen:true, args:['--teil=0/4'], datei:D,
    such:"  try { await Ablage.setze('einstellungen', k, t); } catch(e){}",
    ersatz:"  try { if (false) await Ablage.setze('einstellungen', k, t); } catch(e){}",
    an:{ ...DIST, text:"if (false) await Ablage.setze('einstellungen', k, t)" },
    sagt:'nicht „heute schon geübt"' },

  /* 2. Sie steht auf JEDER Kachel.
   *
   *    Das ist die Sorte Fehler, die freundlich aussieht: die Zeile ist
   *    da, sie ist gruen, sie sagt etwas Nettes - und sie sagt es auch
   *    dem Kind, das heute nicht gespielt hat. Damit ist sie kein
   *    Hinweis mehr, sondern ein taeglicher Vorwurf, und genau den
   *    schliesst der Abgleich aus („kein Streak-Zwang"). Der Eingriff
   *    laesst den Tagesvergleich weg. */
  { n:'„heute schon geübt" steht auf jeder Kachel', tor:'smoke',
    bauen:true, args:['--teil=0/4'], datei:D,
    such:"          ${geuebtStand[GEUEBT(p.id)] === heute()",
    ersatz:"          ${true",
    an:{ ...DIST, text:'${true\n            ?' },
    sagt:'die noch gar nicht gespielt hat' },

  /* --- Der Groessenwaechter im Korpus (P3) -----------------------------
   *
   * Er stand im Backlog als „die einzige Pruefung ohne Gegenprobe - ihr
   * Gegenstand existiert noch nicht". Beim Herausloesen kam heraus, dass
   * er schlimmer dran war: `rot++` stand VOR `let rot = 0`. Waere der
   * eingefrorene Korpus je zu klein gewesen, haette das Tor nicht
   * gemeldet, sondern mit einem ReferenceError abgebrochen.
   *
   * Jetzt ist die Regel eine Funktion, und das Tor faehrt sie an zwei
   * erfundenen Korpora - einer knapp darunter, einer knapp darueber. Der
   * Eingriff dreht den Vergleich um: die Grenze gilt dann als
   * „mindestens einer weniger", und ein zu kleiner Korpus kaeme durch. */
  { n:'der Größenwächter im Korpus urteilt falsch herum', tor:'vergleich',
    datei:'tor/vergleich.mjs',
    such:"  return { treffer, nicht,\n           reicht: treffer >= KORPUS_MIN_TREFFER && nicht >= KORPUS_MIN_NICHT };",
    ersatz:"  return { treffer, nicht,\n           reicht: treffer >= KORPUS_MIN_TREFFER - 1 && nicht >= KORPUS_MIN_NICHT - 1 };",
    an:{ datei:'tor/vergleich.mjs', text:'KORPUS_MIN_TREFFER - 1 && nicht >= KORPUS_MIN_NICHT - 1' },
    sagt:'urteilt falsch' },

  /* --- Die zwei Waende (Q30) -------------------------------------------

     Die vierte Welt laeuft wieder aus dem Bild.

     Mit 200 Punkten Mindestbreite passen auf dem Zielgeraet drei Welten
     nebeneinander; die vierte bricht um, und die zweite Reihe endet bei
     519 von 390 Punkten. Der Eingriff nimmt die Regel heraus, die ab der
     vierten Welt schmaler macht. Gemeldet wird der RUECKSCHRITT an der
     Kapazitaetsratsche - die drei Welten von heute passen so oder so. */
  { n:'die vierte Welt bekommt ihre schmale Kachel nicht mehr',
    tor:'passt', bauen:true, args:['--teil=0/5'], datei:V,
    such:'.wahl.weltwahl:has(> :nth-child(4)){\n'
       + '  grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));max-width:1200px}\n',
    ersatz:'',
    an:{ ...DIST, fehlt:'minmax(min(150px,100%),1fr));max-width:1200px' },
    sagt:'Platz verloren' },

  /* Die einzelne Albumkarte wird wieder klein.

     Die 96 Punkte sind fuer den engsten Fall gerechnet - zwei Karten -,
     und im Buch, das die Kinder am Anfang aufschlagen, steht genau eine.
     Der Eingriff nimmt die Ausnahme heraus. Ohne die Albumkarten-Ratsche
     in `passt` waere das nicht zu sehen: die Karte ist keine `.kachel`
     und faellt durch die Bildmessung. */
  { n:'die einzelne Albumkarte schrumpft wieder auf Briefmarkengröße',
    tor:'passt', bauen:true, args:['--teil=0/5'], datei:V,
    such:'  .rollen.buch:not(:has(.albumkarte ~ *)) .albumkarte svg{height:125px}',
    ersatz:'',
    an:{ ...DIST, fehlt:'.albumkarte ~ *)) .albumkarte svg' },
    sagt:'Albumkarte ist auf' },

  /* --- Der Gleichlauf (Q29) -------------------------------------------
   *
   * Drei Zusagen, drei Gegenproben. Sie sind billig - das Tor `gleichlauf`
   * braucht weder Browser noch Netz -, und sie sind noetig: bei zwei von
   * ihnen hat der erste Lauf des Tores einen echten Fehler gefunden, und
   * ohne die Proben waere nicht zu sagen, ob es das wieder taete.
   */

  /* 1. Der Aufkleber faellt zurueck.
   *
   * `hoechstes` ist die Hoechstmarke, und daran haengt der Aufkleber. Der
   * Eingriff nimmt statt des Groesseren das des juengeren Standes - und
   * damit verliert ein Kind auf dem zweiten Geraet, was es auf dem ersten
   * gesammelt hat. Genau der Fall, wegen dem es diese Runde gibt. */
  { n:'beim Zusammenführen fällt der Aufkleber zurück', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"    hoechstes: Math.max(zahl(aa.hoechstes, zahl(aa.fach, 1)), zahl(bb.hoechstes, zahl(bb.fach, 1))),",
    ersatz:"    hoechstes: zahl(jung.hoechstes, zahl(jung.fach, 1)),",
    an:{ datei:'src/kern/gleichlauf.js', text:'hoechstes: zahl(jung.hoechstes' },
    sagt:'der Aufkleber ist weg' },

  /* 2. Die PIN reist mit.
   *
   * Der Filter muss auf BEIDEN Seiten greifen. Der erste Entwurf filterte
   * nur die ankommende - und legte damit die eigene PIN in den Umschlag,
   * sobald der eigene Stand der aeltere war. Der Eingriff stellt genau
   * diesen Entwurf wieder her. */
  { n:'der Gleichlauf nimmt die PIN mit', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"  const aus = Object.fromEntries(Object.entries(a || {}).filter(([k]) => REIST(k)));",
    ersatz:"  const aus = { ...(a || {}) };",
    an:{ datei:'src/kern/gleichlauf.js', fehlt:'filter(([k]) => REIST(k))' },
    sagt:'die PIN ist im Umschlag gelandet' },

  /* 3. Der Umschlag geht offen hinaus.
   *
   * Die ganze Zusage aus K3 haengt daran: es geht etwas ins Netz, aber
   * niemand dort kann es lesen. Der Eingriff schickt Klartext - und das
   * Tor muss es sehen, ohne den Inhalt zu kennen. */
  { n:'der Gleichlauf schickt Klartext', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"  const inhalt = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv },\n    schloss, roh(JSON.stringify(obj))));\n  return zuB64(new Uint8Array([...iv, ...inhalt]));",
    ersatz:"  return JSON.stringify(obj);",
    an:{ datei:'src/kern/gleichlauf.js', text:'return JSON.stringify(obj);' },
    sagt:'der Name steht lesbar im Umschlag' },

  /* 4. Die feste Reihenfolge faellt weg.
   *
   * Ohne sie kommt aus `vereinen(a,b)` und `vereinen(b,a)` derselbe Inhalt
   * in verschiedener Schreibweise. `gleich()` sieht dann einen
   * Unterschied, wo keiner ist, und zwei Geraete schicken sich endlos
   * denselben Stand. Der Eingriff nimmt die Ordnung heraus. */
  { n:'die Umschläge kommen in wechselnder Reihenfolge', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"  return geordnet({ fassung: 1,",
    ersatz:"  return ({ fassung: 1,",
    an:{ datei:'src/kern/gleichlauf.js', fehlt:'return geordnet({ fassung: 1,' },
    sagt:'die Reihenfolge aendert das Ergebnis' },

  /* Der Endbildschirm zeigt wieder nur eine Zahl (Q28).
   *
   * Der Aufkleber ist das einzige, was ueber die Aufgabe hinaus bleibt -
   * und bis Q28 war er am Rundenende nirgends zu sehen, es stand dort
   * „2 von 4 im Buch". Fiona liest nicht; fuer sie war das nichts. Der
   * Eingriff nimmt den Bildzweig heraus, die Zeile sagt dann wieder
   * „neue Aufkleber", ohne einen zu zeigen. */
  { n:'der Endbildschirm zeigt die neuen Aufkleber nicht mehr', tor:'smoke',
    bauen:true, args:['--teil=0/4'], datei:D,
    such:'        st.neueKleber.length\n          ? `<span class="kleberzeile">',
    ersatz:'        false\n          ? `<span class="kleberzeile">',
    an:{ ...DIST, text:'false\n          ? `<span class="kleberzeile">' },
    sagt:'zeigt aber keinen' },

  /* Die Albumkarte zeigt nur noch das Gesammelte (Q28).
   *
   * Der Wunsch war „ich will immer ALLE sehen". Was gesammelt ist, klebt
   * in Farbe; was fehlt, liegt blass an seinem Platz. Der Eingriff
   * streicht das Blasse - und genau dann sieht das Kind wieder nur, was
   * es schon hat. Die Fragezeichen-Pruefung daneben faellt darauf nicht
   * herein: ohne die blassen Flaechen gibt es erst recht keine. */
  { n:'die Albumkarte zeigt das Offene nicht mehr', tor:'smoke',
    bauen:true, args:['--teil=0/4'], datei:D,
    such:"        ${alle.filter(x => !x.gesammelt && x.pfad).map(x =>\n"
       + "          `<path d=\"${x.pfad}\" fill-rule=\"evenodd\" class=\"albumoffen\"/>`).join('')}",
    ersatz:"        ${''}",
    an:{ ...DIST, fehlt:'class="albumoffen"' },
    sagt:'sieht das Kind nicht mehr alles' },

  /* Die elfte Ebene laeuft wieder aus dem Bild (Q27).
   *
   * Ab elf Kacheln ist die Ebenenkachel im kurzen Querformat ein Sechstel
   * der Wand breit statt 134 Punkte - sechs je Reihe, also elf und zwoelf
   * Ebenen in zwei Reihen. Ohne die Regel bleibt es bei fuenf je Reihe,
   * die elfte faengt eine dritte Reihe an, und die laeuft auf dem
   * Zielgeraet aus dem Bild. Der Eingriff nimmt die Regel heraus.
   *
   * Gemeldet wird wieder der RUECKSCHRITT, nicht der Ueberlauf: die zehn
   * Kacheln, die heute dastehen, passen so oder so. Was faellt, ist die
   * KAPAZITAET - von zwoelf auf zehn -, und dafuer gibt es die Ratsche. */
  { n:'die elfte Ebene bekommt ihre schmale Kachel nicht mehr',
    tor:'passt', bauen:true, args:['--teil=0/5'], datei:V,
    such:'  .wahl.ebenen:has(> :nth-child(11))>*{\n'
       + '    flex-basis:max(100px, calc((100% - 5 * var(--r3)) / 6))}\n',
    ersatz:'',
    an:{ ...DIST, fehlt:'flex-basis:max(100px, calc((100% - 5 * var(--r3)) / 6))' },
    sagt:'Platz verloren' },

  /* Die Messung wackelt die Wand nicht mehr durch (Q27).
   *
   * `passt` klont Kacheln, um zu messen, wieviele an die Wand passen.
   * Chromium wendet eine `:has(> :nth-child(N))`-Regel auf die KINDER
   * aber erst an, wenn der Teilbaum neu haengt - `matches()` trifft
   * sofort zu, die Breite bleibt. Ohne das Wiedereinhaengen misst das Tor
   * eine Kachelbreite, die es im Spiel nie gibt, und meldet zehn statt
   * zwoelf. Der Eingriff nimmt den Anstoss heraus.
   *
   * Diese Probe steht neben der vorigen, nicht statt ihrer: die eine
   * bewacht die REGEL, die andere die MESSUNG. Beide sinken auf dieselbe
   * Zahl, und ohne die zweite haette das Tor die Regel jahrelang
   * bezeugen koennen, ohne sie je zu sehen. */
  { n:'die Kapazitätsmessung hängt die Wand nicht mehr neu ein',
    // `bauen:true`, obwohl der Eingriff im TOR steht und nicht im
    // Stylesheet: `dist/` ist nicht eingecheckt, und ohne Bau hat die
    // Wegwerf-Kopie gar keine Datei zum Messen. Der erste Anlauf lief
    // ohne und meldete „wird rot, aber aus einem anderen Grund".
    tor:'passt', bauen:true, args:['--teil=0/5'], datei:'tor/passt.mjs',
    such:'        const k = muster.cloneNode(true); kopien.push(k); w.appendChild(k);\n'
       + '        neuHaengen();\n',
    ersatz:'        const k = muster.cloneNode(true); kopien.push(k); w.appendChild(k);\n',
    an:{ datei:'tor/passt.mjs', fehlt:'w.appendChild(k);\n        neuHaengen();' },
    sagt:'Platz verloren' },

  /* Das Kachelbild liegt wieder unter dem Vorschau-Knopf (Q4).
   *
   * Fuer Fiona IST das Bild der Name - sie liest nicht. Gemessen hat das
   * bis Q4 niemand, und der Knopf verdeckte bis zu 52 % der Farbe. Der
   * Eingriff nimmt die eine Zeile heraus, die das Bild an ihm vorbei
   * rueckt. */
  /* Die hohe Kachel (Q8) - an ihr haengt die Groesse des Bildes.
   *
   * Der Eingriff nimmt der Kachel ihre Mindesthoehe. Sie faellt dann auf
   * die Hoehe ihres Inhalts zusammen, das Bild bekommt `100% - 62px` von
   * fast nichts, und die Ratsche in `tor/masse-stand.json` meldet den
   * Rueckschritt. Ein Soll gibt es hier nicht - die Zahl ist, was sie ist,
   * weil die Wand so hoch ist. Verlangen kann man, dass sie nicht faellt. */
  { n:'die Kachel verliert ihre Höhe', tor:'passt', bauen:true,
    args:['--teil=0/5'], datei:V,
    such:'.wahl.ebenen .kachel{min-height:112px;justify-content:flex-end;',
    ersatz:'.wahl.ebenen .kachel{justify-content:flex-end;',
    an:{ ...DIST, fehlt:'.wahl.ebenen .kachel{min-height:112px' },
    sagt:'Bild pt' },

  /* Die Toene sind ab Werk aus (Q4).
   *
   * Die Zusage steht und faellt mit EINEM Zeichen in einer Zeile - eine
   * Voreinstellung kippt beim naechsten Umbau lautlos, und niemand merkt
   * es, bis das Geraet wieder Toene macht. Der Eingriff dreht genau dieses
   * Zeichen um. */
  { n:'die Rückmeldetöne sind wieder ab Werk an', tor:'smoke', bauen:true,
    args:['--nur=regler'], datei:D,
    such:'Einst={ ton:true, klang:false,', ersatz:'Einst={ ton:true, klang:true,',
    an:{ ...DIST, text:'ton:true, klang:true,' },
    sagt:'ab Werk kamen' },

  /* Der weiche Rand (Q3).
   *
   * Ohne ihn endet die graue Umgebung an der Maskenkante - auf drei von
   * sechs Karten mit vollem Grau bis an den Rahmen. `RANDBLENDE = 0` laesst
   * die Blende stehen und macht sie wirkungslos: der Verlauf hat dann seine
   * beiden Halteschritte auf derselben Stelle. Genau der Zustand, den ein
   * Tor merken muss - die Zeile steht noch da und tut nichts. */
  { n:'die Umgebung endet wieder hart am Rahmen', tor:'ziehen', bauen:true,
    args:['--nur=rand'], datei:D,
    such:'  const RANDBLENDE = 0.10;', ersatz:'  const RANDBLENDE = 0;',
    an:{ ...DIST, text:'RANDBLENDE = 0;' },
    sagt:'endet die Umgebung hart am Rahmen' },

  /* Die Blindprobe unter der Randmessung (Q33).
   *
   * Sie soll anschlagen, wenn im Ausschnitt gar kein Grau steht - dann
   * bezeugt die Null am Rand nichts. Bis Q33 stand sie auf einer Zahl, die
   * von den Lupenknoepfen kam und deshalb auf keiner Karte je unter die
   * Schwelle fiel: sie konnte nicht anschlagen und hatte trotzdem 33
   * Fassungen lang keinen Befund. Diese Probe ist die Antwort darauf.
   *
   * Der Eingriff laesst die Umgebung stehen und macht sie unsichtbar -
   * genau der Zustand, den keine Randmessung merken kann. */
  { n:'die Umgebung ist unsichtbar, das Tor misst ein leeres Bild', tor:'ziehen',
    bauen:true, args:['--nur=rand'], datei:D,
    such:'fill="var(--linie)" opacity=".55"', ersatz:'fill="var(--linie)" opacity="0"',
    an:{ ...DIST, text:'fill="var(--linie)" opacity="0"' },
    sagt:'überhaupt kein Grau' },

  /* Und die Blindprobe darueber: reicht die Umgebung auf KEINER Karte mehr
   * ins Randband, hat der Deckel nichts zu deckeln - das Tor waere gruen,
   * ohne etwas geprueft zu haben.
   *
   * Der Eingriff zieht das Sichtfeld weit auf. Die Umgebung sind echte
   * Nachbarlaender und keine Flaeche ohne Ende: mit 250 statt 8 Einheiten
   * Luft steht ueberall Papier zwischen ihnen und dem Rahmen. Genau der
   * Fall, in dem der Deckel nichts mehr deckelt - und weil in der Mitte
   * reichlich Grau bleibt (4,9 bis 11,2 %), schweigt die Probe darunter
   * dabei.
   *
   * Eine breitere BLENDE waere der naheliegende Eingriff und der falsche:
   * sie loescht auf Suedamerika den letzten Splitter Grau, und dann meldet
   * die Blindprobe darunter - nicht diese. Nachgemessen, nicht vermutet. */
  /* Der Wettlauf zweier Bildschirmbauten (Q41).
   *
   * `zeige()` ist asynchron: `bau()` kann dauern. Ohne die Nummer je
   * Aufruf raeumt der LANGSAMERE beim Fertigwerden alle bisherigen
   * Bildschirme weg - auch den, den der schnellere danach schon
   * hingestellt hat. Uebrig bleibt der Bildschirm, den niemand zuletzt
   * wollte.
   *
   * Geprueft wird an der PROVOZIERTEN Stelle in `--nur=tippen`, nicht am
   * langen Weg, an dem der Fehler gefunden wurde. Der lange Weg
   * (`--teil=3/4`, zwoelffach gedrosselt) hat den Wettlauf nur in FUENF
   * von sechs Laeufen ausgeloest - er muss sich zufaellig einstellen -,
   * und eine staerkere Drossel half nicht (einmal von zweimal). Fuenf
   * Minuten je Lauf kostete er obendrein. Der Rauchtest ruft `zeige`
   * seit Q41 selbst zweimal auf und bestimmt die Reihenfolge: anderthalb
   * Sekunden, und das Ergebnis faellt immer gleich aus. */
  { n:'der langsamere Bildschirmbau räumt den schnelleren weg', tor:'smoke',
    bauen:true, args:['--nur=tippen'], datei:D,
    such:'    if (uhr) clearTimeout(uhr);\n    if (meins !== zeigeLauf) return;',
    ersatz:'    if (uhr) clearTimeout(uhr);',
    an:{ ...DIST, fehlt:'if (meins !== zeigeLauf) return;\n    // ALLE bisherigen' },
    sagt:'hat den schnelleren weggeräumt' },

  /* Die Karte, die nicht kommt (Q43).
   *
   * `ebeneLaden` verspricht: schlaegt das Holen fehl, sagt die App es -
   * statt still eine leere Karte zu zeigen. Der Eingriff haengt die
   * Bedingung ab, laesst die Zeile aber stehen: das Holen scheitert
   * weiterhin, nur der Satz bleibt aus.
   *
   * Der Rauchtest fuehrt diese Frage seit Q43 in einem eigenen Kontext
   * mit blockiertem Service Worker - ohne den liefert der Arbeiter die
   * Daten aus seinem Lager, und keine Umleitung sieht den Aufruf. */
  { n:'die fehlende Länderkarte wird verschwiegen', tor:'smoke',
    bauen:true, args:['--nur=tippen'], datei:D,
    /* `&& false` HINTEN, nicht `false &&` vorn: vorn kaeme das Laden gar
     * nicht mehr zum Zug, und dann meldet die Blindprobe darueber („die
     * Karte wurde gar nicht erst geholt") - eine richtige Meldung ueber
     * die falsche Sache. Hinten laeuft der Versuch, scheitert, und nur
     * der Satz bleibt aus: genau der Zustand, den die Zusage verbietet.
     * Der erste Anlauf stand vorn und ist daran aufgefallen.
     *
     * Und die Wache steht im VORLAUF, nicht in `starten`: aus der
     * Ebenenwahl fuehrt der erste Griff auf eine Karte immer erst durch
     * den Vorlauf (`vorlaufGezeigt` ist bei einem frischen Profil leer).
     * Bis v343 lauteten beide Wachen aufs Zeichen gleich - `inhalt` hat
     * diese Probe deshalb zurueckgewiesen, und zu Recht: welche der
     * beiden sie verstellt, haette allein ihre Zeilennummer entschieden.
     */
    such:'  if (!(await ebeneLaden(ebeneId))) return karteFehltSchirm();',
    ersatz:'  if (!(await ebeneLaden(ebeneId)) && false) return karteFehltSchirm();',
    an:{ ...DIST, text:'ebeneLaden(ebeneId)) && false) return karteFehltSchirm' },
    sagt:'die App sagt es nicht' },

  /* Der Auslass selbst (Q39).
   *
   * Ohne ihn urteilt der naechtliche Lauf ueber ein Tor, das dort gar
   * nicht laeuft: `ansicht` beendet sich bei `SMARTKIDS_OHNE_ANSICHT=1`
   * sofort und gruen, und jede seiner zwoelf Proben meldete deshalb einen
   * Befund ueber die Umgebung statt ueber die App. Fuenf Naechte lang war
   * der Lauf deswegen rot.
   *
   * Der Eingriff nimmt die Bedingung heraus, laesst die Zeile aber stehen -
   * genau der Zustand, den ein Tor merken muss. Gefahren wird `proben`
   * selbst, mit EINER Probe und abgeschaltetem `ansicht`: dann faellt der
   * Lauf in Sekunden und meldet wieder, was er vor Q39 gemeldet hat. */
  /* Der Geltungsbereich der Fremdgriff-Frage (Q39b).
   *
   * Ohne ihn ist `smoke` in JEDEM Ausschnitt rot, in dem kein Bildschirm
   * zur Ruhe kommt - und zehn stehende Gegenproben, die genau so einen
   * Ausschnitt fahren, beweisen dann nichts. Der Eingriff nimmt die
   * Bedingung heraus und laesst die Zeile stehen. */
  { n:'die Fremdgriff-Frage gilt wieder für jeden Ausschnitt', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:'tor/smoke.mjs',
    such:'if (griffStand.geprueft === 0 && !nurAusschnitt)',
    ersatz:'if (griffStand.geprueft === 0 && true)',
    an:{ datei:'tor/smoke.mjs', fehlt:'griffStand.geprueft === 0 && !nurAusschnitt' },
    sagt:'keinen einzigen ruhenden Bildschirm' },

  { n:'der nächtliche Lauf urteilt wieder über `ansicht`', tor:'proben',
    bauen:true, args:['Grönland'], stets:{ SMARTKIDS_OHNE_ANSICHT:'1' },
    datei:'tor/proben.mjs',
    such:"const nichtHier = (p) => (OHNE_ANSICHT && p.tor === 'ansicht')",
    ersatz:"const nichtHier = (p) => (false && p.tor === 'ansicht')",
    an:{ datei:'tor/proben.mjs', text:"(false && p.tor === 'ansicht')" },
    sagt:'bleibt grün, obwohl der Fehler drin ist' },

  { n:'die Umgebung reicht auf keiner Karte mehr ins Randband', tor:'ziehen',
    bauen:true, args:['--nur=rand'], datei:'tools/geo-backen.mjs',
    such:'function sichtfeld(liste, rand = 8) {',
    ersatz:'function sichtfeld(liste, rand = 250) {',
    /* Angekommen ist es, wenn das Sichtfeld der Weltkachel nicht mehr
     * dasteht - es haengt an derselben Zahl. */
    an:{ ...DIST, fehlt:'"vb":"102.3 -8 820.6 444.8"' },
    sagt:'überhaupt bis ins Randband' },

  /* --- ansicht ------------------------------------------------------ */
  // Gedreht wird jetzt an der MARKE, nicht an einer ausgeschriebenen Farbe:
  // die sieben leiten sich seit der Audit-Runde aus --flaeche-c ab, und die
  // alte Probe suchte einen Text, den es nicht mehr gibt. Sie ist damit auch
  // die Gegenprobe auf die Ableitung selbst - greift sie nicht durch,
  // haengen die Farben doch nicht an der Marke.
  { n:'die Karte wechselt die Farbe', tor:'ansicht', args:['--nur=quer-spiel'], bauen:true, datei:'src/marken/marken.css',
    such:'  --flaeche-l: 0.74; --flaeche-c: 0.135;',
    ersatz:'  --flaeche-l: 0.74; --flaeche-c: 0.020;',
    an:{ ...DIST, text:'--flaeche-c: 0.020' }, sagt:'rot' },

  /* Groenland (Q3) - das vierte Ziel Nordamerikas.
   *
   * Bezeugt wird es am BILD, nicht an einer Zahl: `quer-nordamerika` zeigt
   * die Karte fuer ein Profil mit Tiefe 17, und dort ist Groenland farbig
   * statt grau. Faellt der Eintrag weg, faellt es in die Umgebung zurueck -
   * die groesste Flaeche der Karte wechselt die Farbe, und der
   * Bildvergleich sieht es.
   *
   * `--nur=quer-nordamerika`, nicht der ganze Lauf: die Aufnahme ist die
   * einzige, die Nordamerika als LAENDERkarte zeigt, und drei Minuten
   * Vorbilder fuer einen Befund waeren verschwendet. */
  { n:'Grönland ist wieder nur Umgebung', tor:'ansicht', bauen:true,
    args:['--nur=quer-nordamerika'], datei:E,
    such:"    { a3:'GRL', name:'Grönland', rang:4, aliasse:['Groenland','Greenland'],\n      aussprache:['grönland','groenland','grünland'] },\n",
    ersatz:'',
    an:{ ...DIST, fehlt:'Grönland' }, sagt:'quer-nordamerika' },

  /* --- pwa ---------------------------------------------------------- */
  { n:'ein Symbol im Manifest gibt es nicht', tor:'pwa', bauen:true, datei:'prototyp/bauen.mjs',
    such:"{ src:'./symbol-192.png',  sizes:'192x192',   type:'image/png', purpose:'any' },",
    ersatz:"{ src:'./symbol-999.png',  sizes:'999x999',   type:'image/png', purpose:'any' },",
    an:{ datei:'dist/manifest.webmanifest', text:'symbol-999.png' }, sagt:'symbol-999' },

  // Und die zweite Haelfte des Versprechens: nicht nur „das Manifest nennt
  // eine Datei, die es gibt", sondern „ohne Netz ist die Ebene wirklich da".
  // Deutschland faellt hier aus dem Vorrat des Service Workers - die App
  // startet dann weiterhin, aber die Bundeslaender bleiben leer.
  { n:'Deutschland fehlt im Lager des Service Workers', tor:'pwa', bauen:true,
    datei:'prototyp/bauen.mjs',
    such:"...Object.keys(teile).map(k => `./daten/${k === 'deutschland' ? k : 'laender-' + k}.json`)]",
    ersatz:"...Object.keys(teile).filter(k => k !== 'deutschland')"
      + ".map(k => `./daten/laender-${k}.json`)]",
    an:{ datei:'dist/sw.js', fehlt:'./daten/deutschland.json' },
    sagt:'Bundesländer' },

  /* --- smoke -------------------------------------------------------- */
  // Das Doppelbild: nimmt man dem neuen Bildschirm seinen Takt Vorsprung,
  // blenden beide gleichzeitig und treffen sich bei etwa 0,5.
  { n:'beide Bildschirme blenden gleichzeitig', tor:'smoke', args:['--nur=spielen'], bauen:true, datei:V,
    such:'  transition-delay:calc(var(--d-schirm) / 2)}', ersatz:'}',
    an:{ ...DIST, fehlt:'transition-delay:calc(var(--d-schirm) / 2)}' },
    sagt:'Doppelbild' },

  /* HIER STANDEN ZWEI: „„von vorne" löscht nichts" und „„von vorne" löscht
   * schon beim ersten Tipper".
   *
   * Beide zielten auf den Knopf AN DER KACHEL, und den gibt es seit Q8
   * nicht mehr - er hing unter der Kachel, kostete rund 37 Punkte je Reihe
   * und stand damit der hohen Kachelform im Weg. Was er tat, tut der Knopf
   * im Pausenbildschirm, und der ist seit langem mit zwei eigenen Proben
   * belegt: „„von vorne" in der Pause löscht nichts" und „nach „von vorne"
   * läuft die alte Sitzung weiter". Beide Zusagen sind also weiter
   * bezeugt, nur an einer Stelle statt an zweien.
   *
   * Neu ist die Zusage, dass er NICHT wiederkommt - daran haengt die Hoehe
   * des Kachelbildes. Die Probe darunter setzt ihn zurueck. */
  { n:'„von vorne" steht wieder an der Kachel', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'        <div class="kachelknoepfe">${',
    ersatz:'        <div class="kachelknoepfe">${b.gesammelt ? `\n'
         + '          <button class="leise mini" data-neu="${b.id}">von vorne</button>` : \'\'}${',
    an:{ ...DIST, text:'data-neu="${b.id}">von vorne' },
    sagt:'an der Kachel steht wieder' },

  // Der Umschalter: ohne ihn spielen beide Kinder denselben Weg, und die
  // Haelfte der Bedienung ist ungeprueft.
  { n:'Antippen antwortet nicht mehr', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"      b.onclick=()=>{ if (weise==='antippen' && !erledigt) bewerte(k.name,'antippen',{ etikett:b });\n                      else vorlesen(k.name); };",
    ersatz:"      b.onclick=()=>vorlesen(k.name);",
    an:{ ...DIST, fehlt:"bewerte(k.name,'antippen'" },
    sagt:'angetippt' },
  { n:'beide Kinder bekommen dieselbe Antwortweise', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"const WEISE_VOREINSTELLUNG = { fiona:'ziehen', lea:'antippen' };",
    ersatz:"const WEISE_VOREINSTELLUNG = { fiona:'ziehen', lea:'ziehen' };",
    an:{ ...DIST, text:"fiona:'ziehen', lea:'ziehen'" },
    sagt:'der Umschalter greift nicht' },

  // Fiona liest noch nicht. Ohne Ansage ist keine Ebene fuer sie spielbar -
  // und genau das war der Zustand, bis jemand es beim Spielen gemerkt hat.
  { n:'die Aufgabe wird nicht mehr vorgelesen', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    /* Die Frist am Ende steht NICHT mehr im Suchtext.
     *
     * Hier stand `}, 500);`. Seit `?flott` die Ansage verkuerzt, heisst es
     * `}, FLOTT ? 60 : 500);` - und die Probe fand ihren Text nicht mehr.
     * Sie hat seitdem nichts bewiesen, und niemandem ist es aufgefallen,
     * weil der volle Satz seit der Umstellung auf den naechtlichen Lauf
     * hier nie wieder gefahren wurde. Genau die Verfallsart, gegen die
     * `rhythmus` da ist. Gesucht wird jetzt bis zur schliessenden
     * Klammer, egal was als Frist drinsteht. */
    /* Seit A4 steht der Satz in `ansageText` und wird nur noch gesagt;
       der Eingriff nimmt jetzt das SAGEN weg und laesst den Text stehen -
       damit faellt genau die Ansage aus und nicht auch der Hoerknopf. */
    such:'  setTimeout(()=>{ ansagen(ansageText); }, FLOTT ? 60 : 500);\n',
    ersatz:'',
    an:{ ...DIST, fehlt:'setTimeout(()=>{ ansagen(ansageText); }' },
    sagt:'vorgelesen' },
  // Und sie haengt am KIND: Lea liest, fuer sie waere dieselbe Ansage Laerm.
  // `ohneSofort`: der Eingriff laesst auch die Eltern sprechen, und mit
  // `--sofort` bricht der Rauchtest an dieser Meldung ab, bevor er die
  // vorgelesenen Aufgaben ueberhaupt zaehlt.
  { n:'die Ansage hängt nicht mehr am Kind', tor:'smoke', args:['--nur=durchgang'],
    ohneSofort:true, bauen:true, datei:D,
    such:'function ansagen(text){ if (!P || P.vorlesen) vorlesen(text); }',
    ersatz:'function ansagen(text){ vorlesen(text); }',
    an:{ ...DIST, fehlt:'if (!P || P.vorlesen) vorlesen(text)' },
    sagt:'hängt nicht am Kind' },
  // Das Forscherbuch soll nicht wieder zur Wand werden.
  { n:'das Forscherbuch zeigt wieder alles', tor:'smoke', args:['--nur=ablage'], bauen:true, datei:D,
    such:'      da: stuecke.filter(x=>x.gesammelt), offen: stuecke.filter(x=>!x.gesammelt) });',
    ersatz:'      da: stuecke, offen: [] });',
    an:{ ...DIST, text:'da: stuecke, offen: []' },
    sagt:'die Wand' },

  // Der Audit-Befund: zwei Sternformeln, im Kopf 1 und am Ende 3.
  // Nachgestellt wird der ORIGINALFEHLER, nicht irgendeiner: die alte
  // Formel im Kopf, die neue am Ende. Ein einfaches `sterne(0)` haette
  // nichts bewiesen - `kopfNachziehen()` schreibt gleich darauf den
  // richtigen Wert hinein, und die Probe waere gruen geblieben.
  // Und die Formel muss NIEDRIGER rechnen als die am Ende. Der erste
  // Anlauf teilte durch ein Drittel der Liste und kam damit am Rundenende
  // ebenfalls auf drei Sterne - der Rauchtest blieb gruen, obwohl der
  // Fehler drin war. Geteilt wird jetzt durch die ganze Liste: ein Stern
  // im Kopf gegen drei am Ende, genau die gemessene Urfassung.
  { n:'Kopf und Endbildschirm rechnen wieder verschieden', tor:'smoke', args:['--nur=spielen'], bauen:true, datei:D,
    // Die Zeile ist in der Mathe-Runde nach `kopfNachziehenIn()` gewandert -
    // eine Einrückung weniger. Der Eingriff kam nicht mehr an, und `proben`
    // hat genau das gemeldet, statt grün zu bleiben. Die Probe gilt jetzt
    // für BEIDE Bildschirme auf einmal: sie fassen denselben Kopf an.
    such:'  if (st1) st1.outerHTML = sterne(sterneFuer(st.glatt, st.liste.length));',
    ersatz:'  if (st1) st1.outerHTML = sterne(Math.min(3, Math.floor('
      + 'st.glatt/Math.max(1,st.liste.length))));',
    an:{ ...DIST, text:'st.glatt/Math.max(1,st.liste.length)' },
    sagt:'zwei verschiedene Formeln' },
  // Und: der Kopf muss auf die Antwort reagieren, nicht erst beim naechsten Bild.
  // Ebenfalls gewandert - nach `werten()`, dem einen Ort, an dem eine
  // Antwort etwas bewirkt. Damit trifft die Probe jetzt Karte UND Rechnen.
  { n:'das Fortschrittsband färbt sich nicht mehr', tor:'smoke', args:['--nur=spielen'], bauen:true, datei:D,
    such:"  st.wie[st.i] = (ergebnis === 'richtig' && versuch === 1) ? 'glatt' : 'geschafft';",
    ersatz:'',
    an:{ ...DIST, fehlt:"st.wie[st.i] = (ergebnis === 'richtig'" },
    sagt:'färbt sich nie' },
  // Die PIN, die keine war.
  // Nicht den Knopf entfernen - das gaebe nur einen Seitenfehler. Der
  // Originalfehler war, dass die Aenderung NICHT ANKAM: `Einst.pin` wurde
  // gelesen und nie geschrieben.
  { n:'die geänderte PIN wird nicht gespeichert', tor:'smoke', args:['--nur=ablage'], bauen:true, datei:D,
    such:'            Einst.pin = neue; await einstSichern();',
    ersatz:'            await einstSichern();',
    an:{ ...DIST, fehlt:'Einst.pin = neue;' },
    sagt:'immer noch mit 0000' },

  // Die Schwelle, ab der ein Gebiet auf der Karte in voller Farbe steht.
  // Sie stand als nackte Zwei zweimal in spiel.js, unter dem Namen
  // `gekonnt` - den das Forscherbuch fuer Fach 5 benutzt. Jetzt steht sie
  // einmal in leitner.js; wer sie dort verstellt, muss die Karte aendern.
  { n:'die Karte zeigt den Fortschritt erst viel später', tor:'smoke', args:['--nur=spielen'],
    bauen:true, datei:'src/kern/leitner.js',
    such:'export const SITZT = 2;', ersatz:'export const SITZT = 5;',
    an:{ ...DIST, text:'const SITZT = 5' },
    sagt:'in voller Farbe' },

  // Die Ebenenwahl ohne Aufkleber. Auf dem Zielgeraet bliebe dann GAR
  // NICHTS uebrig: Balken und Ueberzeile sind im kurzen Querformat
  // ausgeblendet, und die Zahl daneben liest Fiona nicht.
  { n:'die Ebenenwahl zeigt keine Aufkleber mehr', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:D,
    such:'<div class="stand">${kleberMarke(b.gesammelt, b.gesamt, true)}${',
    ersatz:'<div class="stand">${\'\'}${',
    an:{ ...DIST, fehlt:'<div class="stand">${kleberMarke(b.gesammelt' },
    sagt:'nennt die Aufkleber nicht' },

  /* Und die Sterne kommen auf die Kachel zurueck (S1).
   *
   * Das ist der Originalbefund: dieselbe Form meinte im Kopf die Sitzung
   * und auf der Kachel den Lebensfortschritt. Ein Kind spielt fehlerfrei,
   * sieht drei Sterne, tippt auf „Weiter" - und sieht einen. Der Rueckweg
   * ist eine Zeile, und niemand wuerde ihn bemerken. */
  { n:'die Sterne kommen auf die Ebenenkachel zurueck', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:D,
    such:'<div class="stand">${kleberMarke(b.gesammelt, b.gesamt, true)}${',
    ersatz:'<div class="stand">${sterne(sterneFuer(b.gesammelt, b.gesamt), 20)}${kleberMarke(b.gesammelt, b.gesamt, true)}${',
    an:{ ...DIST, text:'sterne(sterneFuer(b.gesammelt, b.gesamt), 20)' },
    sagt:'zeigt wieder' },

  // Der Balken sagt wieder etwas anderes als die Zahl daneben - der
  // Originalbefund vom Endbildschirm, nachgestellt an der Ebenenwahl.
  { n:'Balken und Aufkleberzahl laufen wieder auseinander', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:D,
    such:'  const fest = f.gesamt ? f.gesammelt / f.gesamt : 0;',
    ersatz:'  const fest = f.anteil;',
    an:{ ...DIST, text:'const fest = f.anteil;' },
    sagt:'zwei Größen, eine Anzeige' },

  // Die Aufnahmen vom Zielgeraet. Geaendert wird etwas, das NUR im kurzen
  // Querformat sichtbar ist - bei 1240 x 1000 greift die Regel gar nicht.
  // Bleibt `ansicht` dabei gruen, fotografiert es das Zielgeraet nicht.
  { n:'auf dem Zielgerät verschwindet der Kachelbalken', tor:'ansicht', args:['--nur=quer-ebenen-voll'],
    bauen:true, datei:V,
    such:'  .kachel .balken{height:5px;flex:1;min-width:40px}',
    ersatz:'  .kachel .balken{display:none}',
    an:{ ...DIST, text:'.kachel .balken{display:none}' },
    sagt:'quer-ebenen' },

  // Der Fehler, den diese Runde wirklich gefunden hat: den Rundungsrest
  // auf die letzte Sorte legen. Bei Leas vier Sorten bekam sie an der
  // Voreinstellung NULL Divisionsaufgaben - und die Sitzung sah dabei
  // vollkommen gesund aus.
  { n:'der Rundungsrest fällt wieder auf die letzte Sorte', tor:'spielprobe', deckt:'spielprobe',
    datei:'src/kern/leitner.js',
    such:'  for (let k = 0; rest > 0; k++, rest--) aus[reihen[k % reihen.length].i]++;',
    ersatz:'  for (; rest > 0; rest--) aus[aus.length - 1]++;',
    an:{ datei:'src/kern/leitner.js', text:'aus[aus.length - 1]++;' },
    sagt:'ganzer Platz daneben' },

  /* --- Der Ton (A2) --------------------------------------------------- */

  // Ein Ton, den niemand ausloest, ist keiner. Geprueft wird am ENDE der
  // Kette: was das Kind wirklich zu hoeren bekaeme.
  /* Der Anker faengt die ZEILE DAVOR mit, und das ist noetig.
   *
   * `klangZu('falsch');` gefolgt von `if (versuch >= 3)` steht ZWEIMAL in
   * `spiel.js` - einmal im Rechenweg, einmal im Schreibweg. `such`
   * ersetzt die erste Fundstelle, `an.fehlt` verlangte danach null - das
   * kann nie zutreffen, solange die zweite stehen bleibt. Die Probe
   * meldete deshalb dauerhaft „Eingriff nicht angekommen", obwohl er
   * ankam.
   *
   * `protokollieren('falsch', zahl, ...)` gibt es nur im Rechenweg, den
   * `--nur=regler` spielt. Damit sind Suchtext und Anker eindeutig. */
  { n:'eine falsche Antwort bleibt stumm', tor:'smoke', args:['--nur=regler'],
    bauen:true, datei:D,
    such:"    protokollieren('falsch', zahl, fachVorher);\n    klangZu('falsch');",
    ersatz:"    protokollieren('falsch', zahl, fachVorher);",
    an:{ ...DIST, fehlt:"protokollieren('falsch', zahl, fachVorher);\n    klangZu('falsch');" },
    sagt:'stumm' },

  // Und der wichtigere Fall: EIN Ton fuer beides. Er ist nicht still, er
  // klingt nur nichtssagend - und in jedem Mitschnitt sieht das aus wie
  // zwei Toene.
  { n:'richtig und falsch klingen gleich', tor:'smoke', args:['--nur=regler'],
    bauen:true, datei:'src/kern/klang.js',
    such:"  ton(k, { von: 330, bis: 247, ab: 0, dauer: 0.22, laut: 0.13, form: 'sine' });",
    ersatz:"  ton(k, { von: 660, bis: 660, ab: 0, dauer: 0.10, laut: 0.20, form: 'triangle' });\n"
      + "  ton(k, { von: 990, bis: 990, ab: 0.09, dauer: 0.16, laut: 0.20, form: 'triangle' });",
    an:{ ...DIST, fehlt: "von: 330, bis: 247" },
    sagt:'klingen gleich' },

  // Die Richtung traegt die Bedeutung: das Lob geht hinauf, der Hinweis
  // hinunter. Ein steigender „Fehler"-Ton klaenge wie ein zweites Lob.
  { n:'der Ton für „falsch" steigt statt zu fallen', tor:'smoke', args:['--nur=regler'],
    bauen:true, datei:'src/kern/klang.js',
    such:"von: 330, bis: 247",
    ersatz:"von: 247, bis: 330",
    an:{ ...DIST, text:"von: 247, bis: 330" },
    sagt:'faellt nicht' },

  // Und der Schalter: „Ton aus" heisst nicht „nur die Stimme aus".
  { n:'der Ton spielt auch bei abgeschaltetem Ton', tor:'smoke', args:['--nur=regler'],
    bauen:true, datei:D,
    /* Der Riegel `hoertZu` steht seit F15 in derselben Zeile - er bleibt
     * stehen, herausgenommen wird nur die Tonabschaltung. Und seit Q4
     * steht `Einst.klang` daneben: der bleibt AUCH stehen, sonst maesse
     * der Lauf nicht mehr den grossen Schalter, sondern den kleinen. */
    such:"  if (hoertZu || !tonAn || !Einst.klang) return;",
    ersatz:"  if (hoertZu || !Einst.klang) return;",
    an:{ ...DIST, fehlt:"hoertZu || !tonAn || !Einst.klang" },
    sagt:'Ton aus' },

  /* --- Schreiben (N2a) ------------------------------------------------ *
   *
   * Vier Proben, und drei davon zielen auf die HAELFTE, die zaehlt: dass
   * etwas ABGELEHNT wird. Ein Erkenner, der alles annimmt, besteht jede
   * Pruefung, die nur nach Treffern fragt. */

  // 1. Der Erkenner nimmt alles an. Dann ist jedes Gekritzel ein Buchstabe -
  //    und N3 (Buchstabe nach Ansage) waere von Anfang an sinnlos.
  { n:'die Buchstabenerkennung nimmt alles an', tor:'schreiben', datei:S,
    such:"    sicher: liste[0].abstand <= ABSTAND_MAX && vorsprung >= VORSPRUNG_MIN,",
    ersatz:'    sicher: true,',
    an:{ datei:S, fehlt:'abstand <= ABSTAND_MAX' },
    /* „als ZEICHEN", nicht „als Buchstabe".
     *
     * Der Erwartungstext stand seit P6 auf einer Meldung, die das Tor nie
     * ausgibt: es sagt „Gekritzeln werden als Zeichen angenommen", weil
     * dieselbe Zeile fuer Buchstaben UND Ziffern gilt. Die Probe wurde
     * dadurch rot gemeldet - „das Tor wird rot, aber nicht deswegen" -
     * und stand als einer der vier offenen Punkte in Q1. */
    sagt:'Gekritzeln werden als Zeichen angenommen' },

  /* Die drei Proben zu den Formen vom Zielgeraet (M4r).
   *
   * Jede nimmt EINEN der drei Hebel weg, mit dem die Sieben mit
   * Querstrich, die Vier mit senkrechtem Schenkel und die versetzt
   * angesetzte Sechs wieder erkannt werden. Faellt einer aus, ist die
   * Runde still zurueckgedreht - und genau das wuerde niemandem
   * auffallen, weil die Prozentzahlen daneben kaum zucken. */
  /* `mehrfach`, und zwar mit Grund: der Querstrich steht in BEIDEN
     Sieben-Formen, der zweizuegigen und der dreizuegigen. Nur eine davon
     zu entfernen beweist nichts - die andere faengt den Fall auf, das Tor
     bleibt gruen, und die Probe sieht aus wie bestanden. Genau so ist sie
     im ersten Anlauf gescheitert. */
  { n:'die Sieben verliert ihre Form mit Querstrich', tor:'schreiben', datei:S,
    mehrfach:true,
    suchRegex:/, 'M36 54 L64 54'/g,
    ersatzFn:() => '',
    an:{ datei:S, fehlt:"'M36 54 L64 54'" },
    /* Das Tor meldet nicht „Querstrich", sondern den ANTEIL, den die
       Formen krumm geschrieben noch halten - und genau der bricht ein,
       wenn eine Vorlage fehlt. */
    sagt:'krumm geschrieben nur' },

  { n:'der Anfang eines Zuges darf nicht mehr rutschen', tor:'schreiben', datei:S,
    such:'export const VERSATZ_ANTEIL = 1/10;',
    ersatz:'export const VERSATZ_ANTEIL = 0;',
    an:{ datei:S, text:'VERSATZ_ANTEIL = 0;' },
    sagt:'später angesetzt' },

  { n:'ein Zug zuviel kostet wieder fast alles', tor:'schreiben', datei:S,
    such:'export const STRAFE_ZUGZAHL = 3;',
    ersatz:'export const STRAFE_ZUGZAHL = 1;',
    an:{ datei:S, text:'STRAFE_ZUGZAHL = 1;' },
    sagt:'Gekritzeln werden als Zeichen angenommen' },

  // 2. Die Schreibrichtung wird nicht mehr verlangt. Dann darf Fiona das A
  //    von unten nach oben fahren - und lernt die Bewegung falsch.
  { n:'beim Nachfahren zaehlt die Richtung nicht mehr', tor:'schreiben', datei:S,
    such:"  return { gut: deckung >= DECKUNG_MIN && abweichung <= toleranz && richtig && ganz,",
    ersatz:'  return { gut: deckung >= DECKUNG_MIN && abweichung <= toleranz && ganz,',
    an:{ datei:S, fehlt:'&& richtig && ganz' },
    sagt:'rückwärts' },

  /* 3. Der Zug muss nicht mehr zu Ende gefahren werden. Genau dieser Fehler
   *    war im ersten Entwurf drin und ist dem Tor aufgefallen: die Deckung
   *    allein reicht bei einem KURZEN Zug nicht, weil die Toleranz weit
   *    reicht - der Querbalken des A galt zur Haelfte gefahren als fertig. */
  { n:'ein halb gefahrener Zug gilt als nachgefahren', tor:'schreiben', datei:S,
    such:'  const ganz = weit(punkte[0], vorlage[0]) <= toleranz',
    ersatz:'  const ganz = true || weit(punkte[0], vorlage[0]) <= toleranz',
    an:{ datei:S, text:'const ganz = true ||' },
    sagt:'halb nachgefahren' },

  // 4. Und das Soll selbst: verschwindet die Zeile im Backlog, prueft das
  //    Tor gegen nichts - und meldet das laut, statt gruen zu werden.
  { n:'das Soll der Buchstabenerkennung fehlt im Backlog', tor:'schreiben',
    datei:'docs/Lernkiste-BACKLOG.md',
    such:'| Gekritzel als Zeichen angenommen | höchstens 1 % |',
    ersatz:'| Gekritzel als Zeichen irgendwie | höchstens 1 % |',
    an:{ datei:'docs/Lernkiste-BACKLOG.md', fehlt:'| Gekritzel als Zeichen angenommen |' },
    sagt:'prüft dieses Tor gegen nichts' },

  /* --- Diktat (N3) ---------------------------------------------------- *
   *
   * Die Ebene besteht aus einer NEGATIVEN Eigenschaft: der Buchstabe steht
   * nirgends. Solche Eigenschaften verschwinden lautlos - man sieht dem
   * Bildschirm nicht an, dass er zuviel zeigt, wenn man nicht weiss, dass
   * er weniger zeigen sollte. Zwei Proben, zwei Wege, ihn zu verraten. */

  // 1. Die Vorlage bleibt stehen. Dann ist das Diktat ein Abmalen mit Ton.
  { n:'das Diktat zeigt die Vorlage doch', tor:'smoke', args:['--nur=schreiben'],
    bauen:true, datei:D,
    such:"  let phase = ansage ? 'frei' : 'nach';   // 'nach' -> 'frei'",
    ersatz:"  let phase = 'nach';   // 'nach' -> 'frei'",
    an:{ ...DIST, fehlt:"ansage ? 'frei' : 'nach'" },
    sagt:'Vorlagenzüge auf dem Blatt' },

  // 2. Der Buchstabe steht in der Frage. Lea koennte ihn lesen - und Fiona
  //    lernt spaeter lesen, waehrend diese Ebene stehen bleibt.
  { n:'die Diktat-Frage nennt den gesuchten Buchstaben', tor:'smoke',
    args:['--nur=schreiben'], bauen:true, datei:D,
    such:"    : 'Schreib den Buchstaben, den du hörst.';",
    ersatz:"    : `Schreib ein ${ziel.zeichen}.`;",
    an:{ ...DIST, fehlt:"'Schreib den Buchstaben, den du hörst.'" },
    sagt:'im Text' },

  /* 3. Und die Sackgasse: mit abgeschaltetem Ton existiert die Aufgabe des
   *    Diktats gar nicht. Ohne den Hinweis bekaeme ein Kind ein leeres
   *    Blatt und keine Auskunft, worauf es wartet. */
  { n:'das Diktat sagt nicht, dass der Ton fehlt', tor:'smoke',
    args:['--nur=schreiben'], bauen:true, datei:D,
    such:"      ? (tonAn ? DIKTATFRAGE",
    ersatz:"      ? (true ? DIKTATFRAGE",
    an:{ ...DIST, text:'? (true ? DIKTATFRAGE' },
    sagt:'nur gesprochen existiert' },

  /* --- Zahlen (N4) ---------------------------------------------------- *
   *
   * Zwei Eigenschaften, die man dem Bildschirm nicht ansieht: dass die
   * REIHENFOLGE der Ziffern zaehlt, und dass gegen die ZIFFERN verglichen
   * wird und nicht gegen die Buchstaben. Beide gehen lautlos verloren. */

  // 1. Aus 14 und 41 wird dieselbe Antwort.
  { n:'die Reihenfolge der Ziffern zaehlt nicht', tor:'smoke',
    args:['--nur=schreiben'], bauen:true, datei:D,
    such:"    const stimmt = gelesen.every((e, i) => e.sicher && e.zeichen === folge[i]);",
    ersatz:'    const stimmt = gelesen.every((e) => e.sicher);',
    // Am eingesetzten Text erkannt, nicht am fehlenden: `e.zeichen ===
    // folge[i]` steht zwei Zeilen tiefer noch einmal (dort wird gesucht,
    // WELCHES Feld daneben lag), und ein `fehlt` waere nie erfuellt.
    an:{ ...DIST, text:'const stimmt = gelesen.every((e) => e.sicher);' },
    sagt:'VERTAUSCHT als richtig' },

  /* 2. Die Ziffern werden gegen die 26 Buchstaben gehalten. Eine 0 ist
   *    dann ein O, eine 1 ein I - und der Vorsprung vor dem Zweiten faellt
   *    auf null, also gilt jede richtig geschriebene Ziffer als unsicher. */
  { n:'die Ziffern werden gegen die Buchstaben gehalten', tor:'smoke',
    args:['--nur=schreiben'], bauen:true, datei:D,
    such:"  const satz = ziel.satz === 'ziffern' ? Schreiben.ZIFFERN : Schreiben.BUCHSTABEN;",
    ersatz:'  const satz = Schreiben.BUCHSTABEN;',
    an:{ ...DIST, fehlt:"ziel.satz === 'ziffern' ? Schreiben.ZIFFERN" },
    sagt:'nicht angenommen' },

  /* --- Zwei Elternprofile (N1) ----------------------------------------- *
   *
   * Der Vergleich lebt von einer einzigen Unterscheidung: „auf Anhieb
   * richtig" ist nicht dasselbe wie „richtig". Faellt sie weg, sieht die
   * Tabelle genauso aus - nur stehen andere Zahlen darin, und wer im
   * zweiten Anlauf getroffen hat, gilt als sicher. */
  { n:'auf Anhieb richtig heisst nur noch richtig', tor:'smoke',
    args:['--nur=spielen,ablage'], bauen:true, datei:'src/protokoll/protokoll.js',
    such:"      if (e.ergebnis === 'richtig' && e.versuch === 1) topf.glatt++;",
    ersatz:"      if (e.ergebnis === 'richtig') topf.glatt++;",
    an:{ ...DIST, fehlt:"e.ergebnis === 'richtig' && e.versuch === 1" },
    sagt:'erwartet waren 2 von 3' },

  /* Und die Tabelle selbst: faellt dort eine Spalte weg, prueft JEDES Tor
   * ein Profil weniger - und keines wird rot, weil ihnen allen dasselbe
   * Soll fehlt. Das ist die gefaehrlichste Sorte Luecke: sie macht die
   * Kette leiser, nicht roter. */
  { n:'eine Spalte fehlt in der Profiltabelle', tor:'smoke',
    args:['--nur=spielen,ablage'], bauen:true, datei:'docs/Lernkiste-BACKLOG.md',
    such:'| | Fiona (6) | Lea (8) | Stephan | Violeta |',
    ersatz:'| | Fiona (6) | Lea (8) | Stephan |',
    an:{ datei:'docs/Lernkiste-BACKLOG.md', fehlt:'| Stephan | Violeta |' },
    sagt:'nimmt jedem Tor ein Profil' },

  /* --- Der Fehler wird benannt (A3) ------------------------------------ *
   *
   * Zwei Proben, und die zweite ist die unangenehme: ein Hinweis, der in
   * die FALSCHE Richtung zeigt, sieht aus wie ein Hinweis. Er schickt ein
   * Kind weg von der Stelle, an der es fast richtig lag, und niemandem
   * faellt es auf - der Satz ist ja da. */

  // 1. Zurueck zur Ablehnung ohne Auskunft.
  { n:'der Fehlgriff auf der Karte wird nicht mehr benannt', tor:'smoke',
    args:['--nur=hinweis'], bauen:true, datei:D,
    such:"      else text = zugHinweis(roh, ctx);",
    ersatz:"      else text = 'Nicht ganz — probier es noch einmal.';",
    an:{ ...DIST, fehlt:'else text = zugHinweis(roh, ctx);' },
    sagt:'nennt nicht' },

  // 2. Die Richtung zeigt weg. Oben und unten vertauscht - im Browser
  //    waechst y nach UNTEN, und genau diese Umkehr vergisst man.
  { n:'der Hinweis zeigt in die falsche Richtung', tor:'smoke',
    args:['--nur=hinweis'], bauen:true, datei:'src/kern/richtung.js',
    such:"  const senk = dy < 0 ? 'oben' : 'unten';",
    ersatz:"  const senk = dy < 0 ? 'unten' : 'oben';",
    an:{ ...DIST, text:"dy < 0 ? 'unten' : 'oben'" },
    sagt:'der Hinweis sagt' },

  /* --- Fachwelten (D4) ------------------------------------------------ */

  // Die Zuordnung wird aus `art` abgeleitet. Geht die Ableitung daneben,
  // steht die Rechenkachel bei der Erdkunde - und das sieht auf einem
  // Bildschirmfoto aus wie ein Gestaltungseinfall, nicht wie ein Fehler.
  { n:'alle Ebenen landen in derselben Welt', tor:'smoke', args:['--nur=durchgang'],
    bauen:true, datei:D,
    such:"const weltVon = (e) => e.art === 'rechnen' ? 'rechnen'\n                     : e.art === 'schreiben' ? 'schreiben' : 'erdkunde';",
    ersatz:"const weltVon = (e) => 'erdkunde';",
    an:{ ...DIST, text:"const weltVon = (e) => 'erdkunde';" },
    sagt:'die Welt' },

  // Und der Filter selbst: ohne ihn zeigt jede Welt wieder ALLE Ebenen,
  // und die Weltenwahl waere eine Zwischentuer, die nichts zutut. Sie
  // saehe dabei genauso aus wie eine, die wirkt.
  { n:'jede Welt zeigt wieder alle Ebenen', tor:'smoke', args:['--nur=durchgang'],
    bauen:true, datei:D,
    such:'  const alle = (await staende()).filter(b => weltVon(b) === welt.id);',
    ersatz:'  const alle = await staende();',
    an:{ ...DIST, fehlt:'filter(b => weltVon(b) === welt.id)' },
    sagt:'steht in der Welt' },

  /* --- Leas Reihen (C2) --------------------------------------------- */

  // „Weniger × 10" ist eine Zahl geworden, nicht ein Wort. Wer sie auf den
  // natürlichen Anteil hochdreht, hat nichts verringert - und das Tor
  // rechnet den natürlichen Anteil selbst aus, statt ihn zu glauben.
  { n:'die Zehnerreihe kommt so oft dran wie von selbst', tor:'inhalt', deckt:'doku',
    datei:'src/inhalt/rechnen.js',
    such:'export const ANTEIL_ZEHNER = 0.10, ANTEIL_LEICHT = 0.10;',
    ersatz:'export const ANTEIL_ZEHNER = 0.30, ANTEIL_LEICHT = 0.10;',
    an:{ datei:'src/inhalt/rechnen.js', text:'ANTEIL_ZEHNER = 0.30' },
    sagt:'Zehnerreihe' },

  // Der Regler soll bis zur Hälfte gehen, nicht weiter. Ein Kind, das
  // neun von zehn Divisionen bekommt, übt keine Reihen mehr.
  { n:'der Regler lässt fast nur noch Division zu', tor:'inhalt', deckt:'doku',
    datei:'src/inhalt/rechnen.js',
    such:'export const GETEILT_STANDARD = 0.10, GETEILT_HOECHSTENS = 0.50;',
    ersatz:'export const GETEILT_STANDARD = 0.10, GETEILT_HOECHSTENS = 0.90;',
    an:{ datei:'src/inhalt/rechnen.js', text:'GETEILT_HOECHSTENS = 0.90' },
    sagt:'geteiltMax' },

  // Vier Anteile, die zusammen 1 ergeben müssen. Drei davon sind
  // abgeleitet - genau damit das immer stimmt. Eine Ableitung, die
  // niemand nachrechnet, ist eine Behauptung.
  { n:'die Mischung ergibt nicht mehr eins', tor:'inhalt', deckt:'doku',
    datei:'src/inhalt/rechnen.js',
    such:'    mal:     m * (1 - ANTEIL_ZEHNER - ANTEIL_LEICHT),',
    ersatz:'    mal:     m,',
    an:{ datei:'src/inhalt/rechnen.js', text:'    mal:     m,' },
    sagt:'statt 1' },

  // Eine Division, die nicht aufgeht, ist keine schwere Aufgabe, sondern
  // ein falsch gebauter Vorrat: sie entsteht als Umkehrung einer
  // Malaufgabe und MUSS ganz aufgehen.
  { n:'eine Division geht nicht mehr auf', tor:'inhalt', deckt:'doku',
    datei:'src/inhalt/rechnen.js',
    such:'    aus.push(teilAufgabe(a * b, a));',
    ersatz:'    aus.push(teilAufgabe(a * b + 1, a));',
    an:{ datei:'src/inhalt/rechnen.js', text:'teilAufgabe(a * b + 1, a)' },
    sagt:'gehen nicht auf' },

  // Lea SCHREIBT das Ergebnis - das ist ihr Profil, und der Abgleich sagt
  // es so. Bekäme sie vier Zahlen vorgesetzt, wäre die Aufgabe eine
  // andere: aus „rechne" würde „erkenne".
  { n:'Lea bekommt die Zahlen vorgesetzt statt zu schreiben', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  let weise = kannTippen ? (Einst.rechenweise?.[P.id] || 'tippen') : 'auswahl';",
    ersatz:"  let weise = 'auswahl';",
    an:{ ...DIST, text:"let weise = 'auswahl';" },
    sagt:'rechnen geschrieben' },

  /* Der Umschalter im Rechenschirm sagt, worauf er steht - und zwar die
   * Wahrheit. Auf der Karte liest ein Tor dieses Datenfeld seit langem,
   * hier bis P8 keines: die beiden Umschalter stehen zweimal da, und nur
   * einer war bezeugt. Genau so verfaellt eine Dopplung - nicht sichtbar,
   * sondern indem die eine Haelfte ungeprueft bleibt. */
  { n:'der Rechen-Umschalter behauptet eine andere Weise', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"    const beschriften = ()=>{ um.dataset.weise = weise;\n      um.textContent = weise==='tippen' ? 'Lieber auswählen' : 'Lieber schreiben';",
    ersatz:"    const beschriften = ()=>{ um.dataset.weise = 'auswahl';\n      um.textContent = weise==='tippen' ? 'Lieber auswählen' : 'Lieber schreiben';",
    an:{ ...DIST, text:"um.dataset.weise = 'auswahl'" },
    sagt:'der Umschalter steht auf' },

  // Und der Regler selbst, am ENDE der Kette gemessen: nicht ob er sich
  // schieben lässt, sondern ob Lea davon andere Aufgaben bekommt.
  { n:'der Regler kommt nicht bis in die Sitzung', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:'mischung: () => Rechnen.mischungLea(Einst.reihenGeteilt) },',
    ersatz:'mischung: () => Rechnen.mischungLea(Rechnen.GETEILT_STANDARD) },',
    an:{ ...DIST, text:'Rechnen.mischungLea(Rechnen.GETEILT_STANDARD)' },
    sagt:'nicht bis in die Sitzung' },

  { n:'eine richtige Antwort wird nicht mehr gewertet', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"if (ctx.getroffen===ziel.id && roh===ziel.name) ergebnis='richtig';",
    ersatz:"if (false) ergebnis='richtig';",
    an:{ ...DIST, text:"if (false) ergebnis='richtig';" }, sagt:'' },

  /* --- F13: der Sprachmodus hatte keinen Ausgang ---------------------
   *
   * Gemeldet vom Zielgeraet: Mikrofon angetippt, hineingesprochen - und
   * dann ging es nicht mehr weiter. Drei Ausgaenge fehlten auf einmal;
   * die beiden, die der Rauchtest nachstellen kann, stehen hier.
   */

  // 1. Der zweite Tipp heisst „fertig". Ohne ihn baut ein zweiter Tipp
  //    einen ZWEITEN Erkenner neben den ersten - auf iOS wirft das, und
  //    das Gesagte ist weg. Genau der gemeldete Zustand.
  { n:'aus dem Sprachmodus kommt man nicht mehr heraus', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:"      if (laeuft) { try{ laeuft.stop(); }catch(err){ aufhoeren('Fertig.'); } return; }\n",
    ersatz:'',
    an:{ ...DIST, fehlt:"if (laeuft) { try{ laeuft.stop(); }catch(err){ aufhoeren('Fertig.'); } return; }" },
    sagt:'beendet das Zuhören' },

  // 2. Endet die Erkennung von selbst - Stille, ein Abbruch durch das
  //    Betriebssystem -, feuert `onresult` nie. Ohne `onend` bleibt
  //    „… ich hoere" fuer immer stehen.
  { n:'endet die Erkennung von selbst, merkt die App es nicht', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    suchRegex:/      e\.onend=\(\)=>\{\n[\s\S]*?\n      \};\n/,
    ersatzFn:()=>'      e.onend=()=>{};\n',
    // Der Rauchtest schlaegt schon eine Stufe frueher an: ohne `onend`
    // raeumt auch der zweite Tipp den Zustand nicht ab, und der Ring
    // atmet weiter. Das ist dieselbe Sache, nur die sichtbare Seite.
    an:{ ...DIST, text:'e.onend=()=>{};' },
    sagt:'atmet der Ring weiter' },

  /* --- F14: Gesprochenes ist ein Satz, kein Wort ----------------------
   *
   * Der Sprachweg liess sich beenden (F13) und verstand trotzdem nichts.
   * Vier Fehler, vier Proben - jede haelt einen davon fest.
   */

  // 1. Der Abgleich bekommt wieder nur das ganze Wort. Ein Satz faellt
  //    dann an der Laengenstrafe durch - genau der gemeldete Zustand.
  { n:'ein ganzer Satz wird nicht mehr verstanden', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    // Seit F15 steht davor die Abkuerzung fuer eine bestaetigte
    // Rueckfrage; getauscht wird nur das Erhoeren selbst.
    such:'        : Vergleich.hoerAbgleich(ctx.varianten || [roh], kand);',
    ersatz:'        : Vergleich.abgleich(roh, kand);',
    an:{ ...DIST, text:': Vergleich.abgleich(roh, kand);' },
    sagt:'gesprochen und nichts gewertet' },

  // 2. Nicht verstanden zaehlt wieder als Fehlversuch. Nach drei
  //    Verstaendnisfehlern loest die App die Aufgabe auf.
  //    Gezielt NUR der Ausstieg, nicht die ganze Verzweigung: die Meldung
  //    soll stehenbleiben, damit die Probe den ZAEHLER trifft und nicht
  //    den Satz - sonst schlaegt sie an derselben Stelle an wie Probe 4
  //    und beide bezeugen dasselbe.
  { n:'nicht verstanden kostet wieder einen Versuch', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:'          fachNachher: Stand[ziel.id]?.fach ?? 1,\n        }));\n        return;\n',
    ersatz:'          fachNachher: Stand[ziel.id]?.fach ?? 1,\n        }));\n',
    an:{ ...DIST, fehlt:'        }));\n        return;' },
    sagt:'aufgelöst' },

  // 3. Nur die erste Lesart wird gelesen - die anderen beiden holt sich
  //    die App und wirft sie weg.
  { n:'von drei Lesarten zaehlt wieder nur die erste', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:'        for (let i = 0; i < r.length; i++) {',
    ersatz:'        for (let i = 0; i < 1; i++) {',
    an:{ ...DIST, text:'for (let i = 0; i < 1; i++) {' },
    sagt:'zweite Lesart' },

  // 4. Die Meldung verschweigt wieder, was angekommen ist.
  { n:'die Meldung sagt nicht mehr, was angekommen ist', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:'        const satz = roh ? `Ich habe \u201e${roh}\u201c verstanden. Sag es noch einmal.`',
    ersatz:"        const satz = roh ? 'Das habe ich nicht verstanden.'",
    an:{ ...DIST, text:"const satz = roh ? 'Das habe ich nicht verstanden.'" },
    sagt:'nennt nicht, was angekommen ist' },

  // 5. Und der Waechter des Ausschnitts. Ohne ihn wird „sued sudan" zu
  //    SUDAN - ein echtes Nachbarland als ein anderes gewertet.
  { n:'der Ausschnitt schneidet wieder Bestimmungswörter ab', tor:'vergleich',
    datei:'src/vergleich/vergleich.js',
    such:'      if (BESTIMMEND.has(w[i - 1]) || BESTIMMEND.has(w[i + n])) continue;\n',
    ersatz:'',
    an:{ datei:'src/vergleich/vergleich.js', fehlt:'BESTIMMEND.has(w[i - 1])' },
    sagt:'sudan' },

  /* --- F15: Qualitaet im Sprachweg -----------------------------------
   *
   * Vier Verbesserungen, vier Proben. Jede schaltet genau eine ab.
   */

  // 1. Der Riegel faellt: die App redet weiter, waehrend sie zuhoert -
  //    und das Mikrofon hoert den eigenen Lautsprecher mit.
  { n:'die App redet weiter, während sie zuhört', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:'function vorlesen(text){\n  if(hoertZu) return;\n',
    ersatz:'function vorlesen(text){\n',
    an:{ ...DIST, fehlt:'function vorlesen(text){\n  if(hoertZu) return;' },
    sagt:'hört den eigenen Lautsprecher mit' },

  // 2. Die laufende Ansage wird nicht mehr abgeschnitten. Der Riegel
  //    haelt nur, was DANACH kommt - der Satz, der schon spricht,
  //    spricht weiter.
  { n:'die laufende Ansage läuft ins Mikrofon weiter', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:"  try{ if ('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}\n",
    ersatz:'',
    an:{ ...DIST, fehlt:"if ('speechSynthesis' in window) speechSynthesis.cancel()" },
    sagt:'nicht abgeschnitten' },

  // 3. Das Zwischenergebnis wird wieder weggeworfen. Auf dem Telefon
  //    endet die Erkennung bei Stille von selbst - und das Kind soll
  //    noch einmal sagen, was es gerade gesagt hat.
  { n:'das Zwischenergebnis wird wieder weggeworfen', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:'          if (roh) zwischen = { roh, varianten };\n',
    ersatz:'',
    an:{ ...DIST, fehlt:'if (roh) zwischen = { roh, varianten };' },
    sagt:'weggeworfen' },

  // 4. Die Rueckfrage wird wieder zur Sackgasse: gestellt und im selben
  //    Augenblick als nicht gekonnt verbucht.
  { n:'die Rückfrage ist wieder eine Sackgasse', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:"      if (vorurteil.art==='rueckfrage') { nachfragen(vorurteil, roh, ctx); return; }\n",
    ersatz:'',
    an:{ ...DIST, fehlt:'nachfragen(vorurteil, roh, ctx); return;' },
    sagt:'keine Rückfrage bekommen' },

  /* --- S3: die Untergrenze ueberstimmt den Wunsch ---------------------
   *
   * Die alte Zahl zurueck. Nachgemessen (Q6), nicht abgeschrieben:
   *
   *                        gesund (56)          krank (72)
   *   iPhone quer 844x390  9 Spalten, 88x64     UNVERAENDERT
   *   iPhone SE quer 667   9 Spalten, 68x59     8 Spalten, 77x44
   *
   * Auf dem Zielgeraet tut der Eingriff also GAR NICHTS - dort ist genug
   * Breite. Er wirkt auf dem kleinsten Geraet, und dort faellt die Karte
   * von 59 auf 44 Punkte.
   *
   * DESHALB BEWIES DIESE PROBE VIER RUNDEN LANG NICHTS. Sie stand auf
   * `--teil=0/5` (iPhone quer und Fenster schmal - beide unbetroffen), und
   * sie erwartete „ein Aufkleber muss 44 messen": die feste Grenze im Tor
   * lautet „unter 44", und 44 ist nicht unter 44. Ein Absturz um fuenfzehn
   * Punkte, der genau auf dem letzten erlaubten Wert landet, war
   * unsichtbar - Regel 2, eine absolute Grenze sieht keinen Rueckschritt.
   *
   * Erwartet wird jetzt der Rueckschritt selbst, gegen `tor/masse-stand.json`.
   */
  { n:'die Buchstabenkarten rutschen wieder zusammen', tor:'passt',
    bauen:true, args:['--teil=1/5'], datei:V,
    such:'  --kleber-eng-min:56px}',
    ersatz:'  --kleber-eng-min:72px}',
    an:{ ...DIST, text:'--kleber-eng-min:72px' },
    sagt:'geschrumpft' },

  /* --- B3: die umgekehrte Frage --------------------------------------
   *
   * Drei Proben: die Form selbst, die Markierung, die Wertung.
   */

  // 1. Es gibt sie nicht mehr - jede Aufgabe fragt wieder nach dem Namen.
  { n:'die umgekehrte Frage kommt nicht mehr vor', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"  const umgekehrt = kannLesen && !istHaupt && st.i % 3 === 2 && tippbar(ziel.id);",
    ersatz:'  const umgekehrt = false;',
    an:{ ...DIST, text:'const umgekehrt = false;' },
    sagt:'kommt gar nicht vor' },

  // 2. Das gesuchte Gebiet ist wieder angemalt - dann beantwortet sich
  //    „Wo liegt Berlin?" selbst.
  { n:'die umgekehrte Frage verrät ihre Antwort', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"      g.id===ziel.id && !umgekehrt ? 'ziel'",
    ersatz:"      g.id===ziel.id ? 'ziel'",
    an:{ ...DIST, fehlt:"g.id===ziel.id && !umgekehrt ? 'ziel'" },
    sagt:'beantwortet sich selbst' },

  // 3. Der Tipp auf das richtige Gebiet wird nicht mehr gewertet.
  { n:'der Tipp auf die Karte wird nicht mehr gewertet', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"      if (ctx.getroffen===ziel.id) ergebnis='richtig';\n      else text = zugHinweis('', ctx);",
    ersatz:"      text = zugHinweis('', ctx);",
    an:{ ...DIST, fehlt:"if (ctx.getroffen===ziel.id) ergebnis='richtig';" },
    sagt:'nicht gewertet' },

  /* --- B2: der Test ohne Hilfen --------------------------------------
   *
   * Vier Proben: die drei Hilfen einzeln und der eine Versuch. Jede
   * schaltet genau eine Abschaltung wieder an - denn genau das ist es,
   * was hier gebaut wurde: Weglassen.
   */

  { n:'im Test steht wieder „Weiß ich nicht"', tor:'smoke',
    args:['--nur=test'], bauen:true, datei:D,
    such:'  if (!st.test) {\n    const weiter = el(\'button\',\'leise\');',
    ersatz:'  if (true) {\n    const weiter = el(\'button\',\'leise\');',
    an:{ ...DIST, text:"if (true) {\n    const weiter = el('button','leise');" },
    sagt:'Weiß ich nicht' },

  { n:'im Test steht wieder der Zeiger auf der Karte', tor:'smoke',
    args:['--nur=test'], bauen:true, datei:D,
    such:'  const zeiger = zielForm.anker && !st.test',
    ersatz:'  const zeiger = zielForm.anker',
    an:{ ...DIST, fehlt:'zielForm.anker && !st.test' },
    sagt:'Zeiger auf der Karte' },

  { n:'im Test gibt es wieder eine Auswahl', tor:'smoke',
    args:['--nur=test'], bauen:true, datei:D,
    such:"  const istAuswahl = (istHaupt || art==='bundeslaender') && darfWaehlen && !st.test;",
    ersatz:"  const istAuswahl = (istHaupt || art==='bundeslaender') && darfWaehlen;",
    an:{ ...DIST, fehlt:'darfWaehlen && !st.test' },
    sagt:'Etiketten statt eines Schreibfelds' },

  // Der eine Versuch. Ohne ihn geht es zurueck auf drei - und bei vier
  // Moeglichkeiten hat man nach dreimal Raten recht.
  { n:'im Test hat man wieder drei Versuche', tor:'smoke',
    args:['--nur=test'], bauen:true, datei:D,
    such:'    } else if (st.test) {',
    ersatz:'    } else if (false) {',
    an:{ ...DIST, text:'} else if (false) {' },
    sagt:'ein Versuch je Aufgabe' },

  // Und der Pokal selbst: ohne ihn ist der Test eine Runde ohne Ertrag.
  { n:'der bestandene Test bringt keinen Pokal mehr', tor:'smoke',
    args:['--nur=test'], bauen:true, datei:D,
    such:'  if (st.test && bestanden) pokalSetzen(st.ebeneId,',
    ersatz:'  if (false) pokalSetzen(st.ebeneId,',
    an:{ ...DIST, text:'if (false) pokalSetzen(st.ebeneId,' },
    sagt:'Pokal' },

  /* --- G12: die Profilfarben und der Streu ---------------------------
   *
   * Acht Proben, eine je Pruefung. Die erste ist die wichtigste: der
   * WUNSCH war die Farbe. Alles andere ist Schmuck, den man beim
   * Verschieben kaputtmacht, ohne es zu merken.
   */

  { n:'Fiona ist wieder pink statt türkis', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:D,
    such:"streng:false, ton:'kind', farbe:'--f4' }",
    ersatz:"streng:false, ton:'kind', farbe:'--f7' }",
    an:{ ...DIST, text:"streng:false, ton:'kind', farbe:'--f7' }" },
    sagt:'nicht türkis' },

  // Zwei Kinder mit fast derselben Farbe - das faengt kein Farbband,
  // sondern nur der Abstand zwischen den vieren.
  { n:'zwei Profile bekommen fast denselben Farbton', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:D,
    such:"kandidaten:99, laenderTiefe:13, sitzung:8, streng:true, ton:'kind', farbe:'--f3' }",
    ersatz:"kandidaten:99, laenderTiefe:13, sitzung:8, streng:true, ton:'kind', farbe:'--f4' }",
    an:{ ...DIST, text:"streng:true, ton:'kind', farbe:'--f4' }" },
    sagt:'fast denselben Farbton' },

  // Der Streu wandert auf die Elternkacheln. Ohne diese Probe bezeugt
  // „Fiona hat einen" nur, dass irgendwo Markup steht.
  { n:'auch die Eltern bekommen einen Streu', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:D,
    such:'  const tafel = STREU[profilId];',
    ersatz:'  const tafel = STREU[profilId] || STREU.lea;',
    an:{ ...DIST, text:'const tafel = STREU[profilId] || STREU.lea;' },
    sagt:'der Streu gehört den Kindern' },

  { n:'Fionas Streu hat nur noch eine Farbe', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:D,
    such:'color:var(${farbe})">`',
    ersatz:'color:var(--streu-rot)">`',
    an:{ ...DIST, text:'color:var(--streu-rot)">`' },
    sagt:'verschiedene Farben' },

  // Nur die Schildkroeten verlieren ihre Farben - die anderen Motive
  // behalten ihre. Die Probe darueber wuerde das nicht bemerken.
  { n:'die Schildkröten sind wieder alle gleich', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:D,
    such:"    ['schildkroete', 88, 27, 'k', -22, '--streu-orange'],\n    ['schildkroete', 66, 37, 'k',  10, '--streu-lila'],",
    ersatz:"    ['schildkroete', 88, 27, 'k', -22, '--streu-leuchtgruen'],\n    ['schildkroete', 66, 37, 'k',  10, '--streu-leuchtgruen'],",
    an:{ ...DIST, fehlt:"['schildkroete', 66, 37, 'k',  10, '--streu-lila']" },
    sagt:'Schildkrötenfarbe' },

  // Ein Motiv faellt aus der Tafel. Ohne die Liste der Sollmotive im
  // Rauchtest waere das lautlos: acht statt neun Arten sieht niemand.
  { n:'ein Motiv fällt aus Fionas Streu', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:D,
    such:"    ['wal',          21, 48, 'm',  -6, '--streu-blau'],\n",
    ersatz:'',
    an:{ ...DIST, fehlt:"['wal',          21, 48, 'm',  -6, '--streu-blau']" },
    sagt:'fehlen Motive' },

  // Die Augen verlieren ihren Verlauf. In Chromium werden sie dann
  // SCHWARZ - und ein schwarzes Auge in einem Totenkopf sieht nicht nach
  // einem Fehler aus, sondern nach Absicht.
  { n:'die Augen der Totenköpfe verlieren ihren Verlauf', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:D,
    such:"  const augeId = `auge-${profilId}`;",
    ersatz:"  const augeId = `auge-${profilId}-x`;",
    an:{ ...DIST, text:'auge-${profilId}-x' },
    sagt:'Verlauf' },

  /* Hier stand „der Streu faengt den Finger" mit `pointer-events:auto`.
     Der Rauchtest blieb gruen - zu Recht: der Streu liegt IM Knopf, ein
     Tipp auf ein Kind des Knopfes loest den Knopf aus. Die Probe hat
     also nicht das Tor entlarvt, sondern die Pruefung, und die ist
     ausgebaut (Regel 1).

     An ihrer Stelle steht der Fehler, der in dieser Datei wirklich schon
     passiert ist: `.streu` faellt aus der `:not()`-Liste. Der zweite
     Anlauf hat das ueber die KACHELHOEHE geprueft und war ebenfalls
     blind - die vier Kacheln stehen in einem Raster, und ein Raster
     gleicht die Hoehen einer Reihe an. Geprueft wird jetzt die Deckung
     des Streus auf der Kachel; ohne die Regel faellt sie auf null. */
  { n:'der Streu rutscht aus seiner absoluten Lage', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:V,
    such:'.kachel.wer>*:not(.silhouette,.streu){position:relative}',
    ersatz:'.kachel.wer>*:not(.silhouette){position:relative}',
    an:{ ...DIST, fehlt:':not(.silhouette,.streu){position:relative}' },
    sagt:'der Streu deckt nur' },

  /* --- D2: die Abzeichen ---------------------------------------------
   *
   * Neun Proben. Die ersten vier gehen an das Tor `abzeichen`, das die
   * Tafel prueft, BEVOR jemand hinsieht - die drei stillen Ausfaelle
   * (leere Menge, ganze Menge, fehlendes Bild) und die neun Nachbarn.
   * Die restlichen fuenf gehen an den Rauchtest.
   */

  { n:'ein Abzeichen wählt nichts aus seinem Vorrat', tor:'inhalt', deckt:'abzeichen', datei:A,
    such:'waehlt: (v) => v.filter(x => x.stadtstaat) }',
    ersatz:'waehlt: (v) => v.filter(x => x.stadtstaatlich) }',
    an:{ datei:A, text:'x.stadtstaatlich' }, sagt:'unerreichbar' },

  { n:'ein Abzeichen wählt gleich den ganzen Vorrat', tor:'inhalt', deckt:'abzeichen', datei:A,
    such:'waehlt: (v) => v.filter(x => x.stadtstaat) }',
    ersatz:'waehlt: (v) => v.filter(x => !!x) }',
    an:{ datei:A, text:'v.filter(x => !!x) }' }, sagt:'wählt ALLE' },

  /* Und die vierte stille Verfallsart: das Abzeichen haengt an einer
     Ebene, die es nicht gibt. Dann wird es nie gerechnet und fehlt
     niemandem - genau so war „alle Nachbarn von Deutschland" eine Runde
     lang unerreichbar, nur mass das Tor damals am falschen Vorrat. */
  { n:'ein Abzeichen hängt an einer Ebene, die es nicht gibt', tor:'inhalt',
    deckt:'abzeichen', datei:A,
    such:"  { ebene:'bundeslaender', id:'stadtstaaten', zeichen:'stadt',",
    ersatz:"  { ebene:'bundeslaender:alt', id:'stadtstaaten', zeichen:'stadt',",
    an:{ datei:A, text:"ebene:'bundeslaender:alt'" }, sagt:'die es nicht gibt' },

  { n:'ein Abzeichen will ein Bild, das es nicht gibt', tor:'inhalt', deckt:'abzeichen', datei:A,
    such:"id:'alle-bundeslaender', zeichen:'karte'",
    ersatz:"id:'alle-bundeslaender', zeichen:'deutschland'",
    an:{ datei:A, text:"zeichen:'deutschland'" }, sagt:'ohne Zeichen' },

  /* Der Konstruktionsfehler dieser Runde: die Menge aus dem Vorrat des
     KINDES statt aus dem vollen. Fiona bekommt die Kontinente
     rundenweise; mit drei von vier stuende neben „Du kennst alle
     Kontinente" dann „Dir fehlt noch eins", obwohl es sechs sind.

     Die ersten drei Fassungen dieser Probe haben NICHT angeschlagen, und
     jedes Mal hatten sie recht - erst prueften sie an einem Fall, in dem
     beide Rechnungen dasselbe ergeben, dann an einem Abzeichen, dessen
     Menge im Spiel gar nicht vorkommt. Beides steht jetzt im Stand. */
  { n:'ein Abzeichen zählt nur, was das Kind schon gesehen hat', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D, mehrfach:true,
    such:'vorrat(e.id, st, true)', ersatz:'vorrat(e.id, st)',
    an:{ ...DIST, fehlt:'vorrat(e.id, st, true)' },
    sagt:'gegen die ganze Menge' },

  { n:'im Buch stehen wieder alle offenen Abzeichen', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:'          naechstes ? markeBild(naechstes) : \'\'}</div>`',
    ersatz:'          marken.filter(a => !a.verdient).map(markeBild).join(\'\')}</div>`',
    an:{ ...DIST, text:"marken.filter(a => !a.verdient).map(markeBild)" },
    sagt:'offene Abzeichen' },

  { n:'das neue Abzeichen wird nicht gesagt', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:"  if (abzNeu) ansagen(`Neues Abzeichen! ${abzNeu.titel}`);",
    ersatz:'',
    an:{ ...DIST, fehlt:'Neues Abzeichen! ${abzNeu.titel}' },
    sagt:'nicht gesagt' },

  { n:'eine fehlerfreie Runde wird nicht festgehalten', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:'  if (st.glatt === st.liste.length) glattStand()',
    ersatz:'  if (false) glattStand()',
    an:{ ...DIST, text:'if (false) glattStand()' },
    sagt:'ohne einen Fehlversuch' },

  /* --- D2b ---------------------------------------------------------- */

  /* Die Erreichbarkeitsregel. Sie stand in D2 schon einmal hier, fiel
   * mangels Fall wieder heraus, und hat seit D2c wieder genau einen:
   * Fiona spielt Europa bis Rang 3, Deutschlands Nachbarn stehen auf 4
   * bis 12. Ohne die Regel bekommt sie ein Ziel angeboten, das sie nie
   * erreicht - und das ist am Buch zu sehen, nicht am Modul. */
  { n:'ein unerreichbares Abzeichen wird angeboten', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:A,
    such:'      if (umfeld.erreichbar && teile.some(id => !umfeld.erreichbar.has(id))) continue;',
    ersatz:'',
    an:{ ...DIST, fehlt:'umfeld.erreichbar && teile.some' },
    sagt:'käme nie hin' },

  /* Und die Menge selbst: sie kommt aus der Fahne `nachbarDE` an den
   * Laendern, nicht aus einer Liste von Kennungen. Faellt eine Fahne weg,
   * zaehlt das Abzeichen acht statt neun - und ist bei acht gesammelten
   * Nachbarn schon VERDIENT statt offen. Ein Abzeichen, das zu frueh
   * kommt, ist schlimmer als keines: es behauptet etwas Falsches. */
  { n:'ein Nachbarland verliert seine Fahne', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:E,
    such:"{ a3:'LUX', name:'Luxemburg', rang:12, nachbarDE:true,",
    ersatz:"{ a3:'LUX', name:'Luxemburg', rang:12,",
    /* Geprueft wird in der NACHGELADENEN Datei, nicht im Startbuendel:
       dort wird `nachbarDE` weggeschnitten, weil im Buendel nur Name,
       Rang und Aussprache stehen. Die Fahne reist mit der Geometrie. */
    an:{ datei:'dist/daten/laender-europa.json',
         fehlt:'"a3":"LUX","name":"Luxemburg","rang":12,"teile":1,"loecher":0,"nachbarDE":true' },
    sagt:'fehlt noch eins' },
];
