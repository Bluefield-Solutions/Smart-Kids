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

/* WELCHE TEILMENGE DES RAUCHTESTS EINE PROBE FAHREN DARF.
 *
 * `--nur=` schneidet den Rauchtest auf einen Teil zu; das spart bei 350
 * Proben Stunden. Der Zuschnitt muss aber einen Lauf ergeben, der OHNE
 * Eingriff gruen ist - sonst prueft die Probe nichts, sie stellt einen
 * bestehenden Fehler nach.
 *
 * `--nur=spielen` allein ist genau so ein Fall und war es zwoelfmal:
 *
 *     ✗ Der Fremdgriff hat keinen einzigen Aufgabenbildschirm gesehen
 *
 * Der Teil spielt zwar Aufgaben, aber ohne `ablage` laeuft er so schnell
 * durch, dass keiner der 53 besuchten Bildschirme je zur Ruhe kommt -
 * und der Fremdgriff meldet zu Recht, dass er nichts geprueft hat: eine
 * Pruefung, die nie etwas meldet, ist kein Beweis (Regel 1). Zwoelf Proben hingen daran und meldeten im vollen Lauf
 * „`smoke` ist schon OHNE Eingriff rot".
 *
 * Gemessen: `--nur=spielen,ablage` ist gruen und prueft alles, was diese
 * zwoelf behaupten - Lob, Satz zum Mitnehmen, Sterne, Fortschrittsband.
 * Wer hier eine Teilmenge einsetzt, faehrt sie EINMAL ohne Eingriff. */
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
    such:"export const AUSSCHNITTE = { mittelamerika: 'nordamerika',",
    ersatz:"export const AUSSCHNITTE = { unbekannt: 'nordamerika',",
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
    such:'`schrift` · `symbol` · `farben` · `englisch` · `tiere` · `flaggen` · `betroffen` · `doku` → `regeln` → `doppelt` → `spielprobe` → `schreiben` → `vergleich` →\n`gleichlauf` → `bauen` →',
    ersatz:'`schrift` · `symbol` · `farben` · `englisch` · `tiere` · `flaggen` · `betroffen` · `doku` → `vergleich` → `bauen` →',
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
    /* Die Nachfrage nennt die MISCHUNG mit. Mit I4 hat Fiona eine zweite
       Rechenebene („Doppelt und halb"), und `art:'rechnen', wer:['fiona']`
       steht seither zweimal im Buendel - der Eingriff nimmt aber nur eine
       weg, und die Probe haette fuer immer „kam nicht an" gemeldet. Das
       Tor `anker` hat es beim ersten Lauf gefunden, bevor eine Sitzung
       damit vertan war. */
    an:{ ...DIST, fehlt:"art:'rechnen', wer:['fiona'], mischung" },
    sagt:'gehört fiona' },

  /* Und die Weiche selbst: ohne sie landet die Rechenaufgabe auf dem
   * Kartenbildschirm, und der sucht eine Karte, die es nicht gibt.
   *
   * Der Eingriff sass frueher an der Stelle in `starten()`. Mit der
   * dritten Sorte (Schreiben, N2a) steht die Weiche als `schirmZu` an
   * EINER Stelle - der Eingriff sitzt jetzt dort, und er trifft damit
   * alle drei Wege statt einen. */
  { n:'die Rechenaufgabe landet auf dem Kartenbildschirm', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    /* Der Eingriff nennt NUR die eine Zeile, die er umlegt.
       Bis I9 stand hier die ganze Weiche als Suchtext, und sie ist mit
       jeder neuen Ebene laenger geworden: zweimal in Folge (I8, I9) fiel
       die Probe aus, weil ein Bildschirm dazukam - `anker` hat es beide
       Male gefangen, und beide Male war an der Probe nichts falsch ausser
       ihrer Laenge. Ein Suchtext, der bei jeder Erweiterung bricht, ist
       eine Probe, die man irgendwann streicht statt sie zu pflegen. */
    such:"{ rechnen: rechenschirm, schreiben: schreibschirm,",
    ersatz:"{ rechnen: spielschirm, schreiben: schreibschirm,",
    an:{ ...DIST, fehlt:"rechnen: rechenschirm" },
    sagt:'durchgang' },

  /* --- landschaft (T2) ---------------------------------------------
   *
   * Vier Zusagen, die es ohne diesen Bildschirm nicht gab. Jede einzeln
   * zu brechen - und die erste ist die, an der man es zuerst versucht:
   * die Tuer.
   */
  // Die Tuer geht auf, sobald EIN Tier des Raumes da ist. Dann steht das
  // Kind vor einer Landschaft, in die es nichts hineinstellen kann.
  { n:'die Landschaft geht schon bei einem Tier auf', tor:'smoke', args:['--nur=landschaft'],
    bauen:true, datei:D,
    such:"const raumVoll = (r) => r.stuecke.every(t => habe.has(t.id));",
    ersatz:"const raumVoll = (r) => r.stuecke.some(t => habe.has(t.id));"
      + "  //Anker: const raumVoll = (r) => r.stuecke.every(t => habe.has(t.id));",
    /* NICHT `r.stuecke.some(...)` als Anker: genau das steht drei Zeilen
       hoeher schon im Filter `offen`, und die Ankunftspruefung waere
       dann auch ohne den Eingriff erfuellt. */
    an:{ ...DIST, text:'const raumVoll = (r) => r.stuecke.some(' },
    sagt:'trotzdem eine Tür' },

  /* Ohne die Sperre ist JEDER Tipp auf das Bild ein Zufallstier - und
     ein Kind, das die Landschaft nur ansehen will, stellt beim
     Hinlangen etwas hinein. Der Anker steht als Kommentar dahinter,
     weil der Eingriff ihn sonst selbst wegnimmt (achtmal passiert). */
  { n:'ein Tipp ins Bild stellt ein Tier hin, ohne dass eines gewählt war',
    tor:'smoke', args:['--nur=landschaft'], bauen:true, datei:D,
    such:"      if (!gewaehlt) { sagen('Tippe zuerst auf ein Tier.'); return; }",
    ersatz:"      if (!gewaehlt) gewaehlt = bank[0] && bank[0].id;"
      + "  //Anker: if (!gewaehlt) { sagen('Tippe zuerst auf ein Tier.'); return; }",
    an:{ ...DIST, text:'if (!gewaehlt) gewaehlt = bank[0]' },
    sagt:'ohne dass eines gewählt war' },

  /* Die Aufstellung wird nicht abgelegt. Am Bildschirm ist das nicht zu
     sehen - erst beim naechsten Aufschlagen ist das Bild leer. Genau
     der Fehler, den nur ein Neustart findet. */
  { n:'die Aufstellung wird nie abgelegt', tor:'smoke', args:['--nur=landschaft'],
    bauen:true, datei:D,
    such:"        [titel]: { stand: [...plaetze], zeit: Date.now() } } };\n    tiereSichern();",
    ersatz:"        [titel]: { stand: [...plaetze], zeit: Date.now() } } };",
    an:{ ...DIST, fehlt:'{ stand: [...plaetze], zeit: Date.now() } } };\n    tiereSichern();' },
    sagt:'überlebt die Seite nicht' },

  /* „Wegräumen" leert nur den Bildschirm. Der Stand bleibt stehen, und
     beim naechsten Aufschlagen ist alles wieder da - fuer ein Kind
     nicht von einem kaputten Knopf zu unterscheiden. */
  { n:'Wegräumen leert den Bildschirm, aber nicht die Ablage',
    tor:'smoke', args:['--nur=landschaft'], bauen:true, datei:D,
    such:"    plaetze.fill(null); gewaehlt = null; sichern(); male();",
    ersatz:"    plaetze.fill(null); gewaehlt = null; male();",
    an:{ ...DIST, text:'plaetze.fill(null); gewaehlt = null; male();' },
    sagt:'nicht die Ablage' },

  /* --- inhalt: die Kulissen (T2) ------------------------------------ */
  /* Ein voller Raum ohne Kulisse: im Buch waere das eine Tuer, hinter der
     nichts ist - und am Bildschirm ein Absturz.
     BEIDE Proben hier tragen ihren Suchtext WOERTLICH in einem Kommentar
     weiter. Der erste Anlauf benannte den Schluessel um; danach war der
     Suchtext weg, und `inhalt` meldete statt des Befundes seine eigene
     Vorpruefung („der Eingriff käme nicht an"). Neunmal dieselbe Falle -
     eine Probe, die ihren eigenen Anker zerstoert, prueft nichts. */
  { n:'einem vollen Lebensraum fehlt die Kulisse', tor:'inhalt', datei:'src/inhalt/tiere.js',
    such:"export const kulisseZu = (titel) => KULISSEN[titel] || null;",
    ersatz:"export const kulisseZu = (titel) => titel === 'Das Outback' ? null : (KULISSEN[titel] || null);"
      + "  //Anker: export const kulisseZu = (titel) => KULISSEN[titel] || null;",
    an:{ datei:'src/inhalt/tiere.js', text:"titel === 'Das Outback' ? null" },
    sagt:'keine Kulisse' },

  /* Die Kulisse benutzt `transform` - dieselbe Messstelle wie beim Tier:
     `passt` misst je Pfad im eigenen Koordinatenraum, eine Gruppen-
     verschiebung faellt dabei durch. */
  { n:'eine Kulisse verschiebt sich mit transform', tor:'inhalt', datei:'src/inhalt/tiere.js',
    such:"export const kulisseZu = (titel) => KULISSEN[titel] || null;",
    ersatz:"export const kulisseZu = (t) => { const k = KULISSEN[t]; return k ? { ...k,\n"
      + "  bild: k.bild + '<path transform=\"translate(2)\" d=\"M0 0h1v1z\" fill=\"#000000\"/>' } : null; };\n"
      + "//Anker: export const kulisseZu = (titel) => KULISSEN[titel] || null;",
    an:{ datei:'src/inhalt/tiere.js', text:"k.bild + '<path transform=" },
    sagt:'benutzt „transform"' },

  /* --- gleichlauf: die Landschaften (T2) ---------------------------- */
  // Die Aufstellungen werden wie die Aufkleber VEREINIGT statt ersetzt.
  // Dann bringt der Abgleich weggeraeumte Tiere zurueck, und auf einem
  // Platz stehen zwei.
  { n:'die Landschaften werden vereinigt statt ersetzt', tor:'gleichlauf',
    datei:'src/kern/gleichlauf.js',
    such:"    aus[raum] = juengere(alt, neu);",
    ersatz:"    aus[raum] = { ...alt, ...neu, stand: (alt.stand || []).map((x, i) => x || (neu.stand || [])[i]) };",
    an:{ datei:'src/kern/gleichlauf.js', text:'x || (neu.stand || [])[i]' },
    sagt:'juengere Aufstellung' },

  /* --- passt: der Platz in der Landschaft (T2) ---------------------- */
  /* Die neun Plaetze duerfen nicht unter das Fingermass fallen. Fuenf
     Zeilen statt drei: die neun Kaesten fuellen weiter drei davon, jeder
     ist aber nur noch ein Fuenftel des Bandes hoch - auf dem Zielgeraet
     40 statt 66 Punkte. Genau die Verhaeltnisrechnung, die in der Runde,
     die das Bild gebaut hat, dreimal schiefgegangen ist.
     Der Anker steht als Kommentar dahinter: der Eingriff nimmt ihn sonst
     selbst weg, und dann meldet `inhalt` seine Vorpruefung statt des
     Befundes (zehnmal passiert). */
  { n:'die Plätze in der Landschaft rutschen unter das Fingermaß', tor:'passt',
    args:['--teil=0/3'], bauen:true, datei:V,
    such:"  grid-template-rows:repeat(3,minmax(0,1fr))}",
    ersatz:"  grid-template-rows:repeat(5,minmax(0,1fr))}"
      + "  /*Anker: grid-template-rows:repeat(3,minmax(0,1fr))} */",
    an:{ ...DIST, text:'grid-template-rows:repeat(5,minmax(0,1fr))' },
    sagt:'ein Platz in der Landschaft muss' },

  /* --- ansicht: die Landschaft (T2) --------------------------------- */
  /* Die Aufnahme muss die LANDSCHAFT zeigen und nicht das Buch davor.
     Ohne diese Probe waere ein Weg, der auf halber Strecke stehen
     bleibt, nicht von einem funktionierenden zu unterscheiden: das Tor
     legt sein Vorbild beim ersten Lauf selbst an und vergleicht danach
     mit sich. Ein falscher Bildschirm waere dann fuer immer der
     richtige.
     Der Eingriff nimmt den Tuerklick weg - stehen bleibt das
     Tierkapitel, und das ist ein anderes Bild. */
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
  { n:'die Aufnahme der Landschaft bleibt im Buch stehen', tor:'ansicht',
    args:['--nur=quer-landschaft'], datei:'tor/ansicht.mjs',
    such:"      if (a.tun === 'landschaft') {",
    ersatz:"      if (false && a.tun === 'landschaft') {  //Anker: if (a.tun === 'landschaft') {",
    an:{ datei:'tor/ansicht.mjs', text:"if (false && a.tun === 'landschaft') {" },
    sagt:'quer-landschaft' },

  /* --- landschaft: die Bank blaettert (T4) --------------------------- */
  /* Ohne die Umblaetterung passt die Bank auf dem kleinsten Geraet nicht
     mehr - der elfte Lebensraum bringt sie von 30 auf 33 Kaesten, und
     dreissig ist dort die Grenze. Der Eingriff nimmt die Seite weg (es
     wird wieder alles auf einmal gezeigt); dann sind zwar alle Tiere
     da, aber der Knopf bleibt weg, und der Rauchtest meldet genau das.
     Der Anker steht als Kommentar dahinter - der Eingriff nimmt ihn
     sonst selbst weg (elfmal passiert). */
  { n:'die Bank blättert nicht mehr', tor:'smoke', args:['--nur=landschaft'],
    bauen:true, datei:D,
    such:"    mehr.hidden = seiten < 2;",
    ersatz:"    mehr.hidden = true;  //Anker: mehr.hidden = seiten < 2;",
    an:{ ...DIST, text:'mehr.hidden = true;' },
    /* OHNE ZAHL. Der Text hiess einmal 33 Tiere; inzwischen sind es 45,
       und die Probe fiel auf ihre eigene Meldung herein - sie las nur die
       falsche Zahl darin. Was sie meint, ist die FORM der Meldung, nicht
       der Stand des Vorrats: eine Grenze gehoert anteilig formuliert, nie
       absolut (Regel 2). */
    sagt:'Tiere angeblich auf eine Seite' },

  /* Und die andere Haelfte derselben Zusage: der Knopf ist da, blaettert
     aber im Kreis derselben Seite. Am Bildschirm ist das nicht zu
     unterscheiden - man tippt, etwas bewegt sich, und die Tiere der
     zweiten Seite sind trotzdem nie zu erreichen. */
  { n:'das Blättern zeigt immer dieselbe Seite', tor:'smoke', args:['--nur=landschaft'],
    bauen:true, datei:D,
    such:"    seite = (seite + 1) % seiten;",
    ersatz:"    seite = 0;  //Anker: seite = (seite + 1) % seiten;",
    an:{ ...DIST, text:'    seite = 0;  //Anker' },
    sagt:'Blättern überspringt' },

  /* --- Die Sammlung oeffnet einen Raum (T6) -------------------------- */
  /* Der Zweig in `tierFuer` wird gar nicht erreicht. In den DATEN sieht
     das aus wie ein richtiger Raum - `inhalt` bliebe gruen -, und am
     Bildschirm bekommt das Kind nie etwas. Genau dafuer ist der
     gespielte Endbildschirm da. */
  { n:'die Sammlung öffnet keinen Raum mehr', tor:'smoke', args:['--nur=landschaft'],
    bauen:true, datei:D,
    such:"  const ausZahl = Tiere.raumAbZahl(TierStand.ids);",
    ersatz:"  const ausZahl = null;  //Anker: const ausZahl = Tiere.raumAbZahl(TierStand.ids);",
    an:{ ...DIST, text:'const ausZahl = null;' },
    sagt:'öffnet „In der Tiefsee" nicht' },

  /* Und die Schwelle selbst: ohne sie gaebe es den Raum vom ersten Tier
     an. Das Kind bekaeme ihn, bevor es ihn verdient hat - und der
     einzige Lohn, der fuer das SAMMELN steht, waere geschenkt. */
  /* Und die Schleife selbst (T7). Der Abschnitt fuhr bis v407 EINEN
     Raum - die Tiefsee, mit ihrer Schwelle als Zahl und ihren drei
     Tieren als Liste. Jetzt faehrt er alle, die die Sammlung oeffnet.
     Diese Probe trifft absichtlich den ZWEITEN: bliebe die Schleife
     beim ersten stehen, waere sie gruen und der neue Raum ungeprueft -
     und das saehe genauso aus wie ein bestandenes Tor.
     Der Eingriff tauscht ein gemaltes Tier gegen ein geplantes: der
     Raum gibt dann zwei statt drei. */
  { n:'der zweite Sammlungsraum wird nicht gefahren', tor:'smoke',
    args:['--nur=landschaft'], bauen:true, datei:'src/inhalt/tiere.js',
    such:"    tiere:['tyrannosaurus', 'langhalssaurier', 'mammut'] },",
    ersatz:"    tiere:['tyrannosaurus', 'langhalssaurier', 'phoenix'] },",
    an:{ ...DIST, text:"'langhalssaurier', 'phoenix'" },
    sagt:'bringt 2 Tiere statt drei' },

  { n:'die Schwelle gilt nicht mehr', tor:'inhalt', datei:'src/inhalt/tiere.js',
    /* OHNE die Einrueckung im Suchtext: der Anker steht im Kommentar am
       Zeilenende und traegt sie nicht. Mit vier Leerzeichen davor haette
       der Eingriff seinen eigenen Anker weggenommen - zwoelftes Mal
       dieselbe Falle. */
    such:"if (!r.ab || da.size < r.ab) continue;",
    ersatz:"if (!r.ab) continue;  //Anker: if (!r.ab || da.size < r.ab) continue;",
    an:{ datei:'src/inhalt/tiere.js', text:'if (!r.ab) continue;' },
    sagt:'öffnet sich schon bei' },

  /* --- Die Kopfzahl gegen die Reiter (Buch-Audit II, B3) ------------ *
   *
   * Der Eingriff stellt genau den Zustand her, der bis v414 ausgeliefert
   * war: der Kopf zaehlt nur die Ebenen-Aufkleber, die Reiter zaehlen
   * alles. Beide Zahlen sind fuer sich richtig gerechnet - deshalb hat
   * es kein Tor gesehen, und deshalb prueft der Rauchtest jetzt die
   * BEZIEHUNG. */
  { n:'die Kopfzahl zählt etwas anderes als die Reiter', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:"      kapitel.reduce((a, k) => a + (k.gesamt ? k.zahl : 0), 0)} von ${",
    ersatz:"      gesamt} von ${",
    an:{ ...DIST, fehlt:'k.gesamt ? k.zahl : 0' },
    sagt:'zwei Zahlen über demselben Inhalt' },

  /* Und die andere Haelfte: ein Reiter, der in die Gegenrichtung zaehlt.
     „Als Naechstes" trug bis v414 die Menge der OFFENEN Stuecke, gleich
     gross und gleich gewichtet neben denen, die das Gesammelte zaehlen. */
  { n:'ein Reiter zählt in die Gegenrichtung', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:"    id:'naechstes', titel:'Als Nächstes', farbe:dran.farbe,",
    ersatz:"    id:'naechstes', titel:'Als Nächstes', farbe:dran.farbe, zahl:vorschau.length, gesamt:vorschau.length,",
    an:{ ...DIST, text:"zahl:vorschau.length, gesamt:vorschau.length" },
    sagt:'trägt eine Zahl' },

  /* --- Die Tonleiter des Buches (Runde 0) --------------------------- *
   *
   * Eine weitere Schriftstufe, so wie sie entsteht: jemand braucht „nur
   * hier" etwas Kleineres und schreibt einen `calc`. Genau daraus sind
   * die acht Kombinationen geworden, die Audit II gemessen hat.
   * Der Eingriff macht aus der Fussnote eine eigene Groesse. */
  /* Der erste Anlauf setzte die GANZE Fussnote kleiner - und aenderte
     damit nur den WERT einer Stufe, nicht ihre Zahl: aus 14/400 wurde
     11/400, es blieben drei. Das Tor blieb zu Recht gruen, und die Probe
     hat nichts bewiesen. Eine vierte Stufe entsteht, wenn EINER der drei
     Nutzer ausschert - genau so, wie es wirklich passiert. */
  /* Seit I23 sind es VIER Stufen (die Raumwand des kurzen Querformats,
     begruendet in `tools/buch-feinmass.mjs`) - die Probe sucht also die
     FUENFTE. Und sie tut es mit `.6` statt mit `.82`: 0,82 mal vierzehn
     sind gerundet elf, und elf ist seit I20 die vierte Stufe. Der alte
     Eingriff waere angekommen und haette trotzdem nichts geaendert -
     genau die Verfallsart, an der schon sein erster Anlauf gescheitert
     ist. */
  { n:'eine fünfte Schriftstufe schleicht sich ein', tor:'tonleiter', bauen:true,
    datei:'prototyp/vorlage.html',
    such:"/* Die drei Abstaende - und nur diese drei. */",
    ersatz:".rollen.buch .buchsatz{font-size:calc(var(--t-name) * .6)}\n"
      + "/* Die drei Abstaende - und nur diese drei. */",
    an:{ datei:'prototyp/vorlage.html', text:'.rollen.buch .buchsatz{font-size:calc(' },
    sagt:'schrift: 5 verschiedene' },

  /* Und ein Radius, den jemand „nur fuer diese eine Zelle" anders setzt.
     Der Eingriff traf bis Runde 3 die Aufkleberkarte - die steht seit
     dem Umbau aber erst IM Raum, und die Zaehlung geht die Kapitel ab,
     ohne einen zu oeffnen. Die Probe schlug damit nicht mehr an, und
     zwar zu Recht: nicht das Tor war schwaecher geworden, der Eingriff
     stand nur nicht mehr im Bild. Jetzt trifft er die Raumzelle, die
     auf der Tierseite von Anfang an dasteht. */
  { n:'ein dritter Radius kommt dazu', tor:'tonleiter', bauen:true,
    datei:'prototyp/vorlage.html',
    such:".rollen.buch .raumzelle,\n.rollen.buch .raumzu,",
    ersatz:".rollen.buch .raumzu,",
    an:{ datei:'prototyp/vorlage.html', fehlt:'.rollen.buch .raumzelle,\n.rollen.buch .raumzu,' },
    sagt:'radius: 3 verschiedene' },

  /* Und der dritte Wert der Ratsche, die Abstaende. Der Eingriff ist der
     Fehler, den Runde 0 wirklich gefunden hat: die Eckzahl trug
     `padding:0 var(--r1)` - eine feste Zahl neben der Leiter, gemessen
     4 an drei Stellen. Ohne diese Probe stuende die Grenze `luft` in
     GRENZEN, ohne dass je jemand geprueft haette, dass sie greift. */
  { n:'ein Abstand neben der Leiter kommt zurueck', tor:'tonleiter', bauen:true,
    datei:'prototyp/vorlage.html',
    such:'.rollen.buch .abz .fehlt{padding:0 var(--eng)}',
    ersatz:'.rollen.buch .abz .fehlt{padding:0 var(--r1)}',
    an:{ datei:'prototyp/vorlage.html', text:'.rollen.buch .abz .fehlt{padding:0 var(--r1)}' },
    sagt:'luft: 4 verschiedene' },

  /* Die zweite Zusage des Tores: kein Tiername braucht drei Zeilen.
     Der Eingriff macht die Spalte der Aufkleberkarte wieder so schmal,
     wie sie vor Runde 0 war - genau die Breite, an der
     „Streifenhoernchen" umgebrochen ist. Seit Runde 3 steht diese
     Breite in der Mindestbreite des Rasters und nicht mehr an der
     Karte; die Probe ist mitgezogen, sonst haette sie einen toten Wert
     geaendert und WAERE STILL GEBLIEBEN. Ohne sie koennte die
     Namensmessung ausserdem leer laufen (kein Tierkapitel, kein
     geoeffneter Raum, keine sichtbare Karte) und trotzdem gruen
     melden. */
  { n:'die Aufkleberkarte wird wieder zu schmal', tor:'tonleiter', bauen:true,
    datei:'prototyp/vorlage.html',
    such:'  grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--mittel)}',
    ersatz:'  grid-template-columns:repeat(auto-fill,minmax(66px,1fr));gap:var(--mittel)}',
    an:{ datei:'prototyp/vorlage.html', text:'minmax(66px,1fr)' },
    sagt:'brauchen drei Zeilen' },

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
  /* `ohneSofort`, weil eine ECHTE Ueberdeckung immer auch die Bedienung
     stoert - das ist ja der Grund, warum es den Fremdgriff gibt. Mit
     `--sofort` bricht der Rauchtest schon beim Ziehen ab („Thueringen
     auf den Anker gezogen, aber nach 10 s kein Lob") und kommt gar nicht
     bis zu der Meldung, die diese Probe meint. */
  { n:'die Werkzeugspalte rutscht auf die Antwortliste', tor:'smoke',
    args:['--teil=0/4'], bauen:true, datei:V, ohneSofort:true,
    /* DER EINGRIFF WAR WIRKUNGSLOS, und zwar dreimal aus demselben
       Grund - der dritten Verfallsart: die Regel wurde ueberschrieben.
       Er stand im Block `@media (orientation:landscape) and
       (max-height:440px)` bei Zeile 1554. Weiter unten, bei 2012, steht
       `@media (orientation:landscape){ .werkzeug{… margin-inline:auto} }`
       - dieselbe Spezifitaet, spaeter im Blatt, und `margin-inline`
       setzt `margin-left` mit. GEMESSEN am laufenden Aufgabenbildschirm
       mit dem Eingriff im Bau: `getComputedStyle(.werkzeug).marginLeft`
       ist „0px", die Spalte steht bei 711..844 wie immer, und `ansicht`
       meldete 49 gruen, 0 rot - kein einziger Bildpunkt anders.
       Und ein negativer RAND war ohnehin das falsche Mittel: in einem
       Flex-Kasten fester Breite nimmt ihn `.wahlliste{flex:1}` auf, die
       Liste wird breiter, und die Spalte steht wieder rechts. Ueberdeckt
       wird nur, was aus dem Fluss geht - `transform` verschiebt, ohne
       das Layout zu aendern, und genau so sieht der Fehler in echt aus.
       Der Eingriff sitzt jetzt in der Regel, die WIRKLICH gilt.

       80 UND NICHT 160 - auch das ist gemessen. Bei 160 legt sich die
       Spalte auf die Mitte der Antwortknoepfe, und dann ist das Spiel
       lahm: der Rauchtest meldete zwoelf andere Dinge („auf den Anker
       gezogen, aber nach 10 s kein Lob", „kein einziger Aufkleber nach
       zwei Sitzungen") und kam gar nicht bis zum Fremdgriff. Das ist die
       Lehre dieser Probe: der Fremdgriff ist die FEINERE Pruefung - er
       soll die Ueberdeckungen finden, die das Spiel NICHT lahmlegen, und
       eine Probe fuer ihn muss sich in derselben Groessenordnung halten.
       Bei 80 trifft die Spalte die Wortenden, die Knopfmitte bleibt
       frei, und die Meldung ist die richtige. */
    such:'  .werkzeug{flex-direction:column;flex-wrap:nowrap;',
    ersatz:'  .werkzeug{transform:translateX(-80px);flex-direction:column;flex-wrap:nowrap;',
    an:{ ...DIST, text:'.werkzeug{transform:translateX(-80px)' },
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
    /* Gefragt wird nach dem VERSCHWINDEN, nicht nach dem Erscheinen (Q48).
       Was der Eingriff hinschreibt, steht seit Q43 auch in
       `karteFehltSchirm`: dort raeumt derselbe Knopf in dieselbe
       Ebenenwahl. „Angekommen" war damit wahr, bevor etwas passiert war -
       auch mit `#zur` davor, denn diese Zeile ist Wort fuer Wort
       dieselbe. Was es nur EINMAL gibt, ist das Wegnehmen: `zurueck ||`
       steht genau an der Stelle, die die Probe meint. */
    an:{ ...DIST, fehlt:'zeige(zurueck || ebenenwahl)' },
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

  /* --- Q46: der Satz zum Mitnehmen steht auch im Buch ----------------
   *
   * Zwei Zusagen, zwei Proben. Die zweite ist die, die still ausfaellt:
   * die Seite sieht nach dem Tipp genauso aus, nur mit einem anderen
   * Satz - wer den ersten nicht auswendig kann, merkt nichts.
   */

  { n:'der Satz zum Mitnehmen fehlt im Buch', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'        satzGebiete(g).length ? `<p class="buchsatz" data-gruppe="${g.id}"',
    ersatz:'        false ? `<p class="buchsatz" data-gruppe="${g.id}"',
    an:{ ...DIST, text:'false ? `<p class="buchsatz"' },
    sagt:'kein Satz zum Mitnehmen' },

  /* Der Tipp blaettert nicht mehr. Der Eingriff setzt die Schwelle so
   * hoch, dass es nie zwei Gebiete zum Blaettern gibt - der Zuhoerer wird
   * dann gar nicht erst gebunden, und der Satz steht fest. */
  { n:'ein Tipp auf die Albumkarte blaettert den Satz nicht mehr', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'    if (wo.length < 2) return;   // nichts zu blaettern',
    ersatz:'    if (wo.length < 99) return;   // nichts zu blaettern',
    an:{ ...DIST, text:'if (wo.length < 99) return' },
    sagt:'blättert den Satz nicht weiter' },

  /* --- Q45: die Karte darf beim Lob nicht weiter ruecken -------------
   *
   * Der freigehaltene Platz ist gebaut, gemessen (0 statt 48 Punkte) und
   * wieder herausgenommen worden - er kostet mehr Bildschirm, als da ist.
   * Was bleibt, ist die Ratsche: der Sprung darf nicht wachsen. Die Probe
   * macht ihn groesser, indem sie dem Lob eine Zeile mehr gibt.
   */
  { n:'das Lob schiebt die Karte noch weiter weg', tor:'smoke',
    args:['--nur=spielen,ablage'], bauen:true, datei:V,
    /* Der Eingriff nimmt genau die Zeile zurueck, die den Sprung von 47
       auf 21 gebracht hat: das Lob steht dann wieder UEBER der Sache
       statt daneben, und die Karte rueckt wieder 47 Punkte.
       Nicht `padding-block` am Lob, wie im ersten Anlauf: an einem
       `display:inline` hat es keine Wirkung auf die Zeilenhoehe, der
       Eingriff waere angekommen und haette nichts getan. */
    such:'  .frage .jubel{display:inline;font-size:var(--s1)}',
    ersatz:'  .frage .jubel{display:block;font-size:var(--s1)}',
    an:{ ...DIST, text:'.frage .jubel{display:block;font-size:var(--s1)}' },
    sagt:'rückt beim Lob' },

  /* --- D3: der Satz zum Mitnehmen ------------------------------------
   *
   * Vier Zusagen, vier Proben. Drei davon stellen einen Zustand her, in
   * dem das Spiel WEITER FUNKTIONIERT - der Satz fehlt einfach, und
   * `lobsatz` laesst die Zeile weg. Auf dem Bildschirm ist dann nichts
   * zu sehen, was ein Fehler waere: genau die Sorte, gegen die es Tore
   * gibt.
   */

  /* 1. Ein Gebiet verliert seinen Satz. `inhalt` zaehlt die Luecken. */
  { n:'ein Gebiet hat keinen Satz zum Mitnehmen', tor:'inhalt', deckt:'saetze',
    datei:'src/inhalt/saetze.js',
    such:"  EGY: 'In Ägypten stehen die Pyramiden, und dort fließt der Nil.',",
    ersatz:'',
    an:{ datei:'src/inhalt/saetze.js', fehlt:'In Ägypten stehen die Pyramiden' },
    sagt:'ohne Satz zum Mitnehmen' },

  /* 2. Ein Satz wird zu einem Absatz. Zwei Saetze werden nicht
   *    weitererzaehlt - das ist das ganze Soll, und es ist zaehlbar. */
  { n:'aus einem Satz zum Mitnehmen werden zwei', tor:'inhalt', deckt:'saetze',
    datei:'src/inhalt/saetze.js',
    such:"  CUB: 'Kuba ist die größte Insel der Karibik.',",
    ersatz:"  CUB: 'Kuba ist die größte Insel der Karibik. Dort ist es warm.',",
    an:{ datei:'src/inhalt/saetze.js', text:'Dort ist es warm' },
    sagt:'nicht aus genau einem Satz' },

  /* 3. Der Satz nennt sein Gebiet nicht mehr beim Namen. „Dort ist es
   *    warm" haengt an nichts - und haengt damit auch nicht an dem, was
   *    gerade gelernt wurde. */
  { n:'ein Satz zum Mitnehmen nennt sein Gebiet nicht', tor:'inhalt', deckt:'saetze',
    datei:'src/inhalt/saetze.js',
    such:"  PRY: 'Paraguay hat kein Meer.',",
    ersatz:"  PRY: 'Dieses Land hat kein Meer.',",
    an:{ datei:'src/inhalt/saetze.js', text:"PRY: 'Dieses Land hat kein Meer.'" },
    sagt:'nicht beim Namen' },

  /* 4. Und der Weg bis zum Kind. Der Satz steht in der Tabelle, wird aber
   *    nicht mehr hingeschrieben - fuer Lea ist er dann weg, fuer Fiona
   *    ebenso, und `inhalt` sieht davon nichts: die Tabelle ist ja heil. */
  { n:'der Satz zum Mitnehmen kommt nicht auf den Bildschirm', tor:'smoke',
    args:['--nur=spielen,ablage'], bauen:true, datei:D,
    such:'          nebenbei || Saetze.satzZu(ziel.id) || \x27\x27, neuerAufkleber);',
    ersatz:'          nebenbei, neuerAufkleber);',
    an:{ ...DIST, fehlt:'nebenbei || Saetze.satzZu(ziel.id)' },
    sagt:'steht nicht auf dem Bildschirm' },

  /* 5. ... und der andere Weg: er steht da, wird aber nicht gesprochen.
   *    Fiona liest nicht; fuer sie ist er damit gar nicht da. */
  { n:'der Satz zum Mitnehmen wird nicht gesprochen', tor:'smoke',
    args:['--nur=spielen,ablage'], bauen:true, datei:D,
    such:"          + (mitnehmen ? ` ${mitnehmen}` : ''));",
    ersatz:"          );",
    an:{ ...DIST, fehlt:'(mitnehmen ? ` ${mitnehmen}`' },
    sagt:'wird nicht gesprochen' },

  /* Q42: die Ratsche auf das blinde Warten.
   *
   * Der Rauchtest wartete an dreizehn Stellen eine feste Zeit, egal ob
   * das Erwartete schon da war - 3,4 s je Lauf, und auf einer langsamen
   * Maschine trotzdem zu kurz. Alle dreizehn sind ersetzt; damit die Zahl
   * nicht still wieder waechst, ist sie jetzt ein FEHLER und keine
   * Auskunft mehr.
   *
   * Der Eingriff setzt genau eine feste Pause wieder ein, und zwar dort,
   * wo jede Seite durchkommt. Er misst damit nicht die Pause, sondern die
   * Ratsche: eine Millisekunde kostet nichts und muss trotzdem anschlagen.
   * Stuende die Grenze bei einer Sekunde, waere sie umgehbar. */
  { n:'eine feste Pause schleicht sich in den Rauchtest zurueck', tor:'smoke',
    args:['--nur=spielen,ablage'], bauen:true, datei:'tor/smoke.mjs',
    such:'  p.messtakt = (ms) => { messtakt.ms += ms; messtakt.n++; return festWarten(ms); };',
    /* OHNE `await`: `uhrenBuchfuehrung` ist nicht async, und ein `await`
       darin waere ein Syntaxfehler - der Rauchtest waere rot, aber aus
       dem falschen Grund. Der Zaehler steigt ohnehin sofort; auf die
       Pause zu warten ist fuer diese Probe nicht noetig. */
    ersatz:'  p.messtakt = (ms) => { messtakt.ms += ms; messtakt.n++; return festWarten(ms); };'
      + '\n  p.waitForTimeout(1);',
    an:{ datei:'tor/smoke.mjs', text:'\n  p.waitForTimeout(1);' },
    sagt:'feste Pausen' },

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
    such:'| **Startbündel** gesamt, gzip | **< 700 KB** |',
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
    such:"const D = JSON.parse(", ersatz:"const FUELLBALLAST = '" + FUELLUNG + "';\nconst D = JSON.parse(",
    /* `FUELLBALLAST` und nicht `FUELL` (Q48): `const FUELL` ist ein
       Praefix von `const FUELLWOERTER`, das es im Vergleichsmodul schon
       gibt. Die Nachfrage traf also von Anfang an - „angekommen" war wahr,
       bevor etwas passiert war. */
    an:{ ...DIST, text:'const FUELLBALLAST' }, sagt:'gewachsen' },

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
  /* Auf dem Runner ausgelassen, und in Q50 nachgeprueft, ob das zu weit
     greift: sie vergleicht zwar keine Bildpunkte, aber `ansicht` beendet
     sich unter SMARTKIDS_OHNE_ANSICHT sofort (tor/ansicht.mjs:58) - lange
     vor der Schriftpruefung in Zeile 1144. Eine Ausnahme fuer sie braechte
     also nichts; es bleibt beim Grund der uebrigen, der Runner rastert
     anders (Regel 16). */
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
    /* Seit E3 haengt der Knopf an der SPRACHE: auf Englisch bekommt ihn
       auch Lea, weil dort das Wort die Frage ist. Der Eingriff sitzt
       deshalb an der deutschen Haelfte - der englische Zweig darueber
       bliebe stehen, und die Probe traefe sonst zwei Zusagen auf einmal. */
    such:"  else if (!P.vorlesen) return null;",
    ersatz:"  else if (false) return null;",
    an:{ ...DIST, text:'else if (false) return null;' },
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

  /* --- I8: Gestern und heute ------------------------------------------ *
   *
   * Die Zusage dieser Ebene steht woertlich im Vorlauf: „Die Falle ist
   * jedes Mal dieselbe: die regelmäßige Form auf -ed." Sie ist eine
   * Aussage ueber DATEN, und Daten wachsen - der zwoelfte, der hier ein
   * Verb nachtraegt, schreibt eine Falle hin, die ihm einfaellt. Die
   * Aufgabe funktioniert dann weiter, nur die Zusage nicht mehr. */
  { n:'die Falle eines Verbs ist nicht mehr die regelmaessige Form',
    tor:'inhalt', deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"richtig: ['bought'], falle: 'buyed',",
    ersatz:"richtig: ['bought'], falle: 'buyd',",
    an:{ datei:'src/inhalt/englisch.js', text:"falle: 'buyd'" },
    sagt:'die regelmäßige Form' },

  /* Und die Ebene bekommt wirklich den Lueckenbildschirm.
   *
   * `verben` und `freunde` zeigen dasselbe Bild und stehen trotzdem als
   * zwei Zeilen in `schirmZu`. Faellt die eine weg, faellt die Ebene auf
   * `spielschirm` zurueck - und der zeichnet eine KARTE. Kein Tor ausser
   * dem Rauchtest sieht das: die Kachel ist da, die Ebene laesst sich
   * oeffnen, es steht nur das Falsche darauf. */
  { n:'Gestern und heute verliert seinen Bildschirm', tor:'smoke',
    args:['--nur=englisch'], bauen:true, datei:D,
    such:"  englisch: englischschirm, freunde: freundeschirm, verben: freundeschirm,",
    ersatz:"  englisch: englischschirm, freunde: freundeschirm,",
    an:{ ...DIST, fehlt:'verben: freundeschirm' },
    sagt:'freundluecke' },

  /* --- I13: der Fehler, um den es geht --------------------------------- *
   *
   * „Vorher und nachher" prueft die Zahlenreihe, und der Fehler, den ein
   * Kind dort macht, ist die Zahl SELBST: wer die Frage „Was kommt nach
   * sieben?" nicht verstanden hat, tippt sieben. Steht diese Zahl nicht
   * unter den vier Moeglichkeiten, prueft die Ebene nur noch, ob jemand
   * ungefaehr zaehlen kann.
   *
   * Der Eingriff nimmt sie heraus. Bis I13 haette das kein Tor gemerkt -
   * die Aufgabe funktioniert weiter, sie prueft nur etwas anderes.
   *
   * Der ERSTE Eingriff strich nur `a` aus der Liste und bewies nichts:
   * bei „Nach 7" ist `w - 1` wieder die Sieben, sie kam durch die
   * Hintertuer zurueck. Das Tor blieb zu Recht gruen. Der Eingriff muss
   * die Zahl auf JEDEM Weg herausnehmen - deshalb stehen jetzt nur noch
   * Zahlen ueber dem Ergebnis da. */
  { n:'der Fehler, um den es geht, faellt aus den Moeglichkeiten',
    tor:'spielprobe', datei:'src/inhalt/rechnen.js',
    such:"  const roh = [a, gegen, w + 1, w - 1, w + 2];",
    ersatz:"  const roh = [gegen, w + 2, w + 3, w + 4];",
    an:{ datei:'src/inhalt/rechnen.js', text:'const roh = [gegen, w + 2' },
    sagt:'der Fehler, um den es geht' },

  /* --- I11: keine leere Kachel ----------------------------------------- *
   *
   * Die Flaggenebenen entstehen aus den Kartenschluesseln, die Flaggen
   * selbst sind Handarbeit. Als Suedosteuropa dazukam, stand dort eine
   * achte Flaggenkachel, hinter der NICHTS lag - sie liess sich oeffnen
   * und zeigte eine leere Sitzung. Genau die Sorte Fehler, die kein Tor
   * von selbst sieht: die Wand ist voll, die Kachel ist da, und erst wer
   * sie antippt, merkt es.
   *
   * Der Eingriff nimmt die Bedingung weg. Danach steht die leere Kachel
   * wieder da, und der Rauchtest muss darueber stolpern. */
  { n:'eine Flaggenkachel steht ohne eine einzige Flagge da', tor:'smoke',
    args:['--nur=durchgang', '--kurz'], bauen:true, datei:D,
    such:"    wenn: () => (D.laender[k] || []).some(l => Flaggen.flaggeFragbar(l.a3)) })),",
    ersatz:"  })),",
    an:{ ...DIST, fehlt:'flaggeFragbar(l.a3)) }))' },
    sagt:'flaggen:suedosteuropa' },

  /* --- I10: Zehn und drueber, Meter und Gramm --------------------------- *
   *
   * Die Ebene „Zehn und drueber" prueft den UEBERGANG und sonst nichts.
   * Ihr Ablenker ist deshalb kein Nachbar, sondern der Fehler selbst: wer
   * 23 + 8 falsch rechnet, rechnet 21 - Einer addiert, Uebertrag
   * vergessen. Steht diese Zahl nicht unter den vieren, prueft die Ebene
   * nur noch, ob jemand ungefaehr richtig rechnet, und das tut die
   * Ebene daneben schon.
   *
   * Der Eingriff dreht das Vorzeichen um: der Uebertragsfehler wird zum
   * Ergebnis PLUS zehn, also zu einer Zahl, die niemand hinschreibt.
   * `spielprobe` faengt ihn an der Grenze von hundert - 98 + 10 ist 108. */
  { n:'der Uebertragsfehler faellt aus den Moeglichkeiten',
    tor:'spielprobe', datei:'src/inhalt/rechnen.js',
    such:"  const uebertrag = auf.rechenart === 'plus100' ? w - 10 : w + 10;",
    ersatz:"  const uebertrag = auf.rechenart === 'plus100' ? w + 10 : w - 10;",
    an:{ datei:'src/inhalt/rechnen.js', text:"'plus100' ? w + 10 : w - 10" },
    sagt:'außerhalb des Zahlenraums' },

  /* Und die Umrechnung wird in BEIDE Richtungen richtig gerechnet.
   *
   * `hin` sagt, ob mal oder geteilt. Ohne dieses Feld muesste man die
   * Richtung aus den Zahlen erraten - und bei „100 cm = ? m" sind a und b
   * beide 100. Der Eingriff dreht die Richtung fest auf „mal"; danach
   * behauptet die Ruecksicht 10 000 statt 1. */
  { n:'die Umrechnung geht nur noch in eine Richtung',
    tor:'spielprobe', datei:'tor/spielprobe.mjs',
    such:"      : auf.rechenart === 'einheit' ? (auf.hin ? auf.a * auf.b : auf.a / auf.b)",
    ersatz:"      : auf.rechenart === 'einheit' ? auf.a * auf.b",
    an:{ datei:'tor/spielprobe.mjs', text:"'einheit' ? auf.a * auf.b" },
    sagt:'gerechnet' },

  /* --- I9: Das kleine Wort --------------------------------------------- *
   *
   * Die Ebene verspricht im Vorlauf, dass genau EIN KLEINES WORT fehlt.
   * Wer dort eine Wendung eintraegt, bricht das - und zwar lautlos: die
   * Aufgabe laesst sich weiter spielen, sie ist nur keine
   * Praepositionsaufgabe mehr. */
  { n:'in „Das kleine Wort" steht eine ganze Wendung',
    tor:'inhalt', deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"richtig: ['for'], falle: 'on',\n    warum: 'Das deutsche „auf\" ist hier nicht „on\"",
    ersatz:"richtig: ['for the'], falle: 'on',\n    warum: 'Das deutsche „auf\" ist hier nicht „on\"",
    an:{ datei:'src/inhalt/englisch.js', text:"richtig: ['for the']" },
    sagt:'keine Wendung' },

  /* Und das Lueckenfeld bleibt schmal.
   *
   * Mit der Breite der falschen Freunde (15 Zeichen) zerriss „They accused
   * him ___ fraud." auf dem Zielgeraet in zwei Zeilen - „fraud." stand
   * allein darunter. Das ist genau der Fehler, gegen den dieser
   * Bildschirm gebaut ist: die Luecke sitzt IM Satz, sonst ist sie ein
   * Formular.
   *
   * Der erste Anlauf haengte die Probe an `passt` - und `passt` blieb
   * gruen, denn ein Umbruch ist kein Ueberlauf: nichts steht ueber dem
   * Rand, nichts ist verdeckt, es sieht nur falsch aus. Genau der Fall,
   * fuer den es die Vorbilder gibt (Regel 4: kein Tor ersetzt den Blick,
   * und kein Blick die Tore). `ansicht` vergleicht Bildpunkte und sieht
   * die zweite Zeile sofort.
   *
   * Auf dem Runner ausgelassen: `ansicht` ist dort abgeschaltet (Q39). */
  { n:'das Lueckenfeld der Praepositionen wird wieder breit', tor:'ansicht',
    args:['--nur=quer-praeposition'], bauen:true, datei:V,
    such:'.freundluecke.eng .wort-eingabe{width:8ch}',
    ersatz:'.freundluecke.eng .wort-eingabe{width:15ch}',
    an:{ ...DIST, fehlt:'.freundluecke.eng .wort-eingabe{width:8ch}' },
    sagt:'quer-praeposition' },

  /* --- I17: der Fingerzeig von `regeln` ------------------------------- *
   *
   * Die Ratsche ist eine ZAHL, und der Bericht nannte als „die neuen"
   * den Schwanz der Liste. Das ist die Reihenfolge der Dateien: `src`,
   * `tools`, `tor`, `prototyp`, `docs`. Ein neuer Verweis in `src`
   * liess das Tor also auf `docs` zeigen - bei I16 genau so passiert,
   * und die Suche danach hat eine Viertelstunde gekostet.
   *
   * DIESE PROBE PRUEFT NICHT, DASS ES ROT WIRD, sondern WOHIN es zeigt.
   * Der Eingriff schreibt einen Verweis ohne Stichwort in die ERSTE
   * Wurzel; `sagt` verlangt, dass die Meldung genau diese Datei nennt.
   * Mit der alten Bauart wuerde sie rot und meldete eine Datei aus
   * `docs` - die Probe waere gruen, obwohl das Tor in die Irre zeigt,
   * und genau deshalb steht hier der Dateiname und nicht „ohne
   * Stichwort". */
  { n:'der Fingerzeig von `regeln` zeigt auf die falsche Datei', tor:'regeln',
    datei:E,
    such:'export const HAUPTSTADT_LAND = {',
    /* DER EINGRIFF STEHT ZERLEGT DA, und das ist kein Schoenheitsfehler:
       `regeln` liest AUCH `tor/`. Der erste Anlauf schrieb den Verweis
       als ein Stueck in diese Zeile - und damit stand er in dieser
       Datei, die Zahl war schon ohne Eingriff 48, und `proben` meldete
       zu Recht „`regeln` ist schon OHNE Eingriff rot". Dreizehntes Mal
       dieselbe Falle in diesem Verzeichnis: eine Probe, die ihren
       eigenen Anker setzt.
       Gefunden hat es der Fingerzeig, den diese Probe bewacht - er hat
       auf `tor/proben-liste.mjs` gezeigt statt auf `docs`. */
    ersatz:'// Nur zum Messen: ein Verweis ohne Stichwort (Reg' + 'el 6).\n'
      + 'export const HAUPTSTADT_LAND = {',
    an:{ datei:E, text:'Nur zum Messen: ein Verweis ohne Stichwort' },
    sagt:'src/inhalt/erdkunde.js' },

  /* --- I16: die Hauptstadt kommt aus dem Inhalt ----------------------- *
   *
   * Bis I15 kam sie aus Natural Earths `Admin-0 capital` - und die ist
   * ausserhalb Europas in sieben von 88 Faellen nicht die Hauptstadt.
   * Seit I16 steht die Antwort in `HAUPTSTADT_LAND`, und das Tor haelt
   * den GEBACKENEN Namen dagegen. Ohne diese Zeile koennte das
   * Backwerkzeug wieder auf die Kartendaten zurueckfallen, ohne dass
   * etwas rot wird - genau der Zustand, in dem das Verzeichnis
   * anderthalb Jahre war.
   *
   * Der Eingriff traegt Myanmars alte Hauptstadt ein. Rangun war es bis
   * 2005 und steht bis heute in den Kartendaten; wenn diese Probe nicht
   * anschlaegt, ist der Weg zurueck dorthin wieder offen. */
  { n:'die Hauptstadt weicht von der gebackenen Lage ab', tor:'inhalt',
    deckt:'inhalt', datei:E,
    such:"  MMR:'Naypyidaw',",
    ersatz:"  MMR:'Rangun',",
    an:{ datei:E, text:"MMR:'Rangun'" },
    sagt:'die Antwort kommt aus der falschen Quelle' },

  /* Ein Ziel ohne Hauptstadt und ohne Grund.
   *
   * Groenland ist das einzige der 124 Ziele ohne Hauptstadtfrage - Nuuk
   * ist die Hauptstadt einer autonomen Region. Das steht als Satz in
   * `HAUPTSTADT_OHNE_FRAGE`, und der Eingriff nimmt ihn weg. Ohne die
   * Pruefung saehe „hat keine Hauptstadt, weil wir uns etwas dabei
   * gedacht haben" genauso aus wie „ist beim Nachtragen vergessen
   * worden". */
  { n:'ein Ziel verliert seine Hauptstadt ohne Grund', tor:'inhalt',
    deckt:'inhalt', datei:E,
    such:"export const HAUPTSTADT_OHNE_FRAGE = {\n  GRL:",
    ersatz:"export const HAUPTSTADT_OHNE_FRAGE = {\n  XXX:",
    an:{ datei:E, fehlt:'  GRL:' },
    sagt:'ohne Hauptstadt und ohne Grund' },

  /* Und die Ratsche je Karte.
   *
   * Acht Karten, acht Zahlen - und die Zahlen sind der einzige Schutz
   * davor, dass eine Hauptstadt still aus dem Backen faellt (das ist bei
   * R6 fuenf Staedten passiert). Eine Karte OHNE Ratsche waere die
   * neunte, die niemand zaehlt. */
  { n:'eine Karte faehrt ohne Hauptstadt-Ratsche', tor:'inhalt',
    deckt:'inhalt', datei:'tor/inhalt.mjs',
    such:"                    australien:3 };",
    ersatz:"                  };",
    an:{ datei:'tor/inhalt.mjs', fehlt:'australien:3 };' },
    sagt:'ohne Hauptstadt-Ratsche' },

  /* --- I15: die Raumwand auf dem schmalen Schirm ---------------------- *
   *
   * Siebzehn Raeume statt fuenfzehn sind auf 390 x 844 sechs Reihen
   * statt fuenf, und das Kapitel brauchte 693 Punkte in 658
   * verfuegbaren. Zwei Sachen zusammen machen daraus 561: das kleinere
   * Bild in der Zelle und das knappere Polster.
   *
   * DER EINGRIFF NIMMT BEIDE WEG, und das ist nachgemessen und nicht
   * vorsichtshalber: nur das Bild ergibt 633, nur das Polster 621, und
   * der Rand liegt bei 658. Eine Probe, die nur eine der beiden
   * wegnimmt, bliebe gruen und wuerde nichts beweisen - beim ersten
   * Anlauf waren es genau zwei solche Proben, und `proben` hat beide mit
   * „beweist nichts" gemeldet (Regel 1: wer eine Wirkung misst, schaltet
   * sie zuerst ab - und wenn zwei sie zusammen tragen, dann beide). */
  { n:'die Raumwand auf dem schmalen Schirm bekommt ihren Platz zurueck',
    tor:'passt', bauen:true, datei:V,
    such:'  .rollen.buch .raumzelle .raumzeichen{width:24px;height:24px}\n'
      + '  .rollen.buch .raumzelle{padding:var(--r0)}',
    ersatz:'  .rollen.buch .raumzelle .raumzeichen{width:34px;height:34px}',
    an:{ ...DIST, fehlt:'.rollen.buch .raumzelle{padding:var(--r0)}' },
    sagt:'über den Rand' },

  /* UND DIE ANDERE ZUSAGE DERSELBEN STELLE: gleich hohe Zellen (B15).
   *
   * Vier Spalten statt drei gehen, seit das Polster knapper ist. Mit dem
   * ALTEN Polster gingen sie nicht: 65 Punkte fuer den Text, und
   * „Bauernhof" braucht 70 - also drei Zeilen bei manchen Namen und
   * zwei bei anderen. Aus siebzehn gleich hohen Zellen werden zwei
   * Hoehen (84 und 100), und damit haengt die Hoehe der Wand wieder an
   * der Schriftrundung. Das ist der Fehler, der bei B15 neun
   * Auslieferungen gekostet hat.
   *
   * Der Eingriff stellt genau diese Kombination her. Er laesst das
   * Kapitel dabei INNERHALB des Randes (517 von 658) - es meldet also
   * die ungleichen Hoehen und nicht den Ueberlauf, und das ist die
   * Zusage, um die es hier geht.
   *
   * Diese Probe ist die, die den Zweig ueberhaupt zum ersten Mal
   * erreicht hat. Er stand seit B15 da und haette mit
   * „ReferenceError: name is not defined" abgebrochen statt zu melden -
   * `name` ist der Parameter von `schau`, und der Block steht daneben.
   * Eine Pruefung, die im Befundfall abstuerzt, hat nie etwas bewiesen.
   * Ohne diese Gegenprobe waere die Reparatur selbst wieder eine
   * Behauptung. */
  { n:'die Raumzellen werden auf dem schmalen Schirm ungleich hoch',
    tor:'passt', bauen:true, datei:V,
    such:'  .rollen.buch .raumzelle{padding:var(--r0)}',
    ersatz:'  .rollen.buch .raumzelle{padding:var(--r0)}\n'
      + '  .rollen.buch .raumgitter{grid-template-columns:repeat(auto-fit,minmax(76px,1fr))}\n'
      + '  .rollen.buch .raumzelle{padding:var(--eng)}',
    an:{ ...DIST, text:'minmax(76px,1fr)' },
    sagt:'verschiedene Höhen hoch' },

  /* --- I23: das lange Wort, BEVOR es eine dritte Zeile kostet -------- *
   *
   * Die Probe darueber faengt den Befund erst, wenn er eingetreten ist -
   * und er trat nur auf dem Runner ein, acht Auslieferungen lang. Der
   * neue Zweig verlangt stattdessen einen Abstand: das laengste Wort
   * eines Raumnamens darf hoechstens 85 % der Zellenbreite fuellen.
   *
   * Der Eingriff gibt einem Raum seinen alten, zu langen Namen zurueck -
   * denselben, der die Auslieferung gekostet hat. Er bricht hier
   * NICHT um (93 % passen lokal noch in zwei Zeilen), und genau darum
   * ist er der richtige Eingriff: er zeigt, dass der neue Zweig meldet,
   * WO die Hoehenpruefung daneben still bleibt. */
  { n:'ein Raumname fuellt seine Zelle wieder bis zum Rand',
    tor:'passt', bauen:true, datei:'src/inhalt/tiere.js',
    such:"titel:'Bei den Hunden',",
    ersatz:"titel:'In der Hundeschule',",
    an:{ ...DIST, text:'In der Hundeschule' },
    sagt:'DRITTE Zeile' },

  /* --- I14: der abgeleitete Vorlaufsatz, in beide Richtungen ---------- *
   *
   * Seit es die Ebene „Hauptstädte" auf ZWEI Kontinentkarten gibt, wird
   * ihr Vorlaufsatz abgeleitet statt geschrieben. Vorher stand dort ein
   * Satz, der für Europa richtig war („nicht die groesste Stadt - bei
   * einem Land hier sind das zwei verschiedene") und den Suedosteuropa
   * still zur Luege gemacht haette: dort ist jede der sieben Hauptstaedte
   * die groesste Stadt ihres Landes, und jeder Ablenker ist kleiner.
   * Regel 6 - was zweimal dasteht, veraltet einmal; hier haette es
   * gereicht, dass es EINMAL dastand und zweimal gelesen wird.
   *
   * Der Nachsatz haengt an `falle`, und `falle` haengt an dem
   * abweichenden Regierungssitz aus den gebackenen Daten. Europa hat
   * einen (Niederlande - Den Haag), Suedosteuropa keinen.
   *
   * ZWEI Proben und nicht eine, weil eine Ableitung mit einem Bild nicht
   * zu beweisen ist: ein Satz ohne Nachsatz sieht genauso aus wie ein
   * fest hingeschriebener Satz ohne Nachsatz. Erst beide Richtungen
   * zeigen, dass dieselbe Zeile zwei verschiedene Saetze ergibt (Regel 1:
   * wer eine Wirkung misst, schaltet sie zuerst ab).
   *
   * `passt` waere hier das falsche Tor - ein laengerer Satz laeuft nicht
   * ueber den Rand, er bricht um. Genau der Fall, fuer den es die
   * Vorbilder gibt. Auf dem Runner ausgelassen: `ansicht` ist dort
   * abgeschaltet (Q39). */
  { n:'Suedosteuropa erbt den Nachsatz, den nur Europa hat', tor:'ansicht',
    args:['--nur=quer-hauptstaedte-so'], bauen:true, datei:D,
    such:'liste.filter(l => l.hauptstadt && l.falle && l.regierungssitz)',
    ersatz:"liste.filter(l => l.hauptstadt).slice(0, 1)"
      + ".map(l => ({ ...l, regierungssitz: 'Anderswo' }))",
    an:{ ...DIST, fehlt:'l.falle && l.regierungssitz' },
    sagt:'quer-hauptstaedte-so' },

  { n:'Europa verliert den Nachsatz ueber den Regierungssitz', tor:'ansicht',
    args:['--nur=quer-hauptstaedte-eu-vorlauf'], bauen:true, datei:D,
    such:'liste.filter(l => l.hauptstadt && l.falle && l.regierungssitz)',
    ersatz:'[]',
    an:{ ...DIST, fehlt:'l.falle && l.regierungssitz' },
    sagt:'quer-hauptstaedte-eu-vorlauf' },

  /* --- I19: und die Karte mit ZWEIEN ---------------------------------- *
   *
   * Der Fehler, den I19 behoben hat, war nicht, dass der Satz fehlte -
   * er stand da und sagte „Ein Land hier ist besonders", auf acht Karten,
   * und war auf dreien falsch. Ein Eingriff, der den Satz WEGNIMMT,
   * beweist das nicht; er muss die ZAHL verfaelschen. Hier faellt das
   * zweite Land aus der Liste, und die Aufnahme muss es merken. */
  { n:'die Karte mit zwei Besonderheiten nennt nur eine', tor:'ansicht',
    args:['--nur=quer-hauptstaedte-as-vorlauf'], bauen:true, datei:D,
    such:'const besonders = liste.filter(l => l.hauptstadt && l.falle && l.regierungssitz);',
    ersatz:'const besonders = liste.filter(l => l.hauptstadt && l.falle && l.regierungssitz)'
      + '.slice(0, 1);',
    an:{ ...DIST, text:'l.regierungssitz).slice(0, 1)' },
    sagt:'quer-hauptstaedte-as-vorlauf' },

  /* --- I7: der Vorrat als Ratsche ------------------------------------- *
   *
   * `vielfalt` ist das Tor, das den Inhalt-Audit am Leben haelt: keine
   * Ebene darf weniger als zwei volle Runden Vorrat haben. Der Befund, den
   * der Audit gefunden hat, war leise - „beim zweiten Start kommen dieselben
   * Saetze" sieht kein Rauchtest, kein Bildvergleich und kein Kontrasttor.
   *
   * Der Eingriff schneidet den Vorrat der Hoersaetze auf acht. Die Eltern
   * bekommen zwoelf Aufgaben je Sitzung; acht Gegenstaende sind damit
   * WENIGER als eine Runde, und die zweite Sitzung waere Satz fuer Satz
   * die erste. Genau das soll das Tor sagen.
   *
   * `hoersatz` und nicht `laender:nordamerika`: der Vorrat der Hoersaetze
   * ist eine Liste, die jemand geschrieben hat, und nur dort gilt die
   * Grenze (I6). Ein Eingriff an einer Ebene, deren Vorrat die Welt ist,
   * duerfte nichts ausloesen - und wuerde damit auch nichts beweisen. */
  { n:'der Vorrat einer Ebene reicht nicht fuer zwei Runden',
    tor:'vielfalt', args:['--tor'], bauen:true, datei:D,
    such:"    return Englisch.vorratHoersaetze();",
    ersatz:"    return Englisch.vorratHoersaetze().slice(0, 8);",
    an:{ ...DIST, text:'vorratHoersaetze().slice(0, 8)' },
    sagt:'Zu wenig Vorrat' },

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
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
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
    such:"      wer:['lea','stephan','violeta'], gruppe:'hauptstaedte',",
    ersatz:"      gruppe:'hauptstaedte',",
    /* Die Nachfrage nennt die GANZE Zeile und nicht nur die `wer`-Liste.
       Seit F3 gibt es eine zweite Ebene mit derselben Liste
       (`flaggenpaare`); ein Eingriff, der eine von zweien entfernt,
       laesst die andere stehen, und die Probe meldete fuer immer "kam
       nicht an". Das Tor `anker` hat es gesagt, bevor der naechste
       Probenlauf es gekostet haette.

       UND EIN ZWEITES MAL, mit I14: die Hauptstadt-Ebene fuer
       Suedosteuropa hat dieselbe `wer`-Liste und dieselbe Gruppe.

       SEIT I16 GIBT ES DIE ZEILE NUR NOCH EINMAL, und das ist besser als
       jede Unterscheidung: die acht Hauptstadt-Ebenen werden erzeugt,
       nicht aufgeschrieben. Der Eingriff nimmt `wer` aus der Erzeugung -
       damit bekommt Fiona nicht eine, sondern ALLE acht, und der
       Rauchtest meldet die erste, die er findet. */
    an:{ ...DIST, fehlt:"wer:['lea','stephan','violeta'], gruppe:'hauptstaedte'" },
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
    args:['--nur=spielen,ablage'], datei:'tor/smoke.mjs',
    such:'  await p.setViewportSize(viewport);',
    ersatz:'  // (Bildausschnitt nicht gesetzt)',
    an:{ datei:'tor/smoke.mjs', fehlt:'await p.setViewportSize(viewport);' },
    sagt:'misst eine andere Größe' },
  // Die Uebersicht im Elternbereich verschwindet.
  //
  // Der Bereich hatte bis hierher gar kein Vorbild - ausgerechnet der,
  // der zuletzt um zwei Tabellen gewachsen ist.
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
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
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
  { n:'die Siegsterne kommen bei den Eltern zurück', tor:'ansicht', args:['--nur=quer-ende-eltern'], bauen:true, datei:D,
    // Seit B2 steht davor die Weiche „Test oder Uebung"; getauscht wird
    // nur der Uebungszweig.
    such:": ton().siegsterne ? `<div class=\"siegsterne${ton().feier ? ' feier' : ''}\"",
    ersatz:': `<div class="siegsterne"',
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
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
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
    such:"      const wegweiser = !umgekehrt && zielIds.includes(n.x.id) ? ' nadelziel' : '';",
    ersatz:"      const wegweiser = '';",
    an:{ ...DIST, text:"const wegweiser = '';" },
    sagt:'ohne hervorgehobenen Faden' },

  { n:'der Wegweiser leuchtet auch bei der umgekehrten Frage', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"      const wegweiser = !umgekehrt && zielIds.includes(n.x.id) ? ' nadelziel' : '';",
    ersatz:"      const wegweiser = zielIds.includes(n.x.id) ? ' nadelziel' : '';",
    an:{ ...DIST, text:"const wegweiser = zielIds.includes(n.x.id)" },
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
  { n:'eine Kapitelseite im Buch ist zu hoch für den Bildschirm', tor:'smoke',
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
     * Zustand, den die Pruefung meint.
     *
     * Q44 hat den Eingriff ins Leere laufen lassen, und das ist die dritte
     * Verfallsart in dieser Datei: nicht der Suchtext war weg, nicht die
     * Pruefung - die REGEL wurde ueberschrieben. Das Kapitelbuch hat eine
     * eigene, spezifischere Hoehe fuer die einzelne Albumkarte
     * (`.rollen.buch.kapitel:not(:has(...))`, 200 Punkte); die 300 aus dem
     * allgemeinen `.albumkarte svg` kamen im Buch gar nicht mehr an.
     * `proben` hat es gemeldet: „`smoke` bleibt gruen, obwohl der Fehler
     * drin ist". Gedreht wird jetzt an der Regel, die WIRKLICH gilt, und
     * gemessen wird an der Zusage, die es seit Q44 gibt: auf einer
     * Kapitelseite steht jeder Block ganz im Bild. */
    /* Der Selektor hat sich mit Q46 geaendert - der Satz zum Mitnehmen
       steht seit dann unter der Karte und muss uebersprungen werden -,
       und die Hoehe von 200 auf 165. `inhalt` hat es gemeldet: der
       Eingriff waere nicht angekommen, und das Tor haette gruen gemeldet,
       ohne etwas zu pruefen.
       Mit G15 steht sie auf 185 - das Forscherbuch hatte das groesste
       leere Band der App. Gemeldet hat es wieder `inhalt`, an derselben
       Stelle, aus demselben Grund: eine Hoehe im Suchtext ist ein Anker
       auf eine Zahl, und Zahlen aendern sich. */
    such:'  .rollen.buch.kapitel:not(:has(.albumkarte ~ *:not(.buchsatz))) .albumkarte svg{height:165px}',
    ersatz:'  .rollen.buch.kapitel:not(:has(.albumkarte ~ *:not(.buchsatz))) .albumkarte svg{height:600px}',
    an:{ ...DIST, text:'.albumkarte svg{height:600px}' },
    sagt:'nicht alles im Bild' },

  /* Der leere Kopf nimmt wieder 68 Punkte weg.
   *
   * Auf dem Zielgeraet sind das 17 % der Bildschirmhoehe, und der ganze
   * Block darunter steht dann wieder unter der Mitte. */
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). Ortsfest
     gefahren am 07.09.2026 und angeschlagen - der in Q48 reparierte
     Anker haelt wieder (tor/proben-stand.json). */
  { n:'der leere Kopf nimmt wieder Platz weg', tor:'ansicht', // Endbildschirm und Pause sind die beiden, die `kopf({})` rufen - das
    // steht ueber der Funktion, und der erste Anlauf hat es trotzdem auf
    // Profil- und Weltenwahl geraten. Die haben eine Kopfzeile mit Inhalt.
    args:['--nur=quer-ende,quer-pause'], bauen:true, datei:D,
    such:'  (links || mitte || rechts)\n  ?',
    ersatz:'  true\n  ?',
    /* MIT Leerzeichen (Q48). So steht es in der Quelle und so kommt es ins
       Buendel - der Bau minimiert nicht. Ohne sie stand der Text nirgends,
       „ist verschwunden" traf also schon vor dem Eingriff zu, und die
       Probe hat vier Runden lang nichts bezeugt. */
    an:{ ...DIST, fehlt:'(links || mitte || rechts)' },
    sagt:'quer-ende' },
  /* Und die Pause verliert ihre Warnung. Der Knopf daneben loescht alles,
   * was das Kind in dieser Uebung gesammelt hat. */
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
  { n:'die Pause warnt nicht mehr vor „von vorne"', tor:'ansicht', args:['--nur=quer-pause'], bauen:true, datei:D,
    such:'      <div class="unter" id="was">Bei „von vorne" verschwindet alles, was du',
    ersatz:'      <div class="unter" id="was">Bei „von vorne" geht es weiter, was du',
    an:{ ...DIST, fehlt:'von vorne" verschwindet alles' },
    sagt:'quer-pause' },

  /* Der Vorlauf legt wieder acht Spuren an, egal wieviele Karten es sind.
   *
   * Dann stehen sechs Rechenaufgaben linksbuendig in einer Reihe von acht,
   * mit einem Loch von vierhundert Punkten rechts. */
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
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
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
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
    args:['--nur=spielen,ablage'], datei:D,
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
    args:['--nur=spielen,ablage'], datei:D,
    such:'    if (!Einst.vorlaufGezeigt[`${P.id}:${id}`]) zeige(()=>vorlauf(id));',
    ersatz:'    if (false) zeige(()=>vorlauf(id));',
    an:{ ...DIST, text:'if (false) zeige' }, sagt:'kommt kein Vorlauf' },
  // Er kommt, aber er ist stumm - und damit fuer Fiona leer.
  /* Der Eingriff sitzt jetzt an `ansagenBinden` - dem EINEN Ort, an dem
     die Ansage gebunden wird. Bis zum Buch-Umbau stand dieselbe Schleife
     zweimal da (Vorlauf und Buch), und diese Probe hing an der Fassung
     im Vorlauf. Genau diese Dopplung hat dann auch gekostet: der
     „Zurueck"-Knopf verlor seine Aufgabe, ich habe die eine Stelle
     geflickt, und der Rauchtest hat die zweite gemeldet. */
  /* ZWEI Abschnitte, und das ist keine Bequemlichkeit.
     `--nur=spielen` allein ist rot, und zwar ohne jeden Eingriff: die
     Fremdgriff-Pruefung sieht in diesem Abschnitt keinen ruhenden
     Aufgabenbildschirm und meldet zu Recht, dass sie nichts beweist
     (Regel 1). Eine Probe auf einem Lauf, der schon vorher rot ist,
     beweist ebenfalls nichts - der Laeufer sagt das auch so. Mit
     `ablage` daneben ist der Lauf gruen, und der Eingriff ist wieder
     der einzige Unterschied. */
  { n:'die Karten im Vorlauf sagen nichts', tor:'smoke', bauen:true,
    args:['--nur=spielen,ablage'], datei:D,
    such:"  b.addEventListener('click', () => vorlesen(b.dataset.lesen, b.dataset.sprache || 'de'));",
    ersatz:"  b.addEventListener('click', () => {});",
    an:{ ...DIST, text:"b.addEventListener('click', () => {})" },
    sagt:'sagt nichts' },
  // Er zeigt nicht, was die Ebene enthaelt.
  { n:'der Vorlauf zeigt die falsche Zahl an Gebieten', tor:'smoke', bauen:true,
    args:['--nur=spielen,ablage'], datei:D,
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
    such:"    b.style.animation='none';", ersatz:'',
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

  /* --- Der Tagesstern nach dem Neustart (N2, vormals A4h) ---------------
   *
   * DIESE ZWEI PROBEN HABEN DEN BESITZER GEWECHSELT. Sie standen auf der
   * Zeile „heute schon geuebt"; die ist in N2 dem Tagesziel gewichen, weil
   * es dasselbe sagt und mehr - und weil Fiona drei Sterne lesen kann und
   * einen Satz nicht. Die ZUSAGE ist dieselbe geblieben, deshalb bleiben
   * auch die Proben: es geht um eine Auskunft, die den Neustart ueberlebt
   * und die NICHT auf jeder Kachel steht.
   *
   * 1. Der Stern ueberlebt den Neustart nicht. Der Eingriff schreibt gar
   *    nicht erst - waehrend der Runde stuende er da (der Zustand im Kopf
   *    reicht dafuer) und waere nach dem Neustart weg. */
  { n:'der Tagesstern überlebt den Neustart nicht', tor:'smoke',
    bauen:true, args:['--nur=ablage'], datei:D,
    such:"  try { await Ablage.setze('einstellungen', k, tagesStand[k]); } catch(e){}",
    ersatz:"  try { if (false) await Ablage.setze('einstellungen', k, tagesStand[k]); } catch(e){}",
    an:{ ...DIST, text:"if (false) await Ablage.setze('einstellungen', k, tagesStand[k])" },
    sagt:'keinen Tagesstern' },

  /* 2. ER STEHT AUF JEDER KACHEL. Das ist die Sorte Fehler, die
   *    freundlich aussieht: die Sterne sind da, sie leuchten, sie sagen
   *    etwas Nettes - und sie sagen es auch dem Kind, das heute nicht
   *    gespielt hat. Damit sind sie kein Ziel mehr, sondern ein
   *    taeglicher Vorwurf, und genau den schliesst der Abgleich aus
   *    („kein Streak-Zwang"). Der Eingriff laesst den Tagesschritt jedes
   *    Kind auf einmal fuellen. */
  { n:'der Tagesstern steht auf jeder Kachel', tor:'smoke',
    bauen:true, args:['--nur=ablage'], datei:D,
    such:"  const e = tagesStand[TAGESKEY(id)];\n"
      + "  return (e && e.tag === heute()) ? Math.min(e.zahl || 0, TAGESZIEL) : 0;",
    ersatz:"  const e = tagesStand[TAGESKEY(id)];\n"
      + "  return TAGESZIEL; // Anker: return (e && e.tag === heute()) ? Math.min(e.zahl || 0, TAGESZIEL) : 0;",
    an:{ ...DIST, text:'return TAGESZIEL; // Anker' },
    sagt:'obwohl sie noch gar nicht gespielt hat' },

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
     vierten Welt schmaler macht.

     SEIT E3 IST DAS KEINE VORSORGE MEHR, sondern der laufende Betrieb:
     Fiona HAT vier Welten. Gemessen am selben Lauf sagt die
     Kapazitaetsratsche „4 Kacheln stehen da, 4 passen" (iPhone SE quer) -
     die Regel traegt genau die vierte, und die fuenfte gibt es nicht mehr
     umsonst. Der Eingriff schlaegt damit nicht mehr nur an der Ratsche
     an, sondern am wirklichen Bildschirm. */
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
    /* DIE REGEL WEGZUNEHMEN LAESST DIE KARTE WACHSEN, nicht schrumpfen -
       und die Pruefung schlaegt nur bei Schrumpfen an. Der Eingriff war
       zwei Fassungen lang verkehrt herum, und das ist am Stylesheet
       auszurechnen: faellt `height:125px` weg, greift die Grundregel
       `clamp(120px, 42vh, 340px)`, und 42 vh sind auf dem Zielgeraet
       (390 hoch) 164 Punkte. Der Stand haelt 125 fest
       (`tor/masse-stand.json`), 164 ist mehr, und `ist < war` war nie
       wahr.
       Jetzt setzt der Eingriff eine KLEINE Hoehe. Das ist der Fehler,
       den die Probe im Namen traegt: die Karte schrumpft auf
       Briefmarkengroesse. */
    such:'  .rollen.buch:not(:has(.albumkarte ~ *:not(.buchsatz))) .albumkarte svg{height:125px}',
    ersatz:'  .rollen.buch:not(:has(.albumkarte ~ *:not(.buchsatz))) .albumkarte svg{height:40px}',
    an:{ ...DIST, text:'.albumkarte svg{height:40px}' },
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
  /* HIER STAND EINE PROBE AUF `neuHaengen()` - und sie ist mit F2
     gestorben, nicht kaputtgegangen.
     
     Sie nahm den Anstoss heraus und erwartete, dass die Kapazitaet
     faellt. Das ging, solange die Ebenenwand HOECHSTENS ZEHN Kacheln
     trug: geklont wurde bis elf, die Regel griff erst dabei, und ohne
     das Wiedereinhaengen mass das Tor die alte Breite weiter.
     
     Seit die Flaggenkachel dazugekommen ist, hat die Wand SELBST elf.
     Die Regel greift damit schon an der Wand, die die App gebaut hat -
     ein Klon kann die Schwelle nicht mehr ueberschreiten, und das
     Wiedereinhaengen aendert keine Zahl mehr. Nachgemessen und nicht
     vermutet: `passt --teil=0/5` liefert mit und ohne `neuHaengen()`
     Zeile fuer Zeile dieselben Kapazitaeten.
     
     Der Anstoss bleibt trotzdem im Tor: er ist der Weg, auf dem die App
     ihre Waende baut, und die Schwelle kann wieder unterschritten
     werden. Was ihn NICHT braucht, ist eine Gegenprobe - eine, die nie
     etwas meldet, ist kein Beweis (Regel 1), und die Zusage dahinter
     (die Wand verliert keinen Platz) haelt die Ratsche in
     `masse-stand.json`, bewacht von der Probe darueber. */

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
  /* Der Geltungsbereich der Fremdgriff-Frage (Q39b, geflickt in Q49).
   *
   * Ohne ihn ist `smoke` in JEDEM Ausschnitt rot, in dem kein Bildschirm
   * zur Ruhe kommt - und zehn stehende Gegenproben, die genau so einen
   * Ausschnitt fahren, beweisen dann nichts.
   *
   * Der Eingriff nimmt die Bedingung heraus UND setzt die Zahl der
   * ruhenden Bildschirme auf null. Das zweite ist der Flick: bis Q49
   * borgte sich die Probe die Null vom Ausschnitt `streu`, in dem hier
   * kein Bildschirm zur Ruhe kommt. Auf dem Runner kommt einer zur Ruhe -
   * derselbe Ausschnitt, dieselbe App, nur langsamer, und die Probe blieb
   * gruen. Eine Voraussetzung, die aus der Rechnerlast kommt, ist keine
   * (Regel 5: jede Zahl traegt ihre Messstelle mit). Jetzt stellt die
   * Probe sie selbst her und gilt auf jeder Maschine. */
  { n:'die Fremdgriff-Frage gilt wieder für jeden Ausschnitt', tor:'smoke',
    args:['--nur=streu'], bauen:true, datei:'tor/smoke.mjs',
    such:'if (griffStand.geprueft === 0 && !nurAusschnitt)',
    ersatz:'griffStand.geprueft = 0;\nif (griffStand.geprueft === 0 && true)',
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
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
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
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
  { n:'Grönland ist wieder nur Umgebung', tor:'ansicht', bauen:true,
    args:['--nur=quer-nordamerika'], datei:E,
    such:"    { a3:'GRL', name:'Grönland', rang:4, aliasse:['Groenland','Greenland'],\n      aussprache:['grönland','groenland','grünland'] },\n",
    ersatz:'',
    /* Nachgefragt wird der EINTRAG, nicht der Name (Q47).
       „Grönland fehlt" war seit D3 nie mehr wahr: der Satz zum Mitnehmen
       nennt das Land, und der steht im selben Buendel. Der Eingriff kam
       an, die Nachfrage sagte nein, und die Probe bewies nichts - im
       vollen Lauf gemeldet, in keinem Ausschnitt zu sehen. Das ist der
       Wert eines vollen Laufs: eine Probe stirbt an einer Aenderung
       woanders. */
    an:{ ...DIST, fehlt:'"a3":"GRL","name":"Grönland"' }, sagt:'quer-nordamerika' },

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

  /* Die teuerste Probe dieses Verzeichnisses, weil ihr Fehler MONATE
   * unbemerkt lief: auf einer mueden Leitung hat sich die App nie
   * erneuert. Der Eingriff setzt genau die Fassung zurueck, die das
   * angerichtet hat - den Abruf im Rennen, verworfen beim Zeitablauf.
   * `offline` bleibt dabei gruen, denn ohne Netz startete sie ja. */
  { n:'der abgebrochene Abruf legt nichts nach', tor:'pwa', bauen:true,
    datei:'prototyp/pwa/sw.js',
    such:"async function seiteHolen(anfrage, ereignis) {\n  const lager = await caches.open(LAGER);\n  /* Der Abruf laeuft weiter, gleich wer das Rennen gewinnt - und er legt\n     ab, sobald er ankommt. `waitUntil` haelt den Service Worker dafuer am\n     Leben; ohne das darf der Browser ihn nach der Antwort abschalten, und\n     der Nachschub waere wieder weg. */\n  const abruf = fetch(anfrage, { cache: 'no-store' }).then(async (netz) => {\n    if (!netz || !netz.ok) throw new Error('Antwort nicht in Ordnung');\n    await lager.put('./index.html', netz.clone());\n    return netz;\n  });\n  if (ereignis && ereignis.waitUntil) ereignis.waitUntil(abruf.catch(() => {}));\n  else abruf.catch(() => {});\n  try {\n    return await Promise.race([\n      abruf,\n      new Promise((_, nein) => setTimeout(() => nein(new Error('zu langsam')), ZU_LANGSAM)),\n    ]);\n  } catch (e) {\n    const alt = await lager.match('./index.html');\n    if (alt) return alt;\n    // Nichts im Lager - dann bleibt nur warten, so lange es dauert.\n    return abruf;\n  }\n}\n",
    ersatz:"async function seiteHolen(anfrage, ereignis) {\n  const lager = await caches.open(LAGER);\n  try {\n    const netz = await Promise.race([\n      fetch(anfrage, { cache: 'no-store' }),\n      new Promise((_, nein) => setTimeout(() => nein(new Error('zu langsam')), ZU_LANGSAM)),\n    ]);\n    if (!netz || !netz.ok) throw new Error('Antwort nicht in Ordnung');\n    await lager.put('./index.html', netz.clone());\n    return netz;\n  } catch (e) {\n    const alt = await lager.match('./index.html');\n    if (alt) return alt;\n    return fetch(anfrage);\n  }\n}\n",
    an:{ datei:'dist/sw.js', fehlt:'ereignis.waitUntil(abruf' },
    sagt:'müden Leitung' },

  /* --- doku: die Historie, die der Bau braucht (Q53) ---------------- *
   *
   * Der teuerste stille Fehler dieses Verzeichnisses: 288 Auslieferungen
   * lang stand auf dem Geraet `v1`, weil `actions/checkout` ohne
   * `fetch-depth: 0` genau einen Einchecker holt und `rev-list --count
   * HEAD` dann 1 zaehlt. Auf diesem Rechner liegt immer die volle
   * Historie - die Zahl war an ihrer Messstelle richtig und nur an der
   * anderen falsch (Regel 5).
   *
   * Der Eingriff nimmt die Zeile aus der Auslieferung. Kein Bauen
   * noetig: die Pruefung liest den Ablauf. */
  { n:'der Auslieferung fehlt die Historie', tor:'inhalt',
    datei:'.github/workflows/auslieferung.yml',
    such:"        with:\n          # Die volle Historie, weil `bauen.mjs` die Fassungszahl aus\n          # `git rev-list --count HEAD` nimmt. Ein flacher Klon zaehlt 1,\n          # und dann steht auf dem Geraet `v1` statt der Fassung. Genau\n          # das ist von v117 bis v405 passiert (Q53).\n          fetch-depth: 0\n",
    ersatz:"",
    an:{ datei:'.github/workflows/auslieferung.yml', fehlt:'fetch-depth: 0\n' },
    sagt:'statt der Fassung' },

  /* --- smoke -------------------------------------------------------- */
  // Das Doppelbild: nimmt man dem neuen Bildschirm seinen Takt Vorsprung,
  // blenden beide gleichzeitig und treffen sich bei etwa 0,5.
  { n:'beide Bildschirme blenden gleichzeitig', tor:'smoke', args:['--nur=spielen,ablage'], bauen:true, datei:V,
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
  { n:'Kopf und Endbildschirm rechnen wieder verschieden', tor:'smoke', args:['--nur=spielen,ablage'], bauen:true, datei:D,
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
  { n:'das Fortschrittsband färbt sich nicht mehr', tor:'smoke', args:['--nur=spielen,ablage'], bauen:true, datei:D,
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
  { n:'die Karte zeigt den Fortschritt erst viel später', tor:'smoke', args:['--nur=spielen,ablage'],
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
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
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
    /* Seit E10 ist die Zuordnung eine TABELLE - der Eingriff sitzt an ihr
       und nicht mehr an einer Kette von Fragezeichen. Was er anrichtet,
       ist dasselbe: jede Ebene landet in der Erdkunde. */
    such:"const weltVon = (e) => WELT_VON_ART[e.art] || 'erdkunde';",
    ersatz:"const weltVon = (e) => 'erdkunde'; //Anker:  const weltVon = (e) => WELT_VON_ART[e.art] || 'erdkunde';",
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
    // Rueckfrage; getauscht wird nur das Erhoeren selbst. Seit F2b sitzt
    // es in `erhoert`, dem Bauteil, das beide Sprechbildschirme benutzen.
    such:'  const t = Vergleich.hoerAbgleich(ctx.varianten || [roh], kand);',
    ersatz:'  const t = Vergleich.abgleich(roh, kand);',
    an:{ ...DIST, text:'const t = Vergleich.abgleich(roh, kand);' },
    sagt:'gesprochen und nichts gewertet' },

  // 2. Nicht verstanden zaehlt wieder als Fehlversuch. Nach drei
  //    Verstaendnisfehlern loest die App die Aufgabe auf.
  //    Gezielt NUR der Ausstieg, nicht die ganze Verzweigung: die Meldung
  //    soll stehenbleiben, damit die Probe den ZAEHLER trifft und nicht
  //    den Satz - sonst schlaegt sie an derselben Stelle an wie Probe 4
  //    und beide bezeugen dasselbe.
  { n:'nicht verstanden kostet wieder einen Versuch', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    /* Der Ausstieg selbst faellt weg: ohne ihn laeuft die Aeusserung, die
       niemand verstanden hat, in den Versuchszaehler. Seit F2b steht er
       in `erhoert` und heisst `return null`. */
    such:'    if (unverstanden) unverstanden(roh);\n    return null;\n',
    ersatz:'    if (unverstanden) unverstanden(roh);\n',
    an:{ ...DIST, fehlt:'unverstanden(roh);\n    return null;' },
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
    such:'    const satz = roh ? `Ich habe \u201e${roh}\u201c verstanden. Sag es noch einmal.`',
    ersatz:"    const satz = roh ? 'Das habe ich nicht verstanden.'",
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
    /* Nachgezogen mit E2: `vorlesen` nimmt seither eine Sprache entgegen.
       Der Anker haengt an der Signatur, und eine Signatur aendert sich -
       gemeldet hat es `inhalt` in 2,8 Sekunden, bevor ein Browser lief. */
    such:"function vorlesen(text, sprache = 'de'){\n  if(hoertZu) return;\n",
    ersatz:"function vorlesen(text, sprache = 'de'){\n",
    an:{ ...DIST, fehlt:"function vorlesen(text, sprache = 'de'){\n  if(hoertZu) return;" },
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
    such:"  if (t.art === 'rueckfrage') { rueckfrage(t, roh, ctx, { ziel, stelle, bewerte }); return null; }\n",
    ersatz:'',
    an:{ ...DIST, fehlt:"if (t.art === 'rueckfrage') { rueckfrage(" },
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






  /* --- G15c: die Vorschauseite sagt, wie weit es noch ist -------------
   *
   * Der Eingriff nimmt den Fortschritt von der Vorschauseite - genau der
   * Zustand von vor G15c, in dem sie 29 % ihrer Hoehe nutzte und nichts
   * ausser drei Karten zeigte. */
  { n:'die Vorschauseite verschweigt wieder den Fortschritt', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:"          anteil: dran.da.filter(x => x.gekonnt).length / gesamt }) : ''; })()}",
    ersatz:"          anteil: dran.da.filter(x => x.gekonnt).length / gesamt }) \u0026\u0026 '' : ''; })()}",
    an:{ ...DIST, text:"gesamt }) && ''" },
    sagt:'verschweigt, wie weit es noch ist' },

  /* --- G15b: eine Kapitelseite darf nicht halb leer sein ---------------
   *
   * Die Ratsche haelt fest, was gemessen ist. Der Eingriff nimmt den
   * Abzeichen-Kapiteln zwei ihrer drei naechsten Schritte - genau der
   * Zustand von vor G15b, in dem die Seite 18 % ihrer Hoehe nutzte. */
  /* ZWEI Hebel sind an dieser Probe schon gestorben, beide leise:
     - bis v423 schnitt sie die drei Vorschaukarten auf „Als Naechstes"
       von drei auf eine. Sobald die naechste Gruppe eine Karte hat - und
       Europa hat eine -, zeigt die Seite die KARTE und gar keine
       Kaertchen; der Schnitt ging ins Leere. Gemessen: die Seite steht
       bei 42 %, weit ueber der Ratsche.
     - der zweite Anlauf schnitt die Abzeichen von sechs auf eines. In
       diesem Durchgang traegt die Seite ohnehin nur EINES („1/10"), der
       Eingriff war ein Nulleingriff. Gemessen: 25 % mit und ohne.
     Beide Male hat der Eingriff die Datei erreicht und das Bild nicht
     veraendert - die dritte Verfallsart, und die teuerste, weil sie wie
     ein schwaches Tor aussieht.
     Jetzt bleibt das Raster LEER. Das ist der aeusserste Fall dessen,
     was die Pruefung meint, und er haengt an keinem Stand: eine Seite
     ohne Inhalt kann keine Hoehe nutzen. */
  /* B4b hat ZWEI halbleere Seiten gefuellt, und beide brauchen ihre
     eigene Falle. Die erste ist die Rechenseite: ohne die Tafel bleibt
     dort die Aufkleberwand, und die Seite fiel auf 29 % ihrer Hoehe.
     
     Hier stand vorher ein Eingriff, der die ABZEICHEN leerte. Er machte
     das Tor rot, aber mit einer anderen Meldung („kein Abzeichenkapitel
     auf 390 x 844") - die Seite verschwand ganz, statt duenn zu werden,
     und was die Probe meint, wurde nie gemessen. */
  { n:'die Rechenseite im Buch verliert ihre Tafel', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'      zeigt: hatKarte(g) ? albumKarte(g) : (rechenTafel(g)',
    ersatz:'      zeigt: hatKarte(g) ? albumKarte(g) : (null',
    an:{ ...DIST, text:'zeigt: hatKarte(g) ? albumKarte(g) : (null' },
    /* Nicht die Fuellung, sondern die TAFEL: nachgemessen faellt die
       Rechenseite ohne sie auf 67 %, und die Ratsche steht bei 24. Der
       Rauchtest hat aber eine eigene, genauere Zusage - „keine einzige
       Rechentafel im Buch, und dann beweist ,kein Befund' hier nichts".
       Die ist es, die anschlaegt, und sie sagt genauer, was fehlt. */
    sagt:'keine einzige Rechentafel' },

  /* --- B12: ein Reiter ist eine Welt, keine Ebene --------------------
   *
   * Zwei Proben. Die erste dreht die Runde zurueck: jede Ebene bekommt
   * wieder ihr eigenes Kapitel. Gemessen an einem Profil mit Fortschritt
   * auf allen Ebenen sind das siebzehn Reiter statt sechs, und fuenf
   * davon stehen auf dem Zielgeraet ausserhalb des Streifens.
   *
   * Der Eingriff faellt auf die EINZELNE Ebene zurueck und nicht auf
   * irgendeine kaputte Kennung: `id` und `titel` kommen dann wieder aus
   * der Gruppe, genau wie vor B12. Das Buch funktioniert danach - es
   * waechst nur wieder mit. */
  { n:'jede Ebene bekommt wieder ihr eigenes Kapitel', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:"    kapitel.push({ id, titel: w.name, farbe: w.farbe, zahl, gesamt,\n"
      + "      lesen: `${w.name}. ${zahl} von ${gesamt} Aufklebern.`,",
    ersatz:"    for (const g of gs) kapitel.push({ id: g.id, titel: g.titel,\n"
      + "      farbe: g.farbe, zahl: g.da.length, gesamt: g.da.length + g.offen.length,\n"
      + "      lesen: `${g.titel}.`, inhalt: gruppenSeite(g) });\n"
      + "    if (gs.length) continue;\n"
      + "    kapitel.push({ id, titel: w.name, farbe: w.farbe, zahl, gesamt,\n"
      + "      lesen: `${w.name}. ${zahl} von ${gesamt} Aufklebern.`,",
    an:{ ...DIST, text:'for (const g of gs) kapitel.push({ id: g.id, titel: g.titel,' },
    sagt:'tragen eine Ebene statt einer Welt' },

  /* Und die zweite: der Streifen bleibt grob, aber die Weltseite
   * BLAETTERT NICHT MEHR. Sie sieht danach vollstaendig aus - sechs
   * Reiter, ein Raster, jede Zelle zu treffen - und hinter keiner Zelle
   * steht etwas. Genau die Sorte, die ein Blick nicht meldet: es fehlt
   * nichts, es passiert nur nichts.
   *
   * Angeschlagen wird an der Rechentafel: sie liegt seit B12 eine Stufe
   * tiefer, und wer nicht hineinkommt, sieht keine. */
  { n:'die Weltseite blaettert nicht in ihre Ebene', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    /* DER EINGRIFF MUSS „ES PASSIERT NICHTS" HEISSEN, nicht „es passiert
       etwas anderes". Der erste Anlauf setzte `hidden` auf einen Ausdruck,
       der immer falsch ist - dann standen ALLE Abschnitte gleichzeitig
       da, und der Rauchtest wurde rot, aber wegen des Ueberlaufs. Ein
       Eingriff, der einen anderen Fehler baut als den gemeinten, prueft
       auch etwas anderes. Jetzt ist die Zuweisung ein Nulleingriff: der
       Tipp geht ins Leere, die Uebersicht bleibt stehen. */
    such:"        const uebersicht = String(seite.dataset.seite || '').startsWith('welt:');\n"
      + "        seite.hidden = id === null ? !uebersicht : seite.dataset.seite !== id;",
    ersatz:"        seite.hidden = seite.hidden;",
    an:{ ...DIST, text:'seite.hidden = seite.hidden;' },
    sagt:'dahinter steht nichts' },

  /* --- B14: die Weltuebersicht fuellt und weist den Weg -------------
   *
   * Zwei Proben. Die erste faellt auf `auto-fill` zurueck - der Zustand
   * vor B14, in dem zwei Ebenen als zwei Briefmarken links oben in
   * einer Spalte standen, die fuenf Zellen breit ist, und der Umriss
   * von „Kontinente" ein blauer Fleck war.
   *
   * Ohne die eigene Zusage waere das still: die Seite nutzte damit 28 %
   * ihrer Hoehe, und die Halbleer-Ratsche steht bei 24. Genau die Art
   * Rueckfall, die wie ein bestandenes Tor aussieht. */
  { n:'das Weltraster laesst wieder leere Spalten stehen', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:V,
    such:".rollen.buch .raumgitter{grid-template-columns:repeat(auto-fit,minmax(88px,1fr))}",
    ersatz:".rollen.buch .raumgitter{grid-template-columns:repeat(auto-fill,minmax(88px,1fr))}",
    an:{ ...DIST, text:'.rollen.buch .raumgitter{grid-template-columns:repeat(auto-fill' },
    sagt:'legt leere Spalten an' },

  /* Und die zweite: der Wegweiser faellt aus. Dann steht auf der
   * Uebersicht nur noch der Weltname - und den traegt der Reiter
   * darueber schon. Die Seite funktioniert weiter und sagt nichts mehr. */
  { n:'die Weltuebersicht sagt nicht mehr, wo es weitergeht', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    /* DER EINGRIFF MUSS DEN SATZ WEGNEHMEN, nicht seinen Zweig
       umlegen. Der erste Anlauf setzte die Bedingung auf `false` - dann
       lief der ANDERE Zweig („Diese Welt hast du ganz."), und ein
       Fusssatz stand weiter da. Das Tor blieb zu Recht gruen, und die
       Probe hat es gemeldet. Jetzt faellt der ganze Ausdruck weg. */
    such:"        fuss: weiter\n"
      + "          ? `<p class=\"buchsatz\" data-lesen=\"Als Nächstes hier: ${weiter.titel}. Noch ${\n"
      + "               weiter.offen.length}.\">Als Nächstes hier: ${weiter.titel}. Noch ${\n"
      + "               weiter.offen.length}.</p>`\n"
      + "          : `<p class=\"buchsatz\" data-lesen=\"Diese Welt hast du ganz.\"\n"
      + "             >Diese Welt hast du ganz.</p>`,",
    ersatz:"        fuss: '' /* ohne Wegweiser */,",
    an:{ ...DIST, text:'/* ohne Wegweiser */' },
    sagt:'wo es in dieser Welt weitergeht' },

  /* --- B13: der Abzeichenname bricht nicht mitten im Wort ------------
   *
   * Zurueck auf 112 Punkte Spaltenbreite. Auf dem hochkant gehaltenen
   * Telefon stehen die Zellen dann 114 breit, davon 90 innen - und drei
   * der moeglichen Namen brauchen mehr („Bundeslaender" 94,3,
   * „Siebenerreihe" 94,1, „Stadtstaaten" 90,3). Weil `.abz .was` auf
   * `overflow-wrap:anywhere` steht, brechen sie mitten im Wort.
   *
   * Der Eingriff ist die Zahl selbst, nicht ein kaputter Wert: 112 stand
   * dort bis v430 und hat funktioniert, solange niemand hochkant
   * hingesehen hat. */
  { n:'der Abzeichenname bricht wieder mitten im Wort', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:V,
    such:".abzeichen{display:grid;grid-template-columns:repeat(auto-fill,minmax(119px,1fr));",
    ersatz:".abzeichen{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));",
    an:{ ...DIST, text:'.abzeichen{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px' },
    sagt:'brechen dann mitten im Wort' },

  /* --- B12b: der Streifen bricht um, statt einen Reiter auszusperren -
   *
   * Sechs Reiter zu je 66 Punkten (dem Boden aus `min-width`) sind 396
   * auf einem 390 Punkte breiten Schirm. Ohne `flex-wrap:wrap` steht
   * einer draussen; `overflow-x` faengt ihn zwar auf, aber ein Reiter,
   * der aus dem Streifen gerollt ist, ist fuer ein Kind, das nicht
   * liest, so gut wie nicht da.
   *
   * DIESE PROBE HAT EINE ANDERE ABGELOEST. Bis v429 stand hier der
   * Rueckfall auf `nowrap` samt Auslassungszeichen am NAMEN - er hat
   * bewiesen, dass ein zu langer Name nicht auf den Nachbarreiter ragt.
   * Seit der Streifen umbricht, sind die Reiter auf 390 zwischen 104 und
   * 132 Punkte breit, und der laengste Name braucht 85: der Eingriff
   * aendert dort nichts mehr, den er zu zeigen haette. Eine Gegenprobe,
   * die nicht mehr anschlagen KANN, ist keine - und die Zusage, die sie
   * hielt, haelt jetzt diese hier, eine Stufe frueher. (Der Umbruch am
   * Namen bleibt trotzdem stehen: er kostet nichts und faengt den Fall,
   * den ein langer Weltname wieder herstellen wuerde.) */
  { n:'der Kapitelstreifen sperrt auf dem schmalen Schirm einen Reiter aus', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:V,
    such:".buchreiter{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:var(--r2);",
    ersatz:".buchreiter{flex:0 0 auto;display:flex;flex-wrap:nowrap;gap:var(--r2);",
    an:{ ...DIST, text:'.buchreiter{flex:0 0 auto;display:flex;flex-wrap:nowrap' },
    sagt:'ausserhalb des Streifens' },

  /* --- B4b: die Abzeichenseite deckt ihren Reiter --------------------
   *
   * Vier Proben. Die ersten beiden gehoeren zur Abzeichenseite, die
   * beiden danach zur Rechentafel - den zwei Seiten, die vor B4b 25 %
   * und 29 % ihrer Hoehe nutzten.
   *
   * 1. Der Rueckfall auf `slice(0, 3)`. Das ist nicht irgendein Fehler,
   *    sondern GENAU der Zustand vor der Runde: der Reiter versprach
   *    „3/9", die Seite zeigte sechs Zellen, und die damalige Zusage
   *    („hoechstens drei offene") bestaetigte das noch. Eine feste Zahl
   *    kann diesen Bruch nicht melden - sie ist er. */
  { n:'die Abzeichenseite zeigt wieder nur drei offene Abzeichen', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:"    ? marken.filter(a => !a.verdient).sort((a,b)=>a.fehlt-b.fehlt) : [];",
    ersatz:"    ? marken.filter(a => !a.verdient).sort((a,b)=>a.fehlt-b.fehlt).slice(0, 3) : [];",
    an:{ ...DIST, text:'a.fehlt-b.fehlt).slice(0, 3)' },
    sagt:'der Reiter verspricht' },

  /* 2. Der Fusssatz faellt aus. Neun bernsteinfarbene Zellen mit je
   *    einer Zahl stehen dann da, und WELCHE als naechste faellt, steht
   *    nur noch in einer Sortierung - die sieht niemand. */
  { n:'die Abzeichenseite sagt nicht mehr, welches als nächstes fällt', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:"        const satz = `Noch ${a.fehlt===1?'eins':a.fehlt}, dann heißt es: ${a.titel}`;",
    ersatz:"        const satz = '';",
    an:{ ...DIST, text:"const satz = ''" },
    sagt:'dann heißt es' },

  /* 3. Die Rechentafel rechnet an ihrem Reiter vorbei. Sie ist die
   *    einzige Stelle im Buch, an der eine Zahl aus einer EIGENEN
   *    Rechnung kommt - und ein falsches Muster sieht aus wie ein
   *    richtiges.
   *
   *    DER ERSTE HEBEL WAR EIN NULLEINGRIFF: er zaehlte statt der
   *    gesammelten die SICHEREN, und im gestellten Stand sind das
   *    dieselben vier (Fach 5). Die Datei war geaendert, das Bild nicht -
   *    die teuerste Verfallsart, weil sie wie ein schwaches Tor aussieht.
   *    Jetzt der Nenner: er nimmt den ganzen Vorrat statt den der
   *    Rechenart, und weil „Plus und Minus" IMMER zwei Arten hat, zaehlt
   *    die Tafel danach 200 statt 100. Ein Vertippen, das jedem
   *    passieren kann - und eines, das nicht am Stand haengt. */
  { n:'die Rechentafel zählt an ihrem Reiter vorbei', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'              data-da="${da}" data-gesamt="${teil.length}"',
    ersatz:'              data-da="${da}" data-gesamt="${alle.length}"',
    an:{ ...DIST, text:'data-gesamt="${alle.length}"' },
    sagt:'dasselbe zweimal gerechnet' },

  /* 4. Und die Blindprobe: faellt die Tafel ganz aus, faellt die Seite
   *    auf die Aufkleberwand zurueck - gemessen 29 % statt 95 %. Die
   *    Halbleer-Ratsche steht bei 24 % und schlaegt dabei NICHT an; ohne
   *    die eigene Zusage waere der Ausfall also still (Regel 1: eine
   *    Prüfung, die nie etwas meldet, ist kein Beweis). */
  { n:'die Rechentafel fällt aus und niemand merkt es', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:"    const alle = [...g.da, ...g.offen];\n    if (!alle.length || !alle.every(x => RECHENZEICHEN[x.rechenart]",
    ersatz:"    const alle = [];\n    if (!alle.length || !alle.every(x => RECHENZEICHEN[x.rechenart]",
    an:{ ...DIST, text:'const alle = [];' },
    sagt:'keine einzige Rechentafel' },

  /* 5. Und dieselbe Blindstelle eine Ebene tiefer, im GESTELLTEN Stand
   *    der Tonleiter. So ist der Rechenkleber jahrelang neben der Leiter
   *    gestanden: nicht weil das Tor zu lasch war, sondern weil sein
   *    Stand die Seite gar nicht enthielt. */
  { n:'der Tonleiter fehlt die Ebene ohne Landkarte', tor:'tonleiter',
    bauen:true, datei:'tools/buch-oeffnen.mjs',
    such:"      'fiona:rechnen:plusminus': RECHENSTAND,",
    ersatz:"",
    an:{ datei:'tools/buch-oeffnen.mjs', fehlt:"'fiona:rechnen:plusminus': RECHENSTAND," },
    sagt:'keine Rechentafel unter den Kapiteln' },

  /* UND DIE MESSUNG SELBST (v423).
   *
   * Die drei Proben darueber drehen am INHALT und erwarten, dass die
   * Nutzungszahl faellt. Genau das ging zwei Fassungen lang nicht: die
   * Messung nahm `r.children`, und seit dem Buch-Umbau ist das einzige
   * Kind die Seite, die den Kasten immer fuellt. Alle sieben Seiten
   * meldeten `95 %` - dieselbe Zahl, egal was darin stand.
   *
   * Diese Probe stellt genau das wieder her. Sie ist die einzige, die
   * merkt, wenn die Messung aufhoert zu messen: die drei anderen wuerden
   * dann nur „bleibt gruen" melden, ohne zu sagen, warum. */
  { n:'die Nutzungsmessung misst wieder den Kasten statt den Inhalt',
    tor:'smoke', args:['--nur=ablage'], bauen:true, datei:'tor/smoke.mjs',
    /* Der Suchtext ist mit v424 mitgewandert: die Auswahl steht jetzt
       EINMAL als `inhalt` vor beiden Messungen statt zweimal in ihnen.
       `inhalt` hat es gemeldet - der Eingriff waere nicht angekommen,
       und der Wachhund haette still gruen gemeldet. Genau davor warnt
       er selbst. */
    such:"          const inhalt = [...r.querySelectorAll('*')]\n"
      + "            .filter(e => !huellen.has(e))",
    ersatz:"          const inhalt = [...r.children]\n"
      + "            .filter(e => true)",
    an:{ datei:'tor/smoke.mjs', text:'const inhalt = [...r.children]' },
    sagt:'melden denselben Wert' },

  /* --- G14: der Lohn gehoert den Kindern ------------------------------
   *
   * Zwei Proben, eine je Richtung. Eine allein bewiese die Haelfte: wer
   * nur „bei sachlich keine Feier" prueft, bleibt gruen, wenn die Feier
   * ueberhaupt niemandem mehr erscheint. */
  { n:'der Lohn feiert auch bei den Eltern', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:'prototyp/spiel.js',
    such:"    feier: false,",
    ersatz:"    feier: true,",
    an:{ ...DIST, fehlt:'feier: false' },
    sagt:'Das Profil steht im Backlog auf „sachlich"' },

  { n:'der Lohn bleibt auch bei den Kindern stumm', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:'prototyp/spiel.js',
    such:"    feier: true,",
    ersatz:"    feier: false,",
    an:{ ...DIST, fehlt:'feier: true' },
    sagt:'wieder stumm' },

  /* --- QS8: ein Kontinent hat EINE Farbe ------------------------------
   *
   * Der Eingriff gibt der Kachel wieder einen eigenen Ton statt des
   * Kartentons - genau der Zustand von vor v358, in dem sieben von sieben
   * Kontinenten auf der Kachel anders aussahen als auf der Karte. */
  { n:'die Kachel eines Kontinents hat wieder eine eigene Farbe', tor:'inhalt',
    deckt:'farben',
    datei:'prototyp/spiel.js',
    /* Der Ersatz LAESST DEN ANKER STEHEN, in einem Kommentar dahinter.
     *
     * Ohne das meldet `inhalt` nicht den Farbbruch, sondern den fehlenden
     * Anker dieser Probe — es prueft alle Anker am eingegriffenen Baum,
     * und der Eingriff loescht seinen eigenen. Der Lauf wird rot, aber aus
     * dem falschen Grund, und die Probe beweist nichts (Regel 1). Gilt
     * fuer jede Probe, die eine Datei aendert, an der `inhalt` selbst
     * haengt. */
    /* Der Suchtext ist mit I22 gewandert: die Laenderebenen heissen jetzt
       `titel:'Länder'` und tragen den Ort in `ueber`. Der Eingriff bleibt
       derselbe - die Kachel bekommt einen Ton, der nicht der Kartenton
       ist. */
    such:"    titel:'Länder', farbe: KONT_FARBE[k], gruppe:'laender', wo: KONT_TITEL[k] || k })),",
    ersatz:"    titel:'Länder', farbe: [3,2,4,7,6][0], gruppe:'laender', wo: KONT_TITEL[k] || k })),"
      + " /* titel:'Länder', farbe: KONT_FARBE[k], gruppe:'laender', wo: KONT_TITEL[k] || k })), */",
    an:{ datei:'prototyp/spiel.js', text:'farbe: [3,2,4,7,6][0]' },
    sagt:'nimmt wieder einen eigenen Ton' },

  /* --- QS1: die Ueberschrift von `passt` sagt, was gemessen wurde -----
   *
   * Gefunden bei der Probe, ob eine vierte Weltkachel passt: 38 Befunde,
   * NULL davon ein Ueberlauf - und trotzdem stand darueber „Elemente
   * laufen ueber den Rand". Wer das liest, sucht das Falsche.
   *
   * Der Eingriff nimmt die Unterscheidung heraus, sodass jeder Befund
   * wieder als Ueberlauf gilt. Damit ueberhaupt ein Befund entsteht, wird
   * gleichzeitig eine Ratsche verstellt: `passt` bleibt gruen, solange
   * nichts abweicht, und ein stilles Tor beweist nichts (Regel 1). Beides
   * in EINEM Ersatz, damit die Voraussetzung nicht geborgt ist - der
   * Fehler aus Q49. */
  { n:'die Fehlerüberschrift nennt jeden Befund einen Überlauf', tor:'passt',
    bauen:true, args:['--teil=1/5'], datei:'tor/passt.mjs',
    such:'const istRatsche = (f) => / steht auf .* statt /.test(f);',
    ersatz:"const istRatsche = (f) => false;\nfehler.push('Die Kachel — Bild pt steht auf 1 statt 2');",
    an:{ datei:'tor/passt.mjs', fehlt:'/ steht auf .* statt /.test(f)' },
    sagt:'läuft über den Rand oder ist verdeckt' },

  /* --- B3: die umgekehrte Frage --------------------------------------
   *
   * Drei Proben: die Form selbst, die Markierung, die Wertung.
   */

  // 1. Es gibt sie nicht mehr - jede Aufgabe fragt wieder nach dem Namen.
  { n:'die umgekehrte Frage kommt nicht mehr vor', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"    || (kannLesen && !istHaupt && !istNachbar && !istGroesser\n"
      + "        && st.i % 3 === 2 && tippbar(ziel.id));",
    /* NUR der zweite Summand faellt weg, nicht die ganze Zeile: seit F4
       steht darueber `const umgekehrt = aufKarte`, und ein Ersatz, der
       die Deklaration mitbringt, erzeugte eine zweite davon - die App
       liesse sich gar nicht mehr bauen. Das Tor waere rot, aber aus dem
       falschen Grund: der Eingriff soll ANKOMMEN, nicht den Bau
       verhindern (Regel 10). */
    ersatz:'    || false;',
    an:{ ...DIST, text:'|| false;' },
    sagt:'kommt gar nicht vor' },

  // 2. Das gesuchte Gebiet ist wieder angemalt - dann beantwortet sich
  //    „Wo liegt Berlin?" selbst.
  { n:'die umgekehrte Frage verrät ihre Antwort', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"      zielIds.includes(g.id) && !umgekehrt ? 'ziel'",
    ersatz:"      zielIds.includes(g.id) ? 'ziel'",
    an:{ ...DIST, fehlt:"zielIds.includes(g.id) && !umgekehrt ? 'ziel'" },
    sagt:'beantwortet sich selbst' },

  // 3. Der Tipp auf das richtige Gebiet wird nicht mehr gewertet.
  { n:'der Tipp auf die Karte wird nicht mehr gewertet', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"      if (istGroesser ? ctx.getroffen===ziel.gross\n"
      + "        : istNachbar ? (ziel.grenzt || []).includes(ctx.getroffen)\n"
      + "                     : ctx.getroffen===ziel.id) ergebnis='richtig';\n"
      + "      else text = istGroesser ? groesserHinweis(ctx) : zugHinweis('', ctx);",
    ersatz:"      text = zugHinweis('', ctx);",
    an:{ ...DIST, fehlt:"ctx.getroffen===ziel.id) ergebnis='richtig';" },
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
    such:'  const zeigerFuer = (f) => f.anker && !st.test',
    ersatz:'  const zeigerFuer = (f) => f.anker',
    an:{ ...DIST, fehlt:'f.anker && !st.test' },
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
    such:'.kachel.wer>*:not(.silhouette,.streu,.tagesziel){position:relative}',
    ersatz:'.kachel.wer>*:not(.silhouette,.tagesziel){position:relative}',
    an:{ ...DIST, fehlt:':not(.silhouette,.streu,.tagesziel){position:relative}' },
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

  /* --- Q44: die Kapitel im Forscherbuch ------------------------------
   *
   * Drei Zusagen haengen daran, und jede bekommt ihre eigene Probe. Alle
   * drei sind Faelle, in denen das Buch WEITER FUNKTIONIERT und trotzdem
   * kaputt ist - genau die Sorte, die ein Tor braucht, weil ein Blick sie
   * nicht meldet.
   */

  /* 1. Ohne den Streifen faellt das Buch auf das Rollen zurueck. Der
   *    Eingriff hebt die Grenze so weit an, dass es ihn nie gibt; alle
   *    Kapitel stehen dann wieder untereinander, und die hinteren fangen
   *    unter der Unterkante an. */
  { n:'das Buch rollt wieder statt zu blaettern', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'  const OHNE_REITER = 2;',
    ersatz:'  const OHNE_REITER = 99;',
    an:{ ...DIST, text:'OHNE_REITER = 99' },
    sagt:'Kapitelreiter' },

  /* 2. Der Streifen steht, aber ein Reiter fuehrt ins Leere: der Klick
   *    tauscht die Seite nicht mehr aus. Das Buch sieht dann vollstaendig
   *    aus - sechs Reiter, eine Seite - und zeigt doch immer dieselbe.
   *    Der Eingriff laesst die Marke wandern und den Inhalt stehen. */
  { n:'ein Kapitelreiter blaettert nicht', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'    seitenKasten.innerHTML = seiten(buchKapitel);',
    ersatz:'    seitenKasten.innerHTML = seitenKasten.innerHTML;',
    an:{ ...DIST, text:'seitenKasten.innerHTML = seitenKasten.innerHTML' },
    /* „dieselbe Seite" und nicht „Kapitelseiten": der Rauchtest hat ZWEI
       Meldungen ueber Kapitelseiten, und die erste (zu hoch fuers Bild)
       trifft hier nicht zu. Beim ersten Anlauf stand die falsche hier -
       `proben` meldete „wird rot, aber nicht mit diesem Wort", und genau
       dafuer gibt es das Wort. */
    sagt:'dieselbe Seite' },

  /* 3. Und die Breite: mit fester Breite statt geteilter passt der letzte
   *    Reiter nicht mehr in den Streifen (gemessen 78 % bei sieben
   *    Kapiteln auf 844 Punkten). Er ist dann noch da und noch zu
   *    treffen - aber ein Kind, das nicht liest, sieht ihn nicht. */
  /* HIER STAND EINE PROBE AUF `.reiter{flex:1 1 auto}` - und B12b hat
     ihr die Falle weggenommen.
     
     Sie machte die Reiter schmal und erwartete, dass der letzte halb aus
     dem Streifen faellt. Das ging, solange der Streifen NICHT umbrach:
     sieben Reiter mit fester Breite waren 78 % des letzten. Seit B12b
     traegt `.buchreiter` ein `flex-wrap:wrap` - schmale Reiter brechen
     jetzt um und stehen alle ganz im Streifen. Nachgemessen: der Lauf
     meldet „alle 6 im Streifen".
     
     Die Zusage („kein Reiter faellt aus dem Streifen") ist damit nicht
     ungedeckt: sie haengt an genau diesem `flex-wrap`, und die Probe
     darauf steht oben („der Kapitelstreifen sperrt auf dem schmalen
     Schirm einen Reiter aus"). Zwei Proben auf dieselbe Zusage, von
     denen eine nie etwas meldet, sind eine zuviel (Regel 1). */

  /* Die zweite Haelfte von B4b: die ABZEICHENSEITE.
     
     Hier stand eine Probe „im Buch stehen wieder alle offenen
     Abzeichen" - und die ist nicht kaputtgegangen, sondern von B4b
     ueberholt worden: seither stehen dort ABSICHTLICH alle offenen
     Abzeichen, weil die Seite sonst zu 25 % ihrer Hoehe genutzt war.
     Der Eingriff setzte genau das ein, was die App ohnehin tut - eine
     Probe, die nichts aendert, bezeugt nichts (Regel 10: jede Probe
     prueft zuerst, ob ihr Eingriff angekommen ist).
     
     Umgedreht ist sie wieder eine: NIMMT man die offenen weg, faellt die
     Seite unter die Ratsche, und der Referenzabgleich verliert seine
     Forderung („sichtbar, BEVOR man es hat"). Gemessen wird das an
     derselben Zahl wie bei der Rechenseite. */
  { n:'die Abzeichenseite zeigt wieder nur die verdienten', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:"        naechste.map(markeBild).join('')}</div>`",
    ersatz:"        ''}</div>`",
    an:{ ...DIST, fehlt:'naechste.map(markeBild)' },
    /* Nicht die Fuellung, sondern das FEHLENDE. Nachgemessen faellt die
       Abzeichenseite ohne die offenen von 53 auf 35 % - die Ratsche
       steht bei 34, also bleibt sie knapp darueber. Die Zahl misst
       richtig (18 Punkte Ausschlag), sie ist nur nicht die schaerfste
       Zusage an dieser Stelle.
       Die schaerfste ist die daneben: „kein einziges offenes Abzeichen -
       dann ist der naechste Schritt unsichtbar". Sie sagt genau das, was
       der Referenzabgleich fordert (sichtbar, BEVOR man es hat), und sie
       haengt an keiner Prozentzahl. */
    sagt:'kein einziges offenes Abzeichen' },

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

  /* DIE ERREICHBARKEIT, UMGEDREHT (I2).
   *
   * Hier stand bis zum Inhalt-Audit die Gegenrichtung: „ein unerreichbares
   * Abzeichen wird angeboten". Die Regel hatte genau einen Fall - Fiona
   * spielte Europa bis Rang 3, Deutschlands Nachbarn stehen auf 4 bis 12 -
   * und die Leiter hat ihn abgeschafft: jede Tiefe waechst jetzt mit dem
   * Koennen, also ist jedes Land fuer jedes Profil erreichbar.
   *
   * Eine Probe, die einen Fall prueft, den es nicht mehr gibt, ist keine.
   * Geprueft wird deshalb die NEUE Zusage, und der Eingriff ist die alte
   * Fassung: haengt `erreichbar` wieder an einer festen Tiefe, verliert
   * Fiona ein Abzeichen, das sie sich erspielen kann. */
  { n:'die Erreichbarkeit haengt wieder an einer festen Tiefe', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D,
    such:'function erreichbar(ebeneId){\n  return null;\n}',
    ersatz:`function erreichbar(ebeneId){
  const [art, kont] = ebeneId.split(':');
  if ((art === 'laender' || art === 'hauptstaedte') && kont)
    return new Set(D.laender[kont].filter(l => l.rang <= P.laenderTiefe).map(l => l.a3));
  return null;
}`,
    an:{ ...DIST, text:'l.rang <= P.laenderTiefe).map(l => l.a3)' },
    sagt:'NICHT angeboten' },

  /* --- I2: die Leiter ------------------------------------------------ */

  /* Sie STEIGT. Ohne diese Zeile ist `leiterTiefe` die alte feste Zahl -
   * und weil sie dann genau das zurueckgibt, was vorher dastand, aendert
   * sich am Bildschirm nichts Sichtbares. Genau deshalb braucht es hier
   * eine Probe: der Befund U2 war ein Jahr lang unsichtbar. */
  { n:'die Leiter steigt nicht mehr', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'    tiefe += LEITER_STUFE;',
    ersatz:'    break;',
    an:{ ...DIST, fehlt:'tiefe += LEITER_STUFE' },
    sagt:'die Tiefe hängt wieder am Profil' },

  /* Und sie steigt NUR beim Koennen. Ohne `warGesessen` oeffnet sie sich
   * von selbst, und Fiona bekommt am ersten Tag siebzehn Laender - das
   * waere keine Leiter, sondern eine abgeschaffte Tiefe. */
  { n:'die Leiter oeffnet ohne Koennen', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'    if (!offen.every(x => Leitner.warGesessen(stand, kennung(x)))) break;',
    ersatz:'    if (false) break;',
    an:{ ...DIST, fehlt:'offen.every(x => Leitner.warGesessen' },
    /* Gemeldet wird der ERSTE Arm, nicht der dritte: oeffnet die Leiter
       ohne Koennen, dann steht Fiona schon am ersten Tag bei siebzehn -
       und das faellt frueher auf als die Luecke. */
    sagt:'die Leiter fängt nicht mehr unten an' },

  /* Die Ablenker kommen aus dem, was das Kind GERADE lernt. Ohne die
   * zwei von heute sind es wieder drei von morgen - und dann ist die
   * richtige Antwort die einzige bekannte Flagge unter vieren. Die
   * Aufgabe ist dann ohne den Namen zu loesen und meldet sich nie: die
   * Antworten sind ja richtig. */
  { n:'alle Ablenker kommen von jenseits der Leiter', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:D,
    such:'    const aus = [...heute.slice(0, 2), ...morgen.slice(0, 1)];',
    ersatz:'    const aus = [...morgen.slice(0, 3)];',
    an:{ ...DIST, text:'const aus = [...morgen.slice(0, 3)]' },
    sagt:'jenseits der Leiter' },

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
  /* --- Q48: das Tor `anker` ------------------------------------------
   *
   * Drei Regeln, drei Proben. Jede stellt genau die Verfallsart her, gegen
   * die die Regel steht - und in allen dreien laeuft das Spiel weiter, die
   * Kette bleibt gruen, und nur eine Gegenprobe hoert still auf zu
   * beweisen. Das ist die Sorte, fuer die es dieses Tor gibt.
   *
   * ZWEIMAL AUFGEFALLEN, dass eine Probe SICH SELBST trifft:
   *
   * Der Eingriff geht in die Probenliste - eine Gegenprobe, die andere
   * Gegenproben prueft, muss an einer kaputten gemessen werden. Damit
   * steht der gesuchte Text aber zweimal in der Datei: einmal am Ziel und
   * einmal in dieser Zeile hier. Der erste Anlauf stand VOR seinen Zielen
   * und hat deshalb sich selbst verstellt; das Ziel blieb heil, das Tor
   * blieb gruen, und die Probe meldete „beweist nichts" - richtig, aber
   * aus einem Grund, den man erst sieht, wenn man ihn sucht.
   *
   * Zwei Dinge zusammen loesen es, und keines davon ist die Reihenfolge.
   *
   * Der Suchausdruck enthaelt EINE Zeichenklasse (`Gr[ö]nland`,
   * `FUELLBA[L]LAST`): er trifft damit sein Ziel, aber nicht mehr sich
   * selbst - der Text in dieser Zeile lautet ja anders. Auf die
   * Reihenfolge zu bauen waere die schlechtere Loesung gewesen, und
   * `inhalt` hat sie zu Recht abgelehnt: „ihr Suchtext steht 2x in der
   * Datei - welche Stelle verstellt wird, entscheidet ihre Reihenfolge".
   *
   * Und der Ersatz wird GERECHNET (`ersatzFn`) statt hingeschrieben -
   * sonst staende der Text, an dem das Ankommen erkannt wird, schon vor
   * dem Eingriff in der Datei, und die Nachfrage waere selbst der Fall,
   * den dieses Tor verbietet.
   */

  /* 1. Der Text, der verschwinden soll, kommt auch von woanders. Das ist
   *    der Groenland-Fall: der Eingriff nimmt eine Stelle, die zweite
   *    bleibt stehen, und die Nachfrage trifft nie zu. */
  { n:'ein Anker verlangt ein Verschwinden, das nie eintritt', tor:'anker',
    bauen:true, datei:'tor/proben-liste.mjs',
    suchRegex:/fehlt:'"a3":"GRL","name":"Gr[ö]nland"'/,
    ersatzFn:(m)=>m[0].replace(/"a3":"GRL","name":"(Gr[ö]nland)"/, '$1'),
    an:{ datei:'tor/proben-liste.mjs', text:"fehlt:'Grönland'" },
    sagt:'VERSCHWINDET' },

  /* 2. Der Text steht nirgends. Dann ist „er ist verschwunden" schon vor
   *    dem Eingriff wahr - die Nachfrage traegt nichts bei, und die Probe
   *    meldet gruen, ohne etwas gesehen zu haben. */
  { n:'ein Anker verlangt ein Verschwinden von etwas, das es nicht gibt', tor:'anker',
    bauen:true, datei:'tor/proben-liste.mjs',
    suchRegex:/fehlt:'\(links \|\| mitte \|\| rechts\)'/,
    ersatzFn:(m)=>m[0].replace(/ \|\| /g, '||'),
    an:{ datei:'tor/proben-liste.mjs', text:"fehlt:'(links||mitte||rechts)'" },
    sagt:'schon jetzt nicht' },

  /* 3. Der Text, an dem man den Eingriff erkennen soll, steht schon da.
   *    „Angekommen" ist dann wahr, bevor irgendetwas passiert ist - der
   *    `const FUELL`-Fall, wo ein Praefix eines vorhandenen Namens
   *    gewaehlt war. */
  { n:'ein Anker sucht etwas, das ohne Eingriff schon dasteht', tor:'anker',
    bauen:true, datei:'tor/proben-liste.mjs',
    suchRegex:/text:'const FUELLBA[L]LAST'/,
    ersatzFn:(m)=>m[0].replace('BALLAST', ''),
    an:{ datei:'tor/proben-liste.mjs', text:"text:'const FUELL'" },
    sagt:'schon OHNE den Eingriff' },

  /* QS9 — `tor/abweichungen/` behauptet eine Aenderung, die es nicht gibt.
   *
   * Der Befund: das Verzeichnis wurde nie geleert. Ich habe darin 32 Bilder
   * gezaehlt und geschlossen, meine Aenderung habe 32 Bildschirme bewegt;
   * gemessen waren es drei, die uebrigen 29 lagen seit frueheren Laeufen
   * da. `ansicht` raeumt jetzt vor jedem Vergleich die Bilder DER Aufnahme,
   * die es gerade misst - je Teil nur die eigenen Namen, sonst raeumte der
   * zweite Teil die Funde des ersten weg.
   *
   * WARUM DIESE PROBE DAS RAEUMEN ANGREIFT und nicht einfach eine Datei
   * hinlegt: eine hingelegte Datei loescht dasselbe Raeumen im selben Lauf,
   * bevor die Pruefung sie sieht. Beim ersten Anlauf blieb der Lauf gruen,
   * und das sah aus wie eine bestandene Probe - die Probe haette den Fall
   * bezeugt, ohne ihn je geprueft zu haben. Sie dreht deshalb
   * `abwegLoeschen` UM: die Aufnahme hinterlaesst eine Datei, statt sie
   * wegzunehmen. Genau der Zustand, den QS9 beschreibt. */
  /* Auf dem Runner ausgelassen, und in Q50 nachgeprueft, ob das zu weit
     greift: sie vergleicht keine Bildpunkte, sondern das Aufraeumen -
     aber `ansicht` beendet sich unter SMARTKIDS_OHNE_ANSICHT sofort
     (tor/ansicht.mjs:58), also lange vor `abwegLoeschen` in Zeile 763.
     Eine Ausnahme fuer sie braechte nichts; es bleibt beim Grund der
     uebrigen, der Runner rastert anders (Regel 16). */
  { n:'eine gruene Aufnahme laesst ihr Abweichungsbild liegen', tor:'ansicht',
    args:['--nur=quer-buch'], bauen:true, datei:'tor/ansicht.mjs',
    such:'  abwegLoeschen(a.name);',
    ersatz:"  fs.writeFileSync(abwegDatei(a.name, '.png'), Buffer.alloc(8));",
    an:{ datei:'tor/ansicht.mjs', fehlt:'\n  abwegLoeschen(a.name);\n' },
    sagt:'NICHT rot gefunden' },

  /* G16 - die Werkzeugspalte wird wieder eine Schublade.
   *
   * Der Eingriff nimmt der Querformat-Regel ihre Richtung: aus der Spalte
   * wird die alte Reihe mit Umbruch. Dann stehen die fuenf Bedienelemente
   * wieder auf fuenf Mitten statt auf einer - gemessen 79, 202, 92, 189,
   * 247 auf dem Zielgeraet -, und die beiden leisen Auswege sind wieder
   * verschieden breit (133 und 122).
   *
   * Beide Haelften der Pruefung schlagen an, und das ist Absicht: die
   * Breite allein waere mit `align-self` auch in einer Reihe zu
   * erzwingen, die Achse nicht. Die Probe faengt den Fall, der beides
   * zerlegt. */
  { n:'die Werkzeugspalte wird wieder eine Reihe mit Umbruch', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:V,
    such:'  .werkzeug{flex-direction:column;flex-wrap:nowrap;',
    ersatz:'  .werkzeug{flex-direction:row;flex-wrap:wrap;',
    an:{ ...DIST, fehlt:'flex-direction:column;flex-wrap:nowrap' },
    sagt:'Schublade' },

  /* G17, erste Haelfte - die Antwort faellt zurueck nach Fast-Weiss.
   *
   * Der Eingriff setzt `--primaer` auf den alten Wert. Der Farbabstand
   * des Antwortknopfs zum Grund faellt von 0,131 auf 0,049, und damit
   * ist die Aufgabe wieder blasser als das Werkzeug daneben. */
  { n:'der Antwortknopf wird wieder fast weiss', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:'src/marken/marken.css',
    such:'  --primaer:       oklch(0.900 0.085 258);',
    ersatz:'  --primaer:       oklch(0.965 0.035 258);',
    an:{ ...DIST, fehlt:'oklch(0.900 0.085 258)' },
    sagt:'blasser als ihr Werkzeug' },

  /* G17, zweite Haelfte - die Ablehnung wird zur Hervorhebung.
   *
   * Das ist der Fehler, der beim Bauen fast passiert waere: `--primaer`
   * steigt auf 0,900, `--warn-h` bleibt auf 0,96 - und dann ist das
   * ABGELEHNTE Etikett das hellste auf dem Bildschirm. Zwei Marken, die
   * nur zusammen stimmen; ohne diese Probe faellt das erst am Geraet auf,
   * und dort auch nur jemandem, der falsch antwortet. */
  { n:'das abgelehnte Etikett wird heller als ein ruhendes', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:'src/marken/marken.css',
    such:'  --abgelehnt: oklch(0.90  0.095  40);',
    ersatz:'  --abgelehnt: oklch(0.96  0.040  40);',
    an:{ ...DIST, fehlt:'--abgelehnt: oklch(0.90  0.095  40)' },
    sagt:'wie eine Hervorhebung' },

  /* Der Rueckfall von `--betroffen` faellt in die falsche Richtung.
   *
   * `npm run tor -- --betroffen` faehrt nur die Browsertore, die von den
   * geaenderten Dateien erreicht werden koennen. Das haengt an genau
   * einer Zeile: eine Datei, die keiner Regel entspricht, muss ALLE Tore
   * ziehen. Der Eingriff laesst sie stattdessen KEINES ziehen - dann
   * waere jede neue Datei ungeprueft, und der Lauf meldete gruen.
   *
   * Das ist die gefaehrlichste Bauart Fehler in diesem Werkzeug: er macht
   * nichts rot, er macht nur weniger. Eine Runde spaeter faellt niemandem
   * mehr auf, dass ein Tor nicht mehr laeuft. */
  { n:'eine unbekannte Datei zieht keine Tore mehr nach sich', tor:'inhalt',
    datei:'tor/kette-liste.mjs',
    /* Der Suchtext ueberlebt im Ersatz - als Kommentar hinter dem Eingriff.
     *
     * Ohne das ist es der Selbsttreffer: `inhalt` prueft auch, dass jede
     * Gegenprobe ihren Suchtext noch findet, und dieser Eingriff loescht
     * genau seinen eigenen. Das Tor meldete dann den fehlenden Anker
     * statt des Befundes - rot aus dem falschen Grund, und die Probe
     * haette „beweist nichts" gesagt. Genau so passiert, beim ersten
     * Anlauf. `an:` prueft deshalb nicht den Text, sondern die WIRKUNG:
     * `return null` darf nicht mehr die erste Anweisung sein. */
    such:'if (!treffer) return null;',
    ersatz:'if (!treffer) continue; // Eingriff der Gegenprobe. '
      + 'Anker bleibt stehen: if (!treffer) return null;',
    an:{ datei:'tor/kette-liste.mjs', text:'if (!treffer) continue;' },
    deckt:'betroffen',
    sagt:'faellt NICHT auf alle Tore zurueck' },

  /* G18 - die ruhenden Knoepfe sehen wieder wach aus.
   *
   * Angegriffen wird die SUBTILE Haelfte, nicht die offensichtliche. Ohne
   * `animation:none` bleibt die Deckkraft auf 1: die Etiketten laufen mit
   * `animation: herein ... both` ein, und ein Animationswert schlaegt in
   * der Kaskade eine gewoehnliche Deklaration. Genau das ist mir beim
   * Bauen passiert - der Griff war weg, das Aussehen nicht, und ohne
   * Messung haette ich es fuer erledigt gehalten.
   *
   * Die grobe Haelfte (`pointer-events` weg) faengt dieselbe Pruefung; wer
   * sie streicht, macht die Knoepfe wieder greifbar und faellt an
   * „Griff auto" durch. */
  { n:'die ruhenden Antwortknoepfe behalten ihre volle Deckkraft', tor:'smoke',
    args:['--nur=ablage'], bauen:true, datei:V,
    such:'  animation:none}',
    ersatz:'  }',
    /* Der Anker nennt die Zeile MIT ihrem Vorgaenger: `animation:none}`
       allein steht sechsmal im Buendel, und ein Anker, der auch woanders
       zutrifft, faengt das Verschwinden nicht. */
    an:{ ...DIST, fehlt:'das Aussehen nicht. */\n  animation:none}' },
    sagt:'weiter antippbar aus' },

  /* E1 - der Wortschatz weicht von der amtlichen Liste ab.
   *
   * Der Eingriff schreibt `colour` amerikanisch. Das ist mit Absicht die
   * LEISESTE Abweichung, die es gibt: kein fehlendes Wort, keine falsche
   * Anzahl, nur ein Buchstabe weniger - und genau die Sorte, die man beim
   * Abschreiben macht und beim Nachlesen uebersieht. Faengt das Tor sie,
   * faengt es auch ein erfundenes Wort.
   *
   * Geprueft wird gegen `docs/referenz/ISB-Englisch-Wortschatz-34.txt`,
   * den Text der amtlichen PDF - also gegen die Quelle und nicht gegen
   * sich selbst. Bei `farben` war genau das der Fehler des ersten Anlaufs
   * (Regel 14: das Modell darf nicht vom Gemessenen abhaengen), und bei
   * Vokabeln waere er teurer: eine erfundene Zeile faellt erst auf, wenn
   * Lea in der Schule etwas anderes lernt. */
  { n:'ein englisches Wort weicht von der amtlichen Liste ab', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    /* Der Suchtext ueberlebt im Ersatz, als Kommentar dahinter - sonst ist
       es der Selbsttreffer: `inhalt` prueft auch, dass jede Gegenprobe
       ihren Suchtext noch findet, und dieser Eingriff loescht genau
       seinen eigenen. Das Tor meldete dann den fehlenden Anker statt des
       Befundes. Heute der dritte Fall dieser Art. */
    /* Der Anker nennt das Wort DAVOR mit: seit E4 steht `'colour',` ein
       zweites Mal in derselben Datei, naemlich als Bildeintrag. Ein Anker,
       der zweimal zutrifft, verstellt die Stelle, die gerade zuerst kommt -
       und das ist dann eine andere Probe als die aufgeschriebene. */
    such:"'cold', 'colour',",
    ersatz:"'cold', 'color', // Eingriff der Gegenprobe. Anker: 'cold', 'colour',",
    an:{ datei:'src/inhalt/englisch.js', text:"'color'," },
    deckt:'englisch',
    sagt:'nicht in der amtlichen Liste' },

  /* E1b - ein Redemittel wird glattgezogen.
   *
   * Der Eingriff haengt „Happy Easter!" an. Das ist die Sorte Aenderung,
   * die man aus Hilfsbereitschaft macht: die amtlichen Redemittel sehen
   * unfertig aus, weil sie voller „…" stehen und weil zu Weihnachten und
   * Geburtstag ja noch Ostern fehlt. Sie sind nicht unfertig - die Luecke
   * IST der Inhalt, und was der Lehrplan nicht verlangt, gehoert nicht
   * dazu.
   *
   * Geprueft wird gegen `docs/referenz/ISB-Englisch-Redemittel-34.txt`,
   * Satz fuer Satz. */
  { n:'ein Redemittel wird um einen eigenen Satz ergaenzt', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    such:"'Happy birthday! Merry Christmas!',",
    ersatz:"'Happy birthday! Merry Christmas! Happy Easter!', "
      + "// Anker: 'Happy birthday! Merry Christmas!',",
    an:{ datei:'src/inhalt/englisch.js', text:'Happy Easter!' },
    deckt:'englisch',
    sagt:'steht nicht in der Quelle' },

  /* ---- E3: die vierte Welt und „Hoeren und zeigen" -------------------
   *
   * Sieben Proben, und sie teilen sich sauber in zwei Haelften: drei am
   * VORRAT (Tor `inhalt`, Untertor `englisch`) und vier am BILDSCHIRM
   * (Tor `smoke`, Abschnitt `englisch`). Die zweite Haelfte ist die
   * teurere und die noetigere: was diese Ebene zusagt, ist eine Zusage an
   * ein Kind, das nicht liest, und die sieht man einem Bildschirmfoto
   * nicht an - vier Farbflecken ohne Frage sehen aus wie eine Aufgabe. */

  /* Der Vorrat greift an der amtlichen Liste vorbei.
   *
   * `gray` statt `grey` - die amerikanische Schreibung, und damit dieselbe
   * leise Sorte wie bei E1: kein fehlendes Wort, ein Buchstabe. Der
   * Lehrplan sagt britisches Englisch, und Lea schreibt in der Schule
   * `grey`. */
  { n:'eine Farbe der Englischebene steht nicht im amtlichen Wortschatz', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    such:"{ wort: 'grey',   farbton: '#9aa2ab' },",
    ersatz:"{ wort: 'gray',   farbton: '#9aa2ab' }, // Anker: { wort: 'grey',   farbton: '#9aa2ab' },",
    an:{ datei:'src/inhalt/englisch.js', text:"wort: 'gray'" },
    deckt:'englisch',
    sagt:'nicht im amtlichen Wortschatz' },

  /* Zwei Farben liegen zu nah beieinander.
   *
   * Der Eingriff zieht `red` an `orange` heran. Das ist die Sorte
   * Aenderung, die aus Geschmack passiert („das Rot ist mir zu grell") -
   * und sie macht die Aufgabe unloesbar, ohne dass irgendwo etwas fehlt.
   * Kein anderes Tor koennte das sehen: die Datei ist gueltig, das Wort
   * steht in der Liste, das Bild ist da. */
  { n:'zwei Farben der Englischebene sind nicht auseinanderzuhalten', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    such:"{ wort: 'red',    farbton: '#e03131' },",
    ersatz:"{ wort: 'red',    farbton: '#f2760c' }, // Anker: { wort: 'red',    farbton: '#e03131' },",
    an:{ datei:'src/inhalt/englisch.js', text:"farbton: '#f2760c'" },
    deckt:'englisch',
    sagt:'CIELAB auseinander' },

  /* Die Ablenker kommen aus der falschen Menge.
   *
   * Ohne den Sortenfilter stehen neben einem Farbfleck drei Ziffern - und
   * dann ist die Aufgabe ohne ein Wort Englisch zu loesen. Sie SIEHT dabei
   * genauso aus wie eine richtige, und sie wird sogar oefter richtig
   * beantwortet. Das ist die gefaehrlichste Art, eine Lernaufgabe kaputt
   * zu machen: die Zahlen werden besser. */
  { n:'die Ablenker der Englischebene kommen aus der falschen Sorte', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    /* Seit E7 heisst der Topf `topf` und nicht mehr `vorratHoeren()`:
       „Lies das Wort" zieht aus den gezeichneten Bildern, alles andere aus
       dem Hoervorrat. Der EINGRIFF ist derselbe geblieben - er nimmt die
       Sortenschranke weg - und er kommt bei den Farben und Zahlen an, die
       sich einen Topf teilen. */
    such:"  const andere = topf.filter(x => x.sorte === ziel.sorte && x.id !== ziel.id);",
    /* Der Suchtext ueberlebt im Ersatz, als Kommentar darunter - und zwar
       WORTWOERTLICH. Der erste Anlauf hat nur ein Bruchstueck gerettet
       („x.sorte === ziel.sorte"), und `inhalt` meldete daraufhin den
       fehlenden Anker statt des Befundes: das ist der Selbsttreffer, und
       zwar der vierte in diesem Verzeichnis. Zwei Leerzeichen hinter dem
       „//" sind kein Zufall - sie machen den Suchtext samt seiner
       Einrueckung wieder auffindbar. */
    ersatz:"  const andere = topf.filter(x => x.id !== ziel.id);\n"
      + "  //Anker:  const andere = topf.filter(x => x.sorte === ziel.sorte && x.id !== ziel.id);",
    an:{ datei:'src/inhalt/englisch.js', text:'filter(x => x.id !== ziel.id);' },
    deckt:'englisch',
    sagt:'Ablenker anderer Sorte' },

  /* Das gesuchte Wort steht auf dem Bildschirm.
   *
   * Damit wird aus „Hoeren und zeigen" eine Leseaufgabe - und zwar eine,
   * die Lea muehelos loest und Fiona gar nicht. Der Eingriff ist die
   * bequeme Aenderung: das Wort HINZUSCHREIBEN sieht nach mehr Hilfe aus.
   * Es ist die Antwort. */
  { n:'das gesuchte englische Wort steht auf dem Bildschirm', tor:'smoke',
    args:['--nur=englisch'], bauen:true, datei:D,
    such:"    <div class=\"frage\" id=\"frage\">${stumm",
    ersatz:"    <div class=\"frage\" id=\"frage\">${true",
    an:{ ...DIST, text:'id="frage">${true' },
    sagt:'prüft die Aufgabe Lesen statt Hören' },

  /* Und die Gegenrichtung: OHNE englische Stimme faellt die Notschrift weg.
   *
   * Dann ist die Ebene stumm UND leer - vier Farbflecken ohne Frage. Fuer
   * ein Kind, das nicht liest, war sie das ohnehin; hier geht auch noch
   * der Weg fuer Lea verloren. Beide Proben zusammen halten die Zusage
   * fest: das Wort steht genau dann da, wenn es nicht zu hoeren ist. */
  { n:'ohne englische Stimme steht das Wort nirgends', tor:'smoke',
    args:['--nur=englisch'], bauen:true, datei:D,
    /* Seit E7 steht `liest ||` davor - „Lies das Wort" ist immer stumm,
       ganz gleich ob eine englische Stimme da ist. Der Eingriff bleibt
       derselbe: die Notschrift faellt weg, und die Ebene steht stumm und
       leer da. */
    such:'  const stumm = liest || !englischHoerbar();',
    ersatz:'  const stumm = false; // Anker: liest || !englischHoerbar()',
    an:{ ...DIST, text:'const stumm = false;' },
    sagt:'vier Bilder ohne Frage' },

  /* Die Farbflecken verblassen nach der Antwort.
   *
   * Der Eingriff nimmt die Englischkarte wieder in die G18-Regel auf -
   * also genau der Zustand, den diese Runde am Bild gefunden hat. Er ist
   * nicht boeswillig, sondern der naheliegende: „verbrauchte Knoepfe
   * verblassen" gilt ueberall sonst, und wer die Ausnahme nicht kennt,
   * raeumt sie beim naechsten Aufraeumen weg. Danach ist Gruen ein
   * Mintton und Grau von Weiss nicht mehr zu unterscheiden. */
  { n:'die verbrauchten Farbflecken verlieren ihre Farbe', tor:'smoke',
    args:['--nur=englisch'], bauen:true, datei:V,
    such:'[data-fertig] .etikett:not(.weg):not(.stimmt),\n[data-fertig] .zahl:not(.stimmt){',
    ersatz:'[data-fertig] .etikett:not(.weg):not(.stimmt),\n[data-fertig] .engkarte,\n'
      + '[data-fertig] .zahl:not(.stimmt){',
    an:{ ...DIST, text:'[data-fertig] .engkarte,' },
    sagt:'verblassen nach der Antwort' },

  /* Die Frage wird mit der deutschen Stimme gesagt.
   *
   * „blue" als „blü-e". Das ist der Fehler, den E2 verhindern sollte, hier
   * an der Stelle, an der er wirklich wehtut - und er ist LAUTLOS: die App
   * sagt etwas, das Kind hoert etwas, alles sieht richtig aus. Nur die
   * Aussprache, die geuebt wird, ist die falsche. */
  { n:'das englische Wort wird deutsch ausgesprochen', tor:'smoke',
    args:['--nur=englisch'], bauen:true, datei:D,
    /* Der Anker ist die BEDINGUNG darueber und nicht die Zeile selbst:
       `vorlesen(ziel.wort, 'en')` steht neunmal in dieser Datei, und ein
       Suchtext, der mehrfach passt, verstellt die falsche Stelle. Seit E7
       haengt der Aufruf an `if (!liest) {` - dem Zweig, den „Lies das
       Wort" nicht nimmt -, und diese Klammer gibt es genau einmal.
       Dieselbe benutzt die Probe „die Englischebene sagt das Wort gar
       nicht mehr" ein Stueck weiter unten - zwei Proben duerfen sich einen
       Suchtext teilen, zwei STELLEN nicht. */
    such:"  if (!liest) {\n    vorlesen(ziel.wort, 'en');",
    ersatz:"  if (!liest) {\n    vorlesen(ziel.wort);",
    an:{ ...DIST, fehlt:"if (!liest) {\n    vorlesen(ziel.wort, 'en');" },
    sagt:'übt die falsche Aussprache ein' },

  /* Die Englischebene sagt gar nichts mehr.
   *
   * Diese Probe haelt die AUSNAHME fest, die E3 in den Durchgang gebracht
   * hat: das englische Wort zaehlt nicht als Vorlesehilfe, sonst meldete
   * der Rauchtest bei Lea einen Fehler, wo die App richtig ist. Eine
   * Ausnahme ohne Gegenstueck waere ein Loch - eine Ebene, auf der nie
   * jemand etwas hoert, fiele danach keinem mehr auf. Der Eingriff nimmt
   * die Ansage weg; anschlagen muss das NEUE Urteil, nicht das alte.
   *
   * Der Anker haengt am Kommentar darueber, damit er sich von dem der
   * Probe „das englische Wort wird deutsch ausgesprochen" unterscheidet -
   * beide sitzen auf derselben Zeile, und zwei Proben mit demselben
   * Suchtext waeren nicht mehr auseinanderzuhalten. */
  { n:'die Englischebene sagt das Wort gar nicht mehr', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  if (!liest) {\n    vorlesen(ziel.wort, 'en');",
    ersatz:"  if (!liest) {\n    //Anker:  vorlesen(ziel.wort, 'en');",
    an:{ ...DIST, text:"//Anker:  vorlesen(ziel.wort, 'en');" },
    sagt:'IST das Wort die Frage' },

  /* E4 - ein Wort faellt aus dem Bildplan heraus.
   *
   * Der Eingriff streicht „about" aus den Funktionswoertern. Danach steht
   * es in keiner der drei Listen: es bekommt kein Bild, und niemand hat
   * das entschieden - es ist einfach durchgefallen. Genau die Sorte
   * Luecke, die man beim Nachtragen eines Wortes macht und die erst
   * auffiele, wenn Lea in der Schule danach gefragt wird. */
  { n:'ein Wort fällt aus dem Bildplan heraus', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    such:"  'a/an', 'about', 'and', 'at', 'be (am, are, is)', 'can/can‘t', 'come',",
    ersatz:"  'a/an', 'and', 'at', 'be (am, are, is)', 'can/can‘t', 'come',\n"
      + "  //Anker:  'a/an', 'about', 'and', 'at', 'be (am, are, is)', 'can/can‘t', 'come',",
    an:{ datei:'src/inhalt/englisch.js', text:"  'a/an', 'and', 'at', 'be (am, are, is)'" },
    deckt:'englisch',
    sagt:'in keiner der drei Listen' },

  /* E4 - ein Blatt hat nicht zehn Felder.
   *
   * Der Nutzer schneidet jedes Blatt in ein 5x2-Raster. Neun Felder heissen
   * ein anderes Raster - und das faellt beim Schneiden nicht auf, sondern
   * erst am schiefen Bild. Der Eingriff sitzt an der Zahl im Werkzeug,
   * nicht an einer Kopie im Tor: geprueft wird, was der Nutzer wirklich
   * bekommt. */
  { n:'ein Bildblatt hat nicht zehn Felder', tor:'inhalt',
    datei:'tools/bildprompt.mjs',
    such:'const JE_BLATT = 10;',
    ersatz:'const JE_BLATT = 9; //Anker:  const JE_BLATT = 10;',
    an:{ datei:'tools/bildprompt.mjs', text:'const JE_BLATT = 9;' },
    deckt:'englisch',
    sagt:'Felder statt zehn' },

  /* E10 - die Falle steht unter den richtigen Antworten.
   *
   * Der teuerste Fehler, den diese Ebene machen kann, und der leiseste:
   * der Bildschirm sieht richtig aus, das Lob kommt, und gelernt ist das
   * Falsche. Kein anderes Tor koennte ihn sehen - die Datei ist gueltig,
   * der Satz steht da, die Antwort wird gewertet. */
  { n:'die Falle steht unter den richtigen Antworten', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    such:"    richtig: ['sensitive'], falle: 'sensible',",
    ersatz:"    richtig: ['sensitive', 'sensible'], falle: 'sensible',"
      + " //Anker:      richtig: ['sensitive'], falle: 'sensible',",
    an:{ datei:'src/inhalt/englisch.js', text:"richtig: ['sensitive', 'sensible']" },
    deckt:'englisch',
    sagt:'belohnt die Aufgabe den Fehler' },

  /* E10 - die Falle bekommt keinen eigenen Satz mehr.
   *
   * Der Eingriff laesst die Ebene auf `become` dasselbe sagen wie auf
   * jedes andere falsche Wort: „Nicht ganz". Danach ist sie eine
   * Vokabelabfrage - richtig oder falsch -, und der Grund, aus dem es sie
   * gibt, ist weg. Sie SIEHT dabei unveraendert aus, und sie wird sogar
   * genauso oft richtig beantwortet. */
  { n:'die Falle bekommt keine eigene Auskunft mehr', tor:'smoke',
    args:['--nur=englisch'], bauen:true, datei:D,
    such:"    const satz = inDieFalle ? `Genau die Falle. ${ziel.warum}`\n"
      + "                            : 'Nicht ganz — noch einmal.';",
    ersatz:"    const satz = 'Nicht ganz — noch einmal.';\n"
      + "    //Anker:    const satz = inDieFalle ? `Genau die Falle. ${ziel.warum}`\n"
      + "    //                            : 'Nicht ganz — noch einmal.';",
    an:{ ...DIST, text:"const satz = 'Nicht ganz — noch einmal.';" },
    sagt:'was das Wort wirklich heißt' },

  /* E10 - Gross- und Kleinschreibung zaehlt auf einmal doch.
   *
   * Getippt wird hier von Erwachsenen auf einem Telefon, und die erste
   * Grossschreibung macht die Tastatur von allein. Wer daran scheitert,
   * hat kein Englisch geprueft, sondern eine Tastatur - und aergert sich
   * ueber eine Antwort, die richtig war. */
  { n:'Groß- und Kleinschreibung zählt bei den falschen Freunden doch', tor:'smoke',
    args:['--nur=englisch'], bauen:true, datei:'src/inhalt/englisch.js',
    such:"export const wieGetippt = (t) => String(t).toLowerCase().trim()",
    /* OHNE Anker im Ersatz: geprueft wird `smoke`, nicht `inhalt` - der
       Suchtext muss nur im sauberen Baum stehen, und dort steht er. Ein
       Anker im Kommentar haette hier gerade geschadet: er brachte
       `toLowerCase` ins Buendel zurueck, und die Wache „ist der Eingriff
       angekommen?" schlug an, obwohl er angekommen war. */
    ersatz:"export const wieGetippt = (t) => String(t).trim()",
    an:{ ...DIST, fehlt:'String(t).toLowerCase().trim()' },
    sagt:'wurde nicht gewertet' },

  /* E10 / Tor E-f - die Elternebene bietet auf einmal etwas zum Antippen.
   *
   * Die Profiltabelle sagt fuer Stephan und Violeta „Auswahl statt
   * Tippen: NIE", und genau daran haengt der Zuschnitt dieser Ebene: eine
   * Auswahl aus zweien laesst sich zur Haelfte erraten. Der Eingriff legt
   * einen Antwortknopf dazu - die naheliegendste aller Hilfsbereitschaften. */
  { n:'die Elternebene bietet eine Auswahl an', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    /* Die Zeile mit der LUECKE steht davor: seit E11 gibt es ein zweites
       Tippfeld (der Satzbildschirm), und `<div class="tippfeld">…` allein
       traf beide. Welche Stelle verstellt wird, haette dann die
       Reihenfolge entschieden - und die Probe haette am Ende die falsche
       Ebene geprueft, ohne dass es jemandem auffaellt. */
    /* Der Suchtext nennt nur noch die ZWEITE der beiden Zeilen und dazu
       das `lang="en"` der ersten - genug, um vom Satzbildschirm zu
       unterscheiden, und kurz genug, um eine Aenderung an der Lueckenzeile
       zu ueberstehen. Mit der ganzen Zeile fiel die Probe bei I9 aus (die
       Zeile bekam eine Klasse); `anker` hat es gefangen, an der Probe war
       nichts falsch ausser ihrer Laenge. */
    such:'lang="en">${satzMitFeld}</div>\n'
      + '      <div class="tippfeld"><button class="knopf haupt" id="pruef">Prüfen</button></div>',
    ersatz:'lang="en">${satzMitFeld}</div>\n'
      + '      <div class="tippfeld"><button class="zahl">${ziel.falle}</button>'
      + '<button class="knopf haupt" id="pruef">Prüfen</button></div>',
    an:{ ...DIST, text:'<button class="zahl">' },
    sagt:'Möglichkeiten zum Antippen' },

  /* QS3 - die Zeile „Ton als Gegenstand" ist eine EINGABE, keine Notiz.
   *
   * Der Eingriff stellt Leas Zelle auf „nein". Danach spricht die App
   * weiter (richtig), die Tabelle sagt aber etwas anderes - und genau das
   * muss auffallen. Ohne diese Probe koennte man die Zeile auf „nein"
   * stellen, ohne dass ein Tor rot wird; sie waere dann ein Satz im
   * Backlog und kein Soll.
   *
   * Die andere Haelfte - ein Profil mit „ja", das nichts hoert - faengt
   * die Probe „die Englischebene sagt das Wort gar nicht mehr". Erst
   * zusammen sind sie eine Aussage. */
  { n:'die Zeile „Ton als Gegenstand" wird nicht gelesen', tor:'smoke',
    /* `bauen:true`, obwohl der Eingriff nur ein Dokument anfasst: die
       Wegwerf-Kopie hat kein `dist/`, und ohne Bau laeuft der Rauchtest in
       „ERR_HTTP_RESPONSE_CODE_FAILURE" statt in den Befund. */
    args:['--nur=durchgang'], bauen:true, datei:'docs/Lernkiste-BACKLOG.md',
    such:'| Ton als Gegenstand (Englisch) | ja | ja | **ja** | **ja** |',
    ersatz:'| Ton als Gegenstand (Englisch) | ja | nein | **ja** | **ja** |',
    an:{ datei:'docs/Lernkiste-BACKLOG.md', text:'| ja | nein | **ja**' },
    sagt:'die Profiltabelle für dieses Profil' },

  /* Q51 - die Blindprobe unter der Randmessung meldet auch dann noch,
   * wenn die Aufnahme wiederholt wird.
   *
   * Seit Q51 nimmt `ziehen` bis zu dreimal auf, wenn nichts im Bild ist:
   * Q40 hatte auf den DOM gewartet, gemessen werden aber Bildpunkte, und
   * unter Last ging genau dazwischen die Luecke auf („auf asien ist
   * ueberhaupt kein Grau", allein gefahren 12,77 %).
   *
   * Diese Probe fragt die Kehrseite: MASKIERT die Wiederholung einen echt
   * leeren Ausschnitt? Der Eingriff blendet die Umgebung aus - dann ist
   * das Bild wirklich leer, und zwar dauerhaft. Das Tor muss trotzdem rot
   * werden, auf allen sieben Karten, und der Bericht muss „3 Aufnahmen"
   * sagen: sie hat es versucht und aufgegeben.
   *
   * Ohne diese Probe waere die Wiederholung ein Geduldsfaden, an dem sich
   * jeder Befund irgendwann totlaufen kann. */
  { n:'die Umgebung wird ausgeblendet und das Tor merkt es trotz Wiederholung',
    tor:'ziehen', args:['--nur=rand'], bauen:true, datei:'tor/ziehen.mjs',
    such:"      for (const el of lupe.children) if (el !== halte) el.style.display = 'none';",
    ersatz:"      for (const el of lupe.children) if (el !== halte) el.style.display = 'none';\n"
      + "      halte.style.display = 'none';",
    an:{ datei:'tor/ziehen.mjs', text:"halte.style.display = 'none';" },
    sagt:'ist überhaupt kein Grau' },

  /* E2 - ohne englische Stimme spricht die App trotzdem.
   *
   * Angegriffen wird der Waechter in `vorlesen`, nicht die Stimmenwahl:
   * das ist die Haelfte, die man am ehesten „aufraeumt", weil sie wie
   * eine ueberfluessige Abfrage aussieht. Faellt sie, springt die
   * deutsche Stimme ein und sagt „cat" wie „katt" - und niemand merkt es,
   * am wenigsten das Kind, das gerade Englisch lernt.
   *
   * Lieber schweigen als falsch sprechen: ein Geraet ohne englische
   * Stimme gibt es wirklich, und der Elternbereich sagt dann, wie man
   * eine nachlaedt. */
  { n:'ohne englische Stimme springt die deutsche ein', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:"  if (sprache === 'en' && !stimmeEn) return;",
    ersatz:"  // Eingriff der Gegenprobe. Anker: if (sprache === 'en' && !stimmeEn) return;",
    an:{ ...DIST, fehlt:"\n  if (sprache === 'en' && !stimmeEn) return;" },
    sagt:'spricht die App trotzdem' },

  /* ---- E11/E12: die Wendungen und die Diktatsaetze ------------------- */

  /* Die Kachel steht da und fragt nichts.
   *
   * Genau so ist diese Ebene auf die Welt gekommen: `schirmZu()` fragt
   * `ebeneArt()`, `vorrat()` spaltet die KENNUNG - und `art:'wendungen'`
   * gegen die Kennung `wendungen` fiel darum auseinander, sobald die
   * Einzahl irgendwo stand. Der richtige Bildschirm ging auf, mit einem
   * leeren Vorrat, und griff auf `Sitzung.liste[0]` zu, das es nicht gab.
   * Kein Tor wurde rot. Seither sieht der Durchgang an JEDER Kachel nach,
   * ob sie etwas zu fragen hat.
   *
   * Der Eingriff stellt die Einzahl wieder her - also genau den Fehler,
   * den es schon gab, und nicht einen erfundenen. */
  { n:'eine Ebenenkachel hat gar keinen Vorrat', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  if (art==='wendungen')\n    return Englisch.vorratWendungen();",
    ersatz:"  if (art==='wendung')\n    return Englisch.vorratWendungen();",
    an:{ ...DIST, fehlt:"if (art==='wendungen')" },
    sagt:'hat einen leeren Vorrat' },

  /* Der gesuchte Satz steht auf dem Bildschirm.
   *
   * Bei „Hören und schreiben" ist der englische Satz die FRAGE - stuende
   * er da, waere die Ebene ein Abschreibtest. Der Eingriff zeigt ihn als
   * Hilfe an, so wie es bei den Wendungen richtig waere: dieselbe Zeile,
   * eine Ebene zu weit. */
  { n:'der zu hörende Satz steht mit auf dem Bildschirm', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:'      ${gehoert ? \'\' : `<div class="satzdeutsch">${ziel.deutsch}</div>`}',
    ersatz:'      ${`<div class="satzdeutsch">${ziel.name}</div>`}',
    an:{ ...DIST, text:'<div class="satzdeutsch">${ziel.name}</div>' },
    sagt:'steht auf dem Bildschirm' },

  /* Das zweite Hoeren wird nicht mehr gezaehlt.
   *
   * Diese Zahl ist das Einzige, was ueberhaupt etwas darueber sagt, wie
   * gut das Hoeren wirklich ist - „richtig" allein waere auch die
   * Antwort, die man erst beim vierten Anlauf verstanden hat. Sie kostet
   * nichts und steht nur im Elternbereich; genau deshalb faellt ihr
   * Wegfall sonst niemandem auf. */
  { n:'das zweite Hören wird nicht mehr gezählt', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  const b = gehoert ? nochHoerenKnopf(ziel.satzEn, 'en', true) : null;",
    ersatz:"  const b = gehoert ? nochHoerenKnopf(ziel.satzEn, 'en', false) : null;",
    an:{ ...DIST, text:"nochHoerenKnopf(ziel.satzEn, 'en', false)" },
    sagt:'nicht gezählt' },

  /* Die Normalform faellt weg.
   *
   * `wieGesagt` macht aus „We'd like to come back some time." und
   * „we'd like to come back some time" dasselbe. Ohne sie muesste das
   * Kind - hier: der Erwachsene - die Grossschreibung und den Punkt
   * treffen, um „verstanden" zu heissen, und die ganze Zusage der Ebene
   * („es zaehlt, ob man dich versteht") waere hinfaellig.
   *
   * Der Rauchtest tippt deshalb bewusst NICHT die Musterfassung, sondern
   * eine, wie sie auf einer Telefontastatur entsteht. Ohne das haette
   * diese Probe nichts anzugreifen. */
  { n:'der ganze Satz muss aufs Zeichen genau getippt werden', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:'src/inhalt/englisch.js',
    such:"export const wieGesagt = (t) => String(t).toLowerCase()",
    ersatz:"export const wieGesagt = (t) => String(t)",
    an:{ ...DIST, fehlt:'wieGesagt = (t) => String(t).toLowerCase()' },
    /* Der Wortlaut kommt aus `abgeschlossen()` und nicht aus dem
       Schreibzweig: dort heisst dieselbe Sorte Befund „wurde nicht
       gewertet", hier „<wie> → <was in der Frage steht>". Der erste
       Anlauf schrieb den anderen Satz ab - `smoke` wurde rot, und die
       Probe meldete trotzdem „beweist nichts". */
    sagt:'den ganzen Satz getippt → „Noch nicht ganz' },

  /* Eine Wendung mit nur EINER gueltigen Fassung.
   *
   * Die Ebene sagt zu, dass es mehr als eine richtige Antwort gibt - das
   * ist ihr ganzer Inhalt und steht so im Vorlauf. Eine Wendung, die nur
   * eine kennt, nimmt die zweite Fassung nicht an und sagt „falsch" zu
   * etwas, das jeder Muttersprachler versteht. */
  /* KEINE Wendung traegt nur zwei Fassungen - die wenigste hat drei.
     Der Eingriff nimmt deshalb zwei auf einmal weg, sonst bliebe die
     Ebene ueber der Grenze und die Probe bewiese nichts.

     Und der Suchtext steht WOERTLICH im Kommentar daneben. Das ist der
     Selbsttreffer, der in diesem Verzeichnis inzwischen zum sechsten Mal
     aufgetreten ist: `inhalt` prueft in der Wegwerf-Kopie zuerst, ob
     jeder Probenanker noch dasteht - ein Eingriff, der seinen eigenen
     Anker wegnimmt, laesst das Tor ueber den fehlenden Anker klagen
     statt ueber den Befund. Ein Block-Kommentar, weil der Anker zwei
     Zeilen lang ist. */
  { n:'eine Wendung kennt nur eine einzige Fassung', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    such:"richtig: ['Could you say that again, please?', 'Could you repeat that, please?',\n"
      + "              'Would you say that again, please?', 'Sorry, could you say that again?'] },",
    ersatz:"richtig: ['Could you say that again, please?'] },\n"
      + "/*Anker:  richtig: ['Could you say that again, please?', 'Could you repeat that, please?',\n"
      + "              'Would you say that again, please?', 'Sorry, could you say that again?'] },\n*/",
    an:{ datei:'src/inhalt/englisch.js', text:"richtig: ['Could you say that again, please?'] }," },
    sagt:'gültige Fassung' },

  /* Ein Diktatsatz, den es nicht gibt.
   *
   * Die Diktatsaetze sind eine AUSWAHL der Wendungen und keine zweite
   * Liste (Regel 6: was zweimal dasteht, veraltet einmal). Faellt die
   * Bindung, laufen die beiden Vorraete
   * auseinander - und der Zugriff auf `w.richtig` waere ein Absturz beim
   * Aufschlagen der Ebene, nicht ein roter Bericht. */
  { n:'ein Diktatsatz zeigt auf keine Wendung', tor:'inhalt',
    datei:'src/inhalt/englisch.js',
    /* Der Anker steht woertlich im Kommentar darunter - `//Anker:` und
       ZWEI Leerzeichen, damit die beiden fuehrenden Leerzeichen des
       Suchtextes mit dabei sind. Ohne ihn klagte `inhalt` in der
       Wegwerf-Kopie ueber den fehlenden Anker statt ueber den Befund. */
    such:"  'w-vorstellen', 'w-wiegehts', 'w-freutmich',",
    ersatz:"  'w-vorstellen-alt', 'w-wiegehts', 'w-freutmich',\n"
      + "//Anker:  'w-vorstellen', 'w-wiegehts', 'w-freutmich',",
    an:{ datei:'src/inhalt/englisch.js', text:"'w-vorstellen-alt'" },
    sagt:'zeigt auf keine Wendung' },

  /* ---- T1: die Tiere und ihre Lebensraeume --------------------------- */

  /* Ein Lebensraum haengt an einer Ebene, die es nicht gibt.
   *
   * Genau so faellt diese Sache still aus: die Kennung wird umbenannt
   * (`laender:ozeanien` statt `laender:australien`), das Bild bleibt
   * gemalt, und der Raum ist nie wieder zu oeffnen. Kein Bildschirm wird
   * dabei rot - im Buch steht einfach fuer immer ein blasses Kaenguru. */
  { n:'ein Lebensraum haengt an einer Ebene, die es nicht gibt', tor:'inhalt', deckt:'tiere',
    datei:'src/inhalt/tiere.js',
    /* Der Suchtext steht woertlich im Kommentar darunter - `//Anker:` und
       ZWEI Leerzeichen. `inhalt` prueft in der Wegwerf-Kopie zuerst, ob
       jeder Probenanker noch dasteht; ein Eingriff, der seinen eigenen
       Anker verstellt, laesst das Tor ueber den fehlenden Anker klagen
       statt ueber den Befund. Siebtes Mal in diesem Verzeichnis. */
    such:"  { ebenen:['laender:australien'],    titel:'Das Outback',",
    ersatz:"  { ebenen:['laender:ozeanien'],    titel:'Das Outback',\n"
      + "//Anker:  { ebenen:['laender:australien'],    titel:'Das Outback',",
    an:{ datei:'src/inhalt/tiere.js', text:"'laender:ozeanien'" },
    sagt:'die es in spiel.js nicht gibt' },

  /* UND DIE ZWEITE RICHTUNG (I15): eine Ebene, die in keinen Raum
   * fuehrt.
   *
   * Das ist die Pruefung, die der Kopfkommentar von `tiere.js` ab T1
   * behauptet hat und die es nie gab. Als sie gebaut wurde, waren 26
   * der 48 Ebenen ohne Raum - alle zehn Flaggenebenen darunter.
   *
   * Der Eingriff nimmt „Auf die Karte" aus dem Vogelpark. Nicht die
   * erste Ebene der Liste, sondern die LETZTE: ein Tor, das nur den
   * ersten Eintrag anschaut, bliebe dabei gruen, und genau das war der
   * Fehler in der Bauart davor. */
  { n:'eine Ebene fuehrt in keinen Lebensraum mehr', tor:'inhalt', deckt:'tiere',
    datei:'src/inhalt/tiere.js',
    such:"'flaggen:paare', 'flaggen:karte'], titel:'Im Vogelpark',",
    ersatz:"'flaggen:paare'], titel:'Im Vogelpark',",
    an:{ datei:'src/inhalt/tiere.js', fehlt:"'flaggen:karte'" },
    sagt:'führen in keinen Lebensraum' },

  /* Der Gorilla wird gesammelt.
   *
   * Er ist der Einzige, der NICHT verdient wird - er kommt, wenn eine
   * Runde nicht geklappt hat. Steht er in einem Lebensraum, wird aus dem
   * Trost ein Sammelstueck, und im Buch stuende eine Reihe von Gorillas:
   * die Liste der Runden, die schiefgegangen sind. */
  { n:'der Gorilla wird zum Sammelstueck', tor:'inhalt', deckt:'tiere',
    datei:'src/inhalt/tiere.js',
    such:"    tiere:['elefant', 'giraffe', 'loewe'] },",
    ersatz:"    tiere:['elefant', 'giraffe', 'gorilla'] },\n"
      + "//Anker:      tiere:['elefant', 'giraffe', 'loewe'] },",
    an:{ datei:'src/inhalt/tiere.js', text:"'giraffe', 'gorilla'" },
    sagt:'wird nicht gesammelt' },

  /* Der Lohn gibt es bei jedem Durchgang neu.
   *
   * `raumTiere` bekommt, was das Kind schon hat. Faellt der Filter weg,
   * bekommt ein Kind, das eine fertige Ebene noch einmal spielt, dieselben
   * Tiere wieder - und der Endbildschirm ruft jedes Mal „Das Outback ist
   * offen!". Ein Lohn, den es immer wieder gibt, ist keiner. */
  { n:'die Tiere eines Raums gibt es bei jedem Durchgang neu', tor:'inhalt', deckt:'tiere',
    datei:'src/inhalt/tiere.js',
    such:"  return r.tiere.map(tierMit).filter(t => t && t.bild && !da.has(t.id));",
    ersatz:"  return r.tiere.map(tierMit).filter(t => t && t.bild);\n"
      + "  //Anker:  return r.tiere.map(tierMit).filter(t => t && t.bild && !da.has(t.id));",
    an:{ datei:'src/inhalt/tiere.js', text:"filter(t => t && t.bild);" },
    sagt:'beim ZWEITEN Mal' },

  /* --- Die Flaggen (F1, F2) ------------------------------------------
   *
   * Fuenf Proben, und die erste ist die, die den ganzen Vorrat traegt.
   */

  /* 1. EINER FLAGGE IHR UNTERSCHEIDENDES ZEICHEN NEHMEN.
   *
   * Nicaragua und Honduras sind beide blau-weiss-blau; das Dreieck in der
   * Mitte ist der ganze Unterschied. Ohne es sind es zwei gleiche Bilder
   * mit zwei Namen, und die Aufgabe ist nicht schwer, sondern nicht zu
   * beantworten.
   *
   * Genau das ist beim Bauen passiert, mit einem Stern in der GRUNDFARBE
   * statt eines Dreiecks: gemessen 3,5 % Unterschied. Das Tor hat es
   * gemeldet, bevor es jemand gesehen hat - und diese Probe haelt fest,
   * dass es das kann. */
  /* Genommen wird ECUADOR und nicht Nicaragua, und das ist gemessen und
     nicht geraten: Ecuador IST Kolumbien mit Wappen - dieselben drei
     Streifen, dieselben Breiten. Ohne die Andeutung ist der Unterschied
     NULL, und die Probe faellt unter den Boden.
     
     Der erste Anlauf nahm Nicaragua sein Dreieck. Das Tor wurde rot, aber
     mit der falschen Meldung: Honduras hat noch fuenf Sterne, also blieb
     ein Unterschied ueber dem Boden, und angeschlagen hat stattdessen das
     Paar Nicaragua/El Salvador ueber das SOLL. Rot aus einem anderen
     Grund ist kein Nachweis - eine Pruefung, die nie das meldet, wofuer
     sie steht, ist kein Beweis (Regel 1). */
  { n:'einer Flagge fehlt ihr unterscheidendes Zeichen', tor:'inhalt', deckt:'flaggen',
    datei:'src/inhalt/flaggen.js',
    /* Der Suchtext bleibt als Anker-Kommentar stehen. `inhalt` prueft
       naemlich SELBST, ob jede Gegenprobe ihren Suchtext noch findet -
       und ohne diese Zeile faellt das Tor genau daran durch, nicht an der
       Flagge. Rot aus einem anderen Grund ist kein Nachweis. Dieselbe
       Bauart wie bei den Tier-Proben. */
    such:"                    zeichen:{ form:'vogel', gross:0.46, farbe:'#7F5000' } } },",
    ersatz:"                    zeichen:{ form:'vogel', gross:0.02, farbe:'#7F5000' } } },\n"
      + "//Anker:                    zeichen:{ form:'vogel', gross:0.46, farbe:'#7F5000' } } },",
    an:{ datei:'src/inhalt/flaggen.js', text:"form:'vogel', gross:0.02" },
    sagt:'nicht zu beantworten' },

  /* 2. Eine Flagge zeichnet mit `<rect>` statt mit einem Pfad.
   *
   * `passt` misst ein Kachel-Wasserzeichen je PFAD. Ein `<rect>` findet es
   * nicht - die Flagge waere fuer das Tor unsichtbar, und der Lauf meldete
   * NICHTS. Nicht „gruen": nichts. Genau diese Sorte stiller Ausfall ist
   * der Grund, warum die Regel bei den Tieren steht. */
  { n:'eine Flagge zeichnet wieder mit Rechtecken statt mit Pfaden',
    tor:'inhalt', deckt:'flaggen', datei:'src/inhalt/flaggen.js',
    such:"    return `M${x} ${y}h${b}v${h}h${-b}Z`;",
    ersatz:"    return `` + `<!--` + `M${x} ${y}h${b}v${h}h${-b}Z`;",
    an:{ datei:'src/inhalt/flaggen.js', text:"`` + `<!--`" },
    sagt:'flaggen' },

  /* 3. Ein Land aus `LAENDER` bekommt keine Flagge.
   *
   * Es stuende dann auf der Ebene gar nicht zur Wahl - lautlos, denn
   * `vorrat` filtert ueber `hatFlagge`. Ein Land, das im Spiel fehlt und
   * das niemand vermisst, ist genau die Art Luecke, die erst ein Kind
   * findet. */
  { n:'ein Land hat keine Flagge mehr', tor:'inhalt', deckt:'flaggen',
    datei:'src/inhalt/flaggen.js',
    such:"  { a3:'POL', bau:{ art:'streifen', farben:[W, '#DC143C'] } },\n",
    ersatz:"",
    an:{ datei:'src/inhalt/flaggen.js', fehlt:"a3:'POL'" },
    sagt:'hat keine Flagge' },

  /* 4. Der Notausgang wird zur Gewohnheit.
   *
   * `art:'eigen'` gibt es fuer die vier Flaggen, die keiner Regel folgen.
   * Waechst die Zahl, ist nicht die Flagge besonders, sondern die
   * Formsprache zu eng - und dann gehoert sie erweitert und nicht
   * umgangen. Chile stand schon einmal dort und ist keiner. */
  { n:'immer mehr Flaggen umgehen die Formsprache', tor:'inhalt', deckt:'flaggen',
    datei:'src/inhalt/flaggen.js',
    such:"  { a3:'CHL', bau:{ art:'streifen', farben:[W, '#D52B1E'],",
    ersatz:"  { a3:'CHL', bau:{ art:'eigen', teile:() => [rechteck(0,0,BREIT,HOCH,'#D52B1E')] } },\n"
      + "  { a3:'XXX', bau:{ art:'streifen', farben:[W, '#D52B1E'],",
    an:{ datei:'src/inhalt/flaggen.js', text:"art:'eigen', teile:() => [rechteck(0,0,BREIT,HOCH" },
    sagt:'umgehen die Formsprache' },

  /* 5. DIE FRAGE WIRD NICHT MEHR ANGESAGT.
   *
   * Fiona liest nicht. In der Zeigerichtung ist der Landesname die ganze
   * Aufgabe - ohne ihn stehen vier Flaggen da und nichts dazu, und die
   * Ebene ist fuer sie nicht spielbar. Der Durchgang zaehlt es und meldet
   * „Fiona bekam nur N von 23 Aufgaben vorgelesen".
   *
   * NICHT geprobt wird hier der fehlende BILDSCHIRM (`flaggen:
   * flaggenschirm` aus `schirmZu` nehmen). Ausprobiert: der Durchgang
   * bleibt dabei GRUEN - er findet weder Flaggenkarte noch Rechnung und
   * geht still weiter. Das ist eine Luecke im Rauchtest und keine in der
   * App; sie steht als Punkt in F5. Eine Probe auf ein Tor, das an dieser
   * Stelle nichts beweist, waere selbst nur eine Behauptung. */
  /* --- „Auf die Karte" (F4) -------------------------------------------
   *
   * DIE FLAGGE VERSCHWINDET AUS DER FRAGE. Der Bildschirm fragt dann
   * „Wohin gehoert diese Flagge?" und zeigt keine; die Karte darunter
   * funktioniert weiter tadellos, und ein Durchlauf, der nur zaehlt,
   * meldet gruen. */
  { n:'die Flagge verschwindet aus der Frage auf der Karte', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"      ? `Wohin gehört diese Flagge? ${Flaggen.flaggeSvg(ziel.flagge,",
    ersatz:"      ? `Wohin gehört diese Flagge? ${'' && Flaggen.flaggeSvg(ziel.flagge,",
    an:{ ...DIST, text:"${'' && Flaggen.flaggeSvg(ziel.flagge," },
    sagt:'keine Flagge' },

  /* Und die Karte selbst: `KARTE_ZU` sagt, dass `flaggen:karte` auf der
   * Europakarte spielt. Ohne den Eintrag sucht das Nachladen
   * `laender-karte.json`, bekommt 404, und die Ebene geht gar nicht auf -
   * derselbe Fehler, den `rechnen:plusminus` einmal hatte. */
  { n:'die Kartenebene weiss nicht mehr, welche Karte sie braucht',
    tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"const KARTE_ZU = { 'flaggen:karte': 'europa' };",
    ersatz:"const KARTE_ZU = {};",
    an:{ ...DIST, fehlt:"'flaggen:karte': 'europa'" },
    sagt:'durchgang' },

  /* Und drittens: die Ebene ist nur dann „auf die Karte", wenn sie die
   * UMGEKEHRTE Frage stellt. Faellt der Zwang weg, fragt sie „Wie heisst
   * dieses Land?" mit hervorgehobenem Gebiet - eine ganz normale
   * Erdkundeaufgabe, in der die Flagge nirgends vorkommt. Nichts bricht,
   * nichts ist leer, und der Zweig im Rauchtest, der die umgekehrte
   * Frage spielt, wird schlicht nicht mehr betreten.
   *
   * Genau dieser Zweig war bis F4 tot - er lief in keinem einzigen Lauf,
   * weil die umgekehrte Frage in den Erdkundeebenen erst die dritte ist
   * und der Durchgang nur die erste spielt. Eine Pruefung, die nie etwas
   * meldet, ist kein Beweis (Regel 1) - diese Probe ist der, dass er
   * jetzt laeuft. */
  { n:'„Auf die Karte" stellt wieder die gewoehnliche Frage', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:'  const umgekehrt = aufKarte',
    ersatz:'  const umgekehrt = false',
    an:{ ...DIST, text:'const umgekehrt = false' },
    sagt:'durchgang' },

  /* --- Eine Ebene verliert ihren Bildschirm (F5) -----------------------
   *
   * `schirmZu` faellt dann auf den Kartenbildschirm zurueck, und der ist
   * voellig heil - er bekommt nur einen Vorrat ohne Umrisse. Der
   * Durchgang laeuft in einen Zeitablauf, und bis zu dieser Runde stand
   * in der Meldung nichts als „Timeout 8000ms exceeded": WELCHE der
   * zwanzig Ebenen ihn ausgeloest hat, blieb offen, und der ganze
   * Profildurchlauf endete daran.
   *
   * Die Zusage, die diese Probe prueft, ist deshalb nicht „es wird rot"
   * - das war es auch vorher -, sondern „es wird rot AN DER RICHTIGEN
   * STELLE". Der `catch`, an dem der Profildurchlauf haengt, nennt seit
   * F4 die Ebene, und ohne diesen Namen kostet ein Zeitablauf einen
   * ganzen Lauf, nur um die Stelle zu finden. */
  { n:'die Flaggenebene verliert ihren Bildschirm', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    /* `ohneSofort`, weil der Eingriff MEHRERE Pruefungen ausloest: die
       Ebene faellt bei jedem der vier Profile aus, und dazu meldet der
       Lauf am Ende, dass Fiona zu wenig vorgelesen bekam. Mit `--sofort`
       ist die erste Meldung die, die gerade zuerst faellt - und nicht
       die, um die es geht. */
    ohneSofort:true,
    such:"  flaggen: flaggenschirm,\n  wendungen: satzschirm",
    ersatz:"  wendungen: satzschirm",
    an:{ ...DIST, fehlt:'flaggen: flaggenschirm' },
    sagt:'/flaggen:europa: ' },

  /* Und das Mikrofon steht wieder bei der UMGEKEHRTEN Frage.
   *
   * Dort ist die Karte die Antwortliste: getippt wird auf ein Gebiet, es
   * gibt nichts zu sagen. Der Satz stand seit B3 im Quelltext, das
   * Mikrofon stand trotzdem da - siebzehn Tore liefen daran vorbei, und
   * gesehen hat es die erste Aufnahme von „Auf die Karte" (Regel 4: kein
   * Tor ersetzt den Blick). Seither ist es ein Vorbild, und ein Vorbild
   * meldet sich. */
  /* Auf dem Runner ausgelassen: `ansicht` vergleicht Bildpunkte gegen
     Vorbilder und ist dort abgeschaltet (Q39, Regel 16). */
  { n:'bei der umgekehrten Frage steht wieder ein Mikrofon', tor:'ansicht',
    args:['--nur=quer-flaggen-karte'], bauen:true, datei:D,
    such:'  if (!karteAntwortet) sprachweg({ spricht, werkzeug, liste, bewerte });',
    ersatz:'  sprachweg({ spricht, werkzeug, liste, bewerte });',
    an:{ ...DIST, fehlt:'if (!karteAntwortet) sprachweg(' },
    sagt:'quer-flaggen-karte' },

  /* --- „Sag es" (E6) ---------------------------------------------------
   *
   * Drei Zusagen, drei Fallen. Die Ebene ist die einzige, die kein
   * Urteil faellt - und genau deshalb ist sie die, bei der ein
   * stillschweigender Rueckfall am wenigsten auffiele.
   *
   * 1. SIE FAELLT DOCH EIN URTEIL. Ein Kind, das „blue" mit deutschem
   *    Akzent sagt, bekaeme ein Kreuz - und lernt, den Mund zu halten.
   *    Auf dem Bildschirm sieht das aus wie eine ganz normale Wertung. */
  /* Gemessen wird im Abschnitt `sprechen` und nicht im Durchgang: der
     spielt die Ebene ueber „Gesagt", und wer nicht spricht, bekommt auch
     kein Urteil. Der erste Anlauf zielte auf den Durchgang und blieb
     gruen - die Wertung haengt am Lobsatz, nicht an `werten`, und der
     kam weiter. Eine Probe, die das Falsche verstellt, meldet nichts. */
  { n:'„Sag es" wertet wieder', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:"    bewerte: (roh) => gutschreiben(roh, 'sprechen'),",
    ersatz:"    bewerte: (roh) => { if (roh === ziel.wort) gutschreiben(roh, 'sprechen'); },",
    an:{ ...DIST, text:"if (roh === ziel.wort) gutschreiben(roh, 'sprechen');" },
    sagt:'fällt ein Urteil über die Aussprache' },

  /* 2. DER WEG OHNE MIKROFON FAELLT WEG. Wer keinen Sprachmodus hat,
   *    keine Erlaubnis gibt oder einen Browser ohne Erkennung benutzt,
   *    steht dann vor einer Aufgabe, die sich nicht abschliessen laesst.
   *    Der Bildschirm sieht dabei vollkommen heil aus. */
  { n:'„Sag es" hat keinen Weg mehr ohne Mikrofon', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  werkzeug.appendChild(fertig);",
    ersatz:"  if (0) werkzeug.appendChild(fertig);",
    an:{ ...DIST, text:'if (0) werkzeug.appendChild(fertig);' },
    sagt:'keinen Weg ohne Mikrofon' },

  /* 3. DAS VORBILD BLEIBT AUS. Ohne das gesprochene Wort steht ein
   *    Farbfleck da und die Aufforderung, etwas zu sagen, das nie zu
   *    hoeren war. Fuer ein Kind, das nicht liest, ist die Ebene damit
   *    leer - und kein Bildpunkt aendert sich. */
  { n:'„Sag es" sagt das englische Wort nicht mehr vor', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"     Vorlesehilfe fuer ein Kind, das nicht liest, sondern die Aufgabe\n     selbst - Lea bekommt es genauso. */\n  vorlesen(ziel.wort, 'en');",
    ersatz:"     Vorlesehilfe fuer ein Kind, das nicht liest, sondern die Aufgabe\n     selbst - Lea bekommt es genauso. */",
    an:{ ...DIST, fehlt:"selbst - Lea bekommt es genauso. */\n  vorlesen(ziel.wort, 'en');" },
    sagt:'wurde nicht' },

  /* --- „Der Satz zum Selbersagen" (E9) ---------------------------------
   *
   * Die Ebene teilt sich den Bildschirm mit „Sag es" und unterscheidet
   * sich nur am Gegenstand. Genau deshalb braucht sie eine eigene Falle:
   * faellt die Weiche weg, spielt sie den Bildschirm der Schwester mit
   * deren Vorrat - und niemand sieht es, weil beide gleich aussehen. */
  { n:'die Satzebene bekommt den Vorrat der Wortebene', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  if (art==='englisch' && kont==='satz')\n    return Englisch.vorratChunks();",
    ersatz:"  if (art==='englisch' && kont==='satz')\n    return Englisch.vorratHoeren();",
    an:{ ...DIST, text:"kont==='satz')\n    return Englisch.vorratHoeren();" },
    sagt:'und kein Satz' },

  /* --- „Zwei Wörter, ein Laut" (E5) -------------------------------------
   *
   * 1. DAS GESUCHTE WORT STEHT IN DER FRAGE. Damit ist die ganze Ebene
   *    weg: gehoert wird nicht mehr, gelesen schon. Der Bildschirm bleibt
   *    dabei vollstaendig heil - zwei Karten, ein Hoerknopf, ein Lob -,
   *    und die Aufgabe ist geloest, bevor sie gestellt ist. */
  { n:'das gesuchte Wort steht in der Frage', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:'<div class="frage" id="frage">Welches Wort hörst du?</div>',
    ersatz:'<div class="frage" id="frage">Welches Wort hörst du? ${ziel.wort}</div>',
    an:{ ...DIST, text:'Welches Wort hörst du? ${ziel.wort}' },
    sagt:'steht in der Frage' },

  /* 2. DER GRUND FAELLT WEG. Er ist der eigentliche Inhalt: dass man
   *    einmal richtig geraten hat, nimmt niemand mit, „im Deutschen gibt
   *    es das th nicht" schon. Ohne ihn bleibt eine Ratefrage mit zwei
   *    Moeglichkeiten, und sie sieht genauso aus. */
  { n:'die Lautpaare sagen nicht mehr, woran man sie unterscheidet', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"    + `<strong lang=\"en\">${ziel.gegen}</strong>. ${ziel.grund}`;",
    ersatz:"    + `<strong lang=\"en\">${ziel.gegen}</strong>.`;",
    an:{ ...DIST, fehlt:'${ziel.gegen}</strong>. ${ziel.grund}' },
    sagt:'steht der Grund nicht da' },

  /* 3. DIE ZWEITE KARTE IST NICHT DAS GEGENWORT. Dann stehen zweimal
   *    dieselben Buchstaben da, und was geuebt wird, ist gar nichts -
   *    jeder Tipp ist richtig. */
  { n:'das Lautpaar zeigt zweimal dasselbe Wort', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"                           { wort: ziel.gegen, gesucht: false }],",
    ersatz:"                           { wort: ziel.wort, gesucht: false }],",
    an:{ ...DIST, text:'{ wort: ziel.wort, gesucht: false }' },
    sagt:'auf dem Bildschirm stehen' },

  /* 4. EIN PAAR UNTERSCHEIDET SICH ANDERSWO als an seiner Stolperstelle.
   *    „wine/vine" unter „Das englische th" waere eine Uebung, die etwas
   *    anderes uebt als ihr Grund behauptet - und beide Woerter stehen
   *    richtig da. Das Tor rechnet die Ersetzung nach; ohne sie waere die
   *    Zuordnung eine Behauptung. */
  { n:'ein Lautpaar steht unter der falschen Stolperstelle', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"  { a: 'wine',  b: 'vine',  stolper: 'wv' },",
    ersatz:"  { a: 'wine',  b: 'vine',  stolper: 'th' },",
    an:{ datei:'src/inhalt/englisch.js', text:"b: 'vine',  stolper: 'th'" },
    sagt:'unterscheidet sich nicht an seiner Stolperstelle' },

  /* 5. EINE STOLPERSTELLE FAELLT WEG. Das Konzept nennt VIER, und die
   *    Abnahme heisst „alle vier sind vertreten". Wer eine streicht,
   *    streicht sie lautlos - niemand vermisst, was nie dastand. */
  { n:'eine der vier Stolperstellen fällt weg', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"  { id: 'ea', name: 'a gegen e',",
    ersatz:"  { id: 'ea-alt', name: 'a gegen e',",
    an:{ datei:'src/inhalt/englisch.js', text:"id: 'ea-alt'" },
    sagt:'die es nicht gibt' },

  /* 6. DIE EBENE WIRD AUCH OHNE ENGLISCHE STIMME ANGEBOTEN. Dann steht
   *    sie in Leas Wand und hat nichts zu sagen: „tippe das Wort an, das
   *    daneben steht". Hier hat Chromium eine englische Stimme, also ist
   *    das nur an der EINEN Stelle zu sehen, die sie wegnimmt. */
  { n:'die Lautpaare stehen auch ohne englische Stimme da', tor:'smoke',
    args:['--nur=englisch'], bauen:true, datei:D,
    /* Seit Fiona dabei ist, steht die Bedingung ueber drei Zeilen und
       traegt eine zweite Haelfte (genug GEMALTE Paare). Der Eingriff
       bleibt derselbe: `wenn` sagt immer ja. */
    such:"    wenn: () => englischHoerbar()",
    ersatz:"    wenn: () => true || englischHoerbar()",
    an:{ ...DIST, text:'wenn: () => true || englischHoerbar()' },
    sagt:'vergäbe Sterne für nichts' },

  /* 7. UND DAS TOR SELBST: `passt` bekommt seine Stimmen nicht mehr.
   *    Dann gibt es „Zwei Wörter, ein Laut" in seinem Browser nicht, und
   *    das Tor misst eine Ebene, die es nie zu sehen bekommt - genau die
   *    Luecke, durch die der Vorlauf der Satzebenen eine Runde lang
   *    gefallen ist. Der Eingriff sitzt im TOR und nicht in der App: die
   *    Frage ist, ob das Tor hinsieht. */
  { n:'passt bekommt keine englische Stimme mehr', tor:'passt', bauen:true,
    datei:'tor/passt.mjs',
    such:'  await stimmenUnterschieben(p);',
    ersatz:'',
    an:{ datei:'tor/passt.mjs', fehlt:'await stimmenUnterschieben(p);' },
    sagt:'steht gar nicht in der Wand' },

  /* --- „Leg das Wort" (E8) ---------------------------------------------
   *
   * 1. DIE VORLAGE VERSCHWINDET. Der Lehrplan sagt „abschreibend, MIT
   *    Vorlage" - ohne sie ist es freies Buchstabieren, eine ganz andere
   *    und viel schwerere Aufgabe. Auf dem Bildschirm fehlt dann eine
   *    Zeile, sonst sieht alles normal aus: Luecken, Karten, Lob. */
  { n:'die Vorlage steht nicht mehr da', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:'  const zeigtVorlage = !istSatz || !englischHoerbar();',
    ersatz:'  const zeigtVorlage = istSatz && !englischHoerbar();',
    an:{ ...DIST, text:'const zeigtVorlage = istSatz &&' },
    sagt:'ohne Vorlage' },

  /* Und die Gegenrichtung (E9c): der SATZ steht da, obwohl er zu hoeren
   * war. Dann ist „Bau den Satz" dieselbe Aufgabe wie „Leg das Wort",
   * eine Nummer groesser - und im Bild ist der Unterschied eine Zeile. */
  { n:'der zu hörende Satz steht trotzdem daneben', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:'  const zeigtVorlage = !istSatz || !englischHoerbar();',
    ersatz:'  const zeigtVorlage = true;',
    an:{ ...DIST, text:'const zeigtVorlage = true;' },
    sagt:'obwohl er zu hören war' },

  /* 2. EIN FALSCHER BUCHSTABE BLEIBT LIEGEN. Die Zusage der Ebene ist,
   *    dass in der Luecke nie etwas Falsches steht - wer abschreibt,
   *    sieht am Ende das richtige Wort und nicht seinen Fehler. Eine
   *    Fassung, die den Buchstaben annimmt und nur wackelt, sieht im
   *    Bild fast gleich aus und ist eine andere Aufgabe. */
  { n:'ein falscher Buchstabe bleibt in der Lücke liegen', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:'    if (stelle.dataset.b === karte.dataset.b) {',
    ersatz:'    if (stelle.dataset.b || karte.dataset.b) {',
    an:{ ...DIST, text:'stelle.dataset.b || karte.dataset.b' },
    sagt:'abgeschrieben wird richtig' },

  /* 3. DER TIPPWEG FAELLT WEG. Dann bleibt nur das Ziehen - und Ziehen
   *    ist auf einem Telefon die fehleranfaellige Bedienung, nicht die
   *    bequeme. Duolingo tippt aus genau diesem Grund. Ein Kind, das
   *    eine Karte nicht ans Ziel bekommt, stuende vor einer Aufgabe, die
   *    sich nicht abschliessen laesst; im Bild ist davon nichts zu
   *    sehen, denn die Karten stehen ja da. */
  { n:'die Buchstabenkarten lassen sich nur noch ziehen', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"    karte.onclick = () => legen(karte, offen(), 'antippen', null);",
    ersatz:'    karte.onclick = () => {};',
    an:{ ...DIST, text:'karte.onclick = () => {};' },
    sagt:'Buchstabe für Buchstabe gelegt' },

  /* 4. DER VORLAUF ZEIGT WIEDER DEN GANZEN VORRAT. Vierundzwanzig Karten
   *    wollen acht Spalten zu 88 Punkten; auf dem iPhone SE quer passen
   *    sieben in die 643 Punkte Gitterbreite, aus drei Reihen werden
   *    vier, und eine Karte misst 23 statt 44. Auf dem Zielgeraet (844)
   *    faellt davon nichts auf - genau deshalb faehrt `passt` sieben
   *    Groessen und nicht eine. */
  /* Und dieselbe Falle bei den SAETZEN, nur groesser: ein Satzkasten ist
   * drei Zeilen hoch. Zwanzig davon sind sieben Reihen, das Band hat
   * Platz fuer drei - sechs Kaesten liefen auf dem Zielgeraet 31 Punkte
   * ueber den Rand, auf dem iPhone SE quer 159, und einer lag zu 78
   * Prozent auf „Jetzt starten". Der Befund ist aelter als „Bau den
   * Satz": „Sag den Satz" hatte ihn seit v46x, und kein Tor hat ihn
   * gesehen, weil keines die Ebene betreten hat. */
  { n:'der Vorlauf zeigt wieder alle zwanzig Sätze', tor:'passt', bauen:true, datei:D,
    such:"  : ['englisch:satz', 'englisch:bauen'].includes(ebeneId) ? 3",
    ersatz:"  : ['englisch:satz'].includes(ebeneId) ? 3",
    an:{ ...DIST, text:"['englisch:satz'].includes(ebeneId) ? 3" },
    sagt:'über den Rand' },

  { n:'der Vorlauf zum Legen zeigt wieder alle Wörter', tor:'passt', bauen:true, datei:D,
    such:"  : ebeneId === 'englisch:legen' ? 12",
    ersatz:"  : ebeneId === 'englisch:legen' ? 24",
    an:{ ...DIST, text:"'englisch:legen' ? 24" },
    sagt:'ein Aufkleber muss 44 messen' },

  /* 5. DER FILTER LAESST DURCH, WAS SICH NICHT LEGEN LAESST. `forty-five`
   *    traegt einen Bindestrich, und eine Karte dafuer gibt es nicht -
   *    das Wort waere unloesbar. Ein Filter faellt still aus. */
  { n:'ein Wort ohne Karte kommt in den Legevorrat', tor:'inhalt', deckt:'englisch',
    datei:'src/inhalt/englisch.js',
    such:'    .filter(x => /^[a-z]+$/.test(x.wort))',
    ersatz:'    .filter(x => /^[a-z-]+$/.test(x.wort))',
    an:{ datei:'src/inhalt/englisch.js', text:'/^[a-z-]+$/' },
    sagt:'kein Buchstabe ist' },

  /* 6. UND DIE EIGENE KENNUNG FAELLT WEG. Dann teilen sich „Leg das
   *    Wort" und „Hoeren und zeigen" ein Leitner-Fach: wer `blue`
   *    gehoert und gezeigt hat, haette es damit geschrieben. Zu sehen
   *    ist das an nichts - der Fortschrittsbalken steht nur weiter, als
   *    er sollte. */
  { n:'der Legevorrat teilt sich den Leitner-Stand', tor:'inhalt', deckt:'englisch',
    datei:'src/inhalt/englisch.js',
    such:'    .map(x => ({ ...x, id: `lg:${x.id}` }));',
    ersatz:'    .map(x => ({ ...x }));',
    an:{ datei:'src/inhalt/englisch.js', text:'.map(x => ({ ...x }));' },
    sagt:'teilt sich' },

  /* --- „Zwei Wörter, ein Laut" MIT BILDERN (E5 für Fiona) --------------
   *
   * Fuenf Arten, wie die Ebene fuer ein Kind, das nicht liest, leise
   * wieder zu dem wird, was sie vorher war: zwei Muster nebeneinander.
   *
   * 1. DER BILDSCHIRM ZEIGT DOCH BUCHSTABEN. Eine Zeile, und Fiona steht
   *    wieder vor zwei geschriebenen Woertern - der Bildschirm bleibt
   *    dabei vollstaendig heil, und sie tippt eines von beiden an. */
  { n:'Fiona bekommt beim Lautpaar wieder Buchstaben', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  const mitBild = !!P.vorlesen && zwei.every(x => bildZu(x.wort));",
    ersatz:"  const mitBild = false; // Anker: !!P.vorlesen && zwei.every(x => bildZu",
    an:{ ...DIST, text:'const mitBild = false;' },
    sagt:'dieses Profil liest nicht' },

  /* 2. UND DIE GEGENRICHTUNG: die Bilder stehen bei ALLEN. Fuer Lea und
   *    die Eltern waere das die leichtere Aufgabe - wer zwei Bilder
   *    unterscheidet, muss das geschriebene Wort nicht mehr lesen -, und
   *    auf dem Bildschirm sieht es aus wie eine Verbesserung. Ohne diese
   *    Probe bewiese die erste nur die Haelfte. */
  { n:'auch wer liest, bekommt beim Lautpaar Bilder', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    /* Der Eingriff nimmt die GANZE Bedingung weg und nicht nur das
       Profil. Der erste Anlauf liess `zwei.every(x => bildZu(x.wort))`
       stehen - und bewies nichts: Leas Vorrat hat alle siebzehn Paare,
       und dreizehn davon haben keine Zeichnung, also blieb `mitBild`
       falsch und der Bildschirm unveraendert. „TOR BLEIBT GRUEN", und
       der Laeufer hatte recht. So herum bekommt jedes Profil Bildkarten,
       und bei Lea schlaegt die Richtung an, um die es geht. */
    such:"  const mitBild = !!P.vorlesen && zwei.every(x => bildZu(x.wort));",
    ersatz:"  const mitBild = zwei.every(x => true); //Anker: !!P.vorlesen && bildZu(x.wort)",
    an:{ ...DIST, text:'const mitBild = zwei.every(x => true);' },
    sagt:'dieses Profil liest' },

  /* 3. DER VORRAT GIBT DIE FALSCHEN PAARE HER. Der Bildschirm ist heil,
   *    die Weiche darin auch - nur bekommt Fiona die dreizehn Paare, die
   *    KEINE Bilder haben, und faellt damit auf die Buchstaben zurueck.
   *    Zwei Weichen, zwei Proben: die eine sagt nichts ueber die andere. */
  { n:'der Lautvorrat filtert für das falsche Profil', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"    return Englisch.vorratLaute({ nurMalbar: !!P.vorlesen });",
    ersatz:"    return Englisch.vorratLaute({ nurMalbar: !P.vorlesen });",
    an:{ ...DIST, text:'nurMalbar: !P.vorlesen' },
    sagt:'dieses Profil liest nicht' },

  /* 4. EIN PAAR VERLIERT EINE SEINER BEIDEN ZEICHNUNGEN. Dann ist es
   *    nicht mehr malbar, die Zahl faellt unter die aus `spiel.js`, und
   *    die Ebene blendet sich bei Fiona SELBST AUS - lautlos. Genau die
   *    Sorte Ausfall, die man an der Kachelwand nicht sieht. */
  { n:'ein Lautpaar verliert eine seiner beiden Zeichnungen', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"  vine: [",
    ersatz:"  vineX: [",
    an:{ datei:'src/inhalt/englisch.js', text:'vineX: [' },
    sagt:'gemalte Lautpaare' },

  /* 5. BEIDE KARTEN ZEIGEN DASSELBE BILD. Dann ist jeder Tipp so richtig
   *    wie der andere, und der Bildschirm sieht aus wie immer. */
  { n:'ein gemaltes Lautpaar zeigt zweimal dasselbe Bild', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"    { f:'blau',       d:'M12 36c0-13 9-22 20-22s20 9 20 22Z' },\n"
      + "    { f:'blauDunkel', d:'M32 14c11 0 20 9 20 22h-9c0-12-5-20-11-22Z' },\n"
      + "    { f:'blauDunkel', d:'M6 36h50c4 0 6 3 6 7H6Z' },\n"
      + "    { f:'licht',      d:'M30 10h4v5h-4Z' },",
    ersatz:"    { f:'gelb',       d:'M26 8h12v8H26Z' },\n"
      + "    { f:'gelb',       d:'M16 18h26l9 14H7Z' },\n"
      + "    { f:'gelb',       d:'M2 32h60v14H2Z' },\n"
      + "    { f:'blauDunkel', d:'M19 21h11v9H12Zm15 0h6l6 9H34Z' },\n"
      + "    { f:'gelbDunkel', d:'M2 40h60v6H2Z' },\n"
      + "    { f:'tinte',      d:'M14 42a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm36 0a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z' },\n"
      + "    { f:'grau',       d:'M14 46a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm36 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' },",
    /* KEINE Merkflaeche obendrauf: der Abdruck muss GENAU der von `cab`
       sein, sonst sind die beiden Bilder verschieden und die Probe
       prueft nichts. Angekommen ist der Eingriff daran, dass die Kuppe
       der Muetze verschwunden ist. */
    an:{ datei:'src/inhalt/englisch.js', fehlt:"M12 36c0-13 9-22 20-22s20 9 20 22Z" },
    sagt:'zweimal dieselbe Zeichnung' },

  /* 6. UND DIE ZAHL, unter der sich die Ebene ausblendet: sie steht in
   *    `spiel.js`, weil sie eine Aussage ueber Fionas Sitzung ist. Das
   *    Tor holt sie dort - und wenn es sie NICHT dort holte, sondern eine
   *    zweite Fassung neben sich haette, bliebe es hier gruen. */
  { n:'die Zahl der nötigen Lautbilder wird nicht aus spiel.js gelesen',
    tor:'inhalt', deckt:'englisch', datei:D,
    such:'const LAUTPAARE_FUER_BILDER = 4;',
    ersatz:'const LAUTPAARE_FUER_BILDER = 9;',
    an:{ datei:D, text:'LAUTPAARE_FUER_BILDER = 9' },
    sagt:'gemalte Lautpaare' },

  /* 7. EINE ZEICHNUNG GEHOERT ZU KEINEM PAAR. Ein Tippfehler im
   *    Schluessel, und das Bild liegt fuer immer ungenutzt da, waehrend
   *    sein Paar sich still fuer unmalbar haelt. */
  { n:'eine Lautzeichnung gehört zu keinem Paar', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"  pan: [",
    ersatz:"  pfanne: [\n    { f:'grau', d:'M13 26h24v7c0 5-4 9-9 9h-6c-5 0-9-4-9-9Z' },\n"
      + "    { f:'tinte', d:'M42 26h20v7H42Z' },\n  ],\n  pan: [",
    an:{ datei:'src/inhalt/englisch.js', text:'pfanne: [' },
    sagt:'kein Lautpaar fragt danach' },

  /* --- Der Grund der Welt (N7) ------------------------------------------
   *
   * 1. ES BLEIBT ALLES WEISS. Die Ableitung wird nicht gesetzt, und die
   *    Flaeche hat wieder keinen Ort. Nichts wird falsch, nichts wird
   *    rot - genau die Verfallsart, gegen die eine Ableitung gebaut ist. */
  { n:'der Grund der Welt wird nicht gesetzt', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"  if (w && !OHNE_GRUND.has(bau && bau.name)) d.setAttribute('data-welt', String(w.farbe));",
    ersatz:"  if (false) d.setAttribute('data-welt', String(w.farbe)); "
      + "// Anker: if (w && !OHNE_GRUND.has(bau && bau.name)) d.setAttribute('data-welt', String(w.farbe));",
    an:{ ...DIST, text:"if (false) d.setAttribute('data-welt'" },
    sagt:'traegt der Grund keinen Ton' },

  /* 2. ER STEHT SCHON UEBER DEN WELTEN. Die Weltenwahl in Erdkunde-Blau,
   *    weil `Welt` ab Werk auf der ersten Welt steht - eine Auskunft ueber
   *    einen Ort, den man noch nicht betreten hat. Genau das ist beim
   *    ersten Anlauf passiert, und es sah dabei gut aus. */
  { n:'der Grund färbt auch die Bildschirme über den Welten', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"const OHNE_GRUND = new Set(['profilwahl', 'weltenwahl', 'forscherbuch', 'elternTor']);",
    ersatz:"const OHNE_GRUND = new Set([]); "
      + "// Anker: const OHNE_GRUND = new Set(['profilwahl', 'weltenwahl', 'forscherbuch', 'elternTor']);",
    an:{ ...DIST, text:'const OHNE_GRUND = new Set([]);' },
    sagt:'noch nicht betreten hat' },

  /* --- Das Buch (N12) ----------------------------------------------------
   *
   * 1. DIE SAMMLUNG FUELLT IHRE SEITE NICHT MEHR. Zurueck in den
   *    Zustand, in dem eine Kapitelseite eine kurze Reihe am Kopf war
   *    und darunter die halbe Seite leer. Nichts wird falsch; es sieht
   *    nur wieder aus wie eine Liste und nicht wie ein Album. Gemessen
   *    faellt die Fuellung von 95 auf 37 bis 56 %. */
  { n:'die Sammlung fuellt ihre Buchseite nicht mehr', tor:'smoke',
    args:['--nur=spielen,ablage'], bauen:true, datei:V,
    /* Angefasst wird die letzte Zeile der Auswahlliste, also die
       Deklaration selbst - damit faellt die Fuellung fuer ALLE drei
       Raster weg, nicht nur fuer eines. */
    such:"  .buchraster > .abzeichen{min-height:100%;align-content:stretch;",
    ersatz:"  .buchraster > .abzeichen{min-height:0;align-content:start;",
    an:{ ...DIST, text:".buchraster > .abzeichen{min-height:0;align-content:start;" },
    sagt:'ihrer Hoehe' },

  /* 2. DER KASTEN WAECHST, DAS BILD NICHT. Die gefaehrlichere Fassung,
   *    und sie ist gemessen und nicht erfunden: genau so lag N12
   *    zwischendurch im Bündel. Die Zellen fuellten die Seite, und darin
   *    klebte dieselbe briefmarkengrosse Weltkarte wie vorher - die
   *    Fuellung meldete 95 %, und die Seite war leerer als je zuvor.
   *    Eine Kennzahl, die sich durch einen hoeheren leeren Kasten
   *    erfuellen laesst, misst den Kasten. Deshalb misst `tonleiter`
   *    daneben den BILDANTEIL, und diese Probe zieht ihn zurueck. */
  { n:'der Kasten waechst, das Bild bleibt briefmarkengross', tor:'tonleiter',
    bauen:true, datei:V,
    such:"  .buchraster > .raumgitter .raumzelle .raumzeichen{width:100%;height:auto;",
    ersatz:"  .buchraster > .raumgitter .raumzelle .raumzeichen--aus{width:100%;height:auto;",
    an:{ ...DIST, text:".raumzeichen--aus{width:100%;height:auto;" },
    sagt:'weniger als 35 % Bild' },

  /* 3. DAS ABZEICHEN SCHRUMPFT WIEDER. Die letzte Ausnahme im
   *    Bildanteil-Tor ist gefallen (19 → 55 %), und diese Probe haelt
   *    sie unten: die Wand fuellt ihre Seite auch dann, wenn das Zeichen
   *    darin 44 Punkte gross bleibt - 81 % Fuellung bei 19 % Bild. Nur
   *    der Bildanteil sieht den Unterschied. */
  { n:'das Abzeichen bleibt klein in seiner Zelle', tor:'tonleiter',
    bauen:true, datei:V,
    such:"  .buchraster > .abzeichen .abz > svg{width:100%;height:auto;",
    ersatz:"  .buchraster > .abzeichen .abz > svg--aus{width:100%;height:auto;",
    an:{ ...DIST, text:".abz > svg--aus{width:100%;height:auto;" },
    sagt:'weniger als 35 % Bild' },

  /* --- Der Ausweg (S12) --------------------------------------------------
   *
   * 1. DER ERSTE DRUCK LOEST WIEDER AUF. Zurueck in den Zustand, in dem
   *    „Weiß ich nicht" nichts kostet und nichts bringt. Der Knopf tut
   *    etwas, der Bildschirm sieht heil aus, und die Stufe ist weg. */
  { n:'der erste Druck loest schon auf', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"    if (k.dataset.stufe === 'tipp' && tipp && tipp()) {",
    ersatz:"    if (false) { // Anker: if (k.dataset.stufe === 'tipp' && tipp && tipp()) {",
    an:{ ...DIST, text:'if (false) { // Anker: if (k.dataset.stufe' },
    sagt:'löst schon auf' },

  /* 2. DER ZWEITE DRUCK LOEST NICHT MEHR AUF. Die schlimmere Fassung:
   *    das Kind kommt aus einer Aufgabe, die es nicht kann, gar nicht
   *    mehr heraus - und genau dafuer gibt es den Knopf. Sichtbar ist
   *    davon nichts; der Knopf reagiert ja. */
  /* Der erste Anlauf dieser Probe nahm die Stufenpruefung heraus
     (`if (tipp && tipp())` statt `if (k.dataset.stufe === 'tipp' && …)`)
     - und das Tor blieb GRUEN, zu Recht: beim zweiten Druck gibt es
     nichts mehr wegzunehmen, `tippWegnehmen` meldet `false`, und der
     Knopf faellt von selbst auf die Loesung durch. Die Probe hat also
     keinen Fehler hergestellt, sondern eine Robustheit vorgefuehrt.
     Der zweite Anlauf liess `tippWegnehmen` immer `true` melden - auch
     gruen, und wieder zu Recht: die Stufe war da schon auf „loesung"
     gesetzt, der zweite Druck kam an der Bedingung gar nicht mehr
     vorbei. ZWEI Sicherungen also, und beide muessen weg, damit der
     Fehler entsteht.
     Der Eingriff sitzt jetzt an der Bedingung selbst: sie ist immer
     wahr, der Knopf gibt bei JEDEM Druck einen Tipp und loest nie auf.
     Ein Kind kommt aus einer Aufgabe, die es nicht kann, nicht mehr
     heraus - und genau dafuer gibt es den Knopf. */
  { n:'der zweite Druck loest nicht mehr auf', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"    if (k.dataset.stufe === 'tipp' && tipp && tipp()) {",
    ersatz:"    if (true) { // Anker: if (k.dataset.stufe === 'tipp' && tipp && tipp()) {",
    an:{ ...DIST, text:'if (true) { // Anker: if (k.dataset.stufe' },
    sagt:'löst nicht auf' },

  /* 3. DER TIPP NIMMT ALLES WEG. Dann ist er die Loesung, nur ohne den
   *    Satz dazu - bei zwei Antworten bliebe genau die richtige stehen.
   *    Das faellt im Bild nicht auf: ein Bildschirm mit einer Antwort
   *    sieht aus wie einer, auf dem eben richtig getippt wurde. */
  { n:'der Tipp nimmt alle falschen weg', tor:'spielprobe',
    datei:'src/kern/tipp.js',
    such:"  return Math.min(Math.ceil(f / 2), f - 1);",
    ersatz:"  return f; // Anker: Math.min(Math.ceil(f / 2), f - 1)",
    an:{ datei:'src/kern/tipp.js', text:'return f; // Anker:' },
    sagt:'das ist die Loesung und kein Tipp' },

  /* --- Das Haus (N6) -----------------------------------------------------
   *
   * 1. ES ZAEHLT NUR DAS EINE KIND. Die stillste Fassung: die Zeile
   *    steht da, die Sterne stimmen sogar - nur sind es dieselben, die
   *    einen Fingerbreit tiefer auf der Kachel stehen. Aus zwei
   *    Geschwistern werden wieder zwei Einzelkinder, und kein Tor sieht
   *    einen Unterschied, wenn es nur EIN Profil bestueckt. */
  { n:'das Haus zaehlt nur ein Kind', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"const hausSterne = () => hausKinder().reduce((n, p) => n + tagesSterne(p.id), 0);",
    ersatz:"const hausSterne = () => tagesSterne(hausKinder()[0].id); "
      + "// Anker: hausKinder().reduce((n, p) => n + tagesSterne(p.id), 0)",
    an:{ ...DIST, text:'const hausSterne = () => tagesSterne(hausKinder()[0].id);' },
    sagt:'zaehlt nicht beide zusammen' },

  /* 2. ES ZAEHLT DIE ELTERN MIT. Dann steht das Ziel auf zwoelf, und
   *    zwoelf sind nicht zu erreichen: Stephan und Violeta bekommen
   *    keinen Tagesstern, und zwar mit Absicht. Ein Ziel, das niemand
   *    erreichen kann, ist schlimmer als keines - es sieht nur aus wie
   *    eines. */
  { n:'das Haus zaehlt die Eltern mit', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"const hausKinder = () => Object.values(PROFILE).filter(istKind);",
    ersatz:"const hausKinder = () => Object.values(PROFILE); "
      + "// Anker: Object.values(PROFILE).filter(istKind)",
    an:{ ...DIST, text:'const hausKinder = () => Object.values(PROFILE);' },
    sagt:'das Ziel ist nicht zu erreichen' },

  /* 3. DAS VOLLE HAUS SAGT NICHTS. Es faerbt sich nur - und ein
   *    Farbwechsel kommt bei einem Kind, das nicht liest, ueber die
   *    Ansage an oder gar nicht. Fiona ist sechs. */
  { n:'das volle Haus bleibt stumm', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"    }${voll ? '<span>Das Haus ist voll!</span>' : ''}</div>`;",
    ersatz:"    }${voll ? '' : ''}</div>`; "
      + "// Anker: ${voll ? '<span>Das Haus ist voll!</span>' : ''}",
    an:{ ...DIST, text:"}${voll ? '' : ''}</div>`;" },
    sagt:'nicht in Worten' },

  /* --- Der Moment (N10) --------------------------------------------------
   *
   * 1. DAS JA BEWEGT SICH NICHT MEHR. Zurueck in den Zustand, in dem in
   *    dieser App nur die Ablehnung eine Bewegung hatte. Nichts wird
   *    falsch; das Kind bekommt nur den ganzen Tag zu sehen, was NICHT
   *    stimmt. */
  { n:'die richtige Antwort huepft nicht mehr', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:V,
    such:'.stimmt{animation:huepft var(--d-belohnung) var(--k-standard)}',
    ersatz:'.stimmt{animation:none} '
      + '/* Anker: .stimmt{animation:huepft var(--d-belohnung) var(--k-standard)} */',
    an:{ ...DIST, text:'.stimmt{animation:none} /* Anker:' },
    sagt:'bekommt keine Bewegung' },

  /* 2. DIE AUSNAHME WIRD WEGGERAEUMT. Die gefaehrlichere Fassung, und
   *    sie ist nicht erfunden: genau so lag es im ersten Anlauf von N10
   *    im Bündel. `[data-fertig] .zahl` setzt `animation:none` mit
   *    hoeherer Kennzahl als `.stimmt` - das Huepfen steht dann da, ist
   *    gebaut, kommt mit und wirkt nicht. Kein Tor sieht so etwas an der
   *    Regel; nur der Browser weiss, was er wirklich angelegt hat. */
  { n:'die verbrauchten Knoepfe ersticken das Huepfen wieder', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:V,
    such:'[data-fertig] .zahl:not(.stimmt){opacity:.42;',
    ersatz:'[data-fertig] .zahl{opacity:.42;',
    an:{ ...DIST, text:'[data-fertig] .zahl{opacity:.42;' },
    sagt:'bekommt keine Bewegung' },

  /* 3. DER ENDBILDSCHIRM KOMMT WIEDER ALS GANZES. Der Versatz faellt
   *    weg, alles tritt zugleich auf - und es SIEHT genauso aus. Nur ist
   *    es dann kein Augenblick mehr, sondern ein Bild. Das ist die
   *    Verfallsart, gegen die diese Runde gebaut ist. */
  { n:'die Buehne tritt ohne Versatz auf', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:V,
    such:'.buehne>*:nth-child(4){animation-delay:calc(var(--d-auftritt) * 3)}',
    ersatz:'.buehne>*:nth-child(4){animation-delay:0ms} '
      + '/* Anker: nth-child(4) hatte calc(var(--d-auftritt) * 3) */',
    an:{ ...DIST, text:'.buehne>*:nth-child(4){animation-delay:0ms}' },
    sagt:'kommt als Ganzes' },

  /* 4. DER AUFTRITT BLEIBT HAENGEN. Die Zeilen kommen herein und werden
   *    nie ganz da - ein halb sichtbarer Endbildschirm ist schlimmer als
   *    gar kein Auftritt, und er sieht aus wie ein Ladefehler. */
  { n:'der Auftritt bleibt auf halbem Weg stehen', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:V,
    such:'@keyframes auftritt{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}',
    ersatz:'@keyframes auftritt{from{opacity:0;transform:scale(.92)}'
      + 'to{opacity:.4;transform:none}}',
    an:{ ...DIST, text:'to{opacity:.4;transform:none}}' },
    sagt:'noch blass' },

  /* --- Die Figur (N9) ---------------------------------------------------
   *
   * Ein Begleiter im Lob ist der eine Grafikbefund, der sich am Quelltext
   * bestaetigt hat: es war niemand da. Beide Verfallsarten sind still -
   * der Lobsatz steht in jedem Fall, er ist nur wieder leer bzw. an der
   * falschen Stelle voll.
   *
   * 1. SIE KOMMT NIE. Zurueck zum Ausgangszustand, ohne dass ein Tor
   *    etwas merkt: der Satz ist da, der Jubel ist da, nur der Begleiter
   *    fehlt. Genau so hat es vor N9 ausgesehen. */
  { n:'im Lob steht keine Figur mehr', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"  const wer = ton().feier ? figur(fastText ? 'staunt' : 'freut', 32) : '';",
    ersatz:"  const wer = ''; "
      + "// Anker: const wer = ton().feier ? figur(fastText ? 'staunt' : 'freut', 32) : '';",
    an:{ ...DIST, text:"const wer = ''; // Anker: const wer = ton().feier" },
    sagt:'steht keine Figur' },

  /* 2. SIE KOMMT ZU ALLEN. Die freundlich aussehende Fassung: der
   *    Begleiter jubelt auch Stephan zu, waehrend das Profil sachlich
   *    angesprochen wird. Damit sagt die Figur nichts mehr ueber das
   *    Profil aus - sie ist dann Zierde, und Zierde veraltet. */
  { n:'die Figur steht auch im Lob der Eltern', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"  const wer = ton().feier ? figur(fastText ? 'staunt' : 'freut', 32) : '';",
    ersatz:"  const wer = figur(fastText ? 'staunt' : 'freut', 32); "
      + "// Anker: const wer = ton().feier ? figur(fastText ? 'staunt' : 'freut', 32) : '';",
    an:{ ...DIST, text:"const wer = figur(fastText ? 'staunt' : 'freut', 32); // Anker:" },
    sagt:'auch bei Stephan steht eine Figur' },

  /* --- Was zurueckkommt (N4) --------------------------------------------
   *
   * Das Zeichen im Kopf sagt „die kennst du schon - die kommt noch mal".
   * Es kann auf zwei Arten kaputtgehen, und beide sind still.
   *
   * 1. ES KOMMT NIE. Dann arbeitet der Kasten wieder unsichtbar, und die
   *    eine Sache, die ihn besser macht als eine Zufallsliste, merkt
   *    niemand. Der Bildschirm bleibt vollstaendig heil. */
  { n:'das Wiedersehen-Zeichen kommt nie', tor:'spielprobe',
    datei:'src/kern/leitner.js',
    such:"  return !!e && (e.falsch ?? 0) > 0 && (e.fach ?? 1) < 3;",
    ersatz:"  return false; // Anker: return !!e && (e.falsch ?? 0) > 0 && (e.fach ?? 1) < 3;",
    an:{ datei:'src/kern/leitner.js', text:'return false; // Anker: return !!e' },
    sagt:'dann bleibt der Kasten unsichtbar' },

  /* 2. ES KOMMT IMMER. Die freundlichere und schlimmere Fassung: das
   *    Zeichen steht an jeder Aufgabe, auch an der, die zum ersten Mal
   *    gefragt wird. Damit ist es kein Hinweis mehr, sondern ein
   *    taeglicher Vorwurf - und es sieht dabei aus, als funktioniere es. */
  { n:'das Wiedersehen-Zeichen steht an jeder Aufgabe', tor:'spielprobe',
    datei:'src/kern/leitner.js',
    such:"export const kommtZurueck = (stand, id) => {",
    ersatz:"export const kommtZurueck = (stand, id) => { if (true) return true;",
    an:{ datei:'src/kern/leitner.js', text:'{ if (true) return true;' },
    sagt:'ein Vorwurf ohne Anlass' },

  /* --- Der Aufkleber-Satz im Ton des Profils (N3-Fund) ------------------
   *
   * EIN ALTER FEHLER, den der Bogen freigelegt hat. „ Neuer Aufkleber!"
   * stand an ACHT Stellen fest im Quelltext - mit Ausrufezeichen, auch
   * fuer die Profile, die sachlich angesprochen werden. Das Tor prueft
   * seit langem „das Lob ruft nicht", und es hat den Fehler nie gesehen:
   * die Eltern bekamen im geprueften Durchgang einfach nie einen neuen
   * Aufkleber. Erst die neue Reihenfolge hat sie einen bekommen lassen.
   *
   * Das ist die Sorte Luecke, gegen die eine Gegenprobe da ist: das Tor
   * war richtig, seine Frage war richtig, und trotzdem kam der Fall nie
   * vor. Der Eingriff setzt das Ausrufezeichen zurueck in den sachlichen
   * Ton - dann muss es auffallen. */
  { n:'der Aufkleber-Satz ruft auch im sachlichen Ton', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"    kleberSagt: ' Neuer Aufkleber.',",
    ersatz:"    kleberSagt: ' Neuer Aufkleber!', // Anker: kleberSagt: ' Neuer Aufkleber.',",
    an:{ ...DIST, text:"kleberSagt: ' Neuer Aufkleber!', // Anker" },
    sagt:'das Lob ruft' },

  /* --- Der Bogen der Sitzung (N3) ---------------------------------------
   *
   * Drei Zusagen, und alle drei gehen leise kaputt: die Runde laeuft in
   * jedem Fall durch, sie fuehlt sich nur an wie vorher.
   *
   * 1. DER BOGEN WIRD GAR NICHT ANGEWENDET. Der billigste Verfall
   *    ueberhaupt - eine Zeile, die die fertige Liste durchreicht statt
   *    sie zu ordnen. Nichts wird falsch, nichts wird rot, und die
   *    Reihenfolge ist wieder die von vorher. */
  { n:'der Bogen wird auf die Liste gar nicht angewendet', tor:'spielprobe',
    datei:'src/kern/leitner.js',
    such:"  const leicht = nachHaerte.slice(0, 2).map(x => x.g);",
    ersatz:"  return liste; // Anker: const leicht = nachHaerte.slice(0, 2).map(x => x.g);\n"
      + "  const leicht = nachHaerte.slice(0, 2).map(x => x.g);",
    an:{ datei:'src/kern/leitner.js', text:'return liste; // Anker: const leicht' },
    sagt:'statt mit den zwei leichtesten' },

  /* 2. DIE KNACKNUSS FEHLT. Der Anfang stimmt, das Ende nicht - und
   *    genau das ist der Fall, den eine Probe auf „faengt leicht an"
   *    allein durchlassen wuerde. Der Eingriff haengt die schwerste
   *    wieder in die Mitte. */
  { n:'die schwerste Aufgabe steht nicht mehr am Ende', tor:'spielprobe',
    datei:'src/kern/leitner.js',
    such:"  return [...leicht, ...mitte, schwerste];",
    ersatz:"  return [...leicht, schwerste, ...mitte]; // Anker: return [...leicht, ...mitte, schwerste];",
    an:{ datei:'src/kern/leitner.js', text:'return [...leicht, schwerste, ...mitte];' },
    sagt:'hoert nur auf' },

  /* 3. ER VERLIERT EINE AUFGABE. Die gefaehrlichste Fassung: die Runde
   *    ist danach um eine kuerzer, das Fortschrittsband hat ein Feld
   *    weniger, und es sieht aus wie eine kurze Runde statt wie ein
   *    Fehler. Der Eingriff laesst die Mitte den Ueberschneidungstest
   *    weg. */
  { n:'der Bogen verliert eine Aufgabe', tor:'spielprobe',
    datei:'src/kern/leitner.js',
    such:"  const mitte = liste.filter(g => !leicht.includes(g) && g !== schwerste);",
    ersatz:"  const mitte = liste.filter(g => !leicht.includes(g) && g !== schwerste).slice(1);"
      + " // Anker: const mitte = liste.filter(g => !leicht.includes(g) && g !== schwerste);",
    an:{ datei:'src/kern/leitner.js', text:'g !== schwerste).slice(1);' },
    sagt:'er darf umordnen, nicht verlieren' },

  /* --- Das Tagesziel (N2) -----------------------------------------------
   *
   * 1. GESTERN ZAEHLT MIT. Das ist die Verfallsart, die still ist: sie
   *    faellt nur an einem Datumswechsel auf, und den erlebt kein
   *    Testlauf von selbst. Faellt der Datumsvergleich weg, wird aus dem
   *    Tagesziel eine Summe - und die steht nach einer Woche dauerhaft
   *    auf drei, also sagt sie nie wieder etwas. */
  { n:'das Tagesziel zählt gestrige Sterne mit', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"  return (e && e.tag === heute()) ? Math.min(e.zahl || 0, TAGESZIEL) : 0;",
    ersatz:"  return e ? Math.min(e.zahl || 0, TAGESZIEL) : 0; "
      + "// Anker: return (e && e.tag === heute()) ? Math.min(e.zahl || 0, TAGESZIEL) : 0;",
    an:{ ...DIST, text:'return e ? Math.min(e.zahl || 0, TAGESZIEL) : 0;' },
    sagt:'sondern eine Summe' },

  /* 2. DIE ELTERN BEKOMMEN EINS. Drei leere Sterne unter „Stephan" sind
   *    eine Aufforderung, um die niemand gebeten hat - und sie stuenden
   *    da, ohne dass irgendetwas kaputt waere. */
  { n:'auch die Eltern bekommen ein Tagesziel', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"const istKind = (p) => !!(p && p.alter);",
    ersatz:"const istKind = (p) => !!p; // Anker: const istKind = (p) => !!(p && p.alter);",
    an:{ ...DIST, text:'const istKind = (p) => !!p;' },
    sagt:'um die niemand gebeten hat' },

  /* --- Die Serie (N1) ---------------------------------------------------
   *
   * Zwei Zusagen, und beide gehen leise kaputt - der Bildschirm bleibt in
   * beiden Faellen vollstaendig heil, es fehlt nur der Moment.
   *
   * 1. EIN FEHLER LOESCHT SIE. Das ist die ganze Spannung: die Serie ist
   *    etwas wert, WEIL man sie verlieren kann. Bleibt sie stehen, ist sie
   *    eine Zierde.
   *
   *    Der Eingriff setzt den Bruch ausser Kraft. Er sitzt in `klangZu`,
   *    weil das die einzige Stelle ist, die JEDE Antwort passiert - auch
   *    die falsche, nach der man es noch einmal versuchen darf. `werten`
   *    laeuft dort nicht, und genau daran ist der erste Anlauf
   *    gescheitert. */
  { n:'ein Fehler löscht die Serie nicht mehr', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"  if (ergebnis === 'falsch' && Sitzung && Sitzung.serie) { Sitzung.serie = 0; serieZeigen(); }",
    ersatz:"  if (false) { Sitzung.serie = 0; serieZeigen(); } "
      + "// Anker: if (ergebnis === 'falsch' && Sitzung && Sitzung.serie) { Sitzung.serie = 0; serieZeigen(); }",
    an:{ ...DIST, text:'if (false) { Sitzung.serie = 0;' },
    sagt:'löscht die Serie nicht' },

  /* 2. SIE ERSCHEINT ERST AB DREI. Bei zwei richtigen ist noch nichts
   *    passiert - das kann jedem unterlaufen. Eine Anzeige, die fast
   *    immer dasteht, sagt nichts mehr, und der Moment des Auftauchens
   *    IST die Belohnung.
   *
   *    Der Eingriff laesst sie ab der ersten erscheinen. */
  { n:'die Serie erscheint schon nach der ersten richtigen Antwort', tor:'smoke',
    args:['--nur=regler'], bauen:true, datei:D,
    such:"const SERIE_AB = 3;",
    ersatz:"const SERIE_AB = 1; // Anker: const SERIE_AB = 3;",
    an:{ ...DIST, text:'const SERIE_AB = 1;' },
    sagt:'richtigen Antworten da' },

  /* --- Die Farben der Bilder (E7b) --------------------------------------
   *
   * Zwei Zusagen, und beide gehen leise kaputt - das Bild wird dabei
   * nicht falsch, es wird nur wieder das, was es vorher war: eine
   * schwarze Silhouette. Genau das war der Anlass der Runde.
   *
   * 1. EIN FARBNAME, DEN ES NICHT GIBT. `bildSvg` faellt dann auf Tinte
   *    zurueck - mit Absicht, denn ein Bild ohne `fill` waere schwarz und
   *    ein Bild mit `fill="undefined"` unsichtbar. Der Rueckfall ist
   *    richtig und macht den Tippfehler unsichtbar; deshalb muss ihn das
   *    Tor sagen. */
  { n:'eine Zeichnung nennt eine Farbe, die es nicht gibt', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"    { f:'braun',      d:'M28 40h8v20h-8Z' },",
    ersatz:"    { f:'braunn',     d:'M28 40h8v20h-8Z' },",
    an:{ datei:'src/inhalt/englisch.js', text:"f:'braunn'," },
    sagt:'steht nicht in BILDFARBEN' },

  /* 2. EIN BILD WIRD WIEDER EINFARBIG. Drei Baelle in drei Farben sind
   *    „three"; drei Baelle in einer Farbe sind ein Muster. Der Eingriff
   *    macht genau das - und auf dem Bildschirm sieht es aus wie eine
   *    Gestaltungsentscheidung. */
  { n:'eine Zeichnung ist wieder einfarbig', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"    { f:'blau', d:'M17 36a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },\n"
      + "    { f:'gelb', d:'M47 36a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },",
    ersatz:"    { f:'rot', d:'M17 36a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },\n"
      + "    { f:'rot', d:'M47 36a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z' },",
    /* BEIDE Baelle, nicht einer: bliebe der gelbe stehen, haette `three`
       noch zwei Farben und die Probe bewiese nichts. */
    an:{ datei:'src/inhalt/englisch.js', text:"{ f:'rot', d:'M17 36a11" },
    sagt:'ist sie wieder eine Silhouette' },

  /* 3. ZWEI ZEICHNUNGEN SEHEN EINANDER ZU AEHNLICH. Das ist die Sorte
   *    Fehler, die keine Zeile falsch macht: die Pflaume bekommt die
   *    Farbe der Tomate, und alles bleibt gueltig - der Pfad stimmt, die
   *    Farbe steht in BILDFARBEN, das Bild fuellt seinen Rahmen. Nur
   *    steht jetzt neben dem Apfel eine zweite rote Kugel mit gruenem
   *    Zipfel, und wer beim Wort „apple" auf die Pflaume tippt, bekommt
   *    gesagt, er habe sich geirrt.
   *
   *    BEIDE Flaechen, nicht eine: bliebe die dunkle lila, waere das Bild
   *    zweifarbig-fremd und der Zellvergleich faende es nicht - die Probe
   *    bewiese dann nichts. Gemessen mit dem Eingriff: 68 % gegen
   *    „apple", 66 % gegen „tomato", Grenze 65 %. Drei Punkte Abstand -
   *    wer die Grenze anfasst, muss hier nachmessen. */
  { n:'zwei englische Zeichnungen sehen einander zu ähnlich', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"      { f:'lila',   d:'M32 16c10 0 18 9 18 20s-8 22-18 22-18-11-18-22 8-20 18-20Z' },\n"
      + "      { f:'lilaDunkel', d:'M38 18c7 4 12 11 12 18 0 11-8 22-18 22 8-4 14-13 14-22 0-7-3-13-8-18Z' },",
    ersatz:"      { f:'rot',   d:'M32 16c10 0 18 9 18 20s-8 22-18 22-18-11-18-22 8-20 18-20Z' },\n"
      + "      { f:'rotDunkel', d:'M38 18c7 4 12 11 12 18 0 11-8 22-18 22 8-4 14-13 14-22 0-7-3-13-8-18Z' },",
    an:{ datei:'src/inhalt/englisch.js', text:"{ f:'rot',   d:'M32 16c10" },
    sagt:'zellgleich' },

  /* 4. DER ZELLVERGLEICH FUELLT NICHTS MEHR. Die gefaehrlichste Fassung
   *    des Werkzeugs aus 3: eines, das laeuft, eine Zahl meldet und
   *    nichts geprueft hat. Ein leeres Raster gibt fuer JEDES Paar 0 %,
   *    und 0 % liegt unter jeder Grenze - der Bericht schreibt dann
   *    „ähnlichstes Paar 0 %" und sieht aus wie ein besonders gutes
   *    Ergebnis. Deshalb hat die Rechnung eine Selbstprobe an vier
   *    Faellen, deren Ausgang ohne sie feststeht (Regel 1: was nie etwas
   *    meldet, ist kein Beweis). */
  { n:'der Zellvergleich der Bilder füllt nichts mehr', tor:'inhalt',
    deckt:'englisch', datei:'tor/inhalt.mjs',
    such:"              if (x >= xs[k] && x <= xs[k + 1]) feld[r * N_RASTER + c] = st.f;",
    ersatz:"              if (false && x >= xs[k] && x <= xs[k + 1]) feld[r * N_RASTER + c] = st.f;",
    an:{ datei:'tor/inhalt.mjs', text:'if (false && x >= xs[k]' },
    sagt:'die gefüllte Fläche des vollen Rahmens' },

  /* 5. EIN WORT IST WEDER GEZEICHNET NOCH BEGRUENDET. „pet" und „little"
   *    haben mit Absicht kein Bild, und der Grund steht als `ohneBild` im
   *    Datensatz. Faellt der Schluessel weg, sieht das Wort aus wie ein
   *    vergessenes - und die Zaehlung „84 von 86" liest sich wieder wie
   *    zwei offene Posten. Der Eingriff benennt den Schluessel nur um;
   *    der Text bleibt stehen, damit die Probe nicht ihren eigenen Anker
   *    loescht. */
  { n:'ein Wort im Bildplan ist weder gezeichnet noch begründet', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"    ohneBild: '„pet\" ist eine Sammelbezeichnung, und jedes Bild dafuer waere '",
    ersatz:"    /* Anker der Gegenprobe: ohneBild: '„pet\" ist eine Sammelbezeichnung, und jedes Bild dafuer waere ' */\n"
      + "    ohneBildX: '„pet\" ist eine Sammelbezeichnung, und jedes Bild dafuer waere '",
    an:{ datei:'src/inhalt/englisch.js', text:'ohneBildX:' },
    sagt:'weder eine Zeichnung noch ein' },

  /* 6. DER VERGLEICH ZAEHLT WIEDER NAMEN STATT TOENE. Das war der erste
   *    Anlauf, und er ging still daneben: `rot` und `rotDunkel` liegen
   *    15,6 CIELAB auseinander - nebeneinander dieselbe rote Flaeche, fuer
   *    eine Namensgleichheit aber zwei verschiedene Dinge. Ein Bild, das
   *    ein anderes nur heller nachzeichnet, kam so durch, und die Zahl im
   *    Bericht sah dabei besser aus als vorher.
   *
   *    Der Eingriff setzt die Tongrenze auf null; damit ist „derselbe Ton"
   *    wieder „derselbe Name". Anschlagen muessen die drei Faelle der
   *    Selbstprobe, die genau das pruefen - ohne sie waere ein Vergleich,
   *    der wieder nur Namen zaehlt, von aussen nicht zu unterscheiden. */
  { n:'der Bildvergleich zählt wieder Namen statt Töne', tor:'inhalt',
    deckt:'englisch', datei:'tor/inhalt.mjs',
    such:"    const TON_GLEICH = 22;",
    ersatz:"    const TON_GLEICH = 0; // Anker: const TON_GLEICH = 22;",
    an:{ datei:'tor/inhalt.mjs', text:'const TON_GLEICH = 0;' },
    sagt:'in einem helleren Ton derselben Farbe' },

  /* 7. ZWEI LAUTKARTEN SEHEN GLEICH AUS. Fionas Lautschirm zeigt genau
   *    ZWEI Karten, und sie liest nicht - das Bild IST die Antwort.
   *    Gleichen sich die beiden, ist die Hoeraufgabe eine Muenze, und sie
   *    sieht dabei aus wie eine, die funktioniert.
   *
   *    Der Eingriff gibt dem Stift die Flaechen der Pfanne, mitsamt ihren
   *    Farben bis auf eine - die Sorte Fehler, die beim Kopieren eines
   *    Blocks entsteht. Eine Farbe muss anders bleiben, sonst faengt es
   *    die aeltere Zusage „zeigt zweimal dieselbe Zeichnung" ab, und die
   *    Probe bewiese etwas anderes als das Aufgeschriebene. Gemessen:
   *    96 % zellgleich, Grenze 30 %. */
  { n:'zwei gemalte Lautkarten sehen einander zu ähnlich', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"  pen: [\n"
      + "    { f:'gruen',      d:'M25 4h14v32H25Z' },\n"
      + "    { f:'gruenDunkel',d:'M33 4h6v32h-6Z' },\n"
      + "    { f:'grauDunkel', d:'M39 10h6v16h-6Z' },\n"
      + "    { f:'grau',       d:'M25 38h14l-7 12Z' },\n"
      + "    { f:'tinte',      d:'M30 46h4l-2 12Z' },\n"
      + "  ],",
    ersatz:"  pen: [\n"
      + "    { f:'braunDunkel',d:'M42 26h20v7H42Z' },\n"
      + "    { f:'grauDunkel', d:'M8 22h34v11c0 8-6 14-14 14h-6c-8 0-14-6-14-14Z' },\n"
      + "    { f:'grau',       d:'M13 26h24v7c0 5-4 9-9 9h-6c-5 0-9-4-9-9Z' },\n"
      + "    { f:'gruen',      d:'M16 28c1 5 4 9 8 11-6-1-10-6-10-11Z' },\n"
      + "  ],",
    an:{ datei:'src/inhalt/englisch.js', text:"pen: [\n    { f:'braunDunkel'" },
    sagt:'zellgleich sind' },

  /* 8. UND DIESELBE ZEICHNUNG, NUR UMGEFAERBT. Der Zellvergleich aus 7
   *    sagt dazu NULL Prozent - keine Zelle traegt denselben Ton, obwohl
   *    beide Karten dasselbe Ding zeigen. Genau dafuer steht die
   *    Silhouette daneben, und sie hat eine viel hoehere Grenze: als Mass
   *    fuer „aehnlich" taugt sie nicht („cab" und „cap" decken sich zu
   *    60 % und sind unverwechselbar), als Mass fuer „kopiert" schon.
   *
   *    Der Eingriff gibt dem Stift die Flaechen der Pfanne und laesst ihm
   *    EIGENE Farben. Gemessen: 100 % Deckung bei niedriger
   *    Zellgleichheit - es schlaegt also die Zusage an, die gemeint ist,
   *    und nicht die aus 7. */
  { n:'ein Lautpaar zeigt dieselbe Zeichnung in zwei Farben', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    /* Der Eingriff sitzt auf der PFANNE und nicht auf dem Stift: Probe 7
       nimmt den Stift-Block als Anker, und zwei Anker, von denen einer im
       anderen steckt, verstellen einander. */
    such:"  pan: [\n"
      + "    { f:'braunDunkel',d:'M42 26h20v7H42Z' },\n"
      + "    { f:'grauDunkel', d:'M8 22h34v11c0 8-6 14-14 14h-6c-8 0-14-6-14-14Z' },\n"
      + "    { f:'grau',       d:'M13 26h24v7c0 5-4 9-9 9h-6c-5 0-9-4-9-9Z' },\n"
      + "    { f:'licht',      d:'M16 28c1 5 4 9 8 11-6-1-10-6-10-11Z' },\n"
      + "  ],",
    /* Die Flaechen des Stifts, aber in EIGENEN Farben - und zwar in
       welchen, die von denen des Stifts weit weg liegen. Naehmen beide
       dieselben Toene, schluege auch die Zusage aus 7 an, und die Probe
       bewiese nicht die, die daneben steht. */
    ersatz:"  pan: [\n"
      + "    { f:'rot',        d:'M25 4h14v32H25Z' },\n"
      + "    { f:'rotDunkel',  d:'M33 4h6v32h-6Z' },\n"
      + "    { f:'gelb',       d:'M39 10h6v16h-6Z' },\n"
      + "    { f:'gelbDunkel', d:'M25 38h14l-7 12Z' },\n"
      + "    { f:'blau',       d:'M30 46h4l-2 12Z' },\n"
      + "  ],",
    an:{ datei:'src/inhalt/englisch.js', text:"pan: [\n    { f:'rot',        d:'M25 4h14v32H25Z'" },
    sagt:'decken (Grenze' },

  /* 9. DIE ZWEITE FANGBEDINGUNG - und diese Probe holt einen ECHTEN
   *    Fehler zurueck. Bis zu dieser Runde war „shirt" blau wie „jeans",
   *    zwei blaue Kleidungsstuecke nebeneinander: 60 % zellgleich bei
   *    81 % Deckung. Die alte Grenze (65 % zellgleich) haette das
   *    durchgelassen - sie hat es durchgelassen, drei Fassungen lang.
   *
   *    Der Eingriff faerbt das Hemd zurueck. Anschlagen muss die
   *    Meldung „beides zusammen ueber der Grenze"; kaeme stattdessen die
   *    alte, wuerde die Probe die alte Zusage bezeugen und die neue nicht. */
  { n:'zwei Zeichnungen reissen beide Grenzen zusammen', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"      { f:'gruen',       d:'M22 10h20l14 8-6 13-6-3v28H20V28l-6 3-6-13Z' },\n"
      + "      { f:'gruenDunkel', d:'M42 10l14 8-6 13-6-3v28h-8V10Z' },",
    ersatz:"      { f:'blau',        d:'M22 10h20l14 8-6 13-6-3v28H20V28l-6 3-6-13Z' },\n"
      + "      { f:'blauDunkel',  d:'M42 10l14 8-6 13-6-3v28h-8V10Z' },",
    an:{ datei:'src/inhalt/englisch.js', text:"{ f:'blau',        d:'M22 10h20l14 8" },
    sagt:'beides zusammen über der Grenze' },

  /* 10. DIESELBE ZEICHNUNG IN ANDEREN FARBEN. Der Zellvergleich findet
   *     sie NICHT - er zaehlt Zellen mit gleichem Ton, und davon hat eine
   *     umgefaerbte Kopie keine einzige.
   *
   *     Geprueft wird sie deshalb EXAKT und nicht ueber einen Schwellwert.
   *     Nachgemessen: neun Paare liegen heute ueber 90 % Deckung, und
   *     jedes ist in Ordnung - „happy", „sad", „o‘clock" und „football"
   *     sind alle derselbe Kreis, die Flaggen fuellen beide den Rahmen.
   *     Auch die Rahmenfuellung trennt sie nicht (34 bis 58 %, Median 38).
   *     Was eine Kopie ausmacht, sind dieselben PFADE, und das ist eine
   *     Aussage und keine Schaetzung.
   *
   *     Der Eingriff gibt dem Wasserglas die Flaechen der Erdbeere in
   *     fuenf anderen Farben - die Sorte Fehler, die beim Kopieren eines
   *     Blocks und Umfaerben entsteht. */
  { n:'zwei englische Wörter teilen sich eine umgefärbte Zeichnung', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"      { f:'grau',       d:'M14 12h36l-4 42a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6Z' },\n"
      + "      { f:'blau',       d:'M17 30h30l-2 24a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4Z' },\n"
      + "      { f:'blauDunkel', d:'M17 30h30l-1 6H18Z' },\n"
      + "      { f:'licht',      d:'M22 16h4l2 38h-4Z' },",
    ersatz:"      { f:'gruen', d:'M32 8c1 4 1 7 1 9h-2c0-2 0-5 1-9Z' },\n"
      + "      { f:'gruenDunkel', d:'M32 20c-6-8-14-8-19-6 2 6 8 10 14 10h10c6 0 12-4 14-10-5-2-13-2-19 6Z' },\n"
      + "      { f:'gelb', d:'M32 24c9 0 17 5 17 12 0 9-9 20-17 24-8-4-17-15-17-24 0-7 8-12 17-12Z' },\n"
      + "      { f:'blau', d:'M38 25c7 2 11 6 11 11 0 9-9 20-17 24 6-6 12-15 12-22 0-5-2-10-6-13Z' },\n"
      + "      { f:'rot', d:'M25 34a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm15 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },",
    an:{ datei:'src/inhalt/englisch.js', text:"{ f:'gruen', d:'M32 8c1 4 1 7 1 9h-2c0-2 0-5 1-9Z' }" },
    sagt:'dieselbe Zeichnung in anderen Farben' },

  /* 11. DIE EICHUNG WIRD VERSCHOBEN. Die Grenzen stehen auf drei Fallen
   *     und neunzehn beurteilten harmlosen Paaren; wer eine der Zahlen
   *     anfasst, faellt aus dieser Eichung heraus. Der Eingriff hebt die
   *     Deckungsgrenze von 75 auf 85 - damit sind zwei der drei Fallen
   *     nicht mehr gefangen, und die Tabelle in `tor/bildurteile.mjs`
   *     sagt es.
   *
   *     DIESE PROBE HAT SICH SELBST GEBRAUCHT: der erste Anlauf hat die
   *     Nachrechnung HINTER den Ausstieg gesetzt, der bei gefuellter
   *     Fehlerliste abbricht. Sie schrieb damit in eine Liste, die
   *     niemand mehr liest - eine Pruefung, die nicht anschlagen KANN,
   *     und zwar ausgerechnet die, die das Anschlagen der anderen
   *     sichert. Aufgefallen ist es nur, weil diese Probe stumm blieb. */
  { n:'die Eichung der Bildgrenzen wird verschoben', tor:'inhalt',
    deckt:'englisch', datei:'tor/inhalt.mjs',
    such:"    const GLEICH_ENG = 0.55, DECKUNG_ENG = 0.75;",
    ersatz:"    const GLEICH_ENG = 0.55, DECKUNG_ENG = 0.85; "
      + "// Anker: const GLEICH_ENG = 0.55, DECKUNG_ENG = 0.75;",
    an:{ datei:'tor/inhalt.mjs', text:'DECKUNG_ENG = 0.85;' },
    sagt:'beurteilt ist es als falle' },

  /* 12. EINE VERSCHOBENE KOPIE. Der Abdruck findet nur die exakte, das
   *     Raster gar keine - eine um zwei Punkte verschobene Erdbeere kommt
   *     auf 73 % Flaechenuebereinstimmung, „happy" gegen „sad" auf 92 %.
   *     Drei Prozent Versatz sind in einem 24x24-Raster schon eine halbe
   *     Zelle.
   *
   *     Gemessen wird deshalb an der BAUART der Pfade: gleiche
   *     Befehlsfolge, gleiche Anzahl Zahlen, und alle Zahlen dicht
   *     beieinander. Im ganzen Vorrat sind nur vier von 3486 Paaren
   *     ueberhaupt gleich gebaut, alle vier auf dem Blatt „Wo?", wo es
   *     die Lehre ist - ihr kleinster Abstand ist 10, die Grenze 5.
   *
   *     Der Eingriff gibt dem Salat die Pfade der Tomate, um DREI Punkte
   *     verschoben und in vier anderen Farben. */
  { n:'zwei englische Wörter teilen sich eine verschobene Zeichnung', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"      { f:'gruen',  d:'M14 34c-4-8 2-15 9-13-1-7 9-11 13-6 5-4 13 0 12 6 7 2 8 9 4 13Z' },\n"
      + "      { f:'gruenDunkel', d:'M40 21c6 2 7 9 3 13h-9c4-3 7-8 6-13Z' },\n"
      + "      { f:'rot',    d:'M22 24a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm22 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },\n"
      + "      { f:'licht',  d:'M6 34h52c0 13-11 22-26 22S6 47 6 34Z' },\n"
      + "      { f:'wolke',  d:'M6 34h52v5H6Z' },",
    ersatz:"      { f:'gruen', d:'M35 20c12 0 21 8 21 18s-9 18-21 18-21-8-21-18 9-18 21-18Z' },\n"
      + "      { f:'gruenDunkel', d:'M43 22c8 3 13 9 13 16 0 9-9 18-21 18 12-2 19-9 19-18 0-7-4-13-11-16Z' },\n"
      + "      { f:'licht', d:'M35 12c1 0 2 2 2 5l7-3-2 6 8 1-8 4 3 5-8-2-2 6-3-6-8 2 3-5-8-4 8-1-2-6 7 3c0-3 1-5 3-5Z' },\n"
      + "      { f:'wolke', d:'M22 32c2-4 6-6 10-6 2 0 2 3 0 3-4 1-6 2-8 5-1 2-3 0-2-2Z' },",
    an:{ datei:'src/inhalt/englisch.js', text:"{ f:'gruen', d:'M35 20c12 0 21 8 21 18" },
    sagt:'gleich gebaut und liegen nur' },

  /* --- „Lies das Wort" (E7) --------------------------------------------
   *
   * Die Ebene ist die UMKEHRUNG von „Hoeren und zeigen", und alles, was
   * an ihr kaputtgehen kann, geht leise kaputt: der Bildschirm bleibt in
   * jedem dieser sechs Faelle vollstaendig heil.
   *
   * 1. DAS WORT WIRD DOCH VORGELESEN. Dann ist es wieder eine
   *    Hoeraufgabe, und niemand sieht den Unterschied - es steht ja
   *    trotzdem da. Geprueft wird VOR dem Tipp: nach der Antwort wird es
   *    sehr wohl gesagt, das ist die Bestaetigung und nicht die Frage. */
  { n:'beim Lesen wird das Wort doch vorgelesen', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  if (!liest) {\n    vorlesen(ziel.wort, 'en');",
    ersatz:"  if (true) { //Anker:  if (!liest) {\n    vorlesen(ziel.wort, 'en');",
    an:{ ...DIST, text:'if (true) { //Anker:  if (!liest) {' },
    sagt:'wurde vorgelesen, bevor geantwortet war' },

  /* 2. UND DIE GEGENRICHTUNG: das Wort steht gar nicht mehr da. `liest`
   *    ist die eine Zeile, an der die ganze Ebene haengt; faellt sie aus,
   *    wird die Frage zu „Tippe auf das Bild, das du hoerst" - vier
   *    Zeichnungen und nichts zu lesen. */
  { n:'beim Lesen steht das Wort nicht mehr in der Frage', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  const liest = String(st.ebeneId).endsWith(':lesen');",
    ersatz:"  const liest = false; // Anker: String(st.ebeneId).endsWith(':lesen')",
    an:{ ...DIST, text:'const liest = false;' },
    sagt:'steht nicht in der Frage' },

  /* 3. ZWEI WOERTER, EINE ZEICHNUNG. Ein `pfad` doppelt hingeschrieben,
   *    und zwei Karten zeigen dasselbe Bild. Eine davon ist richtig, die
   *    andere auch - und wer die falsche tippt, bekommt gesagt, er habe
   *    sich geirrt. */
  /* Seit die Bilder mehrteilig sind, ist „dieselbe Zeichnung" die ganze
     Liste und nicht ein Pfad: zwei Bilder duerfen sich einen Kreis teilen,
     nur nicht alles. Der Eingriff gibt dem Kaese die Flaechen des Brotes -
     die Sorte Fehler, die beim Kopieren einer Zeile entsteht. */
  { n:'zwei englische Wörter teilen sich eine Zeichnung', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"      { f:'gelb',       d:'M6 46 50 16c5 3 8 9 8 15v15Z' },\n"
      + "      { f:'gelbDunkel', d:'M6 46h52v6H6Z' },\n"
      + "      { f:'creme',      d:'M22 40a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm18-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z' },",
    /* Das EI und nicht das Brot: die Flaechen des Brotes sind der Anker
       der Probe „eine Zeichnung laeuft aus ihrem Rahmen", und ein
       Suchtext, der nach dem Eingriff zweimal dasteht, macht `inhalt`
       aus einem anderen Grund rot. Gemeldet vom Laeufer, beim ersten
       Lauf dieser Probe. */
    ersatz:"      { f:'wolke',      d:'M14 34c0-11 8-20 18-20 4 0 8 2 11 2 8 0 13 5 13 11 0 5-3 8-6 10 1 7-5 12-11 12-5 0-8-2-10-6-7 2-15-2-15-9Z' },\n"
      + "      { f:'gelb',       d:'M32 24a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z' },\n"
      + "      { f:'gelbDunkel', d:'M36 25c4 2 6 5 6 9 0 5-4 9-10 10 4-2 7-6 7-10 0-3-1-6-3-9Z' },",
    an:{ datei:'src/inhalt/englisch.js', fehlt:"M6 46 50 16c5 3 8 9 8 15v15Z" },
    sagt:'sind dieselbe Zeichnung' },

  /* 4. EINE ZEICHNUNG LAEUFT AUS DEM RAHMEN. `<svg>` schneidet an seinem
   *    viewBox ab - was draussen liegt, ist einfach weg, und ein halbes
   *    Brot sieht aus wie ein Entwurf. Der Eingriff schiebt es um dreissig
   *    Punkte nach unten, das ist knapp die Haelfte. */
  { n:'eine Zeichnung läuft aus ihrem Rahmen', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"      { f:'braun',      d:'M8 38c0-13 11-22 24-22s24 9 24 22v10a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z' },",
    ersatz:"      { f:'braun',      d:'M8 68c0-13 11-22 24-22s24 9 24 22v10a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z' },",
    an:{ datei:'src/inhalt/englisch.js', text:"d:'M8 68c0-13" },
    sagt:'ausserhalb des Rahmens' },

  /* 5. UND DAS TOR SELBST: die Rahmenrechnung verliert die Spiegelung,
   *    die `s` ausmacht. Danach misst sie sechs der sechzehn Zeichnungen
   *    falsch - und meldet trotzdem eine Zahl. Genau das ist die Sorte
   *    Verfall, gegen die die Selbstprobe an den drei bekannten Rahmen
   *    steht: eine Pruefung, die nie etwas meldet, ist kein Beweis
   *    (Regel 1). Der Eingriff sitzt im TOR, nicht in der App. */
  { n:'die Rahmenrechnung verliert ihre Spiegelung', tor:'inhalt',
    deckt:'englisch', datei:'tor/inhalt.mjs',
    such:"          const s1x = lcx === null ? x : 2 * x - lcx, s1y = lcy === null ? y : 2 * y - lcy;",
    ersatz:"          const s1x = x, s1y = y; // Anker: lcx === null ? x : 2 * x - lcx",
    an:{ datei:'tor/inhalt.mjs', text:'const s1x = x, s1y = y;' },
    sagt:'die Rahmenrechnung misst' },

  /* 6. DIE ABLENKER BEIM LESEN KOMMEN AUS DEM HOERVORRAT. Dann stuenden
   *    drei Farbflecke neben einem Apfel, und die Aufgabe waere „welches
   *    ist kein Fleck?" - ohne ein Wort Englisch zu loesen. Die Weiche ist
   *    eine Zeile, und sie kippt lautlos um. */
  { n:'die Ablenker beim Lesen kommen aus dem Hörvorrat', tor:'inhalt',
    deckt:'englisch', datei:'src/inhalt/englisch.js',
    such:"  const topf = ziel.sorte === 'bild' ? vorratLesen() : vorratHoeren();",
    ersatz:"  const topf = vorratHoeren(); // Anker: ziel.sorte === 'bild' ? vorratLesen()",
    an:{ datei:'src/inhalt/englisch.js', text:'const topf = vorratHoeren();' },
    sagt:'Ablenker statt drei' },

  /* 7. UND DIE MESSSTELLE IN `passt`: die vier Englischkarten stehen in
   *    keiner der drei Klassenlisten, mit denen `passt` misst - sie sind
   *    weder `.knopf` noch `.etikett`. Bis E7 hat das niemandem gefehlt,
   *    weil ein Farbfleck klein ist; mit einer 76 Punkte grossen
   *    Zeichnung darin entscheidet die Reihe ueber das kurze Querformat.
   *    Der Eingriff macht die Zeichnung breit: laeuft die Reihe dann
   *    ueber den Rand und `passt` sagt nichts, misst es die Ebene nicht.
   *    Eine Prüfung, die nie etwas meldet, ist kein Beweis (Regel 1) -
   *    wer eine Wirkung misst, schaltet sie zuerst ab. */
  { n:'die Englischkarten laufen über den Rand', tor:'passt', bauen:true, datei:V,
    /* Der Eingriff macht die KARTE breit und nicht die Zeichnung darin.
       Der erste Anlauf verbreiterte `.wortbild` auf 376 Punkte, und `passt`
       blieb gruen: `.engwahl` bricht um (`flex-wrap`), und ein SVG, das
       ueber seinen Knopf hinausragt, schneidet der Knopf ab - beides ohne
       einen einzigen Punkt ausserhalb des Fensters. Die Probe bewies damit
       nichts, und der Laeufer hat es gesagt: TOR BLEIBT GRUEN.
       900 Punkte sind mehr als die 844 des Zielgeraets, und daran hilft
       kein Umbruch: eine Karte je Zeile, und jede ragt hinaus. */
    such:'  border-radius:var(--rund-karte);min-width:124px;min-height:124px;',
    ersatz:'  border-radius:var(--rund-karte);min-width:900px;min-height:124px;',
    an:{ ...DIST, text:'min-width:900px' },
    sagt:'läuft über den Rand' },

  /* --- Die vier Satz-Abzeichen (E9b) ----------------------------------
   *
   * 1. DIE MENGE FAELLT LEER AUS. Die Saetze sind die erste Menge dieser
   *    Tafel, die nicht an einem Merkmal des Gegenstands haengt, sondern
   *    an seiner Herkunft - ein Tippfehler im Feldnamen waehlt still
   *    nichts aus, und dann gibt es die vier Abzeichen einfach nicht.
   *    Genau die Verfallsart, gegen die das Tor `abzeichen` gebaut ist;
   *    hier bekommt sie ihren Fall auf der neuen Ebene. */
  { n:'die Satz-Abzeichen wählen nichts aus', tor:'inhalt', deckt:'abzeichen', datei:A,
    such:'    waehlt: (v, g) => v.filter(x => x.gebiet === g) },',
    ersatz:'    waehlt: (v, g) => v.filter(x => x.gebiete === g) },',
    an:{ datei:A, text:'x.gebiete === g' }, sagt:'unerreichbar' },

  /* 2. DIE DOPPELUNG VERALTET. Die Gebietsnamen stehen in `abzeichen.js`
   *    ein zweites Mal, damit das Modul einfuhrfrei bleibt. Wer in der
   *    amtlichen Tafel ein Gebiet hinzufuegt oder streicht, bekaeme ohne
   *    diese Pruefung ein Abzeichen ohne Namen oder gar keines - und
   *    zwar lautlos, denn die drei uebrigen sehen heil aus. */
  { n:'die Satz-Abzeichen decken die Themengebiete nicht mehr ab',
    tor:'inhalt', deckt:'abzeichen', datei:A,
    such:"    je:['4.1','4.2','4.3','4.4'],",
    ersatz:"    je:['4.1','4.2','4.3'],",
    an:{ datei:A, text:"je:['4.1','4.2','4.3']," },
    sagt:'die amtlichen Themengebiete sind' },

  /* --- Einsprechen auf dem Flaggenschirm (F2b) ------------------------
   *
   * 1. DAS MIKROFON WIRD NICHT ANGEBAUT. Der Bildschirm bleibt heil, das
   *    Eingabefeld tut es auch, und der dritte gewuenschte Antwortweg ist
   *    schlicht weg - lautlos. */
  { n:'auf dem Flaggenschirm fehlt das Mikrofon wieder', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:"    sprachweg({ spricht: P.eingabe.includes('sprechen'),\n      werkzeug: s.querySelector('.tippfeld'),",
    ersatz:"    if (0) sprachweg({ spricht: P.eingabe.includes('sprechen'),\n      werkzeug: s.querySelector('.tippfeld'),",
    an:{ ...DIST, text:"if (0) sprachweg({" },
    sagt:'kein Mikrofon' },

  /* 2. UND DER TEURE TEIL: die Ebene benutzt `erhoert` nicht mehr richtig,
   *    sondern zaehlt jede Aeusserung mit. Damit kostet „ich habe dich
   *    nicht verstanden" einen der drei Versuche - genau der Fehler, den
   *    F14 auf der Karte behoben hat und den eine zweite Fassung des
   *    Sprachwegs mitgebracht haette. */
  { n:'nicht verstanden kostet auf dem Flaggenschirm wieder einen Versuch',
    tor:'smoke', args:['--nur=sprechen'], bauen:true, datei:D,
    such:"      if (!gehoert) return;\n    }\n    versuch++;",
    ersatz:"      if (!gehoert) gehoert = { id:'--', name:'nichts' };\n    }\n    versuch++;",
    an:{ ...DIST, text:"gehoert = { id:'--', name:'nichts' };" },
    sagt:'aufgelöst' },

  /* --- Die Verwechslungen (F3) ---------------------------------------

   * 1. EIN PAAR, DAS MAN NICHT SEHEN KANN, WIRD TROTZDEM GEFRAGT.
   *
   * Rumaenien und der Tschad unterscheiden sich in dieser Darstellung um
   * NULL Prozent - nur im Blauton, und den fasst das Raster nicht. Ohne
   * `fragbar:false` stellt die Ebene eine Frage, die kein Kind
   * beantworten kann und die es nur raten lehrt. Das Tor muss es sagen.
   */
  { n:'ein Paar, das man nicht sehen kann, wird trotzdem gefragt',
    tor:'inhalt', deckt:'flaggen', datei:'src/inhalt/flaggen.js',
    such:"  { paar:['ROU', 'TCD'], grund:'Nur der Blauton — der Tschad ist dunkler.', fragbar:false },",
    ersatz:"  { paar:['ROU', 'TCD'], grund:'Nur der Blauton — der Tschad ist dunkler.' },\n"
      + "//Anker:  { paar:['ROU', 'TCD'], grund:'Nur der Blauton — der Tschad ist dunkler.', fragbar:false },",
    an:{ datei:'src/inhalt/flaggen.js', text:"ist dunkler.' },\n//Anker:" },
    sagt:'nicht zu sehen' },

  /* 2. UND DIE GEGENRICHTUNG: `fragbar:false` als Freibrief.
   *
   * Ein Paar, das man sehr wohl unterscheiden kann, mit der Ausnahme
   * stillzustellen waere Bequemlichkeit - und dann liesse sich jede zu
   * aehnliche Zeichnung wegdefinieren, statt sie zu verbessern. Genau
   * dafuer ist der Boden nicht da. */
  { n:'die Ausnahme wird zum Freibrief', tor:'inhalt', deckt:'flaggen',
    datei:'src/inhalt/flaggen.js',
    such:"  { paar:['HND', 'NIC'], grund:'Honduras hat fünf Sterne, Nicaragua ein Dreieck.' },",
    ersatz:"  { paar:['HND', 'NIC'], grund:'Honduras hat fünf Sterne, Nicaragua ein Dreieck.', fragbar:false },\n"
      + "//Anker:  { paar:['HND', 'NIC'], grund:'Honduras hat fünf Sterne, Nicaragua ein Dreieck.' },",
    an:{ datei:'src/inhalt/flaggen.js', text:"ein Dreieck.', fragbar:false }" },
    sagt:'Freibrief' },

  /* 3. Ein Paar ohne Erklaerung.
   *
   * Der Satz „Luxemburgs Blau ist heller" IST der Inhalt dieser Ebene -
   * nicht, dass man einmal richtig geraten hat. Ohne ihn zeigt sie zwei
   * Flaggen und schweigt. */
  { n:'ein Verwechslungspaar sagt nicht, woran man es erkennt',
    tor:'inhalt', deckt:'flaggen', datei:'src/inhalt/flaggen.js',
    such:"  { paar:['NLD', 'LUX'], grund:'Luxemburgs Blau ist heller.' },",
    ersatz:"  { paar:['NLD', 'LUX'] },\n"
      + "//Anker:  { paar:['NLD', 'LUX'], grund:'Luxemburgs Blau ist heller.' },",
    an:{ datei:'src/inhalt/flaggen.js', text:"{ paar:['NLD', 'LUX'] },\n//Anker:" },
    sagt:'WORAN' },

  /* 4. Nach der Antwort bekommt nur die RICHTIGE ihren Namen.
   *
   * Wer auf Luxemburg tippt und „das ist Luxemburg" liest, hat in diesem
   * Augenblick zwei Flaggen gelernt statt einer. Nur die eigene zu
   * benennen ist die halbe Lehre - und sieht im Lauf genauso gruen aus. */
  { n:'nach der Antwort bekommt nur die richtige Flagge ihren Namen',
    tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"      if (!k || k.querySelector('.paarname')) continue;",
    ersatz:"      if (!k || k.querySelector('.paarname') || x.id !== ziel.id) continue;",
    an:{ ...DIST, text:"|| x.id !== ziel.id) continue;" },
    sagt:'halbe Lehre' },

  { n:'die Flaggenfrage wird nicht mehr angesagt', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  if (zeigen) ansagen(`${ziel.name}. Wo ist die Flagge?`);",
    ersatz:"  if (false) ansagen(`${ziel.name}. Wo ist die Flagge?`);",
    an:{ ...DIST, text:"if (false) ansagen(" },
    /* Der Rauchtest sagt „wurde nicht gesagt", nicht „vorgelesen" - und
       ein Suchwort, das die Meldung nicht enthaelt, macht aus einer
       anschlagenden Probe eine, die nichts beweist. Nachgelesen an der
       echten Meldung und nicht geraten. */
    sagt:'wurde nicht gesagt' },

  /* Die Stimme wird durch eine Beruehrung freigegeben (S1t).
   *
   * Ohne den Horcher faellt die Freigabe nirgends mehr - und auf iOS
   * bleibt die App die ganze Sitzung stumm, ohne dass ein Fehler
   * auftritt. Genau das war vom iPad gemeldet. Der Eingriff nimmt die
   * ANMELDUNG weg und laesst die Funktion stehen: so bleibt der Bau
   * gruen, und nur die Sache selbst faellt aus. */
  { n:'die Stimme wird durch keine Beruehrung mehr freigegeben', tor:'smoke',
    args:['--nur=sprechen'], bauen:true, datei:D,
    such:"for (const art of ['pointerdown', 'touchend', 'click'])\n"
      + "  addEventListener(art, stimmeEntsperren, { capture: true, passive: true });\n",
    ersatz:"/*Anker: keine Anmeldung von stimmeEntsperren*/\n",
    an:{ ...DIST, fehlt:"addEventListener(art, stimmeEntsperren" },
    sagt:'nirgends freigegeben' },

  /* --- I18: der Lohn, der nichts sagt, und der volle Endbildschirm ----- *
   *
   * Drei Proben, weil drei verschiedene Dinge kaputtgehen koennen: die
   * Rechnung (welcher Ort kommt als naechstes), der Satz auf dem Schirm,
   * und der Platz, in dem er stehen muss. */

  /* 1. Die Schwelle rechnet den faelligen Raum mit.
   *
   * Die erste Fassung tat genau das: `Math.max(1, ab - habe)` versprach
   * „noch ein Tier" fuer einen Ort, dessen Schwelle laengst erreicht war
   * und der nur noch auf seine eigenen Tiere wartet. Beim naechsten Mal
   * stand dieselbe Zeile wieder da. */
  { n:'ein Ort steht noch in Aussicht, obwohl seine Schwelle erreicht ist',
    tor:'inhalt', deckt:'tiere', datei:'src/inhalt/tiere.js',
    such:'    if (r.ab <= da.size) continue;',
    ersatz:'    if (r.ab <= da.size - 99) continue;',
    an:{ datei:'src/inhalt/tiere.js', text:'r.ab <= da.size - 99' },
    sagt:'obwohl seine Schwelle erreicht ist' },

  /* 2. Der Satz faellt aus.
   *
   * Das ist der Zustand VOR I18: eine fertige Ebene, fehlerfrei
   * gespielt, alle Tiere ihres Raumes schon im Buch - und der
   * Endbildschirm sagt nichts mehr dazu. Der Eingriff laesst den Kasten
   * stehen und nimmt nur den Satz heraus; sonst faende die Probe eine
   * fehlende Zeile statt einer leeren.
   *
   * `--teil=1/5`: die Groesse „iPhone quer, Leiste" ist die sechste von
   * sieben und faellt bei fuenf Teilen auf den zweiten. */
  { n:'die fertige Ebene sagt nicht mehr, was als naechstes zu holen ist',
    tor:'passt', args:['--teil=1/5'], bauen:true, datei:D,
    such:'  const schon = tier.schon ? `${tier.schon.titel} ist schon offen.` : \'\';',
    ersatz:'  const schon = \'\'; if (tier) return \'\';',
    an:{ ...DIST, text:"if (tier) return ''" },
    sagt:'was als nächstes' },

  /* 3. Der Bildschirm laeuft wieder ueber.
   *
   * Gemessen, bevor die Regel da war: der Hauptknopf lag 3 Punkte im
   * Wischstreifen des Telefons. Kein Vorbild zeigt diesen Zustand - die
   * Runde der Vorbilder hat sechs Aufgaben, und dort passt alles. */
  { n:'der volle Endbildschirm laeuft wieder in den Streifen des Telefons',
    tor:'passt', args:['--teil=1/5'], bauen:true, datei:V,
    such:'  .mitte:has(> .siegkopf){gap:var(--r1);padding:var(--r2) var(--r4)}',
    ersatz:'  .mitte:has(> .siegkopf){gap:var(--r3);padding:var(--r4)}',
    an:{ ...DIST, fehlt:'.mitte:has(> .siegkopf){gap:var(--r1)' },
    sagt:'im Bereich des Telefons' },

  /* --- I20: achtzehn Bilder, sechs Raeume, zwei Wandmasse ------------- *
   *
   * Der Lohn der Sammlung selbst stand bis I20 ganz oben: 35 und 42.
   * Wer bei zwoelf Tieren war, hatte dreiundzwanzig vor sich, bevor
   * ueberhaupt etwas kam, das nicht an einer Ebene hing. */

  /* 1. Die Obergrenze der Schwellen.
   *
   * Sie ist gemessen und nicht gewaehlt: `inhalt` rechnet je Profil
   * nach, wieviele Tiere aus EBENEN zu holen sind, und Raeume mit
   * Schwelle zaehlen dabei nicht mit. Das knappste Profil kommt auf 42.
   * Der Eingriff hebt eine Schwelle darueber - dann waere der Raum fuer
   * Lea im Buch der naechste Ort und nie zu erreichen. */
  { n:'ein Raum oeffnet sich erst hinter der Reichweite des Profils',
    tor:'inhalt', deckt:'tiere', datei:'src/inhalt/tiere.js',
    such:"  { ab: 38,                           titel:'Ein Abend aus',",
    ersatz:"  { ab: 48,                           titel:'Ein Abend aus',",
    an:{ datei:'src/inhalt/tiere.js', text:"{ ab: 48," },
    sagt:'nie zu erreichen' },

  /* 2. Die Wand im Buch, schmal und hoch.
   *
   * Mit dreiundzwanzig Raeumen und drei Spalten sind es acht Reihen -
   * 738 Punkte in 658. Der Eingriff nimmt die vierte Spalte weg und
   * stellt genau das wieder her. Die kleinere Schrift bleibt stehen:
   * sie allein macht aus acht Reihen keine sechs, und eine Probe, die
   * zwei Dinge auf einmal wegnimmt, sagt nicht, welches gewirkt hat. */
  { n:'die Raumwand faellt auf dem schmalen Schirm auf drei Spalten zurueck',
    tor:'passt', args:['--teil=2/5'], bauen:true, datei:V,
    such:'  .rollen.buch .raumgitter{grid-template-columns:repeat(auto-fit,minmax(80px,1fr))}',
    ersatz:'  .rollen.buch .raumgitter{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}',
    /* Der Anker sucht das VERSCHWINDEN: „120px" steht schon zweimal im
       Buendel, „80px" genau einmal - und nach dem Eingriff nicht mehr.
       `anker` hat es gemeldet, bevor ein Browser lief. */
    an:{ ...DIST, fehlt:'minmax(80px,1fr)' },
    sagt:'über den Rand' },

  /* 3. Und dieselbe Wand im kurzen Querformat.
   *
   * Der Eingriff nimmt den GANZEN Block weg, alle drei Zeilen, und das
   * ist nicht Bequemlichkeit: die drei sind EINE Massnahme. Der erste
   * Anlauf nahm nur die Spaltenzahl zurueck - sechs Spalten statt acht -
   * und `passt` blieb gruen. Zu Recht: das Raster steht auf
   * `grid-auto-rows:1fr`, es laeuft nicht ueber, es DRUECKT die Zellen
   * zusammen. Bei sechs Spalten und kleiner Schrift waren sie 41 Punkte
   * hoch, und das meldet `passt` nur als Hinweis, weil ein Hinweis kein
   * Ueberlauf ist. Erst ohne die kleinere Schrift wird aus dem
   * Zusammendruecken ein Ueberlauf, den das Tor sieht.
   *
   * Was dabei herauskommt, ist ein Befund fuer sich und steht im
   * Rueckstandsverzeichnis: eine Zelle unter dem Fingermass sollte kein
   * Hinweis sein. */
  { n:'die Raumwand im Querformat verliert ihr eigenes Mass',
    tor:'passt', args:['--teil=1/5'], bauen:true, datei:V,
    such:'  .rollen.buch .raumgitter{grid-template-columns:repeat(auto-fit,minmax(70px,1fr))}\n'
      + '  .rollen.buch .raumzelle span{font-size:calc(var(--t-name) * 0.78)}\n'
      + '  .rollen.buch .raumzelle .raumzeichen{width:20px;height:20px}\n',
    ersatz:'',
    an:{ ...DIST, fehlt:'minmax(70px,1fr)' },
    sagt:'über den Rand' },

  /* --- I21: „Wer grenzt an wen?" -------------------------------------- *
   *
   * Die Tafel `nachbarn.json` gibt es seit dem ersten Bau und hat bis
   * I21 nur die Vierfaerbung bedient. Dort ist eine fehlende Grenze
   * unsichtbar; seit sie eine Aufgabe beantwortet, ist sie eine falsche
   * Antwort. Drei Proben, drei verschiedene Bruchstellen. */

  /* 1. Die Nachbarschaft gilt nur in EINE Richtung.
   *
   * Der Eingriff nimmt Bayern aus Hessens Liste - Bayern nennt Hessen
   * weiter. Auf der Karte faellt das nicht auf (die Vierfaerbung kommt
   * mit einer halben Kante zurecht), in der Aufgabe schon: „Welches
   * Bundesland grenzt an Hessen?" haette dann einen richtigen Treffer
   * weniger, und wer auf Bayern tippt, bekaeme ein Nein. */
  { n:'eine Nachbarschaft gilt nur in eine Richtung', tor:'inhalt',
    deckt:'nachbarn', datei:'prototyp/nachbarn.json',
    such:'  "DE-TH",\n  "DE-BY",\n  "DE-BW",',
    ersatz:'  "DE-TH",\n  "DE-BW",',
    an:{ datei:'prototyp/nachbarn.json', fehlt:'  "DE-TH",\n  "DE-BY",' },
    sagt:'einseitige Nachbarschaft' },

  /* 2. Der Nachbar zaehlt gar nicht mehr.
   *
   * Der Eingriff nimmt die Nachbarschaft aus der Wertung und laesst nur
   * das gefragte Land selbst gelten - also genau die Regel, die vor I21
   * galt. Wer dann auf einen Nachbarn tippt, bekommt ein Nein, die Runde
   * kommt nie zum Ende, und der Durchgang laeuft in seinen Zeitablauf.
   *
   * Der erste Anlauf war feiner und bewies nichts: er schnitt die Liste
   * auf `slice(1)` zurueck, in der Erwartung, dass der Rauchtest genau
   * den ersten Nachbarn antippt. Das tut er auch - aber eine falsche
   * Antwort ist im Durchgang kein Fehler, sondern ein erlaubter Zug.
   * Das Tor blieb gruen, zu Recht, und die Probe sagte nichts. */
  { n:'ein Nachbar wird nicht mehr als richtig gewertet', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:"      if (istGroesser ? ctx.getroffen===ziel.gross\n"
      + "        : istNachbar ? (ziel.grenzt || []).includes(ctx.getroffen)\n"
      + "                     : ctx.getroffen===ziel.id) ergebnis='richtig';",
    ersatz:"      if (ctx.getroffen===ziel.id) ergebnis='richtig';",
    an:{ ...DIST, fehlt:'ziel.grenzt || []).includes(ctx.getroffen)' },
    sagt:'nachbarn' },

  /* 3. Die Wand bleibt bei zwoelf Kacheln.
   *
   * Der Eingriff hiess bis I22 „die dreizehnte Kachel", und er nahm
   * `nachbarn` die Gruppe weg. Seit I22 beweist das nichts mehr: mit
   * der Ländergruppe stehen nur noch sechs Kacheln in der Wand, und
   * sieben tun keinem weh. Die Stelle, an der die Zahl heute kippt, ist
   * die Ländergruppe selbst - ohne sie stehen wieder dreizehn da, und
   * die Bilder fallen auf dem kleinsten Geraet von 73 auf 19 Punkte.
   *
   * Dieselbe Aussage, dieselbe Grenze, andere Schraube. Eine Probe, die
   * ihren Gegenstand verliert, meldet nichts mehr - `anker` haette es
   * gemeldet, weil der Suchtext blieb, aber die WIRKUNG war weg. */
  { n:'ohne die Laendergruppe stehen dreizehn Kacheln in der Wand', tor:'passt',
    args:['--teil=1/5'], bauen:true, datei:D,
    such:"    titel:'Länder', farbe: KONT_FARBE[k], gruppe:'laender', wo: KONT_TITEL[k] || k })),",
    ersatz:"    titel:'Länder', farbe: KONT_FARBE[k] })),",
    an:{ ...DIST, fehlt:"gruppe:'laender'" },
    sagt:'Bild pt steht auf' },

  /* --- I22: „Was ist groesser?" ---------------------------------------
   *
   * Drei Proben, und jede haengt an einer anderen der drei Bedingungen,
   * aus denen ein Paar entsteht. Sie sind NICHT austauschbar: gemessen
   * faellt bei zweien von ihnen genau eine Zeile des Tors, und bei der
   * dritten ueberhaupt keine, wenn man sie weglaesst.
   */

  /* 1. Das Bild darf dem Satz widersprechen.
   *
   * Ohne die zweite Haelfte von `gilt` entsteht ein Paar, dessen
   * Groessenunterschied in der Welt gilt und im BILD nicht - gemessen
   * die Tuerkei gegen Thailand mit 1,47 statt 1,50. Ein Kind, das
   * hinsieht, kann diese Aufgabe nicht loesen. */
  { n:'ein Paar zeigt im Bild in die andere Richtung', tor:'inhalt',
    bauen:true, datei:E,
    such:"    gross.km2 / klein.km2 >= GROESSER_FAKTOR && gross.px / klein.px >= GROESSER_FAKTOR;",
    ersatz:"    gross.km2 / klein.km2 >= GROESSER_FAKTOR;",
    /* Der Anker steht in der QUELLE, nicht im Buendel: `erdkunde.js`
       wird von `inhalt` als Modul geladen, und ins Buendel geht nur das
       ERGEBNIS der Paarung (`D.paare`), nicht die Regel. Der erste
       Anlauf suchte in `dist/index.html` und traf ohne jeden Eingriff
       zu - `anker` hat es gemeldet. */
    an:{ datei:'src/inhalt/erdkunde.js', fehlt:'gross.px / klein.px >= GROESSER_FAKTOR' },
    sagt:'im BILD ist' },

  /* 2. Ein Land, von dem die Karte ein Fuenftel zeigt, darf mitspielen.
   *
   * Der Treue-Filter faellt, und Russland kommt auf die Europakarte
   * zurueck - mit dem Satz „ungefaehr 27-mal so gross wie Frankreich"
   * neben einem Umriss, der ein Fuenftel davon zeigt.
   *
   * DIESE PROBE IST DER GRUND fuer die ausdrueckliche Treue-Zeile im
   * Tor. Nachgemessen kommen ohne den Filter zwoelf Paare dazu, und
   * ALLE erfuellen den Faktor auch im Bild - die drei Zeilen davor
   * bleiben also gruen. Ohne die vierte waere hier eine Regel, die nie
   * geprueft wird - eine Pruefung, die nie etwas meldet, ist kein
   * Beweis (Regel 1). */
  { n:'ein Land, das die Karte kaum zeigt, darf verglichen werden', tor:'inhalt',
    bauen:true, datei:E,
    such:'export const GROESSER_TREUE = 0.86;',
    ersatz:'export const GROESSER_TREUE = 0;',
    an:{ datei:'src/inhalt/erdkunde.js', fehlt:'GROESSER_TREUE = 0.86' },
    sagt:'wird von der Karte aber nur zu' },

  /* 3. Das kleinere Land gilt als richtig.
   *
   * Der Rauchtest spielt `groesser:europa` bei allen vier Profilen und
   * tippt auf das Land, das das Spiel selbst als Antwort fuehrt. Danach
   * prueft er, dass es AUCH so gewertet wurde - genau die Zeile, die
   * bei I21 zweimal gefehlt hat. Dreht man die Antwort um, ist die
   * Aufgabe nicht mehr zu loesen. */
  { n:'das kleinere Land wird als richtig gewertet', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:D,
    such:'      if (istGroesser ? ctx.getroffen===ziel.gross',
    ersatz:'      if (istGroesser ? ctx.getroffen===ziel.klein',
    an:{ ...DIST, fehlt:'istGroesser ? ctx.getroffen===ziel.gross' },
    sagt:'nicht als richtig gewertet' },

  /* 4. Die sechs Kacheln stehen wieder in zwei Reihen.
   *
   * Mit der Ländergruppe traegt die Erdkundewand sechs statt zwoelf
   * Kacheln - und wurde dadurch KLEINER: 114 Punkte hoch statt 236, die
   * untere Haelfte des Bildschirms leer, das Bild 73 Punkte statt 85.
   * Eine Reihe, die sich auf die ganze Hoehe dehnt, bringt es auf 105.
   * Der Eingriff nimmt genau diese Dehnung weg. */
  { n:'die Wand mit sechs Kacheln bleibt flach', tor:'passt',
    args:['--teil=1/5'], bauen:true, datei:V,
    such:'  .wahl.ebenen:not(:has(> :nth-child(7))){flex:1 1 auto;align-content:stretch}',
    ersatz:'  .wahl.ebenen:not(:has(> :nth-child(7))){align-content:flex-start}',
    an:{ ...DIST, fehlt:'flex:1 1 auto;align-content:stretch' },
    sagt:'Bild pt steht auf' },

  /* 5. Die Messgrenze gilt wieder als Platzverlust.
   *
   * `passt` klont hoechstens acht Kacheln. Bei sechs echten ist damit
   * bei vierzehn Schluss, und die Zahl sagt nur noch „mindestens
   * vierzehn" - gemeldet hat das Tor aber „die Wand trägt nur noch 14
   * statt 18, sie hat Platz verloren". Der Eingriff schaltet die
   * Unterscheidung wieder ab; das Tor wird rot, und zwar an einer Wand,
   * die nichts verloren hat.
   *
   * Sie greift in das TOR und nicht in die App - dieselbe Sorte Probe
   * wie „die Fehlerüberschrift nennt jeden Befund einen Überlauf". */
  { n:'die Messgrenze der Kachelzahl gilt wieder als Platzverlust', tor:'passt',
    args:['--teil=1/5'], bauen:true, datei:'tor/passt.mjs',
    such:'      if (r.wand.gedeckelt) {',
    ersatz:'      if (r.wand.gedeckelt && false) {',
    an:{ datei:'tor/passt.mjs', text:'r.wand.gedeckelt && false' },
    sagt:'Platz verloren' },

  /* 6. Der Rueckweg aus einer falschen Gruppe geht eine Stufe zu weit.
   *
   * `durchGruppe` probiert die Gruppen der Reihe nach durch und geht
   * nach jedem Fehlgriff zurueck. Landet der Rueckweg auf der
   * WELTENWAHL statt auf der Ebenenwahl, sieht die Schleife keine
   * weitere Gruppe mehr und gibt auf - der Aufrufer klickt ins Leere.
   *
   * Gefunden hat es der Rauchtest, und zwar erst mit I22: bis dahin lag
   * „Bundesländer" als erste Gruppe da, und die Suche nach `nachbarn`
   * traf sie beim ersten Versuch. Der Rueckweg lief nie und war damit
   * nie geprueft, obwohl er seit I21 dasteht. */
  /* 7. Der Tipp landet wieder auf der ERSTEN passenden Stelle.
   *
   * `zeigeAufKarte` sucht die Stelle im Gebiet, die am weitesten von
   * jedem fremden Nadelkopf entfernt liegt. Der Eingriff nimmt den
   * ersten Treffer, so wie es bis I22 war - und der liegt bei Belarus
   * in der oberen linken Ecke, unter Litauens Kopf. Das Spiel wertet
   * dann Litauen, und die Aufgabe ist nicht zu loesen.
   *
   * Bei „Wo liegt X?" und bei den Nachbarn kostete derselbe Fehler seit
   * je nur einen Fehlversuch und fiel nie auf; erst „Was ist groesser?"
   * prueft, ob der Tipp AUCH richtig gewertet wird. */
  { n:'der Tipp landet auf der ersten statt auf der freiesten Stelle', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:'tor/chromium.mjs',
    such:'      if (d > weiteste) { weiteste = d; beste = { x, y }; }',
    ersatz:'      if (!beste) { weiteste = d; beste = { x, y }; }',
    an:{ datei:'tor/chromium.mjs', text:'if (!beste) { weiteste = d;' },
    sagt:'nicht als richtig gewertet' },

  { n:'der Rueckweg aus einer falschen Gruppe geht zu weit', tor:'smoke',
    args:['--nur=durchgang'], bauen:true, datei:'tor/chromium.mjs',
    such:"    if (!(await seite.$('.schirm.da [data-ebene]'))\n"
      + "        && await seite.$(`.schirm.da [data-welt=\"${WELT_VON(ebene)}\"]`)) {",
    ersatz:'    if (false) {',
    an:{ datei:'tor/chromium.mjs', text:'    if (false) {' },
    sagt:'ist nicht zu finden' },
];
