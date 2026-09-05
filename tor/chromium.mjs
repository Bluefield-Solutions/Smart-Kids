// Der Browser wird NICHT heruntergeladen, sondern der vorhandene benutzt.
// Playwright erwartet eine bestimmte Bauzahl; die des Bildes weicht ab.
// Ein Tor, das sich beim Fehlen des Werkzeugs still ueberspringt, ist
// schlimmer als keines - deshalb bricht das hier ab statt gruen zu melden.
import fs from 'node:fs';
import { chromium } from 'playwright';

const KANDIDATEN = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
];
export function chromiumPfad() {
  return KANDIDATEN.find(x => fs.existsSync(x)) || null;
}
/* Regel 16: der Runner und dieser Rechner muessen denselben Browser fahren.
 *
 * Sonst heisst gruen an zwei Orten Verschiedenes - und das ist keine
 * Sorge, sondern ein Befund: am Tag der Entdeckung lief hier Chromium
 * 141 und auf dem Runner 151, `passt` und `lesbarkeit` waren dort rot und
 * hier gruen, und achtzehn Auslieferungen sind nacheinander gescheitert.
 *
 * Aufgeschrieben stand die Regel danach in CLAUDE.md. Das reicht nicht:
 * eine Regel, die nur in einem Dokument steht, wird gebrochen - es genuegt
 * ein `npm update`. Also wird sie gemessen.
 *
 * Gemessen wird nicht die Bauzahl im Pfad und nicht die Fassung von
 * Playwright, sondern die Fassung des Browsers, der WIRKLICH gestartet
 * ist, gegen die, die dieses Playwright erwartet (`browsers.json`). Hier
 * im Bild liegt ein fertiger Chromium an fester Stelle; auf dem Runner
 * holt `playwright install` seinen eigenen. Stimmen beide mit
 * `browsers.json` ueberein, stimmen sie miteinander ueberein - und die
 * Pruefung geht an beiden Orten, ohne sich an einem still zu ueberspringen.
 *
 * Einmal je Prozess, nicht je Browser: `version()` kostet nichts, aber
 * zwanzig gleiche Zeilen im Protokoll kosten Lesbarkeit.
 */
let browserGeprueft = false;
async function gleicherBrowser(b) {
  if (browserGeprueft) return;
  browserGeprueft = true;
  let soll = null;
  try {
    const j = JSON.parse(fs.readFileSync(
      new URL('../node_modules/playwright-core/browsers.json', import.meta.url), 'utf8'));
    soll = (j.browsers || []).find(x => x.name === 'chromium');
  } catch { /* faellt unten auf die Meldung */ }
  if (!soll) throw new Error('browsers.json von playwright-core ist nicht zu lesen — '
    + 'ohne sie ist nicht zu sagen, welcher Browser hier erwartet wird (Regel 16).');
  const ist = b.version();
  if (ist !== soll.browserVersion)
    throw new Error(`Chromium ${ist} laeuft, ${soll.browserVersion} (Bau ${soll.revision}) `
      + 'wird von diesem Playwright erwartet — dann faehrt der Runner einen anderen Browser '
      + 'als dieser Rechner, und gruen heisst an beiden Orten Verschiedenes (Regel 16). '
      + 'Entweder die Playwright-Fassung auf die des vorhandenen Browsers zurueckziehen '
      + 'oder den Browser nachziehen (`npx playwright install chromium`).');
}

export async function starte(opt = {}) {
  // Hier im Bild liegt ein fertiger Chromium an bekannter Stelle, dessen
  // Bauzahl aber nicht die ist, die Playwright erwartet - deshalb der
  // ausdrueckliche Pfad. Auf dem Runner gibt es ihn nicht; dort loest
  // Playwright selbst auf (`npx playwright install chromium` im Ablauf).
  //
  // Was NICHT passiert: sich still ueberspringen. Findet weder das eine
  // noch das andere einen Browser, bricht das Tor ab. Ein Tor, das bei
  // fehlendem Werkzeug gruen meldet, ist schlimmer als keines.
  const pfad = chromiumPfad();
  let b;
  try {
    b = await chromium.launch(pfad ? { executablePath: pfad, ...opt } : opt);
  } catch (e) {
    throw new Error('Kein Chromium gefunden — das Tor kann nicht laufen. '
      + `Auf einem Runner hilft \`npx playwright install --with-deps chromium\`. (${e.message})`);
  }
  // NACH dem `catch`: eine falsche Browserfassung ist kein fehlendes
  // Werkzeug, und die Meldung darf nicht in „Kein Chromium gefunden"
  // umgeschrieben werden.
  await gleicherBrowser(b);
  return b;
}

/* Der kleine Server, der `dist/` ausliefert.
 *
 * Stand SECHSMAL im Verzeichnis - in jedem Tor, das einen Browser
 * startet, Zeile fuer Zeile dieselbe. Und er hatte sechsmal denselben
 * Fehler: `q.url === '/' ? '/index.html' : q.url.split('?')[0]` liefert
 * fuer `/?flott` den Pfad `/` - ein Verzeichnis, also 404. Aufgefallen
 * ist das erst, als die Adresse zum ersten Mal eine Frage trug.
 *
 * Erst zerlegen, DANN auf `/` pruefen. Und einmal, nicht sechsmal.
 */
/**
 * Ein Server fuer die Tore.
 *
 * `erreichbar()` schaltet das Netz ab - siehe unten, warum die Leitung
 * dabei abreissen muss.
 *
 * `verzug()` macht es LANGSAM, ohne es abzuschalten, und gibt die
 * Millisekunden je Anfrage zurueck. Das ist der andere Fall, und er ist
 * der gefaehrlichere: eine tote Leitung merkt man, eine muede nicht. Der
 * Service Worker hat auf ihr die App nie erneuert (siehe `sw.js`), und
 * das ist auf dem Geraet der Kinder monatelang niemandem aufgefallen -
 * es sah ja aus, als liefe alles.
 */
export async function serviere(wurzel, erreichbar = () => true, verzug = () => 0) {
  const { default: fs2 } = await import('node:fs');
  const { default: path2 } = await import('node:path');
  const { default: http2 } = await import('node:http');
  const TYP = { '.html':'text/html; charset=utf-8', '.css':'text/css',
    '.js':'text/javascript', '.png':'image/png', '.woff2':'font/woff2',
    '.json':'application/json', '.webmanifest':'application/manifest+json' };
  const server = http2.createServer(async (q, a) => {
    /* Das Netz kann weg sein.
     *
     * `erreichbar()` ist kein Beiwerk: das Tor `offline` prueft, ob die
     * App aus ihrem Lager startet, und dafuer muss die Leitung wirklich
     * abreissen - eine 404 waere eine ANTWORT, und der Service Worker
     * verhaelt sich dann anders. Beim Zusammenlegen der sechs Server ist
     * genau diese Zeile fast verlorengegangen; `offline` wurde rot und
     * hat es gemeldet. */
    if (!erreichbar()) { q.socket.destroy(); return; }
    const ohneFrage = String(q.url).split('?')[0];
    const warten = verzug(ohneFrage);
    if (warten > 0) await new Promise(r => setTimeout(r, warten));
    const datei = path2.join(wurzel, ohneFrage === '/' ? '/index.html' : ohneFrage);
    if (!datei.startsWith(wurzel) || !fs2.existsSync(datei) || fs2.statSync(datei).isDirectory()) {
      a.statusCode = 404; return a.end();
    }
    a.setHeader('content-type', TYP[path2.extname(datei)] || 'text/plain');
    a.end(fs2.readFileSync(datei));
  });
  await new Promise(r => server.listen(0, r));
  return { server, adresse: `http://127.0.0.1:${server.address().port}/` };
}

/* Der Weg zur Ebenenwahl — seit D4 fuehrt er ueber die Weltenwahl.
 *
 * Sechs Tore klicken sich nach der Profilwahl in eine Ebene. Stuende der
 * neue Zwischenschritt in jedem einzeln, waere er sechsmal aufgeschrieben
 * und beim naechsten Umbau fuenfmal gepflegt. Deshalb hier, einmal.
 *
 * Die Zuordnung Ebene -> Welt steht in `spiel.js` an `art`; hier wird sie
 * an der KENNUNG abgelesen. Das ist dieselbe Auskunft an zwei Orten und
 * damit die Sorte Doppelung, die dieses Verzeichnis fuerchtet - aber ein
 * Tor, das die Antwort aus dem Prueflig holt, prueft sie nicht mehr. Der
 * Rauchtest sieht deshalb zusaetzlich nach, dass keine Kachel in der
 * falschen Welt steht und dass es beide Welten gibt.
 */
const ENGLISCHE_EBENEN = ['englisch', 'freunde', 'wendungen', 'hoersatz'];
export const WELT_VON = (ebene) => String(ebene).startsWith('rechnen') ? 'rechnen'
                                : String(ebene).startsWith('schreiben') ? 'schreiben'
                                : ENGLISCHE_EBENEN.some(e => String(ebene).startsWith(e))
                                  ? 'englisch'
                                : 'erdkunde';

/* Von der Weltenwahl in die Ebenenwahl der Welt, in der `ebene` liegt.
 *
 * Seit Q17 kann dort eine GRUPPENKACHEL stehen: die beiden Hauptstadt-
 * Ebenen teilen sich eine Kachel und fragen beim Antippen, wohin. Wer
 * eine Ebene sucht, die dahinter liegt, muss also einen Schritt weiter -
 * und weil es sonst in fuenf Toren zweimal und mehr dastuende und dann
 * einmal veraltet (Regel 6), steht es hier.
 *
 * Gesucht wird nicht geraten: liegt die Kachel offen da, wird nichts
 * getan; liegt sie nicht da und es gibt eine Gruppe mit demselben Anfang,
 * wird die geoeffnet. Fionas Kachel fuehrt direkt hinein - fuer sie gibt
 * es keine Gruppe, und dieser Zweig laeuft leer. */
export async function zurEbenenwahl(seite, ebene = 'kontinente') {
  await seite.waitForSelector('.schirm.da [data-welt]', { timeout: 15000 });
  await alleinIm(seite);
  await seite.click(`.schirm.da [data-welt="${WELT_VON(ebene)}"]`);
  await seite.waitForSelector('.schirm.da [data-ebene]', { timeout: 15000 });
  await alleinIm(seite);
  await durchGruppe(seite, ebene);
}

/** Steht die Ebene hinter einer Gruppenkachel? Dann diese oeffnen. */
export async function durchGruppe(seite, ebene) {
  const da = await seite.$(`.schirm.da [data-ebene="${ebene}"]:not([data-gruppe])`);
  if (da) return false;
  const gruppe = String(ebene).split(':')[0];
  if (!(await seite.$(`.schirm.da [data-gruppe="${gruppe}"]`))) return false;
  // Nicht ueber einen GRIFF klicken: zwischen `$` und `click` kann der
  // Bildschirm gewechselt haben, und ein Griff auf ein Element, das nicht
  // mehr am Baum haengt, wirft „not attached to the DOM".
  await seite.$eval(`.schirm.da [data-gruppe="${gruppe}"]`, x => x.click());
  /* Gewartet wird auf die Kachel OHNE Gruppenkennung.
   *
   * `[data-ebene="hauptstaedte"]` allein taugt nicht: die Gruppenkachel,
   * die wir gerade verlassen, traegt dieselbe Kennung und liegt die
   * Ueberblendung lang noch da. Das Warten waere sofort vorbei, und der
   * naechste Griff ginge ins Leere - unter Last zuverlaessig. */
  await seite.waitForSelector(
    `.schirm.da [data-ebene="${ebene}"]:not([data-gruppe])`, { timeout: 15000 });
  await alleinIm(seite);
  return true;
}

/* Von der Ebenenwahl in die AUFGABE — seit R3 fuehrt er ueber den Vorlauf.
 *
 * Dieselbe Geschichte wie bei `zurEbenenwahl`: ein neuer Zwischenschritt,
 * und fuenf Tore klicken sich daran vorbei. Stuende er in jedem einzeln,
 * waere er fuenfmal aufgeschrieben und beim naechsten Umbau viermal
 * gepflegt.
 *
 * Der Vorlauf erscheint beim ERSTEN Betreten einer Ebene je Kind. Ein Tor
 * faengt fast immer frisch an, sieht ihn also - aber eben nicht immer
 * (der Rauchtest spielt eine Ebene mehrfach). Deshalb wird nachgesehen und
 * nicht angenommen.
 */
export async function durchVorlauf(seite) {
  const los = await seite.$('.schirm.da #los');
  if (!los) return false;
  await seite.$eval('.schirm.da #los', x => x.click());
  await alleinIm(seite);
  return true;
}

/** Eine Ebene oeffnen und bis zur ersten Aufgabe durchgehen. */
export async function zurAufgabe(seite, ebene) {
  await seite.$eval(`.schirm.da [data-ebene="${ebene}"]`, x => x.click());
  // Der Vorlauf braucht einen Augenblick: er laedt die Karte nach.
  await seite.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel, '
    + '.schirm.da .rechnung', { timeout: 20000 });
  await durchVorlauf(seite);
  await seite.waitForSelector(String(ebene).startsWith('rechnen')
    ? '.schirm.da .rechnung' : '.schirm.da .karte svg path.ziel', { timeout: 20000 });
}

/* Warten, bis der VORIGE Bildschirm weg ist.
 *
 * `zeige()` blendet ueber: der alte Bildschirm bleibt rund 340 ms liegen
 * und faengt Tipper ab. Der erste Anlauf klickte deshalb auf die
 * Weltenkarte und traf die Profilkachel darueber - Playwright meldete
 * „subtree intercepts pointer events", und vier Antwortwege fehlten.
 *
 * Nicht mit einer festen Wartezeit geloest, sondern an der Sache: es ist
 * erst einer da. Eine Zahl waere auf einem langsameren Rechner zu kurz
 * und hier zu lang.
 */
async function alleinIm(seite) {
  await seite.waitForFunction(() => document.querySelectorAll('.schirm').length === 1,
    null, { timeout: 5000 }).catch(() => {});
}

/* ---- Schreiben (N2a) ---------------------------------------------------
 *
 * Zwei Tore und ein Blickwerkzeug muessen einen Zug mit dem Zeiger
 * nachfahren. Der Weg dorthin ist derselbe wie beim Ziehen auf der Karte:
 * die Punkte stehen in KASTENPUNKTEN (0..100), und die Abbildung auf den
 * Bildschirm macht `getScreenCTM` - dieselbe Matrix, die die App benutzt.
 * Wer stattdessen den Rahmen des Feldes gegen 100 rechnet, setzt voraus,
 * dass es quadratisch IST; das war es einmal nicht, und der Zeiger landete
 * lautlos daneben.
 */
export const schreibVorlage = (seite) =>
  seite.$$eval('.schirm.da .vorlage path', p => p.map(x => x.getAttribute('d')));

export async function zeichneZug(seite, punkte, feld = 0) {
  const auf = await seite.evaluate(({ pts, feld }) => {
    // Seit N4 kann es ZWEI Schreibfelder geben - eines je Ziffer.
    const svg = document.querySelectorAll('.schirm.da .schreibblatt')[feld];
    if (!svg) return null;
    const m = svg.getScreenCTM();
    return pts.map(([x, y]) => {
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(m); return [q.x, q.y];
    });
  }, { pts: punkte, feld });
  if (!auf) throw new Error(`zeichneZug: kein Schreibfeld ${feld} auf dem Bildschirm`);
  await seite.mouse.move(...auf[0]);
  await seite.mouse.down();
  for (const b of auf.slice(1)) await seite.mouse.move(...b);
  await seite.mouse.up();
}

/* Die umgekehrte Frage (B3): „Wo liegt Bayern?"
 *
 * Sie steht bei jeder dritten Aufgabe fuer alle, die lesen - und sie sieht
 * anders aus als jede andere: kein hervorgehobenes Gebiet, kein Etikett,
 * kein Tippfeld. Wer eine Sitzung durchspielt, muss sie deshalb erkennen
 * UND beantworten koennen, sonst bleibt er an der dritten Aufgabe stehen.
 *
 * Beides steht hier und nicht in jedem Tor einzeln: `ansicht` und `smoke`
 * spielen dieselbe Sitzung, und zwei Fassungen derselben Antwort waeren
 * zwei Stellen, an denen sie auseinanderlaufen.
 */
export async function istUmgekehrt(seite) {
  return seite.evaluate(() => {
    const f = document.querySelector('.schirm.da #frage');
    return !!f && /^Wo liegt /.test(f.textContent.trim());
  });
}

/**
 * Ein Punkt, an dem das gesuchte Gebiet WIRKLICH obenauf liegt.
 *
 * Nicht sein Anker: der ist die Stelle, an der die Beschriftung haengt,
 * und bei einem kleinen Gebiet liegt dort der groessere Nachbar darueber.
 * `loese()` hat genau daran gescheitert - das Etikett wurde auf Berlins
 * Anker gezogen, gelandet ist es auf Brandenburg, und der Rauchtest
 * meldete eine Zeitueberschreitung statt „daneben". Regel 12: ein Raster
 * ist nur so fein wie sein kleinstes Ziel.
 *
 * Gesucht wird in dieser Reihenfolge: der entkoppelte Trefferkreis (den
 * gibt es fuer die vier kleinsten Gebiete), sonst eine Stelle im
 * Umrisskasten, an der `elementFromPoint` wirklich das Ziel liefert,
 * sonst die Mitte des Kastens.
 *
 * Der `durchgang` hatte diese Suche laengst - eingebaut in seine eigene
 * Auswertung. Sie steht jetzt einmal hier und wird von beiden benutzt;
 * zwei Fassungen davon waeren zwei, die getrennt veralten.
 */
export async function zielPunkt(seite) {
  return seite.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const ziel = s.querySelector('path.ziel');
    if (!ziel) return null;
    // 1. Der entkoppelte Trefferkreis. Den gibt es fuer die kleinen
    //    Gebiete, und er IST dort die Trefferflaeche.
    //    Seit den Nadeln koennen es ZWEI sein: der gekappte Kreis am Ort
    //    und die Nadel daneben. Genommen wird die groessere - das ist die
    //    Stelle, an der ein Kind wirklich zielt.
    const kreise = [...s.querySelectorAll(`#treffer circle[data-id="${ziel.dataset.id}"]`)]
      .map(c => c.getBoundingClientRect()).sort((a, b) => b.width - a.width);
    if (kreise.length) { const k = kreise[0];
      return { x: k.left + k.width / 2, y: k.top + k.height / 2 }; }
    // 2. Der Anker. Er ist die Mitte der Trefferflaeche, nach der das
    //    Spiel entscheidet - nicht der Umriss. Ein Punkt weit aussen auf
    //    einem grossen Land liegt zwar IM Umriss, aber schon im
    //    Trefferkreis des Nachbarn; genau daran hat der Abschnitt
    //    `spielen` gehangen, als hier nur das Raster stand.
    /* Und der Anker gilt nur, wenn das SPIEL an dieser Stelle auch das
       Ziel erkennt.
       Ungeprueft hat er den Abschnitt `abzeichen` gekippt: Brandenburgs
       Anker lag 1,8 Punkte neben dem Mittelpunkt von Berlins
       Trefferkreis (Radius 10), das Etikett landete auf Berlin, und der
       Rauchtest scheiterte an einem Datenfehler, ohne ihn zu benennen.
       Der Anker ist inzwischen berichtigt - aber ein Helfer, der einen
       Punkt zurueckgibt, ohne ihn zu pruefen, findet den naechsten
       solchen Fall wieder erst als Zeitueberschreitung. Geprueft wird
       mit derselben Regel, nach der das Spiel entscheidet: der
       Trefferkreis schlaegt den Umriss. */
    const gilt = (x, y) => {
      const e = document.elementFromPoint(x, y);
      if (!e || !e.closest) return false;
      const k = e.closest('#treffer circle');
      if (k) return k.dataset.id === ziel.dataset.id;
      const pf = e.closest('path.geb');
      return !!pf && pf.dataset.id === ziel.dataset.id;
    };
    try {
      const D = JSON.parse(document.getElementById('daten').textContent);
      const alle = [...D.kontinente, ...Object.values(D.laender).flat(), ...D.deutschland];
      const g = alle.find(x => (x.id || x.a3) === ziel.dataset.id);
      const svg = s.querySelector('.karte svg');
      if (g && g.anker && svg) {
        const pt = svg.createSVGPoint();
        pt.x = g.anker[0]; pt.y = g.anker[1];
        const q = pt.matrixTransform(svg.getScreenCTM());
        if (gilt(q.x, q.y)) return { x: q.x, y: q.y };
      }
    } catch (e) { /* dann weiter unten */ }
    // 3. Eine Stelle, an der das Ziel wirklich obenauf liegt.
    const bb = ziel.getBoundingClientRect();
    for (let n = 0; n <= 8; n++) for (let m = 0; m <= 8; m++) {
      const x = bb.left + bb.width * (n + .5) / 9, y = bb.top + bb.height * (m + .5) / 9;
      if (gilt(x, y)) return { x, y };
    }
    // 4. Und sonst die Mitte des Kastens.
    return { x: bb.left + bb.width / 2, y: bb.top + bb.height / 2 };
  });
}

/* --- Die Ablage im Browser --------------------------------------------
 *
 * `lernkiste` ist die einzige Datenbank, `fortschritt` und `protokoll`
 * sind ihre Laeden. Die sechs Zeilen zum Oeffnen standen bis P8 acht Mal
 * da, verteilt auf zwei Tore. Acht Fassungen desselben Aufrufs veralten
 * nicht gleichzeitig - und eine, die einen fehlenden Laden als „null
 * Stueck" liest, meldet gruen, wo gar nichts zu lesen war. Deshalb
 * unterscheiden beide Helfer „nichts drin" von „nicht lesbar": das erste
 * ist 0, das zweite -1.
 */

/**
 * Einen Ausgangsstand in die Ablage schreiben - vor dem Neuladen der Seite.
 *
 * `was` ist reine Datei: `{ laden: { schluessel: wert } }`. Wer etwas aus
 * der geladenen Seite braucht (die Kontinente, die Bundeslaender), liest
 * das vorher mit einem eigenen `evaluate` und baut den Stand hier draussen
 * - dann bleibt dieser Helfer ein Schreiber und wird nicht zum zweiten Ort,
 * an dem Spielwissen steht.
 *
 * Die vier Laeden werden angelegt, falls es die Ablage noch nicht gibt.
 * Fassung und Namen stehen in `src/profil/ablage.js`; sie hier
 * nachzuziehen ist Absicht - ein Tor, das die geprüfte Datei zum Anlegen
 * benutzt, kann nicht mehr zeigen, dass sie es falsch macht.
 *
 * Bis P8 stand dieser Block zwoelfmal im Rauchtest, und SIEBEN Fassungen
 * legten die Laeden nicht an: sie liefen nur, weil vorher schon jemand
 * anders die Ablage gebaut hatte. Genau so sieht eine Dopplung aus, die
 * nichts kostet - bis zu dem Tag, an dem der Abschnitt allein laeuft.
 */
export async function stelleAblage(seite, was) {
  return seite.evaluate((w) => new Promise((ja, nein) => {
    const auf = indexedDB.open('lernkiste', 1);
    auf.onupgradeneeded = () => {
      for (const l of ['profile', 'fortschritt', 'protokoll', 'einstellungen'])
        if (!auf.result.objectStoreNames.contains(l)) auf.result.createObjectStore(l);
    };
    auf.onsuccess = () => {
      const t = auf.result.transaction(Object.keys(w), 'readwrite');
      for (const [laden, eintraege] of Object.entries(w))
        for (const [schluessel, wert] of Object.entries(eintraege))
          t.objectStore(laden).put(wert, schluessel);
      t.oncomplete = ja; t.onerror = () => nein(t.error);
    };
    auf.onerror = () => nein(auf.error);
  }), was);
}

/** Alle Eintraege eines Ladens. `-1` heisst: nicht lesbar. */
export async function ausAblage(seite, laden) {
  return seite.evaluate((name) => new Promise(ja => {
    const a = indexedDB.open('lernkiste');
    a.onsuccess = () => { const d = a.result;
      if (!d.objectStoreNames.contains(name)) return ja(-1);
      const q = d.transaction(name, 'readonly').objectStore(name).getAll();
      q.onsuccess = () => ja(q.result); q.onerror = () => ja(-1); };
    a.onerror = () => ja(-1);
  }), laden);
}

/**
 * Der Stand unter EINEM Schluessel: „profil:ebene" -> Tafel je Gegenstand.
 *
 * `null` heisst: nicht lesbar. Ein leerer Stand ist `{}` - der Unterschied
 * zaehlt, denn „nichts gelernt" und „nicht nachgesehen" duerfen nicht
 * dieselbe Zahl ergeben.
 */
export async function standVon(seite, schluessel) {
  return seite.evaluate((sch) => new Promise(ja => {
    const a = indexedDB.open('lernkiste');
    a.onsuccess = () => { const d = a.result;
      if (!d.objectStoreNames.contains('fortschritt')) return ja(null);
      const g = d.transaction('fortschritt', 'readonly').objectStore('fortschritt').get(sch);
      g.onsuccess = () => ja(g.result || {});
      g.onerror = () => ja(null); };
    a.onerror = () => ja(null);
  }), schluessel);
}

/** Wieviele Gegenstaende stehen darunter? `-1`: nicht lesbar. */
export async function standGroesse(seite, schluessel) {
  const st = await standVon(seite, schluessel);
  return st ? Object.keys(st).length : -1;
}

/**
 * Das gesuchte Gebiet, sein Anker in Bildpunkten und der Platz seines
 * Etiketts in der Liste.
 *
 * Wer ein Etikett zieht, braucht beides: WOHIN (der Anker, umgerechnet in
 * Bildschirmpunkte) und WAS (das wievielte Etikett in der Liste). Stand bis
 * P8 in `ziehen` und in `ansicht` zweimal gleich da.
 *
 * Der Anker wird hier NICHT gegen `elementFromPoint` geprueft - anders als
 * in `zielPunkt`, und mit Absicht: beide Aufrufer ziehen bewusst daneben
 * und messen die Nachsicht. Sie brauchen den ungeschoenten Punkt aus den
 * Daten, nicht den naechstbesten, an dem das Spiel das Ziel erkennt.
 */
export async function zielUndEtikett(seite) {
  return seite.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const z = s.querySelector('path.ziel');
    const svg = s.querySelector('.karte svg');
    const D = JSON.parse(document.getElementById('daten').textContent);
    const g = D.kontinente.find(x => x.id === z.dataset.id);
    const pt = svg.createSVGPoint(); pt.x = g.anker[0]; pt.y = g.anker[1];
    const q = pt.matrixTransform(svg.getScreenCTM());
    const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent);
    return { id: g.id, name: g.name, x: q.x, y: q.y, idx: namen.indexOf(g.name) };
  });
}

/**
 * Ein Profil waehlen, eine Ebene betreten, warten bis die Karte steht.
 *
 * Stand in `ziehen`, `ansicht` und im Rauchtest fast gleich - und einmal
 * sogar zweimal in derselben Datei, angelegt in der Runde P6. Das Tor
 * `doppelt` hat es beim ersten Lauf gemeldet, also noch am selben Tag.
 *
 * Das Warten auf `kartenGroesse()` ist der Grund, warum es EIN Helfer sein
 * muss: die Karte wird in zwei Bildern gesetzt, und wer den Anker vorher
 * liest, misst woanders. Genau daran hat die gemessene Nachsicht einmal
 * zwischen 60 und 80 Punkten geschwankt. Wer diesen Aufbau abschreibt,
 * laesst die Zeile irgendwann weg.
 */
export async function inEbene(seite, profil, ebene, { vorlauf = true } = {}) {
  await seite.waitForSelector(`[data-profil="${profil}"]`, { timeout: 20000 });
  await seite.click(`[data-profil="${profil}"]`);
  await zurEbenenwahl(seite, ebene);
  await seite.click(`[data-ebene="${ebene}"]`);
  await seite.waitForSelector('.schirm.da #los, .schirm.da .karte svg', { timeout: 25000 });
  if (vorlauf) await durchVorlauf(seite);
  await seite.waitForFunction(() => {
    const k = document.querySelector('.schirm.da .karte');
    return !!(k && k.style.width && parseFloat(k.style.width) > 0);
  }, null, { timeout: 8000 }).catch(() => {});
  await seite.waitForTimeout(150);
}

/** Beantwortet die umgekehrte Frage: auf das gesuchte Gebiet tippen. */
export async function zeigeAufKarte(seite) {
  const punkt = await seite.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const name = s.querySelector('#frage').textContent.trim()
      .replace(/^Wo liegt /, '').replace(/\?$/, '').trim();
    /* Gesucht wird die KENNUNG, nicht der Anker.
     *
     * Der eingebettete Datenblock haelt zu jedem Land Kennung und Name,
     * aber weder Umriss noch Anker - die kommen erst mit
     * `daten/laender-<kontinent>.json` dazu, und zwar in ein Objekt, das
     * dieser Helfer nicht sieht. Ein Anker aus `#daten` gibt es also nur
     * fuer Kontinente und Bundeslaender; der erste Anlauf suchte genau
     * ihn und warf auf jeder Laenderkarte „steht nicht in den Daten".
     * Aufgefallen ist das erst, als die umgekehrte Frage dort ueberhaupt
     * gestellt wurde (P10).
     *
     * Die Kennung reicht auch: alles Weitere steht am Bildschirm.
     */
    const D = JSON.parse(document.getElementById('daten').textContent);
    const alle = [].concat(...Object.values(D).filter(Array.isArray),
      ...Object.values(D.laender || {}).filter(Array.isArray));
    const geb = alle.find(x => x && x.name === name);
    if (!geb) return null;
    const id = geb.id || geb.a3;

    /* Getippt wird dort, wo ein KIND tippt: auf die groesste
       Trefferflaeche dieses Gebiets. Fuer die kleinen ist das seit den
       Nadeln der Kopf neben der Karte - der Anker selbst ist vier
       Bildpunkte gross, und ein Tor, das ihn punktgenau trifft, bewiese
       etwas, das kein Finger kann. */
    const kreise = [...s.querySelectorAll(`#treffer circle[data-id="${id}"]`)]
      .map(c => c.getBoundingClientRect()).sort((a, b) => b.width - a.width);
    if (kreise.length) { const k = kreise[0];
      return { name, id, x: k.left + k.width / 2, y: k.top + k.height / 2,
               breit: +k.width.toFixed(1) }; }

    // Sonst eine Stelle IM Gebiet, an der das Spiel es auch erkennt.
    const pf = s.querySelector(`path.geb[data-id="${id}"]`);
    if (!pf) return null;
    const bb = pf.getBoundingClientRect();
    const trifft = (x, y) => {
      const e = document.elementFromPoint(x, y);
      const p = e && e.closest && e.closest('path.geb');
      return !!p && p.dataset.id === id;
    };
    for (let n = 0; n <= 6; n++) for (let m = 0; m <= 6; m++) {
      const x = bb.left + bb.width * (n + .5) / 7, y = bb.top + bb.height * (m + .5) / 7;
      if (trifft(x, y)) return { name, id, x, y, breit: 0 };
    }
    return { name, id, x: bb.left + bb.width / 2, y: bb.top + bb.height / 2, breit: 0 };
  });
  if (!punkt) throw new Error('umgekehrte Frage: das gesuchte Gebiet steht nicht in den Daten');
  await seite.mouse.click(punkt.x, punkt.y);
  return punkt.name;
}

/* Ist die EIGENE Schrift geladen? (Q14)
 *
 * `document.fonts.check()` reicht nicht: er sagt nur, ob die angemeldeten
 * Faces geladen sind, und ohne Anmeldung ist die Menge leer - gruen, wo
 * nie eine Schrift kam. Gemessen wird deshalb die BREITE: ein Wort in der
 * gesuchten Schrift ist anders breit als dasselbe Wort in einer, die es
 * nicht gibt. Sind beide gleich breit, steht die Ersatzschrift da.
 *
 * Stand bis Q14 nur in `tor/ansicht.mjs` - und `ansicht` laeuft auf dem
 * Runner ausdruecklich NICHT. Damit war dort niemand da, der es merkt:
 * eine Ersatzschrift misst andere Zeilen, andere Umbrueche und andere
 * Kaesten, und `passt` und `lesbarkeit` melden dann Befunde, die nach
 * einem Fehler der App aussehen. Genau darueber ist die Auslieferung
 * einen Tag lang gestolpert (Regel 6: was zweimal dasteht, veraltet
 * einmal - hier stand es EINMAL, an der einzigen Stelle, die der Runner
 * nicht faehrt).
 */
export async function schriftDa(seite) {
  return seite.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([document.fonts.load('700 20px "Plus Jakarta Sans"'),
                       document.fonts.load('400 20px "Andika"')]);
    const messen = (fam) => {
      const e = document.createElement('span');
      e.textContent = 'Hamburgefonstiv 123';
      e.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;'
        + `font-size:40px;font-family:${fam}`;
      document.body.appendChild(e);
      const b = e.getBoundingClientRect().width;
      e.remove();
      return b;
    };
    const ersatz = messen('"gibtesnicht-4711", sans-serif');
    return messen('"Plus Jakarta Sans", "gibtesnicht-4711", sans-serif') !== ersatz
        && messen('"Andika", "gibtesnicht-4711", sans-serif') !== ersatz;
  });
}
