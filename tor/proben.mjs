// `proben` — die stehenden Gegenproben.
//
// Ein Tor, das nie etwas meldet, ist kein Beweis. Es sieht von aussen
// genauso aus wie eines, das alles durchlaesst: gruen. Der Unterschied ist
// nur zu sehen, wenn man den Fehler ABSICHTLICH einbaut, den es fangen
// soll, und nachschaut, ob es rot wird.
//
// Bisher lag das in meinem Kopf. Diese Sitzung habe ich fuenf Gegenproben
// von Hand gefahren; zwei davon haben nicht den Code widerlegt, sondern das
// TOR - und beide waeren beim naechsten Mal vergessen gewesen. Ab jetzt
// stehen sie hier und laufen auf Knopfdruck.
//
// Zwei Regeln, die dieses Verzeichnis schon Runden gekostet haben:
//
//  1. ERST EINCHECKEN, DANN GEGENPROBEN. Wiederhergestellt wird mit
//     `git checkout`, und das loescht ungesicherte Arbeit. Deshalb
//     verweigert der Lauf bei schmutzigem Baum den Dienst - eine Regel,
//     die nur aufgeschrieben ist, wird gebrochen.
//
//  2. PRUEFEN, OB DER EINGRIFF ANGEKOMMEN IST. Ein Eingriff, der gar nicht
//     ankommt, sieht aus wie ein bestandenes Tor. Jede Probe sagt deshalb,
//     WORIN der Eingriff zu finden sein muss, und der Lauf schaut nach -
//     wenn noetig im gebauten `dist/`, nicht in der Quelle.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, execSync, spawn } from 'node:child_process';

const NUR = process.argv.slice(2).filter(a => !a.startsWith('-'));
const STAND = 'tor/proben-stand.json';
const LAUT = process.argv.includes('--laut');
const GEAENDERT = process.argv.includes('--geaendert');
const fahne = (name, weg) => (process.argv.find(a => a.startsWith(`--${name}=`)) || '').slice(name.length + 3) || weg;

/* Nebeneinander statt hintereinander.
 *
 * Die Proben teilten sich genau eine Sache: den Arbeitsbaum. Seit sie in
 * einer Wegwerf-Kopie laufen, teilen sie gar nichts mehr — alle sechs
 * Browser-Tore binden ohnehin `server.listen(0)`, also einen freien Port.
 *
 * NICHT umgebaut wird die Maschinerie: ein Nebenlaeufigkeits-Umbau mitten
 * in dem Werkzeug, das die Beweise fuehrt, waere die Sorte Aenderung, bei
 * der ein Fehler still bleibt. Stattdessen startet dieser Lauf sich
 * SELBST mehrmals — jedes Kind mit einem Teil der Arbeit und einer
 * eigenen Kopie. Innen bleibt alles, wie es war.
 *
 * Geteilt wird nach GRUPPEN, nicht nach Proben: alle Proben mit demselben
 * Tor und denselben Argumenten gehoeren zusammen, weil sie sich den
 * gesunden Lauf teilen (`istGesund`). Auseinandergerissen wuerde der
 * mehrfach gefahren, und der ist beim Rauchtest so teuer wie eine Probe.
 */
const ARBEITER = Math.max(1, Math.min(4, +fahne('arbeiter', '3')));
const TEIL = fahne('teil', '');                  // „i/n" — nur im Kind gesetzt
const ERGEBNIS = fahne('ergebnis', '');          // wohin das Kind sein Ergebnis schreibt
const KOPIE_NAME = fahne('kopie', '.probenbaum');

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
const D = 'prototyp/spiel.js', V = 'prototyp/vorlage.html', E = 'src/inhalt/erdkunde.js';
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
const DIST = { datei: 'dist/index.html' };

const PROBEN = [
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
  { n:'ein Zeichen außerhalb des geladenen Schnitts', tor:'inhalt', deckt:'schrift', datei:D,
    such:"'Lass es auf dem Land los.'", ersatz:"'Lass es auf dem Land los. ☞'",
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
    such:'`schrift` · `symbol` · `doku` → `spielprobe` → `vergleich` → `bauen` →',
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

  // Und die Weiche selbst: ohne sie landet die Rechenaufgabe auf dem
  // Kartenbildschirm, und der sucht eine Karte, die es nicht gibt.
  { n:'die Rechenaufgabe landet auf dem Kartenbildschirm', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"  zeige(ebeneArt(ebeneId) === 'rechnen' ? rechenschirm : spielschirm);",
    ersatz:'  zeige(spielschirm);',
    an:{ ...DIST, fehlt:"ebeneArt(ebeneId) === 'rechnen' ? rechenschirm" },
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

  /* --- rhythmus ----------------------------------------------------- */
  // Wie lange der Lauf zurueckliegt, steht in der HISTORIE - an einer Datei
  // ist das nicht zu drehen. Deshalb bekommt das Tor eine Schraube, die nur
  // strenger stellen kann: bei -1 ist jeder Stand zu alt.
  { n:'der letzte Probenlauf liegt zu lange zurück', tor:'rhythmus', brauchtStand:true, nachStand:true,
    umgebung:{ SMARTKIDS_RHYTHMUS_MAX:'-1' },
    datei:'tor/proben-stand.json',
    suchRegex:/"zeit": "([\d-]+)"/, ersatzFn:(m)=>`"zeit": "${m[1]}"`,   // unveraendert
    an:{ datei:'tor/proben-stand.json', regex:/"zeit": "[\d-]+"/ },
    sagt:'älter als' },
  // Frueher gab es eine Marke „abgebrochen" fuer den ganzen Satz. Es gibt
  // sie nicht mehr: eine Probe bekommt ihren Eintrag genau dann, wenn sie
  // angeschlagen hat. Ein abgebrochener Lauf hinterlaesst also LUECKEN,
  // und die faengt dieselbe Pruefung wie eine ganz neue Probe. Geprobt
  // wird deshalb die Luecke selbst.
  { n:'eine Probe hat keinen Nachweis, und es faellt nicht auf', tor:'rhythmus',
    brauchtStand:true, nachStand:true, datei:'tor/proben-stand.json',
    suchRegex:/"([^"]+)": \{\n      "commit"/,
    ersatzFn:(m)=>`"${m[1]} (weg)": {\n      "commit"`,
    an:{ datei:'tor/proben-stand.json', regex:/ \(weg\)": \{/ },
    sagt:'nie angeschlagen' },
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
  { n:'ein neues Tor steht in der Kette, aber nicht im Stand', tor:'rhythmus',
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
  { n:'ein Nachweis, dessen Alter sich nicht bestimmen lässt', tor:'rhythmus',
    brauchtStand:true, nachStand:true, datei:'tor/proben-stand.json',
    suchRegex:/"commit": "[0-9a-f]{40}"/, ersatzFn:()=>'"commit": "0000000000000000000000000000000000000000"',
    an:{ datei:'tor/proben-stand.json', text:'"commit": "0000000000000000000000000000000000000000"' },
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
    such:"  { id:'hauptstaedte:europa', ueber:'Europa', titel:'Hauptstädte', farbe:3,\n    wer:['lea','eltern'] },",
    ersatz:"  { id:'hauptstaedte:europa', ueber:'Europa', titel:'Hauptstädte', farbe:3 },",
    an:{ ...DIST, fehlt:"wer:['lea','eltern']" },
    sagt:'steht aber in fionas Auswahl' },

  /* --- Ton je Profil und der Elternbereich als Bild -------------------- */
  // Die Eltern werden wieder angefeuert.
  //
  // „Super gemacht!" zu einem Erwachsenen, der das grosse Einmaleins
  // uebt. Der Ton ist eine Eigenschaft des Profils, und das Soll steht in
  // der Zeile „Ton" im Backlog - nicht in `spiel.js`, das diese Probe
  // faelscht.
  { n:'die Eltern bekommen den kindlichen Ton', tor:'inhalt', deckt:'inhalt',
    datei:D,
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
    such:"      ${ton().siegsterne ? `<div class=\"siegsterne\">${sterne(n,56)}</div>` : ''}",
    ersatz:'      <div class="siegsterne">${sterne(n,56)}</div>',
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

  // Die Ebenenwahl ohne Sterne und Aufkleber. Auf dem Zielgeraet blieb
  // dann GAR NICHTS uebrig: Balken und Ueberzeile sind im kurzen
  // Querformat ausgeblendet, und die Zahl daneben liest Fiona nicht.
  { n:'die Ebenenwahl zeigt keine Sterne und Aufkleber mehr', tor:'smoke', args:['--nur=ablage'],
    bauen:true, datei:D,
    such:'<div class="stand">${sterne(sterneFuer(b.gesammelt, b.gesamt), 20)}${',
    ersatz:'<div class="stand">${\'\'}${',
    an:{ ...DIST, fehlt:'sterne(sterneFuer(b.gesammelt, b.gesamt), 20)' },
    sagt:'Sterne statt drei' },

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
    such:"function klangZu(ergebnis){\n  if (!tonAn) return;",
    ersatz:"function klangZu(ergebnis){",
    an:{ ...DIST, fehlt:"function klangZu(ergebnis){\n  if (!tonAn) return;" },
    sagt:'Ton aus' },

  /* --- Fachwelten (D4) ------------------------------------------------ */

  // Die Zuordnung wird aus `art` abgeleitet. Geht die Ableitung daneben,
  // steht die Rechenkachel bei der Erdkunde - und das sieht auf einem
  // Bildschirmfoto aus wie ein Gestaltungseinfall, nicht wie ein Fehler.
  { n:'alle Ebenen landen in derselben Welt', tor:'smoke', args:['--nur=durchgang'],
    bauen:true, datei:D,
    such:"const weltVon = (e) => e.art === 'rechnen' ? 'rechnen' : 'erdkunde';",
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
];

/* ---------------------------------------------------------------------- */

const rot = (s) => `\x1b[31m${s}\x1b[0m`, gruen = (s) => `\x1b[32m${s}\x1b[0m`;

/* Regel 1 ist weg — weil der Grund weg ist.
 *
 * „Erst einchecken, dann gegenproben" stand hier, seit dieser Lauf viermal
 * frische Arbeit geloescht hatte: er griff in den ARBEITSBAUM ein und
 * raeumte mit `git checkout -- .` wieder auf. Die Regel hat den Schaden
 * nicht verhindert - beim fuenften Mal wurde sie mit `--trotzdem` umgangen,
 * und eine ganze Runde war weg.
 *
 * Eine Regel, die nur verbietet, hilft nicht, wenn jemand das Verbot
 * umgeht. Also faellt nicht die Umgehung weg, sondern die GEFAHR: geprobt
 * wird ab jetzt in einer Wegwerf-Kopie. Der Arbeitsbaum wird nicht mehr
 * angefasst, es gibt nichts mehr zu verlieren, und die Regel hat sich
 * erledigt.
 *
 * Drei Dinge fallen damit zusammen weg: die Weigerung, das Netz aus
 * `git stash create` (ein Netz fuer einen Sturz, den es nicht mehr gibt)
 * und die Zeremonie „commit, dann proben, dann nachbessern, dann nochmal
 * committen" - jede Runde ein Umweg.
 *
 * Und die Kopie kann noch etwas, das der Arbeitsbaum nie konnte: es darf
 * mehrere davon geben. Proben, die einander nicht in die Quere kommen,
 * lassen sich nebeneinander fahren.
 */
const HAUPT = process.cwd();
const KOPIE = path.join(HAUPT, KOPIE_NAME);
const schmutzig = execSync('git status --porcelain', { encoding:'utf8' }).trim();

/**
 * Die Kopie aufbauen: HEAD auschecken, dann den Arbeitsbaum daruebermalen.
 *
 * Warum nicht `git stash create` als Grundlage: `rhythmus` rechnet mit
 * `git rev-list <standCommit>..HEAD`, und ein Stash-Commit haengt neben
 * der Historie statt in ihr - die Zahl waere eine andere als im
 * Arbeitsbaum. Die Kopie steht deshalb auf demselben HEAD, und was du
 * geaendert hast, wird HINEINKOPIERT. Damit ist geprueft, was du siehst,
 * und gerechnet wird wie zu Hause.
 */
function kopieAufbauen() {
  fs.rmSync(KOPIE, { recursive:true, force:true });
  try { execSync('git worktree prune', { stdio:'ignore' }); } catch { /* egal */ }
  execSync(`git worktree add --detach ${KOPIE} HEAD`, { stdio:'ignore' });
  // Die Abhaengigkeiten stehen schon nebenan. Ein zweites `npm ci` kostet
  // mehr als der ganze Lauf.
  fs.symlinkSync(path.join(HAUPT, 'node_modules'), path.join(KOPIE, 'node_modules'), 'dir');
  uebermalen();
}

/** Was im Arbeitsbaum anders ist, in die Kopie tragen. */
function uebermalen() {
  if (!schmutzig) return [];
  const dazu = [];
  for (const z of schmutzig.split('\n')) {
    const zustand = z.slice(0, 2), datei = z.slice(3).replace(/^"|"$/g, '');
    const ziel = path.join(KOPIE, datei);
    if (zustand.includes('D')) { fs.rmSync(ziel, { force:true }); dazu.push(datei); continue; }
    if (!fs.existsSync(datei)) continue;
    fs.mkdirSync(path.dirname(ziel), { recursive:true });
    fs.copyFileSync(datei, ziel);
    dazu.push(datei);
  }
  return dazu;
}

function kopieAbbauen() {
  fs.rmSync(KOPIE, { recursive:true, force:true });
  try { execSync('git worktree prune', { stdio:'ignore' }); } catch { /* egal */ }
}

kopieAufbauen();
const BAUM = KOPIE;
const imBaum = (datei) => path.join(BAUM, datei);
process.on('exit', kopieAbbauen);
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { kopieAbbauen(); process.exit(130); });

if (!TEIL) {
console.log(`\n  Geprobt wird in einer Wegwerf-Kopie (${path.basename(KOPIE)}).`);
console.log('  Der Arbeitsbaum wird nicht angefasst.');
if (schmutzig) {
  const n = schmutzig.split('\n').length;
  console.log(`  ${n} geänderte Datei${n === 1 ? '' : 'en'} aus dem Arbeitsbaum sind mitkopiert —`);
  console.log('  geprüft wird also, was du siehst, nicht der letzte Commit.');
}
}

/* `--sofort` fuer jedes Tor, das damit umgehen kann.
 *
 * Eine Gegenprobe will EINE Aussage: schlaegt das Tor an, und mit welcher
 * Meldung. Ob es danach noch dreissig weitere Pruefungen faehrt, aendert
 * daran nichts — kostet aber beim Rauchtest den Loewenanteil.
 *
 * Auch der GESUNDE Lauf bekommt die Fahne (`istGesund` ruft dieselbe
 * Funktion): er soll ja gruen sein, und bei gruen bricht nichts ab. Waere
 * er rot, gilt genau dasselbe wie oben.
 *
 * Die Kette (`npm run tor`) setzt sie NICHT — dort will man alle Fehler
 * auf einmal sehen.
 */
/* …ausser dort, wo der Eingriff MEHRERE Pruefungen ausloest.
 *
 * `--sofort` bricht beim ERSTEN Fehler ab. Damit ist „mit welcher Meldung"
 * die Meldung des ersten Fehlers - und die muss nicht die sein, um die es
 * geht. Gemessen an „die Ansage haengt nicht mehr am Kind": der Eingriff
 * laesst auch das Elternprofil sprechen, also meldet der Rauchtest zehnmal
 * „bei ,sachlich' sagt sie von sich aus nichts" und bricht ab, BEVOR er die
 * vorgelesenen Aufgaben zaehlt. Die Probe sah ein rotes Tor mit der
 * falschen Meldung und bewies nichts.
 *
 * `ohneSofort:true` an der Probe laesst den ganzen Lauf durch. Es kostet
 * Zeit, also nur dort, wo es noetig ist. */
const KANN_SOFORT = new Set(['smoke']);
/* `--kurz` dazu: der Durchgang spielt drei Ebenen statt neun je Profil.
 *
 * Eine Gegenprobe will wissen, ob das Tor anschlaegt — nicht, ob jede
 * einzelne Laenderebene spielbar ist. Die Frage gehoert in die KETTE, und
 * dort wird der Durchgang weiterhin vollstaendig gefahren.
 *
 * Bleibt eine Probe dadurch gruen, meldet der Lauf „TOR BLEIBT GRÜN" —
 * laut und nicht still. Die Abkuerzung kann also nichts verstecken, sie
 * kann nur auffallen. */
const KANN_KURZ = new Set(['smoke']);
const lauf = (befehl, umgebung, args, ohneSofort) => {
  const mit = [...(args || []),
    ...(KANN_SOFORT.has(befehl) && !ohneSofort ? ['--sofort'] : []),
    ...(KANN_KURZ.has(befehl) ? ['--kurz'] : [])];
  try {
    return { code:0, aus: execFileSync('npm', ['run', befehl, ...(mit.length ? ['--', ...mit] : [])],
      { encoding:'utf8', stdio:['ignore','pipe','pipe'], cwd: BAUM,
        env: umgebung ? { ...process.env, ...umgebung } : process.env }) };
  } catch (e) {
    return { code: e.status ?? 1, aus: (e.stdout || '') + (e.stderr || '') };
  }
};

/**
 * Zuruecksetzen heisst: Quellen UND gebauter Stand.
 *
 * Der erste Lauf hat nur `git checkout` gemacht - und `dist/` steht nicht
 * in Git. Danach lag der letzte Eingriff noch im gebauten Stand, und der
 * naechste Befehl im Verzeichnis prueft ihn mit. Ein Werkzeug, das den Baum
 * schlechter zuruecklaesst als es ihn vorgefunden hat, ist gefaehrlicher
 * als keines.
 */
/**
 * ... und im zweiten Durchgang muss der frische Stand danach zurueck.
 *
 * `git checkout` holt die EINGECHECKTE Fassung zurueck - also den alten
 * Stand, nicht den, den dieser Lauf gerade geschrieben hat. Ohne diese
 * Zeile war `rhythmus` nach der ersten Wiederherstellung wieder rot, und
 * alle vier Proben meldeten „war schon vorher rot".
 */
let nachRestore = null;

/**
 * Auch beim ABBRUCH wird aufgeraeumt.
 *
 * Der Lauf dauert Minuten, und wer ihn mit Strg-C beendet - oder wessen
 * Zeitgrenze zuschlaegt -, laesst sonst den letzten Eingriff im Baum
 * stehen. Genau das ist passiert: nach einem abgebrochenen Lauf stand
 * `if (false){` in der Bestaetigungsabfrage, der naechste Bau uebernahm es,
 * und die Bildschirmfotos danach zeigten einen beschaedigten Stand.
 *
 * Ein Werkzeug, das den Baum schlechter zuruecklaesst, als es ihn
 * vorgefunden hat, ist gefaehrlicher als keines - das stand schon einmal
 * hier, und es galt nur fuer den geordneten Fall.
 */
let amRaeumen = false;
for (const zeichen of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(zeichen, () => {
    if (amRaeumen) process.exit(130);
    amRaeumen = true;
    console.log(`\n\n  Abbruch (${zeichen}) — der Baum wird zurückgesetzt …`);
    try { execSync('git checkout -- .', { stdio:'ignore' });
          execFileSync('npm', ['run', 'bauen'], { stdio:'ignore' }); } catch {}
    console.log('  … zurückgesetzt. Der festgehaltene Stand bleibt, wie er war.\n');
    process.exit(130);
  });
}

const wiederherstellen = (gebaut) => {
  // In der KOPIE. Derselbe Befehl, der diesem Verzeichnis viermal Arbeit
  // gekostet hat - hier kann er nichts mehr treffen als sich selbst.
  execSync('git checkout -- .', { stdio:'ignore', cwd: BAUM });
  uebermalen();
  if (nachRestore) nachRestore();
  if (gebaut) execFileSync('npm', ['run', 'bauen'], { stdio:'ignore', cwd: BAUM });
};

/**
 * Der Erstlauf.
 *
 * Zwei Proben pruefen, ob `rhythmus` einen VERALTETEN Stand erkennt - und
 * dafuer muss es einen Stand geben. Beim allerersten Lauf gibt es keinen,
 * und den erzeugt genau dieser Lauf. Ein Henne-Ei.
 *
 * Aufgeloest wird es EINMAL und laut: die beiden Proben werden uebersprungen,
 * es steht in der Ausgabe, und weil danach ein Stand existiert, kann dieser
 * Fall nie wieder eintreten. Was hier NICHT passiert: sie stillschweigend
 * ueberspringen. Ein uebersprungener Test, den niemand meldet, ist genau die
 * Sorte Luecke, die dieses Werkzeug aufdecken soll.
 */
/* Ein Lauf ist nur dann VOLL, wenn wirklich jede Probe gefahren wurde.
 *
 * `--geaendert` gehoert deshalb hierher, nicht nur in die Auswahl: schriebe
 * die Abkuerzung den Stand fort, waere `rhythmus` gruen, ohne dass je ein
 * vollstaendiger Beweis stattgefunden haette - und die Regel „alle drei
 * Runden" waere still ausgehebelt. Genau die Sorte Loch, die dieses
 * Werkzeug aufdecken soll. */
const vollerLauf = NUR.length === 0 && !GEAENDERT;
const erstlauf = !fs.existsSync(STAND);
if (vollerLauf && erstlauf) {
  console.log('  ERSTLAUF: es gibt noch keinen festgehaltenen Stand. Die beiden Proben,');
  console.log('  die einen brauchen, werden übersprungen — der nächste Lauf prüft sie.\n');
}

/**
 * `--geaendert`: nur die Proben, die sich ueberhaupt geaendert haben KOENNEN.
 *
 * Der volle Lauf dauert 35,6 Minuten, davon 30 im Rauchtest. In einer Runde,
 * die zwei Dateien anfasst, haben aber die meisten Proben nichts zu pruefen,
 * was sich geaendert haette. Gefahren wird deshalb eine Probe, wenn
 *
 *   - die Datei, in die sie eingreift, seit dem letzten vollen Lauf
 *     angefasst wurde, ODER
 *   - das Tor, das sie fahrt, selbst angefasst wurde (auch als Unter-Tor:
 *     `inhalt.mjs` traegt sieben).
 *
 * Die Grundlinie ist der Commit, der im Stand steht - also genau „was ist
 * seit dem letzten vollstaendigen Beweis passiert".
 *
 * WAS DAS NICHT FAENGT, und das ist der Preis: die mittelbare Kopplung. Wer
 * `prototyp/spiel.js` aendert, kann eine Probe brechen, die in
 * `src/marken/marken.css` eingreift - der Rauchtest verhaelt sich dann
 * anders, und der Eingriff kommt zwar an, das Tor meldet aber etwas
 * anderes. Genau dafuer bleibt der volle Lauf alle drei Runden Pflicht;
 * `rhythmus` setzt ihn durch, und diese Abkuerzung schreibt deshalb KEINEN
 * Stand. Eine Abkuerzung, die den vollen Lauf ersetzen koennte, waere keine
 * Abkuerzung, sondern ihr Ende.
 */
const seitCommit = (() => {
  const merker = new Map();
  return (commit) => {
    if (merker.has(commit)) return merker.get(commit);
    let s;
    try {
      /* Verglichen wird gegen den ARBEITSBAUM, nicht gegen HEAD.
       *
       * `git diff <commit> HEAD` sieht nur, was schon eingecheckt ist —
       * und seit `proben` in einer Kopie laeuft, ist der Normalfall
       * gerade, dass man NICHT vorher committet. Die Abkuerzung haette
       * dann genau die Aenderung uebersehen, an der man arbeitet, und
       * waere gruen geblieben. Ein `HEAD` weniger.
       *
       * Unverfolgte Dateien kommen dazu: eine neue Datei ist in keinem
       * Diff, aber sehr wohl eine Aenderung. */
      s = new Set(execSync(`git diff --name-only ${commit}`,
        { encoding:'utf8', stdio:['ignore','pipe','ignore'] })
        .split('\n').map(x => x.trim()).filter(Boolean));
      for (const f of execSync('git ls-files --others --exclude-standard',
        { encoding:'utf8' }).split('\n').map(x => x.trim()).filter(Boolean)) s.add(f);
    } catch { s = null; }
    merker.set(commit, s);
    return s;
  };
})();

/** Der Nachweis, den eine Probe mitbringt — oder keiner. */
const nachweisVon = (() => {
  const stand = fs.existsSync(STAND)
    ? (JSON.parse(fs.readFileSync(STAND, 'utf8')).proben || {}) : {};
  return (p) => stand[p.n] || null;
})();

let geaendertGrund = '';
let vorauswahl = PROBEN;
if (GEAENDERT) {
  /* Was ist NACHZUWEISEN?
   *
   * Zwei Faelle, und jede Probe wird gegen ihren EIGENEN Nachweis
   * gerechnet — nicht gegen einen gemeinsamen Commit:
   *
   *   ohne Nachweis   sie ist neu und hat nie angeschlagen
   *   veraltet        ihre Datei oder ihr Tor wurde angefasst, seit sie
   *                   zuletzt angeschlagen hat
   *
   * Damit ist `--geaendert` das, was eine normale Runde braucht: die
   * neuen Proben und die, deren Gegenstand sich bewegt hat. Alles andere
   * kann sich nicht geaendert haben — ausser mittelbar, und dafuer sorgt
   * die Frist in `rhythmus` fuer den vollen Lauf.
   */
  const still = !!TEIL;
  const ohneNachweis = [], veraltet = [];
  for (const p of PROBEN) {
    const nw = nachweisVon(p);
    if (!nw) { ohneNachweis.push(p); continue; }
    const dateien = seitCommit(nw.commit);
    if (!dateien) { veraltet.push(p); continue; }   // Commit weg → sicherheitshalber fahren
    const alle = [p.datei, ...(p.kopie || [])].filter(Boolean);
    if (dateien.has(`tor/${p.tor}.mjs`) || alle.some(d => dateien.has(d))) veraltet.push(p);
  }
  vorauswahl = [...ohneNachweis, ...veraltet];
  geaendertGrund = `${ohneNachweis.length} neu, ${veraltet.length} veraltet`;
  if (!still) console.log(`\n  --geaendert: ${ohneNachweis.length} Probe`
    + `${ohneNachweis.length === 1 ? '' : 'n'} ohne Nachweis, ${veraltet.length} mit einem, `
    + 'der überholt ist.');
  if (still) { /* still */ }
  else if (!vorauswahl.length)
    console.log('  Es gibt nichts nachzuweisen.');
  else
    console.log(`  ${vorauswahl.length} von ${PROBEN.length} werden gefahren. Der Rest kann sich `
      + 'nicht geändert haben —\n  ausser mittelbar, und dafür ist die Frist in `rhythmus` da.');
}

const alleGewaehlt = (NUR.length
  ? vorauswahl.filter(p => NUR.some(n => p.tor === n || p.n.includes(n)))
  : vorauswahl).filter(p => !(p.brauchtStand && !fs.existsSync(STAND)));

/** Alle Proben mit demselben Tor UND denselben Argumenten — sie teilen
 *  sich den gesunden Lauf und gehoeren deshalb zusammen. */
const gruppeVon = (p) => p.tor + ' ' + (p.args || []).join(' ');
const gruppen = [...new Set(alleGewaehlt.filter(p => !p.nachStand).map(gruppeVon))];

/* Im Kind: nur der eigene Teil. Reihum nach Gruppen, damit die Arbeit
 * ungefaehr gleich faellt — die Gruppen sind sehr unterschiedlich gross,
 * aber die teuren (`smoke`) sind auch die zahlreichen. */
const auswahl = (() => {
  if (!TEIL) return alleGewaehlt;
  const [i, n] = TEIL.split('/').map(Number);
  const meine = new Set(gruppen.filter((_, k) => k % n === i));
  return alleGewaehlt.filter(p => !p.nachStand && meine.has(gruppeVon(p)));
})();

if (!TEIL)
  console.log(`\n  proben — ${alleGewaehlt.length} stehende Gegenproben`
    + (vollerLauf ? '' : '  (Auswahl)')
    + (ARBEITER > 1 && gruppen.length > 1 ? `, ${Math.min(ARBEITER, gruppen.length)} nebeneinander` : '')
    + '\n');

/* Beim allerersten Lauf gibt es die Standdatei noch nicht, und zwei Proben
 * brauchen sie zum Anfassen. Sie wird deshalb hier angelegt - ausdruecklich
 * als UNVOLLSTAENDIG. `rhythmus` erkennt das und bleibt rot, bis ein Lauf
 * wirklich durchgegangen ist. Ein halber Probenlauf soll die Kette
 * aufhalten, nicht sie durchwinken. */

let ok = 0, blind = 0, nichtAngekommen = 0;
const befunde = [];
/* WELCHE Proben angeschlagen haben - nicht wieviele.
 *
 * Das ist der ganze Unterschied zum alten Stand. Er hielt eine Zahl fest,
 * und eine Zahl kann nicht sagen, WAS bewiesen ist: kam eine Probe dazu,
 * war der Nachweis fuer alle anderen mit entwertet. */
const angeschlagen = new Set();

/**
 * Ist das Tor OHNE Eingriff ueberhaupt gruen?
 *
 * Ohne diese Frage beweist „schlaegt an" weniger, als es aussieht: ein Tor,
 * das schon vorher rot war, wird auch mit Eingriff rot - und mit derselben
 * Meldung, wenn der Eingriff genau die Pruefung trifft, die ohnehin
 * scheitert. Genau so ist eine Probe heute durchgerutscht: sie meldete
 * „schlaegt an", waehrend das Tor in beiden Zustaenden dieselbe Zeile
 * schrieb.
 *
 * Gefahren wird das einmal je Tor, beim ersten Mal, mit denselben
 * Argumenten wie die Probe. Das kostet ungefaehr einen Kettenlauf - und ist
 * der Preis dafuer, dass „schlaegt an" wirklich heisst, was es sagt.
 */
const gesund = new Map();
const istGesund = (p) => {
  // `ohneSofort` gehoert in den Schluessel: der gesunde Lauf muss DIESELBEN
  // Argumente haben wie die Probe, sonst vergleicht er zwei verschiedene
  // Laeufe.
  const schluessel = p.tor + ' ' + (p.args || []).join(' ') + (p.ohneSofort ? ' /voll' : '');
  if (!gesund.has(schluessel))
    gesund.set(schluessel, lauf(p.tor, undefined, p.args, p.ohneSofort).code === 0);
  return gesund.get(schluessel);
};

/**
 * Zwei Durchgaenge, und `rhythmus` kommt in den zweiten.
 *
 * Waehrend eines Probenlaufs ist `rhythmus` per Definition rot: der
 * festgehaltene Stand ist veraltet - genau deshalb laeuft man ja. Seine
 * Proben wuerden also immer „war schon vorher rot" melden. Sie kommen
 * deshalb NACH dem Schreiben des Standes, wenn der gesunde Zustand
 * wirklich gruen ist. Schlaegt dann eine fehl, wird der eben geschriebene
 * Stand als abgebrochen markiert - er darf keinen Lauf bezeugen, der etwas
 * offen gelassen hat.
 */
const zeiten = [];
const durchgang = (welche) => {
for (const p of welche) {
  const t0 = Date.now();
  /* EINE Zeile in EINEM Stueck.
   *
   * Frueher schrieb der Lauf erst den Namen und spaeter das Ergebnis
   * dahinter. Sobald mehrere Kinder nebeneinander laufen, schiebt sich
   * das eine in die halbe Zeile des anderen — und uebrig bleibt ein
   * „schlaegt an  15 s" ohne Namen. Ein Protokoll, aus dem man nicht mehr
   * ablesen kann, WAS bewiesen wurde, ist keines. */
  const fertig = (wie) => { const s = (Date.now() - t0) / 1000;
    zeiten.push({ n: p.n, tor: p.tor, s });
    console.log(`  ${p.tor.padEnd(11)} ${p.n} … ${wie}  ${s.toFixed(0)} s`); };

  /* --- Eingriff --------------------------------------------------- */
  if (p.kopie) fs.copyFileSync(imBaum(p.kopie[0]), imBaum(p.kopie[1]));
  else {
    const alt = fs.readFileSync(imBaum(p.datei), 'utf8');
    let neu;
    if (p.suchRegex) {
      const m = alt.match(p.suchRegex);
      if (!m) { fertig(rot('Suchtext nicht gefunden')); nichtAngekommen++;
        befunde.push(`${p.n}: der Suchtext steht nicht mehr in ${p.datei} — die Probe zielt ins Leere`);
        wiederherstellen(p.bauen); continue; }
      neu = alt.replace(p.suchRegex, p.ersatzFn(m));
    } else {
      if (!alt.includes(p.such)) { console.log(rot('Suchtext nicht gefunden')); nichtAngekommen++;
        befunde.push(`${p.n}: „${p.such.slice(0,40)}…" steht nicht mehr in ${p.datei}`);
        wiederherstellen(p.bauen); continue; }
      neu = alt.replace(p.such, p.ersatz);
    }
    fs.writeFileSync(imBaum(p.datei), neu);
  }

  if (p.bauen) {
    const b = lauf('bauen');
    if (b.code) { fertig(rot('Bau gescheitert')); nichtAngekommen++;
      befunde.push(`${p.n}: der Bau lief nicht durch — die Probe beweist nichts`);
      wiederherstellen(p.bauen); continue; }
  }

  /* --- Regel 3: ist er angekommen? -------------------------------- */
  let da = true, warum = '';
  if (p.an.gleichWie) {
    const [a, b] = p.an.gleichWie;
    da = fs.readFileSync(imBaum(a)).equals(fs.readFileSync(imBaum(b)));
    warum = 'die beiden Symbole sind nicht gleich';
  } else if (p.an.datei) {
    const wo = imBaum(p.an.datei);
    const t = fs.existsSync(wo) ? fs.readFileSync(wo, 'utf8') : '';
    if (p.an.fehlt) { da = !t.includes(p.an.fehlt); warum = `„${p.an.fehlt}" steht noch in ${p.an.datei}`; }
    else if (p.an.regex) { da = p.an.regex.test(t); warum = `nichts passt in ${p.an.datei}`; }
    else { da = t.includes(p.an.text); warum = `„${p.an.text}" fehlt in ${p.an.datei}`; }
  }
  if (!da) {
    fertig(rot('Eingriff NICHT angekommen'));
    nichtAngekommen++;
    befunde.push(`${p.n}: ${warum}. Ein Eingriff, der nicht ankommt, sieht aus `
      + 'wie ein bestandenes Tor — diese Probe beweist nichts.');
    wiederherstellen(p.bauen); continue;
  }

  /* --- Schlägt das Tor an? ---------------------------------------- */
  const r = lauf(p.tor, p.umgebung, p.args, p.ohneSofort);
  wiederherstellen(p.bauen);

  // Erst jetzt fragen, ob es ohne Eingriff gruen gewesen waere: der Baum
  // ist wiederhergestellt, und bei den meisten Proben erspart das den
  // gesunden Lauf ganz - denn wenn das Tor gruen BLEIBT, ist die Antwort
  // ohnehin belanglos.
  if (r.code !== 0 && !istGesund(p)) {
    fertig(rot('war schon vorher rot'));
    blind++;
    befunde.push(`${p.n}: \`${p.tor}\` ist schon OHNE Eingriff rot — `
      + 'diese Probe beweist nichts, sie stellt nur einen bestehenden Fehler nach.');
    continue;
  }

  if (r.code === 0) {
    fertig(rot('TOR BLEIBT GRÜN'));
    blind++;
    befunde.push(`${p.n}: \`${p.tor}\` bleibt grün, obwohl der Fehler drin ist — `
      + 'das Tor beweist an dieser Stelle nichts.');
    if (LAUT) console.log(r.aus.split('\n').slice(-14).map(z => '      ' + z).join('\n'));
    continue;
  }
  if (p.sagt && !r.aus.includes(p.sagt)) {
    fertig(rot('rot, aber nicht deswegen'));
    blind++;
    befunde.push(`${p.n}: \`${p.tor}\` wird rot, meldet aber nicht „${p.sagt}" — `
      + 'es fällt vielleicht aus einem anderen Grund durch.');
    if (LAUT) console.log(r.aus.split('\n').slice(-14).map(z => '      ' + z).join('\n'));
    continue;
  }
  fertig(gruen('schlägt an'));
  angeschlagen.add(p.n);
  ok++;
}
};
/* Erst die Kinder, dann — falls es keine gibt — selbst.
 *
 * Der Elternteil faehrt keine einzige Probe, wenn er Kinder hat: sonst
 * haette er die Kopie am Hals, die er gerade verteilt. Er sammelt nur
 * ein, schreibt den Stand und faehrt den zweiten Durchgang.
 */
const nebenlaeufig = !TEIL && ARBEITER > 1 && gruppen.length > 1
  && auswahl.filter(p => !p.nachStand).length > 1;

if (nebenlaeufig) {
  const wieviele = Math.min(ARBEITER, gruppen.length);
  const kinder = [];
  const ablagen = [];
  for (let i = 0; i < wieviele; i++) {
    const ablage = path.join(HAUPT, `.probenbaum-${i}.json`);
    ablagen.push(ablage);
    const args = [...process.argv.slice(2).filter(a =>
      !a.startsWith('--teil=') && !a.startsWith('--ergebnis=') && !a.startsWith('--kopie=')),
      `--teil=${i}/${wieviele}`, `--ergebnis=${ablage}`, `--kopie=.probenbaum-${i}`];
    kinder.push(new Promise((fertig) => {
      const k = spawn(process.execPath, ['tor/proben.mjs', ...args],
        { cwd: HAUPT, stdio: ['ignore', 'inherit', 'inherit'] });
      k.on('close', (code) => fertig(code));
    }));
  }
  const anteile = await Promise.all(kinder);
  for (const ablage of ablagen) {
    if (!fs.existsSync(ablage)) {
      befunde.push(`Ein Teillauf hat kein Ergebnis hinterlassen (${path.basename(ablage)}) — `
        + 'was er fahren sollte, ist ungeprüft.');
      continue;
    }
    const teil = JSON.parse(fs.readFileSync(ablage, 'utf8'));
    ok += teil.ok; blind += teil.blind; nichtAngekommen += teil.nichtAngekommen;
    for (const n of teil.angeschlagen) angeschlagen.add(n);
    befunde.push(...teil.befunde);
    zeiten.push(...teil.zeiten);
    fs.rmSync(ablage, { force:true });
  }
  const abgestuerzt = anteile.filter(c => c !== 0 && c !== 1).length;
  if (abgestuerzt)
    befunde.push(`${abgestuerzt} Teillauf${abgestuerzt === 1 ? '' : 'e'} ist abgestürzt — `
      + 'seine Proben sind ungeprüft.');
} else {
  durchgang(auswahl.filter(p => !p.nachStand));
}

/* Das Kind ist hier fertig: es legt sein Ergebnis ab und schweigt zum
 * Rest. Stand schreiben, Tore zaehlen und der zweite Durchgang gehoeren
 * dem Elternteil — sonst taeten es alle drei gleichzeitig. */
if (TEIL) {
  fs.writeFileSync(ERGEBNIS, JSON.stringify({
    ok, blind, nichtAngekommen, befunde, zeiten, angeschlagen: [...angeschlagen] }));
  process.exit(befunde.length ? 1 : 0);
}

/* --- Hat jedes Tor der Kette überhaupt eine Probe? -------------------- *
 *
 * Die haeufigste Verfallsart ist nicht die falsche Probe, sondern die
 * FEHLENDE: ein neues Tor kommt dazu, und niemand traegt eine nach. Das
 * faellt nie auf, weil alles gruen ist.
 */
const kette = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts.tor
  .split('&&').map(s => s.trim().replace(/^npm run /, ''))
  .filter(t => t !== 'bauen');
const ohne = kette.filter(t => !PROBEN.some(p => p.tor === t));

console.log('');
if (ohne.length) {
  console.log(`  ${rot('Ohne Gegenprobe:')} ${ohne.join(', ')}`);
  befunde.push(`Diese Tore der Kette haben keine stehende Gegenprobe: ${ohne.join(', ')}`);
}

/* --- Und die Unter-Tore von `inhalt`? ---------------------------------
 *
 * `inhalt` ist EIN npm-Skript, aber SIEBEN Pruefungen. Die Liste steht
 * nicht hier - sie wird aus `tor/inhalt.mjs` gelesen. Ein neues Unter-Tor
 * meldet sich damit von selbst, statt still ungeprueft zu bleiben; genau so
 * ist `beruehrung` aufgefallen, das keinen einzigen Fehlerpfad hatte.
 */
const unterTore = [...fs.readFileSync('tor/inhalt.mjs', 'utf8')
  .matchAll(/console\.log\('\\n  Tor `(\w+)`'\)/g)].map(m => m[1]);
const unbewacht = unterTore.filter(t => !PROBEN.some(p => p.deckt === t));
if (unbewacht.length) {
  console.log(`  ${rot('Unter-Tore von `inhalt` ohne Gegenprobe:')} ${unbewacht.join(', ')}`);
  befunde.push(`Diese Prüfungen in inhalt.mjs hat keine Gegenprobe je rot gesehen: `
    + unbewacht.join(', '));
} else {
  console.log(`  Alle ${unterTore.length} Prüfungen in \`inhalt\` sind gegengeprobt: `
    + unterTore.join(' · '));
}

/* Wo die Zeit liegt. Ohne diese Zahl waere jede Beschleunigung geraten. */
const gesamt = zeiten.reduce((a, z) => a + z.s, 0);
const jeTor = {};
for (const z of zeiten) jeTor[z.tor] = (jeTor[z.tor] || 0) + z.s;
console.log(`\n  ${(gesamt/60).toFixed(1)} min für ${zeiten.length} Proben:`);
for (const [t, s] of Object.entries(jeTor).sort((a,b)=>b[1]-a[1]))
  console.log(`    ${t.padEnd(12)} ${s.toFixed(0).padStart(4)} s`
    + `  ${'█'.repeat(Math.round(s/gesamt*40))}`);

console.log(`\n  ${ok} schlagen an, ${blind} beweisen nichts, `
  + `${nichtAngekommen} kamen nicht an.\n`);
for (const b of befunde) console.log(`  ✗ ${b}`);

/* Was angeschlagen HAT, wird festgehalten - auch wenn der Lauf rot ist.
 *
 * Hier stand ein `process.exit(1)`, und es hat einundzwanzig Minuten
 * Arbeit weggeworfen: 65 von 67 Proben schlugen an, zwei bewiesen nichts
 * (ein Vorbild aenderte sich von selbst), und weil der Lauf damit rot war,
 * wurde KEIN einziger Nachweis geschrieben.
 *
 * Das ist nicht nur teuer, es ist eine Falle mit Rueckkopplung: ohne
 * Nachweise altern alle 71 Proben weiter, `rhythmus` wird rot, und die
 * Antwort darauf ist wieder ein voller Lauf - der am selben Befund wieder
 * nichts schreibt. Genau so sind 66 Nachweise fuenf Runden alt geworden.
 *
 * `rhythmus` liest den Stand JE PROBE. Eine Probe, die angeschlagen hat,
 * hat angeschlagen - unabhaengig von ihrer Nachbarin. Ihren Nachweis zu
 * verschweigen ist keine Vorsicht, sondern ein Verlust. Was nicht
 * angeschlagen hat, bekommt weiterhin keinen Eintrag und faellt `rhythmus`
 * als "hat noch nie angeschlagen" auf - der Befund bleibt also sichtbar.
 *
 * Rot bleibt der Lauf trotzdem: das entscheidet der Schluss weiter unten.
 */
const ersterDurchgangRot = befunde.length > 0;
/* --- Den Lauf festhalten ----------------------------------------------
 *
 * Nur bei einem sauber gruenen Lauf. Die Datei ist die einzige Stelle, an
 * der spaeter noch steht, DASS geprobt wurde - `npm run rhythmus` liest sie
 * und schlaegt an, wenn der letzte volle Lauf zu lange zurueckliegt.
 *
 * Warum das noetig ist: eine Regel, die nur in einem Dokument steht, wird
 * gebrochen. In Towerfront hat genau das sechsmal eine Runde gekostet, und
 * dort steht sie seit Fassung 40 in der ersten Datei, die jede Sitzung
 * liest.
 */
/* Festgehalten wird JE PROBE — und deshalb auch bei einer Auswahl.
 *
 * Frueher schrieb nur der volle Lauf, und er schrieb eine ZAHL. Wer eine
 * Probe dazuschrieb, entwertete damit den Nachweis fuer alle anderen: die
 * Zahl stimmte nicht mehr, `rhythmus` wurde rot, und es half nur, alle
 * neunundsechzig noch einmal zu fahren. In einer einzigen Sitzung waren
 * das vier volle Laeufe und hundert Minuten — waehrend die Frist „alle
 * drei Runden", die das eigentlich regeln sollte, nie zum Zug kam.
 *
 * Jetzt traegt jede Probe ihren eigenen Nachweis: Commit und Datum. Eine
 * neue Probe kostet diese Probe. Eine Auswahl erneuert genau die, die sie
 * gefahren hat — die anderen altern weiter, bis die Frist sie faellig
 * macht. Damit loest erst die Frist den vollen Lauf aus, so wie gedacht.
 *
 * Eintraege zu Proben, die es nicht mehr gibt, fallen weg: ein Nachweis
 * fuer etwas, das niemand mehr faehrt, ist Ballast.
 */
const kopf = execSync('git rev-parse HEAD', { encoding:'utf8' }).trim();
const heute = new Date().toISOString().slice(0, 10);
const bisher = fs.existsSync(STAND)
  ? (JSON.parse(fs.readFileSync(STAND, 'utf8')).proben || {}) : {};
/* `aufVorschuss`: die Proben des ZWEITEN Durchgangs bekommen ihren Eintrag,
 * bevor sie gelaufen sind.
 *
 * Das ist kein Schummeln, sondern ein Henne-Ei. Die vier `rhythmus`-Proben
 * pruefen `rhythmus` — und `rhythmus` verlangt, dass jede Probe einen
 * Nachweis hat. Ohne Vorschuss waere das Tor schon OHNE Eingriff rot,
 * naemlich wegen dieser vier, und alle vier meldeten „war schon vorher
 * rot" statt zu beweisen.
 *
 * Genau das leistete frueher die Marke „lauf": "vollständig", die vor dem
 * zweiten Durchgang geschrieben und bei einem Fehlschlag auf
 * „abgebrochen" zurueckgesetzt wurde. Dasselbe passiert hier, nur je
 * Probe: schlaegt eine nicht an, wird ihr Eintrag unten wieder
 * weggenommen und der Lauf ist rot. Ein Vorschuss, der zurueckgefordert
 * wird, ist kein Beweis auf Kredit.
 */
const standSchreiben = (aufVorschuss = []) => {
  const vorschuss = new Set(aufVorschuss.map(p => p.n));
  const proben = {};
  for (const p of PROBEN) {
    if (angeschlagen.has(p.n) || vorschuss.has(p.n)) proben[p.n] = { commit: kopf, zeit: heute };
    else if (bisher[p.n]) proben[p.n] = bisher[p.n];
  }
  schreibeStand(JSON.stringify({
    form: 2, zeit: heute,
    tore: [...new Set(PROBEN.map(p => p.tor))].sort(),
    unterTore: unterTore.sort(),
    proben,
  }, null, 2) + '\n');
  return proben;
};

/* Der Stand gehört in den ARBEITSBAUM — er ist das Ergebnis des Laufs und
 * wird eingecheckt. In die Kopie kommt er trotzdem: die vier
 * `rhythmus`-Proben laufen dort und sollen den FRISCHEN Stand vorfinden,
 * nicht den, mit dem die Kopie ausgecheckt wurde. */
function schreibeStand(text) {
  fs.writeFileSync(STAND, text);
  fs.writeFileSync(imBaum(STAND), text);
}

const spaeter = auswahl.filter(p => p.nachStand);
{
  const geschrieben = standSchreiben(spaeter);
  console.log(`  Festgehalten in ${STAND}: ${angeschlagen.size} Probe`
    + `${angeschlagen.size === 1 ? '' : 'n'} frisch auf ${kopf.slice(0, 7)}, `
    + `${Object.keys(geschrieben).length} von ${PROBEN.length} mit Nachweis.`);
}

// Und jetzt erst die Proben, die einen frischen Stand brauchen.
if (spaeter.length) {
  console.log(`\n  Zweiter Durchgang — ${spaeter.length} Proben am frischen Stand:\n`);
  const vorher = befunde.length;
  gesund.clear();
  nachRestore = () => standSchreiben(spaeter);
  durchgang(spaeter);
  nachRestore = null;
  if (befunde.length > vorher) {
    // Die Proben des zweiten Durchgangs haben nicht angeschlagen - also
    // bekommen sie auch keinen frischen Eintrag. Eine eigene Marke
    // „abgebrochen" braucht es dafuer nicht mehr.
    // Der Vorschuss wird zurueckgefordert: was nicht angeschlagen hat,
    // bekommt keinen Nachweis — auch keinen alten.
    for (const p of spaeter) if (!angeschlagen.has(p.n)) delete bisher[p.n];
    nachRestore = null;
    standSchreiben();
    console.log('');
    for (const b of befunde.slice(vorher)) console.log(`  ✗ ${b}`);
    console.log(`\n  proben ROT im zweiten Durchgang — ${STAND} als abgebrochen markiert.\n`);
    process.exit(1);
  }
}
if (ersterDurchgangRot) {
  console.log(`\n  proben ROT: ${ok} Gegenproben schlagen an, ${blind + nichtAngekommen} nicht.`);
  console.log(`  Die ${ok}, die angeschlagen haben, sind in ${STAND} festgehalten —`);
  console.log('  ihr Nachweis geht nicht verloren, weil eine andere Probe scheitert.\n');
  process.exit(1);
}
console.log(`\n  proben grün: ${ok} Gegenproben, alle schlagen an.\n`);
