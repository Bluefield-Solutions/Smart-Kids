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
import { teilVon, meldeTeil } from './teilen.mjs';

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

/* ---------- Teillaeufe: `--teil=i/n` ------------------------------------
 *
 * Nach P3 war `passt` mit 117 s der laengste Einzellauf der Torkette und
 * damit ihr Boden. Die sieben Groessen wissen nichts voneinander - jede
 * bekommt ihren eigenen Kontext, ihre eigene Seite, ihre eigene Reise
 * durch die App. Sie liefen trotzdem nacheinander.
 *
 * Verteilt wird schlicht reihum, nicht nach Gewicht: gemessen kosten alle
 * sieben zwischen 15,6 und 15,8 s. Wo nichts zu wiegen ist, waere eine
 * Waage nur eine Stelle mehr, die veraltet.
 *
 * Dass die Teile zusammen alle sieben fahren, zaehlt `tools/kette.mjs`
 * nach - an der Zeile `TEILE i/n:` unten.
 */
const TEIL = teilVon('passt');
const MEINE = TEIL ? GERAETE.filter((_, k) => k % TEIL.n === TEIL.i) : GERAETE;

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
  //
  // Und seit dieser Runde steht `button` mit in der Liste - statt jede
  // Klasse einzeln nachzutragen. Eine Klassenliste veraltet: `.zahl` (die
  // vier Moeglichkeiten beim Rechnen) und `#pruef` standen nie darin, und
  // niemand haette es gemerkt, solange sie gross genug sind. Was ein Kind
  // antippen kann, ist ein Knopf; wer einen neuen Bildschirm baut, muss
  // dafuer nichts eintragen.
  const bedienbar = '.schirm.da button, .schirm.da .kachel, .schirm.da .etikett, '
    + '.schirm.da .knopf, .schirm.da .mikro, .schirm.da .zi, .schirm.da .eingabe, '
    + '.schirm.da .hinweis, .schirm.da .aufkleber';
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
    /* Ein AUFKLEBER ist immer ein Ziel fuer den Finger - fuer ihn ist die
     * 44-Punkt-Grenze ein FEHLER, kein Hinweis.
     *
     * Der Unterschied ist gemessen und nicht gesetzt: die anderen Kaesten
     * in dieser Liste duerfen schmal sein (der Zurueck-Pfeil ist 44 hoch
     * und nicht 44 breit, und das ist in Ordnung). Ein Aufkleber ist nie
     * schmal aus gutem Grund - er ist eine Karte mit Bild und Wort, und
     * wenn er unter das Mass faellt, ist ein Gitter zusammengerutscht.
     *
     * Genau das ist passiert (S3): die Karten des Abc standen auf dem
     * Zielgeraet 77 x 42 statt 88 x 62, weil eine Untergrenze im
     * Stylesheet die gewuenschte Spaltenzahl ueberstimmte. Ein Jahr lang
     * stand es als HINWEIS im Bericht - und ein Hinweis, den niemand
     * liest, ist dasselbe wie keiner. */
    const schmal = Math.min(eb.width, eb.height);
    if (el.classList.contains('aufkleber') && schmal < 44 - 0.5)
      raus.push(`„${text}" — nur ${schmal.toFixed(0)} pt, ein Aufkleber muss `
        + `44 messen (Gitter zusammengerutscht?)`);
    // Der Hinweis ist Text, kein Ziel fuer den Finger - fuer ihn gilt die
    // 44-Punkt-Regel nicht.
    else if (!el.classList.contains('hinweis') && schmal < 44 - 0.5)
      klein.push(`„${text}" — ${schmal.toFixed(0)} pt`);

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
      + '.schirm.da .titel, .schirm.da .frage, .schirm.da .kachelpaar')) {
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
  /* DER FASSUNGSSTEMPEL: deckt er etwas zu? (Q13)
   *
   * Er steht seit Q13 auf JEDEM Bildschirm, unten in der Ecke, und liegt
   * `fixed` ueber allem. Damit faellt er aus der Ueberlappungspruefung
   * darueber heraus - die sieht nur Elemente IM FLUSS, und das ist
   * richtig so, sonst meldete jeder Kopf einen Befund.
   *
   * Geprueft werden muss er trotzdem, und zwar hier: „nimmt keinen Platz
   * weg" ist eine BEHAUPTUNG, solange niemand nachmisst. Auf dem iPhone
   * quer bleiben unter der letzten Kachelreihe wenige Punkte, und eine
   * Kachelreihe mehr wuerde genau in diese Ecke wachsen.
   *
   * `pointer-events:none` schuetzt den Finger, nicht das Auge: was der
   * Stempel verdeckt, ist verdeckt, auch wenn man hindurchtippen kann. */
  const stempel = [];
  {
    const s = document.getElementById('fassung');
    const b = s && s.getBoundingClientRect();
    if (!s) stempel.push('der Fassungsstempel steht gar nicht da');
    else if (b.width < 2 || b.height < 2) stempel.push('der Fassungsstempel ist leer');
    else {
      if (b.right > innerWidth + 1 || b.bottom > innerHeight + 1 || b.left < -1 || b.top < -1)
        stempel.push(`der Fassungsstempel steht ausserhalb des Fensters `
          + `(${b.left.toFixed(0)}|${b.top.toFixed(0)} bis `
          + `${b.right.toFixed(0)}|${b.bottom.toFixed(0)} in ${innerWidth}×${innerHeight})`);
      for (const el of document.querySelectorAll('.schirm.da .kachel, .schirm.da .etikett, '
        + '.schirm.da .knopf, .schirm.da .zi, .schirm.da .eingabe, .schirm.da .hinweis, '
        + '.schirm.da .titel, .schirm.da .frage, .schirm.da .kachelpaar, .schirm.da .karte')) {
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || +cs.opacity < 0.05) continue;
        const k = el.getBoundingClientRect();
        if (k.width < 2 || k.height < 2) continue;
        const breit = Math.min(b.right, k.right) - Math.max(b.left, k.left);
        const hoch  = Math.min(b.bottom, k.bottom) - Math.max(b.top, k.top);
        if (breit > 1 && hoch > 1)
          stempel.push(`der Fassungsstempel liegt ueber „${(el.textContent.trim()
            || el.className).slice(0, 22).replace(/\s+/g, ' ')}" `
            + `(${breit.toFixed(0)}×${hoch.toFixed(0)} px)`);
      }
    }
  }

  /* DAS WASSERZEICHEN: liegt es ganz in seiner Kachel, und liegt etwas
   * darauf?
   *
   * Fuer Fiona IST das Kachelbild der Name - sie liest nicht. Im
   * Stylesheet steht das seit R2 als Absicht („ein Kind, das noch nicht
   * liest, erkennt Afrika am Bild und nicht am Wort") und daneben die
   * Lehre, die es einmal gekostet hat: „ein Wasserzeichen, das man nicht
   * erkennt, ist Dekoration und keine Auskunft."
   *
   * Geprueft hat das niemand. Die Kachel ist eine Pille mit
   * `overflow:hidden`; das Bild sitzt buendig rechts und wird von der
   * Rundung angeschnitten - oben und unten am staerksten. Und der
   * Vorschau-Knopf sitzt genau darauf.
   *
   * Gemessen wird an der FARBE, nicht am Kasten: der Kasten eines Umrisses
   * ist zum grossen Teil leer, und ein Mass, das die Leere mitzaehlt,
   * meldet Beschnitt, wo nur Luft abgeschnitten wurde. `isPointInFill`
   * fragt den Umriss selbst. */
  const zeichen = [];
  for (const svg of document.querySelectorAll('.schirm.da .kachel .silhouette')) {
    const kachel = svg.closest('.kachel');
    const pfade = [...svg.querySelectorAll('path')];
    const ctm = svg.getScreenCTM();
    if (!kachel || !pfade.length || !ctm) continue;
    // Gezeichnete Zeichen (Buchstaben, Rechenzeichen) haben keine Fuellung -
    // dort traegt der STRICH die Form, und `isPointInFill` faende nichts.
    const gezogen = svg.classList.contains('gezeichnet');
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const q of pfade) { const b = q.getBBox();
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); }
    const N = 44;
    let farbe = 0, draussen = 0, verdeckt = 0; const wer = {};
    let gx0 = Infinity, gy0 = Infinity, gx1 = -Infinity, gy1 = -Infinity;
    let unterName = 0;
    const namenskaesten = [];
    for (const el of kachel.querySelectorAll('.name, .ueber')) {
      for (const kind of el.childNodes) {
        if (kind.nodeType !== 3) continue;
        const r = document.createRange(); r.selectNodeContents(kind);
        namenskaesten.push(...[...r.getClientRects()]);
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const ux = x0 + (x1 - x0) * (i + .5) / N, uy = y0 + (y1 - y0) * (j + .5) / N;
      const drin = gezogen
        ? pfade.some(q => q.isPointInStroke(new DOMPoint(ux, uy)))
        : pfade.some(q => q.isPointInFill(new DOMPoint(ux, uy)));
      if (!drin) continue;
      farbe++;
      const pt = new DOMPoint(ux, uy).matrixTransform(ctm);
      // Die GEZEICHNETE Ausdehnung der Farbe, in Bildschirmpunkten. Nicht
      // der Kasten: der ist bei einem Umriss zum grossen Teil Meer.
      if (pt.x < gx0) gx0 = pt.x; if (pt.x > gx1) gx1 = pt.x;
      if (pt.y < gy0) gy0 = pt.y; if (pt.y > gy1) gy1 = pt.y;
      const stapel = document.elementsFromPoint(pt.x, pt.y);
      // Das Wasserzeichen nimmt keine Tipps an, steht also nie im Stapel.
      // Ist die Kachel nicht darin, liegt der Punkt ausserhalb - von der
      // Rundung weggeschnitten oder ganz aus dem Bild.
      if (!stapel.includes(kachel)) { draussen++; continue; }
      /* Und was liegt darauf? Nur, was dort auch WIRKLICH MALT.
       *
       * Der erste Anlauf zaehlte jedes Element im Stapel und meldete
       * prompt „70 bis 100 % verdeckt" - bei einem Wasserzeichen, das man
       * auf dem Bildschirm deutlich sieht. Der Grund: der Kachelname und
       * der Fortschrittsbalken sind KAESTEN ueber die volle Kachelbreite,
       * und unter ihrem durchsichtigen Teil lag jeder Punkt „verdeckt".
       * Eine Zahl, die Kaesten zaehlt statt Farbe, sagt nichts.
       *
       * Gezaehlt wird deshalb nur, was einen eigenen Grund hat oder ein
       * Zeichen ist - der Vorschau-Knopf mit seinem Ring, der Balken, ein
       * Aufkleber. Die SCHRIFT bleibt draussen: ob ein Name auf dem Bild
       * noch zu lesen ist, misst `lesbarkeit`, und zwar am Kontrast. */
      // UNTER DEM NAMEN? Gemessen an den Zeilenkaesten der Schrift
      // (`Range.getClientRects`), nicht am Kasten des Elements: der
      // `.name`-Kasten laeuft ueber die ganze Kachel, die Buchstaben tun
      // das nicht. Genau dieser Unterschied hat den ersten Anlauf
      // („70 bis 100 % verdeckt") wertlos gemacht.
      if (namenskaesten.some(r => pt.x >= r.left && pt.x <= r.right
          && pt.y >= r.top && pt.y <= r.bottom)) unterName++;
      const bis = stapel.indexOf(kachel);
      const malt = (e) => {
        if (e === svg || svg.contains(e)) return false;
        const c = getComputedStyle(e);
        if (+c.opacity < 0.1) return false;
        const g = c.backgroundColor || '';
        const m = g.match(/^rgba?\(([^)]+)\)/);
        const undurchsichtig = m && (m[1].split(',').length < 4
          || parseFloat(m[1].split(',')[3]) >= 0.1);
        // `e.querySelector('svg')` stand hier und war die dritte zu weite
        // Fassung: ein Kasten, der IRGENDWO ein Zeichen enthaelt, malt an
        // DIESER Stelle noch lange nicht. Damit zaehlte der Kachelfuss
        // mit, weil der Aufkleber in ihm sitzt.
        return !!undurchsichtig || e.tagName === 'svg' || e.tagName === 'path';
      };
      const drauf = stapel.slice(0, bis).find(malt);
      if (drauf) { verdeckt++;
        const wie = drauf.tagName.toLowerCase()
          + (typeof drauf.className === 'string' && drauf.className
             ? '.' + drauf.className.trim().split(/\s+/).join('.') : '');
        wer[wie] = (wer[wie] || 0) + 1; }
    }
    if (farbe < 40) continue;   // zu wenig Farbe fuer eine Aussage
    zeichen.push({ was: (kachel.querySelector('.name, .titel, b, strong')
        || kachel).textContent.trim().slice(0, 18).replace(/\s+/g, ' '),
      ab: Math.round(draussen / farbe * 100), zu: Math.round(verdeckt / farbe * 100),
      breit: Math.round(gx1 - gx0), hoch: Math.round(gy1 - gy0),
      unterm: Math.round(unterName / farbe * 100),
      // Wieviel von der Kachel nimmt das Bild wirklich ein? Die Breite
      // allein sagt nichts, solange die Kachel selbst schmaler wird.
      anteil: Math.round((gx1 - gx0) / kachel.getBoundingClientRect().width * 100),
      // Wer deckt zu? Ohne das ist ein Prozentsatz kein Befund, sondern
      // ein Raetsel - und der erste Anlauf war genau deshalb wertlos.
      wer: Object.entries(wer).sort((a, b) => b[1] - a[1]).slice(0, 2)
        .map(([k, n]) => `${k} ${Math.round(n / farbe * 100)} %`).join(', ') });
  }
  /* Und die kleinste Beispielkarte auf diesem Bildschirm.
   *
   * Nur `.aufkleber` im Vorlauf: das sind die Karten, die in einem Gitter
   * stehen und zusammenrutschen koennen. Gemessen wird die KUERZESTE
   * Seite, denn die faellt zuerst unter den Daumen. */
  let kleber = null;
  {
    const k = [...document.querySelectorAll('.schirm.da .rollen.vorlauf .aufkleber')]
      .map(e => e.getBoundingClientRect()).filter(b => b.width > 1 && b.height > 1);
    if (k.length >= 4) kleber = { n: k.length,
      pt: Math.round(Math.min(...k.map(b => Math.min(b.width, b.height)))) };
  }

  /* WIEVIEL PASST NOCH? Der Wahlbildschirm ist eine Wand aus Kacheln, und
   * sie waechst mit jeder Ebene. Dass sie HEUTE passt, sagt das Tor schon;
   * was es nicht sagt, ist, wieviele noch dazukoennen.
   *
   * GEZAEHLT WIRD, INDEM WELCHE DAZUGELEGT WERDEN - nicht gerechnet. Der
   * erste Anlauf teilte den freien Platz durch die Reihenhoehe und meldete
   * fuer das iPhone quer „0,8 Reihen frei, die naechste Kachel passt nicht
   * mehr". Nachgemessen passten dort noch SECHS: die Wand sitzt in einem
   * Kasten, der sich beim Umbrechen zusammenschiebt, also kostet eine neue
   * Reihe weniger als eine Reihe hoch ist. Eine Zahl, die das nicht weiss,
   * sagt das Gegenteil der Wahrheit.
   *
   * Die Kopien werden hinterher wieder entfernt; der Bildschirm steht
   * danach so da wie vorher, und die Pruefungen davor haben ihn ohnehin
   * schon gesehen. */
  let wand = null;
  {
    const w = document.querySelector('.schirm.da .wahl');
    if (w && w.children.length >= 2) {
      const muster = w.lastElementChild, heute = w.children.length;
      const laeuftRaus = () => {
        const k = [...w.children].map(e => e.getBoundingClientRect());
        return Math.max(...k.map(x => x.bottom)) > innerHeight;
      };
      const kopien = [];
      // Nach oben, bis es herauslaeuft - hoechstens acht dazu, sonst
      // kostet die Messung mehr als sie wert ist.
      let passt = heute;
      if (!laeuftRaus()) for (let i = 0; i < 8; i++) {
        const k = muster.cloneNode(true); kopien.push(k); w.appendChild(k);
        if (laeuftRaus()) break;
        passt = heute + i + 1;
      }
      for (const k of kopien) k.remove();
      const oben = [...new Set([...w.children]
        .map(e => Math.round(e.getBoundingClientRect().top)))].sort((a, b) => a - b);
      /* Steht die LETZTE Reihe mittig?
       *
       * Ein Raster fuellt seine Reihen von links; bleibt die letzte halb
       * leer, klebt sie am linken Rand. Gemessen war sie auf fuenf von
       * sieben Groessen 138 bis 278 Punkte aus der Mitte - auf zwei davon
       * stand dort eine EINZELNE Kachel ganz aussen. Das sieht aus wie ein
       * Fehler und nicht wie das Ende einer Liste.
       *
       * Zwei Punkte Nachsicht, nicht null: eine ungerade Restbreite teilt
       * sich nicht ohne Rest, und ein halber Bildpunkt ist kein Befund. */
      const kk = [...w.children].map(e => e.getBoundingClientRect());
      const letzteReihe = kk.filter(x => Math.round(x.top) === oben[oben.length - 1]);
      const mitteWand = (Math.min(...kk.map(x => x.left))
                       + Math.max(...kk.map(x => x.right))) / 2;
      const mitteLetzte = (Math.min(...letzteReihe.map(x => x.left))
                         + Math.max(...letzteReihe.map(x => x.right))) / 2;
      wand = { heute, passt, mehr: passt - heute, gedeckelt: passt - heute >= 8,
               versatz: Math.round(Math.abs(mitteWand - mitteLetzte)),
               jeReihe: [...w.children].filter(e =>
                 Math.round(e.getBoundingClientRect().top) === oben[0]).length,
               reihen: oben.length };
    }
  }
  return { raus, klein, zu, ueber, stempel, karte, bewacht, zeichen, wand, kleber };
};

/** Wieviel ihres eigenen Kastens die Karte mindestens ausfuellen muss. */
const KARTE_MIN = 0.92;

/* Das Kachelbild: wieviel davon darf weg sein?
 *
 * ZUERST GEMESSEN, DANN GESETZT. Gemessen auf fuenf Groessen, Anteil der
 * FARBE (nicht des Kastens) des Wasserzeichens:
 *
 *                      vorher        nachher
 *   Afrika              52 %           0 %
 *   Suedamerika         50 %           0 %
 *   Bundeslaender       44 %           0 %
 *   Hauptstaedte        44 %           0 %
 *   Europa              43 %           0 %
 *   Asien               42 %           0 %
 *   Kontinente          29 %           0 %
 *   Nordamerika         17 %           0 %
 *   Mittelamerika        7 %           0 %
 *
 * Verdeckt hat sie der Vorschau-Knopf oben rechts in der Kachel; seit Q4
 * rueckt das Bild links an ihm vorbei. Sechs Prozent, weil alles Gemessene
 * jetzt auf null steht und der naechste Knopf, den jemand in eine Kachel
 * legt, anschlagen soll - nicht erst der uebernaechste.
 *
 * `ab` (abgeschnitten) lag schon vorher ueberall bei 0 bis 1 %: die Pille
 * schneidet die Ecken des Kastens weg, und dort liegt bei einem Umriss
 * Meer. Die Zahl steht trotzdem da - sie ist die Zusage, dass ein Bild
 * ganz in seine Kachel gehoert, und die naechste Kachelform koennte sie
 * brechen. */
const ZEICHEN_AB = 6, ZEICHEN_ZU = 6;
const zeichenZeilen = [], luftZeilen = [], kleberZeilen = [];

/* Der Stand der MASSE: was einmal so gross war, darf nicht kleiner werden.
 *
 * Eine Ratsche wie `tor/budget-stand.json`, kein Soll. Zwei Sorten teilen
 * sie sich, weil es dieselbe Frage ist - „ist hier etwas zusammengerutscht,
 * ohne dass ein Soll verletzt waere?":
 *
 *   „… · Kacheln"        wieviele Kacheln eine Wand traegt (nachgezaehlt)
 *   „… · Aufkleber pt"   die kuerzeste Seite der kleinsten Beispielkarte
 *
 * Die zweite Sorte kam aus einem Befund: die Gegenprobe „die
 * Buchstabenkarten rutschen wieder zusammen" bewies nichts mehr. Der
 * Eingriff wirkt naemlich weiterhin - auf dem iPhone SE quer fallen die
 * 26 Buchstaben von neun Spalten auf acht und die Karte von 59 auf 44
 * Punkte -, aber die feste Grenze im Tor lautet „unter 44", und 44 ist
 * nicht unter 44. Ein Absturz um fuenfzehn Punkte, der auf dem letzten
 * erlaubten Wert landet, ist unsichtbar. Regel 2, wieder einmal: eine
 * absolute Grenze sieht keinen Rueckschritt. */
const WAND_DATEI = 'tor/masse-stand.json';
const NEU = process.argv.includes('--neu');
const MASS_STAND = fs.existsSync(WAND_DATEI)
  ? JSON.parse(fs.readFileSync(WAND_DATEI, 'utf8')) : {};
const wandNeu = {};

const { server, adresse: ADRESSE } = await serviere(DIST);

console.log('\n  Tor `passt`');
const b = await starte();
let gesehen = 0, zuKlein = 0;
/** Was das Tor mit Warten verbringt. Sichtbar, damit es nicht nachwaechst. */
const ruhe = { ms: 0, n: 0 }, blind = { ms: 0, n: 0 };

meldeTeil('passt', TEIL, MEINE.map(g => g.n), GERAETE.map(g => g.n));

for (const g of MEINE) {
  const angefangen = Date.now();
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
  /* Warten, bis der Bildschirmwechsel wirklich durch ist.
   *
   * Hier stand `waitForTimeout(450)` mit der Begruendung „der
   * Bildschirmwechsel muss durch sein". Nur: dieses Tor oeffnet JEDEN
   * Kontext mit `reducedMotion: 'reduce'`, und die App setzt darunter
   * `--d-schirm` auf 1 ms. Gewartet wurde also 450 ms auf einen Uebergang,
   * den es in diesem Kontext gar nicht gibt - 21 Bildschirme mal sieben
   * Groessen, 66 der 183 Sekunden des ganzen Tores.
   *
   * Jetzt eine Bedingung statt einer Zahl: keine laufende Animation mehr
   * (die endlosen ausgenommen - der Zielpuls und das Huepfen des Zeigers
   * hoeren nie auf, darauf zu warten hiesse, nie weiterzumachen), dann
   * zwei Bilder Ruhe, damit der Grundriss steht. Unter `reduce` ist das
   * sofort wahr, ohne `reduce` wartet es so lange wie noetig - und nicht
   * eine feste Zahl, die zu kurz oder zu lang ist.
   *
   * Was dabei blind gewartet wird, steht am Ende in der Ausgabe. Eine
   * feste Pause, die niemand sieht, waechst nach. */
  const schau = async (name) => {
    const angehalten = Date.now();
    await p.waitForFunction(() => {
      const s = document.querySelector('.schirm.da');
      if (!s) return false;
      return !document.getAnimations().some(a => a.playState === 'running'
        && a.effect?.getTiming().iterations !== Infinity);
    }, null, { timeout: 5000 }).catch(() => {});
    await p.evaluate(() => new Promise(f =>
      requestAnimationFrame(() => requestAnimationFrame(f))));
    ruhe.ms += Date.now() - angehalten; ruhe.n++;
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
    for (const x of r.stempel || []) meldungen.push(`${name}: ${x}`);
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
    if (r.wand && r.wand.versatz > 2)
      meldungen.push(`${name}: die letzte Reihe steht ${r.wand.versatz} px aus der Mitte `
        + '— eine halb leere Reihe am linken Rand sieht aus wie ein Fehler, '
        + 'nicht wie das Ende einer Liste');
    /* Die RATSCHE: eine Wand darf keinen Platz verlieren.
     *
     * Ohne sie war die Kapazitaet nur eine Zahl im Lauf. Die Gegenprobe
     * „das schmale Fenster bekommt wieder zwei Spalten" hat das sofort
     * gezeigt: der Eingriff kam an, die Kapazitaet fiel von 15 auf 10 -
     * und `passt` blieb gruen, weil zehn Kacheln nun einmal noch
     * hineinpassen. Ein Tor, das einen Rueckschritt sieht und schweigt,
     * beweist an dieser Stelle nichts.
     *
     * Es ist kein Soll, sondern ein Stand: was einmal gepasst hat, muss
     * weiter passen. Wer absichtlich enger baut, bestaetigt mit
     * `npm run passt -- --neu`. */
    if (r.wand) {
      const k = `${g.n} · ${name} · Kacheln`;
      const war = MASS_STAND[k];
      if (NEU) wandNeu[k] = r.wand.passt;
      else if (war !== undefined && r.wand.passt < war)
        meldungen.push(`${name}: die Wand trägt nur noch ${r.wand.passt} Kacheln statt `
          + `${war} — sie hat Platz verloren. War das Absicht, dann `
          + '`npm run passt -- --neu`');
      else if (war === undefined)
        meldungen.push(`${name}: HINWEIS diese Wand steht noch nicht in ${WAND_DATEI} `
          + `(${r.wand.passt} Kacheln) — `+ '`npm run passt -- --neu` trägt sie nach');
    }
    /* Und die Kachelbilder in dieselbe Ratsche - zwei Zahlen je Bild:
     * wie GROSS es gezeichnet wird (darf nicht kleiner werden) und wieviel
     * davon UNTER DEM NAMEN liegt (darf nicht mehr werden).
     *
     * Die zweite ist die eigentliche Auskunft dieser Runde. Gemessen auf
     * dem Zielgeraet: Nordamerika 78 %, Mittelamerika 66 %,
     * Bundeslaender 59 %, Kontinente 45 % - die laengsten Namen liegen
     * auf ihrem eigenen Bild. Eine feste Grenze waere hier falsch: die
     * Kachel ist 197 x 55 Punkte gross, und fuer einen langen Namen UND
     * ein Bild ist darin kein Platz. Was man verlangen kann, ist, dass es
     * nicht schlimmer wird. */
    for (const z of (r.zeichen || [])) {
      for (const [was, ist, richtung] of [
        [`${z.was} · Bild pt`, z.breit, 'grosser'],
        [`${z.was} · Bild unterm Namen %`, z.unterm, 'kleiner'],
      ]) {
        const k = `${g.n} · ${name} · ${was}`;
        const war = MASS_STAND[k];
        if (NEU) { wandNeu[k] = ist; continue; }
        if (war === undefined) continue;   // neu — der HINWEIS unten sagt es
        const schlechter = richtung === 'grosser' ? ist < war : ist > war;
        if (schlechter)
          meldungen.push(`${name}: „${z.was}" — ${was.split(' · ')[1]} steht auf ${ist} `
            + `statt ${war}. War das Absicht, dann \`npm run passt -- --neu\``);
      }
    }
    if (r.kleber) {
      const k = `${g.n} · ${name} · Aufkleber pt`;
      const war = MASS_STAND[k];
      if (NEU) wandNeu[k] = r.kleber.pt;
      else if (war !== undefined && r.kleber.pt < war)
        meldungen.push(`${name}: die ${r.kleber.n} Beispielkarten sind auf `
          + `${r.kleber.pt} pt geschrumpft (waren ${war}) — das Gitter ist `
          + 'zusammengerutscht. War das Absicht, dann `npm run passt -- --neu`');
      else if (war === undefined)
        meldungen.push(`${name}: HINWEIS diese Beispielkarten stehen noch nicht in `
          + `${WAND_DATEI} (${r.kleber.pt} pt) — `
          + '`npm run passt -- --neu` trägt sie nach');
      kleberZeilen.push(`      ${name.padEnd(22)} ${String(r.kleber.n).padStart(2)} Karten · `
        + `kürzeste Seite ${r.kleber.pt} pt`);
    }
    /* Und ein HINWEIS, kein Fehler: dass es heute passt, hat das Tor oben
     * schon geprueft. Hier steht, wieviel noch dazukann - und zwar bevor
     * jemand die naechste Ebene baut und sich wundert. Rot waere falsch:
     * die Wand ist in Ordnung, sie ist nur voll. Zwei, weil eine einzelne
     * Kachel Luft niemandem reicht, um zu planen. */
    if (r.wand && r.wand.mehr < 2)
      meldungen.push(`${name}: HINWEIS die Wand ist voll — ${r.wand.heute} Kacheln stehen `
        + `da, ${r.wand.passt} passen. Die ${r.wand.passt + 1}. läuft hier aus dem Bild`);
    if (r.wand) luftZeilen.push(`      ${name.padEnd(22)} `
      + `${String(r.wand.heute).padStart(2)} Kacheln, ${r.wand.jeReihe} je Reihe, `
      + `${r.wand.reihen} Reihen · Platz für ${r.wand.gedeckelt ? '≥ ' : ''}${r.wand.passt}`
      + ` · letzte Reihe ${r.wand.versatz} px aus der Mitte`);
    /* Die Wasserzeichen. Erst nur ansagen, was gemessen wurde - die
     * Schwellen stehen weiter unten und wurden an diesen Zahlen gesetzt,
     * nicht umgekehrt. */
    for (const z of (r.zeichen || [])) {
      zeichenZeilen.push(`      ${name.padEnd(22)} ${z.was.padEnd(18)} `
        + `${String(z.breit).padStart(3)}×${String(z.hoch).padEnd(3)} pt `
        + `(${String(z.anteil).padStart(2)} % der Kachel) · `
        + `abgeschnitten ${String(z.ab).padStart(3)} % · verdeckt ${String(z.zu).padStart(3)} %`
        + ` · unter dem Namen ${String(z.unterm).padStart(3)} %`
        + (z.wer ? `  (${z.wer})` : ''));
      if (z.ab > ZEICHEN_AB) meldungen.push(`${name}: vom Kachelbild „${z.was}" sind `
        + `${z.ab} % abgeschnitten (erlaubt ${ZEICHEN_AB}) — für ein Kind, das noch nicht `
        + `liest, IST dieses Bild der Name`);
      if (z.zu > ZEICHEN_ZU) meldungen.push(`${name}: vom Kachelbild „${z.was}" sind `
        + `${z.zu} % verdeckt (erlaubt ${ZEICHEN_ZU}) — darauf liegt ${z.wer}`);
    }
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

  /* Und das Diktat (N3): derselbe Bildschirm ohne Vorlage, dafuer mit
     einem vierten Knopf („Noch mal hören"). Vier Knoepfe neben einem
     quadratischen Feld sind auf 844 x 390 nicht selbstverstaendlich. */
  await tipp('[data-ebene="schreiben:diktat"]');
  await p.waitForSelector('.schirm.da #los, .schirm.da .schreibblatt', { timeout: 20000 });
  if (await p.$('.schirm.da #los')) {
    await schau('Vorlauf diktat');
    await durchVorlauf(p);
  }
  await p.waitForSelector('.schirm.da .schreibblatt');
  await schau('Diktat');
  await tipp('.schirm.da #zur');
  await p.waitForSelector('.schirm.da #null');
  await tipp('.schirm.da #raus');
  await p.waitForSelector('.schirm.da [data-ebene]');

  /* Und die Zahlen (N4) - der einzige Bildschirm mit ZWEI Schreibfeldern.
   *
   * Er ist die engste Stelle der Schreibwelt: zwei quadratische Kaesten
   * nebeneinander und daneben vier Knoepfe. Welche Zahl gerade drankommt,
   * entscheidet der Leitner; bei einer einstelligen steht nur ein Kasten
   * da. Also wird weitergeblaettert, bis eine zweistellige kommt - der
   * Fall, um den es geht, wird nicht dem Zufall ueberlassen. */
  await tipp('[data-ebene="schreiben:zahlen"]');
  await p.waitForSelector('.schirm.da #los, .schirm.da .schreibblatt', { timeout: 20000 });
  if (await p.$('.schirm.da #los')) {
    await schau('Vorlauf zahlen');
    await durchVorlauf(p);
  }
  await p.waitForSelector('.schirm.da .schreibblatt');
  for (let n = 0; n < 12; n++) {
    if ((await p.$$('.schirm.da .feldkasten')).length > 1) break;
    await tipp('.schirm.da #weissnicht');
    /* Warten, bis die naechste Aufgabe steht - an einer Bedingung, nicht
     * an einer Zahl.
     *
     * Hier stand `waitForTimeout(1500)`. Wonach die Zahl gewaehlt war,
     * stand nirgends, und sie war entweder zu lang (dann kostet sie) oder
     * zu kurz (dann laeuft die Schleife zwoelfmal durch und meldet
     * „keine zweistellige gekommen", obwohl es sie gab). Ich habe es mit
     * 600 ms ausprobiert: genau der zweite Fall, auf allen sieben
     * Groessen.
     *
     * Die Sache selbst ist am DOM abzulesen. `aufloesen()` setzt die
     * Frage auf `.loesung` und laesst sie stehen, bis die naechste
     * Aufgabe den Bildschirm neu baut. Also: keine `.loesung` mehr und
     * wieder ein Schreibblatt da. Das kann nicht zu kurz sein. */
    await p.waitForFunction(() => {
      const s = document.querySelector('.schirm.da');
      return !!(s && !s.querySelector('.loesung') && s.querySelector('.schreibblatt'));
    }, null, { timeout: 12000 }).catch(() => {});
  }
  if ((await p.$$('.schirm.da .feldkasten')).length < 2)
    meldungen.push('Zahlen: nach zwölf Aufgaben kam keine zweistellige — '
      + 'dann ist der Bildschirm mit zwei Feldern ungeprüft');
  await schau('Zahlen (zweistellig)');
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
  /* Die Hinweise standen bisher NUR im roten Zweig - also genau dann
   * nicht da, wenn das Tor gruen ist. Ein Hinweis, den man nur zu sehen
   * bekommt, wenn ohnehin etwas kaputt ist, ist keiner. */
  meldungen.filter(m => m.includes('HINWEIS')).forEach(m =>
    console.log(`          · ${g.n}: ${m}`));
  if (process.argv.includes('--hinweise'))
    meldungen.filter(m => m.includes('HINWEIS')).forEach(m => console.log(`            ${m}`));
  // Die Dauer je Groesse steht mit da: sie ist die Zahl, nach der
  // `--teil` verteilt, und ohne sie waere die Verteilung geraten.
  const dauer = `${((Date.now() - angefangen) / 1000).toFixed(1)} s`;
  if (echte.length) {
    console.log(`    ROT   ${g.n.padEnd(16)} ${g.w}×${g.h} — ${echte.length} nicht erreichbar`
      + `  ${dauer}`);
    echte.forEach(m => console.log(`            ${m}`));
    fehler.push(...echte.map(m => `${g.n}: ${m}`));
  } else {
    console.log(`    grün  ${g.n.padEnd(16)} ${g.w}×${g.h}${' '.repeat(10)}${dauer}`);
  }
  await ctx.close();
}
await b.close(); server.close();

if (luftZeilen.length) {
  console.log('    Wieviel passt in die Kachelwände (nachgezählt, nicht gerechnet):');
  [...new Set(luftZeilen)].sort().forEach(z => console.log(z));
}
if (kleberZeilen.length) {
  console.log('    Die Beispielkarten im Vorlauf:');
  [...new Set(kleberZeilen)].sort().forEach(z => console.log(z));
}
if (zeichenZeilen.length) {
  console.log(`    Die Kachelbilder (erlaubt: abgeschnitten ${ZEICHEN_AB} %, `
    + `verdeckt ${ZEICHEN_ZU} %):`);
  // Je Bild EINE Zeile, auch wenn es auf fuenf Groessen gemessen wurde -
  // gezeigt wird der schlechteste Fall, denn der entscheidet.
  const je = new Map();
  for (const z of zeichenZeilen) {
    const k = z.slice(0, 60);
    if (!je.has(k) || je.get(k) < z) je.set(k, z);
  }
  [...je.values()].sort().forEach(z => console.log(z));
}
console.log(`    Gewartet: ${(ruhe.ms / 1000).toFixed(1)} s auf Ruhe in ${ruhe.n} Aufnahmen, `
  + `${(blind.ms / 1000).toFixed(1)} s blind in ${blind.n} festen Pausen`);
console.log(`    ${MEINE.length} Größen × ${gesehen / MEINE.length} Bildschirme geprüft, `
  + `Karten füllen mindestens ${(KARTE_MIN*100).toFixed(0)} % ihres Kastens`
  + (zuKlein ? `, ${zuKlein} Trefferflächen unter ${MIN_PT} pt (Hinweis)` : ''));

if (NEU) {
  /* Nur der EIGENE Teillauf wird geschrieben, der Rest bleibt stehen -
   * sonst loescht ein `--teil=0/5 --neu` die vier anderen Fuenftel. */
  const alles = { ...MASS_STAND, ...wandNeu };
  fs.writeFileSync(WAND_DATEI, JSON.stringify(Object.fromEntries(
    Object.entries(alles).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');
  console.log(`\n  ${Object.keys(wandNeu).length} Wände in ${WAND_DATEI} festgehalten `
    + `(${Object.keys(alles).length} insgesamt).\n`);
  process.exit(0);
}
if (fehler.length) {
  console.log(`\n  ${fehler.length} FEHLER: Elemente laufen über den Rand.`);
  console.log('  `overflow:auto` zählt nicht als Lösung — ein Kind scrollt nicht in einer');
  console.log('  Liste, von der es nicht weiß, dass sie weitergeht. Und ein verdeckter');
  console.log('  Knopf ist sichtbar und trotzdem nicht zu treffen.');
  process.exit(1);
}
console.log(`\n  passt grün: auf ${TEIL ? `${MEINE.length} von ${GERAETE.length}` : `allen ${GERAETE.length}`} `
  + 'Größen ist alles im Bild.');
