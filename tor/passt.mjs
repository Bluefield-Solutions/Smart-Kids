// Tor `passt`.
//
// Prueft auf SECHS Geraetegroessen, dass kein bedienbares Element ueber den
// Rand seines Behaelters oder des Fensters laeuft.
//
// Warum es das braucht: die App war auf dem ZIELGERAET kaputt, und drei
// andere Tore meldeten gruen. Auf dem iPhone quer lag die vierte Antwort
// 22 Bildpunkte unter dem sichtbaren Rand der Liste, und die Ebene
// "Landeshauptstaedte" war in der Ebenenwahl gar nicht erreichbar. Auf dem
// iPad war alles in Ordnung - deshalb ist es nie aufgefallen.
//
// Der Rauchtest hat es nicht gesehen, weil er die Etiketten ueber das DOM
// sucht und nicht ueber das, was zu sehen ist: ein Element in einem
// scrollenden Behaelter EXISTIERT, es ist nur nicht da. Und das Bildtor
// fotografiert bei 1240x1000, wo alles passt.
//
// `overflow:auto` ist dabei keine Entschuldigung. Ein Kind scrollt nicht in
// einer Liste, von der es nicht weiss, dass sie weitergeht - fuer das Kind
// hat die Aufgabe drei Antworten.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { starte, zurEbenenwahl, durchVorlauf, serviere } from './chromium.mjs';

const DIST = path.join(process.cwd(), 'dist');
const fehler = [];

/** Die Groessen, auf denen geurteilt wird. Nicht "ein paar Breiten". */
const GERAETE = [
  { n:'iPhone quer',      w:844,  h:390,  touch:true  },   // das Zielgeraet
  { n:'iPhone SE quer',   w:667,  h:375,  touch:true  },   // das kleinste
  { n:'iPhone hoch',      w:390,  h:844,  touch:true  },
  { n:'iPad quer',        w:1180, h:820,  touch:true  },
  { n:'iPad hoch',        w:820,  h:1180, touch:true  },
  { n:'Fenster schmal',   w:700,  h:850,  touch:false },   // Schreibtisch
  // Das Zielgeraet MIT dem, was das Telefon selbst belegt: Uhr und Akku
  // oben, der Streifen unten, die abgerundeten Ecken seitlich. Die Zahlen
  // sind die eines iPhone 14 Pro im Querformat.
  { n:'iPhone quer, Leiste', w:844, h:390, touch:true,
    sicher:{ oben:21, rechts:59, unten:21, links:59 } },
];

/** Kleinste Kante einer Trefferflaeche, Apple HIG. */
const MIN_PT = 44;

/**
 * Findet Elemente, die abgeschnitten sind.
 *
 * Geprueft wird gegen JEDEN Vorfahren, der beschneidet - nicht nur gegen das
 * Fenster. Der erste Anlauf pruefte nur gegen das Fenster und meldete gruen,
 * waehrend "Rheinland-Pfalz" unter dem Rand seiner eigenen Liste lag.
 */
const SUCHE = () => {
  const raus = [], klein = [], zu = [];
  // `.hinweis` ist nicht bedienbar, aber er ist die einzige Auskunft, die
  // das Kind bei einem Fehlversuch bekommt - und er WAECHST die Liste. Der
  // Satz "Fast! Lass es mitten auf dem Land los." stand auf dem iPhone quer
  // zweizeilig am unteren Rand. Ein Hinweis, den man nicht lesen kann, ist
  // schlimmer als keiner: das Kind sieht, dass etwas passiert ist, und
  // erfaehrt trotzdem nicht was.
  //
  // `.aufkleber` stand hier bis R2 NICHT - und damit war das Forscherbuch
  // fuer dieses Tor unsichtbar. Es ist der Bildschirm mit den meisten
  // Kaesten, sie sind anklickbar, und die untere Reihe lief auf dem
  // Zielgeraet ueber den Rand. Das Tor meldete gruen, weil es dort nichts
  // zu sehen HATTE.
  const bedienbar = '.schirm.da .kachel, .schirm.da .etikett, .schirm.da .knopf, '
    + '.schirm.da .mikro, .schirm.da .zi, .schirm.da .eingabe, .schirm.da .hinweis, '
    + '.schirm.da .aufkleber';
  for (const el of document.querySelectorAll(bedienbar)) {
    const eb = el.getBoundingClientRect();
    if (eb.width === 0 && eb.height === 0) continue;         // nicht sichtbar
    const text = el.textContent.trim().slice(0, 26).replace(/\s+/g, ' ') || el.className;

    let p = el.parentElement, ab = null;
    while (p && p !== document.body && !ab) {
      const cs = getComputedStyle(p);
      if (/hidden|clip|auto|scroll/.test(cs.overflowY + cs.overflowX)) {
        const pb = p.getBoundingClientRect();
        const fehlt = Math.max(eb.bottom - pb.bottom, pb.top - eb.top,
                               eb.right - pb.right, pb.left - eb.left);
        if (fehlt > 1) ab = { wo: '.' + (p.className.split(' ')[0] || p.tagName.toLowerCase()), fehlt };
      }
      p = p.parentElement;
    }
    if (!ab) {
      const fehlt = Math.max(eb.bottom - innerHeight, eb.right - innerWidth, -eb.top, -eb.left);
      if (fehlt > 1) ab = { wo: 'Fenster', fehlt };
    }
    if (ab) { raus.push(`„${text}" — ${ab.fehlt.toFixed(0)} px über den Rand von ${ab.wo}`); continue; }

    // Passt der TEXT in seinen Knopf?
    //
    // Der Kasten kann sitzen und der Inhalt trotzdem darueber hinausragen:
    // ein Flex-Kind ist von sich aus mindestens so breit wie sein laengstes
    // Wort. "Landeshauptstaedte" stand so quer ueber den Rand der eigenen
    // Kachel - und dieses Tor meldete gruen, weil es Kaesten mass und nicht
    // Inhalte. Gefunden hat es das Auge, nicht die Pruefung.
    const zuBreit = el.scrollWidth - el.clientWidth;
    const zuHoch  = el.scrollHeight - el.clientHeight;
    if (zuBreit > 1 || zuHoch > 1) {
      raus.push(`„${text}" — Text steht ${Math.max(zuBreit, zuHoch).toFixed(0)} px `
        + `über den Rand des eigenen Knopfes`);
      continue;
    }
    // Der Hinweis ist Text, kein Ziel fuer den Finger - fuer ihn gilt die
    // 44-Punkt-Regel nicht.
    if (!el.classList.contains('hinweis') && Math.min(eb.width, eb.height) < 44 - 0.5)
      klein.push(`„${text}" — ${Math.min(eb.width, eb.height).toFixed(0)} pt`);

    // VERDECKT: liegt in der Mitte des Knopfes wirklich der Knopf?
    //
    // Ein Element kann vollstaendig im Bild sein und trotzdem nicht
    // bedienbar, weil etwas anderes darueber liegt. Genau das passiert auf
    // dem iPhone quer: der Kasten der Ueberschrift reicht ueber die ganze
    // Breite und deckt "Forscherbuch" und "Eltern" zu. Sichtbar ist der
    // Text - der Finger trifft trotzdem die Ueberschrift.
    const cx = eb.left + eb.width / 2, cy = eb.top + eb.height / 2;
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
    const oben = document.elementFromPoint(cx, cy);
    if (oben && oben !== el && !el.contains(oben) && !oben.contains(el)) {
      const stoerer = oben.className && typeof oben.className === 'string'
        ? '.' + oben.className.split(' ')[0] : oben.tagName.toLowerCase();
      zu.push(`„${text}" — verdeckt von ${stoerer} „${oben.textContent.trim().slice(0,22)}"`);
    }
  }
  // Sitzt die Karte satt in ihrem Kasten?
  //
  // Eine Karte behaelt ihr Seitenverhaeltnis. Ist der Kasten anders
  // geschnitten, bleibt daneben ein Loch - und zwar eines, das NIEMAND
  // nutzt: gemessen war der Kasten auf dem iPhone quer 420 Punkte breit,
  // gezeichnet wurden 213. Deutschland ist hochformatig (0,74), die
  // Weltkarte quer (1,67); ein Kasten fuer beide verschenkt immer bei einer.
  //
  // Geprueft wird nicht "die Karte fuellt den Bildschirm" - das kann sie
  // geometrisch gar nicht -, sondern "die Karte fuellt IHREN KASTEN".
  // Das ist die Zusage, die man halten kann.
  // Nimmt das gesuchte Gebiet den Finger UEBERALL an, wo man es sieht?
  //
  // Der Anlass: der pulsierende Ring um das Ziel (`fill:none`, Strich bis
  // 9 Punkte) lag ueber der Flaeche und fing den Zug ab. `elementFromPoint`
  // lieferte den Ring - weder Gebiet noch Trefferkreis -, und die Bewertung
  // lief gar nicht erst an: die richtige Antwort wurde nicht als falsch
  // gewertet, es passierte ueberhaupt nichts. Ausgerechnet die
  // Hervorhebung, die zeigen soll wohin man ziehen muss, bewachte das Ziel.
  //
  // Geprueft wird deshalb nicht "der Pfad ist da", sondern: an jedem Punkt,
  // an dem das Gebiet zu SEHEN ist, muss auch das Gebiet angefasst werden.
  let bewacht = null;
  const zielPfad = document.querySelector('.schirm.da path.geb.ziel');
  if (zielPfad) {
    const b = zielPfad.getBoundingClientRect();
    let sichtbar = 0, gefangen = 0; const wer = new Set();
    for (let n = 0; n < 12; n++) for (let m = 0; m < 12; m++) {
      const x = b.left + b.width * (n + .5) / 12, y = b.top + b.height * (m + .5) / 12;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
      // Der ganze Stapel, nicht nur das oberste Element: nur so ist zu
      // sehen, ob das Ziel DA ist und trotzdem nicht drankommt.
      const stapel = document.elementsFromPoint(x, y);
      const i = stapel.indexOf(zielPfad);
      if (i < 0) continue;                      // hier ist das Ziel nicht gemalt
      sichtbar++;
      // Ein NACHBARGEBIET, das an der gemeinsamen Grenze obenauf liegt, ist
      // in Ordnung - dort gehoert der Punkt wirklich dem Nachbarn, und das
      // Kind bekommt "Das ist das falsche Gebiet" zu hoeren. Ebenso ein
      // Trefferkreis: der ist genau dafuer da. Gemeint ist der SCHMUCK -
      // Ringe, Zeiger, Fahnen, Haken.
      const drueber = stapel.slice(0, i).find(e =>
        e.closest && e.closest('.karte svg')
        && !e.classList.contains('geb')
        && !e.closest('#treffer circle'));
      if (drueber) {
        gefangen++;
        wer.add('.' + (drueber.getAttribute('class') || drueber.tagName));
      }
    }
    bewacht = { sichtbar, gefangen, wer: [...wer].slice(0, 3) };
  }

  let karte = null;
  const svg = document.querySelector('.schirm.da .karte svg');
  if (svg) {
    const kasten = svg.parentElement.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const k = Math.min(kasten.width / vb.width, kasten.height / vb.height);
    const gez = { b: vb.width * k, h: vb.height * k };
    karte = {
      anteil: (gez.b * gez.h) / (kasten.width * kasten.height),
      kasten: [Math.round(kasten.width), Math.round(kasten.height)],
      gez: [Math.round(gez.b), Math.round(gez.h)],
    };
  }
  // UEBERLAPPEN: liegt Sichtbares auf Sichtbarem?
  //
  // `elementFromPoint` oben findet nur, was die MITTE eines Knopfes
  // zudeckt. Ein Kasten, der zur Haelfte auf dem Nachbarn liegt, hat freie
  // Mitten - und war damit kein Befund. Genau das war die Sorge des
  // Nutzers bei R2 („sicherstellen, dass nichts ueberlappt"), und genau
  // das konnte kein Tor sagen.
  //
  // Geprueft werden nur Elemente IM FLUSS. Was absolut liegt, liegt
  // absichtlich uebereinander: das Wasserzeichen unter seiner Kachel, der
  // Kopf ueber der Buehne. Deren Fall ist `elementFromPoint` und, fuer
  // das Wasserzeichen, das Tor `lesbarkeit`.
  const ueber = [];
  {
    const kasten = [];
    for (const el of document.querySelectorAll('.schirm.da .kachel, .schirm.da .etikett, '
      + '.schirm.da .knopf, .schirm.da .zi, .schirm.da .eingabe, .schirm.da .hinweis, '
      + '.schirm.da .titel, .schirm.da .frage, .schirm.da .bauzeile, .schirm.da .kachelpaar')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'absolute' || cs.position === 'fixed') continue;
      if (cs.visibility === 'hidden' || +cs.opacity < 0.05) continue;
      const b = el.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) continue;
      kasten.push({ el, b, text: (el.textContent.trim() || el.className).slice(0, 22)
        .replace(/\s+/g, ' ') });
    }
    // Nur die INNERSTEN Kaesten. Sonst meldet ein Ueberlappen vierfach:
    // Huelle gegen Huelle, Huelle gegen Kachel, Kachel gegen Huelle,
    // Kachel gegen Kachel. Vier Zeilen fuer einen Befund lesen sich wie
    // vier Befunde.
    for (let i = kasten.length - 1; i >= 0; i--)
      if (kasten.some(y => y !== kasten[i] && kasten[i].el.contains(y.el)))
        kasten.splice(i, 1);
    for (let i = 0; i < kasten.length; i++) for (let j = i + 1; j < kasten.length; j++) {
      const x = kasten[i], y = kasten[j];
      if (x.el.contains(y.el) || y.el.contains(x.el)) continue;
      const breit = Math.min(x.b.right, y.b.right) - Math.max(x.b.left, y.b.left);
      const hoch  = Math.min(x.b.bottom, y.b.bottom) - Math.max(x.b.top, y.b.top);
      if (breit > 1 && hoch > 1)
        ueber.push(`„${x.text}" und „${y.text}" ueberlappen sich um `
          + `${breit.toFixed(0)}×${hoch.toFixed(0)} px`);
    }
  }
  return { raus, klein, zu, ueber, karte, bewacht };
};

/** Wieviel ihres eigenen Kastens die Karte mindestens ausfuellen muss. */
const KARTE_MIN = 0.92;

const { server, adresse: ADRESSE } = await serviere(DIST);

console.log('\n  Tor `passt`');
const b = await starte();
let gesehen = 0, zuKlein = 0;

for (const g of GERAETE) {
  const ctx = await b.newContext({ hasTouch: g.touch, isMobile: g.touch, locale: 'de-DE',
    viewport: { width: g.w, height: g.h }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  // `env(safe-area-inset-*)` laesst sich von aussen nicht setzen - kein
  // Browser bietet das an. Die VERKABELUNG dahinter schon: die App liest
  // die Werte über Marken, und die sind zu setzen. Geprueft wird damit
  // nicht, ob iOS die richtigen Zahlen liefert, sondern ob die App sie
  // ueberhaupt beachtet. Genau das tat sie nicht: das Polster stand auf
  // `body`, waehrend die Buehne absolut am FENSTER hing - der
  // Schliessen-Knopf lag unter der Uhr und nahm den Finger nicht an.
  if (g.sicher) await p.addInitScript((si) => {
    addEventListener('DOMContentLoaded', () => {
      const r = document.documentElement.style;
      r.setProperty('--sicher-oben', si.oben + 'px');
      r.setProperty('--sicher-rechts', si.rechts + 'px');
      r.setProperty('--sicher-unten', si.unten + 'px');
      r.setProperty('--sicher-links', si.links + 'px');
    });
  }, g.sicher);
  await p.goto(ADRESSE, { waitUntil: 'load' });
  await p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([document.fonts.load('700 20px "Plus Jakarta Sans"'),
                       document.fonts.load('400 20px "Andika"')]);
  });

  const meldungen = [];
  const schau = async (name) => {
    await p.waitForTimeout(450);   // der Bildschirmwechsel muss durch sein
    const r = await p.evaluate(SUCHE);
    // Liegt etwas Bedienbares im Bereich, den das Telefon fuer sich
    // beansprucht? Dort sitzen Uhr, Akku und der Streifen zum Wischen - ein
    // Knopf darunter ist zu sehen und nicht zu treffen.
    if (g.sicher) {
      const drin = await p.evaluate((si) => {
        const raus = [];
        for (const el of document.querySelectorAll('.schirm.da .kachel, .schirm.da .knopf, '
          + '.schirm.da .etikett, .schirm.da .zi, .schirm.da .mikro, .schirm.da .sterne')) {
          const b = el.getBoundingClientRect();
          if (b.width === 0 && b.height === 0) continue;
          const fehlt = Math.max(si.oben - b.top, si.links - b.left,
            b.right - (innerWidth - si.rechts), b.bottom - (innerHeight - si.unten));
          if (fehlt > 1) raus.push(`„${(el.textContent.trim() || el.className).slice(0, 22)}" `
            + `${fehlt.toFixed(0)} px im Bereich des Telefons`);
        }
        return raus;
      }, g.sicher);
      for (const x of drin) meldungen.push(`${name}: ${x}`);
    }
    gesehen++;
    zuKlein += r.klein.length;
    for (const x of r.raus) meldungen.push(`${name}: ${x}`);
    for (const x of r.zu) meldungen.push(`${name}: ${x}`);
    for (const x of r.ueber) meldungen.push(`${name}: ${x}`);
    if (r.bewacht && r.bewacht.gefangen > 0)
      meldungen.push(`${name}: ${r.bewacht.gefangen} von `
        + `${r.bewacht.gefangen + r.bewacht.sichtbar} Punkten auf dem gesuchten Gebiet `
        + `werden von Schmuck abgefangen (${r.bewacht.wer.join(', ')}) — `
        + `dort landet ein Etikett auf nichts`);
    if (r.karte && r.karte.anteil < KARTE_MIN)
      meldungen.push(`${name}: die Karte füllt nur `
        + `${(r.karte.anteil * 100).toFixed(0)} % ihres Kastens `
        + `(Kasten ${r.karte.kasten.join('×')}, gezeichnet ${r.karte.gez.join('×')}) — `
        + `daneben steht ein Loch, das niemand nutzt`);
    // Zu kleine Trefferflaechen sind ein Hinweis, kein Fehler: manche
    // Knoepfe sind bewusst schmal (der Zurueck-Pfeil ist 44 hoch, aber
    // nicht 44 breit - er ist trotzdem gut zu treffen).
    for (const x of r.klein) meldungen.push(`${name}: HINWEIS zu klein ${x}`);
  };

  // Geklickt wird ueber das DOM, nicht ueber den Zeiger: ein verdeckter
  // Knopf ist ein BEFUND, kein Grund zum Abbrechen. Sonst meldet das Tor
  // einen Zeitablauf statt zu sagen, was los ist.
  const tipp = async (sel) => p.$eval(sel, el => el.click());

  await schau('Profilwahl');
  await tipp('[data-profil="fiona"]');
  await p.waitForSelector('.schirm.da [data-welt]');
  await schau('Weltenwahl');
  await zurEbenenwahl(p);
  await schau('Ebenenwahl');

  // Auch die WELTKARTE: sie ist querformatig, Deutschland hochformatig -
  // ein Grundriss, der nur mit einer von beiden geprueft wird, ist halb
  // geprueft.
  for (const ebene of ['kontinente', 'bundeslaender', 'hauptstaedte']) {
    await tipp(`[data-ebene="${ebene}"]`);
    // Der Vorlauf (R3) ist die engste Stelle der ganzen App: bis zu
    // sechzehn Kaesten auf einmal, auf dem kleinsten Geraet. Er wird
    // deshalb ANGESEHEN und nicht nur durchlaufen.
    await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel',
      { timeout: 20000 });
    if (await p.$('.schirm.da #los')) {
      await schau(`Vorlauf ${ebene}`);
      await durchVorlauf(p);
    }
    await p.waitForSelector('.schirm.da .karte svg path.ziel');
    await schau(`Spiel ${ebene}`);
    // Das Kreuz fuehrt seit R1 in die PAUSE, nicht mehr direkt zurueck.
    // Ein neuer Bildschirm, den kein Tor ansieht, ist genau die Luecke,
    // die das Forscherbuch eine Runde lang hatte - deshalb steht er hier.
    await tipp('.schirm.da #zur');
    await p.waitForSelector('.schirm.da #null');
    await schau('Pause');
    await tipp('.schirm.da #raus');
    await p.waitForSelector('.schirm.da [data-ebene]');
  }

  /* Die dritte Welt (N2a) - zwei Bildschirme, die es sonst nirgends gibt.
   *
   * Der Vorlauf zeigt hier ALLE sechsundzwanzig Buchstaben und ist damit
   * die dichteste Kachelwand der App; der Schreibschirm haelt ein
   * quadratisches Feld, einen Fragesatz und drei Knoepfe auf einmal.
   * Beides auf 844 x 390 unterzubringen war nicht selbstverstaendlich:
   * das Werkzeug musste dafuer NEBEN das Feld. */
  await tipp('.schirm.da #zur');
  await p.waitForSelector('.schirm.da [data-welt="schreiben"]');
  await zurEbenenwahl(p, 'schreiben:buchstaben');
  await tipp('[data-ebene="schreiben:buchstaben"]');
  await p.waitForSelector('.schirm.da #los, .schirm.da .schreibblatt', { timeout: 20000 });
  if (await p.$('.schirm.da #los')) {
    await schau('Vorlauf schreiben');
    await durchVorlauf(p);
  }
  await p.waitForSelector('.schirm.da .schreibblatt');
  await schau('Schreiben');
  await tipp('.schirm.da #zur');
  await p.waitForSelector('.schirm.da #null');
  await tipp('.schirm.da #raus');
  await p.waitForSelector('.schirm.da [data-ebene]');
  await tipp('.schirm.da #zur');
  await p.waitForSelector('.schirm.da [data-welt]');

  await tipp('.schirm.da #buch');
  await p.waitForSelector('.schirm.da .aufkleber');
  await schau('Forscherbuch');
  await tipp('.schirm.da #zur');
  await p.waitForSelector('.schirm.da #eltern');
  await tipp('.schirm.da #eltern');
  await p.waitForSelector('.schirm.da .ziffern');
  await schau('Eltern-Tor');

  /* Und die Weltenwahl noch einmal - als LEA.
   *
   * Seit N2a haengt die Zahl der Karten am Profil: Fiona hat drei, Lea und
   * die Eltern zwei. Ein Bildschirm, dessen Gestalt vom Kind abhaengt,
   * ist mit einem Kind halb geprueft - und ausgerechnet die kleinere
   * Fassung ist die, die niemand mehr ansieht. Ein Seitenwechsel statt
   * eines zweiten Durchlaufs: es geht um diesen einen Bildschirm. */
  await p.goto(ADRESSE, { waitUntil: 'load' });
  await p.waitForSelector('[data-profil="lea"]');
  await tipp('[data-profil="lea"]');
  await p.waitForSelector('.schirm.da [data-welt]');
  await schau('Weltenwahl (Lea)');

  const echte = meldungen.filter(m => !m.includes('HINWEIS'));
  if (process.argv.includes('--hinweise'))
    meldungen.filter(m => m.includes('HINWEIS')).forEach(m => console.log(`            ${m}`));
  if (echte.length) {
    console.log(`    ROT   ${g.n.padEnd(16)} ${g.w}×${g.h} — ${echte.length} nicht erreichbar`);
    echte.forEach(m => console.log(`            ${m}`));
    fehler.push(...echte.map(m => `${g.n}: ${m}`));
  } else {
    console.log(`    grün  ${g.n.padEnd(16)} ${g.w}×${g.h}`);
  }
  await ctx.close();
}
await b.close(); server.close();

console.log(`    ${GERAETE.length} Größen × ${gesehen / GERAETE.length} Bildschirme geprüft, `
  + `Karten füllen mindestens ${(KARTE_MIN*100).toFixed(0)} % ihres Kastens`
  + (zuKlein ? `, ${zuKlein} Trefferflächen unter ${MIN_PT} pt (Hinweis)` : ''));

if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER: Elemente laufen über den Rand.`);
  console.log('  `overflow:auto` zählt nicht als Lösung — ein Kind scrollt nicht in einer');
  console.log('  Liste, von der es nicht weiß, dass sie weitergeht. Und ein verdeckter');
  console.log('  Knopf ist sichtbar und trotzdem nicht zu treffen.');
  process.exit(1);
}
console.log(`\n  passt grün: auf allen ${GERAETE.length} Größen ist alles im Bild.`);
