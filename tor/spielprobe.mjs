// Tor `spielprobe`.
//
// Alle anderen Tore pruefen, ob das Programm laeuft. Dieses prueft, ob das
// SPIEL stimmt: gibt ein Kind eine richtige Antwort, wird sie auch als
// richtig gewertet?
//
// Der Anlass: ein Kind hat "Australien" getippt und die App hat es
// abgelehnt. Der Kontinent heisst im Vorrat "Australien und Ozeanien";
// "Australien" steht dort als Alias - aber `rechtschreibung()` bekam nur
// den kanonischen Namen. Damit war JEDER Alias beim Tippen tot: England,
// Kongo, Amerika, Canada, Mexico, Tanzania, Bangladesh.
//
// Zwoelf Tore waren gruen. Keines hat je eine Antwort gegeben.
import fs from 'node:fs';
import * as I from '../src/inhalt/erdkunde.js';
import * as R from '../src/inhalt/rechnen.js';
import { STAEDTE } from '../src/geo/staedte.js';
import * as V from '../src/vergleich/vergleich.js';
import { LAENDER_EUROPA_GROB } from '../src/geo/laender-europa.grob.js';
import { LAENDER_AFRIKA_GROB } from '../src/geo/laender-afrika.grob.js';
import { LAENDER_ASIEN_GROB } from '../src/geo/laender-asien.grob.js';
import { LAENDER_NORDAMERIKA_GROB } from '../src/geo/laender-nordamerika.grob.js';
import { LAENDER_SUEDAMERIKA_GROB } from '../src/geo/laender-suedamerika.grob.js';
import { KONTINENTE_GROB } from '../src/geo/kontinente.grob.js';
import { DEUTSCHLAND_MITTEL } from '../src/geo/deutschland.mittel.js';

const fehler = [], hinweise = [];
let geprueft = 0;

/** Die Kandidatensaetze, GENAU wie `vorrat()` in spiel.js sie baut. */
function saetze() {
  const s = [];
  for (const tiefe of [3, 5]) {
    s.push({ was: `Länder in Europa (Rang ≤ ${tiefe})`,
      liste: I.LAENDER.europa.filter(l => l.rang <= tiefe) });
    s.push({ was: `Länder in Afrika (Rang ≤ ${tiefe})`,
      liste: I.LAENDER.afrika.filter(l => l.rang <= tiefe) });
  }
  s.push({ was: 'Kontinente', liste: I.KONTINENTE });
  s.push({ was: 'Bundesländer',
    liste: STAEDTE.map(x => ({ id: x.id, name: x.name, aliasse: [],
      aussprache: [x.name.toLowerCase()] })) });
  s.push({ was: 'Landeshauptstädte',
    liste: STAEDTE.filter(x => !x.stadtstaat).map(x => ({ id: x.id, name: x.hauptstadt,
      aliasse: [], aussprache: [x.hauptstadt.toLowerCase()] })) });
  return s;
}

/** Ein Tippfehler an einer Stelle, die es wirklich gibt. */
const vertippt = (n) => n.length < 5 ? n
  : n.slice(0, 3) + (n[3] === 'e' ? 'a' : 'e') + n.slice(4);

console.log('\n  Tor `spielprobe`');

for (const { was, liste } of saetze()) {
  const kand = liste.map(x => ({ id: x.id ?? x.a3, name: x.name,
    aliasse: x.aliasse || [], aussprache: x.aussprache || [] }));

  /* --- Eindeutigkeit: zwei Gebiete duerfen nicht denselben Namen tragen -- */
  const belegt = new Map();
  for (const k of kand) for (const n of [k.name, ...k.aliasse]) {
    const s = n.toLowerCase();
    if (belegt.has(s) && belegt.get(s) !== k.id)
      fehler.push(`${was}: „${n}" gehört zu ${belegt.get(s)} UND zu ${k.id} — `
        + `das Kind kann nicht raten, welches gemeint ist`);
    belegt.set(s, k.id);
  }

  for (const ziel of kand) {
    /* --- TIPPEN ------------------------------------------------------- */
    // Jeder Name, den das Kind lesen oder wissen kann, muss zaehlen.
    for (const name of [ziel.name, ...ziel.aliasse]) {
      geprueft++;
      const r = V.rechtschreibung(name, ziel);
      if (r.urteil !== 'richtig')
        fehler.push(`${was}/${ziel.name}: getippt „${name}" → ${r.urteil}`
          + `${name === ziel.name ? '' : ' (steht als Alias im Vorrat!)'}`);
    }
    // Kleingeschrieben ist ein Rechtschreibfehler, kein falsches Gebiet.
    geprueft++;
    const klein = V.rechtschreibung(ziel.name.toLowerCase(), ziel);
    if (klein.urteil !== 'fast')
      fehler.push(`${was}/${ziel.name}: klein getippt → ${klein.urteil}, erwartet „fast"`);
    // Ein Buchstabe daneben ebenso.
    geprueft++;
    const tipp = vertippt(ziel.name);
    if (tipp !== ziel.name) {
      const r = V.rechtschreibung(tipp, ziel);
      if (r.urteil === 'falsch')
        fehler.push(`${was}/${ziel.name}: ein Buchstabe daneben („${tipp}") → falsch, `
          + `erwartet „fast"`);
    }

    /* --- SPRECHEN ----------------------------------------------------- */
    // Jede hinterlegte Aussprache muss bei IHREM Gebiet landen.
    for (const gesagt of ziel.aussprache) {
      geprueft++;
      const t = V.abgleich(gesagt, kand);
      if (t.id !== ziel.id)
        fehler.push(`${was}/${ziel.name}: gesagt „${gesagt}" → ${t.art} „${t.name}"`);
      else if (t.art === 'nochmal')
        fehler.push(`${was}/${ziel.name}: gesagt „${gesagt}" → nicht erkannt`);
      else if (t.art === 'rueckfrage')
        hinweise.push(`${was}/${ziel.name}: „${gesagt}" nur mit Rückfrage`);
    }
    // Der geschriebene Name muss auch gesprochen durchgehen.
    geprueft++;
    const gesprochen = V.abgleich(ziel.name, kand);
    if (gesprochen.id !== ziel.id)
      fehler.push(`${was}/${ziel.name}: der eigene Name gesprochen → „${gesprochen.name}"`);
    for (const alias of ziel.aliasse) {
      geprueft++;
      const a = V.abgleich(alias, kand);
      if (a.id !== ziel.id)
        fehler.push(`${was}/${ziel.name}: Alias „${alias}" gesprochen → „${a.name}"`);
    }
  }
}

/* ============================ Stimmt der Inhalt in sich? ============== */
//
// Fakten kann kein Programm nachschlagen. Ihre INNEREN Zusammenhaenge schon -
// und dort sitzen die Fehler, die beim Ergaenzen entstehen.

// Ebene 2: die Raenge muessen je Kontinent 1..5 sein, jeder genau einmal.
for (const [kont, liste] of Object.entries(I.LAENDER)) {
  const r = liste.map(l => l.rang).sort((a, b) => a - b);
  if (r.join() !== '1,2,3,4,5')
    fehler.push(`Länder in ${kont}: Ränge ${r.join(',')}, erwartet 1,2,3,4,5 — `
      + `Fiona sieht Rang 1–3, Lea 1–5; eine Lücke macht ihre Auswahl unbestimmt`);
  geprueft++;
}

// Ebene 1: die Runden bauen aufeinander auf, und jede bringt etwas Neues.
{
  // Wieviele Runden es gibt, steht in den DATEN. [1,2,3] stand hier fest -
  // und als Antarktika herausfiel, meldete das Tor „Runde 3 ist leer", obwohl
  // es sie schlicht nicht mehr gibt. Eine Zahl im Tor, die die Daten nicht
  // kennen, prueft irgendwann etwas anderes als das, was es gibt.
  const runden = Math.max(...I.KONTINENTE.map(k => k.runde));
  const proRunde = Array.from({ length: runden }, (_, i) =>
    I.KONTINENTE.filter(k => k.runde === i + 1).length);
  if (proRunde.some(n => n === 0))
    fehler.push(`Kontinente: Runde ${proRunde.indexOf(0) + 1} ist leer — `
      + `Fionas Aufbau überspringt sie stumm`);
  if (I.KONTINENTE.filter(k => k.runde <= 1).length < 3)
    fehler.push('Kontinente: Runde 1 hat weniger als drei Gebiete — zu wenig zum Unterscheiden');
  geprueft += 2;
}

// Ebene 4: jeder Ablenker muss eine ANDERE Stadt sein als die Hauptstadt,
// und er muss zu einem Bundesland gehoeren, das es gibt.
{
  const nachId = new Map(STAEDTE.map(x => [x.id, x]));
  for (const [id, staedte] of Object.entries(I.HAUPTSTADT_ABLENKER)) {
    const b = nachId.get(id);
    geprueft++;
    if (!b) { fehler.push(`Ablenker für „${id}" — dieses Bundesland gibt es nicht`); continue; }
    if (b.stadtstaat)
      fehler.push(`${b.name} ist ein Stadtstaat und kommt in Ebene 4 nicht vor, `
        + `hat aber Ablenker`);
    for (const stadt of staedte) {
      geprueft++;
      if (stadt === b.hauptstadt)
        fehler.push(`${b.name}: „${stadt}" steht als Ablenker UND ist die Hauptstadt`);
    }
    if (staedte.length < 2)
      fehler.push(`${b.name}: nur ${staedte.length} Ablenker, gebraucht werden zwei`);
    if (new Set(staedte).size !== staedte.length)
      fehler.push(`${b.name}: derselbe Ablenker steht zweimal da`);
  }
  // Jedes Bundesland mit Hauptstadt-Raetsel braucht Ablenker.
  for (const b of STAEDTE.filter(x => !x.stadtstaat)) {
    geprueft++;
    if (!I.HAUPTSTADT_ABLENKER[b.id])
      fehler.push(`${b.name}: keine Ablenker — die Aufgabe hätte nur drei fremde Städte`);
  }
  // Die Fallen muessen Bundeslaender sein, die es gibt und die Ablenker haben.
  for (const id of I.ECHTE_FALLEN) {
    geprueft++;
    if (!I.HAUPTSTADT_ABLENKER[id])
      fehler.push(`ECHTE_FALLEN nennt „${id}", dort stehen aber keine Ablenker`);
  }
}

// Stadtstaaten: genau drei, und ihre Hauptstadt sind sie selbst.
{
  const ss = STAEDTE.filter(x => x.stadtstaat);
  geprueft++;
  if (ss.length !== 3)
    fehler.push(`${ss.length} Stadtstaaten statt drei`);
  for (const x of ss) {
    geprueft++;
    if (x.hauptstadt !== x.name)
      fehler.push(`${x.name} ist ein Stadtstaat, seine Hauptstadt heißt aber „${x.hauptstadt}"`);
  }
}

/* ================= Hat jedes Gebiet auch eine Flaeche? =============== */
//
// Ein Gebiet kann in den Daten stehen, gezaehlt werden - und trotzdem nie
// erscheinen, weil beim Backen seine Geometrie wegfiel. Genau das ist
// Guatemala passiert: auf der groben Stufe misst es rund anderthalb
// Bildpunkte, und der Inselfilter warf es weg. Ein MultiPolygon haette
// seine groesste Flaeche behalten, ein einfaches Polygon fiel ersatzlos -
// eine Unsymmetrie mit Folgen. Die Torkette zaehlte weiter 25 Laender,
// spielbar waren 24.
{
  const geo = { europa:LAENDER_EUROPA_GROB, afrika:LAENDER_AFRIKA_GROB,
    asien:LAENDER_ASIEN_GROB, nordamerika:LAENDER_NORDAMERIKA_GROB,
    suedamerika:LAENDER_SUEDAMERIKA_GROB };
  for (const [kont, liste] of Object.entries(I.LAENDER)) {
    const gebacken = new Set((geo[kont] || []).filter(x => x.rang).map(x => x.a3));
    for (const l of liste) {
      geprueft++;
      if (!gebacken.has(l.a3))
        fehler.push(`${l.name} (${l.a3}, ${kont}) steht in den Daten, hat aber keine `
          + `Fläche auf der Karte — es kann nie gefragt werden`);
    }
  }
  const kont = new Set(KONTINENTE_GROB.map(k => k.id));
  for (const k of I.KONTINENTE) {
    geprueft++;
    // Antarktika hat eine eigene, polare Ansicht - es MUSS in der
    // Weltkarte fehlen, deshalb hier ausgenommen.
    if (k.id !== 'antarktika' && !kont.has(k.id))
      fehler.push(`Kontinent ${k.name} hat keine Fläche auf der Weltkarte`);
  }
  const bl = new Set(DEUTSCHLAND_MITTEL.map(b => b.id));
  for (const b of STAEDTE) {
    geprueft++;
    if (!bl.has(b.id)) fehler.push(`${b.name} hat keine Fläche auf der Deutschlandkarte`);
  }
}

/* Rechnen: JEDE Aufgabe, JEDE angebotene Zahl.
 *
 * Hundert Aufgaben mal vier Möglichkeiten sind vierhundert Antworten, und
 * genau drei Dinge müssen für jede gelten: die richtige Zahl steht unter
 * den vieren, sie ist die einzige richtige, und keine der drei falschen
 * ist es zufällig auch. Das ist derselbe Anspruch wie bei den
 * Hauptstädten - vier Namen, genau einer richtig -, nur nachrechenbar.
 *
 * Der Fehler, den das fangen soll: ein Ablenker, der aus Versehen dasselbe
 * Ergebnis hat. Bei `4 + 4` ist die Gegenrechnung 0, bei `5 − 5` wäre sie
 * 10 - solche Fälle fallen nicht auf, wenn man drei Aufgaben von Hand
 * durchsieht.
 */
{
  // Ein Würfel, der bei jedem Lauf denselben Weg nimmt: sonst wäre grün
  // heute und rot morgen dieselbe Aussage.
  let x = 20260829;
  const wuerfel = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
  const alle = R.vorrat();
  let vier = 0;
  for (const auf of alle) {
    geprueft++;
    const falsche = R.ablenker(auf, wuerfel);
    const angeboten = [auf.wert, ...falsche];
    if (angeboten.length !== 4)
      fehler.push(`${auf.frage}: ${angeboten.length} Möglichkeiten statt vier`);
    else vier++;
    if (new Set(angeboten).size !== angeboten.length)
      fehler.push(`${auf.frage}: eine Zahl steht doppelt (${angeboten.join(', ')})`);
    for (const z of falsche) {
      geprueft++;
      if (z === auf.wert)
        fehler.push(`${auf.frage} = ${auf.wert}: die falsche Antwort ${z} ist die richtige`);
      if (z < 0 || z > R.BIS)
        fehler.push(`${auf.frage}: die Möglichkeit ${z} liegt außerhalb des Zahlenraums`);
    }
    // Und die Rechnung selbst, gegen die zweite Meinung von JavaScript.
    const soll = auf.rechenart === 'plus' ? auf.a + auf.b : auf.a - auf.b;
    if (auf.wert !== soll) fehler.push(`${auf.frage} ergibt ${auf.wert}, gerechnet ${soll}`);
    if (auf.name !== String(soll)) fehler.push(`${auf.frage}: Anzeige „${auf.name}" statt ${soll}`);
  }
  console.log(`    ${alle.length} Rechenaufgaben, ${vier} mit genau vier Möglichkeiten`);
}

console.log(`    ${geprueft} Antworten und Zusammenhänge durchgespielt`);
if (hinweise.length) {
  console.log(`    ${hinweise.length} nur mit Rückfrage:`);
  hinweise.slice(0, 8).forEach(h => console.log(`      ${h}`));
  if (hinweise.length > 8) console.log(`      … und ${hinweise.length - 8} weitere`);
}
if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER — eine richtige Antwort wurde nicht als richtig gewertet:`);
  fehler.forEach(f => console.log('    ✗ ' + f));
  process.exit(1);
}
console.log('\n  spielprobe grün: jede richtige Antwort wird als richtig gewertet.');
