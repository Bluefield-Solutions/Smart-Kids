/**
 * `npm run vielfalt` - WIEVIELE RUNDEN, BIS SICH ETWAS WIEDERHOLT?
 *
 * Der Inhalt-Audit hat gefragt: „Wenn man beim zweiten Mal startet,
 * kommen dann wieder die gleichen Saetze?" Das ist keine Geschmacksfrage,
 * sondern eine Division - und sie stand nirgends.
 *
 * Je Profil und Ebene:
 *
 *   Vorrat      wieviele Gegenstaende dieses PROFIL auf dieser Ebene hat
 *               (nicht wieviele es gibt: Fionas Laendertiefe ist 3, die
 *               der Eltern 17 - dieselbe Ebene ist fuer beide eine
 *               andere Ebene)
 *   Sitzung     wieviele Aufgaben eine Runde hat
 *   Runden      Vorrat / Sitzung - wieviele Runden man spielen kann,
 *               bevor ein Gegenstand zwingend ein zweites Mal drankommt
 *   Ablenker    wieviele falsche Antworten zur Auswahl STEHEN KOENNTEN
 *
 * Gemessen wird im BROWSER an der gebauten Datei, nicht in Node an den
 * Datenmodulen: `vorrat()` haengt am Profil (Laendertiefe, Kandidaten,
 * Lesen) und an den Daten im Buendel. Eine Zaehlung an `src/inhalt/`
 * zaehlte den Vorrat, den es GIBT, und nicht den, den ein Kind sieht -
 * genau der Unterschied, um den es hier geht (Regel 5: jede Zahl traegt
 * ihre Messstelle mit).
 *
 * `--tor` prueft die Grenze: unter EINER vollen Runde Vorrat ist eine
 * Ebene keine Uebung mehr, sondern eine Liste, die man auswendig lernt.
 */
import { starte, serviere } from '../tor/chromium.mjs';

const TOR = process.argv.includes('--tor');
/* Zwei Runden Vorrat sind das Mindeste, und die Zahl ist nicht gegriffen:
   bei EINER Runde Vorrat ist die zweite Sitzung dieselbe wie die erste -
   Gegenstand fuer Gegenstand, nur gemischt. Das ist der Fall, den der
   Audit gefunden hat („Hoeren und schreiben": 12 Saetze, 12 Aufgaben). */
const RUNDEN_MIN = 2;

/* WO DIE GRENZE GILT - UND WO SIE UNSINN IST.
 *
 * Der erste Lauf hat 78 von 100 Profil-Ebenen bemaengelt, und ein Teil
 * davon war nie ein Mangel. „Laender in Nordamerika" hat vier Eintraege,
 * weil Nordamerika vier Laender hat; Deutschland hat sechzehn
 * Bundeslaender; das Alphabet hat sechsundzwanzig Buchstaben. Eine Ebene,
 * deren Vorrat DIE WELT ist, kann nicht wachsen - und sie soll es nicht:
 * wer sie „repariert", erfindet Laender.
 *
 * Innerhalb einer Sitzung wiederholt sich ohnehin nichts:
 * `Leitner.sitzung` schneidet auf `Math.min(laenge, alle.length)`. Wer
 * vier Laender hat, bekommt eine Runde mit vier Aufgaben, nicht zwoelf
 * mit dreimal denselben. Und dass dieselben vier in der naechsten Sitzung
 * wiederkommen, ist bei einem Leitner-Kasten kein Fehler, sondern der
 * Sinn - er lebt von Wiederholung mit Abstand.
 *
 * Die Grenze gilt deshalb nur dort, wo der Vorrat eine LISTE ist, die
 * jemand geschrieben hat: Saetze, Wendungen, Vokabeln, Fallen,
 * Verwechslungspaare, Rechenaufgaben. Die kann immer laenger werden, und
 * wenn sie kuerzer ist als eine Sitzung, hat jemand aufgehoert zu
 * schreiben.
 *
 * Das ist keine Abschwaechung, sondern die Trennung, ohne die die Zahl
 * nichts wert waere: „78 von 100" klingt nach einer kaputten App und war
 * zur Haelfte eine Landkarte. */
const WELT = [
  /^kontinente$/, /^bundeslaender$/, /^hauptstaedte$/,
  /^laender:/, /^flaggen:(?!paare)/, /^schreiben:/,
];
const istWelt = (id) => WELT.some(r => r.test(id));

const { adresse, server } = await serviere(new URL('../dist', import.meta.url).pathname);
const b = await starte();
const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
const p = await ctx.newPage();
await p.setViewportSize({ width: 844, height: 390 });
await p.goto(adresse, { waitUntil: 'domcontentloaded' });
await p.waitForSelector('[data-profil="fiona"]');

const PROFILE = await p.evaluate(() => Object.keys(PROFILE));
const zeilen = [];
for (const wer of PROFILE) {
  await p.goto(adresse, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector(`[data-profil="${wer}"]`);
  await p.click(`[data-profil="${wer}"]`);
  await p.waitForSelector('.schirm.da [data-welt]', { timeout: 8000 }).catch(() => {});
  /* DREI ZAHLEN, nicht eine - und die mittlere ist der ganze Grund, aus
     dem es dieses Werkzeug gibt (I2).

       Anfang   der Vorrat mit LEEREM Lernstand: was ein Kind am ersten
                Tag vor sich hat
       Leiter   der Vorrat, wenn alles Offene gekonnt ist: wohin die
                Leiter fuehrt. Gerechnet mit einem gestellten Stand, in
                dem JEDER Gegenstand in Fach 5 liegt - das ist die
                Bedingung, unter der `leiterTiefe` bis oben laeuft.
       Ganz     alles, was es auf dieser Ebene ueberhaupt gibt

     Vorher stand hier nur „Anfang", und damit haette diese Runde
     ausgesehen wie keine Aenderung: Fionas Europa faengt weiter bei drei
     an. Was sich geaendert hat, ist, dass es dort nicht mehr aufhoert. */
  const aus = await p.evaluate(() => meineEbenen().map(e => {
    let n = 0, voll = 0, leiter = 0;
    try { n = vorrat(e.id, {}, false).length; } catch (err) { n = -1; }
    try { voll = vorrat(e.id, {}, true).length; } catch (err) { voll = -1; }
    try {
      // Ein Stand, in dem alles gekonnt ist - fuer JEDE Kennung, die auf
      // dieser Ebene vorkommen kann. Die Kennungen der noch geschlossenen
      // Stufen stehen im vollen Vorrat.
      const koennen = {};
      for (const g of vorrat(e.id, {}, true))
        koennen[g.id] = { fach: 5, hoechstes: 5, faellig: 0, richtig: 5, falsch: 0, zuletzt: 0 };
      leiter = vorrat(e.id, koennen, false).length;
    } catch (err) { leiter = -1; }
    return { id: e.id, titel: `${e.wo || e.titel}`, welt: e.art || 'karte',
             n, leiter, voll, sitzung: P.sitzung, kandidaten: P.kandidaten };
  }));
  for (const e of aus) zeilen.push({ wer, ...e });
}

console.log('\n  Werkzeug `vielfalt` — wieviele Runden, bis sich etwas wiederholt');
console.log('  Gemessen an der gebauten Datei, je Profil mit seiner eigenen Tiefe.\n');
const mangel = [];
let letzter = null;
for (const z of zeilen) {
  if (z.wer !== letzter) {
    console.log(`\n    ${z.wer.toUpperCase()}  (Sitzung ${z.sitzung} Aufgaben, `
      + `${z.kandidaten ? z.kandidaten + ' Kandidaten' : 'ohne Auswahl'})`);
    console.log('      Ebene                          Anfang  Leiter    Ganz  Runden');
    letzter = z.wer;
  }
  /* Gemessen wird die LEITER, nicht der Anfang. Eine Ebene, die bei drei
     anfaengt und bei siebzehn endet, ist keine Ebene mit drei
     Gegenstaenden - sie ist eine, die mitwaechst. Wer den Anfang misst,
     misst den ersten Tag und nennt ihn das Spiel. */
  const runden = z.sitzung ? z.leiter / z.sitzung : 0;
  const welt = istWelt(z.id);
  const knapp = runden < RUNDEN_MIN && !welt;
  console.log(`      ${(z.id + ' · ' + z.titel).padEnd(30).slice(0, 30)} `
    + `${String(z.n).padStart(6)}  ${String(z.leiter).padStart(6)}  `
    + `${String(z.voll).padStart(6)}  ${runden.toFixed(1).padStart(6)}`
    + `${knapp ? '   ←' : welt && runden < RUNDEN_MIN ? '   ·' : ''}`);
  if (knapp) mangel.push({ ...z, runden });
}

const weltKnapp = zeilen.filter(z => istWelt(z.id)
  && z.sitzung && z.leiter / z.sitzung < RUNDEN_MIN).length;
console.log(`\n    ${zeilen.length} Profil-Ebenen gemessen, `
  + `${mangel.length} unter ${RUNDEN_MIN} Runden Vorrat`);
console.log(`    ${weltKnapp} weitere liegen darunter, weil ihr Vorrat DIE WELT ist —`);
console.log('    vier Länder in Nordamerika, sechzehn Bundesländer, sechsundzwanzig');
console.log('    Buchstaben. Dort ist die Grenze kein Maß, sondern ein Irrtum; sie');
console.log('    stehen mit · statt mit ←.');
if (mangel.length) {
  console.log('\n    Zu wenig Vorrat — die zweite Runde ist fast die erste:');
  for (const m of mangel)
    console.log(`      ${m.wer} · ${m.id} — ${m.n} Gegenstände bei ${m.sitzung} `
      + `Aufgaben je Runde (${m.runden.toFixed(1)} Runden)`);
}

await b.close();
server.close();
if (TOR && mangel.length) {
  console.log(`\n  vielfalt ROT: ${mangel.length} Ebenen haben weniger als `
    + `${RUNDEN_MIN} Runden Vorrat.\n`);
  process.exit(1);
}
console.log(TOR ? '\n  vielfalt grün: jede Ebene trägt mindestens zwei volle Runden.\n' : '');
