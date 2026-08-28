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
  { n:'der letzte Probenlauf liegt zu lange zurück', tor:'rhythmus', brauchtStand:true,
    umgebung:{ SMARTKIDS_RHYTHMUS_MAX:'-1' },
    datei:'tor/proben-stand.json',
    suchRegex:/"zeit": "([\d-]+)"/, ersatzFn:(m)=>`"zeit": "${m[1]}"`,   // unveraendert
    an:{ datei:'tor/proben-stand.json', regex:/"zeit": "[\d-]+"/ },
    sagt:'Runden zurück' },
  { n:'ein abgebrochener Probenlauf winkt durch', tor:'rhythmus', brauchtStand:true,
    datei:'tor/proben-stand.json',
    such:'"lauf": "vollständig"', ersatz:'"lauf": "abgebrochen"',
    an:{ datei:'tor/proben-stand.json', text:'"lauf": "abgebrochen"' },
    sagt:'nicht durchgelaufen' },
  { n:'ein neues Tor steht in der Kette, aber nicht im Stand', tor:'rhythmus',
    brauchtStand:true, datei:'package.json',
    such:'npm run rhythmus && npm run inhalt',
    ersatz:'npm run rhythmus && npm run neuestor && npm run inhalt',
    an:{ datei:'package.json', text:'npm run neuestor' },
    sagt:'noch nicht in der Kette' },
  { n:'eine Probe kam dazu, ohne dass geprobt wurde', tor:'rhythmus', brauchtStand:true,
    datei:'tor/proben-stand.json',
    suchRegex:/"proben": \d+/, ersatzFn:()=>'"proben": 1',
    an:{ datei:'tor/proben-stand.json', text:'"proben": 1' },
    sagt:'ein anderer' },

  /* --- ziehen (fünf) ------------------------------------------------ */
  { n:'keine Nachsicht — nur der exakte Punkt zählt', tor:'ziehen', bauen:true, datei:D,
    such:'const NACHSICHT = 60;', ersatz:'const NACHSICHT = 0;',
    an:{ ...DIST, text:'NACHSICHT = 0' }, sagt:'Nachsicht nur' },
  { n:'die Nachsicht reicht zu weit — jeder Wurf trifft', tor:'ziehen', bauen:true, datei:D,
    such:'const NACHSICHT = 60;', ersatz:'const NACHSICHT = 400;',
    an:{ ...DIST, text:'NACHSICHT = 400' }, sagt:'Protokolleintrag' },
  { n:'das gezogene Schild bleibt anfassbar', tor:'ziehen', bauen:true, datei:V,
    such:'transition:none;pointer-events:none;', ersatz:'transition:none;',
    an:{ ...DIST, fehlt:'transition:none;pointer-events:none;' }, sagt:'Von oben' },
  { n:'ein Fehlwurf bleibt stumm', tor:'ziehen', bauen:true, datei:D,
    suchRegex:/      const h = liste\.querySelector[\s\S]*?vorlesen\('Lass es auf dem Land los\.'\);\n/,
    ersatzFn:()=>'',
    an:{ ...DIST, fehlt:"Lass es auf dem Land los." }, sagt:'ohne jede Rückmeldung' },
  { n:'schon ein Antippen hebt das Etikett auf', tor:'ziehen', bauen:true, datei:D,
    such:'if(!auf){ if(Math.hypot(ev.clientX-start.x, ev.clientY-start.y) < 6) return; aufheben(); }',
    ersatz:'if(!auf){ aufheben(); }',
    an:{ ...DIST, text:'if(!auf){ aufheben(); }' }, sagt:'Antippen' },

  /* --- ansicht ------------------------------------------------------ */
  { n:'die Karte wechselt die Farbe', tor:'ansicht', bauen:true, datei:'src/marken/marken.css',
    such:'--f1: oklch(0.74 0.135  25)', ersatz:'--f1: oklch(0.74 0.135 195)',
    an:{ ...DIST, text:'oklch(0.74 0.135 195)' }, sagt:'rot' },

  /* --- pwa ---------------------------------------------------------- */
  { n:'ein Symbol im Manifest gibt es nicht', tor:'pwa', bauen:true, datei:'prototyp/bauen.mjs',
    such:"{ src:'./symbol-192.png',  sizes:'192x192',   type:'image/png', purpose:'any' },",
    ersatz:"{ src:'./symbol-999.png',  sizes:'999x999',   type:'image/png', purpose:'any' },",
    an:{ datei:'dist/manifest.webmanifest', text:'symbol-999.png' }, sagt:'symbol-999' },

  /* --- smoke -------------------------------------------------------- */
  { n:'eine richtige Antwort wird nicht mehr gewertet', tor:'smoke', bauen:true, datei:D,
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

const lauf = (befehl, umgebung) => {
  try {
    return { code:0, aus: execFileSync('npm', ['run', befehl],
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
const wiederherstellen = (gebaut) => {
  execSync('git checkout -- .', { stdio:'ignore' });
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
const vollerLauf = NUR.length === 0;
const erstlauf = !fs.existsSync(STAND);
if (vollerLauf && erstlauf) {
  console.log('  ERSTLAUF: es gibt noch keinen festgehaltenen Stand. Die beiden Proben,');
  console.log('  die einen brauchen, werden übersprungen — der nächste Lauf prüft sie.\n');
}

const auswahl = (NUR.length
  ? PROBEN.filter(p => NUR.some(n => p.tor === n || p.n.includes(n)))
  : PROBEN).filter(p => !(p.brauchtStand && !fs.existsSync(STAND)));

console.log(`\n  proben — ${auswahl.length} stehende Gegenproben`
  + (vollerLauf ? '' : '  (Auswahl — schreibt keinen Stand)') + '\n');

/* Beim allerersten Lauf gibt es die Standdatei noch nicht, und zwei Proben
 * brauchen sie zum Anfassen. Sie wird deshalb hier angelegt - ausdruecklich
 * als UNVOLLSTAENDIG. `rhythmus` erkennt das und bleibt rot, bis ein Lauf
 * wirklich durchgegangen ist. Ein halber Probenlauf soll die Kette
 * aufhalten, nicht sie durchwinken. */

let ok = 0, blind = 0, nichtAngekommen = 0;
const befunde = [];

for (const p of auswahl) {
  process.stdout.write(`  ${p.tor.padEnd(11)} ${p.n} … `);

  /* --- Eingriff --------------------------------------------------- */
  if (p.kopie) fs.copyFileSync(p.kopie[0], p.kopie[1]);
  else {
    const alt = fs.readFileSync(p.datei, 'utf8');
    let neu;
    if (p.suchRegex) {
      const m = alt.match(p.suchRegex);
      if (!m) { console.log(rot('Suchtext nicht gefunden')); nichtAngekommen++;
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
    if (b.code) { console.log(rot('Bau gescheitert')); nichtAngekommen++;
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
    console.log(rot('Eingriff NICHT angekommen'));
    nichtAngekommen++;
    befunde.push(`${p.n}: ${warum}. Ein Eingriff, der nicht ankommt, sieht aus `
      + 'wie ein bestandenes Tor — diese Probe beweist nichts.');
    wiederherstellen(p.bauen); continue;
  }

  /* --- Schlägt das Tor an? ---------------------------------------- */
  const r = lauf(p.tor, p.umgebung);
  wiederherstellen(p.bauen);

  if (r.code === 0) {
    console.log(rot('TOR BLEIBT GRÜN'));
    blind++;
    befunde.push(`${p.n}: \`${p.tor}\` bleibt grün, obwohl der Fehler drin ist — `
      + 'das Tor beweist an dieser Stelle nichts.');
    if (LAUT) console.log(r.aus.split('\n').slice(-14).map(z => '      ' + z).join('\n'));
    continue;
  }
  if (p.sagt && !r.aus.includes(p.sagt)) {
    console.log(rot(`rot, aber nicht deswegen`));
    blind++;
    befunde.push(`${p.n}: \`${p.tor}\` wird rot, meldet aber nicht „${p.sagt}" — `
      + 'es fällt vielleicht aus einem anderen Grund durch.');
    if (LAUT) console.log(r.aus.split('\n').slice(-14).map(z => '      ' + z).join('\n'));
    continue;
  }
  console.log(gruen('schlägt an'));
  ok++;
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
console.log(`  proben grün: jedes Tor der Kette hat eine Gegenprobe, und jede schlägt an.`);
if (!vollerLauf) {
  console.log(`  Nur eine Auswahl gelaufen — ${STAND} bleibt, wie er war.\n`);
  process.exit(0);
}
const kopf = execSync('git rev-parse HEAD', { encoding:'utf8' }).trim();
fs.writeFileSync(STAND, JSON.stringify({
  zeit: new Date().toISOString().slice(0, 10),
  fassung: kopf,
  proben: PROBEN.length,
  tore: [...new Set(PROBEN.map(p => p.tor))].sort(),
  unterTore: unterTore.sort(),
  lauf: 'vollständig',
}, null, 2) + '\n');
console.log(`  Festgehalten in ${STAND} auf ${kopf.slice(0, 7)}.\n`);
