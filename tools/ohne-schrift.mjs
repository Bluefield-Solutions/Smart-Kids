/* AUDIT A - „Die Sechsjaehrige, die nicht liest".
 *
 * Aufruf:
 *   npm run ohneschrift              messen, Bilder schreiben
 *   npm run ohneschrift -- --selbst  nur die Selbstprobe des Messers
 *
 * ---------------------------------------------------------------------
 * DIE FRAGE
 *
 * Fiona ist sechs und liest nicht. Sie sieht auf jedem Bildschirm Text,
 * und der sagt ihr nichts. Was ihr etwas sagt, ist dreierlei:
 *
 *   ein BILD      ein Umriss, ein Zeichen, ein Aufkleber, ein Emoji
 *   eine ZIFFER   sie rechnet bis zehn, Ziffern liest sie
 *   eine STIMME   `data-lesen` spricht beim Antippen, `ansagen()`
 *                 spricht den Bildschirm von selbst an
 *
 * Ein antippbares Ding, das nichts davon traegt, ist fuer sie NICHT DA.
 * Es sieht aus wie ein Kasten mit Gekritzel. Genau die zaehlt dieses
 * Werkzeug - und macht daneben Aufnahmen, auf denen der Text unlesbar
 * ist, damit der Blick dasselbe sieht wie sie.
 *
 * ---------------------------------------------------------------------
 * WIE DER TEXT UNLESBAR WIRD - und warum nicht mit Bloecken
 *
 * Der erste Gedanke war, jedes Zeichen durch █ zu ersetzen. Das ist
 * falsch, und zwar zweimal: der Block ist breiter als der Schnitt eines
 * jeden Buchstabens, also bricht jede Zeile anders um und der Grundriss
 * ist nicht mehr der, den ein Kind sieht. Und es sieht aus wie ein
 * Ladefehler, nicht wie Schrift - Fiona SIEHT Schrift, sie liest sie
 * nur nicht.
 *
 * Also werden BUCHSTABEN VERTAUSCHT, Gross gegen Gross, Klein gegen
 * Klein. Die Zeilen brechen fast gleich, es sieht aus wie Text, und
 * lesen kann man es nicht. ZIFFERN BLEIBEN STEHEN: sie kann sie lesen,
 * und eine Rechenaufgabe unkenntlich zu machen hiesse, eine Faehigkeit
 * wegzunehmen, die sie hat. Zeichen und Emoji bleiben auch stehen -
 * das sind Bilder.
 *
 * ---------------------------------------------------------------------
 * REGEL 1 - eine Pruefung, die nie etwas meldet, ist kein Beweis
 *
 * Der Messer selbst wird gemessen: `--selbst` laesst ihn auf erfundene
 * Elemente los, von denen bekannt ist, was herauskommen muss. Faellt
 * die Selbstprobe, laeuft der Rest gar nicht erst - eine Zahl aus einem
 * kaputten Messer ist schlimmer als keine.
 *
 * ---------------------------------------------------------------------
 * REGEL 5 - jede Zahl traegt ihre Messstelle mit
 *
 * Gemessen wird auf dem ZIELGERAET und nur dort: iPhone quer, 844 x 390,
 * MIT Leiste (21/59/21/59). Auf einem breiten Fenster passt mehr Text
 * nebeneinander, und die Frage „was sagt dieser Bildschirm ohne Schrift"
 * hat dort eine andere Antwort. Es wird in Chromium gemessen, nicht in
 * Safari; was hier zaehlt, sind Bausteine und Ansagen, und die sind
 * dieselben.
 */
import fs from 'node:fs';
import path from 'node:path';
import { starte, serviere, zurEbenenwahl, durchVorlauf, schriftDa,
         zielUndEtikett } from '../tor/chromium.mjs';

const NUR_SELBST = process.argv.includes('--selbst');
const AUS = path.join(process.cwd(), 'blick/ohne-schrift');

/* ---------- Der Messer, als reine Funktion --------------------------
 *
 * Sie steht HIER und nicht im Browser, damit die Selbstprobe sie ohne
 * Browser fahren kann. Hinein geht, was sich an einem Element ablesen
 * laesst; heraus kommt, was Fiona davon hat.
 */
export const EMOJI = /\p{Extended_Pictographic}|[←-⇿☀-➿⬀-⯿]/u;

/**
 * Was traegt dieses antippbare Ding fuer ein Kind, das nicht liest?
 *
 * @param x.text      der sichtbare Text
 * @param x.bilder    Zahl der eigenen Bausteine mit Bild (svg, img, canvas)
 * @param x.hintergrund  `background-image` gesetzt?
 * @param x.liest     `data-lesen` gesetzt (spricht beim Antippen)?
 * @returns {string[]} die Signale, leer heisst: fuer sie nicht da
 */
export function signale(x) {
  const aus = [];
  if (x.bilder > 0 || x.hintergrund) aus.push('bild');
  const t = String(x.text || '').trim();
  if (t && EMOJI.test(t)) aus.push('bild');
  /* Ziffern zaehlen nur, wenn der Text NUR aus ihnen besteht (plus
   * Rechenzeichen) UND wenigstens eine Ziffer dabei ist. „12 Länder"
   * traegt eine Ziffer, sagt ihr aber nichts - sie liest die 12 und
   * nicht, wovon.
   *
   * Die zweite Haelfte hat der erste Lauf erzwungen: die beiden
   * Lupenknoepfe tragen „+" und „−" und sind DASSELBE Ding. Ohne die
   * Ziffernforderung galt das Plus als Zahl und das Minus als nichts -
   * ein Messer, das ein Paar auseinanderreisst, misst nicht die Sache,
   * sondern seine eigene Zeichenliste. */
  if (t && /^[0-9+\-=×·:\/\s]+$/.test(t) && /[0-9]/.test(t)) aus.push('zahl');
  if (x.liest) aus.push('stimme');
  return [...new Set(aus)];
}

/* ---------- Selbstprobe ---------------------------------------------
 *
 * Vier erfundene Elemente, von denen jedes genau EIN Signal traegt, und
 * eines, das keines traegt. Kommt daraus nicht heraus, was hier steht,
 * misst das Werkzeug etwas anderes als es behauptet.
 */
function selbstprobe() {
  const faelle = [
    { was:'eine Kachel mit Umriss',  ein:{ text:'Kontinente', bilder:1, hintergrund:false, liest:false }, soll:['bild'] },
    { was:'eine Rechenaufgabe',      ein:{ text:'7 + 3', bilder:0, hintergrund:false, liest:false },      soll:['zahl'] },
    { was:'ein Aufkleber, der spricht', ein:{ text:'', bilder:0, hintergrund:false, liest:true },         soll:['stimme'] },
    { was:'ein Emoji-Knopf',         ein:{ text:'🔊', bilder:0, hintergrund:false, liest:false },         soll:['bild'] },
    { was:'ein reiner Textknopf',    ein:{ text:'Übernehmen', bilder:0, hintergrund:false, liest:false }, soll:[] },
    /* Der Fall, an dem die erste Fassung falsch lag: eine Kachel mit
     * einer Zahl IM Text. „12 Länder" ist fuer sie kein Signal - sie
     * liest die Zwölf und nicht, wovon zwoelf. */
    { was:'Text mit einer Zahl darin', ein:{ text:'12 Länder', bilder:0, hintergrund:false, liest:false }, soll:[] },
    /* Und der Fall, den der erste LAUF gefunden hat: die beiden
     * Lupenknoepfe. Sie sind ein Paar und muessen dasselbe Ergebnis
     * bekommen - vorher galt das Plus als Zahl und das Minus als
     * nichts. */
    { was:'Lupe größer',  ein:{ text:'+', bilder:0, hintergrund:false, liest:false }, soll:[] },
    { was:'Lupe kleiner', ein:{ text:'−', bilder:0, hintergrund:false, liest:false }, soll:[] },
  ];
  const schlecht = [];
  for (const f of faelle) {
    const ist = signale(f.ein).sort().join(',');
    const soll = [...f.soll].sort().join(',');
    if (ist !== soll) schlecht.push(`${f.was}: gemessen „${ist || '—'}", erwartet „${soll || '—'}"`);
  }
  return { schlecht, faelleZahl: faelle.length };
}

const { schlecht, faelleZahl } = selbstprobe();
if (schlecht.length) {
  console.log('\n  Selbstprobe des Messers GEFALLEN — es misst nicht, was es sagt:');
  for (const z of schlecht) console.log(`    ${z}`);
  process.exit(1);
}
console.log(`\n  Selbstprobe des Messers: ${faelleZahl} erfundene Fälle, alle wie erwartet.`);
if (NUR_SELBST) process.exit(0);

/* ---------- Der Browser --------------------------------------------- */
const { server, adresse: SPIEL } = await serviere(path.join(process.cwd(), 'dist'));
const ZIEL = { w:844, h:390, sicher:{ oben:21, rechts:59, unten:21, links:59 } };

fs.rmSync(AUS, { recursive: true, force: true });
fs.mkdirSync(AUS, { recursive: true });

const b = await starte();
const ctx = await b.newContext({ hasTouch:true, isMobile:true, locale:'de-DE',
  viewport:{ width:ZIEL.w, height:ZIEL.h }, deviceScaleFactor:2, reducedMotion:'reduce' });

/* Was die App SAGT, mitschreiben.
 *
 * Nicht `speechSynthesis.speak` ueberschreiben, sondern den Konstruktor
 * der Aeusserung: die App baut `new SpeechSynthesisUtterance(satz)` und
 * gibt ihn weiter. Wer `speak` abfaengt, faengt in Chromium ohne Stimmen
 * unter Umstaenden gar nichts - der Konstruktor laeuft immer. */
await ctx.addInitScript(() => {
  window.__gesagt = [];
  /* Und die TOENE.
   *
   * Der erste Bericht schrieb ueber den Bildschirm nach einer falschen
   * Antwort „sagt nur den Namen" - und uebersah, dass dort ein
   * Fehlerton spielt und das Etikett wackelt. Ein Audit, das nur eine
   * Sinnesart misst, findet in jeder anderen einen Mangel, den es gar
   * nicht gibt. `klangZu()` laeuft ueber `AudioContext.createOscillator`;
   * gezaehlt wird der Aufruf, nicht das Ergebnis - Chromium hat hier
   * keinen Lautsprecher. */
  window.__toene = 0;
  for (const N of ['AudioContext', 'webkitAudioContext']) {
    const K = window[N];
    if (!K) continue;
    const alt = K.prototype.createOscillator;
    K.prototype.createOscillator = function (...a) { window.__toene++; return alt.apply(this, a); };
  }
  const Alt = window.SpeechSynthesisUtterance;
  if (Alt) {
    window.SpeechSynthesisUtterance = function (t) {
      if (t) window.__gesagt.push(String(t));
      return new Alt(t);
    };
    window.SpeechSynthesisUtterance.prototype = Alt.prototype;
  }
});
await ctx.addInitScript((si) => {
  addEventListener('DOMContentLoaded', () => {
    const r = document.documentElement.style;
    r.setProperty('--sicher-oben', si.oben + 'px');
    r.setProperty('--sicher-rechts', si.rechts + 'px');
    r.setProperty('--sicher-unten', si.unten + 'px');
    r.setProperty('--sicher-links', si.links + 'px');
  });
}, ZIEL.sicher);

const p = await ctx.newPage();
await p.goto(SPIEL, { waitUntil: 'load' });
await p.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([document.fonts.load('700 20px "Plus Jakarta Sans"'),
                     document.fonts.load('400 20px "Andika"')]);
});
if (!(await schriftDa(p)))
  console.log('  ACHTUNG: die eigene Schrift fehlt — die Aufnahmen zeigen eine Ersatzschrift.');

/* ---------- Eine Station aufnehmen ----------------------------------- */
const stationen = [];

/** `__gesagt` leeren - vor dem letzten Schritt zu einer Station. */
const leeren = () => p.evaluate(() => { window.__gesagt = []; window.__toene = 0; });

async function station(name, hinweis = '') {
  await p.waitForFunction(() => document.querySelectorAll('.schirm').length === 1,
    null, { timeout: 6000 }).catch(() => {});
  /* Warten, bis die Ansage WIRKLICH durch ist.
   *
   * Der Aufgabenbildschirm sagt sich nicht beim Aufbauen an, sondern
   * 500 ms spaeter (`setTimeout` in `spiel.js` - damit der Bildschirmwechsel
   * nicht in die Stimme faellt). Der erste Lauf mass davor und schrieb
   * „SAGT NICHTS" ueber den einen Bildschirm, auf dem ein Kind die
   * meiste Zeit verbringt. Das waere ein erfundener Befund gewesen.
   *
   * Gewartet wird auf RUHE, nicht auf eine Zahl: der Strom ist zu Ende,
   * wenn er zwei Blicke lang nicht gewachsen ist. */
  await p.waitForFunction(() => {
    const n = (window.__gesagt || []).length;
    if (window.__standN === n) { window.__standMal = (window.__standMal || 0) + 1; }
    else { window.__standN = n; window.__standMal = 0; }
    return window.__standMal >= 3;
  }, null, { timeout: 2500, polling: 200 }).catch(() => {});
  await p.evaluate(() => { window.__standN = -1; window.__standMal = 0; });

  const roh = await p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    if (!s) return null;
    /* Was ein Kind antippen kann. Nicht „alles mit einem Griff": die
     * Karte hat hunderte Pfade, und die sind EIN Ziel, kein Knopf. */
    const WAHL = 'button, input, [data-ebene], [data-welt], [data-profil],'
               + ' [data-lesen], [role="button"], a[href]';
    const sichtbar = (e) => {
      const r = e.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return false;
      const st = getComputedStyle(e);
      return st.visibility !== 'hidden' && st.display !== 'none' && +st.opacity > 0.05;
    };
    const dinge = [...s.querySelectorAll(WAHL)].filter(sichtbar).map(e => {
      const st = getComputedStyle(e);
      return {
        marke: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')
             + (e.className && typeof e.className === 'string'
                ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
        text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        bilder: e.querySelectorAll('svg, img, canvas').length,
        hintergrund: st.backgroundImage !== 'none',
        liest: e.hasAttribute('data-lesen') || e.id === 'nochhoeren',
      };
    });
    /* Was schneidet seinen eigenen Inhalt ab?
     *
     * Aus dem Blick auf die erste Aufnahme des Forscherbuchs: unter
     * jedem Rechen-Aufkleber stand „= 6", und die untere Haelfte der
     * Ziffern fehlte. Das ist kein Ueberlauf ueber den Bildschirmrand -
     * `passt` sieht so etwas nicht, weil nichts aus dem Bild laeuft.
     * Es ist ein Kasten, der seinen Inhalt beschneidet.
     *
     * Gemessen wird an `scrollHeight` gegen `clientHeight` bei allem,
     * was `overflow` versteckt - und ZWEI Punkte Nachsicht, damit die
     * Rundung von Zeilenhoehen nicht als Befund durchgeht. */
    const beschnitten = [];
    for (const e of s.querySelectorAll('*')) {
      const st = getComputedStyle(e);
      if (!/hidden|clip/.test(st.overflowY)) continue;
      const zuviel = e.scrollHeight - e.clientHeight;
      if (zuviel <= 2 || !e.clientHeight) continue;
      beschnitten.push({
        marke: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')
             + (typeof e.className === 'string' && e.className.trim()
                ? '.' + e.className.trim().split(/\s+/)[0] : ''),
        text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24),
        kasten: e.clientHeight, inhalt: e.scrollHeight });
    }
    const gesagt = (window.__gesagt || []).slice();
    const toene = window.__toene || 0;
    window.__gesagt = []; window.__toene = 0;
    return { dinge, gesagt, toene, beschnitten,
             text: (s.textContent || '').replace(/\s+/g, ' ').trim().length };
  });
  if (!roh) throw new Error(`Station ${name}: kein Bildschirm da`);

  const stumm = roh.dinge.filter(d => signale(d).length === 0);
  stationen.push({ name, hinweis, gesagt: roh.gesagt, toene: roh.toene, zeichen: roh.text,
    dinge: roh.dinge.length, stumm, beschnitten: roh.beschnitten });

  /* JETZT erst unlesbar machen - vorher braucht die Messung den Text -
   * und danach WIEDER HERSTELLEN.
   *
   * Der erste Entwurf stellte nicht wieder her und ging deshalb jede
   * Station von vorn an: nach dem Vertauschen ist der Bildschirm nur
   * noch ein Bild, und ein Klick auf „Jetzt starten" traefe „Bktzs
   * ptrfxn". Das war achtmal derselbe Weg und hat einen zweiten Fehler
   * verdeckt (siehe unten bei `__gesagt`). Merken und zuruecklegen ist
   * billiger und laesst den Weg zusammenhaengend - so, wie ein Kind ihn
   * geht. */
  await p.evaluate(() => {
    const GROSS = 'BCDFGHKLMNPRSTVWXZ', KLEIN = 'bcdfghklmnprstvwxz';
    const misch = (t) => t.replace(/\p{Lu}/gu, () => GROSS[(Math.random() * GROSS.length) | 0])
                          .replace(/\p{Ll}/gu, () => KLEIN[(Math.random() * KLEIN.length) | 0]);
    const geher = document.createTreeWalker(document.querySelector('.schirm.da'),
      NodeFilter.SHOW_TEXT);
    window.__zurueck = [];
    while (geher.nextNode()) window.__zurueck.push([geher.currentNode, geher.currentNode.nodeValue]);
    for (const [k, alt] of window.__zurueck) k.nodeValue = misch(alt);
  });
  await p.screenshot({ path: path.join(AUS, `${name}.png`) });
  await p.evaluate(() => {
    for (const [k, alt] of (window.__zurueck || [])) k.nodeValue = alt;
    window.__zurueck = [];
  });
}

/* ---------- Der Weg eines Kindes -------------------------------------
 *
 * EIN zusammenhaengender Weg, so wie ein Kind ihn geht - nicht acht Mal
 * von vorn. Nach jeder Aufnahme wird der Text zurueckgelegt, damit der
 * naechste Griff wieder trifft.
 *
 * WARUM DAS WICHTIG IST, und nicht nur schneller: `__gesagt` wird am
 * Ende jeder Station geleert und sagt damit genau, was DIESER Bildschirm
 * angesagt hat. Der erste Entwurf lud vor jeder Station neu und leerte
 * `__gesagt` NACH dem Laden - also nach der Ansage, die er messen
 * wollte. Die Profilwahl stand deshalb mit „SAGT NICHTS" im Bericht,
 * obwohl sie spricht. Ein Messer, das seinen Gegenstand wegwischt, bevor
 * es hinsieht, meldet immer dasselbe: nichts. Regel 1 sagt es
 * andersherum: eine Prüfung, die nie etwas meldet, ist kein Beweis -
 * und diese meldete nie etwas, weil sie ihren eigenen Gegenstand
 * weggewischt hatte.
 */
await p.waitForSelector('.schirm.da .kachel.wer', { timeout: 15000 });
await station('1-profilwahl',
  'der erste Bildschirm — hier weiß die App noch nicht, wer davorsitzt');

await p.click('[data-profil="fiona"]');
await p.waitForSelector('.schirm.da [data-welt]', { timeout: 15000 });
await station('2-weltwahl', 'nach dem Antippen von Fiona: Erdkunde, Rechnen, Schreiben');

await zurEbenenwahl(p, 'kontinente');
await station('3-ebenenwahl', 'die Kachelwand der Welt Erdkunde');

await p.$eval('.schirm.da [data-ebene="kontinente"]', x => x.click());
await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel', { timeout: 20000 });
if (await p.$('.schirm.da #los'))
  await station('4-vorlauf', 'der Memory-Vorlauf beim ersten Betreten einer Ebene');

await durchVorlauf(p);
await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 20000 });
await station('5-aufgabe', 'die laufende Aufgabe');

/* Die falsche Antwort. Sie ist der wichtigste Bildschirm dieses Audits:
 * hier erfaehrt ein Kind, dass etwas nicht stimmte - oder eben nicht.
 *
 * Gezogen wird mit dem ZEIGER, nicht mit `click()`. Der erste Anlauf rief
 * `el.click()` auf einem Etikett auf; die Karte nimmt Antworten aber ueber
 * Zeigerereignisse an, und die Antwort kam nie an. Der Bericht trug
 * trotzdem eine Station „nach einer falschen Antwort" - einen Bildschirm,
 * den es so nie gab. Gefunden hat es die Pruefung darunter, nicht mein
 * Blick. */
const zettel = await zielUndEtikett(p);
const anzahl = (await p.$$('.schirm.da .etikett')).length;
const falschIdx = anzahl > 1 ? (zettel.idx + 1) % anzahl : -1;
let daneben = null;
if (falschIdx >= 0) {
  const et = (await p.$$('.schirm.da .etikett'))[falschIdx];
  daneben = (await et.textContent()).trim();
  const a = await et.boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  await p.mouse.move(zettel.x, zettel.y, { steps: 12 });
  await p.mouse.up();
}

/* Regel 10 - jede Probe prueft zuerst, ob ihr Eingriff angekommen ist.
 *
 * Drei von zehn Eingriffen sind in diesem Verzeichnis schon einmal genau
 * daran gescheitert, und ein nicht angekommener Eingriff sieht aus wie
 * ein Befund. Also wird auf das SICHTBARE Zeichen der Ablehnung
 * gewartet, nicht auf eine Wartezeit. */
const angekommen = daneben && await p.waitForFunction(() => {
  const s = document.querySelector('.schirm.da');
  return !!(s.querySelector('.fastText') || s.querySelector('.hinweis.nochmal')
         || s.querySelector('.etikett.falsch'));
}, null, { timeout: 4000 }).then(() => true).catch(() => false);
if (angekommen) {
  await station('6-falsch', `nach einer falschen Antwort (gezogen: „${daneben}")`);
} else {
  console.log(`  6-falsch: die falsche Antwort kam nicht an — Station fehlt im Bericht.`);
}

await p.$eval('.schirm.da #zur', x => x.click());
await p.waitForSelector('.schirm.da #weiter', { timeout: 8000 });
await station('7-pause', 'der Pausenbildschirm — drei Wege, einer davon löscht');

await p.$eval('.schirm.da #raus', x => x.click());
await p.waitForSelector('.schirm.da [data-ebene]', { timeout: 15000 });

/* Zurueck in die Weltenwahl und in Fionas Rechenebene. */
await p.$eval('.schirm.da #zur', x => x.click());
await p.waitForSelector('.schirm.da [data-welt]', { timeout: 15000 });
await zurEbenenwahl(p, 'rechnen:plusminus');
await p.$eval('.schirm.da [data-ebene="rechnen:plusminus"]', x => x.click());
await p.waitForSelector('.schirm.da #los, .schirm.da .rechnung', { timeout: 20000 });
/* `leeren()` VOR dem Klick, nicht danach.
 *
 * Danach war es der zweite Anlauf desselben Fehlers: der Rechenschirm
 * sagt sich beim Aufbauen an (`ansagen()` steht mitten im Bauen), die
 * Karte erst 500 ms spaeter. Ein Leeren nach dem Klick trifft den einen
 * und nicht den anderen - und der Bericht sagte „Fionas Rechenschirm
 * SAGT NICHTS" ueber einen Bildschirm, der spricht. */
await leeren();
await durchVorlauf(p);
await p.waitForSelector('.schirm.da .rechnung', { timeout: 20000 });
await station('8-rechnen', 'Fionas Plus und Minus bis 10');

/* Der ENDBILDSCHIRM - der Aufkleber, wegen dem das Ganze laeuft.
 *
 * Er kostet eine ganze Sitzung, und deshalb war er im ersten Entwurf
 * nicht dabei. Das war falsch herum gespart: es ist der Bildschirm, auf
 * den ein Kind hinarbeitet.
 *
 * Und er wird ZWEIMAL gespielt. „Beim zweiten Mal richtig gibt es einen
 * Aufkleber" - sagt die App selbst am Ende der ersten Runde. Wer nur
 * einmal spielt, fotografiert den Endbildschirm OHNE das, was ihn
 * ausmacht. Genau das hatte der erste Lauf getan.
 */
async function rechenrundeSpielen() {
  for (let n = 0; n < 40; n++) {
    if (await p.$('.schirm.da #nochmal')) return true;
    // Vor JEDER Antwort leeren: dann traegt der Endbildschirm nur, was er
    // selbst sagt, und nicht das Lob der sechs Aufgaben davor.
    await leeren();
    const weiter = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const r = s.querySelector('.rechnung');
      if (!r) return false;
      /* Die richtige Antwort ausrechnen, nicht abschreiben: die Aufgabe
       * steht am Bildschirm. Wer die Antwort aus dem Zustand der App
       * holt, prueft die App gegen sich selbst: das Modell darf nicht
       * vom Gemessenen abhaengen (Regel 14). */
      const m = (r.textContent || '').replace(/\s+/g, ' ').match(/(\d+)\s*([+\-−])\s*(\d+)/);
      if (!m) return false;
      const soll = m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3];
      const k = [...s.querySelectorAll('[data-zahl]')].find(e => +e.dataset.zahl === soll);
      if (!k) return false;
      k.click();
      return true;
    });
    if (!weiter) return false;
    await p.waitForTimeout(900);
  }
  return false;
}

if (await rechenrundeSpielen()) {
  await station('9-ende-ohne', 'der Endbildschirm nach der ERSTEN Runde — noch kein Aufkleber');
  await leeren();
  await p.$eval('.schirm.da #nochmal', x => x.click());
  await p.waitForSelector('.schirm.da .rechnung', { timeout: 20000 });
  if (await rechenrundeSpielen()) {
    /* Regel 10 wieder - der Eingriff muss angekommen sein: steht der
     * Aufkleber wirklich da? `data-neu` zaehlt
     * die neuen. Ist er null, ist dies nicht der Bildschirm, den dieses
     * Audit sucht - und das gehoert in den Bericht, nicht unter den
     * Tisch. */
    const neue = await p.evaluate(() =>
      +(document.querySelector('.schirm.da .buchstand')?.dataset.neu || 0));
    await station('10-ende-kleber',
      neue ? `der Endbildschirm nach der ZWEITEN Runde — ${neue} neue Aufkleber`
           : 'der Endbildschirm nach der ZWEITEN Runde — ES KAM KEIN AUFKLEBER');
  } else {
    console.log('  10-ende-kleber: die zweite Runde kam nicht durch.');
  }
} else {
  console.log('  9-ende: der Endbildschirm kam nicht — Station fehlt im Bericht.');
}

/* Und das Forscherbuch - der Ort, an dem die Aufkleber wohnen. */
await leeren();
await p.$eval('.schirm.da #buch', x => x.click());
await p.waitForSelector('.schirm.da .albumkarte, .schirm.da .aufkleber, .schirm.da .kasten',
  { timeout: 25000 });
await station('11-buch', 'das Forscherbuch');

await b.close();
server.close();

/* ---------- Der Bericht ---------------------------------------------- */
console.log(`\n  AUDIT A · ohne Schrift`);
console.log(`  Gemessen auf iPhone quer 844 × 390 MIT Leiste (21/59/21/59), Chromium,`);
console.log(`  am gebauten dist/ — nicht am Prototyp.\n`);

let stummGesamt = 0, schnittGesamt = 0;
for (const st of stationen) {
  const sagt = st.gesagt.length
    ? `${st.gesagt.length} Ansagen` : 'SAGT NICHTS';
  console.log(`  ${st.name}`);
  console.log(`     ${st.hinweis}`);
  console.log(`     ${st.dinge} antippbar, ${st.stumm.length} davon ohne Signal`);
  console.log(`     hört: ${sagt}${st.toene ? ` · ${st.toene} Ton${st.toene > 1 ? 'e' : ''}` : ' · kein Ton'}`);
  for (const g of st.gesagt) console.log(`       „${g}"`);
  for (const d of st.stumm)
    console.log(`       stumm und blind: ${d.marke}  „${d.text || '—'}"`);
  for (const c of st.beschnitten)
    console.log(`       ABGESCHNITTEN: ${c.marke}  „${c.text}" — Kasten ${c.kasten} pt, `
      + `Inhalt ${c.inhalt} pt`);
  stummGesamt += st.stumm.length;
  schnittGesamt += st.beschnitten.length;
  console.log('');
}
console.log(`  ${stationen.length} Stationen, ${stummGesamt} antippbare Dinge ohne jedes Signal,`);
console.log(`  ${schnittGesamt} Kästen, die ihren eigenen Inhalt abschneiden.`);
console.log(`  Aufnahmen (Buchstaben vertauscht, Ziffern und Zeichen stehen): ${path.relative(process.cwd(), AUS)}/`);
