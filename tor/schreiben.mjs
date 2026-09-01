/* Tor `schreiben` - die Buchstabenerkennung (N2a).
 *
 * Zwei Haelften, und die zweite ist die, die zaehlt:
 *
 *   1. Erkennt ein krumm geschriebener Buchstabe sich selbst?
 *   2. Wird etwas, das KEIN Buchstabe ist, abgelehnt?
 *
 * Ohne die zweite waere das Tor mit `sicher: () => true` gruen - und der
 * Erkenner haette nie etwas erkannt, sondern nur zugestimmt. Eine
 * Pruefung, die nie etwas meldet, ist kein Beweis (Regel 1).
 *
 * Das SOLL steht nicht hier und nicht in `schreiben.js`, sondern im
 * Backlog, Paragraf 2.3. Stuende es im Prueflig, wuerden die beiden
 * Schwellen so lange verschoben, bis das Tor gruen ist (Regel 3).
 *
 * Und die Messstelle (Regel 5): gerechnet wird in KASTENPUNKTEN, also in
 * Anteilen des 100 x 100 grossen Kastens, in dem jede Vorlage lebt - nicht
 * in Bildschirmpunkten. Auf dem iPhone quer ist das Feld 262 Punkte breit;
 * ein Kastenpunkt sind dort rund 2,6 Bildpunkte.
 */
import fs from 'node:fs';
import * as S from '../src/inhalt/schreiben.js';

const fehler = [];
const pruefe = (b, satz) => { if (!b) fehler.push(satz); };
console.log('\n  Tor `schreiben`');

/* ---- Das Soll aus dem Backlog ---------------------------------------- */
const BACKLOG = 'docs/Lernkiste-BACKLOG.md';
const SOLL = (() => {
  const doc = fs.existsSync(BACKLOG) ? fs.readFileSync(BACKLOG, 'utf8') : '';
  const zahl = (zeile) => {
    const m = doc.match(new RegExp(`^\\|\\s*${zeile}\\s*\\|([^|]+)\\|`, 'm'));
    return m ? Number(String(m[1]).match(/\d+/)?.[0]) : null;
  };
  return {
    selbst:      zahl('Vorlage erkennt sich selbst'),
    krumm:       zahl('Krumm geschrieben, richtig erkannt'),
    verwechselt: zahl('Sicher erkannt, aber das falsche Zeichen'),
    kritzel:     zahl('Gekritzel als Zeichen angenommen'),
  };
})();
for (const [k, v] of Object.entries(SOLL))
  pruefe(Number.isFinite(v), `Die Sollzeile für „${k}" fehlt in ${BACKLOG}, `
    + 'Abschnitt 2.3 — dann prüft dieses Tor gegen nichts');

/* ---- Die Vorlagen selbst --------------------------------------------- */
pruefe(S.BUCHSTABEN.length === 26, `${S.BUCHSTABEN.length} Buchstaben statt 26`);
pruefe(S.ZIFFERN.length === 10, `${S.ZIFFERN.length} Ziffern statt 10`);
{
  const gesehen = new Set();
  for (const b of [...S.BUCHSTABEN, ...S.ZIFFERN]) {
    pruefe(!gesehen.has(b.zeichen), `${b.zeichen} steht zweimal im Vorrat`);
    gesehen.add(b.zeichen);
    // Bei den Buchstaben ist `wort` ein MERKWORT und faengt mit ihnen an
    // („A wie Affe"); bei den Ziffern ist es das gesprochene Zahlwort.
    if (/[A-ZÄÖÜ]/.test(b.zeichen))
      pruefe(b.wort && b.wort[0].toUpperCase() === b.zeichen,
        `${b.zeichen}: das Merkwort „${b.wort}" fängt nicht mit dem Buchstaben an`);
    else
      pruefe(b.wort && /^[a-zäöü]+$/.test(b.wort),
        `${b.zeichen}: „${b.wort}" ist kein gesprochenes Zahlwort`);
    pruefe(b.zuege.length >= 1 && b.zuege.length <= 4,
      `${b.zeichen}: ${b.zuege.length} Züge — mehr als vier schreibt kein Sechsjähriger`);
    for (const d of b.zuege) {
      let p = null;
      try { p = S.abtasten(d, 8); } catch (e) {
        pruefe(false, `${b.zeichen}: Zug „${d.slice(0, 24)}…" ist kein gültiger Pfad — ${e.message}`);
        continue;
      }
      // Ein Zug, der aus dem Kasten laeuft, ist auf dem Bildschirm
      // abgeschnitten - und beim Nachfahren nicht zu treffen.
      const raus = p.filter(([x, y]) => x < 0 || x > S.KASTEN || y < 0 || y > S.KASTEN);
      pruefe(!raus.length, `${b.zeichen}: ein Zug läuft aus dem Kasten (${raus[0]})`);
      pruefe(S.laenge(d) > 8, `${b.zeichen}: ein Zug ist nur ${S.laenge(d).toFixed(1)} `
        + 'Kastenpunkte lang — das ist kein Strich, das ist ein Tupfer');
    }
  }
}

/* ---- Der Diktat-Vorrat (N3) ------------------------------------------
 *
 * Dieselben Buchstaben, andere Frage - und ein EIGENER Leitner-Stand.
 * Geprueft wird genau das: dass die Kennungen sich nicht ueberschneiden.
 * Taeten sie es, waere ein nachgefahrener Buchstabe als aus dem Gehoer
 * geschriebener gutgeschrieben - ein Koennen, das es nicht gibt, und
 * niemand saehe es: der Leitner rechnet einfach weiter.
 */
{
  const nach = S.vorrat(), diktat = S.vorratDiktat();
  pruefe(diktat.length === nach.length,
    `Diktat: ${diktat.length} Buchstaben, Nachfahren ${nach.length}`);
  const doppelt = diktat.filter(d => nach.some(n => n.id === d.id));
  pruefe(!doppelt.length, `Diktat und Nachfahren teilen sich Kennungen: `
    + `${doppelt.map(x => x.id).join(', ')} — dann zählt ein nachgefahrener `
    + 'Buchstabe als geschriebener');
  for (const d of diktat) {
    // Die Ansage MUSS den Buchstaben nennen - sie ist die ganze Aufgabe.
    pruefe(new RegExp(`\\b${d.zeichen}\\b`).test(d.gesagt),
      `Diktat ${d.zeichen}: die Ansage „${d.gesagt}" nennt den Buchstaben nicht — `
      + 'dann gibt es keine Aufgabe');
    pruefe(d.zuege && d.zuege.length,
      `Diktat ${d.zeichen}: keine Züge — dann kann nach drei Fehlversuchen `
      + 'nichts vorgemacht werden');
  }
  console.log(`    Diktat: ${diktat.length} Buchstaben, eigene Kennungen, jede Ansage nennt ihren`);
}

/* ---- Jede Vorlage erkennt sich selbst -------------------------------- */
const SAETZE = [['Buchstaben', S.BUCHSTABEN], ['Ziffern', S.ZIFFERN]];
{
  let gut = 0, alle = 0;
  for (const [, satz] of SAETZE) for (const b of satz) {
    alle++;
    const e = S.erkennen(b.zuege.map(d => S.abtasten(d, 24)), satz);
    if (e.zeichen === b.zeichen && e.sicher) gut++;
    else pruefe(false, `${b.zeichen} erkennt sich selbst nicht `
      + `(erkannt: ${e.zeichen}, Abstand ${e.abstand.toFixed(1)}, `
      + `Vorsprung ${e.vorsprung.toFixed(2)})`);
  }
  pruefe(gut >= SOLL.selbst, `nur ${gut} von ${alle} Vorlagen erkennen sich selbst`);
  console.log(`    Vorlagen: ${gut} von ${alle} erkennen sich selbst`);
}

/* ---- Ein Kind schreibt nicht die Vorlage ------------------------------
 *
 * Nachgebaut wird, was wirklich passiert: der Buchstabe steht woanders,
 * ist groesser oder kleiner, haengt schief, zittert - und jeder vierte Zug
 * hoert zu frueh auf. Fest gewuerfelt, also bei jedem Lauf dieselben
 * 1040 Faelle; sonst waere das Tor mal gruen und mal rot und niemand
 * wuesste, woran es lag.
 */
const wuerfel = (k) => { let x = k >>> 0; return () => {
  x = (x + 0x6D2B79F5) >>> 0;
  let t = Math.imul(x ^ (x >>> 15), 1 | x);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

function verkrummen(zuege, r, staerke = 1){
  const dreh = (r()-0.5) * 0.22 * staerke, gross = 1 + (r()-0.5) * 0.5 * staerke;
  const vx = (r()-0.5) * 40 * staerke, vy = (r()-0.5) * 40 * staerke;
  const co = Math.cos(dreh), si = Math.sin(dreh);
  let aus = zuege.map(z => {
    const kurz = r() < 0.25 * staerke
      ? Math.max(3, Math.round(z.length * (0.82 + 0.15 * r()))) : z.length;
    return z.slice(0, kurz).map(p => {
      const x = (p[0]-50) * gross, y = (p[1]-50) * gross;
      return [50 + x*co - y*si + vx + (r()-0.5)*7*staerke,
              50 + x*si + y*co + vy + (r()-0.5)*7*staerke];
    });
  });
  /* Der Finger wird nicht abgesetzt - oder einmal zuviel.
   *
   * Ohne diese beiden Zeilen war der Vorrat blind fuer das, woran der
   * Zug-Aufschlag haengt. Die Messung empfahl daraufhin einen Aufschlag,
   * der neun Prozentpunkte kostet: sie konnte seinen Preis nicht sehen.
   * Eine Pruefung, die eine Sache nicht abbilden kann, spricht sie frei. */
  if (aus.length > 1 && r() < 0.25) {
    const i = Math.floor(r() * (aus.length - 1));
    aus = [...aus.slice(0, i), [...aus[i], ...aus[i+1]], ...aus.slice(i+2)];
  } else if (r() < 0.15) {
    const i = Math.floor(r() * aus.length), z = aus[i];
    if (z.length > 7) {
      const m = Math.floor(z.length / 2);
      aus = [...aus.slice(0, i), z.slice(0, m), z.slice(m), ...aus.slice(i+1)];
    }
  }
  return aus;
}

for (const [name, satz] of SAETZE) {
  let richtig = 0, verwechselt = 0, unsicher = 0, n = 0;
  let groessterAbstand = 0, kleinsterVorsprung = Infinity;
  const woMit = {};
  for (const b of satz) {
    const rein = b.zuege.map(d => S.abtasten(d, 24));
    for (let k = 0; k < 40; k++) {
      const e = S.erkennen(verkrummen(rein, wuerfel(k*7919 + b.zeichen.charCodeAt(0))), satz); n++;
      /* Die Spanne wird ueber ALLE richtig gelesenen Faelle gefuehrt, auch
       * ueber die unsicheren. Der erste Anlauf nahm nur die angenommenen -
       * und damit konnte die Zahl gar nicht ausserhalb der Schwelle
       * liegen: sie war die Schwelle. Eine Kennzahl, die nicht schlechter
       * werden KANN, sagt nichts (Regel 1). */
      if (e.zeichen === b.zeichen) {
        groessterAbstand = Math.max(groessterAbstand, e.abstand);
        kleinsterVorsprung = Math.min(kleinsterVorsprung, e.vorsprung);
      }
      if (e.zeichen === b.zeichen && e.sicher) richtig++;
      else if (e.sicher) {
        verwechselt++;
        const t = `${b.zeichen}\u2192${e.zeichen}`; woMit[t] = (woMit[t] || 0) + 1;
      } else unsicher++;
    }
  }
  const anteil = 100 * richtig / n, falschAnteil = 100 * verwechselt / n;
  pruefe(anteil >= SOLL.krumm, `${name} krumm geschrieben: nur ${anteil.toFixed(1)} % richtig `
    + `erkannt, im Backlog stehen mindestens ${SOLL.krumm} %`);
  pruefe(falschAnteil <= SOLL.verwechselt,
    `${name}: ${falschAnteil.toFixed(1)} % werden sicher als das FALSCHE Zeichen gelesen, `
    + `erlaubt sind ${SOLL.verwechselt} % — häufigste: `
    + Object.entries(woMit).sort((a,b)=>b[1]-a[1]).slice(0,3)
        .map(([t,c])=>`${t} ${c}x`).join(', '));
  console.log(`    ${name} krumm: ${anteil.toFixed(1)} % richtig, `
    + `${falschAnteil.toFixed(1)} % verwechselt, ${(100*unsicher/n).toFixed(1)} % „noch mal"`
    + `  (${n} Fälle) — knappster richtiger: Abstand ${groessterAbstand.toFixed(1)} `
    + `von ${S.ABSTAND_MAX}, Vorsprung ${kleinsterVorsprung.toFixed(2)} von ${S.VORSPRUNG_MIN}`);
}

/* ---- Gekritzel ist kein Zeichen -------------------------------------- */
for (const [name, satz] of SAETZE) {
  const kritzel = [];
  for (let k = 0; k < 400; k++) {
    const r = wuerfel(k * 104729);
    const n = 1 + Math.floor(r() * 3);
    kritzel.push(Array.from({ length:n }, () =>
      Array.from({ length:12 }, () => [10 + 80*r(), 10 + 80*r()])));
  }
  const werte = kritzel.map(z => S.erkennen(z, satz));
  const angenommen = werte.filter(e => e.sicher).length;
  const anteil = 100 * angenommen / kritzel.length;
  pruefe(anteil <= SOLL.kritzel, `${name}: ${angenommen} von 400 Gekritzeln werden als `
    + `Zeichen angenommen (${anteil.toFixed(1)} %), erlaubt ist ${SOLL.kritzel} %`);
  /* Und der Beweis, dass dieses Gekritzel ueberhaupt etwas beweisen KANN.
   *
   * Wuerfelt man Punkte, die von jedem Zeichen meilenweit entfernt liegen,
   * ist „kein Gekritzel angenommen" keine Leistung, sondern eine
   * Selbstverstaendlichkeit - und die Pruefung meldet nie etwas. Also wird
   * nachgesehen, wie es bei einer LOCKEREN Schwelle aussieht: dort muessen
   * welche durchkommen (Regel 1). */
  const locker = werte.filter(e => e.abstand <= S.ABSTAND_MAX + 3
                                && e.vorsprung >= S.VORSPRUNG_MIN - 0.4).length;
  pruefe(locker > 0, `${name}: bei einer um 3 Punkte lockereren Schwelle käme KEIN einziges `
    + 'Gekritzel durch — dann liegt der Vorrat zu weit weg und die Zahl darüber beweist nichts');
  console.log(`    ${name} Gekritzel: ${angenommen} von 400 angenommen (${anteil.toFixed(1)} %) — `
    + `bei drei Punkten mehr Nachsicht wären es ${locker}`);
}

/* ---- Die Formen, die vom Zielgeraet gemeldet wurden (M4r) -------------
 *
 * Krumme Vorlagen und Gekritzel messen die BREITE der Toleranz. Sie sagen
 * nichts darueber, ob die richtigen Formen ueberhaupt im Vorrat stehen -
 * und genau daran ist die Erkennung am iPhone gescheitert: die deutsche
 * Sieben mit Querstrich, die Vier mit senkrechtem linken Schenkel und die
 * Sechs, deren Bogen nicht ganz oben ansetzt.
 *
 * Diese sechs Faelle stehen deshalb NAMENTLICH da. Eine Prozentzahl kann
 * um einen halben Punkt fallen, ohne dass jemand hinsieht; ein Fall mit
 * Namen kann das nicht.
 */
{
  const p = (d, n = 40) => S.abtasten(d, n);
  const sechs = p(S.zuegeVon('6')[0], 60);
  const FAELLE = [
    ['die Sieben mit Querstrich, zweizügig', '7',
     [p('M26 14 L74 14 L44 90'), p('M40 52 L64 52')]],
    ['die Sieben mit Querstrich, dreizügig', '7',
     [p('M26 14 L74 14'), p('M74 14 L44 90'), p('M40 52 L64 52')]],
    ['die Vier mit senkrechtem Schenkel, zweizügig', '4',
     [p('M32 12 L32 58 L78 58'), p('M62 26 L62 90')]],
    ['die Vier mit senkrechtem Schenkel, einzügig', '4',
     [p('M32 12 L32 58 L78 58 L62 58 L62 90')]],
    ['die Sechs, 10 % später angesetzt', '6', [sechs.slice(6)]],
    ['die Sechs, 17 % später angesetzt', '6', [sechs.slice(10)]],
  ];
  /* Sauber UND krumm.
   *
   * Die saubere Form allein beweist zu wenig: sie geht auch durch, wenn
   * die passende Vorlage FEHLT und nur der kleinere Zugaufschlag sie
   * gerade noch durchlaesst. Die Gegenprobe „die Sieben verliert ihre
   * Form mit Querstrich" hat genau das gezeigt - Vorlage weg, Tor
   * trotzdem gruen.
   *
   * Ein Kind schreibt nicht sauber. Jede der sechs Formen wird deshalb
   * zwanzigmal verkrummt, mit demselben Wuerfel wie oben, und dann zaehlt
   * der Anteil. Wer die Vorlage entfernt, verliert diesen Anteil sofort -
   * die knappe saubere Form traegt zwanzig krumme nicht mit. */
  const zeilen = [];
  let krumm = 0, krummN = 0;
  for (const [name, soll, zuege] of FAELLE) {
    const e = S.erkennen(zuege, S.ZIFFERN);
    pruefe(e.sicher && e.zeichen === soll,
      `${name} wird nicht als ${soll} erkannt — erkannt: ${e.zeichen}, `
      + `Abstand ${e.abstand.toFixed(1)} von ${S.ABSTAND_MAX}, `
      + `Vorsprung ${e.vorsprung.toFixed(1)} von ${S.VORSPRUNG_MIN}`);
    zeilen.push(`${soll} ${e.abstand.toFixed(1)}`);
    for (let k = 0; k < 20; k++) {
      krummN++;
      const v = S.erkennen(verkrummen(zuege, wuerfel(k * 31337 + name.length)), S.ZIFFERN);
      if (v.sicher && v.zeichen === soll) krumm++;
    }
  }
  const anteilFaelle = 100 * krumm / krummN;
  pruefe(anteilFaelle >= 80, `die Formen vom Zielgerät halten krumm geschrieben nur `
    + `${anteilFaelle.toFixed(1)} % — unter 80 % ist die passende Vorlage entweder weg `
    + 'oder sie trägt nicht');
  console.log(`    Formen vom Zielgerät: ${FAELLE.length} von ${FAELLE.length} sauber erkannt `
    + `(${zeilen.join(' · ')}), krumm ${anteilFaelle.toFixed(1)} % von ${krummN}`);
}

/* ---- Nachfahren ------------------------------------------------------ */
{
  let angenommen = 0, abgelehnt = { halb:0, rueckwaerts:0, daneben:0 }, zuege = 0;
  for (const [, satz] of SAETZE) for (const b of satz) {
    for (const d of b.zuege) {
      zuege++;
      const genau = S.abtasten(d, 40);
      if (S.nachgefahren(d, genau).gut) angenommen++;
      else pruefe(false, `${b.zeichen}: die eigene Vorlage gilt nicht als nachgefahren`);
      // Die drei Faelle, die NICHT gelten duerfen. Ohne sie waere
      // `nachgefahren: () => true` gruen.
      if (!S.nachgefahren(d, genau.slice(0, 20)).gut) abgelehnt.halb++;
      if (!S.nachgefahren(d, genau.slice().reverse()).gut) abgelehnt.rueckwaerts++;
      const weg = genau.map(([x, y]) => [x + S.TOLERANZ_NACH * 2, y]);
      if (!S.nachgefahren(d, weg).gut) abgelehnt.daneben++;
    }
  }
  pruefe(abgelehnt.halb === zuege, `${zuege - abgelehnt.halb} halb nachgefahrene Züge `
    + 'gelten trotzdem als fertig');
  pruefe(abgelehnt.rueckwaerts === zuege, `${zuege - abgelehnt.rueckwaerts} rückwärts `
    + 'nachgefahrene Züge gelten trotzdem — dann lernt niemand die Schreibrichtung');
  pruefe(abgelehnt.daneben === zuege, `${zuege - abgelehnt.daneben} Züge weit neben der `
    + 'Linie gelten trotzdem als nachgefahren');
  console.log(`    Nachfahren: ${angenommen} von ${zuege} Zügen angenommen; `
    + `halb, rückwärts und daneben werden je ${zuege}-mal abgelehnt`);
}

if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER:`);
  for (const f of fehler) console.log(`    ✗ ${f}`);
  console.log('');
  process.exit(1);
}
console.log('\n  schreiben grün.\n');
