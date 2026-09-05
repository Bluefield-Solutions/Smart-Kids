// Tor `ansicht` - visuelles Regressionstor.
//
// Kein Tor kann sagen, ob etwas schoen ist. Aber jedes Tor kann sagen, ob
// sich etwas VERAENDERT hat - und das ist bei Gestaltung fast dasselbe wert,
// weil Verfall dort schleichend passiert.
//
// Aufruf:
//   node tor/ansicht.mjs                  pruefen
//   node tor/ansicht.mjs --aktualisieren  Vorbilder erneuern (bewusst!)
//
// EHRLICH DAZU: Die Vorbilder entstehen in Chromium. Das Tor findet
// VERAENDERUNGEN, nicht iOS-Richtigkeit. Kein Tor laeuft je auf dem Geraet,
// auf dem geurteilt wird.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { starte, zurEbenenwahl, durchVorlauf, serviere, schriftDa, durchGruppe,
         schreibVorlage, zeichneZug, istUmgekehrt, zeigeAufKarte,
         zielUndEtikett } from './chromium.mjs';
import * as Schreiben from '../src/inhalt/schreiben.js';
import * as Protokoll from '../src/protokoll/protokoll.js';
import { ELTERN_VERGLEICH } from './gestellt.mjs';

// IndexedDB braucht eine echte Herkunft, sonst faellt die Ablage still auf
// nichts zurueck und der Prototyp startet jedesmal anders. Also derselbe
// winzige Server wie im Rauchtest -- und zwar WIRKLICH derselbe.
//
// Hier stand die siebte Abschrift, mit genau dem Fehler, den der Kommentar
// ueber `serviere` beschreibt: `q.url === '/' ? '/index.html' :
// q.url.split('?')[0]` liefert fuer `/?flott` den Pfad `/`, also ein
// Verzeichnis, also 404. Sechs Abschriften waren zusammengelegt worden,
// diese eine nicht -- und sie ist erst aufgefallen, als die Adresse zum
// ersten Mal eine Frage trug. Regel 6.
// Fotografiert wird dist/ - das, was ausgeliefert wird, samt eigener
// Schrift. Solange die Aufnahmen an prototyp/spiel.html hingen, hielten sie
// eine Fassung fest, die niemand bekommt.
const { server, adresse: SPIEL } = await serviere(path.join(process.cwd(), 'dist'));

// Dieses Tor laeuft NUR ORTSFEST, nicht auf dem Runner.
//
// Ein Bildpunktvergleich gilt nur bei gleicher Zeichenumgebung. Der Runner
// hat einen anderen Chromium-Bau, andere Ersatzschriften und andere
// Kantenglaettung; beim ersten Lauf dort waren alle sieben Aufnahmen rot,
// zwei davon mit GEAENDERTEN MASSEN - also anderem Umbruch, nicht nur
// anderen Bildpunkten. Das ist kein Befund ueber die App, sondern einer
// ueber die Maschine.
//
// Es wird ausdruecklich uebersprungen und laut gemeldet, nicht still: ein
// Tor, das sich unbemerkt ueberspringt, ist schlimmer als keines. Wer die
// Aufnahmen auf dem Runner haben will, muss die Umgebung festnageln - im
// Playwright-Abbild bauen UND die Vorbilder darin aufnehmen. Steht als
// offener Punkt im STAND.
if (process.env.SMARTKIDS_OHNE_ANSICHT === '1') {
  console.log('\n  Tor `ansicht`: ÜBERSPRUNGEN.');
  console.log('    Grund: Bildpunktvergleiche gelten nur bei gleicher Zeichenumgebung.');
  console.log('    Der Runner hat einen anderen Chromium-Bau und andere Ersatzschriften.');
  console.log('    Dieses Tor gehört an den Arbeitsplatz: `npm run ansicht`.');
  process.exit(0);
}

const VORBILDER = path.join(process.cwd(), 'tor/vorbilder');
const ABWEICHUNGEN = path.join(process.cwd(), 'tor/abweichungen');
const AKTUALISIEREN = process.argv.includes('--aktualisieren');
/* `--teil=i/n`: nur jede n-te Aufnahme, ab der i-ten.
 *
 * Der Bildvergleich war mit 42 s das langsamste Tor der schnellen Bahn -
 * und er ist das einzige, das sich trivial teilen laesst: sechzehn
 * Aufnahmen, die nichts voneinander wissen. Zwei Teile nebeneinander
 * halbieren ihn.
 *
 * Geteilt wird REIHUM (i, i+n, i+2n …) und nicht in Bloecke: die teuren
 * Aufnahmen stehen beieinander (alles mit `spiel:` spielt sich erst hin),
 * ein Blockschnitt gaebe einem Teil die ganze Arbeit. */
const TEIL = (() => {
  const f = process.argv.find(x => x.startsWith('--teil='));
  if (!f) return null;
  const [i, n] = f.slice(7).split('/').map(Number);
  return (i >= 0 && n > 0) ? { i, n } : null;
})();

/** Was aufgenommen wird. Jede Aufnahme ist EINE Zeile hier. */
const AUFNAHMEN = [
  { name:'mg-fiona-kontinente', seite:'entwuerfe/mg.html', wahl:'#schirm1 .geraet' },
  { name:'mg-lea-deutschland',  seite:'entwuerfe/mg.html', wahl:'#schirm2 .geraet' },
  // Der Entwurf spielt die Belohnung ab, wenn sie ins Bild SCROLLT
  // (IntersectionObserver, Schwelle 0,4) - und die Aufnahme scrollt sie
  // selbst hinein. Ob der Stern schon da ist, war damit ein Rennen: einmal
  // rot, dreimal gruen, ohne dass sich etwas geaendert hatte. Ein Vorbild,
  // das gelegentlich rot wird, erzieht dazu, Rot zu uebersehen.
  { name:'mg-belohnung', seite:'entwuerfe/mg.html', wahl:'#schirm3 .geraet',
    fertig:'#sternchen' },
  { name:'mg-farbstreifen',     seite:'entwuerfe/mg.html', wahl:'#s-ok' },
  { name:'karte-deutschland',   seite:'entwuerfe/mg.html', wahl:'#schirm2 .geraet svg' },
  // Der LEBENDE Prototyp, nicht der Entwurf.
  //
  // Bis hierher fotografierte das Tor nur `entwuerfe/mg.html` - gemalte
  // Bildschirme. Die Hervorhebung des Ziels (Rand, Puls, Zeiger, gedaempfte
  // Nachbarn) steckt aber in `prototyp/spiel.js`, und die hat damit KEIN Tor
  // gesehen: der Lauf blieb gruen, waehrend sich jeder Spielbildschirm
  // aenderte. Genau die Luecke, vor der Regel 4 warnt.
  { name:'spiel-kontinent',  spiel:'kontinente',    wahl:'.schirm.da' },
  { name:'spiel-bundesland', spiel:'bundeslaender', wahl:'.schirm.da' },
  // Zwei Zustaende, die nur der Blick beurteilen kann - und in beiden
  // steckte ein Fehler, den kein Tor gemeldet hat.
  //
  // `spiel-zug`: waehrend des Ziehens. Das Tor `ziehen` prueft, DASS das
  // Ziel aufleuchtet - es kann nicht sehen, dass das gezogene Etikett
  // genau dieses Ziel zudeckte. 240 x 160 Punkte Kachel ueber 60 x 50
  // Punkten Australien: gemessen gruen, in Wirklichkeit blind.
  //
  // `spiel-lob`: nach der richtigen Antwort. Der Lobsatz und der Name
  // stehen dort untereinander; ob sie passen, sagt kein Zahlenwert.
  { name:'spiel-zug', spiel:'kontinente', wahl:'.schirm.da', tun:'ziehen' },
  { name:'spiel-lob', spiel:'kontinente', wahl:'.schirm.da', tun:'loesen' },

  /* Das ZIELGERAET - iPhone quer, 844 x 390.
   *
   * Bis zum Audit entstanden alle Aufnahmen bei 1240 x 1000. Das ist kein
   * Geraet, das jemand benutzt; es ist die Groesse, bei der zufaellig die
   * erste Aufnahme entstand. Auf dem Fenster, auf dem geurteilt wird,
   * greifen andere Regeln (`max-height:440px`) - und genau die haben kein
   * Bild gesehen. Eine davon, `.kachel{padding:…}`, war ueberdies wirkungslos:
   * `.kachel.bunt` setzt dieselbe Eigenschaft mit zwei Klassen. Sie stand
   * seit der Einfuehrung des Fensters da und tat nichts.
   *
   * Und: Ebenenwahl, Endbildschirm und Forscherbuch hatten UEBERHAUPT kein
   * Vorbild - also genau die drei Bildschirme, auf denen Fortschritt,
   * Sterne und Aufkleber leben.
   *
   * Der Stand wird GESETZT, nicht erspielt: ein Bildschirm mit lauter
   * Nullen zeigt von Sternen und Aufklebern nichts. Wer eine Wirkung
   * abbilden will, muss sie einschalten.
   */
  /* Die Weltenwahl (D4) — der erste Bildschirm, den das Kind nach seinem
     Namen sieht. Sie hatte kein Vorbild, und genau die hatten in der
     Audit-Runde die Fehler. `tun:'welten'` heisst: NICHT weiterklicken. */
  { name:'quer-profile', spiel:null, quer:true, stand:true, wahl:'.schirm.da', tun:'profile' },
  { name:'quer-welten', spiel:null, quer:true, stand:true, wahl:'.schirm.da', tun:'welten' },
  /* Dieselbe Weltenwahl fuer LEA - und sie sieht anders aus.
   *
   * Seit N2a haengt die Zahl der Karten am Profil, seit E3 sind es vier
   * und drei: Fiona hat Erdkunde, Rechnen, Schreiben und Englisch, Lea
   * dieselben ohne Schreiben, die Eltern nur die ersten beiden. Ein
   * Bildschirm, der je nach Kind eine andere Gestalt hat, braucht beide
   * Vorbilder - sonst haelt die Sammlung nur die Haelfte fest und die
   * andere aendert sich unbemerkt. */
  { name:'quer-welten-lea', spiel:null, kind:'lea', quer:true, wahl:'.schirm.da',
    tun:'welten' },
  { name:'quer-ebenen', spiel:null, quer:true, stand:true, wahl:'.schirm.da' },
  /* Dieselbe Ebenenwahl, aber VOLL — acht Kacheln mit Sternen,
     Aufkleberzahlen und Balken nebeneinander. Der Fall nach ein paar
     Wochen, und bis hierher ohne Vorbild. */
  { name:'quer-ebenen-voll', spiel:null, quer:true, stand:'voll', wahl:'.schirm.da' },
  /* Der Fassungsstempel (Q13) — die einzige Aufnahme, die den GANZEN
     Rumpf zeigt.
     Alle anderen fotografieren `.schirm.da`, also den Bildschirm in der
     Buehne. Der Stempel steht daneben, in dem Streifen, den das Geraet
     unten fuer sich behaelt - mit `.schirm.da` waere er auf keinem
     einzigen Vorbild zu sehen, und „er steht unten rechts und deckt
     nichts zu" bliebe eine Behauptung. Wo er WIRKLICH sitzt, sagt nur
     dieses Bild. Sein Text wird vorher festgesetzt (siehe „Die BAUUHR
     aus dem Bild nehmen"), sonst waere die Aufnahme nach jedem
     Einchecken rot. */
  { name:'quer-fassung', spiel:null, quer:true, stand:true, wahl:'body' },
  /* Der Vorlauf (R3) — die engste Stelle der App.
   *
   * Sechzehn Kaesten auf einmal, Namen, die an Fugen umbrechen muessen,
   * und eine Bildhoehe, die auf zwei Punkte genau ausgemessen ist. Genau
   * so ein Bildschirm gehoert fotografiert: `passt` sagt, ob alles im
   * Bild ist, aber nicht, ob „Brandenbur / g" dasteht.
   *
   * `tun:'vorlauf'` heisst: NICHT auf „Jetzt starten" tippen. */
  { name:'quer-vorlauf', spiel:'bundeslaender', quer:true, stand:true,
    wahl:'.schirm.da', tun:'vorlauf' },
  { name:'quer-spiel',  spiel:'kontinente', quer:true, stand:true, wahl:'.schirm.da' },
  // Der Endbildschirm wird im ANTIPPEN-Modus aufgenommen.
  //
  // Zwei Umwege waren noetig, und beide sagen etwas ueber die App:
  // Fiona ZIEHT, und ein Antippen ist dort ausdruecklich keine Antwort -
  // der Durchlauf kam nach vierzig Aufgaben nicht ans Ende. Und Lea TIPPT
  // die Kontinente, es gibt dort gar keine Auswahl zum Anklicken. Also
  // wird Fionas Antwortweise gesetzt - dieselbe Einstellung, die im Spiel
  // unter „Lieber antippen" steht.
  { name:'quer-ende',   spiel:'kontinente', quer:true, stand:true, antippen:true,
    wahl:'.schirm.da', tun:'durch' },
  { name:'quer-buch',   spiel:null, quer:true, stand:true, wahl:'.schirm.da', tun:'buch' },
  // Der erste Bildschirm ohne Karte. Er hatte kein Vorbild, und genau die
  // hatten in der Audit-Runde die Fehler.
  { name:'quer-rechnen', spiel:'rechnen:plusminus', quer:true, wahl:'.schirm.da' },
  /* Hauptstädte in Europa (R6).
   *
   * Die einzige Ebene, die eine KONTINENTKARTE mit einer Stadtfrage
   * verbindet - Rahmen, Umgebung, Farbkreis und Umriss auf der Kachel
   * werden dort aus der Kennung abgeleitet, und jede dieser vier
   * Ableitungen kann danebengehen, ohne dass ein anderes Tor etwas sagt:
   * die Karte waere dann einfach die falsche. Gespielt wird sie von Lea,
   * Fiona hat sie nicht. */
  { name:'quer-hauptstaedte-eu', spiel:'hauptstaedte:europa', kind:'lea',
    quer:true, wahl:'.schirm.da' },
  /* Die Gruppenkachel (Q17) — der einzige Bildschirm, den man NUR sieht,
     wenn man zwei Ebenen hat, die sich eine Kachel teilen.
     Er entsteht seit Q17 zwischen Wand und Ebene: „Hauptstädte — wo?",
     Deutschland und Europa. Ohne Vorbild waere er der einzige
     Bildschirm der App ohne Bild — und ausgerechnet der, den Fiona nie
     zu sehen bekommt und der deshalb beim Durchklicken nicht auffaellt. */
  { name:'quer-gruppe', spiel:null, kind:'lea', quer:true, wahl:'.schirm.da',
    tun:'gruppe' },
  /* Die Nadeln (P10) — der einzige Bildschirm, auf dem eine Trefferflaeche
   * zu SEHEN ist. Zwei Gebiete haengen hier neben der Karte, mit Faden
   * und farbigem Kopf. Dass sie da sind, misst `ziehen --nur=treffer`;
   * wie sie AUSSEHEN, misst nichts - ob zwei Koepfe uebereinanderliegen,
   * ob ein Faden quer ueber die halbe Karte geht, ob das Bild noch zu
   * lesen ist, sieht nur ein Mensch. Gespielt von Stephan: nur seine
   * Tiefe hat die beiden ueberhaupt auf der Karte.
   *
   * Bis A6 stand hier NORDAMERIKA mit sieben Nadeln. Seit Mittelamerika
   * seine eigene Karte hat, hat Nordamerika drei Laender und keine Nadel
   * mehr - die Aufnahme haette weiter gruen gemeldet und nichts mehr
   * gezeigt. Europa ist jetzt die einzige Ebene mit Nadeln, also ist es
   * diese hier (Regel 1: eine Aufnahme, die ihren Gegenstand verloren
   * hat, bezeugt nichts). */
  { name:'quer-nadeln', spiel:'laender:europa', kind:'stephan',
    quer:true, wahl:'.schirm.da' },
  /* Die neue Karte (A6). Der Ausschnitt Mittelamerika ist der Grund,
   * warum es die sieben Nadeln nicht mehr gibt: neun Laender, alle am
   * Ort zu treffen. Ob der Ausschnitt als KARTE etwas taugt - ob der
   * Rand durch Mexiko und Kolumbien wie ein Kartenrand aussieht und
   * nicht wie ein Fehler -, sagt kein Tor. */
  { name:'quer-mittelamerika', spiel:'laender:mittelamerika', kind:'stephan',
    quer:true, wahl:'.schirm.da' },
  /* Nordamerika mit Groenland (Q3). Vier Ziele statt drei, und das vierte
   * ist die groesste Form auf der Karte - ob sie neben USA und Kanada noch
   * eine Karte ergibt oder das Bild kippt, sagt kein Tor.
   *
   * `kind:'stephan'`, weil Fionas Tiefe 3 ist: in IHREM Profil kaeme
   * Groenland gar nicht vor, und die Aufnahme bezeugte genau das Neue
   * nicht. Wer eine Wirkung abbilden will, muss sie einschalten. */
  { name:'quer-nordamerika', spiel:'laender:nordamerika', kind:'stephan',
    quer:true, wahl:'.schirm.da' },
  /* Ozeanien (Q11) - die siebte Karte, und die mit dem groessten
   * Groessenunterschied: Australien ist achtzehnmal Papua-Neuguinea. Ob
   * die drei nebeneinander noch eine Karte ergeben oder ob Australien
   * die beiden anderen zu Punkten macht, sagt kein Tor. */
  { name:'quer-ozeanien', spiel:'laender:australien', kind:'stephan',
    quer:true, wahl:'.schirm.da' },
  /* Der Elternbereich — der einzige Bildschirm ohne Vorbild, und
   * ausgerechnet der ist zuletzt um zwei Tabellen gewachsen (Übersicht je
   * Profil, „Zuletzt geübt"). Mit gesetztem Protokoll, sonst stünden dort
   * nur Striche und die Aufnahme bezeugte die Tabellen nicht. */
  { name:'quer-eltern', spiel:null, quer:true, stand:true, protokoll:true,
    wahl:'.schirm.da', tun:'eltern' },
  // Und der Teil, der nicht mehr auf den Bildschirm passt: die beiden
  // Tabellen, um die der Bereich zuletzt gewachsen ist.
  { name:'quer-eltern-tabellen', spiel:null, quer:true, stand:true, protokoll:true,
    wahl:'.schirm.da', tun:'eltern', roll:'Zuletzt geübt' },
  /* Der Vergleich (N1) - der einzige Bildschirm, auf dem zwei Profile
   * nebeneinander stehen. Ob er beantwortet, wer vorn liegt, sagt kein
   * Tor: das sagt das Bild. */
  { name:'quer-eltern-vergleich', spiel:null, quer:true, stand:true, protokoll:true,
    wahl:'.schirm.da', tun:'eltern', roll:'Stephan gegen Violeta' },
  /* Der Endbildschirm der ELTERN - ein anderer als der der Kinder: keine
   * Siegsterne, „Sitzung beendet." statt „Geschafft!". Bis hierher hielt
   * ihn kein Vorbild; `quer-ende` zeigt Fionas. Gespielt werden die
   * Kontinente, weil das sechs Aufgaben sind und nicht zwoelf - und
   * getippt, weil das Profil nie eine Auswahl bekommt. */
  { name:'quer-ende-eltern', spiel:'kontinente', kind:'stephan', quer:true,
    wahl:'.schirm.da', tun:'durch' },
  /* Der Vorlauf einer RECHENEBENE - ein anderer Bildschirm als der der
   * Gebiete: keine Umrisse, sondern die Aufgabe selbst, und nur so viele
   * Karten, wie gleich kommen. `quer-vorlauf` zeigt die Bundeslaender. */
  { name:'quer-vorlauf-rechnen', spiel:'rechnen:plusminus', quer:true,
    wahl:'.schirm.da', tun:'vorlauf' },
  /* Die Pause — der zweite Bildschirm, der eine leere Kopfzeile trug, und
   * bis hierher der einzige mit einem Knopf, der ALLES loescht, ohne
   * Vorbild. Genau solche hatten in der Audit-Runde die Fehler. */
  { name:'quer-pause', spiel:'kontinente', quer:true, wahl:'.schirm.da', tun:'pause' },
  /* Schreiben (N2a) - zwei Bildschirme, die es vorher nicht gab.
   *
   * Der Vorlauf zeigt hier ALLE sechsundzwanzig Buchstaben mit ihrem
   * Merkwort; das ist die dichteste Kachelwand der App und damit die
   * engste Stelle nach dem Vorlauf der Bundeslaender.
   *
   * Und der Schreibschirm selbst, mit EINEM nachgefahrenen Zug: er zeigt
   * die drei Zustaende der Vorlage nebeneinander (schon, dran, spaeter),
   * den gezogenen Strich und den gruenen Anfangspunkt am naechsten Zug.
   * Genau dieser Punkt stand einmal auch dann noch da, als die Vorlage
   * laengst weg war - gesehen auf einer Aufnahme, von keinem Tor. */
  { name:'quer-schreiben-vorlauf', spiel:'schreiben:buchstaben', quer:true,
    wahl:'.schirm.da', tun:'vorlauf' },
  { name:'quer-schreiben', spiel:'schreiben:buchstaben', quer:true,
    wahl:'.schirm.da', tun:'schreiben' },
  /* Das Diktat (N3) - der einzige Bildschirm der App, auf dem die Aufgabe
   * NICHT zu sehen ist. Genau deshalb gehoert er fotografiert: dass dort
   * nichts steht, prueft der Rauchtest; ob das leere Blatt mit vier
   * Knoepfen daneben noch nach einer Aufgabe aussieht, sagt nur das Bild.
   *
   * Und er ist von sich aus stabil: welcher Buchstabe gerade dran ist,
   * steht nirgends - die Aufnahme sieht bei jedem Keim gleich aus. */
  { name:'quer-diktat', spiel:'schreiben:diktat', quer:true, wahl:'.schirm.da' },
  /* Die Zahlen (N4) - zwei Bildschirme, die es sonst nirgends gibt: der
   * Vorlauf mit den zwanzig Zahlen und ihren Zahlwoertern, und der einzige
   * Aufgabenbildschirm mit ZWEI Schreibfeldern. Welche Zahl drankommt,
   * entscheidet der Leitner; fuer die Aufnahme wird weitergeblaettert, bis
   * eine zweistellige kommt - sonst haelt sie mal ein Feld fest und mal
   * zwei, je nach Keim. */
  { name:'quer-zahlen-vorlauf', spiel:'schreiben:zahlen', quer:true,
    wahl:'.schirm.da', tun:'vorlauf' },
  { name:'quer-zahlen', spiel:'schreiben:zahlen', quer:true,
    wahl:'.schirm.da', tun:'zweistellig' },
  /* Englisch (E3) - zwei Aufnahmen, und die zweite ist die, wegen der
   * diese Runde einen Befund hat.
   *
   * Der Vorlauf zeigt alle 25 Gegenstaende auf einmal: zehn Farbflecken
   * und fuenfzehn Ziffern, jeder mit seinem englischen Wort darunter. Das
   * ist der einzige Bildschirm, auf dem die Farben nebeneinander stehen -
   * ob zwei zu nah beieinander liegen, rechnet `inhalt` in CIELAB, ob es
   * GUT aussieht, sagt nur das Bild.
   *
   * Die Aufgabe selbst zeigt vier Flecken auf neutralem Grund und sonst
   * nichts - kein Wort, denn das ist die Frage. Genau hier ist das
   * Verblassen aus G18 aufgefallen: es machte aus Gruen einen Mintton.
   * Kein Tor haette danach gesucht, und der Befund kam vom Hinsehen. */
  { name:'quer-englisch-vorlauf', spiel:'englisch:hoeren', quer:true,
    wahl:'.schirm.da', tun:'vorlauf' },
  { name:'quer-englisch', spiel:'englisch:hoeren', quer:true,
    wahl:'.schirm.da' },
  /* Falsche Freunde (E10) - der einzige Bildschirm der App mit einem
   * Eingabefeld MITTEN im Satz. Ob das aussieht wie eine Luecke oder wie
   * ein danebengeratenes Formular, sagt kein Tor, sondern nur das Bild;
   * `passt` misst, dass es hineinpasst, und das ist etwas anderes.
   *
   * Als Stephan, denn ihm gehoert die Ebene - und damit ist es zugleich
   * die einzige Aufnahme eines Aufgabenbildschirms im SACHLICHEN Ton. */
  { name:'quer-freunde', spiel:'freunde', kind:'stephan', quer:true,
    wahl:'.schirm.da' },
  /* Wendungen (E11) und Hoeren und schreiben (E12) - EIN Bildschirm in
   * zwei Ausfuehrungen, und der Unterschied ist genau das, was man sehen
   * muss: bei der einen steht der deutsche Satz ueber dem Feld, bei der
   * anderen steht dort NICHTS. Ein Bildschirm mit einer Zeile und einem
   * Eingabefeld auf 844 x 390 ist der leerste der ganzen App - ob das
   * ruhig aussieht oder unfertig, sagt kein Tor.
   *
   * Der Vorlauf kommt mit: er traegt hier ganze Saetze auf den Kacheln,
   * zweisprachig uebereinander, und ist damit die einzige Kachelwand,
   * auf der ein Umbruch mitten in einem Satz sitzt. */
  { name:'quer-wendungen-vorlauf', spiel:'wendungen', kind:'stephan', quer:true,
    wahl:'.schirm.da', tun:'vorlauf' },
  { name:'quer-wendungen', spiel:'wendungen', kind:'stephan', quer:true,
    wahl:'.schirm.da' },
  { name:'quer-hoersatz', spiel:'hoersatz', kind:'stephan', quer:true,
    wahl:'.schirm.da' },
];

/**
 * Ein gesetzter Lernstand: vier Kontinente in vier verschiedenen Faechern.
 * Damit stehen auf der Ebenenwahl zwei von sechs Aufklebern und ein Stern,
 * im Buch zwei Umrisse - und der Balken zeigt beide Streifen.
 */
const STAND = {
  afrika:       { fach:5, richtig:5, falsch:0, faellig:0 },
  europa:       { fach:3, richtig:3, falsch:1, faellig:0 },
  asien:        { fach:2, richtig:1, falsch:0, faellig:0 },
  nordamerika:  { fach:1, richtig:0, falsch:2, faellig:0 },
};

/* Ein Protokoll fuer den Elternbereich.
 *
 * Ohne Eintraege zeigt er drei Zeilen Striche - das ist ein gueltiger
 * Zustand, aber er bezeugt von den Tabellen nichts (Regel 1: wer eine
 * Wirkung abbildet, schaltet sie zuerst ein). Also ein kleiner Satz mit
 * allem, was die Tabellen unterscheiden muessen: zwei Profile, ein Gebiet
 * zweimal falsch (damit es unter die Wackelkandidaten kommt), eine
 * Rechenaufgabe der Eltern (damit „Zuletzt geübt" auch eine Kennung
 * aufloesen muss).
 *
 * Die Zeiten sind FEST. Sie stehen in „Zuletzt geübt" auf dem Bild, und
 * die Seite laeuft ausdruecklich in `Europe/Berlin` - sonst waere die
 * Aufnahme auf jedem Rechner eine andere. */
const T0 = Date.UTC(2026, 0, 15, 15, 30, 0);
const PROTOKOLL = [
  { profil:'fiona', ebene:'kontinente',    gebietId:'afrika',  ergebnis:'richtig', dauerMs:2400 },
  { profil:'fiona', ebene:'kontinente',    gebietId:'asien',   ergebnis:'falsch',  dauerMs:5100 },
  { profil:'fiona', ebene:'kontinente',    gebietId:'asien',   ergebnis:'richtig', dauerMs:3800 },
  { profil:'lea',   ebene:'laender:europa',gebietId:'POL',     ergebnis:'falsch',  dauerMs:6200 },
  { profil:'lea',   ebene:'laender:europa',gebietId:'POL',     ergebnis:'richtig', dauerMs:2900 },
  /* Und die beiden Elternprofile (N1): Stephan zwei von drei, Violeta eins
     von zwei. Die fuenf Zeilen stehen in `gestellt.mjs`, weil der
     Rauchtest genau diesen Vergleich NACHRECHNET - laufen sie
     auseinander, zeigt dieses Bild etwas, das dort nicht mehr geprueft
     wird (P8). */
  ...ELTERN_VERGLEICH,
/* Gebaut wird der Eintrag von `Protokoll.eintrag` - der Stelle, die im
   SPIEL weiss, was einer braucht. Hier standen die Vorgaben ein zweites
   Mal; waere dort ein Feld dazugekommen, haette diese Aufnahme einen
   Bildschirm gezeigt, den es nicht gibt (P8). */
].map((e, i) => Protokoll.eintrag({ zeit: T0 + i * 60000, eingabeart:'ziehen',
                                    versuch:1, fachVorher:1, fachNachher:2, ...e }));

/**
 * Bringt den Spielbildschirm in einen Zustand, den es sonst nur mit dem
 * Finger gibt. Gibt die Stelle zurueck, an der der Zeiger stehenbleiben
 * soll - beim Ziehen bleibt die Maus unten, sonst waere kein Zug zu sehen.
 */
  // Erst messen, wenn die Karte WIRKLICH steht.
  //
  // `kartenGroesse()` setzt Breite und Hoehe der Karte in zwei
  // aufeinanderfolgenden Bildern. Wer die Bildschirmkoordinaten eines
  // Ankers vorher liest, bekommt sie aus der noch ungesetzten Karte - und
  // zieht dann irgendwohin. Genau das ist passiert: zwei Laeufe
  // hintereinander endeten einmal ueber Australien und einmal ueber
  // AFRIKA, und die Bildabnahme meldete 3,6 % Unterschied bei
  // unveraendertem Code.
  const karteSteht = async (seite) => {
    await seite.waitForFunction(() => {
      const k = document.querySelector('.schirm.da .karte');
      return !!(k && k.style.width && parseFloat(k.style.width) > 0);
    }, null, { timeout: 5000 });
    await seite.waitForTimeout(150);
  };

/**
 * Bis zum Endbildschirm durchspielen - durch ANTIPPEN, nicht durch Ziehen.
 *
 * Das Ziehen braucht je Aufgabe eine Mausbahn und ein Wiederfinden des
 * Ankers; sechs davon hintereinander sind sechs Gelegenheiten, dass die
 * Aufnahme an einer anderen Stelle steht als beim letzten Lauf. Das
 * Antippen ist derselbe Weg durch dieselbe Bewertung - `bewerte()` kennt
 * nur EINEN Ort - und es ist deterministisch.
 */
async function durchspielen(seite) {
  for (let n = 0; n < 40; n++) {
    if (await seite.$('.schirm.da #nochmal')) return;
    await karteSteht(seite);
    /* Antworten, wie das PROFIL antwortet.
     *
     * Fiona und Lea tippen ein Etikett an, die Eltern schreiben - ihr
     * Profil sagt `kandidaten:0`. Ohne diesen Zweig kaeme man mit ihnen
     * nie zum Endbildschirm, und ausgerechnet der ist bei ihnen ein
     * anderer (keine Siegsterne, „Sitzung beendet.").
     *
     * Kontinente sind die billige Ebene dafuer: sechs Aufgaben, nicht
     * zwoelf wie beim grossen Einmaleins. */
    /* Jede dritte Aufgabe ist die umgekehrte Frage (B3) - sie hat keine
     * Etiketten und kein Tippfeld, die Karte selbst ist die Antwort. Wer
     * sie nicht kennt, bleibt an ihr stehen: genau das hat dieses Tor
     * gemeldet, als die Form dazukam. */
    if (await istUmgekehrt(seite)) {
      const vorher = await seite.evaluate(() =>
        document.querySelector('.schirm.da #frage').textContent);
      await zeigeAufKarte(seite);
      await seite.waitForFunction((v) =>
        document.querySelector('.schirm.da #frage')?.textContent !== v,
        vorher, { timeout: 8000 });
      await seite.waitForTimeout(1800);
      continue;
    }
    const z = await seite.evaluate(() => {
      const s = document.querySelector('.schirm.da');
      const z = s.querySelector('path.ziel'); if (!z) return null;
      const D = JSON.parse(document.getElementById('daten').textContent);
      const g = D.kontinente.find(x => x.id === z.dataset.id); if (!g) return null;
      return { name: g.name, tippfeld: !!s.querySelector('input.eingabe'),
        idx: [...s.querySelectorAll('.etikett')].map(e => e.textContent.trim())
          .indexOf(g.name) };
    });
    if (!z || (!z.tippfeld && z.idx < 0))
      throw new Error('quer-ende: die richtige Antwort steht nicht in der Liste');
    const idx = z.idx;
    // `$$eval` statt `click()`: waehrend der Einblendung gilt das Etikett
    // als „nicht stabil", und Playwright wartete es tot. Der Klick muss
    // hier nicht die Bedienbarkeit beweisen - das tut der Rauchtest -,
    // sondern den Bildschirm weiterschalten.
    const altesZiel = await seite.evaluate(() =>
      document.querySelector('.schirm.da path.ziel')?.dataset.id || '');
    if (z.tippfeld) {
      await seite.fill('.schirm.da .eingabe', z.name);
      await seite.$eval('.schirm.da .wahlliste .knopf', x => x.click());
    } else {
      await seite.$$eval('.schirm.da .etikett', (els, i) => els[i].click(), idx);
    }
    /* Gewartet wird, bis der Bildschirm WIRKLICH weiter ist - nicht 1800 ms.
     *
     * Das war die teuerste feste Pause der ganzen Kette: sechs Aufgaben
     * je Lauf, zweimal (beide Haelften des Bildvergleichs). „Weiter"
     * heisst: der Endbildschirm steht da, oder es liegt ein ANDERES Ziel
     * an und der Wechsel ist durch (ein Bildschirm, nicht zwei). */
    await seite.waitForFunction((alt) => {
      if (document.querySelector('.schirm.da #nochmal')) return true;
      if (document.querySelectorAll('#buehne .schirm').length !== 1) return false;
      // Die naechste Aufgabe kann die UMGEKEHRTE sein - die hat gar kein
      // hervorgehobenes Gebiet. Auf `path.ziel` zu warten hiesse, auf
      // etwas zu warten, das es bei jeder dritten Aufgabe nicht gibt.
      if (/^Wo liegt /.test(document.querySelector('.schirm.da #frage')?.textContent || ''))
        return true;
      const z = document.querySelector('.schirm.da path.ziel');
      return !!z && z.dataset.id !== alt;
    }, altesZiel, { timeout: 10000 });
  }
  throw new Error('quer-ende: der Endbildschirm kam nach 40 Aufgaben nicht');
}

async function vorfuehren(seite, was) {
  if (was === 'durch') return durchspielen(seite);
  /* Schreiben: den ERSTEN Zug der Vorlage nachfahren und dort stehen
   * bleiben. Die Punkte kommen aus derselben Vorlage, die die App
   * zeichnet - abgelesen am Bildschirm, nicht aus einer Liste hier. */
  /* Weiterblaettern, bis eine zweistellige Zahl kommt. „Weiss ich nicht"
   * loest auf und geht weiter - derselbe Weg, den ein Kind nimmt. */
  if (was === 'zweistellig') {
    for (let n = 0; n < 12; n++) {
      if ((await seite.$$('.schirm.da .feldkasten')).length > 1) break;
      await seite.$eval('.schirm.da #weissnicht', x => x.click());
      await seite.waitForTimeout(1500);
      await seite.waitForSelector('.schirm.da .schreibblatt', { timeout: 8000 }).catch(() => {});
    }
    if ((await seite.$$('.schirm.da .feldkasten')).length < 2)
      throw new Error('quer-zahlen: nach zwölf Aufgaben kam keine zweistellige');
    await seite.waitForTimeout(400);
    return;
  }
  if (was === 'schreiben') {
    const zuege = await schreibVorlage(seite);
    if (!zuege.length) throw new Error('quer-schreiben: keine Vorlage auf dem Bildschirm');
    await zeichneZug(seite, Schreiben.abtasten(zuege[0], 26));
    await seite.waitForTimeout(400);
    return;
  }
  /* Die Pause: aus der laufenden Aufgabe ueber den Zurueck-Knopf. */
  if (was === 'pause') {
    await karteSteht(seite);
    await seite.$eval('.schirm.da #zur', x => x.click());
    await seite.waitForSelector('.schirm.da #null', { timeout: 5000 });
    await seite.waitForTimeout(400);
    return;
  }
  await karteSteht(seite);
  const i = await zielUndEtikett(seite);
  const et = (await seite.$$('.schirm.da .etikett'))[i.idx];
  const a = await et.boundingBox();
  await seite.mouse.move(a.x + a.width/2, a.y + a.height/2);
  await seite.mouse.down();
  // 22 Punkte daneben: mitten in der Nachsicht. Genau der Fall, den ein
  // Kind trifft - und der Fall, in dem die Anzeige gebraucht wird.
  await seite.mouse.move(i.x - 22, i.y + 22, { steps: 12 });
  await seite.waitForTimeout(160);
  if (was === 'ziehen') return;
  await seite.mouse.up();
  await seite.waitForFunction(() => !!document.querySelector('.schirm.da .frage .richtigText'),
    null, { timeout: 4000 });
  await seite.waitForTimeout(600);
}

/** Zulaessige Abweichung: eine Handvoll Bildpunkte fuer Kantenglaettung. */
const GRENZE_ANTEIL = 0.0008;   // 0,08 % der Bildpunkte
const GRENZE_KANAL  = 12;       // ab hier gilt ein Bildpunkt als anders

function vergleiche(a, b) {
  if (a.width !== b.width || a.height !== b.height)
    return { masse: true, anders: Infinity, anteil: 1 };
  let anders = 0;
  const diff = new PNG({ width:a.width, height:a.height });
  for (let i = 0; i < a.data.length; i += 4) {
    const d = Math.max(Math.abs(a.data[i]-b.data[i]),
                       Math.abs(a.data[i+1]-b.data[i+1]),
                       Math.abs(a.data[i+2]-b.data[i+2]));
    if (d > GRENZE_KANAL) {
      anders++;
      diff.data[i]=255; diff.data[i+1]=0; diff.data[i+2]=0; diff.data[i+3]=255;
    } else {
      const g = 230 + (a.data[i]>>4);
      diff.data[i]=g; diff.data[i+1]=g; diff.data[i+2]=g; diff.data[i+3]=255;
    }
  }
  return { masse:false, anders, anteil: anders/(a.width*a.height), diff };
}

const browser = await starte();
// Determinismus: feste Punktdichte, feste Groesse, Bewegung aus, Datum fest.
/* Der Wuerfel steht still - und seit E3 stehen auch die Stimmen fest.
 *
 * Chromium hier hat KEINE Stimme, also auch keine englische. Ohne Nachbau
 * zeigte die Englischebene auf jeder Aufnahme ihre Notfassung („Wo ist
 * blue?") statt des Bildschirms, den ein Geraet mit Stimme zeigt - und
 * genau der ist der, den man beurteilen muss.
 *
 * Nachgebaut wird auch `SpeechSynthesisUtterance` und `speak`, und das ist
 * nicht Vorsicht, sondern eine bezahlte Lehre aus E2: `u.voice = {…}` mit
 * einem einfachen Objekt WIRFT in Chromium, und `vorlesen` verschluckt es.
 * Ohne die beiden Zeilen waere die App auf allen Aufnahmen still kaputt.
 *
 * Sichtbar aendert das sonst nichts: kein Bildschirm dieser App zeigt an,
 * ob gerade gesprochen wird. */
/* Woran man erkennt, dass der Aufgabenbildschirm einer kartenlosen Welt
 * steht. Eine Tabelle und keine Kette von `startsWith`: mit der vierten
 * Welt (E3) waere daraus die dritte Stelle geworden, an der dieselbe
 * Zuordnung einzeln nachgetragen wird - und die erste Aufnahme der
 * Englischebene lief prompt in die Zeitueberschreitung, weil sie auf eine
 * Karte wartete, die es dort nicht gibt. Was hier fehlt, wartet auf die
 * Karte; das ist die richtige Voreinstellung. */
const OHNE_KARTE = {
  rechnen:   '.schirm.da .rechnung',
  schreiben: '.schirm.da .schreibblatt',
  englisch:  '.schirm.da .engkarte',
  freunde:   '.schirm.da .freundluecke',
  wendungen: '.schirm.da .satzfeld',
  hoersatz:  '.schirm.da .satzfeld',
};

const STIMMEN_NACHBAU = () => {
  Math.random = () => 0.42;
  window.__stimmen = [
    { name: 'Anna', lang: 'de-DE', localService: true },
    { name: 'Daniel', lang: 'en-GB', localService: true },
  ];
  speechSynthesis.getVoices = () => window.__stimmen;
  speechSynthesis.speak = () => {};
  speechSynthesis.cancel = () => {};
  window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; this.lang = ''; this.rate = 1;
      this.pitch = 1; this.voice = null; }
  };
};

const seite = await browser.newPage({
  viewport:{ width:1240, height:1000 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
  colorScheme: 'light',
  locale: 'de-DE',
  timezoneId: 'Europe/Berlin',
});
await seite.addInitScript(STIMMEN_NACHBAU);

fs.mkdirSync(VORBILDER, { recursive:true });
fs.mkdirSync(ABWEICHUNGEN, { recursive:true });

/* QS9: `tor/abweichungen/` wurde NIE geleert.
 *
 * Was das gekostet hat: ich habe in dieses Verzeichnis gesehen, 32 Bilder
 * gezaehlt und daraus geschlossen, meine Aenderung habe 32 Bildschirme
 * veraendert. Gemessen waren es drei - die anderen 29 lagen seit einem
 * frueheren Lauf da. Ein Verzeichnis, in dem Altes liegen bleibt, ist
 * keine Auskunft ueber den letzten Lauf, sondern ueber alle Laeufe seit
 * dem letzten Aufraeumen von Hand; und es sieht genauso aus.
 *
 * Geraeumt wird NICHT pauschal beim Start. Das Tor faehrt in drei Teilen
 * nebeneinander (`--teil=i/n`), und ein pauschales Leeren im zweiten Teil
 * wuerde die Funde des ersten wegwerfen. Jeder Teil raeumt deshalb genau
 * die Namen, die er auch misst - die Koerbe sind zerschnitten, also
 * greift keiner in den anderen. */
const abwegDatei = (name, art) => path.join(ABWEICHUNGEN, name + art);
const abwegLoeschen = (name) => {
  for (const art of ['.png', '.jetzt.png']) {
    try { fs.unlinkSync(abwegDatei(name, art)); } catch { /* war nicht da */ }
  }
};

/* Verwaiste: Bilder zu Aufnahmen, die es nicht mehr gibt.
 *
 * Die raeumt kein Teil ueber seine eigenen Namen weg - eine geloeschte
 * oder umbenannte Aufnahme steht in keinem Korb mehr. Jeder Teil rechnet
 * hier dieselbe Liste aus und loescht dieselben Dateien; dass zwei das
 * gleichzeitig tun, macht nichts (der zweite faellt ins `catch`). */
{
  const bekannt = new Set(AUFNAHMEN.map(a => a.name));
  let verwaist = 0;
  for (const d of fs.readdirSync(ABWEICHUNGEN)) {
    if (!d.endsWith('.png')) continue;
    const name = d.replace(/\.jetzt\.png$|\.png$/, '');
    if (bekannt.has(name)) continue;
    try { fs.unlinkSync(path.join(ABWEICHUNGEN, d)); verwaist++; } catch { /* schon weg */ }
  }
  if (verwaist) console.log(`  (${verwaist} verwaiste Bilder entfernt — `
    + `sie gehoerten zu Aufnahmen, die es nicht mehr gibt)`);
}

let rot = 0, neu = 0, gruen = 0;
/* Welche Aufnahmen dieser Lauf rot gefunden hat - fuer die Selbstpruefung
   ganz unten. Nur die duerfen am Ende ein Bild in `abweichungen/` haben. */
const roteNamen = new Set();
let letzteSeite = null;

/* Zwei Fenster: der Schreibtisch, an dem die alten Vorbilder haengen, und
 * das Zielgeraet. Die Seite wird gewechselt, nicht die Groesse veraendert -
 * `setViewportSize` laesst Bildpunkte stehen, die zur alten Groesse
 * gehoerten, und der Vergleich haette sie mitfotografiert. */
const QUER = { width: 844, height: 390 };
let querSeite = null;
const holeSeite = async (a) => {
  if (!a.quer) return seite;
  if (!querSeite) {
    querSeite = await browser.newPage({
      viewport: QUER, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
      reducedMotion: 'reduce', colorScheme: 'light',
      locale: 'de-DE', timezoneId: 'Europe/Berlin',
    });
    await querSeite.addInitScript(STIMMEN_NACHBAU);
  }
  return querSeite;
};

/* Geteilt wird nach AUFWAND, nicht reihum.
 *
 * Reihum war die erste Fassung, mit dem Argument „die teuren Aufnahmen
 * stehen beieinander, ein Blockschnitt gaebe einem Teil die ganze
 * Arbeit". Das stimmt - aber reihum verteilt sie auch nur zufaellig.
 * Gemessen: als der Endbildschirm der Eltern dazukam, standen beide
 * Aufnahmen, die eine GANZE Sitzung durchspielen, in derselben Haelfte.
 * Die schnelle Bahn stieg von 43 auf 56 s, bei 53 gegen 31 Sekunden.
 *
 * Der Aufwand steht der Aufnahme an, er muss nicht gestoppt werden:
 * `tun:'durch'` spielt eine ganze Sitzung (sechs Aufgaben), eine
 * `spiel`-Aufnahme spielt sich einmal hin, der Rest ist ein Bildschirm.
 * Verteilt wird dann gierig: die schwerste zuerst, immer in die Haelfte,
 * die gerade am leichtesten ist. Das ist die uebliche Loesung fuer diese
 * Aufgabe und braucht keine Stoppuhr, die veraltet.
 */
const gewicht = (a) => a.tun === 'durch' ? 8 : a.spiel ? 2 : 1;
/* `--nur=teil,vom,namen`: nur die Aufnahmen, deren Name einen dieser
 * Textteile enthaelt. Nichts fuer die Torkette - dafuer gibt es `--teil=`,
 * das jede Aufnahme genau einmal fahrt. Das hier ist fuer die HAND: wer an
 * einem Bildschirm arbeitet, will ihn in fuenf Sekunden sehen und nicht in
 * einer Minute. Ein `--nur=`, das nichts trifft, ist rot, aus demselben
 * Grund wie ein leerer Teillauf. */
const NUR = (() => {
  const f = process.argv.find(x => x.startsWith('--nur='));
  return f ? f.slice(6).split(',').filter(Boolean) : null;
})();
const MEINE = (() => {
  if (NUR) return AUFNAHMEN.filter(a => NUR.some(n => a.name.includes(n)));
  if (!TEIL) return AUFNAHMEN;
  const koerbe = Array.from({ length: TEIL.n }, () => ({ last: 0, drin: [] }));
  for (const a of [...AUFNAHMEN].sort((x, y) => gewicht(y) - gewicht(x))) {
    const k = koerbe.reduce((m, x) => x.last < m.last ? x : m);
    k.last += gewicht(a); k.drin.push(a);
  }
  // Innerhalb einer Haelfte die urspruengliche Reihenfolge behalten: die
  // Aufnahmen bauen aufeinander auf (erst die Weltenwahl, dann tiefer).
  const meins = new Set(koerbe[TEIL.i].drin);
  return AUFNAHMEN.filter(a => meins.has(a));
})();
if (TEIL) console.log(`  (Teil ${TEIL.i + 1} von ${TEIL.n}, Aufwand `
  + `${MEINE.reduce((n, a) => n + gewicht(a), 0)} von `
  + `${AUFNAHMEN.reduce((n, a) => n + gewicht(a), 0)}: `
  + `${MEINE.length} der ${AUFNAHMEN.length} Aufnahmen)`);
/* Ein Teillauf, der ins Leere greift, ist gefaehrlicher als gar keiner:
   er meldet „alles gruen" ueber nichts. */
if ((TEIL || NUR) && !MEINE.length) {
  console.log(`\n  ansicht ROT: ${NUR ? '`--nur=' + NUR.join(',') + '` trifft keine Aufnahme'
    : 'dieser Teil hat keine einzige Aufnahme'}.\n`);
  process.exit(1);
}
/* `--zeiten`: was jede einzelne Aufnahme kostet.
 *
 * Nicht fuer die Kette, sondern fuer die Hand - die Gewichte der
 * Aufteilung (`gewicht`) sind eine SCHAETZUNG, und eine Schaetzung ohne
 * Messstelle veraltet. Wer sie nachzieht, faehrt das hier einmal. */
const ZEITEN = process.argv.includes('--zeiten');
const gemessen = [];
for (const a of MEINE) {
  const t0 = Date.now();
  const seite = await holeSeite(a);
  if (a.spiel || a.quer) {
    // Frische Ablage je Aufnahme: der Keim kommt aus dem gespeicherten
    // Sitzungszaehler, ein Rest von vorher wuerde eine andere Aufgabe
    // ziehen und das Vorbild bei jedem Lauf verschieben.
    /* Wer eine ganze Sitzung durchspielt, spielt sie mit `?flott`.
     *
     * Gemessen: `quer-ende` brauchte 25,5 s und `quer-ende-eltern` 21,2 s,
     * alle zwanzig anderen Aufnahmen zusammen 8 s. Der Posten ist die
     * Lobpause der App — 2,6 s nach jeder richtigen Antwort, sechs
     * Aufgaben je Durchlauf, zweimal.
     *
     * `?flott` kuerzt genau diese Pause auf 900 ms und sonst nichts (siehe
     * `LOBPAUSE` in spiel.js). Abgebildet wird der ENDbildschirm, also ein
     * Zustand, der nach der letzten Pause anfaengt — was die Pause dauert,
     * steht auf keinem dieser Vorbilder. Fuer die anderen Aufnahmen bleibt
     * der Schalter aus: `quer-spiel` haelt das Lob selbst fest.
     *
     * Abgeleitet aus `tun:'durch'`, nicht als eigene Spalte: sonst waere es
     * bei der naechsten Sitzungsaufnahme wieder zu vergessen. */
    const adresse = SPIEL + (a.tun === 'durch' ? '?flott' : '');
    await seite.goto(adresse, { waitUntil:'domcontentloaded' });
    await seite.evaluate(async () => {
      for (const d of await indexedDB.databases()) indexedDB.deleteDatabase(d.name);
      localStorage.clear();
    });
    await seite.goto(adresse, { waitUntil:'domcontentloaded' });
    await seite.waitForSelector('[data-profil="fiona"]');
    // Einen Lernstand SETZEN, wo einer gebraucht wird. Ohne ihn steht auf
    // jeder Kachel dieselbe Null, und die Aufnahme bezeugt von Sternen,
    // Aufklebern und Balken genau nichts (Regel: wer eine Wirkung misst,
    // schaltet sie zuerst ein).
    /* `stand:'voll'` — ein Lernstand auf ALLEN Erdkunde-Ebenen.
     *
     * Die Ebenenwahl zeigt je Kachel Sterne, Aufkleberzahl und einen
     * Balken. Mit dem gewoehnlichen `stand:true` traegt genau EINE Kachel
     * etwas und sieben stehen auf null - der Fall, den ein Kind nach ein
     * paar Wochen sieht, hatte nie ein Vorbild. Gestellt wird er hier: je
     * Ebene ein anderer Fuellgrad, damit null, halb und voll nebeneinander
     * stehen.
     *
     * Die Kennungen kommen aus den DATEN der Seite, nicht aus einer Liste
     * hier - sonst waere die naechste Ebene wieder nicht dabei. */
    if (a.stand === 'voll') {
      await seite.evaluate((wer) => new Promise((ja, nein) => {
        const D = JSON.parse(document.getElementById('daten').textContent);
        const ebenen = [['kontinente', D.kontinente.map(k => k.id)],
          ...Object.entries(D.laender).map(([k, l]) => [`laender:${k}`, l.map(x => x.a3)]),
          ['bundeslaender', D.deutschland.map(b => b.id)],
          ['hauptstaedte',  D.deutschland.map(b => b.id)]];
        const auf = indexedDB.open('lernkiste', 1);
        auf.onupgradeneeded = () => {
          for (const l of ['profile','fortschritt','protokoll','einstellungen'])
            if (!auf.result.objectStoreNames.contains(l)) auf.result.createObjectStore(l);
        };
        auf.onsuccess = () => {
          const t = auf.result.transaction(['fortschritt'], 'readwrite');
          // Anteil und Fachhoehe wandern von Ebene zu Ebene: 0, 1/7, 2/7 …
          ebenen.forEach(([id, ids], i) => {
            const anteil = i / (ebenen.length - 1);
            const st = {};
            ids.slice(0, Math.round(ids.length * anteil)).forEach((g, j) => {
              const fach = 1 + ((i + j) % 5);
              st[g] = { fach, hoechstes: fach, faellig: 0, richtig: fach, falsch: 0, zuletzt: 0 };
            });
            t.objectStore('fortschritt').put(st, `${wer}:${id}`);
          });
          t.oncomplete = ja; t.onerror = () => nein(t.error);
        };
        auf.onerror = () => nein(auf.error);
      }), a.kind || 'fiona');
      await seite.reload({ waitUntil:'domcontentloaded' });
      await seite.waitForSelector('[data-profil="fiona"]');
    } else if (a.stand) {
      await seite.evaluate((stand) => new Promise((ja, nein) => {
        const auf = indexedDB.open('lernkiste', 1);
        auf.onupgradeneeded = () => {
          for (const l of ['profile','fortschritt','protokoll','einstellungen'])
            if (!auf.result.objectStoreNames.contains(l)) auf.result.createObjectStore(l);
        };
        auf.onsuccess = () => {
          const t = auf.result.transaction(
            ['fortschritt','einstellungen','protokoll'], 'readwrite');
          t.objectStore('fortschritt').put(stand.was, stand.wo);
          if (stand.antippen)
            t.objectStore('einstellungen').put({ antwortweise:{ fiona:'antippen' } }, 'alles');
          (stand.protokoll || []).forEach((e, i) => t.objectStore('protokoll').put(e, `p${i}`));
          t.oncomplete = ja; t.onerror = () => nein(t.error);
        };
        auf.onerror = () => nein(auf.error);
      }), { was: STAND, wo: `${a.kind || 'fiona'}:kontinente`, antippen: !!a.antippen,
            protokoll: a.protokoll ? PROTOKOLL : null });
      await seite.reload({ waitUntil:'domcontentloaded' });
      await seite.waitForSelector('[data-profil="fiona"]');
    }
    // Die Profilwahl ist der erste Bildschirm ueberhaupt und hatte bis R2
    // kein Vorbild - ausgerechnet der, den beide Kinder als erstes sehen.
    // `tun:'profile'` heisst: hier stehenbleiben.
    if (a.tun === 'profile') { await seite.waitForSelector('.schirm.da .kachel.wer'); }
    else {
    await seite.click(`[data-profil="${a.kind || 'fiona'}"]`);
    // Die Weltenwahl ist selbst eine Aufnahme wert; wer weiter will,
    // geht durch sie hindurch.
    await seite.waitForSelector('.schirm.da [data-welt]');
    if (a.tun !== 'welten') await zurEbenenwahl(seite, a.spiel || 'kontinente');
    // `tun:'gruppe'` heisst: die Gruppenkachel oeffnen und dort bleiben.
    if (a.tun === 'gruppe') {
      await seite.$eval('.schirm.da [data-gruppe]', x => x.click());
      await seite.waitForSelector('.schirm.da .wahl.ebenen [data-ebene]:not([data-gruppe])',
        { timeout: 15000 });
      await seite.waitForTimeout(300);
    }
    if (a.tun === 'buch') {
      await seite.click('#buch');
      await seite.waitForSelector('.schirm.da .rollen');
      await seite.waitForTimeout(400);
    } else if (a.tun === 'eltern') {
      // Durch die Tuer: vier Nullen, dann steht der Bereich da.
      await seite.click('#eltern');
      await seite.waitForSelector('.schirm.da .ziffern');
      for (let i = 0; i < 4; i++) await seite.click('.schirm.da [data-z="0"]');
      await seite.waitForSelector('.schirm.da .kacheln', { timeout: 8000 });
      /* Der Elternbereich ist laenger als der Bildschirm. Gerollt wird zu
       * einer UEBERSCHRIFT, nicht um eine Zahl von Punkten: verschiebt
       * sich etwas darueber, zeigt die Aufnahme weiter dasselbe. */
      if (a.roll) {
        await seite.evaluate((t) => {
          const h = [...document.querySelectorAll('.schirm.da .gruppe')]
            .find(x => x.textContent.includes(t));
          if (h) h.scrollIntoView({ block: 'start' });
        }, a.roll);
        await seite.waitForTimeout(200);
      }
    } else if (a.spiel) {
      // Seit Q17 kann die Ebene hinter einer Gruppenkachel liegen.
      await durchGruppe(seite, a.spiel);
      await seite.click(`.schirm.da [data-ebene="${a.spiel}"]:not([data-gruppe])`);
      // Seit R3 steht der Vorlauf beim ersten Betreten davor.
      await seite.waitForSelector('.schirm.da #los, .schirm.da .karte svg path.ziel, '
        + '.schirm.da .rechnung, .schirm.da .engkarte, .schirm.da .freundluecke',
        { timeout: 25000 });
      // `tun:'vorlauf'` heisst: HIER bleiben. Kein `continue` - das
      // uebersprang die Aufnahme selbst und liess die naechste auf einer
      // halb gewanderten Seite landen (`quer-buch` wurde davon rot).
      if (a.tun === 'vorlauf') { await seite.waitForTimeout(400); }
      else {
      await durchVorlauf(seite);
      // Eine Rechenebene hat keine Karte, auf die man warten könnte.
      // Jede Sorte hat ihr eigenes Kennzeichen: die Rechnung, das
      // Schreibfeld oder das Zielgebiet auf der Karte.
      const steht = OHNE_KARTE[String(a.spiel).split(':')[0]];
      await seite.waitForSelector(steht || '.schirm.da .karte svg path.ziel');
      const ohneKarte = !!steht;
      await seite.waitForTimeout(ohneKarte ? 300 : 0);
      if (a.tun) await vorfuehren(seite, a.tun);
      }
    }
    }
    letzteSeite = null;
  } else if (letzteSeite !== a.seite) {
    await seite.goto('file://' + path.join(process.cwd(), a.seite), { waitUntil:'networkidle' });
    await seite.evaluate(() => document.fonts.ready);   // sonst wandert der Text
    letzteSeite = a.seite;
  }
  /* Die eigene Schrift muss DA sein - bei JEDER Aufnahme.
   *
   * Diese Pruefung stand im Zweig fuer die App-Bildschirme. Die zwei
   * Entwurfsaufnahmen liefen daran vorbei, und genau bei ihnen ist
   * eingetreten, wogegen sie geschrieben wurde: die Entwuerfe holten ihre
   * Schrift von fonts.googleapis.com, die Anfrage lief ohne freies Netz in
   * die Zeitueberschreitung, und die Vorbilder hielten seit jeher die
   * SYSTEMSCHRIFT fest. Eine Pruefung, die nur den halben Satz sieht,
   * bezeugt den anderen nicht.
   *
   * GEMESSEN wird die gesetzte BREITE, nicht `document.fonts.check()`.
   *
   * Der erste Anlauf fragte `check()`. Der meldet aber „alles da", wenn es
   * gar keine `@font-face` gibt - er sagt nur, ob die angemeldeten Faces
   * geladen sind, und ohne Anmeldung ist die Menge leer. Genau der Fall,
   * um den es hier geht: die Entwuerfe holten ihre Schrift ueber einen
   * `<link>`, der ins Leere lief, es wurde nie ein Face angemeldet - und
   * die Pruefung sagte gruen. Nachgestellt und nachgemessen: sie liess den
   * Fehler durch, gegen den sie geschrieben war (Regel 5).
   *
   * Ein Wort in der gesuchten Schrift ist anders breit als dasselbe Wort
   * in einer Schrift, die es NICHT gibt. Sind beide gleich breit, wird die
   * Ersatzschrift gesetzt - egal, was der Lader meint. */
  const daSchrift = await schriftDa(seite);
  if (!daSchrift) {
    console.log(`  FEHLT   ${a.name}  (die eigene Schrift wurde nicht geladen)`); rot++; continue;
  }
  const el = await seite.$(a.wahl);
  if (!el) { console.log(`  FEHLT   ${a.name}  (${a.wahl} nicht gefunden)`); rot++; continue; }
  // Erst ins Bild holen, dann warten, bis das Abgebildete WIRKLICH fertig
  // ist - sonst haelt das Vorbild einen halben Zustand fest.
  if (a.fertig) {
    await el.scrollIntoViewIfNeeded();
    await seite.waitForFunction((w) => {
      const x = document.querySelector(w);
      return !!x && +getComputedStyle(x).opacity >= 0.99;
    }, a.fertig, { timeout: 5000 });
    await seite.waitForTimeout(120);
  }
  // Die BAUUHR aus dem Bild nehmen.
  //
  // Der Baustempel sagt, welcher Einchecker gebaut wurde. In einem Vorbild
  // ist das Gift: er aendert sich mit JEDER Runde, und seit Q13 steht er
  // auf JEDEM Bildschirm - ohne diesen Griff waeren alle 35 Aufnahmen bei
  // jedem Einchecken rot.
  //
  // Vorher trug er Datum und Uhrzeit des Baus, und die Aufnahme
  // `quer-profile` war beim ersten Lauf gruen und im naechsten frischen
  // Baum rot, um 2556 Bildpunkte - `15:59` gegen `16:52`. Im Arbeitsbaum
  // faellt das nicht auf, weil dort die Zeitstempel der Quelldateien
  // stehenbleiben; in einem frischen Auschecken sind sie neu, und damit
  // ist es die Uhr auch.
  //
  // Gefunden hat es `npm run proben`: zwei Gegenproben meldeten "war schon
  // vorher rot". Ein Vorbild, das sich von selbst aendert, beweist nichts
  // und blockiert jede kommende Runde.
  //
  // Gesetzt wird ein FESTER Satz derselben Bauart, nicht ein leerer: die
  // Zeile soll weiter auf ihre Lage und ihre Groesse geprueft werden, nur
  // eben nicht auf ihren Inhalt (Regel 1 - was man wegnimmt, prueft man
  // nicht mehr). Dass Fassung und Datum stimmen, prueft `doku`.
  await seite.evaluate(() => {
    const b = document.getElementById('fassung');
    if (b) b.textContent = 'v0 · 0000000';
  });
  /* Der Zeiger wird WEGGELEGT, bevor ausgeloest wird.
   *
   * Auf dem Schreibtisch liegt die Maus nach dem letzten Klick irgendwo -
   * und wo, entscheidet, wo die Kacheln stehen. Als der Ausschnitt
   * Mittelamerika (A6) eine Kachel dazwischenschob, wanderte der Zeiger
   * auf dem naechsten Bildschirm zufaellig ueber den Knopf „Berlin", und
   * `spiel-bundesland` meldete 7478 geaenderte Bildpunkte: einen
   * Hover-Ring, den auf dem Zielgeraet nie jemand sieht.
   *
   * Das ist kein Unterschied, den ein Vorbild festhalten soll. Der Zeiger
   * geht deshalb vor jeder Aufnahme in die Ecke - einmal fuer alle
   * Aufnahmen, statt in jeder einzeln daran zu denken. */
  await seite.mouse.move(0, 0);
  // `animations: 'disabled'` haelt laufende Animationen an und spult sie ans
  // Ende. Ohne das bleibt eine ENDLOSE Animation - der atmende Ring am
  // Mikrofonknopf - auch bei 1 ms Dauer irgendwo stehen, und das Tor meldet
  // bei jedem Lauf einen anderen Unterschied. Das Tor war nicht
  // deterministisch; gefunden hat es sich selbst.
  const jetzt = await el.screenshot({ animations: 'disabled' });
  const ziel = path.join(VORBILDER, a.name + '.png');

  /* Was diese Aufnahme beim LETZTEN Mal hinterlassen hat, geht jetzt weg -
   * vor dem Vergleich, nicht danach. Wird sie wieder rot, schreibt sie es
   * gleich neu; wird sie gruen, bleibt nichts liegen, das behauptet, sie
   * waere rot. Auch `--aktualisieren` laeuft hier durch: ein erneuertes
   * Vorbild ohne Unterschied darf keinen Unterschied dokumentieren. */
  abwegLoeschen(a.name);

  if (AKTUALISIEREN || !fs.existsSync(ziel)) {
    fs.writeFileSync(ziel, jetzt);
    console.log(`  ${fs.existsSync(ziel)&&!AKTUALISIEREN?'NEU    ':'ERNEUERT'} ${a.name}`);
    neu++; continue;
  }
  const v = vergleiche(PNG.sync.read(fs.readFileSync(ziel)), PNG.sync.read(jetzt));
  if (v.masse) {
    console.log(`  ROT     ${a.name}  — Maße geändert`); rot++; roteNamen.add(a.name);
  } else if (v.anteil > GRENZE_ANTEIL) {
    fs.writeFileSync(path.join(ABWEICHUNGEN, a.name + '.png'), PNG.sync.write(v.diff));
    fs.writeFileSync(path.join(ABWEICHUNGEN, a.name + '.jetzt.png'), jetzt);
    console.log(`  ROT     ${a.name}  — ${v.anders} Bildpunkte anders `
      + `(${(v.anteil*100).toFixed(3)} %, erlaubt ${(GRENZE_ANTEIL*100).toFixed(3)} %)`);
    rot++; roteNamen.add(a.name);
  } else {
    console.log(`  grün    ${a.name}  — ${v.anders} Bildpunkte anders (${(v.anteil*100).toFixed(4)} %)`);
    gruen++;
  }
  gemessen.push({ name: a.name, ms: Date.now() - t0,
    art: a.tun === 'durch' ? 'durch' : a.spiel ? 'spiel' : 'einfach' });
}
await browser.close();
server.close();

if (ZEITEN) {
  console.log('\n  Was jede Aufnahme kostet (für die Gewichte der Aufteilung):');
  for (const z of gemessen.sort((x, y) => y.ms - x.ms))
    console.log(`    ${String((z.ms / 1000).toFixed(1)).padStart(5)} s  `
      + `${z.name.padEnd(24)} ${z.art}`);
  const je = {};
  for (const z of gemessen) (je[z.art] = je[z.art] || []).push(z.ms);
  console.log('\n  Im Mittel je Art:');
  for (const [art, l] of Object.entries(je))
    console.log(`    ${String((l.reduce((n, x) => n + x, 0) / l.length / 1000).toFixed(1))
      .padStart(5)} s  ${art} (${l.length})`);
}
console.log(`\n  ${gruen} grün, ${neu} neu, ${rot} rot`);

/* Die Selbstpruefung: das Verzeichnis darf nur zeigen, was DIESER Lauf
 * gefunden hat.
 *
 * Ohne sie waere das Aufraeumen oben eine Zusage ohne Nachweis - und genau
 * so eine Zusage ist QS9 gewesen: das Verzeichnis hat behauptet, 32
 * Bildschirme haetten sich geaendert, und niemand hat es nachgezaehlt.
 * Geprueft wird nur ueber die Namen, die dieser Teil gemessen hat; die
 * anderen Koerbe gehoeren ihm nicht.
 *
 * WORAN DIESE PRUEFUNG NICHT ZU RUETTELN IST, und das ist der Grund, warum
 * die Gegenprobe so aussieht, wie sie aussieht: eine Datei von Hand in das
 * Verzeichnis zu legen beweist hier NICHTS. Das Raeumen oben loescht sie im
 * selben Lauf, bevor die Pruefung sie sehen kann - ich habe es versucht,
 * der Lauf blieb gruen, und das sah aus wie eine bestandene Probe. Die
 * Pruefung haengt am Raeumen, also muss die Gegenprobe das RAEUMEN
 * angreifen: sie dreht `abwegLoeschen` um, sodass die Aufnahme eine Datei
 * hinterlaesst statt sie wegzunehmen. Dann meldet es. Regel 1 - und der
 * erste Anlauf war genau die Pruefung, die nie etwas sagt. */
const gelogen = MEINE.filter(a => !roteNamen.has(a.name))
  .filter(a => ['.png', '.jetzt.png'].some(art => fs.existsSync(abwegDatei(a.name, art))))
  .map(a => a.name);
if (gelogen.length) {
  console.log(`\n  ansicht ROT: in tor/abweichungen/ liegen Bilder zu ${gelogen.length} `
    + `Aufnahme(n), die dieser Lauf NICHT rot gefunden hat:`);
  for (const n of gelogen.slice(0, 8)) console.log(`    ${n}`);
  console.log('  Das Verzeichnis wuerde eine Aenderung behaupten, die es nicht gibt.');
  console.log('  Es wird vor jedem Vergleich geraeumt — wenn hier etwas steht, ist');
  console.log('  das Raeumen kaputt, nicht das Bild.\n');
  process.exit(1);
}
if (rot) {
  console.log('\n  Die Unterschiede liegen in tor/abweichungen/ — rot markiert, was sich');
  console.log('  geändert hat. War die Änderung Absicht, dann:');
  console.log('      node tor/ansicht.mjs --aktualisieren');
  console.log('  und die neuen Vorbilder im SELBEN Commit einchecken. Dann steht die');
  console.log('  Veränderung im Diff und ist zu sehen.');
  process.exit(1);
}
