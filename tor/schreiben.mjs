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
    verwechselt: zahl('Sicher erkannt, aber der falsche Buchstabe'),
    kritzel:     zahl('Gekritzel als Buchstabe angenommen'),
  };
})();
for (const [k, v] of Object.entries(SOLL))
  pruefe(Number.isFinite(v), `Die Sollzeile für „${k}" fehlt in ${BACKLOG}, `
    + 'Abschnitt 2.3 — dann prüft dieses Tor gegen nichts');

/* ---- Die Vorlagen selbst --------------------------------------------- */
pruefe(S.BUCHSTABEN.length === 26, `${S.BUCHSTABEN.length} Buchstaben statt 26`);
{
  const gesehen = new Set();
  for (const b of S.BUCHSTABEN) {
    pruefe(!gesehen.has(b.zeichen), `${b.zeichen} steht zweimal im Vorrat`);
    gesehen.add(b.zeichen);
    pruefe(b.wort && b.wort[0].toUpperCase() === b.zeichen,
      `${b.zeichen}: das Merkwort „${b.wort}" fängt nicht mit dem Buchstaben an`);
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

/* ---- Jede Vorlage erkennt sich selbst -------------------------------- */
{
  let gut = 0;
  for (const b of S.BUCHSTABEN) {
    const e = S.erkennen(b.zuege.map(d => S.abtasten(d, 24)));
    if (e.zeichen === b.zeichen && e.sicher) gut++;
    else pruefe(false, `${b.zeichen} erkennt sich selbst nicht `
      + `(erkannt: ${e.zeichen}, Abstand ${e.abstand.toFixed(1)}, `
      + `Vorsprung ${e.vorsprung.toFixed(2)})`);
  }
  pruefe(gut >= SOLL.selbst, `nur ${gut} von 26 Vorlagen erkennen sich selbst`);
  console.log(`    Vorlagen: ${gut} von 26 erkennen sich selbst`);
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
  return zuege.map(z => {
    const kurz = r() < 0.25 * staerke
      ? Math.max(3, Math.round(z.length * (0.82 + 0.15 * r()))) : z.length;
    return z.slice(0, kurz).map(p => {
      const x = (p[0]-50) * gross, y = (p[1]-50) * gross;
      return [50 + x*co - y*si + vx + (r()-0.5)*7*staerke,
              50 + x*si + y*co + vy + (r()-0.5)*7*staerke];
    });
  });
}

{
  let richtig = 0, verwechselt = 0, unsicher = 0, n = 0;
  let groessterAbstand = 0, kleinsterVorsprung = Infinity;
  const woMit = {};
  for (const b of S.BUCHSTABEN) {
    const rein = b.zuege.map(d => S.abtasten(d, 24));
    for (let k = 0; k < 40; k++) {
      const e = S.erkennen(verkrummen(rein, wuerfel(k*7919 + b.zeichen.charCodeAt(0)))); n++;
      /* Die Spanne wird ueber ALLE richtig gelesenen Faelle gefuehrt, auch
       * ueber die unsicheren. Der erste Anlauf nahm nur die angenommenen -
       * und damit konnte die Zahl gar nicht ausserhalb der Schwelle
       * liegen: sie war die Schwelle. Eine Kennzahl, die nicht schlechter
       * werden KANN, sagt nichts (Regel 1). */
      if (e.zeichen === b.zeichen) {
        groessterAbstand = Math.max(groessterAbstand, e.abstand);
        kleinsterVorsprung = Math.min(kleinsterVorsprung, e.vorsprung);
      }
      if (e.zeichen === b.zeichen && e.sicher) {
        richtig++;
      } else if (e.sicher) {
        verwechselt++;
        const s = `${b.zeichen}→${e.zeichen}`; woMit[s] = (woMit[s] || 0) + 1;
      } else unsicher++;
    }
  }
  const anteil = 100 * richtig / n, falschAnteil = 100 * verwechselt / n;
  pruefe(anteil >= SOLL.krumm, `krumm geschrieben: nur ${anteil.toFixed(1)} % richtig erkannt, `
    + `im Backlog stehen mindestens ${SOLL.krumm} %`);
  pruefe(falschAnteil <= SOLL.verwechselt,
    `${falschAnteil.toFixed(1)} % werden sicher als der FALSCHE Buchstabe gelesen, `
    + `erlaubt sind ${SOLL.verwechselt} % — häufigste: `
    + Object.entries(woMit).sort((a,b)=>b[1]-a[1]).slice(0,3)
        .map(([s,c])=>`${s} ${c}x`).join(', '));
  console.log(`    Krumm geschrieben: ${anteil.toFixed(1)} % richtig, `
    + `${falschAnteil.toFixed(1)} % verwechselt, ${(100*unsicher/n).toFixed(1)} % „noch mal"`
    + `  (${n} Fälle)`);
  console.log(`    Knappster richtig gelesener Fall: Abstand `
    + `${groessterAbstand.toFixed(1)} von ${S.ABSTAND_MAX} erlaubt, Vorsprung `
    + `${kleinsterVorsprung.toFixed(2)} von ${S.VORSPRUNG_MIN} verlangt`);
}

/* ---- Gekritzel ist kein Buchstabe ------------------------------------ */
{
  const kritzel = [];
  for (let k = 0; k < 400; k++) {
    const r = wuerfel(k * 104729);
    const n = 1 + Math.floor(r() * 3);
    kritzel.push(Array.from({ length:n }, () =>
      Array.from({ length:12 }, () => [10 + 80*r(), 10 + 80*r()])));
  }
  const werte = kritzel.map(z => S.erkennen(z));
  const angenommen = werte.filter(e => e.sicher).length;
  const anteil = 100 * angenommen / kritzel.length;
  pruefe(anteil <= SOLL.kritzel, `${angenommen} von 400 Gekritzeln werden als Buchstabe `
    + `angenommen (${anteil.toFixed(1)} %), erlaubt ist ${SOLL.kritzel} %`);
  /* Und der Beweis, dass dieses Gekritzel ueberhaupt etwas beweisen KANN.
   *
   * Wuerfelt man Punkte, die von jedem Buchstaben meilenweit entfernt
   * liegen, ist „kein Gekritzel angenommen" keine Leistung, sondern eine
   * Selbstverstaendlichkeit - und die Pruefung meldet nie etwas. Also
   * wird nachgesehen, wie es bei einer LOCKEREN Schwelle aussieht: dort
   * muessen welche durchkommen. Tun sie es nicht, ist der Vorrat zu
   * leicht und die Zahl oben wertlos (Regel 1). */
  const locker = werte.filter(e => e.abstand <= S.ABSTAND_MAX + 3
                                && e.vorsprung >= S.VORSPRUNG_MIN - 0.4).length;
  pruefe(locker > 0, 'Bei einer um 3 Punkte lockereren Schwelle käme KEIN einziges '
    + 'Gekritzel durch — dann liegt der Vorrat zu weit weg und die Zahl darüber '
    + 'beweist nichts');
  console.log(`    Gekritzel: ${angenommen} von 400 angenommen (${anteil.toFixed(1)} %) — `
    + `bei drei Punkten mehr Nachsicht wären es ${locker}`);
}

/* ---- Nachfahren ------------------------------------------------------ */
{
  let angenommen = 0, abgelehnt = { halb:0, rueckwaerts:0, daneben:0 }, zuege = 0;
  for (const b of S.BUCHSTABEN) {
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
