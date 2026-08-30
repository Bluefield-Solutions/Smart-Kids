// Tor `vergleich` - das wichtigste, und das einzige, das sich in K1 selbst
// gemessen haette.
//
// Zwei Zahlen, nicht eine:
//   TREFFERQUOTE       wieviel von dem, was gemeint war, wird angenommen
//   FALSCH-POSITIV     wieviel von dem, was NICHT gemeint war, auch
//
// Ohne die zweite ist die Pruefung wertlos: ein Abgleich, der alles annimmt,
// hat 100 % Trefferquote und lehrt nichts.
//
// Und zwei Haelften, nicht eine: die ERFUNDENE zum Einstellen, die
// EINGEFRORENE aus echten Aufnahmen zum Beweisen. Solange die zweite fehlt,
// gilt hier KEINE Zielzahl - das Tor sagt das ausdruecklich, statt eine
// Zahl zu melden, die nichts bezeugt.
import fs from 'node:fs';
import path from 'node:path';
import { abgleich } from '../src/vergleich/vergleich.js';
import * as I from '../src/inhalt/erdkunde.js';
import { STAEDTE } from '../src/geo/staedte.js';

const ZIEL_TREFFER = 0.90, ZIEL_FALSCH = 0.02;

/** Alle Gebiete als Kandidaten, mit Aliassen und Aussprachevarianten. */
const ALLE = [
  ...I.KONTINENTE.map(k => ({ id:k.id, name:k.name, aliasse:k.aliasse, aussprache:k.aussprache })),
  ...Object.values(I.LAENDER).flat().map(l => ({ id:l.a3, name:l.name, aliasse:l.aliasse, aussprache:l.aussprache })),
  ...STAEDTE.map(s => ({ id:s.id, name:s.name, aliasse:[], aussprache:[] })),
];
const nachId = new Map(ALLE.map(k => [k.id, k]));

/* Die Kandidatenmenge einer Aufgabe - so, wie sie im SPIEL entsteht.
 *
 * Vorher: „das Ziel plus die ersten sechs Geschwister aus der Gesamtliste".
 * Fuer ein Land hiess das oft: sechs Laender von anderen Kontinenten. Im
 * Spiel stehen aber die Laender DESSELBEN Kontinents zur Wahl - und genau
 * dort sitzen die gefaehrlichen Paare: Uruguay neben Paraguay, Sudan
 * neben Suedafrika. Eine Messung an einer Menge, die es nicht gibt, misst
 * die falsche Aufgabe (Regel 12).
 */
const KONT_VON = new Map(Object.entries(I.LAENDER)
  .flatMap(([k, l]) => l.map(x => [x.a3, k])));
function menge(zielId) {
  const ziel = nachId.get(zielId);
  if (!ziel) throw new Error(`Unbekannte ID im Korpus: ${zielId}`);
  const kont = KONT_VON.get(zielId);
  if (kont) return I.LAENDER[kont].map(l => ({ id:l.a3, name:l.name,
    aliasse:l.aliasse, aussprache:l.aussprache }));
  const geschwister = ALLE.filter(k => k.id !== zielId
    && ((zielId.startsWith('DE-')) === (k.id.startsWith('DE-'))));
  return [ziel, ...geschwister.slice(0, 6)];
}

function pruefe(korpus, name) {
  let treffer = 0, trefferGes = 0, rueckfragen = 0;
  const verfehlt = [];
  for (const [zielId, eingaben] of korpus.treffer || []) {
    const kand = menge(zielId);
    for (const e of eingaben) {
      trefferGes++;
      const r = abgleich(e, kand);
      if (r.id === zielId && r.art === 'angenommen') treffer++;
      else if (r.id === zielId && r.art === 'rueckfrage') { treffer++; rueckfragen++; }
      else verfehlt.push(`${e} → ${r.art}${r.name ? ' ('+r.name+')' : ''}, erwartet ${zielId}`);
    }
  }
  let falsch = 0, falschGes = 0;
  const durchgerutscht = [];
  for (const [zielId, eingaben] of korpus.nichttreffer || []) {
    const kand = menge(zielId);
    for (const e of eingaben) {
      falschGes++;
      const r = abgleich(e, kand);
      if (r.id === zielId && r.art === 'angenommen') { falsch++; durchgerutscht.push(`${e} → ${zielId}`); }
    }
  }
  return { name, treffer, trefferGes, quote: treffer/trefferGes,
           rueckfragen, falsch, falschGes, rate: falsch/falschGes, verfehlt, durchgerutscht };
}

const erfunden = JSON.parse(fs.readFileSync(new URL('./korpus/erfunden.json', import.meta.url)));
const eingefrorenPfad = new URL('./korpus/eingefroren.json', import.meta.url);
const hatEingefroren = fs.existsSync(eingefrorenPfad);

const laeufe = [pruefe(erfunden, 'erfunden')];
if (hatEingefroren) {
  /* Ein eingefrorener Korpus muss GROSS GENUG sein, um seine Zielzahlen zu
   * tragen. Sonst gilt ab dem Tag, an dem die Datei entsteht, eine
   * 90-Prozent-Grenze fuer eine Zahl, die wuerfelt: bei fuenfundzwanzig
   * Formen liegt eine gemessene Quote gut und gern zwoelf Punkte daneben.
   * Die Grenzen stehen in `tools/korpus.mjs`, das die Datei baut - hier
   * wird nur nachgesehen, ob sie eingehalten sind. Von Hand geschrieben
   * kaeme sie sonst durch.
   *
   * EHRLICH DAZU: das ist die einzige Pruefung im Verzeichnis ohne
   * Gegenprobe. Ihr Gegenstand gibt es noch nicht - sobald die Datei da
   * ist, gehoert eine nachgetragen. */
  const gefroren = JSON.parse(fs.readFileSync(eingefrorenPfad));
  const zt = (gefroren.treffer || []).reduce((n, [, f]) => n + f.length, 0);
  const zn = (gefroren.nichttreffer || []).reduce((n, [, f]) => n + f.length, 0);
  if (zt < 100 || zn < 50) {
    console.log(`\n  ROT: der eingefrorene Korpus ist zu klein — ${zt} Treffer `
      + `(nötig 100), ${zn} Nichttreffer (nötig 50). Eine Zielzahl über so wenigen`);
    console.log('  Formen wackelt stärker als der Abstand, um den es geht.');
    console.log('  Weiter sammeln: `npm run korpus`.');
    rot++;
  }
  laeufe.push(pruefe(gefroren, 'eingefroren'));
}

let rot = 0;
for (const r of laeufe) {
  const gilt = r.name === 'eingefroren';
  console.log(`\n  Korpus »${r.name}«${gilt ? '  — DIESE ZAHLEN GELTEN' : '  (nur zum Einstellen)'}`);
  console.log(`    Trefferquote      ${(r.quote*100).toFixed(1).padStart(5)} %   `
    + `(${r.treffer}/${r.trefferGes}, davon ${r.rueckfragen} als Rückfrage)`);
  console.log(`    Falsch-Positiv    ${(r.rate*100).toFixed(1).padStart(5)} %   (${r.falsch}/${r.falschGes})`);
  if (r.verfehlt.length) { console.log('    verfehlt:'); r.verfehlt.forEach(v=>console.log('      · '+v)); }
  if (r.durchgerutscht.length) { console.log('    durchgerutscht:'); r.durchgerutscht.forEach(v=>console.log('      ✗ '+v)); }
  /* Eine RATSCHE, keine Zielzahl.
   *
   * Auf der erfundenen Haelfte gilt keine Prozentgrenze - wer den Korpus
   * schreibt und den Abgleich einstellt, ist Pruefling und Pruefer
   * zugleich. Was aber gilt: es darf nicht MEHR durchrutschen als heute.
   * Ein Prozentsatz taugt dafuer nicht; er sinkt schon dadurch, dass der
   * Korpus waechst. Also steht die eine bekannte Ausnahme namentlich da,
   * und alles andere ist rot.
   *
   * Die Liste ist LEER. Sie hielt eine einzige Ausnahme - „aussen →
   * asien", seit K1 -, und die ist behoben: die Koelner Phonetik gibt den
   * Diphthongen jetzt einen eigenen Code, „aussen" ist damit nicht mehr
   * „Asien". Eine Ausnahmeliste, aus der man nichts streicht, wird zur
   * Erlaubnis; deshalb steht sie leer da statt zu verschwinden - wer
   * wieder etwas eintraegt, sieht, dass er eine Ausnahme MACHT. */
  const BEKANNT = [];
  const neuDurch = r.durchgerutscht.filter(v => !BEKANNT.includes(v));
  if (neuDurch.length) {
    console.log(`    ROT: ${neuDurch.length} davon ${neuDurch.length===1?'ist':'sind'} neu — `
      + `bekannt war nur „${BEKANNT.join('", „')}"`);
    rot++;
  }
  if (gilt) {
    if (r.quote < ZIEL_TREFFER) { console.log(`    ROT: unter ${ZIEL_TREFFER*100} % Trefferquote`); rot++; }
    if (r.rate > ZIEL_FALSCH)   { console.log(`    ROT: über ${ZIEL_FALSCH*100} % Falsch-Positiv`); rot++; }
  }
}

/* Jede Aussprachevariante wird gegengehoert - alle, nicht nur die im Korpus.
 *
 * Der Anlass: R5 hat 35 Laender dazugelegt (Rang 6 bis 12), jedes mit
 * zwei erfundenen Aussprachevarianten. Im Korpus stand davon nichts, und
 * damit war keine einzige je durch den Abgleich gelaufen. Eine Variante,
 * die der Abgleich nicht annimmt, ist umsonst erfunden; eine, die er dem
 * FALSCHEN Land zuschlaegt, ist schlimmer als keine.
 *
 * Das laesst sich ohne Korpus pruefen, weil beides aus den Daten selbst
 * folgt: jede Form eines Gebiets - Name, Alias, Variante - muss in der
 * Menge ihres Kontinents auf ihr eigenes Gebiet fallen. Der erfundene
 * Korpus bleibt daneben stehen; er prueft das MISSLINGEN, diese Stelle
 * das Gelingen.
 */
{
  let n = 0; const falsch = [];
  for (const [kont, liste] of Object.entries(I.LAENDER)) {
    const kand = liste.map(l => ({ id:l.a3, name:l.name,
      aliasse:l.aliasse, aussprache:l.aussprache }));
    for (const l of liste)
      for (const f of [l.name, ...(l.aliasse||[]), ...(l.aussprache||[])]) {
        n++;
        const r = abgleich(f, kand);
        if (r.id === l.a3 && r.art !== 'nochmal') continue;
        falsch.push(r.id && r.id !== l.a3
          ? `${kont}: „${f}" gehört zu ${l.name}, angenommen wurde ${r.name}`
          : `${kont}: „${f}" (${l.name}) wird gar nicht angenommen — ${r.art}`);
      }
  }
  console.log(`\n  Alle Formen aus den Daten: ${n} geprüft`
    + ` (Name, Alias, Aussprache · ${Object.keys(I.LAENDER).length} Kontinente)`);
  if (falsch.length) {
    console.log(`    ROT: ${falsch.length} Form${falsch.length===1?'':'en'} fällt durch:`);
    falsch.slice(0, 8).forEach(v => console.log('      ✗ ' + v));
    rot++;
  } else {
    console.log('    jede fällt auf ihr eigenes Gebiet');
  }
}

if (!hatEingefroren) {
  console.log('\n  Die eingefrorene Hälfte fehlt noch — sie entsteht aus echten Aufnahmen');
  console.log('  in M4. Bis dahin gilt hier KEINE Zielzahl. Die Zahlen oben sagen, dass');
  console.log('  der Abgleich eingestellt ist, nicht dass er trägt.');
  // Eine offensichtliche Fehlfunktion faengt das Tor trotzdem: ein Abgleich,
  // der alles annimmt, faellt hier durch.
  const r = laeufe[0];
  if (r.rate > 0.20) { console.log(`\n  ROT: ${(r.rate*100).toFixed(0)} % Falsch-Positiv schon auf der erfundenen Hälfte.`); rot++; }
  if (r.quote < 0.60) { console.log(`\n  ROT: ${(r.quote*100).toFixed(0)} % Trefferquote schon auf der erfundenen Hälfte.`); rot++; }
}
/* ============ Der Weg zum Korpus wird selbst durchgespielt ============ *
 *
 * `npm run korpus` entscheidet darueber, ob die Zahlen dieses Tors etwas
 * bezeugen. Ein Werkzeug mit dieser Aufgabe darf nicht das einzige im
 * Verzeichnis sein, das niemand prueft.
 *
 * Gefahren wird es in einem WEGWERF-VERZEICHNIS - es liest und schreibt
 * unter `process.cwd()`, also faellt kein Blick auf den echten Korpus.
 *
 * Die wichtigste der sechs Proben ist die vorletzte: ein Eintrag, den der
 * Abgleich fuer richtig haelt (`ergebnis: 'richtig'`), aber ein Mensch fuer
 * falsch (`urteil: 'nein'`), muss bei den NICHTTREFFERN landen. Kaeme er
 * bei den Treffern an, haette das Werkzeug `ergebnis` abgeschrieben - und
 * der Korpus koennte dem Abgleich nie widersprechen (Regel 4).
 */
{
  const { execFileSync } = await import('node:child_process');
  const os = await import('node:os');
  const WERKZEUG = path.join(process.cwd(), 'tools/korpus.mjs');
  const raum = fs.mkdtempSync(path.join(os.tmpdir(), 'korpus-probe-'));
  fs.mkdirSync(path.join(raum, 'tor/korpus'), { recursive: true });

  const fahre = (...args) => {
    try {
      return { code: 0, aus: execFileSync('node', [WERKZEUG, ...args],
        { cwd: raum, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) };
    } catch (e) { return { code: e.status ?? 1, aus: (e.stdout || '') + (e.stderr || '') }; }
  };
  const export_ = (name, eintraege) => {
    const w = path.join(raum, name);
    fs.writeFileSync(w, JSON.stringify(eintraege, null, 2));
    return w;
  };
  const liste = () => JSON.parse(fs.readFileSync(path.join(raum, 'tor/korpus/urteile.json'), 'utf8'));
  const schreibListe = (u) => fs.writeFileSync(
    path.join(raum, 'tor/korpus/urteile.json'), JSON.stringify({ urteile: u }, null, 2));

  const befunde = [];
  const soll = (bedingung, was) => { if (!bedingung) befunde.push(was); };
  /* Eine Probe, die WIRFT, ist auch ein Befund - kein Stapelabzug.
   *
   * Beim Gegenprobieren ist genau das passiert: der Eingriff „das Urteil
   * kommt aus `ergebnis`" liess das Werkzeug aus einem anderen Grund
   * verweigern, die Korpusdatei entstand nicht, und das Lesen warf ENOENT.
   * Die Probe hatte recht und sah aus wie ein Absturz - und das
   * Wegwerf-Verzeichnis blieb liegen, weil das Aufraeumen nie drankam. */
  const probe = (name, fn) => {
    try { fn(); }
    catch (e) { befunde.push(`${name}: ${String(e.message || e).slice(0, 120)}`); }
  };

  // 1. Ein Export ohne gesprochene Antwort taugt nicht.
  probe('ohne gesprochene Antwort', () => {
    const w = export_('nurgezogen.json', [
      { gebietId:'europa', eingabeart:'ziehen', roheingabe:'', ergebnis:'richtig' }]);
    const r = fahre(w);
    soll(r.code !== 0 && /keine einzige GESPROCHENE/.test(r.aus),
      'ein Export ohne gesprochene Antwort wird angenommen — der Korpus bekäme nichts');
  });

  // 2. Offene Urteile lassen sich nicht einfrieren.
  probe('offene Urteile', () => {
    const w = export_('gesprochen.json', [
      { gebietId:'europa', eingabeart:'sprechen', roheingabe:'oiropa', ergebnis:'richtig' },
      { gebietId:'afrika', eingabeart:'sprechen', roheingabe:'affrika', ergebnis:'falsch' }]);
    const r1 = fahre(w);
    soll(r1.code === 0 && liste().urteile.length === 2,
      'die Urteilsliste entsteht nicht aus einem Export mit zwei Äußerungen');
    soll(liste().urteile.every(z => z.urteil === null),
      'die Urteilsliste kommt mit vorgefertigten Urteilen — sie muss LEER anfangen');
    soll(liste().urteile.every(z => !('zeit' in z)),
      'die Urteilsliste trägt einen Zeitstempel — der gehört nicht in eine Datei, '
      + 'die eingecheckt wird');
    const r2 = fahre('--einfrieren');
    soll(r2.code !== 0 && /kein Urteil/.test(r2.aus),
      'ein Korpus mit offenen Urteilen lässt sich einfrieren');
  });

  // 3. Ein Urteil, das es nicht gibt.
  probe('erfundenes Urteil', () => {
    schreibListe([{ gemeint:'europa', gesagt:'oiropa', urteil:'vielleicht' }]);
    const r = fahre('--einfrieren');
    soll(r.code !== 0 && /Urteil, das es nicht gibt/.test(r.aus),
      'ein erfundenes Urteil („vielleicht") kommt durch');
  });

  // 4. Zu wenig, um etwas zu beweisen.
  probe('Größengrenze', () => {
    schreibListe([...Array(20)].map((_, i) => ({ gemeint:'europa', gesagt:'f'+i, urteil:'ja' })));
    const r = fahre('--einfrieren');
    soll(r.code !== 0 && /Zu wenig/.test(r.aus),
      'zwanzig Formen reichen dem Werkzeug — eine 90-Prozent-Grenze über zwanzig '
      + 'Formen würfelt');
  });

  // 5. Das Urteil schlaegt `ergebnis` — sonst schreibt der Korpus ab.
  probe('das Urteil schlägt `ergebnis`', () => {
    const u = [
      ...[...Array(100)].map((_, i) => ({ gemeint:'europa', gesagt:'ja'+i, urteil:'ja' })),
      /* FUENFZIG, nicht neunundvierzig. Beim Gegenprobieren hat ein
         Eingriff („das Urteil kommt aus `ergebnis`") den einen Satz aus den
         Nichttreffern gezogen - und das Werkzeug verweigerte dann wegen der
         GROESSE statt wegen der Sache. Die Probe schlug an, aber mit der
         falschen Auskunft. Mit einem Nichttreffer Luft bleibt der Grund der
         Grund. */
      ...[...Array(50)].map((_, i) => ({ gemeint:'afrika', gesagt:'nein'+i, urteil:'nein' })),
      // Der Abgleich sagt richtig, der Mensch sagt nein.
      { gemeint:'asien', gesagt:'aussen', urteil:'nein', ergebnis:'richtig' },
      { gemeint:'asien', gesagt:'weg-damit', urteil:'weg' },
    ];
    schreibListe(u);
    const r = fahre('--einfrieren');
    const k = JSON.parse(fs.readFileSync(path.join(raum, 'tor/korpus/eingefroren.json'), 'utf8'));
    const alleT = k.treffer.flatMap(([, f]) => f);
    const alleN = k.nichttreffer.flatMap(([, f]) => f);
    soll(r.code === 0, 'ein vollständiger, großer Satz lässt sich nicht einfrieren');
    soll(alleN.includes('aussen'),
      'eine Äußerung mit `ergebnis: richtig` und Urteil „nein" landet NICHT bei den '
      + 'Nichttreffern — das Werkzeug schreibt die Entscheidung des Abgleichs ab, '
      + 'und der Korpus kann ihm nie widersprechen (Regel 4)');
    soll(!alleT.includes('aussen'), 'dieselbe Äußerung steht auch bei den Treffern');
    soll(!alleT.includes('weg-damit') && !alleN.includes('weg-damit'),
      'eine als „weg" beurteilte Äußerung steht trotzdem im Korpus');
    soll(k._zahlen && k._zahlen.treffer === 100 && k._zahlen.nichttreffer === 51,
      `der Korpus zählt sich falsch: ${JSON.stringify(k._zahlen)}`);
  });

  // 6. Ein zweiter Export wirft die Handarbeit nicht weg.
  probe('zweiter Export', () => {
    schreibListe([{ gemeint:'europa', gesagt:'oiropa', urteil:'ja' }]);
    const w = export_('zweiter.json', [
      { gebietId:'europa', eingabeart:'sprechen', roheingabe:'oiropa', ergebnis:'richtig' },
      { gebietId:'asien',  eingabeart:'sprechen', roheingabe:'aasien', ergebnis:'richtig' }]);
    fahre(w);
    const u = liste().urteile;
    soll(u.length === 2, `ein zweiter Export ergibt ${u.length} statt 2 Zeilen`);
    soll(u.find(z => z.gesagt === 'oiropa')?.urteil === 'ja',
      'ein zweiter Export löscht das Urteil einer schon beurteilten Zeile — '
      + 'wer das zweimal erlebt, beurteilt kein drittes Mal');
  });

  // Aufgeraeumt wird IMMER - auch wenn eine Probe geworfen hat. Beim
  // Gegenprobieren blieb sonst je ein Verzeichnis unter /tmp liegen.
  try { fs.rmSync(raum, { recursive: true, force: true }); } catch { /* egal */ }
  if (befunde.length) {
    console.log(`\n  ROT: der Weg zum Korpus (${befunde.length} Befunde):`);
    befunde.forEach(b => console.log(`    ✗ ${b}`));
    rot++;
  } else {
    console.log('\n  Der Weg zum Korpus: 6 Proben — Verweigerungen, Größengrenze,');
    console.log('  und das Urteil schlägt `ergebnis`.');
  }
}

if (rot) process.exit(1);
