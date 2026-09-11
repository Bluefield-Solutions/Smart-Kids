// Tore `inhalt`, `topologie`, `beruehrung`, `marken`.
//
// Alle vier arbeiten auf dem, was wirklich da ist - nicht auf dem, was im
// Konzept steht. Und `doku` vergleicht am Ende beides. Eine Zahl, die
// niemand prueft, veraltet lautlos.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import * as I from '../src/inhalt/erdkunde.js';
import * as R from '../src/inhalt/rechnen.js';
import * as AB from '../src/inhalt/abzeichen.js';
import { BILDURTEILE as URTEILE } from './bildurteile.mjs';
import * as SCHR from '../src/inhalt/schreiben.js';
import * as S from '../src/inhalt/saetze.js';
import { STAEDTE } from '../src/geo/staedte.js';
import { KONTINENTE_FEIN } from '../src/geo/kontinente.fein.js';
import { DEUTSCHLAND_FEIN } from '../src/geo/deutschland.fein.js';
import { LAENDER_AFRIKA_FEIN } from '../src/geo/laender-afrika.fein.js';
import { LAENDER_ASIEN_FEIN } from '../src/geo/laender-asien.fein.js';
import { LAENDER_EUROPA_FEIN } from '../src/geo/laender-europa.fein.js';
// Die GROBE Stufe, weil die Ebene „Hauptstädte in Europa" sie zeichnet -
// und weil nur dort die Stadtlagen gebacken sind (Regel 5: die Zahl und
// ihre Messstelle gehoeren zusammen).
import { LAENDER_EUROPA_GROB } from '../src/geo/laender-europa.grob.js';
import { LAENDER_SUEDOSTEUROPA_GROB } from '../src/geo/laender-suedosteuropa.grob.js';
/* Und die uebrigen groben Stufen. `bauen.mjs` backt genau diese ein - die
 * feinen sind der Vorrat, nicht die Ware. Ein Anker, der in der feinen
 * Stufe im Gebiet liegt, kann in der groben davor liegen: vereinfachen
 * heisst Ecken abschneiden. (Regel 5.) */
import { KONTINENTE_GROB } from '../src/geo/kontinente.grob.js';
import { LAENDER_AFRIKA_GROB } from '../src/geo/laender-afrika.grob.js';
import { LAENDER_ASIEN_GROB } from '../src/geo/laender-asien.grob.js';
import { LAENDER_NORDAMERIKA_GROB } from '../src/geo/laender-nordamerika.grob.js';
import { KARTEN_GROB } from '../src/geo/karten.grob.js';
/* Der ANZEIGENAME je Karte - aus dem Bericht des Backwerkzeugs und nicht
   abgeschrieben. `spiel.js` haelt dieselbe Zuordnung als `KONT_TITEL`;
   die hier ist fuer die Berichtszeilen dieses Tors, und beide kommen aus
   derselben Schleife, die die Karten schreibt. */
const KARTEN_NAME = Object.fromEntries(
  JSON.parse(fs.readFileSync(new URL('../src/geo/bericht-laender.json',
    import.meta.url), 'utf8')).kontinente.map(k => [k.id, k.name]));
import { LAENDER_SUEDAMERIKA_GROB } from '../src/geo/laender-suedamerika.grob.js';
import { DEUTSCHLAND_MITTEL } from '../src/geo/deutschland.mittel.js';
import { polDerUnzugaenglichkeit } from '../tools/geo-backen.mjs';
import { ALLE as KETTE, OHNE_BROWSER, MIT_BROWSER, BETRIFFT, betroffeneTore } from './kette-liste.mjs';
import * as EN from '../src/inhalt/englisch.js';
import * as TI from '../src/inhalt/tiere.js';
import * as FL from '../src/inhalt/flaggen.js';
import * as BP from '../tools/bildprompt.mjs';
import { LAENDER_NORDAMERIKA_FEIN } from '../src/geo/laender-nordamerika.fein.js';
import { LAENDER_SUEDAMERIKA_FEIN } from '../src/geo/laender-suedamerika.fein.js';

/** Alles, was gebacken wird - damit eine Pruefung nicht die Haelfte auslaesst. */
/* WIEVIEL VORRAT BRAUCHT EINE EBENE? (Inhalt-Audit I1)
 *
 * Eine Sitzung der Eltern ist zwoelf Aufgaben lang - das steht in der
 * Profiltabelle in `spiel.js` und ist hier die Einheit, in der gerechnet
 * wird. Eine Ebene mit zwoelf Gegenstaenden ist damit EINE Runde: die
 * zweite Sitzung zeigt dieselben zwoelf, nur gemischt.
 *
 * Absolute Zahlen haben genau das verdeckt („mindestens 25 Fallen"). Ab
 * hier steht die Grenze in Runden - wer die Sitzungslaenge aendert,
 * aendert die Grenze mit (Regel 2: Grenzen anteilig, nie absolut). */
const SITZUNG_ELTERN = 12;
const RUNDEN_VORRAT = 4;

const GEBACKEN = {
  kontinente:   KONTINENTE_FEIN,
  deutschland:  DEUTSCHLAND_FEIN,
  // Antarktika ist raus - nachgefragt und entschieden. Die drei gebackenen
  // Dateien wurden geloescht, dieser Zeiger blieb stehen, und damit STARB
  // das ganze Tor: ein fehlender Import ist kein roter Befund, sondern ein
  // Absturz vor der ersten Pruefung. Sieben Pruefungen - inhalt,
  // topologie, beruehrung, marken, schrift, symbol, doku - haben seitdem
  // nichts mehr gesagt, und keine einzige Gegenprobe hat es gemerkt: ein
  // abgestuerztes Tor erfuellt jede Probe, die „muss rot werden" verlangt.
  // Deshalb prueft `proben` jetzt VOR jeder Probe den gesunden Stand.
  afrika:       LAENDER_AFRIKA_FEIN,
  asien:        LAENDER_ASIEN_FEIN,
  europa:       LAENDER_EUROPA_FEIN,
  nordamerika:  LAENDER_NORDAMERIKA_FEIN,
  suedamerika:  LAENDER_SUEDAMERIKA_FEIN,
};
import { vorzeichenFlaeche, ringFlaeche, imPolygon,
         pfadZuRingen, ringeZuPolygonen } from '../tools/geo-backen.mjs';

// Die Ringe eines Pfades - flach, ohne Zuordnung von Loechern. Fuer den
// Umlaufsinn und die Nadeln ist genau das richtig; wo es um „liegt ein
// Punkt IM Gebiet" geht, muessen die Loecher dazu (siehe unten).
const pfadZuPolys = pfadZuRingen;

const fehler = [], hinweise = [];
const pruefe = (b, satz) => { if (!b) fehler.push(satz); };

/* ====================================================== Tor `inhalt` ==== */
console.log('\n  Tor `inhalt`');

const ids = new Set();
const eindeutig = (id, wo) => {
  if (ids.has(id)) fehler.push(`doppelte ID ${id} (${wo})`); ids.add(id);
};
I.KONTINENTE.forEach(k => {
  eindeutig(k.id, 'Kontinent');
  pruefe(k.name, `Kontinent ${k.id} ohne Namen`);
  pruefe(k.aussprache && k.aussprache.length >= 2,
    `Kontinent ${k.id}: mindestens zwei Aussprachevarianten nötig`);
  pruefe([1,2,3].includes(k.runde), `Kontinent ${k.id}: Runde fehlt oder ungültig`);
});
/* Wie tief geht das tiefste Profil? Gelesen, nicht hingeschrieben.
 *
 * `laenderTiefe` steht in `prototyp/spiel.js` an den Profilen. Dieses Tor
 * liest sie von dort - eine zweite Zahl hier waere genau die Doppelung,
 * die es sonst anprangert. */
const TIEFSTE = Math.max(...[...fs.readFileSync('prototyp/spiel.js', 'utf8')
  .matchAll(/laenderTiefe:\s*(\d+)/g)].map(m => +m[1]));

const laender = Object.entries(I.LAENDER).flatMap(([k,l])=>l.map(x=>({...x, kontinent:k})));
laender.forEach(l => {
  eindeutig(l.a3, 'Land');
  pruefe(l.name, `Land ${l.a3} ohne Namen`);
  pruefe(l.rang >= 1, `Land ${l.a3}: Rang ${l.rang} ist kein Rang`);
  pruefe(l.aussprache && l.aussprache.length >= 2, `Land ${l.a3}: zu wenige Aussprachevarianten`);
  // Entweder ein Kontinent - oder ein erklaerter Ausschnitt daraus (A6).
  pruefe(I.KONTINENTE.some(k=>k.id===l.kontinent)
    || I.KONTINENTE.some(k=>k.id===I.AUSSCHNITTE[l.kontinent]),
    `Land ${l.a3}: Elternknoten ${l.kontinent} fehlt`);
});
/* Die Raenge sind LUECKENLOS 1 bis n - je Kontinent.
 *
 * Eine Luecke ist kein Schoenheitsfehler: `laenderTiefe` filtert
 * `rang <= n`, ein fehlender Rang 7 heisst also stillschweigend ein Land
 * weniger fuer alle, die tiefer spielen.
 *
 * Bis D2c stand hier `1 bis TIEFSTE` - also: JEDER Kontinent muss genau
 * so viele Laender haben, wie das tiefste Profil spielt. Das war eine
 * absolute Erwartung an eine anteilige Sache (Regel 2) und ist mit den
 * fuenf Nachbarn umgefallen: Europa hat siebzehn, die anderen vier haben
 * zwoelf, und das ist kein Fehler, sondern eine Entscheidung. Geprueft
 * wird deshalb, was wirklich schiefgehen kann - die Luecke - und dazu,
 * dass die tiefste Tiefe ueberhaupt irgendwo eingeloest wird. */
const proKontinent = Object.entries(I.LAENDER).map(([k, l]) => {
  const raenge = l.map(x => x.rang).sort((a, b) => a - b);
  const soll = Array.from({ length: l.length }, (_, i) => i + 1);
  pruefe(raenge.join(',') === soll.join(','),
    `${k}: Ränge sind ${raenge.join(',')}, erwartet lückenlos ${soll.join(',')}`);
  return { k, n: l.length };
});
const tiefsteListe = Math.max(...proKontinent.map(x => x.n));
pruefe(TIEFSTE <= tiefsteListe, `ein Profil spielt bis Rang ${TIEFSTE}, aber der `
  + `längste Kontinent hat nur ${tiefsteListe} Länder — die Tiefe verspricht mehr, `
  + 'als es irgendwo gibt');
console.log(`    Länder je Kontinent: ${proKontinent.map(x => `${x.k} ${x.n}`).join(' · ')} `
  + `— tiefstes Profil bis Rang ${TIEFSTE}`);
/* Befund G10: passt der Name ins Gebiet, oder braucht er eine Fahne?
 *
 * Die Entscheidung wird gerechnet (`platzPx >= textPx`, Karte 470 px
 * breit) - und dass sie WIRKLICH gerechnet und nicht fest eingestellt
 * ist, sieht man nur daran, dass beide Antworten vorkommen. Die Forderung
 * stand bis heute im Rauchtest, wo sie keine Messstelle hatte: dort haengt
 * die Kartenbreite an der Fenstergroesse, und auf dem Zielgeraet (170 px)
 * passt kein einziger Name hinein. Hier hat sie eine (Regel 5). */
{
  const arten = new Set(STAEDTE.map(x => x.beschriftung));
  pruefe(arten.has('innen') && arten.has('fahne'),
    `Beschriftung: nur die Sorte „${[...arten].join(', ')}" — bei 470 px Kartenbreite `
    + 'muss beides vorkommen, sonst ist die Entscheidung keine Messung');
  const innen = STAEDTE.filter(x => x.beschriftung === 'innen').length;
  console.log(`    Beschriftung (G10, Karte 470 px): ${innen} innen, `
    + `${STAEDTE.length - innen} als Fahne daneben`);
}
STAEDTE.forEach(s => {
  eindeutig(s.id, 'Bundesland');
  pruefe(s.hauptstadt, `${s.id} ohne Hauptstadt`);
  pruefe(s.ort, `${s.id}: keine Stadtlage`);
  pruefe(s.anker, `${s.id}: kein Anker`);
  if (!s.stadtstaat)
    pruefe((I.HAUPTSTADT_ABLENKER[s.id]||[]).length >= 1,
      `${s.id}: kein Ablenker gepflegt — Ebene 4 wäre dort trivial`);
});
I.ECHTE_FALLEN.forEach(id => {
  const a = I.HAUPTSTADT_ABLENKER[id] || [];
  pruefe(a.length >= 1, `${id} ist als echte Falle geführt, hat aber keinen Ablenker`);
});

/* Die Hauptstadtebenen der LAENDER (R6, seit I14 zwei).
 *
 * Geprueft wird das, was diese Ebene kaputt machen kann, ohne dass es
 * auffaellt:
 *
 *   1. Ein Land ohne Hauptstadt oder ohne Stadtlage - die Aufgabe haette
 *      dann keine Antwort oder keinen Punkt.
 *   2. Eine Stadtlage NEBEN ihrem Land. Das ist der teure Fall: der Punkt
 *      erscheint erst nach der richtigen Antwort, faellt also im
 *      Rauchtest nicht auf, und ein Kind lernte die falsche Lage. Er
 *      entsteht schon durch eine andere Projektion oder eine andere
 *      Stufe - beides sieht man dem Zahlenpaar nicht an.
 *   3. Ein Ablenker, der die Hauptstadt selbst ist: dann waeren zwei von
 *      vier Antworten richtig.
 *   4. Der Regierungssitz nicht an erster Stelle. Er ist die eine echte
 *      Falle dieser Ebene, und er steht in den Daten (`Admin-0 capital
 *      alt`) - hier wird die Liste von Hand gegen die Referenz gelegt.
 */
{
  /* Gezaehlt wird ueber `erdkunde.js`, NICHT ueber das Gebackene.
   *
   * Vorher stand hier `LAENDER_EUROPA_GROB.filter(l => l.rang)` - der
   * fuenfte Leser des gebackenen Rangs (D2c hat drei gefunden, P11 den
   * vierten in `bauen.mjs`). Er hat die Luecke, die er finden sollte,
   * selbst verdeckt: als Europa auf siebzehn Laender wuchs, waren fuenf
   * davon ohne `rang` gebacken, also nicht in dieser Liste - und das Tor
   * pruefte zwoelf von siebzehn und meldete gruen. Prag, Wien, Bern,
   * Kopenhagen und Luxemburg fehlten eine ganze Runde lang auf der Ebene
   * „Hauptstaedte in Europa", ohne dass irgendetwas rot wurde.
   *
   * Wer den Vorrat nach dem Vorrat fragt, bekommt immer ja. */
  /* ZWEI Karten seit I14, EIN Pruefblock.
   *
   * „Hauptstädte in Europa" und „Hauptstädte in Südosteuropa" stellen
   * dieselbe Frage und koennen auf dieselben Arten kaputtgehen. Ein
   * zweiter, abgeschriebener Block waere Regel 6 - und zwar besonders
   * leise, weil eine Kopie beim ersten Lauf gruen ist.
   *
   * Die RATSCHE steht je Karte, weil sie eine Aussage ueber DIESE Karte
   * ist: sinkt die Zahl, ist dort eine Hauptstadt aus dem Backen
   * gefallen. */
  /* ALLE Karten, und die Liste kommt aus dem Kartenverzeichnis (I16).
   *
   * Sie stand von Hand da: bei R6 mit einer Karte, bei I14 mit zwei. Bei
   * I16 haben alle acht eine Hauptstadtebene, und eine Karte, die hier
   * fehlt, ist eine, die ungeprueft ausgeliefert wird - dieselbe
   * Verfallsart wie der Schalter im Backwerkzeug, den I16 gestrichen hat.
   *
   * Die RATSCHEN stehen weiter von Hand da, und das ist der Punkt: eine
   * Zahl, die sich aus dem Gebackenen holt, kann nicht bemerken, dass das
   * Gebackene weniger geworden ist. */
  const RATSCHE = { europa:28, suedosteuropa:7, asien:30, afrika:30,
                    nordamerika:3, mittelamerika:9, suedamerika:12,
                    australien:3 };
  /* Wieviele Länder je Karte einen abweichenden Regierungssitz haben (I19).
   *
   * Keine Ratsche, sondern eine GENAUE Zahl - anders als bei den
   * Hauptstädten zählt hier auch das Wachsen. Seit I19 sagt der
   * Vorlaufsatz die Zahl und die Namen; kommt einer dazu, ohne dass
   * jemand hinsieht, stimmt der Satz wieder nicht, und das war der
   * ganze Fund: „Ein Land hier ist besonders" stand auf acht Karten und
   * war auf dreien falsch. Ein Fehler, den man nur sieht, wenn man ihn
   * ZÄHLT - im Bild steht ein plausibler Satz. */
  const SITZE = { europa:1, suedosteuropa:0, asien:2, afrika:2,
                  nordamerika:0, mittelamerika:0, suedamerika:2,
                  australien:0 };
  const KARTEN = Object.entries(KARTEN_GROB)
    .filter(([id]) => (I.LAENDER[id] || []).length)
    .map(([id, gebacken]) => ({ id, wie: KARTEN_NAME[id] || id, gebacken,
      ratsche: RATSCHE[id] }));
  {
    const ohneRatsche = KARTEN.filter(k => k.ratsche === undefined).map(k => k.id);
    pruefe(!ohneRatsche.length, `Karten ohne Hauptstadt-Ratsche: ${ohneRatsche.join(', ')} `
      + '— dann waechst die Zahl der Hauptstädte ungeprüft');
    const zuviel = Object.keys(RATSCHE).filter(id => !KARTEN.some(k => k.id === id));
    pruefe(!zuviel.length, `Ratschen für Karten, die es nicht gibt: ${zuviel.join(', ')}`);
  }
  /* DIE ANTWORT KOMMT AUS DEM INHALT (I16).
   *
   * Bis I15 kam sie aus Natural Earths `Admin-0 capital` - und die stimmt
   * ausserhalb Europas in sieben von 88 Faellen nicht (Rangun statt
   * Naypyidaw, Daressalam statt Dodoma, Kapstadt statt Pretoria …). Jetzt
   * steht sie in `HAUPTSTADT_LAND`, und die Geodaten geben nur die Lage.
   *
   * Hier wird beides gegeneinander gehalten: jedes gefragte Ziel hat
   * einen Eintrag oder einen benannten Grund, kein Eintrag steht ohne
   * Ziel da, und - die wichtigste Zeile - der GEBACKENE Name ist der aus
   * dem Inhalt. Ohne sie koennte das Backwerkzeug wieder auf die
   * Kartendaten zurueckfallen, ohne dass etwas rot wird. */
  {
    const ziele = new Map();
    for (const [id, liste] of Object.entries(I.LAENDER))
      for (const l of liste) if (l.rang) ziele.set(l.a3, { id, name: l.name });
    const ohne = [...ziele.keys()].filter(a3 =>
      !I.HAUPTSTADT_LAND[a3] && !I.HAUPTSTADT_OHNE_FRAGE[a3]);
    pruefe(!ohne.length, `Ziele ohne Hauptstadt und ohne Grund: ${ohne.join(', ')} — `
      + 'entweder in HAUPTSTADT_LAND oder mit Begründung in HAUPTSTADT_OHNE_FRAGE');
    const fremdeStadt = Object.keys(I.HAUPTSTADT_LAND).filter(a3 => !ziele.has(a3));
    pruefe(!fremdeStadt.length,
      `Hauptstädte für Länder, die nirgends gefragt werden: ${fremdeStadt.join(', ')}`);
    const beides = Object.keys(I.HAUPTSTADT_OHNE_FRAGE)
      .filter(a3 => I.HAUPTSTADT_LAND[a3]);
    pruefe(!beides.length, `${beides.join(', ')} steht in HAUPTSTADT_OHNE_FRAGE `
      + 'und hat trotzdem eine Hauptstadt — einer der beiden Einträge ist veraltet');
    for (const [a3, wert] of Object.entries(I.HAUPTSTADT_OHNE_FRAGE))
      pruefe(typeof wert === 'string' && wert.length > 20,
        `${a3} steht ohne Hauptstadtfrage da, aber ohne Grund`);
  }
  /* Wer ueberhaupt eine Hauptstadtfrage bekommt - ueber BEIDE Karten.
     Die Tafel `HAUPTSTADT_ABLENKER_LAND` ist nach Landeskuerzel indiziert
     und kennt keine Karten; die Pruefung „Ablenker fuer ein Land, das es
     auf keiner Ebene gibt" muss deshalb ueber alle fragen. */
  const alleMeta = new Map(KARTEN.flatMap(k =>
    (I.LAENDER[k.id] || []).map(l => [l.a3, l])));
  for (const karte of KARTEN) {
  const gebackenEU = new Map(karte.gebacken.map(l => [l.a3, l]));
  const meta = new Map(I.LAENDER[karte.id].map(l => [l.a3, l]));
  let drin = 0;
  const HAUPTSTAEDTE_EU = karte.ratsche;
  let ohneHauptstadt = 0;
  for (const m of I.LAENDER[karte.id]) {
    const l = gebackenEU.get(m.a3);
    pruefe(l, `${m.a3} (${m.name}) wird gespielt und ist nicht gebacken — `
      + '`npm run backen` mit den Rohdaten trägt es nach');
    if (!l) continue;
    /* Der gebackene Name darf FEHLEN, aber nicht widersprechen (I3).
     *
     * `src/geo/` haelt jeden Umriss seines Kontinents; einen Namen bekommt
     * dort nur, was zur Zeit des Backens in `erdkunde.js` stand. Seit I3
     * stehen 55 Laender mehr dort, und ihre Umrisse tragen `name: null` -
     * das ist kein Widerspruch, sondern ein Umriss, der aelter ist als
     * sein Name. `bauen.mjs` sagt es selbst: „Was gespielt wird,
     * entscheidet `erdkunde.js` - hier und nirgends sonst."
     *
     * Was weiter geprueft wird, ist der echte Fall: zwei VERSCHIEDENE
     * Namen fuer dasselbe Land. */
    pruefe(!l.name || l.name === m.name, `${m.a3}: gebacken steht „${l.name}", `
      + `in erdkunde.js „${m.name}" — zwei Namen für dasselbe Land`);
    /* Die HAUPTSTADT ist keine Eigenschaft des Landes, sondern der Ebene.
     *
     * Sie kommt aus Natural Earth und wird beim Backen angehaengt; die
     * Laender aus I3 haben keine, weil das Backen Rohdaten braucht, die
     * nicht im Verzeichnis liegen. `vorrat('hauptstaedte:europa')` siebt
     * genau danach - wer keine hat, steht dort nicht.
     *
     * Hier stand `pruefe(l.hauptstadt, ...)` fuer JEDES europaeische Land,
     * und das war richtig, solange jedes europaeische Land auf der
     * Hauptstaedte-Ebene stand. Wer es so liesse, muesste 19 Laender
     * wieder streichen, damit ein Tor gruen wird - und das ist die
     * Reihenfolge, in der Daten falsch werden.
     *
     * Die Zeile, die den alten Fehler weiter faengt, steht unten: eine
     * RATSCHE auf der Zahl der Hauptstaedte. Prag, Wien, Bern, Kopenhagen
     * und Luxemburg sind damals aus der Ebene gefallen, ohne dass etwas
     * rot wurde - das kann nicht mehr passieren, denn die Zahl darf nicht
     * sinken. */
    /* Kein Eintrag heisst: keine Hauptstadtfrage - und das darf nur
       bedeuten, dass es dafuer einen benannten Grund gibt. */
    const soll = I.HAUPTSTADT_LAND[l.a3];
    if (!l.hauptstadt) {
      pruefe(!soll, `${l.a3}: „${soll && (soll.name || soll)}" steht im Inhalt, `
        + 'ist aber nicht gebacken — `npm run backen` trägt es nach');
      continue;
    }
    pruefe(!!soll, `${l.a3}: „${l.hauptstadt}" ist gebacken, steht aber in keinem `
      + 'Inhaltseintrag — dann kommt die Antwort wieder aus den Kartendaten');
    if (soll) {
      const sollName = typeof soll === 'string' ? soll : soll.name;
      pruefe(l.hauptstadt === sollName, `${l.a3}: gebacken steht „${l.hauptstadt}", `
        + `im Inhalt „${sollName}" — die Antwort kommt aus der falschen Quelle`);
      const sollSitz = typeof soll === 'string' ? null : (soll.sitz || null);
      pruefe((l.regierungssitz || null) === sollSitz,
        `${l.a3}: gebackener Regierungssitz „${l.regierungssitz || '—'}", `
        + `im Inhalt „${sollSitz || '—'}"`);
    }
    ohneHauptstadt++;
    pruefe(l.ort, `${l.a3}: keine Stadtlage gebacken`);
    if (l.ort) {
      const polys = pfadZuPolys(l.pfad);
      // `imPolygon` will ein Polygon (Aussenring plus Loecher), `pfadZuPolys`
      // liefert die Ringe flach. Jeder Ring wird deshalb einzeln gefragt.
      const trifft = polys.some(r => imPolygon(l.ort[0], l.ort[1], [r]));
      pruefe(trifft, `${l.hauptstadt} liegt nicht in ${meta.get(l.a3)?.name || l.a3} `
        + `(${l.ort.join(', ')}) — der Stadtpunkt erschiene neben dem Land`);
      if (trifft) drin++;
    }
    const ab = I.HAUPTSTADT_ABLENKER_LAND[l.a3] || [];
    /* Zwei Ablenker - oder ein Satz, warum es keine gibt.
     *
     * Die Ausnahme ist keine Abschwaechung, sondern die Bedingung dafuer,
     * dass die Regel ueberhaupt gilt: Luxemburg hat keine zweite Stadt,
     * die jemand kennt, und ein erfundener Ablenker waere schlechter als
     * keiner. Was zaehlt, ist dass die Luecke BENANNT ist - eine leere
     * Liste ohne Grund sieht genauso aus wie eine vergessene. */
    const ohne = I.HAUPTSTADT_OHNE_ABLENKER[l.a3];
    pruefe(ab.length >= 2 || !!ohne, `${l.a3}: weniger als zwei Ablenker — die Ebene hätte `
      + 'dort nicht vier Möglichkeiten. Wenn es wirklich keine gibt, gehört '
      + 'der Grund in HAUPTSTADT_OHNE_ABLENKER');
    if (ohne) pruefe(!ab.length,
      `${l.a3} steht in HAUPTSTADT_OHNE_ABLENKER und hat trotzdem welche — `
      + 'einer der beiden Einträge ist veraltet');
    pruefe(!ab.includes(l.hauptstadt),
      `${l.a3}: „${l.hauptstadt}" steht auch unter den Ablenkern — zwei richtige Antworten`);
    pruefe(new Set(ab).size === ab.length, `${l.a3}: ein Ablenker steht zweimal`);
    /* Wo die Regierung woanders sitzt, ist DIESE Stadt die Falle - sie
       steht deshalb vorn unter den Ablenkern. Seit I16 kommt der Sitz
       aus dem Inhalt und nicht aus einer Klassifizierung, die auch
       ehemalige Hauptstaedte und Sommerresidenzen umfasst. */
    if (l.regierungssitz)
      pruefe(ab[0] === l.regierungssitz,
        `${l.a3}: der Regierungssitz ist „${l.regierungssitz}", `
        + `unter den Ablenkern steht vorn aber „${ab[0]}" — die eigentliche Falle fiele aus`);
  }
  for (const l of I.LAENDER[karte.id])
    if (l.wovon) pruefe(/^vo[nm] /.test(l.wovon),
      `${l.a3}: \`wovon\` ist „${l.wovon}" — die Frage lautet „Wie heißt die Hauptstadt …?"`);
  const sitze = I.LAENDER[karte.id].filter(m => gebackenEU.get(m.a3)?.regierungssitz).length;
  pruefe(sitze === SITZE[karte.id],
    `auf der Karte ${karte.wie} haben ${sitze} Länder einen abweichenden `
    + `Regierungssitz, eingetragen sind ${SITZE[karte.id]} — der Vorlaufsatz `
    + 'nennt ihre Zahl und ihre Namen, er wäre damit falsch');
  /* Und jeder von ihnen braucht BEIDE Städte. Der Satz stellt sie
     einander gegenüber („die Regierung sitzt in X, Hauptstadt ist
     trotzdem Y"); fehlt eine, stünde dort ein Halbsatz. */
  for (const m of I.LAENDER[karte.id]) {
    const l = gebackenEU.get(m.a3);
    if (l && l.regierungssitz) pruefe(l.hauptstadt && l.hauptstadt !== l.regierungssitz,
      `${m.a3}: Regierungssitz „${l.regierungssitz}", Hauptstadt „${l.hauptstadt || '—'}" `
      + '— der Vorlaufsatz stellt beide einander gegenüber und bräuchte zwei');
  }
  pruefe(ohneHauptstadt >= HAUPTSTAEDTE_EU,
    `auf der Karte ${karte.wie} tragen nur noch ${ohneHauptstadt} Länder eine `
    + `gebackene Hauptstadt, es waren ${HAUPTSTAEDTE_EU} — eine ist aus dem Backen `
    + 'gefallen und damit still von der Ebene verschwunden');
  console.log(`    Hauptstädte in ${karte.wie}: ${ohneHauptstadt} von `
    + `${I.LAENDER[karte.id].length} `
    + `Ländern tragen eine (Ratsche ${HAUPTSTAEDTE_EU}), ${drin} Stadtlagen im `
    + `eigenen Land, ${sitze} abweichender Regierungssitz`);
  }
  /* Und zuletzt EINMAL fuer beide Karten: eine Zeile in der Tafel, die zu
     keinem gefragten Land gehoert. Sie stand vorher in der Schleife und
     haette mit zwei Karten jedes Land der einen als „fremd" auf der
     anderen gemeldet. */
  const fremd = Object.keys(I.HAUPTSTADT_ABLENKER_LAND)
    .filter(a3 => !alleMeta.has(a3));
  pruefe(!fremd.length,
    `Ablenker für Länder, die es auf keiner Hauptstadtebene gibt: ${fremd.join(', ')}`);
}
pruefe(new Date().getFullYear() - I.STAND.jahr <= 3,
  `Datenstand ${I.STAND.jahr} ist älter als drei Jahre`);

/* Der Ton je Profil.
 *
 * Die Regel steht in einem Satz: kindlich ruft, sachlich stellt fest -
 * und am Ausrufezeichen ist das mechanisch zu erkennen. Geprueft wird
 * deshalb genau das, nicht der Wortlaut: was in `TON.sachlich` steht,
 * darf nicht rufen, und was in `TON.kind` steht, muss es.
 *
 * Gelesen wird aus `prototyp/spiel.js`, weil die Texte dort stehen und
 * nirgends sonst - eine zweite Liste hier waere die naechste, die
 * veraltet (Regel 6). Das SOLL kommt trotzdem nicht von dort: welches
 * Profil welchen Ton bekommt, steht in der Zeile „Ton" im Backlog.
 */
{
  const quelle = fs.readFileSync('prototyp/spiel.js', 'utf8');
  const bloecke = {};
  for (const name of ['kind', 'sachlich']) {
    const m = quelle.match(new RegExp(`\\n  ${name}: \\{([\\s\\S]*?)\\n  \\},`));
    bloecke[name] = m ? m[1] : null;
    pruefe(m, `TON.${name} steht nicht in prototyp/spiel.js — der Ton je Profil fehlt`);
  }
  /* Geprueft wird das LOB und der Schlusssatz, nicht jede Zeichenkette im
   * Block. Der erste Anlauf nahm alles, was in Anfuehrungszeichen stand -
   * und meldete das Endungs-„e" aus einer Zeichenkettenschablone als
   * Lobspruch, der nicht ruft. */
  const rufer = (b) => {
    const lob = (b || '').match(/lob:\s*\[([\s\S]*?)\]/);
    const ende = (b || '').match(/ende:\s*'([^']+)'/);
    return [...(lob ? [...lob[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : []),
            ...(ende ? [ende[1]] : [])];
  };
  const ruft = (t) => /!/.test(t);
  pruefe(rufer(bloecke.kind).length >= 5,
    'TON.kind: weniger als fünf Sprüche gefunden — der Leser greift ins Leere');
  pruefe(rufer(bloecke.sachlich).length >= 3,
    'TON.sachlich: weniger als drei Sprüche gefunden — der Leser greift ins Leere');
  for (const t of rufer(bloecke.kind))
    pruefe(ruft(t), `TON.kind: „${t}" ruft nicht — der kindliche Ton lebt vom Ausrufezeichen`);
  for (const t of rufer(bloecke.sachlich))
    pruefe(!ruft(t), `TON.sachlich: „${t}" ruft — Erwachsene werden nicht angefeuert`);
  const gleich = rufer(bloecke.kind).filter(t => rufer(bloecke.sachlich).includes(t));
  pruefe(!gleich.length, `Beide Töne sagen dasselbe: ${gleich.join(', ')} — `
    + 'dann ist die Unterscheidung nur behauptet');

  /* Beide Toene muessen DIESELBEN Schluessel tragen.
   *
   * Der Endbildschirm liest `ton().siegsterne`, `ton().ende`,
   * `ton().ersterKleber`. Fehlt einer in einem der beiden Bloecke, ist er
   * `undefined` - und `undefined` ist falsch, nicht laut. Die Sterne
   * waeren dann fuer ALLE weg, und kein Tor haette etwas gesagt: ein
   * Tippfehler im Schluessel sieht aus wie eine Entscheidung. */
  const schluessel = (b) => [...(b || '').matchAll(/^\s{4}(\w+):/gm)].map(x => x[1]).sort();
  const kK = schluessel(bloecke.kind), kS = schluessel(bloecke.sachlich);
  const fehlt = [...kK.filter(x => !kS.includes(x)).map(x => `sachlich fehlt „${x}"`),
                 ...kS.filter(x => !kK.includes(x)).map(x => `kind fehlt „${x}"`)];
  pruefe(!fehlt.length, `Die beiden Töne tragen verschiedene Schlüssel: ${fehlt.join(', ')}`);
  pruefe(/siegsterne: true/.test(bloecke.kind || ''),
    'TON.kind trägt keine Siegsterne — der Endbildschirm wäre für die Kinder ohne');
  console.log(`    Ton: ${kK.length} Schlüssel je Ton, in beiden dieselben`);

  /* Und jedes Profil muss einen Ton haben, den es gibt.
   *
   * Die Kennungen kommen aus der KOPFZEILE der Tabelle, nicht aus einer
   * Liste hier: seit N1 sind es vier Spalten, und eine feste Dreierliste
   * haette die vierte stillschweigend uebersprungen. */
  const doc = fs.readFileSync('docs/Lernkiste-BACKLOG.md', 'utf8');
  const kopf = doc.match(/^\|\s*\|\s*Fiona[^|]*\|.+\|\s*$/m);
  pruefe(kopf, 'Die Kopfzeile der Profiltabelle fehlt im Backlog');
  const PROFIL_IDS = kopf ? kopf[0].split('|').slice(2, -1)
    .map(t => t.trim().split(/[\s(]/)[0].toLowerCase()).filter(Boolean) : [];
  const zeile = doc.match(/^\|\s*Ton\s*\|(.+)\|\s*$/m);
  pruefe(zeile, 'Die Zeile „Ton" fehlt im Backlog — dann steht das Soll nirgends');
  if (zeile) {
    const soll = zeile[1].split('|').map(t => t.replace(/\*/g, '').trim());
    const ids = PROFIL_IDS;
    ids.forEach((id, i) => {
      const kurz = { kindlich: 'kind', sachlich: 'sachlich' }[soll[i]] || soll[i];
      const hat = quelle.match(new RegExp(`id:'${id}'[\\s\\S]{0,400}?ton:'([a-z]+)'`));
      pruefe(hat && hat[1] === kurz,
        `${id}: Ton ist „${hat ? hat[1] : 'keiner'}", im Backlog steht „${soll[i]}"`);
    });
    console.log(`    Ton je Profil: ${ids.map((id, i) => `${id} ${soll[i]}`).join(' · ')}`);
  }
}

/* Findet jede Gegenprobe ihren Suchtext noch?
 *
 * Der teuerste Befund dieser Sitzung, und der billigste zu fangen: von
 * sieben stumm gewordenen Gegenproben trafen FUENF ihren Suchtext nicht
 * mehr. `vorlesen` war zu `sagen` geworden, `vorrat` zu `vorlaufVorrat`,
 * die Profilzeile hatte ein Feld dazubekommen. Der Eingriff kam nicht an,
 * das Tor blieb gruen, und die Probe bewies nichts.
 *
 * Aufgefallen ist das erst im vollen Probenlauf — zweiundvierzig Minuten,
 * einmal am Tag auf dem Runner. Dabei steht die Antwort in einer
 * Millisekunde da: der Text ist in der Datei, oder er ist es nicht.
 *
 * Deshalb hier, in der Kette, bei jeder Aenderung. Das ersetzt den vollen
 * Lauf nicht — ob ein Tor auch WIRKLICH anschlaegt und dabei das Richtige
 * meldet, sagt nur er. Aber die haeufigste Verfallsart faengt es sofort,
 * und zwar an dem Tag, an dem sie entsteht.
 */
{
  const { PROBEN } = await import('./proben-liste.mjs');
  pruefe(PROBEN.length > 50, `Nur ${PROBEN.length} Gegenproben gefunden — `
    + 'die Liste ist nicht die, die gemeint war');
  /* Die Probe, die GERADE laeuft, ist ausgenommen.
   *
   * `tor/proben.mjs` reicht ihren Namen herein, waehrend ihr Eingriff im
   * Baum steht - und dann ist ihr Suchtext mit Absicht weg. Ohne diese
   * Zeile faellt das Tor genau dort, wo die Probe etwas beweisen will,
   * bricht ab, und das gemeinte Tor laeuft nicht mehr: rot, aber nicht
   * deswegen. */
  const laeuftGerade = process.env.SMARTKIDS_PROBE || '';
  let geprueftD = 0, ausgenommen = 0;
  for (const p of PROBEN) {
    if (!p.datei) continue;
    if (p.n === laeuftGerade) { ausgenommen++; continue; }
    if (!fs.existsSync(p.datei)) {
      pruefe(false, `Gegenprobe „${p.n}": die Datei ${p.datei} gibt es nicht`);
      continue;
    }
    const inhalt = fs.readFileSync(p.datei, 'utf8');
    geprueftD++;
    // Bei `kopie` gibt es keinen Suchtext — dort wird eine ganze Datei
    // ueber eine andere gelegt. Geprueft ist dann, dass es beide gibt.
    if (p.kopie) { for (const k of p.kopie)
      pruefe(fs.existsSync(k), `Gegenprobe „${p.n}": die Datei ${k} gibt es nicht`); }
    else {
      /* Gezaehlt, nicht nur gesucht.
       *
       * „Steht der Text noch da" faengt den Text, der WEG ist. Es faengt
       * nicht den, der noch da ist und ab jetzt woanders steht: `replace`
       * nimmt die erste Fundstelle, und bei zwei Fundstellen entscheidet
       * ihre Reihenfolge, welche verstellt wird. Dreimal an einem Tag
       * passiert - `.rechenkleber{` traf zwei CSS-Zeilen, und die
       * Gegenprobe zur Suchtext-Pruefung traf zweimal SICH SELBST statt
       * ihres Ziels. Beide Male sah der Lauf einen angekommenen Eingriff.
       *
       * Wer es anders meint, sagt `mehrfach:true` und schreibt dazu,
       * warum - drei Proben tun das mit Grund. */
      const wieoft = p.such !== undefined
        ? inhalt.split(p.such).length - 1
        : (inhalt.match(new RegExp(p.suchRegex.source,
            p.suchRegex.flags.includes('g') ? p.suchRegex.flags
              : p.suchRegex.flags + 'g')) || []).length;
      if (wieoft === 0)
        pruefe(false, `Gegenprobe „${p.n}": ihr Suchtext steht nicht mehr in ${p.datei} — `
          + `der Eingriff käme nicht an, das Tor bliebe grün „${
            String(p.such ?? p.suchRegex).replace(/\s+/g, ' ').slice(0, 60)}…"`);
      else if (wieoft > 1 && !p.mehrfach)
        pruefe(false, `Gegenprobe „${p.n}": ihr Suchtext steht ${wieoft}× in ${p.datei} — `
          + 'welche Stelle verstellt wird, entscheidet ihre Reihenfolge. Entweder enger '
          + 'fassen oder `mehrfach:true` setzen und dazuschreiben, warum');

      /* Und dasselbe fuer den ANKER, der ein Verschwinden verlangt.
       *
       * `an:{ fehlt:'…' }` heisst „nach dem Eingriff darf dieser Text
       * nirgends mehr stehen". Steht er ZWEIMAL da und ersetzt der
       * Eingriff nur eine Stelle, kann das nie zutreffen - die Probe
       * meldet fuer immer „Eingriff nicht angekommen", obwohl er ankam.
       *
       * Genau so ist „eine falsche Antwort bleibt stumm" vier Runden lang
       * dagestanden: `klangZu('falsch');` gefolgt von `if (versuch >= 3)`
       * gibt es im Rechenweg UND im Schreibweg. Die Doppelung stand im
       * Suchtext nicht - der war eindeutig -, sondern nur im Anker.
       * Deshalb reichte die Pruefung darueber nicht. */
      if (p.an && p.an.fehlt && !p.mehrfach) {
        const wo = p.an.datei || p.datei;
        const quelle = (wo !== 'dist/index.html' && fs.existsSync(wo))
          ? fs.readFileSync(wo, 'utf8') : null;
        if (quelle) {
          const oft = quelle.split(p.an.fehlt).length - 1;
          if (oft > 1) pruefe(false, `Gegenprobe „${p.n}": ihr Anker verlangt, dass „${
            p.an.fehlt.replace(/\s+/g, ' ').slice(0, 40)}…" VERSCHWINDET — der Text steht aber `
            + `${oft}× in ${wo}, und der Eingriff entfernt nur eine Stelle. `
            + 'Das kann nie zutreffen');
        }
      }
    }
  }
  /* Eine Probe OHNE Eingriff waere hier unsichtbar: nichts zu pruefen,
     also immer gruen. `kopie` zaehlt mit — die Symbolprobe legt eine Datei
     ueber eine andere, statt Text zu ersetzen. */
  const ohne = PROBEN.filter(p => p.datei && p.such === undefined
    && p.suchRegex === undefined && !p.kopie);
  pruefe(!ohne.length, `${ohne.length} Gegenprobe${ohne.length === 1 ? '' : 'n'} nennt eine `
    + 'Datei, aber keinen Eingriff — sie kann nichts beweisen: '
    + ohne.slice(0, 3).map(p => `„${p.n}"`).join(', '));
  /* Und die Pruefung selbst muss etwas geprueft haben.
   *
   * Ohne das ist sie mit einem `continue` an der falschen Stelle
   * abzuschalten: die Schleife laeuft leer, es meldet niemand etwas, und
   * die Zeile unten schreibt eine Null, die wie eine Auskunft aussieht.
   * Gezaehlt wird gegen die Zahl der Proben, die eine Datei NENNEN - eine
   * feste Zahl waere die naechste, die veraltet. */
  const mitDatei = PROBEN.filter(p => p.datei).length;
  /* Die ausgenommene zaehlt MIT - sonst schlaegt diese Zusage bei jedem
     Probenlauf an, und zwar genau dann, wenn die Ausnahme richtig war. */
  pruefe(geprueftD + ausgenommen === mitDatei,
    `Nur ${geprueftD} von ${mitDatei} Gegenproben mit Datei wurden angesehen `
    + `(${ausgenommen} ausgenommen) — die Prüfung greift ins Leere und beweist nichts`);
  const mehrfach = PROBEN.filter(p => p.mehrfach).length;
  console.log(`    Gegenproben: ${geprueftD} von ${PROBEN.length} greifen genau einmal `
    + `in ihre Datei (${mehrfach} ausdrücklich mehrfach`
    + `${ausgenommen ? `, ${ausgenommen} läuft gerade` : ''})`);
}

/* --- Abzeichen: kann man sie ueberhaupt bekommen? (D2) -----------------
 *
 * Ein Abzeichen faellt still aus, und zwar auf drei Arten:
 *
 *   - seine Regel waehlt NICHTS aus dem Vorrat. Dann ist die Menge leer,
 *     das Abzeichen erscheint nie, und niemand vermisst es;
 *   - seine Regel waehlt ALLES. Dann steht es beim ersten Aufkleber schon
 *     da und sagt nichts;
 *   - sein Bild gibt es nicht. Dann steht der Satz ohne Zeichen da.
 *
 * Der dritte Fall ist in dieser Runde WIRKLICH passiert: die Tafel nannte
 * `deutschland`, die Bildtafel kennt `karte`. Gefunden hat es nicht das
 * Tor, sondern der Blick auf die Aufnahme (Regel 8) - jetzt findet es das
 * Tor, und zwar bevor jemand hinsieht.
 *
 * Geprueft wird gegen die WIRKLICHEN Vorraete, nicht gegen erfundene:
 * sonst prueft man seine eigene Annahme darueber, was in den Daten steht.
 */
{
  console.log('\n  Tor `abzeichen`');
  const BILDER = new Set([...fs.readFileSync('prototyp/spiel.js', 'utf8')
    .matchAll(/^  ([a-z]+): '<(?:circle|path|rect|ellipse)/gm)].map(m => m[1]));
  pruefe(BILDER.size >= 5, `nur ${BILDER.size} Abzeichenbilder in spiel.js gefunden — `
    + 'die Prüfung liest die Bildtafel nicht mehr und würde alles durchlassen');
  /* Die Vorraete, so wie das Spiel sie WIRKLICH baut.
   *
   * Regel 5, und sie hat in dieser Runde ein ganzes Abzeichen gekostet:
   * die erste Fassung mass gegen `LAENDER_EUROPA_FEIN` - die GEBACKENE
   * Geometrie mit einundfuenfzig Umrissen. Ins Spiel kommt aber nur, was
   * in `erdkunde.js` einen Rang hat (`roh.filter(l => l.rang)` im Bau):
   * fuer Europa zwoelf Laender. Gegen die Geometrie sah „alle Nachbarn
   * von Deutschland" erreichbar aus; im Spiel gibt es fuenf der neun gar
   * nicht. Ein Tor, das gegen die falsche Messstelle prueft, meldet
   * gruen und beweist nichts. */
  const VORRAT = {
    kontinente: I.KONTINENTE.map(k => ({ id:k.id })),
    bundeslaender: STAEDTE.map(b => ({ id:b.id, stadtstaat:b.stadtstaat })),
    /* Mitgereicht wird, woran die Mengen haengen: `nachbarDE` fuer die
       Nachbarn Deutschlands, `stadtstaat` fuer die Stadtstaaten. Der
       erste Anlauf schrieb hier nur `{ id: l.a3 }` - und das Tor meldete
       prompt, das Nachbarn-Abzeichen waehle nichts aus. Es hatte recht:
       an SEINEM Vorrat war die Fahne nicht da. */
    'laender:europa': I.LAENDER.europa.map(l => ({ id:l.a3, nachbarDE:l.nachbarDE })),
    // Die Landeshauptstaedte: dieselbe Menge wie `vorrat('hauptstaedte')` -
    // die drei Stadtstaaten haben keine eigene Frage.
    hauptstaedte: STAEDTE.filter(b => !b.stadtstaat).map(b => ({ id:b.id })),
    'rechnen:reihen': R.reihenVorrat(),
    'rechnen:plusminus': R.vorrat(),
    'schreiben:buchstaben': SCHR.vorrat(),
    /* Die Saetze zum Selbersagen (E9b). `vorratChunks()` ist genau das,
       was `vorrat('englisch:satz')` im Spiel zurueckgibt - und es traegt
       `gebiet`, woran die vier Abzeichen haengen. */
    'englisch:satz': EN.vorratChunks(),
  };
  /* Die Gebietsnamen stehen in `abzeichen.js` ein zweites Mal, weil das
     Modul einfuhrfrei bleiben soll. Was zweimal dasteht, veraltet einmal
     (Regel 6) - hier steht die Bewachung, die es nicht tun laesst:
     wer in der amtlichen Tafel ein Gebiet hinzufuegt oder umnummeriert,
     bekommt es gesagt, statt ein Abzeichen ohne Namen zu erben. */
  {
    const amtlich = EN.THEMENGEBIETE.map(g => g.nr).sort().join(',');
    const beiUns = (AB.TAFEL.find(e => e.ebene === 'englisch:satz')?.je || [])
      .slice().sort().join(',');
    pruefe(amtlich === beiUns, `die Satz-Abzeichen decken „${beiUns}" ab, `
      + `die amtlichen Themengebiete sind „${amtlich}"`);
  }
  let geprueft = 0;
  for (const e of AB.TAFEL) {
    const v = VORRAT[e.ebene];
    if (!v) { fehler.push(`Abzeichen „${e.id}" hängt an der Ebene „${e.ebene}", `
      + 'die es nicht gibt — es kann nie erscheinen'); continue; }
    for (const wert of (e.je || [null])) {
      const teile = e.waehlt(v, wert, { name: 'Fiona' });
      const kennung = typeof e.id === 'function' ? e.id(wert) : e.id;
      if (!teile.length) fehler.push(`Abzeichen „${kennung}" wählt nichts aus `
        + `${v.length} Stücken der Ebene „${e.ebene}" — es ist unerreichbar`);
      else if (teile.length === v.length && !/^alle|^alphabet/.test(kennung))
        fehler.push(`Abzeichen „${kennung}" wählt ALLE ${v.length} Stücke — `
          + 'dann ist es kein Ausschnitt und sagt nichts Eigenes');
      if (!BILDER.has(e.zeichen)) fehler.push(`Abzeichen „${kennung}" will das Bild `
        + `„${e.zeichen}", und das gibt es in der Bildtafel nicht — der Satz stünde ohne Zeichen da`);
      geprueft++;
    }
  }
  console.log(`    ${geprueft} Abzeichen geprüft: Menge nicht leer, nicht alles, Bild vorhanden`);
  console.log(`    gemessen am gelieferten Vorrat: ${VORRAT['laender:europa'].length} `
    + `Länder in Europa, nicht ${LAENDER_EUROPA_FEIN.length} gebackene Umrisse`);
}

/* Sterne heissen EINE Sache: wie die Sitzung lief (S1).
 *
 * Dieselbe Form stand an zwei Orten und meinte zweierlei - im Kopf und auf
 * dem Endbildschirm die Sitzung, auf der Ebenenkachel den
 * Lebensfortschritt. Ein Kind spielte fehlerfrei, sah drei Sterne, tippte
 * auf „Weiter" und sah auf der Kachel einen.
 *
 * Geprueft wird an der ZAHL, die hineingeht, nicht an der Stelle, an der
 * gezeichnet wird: `sterneFuer` bekommt ueberall `st.glatt`. Wer die
 * Sterne kuenftig woanders hinsetzen will, darf das - solange sie
 * dieselbe Zahl meinen.
 */
{
  const quelle = fs.readFileSync('prototyp/spiel.js', 'utf8');
  // Die DEFINITION zaehlt nicht als Aufruf - `function sterneFuer(glatt,
  // gesamt)` hat den Ausdruck beim ersten Anlauf prompt rot gemacht.
  const rufe = [...quelle.matchAll(/(?<!function )sterneFuer\(([^)]*)\)/g)]
    .map(m => m[1].trim());
  pruefe(rufe.length >= 3, `nur ${rufe.length} Sternstellen gefunden — `
    + 'der Ausdruck greift ins Leere, die Prüfung beweist nichts');
  const fremd = rufe.filter(r => !/^st\.glatt\b/.test(r));
  pruefe(!fremd.length, `Sterne aus einer anderen Zahl als der Sitzung: `
    + `${fremd.map(r => `sterneFuer(${r})`).join(', ')} — dieselbe Form für zwei `
    + 'Bedeutungen, und ein Kind liest sie als dieselbe Aussage');
  console.log(`    Sterne: ${rufe.length} Stellen, alle aus \`st.glatt\``);
}

/* Jede Pause, die einen Bildschirm weiterschaltet, geht durch `schauPause`.
 *
 * Der Anlass ist gemessen, nicht ausgedacht: der Kartenweg hatte seine
 * beiden Pausen als nackte `1600` und `2400` im Rumpf stehen. `?flott`
 * kuerzte die eine Pause des Rechenwegs und keine der beiden hier -
 * `quer-ende-eltern` brauchte mit und ohne Schalter dieselben 15,2 s, und
 * der Rauchtest wartete auf jeder Kartenaufgabe 1,6 s, die er nicht prueft.
 * Aufgefallen ist es erst, als jemand die Zeit MASS.
 *
 * Ein Schalter, der die Haelfte seiner Zusage haelt, sieht von aussen aus
 * wie einer, der sie ganz haelt. Deshalb wird hier nicht die Zahl geprueft,
 * sondern die TUER: wer einen Bildschirm nach einer Wartezeit wechselt,
 * nimmt sie.
 */
{
  const quelle = fs.readFileSync('prototyp/spiel.js', 'utf8');
  /* Jedes `setTimeout(` samt SEINEN GANZEN Argumenten - also bis zur
   * zugehoerigen Klammer, nicht bis zur ersten. Der erste Anlauf nahm
   * `[\s\S]*?\);` und hoerte mitten im Rueckruf auf: die Verzoegerung, um
   * die es geht, stand gar nicht mehr im Treffer, und die Pruefung meldete
   * zwei Fehler ueber eine Stelle, die in Ordnung war. */
  const rufe = [];
  for (let i = quelle.indexOf('setTimeout('); i >= 0;
           i = quelle.indexOf('setTimeout(', i + 1)) {
    let tiefe = 0, j = i + 'setTimeout'.length;
    for (; j < quelle.length; j++) {
      if (quelle[j] === '(') tiefe++;
      else if (quelle[j] === ')' && --tiefe === 0) break;
    }
    rufe.push(quelle.slice(i + 'setTimeout('.length, j));
  }
  // Die, die einen Bildschirm wechseln: `zeige(` im Rueckruf oder der
  // Fortschaltruf `weiter` als Rueckruf selbst.
  const treffer = rufe.filter(t => /\bzeige\(|^\s*weiter\s*,/.test(t));
  pruefe(treffer.length >= 3, `Nur ${treffer.length} Bildschirmwechsel nach einer Pause `
    + 'gefunden — der Ausdruck greift ins Leere, die Prüfung beweist nichts');
  const nackt = treffer.filter(t => !/schauPause\(|LOBPAUSE/.test(t));
  for (const t of nackt)
    pruefe(false, 'Ein Bildschirmwechsel wartet an `schauPause` vorbei: '
      + `„${t.replace(/\s+/g, ' ').slice(0, 90)}…" — `
      + '`?flott` kürzt ihn dann nicht, und kein Tor sagt etwas');
  pruefe(/const schauPause = \(ms\) => FLOTT/.test(quelle),
    '`schauPause` steht nicht mehr in spiel.js — dann hängt keine Pause mehr am Schalter');
  console.log(`    Schaupausen: ${treffer.length} Bildschirmwechsel, alle über \`schauPause\``);
}

// Die Gebietszahl wird GEZAEHLT, nicht geschrieben.
/* Die Bundeslaender werden an der BUNDESLAENDER-Liste gezaehlt.
 *
 * Hier stand `STAEDTE.length` — fuer beides. Das Ergebnis war zufaellig
 * richtig, weil es sechzehn Bundeslaender und sechzehn Staedte gibt; ein
 * Zaehler, dessen Richtigkeit auf einem Zufall beruht, zaehlt aber nicht,
 * er trifft. Wer eine Stadt ergaenzt, ohne ein Bundesland zu ergaenzen,
 * haette ab dann eine falsche Gesamtzahl — und genau diese Zahl ist es,
 * die `doku` gegen das Konzept legt. */
const ZAHL = { kontinente:I.KONTINENTE.length, laender:laender.length,
               bundeslaender:DEUTSCHLAND_FEIN.length, staedte:STAEDTE.length };
ZAHL.gesamt = ZAHL.kontinente + ZAHL.laender + ZAHL.bundeslaender + ZAHL.staedte;
console.log(`    ${ZAHL.kontinente} Kontinente + ${ZAHL.laender} Länder + `
  + `${ZAHL.bundeslaender} Bundesländer + ${ZAHL.staedte} Städte = ${ZAHL.gesamt} Gebiete`);

/* ==================================================== Tor `topologie` === */
/* ====================================================== Tor `saetze` ==== *
 *
 * Ein Satz zum Mitnehmen je Gebiet (D3). Das SOLL steht in
 * `src/inhalt/saetze.js` und ist dort aus drei Vorbildern abgeleitet;
 * hier wird gemessen, ob es eingehalten ist.
 *
 * Warum das ein Tor braucht und kein Blick genuegt: 91 Gebiete. Ein Satz,
 * der fehlt, faellt beim Spielen genau einmal auf - naemlich dann, wenn
 * ein Kind gerade dieses Gebiet trifft, und dann fehlt er still. `lobsatz`
 * laesst die Zeile einfach weg; auf dem Bildschirm ist nichts zu sehen,
 * was ein Fehler waere.
 */
/* ==================================================== Wer grenzt an wen ===
 *
 * Die Tafel `prototyp/nachbarn.json` gibt es seit dem ersten Bau - sie
 * hat bis I21 nur die VIERFAERBUNG bedient. Dort ist ein Fehler
 * unsichtbar: wer eine Nachbarschaft vergisst, bekommt vielleicht zwei
 * gleichfarbige Nachbarn, und das faellt niemandem auf. Seit sie eine
 * AUFGABE beantwortet, ist derselbe Fehler eine falsche Antwort - und
 * eine, die das Kind nicht widerlegen kann.
 *
 * Drei Zeilen, und jede prueft etwas anderes:
 *   - jedes Gebiet hat mindestens einen Nachbarn (sonst waere die Frage
 *     nach seinen Nachbarn unbeantwortbar),
 *   - keine Kennung zeigt ins Leere,
 *   - und die Nachbarschaft gilt in BEIDE Richtungen. Das ist die
 *     eigentliche Zeile: eine halbe Eintragung ist auf der Karte nicht
 *     zu sehen und in der Aufgabe ein Fehler, der nur in einer der
 *     beiden Fragen auftaucht.
 */
console.log('\n  Tor `nachbarn`');
{
  const roh = JSON.parse(fs.readFileSync(
    new URL('../prototyp/nachbarn.json', import.meta.url), 'utf8'));
  const ids = new Set(DEUTSCHLAND_FEIN.map(g => g.id));
  const namen = new Map(DEUTSCHLAND_FEIN.map(g => [g.id, g.name]));
  const ohne = [...ids].filter(id => !(roh[id] || []).length);
  pruefe(!ohne.length, `ohne Nachbarn: ${ohne.join(', ')} — die Ebene „Wer grenzt `
    + 'an wen?" könnte für sie keine Frage stellen');
  const fremd = Object.keys(roh).filter(id => !ids.has(id));
  pruefe(!fremd.length, `Nachbarschaften für Gebiete, die es nicht gibt: ${fremd.join(', ')}`);
  const zeigtInsLeere = Object.entries(roh)
    .flatMap(([a, ns]) => ns.filter(b => !ids.has(b)).map(b => `${a}→${b}`));
  pruefe(!zeigtInsLeere.length, `Nachbar ohne Gebiet: ${zeigtInsLeere.join(', ')}`);
  const einseitig = Object.entries(roh)
    .flatMap(([a, ns]) => ns.filter(b => !(roh[b] || []).includes(a))
      .map(b => `${namen.get(a) || a} nennt ${namen.get(b) || b}, umgekehrt nicht`));
  pruefe(!einseitig.length, `einseitige Nachbarschaft: ${einseitig.join(' · ')}`);
  /* Und eine Ratsche auf der Zahl: 16 Gebiete, und die Summe der
     Nachbarschaften ist gerade (jede zaehlt zweimal). Sinkt sie, ist
     eine Grenze verschwunden, ohne dass eine der Zeilen darueber
     zuckt - genau die Verfallsart, die dieses Verzeichnis kennt. */
  const summe = Object.values(roh).reduce((n, ns) => n + ns.length, 0);
  pruefe(summe >= 48 && summe % 2 === 0,
    `${summe} Nachbarschaften eingetragen (erwartet mindestens 48, und immer gerade)`);
  console.log(`    ${ids.size} Gebiete, ${summe / 2} Grenzen, jede in beide Richtungen `
    + `eingetragen · die meisten Nachbarn: ${[...ids]
      .sort((a, b) => (roh[b] || []).length - (roh[a] || []).length)
      .slice(0, 2).map(id => `${namen.get(id)} (${roh[id].length})`).join(', ')}`);
}

/* ================================================== Was ist groesser? =====
 *
 * Die Ebene macht eine Zusage, die man ihr nicht ansieht: was sie fragt,
 * ist WAHR (die wirkliche Flaeche) und zugleich am Bild NACHZUPRUEFEN
 * (die gemalte). Beides faellt auseinander, und zwar messbar - Russland
 * ist auf der Europakarte ein Fuenftel seiner selbst. Ein Paar, bei dem
 * das Bild anders herum aussieht als die Welt, waere keine Aufgabe,
 * sondern eine Falle.
 *
 * Geprueft wird gegen das GEBAUTE Buendel und nicht gegen den Prototyp
 * (Regel 7) - und mit derselben
 * Funktion, die die Paare erzeugt (`groesserPaare`) - eine zweite
 * Fassung hier waere die, die gruen bleibt, waehrend die App etwas
 * anderes rechnet.
 *
 * Was hier NICHT steht und anderswo geprueft wird: dass jede dieser
 * Ebenen in einen Lebensraum fuehrt (Tor `tiere`) und dass man sie
 * spielen kann (Rauchtest).
 */
console.log('\n  Tor `groesser`');
{
  const FL = JSON.parse(fs.readFileSync(
    new URL('../prototyp/flaechen.json', import.meta.url), 'utf8')).km2;
  /* DAS SOLL STEHT IM TOR, nicht im Prüfling (Regel 14: das Modell darf
   * nicht vom Gemessenen abhängen).
   *
   * Der erste Anlauf las die Grenze aus `erdkunde.js` und verglich sie
   * mit sich selbst: die Gegenprobe setzte `GROESSER_TREUE = 0`, und das
   * Tor prüfte daraufhin brav, ob jedes Land zu mindestens 0 % gezeigt
   * wird — grün, mit Russland und seinen 23 % mitten drin. Gemeldet hat
   * es die Probe („TOR BLEIBT GRÜN"), und genau dafür ist sie da.
   *
   * Die Zahl steht damit an ZWEI Stellen, und das ist hier keine
   * Doppelung, die veraltet: die erste Zeile darunter vergleicht sie,
   * und wer eine ändert, wird von ihr geschickt. */
  const TREUE_SOLL = 0.86;
  pruefe(I.GROESSER_TREUE === TREUE_SOLL,
    `\`GROESSER_TREUE\` steht auf ${I.GROESSER_TREUE}, das Tor rechnet mit `
    + `${TREUE_SOLL} — wer die Grenze verschiebt, verschiebt beide`);
  const paare = paareAusBuendel();
  pruefe(!!paare, 'die Paartafel steht nicht im gebauten Bündel');
  if (paare) {
    let ges = 0, engstesVerh = Infinity, engstes = '', knappTraegt = Infinity,
        knappTraegtWer = '', knappDraussen = 0, knappDraussenWer = '', karten = 0;
    const draussen = [];
    for (const [karte, liste] of Object.entries(paare)) {
      const datei = new URL(`../dist/daten/laender-${karte}.json`, import.meta.url);
      if (!fs.existsSync(datei)) { pruefe(false, `keine Karte „${karte}"`); continue; }
      const laender = JSON.parse(fs.readFileSync(datei, 'utf8')).laender
        .filter(l => l.rang && FL[l.a3]);
      const roh = laender.map(l => ({ a3: l.a3, km2: FL[l.a3], px: I.pfadFlaeche(l.pfad) }));
      const namen = new Map(laender.map(l => [l.a3, l.name]));
      /* REGEL 10 auf der Ebene des Tors: erst nachrechnen, ob die
         Tafel ueberhaupt aus dieser Rechnung stammt. Steht hier eine
         von Hand gepflegte Liste, beweisen alle Zeilen darunter nichts. */
      const soll = I.groesserPaare(roh);
      pruefe(JSON.stringify(soll) === JSON.stringify(liste),
        `„${karte}": die Paare im Bündel sind nicht die, die `
        + `\`groesserPaare\` aus denselben Daten rechnet (${liste.length} gegen ${soll.length})`);
      /* Und die Treue, an der die Auswahl haengt - mit BEIDEN Raendern,
         damit ein Neubacken der Karten sie nicht still verschiebt. */
      for (const t of I.groesserTreue(roh)) {
        if (t.treue >= TREUE_SOLL) {
          if (t.treue < knappTraegt) { knappTraegt = t.treue; knappTraegtWer = namen.get(t.a3); }
        } else {
          draussen.push(`${namen.get(t.a3)} ${t.treue.toFixed(2)}`);
          if (t.treue > knappDraussen) { knappDraussen = t.treue; knappDraussenWer = namen.get(t.a3); }
        }
      }
      const km2Von = new Map(roh.map(l => [l.a3, l.km2]));
      const pxVon = new Map(roh.map(l => [l.a3, l.px]));
      const treueVon = new Map(I.groesserTreue(roh).map(t => [t.a3, t.treue]));
      for (const [g, k, mal] of liste) {
        if (!km2Von.has(g) || !km2Von.has(k)) {
          pruefe(false, `„${karte}": Paar ${g}-${k} nennt ein Land, das die Karte nicht führt`);
          continue;
        }
        const wahr = km2Von.get(g) / km2Von.get(k);
        const bild = pxVon.get(g) / pxVon.get(k);
        pruefe(wahr >= I.GROESSER_FAKTOR,
          `${namen.get(g)} ist nur ${wahr.toFixed(2)}-mal so groß wie ${namen.get(k)}`);
        pruefe(bild >= I.GROESSER_FAKTOR,
          `im BILD ist ${namen.get(g)} nur ${bild.toFixed(2)}-mal so groß wie `
          + `${namen.get(k)} — das Kind sieht etwas anderes, als der Satz sagt`);
        pruefe(Math.abs(mal - Math.round(wahr * 10) / 10) < 0.05,
          `„${namen.get(g)} ist ${mal}-mal so groß" — gerechnet sind es ${wahr.toFixed(1)}`);
        /* UND DIE TREUE, ausdrücklich je Paar.
         *
         * Sie steht schon in `groesserPaare` als Filter, und genau
         * deshalb steht sie hier noch einmal: nimmt jemand sie dort
         * heraus, fällt keine der drei Zeilen darüber. Nachgemessen -
         * ohne den Filter kommen zwölf Paare dazu, und ALLE erfüllen
         * den Faktor auch im Bild. Ein Tor, das dabei grün bleibt,
         * bezeugt eine Regel, die es nie geprüft hat: eine Prüfung, die
         * nie etwas meldet, ist kein Beweis (Regel 1).
         *
         * Der Satz, den diese Zeile schützt, ist nicht „X ist größer",
         * sondern „X ist 27-mal so groß" — auf einer Karte, die von X
         * ein Fünftel zeigt. */
        for (const a3 of [g, k]) pruefe((treueVon.get(a3) ?? 0) >= TREUE_SOLL,
          `${namen.get(a3)} steht in einem Paar, wird von der Karte aber nur zu `
          + `${((treueVon.get(a3) ?? 0) * 100).toFixed(0)} % gezeigt — der Satz `
          + 'nennt eine Zahl, die im Bild nicht steht');
        if (bild < engstesVerh) {
          engstesVerh = bild; engstes = `${namen.get(g)} / ${namen.get(k)}`;
        }
        ges++;
      }
      if (liste.length) karten++;
    }
    /* Die Ratsche. 149 Paare sind heute da; faellt die Zahl, ist eine
       Karte still aus der Ebene gefallen - und die Ebene selbst mit
       ihr, wenn sie unter die kuerzeste Sitzung rutscht. */
    pruefe(ges >= 140, `nur ${ges} Paare — waren 149`);
    console.log(`    ${ges} Paare auf ${karten} von ${Object.keys(paare).length} Karten, `
      + `jedes in der Welt UND im Bild mindestens ${I.GROESSER_FAKTOR}-mal so groß`);
    console.log(`    engstes Paar im Bild: ${engstes} mit ${engstesVerh.toFixed(2)} · `
      + `Treue ≥ ${TREUE_SOLL}: knappster Träger ${knappTraegtWer} `
      + `${knappTraegt.toFixed(3)}, knappster Ausgeschlossener ${knappDraussenWer} `
      + `${knappDraussen.toFixed(3)}`);
    console.log(`    von der Karte zu klein gezeigt und deshalb draußen (${draussen.length}): `
      + draussen.sort().join(' · '));
  }
}

console.log('\n  Tor `saetze`');
{
  /* Gemessen wird gegen die WIRKLICH gespielten Gebiete (Regel 5), also
     gegen dieselben Quellen, aus denen der Bau den Vorrat schneidet -
     nicht gegen die Schluessel der Satztabelle selbst. Andersherum
     bewiese es nur, dass jeder Satz einen Schluessel hat. */
  const gebiete = [
    ...I.KONTINENTE.map(k => ({ id: k.id, name: k.name, wo: 'Kontinent' })),
    ...DEUTSCHLAND_FEIN.map(g => ({ id: g.id, name: g.name, wo: 'Bundesland' })),
    ...Object.entries(I.LAENDER).flatMap(([kont, ls]) => ls
      .filter(l => l.rang)
      .map(l => ({ id: l.a3, name: l.name, wo: `Land in ${kont}` }))),
  ];
  pruefe(gebiete.length >= 80, `nur ${gebiete.length} Gebiete gefunden — die Prüfung liest `
    + 'die Vorräte nicht mehr und würde eine leere Satztabelle durchlassen');

  const ohne = gebiete.filter(g => !S.satzZu(g.id));
  pruefe(!ohne.length, `${ohne.length} Gebiete ohne Satz zum Mitnehmen: `
    + `${ohne.slice(0, 6).map(g => `${g.name} (${g.id}, ${g.wo})`).join(' · ')}`
    + `${ohne.length > 6 ? ' …' : ''}`);

  /* Und die Form. Jede dieser drei Zeilen hat ihren Grund im Soll:

     EIN Satz - zwei sind ein Absatz, und ein Absatz wird nicht
     weitererzaehlt. Gezaehlt werden Satzzeichen, die einen Satz BEENDEN,
     und der Gedankenstrich zaehlt nicht: „Chile ist lang — sehr lang."
     ist ein Satz mit Einschub, keine zwei.

     Der NAME - „dort ist es warm" haengt an nichts. Geprueft wird gegen
     den Namen aus dem Vorrat, in beiden Richtungen: „Ägypten" steht in
     „In Ägypten ...", und „DR Kongo" in „In der DR Kongo ...".

     Die LAENGE - Fiona liest nicht, sie hoert. 110 Zeichen sind rund
     sieben Sekunden Sprechzeit; laenger haengt der Satz hinter dem Lob
     und dem Aufkleber, und das Kind tippt laengst weiter. */
  const zuViele = gebiete.filter(g => {
    const t = S.satzZu(g.id);
    return t && (t.match(/[.!?](\s|$)/g) || []).length !== 1;
  });
  pruefe(!zuViele.length, `${zuViele.length} Sätze bestehen nicht aus genau einem Satz: `
    + zuViele.slice(0, 3).map(g => `${g.name} („${S.satzZu(g.id)}")`).join(' · '));

  /* Der Vergleich laesst die BEUGUNG durch.
     „Das Vereinigte Königreich" ist derselbe Name wie „Vereinigtes
     Königreich" - und der einzige Satz, den die strenge Fassung gemeldet
     hat. Ein Satz, der den Namen richtig beugt, nennt ihn; ein Tor, das
     ihn deshalb verwirft, erzwingt schlechtes Deutsch. Abgeschnitten wird
     je Wort eine deutsche Adjektivendung, auf BEIDEN Seiten - „Vereinigte"
     und „Vereinigtes" werden zu „Vereinigt", „Königreich" bleibt.
     Namen ohne Beugung (Ägypten, Kuba, DR Kongo) sind davon unberuehrt. */
  const stamm = (t) => t.toLowerCase().replace(/\b(\w{4,}?)(?:e|er|es|en|em)\b/g, '$1');
  const ohneNamen = gebiete.filter(g => {
    const t = S.satzZu(g.id);
    return t && !stamm(t).includes(stamm(g.name));
  });
  pruefe(!ohneNamen.length, `${ohneNamen.length} Sätze nennen ihr Gebiet nicht beim Namen: `
    + ohneNamen.slice(0, 3).map(g => `${g.name} („${S.satzZu(g.id)}")`).join(' · '));

  const LAENGE = 110;
  const lang = gebiete.filter(g => (S.satzZu(g.id) || '').length > LAENGE);
  pruefe(!lang.length, `${lang.length} Sätze sind länger als ${LAENGE} Zeichen und damit `
    + `zu lang zum Vorlesen: ${lang.slice(0, 3).map(g =>
      `${g.name} (${S.satzZu(g.id).length})`).join(' · ')}`);

  const zeichen = gebiete.map(g => (S.satzZu(g.id) || '').length);
  console.log(`    ${gebiete.length} Gebiete, alle mit genau einem Satz — `
    + `${Math.min(...zeichen)} bis ${Math.max(...zeichen)} Zeichen `
    + `(im Mittel ${Math.round(zeichen.reduce((a, b) => a + b, 0) / zeichen.length)})`);
}

console.log('\n  Tor `topologie`');
// Erwartete Teile und Loecher - aus der Wirklichkeit, nicht aus den Daten.
const ERWARTET = {
  'DE-HB': { teileMin:2, grund:'Bremen und Bremerhaven liegen 60 km auseinander' },
  'DE-BB': { loecherMin:1, grund:'Berlin liegt vollständig in Brandenburg' },
  'DE-NI': { loecherMin:1, grund:'die Stadt Bremen liegt vollständig in Niedersachsen' },
  'DE-SH': { teileMin:2, grund:'Sylt, Föhr, Amrum, Fehmarn' },
};
for (const b of DEUTSCHLAND_FEIN) {
  const e = ERWARTET[b.id]; if (!e) continue;
  if (e.teileMin) pruefe(b.teile >= e.teileMin,
    `${b.name}: ${b.teile} Teile, erwartet mindestens ${e.teileMin} — ${e.grund}`);
  if (e.loecherMin) pruefe(b.loecher >= e.loecherMin,
    `${b.name}: ${b.loecher} Löcher, erwartet mindestens ${e.loecherMin} — ${e.grund}`);
}
// Umlaufsinn IM AUSGEGEBENEN PFAD.
//
// Achtung, hier ist die Falle andersherum als bei der Eingabe: die Pfade
// liegen in Bildschirmkoordinaten, y zeigt nach UNTEN. Damit dreht sich das
// Vorzeichen der Schnürsenkelformel um. Ein Aussenring, der auf dem Schirm
// im Uhrzeigersinn laeuft - das, was d3-geo aus einem korrekten Eingabering
// macht - hat hier ein POSITIVES Vorzeichen.
//
// Das Tor hat beim ersten Lauf genau deshalb 23 von 23 Umrissen als falsch
// gemeldet. Nicht die Daten waren verkehrt, sondern die Pruefung.
let falscheRichtung = 0, entartet = 0;
for (const q of [...KONTINENTE_FEIN, ...DEUTSCHLAND_FEIN]) {
  const polys = pfadZuPolys(q.pfad);
  if (!polys.length) { entartet++; continue; }
  const groesster = polys.reduce((a,b)=>ringFlaeche(a)>ringFlaeche(b)?a:b);
  if (vorzeichenFlaeche(groesster) < 0) falscheRichtung++;
  if (ringFlaeche(groesster) <= 0) entartet++;
}
pruefe(falscheRichtung === 0,
  `${falscheRichtung} Außenringe laufen gegen den Uhrzeigersinn — d3-geo liest das als "der Rest der Kugel"`);
pruefe(entartet === 0, `${entartet} Gebiete mit Fläche 0`);
console.log(`    ${KONTINENTE_FEIN.length + DEUTSCHLAND_FEIN.length} Umrisse geprüft, `
  + `${falscheRichtung} falsch herum, ${entartet} entartet`);
// Anker liegt IM Gebiet.
//
// Ein FEHLENDER Anker liess das Tor hier mit einem TypeError abstuerzen -
// gefunden von `npm run proben`. Ein Absturz ist zwar rot, aber er sagt
// nichts: an der Stelle steht ein Stapelabzug statt eines Satzes, und das
// naechste Mal sucht jemand den Fehler im Tor statt in den Daten. Ein Tor
// muss auch kaputte Eingaben BEURTEILEN koennen, nicht nur richtige.
/* Jeder Anker jedes GESPIELTEN Gebiets - nicht nur der sechzehn.
 *
 * Bis F17 pruefte diese Stelle `STAEDTE`, also Deutschland. Sechsundsechzig
 * weitere Gebiete - sechs Kontinente und sechzig Laender - hatten ebenfalls
 * einen Anker, und keiner sah ihn an. Der Anker ist keine Zierde: an ihm
 * haengen der Zeiger, der dem Kind die Stelle zeigt, das Haekchen auf einem
 * gekonnten Gebiet, die Namensfahne und die entkoppelte Trefferflaeche fuer
 * alles, was kleiner ist als ein Daumen.
 *
 * Gemessen wird an den Umrissen, die `prototyp/bauen.mjs` einbackt - grob
 * fuer Kontinente und Laender, mittel fuer die Bundeslaender. Nicht an den
 * feinen: die liegen im Baum, aber kein Kind fasst sie an.
 *
 * Ein FEHLENDER Anker liess das Tor hier einmal mit einem TypeError
 * abstuerzen - gefunden von `npm run proben`. Ein Absturz ist zwar rot,
 * aber er sagt nichts: an der Stelle steht ein Stapelabzug statt eines
 * Satzes, und das naechste Mal sucht jemand den Fehler im Tor statt in den
 * Daten. Ein Tor muss auch kaputte Eingaben BEURTEILEN koennen.
 */
/* Gespielt wird, was in `erdkunde.js` einen Rang hat - nicht, was im
 * gebackenen Umriss steht.
 *
 * Der erste Anlauf schrieb `filter(l => l.rang)` und meinte damit den
 * GEBACKENEN Rang. Der stammt aus dem Tag, an dem gebacken wurde. Als
 * D2c fuenf Nachbarn aufnahm, standen sie in `erdkunde.js` und im Umriss
 * weiterhin mit `rang: null` - `prototyp/bauen.mjs` hatte dieselbe Zeile
 * und baute stur sechzig statt fuenfundsechzig Laender. Die Geometrie ist
 * der Vorrat, nicht die Ware. */
const gespielteLaender = (roh, kont) => {
  const rang = new Map((I.LAENDER[kont] || []).filter(x => x.rang).map(x => [x.a3, x.rang]));
  return roh.filter(l => rang.has(l.a3)).map(l => ({ ...l, rang: rang.get(l.a3),
    name: (I.LAENDER[kont].find(x => x.a3 === l.a3) || {}).name || l.name }));
};
const GESPIELT = [
  ['Kontinente', KONTINENTE_GROB.filter(k => I.KONTINENTE.some(x => x.id === k.id))],
  ['Europa', gespielteLaender(LAENDER_EUROPA_GROB, 'europa')],
  ['Afrika', gespielteLaender(LAENDER_AFRIKA_GROB, 'afrika')],
  ['Asien', gespielteLaender(LAENDER_ASIEN_GROB, 'asien')],
  ['Nordamerika', gespielteLaender(LAENDER_NORDAMERIKA_GROB, 'nordamerika')],
  ['Südamerika', gespielteLaender(LAENDER_SUEDAMERIKA_GROB, 'suedamerika')],
  ['Bundesländer', DEUTSCHLAND_MITTEL],
];
/* Und weil genau diese Verwechslung die Runde gekostet hat: das Tor
 * vergleicht beide Listen. Was `erdkunde.js` spielt, MUSS es im Umriss
 * geben - sonst steht ein Land in der Liste und hat keine Karte. */
for (const [kont, liste] of Object.entries(I.LAENDER)) {
  // Erzeugt aus dem Backen (A6), nicht von Hand gefuehrt.
  const roh = KARTEN_GROB[kont];
  const da = new Set((roh || []).map(l => l.a3));
  const ohne = liste.filter(x => x.rang && !da.has(x.a3)).map(x => x.name);
  pruefe(ohne.length === 0, `${ohne.join(', ')} steht in erdkunde.js, hat aber `
    + `keinen Umriss in der groben Stufe von ${kont}`);
}
let ankerDraussen = 0, ankerFehlt = 0, ankerGeprueft = 0, mitLoch = 0;
const draussen = [], fehlen = [];
for (const [ebene, liste] of GESPIELT) {
  for (const g of liste) {
    ankerGeprueft++;
    const id = g.id || g.a3;
    /* Die Bundeslaender bekommen ihren Anker aus `staedte.js` - dort ist
       er gebacken, weil auch die Beschriftung (G10) daran haengt. Alle
       anderen rechnet `bauen.mjs` beim Bauen aus, mit denselben drei
       Funktionen, die hier stehen. */
    const ausDatei = ebene === 'Bundesländer';
    const polys = ringeZuPolygonen(pfadZuPolys(g.pfad || ''));
    if (!polys.length) { ankerFehlt++; fehlen.push(`${ebene}/${g.name || id} (kein Umriss)`); continue; }
    const groesster = polys.reduce((a, c) => ringFlaeche(a[0]) > ringFlaeche(c[0]) ? a : c);
    if (groesster.length > 1) mitLoch++;
    /* Kein Ausweichen aufs Ausrechnen.
       Der erste Anlauf schrieb `ausDatei || berechnet` - und damit fand
       das Tor fuer ein Bundesland ohne Anker klaglos einen, statt den
       fehlenden zu melden. Die Gegenprobe „das kleinste Gebiet verliert
       seinen Anker" hat es sofort gesagt: sie wurde rot, aber aus einem
       anderen Grund. Ein Tor, das eine Luecke selbst fuellt, prueft sie
       nicht mehr. */
    const anker = ausDatei
      ? (STAEDTE.find(x => x.id === id) || {}).anker
      : (polDerUnzugaenglichkeit(polys) || {}).punkt;
    if (!Array.isArray(anker) || anker.length !== 2
        || !Number.isFinite(anker[0]) || !Number.isFinite(anker[1])) {
      ankerFehlt++; fehlen.push(`${ebene}/${g.name || id}`); continue;
    }
    /* Gegen den groessten Aussenring MIT seinen Loechern.
     *
     * Hier stand `[groesster]` - nur der Aussenring, ohne Loch. Das Tor
     * meldete „0 Anker ausserhalb", waehrend Brandenburgs Anker in Berlin
     * lag: er ist im Aussenring, aber im Loch. Gefunden hat es nicht dieses
     * Tor, sondern der Rauchtest der Runde D2 - er zog „Brandenburg" auf
     * Brandenburgs Anker und bekam „Das ist Berlin."
     *
     * Eine Pruefung, die den Fall nicht sehen KANN, den sie zu pruefen
     * vorgibt, ist kein Beweis (Regel 5). */
    if (!imPolygon(anker[0], anker[1], groesster)) {
      ankerDraussen++; draussen.push(`${ebene}/${g.name || id}`);
    }
  }
}
pruefe(ankerFehlt === 0, `${ankerFehlt} Gebiete haben keinen brauchbaren Anker `
  + `(${fehlen.slice(0, 4).join(', ')}${fehlen.length > 4 ? ' …' : ''}) — ohne Anker `
  + 'gibt es weder Zeiger noch Häkchen noch Trefferfläche');
pruefe(ankerDraussen === 0, `${ankerDraussen} Anker liegen außerhalb ihres Gebiets `
  + `(${draussen.slice(0, 4).join(', ')}${draussen.length > 4 ? ' …' : ''})`);
console.log(`    ${ankerGeprueft} Anker geprüft — alle gespielten Gebiete, `
  + `davon ${mitLoch} mit Loch im größten Teil; `
  + `${ankerDraussen} außerhalb, ${ankerFehlt} fehlen`);

/* DER RAHMEN SITZT AUF DEM GESPIELTEN (B20).
 *
 * Eine Karte wird nicht dadurch falsch, dass sie zuviel zeigt - sie wird
 * nur klein. Genau deshalb ist das hier eine Zusage und kein Blick: bis
 * I26 rahmte `bauen.mjs` auf die ROHE Geometrie des Kontinents, und
 * Nordamerika zeigte den gespielten Teil auf 49 % des Bildes. Rot war
 * nichts, gemeldet hat es niemand, gesehen hat es erst jemand, als
 * Russland grau wurde.
 *
 * Gemessen wird der Rahmen der gespielten Laender gegen das Sichtfeld,
 * das im Buendel steht - also am ERGEBNIS des Baus und nicht an seiner
 * Rechnung (Regel 7). Die Grenze ist dieselbe, aus der die Zugabe
 * abgeleitet wurde: drei Viertel. Sie ist anteilig und gilt damit auch
 * fuer die neunte Karte (Regel 2).
 *
 * Nach OBEN steht keine Grenze: eine Karte darf ihren gespielten Teil
 * randlos zeigen, wenn die Umgebung ohnehin nicht weiter reicht
 * (Suedamerika mit 97 %). Was fehlt, faellt an anderer Stelle auf - die
 * Umgebung selbst hat ihre eigene Zusage. */
{
  const RAHMEN_MIN = 0.75;
  /* Der Kasten wird HIER gerechnet und nicht aus `geo-backen.mjs`
     geholt, aus dem die gemessene Zahl stammt. Vier Zeilen, und dafuer
     haengt das Soll nicht am Gemessenen (Regel 14). */
  const kastenUm = (pfade) => {
    const xs = [], ys = [];
    for (const p of pfade) {
      const m = p.match(/-?\d+\.?\d*/g).map(Number);
      for (let i = 0; i < m.length; i += 2) { xs.push(m[i]); ys.push(m[i + 1]); }
    }
    return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  };
  const anteile = [];
  for (const [karte] of Object.entries(KARTEN_GROB)) {
    const datei = new URL(`../dist/daten/laender-${karte}.json`, import.meta.url);
    if (!fs.existsSync(datei)) { pruefe(false, `keine Karte „${karte}"`); continue; }
    const j = JSON.parse(fs.readFileSync(datei, 'utf8'));
    const ziele = (j.laender || []).filter(l => l.rang);
    if (!ziele.length || !j.vbL) continue;
    const r = kastenUm(ziele.map(l => l.pfad));
    const [, , w, h] = j.vbL.split(' ').map(Number);
    if (!(w > 0 && h > 0)) { pruefe(false, `„${karte}": das Sichtfeld ist leer (${j.vbL})`); continue; }
    anteile.push([karte, (r.w * r.h) / (w * h)]);
  }
  for (const [karte, a] of anteile) pruefe(a >= RAHMEN_MIN,
    `„${karte}": der gespielte Teil füllt nur ${(a * 100).toFixed(0)} % des Kartenbildes `
    + `(verlangt ${RAHMEN_MIN * 100} %) — der Rahmen sitzt auf der rohen Geometrie des `
    + 'Kontinents statt auf dem, wonach die Ebene fragt, und das Kind sucht in einem Bild, '
    + 'das zur Hälfte Rand ist');
  if (anteile.length) {
    const schlecht = anteile.reduce((m, x) => x[1] < m[1] ? x : m);
    console.log(`    ${anteile.length} Kartenrahmen: der gespielte Teil füllt mindestens `
      + `${(schlecht[1] * 100).toFixed(0)} % des Bildes („${schlecht[0]}", verlangt `
      + `${RAHMEN_MIN * 100} %)`);
  }
}

// Nadeln: Schnitte ohne Flaeche.
//
// Natural Earth speichert Antarktika fuer eine rechteckige Weltkarte. Der
// Umriss laeuft dort bei 180 Grad hinunter zum Pol, am unteren Rand entlang
// und bei -180 Grad wieder hinauf. Auf der Weltkarte deckt sich das mit dem
// Kartenrand und faellt nicht auf. In der polaren Aufsicht sind 180 und -180
// DIESELBE Linie: beide Schenkel liegen aufeinander und zeigen sich als
// Strich quer durch den Kontinent. Zu sehen war es nur im Bild - keines der
// Tore hat es gemeldet, weil eine Nadel weder die Flaeche noch die
// Umgrenzung noch den Umlaufsinn aendert.
//
// Erkannt wird sie daran, was sie ausmacht: zwei Punkte desselben Ringes
// fallen aufeinander, und der Weg dazwischen umschliesst nichts. Eine echte
// schmale Halbinsel hat Flaeche, eine Nadel nicht.
// Die Schwellen sind so gewaehlt, dass sie eine Naht treffen und eine
// Kuestenlinie in Ruhe lassen. Bei 1000 px Breite liegen benachbarte
// Kuestenpunkte der feinen Stufe teils enger als ein halbes Bildpunkt
// beieinander - eine blosse Deckung zweier Punkte ist deshalb KEIN Befund.
// Was eine Naht ausmacht, ist der lange Umweg, der nichts umschliesst:
// hin zum Pol und auf demselben Weg zurueck.
const NADEL_DECKUNG = 0.15;  // px, so genau fallen zwei Punkte aufeinander
const NADEL_WEG     = 20;    // px, kuerzere Umwege sind Kuestenkringel
// Die mittlere Breite trennt sauber: eine Naht laeuft auf sich selbst
// zurueck und hat exakt 0. Die duennsten ECHTEN Gebilde im Vorrat - ein
// paar Fjorde in Kanada, eine Nehrung in den USA - liegen bei 0,18 bis 0,27
// px. Dazwischen ist Platz. Sie werden als Hinweis gemeldet, nicht als
// Fehler: sie stehen so in der Wirklichkeit.
const NADEL_BREITE  = 0.05;  // px mittlere Breite - darunter ist es ein Schnitt
const DUENN_BREITE  = 0.3;   // px, darunter nur noch ein Haar breit
function nadeln(d) {
  let zahl = 0, laengste = 0, duenn = 0;
  for (const ring of pfadZuPolys(d)) {
    const eimer = new Map();
    ring.forEach((p, i) => {
      const k = `${Math.round(p[0]/NADEL_DECKUNG)},${Math.round(p[1]/NADEL_DECKUNG)}`;
      if (!eimer.has(k)) eimer.set(k, []);
      eimer.get(k).push(i);
    });
    for (const gruppe of eimer.values()) {
      for (let a = 0; a < gruppe.length; a++) for (let b = a+1; b < gruppe.length; b++) {
        const i = gruppe[a], j = gruppe[b];
        if (j - i < 3) continue;
        if (Math.hypot(ring[i][0]-ring[j][0], ring[i][1]-ring[j][1]) > NADEL_DECKUNG) continue;
        const teil = ring.slice(i, j+1);
        let weg = 0;
        for (let k = 1; k < teil.length; k++)
          weg += Math.hypot(teil[k][0]-teil[k-1][0], teil[k][1]-teil[k-1][1]);
        if (weg < NADEL_WEG) continue;
        const breite = ringFlaeche(teil) / (weg/2);
        if (breite > DUENN_BREITE) continue;
        if (breite > NADEL_BREITE) { duenn++; continue; }
        zahl++;
        if (weg > laengste) laengste = weg;
      }
    }
  }
  return { zahl, laengste, duenn };
}
let nadelZahl = 0, nadelWo = [], duennZahl = 0;
for (const [quelle, liste] of Object.entries(GEBACKEN)) {
  for (const q of liste) {
    const n = nadeln(q.pfad);
    duennZahl += n.duenn;
    if (n.zahl) { nadelZahl += n.zahl; nadelWo.push(`${quelle}/${q.name} (${n.zahl}, längste ${n.laengste.toFixed(0)} px)`); }
  }
}
if (duennZahl) hinweise.push(`${duennZahl} echte Gebilde sind nur ein Haar breit `
  + `(unter ${DUENN_BREITE} px mittlere Breite) — sie stehen so in der Wirklichkeit, `
  + `sind aber bei keiner Größe zu sehen`);
pruefe(nadelZahl === 0,
  `${nadelZahl} Nadeln ohne Fläche im Umriss: ${nadelWo.join(', ')} — auf einer anderen Projektion wird daraus ein Strich`);
console.log(`    ${Object.values(GEBACKEN).flat().length} Umrisse auf Nadeln geprüft, `
  + `${nadelZahl} gefunden, ${duennZahl} echte Haarlinien`);

/* =================================================== Tor `beruehrung` === */
console.log('\n  Tor `beruehrung`');
/* Hier stand eine Zahl in Bildpunkten - und sie war falsch.
 *
 * `radius * 2 * (470/1000)`: 470 Punkte Kartenbreite, geteilt durch eine
 * GESCHAETZTE viewBox-Breite von tausend. Beides trifft nicht zu. Die Karte
 * wird in ihren Kasten eingepasst, und auf dem Zielgeraet (844 x 390)
 * bindet die HOEHE. Gemessen in D2c gegen den Browser: 36,1 Punkte gegen
 * 24,9 fuer die Schweiz, rund 35 % daneben - und die Vorzeichen kippten,
 * Node sah drei Laender gar nicht als „zu klein", die der Browser sah.
 *
 * Regel 5: die Zahl und ihre Messstelle gehoeren zusammen. Die
 * Bildpunkte stehen deshalb seit P6 in `npm run ziehen` (Abschnitt
 * `treffer`), gemessen am gebauten Spiel auf allen sieben Karten. Hier
 * bleibt, was OHNE Bildschirm wahr ist.
 */
/* Der Platz, den ein Gebiet hat, als Anteil der Kartenbreite - ein Promille
 * ist ein Tausendstel der viewBox. Das ist massstabsfrei und veraltet
 * nicht, wenn sich das Fenster aendert. */
const promille = (s) => +(s.radius * 2).toFixed(1);
const nachPlatz = [...STAEDTE].filter(s => Number.isFinite(s.radius))
  .sort((a, b) => a.radius - b.radius);
console.log(`    Die vier engsten Bundesländer, in Karteneinheiten von 1000: `
  + nachPlatz.slice(0, 4).map(s => `${s.name} ${promille(s)}`).join(' · '));
console.log('    Wieviel das in Bildpunkten ist, misst `npm run ziehen` am Browser —'
  + ' hier wäre es geraten.');

/* Die harte Zusage, die es zu bewachen gibt: die App baut die entkoppelte
 * Trefferflaeche aus dem ANKER (`formen.filter(x => x.anker)`). Ein Gebiet
 * ohne Anker bekommt keinen Kreis - und ist mit dem Finger dann an KEINER
 * Stelle zu treffen. Es steht in den Daten, wird gezaehlt, erscheint auf
 * der Karte und laesst sich nicht spielen.
 *
 * Geprueft werden ALLE, nicht nur die kleinen: welches Gebiet unter den
 * Daumen faellt, haengt am Bildschirm, und den gibt es hier nicht. Ein
 * Gebiet ohne Anker ist auf irgendeiner Groesse ein Gebiet ohne
 * Trefferflaeche. (`topologie` prueft dieselbe Sache fuer alle 87
 * gespielten Gebiete; hier steht die Zusage, die den Finger betrifft.)
 */
{
  const ohneAnker = STAEDTE.filter(s => !Array.isArray(s.anker) || s.anker.length !== 2
    || !Number.isFinite(s.anker[0]) || !Number.isFinite(s.anker[1]));
  pruefe(ohneAnker.length === 0,
    `${ohneAnker.length} Gebiete haben keinen Anker und damit keine `
    + 'Trefferfläche — sie sind mit dem Finger nicht zu treffen'
    + (ohneAnker[0] ? ` (${ohneAnker.map(s => s?.name ?? '?').join(', ')})` : ''));
  console.log(`    ${STAEDTE.length - ohneAnker.length} von ${STAEDTE.length} Gebieten `
    + 'haben einen Anker und damit eine entkoppelte Trefferfläche');
}

/* ====================================================== Tor `marken` ==== */
console.log('\n  Tor `marken`');
// NUR der Grundblock. Der Abendmodus definiert dieselben Marken absichtlich
// dunkler - beim ersten Lauf hat das Tor beide Bloecke gelesen und
// "unterschiedliche Helligkeit" gemeldet. Auch das war die Pruefung, nicht
// die Sache.
const MARKEN_ALLES = fs.readFileSync('src/marken/marken.css','utf8');
const MARKEN = MARKEN_ALLES.slice(MARKEN_ALLES.indexOf(':root {'),
                                 MARKEN_ALLES.indexOf(':root[data-abend'));
const QUELLEN = ['entwuerfe/koerper.html','entwuerfe/skript.html',
                'prototyp/spiel.js','prototyp/vorlage.html'];
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
let verstoesse = 0;
for (const q of QUELLEN) {
  if (!fs.existsSync(q)) continue;
  const t = fs.readFileSync(q,'utf8');
  if (EMOJI.test(t)) { fehler.push(`${q}: Emoji im Oberflächentext`); verstoesse++; }
  if (/filter:\s*drop-shadow/.test(t)) { fehler.push(`${q}: filter auf einem Pfad`); verstoesse++; }
  // `[^;}]*` statt `[^;]*`: die letzte Erklaerung einer Regel hat kein
  // Semikolon, also lief die Suche ueber die schliessende Klammer hinaus in
  // die naechste Regel - und meldete ein sauberes `transition:transform`
  // rot, weil zwei Zeilen weiter irgendwo `width` stand.
  const layout = t.match(/transition:[^;}]*\b(width|height|top|left|margin|padding)\b/g);
  if (layout) { fehler.push(`${q}: Animation auf Layouteigenschaft — ${layout[0]}`); verstoesse++; }
}
// Festgenagelte Masse IM MARKUP.
//
// `style="min-width:200px"` an einer Kachel hat die halbe Ebenenwahl aus
// dem Fenster geschoben - und war nicht zu finden, weil inline jede
// Stilregel schlaegt. Vier Groessen waren rot, waehrend im Stylesheet ein
// sauberes Raster stand, das gegen eine Zahl im Markup arbeitete.
//
// Erlaubt bleibt, was gerechnet wird (`${...}`) oder aus einer Marke kommt
// (`var(--r4)`). Verboten ist die nackte Zahl.
let inlineMasse = 0;
for (const q of ['prototyp/spiel.js', 'prototyp/vorlage.html']) {
  if (!fs.existsSync(q)) continue;
  for (const m of fs.readFileSync(q, 'utf8').matchAll(/style="([^"]*)"/g)) {
    const ohneRechnung = m[1].replace(/\$\{[^}]*\}/g, '');
    const zahlen = ohneRechnung.match(/-?\d*\.?\d+(px|rem|em|pt)/g);
    if (zahlen) {
      fehler.push(`${q}: festgenagelte Maße im Markup — style="${m[1]}" `
        + `(${zahlen.join(', ')}). Solche Werte gehören nach marken.css; `
        + `inline schlagen sie jede Stilregel und sind dort nicht zu finden.`);
      inlineMasse++;
    }
  }
}

// Farben, Dauern und Kanten NUR in marken.css.
//
// Das Tor pruefte bisher nur das Markup. Im Stylesheet standen vier Farben,
// eine Dauer und ein Dutzend Strichstaerken frei herum - und in spiel.js
// noch vier weitere Farben, unter anderem die der Sterne. Ein
// Gestaltungssystem, an dem man vorbeigreifen kann, ist keins.
//
// Bauteilmasse (44 pt Trefferflaeche, 76 px Mikrofon, 440 px Grenze) bleiben
// erlaubt: das sind Groessen, keine Marken. Die Grenze verlaeuft bei dem,
// was das Projekt sich vorgenommen hat - Farbe, Abstand, Radius, Strich,
// Dauer.
const SYSTEM = [
  { was:'Farbe',    muster:/oklch\([^)]*\)|#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)/g },
  { was:'Dauer',    muster:/(?<![\w-])\d+m?s(?![\w-])/g },
  { was:'Radius',   muster:/border-radius:\s*[^;}]*(?<![\w-])\d*\.?\d+(px|rem|em)/g },
  { was:'Strich',   muster:/border(-\w+)?:\s*[^;}]*(?<![\w-])\d*\.?\d+(px|rem|em)\s+(solid|dashed|dotted)/g },
  { was:'Abstand',  muster:/(?:^|[;{])\s*(?:gap|padding|margin)(-\w+)?:\s*[^;}]*(?<![\w-])\d*\.?\d+(px|rem)/g },
];
let amSystemVorbei = 0;
for (const q of ['prototyp/vorlage.html', 'prototyp/spiel.js']) {
  if (!fs.existsSync(q)) continue;
  let t = fs.readFileSync(q, 'utf8');
  // Der eingesetzte Markenblock ist die Quelle selbst - er darf alles.
  t = t.replace('__MARKEN__', '');
  // Kommentare zaehlen nicht.
  t = t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
       .replace(/^\s*\/\/.*$/gm, ' ');
  /* Und in einer MASKE zaehlt Weiss nicht als Farbe.
   *
   * Eine SVG-Maske rechnet mit Helligkeit: Weiss heisst „ganz sichtbar",
   * Schwarz „ganz weg". Das ist ein Wert der Technik, keine Gestaltung -
   * niemand wuerde ihn in `marken.css` suchen, und dorthin gehoert er auch
   * nicht: er darf sich mit dem Abendmodus gerade NICHT aendern.
   *
   * Der Anlass war die Randblende (Q3). Ohne diese Zeile haette die Regel
   * einen Maskenwert ins Gestaltungssystem gedrueckt, wo er beim naechsten
   * Umfaerben stillschweigend falsch geworden waere.
   *
   * Ausgenommen ist nur, was ZWISCHEN `<mask>` und `</mask>` steht - die
   * Verlaeufe der Blende stehen deshalb dort drin und nicht daneben. Eine
   * Farbe irgendwo sonst im Markup schlaegt weiter an; die Gegenprobe
   * „eine Farbe steht am System vorbei" faehrt genau das. */
  t = t.replace(/<mask[\s\S]*?<\/mask>/g, ' ');
  for (const { was, muster } of SYSTEM) {
    const treffer = [...new Set(t.match(muster) || [])];
    if (treffer.length) {
      fehler.push(`${q}: ${treffer.length} ${was}-Werte am System vorbei — `
        + `${treffer.slice(0, 4).map(x => x.trim().slice(0, 44)).join(' · ')}`
        + `${treffer.length > 4 ? ' …' : ''}. Gehört nach src/marken/marken.css.`);
      amSystemVorbei += treffer.length;
    }
  }
}

/* Jede benutzte Marke muss es geben.
 *
 * Der Audit fand `padding: var(--r3) var(--r5)` am gezogenen Schild - und
 * `--r5` gab es nicht. Das ist kein stiller Ausfall EINES Wertes: eine
 * ungueltige `var()` macht die GANZE Deklaration ungueltig, und weil
 * `padding` nicht erbt, blieb null uebrig. Der Name klebte an beiden
 * Rundungen des Schilds, seit die Regel geschrieben wurde.
 *
 * Kein Tor konnte das sehen: `passt` misst Ueberlauf, `lesbarkeit` misst
 * Kontrast, und das Vorbild im Bildvergleich hielt den Fehler als SOLL
 * fest. Ein Schreibfehler in einem Markennamen ist im Browser lautlos -
 * hier ist er es nicht mehr.
 *
 * Ausgenommen sind Marken, die im Markup gesetzt werden (`--ton`, `--rang`,
 * `--karte-ar`): sie kommen aus dem Programm, nicht aus dem System. Sie
 * muessen dort aber wirklich gesetzt werden, und genau das wird geprueft.
 */
{
  const alleQuellen = [MARKEN_ALLES, ...QUELLEN.filter(q => fs.existsSync(q))
    .map(q => fs.readFileSync(q, 'utf8'))].join('\n');
  const gesetzt = new Set([...alleQuellen.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
  // setProperty('--rang', …) definiert die Marke ebenfalls, nur ohne Doppelpunkt.
  for (const m of alleQuellen.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)) gesetzt.add(m[1]);
  // `var(--f${b.farbe})` ist ein gerechneter Name, kein fester. Solche
  // Stellen werden uebersprungen - der Name entsteht erst beim Zeichnen.
  const benutzt = [...new Set([...alleQuellen.matchAll(/var\(\s*(--[\w-]+)(\$\{)?/g)]
    .filter(m => !m[2]).map(m => m[1]))];
  const ohne = benutzt.filter(v => !gesetzt.has(v));
  pruefe(ohne.length === 0, `benutzt, aber nirgends gesetzt: ${ohne.join(', ')} — `
    + 'eine ungültige var() macht die ganze Deklaration ungültig, nicht nur den einen Wert');
  console.log(`    ${benutzt.length} benutzte Marken, alle gesetzt`);
}

pruefe(/--f1:\s*oklch/.test(MARKEN), 'Palette steht nicht in OKLCH');
// Gleiche Helligkeit auf allen sieben Flaechen - sonst ist derselbe
// Textton nicht auf allen lesbar.
//
// Bis zum Audit stand die Helligkeit siebenmal als Zahl da, und dieses Tor
// verglich die sieben Zahlen miteinander. Jetzt leiten sich die sieben aus
// EINER Marke ab; die alte Pruefung fand danach null Farben und waere rot
// geworden, ohne dass etwas kaputt war. Geprueft wird deshalb die Form,
// die die Gleichheit traegt: jede der sieben muss dieselbe Marke benutzen.
// Wer eine einzelne Farbe wieder festnagelt, faellt hier durch.
// `[^)]*` haette hier nicht gereicht: der Wert enthaelt selbst Klammern -
// oklch(var(--flaeche-l) var(--flaeche-c) 25). Der erste Anlauf zaehlte
// deshalb null von sieben und meldete einen Fehler, den es nicht gab.
const abgeleitet = (text) => [...text.matchAll(
  /--f([1-7]):\s*oklch\(\s*var\(--flaeche-l\)\s+var\(--flaeche-c\)\s+[\d.]+\s*\)/g)].length;
const helligkeit = (text) => [...text.matchAll(/--flaeche-l:\s*([\d.]+)/g)].map(m => +m[1]);
const abendTeil = MARKEN_ALLES.slice(MARKEN_ALLES.indexOf(':root[data-abend'));
const lTag = helligkeit(MARKEN), lAbend = helligkeit(abendTeil);
pruefe(abgeleitet(MARKEN) === 7,
  `nur ${abgeleitet(MARKEN)} von 7 Flächenfarben leiten sich aus --flaeche-l/--flaeche-c ab — `
  + 'eine festgenagelte Farbe fällt beim nächsten Griff an der Marke vorbei');
pruefe(lTag.length === 1, `--flaeche-l steht ${lTag.length}-mal im Tagmodus, erwartet einmal`);
pruefe(lAbend.length === 1, `--flaeche-l steht ${lAbend.length}-mal im Abendmodus, erwartet einmal`);
// Und die eine Zahl muss dunkel genug bleiben: der Textton --auf-flaeche
// liegt bei L 0,24, gemessen sind 6,1:1 bei L 0,74. Ueber 0,86 kippt das.
pruefe(lTag[0] >= 0.60 && lTag[0] <= 0.86,
  `Flächenhelligkeit ${lTag[0]} liegt außerhalb von 0,60 bis 0,86 — der dunkle Textton trägt dort nicht mehr`);
pruefe(lAbend[0] < lTag[0],
  `Abendmodus ist mit L ${lAbend[0]} nicht dunkler als der Tagmodus mit ${lTag[0]}`);
console.log(`    7 Flächenfarben aus einer Marke: L ${lTag[0]} am Tag, ${lAbend[0]} am Abend`);
console.log(`    ${verstoesse} Markenverstöße in ${QUELLEN.length} Quellen, `
  + `${inlineMasse} festgenagelte Maße im Markup, `
  + `${amSystemVorbei} Werte am System vorbei`);

/* ===================================================== Tor `schrift` === */
console.log('\n  Tor `schrift`');
//
// Die Schriften liegen nur im Schnitt `latin` im Baum - 51,6 KB statt 328.
// Das ist eine Zusage ueber den INHALT: kein angezeigter Name darf ein
// Zeichen ausserhalb dieses Bereichs brauchen. Wer sie bricht, sieht auf
// dem iPad ein leeres Kaestchen und sonst nichts - kein Absturz, keine
// Meldung, nur ein Name, den das Kind nicht lesen kann.
//
// Der Bereich wird NICHT hier festgeschrieben, sondern aus der erzeugten
// schrift.css gelesen. Aendert Google den Schnitt, wandert die Pruefung mit.
{
  const cssPfad = path.join(process.cwd(), 'src/schrift/schrift.css');
  if (!fs.existsSync(cssPfad)) {
    pruefe(false, 'src/schrift/schrift.css fehlt — `npm run schrift` wurde nie ausgeführt');
  } else {
    const css = fs.readFileSync(cssPfad, 'utf8');
    const bereiche = [];
    for (const m of css.matchAll(/U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?/g))
      bereiche.push([parseInt(m[1], 16), parseInt(m[2] || m[1], 16)]);
    pruefe(bereiche.length > 0, 'schrift.css nennt keinen einzigen Zeichenbereich');
    const drin = (c) => bereiche.some(([a, b]) => c >= a && c <= b);

    // Was geprueft wird: alles, was als Name auf dem Schirm landen kann,
    // plus der Text der Oberflaeche. Der Inhalt waechst - dort passiert es.
    const quellen = [];
    const sammle = (was, wo) => {
      if (typeof was === 'string') quellen.push([was, wo]);
      else if (Array.isArray(was)) was.forEach(x => sammle(x, wo));
      else if (was && typeof was === 'object')
        for (const [k, v] of Object.entries(was)) sammle(v, wo);
    };
    sammle(I.KONTINENTE, 'Kontinente');
    sammle(I.LAENDER, 'Länder');
    sammle(I.HAUPTSTADT_ABLENKER, 'Ablenker');
    sammle(STAEDTE.map(x => x.hauptstadt), 'Hauptstädte');
    sammle(DEUTSCHLAND_FEIN.map(x => x.name), 'Bundesländer');
    for (const [quelle, liste] of Object.entries(GEBACKEN))
      sammle(liste.map(x => x.name).filter(Boolean), quelle);
    // Kommentare zaehlen nicht: sie werden nie angezeigt. Ohne das Streichen
    // meldet das Tor genau den Kommentar rot, der seinen eigenen Befund
    // beschreibt - und der Weg aus dem Rot waere, den Grund zu loeschen.
    const ohneKommentar = (t) => t
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/^\s*\/\/.*$/gm, ' ');
    for (const datei of ['prototyp/spiel.js', 'prototyp/vorlage.html'])
      quellen.push([ohneKommentar(fs.readFileSync(path.join(process.cwd(), datei), 'utf8')), datei]);

    const fehlend = new Map();
    for (const [text, wo] of quellen)
      for (const z of text) {
        const c = z.codePointAt(0);
        if (!drin(c)) {
          const k = `U+${c.toString(16).toUpperCase().padStart(4,'0')} „${z}"`;
          if (!fehlend.has(k)) fehlend.set(k, new Set());
          fehlend.get(k).add(wo);
        }
      }
    pruefe(fehlend.size === 0, `${fehlend.size} Zeichen liegen außerhalb des Schnitts `
      + `latin: ${[...fehlend].map(([k,w])=>`${k} in ${[...w].join('/')}`).join(', ')}`);
    console.log(`    ${quellen.length} Texte gegen ${bereiche.length} Zeichenbereiche geprüft, `
      + `${fehlend.size} Zeichen ohne Schrift`);
  }
}

/* ====================================================== Tor `symbol` === */
console.log('\n  Tor `symbol`');
//
// Ein Symbol faellt nicht auf, wenn es kaputt ist - es steht auf dem
// Startbildschirm und niemand sieht es sich noch einmal an. Geprueft wird
// deshalb das Mechanische, so wie `bildtor` es im anderen Projekt tut.
{
  const NOETIG = [180, 192, 512, 1024];
  const symbolDir = path.join(process.cwd(), 'src/symbol');
  for (const g of NOETIG) {
    const f = path.join(symbolDir, `symbol-${g}.png`);
    if (!fs.existsSync(f)) { pruefe(false, `symbol-${g}.png fehlt`); continue; }
    const bild = PNG.sync.read(fs.readFileSync(f));
    pruefe(bild.width === g && bild.height === g,
      `symbol-${g}.png ist ${bild.width}×${bild.height}, erwartet ${g}×${g}`);

    // iOS legt Durchsichtigkeit auf SCHWARZ. Ein Symbol mit Alpha sieht im
    // Entwurf gut aus und auf dem Startbildschirm nach Loch.
    let durchsichtig = 0;
    for (let i = 3; i < bild.data.length; i += 4) if (bild.data[i] < 255) durchsichtig++;
    pruefe(durchsichtig === 0,
      `symbol-${g}.png hat ${durchsichtig} durchsichtige Bildpunkte — iOS legt die auf Schwarz`);

    // Nicht einfarbig. Eine leere Flaeche besteht jede andere Pruefung.
    const toene = new Set();
    for (let i = 0; i < bild.data.length; i += 4)
      toene.add((bild.data[i] >> 3 << 10) | (bild.data[i+1] >> 3 << 5) | (bild.data[i+2] >> 3));
    pruefe(toene.size > 40, `symbol-${g}.png hat nur ${toene.size} Farbtöne — vermutlich leer`);

    // Die Kugel muss INNERHALB der iOS-Maske liegen. iOS schneidet die Ecken
    // rund ab; was dort steht, ist weg. Geprueft an den vier Ecken: dort darf
    // nur Grund stehen, kein Meer und kein Land.
    const punkt = (x, y) => { const i = (bild.width * y + x) << 2;
      return [bild.data[i], bild.data[i+1], bild.data[i+2]]; };
    const mitte = punkt(g >> 1, g >> 1);
    const rand = Math.round(g * 0.045);
    let eckenWieMitte = 0;
    for (const [x, y] of [[rand,rand], [g-1-rand,rand], [rand,g-1-rand], [g-1-rand,g-1-rand]]) {
      const e = punkt(x, y);
      const d = Math.max(Math.abs(e[0]-mitte[0]), Math.abs(e[1]-mitte[1]), Math.abs(e[2]-mitte[2]));
      if (d < 40) eckenWieMitte++;
    }
    pruefe(eckenWieMitte === 0,
      `symbol-${g}.png: ${eckenWieMitte} Ecken sehen aus wie die Mitte — die Kugel läuft in die iOS-Maske`);

    /* Und in den Ecken steht NUR Grund - nicht bloss „nicht die Mitte".
     *
     * Die vier Punkte darueber vergleichen mit der Kugelmitte. Das faengt
     * eine Kugel, die zu gross ist, und sonst nichts: als der Stern (A7)
     * im ersten Entwurf oben aus dem Bild lief, war er GELB, also nicht
     * wie die Mitte - vier Ecken gruen, und die Zacke haette die iOS-Maske
     * trotzdem abgeschnitten.
     *
     * Geprueft wird deshalb nicht die FARBE, sondern die GLATTHEIT: der
     * Grund ist ein Verlauf und aendert sich von Bildpunkt zu Bildpunkt um
     * Bruchteile. Alles, was dort sonst noch steht - eine Kontur, ein
     * weisser Aufkleberrand, eine Sternzacke -, bringt eine Kante mit.
     *
     * Die Maske wird als abgerundetes Rechteck mit 20 % Eckradius
     * angenaehert. Die wirkliche iOS-Form (ein Squircle) ist etwas voller,
     * schneidet also WENIGER weg - was hier auffaellt, faellt dort erst
     * recht auf. */
    {
      const r = g * 0.20, saum = g * 0.05;
      /* Zwei Zonen, und beide muessen leer sein.
       *
       * Die ECKEN, weil die iOS-Maske sie rund abschneidet. Und der SAUM,
       * die aeussersten fuenf Prozent an jeder Kante - was dort steht,
       * steht am Bildrand und ist abgeschnitten, ganz ohne Maske. Genau
       * das war der erste Sternentwurf: er lief oben aus dem Bild, aber
       * MITTIG genug, um an keiner Ecke aufzufallen. Eine Pruefung, die
       * nur die Ecken kennt, haette ihn durchgelassen. */
      const draussen = (x, y) => {
        if (x < saum || y < saum || x > g - 1 - saum || y > g - 1 - saum) return true;
        const dx = Math.max(r - x, x - (g - 1 - r), 0);
        const dy = Math.max(r - y, y - (g - 1 - r), 0);
        return dx > 0 && dy > 0 && Math.hypot(dx, dy) > r;
      };
      let sprung = 0, wo = null;
      for (let y = 0; y < g - 1; y++) for (let x = 0; x < g - 1; x++) {
        if (!draussen(x, y) || !draussen(x + 1, y) || !draussen(x, y + 1)) continue;
        const a = punkt(x, y), b = punkt(x + 1, y), c = punkt(x, y + 1);
        const d = Math.max(...[0,1,2].map(i => Math.max(Math.abs(a[i]-b[i]), Math.abs(a[i]-c[i]))));
        if (d > sprung) { sprung = d; wo = [x, y]; }
      }
      pruefe(sprung <= 12, `symbol-${g}.png: am Rand bei ${wo && wo.join(',')} springt die `
        + `Farbe um ${sprung} — dort steht etwas anderes als der Grund, und dort `
        + 'schneidet entweder der Bildrand oder die iOS-Maske es ab');
    }
  }
  console.log(`    ${NOETIG.length} Größen geprüft: quadratisch, undurchsichtig, nicht leer, `
    + `nur glatter Grund am Saum und außerhalb der iOS-Maske`);
}

/* ======================================================== Tor `doku` ==== */
console.log('\n  Tor `doku`');
// `../docs/…` war ein Rest aus der Zeit, als der Baum unter
// `towerfront/lernkiste/` lag. Seit dem Umzug zeigt der Pfad AUS dem
// Verzeichnis heraus, die Datei ist dort nicht, und `existsSync` war
// falsch - also lief die ganze Pruefung nicht mehr. Gemeldet hat das
// niemand: sie uebersprang sich still, und still ist gruen.
//
// Gefunden hat es `npm run proben`: die Gegenprobe drehte die Gebietszahl
// im Konzept um sieben, und das Tor blieb gruen.
//
// Ein fehlendes Konzept ist deshalb jetzt ein FEHLER, kein Achselzucken.
/* Wo die Rohdaten liegen, sagen DREI Stellen - sie muessen sich einig sein.
 *
 * `.gitignore` nannte `roh/`, die README „braucht roh/", und
 * `tools/geo-backen.mjs` einen festen Pfad in ein Sitzungsverzeichnis unter
 * /tmp. Zwei von drei waren einig, und die dritte war die, die zaehlt: wer
 * `npm run backen` aufrief, bekam ein nacktes ENOENT auf einen Pfad, den er
 * nie gesetzt hatte.
 *
 * Geprueft wird der Ordnername, nicht der ganze Pfad - er muss RELATIV zum
 * Arbeitsverzeichnis stehen und in `.gitignore` auftauchen.
 */
{
  const quelle = fs.readFileSync('tools/geo-backen.mjs', 'utf8');
  const m = quelle.match(/LERNKISTE_ROH \|\| path\.join\(process\.cwd\(\), '([^']+)'\)/);
  pruefe(m, 'tools/geo-backen.mjs setzt die Rohdaten nicht mehr relativ zum '
    + 'Arbeitsverzeichnis — ein fester Pfad gilt nur auf einem Rechner');
  if (m) {
    const ordner = m[1];
    pruefe(new RegExp(`^${ordner}/?$`, 'm').test(fs.readFileSync('.gitignore', 'utf8')),
      `„${ordner}" steht nicht in .gitignore — die Rohdaten landen im Repository `
      + '(79 MB gegen 1,2 MB gepackt)');
    pruefe(fs.readFileSync('README.md', 'utf8').includes(`${ordner}/`),
      `Die README nennt „${ordner}/" nicht — dann steht der Weg nirgends, wo ihn `
      + 'jemand sucht');
    console.log(`    Rohdaten: „${ordner}/", in .gitignore und in der README`);
  }
}

const KONZEPT = 'docs/Lernkiste-KONZEPT.md';
if (!fs.existsSync(KONZEPT)) {
  fehler.push(`${KONZEPT} nicht gefunden — die Doku-Prüfung kann nicht laufen `
    + '(ein Tor, das sich still überspringt, ist schlimmer als keines)');
} else {
  const t = fs.readFileSync(KONZEPT,'utf8');
  const m = t.match(/Gebiete gesamt \| \*\*(\d+)\*\*/);
  if (!m) hinweise.push('Konzept nennt keine Gebietszahl');
  else if (+m[1] !== ZAHL.gesamt)
    fehler.push(`Konzept sagt ${m[1]} Gebiete, gezählt sind ${ZAHL.gesamt} `
      + `(${ZAHL.kontinente}+${ZAHL.laender}+${ZAHL.bundeslaender}+${ZAHL.staedte})`);
  else console.log(`    Gebietszahl stimmt: ${ZAHL.gesamt}`);
}

/* Fionas Rechnen: der Code gegen den Abgleich.
 *
 * Die Verteilungen stehen im Dokument und nicht im Programm - dieselbe
 * Mechanik wie beim Tor `budget`, das seine Grenzen aus dem Konzept liest.
 * Zwei Zahlen an zwei Orten veralten getrennt: die eine wird gepflegt, die
 * andere gilt. Hier wird die gepflegte zur geltenden gemacht.
 *
 * Geprüft wird gegen den ERZEUGTEN Vorrat, nicht gegen eine dritte Liste:
 * `rechnen.js` rechnet die hundert Aufgaben aus, dieses Tor zählt sie.
 */
/**
 * Sollwerte aus dem Abgleich lesen und gegen das Gerechnete halten.
 *
 * Stand zweimal fast gleich da - fuer Fionas Rechnen und fuer Leas Reihen.
 * `npm run doppelt` hat es gemeldet: 107 Token. Der Kommentar bei Leas
 * Block nannte sogar einen Grund („faellt hier etwas um, soll dastehen,
 * WESSEN Fach kaputt ist") - aber der verlangt getrennte MELDUNGEN, nicht
 * getrenntes Geruest. `was` steht in jeder Zeile, die dieser Helfer
 * schreibt; die Auskunft bleibt also dieselbe.
 *
 * Nebenbei berichtigt: Fionas Block meldete eine fehlende Datei als
 * Fehler, Leas ging stillschweigend darueber hinweg. Zwei Fassungen, zwei
 * Verhalten - genau das, was die Regel meint. Jetzt melden beide.
 *
 * `rechne` wird erst gerufen, wenn alle Sollwerte dastehen: sonst
 * vergliche man gegen `null` und bekaeme fuenf Meldungen statt einer.
 */
const ABGLEICH = 'docs/Lernkiste-ABGLEICH-ANTON.md';
function gegenAbgleich(was, zeilen, rechne) {
  if (!fs.existsSync(ABGLEICH)) {
    fehler.push(`${ABGLEICH} nicht gefunden — ${was} lässt sich nicht prüfen`);
    return null;
  }
  const t = fs.readFileSync(ABGLEICH, 'utf8');
  const soll = {};
  for (const [k, zeile] of Object.entries(zeilen)) {
    const m = t.match(new RegExp(`\\|\\s*${zeile}\\s*\\|\\s*(\\d+)`));
    soll[k] = m ? +m[1] : null;
  }
  const fehlend = Object.entries(soll).filter(([, v]) => v === null).map(([k]) => k);
  if (fehlend.length) {
    fehler.push(`${ABGLEICH} nennt ${fehlend.length} Werte für ${was} nicht: `
      + `${fehlend.join(', ')} — dann prüft dieses Tor nichts`);
    return null;
  }
  const ist = rechne();
  for (const k of Object.keys(soll))
    pruefe(soll[k] === ist[k],
      `${was}, ${k}: der Abgleich sagt ${soll[k]}, gerechnet sind ${ist[k]}`);
  return ist;
}

{
  const v = R.vorrat();
  const ist = gegenAbgleich('Fionas Rechnen', {
    raum:  'Zahlenraum',
    plus:  'Anteil Addition',
    minus: 'Anteil Subtraktion',
    nPlus: 'Aufgaben mit Plus',
    nMinus:'Aufgaben mit Minus',
  }, () => ({
    raum:  R.BIS,
    plus:  Math.round(R.MISCHUNG_FIONA.plus * 100),
    minus: Math.round(R.MISCHUNG_FIONA.minus * 100),
    nPlus: v.filter(x => x.rechenart === 'plus').length,
    nMinus:v.filter(x => x.rechenart === 'minus').length,
  }));
  if (ist) {
      pruefe(ist.plus + ist.minus === 100,
        `Die Anteile ergeben ${ist.plus + ist.minus} statt 100 Prozent`);
      // Die Regel, die aus „wenig mit 0" geworden ist: nur als Ergebnis.
      const mitNull = v.filter(x => x.a === 0 || x.b === 0).length;
      pruefe(mitNull === 0,
        `${mitNull} Aufgaben haben die Null als Summand oder Subtrahend — `
        + 'sie soll nur als Ergebnis vorkommen');
      pruefe(v.every(x => x.wert >= 0 && x.wert <= R.BIS),
        'eine Aufgabe verlässt den Zahlenraum');
      pruefe(new Set(v.map(x => x.id)).size === v.length,
        'zwei Rechenaufgaben haben dieselbe Kennung — dann teilen sie sich einen Leitner-Stand');
      console.log(`    Fionas Rechnen: ${v.length} Aufgaben, `
        + `${ist.plus}/${ist.minus} Prozent, Zahlenraum ${ist.raum} — wie im Abgleich`);
  }
}

/* Leas Reihen: derselbe Griff, andere Zahlen.
 *
 * Hier stand: „Getrennt von Fionas Block, obwohl das halbe Gerüst dasselbe
 * ist. Der Grund steht in der Ausgabe: fällt hier etwas um, soll dastehen,
 * WESSEN Fach kaputt ist." Der Grund gilt weiter, die Folgerung war
 * falsch: er verlangt getrennte MELDUNGEN, nicht getrenntes Gerüst. Das
 * Gerüst steht seit P8 einmal in `gegenAbgleich`, und `was` steht in jeder
 * Zeile, die es schreibt — „Leas Reihen, nMal: der Abgleich sagt …".
 */
{
  const v = R.reihenVorrat();
  const zaehl = (a) => v.filter(x => x.rechenart === a).length;
  const ist = gegenAbgleich('Leas Reihen', {
    von:        'Reihen von',
    bis:        'Reihen bis',
    geteilt:    'Anteil Division',
    geteiltMax: 'Anteil Division höchstens',
    nMal:       'Aufgaben mit Mal',
    nZehner:    'Aufgaben mit Zehn',
    nGeteilt:   'Aufgaben mit Geteilt',
    nLeicht:    'Leichtere Aufgaben',
  }, () => ({
    von:        R.REIHEN[0],
    bis:        R.REIHEN[R.REIHEN.length - 1],
    geteilt:    Math.round(R.GETEILT_STANDARD * 100),
    geteiltMax: Math.round(R.GETEILT_HOECHSTENS * 100),
    nMal:       zaehl('mal'),
    nZehner:    zaehl('zehner'),
    nGeteilt:   zaehl('geteilt'),
    nLeicht:    zaehl('leicht'),
  }));
  if (ist) {

      /* Die Mischung muss an JEDER Reglerstellung aufgehen.
       *
       * Vier Anteile, die zusammen 1 ergeben müssen, ergeben irgendwann
       * nicht mehr 1 — deshalb sind drei davon abgeleitet. Geprüft wird
       * es trotzdem: eine Ableitung, die niemand nachrechnet, ist eine
       * Behauptung.
       */
      for (let g = 0; g <= 100; g += 5) {
        const m = R.mischungLea(g / 100);
        const summe = Object.values(m).reduce((a, b) => a + b, 0);
        pruefe(Math.abs(summe - 1) < 1e-9,
          `Leas Mischung bei ${g} % Division ergibt ${summe.toFixed(4)} statt 1`);
        pruefe(m.geteilt <= R.GETEILT_HOECHSTENS + 1e-9,
          `Der Regler lässt bei ${g} % ${Math.round(m.geteilt * 100)} % Division zu — `
          + `höchstens sind ${Math.round(R.GETEILT_HOECHSTENS * 100)} %`);
        pruefe(Object.values(m).every(x => x >= 0),
          `Leas Mischung bei ${g} % hat einen negativen Anteil`);
      }

      // „weniger × 10" — und zwar nachgerechnet, nicht behauptet. Von
      // Natur aus steckt in 14 der 50 Reihenaufgaben eine Zehn; ein Anteil,
      // der nicht darunter liegt, hat nichts verringert.
      const natuerlich = ist.nZehner / (ist.nMal + ist.nZehner);
      pruefe(R.ANTEIL_ZEHNER < natuerlich,
        `Die Zehnerreihe soll seltener drankommen: von Natur aus `
        + `${Math.round(natuerlich * 100)} %, eingestellt sind `
        + `${Math.round(R.ANTEIL_ZEHNER * 100)} %`);

      // Jede Division geht auf, jede Zahl bleibt sagbar.
      const krumm = v.filter(x => !Number.isInteger(x.wert));
      pruefe(krumm.length === 0,
        `${krumm.length} Aufgaben gehen nicht auf, z. B. ${krumm[0]?.frage}`);
      pruefe(v.every(x => x.wert >= 0 && x.wert <= 100),
        'eine Aufgabe verlässt den Zahlenraum bis 100');

      // Kennungen: innerhalb Leas Vorrat und gegen Fionas.
      pruefe(new Set(v.map(x => x.id)).size === v.length,
        'zwei von Leas Aufgaben haben dieselbe Kennung');
      const fionaIds = new Set(R.vorrat().map(x => x.id));
      const doppelt = v.filter(x => fionaIds.has(x.id));
      pruefe(doppelt.length === 0,
        `${doppelt.length} Kennungen kommen in beiden Fächern vor (${doppelt[0]?.id}) — `
        + 'im Elternprotokoll stünde dann die falsche Aufgabe');

      console.log(`    Leas Reihen: ${v.length} Aufgaben `
        + `(${ist.nMal} mal, ${ist.nZehner} mit Zehn, ${ist.nGeteilt} geteilt, `
        + `${ist.nLeicht} leicht), Reihen ${ist.von} bis ${ist.bis}, `
        + `${100 - ist.geteilt}/${ist.geteilt} Prozent — wie im Abgleich`);
  }
}

/* Der Vorrat der Eltern gegen die Tabelle im Backlog (R4).
 *
 * Die Zahlen 72 · 14 · 72 stehen an ZWEI Orten: in `rechnen.js` als Regel
 * und im Konzept als Tabelle. Genau dafuer ist dieses Tor da - was zweimal
 * dasteht, veraltet einmal (Regel 6).
 *
 * Und die Begrenzung ist keine Schoenheit, sondern die Zusage, an der drei
 * Dinge haengen: das Forscherbuch zeichnet jeden Gegenstand einer Ebene,
 * `spielprobe` rechnet jeden nach, und der Leitner braucht Wiederholung.
 * Ein Vorrat, der still auf Zehntausende waechst, bricht alle drei.
 */
{
  const BACKLOG = 'docs/Lernkiste-BACKLOG.md';
  if (fs.existsSync(BACKLOG)) {
    const doc = fs.readFileSync(BACKLOG, 'utf8');
    const v = R.grossVorrat();
    const ist = {};
    for (const x of v) ist[x.rechenart] = (ist[x.rechenart] || 0) + 1;
    // Die Tabelle im Dokument lesen, nicht die Zahlen hier hinschreiben.
    const ausDoc = {};
    for (const [, sorte, n] of doc.matchAll(
        /\|\s*`(mal-gross|quadrat|geteilt-gross)`\s*\|[^|]*\|[^|]*\|\s*(\d+)\s*\|/g))
      ausDoc[sorte] = +n;
    pruefe(Object.keys(ausDoc).length === 3,
      `${BACKLOG}: die Tabelle mit den drei Sorten ist nicht zu finden — `
      + 'dann vergleicht dieses Tor nichts');
    for (const [sorte, soll] of Object.entries(ausDoc))
      pruefe(ist[sorte] === soll,
        `Eltern: ${ist[sorte] ?? 0} Aufgaben der Sorte „${sorte}", im Abgleich stehen ${soll}`);
    const gesamt = Object.values(ausDoc).reduce((a, b) => a + b, 0);
    pruefe(v.length === gesamt,
      `Eltern: ${v.length} Aufgaben insgesamt, im Abgleich stehen ${gesamt}`);
    pruefe(new Set(v.map(x => x.id)).size === v.length,
      'zwei Aufgaben der Eltern haben dieselbe Kennung');
    // Und gegen die anderen beiden Faecher: eine geteilte Kennung teilt
    // einen Leitner-Stand.
    const fremd = new Set([...R.vorrat(), ...R.reihenVorrat()].map(x => x.id));
    const doppelt2 = v.filter(x => fremd.has(x.id));
    pruefe(doppelt2.length === 0,
      `${doppelt2.length} Kennungen der Eltern kommen in einem anderen Fach vor `
      + `(${doppelt2[0]?.id})`);
    // Die Division muss aufgehen - sie entsteht als Umkehrung.
    pruefe(v.filter(x => x.rechenart === 'geteilt-gross').every(x => Number.isInteger(x.wert)),
      'eine der Divisionen der Eltern geht nicht auf');
    if (gesamt) console.log(`    Rechnen für Eltern: ${v.length} Aufgaben `
      + Object.entries(ist).map(([s, n]) => `(${n} ${s})`).join(' ')
      + ' — wie im Abgleich');
  }
}

/* Die Kette in CLAUDE.md gegen die Kette, die wirklich gefahren wird.
 *
 * Beim Audit standen in CLAUDE.md zwölf Tore und in `npm run tor` liefen
 * vierzehn: `rhythmus`, `spielprobe`, `budget`, `passt`, `lesbarkeit` und
 * `ziehen` sind dazugekommen, ohne dass die Datei es erfahren haette. Wer
 * die Datei liest - und sie wird zu Beginn JEDER Sitzung gelesen - haelt
 * sechs Tore fuer nicht vorhanden.
 *
 * Verglichen werden Mengen, nicht Reihenfolgen: die Reihenfolge steht in
 * `tor/kette-liste.mjs` und braucht keine zweite Fassung. Was zaehlt, ist,
 * dass kein Tor fehlt und keines erfunden ist. Regel 6.
 *
 * Bis P1 stand die Kette als `&&`-Zeile in package.json und wurde hier
 * daraus gelesen. Seit die Browsertore nebeneinander laufen, ist sie eine
 * Liste - und diese Pruefung liest DIESELBE Liste, die `tools/kette.mjs`
 * faehrt. Eine zweite Abschrift waere genau der Fehler, den dieses Tor
 * fangen soll.
 */
/* KEIN TOR VOR DEM BAU LIEST `dist/` (I23).
 *
 * Der Bau steht mitten in der Kette; alles davor prueft die Quelle,
 * alles danach die gebaute Datei. Diese Trennung stand bisher nur als
 * Absatz in `kette-liste.mjs` - und ein Absatz haelt nichts.
 *
 * Gebrochen hat sie `inhalt` selbst: seit I22 las eine seiner sechzehn
 * Pruefungen die Paartafel aus `dist/index.html`. Hier lag immer ein
 * `dist/` von vorhin, auf dem Runner nie - dort brach das Tor mit
 * „ENOENT" ab und riss die Kette eine Sekunde nach dem Start mit. Vier
 * Fassungen lang kam nichts bei den Kindern an, und keine einzige
 * Pruefung hier hat es gesagt.
 *
 * Gesucht wird die Zeichenkette `dist/` in der Datei jedes Tores VOR
 * dem Bau. Das ist grob und genau richtig grob: wer sie erwaehnt, hat
 * dort etwas zu suchen, was es noch nicht gibt. */
{
  const vorm_bau = [];
  for (const t of OHNE_BROWSER) {
    if (!t.datei || !fs.existsSync(t.datei)) continue;
    const roh = fs.readFileSync(t.datei, 'utf8');
    /* Kommentare heraus: sie erklaeren die Regel und wuerden sie
       gleichzeitig brechen lassen. */
    const ohne = roh.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    if (/['"`]dist\//.test(ohne)) vorm_bau.push(t.name);
  }
  if (vorm_bau.length)
    fehler.push(`${vorm_bau.join(', ')} ${vorm_bau.length === 1 ? 'läuft' : 'laufen'} `
      + 'VOR dem Bau und liest `dist/` — dort gibt es die Datei noch nicht. '
      + 'Hier steht immer eine von vorhin, auf dem Runner nie: das Tor bricht '
      + 'dort ab und reißt die Kette mit');
  else
    console.log(`    ${OHNE_BROWSER.length} Tore vor dem Bau, keines liest \`dist/\``);
}

const ANWEISUNG = 'CLAUDE.md';
if (!fs.existsSync(ANWEISUNG)) {
  fehler.push(`${ANWEISUNG} nicht gefunden — die Kette lässt sich nicht vergleichen`);
} else {
  const echt = new Set(KETTE);
  // Manche Tore tragen weitere in sich: `inhalt` faehrt sieben, `pwa` zwei.
  // Sie stehen zu Recht in CLAUDE.md, aber in keiner Zeile von package.json.
  // Gezaehlt werden sie da, wo sie sich melden - an ihrer eigenen
  // Ueberschrift -, nicht in einer dritten Liste, die wieder veralten kann.
  for (const t of [...echt]) {
    const datei = `tor/${t}.mjs`;
    if (!fs.existsSync(datei)) continue;
    for (const m of fs.readFileSync(datei,'utf8')
      .matchAll(/console\.log\('\\n  Tor `([a-zäöüß-]+)`/g)) echt.add(m[1]);
  }
  const text = fs.readFileSync(ANWEISUNG,'utf8');
  const zeile = text.match(/^Kette:[\s\S]*?\n\n/m);
  if (!zeile) fehler.push(`${ANWEISUNG} nennt keine Kette (Zeile „Kette: …")`);
  else {
    const genannt = new Set([...zeile[0].matchAll(/`([a-zäöüß-]+)`/g)].map(m => m[1]));
    const fehlt = [...echt].filter(t => !genannt.has(t));
    const zuviel = [...genannt].filter(t => !echt.has(t));
    if (fehlt.length) fehler.push(`${ANWEISUNG} kennt ${fehlt.length} Tore der Kette nicht: `
      + `${fehlt.join(', ')} — die Datei wird zu Beginn jeder Sitzung gelesen`);
    if (zuviel.length) fehler.push(`${ANWEISUNG} nennt ${zuviel.length} Tore, `
      + '`npm run tor` nicht fährt: ' + zuviel.join(', '));
    if (!fehlt.length && !zuviel.length)
      console.log(`    Kette stimmt: ${echt.size} Tore in CLAUDE.md und in tor/kette-liste.mjs`);
  }

  /* Die Vorschau darf nicht zur Auslieferung werden.
   *
   * `vorschau.yml` fährt nur die Tore ohne Browser - das ist der ganze
   * Sinn, anderthalb Minuten statt vier. Genau deshalb ist sie die
   * gefährlichste Datei im Baum: eine Abkürzung, die man versehentlich
   * nimmt, wäre keine Abkürzung, sondern das Ende der Torkette.
   *
   * Drei Zusagen werden hier festgehalten:
   *   1. Die Auslieferung fährt die Kette (`npm run tor:runner`) - seit P20
   *      im schnellen Gang, also OHNE die Browsertore. Was sie damit nicht
   *      mehr sieht, steht in CLAUDE.md; die Prüfung darunter hält es fest.
   *   2. Die Vorschau läuft nicht auf `main`.
   *   3. Was sie NICHT prüft, steht in ihr drin - namentlich, jedes Tor.
   *
   * Die dritte ist die wichtigste und die, die sonst verrottet: kommt ein
   * Tor dazu, fährt die Vorschau es nicht und verschweigt es. Wer dann
   * eine Vorschau ansieht, hält sie für geprüft.
   */
  const AUSL = '.github/workflows/auslieferung.yml';
  const VORS = '.github/workflows/vorschau.yml';
  const VERS = '.github/workflows/vorschau-versand.yml';
  if (fs.existsSync(VORS)) {
    const v = fs.readFileSync(VORS, 'utf8');
    const a = fs.existsSync(AUSL) ? fs.readFileSync(AUSL, 'utf8') : '';
    pruefe(/npm run tor:runner/.test(a),
      `${AUSL} fährt die Kette nicht mehr (\`npm run tor:runner\`)`);

    /* WAS DER SCHNELLE GANG NICHT SIEHT, MUSS DASTEHEN (P20).
     *
     * Seit der schnelle Gang der Standard ist, prüft ein gewöhnlicher Lauf
     * - und damit auch die Auslieferung - acht Tore nicht mehr. Das ist
     * eine Entscheidung und kein Versehen; gefährlich wird sie in dem
     * Augenblick, in dem jemand sie nicht mehr weiß.
     *
     * Dieselbe Bauart wie bei der Vorschau, und aus demselben Grund: eine
     * Abkürzung, die sich nicht nennt, ist keine Abkürzung mehr, sondern
     * eine Lücke. Kommt ein Browsertor dazu, fährt der schnelle Gang es
     * nicht und verschweigt es - genau das fängt diese Zeile.
     *
     * Geprüft wird gegen `kette-liste.mjs`, nicht gegen eine Liste hier:
     * eine zweite Liste veraltet einmal (Regel 6). */
    const schnellFehlt = [...MIT_BROWSER.map(t => t.name), 'vielfalt'];
    const stelle = text.match(/Was der schnelle Gang NICHT sieht[\s\S]{0,400}/);
    if (!stelle) fehler.push(`${ANWEISUNG} sagt nicht, was der schnelle Gang nicht sieht `
      + '— dann ist die Abkürzung eine Lücke (Absatz „Was der schnelle Gang NICHT sieht")');
    else {
      const stumm = schnellFehlt.filter(n => !stelle[0].includes(`\`${n}\``));
      pruefe(!stumm.length, `${ANWEISUNG} verschweigt ${stumm.length} Tore, die der `
        + `schnelle Gang nicht fährt: ${stumm.join(', ')} — wer einen grünen Lauf sieht, `
        + 'hält sie für geprüft');
      if (!stumm.length)
        console.log(`    Der schnelle Gang lässt ${schnellFehlt.length} Tore aus, `
          + 'alle in CLAUDE.md genannt');
    }
    pruefe(!/branches:\s*\[[^\]]*\bmain\b/.test(v),
      `${VORS} läuft auf \`main\` — dann geht Ungeprüftes dorthin, wo die Kinder spielen`);

    /* Wer nach Pages schickt, schickt BEIDE Hälften.
     *
     * Pages kennt eine Seite je Verzeichnis. Ein Ablauf, der nur seine
     * eigene Hälfte hochlädt, löscht die andere - die Auslieferung die
     * Vorschau, während jemand sie ansieht, oder der Versand der Vorschau
     * das Spiel der Kinder. Geprüft wird deshalb nicht, WER was tut,
     * sondern die Eigenschaft, die das verhindert: jede Datei, die einen
     * Pages-Anhang hochlädt, muss vorher `seite-zusammenstellen.mjs`
     * gerufen haben.
     */
    const ablaeufe = fs.readdirSync('.github/workflows')
      .filter(f => f.endsWith('.yml')).map(f => ['.github/workflows/' + f]);

    /* JEDER Ablauf, der baut, braucht die volle Historie (Q53).
     *
     * `bauen.mjs` nimmt die Fassungszahl aus `git rev-list --count HEAD`.
     * `actions/checkout` klont ohne `fetch-depth: 0` genau einen
     * Einchecker, die Zahl ist dann 1, und auf dem Geraet steht `v1`.
     * Von v117 bis v405 war das so - 288 Auslieferungen, kein Tor, kein
     * Zeuge; der Nutzer hat es gefunden und auf eine sehr alte Fassung
     * geschlossen.
     *
     * Der Bau bricht deshalb selbst ab, wenn der Klon flach ist. Diese
     * Pruefung sagt es aber SCHON HIER, wo eine Zeile die Ursache ist -
     * ein roter Runner nach vier Minuten sagt nur, dass etwas kaputt ist.
     * Geprueft wird die Eigenschaft, nicht der Name: wer baut, holt die
     * Historie. */
    for (const [datei] of ablaeufe) {
      const t = fs.readFileSync(datei, 'utf8');
      if (!/bauen\.mjs|npm run bauen|npm run tor/.test(t)) continue;
      const tief = t.replace(/^\s*#.*$/gm, '');   // Kommentare zaehlen nicht
      pruefe(/fetch-depth:\s*0/.test(tief),
        `${datei} baut, holt aber nur einen Einchecker — dann zaehlt `
        + '`rev-list --count HEAD` 1, und auf dem Gerät steht `v1` statt der Fassung '
        + '(`fetch-depth: 0` beim `actions/checkout`)');
    }
    for (const [datei] of ablaeufe) {
      const t = fs.readFileSync(datei, 'utf8');
      if (!/upload-pages-artifact/.test(t)) continue;
      pruefe(/tools\/seite-zusammenstellen\.mjs/.test(t),
        `${datei} lädt einen Pages-Anhang hoch, ohne die Seite zusammenzustellen — `
        + 'das löscht die andere Hälfte');
    }

    /* Und der Versand der Vorschau darf `/` nicht ungeprüft überschreiben.
     *
     * Er baut `main` neu, ohne die Kette zu fahren - das ist die
     * eingesparte Zeit. Also muss er NACHSEHEN, ob genau dieser Stand
     * schon einmal durchgegangen ist. Ohne den Schritt könnte eine
     * Vorschau einen roten `main`-Stand unter `/` schieben.
     */
    if (fs.existsSync(VERS)) {
      const w = fs.readFileSync(VERS, 'utf8');
      pruefe(/head_sha=/.test(w) && /auslieferung\.yml\/runs/.test(w),
        `${VERS} sieht nicht nach, ob dieser Stand von main die Kette bestanden hat — `
        + 'dann kann eine Vorschau Ungeprüftes unter `/` schieben');
      pruefe(/workflow_run/.test(w),
        `${VERS} wird nicht mehr durch \`workflow_run\` ausgelöst — nur so läuft er `
        + 'im Zusammenhang des Standardzweigs und darf überhaupt versenden');
      /* Nachsehen allein genügt nicht: das Ergebnis muss auch WIRKEN.
       *
       * Bis hierher prüfte dieses Tor nur, dass der Ablauf nachsieht. Seit
       * er wartet und bei rotem `main` still stehenbleibt, statt
       * durchzufallen, ist der Blick allein Zierrat: wer die Bedingung an
       * den Versandschritten löscht, schiebt Ungeprüftes unter `/`, und
       * die Suche nach `head_sha=` stünde weiter unschuldig daneben.
       *
       * Geprüft wird deshalb die Eigenschaft, auf die es ankommt: JEDER
       * Schritt, der nach Pages schickt, hängt an dem Ergebnis. */
      for (const [was, muster] of [['upload-pages-artifact', /upload-pages-artifact/],
                                   ['deploy-pages', /deploy-pages/]]) {
        if (!muster.test(w)) continue;
        const zeilen = w.split('\n');
        const i = zeilen.findIndex(z => muster.test(z));
        const umfeld = zeilen.slice(Math.max(0, i - 3), i + 4).join('\n');
        pruefe(/if:\s*steps\.kette\.outputs\.gruen/.test(umfeld),
          `${VERS}: der Schritt \`${was}\` hängt nicht am Ergebnis der Torkette — `
          + 'dann versendet er auch, wenn `main` rot ist');
      }
    }

    // Welche Tore fährt die Vorschau wirklich? Aus ihr gelesen, nicht geraten.
    const gefahren = new Set([...v.matchAll(/node tor\/([a-zäöüß-]+)\.mjs/g)].map(m => m[1]));
    for (const t of [...gefahren]) {
      const datei = `tor/${t}.mjs`;
      if (!fs.existsSync(datei)) continue;
      for (const m of fs.readFileSync(datei, 'utf8')
        .matchAll(/console\.log\('\\n  Tor `([a-zäöüß-]+)`/g)) gefahren.add(m[1]);
    }
    const ungeprueft = [...echt].filter(t => t !== 'bauen' && !gefahren.has(t));
    const verschwiegen = ungeprueft.filter(t => !new RegExp(`\\b${t}\\b`).test(v));
    pruefe(verschwiegen.length === 0,
      `${VORS} verschweigt ${verschwiegen.length} Tore, die sie nicht fährt: `
      + `${verschwiegen.join(', ')} — wer die Vorschau ansieht, hält sie für geprüft`);
    console.log(`    Vorschau: ${gefahren.size} Tore gefahren, `
      + `${ungeprueft.length} ausdrücklich genannt und ausgelassen`);
  }
}

/* ------------------------------------------------------------- Ergebnis */
console.log('');
hinweise.forEach(h=>console.log(`  Hinweis: ${h}`));
if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER:`);
  fehler.forEach(f=>console.log(`    ✗ ${f}`));
  process.exit(1);
}
// Die Zahl wird GEZAEHLT, nicht hingeschrieben: hier stand "Alle vier Tore
// grün", während längst sechs liefen. Eine Zahl, die niemand nachrechnet,
// veraltet still.
// `^\s*`, nicht `^`: das achte Tor (`abzeichen`) steht in einem Block und
// ist deshalb eingerueckt. Mit dem strengen Anker zaehlte die Zeile es
/* ====================================================== Tor `farben` ==== *
 *
 * Ein Kontinent hat EINE Farbe - auf der Kachel wie auf der Karte (QS8).
 *
 * Bis v358 hatte er zwei: die Kachel nahm ihren Ton aus ihrer Position in
 * der EBENEN-Liste (`farbe:[3,2,4,7,6][i%5]`), die Weltkarte aus ihrer
 * Position in der Geometrie (`FL[i%7]`). Sieben von sieben Kontinenten
 * sahen auf der Kachel anders aus als auf der Karte, und weil `i%5` ueber
 * sieben Eintraege laeuft, teilten sich zwei Paare einen Ton.
 *
 * WORAN DIESE PRUEFUNG FAST GESCHEITERT WAERE. Der erste Anlauf rechnete
 * beide Seiten aus `I.KONTINENTE` aus - also aus DERSELBEN Liste. Damit
 * verglich er eine Zahl mit sich selbst und konnte nie rot werden; die
 * Gegenprobe hat genau das gemeldet. Eine Pruefung, die nie etwas meldet,
 * ist kein Beweis (Regel 1), und der billigste Weg dorthin ist, das
 * Gemessene aus derselben Quelle zu holen wie das Soll (Regel 14: das
 * Modell darf nicht vom Gemessenen abhaengen).
 *
 * Geprueft wird deshalb der QUELLTEXT, in dem die Kachelfarbe entsteht -
 * `prototyp/spiel.js`. Zwei Zusagen, beide sind einzeln zu brechen:
 *   1. die Laenderebenen nehmen `KONT_FARBE[...]`, keine feste Liste
 *   2. `KONT_FARBE` wird aus `D.kontinente` gerechnet, also aus genau der
 *      Reihenfolge, in der die Weltkarte ihre Flaechen einfaerbt
 * Faellt eine davon, faellt die Farbgleichheit - und zwar unsichtbar,
 * solange niemand Kachel und Karte nebeneinander legt. Kein Tor ersetzt
 * den Blick (Regel 4): gefunden hat den Bruch der Blick auf zwei
 * Aufnahmen, nicht eine Pruefung. Das hier ist der Teil davon, den eine
 * Maschine ab jetzt haelt.
 */
console.log('\n  Tor `farben`');
{
  const quelle = fs.readFileSync('prototyp/spiel.js', 'utf8');
  const schief = [];

  const ebenenZeile = quelle.match(/id:`laender:\$\{k\}`[\s\S]{0,200}?farbe:\s*([^,\n}]+)/);
  if (!ebenenZeile)
    schief.push('die Laenderebenen sind nicht mehr zu finden — diese Pruefung misst nichts');
  else if (!/KONT_FARBE/.test(ebenenZeile[1]))
    schief.push(`die Kachel nimmt wieder einen eigenen Ton: farbe: ${ebenenZeile[1].trim()}`
      + ' — auf der Karte steht der Kontinent dann anders da als auf seiner Kachel');

  const quell = quelle.match(/const KONT_FARBE = ([\s\S]{0,200}?);/);
  if (!quell)
    schief.push('`KONT_FARBE` gibt es nicht mehr — die Kachelfarbe kommt von woanders');
  else if (!/D\.kontinente/.test(quell[1]))
    schief.push('`KONT_FARBE` wird nicht mehr aus `D.kontinente` gerechnet — '
      + 'die Kachel folgt der Karte nur noch zufaellig');

  if (schief.length) {
    console.log('    ' + schief.join('\n    '));
    console.error('\n  farben ROT: ein Kontinent sieht auf der Kachel anders aus als auf der Karte.');
    process.exit(1);
  }
  const toene = I.KONTINENTE.map((k, i) => (i % 7) + 1);
  console.log(`    ${I.KONTINENTE.length} Kontinente, Kachelton aus der Kartenreihenfolge, `
    + `${new Set(toene).size} verschiedene Toene`);
}

/* ==================================================== Tor `englisch` ==== *
 *
 * Der Wortschatz in `src/inhalt/englisch.js` ist der amtliche - Wort fuer
 * Wort.
 *
 * Verglichen wird gegen die QUELLE und nicht gegen sich selbst: neben den
 * Daten liegt `docs/referenz/ISB-Englisch-Wortschatz-34.txt`, der Text der
 * PDF des ISB. Dieses Tor liest beide und haelt sie nebeneinander. Damit
 * kann die Datendatei nicht still abweichen, und niemand muss sich darauf
 * verlassen, dass ich richtig abgeschrieben habe.
 *
 * Genau dieser Fehler war bei `farben` schon einmal da: der erste Anlauf
 * rechnete beide Seiten aus DERSELBEN Liste und konnte nie rot werden
 * (Regel 14 - das Modell darf nicht vom Gemessenen abhaengen). Bei
 * Vokabeln waere er teurer: eine erfundene Zeile faellt erst auf, wenn Lea
 * in der Schule etwas anderes lernt.
 *
 * GELESEN WIRD SPALTENWEISE, nicht nach Nummer. Die amtliche Liste
 * nummeriert von 1 bis 151, laesst dabei aber die 29 aus und vergibt die
 * 39 zweimal („39. cold" und „39. England/English"). Wer nach Nummer
 * liest, bekommt 150 Woerter und eine Kollision; wer den sechs Spalten
 * folgt, bekommt die 151, die dastehen.
 */
console.log('\n  Tor `englisch`');
{
  const QUELLE = 'docs/referenz/ISB-Englisch-Wortschatz-34.txt';
  const schief = [];
  if (!fs.existsSync(QUELLE)) {
    schief.push(`${QUELLE} fehlt — dann vergleicht dieses Tor die Daten mit sich selbst`);
  } else {
    const roh = fs.readFileSync(QUELLE, 'utf8');
    /* Sechs Spalten je Zeile, jede Zelle „N. wort". Ein Wort kann Leer- und
       Sonderzeichen tragen („be (am, are, is)", „I / I'd / I'm / I've"),
       deshalb bis zum naechsten „N. " und nicht bis zum Leerzeichen. */
    const spalten = [[], [], [], [], [], []];
    for (const z of roh.split('\n')) {
      const tr = [...z.trim().matchAll(/\d{1,3}\.\s+(.+?)(?=\s+\d{1,3}\.\s|$)/g)]
        .map(m => m[1].trim());
      if (tr.length < 2) continue;
      tr.forEach((w, i) => { if (i < 6) spalten[i].push(w); });
    }
    const ausQuelle = spalten.flat();
    if (ausQuelle.length < 100) {
      schief.push(`aus ${QUELLE} sind nur ${ausQuelle.length} Wörter zu lesen — `
        + 'die Datei ist kaputt oder anders aufgebaut, und dieses Tor prüft nichts');
    } else {
      const zuviel = EN.WOERTER.filter(w => !ausQuelle.includes(w));
      const fehlt  = ausQuelle.filter(w => !EN.WOERTER.includes(w));
      if (zuviel.length)
        schief.push(`${zuviel.length} Wörter stehen in den Daten, aber nicht in der `
          + `amtlichen Liste: ${zuviel.slice(0, 5).join(', ')}`);
      if (fehlt.length)
        schief.push(`${fehlt.length} Wörter der amtlichen Liste fehlen in den Daten: `
          + `${fehlt.slice(0, 5).join(', ')}`);
      if (EN.WOERTER.length !== ausQuelle.length)
        schief.push(`die Daten haben ${EN.WOERTER.length} Wörter, die Quelle `
          + `${ausQuelle.length}`);
      /* Die Reihenfolge zaehlt mit: die Quelle ist alphabetisch, und eine
         umsortierte Datei waere der erste Schritt zu „ich habe da mal
         aufgeraeumt". */
      const ersteAbweichung = EN.WOERTER.findIndex((w, i) => w !== ausQuelle[i]);
      if (!zuviel.length && !fehlt.length && ersteAbweichung >= 0)
        schief.push(`ab Stelle ${ersteAbweichung + 1} stehen die Wörter in anderer `
          + `Reihenfolge als in der Quelle („${EN.WOERTER[ersteAbweichung]}" statt `
          + `„${ausQuelle[ersteAbweichung]}")`);
    }
    /* Zahlen und Waehrung stehen als SATZ in der Quelle, nicht als Liste -
       geprueft wird deshalb, dass der Satz noch dasselbe sagt. */
    const zahlSatz = roh.match(/(\d+)\s+Zahlen\s*\(([^)]+)\)/);
    if (!zahlSatz) schief.push('der Satz über die Zahlen steht nicht mehr in der Quelle');
    else if (+zahlSatz[1] !== EN.ZAHLEN.length)
      schief.push(`die Quelle nennt ${zahlSatz[1]} Zahlen, die Daten haben `
        + `${EN.ZAHLEN.length}`);
  }
  const doppelt = EN.WOERTER.filter((w, i) => EN.WOERTER.indexOf(w) !== i);
  if (doppelt.length) schief.push(`doppelte Wörter: ${doppelt.join(', ')}`);
  const leer = EN.WOERTER.filter(w => !w || !w.trim());
  if (leer.length) schief.push(`${leer.length} leere Einträge`);

  /* Die vier Themengebiete, gegen die ZWEITE amtliche Datei.
   *
   * Geprueft wird jeder Satz einzeln: steht er so in der Quelle? Damit
   * faengt das Tor auch den Fall, der bei Redemitteln am naechsten liegt -
   * dass jemand ein „…" auffuellt oder eine Frage glattzieht, weil sie
   * unfertig aussieht. Sie ist nicht unfertig; die Luecke ist der Inhalt. */
  const QUELLE2 = 'docs/referenz/ISB-Englisch-Redemittel-34.txt';
  if (!fs.existsSync(QUELLE2)) {
    schief.push(`${QUELLE2} fehlt — dann sind die Themengebiete ungeprüft`);
  } else {
    /* Die Quelle traegt weiche Anfuehrungszeichen und Zeilenumbrueche
       mitten im Satz. Verglichen wird deshalb ueber eine geglaettete
       Fassung - Umbrueche zu Leerzeichen, Apostrophe vereinheitlicht. */
    const glatt = (t) => t.replace(/[\u2018\u2019\u00b4]/g, "'").replace(/\s+/g, ' ');
    const roh2 = glatt(fs.readFileSync(QUELLE2, 'utf8'));
    if (EN.THEMENGEBIETE.length !== 4)
      schief.push(`${EN.THEMENGEBIETE.length} Themengebiete statt der vier des Lehrplans`);
    for (const g of EN.THEMENGEBIETE) {
      if (!roh2.includes(glatt(`${g.nr} ${g.titel}`)))
        schief.push(`das Themengebiet „${g.nr} ${g.titel}" steht nicht in der Quelle`);
      if (!g.handlungen.length)
        schief.push(`„${g.titel}" hat keine Sprachhandlung — ein leeres Themengebiet`);
      for (const h of g.handlungen) {
        if (!h.saetze.length)
          schief.push(`„${g.titel}" / „${h.was}" hat kein einziges Redemittel`);
        for (const satz of h.saetze)
          if (!roh2.includes(glatt(satz)))
            schief.push(`dieses Redemittel steht nicht in der Quelle: „${satz.slice(0, 60)}"`);
      }
    }
  }

  if (schief.length) {
    console.log('    ' + schief.join('\n    '));
    console.error('\n  englisch ROT: die Daten weichen von den amtlichen Listen ab.');
    process.exit(1);
  }
  const handlungen = EN.THEMENGEBIETE.reduce((n, g) => n + g.handlungen.length, 0);
  const saetze = EN.THEMENGEBIETE.reduce((n, g) =>
    n + g.handlungen.reduce((m, h) => m + h.saetze.length, 0), 0);
  console.log(`    ${EN.WOERTER.length} Wörter, ${EN.ZAHLEN.length} Zahlen, `
    + `${EN.WAEHRUNG.length} Währungszeichen — Wort für Wort wie in der ISB-Liste`);
  console.log(`    ${EN.THEMENGEBIETE.length} Themengebiete, ${handlungen} Sprachhandlungen, `
    + `${saetze} Redemittel — Satz für Satz wie in der Redemittel-Liste`);
  console.log('    (kein Wort trägt ein Themengebiet — die Zuordnung steht in keiner '
    + 'der beiden Quellen)');

  /* Die Ablenkerprobe - EINMAL fuer beide Ebenen, die vier Kaesten zeigen.
   *
   * „Hoeren und zeigen" (E3) und „Lies das Wort" (E7) stellen dieselbe
   * Frage an ihren Vorrat: kommen drei Ablenker heraus, ist das Ziel
   * nicht darunter, und taugt jeder einzelne als Kasten? Sie stand nach
   * E7 zweimal Zeile fuer Zeile da, und `doppelt` hat es im selben Lauf
   * gemeldet - was zweimal dasteht, veraltet einmal (Regel 6).
   *
   * Was die Ebenen unterscheidet, ist die Frage an den EINZELNEN Ablenker,
   * und die kommt deshalb als `jeder` von aussen: beim Hoeren muss er die
   * Sorte des Ziels haben, beim Lesen eine Zeichnung. Eine Liste hier
   * waere die zweite Fassung derselben Auskunft.
   *
   * Der Wuerfel ist ein fester: dieselbe Auswahl bei jedem Lauf, sonst
   * meldete das Tor mal etwas und mal nicht - und eine Pruefung, die
   * wuerfelt, ob sie prueft, ist kein Beweis (Regel 1).
   */
  /* CIELAB, von Hand: sRGB -> linear -> XYZ (D65) -> Lab. Zwanzig Zeilen
     statt einer Abhaengigkeit, und sie stehen hier statt in den Daten -
     ein Tor, das seine Formel aus dem Prüfling holt, prüft sie nicht.
     ZWEI ZUSAGEN BRAUCHEN SIE: der Mindestabstand der zehn Farbflecken
     (E3) und die Frage, ob zwei Bildfarben derselbe Ton sind (E7c).
     Deshalb steht sie hier und nicht in einer der beiden - was zweimal
     dasteht, veraltet einmal (Regel 6). */
  const linear = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92
    : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lab = (hex) => {
    const r = linear(parseInt(hex.slice(1, 3), 16)),
          g = linear(parseInt(hex.slice(3, 5), 16)),
          b = linear(parseInt(hex.slice(5, 7), 16));
    const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const Y =  0.2126 * r + 0.7152 * g + 0.0722 * b;
    const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = (u) => u > 0.008856 ? Math.cbrt(u) : 7.787 * u + 16 / 116;
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  };
  const labAbstand = (hexA, hexB) => {
    const a = lab(hexA), b = lab(hexB);
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  };

  /* IST DAS EINE KOPIE? Nicht „sieht aehnlich aus" - das messen die
     Raster weiter unten -, sondern: ist es DIESELBE Zeichnung, nur
     umgefaerbt und ein Stueck verschoben?
     
     GEMESSEN WIRD AN DEN PFADEN und nicht am Raster, und das ist ein
     Befund: der erste Anlauf hat eine „Flaechenkarte" gebaut (je Zelle die
     Nummer der Flaeche statt ihrer Farbe) und ist daran gescheitert - eine
     um zwei Punkte verschobene Erdbeere kam auf 73 % Uebereinstimmung,
     „happy" gegen „sad" auf 92 %. Ein 24x24-Raster kann eine verschobene
     Kopie nicht von zwei Bildern derselben Bauart unterscheiden; drei
     Prozent Versatz sind darin schon eine halbe Zelle.

     Die Bauart eines Pfades - seine Befehlsfolge und die ANZAHL seiner
     Zahlen - trennt es dagegen scharf: im ganzen Bildvorrat sind nur VIER
     von 3486 Paaren gleich gebaut, und alle vier stehen auf dem Blatt
     „Wo?", wo dieselbe Kiste und derselbe Ball die Lehre sind. Ihr
     kleinster Abstand ist 10. */
  const pfadBauart = (d) => {
    const teile = String(d).match(/[A-Za-z]|-?\d*\.?\d+/g) || [];
    return { befehle: teile.filter(t => /[A-Za-z]/.test(t)).join(''),
             zahlen: teile.filter(t => !/[A-Za-z]/.test(t)).map(Number) };
  };
  /** Groesster Zahlenabstand zweier GLEICH GEBAUTER Bilder - sonst `null`. */
  const kopieAbstand = (A, B) => {
    if (!A || !B || A.length !== B.length || !A.length) return null;
    let groesst = 0;
    for (let i = 0; i < A.length; i++) {
      const a = pfadBauart(A[i].d), b = pfadBauart(B[i].d);
      if (a.befehle !== b.befehle || a.zahlen.length !== b.zahlen.length) return null;
      for (let k = 0; k < a.zahlen.length; k++)
        groesst = Math.max(groesst, Math.abs(a.zahlen[k] - b.zahlen[k]));
    }
    return groesst;
  };
  /* Fuenf, und nicht zehn: die Haelfte des Abstands zum naechsten
     berechtigten Fall. Ein Versatz bis zu fuenf Punkten - acht Prozent des
     Rahmens - ist eine verschobene Kopie und keine zweite Zeichnung. */
  const KOPIE_ABSTAND = 5;

  const ablenkerPruefen = (vorrat, melde, jeder = () => null) => {
    for (const x of vorrat) {
      let k = 1;
      const w = () => { k = (k * 1664525 + 1013904223) >>> 0; return k / 4294967296; };
      const ab = EN.ablenkerFuer(x, w);
      if (ab.length !== 3) melde(`„${x.wort}" bekommt ${ab.length} Ablenker statt drei`);
      if (ab.some(y => y.id === x.id)) melde(`„${x.wort}" steht unter seinen eigenen Ablenkern`);
      for (const y of ab) { const satz = jeder(x, y); if (satz) melde(satz); }
    }
  };

  /* ---- Der Vorrat von „Hoeren und zeigen" (E3, Tor E-a in klein) -------
   *
   * Die Ebene fragt 25 Gegenstaende ab. Geprueft wird hier dreierlei, und
   * jedes einzeln, weil jedes fuer sich schiefgehen kann:
   *
   *   1. JEDER GEGENSTAND STEHT IM AMTLICHEN WORTSCHATZ. Ein Farbwort, das
   *      nicht in WOERTER steht, waere erfunden - und weil WOERTER selbst
   *      gegen die PDF geprueft ist, haengt diese Kette an der Quelle und
   *      nicht an mir.
   *   2. JEDER HAT EIN BILD. Ohne Bild waere die Moeglichkeit ein leerer
   *      Kasten, und fuer ein Kind, das nicht liest, die Ebene unbedienbar.
   *   3. DIE ZEHN FARBEN SIND AUSEINANDERZUHALTEN. Das ist die einzige
   *      Zusage dieser Ebene, die man nicht ansieht, sondern rechnet:
   *      liegen zwei Farben zu nah beieinander, ist die Aufgabe nicht zu
   *      loesen, egal wie gut jemand Englisch kann. Gemessen als
   *      CIELAB-Abstand - eine Formel von aussen, nicht meine Schaetzung
   *      (Regel 14: das Modell darf nicht vom Gemessenen abhaengen).
   */
  {
    const eng = [];
    const vorrat = EN.vorratHoeren();
    for (const f of EN.FARBEN)
      if (!EN.WOERTER.includes(f.wort))
        eng.push(`die Farbe „${f.wort}" steht nicht im amtlichen Wortschatz`);
    for (const z of EN.ZAHLEN)
      if (!EN.ZAHLWORT[z]) eng.push(`die Zahl ${z} hat kein englisches Zahlwort`);
    for (const x of Object.keys(EN.ZAHLWORT))
      if (!EN.ZAHLEN.includes(+x))
        eng.push(`„${EN.ZAHLWORT[x]}" steht als Zahlwort da, aber ${x} ist keine `
          + 'Zahl der amtlichen Liste');
    /* DREI SORTEN SEIT E13, nicht mehr zwei.
     *
     * Der Hoervorrat war die Summe aus Farben und Zahlen - fuenfundzwanzig
     * Gegenstaende fuer die beiden Fertigkeiten, auf die es in der dritten
     * Klasse ankommt. Dazu kommen jetzt die gezeichneten Woerter; jedes
     * von ihnen hat ein Bild, sonst waere es nicht gezeichnet.
     *
     * Gerechnet statt gezaehlt: die Zahl steht nicht hier, sondern ergibt
     * sich aus den drei Listen. Wer ein Bild dazumalt, aendert sie mit -
     * eine feste Zahl waere in einer Woche falsch (Regel 2: anteilig, nicht
     * absolut). */
    const gemalt = EN.BILDER.filter(b => b.bild).length;
    const sollVorrat = EN.FARBEN.length + EN.ZAHLEN.length + gemalt;
    if (vorrat.length !== sollVorrat)
      eng.push(`der Hörvorrat hat ${vorrat.length} Gegenstände, erwartet waren `
        + `${sollVorrat} (${EN.FARBEN.length} Farben, ${EN.ZAHLEN.length} Zahlen, `
        + `${gemalt} Zeichnungen)`);
    const ids = new Set(vorrat.map(x => x.id));
    if (ids.size !== vorrat.length)
      eng.push(`der Hörvorrat hat doppelte Kennungen — der Leitner führte sie als eine`);
    /* UND DIE WOERTER DUERFEN SICH NICHT DOPPELN (E13).
       Dasselbe Bild liegt unter zwei Kennungen (`en:bild:cat` gegen
       `ls:cat`) - im Hoervorrat selbst darf „cat" trotzdem nur einmal
       stehen, sonst kaeme es als sein eigener Ablenker zurueck. */
    const woerter = new Set(vorrat.map(x => x.wort));
    if (woerter.size !== vorrat.length)
      eng.push(`der Hörvorrat nennt ${vorrat.length - woerter.size} Wörter doppelt — `
        + 'eines davon stünde als sein eigener Ablenker daneben');
    for (const x of vorrat) {
      if (!x.farbton && !x.ziffern && !x.bild)
        eng.push(`„${x.wort}" hat kein Bild — vier leere Kästen sind keine Aufgabe`);
      if (!x.wort) eng.push(`ein Gegenstand ohne Wort: ${x.id}`);
      if (!['farbe', 'zahl', 'bild'].includes(x.sorte))
        eng.push(`„${x.wort}" hat die Sorte „${x.sorte}" — dann kommen die Ablenker `
          + 'aus der falschen Menge');
    }
    /* Die Ablenker: drei, aus derselben Sorte, nie das Ziel selbst.
       Geprueft an JEDEM Gegenstand und nicht an einem Beispiel - die
       Zahlen sind 15, die Farben 10, und bei kleiner Menge geht so etwas
       zuerst kaputt. */
    ablenkerPruefen(vorrat, (s) => eng.push(s), (x, y) => y.sorte !== x.sorte
      && `„${x.wort}" bekommt einen Ablenker anderer Sorte — dann ist die `
         + 'Aufgabe ohne ein Wort Englisch zu lösen');
    let engster = Infinity, engstesPaar = '';
    for (let i = 0; i < EN.FARBEN.length; i++)
      for (let j = i + 1; j < EN.FARBEN.length; j++) {
        const d = labAbstand(EN.FARBEN[i].farbton, EN.FARBEN[j].farbton);
        if (d < engster) { engster = d; engstesPaar = `${EN.FARBEN[i].wort}/${EN.FARBEN[j].wort}`; }
      }
    /* 25 und nicht 31,3 (der gemessene Wert): eine Ratsche mit Luft. Bei
       25 liegen zwei Farben noch klar auseinander - der Schwellwert faengt
       das Hinzufuegen einer elften Farbe, die neben einer der zehn liegt,
       und nicht das Nachjustieren eines Tons um zwei Prozent. */
    const ENGSTER_MIN = 25;
    if (!(engster >= ENGSTER_MIN))
      eng.push(`die engsten zwei Farben (${engstesPaar}) liegen nur ${engster.toFixed(1)} `
        + `CIELAB auseinander, nötig sind ${ENGSTER_MIN} — die Aufgabe wäre nicht lösbar`);
    if (!EN.FARBEN.every(f => /^#[0-9a-f]{6}$/.test(f.farbton)))
      eng.push('nicht jede Farbe hat einen lesbaren Wert der Form #rrggbb');

    if (eng.length) {
      console.log('    ' + eng.join('\n    '));
      console.error('\n  englisch ROT: der Hörvorrat von „Hören und zeigen" stimmt nicht.');
      process.exit(1);
    }
    /* DIE THEMENZUORDNUNG (E14).
     *
     * Sie ist gesetzt und nicht amtlich - genau deshalb steht sie hier.
     * Was eine Behoerde vorgibt, prueft man gegen ihre Datei; was man
     * selbst entschieden hat, prueft man gegen seine eigene Zusage, und
     * die lautet: jedes der 151 Woerter genau einmal, und jedes
     * Themengebiet traegt genug gezeichnete Woerter fuer eine Ebene.
     *
     * Die zwoelf sind dieselbe Zahl wie in `wenn` bei den vier Ebenen -
     * und sie steht hier NICHT noch einmal, sondern wird von dort
     * gelesen waere schoener; sie steht in `spiel.js`, das dieses Tor
     * nicht laedt. Also steht sie zweimal, und die Gegenprobe haelt
     * beide zusammen: sie setzt die Zahl hier herunter und verlangt,
     * dass das Tor es sagt. */
    const THEMA_MIN = 12;
    const themen = EN.THEMENGEBIETE.map(t => t.nr);
    const doppelt = [], ohne = [];
    for (const w of EN.WOERTER) {
      const n = themen.filter(nr => (EN.THEMA_WOERTER[nr] || []).includes(w)).length;
      if (n === 0) ohne.push(w);
      if (n > 1) doppelt.push(w);
    }
    if (ohne.length) eng.push(`${ohne.length} Wörter tragen kein Themengebiet `
      + `(${ohne.slice(0, 6).join(', ')}${ohne.length > 6 ? ' …' : ''}) — dann fehlen sie `
      + 'in jeder Themenebene, und niemand sieht es');
    if (doppelt.length) eng.push(`${doppelt.length} Wörter stehen in mehreren `
      + `Themengebieten (${doppelt.join(', ')}) — dann kommen sie zweimal dran`);
    const fremd = Object.keys(EN.THEMA_VON).filter(w => !EN.WOERTER.includes(w));
    if (fremd.length) eng.push(`${fremd.length} Wörter der Thementafel stehen nicht im `
      + `amtlichen Wortschatz: ${fremd.join(', ')}`);
    const jeThema = themen.map(nr => [nr, EN.vorratThema(nr).length]);
    const duenn = jeThema.filter(([, n]) => n < THEMA_MIN);
    if (duenn.length) eng.push(`${duenn.length} Themengebiete haben zu wenig gezeichnete `
      + `Wörter (${duenn.map(([nr, n]) => `${EN.themaTitel(nr)} ${n}`).join(', ')}, `
      + `verlangt ${THEMA_MIN}) — dann stehen in den letzten Aufgaben immer dieselben `
      + 'drei Ablenker daneben');
    /* Und die Ablenker bleiben im Thema. Geprueft an JEDEM Gegenstand
       jedes Themas - das ist die Zusage, die diese vier Ebenen von
       „Hoeren und zeigen" unterscheidet. */
    for (const nr of themen)
      ablenkerPruefen(EN.vorratThema(nr), (t) => eng.push(t), (x, y) => y.thema !== x.thema
        && `„${x.wort}" bekommt in „${EN.themaTitel(nr)}" einen Ablenker aus `
           + `„${EN.themaTitel(y.thema)}" — dann ist es wieder eine Bildersuche`);
    if (!ohne.length && !doppelt.length && !fremd.length && !duenn.length)
      console.log(`    Themengebiete: ${EN.WOERTER.length} Wörter auf ${themen.length} `
        + `verteilt (${jeThema.map(([nr, n]) => `${EN.themaTitel(nr)} ${
            (EN.THEMA_WOERTER[nr] || []).length}/${n} gemalt`).join(' · ')})`);
    console.log(`    „Hören und zeigen" und „Sag es": ${vorrat.length} Gegenstände `
      + `(${EN.FARBEN.length} Farben, ${EN.ZAHLEN.length} Zahlen, ${gemalt} Zeichnungen), `
      + `jeder mit Bild und im amtlichen Wortschatz`);
    console.log(`    engste zwei Farben: ${engstesPaar} mit ${engster.toFixed(1)} CIELAB `
      + `(nötig ${ENGSTER_MIN})`);
  }

  /* ---- Der Bildplan (E4) ----------------------------------------------
   *
   * 86 Woerter sollen ein Bild bekommen, 10 haben eines (der Farbfleck),
   * 55 bekommen keines. Geprueft wird die EINTEILUNG, nicht der Geschmack:
   *
   *   1. DIE DREI MENGEN DECKEN DIE 151 GENAU EINMAL. Kein Wort ohne
   *      Einteilung (es fiele sonst still aus E4 heraus), keines in zwei
   *      (dann waere unklar, ob es gemalt wird). Genau das ist mir beim
   *      Aufschreiben passiert - „weekend" stand in beiden Listen.
   *   2. JEDES BILD HAT EIN MOTIV, und zwar ein beschriebenes. „a cat"
   *      reicht nicht: ohne Haltung zeichnet ein Bildermacher zehnmal
   *      etwas anderes, und die zehn Felder eines Blattes passen nicht
   *      zusammen. Deshalb eine Mindestlaenge - grob, aber sie faengt die
   *      Zeile, die jemand schnell nachtraegt.
   *   3. JEDES BLATT HAT ZEHN FELDER. Der Nutzer schneidet die Blaetter in
   *      ein 5x2-Raster; ein Blatt mit neun Feldern haette ein anderes
   *      Raster, und der Schnitt liefe schief. Gezaehlt wird am Werkzeug
   *      selbst, nicht an einer Zahl daneben.
   */
  {
    const e4 = [];
    const inFarben = new Set(EN.FARBEN.map(f => f.wort));
    const inBildern = new Set(EN.BILDER.map(b => b.wort));
    const inWort = new Set(EN.NUR_WORT);
    for (const w of EN.WOERTER) {
      const n = [inFarben.has(w), inBildern.has(w), inWort.has(w)].filter(Boolean).length;
      if (n === 0) e4.push(`„${w}" steht in keiner der drei Listen — es fällt aus `
        + 'dem Bildplan heraus, ohne dass jemand entschieden hätte, ob es ein Bild bekommt');
      if (n > 1) e4.push(`„${w}" steht in zwei der drei Listen — dann ist nicht `
        + 'entschieden, ob es gemalt wird');
    }
    for (const w of [...inBildern, ...inWort])
      if (!EN.WOERTER.includes(w))
        e4.push(`„${w}" steht im Bildplan, aber nicht im amtlichen Wortschatz`);
    const gebiete = new Set(EN.BILDGEBIETE.map(g => g.id));
    const motive = new Map();
    for (const b of EN.BILDER) {
      if (!gebiete.has(b.gebiet))
        e4.push(`„${b.wort}" liegt auf dem Blatt „${b.gebiet}", das es nicht gibt`);
      if (!b.motiv || b.motiv.trim().length < 25)
        e4.push(`„${b.wort}" hat kein beschriebenes Motiv („${b.motiv || ''}") — `
          + 'ohne Haltung und Ansicht zeichnet jedes Feld etwas anderes');
      if (motive.has(b.motiv))
        e4.push(`„${b.wort}" und „${motive.get(b.motiv)}" haben dasselbe Motiv`);
      else motive.set(b.motiv, b.wort);
      /* Das Motiv geht wortwoertlich in einen englischen Prompt. Ein
         deutscher Satz darin faellt dort nicht auf, sondern erst am Bild. */
      if (/[äöüßÄÖÜ]/.test(b.motiv))
        e4.push(`das Motiv zu „${b.wort}" ist nicht englisch: „${b.motiv}"`);
    }
    const blaetter = BP.blaetter();
    for (const bl of blaetter)
      if (bl.felder.length !== 10)
        e4.push(`das Blatt „${bl.id}" hat ${bl.felder.length} Felder statt zehn — `
          + 'dann stimmt beim Zuschneiden das Raster nicht');

    if (e4.length) {
      console.log('    ' + e4.join('\n    '));
      console.error('\n  englisch ROT: der Bildplan für E4 stimmt nicht.');
      process.exit(1);
    }
    const gezeichnet = EN.BILDER.filter(b => b.pfad).length;
    console.log(`    Bildplan (E4): ${EN.BILDER.length} Wörter wollen ein Bild, `
      + `${EN.FARBEN.length} haben eines (der Farbfleck), ${EN.NUR_WORT.length} `
      + `bekommen keines — zusammen ${EN.WOERTER.length} von ${EN.WOERTER.length}`);
    console.log(`    ${blaetter.length} Blätter à 10 Felder · gezeichnet: `
      + `${gezeichnet} von ${EN.BILDER.length}`);
  }

  /* ---- Die falschen Freunde (E10, Tor E-g) ----------------------------
   *
   * „jeder falsche Freund hat beide Fassungen" - die richtige und die
   * Falle. Geprueft wird das, und die eine Sache, an der die ganze Ebene
   * haengt:
   *
   *   DIE FALLE DARF NIE UNTER DEN RICHTIGEN ANTWORTEN STEHEN. Sonst
   *   belohnt die Aufgabe genau den Fehler, den sie zeigen soll - und
   *   zwar lautlos: der Bildschirm saehe richtig aus, das Lob kaeme, und
   *   gelernt waere das Falsche. Verglichen wird ueber `wieGetippt`, also
   *   so, wie die App wirklich vergleicht (Regel 13: wer eine Wirkung
   *   misst, misst sie an der Stelle, an der sie eintritt).
   *
   * Und: der Grund muss die Falle NENNEN. „Das ist falsch" hilft nicht;
   * die Ebene lebt davon, dass dort steht, was `become` wirklich heisst.
   */
  /* EINE Schleife fuer BEIDE Lueckenebenen (I8).
   *
   * „Falsche Freunde" (E10) und „Gestern und heute" (I8) tragen dieselben
   * Felder, weil sie dieselbe Aufgabe stellen. Ein zweiter, abgeschriebener
   * Pruefblock waere Regel 6: was zweimal dasteht, veraltet einmal - und
   * zwar hier besonders leise, weil die Kopie beim ersten Lauf gruen ist.
   * Was die Verben ZUSAETZLICH zusagen, steht darunter als eigener Block. */
  for (const buch of [{ was:'Falsche Freunde (E10)', kurz:'die falschen Freunde (E10)',
                        liste: EN.FREUNDE },
                      { was:'Gestern und heute (I8)', kurz:'die unregelmäßigen Verben (I8)',
                        liste: EN.VERBEN },
                      { was:'Das kleine Wort (I9)', kurz:'die Präpositionen (I9)',
                        liste: EN.PRAEPOSITIONEN }]) {
    const ff = [];
    const ids = new Set();
    for (const f of buch.liste) {
      if (ids.has(f.id)) ff.push(`die Falle „${f.id}" gibt es zweimal`);
      ids.add(f.id);
      if (!f.satz || !/[.!?]$/.test(f.satz))
        ff.push(`„${f.id}" hat keinen deutschen Satz`);
      if (!f.luecke || !f.luecke.includes('___'))
        ff.push(`„${f.id}" hat keine Lücke im englischen Satz — dann gibt es `
          + 'nichts zu tippen');
      if (!f.richtig || !f.richtig.length)
        ff.push(`„${f.id}" hat keine richtige Antwort`);
      if (!f.falle) ff.push(`„${f.id}" hat keine Falle — dann ist es keiner`);
      if (!f.warum) ff.push(`„${f.id}" sagt nicht, was die Falle wirklich heißt`);
      if (f.falle && f.richtig
          && f.richtig.map(EN.wieGetippt).includes(EN.wieGetippt(f.falle)))
        ff.push(`bei „${f.id}" steht die Falle „${f.falle}" unter den richtigen `
          + 'Antworten — dann belohnt die Aufgabe den Fehler, den sie zeigen soll');
      /* Der Grund muss die Falle NENNEN - und zwar in Anfuehrungszeichen,
         damit man sieht, von welchem Wort die Rede ist.
         Verglichen werden nur die ersten DREI Buchstaben, ohne Bindestrich.
         Das ist grob, und es ist mit Absicht grob: der erste Anlauf
         verlangte die Falle wortwoertlich und wurde prompt rot bei
         „became" gegen „become" und bei „oldtimer" gegen „old-timer" -
         dieselben Woerter in anderer Form. `falle` ist die Form, die ein
         Deutscher TIPPT; der Grund nennt die Grundform. Wer beide gleich
         erzwingt, macht die Daten falsch, damit die Pruefung gruen wird.
         Was diese Regel noch faengt: ein Grund, der gar kein Wort nennt,
         und einer, der ein voellig anderes nennt. */
      const genannt = (f.warum || '').toLowerCase().replace(/[-\s]/g, '');
      const stamm = (f.falle || '').toLowerCase().replace(/[-\s]/g, '').slice(0, 3);
      if (f.warum && !/[„"][^„"]+[""]/.test(f.warum))
        ff.push(`der Grund zu „${f.id}" nennt kein Wort in Anführungszeichen: `
          + `„${f.warum}"`);
      if (f.falle && f.warum && stamm && !genannt.includes(stamm))
        ff.push(`der Grund zu „${f.id}" nennt die Falle „${f.falle}" nicht: `
          + `„${f.warum}"`);
      /* Die Luecke steht im ENGLISCHEN Satz, und der darf die Falle nicht
         schon enthalten. Im deutschen Satz darf sie sehr wohl stehen -
         bei „Gymnasium", „Chef", „Rock" oder „also" ist sie DASSELBE Wort,
         und genau das macht den falschen Freund aus. */
      if (f.falle && f.luecke
          && new RegExp(`\\b${f.falle}\\b`, 'i').test(f.luecke))
        ff.push(`der englische Satz zu „${f.id}" enthält die Falle „${f.falle}" `
          + 'schon — dann ist sie zu lesen statt zu erkennen');
    }
    /* RATSCHE, in SITZUNGEN gerechnet und nicht in Stueck (Regel 2:
       Grenzen anteilig, nie absolut).
       Vorher stand hier 25 - „das Konzept nennt rund dreissig". Das Mass
       war die Liste, nicht das Spiel. Der Inhalt-Audit hat nachgerechnet:
       bei zwoelf Aufgaben je Elternsitzung waren dreissig Fallen 2,5
       Runden, und danach kam jede ein zweites Mal. Gemessen wird deshalb
       in Runden, und die Ratsche steht bei VIER - eine unter dem, was
       heute dasteht. */
    if (buch.liste.length < RUNDEN_VORRAT * SITZUNG_ELTERN)
      ff.push(`nur ${buch.liste.length} Fallen — das sind `
        + `${(buch.liste.length / SITZUNG_ELTERN).toFixed(1)} Runden, `
        + `nötig sind ${RUNDEN_VORRAT}`);
    if (ff.length) {
      console.log('    ' + ff.join('\n    '));
      console.error(`\n  englisch ROT: ${buch.kurz} stimmen nicht.`);
      process.exit(1);
    }
    const mehrere = buch.liste.filter(f => f.richtig.length > 1).length;
    console.log(`    ${buch.was}: ${buch.liste.length} Fallen, jede mit `
      + `beiden Fassungen · ${mehrere} halten mehrere gültige Antworten · `
      + 'keine Falle steht unter den richtigen');
  }

  /* ---- Und was die Praepositionen zusagen (I9) ------------------------
   *
   * Der Vorlauf sagt: „es fehlt genau EIN KLEINES WORT". Das ist eine
   * Zusage ueber die Daten, und sie bricht auf zwei Arten, die beide
   * lautlos sind: jemand traegt eine Wendung als richtige Antwort ein
   * („for the"), und die Luecke ist ploetzlich keine mehr; oder jemand
   * erfindet eine Falle, die es im Englischen gar nicht gibt - dann ist
   * sie kein Fehler, den jemand macht, sondern einer, den niemand macht.
   *
   * Geprueft wird gegen eine GESCHLOSSENE Liste englischer Praepositionen.
   * Sie steht hier und nicht in den Daten: die Daten sagen, was gefragt
   * wird, dieses Tor sagt, was ueberhaupt eine Praeposition IST. Wer sie
   * erweitern muss, hat entweder eine vergessen - dann gehoert sie dazu -
   * oder er wollte gerade eine Wendung eintragen.
   */
  {
    const pp = [];
    const KLEIN = new Set(['about', 'above', 'across', 'after', 'against', 'along',
      'among', 'around', 'as', 'at', 'before', 'behind', 'below', 'beside',
      'between', 'beyond', 'by', 'during', 'except', 'for', 'from', 'in',
      'inside', 'into', 'near', 'of', 'off', 'on', 'onto', 'out', 'outside',
      'over', 'past', 'since', 'through', 'to', 'towards', 'under', 'until',
      'up', 'upon', 'with', 'within', 'without']);
    for (const f of EN.PRAEPOSITIONEN) {
      for (const r of f.richtig)
        if (!KLEIN.has(r))
          pp.push(`„${f.id}": „${r}" ist keine Präposition aus der Liste — die Ebene `
            + 'verspricht EIN kleines Wort, keine Wendung');
      if (!KLEIN.has(f.falle))
        pp.push(`„${f.id}": die Falle „${f.falle}" ist keine englische Präposition — `
          + 'dann ist sie kein Fehler, den jemand wirklich macht');
    }
    if (pp.length) {
      console.log('    ' + pp.join('\n    '));
      console.error('\n  englisch ROT: in „Das kleine Wort" steht etwas, das kein kleines Wort ist.');
      process.exit(1);
    }
    const gestellt = new Set(EN.PRAEPOSITIONEN.flatMap(f => f.richtig));
    const fallen = new Set(EN.PRAEPOSITIONEN.map(f => f.falle));
    console.log(`    Das kleine Wort (I9): ${gestellt.size} verschiedene Präpositionen `
      + `gefragt, ${fallen.size} verschiedene Fallen — alle aus der Liste der `
      + `${KLEIN.size} englischen Präpositionen`);
  }

  /* ---- Und was die Verben ZUSAETZLICH zusagen (I8) --------------------
   *
   * Der Vorlauf sagt es woertlich: „Die Falle ist jedes Mal dieselbe: die
   * regelmäßige Form auf -ed." Das ist eine Zusage an den Spieler, und
   * ohne diese Pruefung ist sie ein Satz, den die Daten nach der dritten
   * Ergaenzung nicht mehr halten - schweigend, denn die Aufgabe
   * FUNKTIONIERT auch mit einer beliebigen anderen Falle.
   *
   * Gerechnet wird die regelmaessige Form aus der Grundform, und die
   * Grundform steht im Grund („buy" ist unregelmäßig: buy — bought). Wo
   * beide Formen gelten (learnt/learned), kann die Falle nicht die
   * regelmaessige sein - dort ist sie eine falsch geschriebene dritte,
   * und das steht als AUSNAHME mit Namen da, nicht als Luecke in der
   * Regel.
   */
  {
    const vv = [];
    const AUSNAHME = new Set(['v-learn', 'v-dream', 'v-burn']);
    /* Die Endung nach der Schulregel: -e faellt weg, Konsonant nach
       kurzem Vokal verdoppelt sich. Grob, und das reicht: geprueft wird,
       ob die Falle NACH DIESER REGEL gebaut ist, nicht ob sie ein
       englisches Wort waere - sie ist ja keines. */
    const regelmaessig = (grund) => {
      /* -y nach Konsonant wird -ied (try — tried, fly — flied). Nach
         einem Vokal nicht: buy — buyed, pay — payed. Diese Zeile fehlte
         im ersten Anlauf, und das Tor hat sie sofort verlangt: es wollte
         „flyed" sehen, wo „flied" stand. Die Daten waren richtig und die
         Regel unvollstaendig - herum ist es der haeufigere Fall. */
      if (/[^aeiou]y$/.test(grund)) return grund.slice(0, -1) + 'ied';
      if (/e$/.test(grund)) return grund + 'd';
      if (/^[a-z]*[^aeiou][aeiou][^aeiouwxy]$/.test(grund))
        return grund + grund.slice(-1) + 'ed';
      return grund + 'ed';
    };
    for (const f of EN.VERBEN) {
      if (AUSNAHME.has(f.id)) continue;
      /* Die Grundform steht als erstes Wort in Anfuehrungszeichen im
         Grund - dieselbe Stelle, an der die allgemeine Pruefung oben die
         Falle sucht. Eine zweite Spalte `grund:` waere dieselbe Auskunft
         an zwei Orten. */
      const m = (f.warum || '').match(/[„"]([a-z]+)"/);
      if (!m) { vv.push(`„${f.id}": der Grund nennt keine Grundform in Anführungszeichen`);
                continue; }
      const soll = regelmaessig(m[1]);
      if (f.falle !== soll)
        vv.push(`„${f.id}": die Falle ist „${f.falle}", die regelmäßige Form von `
          + `„${m[1]}" wäre aber „${soll}" — der Vorlauf sagt zu, dass die Falle `
          + 'jedes Mal die Form auf -ed ist');
    }
    for (const id of AUSNAHME)
      if (!EN.VERBEN.some(f => f.id === id))
        vv.push(`„${id}" steht als Ausnahme von der -ed-Regel, gibt es aber nicht mehr`);
    if (vv.length) {
      console.log('    ' + vv.join('\n    '));
      console.error('\n  englisch ROT: die Falle der Verben ist nicht mehr die regelmäßige Form.');
      process.exit(1);
    }
    console.log(`    Gestern und heute (I8): bei ${EN.VERBEN.length - AUSNAHME.size} von `
      + `${EN.VERBEN.length} Verben ist die Falle die gerechnete Form auf -ed · `
      + `${AUSNAHME.size} Ausnahmen mit Namen (dort gelten beide Formen)`);
  }

  /* --- E11/E12: die Wendungen und die Diktatsaetze -------------------- *
   *
   * Die Zusage dieser Ebene ist eine BESONDERE, und sie steht als
   * einziger Satz im Vorlauf: „Es gibt mehr als eine richtige Fassung -
   * es zaehlt, ob man dich versteht." Genau das ist hier zu pruefen, und
   * es zerfaellt in zwei Haelften, die sich gegenseitig halten:
   *
   *   MEHRERE   Jede Wendung traegt mindestens zwei Fassungen. Mit
   *             einer waere die Zusage eine Behauptung; das Kind tippt
   *             dann eine Fassung, die man versteht, und bekommt „falsch".
   *   VERSCHIEDEN  Und die Fassungen muessen sich NACH der Normalform
   *             unterscheiden. Zwei Schreibweisen desselben Satzes sind
   *             keine zweite Fassung - sie beweisen nur, dass `wieGesagt`
   *             Punkte wegnimmt (Regel 1: eine Pruefung, die nie etwas
   *             meldet, ist kein Beweis).
   *
   * Und die Gegenrichtung, ohne die die Nachsicht unbegrenzt waere:
   * keine zwei VERSCHIEDENEN Wendungen duerfen auf dieselbe Normalform
   * fallen. Sonst waere die Antwort auf die eine Aufgabe auch die auf
   * eine andere, und die Ebene wuerde nachsichtig statt richtig.
   */
  {
    const wf = [], gesehen = new Map(), ids = new Set();
    const woerter = (t) => String(t).trim().split(/\s+/).length;
    for (const w of EN.WENDUNGEN) {
      if (ids.has(w.id)) wf.push(`die Kennung „${w.id}" gibt es zweimal`);
      ids.add(w.id);
      if (!w.deutsch || !w.gebiet)
        wf.push(`„${w.id}" hat keinen deutschen Satz oder kein Themengebiet`);
      if (w.richtig.length < 2)
        wf.push(`„${w.id}" hat nur ${w.richtig.length} gültige Fassung — `
          + 'die Ebene sagt zu, dass es mehr als eine gibt');
      const norm = w.richtig.map(EN.wieGesagt);
      if (new Set(norm).size !== norm.length)
        wf.push(`„${w.id}" zählt dieselbe Fassung zweimal — nach `
          + '`wieGesagt` bleibt sie ein einziger Satz');
      for (const n of new Set(norm)) {
        if (gesehen.has(n) && gesehen.get(n) !== w.id)
          wf.push(`„${n}" gilt für „${w.id}" UND für „${gesehen.get(n)}" — `
            + 'dann beantwortet eine Wendung die andere mit');
        gesehen.set(n, w.id);
      }
    }
    /* Vier Themengebiete, und keines darf leer bleiben: der Lehrplan
       nennt sie einzeln, und eine Ebene, die nur Smalltalk fragt, deckt
       ihn nicht ab. Die Zahl kommt aus den DATEN und nicht von hier -
       geprueft wird, dass jedes vorkommt, nicht wie oft. */
    const gebiete = new Set(EN.WENDUNGEN.map(w => w.gebiet));
    for (const g of ['4.1', '4.2', '4.3', '4.4'])
      if (!gebiete.has(g)) wf.push(`kein Satz zum Themengebiet ${g}`);

    /* Die Diktatsaetze sind eine AUSWAHL der Wendungen und keine zweite
       Liste (Regel 6: was zweimal dasteht, veraltet einmal). Ohne diese
       Bindung haetten E11 und E12 zwei
       Vorraete, die auseinanderlaufen - und der eine wuerde still
       veralten. Geprueft wird deshalb, dass jede Kennung wirklich eine
       Wendung trifft. */
    const zuId = new Map(EN.WENDUNGEN.map(w => [w.id, w]));
    const hs = [];
    for (const id of EN.HOERSAETZE) {
      const w = zuId.get(id);
      if (!w) { wf.push(`der Diktatsatz „${id}" zeigt auf keine Wendung`); continue; }
      hs.push(w);
    }
    if (new Set(EN.HOERSAETZE).size !== EN.HOERSAETZE.length)
      wf.push('eine Kennung steht zweimal unter den Diktatsätzen');
    /* Die Diktatsaetze waren der schaerfste Einzelbefund des
       Inhalt-Audits: zwoelf Saetze bei zwoelf Aufgaben je Sitzung - die
       zweite Sitzung war Satz fuer Satz die erste. Die alte Grenze („12")
       hat das nicht gemeldet, sie hat es FESTGESCHRIEBEN. */
    if (hs.length < 2 * SITZUNG_ELTERN)
      wf.push(`nur ${hs.length} Diktatsätze — das sind `
        + `${(hs.length / SITZUNG_ELTERN).toFixed(1)} Runden, nötig sind 2`);
    if (EN.WENDUNGEN.length < RUNDEN_VORRAT * SITZUNG_ELTERN)
      wf.push(`nur ${EN.WENDUNGEN.length} Wendungen — das sind `
        + `${(EN.WENDUNGEN.length / SITZUNG_ELTERN).toFixed(1)} Runden, `
        + `nötig sind ${RUNDEN_VORRAT}`);
    const hgebiete = new Set(hs.map(w => w.gebiet));
    for (const g of ['4.1', '4.2', '4.3', '4.4'])
      if (!hgebiete.has(g)) wf.push(`kein Diktatsatz zum Themengebiet ${g}`);
    /* RATSCHE, kein Soll. Der Vorlauf verspricht „einmal, in normalem
       Tempo" - ab einer gewissen Laenge misst das nicht mehr das Hoeren,
       sondern das Behalten. Gemessen am heutigen Vorrat: sieben Woerter.
       Die Grenze steht bei neun, damit ein laengerer Satz auffaellt,
       bevor er unbemerkt zur Gedaechtnisaufgabe wird. */
    const LAENGSTER = 9;
    for (const w of hs)
      if (woerter(w.richtig[0]) > LAENGSTER)
        wf.push(`„${w.richtig[0]}" hat ${woerter(w.richtig[0])} Wörter — `
          + `ab ${LAENGSTER} misst das Diktat das Behalten und nicht das Hören`);

    if (wf.length) {
      console.log('    ' + wf.join('\n    '));
      console.error('\n  englisch ROT: die Wendungen (E11/E12) stimmen nicht.');
      process.exit(1);
    }
    const laengste = Math.max(...hs.map(w => woerter(w.richtig[0])));
    console.log(`    Wendungen (E11): ${EN.WENDUNGEN.length} Sätze in `
      + `${gebiete.size} Themengebieten, jeder mit mindestens zwei gültigen `
      + 'Fassungen · keine Fassung beantwortet zwei Aufgaben');
    console.log(`    Hören und schreiben (E12): ${hs.length} Diktatsätze, alle aus `
      + `den Wendungen · längster ${laengste} Wörter (Grenze ${LAENGSTER})`);
  }

  /* --- E9: die Saetze zum Selbersagen --------------------------------- *
   *
   * Ein Chunk ist ein Redemittel, EINMAL AUSGEFUELLT. Die Gefahr liegt
   * nicht im Ausfuellen, sondern daneben: ein Satz, der gut klingt und in
   * keiner amtlichen Zeile steht, sieht in der Datendatei aus wie einer,
   * der abgeleitet ist - er steht ja zwischen zwanzig anderen, die es
   * sind. Genau so entsteht erfundener Wortschatz, der amtlich aussieht,
   * weil er neben amtlichen Daten liegt.
   *
   * Deshalb traegt jeder Chunk seine `quelle` mit, und deshalb wird sie
   * hier WOERTLICH gesucht statt geglaubt. Drei Zusagen, jede einzeln
   * geprueft, weil jede fuer sich brechen kann:
   *
   *   ABGELEITET  Die Quelle steht Zeichen fuer Zeichen in THEMENGEBIETE,
   *               und die stehen ihrerseits Satz fuer Satz in der
   *               amtlichen Redemittel-Liste - das prueft dieses Tor
   *               dreissig Zeilen weiter oben. Die Kette reicht damit vom
   *               nachgesprochenen Satz bis zur PDF des ISB.
   *   AM RICHTIGEN ORT  Und zwar in DEM Gebiet, das der Chunk nennt, nicht
   *               irgendeinem der vier. Ohne diese Haelfte waere `gebiet`
   *               ein freies Feld - und an ihm haengt das Abzeichen je
   *               Themengebiet, das die Ebene verspricht.
   *   NACHSPRECHBAR  Kein Platzhalter, hoechstens sieben Woerter, und
   *               jedes Wort aus dem amtlichen Wortschatz.
   *
   * DIE WORTPROBE IST DIE TEUERSTE UND DIE WICHTIGSTE. Ein Satz aus
   * lauter amtlichen Woertern ist einer, den das Kind in der Schule
   * wiedertrifft; ein einziges dazuerfundenes Wort macht ihn zu meinem
   * Englisch. Gesucht wird in BEIDEN Listen, WOERTER und NUR_WORT -
   * zusammen sind das dieselben 151, aufgeteilt nach „malbar" und „nicht
   * malbar". Diese Aufteilung ist eine Frage der Bilder (E4) und geht
   * einen gesprochenen Satz nichts an.
   *
   * DIE LISTEN MUESSEN DAFUER ZERLEGT WERDEN, und das ist keine Freiheit,
   * sondern die Bauart der Quelle: ihre Eintraege sind Buendel und keine
   * Woerter. „a/an" sind zwei, „be (am, are, is)" sind vier, „thank(s)"
   * sind zwei, „next to" ist eines aus zwei Teilen. Wer ungeteilt
   * vergleicht, findet kein einziges Wort wieder und muesste die Probe
   * abschalten - und eine abgeschaltete Probe ist kein Beweis (Regel 1).
   * Zerlegt wird nach genau den drei Zeichen, die die Quelle selbst
   * benutzt: Schraegstrich (Auswahl), Klammer (Beugung), Leerzeichen
   * (mehrteiliger Eintrag).
   *
   * Die Apostrophe werden dabei vereinheitlicht. Die amtliche Liste
   * traegt DREI verschiedene - „I’m" (U+2019), „can‘t" (U+2018) und
   * „hasn´t" (U+00B4) -, und ein Satz, der den geraden benutzt, waere
   * sonst aus lauter unbekannten Woertern gebaut. Dieselbe Behandlung wie
   * in `wieGesagt`, aus demselben Grund.
   */
  {
    const cf = [], ids = new Set();
    /* Sieben Woerter. Die Grenze ist NICHT von den Diktatsaetzen (neun)
       geerbt, sondern eine andere Messung: dort hoert ein Erwachsener
       einen Satz, hier spricht eine Sechsjaehrige ihn nach. Gemessen am
       heutigen Vorrat sind die laengsten sechs Woerter lang; die Grenze
       laesst einen Schritt Luft und faengt den Satz, der beim Ausfuellen
       einer Schablone lang geworden ist. */
    const WORTGRENZE = 7;
    const apo = (t) => String(t).replace(/[‘’´`]/g, "'");
    /** Ein amtlicher Eintrag -> die Woerter, die er zulaesst. */
    const zerlegen = (eintrag) => apo(eintrag).split('/').flatMap(t => {
      /* „thank(s)" ist der eine Fall, in dem die Klammer ein Wort
         VERLAENGERT statt eines danebenzustellen. Ohne diesen Zweig
         entstuende „thanks" nicht, und „I’m fine, thanks." fiele durch. */
      const gebeugt = t.trim().match(/^([A-Za-z']+)\(([A-Za-z']+)\)$/);
      return gebeugt ? [gebeugt[1], gebeugt[1] + gebeugt[2]]
                     : t.replace(/[()]/g, ' ').split(/[\s,]+/);
    }).map(w => w.toLowerCase()).filter(Boolean);
    const erlaubt = new Set([...EN.WOERTER, ...EN.NUR_WORT].flatMap(zerlegen));
    /** Ein Satz -> seine Woerter, ohne Satzzeichen, klein. */
    const satzWoerter = (satz) => apo(satz).toLowerCase().split(/[^a-z']+/)
      .map(w => w.replace(/^'+|'+$/g, '')).filter(Boolean);
    /* Welches Redemittel steht in welchem Gebiet? Aus den Themengebieten
       gelesen und nicht aus den Chunks - sonst prueften sich die Chunks
       an sich selbst (Regel 14: das Modell darf nicht vom Gemessenen
       abhaengen). Ein Redemittel kann in ZWEI Gebieten stehen; deshalb
       eine Menge und kein einzelner Wert. */
    const wo = new Map();
    for (const g of EN.THEMENGEBIETE)
      for (const h of g.handlungen)
        for (const s of h.saetze) wo.set(s, (wo.get(s) || new Set()).add(g.nr));

    const jeGebiet = new Map();
    for (const c of EN.CHUNKS) {
      const fehlt = ['id', 'satz', 'gebiet', 'quelle'].filter(f => !c[f]);
      if (fehlt.length) {
        cf.push(`einem Chunk („${c.id || c.satz || '?'}") fehlt ${fehlt.join(', ')}`);
        continue;
      }
      if (ids.has(c.id)) cf.push(`die Kennung „${c.id}" gibt es zweimal`);
      ids.add(c.id);
      /* Die drei Zeichen der Schablone. Ein Kind liest den Schraegstrich
         nicht als Auswahl - es spricht ihn mit. */
      const rest = c.satz.match(/[…\/→]/);
      if (rest) cf.push(`„${c.satz}" trägt noch „${rest[0]}" aus der Schablone — `
        + 'das ist keine Auswahl mehr, sondern etwas zum Mitsprechen');
      const n = c.satz.trim().split(/\s+/).length;
      if (n > WORTGRENZE)
        cf.push(`„${c.satz}" hat ${n} Wörter — ab ${WORTGRENZE + 1} ist das kein `
          + 'Satz zum Nachsprechen mehr, sondern einer zum Vorlesen');
      const steht = wo.get(c.quelle);
      if (!steht)
        cf.push(`die Quelle zu „${c.id}" steht in KEINEM Redemittel: `
          + `„${c.quelle.slice(0, 70)}"`);
      else if (!steht.has(c.gebiet))
        cf.push(`„${c.id}" nennt das Gebiet ${c.gebiet}, seine Quelle steht aber in `
          + `${[...steht].join(' und ')}`);
      for (const w of satzWoerter(c.satz))
        if (!erlaubt.has(w))
          cf.push(`„${w}" steht weder in WOERTER noch in NUR_WORT — aus „${c.satz}" `
            + `(${c.id})`);
      jeGebiet.set(c.gebiet, (jeGebiet.get(c.gebiet) || 0) + 1);
    }
    /* Vier je Gebiet. Die Zahl ist keine Schoenheit: ein Abzeichen, das
       nach drei Saetzen faellt, ist in der ersten Sitzung verdient und
       danach nie wieder etwas wert. */
    const JE_GEBIET_MIN = 4;
    for (const g of EN.THEMENGEBIETE) {
      const hat = jeGebiet.get(g.nr) || 0;
      if (hat < JE_GEBIET_MIN)
        cf.push(`nur ${hat} Sätze zum Themengebiet ${g.nr} (${g.titel}) — unter `
          + `${JE_GEBIET_MIN} gibt es dort kein Abzeichen zu verdienen`);
    }
    /* Der Vorrat traegt, was die Ebene braucht. Ohne diese drei Zeilen
       koennte `vorratChunks()` ein Feld verlieren, ohne dass etwas rot
       wird - die Daten waeren dann in Ordnung und die Ebene leer. */
    const vc = EN.vorratChunks();
    if (vc.length !== EN.CHUNKS.length)
      cf.push(`der Vorrat hat ${vc.length} Gegenstände, die Daten ${EN.CHUNKS.length}`);
    for (const x of vc) {
      const fehlt = ['id', 'gebiet', 'satzEn'].filter(f => !x[f]);
      if (fehlt.length) cf.push(`dem Vorratsstück „${x.id || '?'}" fehlt ${fehlt.join(', ')}`);
    }

    if (cf.length) {
      console.log('    ' + cf.join('\n    '));
      console.error('\n  englisch ROT: die Sätze zum Selbersagen (E9) stimmen nicht.');
      process.exit(1);
    }
    const laengster = Math.max(...EN.CHUNKS.map(c => c.satz.trim().split(/\s+/).length));
    const wenigste = Math.min(...[...jeGebiet.values()]);
    console.log(`    Satz zum Selbersagen (E9): ${EN.CHUNKS.length} Sätze in `
      + `${jeGebiet.size} Gebieten, alle auf ein Redemittel zurückgeführt · `
      + `je Gebiet mindestens ${wenigste} (nötig ${JE_GEBIET_MIN}) · längster `
      + `${laengster} Wörter (Grenze ${WORTGRENZE}) · kein Wort außerhalb der `
      + 'amtlichen Listen');
  }

  /* --- „Leg das Wort" (E8): was sich legen laesst ---------------------
   *
   * Der Vorrat ist derselbe wie beim Hoeren, gefiltert auf das, was aus
   * Buchstabenkarten zu legen ist. Ein Filter faellt still aus - er
   * nimmt entweder zuviel weg (die Ebene wird duenn) oder zuwenig (ein
   * Wort mit Bindestrich stuende da, und die Karte dafuer gibt es
   * nicht). Beides sieht auf dem Bildschirm normal aus.
   *
   * WAS HIER NICHT GEMESSEN WIRD: ob die Reihe auf den Bildschirm passt.
   * Das ist eine Frage in Bildpunkten, und sie hat ihre Messstelle in
   * `passt` - dort wird die Ebene seit E8 wirklich betreten. Eine Zahl
   * hier waere geraten und saehe aus wie gemessen.
   */
  {
    const cf = [];
    const vl = EN.vorratLegen();
    const alle = EN.vorratHoeren();
    /* Zwanzig ist keine Schoenheit, sondern die Untergrenze einer Ebene:
       Leas Sitzung hat je nach Einstellung bis zu zwoelf Aufgaben, und
       ein Vorrat, der kaum groesser ist, wiederholt sich in der zweiten
       Sitzung vollstaendig. */
    const MINDESTENS = 20;
    if (vl.length < MINDESTENS)
      cf.push(`nur ${vl.length} Wörter zum Legen (nötig ${MINDESTENS}) — der Filter `
        + `nimmt zuviel weg, ${alle.length} stehen im Vorrat`);
    for (const x of vl) {
      if (!/^[a-z]+$/.test(x.wort))
        cf.push(`„${x.wort}" trägt ein Zeichen, das kein Buchstabe ist — dafür gibt es `
          + 'keine Karte, und das Wort wäre nicht zu legen');
      /* Eigene Kennung, sonst teilen sich zwei Ebenen ein Leitner-Fach:
         wer `blue` gehoert und gezeigt hat, haette es damit geschrieben. */
      if (!String(x.id).startsWith('lg:'))
        cf.push(`„${x.id}" trägt nicht die eigene Kennung lg: — dann teilt sich `
          + '„Leg das Wort" den Leitner-Stand mit „Hören und zeigen"');
    }
    if (cf.length) {
      console.log('    ' + cf.join('\n    '));
      console.error('\n  englisch ROT: der Vorrat zum Legen (E8) stimmt nicht.');
      process.exit(1);
    }
    const raus = alle.filter(a => !vl.some(b => b.wort === a.wort)).map(a => a.wort);
    const laengstes = vl.reduce((a, b) => b.wort.length > a.wort.length ? b : a).wort;
    console.log(`    Leg das Wort (E8): ${vl.length} von ${alle.length} Wörtern sind aus `
      + `Buchstabenkarten zu legen · längstes „${laengstes}" mit ${laengstes.length} `
      + `Karten · draußen: ${raus.join(', ') || '(keins)'}`);

    /* --- „Bau den Satz" (E9c) ---------------------------------------
     *
     * Derselbe Bildschirm, andere Karten - und deshalb dieselben zwei
     * Fragen: laesst sich jedes Stueck legen, und traegt es eine eigene
     * Kennung? Ein Satz aus EINEM Wort waere hier die stille
     * Verfallsart: eine Luecke, eine Karte, und die Aufgabe ist gelöst,
     * bevor sie gestellt ist. */
    const vb = EN.vorratBauen();
    const bf = [];
    if (vb.length !== EN.CHUNKS.length)
      bf.push(`der Vorrat zum Bauen hat ${vb.length} Sätze, die Daten ${EN.CHUNKS.length}`);
    for (const x of vb) {
      const teile = String(x.wort).split(' ');
      if (teile.length < 2)
        bf.push(`„${x.wort}" ist ein Satz aus einem Wort — eine Lücke, eine Karte, `
          + 'und es gibt nichts zusammenzusetzen');
      if (!String(x.id).startsWith('bs:'))
        bf.push(`„${x.id}" trägt nicht die eigene Kennung bs: — dann teilt sich `
          + '„Bau den Satz" den Leitner-Stand mit „Sag den Satz"');
    }
    if (bf.length) {
      console.log('    ' + bf.join('\n    '));
      console.error('\n  englisch ROT: der Vorrat zum Bauen (E9c) stimmt nicht.');
      process.exit(1);
    }
    const meiste = Math.max(...vb.map(x => String(x.wort).split(' ').length));
    console.log(`    Bau den Satz (E9c): ${vb.length} Sätze, längster ${meiste} Wortkarten `
      + '· jeder Satz hat mindestens zwei');

    /* --- „Zwei Wörter, ein Laut" (E5) --------------------------------
     *
     * Ein Lautpaar faellt still aus, und zwar auf eine Art, die man dem
     * Bildschirm nicht ansieht: die beiden Woerter unterscheiden sich an
     * einer ANDEREN Stelle als der, die daruebersteht. „dog/dock" unter
     * „w gegen v" waere eine Uebung, die etwas anderes uebt als ihr
     * Grund behauptet - und beide Woerter stehen ja richtig da.
     *
     * Deshalb wird die Stolperstelle NACHGERECHNET und nicht geglaubt.
     * Regel: `a` mit der deutschen Ersetzung ergibt `b`, und zwar genau.
     * Welcher Buchstabe getauscht wird, steht nirgends in den Daten - es
     * waere eine zweite Fassung derselben Auskunft (Regel 6), und die
     * veraltet.
     */
    const lf = [];
    /* Die Ersetzungen, je Stolperstelle. Sie stehen HIER und nicht in
       `englisch.js`: sie sind die PRUEFUNG, nicht die Sache. Stuenden sie
       neben den Daten, prueften sie sich selbst. */
    const ERSATZ = {
      // Das th wird durch einen der Laute ersetzt, die es im Deutschen
      // gibt - s, f, d, t oder z.
      th: (a) => [...'sfdtz'].map(x => a.replace('th', x)),
      // Deutsches w klingt wie englisches v.
      wv: (a) => [a.replace('w', 'v')],
      // Am Wortende hart: stimmhaft -> stimmlos. Die Schreibung folgt
      // dem Laut, nicht umgekehrt - deshalb eine Tabelle von ENDUNGEN.
      auslaut: (a) => {
        const paare = { g: ['ck', 'k'], d: ['t'], b: ['p'], ve: ['f'], z: ['s'] };
        const aus = [];
        for (const [ende, statt] of Object.entries(paare))
          if (a.endsWith(ende))
            for (const x of statt) aus.push(a.slice(0, -ende.length) + x);
        return aus;
      },
      // Englisches a (zwischen ä und a) wird zu deutschem e.
      ea: (a) => [a.replace('a', 'e')],
    };
    const stolperIds = new Set(EN.STOLPERSTELLEN.map(x => x.id));
    const jeStolper = new Map();
    const gesehenePaare = new Set();
    for (const p of EN.LAUTPAARE) {
      const wo = `${p.a}/${p.b}`;
      if (!stolperIds.has(p.stolper))
        { lf.push(`„${wo}" nennt die Stolperstelle „${p.stolper}", die es nicht gibt`);
          continue; }
      if (p.a === p.b) lf.push(`„${wo}" ist zweimal dasselbe Wort`);
      if (gesehenePaare.has(wo)) lf.push(`das Paar „${wo}" steht zweimal da`);
      gesehenePaare.add(wo);
      const moeglich = ERSATZ[p.stolper](p.a);
      if (!moeglich.includes(p.b))
        lf.push(`„${wo}" unterscheidet sich nicht an seiner Stolperstelle `
          + `„${p.stolper}" — aus „${p.a}" würde ${moeglich.length
            ? moeglich.map(x => `„${x}"`).join(' oder ') : 'gar nichts'}, nicht „${p.b}"`);
      jeStolper.set(p.stolper, (jeStolper.get(p.stolper) || 0) + 1);
    }
    /* Alle VIER muessen vertreten sein - das ist die Abnahme aus dem
       Konzept, wortwoertlich: „die vier Stolperstellen aus § 2 sind alle
       vertreten". Drei davon zu haben hiesse, die vierte still
       wegzulassen; niemand vermisst, was nie dastand. */
    const JE_STOLPER_MIN = 3;
    for (const st of EN.STOLPERSTELLEN) {
      const hat = jeStolper.get(st.id) || 0;
      if (hat < JE_STOLPER_MIN)
        lf.push(`nur ${hat} Paare zur Stolperstelle „${st.name}" (nötig `
          + `${JE_STOLPER_MIN}) — mit weniger ist sie in einer Sitzung nicht zu üben`);
      if (!st.grund || st.grund.length < 40)
        lf.push(`die Stolperstelle „${st.name}" hat keinen Grund, der sie erklärt`);
    }
    /* ERST URTEILEN, DANN DEN VORRAT BAUEN.
       `vorratLaute` schlaegt den Grund an der Stolperstelle nach; fehlt
       sie, wirft es. Ein geworfener Fehler ist kein Befund - er sagt
       niemandem, WAS falsch ist, und der Rest des Tores laeuft gar nicht
       mehr. Gemessen an der Gegenprobe „eine der vier Stolperstellen
       faellt weg": sie war rot, aber nicht deswegen. */
    if (lf.length) {
      console.log('    ' + lf.join('\n    '));
      console.error('\n  englisch ROT: die Lautpaare (E5) stimmen nicht.');
      process.exit(1);
    }
    /* Und der Vorrat: ZWEI Gegenstaende je Paar, jeder mit dem Gegenwort
       und dem Grund. Ohne diese Zeilen koennte `vorratLaute` eine
       Richtung verlieren, ohne dass etwas rot wird - die Daten waeren
       dann in Ordnung und die Haelfte der Uebung fiele aus. */
    const vla = EN.vorratLaute();
    if (vla.length !== EN.LAUTPAARE.length * 2)
      lf.push(`der Vorrat hat ${vla.length} Gegenstände, ${EN.LAUTPAARE.length} Paare `
        + `in zwei Richtungen wären ${EN.LAUTPAARE.length * 2}`);
    for (const x of vla) {
      const fehlt = ['id', 'wort', 'gegen', 'grund'].filter(f => !x[f]);
      if (fehlt.length) lf.push(`dem Lautstück „${x.id || '?'}" fehlt ${fehlt.join(', ')}`);
      if (!String(x.id).startsWith('lt:'))
        lf.push(`„${x.id}" trägt nicht die eigene Kennung lt: — dann kann es mit `
          + 'einem Vokabelfach kollidieren');
    }
    if (lf.length) {
      console.log('    ' + lf.join('\n    '));
      console.error('\n  englisch ROT: die Lautpaare (E5) stimmen nicht.');
      process.exit(1);
    }
    console.log(`    Zwei Wörter, ein Laut (E5): ${EN.LAUTPAARE.length} Paare an `
      + `${EN.STOLPERSTELLEN.length} Stolperstellen (${EN.STOLPERSTELLEN
        .map(x => `${x.id} ${jeStolper.get(x.id)}`).join(', ')}) · jede Ersetzung `
      + `nachgerechnet · ${vla.length} Gegenstände in beiden Richtungen`);

    /* --- „Lies das Wort" (E7): die Zeichnungen ------------------------
     *
     * Die Ebene ist die Umkehrung von „Hören und zeigen": oben steht das
     * englische Wort, unten stehen vier Bilder. Sie steht und faellt
     * damit, dass man die vier AUSEINANDERHAELT - und drei Arten, wie das
     * kaputtgeht, sieht man dem Bildschirm nicht an:
     *
     *   1. ZWEI WOERTER, EIN UMRISS. Ein `pfad` doppelt hingeschrieben,
     *      und zwei Karten zeigen dasselbe Bild. Eine davon ist richtig,
     *      die andere auch - und wer die falsche tippt, bekommt gesagt,
     *      er habe sich geirrt. Der Bildschirm bleibt heil.
     *   2. DIE ZEICHNUNG LAEUFT AUS DEM RAHMEN. `<svg>` schneidet an
     *      seinem viewBox ab: was ausserhalb von 0..64 liegt, ist
     *      einfach weg. Ein halber Apfel sieht aus wie ein Entwurf.
     *   3. DIE ZEICHNUNG IST ZU KLEIN. Fuellt sie nur ein Viertel ihres
     *      Rahmens, steht sie als Fleck neben drei ausgewachsenen
     *      Bildern - und die Aufgabe ist ohne ein Wort Englisch zu
     *      loesen: das kleine ist das andere.
     *
     * DIE MESSSTELLE (Regel 5): gerechnet wird am PFAD, nicht am Bild -
     * es gibt hier keinen Browser. Kurven werden abgetastet, Boegen ueber
     * die Mittelpunktsform ausgerechnet. Damit diese Rechnung nicht still
     * falsch wird, prueft sie sich zuerst an zwei Rahmen, deren Mass
     * bekannt ist: eine Rechnung ohne Selbstprobe meldet fuer JEDEN Pfad
     * dasselbe und sieht dabei aus wie ein Beweis (Regel 1).
     */
    const ef = [];
    /* Nur die Befehle, die die Zeichnungen wirklich benutzen - und bei
       allen anderen bricht die Rechnung ab, statt sich zu verzaehlen.
       Ein Parser, der `s` ueberliest, misst ab da Unsinn und meldet
       trotzdem eine Zahl. */
    const KENNT = /^[MmLlHhVvCcSsAaZz]$/;
    /* EIN Parser, zwei Fragen.
     *
     * `pfadZug` laeuft den Pfad ab und gibt die abgetasteten LINIENZUEGE
     * zurueck - je Teilpfad einen. Daraus faellt der Rahmen (`pfadKasten`)
     * genauso ab wie die gefuellte Flaeche (`bildRaster` weiter unten).
     * Zwei Parser nebeneinander waeren der Fall, den Regel 6 beschreibt -
     * was zweimal dasteht, veraltet einmal: gepflegt wird der eine,
     * gerechnet hat der andere. */
    const pfadZug = (d) => {
      let x = 0, y = 0, sx = 0, sy = 0;
      // Der zweite Stuetzpunkt der letzten Kurve - `s` spiegelt ihn.
      // Ohne dieses Gedaechtnis waere `s` eine Kurve mit falschem Bauch,
      // und die Rechnung meldete eine Zahl, die keiner nachschaut.
      let lcx = null, lcy = null;
      const zuege = []; let zug = null;
      const nimm = (a, b) => { if (!zug) { zug = []; zuege.push(zug); } zug.push([a, b]); };
      // Bezier: abgetastet. Die Stuetzpunkte selbst liegen oft weit
      // ausserhalb der Kurve - wer sie misst, meldet „laeuft aus dem
      // Rahmen" fuer eine Zeichnung, die drinbleibt.
      const kurve = (x0, y0, a, b, c, e, f, g) => {
        for (let t = 0; t <= 1.0001; t += 0.02) {
          const u = 1 - t, p1 = u * u * u, p2 = 3 * u * u * t, p3 = 3 * u * t * t, p4 = t * t * t;
          nimm(p1 * x0 + p2 * a + p3 * c + p4 * f, p1 * y0 + p2 * b + p3 * e + p4 * g);
        }
      };
      // Bogen: Endpunkt- in Mittelpunktsform (SVG-Anhang F.6.5), dann
      // abgetastet. Der bequeme Weg - Mittelpunkt plus beide Radien -
      // liegt bis zu einem ganzen Radius daneben und hat beim Teeglas
      // „x -7" gemeldet, wo x 6 steht.
      const bogen = (x0, y0, rx, ry, dreh, gross, uhr, x1, y1) => {
        if (!rx || !ry) return nimm(x1, y1);
        const w = dreh * Math.PI / 180, cs = Math.cos(w), sn = Math.sin(w);
        const dx = (x0 - x1) / 2, dy = (y0 - y1) / 2;
        const ax = cs * dx + sn * dy, ay = -sn * dx + cs * dy;
        rx = Math.abs(rx); ry = Math.abs(ry);
        const zuklein = (ax * ax) / (rx * rx) + (ay * ay) / (ry * ry);
        if (zuklein > 1) { rx *= Math.sqrt(zuklein); ry *= Math.sqrt(zuklein); }
        const zaehler = rx * rx * ry * ry - rx * rx * ay * ay - ry * ry * ax * ax;
        const nenner = rx * rx * ay * ay + ry * ry * ax * ax;
        let k = Math.sqrt(Math.max(0, zaehler / nenner));
        if (gross === uhr) k = -k;
        const cxp = k * rx * ay / ry, cyp = -k * ry * ax / rx;
        const cx = cs * cxp - sn * cyp + (x0 + x1) / 2;
        const cy = sn * cxp + cs * cyp + (y0 + y1) / 2;
        const t1 = Math.atan2((ay - cyp) / ry, (ax - cxp) / rx);
        const t2 = Math.atan2((-ay - cyp) / ry, (-ax - cxp) / rx);
        let dt = t2 - t1;
        if (!uhr && dt > 0) dt -= 2 * Math.PI; else if (uhr && dt < 0) dt += 2 * Math.PI;
        for (let i = 0; i <= 40; i++) {
          const t = t1 + dt * i / 40;
          const px = rx * Math.cos(t), py = ry * Math.sin(t);
          nimm(cx + cs * px - sn * py, cy + sn * px + cs * py);
        }
      };
      const teile = String(d).match(/[A-Za-z]|-?\d*\.?\d+/g) || [];
      let i = 0, cmd = 'M';
      while (i < teile.length) {
        if (/[A-Za-z]/.test(teile[i])) {
          cmd = teile[i++];
          if (!KENNT.test(cmd)) return { fremd: cmd };
        }
        const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
        if (C === 'Z') { x = sx; y = sy; nimm(x, y); zug = null; continue; }
        const z = (n) => { const v = teile.slice(i, i + n).map(Number); i += n; return v; };
        if (C === 'M') { const [a, b] = z(2); x = rel ? x + a : a; y = rel ? y + b : b;
          sx = x; sy = y; zug = null; nimm(x, y); cmd = rel ? 'l' : 'L'; lcx = lcy = null; }
        else if (C === 'L') { const [a, b] = z(2); x = rel ? x + a : a; y = rel ? y + b : b;
          nimm(x, y); lcx = lcy = null; }
        else if (C === 'H') { const [a] = z(1); x = rel ? x + a : a; nimm(x, y); lcx = lcy = null; }
        else if (C === 'V') { const [a] = z(1); y = rel ? y + a : a; nimm(x, y); lcx = lcy = null; }
        else if (C === 'C') { const v = z(6), px = rel ? x : 0, py = rel ? y : 0;
          kurve(x, y, px + v[0], py + v[1], px + v[2], py + v[3], px + v[4], py + v[5]);
          lcx = px + v[2]; lcy = py + v[3]; x = px + v[4]; y = py + v[5]; }
        else if (C === 'S') { const v = z(4), px = rel ? x : 0, py = rel ? y : 0;
          // Der erste Stuetzpunkt IST die Spiegelung des letzten - genau
          // das bedeutet `s`. Ohne Vorgaenger liegt er auf dem Punkt.
          const s1x = lcx === null ? x : 2 * x - lcx, s1y = lcy === null ? y : 2 * y - lcy;
          kurve(x, y, s1x, s1y, px + v[0], py + v[1], px + v[2], py + v[3]);
          lcx = px + v[0]; lcy = py + v[1]; x = px + v[2]; y = py + v[3]; }
        else { const v = z(7);
          const nx = rel ? x + v[5] : v[5], ny = rel ? y + v[6] : v[6];
          bogen(x, y, v[0], v[1], v[2], v[3], v[4], nx, ny); x = nx; y = ny;
          lcx = lcy = null; }
      }
      return { zuege };
    };
    /* Der Rahmen ist jetzt eine Auswertung des Linienzugs und keine
       zweite Rechnung - faellt der Parser aus, faellt beides aus, und die
       Selbstprobe darunter sagt es fuer beide. */
    const pfadKasten = (d) => {
      const z = pfadZug(d);
      if (z.fremd) return { fremd: z.fremd };
      let links = 1e9, oben = 1e9, rechts = -1e9, unten = -1e9;
      for (const zug of z.zuege) for (const [a, b] of zug) {
        links = Math.min(links, a); rechts = Math.max(rechts, a);
        oben = Math.min(oben, b); unten = Math.max(unten, b);
      }
      return { links, oben, rechts, unten };
    };
    /* Die Selbstprobe: zwei Rahmen, deren Mass ich kenne - einer voll,
       einer eingerueckt, und der zweite mit Bogen statt Ecken. Faellt die
       Rechnung aus, melden alle sechzehn Zeichnungen brav „passt". */
    for (const [d, soll] of [['M0 0h64v64H0Z', '0,0,64,64'],
                             ['M8 8h48v48H8Z', '8,8,56,56'],
                             ['M32 8a24 24 0 1 0 0 48 24 24 0 1 0 0-48Z', '8,8,56,56'],
                             /* Ein `s`, dessen GESPIEGELTER Stuetzpunkt das
                                Mass bestimmt: ohne die Spiegelung misst
                                diese Zeile x bis 42 statt bis 50.
                                Der erste Anlauf stand hier mit
                                `M8 56c0-32 24-48 24-48s24 16 24 48Z` und
                                hat nichts bewiesen - dort faellt der
                                zweite Stuetzpunkt der ersten Kurve auf
                                ihren Endpunkt, und die Spiegelung ergibt
                                denselben Punkt. Die Gegenprobe hat es
                                gemeldet: TOR BLEIBT GRUEN.

                                DAS SOLL KOMMT AUS DER REFERENZ, nicht aus
                                dieser Rechnung (Regel 3): die vier Zahlen
                                sind mit `getBBox()` in Chromium abgelesen,
                                also an der SVG-Maschine, die die Zeichnung
                                spaeter wirklich malt. */
                             ['M32 8C8 8 8 32 32 32S56 56 32 56Z', '14,8,50,56']]) {
      const k = pfadKasten(d);
      const ist = [k.links, k.oben, k.rechts, k.unten].map(v => Math.round(v)).join(',');
      if (ist !== soll) ef.push(`die Rahmenrechnung misst „${d}" als ${ist} statt ${soll} `
        + '— dann sagt sie über die Zeichnungen darunter nichts');
    }
    if (ef.length) {
      console.log('    ' + ef.join('\n    '));
      console.error('\n  englisch ROT: die Rahmenrechnung (E7) misst falsch.');
      process.exit(1);
    }
    /* Kasten UND Farbtafel eines mehrteiligen Bildes.
     *
     * Seit die Zeichnungen aus mehreren Flaechen bestehen, ist der Kasten
     * die Vereinigung aller - eine einzelne Flaeche zu messen hiesse, ein
     * Bild an seinem Stiel zu beurteilen. Und die Farben werden gleich
     * mitgezaehlt: ein Name, den `BILDFARBEN` nicht kennt, faellt beim
     * Zeichnen still auf Tinte zurueck, und das Bild sieht aus wie
     * vorher - einfarbig. Genau das war der Anlass dieser Runde. */
    const bildKasten = (stuecke) => {
      let links = 1e9, oben = 1e9, rechts = -1e9, unten = -1e9, fremd = null;
      const farben = new Set(), unbekannt = new Set();
      for (const s of (stuecke || [])) {
        if (EN.BILDFARBEN[s.f]) farben.add(s.f); else unbekannt.add(String(s.f));
        const k = pfadKasten(s.d);
        if (k.fremd) { fremd = k.fremd; continue; }
        links = Math.min(links, k.links); oben = Math.min(oben, k.oben);
        rechts = Math.max(rechts, k.rechts); unten = Math.max(unten, k.unten);
      }
      return { links, oben, rechts, unten, fremd, farben, unbekannt,
               teile: (stuecke || []).length };
    };
    /* Zwei Farben ist das Mindeste, und die Zahl ist keine Schoenheit:
       EINE Farbe heisst, dass das Bild wieder eine Silhouette ist - und
       genau deshalb sind Apfel und Tomate als Umriss kaum zu
       unterscheiden gewesen. Anteilig laesst sich das nicht sagen; es ist
       eine Aussage ueber die Sache und nicht ueber eine Groesse. */
    const FARBEN_MIN = 2;
    /* JEDES Wort im Bildplan ist ENTSCHIEDEN: es hat eine Zeichnung oder
       einen Grund, warum nicht. Vorher sah ein vergessenes Wort im
       Datensatz genau aus wie ein absichtlich weggelassenes - ein
       Unterschied, den keine Pruefung sehen konnte, also hat ihn auch nie
       eine gemeldet (Regel 1). Der Grund steht als Text und nicht als
       Kommentar, weil ein Kommentar fuer ein Werkzeug nicht da ist. */
    const unentschieden = EN.BILDER.filter(b => !(b.bild && b.bild.length) && !b.ohneBild);
    for (const b of unentschieden)
      ef.push(`„${b.wort}" hat weder eine Zeichnung noch ein „ohneBild" mit dem Grund `
        + '— vergessen und absichtlich weggelassen sehen im Datensatz dann gleich aus');
    const ohneGrund = EN.BILDER.filter(b => b.ohneBild && (b.bild && b.bild.length));
    for (const b of ohneGrund)
      ef.push(`„${b.wort}" hat eine Zeichnung UND ein „ohneBild" — der Grund `
        + 'widerspricht dem Bild, und einer von beiden ist veraltet');
    const vls = EN.vorratLesen();
    /* Vier, weil der Bildschirm vier Karten zeigt: das Ziel und drei
       Ablenker. Bei dreien stünde eine Karte leer oder doppelt da, und
       die Ebene versteckt sich statt rot zu werden - `wenn()` blendet sie
       aus. Genau das ist die stille Verfallsart, die hier laut wird. */
    const NOETIG = 4;
    if (vls.length < NOETIG)
      ef.push(`nur ${vls.length} gezeichnete Wörter (nötig ${NOETIG}) — „Lies das Wort" `
        + 'blendet sich dann selbst aus, und niemand sieht, dass eine Ebene fehlt');
    const gesehen = new Map(), nurFormen = new Map();
    const [RB_L, RB_O, RB_R, RB_U] = String(EN.BILD_RAHMEN).trim().split(/\s+/).map(Number);
    for (const x of vls) {
      if (!String(x.id).startsWith('ls:'))
        ef.push(`„${x.id}" trägt nicht die eigene Kennung ls: — dann teilt sich `
          + '„Lies das Wort" den Leitner-Stand mit einer anderen Ebene');
      if (x.sorte !== 'bild')
        ef.push(`„${x.wort}" hat die Sorte „${x.sorte}" — dann kommen die Ablenker `
          + 'aus der falschen Menge');
      /* Verglichen wird die GANZE Zeichnung, nicht eine Flaeche daraus:
         zwei Bilder duerfen sich einen Kreis teilen, nur nicht alles. */
      const abdruck = (x.bild || []).map(s => `${s.f}|${s.d}`).join('~');
      if (gesehen.has(abdruck))
        ef.push(`„${x.wort}" und „${gesehen.get(abdruck)}" sind dieselbe Zeichnung — `
          + 'zwei Karten sähen gleich aus, und eine richtige Antwort gälte als falsch');
      gesehen.set(abdruck, x.wort);
      /* UND DIESELBE ZEICHNUNG IN ANDEREN FARBEN. Das ist die Kopie, die
         der Vergleich weiter unten NICHT findet: er zaehlt Zellen mit
         gleichem Ton, und davon hat eine umgefaerbte Kopie keine einzige.

         WARUM HIER EXAKT UND NICHT UEBER EINE SCHWELLE: bei den Lautpaaren
         faengt eine Deckung ab 90 % die Kopie, weil dort nur zwei Karten
         stehen. Auf diesem Schirm geht das nicht - nachgemessen liegen
         heute NEUN Paare ueber 90 % Deckung, und jedes einzelne ist in
         Ordnung: „happy"/„sad"/„o‘clock"/„football" sind alle derselbe
         Kreis (100 %), die Flaggen von England und Deutschland fuellen
         beide denselben Rahmen (100 %), „big"/„small" sind zwei Kreise
         (96 %). Auch die Rahmenfuellung trennt sie nicht - sie liegt bei
         34 bis 58 %, mitten im Ueblichen (Median 38 %).
         Was eine Kopie wirklich auszeichnet, ist nicht ein Schwellwert,
         sondern dass die PFADE dieselben sind. Das ist genau zu pruefen,
         hat keine falschen Treffer, und heute trifft es nichts. */
      const nurPfade = (x.bild || []).map(s => s.d).sort().join('~');
      if (nurFormen.has(nurPfade))
        ef.push(`„${x.wort}" und „${nurFormen.get(nurPfade)}" sind dieselbe Zeichnung `
          + 'in anderen Farben — dieselben Flächen, nur umgefärbt, und das ist eine '
          + 'Kopie und keine zweite Zeichnung');
      nurFormen.set(nurPfade, x.wort);
      const k = bildKasten(x.bild);
      if (k.unbekannt.size)
        ef.push(`die Zeichnung „${x.wort}" nennt die Farbe `
          + `„${[...k.unbekannt].join('", „')}", und die steht nicht in BILDFARBEN — `
          + 'sie wird beim Zeichnen still zu Tinte, und das Bild sieht aus wie früher');
      if (k.farben.size < FARBEN_MIN)
        ef.push(`die Zeichnung „${x.wort}" hat nur ${k.farben.size} Farbe — dann ist sie `
          + 'wieder eine Silhouette, und ein Apfel ist von einer Tomate kaum zu '
          + 'unterscheiden');
      if (k.fremd) { ef.push(`die Zeichnung „${x.wort}" benutzt den Befehl „${k.fremd}", `
        + 'den die Rahmenrechnung nicht kennt — sie misst ab dort Unsinn'); continue; }
      if (k.links < RB_L - 0.01 || k.oben < RB_O - 0.01
          || k.rechts > RB_L + RB_R + 0.01 || k.unten > RB_O + RB_U + 0.01)
        ef.push(`„${x.wort}" liegt bei x ${k.links.toFixed(1)}..${k.rechts.toFixed(1)}, `
          + `y ${k.oben.toFixed(1)}..${k.unten.toFixed(1)} und damit ausserhalb des `
          + `Rahmens „${EN.BILD_RAHMEN}" — was draussen liegt, schneidet das SVG ab`);
      /* Anteilig am Rahmen und nicht in absoluten Punkten (Regel 2):
         wird der Rahmen einmal groesser, wandert die Grenze mit.
         55 % ist keine Schoenheitsgrenze, sondern der Abstand zum
         kleinsten, das heute steht - „egg" mit 66 %. Wer darunter
         faellt, steht als Fleck neben drei ausgewachsenen Bildern. */
      const fuellt = Math.max(k.rechts - k.links, k.unten - k.oben) / Math.max(RB_R, RB_U);
      if (fuellt < 0.55)
        ef.push(`„${x.wort}" füllt nur ${(fuellt * 100).toFixed(0)} % seines Rahmens — `
          + 'neben drei ausgewachsenen Bildern ist das kleine erkennbar das andere, '
          + 'und die Aufgabe ist ohne ein Wort Englisch zu lösen');
    }
    /* --- Sehen zwei Karten gleich aus? (E7b) -------------------------
     *
     * Bis hierher hat das Tor nur GLEICHE Zeichnungen gefunden - Zeichen
     * fuer Zeichen dieselbe. Das ist die eine Verfallsart, die nie
     * eintritt. Die wirkliche ist die AEHNLICHE: „ham" war zwei ovale
     * Scheiben von oben, „tomato" ist eine Kugel mit Blatt, und bei 76
     * Bildpunkten sind beide ein roter Ball. Wer „ham" liest und die
     * Tomate antippt, hat nichts falsch gemacht - die Aufgabe war die
     * falsche.
     *
     * GEMESSEN WIRD ZELLWEISE, und das ist der Kern. Der erste Anlauf hat
     * Umriss und Farbe GETRENNT gerechnet: Deckungsgrad der Silhouette,
     * daneben der Abstand der Farbanteile. Das ging an zwei Stellen am
     * Auge vorbei - „happy" und „sad" decken sich zu 100 %, weil beide
     * derselbe Kreis sind, und sind trotzdem nicht zu verwechseln; „bye"
     * (Hand) und „colour" (Palette) galten als aehnlich, weil beide viel
     * Creme haben, sehen aber voellig verschieden aus. Erst die Frage
     * „wieviele Zellen tragen in BEIDEN Bildern dieselbe Farbe?" bringt
     * Form und Farbe in EINE Zahl - und die Rangfolge stimmt dann mit
     * dem ueberein, was auf dem Blatt zu sehen ist (Regel 4: kein Tor
     * ersetzt den Blick; hier hat der Blick das Mass ausgesucht).
     *
     * DIE MESSSTELLE (Regel 5): 24 x 24 Zellen ueber dem Rahmen
     * „0 0 64 64", je Zelle die Farbe der ZULETZT gezeichneten Flaeche -
     * so, wie ein SVG malt. Gezaehlt wird ueber die Vereinigung beider
     * Bilder, leere Zellen zaehlen nicht mit. Zwei Toene, die sich nur im
     * Namen unterscheiden (`rot` und `rotDunkel`), gelten als
     * verschieden; die Zahl ist damit eher zu niedrig als zu hoch.
     */
    const N_RASTER = 24;
    const bildRaster = (stuecke) => {
      const feld = new Array(N_RASTER * N_RASTER).fill(null);
      for (const st of stuecke || []) {
        const z = pfadZug(st.d);
        if (z.fremd) continue;
        // Die Kanten aller Teilpfade EINES Stuecks zusammen - `evenodd`
        // gilt ueber das ganze `<path>`, nicht je Teilpfad. Wer je
        // Teilpfad fuellt, verliert jedes Loch (Auge, Fenster, Griff).
        const kanten = [];
        for (const zug of z.zuege) {
          for (let i = 0; i + 1 < zug.length; i++) kanten.push([zug[i], zug[i + 1]]);
          if (zug.length > 2) kanten.push([zug[zug.length - 1], zug[0]]);
        }
        // Zeilenweise: je Zeilenmitte die Schnittpunkte sammeln, sortieren,
        // und zwischen je zwei aufeinanderfolgenden fuellen. Das IST die
        // Gerade-ungerade-Regel.
        for (let r = 0; r < N_RASTER; r++) {
          const y = RB_O + (r + 0.5) * RB_U / N_RASTER;
          const xs = [];
          for (const [[x1, y1], [x2, y2]] of kanten) {
            if ((y1 <= y) === (y2 <= y)) continue;
            xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
          }
          xs.sort((a, b) => a - b);
          for (let k = 0; k + 1 < xs.length; k += 2) {
            for (let c = 0; c < N_RASTER; c++) {
              const x = RB_L + (c + 0.5) * RB_R / N_RASTER;
              if (x >= xs[k] && x <= xs[k + 1]) feld[r * N_RASTER + c] = st.f;
            }
          }
        }
      }
      return feld;
    };
    /* SELBSTPROBE (Regel 1). Ein Raster, das nichts fuellt, meldet fuer
       JEDES Paar 0 % - und sieht dabei aus wie ein bestandener Vergleich.
       Drei Faelle, deren Ausgang ohne Rechnung feststeht: derselbe Rahmen
       mit sich (ganz gleich), derselbe Rahmen in einer anderen Farbe
       (gleiche Zellen, keine gleiche Farbe: 0 %), und eine Haelfte gegen
       das Ganze (die Haelfte deckt die halbe Vereinigung: 50 %). */
    /* ZWEI FARBEN SIND DERSELBE TON, wenn sie weniger als 22 CIELAB
       auseinanderliegen. Der erste Anlauf hat NAMEN verglichen, und das
       ging still daneben: `rot` und `rotDunkel` sind 15,6 auseinander -
       nebeneinander dieselbe rote Flaeche, fuer die Rechnung aber zwei
       verschiedene Dinge. Ein Bild, das ein anderes nur heller
       nachzeichnet, kam so durch.

       DIE 22 IST GEMESSEN UND NICHT GEWAEHLT: alle neun Hell/Dunkel-Paare
       von BILDFARBEN liegen zwischen 11,0 und 20,6, das naechste Paar
       zweier wirklich verschiedener Farben (`grau`/`wolke`) bei 22,4. Die
       Grenze liegt in dieser Luecke - darunter ist alles ein Tonpaar,
       darueber beginnen die Farben. Die Tafel ist klein und die Antwort
       haengt nur an zwei Namen, also wird sie gemerkt. */
    const TON_GLEICH = 22;
    const tonTafel = new Map();
    const selberTon = (a, b) => {
      if (a === b) return true;
      const k = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (tonTafel.has(k)) return tonTafel.get(k);
      const ha = EN.BILDFARBEN[a], hb = EN.BILDFARBEN[b];
      // Ein unbekannter Name faellt beim Zeichnen auf Tinte zurueck, und
      // genau so wird er hier gerechnet - sonst misst das Tor ein Bild,
      // das es so nie gibt. Gemeldet wird der Name eine Zusage weiter oben.
      const v = labAbstand(ha || EN.BILDFARBEN.tinte, hb || EN.BILDFARBEN.tinte)
        < TON_GLEICH;
      tonTafel.set(k, v); return v;
    };
    /* NUR DIE FLAECHE, ohne Farbe. Der Zellvergleich oben braucht Form UND
       Ton; wer eine Zeichnung KOPIERT und umfaerbt, kommt bei ihm mit 0 %
       durch. Auf dem Vier-Karten-Schirm ist das richtig - dort trennt die
       Farbe die Karten. Auf dem Zwei-Karten-Schirm der Lautpaare ist es
       falsch: Fiona liest nicht, und zwei Taxis in zwei Farben sind fuer
       sie zwei Taxis. Dort wird deshalb die Silhouette gemessen. */
    const deckung = (a, b) => {
      let schnitt = 0, ver = 0;
      for (let k = 0; k < N_RASTER * N_RASTER; k++) {
        const x = !!a[k], y = !!b[k];
        if (x && y) schnitt++;
        if (x || y) ver++;
      }
      return ver ? schnitt / ver : 0;
    };
    const gleichheit = (a, b) => {
      let gleich = 0, ver = 0;
      for (let k = 0; k < N_RASTER * N_RASTER; k++) {
        const x = a[k], y = b[k];
        if (!x && !y) continue;
        ver++; if (x && y && selberTon(x, y)) gleich++;
      }
      return ver ? gleich / ver : 0;
    };
    const voll = bildRaster([{ f: 'rot', d: 'M0 0h64v64H0Z' }]);
    const vollBlau = bildRaster([{ f: 'blau', d: 'M0 0h64v64H0Z' }]);
    const vollRotDunkel = bildRaster([{ f: 'rotDunkel', d: 'M0 0h64v64H0Z' }]);
    const halb = bildRaster([{ f: 'rot', d: 'M0 0h64v32H0Z' }]);
    for (const [was, ist, soll] of [
      ['der volle Rahmen mit sich selbst', gleichheit(voll, voll), 1],
      ['derselbe Rahmen in einer anderen Farbe', gleichheit(voll, vollBlau), 0],
      /* Die beiden Faelle, die den TONVERGLEICH pruefen und nicht das
         Raster: `rot` gegen `rotDunkel` ist derselbe Ton (15,6 CIELAB),
         `rot` gegen `blau` nicht (76,0). Ohne sie waere ein Vergleich, der
         wieder nur Namen zaehlt, von aussen nicht zu unterscheiden - er
         bestuende alle vier anderen Faelle. */
      ['denselben Rahmen in einem helleren Ton derselben Farbe',
        gleichheit(voll, vollRotDunkel), 1],
      ['den Abstand von rot zu rotDunkel unter der Tongrenze',
        labAbstand(EN.BILDFARBEN.rot, EN.BILDFARBEN.rotDunkel) < TON_GLEICH ? 1 : 0, 1],
      ['den Abstand von rot zu blau über der Tongrenze',
        labAbstand(EN.BILDFARBEN.rot, EN.BILDFARBEN.blau) >= TON_GLEICH ? 1 : 0, 1],
      ['die obere Hälfte gegen den vollen Rahmen', gleichheit(halb, voll), 0.5],
      ['die gefüllte Fläche des vollen Rahmens',
        voll.filter(Boolean).length / (N_RASTER * N_RASTER), 1],
    ]) if (Math.abs(ist - soll) > 0.02)
      ef.push(`der Zellvergleich misst ${was} als ${(ist * 100).toFixed(0)} % statt `
        + `${(soll * 100).toFixed(0)} % — dann sagt er über die Zeichnungen nichts`);

    /* DIE EICHUNG WIRD NACHGERECHNET, nicht behauptet.
     *
     * Die Tabelle unten stand bis hierher als Kommentar. Ein Kommentar
     * haelt aber nichts fest: wer eine der drei Zahlen verschiebt,
     * verschiebt sie ungestraft, und die Eichung ist still weg - genau
     * die Verfallsart, gegen die dieses Verzeichnis seine Gegenproben
     * hat (Regel 1: was nie etwas meldet, ist kein Beweis).
     *
     * Jetzt stehen die beurteilten Paare als Daten in
     * `tor/bildurteile.mjs`, samt den ALTEN Flaechen der drei
     * Zeichnungen, die deswegen ersetzt worden sind - ein
     * Rueckfallvorrat. Hier wird jedes mit der heutigen Regel
     * eingeordnet und mit dem Urteil vom Blatt verglichen.
     */
    const urteilRaster = (e, welche) => {
      const eigen = welche === 'a' ? e.bildA : e.bildB;
      if (eigen) return bildRaster(eigen);
      const w = welche === 'a' ? e.a : e.b;
      const x = vls.find(v => v.wort === w);
      return x ? bildRaster(x.bild) : null;
    };

    /* Die Grenze, und sie ist mit dem Tonvergleich neu gemessen: Median
       3 %, 99. Hundertstel 42 %, hoechstes Paar 61 % („bread" gegen
       „chocolate"). Vier Punkte Luft, dieselbe Ratsche wie vorher.

       WARUM SIE NICHT NIEDRIGER LIEGT, obwohl 61 % viel klingt: das Mass
       hat FALSCHE TREFFER. „apple" gegen „pullover" (58 %) und „chicken"
       gegen „eat" (53 %) sind auf dem Blatt nicht zu verwechseln - beide
       Male ist nur die Hauptfarbe dieselbe und die Masse aehnlich verteilt.
       Ein falscher Treffer kostet eine Zeichnung, eine verpasste Falle
       kostet ein Kind: deshalb das strengere Mass MIT der loseren Grenze,
       und deshalb nennt der Bericht die DREI hoechsten Paare in jedem Lauf.
       Das Tor faengt den groben Fall; das Abdriften sieht ein Mensch
       (Regel 4 - kein Tor ersetzt den Blick).

       Zwei Paare lagen darueber und sind geaendert worden: „boy" gegen
       „old" mit 60 % - zwei Menschen mit creme Kopf und blauem Rumpf, die
       sich nur in der Haarfarbe unterschieden - und, schon vorher, „ham"
       gegen „tomato" und „jeans" gegen „shirt". */
    const GLEICH_MAX = 0.65;
    /* Die Grenze fuer den Zwei-Karten-Schirm der Lautpaare (E5b). Sie
       steht hier neben ihrer Schwester, damit man beide Zahlen zusammen
       sieht und nicht eine davon vergisst; begruendet ist sie dort, wo
       sie greift. */
    const LAUT_GLEICH_MAX = 0.30;
    const LAUT_DECKUNG_MAX = 0.90;
    /* DIE EINE AUSNAHME, und sie ist keine Nachsicht: auf dem Blatt „Wo?"
       SOLLEN die Bilder sich gleichen. Der Hinweis in BILDGEBIETE sagt es
       woertlich - dieselbe Kiste, derselbe Ball, und der einzige
       Unterschied ist, wo der Ball liegt. Waeren sie verschieden
       gezeichnet, lernte ein Kind „mal eine Kiste, mal ein Korb" statt
       „auf, unter, hinter". Die Ausnahme gilt nur, wenn BEIDE Woerter
       dort stehen. */
    /* DIE ZWEITE FANGBEDINGUNG, und sie ist der eigentliche Fortschritt.
     *
     * Eine einzelne Zahl trennt die Faelle nicht. Nachgemessen an zehn
     * Paaren, deren Urteil vom BLATT kommt und nicht von der Rechnung
     * (Regel 3) - drei davon sind Fallen, die ich deshalb ersetzt habe,
     * sieben sind hoch gemessene, aber unverwechselbare Paare:
     *
     *                          zellgleich   Deckung
     *   FALLE  ham/tomato          63 %      77 %
     *   FALLE  old/boy             60 %      77 %
     *   FALLE  shirt/jeans         60 %      81 %
     *   harmlos apple/pullover     58 %      69 %
     *   harmlos bread/chocolate    61 %      67 %
     *   harmlos chair/schoolbag    55 %      65 %
     *   harmlos bye/colour         49 %      69 %
     *   harmlos chicken/eat        53 %      55 %
     *   harmlos o‘clock/football   46 %      99 %
     *   harmlos happy/sad          11 %     100 %
     *
     * ZELLGLEICH ALLEIN TRENNT NICHT: „bread/chocolate" liegt mit 61 %
     * ueber zwei der drei Fallen. DECKUNG ALLEIN AUCH NICHT: „happy/sad"
     * ist derselbe Kreis. ZUSAMMEN aber trennen sie sauber - alle drei
     * Fallen liegen ueber 55 % zellgleich UND ueber 75 % Deckung, alle
     * sieben harmlosen reissen mindestens eine der beiden.
     *
     * Sie kommt ZUSAETZLICH zur alten Grenze und ersetzt sie nicht: was
     * bei 65 % zellgleich schon rot war, bleibt rot. Damit wird das Tor
     * strenger und nicht anders. Heute trifft die neue Bedingung nichts;
     * der naechste harmlose Fall liegt sechs Punkte Deckung darunter. */
    const GLEICH_ENG = 0.55, DECKUNG_ENG = 0.75;
    const WO = 'wo';
    /* Einmal rastern und nicht je Paar: 84 Bilder ergeben 3486 Paare, und
       ohne diese Zeile waere jedes Bild 83-mal gerastert worden. */
    const gerastert = vls.map(x => bildRaster(x.bild));
    const spitze = [];
    for (let i = 0; i < vls.length; i++) for (let j = i + 1; j < vls.length; j++) {
      const a = vls[i], b = vls[j];
      const beideWo = a.gebiet === WO && b.gebiet === WO;
      const g = gleichheit(gerastert[i], gerastert[j]);
      const d = deckung(gerastert[i], gerastert[j]);
      if (!beideWo) {
        spitze.push({ a: a.wort, b: b.wort, g, d });
        spitze.sort((x, y) => y.g - x.g);
        if (spitze.length > 3) spitze.pop();
      }
      /* Die verschobene Kopie. Sie steht HIER und nicht oben beim
         Abdruck, weil sie die Ausnahme fuer das Blatt „Wo?" braucht: dort
         sind vier Paare gleich gebaut, und das ist die Lehre. */
      const kA = kopieAbstand(a.bild, b.bild);
      if (!beideWo && kA !== null && kA <= KOPIE_ABSTAND)
        ef.push(`„${a.wort}" und „${b.wort}" sind gleich gebaut und liegen nur `
          + `${kA} Punkte auseinander (Grenze ${KOPIE_ABSTAND}) — dieselbe Zeichnung, `
          + 'verschoben und umgefärbt, und das ist eine Kopie und keine zweite '
          + 'Zeichnung');
      if (beideWo) continue;
      const eng = g >= GLEICH_ENG && d >= DECKUNG_ENG;
      if (g < GLEICH_MAX && !eng) continue;
      ef.push(`„${a.wort}" und „${b.wort}" sind zu ${(g * 100).toFixed(0)} % `
        + `zellgleich bei ${(d * 100).toFixed(0)} % Deckung — `
        + (eng && g < GLEICH_MAX
            ? `beides zusammen über der Grenze (${(GLEICH_ENG * 100).toFixed(0)} % und `
              + `${(DECKUNG_ENG * 100).toFixed(0)} %)`
            : `über der Grenze von ${(GLEICH_MAX * 100).toFixed(0)} %`)
        + ' — zwei Karten, die nebeneinander gleich aussehen, und wer die falsche '
        + 'antippt, hat nichts falsch gemacht');
    }

    /* Die Ablenker kommen aus DIESEM Vorrat und nicht aus den Farben:
       `ablenkerFuer` waehlt den Topf an der Sorte, und diese Weiche ist
       eine Zeile, die still umkippt. Stünden Farbflecken neben einem
       Apfel, waere die Aufgabe ohne Englisch zu loesen. */
    ablenkerPruefen(vls, (s) => ef.push(s), (x, y) => !(y.bild && y.bild.length)
      && `„${x.wort}" bekommt einen Ablenker ohne Zeichnung — ein leerer Kasten `
         + 'ist als Antwort nicht zu erkennen');
    /* Und die Probe aufs Exempel: ordnet die Regel die beurteilten Paare
       noch so ein, wie sie auf dem Blatt aussehen?

       SIE STEHT HIER UND NICHT WEITER UNTEN, und das hat eine Runde
       gekostet: der erste Anlauf hat sie hinter den Ausstieg gesetzt, der
       bei gefuellten `ef` abbricht. Damit schrieb sie in eine Liste, die
       niemand mehr liest - eine Pruefung, die nicht anschlagen KANN, und
       zwar ausgerechnet die, die das Anschlagen der anderen sichert. Ihre
       Gegenprobe hat es gemeldet (Regel 1). */
    let engsteFalle = null, engstesHarmlos = null, falschEin = 0;
    for (const e of URTEILE) {
      const ra = urteilRaster(e, 'a'), rb = urteilRaster(e, 'b');
      if (!ra || !rb) {
        ef.push(`das beurteilte Paar „${e.a}"/„${e.b}" findet seine Zeichnung nicht `
          + '— dann prüft die Eichung ein Paar weniger, ohne dass es jemand merkt');
        continue;
      }
      const g = gleichheit(ra, rb), d = deckung(ra, rb);
      const rot = g >= GLEICH_MAX || (g >= GLEICH_ENG && d >= DECKUNG_ENG);
      if (rot !== (e.urteil === 'falle')) {
        falschEin++;
        ef.push(`die Regel ordnet „${e.a}"/„${e.b}" als ${rot ? 'Falle' : 'harmlos'} ein, `
          + `beurteilt ist es als ${e.urteil} (${(g * 100).toFixed(0)} % zellgleich bei `
          + `${(d * 100).toFixed(0)} % Deckung) — ${e.warum}`);
      }
      /* WIEVIEL LUFT? Es gibt ZWEI Wege, rot zu werden - die alte Grenze
         allein, oder beide neuen zusammen -, und deshalb ist die Luft
         nicht einfach ein Abstand.

         Fuer ein harmloses Paar zaehlt der KUERZESTE Weg dorthin: entweder
         steigt die Zellgleichheit bis 65 %, oder es reisst beide neuen
         Grenzen, und dann kostet das so viel, wie die groessere der beiden
         Luecken misst. Der erste Anlauf hat hier das Maximum genommen und
         damit den BEQUEMSTEN Weg gemeldet - „apple/pullover 7", wo 6
         richtig ist, und „bread/chocolate" gar nicht, obwohl es mit 4 das
         engste Paar von allen ist. Eine Kennzahl, die zu gut aussieht,
         ist schlimmer als keine.

         Fuer eine Falle umgekehrt: sie bleibt gefangen, solange EINER der
         beiden Wege haelt, also zaehlt der laengere. */
      const nachOben = Math.max(0, GLEICH_MAX - g);
      const nachBeiden = Math.max(Math.max(0, GLEICH_ENG - g),
                                  Math.max(0, DECKUNG_ENG - d));
      if (e.urteil === 'falle') {
        const luft = Math.max(g - GLEICH_MAX, Math.min(g - GLEICH_ENG, d - DECKUNG_ENG));
        if (!engsteFalle || luft < engsteFalle.luft) engsteFalle = { e, luft, g, d };
      } else {
        const luft = Math.min(nachOben, nachBeiden);
        if (!engstesHarmlos || luft < engstesHarmlos.luft)
          engstesHarmlos = { e, luft, g, d };
      }
    }

    console.log(`    Sehen zwei Karten gleich aus (E7c): `
      + `${vls.length * (vls.length - 1) / 2} Paare zellweise verglichen `
      + `(${N_RASTER}×${N_RASTER} über „${EN.BILD_RAHMEN}", Töne unter `
      + `${TON_GLEICH} CIELAB gelten als einer) · die drei ähnlichsten: `
      + spitze.map(p => `„${p.a}"/„${p.b}" ${(p.g * 100).toFixed(0)} % bei `
        + `${(p.d * 100).toFixed(0)} % Deckung`).join(', ')
      + ` (Grenze ${(GLEICH_MAX * 100).toFixed(0)} %, oder `
      + `${(GLEICH_ENG * 100).toFixed(0)} % zusammen mit `
      + `${(DECKUNG_ENG * 100).toFixed(0)} % Deckung) · ausgenommen sind nur die `
      + `Bilder des Blatts „Wo?", die sich gleichen sollen`);
    let gleichGebaut = 0, engsteBauart = Infinity, engstesBauartPaar = '';
    for (let i = 0; i < vls.length; i++) for (let j = i + 1; j < vls.length; j++) {
      const k = kopieAbstand(vls[i].bild, vls[j].bild);
      if (k === null) continue;
      gleichGebaut++;
      if (k < engsteBauart) { engsteBauart = k; engstesBauartPaar = `${vls[i].wort}/${vls[j].wort}`; }
    }
    if (ef.length) {
      console.log('    ' + ef.join('\n    '));
      console.error('\n  englisch ROT: die Zeichnungen für „Lies das Wort" (E7) stimmen nicht.');
      process.exit(1);
    }
    const kleinstes = vls.reduce((a, b) => {
      const ka = bildKasten(a.bild), kb = bildKasten(b.bild);
      return Math.max(kb.rechts - kb.links, kb.unten - kb.oben)
           < Math.max(ka.rechts - ka.links, ka.unten - ka.oben) ? b : a;
    });
    const kk = bildKasten(kleinstes.bild);
    const flaechen = vls.reduce((n, x) => n + (x.bild || []).length, 0);
    const jeFarbe = vls.reduce((n, x) => n + bildKasten(x.bild).farben.size, 0);
    const mitGrund = EN.BILDER.filter(b => b.ohneBild).length;
    console.log(`    Lies das Wort (E7): ${vls.length} gezeichnet + ${mitGrund} mit `
      + `Grund ohne Bild = ${vls.length + mitGrund} von ${EN.BILDER.length} Wörtern `
      + `entschieden · ${flaechen} Flächen aus ${Object.keys(EN.BILDFARBEN).length} `
      + `Farben, im Schnitt ${(jeFarbe / vls.length).toFixed(1)} Farben je Bild (nötig `
      + `${FARBEN_MIN}) · jede Zeichnung eigen und im Rahmen „${EN.BILD_RAHMEN}" · `
      + `kleinste „${kleinstes.wort}" mit `
      + `${(Math.max(kk.rechts - kk.links, kk.unten - kk.oben)
        / Math.max(RB_R, RB_U) * 100).toFixed(0)} % (Grenze 55 %)`);
    console.log(`    Verschobene Kopien (E7d): ${gleichGebaut} von `
      + `${vls.length * (vls.length - 1) / 2} Paaren überhaupt gleich gebaut`
      + (gleichGebaut
          ? ` · engstes „${engstesBauartPaar}" mit ${engsteBauart} Punkten `
            + `(Grenze ${KOPIE_ABSTAND})`
          : ''));
    console.log(`    Die Eichung nachgerechnet: ${URTEILE.length} beurteilte Paare `
      + `(${URTEILE.filter(e => e.urteil === 'falle').length} Fallen aus dem `
      + `Rückfallvorrat), ${falschEin === 0 ? 'alle' : URTEILE.length - falschEin} `
      + `richtig eingeordnet · engste Falle „${engsteFalle.e.a}"/„${engsteFalle.e.b}" `
      + `mit ${(engsteFalle.luft * 100).toFixed(0)} Punkten Luft, engstes harmloses `
      + `Paar „${engstesHarmlos.e.a}"/„${engstesHarmlos.e.b}" mit `
      + `${(engstesHarmlos.luft * 100).toFixed(0)}`);

    /* --- „Zwei Wörter, ein Laut" MIT BILDERN (E5 fuer Fiona) ----------
     *
     * Fiona (6) liest nicht. Zwei geschriebene Woerter sind fuer sie kein
     * Bildschirm, sondern zwei Muster - die Ebene gaebe es nur dem
     * Anschein nach. Mit Bildern ist es dieselbe Aufgabe: hoeren und
     * zeigen, und was die beiden unterscheidet, ist genau ein Laut.
     *
     * Vier Arten, wie das leise kaputtgeht:
     *
     *   1. EIN WORT DES PAARES HAT KEIN BILD. Dann stuende ein Bild
     *      neben einem leeren Kasten, und die Antwort waere „das mit dem
     *      Bild" - ohne ein Wort Englisch. `lautpaareMalbar` haelt das
     *      auseinander, und hier wird nachgerechnet, dass es das tut.
     *   2. EINE ZEICHNUNG GEHOERT ZU KEINEM PAAR. Ein Tippfehler im
     *      Schluessel, und das Bild liegt fuer immer ungenutzt da,
     *      waehrend das Paar sich still fuer unmalbar haelt.
     *   3. DIE ZEICHNUNGEN EINES PAARES SIND DIESELBE. Dann sind beide
     *      Karten gleich, und jeder Tipp ist richtig oder falsch, je
     *      nachdem welchen man erwischt.
     *   4. ES SIND ZU WENIGE. Unter der Zahl aus `spiel.js` blendet sich
     *      die Ebene bei Fiona selbst aus - und niemand sieht, dass eine
     *      Ebene fehlt. Genau das ist hier laut zu machen.
     *
     * Rahmen und Groesse werden mit derselben Rechnung geprueft wie bei
     * E7 - sie steht einmal, und das ist der Grund, warum dieser Block
     * hinter jenem steht und nicht davor.
     */
    const lbf = [];
    /* DIE ZAHL KOMMT AUS `spiel.js` und steht nicht hier: sie ist eine
       Aussage ueber Fionas Sitzung, und eine zweite Fassung daneben waere
       die, die veraltet (Regel 6: was zweimal dasteht, veraltet einmal).
       Findet der Ausdruck sie nicht, ist das ein Befund und keine
       Voreinstellung - eine stillschweigende Vier waere die Zahl, die ab
       dann nichts mehr prueft. */
    const spielQuelle = fs.readFileSync('prototyp/spiel.js', 'utf8');
    const noetigTreffer = spielQuelle.match(/const LAUTPAARE_FUER_BILDER = (\d+);/);
    if (!noetigTreffer)
      lbf.push('`LAUTPAARE_FUER_BILDER` steht nicht mehr in spiel.js — die Zahl, '
        + 'unter der sich die Ebene bei Fiona selbst ausblendet, ist damit '
        + 'ungeprüft');
    const NOETIG_BILD = noetigTreffer ? +noetigTreffer[1] : null;
    const malbar = EN.lautpaareMalbar();
    if (NOETIG_BILD !== null && malbar.length < NOETIG_BILD)
      lbf.push(`nur ${malbar.length} gemalte Lautpaare (nötig ${NOETIG_BILD}) — `
        + '„Zwei Wörter, ein Laut" blendet sich bei Fiona dann selbst aus, und '
        + 'niemand sieht, dass eine Ebene fehlt');
    /* Jede Zeichnung gehoert zu einem Wort, das wirklich gefragt wird. */
    const inPaaren = new Set(EN.LAUTPAARE.flatMap(x => [x.a, x.b]));
    for (const wort of Object.keys(EN.LAUTBILDER))
      if (!inPaaren.has(wort))
        lbf.push(`für „${wort}" ist eine Zeichnung da, aber kein Lautpaar fragt danach `
          + '— sie liegt für immer ungenutzt da');
    const abdruckVon = (st) => (st || []).map(s => `${s.f}|${s.d}`).join('~');
    for (const paar of malbar) {
      const a = EN.bildFuerLaut(paar.a), b = EN.bildFuerLaut(paar.b);
      if (abdruckVon(a) === abdruckVon(b))
        lbf.push(`„${paar.a}/${paar.b}" zeigt zweimal dieselbe Zeichnung — dann ist `
          + 'jeder Tipp so richtig wie der andere');
      /* Dieselbe Frage farbenblind. Die Deckung weiter unten faengt auch
         die verschobene Kopie; diese hier faengt die exakte, und sie sagt
         es genauer - „dieselben Pfade" ist eine Aussage, „92 % Deckung"
         eine Schaetzung. */
      const formVon = (st) => (st || []).map(s => s.d).sort().join('~');
      if (formVon(a) === formVon(b))
        lbf.push(`„${paar.a}/${paar.b}" zeigt dieselbe Zeichnung in zwei Farben — `
          + 'dieselben Flächen, nur umgefärbt, und für ein Kind, das nicht liest, '
          + 'sind es zwei gleiche Dinge');
      /* Und die VERSCHOBENE Kopie, die der Abdruck darueber nicht sieht.
         Kein Lautbildpaar ist heute gleich gebaut - hier ist die Ausnahme
         fuer „Wo?" also gar nicht noetig. */
      const kL = kopieAbstand(a, b);
      if (kL !== null && kL <= KOPIE_ABSTAND)
        lbf.push(`„${paar.a}/${paar.b}" zeigt zwei gleich gebaute Zeichnungen, nur `
          + `${kL} Punkte auseinander (Grenze ${KOPIE_ABSTAND}) — eine verschobene `
          + 'Kopie, und für Fiona zweimal dasselbe Ding');
      /* UND DER VIEL WAHRSCHEINLICHERE FALL: nicht dieselbe Zeichnung,
         sondern eine aehnliche. Derselbe Zellvergleich wie bei „Lies das
         Wort" (E7c), aber mit einer STRENGEREN Grenze, und das ist keine
         Willkuer: dort stehen vier Karten und das gelesene Wort engt ein;
         hier stehen ZWEI, und das Bild IST die Antwort. Fiona liest nicht -
         gleichen sich die beiden Bilder, ist die Hoeraufgabe eine Muenze,
         und sie sieht genauso aus wie eine, die funktioniert.

         30 % ist eine Ratsche mit viel Luft, weil das Feld heute weit
         darunter liegt: „three"/„tree" 0 %, „wine"/„vine" 0 %,
         „cab"/„cap" 10 %, „pan"/„pen" 7 %. Vier Paare sind zu wenige fuer
         eine Verteilung; die Zahl sagt deshalb etwas ueber die SACHE - auf
         einem Schirm mit zwei Karten darf ein Drittel gleich sein, mehr
         nicht. */
      const rA = bildRaster(a), rB = bildRaster(b);
      const gL = gleichheit(rA, rB);
      if (gL >= LAUT_GLEICH_MAX)
        lbf.push(`„${paar.a}/${paar.b}" zeigt zwei Zeichnungen, die zu `
          + `${(gL * 100).toFixed(0)} % zellgleich sind (Grenze `
          + `${(LAUT_GLEICH_MAX * 100).toFixed(0)} %) — auf einem Schirm mit nur zwei `
          + 'Karten ist das Bild die ganze Antwort, und Fiona liest nicht');
      /* DIE ZWEITE ZUSAGE, und sie fragt etwas ganz anderes: ist das
         DIESELBE Zeichnung, nur umgefaerbt? Der Zellvergleich sagt dazu
         0 %, weil keine Zelle denselben Ton traegt - genau deshalb braucht
         es die Silhouette daneben.

         DIE GRENZE IST HOCH, und das ist der ganze Punkt. Als Mass fuer
         „sieht aehnlich aus" taugt die Silhouette nicht: „cab" und „cap"
         decken sich zu 60 %, weil ein Taxi und eine Muetze beide breit und
         unten im Rahmen sitzen - unverwechselbar sind sie trotzdem. Bei
         90 % ist es keine Aehnlichkeit mehr, sondern eine Kopie. Heute
         hoechster Wert: 60 %. */
      const dL = deckung(rA, rB);
      if (dL >= LAUT_DECKUNG_MAX)
        lbf.push(`„${paar.a}/${paar.b}" zeigt zwei Umrisse, die sich zu `
          + `${(dL * 100).toFixed(0)} % decken (Grenze `
          + `${(LAUT_DECKUNG_MAX * 100).toFixed(0)} %) — das ist dieselbe Zeichnung in `
          + 'zwei Farben, und für ein Kind, das nicht liest, sind es zwei gleiche Dinge');
      for (const [wort, d] of [[paar.a, a], [paar.b, b]]) {
        const k = bildKasten(d);
        if (k.unbekannt.size)
          lbf.push(`die Zeichnung „${wort}" nennt die Farbe `
            + `„${[...k.unbekannt].join('", „')}", und die steht nicht in BILDFARBEN`);
        if (k.farben.size < FARBEN_MIN)
          lbf.push(`die Zeichnung „${wort}" hat nur ${k.farben.size} Farbe — dann ist sie `
            + 'wieder eine Silhouette, und zwei davon nebeneinander sind zwei Umrisse');
        if (k.fremd) { lbf.push(`die Zeichnung „${wort}" benutzt den Befehl „${k.fremd}", `
          + 'den die Rahmenrechnung nicht kennt'); continue; }
        if (k.links < RB_L - 0.01 || k.oben < RB_O - 0.01
            || k.rechts > RB_L + RB_R + 0.01 || k.unten > RB_O + RB_U + 0.01)
          lbf.push(`„${wort}" liegt ausserhalb des Rahmens „${EN.BILD_RAHMEN}" `
            + `(x ${k.links.toFixed(1)}..${k.rechts.toFixed(1)}, `
            + `y ${k.oben.toFixed(1)}..${k.unten.toFixed(1)}) — was draussen liegt, `
            + 'schneidet das SVG ab');
        const fuellt = Math.max(k.rechts - k.links, k.unten - k.oben) / Math.max(RB_R, RB_U);
        if (fuellt < 0.55)
          lbf.push(`„${wort}" füllt nur ${(fuellt * 100).toFixed(0)} % seines Rahmens — `
            + 'neben einem ausgewachsenen Bild ist das kleine erkennbar das andere');
      }
    }
    /* Und der Vorrat, den das Spiel wirklich baut: jedes Stueck traegt
       BEIDE Pfade. Ohne den zweiten wuesste der Bildschirm nicht, was er
       auf die andere Karte malen soll, und zeigte dort das Wort. */
    for (const x of EN.vorratLaute({ nurMalbar: true }))
      if (!(x.bild && x.bild.length) || !(x.gegenBild && x.gegenBild.length))
        lbf.push(`dem Lautstück „${x.id}" fehlt eine der beiden Zeichnungen — dann `
          + 'stünde ein Bild neben einem Wort, und die Antwort wäre „das mit dem Bild"');
    if (lbf.length) {
      console.log('    ' + lbf.join('\n    '));
      console.error('\n  englisch ROT: die gemalten Lautpaare (E5 für Fiona) stimmen nicht.');
      process.exit(1);
    }
    const jeStolperBild = new Map();
    for (const p of malbar)
      jeStolperBild.set(p.stolper, (jeStolperBild.get(p.stolper) || 0) + 1);
    const lautMass = malbar.map(p => {
      const rA = bildRaster(EN.bildFuerLaut(p.a)), rB = bildRaster(EN.bildFuerLaut(p.b));
      return { p, g: gleichheit(rA, rB), d: deckung(rA, rB) };
    });
    const spitzeG = [...lautMass].sort((x, y) => y.g - x.g)[0];
    const spitzeD = [...lautMass].sort((x, y) => y.d - x.d)[0];
    console.log(`    Sehen die zwei Karten gleich aus (E5b): ähnlichstes Paar `
      + `„${spitzeG.p.a}/${spitzeG.p.b}" mit ${(spitzeG.g * 100).toFixed(0)} % zellgleich `
      + `(Grenze ${(LAUT_GLEICH_MAX * 100).toFixed(0)} % — strenger als die `
      + `${(GLEICH_MAX * 100).toFixed(0)} % bei vier Karten, weil hier nur zwei stehen) · `
      + `deckungsgleichste Umrisse „${spitzeD.p.a}/${spitzeD.p.b}" mit `
      + `${(spitzeD.d * 100).toFixed(0)} % (Grenze `
      + `${(LAUT_DECKUNG_MAX * 100).toFixed(0)} %, dort wäre es eine umgefärbte Kopie)`);
    console.log(`    Zwei Wörter, ein Laut mit Bildern (E5): ${malbar.length} von `
      + `${EN.LAUTPAARE.length} Paaren gemalt (nötig ${NOETIG_BILD}, aus spiel.js) · `
      + `${[...jeStolperBild].map(([s, n]) => `${s} ${n}`).join(', ')} · `
      + `${Object.keys(EN.LAUTBILDER).length} eigene Zeichnungen, `
      + `${malbar.length * 2 - Object.keys(EN.LAUTBILDER).length} aus dem Bildplan · `
      + `${Object.values(EN.LAUTBILDER).reduce((n, s) => n + s.length, 0)} Flächen`);
  }
}

/* ============================================= Tor `tiere` (T1) ========= *
 *
 * Die Tiere sind Aufkleber fuer eine FERTIGE EBENE - und daran haengt
 * alles, was hier geprueft wird:
 *
 *   Ein Lebensraum ohne Ebene ist nie zu oeffnen. Sein Bild waere gemalt
 *   und laege fuer immer blass im Buch, und niemand koennte sagen, ob das
 *   ein Fehler ist oder Absicht.
 *   Eine Kennung ohne Eintrag ist ein Absturz beim Aufschlagen des Buchs.
 *   Und `transform` oder `<circle>` im Bild machen jede Messung von
 *   `passt` falsch - dieselbe Messstelle wie beim Englischbild (E3), und
 *   dort hat sie eine Runde gekostet.
 *
 * Die ZAHL der gemalten steht mit da. Sie ist der Stand des Plans, und
 * ohne sie waere „noch nicht gemalt" eine Erinnerung statt einer Zahl.
 */
/* Die Paartafel aus dem GEBAUTEN Buendel - genau das, was die App liest.
   Geprueft wird `dist/` und nicht der Prototyp (Regel 7). */
function paareAusBuendel() {
  /* `null` statt eines Absturzes, wenn es die Datei nicht gibt.
     Ein abgestuerztes Tor besteht jede Gegenprobe (Regel 11) - und
     hier hat es nicht einmal das getan, sondern die ganze Kette
     mitgerissen. Fehlt das Buendel, sagt der Aufrufer das in einem
     Satz; das Tor wird rot, aber es MELDET. */
  if (!fs.existsSync('dist/index.html')) return null;
  const h = fs.readFileSync('dist/index.html', 'utf8');
  const i = h.indexOf('"paare":');
  if (i < 0) return null;
  const s = h.slice(i);
  let tiefe = 0, a = s.indexOf('{'), b = a;
  for (; b < s.length; b++) {
    if (s[b] === '{') tiefe++;
    else if (s[b] === '}') { tiefe--; if (!tiefe) break; }
  }
  try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { return null; }
}

{
  const tf = [];
  const spiel = fs.readFileSync('prototyp/spiel.js', 'utf8');
  /* Die Ebenenkennungen aus der Liste in `spiel.js` - dieselbe Quelle, aus
     der auch das Spiel sie nimmt. Eine zweite Liste hier waere die, die
     bei der naechsten Ebene veraltet (Regel 6: was zweimal dasteht,
     veraltet einmal). */
  /* `,\s+ueber:` und nicht `, ueber:` - eine Zeile richtet ihre Spalten
     mit zwei Leerzeichen aus, und der erste Anlauf hat `hauptstaedte`
     genau daran verloren und den Lebensraum „In der Stadt" als
     unerreichbar gemeldet. Ein Ausdruck, der an der Einrueckung haengt,
     misst die Einrueckung. */
  const ebenen = new Set([...spiel.matchAll(/\{ id:'([a-z:]+)',\s+ueber:'/g)].map(m => m[1]));
  /* Die Laenderebenen stehen nicht als Zeile da, sie werden aus den
     Kontinenten ERZEUGT (`id:\`laender:${k}\``). Also kommen ihre
     Kennungen aus derselben Quelle wie im Spiel: den geladenen Karten.
     Eine abgeschriebene Liste waere die, die bei der achten Karte
     veraltet. */
  /* Seit F2 werden auch die FLAGGENEBENEN so erzeugt (`id:\`flaggen:${k}\``).
     Die Erkennung lief nur auf `laender:` und kannte deshalb keine
     einzige Flaggenkarte - dieselbe Falle wie bei der achten Karte, nur
     eine Zeile weiter unten. Gesucht wird jetzt nach der FORM und nicht
     nach dem Wort: was `id:\`<stamm>:${k}\`` schreibt, gilt fuer jede
     Karte. */
  for (const m of spiel.matchAll(/id:`([a-z]+):\$\{k\}`/g))
    for (const k of Object.keys(KARTEN_GROB)) ebenen.add(`${m[1]}:${k}`);
  /* ... UND DIE EINE FAMILIE, DIE NICHT AUF JEDER KARTE ENTSTEHT (I22).
   *
   * „Was ist groesser?" steht mit demselben `id:\`groesser:${k}\`` da wie
   * die anderen, hat davor aber einen Filter: eine Karte bekommt die
   * Ebene nur, wenn ihre Paare fuer ZWEI volle Sitzungen reichen -
   * dieselbe Grenze, die `vielfalt` setzt. Es genuegt, dass EIN Profil
   * das schafft; fuer die anderen steht `wer` an der Ebene.
   *
   * Der erste Anlauf (I22) verglich mit der KUERZESTEN Sitzung und
   * einer statt zwei Runden. Damit standen hier zwei Ebenen mehr, als
   * es gibt - eine Ueberschaetzung, die genau das kaputtmacht, wofuer
   * die Pruefung da ist: sie meldet dann IMMER etwas.
   *
   * Beide Zahlen kommen von dort, wo das Spiel sie auch herhat: die
   * Paare aus dem gebauten Buendel, die Sitzungslaengen aus `PROFILE`.
   * Eine dritte Fassung des Filters hier waere die, die auseinanderlaeuft. */
  if ([...ebenen].some(e => e.startsWith('groesser:'))) {
    const sitzungen = [...spiel.matchAll(/sitzung:\s*(\d+)/g)].map(m => +m[1]);
    const kurz = Math.min(...sitzungen);
    const paare = paareAusBuendel();
    if (!paare) tf.push('die Paartafel `paare` steht nicht im gebauten Bündel — '
      + 'ohne sie ist jede Aussage über „Was ist größer?" geraten');
    else for (const e of [...ebenen]) {
      if (!e.startsWith('groesser:')) continue;
      if ((paare[e.slice(9)] || []).length < 2 * kurz) ebenen.delete(e);
    }
  }
  if (ebenen.size < 8) tf.push(`nur ${ebenen.size} Ebenen in spiel.js gefunden — `
    + 'die Erkennung greift ins Leere, und alles darunter beweist nichts');

  const ids = new Set();
  for (const t of TI.TIERE) {
    if (ids.has(t.id)) tf.push(`die Kennung „${t.id}" gibt es zweimal`);
    ids.add(t.id);
    if (!/^(der|die|das) /.test(t.name))
      tf.push(`„${t.id}" hat keinen Artikel im Namen — Fiona lernt ihn mit`);
    if (!t.bild) continue;
    /* KEIN `transform`, KEIN `<circle>`: `passt` misst die gezeichnete
       Ausdehnung je PFAD im eigenen Koordinatenraum. Eine
       Gruppentransformation faellt heraus, ein `<circle>` wird gar nicht
       gefunden - und heraus kommt eine Zahl, die mit dem Bild nichts zu
       tun hat. */
    if (/transform=/.test(t.bild)) tf.push(`„${t.id}" hat ein transform im Bild`);
    if (/<circle|<ellipse|<rect/.test(t.bild))
      tf.push(`„${t.id}" hat ein <circle>, <ellipse> oder <rect> — nur <path>`);
    if (!/^<path /.test(t.bild)) tf.push(`„${t.id}" faengt nicht mit einem Pfad an`);
    if (!/fill="#/.test(t.bild))
      tf.push(`„${t.id}" traegt keine eigene Farbe — ein Fuchs ist orange`);
    /* Der pastellene Grund gehoert zum Aufkleber. Ohne ihn klebt das Tier
       auf Weiss, und aus dem Aufkleber wird ein Kaestchen mit einem Bild
       darin - der Unterschied, um den es bei T1b ging. */
    if (!/^#[0-9a-f]{6}$/i.test(t.ton || ''))
      tf.push(`„${t.id}" hat keinen Aufkleberton (\`ton\`)`);
    /* JEDES AUGE BRAUCHT SEINEN LICHTPUNKT.
       Gemessen und nicht behauptet: ein weisser Pfad, der KLEINER ist als
       der dunkle daneben. Ohne ihn wirken die Tiere leblos - das war der
       groesste Unterschied zwischen dem ersten und dem zweiten Satz, und
       es ist die eine Sache, die man beim Nachzeichnen vergisst. */
    if (!/fill="#ffffff"/.test(t.bild) && !/fill="#fff"/.test(t.bild)
        && !/fill="#f[cdef]/i.test(t.bild))
      tf.push(`„${t.id}" hat nirgends Weiss — fehlt der Lichtpunkt im Auge?`);
  }

  /* EIN RAUM HAENGT AN EINER EBENE ODER AN EINER ZAHL - nie an beidem
   * und nie an keinem. Ohne beides waere er gar nicht zu oeffnen, mit
   * beidem gaebe es zwei Wege zu denselben drei Tieren, und welcher
   * zuerst greift, entschiede die Reihenfolge in der Liste. */
  const raumTitel = new Map();
  const titelGesehen = new Set();
  for (const r of TI.RAEUME) {
    const hatEbenen = Array.isArray(r.ebenen) && r.ebenen.length > 0;
    if (hatEbenen === !!r.ab)
      tf.push(`„${r.titel}" hängt ${hatEbenen ? 'an Ebenen UND an einer Zahl'
        : 'weder an einer Ebene noch an einer Zahl'} — genau eines von beidem`);
    if (r.ab !== undefined && !(Number.isInteger(r.ab) && r.ab > 0))
      tf.push(`„${r.titel}" öffnet sich bei „${r.ab}" — das ist keine Anzahl`);
    /* EIN TITEL, EIN RAUM. Vor I15 durften sich zwei Eintraege einen
       Titel teilen (die beiden Hauptstadt-Ebenen taten es), und ihre
       Tierlisten mussten dann von Hand gleich sein. Seit ein Raum eine
       LISTE von Ebenen haelt, gibt es dafuer keinen Grund mehr - und
       vier Stellen, die vorher nach Titel entdoppeln mussten, brauchen
       es nicht mehr. */
    if (titelGesehen.has(r.titel))
      tf.push(`„${r.titel}" steht zweimal in RAEUME — ein Raum hält seine `
        + 'Ebenen jetzt als Liste, zwei Einträge sind zwei Wahrheiten');
    titelGesehen.add(r.titel);
    for (const e of (r.ebenen || []))
      if (!ebenen.has(e))
        tf.push(`der Lebensraum „${r.titel}" haengt an der Ebene „${e}", `
          + 'die es in spiel.js nicht gibt — sie waere nie zu öffnen');
    if (r.tiere.length !== 3)
      tf.push(`„${r.titel}" hat ${r.tiere.length} Tiere, nicht drei`);
    for (const id of r.tiere)
      if (!ids.has(id)) tf.push(`„${r.titel}" nennt „${id}", das es im Plan nicht gibt`);
    /* Ein Tier gehoert in EINEN Raum. Zwei Raeume mit demselben Tier
       hiessen: das Fertigwerden der einen Ebene nimmt der anderen ihren
       Lohn weg - und im Buch stuende dasselbe Stueck zweimal. Zwei
       Raeume duerfen sich einen TITEL teilen (die beiden
       Hauptstadt-Ebenen tun es), dann aber mit derselben Liste. */
    for (const id of r.tiere) {
      const wo = raumTitel.get(id);
      if (wo && wo !== r.titel)
        tf.push(`„${id}" steht in „${wo}" UND in „${r.titel}"`);
      raumTitel.set(id, r.titel);
    }
  }
  /* UND DIE ZWEITE RICHTUNG: JEDE EBENE FUEHRT IN EINEN RAUM (I15).
   *
   * Der Kopfkommentar in `tiere.js` hat sie ab T1 behauptet, und es gab
   * sie nie. Beim ersten Lauf waren 26 der 48 Ebenen ohne Raum: alle
   * zehn Flaggenebenen, die drei Ebenen der achten Karte, sechs
   * Rechenarten aus I4/I10/I13, sechs Englischebenen, „Gestern und
   * heute" und „Das kleine Wort".
   *
   * Eine Ebene ohne Raum ist nicht kaputt - man kann sie spielen und
   * fertig machen. Sie gibt nur nie etwas, und zwar STILL: der
   * Endbildschirm sagt „Gut gemacht" und sonst nichts, und niemand
   * merkt, dass hier ein Lohn fehlt. Das ist genau die Verfallsart, die
   * mit jeder neuen Ebene wieder auftritt - deshalb ein Tor und keine
   * Erinnerung.
   *
   * Geprueft wird ueber `raumZu`, also ueber genau den Weg, den das
   * Spiel geht (`spiel.js` fragt ihn im Endbildschirm). Eine eigene
   * Suche hier waere eine zweite Wahrheit. */
  {
    const ohne = [...ebenen].filter(e => !TI.raumZu(e)).sort();
    if (ohne.length)
      tf.push(`${ohne.length} Ebenen führen in keinen Lebensraum und geben `
        + `deshalb nie ein Tier: ${ohne.join(', ')}`);
  }

  /* JEDE SCHWELLE MUSS FUER JEDES PROFIL ERREICHBAR SEIN (T6).
   *
   * Ein Raum, der sich bei dreissig Tieren oeffnet, ist fuer ein Kind,
   * das nur siebenundzwanzig holen kann, kein Ziel, sondern eine
   * Taeuschung - und im Buch stuende er als naechster Raum, den es nie
   * gibt. Gerechnet wird aus den Ebenen, die dem Profil GEHOEREN, mal
   * drei Tiere je Raum; die Raeume mit Schwelle zaehlen dabei nicht mit,
   * sonst haelte sich die Schwelle an sich selbst fest.
   *
   * Die Zuordnung Ebene -> Profil steht in spiel.js und wird hier
   * GELESEN, nicht abgeschrieben. Eine Ebene ohne `wer` gehoert allen. */
  {
    const werVon = new Map();
    for (const m of spiel.matchAll(/\{ id:'([a-z:]+)', ueber:'[^']*'[^}]*?\}/gs)) {
      const w = m[0].match(/wer:\[([^\]]*)\]/);
      werVon.set(m[1], w ? w[1].replace(/'/g, '').split(',').map(x => x.trim()) : null);
    }
    const profile = [...new Set([...werVon.values()].filter(Boolean).flat())];
    for (const r of TI.RAEUME.filter(x => x.ab)) {
      for (const p of profile) {
        /* Ein Raum zaehlt fuer ein Profil, wenn IRGENDEINE seiner
           Ebenen ihm gehoert - der Hof gehoert Fiona ueber
           `rechnen:plusminus`, auch wenn acht der neun Rechenebenen
           nicht ihre sind. */
        const raeume = new Set(TI.RAEUME
          .filter(x => (x.ebenen || []).some(e => werVon.get(e) === null
            || !werVon.has(e) || werVon.get(e).includes(p)))
          .map(x => x.titel));
        const holbar = raeume.size * 3;
        if (holbar < r.ab)
          tf.push(`„${r.titel}" öffnet sich bei ${r.ab} Tieren, ${p} kann aber `
            + `nur ${holbar} holen (${raeume.size} Räume) — der Raum wäre für `
            + 'dieses Profil nie zu erreichen');
      }
    }
  }

  if (TI.tierMit(TI.GORILLA) === null || !TI.tierMit(TI.GORILLA).bild)
    tf.push('der Gorilla ist nicht gemalt — er ist der einzige, der immer da sein muss');
  if (TI.RAEUME.some(r => r.tiere.includes(TI.GORILLA)))
    tf.push('der Gorilla steht in einem Lebensraum — er wird nicht gesammelt');

  /* EINMAL UND NICHT ZWEIMAL.
   *
   * `raumTiere` bekommt, was das Kind schon hat, und liefert den Rest.
   * Ohne diese Bedingung bekaeme ein Kind, das eine fertige Ebene noch
   * einmal spielt, dieselben Tiere wieder - und im Endbildschirm stuende
   * jedes Mal „Das Outback ist offen!". Ein Lohn, den es bei jedem
   * Durchgang neu gibt, ist keiner.
   *
   * Geprueft wird der zweite Aufruf mit dem Ergebnis des ersten - also
   * genau die Kette, die auch das Spiel faehrt. */
  /* Und dasselbe fuer die Schwelle: bei genau `ab` gibt sie den Raum,
     einen weniger gibt sie nichts, und beim zweiten Mal auch nichts. Die
     mittlere Zeile ist die wichtige - ohne sie waere „ab 30" von „ab 1"
     nicht zu unterscheiden. */
  /* Gerechnet wird mit einem Stand, in dem alle TIEFEREN Schwellen schon
     geholt sind - sonst prueft die Zeile den falschen Raum.
     Bis I20 gab es zwei Schwellen, und ein Stand von 42 Tieren ohne die
     der Tiefsee war eindeutig. Mit acht ist er es nicht mehr: wer 18
     Tiere hat und den Obstgarten (ab 12) noch nicht abgeholt hat,
     bekommt den Obstgarten - richtig so, aber es beweist nichts ueber
     den Fruchtstand. Sieben Meldungen auf einmal, und keine davon war
     ein Fehler im Spiel. */
  for (const r of TI.RAEUME.filter(x => x.ab)) {
    const tiefer = TI.RAEUME.filter(x => x.ab && x.ab < r.ab).flatMap(x => x.tiere);
    const fremd = TI.sammelbar().map(t => t.id)
      .filter(id => !r.tiere.includes(id) && !tiefer.includes(id));
    const stand = (n) => [...tiefer, ...fremd.slice(0, n - tiefer.length)];
    const knapp = TI.raumAbZahl(stand(r.ab - 1));
    if (knapp && knapp.raum.titel === r.titel)
      tf.push(`„${r.titel}" öffnet sich schon bei ${r.ab - 1} Tieren`);
    const genau = TI.raumAbZahl(stand(r.ab));
    if (!genau || genau.raum.titel !== r.titel)
      tf.push(`„${r.titel}" öffnet sich bei ${r.ab} Tieren nicht`
        + (genau ? ` — stattdessen „${genau.raum.titel}"` : ''));
    const zweitesMal = TI.raumAbZahl([...stand(r.ab), ...r.tiere]);
    if (zweitesMal && zweitesMal.raum.titel === r.titel)
      tf.push(`„${r.titel}" gibt seine Tiere ein ZWEITES Mal`);
  }

  /* ---------- Was als NAECHSTES zu holen ist (I18) ----------------------
   *
   * Der Endbildschirm einer fertigen Ebene sagte bis I18 nichts: alle
   * Tiere des Raumes lagen schon im Buch, also fiel der Lohn aus, und
   * ein Kind, das alles richtig hatte, sah weniger als eines mit einem
   * Fehler. `naechsteSchwelle` beantwortet die Frage, die statt dessen
   * dasteht - wieviele Tiere noch fehlen und welcher Ort dann kommt.
   *
   * Drei Zeilen, und die dritte ist die, an der die erste Fassung
   * gescheitert ist: sie rechnete `Math.max(1, ab - habe)` und meldete
   * „noch ein Tier" fuer einen Raum, dessen Schwelle laengst erreicht
   * war und der nur auf seine eigenen Tiere wartet. Ein Versprechen,
   * das beim naechsten Mal nicht eingeloest wird, ist schlimmer als
   * keines. */
  {
    const alle = TI.sammelbar().map(t => t.id);
    const schwellen = TI.RAEUME.filter(r => r.ab).sort((a, b) => a.ab - b.ab);
    const erste = schwellen[0];
    const leer = TI.naechsteSchwelle([]);
    if (!erste) tf.push('kein Lebensraum hat mehr eine Schwelle — dann ist auf dem '
      + 'Endbildschirm nichts mehr in Aussicht');
    else if (!leer || leer.raum.titel !== erste.titel || leer.fehlt !== erste.ab)
      tf.push(`ohne ein einziges Tier ist „${erste.titel}" nicht in ${erste.ab} Tieren `
        + `in Aussicht, sondern ${leer ? `„${leer.raum.titel}" in ${leer.fehlt}` : 'nichts'}`);
    for (const r of schwellen) {
      /* Derselbe Stand wie oben: alle tieferen Schwellen abgeholt, dazu
         so viele fremde Tiere, dass die Zahl genau stimmt. Ohne das
         nennt `naechsteSchwelle` immer die unterste offene, und jede
         Zeile darunter prüfte denselben Raum. */
      const tiefer = schwellen.filter(x => x.ab < r.ab).flatMap(x => x.tiere);
      const fremd = alle.filter(id => !r.tiere.includes(id) && !tiefer.includes(id));
      const stand = (n) => [...tiefer, ...fremd.slice(0, n - tiefer.length)];
      /* Einen unter der Schwelle: dann fehlt genau eines. */
      const knapp = TI.naechsteSchwelle(stand(r.ab - 1));
      if (!knapp || knapp.raum.titel !== r.titel)
        tf.push(`einen unter der Schwelle von „${r.titel}" steht `
          + `${knapp ? `„${knapp.raum.titel}"` : 'nichts'} in Aussicht`);
      else if (knapp.fehlt !== 1)
        tf.push(`einen unter der Schwelle sagt „${r.titel}", es fehlten `
          + `${knapp.fehlt} Tiere statt einem`);
      /* Und AUF der Schwelle, ohne die eigenen Tiere: dieser Raum ist
         faellig, nicht in Aussicht. Wer ihn hier noch nennt, verspricht
         etwas, das schon offen ist. */
      const drauf = TI.naechsteSchwelle(stand(r.ab));
      if (drauf && drauf.raum.titel === r.titel)
        tf.push(`„${r.titel}" steht bei ${r.ab} Tieren noch in Aussicht, `
          + 'obwohl seine Schwelle erreicht ist');
    }
    if (TI.naechsteSchwelle(alle))
      tf.push('mit allen Tieren ist noch ein Ort in Aussicht — '
        + `„${TI.naechsteSchwelle(alle).raum.titel}"`);
  }

  /* JEDE Ebene des Raumes und nicht nur die erste: der Hof hat neun,
     das Riff zwoelf, und eine davon koennte falsch geschrieben sein -
     dann gaebe genau sie nichts, und die acht anderen deckten es zu. */
  for (const r of TI.RAEUME.filter(x => x.ebenen)) for (const e of r.ebenen) {
    const ersteMal = TI.raumTiere(e, []);
    const gemaltImRaum = r.tiere.filter(id => TI.tierMit(id) && TI.tierMit(id).bild);
    if (ersteMal.length !== gemaltImRaum.length)
      tf.push(`„${r.titel}" gibt über „${e}" beim ersten Mal ${ersteMal.length} `
        + `statt ${gemaltImRaum.length} Tiere`);
    const zweitesMal = TI.raumTiere(e, ersteMal.map(t => t.id));
    if (zweitesMal.length)
      tf.push(`„${r.titel}" gibt über „${e}" beim ZWEITEN Mal noch einmal `
        + `${zweitesMal.length} Tiere — dann ist der Lohn keiner`);
  }

  /* ---------- Die Kulissen (T2) ----------------------------------------
   *
   * EINE je Lebensraum, und der Schluessel ist der TITEL: „In der Stadt"
   * haengt an zwei Ebenen und ist eine Landschaft. Ein Raum, dessen
   * Tiere alle gemalt sind, aber keine Kulisse hat, waere im Buch eine
   * Tuer, hinter der nichts ist - und das faellt erst dem Kind auf.
   *
   * Gemessen wird dasselbe wie beim Tier (`passt` misst je Pfad im
   * eigenen Koordinatenraum), nur im groesseren Rahmen. Dazu die eine
   * Regel, die diese zehn Bilder gemeinsam haben: in der MITTE steht
   * nichts - dort liegen die neun Plaetze. */
  const raumTitelAlle = TI.RAEUME.map(r => r.titel);
  for (const titel of raumTitelAlle) {
    const voll = TI.RAEUME.find(r => r.titel === titel)
      .tiere.every(id => TI.tierMit(id) && TI.tierMit(id).bild);
    const k = TI.kulisseZu(titel);
    if (!k) { if (voll) tf.push(`„${titel}" ist vollständig gemalt, hat aber keine `
      + 'Kulisse — im Buch wäre das eine Tür, hinter der nichts ist'); continue; }
    if (!k.bild || !k.bild.startsWith('<path '))
      tf.push(`die Kulisse „${titel}" fängt nicht mit einem Pfad an`);
    for (const verboten of ['transform', '<circle', '<ellipse', '<rect', '<image', '<g '])
      if (k.bild.includes(verboten))
        tf.push(`die Kulisse „${titel}" benutzt „${verboten}" — `
          + 'dieselbe Messstelle wie beim Tier: `passt` misst je Pfad');
    if (!/fill="#/.test(k.bild))
      tf.push(`die Kulisse „${titel}" hat keine Farbe im Pfad`);
    if (!/^#[0-9a-f]{6}$/i.test(String(k.ton || '')))
      tf.push(`die Kulisse „${titel}" hat keinen Ton (${k.ton})`);
  }
  for (const titel of Object.keys(TI.KULISSEN))
    if (!raumTitelAlle.includes(titel))
      tf.push(`die Kulisse „${titel}" gehört zu keinem Lebensraum`);
  /* NEUN PLAETZE, drei mal drei. Die Zahl steht im Stylesheet als
     Raster und hier als Zahl; laufen sie auseinander, hat die
     Landschaft Plaetze, die niemand sieht - oder Ringe ohne Knopf. */
  if (TI.PLAETZE !== 9)
    tf.push(`es sind ${TI.PLAETZE} Plätze, das Raster hat drei mal drei`);
  if (TI.SZENE !== '0 0 160 90')
    tf.push(`der Szenenrahmen ist „${TI.SZENE}", nicht „0 0 160 90"`);

  if (tf.length) {
    console.log('    ' + tf.join('\n    '));
    console.error('\n  tiere ROT: die Tiere (T1) stimmen nicht.');
    process.exit(1);
  }
  const raeume = TI.RAEUME;
  const fertig = raeume.filter(r => r.tiere.every(id => TI.tierMit(id).bild));
  console.log('\n  Tor `tiere`');
  console.log(`    ${TI.TIERE.length} im Plan, ${TI.gemalt().length} gemalt · `
    + `${raeume.length} Lebensräume, ${fertig.length} davon vollständig`);
  console.log('    ' + raeume.map(r => `${r.titel}: `
    + `${r.tiere.filter(id => TI.tierMit(id).bild).length}/3`).join(' · '));
  console.log(`    ${Object.keys(TI.KULISSEN).length} Kulissen à ${TI.PLAETZE} Plätze — `
    + `${fertig.filter(r => TI.kulisseZu(r.titel)).length} Landschaften sind zu öffnen`);
}

/* ==================================================== Tor `flaggen` ==== *
 *
 * Die Flaggen sind BAUANWEISUNGEN, keine Bilder (F1, Konzept 1.1). Das
 * macht sie klein und lesbar - und es macht eine Art Fehler moeglich, die
 * es bei einem Foto nicht gibt: eine Flagge kann RICHTIG BESCHRIEBEN und
 * trotzdem nicht zu erkennen sein.
 *
 * Sechs der 69 unterscheiden sich von einer anderen NUR durch ihr Wappen.
 * Ein Wappen wird nicht gezeichnet, sondern angedeutet; ist die Andeutung
 * zu klein, sind Ecuador und Kolumbien zwei gleiche Bilder mit zwei
 * Namen, und die Aufgabe ist nicht schwer, sondern unbeantwortbar.
 *
 * DESHALB WIRD AM RASTER GEMESSEN UND NICHT AN DER BESCHREIBUNG. Zwei
 * Beschreibungen sind immer verschieden - sie stehen in verschiedenen
 * Zeilen. Verschieden AUSSEHEN ist etwas anderes, und nur das zaehlt
 * (Regel 5: jede Zahl traegt ihre Messstelle mit). Das Raster kommt aus
 * denselben Formen, aus denen auch das Bild entsteht; eine zweite
 * Uebersetzung waere eine zweite Wahrheit, und die gemessene waere nicht
 * die gezeigte.
 *
 * ZWEI SCHWELLEN, und beide haben eine Bedeutung:
 *
 *   BODEN  3 % der Flaeche. Darunter ist die Aufgabe nicht zu
 *          beantworten - auch dann nicht, wenn die beiden Flaggen sich in
 *          Wirklichkeit aehnlich sehen SOLLEN. Gilt ohne Ausnahme.
 *   SOLL   6 % der Flaeche fuer jedes Paar, das NICHT in `AEHNLICH` steht.
 *          Faellt eines darunter, ist entweder die Zeichnung zu grob oder
 *          das Paar gehoert in die Liste - beides ist zu entscheiden, und
 *          das Tor erzwingt die Entscheidung, statt sie zu verschweigen.
 *
 * Was die Schwellen NICHT sind: eine Zusage, dass eine Flagge richtig
 * aussieht. Das sieht ein Auge, kein Tor (Regel 4: kein Tor ersetzt den Blick).
 */
console.log('\n  Tor `flaggen`');
{
  const ff = [];
  const BODEN = 0.03, SOLL = 0.06;

  /* Vollzaehligkeit gegen `LAENDER`, in BEIDE Richtungen.
   *
   * Nur „hat jedes Land eine Flagge" zu pruefen liesse eine Flagge fuer
   * ein Land durch, das es gar nicht gibt - sie waere nie zu sehen, und
   * niemand wuesste, ob das ein Fehler ist oder Absicht. Dieselbe Lehre
   * wie beim Lebensraum ohne Ebene. */
  const laender = new Map();
  const ohneFlagge = [];
  /* RATSCHE: so viele Laender werden heute nach ihrer Flagge gefragt.
     Sie darf nicht sinken - wer eine Flagge herausnimmt, faellt auf. Wer
     eine dazuzeichnet, erhoeht sie hier. */
/* 108 (I26), davor 109 (I24), davor vier Runden lang 69.
 *
 * Die Ratsche stand vier Runden lang auf ihrem Wert von I5, waehrend
 * die Zahl der gefragten Flaggen ueber I5 und I12 auf 109 stieg. Damit
 * hatte sie VIERZIG Flaggen Luft: man haette vierzig Stueck aus
 * `FLAGGEN` nehmen koennen, ohne dass hier etwas rot wird - genau die
 * Zusage, fuer die sie da ist, und genau die, die sie nicht mehr
 * gehalten hat.
 *
 * Aufgefallen ist es nicht am Tor, sondern an der Gegenprobe: „ein Land
 * hat keine Flagge mehr" nimmt Polen heraus, und `inhalt` blieb gruen.
 * Eine Pruefung, die nie etwas meldet, ist kein Beweis (Regel 1) - und
 * eine Ratsche, die man nicht nachzieht, ist genau das.
 *
 * Die Zahl steht ab jetzt auch in der Ausgabe. Ein Wert, den niemand
 * sieht, faellt beim naechsten Mal wieder zurueck.
 *
 * 108 STATT 109 IST EIN RUECKSCHRITT, und er ist gewollt: Russland
 * steht seit I26 nicht mehr auf der Europakarte (siehe `erdkunde.js`).
 * Eine Ratsche darf nur strenger werden - wenn der Inhalt kleiner
 * wird, muss sie nachgeben, sonst haelt sie eine Zahl fest, die es
 * nicht mehr gibt. Wer sie senkt, schreibt dazu WARUM; ohne das ist
 * es dasselbe wie Vergessen. */
const FLAGGEN_GEFRAGT = 108;
  for (const [kont, liste] of Object.entries(I.LAENDER))
    for (const l of liste) laender.set(l.a3, { ...l, kont });
  for (const [a3, l] of laender)
    /* GEFRAGT, nicht gezeichnet (I3).
     *
     * Hier stand `hatFlagge`, und das war richtig, solange jedes benannte
     * Land eine gefragte Flagge hatte. Mit den 55 Laendern aus I3 stimmt
     * es nicht mehr: ihre Umrisse lagen gebacken im Baum, ihre Flaggen
     * nicht - die werden gezeichnet, und das ist Handarbeit.
     *
     * Die Regel „jedes Land hat eine Flagge" haette hier zwei Auswege
     * gelassen: 55 Flaggen an einem Nachmittag zeichnen, oder 55 Laender
     * wieder streichen, damit ein Tor gruen wird. Das zweite ist die
     * Reihenfolge, in der Daten falsch werden.
     *
     * Also die Regel, die wirklich gilt: `vorrat('flaggen:*')` siebt nach
     * `flaggeFragbar`, ein Land ohne Flagge steht dort nicht - und die
     * RATSCHE unten haelt fest, dass die Zahl der gefragten Flaggen nicht
     * sinkt. Wer eine Flagge herausnimmt, faellt auf; wer ein Land ohne
     * Flagge dazulegt, nicht. */
    if (!FL.flaggeFragbar(a3)) ohneFlagge.push(`${l.name} (${a3}, ${l.kont})`);
  const gefragt = laender.size - ohneFlagge.length;
  if (gefragt < FLAGGEN_GEFRAGT)
    ff.push(`nur noch ${gefragt} Länder werden nach ihrer Flagge gefragt, `
      + `es waren ${FLAGGEN_GEFRAGT} — eine Flagge ist aus \`FLAGGEN\` gefallen `
      + 'und damit still aus der Ebene verschwunden');
  else
    console.log(`    ${gefragt} von ${laender.size} Ländern werden nach ihrer Flagge `
      + `gefragt (Ratsche: mindestens ${FLAGGEN_GEFRAGT})`);
  for (const f of FL.FLAGGEN)
    if (!laender.has(f.a3))
      ff.push(`die Flagge ${f.a3} gehoert zu keinem Land in \`LAENDER\` — `
        + 'sie waere nie zu sehen');

  /* Jede Bauanweisung muss sich BAUEN lassen, und ihre Bauart bekannt
     sein. Ein Tippfehler in `art` waere sonst ein Absturz beim ersten
     Aufschlagen der Ebene - auf dem Geraet, nicht hier. */
  let eigene = 0, formen = 0;
  for (const f of FL.FLAGGEN) {
    if (!FL.BAUARTEN.includes(f.bau.art))
      { ff.push(`${f.a3}: unbekannte Bauart „${f.bau.art}"`); continue; }
    if (f.bau.art === 'eigen') eigene++;
    let teile;
    try { teile = FL.flaggeTeile(f.bau); }
    catch (e) { ff.push(`${f.a3} laesst sich nicht bauen: ${e.message}`); continue; }
    formen += teile.length;
    if (!teile.length) ff.push(`${f.a3} besteht aus keiner einzigen Form`);
    for (const t of teile)
      if (!/^#[0-9a-f]{6}$/i.test(String(t.farbe)))
        ff.push(`${f.a3}: „${t.farbe}" ist keine Farbe — `
          + 'die Flaggenfarben stehen roh da und kommen nicht aus den Marken');
  }
  /* Der Notausgang wird GEZAEHLT, nicht nur erlaubt (siehe `flaggen.js`).
     Waechst die Zahl, ist nicht diese Flagge besonders, sondern die
     Formsprache zu eng - und dann gehoert sie erweitert. */
  const EIGENE_MAX = 5;
  if (eigene > EIGENE_MAX)
    ff.push(`${eigene} Flaggen umgehen die Formsprache (\`art:'eigen'\`, erlaubt sind `
      + `${EIGENE_MAX}) — dann ist nicht die Flagge besonders, sondern die Sprache zu eng`);

  /* Der KONTRAST zum Grund der Karte.
   *
   * Japan ist weiss mit einer roten Scheibe. Auf einer weissen Karte ohne
   * Rand steht dort eine rote Scheibe und sonst nichts - das Kind sieht
   * kein Rechteck mehr. Der Rand steckt deshalb in `flaggeSvg` und nicht
   * im Stilblatt; hier wird nachgesehen, dass er da ist. */
  const beispiel = FL.flaggeSvg('JPN');
  if (!/stroke=/.test(beispiel))
    ff.push('die Flagge kommt ohne Rand — eine weisse Flagge auf weisser Karte '
      + 'hat dann keine Kontur mehr, und Japan ist nur noch ein roter Punkt');

  /* JEDE Form muss ein PFAD sein - dieselbe Messstelle wie beim Tier und
   * beim Englischbild (Regel 5: jede Zahl trägt ihre Messstelle mit).
   *
   * `passt` misst ein Kachel-Wasserzeichen über `getBBox()` und
   * `isPointInFill()` je PFAD. Ein `<rect>` findet es nicht. Die deutsche
   * Flagge sind drei Rechtecke - als `<rect>` gezeichnet war sie für das
   * Tor unsichtbar, und der Lauf meldete nichts. Nicht „grün": nichts.
   *
   * Geprüft wird an ALLEN 69, nicht an einer: die Bauarten erzeugen
   * verschiedene Formen, und eine einzige Stichprobe bezeugt nur die
   * Bauart, die sie zufällig getroffen hat. Der Rand darf ein `<rect>`
   * sein - er ist gestrichelt und nicht gefüllt, `isPointInFill` fände
   * ihn ohnehin nicht. */
  for (const f of FL.FLAGGEN) {
    const svg = FL.flaggeSvg(f.a3);
    const ohneRand = svg.replace(/<rect [^>]*fill="none"[^>]*\/>/g, '');
    for (const verboten of ['<rect', '<circle', '<ellipse', '<polygon', 'transform='])
      if (ohneRand.includes(verboten))
        { ff.push(`${f.a3} zeichnet mit „${verboten}" statt mit einem Pfad — `
          + 'dann misst `passt` das Wasserzeichen nicht und meldet nichts'); break; }
    /* Und der Inhalt jedes `d`, nicht nur die Art des Elements.
     *
     * Ein Pfad, der nicht mit `M` anfaengt oder ein fremdes Zeichen
     * traegt, ist fuer den Browser KEIN Fehler: er zeichnet ihn einfach
     * nicht. Die Flagge waere dann leer, das SVG heil, und alle Zaehlungen
     * darunter stimmten weiter - sie zaehlen Elemente, nicht Bilder.
     *
     * Gefunden hat es die Gegenprobe „eine Flagge zeichnet wieder mit
     * Rechtecken statt mit Pfaden": ihr Eingriff setzt `<!--` vor den
     * Pfad, und das Tor blieb gruen. Es prueft seither nicht mehr nur,
     * WOMIT gezeichnet wird, sondern auch WAS. */
    for (const m of svg.matchAll(/ d="([^"]*)"/g)) {
      const d = m[1].trim();
      if (!/^[Mm][\s\-0-9.]/.test(d))
        ff.push(`${f.a3} hat einen Pfad, der nicht mit einem Setzbefehl anfängt `
          + `(„${d.slice(0, 24)}…") — der Browser zeichnet ihn nicht, und die Flagge `
          + 'bliebe leer, ohne dass etwas rot wird');
      else if (/[^MmLlHhVvCcSsQqTtAaZz0-9.,\-\s]/.test(d))
        ff.push(`${f.a3} hat einen Pfad mit einem Zeichen, das kein Pfadbefehl ist `
          + `(„${d.slice(0, 24)}…") — der Browser bricht dort ab, und der Rest der `
          + 'Flagge fehlt, ohne dass etwas rot wird');
    }
  }

  /* Die eigentliche Pruefung: sieht man den Unterschied?
   *
   * Gemessen wird je KARTE, weil eine Auswahl nie ueber Karten hinweg
   * gebildet wird - Rumaenien steht nie neben Nigeria. Ein Vergleich aller
   * gegen alle waere strenger, als das Spiel es verlangt, und wuerde
   * Aenderungen erzwingen, die niemand sieht. */
  const aehnlich = new Set(FL.AEHNLICH.map(x => [...x.paar].sort().join('/')));
  const nichtFragbar = new Set(FL.AEHNLICH.filter(x => x.fragbar === false)
    .map(x => [...x.paar].sort().join('/')));
  let engste = { anteil: 1 }, gemessen = 0, unterSoll = [];
  for (const [kont, liste] of Object.entries(I.LAENDER))
    for (let i = 0; i < liste.length; i++)
      for (let j = i + 1; j < liste.length; j++) {
        /* Verglichen wird, was NEBENEINANDER STEHEN KANN - also der
           gefragte Vorrat (I3). Die acht aus `FLAGGEN_EXTRA` stehen nie
           in einer Auswahl; sie sind das Gegenstueck in den
           Verwechslungen, wo daneben steht, worauf zu achten ist.
           Irland gegen Italien dort zu messen hiesse, eine Aufgabe zu
           pruefen, die es nicht gibt. */
        if (!FL.flaggeFragbar(liste[i].a3) || !FL.flaggeFragbar(liste[j].a3)) continue;
        const a = FL.flaggeVon(liste[i].a3), b = FL.flaggeVon(liste[j].a3);
        if (!a || !b) continue;
        const u = FL.unterschied(a.bau, b.bau);
        gemessen++;
        const paar = [a.a3, b.a3].sort().join('/');
        if (u.anteil < engste.anteil) engste = { ...u, paar, kont };
        if (u.anteil < BODEN)
          ff.push(`${paar} (${kont}): nur ${(u.anteil * 100).toFixed(1)} % der Fläche `
            + `stehen deutlich anders da (Boden ${BODEN * 100} %) — diese Aufgabe ist `
            + 'nicht schwer, sondern nicht zu beantworten');
        else if (u.anteil < SOLL && !aehnlich.has(paar)) unterSoll.push(`${paar} `
          + `(${kont}, ${(u.anteil * 100).toFixed(1)} %)`);
      }
  if (unterSoll.length)
    ff.push(`${unterSoll.length} Paare unter dem Soll von ${SOLL * 100} %, ohne in `
      + `\`AEHNLICH\` zu stehen: ${unterSoll.join(', ')} — entweder ist die Zeichnung `
      + 'zu grob, oder das Paar gehört in die Liste. Beides ist zu entscheiden.');

  /* Und die Gegenrichtung (Regel 1: wer eine Wirkung misst, schaltet sie
     zuerst ab). `AEHNLICH` behauptet etwas - was davon ist zu prüfen?
     
     NICHT, ob Menschen die beiden verwechseln. Der erste Anlauf hat es
     versucht und verlangt, dass sich ein „ähnliches" Paar auf höchstens
     30 % der Fläche unterscheidet. Er meldete daraufhin, die Niederlande
     und Luxemburg (31 %) und Indonesien und Polen (100 %) verwechsle
     niemand - beides sind Schulbeispiele. Ein Bildpunkt sieht bei einer
     umgedrehten Flagge den größtmöglichen Unterschied, ein Mensch sieht
     zweimal Rot und Weiß. Eine Prüfung, die das Falsche misst, ist
     schlimmer als keine: sie hätte hier drei richtige Einträge aus der
     Liste getrieben.
     
     Was bleibt, ist der BAULICHE Grund der Verwechslung - gleiche Bauart,
     gleiche Zahl und Richtung der Streifen. Das ist prüfbar, und es ist
     die Aussage, die stimmt. */
  let geprueftePaare = 0, wartend = 0, stumm = 0;
  for (const x of FL.AEHNLICH) {
    const [a3a, a3b] = x.paar;
    const a = FL.flaggeVon(a3a), b = FL.flaggeVon(a3b);
    if (!a || !b) { wartend++; continue; }
    geprueftePaare++;
    const ma = FL.baumuster(a.bau), mb = FL.baumuster(b.bau);
    if (ma !== mb)
      ff.push(`${a3a}/${a3b} steht in \`AEHNLICH\`, ist aber verschieden gebaut `
        + `(${ma} gegen ${mb}) — dann fehlt der Grund, warum man sie verwechseln `
        + 'sollte, und das Paar gehört überprüft');
    if (!x.grund)
      ff.push(`${a3a}/${a3b} sagt nicht, WORAN man die beiden unterscheidet — `
        + 'die Ebene zeigt das Paar dann ohne Erklärung');
    /* Die BEIDEN Richtungen der Ausnahme (Regel 1: wer eine Wirkung
     * misst, schaltet sie zuerst ab).
     *
     * Ein Paar, das man nicht sehen kann, MUSS `fragbar:false` tragen -
     * sonst stellt die Ebene eine Frage, die kein Kind beantworten kann
     * und die es nur raten lehrt.
     *
     * Und umgekehrt: ein Paar mit `fragbar:false`, das man sehr wohl
     * unterscheiden kann, ist eine Bequemlichkeit. Ohne diese zweite
     * Hälfte wäre `fragbar:false` ein Freibrief, mit dem sich jede zu
     * ähnliche Zeichnung stillstellen ließe - und genau dafür ist der
     * Boden nicht da. */
    const u = FL.unterschied(a.bau, b.bau);
    const zuNah = u.anteil < BODEN;
    if (x.fragbar === false) stumm++;
    if (zuNah && x.fragbar !== false)
      ff.push(`${a3a}/${a3b}: nur ${(u.anteil * 100).toFixed(1)} % der Fläche stehen `
        + `anders da (Boden ${BODEN * 100} %) — das ist nicht zu sehen und gehört `
        + 'als `fragbar:false` gekennzeichnet, statt gefragt zu werden');
    if (!zuNah && x.fragbar === false)
      ff.push(`${a3a}/${a3b} trägt \`fragbar:false\`, unterscheidet sich aber auf `
        + `${(u.anteil * 100).toFixed(1)} % der Fläche — man kann es sehen, also `
        + 'gehört die Ausnahme weg. Sonst ist sie ein Freibrief');
  }

  if (ff.length) {
    console.log('    ' + ff.join('\n    '));
    console.error('\n  flaggen ROT: der Flaggenvorrat (F1) stimmt nicht.');
    process.exit(1);
  }
  console.log(`    ${FL.FLAGGEN.length} Flaggen aus ${FL.BAUARTEN.length - 1} Bauarten `
    + `(${eigene} eigene, erlaubt ${EIGENE_MAX}) · ${formen} Formen · Rahmen ${FL.RAHMEN}`);
  console.log(`    ${gemessen} Paare je Karte gemessen · engstes ${engste.paar} `
    + `(${engste.kont}, ${(engste.anteil * 100).toFixed(1)} % deutlich anders, `
    + `Boden ${BODEN * 100} %, Soll ${SOLL * 100} %)`);
  /* Die acht ohne Kartenumriss duerfen in „Auf die Karte" (F4) nicht
     vorkommen - dort wuerde nach einem Ort gefragt, den es auf keiner
     Karte dieser App gibt. Geprueft wird die Zusage, nicht der gute
     Wille: kein `FLAGGEN_EXTRA`-Land darf in `LAENDER` stehen. */
  for (const f of FL.FLAGGEN_EXTRA)
    if (laender.has(f.a3))
      ff.push(`${f.a3} steht in \`FLAGGEN_EXTRA\` UND in \`LAENDER\` — dann ist `
        + 'unklar, ob es einen Kartenumriss hat, und „Auf die Karte" (F4) fragt '
        + 'vielleicht nach einem Ort, den es nicht gibt');
  console.log(`    Verwechslungen: ${geprueftePaare} Paare nachgemessen `
    + `(${stumm} nur zum Zeigen, nicht zum Fragen), ${wartend} ohne Flagge`);
  console.log(`    Ohne Kartenumriss: ${FL.FLAGGEN_EXTRA.length} Flaggen für die `
    + 'Verwechslungen — keine davon in `LAENDER`');
}

/* =================================================== Tor `betroffen` ==== *
 *
 * Der Rueckfall von `--betroffen` haelt.
 *
 * `npm run tor -- --betroffen` faehrt nur die Browsertore, die von den
 * geaenderten Dateien erreicht werden koennen. Das ist genau so lange
 * unbedenklich, wie die UNBEKANNTE Datei auf ALLE Tore zurueckfaellt.
 * Faellt sie stattdessen auf keines zurueck, dann ist eine neue Datei -
 * also der haeufigste Fall einer laufenden Runde - ungeprueft, und der
 * Lauf meldet dafuer gruen. Ein Werkzeug, das beim Zweifel WENIGER
 * prueft, ist gefaehrlicher als gar keines.
 *
 * Geprueft wird die Funktion, nicht der Text der Liste: `betroffeneTore`
 * bekommt Pfade und muss antworten. Vier Faelle, jeder einzeln zu
 * brechen - und der wichtigste ist der erste.
 *
 * Dazu: jeder Torname, den eine Regel WOERTLICH nennt, muss es in der
 * Kette geben. Ein Tippfehler dort hiesse „kein Tor" und nicht „Fehler" -
 * die Zuordnung wuerde still weniger fahren, und niemand saehe es.
 */
console.log('\n  Tor `betroffen`');
{
  const schief = [];
  const alles = (l) => betroffeneTore(l) === null;
  const menge = (l) => { const r = betroffeneTore(l); return r === null ? null : [...r].sort(); };

  if (!alles(['irgendwas/neu.js']))
    schief.push('eine Datei, die keiner Regel entspricht, faellt NICHT auf alle Tore zurueck '
      + '— dann ist jede neue Datei ungeprueft, und der Lauf meldet gruen');
  if (!alles(['docs/x.md', 'irgendwas/neu.js']))
    schief.push('eine unbekannte Datei NEBEN einer bekannten faellt nicht auf alle zurueck '
      + '— die strengere Zuordnung muss gewinnen');
  const doku = menge(['docs/Lernkiste-BACKLOG.md', 'CLAUDE.md']);
  if (doku === null || doku.length)
    schief.push(`eine reine Doku-Aenderung zieht Browsertore nach sich (${doku}) `
      + '— dann spart die Bahn nichts');
  const nurSmoke = menge(['tor/smoke.mjs']);
  if (String(nurSmoke) !== 'smoke')
    schief.push(`\`tor/smoke.mjs\` betrifft ${nurSmoke} statt genau \`smoke\``);

  /* Die Namen gegen die Kette halten. `ALLE` ist die Kette selbst - dieselbe
     Liste, aus der `tools/kette.mjs` faehrt. Eine zweite Namensliste hier
     waere Regel 6: was zweimal dasteht, veraltet einmal. */
  const kette = new Set(KETTE);
  for (const b of BETRIFFT) {
    if (typeof b.tore !== 'object' || b.tore === null) continue;
    for (const n of b.tore)
      if (!kette.has(n))
        schief.push(`die Zuordnung nennt ein Tor \`${n}\`, das die Kette nicht kennt `
          + '— ein Tippfehler heisst hier „kein Tor", nicht „Fehler"');
  }

  if (schief.length) {
    console.log('    ' + schief.join('\n    '));
    console.error('\n  betroffen ROT: die Zuordnung Datei → Tor prüft weniger, als sie soll.');
    process.exit(1);
  }
  console.log(`    ${BETRIFFT.length} Regeln, Unbekanntes fällt auf alle ${kette.size} `
    + 'Tore zurück');
}

// nicht mit und meldete weiter „Alle 7" - dieselbe stille Verjaehrung,
// gegen die sie geschrieben wurde, nur eine Ebene tiefer.
const torZahl = (fs.readFileSync(new URL(import.meta.url), 'utf8')
  .match(/^\s*console\.log\('\\n  Tor `/gm) || []).length;
console.log(`\n  Alle ${torZahl} Tore grün. ${ids.size} eindeutige IDs, ${ZAHL.gesamt} Gebiete.`);
