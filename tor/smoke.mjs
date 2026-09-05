// Rauchtest. Spielt den Prototyp wirklich - und prueft, was M3 bis M6
// zugesagt haben: dass der Fortschritt einen Neustart ueberlebt, dass das
// Forscherbuch fuellt, dass der Elternbereich Zahlen zeigt.
import { istUmgekehrt, zeigeAufKarte, zielPunkt, starte, zurEbenenwahl, durchGruppe,
         WELT_VON, durchVorlauf, serviere, schreibVorlage, zeichneZug,
         ausAblage, standVon, standGroesse, stelleAblage } from './chromium.mjs';
import * as Schreiben from '../src/inhalt/schreiben.js';
import * as Protokoll from '../src/protokoll/protokoll.js';
import { ELTERN_VERGLEICH } from './gestellt.mjs';
import { teilVon, meldeTeil } from './teilen.mjs';
import { fremdgriff, griffBeobachter } from './fremdgriff.mjs';
import * as Rechnen from '../src/inhalt/rechnen.js';
// Welche Kontinente in welcher Runde kommen, steht in den Daten.
import { KONTINENTE, LAENDER } from '../src/inhalt/erdkunde.js';
// Die sechzehn Kennungen der Bundeslaender - gebraucht, um einen Stand zu
// stellen, in dem ein Abzeichen verdient IST.
import { STAEDTE } from '../src/geo/staedte.js';
import { hoerAbgleich, GRENZE_NAH } from '../src/vergleich/vergleich.js';
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

/* Wieviel einer Kapitelseite im Forscherbuch benutzt sein muss (G15b).
 *
 * Eine RATSCHE, kein Soll aus der Referenz: es gibt keinen Wert, den ein
 * Vorbild vorgibt. Sie haelt nur fest, was schon erreicht ist, damit es
 * nicht unbemerkt zurueckfaellt. Der Anfangswert wird gemessen, nicht
 * gewaehlt: gemessen am 04.09. ueber alle sieben Kapitelseiten.
 *
 *   Abzeichen 18 → 38 %   Kontinente 86 %   Bundeslaender 94 %
 *   Minus 63 %            nachfahren 89 → 98 %   hoeren 42 → 47 %
 *   Als Naechstes 29 → 62 %
 *
 * Die Ratsche steht auf 35 und nicht auf 38: der schlechteste Wert haengt
 * daran, WAS ein Profil gerade gesammelt hat, und ein Buch mit einem
 * Gegenstand weniger darf nicht rot werden. 35 faengt trotzdem den
 * Rueckfall auf die 18 %, mit denen diese Runde angefangen hat. */
const BUCH_GENUTZT_MIN = 35;
/** Wieviele ruhende Bildschirme der Fremdgriff wirklich gesehen hat. */
const griffStand = { geprueft: 0, uebersprungen: 0, arten: {}, einmal: new Set() };

/* Wie schnell ist diese Maschine GERADE? (Q25)
 *
 * Jede Wartefrist hier ist in Millisekunden Wanduhr angegeben - „vier
 * Sekunden auf die Ansage". Das ist eine Wette darauf, wieviele Bilder die
 * App in vier Sekunden bekommt, und die Wette geht verloren, sobald die
 * Kette zehn Chromium auf vier Kernen faehrt: an einem Tag wurden die
 * Abnahmelaeufe dreimal rot, jedes Mal an einer anderen Frist, und
 * derselbe Teil lief allein in 94 s durch.
 *
 * Die Beckenbreite (Q24) nimmt den Druck weg. Die Fristen bleiben
 * trotzdem Wanduhr - und damit eine Wette auf die Maschine, auf der
 * jemand das Verzeichnis morgen faehrt.
 *
 * Gemessen wird deshalb der TAKT DER SEITE: wie lange ein Bild wirklich
 * braucht. Bei 16,7 ms ist der Faktor 1 und nichts aendert sich; bei 60 ms
 * ist er 3,6, und dieselbe Frist gibt der App wieder gleich viele Bilder.
 *
 * Gemessen wird nicht auf Vorrat, sondern erst, wenn eine Frist ABLAEUFT -
 * dann ist die Frage „lag es an der Maschine?" gestellt und die Antwort
 * einen halben Bildschirm wert. War sie nein, bleibt es beim Befund. */
/* Woran man erkennt, dass das Buch offen ist.
 *
 * Bis Q28 war das `.aufkleber` - jeder Gegenstand ein Kasten. Seit die
 * Albumseite bei einer Ebene MIT Karte die Karte selbst ist, gibt es dort
 * keine Kaesten mehr, und ein Buch kann ganz ohne sie dastehen. Ein Tor,
 * das auf `.aufkleber` wartet, lief damit dreissig Sekunden in die Frist -
 * gemessen, nicht vermutet: `passt` und vier Abschnitte des Rauchtests
 * sind daran gescheitert, bevor diese Zeile hier stand. */
/* Und mit Q44 noch einmal weiter: „das Buch steht" ist auch nicht mehr
 * „eine KARTE ist zu sehen". Beim Aufschlagen steht das Abzeichenkapitel
 * da, und auf dem liegt keine Karte - vier Abschnitte liefen wieder in
 * dieselbe Frist. Gewartet wird jetzt auf das Buch selbst; wer Karten
 * zaehlen will, blaettert (`ueberAlleKapitel`). Der Name sagt das auch:
 * `BUCHDA`, nicht `BUCHKARTE`. */
const BUCHDA = '.schirm.da .rollen.buch';

const TAKT = { faktor: 1, n: 0, hoechster: 1, norm: 0 };

/* Gemessen wird RECHENZEIT, nicht die Bildfolge.
 *
 * Der erste Anlauf zaehlte zwanzig `requestAnimationFrame` und leitete
 * daraus ab, wie langsam die Maschine sei. Das misst die Sache nicht:
 * die Bildfolge kommt vom Compositor und nicht vom Faden, der die App
 * rechnet. Nachgeprueft mit einer echten Drossel - der Weg, auf dem sich
 * so etwas ueberhaupt herstellen laesst:
 *
 *     Drossel 20x   gemessen 2,4x   → nachgefasst
 *     Drossel 12x   gemessen  1,0x  → NICHT nachgefasst, Frist gerissen
 *
 * Eine Ausloesung, die mal kommt und mal nicht, ist schlimmer als keine:
 * sie macht rote Laeufe unwiederholbar, und genau das war die Krankheit.
 * Eine Pruefung, die so nie etwas meldet, ist kein Beweis (Regel 1) - wer
 * eine Wirkung misst, muss zeigen, dass die Zahl mit ihr steigt und
 * faellt.
 *
 * Eine feste Rechenschleife tut das. Und ihre NORM wird nicht
 * hingeschrieben, sondern zu Beginn dieses Laufs gemessen: gefragt ist
 * „langsamer als vorhin", nicht „langsamer als auf irgendeinem Rechner".
 * Damit traegt die Zahl ihre Messstelle mit (Regel 5). */
const rechenzeit = (p) => p.evaluate(() => {
  const t0 = performance.now();
  let x = 0; for (let i = 0; i < 3e6; i++) x += i % 7;
  return (performance.now() - t0) + (x % 1);   // x benutzen, sonst faellt es weg
}).catch(() => 0);
const taktMessen = async (p) => {
  const ms = await rechenzeit(p);
  return (!ms || !TAKT.norm) ? 1 : Math.max(1, ms / TAKT.norm);
};
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
 * Der Grund ist Regel 3 - eine Gegenprobe faelscht `spiel.js`, und ein
 * Tor, das sein Soll aus der gefaelschten Datei liest, bleibt gruen.
 * Beide stehen hier oben und nicht bei ihrem Gebrauch: der Elternbereich
 * braucht die Namen schon im Abschnitt `ablage`, tausend Zeilen frueher.
 * ------------------------------------------------------------------- */
/* Wer sind die Profile, wie tief gehen sie, wie lang ist eine Sitzung?
 *
 * Alles vier aus `tor/profiltabelle.mjs`, und das liest die Tabelle im
 * Backlog. Bis hierher stand der Leser hier - und `spielprobe` braucht
 * dieselben Zahlen. Ein zweiter Leser waere genau, was Regel 6 verbietet:
 * was zweimal dasteht, veraltet einmal, und dann pruefen zwei Tore
 * verschiedene Profile, ohne dass eines rot wird.
 *
 * `PT.FEHLER` traegt, was beim Lesen schiefging - eine fehlende Zeile darf
 * nicht still zu einem leeren Soll werden.
 *
 * Was aus der Tiefe WIRKLICH auf dem Bildschirm landet, sieht man nur
 * hier: der teuerste denkbare Fehler waere, dass die Raenge 6 bis 12
 * mitrutschen und vor einer Sechsjaehrigen ploetzlich zwoelf Laender
 * stehen.
 *
 * Gebraucht wird die Sitzungslaenge fuer den Vorlauf: bei einer Rechenebene
 * zeigt er BEISPIELE, nicht den Vorrat - und zwar so viele, wie gleich
 * kommen. Der Vorrat ist erzeugt (100, 140, 158); ihn zu zeigen hiesse,
 * einer Sechsjaehrigen vor ihrer ersten Sitzung 2,8 Bildschirme
 * Einmaleins-Tafel hinzulegen. */
import * as PT from './profiltabelle.mjs';
const { BACKLOG, PROFIL_IDS, NAME_VON, PROFILNAMEN, SITZUNG, TIEFE } = PT;
const backlogZeile = PT.zeile;
fehler.push(...PT.FEHLER);

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
  const zellen = backlogZeile('Auswahl statt Tippen', 'das Verbot');
  if (!zellen) return new Set();
  return new Set(zellen.map((t, i) => /\bnie\b/i.test(t) ? PROFIL_IDS[i] : null).filter(Boolean));
})();


/* Wieviel wartet dieser Test BLIND?
 *
 * `waitForTimeout` wartet eine feste Zeit, egal ob das Erwartete schon da
 * ist. Das ist doppelt teuer: auf einem schnellen Rechner verschenkt es
 * Sekunden, auf einem langsamen reicht es trotzdem nicht - dann wird der
 * Test flatterhaft statt langsam.
 *
 * Gezaehlt wird hier, damit die Zahl nicht geschaetzt werden muss und
 * damit sie nicht unbemerkt wieder waechst. Der Bericht am Ende nennt sie.
 */
const blind = { ms: 0, n: 0 };

/* Zwei Arten von Warten, die sich NICHT wegmessen lassen (Q42).
 *
 * Wer auf das AUSBLEIBEN von etwas wartet, hat nichts, worauf er warten
 * koennte: die Zusage ist ja gerade, dass nichts kommt. Eine Frist ist da
 * kein Notbehelf, sondern die Messung selbst - und wie lang sie ist, sagt,
 * wie stark die Aussage ist.
 *
 * Und wer eine ZEITSPANNE misst, braucht einen Takt, der die Spanne nicht
 * verzerrt; der Takt endet mit der Sache und nicht mit der Uhr.
 *
 * Beides steht getrennt in der Bilanz, damit die Zahl darueber ehrlich
 * bleibt. „Blind gewartet" soll null sein und null bleiben duerfen: wer
 * eine feste Pause dazuschreibt, sieht sie im Bericht sofort. Die beiden
 * anderen Zahlen sind Auskunft, keine Ratsche. */
const ausbleiben = { ms: 0, n: 0 }, messtakt = { ms: 0, n: 0 };

/* Die Buchfuehrung an EINE Seite haengen.
 *
 * Sie stand in `neueSeite`, und deshalb galt sie auch nur dort: die
 * gedrosselte Seite im Wartezeichen-Abschnitt und die ohne Dienstarbeiter
 * im Nachladeweg kommen aus einem eigenen Kontext und wurden nie gezaehlt.
 * Die dreizehn festen Pausen waren also dreizehn GEZAEHLTE - wieviele es
 * wirklich waren, stand nirgends. Aufgefallen ist es erst, als die neue
 * Ratsche eine dieser Seiten anfasste und `messtakt` dort fehlte.
 *
 * Jetzt geht jede Seite hier durch, und die Zahl im Bericht meint alle. */
function uhrenBuchfuehrung(p) {
  const festWarten = p.waitForTimeout.bind(p);
  p.waitForTimeout = (ms) => { blind.ms += ms; blind.n++; return festWarten(ms); };
  p.ausbleiben = (ms) => { ausbleiben.ms += ms; ausbleiben.n++; return festWarten(ms); };
  p.messtakt = (ms) => { messtakt.ms += ms; messtakt.n++; return festWarten(ms); };
  return p;
}

/* Auf eine Bedingung warten, die nur HIER zu pruefen ist - etwa ein
 * Eintrag in der Ablage, den `standVon` ueber die Seite holt. Gepollt wird
 * in Node, weil die Bedingung in Node steht; gewartet wird trotzdem auf
 * die Sache: die Schleife endet, sobald sie zutrifft. */
const bisHier = async (fn, ms = 6000, takt = 50) => {
  const ende = Date.now() + ms;
  for (;;) {
    if (await fn()) return true;
    if (Date.now() > ende) return false;
    await new Promise(r => setTimeout(r, takt));
  }
};

/* Auf eine BEDINGUNG warten, nicht auf eine Frist.
 *
 * Gibt `true` zurueck, wenn sie eingetreten ist, `false` bei Ablauf - und
 * wirft nie. Der Aufrufer entscheidet, ob ein Ablauf ein Befund ist: bei
 * den meisten Stellen ist er einer, aber die Meldung soll dann von der
 * Pruefung kommen und nicht als Playwright-Zeitueberschreitung.
 *
 * Die Grenze ist absichtlich grosszuegig. Sie kostet nichts, solange die
 * Bedingung eintritt - anders als eine feste Pause, die IMMER kostet. */
const bis = (p, fn, ms = 5000, arg = null) =>
  p.waitForFunction(fn, arg, { timeout: ms }).then(() => true).catch(() => false);

/* Das Buch hat seit Q44 Kapitel - wer es ZAEHLEN will, muss blaettern.
 *
 * Jede Zusage ueber das Buch („hoechstens drei Fragezeichen", „keine
 * umrisslose Karte", „eine blasse ist dabei") ist eine Aussage ueber das
 * BUCH, nicht ueber eine Seite. Als die Reiter kamen, zaehlten drei
 * Pruefungen ploetzlich nur die offene Seite - und zwei Gegenproben, die
 * seit Monaten anschlugen, wurden still: „das Forscherbuch zeigt wieder
 * alles" faelscht hundert Aufkleber in eine Gruppe, die gar nicht offen
 * stand, und der Rauchtest sah drei.
 *
 * Ohne Reiter gibt es genau eine Seite; dann laeuft die Schleife einmal,
 * und das Ergebnis ist genau das von vorher.
 *
 * Am Ende steht wieder die ERSTE Seite da: was danach fotografiert oder
 * gemessen wird, soll das sein, was ein Kind beim Aufschlagen sieht. */
const ueberAlleKapitel = async (p, lies) => {
  const n = await p.$$eval('.schirm.da [data-kap]', rs => rs.length).catch(() => 0);
  if (!n) return [await p.evaluate(lies)];
  const aus = [];
  for (let i = 0; i < n; i++) {
    await p.$$eval('.schirm.da [data-kap]', (rs, k) => rs[k].click(), i);
    aus.push(await p.evaluate(lies));
  }
  await p.$$eval('.schirm.da [data-kap]', rs => rs[0].click());
  return aus;
};

/* Nach „Fertig" auf die REAKTION warten, nicht auf eine Frist (Q42).
 *
 * `pruefen()` im Schreibbildschirm hat drei Ausgaenge, und jeder ist am
 * Bildschirm zu sehen: bei einer abgelehnten Antwort wird das Geschriebene
 * weggeraeumt (`meine` zurueck, `malen()`), nach dem dritten Fehlversuch
 * wird stattdessen vorgemacht, und bei einer richtigen steht das Lob. Nur
 * die richtige laesst die Striche stehen - deshalb steht sie hier eigens.
 *
 * Gewartet wird auf „irgendeiner davon ist eingetreten", nicht auf einen
 * bestimmten: welcher es ist, prueft der Aufrufer danach. Sonst waere das
 * Warten schon die Pruefung, und ein Warten beweist nichts (Regel 1). */
const nachFertig = (p, ms = 8000) => bis(p, () => {
  const s = document.querySelector('.schirm.da');
  if (!s) return false;
  return s.querySelectorAll('.gemalt path').length === 0
      || s.querySelectorAll('.vorlage path.malt').length > 0
      || !!s.querySelector('.richtigText');
}, ms);

/* Wer bekommt die Aufgabe vorgelesen? Aus der Backlog-Tabelle, Zeile
 * „Vorlesen" - dieselbe Quelle wie Tiefe, Namen und Auswahlverbot.
 *
 * Gebraucht wird das hier fuer die WARTEZEIT, nicht fuer das Urteil: auf
 * eine Ansage, die kommen MUSS, kann man warten; auf eine, die ausbleiben
 * soll, nicht. Wer nichts hoert, wird deshalb erst gelesen, wenn die
 * Aufgabe gespielt ist - dann sind laengst mehr als die 500 ms vergangen,
 * nach denen die App ansagen wuerde. */
/* Wer wird sachlich angesprochen? Zeile „Ton" aus derselben Tabelle.
 *
 * Geprueft wird am Ausrufezeichen, nicht am Wortlaut: „Super gemacht!"
 * gegen „Richtig." Das ist die Regel, die der Ton IST - eine Liste der
 * erlaubten Saetze waere eine Abschrift aus `spiel.js`, und die faelscht
 * die Gegenprobe (Regel 3). */
const SACHLICH = (() => {
  const doc = fs.readFileSync('docs/Lernkiste-BACKLOG.md', 'utf8');
  const z = doc.match(/^\|\s*Ton\s*\|(.+)\|\s*$/m);
  if (!z) { fehler.push('Die Zeile „Ton" fehlt im Backlog — dann prüft der '
    + 'Rauchtest den Ton gegen nichts'); return new Set(); }
  const ids = PROFIL_IDS;
  return new Set(z[1].split('|')
    .map((t, i) => /sachlich/i.test(t) ? ids[i] : null).filter(Boolean));
})();

/* „Vorlesen" und „Ton als Gegenstand" kommen jetzt beide aus
 * `profiltabelle.mjs` - siehe dort, warum es EIN Leser ist und nicht zwei.
 * Der Leser stand hier, solange es nur die eine Zeile gab. */
const VORLESEN = PT.VORLESEN;
const TON_GEGENSTAND = PT.TON_GEGENSTAND;

/**
 * Was auf dem Bildschirm stand, als der Klick nicht ankam (Q41).
 *
 * Drei Fragen, und jede hat schon einmal einen Lauf erklaert: standen ZWEI
 * Bildschirme da (Ueberblendung), war das Ziel ueberhaupt im Baum, und lag
 * etwas darueber? Sie kosten nichts - gefragt wird nur, wenn ohnehin
 * gescheitert ist.
 */
async function mitLage(p, wahl, e) {
  const kopf = String((e && e.message) || e).split('\n')[0];
  const lage = await p.evaluate((w) => {
    const schirme = [...document.querySelectorAll('.schirm')].map(x =>
      `${x.classList.contains('da') ? 'da' : 'geht'}:${getComputedStyle(x).opacity}`);
    const el = document.querySelector(w);
    if (!el) return { schirme, ziel: 'steht nicht im Baum' };
    const r = el.getBoundingClientRect();
    const oben = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const name = (x) => x ? `${x.tagName.toLowerCase()}${
      x.id ? '#' + x.id : '.' + String(x.className || '').split(' ')[0]}` : 'nichts';
    return { schirme,
      ziel: `${Math.round(r.width)}×${Math.round(r.height)} bei `
        + `${Math.round(r.left)}/${Math.round(r.top)}`,
      deckung: getComputedStyle(el).opacity, zeiger: getComputedStyle(el).pointerEvents,
      darueber: oben === el ? 'das Ziel selbst' : name(oben) };
  }, wahl).catch(() => null);
  return `${kopf} — beim Tippen auf ${wahl}. `
    + (lage ? `Lage: ${JSON.stringify(lage)}` : 'Die Seite antwortet nicht mehr.');
}

async function neueSeite(viewport, ctx, flott = true) {
  /* `ctx.newPage()` nimmt KEINE Optionen.
   *
   * Hier stand `ctx.newPage({ viewport, deviceScaleFactor: 2 })`. Beides
   * wurde stillschweigend verworfen - ein Kontext gibt seine Groesse an
   * jede Seite weiter, und die war die Voreinstellung 1280x720. An sechs
   * Aufrufstellen stehen 844x390, 1180x820 und 390x844; gelaufen ist
   * jedes Mal 1280x720.
   *
   * Der Rauchtest hat damit nie auf dem Zielgeraet gemessen, und die
   * Hochkant-Pruefung nie hochkant. Kein Tor konnte das melden: eine
   * ignorierte Option wirft nicht, sie tut nur nichts.
   *
   * `setViewportSize` wirkt auf die Seite und wird nicht verworfen. */
  const p = await ctx.newPage();
  await p.setViewportSize(viewport);
  const ist = p.viewportSize();
  if (ist.width !== viewport.width || ist.height !== viewport.height)
    fehler.push(`Der Bildausschnitt ist ${ist.width}×${ist.height} statt `
      + `${viewport.width}×${viewport.height} — der Test misst eine andere Größe, `
      + 'als er behauptet');
  uhrenBuchfuehrung(p);

  /* Verlaesst irgendetwas dieses Geraet? (Q29)
   *
   * Seit dem Gleichlauf gibt es Code, der senden KANN - und damit eine
   * Zusage, die nur noch gilt, solange sie geprueft wird: ohne
   * Familienschluessel und ohne eingerichteten Dienst geht nichts ins
   * Netz. Der Rauchtest spielt ganze Runden, oeffnet das Buch, geht in
   * den Elternbereich; wenn dabei ein einziger fremder Aufruf faellt,
   * steht er hier.
   *
   * Gezaehlt wird gegen die HERKUNFT des eigenen Servers, nicht gegen
   * eine Liste erlaubter Adressen: eine Liste veraltet, sobald jemand
   * eine neue Adresse einbaut - und genau dann soll es auffallen.
   *
   * `data:` und `blob:` bleiben aussen vor. Das sind die eingebackenen
   * Bilder und die Datei, die der Elternbereich zum Sichern erzeugt;
   * beide verlassen nichts. */
  p.on('request', (r) => {
    const u = r.url();
    if (/^(data|blob|about):/.test(u)) return;
    if (u.startsWith(ADRESSE)) return;
    fremdeAufrufe.add(u.slice(0, 120));
  });

  /* Die DROSSEL - damit die Nachsicht oben pruefbar ist (Q25).
   *
   * Ohne sie ist der Eingriff eine Behauptung: auf einer flotten Maschine
   * laeuft keine Frist ab, die Nachsicht kommt nie zum Zug, und ein
   * gruener Lauf beweist nichts (Regel 1). `SMARTKIDS_DROSSEL=12` macht
   * die Seite zwoelfmal langsamer; erst dort laeuft ueberhaupt eine Frist
   * ab. Bei 3x und 8x reisst keine - was auch heisst, dass die Fristen
   * fuer eine EINZELNE langsame Seite reichlich bemessen sind und das
   * Gedraenge zwischen zehn Browsern etwas anderes war (Q24).
   *
   * Sie ist kein Schalter fuer den Alltag: ohne die Umgebungsvariable
   * passiert hier nichts. */
  /* Die NORM zuerst, und zwar am gesunden Zustand.
   *
   * Sie muss VOR der Drossel entstehen, sonst misst sie diese mit und der
   * Faktor bleibt bei eins - die Pruefung haette sich dann selbst
   * wegmessen. Und sie muss vor dem ersten Ablauf entstehen: eine Norm,
   * die erst beim Zeitverlust genommen wird, ist der Zeitverlust. */
  if (!TAKT.norm) TAKT.norm = await rechenzeit(p) || 0;

  const DROSSEL = +(process.env.SMARTKIDS_DROSSEL || 0);
  if (DROSSEL > 1) {
    const cdp = await p.context().newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });
  }

  /* Jede Frist dieser Seite geht durch EINE Stelle (Q25).
   *
   * Nicht an achtunddreissig Aufrufstellen nachbessern: das waere wieder
   * eine Liste, die veraltet. Hier laeuft jede Wartefrist durch, und wer
   * morgen eine neue schreibt, bekommt die Nachsicht geschenkt.
   *
   * NUR die kurzen Fristen. Was 15 oder 25 Sekunden wartet, wartet
   * meistens auf etwas, das gar nicht kommen SOLL - dort waere ein
   * zweiter Anlauf reine Wartezeit. Die Grenze ist die Sorte Frist, die
   * gerissen ist: vier bis zehn Sekunden. */
  const gemessen = async (lauf, frist) => {
    try { return await lauf(TAKT.faktor); }
    catch (e) {
      if (!/Timeout/.test(String(e && e.message)) || frist > 10000) throw e;
      const jetzt = await taktMessen(p);
      // War die Maschine gar nicht langsam, ist es ein Befund und bleibt
      // einer. Ohne diese Zeile waere die Nachsicht ein Freibrief.
      if (jetzt <= TAKT.faktor * 1.3) throw e;
      TAKT.faktor = Math.min(jetzt, 8); TAKT.n++;
      TAKT.hoechster = Math.max(TAKT.hoechster, TAKT.faktor);
      return lauf(TAKT.faktor);
    }
  };
  /* Und die KLICKS gehen durch dieselbe Stelle (Q41).
   *
   * Bis hierher hingen nur die Wartefristen an der gemessenen Nachsicht,
   * die Klicks nicht: `page.click` bringt seine eigenen 30 s mit, und die
   * sind fest. Genau daran ist ein Kettenlauf gescheitert -
   * `page.click: Timeout 30000ms exceeded` auf `[data-z="0"]`, der
   * PIN-Tastatur im Elternbereich -, waehrend derselbe Abschnitt ALLEIN
   * gefahren in einem Sechstel der Zeit durchlaeuft: fiona 9,9 s gegen
   * 62,0 s im vollen Lauf. Die Maschine war voll, nicht die App kaputt.
   *
   * Die Frist haengt jetzt am GEMESSENEN Faktor - aber OHNE zweiten
   * Anlauf, und das ist der Unterschied zu den Wartefristen.
   *
   * Der erste Entwurf hat den Klick wie eine Wartefrist behandelt:
   * kurze Frist, bei nachgewiesener Langsamkeit noch einmal. Gedrosselt
   * gefahren (`SMARTKIDS_DROSSEL=12`) meldete er
   *
   *     page.click: Timeout 64000ms exceeded — beim Tippen auf
   *     .schirm.da [data-z="0"]. Lage: {"schirme":["da:1"],
   *     "ziel":"steht nicht im Baum"}
   *
   * und damit war es heraus: EIN Bildschirm, voll da, kein Ueberblenden -
   * die Tastatur war einfach schon weg. Ein zweiter Anlauf auf einen
   * Klick, der beim ersten Mal ANGEKOMMEN und nur in der Nachpruefung
   * abgelaufen ist, tippt zweimal. Bei der PIN sind das fuenf Ziffern
   * statt vier: nach der vierten wechselt der Bildschirm, und die
   * fuenfte findet nichts mehr. Ein Klick ist nicht idempotent, eine
   * Wartefrist schon.
   *
   * Also fuenfzehn Sekunden mal dem Faktor, den die WARTEfristen
   * gemessen haben, gedeckelt auf eine Minute - und nur ein Versuch.
   *
   * Und wenn es dann nicht klappt, sagt der Befund, wie es aussah:
   * welche Bildschirme standen da, wo lag das Ziel, was lag darueber. Ein
   * „Timeout 30000ms exceeded" allein ist auf einem Runner, an den man
   * nicht herankommt, keine Auskunft - dieselbe Lehre wie in Q40. */
  const festClick = p.click.bind(p);
  p.click = async (wahl, opt = {}) => {
    const frist = Math.min(60000,
      Math.round((opt.timeout ?? 15000) * Math.max(1, TAKT.faktor)));
    try { return await festClick(wahl, { ...opt, timeout: frist }); }
    catch (e) { throw new Error(await mitLage(p, wahl, e)); }
  };
  const festFn = p.waitForFunction.bind(p);
  const festSel = p.waitForSelector.bind(p);
  p.waitForFunction = (fn, arg, opt = {}) => {
    const frist = opt.timeout ?? 30000;
    return gemessen(f => festFn(fn, arg, { ...opt, timeout: Math.round(frist * f) }), frist);
  };
  p.waitForSelector = (wahl, opt = {}) => {
    const frist = opt.timeout ?? 30000;
    return gemessen(f => festSel(wahl, { ...opt, timeout: Math.round(frist * f) }), frist);
  };
  p.on('pageerror', e => fehler.push(`Seitenfehler: ${String(e).slice(0, 140)}`));

  /* Der FREMDGRIFF laeuft auf jeder Seite mit (Q19).
   *
   * Warum ueberhaupt hier, wo `passt` ihn schon prueft, und warum ohne
   * Stationenliste: steht in `tor/fremdgriff.mjs`. Der Quelltext steht
   * einmal und nicht zweimal - stuende er hier noch einmal, veraltete
   * eine der beiden Fassungen (Regel 6). Eingespritzt als Text, damit
   * dieselbe Datei beide Tore versorgt. */
  await p.addInitScript({ content:
      `window.__fremdgriff = ${fremdgriff.toString()};\n`
    + `(${griffBeobachter.toString()})();\n` });

  /* Geerntet wird beim SCHLIESSEN - der einen Stelle, durch die jede Seite
   * geht. Ein Aufruf an zwanzig Stellen waere wieder eine Liste, die
   * veraltet. */
  const festSchliessen = p.close.bind(p);
  p.close = async (...a) => {
    try {
      const g = await p.evaluate(() => window.__griff);
      if (g) {
        griffStand.geprueft += g.geprueft; griffStand.uebersprungen += g.uebersprungen;
        for (const [k, v] of Object.entries(g.arten || {}))
          griffStand.arten[k] = (griffStand.arten[k] || 0) + v;
        for (const k of g.einmal || []) griffStand.einmal.add(k);
        for (const m of g.meldungen) fehler.push(`Fremdgriff — ${m}`);
      }
    } catch { /* Seite schon weg: dann gibt es nichts zu ernten */ }
    return festSchliessen(...a);
  };
  // Was gesprochen wird, mitschreiben statt es zu hoeren.
  //
  // Fiona liest noch nicht. Ob die App ihr die Aufgabe VORLIEST, ist damit
  // kein Schoenheitsmerkmal, sondern die Frage, ob sie das Spiel ueberhaupt
  // bedienen kann - und das laesst sich nur hier messen: `speechSynthesis`
  // gibt nichts zurueck, was man ansehen koennte.
  await p.addInitScript(() => {
    window.__gesagt = [];
    window.__abgebrochen = 0;
    /* Zweiter Mitschnitt, mit Sprache und Stimme (E2).
     *
     * `__gesagt` bleibt eine Liste von TEXTEN - dreizehn Stellen lesen sie
     * so, und eine Liste, die ploetzlich Objekte fuehrt, macht sie alle
     * still falsch. Was dazukommt, kommt DANEBEN. */
    window.__gesagtWie = [];
    speechSynthesis.speak = (u) => {
      if (!u || !u.text) return;
      window.__gesagt.push(u.text);
      window.__gesagtWie.push({ text: u.text, lang: u.lang, stimme: u.voice?.name || null });
    };
    /* Stimmen unterschieben. Chromium hier hat keine, und ohne eine
       englische kann die vierte Welt nichts sagen - dann pruefte diese
       Messung nur, dass geschwiegen wird, und das ist die Haelfte.
       
       MIT DEM NACHBAU MUSS AUCH DIE AEUSSERUNG NACHGEBAUT WERDEN, und das
       hat mich eine halbe Stunde gekostet: `u.voice = {…}` mit einem
       einfachen Objekt WIRFT in Chromium - das Feld nimmt nur eine echte
       `SpeechSynthesisVoice`. Und `vorlesen` hat ein `catch(e){}`, das
       alles verschluckt. Ergebnis: die App schwieg, kein Fehler, kein
       Hinweis - und zwar auch auf DEUTSCH, weil ohne Nachbau
       `getVoices()` hier leer ist und `u.voice` nie gesetzt wurde. Mein
       Nachbau hat also erst den Fehler gebaut, den er messen wollte. */
    window.__stimmen = [
      { name: 'Anna', lang: 'de-DE', localService: true },
      { name: 'Daniel', lang: 'en-GB', localService: true },
    ];
    speechSynthesis.getVoices = () => window.__stimmen;
    window.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text; this.lang = ''; this.rate = 1;
        this.pitch = 1; this.voice = null; }
    };
    // `cancel` gehoert mitgeschrieben, seit die App beim Zuhoeren schweigen
    // muss (F15): das Mikrofon hoert sonst den eigenen Lautsprecher mit.
    speechSynthesis.cancel = () => { window.__abgebrochen++; };
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

    /* Und der Spracherkenner - nachgebaut, nicht gehoert.
     *
     * Was hier NICHT geprueft wird: ob ein Mikrofon etwas versteht. Das
     * geht nur auf dem Geraet, und genau das ist M4r. Geprueft wird der
     * ZUSTAND drumherum: dass man das Zuhoeren wieder beenden kann, dass
     * ein Ende ohne Ergebnis sichtbar wird und dass ein zweiter Erkenner
     * nicht neben dem ersten laeuft.
     *
     * Genau daran lag der Fehler vom Zielgeraet (F13): der Knopf startete
     * und vergass. `start()` wirft hier deshalb absichtlich, wenn schon
     * einer laeuft - wie es die Browser tun. */
    window.__erk = { gestartet: 0, gestoppt: 0, laeuft: null };
    class ErkNachbau {
      start(){
        if (window.__erk.laeuft) throw new Error('recognition already started');
        window.__erk.gestartet++; window.__erk.laeuft = this;
        /* `start` und `audiostart` gehoeren zum Nachbau dazu: die Browser
           melden beides, und die Sprechprobe im Elternbereich (M4r) liest
           genau daran ab, ob das Mikrofon aufgegangen ist. Ohne die zwei
           Zeilen koennte sie hier nie anders als „nie aufgegangen"
           sagen - und der Abschnitt `sprechen` pruefte eine Anzeige, die
           gar nicht anspringen kann. */
        if (this.onstart) this.onstart();
        if (this.onaudiostart) this.onaudiostart();
      }
      stop(){
        if (window.__erk.laeuft !== this) return;
        window.__erk.gestoppt++; window.__erk.laeuft = null;
        if (this.onend) this.onend();
      }
      abort(){ this.stop(); }
    }
    window.SpeechRecognition = ErkNachbau;
    /* Etwas sagen. `final:false` ist ein Zwischenergebnis.
     *
     * Ein Text oder MEHRERE: die Erkennung liefert bis zu drei Lesarten,
     * und welche davon stimmt, weiss sie selbst nicht. Der Nachbau kann
     * das deshalb auch - sonst waere die zweite Lesart im Rauchtest nie
     * zu sehen, und genau sie ist auf dem Geraet oft die richtige. */
    window.__sprich = (text, final = true) => {
      const e = window.__erk.laeuft;
      if (!e || !e.onresult) return false;
      const treffer = (Array.isArray(text) ? text : [text])
        .map((t, i) => ({ transcript: t, confidence: 0.9 - i * 0.2 }));
      treffer.isFinal = final;
      e.onresult({ results: [treffer] });
      return true;
    };
    /** Das Betriebssystem beendet die Erkennung von selbst - ohne Ergebnis. */
    window.__endeVonSelbst = () => {
      const e = window.__erk.laeuft;
      if (!e) return false;
      window.__erk.laeuft = null;
      if (e.onend) e.onend();
      return true;
    };
  });
  // `?flott` kuerzt die Schaupausen. Der Abschnitt `pausen` braucht die
  // Seite OHNE den Schalter - sonst misst er die Abkuerzung statt der Sache.
  await p.goto(ADRESSE + (flott ? '?flott' : ''), { waitUntil: 'domcontentloaded' });
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
    /* Gemessen wird gegen den BILDSCHIRM, nicht gegen das Kartenfeld.
     *
     * Vorher stand hier der Kasten des SVG. Auf 1280x720 - der Groesse,
     * die dieser Test bis heute versehentlich gefahren hat - war das
     * fast dasselbe: die Karte fuellt dort viel Platz. Auf dem Zielgeraet
     * (844x390) ist die Karte rund 170 px breit, und „Mecklenburg-
     * Vorpommern" ist bei 21 px Schrift 260 px lang. Die Fahne steht dann
     * NEBEN der Karte, vollstaendig sichtbar, mit einer Linie zum Gebiet -
     * genau wofuer die Fahne gebaut wurde. Ueber den Bildschirmrand hinaus
     * darf sie nie, und DAS ist die Zusage. */
    const svg = document.querySelector('.schirm.da .karte svg').getBoundingClientRect();
    return { art: g.dataset.fahne, text: t.textContent,
             drin: b.left >= -1 && b.right <= innerWidth + 1
                && b.top >= -1 && b.bottom <= innerHeight + 1,
             nebenKarte: !(b.left >= svg.left - 1 && b.right <= svg.right + 1),
             zeilen: t.querySelectorAll('tspan').length || 1,
             hoch: +b.height.toFixed(0) };
  });
  if (!f) { merke('fahne', new Error(`${wo}: kein Name auf der Karte`)); return null; }
  if (!f.drin) {
    // Bei genau diesem Befund hilft ein Bild mehr als jede Zahl: wo genau
    // haengt der Name heraus, und um wieviel? Das Foto steht im Bericht.
    await p.screenshot({ path: '/tmp/smoke-fahne-raus.png' }).catch(() => {});
    merke('fahne', new Error(`${wo}: „${f.text}" steht außerhalb des Bildschirms `
      + '(Foto: /tmp/smoke-fahne-raus.png)'));
  }
  /* Seit die Fahne umbricht, hat sie im Kartenfeld Platz - auch auf dem
   * Zielgeraet, wo die Deutschlandkarte 170 Punkte breit ist. Vorher war
   * das eine Auskunft („1 davon neben der Karte"), jetzt ist es eine
   * Zusage.
   *
   * Sie gilt nicht unbedingt: ein einzelnes langes Wort laesst sich nicht
   * trennen, und dafuer steht die Fahne mittig ueber. Kommt so ein Name
   * dazu, meldet es sich HIER - und dann ist zu entscheiden, ob getrennt
   * oder verkleinert wird. Schweigen waere die schlechtere Antwort. */
  if (f.nebenKarte) {
    await p.screenshot({ path: '/tmp/smoke-fahne-neben.png' }).catch(() => {});
    merke('fahne', new Error(`${wo}: „${f.text}" steht neben der Karte statt darin — `
      + 'der Umbruch hat nicht gereicht (Foto: /tmp/smoke-fahne-neben.png)'));
  }
  if (f.zeilen > 1) umgebrochen.add(f.text);
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
/* Gemessen wird der WECHSEL, nicht ein Zeitfenster.
 *
 * Hier stand `performance.now() + 1500` mit dem Kommentar „der Wechsel
 * kommt 1600 ms nach der Antwort, gemessen wird ab rund 800 ms danach".
 * Diese 800 ms waren keine Zusage, sondern das, was die Schritte davor
 * zufaellig gebraucht haben - eine feste Pause von 250 ms war davon der
 * groesste Posten. Als sie wegfiel, begann die Messung frueher, endete
 * frueher und sah den Wechsel gar nicht mehr: sie meldete 0.00 (also
 * „kein Doppelbild") und liess den Test ausserdem in die alte Aufgabe
 * greifen. Ein Fenster, das an fremden Wartezeiten haengt, misst
 * irgendwann etwas anderes (Regel 5).
 *
 * Jetzt laeuft die Messung, BIS sie zwei Bildschirme gesehen hat und
 * wieder einen - das ist der Wechsel, an welcher Stelle er auch kommt.
 * Sieht sie gar keinen, gibt sie -1 zurueck: eine Messung, die nichts
 * gemessen hat, darf nicht wie ein guter Wert aussehen (Regel 5).
 */
async function ueberblendungMessen(p, grenze = 6000) {
  return p.evaluate((g) => new Promise(ja => {
    let schlimmste = 0, gesehen = false;
    const start = performance.now();
    const tick = () => {
      const s = [...document.querySelectorAll('#buehne .schirm')];
      if (s.length > 1) {
        gesehen = true;
        const o = s.map(x => +getComputedStyle(x).opacity).sort((a, b) => b - a);
        schlimmste = Math.max(schlimmste, Math.min(o[0], o[1]));
      } else if (gesehen) return ja(schlimmste);
      if (performance.now() - start < g) requestAnimationFrame(tick);
      else ja(gesehen ? schlimmste : -1);
    };
    requestAnimationFrame(tick);
  }), grenze);
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
    + '.schirm.da .rechnung, .schirm.da .eingabe, .schirm.da .engkarte',
    { timeout: 25000 }).catch(() => {});
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

/**
 * Ein Zeichen schreiben - leicht verzogen, so wie ein Kind es tut.
 *
 * Der Verzug ist Absicht, und er muss an ALLEN Stellen derselbe sein:
 * eine Kopie, die ein wenig gerader zeichnet, besteht die Toleranz noch,
 * wenn die andere sie laengst reisst - dann pruefen zwei Abschnitte
 * verschiedene Nachsicht, und niemand sieht es. Stand bis P8 dreimal da.
 */
async function schreibeSauber(seite, zuege, feld = 0) {
  for (const d of zuege)
    await zeichneZug(seite, Schreiben.abtasten(d, 26)
      .map(([x, y], i) => [x * 0.92 + 5 + (i % 3 - 1), y * 0.92 + 4 + (i % 2 ? 1 : -1)]), feld);
}

/** Wurde als RICHTIG gewertet - nicht „fast", nicht die Loesung. */
const angenommen = (seite, ms = 6000) => seite.waitForFunction(
  () => !!document.querySelector('.schirm.da .frage .richtigText'),
  null, { timeout: ms }).then(() => true).catch(() => false);

/**
 * Auf eine Ansage warten, die mit `anfang` beginnt - und sie zurueckgeben.
 *
 * Leer, wenn keine kommt. Das Warten gehoert dazu: die App sagt eine halbe
 * Sekunde nach dem Wechsel an, und wer `__gesagt` sofort liest, liest den
 * Zustand davor und haelt eine vorhandene Ansage fuer ausgeblieben.
 */
const angesagtMit = (seite, anfang, ms = 5000) =>
  bis(seite, (a) => (window.__gesagt || []).some(t => t.startsWith(a)), ms, anfang)
    .then(() => seite.evaluate((a) => (window.__gesagt || [])
      .find(t => t.startsWith(a)) || '', anfang)).catch(() => '');

/**
 * Auf die naechste Aufgabe warten und den Namen des Gesuchten lesen.
 *
 * Gewartet wird darauf, dass das Lob WEG ist: liest man den Namen davor,
 * steht dort noch das eben geloeste Gebiet, und die Probe spricht die
 * richtige Antwort auf die falsche Frage. Gibt `null` zurueck, wenn keine
 * Karte mehr dasteht (Sitzungsende).
 */
async function naechsteAufgabe(seite) {
  await bis(seite, () => !document.querySelector('.schirm.da .frage .richtigText'), 8000);
  return seite.evaluate(() => {
    const z = document.querySelector('.schirm.da path.ziel');
    if (!z) return null;
    const D = JSON.parse(document.getElementById('daten').textContent);
    return (D.kontinente.find(x => x.id === z.dataset.id) || {}).name || null;
  });
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
              || s.querySelector('.engkarte') || s.querySelector('#nochmal'));
  }, null, { timeout: ms }).then(() => true).catch(() => false);
}

/** Eine Aufgabe loesen: das passende Etikett auf den Anker des Ziels ziehen. */
async function loese(p) {
  /* Die umgekehrte Frage (B3) hat kein hervorgehobenes Gebiet und keine
   * Etiketten - auf sie wird getippt, nicht gezogen. Sie kommt bei jeder
   * dritten Aufgabe, und wer sie nicht kennt, wartet unten vergeblich auf
   * ein `path.ziel`, das es nicht gibt. */
  await p.waitForFunction(() => document.querySelectorAll('.schirm').length === 1
    && (document.querySelector('.schirm.da path.ziel')
        || /^Wo liegt /.test(document.querySelector('.schirm.da #frage')?.textContent || '')),
    null, { timeout: 5000 });
  if (await istUmgekehrt(p)) {
    const vorher = await p.evaluate(() =>
      document.querySelector('.schirm.da #frage').textContent);
    await zeigeAufKarte(p);
    await p.waitForFunction((v) =>
      document.querySelector('.schirm.da #frage')?.textContent !== v,
      vorher, { timeout: 6000 });
    return;
  }
  // Warten, bis der Bildschirmwechsel wirklich durch ist - sonst greift der
  // Test in die alte Aufgabe.
  await p.waitForFunction(() => document.querySelectorAll('.schirm').length === 1
    && document.querySelector('.schirm.da path.ziel'), null, { timeout: 5000 });
  /* Der Punkt kommt aus `zielPunkt` und nicht mehr aus dem ANKER.
     Der Anker ist die Stelle, an der die Beschriftung haengt; bei Berlin
     (19 Punkte Radius, ringsum Brandenburg) liegt dort der Nachbar
     darueber. Das Etikett landete daneben, das Warten auf das Lob lief in
     die Zeitueberschreitung, und der Abschnitt scheiterte an der
     Zielgroesse statt an der Sache. Gefunden in der Runde D2. */
  const punkt = await zielPunkt(p);
  const info = await p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const ziel = s.querySelector('path.ziel'); if (!ziel) return null;
    const D = JSON.parse(document.getElementById('daten').textContent);
    const id = ziel.dataset.id;
    const b = D.deutschland.find(x => x.id === id);
    if (!b) return null;
    const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent);
    return { id, name: b.name, idx: namen.indexOf(b.name), namen };
  });
  if (info && punkt) { info.x = punkt.x; info.y = punkt.y; }
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
const ABSCHNITTE = ['spielen', 'ablage', 'tippen', 'regler', 'ebene4', 'durchgang', 'umgekehrt',
  'test', 'streu', 'abzeichen',
                    'pausen', 'schreiben', 'hinweis', 'sprechen', 'englisch'];
const BRAUCHT = { ablage: ['spielen'] };

/* ---------- Teillaeufe: `--teil=i/n` ------------------------------------
 *
 * Nach P1 war der Rauchtest der Engpass der ganzen Torkette: 295 von
 * 308 s. Die fuenf anderen Browsertore liefen laengst nebeneinander, er
 * lief als ein Stueck.
 *
 * `--teil=i/n` verteilt GANZE Abschnitte auf n Prozesse. Nicht nach
 * Anzahl, sondern nach GEWICHT - jeder Abschnitt einzeln gemessen
 * (`--nur=<name>`, drei nebeneinander, 31.08.2026, vier Kerne), abzueglich
 * der rund 4,6 s, die Browser und Server jeden Prozess kosten:
 *
 *     durchgang 79 · ablage+spielen 52 · schreiben 45 · test 31 ·
 *     abzeichen 18 · umgekehrt 13 · ebene4 11 · regler 10 · pausen 8 ·
 *     tippen 5 · sprechen 2 · hinweis 0 · streu 0
 *
 * Nach Anzahl geteilt lande `durchgang` mit 79 s vielleicht neben
 * `schreiben` mit 45, und ein Teil braeuchte so lange wie vorher das
 * Ganze. Verteilt wird deshalb gierig: das schwerste Stueck zuerst, immer
 * in den bis dahin leichtesten Topf. Das ist deterministisch - derselbe
 * `i` bekommt in jedem Lauf dieselben Abschnitte -, und wenn ein
 * Abschnitt teurer wird, muss nur seine Zahl hier nachgezogen werden.
 *
 * `ablage` braucht `spielen`: die beiden sind EIN Stueck und koennen
 * nicht auf zwei Prozesse fallen.
 *
 * Die Zahlen sind Gewichte fuer die Verteilung, keine Zusage. Sie duerfen
 * altern, ohne dass etwas kaputtgeht - der Lauf wird dann nur ungleicher.
 * Was NICHT altern darf, ist die Vollstaendigkeit: dass die Teile
 * zusammen alle vierzehn Abschnitte fahren, zaehlt `tools/kette.mjs` nach
 * (`TEILE i/n:` unten), so wie beim Bildvergleich. Ein Teillauf, der
 * die Haelfte vergisst, meldet sonst „gruen", und niemand sieht, worueber.
 */
/* `durchgang` zerfaellt noch einmal - nach PROFIL.
 *
 * Er war mit 79 s das schwerste Stueck und hat damit die ganze Aufteilung
 * bestimmt: der Topf, in dem er lag, war immer der vollste. Er spielt
 * jede Ebene fuer JEDES Profil, und die vier wissen nichts voneinander -
 * jedes bekommt seinen eigenen Kontext, seine eigene Seite.
 *
 * Gemessen (`--nur=durchgang`, dieselbe Maschine, 31.08.2026):
 *
 *     fiona 31,4 · lea 17,7 · stephan 17,8 · violeta 16,7
 *
 * Fiona kostet fast doppelt so viel wie die anderen: sie hat die
 * Schreibwelt, und jede ihrer Aufgaben wird zusaetzlich angesagt.
 *
 * Ein Stueck heisst deshalb `durchgang:<profil>`. Die Nachzaehlung im
 * Laeufer vergleicht STUECKE, nicht Abschnitte - sonst stuende
 * `durchgang` in zwei Teilen und niemand saehe, dass ein Profil in
 * keinem laeuft. */
/* Die gemessenen Dauern je Profil. Ein Profil, das hier fehlt, bekommt den
 * Mittelwert - die Aufteilung wird dann etwas schiefer, aber sie laeuft.
 *
 * Die LISTE der Profile steht hier NICHT. Sie kam aus der Tabelle im
 * Backlog, und die vier Zeilen `durchgang:fiona` bis `durchgang:violeta`
 * waren eine handgepflegte Abschrift davon (Regel 6). Was das gekostet
 * hat, stand vier Runden lang im Bericht: die Gegenprobe „eine Spalte
 * fehlt in der Profiltabelle" nimmt Violeta aus der Tabelle, und dann
 * meldete der Rauchtest nicht etwa den fehlenden Zeugen, sondern
 * „unbekannt durchgang:violeta" und brach ab, BEVOR irgendetwas lief. Die
 * Nachzaehlung der Stuecke ist ein Werkzeugcheck; sie stand vor der
 * Zusage, um die es geht, und hat sie zugedeckt. */
const DURCHGANG_MS = { fiona: 31, lea: 18, stephan: 18, violeta: 17 };
const STUECKE = [
  { teile: ['spielen', 'ablage'],   ms: 52 },
  { teile: ['schreiben'],           ms: 45 },
  { teile: ['test'],                ms: 31 },
  ...PROFIL_IDS.map(w => ({ teile: [`durchgang:${w}`], ms: DURCHGANG_MS[w] ?? 20 })),
  { teile: ['abzeichen'],           ms: 18 },
  { teile: ['umgekehrt'],           ms: 13 },
  { teile: ['ebene4'],              ms: 11 },
  { teile: ['regler'],              ms: 10 },
  { teile: ['pausen'],              ms:  8 },
  { teile: ['tippen'],              ms:  5 },
  { teile: ['sprechen'],            ms:  2 },
  { teile: ['englisch'],            ms:  4 },
  { teile: ['hinweis'],             ms:  0 },
  { teile: ['streu'],               ms:  0 },
];
/** Jedes Stueck, das es zu verteilen gibt - `durchgang` je Profil. */
const STUECK_ALLE = [...ABSCHNITTE.filter(t => t !== 'durchgang'),
                     ...PROFIL_IDS.map(w => `durchgang:${w}`)];
// Ein Stueck, das in keinem Topf steht, liefe in KEINEM Teil - und
// der volle Lauf faende es trotzdem. Also hier nachzaehlen, nicht dort.
{
  const drin = STUECKE.flatMap(g => g.teile);
  const fehlt = STUECK_ALLE.filter(t => !drin.includes(t));
  const zuviel = drin.filter(t => !STUECK_ALLE.includes(t));
  if (fehlt.length || zuviel.length) {
    console.error(`\n  smoke: die Stuecke für \`--teil\` decken die Abschnitte nicht: `
      + `${fehlt.length ? `fehlt ${fehlt.join(', ')}` : ''}`
      + `${fehlt.length && zuviel.length ? '; ' : ''}`
      + `${zuviel.length ? `unbekannt ${zuviel.join(', ')}` : ''}\n`);
    process.exit(2);
  }
}
const TEIL = (() => {
  const t = teilVon('smoke');
  if (!t) return null;
  const { i, n } = t;
  const toepfe = [...Array(n)].map(() => ({ ms: 0, teile: [] }));
  for (const g of [...STUECKE].sort((a, b) => b.ms - a.ms)) {
    const leichtester = toepfe.reduce((a, b) => (b.ms < a.ms ? b : a));
    leichtester.ms += g.ms; leichtester.teile.push(...g.teile);
  }
  return { i, n, stuecke: toepfe[i].teile };
})();

const gewaehlt = (() => {
  const roh = (process.argv.find(a => a.startsWith('--nur=')) || '').split('=')[1];
  if (roh && TEIL) {
    console.error('\n  smoke: --nur und --teil zusammen ergeben keinen Sinn — '
      + 'das eine waehlt aus, das andere verteilt.\n');
    process.exit(2);
  }
  // Aus `durchgang:fiona` wird der Abschnitt `durchgang`; WELCHE Profile
  // dieser Teil spielt, steht in PROFILE_HIER.
  if (TEIL) return new Set(TEIL.stuecke.map(x => x.split(':')[0]));
  if (!roh) return null;
  const m = new Set(roh.split(',').map(x => x.trim()).filter(Boolean));
  for (const t of [...m]) for (const v of (BRAUCHT[t] || [])) m.add(v);
  return m;
})();
/* Welche Profile der Durchgang hier spielt.
 *
 * Ohne `--teil` alle vier - `--nur=durchgang` soll weiterhin der ganze
 * Durchgang sein. Mit `--teil` nur die, deren Stueck in diesem Topf
 * gelandet ist. Und das Urteil unten haelt sich daran: ein Urteil ueber
 * ein Profil, das gar nicht gespielt hat, waere ein Fehlalarm - genau
 * daran ist die erste Zerlegung schon einmal gescheitert. */
const PROFILE_HIER = TEIL
  ? PROFIL_IDS.filter(w => TEIL.stuecke.includes(`durchgang:${w}`))
  : PROFIL_IDS;
// Ein Tippfehler im Namen würde sonst ALLES überspringen und grün melden -
// die stillste Art, einen Test abzuschalten.
for (const t of (gewaehlt || []))
  if (!ABSCHNITTE.includes(t)) {
    console.error(`\n  smoke: den Abschnitt „${t}" gibt es nicht. `
      + `Bekannt sind: ${ABSCHNITTE.join(', ')}.\n`);
    process.exit(2);
  }
const laeuft = (t) => (!gewaehlt || gewaehlt.has(t)) && !abbruch();
/* Die Zeile, an der `tools/kette.mjs` nachzaehlt. Sie nennt BEIDES: was
 * dieser Teil faehrt und was es insgesamt gibt - sonst muesste der Laeufer
 * die vierzehn Namen ein zweites Mal fuehren - was zweimal dasteht,
 * veraltet einmal (Regel 6). */
if (TEIL) meldeTeil('smoke', TEIL, [...TEIL.stuecke].sort(), [...STUECK_ALLE].sort());
else if (gewaehlt)
  console.log(`  (nur ${[...gewaehlt].sort().join(', ')} — `
    + `${ABSCHNITTE.filter(t => !gewaehlt.has(t)).join(', ')} übersprungen)`);

/* --- Durchgang 1: spielen und ablegen --------------------------------- */
const ctx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
let geloest = [];
/* Aussen, nicht im Abschnitt: die Bilanz steht ganz unten, und ein `let`
   im Block waere dort nicht mehr da. Der erste Anlauf stand drinnen und
   ist beim ersten Lauf mit „satzGesehen is not defined" gescheitert. */
let satzGesehen = 0, satzAngekommen = 0;
let kartenMessungen = 0, kartenMitKleber = 0;
const kartenSprung = [];
const sternVerlauf = [], bandVerlauf = [];
/* Jede fremde Adresse, die im ganzen Lauf angefragt wurde. Ein Satz und
   kein Zaehler: bei einem Befund will man wissen WOHIN. */
const fremdeAufrufe = new Set();
let endeZeigteKleber = 0;
let endSterne = null, kleberMoment = 0;
const fahnenArten = new Set();
/** Namen, die auf zwei Zeilen umbrechen mussten. Auskunft. */
const umgebrochen = new Set();
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
    // Gewartet wird auf die Ansage selbst, nicht auf eine Frist.
    await bis(p, () => (window.__gesagt || []).length > 0, 4000);
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
      /* Steht die Karte still, wenn das Lob kommt? (Q45)
       *
       * Gemessen wird die GEZEICHNETE Karte, nicht ihr Kasten: das SVG
       * behaelt sein Seitenverhaeltnis, ein Kasten kann sich also aendern,
       * ohne dass ein Kind etwas sieht - und umgekehrt. Genommen wird die
       * Huelle aller Gebiete in Fensterkoordinaten, also genau das, was
       * dasteht.
       *
       * Vor Q45 wanderte sie beim Lob 47 Punkte nach unten und wurde dabei
       * 48 kleiner - von 273 auf 225, achtzehn Prozent, genau in dem
       * Augenblick, in dem das Kind auf die Form schaut, die es eben
       * getroffen hat. */
      const kartenBild = () => p.evaluate(() => {
        const k = document.querySelector('.schirm.da .karte svg');
        if (!k) return null;
        let y0 = 1e9, y1 = -1e9;
        for (const g of k.querySelectorAll('path.geb')) {
          const q = g.getBoundingClientRect();
          if (q.width < 1) continue;
          y0 = Math.min(y0, q.top); y1 = Math.max(y1, q.bottom);
        }
        return y1 < y0 ? null : { oben: Math.round(y0), hoch: Math.round(y1 - y0) };
      });
      /* Erst warten, DANN messen - und zwar auf dasselbe, worauf `loese`
         gleich darauf wartet. Der erste Anlauf mass sofort, also mitten in
         der Ueberblendung: zwei Bildschirme uebereinander, und die Huelle
         war die Vereinigung der alten und der neuen Karte. Gemeldet wurden
         154 → 140, während dieselbe Stelle einzeln gemessen 141 → 140
         ergab. Ein Ruecken, das es nicht gab - gemessen im falschen
         Augenblick (Regel 5). */
      await p.waitForFunction(() => document.querySelectorAll('#buehne .schirm').length === 1
        && (document.querySelector('.schirm.da path.ziel')
            || /^Wo liegt /.test(document.querySelector('.schirm.da #frage')?.textContent || '')),
        null, { timeout: 8000 }).catch(() => {});
      const vorLob = await kartenBild();
      geloest.push(await loese(p));
      const nachLob = await kartenBild();
      /* Der neue Aufkleber ist die eine Ausnahme, und sie ist Absicht.
       *
       * Er bringt eine eigene Zeile mit Bild mit; gemessen kostet die 23
       * Punkte Karte. Freigehalten wird sie NICHT: ein Aufkleber entsteht
       * einmal je Gebiet, die Frage steht bei jeder Aufgabe - fuer ein
       * seltenes Ereignis dauerhaft zu zahlen waere der schlechtere
       * Tausch. Der Augenblick darf sich anfuehlen, als machte der
       * Bildschirm Platz; das ist er auch.
       *
       * Gezaehlt wird er trotzdem, damit die Ausnahme eine ZAHL hat und
       * keine Behauptung bleibt. */
      const mitKleber = await p.evaluate(() =>
        !!document.querySelector('.schirm.da .frage .neuerkleber'));
      if (mitKleber) kartenMitKleber++;
      else if (vorLob && nachLob) {
        kartenMessungen++;
        /* Zwei Punkte Nachsicht, und zwar aus einem Grund: die Frage ist
           EINE Zeile, der freigehaltene Platz drei, und was uebrigbleibt,
           wird gerundet. Gemessen wurden 1 bis 2 Punkte; alles darueber
           ist wieder ein Ruecken. Anteilig waere hier falsch - ein Punkt
           ist ein Punkt, egal wie gross die Karte ist. */
        /* Eine RATSCHE, kein Soll - und ihre Zahl ist gemessen, nicht
           gewuenscht.
           Der Sprung von der Frage zum Lob war 47 Punkte: die gezeichnete
           Karte wanderte 47 nach unten und wurde 48 kleiner (273 auf 225,
           achtzehn Prozent). Seit die Lobzeile im kurzen Querformat NEBEN
           der Sache steht statt darueber, sind es 21 - und „Lob ohne Satz"
           misst sich Punkt fuer Punkt wie die Frage: die Lobzeile kostet
           nichts mehr. Was bleibt, ist der Satz zum Mitnehmen.
           Freihalten laesst er sich nicht: 22 Punkte mehr auf dem
           Fragebildschirm, und `passt` meldet „noch einmal hoeren" im
           Wischbereich. Gebaut, gemessen, wieder ausgebaut - die Rechnung
           steht im Rueckstandsverzeichnis.
           Dreissig und nicht einundzwanzig, damit nicht jede
           Schriftaenderung die Zahl neu setzt; wer sie hochsetzt, hat die
           Karte unruhiger gemacht. */
        const DECKEL = 30;
        const weit = Math.max(Math.abs(nachLob.oben - vorLob.oben),
                              Math.abs(nachLob.hoch - vorLob.hoch));
        if (weit > DECKEL)
          kartenSprung.push(`${vorLob.oben}/${vorLob.hoch} → ${nachLob.oben}/${nachLob.hoch} `
            + `(${weit} Punkte)`);
      }
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
      /* Der Satz zum Mitnehmen (D3) - kommt er wirklich an?
       *
       * `inhalt` prueft, dass es zu jedem Gebiet einen gibt. Das ist die
       * eine Haelfte; die andere ist, dass er den WEG bis zum Kind geht,
       * und der hat drei Stationen: `satzZu` findet ihn, `lobsatz`
       * schreibt ihn hin, `sagen` spricht ihn. Jede kann still ausfallen -
       * und ein Satz, der nur in einer Tabelle steht, ist keiner.
       *
       * Gemessen wird an BEIDEN Enden, weil zwei Kinder gemeint sind: Lea
       * liest ihn, Fiona hoert ihn. Und gemessen wird gegen die Tabelle
       * im gebauten Bildschirm, nicht gegen eine Liste hier - sonst
       * haenge das Modell am Gemessenen und der Abschnitt pruefte seine
       * eigene Annahme (Regel 14). */
      const mitgenommen = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        const soll = typeof Saetze === 'undefined' ? null
          : Saetze.satzZu(s.querySelector('path.geb.treffer')?.dataset.id || '');
        return { soll, steht: s.querySelector('.frage .nebenbei')?.textContent.trim() || '',
                 gesagt: (window.__gesagt || []).join(' | ') };
      });
      if (mitgenommen.soll) {
        satzGesehen++;
        if (mitgenommen.steht !== mitgenommen.soll)
          merke('spielen', new Error(`der Satz zum Mitnehmen steht nicht auf dem Bildschirm — `
            + `erwartet „${mitgenommen.soll}", da steht „${mitgenommen.steht || '(nichts)'}"`));
        else if (!mitgenommen.gesagt.includes(mitgenommen.soll))
          merke('spielen', new Error(`der Satz zum Mitnehmen wird nicht gesprochen — `
            + `Fiona liest nicht, für sie ist er damit gar nicht da (gesagt: `
            + `„${mitgenommen.gesagt.slice(-90)}")`));
        else satzAngekommen++;
      }
      /* Die Fahne wird MIT dem Lob gezeichnet, aber nicht im selben Bild:
       * `loese()` wartet auf das Lob, die Fahne kommt einen Anzeigeschritt
       * spaeter. Gewartet wird auf DIESE Fahne, nicht auf irgendeine.
       *
       * Der erste Anlauf fragte nur, ob `#fahne .fahnentext` da ist - und
       * die Fahne der VORIGEN Aufgabe steht noch. Die Bedingung war damit
       * sofort wahr, die Messung las die alte Fahne, und das Tor meldete
       * genau den Befund, gegen den das Warten da ist: „in zwoelf Aufgaben
       * nur die Sorte daneben". Ein Warten auf etwas, das schon dasteht,
       * ist kein Warten. */
      await bis(p, (n) => document.querySelector('.schirm.da #fahne .fahnentext')
        ?.textContent.trim() === n, 3000, geloest[geloest.length - 1]);
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
      /* Was die Runde eingebracht hat, steht als BILD da (Q28).
       *
       * Vorher stand dort eine Zahl - „2 von 4 im Buch" -, und der
       * Aufkleber, um den es ging, war nirgends zu sehen. Fuer ein Kind,
       * das nicht liest, war der Endbildschirm damit stumm.
       *
       * Geprueft wird an dem, was der Bildschirm SELBST sagt: steht dort
       * „neue Aufkleber", muss auch mindestens einer zu sehen sein. Eine
       * feste Erwartung („nach zwei Sitzungen sind es drei") waere eine
       * zweite Rechnung neben dem Leitner und ginge irgendwann anders
       * aus als er. */
      const ende = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        return { sagt: +(s.querySelector('.buchstand')?.dataset.neu || 0),
                 zeigt: s.querySelectorAll('.kleberzeile .frischerkleber').length };
      });
      if (ende.sagt && !ende.zeigt)
        merke('spielen', new Error(`der Endbildschirm zählt ${ende.sagt} neue Aufkleber, `
          + 'zeigt aber keinen — für ein Kind, das nicht liest, ist das nichts'));
      if (ende.zeigt) endeZeigteKleber = ende.zeigt;
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
  if (endeZeigteKleber)
    console.log(`  Aufkleber am Rundenende:    ${endeZeigteKleber} als Bild, nicht als Zahl`);
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
  /* „Heute schon geübt" (A4h) - und zwar NACH einem Neustart.
   *
   * Das ist die ganze Abnahme aus dem Backlog: „die Zeile stimmt nach
   * einem Neustart". Vorher hat Fiona gespielt, Lea nicht - also muss
   * die Zeile bei Fiona stehen und bei Lea fehlen. Nur „sie ist da"
   * waere kein Beweis: eine Zeile, die auf JEDER Kachel steht, sagt
   * nichts, und sie waere genau der Streak-Zwang, den der Abgleich
   * ausdruecklich nicht will - jeden Tag ein Vorwurf fuer den, der
   * nicht gespielt hat. */
  await p.waitForSelector('.schirm.da [data-profil]');
  const geuebt = await p.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('.schirm.da [data-profil]')]
      .map(k => [k.dataset.profil, !!k.querySelector('.heute')])));
  console.log(`  Heute schon geübt:          `
    + Object.entries(geuebt).map(([k, v]) => `${k} ${v ? 'ja' : 'nein'}`).join(', ')
    + ' (nach Neustart)');
  if (!geuebt.fiona)
    merke('ablage', new Error('nach dem Neustart steht bei Fiona nicht „heute schon '
      + 'geübt", obwohl sie gerade gespielt hat'));
  if (geuebt.lea)
    merke('ablage', new Error('„heute schon geübt" steht auch bei Lea, die noch gar '
      + 'nicht gespielt hat — eine Zeile auf jeder Kachel sagt nichts'));
  await p.click('[data-profil="fiona"]');
  await zurEbenenwahl(p, 'bundeslaender');
  /* Die Ebenenwahl trägt Aufkleber und einen Balken statt der Zeile
   * „0 von 16". Auf dem Zielgerät war von dieser Zeile ohnehin nur die
   * Zahl übrig: Balken und Überzeile sind im kurzen Querformat
   * ausgeblendet, und Fiona liest keine Zahlen.
   *
   * Geprüft wird nicht, dass sie DA sind - das wäre eine Zusage über
   * Markup. Geprüft wird, dass sie DASSELBE sagen: der gefüllte Streifen
   * des Balkens muss dem Verhältnis entsprechen, das die Zahl daneben
   * nennt. Genau das stimmte auf dem Endbildschirm nicht (Balken auf einem
   * Viertel, Zahl auf null), und genau das kann wieder auseinanderlaufen.
   *
   * STERNE stehen hier seit S1 nicht mehr. Sie meinten auf der Kachel den
   * Lebensfortschritt und im Kopf die Sitzung - dieselbe Form für zwei
   * Aussagen. Geprüft wird jetzt, dass sie WEG sind: eine Anzeige, die
   * zurückkommt, ohne dass es jemand merkt, ist derselbe Fehler noch
   * einmal.
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
    fortschritt = `${kachel.kleber} von ${kachel.gesamt} Aufkleber, `
      + `Balken ${kachel.fest}, keine Sterne`;
    if (kachel.sterne)
      merke('ebenenwahl', new Error(`die Kachel zeigt wieder ${kachel.sterne} Sterne — `
        + 'sie meinen dort den Lebensfortschritt, im Kopf aber die Sitzung. '
        + 'Ein Kind spielt fehlerfrei, sieht drei, tippt auf „Weiter" und sieht einen'));
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
  const abgelegt = await standGroesse(p, 'fiona:bundeslaender');
  console.log(`  In der Ablage:              ${abgelegt} Gegenstände im Leitner-Stand`);
  if (abgelegt < 3) merke('ablage', new Error(`nur ${abgelegt} Gegenstände abgelegt, erwartet mindestens 3`));
  // Forscherbuch
  await p.evaluate(() => { window.__gesagt = []; });
  await p.click('#buch');
  await p.waitForSelector(BUCHDA);
  await bis(p, () => (window.__gesagt || []).length > 0, 4000);
  /* Seit Q28 klebt auf einer Ebene MIT Karte alles auf einer Albumkarte,
     statt in einzelnen Kaesten. Gezaehlt wird deshalb beides: die
     gesammelten Kaesten und die farbigen Flaechen auf den Karten. */
  /* Durch das ganze Buch, nicht nur ueber die offene Seite (Q44) - siehe
     `ueberAlleKapitel`. Alles in EINEM Durchgang gelesen: jeder weitere
     kostet ein Blaettern je Kapitel. */
  const buchSeiten = await ueberAlleKapitel(p, () => {
    const kaesten = [...document.querySelectorAll('.schirm.da .aufkleber')];
    return { kleber: document.querySelectorAll('.schirm.da .aufkleber.da').length
               + document.querySelectorAll('.schirm.da .albumkleber').length,
             alleKleber: kaesten.length,
             fragezeichen: kaesten.filter(e => /^\?$/.test(e.textContent.trim())).length,
             album: [...document.querySelectorAll('.schirm.da .albumkarte')].map(k => ({
               voll: k.querySelectorAll('.albumkleber').length,
               offen: k.querySelectorAll('.albumoffen').length })) };
  });
  const summe = (welche) => buchSeiten.reduce((n, x) => n + x[welche], 0);
  const kleber = summe('kleber');
  if (kleber < 1) merke('forscherbuch', new Error('kein einziger Aufkleber nach zwei Sitzungen'));
  const alleKleber = summe('alleKleber');
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
  // Gezaehlt wird am HOECHSTSTAND, so wie `istGesammelt` es tut. Mit dem
  // laufenden Fach zaehlte diese Zeile nach jeder falschen Antwort weniger
  // als das Buch zeigt - und meldete das Buch als Wand.
  const staende = await ausAblage(p, 'fortschritt');
  const wirklich = staende === -1 ? -1 : staende.reduce((n, st) =>
    n + Object.values(st || {}).filter(x => (x?.hoechstes ?? x?.fach ?? 1) >= 3).length, 0);
  if (alleKleber > wirklich + 3)
    merke('forscherbuch', new Error(`das Buch zeigt ${alleKleber} Aufkleber, `
      + `wirklich gesammelt sind ${wirklich} — mehr als drei Vorschau, das ist wieder die Wand`));
  /* Und die Zusage in der Form, die seit Q28 gilt (die Albumkarte zeigt
   * ALLES, auch das Offene - blass, auf der Karte, ohne Fragezeichen).
   *
   * Die Zahl allein traegt hier nicht mehr: eine Karte zaehlt eins,
   * gleich wieviel darauf liegt. Was die Wand ausmachte, waren die
   * FRAGEZEICHEN - Kaesten, die sagen „das kannst du noch nicht".
   * Hoechstens drei davon, wie eh und je; auf einer Ebene mit Karte
   * keines. */
  const fragezeichen = summe('fragezeichen');
  if (fragezeichen > 3)
    merke('forscherbuch', new Error(`${fragezeichen} Kästen mit Fragezeichen im Buch — `
      + 'höchstens drei sind Vorschau, mehr ist wieder die To-do-Liste'));
  /* Und die andere Haelfte derselben Zusage: die Albumkarte zeigt AUCH,
   * was noch fehlt - blass, an seinem Platz.
   *
   * Ohne diese Zeile waere die Karte durch eine zu ersetzen, die nur die
   * gesammelten Gebiete zeigt, und alles bliebe gruen: das Fragezeichen
   * ist dann erst recht keines da. Genau die Verfallsart, gegen die
   * Regel 1 steht: eine Pruefung, die nie etwas meldet, ist kein Beweis -
   * und eine, die nur Verbotenes sucht, meldet zum Gebotenen nie etwas. */
  const album = buchSeiten.flatMap(x => x.album);
  for (const k of album)
    if (!k.offen && !k.voll)
      merke('forscherbuch', new Error('eine Albumkarte im Buch ist leer — '
        + 'weder Gesammeltes noch Offenes'));
  const blind = album.filter(k => k.voll && !k.offen).length;
  if (album.length && blind === album.length && staende !== -1 && wirklich < 30)
    merke('forscherbuch', new Error(`alle ${album.length} Albumkarten zeigen nur Gesammeltes — `
      + 'das Offene liegt nicht mehr blass darunter, und damit sieht das Kind nicht mehr alles'));
  if (album.length)
    console.log(`  Album im Buch:              ${album.map(k => `${k.voll} von ${k.voll + k.offen}`)
      .join(', ')}`);
  // Und es sagt Fiona, was drin ist.
  const buchGesagt = await p.evaluate(() => (window.__gesagt || []).join(' | '));
  if (!/Forscherbuch/.test(buchGesagt))
    merke('forscherbuch', new Error('das Buch sagt Fiona nicht, was drin ist — '
      + `sie kann es nicht lesen (gesagt: „${buchGesagt.slice(-80)}")`));
  await p.screenshot({ path: '/tmp/smoke-buch.png' });

  /* --- Der Weg zurueck in den Vorlauf (Q20) ---------------------------
   *
   * Seit Q18 gibt es auf dem Telefon kein Auge mehr an der Ebenenkachel -
   * seine Trefferflaeche lag auf dem Namen. Damit war der Vorlauf nach
   * dem ersten Betreten NICHT MEHR ZU ERREICHEN: er erscheint nur einmal
   * je Ebene, und `vorlaufGezeigt` wird nie zurueckgesetzt.
   *
   * Der Ersatz steht im Buch, unter „Als Nächstes". Geprueft wird die
   * ganze Schleife und nicht nur, dass ein Knopf dasteht: hin in den
   * Vorlauf, dort stehen Karten, und „Zurück" fuehrt ins BUCH zurueck -
   * nicht in die Ebenenwahl, wo das Kind gar nicht war.
   *
   * Ohne die Rueckwegpruefung waere der haeufigste Fehler nicht zu sehen:
   * `vorlauf` hatte `ebenenwahl` fest eingebaut, und mit einem Knopf, der
   * einfach `vorlauf(id)` aufruft, faellt man in einen fremden
   * Bildschirm. Das sieht wie ein Fehlgriff aus und ist keiner. */
  const zumVorlauf = await p.$('.schirm.da #allesehen');
  if (!zumVorlauf) {
    merke('forscherbuch', new Error('kein Weg zurück in den Vorlauf — seit das Auge '
      + 'auf dem Telefon weg ist, wäre eine Ebene nach dem ersten Betreten '
      + 'nicht mehr anzusehen'));
  } else {
    await p.$eval('.schirm.da #allesehen', x => x.click());
    const imVorlauf = await p.waitForSelector('.schirm.da #los', { timeout: 8000 })
      .then(() => true).catch(() => false);
    if (!imVorlauf) merke('forscherbuch', new Error('„Alle ansehen" führt nicht in den Vorlauf'));
    else {
      const karten = await p.$$eval('.schirm.da .aufkleber', e => e.length);
      if (karten < 2) merke('forscherbuch', new Error(`der Vorlauf aus dem Buch zeigt `
        + `${karten} Karten — dann ist er kein Anschauen`));
      await p.$eval('.schirm.da #zur', x => x.click());
      const zurueckImBuch = await p.waitForSelector('.schirm.da #allesehen', { timeout: 8000 })
        .then(() => true).catch(() => false);
      if (!zurueckImBuch) merke('forscherbuch', new Error('„Zurück" aus dem Vorlauf führt '
        + 'nicht ins Buch zurück, sondern anderswohin — das Kind war im Buch'));
    }
  }

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
    /* Und umgekehrt: KEIN Profil zuviel.
     *
     * Die Tabelle im Backlog ist das Soll, aber nur, solange sie
     * vollstaendig ist. Faellt dort eine Spalte weg, prueft jedes Tor
     * stillschweigend ein Profil weniger - und dieses eine wird nie
     * gespielt, nie vorgelesen, nie auf Ueberlauf gemessen. Genau das
     * kann kein anderer Test sehen, weil ihm dasselbe Soll fehlt.
     * Deshalb hier, an der einzigen Stelle, die ALLE Profile der App
     * auflistet. */
    if (gesehen.uebersicht.length !== PROFILNAMEN.length)
      merke('eltern', new Error(`die App kennt ${gesehen.uebersicht.length} Profile `
        + `(${gesehen.uebersicht.join(', ')}), die Tabelle im Backlog nennt `
        + `${PROFILNAMEN.length} (${PROFILNAMEN.join(', ')}) — eine fehlende Spalte `
        + 'nimmt jedem Tor ein Profil, ohne dass eines rot wird'));
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

  /* Der Vergleich zweier Elternprofile (N1).
   *
   * Gepruefte Zahlen, nicht „eine Tabelle ist da": ein gesetzter
   * Mitschnitt mit BEKANNTEM Ausgang, und die Erwartung steht hier
   * ausgeschrieben - nicht als zweiter Aufruf derselben Rechnung. Sonst
   * pruefte die Rechnung sich selbst (Regel 3).
   *
   *   Stephan: dreimal beendet, davon zweimal auf Anhieb richtig
   *   Violeta: zweimal beendet, davon einmal auf Anhieb richtig
   *
   * Also 2 von 3 gegen 1 von 2, und Stephan liegt vorn. Ein Eintrag mit
   * `versuch: 2` zaehlt als Aufgabe, aber nicht als „auf Anhieb" - genau
   * daran haengt der ganze Vergleich. */
  {
    const T = Date.UTC(2026, 0, 15, 15, 30, 0);
    /* Dieselben fuenf Zeilen, die `ansicht` fotografiert - aus
       `gestellt.mjs`. Der Vergleich und sein Bild muessen dieselbe Sache
       zeigen (P8). */
    const mitschnitt = ELTERN_VERGLEICH
      // Gebaut von `Protokoll.eintrag`, nicht daneben nachgebaut (P8).
      .map((e, i) => Protokoll.eintrag({ zeit: T + i*1000, eingabeart:'tippen',
                                         fachVorher:1, fachNachher:2, ...e }));
    const v = await neueSeite({ width: 1180, height: 820 }, ctx);
    await stelleAblage(v, { protokoll:
      Object.fromEntries(mitschnitt.map((e, i) => [`n1-${i}`, e])) });
    await v.reload({ waitUntil: 'domcontentloaded' });
    await v.waitForSelector('[data-profil="fiona"]');
    await v.click('[data-profil="fiona"]');
    await v.waitForSelector('.schirm.da #eltern');
    await v.click('.schirm.da #eltern');
    await v.waitForSelector('.schirm.da .ziffern');
    for (let i = 0; i < 4; i++) await v.click('.schirm.da [data-z="0"]');
    await v.waitForSelector('.schirm.da .kacheln', { timeout: 10000 });
    const duell = await v.evaluate(() => {
      const t = document.querySelector('.schirm.da #duell');
      if (!t) return null;
      const summe = [...t.querySelectorAll('tbody tr')].find(r => r.classList.contains('summe'));
      return { kopf: [...t.querySelectorAll('thead th')].map(c => c.textContent.trim()),
               summe: summe ? [...summe.cells].map(c => c.textContent.replace(/\s+/g, ' ').trim()) : null,
               fuehrt: summe ? [...summe.cells].map(c => c.classList.contains('fuehrt')) : null,
               satz: document.querySelector('.schirm.da #duellsatz')?.textContent.trim() || '' };
    });
    if (!duell) {
      merke('eltern', new Error('es gibt keinen Vergleich der beiden Elternprofile — '
        + 'dann steht der Fortschritt zwar getrennt da, ist aber nicht zu vergleichen'));
    } else {
      for (const name of ['Stephan', 'Violeta'])
        if (!duell.kopf.includes(name))
          merke('eltern', new Error(`im Vergleich fehlt die Spalte „${name}" `
            + `(da stehen: ${duell.kopf.join(', ')})`));
      if (!/2 von 3/.test(duell.summe?.[1] || ''))
        merke('eltern', new Error(`Stephan steht mit „${duell.summe?.[1]}" da — `
          + 'erwartet waren 2 von 3 (zwei auf Anhieb, einer erst im zweiten Versuch)'));
      if (!/1 von 2/.test(duell.summe?.[2] || ''))
        merke('eltern', new Error(`Violeta steht mit „${duell.summe?.[2]}" da — `
          + 'erwartet waren 1 von 2 (eine gezeigte Aufgabe zählt, aber nicht als richtig)'));
      if (!duell.fuehrt?.[1] || duell.fuehrt?.[2])
        merke('eltern', new Error('die führende Spalte ist nicht die von Stephan — '
          + 'dann muss man zwei Zahlen im Kopf vergleichen, und genau das soll die Tabelle abnehmen'));
      if (!/Stephan/.test(duell.satz))
        merke('eltern', new Error(`unter der Tabelle steht „${duell.satz}" — `
          + 'erwartet war, dass Stephan vorn liegt'));
      else console.log(`  Elternvergleich:            ${duell.summe?.[1]} gegen `
        + `${duell.summe?.[2]}, ${duell.satz.split(':')[0]}`);
    }
    await v.close();
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
      await knopf.click();
      await p.waitForSelector('.schirm.da #pinstand [data-neu="1"]', { timeout: 4000 });
      for (const z of ['1', '9', '8', '4'])
        await p.click(`.schirm.da #pinstand [data-neu="${z}"]`);
      // Nach der vierten Ziffer raeumt die App das Ziffernfeld weg und
      // setzt den Knopf zurueck - das ist das Zeichen, dass gespeichert
      // ist, und darauf laesst sich warten.
      await bis(p, () => !document.querySelector('.schirm.da #pinstand [data-neu]'), 4000);
      await p.reload();
      await p.waitForSelector('[data-profil="fiona"]');
      await p.click('[data-profil="fiona"]');
      // `#eltern` steht seit D4 schon auf der Weltenwahl - dorthin gehoert er,
      // er haengt am Kind und nicht an einem Fach.
      await p.waitForSelector('.schirm.da [data-welt]');
      await p.click('#eltern'); await p.waitForSelector('.schirm.da .ziffern');
      for (let i = 0; i < 4; i++) await p.click('.schirm.da [data-z="0"]');
      // Zwei moegliche Ausgaenge, und beide sind sichtbar: entweder steht
      // man drinnen (`#pinneu`), oder die Fehlerzeile ist gefuellt.
      await bis(p, () => !!document.querySelector('.schirm.da #pinneu')
        || (document.querySelector('.schirm.da #fehl')?.textContent || '').length > 0, 4000);
      const altRein = !!(await p.$('.schirm.da #pinneu'));
      // Kommt man mit der ALTEN PIN hinein, steht man jetzt IM
      // Elternbereich - dort gibt es kein Ziffernfeld mehr. Die neue PIN
      // hier trotzdem einzutippen liess den Rauchtest mit einer
      // Playwright-Zeitueberschreitung sterben, statt zu sagen, was los
      // ist: die Gegenprobe wurde rot, aber aus dem falschen Grund.
      let neuRein = null;
      if (!altRein) {
        for (const z of ['1', '9', '8', '4']) await p.click(`.schirm.da [data-z="${z}"]`);
        /* Hier wird nur auf `#pinneu` gewartet, nicht auch auf die
         * Fehlerzeile: die steht vom vorigen Versuch mit 0000 noch da,
         * und die Bedingung waere damit sofort wahr gewesen - der erste
         * Anlauf meldete prompt „mit der neuen PIN kommt man nicht
         * hinein". Geht es schief, laeuft die Grenze ab und die Pruefung
         * darunter meldet es richtig. */
        await bis(p, () => !!document.querySelector('.schirm.da #pinneu'), 4000);
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
    // Die Kacheln kommen sofort, ihr Fortschritt kommt aus der Ablage und
    // damit einen Schritt spaeter. Gewartet wird auf den Balken - er ist
    // das Zeichen, dass der Stand gelesen ist. Der „von vorne"-Knopf
    // taugt dafuer nicht: dass er FEHLT, ist ja der Befund.
    await bis(p, () => !!document.querySelector('.schirm.da .kachel .balken'), 4000);

    /* Das Auge an der Kachel (P16): es fuehrt in den Vorlauf und startet
     * NICHT die Ebene.
     *
     * Beides gehoert geprueft. Es liegt ueber der Kachel, und die Kachel
     * ist selbst ein Knopf - ein Tipp, der durchschlaegt, wuerde die
     * Sitzung anfangen statt die Karten zu zeigen, und das faellt hier
     * niemandem auf: beide Wege fuehren auf einen Bildschirm, der
     * plausibel aussieht. Unterschieden wird an dem, was NUR der Vorlauf
     * hat: das Gitter der Aufkleber und der Knopf „Jetzt starten". */
    {
      const auge = await p.$('.schirm.da [data-schau="bundeslaender"]');
      if (!auge) merke('vonvorne', new Error(
        'an der Kachel steht kein Auge — der Weg zurück in den Vorlauf fehlt'));
      else {
        await auge.click();
        const drin = await bis(p, () => !!document.querySelector('.schirm.da .kleber .aufkleber')
          && !!document.querySelector('.schirm.da #los'), 8000);
        const gestartet = !!(await p.$('.schirm.da .karte svg path.ziel'));
        if (!drin) merke('vonvorne', new Error(
          'das Auge an der Kachel führt nicht in den Vorlauf'));
        if (gestartet) merke('vonvorne', new Error(
          'das Auge hat die Ebene gestartet — der Tipp schlägt auf die Kachel durch'));
        await p.click('.schirm.da #zur');
        await bis(p, () => !!document.querySelector('.schirm.da .kachel .balken'), 4000);
      }
    }
    /* „von vorne" steht seit Q8 NICHT mehr an der Kachel, sondern nur noch
     * im Pausenbildschirm einer Ebene. Geprueft wird deshalb beides: dass
     * es an der Kachel WEG ist, und dass der Weg darueber trotzdem
     * zurueckfuehrt.
     *
     * Das Weg-Sein ist die eigentliche Zusage: an ihm haengt die Hoehe der
     * Kachel, und ohne diese Hoehe passt das Kachelbild nicht. Ein Knopf,
     * der „nur mal eben" zurueckkommt, nimmt sie wieder weg. */
    const anDerKachel = await p.$('.schirm.da .wahl.ebenen [data-neu]');
    if (anDerKachel) merke('vonvorne', new Error(
      'an der Kachel steht wieder ein „von vorne" — es kostet die Höhe, '
      + 'von der das Kachelbild lebt'));

    await p.click('.schirm.da [data-ebene="bundeslaender"]');
    await durchVorlaufWenn(p);
    await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });
    await p.click('.schirm.da #zur');
    await p.waitForSelector('.schirm.da #null', { timeout: 5000 });
    const erst = (await p.$eval('.schirm.da #null', (e) => e.textContent)).trim();
    await p.click('.schirm.da #null');
    await bis(p, () => /Wirklich/.test(
      document.querySelector('.schirm.da #null')?.textContent || ''), 3000);
    const nachfrage = (await p.$eval('.schirm.da #null', (e) => e.textContent)).trim();
    if (!/Wirklich/.test(nachfrage)) merke('vonvorne', new Error(
      `der erste Tipper löscht sofort — er fragt nicht nach (steht: „${nachfrage}")`));
    await p.click('.schirm.da #null');
    await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });
    const rest = await standGroesse(p, 'fiona:bundeslaender');
    console.log(`  „Von vorne" in der Pause:   „${erst}" → nachgefragt → `
      + `${rest} Gegenstände übrig`);
    if (rest !== 0) merke('vonvorne', new Error(
      `nach „von vorne" stehen noch ${rest} Gegenstände im Leitner-Stand`));
    // Zurueck auf die Ebenenwahl - das Forscherbuch braucht die Aufkleber
    // der Kontinente aus der ersten Sitzung.
    await p.click('.schirm.da #zur');
    await p.waitForSelector('.schirm.da #raus', { timeout: 5000 });
    await p.click('.schirm.da #raus');
    await p.waitForSelector('.schirm.da [data-ebene]', { timeout: 5000 });
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
    // (Regel 10).
    /* G18 - was nach der Aufgabe stehen bleibt, ruht.
     *
     * Der Befund (QS14): nach der richtigen Antwort blieben die uebrigen
     * Antwortknoepfe stehen und sahen weiter antippbar aus. Gemessen im
     * Lob - drei Knoepfe, Deckkraft 1, `pointer-events:auto`, volle
     * 3-Punkt-Kante; der Griff verschwand still in `if (erledigt)
     * return`.
     *
     * GEPRUEFT WIRD IN BEIDE RICHTUNGEN, und die erste Haelfte ist die
     * wichtigere: WAEHREND der Aufgabe muessen die Etiketten greifbar
     * sein. Ohne sie waere die Pruefung durch Knoepfe zu erfuellen, die
     * IMMER ruhen - also durch ein Spiel, das man nicht spielen kann.
     * Eine Wirkung, die man nicht abschaltet, ist nicht gemessen. */
    const etiketten = () => p.evaluate(() => [...document
      .querySelectorAll('.schirm.da .etikett')].map(e => {
        const st = getComputedStyle(e);
        return { weg: e.classList.contains('weg'), griff: st.pointerEvents,
          deckkraft: +st.opacity, kante: st.boxShadow !== 'none' };
      }));
    /* Erst warten, bis die Etiketten DA sind. Sie laufen gestaffelt ein
       (`--rang`), und beim ersten Anlauf habe ich mitten hinein gemessen:
       „0 von 4 greifbar", Deckkraft 0. Die Messung war rot, die App war
       in Ordnung - eine Messstelle, die zu frueh liegt, misst die
       Animation und nicht die Sache. */
    await p.waitForFunction(() => {
      const e = [...document.querySelectorAll('.schirm.da .etikett')];
      return e.length > 1 && e.every(x => +getComputedStyle(x).opacity > 0.9);
    }, null, { timeout: 5000 });
    const g18vorher = await etiketten();
    const lebendig = g18vorher.filter(e => e.griff === 'auto' && e.deckkraft > 0.9 && e.kante);
    if (lebendig.length < 2)
      merke('spielen', new Error(`vor der Antwort sind nur ${lebendig.length} von `
        + `${g18vorher.length} Etiketten greifbar — dann prüft die Messung danach nichts`));

    await loese(p);
    /* Gemessen wird INNERHALB des Lobs, und das ist knapp: mit `?flott`
       dauert es 900 ms, dann steht die naechste Aufgabe da. Beim ersten
       Anlauf wartete ich bis zu drei Sekunden auf den Ruhezustand - und
       mass am Ende vier frische Etiketten der NAECHSTEN Aufgabe, die
       natuerlich wach waren. Die Messung meldete den Fehler, den sie
       selbst gebaut hatte.
       `pointer-events` gilt sofort und wird nicht ueberblendet; Deckkraft
       und Kante laufen ueber `--d-zustand`. Gewartet wird auf die KANTE
       und nicht auf eine Deckkraftschwelle: die Deckkraft unterschreitet
       0,6 schon auf zwei Dritteln des Weges, und dann meldete die Messung
       „Kante ja" ueber einen Uebergang, der noch lief. Gewartet wird auf
       den ZUSTAND, nicht auf eine Frist. */
    await p.waitForFunction(() => [...document
      .querySelectorAll('.schirm.da .etikett')]
      .filter(e => !e.classList.contains('weg'))
      .every(e => getComputedStyle(e).boxShadow === 'none'), null, { timeout: 600 })
      .catch(() => {});
    const nachher = (await etiketten()).filter(e => !e.weg);
    if (nachher.length >= g18vorher.length)
      merke('spielen', new Error(`im Lob steht kein Etikett auf \`weg\` `
        + `(${nachher.length} von ${g18vorher.length}) — dann ist die Aufgabe schon `
        + `weiter, und diese Messung sieht die nächste statt der gelösten`));
    const wach = nachher.filter(e => e.griff !== 'none' || e.deckkraft > 0.6 || e.kante);
    console.log(`  Knöpfe im Lob (G18):        ${lebendig.length} greifbar vorher, `
      + `${nachher.length} übrig, davon ${wach.length} noch wach`);
    if (wach.length)
      merke('spielen', new Error(`nach der Antwort sehen ${wach.length} von ${nachher.length} `
        + `Antwortknöpfen weiter antippbar aus (Griff ${wach[0].griff}, Deckkraft `
        + `${wach[0].deckkraft}, Kante ${wach[0].kante ? 'ja' : 'nein'}) — sie versprechen `
        + `etwas und tun nichts`));
    await loese(p);
    // Gewartet wird darauf, dass der LAUFENDE Punkt weitergerueckt ist -
    // nicht darauf, dass irgendein Punkt gefaerbt ist.
    //
    // Der Unterschied hat eine Probe gekostet: nach der ersten richtigen
    // Antwort faerbt sich Punkt eins sofort, weitergerueckt wird aber erst
    // 2,6 s spaeter. Die Sitzung stand beim Kreuz also noch auf Aufgabe
    // eins - und dann sieht ein Neuanfang genauso aus wie ein
    // Weiterzaehlen. Die Probe „nach von vorne laeuft die alte Sitzung
    // weiter" blieb gruen, obwohl der Fehler drin war (Regel 10).
    const weiter = await p.waitForFunction(() =>
      [...document.querySelectorAll('.schirm.da .band i')]
        .findIndex(x => x.className === 'jetzt') >= 1,
      null, { timeout: 12000 }).then(() => true).catch(() => false);
    if (!weiter) merke('pause', new Error(
      'die Sitzung steht nach zwei gelösten Aufgaben immer noch bei der ersten — '
      + 'die Probe könnte nicht unterscheiden, ob nach „von vorne" neu angefangen wird'));
    const vorher = await standGroesse(p, 'fiona:bundeslaender');
    if (vorher < 1) merke('pause', new Error(
      'vor der Pausenprobe steht kein Fortschritt in den Bundeslaendern — '
      + 'die Probe koennte nichts loeschen und saehe trotzdem gruen aus'));

    await p.click('.schirm.da #zur');
    const pause = await p.waitForSelector('.schirm.da #null', { timeout: 5000 }).catch(() => null);
    if (!pause) merke('pause', new Error('das Kreuz im Spiel fuehrt nicht in die Pause'));
    else {
      const erst = (await pause.textContent()).trim();
      await pause.click();
      await bis(p, () => /Wirklich/.test(
        document.querySelector('.schirm.da #null')?.textContent || ''), 3000);
      const nachfrage = (await p.textContent('.schirm.da #null')).trim();
      if (!/Wirklich/.test(nachfrage)) merke('pause', new Error(
        `der erste Tipper loescht sofort — er fragt nicht nach (steht: „${nachfrage}")`));
      await p.click('.schirm.da #null');
      await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });
      // Gewartet wird auf die ABLAGE, nicht auf eine Frist: das Loeschen
      // laeuft asynchron weiter, nachdem der Bildschirm schon steht.
      // Bleibt etwas stehen, laeuft die Grenze ab - und die Zaehlung
      // gleich darunter meldet genau das.
      await bis(p, () => new Promise(ja => {
        const a = indexedDB.open('lernkiste');
        a.onsuccess = () => { const g = a.result.transaction('fortschritt', 'readonly')
          .objectStore('fortschritt').get('fiona:bundeslaender');
          g.onsuccess = () => ja(Object.keys(g.result || {}).length === 0);
          g.onerror = () => ja(false); };
        a.onerror = () => ja(false);
      }), 4000);
      const nachher = await standGroesse(p, 'fiona:bundeslaender');
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

  /* --- Ein fast leeres Forscherbuch rollt nicht ----------------------
   *
   * Auf dem Zielgeraet (844 x 390) stand das Buch mit ZWEI Aufklebern
   * schon auf 358 Punkten Inhalt bei 322 sichtbaren: die Vorschau unter
   * „Als Nächstes" war zur Haelfte abgeschnitten - zwei graue Halbkarten,
   * von denen ein Kind nicht weiss, dass darunter noch etwas ist.
   *
   * Dass ein VOLLES Buch rollt, ist richtig; ein Album waechst. Geprueft
   * wird deshalb nicht „rollt nie", sondern „rollt nicht, solange wenig
   * drin ist". `passt` kann das nicht sagen: dort darf `.rollen` rollen.
   */
  {
    /* Gestellt wird ein Buch, wie es nach ein paar Sitzungen aussieht:
     * zwei Aufkleber, einer davon sicher. Der Stand aus dem Spieldurchgang
     * oben reicht nicht - er ergibt EINEN Aufkleber, und damit passt auch
     * eine viel zu grosse Karte noch. Eine Pruefung, die nur den
     * guenstigsten Fall sieht, meldet gruen ueber nichts. */
    /* Gestellt wird auf den BUNDESLAENDERN, nicht auf den Kontinenten.
     *
     * Deren Umrisse liegen nicht im Startbuendel - sie werden geholt, wenn
     * die Ebene betreten wird. Das Buch hat das nie getan und zeigte auf
     * jeder Karte „undefined": ohne `pfad` faellt der Kasten auf die
     * Rechen-Darstellung zurueck. Gemerkt hat es niemand, weil dieser Test
     * das Buch bisher NACH dem Spielen oeffnete - da ist die Geometrie
     * laengst da. Hier wird es davor geoeffnet, so wie ein Kind es tut,
     * das gestern gespielt hat.
     */
    const q = await neueSeite({ width: 844, height: 390 }, ctx);
    /* Zwei Laender UND eine halbe Rechenebene (Q35).
     *
     * Bis hierher stand hier nur `bundeslaender`, und das Buch zeigte
     * daraufhin GENAU EINE Karte: seit Q28 fasst eine Ebene MIT Landkarte
     * ihre Aufkleber zu einer Albumkarte zusammen, auf der die gekonnten
     * Gebiete farbig liegen. Schoen - aber damit hatte die Ueberlaufprobe
     * darunter nichts mehr zu messen, und die stehende Gegenprobe „das
     * Buch rollt wieder beim zweiten Aufkleber" bewies seitdem nichts.
     * Nachgemessen: sechs statt zwei gepflanzte Laender aendern die Zahl
     * der Karten nicht, sie bleibt eins.
     *
     * Einzelne Aufkleber gibt es nur bei einer Ebene OHNE Landkarte -
     * Rechnen, Buchstaben. Fuenf von hundert gekonnt heisst: fuenf Kleber
     * im Buch, und weil noch etwas offen ist, steht darunter auch die
     * blasse Vorschau. Erst damit sieht dieses Tor ein Buch, wie ein Kind
     * es sieht. */
    const gepflanzt = await q.evaluate(() => {
      const bl = {}, re = {};
      const D = JSON.parse(document.getElementById('daten').textContent);
      D.deutschland.slice(0, 2).forEach((x, i) => bl[x.id] = { fach: i ? 3 : 5,
        hoechstes: i ? 3 : 5, faellig: 0, richtig: 3, falsch: 0, zuletzt: 0 });
      const vorrat = Rechnen.vorrat();
      vorrat.slice(0, 3).forEach(x => re[x.id] = { fach: 5, hoechstes: 5,
        faellig: 0, richtig: 3, falsch: 0, zuletzt: 0 });
      return { bl, re, ganz: vorrat.length };
    });
    await stelleAblage(q, { fortschritt: { 'fiona:bundeslaender': gepflanzt.bl,
      'fiona:rechnen:plusminus': gepflanzt.re } });
    await q.reload();
    await q.waitForSelector('[data-profil="fiona"]', { timeout: 15000 });
    await q.click('[data-profil="fiona"]');
    // Auf die Ebenenwahl, aber NICHT in die Ebene: genau der Weg, auf dem
    // die Umrisse noch nicht geholt sind.
    await zurEbenenwahl(q, 'bundeslaender');
    await q.click('#buch');
    await q.waitForSelector(BUCHDA);
    await bis(q, () => !!document.querySelector('.schirm.da .rollen'), 4000);
    /* Und WARTEN, bis der alte Bildschirm weg ist (Q35).
     *
     * Bis hierher wurde gemessen, sobald `.rollen` im Baum stand - mitten
     * in der Ueberblendung. Auf dem Bild lagen dann zwei Bildschirme
     * uebereinander, die Ebenenwahl noch halb sichtbar, und `scrollHeight`
     * war die Summe von beidem: 794 Punkte statt 318. Der Befund „das Buch
     * rollt" haette also die Ueberblendung gemeldet, nicht das Buch.
     *
     * Gewartet wird auf die SACHE, nicht auf eine Zahl von Millisekunden:
     * der sichtbare Bildschirm muss ganz da sein und kein zweiter daneben
     * stehen - dieselbe Frage, die `lesbarkeit` vor jeder Aufnahme stellt. */
    await bis(q, () => {
      const alle = [...document.querySelectorAll('.schirm')];
      const da = alle.filter(e => getComputedStyle(e).opacity !== '0'
        && getComputedStyle(e).display !== 'none');
      return da.length === 1 && getComputedStyle(da[0]).opacity === '1';
    }, 4000);
    /* Das Buch hat seit Q44 Kapitel - also wird es DURCHGEBLAETTERT.
     *
     * Die Zaehlungen hier (Karten, blasse, umrisslose) sind Aussagen ueber
     * das BUCH, nicht ueber eine Seite. Als die Reiter kamen, lag die
     * blasse Vorschaukarte auf einer anderen Seite als die offene, und
     * „keine einzige blasse Karte" schlug an - richtig gemessen, falsche
     * Frage. Gezaehlt wird deshalb ueber alle Seiten; die HOEHEN bleiben
     * die der Seite, die beim Aufschlagen dasteht, denn das ist die, die
     * ein Kind zuerst sieht. */
    const bDa = await q.evaluate(() => {
      const r = document.querySelector('.schirm.da .rollen');
      return { sichtbar: Math.round(r.clientHeight), ganz: Math.round(r.scrollHeight),
               /* Wieviel ist von jedem Block ueberhaupt zu sehen?
                *
                * Nicht „liegt sein Anfang unter der Kante" - dann genuegen
                * zwei Punkte Rand, um als sichtbar zu gelten, und die
                * Gegenprobe fiel genau in diese Luecke: mit doppelt hohen
                * Klebern begann die Vorschau zwei Punkte ueber der
                * Unterkante und das Tor blieb still. Gemessen wird der
                * ANTEIL, den ein Block zeigt - anteilig an seiner eigenen
                * Hoehe (Regel 2), damit ein grosser Block nicht mit
                * demselben Saum durchkommt wie ein kleiner. */
                anteile: [...r.children]
                  .map(e => ({ e, k: e.getBoundingClientRect() }))
                  .filter(x => x.k.height > 2)
                  .map(x => ({
                    was: x.e.className.split(' ')[0]
                      + ' „' + (x.e.textContent || '').trim().slice(0, 24) + '"',
                    anteil: Math.max(0, Math.min(x.k.bottom, r.getBoundingClientRect().bottom)
                      - x.k.top) / x.k.height })) };
    });
    /* Durch alle Kapitel zaehlen (Q44) - `bDa` traegt die HOEHEN der Seite,
       die beim Aufschlagen dasteht, die Zaehlungen kommen aus dem ganzen
       Buch. Ohne Reiter ist beides dasselbe. */
    const kartenSeiten = await ueberAlleKapitel(q, () => {
      const karten = [...document.querySelectorAll('.schirm.da .aufkleber, .schirm.da .albumkarte')];
      return { da: karten.length,
               /* Ein Gebiet MUSS einen Umriss zeigen. Der Rechenkasten ist
                * die Notdarstellung, und sein Inhalt war hier „undefined".
                *
                * ... AUSSER den Rechenklebern: die haben von Haus aus
                * keinen (der Aufkleber IST die Aufgabe, siehe `kleber` in
                * spiel.js). Ohne diese Ausnahme meldete die Pruefung acht
                * von neun Karten als umrisslos, sobald das Buch endlich
                * eine Rechenebene enthielt (Q35).
                *
                * Gefragt wird nach `data-art`, NICHT nach der Klasse
                * `rechnen`: die heisst „hat keinen Pfad" und sitzt damit
                * auch auf einem GEBIET, dessen Umriss nicht geladen ist -
                * also genau auf dem Fall, den diese Pruefung fangen soll.
                * Mit der Klasse als Merkmal hat die Gegenprobe „das Buch
                * zeigt Karten ohne Umriss" aufgehoert anzuschlagen. */
               ohneUmriss: karten.filter(k => k.dataset.art !== 'rechnen'
                 && !k.querySelector('svg path')).length,
               rechenkleber: karten.filter(k => k.dataset.art === 'rechnen').length,
               blass: karten.filter(k => !k.classList.contains('da')).length,
               undef: karten.filter(k => /undefined/.test(k.textContent)).length };
    });
    const b = { ...bDa };
    for (const k of ['da', 'ohneUmriss', 'rechenkleber', 'blass', 'undef'])
      b[k] = kartenSeiten.reduce((n, x) => n + x[k], 0);
    if (b.ohneUmriss)
      merke('forscherbuch', new Error(`${b.ohneUmriss} von ${b.da} Karten im Buch zeigen `
        + 'keinen Umriss — das Buch wurde geöffnet, bevor die Geometrie geladen war'));
    if (b.undef)
      merke('forscherbuch', new Error(`auf ${b.undef} Karten im Buch steht „undefined"`));
    console.log(`  Buch auf dem Zielgerät:     ${b.da} Karten (${b.rechenkleber} Rechenkleber, `
      + `${b.blass} blass), ${b.ganz} Punkte Inhalt in ${b.sichtbar} sichtbaren`);
    /* Und die Blindprobe darunter, die hier gefehlt hat (Q35).
     *
     * Nach oben war sie da: ueber acht Karten sagt die Pruefung selbst,
     * dass sie nicht mehr greift. Nach UNTEN nicht - und genau dorthin ist
     * sie gefallen. Seit Q28 fasst eine Ebene mit Landkarte ihre Aufkleber
     * zu EINER Albumkarte zusammen; das Buch hatte damit eine einzige
     * Karte, konnte nicht rollen, und die Ueberlaufprobe war still. Drei
     * Karten sind das Wenigste, bei dem „rollt es schon?" eine Frage ist.
     *
     * Und eine blasse muss dabei sein: die Vorschau „Als Nächstes" ist der
     * einzige Ort, an dem ein Aufkleber OHNE `da` gezeichnet wird. Ohne
     * sie steht die halbe Aufkleber-Gestaltung ungeprueft da - daran ist
     * die Kontrastprobe im Tor `lesbarkeit` still geworden. */
    if (b.da < 3)
      merke('forscherbuch', new Error(`nur ${b.da} Karte${b.da === 1 ? '' : 'n'} im Buch — `
        + 'dann beweist „es rollt nicht" nichts (Regel 1). Der gepflanzte Fortschritt '
        + 'füllt das Buch nicht mehr'));
    if (!b.blass)
      merke('forscherbuch', new Error('keine einzige blasse Karte im Buch — dann ist der '
        + 'offene Aufkleber hier nie gezeichnet worden, und was er zeigt, ist ungeprüft'));
    /* Gemessen wird, ob etwas GANZ unter dem Rand steht - nicht, ob das
     * Buch rollt (Q35).
     *
     * Hier stand: „bei hoechstens acht Karten darf nichts rollen", und
     * acht Karten waren die zwei Reihen, die auf 844 x 390 passen. Diese
     * Zahl war ein Stellvertreter fuer die Hoehe, und seit Q28 stimmt er
     * nicht mehr: das Buch ist keine Kleberwand mehr, sondern eine Folge
     * von Gruppen - Abzeichen, je Ebene eine Ueberschrift mit Albumkarte
     * oder Kleberreihe, dazu die Vorschau. Sieben Karten koennen in vier
     * Bloecken stehen und 341 Punkte hoch sein.
     *
     * Was ein Kind wirklich trifft, ist nicht das Rollen - ein Album darf
     * rollen, es waechst ja. Es ist, dass ein ganzer Block UNSICHTBAR
     * anfaengt: die Ueberschrift „Als Naechstes" auf der Unterkante und
     * darunter nichts. Genau das war der Zustand vor dieser Runde, und
     * genau das misst diese Zeile - an der Sache, nicht an einem
     * Stellvertreter. */
    /* Ein Viertel. Darunter ist ein Block ein Saum und keine Auskunft:
     * bei der Kleberreihe waeren das 18 von 74 Punkten - der obere Rand
     * der Karten, gerade genug, um zu sehen, DASS da etwas ist. */
    const VIERTEL = 0.25;
    const knapp = b.anteile.filter(x => x.anteil < VIERTEL);
    if (knapp.length)
      merke('forscherbuch', new Error(`${knapp.length} Block${knapp.length === 1 ? '' : 'e'} `
        + `im Buch steht so gut wie ganz unter der Unterkante (${knapp.map(x =>
          `${x.was} ${Math.round(x.anteil * 100)} %`).join(' · ')}) — davon sieht ein Kind `
        + `nicht einmal einen Anfang (${b.ganz} Punkte Inhalt, ${b.sichtbar} sichtbar)`));
    await q.close();
  }

  /* --- Und ein Buch, das nicht mehr auf eine Seite passt (Q44) -------
   *
   * Der Block darueber pflanzt ZWEI Gruppen, und zwei passen. Gemessen
   * auf dem Zielgeraet (844 x 390, 318 Punkte sichtbar): sechs Gruppen
   * sind 842 Punkte Inhalt, und sechs von zwoelf Bloecken fangen erst
   * UNTER der Unterkante an. Fionas Wunsch war ausdruecklich, dass sie
   * immer ALLE sieht.
   *
   * Seit Q44 bekommt das Buch dafuer Kapitelreiter. Geprueft werden die
   * beiden Zusagen, die daran haengen, und zwar getrennt:
   *
   *   1. JEDES Kapitel steht im Streifen, und zwar ganz - sonst weiss ein
   *      Kind, das nicht liest, nicht einmal, dass es das Kapitel gibt.
   *   2. Auf JEDER Seite ist jeder Block zu sehen - sonst hat das
   *      Blaettern das Rollen nur ersetzt.
   *
   * Die zweite wird an ALLEN Kapiteln gemessen, nicht nur am ersten: die
   * Seiten sind verschieden hoch, und die hoechste ist die, die kippt.
   */
  {
    const q = await neueSeite({ width: 844, height: 390 }, ctx);
    /* Fuenf Ebenen, davon zwei mit Landkarte und drei ohne. Die Mischung
       ist wichtig: eine Albumkarte und eine Kleberreihe sind verschieden
       hoch, und ein Streifen, der nur mit lauter gleichen Seiten geprueft
       waere, bewiese fuer den gemischten Fall nichts. */
    const viele = await q.evaluate(() => {
      const D = JSON.parse(document.getElementById('daten').textContent);
      const gut = { fach: 5, hoechstes: 5, faellig: 0, richtig: 3, falsch: 0, zuletzt: 0 };
      const aus = (ids) => { const o = {}; ids.forEach(x => o[x] = { ...gut }); return o; };
      return {
        'fiona:kontinente':    aus(D.kontinente.slice(0, 3).map(x => x.id)),
        'fiona:bundeslaender': aus(D.deutschland.slice(0, 3).map(x => x.id)),
        'fiona:rechnen:plusminus': aus(Rechnen.vorrat().slice(0, 4).map(x => x.id)),
        'fiona:schreiben:buchstaben': aus(['bu:P', 'bu:F', 'bu:X', 'bu:O']),
        'fiona:schreiben:diktat':     aus(['di:P', 'di:F', 'di:X']) };
    });
    await stelleAblage(q, { fortschritt: viele });
    await q.reload();
    await q.waitForSelector('[data-profil="fiona"]', { timeout: 15000 });
    await q.click('[data-profil="fiona"]');
    await zurEbenenwahl(q, 'bundeslaender');
    await q.click('#buch');
    await q.waitForSelector(BUCHDA);
    /* Dieselbe Frage wie oben: der alte Bildschirm muss weg sein, sonst
       ist `scrollHeight` die Summe von zweien (Q35). */
    await bis(q, () => {
      const da = [...document.querySelectorAll('.schirm')]
        .filter(e => getComputedStyle(e).opacity !== '0');
      return da.length === 1 && getComputedStyle(da[0]).opacity === '1'
        && !!da[0].querySelector('.rollen');
    }, 8000);

    const streifen = await q.evaluate(() => {
      const st = document.querySelector('.schirm.da .buchreiter');
      if (!st) return { reiter: 0 };
      const sk = st.getBoundingClientRect();
      return { reiter: st.querySelectorAll('[data-kap]').length,
               /* Waagerecht gemessen, weil der Streifen waagerecht rollt.
                  Anteilig an der eigenen Breite (Regel 2), damit ein
                  langer Name nicht mit demselben Saum durchkommt wie ein
                  kurzer. */
               teils: [...st.querySelectorAll('[data-kap]')].map(r => {
                 const k = r.getBoundingClientRect();
                 return { was: (r.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 22),
                          anteil: Math.max(0, Math.min(k.right, sk.right) - Math.max(k.left, sk.left))
                            / (k.width || 1) };
               }) };
    });
    /* Die Blindprobe: ohne genug Kapitel misst dieser Block nichts.
       Drei ist die Grenze, ab der es den Streifen ueberhaupt gibt - steht
       er bei fuenf gepflanzten Ebenen nicht da, ist entweder der Stand
       nicht angekommen oder die Grenze verstellt, und in beiden Faellen
       beweist „kein Befund" hier nichts (Regel 1). */
    if (streifen.reiter < 3)
      merke('forscherbuch', new Error(`das Buch hat nur ${streifen.reiter} Kapitelreiter, `
        + 'obwohl fünf Ebenen gepflanzt wurden — dann prüft dieser Abschnitt die '
        + 'Kapitel gar nicht, er findet nur keine'));
    else {
      const halb = streifen.teils.filter(x => x.anteil < 1);
      if (halb.length)
        merke('forscherbuch', new Error(`${halb.length} von ${streifen.reiter} Kapiteln stehen `
          + `nicht ganz im Streifen (${halb.map(x => `„${x.was}" ${Math.round(x.anteil*100)} %`)
            .join(' · ')}) — ein Kind, das nicht liest, sieht dann nicht, dass es sie gibt`));
      /* Und jetzt jede Seite einzeln. Gemessen wird nach dem Klick am
         WIRKLICHEN Inhalt des Kastens, nicht an einer Vorausberechnung:
         welche Seite wie hoch wird, entscheidet der Bildschirm. */
      const eng = [], gleich = [], genutzt = [];
      const seiten = new Set();
      for (let i = 0; i < streifen.reiter; i++) {
        await q.$$eval('.schirm.da [data-kap]', (rs, k) => rs[k].click(), i);
        const seite = await q.evaluate(() => {
          const r = document.querySelector('.schirm.da .rollen');
          const rk = r.getBoundingClientRect();
          return { was: document.querySelector('.schirm.da [data-kap].da')?.textContent
                     .trim().replace(/\s+/g, ' ').slice(0, 22) || '(keins offen)',
                   /* Nur Bloecke, die es WIRKLICH gibt (> 2 px).
                      Der erste Anlauf zaehlte auch die - dieselbe Grenze
                      wie im Block darueber. `.abzkopf` ist auf dem kurzen
                      Querformat `display:none`, also null hoch; geteilt
                      durch die Ersatz-Eins ergab das den Anteil 0, und die
                      Pruefung meldete eine Ueberschrift als unsichtbar,
                      die gar nicht da sein soll. */
                   bloecke: [...r.children]
                     .map(e => ({ k: e.getBoundingClientRect() }))
                     .filter(x => x.k.height > 2)
                     .map(x => ({ anteil: Math.max(0, Math.min(x.k.bottom, rk.bottom)
                       - Math.max(x.k.top, rk.top)) / x.k.height }))
                     .filter(x => x.anteil < 1).length,
                   /* WIEVIEL DER SEITE BENUTZT WIRD (G15b).
                    *
                    * Die Pruefung darueber fragt, ob jeder Block ins Bild
                    * passt. Das ist nicht dieselbe Frage wie: wird die
                    * Seite genutzt? G15 hat beides verwechselt und drei
                    * Anlaeufe gebraucht - die Karte wuchs, ein Block fiel
                    * heraus, und das leere Band blieb trotzdem.
                    *
                    * Gemessen wird der unterste Rand aller Bloecke gegen
                    * die Hoehe des Kastens. Anteilig, nicht in Punkten
                    * (Regel 2): der Kasten ist auf jedem Geraet anders
                    * hoch. */
                   genutzt: (() => {
                     const bs = [...r.children].map(e => e.getBoundingClientRect())
                       .filter(k => k.height > 2);
                     if (!bs.length || rk.height <= 0) return null;
                     const unten = Math.max(...bs.map(k => k.bottom));
                     return Math.round(100 * (unten - rk.top) / rk.height);
                   })(),
                   ganz: [...r.children].filter(e =>
                     e.getBoundingClientRect().height > 2).length,
                   /* Und WAS auf der Seite steht - als Fingerabdruck.
                      Ohne den waere ein Reiter, der die Seite gar nicht
                      austauscht, hier gruen: die Marke wandert, sechs
                      Reiter stehen da, und darunter immer dasselbe. Genau
                      das stellt die Gegenprobe „ein Kapitelreiter
                      blaettert nicht" her, und sie hat diese Luecke
                      gefunden. */
                   abdruck: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
        });
        if (seite.bloecke) eng.push(`„${seite.was}" ${seite.bloecke} von ${seite.ganz}`);
        if (seite.genutzt !== null) genutzt.push([seite.was, seite.genutzt]);
        if (seiten.has(seite.abdruck)) gleich.push(`„${seite.was}"`);
        seiten.add(seite.abdruck);
      }
      if (eng.length)
        merke('forscherbuch', new Error(`auf ${eng.length} von ${streifen.reiter} Kapitelseiten `
          + `steht nicht alles im Bild (${eng.join(' · ')}) — dann hat das Blättern das `
          + 'Rollen nur ersetzt'));
      if (genutzt.length) {
        const schlecht = genutzt.filter(([, a]) => a < BUCH_GENUTZT_MIN);
        console.log(`  Buchseiten genutzt:         `
          + genutzt.map(([w, a]) => `${w.split(' ').pop()} ${a} %`).join(' · ')
          + `  (Ratsche: mindestens ${BUCH_GENUTZT_MIN} %)`);
        if (schlecht.length)
          merke('forscherbuch', new Error(`${schlecht.length} von ${genutzt.length} `
            + `Kapitelseiten nutzen weniger als ${BUCH_GENUTZT_MIN} % ihrer Hoehe `
            + `(${schlecht.map(([w, a]) => `„${w}" ${a} %`).join(' · ')}) — `
            + 'das Forscherbuch ist die Sammlung, und eine halbleere Seite zeigt sie nicht'));
      }
      if (gleich.length)
        merke('forscherbuch', new Error(`${gleich.length} von ${streifen.reiter} Kapiteln zeigen `
          + `dieselbe Seite wie ein anderes (${gleich.join(' · ')}) — der Reiter markiert sich, `
          + 'blättert aber nicht'));
      if (!eng.length && !gleich.length)
        console.log(`  Buch mit Kapiteln:          ${streifen.reiter} Reiter, alle ganz im `
          + `Streifen; ${seiten.size} verschiedene Seiten, jeder Block ganz im Bild`);

      /* Und der Satz zum Mitnehmen im Buch (Q46).
       *
       * Zwei Zusagen, und die zweite ist die, die still ausfallen kann:
       * er STEHT auf einer Kartenseite, und ein Tipp auf die Karte
       * BLAETTERT ihn weiter. Das Blaettern ist der Teil, den ein Blick
       * nicht meldet - die Seite sieht danach genauso aus, nur mit einem
       * anderen Satz, und wer den ersten nicht auswendig kann, merkt
       * nichts.
       *
       * Gemessen wird gegen die Satztafel im gebauten Bildschirm, nicht
       * gegen eine Liste hier - sonst prueft der Abschnitt seine eigene
       * Annahme (Regel 14: das Modell haengt sonst am Gemessenen). */
      const mitKarte = await q.evaluate(() => {
        const r = [...document.querySelectorAll('.schirm.da [data-kap]')];
        return r.findIndex(x => x.dataset.kap.startsWith('laender')
          || ['kontinente', 'bundeslaender'].includes(x.dataset.kap));
      });
      if (mitKarte < 0)
        merke('forscherbuch', new Error('kein einziges Kapitel mit Landkarte im Buch — dann '
          + 'ist der Satz zum Mitnehmen hier gar nicht geprüft, er fehlt nur nicht'));
      else {
        await q.$$eval('.schirm.da [data-kap]', (rs, k) => rs[k].click(), mitKarte);
        const vorher = await q.evaluate(() => {
          const p = document.querySelector('.schirm.da .buchsatz');
          return { satz: p?.textContent.trim() || '',
                   /* Wieviele Gebiete dieser Gruppe ueberhaupt einen Satz
                      haben - unter zweien gibt es nichts zu blaettern,
                      und „er blaettert nicht" beweist nichts (Regel 1). */
                   karten: document.querySelectorAll('.schirm.da .albumkleber').length };
        });
        if (!vorher.satz)
          merke('forscherbuch', new Error('auf der Kartenseite im Buch steht kein Satz zum '
            + 'Mitnehmen — im Spiel steht er einen Augenblick, hier soll man ihn nachlesen'));
        else if (vorher.karten < 2)
          console.log(`  Satz im Buch:               „${vorher.satz.slice(0, 40)}…" `
            + `(nur ${vorher.karten} Aufkleber — zum Blättern zu wenig)`);
        else {
          await q.click('.schirm.da .albumkarte');
          const nachher = await q.evaluate(() =>
            document.querySelector('.schirm.da .buchsatz')?.textContent.trim() || '');
          if (nachher === vorher.satz)
            merke('forscherbuch', new Error(`ein Tipp auf die Albumkarte blättert den Satz `
              + `nicht weiter — es bleibt bei „${vorher.satz.slice(0, 50)}…", obwohl `
              + `${vorher.karten} Gebiete gesammelt sind`));
          else console.log(`  Satz im Buch:               steht da und blättert `
            + `(„${vorher.satz.slice(0, 28)}…" → „${nachher.slice(0, 28)}…")`);
        }
      }
    }
    await q.close();
  }

  /* --- Ein Tippen, das dauert, sagt das auch -------------------------
   *
   * Das Forscherbuch holt die Umrisse nach, die es zeigt. Mit Lager kostet
   * das 0,66 s; OHNE Lager und auf 3G wurden 3,0 s bei einer und 7,5 s bei
   * fuenf nachzuladenden Ebenen gemessen - und so lange stand der ALTE
   * Bildschirm da. Ein Kind tippt auf „Forscherbuch" und sieben Sekunden
   * lang passiert nichts.
   *
   * Geprueft wird der schlimmste Fall, weil nur dort etwas zu sehen ist:
   * gedrosselt und ohne Service Worker, also beim allerersten Besuch.
   */
  {
    /* Wie lange nach einem SCHNELLEN Wechsel nachgesehen wird, ob doch noch
       ein Wartezeichen auftaucht. Muss ueber der Schwelle in `zeige()`
       liegen (300 ms), sonst kaeme es erst nach dem Hinsehen. */
    const WARTEZEICHEN_LUFT = 600;
    /* Ein EIGENER Kontext, und der Service Worker wird dort GESPERRT.
     *
     * Der gemeinsame Kontext hat laengst einen registrierten Service
     * Worker - die frueheren Abschnitte haben ihn angelegt. Ein
     * `delete navigator.serviceWorker` im Seitenskript hilft dagegen
     * nicht: ein aktiver Worker uebernimmt die Seite beim Navigieren,
     * ganz ohne die JS-Schnittstelle. Die Ebenendaten kamen also aus dem
     * Lager, es gab nichts nachzuladen, und die Probe suchte ein
     * Wartezeichen fuer eine Wartezeit, die es nicht gab. Sie meldete rot
     * ueber etwas, das in Ordnung war.
     *
     * `serviceWorkers: 'block'` sperrt ihn fuer diesen Kontext. */
    const kalt = await b.newContext({ viewport: { width: 844, height: 390 },
      locale: 'de-DE', serviceWorkers: 'block' });
    const q = uhrenBuchfuehrung(await kalt.newPage());
    await q.setViewportSize({ width: 844, height: 390 });
    const cdp = await kalt.newCDPSession(q);
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 100,
      downloadThroughput: 750 * 1024 / 8, uploadThroughput: 250 * 1024 / 8 });
    await q.goto(ADRESSE + '?flott', { waitUntil: 'domcontentloaded' });
    await q.waitForSelector('[data-profil="fiona"]', { timeout: 30000 });
    // Aufkleber in DREI Ebenen — drei Dateien zum Nachladen.
    const dreiEbenen = await q.evaluate(() => {
      const D = JSON.parse(document.getElementById('daten').textContent);
      return [['bundeslaender', D.deutschland.map(x => x.id)],
        ...Object.entries(D.laender).map(([k, l]) => [`laender:${k}`, l.map(x => x.a3)])].slice(0, 3);
    });
    await stelleAblage(q, { fortschritt: Object.fromEntries(dreiEbenen.map(([id, ids]) =>
      [`fiona:${id}`, Object.fromEntries(ids.slice(0, 2).map(g =>
        [g, { fach: 4, hoechstes: 4, faellig: 0, richtig: 3, falsch: 0, zuletzt: 0 }]))])) });
    await q.reload({ waitUntil: 'domcontentloaded' });
    await q.waitForSelector('[data-profil="fiona"]', { timeout: 30000 });
    await q.click('[data-profil="fiona"]');
    await zurEbenenwahl(q, 'bundeslaender');
    /* `$eval(...click())` statt `click()`, und die Uhr DANACH.
     *
     * Playwrights `click()` wartet erst auf Erreichbarkeit und Ruhe der
     * Seite - im ersten Anlauf lagen dadurch 2,7 s zwischen `t0` und dem
     * wirklichen Klick, und die Probe meldete das Wartezeichen als „erst
     * nach 3045 ms". Es stand laengst da; gemessen wurde nur von zu weit
     * vorn. Eine Zahl ohne ihre Messstelle (Regel 5). */
    /* Die Seite MUSS vorn sein.
     *
     * `bis()` pollt ueber `requestAnimationFrame`, und das laeuft in einer
     * Seite im Hintergrund nicht. Der Kontext hat hier mehrere Seiten
     * offen; die Probe sah das Wartezeichen deshalb erst, als der Poller
     * zufaellig wieder lief - sie meldete „erst nach 3009 ms" fuer etwas,
     * das nach 457 ms dastand. Nachgemessen mit einer Schleife aus
     * `evaluate` (die laeuft auch im Hintergrund), und der Unterschied war
     * eindeutig. */
    await q.bringToFront();
    await q.waitForSelector('.schirm.da #buch');
    const t0 = Date.now();
    await q.$eval('.schirm.da #buch', x => x.click());
    /* Gepollt mit `evaluate`, nicht mit `waitForFunction`.
     *
     * Gemessen wird eine Zeitspanne, also darf der Poller sie nicht selbst
     * verzerren. `waitForFunction` pollt ueber `requestAnimationFrame`;
     * eine `evaluate`-Schleife laeuft in jedem Fall. */
    let zeichen = false, bisZeichen = 0;
    for (let i = 0; i < 80 && !zeichen; i++) {
      zeichen = await q.evaluate(() => !!document.querySelector('.schirm.warten.da'));
      bisZeichen = Date.now() - t0;
      if (!zeichen) await q.messtakt(60);
    }
    await q.waitForSelector(BUCHDA, { timeout: 30000 });
    const bisBuch = Date.now() - t0;
    // Und es muss auch wieder WEG sein.
    const weg = await bis(q, () => !document.querySelector('.schirm.warten'), 3000);
    /* Und jetzt der SCHNELLE Weg zurueck.
     *
     * Ein Wartezeichen, dessen Uhr nicht abbestellt wird, faellt hier auf
     * und nicht oben: bei einem Bildschirm, der in Millisekunden steht,
     * kommt es 300 ms SPAETER dazu und bleibt liegen, bis der naechste
     * Wechsel es wegraeumt. Beim langsamen Weg wird es dagegen ohnehin
     * zusammen mit dem alten Bildschirm entfernt - dort ist nichts zu
     * sehen. Die erste Fassung dieser Probe hat genau daneben gemessen. */
    await q.$eval('.schirm.da #zur', x => x.click());
    // Wohin der Weg zurueck fuehrt, ist hier gleichgueltig - gebraucht wird
    // nur EIN Wechsel, der sofort steht. Deshalb auf „das Buch ist weg"
    // warten und nicht auf einen bestimmten Bildschirm.
    await bis(q, () => !document.querySelector('.schirm.da .aufkleber, .schirm.da .albumkarte'), 10000);
    await q.ausbleiben(WARTEZEICHEN_LUFT);
    const spaet = await q.evaluate(() => !!document.querySelector('.schirm.warten'));
    if (spaet) merke('warten', new Error('nach einem Bildschirm, der sofort da war, '
      + 'taucht das Wartezeichen trotzdem noch auf — seine Uhr wird nicht abbestellt'));
    await kalt.close();
    console.log(`  Warten sichtbar:            nach ${bisZeichen} ms, Buch nach ${bisBuch} ms `
      + `(3G, ohne Lager)`);
    if (bisBuch < 600)
      merke('warten', new Error(`das Buch stand schon nach ${bisBuch} ms — die Drossel greift `
        + 'nicht, und damit prüft dieser Abschnitt nichts'));
    else if (!zeichen)
      merke('warten', new Error(`nach dem Tippen auf „Forscherbuch" passiert ${bisBuch} ms lang `
        + 'nichts — kein Wartezeichen'));
    if (!weg) merke('warten', new Error('das Wartezeichen bleibt stehen, nachdem das Buch da ist'));
  }

  /* --- Eine offene Kontinentrunde geht nicht wieder zu ----------------
   *
   * Fionas Kontinente kommen in zwei Runden: vier zuerst, zwei weitere,
   * sobald jeder der ersten vier einmal gesessen hat. „Einmal gesessen"
   * las bis hierher das LAUFENDE Leitner-Fach - und das faellt bei jeder
   * falschen Antwort auf 1 zurueck. Gemessen an einem Jahr Spiel war
   * Runde 2 damit an 47 von 208 Sitzungen wieder verschlossen: Fiona
   * setzte sich hin, und Asien und Nordamerika waren weg.
   *
   * Gestellt wird genau dieser Stand: alle vier der ersten Runde waren
   * schon einmal in Fach 3 und stehen heute wieder auf 1. Danach muss die
   * Ebene alle SECHS Kontinente kennen.
   *
   * Welche Kontinente zur ersten Runde gehoeren, steht in den DATEN, nicht
   * hier - sonst prueft der Rauchtest seine eigene Abschrift.
   */
  {
    const ersteRunde = KONTINENTE.filter(k => k.runde === 1).map(k => k.id);
    const alle = KONTINENTE.length;
    if (ersteRunde.length >= alle)
      merke('runden', new Error('alle Kontinente stehen in Runde 1 — '
        + 'diese Prüfung kann nichts mehr zeigen'));
    // Hoechststand 3 (hatte einen Aufkleber), heute wieder Fach 1.
    const wiederFaellig = Object.fromEntries(ersteRunde.map(id =>
      [id, { fach: 1, hoechstes: 3, faellig: 0, richtig: 2, falsch: 1, zuletzt: 0 }]));
    await stelleAblage(p, { fortschritt: { 'fiona:kontinente': wiederFaellig } });
    // Eine EIGENE Seite: der gestellte Stand soll die Wege nicht
    // durcheinanderbringen, die danach noch geprueft werden. Sie sieht
    // dieselbe Ablage - die haengt an der Herkunft, nicht am Fenster.
    const q = await neueSeite({ width: 1180, height: 820 }, ctx);
    await q.click('[data-profil="fiona"]');
    await zurEbenenwahl(q, 'kontinente');
    const wieviele = await q.evaluate(() => {
      const k = document.querySelector('[data-ebene="kontinente"]');
      const m = k && k.querySelector('.klebermarke');
      const s = m && (m.getAttribute('aria-label') || '').split('von')[1];
      const z = s && s.match(/\d+/);
      return z ? +z[0] : null;
    });
    console.log(`  Kontinentrunden:            ${wieviele} von ${alle} Kontinenten, `
      + `nachdem alle ${ersteRunde.length} der ersten Runde zurückgefallen sind`);
    if (wieviele === null)
      merke('runden', new Error('die Kachel „Kontinente" nennt ihre Gesamtzahl nicht'));
    else if (wieviele < alle)
      merke('runden', new Error(`nach dem Rückfall stehen nur noch ${wieviele} von ${alle} `
        + 'Kontinenten zur Verfügung — eine schon offene Runde ist wieder zu'));
    await q.close();
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

  /* Wer zuletzt GERUFEN wurde, gewinnt (Q41).
   *
   * `zeige()` ist asynchron. Ohne Vorkehrung raeumt der langsamere Bau
   * beim Fertigwerden alle bisherigen Bildschirme weg - auch den, den der
   * schnellere danach schon hingestellt hat. Uebrig bleibt der
   * Bildschirm, den niemand zuletzt wollte.
   *
   * PROVOZIERT statt abgewartet, und das ist der Punkt. Gefunden wurde
   * der Fehler ueber den langen Weg (`--teil=3/4`, zwoelffach gedrosselt,
   * fuenf Minuten) - und die Gegenprobe dort schlug nur in fuenf von
   * sechs Laeufen an, weil sich die Reihenfolge einstellen MUSS. Eine
   * staerkere Drossel half nicht (einmal von zweimal). Hier dauert
   * dieselbe Frage anderthalb Sekunden und faellt immer gleich aus: zwei
   * Bauten, deren Reihenfolge dieses Tor selbst bestimmt.
   *
   * `zeige` steht global - `spiel.js` wird als gewoehnliches Skript
   * eingebettet, nicht als Modul. */
  {
    const q = await neueSeite({ width: 844, height: 390 }, ctx);
    await q.waitForSelector('[data-profil="fiona"]');
    const wer = await q.evaluate(async () => {
      const bau = (id, ms) => () => new Promise(r => setTimeout(() => {
        const d = document.createElement('div'); d.id = id; r(d);
      }, ms));
      zeige(bau('langsam', 400));   // zuerst gerufen, zuletzt fertig
      zeige(bau('schnell', 0));     // zuletzt gerufen, zuerst fertig
      await new Promise(r => setTimeout(r, 1200));
      /* `#schnell` IST der Bildschirm, nicht sein Kind: `zeige` haengt
       * `.schirm.da` an das Element selbst. `.schirm.da #schnell` suchte
       * einen Nachfahren und fand nie einen - die Pruefung war im ersten
       * Anlauf immer rot, auch mit Waechter. */
      const s = document.getElementById('schnell');
      return { schnell: !!s && s.classList.contains('da'),
               langsam: !!document.getElementById('langsam') };
    });
    if (!wer.schnell || wer.langsam)
      merke('tippen', new Error('zwei Bildschirmwechsel kurz hintereinander: es steht '
        + `${wer.langsam ? 'der ZUERST gerufene' : 'gar keiner'} da — der langsamere `
        + 'Bau hat den schnelleren weggeräumt'));
    else
      console.log('  Zwei Wechsel auf einmal:    der zuletzt gerufene steht da');
    await q.close();
  }

  /* Und was passiert, wenn die Karte NICHT kommt? (Q43)
   *
   * `ebeneLaden` holt die Umrisse einer Laenderebene nach und verspricht:
   * „Schlaegt das Holen fehl, sagt es das statt still eine leere Karte zu
   * zeigen." Bis hierher hat diese Zusage kein Tor geprueft - und zwar aus
   * einem Grund, den man erst sieht, wenn man ihn sucht: der SERVICE
   * WORKER liefert `daten/*.json` aus seinem Lager, und eine Route in
   * Playwright sieht das gar nicht. Nachgemessen mit einer Umleitung auf
   * `**\/daten/**`: kein einziger Aufruf kam an, bis der Kontext den
   * Arbeiter blockierte. Der ganze Nachladeweg lief in jedem Lauf am Tor
   * vorbei.
   *
   * Deshalb ein EIGENER Kontext mit `serviceWorkers:'block'`. Er ist der
   * einzige Ort, an dem das Nachladen ueberhaupt stattfindet. */
  {
    const ohneArbeiter = await b.newContext({ hasTouch: true, isMobile: true,
      locale: 'de-DE', viewport: { width: 844, height: 390 }, serviceWorkers: 'block' });
    let geholtVersuche = 0;
    await ohneArbeiter.route('**/daten/laender-*.json', r => { geholtVersuche++; r.abort(); });
    const k = uhrenBuchfuehrung(await ohneArbeiter.newPage());
    await k.goto(ADRESSE, { waitUntil: 'load' });
    await k.waitForSelector('[data-profil="fiona"]', { timeout: 15000 });
    await k.click('[data-profil="fiona"]');
    await zurEbenenwahl(k, 'laender:australien');
    await k.$eval('.schirm.da [data-ebene="laender:australien"]', e => e.click());
    const sagtEs = await k.waitForFunction(
      () => /fehlt noch/.test(document.querySelector('.schirm.da .titel')?.textContent || ''),
      null, { timeout: 15000 }).then(() => true).catch(() => false);
    if (!geholtVersuche)
      merke('tippen', new Error('die Länderkarte wurde gar nicht erst geholt — dann ist '
        + 'der Nachladeweg hier nicht gegangen, und dann beweist der Satz daneben nichts (Regel 1)'));
    else if (!sagtEs)
      merke('tippen', new Error('die Länderkarte kam nicht, und die App sagt es nicht — '
        + 'ein Kind steht vor einer leeren Karte und weiß nicht, warum'));
    else
      console.log(`  Karte kommt nicht:          nach ${geholtVersuche} Versuch`
        + `${geholtVersuche === 1 ? '' : 'en'} steht „Diese Karte fehlt noch" da`);
    await ohneArbeiter.close();
  }
} catch (e) { merke('tippen', e); }

/* --- Der Regler: kommt er bis in die Sitzung? -------------------------
 *
 * Regel 1 — wer eine Wirkung misst, schaltet sie zuerst ab. Ein Regler im
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
  /* `klang: true` - seit Q4 stehen die beiden Toene ab Werk auf AUS (auf
   * Wunsch der Eltern). Wer sie messen will, schaltet sie ein; das Tor
   * prueft weiter unten, dass ohne dieses Einschalten wirklich nichts
   * kommt. */
  await stelleAblage(p, { einstellungen: { alles: { reihenGeteilt: 0.5, klang: true } } });
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
    await bis(p, () => (window.__toene || []).length > 0, 4000);
    const daneben = await p.evaluate(() => window.__toene.map(t => ({ von: t.von, bis: t.bis })));
    await p.evaluate(() => { window.__toene = []; });
    await p.fill('.schirm.da #rein', String(erste));
    await p.click('.schirm.da #pruef');
    await bis(p, () => (window.__toene || []).length > 0, 4000);
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

  /* Und die beiden Gegenrichtungen: der Schalter, und die Voreinstellung.
   *
   * Regel 1 - wer eine Wirkung misst, schaltet sie zuerst ab. Ohne diese
   * Durchgaenge haette die Gegenprobe „der Ton spielt auch bei
   * abgeschaltetem Ton" gar keinen Gegenstand: bei eingeschaltetem Ton
   * aendert das Entfernen der Sperre nichts, was zu sehen waere.
   *
   * EIN Helfer fuer beide. Der zweite Durchgang stand hier als Abschrift
   * des ersten - 140 Token, die das Tor `doppelt` sofort gemeldet hat.
   * Zwei Faelle, die sich nur in der Ablage unterscheiden, sind ein Fall
   * mit einem Eingang. */
  const stillMessen = async (einstellungen) => {
    await stelleAblage(p, { einstellungen: { alles: einstellungen } });
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
    /* Hier wird ein AUSBLEIBEN geprueft, und darauf kann man nicht warten.
     * Gewartet wird stattdessen auf die Wertung: der Ton wird gespielt,
     * wenn bewertet wird - steht die Wertung, ist er entweder gekommen
     * oder er kommt nicht mehr. Dieselbe Aussage, nur ohne Frist. */
    await bewertet(p);
    return p.evaluate(() => window.__toene.length);
  };

  // Der grosse Schalter: „Ton aus" heisst nicht „nur die Stimme aus" -
  // auch ein eingeschalteter Rueckmeldeton bleibt dann still.
  {
    const trotzdem = await stillMessen({ reihenGeteilt: 0.5, klang: true, ton: false });
    console.log(`  Mit „Ton aus":              ${trotzdem} Schwingungen (erwartet 0)`);
    if (trotzdem > 0) merke('regler',
      new Error(`„Ton aus" ist gesetzt, und es kamen trotzdem ${trotzdem} Schwingungen`));
  }

  /* Und die Voreinstellung (Q4): AB WERK ist es still.
   *
   * Das ist die Zusage, um die die Eltern gebeten haben - „die Musik
   * komplett abschalten" -, und sie steht und faellt mit einem Zeichen in
   * einer Zeile. Eine Voreinstellung kippt beim naechsten Umbau lautlos.
   *
   * Die Ablage sagt hier von Toenen NICHTS: kein `klang`, kein `ton` -
   * genau das, was auf einem frischen Geraet steht. Der grosse Schalter
   * bleibt also an, sonst bewiese der Lauf bloss noch einmal den
   * Durchgang darueber. */
  {
    const abWerk = await stillMessen({ reihenGeteilt: 0.5 });
    console.log(`  Ab Werk, Lautsprecher an:   ${abWerk} Schwingungen (erwartet 0)`);
    if (abWerk > 0) merke('regler', new Error(`ab Werk kamen ${abWerk} Schwingungen `
      + '— der Rückmeldeton steht wieder auf an'));
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
    await durchGruppe(p, 'hauptstaedte');
    await p.waitForSelector('.schirm.da [data-ebene="hauptstaedte"]:not([data-gruppe])',
      { timeout: 15000 });
    await p.$eval('.schirm.da [data-ebene="hauptstaedte"]:not([data-gruppe])', x => x.click());
  await durchVorlaufWenn(p);
    // Die Einweisung zu den Stadtstaaten steht beim ersten Mal davor.
    await p.waitForSelector('.schirm.da #weiter, .schirm.da .karte svg path.ziel', { timeout: 6000 });
    // Neu aufloesen statt einen Griff festzuhalten: zwischen `$` und
    // `click` kann der Bildschirm gewechselt haben, und ein Griff auf ein
    // Element, das nicht mehr am Baum haengt, wirft.
    // `$eval` und nicht `click`: waehrend der Ueberblendung liegt der
    // gehende Bildschirm noch darueber, und Playwright wartet dann dreissig
    // Sekunden auf einen Knopf, der laengst da ist.
    if (await p.$('.schirm.da #weiter'))
      await p.$eval('.schirm.da #weiter', x => x.click()).catch(() => {});
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
      // Der Kasten wird in EINEM Zug geholt, nicht ueber einen Griff:
      // zwischen `$$` und `boundingBox()` kann der Bildschirm gewechselt
      // haben, und dann wirft der Griff „not attached to the DOM". Genau
      // das ist passiert, als in Q17 ein Bildschirm dazukam.
      const bb = await p.evaluate((k) => {
        const e = document.querySelectorAll('.schirm.da .etikett')[k];
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return { x:r.x, y:r.y, width:r.width, height:r.height };
      }, ok.idx);
      if (!bb) break;
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
/* Wie oft ein Kind das englische Wort wirklich gehoert hat.
   Getrennt von `gehoert`, weil es keine Vorlesehilfe ist, sondern die
   Frage - siehe den Englischzweig im Durchgang. */
const gehoertEn = {};
/* Und wieviele Ebenen wurden ihm ueberhaupt VORGELEGT?
 *
 * Frueher stand hier die Gesamtzahl der Ebenen als Sollwert. Das war
 * dieselbe Zahl, solange immer alle gespielt wurden — mit `--kurz` sind
 * es weniger, und der Vergleich waere gegen eine Zahl gelaufen, die es
 * in diesem Lauf gar nicht gab. Verglichen wird jetzt Gleiches mit
 * Gleichem: was angesagt wurde, gegen das, was vorgelegt wurde. */
const gespielt = {};
const gespieltEnglisch = {};
const EBENEN_ALLE = ['kontinente', 'laender:europa', 'laender:afrika',
  'laender:asien', 'laender:nordamerika', 'laender:suedamerika',
  'bundeslaender', 'hauptstaedte'];
// Ebenen, die es nur für EIN Kind gibt. Fiona rechnet, Lea (noch) nicht -
// stünde die Rechenkachel bei beiden, wäre eine davon die falsche.
/* Seit R4 spielt auch das Profil „Eltern" mit. Es kommt in denselben
 * Durchgang - der
 * prueft, dass jede Ebene fuer jedes Profil wirklich spielbar ist, und
 * ein drittes Profil, das dort fehlt, waere ungeprueft. */

/* Ruft das Lob jemanden an, der nicht angefeuert werden will?
 *
 * Das Lob steht in der Frage-Zeile, sobald gewertet ist - dieselbe Zeile,
 * aus der der Test schon liest, ob die Antwort ueberhaupt durchkam. Es
 * kostet also nichts extra, und es prueft die eine Eigenschaft, die den
 * Ton ausmacht. */
function lobPruefen(wer, ebene, satz, gesprochen, feiert) {
  /* Die Feier gehoert den Kindern (G14).
   *
   * Gefragt wird BEIDE Richtungen, und das ist der Punkt: eine Pruefung,
   * die nur „bei sachlich keine Feier" sagt, bliebe gruen, wenn die Feier
   * ueberhaupt niemandem mehr erscheint - sie meldete nie etwas und waere
   * kein Beweis (Regel 1). Der Schalter sitzt in TON neben `siegsterne`;
   * wer ihn dort umlegt, faellt hier auf. */
  if (feiert !== undefined) {
    if (SACHLICH.has(wer) && feiert) merke('durchgang', new Error(
      `${wer}/${ebene}: der Lohn feiert. Das Profil steht im Backlog auf „sachlich"`));
    if (!SACHLICH.has(wer) && !feiert) merke('durchgang', new Error(
      `${wer}/${ebene}: der Lohn feiert NICHT, obwohl das Profil kindlich `
      + 'angesprochen wird — dann ist der Augenblick wieder stumm (G14)'));
  }
  if (!SACHLICH.has(wer)) return;
  if (satz && /!/.test(satz)) merke('durchgang', new Error(
    `${wer}/${ebene}: das Lob ruft — „${satz.replace(/^✓ /, '')}". `
    + 'Das Profil steht im Backlog auf „sachlich"'));
  /* Und es wird ueberhaupt nichts gesagt.
   *
   * Zwei Achsen: `vorlesen` gilt der ANSAGE der Aufgabe, der `ton` allem,
   * was die App von sich aus sagt. Bei „sachlich" schweigt sie ganz -
   * kein Lob, kein Hinweis, keine Nachfrage. Gelesen wird NACH der
   * Antwort, denn auf ein Ausbleiben kann man nicht warten. */
  if (gesprochen) merke('durchgang', new Error(
    `${wer}/${ebene}: die App spricht — „${gesprochen.slice(0, 60)}". `
    + 'Bei „sachlich" sagt sie von sich aus nichts'));
}

/**
 * Der Abschluss einer gespielten Aufgabe - fuer jeden Antwortweg gleich.
 *
 * Gezaehlt wird die ANSAGE der Aufgabe, nicht das Lob danach; gelesen wird
 * die Frage-Zeile samt Haken; gemeldet wird eine Antwort, die nicht
 * gewertet wurde; und dann geht es weiter. Stand bis P8 dreimal da - im
 * Schreib-, im Rechen- und im Kartenzweig. Auseinandergelaufen waren die
 * drei noch nicht; sie haetten es aber, denn nur EINE trug den Grund, aus
 * dem hier erst nach der Antwort gelesen wird: auf ein Ausbleiben kann man
 * nicht warten.
 *
 * `hoert` ist der Ausdruck, an dem die Ansage DIESER Aufgabenform zu
 * erkennen ist. `wie` beschreibt fuer die Fehlermeldung den Weg, auf dem
 * geantwortet wurde.
 */
async function abgeschlossen(p, wer, ebene, hoert, wie) {
  const gesagt = await p.evaluate(() => (window.__gesagt || []).join(' | '));
  if (hoert.test(gesagt)) gehoert[wer] = (gehoert[wer] || 0) + 1;
  const { r, feiert } = await p.evaluate(() => {
    const f = document.querySelector('.schirm.da .frage');
    const gut = f?.querySelector('.richtigText');
    return { r: (gut ? '✓ ' : '') + (f?.textContent.trim() || ''),
             /* Gelesen wird die KLASSE, nicht die Bewegung: eine
                Animation laesst sich nicht anhalten und ablesen, eine
                Klasse schon. Sie ist die Zusage, die Bewegung ihre
                Folge. */
             feiert: gut ? gut.classList.contains('feier') : undefined };
  });
  if (!/^✓ /.test(r || ''))
    merke('durchgang', new Error(`${wer}/${ebene}: ${wie} → „${r}"`));
  lobPruefen(wer, ebene, r, gesagt, feiert);
  durchgespielt++;
  await weitergegangen(p);
  await raus(p);
}

const EBENEN_EIGEN = { stephan: ['rechnen:gross', 'hauptstaedte:europa'],
                       violeta: ['rechnen:gross', 'hauptstaedte:europa'],
                       fiona: ['rechnen:plusminus', 'englisch:hoeren',
                               // Die Schreibwelt gehoert nur ihr (N2a, N3).
                               // Ohne diese beiden prueft `durchgang` zwar,
                               // dass keine FREMDE Ebene dasteht, aber nicht,
                               // dass die eigenen ueberhaupt da sind.
                               'schreiben:buchstaben', 'schreiben:diktat',
                               'schreiben:ziffern', 'schreiben:zahlen'],
                       lea: ['rechnen:reihen', 'hauptstaedte:europa', 'englisch:hoeren'] };
/* Gespielt wird mit JEDEM Profil, das die Tabelle nennt - seit N1 sind das
 * vier. Eine feste Liste hier haette Violeta uebersprungen, und ein Profil,
 * das nie gespielt wird, ist ein ungeprueftes Profil. */
/** Was jedes Profil im Durchgang kostet. Die Zahl, nach der geteilt wird. */
const durchgangZeit = {};
if (laeuft('durchgang')) for (const wer of PROFILE_HIER) {
  if (abbruch()) break;
  const angefangen = Date.now();
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
    // Erdkunde und Rechnen hat JEDER. „Schreiben" gehoert nur Fiona - das
    // steht am Profil der Ebene und wird im Abschnitt `schreiben` geprueft.
    for (const w of ['erdkunde', 'rechnen'])
      if (!welten.includes(w))
        merke('durchgang', new Error(`${wer}: die Welt „${w}" fehlt auf der Weltenwahl`));
    const da = [];
    for (const w of welten) {
      await p.click(`.schirm.da [data-welt="${w}"]`);
      await p.waitForSelector('.schirm.da [data-ebene]');
      /* Auch hinter die GRUPPENKACHELN sehen (Q17).
       *
       * Seit zwei Ebenen sich eine Kachel teilen, steht nicht mehr jede
       * Kennung offen in der Wand. Diese Zaehlung ist aber genau die
       * Zusage „jede Ebene ist erreichbar" - sie muss den Schritt also
       * mitgehen, sonst meldete sie ab Q17 einen Fehler, wo keiner ist,
       * und ab der naechsten Gruppe nichts mehr, wo einer waere. */
      const hier = await p.$$eval('.schirm.da [data-ebene]', es => es.map(e => e.dataset.ebene));
      for (const g of await p.$$eval('.schirm.da [data-gruppe]', es => es.map(e => e.dataset.gruppe))) {
        await p.click(`.schirm.da [data-gruppe="${g}"]`);
        // Auf den ZUSTAND warten, nicht auf das Erscheinen einer Kennung:
        // `[data-ebene]` steht auch auf dem Bildschirm, den wir gerade
        // verlassen, und der bleibt die Ueberblendung lang liegen. Erst
        // wenn nur noch EIN Bildschirm da ist und die Gruppenkachel weg
        // ist, sind wir wirklich drin.
        await p.waitForFunction(() => document.querySelectorAll('.schirm.da').length === 1
          && !document.querySelector('.schirm.da [data-gruppe]'), null, { timeout: 20000 });
        hier.push(...await p.$$eval('.schirm.da [data-ebene]', es => es.map(e => e.dataset.ebene)));
        await p.click('.schirm.da #zur');
        await p.waitForFunction(k => document.querySelectorAll('.schirm.da').length === 1
          && !!document.querySelector(`.schirm.da [data-gruppe="${k}"]`), g, { timeout: 20000 });
      }
      const fremd = hier.filter(e => WELT_VON(e) !== w);
      if (fremd.length) merke('durchgang',
        new Error(`${wer}: „${fremd.join(', ')}" steht in der Welt „${w}"`));

      /* Und steht auch WIRKLICH noch eine Gruppenkachel da? (Q32)
       *
       * Die Zaehlung oben geht hinter die Gruppen, damit sie „jede Ebene
       * ist erreichbar" auch nach Q17 noch beweist. Genau dadurch ist sie
       * blind fuer das Gegenteil: faellt die Gruppierung weg, stehen die
       * beiden Hauptstadt-Ebenen einzeln auf der Wand, die Schleife
       * darueber laeuft leer, und alles bleibt gruen.
       *
       * Bis Q31 fiel das trotzdem auf - elf Kacheln liefen aus dem Bild,
       * und `passt` wurde rot. Seit die Wand ab elf Ebenen ein Sechstel
       * breit wird, passen zwoelf: es laeuft nichts mehr heraus, und
       * damit hat die Gegenprobe „die Hauptstädte stehen wieder als zwei
       * Kacheln da" DREIUNDDREISSIG FASSUNGEN lang nichts mehr bewiesen,
       * ohne dass irgendwo etwas rot wurde.
       *
       * Geprueft wird deshalb hier, wo der Gegenstand ohnehin steht, und
       * an der Sache statt an einer Nebenwirkung: gehoeren zwei Ebenen
       * derselben Gruppe an, dann teilen sie sich EINE Kachel. Welche
       * Gruppen es gibt, sagt die Wand selbst - abgeschrieben wird
       * nichts. */
      /* Das SOLL kommt aus der Referenz, nicht aus der Namensform.
       *
       * Der erste Anlauf leitete die Gruppe aus der Kennung ab: alles vor
       * dem Doppelpunkt sei ein Stamm, und zwei Ebenen mit demselben
       * Stamm gehoerten zusammen. Das war rot am gesunden Spiel -
       * `rechnen:plusminus`, `rechnen:reihen` und `rechnen:gross` teilen
       * den Stamm und sind KEINE Gruppe. Eine Regel, die sich ihre
       * Erwartung aus der Schreibweise holt, misst die Schreibweise.
       *
       * Welche Ebenen sich eine Kachel teilen, ist eine Entscheidung aus
       * dem Konzept (Q17: die beiden Hauptstadt-Ebenen). Sie steht
       * deshalb hier ausgeschrieben. Kommt eine zweite Gruppe dazu,
       * gehoert sie hierher - genau wie eine neue Zeile in der
       * Profiltabelle. */
      const GRUPPIERT = ['hauptstaedte'];
      const offen = await p.$$eval('.schirm.da [data-ebene]',
        es => es.filter(e => !e.dataset.gruppe).map(e => e.dataset.ebene));
      for (const stamm of GRUPPIERT) {
        const n = offen.filter(e => e === stamm || e.startsWith(stamm + ':')).length;
        if (n > 1) merke('durchgang', new Error(`${wer}: „${stamm}" steht mit ${n} `
          + 'eigenen Kacheln offen auf der Wand — die Gruppierung greift nicht, '
          + 'und die Wand wird um jede weitere Ebene länger'));
      }
      da.push(...hier);
      await p.click('.schirm.da #zur');
      await p.waitForSelector('.schirm.da [data-welt]');
    }
    for (const e of [...EBENEN_ALLE, ...EBENEN_EIGEN[wer]])
      if (!da.includes(e)) merke('durchgang', new Error(`${wer}: Ebene „${e}" fehlt in der Auswahl`));
    /* Und umgekehrt: keine fremde Ebene. Sonst stünde Fionas Rechnen auch
     * bei Lea, und der Umbau „je Kind" wäre nur behauptet.
     *
     * FREMD heisst „gehoert einem anderen UND nicht mir". Seit es eine
     * Ebene gibt, die zwei Profilen gehoert (`hauptstaedte:europa`, Lea
     * und die Eltern), reicht „gehoert einem anderen" nicht mehr - der
     * erste Anlauf meldete sie bei beiden als fremd. */
    for (const [anderes, eigene] of Object.entries(EBENEN_EIGEN))
      if (anderes !== wer) for (const e of eigene)
        if (!EBENEN_EIGEN[wer].includes(e) && da.includes(e)) merke('durchgang',
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
     * das Tor blieb grün, weil es die Ebene gar nicht aufschlug.
     *
     * Mit E3 ist genau dasselbe ein zweites Mal passiert, und zwar
     * innerhalb einer Stunde: die Gegenprobe „die Englischebene sagt das
     * Wort gar nicht mehr" meldete „`smoke` bleibt grün, obwohl der Fehler
     * drin ist". Von Hand nachgestellt schlug das Tor mit vier Meldungen
     * an - `proben` haengt aber `--kurz` an, und diese Zeile liess die
     * Ebene aus. Die Englischebene ist die VIERTE Art von Bildschirm
     * (Karte, Rechnung, Schreibblatt, Hoeren) und gehoert deshalb hierher.
     * `schreiben` fehlt hier weiterhin - sie hat einen eigenen Abschnitt. */
    const zuSpielen = KURZ
      ? da.filter(e => e === 'kontinente' || e.startsWith('hauptstaedte')
                    || e === 'laender:europa' || e.startsWith('rechnen')
                    || e.startsWith('englisch'))
      : da;
    gespielt[wer] = zuSpielen.length;
    gespieltEnglisch[wer] = zuSpielen.filter(e => e.startsWith('englisch')).length;
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
      // Steht die Ebene hinter einer Gruppenkachel, erst diese oeffnen
      // (Q17). Der Zweig darueber springt `zurEbenenwahl` naemlich, wenn
      // die Kennung schon dasteht - und die GRUPPENKACHEL traegt sie auch.
      await durchGruppe(p, ebene);
      await p.$eval(`.schirm.da [data-ebene="${ebene}"]`, x => x.click());
      /* Wieviele Laender sieht DIESES Kind wirklich?
       *
       * Der Vorlauf zeigt genau den Vorrat der Ebene - eine Karte je
       * Gegenstand. Gezaehlt wird also das, was das Profil zusagt, an dem
       * Ort, an dem es sichtbar wird. */
      /* Der Vorlauf einer RECHENEBENE zeigt Beispiele, nicht den Vorrat.
       *
       * So viele, wie gleich kommen. Zeigte er wieder alle, waeren es
       * hundert Karten und mehr - gemessen 2,8 bis 4,2 Bildschirme. */
      if (ebene.startsWith('rechnen') && SITZUNG[wer]) {
        const da2 = await p.waitForSelector('.schirm.da #los', { timeout: 20000 })
          .then(() => true).catch(() => false);
        if (da2) {
          const n = await p.$$eval('.schirm.da .aufkleber', es => es.length);
          if (n !== SITZUNG[wer]) merke('durchgang', new Error(
            `${wer}/${ebene}: der Vorlauf zeigt ${n} Aufgaben, eine Sitzung hat `
            + `${SITZUNG[wer]} — bei einem erzeugten Vorrat ist das die Tafel, `
            + 'kein Blättern'));
        }
      }
      if (ebene.startsWith('laender:') && TIEFE[wer]) {
        const da2 = await p.waitForSelector('.schirm.da #los', { timeout: 20000 })
          .then(() => true).catch(() => false);
        if (da2) {
          const n = await p.$$eval('.schirm.da .aufkleber', es => es.length);
          /* Erwartet wird die Tiefe ODER die Liste - was kleiner ist.
             Bis D2c hatten alle fuenf Kontinente genau zwoelf Laender, und
             die Tiefe war hoechstens zwoelf; da war die Unterscheidung
             unsichtbar. Seit Europa siebzehn hat und die Eltern bis
             siebzehn spielen, sind es in Afrika trotzdem zwoelf - kein
             Fehler, sondern das Ende der Liste. */
          const vorhanden = (LAENDER[ebene.split(':')[1]] || []).length;
          const soll = Math.min(TIEFE[wer], vorhanden || TIEFE[wer]);
          if (n !== soll) merke('durchgang', new Error(
            `${wer}/${ebene}: ${n} Länder im Vorlauf, erwartet ${soll} `
            + `(Tiefe ${TIEFE[wer]}, ${vorhanden} in der Liste)`));
        }
      }
      await durchVorlaufWenn(p);
      // Auf den Bildschirm warten, der jetzt kommt - Karte, Rechnung oder
      // der Zwischenschirm mit „Weiter". Vorher stand hier eine feste
      // Pause; sie lief 27 Mal, einmal je Ebene und Profil.
      await p.waitForSelector('.schirm.da .karte svg path.ziel, .schirm.da .rechnung, '
        + '.schirm.da .schreibblatt, .schirm.da .engkarte, .schirm.da #weiter',
        { timeout: 15000 }).catch(() => {});
      const w = await p.$('.schirm.da #weiter');
      if (w) await p.$eval('.schirm.da #weiter', x => x.click());
      /* Rechnen: die Aufgabe OHNE Karte.
       *
       * Hier wartet nichts auf `path.ziel` - es gibt keinen. Gespielt wird
       * derselbe Weg, den das Kind geht: die Rechnung lesen, ausrechnen,
       * die Zahl antippen. Kommt die Wertung durch, gilt für diesen
       * Bildschirm dasselbe wie für die Karte: Band, Sterne, Aufkleber.
       */
      /* Schreiben: die Aufgabe ohne Karte UND ohne Antwortliste.
       *
       * Gespielt wird derselbe Weg, den Fiona geht - erst die Vorlage
       * nachfahren, dann denselben Buchstaben frei schreiben. Der
       * Abschnitt `schreiben` sieht dasselbe genauer an; hier gehoert es
       * her, weil `durchgang` beweist, dass JEDE Ebene eines Kindes
       * spielbar ist. Ohne diesen Zweig lief er in eine
       * Zeitueberschreitung und meldete nebenbei, Fiona bekomme eine
       * Aufgabe nicht vorgelesen - beides derselbe fehlende Zweig. */
      if (await p.$('.schirm.da .schreibblatt')) {
        if (VORLESEN[wer])
          await bis(p, () => (window.__gesagt || [])
            .some(t => /Fahre den Buchstaben nach|Fahre sie nach|^Schreib ein |^Schreib die Zahl /
              .test(t.trim())), 4000);
        /* Zwei Ebenen, zwei Wege an die Vorlage.
         *
         * `schreiben:buchstaben` zeigt sie - dann wird sie erst
         * nachgefahren. `schreiben:diktat` zeigt sie nicht; dort kommt
         * der Buchstabe aus der ANSAGE, so wie bei Fiona auch. Ohne
         * diesen Zweig lief der Durchgang in eine Zeitueberschreitung
         * und meldete nebenbei, sie bekomme eine Aufgabe nicht
         * vorgelesen - beides derselbe fehlende Zweig. */
        const gezeigt = await schreibVorlage(p);
        // Je FELD eine Liste von Zuegen. Bei allem ausser den zweistelligen
        // Zahlen ist das genau ein Feld.
        let felder = [gezeigt];
        let zuege = gezeigt;
        if (!zuege.length) {
          /* Was gesucht ist, steht in der ANSAGE - beim Buchstaben als
           * Zeichen, bei der Zahl als Zahlwort. Die Zahl wird dann in ihre
           * Ziffern zerlegt: die 14 sind eine 1 und eine 4, jede in ihrem
           * eigenen Feld. */
          const satz = await p.evaluate(() => (window.__gesagt || [])
            .find(t => /^Schreib (ein|die Zahl) /.test(t)) || '');
          const zB = (satz.match(/^Schreib ein ([A-ZÄÖÜ])/) || [])[1];
          const zW = (satz.match(/^Schreib die Zahl ([a-zäöüß]+)/) || [])[1];
          const zahl = zW && [...Array(21).keys()].find(n => n > 0 && Rechnen.gesprochen(n) === zW);
          const folge = zB ? [zB] : zahl ? String(zahl).split('') : null;
          if (!folge) {
            merke('durchgang', new Error(`${wer}/${ebene}: weder Vorlage noch Ansage — `
              + `gehört wurde „${satz || 'nichts'}"`));
            continue;
          }
          felder = folge.map(z => Schreiben.zuegeVon(z));
        } else {
          for (const d of zuege) await zeichneZug(p, Schreiben.abtasten(d, 26));
        }
        for (let f = 0; f < felder.length; f++)
          await schreibeSauber(p, felder[f], f);
        /* „Fertig" IMMER druecken, wenn er dasteht.
         *
         * Bei einem Feld prueft die App von selbst, sobald die erwartete
         * Zahl von Zuegen da ist - bei zwei waere jeder Zeitpunkt geraten.
         * Der Knopf ist der Weg, den ein Kind in beiden Faellen hat. */
        if (await p.$('.schirm.da #fertigknopf:not([hidden])'))
          await p.click('.schirm.da #fertigknopf');
        wege.add(`${wer}: ${gezeigt.length ? 'nachgefahren' : 'nach Ansage'} geschrieben`);
        await bewertet(p);
        await abgeschlossen(p, wer, ebene,
          /Fahre den Buchstaben nach|Fahre sie nach|Schreib ein |Schreib die Zahl /,
          'nachgefahren und geschrieben');
        continue;
      }
      /* Englisch: die Aufgabe ohne Karte, ohne Rechnung und ohne Frage.
       *
       * Sie steht als eigener Zweig hier und nicht als Sonderfall im
       * Kartenzweig - aus demselben Grund wie Rechnen und Schreiben: es
       * gibt kein `path.ziel`, auf das man warten koennte, und der erste
       * Lauf mit der vierten Welt lief prompt in die Zeitueberschreitung
       * und meldete nebenbei, Fiona bekomme eine Aufgabe nicht vorgelesen.
       * Beides derselbe fehlende Zweig, und es ist inzwischen das DRITTE
       * Mal, dass genau dieser Fehler auftritt.
       *
       * Was hier gespielt wird, ist der Weg des Kindes: hoeren, auf das
       * richtige Bild tippen. Welches richtig ist, steht in der Sitzung -
       * auf dem Bildschirm steht es mit Absicht nicht, das ist die ganze
       * Zusage dieser Ebene. */
      if (await p.$('.schirm.da .engkarte')) {
        const auf = await p.evaluate(() => ({ id: Sitzung?.liste[Sitzung.i]?.id || '',
                                              wort: Sitzung?.liste[Sitzung.i]?.wort || '' }));
        if (!auf.id) {
          merke('durchgang', new Error(`${wer}/${ebene}: die Sitzung nennt kein Ziel`));
          continue;
        }
        /* DAS WORT MUSS GEHOERT WORDEN SEIN - und zwar bei JEDEM Profil.
         *
         * Es zaehlt deshalb NICHT in `gehoert`: der Zaehler dort meint die
         * Vorlesehilfe, und die haengt am Profil („Lea bekam eine Aufgabe
         * vorgelesen, obwohl ihr Profil vorlesen:false sagt"). Hier ist
         * das Wort die FRAGE. Wuerde es dort mitgezaehlt, meldete der
         * Durchgang bei Lea einen Fehler, wo die App genau richtig ist -
         * und beim Ausschalten ohne Ersatz haette niemand mehr gemessen,
         * dass sie es ueberhaupt hoert. Also ein eigener Zaehler und ein
         * eigenes Urteil, statt einer Ausnahme. */
        const gesagt = await p.evaluate(() => (window.__gesagt || []).slice());
        const kam = gesagt.some(x => String(x).trim() === auf.wort);
        /* WER es hoeren muss, steht in der Profiltabelle - Zeile „Ton als
           Gegenstand (Englisch)" - und nicht hier (QS3, Regel 3: das Soll
           kommt aus der Referenz). Geprueft wird in beide Richtungen: wer
           „ja" traegt, muss es hoeren; wer „nein" traegt, darf es nicht
           hoeren. Ohne die zweite Haelfte waere die Zeile eine Notiz und
           keine Eingabe - man koennte sie auf „nein" stellen, und nichts
           wuerde rot. */
        if (TON_GEGENSTAND[wer] && !kam)
          merke('durchgang', new Error(`${wer}/${ebene}: „${auf.wort}" wurde nicht `
            + `gesagt — auf dieser Ebene IST das Wort die Frage, und die `
            + `Profiltabelle sagt für ${wer} „ja" `
            + `(gehört: ${gesagt.join(' | ') || 'nichts'})`));
        else if (!TON_GEGENSTAND[wer] && kam)
          merke('durchgang', new Error(`${wer}/${ebene}: „${auf.wort}" wurde gesagt, `
            + 'obwohl die Profiltabelle für dieses Profil „nein" trägt — dann hängt '
            + 'der Ton nicht an der Tabelle, sondern am Bildschirm'));
        else if (kam) gehoertEn[wer] = (gehoertEn[wer] || 0) + 1;
        await p.$eval(`.schirm.da .engkarte[data-id="${auf.id}"]`, x => x.click());
        wege.add(`${wer}: englisch gehört und getippt`);
        await bewertet(p);
        // Ein Muster, das nie zutrifft: `gehoert` bleibt hier unberuehrt.
        await abgeschlossen(p, wer, ebene, /(?!)/, 'das gehörte Bild getippt');
        continue;
      }
      if (await p.$('.schirm.da .rechnung')) {
        /* Auf die Ansage warten - aber nur, wo eine kommen MUSS.
         *
         * Die App sagt 500 ms nach dem Wechsel an. Wer nichts hoert
         * (Lea, die Eltern), liesse jede Wartebedingung ablaufen; bei
         * ihnen wird `__gesagt` deshalb erst NACH der Antwort gelesen,
         * unten. Dann ist die halbe Sekunde laengst vorbei, und ein
         * Ausbleiben ist genauso beweisbar wie vorher - nur ohne dass
         * jede der 27 Runden 900 ms dafuer bezahlt. */
        if (VORLESEN[wer])
          await bis(p, () => (window.__gesagt || []).some(t => /Was ist/.test(t)), 4000);
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
          return { soll, tippt, zahlen, i: zahlen.map(Number).indexOf(soll),
                   // Der Umschalter traegt seine Weise als Datenfeld - wie
                   // der auf der Karte. Auf der Karte hat ein Tor das
                   // laengst gelesen, hier bis P8 keines: die beiden
                   // Umschalter stehen zweimal da, und nur einer war
                   // bezeugt. Geprueft wird, dass das Datenfeld und der
                   // sichtbare Weg dasselbe sagen.
                   weise: s.querySelector('#rechenweise')?.dataset.weise || null };
        });
        if (!r || (!r.tippt && r.i < 0)) {
          merke('durchgang', new Error(`${wer}/${ebene}: die richtige Antwort `
            + `${r ? r.soll : '?'} steht nicht unter ${r ? r.zahlen.join(', ') : '—'}`));
          continue;
        }
        if (r.weise && (r.weise === 'tippen') !== r.tippt)
          merke('durchgang', new Error(`${wer}/${ebene}: der Umschalter steht auf `
            + `„${r.weise}", auf dem Schirm ist ${r.tippt ? 'das Tippfeld' : 'die Auswahl'} offen`));
        if (r.tippt) {
          await p.fill('.schirm.da #rein', String(r.soll));
          await p.click('.schirm.da #pruef');
        } else {
          await p.$$eval('.schirm.da #auswahl .zahl', (els, i) => els[i].click(), r.i);
        }
        wege.add(`${wer}: rechnen ${r.tippt ? 'geschrieben' : 'angetippt'}`);
        await bewertet(p);
        await abgeschlossen(p, wer, ebene, /Was ist/, `${r.soll} angetippt`);
        continue;
      }
      /* Die umgekehrte Frage (B3) - und sie wird HIER auch gezaehlt.
       *
       * Sie ist ein eigener Antwortweg: kein Etikett, kein Feld, sondern
       * ein Tipp auf die Karte. Am Ende des Abschnitts steht die Liste der
       * gelaufenen Wege gegen ein Soll - ohne diesen Zweig waere die
       * Aufgabenform gespielt, aber nicht bezeugt: sie kaeme im Bericht
       * nicht vor, und niemand saehe es, wenn sie eines Tages ausbleibt. */
      if (await istUmgekehrt(p)) {
        const gesucht = await zeigeAufKarte(p);
        wege.add(`${wer}: umgekehrt gezeigt`);
        await bewertet(p);
        const rU = await p.evaluate(() => ({
          richtig: !!document.querySelector('.schirm.da .frage .richtigText'),
          satz: document.querySelector('.schirm.da .frage').textContent.trim() }));
        if (!rU.richtig)
          merke('durchgang', new Error(`${wer}/${ebene}: „Wo liegt ${gesucht}?" auf `
            + `${gesucht} getippt und nicht gewertet — auf dem Schirm steht „${rU.satz}"`));
        durchgespielt++;
        await weitergegangen(p);
        continue;
      }
      await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 8000 });
      // Wie im Rechenzweig: warten nur, wo eine Ansage kommen muss.
      if (VORLESEN[wer])
        await bis(p, () => (window.__gesagt || []).some(t => /Wie heißt/.test(t)), 4000);
      const z = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        const ziel = s.querySelector('path.ziel');
        const frage = s.querySelector('.frage').textContent;
        const D = JSON.parse(document.getElementById('daten').textContent);
        const alle = [...D.kontinente, ...Object.values(D.laender).flat(), ...D.deutschland];
        const g = alle.find(x => (x.id || x.a3) === ziel.dataset.id) || {};
        const istHaupt = /Hauptstadt/.test(frage);
        // Die Stelle, an der das Ziel obenauf liegt, kommt aus `zielPunkt`
        // in `chromium.mjs` - sie stand hier und wurde von `loese()`
        // gebraucht, das stattdessen den Anker nahm und an Berlin
        // scheiterte. Eine Fassung, zwei Benutzer (Regel 6).
        return { name: istHaupt ? g.hauptstadt : g.name,
                 alias: (!istHaupt && g.aliasse && g.aliasse.length) ? g.aliasse[0] : null,
                 tippfeld: !!s.querySelector('input.eingabe'),
                 weise: s.querySelector('#weise')?.dataset.weise || null,
                 etiketten: [...s.querySelectorAll('.etikett')].map(x => x.textContent.trim()) };
      });
      Object.assign(z, (await zielPunkt(p)) || {});
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
      await abgeschlossen(p, wer, ebene, /Wie heißt/, `„${eingabe}" richtig `
        + (z.tippfeld ? 'getippt' : z.weise === 'antippen' ? 'angetippt' : 'gezogen'));
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
    // Die Rechenaufgaben der Erwachsenen: geprueft am ERSTEN der beiden
    // Elternprofile - beide spielen denselben Vorrat, und zweimal dasselbe
    // Protokoll zu lesen kostet nur Zeit.
    if (wer === PROFIL_IDS[2] && durchgespielt) {
      if (!(await p.$('.schirm.da [data-welt]')) && await p.$('.schirm.da #zur'))
        await p.click('.schirm.da #zur');
      await p.waitForSelector('.schirm.da #eltern', { timeout: 10000 });
      await p.click('.schirm.da #eltern');
      await p.waitForSelector('.schirm.da .ziffern');
      for (let i = 0; i < 4; i++) await p.click('.schirm.da [data-z="0"]');
      await p.waitForSelector('.schirm.da .kacheln', { timeout: 10000 });
      // Der Name muss MITGEGEBEN werden: was hier steht, laeuft im
      // Browser und kennt die Namen des Tors nicht.
      const meine = await p.$$eval('.schirm.da #zuletzt tbody tr',
        (rs, name) => rs.map(r => [...r.cells].map(c => c.textContent.trim()))
                .filter(z => z[1] === name).map(z => z[2]), NAME_VON[wer]);
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
  durchgangZeit[wer] = ((Date.now() - angefangen) / 1000).toFixed(1);
}
/* Ab hier wird geurteilt - und ein Urteil über einen Abschnitt, der nicht
 * gelaufen ist, wäre kein Urteil, sondern ein Fehlalarm. Genau daran ist
 * die erste Fassung dieser Zerlegung gescheitert: „Der Übergang wurde
 * nicht gemessen" bei einem Lauf, der ihn gar nicht messen sollte. */
/* Wieviele Ebenen dieses Profil gespielt hat - ABZUEGLICH der englischen.
   Dort zaehlt `gehoert` nicht mit (das Wort ist die Frage, keine
   Vorlesehilfe), also darf sie auch im Soll nicht stehen; sonst meldete
   der Durchgang bei Fiona „nur 13 von 14 vorgelesen" fuer eine Ebene, die
   sie sehr wohl hoert. Geprueft wird sie durch `gehoertEn` daneben. */
const ENGLISCH_JE = (wer) => (gespielt[wer] !== undefined
  ? gespieltEnglisch[wer] || 0
  : EBENEN_EIGEN[wer].filter(e => e.startsWith('englisch')).length);
const EBENEN_JE = (wer) => (gespielt[wer] ?? (EBENEN_ALLE.length + EBENEN_EIGEN[wer].length))
  - ENGLISCH_JE(wer);
if (laeuft('durchgang')) {
console.log(`  Durchgespielt:              ${durchgespielt} Ebenen × Profile, jede richtige Antwort gewertet`);
console.log(`  Je Profil:                  `
  + Object.entries(durchgangZeit).map(([w, s]) => `${w} ${s} s`).join(' · '));
console.log(`  Antwortwege:                ${[...wege].sort().join(' · ') || 'KEINE'}`);
console.log(`  Profile hier:               ${PROFILE_HIER.join(' · ')}`);
console.log(`  Aufgaben vorgelesen:        Fiona ${gehoert.fiona||0} von ${EBENEN_JE('fiona')}, `
  + `Lea ${gehoert.lea||0} von ${EBENEN_JE('lea')}`);
console.log(`  Englisch gehört (QS3):      `
  + PROFIL_IDS.map(w => `${NAME_VON[w]} ${gehoertEn[w]||0}/${ENGLISCH_JE(w)}`
      + `${TON_GEGENSTAND[w] ? '' : ' (Tabelle: nein)'}`).join(' · ')
  + ' — Soll aus der Zeile „Ton als Gegenstand"');
// Fiona liest noch nicht: JEDE Aufgabe muss angesagt werden. Lea liest -
// bei ihr waere dieselbe Ansage nur Laerm, und das steht in ihrem Profil.
// Die Acht war hier festgenagelt und wurde mit der neunten Ebene falsch.
// Gezaehlt wird jetzt, was Fiona wirklich hat - Erdkunde plus ihr Rechnen.
/* Jedes Urteil hier gilt EINEM Profil - und wird nur gefaellt, wenn
 * dieses Profil in diesem Teil auch gespielt hat.
 *
 * Seit der Durchgang sich auf die vier Profile aufteilt, sieht ein
 * Teillauf nur seine eigenen. Ohne diese Bedingung meldete der Teil, der
 * Lea spielt, „Fiona bekam nur 0 von 13 Aufgaben vorgelesen" - ein
 * Fehlalarm ueber etwas, das er gar nicht gemessen hat. Genau daran ist
 * die erste Zerlegung des Rauchtests schon einmal gescheitert. */
const hier = (wer) => PROFILE_HIER.includes(wer);
if (hier('fiona') && (gehoert.fiona || 0) < EBENEN_JE('fiona'))
  fehler.push(`Fiona bekam nur ${gehoert.fiona||0} von ${EBENEN_JE('fiona')} Aufgaben `
    + 'vorgelesen — sie kann noch nicht lesen, ohne Ansage ist die Ebene für sie '
    + 'nicht spielbar');
/* Und die andere Haelfte: auf der Englischebene muss jedem Profil, das die
   Tabelle mit „ja" fuehrt, das Wort gesagt worden sein. Ohne dieses Urteil
   waere der Ausschluss oben ein Loch - eine Ebene, auf der nie jemand
   etwas hoert, faellt dann keinem mehr auf.

   Die Namen kommen aus der TABELLE und nicht aus einer Liste hier: mit E10
   bis E12 bekommen auch Stephan und Violeta englische Ebenen, und eine
   Liste `['fiona','lea']` waere dann still zu kurz. */
for (const w of PROFIL_IDS)
  if (hier(w) && TON_GEGENSTAND[w] && (gehoertEn[w] || 0) < ENGLISCH_JE(w))
    fehler.push(`${w} bekam auf der Englischebene ${gehoertEn[w]||0} von `
      + `${ENGLISCH_JE(w)} Wörtern gesagt — dort IST das Wort die Frage, und ohne `
      + 'es stehen vier Bilder ohne Aufgabe da');
if (hier('lea') && (gehoert.lea || 0) > 0)
  fehler.push(`Lea bekam ${gehoert.lea} Aufgaben vorgelesen, obwohl ihr Profil `
    + '`vorlesen: false` sagt — die Ansage hängt nicht am Kind');
// Voreingestellt zieht Fiona und tippt Lea an. Wird nur EIN Weg gegangen,
// ist der Umschalter entweder weg oder wirkungslos - und die Haelfte der
// Bedienung ungeprueft. Jeder Weg haengt an SEINEM Profil, damit ein
// Teillauf nur ueber das urteilt, was er gefahren hat.
for (const [wer, soll] of [['fiona', 'fiona: ziehen'],
                           ['lea', 'lea: antippen'],
                           ['fiona', 'fiona: rechnen angetippt'],
                           ['lea', 'lea: rechnen geschrieben'],
                           [PROFIL_IDS[2], `${PROFIL_IDS[2]}: rechnen geschrieben`],
                           [PROFIL_IDS[3], `${PROFIL_IDS[3]}: rechnen geschrieben`]])
  if (hier(wer) && !wege.has(soll))
    fehler.push(`Kein einziger Zug über „${soll}" — der Umschalter greift nicht `
      + `(gegangen wurde: ${[...wege].join(', ') || 'nichts'})`);
/* „Eltern bekommt nie eine Auswahl" wird oben am Kartenbildschirm
 * geprueft, nicht hier: siehe OHNE_AUSWAHL. Hier stand dafuer eine
 * Verbotsliste ueber `wege`, die nicht anschlagen KONNTE. */
}

/* --- Wie lange steht das Lob wirklich? -------------------------------
 *
 * Bis hierher hat KEIN Tor je gemessen, wie lang eine Schaupause ist. Der
 * Kommentar an `LOBPAUSE` behauptete es (ein Durchgang ohne den Schalter),
 * und der fand nicht statt: jede Seite dieses Tests laeuft mit `?flott`.
 *
 * Was das gekostet hat, steht in derselben Runde: der Kartenweg wartete an
 * zwei nackten Zahlen im Rumpf, `?flott` griff dort gar nicht, und keines
 * von zwanzig Toren hat es gesagt.
 *
 * Gemessen wird deshalb BEIDES und auf BEIDEN Wegen — Karte und Rechnen:
 *
 *   ohne Schalter   die Pause muss lang genug sein, um das Lob zu LESEN
 *   mit Schalter    sie muss deutlich kuerzer sein — sonst haelt der
 *                   Schalter seine Zusage auf diesem Weg nicht
 *
 * Die Untergrenze ist eine Anforderung, keine Abschrift: ein Kind soll
 * „Super! Das ist Sachsen." lesen koennen. Deshalb steht sie hier und nicht
 * in spiel.js (Regel 3 — das Soll kommt nicht aus dem Gemessenen).
 */
if (laeuft('pausen')) try {
  /* EINE Zahl, und sie kommt aus der Anforderung (Regel 3).
   *
   * „Ein Kind soll ,Super! Das ist Sachsen.' lesen koennen" - das sind
   * 1200 ms. Daran haengen jetzt BEIDE Urteile, und zwar als absolute
   * Grenzen statt als Verhaeltnis:
   *
   *   ohne Schalter   die angeforderte Pause muss darueber liegen
   *   mit Schalter    sie muss darunter liegen
   *
   * WARUM KEIN VERHAELTNIS MEHR (Q37). Hier stand `normal < kurz * 1.5`,
   * und das hat die Kette zweimal rot gemacht, ohne dass sich an der App
   * etwas geaendert haette: gemessen wurden 1,42x und 1,50x, allein
   * gefahren 1,8x und 2,4x. Die Kette faehrt acht Browser auf vier
   * Kernen; unter dieser Last wird die kurze Pause relativ teurer als die
   * lange, und das Verhaeltnis faellt. Q12 hatte das schon einmal
   * gemildert (Stempel in der Seite statt Stoppuhr im Testrechner) - der
   * Rest ist nicht wegzumessen, weil die kurze Pause zu einem guten Teil
   * aus Rechnen besteht und die lange fast nur aus Warten.
   *
   * WAS JETZT GEMESSEN WIRD: nicht wie lange die Pause DAUERT, sondern
   * welche Pause die App ANFORDERT. `schauPause()` reicht eine Zahl an
   * `setTimeout` weiter; diese Zahl ist die Entscheidung des Schalters,
   * und sie haengt an keiner Maschine. Die Stoppuhr bleibt - aber als
   * Auskunft im Bericht, nicht als Tor.
   */
  const LESEZEIT_MIN = 1200;    // was ein Kind zum Lesen braucht

  /** Eine Aufgabe loesen und messen, wie lange das Lob danach stehenbleibt. */
  async function pauseMessen(ebene, flott) {
    const p = await neueSeite({ width: 1180, height: 820 }, ctx, flott);
    await p.click('[data-profil="fiona"]');
    await zurEbenenwahl(p, ebene);
    await p.click(`[data-ebene="${ebene}"]`);
    await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel, '
      + '.schirm.da .rechnung', { timeout: 25000 });
    await durchVorlauf(p);
    const rechnen = ebene.startsWith('rechnen');
    await p.waitForSelector(rechnen ? '.schirm.da .rechnung'
      : '.schirm.da .karte svg path.ziel', { timeout: 15000 });
    // Von „das Lob steht da" bis „die naechste Aufgabe steht da" - gemessen
    // IN der Seite, nicht von aussen.
    //
    // Bis Q12 standen hier zwei `waitForFunction`, und zwischen ihnen lief
    // die Stoppuhr im Testrechner. Beide Enden werden aber erst BEMERKT,
    // wenn der naechste Bildtakt kommt - und unter Last (die Kette faehrt
    // zehn Browser auf vier Kernen) verrutschen sie in verschiedene
    // Richtungen: die lange Pause wird zu kurz gemessen, die kurze zu
    // lang. Gemessen in der Kette: 1544 statt 1613 ms und 1047 statt 918.
    // Aus 1,8x wurde 1,47x, und das Tor meldete rot, wo nichts war.
    //
    // Ein `MutationObserver` stempelt beide Enden dort, wo sie
    // entstehen. Was uebrig bleibt, ist die Pause selbst.
    /* Die ANGEFORDERTE Pause mitschreiben (Q37).
     *
     * `schauPause()` gibt eine Zahl an `setTimeout` weiter. Die Aufrufe im
     * Rumpf schlagen `setTimeout` beim Aufruf im Fenster nach, also greift
     * ein Mantel, der nach dem Laden gelegt wird. Kleine Zahlen bleiben
     * draussen - die Ansage (500 ms) und die Uebergaenge sind hier nicht
     * gemeint. */
    await p.evaluate(() => {
      window.__angefordert = [];
      const alt = window.setTimeout;
      window.setTimeout = function (fn, ms, ...rest) {
        if (typeof ms === 'number' && ms >= 200) window.__angefordert.push(ms);
        return alt.call(window, fn, ms, ...rest);
      };
    });
    await p.evaluate(() => {
      window.__pause = {};
      const sieh = () => {
        const s = document.querySelector('.schirm.da');
        if (!s) return;
        const lob = s.querySelector('.frage .richtigText, .frage .fastText');
        if (lob && !window.__pause.t0) window.__pause.t0 = performance.now();
        if (window.__pause.t0 && !lob && !window.__pause.t1
            && (s.querySelector('.karte svg path.ziel') || s.querySelector('.rechnung')
                || s.querySelector('#nochmal')))
          window.__pause.t1 = performance.now();
      };
      new MutationObserver(sieh).observe(document.body,
        { childList: true, subtree: true, characterData: true });
      sieh();
    });

    // Erst hier leeren: was VOR der Antwort angefordert wurde (Vorlauf,
    // Kartenaufbau), gehoert nicht zur Schaupause.
    await p.evaluate(() => { window.__angefordert = []; });

    // Richtig antworten — auf dem Weg, den dieses Profil hier hat.
    if (rechnen) {
      // Die richtige Zahl wird AUSGERECHNET, nicht abgelesen: an der
      // Aufgabe steht sie nicht, und die Loesung erst nach der Antwort.
      const i = await p.evaluate(() => {
        const s = document.querySelector('.schirm.da');
        const t = s.querySelector('.rechnung').textContent
          .replace(/[−–]/g, '-').replace(/[·×]/g, '*').replace(/[:÷]/g, '/');
        const m = t.match(/(-?\d+)\s*([-+*/])\s*(-?\d+)/);
        if (!m) return -1;
        const [a, op, bb] = [+m[1], m[2], +m[3]];
        const soll = op === '+' ? a + bb : op === '-' ? a - bb
                   : op === '*' ? a * bb : a / bb;
        // `.zahl` mit `data-zahl` — die Rechenebene hat keine Wahlliste wie
        // die Karte, sondern vier Zahlenknoepfe.
        return [...s.querySelectorAll('#auswahl .zahl')]
          .findIndex(k => +k.dataset.zahl === soll);
      });
      if (i < 0) throw new Error('die richtige Zahl steht nicht zur Wahl');
      await p.$$eval('.schirm.da #auswahl .zahl', (e, k) => e[k].click(), i);
    } else {
      await loese(p);
    }
    /* Warten darf ruhig ungenau sein - gerechnet wird mit den Stempeln
     * aus der Seite, nicht mit dem Zeitpunkt, an dem das Warten endet. */
    await p.waitForFunction(() => window.__pause && window.__pause.t1,
      null, { timeout: 20000 });
    const { t0, t1 } = await p.evaluate(() => window.__pause);
    /* Die groesste angeforderte Pause NACH der Antwort ist die Schaupause.
     * Die anderen sind kleiner (die Ansage liegt bei 500). */
    const angefordert = await p.evaluate(() =>
      (window.__angefordert || []).reduce((a, b) => Math.max(a, b), 0));
    await p.close();
    return { gemessen: Math.round(t1 - t0), angefordert };
  }

  for (const [was, ebene] of [['Karte', 'bundeslaender'], ['Rechnen', 'rechnen:plusminus']]) {
    const normal = await pauseMessen(ebene, false);
    const kurz   = await pauseMessen(ebene, true);
    console.log(`  Schaupause ${was.padEnd(8)}       angefordert ${normal.angefordert} ms normal, `
      + `${kurz.angefordert} ms mit \`?flott\`  ·  gestoppt ${normal.gemessen} / ${kurz.gemessen} ms`);

    /* Geurteilt wird an der ANGEFORDERTEN Zahl. Kam gar keine an, ist die
     * Messung selbst kaputt - und das ist ein Befund, kein Freispruch
     * (Regel 1: eine Pruefung, die nie etwas meldet, ist kein Beweis). */
    if (!normal.angefordert || !kurz.angefordert)
      merke('pausen', new Error(`${was}: es wurde gar keine Schaupause angefordert `
        + `(${normal.angefordert} / ${kurz.angefordert} ms) — dann misst diese Prüfung nichts`));
    else {
      if (normal.angefordert < LESEZEIT_MIN)
        merke('pausen', new Error(`${was}: das Lob steht nur ${normal.angefordert} ms — `
          + `unter ${LESEZEIT_MIN} ms kann ein Kind es nicht lesen`));
      if (kurz.angefordert >= LESEZEIT_MIN)
        merke('pausen', new Error(`${was}: mit \`?flott\` werden ${kurz.angefordert} ms `
          + `angefordert, also nicht weniger als die Lesezeit von ${LESEZEIT_MIN} ms — `
          + 'der Schalter kürzt diesen Weg nicht. Genau so ist der Kartenweg an ihm '
          + 'vorbeigelaufen'));
    }

    /* Und die Stoppuhr bleibt als AUSKUNFT stehen, nicht als Tor. Sie sagt,
     * ob die angeforderte Pause auch ungefaehr die gebrauchte ist - wenn
     * beides weit auseinanderliegt, stimmt etwas anderes nicht. Weit heisst
     * hier grosszuegig: unter Last kommt Rechenzeit dazu, und genau davor
     * soll dieses Tor nicht mehr umkippen. */
    for (const [w, m] of [['ohne Schalter', normal], ['mit `?flott`', kurz]])
      if (m.gemessen > m.angefordert * 2 + 800)
        console.log(`    HINWEIS ${was} ${w}: angefordert ${m.angefordert} ms, `
          + `gebraucht ${m.gemessen} ms — die Maschine war langsam, kein Befund`);
  }
} catch (e) { merke('pausen', e); }

/* --- Schreiben: nachfahren und frei schreiben (N2a) -------------------- *
 *
 * Das Tor `schreiben` misst die Erkennung an Zahlen. Was es NICHT sehen
 * kann: ob ein Finger auf dem Zielgeraet ueberhaupt bei der Vorlage
 * ankommt. Genau dort war der Fehler - `aspect-ratio` auf einem SVG tat
 * nichts, das Feld war 820 x 180 statt quadratisch, und die Umrechnung
 * Finger->Kasten lag systematisch daneben. Gezeichnet wurde trotzdem an
 * der richtigen Stelle; zu sehen war es nur daran, dass nichts galt.
 *
 * Deshalb hier: mit dem ZEIGER auf dem gebauten Stand, in der Groesse des
 * Zielgeraets.
 */
if (laeuft('schreiben')) try {
  /* Ein EIGENER Zusammenhang, nicht der geteilte.
   *
   * Der Abschnitt `regler` schaltet den Ton ab und legt das in der Ablage
   * ab - und die gehoert dem Zusammenhang, nicht der Seite. Wer danach im
   * selben Zusammenhang eine neue Seite aufmacht, bekommt „Ton aus" mit,
   * und `vorlesen()` schweigt. Einzeln gefahren war der Abschnitt gruen,
   * im vollen Lauf meldete er „im Diktat wird kein Buchstabe angesagt".
   *
   * Das ist keine Kleinigkeit der Testerei: es ist dieselbe Kopplung, die
   * ein Kind traefe, das den Ton einmal ausgeschaltet hat und danach eine
   * Ebene bekommt, deren Aufgabe NUR gesprochen existiert. Der Befund
   * steht als offener Punkt im Backlog. */
  const eigenerCtx = await b.newContext({ hasTouch: true, isMobile: true, locale: 'de-DE' });
  const ctx = eigenerCtx;

  // 1. Die Welt gehoert Fiona - und nur ihr.
  for (const [wer, soll] of [['fiona', true], ['lea', false]]) {
    const p = await neueSeite({ width: 844, height: 390 }, ctx);
    await p.click(`[data-profil="${wer}"]`);
    await p.waitForSelector('.schirm.da [data-welt]');
    const welten = await p.$$eval('.schirm.da [data-welt]', b => b.map(x => x.dataset.welt));
    const hat = welten.includes('schreiben');
    if (hat !== soll)
      merke('schreiben', new Error(`${wer} sieht die Welt „Schreiben" ${hat ? '' : 'NICHT '}`
        + `— erwartet war ${soll ? 'sichtbar' : 'unsichtbar'} (gefunden: ${welten.join(', ')})`));
    await p.close();
  }
  console.log('  Schreibwelt:                nur bei Fiona');

  const p = await neueSeite({ width: 844, height: 390 }, ctx);
  await p.click('[data-profil="fiona"]');
  await zurEbenenwahl(p, 'schreiben:buchstaben');
  await p.click('[data-ebene="schreiben:buchstaben"]');
  await p.waitForSelector('.schirm.da #los, .schirm.da .schreibblatt', { timeout: 25000 });
  await durchVorlaufWenn(p);
  await p.waitForSelector('.schirm.da .schreibblatt', { timeout: 15000 });

  // Das Feld muss QUADRATISCH sein - daran hing der Fehler oben.
  const kasten = await p.$eval('.schirm.da .schreibblatt', e => {
    const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)];
  });
  if (Math.abs(kasten[0] - kasten[1]) > 2)
    merke('schreiben', new Error(`das Schreibfeld ist ${kasten[0]} x ${kasten[1]} Punkte `
      + 'und damit nicht quadratisch — dann trifft der Finger die Vorlage nicht'));

  const zuege = await schreibVorlage(p);
  if (!zuege.length) throw new Error('keine Vorlage auf dem Schreibschirm');
  const zeichen = await p.$eval('.schirm.da #frage strong', e => e.textContent);

  // 2. Nachfahren, Zug fuer Zug. Nach dem letzten muss die Vorlage WEG sein -
  //    sonst waere das freie Schreiben ein Abmalen.
  for (const d of zuege) await zeichneZug(p, Schreiben.abtasten(d, 26));
  await p.waitForFunction(() => document.querySelectorAll('.schirm.da .vorlage path').length === 0,
    null, { timeout: 5000 }).catch(() => {
      merke('schreiben', new Error('nach dem letzten Zug steht die Vorlage noch da — '
        + 'dann malt das Kind sie ab, statt den Buchstaben zu schreiben')); });
  console.log(`  Nachgefahren:               ${zeichen} in ${zuege.length} Zügen`);

  // 3. Zweimal Unsinn: das darf NICHT gelten. Ohne diese Haelfte waere ein
  //    Erkenner, der alles annimmt, hier gruen.
  for (let i = 0; i < 2; i++) {
    await zeichneZug(p, [[20, 80], [50, 30], [80, 80], [30, 40]]);
    await p.click('.schirm.da #fertigknopf');
    await nachFertig(p);
  }
  const nachUnsinn = await p.$eval('.schirm.da #frage', e => e.textContent);
  if (!/noch einmal/i.test(nachUnsinn))
    merke('schreiben', new Error(`nach zwei Kritzeleien steht „${nachUnsinn.trim()}" da — `
      + 'erwartet war eine Aufforderung, es noch einmal zu versuchen'));

  // 4. Und jetzt richtig. Leicht verzogen, so wie ein Kind schreibt.
  await schreibeSauber(p, zuege);
  const gut = await angenommen(p);
  if (!gut) {
    const jetzt = await p.$eval('.schirm.da #frage', e => e.textContent);
    merke('schreiben', new Error(`ein sauber geschriebenes ${zeichen} wurde nicht angenommen `
      + `— auf dem Bildschirm steht „${jetzt.trim()}"`));
  } else {
    console.log(`  Frei geschrieben:           ${zeichen} angenommen`);
  }

  // 5. Der Fortschritt muss ANKOMMEN. Ein Buchstabe, der richtig war und
  //    im Leitner nicht steigt, ist eine Uebung ohne Gedaechtnis.
  /* Gewartet wird auf den EINTRAG, nicht auf 400 ms (Q42). Gesichert wird
     erst nach dem Lobsatz, und wie lange das Schreiben in die Ablage
     dauert, ist Sache des Geraets - eine feste Pause ist auf dem schnellen
     verschenkt und auf dem langsamen zu kurz. */
  let buchstabenStand = null, fach = -1;
  await bisHier(async () => {
    buchstabenStand = await standVon(p, 'fiona:schreiben:buchstaben');
    fach = buchstabenStand ? (buchstabenStand[`bu:${zeichen}`]?.fach ?? 0) : -1;
    return fach >= 2;
  }, 8000);
  if (!(fach >= 2))
    merke('schreiben', new Error(`nach einem richtigen ${zeichen} steht der Buchstabe `
      + `in Fach ${fach} — erwartet mindestens 2`));
  else console.log(`  Im Leitner angekommen:      bu:${zeichen} in Fach ${fach}`);
  await p.close();

  /* --- Diktat (N3): der Buchstabe wird angesagt, nicht gezeigt ---------
   *
   * Die eine Eigenschaft, die diese Ebene ausmacht, ist eine NEGATIVE:
   * der Buchstabe steht nirgends. Sie laesst sich nur so pruefen - und
   * genau deshalb wird der gesuchte Buchstabe hier aus der ANSAGE
   * gelesen, nicht vom Bildschirm. Wer ihn vom Bildschirm liest, kann
   * anschliessend nicht mehr behaupten, dass er dort nicht steht.
   */
  const d = await neueSeite({ width: 844, height: 390 }, ctx);
  await d.click('[data-profil="fiona"]');
  await zurEbenenwahl(d, 'schreiben:diktat');
  await d.click('[data-ebene="schreiben:diktat"]');
  await d.waitForSelector('.schirm.da #los, .schirm.da .schreibblatt', { timeout: 25000 });
  await d.evaluate(() => { window.__gesagt = []; });
  await durchVorlaufWenn(d);
  await d.waitForSelector('.schirm.da .schreibblatt', { timeout: 15000 });

  const angesagt = await angesagtMit(d, 'Schreib ein ');
  const gesucht = (angesagt.match(/^Schreib ein ([A-ZÄÖÜ])/) || [])[1];
  if (!gesucht) {
    merke('schreiben', new Error('im Diktat wird kein Buchstabe angesagt — '
      + `gehört wurde „${angesagt || 'nichts'}". Ohne Ansage gibt es keine Aufgabe`));
  } else {
    // Und jetzt die negative Eigenschaft: nirgends zu sehen.
    const sichtbar = await d.evaluate(() => ({
      vorlage: document.querySelectorAll('.schirm.da .vorlage path').length,
      text: document.querySelector('.schirm.da').innerText,
      marken: [...document.querySelectorAll('.schirm.da [aria-label]')]
        .map(e => e.getAttribute('aria-label')).join(' | '),
    }));
    if (sichtbar.vorlage)
      merke('schreiben', new Error(`im Diktat stehen ${sichtbar.vorlage} Vorlagenzüge `
        + 'auf dem Blatt — dann ist es ein Abmalen mit Ton, kein Diktat'));
    if (new RegExp(`\\b${gesucht}\\b`).test(sichtbar.text))
      merke('schreiben', new Error(`im Diktat steht der gesuchte Buchstabe „${gesucht}" `
        + `im Text: „${sichtbar.text.replace(/\s+/g, ' ').slice(0, 80)}"`));
    if (new RegExp(`\\b${gesucht}\\b`).test(sichtbar.marken))
      merke('schreiben', new Error(`im Diktat nennt eine Beschriftung den gesuchten `
        + `Buchstaben „${gesucht}": „${sichtbar.marken.slice(0, 80)}"`));
    console.log(`  Diktat angesagt:            ${gesucht}, und nirgends zu sehen`);

    // Richtig geschrieben - aus dem Gehoer. Die Zuege kommen aus dem
    // Vorrat, nicht vom Bildschirm: dort steht ja nichts.
    const vorlage = Schreiben.BUCHSTABEN.find(x => x.zeichen === gesucht);
    await schreibeSauber(d, vorlage.zuege);
    const genommen = await angenommen(d);
    if (!genommen)
      merke('schreiben', new Error(`ein sauber geschriebenes ${gesucht} wurde im Diktat `
        + `nicht angenommen — auf dem Bildschirm steht „${
          (await d.$eval('.schirm.da #frage', e => e.textContent)).trim()}"`));
    else console.log(`  Diktat geschrieben:         ${gesucht} angenommen`);
    /* Auf die NAECHSTE Aufgabe warten, nicht auf die Uhr.
     *
     * Der erste Anlauf wartete 600 ms - und zeichnete dann in den
     * Bildschirm, der gerade weggeblendet wurde. Gewartet wird auf das,
     * worauf es ankommt: das Lob ist weg, es steht genau EIN Bildschirm
     * da, und auf ihm liegt ein leeres Blatt. */
    await weitergegangen(d);
    await d.waitForFunction(() => document.querySelectorAll('.schirm').length === 1
      && !!document.querySelector('.schirm.da .schreibblatt')
      && !document.querySelector('.schirm.da .gemalt path'),
      null, { timeout: 8000 }).catch(() => {});

    // Und beim naechsten: dreimal daneben, dann wird VORGEMACHT statt abgelehnt.
    for (let i = 0; i < 3; i++) {
      await zeichneZug(d, [[20, 80], [50, 30], [80, 80], [30, 40]]);
      await d.click('.schirm.da #fertigknopf');
      await nachFertig(d);
    }
    const vorgemacht = await d.waitForFunction(
      () => document.querySelectorAll('.schirm.da .vorlage path.malt').length > 0,
      null, { timeout: 6000 }).then(() => true).catch(() => false);
    if (!vorgemacht)
      merke('schreiben', new Error('nach drei Fehlversuchen wird der Buchstabe nicht '
        + 'vorgemacht — dann bleibt ein Kind, das ihn nicht kann, ohne Ausweg'));
    else console.log('  Nach drei Fehlversuchen:    vorgemacht');
  }
  await d.close();

  /* Und die Trennung der beiden Ebenen: Nachfahren und Diktat teilen sich
   * KEINEN Leitner-Stand. Sonst waere ein nachgefahrenes P als „aus dem
   * Gehör geschrieben" gutgeschrieben - ein Können, das es nicht gibt. */
  {
    const q = await neueSeite({ width: 844, height: 390 }, ctx);
    await q.click('[data-profil="fiona"]');
    await q.waitForSelector('.schirm.da [data-welt]');
    const nachStand = await standVon(q, 'fiona:schreiben:buchstaben');
    const diktatStand = await standVon(q, 'fiona:schreiben:diktat');
    const stand = nachStand && diktatStand
      ? { nach: Object.keys(nachStand), diktat: Object.keys(diktatStand) } : null;
    if (!stand || !stand.nach.length)
      merke('schreiben', new Error('der Nachfahr-Stand ist leer — dann beweist der '
        + 'Vergleich der beiden Ebenen nichts'));
    else if (stand.nach.some(k => stand.diktat.includes(k)))
      merke('schreiben', new Error('Nachfahren und Diktat teilen sich eine Kennung '
        + `(${stand.nach.filter(k => stand.diktat.includes(k)).join(', ')}) — `
        + 'dann wird ein nachgefahrener Buchstabe als geschriebener gutgeschrieben'));
    else console.log(`  Getrennte Stände:           ${stand.nach.join(',')} nachgefahren, `
      + `${stand.diktat.join(',') || '—'} diktiert`);
    await q.close();
  }

  /* --- Zahlen (N4): zwei Felder, und die Reihenfolge zaehlt ------------
   *
   * „Vierzehn" ist eine Zahl, die man hoert; geschrieben wird sie als 1
   * und 4, in dieser Reihenfolge. Der Bildschirm stellt dafuer zwei Felder
   * hin - damit ist „beide Ziffern, richtige Reihenfolge" ein Aufbau und
   * keine Pruefung. Geprueft wird hier trotzdem, und zwar die HAELFTE, die
   * zaehlt: dass vertauschte Ziffern NICHT gelten.
   */
  {
    const z = await neueSeite({ width: 844, height: 390 }, eigenerCtx);
    await z.click('[data-profil="fiona"]');
    await zurEbenenwahl(z, 'schreiben:zahlen');
    await z.click('[data-ebene="schreiben:zahlen"]');
    await z.waitForSelector('.schirm.da #los, .schirm.da .schreibblatt', { timeout: 25000 });
    await durchVorlaufWenn(z);
    await z.waitForSelector('.schirm.da .schreibblatt', { timeout: 15000 });
    /* Weiter, bis eine Zahl mit ZWEI VERSCHIEDENEN Ziffern kommt.
     *
     * Zweistellig allein reicht nicht: bei der 11 ist vertauscht dasselbe,
     * und die Probe auf die Reihenfolge - der eigentliche Punkt dieser
     * Ebene - liefe leer. Beim ersten Anlauf zog der Leitner genau die 11,
     * und der Abschnitt meldete gruen, ohne die Reihenfolge geprüft zu
     * haben. Welche Zahl dran ist, kommt aus der ANSAGE, nicht vom Blatt. */
    const gesuchteZahl = async () => {
      const satz = await angesagtMit(z, 'Schreib die Zahl ');
      const wort = (satz.match(/^Schreib die Zahl ([a-zäöüß]+)/) || [])[1];
      return { satz, zahl: wort && [...Array(21).keys()]
        .find(n => n > 0 && Rechnen.gesprochen(n) === wort) };
    };
    let gefunden = await gesuchteZahl();
    for (let n = 0; n < 14 && !(gefunden.zahl >= 10
         && String(gefunden.zahl)[0] !== String(gefunden.zahl)[1]); n++) {
      await z.evaluate(() => { window.__gesagt = []; });
      await z.click('.schirm.da #weissnicht');
      await weitergegangen(z);
      await z.waitForSelector('.schirm.da .schreibblatt', { timeout: 8000 }).catch(() => {});
      gefunden = await gesuchteZahl();
    }
    const felder = (await z.$$('.schirm.da .feldkasten')).length;
    if (felder < 2) {
      merke('schreiben', new Error('nach vierzehn Aufgaben kam keine zweistellige Zahl mit '
        + 'zwei verschiedenen Ziffern — dann ist die Reihenfolge ungeprüft'));
    } else {
      const { satz, zahl } = gefunden;
      if (!zahl) {
        merke('schreiben', new Error(`bei den Zahlen wird nichts angesagt — gehört wurde `
          + `„${satz || 'nichts'}". Ohne Ansage gibt es keine Aufgabe`));
      } else {
        const ziffern = String(zahl).split('');
        const sicht = await z.evaluate(() => document.querySelector('.schirm.da').innerText);
        if (new RegExp(`\\b${zahl}\\b`).test(sicht))
          merke('schreiben', new Error(`die gesuchte Zahl ${zahl} steht im Text: `
            + `„${sicht.replace(/\s+/g, ' ').slice(0, 70)}"`));

        /* Erst VERTAUSCHT. Das darf nicht gelten - sonst waere aus „14"
         * und „41" dieselbe Antwort geworden, und die Reihenfolge, um die
         * es bei zweistelligen Zahlen ueberhaupt geht, waere nicht geprueft. */
        const malen = async (folge) => {
          for (let f = 0; f < folge.length; f++)
            for (const d of Schreiben.zuegeVon(folge[f]))
              await zeichneZug(z, Schreiben.abtasten(d, 26)
                .map(([x, y], i) => [x * 0.92 + 5 + (i % 3 - 1), y * 0.92 + 4 + (i % 2 ? 1 : -1)]), f);
          await z.click('.schirm.da #fertigknopf');
          await nachFertig(z);
        };
        await malen([...ziffern].reverse());
        const nachTausch = await z.evaluate(() =>
          !!document.querySelector('.schirm.da .frage .richtigText'));
        if (nachTausch)
          merke('schreiben', new Error(`die Zahl ${zahl} wurde auch VERTAUSCHT als richtig `
            + 'gewertet — dann ist die Reihenfolge der Ziffern nicht geprüft'));
        else console.log(`  Zahl vertauscht:            ${[...ziffern].reverse().join('')} `
          + `statt ${zahl} abgelehnt`);
        // Und jetzt richtig herum.
        await malen(ziffern);
        const gut = await z.waitForFunction(
          () => !!document.querySelector('.schirm.da .frage .richtigText'),
          null, { timeout: 6000 }).then(() => true).catch(() => false);
        if (!gut)
          merke('schreiben', new Error(`die richtig geschriebene ${zahl} wurde nicht `
            + `angenommen — auf dem Bildschirm steht „${
              (await z.$eval('.schirm.da #frage', e => e.textContent)).trim()}"`));
        else console.log(`  Zahl geschrieben:           ${zahl} in ${ziffern.length} Feldern angenommen`);
      }
    }
    await z.close();
  }

  /* Und die Sackgasse: Ton aus, und die Aufgabe existiert nur gesprochen.
   *
   * DIESER Abschnitt steht bewusst am Ende: er schaltet den Ton ab und
   * legt das in der Ablage ab. Alles, was danach in demselben
   * Zusammenhang eine Ansage braucht, bekaeme keine - und meldete
   * „es wird nichts angesagt", obwohl die Ansage in Ordnung ist. Genau so
   * ist der Zahlen-Abschnitt beim ersten Anlauf rot geworden.
   * Ein Test, der etwas ABSCHALTET, gehoert ans Ende seiner Reihe.
   *
   * Geprueft wird nicht, dass die App den Ton eigenmaechtig anschaltet -
   * das darf sie nicht -, sondern dass sie SAGT, woran es liegt, und
   * einen Weg zurueck anbietet. Ein leeres Blatt ohne Hinweis ist fuer
   * ein Kind nicht von einem kaputten Spiel zu unterscheiden. */
  {
    const t = await neueSeite({ width: 844, height: 390 }, eigenerCtx);
    await t.click('[data-profil="fiona"]');
    // Den Ton abschalten - dort, wo das Kind es auch tut.
    await t.click('.schirm.da #zur');
    await t.waitForSelector('.schirm.da #ton');
    await t.click('.schirm.da #ton');
    await t.click('[data-profil="fiona"]');
    await zurEbenenwahl(t, 'schreiben:diktat');
    await t.click('[data-ebene="schreiben:diktat"]');
    await t.waitForSelector('.schirm.da #los, .schirm.da .schreibblatt', { timeout: 25000 });
    await durchVorlaufWenn(t);
    await t.waitForSelector('.schirm.da .schreibblatt', { timeout: 15000 });
    const zustand = await t.evaluate(() => ({
      frage: document.querySelector('.schirm.da #frage')?.textContent.trim() || '',
      knopf: document.querySelector('.schirm.da #hoeren')?.textContent.trim() || '',
    }));
    if (!/Ton/.test(zustand.frage))
      merke('schreiben', new Error(`mit abgeschaltetem Ton steht im Diktat „${zustand.frage}" `
        + '— kein Hinweis, dass die Aufgabe nur gesprochen existiert'));
    if (!/einschalten/i.test(zustand.knopf))
      merke('schreiben', new Error(`mit abgeschaltetem Ton bietet der Knopf „${zustand.knopf}" `
        + '— es gibt keinen Weg zurück zum Ton'));
    if (/Ton/.test(zustand.frage) && /einschalten/i.test(zustand.knopf))
      console.log('  Ton aus im Diktat:          Hinweis und Weg zurück');
    await t.close();
  }

  await eigenerCtx.close();
} catch (e) { merke('schreiben', e); }


/* --- Der Fehler wird benannt, auch beim Ziehen (A3) --------------------
 *
 * Bis hierher sagte die App bei jedem Fehlgriff auf der Karte „Nicht ganz
 * - probier es noch einmal." Jetzt nennt sie das Gebiet unter dem Finger
 * und die Richtung zum gesuchten: „Das ist Schleswig-Holstein. Thüringen
 * liegt weiter unten."
 *
 * Geprueft wird im BROWSER, weil die Richtung an der gezeichneten Karte
 * haengt: `spielprobe` prueft das Wort, hier steht der Satz. Und er wird
 * an einem Fall geprueft, bei dem die Antwort feststeht - abgelegt wird
 * auf dem am weitesten entfernten Bundesland, damit die Richtung
 * eindeutig ist und der Satz nicht vom Zufall der Aufgabe abhaengt.
 */
if (laeuft('hinweis')) try {
  const p = await neueSeite({ width: 1180, height: 820 }, ctx);
  await p.click('[data-profil="fiona"]');
  await zurEbenenwahl(p, 'bundeslaender');
  await p.click('[data-ebene="bundeslaender"]');
  await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel', { timeout: 25000 });
  await durchVorlaufWenn(p);
  await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });
  await bis(p, () => !!document.querySelector('.schirm.da .karte')?.style.width, 5000);

  /* ZWEI Fehlgriffe, einer je Achse - und beide fest gewaehlt.
   *
   * Der erste Anlauf nahm das am weitesten entfernte Bundesland. Welche
   * Achse dabei herauskommt, haengt an der Aufgabe: bei Thueringen war es
   * senkrecht („weiter unten"), bei Saarland waagerecht („weiter rechts").
   * Die Gegenprobe, die oben und unten vertauscht, haette im zweiten Fall
   * gar nicht anschlagen koennen - sie war so gut wie die Wuerfel des
   * Leitners. Jetzt wird je Achse das Gebiet mit dem groessten Abstand IN
   * DIESER Achse genommen; damit kommt das Wort sicher vor.
   *
   * Zwei und nicht drei: nach dem dritten Fehlversuch loest die App auf. */
  const plan = await p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const ziel = s.querySelector('path.ziel');
    const svg = s.querySelector('.karte svg');
    const D = JSON.parse(document.getElementById('daten').textContent);
    const g = D.deutschland.find(x => x.id === ziel.dataset.id);
    const auf = (a) => { const pt = svg.createSVGPoint(); pt.x = a[0]; pt.y = a[1];
      const q = pt.matrixTransform(svg.getScreenCTM()); return { x:q.x, y:q.y }; };
    const hier = auf(g.anker);
    const weitest = (achse) => {
      let raus = null, best = -1;
      for (const x of D.deutschland) {
        if (x.id === g.id || !x.anker) continue;
        const q = auf(x.anker), d = Math.abs(q[achse] - hier[achse]);
        if (d > best) { best = d; raus = { name:x.name, ...q }; }
      }
      return raus;
    };
    const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent.trim());
    // dx/dy zeigen vom Ablegepunkt ZUM gesuchten Gebiet - dieselbe
    // Richtung, die der Satz nennen muss.
    const mit = (w) => w && ({ ...w, dx: hier.x - w.x, dy: hier.y - w.y });
    return { name:g.name, idx:namen.indexOf(g.name),
             senkrecht: mit(weitest('y')), waagerecht: mit(weitest('x')) };
  });
  if (!plan || plan.idx < 0) {
    merke('hinweis', new Error('das gesuchte Bundesland steht nicht in der Liste'));
  } else {
    const ziehenAuf = async (wohin) => {
      const et = (await p.$$('.schirm.da .etikett'))[plan.idx];
      const a = await et.boundingBox();
      await p.mouse.move(a.x + a.width/2, a.y + a.height/2);
      await p.mouse.down();
      await p.mouse.move(wohin.x, wohin.y, { steps: 12 });
      await p.mouse.up();
      const kam = await bis(p, () => !!document.querySelector('.schirm.da .hinweis'), 5000);
      return kam ? (await p.$eval('.schirm.da .hinweis', e => e.textContent.trim())) : '';
    };
    for (const [achse, wohin] of [['senkrecht', plan.senkrecht],
                                  ['waagerecht', plan.waagerecht]]) {
      if (!wohin) continue;
      // Zwischen den Versuchen muss der alte Hinweis weg sein, sonst
      // liest der zweite Durchgang den ersten Satz.
      await p.evaluate(() => document.querySelector('.schirm.da .hinweis')?.remove());
      const satz = await ziehenAuf(wohin);
      if (!satz.includes(wohin.name))
        merke('hinweis', new Error(`${achse}: der Hinweis nennt nicht, WAS unter dem `
          + `Finger lag (${wohin.name}): „${satz}"`));
      if (!satz.includes(plan.name))
        merke('hinweis', new Error(`${achse}: der Hinweis nennt nicht das gesuchte `
          + `Gebiet (${plan.name}): „${satz}"`));
      const richtung = (satz.match(/weiter (oben|unten|links|rechts)( (links|rechts))?/) || [])[0];
      if (!richtung) {
        merke('hinweis', new Error(`${achse}: der Hinweis nennt keine Richtung: „${satz}"`));
        continue;
      }
      /* Die Richtung muss STIMMEN. Ein Hinweis, der wegzeigt, ist
       * schlimmer als keiner: er schickt ein Kind weg von der Stelle, an
       * der es fast richtig lag - und niemandem faellt es auf, der Satz
       * ist ja da.
       *
       * Geprueft wird das VORZEICHEN je genannter Achse, nicht das Wort:
       * die Schwelle, ab der eine Achse genannt wird, gehoert der App. Wer
       * sie hier nachrechnete, pruefte die Rechnung gegen sich selbst. */
      const falsch = [];
      if (/oben/.test(richtung)   && !(wohin.dy < 0)) falsch.push('oben');
      if (/unten/.test(richtung)  && !(wohin.dy > 0)) falsch.push('unten');
      if (/links/.test(richtung)  && !(wohin.dx < 0)) falsch.push('links');
      if (/rechts/.test(richtung) && !(wohin.dx > 0)) falsch.push('rechts');
      if (falsch.length)
        merke('hinweis', new Error(`${achse}: der Hinweis sagt „${richtung}", das Ziel `
          + `liegt aber ${wohin.dx > 0 ? 'rechts' : 'links'} und `
          + `${wohin.dy > 0 ? 'unter' : 'über'} dem Ablegepunkt `
          + `(${falsch.join(', ')} zeigt weg): „${satz}"`));
      else console.log(`  Fehler beim Ziehen (${achse.padEnd(10)}): „${satz}"`);
    }
  }
  await p.close();
} catch (e) { merke('hinweis', e); }


/* --- Sprechen: der Weg heraus (F13) ------------------------------------
 *
 * Gemeldet vom Zielgerät: „Sprachmodus an, im Spiel auf das Mikrofon
 * getippt, es ging los, reingesprochen — und ich konnte den Modus nicht
 * beenden. Es kam keine Auswertung."
 *
 * Der Knopf war ein Einwegschalter: er baute einen Erkenner, startete ihn
 * und vergaß ihn. Kein `stop()`, kein `onend`, keine Frist — und der
 * atmende Ring lief immer, auch wenn gar nicht zugehört wurde.
 *
 * Geprüft wird hier der ZUSTAND, nicht das Verstehen. Ob ein Mikrofon
 * etwas versteht, geht nur auf dem Gerät (M4r); dass man aus dem Zuhören
 * wieder herauskommt, geht hier — und genau das hat gefehlt.
 */
/* Der Test ohne Hilfen (B2).
 *
 * Die Abnahme steht im Abgleich mit ANTON und ist woertlich: „der
 * Rauchtest spielt einen Test durch und prueft, dass die Hilfen fehlen".
 * Drei Hilfen sind es, und jede einzeln:
 *   - die Auswahl aus vier Moeglichkeiten
 *   - „Weiss ich nicht"
 *   - der Zeiger auf der Karte
 * Dazu das, was den Pokal traegt: EIN Versuch je Aufgabe, alle
 * Gegenstaende der Ebene, und der Pokal erscheint nur bei Bestehen.
 *
 * Der Stand wird vorgegeben statt erspielt: sechzehn Bundeslaender bis in
 * Fach 3 zu ueben dauert im Rauchtest laenger als die ganze uebrige Kette,
 * und geprueft wird hier der TEST, nicht der Weg dorthin.
 */
if (laeuft('test')) try {
  const p = await neueSeite({ width: 844, height: 390 }, ctx);
  const alleSicher = await p.evaluate(() => Object.fromEntries(
    JSON.parse(document.getElementById('daten').textContent).deutschland
      .map(g => [g.id, { fach: 5, faellig: 0, hoch: 5 }])));
  await stelleAblage(p, {
    // Fionas Ebene wird MIT gefuellt - sonst prueft „Fiona bekommt keinen
    // Test" nur, dass sie noch nichts gesammelt hat.
    fortschritt: { 'lea:bundeslaender': alleSicher, 'fiona:bundeslaender': alleSicher },
    einstellungen: { alles: { vorlaufGezeigt: {
      'lea:bundeslaender': true, 'fiona:bundeslaender': true } } },
  });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-profil="lea"]');
  await p.click('[data-profil="lea"]');
  await zurEbenenwahl(p, 'bundeslaender');

  // Der Test steht erst da, wenn alles gesammelt ist - und bei Fiona nie.
  const knopf = await p.$('[data-test="bundeslaender"]');
  if (!knopf)
    merke('test', new Error('die Ebene ist ganz gesammelt und es gibt keinen Test — '
      + 'dann ist der Pokal unerreichbar'));
  else {
    await knopf.click();
    await p.waitForSelector('.schirm.da .karte svg', { timeout: 20000 });
    const t = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      return {
        weissnicht: !!s.querySelector('#ueberspringen'),
        zeiger: !!s.querySelector('.zeiger'),
        etiketten: s.querySelectorAll('.etikett').length,
        feld: !!s.querySelector('input.eingabe'),
        aufgaben: s.querySelectorAll('.band i').length,
      };
    });
    if (t.weissnicht)
      merke('test', new Error('im Test steht „Weiß ich nicht" da — der Knopf zeigt die '
        + 'Lösung, und damit ist es keine Prüfung mehr'));
    if (t.zeiger)
      merke('test', new Error('im Test steht der Zeiger auf der Karte — er sagt, wo das '
        + 'gesuchte Gebiet liegt'));
    if (t.etiketten || !t.feld)
      merke('test', new Error(`im Test stehen ${t.etiketten} Etiketten statt eines `
        + 'Schreibfelds — vier Möglichkeiten sind die größte Hilfe, die das Spiel kennt'));
    if (t.aufgaben !== 16)
      merke('test', new Error(`der Test hat ${t.aufgaben} Aufgaben statt 16 — er fragt `
        + 'nicht die ganze Ebene ab, sondern eine Auswahl'));

    /* EIN Versuch je Aufgabe: absichtlich danebenschreiben, dann muss die
     * Aufgabe vorbei sein - ohne dass die Antwort dasteht. */
    /* Gewartet wird darauf, dass die App die Antwort VERARBEITET hat -
       kenntlich daran, dass die Frage eine andere ist -, nicht auf 500 ms
       (Q42). Und nicht auf die Marke „daneben" am Band: die wird gleich
       darunter geprueft, das Warten waere dann schon die Pruefung. */
    const vorFalsch = await p.$eval('.schirm.da #frage', e => e.textContent);
    await p.fill('.schirm.da .eingabe', 'Quatschhausen');
    await p.$eval('.schirm.da .wahlliste .knopf', x => x.click());
    await bis(p, (v) => (document.querySelector('.schirm.da #frage')?.textContent || '') !== v,
      10000, vorFalsch);
    const nachFalsch = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      return { satz: s.querySelector('#frage')?.textContent.trim() || '',
               loesung: !!s.querySelector('#frage .loesung'),
               band: [...s.querySelectorAll('.band i')].map(i => i.className).join(' ') };
    });
    if (nachFalsch.loesung)
      merke('test', new Error(`nach einem Fehlversuch steht die Lösung da `
        + `(„${nachFalsch.satz}") — im Test wird nichts vorgemacht`));
    if (!/daneben/.test(nachFalsch.band))
      merke('test', new Error(`nach einem Fehlversuch ist die Aufgabe nicht vorbei `
        + `(Band: ${nachFalsch.band}) — ein Versuch je Aufgabe, sonst rät man sich durch`));

    // Und den Rest richtig: der Pokal muss kommen und an der Kachel bleiben.
    for (let n = 0; n < 20; n++) {
      if (await p.$('.schirm.da #nochmal')) break;
      await p.waitForFunction(() =>
        document.querySelectorAll('#buehne .schirm').length === 1, null, { timeout: 8000 });
      const dranVorher = await p.evaluate(() =>
        document.querySelector('.schirm.da path.ziel')?.dataset.id || '');
      if (await istUmgekehrt(p)) await zeigeAufKarte(p);
      else {
        const name = await p.evaluate(() => {
          const z = document.querySelector('.schirm.da path.ziel');
          if (!z) return null;
          const D = JSON.parse(document.getElementById('daten').textContent);
          return (D.deutschland.find(x => x.id === z.dataset.id) || {}).name || null;
        });
        if (!name) break;
        await p.fill('.schirm.da .eingabe', name);
        await p.$eval('.schirm.da .wahlliste .knopf', x => x.click());
      }
      /* Sechzehn Aufgaben mal 1900 ms waren dreissig Sekunden, von denen
         der Test nichts hatte (Q42). Gewartet wird auf das, was danach
         kommt: ein anderes Ziel oder der Endbildschirm. Die Lobpause
         dauert dann, was sie dauert - auch wenn sie einmal laenger wird. */
      await bis(p, (v) => !!document.querySelector('.schirm.da #nochmal')
        || (document.querySelector('.schirm.da path.ziel')?.dataset.id || '') !== v,
        15000, dranVorher);
    }
    const ende = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      return { gross: s.querySelector('.gross')?.textContent.trim() || '',
               unter: s.querySelector('.unter')?.textContent.trim() || '',
               pokal: !!s.querySelector('.siegsterne svg') };
    });
    if (!/bestanden/.test(ende.gross) || !ende.pokal)
      merke('test', new Error(`fünfzehn von sechzehn richtig und der Endbildschirm sagt `
        + `„${ende.gross}"${ende.pokal ? '' : ' ohne Pokal'} — bestanden wird ab 80 %`));
    else {
      await p.click('.schirm.da #andere');
      // Gewartet wird auf die Ebenenwahl, nicht auf 600 ms (Q42). Ob der
      // Pokal an der Kachel steht, ist die Frage danach - nicht diese.
      await bis(p, () => !!document.querySelector('.schirm.da [data-ebene]'), 10000);
      const bleibt = await p.evaluate(() => !!document.querySelector('.schirm.da .pokal'));
      if (!bleibt)
        merke('test', new Error('der Pokal steht nach dem Test nicht an der Kachel — '
          + 'dann sieht niemand, dass er ihn hat'));
      else {
        /* UND FIONA BEKOMMT KEINEN TEST.
         *
         * Ihre Auswahl aus vier Moeglichkeiten ist ihr Eingabeweg, keine
         * Hilfe - ohne sie waere der Test fuer sie keine Pruefung, sondern
         * eine Sperre. Geprueft wird das bei GEFUELLTER Ebene, sonst
         * bezeugte es nur, dass sie noch nichts gesammelt hat. */
        await p.click('.schirm.da #zur');
        await p.waitForSelector('.schirm.da [data-welt], .schirm.da [data-profil]',
          { timeout: 8000 });
        while (!(await p.$('.schirm.da [data-profil="fiona"]'))) {
          const zur = await p.$('.schirm.da #zur');
          if (!zur) break;
          /* Auf das Ende der Blende warten, nicht auf 400 ms (Q42):
             waehrend sie laeuft stehen zwei Bildschirme, und die Schleife
             sucht Fiona dann womoeglich auf dem alten. */
          await zur.click();
          await bis(p, () => document.querySelectorAll('#buehne .schirm').length === 1, 8000);
        }
        await p.click('[data-profil="fiona"]');
        await zurEbenenwahl(p, 'bundeslaender');
        const f = await p.evaluate(() => ({
          test: !!document.querySelector('[data-test="bundeslaender"]'),
          gesammelt: (document.querySelector('[data-ebene="bundeslaender"] .stand')
            ?.textContent || '').trim() }));
        if (f.test)
          merke('test', new Error('Fiona bekommt einen Test angeboten — ihre Auswahl aus '
            + 'vier Möglichkeiten ist ihr Eingabeweg, keine Hilfe. Ohne sie ist der Test '
            + 'für sie keine Prüfung, sondern eine Sperre'));
        else if (!/16/.test(f.gesammelt))
          merke('test', new Error(`Fionas Ebene ist nicht gefüllt (Stand „${f.gesammelt}") `
            + '— dann bezeugt „kein Test bei Fiona" nur, dass sie noch nichts gesammelt hat'));
        else console.log(`  Test ohne Hilfen:           16 Aufgaben, keine Auswahl, kein `
          + `„Weiß ich nicht", kein Zeiger, ein Versuch — „${ende.gross}", Pokal bleibt, `
          + `bei Fiona kein Test (Stand ${f.gesammelt})`);
      }
    }
  }
  await p.close();
} catch (e) { merke('test', e); }

/* Die umgekehrte Frage (B3) - „Wo liegt Bayern?"
 *
 * Sie braucht einen eigenen Abschnitt, weil sie erst bei der DRITTEN
 * Aufgabe kommt und die anderen Abschnitte je Ebene nur eine spielen. Ein
 * Weg, den keine Pruefung je betritt, ist kein geprueter Weg.
 *
 * Vier Dinge, und das erste ist das wichtigste: die Karte darf die Antwort
 * nicht verraten. Beim ersten Anlauf tat sie es - das gesuchte Gebiet trug
 * weiterhin die Klasse `ziel` und damit die Akzentfarbe.
 */
if (laeuft('umgekehrt')) try {
  const p = await neueSeite({ width: 844, height: 390 }, ctx);
  await p.waitForSelector('[data-profil="lea"]');
  await p.click('[data-profil="lea"]');
  await zurEbenenwahl(p, 'bundeslaender');
  await p.click('[data-ebene="bundeslaender"]');
  await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg', { timeout: 20000 });
  await durchVorlaufWenn(p);

  // Zwei normale Aufgabe loesen - Lea tippt das Etikett an.
  const normal = async () => {
    await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 8000 });
    const z = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const id = s.querySelector('path.ziel').dataset.id;
      const D = JSON.parse(document.getElementById('daten').textContent);
      const name = D.deutschland.find(x => x.id === id).name;
      return { name, i: [...s.querySelectorAll('.etikett')].map(e => e.textContent.trim())
        .indexOf(name) };
    });
    if (z.i < 0) throw new Error(`„${z.name}" steht nicht in der Auswahl`);
    await (await p.$$('.schirm.da .etikett'))[z.i].click();
    await bis(p, () => !!document.querySelector('.schirm.da .frage .richtigText'), 6000);
    await bis(p, () => !document.querySelector('.schirm.da .frage .richtigText'), 8000);
  };
  await normal(); await normal();

  const st = await p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    return {
      frage: s.querySelector('#frage').textContent.trim(),
      puls: !!s.querySelector('.zielpuls'), zeiger: !!s.querySelector('.zeiger'),
      angemalt: !!s.querySelector('path.geb.ziel'),
      etiketten: s.querySelectorAll('.etikett').length,
      feld: !!s.querySelector('input.eingabe'),
      umschalter: !!s.querySelector('#weise'),
      satz: s.querySelector('.wahlliste .hinweis')?.textContent.trim() || '',
    };
  });
  if (!/^Wo liegt /.test(st.frage))
    merke('umgekehrt', new Error(`die dritte Aufgabe fragt „${st.frage}" statt „Wo liegt …?" `
      + '— die umgekehrte Frage kommt gar nicht vor'));
  else {
    // DIE ANTWORT DARF NICHT AUF DER KARTE STEHEN.
    if (st.puls || st.zeiger || st.angemalt)
      merke('umgekehrt', new Error(`bei „${st.frage}" ist das gesuchte Gebiet markiert `
        + `(${[st.puls && 'Puls', st.zeiger && 'Zeiger', st.angemalt && 'angemalt']
             .filter(Boolean).join(', ')}) — die Frage beantwortet sich selbst`));
    if (st.etiketten || st.feld)
      merke('umgekehrt', new Error('bei der umgekehrten Frage stehen trotzdem Antworten da '
        + `(${st.etiketten} Etiketten${st.feld ? ' und ein Tippfeld' : ''})`));
    if (st.umschalter)
      merke('umgekehrt', new Error('der Umschalter „Lieber ziehen" steht da und hat '
        + 'nichts zu schalten — es gibt kein Etikett'));
    if (!/Tippe auf die Karte/.test(st.satz))
      merke('umgekehrt', new Error(`neben der Frage steht „${st.satz}" — ohne den Satz `
        + 'sieht das Kind eine Frage und nichts, was nach Antwort aussieht'));

    // Erst DANEBEN tippen: das muss den Fehler benennen (A3).
    const daneben = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const name = s.querySelector('#frage').textContent.replace(/^Wo liegt |\?$/g, '').trim();
      const D = JSON.parse(document.getElementById('daten').textContent);
      const ziel = D.deutschland.find(x => x.name === name);
      const svg = s.querySelector('.karte svg');
      const punkt = (g) => { const pt = svg.createSVGPoint();
        pt.x = g.anker[0]; pt.y = g.anker[1];
        const q = pt.matrixTransform(svg.getScreenCTM()); return { x: q.x, y: q.y }; };
      const weit = D.deutschland.filter(g => g.anker && g.id !== ziel.id)
        .sort((a, b) => Math.hypot(b.anker[0]-ziel.anker[0], b.anker[1]-ziel.anker[1])
                      - Math.hypot(a.anker[0]-ziel.anker[0], a.anker[1]-ziel.anker[1]))[0];
      return { gesucht: name, falsch: weit.name, ...punkt(weit) };
    });
    await p.mouse.click(daneben.x, daneben.y);
    // Auf den Hinweis warten, nicht auf 400 ms (Q42). Geprueft wird
    // gleich, was er SAGT - dass er ueberhaupt kommt, ist nicht dasselbe.
    await bis(p, () => !!document.querySelector('.schirm.da .wahlliste .hinweis'), 8000);
    const hin = await p.evaluate(() =>
      document.querySelector('.schirm.da .wahlliste .hinweis')?.textContent.trim() || '');
    if (!hin.includes(daneben.falsch) || !/liegt weiter/.test(hin))
      merke('umgekehrt', new Error(`auf ${daneben.falsch} getippt, gesucht war `
        + `${daneben.gesucht} — der Hinweis lautet „${hin}" und nennt nicht beides `
        + '(was da ist und wo es hin muss)'));

    // Und dann richtig.
    const gesucht = await zeigeAufKarte(p);
    const ok = await bis(p,
      () => !!document.querySelector('.schirm.da .frage .richtigText'), 6000);
    if (!ok)
      merke('umgekehrt', new Error(`auf ${gesucht} getippt und nicht gewertet`));
    else console.log(`  Umgekehrte Frage:           „${st.frage}" ohne Markierung, `
      + `daneben → „${hin}", richtig gewertet`);
  }
  await p.close();

  /* --- Und die Gegenrichtung: wo man nicht treffen KANN (P7, P10) ----
   *
   * P7 hat gezogen: wo ein Gebiet am Ort keine 20 Punkte bekommt, wird
   * eben nicht gefragt. P10 hat das umgedreht - solche Gebiete haengen
   * an einer NADEL neben der Karte, volle 44 Punkte, mit einem Faden zum
   * Gebiet. Die Frage kommt also wieder, und genau das wird hier
   * geprueft: nicht dass sie ausbleibt, sondern dass sie gestellt UND an
   * der Nadel beantwortbar ist.
   *
   * Gespielt wird EUROPA. Bis A6 stand hier Nordamerika mit seinen
   * sieben Nadeln; seit Mittelamerika seine eigene Karte hat, hat
   * Nordamerika drei Laender und keine einzige Nadel mehr. Der Abschnitt
   * waere nicht rot geworden, sondern LEER: der gestellte Stand liess
   * alle drei auf Fach 5 laufen, die Sitzung hatte keine Aufgabe, und
   * das Warten auf die erste Frage lief in die Zeitueberschreitung.
   *
   * Gemessen von `npm run ziehen --nur=treffer` (844 x 390): auf der
   * Europakarte haengen zwei Gebiete an einer Nadel, sechs weitere haben
   * am Ort zwischen 20 und 44 Punkten. Belgien und Luxemburg sind die
   * beiden engsten - dort passt am Ort kein Kreis mehr hin.
   *
   * Gezoomt wird weiterhin nicht: eine auf Luxemburg gezoomte Karte
   * beantwortet „Wo liegt Luxemburg?" selbst.
   *
   * Gestellt wird ein Stand, in dem NUR die acht kleinen faellig sind.
   * Damit ist jede Aufgabe eine von ihnen.
   */
  const r = await neueSeite({ width: 844, height: 390 }, ctx);
  /* Die sieben kleinen faellig - und alle anderen ausdruecklich NICHT.
   *
   * Zwei Anlaeufe, zwei Mal nichts geprueft. Erst standen nur HTI und
   * DOM faellig: dann hat die Sitzung genau zwei Aufgaben, und die
   * dritte, an der die umgekehrte Frage stuende (`st.i % 3 === 2`),
   * kam nie. Dann standen sieben faellig - und der Leitner fuellte die
   * Sitzung mit NEUEN Laendern auf, so dass die dritte Aufgabe „Wo
   * liegt Kanada?" hiess. Kanada ist gross, die Frage also richtig,
   * und der Abschnitt gruen: er hat den Fall wieder nicht gesehen.
   *
   * Jetzt bekommt jedes andere Land Fach 5 und einen Termin in ferner
   * Zukunft. Damit kann die Sitzung nur aus den sieben bestehen. */
  /* Griechenland steht ABSICHTLICH nicht dabei, obwohl es mit 44,0
     Punkten zu den kleinen zaehlt: es liegt genau AUF der Fingergrenze
     (`gross * k < MIN_PT`), und die Rundung entscheidet von Bild zu Bild,
     ob es eine Nadel bekommt. Ein Wackelkandidat als Gegenstand einer
     Pruefung macht die Pruefung wackelig, nicht die Sache - der Abschnitt
     meldete „Aufgabe an der Nadel ohne hervorgehobenen Faden (GRC)",
     obwohl an Faden und Nadel nichts falsch war. */
  const kleine = new Set(['BEL','LUX','AUT','CZE','NLD','DNK','CHE']);
  const aufDerKarte = await r.evaluate(() =>
    (JSON.parse(document.getElementById('daten').textContent).laender.europa || [])
      .map(l => l.a3));
  /* Und die Voraussetzung wird GEPRUEFT, nicht geglaubt: stuenden die
     acht Kennungen nicht auf dieser Karte, bekaeme jedes Land Fach 5,
     die Sitzung waere leer und der Abschnitt liefe in die
     Zeitueberschreitung statt etwas zu melden. Genau so ist er bei A6
     gestorben, als die Karte unter ihm gewechselt hat. */
  {
    const fehlt = [...kleine].filter(a3 => !aufDerKarte.includes(a3));
    if (fehlt.length) merke('umgekehrt', new Error(
      `${fehlt.join(', ')} steht nicht auf der Europakarte — der gestellte Stand `
      + 'liesse die Sitzung leer, und dieser Abschnitt prüfte nichts'));
  }
  await stelleAblage(r, {
    fortschritt: { 'stephan:laender:europa': Object.fromEntries(aufDerKarte.map(a3 =>
      [a3, kleine.has(a3) ? { fach:1, faellig:0 } : { fach:5, faellig: Date.now() + 9e8 }])) },
    einstellungen: { alles: { vorlaufGezeigt: { 'stephan:laender:europa': true } } },
  });
  await r.reload({ waitUntil: 'domcontentloaded' });
  await r.waitForSelector('[data-profil="stephan"]');
  await r.click('[data-profil="stephan"]');
  await zurEbenenwahl(r, 'laender:europa');
  await r.click('[data-ebene="laender:europa"]');
  await r.waitForSelector('.schirm.da #los, .schirm.da .karte svg', { timeout: 25000 });
  await durchVorlaufWenn(r);
  const fragen = [], geantwortet = [];
  /* Die ganze Sitzung, nicht neun Aufgaben.
   *
   * Stephan spielt zwoelf; die umgekehrte Frage steht an jeder dritten,
   * also an 3, 6, 9 und 12. Auf der Europakarte sind sieben der
   * siebzehn Laender faellig gestellt - welche davon auf einem dritten
   * Platz landen, entscheidet der Leitner. Wer nach neun aufhoert,
   * verschenkt ein Viertel der Gelegenheiten, an denen dieser Abschnitt
   * ueberhaupt etwas sehen kann. */
  for (let i = 0; i < 12; i++) {
    await r.waitForSelector('.schirm.da #frage', { timeout: 20000 });
    /* Die Frage steht, die Karte womoeglich noch nicht - und gelesen wird
       gleich am Ziel auf der Karte. Also darauf warten und nicht auf
       250 ms (Q42), und zugleich darauf, dass die Blende durch ist. */
    await bis(r, () => document.querySelectorAll('#buehne .schirm').length === 1
      && !!document.querySelector('.schirm.da .karte svg path.ziel'), 15000);
    const f = await r.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const z = s.querySelector('path.ziel');
      /* An der Nadel haengt, wer einen Trefferkreis MIT DER MARKE traegt.
         Gelesen wird das am Bildschirm, nicht an einer Liste hier: sonst
         prueft der Abschnitt seine eigene Annahme.
         
         Bis A6 stand hier „Kreis breiter als 40 Punkte". Auf der
         Nordamerikakarte stimmte das - dort war am Ort niemand so gross.
         Auf der Europakarte ist es falsch: ein Gebiet, das am Ort seine
         vollen 44 Punkte bekommt, sieht genauso aus. Die Gegenprobe „es
         gibt gar keine Nadeln mehr" hat es gefunden: mit abgeschalteten
         Nadeln zaehlte der Abschnitt weiter drei „Nadeln" und wurde aus
         zwei ganz anderen Gruenden rot. */
      const anNadel = [...new Set([...s.querySelectorAll('#treffer circle.annadel[data-id]')]
        .map(c => c.dataset.id))];
      /* Der Wegweiser: haengt das GESUCHTE Gebiet an einer Nadel, ist ihr
         Faden hervorgehoben - und bei der umgekehrten Frage nicht, denn
         dort waere er die Antwort. Gelesen wird die Kennung des
         hervorgehobenen Kopfes, nicht nur seine Zahl: ein Wegweiser, der
         auf das falsche Land zeigt, waere schlimmer als keiner. */
      const wegweiser = [...s.querySelectorAll('#treffer .nadelkopf.nadelziel')]
        .map(c => { const r = c.getBoundingClientRect();
          const k = [...s.querySelectorAll('#treffer circle.annadel[data-id]')].find(x => {
            const b = x.getBoundingClientRect();
            return Math.abs(b.left + b.width/2 - (r.left + r.width/2)) < 1; });
          return k ? k.dataset.id : '?'; });
      return { text: s.querySelector('#frage').textContent.trim(),
               ziel: z ? z.dataset.id : null,
               feld: !!s.querySelector('.eingabe'),
               anNadel, wegweiser,
               klein: [...s.querySelectorAll('path.geb[data-klein="1"]')].map(x => x.dataset.id) };
    });
    if (!f.text) break;
    fragen.push(f);
    if (f.feld && f.ziel) {
      const name = await r.evaluate((id) => {
        const D = JSON.parse(document.getElementById('daten').textContent);
        const l = (D.laender.europa || []).find(x => x.a3 === id);
        return l ? l.name : null;
      }, f.ziel);
      if (!name) break;
      await r.fill('.schirm.da .eingabe', name);
      await r.$eval('.schirm.da .wahlliste .knopf', x => x.click());
    } else {
      /* Die umgekehrte Frage wird jetzt BEANTWORTET, nicht mehr
         uebersprungen - und zwar dort, wo ein Kind tippt: auf die
         groesste Trefferflaeche, seit P10 also auf die Nadel. Nur so
         beweist der Abschnitt, dass die Nadel etwas TUT. Vorher stand
         hier „ueberspringen"; damit war geprueft, welche Fragen kommen,
         und nicht, ob man sie beantworten kann. */
      const gezeigt = await zeigeAufKarte(r);
      const gewertet = await bewertet(r);
      geantwortet.push({ name: gezeigt, gewertet });
      if (!gewertet) {
        const weg = await r.$('.schirm.da #ueberspringen');
        if (!weg) break;
        await weg.click();
      }
    }
    /* NICHT `weitergegangen()`: das wartet unter anderem auf `path.ziel`,
       und bei der umgekehrten Frage gibt es den mit Absicht nicht - das
       gesuchte Gebiet ist ja nicht markiert. Der Helfer lief dort in die
       Zeitueberschreitung, die Schleife brach nach fuenf Aufgaben ab, und
       der Abschnitt meldete „keine einzige Wo-liegt-Frage". Gewartet wird
       hier auf das, was BEIDE Fragearten haben: das Lob ist weg, und es
       steht wieder etwas da, das man bedienen kann. */
    const weiter = await r.waitForFunction(() => {
      const s = document.querySelector('.schirm.da');
      if (!s) return false;
      if (s.querySelector('.frage .richtigText, .frage .fastText, .frage .loesung')) return false;
      return !!(s.querySelector('.eingabe') || s.querySelector('#ueberspringen')
                || s.querySelector('#nochmal'));
    }, null, { timeout: 8000 }).then(() => true).catch(() => false);
    if (!weiter) break;
  }
  /* Und die Pruefung muss die Stelle ueberhaupt erreichen: die umgekehrte
     Frage steht an jeder dritten Aufgabe. Weniger als drei gespielt heisst
     „nichts geprueft" - und das darf nicht gruen aussehen. */
  if (fragen.length < 3) merke('umgekehrt', new Error(
    `nur ${fragen.length} Aufgaben gespielt — die umgekehrte Frage steht an der dritten, `
    + 'dieser Abschnitt hat sie also gar nicht erreicht'));
  /* Die Voraussetzung des ganzen Abschnitts: auf dieser Karte MUSS es
     Gebiete geben, die am Ort nicht zu treffen sind. Haengt keines an
     einer Nadel, ist die Europakarte nicht mehr der enge Fall - und
     dann prueft hier nichts mehr, ohne dass etwas rot wuerde. */
  const nadelDa = fragen[0] ? fragen[0].anNadel.length : 0;
  if (!nadelDa) merke('umgekehrt', new Error(
    'auf der Europakarte hängt kein Gebiet an einer Nadel — dann prüft dieser '
    + 'Abschnitt nichts (gemessen sind es zwei, Belgien und Luxemburg)'));
  const nadelSet = new Set(fragen[0] ? fragen[0].anNadel : []);
  const kleinDa = fragen[0] ? fragen[0].klein.length : 0;
  const kleinSet = new Set(fragen[0] ? fragen[0].klein : []);
  const verkehrt = fragen.filter(f => /^Wo liegt /.test(f.text));
  const zuKlein = verkehrt.filter(f => kleinSet.has(f.ziel)
    || fragen.some(g => g.text === f.text && kleinSet.has(g.ziel)));
  /* Der Zielumriss ist bei der umgekehrten Frage NICHT markiert - das ist
     ihr Sinn. Erkannt wird das gefragte Gebiet deshalb am Namen. */
  const namen = await r.evaluate(() => {
    const D = JSON.parse(document.getElementById('daten').textContent);
    return Object.fromEntries((D.laender.europa || []).map(l => [l.name, l.a3]));
  });
  for (const f of verkehrt) {
    const id = namen[f.text.replace(/^Wo liegt |\?$/g, '').trim()];
    if (id && kleinSet.has(id)) merke('umgekehrt', new Error(
      `„${f.text}" wurde gefragt, obwohl ${id} auf dieser Karte zu klein zum Antippen ist `
      + '— dort ist das keine Erdkundefrage mehr, sondern eine Fingerübung (P7)'));
  }
  /* Und die Gegenrichtung: die Regel darf die umgekehrte Frage nicht
     ABSCHALTEN, nur filtern. Kaeme hier gar keine mehr, waere der
     Abschnitt gruen und die Frage waere aus dem Spiel verschwunden. */
  if (!verkehrt.length) merke('umgekehrt', new Error(
    `in ${fragen.length} Aufgaben auf der Europakarte kam keine einzige `
    + '„Wo liegt …?" — die Regel filtert nicht, sie schaltet ab'));
  /* Der eigentliche Punkt von P10: die Frage kommt fuer ein Gebiet, das
     an der Nadel haengt - und sie laesst sich dort beantworten. Ohne
     diesen Fall waeren die Nadeln Zierat: gezeichnet, gemessen, und im
     Spiel ohne Wirkung. */
  const anNadel = verkehrt.filter(f => {
    const id = namen[f.text.replace(/^Wo liegt |\?$/g, '').trim()];
    return id && nadelSet.has(id);
  });
  if (!anNadel.length) merke('umgekehrt', new Error(
    `keine der ${verkehrt.length} „Wo liegt …?"-Fragen galt einem Gebiet an der Nadel — `
    + 'dann ist ungeprüft, ob die Nadel die Frage überhaupt zurückbringt (P10)'));
  /* Der Wegweiser, beide Richtungen (P15).
   *
   * Eine normale Frage nach einem Gebiet an der Nadel MUSS ihn zeigen -
   * sonst zeigt der Zeiger in einen Pulk, in dem vier Laender innerhalb
   * von zehn Punkten liegen, und niemand sagt, wohin das Etikett gehoert.
   * Die umgekehrte Frage darf ihn NICHT zeigen: dort ist die Karte die
   * Antwort, und ein leuchtender Faden waere sie auch. */
  const normalNadel = fragen.filter(f => !/^Wo liegt /.test(f.text)
    && f.ziel && nadelSet.has(f.ziel));
  const ohneWeg = normalNadel.filter(f => !f.wegweiser.includes(f.ziel));
  if (!normalNadel.length) merke('umgekehrt', new Error(
    'keine normale Frage galt einem Gebiet an der Nadel — dann ist der Wegweiser ungeprüft'));
  else if (ohneWeg.length) merke('umgekehrt', new Error(
    `${ohneWeg.length} Aufgaben zu einem Gebiet an der Nadel ohne hervorgehobenen Faden `
    + `(${ohneWeg.map(f => f.ziel).join(', ')}) — der Zeiger steht dann im Pulk und sagt nicht, `
    + 'wohin das Etikett gehört'));
  const verkehrtMitWeg = fragen.filter(f => /^Wo liegt /.test(f.text) && f.wegweiser.length);
  if (verkehrtMitWeg.length) merke('umgekehrt', new Error(
    `bei „${verkehrtMitWeg[0].text}" leuchtet ein Nadelfaden — das ist die Antwort`));
  const daneben = geantwortet.filter(g => !g.gewertet);
  if (daneben.length) merke('umgekehrt', new Error(
    `auf die Nadel getippt und nicht gewertet: ${daneben.map(g => g.name).join(', ')} — `
    + 'die Trefferfläche steht da und trifft nicht'));
  console.log(`  An der Nadel:               ${nadelDa} Gebiete auf der Europakarte, `
    + `${kleinDa} bleiben zu klein · ${fragen.length} Aufgaben, davon `
    + `${verkehrt.length} × „Wo liegt …?" `
    + `(${verkehrt.map(f => f.text.replace(/^Wo liegt |\?$/g, '')).join(', ') || 'keine'}), `
    + `${anNadel.length} davon an der Nadel — alle getippt und gewertet · `
    + `Wegweiser bei ${normalNadel.length} normalen Fragen, bei keiner umgekehrten`);
  await r.close();
} catch (e) { merke('umgekehrt', e); }

/* --- Der Streu auf den Profilkacheln (G12) ---------------------------
 *
 * Was hier wirklich geprueft wird, ist nicht „es sind Bilder da". Das
 * waere in dem Moment gruen, in dem irgendwo irgendetwas steht.
 *
 * Geprueft wird VIERERLEI, und jedes davon hat einen Gegenfall:
 *   - Fiona hat viele verschiedene Motive in vielen verschiedenen Farben,
 *     die Schildkroeten allein in mehreren - danach war gefragt;
 *   - Lea hat Totenkoepfe, und deren Augen haben wirklich den Verlauf
 *     (eine `url(#...)`, die ins Leere zeigt, faerbt in Chromium
 *     schwarz und faellt sonst niemandem auf);
 *   - die ELTERN haben keinen. Ohne diesen Fall bezeugt „Fiona hat
 *     einen" nur, dass irgendwo Markup steht;
 *   - kein Motiv liegt auf dem NAMEN, und der Streu liegt wirklich auf
 *     der Kachel. Das Erste ist beim Hinsehen entschieden worden - drei
 *     Motive sind dafuer umgezogen - und waere beim naechsten
 *     Verschieben still wieder kaputt.
 *
 * Den KONTRAST misst dieser Abschnitt nicht. Das tut `lesbarkeit`, und
 * zwar seit G12 an den Motiven selbst statt am Kasten des Streus.
 */
if (laeuft('streu')) try {
  const p = await neueSeite({ width: 844, height: 390 }, ctx);
  await p.waitForSelector('.kachel.wer');

  /* --- Die Profilfarben ------------------------------------------------
   *
   * Der eigentliche Wunsch war die FARBE, nicht der Streu: Fiona
   * tuerkis, Lea hellgruen, Stephan blau. Ein Tausch von Marken ist eine
   * Zeile, faellt beim Lesen des Diffs nicht auf und wird von keinem
   * anderen Tor bemerkt - `lesbarkeit` misst Kontrast, und der ist bei
   * allen sieben Flaechen derselbe.
   *
   * Gemessen wird am BILD, nicht an der Marke: `--f4` sagt nichts
   * darueber, welche Farbe herauskommt. Der Farbton wird aus dem
   * gerechneten Grund des Kreises gelesen.
   *
   * Die Baender sind eng, und das ist eine Auskunft: Fiona (169 Grad) und
   * Stephan (197) liegen nur 28 Grad auseinander. Sie stehen nicht
   * nebeneinander, und Fionas Kachel ist voller Meerestiere - aber wer
   * die Baender das naechste Mal weitet, soll wissen, was er weitet.
   */
  const SOLL_TON = { fiona:[150,190,'türkis'], lea:[70,145,'hellgrün'],
                     stephan:[190,228,'blau'], violeta:[228,290,'violett'] };
  const toene = await p.evaluate(() => {
    const c = document.createElement('canvas'); c.width = c.height = 1;
    const g = c.getContext('2d', { willReadFrequently: true });
    // Den Farbton vom BROWSER rechnen lassen: `getComputedStyle` liefert
    // bei einer oklch-Marke auch oklch zurueck, und ein Zahlenleser darauf
    // laege daneben (derselbe Fehler hat in `lesbarkeit` 34 Fehler
    // gemeldet, die es nicht gab).
    const ton = (s) => {
      g.fillStyle = '#000'; g.fillStyle = s; g.fillRect(0, 0, 1, 1);
      const d = g.getImageData(0, 0, 1, 1).data;
      const [r, gr, bl] = [d[0]/255, d[1]/255, d[2]/255];
      const mx = Math.max(r, gr, bl), mn = Math.min(r, gr, bl);
      if (mx === mn) return -1;
      const dd = mx - mn;
      const h = mx === r ? ((gr-bl)/dd + (gr<bl?6:0)) : mx === gr ? ((bl-r)/dd+2) : ((r-gr)/dd+4);
      return Math.round(h * 60);
    };
    return Object.fromEntries(['fiona','lea','stephan','violeta'].map(id => [id,
      ton(getComputedStyle(document.querySelector(`[data-profil="${id}"] .kreis`))
        .backgroundColor)]));
  });
  for (const [id, [von, bis, wie]] of Object.entries(SOLL_TON))
    if (!(toene[id] >= von && toene[id] <= bis)) merke('streu', new Error(
      `${id} ist mit Farbton ${toene[id]} nicht ${wie} (erwartet ${von} bis ${bis} Grad)`));
  // Und keine zwei duerfen sich aehneln - vier Kacheln, vier Farben.
  const ids = Object.keys(SOLL_TON);
  for (let i = 0; i < ids.length; i++) for (let j = i+1; j < ids.length; j++) {
    const d = Math.abs(toene[ids[i]] - toene[ids[j]]);
    if (Math.min(d, 360 - d) < 20) merke('streu', new Error(
      `${ids[i]} und ${ids[j]} haben fast denselben Farbton (${toene[ids[i]]} und ${toene[ids[j]]})`));
  }

  const bild = await p.evaluate(() => {
    const farbe = (e) => getComputedStyle(e).color;
    const kachel = (id) => document.querySelector(`[data-profil="${id}"]`);
    const motive = (id) => [...kachel(id).querySelectorAll('.streu i')]
      .map(e => ({ art: e.dataset.motiv, farbe: farbe(e) }));
    const auge = document.querySelector('#auge-lea');
    // Liegt eine Motivmitte im Kasten des Namens?
    const aufDemNamen = (id) => {
      const n = kachel(id).querySelector('.name').getBoundingClientRect();
      return [...kachel(id).querySelectorAll('.streu i')].filter(e => {
        const r = e.getBoundingClientRect();
        const mx = r.left + r.width / 2, my = r.top + r.height / 2;
        return mx >= n.left && mx <= n.right && my >= n.top && my <= n.bottom;
      }).map(e => e.dataset.motiv);
    };
    const f = motive('fiona'), l = motive('lea');
    return {
      fionaArten: [...new Set(f.map(x => x.art))].sort(),
      fionaFarben: new Set(f.map(x => x.farbe)).size,
      kroetenFarben: new Set(f.filter(x => x.art === 'schildkroete').map(x => x.farbe)).size,
      leaArten: [...new Set(l.map(x => x.art))],
      leaZahl: l.length,
      augeStops: auge ? auge.querySelectorAll('stop').length : -1,
      augeGefuellt: l.length
        ? getComputedStyle(kachel('lea').querySelector('.streu ellipse')).fill : '',
      eltern: ['stephan', 'violeta'].map(id => kachel(id).querySelectorAll('.streu i').length),
      aufNamen: { fiona: aufDemNamen('fiona'), lea: aufDemNamen('lea') },
    };
  });

  const sollFiona = ['fisch','herz','muschel','qualle','schildkroete','schnecke',
                     'seestern','stern','wal'];
  const fehlt = sollFiona.filter(x => !bild.fionaArten.includes(x));
  if (fehlt.length) merke('streu', new Error(
    `auf Fionas Kachel fehlen Motive: ${fehlt.join(', ')}`));
  if (bild.fionaFarben < 6) merke('streu', new Error(
    `Fionas Streu hat nur ${bild.fionaFarben} verschiedene Farben — gewünscht waren viele`));
  if (bild.kroetenFarben < 3) merke('streu', new Error(
    `nur ${bild.kroetenFarben} Schildkrötenfarbe(n) — gewünscht waren mehrere`));
  if (bild.leaArten.join() !== 'totenkopf' || bild.leaZahl < 8) merke('streu', new Error(
    `Leas Kachel trägt ${bild.leaZahl} × ${bild.leaArten.join('/') || 'nichts'}, `
    + 'erwartet mindestens 8 Totenköpfe und nichts anderes'));
  if (bild.augeStops < 2) merke('streu', new Error(
    'der Verlauf für die Augen fehlt — sie wären einfarbig oder schwarz'));
  if (!/url\(/.test(bild.augeGefuellt)) merke('streu', new Error(
    `die Augen sind mit „${bild.augeGefuellt}" gefüllt, nicht mit dem Verlauf`));
  if (bild.eltern.some(n => n > 0)) merke('streu', new Error(
    `die Eltern haben ${bild.eltern.join(' und ')} Motive — der Streu gehört den Kindern`));
  for (const [wer, drauf] of Object.entries(bild.aufNamen))
    if (drauf.length) merke('streu', new Error(
      `auf ${wer}s Namen liegt ${drauf.join(', ')} — der Name muss frei bleiben`));

  /* Hier stand: „ein Tipp auf die grosse Muschel muss ins Spiel fuehren -
     sonst faengt der Streu den Finger". Die Gegenprobe hat das
     abgeraeumt: mit `pointer-events:auto` blieb der Rauchtest gruen. Und
     zwar zu Recht - der Streu liegt IM Knopf, ein Tipp auf ein Kind des
     Knopfes loest den Knopf aus. Die Pruefung konnte nicht durchfallen
     und bewies deshalb nichts (Regel 1). `pointer-events:none` bleibt
     trotzdem stehen; es haelt die Motive aus der Treffersuche heraus,
     nur traegt es die Bedienbarkeit nicht.

     Geprueft wird stattdessen der Fehler, der in dieser Datei WIRKLICH
     schon passiert ist: das Wasserzeichen aus der absoluten Lage zu
     holen. Steht `.streu` nicht in der `:not()`-Liste, gewinnt
     `position:relative` (drei Klassen gegen zwei), und weil die Motive
     selbst absolut liegen, faellt der Streukasten auf 0 x 0 zusammen.
     Die Motive haengen dann an diesem Punkt statt an der Kachel: die
     grosse Muschel sass 24 Punkte UEBER dem oberen Rand. Gemessen, nicht
     vermutet.

     Und ausdruecklich NICHT ueber die Kachelhoehe: die vier Kacheln
     stehen in einem Raster, und ein Raster gleicht die Hoehen einer
     Reihe an. Der erste Anlauf verglich Fionas Kachel mit Stephans und
     blieb deshalb gruen, obwohl der Streu weg war - die Gegenprobe hat
     auch das gefunden. */
  const lage = await p.evaluate(() => {
    const k = document.querySelector('[data-profil="fiona"]');
    const a = k.getBoundingClientRect(), c = k.querySelector('.streu').getBoundingClientRect();
    const raus = [...k.querySelectorAll('.streu i')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.bottom < a.top || r.top > a.bottom || r.right < a.left || r.left > a.right;
    }).length;
    return { deckung: [+(c.width / a.width).toFixed(2), +(c.height / a.height).toFixed(2)], raus };
  });
  if (lage.deckung[0] < 0.9 || lage.deckung[1] < 0.9) merke('streu', new Error(
    `der Streu deckt nur ${lage.deckung[0]} x ${lage.deckung[1]} der Kachel — `
    + 'er ist aus seiner absoluten Lage gerutscht, und die Motive hängen im Nichts'));
  if (lage.raus) merke('streu', new Error(
    `${lage.raus} Motive liegen ganz außerhalb ihrer Kachel`));

  console.log('  Profilfarben:               '
    + Object.entries(SOLL_TON).map(([id, w]) => `${id} ${w[2]} (${toene[id]}°)`).join(' · '));
  console.log(`  Streu auf den Kacheln:      Fiona ${bild.fionaArten.length} Arten in `
    + `${bild.fionaFarben} Farben (Schildkröten in ${bild.kroetenFarben}), `
    + `Lea ${bild.leaZahl} Totenköpfe mit ${bild.augeStops}-stufigem Auge, `
    + `Eltern ${bild.eltern.join('/')} — Name frei, Streu deckt ${lage.deckung.join(' × ')}`);
  await p.close();
} catch (e) { merke('streu', e); }

/* --- Abzeichen (D2) --------------------------------------------------
 *
 * Vier Dinge, und jedes hat einen Gegenfall:
 *
 *   - ein Abzeichen erscheint, wenn seine Menge VOLL ist - und vorher
 *     ausdruecklich NICHT. Ohne den zweiten Teil bezeugt der erste nur,
 *     dass irgendwo Markup steht;
 *   - es kann nicht verlorengehen: die Menge kommt aus dem VOLLEN Vorrat
 *     der Ebene, nicht aus Fionas wachsender Kontinentrunde. Geprueft
 *     wird an ihr, mit allen vier Kontinenten ihrer ersten Runde
 *     gesammelt - „alle Kontinente" muss dann noch FEHLEN, und zwar
 *     genau zwei;
 *   - offen steht hoechstens EINES da. Der Bildschirm hat sich die Lehre
 *     schon einmal teuer erkauft (sechzig leere Kaesten);
 *   - der Endbildschirm SAGT es, wenn eines dazukommt. Das ist der eine
 *     Moment, in dem es sich zu sagen lohnt.
 */
if (laeuft('abzeichen')) try {
  const p = await neueSeite({ width: 844, height: 390 }, ctx);

  /* --- Fiona: DREI von vier Kontinenten ihrer ersten Runde -----------
   *
   * Der Fall, an dem sich zeigt, ob die Menge aus dem VOLLEN Vorrat kommt.
   * Fiona bekommt die Kontinente rundenweise; mit drei von vier bleibt
   * sie in Runde eins und sieht genau vier. Ueber ihren Vorrat gerechnet
   * stuende neben „Du kennst alle Kontinente" also „Dir fehlt noch eins"
   * - obwohl es sechs sind und drei fehlen. Die Zahl muss die ganze
   * Menge meinen, sonst zaehlt sie etwas anderes als der Satz darueber
   * behauptet. */
  const fuerAbzeichen = await p.evaluate(() => {
    const D = JSON.parse(document.getElementById('daten').textContent);
    const drei = {};
    for (const k of D.kontinente.filter(x => x.runde <= 1).slice(0, 3))
      drei[k.id] = { fach:4, faellig:0 };
    /* Dazu die drei Stadtstaaten - damit sie ueberhaupt EIN Abzeichen
       hat. Das offene erscheint erst neben einem verdienten (siehe
       `forscherbuch`); ohne diesen Griff pruefte der Abschnitt einen
       Bildschirm, den es so nicht gibt. */
    const stadt = {};
    for (const b of D.deutschland.filter(x => x.stadtstaat))
      stadt[b.id] = { fach:4, faellig:0 };
    return { drei, stadt };
  });
  await stelleAblage(p, {
    fortschritt: { 'fiona:kontinente': fuerAbzeichen.drei,
                   'fiona:bundeslaender': fuerAbzeichen.stadt },
    einstellungen: { alles: { vorlaufGezeigt: {
      'fiona:kontinente': true, 'fiona:bundeslaender': true } } },
  });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-profil="fiona"]');
  await p.click('[data-profil="fiona"]');
  await p.click('#buch');
  await p.waitForSelector('.schirm.da .abzeichen', { timeout: 25000 });
  const beiFiona = await p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    return { offen: [...s.querySelectorAll('.abz.offen')].map(x => x.textContent.trim()),
             da: [...s.querySelectorAll('.abz.da')].map(x => x.textContent.trim()) };
  });
  if (!beiFiona.da.some(t => /drei Stadtstaaten/.test(t))) merke('abzeichen', new Error(
    `das verdiente Abzeichen fehlt — im Buch steht ${JSON.stringify(beiFiona.da)}`));
  if (beiFiona.da.some(t => /alle Kontinente/.test(t))) merke('abzeichen', new Error(
    'Fiona hat „alle Kontinente" verdient — sie hat drei von sechs, die Menge ist nicht voll'));
  /* Auch hier hoechstens drei statt genau eines (G15b) - dieselbe Zusage,
     an der zweiten Stelle. Sie stand doppelt da; die eine mitzuziehen und
     die andere zu vergessen ist genau die Verfallsart, gegen die Regel 6
     geschrieben ist (was zweimal dasteht, veraltet einmal). Gemeldet hat
     es die Kette, nicht ich. */
  if (beiFiona.offen.length < 1 || beiFiona.offen.length > 3) merke('abzeichen', new Error(
    `${beiFiona.offen.length} offene Abzeichen auf einmal — es sollen eins bis drei sein`));
  if (!/fehlen noch 3/.test(beiFiona.offen[0] || '')) merke('abzeichen', new Error(
    `das offene Abzeichen sagt „${beiFiona.offen[0]}" — gezählt werden muss gegen die `
    + 'ganze Menge (sechs Kontinente, drei fehlen), nicht gegen Fionas erste Runde'));

  /* --- Und jetzt spielt Fiona das letzte Bundesland ------------------
   *
   * Gespielt wird auf den BUNDESLAENDERN und nicht auf den Kontinenten:
   * `loese()` schlaegt sein Ziel in `D.deutschland` nach - der Helfer ist
   * fuer diese eine Ebene geschrieben. Auf den Kontinenten stirbt er an
   * `b.anker` eines Gebiets, das dort nicht steht. Gefunden beim ersten
   * Lauf dieses Abschnitts, und es steht hier, damit es der naechste
   * nicht wieder herausfindet.
   *
   * Fuenfzehn von sechzehn sind sicher (Fach 5, also aus der Auswahl
   * heraus), das sechzehnte steht einen Schritt vor dem Aufkleber. Damit
   * ist die Sitzung deterministisch: es gibt genau einen Gegenstand, den
   * der Leitner noch waehlen kann. */
  const q = await neueSeite({ width: 844, height: 390 }, ctx);
  /* Offen bleibt BAYERN, nicht irgendeins.
     Der erste Anlauf liess das letzte Bundesland der Liste offen - das ist
     Berlin, mit 19 Punkten Trefferradius das kleinste Gebiet der Karte.
     Das Etikett landete daneben, die Antwort wurde nicht gewertet, und der
     Abschnitt scheiterte an der Zielgroesse statt an der Sache. Bayern
     hat 152. */
  const bisAufBayern = await q.evaluate(() => Object.fromEntries(
    JSON.parse(document.getElementById('daten').textContent).deutschland.map(b =>
      [b.id, b.id === 'DE-BY' ? { fach:2, faellig:0, hoch:2 }
                              : { fach:5, faellig:0, hoch:5 }])));
  await stelleAblage(q, {
    fortschritt: { 'fiona:bundeslaender': bisAufBayern },
    einstellungen: { alles: { vorlaufGezeigt: {
      'fiona:kontinente': true, 'fiona:bundeslaender': true } } },
  });
  await q.reload({ waitUntil: 'domcontentloaded' });
  await q.waitForSelector('[data-profil="fiona"]');
  await q.click('[data-profil="fiona"]');
  await zurEbenenwahl(q, 'bundeslaender');
  await q.click('[data-ebene="bundeslaender"]');
  await durchVorlaufWenn(q);
  await q.waitForSelector('.schirm.da .karte svg', { timeout: 25000 });
  await q.evaluate(() => { window.__gesagt = []; });
  for (let n = 0; n < 20; n++) {
    if (await q.$('.schirm.da .siegwahl')) break;
    if (!(await q.$('.schirm.da .karte svg'))) break;
    await loese(q);
    /* Zwischen zwei Aufgaben MUSS gewartet werden, bis das Lob weg ist.
       Ohne das landet der naechste Zug waehrend des Lobs, wird nicht
       gewertet, und jede zweite Antwort geht verloren - gemessen: sechs
       von elf Zuegen. `loese()` wartet nur auf das Lob, nicht darauf,
       dass es wieder verschwunden ist. */
    await weitergegangen(q);
  }
  await q.waitForSelector('.schirm.da .siegwahl', { timeout: 25000 });
  const ende = await q.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    return { neu: s.querySelector('.abzneu')?.textContent.replace(/\s+/g,' ').trim() || '',
             gesagt: (window.__gesagt || []).join(' | ') };
  });
  if (!/Neues Abzeichen: Du kennst alle sechzehn Bundesländer/.test(ende.neu))
    merke('abzeichen', new Error(
      `der Endbildschirm meldet kein neues Abzeichen, sondern „${ende.neu}"`));
  if (!/Neues Abzeichen/.test(ende.gesagt)) merke('abzeichen', new Error(
    'das neue Abzeichen wird hingeschrieben, aber nicht gesagt — für Fiona wäre es nicht da'));

  /* --- Und beim ZWEITEN Mal ist es kein neues mehr ------------------- */
  await q.click('#nochmal');
  await q.waitForSelector('.schirm.da .karte svg', { timeout: 25000 });
  for (let n = 0; n < 20; n++) {
    if (await q.$('.schirm.da .siegwahl')) break;
    if (!(await q.$('.schirm.da .karte svg'))) break;
    await loese(q);
    /* Zwischen zwei Aufgaben MUSS gewartet werden, bis das Lob weg ist.
       Ohne das landet der naechste Zug waehrend des Lobs, wird nicht
       gewertet, und jede zweite Antwort geht verloren - gemessen: sechs
       von elf Zuegen. `loese()` wartet nur auf das Lob, nicht darauf,
       dass es wieder verschwunden ist. */
    await weitergegangen(q);
  }
  await q.waitForSelector('.schirm.da .siegwahl', { timeout: 25000 });
  if (await q.$('.schirm.da .abzneu')) merke('abzeichen', new Error(
    'der Endbildschirm meldet dasselbe Abzeichen ein zweites Mal als neu'));

  /* --- Im Buch steht es jetzt, samt „ohne Fehler" -------------------- */
  await q.click('#buch');
  await q.waitForSelector('.schirm.da .abzeichen', { timeout: 25000 });
  const buch = await q.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    return { da: [...s.querySelectorAll('.abz.da')].map(x => x.textContent.replace(/\s+/g,' ').trim()),
             offen: s.querySelectorAll('.abz.offen').length,
             bilder: [...s.querySelectorAll('.abz svg')].filter(x => x.children.length).length,
             knoepfe: s.querySelectorAll('button.abz').length };
  });
  if (!buch.da.some(t => /alle sechzehn Bundesländer/.test(t))) merke('abzeichen', new Error(
    `im Buch fehlt das verdiente Abzeichen — dort steht ${JSON.stringify(buch.da)}`));
  if (!buch.da.some(t => /ohne Fehler/.test(t))) merke('abzeichen', new Error(
    'eine Runde ohne einen Fehlversuch bringt kein Abzeichen — '
    + `im Buch steht ${JSON.stringify(buch.da)}`));
  /* HOECHSTENS DREI offene, seit G15b - und die Zahl ist die Zusage.
   *
   * Bis v361 stand hier „genau eines". Das war richtig, solange das Buch
   * EINE rollende Seite war und jede Zeile mit den Aufkleberreihen um
   * denselben Platz stritt. Seit Q44 haben die Abzeichen ein eigenes
   * Kapitel, und das nutzte gemessen 18 % seiner Hoehe - den
   * schlechtesten Wert aller sieben Seiten.
   *
   * Die Obergrenze bleibt, nur hoeher: „sechzig leere Kaesten" ist die
   * Lehre, die dieser Bildschirm schon einmal teuer bezahlt hat. Ohne
   * Grenze waere aus dem naechsten Schritt wieder eine Mangelliste. */
  if (buch.offen > 3) merke('abzeichen', new Error(
    `${buch.offen} offene Abzeichen im Buch — es sollen höchstens drei sein`));
  if (buch.offen === 0) merke('abzeichen', new Error(
    'kein einziges offenes Abzeichen im Buch — dann ist der nächste Schritt unsichtbar'));
  if (buch.bilder !== buch.knoepfe) merke('abzeichen', new Error(
    `${buch.knoepfe - buch.bilder} Abzeichen stehen ohne Bild da`));

  /* --- D2b: das Nachbarn-Abzeichen, und wer es NICHT bekommt ---------
   *
   * Der Satz aus dem ANTON-Abgleich, seit D2c erreichbar: Deutschlands
   * neun Nachbarn stehen in Europa auf den Raengen 4 bis 12.
   *
   * Und genau deshalb braucht es die Gegenrichtung im selben Abschnitt:
   * Fiona spielt Europa nur bis Rang 3. Fuer sie waere das Abzeichen ein
   * Ziel, das ewig offen steht - `umfeld.erreichbar` haelt es zurueck.
   * Ohne diese zweite Haelfte pruefte der Abschnitt nur, DASS es
   * erscheint, und nicht, dass es beim Falschen ausbleibt.
   */
  const buchVon = async (wer, staende) => {
    const r = await neueSeite({ width: 844, height: 390 }, ctx);
    await stelleAblage(r, {
      fortschritt: Object.fromEntries(Object.entries(staende).map(([schluessel, ids]) =>
        [`${wer}:${schluessel}`, Object.fromEntries(ids.map(id =>
          [id, { fach:4, hoechstes:4, faellig:0 }]))])),
      einstellungen: { alles: { vorlaufGezeigt:
        Object.fromEntries(Object.keys(staende).map(k => [`${wer}:${k}`, true])) } },
    });
    await r.reload({ waitUntil: 'domcontentloaded' });
    await r.waitForSelector(`[data-profil="${wer}"]`);
    await r.click(`[data-profil="${wer}"]`);
    await zurEbenenwahl(r, 'bundeslaender');
    await r.click('#buch');
    await r.waitForSelector('.schirm.da .rollen', { timeout: 25000 });
    const aus = await r.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      return { da: [...s.querySelectorAll('.abz.da')].map(x => x.textContent.replace(/\s+/g,' ').trim()),
               offen: [...s.querySelectorAll('.abz.offen')].map(x => x.textContent.replace(/\s+/g,' ').trim()) };
    });
    await r.close();
    return aus;
  };
  // Alle sechzehn Bundeslaender (damit es ueberhaupt ein verdientes gibt,
  // neben dem das offene stehen darf) und acht der neun Nachbarn.
  const NACHBARN = ['FRA','POL','NLD','BEL','CZE','AUT','CHE','DNK','LUX'];
  const alleBL = STAEDTE.map(b => b.id);
  const beiLea = await buchVon('lea',
    { bundeslaender: alleBL, 'laender:europa': NACHBARN.slice(0, 8) });
  if (!/alle Nachbarn von Deutschland/.test(beiLea.offen.join(' ')))
    merke('abzeichen', new Error('bei Lea fehlt das Nachbarn-Abzeichen — offen steht '
      + JSON.stringify(beiLea.offen)));
  if (!/fehlt noch eins/.test(beiLea.offen.join(' ')))
    merke('abzeichen', new Error('acht von neun Nachbarn, aber die Zahl daneben sagt '
      + `nicht „fehlt noch eins": ${JSON.stringify(beiLea.offen)}`));
  /* Fiona: dieselbe Lage, nur mit Tiefe 3. Ihre drei erreichbaren Laender
     sind gesammelt - und trotzdem darf das Abzeichen nicht auftauchen.

     Ihre Kontinente sind hier ALLE gesammelt, und das ist kein Beiwerk:
     im Buch steht genau EIN offenes Abzeichen, naemlich das mit den
     wenigsten fehlenden Stuecken, bei Gleichstand das erste der Tafel.
     Der erste Anlauf liess ihre Kontinente offen - „alle Kontinente"
     fehlten dann sechs, den Nachbarn ebenfalls sechs, und die Tafel
     entschied fuer die Kontinente. Die Probe „ein unerreichbares
     Abzeichen wird angeboten" blieb gruen und hat es gemeldet: der
     Abschnitt konnte den Fall gar nicht sehen. Der zweite Anlauf fuellte
     die Kontinente - dann gewann „alle Verdopplungen" mit fuenf
     fehlenden. Also alles, was sie ueberhaupt sammeln kann: Kontinente,
     Bundeslaender, Landeshauptstaedte, Rechnen, Buchstaben. Dann ist das
     Nachbarn-Abzeichen das einzige, das noch offen sein KANN - und wenn
     es trotzdem nicht dasteht, dann weil die Regel es haelt. */
  const beiFionaEU = await buchVon('fiona',
    { bundeslaender: alleBL, kontinente: KONTINENTE.map(k => k.id),
      hauptstaedte: STAEDTE.filter(b => !b.stadtstaat).map(b => b.id),
      'rechnen:plusminus': Rechnen.vorrat().map(x => x.id),
      'schreiben:buchstaben': Schreiben.vorrat().map(x => x.id),
      'laender:europa': ['RUS','DEU','GBR'] });
  if (/Nachbarn von Deutschland/.test((beiFionaEU.da.join(' ') + beiFionaEU.offen.join(' '))))
    merke('abzeichen', new Error('Fiona bekommt „alle Nachbarn von Deutschland" angeboten — '
      + 'sie spielt Europa nur bis Rang 3 und käme nie hin'));

  console.log(`  Abzeichen:                  Fiona ${beiFiona.da.length} verdient, 1 offen („${
    (beiFiona.offen[0] || '').replace(/\s+/g, ' ')}") · `
    + `nach der Runde ${buch.da.length} verdient, alle mit Bild`);
  console.log(`  Nachbarn-Abzeichen:         Lea „${
    (beiLea.offen[0] || '(keins)').replace(/\s+/g, ' ')}" · `
    + `Fiona bekommt es nicht (${beiFionaEU.da.length} verdient, offen: „${
      (beiFionaEU.offen[0] || '(keins)').replace(/\s+/g, ' ')}")`);
  await p.close(); await q.close();
} catch (e) { merke('abzeichen', e); }

if (laeuft('sprechen')) try {
  const p = await neueSeite({ width: 844, height: 390 }, ctx);

  /* Welche Stimme die App von allein waehlt (M4s).
   *
   * Geprueft an einer ERFUNDENEN Stimmenliste, nicht an der des Rechners:
   * hier stehen ein, zwei deutsche Stimmen, auf einem iPhone ein Dutzend,
   * und genau dort ist der Fehler passiert - die App griff nach „Sandy"
   * und „Shelley", zwei von Apples Spass-Stimmen aus iOS 17. Gemeldet
   * wurde „eine sehr wirre, komische Stimme".
   *
   * Die Liste ist so gebaut, dass die falsche Wahl die BEQUEME waere: die
   * Spass-Stimmen stehen vorn, Anna hinten. Wer die Sperre entfernt,
   * bekommt sofort Sandy. */
  {
    const wahl = await p.evaluate(() => {
      const v = (name, extra = {}) => ({ name, lang:'de-DE', localService:true,
                                         voiceURI:name, ...extra });
      const liste = [v('Sandy'), v('Shelley'), v('Grandpa'), v('Jester'),
                     v('Anna'), v('Anna (Premium)'), v('Markus')];
      return {
        allein:  stimmeWaehlen(liste, null)?.name,
        gewollt: stimmeWaehlen(liste, 'Shelley')?.name,
        nurSpass: stimmeWaehlen([v('Sandy'), v('Jester')], null)?.name,
      };
    });
    if (wahl.allein !== 'Anna (Premium)') merke('sprechen', new Error(
      `die App wählt von allein „${wahl.allein}" — erwartet war „Anna (Premium)": `
      + 'keine Spaß-Stimme, und unter gleichem Namen die bessere Fassung'));
    // Wer eine Spass-Stimme AUSSUCHT, bekommt sie. Die Sperre gilt der
    // automatischen Wahl, nicht dem Geschmack.
    if (wahl.gewollt !== 'Shelley') merke('sprechen', new Error(
      `eine ausdrücklich gewählte Stimme wird übergangen: „${wahl.gewollt}" statt „Shelley"`));
    // Und wenn es NUR Spass-Stimmen gibt, ist stumm die falsche Antwort.
    if (!wahl.nurSpass) merke('sprechen', new Error(
      'gibt es nur Spaß-Stimmen, wählt die App gar keine — dann liest niemand vor'));
    console.log(`  Stimme:                     von allein „${wahl.allein}", `
      + `gewählt „${wahl.gewollt}", im Notfall „${wahl.nurSpass}"`);
  }

  // Der Sprachmodus steht im Elternbereich. Hier wird er gesetzt, wo er
  // liegt - sonst kostet jede Prüfung vier Ziffern und drei Bildschirme.
  await stelleAblage(p, { einstellungen: { alles: { sprachmodus: true } } });
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-profil="fiona"]');
  await p.click('[data-profil="fiona"]');
  await zurEbenenwahl(p, 'kontinente');
  await p.click('[data-ebene="kontinente"]');
  await p.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel', { timeout: 25000 });
  await durchVorlaufWenn(p);
  await p.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });

  /* E2 - die englische Stimme.
   *
   * Ohne sie sagt die App „cat" mit einer deutschen Stimme, also „katt".
   * Das ist keine Kleinigkeit: die ganze Form „Hoeren und zeigen" haengt
   * daran, dass das gehoerte Wort das englische IST - und wer die falsche
   * Aussprache lernt, merkt es nicht.
   *
   * GEPRUEFT WIRD IN BEIDE RICHTUNGEN, und die zweite ist die, an der ich
   * mich sonst selbst betrogen haette:
   *   1. MIT englischer Stimme muss `sagenEn` sprechen, und zwar mit einer
   *      Kennung, die auf „en" beginnt - nicht auf „de".
   *   2. OHNE englische Stimme muss es SCHWEIGEN. Nicht deutsch sprechen.
   *      Ein Geraet ohne englische Stimme gibt es wirklich.
   * Ohne die erste Haelfte waere die Pruefung durch eine App zu erfuellen,
   * die nie etwas sagt; ohne die zweite durch eine, die immer deutsch
   * spricht.
   *
   * Aufgerufen wird `sagenEn` DIREKT und nicht ueber einen Bildschirm, und
   * das ist seit E3 kein Notbehelf mehr, sondern die Arbeitsteilung: hier
   * steht die STIMMENWAHL fuer sich, im Abschnitt `englisch` steht sie am
   * laufenden Bildschirm. Zwei Messstellen fuer zwei Aussagen - faellt die
   * Ebene aus, sagt diese hier trotzdem noch, ob die Wahl stimmt. */
  {
    const sagenLassen = async (stimmen) => p.evaluate(async (st) => {
      window.__stimmen = st;
      speechSynthesis.dispatchEvent(new Event('voiceschanged'));
      window.__gesagtWie = []; window.__gesagt = [];
      // eslint-disable-next-line no-undef
      sagenEn('cat');
      await new Promise(r => setTimeout(r, 50));
      return window.__gesagtWie;
    }, stimmen);

    const DE = { name: 'Anna', lang: 'de-DE', localService: true };
    const EN = { name: 'Daniel', lang: 'en-GB', localService: true };
    const mit = await sagenLassen([DE, EN]);
    const ohne = await sagenLassen([DE]);
    console.log(`  Englische Stimme (E2):      mit → ${mit.length ? mit[0].lang + ' / '
      + mit[0].stimme : 'nichts gesagt'} · ohne → `
      + `${ohne.length ? ohne[0].lang + ' / ' + ohne[0].stimme : 'geschwiegen'}`);
    if (!mit.length)
      merke('sprechen', new Error('mit englischer Stimme sagt die App gar nichts — '
        + 'dann kann die vierte Welt kein Wort vorsprechen'));
    else if (!/^en/i.test(mit[0].lang || ''))
      merke('sprechen', new Error(`das englische Wort wird als „${mit[0].lang}" `
        + `gesprochen — eine deutsche Stimme sagt „cat" wie „katt"`));
    else if (mit[0].stimme !== EN.name)
      merke('sprechen', new Error(`gesprochen hat „${mit[0].stimme}" statt der `
        + `englischen Stimme „${EN.name}"`));
    if (ohne.length)
      merke('sprechen', new Error(`ohne englische Stimme spricht die App trotzdem `
        + `(„${ohne[0].lang}") — lieber schweigen als falsch sprechen`));
  }

  /* G17 - die Antwort ist lauter als das Werkzeug.
   *
   * Der Befund: der satteste Punkt des Bildschirms war der Mikrofonknopf,
   * die Antwortknoepfe waren fast weiss. Gemessen als Farbabstand zum
   * Grund im OKLCH-Raum (Wurzel aus dL^2 + dC^2):
   *
   *              Fuellung                   Abstand   Flaeche
   *   Antwort    oklch(0.965 0.035 258)      0,049    10135 pt^2  x4
   *   Mikrofon   oklch(0.55  0.190 258)      0,488     3136 pt^2  x1
   *
   * WAS DIESE ZAHL NICHT KANN, und das gehoert dazu: multipliziert man
   * Abstand mit Flaeche, lagen die Antworten schon VORHER vorn (1986
   * gegen 1530). Die Summe ueber die Flaeche widerspricht dem Befund also
   * - und der Befund hat trotzdem recht, weil das Auge zuerst auf den
   * saettigsten FLECK geht und nicht auf das groesste Integral. Deshalb
   * prueft dieses Tor NICHT die Rangfolge (die haengt an einem Modell des
   * Sehens, das ich nicht habe), sondern haelt fest, was gebaut wurde:
   * den Abstand der Antwort. Eine Ratsche, kein Soll.
   *
   * Und die zweite Zusage, die beim Bauen fast gekippt waere: das
   * ABGELEHNTE Etikett darf nicht heller sein als ein ruhendes. Mit
   * `--primaer` auf 0,900 und `--abgelehnt` unveraendert auf 0,96 haette die
   * Ablehnung ausgesehen wie eine Hervorhebung. */
  {
    const farben = await p.evaluate(() => {
      const zerlegen = (c) => {
        const m = String(c).match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
        return m ? { L: +m[1], C: +m[2], h: +m[3] } : null;
      };
      const wurzel = getComputedStyle(document.documentElement);
      const marke = (n) => zerlegen(wurzel.getPropertyValue(n));
      const e = document.querySelector('.schirm.da .etikett');
      const m = document.querySelector('.schirm.da .mikro');
      return { antwort: e && zerlegen(getComputedStyle(e).backgroundColor),
        mikro: m && zerlegen(getComputedStyle(m).backgroundColor),
        grund: marke('--grund'), warnH: marke('--abgelehnt'), primaer: marke('--primaer') };
    });
    if (!farben.antwort || !farben.grund) {
      merke('sprechen', new Error('die Farben des Antwortknopfs sind nicht ablesbar — '
        + 'dann prüft diese Messung nichts'));
    } else {
      const abstand = (a, b) => Math.sqrt((a.L - b.L) ** 2 + (a.C - b.C) ** 2);
      const aA = abstand(farben.antwort, farben.grund);
      const aM = farben.mikro ? abstand(farben.mikro, farben.grund) : null;
      /* 0,11 statt der gemessenen 0,131: die Ratsche haelt die Sache, nicht
         die dritte Nachkommastelle. Faellt sie unter 0,11, ist die Antwort
         wieder auf dem Weg zurueck nach Fast-Weiss. */
      const G17_ABSTAND_MIN = 0.11;
      console.log(`  Antwort gegen Werkzeug:     Farbabstand zum Grund `
        + `${aA.toFixed(3)}${aM !== null ? ` · Mikrofon ${aM.toFixed(3)}` : ''} `
        + `(Ratsche ${G17_ABSTAND_MIN})`);
      if (aA < G17_ABSTAND_MIN)
        merke('sprechen', new Error(`der Antwortknopf steht nur ${aA.toFixed(3)} vom Grund `
          + `ab (verlangt ${G17_ABSTAND_MIN}) — dann ist die Antwort wieder blasser als `
          + `ihr Werkzeug`));
      if (farben.warnH && farben.primaer && farben.warnH.L > farben.primaer.L + 0.02)
        merke('sprechen', new Error(`das abgelehnte Etikett ist heller als ein ruhendes `
          + `(${farben.warnH.L} gegen ${farben.primaer.L}) — dann sieht die Ablehnung aus `
          + `wie eine Hervorhebung`));
    }
  }

  /* G16 - die Werkzeugspalte ist eine SPALTE, in jedem Format.
   *
   * Das Grafik-Audit nannte sie „eine Schublade, keine Spalte". Gemessen
   * war das nie, und auf dem Zielgeraet stimmte es auch nicht: dort stand
   * sie sauber auf einer Achse. Auf dem Schreibtisch nicht -
   *
   *   Fenster     Reihen  Achsen   Kasten
   *   844x390        5      1      133 x 272
   *   1400x900       3      5      300 x 140
   *   700x850        2      5      668 x  84
   *
   * - weil `flex-direction:column` nur in der Telefonregel stand. Fuenf
   * Achsen sind fuenf verschiedene Mitten in willkuerlich umgebrochenen
   * Gruppen.
   *
   * GEMESSEN WIRD DIE MITTE, nicht die Regel. Eine Prüfung auf
   * „`flex-direction` steht auf `column`" bezeugte den Stil und nicht das
   * Bild; sie bliebe gruen, wenn ein Kind der Spalte per `position` oder
   * `order` daneben rutscht. Die Mitte kann nur stimmen, wenn es wirklich
   * untereinander steht.
   *
   * Und die zweite Haelfte: gleiche Rolle, gleiche Breite. Die beiden
   * leisen Auswege waren 133 und 122 breit - so breit wie ihr Wort.
   *
   * NICHT geprueft wird das HOCHFORMAT - dort ist es mit Absicht eine
   * Reihe, weil die Spalte 308 statt 84 Punkte hoch waere und die
   * Antworten vom Bildschirm schoebe (`passt`: 104 Punkte). Seine Zahlen
   * stehen trotzdem im Bericht.
   *
   * NICHT geprueft wird auch, ob alle sechs Elemente gleich AUSSEHEN. Zwei der
   * drei „Gestaltungssprachen" aus dem Audit sind aeltere, begruendete
   * Entscheidungen: die Auswege sind mit Absicht keine Knoepfe (Q15), und
   * `#weise` traegt mit Absicht kein Zeichen (Q34, weil es die Haelfte der
   * Zeit falsch waere). Ein Tor, das die durchbricht, waere kein Tor,
   * sondern eine zweite Meinung. */
  {
    const spalte = () => p.evaluate(() => {
      const w = document.querySelector('.schirm.da .werkzeug');
      if (!w) return null;
      const wk = w.getBoundingClientRect();
      const kinder = [...w.children].map(e => {
        const k = e.getBoundingClientRect();
        return { was: e.className || e.id, mitte: Math.round(k.x + k.width / 2 - wk.x),
          b: Math.round(k.width), leise: e.classList.contains('leise') };
      }).filter(k => k.b > 0);
      return { b: Math.round(wk.width), h: Math.round(wk.height), kinder };
    });
    const zeilen = [];
    /* `spalte:false` fuer das Hochformat, und das ist kein Schlupfloch,
       sondern der gemessene Grund: dort steht die Werkzeugspalte UNTER
       den Antworten, und als Spalte nimmt sie ihnen 224 Punkte weg -
       `passt` meldete „Afrika" 104 Punkte ueber dem Rand der
       Antwortliste. Die Zahlen des Hochformats stehen trotzdem in der
       Zeile: ein Wert, der niemandem auffaellt, wenn er sich aendert,
       ist kein Wert. */
    for (const gr of [{ width: 844, height: 390, spalte: true },
                      { width: 1400, height: 900, spalte: true },
                      { width: 700, height: 850, spalte: false }]) {
      await p.setViewportSize(gr);
      await new Promise(r => setTimeout(r, 300));
      const d = await spalte();
      if (!d || d.kinder.length < 3) {
        merke('sprechen', new Error(`Werkzeugspalte auf ${gr.width}x${gr.height} nicht `
          + `gefunden oder fast leer — dann prüft diese Messung nichts`));
        continue;
      }
      /* Zwei Punkte Spiel: eine ungerade Breite teilt sich nicht ohne
         Rest, und ein Zeichen mit halbem Bildpunkt verschiebt die Mitte
         um einen. Drei waeren schon eine sichtbare Stufe. */
      const mitten = [...new Set(d.kinder.map(k => k.mitte))];
      const achsen = mitten.filter((m, i) => mitten.slice(0, i).every(v => Math.abs(v - m) > 2));
      const leise = d.kinder.filter(k => k.leise).map(k => k.b);
      zeilen.push(`${gr.width}x${gr.height}${gr.spalte ? '' : ' (hoch, Reihe)'}: `
        + `${d.b}x${d.h}, ${achsen.length} Achse(n)`
        + (leise.length ? `, leise ${leise.join('/')}` : ''));
      if (!gr.spalte) continue;
      if (achsen.length > 1)
        merke('sprechen', new Error(`die Werkzeugspalte steht auf ${gr.width}x${gr.height} auf `
          + `${achsen.length} Achsen (Mitten ${mitten.join(', ')}) — das ist eine Schublade, `
          + `keine Spalte`));
      if (leise.length > 1 && Math.max(...leise) - Math.min(...leise) > 2)
        merke('sprechen', new Error(`die beiden leisen Auswege sind auf `
          + `${gr.width}x${gr.height} verschieden breit (${leise.join(' und ')}) — `
          + `gleiche Rolle, gleiche Breite`));
    }
    console.log(`  Werkzeugspalte (G16):       ${zeilen.join(' · ')}`);
    await p.setViewportSize({ width: 844, height: 390 });
    await new Promise(r => setTimeout(r, 300));
  }

  /* Und derselbe Weg fuer STEPHAN (A4).
   *
   * Sprechen war bis dahin Fionas Weg, weil sie nicht schreibt. Seit A4
   * ist es eine Option fuer jeden: „Wie heisst dieses Land?" mit
   * siebzehn Laendern im Vorrat sind siebzehn getippte Namen. Geprueft
   * wird, dass das Mikrofon bei ihm wirklich erscheint UND dass das
   * Schreibfeld daneben stehen bleibt - es soll niemandem etwas
   * weggenommen werden, nur etwas dazukommen. */
  {
    const q = await neueSeite({ width: 844, height: 390 }, ctx);
    await q.click('[data-profil="stephan"]');
    await zurEbenenwahl(q, 'laender:europa');
    await q.click('[data-ebene="laender:europa"]');
    await q.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel', { timeout: 25000 });
    await durchVorlaufWenn(q);
    await q.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });
    const da = await q.evaluate(() => ({
      mikro: !!document.querySelector('.schirm.da #mikro'),
      feld: !!document.querySelector('.schirm.da .eingabe'),
    }));
    if (!da.mikro) merke('sprechen', new Error('Stephan bekommt bei eingeschaltetem '
      + 'Sprachmodus kein Mikrofon — dann muss er jedes Land tippen'));
    if (!da.feld) merke('sprechen', new Error('Stephans Schreibfeld ist weg, seit er '
      + 'sprechen darf — die Spracheingabe ist eine Option und kein Ersatz'));
    await q.close();
  }

  /* „Noch einmal hoeren" (A4) - und wer ihn NICHT bekommt.
   *
   * Fiona liest nicht: Aufgabe und Moeglichkeiten kommen nur als Ton, und
   * wer beim ersten Mal ueberhoert wurde, hatte bis A4 keinen Weg zurueck.
   * Lea liest (`vorlesen: false`) und bekommt deshalb keinen - ein Knopf,
   * der ihr nichts vorliest, waere ein Knopf, der schweigt.
   *
   * Geprueft wird BEIDES, denn nur zusammen ist es eine Aussage: dass er
   * da ist, wo er hingehoert, und dass er nicht ueberall steht.
   *
   * GILT NUR AUF DEUTSCH. Auf der Englischebene bekommt Lea ihn sehr wohl:
   * dort wiederholt er nicht eine Vorlesehilfe, sondern die FRAGE. Diese
   * Haelfte steht im Abschnitt `englisch`. */
  {
    const fk = await p.$('.schirm.da #nochhoeren');
    if (!fk) merke('sprechen', new Error('Fiona hat keinen Knopf „noch einmal hören" — '
      + 'wer die Aufgabe überhört hat, kommt nicht mehr an sie heran'));
    else {
      const gesagt = await p.evaluate(() => window.__gesagt?.length || 0);
      await fk.click();
      await p.waitForFunction((v) => (window.__gesagt?.length || 0) > v, gesagt,
        { timeout: 4000 }).catch(() => {});
      const nachher = await p.evaluate(() => window.__gesagt?.length || 0);
      if (nachher <= gesagt) merke('sprechen', new Error('der Knopf „noch einmal hören" '
        + 'sagt nichts — er sieht aus wie eine Hilfe und ist keine'));
    }
    const q = await neueSeite({ width: 844, height: 390 }, ctx);
    await q.click('[data-profil="lea"]');
    await zurEbenenwahl(q, 'kontinente');
    await q.click('[data-ebene="kontinente"]');
    await q.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel', { timeout: 25000 });
    await durchVorlaufWenn(q);
    await q.waitForSelector('.schirm.da .karte svg path.ziel', { timeout: 15000 });
    /* Ein Ausbleiben - siehe oben. Der Knopf darf auch nicht NACHTRAEGLICH
       auftauchen; worauf hier zu warten waere, gibt es nicht. */
    await q.ausbleiben(700);
    if (await q.$('.schirm.da #nochhoeren'))
      merke('sprechen', new Error('Lea bekommt „noch einmal hören", obwohl ihr nichts '
        + 'vorgelesen wird — der Knopf hängt nicht am Profil'));
    await q.close();
  }

  const mikro = await p.$('.schirm.da #mikro');
  if (!mikro) {
    merke('sprechen', new Error('bei eingeschaltetem Sprachmodus steht kein Mikrofon '
      + 'auf dem Spielbildschirm — dann ist Fionas zweiter Eingabeweg gar nicht da'));
  } else {
    const zustand = () => p.evaluate(() => ({
      hoert: !!document.querySelector('.schirm.da #mikro.hoert'),
      satz: document.querySelector('.schirm.da #sprachstand')?.textContent.trim() || '',
      erk: window.__erk,
    }));

    /* 1. Antippen: es geht los, man SIEHT es - und die App SCHWEIGT.
     *
     * Der Lautsprecher ist kein Beiwerk: die Aufgabe wird angesagt, das
     * Kind tippt waehrenddessen auf das Mikrofon, und die Erkennung
     * bekommt die Stimme der App ins Ohr statt die des Kindes. Gemessen
     * wird beides - dass das Laufende abgeschnitten wird (`cancel`) und
     * dass danach nichts Neues mehr kommt. */
    const vorher = await p.evaluate(() => ({
      gesagt: window.__gesagt.length, abgebrochen: window.__abgebrochen }));
    await p.click('.schirm.da #mikro');
    const beimHoeren = await p.evaluate(() => ({
      gesagt: window.__gesagt.length, abgebrochen: window.__abgebrochen }));
    if (beimHoeren.abgebrochen === vorher.abgebrochen)
      merke('sprechen', new Error('beim Anschalten des Mikrofons wird die laufende Ansage '
        + 'nicht abgeschnitten — das Mikrofon hört den eigenen Lautsprecher mit'));
    /* Und waehrend des Zuhoerens darf nichts NEUES kommen.
     *
     * Gebraucht wird ein Ausloeser, der sonst sicher Ton macht: ein Etikett
     * auf das falsche Gebiet ziehen. Das gibt normalerweise einen Klang und
     * einen gesprochenen Hinweis - waehrend des Zuhoerens muss beides
     * ausbleiben. Ohne diesen zweiten Teil bezeugte die Pruefung nur, dass
     * einmal abgeschnitten wurde, nicht dass danach Ruhe ist. */
    const zielDaneben = await p.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const ziel = s.querySelector('path.ziel');
      const D = JSON.parse(document.getElementById('daten').textContent);
      const fremd = D.kontinente.find(k => k.id !== ziel.dataset.id && k.anker);
      const svg = s.querySelector('.karte svg');
      const pt = svg.createSVGPoint(); pt.x = fremd.anker[0]; pt.y = fremd.anker[1];
      const q = pt.matrixTransform(svg.getScreenCTM());
      const namen = [...s.querySelectorAll('.etikett')].map(e => e.textContent);
      const eigen = D.kontinente.find(k => k.id === ziel.dataset.id);
      return { x: q.x, y: q.y, idx: namen.indexOf(eigen.name) };
    });
    if (zielDaneben.idx >= 0) {
      const et = (await p.$$('.schirm.da .etikett'))[zielDaneben.idx];
      const bb = await et.boundingBox();
      await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await p.mouse.down();
      await p.mouse.move(zielDaneben.x, zielDaneben.y, { steps: 8 });
      await p.mouse.up();
      // Auch hier ein Ausbleiben: die Zusage ist, dass NICHTS gesagt wird.
      await p.ausbleiben(200);
      const dabei = await p.evaluate(() => ({
        gesagt: window.__gesagt.length, toene: window.__toene.length }));
      if (dabei.gesagt > beimHoeren.gesagt)
        merke('sprechen', new Error(`während des Zuhörens hat die App `
          + `„${(await p.evaluate(() => window.__gesagt[window.__gesagt.length-1]))}" gesagt `
          + '— das Mikrofon hört den eigenen Lautsprecher mit'));
      if (dabei.toene > 0)
        merke('sprechen', new Error(`während des Zuhörens hat die App ${dabei.toene} `
          + 'Töne gespielt — dasselbe Problem, nur ohne Worte'));
    }
    let z = await zustand();
    if (!z.hoert)
      merke('sprechen', new Error('nach dem Antippen sieht man dem Mikrofon nicht an, '
        + 'dass zugehört wird — der Ring atmete vorher immer, auch wenn nichts lief'));
    if (z.erk.gestartet !== 1)
      merke('sprechen', new Error(`${z.erk.gestartet} Erkenner gestartet statt einem`));
    if (!/höre/.test(z.satz))
      merke('sprechen', new Error(`beim Zuhören steht „${z.satz}" da`));

    // 2. NOCH EINMAL antippen: das ist „fertig". Genau das fehlte.
    await p.click('.schirm.da #mikro');
    z = await zustand();
    if (z.erk.gestoppt !== 1)
      merke('sprechen', new Error('ein zweiter Tipp auf das Mikrofon beendet das Zuhören '
        + 'nicht — man kommt aus dem Modus nicht mehr heraus. Genau das war der Befund'));
    if (z.hoert)
      merke('sprechen', new Error('nach dem Beenden atmet der Ring weiter — '
        + 'die App sieht aus, als hörte sie zu, während sie es nicht tut'));
    if (/… ich höre/.test(z.satz))
      merke('sprechen', new Error(`nach dem Beenden steht immer noch „${z.satz}" da`));

    // 3. Das Betriebssystem beendet von selbst, ohne Ergebnis. Auf iOS ist
    //    das der Normalfall bei Stille - und vorher blieb die Zeile stehen.
    await p.click('.schirm.da #mikro');
    const vonSelbst = await p.evaluate(() => window.__endeVonSelbst());
    z = await zustand();
    if (!vonSelbst)
      merke('sprechen', new Error('der zweite Anlauf hat gar nicht erst zugehört — '
        + 'ein zweiter Erkenner neben dem ersten'));
    if (z.hoert || /… ich höre/.test(z.satz))
      merke('sprechen', new Error(`endet die Erkennung ohne Ergebnis, bleibt „${z.satz}" `
        + 'stehen — ein Zustand, aus dem es keinen Ausgang gibt'));

    /* 4. Was ankommt, ist ein SATZ - und drei Lesarten davon.
     *
     * Der Befund vom Zielgeraet: gesprochen, verstanden, und trotzdem
     * „sag es noch einmal". Die Erkennung liefert „Das ist Asien", der
     * Abgleich bekam einen Namen erwartet und fiel an seiner Laengenstrafe
     * durch. Hier stand vorher nur das nackte Wort - der Rauchtest hat den
     * Fall also nie gesehen.
     *
     * Drei Dinge nacheinander, ohne die Aufgabe zu wechseln:
     *   a) ein Kauderwelsch: es darf KEINEN Versuch kosten und muss
     *      nennen, was angekommen ist
     *   b) ein ganzer Satz: muss gewertet werden
     *   c) nur die ZWEITE Lesart stimmt: muss auch gewertet werden
     */
    /* 3b) Ein Zwischenergebnis, dann bricht die Erkennung ab.
     *
     * Auf dem Telefon der Normalfall: das Kind spricht, die Erkennung
     * schickt Zwischenergebnisse, und bei der ersten Stille endet sie -
     * ohne Endergebnis. Das Zwischenergebnis war der volle Satz und wurde
     * weggeworfen; das Kind wurde gebeten, noch einmal zu sagen, was es
     * gerade gesagt hatte. */
    const nameZ = await p.evaluate(() => {
      const z = document.querySelector('.schirm.da path.ziel');
      if (!z) return null;
      const D = JSON.parse(document.getElementById('daten').textContent);
      return (D.kontinente.find(x => x.id === z.dataset.id) || {}).name || null;
    });
    let gerettet = 'übersprungen';
    if (nameZ) {
      await p.click('.schirm.da #mikro');
      await p.evaluate((n) => window.__sprich(n, false), nameZ);
      await p.evaluate(() => window.__endeVonSelbst());
      const ok = await bis(p,
        () => !!document.querySelector('.schirm.da .frage .richtigText'), 6000);
      if (!ok)
        merke('sprechen', new Error(`„${nameZ}" kam als Zwischenergebnis an, dann brach die `
          + 'Erkennung ab — und es wurde weggeworfen. Auf dem Telefon ist das der Normalfall '
          + 'bei Stille; das Kind soll noch einmal sagen, was es gerade gesagt hat'));
      else { gerettet = 'Zwischenergebnis gerettet';
        await bis(p, () => !document.querySelector('.schirm.da .frage .richtigText'), 8000); }
    }

    /* Der Name der JETZT offenen Aufgabe.
     *
     * Er wird hier gelesen und nicht weiter oben: 3b beantwortet eine
     * Aufgabe, danach steht eine andere da. Der Rauchtest sprach sonst den
     * Namen der vorigen Aufgabe in die neue und meldete „nichts gewertet",
     * obwohl die App richtig lag - eine Probe, die ihre eigene Reihenfolge
     * nicht kennt, misst die falsche Aufgabe. */
    const name = await p.evaluate(() => {
      const z = document.querySelector('.schirm.da path.ziel');
      if (!z) return null;
      const D = JSON.parse(document.getElementById('daten').textContent);
      return (D.kontinente.find(x => x.id === z.dataset.id) || {}).name || null;
    });

    // a) Dreimal Kauderwelsch. Vorher loeste die App danach die Aufgabe auf:
    //    drei Verstaendnisfehler zaehlten wie drei falsche Antworten.
    const KAUDERWELSCH = ['ratzefummel', 'schnurpsel', 'kladderadatsch'];
    const satzJetzt = () => p.evaluate(() =>
      document.querySelector('.schirm.da .frage')?.textContent || '');
    for (const k of KAUDERWELSCH) {
      /* Gewartet wird darauf, dass die Aeusserung ANGEKOMMEN ist - der
         Satz auf dem Bildschirm ist danach ein anderer -, nicht auf 120 ms
         (Q42). Nicht darauf, dass er das Wort NENNT: genau das wird gleich
         geprueft, und ein Warten darauf waere die Pruefung selbst. */
      const vorher = await satzJetzt();
      await p.click('.schirm.da #mikro');
      await p.evaluate((w) => window.__sprich(w, true), k);
      await bis(p, (v) => (document.querySelector('.schirm.da .frage')?.textContent || '') !== v,
        6000, vorher);
    }
    /* Der ZAEHLER zuerst, dann der Satz - in dieser Reihenfolge, und das
     * ist kein Geschmack.
     *
     * Wer den Ausstieg herausnimmt, laesst die Aeusserung in die normale
     * Wertung laufen; die schreibt ihren eigenen Satz ueber den guten.
     * Beide Pruefungen schlagen dann an, und mit `--sofort` gewinnt die
     * erste. Stuende der Satz vorn, bezeugte die Gegenprobe fuer den
     * Zaehler den Satz - und niemand haette je gemessen, ob der Zaehler
     * gehalten wird. */
    const nachKauderwelsch = await zustand();
    /* Gesucht wird die MARKE DER AUFLOESUNG, nicht die des Treffers.
     *
     * Hier stand `.richtigText` und `path.ziel` - beides bleibt beim
     * Aufloesen stehen, die Pruefung konnte also gar nicht anschlagen.
     * Gemerkt hat es die Gegenprobe: sie stellte den Fehler her, der
     * Rauchtest wurde rot, aber an einer anderen Stelle. Eine Pruefung,
     * die ihren eigenen Gegenstand nicht sieht, ist kein Beweis. */
    const nochOffen = await p.evaluate(() =>
      !document.querySelector('.schirm.da .frage .loesung')
      && !document.querySelector('.schirm.da .frage .richtigText'));
    if (!nochOffen)
      merke('sprechen', new Error('drei nicht verstandene Äußerungen haben die Aufgabe '
        + 'aufgelöst — nicht verstanden ist kein Fehlversuch, das Kind hat nicht ein '
        + 'einziges Mal falsch geraten'));
    if (!nachKauderwelsch.satz.includes(KAUDERWELSCH[2]))
      merke('sprechen', new Error(`nach „${KAUDERWELSCH[2]}" steht „${nachKauderwelsch.satz}" da `
        + '— die Meldung nennt nicht, was angekommen ist. Dann sieht niemand, ob das '
        + 'Mikrofon nichts gehört hat oder der Abgleich nichts zuordnen konnte'));

    /* b) Der ganze Satz - der gemeldete Fall.
     *
     * NICHT „Das ist X": genau diese Wendung stand in der alten
     * Fuellwortliste und kam auch vorher schon durch. Die Gegenprobe hat
     * das gemeldet - sie stellte den alten Zustand her, und der Rauchtest
     * blieb gruen. Eine Pruefung, die der Fehler passieren kann, prueft
     * ihn nicht (Regel 1).
     *
     * „Ich glaube das ist X" faellt durch die alte Liste: sie streicht
     * genau EIN Fuellwort am Anfang, und danach steht immer noch „das ist
     * X" da. */
    const SATZ = (n) => `Ich glaube das ist ${n}`;
    await p.click('.schirm.da #mikro');
    await p.evaluate((t) => window.__sprich(t, false), SATZ(name));
    const zwischen = (await zustand()).satz;
    await p.evaluate((t) => window.__sprich(t, true), SATZ(name) + '.');
    const gewertet = await bis(p,
      () => !!document.querySelector('.schirm.da .frage .richtigText'), 6000);
    if (!gewertet)
      merke('sprechen', new Error(`„${SATZ(name)}." gesprochen und nichts gewertet — `
        + `auf dem Bildschirm steht „${(await zustand()).satz}". Genau das war der Befund`));

    // c) Die zweite Lesart. Neue Aufgabe abwarten, sonst ist `erledigt` gesetzt.
    let zweite = 'übersprungen';
    if (gewertet) {
      const name2 = await naechsteAufgabe(p);
      if (name2) {
        await p.click('.schirm.da #mikro');
        await p.evaluate((n) => window.__sprich(['Anna Lena', n, 'Banane'], true), name2);
        const auchGewertet = await bis(p,
          () => !!document.querySelector('.schirm.da .frage .richtigText'), 6000);
        if (!auchGewertet)
          merke('sprechen', new Error(`„${name2}" stand als zweite Lesart da und wurde nicht `
            + 'gewertet — die Erkennung liefert drei, gelesen wird nur die erste'));
        else zweite = `„${name2}" als zweite Lesart`;
      }
    }
    /* d) DIE RUECKFRAGE - und ob man sie beantworten kann.
     *
     * Gesucht wird eine Aussprache, die SICHER im Rueckfrage-Band landet:
     * Abstand groesser als GRENZE_NAH. Darunter haengt das Urteil an der
     * Zahl der Mitbewerber - auf dem Schirm stehen vier Kontinente, im
     * Vorrat sechs -, und die Probe pruefte mal das eine, mal das andere.
     * Gefunden wird sie hier, nicht abgeschrieben: das Tor rechnet mit
     * demselben Modul wie die App und weiss deshalb, dass sein Eingriff
     * ankommt (Regel 3). */
    let rueck = 'übersprungen';
    if (gewertet) {
      const name3 = await naechsteAufgabe(p);
      const satz = KONTINENTE.map(k => ({ id:k.id, name:k.name,
        aliasse:k.aliasse, aussprache:k.aussprache }));
      const ziel3 = satz.find(k => k.name === name3);
      /* Genuschelt wird auf vier Arten, weil EINE nicht reicht: bei
       * „Südamerika" genügt Kürzen, bei „Afrika" nicht - dort liegt jede
       * gekürzte Form entweder noch im sicheren Bereich oder schon
       * ausserhalb. Gesucht wird deshalb über eine kleine Familie von
       * Verhaspelungen, und genommen wird die erste, die WIRKLICH im Band
       * liegt (Abstand > GRENZE_NAH, also unabhängig davon, wie viele
       * Mitbewerber gerade auf dem Schirm stehen). */
      let genuschelt = null;
      if (ziel3) {
        const wort = name3.split(' ')[0], kandidaten = [];
        for (let n = 1; n < wort.length - 1; n++) kandidaten.push(wort.slice(0, -n));
        for (let i = 1; i < wort.length; i++) kandidaten.push(wort.slice(0,i) + wort.slice(i+1));
        for (let i = 0; i < wort.length - 1; i++)
          kandidaten.push(wort.slice(0,i) + wort[i+1] + wort[i] + wort.slice(i+2));
        genuschelt = kandidaten.find(f => {
          const r = hoerAbgleich([f], satz);
          return r.art === 'rueckfrage' && r.id === ziel3.id && r.abstand > GRENZE_NAH;
        }) || null;
      }
      if (!genuschelt) {
        merke('sprechen', new Error(`für „${name3}" ließ sich keine Aussprache im `
          + 'Rückfrage-Band finden — die Prüfung hätte nichts geprüft'));
      } else {
        await p.click('.schirm.da #mikro');
        await p.evaluate((w) => window.__sprich(w, true), genuschelt);
        const gefragt = await bis(p, () => !!document.querySelector('.schirm.da #jaSicher'), 4000);
        if (!gefragt)
          merke('sprechen', new Error(`„${genuschelt}" statt „${name3}" gesagt und keine `
            + 'Rückfrage bekommen — dann endet eine unsichere Erkennung wieder als Urteil '
            + 'über das Kind'));
        else {
          // „Nein" kostet nichts: die Aufgabe muss offen bleiben.
          await p.click('.schirm.da #neinNochmal');
          const offenDanach = await p.evaluate(() =>
            !document.querySelector('.schirm.da .frage .loesung')
            && !document.querySelector('.schirm.da .frage .richtigText')
            && !document.querySelector('.schirm.da #nachfrage'));
          if (!offenDanach)
            merke('sprechen', new Error('nach „Nein" ist die Aufgabe nicht mehr offen — '
              + 'die Rückfrage hat einen Versuch gekostet, obwohl das Gerät unsicher war'));
          // Und „Ja" wertet, was das Kind bestätigt hat.
          await p.click('.schirm.da #mikro');
          await p.evaluate((w) => window.__sprich(w, true), genuschelt);
          await bis(p, () => !!document.querySelector('.schirm.da #jaSicher'), 4000);
          await p.click('.schirm.da #jaSicher');
          const bestaetigt = await bis(p,
            () => !!document.querySelector('.schirm.da .frage .richtigText'), 6000);
          if (!bestaetigt)
            merke('sprechen', new Error(`„Ja" auf „Meintest du ${name3}?" hat nichts `
              + 'gewertet — dann ist die Rückfrage eine Sackgasse mit zwei Knöpfen'));
          else rueck = `„${genuschelt}" → Rückfrage, Nein folgenlos, Ja gewertet`;
        }
      }
    }

    if (gewertet) console.log(`  Sprechen:                   an, beendet, ohne Ergebnis beendet, `
      + `3× nicht verstanden ohne Versuch, „${SATZ(name)}." gewertet `
      + `(zwischendurch: „${zwischen}"), ${zweite}, ${rueck}, ${gerettet}`);
  }

  /* --- Die Sprechprobe im Elternbereich (M4r) ------------------------
   *
   * Sie beantwortet eine Frage, die dieser Test NICHT beantworten kann:
   * springt das Mikrofon auf einem echten iPhone an? Der Nachbau sagt
   * immer ja. Geprueft wird deshalb nur, dass das WERKZEUG etwas
   * aufzeichnet - und zwar UNTERSCHEIDET.
   *
   * Das ist der ganze Punkt: eine Anzeige, die nach jedem Versuch
   * dasselbe sagt, waere schlimmer als keine. Zwei Versuche also, und
   * sie muessen sich unterscheiden - einer mit Wort, einer ohne. */
  {
    const q = await neueSeite({ width: 1180, height: 820 }, ctx);
    await q.click('[data-profil="fiona"]');
    await q.waitForSelector('.schirm.da #eltern');
    await q.click('.schirm.da #eltern');
    await q.waitForSelector('.schirm.da .ziffern');
    for (let i = 0; i < 4; i++) await q.click('.schirm.da [data-z="0"]');
    const da = await q.waitForSelector('.schirm.da #probe', { timeout: 10000 })
      .then(() => true).catch(() => false);
    if (!da) merke('sprechen', new Error(
      'im Elternbereich gibt es keine Sprechprobe — dann bleibt M4r eine halbe '
      + 'Stunde mit dem Gerät in der Hand und ohne Zahlen'));
    else {
      const lies = () => q.evaluate(() => Object.fromEntries(
        [...document.querySelectorAll('.schirm.da [data-probe]')]
          .map(e => [e.dataset.probe, +e.textContent.trim()])));
      // 1. Ein Versuch MIT Wort.
      await q.click('.schirm.da #probe');
      await bis(q, () => !!window.__erk && !!window.__erk.laeuft, 3000);
      await q.evaluate(() => window.__sprich('Europa', true));
      await bis(q, () => +document.querySelector('[data-probe="versuche"]')?.textContent === 1, 4000);
      const eins = await lies();
      // 2. Ein Versuch OHNE: das Betriebssystem beendet ihn von selbst.
      await q.click('.schirm.da #probe');
      await bis(q, () => !!window.__erk && !!window.__erk.laeuft, 3000);
      await q.evaluate(() => window.__endeVonSelbst());
      await bis(q, () => +document.querySelector('[data-probe="versuche"]')?.textContent === 2, 4000);
      const zwei = await lies();
      if (!(eins.versuche === 1 && eins.wort === 1 && eins.mikrofon === 1))
        merke('sprechen', new Error(`die Sprechprobe zählt nach einem verstandenen Wort `
          + `${JSON.stringify(eins)} — erwartet ein Versuch mit Mikrofon und Wort`));
      if (!(zwei.versuche === 2 && zwei.wort === 1))
        merke('sprechen', new Error(`nach einem zweiten Versuch OHNE Wort zählt sie `
          + `${JSON.stringify(zwei)} — sie unterscheidet nicht, ob etwas ankam`));
      const spur = await q.$eval('.schirm.da #probelauf', e => e.textContent).catch(() => '');
      if (!/ende/.test(spur)) merke('sprechen', new Error(
        `die Sprechprobe zeigt keine Ereignisfolge („${spur.slice(0, 60)}") — `
        + 'dann steht dort nur, DASS etwas war, und nicht was'));
      else console.log(`  Sprechprobe (M4r):          2 Versuche gezählt, `
        + `1 mit Wort · Spur: ${spur.replace(/^Letzter Versuch: /, '').slice(0, 70)}`);
    }
    await q.close();
  }
  await p.close();
} catch (e) { merke('sprechen', e); }

/* --- Englisch: „Hoeren und zeigen" (E3) -------------------------------
 *
 * Die Ebene hat EINE Zusage, und alles andere haengt daran: die Frage ist
 * der Ton. Ein Kind, das sie nicht hoert, sieht vier Farbflecken ohne
 * Frage - und das sieht auf einem Bildschirmfoto aus wie eine fertige
 * Aufgabe. Genau dafuer taugt ein Foto hier nicht.
 *
 * Gemessen wird deshalb in BEIDE Richtungen, und die zweite ist die, ohne
 * die die erste nichts wert waere (Regel 1 - wer eine Wirkung misst,
 * schaltet sie zuerst ab):
 *
 *   MIT englischer Stimme   das Wort wird gesagt, auf `en`, mit der
 *                           englischen Stimme - und es steht NIRGENDS
 *                           geschrieben. Stuende es da, pruefte die
 *                           Aufgabe Lesen und nicht Hoeren.
 *   OHNE englische Stimme   es wird geschwiegen (E2) - und dann steht es
 *                           geschrieben da. Sonst waere die Ebene stumm
 *                           und leer.
 *
 * Gespielt wird als LEA und nicht als Fiona. Lea traegt `vorlesen: false`,
 * ist also das Profil, an dem sich ein „ansagen" statt „vorlesen" verraet
 * - bei Fiona liefe beides und die Messung saehe nichts.
 */
if (laeuft('englisch')) try {
  const p = await neueSeite({ width: 844, height: 390 }, ctx);
  await p.waitForSelector('[data-profil="lea"]', { timeout: 20000 });
  await p.click('[data-profil="lea"]');

  // Die vierte Welt muss ueberhaupt dastehen. Gewartet wird auf die
  // Weltenwahl, nicht auf eine Frist: ohne das las der erste Lauf eine
  // leere Liste und meldete „die englische Welt fehlt", obwohl sie da war.
  await p.waitForSelector('.schirm.da [data-welt]', { timeout: 20000 });
  const welten = await p.$$eval('.schirm.da [data-welt]', ns => ns.map(n => n.dataset.welt));
  if (!welten.includes('englisch'))
    merke('englisch', new Error(`die Weltenwahl zeigt ${welten.join(', ')} — `
      + 'die englische Welt fehlt, dann ist die Ebene nicht zu erreichen'));

  await zurEbenenwahl(p, 'englisch:hoeren');
  await p.click('[data-ebene="englisch:hoeren"]');
  await durchVorlaufWenn(p);
  await p.waitForSelector('.schirm.da .engkarte', { timeout: 20000 });

  const lage = async () => p.evaluate(() => {
    const s = document.querySelector('.schirm.da');
    const karten = [...s.querySelectorAll('.engkarte')];
    return {
      wort: Sitzung?.liste[Sitzung.i]?.wort || '',
      ziel: Sitzung?.liste[Sitzung.i]?.id || '',
      sorten: karten.map(k => k.dataset.id.split(':')[1]),
      ids: karten.map(k => k.dataset.id),
      text: s.textContent,
      hoerknopf: !!s.querySelector('#nochhoeren'),
      /* Die Fuellung des Flecks, wie der Browser sie WIRKLICH zeichnet -
         samt der Deckung des Kastens darueber. `opacity` faerbt um, ohne
         `background-color` anzufassen, und genau daran waere die Messung
         vorbeigelaufen. */
      flecken: karten.map(k => {
        const f = k.querySelector('.farbfleck');
        if (!f) return null;
        const st = getComputedStyle(f);
        return { farbe: st.backgroundColor,
                 deckung: +getComputedStyle(k).opacity * +st.opacity };
      }),
    };
  });

  {
    const l = await lage();
    const gesagt = await p.evaluate(() => window.__gesagtWie.slice(-1)[0] || null);

    // 1. Die Frage kommt - und zwar englisch.
    if (!gesagt || gesagt.text !== l.wort)
      merke('englisch', new Error(`gefragt ist „${l.wort}", gesagt wurde `
        + `„${gesagt ? gesagt.text : 'nichts'}" — Lea bekommt vier Bilder ohne Frage`));
    else if (!/^en/i.test(gesagt.lang || ''))
      merke('englisch', new Error(`„${l.wort}" wird als „${gesagt.lang}" gesprochen — `
        + 'eine deutsche Stimme übt die falsche Aussprache ein'));

    // 2. Vier Moeglichkeiten, eine richtig, alle aus derselben Sorte.
    if (l.ids.length !== 4)
      merke('englisch', new Error(`${l.ids.length} Möglichkeiten statt vier`));
    if (new Set(l.ids).size !== l.ids.length)
      merke('englisch', new Error('dieselbe Möglichkeit steht zweimal da'));
    if (!l.ids.includes(l.ziel))
      merke('englisch', new Error('die richtige Antwort steht gar nicht dabei'));
    if (new Set(l.sorten).size !== 1)
      merke('englisch', new Error(`die vier Möglichkeiten mischen ${
        [...new Set(l.sorten)].join(' und ')} — dann ist die Aufgabe ohne ein Wort `
        + 'Englisch zu lösen'));

    // 3. Das Wort steht NIRGENDS. Sonst ist es eine Leseaufgabe.
    if (new RegExp(`\\b${l.wort}\\b`, 'i').test(l.text))
      merke('englisch', new Error(`das gesuchte Wort „${l.wort}" steht auf dem `
        + 'Bildschirm — dann prüft die Aufgabe Lesen statt Hören'));

    // 4. Und Lea bekommt „noch einmal hören", obwohl ihr nichts vorgelesen wird.
    if (!l.hoerknopf)
      merke('englisch', new Error('Lea hat auf der Englischebene keinen Knopf '
        + '„noch einmal hören" — hier ist er keine Vorlesehilfe, sondern die Frage'));

    console.log(`  Englisch (E3):              „${l.wort}" als ${gesagt?.lang} / `
      + `${gesagt?.stimme} · ${l.ids.length} Möglichkeiten, alle „${l.sorten[0]}" · `
      + `Wort steht nicht da`);

    /* 5. Die Farben ueberleben die Antwort.
     *
     * Der Befund, um den es geht, ist am Bild aufgefallen und nicht
     * gerechnet: das Verblassen aus G18 nahm den Flecken die Farbe, und
     * nach der Antwort war Gruen ein Mintton. Auf einer Farbebene ist die
     * Deckung kein neutrales Mittel - sie AENDERT die Antwort.
     *
     * Gemessen wird die wirksame Deckung des Flecks, vorher und nachher.
     * Nicht seine `background-color`: die bleibt gleich, waehrend der
     * Kasten darueber sie wegblendet. Genau dieser Unterschied ist der
     * Fehler. */
    const vorher = (await lage()).flecken;
    await p.click(`.schirm.da .engkarte[data-id="${l.ziel}"]`);
    await p.waitForFunction(() => !!document.querySelector('.schirm.da .engkarte.stimmt'),
      null, { timeout: 4000 }).catch(() => {});
    const nachher = (await lage()).flecken;
    if (vorher.some(x => x) && vorher.length === nachher.length) {
      const blass = nachher.filter((n, i) => n && vorher[i] && n.deckung < vorher[i].deckung - 0.01);
      if (blass.length)
        merke('englisch', new Error(`${blass.length} von ${nachher.length} Farbflecken `
          + `verblassen nach der Antwort (auf ${blass[0].deckung.toFixed(2)}) — `
          + 'ein Fleck mit halber Deckung ist eine andere Farbe, und das Kind '
          + 'lernt die falsche'));
      else console.log(`  Farbe bleibt Farbe:         ${nachher.length} Flecken, `
        + `Deckung ${nachher.map(x => x.deckung.toFixed(2)).join(' ')} — unverändert`);
    }
    // Und die richtige Antwort ist auch als solche zu sehen.
    if (!(await p.$('.schirm.da .engkarte.stimmt')))
      merke('englisch', new Error('nach der richtigen Antwort ist keine Karte '
        + 'hervorgehoben — für ein Kind, das nicht liest, ist der Lobsatz nichts'));
  }

  /* Die Gegenrichtung: KEINE englische Stimme.
   *
   * Ohne diese Haelfte waere alles oben von einer App zu erfuellen, die das
   * Wort einfach immer hinschreibt und nie etwas sagt. Geprueft wird an
   * einer NEUEN Seite: die Stimmenliste wird vor dem Laden gesetzt, sonst
   * hat `stimmeSuchen()` sie laengst gelesen. */
  {
    /* `neueSeite` und nicht `ctx.newPage()`: der ganze Nachbau von
       `speechSynthesis` haengt dort. Der erste Anlauf ging daran vorbei -
       dann gibt es weder `__gesagtWie` noch ueberhaupt eine deutsche
       Stimme, und die Messung haette „nichts gesagt" gemeldet, ohne je
       eine englische Stimme entfernt zu haben. */
    const q = await neueSeite({ width: 844, height: 390 }, ctx);
    await q.evaluate(() => {
      window.__stimmen = [{ name: 'Anna', lang: 'de-DE', localService: true }];
      speechSynthesis.dispatchEvent(new Event('voiceschanged'));
      window.__gesagtWie = []; window.__gesagt = [];
    });
    await q.waitForSelector('[data-profil="lea"]', { timeout: 20000 });
    await q.click('[data-profil="lea"]');
    await zurEbenenwahl(q, 'englisch:hoeren');
    await q.click('[data-ebene="englisch:hoeren"]');
    await durchVorlaufWenn(q);
    await q.waitForSelector('.schirm.da .engkarte', { timeout: 20000 });
    const l = await q.evaluate(() => ({
      wort: Sitzung?.liste[Sitzung.i]?.wort || '',
      text: document.querySelector('.schirm.da').textContent,
      hoerknopf: !!document.querySelector('.schirm.da #nochhoeren'),
      gesagt: window.__gesagtWie.filter(x => /^en/i.test(x.lang || '')).length,
    }));
    if (l.gesagt)
      merke('englisch', new Error('ohne englische Stimme spricht die App trotzdem '
        + 'englisch — lieber schweigen als falsch sprechen'));
    if (!new RegExp(`\\b${l.wort}\\b`, 'i').test(l.text))
      merke('englisch', new Error(`ohne englische Stimme steht „${l.wort}" nirgends — `
        + 'dann sind es vier Bilder ohne Frage, und die Ebene ist unspielbar'));
    if (l.hoerknopf)
      merke('englisch', new Error('ohne englische Stimme steht „noch einmal hören" da — '
        + 'ein Knopf, der schweigt, ist schlimmer als keiner'));
    console.log(`  Ohne englische Stimme:      geschwiegen, „${l.wort}" steht `
      + `geschrieben da, kein Hörknopf`);
    await q.close();
  }
  await p.close();
} catch (e) { merke('englisch', e); }

await ctx.close(); await b.close(); server.close();

/* Die Bilanz des Wartens - und die Ratsche darauf (Q42).
 *
 * Bis v343 standen hier 3,4 s in dreizehn festen Pausen, und die Zahl war
 * nur Auskunft: sie stand da, wuchs, und niemand wurde davon rot. Jetzt
 * ist sie NULL, und das ist erzwungen. Wer wieder `waitForTimeout` ruft,
 * macht den Rauchtest rot und liest im selben Satz, was er stattdessen tun
 * kann: auf die Sache warten (`bis`, `bisHier`, `nachFertig`), oder, wenn
 * es die Sache gar nicht gibt, `ausbleiben` bzw. `messtakt` nehmen und
 * damit sagen, WARUM hier eine Frist steht.
 *
 * Die beiden bleiben Auskunft und werden nicht geratscht: eine Frist, die
 * ein Ausbleiben misst, ist kein Mangel, sondern die Messung. Sichtbar
 * muss sie trotzdem sein - sonst waechst sie im Dunkeln. */
if (blind.n) {
  console.log(`  Blind gewartet:             ${(blind.ms/1000).toFixed(1)} s in ${blind.n} festen Pausen`);
  fehler.push(`${blind.n} feste Pausen (${(blind.ms/1000).toFixed(1)} s) im Rauchtest — `
    + `\`waitForTimeout\` wartet, egal ob das Erwartete schon da ist: auf dem schnellen `
    + `Rechner verschenkt, auf dem langsamen zu kurz. Auf die Sache warten (\`bis\`, `
    + `\`bisHier\`, \`nachFertig\`) — und wenn es die Sache nicht gibt, \`p.ausbleiben(ms)\` `
    + `oder \`p.messtakt(ms)\` nehmen, damit im Bericht steht, warum hier eine Frist steht`);
} else console.log(`  Blind gewartet:             keine feste Pause`);
if (ausbleiben.n) console.log(`  Auf ein Ausbleiben:         ${(ausbleiben.ms/1000).toFixed(1)} s in `
  + `${ausbleiben.n} Fristen — dort gibt es nichts, worauf zu warten waere`);
if (messtakt.n) console.log(`  Messtakt:                   ${(messtakt.ms/1000).toFixed(1)} s in `
  + `${messtakt.n} Schritten — Abtastung innerhalb einer Zeitmessung`);
/* Die Nachsicht steht im Bericht.
 *
 * Sonst ist nicht zu sehen, ob die Kette gerade sauber lief oder ob sie
 * dreimal am Rand entlanggeschrammt ist - und genau der Unterschied ist
 * die Vorwarnung, dass die Maschine oder die Beckenbreite nicht mehr
 * passt. */
if (TAKT.n) console.log(`  Maschine war langsam:       ${TAKT.n}× nachgefasst, `
  + `Rechenzeit bis ${TAKT.hoechster.toFixed(1)}× der Norm `
  + `(${TAKT.norm.toFixed(0)} ms für die Eichschleife zu Beginn)`);
/* Die Zahl steht MIT im Bericht, nicht nur der Befund.
 *
 * „Kein Fremdgriff gefunden" heisst zweierlei: alles sitzt, oder die
 * Pruefung kam nie zum Zug. Ohne die Zahl sind beide nicht zu
 * unterscheiden - eine Pruefung, die nie etwas meldet, beweist nichts
 * (Regel 1), und dieses Verzeichnis hatte den Fall dreimal. Bei null
 * geprueften Bildschirmen ist das deshalb ein FEHLER, kein Hinweis. */
console.log(`  Fremdgriff geprüft:         ${griffStand.geprueft} ruhende Bildschirme (`
  + `${Object.entries(griffStand.arten).map(([k, v]) => `${v}× ${k}`).join(', ') || 'keine'})`
  + `, ${griffStand.uebersprungen} in Bewegung übersprungen`);
if (griffStand.einmal.size)
  console.log(`  … einmal gesehen, nicht bestätigt: ${[...griffStand.einmal].slice(0, 6).join(' · ')}`);
/* WO diese Frage gilt (Q39b).
 *
 * Sie zaehlt, was der Lauf gesehen hat - und wurde bis hierher auch dann
 * gestellt, wenn der Lauf gar nicht der ganze war. `--nur=streu` kommt an
 * keinem ruhenden Bildschirm vorbei, also war `smoke` dort rot, auf jeder
 * Maschine. Zehn stehende Gegenproben, die einen Abschnitt einzeln fahren,
 * haben deshalb aufgehoert zu beweisen; gemerkt hat es niemand, weil die
 * Torkette `smoke` in vier Teilen faehrt und jeder Teil grosse Abschnitte
 * enthaelt.
 *
 * GEMESSEN, je Abschnitt einzeln, 03.09.2026, dieser Rechner, vier Kerne
 * (`--nur=<name> --sofort --kurz`), ruhend · in Bewegung:
 *
 *   spielen  5·49   ablage 10·64   tippen  1·3    regler   1·2
 *   ebene4   0·0    durchgang 18·120  umgekehrt 6·49  test 31·67
 *   streu    0·0    abzeichen 12·52  pausen 10·18   schreiben 40·27
 *   hinweis  1·4    sprechen  8·21
 *
 * Zwei Abschnitte bringen die Pruefung nie zum Zug: `ebene4` und `streu`.
 * Sie stehen unten als Liste - kurz genug, um sie zu pflegen, und sie
 * meldet sich selbst, wenn sie veraltet (ein Abschnitt, der neu keine
 * ruhenden Bildschirme mehr liefert, macht seinen Ausschnitt rot).
 *
 * Und `hinweis` zeigt, warum eine Liste allein nicht reicht: EINS ist die
 * ganze Ausbeute, und auf dem Runner - sechs Arbeiter nebeneinander - war
 * es null. Ein Bildschirm ruht dort nie lange genug. Die Zusage haengt
 * also an der Last, sobald man sie je Ausschnitt stellt.
 *
 * Deshalb nach Herkunft des Ausschnitts:
 *   - VOLLER Lauf: harter Befund. 168 ruhende Bildschirme sind gemessen,
 *     null waere ein kaputter Beobachter.
 *   - `--teil=i/n`: harter Befund. Die Teile ZERLEGEN den vollen Lauf,
 *     jeder traegt seinen Anteil der Zusage - und in der Kette hat jeder
 *     der vier grosse Abschnitte darin (mindestens 12).
 *   - `--nur=...`: eine Zeile, kein Befund. Ein von Hand gewaehlter
 *     Ausschnitt sagt nichts darueber, ob der Fremdgriff im ganzen Lauf
 *     zum Zug kommt. */
/* KEINE Liste der stillen Abschnitte an dieser Stelle - sie waere wieder
 * lastabhaengig. `tippen`, `regler` und `hinweis` bringen je EINEN ruhenden
 * Bildschirm; auf dem Runner mit sechs Arbeitern nebeneinander ist es
 * null. Eine Regel „dieser Abschnitt muss einen bringen" waere also nicht
 * an der App gemessen, sondern an der Zahl der freien Kerne - genau der
 * Fehler, den Q37 gerade herausgenommen hat. Die Tafel oben ist eine
 * Messung mit Datum und Messstelle (Regel 5), keine Zusage. */
const nurAusschnitt = !!gewaehlt && !TEIL;
if (griffStand.geprueft === 0 && !nurAusschnitt)
  fehler.push('Der Fremdgriff hat keinen einzigen ruhenden Bildschirm gesehen — '
    + 'dann beweist „nichts gefunden" nichts (Regel 1)');
else if (griffStand.geprueft === 0)
  console.log('  … in diesem Ausschnitt kam der Fremdgriff nicht zum Zug — kein Befund, '
    + 'die Zusage trägt der volle Lauf und jeder `--teil`');
// Die AUFGABE ist der Grund, warum diese Prüfung hier zusätzlich läuft:
// `passt` steuert nur Wahlbildschirme an. Ohne sie prüft der Rauchtest
// nichts, was `passt` nicht schon prüfte.
else if (!griffStand.arten.aufgabe && laeuft('spielen'))
  fehler.push('Der Fremdgriff hat keinen einzigen Aufgabenbildschirm gesehen — '
    + 'genau die sind der Grund, warum er auch im Rauchtest läuft, und ohne sie '
    + 'beweist er hier nichts (Regel 1)');

if (laeuft('spielen')) {
console.log(`  Namen auf der Karte:        ${[...fahnenArten].join(' und ') || 'KEINE'}`
  + (umgebrochen.size ? `, ${umgebrochen.size} umgebrochen (${[...umgebrochen].join(', ')})` : ''));
// Der schwaechere der beiden Bildschirme, im schlimmsten Bild des Wechsels.
// 0,20 laesst den Rand der Ueberblendung zu und faengt das Doppelbild:
// blenden beide gleichzeitig, treffen sie sich bei etwa 0,5.
const UEBERBLENDUNG_MAX = 0.20;
console.log(`  Übergang zur nächsten:      zweiter Bildschirm höchstens `
  + `${ueberblendung === null ? '—' : ueberblendung < 0 ? 'NICHT GEMESSEN'
       : ueberblendung.toFixed(2)} sichtbar `
  + `(erlaubt ${UEBERBLENDUNG_MAX})`);
if (ueberblendung === null)
  fehler.push('Der Übergang wurde nicht gemessen — die Prüfung lief nicht');
else if (ueberblendung < 0)
  fehler.push('Der Übergang wurde nicht gemessen: in sechs Sekunden nach der Antwort '
    + 'standen nie zwei Bildschirme gleichzeitig da. Entweder wechselt die App nicht '
    + 'mehr, oder die Messung sitzt an der falschen Stelle — grün wäre hier eine Lüge');
else if (ueberblendung > UEBERBLENDUNG_MAX)
  fehler.push(`Beim Wechsel sind beide Bildschirme gleichzeitig zu sehen `
    + `(der schwächere bei ${ueberblendung.toFixed(2)}) — ein Doppelbild: `
    + 'die alte Antwort steht über der neuen Frage');
/* Dass die Entscheidung „innen oder daneben" wirklich gerechnet und nicht
 * fest eingestellt ist, prueft `inhalt` - dort, wo sie eine MESSSTELLE hat
 * (Karte 470 px breit, Befund G10). Hier stand dieselbe Forderung ohne
 * eine, und auf dem Zielgeraet ist sie nicht erfuellbar: bei 170 px
 * Kartenbreite passt kein einziger Landesname in sein Gebiet. Die
 * Forderung war nicht falsch, sie gehoerte nur woandershin (Regel 5).
 */
console.log(`  Gelöst im ersten Durchgang: ${geloest.join(', ')}`);
/* Und die Blindprobe unter der D3-Prüfung.
 *
 * Sie greift nur bei einem Gebiet, das einen Satz HAT - sonst gäbe es
 * nichts zu vergleichen. Genau das ist ihre Schwachstelle: verschwindet
 * die Satztabelle aus dem Bau, findet `satzZu` nirgends etwas, die
 * Prüfung springt kein einziges Mal an, und der Abschnitt bleibt grün.
 * Zwölf Aufgaben auf der Deutschlandkarte, sechzehn Bundesländer, alle
 * mit Satz - unter zwei Treffern stimmt etwas nicht (Regel 1). */
/* Die Bilanz der Kartenruhe - mit ihrer eigenen Blindprobe (Q45).
 *
 * Ohne sie waere „kein Sprung gefunden" auch dann wahr, wenn gar nicht
 * gemessen wurde: `kartenBild` gibt `null`, sobald kein Gebiet mehr eine
 * Breite hat, und dann zaehlt die Schleife still nichts. Zwoelf Aufgaben
 * werden gespielt; unter zwei Messungen beweist die Zeile darunter nichts
 * (Regel 1). */
if (kartenMessungen < 2)
  merke('spielen', new Error(`die Ruhe der Karte wurde bei ${kartenMessungen} von `
    + `${geloest.length} Aufgaben überhaupt gemessen — dann sagt „sie rückt nicht" nichts`));
else if (kartenSprung.length)
  merke('spielen', new Error(`die Karte rückt beim Lob weiter als erlaubt: bei `
    + `${kartenSprung.length} von ${kartenMessungen} Aufgaben (${kartenSprung.slice(0, 2)
      .join(' · ')}) — der freigehaltene Platz greift nicht, und sie springt genau dann, `
    + 'wenn das Kind auf die Form schaut, die es eben getroffen hat'));
else console.log(`  Karte beim Lob:             rückt höchstens 30 Punkte (${kartenMessungen} `
  + `Aufgaben an der gezeichneten Fläche${kartenMitKleber
    ? `, ${kartenMitKleber} mit neuem Aufkleber ausgenommen` : ''})`);
if (satzGesehen < 2)
  merke('spielen', new Error(`der Satz zum Mitnehmen wurde bei ${satzGesehen} von `
    + `${geloest.length} gelösten Aufgaben überhaupt geprüft — dann beweist „kein Befund" `
    + 'hier nichts: die Satztabelle kommt im Bau gar nicht an'));
else console.log(`  Satz zum Mitnehmen:         bei ${satzAngekommen} von ${satzGesehen} `
  + 'Treffern auf dem Bildschirm und gesprochen');
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
/* Und die Zusage aus K3, am ganzen Lauf gemessen (Q29).
 *
 * VOR der Auswertung, nicht dahinter. Der erste Anlauf stand unter der
 * Zeile, die den Lauf beendet - der Befund wurde also erhoben und nie
 * gelesen. Gemeldet hat das die Gegenprobe: sie baute einen Aufruf nach
 * draussen ein, und das Tor blieb gruen. Eine Pruefung, die nie etwas
 * meldet, ist kein Beweis (Regel 1) - hier war sie es aus dem
 * langweiligsten Grund, den es gibt: falsche Zeile. */
if (fremdeAufrufe.size)
  fehler.push(`${fremdeAufrufe.size} Aufrufe verlassen das Gerät, obwohl kein `
    + `Familienschlüssel gesetzt und kein Dienst eingerichtet ist: `
    + [...fremdeAufrufe].slice(0, 3).join(', '));
else
  console.log(`  Nichts verlässt das Gerät:  0 fremde Aufrufe im ganzen Lauf`);

if (fehler.length) { console.log(`\n  ${fehler.length} FEHLER:`); fehler.forEach(f => console.log('    ✗ ' + f)); process.exit(1); }
console.log('\n  Rauchtest grün: gespielt, abgelegt, Neustart überstanden, Buch gefüllt, Eltern gelesen, getippt.');
