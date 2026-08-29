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
import { execFileSync, execSync } from 'node:child_process';

const NUR = process.argv.slice(2).filter(a => !a.startsWith('-'));
const STAND = 'tor/proben-stand.json';
const LAUT = process.argv.includes('--laut');
const GEAENDERT = process.argv.includes('--geaendert');

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
  { n:'die Vorschau schiebt einen ungeprüften Stand unter /', tor:'inhalt', deckt:'doku',
    datei:'.github/workflows/vorschau-versand.yml',
    such:'          n=$(gh api "repos/${GITHUB_REPOSITORY}/actions/workflows/auslieferung.yml/runs?head_sha=${sha}&status=success" --jq \'.total_count\')',
    ersatz:'          n=1',
    an:{ datei:'.github/workflows/vorschau-versand.yml', fehlt:'head_sha=' },
    sagt:'die Kette bestanden hat' },

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

  /* --- lesbarkeit --------------------------------------------------- */
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
  { n:'die Seite wächst unbemerkt', tor:'budget', bauen:true, datei:D,
    such:"const LOB = [", ersatz:"const FUELL = '" + rauschen(24000) + "';\nconst LOB = [",
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
    sagt:'Runden zurück' },
  { n:'ein abgebrochener Probenlauf winkt durch', tor:'rhythmus', brauchtStand:true, nachStand:true,
    datei:'tor/proben-stand.json',
    such:'"lauf": "vollständig"', ersatz:'"lauf": "abgebrochen"',
    an:{ datei:'tor/proben-stand.json', text:'"lauf": "abgebrochen"' },
    sagt:'nicht durchgelaufen' },
  { n:'ein neues Tor steht in der Kette, aber nicht im Stand', tor:'rhythmus',
    brauchtStand:true, nachStand:true, datei:'package.json',
    such:'npm run rhythmus && npm run inhalt',
    ersatz:'npm run rhythmus && npm run neuestor && npm run inhalt',
    an:{ datei:'package.json', text:'npm run neuestor' },
    sagt:'noch nicht in der Kette' },
  { n:'eine Probe kam dazu, ohne dass geprobt wurde', tor:'rhythmus', brauchtStand:true, nachStand:true,
    datei:'tor/proben-stand.json',
    suchRegex:/"proben": \d+/, ersatzFn:()=>'"proben": 1',
    an:{ datei:'tor/proben-stand.json', text:'"proben": 1' },
    sagt:'ein anderer' },

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
    suchRegex:/      const h = liste\.querySelector[\s\S]*?vorlesen\('Lass es auf dem Land los\.'\);\n/,
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
    suchRegex:/  setTimeout\(\(\)=>\{\n    const teile = \[frageText\];[\s\S]*?\}, 500\);\n/,
    ersatzFn:()=>'',
    an:{ ...DIST, fehlt:'const teile = [frageText]' },
    sagt:'vorgelesen' },
  // Und sie haengt am KIND: Lea liest, fuer sie waere dieselbe Ansage Laerm.
  { n:'die Ansage hängt nicht mehr am Kind', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
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

  { n:'eine richtige Antwort wird nicht mehr gewertet', tor:'smoke', args:['--nur=durchgang'], bauen:true, datei:D,
    such:"if (ctx.getroffen===ziel.id && roh===ziel.name) ergebnis='richtig';",
    ersatz:"if (false) ergebnis='richtig';",
    an:{ ...DIST, text:"if (false) ergebnis='richtig';" }, sagt:'' },
];

/* ---------------------------------------------------------------------- */

const rot = (s) => `\x1b[31m${s}\x1b[0m`, gruen = (s) => `\x1b[32m${s}\x1b[0m`;

/* Regel 1, erzwungen statt aufgeschrieben. */
const schmutzig = execSync('git status --porcelain', { encoding:'utf8' }).trim();
if (schmutzig && !process.argv.includes('--trotzdem')) {
  console.log('\n  proben verweigert den Dienst: der Baum ist schmutzig.\n');
  console.log('  Wiederhergestellt wird mit `git checkout` — das löscht, was hier');
  console.log('  noch nicht eingecheckt ist. Genau das ist in diesem Projekt schon');
  console.log('  passiert, obwohl die Regel danebenstand.\n');
  for (const z of schmutzig.split('\n').slice(0, 12)) console.log('    ' + z);
  console.log('\n  Erst einchecken, dann proben.\n');
  process.exit(2);
}

/* Kein fremder Browser im Haus.
 *
 * Ein Probenlauf wurde per Zeitueberschreitung hart abgeschossen; sein
 * Chromium lief vermutlich weiter. Im naechsten Lauf meldeten zwei
 * Rauchtest-Proben „beweist nichts", einzeln gefahren aber schlugen beide
 * an - und im uebernaechsten Lauf alle siebzehn. Beweisen laesst sich das
 * nachtraeglich nicht mehr, und genau das ist das Problem: eine
 * Gegenprobe, die zweimal Verschiedenes sagt, ist schlimmer als eine
 * fehlende, weil man ihr danach nicht mehr glaubt.
 *
 * Also wird aus dem unsichtbaren Verdacht eine laute Weigerung. Ob ein
 * uebriggebliebener Browser wirklich stoert, ist damit immer noch nicht
 * bewiesen - aber er kann es kein zweites Mal unbemerkt gewesen sein.
 */
const fremdeBrowser = (() => {
  try {
    // Gesucht wird am PROGRAMMNAMEN, nicht an der Befehlszeile. Der erste
    // Entwurf las `ps -eo pid,args` und suchte darin nach „chrome" - und
    // verweigerte prompt den Dienst, obwohl kein Browser lief: gefunden
    // hatte er die eigene Shell-Zeile, in der das Wort vorkam. Eine
    // Weigerung, die immer anschlaegt, ist so wertlos wie ein Tor, das nie
    // etwas meldet.
    return execSync('ps -eo pid=,comm=,args=', { encoding:'utf8' })
      .split('\n')
      .map(z => z.trim().match(/^(\d+)\s+(\S+)\s*(.*)$/))
      .filter(m => m && /^(chrome|chromium|headless_shell)/i.test(m[2]))
      .map(m => `${m[1]}  ${m[3] || m[2]}`);
  } catch { return []; }   // kein `ps` (Windows) — dann eben ohne diese Pruefung
})();
if (fremdeBrowser.length && !process.argv.includes('--trotzdem')) {
  console.log('\n  proben verweigert den Dienst: es laeuft schon ein Browser.\n');
  console.log('  Die Rauchtest-Proben starten Chromium selbst. Ein uebriggebliebener');
  console.log('  aus einem abgebrochenen Lauf teilt sich Speicher und Anschluesse mit');
  console.log('  ihnen — und eine Probe, die daran scheitert, meldet „beweist nichts"');
  console.log('  statt „hier stimmt etwas nicht". Genau so ist es einmal passiert.\n');
  for (const z of fremdeBrowser.slice(0, 6)) console.log('    ' + z.slice(0, 100));
  console.log('\n  Aufraeumen: pkill -f chrome     Trotzdem fahren: --trotzdem\n');
  process.exit(2);
}

const lauf = (befehl, umgebung, args) => {
  try {
    return { code:0, aus: execFileSync('npm', ['run', befehl, ...(args ? ['--', ...args] : [])],
      { encoding:'utf8', stdio:['ignore','pipe','pipe'],
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
  execSync('git checkout -- .', { stdio:'ignore' });
  if (nachRestore) nachRestore();
  if (gebaut) execFileSync('npm', ['run', 'bauen'], { stdio:'ignore' });
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
const seitDemStand = () => {
  if (!fs.existsSync(STAND)) return null;
  const basis = JSON.parse(fs.readFileSync(STAND, 'utf8')).fassung;
  if (!basis) return null;
  try {
    return new Set(execSync(`git diff --name-only ${basis} HEAD`, { encoding:'utf8' })
      .split('\n').map(x => x.trim()).filter(Boolean));
  } catch (e) { return null; }
};

let geaendertGrund = '';
let vorauswahl = PROBEN;
if (GEAENDERT) {
  const dateien = seitDemStand();
  if (!dateien) {
    console.log('\n  --geaendert braucht einen festgehaltenen Stand mit Commit und die');
    console.log('  Historie dazu. Beides fehlt — es läuft der volle Satz.\n');
  } else if (dateien.size === 0) {
    console.log('\n  --geaendert: seit dem letzten vollen Lauf hat sich keine Datei');
    console.log('  geändert. Es gibt nichts nachzuweisen.\n');
    vorauswahl = [];
    geaendertGrund = 'nichts geändert';
  } else {
    // Ein Tor gilt als angefasst, wenn seine Datei im Diff steht. Unter-Tore
    // (`deckt`) haengen an derselben Datei wie ihr Traeger.
    const torBeruehrt = (p) => dateien.has(`tor/${p.tor}.mjs`);
    const dateiBeruehrt = (p) => {
      const alle = [p.datei, ...(p.kopie || [])].filter(Boolean);
      return alle.some(d => dateien.has(d));
    };
    vorauswahl = PROBEN.filter(p => torBeruehrt(p) || dateiBeruehrt(p));
    geaendertGrund = `${dateien.size} geänderte Datei${dateien.size === 1 ? '' : 'en'}`;
    console.log(`\n  --geaendert: ${dateien.size} Datei${dateien.size === 1 ? '' : 'en'} seit dem `
      + `letzten vollen Lauf.`);
    console.log(`  ${vorauswahl.length} von ${PROBEN.length} Proben greifen dort ein oder fahren`);
    console.log('  ein Tor, das angefasst wurde. Der Rest kann sich nicht geändert haben —');
    console.log('  ausser mittelbar, und dafür ist der volle Lauf alle drei Runden da.');
  }
}

const auswahl = (NUR.length
  ? vorauswahl.filter(p => NUR.some(n => p.tor === n || p.n.includes(n)))
  : vorauswahl).filter(p => !(p.brauchtStand && !fs.existsSync(STAND)));

console.log(`\n  proben — ${auswahl.length} stehende Gegenproben`
  + (vollerLauf ? '' : '  (Auswahl — schreibt keinen Stand)') + '\n');

/* Beim allerersten Lauf gibt es die Standdatei noch nicht, und zwei Proben
 * brauchen sie zum Anfassen. Sie wird deshalb hier angelegt - ausdruecklich
 * als UNVOLLSTAENDIG. `rhythmus` erkennt das und bleibt rot, bis ein Lauf
 * wirklich durchgegangen ist. Ein halber Probenlauf soll die Kette
 * aufhalten, nicht sie durchwinken. */

let ok = 0, blind = 0, nichtAngekommen = 0;
const befunde = [];

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
  const schluessel = p.tor + ' ' + (p.args || []).join(' ');
  if (!gesund.has(schluessel)) gesund.set(schluessel, lauf(p.tor, undefined, p.args).code === 0);
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
  const fertig = (wie) => { const s = (Date.now() - t0) / 1000;
    zeiten.push({ n: p.n, tor: p.tor, s });
    console.log(`${wie}  ${s.toFixed(0)} s`); };
  process.stdout.write(`  ${p.tor.padEnd(11)} ${p.n} … `);

  /* --- Eingriff --------------------------------------------------- */
  if (p.kopie) fs.copyFileSync(p.kopie[0], p.kopie[1]);
  else {
    const alt = fs.readFileSync(p.datei, 'utf8');
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
    fs.writeFileSync(p.datei, neu);
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
    da = fs.readFileSync(a).equals(fs.readFileSync(b));
    warum = 'die beiden Symbole sind nicht gleich';
  } else if (p.an.datei) {
    const t = fs.existsSync(p.an.datei) ? fs.readFileSync(p.an.datei, 'utf8') : '';
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
  const r = lauf(p.tor, p.umgebung, p.args);
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
  ok++;
}
};
durchgang(auswahl.filter(p => !p.nachStand));

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
if (befunde.length) { console.log(''); process.exit(1); }
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
if (!vollerLauf) {
  console.log(`  proben grün: ${ok} Gegenproben, alle schlagen an.`);
  console.log(`  Nur eine Auswahl gelaufen — ${STAND} bleibt, wie er war.\n`);
  process.exit(0);
}
const kopf = execSync('git rev-parse HEAD', { encoding:'utf8' }).trim();
const standSchreiben = (wie) => fs.writeFileSync(STAND, JSON.stringify({
  zeit: new Date().toISOString().slice(0, 10),
  fassung: kopf,
  proben: PROBEN.length,
  tore: [...new Set(PROBEN.map(p => p.tor))].sort(),
  unterTore: unterTore.sort(),
  lauf: wie,
}, null, 2) + '\n');

standSchreiben('vollständig');
console.log(`  Festgehalten in ${STAND} auf ${kopf.slice(0, 7)}.`);

// Und jetzt erst die Proben, die einen frischen Stand brauchen.
const spaeter = auswahl.filter(p => p.nachStand);
if (spaeter.length) {
  console.log(`\n  Zweiter Durchgang — ${spaeter.length} Proben am frischen Stand:\n`);
  const vorher = befunde.length;
  gesund.clear();
  nachRestore = () => standSchreiben('vollständig');
  durchgang(spaeter);
  nachRestore = null;
  if (befunde.length > vorher) {
    standSchreiben('abgebrochen');
    console.log('');
    for (const b of befunde.slice(vorher)) console.log(`  ✗ ${b}`);
    console.log(`\n  proben ROT im zweiten Durchgang — ${STAND} als abgebrochen markiert.\n`);
    process.exit(1);
  }
}
console.log(`\n  proben grün: ${ok} Gegenproben, alle schlagen an.\n`);
