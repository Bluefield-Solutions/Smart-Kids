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
import { execSync } from 'node:child_process';

/* ---------------------------------------------------------------------- *
 * Die Proben.
 *
 * `tor`      welches npm-Skript gefahren wird
 * `datei`    was angefasst wird
 * `such`/`ersatz`  der Eingriff, als reine Textersetzung
 * `an`       Datei, in der der Eingriff ankommen MUSS, samt Erkennungstext
 * `bauen`    ob vorher gebaut werden muss (Tore, die `dist/` lesen)
 * `sagt`     ein Stueck der Meldung, die das Tor bringen soll
 * ---------------------------------------------------------------------- */
export const D = 'prototyp/spiel.js', V = 'prototyp/vorlage.html', E = 'src/inhalt/erdkunde.js';
/** Die Abzeichentafel (D2). */
export const A = 'src/inhalt/abzeichen.js';
/** Die Buchstabenvorlagen samt Erkennung (N2a). */
export const S = 'src/inhalt/schreiben.js';
/** Rauschen, das kein Packer kleinbekommt - aber bei jedem Lauf dasselbe. */
function rauschen(n) {
  const z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let x = 1234567, aus = '';
  for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff;
    aus += z[(x >>> 7) % z.length]; }
  return aus;
}

/** Der aelteste Commit im Baum - weiter zurueck geht es nicht. */
const wurzelCommit = () => execSync('git rev-list --max-parents=0 HEAD', { encoding:'utf8' })
  .trim().split('\n')[0];
export const DIST = { datei: 'dist/index.html' };

export const PROBEN = [
  /* --- inhalt ------------------------------------------------------- */
  { n:'zwei Gebiete mit derselben ID', tor:'inhalt', deckt:'inhalt', datei:E,
    such:"{ id:'afrika', name:'Afrika'", ersatz:"{ id:'europa', name:'Afrika'",
    an:{ datei:E, text:"{ id:'europa', name:'Afrika'" }, sagt:'doppelte ID' },

  /* --- topologie ---------------------------------------------------- */
  { n:'ein Anker liegt außerhalb seines Gebiets', tor:'inhalt', deckt:'topologie', datei:'src/geo/staedte.js',
    such:'"anker":[804.7,703]', ersatz:'"anker":[5,5]',
    an:{ datei:'src/geo/staedte.js', text:'"anker":[5,5]' }, sagt:'außerhalb' },

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
    such:'`schrift` · `symbol` · `doku` → `spielprobe` → `schreiben` → `vergleich` → `bauen` →',
    ersatz:'`schrift` · `symbol` · `doku` → `vergleich` → `bauen` →',
    an:{ datei:'CLAUDE.md', fehlt:'`doku` → `spielprobe`' },
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
  { n:'die Rechenebene gehört plötzlich beiden Kindern', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"    art:'rechnen', wer:['fiona'], mischung: Rechnen.MISCHUNG_FIONA },",
    ersatz:"    art:'rechnen', mischung: Rechnen.MISCHUNG_FIONA },",
    an:{ ...DIST, fehlt:"wer:['fiona']" },
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
  { n:'ein Knopf ist breiter als das Fenster', tor:'passt', bauen:true, datei:D,
    such:"const weiter = el('button','leise');",
    ersatz:"const weiter = el('button','leise'); weiter.style.minWidth='900px';",
    an:{ ...DIST, text:"minWidth='900px'" }, sagt:'über den Rand' },

  // Der sichere Bereich. Der Fehler war nicht „zu wenig Abstand", sondern
  // dass das Polster GAR NICHT wirkte: es stand auf `body`, waehrend die
  // Buehne absolut am Fenster hing. Genau das wird hier nachgestellt.
  { n:'die Bühne beachtet den sicheren Bereich nicht', tor:'passt', bauen:true, datei:V,
    such:'  top:var(--sicher-oben); right:var(--sicher-rechts);\n  bottom:var(--sicher-unten); left:var(--sicher-links)}',
    ersatz:'  inset:0}',
    an:{ ...DIST, fehlt:'top:var(--sicher-oben)' },
    sagt:'im Bereich des Telefons' },

  // Zwei Kacheln liegen aufeinander.
  //
  // Der erste Anlauf schob die Kachel um 4 px - und das Tor blieb gruen,
  // ZU RECHT: die Luecke zwischen den Reihen ist groesser als 4 px, es
  // ueberlappte gar nichts. Ein Eingriff, der nichts bewirkt, sieht aus
  // wie ein bestandenes Tor (Regel 3). 60 px liegen sicher drueber.
  { n:'zwei Kacheln liegen aufeinander', tor:'passt', bauen:true, datei:V,
    such:'.kachel.welt .name{font-size:var(--s3)}',
    ersatz:'.kachel.welt .name{font-size:var(--s3)}\n.wahl .kachelpaar:first-child{translate:0 60px}',
    an:{ ...DIST, text:'translate:0 60px' }, sagt:'ueberlappen sich' },

  // Das Forscherbuch war fuer `passt` unsichtbar: `.aufkleber` stand nicht
  // in seiner Auswahl. Diese Probe schiebt eine Aufkleberkarte aus dem
  // Fenster - ohne den Eintrag in der Auswahl bleibt das Tor gruen.
  { n:'eine Aufkleberkarte liegt außerhalb des Fensters', tor:'passt', bauen:true, datei:V,
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
  // geprueft hat (Regel 13).
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
   * hat die Nachgabe die Pruefung mit erledigt (Regel 13). */
  { n:'der Streu unter der Schrift zählt nicht', tor:'lesbarkeit', bauen:true, datei:V,
    such:'.kachel .streu i{position:absolute;line-height:0;display:block;',
    ersatz:'.kachel .streu i{position:absolute;line-height:0;display:block;'
      + 'color:#000!important;opacity:1;background:#000;',
    an:{ ...DIST, text:'color:#000!important;opacity:1;background:#000;' }, sagt:':1' },

  { n:'kleiner Text wird zu hell', tor:'lesbarkeit', bauen:true, datei:'src/marken/marken.css',
    such:'--tinte-2:  oklch(0.46  0.030 250)', ersatz:'--tinte-2:  oklch(0.86  0.030 250)',
    an:{ ...DIST, text:'oklch(0.86  0.030 250)' }, sagt:':1' },

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
    such:"const D = JSON.parse(", ersatz:"const FUELL = '" + rauschen(24000) + "';\nconst D = JSON.parse(",
    an:{ ...DIST, text:'const FUELL' }, sagt:'gewachsen' },

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
  { n:'die Entwürfe holen ihre Schrift aus dem Netz', tor:'ansicht', bauen:true,
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
   * Jetzt am `"tor": "npm run ` verankert. Das ueberlebt jede Umsortierung
   * der Kette; nur ihr Wegfall wuerde es brechen, und dann gibt es nichts
   * mehr zu pruefen. */
  { n:'ein neues Tor steht in der Kette, aber nicht im Stand', tor:'rhythmus', auchWennRot:true,
    brauchtStand:true, nachStand:true, datei:'package.json',
    such:'"tor": "npm run ',
    ersatz:'"tor": "npm run neuestor && npm run ',
    an:{ datei:'package.json', text:'npm run neuestor' },
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
    // zweimal dastand und deshalb nie fehlte (Regel 3); die zweite kam an
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
    such:"    { a3:'POL', name:'Polen', rang:8, aussprache:['polen','pohlen'] },",
    ersatz:"    { a3:'POL', name:'Polen', rang:99, aussprache:['polen','pohlen'] },",
    an:{ datei:'src/inhalt/erdkunde.js', text:"name:'Polen', rang:99" },
    sagt:'Rang außerhalb' },
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
  { n:'die Hauptstädte-Ebene bekommt den falschen Rahmen', tor:'ansicht',
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
    such:"  { id:'hauptstaedte:europa', ueber:'Europa', titel:'Hauptstädte', farbe:3,\n    wer:['lea','stephan','violeta'] },",
    ersatz:"  { id:'hauptstaedte:europa', ueber:'Europa', titel:'Hauptstädte', farbe:3 },",
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
    such:"          kandidaten:0, laenderTiefe:12, sitzung:12, streng:true, ton:'sachlich',",
    ersatz:"          kandidaten:0, laenderTiefe:12, sitzung:12, streng:true, ton:'kind',",
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
  { n:'die Übersicht im Elternbereich fällt weg', tor:'ansicht', bauen:true, datei:D,
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
  { n:'die Siegsterne kommen bei den Eltern zurück', tor:'ansicht', bauen:true, datei:D,
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
    such:"    { a3:'POL', name:'Polen', rang:8, aussprache:['polen','pohlen'] },",
    ersatz:"    { a3:'POL', name:'Polen', rang:8, aussprache:['polen','griechenland'] },",
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
  { n:'die Beispielkarten verlieren ihre Form', tor:'ansicht', bauen:true, datei:V,
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
  { n:'der Rückfall wird gar nicht mehr gestellt', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:'tor/smoke.mjs',
    such:'        for (const id of ids) st[id] = { fach: 1, hoechstes: 3, faellig: 0,',
    ersatz:'        for (const id of []) st[id] = { fach: 1, hoechstes: 3, faellig: 0,',
    an:{ datei:'tor/smoke.mjs', text:'for (const id of []) st[id]' },
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
  { n:'das Buch rollt wieder beim zweiten Aufkleber', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:V,
    such:'  .kleber.gross .aufkleber svg{height:64px}',
    ersatz:'  .kleber.gross .aufkleber svg{height:112px}',
    an:{ ...DIST, text:'.kleber.gross .aufkleber svg{height:112px}' },
    sagt:'unter dem Rand' },

  /* Der leere Kopf nimmt wieder 68 Punkte weg.
   *
   * Auf dem Zielgeraet sind das 17 % der Bildschirmhoehe, und der ganze
   * Block darunter steht dann wieder unter der Mitte. */
  { n:'der leere Kopf nimmt wieder Platz weg', tor:'ansicht', bauen:true, datei:D,
    such:'  (links || mitte || rechts)\n  ?',
    ersatz:'  true\n  ?',
    an:{ ...DIST, fehlt:'(links||mitte||rechts)' },
    sagt:'quer-ende' },
  /* Und die Pause verliert ihre Warnung. Der Knopf daneben loescht alles,
   * was das Kind in dieser Uebung gesammelt hat. */
  { n:'die Pause warnt nicht mehr vor „von vorne"', tor:'ansicht', bauen:true, datei:D,
    such:'      <div class="unter" id="was">Bei „von vorne" verschwindet alles, was du',
    ersatz:'      <div class="unter" id="was">Bei „von vorne" geht es weiter, was du',
    an:{ ...DIST, fehlt:'von vorne" verschwindet alles' },
    sagt:'quer-pause' },

  /* Der Vorlauf legt wieder acht Spuren an, egal wieviele Karten es sind.
   *
   * Dann stehen sechs Rechenaufgaben linksbuendig in einer Reihe von acht,
   * mit einem Loch von vierhundert Punkten rechts. */
  { n:'der Vorlauf verteilt die Karten wieder auf acht Spuren', tor:'ansicht',
    bauen:true, datei:D,
    such:'  const gitter = vorlaufGitter(stuecke.length);',
    ersatz:'  const gitter = { reihen: 2, spalten: 8 };',
    an:{ ...DIST, fehlt:'vorlaufGitter(stuecke.length)' },
    sagt:'quer-vorlauf-rechnen' },

  /* Die Reihen teilen sich die Hoehe des Bandes nicht mehr.
   *
   * Dann haengen die Karten wieder oben, der Knopf unten, und dazwischen
   * steht ein Drittel leeres Band. */
  { n:'die Beispielkarten füllen das Band nicht mehr', tor:'ansicht', bauen:true, datei:V,
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

  /* --- ansicht ------------------------------------------------------ */
  // Gedreht wird jetzt an der MARKE, nicht an einer ausgeschriebenen Farbe:
  // die sieben leiten sich seit der Audit-Runde aus --flaeche-c ab, und die
  // alte Probe suchte einen Text, den es nicht mehr gibt. Sie ist damit auch
  // die Gegenprobe auf die Ableitung selbst - greift sie nicht durch,
  // haengen die Farben doch nicht an der Marke.
  { n:'die Karte wechselt die Farbe', tor:'ansicht', bauen:true, datei:'src/marken/marken.css',
    such:'  --flaeche-l: 0.74; --flaeche-c: 0.135;',
    ersatz:'  --flaeche-l: 0.74; --flaeche-c: 0.020;',
    an:{ ...DIST, text:'--flaeche-c: 0.020' }, sagt:'rot' },

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

  // „Von vorne" muss WIRKLICH loeschen - ein Knopf, der dasteht und nichts
  // tut, ist schlimmer als keiner.
  { n:'„von vorne" löscht nichts', tor:'smoke', args:['--nur=ablage'], bauen:true, datei:D,
    such:"    await Ablage.loesche('fortschritt', `${P.id}:${id}`).catch(()=>{});",
    ersatz:'',
    an:{ ...DIST, fehlt:"await Ablage.loesche('fortschritt', `${P.id}:${id}`)" },
    sagt:'Gegenstände im Leitner-Stand' },
  // Und es muss nachfragen: ein Fehlgriff raeumt eine Woche Uebung weg.
  { n:'„von vorne" löscht schon beim ersten Tipper', tor:'smoke', args:['--nur=ablage'], bauen:true, datei:D,
    such:"    if (b.dataset.sicher!=='ja'){", ersatz:'    if (false){',
    an:{ ...DIST, text:'if (false){' },
    sagt:'fragt nicht nach' },

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
    suchRegex:/  setTimeout\(\(\)=>\{\n    const teile = \[frageText\];[\s\S]*?\n  \}, [^;]*\);\n/,
    ersatzFn:()=>'',
    an:{ ...DIST, fehlt:'const teile = [frageText]' },
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
    such:'<div class="stand">${kleberMarke(b.gesammelt, b.gesamt)}${',
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
    such:'<div class="stand">${kleberMarke(b.gesammelt, b.gesamt)}${',
    ersatz:'<div class="stand">${sterne(sterneFuer(b.gesammelt, b.gesamt), 20)}${kleberMarke(b.gesammelt, b.gesamt)}${',
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
  { n:'auf dem Zielgerät verschwindet der Kachelbalken', tor:'ansicht',
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
  { n:'eine falsche Antwort bleibt stumm', tor:'smoke', args:['--nur=regler'],
    bauen:true, datei:D,
    such:"    klangZu('falsch');\n    if (versuch >= 3) return aufloesen('dreimal');",
    ersatz:"    if (versuch >= 3) return aufloesen('dreimal');",
    an:{ ...DIST, fehlt:"klangZu('falsch');\n    if (versuch >= 3)" },
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
    // Der Riegel `hoertZu` steht seit F15 in derselben Zeile - er bleibt
    // stehen, herausgenommen wird nur die Tonabschaltung.
    such:"function klangZu(ergebnis){\n  if (hoertZu || !tonAn) return;",
    ersatz:"function klangZu(ergebnis){\n  if (hoertZu) return;",
    an:{ ...DIST, fehlt:"if (hoertZu || !tonAn) return;" },
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
    sagt:'Gekritzeln werden als Buchstabe angenommen' },

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
    such:'  const balken = (await staende()).filter(b => weltVon(b) === welt.id);',
    ersatz:'  const balken = await staende();',
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
   * Die alte Zahl zurueck. Dann legt das Gitter auf dem Zielgeraet acht
   * Spalten an statt neun, die 26 Buchstabenkarten fallen in vier Reihen,
   * und jede ist 42 statt 62 Punkte hoch.
   */
  { n:'die Buchstabenkarten rutschen wieder zusammen', tor:'passt',
    bauen:true, datei:V,
    such:'  --kleber-eng-min:56px}',
    ersatz:'  --kleber-eng-min:72px}',
    an:{ ...DIST, text:'--kleber-eng-min:72px' },
    sagt:'ein Aufkleber muss 44 messen' },

  /* --- B3: die umgekehrte Frage --------------------------------------
   *
   * Drei Proben: die Form selbst, die Markierung, die Wertung.
   */

  // 1. Es gibt sie nicht mehr - jede Aufgabe fragt wieder nach dem Namen.
  { n:'die umgekehrte Frage kommt nicht mehr vor', tor:'smoke',
    args:['--nur=umgekehrt'], bauen:true, datei:D,
    such:"  const umgekehrt = kannLesen && !istHaupt && st.i % 3 === 2;",
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
    such:"kandidaten:99, laenderTiefe:5, sitzung:8, streng:true, ton:'kind', farbe:'--f3' }",
    ersatz:"kandidaten:99, laenderTiefe:5, sitzung:8, streng:true, ton:'kind', farbe:'--f4' }",
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
     ausgebaut (Regel 13).

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

  { n:'ein Abzeichen will ein Bild, das es nicht gibt', tor:'inhalt', deckt:'abzeichen', datei:A,
    such:"id:'alle-bundeslaender', zeichen:'karte'",
    ersatz:"id:'alle-bundeslaender', zeichen:'deutschland'",
    an:{ datei:A, text:"zeichen:'deutschland'" }, sagt:'ohne Zeichen' },

  { n:'ein Nachbar Deutschlands steht nicht in den Daten', tor:'inhalt', deckt:'abzeichen', datei:A,
    such:"'DNK', 'NLD'", ersatz:"'DAN', 'NLD'",
    an:{ datei:A, text:"'DAN', 'NLD'" }, sagt:'ohne Land in den Daten' },

  /* Der Konstruktionsfehler dieser Runde: die Menge aus dem Vorrat des
     KINDES statt aus dem vollen. Fiona haette „alle Kontinente" mit vier
     von sechs bekommen - und beim naechsten Rundenwechsel wieder
     verloren. Gefunden auf der Aufnahme, nicht vom Tor. */
  { n:'ein Abzeichen lässt sich wieder verlieren', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:D, mehrfach:true,
    such:'vorrat(e.id, st, true)', ersatz:'vorrat(e.id, st)',
    an:{ ...DIST, fehlt:'vorrat(e.id, st, true)' },
    sagt:'die Menge ist nicht voll' },

  // Und das Gegenstueck: die Erreichbarkeit faellt weg, und Fiona
  // bekommt ein Ziel hingestellt, das sie nicht erreichen kann.
  { n:'ein unerreichbares Abzeichen wird trotzdem angeboten', tor:'smoke',
    args:['--nur=abzeichen'], bauen:true, datei:A,
    such:'      if (umfeld.erreichbar && teile.some(id => !umfeld.erreichbar.has(id))) continue;',
    ersatz:'',
    an:{ ...DIST, fehlt:'umfeld.erreichbar.has(id)' },
    sagt:'Nachbarn-Abzeichen' },

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
];
