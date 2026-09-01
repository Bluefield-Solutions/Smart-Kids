// Rauchtest. Spielt den Prototyp wirklich - und prueft, was M3 bis M6
// zugesagt haben: dass der Fortschritt einen Neustart ueberlebt, dass das
// Forscherbuch fuellt, dass der Elternbereich Zahlen zeigt.
import { istUmgekehrt, zeigeAufKarte, zielPunkt, starte, zurEbenenwahl,
         WELT_VON, durchVorlauf, serviere, schreibVorlage, zeichneZug,
         ausAblage, standVon, standGroesse, stelleAblage } from './chromium.mjs';
import * as Schreiben from '../src/inhalt/schreiben.js';
import * as Protokoll from '../src/protokoll/protokoll.js';
import { ELTERN_VERGLEICH } from './gestellt.mjs';
import { teilVon, meldeTeil } from './teilen.mjs';
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
/* Wie heissen die drei Profile?
 *
 * Aus derselben Tabelle wie die Tiefe, und aus demselben Grund: das
 * Erwartete darf nicht aus der Datei kommen, die eine Gegenprobe
 * anfasst (Regel 3). Steht in der Kopfzeile „Fiona (6)", zaehlt „Fiona". */
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
 * (Regel 3).
 *
 * Gelesen wird deshalb die Tabelle im Backlog - dieselbe Stelle, an der
 * der Nutzer die Zahl entschieden hat. Was daraus WIRKLICH auf dem
 * Bildschirm landet, sieht man nur hier: der teuerste denkbare Fehler
 * dieser Runde waere, dass die Raenge 6 bis 12 mitrutschen und vor einem
 * Sechsjaehrigen ploetzlich zwoelf Laender stehen.
 */
/* Wieviele Aufgaben hat eine Sitzung? Dieselbe Tabelle, Zeile „Aufgaben
 * je Sitzung".
 *
 * Gebraucht fuer den Vorlauf: bei einer Rechenebene zeigt er BEISPIELE,
 * nicht den Vorrat - und zwar so viele, wie gleich kommen. Der Vorrat ist
 * erzeugt (100, 140, 158); ihn zu zeigen hiesse, einer Sechsjaehrigen vor
 * ihrer ersten Sitzung 2,8 Bildschirme Einmaleins-Tafel hinzulegen. */
const BACKLOG = fs.readFileSync('docs/Lernkiste-BACKLOG.md', 'utf8');

/**
 * Eine Zeile der Profiltabelle als Zellen - oder nichts samt Fehler.
 *
 * `wozu` sagt, was ohne diese Zeile ungeprueft bliebe. Vorher stand dieser
 * Zehnzeiler dreimal da, einmal je Zeile; eine fehlende Zeile darf nicht
 * still zu einem leeren Soll werden, gegen das alles gruen ist.
 */
function backlogZeile(zeile, wozu){
  const z = BACKLOG.match(new RegExp(`^\\|\\s*${zeile}\\s*\\|(.+)\\|\\s*$`, 'm'));
  if (!z) { fehler.push(`Die Zeile „${zeile}" fehlt im Backlog — `
    + `dann prüft der Rauchtest ${wozu} gegen nichts`); return null; }
  return z[1].split('|');
}

/** Dieselbe Zeile als Zahl je Profil. */
function backlogZahlen(zeile, wozu){
  const zellen = backlogZeile(zeile, wozu);
  if (!zellen) return {};
  const n = zellen.map(t => +(t.match(/\d+/) || [])[0]).filter(Number.isFinite);
  return Object.fromEntries(PROFIL_IDS.map((id, i) => [id, n[i]]));
}

/* Die Kennungen der Profile - aus der KOPFZEILE der Tabelle, nicht aus
 * einer Liste hier.
 *
 * Vor N1 stand in vier Toren `['fiona','lea','eltern']`. Die vierte Spalte
 * (Violeta) haette sie alle still falsch gemacht: jede Zeile waere um eins
 * verrutscht, und Violetas Werte waeren als Stephans geprueft worden.
 * Eine Tabelle, die ihre eigenen Namen traegt, kann das nicht.
 *
 * Die Kennung ist das erste Wort der Spalte, klein: „Fiona (6)" -> `fiona`. */
const PROFIL_IDS = (() => {
  const z = BACKLOG.match(/^\|\s*\|\s*Fiona[^|]*\|.+\|\s*$/m);
  if (!z) { fehler.push('Die Kopfzeile der Profiltabelle fehlt im Backlog — '
    + 'dann weiß der Rauchtest nicht, welche Spalte wem gehört'); return []; }
  return z[0].split('|').slice(2, -1)
    .map(t => t.trim().split(/[\s(]/)[0].toLowerCase()).filter(Boolean);
})();

/** Der angezeigte Name je Kennung - „stephan" steht als „Stephan" da. */
const NAME_VON = Object.fromEntries(PROFIL_IDS.map(id =>
  [id, id.charAt(0).toUpperCase() + id.slice(1)]));

const SITZUNG = backlogZahlen('Aufgaben je Sitzung', 'den Vorlauf');

const TIEFE = backlogZahlen('Ländertiefe', 'die Tiefe');

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

const VORLESEN = (() => {
  const doc = fs.readFileSync('docs/Lernkiste-BACKLOG.md', 'utf8');
  const z = doc.match(/^\|\s*Vorlesen\s*\|(.+)\|\s*$/m);
  if (!z) { fehler.push('Die Zeile „Vorlesen" fehlt im Backlog — dann weiß der '
    + 'Rauchtest nicht, auf welche Ansage er warten darf'); return {}; }
  const ids = PROFIL_IDS;
  return Object.fromEntries(z[1].split('|').map((t, i) => [ids[i], /\bja\b/i.test(t)]));
})();

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
  const festWarten = p.waitForTimeout.bind(p);
  p.waitForTimeout = (ms) => { blind.ms += ms; blind.n++; return festWarten(ms); };
  p.on('pageerror', e => fehler.push(`Seitenfehler: ${String(e).slice(0, 140)}`));
  // Was gesprochen wird, mitschreiben statt es zu hoeren.
  //
  // Fiona liest noch nicht. Ob die App ihr die Aufgabe VORLIEST, ist damit
  // kein Schoenheitsmerkmal, sondern die Frage, ob sie das Spiel ueberhaupt
  // bedienen kann - und das laesst sich nur hier messen: `speechSynthesis`
  // gibt nichts zurueck, was man ansehen koennte.
  await p.addInitScript(() => {
    window.__gesagt = [];
    window.__abgebrochen = 0;
    speechSynthesis.speak = (u) => { if (u && u.text) window.__gesagt.push(u.text); };
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
              || s.querySelector('#nochmal'));
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
                    'pausen', 'schreiben', 'hinweis', 'sprechen'];
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
const STUECKE = [
  { teile: ['spielen', 'ablage'],   ms: 52 },
  { teile: ['schreiben'],           ms: 45 },
  { teile: ['durchgang:fiona'],     ms: 31 },
  { teile: ['test'],                ms: 31 },
  { teile: ['durchgang:stephan'],   ms: 18 },
  { teile: ['durchgang:lea'],       ms: 18 },
  { teile: ['durchgang:violeta'],   ms: 17 },
  { teile: ['abzeichen'],           ms: 18 },
  { teile: ['umgekehrt'],           ms: 13 },
  { teile: ['ebene4'],              ms: 11 },
  { teile: ['regler'],              ms: 10 },
  { teile: ['pausen'],              ms:  8 },
  { teile: ['tippen'],              ms:  5 },
  { teile: ['sprechen'],            ms:  2 },
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
const sternVerlauf = [], bandVerlauf = [];
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
  await p.waitForSelector('.schirm.da .aufkleber');
  await bis(p, () => (window.__gesagt || []).length > 0, 4000);
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
  // Gezaehlt wird am HOECHSTSTAND, so wie `istGesammelt` es tut. Mit dem
  // laufenden Fach zaehlte diese Zeile nach jeder falschen Antwort weniger
  // als das Buch zeigt - und meldete das Buch als Wand.
  const staende = await ausAblage(p, 'fortschritt');
  const wirklich = staende === -1 ? -1 : staende.reduce((n, st) =>
    n + Object.values(st || {}).filter(x => (x?.hoechstes ?? x?.fach ?? 1) >= 3).length, 0);
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
    const knopf = await p.$('.schirm.da [data-neu="bundeslaender"]');
    if (!knopf) merke('vonvorne', new Error(
      'nach zwei Sitzungen steht kein „von vorne" an den Bundesländern'));
    else {
      const erst = await knopf.textContent();
      await knopf.click();
      // Der Knopf fragt nach ODER ist weg (dann hat er sofort geloescht -
      // genau der Befund, den die Pruefung gleich meldet).
      await bis(p, () => { const k = document.querySelector('.schirm.da [data-neu="bundeslaender"]');
        return !k || /Wirklich/.test(k.textContent); }, 3000);
      // Der Knopf kann nach dem ersten Tipper VERSCHWUNDEN sein - naemlich
      // genau dann, wenn er schon geloescht hat. Das ist der Befund, nicht
      // ein Fehler im Test: der erste Anlauf stuerzte hier ab, statt ihn zu
      // melden, und die Gegenprobe schlug „aus einem anderen Grund" an.
      const zweiter = await p.$('.schirm.da [data-neu="bundeslaender"]');
      const nachfrage = zweiter ? (await zweiter.textContent()) : '(weg)';
      if (!/Wirklich/.test(nachfrage)) merke('vonvorne', new Error(
        `der erste Tipper löscht sofort — er fragt nicht nach (steht: „${nachfrage.trim()}")`));
      if (zweiter) await zweiter.click();
      // Ist wirklich geloescht, verschwindet der Knopf - es gibt dann
      // keinen Fortschritt mehr, den man zuruecksetzen koennte. Bleibt er
      // stehen, laeuft die Grenze ab und die Zaehlung unten meldet es.
      await bis(p, () => !document.querySelector('.schirm.da [data-neu="bundeslaender"]'), 4000);
      const rest = await standGroesse(p, 'fiona:bundeslaender');
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
    // (Regel 10).
    await loese(p); await loese(p);
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
    const zweiLaender = await q.evaluate(() => {
      const st = {};
      const D = JSON.parse(document.getElementById('daten').textContent);
      D.deutschland.slice(0, 2).forEach((x, i) => st[x.id] = { fach: i ? 3 : 5,
        hoechstes: i ? 3 : 5, faellig: 0, richtig: 3, falsch: 0, zuletzt: 0 });
      return st;
    });
    await stelleAblage(q, { fortschritt: { 'fiona:bundeslaender': zweiLaender } });
    await q.reload();
    await q.waitForSelector('[data-profil="fiona"]', { timeout: 15000 });
    await q.click('[data-profil="fiona"]');
    // Auf die Ebenenwahl, aber NICHT in die Ebene: genau der Weg, auf dem
    // die Umrisse noch nicht geholt sind.
    await zurEbenenwahl(q, 'bundeslaender');
    await q.click('#buch');
    await q.waitForSelector('.schirm.da .aufkleber');
    await bis(q, () => !!document.querySelector('.schirm.da .rollen'), 4000);
    const b = await q.evaluate(() => {
      const r = document.querySelector('.schirm.da .rollen');
      const karten = [...document.querySelectorAll('.schirm.da .aufkleber')];
      return { da: karten.length,
               // Ein Gebiet MUSS einen Umriss zeigen. Der Rechenkasten ist
               // die Notdarstellung, und sein Inhalt war hier „undefined".
               ohneUmriss: karten.filter(k => !k.querySelector('svg path')).length,
               undef: karten.filter(k => /undefined/.test(k.textContent)).length,
               sichtbar: Math.round(r.clientHeight), ganz: Math.round(r.scrollHeight) };
    });
    if (b.ohneUmriss)
      merke('forscherbuch', new Error(`${b.ohneUmriss} von ${b.da} Karten im Buch zeigen `
        + 'keinen Umriss — das Buch wurde geöffnet, bevor die Geometrie geladen war'));
    if (b.undef)
      merke('forscherbuch', new Error(`auf ${b.undef} Karten im Buch steht „undefined"`));
    console.log(`  Buch auf dem Zielgerät:     ${b.da} Karten mit Umriss, ${b.ganz} Punkte `
      + `Inhalt in ${b.sichtbar} sichtbaren`);
    // Die Grenze ist die Zahl der Karten, nicht eine Punktzahl: acht Karten
    // passen auf 844 x 390 in zwei Reihen, und so lange soll nichts unter
    // dem Rand stehen.
    if (b.da <= 8 && b.ganz > b.sichtbar + 2)
      merke('forscherbuch', new Error(`das Buch rollt schon bei ${b.da} Karten `
        + `(${b.ganz} Punkte Inhalt, ${b.sichtbar} sichtbar) — die Vorschau steht halb `
        + 'unter dem Rand'));
    if (b.da > 8)
      merke('forscherbuch', new Error(`${b.da} Karten im Buch — die Prüfung greift `
        + 'nicht mehr, sie prüft nur ein fast leeres Buch'));
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
    const q = await kalt.newPage();
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
      if (!zeichen) await q.waitForTimeout(60);
    }
    await q.waitForSelector('.schirm.da .aufkleber', { timeout: 30000 });
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
    await bis(q, () => !document.querySelector('.schirm.da .aufkleber'), 10000);
    await q.waitForTimeout(WARTEZEICHEN_LUFT);
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
  await stelleAblage(p, { einstellungen: { alles: { reihenGeteilt: 0.5 } } });
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

  /* Und der Schalter (A2): „Ton aus" heisst nicht „nur die Stimme aus".
   *
   * Regel 1 — wer eine Wirkung misst, schaltet sie zuerst ab. Ohne diesen
   * zweiten Durchgang haette die Gegenprobe „der Ton spielt auch bei
   * abgeschaltetem Ton" gar keinen Gegenstand: bei eingeschaltetem Ton
   * aendert das Entfernen der Sperre nichts, was zu sehen waere.
   */
  {
    await stelleAblage(p, { einstellungen: { alles: { reihenGeteilt: 0.5, ton: false } } });
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
     * oder er kommt nicht mehr. Das ist dieselbe Aussage wie vorher,
     * nur ohne Frist. */
    await bewertet(p);
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

/* Ruft das Lob jemanden an, der nicht angefeuert werden will?
 *
 * Das Lob steht in der Frage-Zeile, sobald gewertet ist - dieselbe Zeile,
 * aus der der Test schon liest, ob die Antwort ueberhaupt durchkam. Es
 * kostet also nichts extra, und es prueft die eine Eigenschaft, die den
 * Ton ausmacht. */
function lobPruefen(wer, ebene, satz, gesprochen) {
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
  const r = await p.evaluate(() => {
    const f = document.querySelector('.schirm.da .frage');
    return (f?.querySelector('.richtigText') ? '✓ ' : '') + (f?.textContent.trim() || '');
  });
  if (!/^✓ /.test(r || ''))
    merke('durchgang', new Error(`${wer}/${ebene}: ${wie} → „${r}"`));
  lobPruefen(wer, ebene, r, gesagt);
  durchgespielt++;
  await weitergegangen(p);
  await raus(p);
}

const EBENEN_EIGEN = { stephan: ['rechnen:gross', 'hauptstaedte:europa'],
                       violeta: ['rechnen:gross', 'hauptstaedte:europa'],
                       fiona: ['rechnen:plusminus',
                               // Die Schreibwelt gehoert nur ihr (N2a, N3).
                               // Ohne diese beiden prueft `durchgang` zwar,
                               // dass keine FREMDE Ebene dasteht, aber nicht,
                               // dass die eigenen ueberhaupt da sind.
                               'schreiben:buchstaben', 'schreiben:diktat',
                               'schreiben:ziffern', 'schreiben:zahlen'],
                       lea: ['rechnen:reihen', 'hauptstaedte:europa'] };
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
     * das Tor blieb grün, weil es die Ebene gar nicht aufschlug. */
    const zuSpielen = KURZ
      ? da.filter(e => e === 'kontinente' || e.startsWith('hauptstaedte')
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
        + '.schirm.da .schreibblatt, .schirm.da #weiter', { timeout: 15000 }).catch(() => {});
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
const EBENEN_JE = (wer) => gespielt[wer] ?? (EBENEN_ALLE.length + EBENEN_EIGEN[wer].length);
if (laeuft('durchgang')) {
console.log(`  Durchgespielt:              ${durchgespielt} Ebenen × Profile, jede richtige Antwort gewertet`);
console.log(`  Je Profil:                  `
  + Object.entries(durchgangZeit).map(([w, s]) => `${w} ${s} s`).join(' · '));
console.log(`  Antwortwege:                ${[...wege].sort().join(' · ') || 'KEINE'}`);
console.log(`  Profile hier:               ${PROFILE_HIER.join(' · ')}`);
console.log(`  Aufgaben vorgelesen:        Fiona ${gehoert.fiona||0} von ${EBENEN_JE('fiona')}, `
  + `Lea ${gehoert.lea||0} von ${EBENEN_JE('lea')}`);
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
  const LESEZEIT_MIN = 1200;    // was ein Kind zum Lesen braucht
  const KUERZER_UM   = 1.5;     // der Schalter muss mindestens so viel bringen

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
    // Von „das Lob steht da" bis „die naechste Aufgabe steht da".
    await p.waitForFunction(() => !!document.querySelector(
      '.schirm.da .frage .richtigText, .schirm.da .frage .fastText'), null, { timeout: 8000 });
    const t0 = Date.now();
    await p.waitForFunction(() => {
      const s = document.querySelector('.schirm.da');
      if (!s || s.querySelector('.frage .richtigText, .frage .fastText')) return false;
      return !!(s.querySelector('.karte svg path.ziel') || s.querySelector('.rechnung')
                || s.querySelector('#nochmal'));
    }, null, { timeout: 15000 });
    const dauer = Date.now() - t0;
    await p.close();
    return dauer;
  }

  for (const [was, ebene] of [['Karte', 'bundeslaender'], ['Rechnen', 'rechnen:plusminus']]) {
    const normal = await pauseMessen(ebene, false);
    const kurz   = await pauseMessen(ebene, true);
    console.log(`  Schaupause ${was.padEnd(8)}       ${normal} ms normal, ${kurz} ms mit `
      + `\`?flott\` (${(normal / Math.max(1, kurz)).toFixed(1)}×)`);
    if (normal < LESEZEIT_MIN)
      merke('pausen', new Error(`${was}: das Lob steht nur ${normal} ms — unter ${LESEZEIT_MIN} ms `
        + 'kann ein Kind es nicht lesen'));
    if (normal < kurz * KUERZER_UM)
      merke('pausen', new Error(`${was}: mit \`?flott\` ${kurz} ms, ohne ${normal} ms — `
        + `der Schalter kürzt diesen Weg nicht (erwartet mindestens ${KUERZER_UM}×). `
        + 'Genau so ist der Kartenweg an ihm vorbeigelaufen'));
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
    await p.waitForTimeout(250);
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
  await p.waitForTimeout(400);
  const buchstabenStand = await standVon(p, 'fiona:schreiben:buchstaben');
  const fach = buchstabenStand ? (buchstabenStand[`bu:${zeichen}`]?.fach ?? 0) : -1;
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
      await d.waitForTimeout(300);
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
          await z.waitForTimeout(400);
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
    await p.fill('.schirm.da .eingabe', 'Quatschhausen');
    await p.$eval('.schirm.da .wahlliste .knopf', x => x.click());
    await p.waitForTimeout(500);
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
      await p.waitForTimeout(1900);
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
      await p.waitForTimeout(600);
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
          await zur.click(); await p.waitForTimeout(400);
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
    await p.waitForTimeout(400);
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
    await r.waitForTimeout(250);
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
  if (beiFiona.offen.length !== 1) merke('abzeichen', new Error(
    `${beiFiona.offen.length} offene Abzeichen auf einmal — offen steht genau eines`));
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
  if (buch.offen > 1) merke('abzeichen', new Error(
    `${buch.offen} offene Abzeichen im Buch — es soll genau eines sein`));
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
   * da ist, wo er hingehoert, und dass er nicht ueberall steht. */
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
    await q.waitForTimeout(700);
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
      await p.waitForTimeout(200);
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
    for (const k of KAUDERWELSCH) {
      await p.click('.schirm.da #mikro');
      await p.evaluate((w) => window.__sprich(w, true), k);
      await p.waitForTimeout(120);
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

await ctx.close(); await b.close(); server.close();

console.log(`  Blind gewartet:             ${(blind.ms/1000).toFixed(1)} s in ${blind.n} festen Pausen`);

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
