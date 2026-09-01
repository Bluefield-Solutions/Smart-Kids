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
import * as L from '../src/kern/leitner.js';
import { STAEDTE } from '../src/geo/staedte.js';
import * as V from '../src/vergleich/vergleich.js';
import * as Ri from '../src/kern/richtung.js';
import { LAENDER_EUROPA_GROB } from '../src/geo/laender-europa.grob.js';
import { KARTEN_GROB } from '../src/geo/karten.grob.js';
import { KONTINENTE_GROB } from '../src/geo/kontinente.grob.js';
import { DEUTSCHLAND_MITTEL } from '../src/geo/deutschland.mittel.js';
// Sitzungslaenge und Tiefe je Profil - aus der Tabelle im Backlog,
// nicht aus `prototyp/spiel.js`: das Soll kommt aus der Referenz, nicht
// aus dem Prueflig (Regel 3). Derselbe Leser wie im Rauchtest.
import * as PT from './profiltabelle.mjs';

const fehler = [], hinweise = [];
// Was beim Lesen der Profiltabelle schiefging, gehoert in dieselbe Liste -
// eine fehlende Zeile darf nicht still zu einem leeren Soll werden.
fehler.push(...PT.FEHLER);
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
  /* Hauptstädte in Europa (R6).
   *
   * Hier ist die Schreibprobe keine Formsache: das Profil „Eltern"
   * bekommt nie eine Auswahl, es TIPPT diese zwoelf Namen. Moskau,
   * Bukarest, Kiew - jede Schreibtoleranz, die einen davon einem falschen
   * Gegenstand zuschlaegt, wertet eine richtige Antwort falsch. */
  s.push({ was: 'Hauptstädte in Europa',
    liste: LAENDER_EUROPA_GROB.filter(l => l.rang && l.hauptstadt)
      .map(x => ({ id: x.a3, name: x.hauptstadt,
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

/* Ebene 2: die Raenge sind je Kontinent LUECKENLOS 1 bis zur tiefsten
 * Profilstufe, jeder genau einmal.
 *
 * Die Zahl kommt aus den Profilen, nicht von hier: `laenderTiefe` filtert
 * `rang <= n`, und ein fehlender Rang 7 waere still ein Land weniger fuer
 * jeden, der tiefer spielt. Bis R4 stand hier die Fuenf fest - dieselbe
 * Zahl wie in `tor/inhalt.mjs`, und beide haetten beim dritten Profil
 * gleichzeitig veraltet.
 */
const TIEFSTE = Math.max(...[...fs.readFileSync('prototyp/spiel.js', 'utf8')
  .matchAll(/laenderTiefe:\s*(\d+)/g)].map(m => +m[1]));
/* Lueckenlos 1..n JE KONTINENT - nicht 1..TIEFSTE.
 *
 * Bis D2c stand hier (und in `tor/inhalt.mjs`, zweimal dieselbe Regel)
 * die Erwartung, dass jeder Kontinent genau so viele Laender hat wie das
 * tiefste Profil spielt. Mit den fuenf Nachbarn Deutschlands hat Europa
 * siebzehn und die anderen vier haben zwoelf - das ist eine Entscheidung
 * und kein Fehler. Was wirklich schiefgeht, ist die LUECKE: `laenderTiefe`
 * filtert `rang <= n`, ein fehlender Rang 5 heisst still ein Land weniger
 * fuer jeden, der tiefer spielt. */
for (const [kont, liste] of Object.entries(I.LAENDER)) {
  const r = liste.map(l => l.rang).sort((a, b) => a - b);
  const soll = Array.from({ length: liste.length }, (_, i) => i + 1).join(',');
  if (r.join() !== soll)
    fehler.push(`Länder in ${kont}: Ränge ${r.join(',')}, erwartet lückenlos ${soll} — `
      + `das tiefste Profil spielt bis Rang ${TIEFSTE}; `
      + 'eine Lücke macht seine Auswahl unbestimmt');
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
  // Das Verzeichnis kommt erzeugt aus dem Backen (A6) - eine Tafel von
  // Hand hat hier bei der sechsten Karte behauptet, neun Laender haetten
  // keine Flaeche, obwohl ihre Karte danebenlag.
  const geo = KARTEN_GROB;
  for (const [kont, liste] of Object.entries(I.LAENDER)) {
    /* Gefragt wird nach dem UMRISS, nicht nach dem gebackenen Rang.
     *
     * Hier stand `filter(x => x.rang)`. Dieser Rang stammt aus dem Tag,
     * an dem gebacken wurde - als D2c fuenf Nachbarn aufnahm, standen sie
     * mit `rang: null` im Umriss, und das Tor meldete fuer alle fuenf
     * „hat keine Flaeche auf der Karte", obwohl die Flaeche seit jeher
     * da ist. Dieselbe Zeile stand in `prototyp/bauen.mjs` und in
     * `tor/inhalt.mjs`: die Geometrie ist der Vorrat, `erdkunde.js` ist
     * die Ware. Was hier zaehlt, ist ein Pfad. */
    const gebacken = new Set((geo[kont] || []).filter(x => x.pfad).map(x => x.a3));
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
  // BEIDE Vorräte. Der erste Anlauf prüfte nur Fionas hundert Aufgaben —
  // und Leas hundertvierzig wären mit demselben Recht ungeprüft geblieben,
  // obwohl dort die Ablenker die schwierigeren sind (die Nachbarn in der
  // Reihe, nicht ±1).
  // Und seit R4 die 158 der Eltern. Derselbe Grund wie oben: ein Vorrat, den
  // niemand nachrechnet, ist ein Vorrat, dem man glaubt.
  const alle = [...R.vorrat(), ...R.reihenVorrat(), ...R.grossVorrat()];
  /* Der Zahlenraum je Sorte.
   *
   * Frueher stand hier `?? 100` als Auffangwert - fuer Leas Reihen
   * richtig, fuer Eltern falsch: 19 x 19 ist 361, und jede ihrer
   * Moeglichkeiten waere als „ausserhalb des Zahlenraums" gemeldet
   * worden. Eine Grenze, die fuer alles gilt, gilt fuer nichts. */
  const HOECHSTENS = { plus: R.BIS, minus: R.BIS,
    'mal-gross': R.GROSS_BIS * R.GROSS_BIS,
    /* 25² ist 625, und das Nachbarquadrat 26² = 676 ist genau der
     * Fehler, den jemand macht. Dasselbe wie unten bei der Division:
     * die Grenze meint die plausible Nachbarschaft, nicht den Vorrat. */
    'quadrat': (R.QUADRAT_BIS + 1) * (R.QUADRAT_BIS + 1),
    /* Bei der Division sind die Antworten 11 bis 19 - die NACHBARN
     * davon, 20 und 21, sind aber genau die Versuchung, um die es geht.
     * Die Grenze sagt „was noch plausibel danebengegriffen ist", nicht
     * „welche Antworten es gibt". Fuer Fionas geschlossenen Raum bis 10
     * war beides dasselbe; hier ist es das nicht mehr, und das Tor hat
     * mich zu Recht darauf gestossen. */
    'geteilt-gross': R.GROSS_BIS + 2 };
  let vier = 0;
  for (const auf of alle) {
    geprueft++;
    const grenze = HOECHSTENS[auf.rechenart] ?? 100;
    const falsche = R.ablenkerFuer(auf, wuerfel);
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
      if (z < 0 || z > grenze)
        fehler.push(`${auf.frage}: die Möglichkeit ${z} liegt außerhalb des Zahlenraums`);
      if (!Number.isInteger(z))
        fehler.push(`${auf.frage}: die Möglichkeit ${z} ist keine ganze Zahl`);
    }
    // Und die Rechnung selbst, gegen die zweite Meinung von JavaScript.
    const soll = auf.rechenart === 'plus' ? auf.a + auf.b
      : auf.rechenart === 'minus' ? auf.a - auf.b
      : (auf.rechenart === 'geteilt' || auf.rechenart === 'geteilt-gross') ? auf.a / auf.b
      : auf.a * auf.b;
    // Eine Division, die nicht aufgeht, hat in Leas Reihen nichts zu
    // suchen: sie entstehen als Umkehrung einer Malaufgabe, also MUSS das
    // Ergebnis ganz sein. Geht es das nicht, ist der Vorrat falsch gebaut
    // und nicht die Aufgabe schwer.
    if (!Number.isInteger(soll))
      fehler.push(`${auf.frage} geht nicht auf — Ergebnis ${soll}`);
    if (auf.wert !== soll) fehler.push(`${auf.frage} ergibt ${auf.wert}, gerechnet ${soll}`);
    if (auf.name !== String(soll)) fehler.push(`${auf.frage}: Anzeige „${auf.name}" statt ${soll}`);
  }
  /* Der Vorrat der Eltern wird auch GEZAEHLT, nicht nur nachgerechnet.
   *
   * Die drei Sorten sind von Natur aus begrenzt - 72 · 14 · 72 - und
   * genau das ist die Zusage, an der alles haengt: das Forscherbuch
   * zeichnet jeden Gegenstand, und der Leitner braucht Wiederholung. Ein
   * Vorrat, der still waechst, bricht beides, ohne dass jemand etwas
   * merkt. */
  const zaehlung = {};
  for (const x of R.grossVorrat()) zaehlung[x.rechenart] = (zaehlung[x.rechenart] || 0) + 1;
  const SOLL = { 'mal-gross': 72, 'quadrat': 14, 'geteilt-gross': 72 };
  for (const [sorte, n] of Object.entries(SOLL))
    if (zaehlung[sorte] !== n)
      fehler.push(`Eltern: ${zaehlung[sorte] ?? 0} Aufgaben der Sorte „${sorte}" statt ${n}`);
  console.log(`    ${alle.length} Rechenaufgaben (${R.vorrat().length} Fiona, `
    + `${R.reihenVorrat().length} Lea, ${R.grossVorrat().length} Eltern), `
    + `${vier} mit genau vier Möglichkeiten`);
  console.log(`    Sorten für Eltern: `
    + Object.entries(zaehlung).map(([s, n]) => `${s} ${n}`).join(' · '));
}

/* Die Verteilung einer gemischten Sitzung.
 *
 * Der Fehler, den das fangen soll, hat schon einmal zugeschlagen: jeden
 * Anteil einzeln runden und den Rest auf die letzte Sorte legen. Bei Leas
 * vier Sorten bekam sie an der VOREINSTELLUNG null Divisionsaufgaben —
 * und nichts daran sah kaputt aus. Die Sitzung hatte acht Aufgaben, alle
 * rechenbar, alle richtig gewertet.
 *
 * Geprüft wird gegen die einzige Zusage, die eine Verteilung geben kann:
 * die Summe stimmt, keine Sorte wird negativ, und keine Sorte, auf die
 * ein voller Platz entfällt, geht leer aus.
 */
{
  for (const laenge of [4, 6, 8, 10, 12]) {
    for (let g = 0; g <= 50; g += 5) {
      const m = R.mischungLea(g / 100);
      const anteile = Object.values(m), namen = Object.keys(m);
      const n = L.verteilen(laenge, anteile);
      geprueft++;
      const summe = n.reduce((a, b) => a + b, 0);
      if (summe !== laenge)
        fehler.push(`Verteilung auf ${laenge} bei ${g} % Division ergibt ${summe}`);
      if (n.some(x => x < 0))
        fehler.push(`Verteilung auf ${laenge} bei ${g} % hat einen negativen Posten`);
      anteile.forEach((a, i) => {
        // Wem ein ganzer Platz zusteht, der bekommt auch einen. Genau das
        // war verletzt: 0,8 von 8 Plaetzen sind kein ganzer, aber 10 % von
        // acht Aufgaben sind die Zusage - und der groesste Rest holt sie.
        if (laenge * a >= 1 && n[i] === 0)
          fehler.push(`Verteilung auf ${laenge} bei ${g} %: „${namen[i]}" steht `
            + `${(laenge * a).toFixed(2)} Plätze zu und bekommt keinen`);
        if (Math.abs(n[i] - laenge * a) >= 1)
          fehler.push(`Verteilung auf ${laenge} bei ${g} %: „${namen[i]}" bekommt `
            + `${n[i]} statt ${(laenge * a).toFixed(2)} — mehr als ein ganzer Platz daneben`);
      });
    }
  }
  // Und Fionas zwei Sorten, an ihrer wirklichen Sitzungslänge.
  const f = L.verteilen(6, [R.MISCHUNG_FIONA.plus, R.MISCHUNG_FIONA.minus]);
  geprueft++;
  if (f[0] !== 5 || f[1] !== 1)
    fehler.push(`Fionas Sitzung: ${f[0]} Plus und ${f[1]} Minus statt 5 und 1`);
  console.log(`    Sitzungsverteilung: 5 Längen × 11 Reglerstellungen, Summe und Anspruch stimmen`);
}

/* ================= Was einmal geschafft war, bleibt geschafft ========== */
/*
 * Ein Jahr Spiel, gespielt statt behauptet.
 *
 * Der Anlass: das Forscherbuch, der Fortschrittsbalken, die Sterne und
 * Fionas zweite Kontinentrunde lasen alle das LAUFENDE Leitner-Fach. Das
 * faellt bei jeder falschen Antwort auf 1 zurueck - das ist die
 * Wiederholungslogik und richtig. Aber damit lief auch alles rueckwaerts,
 * was ueber die Vergangenheit spricht: Aufkleber fielen wieder aus dem Buch
 * (gemessen 122 bis 251 je Ebene und Jahr), und Runde 2 war an 47 von 208
 * Sitzungen wieder zu.
 *
 * Diese Probe spielt ein Jahr durch und zaehlt zweierlei:
 *   GELEGENHEITEN  wie oft eine falsche Antwort einen Gegenstand traf, der
 *                  schon einen Aufkleber hatte
 *   VERLUSTE       wie oft der Aufkleber daraufhin weg war
 *
 * Ohne die Gelegenheiten waere die Null bei den Verlusten kein Beweis,
 * sondern ein Zufall der Wuerfel - deshalb steht sie hier als eigene
 * Bedingung.
 */
{
  const TAG = 24 * 60 * 60000;
  const wuerfel = (k) => { let x = (k * 2654435761) >>> 0;
    x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };

  const ebenen = [
    ['Fionas Plus und Minus', R.vorrat(),       6],
    ['Leas Reihen',           R.reihenVorrat(), 8],
    ['Kontinente',            I.KONTINENTE.map(k => ({ id: k.id })), 6],
  ];
  let gelegenheiten = 0, verluste = 0, rundeZu = 0;

  for (const [was, alle, laenge] of ebenen) {
    let stand = L.neuerStand(), keim = 1;
    for (let t = 0; t < 208; t++) {           // vier Sitzungen die Woche, ein Jahr
      const jetzt = Date.UTC(2026, 0, 1, 15, 0, 0) + t * TAG;
      for (const g of L.sitzung(alle, stand, laenge, jetzt, keim++)) {
        const richtig = wuerfel(keim++) < 0.85;
        const hatte = L.istGesammelt(stand, g.id);
        stand = L.verschieben(stand, g.id, richtig, jetzt);
        if (hatte && !richtig) gelegenheiten++;
        if (hatte && !L.istGesammelt(stand, g.id)) {
          verluste++;
          if (verluste <= 3)
            fehler.push(`${was}: „${g.id}" hatte einen Aufkleber und hat ihn nach `
              + `einer falschen Antwort wieder verloren`);
        }
      }
    }
    geprueft += 208 * laenge;
  }

  // Und dasselbe fuer die Kontinentrunden: eine Runde, die offen war, bleibt
  // offen. Gerechnet wie `kontinentRunde` in spiel.js - mit `warGesessen`.
  {
    const K = I.KONTINENTE, RUNDEN = Math.max(...K.map(k => k.runde));
    const runde = (stand) => { let r = 1;
      while (r < RUNDEN && K.filter(k => k.runde <= r)
        .every(k => L.warGesessen(stand, k.id))) r++;
      return r; };
    let stand = L.neuerStand(), keim = 1, hoechste = 1;
    for (let t = 0; t < 208; t++) {
      const jetzt = Date.UTC(2026, 0, 1, 15, 0, 0) + t * TAG;
      const offen = K.filter(k => k.runde <= runde(stand));
      for (const g of L.sitzung(offen, stand, 6, jetzt, keim++))
        stand = L.verschieben(stand, g.id, wuerfel(keim++) < 0.85, jetzt);
      const r = runde(stand);
      if (r < hoechste) rundeZu++;
      hoechste = Math.max(hoechste, r);
    }
    geprueft += 208;
    if (hoechste < RUNDEN)
      fehler.push(`Kontinentrunden: in einem Jahr Spiel wurde Runde ${RUNDEN} nie `
        + `geoeffnet — die Probe beweist nichts`);
    if (rundeZu)
      fehler.push(`Kontinentrunden: eine schon offene Runde war an ${rundeZu} von 208 `
        + `Sitzungen wieder zu`);
  }

  if (!gelegenheiten)
    fehler.push('Aufkleber: in einem Jahr Spiel traf keine falsche Antwort einen '
      + 'Gegenstand mit Aufkleber — die Probe beweist nichts');
  if (verluste > 3)
    fehler.push(`Aufkleber: ${verluste} verlorene Aufkleber in einem Jahr Spiel`);
  console.log(`    Was geschafft war, bleibt: ${gelegenheiten} falsche Antworten auf `
    + `Gegenstände mit Aufkleber, ${verluste} verlorene Aufkleber, `
    + `${rundeZu}× eine offene Runde wieder zu`);
}

/* ---- Wie lang ist eine Sitzung wirklich? (Q12) ------------------------
 *
 * Anlass war Ozeanien. Die Ebene hat drei Ziele - Australien,
 * Papua-Neuguinea, Neuseeland -, waehrend Lea sonst acht und die Eltern
 * zwoelf Aufgaben je Sitzung bekommen. Die Frage, die dahinter steht, ist
 * nicht „ist das kurz", sondern: WAS macht eine Sitzung, wenn der Vorrat
 * kleiner ist als sie selbst?
 *
 * Zwei Antworten waeren falsch, und beide sahen bisher gruen aus:
 *
 *   auffuellen    dieselben drei Gebiete zweimal in einer Runde. Fuer ein
 *                 Kind ist das kein Ueben, sondern ein Fehler der App -
 *                 es hat gerade geantwortet und wird dasselbe wieder
 *                 gefragt.
 *   abschneiden   eine Ebene mit genug Vorrat bekaeme weniger Aufgaben,
 *                 als in der Tabelle steht.
 *
 * Gemessen wird deshalb ueber JEDE Kartenebene und JEDES Profil, vierzig
 * Sitzungen weit gespielt (damit sich Faecher und Faelligkeiten wirklich
 * bewegen): eine Sitzung enthaelt genau `min(Sitzungslaenge, Vorrat)`
 * Gegenstaende, und keinen zweimal.
 *
 * Und die Probe braucht ihre Gelegenheit: eine Pruefung, die nie etwas
 * meldet, ist kein Beweis (Regel 1). Gaebe es keine Ebene, die kuerzer
 * ist als die Sitzung, waere der ganze Abschnitt eine
 * Selbstverstaendlichkeit. Deshalb steht die Zahl der kurzen Faelle als
 * eigene Bedingung da - faellt sie auf null, ist das ein Fehler, kein
 * Erfolg.
 *
 * Die Sitzungslaenge und die Tiefe kommen aus der Profiltabelle im
 * Backlog - aus der Referenz, nicht aus `prototyp/spiel.js`: eine
 * Gegenprobe faelscht das Programm, und ein Soll aus der gefaelschten
 * Datei prueft nichts (Regel 3).
 */
{
  const TAG = 24 * 60 * 60000;
  const wuerfel = (k) => { let x = (k * 2654435761) >>> 0;
    x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };

  /* Die Kartenebenen, GENAU wie `vorrat()` in spiel.js sie baut - nur auf
   * die Kennungen eingedampft, denn hier zaehlt allein die Menge.
   *
   * Die Rechen- und Schreibebenen fehlen mit Absicht: ihr Vorrat wird
   * ERZEUGT (100, 140, 158 Aufgaben) und ist nie kuerzer als eine
   * Sitzung, und sie fragen den Leitner je Rechenart einzeln statt
   * einmal ueber alles. Was hier geprueft wird, gibt es dort nicht. */
  const kartenEbenen = (tiefe, wer) => {
    const e = [];
    for (const [k, liste] of Object.entries(I.LAENDER))
      e.push({ id: `laender:${k}`, alle: liste.filter(l => l.rang <= tiefe)
        .map(l => ({ id: l.a3 })) });
    // Fionas Kontinentrunde waechst: die erste Runde ist der kuerzeste
    // Fall, den es wirklich gibt, die volle Liste der laengste.
    e.push({ id: 'kontinente (Runde 1)',
      alle: I.KONTINENTE.filter(k => k.runde <= 1).map(k => ({ id: k.id })) });
    e.push({ id: 'kontinente', alle: I.KONTINENTE.map(k => ({ id: k.id })) });
    e.push({ id: 'bundeslaender', alle: STAEDTE.map(x => ({ id: x.id })) });
    e.push({ id: 'hauptstaedte',
      alle: STAEDTE.filter(x => !x.stadtstaat).map(x => ({ id: x.id })) });
    // Hauptstaedte in Europa gibt es fuer Fiona nicht - sie liest noch
    // nicht, und eine Stadt hat keinen Umriss zum Ziehen.
    if (wer !== 'fiona')
      e.push({ id: 'hauptstaedte:europa',
        alle: LAENDER_EUROPA_GROB.filter(l => l.rang <= tiefe && l.hauptstadt)
          .map(l => ({ id: l.a3 })) });
    return e;
  };

  let kurzeFaelle = 0, doppelt = 0, verfehlt = 0;
  const kuerzeste = [];

  for (const wer of PT.PROFIL_IDS) {
    const laenge = PT.SITZUNG[wer], tiefe = PT.TIEFE[wer];
    if (!laenge || !tiefe) continue;      // fehlende Tabellenzeile meldet PT selbst
    for (const eb of kartenEbenen(tiefe, wer)) {
      const soll = Math.min(laenge, eb.alle.length);
      if (eb.alle.length < laenge) kurzeFaelle++;
      kuerzeste.push({ wer, id: eb.id, vorrat: eb.alle.length, soll, laenge });
      let stand = L.neuerStand(), keim = 1;
      for (let t = 0; t < 40; t++) {
        const jetzt = Date.UTC(2026, 0, 1, 15, 0, 0) + t * TAG;
        const s = L.sitzung(eb.alle, stand, laenge, jetzt, keim++);
        const ids = s.map(g => g.id);
        if (new Set(ids).size !== ids.length && doppelt++ < 3)
          fehler.push(`${PT.NAME_VON[wer]} · ${eb.id}: eine Sitzung stellt denselben `
            + `Gegenstand zweimal (${ids.join(', ')}) — das Kind hat gerade `
            + `geantwortet und wird dasselbe wieder gefragt`);
        if (s.length !== soll && verfehlt++ < 3)
          fehler.push(`${PT.NAME_VON[wer]} · ${eb.id}: ${s.length} Aufgaben statt `
            + `${soll} — bei ${eb.alle.length} Gebieten und ${laenge} Aufgaben je `
            + `Sitzung sind ${soll} richtig (gedeckelt, nicht aufgefüllt)`);
        for (const g of s)
          stand = L.verschieben(stand, g.id, wuerfel(keim++) < 0.85, jetzt);
      }
      geprueft += 40;
    }
  }

  if (!kurzeFaelle)
    fehler.push('Sitzungslänge: keine einzige Ebene ist kürzer als die Sitzung — '
      + 'dann prüft dieser Abschnitt eine Selbstverständlichkeit und beweist nichts');

  kuerzeste.sort((a, b) => a.soll - b.soll);
  const knapp = kuerzeste.filter(x => x.vorrat < x.laenge);
  console.log(`    Sitzungslänge: ${kuerzeste.length} Ebene-Profil-Paare gespielt, `
    + `${kurzeFaelle} davon mit weniger Vorrat als Sitzungslänge — keine Wiederholung, `
    + `keine aufgefüllte Runde`);
  console.log('    Die kürzesten Sitzungen der App:');
  for (const x of knapp.slice(0, 8))
    console.log(`      ${(PT.NAME_VON[x.wer] + ' · ' + x.id).padEnd(38)}`
      + `${x.soll} statt ${x.laenge} (${x.vorrat} Gebiete)`);
  if (knapp.length > 8) console.log(`      … und ${knapp.length - 8} weitere`);
}

/* ---- Jede Ablehnung nennt einen Grund (A3) ---------------------------
 *
 * Beim Ziehen sagte die App bis hierher „Nicht ganz - probier es noch
 * einmal." Jetzt nennt sie das Gebiet unter dem Finger und die Richtung
 * zum gesuchten. Die Richtung ist eine Rechnung und wird hier gepruefet -
 * ohne Browser, an allen acht Himmelsrichtungen und an der Naehe.
 *
 * Warum ueberhaupt geprueft: ein Hinweis, der in die FALSCHE Richtung
 * zeigt, ist schlimmer als keiner. Er schickt ein Kind weg von der
 * Stelle, an der es fast richtig lag.
 */
{
  const w = 200;
  const soll = [
    [ 0, -w, 'weiter oben'],        [ 0,  w, 'weiter unten'],
    [-w,  0, 'weiter links'],       [ w,  0, 'weiter rechts'],
    [ w, -w, 'weiter oben rechts'], [-w, -w, 'weiter oben links'],
    [ w,  w, 'weiter unten rechts'],[-w,  w, 'weiter unten links'],
  ];
  for (const [dx, dy, wort] of soll) {
    const ist = Ri.richtungswort(dx, dy);
    if (ist !== wort) fehler.push(`Richtung (${dx}|${dy}): „${ist}" statt „${wort}" — `
      + 'ein Hinweis in die falsche Richtung schickt ein Kind weg vom Ziel');
    geprueft++;
  }
  // Und die HAELFTE, die zaehlt: ganz nah gibt es keine Richtung. „Weiter
  // oben" waere dort falscher als nichts.
  for (const [dx, dy] of [[0, 0], [10, -12], [-25, 20]]) {
    if (Ri.richtungswort(dx, dy) !== null)
      fehler.push(`Richtung (${dx}|${dy}): „${Ri.richtungswort(dx, dy)}" statt keiner — `
        + `wer weniger als ${Ri.NAH} Punkte danebenliegt, hat nicht in die falsche `
        + 'Richtung gedacht, sondern den Finger nicht genau genug gesetzt');
    geprueft++;
  }
  // Und dass die Naehe ueberhaupt eine Grenze IST: knapp darueber muss ein
  // Wort kommen, sonst prueft die Zeile darueber eine Selbstverstaendlichkeit.
  if (Ri.richtungswort(0, -(Ri.NAH + 5)) === null)
    fehler.push(`Knapp über ${Ri.NAH} Punkten kommt immer noch keine Richtung — `
      + 'dann ist die Grenze keine Grenze, sondern ein Deckel');
  geprueft++;
  console.log(`    Richtungen: 8 Himmelsrichtungen und die Nähe (${Ri.NAH} px) geprüft`);
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
