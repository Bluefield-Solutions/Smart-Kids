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
import { ALLE as KETTE } from './kette-liste.mjs';

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
/* SECHS, gerechnet aus den gemessenen Zeiten des Laufs vom 31.08.2026
 * (200 Proben, 33 Gruppen, zusammen 5649 s). Vorhergesagte Wanduhr:
 *
 *      n    reihum   gewichtet
 *      3      2355        1884
 *      4      2053        1415
 *      5      2268        1132
 *      6      1642        1057   <- hier
 *     10      1376        1057
 *
 * Die Vorhersage fuer „reihum, 3" lautete 2355 s, gemessen wurden 2348 -
 * das Modell ist am echten Lauf geprueft und nicht geraten.
 *
 * Ab sechs bringt kein weiterer Arbeiter etwas: die schwerste EINZELNE
 * Gruppe ist `ansicht` mit 1057 s, und eine Gruppe teilt sich nicht - ihre
 * Proben teilen sich den gesunden Lauf, das ist ja der Sinn der Gruppe.
 * Wer unter 1057 s will, muss die Gruppe aufbrechen und dafuer den
 * gesunden Lauf mehrfach bezahlen; das ist eine eigene Runde. */
const ARBEITER = Math.max(1, Math.min(8, +fahne('arbeiter', '6')));
const TEIL = fahne('teil', '');                  // „i/n" — nur im Kind gesetzt
const ERGEBNIS = fahne('ergebnis', '');          // wohin das Kind sein Ergebnis schreibt
const KOPIE_NAME = fahne('kopie', '.probenbaum');

/* Die Liste steht in `tor/proben-liste.mjs` — nicht hier.
 *
 * Getrennt, weil sie zwei Leser hat: diesen Laeufer und die Pruefung in
 * `inhalt`, die nachsieht, ob jede Probe ihren Suchtext noch findet. Eine
 * Liste, die man sich mit einem Ausdruck aus dem Quelltext klaubt, ist
 * keine Liste, sondern eine Abschrift. */
import { PROBEN, D, V, E, DIST } from './proben-liste.mjs';

/* ---------------------------------------------------------------------- */

const rot = (s) => `\x1b[31m${s}\x1b[0m`, gruen = (s) => `\x1b[32m${s}\x1b[0m`;

/* Regel 9 ist weg — weil der Grund weg ist.
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
/* Nur das SCHLUSS-Zeilenende weg, nicht der fuehrende Leerraum.
 *
 * `git status --porcelain` schreibt in Spalte 1 den Stand im Verzeichnis
 * und in Spalte 2 den im Arbeitsbaum - eine nur im Arbeitsbaum geaenderte
 * Datei heisst also " M pfad", mit einem LEERZEICHEN vorn. `.trim()` hat
 * genau dieses eine Leerzeichen der ERSTEN Zeile weggeschnitten; aus
 * " M prototyp/vorlage.html" wurde "M prototyp/vorlage.html", und
 * `z.slice(3)` las daraus "rototyp/vorlage.html". Diese Datei gibt es
 * nicht, also wurde sie stillschweigend uebersprungen.
 *
 * Was das heisst: die alphabetisch ERSTE geaenderte Datei stand in der
 * Wegwerf-Kopie in ihrer HEAD-Fassung, nicht in der, die man vor sich
 * hat. Aufgefallen ist es erst, als eine frische Gegenprobe ihren
 * Suchtext nicht fand - der stand nur im Arbeitsbaum. Solange die
 * geaenderten Dateien zufaellig spaeter im Alphabet lagen, hat es nichts
 * gekostet, und deshalb hat es auch niemand gesehen. */
const schmutzig = execSync('git status --porcelain', { encoding:'utf8' })
  .replace(/\n+$/, '');

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
    if (!fs.existsSync(datei)) {
      throw new Error(`proben: „${datei}" steht in \`git status\`, aber nicht `
        + 'auf der Platte. Die Wegwerf-Kopie waere damit nicht das, was du '
        + 'siehst - und eine Probe, die eine andere Fassung prueft als die '
        + 'gemeinte, beweist nichts.');
    }
    /* Ein GANZES Verzeichnis, wenn git eines meldet.
     *
     * `git status --porcelain` fasst ein unbekanntes Verzeichnis zu EINER
     * Zeile zusammen („?? dienst/") und nennt die Dateien darin nicht.
     * `copyFileSync` bekam damit ein Verzeichnis und warf `EISDIR` - der
     * ganze Probenlauf brach ab, als in dieser Runde ein neues
     * Verzeichnis dazukam. Vorher gab es keines, deshalb ist es nie
     * aufgefallen. */
    if (fs.statSync(datei).isDirectory()) {
      fs.cpSync(datei, ziel, { recursive:true });
      dazu.push(datei);
      continue;
    }
    fs.mkdirSync(path.dirname(ziel), { recursive:true });
    fs.copyFileSync(datei, ziel);
    dazu.push(datei);
  }
  /* Nachsehen, ob es wirklich angekommen ist - dieselbe Frage, die jede
   * Probe an ihren eigenen Eingriff stellt (Regel 10). Ohne diese drei
   * Zeilen hat das `.trim()` oben unbemerkt eine Datei ausgelassen. */
  for (const datei of dazu) {
    const ziel = path.join(KOPIE, datei);
    if (!fs.existsSync(datei)) continue;              // geloescht, siehe oben
    if (fs.statSync(datei).isDirectory()) continue;   // ganz kopiert, siehe oben
    if (fs.readFileSync(datei).equals(fs.readFileSync(ziel))) continue;
    throw new Error(`proben: „${datei}" ist in der Wegwerf-Kopie nicht die `
      + 'Fassung aus dem Arbeitsbaum. Geprobt wuerde damit an einem Baum, '
      + 'den es nicht gibt.');
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

/* Was `bauen:` bedeutet.
 *
 * `true` heisst „danach `npm run bauen`" - das ist der Normalfall: der
 * Eingriff sitzt in einer Quelle, und das Tor prueft `dist/`.
 *
 * Ein STRING heisst „danach `npm run <string>`". Gebraucht seit A7 vom
 * App-Symbol: sein Eingriff sitzt in `tools/backen-symbol.mjs`, und was
 * das Tor liest, sind die PNG unter `src/symbol/` - die entstehen nicht
 * beim Bauen, sondern mit `npm run symbol`. Ohne das prueft die Probe ein
 * Bild, das ihr Eingriff nie erreicht hat, und meldet „kam nicht an". */
const bauBefehl = (b) => typeof b === 'string' ? b : 'bauen';

const wiederherstellen = (gebaut) => {
  // In der KOPIE. Derselbe Befehl, der diesem Verzeichnis viermal Arbeit
  // gekostet hat - hier kann er nichts mehr treffen als sich selbst.
  execSync('git checkout -- .', { stdio:'ignore', cwd: BAUM });
  uebermalen();
  if (nachRestore) nachRestore();
  /* Und wenn der Wiederaufbau scheitert, stirbt nicht der ganze Arbeiter.
   *
   * Genau so ist er einmal gestorben: `npm run symbol` braucht `roh/`, das
   * in der Wegwerf-Kopie nicht liegt - `execFileSync` warf, niemand fing
   * es, und der Teillauf hinterliess KEIN Ergebnis. Gemeldet wurde
   * daraufhin „ein Teillauf hat kein Ergebnis hinterlassen", also die
   * Folge statt der Ursache. */
  if (gebaut) {
    try { execFileSync('npm', ['run', bauBefehl(gebaut)], { stdio:'ignore', cwd: BAUM }); }
    catch (e) { befunde.push(`Wiederaufbau mit \`npm run ${bauBefehl(gebaut)}\` gescheitert — `
      + 'die Kopie steht schlechter da als vorher'); }
  }
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

/** Umgebung, die fuer BEIDE Laeufe gilt — den gesunden und den mit
 *  Eingriff. Das ist etwas anderes als `umgebung`: DIE ist der Eingriff
 *  (`SMARTKIDS_RHYTHMUS_MAX:'-1'` macht das Tor kaputt und darf im
 *  gesunden Lauf gerade nicht gesetzt sein). `stets` stellt dagegen den
 *  Rahmen ein, in dem beide Laeufe stattfinden — bei „das Becken
 *  verschluckt ein rotes Tor" die kurze Fassung der Kette. Ohne diese
 *  Trennung verglich die Probe eine VOLLE gruene Kette mit einer KURZEN
 *  roten: zwei Laeufe, die sich in mehr unterscheiden als im Eingriff,
 *  beweisen nichts ueber den Eingriff (Regel 14). Gekostet hat es
 *  ausserdem 325 s statt 22. */
const umg = (p) => JSON.stringify(p.stets || {});

/** Alle Proben mit demselben Tor, denselben Argumenten UND derselben
 *  Umgebung — sie teilen sich den gesunden Lauf und gehoeren zusammen. */
const gruppeVon = (p) => p.tor + ' ' + (p.args || []).join(' ') + ' ' + umg(p);
const gruppen = [...new Set(alleGewaehlt.filter(p => !p.nachStand).map(gruppeVon))];

/* Im Kind: nur der eigene Teil — GEWICHTET verteilt, nicht reihum.
 *
 * Hier stand „reihum nach Gruppen, damit die Arbeit ungefaehr gleich
 * faellt — die Gruppen sind sehr unterschiedlich gross, aber die teuren
 * sind auch die zahlreichen". Der zweite Halbsatz stimmt nicht: gemessen
 * (200 Proben, 33 Gruppen, zusammen 5649 s) traegt `ansicht` allein
 * 1057 s und `smoke --nur=ablage` 974, waehrend zwoelf Gruppen unter
 * zehn Sekunden liegen. Reihum bekam ein Kind 2355 s und die anderen
 * standen still - der Lauf dauerte 2348 s, und in den letzten zehn
 * Minuten arbeitete genau ein Prozess.
 *
 * Verteilt wird deshalb gierig nach GEWICHT: die schwerste Gruppe zuerst,
 * immer in den bis dahin leichtesten Topf. Dasselbe Verfahren wie bei
 * `smoke --teil` (P2), aus demselben Grund.
 *
 * Das Gewicht kommt aus dem STAND - `s` je Probe, beim letzten Lauf
 * gemessen. Wer keinen Wert hat (neue Probe), bekommt den Mittelwert der
 * anderen: das ist besser als null, denn eine neue Probe mit Gewicht null
 * landete immer im vollsten Topf. Fehlt der Stand ganz, faellt es auf
 * reihum zurueck - dann ist nichts gemessen, und Raten waere schlechter
 * als die alte Ordnung.
 */
const gewichtVon = (() => {
  // Der Stand wird HIER eigens gelesen: `bisher` entsteht erst weiter
  // unten, und die Verteilung faellt weiter oben. Zwei Leser derselben
  // Datei, kein zweiter Inhalt.
  const stand = fs.existsSync(STAND)
    ? (JSON.parse(fs.readFileSync(STAND, 'utf8')).proben || {}) : {};
  const werte = PROBEN.map(p => stand[p.n]?.s).filter(x => typeof x === 'number');
  if (!werte.length) return null;
  const mittel = Math.round(werte.reduce((a, b) => a + b, 0) / werte.length);
  return (p) => (typeof stand[p.n]?.s === 'number' ? stand[p.n].s : mittel);
})();

const auswahl = (() => {
  if (!TEIL) return alleGewaehlt;
  const [i, n] = TEIL.split('/').map(Number);
  let meine;
  if (!gewichtVon) {
    meine = new Set(gruppen.filter((_, k) => k % n === i));
  } else {
    const last = new Map(gruppen.map(g => [g, 0]));
    for (const p of alleGewaehlt) {
      if (p.nachStand) continue;
      const g = gruppeVon(p);
      last.set(g, (last.get(g) || 0) + gewichtVon(p));
    }
    const toepfe = [...Array(n)].map(() => ({ s: 0, gruppen: [] }));
    for (const [g] of [...last.entries()].sort((a, b) => b[1] - a[1])) {
      const leichtester = toepfe.reduce((a, b) => (b.s < a.s ? b : a));
      leichtester.s += last.get(g); leichtester.gruppen.push(g);
    }
    meine = new Set(toepfe[i].gruppen);
  }
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
/* Vor dem ERSTEN gesunden Lauf wird gebaut - einmal je Wegwerf-Kopie.
 *
 * `dist/` steht nicht in Git. Eine frische Kopie hat also keins, und der
 * gesunde Vergleichslauf - der beweisen soll, dass das Tor OHNE den
 * Eingriff gruen ist - lief gegen ein Verzeichnis, das es nicht gab.
 * Ergebnis: „war schon vorher rot", und die Probe bewies nichts.
 *
 * Gemessen im vollen Lauf vom 01.09.2026: ACHT Proben sind so
 * ausgefallen, alle im Rauchtest, alle mit langen Laufzeiten. Und es war
 * eine Frage der REIHENFOLGE - sobald irgendeine Probe mit `bauen:true`
 * durch war, lag ein `dist/` da, und die naechsten Vergleichslaeufe
 * gingen gut. Ein Probenlauf, dessen Ergebnis von der Reihenfolge
 * abhaengt, ist kein Beweis, sondern eine Wuerfelei.
 *
 * Einmal, nicht je Probe: der Bau kostet zweieinhalb Sekunden, und die
 * Quellen sind zu diesem Zeitpunkt immer die eingecheckten. */
let gebaut = false;
const istGesund = (p) => {
  if (!gebaut) { gebaut = true; lauf('bauen'); }
  // `ohneSofort` gehoert in den Schluessel: der gesunde Lauf muss DIESELBEN
  // Argumente haben wie die Probe, sonst vergleicht er zwei verschiedene
  // Laeufe.
  const schluessel = p.tor + ' ' + (p.args || []).join(' ') + (p.ohneSofort ? ' /voll' : '')
    + ' ' + umg(p);
  if (!gesund.has(schluessel))
    gesund.set(schluessel, lauf(p.tor, p.stets, p.args, p.ohneSofort).code === 0);
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
    const b = lauf(bauBefehl(p.bauen));
    if (b.code) { fertig(rot('Bau gescheitert')); nichtAngekommen++;
      befunde.push(`${p.n}: der Bau lief nicht durch — die Probe beweist nichts`);
      wiederherstellen(p.bauen); continue; }
  }

  /* --- Regel 10: ist er angekommen? -------------------------------- */
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
  const r = lauf(p.tor, { ...p.stets, ...p.umgebung }, p.args, p.ohneSofort);
  wiederherstellen(p.bauen);

  // Erst jetzt fragen, ob es ohne Eingriff gruen gewesen waere: der Baum
  // ist wiederhergestellt, und bei den meisten Proben erspart das den
  // gesunden Lauf ganz - denn wenn das Tor gruen BLEIBT, ist die Antwort
  // ohnehin belanglos.
  /* Ein Tor, das seinen eigenen Nachweis prueft, kann nicht gruen sein.
   *
   * `rhythmus` schlaegt an, wenn eine Probe keinen frischen Nachweis hat -
   * und seine EIGENEN vier Proben sind genau solche Proben, solange sie
   * nicht angeschlagen haben. Damit schliesst sich der Kreis: sie koennen
   * nicht anschlagen, weil das Tor rot ist, und das Tor ist rot, weil sie
   * nicht angeschlagen haben. Einmal aus dem Fenster von drei Runden
   * gefallen, kommen sie nie wieder hinein.
   *
   * Fuer sie gilt deshalb ein schaerferes Mass statt eines schwaecheren:
   * die erwartete Meldung muss OHNE den Eingriff fehlen und MIT ihm da
   * sein. Das ist mehr als „gruen wird rot" - es zeigt, dass genau dieser
   * Satz an genau diesem Eingriff haengt. Teurer ist es auch: der gesunde
   * Lauf faellt hier immer an.
   */
  if (r.code !== 0 && p.auchWennRot && p.sagt) {
    const ohne = lauf(p.tor, p.stets, p.args, p.ohneSofort);
    if (ohne.aus.includes(p.sagt)) {
      fertig(rot('sagt es auch ohne Eingriff'));
      blind++;
      befunde.push(`${p.n}: \`${p.tor}\` meldet „${p.sagt}" schon OHNE den Eingriff — `
        + 'diese Probe beweist nichts, sie stellt nur einen bestehenden Fehler nach.');
      continue;
    }
  } else if (r.code !== 0 && !istGesund(p)) {
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
/* Aus `tor/kette-liste.mjs` - derselben Liste, die `tools/kette.mjs`
 * faehrt. Bis P1 stand die Kette als `&&`-Zeile in package.json. */
const kette = KETTE.filter(t => t !== 'bauen');
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
    /* `s` ist die gemessene Dauer dieser Probe - die Zahl, nach der der
     * naechste Lauf die Arbeit verteilt. Sie wird nur ueberschrieben,
     * wenn diese Probe wirklich gelaufen ist; ein Teillauf, der sie nicht
     * gefahren hat, soll den alten Wert nicht mit einer Null ersetzen. */
    const gemessen = zeiten.find(z => z.n === p.n);
    if (angeschlagen.has(p.n) || vorschuss.has(p.n))
      proben[p.n] = { commit: kopf, zeit: heute,
                      s: gemessen ? Math.round(gemessen.s) : bisher[p.n]?.s };
    else if (bisher[p.n]) proben[p.n] = { ...bisher[p.n],
                      ...(gemessen ? { s: Math.round(gemessen.s) } : {}) };
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
