// Die EINGEFRORENE Haelfte des Sprachkorpus - der Weg dorthin.
//
// `vergleich` misst zwei Zahlen und sagt in jedem Lauf dazu, dass sie
// nichts bezeugen: die erfundene Haelfte ist von derselben Hand geschrieben
// wie der Abgleich, den sie prueft. Erst die eingefrorene Haelfte aus
// echten Aeusserungen macht daraus einen Beweis. Sie fehlt seit M4.
//
// WAS DAFUER GEBRAUCHT WIRD, ist weniger als „Aufnahmen": die App schreibt
// bei jeder gesprochenen Antwort mit, WAS ankam (`roheingabe`) und WONACH
// gefragt war (`gebietId`). Der Elternbereich gibt das als JSON aus. Es
// fehlt also nur der Weg vom Export zum Korpus - und ein Urteil.
//
// UND DAS URTEIL DARF NICHT VOM ABGLEICH KOMMEN.
//
// Der naheliegende Weg waere, `ergebnis: 'richtig'` als „Treffer" zu
// nehmen. Genau das ist verboten: `ergebnis` ist die Entscheidung des
// Abgleichs, und ein Korpus, der sie uebernimmt, kann ihm nicht
// widersprechen. Er wuerde 100 % Trefferquote messen, immer, und nichts
// beweisen (Regel 4 - das Modell darf nicht vom Gemessenen abhaengen).
//
// Also zwei Schritte, und der mittlere ist Handarbeit:
//
//   1. npm run korpus -- <export.json>
//      liest den Export und legt eine Urteilsliste an. Ein Eintrag je
//      Aeusserung: wonach gefragt war, was ankam, `urteil: null`.
//
//   2. Die Liste durchgehen und je Zeile eintragen:
//      "ja"   das Kind hat den gefragten Namen gesagt - der Abgleich MUSS
//             ihn annehmen
//      "nein" es hat etwas anderes gesagt - der Abgleich darf ihn NICHT
//             als den gefragten annehmen
//      "weg"  unbrauchbar (abgebrochen, Nebengeraeusch, halbes Wort)
//
//   3. npm run korpus -- --einfrieren
//      baut daraus tor/korpus/eingefroren.json. Verweigert den Dienst,
//      solange ein Urteil fehlt oder der Satz zu klein ist.
import fs from 'node:fs';
import path from 'node:path';

const KORPUS = path.join(process.cwd(), 'tor/korpus');
const LISTE = path.join(KORPUS, 'urteile.json');
const ZIEL = path.join(KORPUS, 'eingefroren.json');

/* Wieviele Aeusserungen es mindestens braucht - und warum diese Zahl.
 *
 * Gezaehlt werden VERSCHIEDENE Formen, nicht Aeusserungen. Wer vierzigmal
 * sauber „Europa" sagt, hat den Abgleich einmal geprueft; die anderen
 * neununddreissig Male sagen nichts Neues. Das Werkzeug buendelt deshalb
 * nach (gemeint, gesagt) - im Versuchslauf wurden aus 146 Aeusserungen
 * zwoelf Formen. Wer hundert Formen sammeln will, braucht also viele
 * Sitzungen, nicht eine.
 *
 * `vergleich` will 90 % Trefferquote sehen. Wie genau eine gemessene Quote
 * die wirkliche trifft, haengt an der Zahl der Formen:
 *
 *   n =  25   eine Standardabweichung sind 6,0 Prozentpunkte   (n = Formen)
 *   n =  50                             4,2
 *   n = 100                             3,0
 *   n = 200                             2,1
 *
 * Bei fuenfundzwanzig Aeusserungen liegt ein Lauf also gut und gern zwoelf
 * Punkte daneben - eine solche Zahl kann eine 90-Prozent-Grenze weder
 * halten noch reissen, sie wuerfelt. Hundert ist die Stelle, ab der die
 * Streuung kleiner ist als der Abstand, um den es geht.
 *
 * Fuer die FALSCH-POSITIV-Zahl (Ziel: hoechstens 2 %) gilt dasselbe noch
 * schaerfer, und ehrlich gesagt reicht auch das nicht: 2 % von fuenfzig
 * Nichttreffern ist ein einziger. Diese Zahl wird also erst mit der Zeit
 * belastbar; das Werkzeug sagt es, statt so zu tun, als waere sie es
 * sofort.
 */
const MINDESTENS_JA = 100;
const MINDESTENS_NEIN = 50;

const args = process.argv.slice(2);
const rot = (t) => `\x1b[31m${t}\x1b[0m`;
const gruen = (t) => `\x1b[32m${t}\x1b[0m`;

/** Alle gesprochenen Aeusserungen aus einem oder mehreren Exporten. */
function ausExporten(dateien) {
  const raus = [];
  for (const d of dateien) {
    if (!fs.existsSync(d)) {
      console.error(`\n  ${d} gibt es nicht.\n`); process.exit(1);
    }
    let roh;
    try { roh = JSON.parse(fs.readFileSync(d, 'utf8')); }
    catch (e) {
      console.error(`\n  ${d} ist kein JSON: ${e.message}\n`); process.exit(1);
    }
    const eintraege = Array.isArray(roh) ? roh : (roh.protokoll || roh.eintraege || []);
    for (const e of eintraege) {
      // Nur GESPROCHENE Antworten, und nur die, bei denen wirklich etwas
      // ankam. Ein leeres `roheingabe` heisst, die Erkennung hat nichts
      // verstanden - das ist ein Fall fuer das Mikrofon, nicht fuer den
      // Abgleich.
      if (e.eingabeart !== 'sprechen') continue;
      if (!e.roheingabe || !String(e.roheingabe).trim()) continue;
      /* OHNE Zeitstempel.
       *
       * Der Korpus braucht ihn nicht - er braucht, WAS gesagt wurde und
       * WONACH gefragt war. Der Zeitstempel wuerde daraus eine Spur
       * machen, wann ein Kind was geuebt hat, und die gehoert nicht in
       * eine Datei, die eingecheckt wird. `quelle` reicht als Herkunft. */
      raus.push({ gemeint: e.gebietId, gesagt: String(e.roheingabe).trim(),
                  quelle: path.basename(d) });
    }
  }
  return raus;
}

if (args.includes('--einfrieren')) {
  /* ---------------------------------------------------------------- 3. */
  if (!fs.existsSync(LISTE)) {
    console.error(`\n  ${LISTE} gibt es noch nicht.`);
    console.error('  Erst die Urteilsliste anlegen: npm run korpus -- <export.json>\n');
    process.exit(1);
  }
  const liste = JSON.parse(fs.readFileSync(LISTE, 'utf8'));
  const zeilen = liste.urteile || [];
  const offen = zeilen.filter(z => z.urteil === null || z.urteil === undefined);
  if (offen.length) {
    console.error(`\n  ${offen.length} von ${zeilen.length} Zeilen haben noch kein Urteil.`);
    console.error('  Ein Korpus mit Luecken bezeugt die Luecken mit — er waere kein Beweis.');
    console.error(`  Offen zum Beispiel: „${offen[0].gesagt}" (gefragt war ${offen[0].gemeint})\n`);
    process.exit(1);
  }
  const falsch = zeilen.filter(z => !['ja', 'nein', 'weg'].includes(z.urteil));
  if (falsch.length) {
    console.error(`\n  ${falsch.length} Zeilen tragen ein Urteil, das es nicht gibt `
      + `(erlaubt: ja, nein, weg): „${falsch[0].urteil}"\n`);
    process.exit(1);
  }
  const ja = zeilen.filter(z => z.urteil === 'ja');
  const nein = zeilen.filter(z => z.urteil === 'nein');
  const weg = zeilen.filter(z => z.urteil === 'weg');

  if (ja.length < MINDESTENS_JA || nein.length < MINDESTENS_NEIN) {
    console.error(`\n  Zu wenig, um etwas zu beweisen: ${ja.length} Treffer `
      + `(nötig ${MINDESTENS_JA}), ${nein.length} Nichttreffer (nötig ${MINDESTENS_NEIN}).`);
    console.error('  Bei fünfundzwanzig Äußerungen liegt eine gemessene Quote gut und gern');
    console.error('  zwölf Prozentpunkte daneben — sie kann eine 90-Prozent-Grenze weder');
    console.error('  halten noch reißen. Lieber weiter sammeln als früh einfrieren.\n');
    process.exit(1);
  }

  // Nach Gebiet buendeln, in der Form, die `vergleich` liest.
  const bündel = (satz) => {
    const m = new Map();
    for (const z of satz) {
      if (!m.has(z.gemeint)) m.set(z.gemeint, new Set());
      m.get(z.gemeint).add(z.gesagt.toLowerCase());
    }
    return [...m].map(([id, s]) => [id, [...s]]);
  };
  const aus = {
    _hinweis: 'Die EINGEFRORENE Haelfte: echte Aeusserungen aus dem Protokoll, '
      + 'von Hand beurteilt. Das Urteil kommt NICHT aus `ergebnis` - das ist die '
      + 'Entscheidung des Abgleichs, und ein Korpus, der sie uebernimmt, kann ihm '
      + 'nicht widersprechen. Angelegt mit `npm run korpus -- --einfrieren`; wer '
      + 'hier von Hand etwas aendert, faelscht seinen eigenen Beweis.',
    _stand: new Date().toISOString().slice(0, 10),
    _zahlen: { treffer: ja.length, nichttreffer: nein.length, verworfen: weg.length },
    treffer: bündel(ja),
    nichttreffer: bündel(nein),
  };
  fs.writeFileSync(ZIEL, JSON.stringify(aus, null, 2));
  console.log(`\n  ${gruen('eingefroren')}: ${ja.length} Treffer über `
    + `${aus.treffer.length} Gebiete, ${nein.length} Nichttreffer, ${weg.length} verworfen.`);
  console.log(`  Geschrieben nach ${path.relative(process.cwd(), ZIEL)}.`);
  console.log('  `npm run vergleich` misst ab jetzt gegen die Zielzahlen.\n');
  process.exit(0);
}

/* ------------------------------------------------------------------- 1. */
const dateien = args.filter(a => !a.startsWith('-'));
if (!dateien.length) {
  console.log('\n  Der Sprachkorpus — die eingefrorene Hälfte.\n');
  console.log('    npm run korpus -- <export.json> [...]   Urteilsliste anlegen/ergänzen');
  console.log('    npm run korpus -- --einfrieren          daraus den Korpus bauen\n');
  console.log('  Den Export gibt es im Elternbereich unter „Als JSON sichern".');
  console.log('  Gesammelt wird, was beim SPRECHEN ankam — Fiona muss also mit dem');
  console.log('  Mikrofon spielen, nicht ziehen.\n');
  if (fs.existsSync(LISTE)) {
    const l = JSON.parse(fs.readFileSync(LISTE, 'utf8')).urteile || [];
    const z = (u) => l.filter(x => x.urteil === u).length;
    console.log(`  Stand: ${l.length} Äußerungen — ${z('ja')} ja, ${z('nein')} nein, `
      + `${z('weg')} weg, ${l.filter(x => x.urteil == null).length} offen`);
    console.log(`  Nötig: ${MINDESTENS_JA} ja und ${MINDESTENS_NEIN} nein.\n`);
  } else {
    console.log(`  Noch keine Urteilsliste (${path.relative(process.cwd(), LISTE)}).\n`);
  }
  process.exit(0);
}

fs.mkdirSync(KORPUS, { recursive: true });
const neu = ausExporten(dateien);
if (!neu.length) {
  console.error('\n  In diesen Exporten steht keine einzige GESPROCHENE Antwort.');
  console.error('  Das Protokoll hält `eingabeart` fest — gesucht ist „sprechen".');
  console.error('  Wer gezogen oder getippt hat, liefert für den Sprachkorpus nichts.\n');
  process.exit(1);
}

/* Vorhandene Urteile BEHALTEN.
 *
 * Ein zweiter Export bringt fast nur Zeilen mit, die schon beurteilt sind.
 * Wer die Liste dabei ueberschreibt, wirft die Handarbeit weg - und wird
 * es beim dritten Mal nicht noch einmal tun, sondern aufhoeren. */
const alt = fs.existsSync(LISTE)
  ? (JSON.parse(fs.readFileSync(LISTE, 'utf8')).urteile || []) : [];
const schluessel = (z) => `${z.gemeint} ${z.gesagt.toLowerCase()}`;
const bekannt = new Map(alt.map(z => [schluessel(z), z]));
let dazu = 0;
for (const z of neu) {
  if (bekannt.has(schluessel(z))) continue;
  bekannt.set(schluessel(z), { ...z, urteil: null });
  dazu++;
}
const urteile = [...bekannt.values()];
fs.writeFileSync(LISTE, JSON.stringify({
  _hinweis: 'Ein Eintrag je Aeusserung. `urteil` von Hand setzen: "ja" (das Kind '
    + 'hat den gefragten Namen gesagt), "nein" (es hat etwas anderes gesagt), '
    + '"weg" (unbrauchbar). NICHT aus `ergebnis` abschreiben - das ist die '
    + 'Entscheidung des Abgleichs, den der Korpus pruefen soll.',
  urteile,
}, null, 2));

const z = (u) => urteile.filter(x => x.urteil === u).length;
const offen = urteile.filter(x => x.urteil == null).length;
console.log(`\n  ${dazu} neue Äußerung${dazu === 1 ? '' : 'en'}, `
  + `${urteile.length} insgesamt in ${path.relative(process.cwd(), LISTE)}.`);
console.log(`  ${z('ja')} ja, ${z('nein')} nein, ${z('weg')} weg, ${offen} offen.`);
if (offen) console.log(`\n  Jetzt die ${offen} offenen Zeilen beurteilen, `
  + 'dann `npm run korpus -- --einfrieren`.\n');
else console.log(`\n  Nötig sind ${MINDESTENS_JA} ja und ${MINDESTENS_NEIN} nein — `
  + `${z('ja') >= MINDESTENS_JA && z('nein') >= MINDESTENS_NEIN
      ? gruen('beides erreicht') : rot('noch nicht erreicht')}.\n`);
