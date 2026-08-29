/* Lernkiste - Prototyp mit M3 bis M6.
 *
 * Eine Aufgabe, drei Eingabewege. Die Aufgabenlogik sieht nur Antworten.
 * Leitner statt Zufall, Protokoll statt Vergessen, Elternbereich statt
 * Vermuten.
 */
const D = JSON.parse(document.getElementById('daten').textContent);
const BAU = JSON.parse(document.getElementById('bau').textContent);
const buehne = document.getElementById('buehne');

const FL = ['--f1','--f2','--f3','--f4','--f5','--f6','--f7'];
const VIER = ['--f1','--f3','--f5','--f6'];
const el = (t,k,i)=>{ const e=document.createElement(t); if(k)e.className=k; if(i!==undefined)e.innerHTML=i; return e; };
const STERN = (f,g=24)=>`<svg width="${g}" height="${g}" viewBox="-14 -14 28 28"><path d="M0 -12 3.7 -4 12 -2.8 6 3.2 7.4 12 0 7.8 -7.4 12 -6 3.2 -12 -2.8 -3.7 -4Z" fill="${f}" stroke="var(--tinte)" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const LOESCHEN='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6H9L3 12l6 6h11a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"/><path d="M17 10l-4 4M13 10l4 4"/></svg>';
const ZURUECK='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg>';
/* ---------- Zeichen und der Kopf ------------------------------------------
 *
 * Der Kopf war auf jedem Bildschirm anders gebaut: mal zwei leere `span`
 * als Platzhalter, mal `space-between` mit drei ungleichen Bloecken. Die
 * Mitte stand dadurch nie wirklich mittig ("Fiona" sass bei 844 Punkten
 * Breite auf 366 statt 422), und im Hochformat brach die rechte Gruppe
 * unter "Zurueck" um - zwei Zeilen, alles schief.
 *
 * Jetzt gibt es EINE Bauanleitung: drei Felder in einem Raster
 * (1fr | auto | 1fr). Die Mitte ist damit immer mittig, egal wie breit
 * links und rechts sind, und nichts bricht um. Die Knoepfe rechts sind
 * Zeichen statt Woerter - "Forscherbuch" und "Eltern" brauchten zusammen
 * 223 Punkte, die beiden Zeichen brauchen 96.
 */
const ZEICHEN = {
  buch:'<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10a3 3 0 0 1 2 5.2V20a3 3 0 0 0-2-.8H5.5A1.5 1.5 0 0 1 4 17.7z"/><path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H14a3 3 0 0 0-2 5.2V20a3 3 0 0 1 2-.8h4.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
  eltern:'<rect x="4" y="10" width="16" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  tonAn:'<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M16 9.2a4 4 0 0 1 0 5.6M18.6 6.6a7.5 7.5 0 0 1 0 10.8"/>',
  tonAus:'<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>',
  tag:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/>',
  abend:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  // Ein Aufkleber: rundes Blatt mit umgeschlagener Ecke.
  kleber:'<path d="M12 3a9 9 0 0 1 9 9h-5a4 4 0 0 0-4 4v5a9 9 0 0 1 0-18z"/><path d="M12 21c2.4 0 8.6-6.2 9-9"/>',
  zu:'<path d="M6 6l12 12M18 6L6 18"/>',
};
const ZEI = (n, g=24)=>`<svg width="${g}" height="${g}" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true">${ZEICHEN[n]}</svg>`;

/** Ein Zeichenknopf: rund, 44 Punkte, mit Namen fuer alle, die ihn nicht sehen. */
const zeichenKnopf = (id, zeichen, name)=>
  `<button class="knopf rund" id="${id}" aria-label="${name}" title="${name}">${ZEI(zeichen)}</button>`;

/**
 * Der Kopf. `zurueck` ist entweder null, 'zurueck' oder 'schliessen' -
 * ein Pfeil fuehrt eine Ebene hoeher, ein Kreuz macht etwas zu. Beides
 * durcheinander zu benutzen ist der haeufigste Grund, warum ein Kind sich
 * in einer App verirrt.
 */
const kopf = ({ links='', mitte='', rechts='' })=>
  `<div class="kopf"><div class="kopf-links">${links}</div>
    <div class="kopf-mitte">${mitte}</div>
    <div class="kopf-rechts">${rechts}</div></div>`;
const zurueckKnopf = (wohin='Zurück')=>
  `<button class="knopf" id="zur"><span class="zei">${ZURUECK}</span><span class="wort">${wohin}</span></button>`;
const schliessenKnopf = (was='Schließen')=>
  `<button class="knopf rund" id="zur" aria-label="${was}" title="${was}">${ZEI('zu')}</button>`;

const MIKRO='<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/></svg>';
const sterne=(n,g)=>`<div class="sterne">${[0,1,2].map(i=>STERN(i<n?'var(--stern-an)':'var(--stern-aus)',g)).join('')}</div>`;

/**
 * Wieviele Sterne? EINE Formel, an EINER Stelle.
 *
 * Vorher gab es zwei: der Kopf rechnete `floor(richtig / ceil(Aufgaben/3))`,
 * der Endbildschirm `round(richtig/Aufgaben * 3)`. Nachgespielt mit vier von
 * vier richtig: der Kopf zeigte **einen** Stern, der Endbildschirm **drei**.
 * Ein Fortschritt, der unterwegs etwas anderes sagt als am Ende, ist keiner.
 *
 * Gezaehlt wird jetzt, wie ANTON es tut: nicht wieviel richtig war, sondern
 * wieviel **glatt** war - beim ersten Versuch, ohne Hilfe. Drei Sterne
 * heissen fehlerfrei, und das muss auch etwas heissen.
 *
 * `bisher` ist die Zahl der schon beantworteten Aufgaben: im Kopf waechst
 * die Anzeige damit waehrend der Runde mit, statt am Ende zu springen.
 */
function sterneFuer(glatt, gesamt){
  if (!gesamt) return 0;
  const anteil = glatt / gesamt;
  return anteil >= 1 ? 3 : anteil >= 2/3 ? 2 : anteil >= 1/3 ? 1 : 0;
}

/**
 * Der Fortschrittsbalken - EIN Balken, zwei Aussagen, auf jedem Bildschirm
 * derselbe.
 *
 * Vorher zeigte er die mittlere Fachhoehe, und direkt darueber stand eine
 * ANDERE Zahl: die der Aufkleber. Nach einer fehlerfreien Runde stand da
 * "Im Buch: 0 von 4" und darunter ein Balken auf einem Viertel. Zwei
 * richtige Zahlen, die sich widersprechen, weil sie uebereinanderstehen -
 * und ein Kind liest den Balken, nicht die Zahl.
 *
 * Jetzt sind es zwei Streifen mit je einer Bedeutung:
 *   fest      hat einen Aufkleber - genau die Zahl, die danebensteht
 *   unterwegs wie weit die Gebiete im Schnitt sind - was sich JEDE Runde
 *             bewegt, auch wenn noch kein Aufkleber dazugekommen ist
 *
 * `unterwegs` wird auf `fest` hochgezogen: ein Gebiet in Fach 3 zaehlt als
 * Aufkleber, traegt zum Mittel aber nur die Haelfte bei - der helle
 * Streifen waere sonst kuerzer als der dunkle und sae unter ihm.
 */
const fortschrittBalken = (f, klasse='') => {
  const fest = f.gesamt ? f.gesammelt / f.gesamt : 0;
  const unterwegs = Math.max(f.anteil, fest);
  return `<div class="balken ${klasse}" role="img" aria-label="${f.gesammelt} von `
    + `${f.gesamt} im Buch"><i class="unterwegs" style="transform:scaleX(${
      unterwegs.toFixed(3)})"></i><i class="fest" style="transform:scaleX(${
      fest.toFixed(3)})"></i></div>`;
};

/** Die Zahl der Aufkleber mit ihrem Zeichen davor. */
const kleberMarke = (n, gesamt) => `<span class="klebermarke"${
  n ? '' : ' data-leer="ja"'} aria-label="${n} von ${gesamt} Aufklebern">${
  ZEI('kleber', 20)}${n}</span>`;

/* ---------- Vorlesen ----------------------------------------------------
 *
 * Die Stimme spricht zu einer Sechsjaehrigen, nicht zu einem Fahrplan.
 *
 * Drei Stellschrauben, und alle drei waren vorher auf "neutral":
 *   - WELCHE Stimme. `getVoices()` liefert auf iOS ein knappes Dutzend
 *     deutscher Stimmen. Die erste ist irgendeine. Gesucht wird jetzt
 *     nach Namen, die Apple und Google fuer ihre freundlichen, weiblichen
 *     Ansagestimmen vergeben (Anna, Petra, Helena, Marlene) - und erst
 *     wenn keine da ist, faellt es auf "irgendeine deutsche" zurueck.
 *   - Wie SCHNELL. 0,92 war schon langsam; 0,88 gibt einem Kind Zeit,
 *     "Australien und Ozeanien" zu Ende zu hoeren.
 *   - Wie HOCH. `pitch` stand auf 1 (Voreinstellung). 1,15 klingt
 *     zugewandt statt vorlesend. Darueber wird es schrill.
 */
let stimme=null, tonAn=true, entsperrt=false;

/**
 * Welche Stimme?
 *
 * Auf jedem Geraet stehen ANDERE. Ein iPhone bringt je nach Fassung und
 * heruntergeladenen Stimmen ein knappes Dutzend deutscher mit, ein
 * Schreibtischbrowser oft nur eine. Eine feste Namensliste ist deshalb
 * nur eine Voreinstellung und kein Ergebnis - deswegen kann man die
 * Stimme im Elternbereich aussuchen UND vorher anhoeren. Die Wahl steht
 * in `Einst.stimme` und schlaegt die Liste.
 *
 * Die Reihenfolge hier ist keine Rangliste des Klangs, sondern der
 * Wahrscheinlichkeit: oben stehen die Namen, unter denen Apple und Google
 * ihre hellen, zugewandten Ansagestimmen fuehren.
 */
const LIEBLINGE = ['sandy','shelley','helena','anna','petra','marlene','katja',
                   'vicki','google deutsch'];
function alleStimmen(){
  return ('speechSynthesis' in window)
    ? speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('de')) : [];
}
// Der Name der gewaehlten Stimme steht hier und NICHT in `Einst`.
//
// Die Stimmensuche laeuft beim Laden - `voiceschanged` kann sofort feuern -,
// und `Einst` wird erst weiter unten deklariert. Ein `let` ist bis dahin
// nicht lesbar (temporale tote Zone), und die App startete mit
// „Cannot access 'Einst' before initialization" gar nicht mehr. Gefunden
// hat das der Rauchtest, sechzehnmal auf einmal.
let stimmenWunsch = null;
function stimmeSuchen(){
  const s = alleStimmen();
  stimme = (stimmenWunsch && s.find(v=>v.name===stimmenWunsch))
        || LIEBLINGE.map(n=>s.find(v=>v.name.toLowerCase().includes(n))).find(Boolean)
        || s.find(v=>v.localService) || s[0] || null;
}
if ('speechSynthesis' in window){ stimmeSuchen(); speechSynthesis.addEventListener('voiceschanged',stimmeSuchen); }
/**
 * Vorlesen - satzweise, nicht am Stueck.
 *
 * „Klasse! Das ist Australien und Ozeanien." als EINE Ausgabe klingt
 * heruntergelesen: die Sprachausgabe zieht ueber den Punkt hinweg. Als zwei
 * Ausgaben hintereinander entsteht die Pause von selbst, weil die
 * Warteschlange zwischen ihnen atmet - und genau diese Pause ist der
 * Unterschied zwischen einem Ansagetext und jemandem, der einen lobt.
 *
 * Die Tonhoehe stand auf 1,15. Das klang jung, aber gepresst; 1,06 traegt
 * die Freundlichkeit, ohne die Stimme zu verbiegen. Das Tempo bleibt
 * langsam - „Australien und Ozeanien" muss zu Ende gehoert werden koennen.
 */
const TEMPO = 0.9, HOEHE = 1.06;
function sprich(satz, hoehe = HOEHE){
  const u = new SpeechSynthesisUtterance(satz);
  u.lang='de-DE'; u.rate=TEMPO; u.pitch=hoehe;
  if (stimme) u.voice = stimme;
  speechSynthesis.speak(u);
}
function vorlesen(text){
  if(!tonAn||!('speechSynthesis' in window)||!text) return;
  try{ if(!entsperrt){ speechSynthesis.speak(new SpeechSynthesisUtterance('')); entsperrt=true; }
    speechSynthesis.cancel();
    // Der Jubel darf eine Spur hoeher liegen als die Sache danach. Das ist
    // der Unterschied zwischen „Klasse!" und „Klasse."
    const saetze = String(text).split(/(?<=[.!?])\s+/).filter(Boolean);
    saetze.forEach((satz, i) => sprich(satz,
      i === 0 && /!$/.test(satz) ? HOEHE + 0.08 : HOEHE));
  }catch(e){}
}

/**
 * Ansagen - fuer das Kind, das noch nicht liest.
 *
 * Fionas Profil traegt seit dem ersten Entwurf `vorlesen: true`, und es
 * wurde an KEINER Stelle abgefragt. Sie sah „Wie heisst dieses
 * Bundesland?" und vier Namen, und nichts davon sprach. Fuer eine
 * Sechsjaehrige, die noch nicht liest, war die App damit nicht zu bedienen -
 * sie konnte raten, welche Kachel wohin fuehrt.
 *
 * Unterschied zu `vorlesen()`: das hier gilt NUR fuer Kinder, die es
 * brauchen. Rueckmeldungen („Klasse!", der Name eines Gebiets) hoeren beide;
 * die Vorlesung eines ganzen Bildschirms will Lea nicht.
 *
 * Vor der Profilwahl ist noch kein Kind bekannt - dort wird angesagt, weil
 * gerade das Kind vor dem Bildschirm sitzt, das lesen koennte oder nicht.
 */
function ansagen(text){ if (!P || P.vorlesen) vorlesen(text); }

/** Eine Aufzaehlung, wie man sie spricht: „A, B, C oder D". */
const aufzaehlen = (namen) => namen.length < 2 ? (namen[0] || '')
  : namen.slice(0, -1).join(', ') + ' oder ' + namen[namen.length - 1];

/* ---------- Lob ---------------------------------------------------------
 *
 * "Richtig - Australien und Ozeanien!" ist eine Feststellung. Ein Kind,
 * das etwas geschafft hat, will gelobt werden, und zwar nicht jedes Mal
 * mit demselben Wort: das dritte "Richtig!" hintereinander hoert sich
 * niemand mehr an.
 *
 * Deshalb ein kleiner Vorrat, und dieselbe Zeile wird nie zweimal
 * hintereinander gezogen. Gewuerfelt wird ausdruecklich NICHT mit dem
 * Sitzungswuerfel: der ist gesaet, damit eine Sitzung wiederholbar ist -
 * das Lob soll gerade nicht vorhersagbar sein.
 */
const LOB = ['Super gemacht!', 'Ganz genau!', 'Richtig!', 'Klasse!',
             'Das stimmt!', 'Toll gemacht!', 'Perfekt!', 'Prima!'];
const FAST_LOB = ['Fast!', 'Ganz nah dran!', 'Beinahe!'];
let letztesLob = -1;
/* EIN Griff, nicht Wuerfeln bis es passt.
 *
 * Vorher stand hier `do { i = zufall } while (i === letztesLob)`. Das
 * terminiert nur, solange der Wuerfel sich AENDERT - und im Tor `ansicht`
 * ist `Math.random` festgenagelt, damit ein Vorbild reproduzierbar ist.
 * Ergebnis: nach der zweiten richtigen Antwort stand die Schleife, der
 * Hauptfaden mit ihr, und die Seite antwortete auf gar nichts mehr. Zwanzig
 * Minuten Torlauf ohne eine Zeile Ausgabe.
 *
 * Im Spiel wuerfelt niemand festgenagelt, der Fehler war also nie zu sehen.
 * Eine unbegrenzte Wiederholschleife im Anzeigefaden bleibt trotzdem eine:
 * sie hat keine obere Schranke, nur eine Wahrscheinlichkeit. Gezogen wird
 * jetzt aus allen AUSSER dem zuletzt gezogenen - ein Griff, immer fertig,
 * gleiche Verteilung.
 */
function lob(vorrat = LOB){
  if (vorrat.length < 2) { letztesLob = 0; return vorrat[0]; }
  const andere = vorrat.map((_, i) => i).filter(i => i !== letztesLob);
  const i = andere[Math.floor(Math.random() * andere.length)];
  letztesLob = i; return vorrat[i];
}

/* ---------- Profile und Ebenen ------------------------------------------ */
const PROFILE = {
  fiona:{ id:'fiona', name:'Fiona', alter:6, eingabe:['ziehen','sprechen'], vorlesen:true,
          kandidaten:4, laenderTiefe:3, sitzung:6, streng:false, farbe:'--f7' },
  lea:  { id:'lea', name:'Lea', alter:8, eingabe:['ziehen','tippen'], vorlesen:false,
          kandidaten:99, laenderTiefe:5, sitzung:8, streng:true, farbe:'--f5' },
};
// Die Laenderebenen kommen aus den Daten, nicht aus dieser Liste: sonst
// laufen sie auseinander. Genau das war passiert - gebacken und gezaehlt
// waren fuenf Kontinente, in der Ebenenwahl standen zwei.
const KONT_TITEL = { europa:'Europa', afrika:'Afrika', asien:'Asien',
  nordamerika:'Nordamerika', suedamerika:'Südamerika' };
// `ueber` ist die Zeile ueber dem Namen. Damit heisst die Kachel
// "Südamerika" statt "Länder in Südamerika" - das passt in eine Zeile,
// bricht nicht mitten im Wort ("Landeshauptstä/dte") und sagt trotzdem,
// worum es geht. `farbe` gibt jeder Ebene ihren eigenen Ton.
const EBENEN = [
  { id:'kontinente', ueber:'Die Welt', titel:'Kontinente', farbe:5 },
  ...Object.keys(D.laender).map((k,i)=>({ id:`laender:${k}`, ueber:'Länder in',
    titel: KONT_TITEL[k] || k, farbe:[3,2,4,7,6][i%5] })),
  { id:'bundeslaender', ueber:'Deutschland', titel:'Bundesländer',      farbe:1 },
    // "Hauptstädte" statt "Landeshauptstädte": das Wort passt nicht in die
  // Kachel und brach als "Landeshauptstäd/te" um. Die Ueberzeile sagt
  // schon "Deutschland", die Frage sagt "Hauptstadt von Hessen" - das
  // lange Wort trug hier nichts bei ausser einem Zeilenumbruch.
  { id:'hauptstaedte',  ueber:'Deutschland', titel:'Hauptstädte', farbe:2 },
  /* Das zweite Fach.
   *
   * `art` sagt, WIE gefragt wird - `karte` oder `rechnen`. Bis hierher gab
   * es nur die eine Sorte, und der Spielbildschirm war um eine Karte herum
   * gebaut. Eine Rechenaufgabe hat keine.
   *
   * `wer` sagt, WEM die Ebene gehört. Fiona rechnet Plus und Minus bis 10;
   * Leas Reihen sind die nächste Runde. Ohne das stünde auf beiden
   * Ebenenwahlen dieselbe Kachel, und eine davon wäre die falsche.
   *
   * `mischung` steht in `docs/Lernkiste-ABGLEICH-ANTON.md`, Reihe C, und
   * das Tor `doku` legt beides nebeneinander.
   */
  { id:'rechnen:plusminus', ueber:'Rechnen', titel:'Plus und Minus', farbe:4,
    art:'rechnen', wer:['fiona'], mischung: Rechnen.MISCHUNG_FIONA },
  /* Leas Reihen.
   *
   * `mischung` ist hier eine FUNKTION, nicht eine Tabelle: das Verhältnis
   * von Mal zu Geteilt hängt am Regler im Elternbereich und steht erst
   * beim Start der Sitzung fest. Eine Tabelle würde einmal beim Laden der
   * Datei gelesen — der Regler hätte dann bis zum nächsten Neustart der
   * App keine Wirkung, und niemand würde es merken.
   */
  { id:'rechnen:reihen', ueber:'Rechnen', titel:'Reihen 6 bis 10', farbe:6,
    art:'rechnen', wer:['lea'], mischung: () => Rechnen.mischungLea(Einst.reihenGeteilt) },
];

/* Die Fachwelten (D4).
 *
 * Erdkunde und Rechnen als zwei Welten mit eigenem Gesicht — und zwar als
 * eigene Ebene DARÜBER, so wie der Abgleich es sagt.
 *
 * Der erste Entwurf hat sie stattdessen auf EINEM Bildschirm gruppiert:
 * zwei getönte Gründe mit Überschrift, die Kacheln darin. Das Argument
 * dafür war, dass „Rechnen" je Kind nur eine Kachel hält und ein Tipper
 * zu einer einzigen Kachel keine Reise ist. `passt` hat widersprochen,
 * und zwar mit Zahlen: 14 Überläufe auf dem Zielgerät, bis zu 195 Punkte.
 * Zwei Weltenköpfe plus zwei Gründe kosten rund hundert Punkte Höhe, und
 * 844 × 390 hat sie nicht. Das Soll kommt aus der Referenz, nicht aus mir
 * — und das Maß vom Gerät, nicht aus meiner Vorstellung.
 *
 * Die Zuordnung wird ABGELEITET, nicht je Ebene hingeschrieben: `art`
 * sagt schon, wie gefragt wird. Ein zweites Feld daneben wäre dieselbe
 * Auskunft an zwei Orten, und eines von beiden veraltet.
 */
const WELTEN = [
  { id:'erdkunde', name:'Erdkunde', farbe:5 },
  { id:'rechnen',  name:'Rechnen',  farbe:4 },
];
const weltVon = (e) => e.art === 'rechnen' ? 'rechnen' : 'erdkunde';
/** Welche Welt zuletzt gewählt wurde — dorthin führt jeder Rückweg. */
let Welt = WELTEN[0].id;

/**
 * Der Umriss, den eine Kachel zeigt.
 *
 * Abgeleitet aus der Kennung, nicht je Ebene hingeschrieben — dieselbe
 * Regel wie bei den Welten. Und es ist der AEUSSERE Umriss: „Länder in
 * Afrika" zeigt Afrika, nicht fünf Länderflecken. Das ist nicht nur
 * kleiner, sondern richtiger — und der einzige Weg, der trägt: eine
 * Gruppe von Nachbarflächen zerfällt beim Ausdünnen in Scherben, weil
 * jede ihre gemeinsame Grenze anders verliert. Ein Kontinent ist EINE
 * Fläche und hält.
 *
 * Gebacken wird das in `prototyp/bauen.mjs`; die vollen Umrisse stehen
 * hier gar nicht zur Verfügung, weil `teilen()` sie aus dem Startbündel
 * herausschneidet.
 */
const SILHOUETTE = { erdkunde:'kontinente', kontinente:'kontinente',
                     bundeslaender:'deutschland', hauptstaedte:'deutschland' };

/* Die Rechenwelt hat keinen Umriss. Sie bekommt ihre ZEICHEN - sonst waere
   die halbe App bebildert und die andere Haelfte leer, und genau das sah
   im ersten Bauversuch nach einem Fehler aus.
   Gezeichnet statt gefuellt: deshalb eine eigene Klasse. */
const MATHESTRICH = {
  plus:  'M4 20h32M20 4v32',
  minus: 'M4 20h32',
  mal:   'M7 7l26 26M33 7L7 33',
  durch: 'M4 20h32M20 9.5v.01M20 30.4v.01',
};
const MATHEBILD = {
  'rechnen':           ['plus','mal'],
  'rechnen:plusminus': ['plus','minus'],
  'rechnen:reihen':    ['mal','durch'],
};

/**
 * Das Wasserzeichen einer Kachel - Umriss oder Rechenzeichen.
 *
 * Die GROESSE steht hier nicht: sie kommt aus dem Stylesheet, je
 * Kachelart einmal. Vorher stand sie als Prozentzahl am Aufruf, und der
 * Umriss lief bei 150 % ueber den Rand hinaus - Afrika war ein Fleck,
 * Deutschland ein Schmier. Ein Wasserzeichen, das man nicht erkennt, ist
 * Dekoration und keine Auskunft.
 */
function silhouette(ebeneId) {
  const zeichen = MATHEBILD[ebeneId];
  if (zeichen) {
    const teile = zeichen.map((n, i) =>
      `<path transform="translate(${i * 48} 0)" d="${MATHESTRICH[n]}"/>`).join('');
    return `<svg class="silhouette gezeichnet" viewBox="-4 -4 96 48"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="5" stroke-linecap="round">${teile}</svg>`;
  }
  const [art, kont] = ebeneId.split(':');
  const k = art === 'laender' ? kont : SILHOUETTE[art];
  const s = k && D.silhouetten && D.silhouetten[k];
  if (!s) return '';
  return `<svg class="silhouette" viewBox="${s.vb}" preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"><path d="${s.d}"/></svg>`;
}

/** Die Ebenen, die DIESEM Kind gehören. */
const meineEbenen = () => EBENEN.filter(e => !e.wer || e.wer.includes(P.id));
/** Wie wird auf dieser Ebene gefragt? Karte, wenn nichts anderes dasteht. */
const ebeneArt = (id) => EBENEN.find(e => e.id === id)?.art || 'karte';
/**
 * Wie beantwortet man eine Auswahl - durch ANTIPPEN oder durch ZIEHEN?
 *
 * Beides ist richtig, nur nicht fuer beide Kinder. Fuer Fiona ist das
 * Ziehen der eigentliche Lerninhalt: sie verbindet einen Namen mit einem
 * ORT auf der Karte. Lea kann das laengst - fuer sie ist derselbe Zug nur
 * ein Umweg, sie weiss die Antwort und will sie sagen koennen.
 *
 * Voreingestellt also: Lea tippt an, Fiona zieht. Umschalten laesst es sich
 * dort, wo es auffaellt - unter den Antworten, neben „Weiss ich nicht".
 * Und es gilt je KIND, nicht je Gerät: sonst stellt die eine der anderen
 * das Spiel um.
 */
const WEISE_VOREINSTELLUNG = { fiona:'ziehen', lea:'antippen' };
let P=null, Sitzung=null, Stand={}, Einst={ ton:true, abend:false, sprachmodus:false, pin:'0000',
  antwortweise:{ ...WEISE_VOREINSTELLUNG },
  stadtstaatenGezeigt:false, hauptstadtAuswahl:true,
  // Leas Regler und ihre Eingabeweise beim Rechnen. Beide gehören in die
  // Einstellungen und nicht ins Profil: das Profil sagt, WER spielt, die
  // Einstellung, wie es gerade eingestellt ist.
  reihenGeteilt: Rechnen.GETEILT_STANDARD, rechenweise:{} };

/* ---------- Aufgabenvorrat ---------------------------------------------- */
/**
 * In welcher Runde Fiona bei den Kontinenten steht.
 *
 * Das Konzept (Kapitel 4.1) gibt ihr drei aufeinander aufbauende Runden:
 * erst vier klar unterscheidbare Formen, dann der Nord/Sued-Gegensatz, zum
 * Schluss Antarktika mit seinem eigenen Satz. Im Code stand dafuer
 * `k.runde<=3` - und das ist IMMER wahr. Sie bekam von Anfang an alle
 * sieben; das Feld `runde` war Dekoration, und der Aufbau, der begruendet
 * ist, fand nicht statt.
 *
 * Die naechste Runde oeffnet, wenn jeder Kontinent der bisherigen mindestens
 * EINMAL richtig war (Fach 2). Nicht erst beim Aufkleber (Fach 3): der
 * braucht einen Tag Pause, und so lange soll niemand vor vier Kontinenten
 * sitzen.
 */
// Wieviele Runden es gibt, steht in den DATEN, nicht hier. Mit Antarktika
// fiel die dritte Runde weg; eine festgeschriebene 3 haette danach eine
// Runde gemeldet, die nichts Neues mehr bringt.
const RUNDEN = Math.max(...D.kontinente.map(k => k.runde));
function kontinentRunde(stand){
  let r = 1;
  while (r < RUNDEN) {
    const bisher = D.kontinente.filter(k => k.runde <= r);
    if (!bisher.every(k => Leitner.istGesessen(stand, k.id))) break;
    r++;
  }
  return r;
}

/**
 * Der Stand muss MITGEGEBEN werden koennen: die Ebenenwahl rechnet den
 * Fortschritt aller vier Ebenen aus, bevor eine davon geladen ist. Ohne das
 * las `kontinentRunde` den Stand der zuletzt gespielten Ebene und zeigte auf
 * der Kachel eine falsche Zahl.
 */
function vorrat(ebeneId, stand = Stand){
  const [art, kont] = ebeneId.split(':');
  if (art==='kontinente') {
    const bis = P.id==='fiona' ? kontinentRunde(stand) : RUNDEN;
    return D.kontinente.filter(k=>k.runde<=bis)
      .map(k=>({ id:k.id, name:k.name, aliasse:k.aliasse, aussprache:k.aussprache,
                 pfad:k.pfad, anker:k.anker }));
  }
  if (art==='laender')
    return D.laender[kont].filter(l=>l.rang<=P.laenderTiefe)
      .map(l=>({ id:l.a3, name:l.name, aliasse:l.aliasse, aussprache:l.aussprache,
                 pfad:l.pfad, anker:l.anker }));
  if (art==='bundeslaender')
    return D.deutschland.map(b=>({ id:b.id, name:b.name, aliasse:[], aussprache:[b.name.toLowerCase()],
      pfad:b.pfad, anker:b.anker }));
  // Erzeugt statt aufgelistet - hundert Rechenaufgaben schreibt niemand hin.
  // Die Kennung kommt aus der Aufgabe selbst (`p3+4`), damit der
  // Leitner-Stand über Sitzungen trägt.
  if (art==='rechnen') return kont==='reihen' ? Rechnen.reihenVorrat() : Rechnen.vorrat();
  if (art==='hauptstaedte')
    return D.deutschland.filter(b=>!b.stadtstaat).map(b=>({ id:b.id, name:b.hauptstadt,
      aliasse:[], aussprache:[b.hauptstadt.toLowerCase()], pfad:b.pfad, anker:b.anker,
      gebiet:b.name, ablenker:b.ablenker||[], falle:b.falle }));
  return [];
}
const NAMEN = {};
D.kontinente.forEach(k=>NAMEN[k.id]=k.name);
Object.values(D.laender).flat().forEach(l=>NAMEN[l.a3]=l.name);
D.deutschland.forEach(b=>NAMEN[b.id]=b.name);
// Auch die Rechenaufgaben: sonst steht im Elternprotokoll `p3+4` statt
// „3 + 4". Das Protokoll ist das eine, was Eltern wirklich lesen.
Rechnen.vorrat().forEach(r=>NAMEN[r.id]=r.frage);
Rechnen.reihenVorrat().forEach(r=>NAMEN[r.id]=r.frage);

const standSchluessel = (ebeneId)=>`${P.id}:${ebeneId}`;
async function standLaden(ebeneId){
  try { Stand = (await Ablage.hole('fortschritt', standSchluessel(ebeneId))) || Leitner.neuerStand(); }
  catch(e){ Stand = Leitner.neuerStand(); }
}
async function standSichern(ebeneId){
  try { await Ablage.setze('fortschritt', standSchluessel(ebeneId), Stand); } catch(e){}
}
async function einstLaden(){
  try { Einst = { ...Einst, ...(await Ablage.hole('einstellungen','alles') || {}) }; } catch(e){}
  tonAn = Einst.ton;
  stimmenWunsch = Einst.stimme || null; stimmeSuchen();
  document.documentElement.setAttribute('data-abend', Einst.abend ? 'an' : 'aus');
}
async function einstSichern(){ try{ await Ablage.setze('einstellungen','alles',Einst); }catch(e){} }

/* ---------- Bildschirmwechsel ------------------------------------------- */
function zeige(bau){
  Promise.resolve(bau()).then(neu=>{
    // ALLE bisherigen Bildschirme, nicht nur den sichtbaren. Wird zeige()
    // zweimal kurz hintereinander gerufen, bleibt sonst einer haengen -
    // im Elternbereich schimmerten drei Bildschirme uebereinander.
    const alte = [...buehne.querySelectorAll('.schirm')];
    neu.classList.add('schirm'); buehne.appendChild(neu);
    requestAnimationFrame(()=>{
      neu.classList.add('da');
      alte.forEach(a=>{ a.classList.remove('da'); setTimeout(()=>a.remove(),340); });
    });
  });
}

/* ---------- Profilwahl --------------------------------------------------- */
function profilwahl(){
  const s = el('div');
  s.innerHTML = kopf({ mitte:'<span class="marke">Smart Kids</span>', rechts:
      zeichenKnopf('ton', tonAn?'tonAn':'tonAus', tonAn?'Ton ausschalten':'Ton einschalten')
    + zeichenKnopf('abend', Einst.abend?'abend':'tag', Einst.abend?'Heller machen':'Dunkler machen') }) + `
    <div class="mitte">
      <div class="titel">Wer spielt?</div>
      <div class="wahl">${Object.values(PROFILE).map(p=>`
        <button class="kachel wer" data-profil="${p.id}" style="--ton:var(${p.farbe})">
          <div class="kreis" style="background:var(${p.farbe})">${p.name[0]}</div>
          <div class="name">${p.name}</div>
          <div class="rolle">${p.alter} Jahre · ${p.eingabe.includes('sprechen')?'sprechen und ziehen':'tippen und ziehen'}</div>
        </button>`).join('')}</div>
      <div class="bauzeile">Prototyp · Fassung ${BAU.fassung} · ${BAU.datum}</div>
    </div>`;
  s.querySelector('#ton').onclick=(e)=>{ tonAn=!tonAn; Einst.ton=tonAn; einstSichern();
    e.target.textContent=tonAn?'Ton an':'Ton aus'; };
  s.querySelector('#abend').onclick=(e)=>{ Einst.abend=!Einst.abend; einstSichern();
    document.documentElement.setAttribute('data-abend',Einst.abend?'an':'aus');
    e.target.textContent=Einst.abend?'Abend':'Tag'; };
  s.querySelectorAll('[data-profil]').forEach(b=>b.onclick=()=>{
    P=PROFILE[b.dataset.profil]; Ablage.setze('profile',P.id,{ id:P.id, zuletzt:Date.now() }).catch(()=>{});
    vorlesen(P.name); zeige(weltenwahl); });
  // Hier ist noch kein Kind gewaehlt - also wird immer angesagt. Wer lesen
  // kann, hoert einen Satz zuviel; wer nicht liest, kaeme sonst nicht los.
  ansagen(`Wer möchte spielen? ${aufzaehlen(Object.values(PROFILE).map(x=>x.name))}?`);
  return s;
}

/**
 * Der Stand jeder Ebene dieses Kindes.
 *
 * EIN Ort, weil ihn zwei Bildschirme brauchen: die Weltenwahl summiert
 * ihn je Welt, die Ebenenwahl zeigt ihn je Kachel. Zweimal gerechnet
 * hiesse zweimal anders gerechnet - genau so sind in diesem Verzeichnis
 * schon zwei Sternformeln entstanden.
 */
async function staende(){
  const aus = [];
  for (const e of meineEbenen()) {
    let st = {};
    try { st = (await Ablage.hole('fortschritt', `${P.id}:${e.id}`)) || {}; } catch(err){}
    aus.push({ ...e, ...Leitner.fortschritt(vorrat(e.id, st), st) });
  }
  return aus;
}

/** Der Kopf, den beide Wahlbildschirme tragen. Einmal geschrieben. */
const wahlKopf = (mitte) => kopf({ links: zurueckKnopf(), mitte:`<span class="marke">${mitte}</span>`,
  rechts: zeichenKnopf('buch','buch','Forscherbuch')
        + zeichenKnopf('eltern','eltern','Elternbereich') });

/* ---------- Weltenwahl: das Fach, bevor die Übung kommt ------------------ */
async function weltenwahl(){
  const s = el('div');
  const alle = await staende();
  const welten = WELTEN
    .map(w => ({ w, meine: alle.filter(b => weltVon(b) === w.id) }))
    .filter(x => x.meine.length);

  s.innerHTML = wahlKopf(P.name) + `
    <div class="mitte">
      <div class="titel">Was möchtest du üben?</div>
      <div class="wahl weltwahl">${welten.map(({ w, meine })=>{
        // Der Stand einer Welt ist die SUMME ihrer Ebenen, kein zweiter
        // Zähler. Der Balken braucht denselben Anteil wie eine Kachel,
        // also gewichtet mit der Größe der Ebene - sonst zählte eine
        // Ebene mit sechs Kontinenten so schwer wie eine mit hundert
        // Aufgaben.
        const gesamt    = meine.reduce((n, b) => n + b.gesamt, 0);
        const gesammelt = meine.reduce((n, b) => n + b.gesammelt, 0);
        const anteil    = gesamt ? meine.reduce((n, b) => n + b.anteil * b.gesamt, 0) / gesamt : 0;
        return `
        <button class="kachel bunt welt" data-welt="${w.id}" style="--ton:var(--f${w.farbe})">
          ${silhouette(w.id)}
          <div class="name">${w.name}</div>
          <div class="ueber">${meine.length} ${meine.length === 1 ? 'Übung' : 'Übungen'}</div>
          <div class="kachelfuss">
            <div class="stand">${kleberMarke(gesammelt, gesamt)}</div>
            ${fortschrittBalken({ gesammelt, gesamt, anteil })}
          </div>
        </button>`; }).join('')}</div>
    </div>`;

  s.querySelector('#zur').onclick=()=>zeige(profilwahl);
  s.querySelector('#buch').onclick=()=>zeige(forscherbuch);
  s.querySelector('#eltern').onclick=()=>zeige(elternTor);
  s.querySelectorAll('[data-welt]').forEach(b=>b.onclick=()=>{
    Welt = b.dataset.welt; zeige(ebenenwahl); });
  ansagen(`Was möchtest du üben? ${aufzaehlen(welten.map(x=>x.w.name))}?`);
  return s;
}

/* ---------- Ebenenwahl mit Fortschritt ----------------------------------- */
async function ebenenwahl(){
  const s = el('div');
  // Nur die Ebenen DIESER Welt. Ohne den Filter wäre die Weltenwahl eine
  // Zwischentür, die nichts zutut - und drei Runden später hätte niemand
  // mehr gewusst, wozu sie da war.
  const welt = WELTEN.find(w => w.id === Welt) || WELTEN[0];
  const balken = (await staende()).filter(b => weltVon(b) === welt.id);
  s.innerHTML = wahlKopf(welt.name) + `
    <div class="mitte">
      <div class="titel">Womit möchtest du anfangen?</div>
      <div class="wahl">${balken.map(b=>`
        <div class="kachelpaar">
        <button class="kachel bunt" data-ebene="${b.id}" style="--ton:var(--f${b.farbe})">
          ${silhouette(b.id)}
          <div class="ueber">${b.ueber}</div>
          <div class="name">${b.titel}</div>
          <div class="kachelfuss">
            <div class="stand">${sterne(sterneFuer(b.gesammelt, b.gesamt), 20)}${
              kleberMarke(b.gesammelt, b.gesamt)}</div>
            ${fortschrittBalken(b)}
          </div>
        </button>${b.gesammelt ? `
        <button class="leise mini" data-neu="${b.id}">von vorne</button>` : ''}</div>`).join('')}</div>
    </div>`;
  // Zurück führt in die Welt, nicht bis zur Profilwahl: sonst wäre die
  // Weltenwahl eine Tür, die nur in eine Richtung aufgeht.
  s.querySelector('#zur').onclick=()=>zeige(weltenwahl);
  s.querySelector('#buch').onclick=()=>zeige(forscherbuch);
  s.querySelector('#eltern').onclick=()=>zeige(elternTor);
  s.querySelectorAll('[data-ebene]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.ebene;
    if (id==='hauptstaedte' && !Einst.stadtstaatenGezeigt) zeige(()=>stadtstaaten(id));
    else starten(id); });

  // „Von vorne" - und zwar fuer das Kind, nicht hinter der Eltern-PIN.
  //
  // Wer alles gekonnt hat, kommt sonst nicht mehr an die Aufgaben heran:
  // die Ebene ist voll, und der einzige Weg zurueck ging ueber „Alles von
  // Fiona loeschen" im Elternbereich - das loescht das ganze Profil.
  //
  // Zwei Tipper, nicht einer: der Knopf steht direkt neben der Kachel, und
  // ein Fehlgriff wuerde eine Woche Uebung wegraeumen. Der zweite Tipper
  // sagt ausdruecklich, was verschwindet.
  s.querySelectorAll('[data-neu]').forEach(b=>b.onclick=async(ev)=>{
    ev.stopPropagation();
    const id = b.dataset.neu;
    const titel = balken.find(x=>x.id===id)?.titel || 'diese Ebene';
    if (b.dataset.sicher!=='ja'){
      s.querySelectorAll('[data-neu]').forEach(x=>{
        if (x!==b){ delete x.dataset.sicher; x.textContent='von vorne'; } });
      b.dataset.sicher='ja';
      // Kurz genug fuer EINE Zeile. „Wirklich? Kontinente von vorne" brach
      // auf dem iPhone quer um und schob die zweite Kachelreihe nach unten -
      // eine Nachfrage, die das Raster zerreisst, sieht aus wie ein Fehler.
      // Um WAS es geht, steht in der Kachel direkt darueber.
      b.textContent='Wirklich löschen?';
      vorlesen(`Soll ${titel} wirklich von vorne losgehen?`);
      return;
    }
    await Ablage.loesche('fortschritt', `${P.id}:${id}`).catch(()=>{});
    if (Sitzung && Sitzung.ebeneId===id) Stand = {};
    vorlesen(`${titel} fängt wieder von vorne an.`);
    zeige(ebenenwahl);
  });
  ansagen(`${welt.name}. Womit möchtest du anfangen? `
    + `${aufzaehlen(balken.map(b=>b.titel))}?`);
  return s;
}

/* ---------- Die Stadtstaaten-Lerneinheit --------------------------------- */
function stadtstaaten(danach){
  const s = el('div');
  const drei = D.deutschland.filter(b=>b.stadtstaat);
  s.innerHTML = kopf({ links: zurueckKnopf() }) + `
    <div class="mitte">
      <div class="titel">Drei sind anders</div>
      <div class="unter">Berlin, Hamburg und Bremen sind <strong>Stadtstaaten</strong>:
        die Stadt ist das ganze Bundesland. Sie haben keine eigene Hauptstadt —
        sie <em>sind</em> ihre Hauptstadt.</div>
      <div class="wahl eng">${drei.map((b,i)=>`
        <button class="kachel" data-lesen="${b.name}">
          <svg class="umriss" viewBox="${D.vbD}" aria-hidden="true">
            <path d="${b.pfad}" fill-rule="evenodd" fill="var(${VIER[i%4]})"
                  stroke="var(--tinte)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>
          <div class="name" style="font-size:var(--s1)">${b.name}</div>
        </button>`).join('')}</div>
      <button class="knopf" id="weiter" style="font-size:var(--s1);padding:var(--r3) var(--r8)">Verstanden</button>
    </div>`;
  s.querySelector('#zur').onclick=()=>zeige(ebenenwahl);
  s.querySelectorAll('[data-lesen]').forEach(b=>b.onclick=()=>vorlesen(b.dataset.lesen));
  s.querySelector('#weiter').onclick=()=>{ Einst.stadtstaatenGezeigt=true; einstSichern(); starten(danach); };
  vorlesen('Drei sind anders. Berlin, Hamburg und Bremen sind Stadtstaaten.');
  return s;
}

/* ---------- Sitzung starten ---------------------------------------------- */
/** Ein Keim, der sich reproduzieren laesst. Aus der Uhr geht das nicht. */
function keimAus(text){
  let h = 2166136261;
  for (let i=0;i<text.length;i++){ h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/**
 * Holt die Umrisse einer Laenderebene nach, falls sie noch fehlen.
 *
 * Im Bau als eine Datei ist alles schon da (`D.nachladen` fehlt dann) - die
 * Vorschau soll ohne Server laufen. Schlaegt das Holen fehl, sagt es das
 * statt still eine leere Karte zu zeigen.
 */
const geholt = new Set();
async function ebeneLaden(ebeneId){
  const [art, kont] = ebeneId.split(':');
  if (!D.nachladen) return true;

  // Deutschland liegt seit dem Tor `budget` ebenfalls draussen: 56 der 94 KB
  // eingebackener Geometrie gehoerten ihm, gebraucht fuer zwei von sechzehn
  // Ebenen. Beide holen dieselbe Datei; die zweite kommt aus dem Lager.
  if (art==='bundeslaender' || art==='hauptstaedte') {
    if (geholt.has('deutschland')) return true;
    try {
      const t = await (await fetch('./daten/deutschland.json')).json();
      // Ersetzt wird EINTRAGSWEISE, nicht die ganze Liste: der leichte
      // Stand haelt Name, Anker und Ort, und irgendwo steht laengst ein
      // Verweis darauf (NAMEN, die Ebenenwahl). Eine neue Liste liesse die
      // alten Eintraege ohne Umriss zurueck.
      const nach = new Map(t.deutschland.map(b => [b.id, b]));
      for (const b of D.deutschland) Object.assign(b, nach.get(b.id));
      D.vbD = t.vbD;
      geholt.add('deutschland');
      return true;
    } catch(e){ return false; }
  }

  if (art!=='laender' || geholt.has(kont)) return true;
  try {
    const t = await (await fetch(`./daten/laender-${kont}.json`)).json();
    D.laender[kont] = t.laender; D.umgebung[kont] = t.umgebung; D.vbL[kont] = t.vbL;
    geholt.add(kont);
    return true;
  } catch(e){ return false; }
}

async function starten(ebeneId){
  if (!(await ebeneLaden(ebeneId))) {
    zeige(()=>{ const s=el('div');
      s.innerHTML = kopf({ links: zurueckKnopf() }) + `
        <div class="mitte"><div class="titel">Diese Karte fehlt noch</div>
        <div class="unter">Sie wird beim ersten Mal aus dem Netz geholt.
          Probier es noch einmal, wenn du wieder Verbindung hast.</div></div>`;
      s.querySelector('#zur').onclick=()=>zeige(ebenenwahl); return s; });
    return;
  }
  await standLaden(ebeneId);
  const alle = vorrat(ebeneId);
  // Die Sitzungsnummer waechst, die Uhr nicht: gleicher Fortschritt +
  // gleiche Nummer = gleiche Aufgabenfolge. Ohne das laesst sich die
  // Lernlogik nur behaupten, nicht nachrechnen (Konzept K3, Kapitel 7).
  const nrSchluessel = `nr:${P.id}:${ebeneId}`;
  let nr = 0;
  try { nr = (await Ablage.hole('einstellungen', nrSchluessel)) || 0; } catch(e){}
  nr++;
  try { await Ablage.setze('einstellungen', nrSchluessel, nr); } catch(e){}
  const keim = keimAus(`${P.id}|${ebeneId}|${nr}`);
  const eb = EBENEN.find(e => e.id === ebeneId);
  /* Eine Sitzung je Rechenart, im vorgegebenen Verhältnis.
   *
   * Der Abgleich verlangt 80 % Addition. Der Leitner wählt aber nach
   * Fälligkeit, nicht nach Rechenart - liefe er einmal über den ganzen
   * Vorrat, käme das Verhältnis des VORRATS heraus (45 zu 55), nicht das
   * gewünschte. Also wird er je Art einmal gefragt, mit der Länge, die auf
   * sie entfällt, und danach gemischt: sonst kämen erst fünf Plus- und dann
   * eine Minusaufgabe, und die Reihenfolge wäre die Antwort.
   */
  // Eine Tabelle oder eine Funktion: Fionas Verhältnis steht fest, Leas
  // hängt am Regler und wird deshalb JETZT gerechnet, nicht beim Laden.
  const mischung = typeof eb?.mischung === 'function' ? eb.mischung() : eb?.mischung;
  const liste = mischung ? (() => {
    const arten = Object.entries(mischung);
    // Wieviele je Sorte: nach dem groessten Rest, nicht einzeln gerundet.
    // Der erste Entwurf legte den Rundungsrest auf die LETZTE Sorte - bei
    // Leas vier Sorten bekam sie damit an der Voreinstellung null
    // Divisionsaufgaben. Warum das so geloest ist, steht bei `verteilen`.
    const wieviel = Leitner.verteilen(P.sitzung, arten.map(([, a]) => a));
    let aus = [];
    arten.forEach(([rechenart], i) => {
      aus = aus.concat(Leitner.sitzung(alle.filter(x => x.rechenart === rechenart),
        Stand, wieviel[i], Date.now(), keim + i));
    });
    return mischenMit(aus, keim);
  })() : Leitner.sitzung(alle, Stand, P.sitzung, Date.now(), keim);
  // `glatt`: beim ERSTEN Versuch richtig, ohne Hilfe. Das ist die Zahl,
  // aus der die Sterne kommen - „richtig" allein waere auch die Aufgabe,
  // die nach zwei Fehlversuchen saß.
  // `wie[i]` haelt fest, WIE die i-te Aufgabe ausging - das Fortschrittsband
  // zeigt damit nicht nur wieviel geschafft ist, sondern wie es lief.
  // `richtig` und `versuche` standen hier auch noch, wurden bei jeder
  // Antwort hochgezaehlt und NIRGENDS gelesen - Reste der alten Sternformel.
  // Ein Zaehler, den niemand liest, ist kein Zustand, sondern eine Einladung
  // an die naechste Formel, sich an ihm zu bedienen: genau so kamen die zwei
  // Sternformeln zustande, die der Audit gefunden hat.
  Sitzung = { ebeneId, alle, liste, i:0, glatt:0, wie:[],
              aufkleber:0, keim, begonnen:Date.now() };
  zeige(ebeneArt(ebeneId) === 'rechnen' ? rechenschirm : spielschirm);
}

/** Gemischt, aber wiederholbar: derselbe Keim gibt dieselbe Reihenfolge. */
function mischenMit(liste, keim){
  let x = keim >>> 0;
  const r = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
  const b = liste.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

/* ---------- Was eine Antwort BEWIRKT ------------------------------------
 *
 * EIN Ort, für jede Aufgabenart. Die Aufgabenart entscheidet, OB die
 * Antwort richtig war - das ist ihre Sache, eine Karte fragt anders als ein
 * Rechenblatt. Was daraus FOLGT, entscheidet niemand mehr selbst: Leitner,
 * „glatt", das Fortschrittsband, der Aufkleber, die Ablage.
 *
 * Warum das eine eigene Funktion ist, obwohl es bisher gut in `bewerte()`
 * lag: weil es jetzt zwei Bildschirme gibt. Genau so sind in diesem
 * Verzeichnis schon einmal zwei Sternformeln entstanden - dieselbe Sache,
 * an zwei Stellen gerechnet, und bei vier von vier richtig zeigte der Kopf
 * einen Stern und der Endbildschirm drei.
 */
/* Der Ton zur Antwort (A2).
 *
 * EINE Stelle entscheidet, WIE eine Antwort klingt - ausgeloest wird sie
 * dort, wo die App ohnehin schon entscheidet, wie die Antwort ausging.
 * Der Ton haengt am selben Schalter wie die Sprache: wer „Ton aus" sagt,
 * meint nicht „nur die Stimme aus".
 *
 * Aufgeloeste Aufgaben bleiben STUMM. „Weiss ich nicht" ist kein Fehler,
 * und die App sagt dazu schon „Kein Problem" - ein Geraeusch obendrauf
 * machte aus dem Ausweg eine Niederlage. Eine „fast" richtige Antwort
 * ebenso: sie bekommt eine Rueckfrage, keine Wertung.
 */
function klangZu(ergebnis){
  if (!tonAn) return;
  if (ergebnis === 'richtig') Klang.richtig();
  else if (ergebnis === 'falsch') Klang.falsch();
}

function werten(ziel, ergebnis, versuch){
  const st = Sitzung;
  // Der richtige Ton fuer BEIDE Bildschirme, weil hier beide durchkommen.
  klangZu(ergebnis);
  const fachVorher = Stand[ziel.id]?.fach ?? 1;
  Stand = Leitner.verschieben(Stand, ziel.id, ergebnis === 'richtig', Date.now());
  if (ergebnis === 'richtig' && versuch === 1) st.glatt++;
  st.wie[st.i] = (ergebnis === 'richtig' && versuch === 1) ? 'glatt' : 'geschafft';
  const fachDanach = Stand[ziel.id]?.fach ?? fachVorher;
  const neuerAufkleber = fachVorher < Leitner.HAT_AUFKLEBER
                      && fachDanach >= Leitner.HAT_AUFKLEBER;
  if (neuerAufkleber) st.aufkleber++;
  standSichern(st.ebeneId);
  return neuerAufkleber;
}

/** Kopf nachziehen: Sterne und Fortschrittsband, auf jedem Bildschirm. */
function kopfNachziehenIn(s){
  const st = Sitzung;
  const st1 = s.querySelector('.sterne');
  if (st1) st1.outerHTML = sterne(sterneFuer(st.glatt, st.liste.length));
  const punkt = s.querySelectorAll('.band i')[st.i];
  if (punkt) punkt.className = st.wie[st.i] || 'weiter';
}

/** Der Kopf, den jede Aufgabe trägt - Band und Sterne aus einer Hand. */
const aufgabenKopf = (st) => kopf({
  links: schliessenKnopf('Übung beenden'),
  mitte:`<div class="band" aria-label="Aufgabe ${st.i+1} von ${st.liste.length}">${
    st.liste.map((_,i)=>`<i class="${
      i<st.i ? (st.wie[i]||'weiter') : i===st.i ? 'jetzt' : 'offen'}"></i>`).join('')
  }</div>`,
  rechts: sterne(sterneFuer(st.glatt, st.liste.length)) });

/**
 * Der Satz nach der Antwort. Auch der steht an EINER Stelle.
 *
 * Das Lob kommt zuerst und steht für sich. Die Sache danach - der Name oder
 * die Rechnung - ist das, was gelernt wird, nicht der Applaus.
 */
function lobsatz(s, sache, fastText, spruch, nebenbei, neuerAufkleber){
  const frage = s.querySelector('#frage');
  if (!frage) return;
  frage.innerHTML = fastText
    ? `<span class="fastText">${fastText}</span>`
    : `<span class="richtigText"><b class="jubel">${spruch || 'Richtig!'}</b> ${sache}</span>`
      + (neuerAufkleber ? `<span class="neuerkleber">Neuer Aufkleber!</span>` : '')
      + (nebenbei ? `<span class="nebenbei">${nebenbei}</span>` : '');
}

/* ---------- Der Rechenbildschirm ----------------------------------------
 *
 * Die Aufgabe OHNE Karte - der erste Bildschirm dieser App, der keine hat.
 *
 * Was er mit dem Kartenbildschirm teilt, teilt er wirklich: den Kopf mit
 * Band und Sternen (`aufgabenKopf`), die Wertung (`werten`), den Lobsatz
 * (`lobsatz`), das Nachziehen (`kopfNachziehenIn`), den Endbildschirm. Was
 * er selbst entscheidet, ist nur das eine, was hier anders ist: OB die
 * Antwort stimmt.
 *
 * ANGETIPPT, nicht gezogen — und das ist keine Bequemlichkeit. Auf der
 * Karte lernt das Ziehen etwas: dieser Name gehört an DIESEN Ort. `3 + 4`
 * hat keinen Ort. Eine Zahl in ein Kästchen zu schieben wäre Motorik ohne
 * Lehre, und der Abgleich sagt für Fionas Profil ausdrücklich „vier
 * Möglichkeiten zum Antippen". Der Umschalter „Lieber ziehen" erscheint
 * hier deshalb nicht.
 */
function rechenschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;

  /* Schreiben oder auswählen.
   *
   * Der Abgleich sagt es je Kind verschieden: Fiona tippt eine von vier
   * Zahlen an, Lea SCHREIBT das Ergebnis — „umschaltbar auf Auswahl".
   * Voreingestellt ist also das Profil, gemerkt wird je Kind.
   *
   * Beide Felder werden gebaut und eines versteckt, statt beim Umschalten
   * den Bildschirm neu zu bauen. Ein Neuaufbau setzte `versuch` zurück:
   * wer nach dem zweiten Fehlversuch umschaltet, bekäme drei neue
   * geschenkt — und die Auflösung nach drei Fehlern wäre nie erreichbar.
   */
  const kannTippen = P.eingabe.includes('tippen');
  let weise = kannTippen ? (Einst.rechenweise?.[P.id] || 'tippen') : 'auswahl';

  // Derselbe Mulberry32 wie bei den Hauptstädten, aus demselben Grund: ein
  // einfacher LCG legte die richtige Antwort zehnmal hintereinander auf
  // Platz 2 oder 3.
  const rnd = (k)=>{ let x=k>>>0; return ()=>{
    x=(x+0x6D2B79F5)>>>0;
    let t=Math.imul(x^(x>>>15), 1|x);
    t=(t+Math.imul(t^(t>>>7), 61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296; }; };
  const r1 = rnd(st.keim + st.i*7919);
  // `ablenkerFuer` entscheidet, nicht dieser Bildschirm: Plus und Minus
  // haben andere Versuchungen als das Einmaleins, aber das ist eine
  // Eigenschaft der Aufgabe, nicht der Anzeige.
  const zahlen = mischenMit([ziel.wert, ...Rechnen.ablenkerFuer(ziel, r1)], st.keim + st.i*7919);

  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">Wie viel ist das?</div>
    <div class="rechenfeld">
      <div class="rechnung">${ziel.frage} = <span class="luecke" id="luecke">?</span></div>
      <div class="zahlen" id="auswahl"${weise==='tippen'?' hidden':''}>${zahlen.map(z=>
        `<button class="zahl" data-zahl="${z}">${z}</button>`).join('')}</div>
      ${kannTippen ? `<div class="tippfeld" id="tippfeld"${weise==='tippen'?'':' hidden'}>
        <input class="eingabe zahl-eingabe" id="rein" inputmode="numeric"
               autocomplete="off" autocorrect="off" spellcheck="false"
               placeholder="?" aria-label="Ergebnis">
        <button class="knopf haupt" id="pruef">Prüfen</button>
      </div>` : ''}
      <div class="werkzeug"><button class="leise" id="weissnicht">Weiß ich nicht</button></div>
    </div>`;

  const luecke = s.querySelector('#luecke');
  const rein = s.querySelector('#rein');
  const ausschalten = ()=>{
    s.querySelectorAll('.zahl').forEach(z=>z.disabled=true);
    if (rein) { rein.disabled = true; s.querySelector('#pruef').disabled = true; }
  };

  function protokollieren(ergebnis, roh, fachVorher){
    Protokoll.schreiben(Protokoll.eintrag({
      zeit: Date.now(), profil: P.id, ebene: st.ebeneId, gebietId: ziel.id,
      eingabeart: weise==='tippen' ? 'tippen' : 'antippen',
      ergebnis, roheingabe: String(roh), sicherheit: null,
      dauerMs: Date.now()-beginn, versuch,
      fachVorher, fachNachher: Stand[ziel.id]?.fach ?? fachVorher,
    }));
  }

  function weiter(){
    st.i++;
    if (st.i>=st.liste.length) zeige(endschirm);
    else zeige(ebeneArt(st.ebeneId)==='rechnen' ? rechenschirm : spielschirm);
  }

  function aufloesen(grund){
    if (erledigt) return;
    erledigt = true;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', '', fachVorher);
    ausschalten();
    luecke.textContent = ziel.wert; luecke.classList.add('gefuellt');
    // Aufgelöst wird ohne Tadel — wie auf der Karte.
    const satz = `Kein Problem. ${ziel.frage} = ${ziel.wert}.`;
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="loesung">${satz}</span>`;
    vorlesen(`Kein Problem. ${ziel.geloest}.`);
    standSichern(st.ebeneId);
    setTimeout(weiter, 2600);
  }

  /** Das Geschriebene zu einer Zahl — oder zu nichts. */
  function gelesen(roh){
    const t = String(roh).trim().replace(/\s/g, '');
    if (!/^-?\d+$/.test(t)) return null;
    return +t;
  }

  function wackeln(k){
    if (!k) return;
    k.classList.remove('falsch'); void k.offsetWidth;
    k.classList.add('falsch');
    setTimeout(()=>k.classList.remove('falsch'), 900);
  }

  function bewerte(zahl, knopf){
    if (erledigt) return;
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (zahl === ziel.wert) {
      erledigt = true;
      const neuerAufkleber = werten(ziel, 'richtig', versuch);
      kopfNachziehenIn(s);
      protokollieren('richtig', zahl, fachVorher);
      ausschalten();
      luecke.textContent = ziel.wert; luecke.classList.add('gefuellt');
      if (knopf) knopf.classList.add('stimmt');
      const spruch = lob();
      lobsatz(s, `${ziel.frage} = ${ziel.wert}.`, null, spruch, '', neuerAufkleber);
      vorlesen(`${spruch} ${ziel.geloest}.` + (neuerAufkleber ? ' Neuer Aufkleber!' : ''));
      setTimeout(weiter, 2600);
      return;
    }
    protokollieren('falsch', zahl, fachVorher);
    klangZu('falsch');
    if (versuch >= 3) return aufloesen('dreimal');
    // Die Zahl sagt selbst, dass sie abgelehnt wurde - wie das Etikett auf
    // der Karte. Ein Satz allein reicht einer Sechsjährigen nicht.
    wackeln(knopf);
    const f = s.querySelector('#frage');
    const satz = 'Nicht ganz — probier es noch einmal.';
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    vorlesen(satz);
  }

  s.querySelectorAll('.zahl').forEach(k=>
    k.onclick = ()=> bewerte(+k.dataset.zahl, k));

  if (rein) {
    const pruefen = ()=>{
      const z = gelesen(rein.value);
      // Leer oder keine Zahl ist KEIN Fehlversuch. Ein Kind, das auf
      // „Prüfen" tippt, bevor es etwas geschrieben hat, hat sich nicht
      // verrechnet - es hätte sonst einen seiner drei Versuche an einem
      // Fehlgriff verloren.
      if (z === null) { wackeln(rein); rein.focus(); return; }
      bewerte(z, rein);
      rein.value = '';
    };
    s.querySelector('#pruef').onclick = pruefen;
    rein.addEventListener('keydown', e=>{ if (e.key==='Enter') pruefen(); });
    if (weise==='tippen') setTimeout(()=>rein.focus(), 360);
  }

  s.querySelector('#weissnicht').onclick = ()=> aufloesen('aufgegeben');
  s.querySelector('#zur').onclick = ()=> zeige(ebenenwahl);

  /* Der Umschalter steht nur da, wo er etwas zu schalten hat.
   *
   * Fiona kann nicht schreiben; für sie gäbe es nichts umzustellen, und
   * ein Knopf, der ihr das Zahlenfeld wegnimmt, wäre eine Falle. Er hängt
   * deshalb an `kannTippen`, nicht an der Ebene.
   *
   * Die WEISE steht als Datenfeld dran, nicht nur als Beschriftung —
   * derselbe Grund wie beim Umschalter auf der Karte: der Rauchtest muss
   * sie ablesen können, ohne einen deutschen Satz zu zerlegen.
   */
  if (kannTippen) {
    const um = el('button','leise');
    um.id = 'rechenweise';
    const beschriften = ()=>{ um.dataset.weise = weise;
      um.textContent = weise==='tippen' ? 'Lieber auswählen' : 'Lieber schreiben';
      um.setAttribute('aria-label', um.textContent); };
    beschriften();
    um.onclick = async ()=>{
      weise = weise==='tippen' ? 'auswahl' : 'tippen';
      Einst.rechenweise = { ...(Einst.rechenweise||{}), [P.id]: weise };
      await einstSichern();
      beschriften();
      s.querySelector('#auswahl').hidden = weise==='tippen';
      s.querySelector('#tippfeld').hidden = weise!=='tippen';
      if (weise==='tippen') rein.focus();
    };
    s.querySelector('.werkzeug').appendChild(um);
  }

  // Fiona liest noch nicht. Die Aufgabe UND die vier Möglichkeiten werden
  // gesagt - ohne die Möglichkeiten wüsste sie nicht, wonach sie greifen
  // kann. So steht es auch im Abgleich, Reihe C1. Wer schreibt, bekommt
  // keine Aufzählung vorgesagt: sie wäre die Antwort.
  ansagen(weise==='tippen' ? ziel.gesagt
    : `${ziel.gesagt} ${aufzaehlen(zahlen.map(z=>Rechnen.gesprochen(z)))}?`);
  return s;
}

/* ---------- Der Spielbildschirm ------------------------------------------ */
function spielschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const [art, kont] = st.ebeneId.split(':');
  const istHaupt = art==='hauptstaedte';
  // Auswahl mit VIER Moeglichkeiten - bei den Hauptstaedten und bei den
  // Bundeslaendern. Sechzehn Namen zu kennen ist die Aufgabe; sechzehn
  // Namen gleichzeitig zu lesen ist eine andere.
  const istAuswahl = istHaupt || art==='bundeslaender';
  const beginn = Date.now();
  let versuch = 0, erledigt = false;

  // Kandidaten: Ziel plus Ablenker. Bei Ebene 4 sind die Ablenker das
  // Eigentliche - fuenf Bundeslaender haben eine Hauptstadt, die NICHT ihre
  // groesste Stadt ist.
  // Mulberry32 statt eines einfachen linearen Kongruenzgenerators.
  //
  // Der LCG (x = x*1664525 + 1013904223) sieht fuer sich genommen zufaellig
  // aus, aber die Keime benachbarter Aufgaben liegen nur 7919 auseinander -
  // und bei einem LCG haengen die Ausgaben zu benachbarten Keimen linear
  // zusammen. Das Ergebnis: die richtige Stadt landete in zehn Aufgaben
  // hintereinander nur auf Platz 2 oder 3, nie auf 1 oder 4. Jede
  // Einzelpruefung war gruen - vier Staedte, eine richtig, eine aus dem
  // gleichen Land -, und die Aufgabe war trotzdem kaputt: wer raet, raet
  // in der Mitte.
  //
  // Mulberry32 verwuerfelt den Keim erst, bevor er zaehlt. Gefunden hat das
  // der Rauchtest, nicht das Auge.
  const rnd = (k)=>{ let x=k>>>0; return ()=>{
    x=(x+0x6D2B79F5)>>>0;
    let t=Math.imul(x^(x>>>15), 1|x);
    t=(t+Math.imul(t^(t>>>7), 61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296; }; };
  const misch=(a,r)=>{ const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
  const r1 = rnd(st.keim + st.i*7919);
  let kand;
  if (istHaupt) {
    // IMMER genau vier Staedte, genau eine richtig, Reihenfolge je Aufgabe
    // neu gewuerfelt.
    //
    // Die drei falschen sind nicht beliebig zusammengesucht:
    //
    // EINE kommt aus demselben Bundesland. Das ist die eigentliche Falle -
    // bei fuenf Laendern ist die groesste Stadt NICHT die Hauptstadt
    // (Frankfurt/Wiesbaden, Koeln/Duesseldorf, Leipzig/Dresden,
    // Halle/Magdeburg, Rostock/Schwerin). Dort steht der Irrtum, um den es
    // geht, also steht dort die erstgenannte Stadt fest. Bei den anderen
    // acht wechselt sie, damit die Aufgabe nicht auswendig zu lernen ist.
    //
    // ZWEI sind Hauptstaedte ANDERER Bundeslaender. Ohne sie stuenden vier
    // Namen aus derselben Ecke Deutschlands da, und das Kind koennte die
    // richtige an der Landsmannschaft erkennen statt am Wissen.
    const ausDemLand = ziel.ablenker || [];
    const gewaehlt = ausDemLand.length
      ? (ziel.falle ? ausDemLand[0] : ausDemLand[Math.floor(r1() * ausDemLand.length)])
      : null;
    const falle = gewaehlt
      ? [{ id:'x-'+gewaehlt, name:gewaehlt, aliasse:[], aussprache:[gewaehlt.toLowerCase()] }] : [];
    const fremd = misch(st.alle.filter(x=>x.id!==ziel.id), r1).slice(0, 3 - falle.length);
    kand = misch([ziel, ...falle, ...fremd], r1);
  } else {
    // Bei den Bundeslaendern immer vier, sonst nach Profil.
    const wieviel = art==='bundeslaender' ? 4 : Math.min(P.kandidaten, st.alle.length);
    const n = Math.min(wieviel, st.alle.length) - 1;
    kand = misch([ziel, ...misch(st.alle.filter(x=>x.id!==ziel.id), r1).slice(0, Math.max(1,n))], r1);
  }

  // Die Karte zeigt IMMER die ganze Welt - auch die Kontinente, die in
  // Fionas Runde noch nicht drankommen. Sonst fehlen auf ihrer Weltkarte
  // Asien und Nordamerika, und was uebrig bleibt, sieht nach kaputter Karte
  // aus statt nach einer Auswahl. Die Runde begrenzt, WONACH gefragt wird -
  // nicht, was es auf der Welt gibt.
  const alleKontinente = D.kontinente.map(k=>({ id:k.id, name:k.name, pfad:k.pfad, anker:k.anker }));
  const formen = art==='kontinente' ? alleKontinente : st.alle;
  const vb = art==='kontinente' ? D.vbK : art==='laender' ? D.vbL[kont] : D.vbD;
  const farbeVon=(g,i)=> (art==='bundeslaender'||istHaupt) ? `var(${VIER[(D.farben[g.id]??i)%4]})` : `var(${FL[i%7]})`;
  const umgebung = (art==='laender' && D.umgebung[kont])
    ? D.umgebung[kont].map(p=>`<path d="${p}" fill="var(--linie)" opacity=".55"/>`).join('') : '';
  // Drei Zustaende statt zwei: das gesuchte Gebiet, die schon gesessenen
  // (volle Farbe, sie bleiben stehen) und der Rest (gedaempft).
  //
  // Es kommt aus dem LEITNER-STAND, nicht aus der laufenden Sitzung.
  // Erst hatte es an der Sitzung gehangen - dann war die Karte nach jedem
  // Neustart wieder leer, und der Rauchtest hat es sofort gemeldet. Aus dem
  // Stand ueberlebt es das Schliessen der App, und es faellt auch wieder
  // zurueck, wenn ein Gebiet spaeter danebengeht. Genau das soll es.
  // „Sass schon einmal" - NICHT dasselbe wie „sicher" im Buch (Fach 5) und
  // nicht dasselbe wie „hat einen Aufkleber" (Fach 3). Die Schwelle steht
  // in src/kern/leitner.js neben den beiden anderen; hier stand sie als
  // nackte Zwei unter dem Namen `gekonnt`, den das Buch fuer Fach 5 benutzt.
  const gesessen = (id) => Leitner.istGesessen(Stand, id);
  const flaechen = formen.map((g,i)=>`<path class="geb ${
      g.id===ziel.id ? 'ziel' : gesessen(g.id) ? 'gesessen' : 'ruhig'}" data-id="${g.id}"
      d="${g.pfad}" fill-rule="evenodd" fill="${farbeVon(g,i)}"/>`).join('');
  // Ein Haken auf jedem Gebiet, das schon einmal sass. Farbe allein sagt "anders",
  // ein Haken sagt "geschafft" - und er trifft auch die, die Farben
  // schlecht unterscheiden.
  const haken = formen.filter(g=>g.anker && gesessen(g.id) && g.id!==ziel.id)
    .map(g=>`<g class="haken" data-x="${g.anker[0]}" data-y="${g.anker[1]}">
        <circle r="13" fill="var(--gut)" stroke="var(--papier)" stroke-width="2.5"/>
        <path d="M-6 0 L-2 4.5 L6.5 -4.5" fill="none" stroke="var(--papier)"
              stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`).join('');
  const konturen = formen.map(g=>`<path d="${g.pfad}" fill-rule="evenodd"/>`).join('');
  // Der Umriss des gesuchten Gebiets, zweimal: ein ruhiger dicker Rand und
  // darueber ein pulsierender. Ohne das ist bei sieben Pastellflaechen nicht
  // zu erkennen, welche gemeint ist.
  const zielForm = formen.find(g=>g.id===ziel.id) || ziel;
  // Der Zeiger wird in BILDSCHIRMPUNKTEN gezeichnet, nicht in
  // Kartenkoordinaten: sonst schrumpft er mit dem Massstab und ist auf
  // Thueringen nur noch ein blauer Fleck.
  const zeiger = zielForm.anker
    ? `<g class="zeiger" data-x="${zielForm.anker[0]}" data-y="${zielForm.anker[1]}">
         <path d="M0 -2 L-9 -17 L9 -17 Z" fill="var(--akzent)"/>
         <circle cy="-26" r="11" fill="var(--akzent)" stroke="white" stroke-width="2.5"/>
         <path d="M0 -32 L0 -21 M0 -18.5 L0 -18.4" stroke="white" stroke-width="2.6"
               stroke-linecap="round" fill="none"/>
       </g>` : '';
  // Ebene 4 fragt nach der Hauptstadt, nicht nach der Schreibweise. Eine Stadt
  // zu tippen, die man noch nie gesehen hat, prueft das Buchstabieren - nicht
  // das Wissen, um das es hier geht. Deshalb ist diese Ebene fuer BEIDE
  // Profile eine Auswahl. Im Elternbereich abschaltbar, dann tippt Lea auch
  // hier wieder.
  const tippt = P.eingabe.includes('tippen') && !(istAuswahl && Einst.hauptstadtAuswahl);
  const spricht = P.eingabe.includes('sprechen');
  // Antippen oder Ziehen - je Kind gemerkt, mit der Voreinstellung als
  // Rueckfall. `let`, weil der Umschalter sie mitten in der Aufgabe aendern
  // koennen muss, ohne den Bildschirm neu zu bauen: ein Neuaufbau wuerde
  // die begonnene Aufgabe zuruecksetzen.
  let weise = Einst.antwortweise?.[P.id]
    || WEISE_VOREINSTELLUNG[P.id] || 'ziehen';
  const frageText = istHaupt ? `Wie heißt die Hauptstadt von ${ziel.gebiet}?`
    : art==='kontinente' ? 'Wie heißt dieser Kontinent?'
    : art==='laender' ? 'Wie heißt dieses Land?' : 'Wie heißt dieses Bundesland?';
  const fach = Stand[ziel.id]?.fach ?? 1;

  s.innerHTML = `
    ${aufgabenKopf(st)}
    <div class="frage" id="frage">${frageText}</div>
    <div class="feld">
      <div class="karte" id="karte" style="--karte-ar:${(()=>{const v=vb.split(' ').map(Number);
        return (v[2]/v[3]).toFixed(4);})()}">
        <svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet">
          <defs><clipPath id="wasch"><circle id="waschKreis" cx="0" cy="0" r="900"
            style="transform-box:fill-box;transform-origin:center"/></clipPath></defs>
          <g id="umg">${umgebung}</g>
          <g id="fl">${flaechen}</g>
          <g id="haken">${haken}</g>
          <g id="fahne"></g>
          <g id="treffer"></g>
          <path id="belohn" d="" fill="var(--wasch)" clip-path="url(#wasch)" style="display:none"/>
          <g fill="none" stroke="var(--tinte)" stroke-opacity=".5" stroke-width="1.1"
             vector-effect="non-scaling-stroke">${konturen}</g>
          <path class="zielrand" d="${zielForm.pfad}" fill="none" fill-rule="evenodd"
                stroke="var(--tinte)" stroke-width="3.5" stroke-linejoin="round"
                vector-effect="non-scaling-stroke"/>
          <path class="zielpuls" d="${zielForm.pfad}" fill="none" fill-rule="evenodd"
                stroke="var(--akzent)" stroke-width="3" stroke-linejoin="round"
                vector-effect="non-scaling-stroke"/>
          ${zeiger}
          <path id="kontur" d="" fill="none" stroke="var(--tinte)" stroke-width="2.4"
                vector-effect="non-scaling-stroke" stroke-linejoin="round" style="display:none"/>
          <circle id="stadtpunkt" r="0" fill="var(--akzent)" stroke="white" stroke-width="2"
                  vector-effect="non-scaling-stroke" style="display:none"/>
        </svg>
      </div>
      <div class="seite" id="seite"></div>
    </div>`;

  const seite = s.querySelector('#seite');
  const liste = el('div','wahlliste'), werkzeug = el('div','werkzeug');
  seite.append(liste, werkzeug);

  /**
   * Zeigt die Loesung und geht weiter.
   *
   * Zwei Wege fuehren hierher: das Kind gibt auf (der leise Knopf), oder es
   * hat DREIMAL danebengelegen. Beides endet gleich - der Name erscheint am
   * Ort, wird vorgelesen, und die naechste Aufgabe kommt. Haengenbleiben
   * ist das Schlimmste, was einem Sechsjaehrigen an einer Uebung passieren
   * kann.
   *
   * Fuer den Leitner-Stand zaehlt es als NICHT gekonnt: gezeigt bekommen
   * ist nicht gewusst. Das Gebiet kommt bald wieder.
   */
  function aufloesen(grund){
    if (erledigt) return;
    erledigt = true;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehen();
    Protokoll.schreiben(Protokoll.eintrag({
      zeit: Date.now(), profil: P.id, ebene: st.ebeneId, gebietId: ziel.id,
      eingabeart: grund, ergebnis: 'gezeigt', roheingabe: '', sicherheit: null,
      dauerMs: Date.now()-beginn, versuch,
      fachVorher: Stand[ziel.id]?.fach ?? 1, fachNachher: Stand[ziel.id]?.fach ?? 1,
    }));
    s.querySelectorAll('.zielpuls,.zielrand,.zeiger').forEach(x=>x.style.display='none');
    nameAufDieKarte(s, ziel);
    // Aufgeloest wird ohne Tadel. Wer dreimal danebenlag oder aufgegeben
    // hat, hat schon genug Rueckmeldung bekommen; hier steht nur noch die
    // Antwort - mit einem Satz davor, der sie nicht wie ein Versagen
    // aussehen laesst.
    const f = s.querySelector('#frage');
    const satz = `Kein Problem. Das ist ${ziel.name}.`;
    if (f) f.innerHTML = `<span class="loesung">${satz}</span>`;
    vorlesen(satz);
    standSichern(st.ebeneId);
    setTimeout(()=>{ st.i++;
      if (st.i>=st.liste.length) zeige(endschirm); else zeige(spielschirm); }, 2600);
  }
  s.querySelector('#zur').onclick=()=>zeige(ebenenwahl);

  /**
   * Die Karte auf die groesste Flaeche setzen, die in den freien Platz passt.
   *
   * Das ist bewusst KEINE Stilregel: CSS kann die eine Achse nicht gegen die
   * andere abwaegen. `aspect-ratio` mit `width:100%` macht die Hoehe richtig
   * und laesst die Breite stehen; mit `height:100%` genau andersherum. Beides
   * hinterlaesst ein Loch neben der Karte - gemessen war der Kasten auf dem
   * iPhone quer 420 Punkte breit, gezeichnet wurden 213.
   *
   * Hier ist beides bekannt: der freie Platz und das Seitenverhaeltnis der
   * Karte. Ein `Math.min` genuegt, und die Karte fuellt ihren Kasten immer
   * ganz - Deutschland (0,74) wie die Weltkarte (1,67).
   */
  function kartenGroesse(){
    const feld = s.querySelector('.feld'), kasten = s.querySelector('.karte');
    const svg = kasten && kasten.querySelector('svg');
    if (!feld || !svg) return;
    const vb = svg.viewBox.baseVal;
    if (!vb.width || !vb.height) return;
    const fb = feld.getBoundingClientRect();
    const sb = s.querySelector('.seite').getBoundingClientRect();
    const quer = getComputedStyle(feld).flexDirection === 'row';
    const luecke = parseFloat(getComputedStyle(feld).columnGap) || 0;
    const frei = {
      b: quer ? fb.width - sb.width - luecke : fb.width,
      h: quer ? fb.height : fb.height - sb.height - luecke,
    };
    if (frei.b <= 0 || frei.h <= 0) return;
    const k = Math.min(frei.b / vb.width, frei.h / vb.height);
    kasten.style.width  = (vb.width  * k).toFixed(1) + 'px';
    kasten.style.height = (vb.height * k).toFixed(1) + 'px';
  }

  const MIN_PT = 44, MIN_REST = 20;
  function trefferflaechen(){
    const svg=s.querySelector('.karte svg'); if(!svg) return;
    const g=svg.querySelector('#treffer'); const ctm=svg.getScreenCTM(); if(!g||!ctm) return;
    const k=Math.abs(ctm.a)||1;
    const mit = formen.filter(x=>x.anker).map(x=>{
      const p=s.querySelector(`path.geb[data-id="${x.id}"]`); const bb=p?p.getBBox():{width:0,height:0};
      return { x, gross:Math.max(bb.width,bb.height) };
    }).sort((a,b)=>b.gross-a.gross);

    // Ein Trefferkreis darf den Anker eines ANDEREN Gebiets nicht
    // verschlucken. Berlins 44-Punkt-Kreis lag genau auf Brandenburgs Anker -
    // und Brandenburg war an seiner besten Stelle nicht mehr zu treffen.
    // "Das kleinere gewinnt" heisst nicht "das kleinere sperrt aus".
    // Der Zeiger hilft bei kleinen Gebieten und stoert bei grossen.
    const zg = s.querySelector('.zeiger');
    if (zg) {
      const zp = s.querySelector(`path.geb[data-id="${ziel.id}"]`);
      const zb = zp ? zp.getBBox() : {width:0,height:0};
      const gross = Math.max(zb.width, zb.height) * k;
      zg.style.display = gross < 190 ? '' : 'none';
      // Feste Groesse am Bildschirm: 1/k hebt den Kartenmassstab auf.
      const px = 1 / k;
      const x = +zg.dataset.x, y = +zg.dataset.y;
      const oben = (zb.height * k < 44) ? -zb.height/2 - 4*px : 0;   // ueber winzigen Flaechen
      zg.setAttribute('transform', `translate(${x} ${y + oben}) scale(${px.toFixed(3)})`);
    }
    // Haken in fester Bildschirmgroesse, wie der Zeiger: sonst sind sie auf
    // der Weltkarte winzig und auf Bremen riesig.
    s.querySelectorAll('.haken').forEach(h=>{
      h.setAttribute('transform',
        `translate(${h.dataset.x} ${h.dataset.y}) scale(${(1/k).toFixed(3)})`);
    });

    g.innerHTML = mit.filter(n=>n.gross*k<MIN_PT).map(n=>{
      let rPx = MIN_PT/2;
      for (const m of mit) {
        if (m.x.id === n.x.id) continue;
        const d = Math.hypot(n.x.anker[0]-m.x.anker[0], n.x.anker[1]-m.x.anker[1]) * k;
        if (d > 0) rPx = Math.min(rPx, d * 0.55);
      }
      rPx = Math.max(rPx, MIN_REST/2);
      return `<circle data-id="${n.x.id}" cx="${n.x.anker[0]}" cy="${n.x.anker[1]}"
        r="${(rPx/k).toFixed(1)}" fill="transparent" style="pointer-events:all"/>`;
    }).join('');
  }

  if (tippt) {
    const eing=el('input','eingabe'); eing.type='text'; eing.autocapitalize='off';
    eing.autocorrect='off'; eing.spellcheck=false; eing.placeholder='hier schreiben';
    eing.setAttribute('inputmode','text');
    const hin=el('div');
    const ok=el('button','knopf'); ok.style.justifyContent='center'; ok.style.fontSize='var(--s0)';
    ok.textContent='Prüfen';
    liste.append(eing, ok, hin);
    const p=()=>bewerte(eing.value,'tippen',{eing,hin});
    ok.onclick=p; eing.addEventListener('keydown',e=>{ if(e.key==='Enter')p(); });
    setTimeout(()=>eing.focus(),360);
  } else {
    kand.forEach((k,i)=>{ const b=el('div','etikett'); b.textContent=k.name; b.dataset.id=k.id;
      // Der Rang steuert, wann das Etikett hereinkommt. Nacheinander statt
      // alle auf einmal: das Auge folgt der Liste von oben nach unten,
      // statt vier Kaesten gleichzeitig aufblitzen zu sehen.
      b.style.setProperty('--rang', i + 1);
      // Antippen ANTWORTET oder liest vor - je nach Weise. Gezogen werden
      // kann in beiden: das Ziehen bleibt immer da, die Weise entscheidet
      // nur, was ein Tipper bedeutet. Wer im Antipp-Modus trotzdem zieht,
      // soll nicht ins Leere greifen.
      b.onclick=()=>{ if (weise==='antippen' && !erledigt) bewerte(k.name,'antippen',{ etikett:b });
                      else vorlesen(k.name); };
      ziehbar(b,k); liste.appendChild(b); });
  }

  // Der leise Ausweg. Er steht bewusst klein und ohne Farbe da: er soll
  // erreichbar sein, aber nicht einladen.
  const weiter = el('button','leise');
  weiter.id = 'ueberspringen';
  weiter.textContent = 'Weiß ich nicht';
  weiter.onclick = ()=>aufloesen('uebersprungen');
  werkzeug.appendChild(weiter);

  // Der Umschalter steht nur dort, wo er etwas zu schalten hat: bei einer
  // Auswahl mit Etiketten. Beim Tippfeld gibt es nichts umzuschalten.
  if (!tippt) {
    const um = el('button','leise');
    um.id = 'weise';
    // Die WEISE steht als Datenfeld dran, nicht nur als Beschriftung. Der
    // Rauchtest spielt jede Ebene so durch, wie das Kind sie spielt - und
    // dafuer muss er die Weise ablesen koennen, ohne einen deutschen Satz
    // zu zerlegen.
    const beschriften = ()=>{ um.dataset.weise = weise;
      um.textContent = weise==='antippen' ? 'Lieber ziehen' : 'Lieber antippen';
      um.setAttribute('aria-label', um.textContent); };
    beschriften();
    um.onclick = async ()=>{
      weise = weise==='antippen' ? 'ziehen' : 'antippen';
      Einst.antwortweise = { ...(Einst.antwortweise||{}), [P.id]: weise };
      await einstSichern();
      beschriften();
      vorlesen(weise==='antippen' ? 'Jetzt kannst du antippen.' : 'Jetzt kannst du ziehen.');
    };
    werkzeug.appendChild(um);
  }

  // Das Mikrofon wird nur gezeigt, wenn es auch etwas TUT.
  //
  // Vorher stand es immer da, grau, mit dem Satz "Sprachmodus ist aus. Im
  // Elternbereich einschalten." darunter - eine Anweisung an die Eltern,
  // auf dem Spielbildschirm des Kindes. Zusammen kosteten die beiden bis
  // zu 120 Punkte Hoehe, und die Karte hatte sie noetig: sie fuellte im
  // Hochformat nur 16 bis 45 Prozent des Feldes.
  //
  // Ein dauerhaft abgeschalteter Knopf ist kein Hinweis, sondern ein
  // Hindernis. Wo es wirklich nicht geht - der Browser kann es nicht -,
  // bleibt der Hinweis stehen; das ist eine Auskunft und keine Aufforderung.
  const Erk = window.SpeechRecognition || window.webkitSpeechRecognition;
  const kannSprechen = spricht && Einst.sprachmodus;
  if (spricht && !Erk && Einst.sprachmodus) {
    const status=el('div','unter'); status.style.fontSize='var(--s-klein)';
    status.textContent='Sprechen geht in diesem Browser nicht — sag es laut, dann zieh.';
    werkzeug.appendChild(status);
  }
  if (kannSprechen && Erk) {
    const mik=el('button','mikro',MIKRO);
    const status=el('div','unter'); status.style.fontSize='var(--s-klein)';
    {
      mik.onclick=()=>{
        const e=new Erk(); e.lang='de-DE'; e.interimResults=false; e.maxAlternatives=3;
        status.textContent='… ich höre';
        e.onresult=(ev)=>{ const roh=ev.results[0][0].transcript;
          status.textContent=`gehört: „${roh}“`; bewerte(roh,'sprechen',{status}); };
        e.onerror=()=>{ status.textContent='Das hat nicht geklappt — sag es noch einmal.'; };
        try{ e.start(); }catch(err){ status.textContent='Mikrofon nicht verfügbar.'; }
      };
    }
    werkzeug.appendChild(mik); liste.appendChild(status);
  }

  /**
   * Wohin zeigt der Finger? MIT Nachsicht.
   *
   * Gemessen am gebauten Spiel: wer mehr als **16 Bildpunkte** neben
   * Australien losliess, loeste gar nichts aus - kein Hinweis, kein
   * Protokolleintrag, keine Bewegung. Fuer eine Sechsjaehrige mit dem
   * Daumen auf einem Telefon ist das der Normalfall, nicht die Ausnahme,
   * und sie erfaehrt nie warum.
   *
   * Nachsicht heisst hier NICHT "die Flaeche wird groesser gerechnet".
   * Getestet wird weiter mit echtem Treffertest an echten Umrissen - nur
   * eben nicht an einem Punkt, sondern auf Ringen um ihn herum, von innen
   * nach aussen. Der erste Treffer gewinnt, also gewinnt immer das
   * naechstgelegene Gebiet. Die Form bleibt die Form; nur der Finger darf
   * dicker sein als ein Bildpunkt.
   *
   * Der Ring hoert bei NACHSICHT auf. Ohne Grenze traefe jeder Wurf
   * irgendetwas, und ein Fehlgriff mitten im Meer wuerde als falsche
   * Antwort gewertet - das kostet einen der drei Versuche fuer etwas, das
   * gar keine Antwort war.
   */
  const NACHSICHT = 60;                      // Bildpunkte
  function zielUnter(x, y){
    const treffer = (px, py) => {
      const e = document.elementFromPoint(px, py);
      if (!e || !e.closest) return null;
      // Der Trefferkreis zuerst: er existiert genau fuer die Gebiete, die
      // zu klein sind, um sie zu treffen. Er darf nicht vom Nachbarland
      // ueberstimmt werden, ueber dem er liegt.
      const kreis = e.closest('#treffer circle');
      if (kreis) return kreis.dataset.id;
      const pfad = e.closest('path.geb');
      return pfad ? pfad.dataset.id : null;
    };
    const genau = treffer(x, y);
    if (genau) return { id: genau, genau: true };
    for (let r = 10; r <= NACHSICHT; r += 10) {
      for (let i = 0; i < 16; i++) {
        const w = i * Math.PI / 8;
        const id = treffer(x + Math.cos(w) * r, y + Math.sin(w) * r);
        if (id) return { id, genau: false };
      }
    }
    return null;
  }

  /**
   * Was unter dem Finger liegt, leuchtet auf.
   *
   * Nachsicht ohne Anzeige waere Zauberei: das Kind laesst los und die App
   * entscheidet etwas, das es nicht gesehen hat. Mit Anzeige ist es nur
   * eine groessere Zielscheibe - man SIEHT vor dem Loslassen, was gilt.
   */
  let drueber = null;
  function drueberSetzen(id){
    if (drueber === id) return;
    const alt = drueber && s.querySelector(`path.geb[data-id="${drueber}"]`);
    if (alt) alt.classList.remove('drueber');
    drueber = id;
    const neu = id && s.querySelector(`path.geb[data-id="${id}"]`);
    if (neu) neu.classList.add('drueber');
  }

  /**
   * Wo haengt das Etikett, waehrend es gezogen wird?
   *
   * NICHT unter dem Finger. Ein Bildschirmfoto vom iPhone quer zeigt den
   * Grund: das Etikett "Australien und Ozeanien" ist 240 x 160 Punkte
   * gross, Australien auf der Weltkarte 60 x 50 - mittig am Finger deckt
   * das Etikett sein eigenes Ziel VOLLSTAENDIG zu. Das Aufleuchten nuetzt
   * dann nichts, weil niemand es sieht.
   *
   * Es haengt deshalb UNTER dem Finger, waagerecht mittig. Oben bleibt
   * frei, und genau dort liegt die Karte. Passt es unten nicht mehr hin,
   * klappt es nach oben; seitlich wird es ins Fenster geschoben.
   */
  const LUFT = 22;
  function haengen(basis, gross, x, y){
    let dy = y + LUFT - basis.top;
    if (basis.top + dy + gross.h > innerHeight - 4) dy = y - LUFT - gross.h - basis.top;
    const links = Math.max(4, Math.min(x - gross.b/2, innerWidth - gross.b - 4));
    return `translate3d(${(links - basis.left).toFixed(1)}px,${dy.toFixed(1)}px,0) rotate(-1.5deg)`;
  }

  function ziehbar(b,k){
    // Nicht `setPointerCapture`: das Etikett klebt am Finger und faengt
    // damit jeden Treffertest ab. Es hoert waehrend des Zuges auf,
    // anfassbar zu sein (`.zieht{pointer-events:none}`) - und dann liefe
    // der Fang ins Leere. Das Fenster hoert stattdessen zu; das haelt den
    // Zug auch, wenn der Finger das Etikett verlaesst.
    //
    // Aufgehoben wird erst nach 6 Punkten Weg. Vorher ist es ein Tippen,
    // und Tippen soll den Namen vorlesen, nicht das Etikett verschieben -
    // sonst zuckt es bei jeder Beruehrung.
    let start=null, heim=null, zeiger=null, auf=false, zug=null;
    // Das Etikett folgt dem Finger in JEDEM Ereignis - das ist billig und
    // darf nicht ruckeln. Die Umkreissuche dagegen kostet ueber dem Meer
    // bis zu 96 Treffertests, und jeder davon erzwingt einen Durchlauf des
    // Stylings. Einmal je Bild reicht: schneller als das Auge ist ohnehin
    // keine Anzeige.
    let angemeldet=false, zuletzt=null;
    // Beim Aufheben wird aus der Antwortkachel ein SCHILD.
    //
    // Die Kachel ist 240 x 160 Punkte gross ("Australien und Ozeanien"
    // bricht auf zwei Zeilen), Australien auf der Weltkarte 60 x 50 - am
    // Finger deckt sie mehrere Gebiete auf einmal zu. Als einzeiliges
    // Schild ist sie rund ein Drittel so gross. Die Breite wird deshalb
    // NICHT festgehalten: ohne Breite schrumpft ein `position:fixed`
    // Kasten auf seinen Inhalt.
    const aufheben=()=>{ auf=true;
      // Die Einlauf-Animation muss WEG, bevor das Schild dem Finger folgt.
      //
      // Eine CSS-Animation steht in der Kaskade ueber dem Inline-Stil - auch
      // wenn sie laengst abgelaufen ist und nur noch ihren Endzustand haelt
      // (`both`). `herein` endet auf `transform: none`, und genau das ist
      // die Eigenschaft, mit der das Schild am Finger haengt. Das Ergebnis
      // sah harmlos aus: das Ziel leuchtete richtig auf (die Suche haengt am
      // Finger, nicht am Schild), nur das Schild blieb in der Liste stehen.
      // Kein Tor hat es gesehen, und im erneuerten Vorbild stand es drin.
      b.style.animation='none';
      b.classList.add('zieht'); b.style.position='fixed';
      b.style.left=heim.left+'px'; b.style.top=heim.top+'px'; b.style.margin='0';
      const z=b.getBoundingClientRect(); zug={b:z.width,h:z.height};
      vorlesen(k.name); };
    const bewegen=(ev)=>{ if(!start||ev.pointerId!==zeiger) return;
      if(!auf){ if(Math.hypot(ev.clientX-start.x, ev.clientY-start.y) < 6) return; aufheben(); }
      b.style.transform = haengen(heim, zug, ev.clientX, ev.clientY);
      zuletzt={x:ev.clientX,y:ev.clientY};
      if (angemeldet) return;
      angemeldet=true;
      requestAnimationFrame(()=>{ angemeldet=false;
        if(!start||!zuletzt) return;
        const t = zielUnter(zuletzt.x, zuletzt.y);
        drueberSetzen(t ? t.id : null);
      });
    };
    const aufraeumen=()=>{
      b.classList.remove('zieht'); b.style.position=''; b.style.left='';
      b.style.top=''; b.style.width=''; b.style.margin=''; b.style.transform='';
      b.style.animation='';
      drueberSetzen(null); start=null; zeiger=null; auf=false; zug=null;
      removeEventListener('pointermove',bewegen);
      removeEventListener('pointerup',los);
      removeEventListener('pointercancel',abbruch);
    };
    const abbruch=()=>aufraeumen();
    const los=(ev)=>{ if(!start||ev.pointerId!==zeiger) return;
      // Nie aufgehoben: das war ein Tippen. Der Klickhandler liest vor.
      if(!auf){ aufraeumen(); return; }
      const t = zielUnter(ev.clientX, ev.clientY);
      const von = b.getBoundingClientRect();
      aufraeumen();
      if (t) { bewerte(k.name,'ziehen',{ etikett:b, getroffen:t.id }); return; }
      // Ins Leere gezogen. Das ist keine falsche Antwort - es war gar
      // keine. Es kostet keinen Versuch, aber es bleibt sichtbar: das
      // Etikett fliegt an seinen Platz zurueck und sagt, was fehlt.
      zurueckFliegen(b, von);
      const h = liste.querySelector('.hinweis') || liste.appendChild(el('div','hinweis'));
      h.className='hinweis nochmal';
      // Kurz genug fuer eine Zeile: der Satz stand auf dem iPhone quer
      // zweizeilig am unteren Rand und schob die Antwortliste hoch.
      h.textContent='Lass es auf dem Land los.';
      vorlesen('Lass es auf dem Land los.');
    };
    b.addEventListener('pointerdown',ev=>{
      if(b.classList.contains('weg')||start) return;
      start={x:ev.clientX,y:ev.clientY};
      zeiger=ev.pointerId; heim=b.getBoundingClientRect(); auf=false;
      addEventListener('pointermove',bewegen);
      addEventListener('pointerup',los);
      addEventListener('pointercancel',abbruch);
    });
  }

  /** Das Etikett fliegt sichtbar an seinen Platz zurueck statt zu blinken. */
  function zurueckFliegen(b, von){
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nach = b.getBoundingClientRect();
    const dx = von.left - nach.left, dy = von.top - nach.top;
    if (!dx && !dy) return;
    b.animate([{ transform:`translate3d(${dx}px,${dy}px,0) scale(1.06)` },
               { transform:'none' }],
      { duration: 260, easing:'cubic-bezier(.2,0,0,1)' });
  }

  /**
   * Kopf nachziehen, sobald geantwortet wurde.
   *
   * Der Bildschirm wird je Aufgabe EINMAL gebaut - der Kopf zeigte damit
   * immer den Stand VOR der laufenden Antwort. Nachgespielt: vier von vier
   * richtig, und der Kopf stand bei zwei Sternen, waehrend der
   * Endbildschirm drei zeigte. Ein Fortschritt, der erst beim naechsten
   * Bild nachkommt, ist keine Rueckmeldung, sondern eine Verzoegerung.
   */
  const kopfNachziehen = () => kopfNachziehenIn(s);

  /* --- Bewertung. EIN Ort, egal welcher Eingabeweg. --- */
  async function bewerte(roh, eingabeart, ctx){
    if (erledigt) return;
    versuch++;
    let ergebnis='falsch', text='', sicherheit=null, nebenbei='';
    // Vor der Wertung gelesen: `werten()` verschiebt das Fach, und das
    // Protokoll will beide Stände. Die Zeile stand früher weiter unten,
    // mitten in der Wertung - beim Herauslösen ist sie mitgegangen, und
    // der Rauchtest hat den Fehler in derselben Minute gemeldet:
    // „ReferenceError: fachVorher is not defined", zwölfmal.
    const fachVorher = Stand[ziel.id]?.fach ?? 1;

    if (eingabeart==='antippen') {
      // Angetippt heisst: „DAS ist der Name." Wohin gezogen wurde, gibt es
      // hier nicht - das gesuchte Gebiet steht schon hervorgehoben auf der
      // Karte, die Frage ist nur, wie es heisst.
      if (roh===ziel.name) ergebnis='richtig';
      else text='Nicht ganz — probier es noch einmal.';
    } else if (eingabeart==='ziehen') {
      if (ctx.getroffen===ziel.id && roh===ziel.name) ergebnis='richtig';
      else if (roh===ziel.name) text='Fast! Der Name stimmt — aber das ist ein anderes Gebiet.';
      else text='Nicht ganz — probier es noch einmal.';
    } else if (eingabeart==='tippen') {
      // Das ganze Gebiet, nicht nur sein Name - sonst zaehlt kein Alias.
      const r = Vergleich.rechtschreibung(roh, ziel);
      if (r.urteil==='richtig') { ergebnis='richtig'; nebenbei = r.nebenbei || ''; }
      else if (r.urteil==='fast'){ ergebnis='fast'; text=r.hinweis; }
      else { const t=Vergleich.abgleich(roh,kand);
        text = t.art==='nochmal' ? 'Das kenne ich noch nicht — schau noch mal hin.'
             : t.id===ziel.id ? 'Fast! Schau noch mal ganz genau hin.' : `Das wäre ${t.name}.`; }
    } else {
      const t = Vergleich.abgleich(roh, kand);
      sicherheit = t.abstand!==undefined ? +(1-t.abstand).toFixed(2) : null;
      if (t.art==='nochmal') text='Das habe ich nicht verstanden — sag es noch einmal.';
      else if (t.id!==ziel.id) text=`Das wäre ${t.name}.`;
      else if (t.art==='rueckfrage'){ text=`Meintest du ${t.name}?`; ergebnis='fast'; }
      else ergebnis='richtig';
    }

    if (ergebnis!=='falsch') {
      erledigt = true;
      const neuerAufkleber = werten(ziel, ergebnis, versuch);
      kopfNachziehen();
      if (ctx.etikett) ctx.etikett.classList.add('weg');
      // Gelobt wird nur, was ganz richtig war. Ein "Super gemacht!" auf eine
      // fast richtige Antwort nimmt dem Wort seinen Wert - und dem Kind den
      // Hinweis, dass noch etwas zu holen ist.
      const spruch = ergebnis==='richtig' ? lob() : null;
      // Ein Aufkleber entsteht, wenn das Gebiet Fach 3 erreicht - also beim
      // ZWEITEN Mal richtig. Vorher war das unsichtbar: der Endbildschirm
      // sagte „4 von 4 richtig" und im selben Atemzug „0 von 4 Aufklebern",
      // und ein Kind konnte daraus nicht schliessen, dass es beim naechsten
      // Mal soweit ist. Jetzt hat der Aufkleber einen Augenblick.
      belohnung(s, ziel, ergebnis==='fast' ? text : null, istHaupt, nebenbei, spruch,
                neuerAufkleber);
      vorlesen(ergebnis==='fast' ? text
        : `${spruch} Das ist ${ziel.name}.` + (neuerAufkleber ? ' Neuer Aufkleber!' : ''));
    } else if (versuch >= 3) {
      // Nach dem dritten Fehlversuch wird aufgeloest. Ein Kind, das
      // dreimal daneben lag, raet ab jetzt nur noch.
      aufloesen('dreimal');
    } else {
      klangZu('falsch');
      // Das Etikett sagt selbst, dass es abgelehnt wurde. Vorher kam nur
      // ein Satz darunter - fuer eine Sechsjaehrige passierte nichts.
      if (ctx.etikett) {
        const e = ctx.etikett;
        e.classList.remove('falsch');
        void e.offsetWidth;               // Neustart der Animation erzwingen
        e.classList.add('falsch');
        setTimeout(()=>e.classList.remove('falsch'), 900);
      }
      if (ctx.hin){ ctx.hin.className='hinweis nochmal'; ctx.hin.textContent=text; }
      else if (ctx.status) ctx.status.textContent=text;
      else { let h=liste.querySelector('.hinweis');
        if(!h){ h=el('div','hinweis nochmal'); liste.appendChild(h); } h.textContent=text; }
      vorlesen(text);
    }

    Protokoll.schreiben(Protokoll.eintrag({
      zeit: Date.now(), profil: P.id, ebene: st.ebeneId, gebietId: ziel.id,
      eingabeart, ergebnis, roheingabe: eingabeart==='ziehen' ? '' : roh,
      sicherheit, dauerMs: Date.now()-beginn, versuch,
      fachVorher, fachNachher: Stand[ziel.id]?.fach ?? fachVorher,
    }));

    if (erledigt) setTimeout(()=>{ st.i++;
      if (st.i>=st.liste.length) zeige(endschirm); else zeige(spielschirm);
    }, ergebnis==='fast' ? 2400 : 1600);
  }

  // Erst die Karte messen, dann die Trefferflaechen - die haengen an ihrem
  // Massstab. Andersherum stimmten sie fuer ein Bild lang nicht.
  const neuMessen = ()=>{ kartenGroesse(); trefferflaechen(); };
  requestAnimationFrame(()=>requestAnimationFrame(neuMessen));
  addEventListener('resize', neuMessen);

  /* --- Die Aufgabe wird angesagt ------------------------------------
   *
   * Die Frage ALLEIN reicht nicht. „Wie heisst dieses Bundesland?" hilft
   * einem Kind, das die vier Antworten nicht lesen kann, kein Stueck
   * weiter - es wuesste dann, was gefragt ist, aber nicht, was zur Wahl
   * steht. Also beides, so wie ein Mensch fragen wuerde:
   *
   *   „Wie heisst dieses Bundesland?  Niedersachsen, Rheinland-Pfalz,
   *    Hamburg oder Saarland?"
   *
   * Beim Tippfeld gibt es nichts aufzuzaehlen; dort bleibt die Frage.
   * Und die Ansage kommt NACH dem Bildwechsel: `zeige()` blendet 320 ms
   * lang, und eine Stimme, die waehrend des Uebergangs anfaengt, gehoert
   * hoerbar noch zum vorigen Bildschirm.
   */
  setTimeout(()=>{
    const teile = [frageText];
    if (!tippt) teile.push(aufzaehlen(kand.map(k=>k.name)) + '?');
    ansagen(teile.join(' '));
  }, 500);
  return s;
}

/* ---------- Belohnungsmoment --------------------------------------------- */
function belohnung(s, ziel, fastText, zeigeStadt, nebenbei, spruch, neuerAufkleber){
  // Beim Belohnen wird die Hervorhebung still - sonst blinkt es weiter,
  // waehrend sich der Umriss nachzeichnet.
  const kontur=s.querySelector('#kontur'), fuell=s.querySelector('#belohn'),
        kreis=s.querySelector('#waschKreis'), punkt=s.querySelector('#stadtpunkt');
  const flaeche=s.querySelector(`path.geb[data-id="${ziel.id}"]`);
  if(!kontur||!flaeche) return;
  flaeche.classList.add('treffer');
  s.querySelectorAll('.zielpuls,.zielrand,.zeiger').forEach(x=>x.style.display='none');
  s.querySelectorAll('path.geb.ruhig').forEach(x=>x.classList.remove('ruhig'));
  kontur.setAttribute('d',ziel.pfad); fuell.setAttribute('d',ziel.pfad);
  kontur.style.display=''; fuell.style.display='';
  const b=flaeche.getBBox();
  kreis.setAttribute('cx',b.x+b.width/2); kreis.setAttribute('cy',b.y+b.height/2);
  kreis.setAttribute('r',Math.max(b.width,b.height));
  const ruhig=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L=kontur.getTotalLength(); kontur.style.strokeDasharray=L;
  if (ruhig){ kontur.style.strokeDashoffset=0; kreis.style.transform='scale(1)'; }
  else {
    kontur.style.strokeDashoffset=L;
    kontur.animate([{strokeDashoffset:L},{strokeDashoffset:0}],
      {duration:400,easing:'cubic-bezier(.2,0,0,1)',fill:'forwards'});
    kreis.style.transform='scale(0)';
    kreis.animate([{transform:'scale(0)'},{transform:'scale(1)'}],
      {duration:400,delay:360,easing:'cubic-bezier(.2,0,0,1)',fill:'forwards'});
  }
  // Ebene 4: der Stadtpunkt erscheint NACH der richtigen Antwort - als Zugabe.
  const stadt = zeigeStadt && D.deutschland.find(x=>x.id===ziel.id);
  if (stadt && stadt.ort && punkt) {
    punkt.setAttribute('cx',stadt.ort[0]); punkt.setAttribute('cy',stadt.ort[1]);
    punkt.style.display='';
    punkt.animate([{r:0},{r:7}],{duration:300,delay:600,easing:'cubic-bezier(.34,1.56,.64,1)',fill:'forwards'});
  }
  nameAufDieKarte(s, ziel);
  lobsatz(s, `Das ist ${ziel.name}.`, fastText, spruch, nebenbei, neuerAufkleber);
}

/**
 * Schreibt den Namen bei richtiger Antwort auf die Karte.
 *
 * Der Grund: gehoert hat das Kind den Namen, gelesen hat es ihn auf einem
 * Etikett - aber nicht AM ORT. Genau diese Verbindung soll haengenbleiben.
 *
 * Warum das nicht einfach ein `<text>` in der Mitte ist: **14 von 16
 * Bundeslaendernamen passen nicht in ihr Gebiet** (gemessen am Pol der
 * Unzugaenglichkeit gegen die Textbreite, Befund G10). "Nordrhein-Westfalen"
 * ueber Nordrhein-Westfalen gelegt reicht bis nach Polen. Die Fahne ist der
 * Normalfall, nicht die Ausnahme.
 *
 * Entschieden wird GEMESSEN, nicht nach Liste: der Text wird gesetzt,
 * ausgemessen und mit dem Gebiet verglichen. Damit gilt es auch fuer
 * Kontinente, Laender und jede Karte, die noch dazukommt.
 *
 * Gerechnet wird durchgehend in WELTPUNKTEN. Die Schriftgroesse wird dafuer
 * mit 1/k vorgerechnet, damit sie auf dem Schirm ueberall gleich gross
 * ankommt - auf der Weltkarte wie auf Bremen.
 */
function nameAufDieKarte(s, ziel){
  const NS = 'http://www.w3.org/2000/svg';
  const svg = s.querySelector('.karte svg');
  const g   = s.querySelector('#fahne');
  const flaeche = s.querySelector(`path.geb[data-id="${ziel.id}"]`);
  if (!svg || !g || !flaeche || !ziel.anker) return;
  const ctm = svg.getScreenCTM(); if (!ctm) return;
  const k = Math.abs(ctm.a) || 1;              // Bildschirmpunkte je Weltpunkt
  g.innerHTML = '';

  const knoten = (name, attr, inhalt) => {
    const n = document.createElementNS(NS, name);
    for (const [a, v] of Object.entries(attr)) n.setAttribute(a, v);
    if (inhalt !== undefined) n.textContent = inhalt;
    return n;
  };
  const SCHRIFT = 21 / k;                      // 21 Bildschirmpunkte
  const luft    = 9  / k;

  const text = knoten('text', { x:0, y:0, 'text-anchor':'middle',
    'dominant-baseline':'central', 'font-size':SCHRIFT, class:'fahnentext' },
    ziel.name);
  g.appendChild(text);
  const tb = text.getBBox();
  const b = tb.width, h = tb.height;

  const fb = flaeche.getBBox();
  const passt = b + luft*2 <= fb.width * 0.92 && h + luft*1.4 <= fb.height * 0.7;

  const rand = knoten('rect', { x:-b/2-luft, y:-h/2-luft*0.7,
    width:b+luft*2, height:h+luft*1.4, rx:(h/2+luft*0.7), class:'fahnenrand' });
  g.insertBefore(rand, text);

  let dx = 0, dy = 0;
  if (!passt) {
    /* Die Fahne steht NEBEN dem Gebiet, und eine Leitlinie zeigt darauf.
     * Ohne sie schwebt ein Name im Meer.
     *
     * „Neben" hiess bis zum Audit: LINKS oder RECHTS, und zwar um die halbe
     * Gebietsbreite PLUS die halbe Fahnenbreite. Bei einem langen Namen an
     * einem breiten Gebiet ist das sehr weit: „Australien und Ozeanien"
     * landete auf dem iPhone quer mitten auf SÜDAMERIKA. Die Leitlinie war
     * da, aber wer sie nicht verfolgt, liest den Namen als Beschriftung des
     * Kontinents, unter dem er liegt - also genau falsch herum.
     *
     * Die Fahne ist breit und flach. Der Platz, den sie braucht, ist unter
     * oder ueber dem Gebiet fast immer da, und dort bleibt sie in
     * Sichtweite. Reihenfolge: unten, oben, dann erst daneben.
     */
    const vb = svg.viewBox.baseVal;
    const halbB = b/2 + luft, halbH = h/2 + luft*0.7;
    const senkrecht = fb.height/2 + halbH + luft*0.6;
    const drin = (v) => ziel.anker[1] + v - halbH >= vb.y
                     && ziel.anker[1] + v + halbH <= vb.y + vb.height;
    if (drin(senkrecht)) dy = senkrecht;
    else if (drin(-senkrecht)) dy = -senkrecht;
    else {
      const nachRechts = ziel.anker[0] < vb.x + vb.width/2;
      dx = (nachRechts ? 1 : -1) * (Math.max(fb.width, fb.height)/2 + halbB + luft*1.5);
    }
    // Waagerecht in die Karte klemmen - so nah am Gebiet wie moeglich.
    const links  = ziel.anker[0] + dx - halbB;
    const rechts = ziel.anker[0] + dx + halbB;
    if (links  < vb.x)             dx += vb.x - links;
    if (rechts > vb.x + vb.width)  dx -= rechts - (vb.x + vb.width);
    rand.setAttribute('x', dx - halbB);
    rand.setAttribute('y', dy - halbH);
    text.setAttribute('x', dx);
    text.setAttribute('y', dy);
    // Die Linie darf bis in die Fahnenmitte laufen: der Rand wird DANACH
    // eingehaengt und deckt das innere Stueck ab.
    g.insertBefore(knoten('line', { x1:0, y1:0, x2:dx, y2:dy, class:'fahnenlinie' }), rand);
    g.insertBefore(knoten('circle', { cx:0, cy:0, r:4/k, class:'fahnenpunkt' }), rand);
  }
  g.setAttribute('transform', `translate(${ziel.anker[0]} ${ziel.anker[1]})`);
  g.dataset.fahne = passt ? 'innen' : 'daneben';
}

/* ---------- Ende ---------------------------------------------------------- */
function endschirm(){
  const st=Sitzung, s=el('div');
  const n=sterneFuer(st.glatt, st.liste.length);
  const f=Leitner.fortschritt(st.alle, Stand);
  s.innerHTML=kopf({}) + `
    <div class="mitte">
      <div class="siegsterne">${sterne(n,56)}</div>
      <div class="gross">Geschafft!</div>
      <div class="unter">${st.glatt} von ${st.liste.length} auf Anhieb richtig.</div>
      ${fortschrittBalken(f, 'breit')}
      <div class="buchstand">${kleberMarke(f.gesammelt, f.gesamt)}<span>${
        st.aufkleber ? `${st.aufkleber} neu${st.aufkleber===1?'':'e'}!`
        : `von ${f.gesamt} im Buch`}</span></div>${
        /* Warum noch keiner da ist - aber nur, solange noch keiner da ist.
           Danach ist der Satz eine Erklaerung fuer etwas, das man sieht. */
        !st.aufkleber && !f.gesammelt
          ? '<div class="leiser">Beim zweiten Mal richtig gibt es einen Aufkleber.</div>' : ''}
      <div class="reihe siegwahl">
        <button class="knopf haupt" id="nochmal">Noch einmal</button>
        <button class="knopf" id="buch">Forscherbuch</button>
        <button class="knopf" id="andere">Etwas anderes</button>
      </div>
    </div>`;
  s.querySelector('#nochmal').onclick=()=>starten(st.ebeneId);
  s.querySelector('#buch').onclick=()=>zeige(forscherbuch);
  s.querySelector('#andere').onclick=()=>zeige(ebenenwahl);
  vorlesen('Geschafft!');
  ansagen(`Du hast ${st.glatt} von ${st.liste.length} auf Anhieb richtig. `
    + (st.aufkleber ? `${st.aufkleber} neue Aufkleber! `
       : f.gesammelt ? '' : 'Beim zweiten Mal richtig gibt es einen Aufkleber. ')
    + 'Noch einmal, Forscherbuch oder etwas anderes?');
  return s;
}

/* Buch, PIN und Elternbereich fuehren in die WELTENWAHL zurueck, nicht in
 * eine Ebenenliste: sie haengen am Kind, nicht an einem Fach. Wer das Buch
 * aus der Erdkunde heraus oeffnet, kaeme sonst dort wieder an - obwohl
 * darin seit C3c auch die Rechenaufgaben kleben.
 */
/* ---------- Forscherbuch: der Aufkleber IST der Umriss ------------------- */
/* ---------- Forscherbuch: was du schon gefunden hast --------------------
 *
 * Vorher standen hier ALLE rund sechzig Gebiete nebeneinander, die noch
 * nicht gesammelten grau mit einem Fragezeichen. Am Anfang war die Seite
 * also fast leer - sechzig leere Kaesten.
 *
 * Rueckmeldung der Kinder: es sieht nach ARBEIT aus. Und genau das war es:
 * eine To-do-Liste, die man nie schafft, an einem Ort, der belohnen sollte.
 * Ein Aufkleberalbum, in dem neunundfuenfzig Plaetze leer sind, macht nicht
 * stolz, sondern klein.
 *
 * Jetzt steht hier, was DA IST - groesser, mit Namen. Was fehlt, kommt als
 * kurze Vorschau ans Ende: drei Stueck aus der Ebene, an der gerade
 * gearbeitet wird. Nicht als Mahnung, sondern als naechster Schritt.
 */
async function forscherbuch(){
  const s = el('div');
  const gruppen = [];
  for (const e of meineEbenen()) {
    let st={}; try{ st=(await Ablage.hole('fortschritt',`${P.id}:${e.id}`))||{}; }catch(err){}
    const alle = vorrat(e.id);
    const vb = e.id.startsWith('kontinente') ? D.vbK
             : e.id.startsWith('laender') ? D.vbL[e.id.split(':')[1]] : D.vbD;
    const stuecke = alle.map((g,i)=>({
      ...g, gesammelt: Leitner.istGesammelt(st, g.id), gekonnt: Leitner.istGekonnt(st, g.id),
      fach: st[g.id]?.fach ?? 0, i }));
    gruppen.push({ id:e.id, titel:e.titel, vb,
      da: stuecke.filter(x=>x.gesammelt), offen: stuecke.filter(x=>!x.gesammelt) });
  }
  const gesamt = gruppen.reduce((a,g)=>a+g.da.length,0);
  const gekonnt = gruppen.reduce((a,g)=>a+g.da.filter(x=>x.gekonnt).length,0);
  const vollen = gruppen.filter(g=>g.da.length);

  // Die Vorschau kommt aus der Ebene, an der GERADE gearbeitet wird - der
  // mit den meisten Aufklebern, die noch nicht fertig ist. Wer noch gar
  // nichts hat, bekommt die erste Ebene gezeigt.
  const dran = vollen.filter(g=>g.offen.length).sort((a,b)=>b.da.length-a.da.length)[0]
            || gruppen.find(g=>g.offen.length);
  const vorschau = dran ? dran.offen.slice(0, 3) : [];

  /**
   * Jeder Aufkleber wird auf SEINE eigene Form gerahmt.
   *
   * Vorher trugen alle den Ausschnitt ihrer Karte: ein Kontinent stand im
   * Massstab der ganzen Weltkarte in seinem Kaestchen. Afrika fuellte es
   * knapp, Europa war ein gruener Fleck von zwoelf Bildpunkten - und
   * Bremen auf der Deutschlandkarte praktisch unsichtbar. Ein Aufkleber,
   * auf dem man die Form nicht erkennt, ist kein Aufkleber.
   *
   * Gerechnet wird aus dem Pfad selbst, mit acht Prozent Luft ringsum.
   */
  const eigenerRahmen = (pfad) => {
    const z = String(pfad).match(/-?\d+\.?\d*/g);
    if (!z || z.length < 4) return null;
    let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
    for (let i=0;i+1<z.length;i+=2){ const x=+z[i], y=+z[i+1];
      if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    const b=x1-x0, h=y1-y0; if(!(b>0)||!(h>0)) return null;
    const luft = Math.max(b,h)*0.08;
    return `${x0-luft} ${y0-luft} ${b+2*luft} ${h+2*luft}`;
  };

  /* Der Aufkleber IST der Umriss - bei einer Karte.
   *
   * Eine Rechenaufgabe hat keinen. Das ist der zweite Punkt aus C3 des
   * Abgleichs, und er wird hier ohne ein einziges neues Bild gelöst: was
   * gesammelt wird, ist die AUFGABE selbst, gross und in der Kinderschrift.
   * `3 + 4` in einem Kästchen ist genauso wiedererkennbar wie der Umriss
   * von Afrika - und ehrlicher als ein erfundenes Symbol, das mit dem
   * Gelernten nichts zu tun hätte.
   *
   * Verdeckt wird bei einer offenen Aufgabe die ANTWORT, nicht die
   * Rechnung: „3 + 4" darf dastehen, sonst wäre die Vorschau ein Kästchen
   * mit einem Fragezeichen und sagte nichts darüber, was als Nächstes
   * kommt.
   */
  const kleber = (g, x, offen) => `
    <button class="aufkleber ${offen?'':'da'} ${x.gekonnt?'sicher':''} ${x.pfad?'':'rechnen'}"
            data-lesen="${offen?'Das kennst du noch nicht.':(x.frage ? `${x.frage} = ${x.name}` : x.name)}"
            title="Fach ${x.fach||'—'}">
      ${x.pfad
        ? `<svg viewBox="${eigenerRahmen(x.pfad) || g.vb}" aria-hidden="true"><path d="${x.pfad}" fill-rule="evenodd"
            fill="${offen?'var(--linie)':`var(${FL[x.i%7]})`}"
            stroke="var(--tinte)" stroke-opacity="${offen?.25:.6}" stroke-width="1.6"
            vector-effect="non-scaling-stroke"/></svg>`
        : `<div class="rechenkleber" style="--ton:var(${FL[x.i%7]})">${x.frage}</div>`}
      <span>${offen ? '?' : (x.pfad ? x.name : `= ${x.name}`)}</span>
      ${x.gekonnt?'<i class="siegel"></i>':''}
    </button>`;

  s.innerHTML = kopf({ links: zurueckKnopf(),
    mitte:`<span class="marke">${gesamt} Aufkleber</span>` }) + `
    <div class="rollen">
      ${gesamt ? vollen.map(g=>`
        <h3 class="gruppe">${g.titel}</h3>
        <div class="kleber gross">${g.da.map(x=>kleber(g,x,false)).join('')}</div>`).join('')
      : `<div class="mitte">
           <div class="titel">Hier kommen deine Aufkleber hin</div>
           <div class="unter">Für jedes Gebiet, das du zweimal richtig hattest,
             kommt einer dazu. Such dir eine Karte aus — der erste ist schnell da.</div>
         </div>`}
      ${vorschau.length ? `
        <h3 class="gruppe">Als Nächstes: ${dran.titel}</h3>
        <div class="kleber gross vorschau">${vorschau.map(x=>kleber(dran,x,true)).join('')}</div>`
      : gesamt ? `<h3 class="gruppe">Du hast alles gefunden.</h3>` : ''}
    </div>`;
  s.querySelector('#zur').onclick=()=>zeige(weltenwahl);
  s.querySelectorAll('[data-lesen]').forEach(b=>b.onclick=()=>vorlesen(b.dataset.lesen));
  ansagen(gesamt
    ? `Dein Forscherbuch. Du hast ${gesamt} Aufkleber${gekonnt?`, ${gekonnt} davon sicher`:''}. `
      + `Tipp einen an, dann sage ich dir, wie er heißt.`
    : 'Dein Forscherbuch ist noch leer. Such dir eine Karte aus — der erste Aufkleber ist schnell da.');
  return s;
}

/* ---------- Elternbereich ------------------------------------------------ */
/* Die PIN ist eine Tuerklinke, kein Schloss: sie liegt unverschluesselt in
   der Ablage und haelt neugierige Achtjaehrige ab, nicht Angreifer. */
function elternTor(){
  const s = el('div'); let eingabe='';
  s.innerHTML = kopf({ links: zurueckKnopf() }) + `
    <div class="mitte">
      <div class="titel">Elternbereich</div>
      <div class="unter">Vier Ziffern.${Einst.pin==='0000'
        ? ' Voreingestellt ist <code>0000</code> — im Elternbereich änderbar.' : ''}</div>
      <div class="pin" id="pin">${'<i></i>'.repeat(4)}</div>
      <div class="ziffern">${[1,2,3,4,5,6,7,8,9,0].map(z=>`<button class="knopf zi" data-z="${z}">${z}</button>`).join('')}
        <button class="knopf zi" data-z="x" aria-label="löschen">${LOESCHEN}</button></div>
      <div class="unter" id="fehl" style="color:var(--warn)"></div>
    </div>`;
  // Punkte und Pfeil sind gezeichnet, nicht getippt. Als Schriftzeichen
  // (●, ○, ←) lagen sie ausserhalb des Schnitts `latin` und waeren aus der
  // Systemschrift gekommen - also in einer anderen Schrift als alles daneben.
  // Gefunden hat das Tor `schrift`.
  const anzeige=()=>s.querySelectorAll('#pin i')
    .forEach((p,i)=>p.classList.toggle('voll', i<eingabe.length));
  s.querySelector('#zur').onclick=()=>zeige(weltenwahl);
  s.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{
    const z=b.dataset.z;
    if (z==='x') eingabe=eingabe.slice(0,-1);
    else if (eingabe.length<4) eingabe+=z;
    anzeige();
    if (eingabe.length===4) {
      if (eingabe===(Einst.pin||'0000')) zeige(elternbereich);
      else { s.querySelector('#fehl').textContent='Das war nicht richtig.'; eingabe=''; anzeige(); }
    }
  });
  return s;
}

async function elternbereich(){
  const s = el('div');
  const eintraege = await Protokoll.lesen();
  const a = Protokoll.auswerten(eintraege, NAMEN);
  const speicher = await Ablage.dauerhaft();
  const jeProfil = {};
  for (const e of eintraege) jeProfil[e.profil] = (jeProfil[e.profil]||0)+1;

  const zeile = (z)=>`<tr><td>${z.name}</td>
    <td class="num">${z.n}</td>
    <td class="num">${Math.round(z.quote*100)} %</td>
    <td class="num">${(z.schnitt/1000).toFixed(1)} s</td>
    <td><div class="balken klein"><i style="width:${Math.round(z.quote*100)}%;
      background:${z.quote>.7?'var(--gut)':z.quote>.4?'var(--achtung)':'var(--warn)'}"></i></div></td></tr>`;

  s.innerHTML = kopf({ links: zurueckKnopf(),
    mitte:'<span class="marke">Elternbereich</span>' }) + `
    <div class="rollen eltern">
      <h3 class="gruppe">Überblick</h3>
      <div class="kacheln">
        <div class="wert"><b>${a.gesamt}</b><span>Antworten</span></div>
        <div class="wert"><b>${a.gesamt?Math.round(a.richtig/a.gesamt*100):0} %</b><span>richtig</span></div>
        <div class="wert"><b>${a.tage.length}</b><span>Tage gespielt</span></div>
        <div class="wert"><b>${Object.keys(jeProfil).length}</b><span>Profile</span></div>
      </div>

      <h3 class="gruppe">Wackelkandidaten</h3>
      ${a.wackelkandidaten.length ? `<table class="tab"><thead><tr><th>Gebiet</th>
        <th class="num">Versuche</th><th class="num">richtig</th><th class="num">Ø Zeit</th><th></th></tr></thead>
        <tbody>${a.wackelkandidaten.map(zeile).join('')}</tbody></table>`
        : `<p class="unter">Noch zu wenig gespielt.</p>`}

      <h3 class="gruppe">Ausspracheliste — was gesagt, was verstanden</h3>
      ${a.aussprache.length ? `<table class="tab"><thead><tr><th>gesagt</th><th>gemeint</th>
        <th class="num">Ergebnis</th></tr></thead><tbody>
        ${a.aussprache.slice(-25).reverse().map(x=>`<tr><td><em>„${x.gesagt}“</em></td>
          <td>${x.gemeint}</td><td class="num">${x.ergebnis}</td></tr>`).join('')}</tbody></table>`
        : `<p class="unter">Noch nichts gesprochen. Der Sprachmodus ist
           <strong>${Einst.sprachmodus?'an':'aus'}</strong>.</p>`}

      <h3 class="gruppe">Stimme</h3>
      <p class="unter">Welche Stimmen es gibt, entscheidet das Gerät — auf einem iPhone
        andere als auf dem iPad. Hier steht, was <em>dieses</em> Gerät anbietet.
        Antippen zum Anhören, die gewählte bleibt gespeichert.
        <br>Mehr Auswahl gibt es unter <em>Einstellungen › Bedienungshilfen ›
        Gesprochene Inhalte › Stimmen › Deutsch</em> — dort lassen sich bessere
        Stimmen laden, die dann auch hier erscheinen.</p>
      <div class="reihe stimmen" style="justify-content:flex-start" id="stimmwahl"></div>

      <h3 class="gruppe">Sprachmodus</h3>
      <p class="unter">Die Spracherkennung läuft <strong>nicht auf dem Gerät</strong>.
        Was das Kind sagt, geht zur Erkennung an Apple beziehungsweise den Browserhersteller.
        Alles andere — Fortschritt, Protokoll, Profile — bleibt hier und geht nirgendwohin.</p>
      <div class="reihe" style="justify-content:flex-start">
        <button class="knopf" id="sprach">${Einst.sprachmodus?'Sprachmodus ausschalten':'Sprachmodus einschalten'}</button>
      </div>

      <h3 class="gruppe">Landeshauptstädte</h3>
      <p class="unter">Auf dieser Ebene stehen <strong>vier Städte</strong> zur Auswahl,
        eine davon stimmt — für beide Kinder. Gefragt ist, <em>welche</em> Stadt es ist,
        nicht wie man sie schreibt. Wer lieber tippt, schaltet die Auswahl hier ab;
        dann gilt auf dieser Ebene wieder der Eingabeweg des Profils.</p>
      <div class="reihe" style="justify-content:flex-start">
        <button class="knopf" id="hsw">${Einst.hauptstadtAuswahl?'Auswahl abschalten, tippen lassen':'Auswahl einschalten'}</button>
      </div>

      <h3 class="gruppe">Leas Reihen — Mal und Geteilt</h3>
      <p class="unter">Voreingestellt sind <strong>90 % Malaufgaben</strong> und
        10 % Geteilt-Aufgaben; der Regler geht bis zur Hälfte. Die Zehnerreihe
        bleibt im Vorrat, kommt aber selten dran — sie ist zu leicht, um eine
        Sitzung zu füllen. Und ungefähr jede zehnte Aufgabe stammt aus den
        kleinen Reihen: nicht jede soll eine Hürde sein.</p>
      <div class="reihe regler" style="justify-content:flex-start">
        <input type="range" id="teiler" min="10" max="50" step="10"
               value="${Math.round((Einst.reihenGeteilt ?? 0.1) * 100)}"
               aria-label="Anteil Geteilt-Aufgaben">
        <span class="unter" id="teilerstand"></span>
      </div>

      <h3 class="gruppe">PIN</h3>
      <p class="unter">Vier Ziffern vor diesem Bereich. Sie ist eine Türklinke,
        kein Schloss — sie hält eine neugierige Achtjährige ab, nicht mehr.
        Umso wichtiger, dass sie nicht <code>0000</code> bleibt: das steht auf
        dem Eingabeschirm.</p>
      <div class="reihe" style="justify-content:flex-start">
        <button class="knopf" id="pinneu">PIN ändern</button>
        <span class="unter" id="pinstand"></span>
      </div>

      <h3 class="gruppe">Ausfuhr und Löschen</h3>
      <div class="reihe" style="justify-content:flex-start">
        <button class="knopf" id="csv">Als CSV sichern</button>
        <button class="knopf" id="json">Als JSON sichern</button>
        <button class="knopf" id="weg" style="color:var(--warn)">Alles von ${P.name} löschen</button>
      </div>
      <div id="ausgabe"></div>

      <h3 class="gruppe">Diese Fassung</h3>
      <table class="tab"><tbody>
        <tr><td>Fassung</td><td class="num">${BAU.fassung}</td></tr>
        <tr><td>Gebaut am</td><td class="num">${BAU.datum}</td></tr>
        <tr><td>Stand der Daten</td><td class="num">${BAU.standJahr}</td></tr>
        <tr><td>Speicher dauerhaft</td><td class="num">${
          speicher.moeglich ? (speicher.gewaehrt?'ja':'abgelehnt') : 'nicht verfügbar'}</td></tr>
        ${speicher.platz ? `<tr><td>belegt</td><td class="num">${(speicher.platz.benutzt/1048576).toFixed(1)} MB</td></tr>`:''}
      </tbody></table>

      <h3 class="gruppe">Herkunft der Karten</h3>
      <p class="unter">Kontinente, Länder und Städtelagen: <strong>Natural Earth</strong>
        (Public Domain). Bundesländer: derzeit ebenfalls Natural Earth — vorgesehen ist
        <strong>BKG VG250</strong>, Datenlizenz Deutschland Namensnennung 2.0
        (© GeoBasis-DE / BKG). Einwohnerzahlen: Stand ${BAU.standJahr}.</p>
    </div>`;

  s.querySelector('#zur').onclick=()=>zeige(weltenwahl);
  s.querySelector('#sprach').onclick=async(e)=>{
    Einst.sprachmodus=!Einst.sprachmodus; await einstSichern();
    e.target.textContent=Einst.sprachmodus?'Sprachmodus ausschalten':'Sprachmodus einschalten'; };
  {
    const r = s.querySelector('#teiler'), stand = s.querySelector('#teilerstand');
    // EIN Ort, der die Beschriftung schreibt — beim Aufbau und beim
    // Schieben. Zwei Stellen, die dieselbe Zeile bauen, sagen irgendwann
    // Verschiedenes; genau so sind hier schon zwei Sternformeln entstanden.
    const schreiben = ()=>{ stand.textContent = `${100 - +r.value} % Mal · ${+r.value} % Geteilt`; };
    schreiben();
    r.oninput = schreiben;
    r.onchange = async ()=>{ Einst.reihenGeteilt = +r.value / 100; await einstSichern(); };
  }
  s.querySelector('#hsw').onclick=async(e)=>{
    Einst.hauptstadtAuswahl=!Einst.hauptstadtAuswahl; await einstSichern();
    e.target.textContent=Einst.hauptstadtAuswahl?'Auswahl abschalten, tippen lassen':'Auswahl einschalten'; };

  const sichern=(text,name,typ)=>{
    const ausgabe=s.querySelector('#ausgabe');
    try {
      const b=new Blob([text],{type:typ});
      const u=URL.createObjectURL(b); const a2=document.createElement('a');
      a2.href=u; a2.download=name; document.body.appendChild(a2); a2.click();
      setTimeout(()=>{ URL.revokeObjectURL(u); a2.remove(); },1000);
      ausgabe.innerHTML=`<p class="unter">Gesichert als <code>${name}</code>.</p>`;
    } catch(err) {
      // Faellt das Sichern aus (etwa in einer Vorschau ohne Download), wird
      // der Inhalt gezeigt statt verschwiegen.
      ausgabe.innerHTML=`<p class="unter">Sichern ging nicht — hier zum Kopieren:</p>
        <textarea class="ausgabefeld" readonly>${text.replace(/</g,'&lt;')}</textarea>`;
    }
  };
  // Die Stimmenliste wird ERST GEBAUT, wenn sie da ist.
  //
  // `getVoices()` liefert beim ersten Aufruf oft eine leere Liste; die
  // Stimmen kommen nach und melden sich mit `voiceschanged`. Wer die Liste
  // einmal beim Aufbau des Bildschirms zeichnet, zeigt auf dem iPhone
  // regelmaessig gar nichts an - und das sieht aus wie „keine Stimmen".
  const stimmwahl = s.querySelector('#stimmwahl');
  const stimmenZeichnen = ()=>{
    if (!stimmwahl) return;
    const liste = alleStimmen();
    if (!liste.length) {
      stimmwahl.innerHTML = `<p class="unter">Dieses Gerät meldet keine deutsche
        Stimme. Vorgelesen wird dann nichts.</p>`;
      return;
    }
    stimmeSuchen();
    stimmwahl.innerHTML = liste.map(v=>`
      <button class="knopf${v.name===stimme?.name?' gewaehlt':''}" data-stimme="${v.name}">
        ${v.name}${v.localService?'':' <span class="unter">(aus dem Netz)</span>'}</button>`).join('');
    stimmwahl.querySelectorAll('[data-stimme]').forEach(b=>b.onclick=async()=>{
      Einst.stimme = b.dataset.stimme; stimmenWunsch = Einst.stimme;
      await einstSichern(); stimmeSuchen();
      stimmwahl.querySelectorAll('[data-stimme]').forEach(x=>
        x.classList.toggle('gewaehlt', x.dataset.stimme===stimmenWunsch));
      // Angehoert wird ein Satz aus dem Spiel, nicht „Test 1 2 3": man
      // waehlt eine Stimme fuer das, was sie wirklich sagen wird.
      const alterTon = tonAn; tonAn = true;
      vorlesen('Super gemacht! Das ist Australien und Ozeanien.');
      tonAn = alterTon;
    });
  };
  stimmenZeichnen();
  if ('speechSynthesis' in window)
    speechSynthesis.addEventListener('voiceschanged', stimmenZeichnen, { once:false });

  /* Die PIN war NICHT zu aendern.
   *
   * `Einst.pin` wurde gelesen und nirgends geschrieben - gefunden beim
   * Audit. Auf dem Eingabeschirm stand „Voreingestellt ist 0000", und
   * „voreingestellt" heisst: man kann es aendern. Man konnte nicht. Damit
   * war der Elternbereich fuer jedes Kind offen, das lesen kann - also
   * genau fuer die, vor der er schuetzen soll. */
  {
    const knopf = s.querySelector('#pinneu'), stand = s.querySelector('#pinstand');
    let neue = '';
    // Gezeichnete Punkte, keine Schriftzeichen. Zwanzig Zeilen weiter oben
    // steht, WARUM - und diese Stelle hat es beim ersten Anlauf trotzdem
    // wieder mit ● und ○ gemacht. Das Tor `schrift` hat es gefunden.
    const zeigen = ()=>{ stand.innerHTML = neue
      ? `<span class="pin klein">${'<i class="voll"></i>'.repeat(neue.length)}${
          '<i></i>'.repeat(4-neue.length)}</span>`
      : (Einst.pin==='0000' ? 'steht auf 0000' : 'geändert'); };
    zeigen();
    knopf.onclick = ()=>{
      if (knopf.dataset.an!=='ja'){
        knopf.dataset.an='ja'; knopf.textContent='Abbrechen'; neue='';
        stand.innerHTML = `<span class="ziffern klein">${
          [1,2,3,4,5,6,7,8,9,0].map(z=>`<button class="zi" data-neu="${z}">${z}</button>`).join('')
        }</span>`;
        stand.querySelectorAll('[data-neu]').forEach(b=>b.onclick=async()=>{
          neue += b.dataset.neu;
          if (neue.length===4){
            Einst.pin = neue; await einstSichern();
            knopf.dataset.an=''; knopf.textContent='PIN ändern';
            neue=''; zeigen();
            stand.textContent = 'geändert';
          }
        });
        return;
      }
      knopf.dataset.an=''; knopf.textContent='PIN ändern'; neue=''; zeigen();
    };
  }

  s.querySelector('#csv').onclick=()=>sichern(Protokoll.alsCsv(eintraege,NAMEN),
    `lernkiste-${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8');
  s.querySelector('#json').onclick=()=>sichern(Protokoll.alsJson(eintraege),
    `lernkiste-${new Date().toISOString().slice(0,10)}.json`,'application/json');
  s.querySelector('#weg').onclick=async(e)=>{
    if (e.target.dataset.sicher!=='ja'){ e.target.dataset.sicher='ja';
      e.target.textContent=`Wirklich? Alles von ${P.name} löschen`; return; }
    await Ablage.profilLoeschen(P.id);
    for (const eb of EBENEN) await Ablage.loesche('fortschritt',`${P.id}:${eb.id}`).catch(()=>{});
    s.querySelector('#ausgabe').innerHTML=`<p class="unter">Gelöscht.</p>`;
    setTimeout(()=>zeige(profilwahl),900);
  };
  return s;
}

/* ---------- Start --------------------------------------------------------- */
(async ()=>{ await einstLaden(); zeige(profilwahl); })();
