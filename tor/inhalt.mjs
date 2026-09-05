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
/* Und die uebrigen groben Stufen. `bauen.mjs` backt genau diese ein - die
 * feinen sind der Vorrat, nicht die Ware. Ein Anker, der in der feinen
 * Stufe im Gebiet liegt, kann in der groben davor liegen: vereinfachen
 * heisst Ecken abschneiden. (Regel 5.) */
import { KONTINENTE_GROB } from '../src/geo/kontinente.grob.js';
import { LAENDER_AFRIKA_GROB } from '../src/geo/laender-afrika.grob.js';
import { LAENDER_ASIEN_GROB } from '../src/geo/laender-asien.grob.js';
import { LAENDER_NORDAMERIKA_GROB } from '../src/geo/laender-nordamerika.grob.js';
import { KARTEN_GROB } from '../src/geo/karten.grob.js';
import { LAENDER_SUEDAMERIKA_GROB } from '../src/geo/laender-suedamerika.grob.js';
import { DEUTSCHLAND_MITTEL } from '../src/geo/deutschland.mittel.js';
import { polDerUnzugaenglichkeit } from '../tools/geo-backen.mjs';
import { ALLE as KETTE, BETRIFFT, betroffeneTore } from './kette-liste.mjs';
import * as EN from '../src/inhalt/englisch.js';
import * as TI from '../src/inhalt/tiere.js';
import * as BP from '../tools/bildprompt.mjs';
import { LAENDER_NORDAMERIKA_FEIN } from '../src/geo/laender-nordamerika.fein.js';
import { LAENDER_SUEDAMERIKA_FEIN } from '../src/geo/laender-suedamerika.fein.js';

/** Alles, was gebacken wird - damit eine Pruefung nicht die Haelfte auslaesst. */
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

/* Ebene „Hauptstädte in Europa" (R6).
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
  const gebackenEU = new Map(LAENDER_EUROPA_GROB.map(l => [l.a3, l]));
  const meta = new Map(I.LAENDER.europa.map(l => [l.a3, l]));
  let drin = 0;
  for (const m of I.LAENDER.europa) {
    const l = gebackenEU.get(m.a3);
    pruefe(l, `${m.a3} (${m.name}) wird gespielt und ist nicht gebacken — `
      + '`npm run backen` mit den Rohdaten trägt es nach');
    if (!l) continue;
    pruefe(l.name === m.name, `${m.a3}: gebacken steht „${l.name}", `
      + `in erdkunde.js „${m.name}" — zwei Namen für dasselbe Land`);
    pruefe(l.hauptstadt, `${l.a3}: keine Hauptstadt gebacken`);
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
    const ab = I.HAUPTSTADT_ABLENKER_EUROPA[l.a3] || [];
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
    if (l.regierungssitz)
      pruefe(ab[0] === l.regierungssitz,
        `${l.a3}: Natural Earth kennt „${l.regierungssitz}" als Regierungssitz, `
        + `unter den Ablenkern steht vorn aber „${ab[0]}" — die eigentliche Falle fiele aus`);
  }
  const fremd = Object.keys(I.HAUPTSTADT_ABLENKER_EUROPA)
    .filter(a3 => !meta.has(a3));
  pruefe(!fremd.length, `Ablenker für Länder, die es auf der Ebene nicht gibt: ${fremd.join(', ')}`);
  for (const l of I.LAENDER.europa)
    if (l.wovon) pruefe(/^vo[nm] /.test(l.wovon),
      `${l.a3}: \`wovon\` ist „${l.wovon}" — die Frage lautet „Wie heißt die Hauptstadt …?"`);
  const sitze = I.LAENDER.europa.filter(m => gebackenEU.get(m.a3)?.regierungssitz).length;
  console.log(`    Hauptstädte in Europa: ${I.LAENDER.europa.length} Länder, ${drin} Stadtlagen im `
    + `eigenen Land, ${sitze} abweichender Regierungssitz`);
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
  let geprueftD = 0;
  for (const p of PROBEN) {
    if (!p.datei) continue;
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
  pruefe(geprueftD === mitDatei, `Nur ${geprueftD} von ${mitDatei} Gegenproben mit Datei `
    + 'wurden angesehen — die Prüfung greift ins Leere und beweist nichts');
  const mehrfach = PROBEN.filter(p => p.mehrfach).length;
  console.log(`    Gegenproben: ${geprueftD} von ${PROBEN.length} greifen genau einmal `
    + `in ihre Datei (${mehrfach} ausdrücklich mehrfach)`);
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
  };
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
   *   1. Die Auslieferung fährt weiterhin die VOLLE Kette.
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
      `${AUSL} fährt nicht mehr die volle Kette (\`npm run tor:runner\`)`);
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
    if (vorrat.length !== EN.FARBEN.length + EN.ZAHLEN.length)
      eng.push(`der Hörvorrat hat ${vorrat.length} Gegenstände, erwartet waren `
        + `${EN.FARBEN.length + EN.ZAHLEN.length}`);
    const ids = new Set(vorrat.map(x => x.id));
    if (ids.size !== vorrat.length)
      eng.push(`der Hörvorrat hat doppelte Kennungen — der Leitner führte sie als eine`);
    for (const x of vorrat) {
      if (!x.farbton && !x.ziffern)
        eng.push(`„${x.wort}" hat kein Bild — vier leere Kästen sind keine Aufgabe`);
      if (!x.wort) eng.push(`ein Gegenstand ohne Wort: ${x.id}`);
      if (!['farbe', 'zahl'].includes(x.sorte))
        eng.push(`„${x.wort}" hat die Sorte „${x.sorte}" — dann kommen die Ablenker `
          + 'aus der falschen Menge');
    }
    /* Die Ablenker: drei, aus derselben Sorte, nie das Ziel selbst.
       Geprueft an JEDEM Gegenstand und nicht an einem Beispiel - die
       Zahlen sind 15, die Farben 10, und bei kleiner Menge geht so etwas
       zuerst kaputt. */
    for (const x of vorrat) {
      let k = 1;
      const w = () => { k = (k * 1664525 + 1013904223) >>> 0; return k / 4294967296; };
      const ab = EN.ablenkerFuer(x, w);
      if (ab.length !== 3)
        eng.push(`„${x.wort}" bekommt ${ab.length} Ablenker statt drei`);
      if (ab.some(y => y.id === x.id))
        eng.push(`„${x.wort}" steht unter seinen eigenen Ablenkern`);
      if (ab.some(y => y.sorte !== x.sorte))
        eng.push(`„${x.wort}" bekommt einen Ablenker anderer Sorte — dann ist die `
          + 'Aufgabe ohne ein Wort Englisch zu lösen');
    }
    /* CIELAB, von Hand: sRGB -> linear -> XYZ (D65) -> Lab. Zwanzig Zeilen
       statt einer Abhaengigkeit, und sie stehen hier statt in den Daten -
       ein Tor, das seine Formel aus dem Prüfling holt, prüft sie nicht. */
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
    let engster = Infinity, engstesPaar = '';
    for (let i = 0; i < EN.FARBEN.length; i++)
      for (let j = i + 1; j < EN.FARBEN.length; j++) {
        const a = lab(EN.FARBEN[i].farbton), b = lab(EN.FARBEN[j].farbton);
        const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
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
    console.log(`    „Hören und zeigen": ${vorrat.length} Gegenstände `
      + `(${EN.FARBEN.length} Farben, ${EN.ZAHLEN.length} Zahlen), jeder mit Bild und `
      + `im amtlichen Wortschatz`);
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
  {
    const ff = [];
    const ids = new Set();
    for (const f of EN.FREUNDE) {
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
    if (EN.FREUNDE.length < 25)
      ff.push(`nur ${EN.FREUNDE.length} falsche Freunde — das Konzept nennt rund `
        + 'dreißig, und darunter trägt die Ebene keine Sitzung');
    if (ff.length) {
      console.log('    ' + ff.join('\n    '));
      console.error('\n  englisch ROT: die falschen Freunde (E10) stimmen nicht.');
      process.exit(1);
    }
    const mehrere = EN.FREUNDE.filter(f => f.richtig.length > 1).length;
    console.log(`    Falsche Freunde (E10): ${EN.FREUNDE.length} Fallen, jede mit `
      + `beiden Fassungen · ${mehrere} halten mehrere gültige Antworten · `
      + 'keine Falle steht unter den richtigen');
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
    // Eine Sitzung der Eltern ist zwölf Aufgaben lang (Profiltabelle).
    // Darunter wiederholte sich der Vorrat innerhalb einer Sitzung.
    if (hs.length < 12)
      wf.push(`nur ${hs.length} Diktatsätze — eine Sitzung ist zwölf Aufgaben lang`);
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
  if (/id:`laender:\$\{k\}`/.test(spiel))
    for (const k of Object.keys(KARTEN_GROB)) ebenen.add(`laender:${k}`);
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

  const raumTitel = new Map();
  for (const r of TI.RAEUME) {
    if (!ebenen.has(r.ebene))
      tf.push(`der Lebensraum „${r.titel}" haengt an der Ebene „${r.ebene}", `
        + 'die es in spiel.js nicht gibt — er waere nie zu öffnen');
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
  for (const r of TI.RAEUME) {
    const ersteMal = TI.raumTiere(r.ebene, []);
    const gemaltImRaum = r.tiere.filter(id => TI.tierMit(id) && TI.tierMit(id).bild);
    if (ersteMal.length !== gemaltImRaum.length)
      tf.push(`„${r.titel}" gibt beim ersten Mal ${ersteMal.length} statt `
        + `${gemaltImRaum.length} Tiere`);
    const zweitesMal = TI.raumTiere(r.ebene, ersteMal.map(t => t.id));
    if (zweitesMal.length)
      tf.push(`„${r.titel}" gibt beim ZWEITEN Mal noch einmal `
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
  const raumTitelAlle = [...new Set(TI.RAEUME.map(r => r.titel))];
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
  const raeume = TI.RAEUME.filter((r, i, a) => a.findIndex(x => x.titel === r.titel) === i);
  const fertig = raeume.filter(r => r.tiere.every(id => TI.tierMit(id).bild));
  console.log('\n  Tor `tiere`');
  console.log(`    ${TI.TIERE.length} im Plan, ${TI.gemalt().length} gemalt · `
    + `${raeume.length} Lebensräume, ${fertig.length} davon vollständig`);
  console.log('    ' + raeume.map(r => `${r.titel}: `
    + `${r.tiere.filter(id => TI.tierMit(id).bild).length}/3`).join(' · '));
  console.log(`    ${Object.keys(TI.KULISSEN).length} Kulissen à ${TI.PLAETZE} Plätze — `
    + `${fertig.filter(r => TI.kulisseZu(r.titel)).length} Landschaften sind zu öffnen`);
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
