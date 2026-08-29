// Rauchtest. Spielt den Prototyp wirklich - und prueft, was M3 bis M6
// zugesagt haben: dass der Fortschritt einen Neustart ueberlebt, dass das
// Forscherbuch fuellt, dass der Elternbereich Zahlen zeigt.
import { starte, zurEbenenwahl, WELT_VON, durchVorlauf, serviere } from './chromium.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// IndexedDB braucht eine echte Herkunft. Unter file:// ist sie undurchsichtig,
// und die Ablage faellt still auf nichts zurueck - genau der Fall, den das
// Tor sonst uebersehen wuerde. Also ein winziger Server.
// Geprueft wird dist/ - das, was wirklich ausgeliefert wird. Die eine
// Datei prototyp/spiel.html ist nur zum Ansehen; sie hat weder Manifest
// noch Service Worker, also beweist ein gruener Lauf auf ihr nichts ueber
// die App auf dem Startbildschirm.
const wurzel = path.join(process.cwd(), 'dist');
const { server, adresse: ADRESSE } = await serviere(wurzel);

const b = await starte();
const fehler = [];
const merke = (was, e) => fehler.push(`${was}: ${e.message || e}`);

/* `--sofort`: aufhoeren, sobald der erste Fehler feststeht.
 *
 * NUR fuer `npm run proben`. Eine Gegenprobe braucht, dass das Tor rot
 * wird — nicht, dass es die uebrigen dreissig Pruefungen noch zu Ende
 * fuehrt. Der `durchgang` spielt achtzehn Ebenen mit zwei Profilen; ein
 * eingebauter Fehler faellt fast immer beim ersten auf, und die restlichen
 * fuenfunddreissig Durchlaeufe beweisen nichts mehr.
 *
 * Die Richtung ist sicher: abgebrochen wird ERST, wenn schon ein Fehler
 * in der Liste steht. Gruen werden kann dadurch nichts — nur die Zahl der
 * gemeldeten Fehler wird kleiner, und die Reihenfolge entscheidet, welcher
 * gemeldet wird. Genau das prueft jede Gegenprobe ohnehin mit `sagt`.
 *
 * In der Kette (`npm run tor`) steht die Fahne NICHT: dort will man alle
 * Fehler auf einmal sehen, nicht den ersten. */
const SOFORT = process.argv.includes('--sofort');
const abbruch = () => SOFORT && fehler.length > 0;

/* `--kurz`: den Durchgang mit WENIGER Ebenen fahren.
 *
 * Auch das nur fuer `npm run proben`. Der Durchgang spielt achtzehn
 * Ebenen mit zwei Profilen — sechsunddreissig Durchlaeufe, siebzig
 * Sekunden, und er ist damit der teuerste Posten im ganzen Probenlauf.
 *
 * Fuer eine GEGENPROBE ist das Verschwendung: sie will wissen, ob das Tor
 * anschlaegt, und ein eingebauter Fehler schlaegt bei der ersten Ebene zu.
 * Gefahren wird deshalb je Profil die erste Karte, die erste Auswahl und
 * das Rechnen — drei statt neun, und trotzdem jede ART von Bildschirm,
 * jede Antwortweise und beide Welten.
 *
 * Was das NICHT abdeckt: dass jede EINZELNE Ebene spielbar ist. Genau
 * dafuer laeuft der Durchgang in der Kette (`npm run tor`) weiterhin
 * vollstaendig — und dort, nicht in der Gegenprobe, gehoert diese Frage
 * auch hin.
 */
const KURZ = process.argv.includes('--kurz');

/* ---------------------------------------------------------------------
 * Was dieser Test ERWARTET, steht im Backlog, nicht in `spiel.js`.
 *
 * Beides liest dieselbe Tabelle („Was es ist", Konzept des Elternprofils):
 * die Kopfzeile nennt die Profile, die Zeile „Ländertiefe" ihre Zahlen.
 * Der Grund ist Regel 4 - eine Gegenprobe faelscht `spiel.js`, und ein
 * Tor, das sein Soll aus der gefaelschten Datei liest, bleibt gruen.
 * Beide stehen hier oben und nicht bei ihrem Gebrauch: der Elternbereich
 * braucht die Namen schon im Abschnitt `ablage`, tausend Zeilen frueher.
 * ------------------------------------------------------------------- */
/* Wie heissen die drei Profile?
 *
 * Aus derselben Tabelle wie die Tiefe, und aus demselben Grund: das
 * Erwartete darf nicht aus der Datei kommen, die eine Gegenprobe
 * anfasst (Regel 4). Steht in der Kopfzeile „Fiona (6)", zaehlt „Fiona". */
const PROFILNAMEN = (() => {
  const doc = fs.readFileSync('docs/Lernkiste-BACKLOG.md', 'utf8');
  const z = doc.match(/^\|\s*\|\s*Fiona[^|]*\|(.+)\|\s*$/m);
  if (!z) { fehler.push('Die Kopfzeile der Profiltabelle fehlt im Backlog — '
    + 'dann prüft der Rauchtest die Profile gegen nichts'); return []; }
  return ('Fiona|' + z[1]).split('|').map(t => t.replace(/\(.*/, '').trim()).filter(Boolean);
})();

/* Wie tief geht jedes Profil? Aus dem KONZEPT, nicht aus dem Programm.
 *
 * Der erste Anlauf las `laenderTiefe` aus `prototyp/spiel.js` - und war
 * damit wertlos. Die Gegenprobe baut den Fehler genau dort ein: setzt man
 * Fionas Tiefe auf zwoelf, wandert die Erwartung mit, und der Test bleibt
 * gruen. Ein Test, der sein Soll aus dem Prueflig holt, prueft nichts
 * (Regel 4).
 *
 * Gelesen wird deshalb die Tabelle im Backlog - dieselbe Stelle, an der
 * der Nutzer die Zahl entschieden hat. Was daraus WIRKLICH auf dem
 * Bildschirm landet, sieht man nur hier: der teuerste denkbare Fehler
 * dieser Runde waere, dass die Raenge 6 bis 12 mitrutschen und vor einem
 * Sechsjaehrigen ploetzlich zwoelf Laender stehen.
 */
const TIEFE = (() => {
  const doc = fs.readFileSync('docs/Lernkiste-BACKLOG.md', 'utf8');
  const z = doc.match(/^\|\s*Ländertiefe\s*\|(.+)\|\s*$/m);
  if (!z) { fehler.push('Die Zeile „Ländertiefe" fehlt im Backlog — '
    + 'dann prüft der Rauchtest die Tiefe gegen nichts'); return {}; }
  const zahlen = z[1].split('|').map(s => +(s.match(/\d+/) || [])[0]).filter(Number.isFinite);
  return { fiona: zahlen[0], lea: zahlen[1], eltern: zahlen[2] };
})();

/* Wer bekommt NIE eine Auswahl, sondern tippt immer?
 *
 * Dieselbe Tabelle, Zeile „Auswahl statt Tippen". Wo dort „nie" steht,
 * darf auf einem Kartenbildschirm kein Etikett stehen, sondern muss ein
 * Tippfeld kommen - und genau DAS ist die sichtbare Wirkung.
 *
 * Vorher stand hier eine Verbotsliste `['eltern: antippen']`, gefuehrt
 * ueber `wege`. Sie konnte gar nicht anschlagen: „antippen" wird nur
 * vermerkt, wenn der Umschalter `#weise` dasteht, und den bekommt nur,
 * wer ZWEI Eingabewege hat. Das Profil „Eltern" hat einen. Die Gegenprobe
 * lief zweimal durch und bewies beide Male nichts. */
const OHNE_AUSWAHL = (() => {
  const doc = fs.readFileSync('docs/Lernkiste-BACKLOG.md', 'utf8');
  const z = doc.match(/^\|\s*Auswahl statt Tippen\s*\|(.+)\|\s*$/m);
  if (!z) { fehler.push('Die Zeile „Auswahl statt Tippen" fehlt im Backlog — '
    + 'dann prüft der Rauchtest das Verbot gegen nichts'); return new Set(); }
  const ids = ['fiona', 'lea', 'eltern'];
  return new Set(z[1].split('|').map((t, i) => /\bnie\b/i.test(t) ? ids[i] : null).filter(Boolean));
})();


async function neueSeite(viewport, ctx) {
  const p = await ctx.newPage({ viewport, deviceScaleFactor: 2 });
  p.on('pageerror', e => fehler.push(`Seitenfehler: ${String(e).slice(0, 140)}`));
  // Was gesprochen wird, mitschreiben statt es zu hoeren.
  //
  // Fiona liest noch nicht. Ob die App ihr die Aufgabe VORLIEST, ist damit
  // kein Schoenheitsmerkmal, sondern die Frage, ob sie das Spiel ueberhaupt
  // bedienen kann - und das laesst sich nur hier messen: `speechSynthesis`
  // gibt nichts zurueck, was man ansehen koennte.
  await p.addInitScript(() => {
    window.__gesagt = [];
    speechSynthesis.speak = (u) => { if (u && u.text) window.__gesagt.push(u.text); };
    /* Und die Toene (A2) - mitschreiben statt hoeren.
     *
     * Chromium hier hat kein Tongeraet, und `AudioContext` gibt nichts
     * zurueck, was man ansehen koennte. Der Nachbau merkt sich, WELCHE
     * Schwingungen angelegt wurden; ob sie gut klingen, hoert man auf dem
     * iPhone und nirgends sonst. */
    window.__toene = [];
    class Nachbau {
      constructor(){ this.currentTime = 0; this.destination = {}; this.state = 'running'; }
      resume(){ return Promise.resolve(); }
      createGain(){ return { gain: { setValueAtTime(){}, exponentialRampToValueAtTime(){} },
                             connect(){} }; }
      createOscillator(){
        const t = { type:'', von:null, bis:null,
          frequency: { setValueAtTime(v){ t.von = v; },
                       exponentialRampToValueAtTime(v){ t.bis = v; } },
          connect(){}, start(){}, stop(){} };
        window.__toene.push(t); return t;
      }
    }
    window.AudioContext = Nachbau; window.webkitAudioContext = Nachbau;
  });
  await p.goto(ADRESSE + '?flott', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => document.fonts.ready);
  return p;
}

/**
 * Nach einer richtigen Antwort: steht der Name auf der Karte, und steht er
 * im Bild?
 *
 * Die Zusage aus G10: 14 von 16 Bundeslaendernamen passen nicht in ihr
 * Gebiet, also ist die Fahne der Normalfall. Geprueft wird deshalb beides -
 * dass ueberhaupt ein Name erscheint, dass er vollstaendig im Kartenfeld
 * liegt, und dass die Entscheidung "innen oder daneben" wirklich gemessen
 * wird und nicht immer gleich ausfaellt.
 */
async function fahnePruefen(p, wo) {
  const f = await p.evaluate(() => {
    const g = document.querySelector('.schirm.da #fahne');
    const t = g && g.querySelector('.fahnentext');
    if (!t) return null;
    const b = t.getBoundingClientRect();
    const svg = document.querySelector('.schirm.da .karte svg').getBoundingClientRect();
    return { art: g.dataset.fahne, text: t.textContent,
             drin: b.left >= svg.left - 1 && b.right <= svg.right + 1
                && b.top >= svg.top - 1 && b.bottom <= svg.bottom + 1,
             hoch: +b.height.toFixed(0) };
  });
  if (!f) { merke('fahne', new Error(`${wo}: kein Name auf der Karte`)); return null; }
  if (!f.drin) merke('fahne', new Error(`${wo}: „${f.text}" steht außerhalb des Kartenfelds`));
  if (f.hoch < 14) merke('fahne', new Error(`${wo}: „${f.text}" nur ${f.hoch} pt hoch`));
  return f.art;
}

/**
 * Wie stark ueberlagern sich zwei Bildschirme beim Wechsel?
 *
 * Der Wechsel von Aufgabe zu Aufgabe war ein Blinzeln: beide Bildschirme
 * blendeten gleichzeitig, und weil die Karte dieselbe ist, sah man nur, wie
 * sie kurz dunkler wurde. Der erste Anlauf machte daraus ein DOPPELBILD -
 * auf einem Bild aus der Mitte des Uebergangs standen die alte Lobzeile und
 * die neue Frage uebereinander, und hinter der neuen Karte lag die alte mit
 * ihrem gruen gefaerbten Treffer.
 *
 * Gesehen hat das ein Auge, kein Tor. Gemessen wird es jetzt: waehrend des
 * ganzen Wechsels darf nie mehr als EIN Bildschirm deutlich sichtbar sein.
 * Der schwaechere der beiden ist das Mass - liegt er hoch, sieht man beide.
 */
async function ueberblendungMessen(p) {
  return p.evaluate(() => new Promise(ja => {
    let schlimmste = 0;
    const bis = performance.now() + 1500;   // der Wechsel kommt 1600 ms nach der Antwort,
                                            // gemessen wird ab rund 800 ms danach
    const tick = () => {
      const s = [...document.querySelectorAll('#buehne .schirm')];
      if (s.length > 1) {
        const o = s.map(x => +getComputedStyle(x).opacity).sort((a, b) => b - a);
        schlimmste = Math.max(schlimmste, Math.min(o[0], o[1]));
      }
      if (performance.now() < bis) requestAnimationFrame(tick); else ja(schlimmste);
    };
    requestAnimationFrame(tick);
  }));
}
let ueberblendung = null;

/* Durch den Vorlauf (R3), wenn er kommt.
 *
 * Er steht seit R3 beim ERSTEN Betreten einer Ebene je Kind davor. Der
 * Rauchtest spielt manche Ebene mehrfach - dann kommt er nicht mehr.
 * Deshalb wird nachgesehen und nicht angenommen.
 *
 * Gewartet wird auf das ODER: Vorlauf ODER Aufgabe. Wer nur auf den
 * Vorlauf wartet, laeuft beim zweiten Besuch in einen Zeitablauf; wer nur
 * auf die Aufgabe wartet, beim ersten.
 */
async function durchVorlaufWenn(p) {
  await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel, '
    + '.schirm.da .rechnung, .schirm.da .eingabe', { timeout: 25000 }).catch(() => {});
  await durchVorlauf(p);
}

/* Aus einer laufenden Aufgabe zurueck in die Ebenenwahl.
 *
 * Seit R1 fuehrt das Kreuz im Spiel nicht mehr direkt dorthin, sondern in
 * die PAUSE. Drei Stellen im Rauchtest gingen davon aus, dass ein Klick
 * genuegt, und liefen danach in einen Zeitablauf - neun Gegenproben
 * meldeten daraufhin "smoke ist schon OHNE Eingriff rot".
 *
 * Deshalb EIN Weg hinaus, an einer Stelle: Kreuz, und wenn die Pause
 * kommt, durch sie hindurch. Wer den Ausgang an drei Stellen
 * nachbaut, pflegt ihn an zweien nicht.
 */
async function raus(p) {
  const zur = await p.$('.schirm.da #zur');
  if (zur) await p.$eval('.schirm.da #zur', x => x.click());
  const pause = await p.waitForSelector('.schirm.da #raus', { timeout: 2000 }).catch(() => null);
  if (pause) await p.$eval('.schirm.da #raus', x => x.click());
  await p.waitForSelector('.schirm.da [data-ebene]', { timeout: 8000 }).catch(() => {});
}

/* Warten, bis die Antwort BEWERTET ist - vor dem Lesen.
 *
 * Das Gegenstueck zu `weitergegangen`: dort wartet man, bis das Lob WEG
 * ist, hier, bis es DA ist. Beides sind Bedingungen; eine Frist dazwischen
 * ist entweder zu lang oder zu kurz. Seit die App mit `?flott` nach 900 ms
 * weitergeht, lag die alte Frist von 900 ms genau auf der Kippe - der
 * Rauchtest las die naechste Frage und meldete „6 angetippt -> Wie viel
 * ist das?".
 */
async function bewertet(p, ms = 6000) {
  return p.waitForFunction(() => {
    const f = document.querySelector('.schirm.da .frage');
    return !!(f && (f.querySelector('.richtigText') || f.querySelector('.fastText')
                    || f.querySelector('.loesung')));
  }, null, { timeout: ms }).then(() => true).catch(() => false);
}

/* Warten, bis die App weitergegangen ist - nicht eine Frist lang.
 *
 * Nach einer richtigen Antwort bleibt das Lob `LOBPAUSE` stehen, dann
 * kommt die naechste Aufgabe oder der Endbildschirm. Der erste Versuch,
 * das zu beschleunigen, hat feste Fristen gekuerzt und den Rauchtest an
 * elf Stellen rot gemacht: eine Frist ist entweder zu lang (dann kostet
 * sie) oder zu kurz (dann liest der Test die Frage statt der Antwort).
 *
 * Gewartet wird deshalb auf das, was WIRKLICH den Fortschritt anzeigt:
 * das Lob ist weg UND es steht wieder etwas da, das man bedienen kann.
 * Das ist schneller als jede Frist und kann nicht zu kurz sein.
 */
async function weitergegangen(p, ms = 8000) {
  return p.waitForFunction(() => {
    const s = document.querySelector('.schirm.da');
    if (!s) return false;
    if (s.querySelector('.frage .richtigText, .frage .fastText, .frage .loesung')) return false;
    return !!(s.querySelector('.karte svg path.ziel') || s.querySelector('.rechnung')
              || s.querySelector('#nochmal'));
  }, null, { timeout: ms }).then(() => true).catch(() => false);
}

/** Eine Aufgabe loesen: das passende Etikett auf den Anker des Ziels ziehen. */
async function loese(p) {
  // Warten, bis der Bildschirmwechsel wirklich durch ist - sonst greift der
  // Test in die alte Aufgabe.
  await p.waitForFunction(() => document.querySelectorAll('.schirm').length === 1
    && document.querySelector('.schirm.da path.ziel'), null, { timeout: 5000 });
  const info = await p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const ziel = s.querySelector('path.ziel'); if (!ziel) return null;
    const D = JSON.parse(document.getElementById('daten').textContent);
    const id = ziel.dataset.id;
    const b = D.deutschland.find(x => x.id === id);
    const svg = s.querySelector('.karte svg');
    const pt = svg.createSVGPoint(); pt.x = b.anker[0]; pt.y = b.anker[1];
    const q = pt.matrixTransform(svg.getScreenCTM());
    const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent);
    return { id, name: b.name, x: q.x, y: q.y, idx: namen.indexOf(b.name), namen };
  });
  if (!info) throw new Error('kein Ziel gefunden');
  if (info.idx < 0) throw new Error(`Etikett "${info.name}" fehlt unter ${info.namen.join(', ')}`);
  const et = (await p.$$('.schirm.da .etikett'))[info.idx];
  const a = await et.boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  await p.mouse.move(info.x, info.y, { steps: 10 });
  await p.mouse.up();
  // Erkannt wird der richtige Ausgang an der KLASSE, nicht am Wortlaut.
  // Vorher stand hier /Richtig/ - und als das Lob abwechslungsreich wurde
  // ("Klasse! Das ist Thueringen."), meldete der Rauchtest einundzwanzig
  // Fehler, obwohl jede Antwort gewertet worden war. Eine Klasse ist eine
  // Zusage des Programms; ein Satz ist Text, den jemand aendern darf.
  await p.waitForFunction(() => !!document.querySelector('.schirm.da .frage .richtigText'),
    null, { timeout: 4000 });
  return info.name;
}

/* ---------- Abschnitte --------------------------------------------------
 *
 * Der Rauchtest ist der teuerste Posten im Probenlauf: 1850 von 2100
 * Sekunden, weil JEDE seiner zwanzig Gegenproben ihn ganz durchfährt -
 * obwohl jede sich für einen Abschnitt interessiert. Bei `ziehen` ist
 * dasselbe längst zerlegt (129 s auf 48 s).
 *
 *     spielen    zwei Runden Bundesländer: Sterne, Band, Fahne, Übergang
 *     ablage     Neustart, Ebenenwahl, Forscherbuch, Eltern, „von vorne"
 *     tippen     Hochformat, Lea tippt
 *     ebene4     vier Städte, eine richtig
 *     durchgang  jede Ebene mit beiden Profilen
 *
 * `ablage` braucht, was `spielen` abgelegt hat - deshalb zieht es den
 * Abschnitt mit. Alles andere steht für sich.
 *
 * OHNE Argument läuft alles, und die Kette ruft ihn ohne Argument auf: eine
 * Abkürzung, die man versehentlich nimmt, wäre keine Abkürzung.
 */
const ABSCHNITTE = ['spielen', 'ablage', 'tippen', 'regler', 'ebene4', 'durchgang'];
const BRAUCHT = { ablage: ['spielen'] };
const gewaehlt = (() => {
  const roh = (process.argv.find(a => a.startsWith('--nur=')) || '').split('=')[1];
  if (!roh) return null;
  const m = new Set(roh.split(',').map(x => x.trim()).filter(Boolean));
  for (const t of [...m]) for (const v of (BRAUCHT[t] || [])) m.add(v);
  return m;
})();
// Ein Tippfehler im Namen würde sonst ALLES überspringen und grün melden -
// die stillste Art, einen Test abzuschalten.
for (const t of (gewaehlt || []))
  if (!ABSCHNITTE.includes(t)) {
    console.error(`\n  smoke: den Abschnitt „${t}" gibt es nicht. `
      + `Bekannt sind: ${ABSCHNITTE.join(', ')}.\n`);
    process.exit(2);
  }
const laeuft = (t) => (!gewaehlt || gewaehlt.has(t)) && !abbruch();
if (gewaehlt)
  console.log(`  (nur ${[...gewaehlt].sort().join(', ')} — `
    + `${ABSCHNITTE.filter(t => !gewaehlt.has(t)).join(', ')} übersprungen)`);

/* --- Durchgang 1: spielen und ablegen --------------------------------- */
const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
let geloest = [];
const sternVerlauf = [], bandVerlauf = [];
let endSterne = null, kleberMoment = 0;
const fahnenArten = new Set();
let durchgespielt = 0;
if (laeuft('spielen')) try {
  const p = await neueSeite({ width: 844, height: 390 }, ctx);
  await p.click('[data-profil="fiona"]');
  await zurEbenenwahl(p, 'bundeslaender');
  /* --- Der Vorlauf beim ERSTEN Betreten (R3) --------------------------
   *
   * Geprueft wird, dass er DA IST - nicht nur, dass er funktioniert, wenn
   * er da ist. Der Unterschied ist der ganze Punkt: `durchVorlaufWenn`
   * geht durch ihn hindurch, wenn er kommt, und schweigt sonst. Ohne die
   * Pruefung hier waere ein Vorlauf, der nie erscheint, fuer den
   * Rauchtest ununterscheidbar von einem, der erscheint.
   *
   * Und: fuer Fiona muss jeder Name zu HOEREN sein. Sie liest nicht - ein
   * Bildschirm zum Anschauen, der nur Text zeigt, ist fuer sie leer.
   */
  await p.click('[data-ebene="bundeslaender"]');
  const vorlaufDa = await p.waitForSelector('.schirm.da #los', { timeout: 25000 })
    .then(() => true).catch(() => false);
  if (!vorlaufDa) merke('vorlauf', new Error(
    'beim ersten Betreten der Bundesländer kommt kein Vorlauf'));
  else {
    const karten = await p.$$eval('.schirm.da .aufkleber', es => es.length);
    if (karten !== 16) merke('vorlauf', new Error(
      `der Vorlauf zeigt ${karten} Bundesländer statt 16`));
    // Antippen muss sprechen — sonst ist der Bildschirm fuer Fiona leer.
    await p.evaluate(() => { window.__gesagt = []; });
    await p.$eval('.schirm.da .aufkleber', x => x.click());
    await p.waitForTimeout(300);
    const gesagt = await p.evaluate(() => (window.__gesagt || []).join(' | '));
    if (!gesagt.trim()) merke('vorlauf', new Error(
      'eine angetippte Karte im Vorlauf sagt nichts — für Fiona ist der Bildschirm damit leer'));
    console.log(`  Vorlauf:                    ${karten} Karten, angetippt → „${
      gesagt.slice(0, 40)}"`);
  }
  await durchVorlaufWenn(p);
  await p.waitForSelector('.schirm.da .karte svg');
  // ZWEI Sitzungen. Ein Aufkleber braucht Fach 3, also zweimal richtig -
  // mit einer Sitzung waere das Forscherbuch immer leer, und das Tor
  // koennte den Aufkleber nie sehen.
  for (let runde = 0; runde < 2; runde++) {
    for (let n = 0; n < 6; n++) {
      if (!(await p.$('.schirm.da .karte svg'))) break;
      geloest.push(await loese(p));
      // Der Kopf muss auf die Antwort REAGIEREN, nicht erst beim naechsten
      // Bild. Vorher wurde der Bildschirm je Aufgabe einmal gebaut und
      // zeigte damit den Stand VOR der laufenden Antwort - bei vier von
      // vier richtig stand der Kopf auf einem Stern, der Endbildschirm auf
      // drei. Zwei Formeln, zwei Wahrheiten.
      const kopf = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        return { sterne: [...s.querySelectorAll('.sterne svg')]
                   .filter(x => !/stern-aus/.test(x.innerHTML)).length,
                 band: [...s.querySelectorAll('.band i')].map(x => x.className) };
      });
      sternVerlauf.push({ runde, n: kopf.sterne });
      bandVerlauf.push(kopf.band.join(' '));
      // Die Fahne wird MIT dem Lob gezeichnet, aber nicht im selben
      // Bild: `loese()` wartet auf das Lob, die Fahne kommt einen
      // Anzeigeschritt spaeter. Ohne dieses kurze Warten meldete das Tor
      // „in zwoelf Aufgaben nur die Sorte daneben".
      await p.waitForTimeout(250);
      const art = await fahnePruefen(p, geloest[geloest.length - 1]);
      if (art) fahnenArten.add(art);
      // Die Messung ersetzt die Wartezeit, sie kommt nicht dazu. Beim
      // ersten Anlauf stand sie VOR der Fahnenpruefung, verbrauchte 2,6 s
      // und ueberholte damit den Bildschirmwechsel - danach meldete das
      // Tor „kein Name auf der Karte", obwohl der Name dagewesen war.
      if (ueberblendung === null) ueberblendung = await ueberblendungMessen(p);
      else await weitergegangen(p);
    }
    const nochmal = await p.$('.schirm.da #nochmal');
    if (nochmal) {
      endSterne = await p.evaluate(() => [...document.querySelectorAll('.schirm.da .sterne svg')]
        .filter(x => !/stern-aus/.test(x.innerHTML)).length);
      await nochmal.click(); await p.waitForSelector('.schirm.da .karte svg');
    }
  }
  // Gemessen wird in der ZWEITEN Sitzung: dort muss stehen, was in der
  // ersten gelernt wurde. Beim ersten Anlauf hing der Fortschritt an der
  // Sitzung und war nach dem Neustart weg - der Rauchtest meldete null
  // gekonnte Gebiete, und das war richtig.
  // Fuellt sich die Karte wirklich? Die Zusage lautet: was schon sass,
  // bleibt in voller Farbe stehen und traegt einen Haken - und zwar ueber
  // den Aufgabenwechsel hinweg, denn der baut den Bildschirm neu.
  const gefuellt = await p.evaluate(() => ({
    gesessen: document.querySelectorAll('.schirm.da path.geb.gesessen').length,
    haken:   document.querySelectorAll('.schirm.da .haken').length,
    ruhig:   document.querySelectorAll('.schirm.da path.geb.ruhig').length,
  }));
  console.log(`  Karte nach zwei Sitzungen: ${gefuellt.gesessen} Gebiete in voller Farbe, `
    + `${gefuellt.haken} Haken, ${gefuellt.ruhig} noch gedämpft`);
  if (gefuellt.gesessen < 2)
    merke('gesessen', new Error(`nur ${gefuellt.gesessen} Gebiete stehen in voller Farbe — `
      + `der Fortschritt überlebt den Aufgabenwechsel nicht`));
  if (gefuellt.haken !== gefuellt.gesessen)
    merke('gesessen', new Error(`${gefuellt.gesessen} Gebiete in voller Farbe, `
      + `aber ${gefuellt.haken} Haken`));
  await p.screenshot({ path: '/tmp/smoke-spiel.png' });
  await p.close();
} catch (e) { merke('spielen', e); }

/* --- Durchgang 2: NEUE Seite, gleiche Herkunft. Traegt die Ablage? ---- */
let fortschritt = null;
if (laeuft('ablage')) try {
  const p = await neueSeite({ width: 1180, height: 820 }, ctx);
  await p.click('[data-profil="fiona"]');
  await zurEbenenwahl(p, 'bundeslaender');
  /* Die Ebenenwahl trägt jetzt Sterne, Aufkleber und einen Balken statt
   * der Zeile „0 von 16". Auf dem Zielgerät war von dieser Zeile ohnehin
   * nur die Zahl übrig: Balken und Überzeile sind im kurzen Querformat
   * ausgeblendet, und Fiona liest keine Zahlen.
   *
   * Geprüft wird nicht, dass die drei DA sind - das wäre eine Zusage über
   * Markup. Geprüft wird, dass sie DASSELBE sagen: der gefüllte Streifen
   * des Balkens muss dem Verhältnis entsprechen, das die Zahl daneben
   * nennt. Genau das stimmte auf dem Endbildschirm nicht (Balken auf einem
   * Viertel, Zahl auf null), und genau das kann wieder auseinanderlaufen.
   */
  const kachel = await p.evaluate(() => {
    const k = document.querySelector('[data-ebene="bundeslaender"]');
    if (!k) return null;
    const marke = k.querySelector('.klebermarke');
    const fest  = k.querySelector('.balken i.fest');
    const zahl  = (x) => { const m = (x || '').match(/-?[\d.]+/); return m ? +m[0] : null; };
    return {
      sterne: k.querySelectorAll('.sterne svg').length,
      voll:   [...k.querySelectorAll('.sterne svg')]
                .filter(x => !/stern-aus/.test(x.innerHTML)).length,
      kleber: marke ? zahl(marke.textContent) : null,
      gesamt: marke ? zahl((marke.getAttribute('aria-label') || '').split('von')[1]) : null,
      fest:   fest ? zahl(fest.style.transform) : null,
    };
  });
  if (!kachel) merke('ebenenwahl', new Error('die Kachel „Bundesländer" ist verschwunden'));
  else {
    fortschritt = `${kachel.voll}/3 Sterne, ${kachel.kleber} von ${kachel.gesamt} Aufkleber, `
      + `Balken ${kachel.fest}`;
    if (kachel.sterne !== 3)
      merke('ebenenwahl', new Error(`die Kachel zeigt ${kachel.sterne} Sterne statt drei — `
        + 'ohne sie steht dort für ein Kind, das nicht liest, gar nichts'));
    if (kachel.kleber === null || kachel.gesamt === null)
      merke('ebenenwahl', new Error('die Kachel nennt die Aufkleber nicht'));
    else if (kachel.kleber < 1)
      merke('ebenenwahl', new Error('nach zwei Sitzungen steht die Kachel auf null Aufklebern'));
    else if (kachel.fest === null)
      merke('ebenenwahl', new Error('die Kachel hat keinen gefüllten Balkenstreifen'));
    else if (Math.abs(kachel.fest - kachel.kleber / kachel.gesamt) > 0.01)
      merke('ebenenwahl', new Error(`der Balken steht auf ${kachel.fest}, `
        + `die Zahl daneben auf ${kachel.kleber} von ${kachel.gesamt} `
        + `(${(kachel.kleber / kachel.gesamt).toFixed(3)}) — zwei Größen, eine Anzeige`));
  }
  // Der Beweis ist die ABLAGE, nicht der Text. Ein Regex auf "0 von 16"
  // trifft die 16 und meldet gruen - genau das ist beim ersten Lauf passiert.
  const abgelegt = await p.evaluate(() => new Promise(ja => {
    const a = indexedDB.open('lernkiste');
    a.onsuccess = () => { const d = a.result;
      const t = d.transaction('fortschritt', 'readonly');
      const g = t.objectStore('fortschritt').get('fiona:bundeslaender');
      g.onsuccess = () => ja(g.result ? Object.keys(g.result).length : 0);
      g.onerror = () => ja(-1); };
    a.onerror = () => ja(-1);
  }));
  console.log(`  In der Ablage:              ${abgelegt} Gegenstände im Leitner-Stand`);
  if (abgelegt < 3) merke('ablage', new Error(`nur ${abgelegt} Gegenstände abgelegt, erwartet mindestens 3`));
  // Forscherbuch
  await p.evaluate(() => { window.__gesagt = []; });
  await p.click('#buch');
  await p.waitForSelector('.schirm.da .aufkleber');
  await p.waitForTimeout(300);
  const kleber = await p.$$eval('.schirm.da .aufkleber.da', e => e.length);
  if (kleber < 1) merke('forscherbuch', new Error('kein einziger Aufkleber nach zwei Sitzungen'));
  const alleKleber = await p.$$eval('.schirm.da .aufkleber', e => e.length);
  /* --- Das Buch zeigt nicht mehr die ganze Wand ----------------------
   *
   * Rueckmeldung der Kinder: es sieht nach ARBEIT aus. Vorher standen hier
   * ALLE rund sechzig Gebiete, am Anfang fast alle grau mit Fragezeichen -
   * eine To-do-Liste an einem Ort, der belohnen soll.
   *
   * Die Zusage: gezeigt wird, was DA ist, plus hoechstens drei als
   * Vorschau. Geprueft wird sie gegen die Gesamtzahl, nicht gegen eine
   * hingeschriebene Obergrenze - sonst hiesse „Wand" irgendwann etwas
   * anderes als heute.
   */
  // Gezaehlt wird gegen die ABLAGE, nicht gegen das, was der Bildschirm
  // behauptet. Der erste Anlauf zaehlte die Kaesten mit der Klasse `da` -
  // und die Gegenprobe, die einfach ALLE als gesammelt zeichnete, kam damit
  // durch: sie faelschte genau die Zahl, gegen die geprueft wurde.
  // Fach 3 ist die Schwelle (`HAT_AUFKLEBER` in src/kern/leitner.js).
  const wirklich = await p.evaluate(() => new Promise(ja => {
    const a = indexedDB.open('lernkiste');
    a.onsuccess = () => { const d = a.result;
      if (!d.objectStoreNames.contains('fortschritt')) return ja(0);
      const q = d.transaction('fortschritt', 'readonly').objectStore('fortschritt').getAll();
      q.onsuccess = () => ja(q.result.reduce((n, st) =>
        n + Object.values(st || {}).filter(x => (x?.fach ?? 1) >= 3).length, 0));
      q.onerror = () => ja(-1); };
    a.onerror = () => ja(-1);
  }));
  if (alleKleber > wirklich + 3)
    merke('forscherbuch', new Error(`das Buch zeigt ${alleKleber} Aufkleber, `
      + `wirklich gesammelt sind ${wirklich} — mehr als drei Vorschau, das ist wieder die Wand`));
  // Und es sagt Fiona, was drin ist.
  const buchGesagt = await p.evaluate(() => (window.__gesagt || []).join(' | '));
  if (!/Forscherbuch/.test(buchGesagt))
    merke('forscherbuch', new Error('das Buch sagt Fiona nicht, was drin ist — '
      + `sie kann es nicht lesen (gesagt: „${buchGesagt.slice(-80)}")`));
  await p.screenshot({ path: '/tmp/smoke-buch.png' });
  // Elternbereich
  await p.click('#zur'); await p.waitForSelector('.schirm.da #eltern');
  await p.click('#eltern'); await p.waitForSelector('.schirm.da .ziffern');
  for (let i = 0; i < 4; i++) await p.click('.schirm.da [data-z="0"]');
  await p.waitForSelector('.schirm.da .kacheln', { timeout: 4000 });
  const antworten = await p.$eval('.schirm.da .wert b', e => e.textContent);
  // Gezielt die Fassungstabelle, nicht irgendeine - die erste ist die
  // Wackelkandidatenliste, und der Bericht meldete "Niedersachsen · 2".
  const fassung = await p.evaluate(() => {
    const h = [...document.querySelectorAll('.schirm.da .gruppe')].find(x => /Diese Fassung/.test(x.textContent));
    const t = h && h.nextElementSibling;
    return t ? [...t.querySelectorAll('tr')].map(r => [...r.cells].map(c => c.textContent).join(': ')) : [];
  });
  /* --- Der Elternbereich kennt DREI Profile (R7) --------------------
   *
   * Er warf bis hierher alles in einen Topf. Die Abnahme im Konzept (M6)
   * lautet „Was kann LEA noch nicht?" - und solange Fionas und Leas
   * Fehlversuche in derselben Zeile stehen, ist sie nicht zu beantworten.
   * Geprueft wird an den drei Stellen, an denen es sichtbar wird: die
   * Uebersicht nennt jedes Profil, die Wackelkandidaten stehen unter
   * seinem Namen, und loeschen laesst sich jedes - nicht nur das, mit dem
   * man hereingekommen ist. */
  {
    const gesehen = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const kopf = [...s.querySelectorAll('.gruppe')];
      const nach = (t) => { const h = kopf.find(x => new RegExp(t).test(x.textContent));
        const raus = []; let n = h && h.nextElementSibling;
        while (n && !n.classList.contains('gruppe')) { raus.push(n); n = n.nextElementSibling; }
        return raus; };
      const tab = s.querySelector('.kacheln')?.nextElementSibling;
      return {
        uebersicht: tab && tab.tagName === 'TABLE'
          ? [...tab.querySelectorAll('tbody tr')].map(r => r.cells[0].textContent.trim()) : [],
        wackel: nach('Wackelkandidaten').filter(e => e.querySelector('strong'))
          .map(e => e.textContent.trim()),
        loeschen: [...s.querySelectorAll('[data-weg]')].map(e => e.dataset.weg),
      };
    });
    for (const name of PROFILNAMEN)
      if (!gesehen.uebersicht.includes(name))
        merke('eltern', new Error(`in der Übersicht des Elternbereichs fehlt „${name}" `
          + `(da stehen: ${gesehen.uebersicht.join(', ') || 'nichts'})`));
    if (gesehen.loeschen.length !== PROFILNAMEN.length)
      merke('eltern', new Error(`${gesehen.loeschen.length} Löschknöpfe für `
        + `${PROFILNAMEN.length} Profile — wer als Lea hereinkommt, wird Fionas Daten nicht los `
        + `(da stehen: ${gesehen.loeschen.join(', ') || 'keine'})`));
    // Fiona hat in diesem Lauf gespielt, also MUSS sie einen eigenen
    // Block bei den Wackelkandidaten haben. Steht dort kein einziger
    // Name, sind die Zahlen wieder zusammengeworfen.
    if (!gesehen.wackel.some(t => t.includes('Fiona')))
      merke('eltern', new Error('die Wackelkandidaten stehen unter keinem Profilnamen — '
        + `„Was kann Lea noch nicht?" ist so nicht zu beantworten (da steht: ${
          gesehen.wackel.join(' · ') || 'nichts'})`));
    console.log(`  Elternbereich je Profil:    ${gesehen.uebersicht.join(' · ')} `
      + `· ${gesehen.loeschen.length} Löschknöpfe`);
  }

  await p.screenshot({ path: '/tmp/smoke-eltern.png', fullPage: true });
  console.log(`  Fortschritt nach Neustart:  ${fortschritt}`);
  console.log(`  Forscherbuch:               ${kleber} von ${alleKleber} Aufklebern`);
  console.log(`  Elternbereich:              ${antworten} Antworten protokolliert`);
  console.log(`  Fassungsstempel:            ${fassung.join(' · ')}`);

  /* --- Die PIN muss sich ändern lassen -------------------------------
   *
   * Gefunden beim Audit: `Einst.pin` wurde gelesen und NIRGENDS
   * geschrieben. Auf dem Eingabeschirm stand „Voreingestellt ist 0000" -
   * und „voreingestellt" heisst, man kann es ändern. Man konnte nicht.
   * Damit stand der Elternbereich jedem Kind offen, das lesen kann - also
   * genau dem, vor dem er schützen soll.
   */
  {
    const knopf = await p.$('.schirm.da #pinneu');
    if (!knopf) merke('pin', new Error('im Elternbereich gibt es keine Möglichkeit, '
      + 'die PIN zu ändern — sie steht für immer auf 0000'));
    else {
      await knopf.click(); await p.waitForTimeout(200);
      for (const z of ['1', '9', '8', '4'])
        await p.click(`.schirm.da #pinstand [data-neu="${z}"]`);
      await p.waitForTimeout(400);
      await p.reload();
      await p.waitForSelector('[data-profil="fiona"]');
      await p.click('[data-profil="fiona"]');
      // `#eltern` steht seit D4 schon auf der Weltenwahl - dorthin gehoert er,
      // er haengt am Kind und nicht an einem Fach.
      await p.waitForSelector('.schirm.da [data-welt]');
      await p.click('#eltern'); await p.waitForSelector('.schirm.da .ziffern');
      for (let i = 0; i < 4; i++) await p.click('.schirm.da [data-z="0"]');
      await p.waitForTimeout(500);
      const altRein = !!(await p.$('.schirm.da #pinneu'));
      // Kommt man mit der ALTEN PIN hinein, steht man jetzt IM
      // Elternbereich - dort gibt es kein Ziffernfeld mehr. Die neue PIN
      // hier trotzdem einzutippen liess den Rauchtest mit einer
      // Playwright-Zeitueberschreitung sterben, statt zu sagen, was los
      // ist: die Gegenprobe wurde rot, aber aus dem falschen Grund.
      let neuRein = null;
      if (!altRein) {
        for (const z of ['1', '9', '8', '4']) await p.click(`.schirm.da [data-z="${z}"]`);
        await p.waitForTimeout(600);
        neuRein = !!(await p.$('.schirm.da #pinneu'));
      }
      console.log(`  PIN geändert:               mit 0000 rein: ${altRein ? 'JA' : 'nein'}, `
        + `mit 1984 rein: ${neuRein === null ? '—' : neuRein ? 'ja' : 'NEIN'}`);
      if (altRein) merke('pin', new Error('nach dem Ändern kommt man immer noch mit 0000 hinein'));
      else if (!neuRein) merke('pin', new Error('mit der neuen PIN kommt man nicht hinein'));
    }
  }


  /* --- „Von vorne": das Kind kommt selbst wieder an die Aufgaben ------
   *
   * Der Anlass: wer eine Ebene gekonnt hat, kam nicht mehr an sie heran.
   * Der einzige Weg zurueck ging ueber „Alles von Fiona loeschen" im
   * Elternbereich - und das loescht das ganze Profil.
   *
   * Geprueft wird die ganze Kette, nicht das Vorhandensein eines Knopfes:
   * ist Fortschritt da, steht der Knopf da; ein Tipper fragt nach; der
   * zweite loescht; danach ist die Ebene wirklich leer. Ein Knopf, der
   * dasteht und nichts tut, waere schlimmer als keiner.
   */
  // ZULETZT, denn es raeumt weg, was Forscherbuch und Elternbereich
  // brauchen. Der erste Anlauf stand davor und meldete prompt
  // „kein einziger Aufkleber" - der Test hatte sich selbst die
  // Grundlage entzogen.
  {
    // Zurueck aus dem Elternbereich in die Ebenenwahl - dort steht der Knopf.
    await p.click('.schirm.da #zur');
    await zurEbenenwahl(p, 'bundeslaender');
    await p.waitForTimeout(400);
    const knopf = await p.$('.schirm.da [data-neu="bundeslaender"]');
    if (!knopf) merke('vonvorne', new Error(
      'nach zwei Sitzungen steht kein „von vorne" an den Bundesländern'));
    else {
      const erst = await knopf.textContent();
      await knopf.click(); await p.waitForTimeout(150);
      // Der Knopf kann nach dem ersten Tipper VERSCHWUNDEN sein - naemlich
      // genau dann, wenn er schon geloescht hat. Das ist der Befund, nicht
      // ein Fehler im Test: der erste Anlauf stuerzte hier ab, statt ihn zu
      // melden, und die Gegenprobe schlug „aus einem anderen Grund" an.
      const zweiter = await p.$('.schirm.da [data-neu="bundeslaender"]');
      const nachfrage = zweiter ? (await zweiter.textContent()) : '(weg)';
      if (!/Wirklich/.test(nachfrage)) merke('vonvorne', new Error(
        `der erste Tipper löscht sofort — er fragt nicht nach (steht: „${nachfrage.trim()}")`));
      if (zweiter) await zweiter.click();
      await p.waitForTimeout(500);
      const rest = await p.evaluate(() => new Promise(ja => {
        const a = indexedDB.open('lernkiste');
        a.onsuccess = () => { const d = a.result;
          const g = d.transaction('fortschritt', 'readonly').objectStore('fortschritt')
            .get('fiona:bundeslaender');
          g.onsuccess = () => ja(g.result ? Object.keys(g.result).length : 0);
          g.onerror = () => ja(-1); };
        a.onerror = () => ja(-1);
      }));
      console.log(`  „Von vorne":                „${erst.trim()}" → nachgefragt → `
        + `${rest} Gegenstände übrig`);
      if (rest !== 0) merke('vonvorne', new Error(
        `nach „von vorne" stehen noch ${rest} Gegenstände im Leitner-Stand`));
      const weg = await p.$('.schirm.da [data-neu="bundeslaender"]');
      if (weg) merke('vonvorne', new Error(
        'der Knopf steht noch da, obwohl es keinen Fortschritt mehr gibt'));
      // Das Forscherbuch braucht Aufkleber - die Bundeslaender sind jetzt
      // leer, aber die Kontinente aus der ersten Sitzung stehen noch.
    }
  }


  if (+antworten < 3) merke('protokoll', new Error(`nur ${antworten} Einträge`));

  /* --- Die Pause: von vorne MITTEN im Spiel (R1) ----------------------
   *
   * Der Knopf auf der Ebenenwahl oben raeumt eine Ebene weg, bevor sie
   * losgeht. Gefragt war der andere Fall: mittendrin.
   *
   * Geprueft wird die ganze Kette und nicht der Knopf: das Kreuz fuehrt in
   * die Pause, der erste Tipper fragt nach, der zweite loescht - und
   * danach steht die Sitzung wirklich wieder bei der ERSTEN Aufgabe. Der
   * letzte Teil ist der, der leicht kaputtgeht: `starten()` liest den
   * Leitner-Stand neu, und ohne `Stand = {}` begaenne die neue Runde mit
   * den alten Faechern - dieselbe Aufgabe, dasselbe Fach, nur ohne
   * Haekchen. Das saehe von aussen richtig aus.
   */
  {
    // Gespielt wird auf den BUNDESLAENDERN, nicht auf den Kontinenten:
    // `loese()` schlaegt den Anker in `D.deutschland` nach und kann nur
    // diese Ebene. Und es trifft sich gut - der Block darueber hat sie
    // gerade leergeraeumt, also ist der Fortschritt, den diese Probe
    // gleich loescht, garantiert IHRER.
    await p.click('[data-ebene="bundeslaender"]');
  await durchVorlaufWenn(p);
    await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });
    // Zwei Aufgaben loesen, damit es ueberhaupt etwas zu loeschen gibt -
    // und WARTEN, bis das Fortschrittsband es zeigt.
    //
    // Ohne dieses Warten war die Sitzung beim Kreuz noch bei Aufgabe eins,
    // und die Probe „nach von vorne laeuft die alte Sitzung weiter" bewies
    // nichts: ob neu angefangen oder weitergezaehlt - das Band stand so
    // oder so auf Punkt eins. Der Eingriff war drin, das Tor blieb gruen
    // (Regel 3).
    await loese(p); await loese(p);
    // Gewartet wird darauf, dass der LAUFENDE Punkt weitergerueckt ist -
    // nicht darauf, dass irgendein Punkt gefaerbt ist.
    //
    // Der Unterschied hat eine Probe gekostet: nach der ersten richtigen
    // Antwort faerbt sich Punkt eins sofort, weitergerueckt wird aber erst
    // 2,6 s spaeter. Die Sitzung stand beim Kreuz also noch auf Aufgabe
    // eins - und dann sieht ein Neuanfang genauso aus wie ein
    // Weiterzaehlen. Die Probe „nach von vorne laeuft die alte Sitzung
    // weiter" blieb gruen, obwohl der Fehler drin war (Regel 3).
    const weiter = await p.waitForFunction(() =>
      [...document.querySelectorAll('.schirm.da .band i')]
        .findIndex(x => x.className === 'jetzt') >= 1,
      null, { timeout: 12000 }).then(() => true).catch(() => false);
    if (!weiter) merke('pause', new Error(
      'die Sitzung steht nach zwei gelösten Aufgaben immer noch bei der ersten — '
      + 'die Probe könnte nicht unterscheiden, ob nach „von vorne" neu angefangen wird'));
    const vorher = await p.evaluate(() => new Promise(ja => {
      const a = indexedDB.open('lernkiste');
      a.onsuccess = () => { const g = a.result.transaction('fortschritt', 'readonly')
        .objectStore('fortschritt').get('fiona:bundeslaender');
        g.onsuccess = () => ja(g.result ? Object.keys(g.result).length : 0);
        g.onerror = () => ja(-1); };
      a.onerror = () => ja(-1);
    }));
    if (vorher < 1) merke('pause', new Error(
      'vor der Pausenprobe steht kein Fortschritt in den Bundeslaendern — '
      + 'die Probe koennte nichts loeschen und saehe trotzdem gruen aus'));

    await p.click('.schirm.da #zur');
    const pause = await p.waitForSelector('.schirm.da #null', { timeout: 5000 }).catch(() => null);
    if (!pause) merke('pause', new Error('das Kreuz im Spiel fuehrt nicht in die Pause'));
    else {
      const erst = (await pause.textContent()).trim();
      await pause.click(); await p.waitForTimeout(200);
      const nachfrage = (await p.textContent('.schirm.da #null')).trim();
      if (!/Wirklich/.test(nachfrage)) merke('pause', new Error(
        `der erste Tipper loescht sofort — er fragt nicht nach (steht: „${nachfrage}")`));
      await p.click('.schirm.da #null');
      await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });
      await p.waitForTimeout(400);
      const nachher = await p.evaluate(() => new Promise(ja => {
        const a = indexedDB.open('lernkiste');
        a.onsuccess = () => { const g = a.result.transaction('fortschritt', 'readonly')
          .objectStore('fortschritt').get('fiona:bundeslaender');
          g.onsuccess = () => ja(g.result ? Object.keys(g.result).length : 0);
          g.onerror = () => ja(-1); };
        a.onerror = () => ja(-1);
      }));
      // Steht die Sitzung wieder am Anfang? Das Fortschrittsband sagt es:
      // der erste Punkt ist `jetzt`, keiner davor ist erledigt.
      const band = await p.evaluate(() => {
        const i = [...document.querySelectorAll('.schirm.da .band i')];
        return { n: i.length, erster: i[0] ? i[0].className : '(keins)',
                 erledigt: i.filter(x => x.className !== 'offen' && x.className !== 'jetzt').length };
      });
      // Und: keine Haekchen mehr auf der Karte.
      const haken = await p.evaluate(() =>
        document.querySelectorAll('.schirm.da .karte svg .haken, .schirm.da .karte svg path.gesessen').length);
      console.log(`  Pause, von vorne:           „${erst}" → nachgefragt → `
        + `${vorher} → ${nachher} Gegenstände, Band ${band.erster} `
        + `(${band.erledigt} erledigt), ${haken} Häkchen`);
      if (nachher !== 0) merke('pause', new Error(
        `nach „von vorne" stehen noch ${nachher} Gegenstände im Leitner-Stand`));
      if (band.erster !== 'jetzt' || band.erledigt !== 0) merke('pause', new Error(
        `die Sitzung zählt weiter statt neu anzufangen — erster Punkt „${band.erster}", `
        + `${band.erledigt} schon erledigt`));
      if (haken !== 0) merke('pause', new Error(
        `auf der Karte stehen noch ${haken} Häkchen`));
    }
  }

  await p.close();
} catch (e) { merke('ablage/eltern', e); }

/* --- Durchgang 3: Hochformat, Lea tippt ------------------------------- */
if (laeuft('tippen')) try {
  const p = await neueSeite({ width: 390, height: 844 }, ctx);
  await p.click('[data-profil="lea"]');
  await zurEbenenwahl(p, 'laender:europa');
  // Auf einer Ebene, auf der Lea WIRKLICH tippt. Die Bundeslaender sind
  // seit der Farbrunde eine Auswahl mit vier Moeglichkeiten - dort gibt es
  // kein Eingabefeld mehr, und der Rauchtest lief in einen Zeitablauf.
  await p.click('[data-ebene="laender:europa"]');
  await durchVorlaufWenn(p);
  await p.waitForSelector('.schirm.da .eingabe', { timeout: 15000 });
  const name = await p.evaluate(() => {
    const id = document.querySelector('.schirm.da path.ziel').dataset.id;
    const D = JSON.parse(document.getElementById('daten').textContent);
    return Object.values(D.laender).flat().find(x => x.a3 === id).name;
  });
  await p.fill('.schirm.da .eingabe', name.toLowerCase());
  await p.click('.schirm.da .knopf:has-text("Prüfen")');
  await p.waitForFunction(() => /groß/.test(document.querySelector('.schirm.da .frage')?.textContent || ''),
    null, { timeout: 4000 });
  console.log(`  Rechtschreibhinweis:        „${name.toLowerCase()}" → Großschreibung gemeldet`);
  await p.close();
} catch (e) { merke('tippen', e); }

/* --- Der Regler: kommt er bis in die Sitzung? -------------------------
 *
 * Regel 13 — wer eine Wirkung misst, schaltet sie zuerst ab. Ein Regler im
 * Elternbereich, der sich schieben lässt und sich beschriftet, sieht von
 * aussen genauso aus wie einer, der wirkt. Dazwischen liegen vier
 * Stationen: Regler → `Einst.reihenGeteilt` → `EBENEN.mischung()` → die
 * Sitzung. Jede einzelne davon kann still ausfallen.
 *
 * Gemessen wird deshalb am ENDE der Kette, an dem, was Lea wirklich
 * vorgelegt bekommt: acht Aufgaben, und bei 50 % müssen genau vier davon
 * Geteilt-Aufgaben sein. Die Zahl ist keine Schätzung - die Sitzung teilt
 * jeder Sorte `Math.round(sitzung * anteil)` zu.
 *
 * Ein eigener Abschnitt, weil er als einziger eine ganze Sitzung
 * durchspielt: so bezahlt ihn nur die Gegenprobe, die ihn braucht.
 */
if (laeuft('regler')) try {
  const p = await neueSeite({ width: 1180, height: 820 }, ctx);
  await p.evaluate(() => new Promise((ja, nein) => {
    const auf = indexedDB.open('lernkiste', 1);
    auf.onupgradeneeded = () => {
      for (const l of ['profile','fortschritt','protokoll','einstellungen'])
        if (!auf.result.objectStoreNames.contains(l)) auf.result.createObjectStore(l);
    };
    auf.onsuccess = () => {
      const t = auf.result.transaction(['einstellungen'], 'readwrite');
      t.objectStore('einstellungen').put({ reihenGeteilt: 0.5 }, 'alles');
      t.oncomplete = ja; t.onerror = () => nein(t.error);
    };
    auf.onerror = () => nein(auf.error);
  }));
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-profil="lea"]');
  await p.click('[data-profil="lea"]');
  await zurEbenenwahl(p, 'rechnen:reihen');
  await p.click('[data-ebene="rechnen:reihen"]');
  await durchVorlaufWenn(p);
  await p.waitForSelector('.schirm.da .rechnung', { timeout: 15000 });

  /* Die Toene (A2) — und zwar an EINER falschen und EINER richtigen
   * Antwort, hintereinander an derselben Aufgabe.
   *
   * Geprueft wird nicht, ob es gut klingt: das hoert man auf dem iPhone.
   * Geprueft wird, dass ueberhaupt einer kommt und dass die beiden
   * VERSCHIEDEN sind. Ein Ton, der bei richtig und falsch derselbe ist,
   * sagt dem Kind nichts - und sieht in jedem Mitschnitt aus wie zwei.
   *
   * Absichtlich vor der Zaehlschleife: ein Fehlversuch laesst dieselbe
   * Aufgabe stehen, und die Schleife wuerde sie sonst doppelt zaehlen.
   */
  const arten = [];
  {
    const eins = await p.evaluate(() => {
      const m = document.querySelector('.schirm.da .rechnung').textContent
        .match(/(\d+)\s*([+−×:])\s*(\d+)/);
      const a = +m[1], b = +m[3];
      return { art: m[2], soll: m[2] === '×' ? a * b : a / b };
    });
    const erste = eins.soll;
    // Die erste Aufgabe wird hier BEANTWORTET - also zaehlt sie hier auch.
    // Sonst faende die Schleife unten nur noch sieben und meldete eine
    // Sitzungslaenge, die es nie gab.
    arten.push(eins.art);
    await p.evaluate(() => { window.__toene = []; });
    await p.fill('.schirm.da #rein', String(erste + 1 > 100 ? erste - 1 : erste + 1));
    await p.click('.schirm.da #pruef');
    await p.waitForTimeout(300);
    const daneben = await p.evaluate(() => window.__toene.map(t => ({ von: t.von, bis: t.bis })));
    await p.evaluate(() => { window.__toene = []; });
    await p.fill('.schirm.da #rein', String(erste));
    await p.click('.schirm.da #pruef');
    await p.waitForTimeout(300);
    const treffer = await p.evaluate(() => window.__toene.map(t => ({ von: t.von, bis: t.bis })));
    const zeig = (x) => x.map(t => `${t.von}→${t.bis ?? t.von}`).join(' ') || 'STILL';
    console.log(`  Ton bei falsch/richtig:     ${zeig(daneben)}  |  ${zeig(treffer)}`);
    if (!daneben.length) merke('regler', new Error('eine falsche Antwort bleibt stumm'));
    if (!treffer.length) merke('regler', new Error('eine richtige Antwort bleibt stumm'));
    if (JSON.stringify(daneben) === JSON.stringify(treffer))
      merke('regler', new Error('richtig und falsch klingen gleich — dann sagt der Ton nichts'));
    // Und die Richtung: das Lob geht hinauf, der Hinweis hinunter.
    if (treffer.length && !(treffer[treffer.length - 1].von > treffer[0].von))
      merke('regler', new Error('der Ton fuer „richtig" steigt nicht'));
    if (daneben.length && !(daneben[0].bis < daneben[0].von))
      merke('regler', new Error('der Ton fuer „falsch" faellt nicht'));
    await weitergegangen(p);
  }
  for (let n = 0; n < 20; n++) {
    if (abbruch()) break;
    const r = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const el = s && s.querySelector('.rechnung');
      if (!el) return null;
      const m = el.textContent.match(/(\d+)\s*([+−×:])\s*(\d+)/);
      if (!m) return null;
      const a = +m[1], b = +m[3];
      return { art: m[2], soll: m[2] === '×' ? a * b : a / b };
    });
    if (!r) break;                       // die Sitzung ist zu Ende
    arten.push(r.art);
    await p.fill('.schirm.da #rein', String(r.soll));
    await p.click('.schirm.da #pruef');
    await bewertet(p);
    await weitergegangen(p);
  }
  const geteilt = arten.filter(a => a === ':').length;
  console.log(`  Regler bei 50 %:            ${arten.length} Aufgaben, ${geteilt} geteilt`
    + `  (${arten.join(' ')})`);
  if (arten.length !== 8)
    merke('regler', new Error(`Leas Sitzung hatte ${arten.length} Aufgaben statt acht`));
  if (geteilt !== 4)
    merke('regler', new Error(`Der Regler stand auf 50 Prozent Division, gespielt wurden `
      + `${geteilt} von ${arten.length} — er kommt nicht bis in die Sitzung`));

  /* Und der Schalter (A2): „Ton aus" heisst nicht „nur die Stimme aus".
   *
   * Regel 13 — wer eine Wirkung misst, schaltet sie zuerst ab. Ohne diesen
   * zweiten Durchgang haette die Gegenprobe „der Ton spielt auch bei
   * abgeschaltetem Ton" gar keinen Gegenstand: bei eingeschaltetem Ton
   * aendert das Entfernen der Sperre nichts, was zu sehen waere.
   */
  {
    await p.evaluate(() => new Promise((ja, nein) => {
      const auf = indexedDB.open('lernkiste', 1);
      auf.onsuccess = () => {
        const t = auf.result.transaction(['einstellungen'], 'readwrite');
        t.objectStore('einstellungen').put({ reihenGeteilt: 0.5, ton: false }, 'alles');
        t.oncomplete = ja; t.onerror = () => nein(t.error);
      };
      auf.onerror = () => nein(auf.error);
    }));
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-profil="lea"]');
    await p.click('[data-profil="lea"]');
    await zurEbenenwahl(p, 'rechnen:reihen');
    await p.click('[data-ebene="rechnen:reihen"]');
  await durchVorlaufWenn(p);
    await p.waitForSelector('.schirm.da .rechnung', { timeout: 15000 });
    await p.evaluate(() => { window.__toene = []; });
    const falschZahl = await p.evaluate(() => {
      const m = document.querySelector('.schirm.da .rechnung').textContent
        .match(/(\d+)\s*([+−×:])\s*(\d+)/);
      const a = +m[1], b = +m[3];
      const soll = m[2] === '×' ? a * b : a / b;
      return soll + 1 > 100 ? soll - 1 : soll + 1;
    });
    await p.fill('.schirm.da #rein', String(falschZahl));
    await p.click('.schirm.da #pruef');
    await p.waitForTimeout(300);
    const trotzdem = await p.evaluate(() => window.__toene.length);
    console.log(`  Mit „Ton aus":              ${trotzdem} Schwingungen (erwartet 0)`);
    if (trotzdem > 0) merke('regler',
      new Error(`„Ton aus" ist gesetzt, und es kamen trotzdem ${trotzdem} Schwingungen`));
  }
  await p.close();
} catch (e) { merke('regler', e); }

/* --- Durchgang 4: Ebene 4 - vier Staedte, eine richtig ---------------- */
//
// Die Zusage lautet: IMMER genau vier Staedte, genau eine davon richtig,
// genau eine aus demselben Bundesland (die Falle), und die richtige klebt
// nicht auf einem Platz. Jede dieser vier Zusagen wird hier einzeln
// nachgezaehlt - und zwar fuer BEIDE Profile, weil diese Ebene als einzige
// auch bei Lea eine Auswahl ist.
const plaetze = new Set();
let ebene4 = 0;
if (laeuft('ebene4')) for (const wer of ['fiona', 'lea']) {
  if (abbruch()) break;
  try {
    const eigen = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
    const p = await neueSeite({ width: 844, height: 390 }, eigen);
    await p.click(`[data-profil="${wer}"]`);
    await zurEbenenwahl(p, 'hauptstaedte');
    await p.click('[data-ebene="hauptstaedte"]');
  await durchVorlaufWenn(p);
    // Die Einweisung zu den Stadtstaaten steht beim ersten Mal davor.
    await p.waitForSelector('.schirm.da #weiter, .schirm.da .karte svg path.ziel', { timeout: 6000 });
    const weiter = await p.$('.schirm.da #weiter');
    if (weiter) await weiter.click();
    await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 6000 });
    for (let n = 0; n < 5; n++) {
      if (!(await p.$('.schirm.da .karte svg path.ziel'))) break;
      const i = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        const D = JSON.parse(document.getElementById('daten').textContent);
        const bl = D.deutschland.find(x => x.id === s.querySelector('path.ziel').dataset.id);
        const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent.trim());
        return { land: bl.name, hs: bl.hauptstadt, ausLand: bl.ablenker, namen,
                 tippfeld: !!s.querySelector('input.eingabe') };
      });
      ebene4++;
      if (i.tippfeld) merke('ebene4', new Error(`${wer}/${i.land}: Tippfeld statt Auswahl`));
      if (i.namen.length !== 4)
        merke('ebene4', new Error(`${wer}/${i.land}: ${i.namen.length} Städte statt 4`));
      if (i.namen.filter(x => x === i.hs).length !== 1)
        merke('ebene4', new Error(`${wer}/${i.land}: die richtige Stadt steht nicht genau einmal da`));
      const gleiche = i.namen.filter(x => i.ausLand.includes(x)).length;
      if (gleiche !== 1)
        merke('ebene4', new Error(`${wer}/${i.land}: ${gleiche} Städte aus demselben Land, erwartet 1`));
      if (new Set(i.namen).size !== 4)
        merke('ebene4', new Error(`${wer}/${i.land}: doppelte Stadt unter ${i.namen.join(', ')}`));
      plaetze.add(i.namen.indexOf(i.hs));
      const ok = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da'); const z = s.querySelector('path.ziel');
        const D = JSON.parse(document.getElementById('daten').textContent);
        const bl = D.deutschland.find(x => x.id === z.dataset.id);
        const svg = s.querySelector('.karte svg'); const pt = svg.createSVGPoint();
        pt.x = bl.anker[0]; pt.y = bl.anker[1]; const q = pt.matrixTransform(svg.getScreenCTM());
        const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent.trim());
        return { x: q.x, y: q.y, idx: namen.indexOf(bl.hauptstadt) };
      });
      if (ok.idx < 0) break;
      const et = (await p.$$('.schirm.da .etikett'))[ok.idx]; const bb = await et.boundingBox();
      await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down();
      await p.mouse.move(ok.x, ok.y, { steps: 8 }); await p.mouse.up();
      await bewertet(p); await weitergegangen(p);
    }
    await eigen.close();
  } catch (e) { merke('ebene4', e); }
}
// Eine Mischung, die die richtige Antwort immer auf denselben Platz legt,
// besteht jede Einzelpruefung oben - und ist trotzdem kaputt.
if (laeuft('ebene4')) {
  if (ebene4 && plaetze.size < 3)
    merke('ebene4', new Error(`die richtige Stadt lag in ${ebene4} Aufgaben nur auf `
      + `${plaetze.size} verschiedenen Plätzen (${[...plaetze].map(x=>x+1).sort().join(', ')})`));
  console.log(`  Ebene 4:                    ${ebene4} Aufgaben, immer 4 Städte, `
    + `richtige auf Platz ${[...plaetze].map(x=>x+1).sort().join('/')}`);
}

/* --- Durchgang 5: jede Ebene, beide Profile, eine richtige Antwort ----- */
//
// Der einfachste Test, den es gibt - und der, der gefehlt hat. Ein Kind
// gibt eine richtige Antwort; wird sie als richtig gewertet?
//
// Zwei Fehler waren hier: ein getippter Alias ("Australien" fuer den
// Kontinent "Australien und Ozeanien") wurde abgelehnt, weil die
// Rechtschreibpruefung nur den kanonischen Namen bekam. Und ein gezogenes
// Etikett landete auf dem pulsierenden Ring um das Ziel statt auf dem Ziel -
// dann passierte gar nichts.
//
// Gezogen wird bewusst NICHT auf den Anker aus den Daten, sondern auf einen
// Punkt, den ein Kind sieht: die Probe sucht selbst eine Stelle, an der das
// Gebiet obenauf liegt.
// Welche Antwortwege wirklich gegangen wurden. Eine Zeile am Ende, die
// zeigt, ob beide Kinder auf IHRE Art gespielt haben - und nicht beide auf
// dieselbe.
const wege = new Set();
// Wieviele Aufgaben hat das Kind ANGESAGT bekommen?
const gehoert = {};
/* Und wieviele Ebenen wurden ihm ueberhaupt VORGELEGT?
 *
 * Frueher stand hier die Gesamtzahl der Ebenen als Sollwert. Das war
 * dieselbe Zahl, solange immer alle gespielt wurden — mit `--kurz` sind
 * es weniger, und der Vergleich waere gegen eine Zahl gelaufen, die es
 * in diesem Lauf gar nicht gab. Verglichen wird jetzt Gleiches mit
 * Gleichem: was angesagt wurde, gegen das, was vorgelegt wurde. */
const gespielt = {};
const EBENEN_ALLE = ['kontinente', 'laender:europa', 'laender:afrika',
  'laender:asien', 'laender:nordamerika', 'laender:suedamerika',
  'bundeslaender', 'hauptstaedte'];
// Ebenen, die es nur für EIN Kind gibt. Fiona rechnet, Lea (noch) nicht -
// stünde die Rechenkachel bei beiden, wäre eine davon die falsche.
/* Seit R4 spielt auch das Profil „Eltern" mit. Es kommt in denselben
 * Durchgang - der
 * prueft, dass jede Ebene fuer jedes Profil wirklich spielbar ist, und
 * ein drittes Profil, das dort fehlt, waere ungeprueft. */

const EBENEN_EIGEN = { fiona: ['rechnen:plusminus'], lea: ['rechnen:reihen'],
                       eltern: ['rechnen:gross'] };
if (laeuft('durchgang')) for (const wer of ['fiona', 'lea', 'eltern']) {
  if (abbruch()) break;
  const eigen = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
  try {
    const p = await neueSeite({ width: 1180, height: 820 }, eigen);
    await p.click(`[data-profil="${wer}"]`);
    /* Seit D4 steht nicht mehr alles auf einem Bildschirm.
     *
     * Gesammelt wird deshalb je Welt - und dabei gleich geprueft, ob keine
     * Kachel in der falschen Welt liegt. Die Zuordnung wird in der App aus
     * `art` abgeleitet; eine Ableitung, die danebengeht, macht keinen
     * Laerm: die Kachel steht dann einfach woanders, und das sieht auf
     * einem Bildschirmfoto aus wie ein Gestaltungseinfall.
     */
    await p.waitForSelector('.schirm.da [data-welt]');
    const welten = await p.$$eval('.schirm.da [data-welt]', es => es.map(e => e.dataset.welt));
    for (const w of ['erdkunde', 'rechnen'])
      if (!welten.includes(w))
        merke('durchgang', new Error(`${wer}: die Welt „${w}" fehlt auf der Weltenwahl`));
    const da = [];
    for (const w of welten) {
      await p.click(`.schirm.da [data-welt="${w}"]`);
      await p.waitForSelector('.schirm.da [data-ebene]');
      const hier = await p.$$eval('.schirm.da [data-ebene]', es => es.map(e => e.dataset.ebene));
      const fremd = hier.filter(e => WELT_VON(e) !== w);
      if (fremd.length) merke('durchgang',
        new Error(`${wer}: „${fremd.join(', ')}" steht in der Welt „${w}"`));
      da.push(...hier);
      await p.click('.schirm.da #zur');
      await p.waitForSelector('.schirm.da [data-welt]');
    }
    for (const e of [...EBENEN_ALLE, ...EBENEN_EIGEN[wer]])
      if (!da.includes(e)) merke('durchgang', new Error(`${wer}: Ebene „${e}" fehlt in der Auswahl`));
    // Und umgekehrt: keine fremde Ebene. Sonst stünde Fionas Rechnen auch
    // bei Lea, und der Umbau „je Kind" wäre nur behauptet.
    for (const [anderes, eigene] of Object.entries(EBENEN_EIGEN))
      if (anderes !== wer) for (const e of eigene)
        if (da.includes(e)) merke('durchgang',
          new Error(`${wer}: Ebene „${e}" gehört ${anderes}, steht aber in ${wer}s Auswahl`));
    /* Bei `--kurz` eine Auswahl statt aller: die erste Karte, die
     * Auswahl-Ebene, das Rechnen — und EINE Länderebene. Damit ist jede
     * ART von Bildschirm dabei, beide Welten und beide Antwortweisen —
     * nur eben nicht jede einzelne Länderebene.
     *
     * Die Länderebene kam mit R4 dazu, und zwar nicht aus Gründlichkeit:
     * seit die Tiefe je Profil verschieden ist (3 · 5 · 12), ist sie eine
     * eigene Art von Bildschirm. Ohne sie lief die Gegenprobe „Fiona
     * bekommt die Länder der Eltern zu sehen" ins Leere - der Eingriff war drin,
     * das Tor blieb grün, weil es die Ebene gar nicht aufschlug. */
    const zuSpielen = KURZ
      ? da.filter(e => e === 'kontinente' || e === 'hauptstaedte'
                    || e === 'laender:europa' || e.startsWith('rechnen'))
      : da;
    gespielt[wer] = zuSpielen.length;
    for (const ebene of zuSpielen) {
      // Der teuerste Posten ueberhaupt: achtzehn Ebenen mal zwei Profile.
      // Steht der Fehler schon fest, beweisen die restlichen nichts mehr.
      if (abbruch()) break;
      // Den Mitschnitt leeren, BEVOR die Ebene aufgeht: sonst zaehlt das Lob
      // der vorigen Aufgabe mit, und das hoeren beide Kinder. Der erste
      // Anlauf meldete deshalb „Lea bekam 8 Aufgaben vorgelesen" - gemessen
      // war irgendeine Sprachausgabe, nicht die ANSAGE.
      await p.evaluate(() => { window.__gesagt = []; });
      // Auf der Ebenenwahl der richtigen Welt landen - egal, wo der vorige
      // Durchgang geendet hat. Und nur von einer EBENENWAHL aus
      // zurueckgehen: auf der Weltenwahl fuehrt `#zur` zur Profilwahl, der
      // erste Anlauf landete genau dort und wartete dreissig Sekunden auf
      // eine Weltenkarte.
      if (!(await p.$(`.schirm.da [data-ebene="${ebene}"]`))) {
        if (!(await p.$('.schirm.da [data-welt]')) && await p.$('.schirm.da #zur'))
          await p.click('.schirm.da #zur');
        await zurEbenenwahl(p, ebene);
      }
      await p.$eval(`.schirm.da [data-ebene="${ebene}"]`, x => x.click());
      /* Wieviele Laender sieht DIESES Kind wirklich?
       *
       * Der Vorlauf zeigt genau den Vorrat der Ebene - eine Karte je
       * Gegenstand. Gezaehlt wird also das, was das Profil zusagt, an dem
       * Ort, an dem es sichtbar wird. */
      if (ebene.startsWith('laender:') && TIEFE[wer]) {
        const da2 = await p.waitForSelector('.schirm.da #los', { timeout: 20000 })
          .then(() => true).catch(() => false);
        if (da2) {
          const n = await p.$$eval('.schirm.da .aufkleber', es => es.length);
          if (n !== TIEFE[wer]) merke('durchgang', new Error(
            `${wer}/${ebene}: ${n} Länder im Vorlauf, das Profil sagt ${TIEFE[wer]}`));
        }
      }
      await durchVorlaufWenn(p);
      await p.waitForTimeout(400);
      const w = await p.$('.schirm.da #weiter');
      if (w) await p.$eval('.schirm.da #weiter', x => x.click());
      /* Rechnen: die Aufgabe OHNE Karte.
       *
       * Hier wartet nichts auf `path.ziel` - es gibt keinen. Gespielt wird
       * derselbe Weg, den das Kind geht: die Rechnung lesen, ausrechnen,
       * die Zahl antippen. Kommt die Wertung durch, gilt für diesen
       * Bildschirm dasselbe wie für die Karte: Band, Sterne, Aufkleber.
       */
      if (await p.$('.schirm.da .rechnung')) {
        await p.waitForTimeout(900);
        const gesagtR = await p.evaluate(() => (window.__gesagt || []).join(' | '));
        if (/Was ist/.test(gesagtR)) gehoert[wer] = (gehoert[wer] || 0) + 1;
        const r = await p.evaluate(() => {
          const s = document.querySelector('.schirm.da');
          const t = s.querySelector('.rechnung').textContent;
          // Vier Zeichen, weil es vier Rechenarten gibt. Stünde hier
          // weiter nur [+−], liefe Leas Ebene durch, ohne dass irgendetwas
          // gerechnet würde - und der Rauchtest wäre grün.
          const m = t.match(/(\d+)\s*([+−×:])\s*(\d+)/);
          if (!m) return null;
          const a = +m[1], b = +m[3];
          const soll = m[2] === '+' ? a + b : m[2] === '−' ? a - b
                     : m[2] === '×' ? a * b : a / b;
          // Lea SCHREIBT das Ergebnis. Die vier Zahlen stehen zwar im
          // Papier, sind aber versteckt - wer sie hier anklickt, klickt
          // ins Nichts.
          const tippt = !!s.querySelector('#tippfeld:not([hidden])');
          const zahlen = [...s.querySelectorAll('#auswahl .zahl')].map(z => z.textContent);
          return { soll, tippt, zahlen, i: zahlen.map(Number).indexOf(soll) };
        });
        if (!r || (!r.tippt && r.i < 0)) {
          merke('durchgang', new Error(`${wer}/${ebene}: die richtige Antwort `
            + `${r ? r.soll : '?'} steht nicht unter ${r ? r.zahlen.join(', ') : '—'}`));
          continue;
        }
        if (r.tippt) {
          await p.fill('.schirm.da #rein', String(r.soll));
          await p.click('.schirm.da #pruef');
        } else {
          await p.$$eval('.schirm.da #auswahl .zahl', (els, i) => els[i].click(), r.i);
        }
        wege.add(`${wer}: rechnen ${r.tippt ? 'geschrieben' : 'angetippt'}`);
        await bewertet(p);
        const rr = await p.evaluate(() => {
          const f = document.querySelector('.schirm.da .frage');
          return (f?.querySelector('.richtigText') ? '✓ ' : '') + (f?.textContent.trim() || '');
        });
        if (!/^✓ /.test(rr || ''))
          merke('durchgang', new Error(`${wer}/${ebene}: ${r.soll} angetippt → „${rr}"`));
        durchgespielt++;
        await weitergegangen(p);
        await raus(p);
        continue;
      }
      await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 8000 });
      await p.waitForTimeout(900);   // die Ansage kommt 500 ms nach dem Wechsel
      // Gezaehlt wird die FRAGE, nicht irgendein Ton.
      const gesagt = await p.evaluate(() => (window.__gesagt || []).join(' | '));
      if (/Wie heißt/.test(gesagt)) gehoert[wer] = (gehoert[wer] || 0) + 1;
      const z = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        const ziel = s.querySelector('path.ziel');
        const frage = s.querySelector('.frage').textContent;
        const D = JSON.parse(document.getElementById('daten').textContent);
        const alle = [...D.kontinente, ...Object.values(D.laender).flat(), ...D.deutschland];
        const g = alle.find(x => (x.id || x.a3) === ziel.dataset.id) || {};
        const istHaupt = /Hauptstadt/.test(frage);
        // Eine Stelle suchen, an der das Ziel wirklich obenauf liegt.
        const bb = ziel.getBoundingClientRect();
        let punkt = { x: bb.left + bb.width / 2, y: bb.top + bb.height / 2 };
        const kreis = s.querySelector(`#treffer circle[data-id="${ziel.dataset.id}"]`);
        if (kreis) { const k = kreis.getBoundingClientRect();
          punkt = { x: k.left + k.width / 2, y: k.top + k.height / 2 }; }
        else for (let n = 0; n <= 8 && !punkt.gefunden; n++) for (let m = 0; m <= 8; m++) {
          const x = bb.left + bb.width * (n + .5) / 9, y = bb.top + bb.height * (m + .5) / 9;
          if (document.elementFromPoint(x, y) === ziel) { punkt = { x, y, gefunden: true }; break; }
        }
        return { name: istHaupt ? g.hauptstadt : g.name,
                 alias: (!istHaupt && g.aliasse && g.aliasse.length) ? g.aliasse[0] : null,
                 ...punkt, tippfeld: !!s.querySelector('input.eingabe'),
                 weise: s.querySelector('#weise')?.dataset.weise || null,
                 etiketten: [...s.querySelectorAll('.etikett')].map(x => x.textContent.trim()) };
      });
      /* Wer nie eine Auswahl bekommt, muss hier ein Tippfeld sehen.
       *
       * Das ist die Stelle, an der ein ausgefallenes Verbot WIRKLICH
       * sichtbar wird: statt des Feldes stuenden vier Etiketten da, und
       * ein Erwachsener raet dann, statt zu schreiben. */
      if (OHNE_AUSWAHL.has(wer) && !z.tippfeld)
        merke('durchgang', new Error(`${wer}/${ebene}: eine Auswahl statt eines Tippfelds `
          + `(${z.etiketten.join(', ')}) — das Profil sagt „nie eine Auswahl"`));
      // Beim Tippen den ALIAS nehmen, wenn es einen gibt - dort war der Fehler.
      const eingabe = z.tippfeld && z.alias ? z.alias : z.name;
      if (z.tippfeld) {
        await p.fill('.schirm.da .eingabe', eingabe);
        await p.$eval('.schirm.da .wahlliste .knopf', x => x.click());
      } else {
        const i = z.etiketten.indexOf(z.name);
        if (i < 0) { merke('durchgang', new Error(`${wer}/${ebene}: „${z.name}" fehlt unter `
          + `${z.etiketten.join(', ')}`)); continue; }
        const et = (await p.$$('.schirm.da .etikett'))[i];
        // Gespielt wird so, wie das Kind es spielt. Lea tippt an, Fiona
        // zieht - das steht am Umschalter, und der Test liest es dort ab
        // statt es zu wissen. Sonst prueft er einen Weg, den niemand geht.
        if (z.weise === 'antippen') {
          await et.click();
          wege.add(`${wer}: antippen`);
        } else {
          const bb = await et.boundingBox();
          await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
          await p.mouse.down();
          await p.mouse.move(z.x, z.y, { steps: 8 });
          await p.mouse.up();
          wege.add(`${wer}: ziehen`);
        }
      }
      await bewertet(p);
      const r = await p.evaluate(() => {
        const f = document.querySelector('.schirm.da .frage');
        return (f?.querySelector('.richtigText') ? '✓ ' : '') + (f?.textContent.trim() || '');
      });
      if (!/^✓ /.test(r || ''))
        merke('durchgang', new Error(`${wer}/${ebene}: „${eingabe}" richtig `
          + `${z.tippfeld ? 'getippt' : z.weise === 'antippen' ? 'angetippt' : 'gezogen'} → „${r}"`));
      durchgespielt++;
      await weitergegangen(p);
      await raus(p);
    }
    /* --- Steht die Aufgabe im Protokoll mit ihrem Namen? (R7) --------
     *
     * `NAMEN` war aus ZWEI Vorraeten gebaut, seit R4 gibt es drei: fuer
     * die 158 Aufgaben der Eltern standen im Elternbereich als `g12*13`
     * statt „12 × 13".
     * Nichts wurde rot davon - das Protokoll ist das eine, was Eltern
     * wirklich lesen, und es log sie an.
     *
     * Geprueft wird am sichtbaren Ende, im Durchgang der Eltern: die
     * Kennungen (`g12*13`, `q12`, `t144:12`) haben kein Leerzeichen, die
     * Fragen (`12 × 13`, `12²`, `144 : 12`) tragen ein Rechenzeichen. */
    if (wer === 'eltern' && durchgespielt) {
      if (!(await p.$('.schirm.da [data-welt]')) && await p.$('.schirm.da #zur'))
        await p.click('.schirm.da #zur');
      await p.waitForSelector('.schirm.da #eltern', { timeout: 10000 });
      await p.click('.schirm.da #eltern');
      await p.waitForSelector('.schirm.da .ziffern');
      for (let i = 0; i < 4; i++) await p.click('.schirm.da [data-z="0"]');
      await p.waitForSelector('.schirm.da .kacheln', { timeout: 10000 });
      const meine = await p.$$eval('.schirm.da #zuletzt tbody tr',
        rs => rs.map(r => [...r.cells].map(c => c.textContent.trim()))
                .filter(z => z[1] === 'Eltern').map(z => z[2]));
      /* Nur die Rechenaufgaben, und die erkennt man an der Ziffer: kein
       * Land und kein Bundesland traegt eine. Der erste Anlauf pruefte
       * ALLE zehn Zeilen und meldete „Mecklenburg-Vorpommern" als
       * Kennung - er haette nie gruen werden koennen.
       *
       * Und wenn keine dabei ist, hat der Test nichts geprueft. Das ist
       * hier kein Sonderfall, sondern der Normalfall, gegen den er da
       * ist (Regel 5): eine leere Liste ist rot, nicht gruen. */
      const rechen = meine.filter(t => /\d/.test(t));
      if (!rechen.length)
        merke('durchgang', new Error('unter „Zuletzt geübt" steht keine Rechenaufgabe von '
          + `Eltern, obwohl gerade eine gespielt wurde (da steht: ${meine.slice(0, 3).join(' · ') || 'nichts'})`));
      // Kennungen (`g12*13`, `q12`, `t144:12`) haben kein Leerzeichen,
      // Fragen („12 × 13", „144 : 12", „12²") tragen eines oder ein Hoch-Zwei.
      const roh = rechen.filter(t => !/\s|²/.test(t));
      if (roh.length) merke('durchgang', new Error(
        `im Elternbereich stehen Kennungen statt Aufgaben: „${roh.slice(0, 3).join('", „')}" `
        + '— das Protokoll kennt den Vorrat der Eltern nicht'));
      console.log(`  Aufgaben der Eltern:        ${rechen.slice(0, 3).join(' · ') || 'KEINE'}`);
    }
    await p.close();
  } catch (e) { merke('durchgang', e); }
  await eigen.close();
}
/* Ab hier wird geurteilt - und ein Urteil über einen Abschnitt, der nicht
 * gelaufen ist, wäre kein Urteil, sondern ein Fehlalarm. Genau daran ist
 * die erste Fassung dieser Zerlegung gescheitert: „Der Übergang wurde
 * nicht gemessen" bei einem Lauf, der ihn gar nicht messen sollte. */
const EBENEN_JE = (wer) => gespielt[wer] ?? (EBENEN_ALLE.length + EBENEN_EIGEN[wer].length);
if (laeuft('durchgang')) {
console.log(`  Durchgespielt:              ${durchgespielt} Ebenen × Profile, jede richtige Antwort gewertet`);
console.log(`  Antwortwege:                ${[...wege].sort().join(' · ') || 'KEINE'}`);
console.log(`  Aufgaben vorgelesen:        Fiona ${gehoert.fiona||0} von ${EBENEN_JE('fiona')}, `
  + `Lea ${gehoert.lea||0} von ${EBENEN_JE('lea')}`);
// Fiona liest noch nicht: JEDE Aufgabe muss angesagt werden. Lea liest -
// bei ihr waere dieselbe Ansage nur Laerm, und das steht in ihrem Profil.
// Die Acht war hier festgenagelt und wurde mit der neunten Ebene falsch.
// Gezaehlt wird jetzt, was Fiona wirklich hat - Erdkunde plus ihr Rechnen.
if ((gehoert.fiona || 0) < EBENEN_JE('fiona'))
  fehler.push(`Fiona bekam nur ${gehoert.fiona||0} von ${EBENEN_JE('fiona')} Aufgaben `
    + 'vorgelesen — sie kann noch nicht lesen, ohne Ansage ist die Ebene für sie '
    + 'nicht spielbar');
if ((gehoert.lea || 0) > 0)
  fehler.push(`Lea bekam ${gehoert.lea} Aufgaben vorgelesen, obwohl ihr Profil `
    + '`vorlesen: false` sagt — die Ansage hängt nicht am Kind');
// Voreingestellt zieht Fiona und tippt Lea an. Wird nur EIN Weg gegangen,
// ist der Umschalter entweder weg oder wirkungslos - und die Haelfte der
// Bedienung ungeprueft.
for (const soll of ['fiona: ziehen', 'lea: antippen', 'fiona: rechnen angetippt',
                    'lea: rechnen geschrieben', 'eltern: rechnen geschrieben'])
  if (!wege.has(soll))
    fehler.push(`Kein einziger Zug über „${soll}" — der Umschalter greift nicht `
      + `(gegangen wurde: ${[...wege].join(', ') || 'nichts'})`);
/* „Eltern bekommt nie eine Auswahl" wird oben am Kartenbildschirm
 * geprueft, nicht hier: siehe OHNE_AUSWAHL. Hier stand dafuer eine
 * Verbotsliste ueber `wege`, die nicht anschlagen KONNTE. */
}

await ctx.close(); await b.close(); server.close();

if (laeuft('spielen')) {
console.log(`  Namen auf der Karte:        ${[...fahnenArten].join(' und ') || 'KEINE'}`);
// Der schwaechere der beiden Bildschirme, im schlimmsten Bild des Wechsels.
// 0,20 laesst den Rand der Ueberblendung zu und faengt das Doppelbild:
// blenden beide gleichzeitig, treffen sie sich bei etwa 0,5.
const UEBERBLENDUNG_MAX = 0.20;
console.log(`  Übergang zur nächsten:      zweiter Bildschirm höchstens `
  + `${ueberblendung === null ? '—' : ueberblendung.toFixed(2)} sichtbar `
  + `(erlaubt ${UEBERBLENDUNG_MAX})`);
if (ueberblendung === null)
  fehler.push('Der Übergang wurde nicht gemessen — die Prüfung lief nicht');
else if (ueberblendung > UEBERBLENDUNG_MAX)
  fehler.push(`Beim Wechsel sind beide Bildschirme gleichzeitig zu sehen `
    + `(der schwächere bei ${ueberblendung.toFixed(2)}) — ein Doppelbild: `
    + 'die alte Antwort steht über der neuen Frage');
// Faellt die Entscheidung IMMER gleich aus, ist sie keine Messung, sondern
// eine feste Einstellung - und der halbe Sinn der Fahne waere weg.
if (fahnenArten.size < 2)
  fehler.push(`fahne: in zwölf Aufgaben nur die Sorte „${[...fahnenArten][0] || '—'}" — `
    + `die Entscheidung „passt hinein" wird nicht wirklich gemessen`);
console.log(`  Gelöst im ersten Durchgang: ${geloest.join(', ')}`);
const jeRunde = [...new Set(sternVerlauf.map(x => x.runde))]
  .map(r => sternVerlauf.filter(x => x.runde === r).map(x => x.n));
console.log(`  Sterne im Kopf:             ${jeRunde.map(r => r.join('→')).join('   |   ')}`
  + `   Endbildschirm: ${endSterne === null ? '—' : endSterne}`);
/* EINE Formel, zwei Anzeigen - und der Kopf zieht sofort nach.
 *
 * Geprueft wird das Verhaeltnis, nicht eine feste Zahl: die Sternzahl im
 * Kopf darf nie SINKEN, und der Endbildschirm darf nie mehr zeigen, als
 * der Kopf zuletzt hatte. Der Fehler, den das faengt: zwei verschiedene
 * Formeln, gemessen als 1 Stern im Kopf gegen 3 am Ende. */
// INNERHALB einer Runde. Zwischen zwei Sitzungen faengt die Zaehlung zu
// Recht wieder bei null an - der erste Anlauf dieser Pruefung kannte die
// Rundengrenze nicht und meldete genau das als Fehler.
for (const r of jeRunde)
  for (let i = 1; i < r.length; i++)
    if (r[i] < r[i - 1])
      fehler.push(`Die Sterne im Kopf sinken innerhalb einer Runde (${r.join(' → ')}) — `
        + 'ein Fortschritt, der zurückgeht, ist keiner');
const hoechste = jeRunde.length ? Math.max(...jeRunde.flat()) : 0;
if (endSterne !== null && jeRunde.length && endSterne > hoechste)
  fehler.push(`Der Endbildschirm zeigt ${endSterne} Sterne, im Kopf standen höchstens `
    + `${hoechste} — zwei verschiedene Formeln für dieselbe Sache`);
console.log(`  Fortschrittsband:           ${bandVerlauf[bandVerlauf.length-1] || 'KEINES'}`);
if (!bandVerlauf.some(b => /glatt|geschafft|gezeigt/.test(b)))
  fehler.push('Das Fortschrittsband färbt sich nie — es zeigt nicht, wie die Runde lief');
}
if (fehler.length) { console.log(`\n  ${fehler.length} FEHLER:`); fehler.forEach(f => console.log('    ✗ ' + f)); process.exit(1); }
console.log('\n  Rauchtest grün: gespielt, abgelegt, Neustart überstanden, Buch gefüllt, Eltern gelesen, getippt.');
