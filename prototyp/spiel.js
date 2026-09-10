/* Lernkiste - Prototyp mit M3 bis M6.
 *
 * Eine Aufgabe, drei Eingabewege. Die Aufgabenlogik sieht nur Antworten.
 * Leitner statt Zufall, Protokoll statt Vergessen, Elternbereich statt
 * Vermuten.
 */
const D = JSON.parse(document.getElementById('daten').textContent);
const BAU = JSON.parse(document.getElementById('bau').textContent);
const buehne = document.getElementById('buehne');

/* Der Fassungsstempel - EINMAL gesetzt, danach auf jedem Bildschirm da.
 *
 * Er beantwortet genau eine Frage, und zwar auf dem Geraet: laeuft hier
 * schon die Fassung, die gerade gebaut wurde? Auf dem iPhone laesst sich
 * das sonst nicht sagen - eine PWA sieht nach dem Neustart gleich aus, ob
 * sie nun frisch geladen ist oder aus dem Lager des Service Workers kommt.
 *
 * `v277` ist die Zahl der Einchecker und steigt mit jeder Runde: sie
 * laesst sich mit dem blossen Auge vergleichen. `d04f0df` sagt, welcher
 * Einchecker genau; ein `+` dahinter heisst, der Baum war beim Bauen
 * schmutzig.
 *
 * Bis hierher stand der Stempel NUR auf der Profilwahl (`.bauzeile`).
 * Damit war er nach dem ersten Tippen weg, und wer nachsehen wollte,
 * musste die App neu starten. Zwei Stempel waeren einer zuviel (Regel 6:
 * was zweimal dasteht, veraltet einmal) - der auf der Profilwahl ist
 * deshalb gegangen, die ausfuehrliche Auskunft steht im Elternbereich. */
const stempel = document.getElementById('fassung');
if (stempel) stempel.textContent = `v${BAU.bau} · ${BAU.stand}`;

const FL = ['--f1','--f2','--f3','--f4','--f5','--f6','--f7'];
const VIER = ['--f1','--f3','--f5','--f6'];
const el = (t,k,i)=>{ const e=document.createElement(t); if(k)e.className=k; if(i!==undefined)e.innerHTML=i; return e; };
/* Die Aufgabe ist zu Ende (G18).
 *
 * Der Befund: nach der richtigen Antwort blieben die uebrigen
 * Antwortknoepfe stehen und sahen weiter antippbar aus. Gemessen im Lob -
 * drei Knoepfe, Deckkraft 1, `pointer-events:auto`, volle Fuellung und
 * volle 3-Punkt-Kante. Ein Griff darauf verschluckte `if (erledigt)
 * return` still. Drei Knoepfe, die etwas versprechen und nichts tun; seit
 * G17, das die Antworten kraeftiger gemacht hat, sind sie ausserdem das
 * Lauteste auf dem Bildschirm.
 *
 * KEIN SCHALTER, SONDERN EINE ABLEITUNG. Das Markieren haengt nicht an
 * einem zusaetzlichen Aufruf, den man an einer der sieben Endstellen
 * vergessen kann, sondern am Setzen von `erledigt` selbst: `erledigt =
 * beendet(s)`. Wer eine achte Endstelle baut, muss `erledigt` setzen -
 * und faehrt damit hier durch. Ein Aufruf, den man vergessen kann, wird
 * einmal vergessen.
 *
 * Zurueckgesetzt wird nichts: jede Aufgabe baut in `spielschirm`,
 * `rechenschirm` und `schreibschirm` ein frisches `s`. Das Merkmal geht
 * mit dem alten Bildschirm.
 *
 * Gibt `true` zurueck, damit es an die Stelle der Zuweisung passt. */
const beendet = (s) => { if (s) s.dataset.fertig = '1'; return true; };
/* Der Zackenstern. EIN Pfad, zwei Verwendungen: der gezaehlte Stern im Kopf
   (`STERN`, mit Tintenkontur) und der Streustern auf Fionas Kachel (`MOTIV`,
   ohne). Regel 6 - was zweimal dasteht, veraltet einmal; hier waere es der
   Tag, an dem die Zacken der einen Sorte laenger werden als die der anderen. */
const STERN_VB = '-14 -14 28 28';
const STERN_D = 'M0 -12 3.7 -4 12 -2.8 6 3.2 7.4 12 0 7.8 -7.4 12 -6 3.2 -12 -2.8 -3.7 -4Z';
const STERN = (f,g=24)=>`<svg width="${g}" height="${g}" viewBox="${STERN_VB}"><path d="${STERN_D}" fill="${f}" stroke="var(--tinte)" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const LOESCHEN='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6H9L3 12l6 6h11a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"/><path d="M17 10l-4 4M13 10l4 4"/></svg>';
/* Der Pokal (B2). Gezeichnet und nicht als Schriftzeichen: ein Emoji sieht
   auf jedem Geraet anders aus, und das Tor `schrift` kennt es nicht. */
/* Gold mit Tintenkontur - genau die Sprache der Sterne (`STERN`). Ein
   Pokal, der wie ein Bedienzeichen aussieht, wird auch wie eines gelesen. */
const POKAL='<svg width="26" height="26" viewBox="0 0 24 24" fill="none"'
  + ' stroke="var(--tinte)" stroke-width="1.8" stroke-linecap="round"'
  + ' stroke-linejoin="round">'
  + '<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="var(--stern-an)"/>'
  + '<path d="M8 21h8M12 17v4"/>'
  + '<path d="M17 5h2.5a2.5 2.5 0 0 1 0 5H17M7 5H4.5a2.5 2.5 0 0 0 0 5H7"/></svg>';
/* Derselbe Pokal, gross - fuer den Endbildschirm. Eine Marke, kein
   zweites Zeichen: sonst veraltet eines von beiden (Regel 6). */
const POKALGROSS = POKAL.replace('width="26" height="26"', 'width="72" height="72"');
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
  /* „Ganze Karte" - vier Ecken, die nach aussen zeigen. Dasselbe Zeichen,
     das jede Bildbetrachtung fuer „einpassen" benutzt; ein Kind, das es
     nicht kennt, lernt es in einem Tipp. */
  ganzeKarte:'<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
  /* Nochmal hoeren: der Lautsprecher aus `tonAn`, daneben ein Kreispfeil.
     Der Lautsprecher sagt „hoeren", der Pfeil sagt „noch einmal" -
     zusammen sagen sie, was der Knopf tut, ohne ein Wort. Fiona liest
     nicht.
     Vier Entwuerfe nebeneinander gezeichnet und bei 26 UND 78 Punkten
     angesehen, denn der Knopf ist 26 gross und dort entscheidet es sich:
     ein Bogen ohne Pfeilspitze verschmolz mit dem Lautsprecherkegel zu
     einem Klumpen, zwei Wellen heissen „Ton an" und nicht „noch einmal",
     und eine Welle PLUS Pfeil war zu voll. Was uebrig bleibt, ist das
     Einfachste: Kegel links, Kreispfeil rechts, dazwischen Luft. */
  nochhoeren:'<path d="M3.5 9.5H7L11 5.5v13L7 14.5H3.5z"/>'
    + '<path d="M20 12a4 4 0 1 1-1.2-2.85"/><path d="M21.3 6.4l-.5 3.1-3.1-.5"/>',
  /* Anschauen: ein Auge. Es stand bis P16 als das WORT „anschauen" unter
     jeder Kachel - sechzehn Punkte hoch und fuer eine Sechsjaehrige, die
     nicht liest, ohnehin stumm. */
  auge:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/>'
     + '<circle cx="12" cy="12" r="3.1"/>',

  /* --- Q34: Zeichen fuer die Knoepfe, die fuer Fiona leer waren --------
   *
   * Audit A hat 21 antippbare Dinge gezaehlt, die einem Kind, das nicht
   * liest, NICHTS sagen - kein Bild, keine Ziffer, keine Stimme. Schwer
   * wogen die Dreiergruppen: Pausenbildschirm und Endbildschirm, je drei
   * gleich geformte Kaesten nebeneinander. Fiona hoert eine Aufzaehlung
   * und sieht drei Kaesten; die Zuordnung Satz -> Kasten traegt allein
   * die Reihenfolge.
   *
   * Zwei Regeln fuer diese fuenf Zeichen:
   *
   *   1. GLEICHES ZIEL, GLEICHES ZEICHEN. „Übung beenden" und „Etwas
   *      anderes" fuehren beide zur Kachelwand - also beide `kacheln`.
   *      Zwei Zeichen fuer denselben Weg waeren zwei Wege.
   *   2. WAS LOESCHT, SIEHT ANDERS AUS. „Noch einmal" wiederholt, „Von
   *      vorne anfangen" LOESCHT. Beides mit einem Kreispfeil zu zeigen
   *      hiesse, den Unterschied zu verstecken, auf den es ankommt -
   *      deshalb dort der Eimer.
   */
  /* Weiterspielen: das Dreieck, das jedes Abspielen der Welt benutzt. */
  weiter:'<path d="M8.5 5.4l10.5 6.6-10.5 6.6z"/>',
  /* Zur Kachelwand: vier Kacheln. Genau das, was danach dasteht. */
  kacheln:'<rect x="4" y="4" width="7" height="7" rx="1.8"/>'
        + '<rect x="13" y="4" width="7" height="7" rx="1.8"/>'
        + '<rect x="4" y="13" width="7" height="7" rx="1.8"/>'
        + '<rect x="13" y="13" width="7" height="7" rx="1.8"/>',
  /* Noch einmal: der Kreispfeil, derselbe wie in `nochhoeren` - dort
     heisst er „noch einmal hoeren", hier „noch einmal spielen". */
  nochmal:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20.6 3.9v4.6H16"/>',
  /* Von vorne: ein Eimer. Nicht der Kreispfeil - hier verschwindet
     etwas, und das muss man sehen, bevor man tippt. */
  weg:'<path d="M5 7h14"/><path d="M9.5 7V5.4A1.4 1.4 0 0 1 10.9 4h2.2a1.4 1.4 0 0 1 1.4 1.4V7"/>'
    + '<path d="M6.7 7l.8 11.5A1.6 1.6 0 0 0 9.1 20h5.8a1.6 1.6 0 0 0 1.6-1.5L17.3 7"/>',
  /* „Weiss ich nicht": ein Fragezeichen. Der Punkt darunter ist ein Strich
     ohne Laenge - der Zeichensatz hier ist ohne Fuellung, und ein runder
     Abschluss macht daraus einen Punkt. */
  frage:'<path d="M9.1 8.8a2.9 2.9 0 1 1 3.6 2.9c-.8.2-1.2.8-1.2 1.6v.8"/>'
      + '<path d="M11.5 17.6v.01"/>',
  /* Der Haken auf einer Station, die hinter einem liegt (N11). Er sagt
     „das kannst du schon" - und er sagt es OHNE Zahl, was der ganze
     Punkt ist. Kein Stern (der gehoert der Sitzung, S1) und kein Pokal
     (der gehoert dem Test, B2): drei Auszeichnungen, drei Zeichen. */
  haken:'<path d="M4.5 12.6 9.6 17.7 19.5 6.8"/>',
  /* Lupe groesser und kleiner. Bis Q34 stand dort ein nacktes „+" und
     „−". Beide sind Rechenzeichen, und in einer App mit einer Rechenwelt
     ist das die falsche Auskunft; ausserdem hat Audit A gemessen, dass
     ein einzelnes Rechenzeichen fuer ein Kind, das nicht liest, gar
     nichts traegt. Mit der Lupe daneben sagt es, worum es geht. */
  lupeAuf:'<circle cx="10.5" cy="10.5" r="6"/><path d="M14.9 14.9L20 20"/>'
        + '<path d="M8 10.5h5M10.5 8v5"/>',
  lupeZu:'<circle cx="10.5" cy="10.5" r="6"/><path d="M14.9 14.9L20 20"/>'
       + '<path d="M8 10.5h5"/>',
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
/* Ein LEERER Kopf ist kein Kopf.
 *
 * Der Endbildschirm und die Pause riefen `kopf({})` - drei leere Faecher,
 * und `min-height:68px` machte daraus ein Band von 68 Punkten, in dem
 * nichts steht. Auf dem Zielgeraet sind das 17 % der Bildschirmhoehe, und
 * weil der Rest darunter mittig sitzt, stand der ganze Block 68 Punkte
 * unter der Mitte: viel Luft oben, wenig unten. Gemessen, nicht geschaetzt
 * - 92 Punkte ueber den Sternen, 24 unter den Knoepfen.
 *
 * Die Entscheidung faellt HIER und nicht an den zwei Aufrufstellen: wer
 * den naechsten Bildschirm ohne Kopfzeile baut, soll nicht daran denken
 * muessen.
 */
const kopf = ({ links='', mitte='', rechts='' })=>
  (links || mitte || rechts)
  ? `<div class="kopf"><div class="kopf-links">${links}</div>
    <div class="kopf-mitte">${mitte}</div>
    <div class="kopf-rechts">${rechts}</div></div>`
  : '';
/* `data-lesen` und `aria-label`, weil das Wort auf schmalen Fenstern
   WEGFAELLT (`.knopf .wort{display:none}` unter 520 Punkten) - dann steht
   dort ein nacktes Zeichen. Und weil Fiona das Wort auch dann nicht
   liest, wenn es dasteht: er war der einzige Griff im ganzen
   Forscherbuch ohne Ansage (Buch-Audit II, K3). */
/**
 * Die Ansage an alles haengen, was `data-lesen` traegt - und zwar NEBEN
 * das, was der Knopf schon tut.
 *
 * Hier stand zweimal `b.onclick = () => vorlesen(...)`, einmal im
 * Vorlauf und einmal im Buch. Eine Zuweisung WIRFT WEG, was vorher
 * dastand: wer `data-lesen` an einen Knopf schreibt, der schon etwas
 * tut, nimmt ihm seine Aufgabe - oder bekommt sie zurueck und verliert
 * die Ansage, je nachdem, wer zuletzt bindet. Beim „Zurueck" war es das
 * erste: der Knopf sagte seinen Namen und ging nicht mehr zurueck.
 * `lesbarkeit` und der Rauchtest haben es an zwei verschiedenen Stellen
 * gemeldet - und die zweite erst, nachdem die erste geflickt war.
 *
 * Deshalb steht es jetzt EINMAL da (Regel 6). `addEventListener` legt
 * die Ansage neben die Aufgabe; die Marke verhindert, dass ein zweiter
 * Lauf ueber dieselben Knoepfe sie doppelt sprechen laesst - im Buch
 * laeuft das Binden einmal beim Aufbau und noch einmal bei jedem
 * Blaettern.
 */
const ansagenBinden = (wo) => wo.querySelectorAll('[data-lesen]').forEach(b => {
  if (b.dataset.lesenGebunden) return;
  b.dataset.lesenGebunden = '1';
  b.addEventListener('click', () => vorlesen(b.dataset.lesen, b.dataset.sprache || 'de'));
});

const zurueckKnopf = (wohin='Zurück')=>
  `<button class="knopf" id="zur" data-lesen="${wohin}" aria-label="${wohin}"
    ><span class="zei">${ZURUECK}</span><span class="wort">${wohin}</span></button>`;
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
/* ---- Sterne heissen EINE Sache: wie die Sitzung lief (S1) -------------
 *
 * Bis hierher stand dieselbe Sternform an zwei Orten und meinte zweierlei:
 * im Kopf und auf dem Endbildschirm die SITZUNG (drei Sterne = fehlerfrei),
 * auf der Ebenenkachel den LEBENSFORTSCHRITT. Ein Kind spielte also
 * fehlerfrei, sah drei Sterne, tippte auf „Weiter" - und sah auf der
 * Kachel einen. Dieselbe Form, dieselbe Farbe, zwei Bedeutungen. Fuer eine
 * Sechsjaehrige ist das nicht differenziert, sondern ein Wortbruch.
 *
 * Und daneben lag S2: auf der Kachel standen Sterne und Balken als
 * ANTEIL, die Aufkleberzahl als ANZAHL. Auf einer Aufnahme sah man
 * „Bundeslaender: 1 Stern, 9 Aufkleber" neben „Asien: 2 Sterne, 2
 * Aufkleber" - wer die Kacheln vergleicht, und Kinder vergleichen sie,
 * liest das Gegenteil dessen, was dasteht.
 *
 * Beides ist mit EINER Entscheidung erledigt: die Sterne gehoeren der
 * Sitzung. Auf der Kachel steht, wie weit die Ebene ist - die
 * Aufkleberzahl (Anzahl, mit anteilig gefuelltem Zeichen) und der
 * zweiteilige Balken. Zwei Aussagen statt vier, und keine widerspricht
 * einer anderen.
 *
 * `tor/inhalt.mjs` setzt das durch: jeder Aufruf von `sterneFuer` muss
 * `st.glatt` bekommen. Eine Regel, die nur hier stuende, waere beim
 * naechsten Bildschirm wieder vergessen.
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

/** Die Zahl der Aufkleber mit ihrem Zeichen davor.
 *
 * `vonWieviel` entscheidet, ob „9" oder „9/60" dasteht - und das ist S2.
 *
 * AUF EINER KACHEL steht die Zahl neben Sternen und Balken, und die
 * zeigen einen ANTEIL. Nebeneinander hiess das: neun Aufkleber und ein
 * Stern (Länder Asien, 9 von 60) standen neben zwei Aufklebern und zwei
 * Sternen (Kontinente, 2 von 6). Wer die Kacheln vergleicht - und Kinder
 * vergleichen sie -, las daraus das Gegenteil dessen, was dastand.
 * Niemand war falsch informiert, nur schlecht.
 *
 * AUF DEM ENDBILDSCHIRM bleibt die nackte Zahl: dort steht daneben
 * „von 4 im Buch", und „2/4 von 4 im Buch" waere dieselbe Auskunft
 * zweimal. Es wird nichts verglichen - es gibt nur eine Ebene. */
const kleberMarke = (n, gesamt, vonWieviel = false) => `<span class="klebermarke"${
  n ? '' : ' data-leer="ja"'} aria-label="${n} von ${gesamt} Aufklebern">${
  ZEI('kleber', 20)}${n}${vonWieviel ? `<small>/${gesamt}</small>` : ''}</span>`;

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
 *     "Australien und Ozeanien" zu Ende zu hoeren (bis A5 der laengste
 *     Name im Vorrat; er lebt als Alias weiter, und lang gesprochene
 *     Namen gibt es weiterhin - „Vereinigtes Koenigreich").
 *   - Wie HOCH. `pitch` stand auf 1 (Voreinstellung). 1,15 klingt
 *     zugewandt statt vorlesend. Darueber wird es schrill.
 */
let stimme=null, tonAn=true, entsperrt=false;
/* DIE STIMME WIRD DURCH EINE BERUEHRUNG FREIGEGEBEN, nicht durch den
 * ersten Satz (S1t).
 *
 * Rueckmeldung vom iPad: „kein Ton". Nachgestellt und gemessen, nicht
 * geraten - vor dem ersten Tipp ruft die App dreimal `speak` auf:
 *
 *     { text: "",                                  nachGeste: 0 }
 *     { text: "Wer möchte spielen?",               nachGeste: 0 }
 *     { text: "Fiona, Lea, Stephan oder Violeta?", nachGeste: 0 }
 *
 * iOS gibt `speechSynthesis` erst nach einer Beruehrung frei und wirft
 * dabei keinen Fehler - es passiert einfach nichts. Bis hierher stand
 * die Freigabe IM ersten `vorlesen`, also genau in dem Aufruf, der auf
 * dem Begruessungsbildschirm faellt: er wurde abgelehnt, und die Zeile
 * daneben setzte `entsperrt = true`. Damit war die Stimme fuer die
 * ganze Sitzung still, und niemand hat es je wieder versucht.
 *
 * Auf dem Schreibtisch gibt es die Sperre nicht - deshalb war der
 * Fehler hier unsichtbar und dort vollstaendig.
 *
 * Jetzt haengt die Freigabe an der BERUEHRUNG. `capture` und alle drei
 * Arten, weil iOS je nach Fassung `touchend` und `click` verschieden
 * behandelt; die Marke selbst verhindert, dass es zweimal passiert.
 * `cancel()` davor ist der uebliche Griff gegen eine Warteschlange, die
 * nach einem abgelehnten Satz haengengeblieben ist.
 *
 * Die Begruessung VOR dem ersten Tipp bleibt stehen: auf iOS ist sie
 * ohnehin verloren (dort darf vorher nichts sprechen), auf jedem
 * anderen Geraet ist sie das erste, was ein Kind hoert, das nicht
 * liest. Sie wegzunehmen hiesse, einen Verlust zu verallgemeinern. */
function stimmeEntsperren(){
  if (entsperrt || !('speechSynthesis' in window)) return;
  entsperrt = true;
  try {
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(''));
  } catch(e){}
}
for (const art of ['pointerdown', 'touchend', 'click'])
  addEventListener(art, stimmeEntsperren, { capture: true, passive: true });

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
 * --- Was hier eine Runde gekostet hat (M4s) --------------------------
 *
 * Oben standen `sandy` und `shelley`, mit der Begruendung, das seien die
 * Namen, unter denen Apple „seine hellen, zugewandten Ansagestimmen
 * fuehrt". Das war geraten und falsch: **Sandy, Shelley, Eddy, Flo,
 * Grandma, Grandpa, Reed und Rocko sind Apples SPASS-Stimmen** aus
 * iOS 17 - absichtlich uebertrieben, teils verzerrt. Auf einem
 * iPhone XR hat die App damit genau das getan, was gemeldet wurde: „eine
 * sehr wirre, komische Stimme".
 *
 * Der Fehler war nicht die Reihenfolge, sondern dass eine VERMUTUNG als
 * Rangliste dastand und nie an einem Geraet geprueft wurde. Deshalb
 * jetzt zwei Listen statt einer:
 *
 *   `LIEBLINGE`  Namen, unter denen Apple und Google ihre ruhigen
 *                Vorlesestimmen fuehren. Anna ist die deutsche
 *                Standardstimme seit Jahren.
 *   `SPASSIG`    Namen, die NIE von allein gewaehlt werden. Sie bleiben
 *                im Elternbereich anwaehlbar - wer sie mag, darf sie
 *                haben -, aber die App greift nicht selbst danach.
 *
 * Und unter gleichen Namen gewinnt die bessere Fassung: Apple fuehrt
 * dieselbe Stimme als „Anna", „Anna (Premium)" und „Anna (Erweitert)".
 */
const LIEBLINGE = ['anna','helena','petra','markus','martin','viktor',
                   'marlene','katja','vicki','google deutsch'];
/* Apples Spass- und Ausdrucksstimmen (iOS 17+) und die alten
 * Roboterstimmen. Sie klingen fuer ein Kind nicht freundlich, sondern
 * kaputt - und eine kaputt klingende Stimme liest keine Frage vor. */
const SPASSIG = ['sandy','shelley','eddy','flo','grandma','grandpa','reed','rocko',
                 'bubbles','jester','trinoids','whisper','zarvox','wobble','boing',
                 'bells','bahh','cellos','organ','superstar','albert','bad news',
                 'good news','junior','kathy','ralph','fred','deranged','hysterical',
                 'bruce','princess','pipe organ'];
const istSpassig = (name) => SPASSIG.some(n => name.toLowerCase().includes(n));
/** „Anna (Premium)" schlaegt „Anna" - dieselbe Stimme, bessere Fassung. */
const guete = (v) => /premium|erweitert|enhanced/i.test(v.name + ' ' + (v.voiceURI || '')) ? 1 : 0;

/**
 * Die Wahl selbst - eine reine Funktion ueber eine Liste.
 *
 * Ausgelagert, damit ein Tor sie pruefen kann, ohne einen Browser mit
 * deutschen Stimmen zu brauchen: `npm run schreiben`… nein, `inhalt`
 * legt ihr eine erfundene Stimmenliste vor, in der die Spass-Stimmen
 * ganz oben stehen, und prueft, dass sie nicht danach greift. Vorher
 * steckte diese Entscheidung mitten in einer Funktion, die ohne
 * `speechSynthesis` gar nicht lief - und war damit von keinem Tor
 * erreichbar.
 */
function stimmeWaehlen(liste, wunsch){
  const s = liste || [];
  if (wunsch) { const w = s.find(v => v.name === wunsch); if (w) return w; }
  const ernst = s.filter(v => !istSpassig(v.name));
  for (const n of LIEBLINGE) {
    const treffer = ernst.filter(v => v.name.toLowerCase().includes(n));
    if (treffer.length) return treffer.sort((a, b) => guete(b) - guete(a))[0];
  }
  return ernst.find(v => v.localService) || ernst[0] || s[0] || null;
}
/* Die Stimmen einer Sprache (E2).
 *
 * Bis hierher gab es nur deutsche - `alleStimmen()` filterte hart auf
 * „de". Fuer die vierte Welt sagt die App englische Woerter, und eine
 * deutsche Stimme spricht „cat" wie „katt". Das ist keine Kleinigkeit:
 * die ganze Form „Hoeren und zeigen" haengt daran, dass das gehoerte Wort
 * das englische IST.
 *
 * Der Praefix statt der vollen Kennung: „en" trifft en-US, en-GB, en-AU.
 * Welche davon, entscheidet dieselbe Guete-Ordnung wie beim Deutschen. */
function alleStimmen(sprache = 'de'){
  return ('speechSynthesis' in window)
    ? speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(sprache)) : [];
}
// Der Name der gewaehlten Stimme steht hier und NICHT in `Einst`.
//
// Die Stimmensuche laeuft beim Laden - `voiceschanged` kann sofort feuern -,
// und `Einst` wird erst weiter unten deklariert. Ein `let` ist bis dahin
// nicht lesbar (temporale tote Zone), und die App startete mit
// „Cannot access 'Einst' before initialization" gar nicht mehr. Gefunden
// hat das der Rauchtest, sechzehnmal auf einmal.
let stimmenWunsch = null;
/* Die englische Stimme wird NICHT gewaehlt, sondern gefunden - oder eben
 * nicht (E2).
 *
 * Kein Wunsch, keine Lieblingsliste: die Namen in `LIEBLINGE` sind Apples
 * deutsche Ansagestimmen und sagen ueber eine englische nichts. Genommen
 * wird die beste ernste, die da ist; ist keine da, bleibt sie `null`, und
 * das ist eine Auskunft und kein Fehler. Ein Geraet ohne englische Stimme
 * gibt es wirklich - dann muss die App das SAGEN statt still deutsch zu
 * sprechen. Deutsch gesprochenes Englisch ist schlimmer als kein Ton:
 * das Kind lernt eine falsche Aussprache und merkt es nicht. */
let stimmeEn = null;
function stimmeSuchen(){
  stimme = stimmeWaehlen(alleStimmen('de'), stimmenWunsch);
  stimmeEn = stimmeWaehlen(alleStimmen('en'), null);
}
if ('speechSynthesis' in window){ stimmeSuchen(); speechSynthesis.addEventListener('voiceschanged',stimmeSuchen); }
/** Gibt es auf diesem Geraet ueberhaupt eine englische Stimme? */
function englischHoerbar(){ return !!stimmeEn; }
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
 * langsam - lange Namen muessen zu Ende gehoert werden koennen; bis A5
 * war „Australien und Ozeanien" der laengste, heute „Vereinigtes
 * Koenigreich".
 */
const TEMPO = 0.9, HOEHE = 1.06;
function sprich(satz, hoehe = HOEHE, sprache = 'de'){
  const u = new SpeechSynthesisUtterance(satz);
  const en = sprache === 'en';
  /* Die Kennung kommt von der STIMME, wo es eine gibt, und nur sonst aus
     der Voreinstellung. Ein `u.lang` von „en-US" auf einer Stimme, die
     „en-GB" spricht, ist auf manchen Geraeten der Unterschied zwischen
     der gewaehlten Stimme und der Voreingestellten. */
  u.lang = en ? (stimmeEn?.lang || 'en-GB') : (stimme?.lang || 'de-DE');
  /* Englisch eine Spur langsamer: es ist die Fremdsprache, und das Kind
     soll das Wort HOEREN, nicht erraten. Kein neuer Wert - derselbe
     Abschlag, den `?flott` benutzt, nur in die andere Richtung. */
  u.rate = en ? TEMPO * 0.9 : TEMPO;
  u.pitch = hoehe;
  const v = en ? stimmeEn : stimme;
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
/* Solange die App ZUHOERT, schweigt sie.
 *
 * Vom Zielgeraet gemeldet und sofort einleuchtend: das Mikrofon hoert den
 * eigenen Lautsprecher mit. Die Aufgabe wird angesagt, das Kind tippt
 * waehrenddessen auf das Mikrofon - und die Erkennung bekommt die Stimme
 * der App ins Ohr, nicht die des Kindes. Wer „Wie heisst dieser Kontinent"
 * mitschreibt, findet darin keinen Kontinent.
 *
 * Das ist bewusst ein RIEGEL an EINER Stelle und kein Aufraeumen an
 * dreizehn Aufrufstellen: jede Stimme und jeder Ton der App laeuft durch
 * `vorlesen` oder `klangZu`. Wer eine vierzehnte Stelle dazubaut, ist
 * automatisch mit abgedeckt - dieselbe Ueberlegung wie bei Regel 6.
 *
 * `speechSynthesis.cancel()` beim Anschalten schneidet ab, was gerade
 * laeuft; der Riegel haelt, was danach kommt. Beides wird gebraucht: das
 * Abschneiden gegen den laufenden Satz, der Riegel gegen den naechsten. */
let hoertZu = false;
function hoerenBeginnt(){
  hoertZu = true;
  try{ if ('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){}
}
function hoerenEndet(){ hoertZu = false; }

function vorlesen(text, sprache = 'de'){
  if(hoertZu) return;
  if(!tonAn||!('speechSynthesis' in window)||!text) return;
  /* Lieber schweigen als falsch sprechen (E2). Ohne englische Stimme
     wuerde die deutsche einspringen und „cat" als „katt" sagen. Wer das
     merkt, ist nicht das Kind. */
  if (sprache === 'en' && !stimmeEn) return;
  try{ speechSynthesis.cancel();
    // Der Jubel darf eine Spur hoeher liegen als die Sache danach. Das ist
    // der Unterschied zwischen „Klasse!" und „Klasse."
    const saetze = String(text).split(/(?<=[.!?])\s+/).filter(Boolean);
    saetze.forEach((satz, i) => sprich(satz,
      i === 0 && /!$/.test(satz) ? HOEHE + 0.08 : HOEHE, sprache));
  }catch(e){}
}
/** Ein englisches Wort sagen - fuer die vierte Welt. */
function sagenEn(text){ if (!P || ton().spricht) vorlesen(text, 'en'); }

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

/* „Noch einmal hoeren" (A4).
 *
 * Fiona liest nicht: die Aufgabe UND die Moeglichkeiten kommen nur als
 * Ton. Wer beim ersten Mal nicht zugehoert hat oder ueberhoert wurde,
 * hatte bis A4 keinen Weg zurueck - ausser die Aufgabe aufzugeben.
 *
 * Der Knopf bekommt den Satz MITGEGEBEN und holt ihn nicht aus einer
 * gemerkten Variablen. Der erste Anlauf tat genau das: `ansagen()` merkte
 * sich die letzte Ansage, und der Knopf wurde angehaengt, wenn sie kam -
 * also in einem `setTimeout`. Damit war er auf den eingefrorenen
 * Aufnahmen mal da und mal nicht, je nachdem, wo der Bildschirmschuss
 * hinfiel; `ansicht` meldete drei Bilder rot, die sich gar nicht geaendert
 * hatten. Ein Knopf, der von einer Uhr abhaengt, ist nicht pruefbar.
 *
 * Er erscheint nur fuer ein Kind, dem vorgelesen wird - fuer alle anderen
 * waere er ein Knopf, der schweigt. */
/* Die SPRACHE gehoert zum Satz, nicht zum Knopf.
 *
 * Der erste Anlauf fuer E3 liess sie weg - der Knopf las das englische
 * Wort mit der deutschen Stimme vor („blue" als „blü-e"). Ein Knopf, der
 * eine falsche Aussprache wiederholt, ist schlimmer als keiner: er UEBT
 * sie. Und ohne englische Stimme gibt es ihn gar nicht, sonst waere er ein
 * Knopf, der schweigt - dieselbe Regel wie bei `P.vorlesen`. */
function nochHoerenKnopf(text, sprache = 'de', zaehlen = false){
  if (!P || !text) return null;
  /* Wer den Knopf bekommt, haengt an der SPRACHE - und das ist kein
     Sonderfall, sondern derselbe Satz von zwei Seiten: der Knopf steht da,
     wo er etwas zu wiederholen hat.
     Auf Deutsch wiederholt er eine VORLESEHILFE, also nur fuer ein Kind,
     dem vorgelesen wird. Auf Englisch wiederholt er die FRAGE - Lea traegt
     `vorlesen: false` und braucht ihn trotzdem, sie ist sogar die, die ihn
     am meisten braucht. Ohne englische Stimme gibt es ihn nicht: ein Knopf,
     der schweigt, ist schlimmer als keiner. */
  if (sprache === 'en') { if (!englischHoerbar()) return null; }
  else if (!P.vorlesen) return null;
  const b = el('button', 'knopf rund nochhoeren', ZEI('nochhoeren', 26));
  b.id = 'nochhoeren';
  b.setAttribute('aria-label', 'Aufgabe noch einmal hören');
  b.title = 'Noch einmal hören';
  // `vorlesen` und nicht `ansagen`: das hier ist eine BITTE, und eine
  // Bitte wird nicht vom Profil beantwortet - so wie die Karten im
  // Vorlauf und die Aufkleber im Buch.
  //
  // `zaehlen` (E12): wo der Satz SELBST die Aufgabe ist, ist das zweite
  // Hoeren die einzige Zahl, die ueberhaupt etwas ueber das Hoerverstehen
  // sagt - „richtig" allein waere auch die Antwort, die man erst beim
  // vierten Anlauf verstanden hat. Gezaehlt wird je Profil und ueber alle
  // Sitzungen; es kostet keinen Versuch und keinen Stern, die Zahl steht
  // nur im Elternbereich. Eine Zahl, die man sieht, wirkt ohne Strafe.
  b.onclick = () => {
    if (zaehlen) {
      Einst.nochmalGehoert = { ...(Einst.nochmalGehoert || {}),
        [P.id]: (Einst.nochmalGehoert?.[P.id] || 0) + 1 };
      einstSichern();
    }
    vorlesen(text, sprache);
  };
  return b;
}

/** Den Nachhoer-Knopf ins Werkzeug haengen - wenn es einen gibt.
 *
 * Mit E5 stand derselbe Vierzeiler zum VIERTEN Mal da (Rechnen, Englisch,
 * Legen, Laute). Wenig Text, und trotzdem vier Stellen, an denen dasselbe
 * zu wissen ist: der Knopf gehoert ins `.werkzeug`, und `nochHoerenKnopf`
 * gibt `null` zurueck, wenn es nichts zu hoeren gibt. Wer die zweite
 * Haelfte an einer der vier vergisst, haengt `null` an - und zwar genau
 * auf den Geraeten ohne englische Stimme, also nie hier.
 *
 * NICHT erfasst sind die zwei Stellen, die in ein anderes Werkzeug
 * haengen (`sagenschirm` und `spielschirm` halten es als Variable). Sie
 * mit einem Zweig aufzunehmen hiesse, dem Bauteil eine Frage zu stellen,
 * die es nicht hat. */
const nochHoerenIns = (s, text, sprache = 'de') => {
  const b = nochHoerenKnopf(text, sprache);
  if (b) s.querySelector('.werkzeug')?.appendChild(b);
};

/* Was die App VON SICH AUS sagt: das Lob, die Hinweise beim Ziehen, die
 * Nachfrage vor dem Loeschen, die Bestaetigung des Namens.
 *
 * Zwei Achsen, und sie meinen Verschiedenes:
 *
 *   `vorlesen`  „lies mir die AUFGABE vor, ich kann noch nicht lesen"
 *               - eine Hilfe. Nur Fiona braucht sie.
 *   `ton`       „wie redet die App mit mir, wenn sie von sich aus redet"
 *               - kindlich darf jubeln, sachlich schweigt.
 *
 * Dreizehn Stellen riefen bis hierher `vorlesen` unbedingt und damit an
 * jedem Profil vorbei. Lea traegt `vorlesen: false` und hoerte trotzdem
 * jedes Lob; die Eltern bekamen „Super gemacht!" ins Ohr. Aufgefallen ist
 * das nie, weil der Rauchtest nur die ANSAGE der Aufgabe zaehlt.
 *
 * Was NICHT hierhergehoert: was jemand ausdruecklich angetippt hat, um es
 * zu hoeren (die Karten im Vorlauf, die Aufkleber im Buch, die Stimmprobe
 * im Elternbereich). Eine Bitte wird nicht vom Profil beantwortet. */
function sagen(text){ if (!P || ton().spricht) vorlesen(text); }

/** Eine Aufzaehlung, wie man sie spricht: „A, B, C oder D". */
/* `wort` ist das letzte Bindewort und steht mit dabei: eine WAHL wird mit
   „oder" aufgezaehlt („Fiona, Lea, Stephan oder Violeta?"), eine
   AUFZAEHLUNG mit „und" („Kaenguru, Koala und Schlange"). Der erste
   Anlauf hatte nur „oder" und sagte damit „das Kaenguru, der Koala ODER
   die Schlange" ueber drei Tiere, die man alle drei bekommt. */
/* Zahlwörter bis fünf, für Sätze, in denen eine Ziffer stören würde
   („2 Länder hier sind besonders"). Darüber gibt es nichts zu schreiben:
   der Aufruf fällt auf die Zahl zurück, und mehr als fünf abweichende
   Regierungssitze auf EINER Karte hätte ohnehin einen anderen Satz
   verdient. */
/* WIEVIEL GROESSER - in Worten, die ein sechsjaehriges Kind kennt (I22).
 *
 * `mal` ist das wirkliche Verhaeltnis der Flaechen auf eine
 * Nachkommastelle (siehe `groesserPaare` in erdkunde.js). Eine nackte
 * Zahl waere hier falsch verstanden: „1,6-mal so gross" sagt einem
 * Erstklaessler nichts, und „doppelt so gross" bei 1,6 waere gelogen.
 *
 * Die Stufen sind so gelegt, dass jede Aussage stimmt: bis 1,75 heisst
 * es „eineinhalbmal" (hoechstens 17 % daneben), bis 2,25 „doppelt"
 * (hoechstens 12 %), darueber die gerundete Zahl mit einem
 * ausdruecklichen „ungefaehr". Der Faktor beginnt bei 1,5 - darunter
 * gibt es kein Paar.
 */
const groesserSatz = (z) => {
  const m = z.mal;
  const wie = m < 1.75 ? 'eineinhalbmal so groß'
            : m < 2.25 ? 'doppelt so groß'
            : m < 2.75 ? 'zweieinhalbmal so groß'
            : m < 3.5  ? 'dreimal so groß'
            : `ungefähr ${Math.round(m)}-mal so groß`;
  return `${z.name} ist ${wie} wie ${z.kleinName}.`;
};

const ZAHLWORT = [null, 'Ein', 'Zwei', 'Drei', 'Vier', 'Fünf'];
const aufzaehlen = (namen, wort = 'oder') => namen.length < 2 ? (namen[0] || '')
  : namen.slice(0, -1).join(', ') + ` ${wort} ` + namen[namen.length - 1];

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
/* Zwei Toene, und die Regel dahinter steht in EINEM Satz:
 *   kindlich ruft, sachlich stellt fest.
 *
 * Am Ausrufezeichen ist das mechanisch zu erkennen, und darauf pruefen die
 * Tore - „Super gemacht!" gegen „Richtig.". Ein Erwachsener, der das
 * grosse Einmaleins uebt, will nicht gelobt werden wie eine Sechsjaehrige;
 * ein Kind schon, und zwar nicht jedes Mal mit demselben Wort.
 *
 * Welcher Ton gilt, steht am Profil (`ton`) - eine Eigenschaft wie
 * `vorlesen` oder `streng`, nicht eine Abfrage auf den Namen. */
const TON = {
  kind: {
    spricht: true,
    siegsterne: true,
    /* Der Lohn (G14) - hier und nicht an drei Stellen im Bildschirmbau.
       „kindlich darf jubeln, sachlich schweigt" stand als Satz schon
       oben; das ist derselbe Satz als Schalter. */
    feier: true,
    lob:  ['Super gemacht!', 'Ganz genau!', 'Richtig!', 'Klasse!',
           'Das stimmt!', 'Toll gemacht!', 'Perfekt!', 'Prima!'],
    ende: 'Geschafft!',
    ersterKleber: 'Beim zweiten Mal richtig gibt es einen Aufkleber.',
    neueKleber: (n) => `${n} neu${n === 1 ? '' : 'e'}!`,
    /* Der ANGESAGTE Aufkleber-Satz. Er stand bis hierher als
       „ Neuer Aufkleber!" an ACHT Stellen fest im Quelltext - also mit
       Ausrufezeichen, auch fuer die Profile, die sachlich angesprochen
       werden. Das Tor prueft „das Lob ruft nicht", und es hat den Fehler
       jahrelang nicht gesehen, weil die Eltern im geprueften Durchgang
       nie einen neuen Aufkleber bekamen. Erst der Bogen (N3) hat die
       Reihenfolge so geaendert, dass sie einen bekamen. */
    kleberSagt: ' Neuer Aufkleber!',
  },
  sachlich: {
    spricht: false,
    feier: false,
    /* Keine Sterne auf dem Endbildschirm.
     *
     * Nicht aus Geschmack: sie sagen dasselbe wie die Zeile darunter.
     * Drei Sterne heissen „alles auf Anhieb richtig", und genau das steht
     * eine Zeile tiefer als „12 von 12 auf Anhieb richtig" - nur genauer.
     * Was zweimal dasteht, veraltet einmal (Regel 6), und von den beiden
     * ist die Zahl die haltbarere.
     *
     * Im KOPF waehrend der Sitzung bleiben sie: dort sind sie der einzige
     * laufende Punktestand, also nicht doppelt. */
    siegsterne: false,
    lob:  ['Richtig.', 'Stimmt.', 'Korrekt.', 'Sitzt.'],
    ende: 'Sitzung beendet.',
    ersterKleber: 'Ab dem zweiten Mal richtig kommt ein Gebiet ins Buch.',
    neueKleber: (n) => `${n} neu`,
    kleberSagt: ' Neuer Aufkleber.',
  },
};
/** Was zum neuen Aufkleber GESAGT wird - im Ton des Profils, an einer
 *  Stelle. Acht feste Zeichenketten waren acht Gelegenheiten, den Ton zu
 *  vergessen; genau eine davon hat ihn vergessen. */
const kleberSatz = (neu) => neu ? ton().kleberSagt : '';

/** Der Ton des laufenden Profils. Vor der Profilwahl gilt der kindliche. */
const ton = () => TON[P?.ton] || TON.kind;
/* Hier stand ausserdem `FAST_LOB = ['Fast!', 'Ganz nah dran!', 'Beinahe!']`.
 * Es wurde nie gelesen - die fast richtige Antwort bekommt ihren Satz aus
 * der Bewertung, nicht aus einem Vorrat. Ein Vorrat, den niemand zieht,
 * sieht wie eine Zusage aus und ist keine; deshalb ist er weg statt
 * mitgewandert. */
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
function lob(vorrat = ton().lob){
  if (vorrat.length < 2) { letztesLob = 0; return vorrat[0]; }
  const andere = vorrat.map((_, i) => i).filter(i => i !== letztesLob);
  const i = andere[Math.floor(Math.random() * andere.length)];
  letztesLob = i; return vorrat[i];
}

/* ---------- Der Streu auf den Profilkacheln (G12) ------------------------
 *
 * Jedes Kind bekommt sein eigenes Muster auf die Kachel: Fiona Meer und
 * Himmel - Schildkroeten, Fische, Quallen, Seepferdchen, Muscheln, dazu
 * Sterne und Herzen -, Lea die Totenkoepfe aus Mexiko.
 *
 * WOZU das gut ist und nicht nur huebsch: die Kachel war bisher nur an
 * ihrer Farbe zu unterscheiden. Fiona liest nicht - fuer sie ist "Fiona"
 * kein Wort, sondern ein Fleck, und der Buchstabe im Kreis ist auch nur
 * einer. Blieb die Farbe. Mit Tuerkis neben Hellgruen liegen die beiden
 * Kinderkacheln jetzt 45 Grad im Farbkreis auseinander - erkennbar, aber
 * eng. Das Muster traegt den Unterschied, den die Farbe allein nicht mehr
 * traegt: eine Kachel voller Meerestiere und eine voller Totenkoepfe
 * verwechselt niemand.
 *
 * Drei Entscheidungen, die man sonst spaeter noch einmal treffen muss:
 *
 * KEINE TINTENKONTUR. Stern und Pokal haben eine, weil sie etwas
 * bedeuten - erreicht, verdient, gezaehlt. Der Streu bedeutet nichts.
 * Bekaeme er dieselbe Kontur, suchte ein Kind darin eine Bedeutung, die
 * es nicht gibt. Ausnahme ist der Totenkopf: der ist WEISS und muesste
 * sonst im Hellgruen verschwinden. Seine Kontur ist gruen, nicht Tinte -
 * ein Umriss, kein Zeichen.
 *
 * FESTE PLAETZE, kein Zufall. Ein gewuerfelter Streu saehe bei jedem
 * Laden anders aus - und `ansicht` vergleicht Bildpunkte. Ein Tor, das
 * bei jedem Lauf etwas anderes sieht, ist keins mehr. Die Tafel unten
 * IST das Bild.
 *
 * PROZENT, KEINE PUNKTE. Die Kachel ist auf dem Telefon quer rund
 * 190 x 125 Punkte gross und auf dem Schreibtisch 240 x 250 - fast
 * doppelt so hoch. Mit festen Punkten waere der Streu in einem der
 * beiden Faelle ein Haufen in einer Ecke.
 */
const AUGE_VERLAUF = (id)=>`<linearGradient id="${id}" x1="0" y1="0" x2=".8" y2="1">`
  + '<stop offset="0" stop-color="var(--auge-blau)"/>'
  + '<stop offset=".55" stop-color="var(--auge-gruen)"/>'
  + '<stop offset="1" stop-color="var(--auge-blau)"/></linearGradient>';

/* Ein Motiv ist ein Ausschnitt und ein Stueck Markup. `currentColor` holt
   die Farbe von aussen - deshalb genuegt EIN Fisch fuer sechs Farben. */
const MOTIV = {
  stern: { vb: STERN_VB, d: `<path d="${STERN_D}"/>` },
  herz: { vb:'0 0 24 24', d:'<path d="M12 21.4C12 21.4 2.6 14.8 2.6 8.8c0-3.2 2.4-5.4 5.3-5.4 1.8 0 3.2.9 4.1 2.2.9-1.3 2.3-2.2 4.1-2.2 2.9 0 5.3 2.2 5.3 5.4 0 6-9.4 12.6-9.4 12.6Z"/>' },
  /* Die Schildkroete von OBEN. Der erste Entwurf hatte die Flossen unter
     dem Panzer und ein Gitter darauf - auf der Kachel war das ein Karo,
     kein Tier. Jetzt stehen alle vier Flossen und der Kopf DEUTLICH ueber
     den Panzerrand hinaus, und der Panzer traegt einen Ring statt eines
     Gitters: das ist die Silhouette, an der man sie bei 21 Punkten
     erkennt. */
  schildkroete: { vb:'0 0 24 24', d:
      '<ellipse cx="19.6" cy="12" rx="2.6" ry="2.3"/>'
    + '<path d="M4.9 12 1.9 10.7v2.6Z"/>'
    + '<ellipse cx="15.9" cy="6.2" rx="3" ry="1.5" transform="rotate(40 15.9 6.2)"/>'
    + '<ellipse cx="15.9" cy="17.8" rx="3" ry="1.5" transform="rotate(-40 15.9 17.8)"/>'
    + '<ellipse cx="6.6" cy="6.8" rx="2.8" ry="1.4" transform="rotate(-38 6.6 6.8)"/>'
    + '<ellipse cx="6.6" cy="17.2" rx="2.8" ry="1.4" transform="rotate(38 6.6 17.2)"/>'
    + '<ellipse cx="11.5" cy="12" rx="6.6" ry="5.5"/>'
    + '<g fill="none" stroke="var(--papier)" stroke-width="1.1" opacity=".7">'
    + '<ellipse cx="11.5" cy="12" rx="3.4" ry="2.8"/>'
    + '<path d="M11.5 9.2V7M11.5 14.8V17M8.1 12H5.6M14.9 12h2.5"/></g>' },
  fisch: { vb:'0 0 24 24', d:
      '<path d="M8.8 12c0-3.5 3.1-6.2 6.6-6.2s6.4 2.7 6.4 6.2-2.9 6.2-6.4 6.2S8.8 15.5 8.8 12Z"/>'
    + '<path d="M9.1 12 2.4 7.2v9.6Z"/>'
    + '<circle cx="17.9" cy="10.2" r="1.05" fill="var(--papier)"/>' },
  qualle: { vb:'0 0 24 24', d:
      '<path d="M4.4 12.8a7.6 7.6 0 0 1 15.2 0c0 .9-.7 1.7-1.7 1.7H6.1c-1 0-1.7-.8-1.7-1.7Z"/>'
    + '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">'
    + '<path d="M7.6 15c.3 2.2-1 3-.9 4.9M11.8 15c.2 2.4-.8 3.3-.6 5.2M15.8 15c-.3 2.2 1 3 .9 4.9"/></g>' },
  /* Hier stand ein Seepferdchen. Auf der Kachel war es eine Drei - der
     Hals, die Schnauze und der Ringelschwanz sind bei 21 Punkten kein
     Tier mehr, sondern eine Ziffer. Ein Wal traegt seine ganze Auskunft
     im Umriss und haelt jede Groesse aus. */
  wal: { vb:'0 0 24 24', d:
      '<path d="M2.8 13c0-3.7 3.7-6.6 8.3-6.6 4.5 0 8.2 2.6 9 6.1l2.5-2.9c.5-.6 1.4-.2 1.4.6'
    + 'v6.2c0 .8-.9 1.2-1.4.6l-2.6-3c-1.1 2.9-4.4 4.9-8.3 4.9C6.4 19 2.8 16.2 2.8 13Z"/>'
    + '<circle cx="6.6" cy="11.8" r="1.05" fill="var(--papier)"/>'
    + '<path d="M8.6 6.6c-.2-1.5.5-2.8 1.9-3.4" fill="none" stroke="currentColor"'
    + ' stroke-width="1.5" stroke-linecap="round"/>' },
  seestern: { vb:'0 0 24 24', d:
      '<path d="M12 2.6c.6 0 1.1.4 1.4 1.1l1.9 4.8 5.1.4c.8.1 1.3.5 1.5 1.1.2.6 0 1.2-.6 1.7l-3.9 3.3 1.2 5c.2.8 0 1.4-.5 1.7-.5.4-1.1.4-1.8 0L12 18.9l-4.3 2.8c-.7.4-1.3.4-1.8 0-.5-.3-.7-.9-.5-1.7l1.2-5-3.9-3.3c-.6-.5-.8-1.1-.6-1.7.2-.6.7-1 1.5-1.1l5.1-.4 1.9-4.8c.3-.7.8-1.1 1.4-1.1Z"/>'
    + '<g fill="var(--papier)" opacity=".65"><circle cx="12" cy="9.8" r=".95"/>'
    + '<circle cx="9.5" cy="13.2" r=".75"/><circle cx="14.5" cy="13.2" r=".75"/>'
    + '<circle cx="12" cy="15.6" r=".65"/></g>' },
  /* Die Jakobsmuschel. Sie war zuerst falsch herum - Dach oben, Schloss
     obendrauf -, und dann sah sie aus wie ein Heissluftballon. Eine
     Muschel haengt am SCHLOSS: unten schmal, nach oben auffaechernd, und
     die obere Kante ist gewellt. Fuenf Wellen, fuenf Rippen. */
  muschel: { vb:'0 0 24 24', d:
      '<path d="M12 20.9c-.95 0-1.7-.6-1.7-1.35 0-.35.15-.68.42-.92'
    + 'C6.35 16.15 2.5 11.6 2.5 7.4q1.9-2.6 3.8 0 1.9-2.6 3.8 0 1.9-2.6 3.8 0'
    + ' 1.9-2.6 3.8 0 1.9-2.6 3.8 0c0 4.2-3.85 8.75-8.22 11.23'
    + '.27.24.42.57.42.92 0 .75-.75 1.35-1.7 1.35Z"/>'
    + '<g fill="none" stroke="var(--papier)" stroke-width="1" stroke-linecap="round" opacity=".65">'
    + '<path d="M12 18.2V8.6M10.2 17.8 7 9.6M13.8 17.8 17 9.6M8.2 16.4 4.6 9.8M15.8 16.4 19.4 9.8"/></g>' },
  schnecke: { vb:'0 0 24 24', d:
      '<path d="M20.9 12.3c0 4.7-4 8.4-9 8.4-4.4 0-8-3.1-8-7 0-3.5 2.9-6.2 6.5-6.2 3.2 0 5.7 2.3 5.7 5.2 0 2.5-2 4.4-4.5 4.4-2.2 0-3.9-1.6-3.9-3.6 0-1.7 1.4-3.1 3.2-3.1"'
    + ' fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' },
  /* Der Totenkopf. Zuckerschaedel, kein Knochenfund: runde Stirn, Blume
     darauf, und die Augen sind das Auffaellige an ihm. */
  totenkopf: { vb:'0 0 24 24', auge:true, d:
      '<path d="M12 2.2c5.3 0 9 3.6 9 8.4 0 2.7-1.1 4.6-2.5 5.7-.6.5-.9 1-.9 1.8v1.1c0 1.7-1.3 2.6-2.9 2.6H9.3c-1.6 0-2.9-.9-2.9-2.6v-1.1c0-.8-.3-1.3-.9-1.8C4.1 15.2 3 13.3 3 10.6 3 5.8 6.7 2.2 12 2.2Z"'
    + ' fill="var(--knochen)" stroke="var(--knochen-rand)" stroke-width="1"/>'
    + '<ellipse cx="8.2" cy="10.6" rx="2.75" ry="3" fill="url(#@AUGE@)"/>'
    + '<ellipse cx="15.8" cy="10.6" rx="2.75" ry="3" fill="url(#@AUGE@)"/>'
    + '<circle cx="7.2" cy="9.4" r=".8" fill="var(--auge-licht)"/>'
    + '<circle cx="14.8" cy="9.4" r=".8" fill="var(--auge-licht)"/>'
    + '<circle cx="12" cy="5.3" r="1.25" fill="url(#@AUGE@)"/>'
    + '<path d="M12 13.6c.85 0 1.5.65 1.5 1.4 0 .7-.65 1.25-1.5 1.25s-1.5-.55-1.5-1.25c0-.75.65-1.4 1.5-1.4Z"'
    + ' fill="var(--knochen-rand)"/>'
    + '<g stroke="var(--knochen-rand)" stroke-width=".9" stroke-linecap="round">'
    + '<path d="M9.4 18.6v3M12 18.6v3.2M14.6 18.6v3"/></g>' },
};

/* Die Tafel. Je Eintrag: Motiv, links %, oben %, Groesse, Drehung, Farbe.
 *
 * Fiona: der Meeresgrund unten (Muscheln, Schnecke), die Tiere in der
 * Mitte, Sterne und Herzen oben. Die Schildkroeten sind ausdruecklich in
 * DREI Farben - danach war gefragt, und drei gleiche waeren ein Muster,
 * keine Sammlung.
 *
 * Lea: nur Totenkoepfe, alle klein bis mittel, alle weiss. Eine einzige
 * Sorte, dafuer viele - so sehen die Papierketten aus, an denen sie
 * haengen.
 *
 * Frei bleibt, was der NAME braucht - das grosse fette Wort zwischen 47
 * und 63 Prozent Hoehe, und der Kreis darueber. Die Zeile darunter ("6
 * Jahre - ziehen und sprechen") darf ueberdeckt werden: sie ist klein,
 * grau und steht ohnehin schon auf der grossen Muschel. Der Unterschied
 * ist am Bild entschieden worden, nicht am Grundriss: drei Motive lagen
 * im ersten Anlauf auf dem Namen, und genau die drei sind umgezogen.
 *
 * Die Zahlen sind Prozent der Kachel, gezaehlt von der MITTE des Motivs.
 */
const STREU = {
  fiona: [
    ['muschel',      85, 73, 'g',   8, '--streu-pink'],
    ['schildkroete', 13, 25, 'm', -14, '--streu-leuchtgruen'],
    ['schildkroete', 19, 86, 'k',  18, '--streu-blau'],
    ['schildkroete', 88, 27, 'k', -22, '--streu-orange'],
    ['schildkroete', 66, 37, 'k',  10, '--streu-lila'],
    ['wal',          21, 48, 'm',  -6, '--streu-blau'],
    ['fisch',         7, 66, 'k',   7, '--streu-gelb'],
    ['fisch',        68, 92, 'k',  -9, '--streu-leuchtgelb'],
    ['qualle',       69, 11, 'k',   0, '--streu-lila'],
    ['seestern',     29, 36, 'k', -15, '--streu-rot'],
    ['seestern',     78, 46, 'k',  11, '--streu-leuchtgelb'],
    ['schnecke',      6, 90, 'k', -10, '--streu-orange'],
    ['stern',        35,  6, 'k',   0, '--streu-leuchtgelb'],
    ['stern',        94, 52, 'k',  13, '--streu-gelb'],
    ['herz',         11,  8, 'k', -12, '--streu-pink'],
    ['herz',         92,  9, 'k',   9, '--streu-rot'],
  ],
  lea: [
    ['totenkopf', 13, 19, 'm', -11, '--knochen'],
    ['totenkopf', 87, 25, 'm',  13, '--knochen'],
    ['totenkopf', 30,  9, 'k',   0, '--knochen'],
    ['totenkopf', 69,  9, 'k',   5, '--knochen'],
    ['totenkopf',  9, 60, 'k',   9, '--knochen'],
    ['totenkopf', 91, 64, 'k',  -9, '--knochen'],
    ['totenkopf', 28, 88, 'k', -15, '--knochen'],
    ['totenkopf', 72, 90, 'k',  12, '--knochen'],
    ['totenkopf', 22, 41, 'k',  17, '--knochen'],
    ['totenkopf', 78, 43, 'k', -17, '--knochen'],
  ],
};

/**
 * Die Bildseite einer Profilkachel. Leer, wenn das Profil keine hat -
 * die Eltern bekommen keinen Streu, und `''` ist hier kein Sonderfall,
 * sondern die Regel fuer alle, die nicht in der Tafel stehen.
 */
function streu(profilId){
  const tafel = STREU[profilId];
  if (!tafel) return '';
  const augeId = `auge-${profilId}`;
  /* Der Verlauf wird EINMAL je Kachel abgelegt, mit dem Profil im Namen.
     Zwei gleiche Kennungen in einem Dokument sind ungueltig, und der
     Browser nimmt dann irgendeine - meistens die falsche. */
  const braucht = tafel.some(([m]) => MOTIV[m].auge);
  const defs = braucht
    ? `<svg class="streu-defs" aria-hidden="true"><defs>${AUGE_VERLAUF(augeId)}</defs></svg>` : '';
  const teile = tafel.map(([m, x, y, gr, dreh, farbe])=>{
    const { vb, d } = MOTIV[m];
    return `<i class="${gr}" data-motiv="${m}"`
      + ` style="left:${x}%;top:${y}%;--dreh:${dreh}deg;color:var(${farbe})">`
      + `<svg viewBox="${vb}" fill="currentColor" aria-hidden="true">`
      + `${d.split('@AUGE@').join(augeId)}</svg></i>`;
  }).join('');
  return `<div class="streu" aria-hidden="true">${defs}${teile}</div>`;
}

/* ---------- Profile und Ebenen ------------------------------------------ */
/* Die Farben sind gewuenscht, nicht gewuerfelt: Fiona tuerkis, Lea
   hellgruen, Stephan blau. Violeta behaelt ihr Violett - sie war nicht
   gemeint, und eine Farbe, die niemand geaendert haben will, aendert man
   nicht mit.
   Genommen wird aus der VORHANDENEN Palette (`--f1` bis `--f7`), nicht neu
   gemischt: die sieben sind auf gleiche Helligkeit geeicht, damit derselbe
   Textton auf allen lesbar ist. Eine achte Farbe daneben waere die eine,
   auf der der Name nicht mehr traegt. Es ist deshalb ein Tausch:
   f7 -> f4 (Fiona), f5 -> f3 (Lea), f3 -> f5 (Stephan). */
const PROFILE = {
  fiona:{ id:'fiona', name:'Fiona', alter:6, eingabe:['ziehen','sprechen'], vorlesen:true,
          kandidaten:4, laenderTiefe:3, sitzung:6, streng:false, ton:'kind', farbe:'--f4' },
  /* Leas Laendertiefe steht seit D2c auf 13 statt 5.
     Europa hat die neun Nachbarn Deutschlands auf die Raenge 4 bis 12
     bekommen; 13 ist Italien. Damit hat sie alles, was sie vorher hatte,
     UND die Nachbarn - nichts faellt aus ihrem Vorrat heraus.

     Auf der Ebene „Hauptstaedte" bekommt sie DREI dazu: Warschau,
     Amsterdam, Bruessel. Dort zaehlt zusaetzlich `l.hauptstadt`, und die
     haben Polen, die Niederlande und Belgien laengst - sie lagen nur
     ausserhalb ihrer alten Tiefe. Die fuenf NEUEN Nachbarn haben noch
     keine, also sind es acht statt fuenf und nicht dreizehn.
     Nachgezaehlt, nicht geschaetzt: der erste Anlauf schrieb hier
     „aendert sich fuer sie nichts". */
  /* `sprechen` haben seit A4 ALLE Profile.
   *
   * Es war Fionas Weg, weil sie nicht schreiben kann. Aber es ist auch
   * der Weg von jemandem, der schreiben KANN und nicht will: „Wie heisst
   * dieses Land?" mit siebzehn Laendern im Vorrat sind siebzehn getippte
   * Namen, und der Sinn der Uebung ist das Land, nicht die Tastatur.
   *
   * Es bleibt eine OPTION und wird niemandem aufgedraengt: das Mikrofon
   * erscheint nur, wenn der Sprachmodus im Elternbereich an ist, und das
   * Schreibfeld bleibt daneben stehen. Wer tippen will, tippt. */
  lea:  { id:'lea', name:'Lea', alter:8, eingabe:['ziehen','tippen','sprechen'], vorlesen:false,
          kandidaten:99, laenderTiefe:13, sitzung:8, streng:true, ton:'kind', farbe:'--f3' },
  /* Die Eltern - seit N1 ZWEI Profile, Stephan und Violeta.
   *
   * Bis dahin war es eines, „Eltern". Es hat sich als eine Kachel gut
   * gespielt und schlecht verglichen: zwei Menschen, die sich messen
   * wollen, teilten sich einen Leitner-Stand, und wer besser war, liess
   * sich nicht sagen, weil beide dieselbe Spalte fuellten.
   *
   * Alles andere bleibt GLEICH - Eingabe, Tiefe, Sitzungslaenge, Ton,
   * kein Auswahlverbot weniger. Das ist die Bedingung des Vergleichs: wer
   * verschiedene Aufgaben bekaeme, koennte nicht verglichen werden.
   * Verschieden ist nur der Name und die Farbe, damit die beiden Kacheln
   * auseinanderzuhalten sind.
   *
   * `kandidaten:0` heisst „nie eine Auswahl". Bis R4 war die Zahl der
   * Moeglichkeiten bei den Bundeslaendern fest verdrahtet (`? 4 :`) und
   * das Profil wurde dort gar nicht gefragt - die Eltern haetten also mit
   * vier Moeglichkeiten geraten, oder die Kinder haetten ihre verloren. */
  stephan: { id:'stephan', name:'Stephan', alter:null, eingabe:['tippen','sprechen'], vorlesen:false,
          kandidaten:0, laenderTiefe:17, sitzung:12, streng:true, ton:'sachlich',
          farbe:'--f5' },
  violeta: { id:'violeta', name:'Violeta', alter:null, eingabe:['tippen','sprechen'], vorlesen:false,
          kandidaten:0, laenderTiefe:17, sitzung:12, streng:true, ton:'sachlich',
          farbe:'--f6' },
};
/** Wer sich vergleicht. Zwei, und die Reihenfolge ist die der Kacheln. */
const VERGLEICH = ['stephan', 'violeta'];
/* Wie das Elternprofil frueher hiess.
 *
 * Der Fortschritt lag unter `eltern:<ebene>`, das Protokoll unter
 * `profil:'eltern'`. Beides ist echte Uebung und wird nicht weggeworfen,
 * nur weil die Kachel einen Namen bekommen hat: es wird STEPHAN
 * zugeschlagen, und dass es so ist, steht hier und im Backlog. Wer es
 * anders will, loescht sein Profil im Elternbereich - das gibt es dort
 * je Profil. */
const ALTES_ELTERN = 'eltern';
const alsProfil = (id) => id === ALTES_ELTERN ? VERGLEICH[0] : id;
/* Der geschuetzte Bereich heisst auf dem Bildschirm anders als das Profil,
 * sonst stuenden zwei verschiedene Dinge unter demselben Wort. Er steht
 * hier einmal - Tuerschild, PIN-Schirm und Kopfzeile lesen von hier. */
const BEREICH_ELTERN = 'Für Eltern';
// Die Laenderebenen kommen aus den Daten, nicht aus dieser Liste: sonst
// laufen sie auseinander. Genau das war passiert - gebacken und gezaehlt
// waren fuenf Kontinente, in der Ebenenwahl standen zwei.
const KONT_TITEL = { europa:'Europa', afrika:'Afrika', asien:'Asien',
  nordamerika:'Nordamerika', mittelamerika:'Mittelamerika', suedamerika:'Südamerika',
  suedosteuropa:'Südosteuropa',
  /* Die Kennung heisst `australien` wie der Kontinent auf der Weltkarte,
   * die EBENE heisst „Ozeanien": gefragt wird nach Australien,
   * Papua-Neuguinea und Neuseeland, und eine Ebene „Australien", in der
   * Australien eine von drei Antworten ist, waere ein Raetsel mit der
   * Loesung im Titel. */
  australien:'Ozeanien' };
// `ueber` ist die Zeile ueber dem Namen. Damit heisst die Kachel
// "Südamerika" statt "Länder in Südamerika" - das passt in eine Zeile,
// bricht nicht mitten im Wort ("Landeshauptstä/dte") und sagt trotzdem,
// worum es geht. `farbe` gibt jeder Ebene ihren eigenen Ton.
/* Ein Kontinent hat EINE Farbe - auf der Kachel wie auf der Karte (QS8).
 *
 * Bis v358 stand hier `farbe:[3,2,4,7,6][i%5]`: die Kachel bekam ihren Ton
 * aus ihrer POSITION in der Liste, die Weltkarte aus `FL[i%7]` ueber ihre
 * eigene, andere Reihenfolge. Ergebnis, nachgemessen: SIEBEN von sieben
 * Kontinenten hatten auf der Kachel eine andere Farbe als auf der Karte -
 * und weil `i%5` ueber sieben Eintraege laeuft, teilten sich obendrein
 * zwei Paare einen Ton (Europa/Suedamerika gruen, Afrika/Australien
 * orange).
 *
 * Warum das mehr ist als Kosmetik: eine gleichbleibende Farbe ist ein
 * Abrufhinweis. Ein Kind, das „Afrika ist die rote Form" gelernt hat,
 * findet Afrika auf der Karte wieder - wenn es dort auch rot ist. Ist es
 * das nicht, hat es zwei Dinge gelernt statt einem.
 *
 * Die Karte gibt den Ton an, nicht die Kachel: sie ist das Bild, auf das
 * ein Kind am laengsten schaut, und ihre Farben stehen nebeneinander (auf
 * der Kachel steht immer nur eine). Mittelamerika kommt auf der Weltkarte
 * nicht vor und bekommt den einen Ton, den die sechs anderen frei lassen.
 *
 * EINE Quelle, nicht zwei nebeneinander (Regel 6: was zweimal dasteht,
 * veraltet einmal) - `KONT_FARBE` wird aus derselben Liste gerechnet, die
 * die Karte zeichnet. Kommt ein Kontinent dazu, wandert seine Kachel von
 * selbst mit. */
/* Aus welchem Kontinent ein Ausschnitt geschnitten ist - dieselbe
   Auskunft wie `AUSSCHNITTE` in `erdkunde.js`, hier im Buendel. */
const AUSSCHNITT_VON = D.ausschnitte || {};
const KONT_FARBE = Object.fromEntries(
  D.kontinente.map((k, i) => [k.id, (i % 7) + 1]));
/* Die Ausschnitte stehen nicht in `D.kontinente` und bekommen deshalb
   den Ton, den die sechs Kontinente frei lassen. Mit dem ZWEITEN
   Ausschnitt (I11) ist keiner mehr frei - sieben Toene, sieben Karten -,
   und dann teilt sich Suedosteuropa den Ton mit dem Kontinent, aus dem es
   geschnitten ist. Das ist keine Verlegenheit, sondern richtig: die
   beiden Kacheln gehoeren zusammen und stehen nebeneinander. */
for (const id of ['mittelamerika', 'suedosteuropa'])
  KONT_FARBE[id] = KONT_FARBE[id]
    ?? [1,2,3,4,5,6,7].find(f => !Object.values(KONT_FARBE).includes(f))
    ?? KONT_FARBE[AUSSCHNITT_VON[id]];

/* Die kuerzeste Sitzung, die es gibt - Fionas sechs.
 *
 * Abgeleitet aus `PROFILE` und nicht danebengeschrieben: sie ist die
 * Untergrenze dafuer, wieviele Aufgaben eine Ebene ueberhaupt haben
 * muss, damit eine Runde darin keine Wiederholung ist. „Was ist
 * groesser?" benutzt sie, um zu entscheiden, welche Karte eine Ebene
 * bekommt. Stuende hier eine Sechs, waere sie beim naechsten
 * Sitzungsregler falsch (Regel 6). */
/**
 * Wer bekommt „Was ist größer?" auf dieser Karte ueberhaupt zu sehen?
 *
 * Eine Vergleichsebene hat keine Tiefenleiter: es gibt so viele
 * Aufgaben, wie es Paare gibt, und zwar fuer jeden gleich viele. Ob sie
 * reichen, haengt damit allein an der SITZUNGSLAENGE - und die ist je
 * Profil verschieden (6 bis 12).
 *
 * Verlangt werden ZWEI volle Runden, dieselbe Grenze, die `vielfalt`
 * setzt: wer in der zweiten Runde fast dieselben Paare wiedersieht,
 * uebt nichts mehr, er erinnert sich. Der erste Anlauf (I22) fragte
 * nach der KUERZESTEN Sitzung und bot Mittelamerika mit acht Paaren
 * allen an - fuer Stephan sind das 0,7 Runden. Das Tor hat es gesagt,
 * und zwar in elf Zeilen.
 *
 * Uebrig bleiben Europa (33), Afrika (43) und Asien (40) fuer alle und
 * Suedamerika (14) fuer Fiona. Mittelamerika (8), Suedosteuropa (6),
 * Nordamerika (3) und Australien (2) tragen keine Ebene - dort ist die
 * Karte zu leer, nicht die Regel zu streng.
 */
const groesserWer = (k) => Object.values(PROFILE)
  .filter(p => (D.paare[k] || []).length >= 2 * p.sitzung).map(p => p.id);

const EBENEN = [
  { id:'kontinente', ueber:'Die Welt', titel:'Kontinente', farbe:5 },
  /* DIE ACHT LAENDERKARTEN TEILEN SICH SEIT I22 EINE KACHEL.
   *
   * Nicht aus Ordnungsliebe - gemessen. Die Erdkunde-Wand traegt ZWOELF
   * Kacheln; mit der dreizehnten greift `:has(> :nth-child(13))` im
   * Stilblatt, und die Bilder fallen auf dem kleinsten Geraet von 73 auf
   * 19 Punkte. Fuer ein Kind, das nicht liest, ist die Kachel dann kein
   * Bild mehr, sondern ein Punkt. Genau daran ist I21 schon einmal
   * vorbeigekommen (dort teilte sich „Wer grenzt an wen?" die Kachel mit
   * „Bundesländer"), und mit „Was ist größer?" waere es die dreizehnte
   * gewesen.
   *
   * ES WAR DIE INKONSEQUENTE STELLE. Hauptstädte (neun Ebenen) und
   * Flaggen (zehn) liegen seit Q17 und F2 hinter EINER Kachel mit der
   * Frage „wo?"; nur die Länder standen als acht einzelne da. Dieselbe
   * Frage auf acht Karten ist EINE Sache - und die Wand geht damit von
   * zwölf auf sechs, also von zwei engen Reihen auf eine ruhige.
   *
   * `ueber` und `titel` tauschen die Plaetze und stehen jetzt wie bei
   * den Hauptstaedten: die Kachel heisst nach der SACHE („Länder"), die
   * Überzeile nach dem ORT. Ohne den Tausch hiesse die Gruppenkachel
   * „Europa" - nach dem ersten Teil, den sie zufaellig zuerst findet. */
  ...Object.keys(D.laender).map((k)=>({ id:`laender:${k}`, ueber: KONT_TITEL[k] || k,
    titel:'Länder', farbe: KONT_FARBE[k], gruppe:'laender', wo: KONT_TITEL[k] || k })),
  { id:'bundeslaender', ueber:'Deutschland', titel:'Bundesländer',      farbe:1,
    gruppe:'bundeslaender', wo:'Wie heißen sie?' },
  /* WER GRENZT AN WEN (I21, aus B3r).
   *
   * Die billigste neue Ebene, die dieses Verzeichnis kennt: sie braucht
   * kein neues Datum und keinen neuen Bildschirm. Die Nachbarschaften
   * standen seit je in `nachbarn.json` - sie haben bis I21 nur die
   * VIERFAERBUNG bedient, also die Frage, welche zwei Gebiete nicht
   * dieselbe Farbe tragen duerfen. Dieselbe Auskunft beantwortet auch
   * eine Aufgabe.
   *
   * SIE FRAGT ETWAS ANDERES als „Bundesländer". Dort ist die Karte ein
   * Bilderbuch mit sechzehn Formen, und gelernt wird ein Name je Form.
   * Hier ist sie eine KARTE: was neben was liegt, ist das Einzige, was
   * eine Karte weiss und eine Bilderliste nicht.
   *
   * MEHRERE ANTWORTEN SIND RICHTIG, und das ist der Punkt. Hessen hat
   * sechs Nachbarn; wer einen davon findet, hat die Frage beantwortet.
   * Eine Aufgabe mit genau einer Loesung waere hier eine Faelschung -
   * sie wuerde nicht Nachbarschaft pruefen, sondern Auswendiglernen
   * einer willkuerlich herausgegriffenen Paarung.
   *
   * FUER ALLE VIER. Fiona liest nicht - aber sie muss hier auch nichts
   * lesen: das gefragte Land steht hervorgehoben auf der Karte, die
   * Frage wird gesprochen, und getippt wird auf eine Flaeche, die es
   * beruehrt. Das ist die erste Erdkunde-Aufgabe, die ohne ein einziges
   * Wort funktioniert. */
  /* SIE TEILT SICH DIE KACHEL MIT „Bundesländer" (Q17-Muster).
   *
   * Nicht aus Ordnungsliebe, sondern gemessen: die Erdkunde-Wand traegt
   * ZWOELF Kacheln. Mit der dreizehnten greift `:has(> :nth-child(13))`
   * im Stilblatt, und die Bilder fallen auf dem kleinsten Geraet von 73
   * auf 19 Punkte - fuer ein Kind, das nicht liest, ist die Kachel dann
   * kein Bild mehr, sondern ein Punkt. `passt` hat es beim ersten Lauf
   * an zweiundzwanzig Kacheln auf einmal gemeldet.
   *
   * Die Gruppe kostet einen Zwischenschritt und ist trotzdem die
   * richtige Antwort: beide Ebenen spielen auf DERSELBEN Karte, und
   * „Bundesländer" ist die Ueberschrift, unter der ein Kind sie sucht.
   * Genau dieselbe Ueberlegung wie bei den Hauptstaedten in Q17. */
  { id:'nachbarn', ueber:'Deutschland', titel:'Bundesländer', farbe:6,
    art:'nachbarn', gruppe:'bundeslaender', wo:'Wer grenzt an wen?' },
    // "Hauptstädte" statt "Landeshauptstädte": das Wort passt nicht in die
  // Kachel und brach als "Landeshauptstäd/te" um. Die Ueberzeile sagt
  // schon "Deutschland", die Frage sagt "Hauptstadt von Hessen" - das
  // lange Wort trug hier nichts bei ausser einem Zeilenumbruch.
  /* `gruppe` und `wo`: die beiden Hauptstadt-Ebenen teilen sich EINE
     Kachel (Q17). Warum, steht bei `gruppiert()` weiter unten. */
  { id:'hauptstaedte',  ueber:'Deutschland', titel:'Hauptstädte', farbe:2,
    gruppe:'hauptstaedte', wo:'Deutschland' },
  /* Hauptstaedte auf JEDER Karte - erzeugt, nicht aufgeschrieben (R6,
   * I14, I16).
   *
   * Dieselbe Frage auf einer anderen Karte, und deshalb dieselbe
   * Kennungsform wie bei den Laendern: `hauptstaedte:europa`. Der Teil vor
   * dem Doppelpunkt sagt, WIE gefragt wird, der dahinter, WO - und alles
   * andere (Karte, Umgebung, Rahmen, Umriss auf der Kachel) leitet sich
   * daraus ab, statt an fuenf Stellen einzeln nachgetragen zu werden.
   *
   * BIS I15 STANDEN SIE VON HAND DA, erst eine, dann zwei. Bei I14 hat
   * das eine Runde gekostet: die Suedosteuropakarte hatte sieben Laender
   * und keine Stadt, weil der Schalter im Backwerkzeug eine Karte
   * weiter oben stand. Jetzt entstehen sie aus derselben Schleife wie die
   * Laenderebenen - eine Karte, deren Umrisse eine Hauptstadt tragen,
   * bekommt ihre Ebene, und es gibt keine Stelle mehr, an der man sie
   * vergessen kann.
   *
   * `l.hauptstadt` und nicht `k in D.laender`: Groenland hat einen Rang
   * und keine Hauptstadtfrage (Nuuk ist die Hauptstadt einer autonomen
   * Region). Waere Nordamerika die einzige Karte mit einem solchen Ziel,
   * stuende hier eine Ebene mit drei Staedten - und genau drei hat sie.
   *
   * `wer`: Lea und die Eltern. Fiona nicht - sie liest noch nicht, und
   * eine Stadt hat keinen Umriss, den man ziehen koennte. */
  ...Object.keys(D.laender)
    .filter(k => (D.laender[k] || []).some(l => l.hauptstadt))
    .map(k => ({ id:`hauptstaedte:${k}`, ueber: KONT_TITEL[k] || k,
      titel:'Hauptstädte', farbe: KONT_FARBE[k],
      wer:['lea','stephan','violeta'], gruppe:'hauptstaedte',
      wo: KONT_TITEL[k] || k })),
  /* WAS IST GROESSER? (I22, aus B3r).
   *
   * Die erste Erdkundeaufgabe, die nicht nach einem NAMEN fragt.
   * Kontinente, Länder, Bundesländer, Hauptstädte, Flaggen, Nachbarn -
   * alle sechs Formen davor prüfen, ob ein Kind eine Bezeichnung mit
   * einer Form verbindet. Diese hier fragt nach einer EIGENSCHAFT, und
   * zwar nach der einzigen, die man einer Karte ansehen kann, ohne
   * etwas zu wissen: wie groß etwas ist.
   *
   * Deshalb hat sie KEINE Leiter. Alle anderen Länderebenen zeigen je
   * nach Können die fünf, zehn oder dreißig größten; hier stehen von
   * Anfang an alle Paare der Karte. Wer zwei Flächen sieht, kann sagen,
   * welche größer ist - dazu muss man weder Ungarn kennen noch lesen.
   * Dieselbe Überlegung wie bei den Verwechslungspaaren (F3), die auch
   * keine Tiefe haben.
   *
   * FÜR ALLE VIER, und für Fiona die zweite Aufgabe ohne ein Wort:
   * beide Länder stehen hervorgehoben da, die Frage wird gesprochen,
   * getippt wird auf eine Fläche.
   *
   * SECHS KARTEN, NICHT ACHT - und die Zahl ist abgeleitet, nicht
   * gewählt. Eine Karte braucht mindestens so viele Paare, wie die
   * kürzeste Sitzung Aufgaben hat (Fionas sechs); darunter ist eine
   * Runde ein Karussell aus denselben zwei Fragen. Nordamerika hat
   * drei Paare, Australien zwei - beide bekommen keine Ebene. Was
   * die anderen sechs haben, steht in `D.paare`; die Regel, die sie
   * erzeugt, in `groesserPaare` (erdkunde.js). */
  /* NACH PAARZAHL GEORDNET, und das ist keine Ordnungsliebe: die
     Gruppenkachel uebernimmt Bild und Farbe ihres ERSTEN Teils. In
     Kartenreihenfolge waere das Europa - und daneben stuende „Länder"
     mit demselben Europa in derselben gruenen Familie. Fuer ein Kind,
     das nicht liest, waeren das zwei Kacheln mit demselben Bild.
     Afrika hat mit 43 die meisten Paare, ist orange und sieht anders
     aus als alles andere auf der Wand. */
  ...Object.keys(D.laender)
    .filter(k => groesserWer(k).length)
    .sort((a, b) => D.paare[b].length - D.paare[a].length)
    .map(k => ({ id:`groesser:${k}`, ueber: KONT_TITEL[k] || k,
      titel:'Was ist größer?', farbe: KONT_FARBE[k], art:'groesser',
      gruppe:'groesser', wo: KONT_TITEL[k] || k,
      /* `wer` nur, wo es wirklich einschraenkt - eine Liste mit allen
         vier Namen waere dieselbe Aussage wie keine und veraltet beim
         naechsten Profil. */
      ...(groesserWer(k).length < Object.keys(PROFILE).length
          ? { wer: groesserWer(k) } : {}) })),
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
  /* Die Flaggen (F2) - sieben Ebenen, EINE Kachel.
   *
   * `gruppe:'flaggen'` ist derselbe Mechanismus, den sich die beiden
   * Hauptstadt-Ebenen seit Q17 teilen: die Wand zeigt eine Kachel, ein
   * Tipp darauf fragt „wo?". Ohne ihn waere die Erdkundewand siebzehn
   * Kacheln hoch, und gemessen traegt sie zwoelf (Q13/Q27). So geht sie
   * von zehn auf elf.
   *
   * `wo` ist der Name der KARTE, nicht der Ebene - innerhalb einer Gruppe
   * heisst die Kachel nach dem Ort. Er kommt aus `KONT_TITEL`, derselben
   * Quelle wie bei den Laenderebenen; eine zweite Namensliste hier waere
   * die, die bei der achten Karte veraltet.
   *
   * `art:'flagge'` und nicht ein Schalter an der Laenderebene: gefragt
   * wird anders (ein Bild statt eines Umrisses), und die Ebene braucht
   * einen eigenen Leitner-Stand. Wer Rumaenien auf der Karte findet, kennt
   * darum noch nicht seine Flagge - das ist ein anderes Koennen.
   *
   * KEIN `wer`: die Flaggen gelten fuer alle vier Profile, wie gewuenscht.
   * Was sich je Profil unterscheidet, ist die ANTWORTFORM und die Tiefe -
   * und beides steht schon im Profil (`eingabe`, `kandidaten`,
   * `laenderTiefe`). Ein `wer` hier waere eine dritte Stelle, an der
   * dasselbe noch einmal entschieden wird. */
  /* `titel` heisst bei ALLEN sieben „Flaggen", `wo` nennt die Karte -
     und das ist nicht vertauscht, sondern genau die Form, die `gruppiert`
     und `ebenenwahl(gruppe)` erwarten:
     
       auf der Wand   steht die Gruppenkachel mit dem `titel` des ERSTEN
                      Teils. Hiesse er „Europa", stuende auf der Kachel
                      fuer alle sieben Karten „Europa" - genau das war der
                      erste Anlauf, und kein Tor konnte es melden.
       in der Gruppe  wird getauscht: `ueber` wird zum Titel, `titel` zum
                      Ueberbegriff. Dort steht dann „Flaggen / Europa".
     
     Die beiden Hauptstadt-Ebenen machen es seit Q17 genauso. */
  /* `wenn` haelt eine LEERE Kachel von der Wand fern (I11).
   *
   * Die Flaggenebenen entstehen aus den Kartenschluesseln, die Flaggen
   * selbst aber sind Handarbeit in `flaggen.js`. Beides kann
   * auseinandergehen: als Suedosteuropa dazukam, stand dort eine achte
   * Flaggenkachel, hinter der NICHTS lag - sieben Laender, null
   * gezeichnete Flaggen. Sie liess sich oeffnen und zeigte eine leere
   * Sitzung.
   *
   * Kein Sonderfall und keine Ausnahmeliste: gefragt wird, ob diese Karte
   * ueberhaupt eine fragbare Flagge hat. Wer morgen die sieben zeichnet,
   * bekommt die Kachel von selbst - und wer eine Karte ohne Flaggen
   * anlegt, bekommt keine. `vorrat()` ist dieselbe Quelle, aus der die
   * Sitzung gefuellt wird; eine zweite Zaehlung daneben stuende zweimal
   * da und veraltete einmal (Regel 6). */
  ...Object.keys(D.laender).map((k) => ({ id:`flaggen:${k}`, ueber:'Die Welt',
    titel:'Flaggen', farbe: KONT_FARBE[k], art:'flaggen',
    gruppe:'flaggen', wo: KONT_TITEL[k] || k,
    wenn: () => (D.laender[k] || []).some(l => Flaggen.flaggeFragbar(l.a3)) })),
  /* Verwechslungen (F3) - der achte Eintrag DERSELBEN Gruppe.
   *
   * Keine neunte Kachel auf der Wand: sie steht hinter „Flaggen", neben
   * den sieben Karten. Genau dafuer ist die Gruppe da.
   *
   * `wer`: Lea und die Eltern. Fuer Fiona waere sie falsch - sie lernt
   * gerade, dass eine Flagge zu einem Land gehoert; zwei fast gleiche
   * nebeneinander verwirren dieses Lernen, statt darauf aufzubauen.
   * Dieselbe Ueberlegung wie bei „Falsche Freunde" (E10), und aus
   * demselben Grund: eine Falle zeigt man erst, wenn die Regel steht.
   *
   * DIE KENNUNG HEISST `flaggen:paare` UND NICHT `flaggenpaare`.
   *
   * Der erste Anlauf hatte sie ohne Doppelpunkt, mit der Begruendung,
   * hier werde ja anders gefragt. Der Rauchtest fand die Ebene daraufhin
   * nicht: er oeffnet eine Gruppenkachel, indem er den Teil VOR dem
   * Doppelpunkt als Gruppennamen nimmt (`durchGruppe`). Ohne Doppelpunkt
   * suchte er eine Gruppe `flaggenpaare`, die es nicht gibt.
   *
   * Die Regel im Haus ist enger, als ich sie gelesen hatte: der Teil vor
   * dem Doppelpunkt ist die Gruppe UND die Art; wie gefragt wird,
   * entscheidet der Teil dahinter. `schreiben:diktat` macht es genauso -
   * ein Bildschirm, vier Ebenen, unterschieden am `kont`. */
  { id:'flaggen:paare', ueber:'Flaggen', titel:'Flaggen', farbe:1,
    art:'flaggen', gruppe:'flaggen', wo:'Verwechslungen',
    wer:['lea','stephan','violeta'] },
  /* „Auf die Karte" (F4) - die Montessori-Form aus dem Referenzabgleich.
   *
   * Die Flagge steht in der Frage, getippt wird auf das Land. Das ist die
   * einzige Form, die Flagge, Umriss UND Lage gleichzeitig verlangt - und
   * damit die, die aus zwei Wissensinseln eine macht.
   *
   * Sie laeuft auf dem `spielschirm`, nicht auf einem eigenen: die
   * umgekehrte Frage („Wo liegt X?", Tippen auf die Karte) gibt es dort
   * seit B3 samt Trefferflaechen, Zughinweis und der Regel, dass nach
   * einem Gebiet unter der Fingergrenze gar nicht erst gefragt wird
   * (P7/P10). Ein zweiter Bildschirm haette das alles noch einmal - und
   * die vier Fehler dazu, die es dort gekostet hat.
   *
   * `wer`: Lea und die Eltern. Fiona zieht auf ihren Kartenebenen, sie
   * tippt nicht - und „umgekehrt" verlangt einen Tipp auf ein Gebiet.
   * Dieselbe Grenze wie bei `umgekehrt` selbst (`kannLesen`). */
  { id:'flaggen:karte', ueber:'Flaggen', titel:'Flaggen', farbe:5,
    art:'flaggen', gruppe:'flaggen', wo:'Auf die Karte',
    wer:['lea','stephan','violeta'] },
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
  /* Rechnen für Eltern (R4): 158 Aufgaben in drei Sorten.
   *
   * Ohne `mischung`: die drei Sorten stehen im Vorrat nebeneinander und
   * werden vom Leitner gezogen wie die Gebiete einer Karte. Eine Mischung
   * waere hier eine Zahl ohne Grund - bei Lea haengt sie am Regler, hier
   * gibt es keinen. */
  { id:'rechnen:gross', ueber:'Rechnen', titel:'Großes Einmaleins', farbe:2,
    art:'rechnen', wer:['stephan','violeta'] },
  /* --- I4: drei neue Rechenarten (Inhalt-Audit) ----------------------
   *
   * Nicht mehr Aufgaben, sondern eine andere FRAGE. Fionas Vorrat war nie
   * knapp (100 Aufgaben, 16,7 Runden) - knapp war die Art: sie rechnet
   * seit einem Jahr Plus und Minus. Jede der drei Ebenen fragt auf dem
   * Stoff, den es schon gibt, etwas anderes. */
  { id:'rechnen:verdoppeln', ueber:'Rechnen', titel:'Doppelt und halb', farbe:1,
    art:'rechnen', wer:['fiona'] },
  /* Vorher und nachher (I13) - Fionas dritte Rechenart, und die einzige,
   * bei der nicht gerechnet wird. „Was kommt nach sieben?" ist eine Frage
   * an die ZAHLENREIHE. Wer sie beantwortet, indem er eins dazuzaehlt,
   * hat sie noch nicht verstanden; wer die Reihe kann, sagt es sofort.
   *
   * Zahlenraum zwanzig statt zehn - die Reihe hoert bei zehn nicht auf,
   * und die schwierige Stelle ist genau der Uebergang. */
  { id:'rechnen:nachbar', ueber:'Rechnen', titel:'Vorher und nachher', farbe:6,
    art:'rechnen', wer:['fiona'] },
  { id:'rechnen:luecke', ueber:'Rechnen', titel:'Was fehlt?', farbe:5,
    art:'rechnen', wer:['lea'] },
  /* --- I10: zwei Rechenarten fuer Lea (Inhalt-Audit) -----------------
   *
   * Leas Rechenwelt war bis hierher das Einmaleins - drei Ebenen, alle
   * mal und geteilt. Was fehlte, ist das, woran das zweite und dritte
   * Schuljahr wirklich haengt: der Zehneruebergang und die Groessen.
   *
   * „Zehn und drueber" fragt NUR Aufgaben MIT Uebergang. Ohne ihn waeren
   * es zwei Ziffern nebeneinander und keine Aufgabe - und der Ablenker
   * ist genau der Fehler, um den es geht: 23 + 8 wird zu 21, weil der
   * Uebertrag vergessen wird.
   *
   * „Wie viel ist das?" fragt Groessen in BEIDE Richtungen. Dass ein
   * Meter hundert Zentimeter hat, ist Wissen mit einer Multiplikation
   * dahinter - genau das, wofuer ein Leitner-Kasten da ist. */
  { id:'rechnen:zehner', ueber:'Rechnen', titel:'Zehn und drüber', farbe:2,
    art:'rechnen', wer:['lea'] },
  { id:'rechnen:einheiten', ueber:'Rechnen', titel:'Meter und Gramm', farbe:4,
    art:'rechnen', wer:['lea'] },
  { id:'rechnen:prozent', ueber:'Rechnen', titel:'Prozent im Kopf', farbe:7,
    art:'rechnen', wer:['stephan','violeta'] },
  /* Schreiben - nur fuer Fiona (N2a).
   *
   * Sie ist sechs und liest noch nicht. Alles andere in dieser App macht
   * ihr das Abfragen leichter; das hier bringt ihr etwas bei, das sie
   * danach ueberall braucht - auch in dieser App.
   *
   * `wer:['fiona']` ist die EINE Stelle, an der das steht. Die Welt
   * darueber verschwindet fuer die anderen von selbst, weil sie dann
   * keine Ebene mehr haelt.
   */
  { id:'schreiben:buchstaben', ueber:'Schreiben', titel:'Buchstaben nachfahren', farbe:7,
    art:'schreiben', wer:['fiona'] },
  /* Der naechste Schritt (N3): der Buchstabe wird ANGESAGT, nicht gezeigt.
   *
   * Eine eigene Ebene und kein Schalter an der ersten - aus dem Grund, der
   * bei `vorratDiktat` steht: es ist ein anderes Koennen und braucht einen
   * eigenen Leitner-Stand. Und weil es fuer ein Kind, das nicht liest, zwei
   * Kacheln sein muessen: eine zum Nachfahren, eine zum Hoeren. */
  { id:'schreiben:diktat', ueber:'Schreiben', titel:'Buchstaben hören', farbe:3,
    art:'schreiben', wer:['fiona'] },
  /* Und dasselbe mit den Ziffern (N4).
   *
   * ZEHN Vorlagen zum Nachfahren, und darauf zwanzig Aufgaben: die Zahlen
   * 1 bis 20 werden angesagt und geschrieben. „Vierzehn" ist eine Zahl,
   * die man hoert; geschrieben wird sie als 1 und 4, in dieser Reihenfolge
   * - der Bildschirm stellt dafuer zwei Felder hin. */
  { id:'schreiben:ziffern', ueber:'Schreiben', titel:'Zahlen nachfahren', farbe:5,
    art:'schreiben', wer:['fiona'] },
  { id:'schreiben:zahlen', ueber:'Schreiben', titel:'Zahlen hören', farbe:2,
    art:'schreiben', wer:['fiona'] },
  /* Die vierte Welt (E3): Englisch, erste Ebene „Hoeren und zeigen".
   *
   * `art:'englisch'` und nicht ein Schalter an einer Kartenebene: gefragt
   * wird anders (die App SAGT etwas, statt etwas hinzuschreiben), und die
   * Ebene braucht einen eigenen Leitner-Stand. Dieselbe Begruendung wie bei
   * `schreiben:diktat`.
   *
   * `wer`: Fiona und Lea. Fuer die Eltern kommt Englisch erst mit E10 bis
   * E12 - falsche Freunde, Wendungen, Hoeren und Schreiben. Bis dahin
   * verschwindet die ganze Welt fuer sie von selbst, weil sie keine Ebene
   * mehr haelt; es braucht keine zweite Regel daneben.
   *
   * Warum Fiona MIT dabei ist, obwohl es noch keine Bilder gibt: der Vorrat
   * dieser Ebene sind die zehn Farben und die 15 Zahlen - beides Bilder,
   * die sich aus dem Wort selbst ergeben (siehe `Englisch.vorratHoeren`).
   * Ein Farbfleck braucht niemanden, der ihn malt, und die Ziffern lernt
   * sie nebenan in der Schreibwelt. */
  { id:'englisch:hoeren', ueber:'Englisch', titel:'Hören und zeigen', farbe:3,
    art:'englisch', wer:['fiona','lea'] },
  /* „Sag es" (E6) - die erste Ebene, auf der ein Kind etwas SAGT.
   *
   * `art:'englisch'` wie die Schwester daneben, und unterschieden wird am
   * Teil hinter dem Doppelpunkt - genau die Regel des Hauses (der Teil
   * davor ist Gruppe UND Art, der dahinter sagt, wie gefragt wird).
   * `englischschirm` stellt die Weiche, damit `schirmZu` eine Zeile je
   * Art behaelt.
   *
   * KEINE Gruppenkachel: die Englischwelt der Kinder traegt damit zwei
   * Kacheln statt einer, und zwei sind noch keine Wand. Eine Gruppe
   * versteckt die zweite Ebene hinter einem Tipp mehr, ohne Platz zu
   * sparen, den es hier zu sparen gaebe.
   *
   * `wer`: Fiona und Lea. Fuer die Eltern waere sie sinnlos - „sag blue"
   * ist kein Problem, das sie haben; ihre Englischebenen sind die drei
   * mit den Fallen. */
  { id:'englisch:sagen', ueber:'Englisch', titel:'Sag es', farbe:7,
    art:'englisch', wer:['fiona','lea'] },
  /* „Der Satz zum Selbersagen" (E9) - dieselbe Form wie „Sag es", eine
   * Stufe darueber: kein Wort, sondern ein ganzer Satz.
   *
   * Sie teilt sich den Bildschirm mit „Sag es" und unterscheidet sich am
   * Gegenstand (`sorte:'chunk'`), nicht am Aufbau - das ist der Grund,
   * warum sie fast nichts gekostet hat. Was sie mitbringt, sind die
   * zwanzig Saetze, und jeder davon ist auf ein amtliches Redemittel
   * zurueckzufuehren; das Tor `englisch` haelt das nach.
   *
   * `wer`: Fiona und Lea, wie die Schwester. Fuer eine Sechsjaehrige ist
   * „I've got a brother." kein schwererer Satz als „brother" - sie
   * spricht ohnehin nach, was sie hoert. */
  { id:'englisch:satz', ueber:'Englisch', titel:'Sag den Satz', farbe:2,
    art:'englisch', wer:['fiona','lea'] },
  /* „Leg das Wort" (E8) - abschreibend, mit Vorlage.
   *
   * Der Lehrplan verlangt fuer Jahrgangsstufe 3 genau diese Form: das
   * Wort steht da, geschrieben wird es nicht aus dem Kopf, sondern
   * abgeschrieben. Deshalb liegt die Vorlage die ganze Zeit oben - sie zu
   * verstecken waere eine andere, schwerere Aufgabe.
   *
   * `wer`: nur Lea. Fiona liest nicht, und ein Wort abzuschreiben, das
   * man nicht lesen kann, ist Formenvergleich und kein Englisch. Sie hat
   * mit „Hoeren und zeigen" und „Sag es" zwei Ebenen in dieser Welt, die
   * ohne Schrift auskommen. */
  { id:'englisch:legen', ueber:'Englisch', titel:'Leg das Wort', farbe:5,
    art:'englisch', wer:['lea'] },
  /* „Bau den Satz" (E9c) - dieselbe Form eine Stufe hoeher.
   *
   * Bei „Leg das Wort" sind die Karten Buchstaben und das Ziel ein Wort;
   * hier sind die Karten Woerter und das Ziel ein Satz. Ein Bildschirm,
   * zwei Ebenen - unterschieden am Teil hinter dem Doppelpunkt, wie
   * ueberall in diesem Verzeichnis.
   *
   * `wer`: nur Lea, aus demselben Grund wie nebenan - wer nicht liest,
   * kann Wortkarten nicht unterscheiden. */
  { id:'englisch:bauen', ueber:'Englisch', titel:'Bau den Satz', farbe:1,
    art:'englisch', wer:['lea'] },
  /* „Zwei Wörter, ein Laut" (E5) - die wichtigste Form des Konzepts.
   *
   * Vier Stolperstellen, an denen deutschsprachige Kinder VORHERSAGBAR
   * stolpern (Konzept § 2, Befund 4). Es ist die einzige Form, die den
   * Unterschied uebt, OHNE dass die App die Aussprache eines Kindes
   * beurteilen muss: sie hat das Wort gesagt, sie weiss welches, und ein
   * richtiger Tipp ist richtig.
   *
   * `wer`: alle vier - seit die Paare Bilder haben auch FIONA. Bis dahin
   * stand hier eine Absage auf Zeit: das Konzept sieht zwei BILDER vor,
   * und ohne sie standen zwei geschriebene Woerter da, die eine
   * Sechsjaehrige nicht lesen kann. Vier Paare sind gemalt, und fuer sie
   * ist es dieselbe Aufgabe mit Bildern statt Buchstaben. Fuer die Eltern
   * ist die Ebene keine Zugabe: § 2b sagt, ihr Problem ist das HOEREN.
   *
   * `wenn`: nur mit englischer Stimme - und fuer wen nicht liest,
   * zusaetzlich nur, wenn es genug GEMALTE Paare gibt. Ohne diese zweite
   * Haelfte stuende die Kachel bei Fiona in dem Augenblick da, in dem die
   * letzte Zeichnung herausfaellt, und zeigte ihr Buchstaben. Die Zahl
   * steht nicht hier, sondern in `LAUTPAARE_FUER_BILDER` - sie ist eine
   * Aussage ueber den Vorrat und keine ueber diesen Bildschirm.
   *
   * Siehe `meineEbenen`. */
  { id:'englisch:laute', ueber:'Englisch', titel:'Zwei Wörter, ein Laut', farbe:4,
    art:'englisch', wer:['fiona','lea','stephan','violeta'],
    wenn: () => englischHoerbar()
      && (!P.vorlesen
          || Englisch.lautpaareMalbar().length >= LAUTPAARE_FUER_BILDER) },
  /* „Lies das Wort" (E7) - der Lehrplan sieht ab Klasse 3 Lesen im
   * Wortumfang ausdruecklich vor: das geschriebene `cat` zu einem von
   * vier Bildern.
   *
   * `wer`: nur Lea. Fuer Fiona gibt es das nicht, und das steht so im
   * Konzept - sie liest noch kein Deutsch.
   *
   * `wenn`: nur, solange es ueberhaupt Bilder gibt. Der Vorrat sind die
   * gezeichneten Woerter (heute sechzehn von sechsundachtzig); waere er
   * leer, stuende eine Kachel da, hinter der nichts ist. Dieselbe
   * Ueberlegung wie bei den Lautpaaren, nur mit einem anderen Grund. */
  { id:'englisch:lesen', ueber:'Englisch', titel:'Lies das Wort', farbe:6,
    art:'englisch', wer:['lea'],
    wenn: () => Englisch.vorratLesen().length >= 4 },
  /* Die Englischebene der Eltern (E10) - und die erste Ebene ueberhaupt,
   * die eine FALLE zeigt statt sie zu vermeiden.
   *
   * `art:'freunde'` und nicht ein Schalter an `englisch`: gefragt wird
   * anders (ein deutscher Satz, eine Luecke, ein getipptes Wort), und die
   * Ebene braucht einen eigenen Leitner-Stand. Dieselbe Begruendung wie
   * ueberall sonst.
   *
   * `wer`: nur Stephan und Violeta. Die Lehrplanliste ist fuer sie
   * wertlos - `cat`, `blue` und `seven` sind kein Problem, das sie haben.
   * Ihr Problem sind die dreissig Fallen, die sie seit der Schule
   * mitschleppen. Umgekehrt hat eine Achtjaehrige von „Provision" nichts:
   * sie kennt das deutsche Wort nicht. */
  /* Die Kennung heisst `freunde` und NICHT `englisch:freunde`.
   *
   * In dieser App sagt der Teil vor dem Doppelpunkt, WIE gefragt wird, und
   * der dahinter, WO oder WOMIT - so steht es bei `hauptstaedte:europa`.
   * `vorrat()` und `vorlaufSatz()` lesen genau diesen Teil. Mit
   * `englisch:freunde` bekam die Elternebene deshalb den Vorrat von
   * „Hören und zeigen": im Vorlauf standen unter der Ueberschrift
   * „Falsche Freunde" die zehn Farben und die fuenfzehn Zahlen, und kein
   * Tor haette das gemeldet - der Bildschirm war ja gefuellt.
   *
   * Zur Welt gehoert sie trotzdem, und das entscheidet `art` ueber
   * `WELT_VON_ART`. Die Kennung muss das nicht auch noch sagen. */
  { id:'freunde', ueber:'Englisch', titel:'Falsche Freunde', farbe:1,
    art:'freunde', wer:['stephan','violeta'] },
  /* Gestern und heute (I8) - die unregelmaessigen Verben.
   *
   * Dieselbe Bauform wie die falschen Freunde und deshalb eine EIGENE
   * `art`, kein zweiter Eintrag mit `art:'freunde'`: der Bildschirm ist
   * derselbe, aber der Vorlaufsatz, das Kachelzeichen und der
   * Leitner-Stand sind es nicht. Wer die Art teilt, teilt alle vier -
   * dann stuende ueber den Verben „Genau dort sitzt die Falle" und
   * darunter die Ringe der falschen Freunde.
   *
   * Warum eine neue Ebene und nicht mehr Fallen in der alten: eine
   * laengere Liste ist keine neue Frage. Der Audit hat beides bemaengelt
   * - die Wiederholung (dagegen half I1) und die Einfoermigkeit. Das hier
   * ist die andere Frage, auf demselben Stoff. */
  { id:'verben', ueber:'Englisch', titel:'Gestern und heute', farbe:3,
    art:'verben', wer:['stephan','violeta'] },
  /* Das kleine Wort (I9) - die Praepositionen.
   *
   * Die dritte Ebene in dieser Bauform und die, an der man am haeufigsten
   * erkannt wird: ein Deutscher, der fliessend Englisch spricht, sagt
   * „I am waiting on the bus" - nicht, weil ihm ein Wort fehlt, sondern
   * weil er das deutsche „auf" mituebersetzt. Wieder eine eigene `art`
   * und aus demselben Grund wie bei den Verben: derselbe Bildschirm,
   * aber ein eigener Vorlaufsatz, ein eigenes Zeichen, eine eigene Frage
   * und ein eigener Leitner-Stand. */
  { id:'praeposition', ueber:'Englisch', titel:'Das kleine Wort', farbe:7,
    art:'praeposition', wer:['stephan','violeta'] },
  /* Die Wendung, nicht das Wort (E11). Deutsch steht da, Englisch wird
   * getippt - aber nie ein Einzelwort, und MEHRERE Loesungen gelten.
   *
   * Fuer die Kinder waere das verboten (Paragraf 8: keine Uebersetzung
   * Deutsch nach Englisch), fuer die Eltern ist es genau richtig, und das
   * ist kein Widerspruch: bei Lea entsteht die Verknuepfung gerade erst
   * und darf nicht ueber das Deutsche laufen. Bei Stephan und Violeta
   * EXISTIERT sie laengst - sie ist nur zugewachsen. */
  { id:'wendungen', ueber:'Englisch', titel:'Wendungen', farbe:6,
    art:'wendungen', wer:['stephan','violeta'] },
  /* Hoeren und schreiben (E12) - ein ganzer Satz, einmal gesprochen, in
   * NORMALEM Tempo. Langsames Englisch uebt langsames Englisch; was am
   * Flughafen gesprochen wird, ist schnell.
   *
   * Ein zweites Mal Hoeren gibt es, aber es wird GEZAEHLT - nicht
   * bestraft, nur gezaehlt, und die Zahl steht im Elternbereich. Eine
   * Zahl, die man sieht, wirkt ohne Strafe. */
  { id:'hoersatz', ueber:'Englisch', titel:'Hören und schreiben', farbe:4,
    art:'hoersatz', wer:['stephan','violeta'] },
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
  { id:'erdkunde',  name:'Erdkunde', farbe:5 },
  { id:'rechnen',   name:'Rechnen',  farbe:4 },
  /* Die dritte Welt (N2a) - und sie steht nicht fuer alle da.
   *
   * Sichtbar ist eine Welt nur, wenn dieses Kind Ebenen darin hat; die
   * Weltenwahl filtert ohnehin schon so (`.filter(x => x.meine.length)`).
   * Weil `schreiben:buchstaben` nur Fiona gehoert, verschwindet die Welt
   * fuer Lea und die Eltern von selbst - es braucht keine zweite Regel
   * daneben, die dasselbe noch einmal sagt.
   *
   * Damit sieht dieser Bildschirm je Profil VERSCHIEDEN aus: drei Karten
   * fuer Fiona, zwei fuer die anderen. Beide Fassungen muessen gemessen
   * werden - `passt` prueft sie einzeln, weil eine dritte Karte auf
   * 844 x 390 nicht selbstverstaendlich ist. */
  { id:'schreiben', name:'Schreiben', farbe:6 },
  /* Die vierte Welt (E3) - und sie ist die LETZTE, die auf das Zielgeraet
   * geht. Gemessen mit vier eingebauten Kacheln auf 844 x 390: die Wand
   * fasst genau vier, die fuenfte faellt heraus. Wer eine fuenfte Welt
   * will, braucht einen anderen Grundriss, keine weitere Kachel.
   *
   * Und sie ist nicht umsonst: vier Karten teilen sich dieselbe Breite,
   * also schrumpft jedes vorhandene Weltbild - Erdkunde von 214 auf 127
   * Punkte. Das ist kein Fehler, sondern ein Preis, und einer, den ein
   * Blick beurteilen muss und kein Tor. */
  { id:'englisch',  name:'Englisch', farbe:3 },
];
/* Welche Welt zu welcher Aufgabenart gehoert.
 *
 * Eine Tabelle und keine Kette von Fragezeichen: mit der zweiten
 * Englischart (E10) waere daraus die vierte Stufe geworden, und die
 * fuenfte kommt mit E11. Was hier fehlt, landet in der Erdkunde - das ist
 * die richtige Voreinstellung, weil die Kartenebenen die einzigen ohne
 * eigene `art` sind. */
const WELT_VON_ART = { rechnen:'rechnen', schreiben:'schreiben',
                       englisch:'englisch', freunde:'englisch', verben:'englisch',
                       praeposition:'englisch',
                       wendungen:'englisch', hoersatz:'englisch' };
const weltVon = (e) => WELT_VON_ART[e.art] || 'erdkunde';
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
                     bundeslaender:'deutschland', hauptstaedte:'deutschland',
                     /* „Wer grenzt an wen?" (I21) spielt auf derselben Karte
                        wie die Bundeslaender und traegt deshalb denselben
                        Umriss. Ohne diese Zeile stand die Kachel BILDLOS in
                        der Wand - `passt` hat es gemeldet, und fuer Fiona
                        waere sie damit die einzige gewesen, die sie nicht
                        wiedererkennt. */
                     nachbarn:'deutschland' };

/* Welchen Rahmen trägt die Karte dieser Ebene?
 *
 * Stand an DREI Stellen einzeln da, jedes Mal als `art==='laender' ?
 * D.vbL[kont] : D.vbD`. Mit „Hauptstädte in Europa" (R6) wurde daraus
 * dreimal derselbe Fehler: die Ebene heißt `hauptstaedte:europa`, ist
 * also nicht `laender`, und hätte den Rahmen von Deutschland um eine
 * Europakarte gelegt. Der Kontinent hinter dem Doppelpunkt entscheidet,
 * nicht die Art davor (Regel 6). */
/**
 * WELCHE KARTE braucht diese Ebene?
 *
 * Bis F4 war das dieselbe Frage wie „was steht hinter dem Doppelpunkt" -
 * `laender:europa` spielt auf der Europakarte. „Auf die Karte"
 * (`flaggen:karte`) bricht das: hinter dem Doppelpunkt steht die
 * SPIELFORM, die Karte ist Europa.
 *
 * Der Name der Ebene muss trotzdem mit `flaggen` anfangen - der Teil davor
 * ist die Gruppe, und ohne ihn faende weder die Kachelgruppe noch der
 * Rauchtest die Ebene (das hat F3 eine Runde gekostet).
 *
 * Also steht die Zuordnung HIER, an einer Stelle, und alle vier Nutzer
 * fragen sie: der Rahmen, die Umgebung, das Nachladen und die Auswahl.
 * `AUSSCHNITTE` in `erdkunde.js` macht dasselbe fuer Mittelamerika - das
 * Muster ist nicht neu, es bekommt nur einen zweiten Fall.
 *
 * WARUM EUROPA: es ist die tiefste Liste (17 Laender), und die Flaggen
 * Europas sind die, die ein Kind hier wirklich wiedersieht.
 */
const KARTE_ZU = { 'flaggen:karte': 'europa' };
const karteVon = (ebeneId) => KARTE_ZU[ebeneId]
  || String(ebeneId).split(':')[1] || '';
const vbVon = (ebeneId) => {
  const art = String(ebeneId).split(':')[0];
  const kont = karteVon(ebeneId);
  return art === 'kontinente' ? D.vbK : kont ? D.vbL[kont] : D.vbD;
};

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
/* Welche Buchstaben auf der Kachel stehen. Zwei, nicht das ganze Abc:
   drei passen auf 844 x 390 nicht mehr lesbar in ein Wasserzeichen. */
const SCHREIBBILD = {
  'schreiben':             ['A','B'],
  'schreiben:buchstaben':  ['A','B'],
  /* Die Diktat-Ebene zeigt einen LAUTSPRECHER statt eines zweiten
     Buchstabens. Der Unterschied zur Nachfahr-Ebene ist, dass man den
     Buchstaben hoert - und genau das muss die Kachel sagen: Fiona liest
     die Ueberschrift „Buchstaben hoeren" nicht. */
  'schreiben:diktat':      ['ton','A'],
  'schreiben:ziffern':     ['1','2'],
  'schreiben:zahlen':      ['ton','7'],
};
/* Welche Kennungen ein Englischbild tragen - und WELCHES.
 *
 * Bis E6 stand hier ein Satz und der Vermerk „keine Tabelle, es gibt
 * (noch) nichts zu unterscheiden". Mit der zweiten Kinderebene stimmt das
 * nicht mehr: „Hoeren und zeigen" und „Sag es" stehen nebeneinander in
 * derselben Welt, und wer beide mit demselben Ohr bemalt, sagt einem
 * Kind, das nicht liest, sie seien dasselbe.
 *
 * Links das Zeichen, rechts der Fleck. Der Fleck ist in beiden derselbe -
 * er steht fuer das Bild, auf das es hinauslaeuft; das Zeichen davor
 * sagt, was das Kind damit TUT: hinhoeren oder sprechen. */
/* Wieviele gemalte Paare es braucht, damit die Ebene fuer ein Kind, das
   nicht liest, ueberhaupt eine ist.
   VIER, weil Fionas Sitzung sechs Aufgaben hat: vier Paare sind acht
   Gegenstaende, und damit wiederholt sich in einer Sitzung nichts
   vollstaendig. Bei dreien saehe sie in jeder Sitzung alles.
   Die Zahl steht HIER und nicht im Ebeneneintrag: sie ist eine Aussage
   ueber den Vorrat, und wenn `sitzung` sich aendert, sucht man sie an
   dieser Stelle. */
const LAUTPAARE_FUER_BILDER = 4;

const ENGLISCHZEICHEN = { 'englisch':'ton', 'englisch:hoeren':'ton',
                          'englisch:sagen':'mikro', 'englisch:satz':'blase',
                          'englisch:legen':'karten',
                          'englisch:bauen':'satzkarten',
                          'englisch:laute':'zweiton',
                          'englisch:lesen':'lupe' };
/* Das Mikrofon als PFADE, nicht als `<rect>`.
   Dieselbe Messstelle wie ueberall (Regel 5): `passt` misst die
   gezeichnete Ausdehnung je Pfad; ein `<rect>` findet es gar nicht
   erst, und die Kachel meldete ein Bild von null Punkten. */
const MIKROSTRICH = '<path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z"/>'
  + '<path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>';
/* Und die Sprechblase fuer den ganzen Satz (E9): dieselbe Aussage eine
   Stufe groesser - nicht ein Wort, sondern etwas Gesagtes. Auch sie als
   PFAD, aus demselben Grund. */
const BLASENSTRICH = '<path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-5 4v-4H4'
  + 'a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M7 10h10M7 13h6"/>';
/* Und die Karten fuers Legen (E8): drei Buchstabenkarten in einer Reihe,
   die mittlere angehoben - sie ist gerade unterwegs. Nicht ein Stift und
   nicht ein Blatt: geschrieben wird hier nicht, gelegt wird. Auch sie als
   PFADE, aus demselben Grund wie das Mikrofon. */
const KARTENSTRICH = '<path d="M2 8h9v14H2zM24 8h9v14h-9z"/>'
  + '<path d="M13 3h9v14h-9z"/>';
/* Und fuers Satzbauen (E9c) dieselbe Aussage eine Stufe groesser: nicht
   drei schmale Karten, sondern zwei breite in einer Zeile und eine
   angehobene darueber - Woerter statt Buchstaben. Zwei Ebenen mit
   demselben Zeichen wuerden einem Kind sagen, sie seien dasselbe. */
const SATZKARTENSTRICH = '<path d="M2 12h13v10H2zM19 12h14v10H19z"/>'
  + '<path d="M8 2h17v8H8z"/>';
/* Und fuer die Lautpaare (E5): ZWEI Schallwellen, eine gross und eine
   klein - zwei Woerter, die fast gleich klingen. Kein Ohr und kein
   Lautsprecher: die beiden anderen Englischkacheln tragen schon einen
   Lautsprecher, und drei Kacheln mit demselben Zeichen sagen einem Kind,
   sie seien dasselbe. */
const ZWEITONSTRICH = '<path d="M4 8v8M10 4v16M16 9v6M22 6v12M28 10v4M34 7v10"/>';
/* Und fuers Lesen (E7): eine Lupe ueber drei Schriftzeilen - gelesen wird
   ein WORT, und gesucht wird das Bild dazu. Kein Buch: das Buch ist im
   Haus schon das Forscherbuch, und zwei Dinge mit demselben Zeichen sagen
   einem Kind, sie seien dasselbe. */
const LUPENSTRICH = '<path d="M2 6h16M2 12h13M2 18h16"/>'
  + '<path d="M28 4a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM34 18l6 6"/>';
/* Die Kachel der Elternebene (E10). Zwei ineinandergreifende Ringe: zwei
   Woerter, die sich aehnlich sehen und Verschiedenes heissen. Kein
   Warnzeichen und kein Kreuz - die Ebene zeigt eine Falle, sie verbietet
   nichts. */
const FREUNDEBILD = new Set(['freunde']);
/* Die Kachel von „Gestern und heute" (I8): zwei Pfeile auf einer Linie -
   der lange zurueck, der kurze nach vorn. Es geht um die Zeitform, und
   das Zeichen sagt genau das, ohne ein Wort zu brauchen. Kein Kalender
   und keine Uhr: beide hiessen „Datum" und nicht „Vergangenheit". */
const VERBENBILD = new Set(['verben']);
/* Die Kachel von „Das kleine Wort" (I9): ein langes Wort, ein kurzes,
   ein langes - und das kurze in der Mitte hervorgehoben. Es geht um das
   winzige Wort zwischen zwei grossen, und genau so sieht es aus. Kein
   Pfeil und kein Ortszeichen: eine Praeposition ist nicht immer ein Ort
   („good at maths" ist keiner). */
const PRAEPBILD = new Set(['praeposition']);
/* Die Kachel von „Meter und Gramm" (I10): ein langer Strich, ein
   Gleichheitszeichen, vier kurze. „Das eine ist so viel wie das andere,
   nur kleiner gestueckelt" - das ist die ganze Ebene in einem Bild, und
   es ist keines der vier Rechenzeichen. Ein Lineal waere schoener und in
   dieser Groesse nicht mehr zu erkennen. */
const EINHEITENBILD = new Set(['rechnen:einheiten']);
/* Die Kachel von „Vorher und nachher" (I13): ein Zahlenstrahl - eine
   Linie mit vier Kerben und einem Pfeil nach rechts. Kein Rechenzeichen,
   weil nicht gerechnet wird; und fuer Fiona, die nicht liest, IST das
   Zeichen der Name der Kachel. */
const REIHEBILD = new Set(['rechnen:nachbar']);
/* Die Kachel der Wendungen (E11): zwei Sprechblasen - es geht um das, was
   man SAGT, und nicht um einzelne Woerter. Und die von „Hören und
   schreiben" (E12): der Lautsprecher und drei Schriftzeilen, in dieser
   Reihenfolge - erst hoeren, dann schreiben. */
const SATZBILD = {
  wendungen: '<path d="M4 4h17v11H11l-4 4v-4H4z"/>'
           + '<path d="M27 9h17v11H34l-4 4v-4h-3z"/>',
  hoersatz:  ZEICHEN.tonAn + '<path d="M28 8h16M28 13h16M28 18h10"/>',
};
const MATHEBILD = {
  'rechnen':           ['plus','mal'],
  'rechnen:plusminus': ['plus','minus'],
  'rechnen:reihen':    ['mal','durch'],
  'rechnen:gross':     ['mal','plus'],
  /* Die drei aus I4. Jede bekommt das Zeichenpaar, das ihre Frage
     ausmacht - „Doppelt und halb" ist Mal-Zwei und Durch-Zwei, „Was
     fehlt?" ist Mal mit einer Luecke (also Mal und Minus), „Prozent im
     Kopf" ist Durch und Mal. Fiona liest die Ueberschrift nicht; das
     Zeichenpaar ist fuer sie der Name der Kachel. */
  'rechnen:verdoppeln': ['mal','durch'],
  /* I10: „Zehn und drueber" ist Plus und Minus - dieselben zwei Zeichen
     wie bei Fiona, und das ist richtig so: es IST dieselbe Rechenart,
     nur ueber den Zehner. „Meter und Gramm" bekommt Mal und Durch, weil
     eine Umrechnung genau das ist, in beide Richtungen. */
  'rechnen:zehner':     ['plus','minus'],
  /* „Meter und Gramm" steht NICHT hier, obwohl eine Umrechnung ein Mal
     und ein Durch ist. Der Grund ist das Bild und nicht die Rechnung:
     „Reihen 6 bis 10" traegt dasselbe Paar, und die beiden Kacheln
     stuenden in derselben Wand nebeneinander und saehen gleich aus. Die
     Ebene bekommt deshalb ein eigenes Zeichen - siehe EINHEITENBILD. */
  'rechnen:luecke':     ['mal','minus'],
  'rechnen:prozent':    ['durch','mal'],
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
  /* Die Flaggenkachel (F2) zeigt eine ECHTE Flagge - keine gezeichnete
   * Fahne an einem Mast.
   *
   * Welche: die ERSTE dieser Karte, also die, nach der auch als erstes
   * gefragt wird. Fuer Europa Russland, fuer Asien Indien. Ein eigenes
   * Schmuckbild waere schoener zu bauen und eine Luege - was zweimal
   * dasteht, veraltet einmal (Regel 6) -
   * dieselbe Ueberlegung wie beim Kachelbuchstaben, der genau der Zug
   * ist, den Fiona gleich nachfaehrt.
   *
   * Und die GRUPPENKACHEL (`flaggen`) zeigt Deutschland: sie steht fuer
   * alle sieben Karten, und keine davon ist die richtige Antwort auf
   * „welche Flagge steht hier stellvertretend". Die des eigenen Landes
   * ist die einzige, die ein Kind hier schon kennt. */
  if (ebeneId === 'flaggen' || ebeneId.startsWith('flaggen:')) {
    const kont = ebeneId.split(':')[1];
    const erste = kont && (D.laender[kont] || []).find(l => Flaggen.flaggeFragbar(l.a3));
    /* Die Klasse sitzt am SVG selbst und nicht an einer Huelle darum.
       `passt` sucht `.kachel .silhouette` und ruft darauf `getScreenCTM()` -
       auf einem `<span>` gibt es das nicht, und das Tor stuerzte ab. */
    return Flaggen.flaggeSvg(erste ? erste.a3 : 'DEU',
      { klasse: 'silhouette flaggensilhouette' });
  }
  /* Die Schreibwelt zeigt Buchstaben - und zwar DIE Buchstaben.
   *
   * Gezeichnet aus `Schreiben.BUCHSTABEN`, nicht aus einem zweiten,
   * huebscheren Satz: was auf der Kachel steht, ist genau der Zug, den
   * Fiona gleich nachfaehrt. Ein eigener Schmuckbuchstabe waere schoener
   * zu malen und eine Luege (Regel 6). */
  if (SCHREIBBILD[ebeneId]) {
    const teile = SCHREIBBILD[ebeneId].map((z, i) => {
      // `ton` ist kein Buchstabe, sondern das Lautsprecherzeichen aus dem
      // Kopf - dasselbe Bild an zwei Stellen, nicht ein zweites daneben.
      // Es lebt in einem 24er-Kasten und wird auf die 100 gezogen; die
      // Strichstaerke wird dabei zurueckgenommen, sonst wuerde sie mit
      // vergroessert und das Zeichen ein Klotz.
      if (z === 'ton')
        return `<g transform="translate(${i * 110 + 8} 12) scale(3.4)"
                   stroke-width="2.4">${ZEICHEN.tonAn}</g>`;
      return Schreiben.zuegeVon(z).map(d =>
        `<path transform="translate(${i * 110} 0)" d="${d}"/>`).join('');
    }).join('');
    const breit = SCHREIBBILD[ebeneId].length * 110 - 10;
    return `<svg class="silhouette gezeichnet" viewBox="0 0 ${breit} 100"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="9" stroke-linecap="round"
      stroke-linejoin="round">${teile}</svg>`;
  }
  /* Die Englischkachel (E3): das Lautsprecherzeichen und ein Fleck.
   *
   * Kein Union Jack und keine Buchstaben „EN" - Fiona liest nicht, und
   * eine Flagge sagt ihr nichts ueber die Aufgabe. Die beiden Zeichen
   * sagen genau das, was gleich passiert: du HOERST etwas und tippst auf
   * ein BILD. Der Fleck ist derselbe Kreis, der in der Aufgabe die Farbe
   * traegt - nicht ein huebscheres Zeichen daneben (Regel 6). */
  /* OHNE `transform` und ohne `<circle>` - und das ist keine Stilfrage,
     sondern die Messstelle (Regel 5). Der erste Anlauf setzte den
     Lautsprecher in eine skalierte Gruppe und den Fleck als `<circle>`.
     `passt` misst die gezeichnete Ausdehnung ueber `getBBox()` und
     `isPointInStroke` je PFAD, beides im eigenen Koordinatenraum des
     Pfades - eine Gruppentransformation faellt dabei heraus, und ein
     `<circle>` wird gar nicht erst gefunden. Gemeldet wurden 10 x 7
     Punkte, also 5 % der Kachel, bei einem Zeichen, das auf dem
     Bildschirm die halbe Kachel fuellt. Die Zahl war falsch, nicht das
     Bild - und eine falsche Zahl in einer Ratsche ist schlimmer als
     keine. Jetzt liegt alles in EINEM Raum: der 24er-Kasten des
     Lautsprecherzeichens, der Fleck als Bogenpfad daneben. */
  if (SATZBILD[ebeneId])
    return `<svg class="silhouette gezeichnet" viewBox="0 0 48 24"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
      stroke-linejoin="round">${SATZBILD[ebeneId]}</svg>`;
  if (FREUNDEBILD.has(ebeneId))
    return `<svg class="silhouette gezeichnet" viewBox="0 0 48 24"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
      stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-16 0 8 8 0 1 1 16 0"/><path
      d="M44 12a8 8 0 1 1-16 0 8 8 0 1 1 16 0"/></svg>`;
  if (VERBENBILD.has(ebeneId))
    return `<svg class="silhouette gezeichnet" viewBox="0 0 48 24"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
      stroke-linejoin="round"><path d="M4 8h40"/><path d="M11 3 4 8l7 5"/><path
      d="M44 18H14"/><path d="M38 13l6 5-6 5"/></svg>`;
  if (PRAEPBILD.has(ebeneId))
    return `<svg class="silhouette gezeichnet" viewBox="0 0 48 24"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
      stroke-linejoin="round"><path d="M3 12h13"/><path d="M32 12h13"/><rect
      x="19" y="6" width="10" height="12" rx="3"/></svg>`;
  if (ENGLISCHZEICHEN[ebeneId])
    return `<svg class="silhouette gezeichnet" viewBox="0 0 48 24"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
      stroke-linejoin="round">${ENGLISCHZEICHEN[ebeneId] === 'mikro' ? MIKROSTRICH
        : ENGLISCHZEICHEN[ebeneId] === 'blase' ? BLASENSTRICH
        : ENGLISCHZEICHEN[ebeneId] === 'karten' ? KARTENSTRICH
        : ENGLISCHZEICHEN[ebeneId] === 'satzkarten' ? SATZKARTENSTRICH
        : ENGLISCHZEICHEN[ebeneId] === 'zweiton' ? ZWEITONSTRICH
        : ENGLISCHZEICHEN[ebeneId] === 'lupe' ? LUPENSTRICH : ZEICHEN.tonAn}<path
      d="M44 12a8 8 0 1 1-16 0 8 8 0 1 1 16 0"/></svg>`;
  if (REIHEBILD.has(ebeneId))
    return `<svg class="silhouette gezeichnet" viewBox="0 0 48 24"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="2.6" stroke-linecap="round"
      stroke-linejoin="round"><path d="M4 15h38"/><path d="M36 9l6 6-6 6"/><path
      d="M9 9v6M18 9v6M27 9v6"/></svg>`;
  if (EINHEITENBILD.has(ebeneId))
    return `<svg class="silhouette gezeichnet" viewBox="0 0 48 24"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="2.6" stroke-linecap="round"
      stroke-linejoin="round"><path d="M4 12h11"/><path d="M20 9h6M20 15h6"/><path
      d="M31 12h2M36 12h2M41 12h2"/></svg>`;
  const zeichen = MATHEBILD[ebeneId];
  if (zeichen) {
    const teile = zeichen.map((n, i) =>
      `<path transform="translate(${i * 48} 0)" d="${MATHESTRICH[n]}"/>`).join('');
    return `<svg class="silhouette gezeichnet" viewBox="-4 -4 96 48"
      preserveAspectRatio="xMidYMid meet" aria-hidden="true" fill="none"
      stroke="currentColor" stroke-width="5" stroke-linecap="round">${teile}</svg>`;
  }
  const [art, kont] = ebeneId.split(':');
  // Der Kontinent, wenn die Kennung einen nennt - „Hauptstädte in Europa"
  // zeigt Europa, nicht Deutschland.
  const k = kont || SILHOUETTE[art];
  const s = k && D.silhouetten && D.silhouetten[k];
  if (!s) return '';
  return `<svg class="silhouette" viewBox="${s.vb}" preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"><path d="${s.d}"/></svg>`;
}

/**
 * Welcher Bildschirm spielt diese Ebene?
 *
 * Stand an drei Stellen als `ebeneArt(...)==='rechnen' ? a : b`. Mit der
 * dritten Sorte waeren daraus drei Ketten geworden, die getrennt
 * veralten - und eine davon haette Fionas Schreibebene auf dem
 * Kartenbildschirm geoeffnet, wo es nichts zu ziehen gibt.
 */
/* `wendungen` und `hoersatz` teilen sich EINEN Bildschirm.
 *
 * Was sie unterscheidet, ist eine Eigenschaft der AUFGABE und nicht des
 * Bildschirms: steht der deutsche Satz da, oder wird der englische
 * gesprochen? Dieselbe Ueberlegung wie beim Schreibschirm, der vier
 * Ebenen traegt - zwei Bildschirme waeren zwei Stellen, an denen die
 * naechste Aenderung einmal vergessen wird. */
const schirmZu = (ebeneId) => ({ rechnen: rechenschirm, schreiben: schreibschirm,
  englisch: englischschirm, freunde: freundeschirm, verben: freundeschirm,
  praeposition: freundeschirm,
  flaggen: flaggenschirm,
  wendungen: satzschirm, hoersatz: satzschirm }[ebeneArt(ebeneId)] || spielschirm);

/** Die Ebenen, die DIESEM Kind gehören.
 *
 * `wenn` kam mit E5 dazu, und es ist kein Schalter fuer Geschmack: die
 * Lautpaare pruefen das OHR. Ohne englische Stimme gibt es nichts zu
 * hoeren, und die Aufgabe waere „tippe das Wort an, das danebensteht" -
 * eine Ebene, die nichts prueft und trotzdem Sterne vergibt. Lieber gar
 * nicht angeboten. Gefragt wird bei JEDEM Aufbau der Wand, nicht einmal
 * beim Laden: welche Stimmen es gibt, weiss der Browser erst spaeter. */
const meineEbenen = () => EBENEN.filter(e =>
  (!e.wer || e.wer.includes(P.id)) && (!e.wenn || e.wenn()));
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
/* Wie lange das Lob stehenbleibt, bevor die naechste Aufgabe kommt.
 *
 * Stand dreimal als nackte `2600` im Quelltext - und war damit sowohl eine
 * Doppelung als auch der teuerste einzelne Posten der ganzen Pruefkette:
 * der Rauchtest spielt rund fuenfunddreissig Aufgaben und hat allein hier
 * anderthalb Minuten gewartet.
 *
 * `?flott` kuerzt sie auf 250 ms. Das ist KEIN Schalter fuer das Spiel:
 * die Adresse der ausgelieferten App traegt ihn nicht, und ein Kind kommt
 * nicht an ihn heran. Er ist fuer die Tore da, und was er aendert, ist
 * ausdruecklich keine Logik, sondern eine Wartezeit.
 *
 * Was damit NICHT geprueft wird: wie LANG eine Pause ist. Hier stand, der
 * Rauchtest lasse dafuer einen Durchgang ohne den Schalter laufen - das
 * stimmt nicht, er setzt ihn auf jeder Seite. Kein Tor misst diese Zahlen;
 * sie werden angesehen, nicht gemessen. Ein Kommentar, der eine Pruefung
 * behauptet, die es nicht gibt, ist schlimmer als keiner: er haelt genau
 * die Frage fuer erledigt, die offen ist.
 */
const FLOTT = new URLSearchParams(location.search).has('flott');
/* Jede Pause, in der nur ANGESEHEN wird, kommt hier durch.
 *
 * Drei Stueck, drei Laengen, ein Sinn: das Kind soll das Lob oder die
 * Aufloesung lesen, bevor der naechste Bildschirm kommt. `?flott` deckelt
 * sie alle auf 900 ms.
 *
 * Dass das eine Funktion ist und keine drei Zahlen, hat einen GEMESSENEN
 * Grund. Der Kartenweg hatte seine beiden Pausen als nackte `1600` und
 * `2400` im Rumpf stehen und war dem Schalter damit entgangen -
 * `quer-ende-eltern` brauchte mit und ohne `?flott` dieselben 15,2 s.
 * Gemerkt hat es niemand, weil der Rechenweg brav kuerzer wurde: ein
 * Schalter, der die Haelfte seiner Zusage haelt, sieht aus wie einer, der
 * sie ganz haelt. Wer eine neue Schaupause braucht, holt sie hier - und
 * `npm run inhalt` schlaegt an, wenn doch wieder eine Zahl danebenfaellt.
 */
const schauPause = (ms) => FLOTT ? Math.min(ms, 900) : ms;
const LOBPAUSE = schauPause(2600);
/* Wie lange EIN Zug beim Vormachen braucht.
 *
 * Steht hier und nicht im Stilblatt, weil zwei Dinge daran haengen, die
 * zusammenpassen muessen: die Malzeit des Strichs (im Markup gesetzt) und
 * die Wartezeit, bis der naechste Buchstabe kommt. Zwei Zahlen an zwei
 * Orten waeren dieselbe Auskunft doppelt - und eine davon veraltet. */
const VORMACHEN_JE_ZUG = 750;
/* 900 ms, nicht 250.
 *
 * Bei 250 war das Lob weg, bevor der Rauchtest es ansehen konnte - er
 * meldete „Timeout" beim Warten auf `.richtigText`, obwohl die Antwort
 * gewertet worden war. Eine Pause, die kuerzer ist als der Blick des
 * Beobachters, macht die Beobachtung unmoeglich; das ist kein schnellerer
 * Test, sondern ein blinder. 900 ms sind knapp ein Drittel der echten
 * Pause und reichen dem Test bequem. */

const WEISE_VOREINSTELLUNG = { fiona:'ziehen', lea:'antippen' };
/* `sprachmodus:true` - ab Werk AN, und das ist eine Entscheidung.
 *
 * Er stand auf `false`, mit gutem Grund: die Spracherkennung laeuft nicht
 * auf dem Geraet, sondern bei Apple beziehungsweise dem Browserhersteller,
 * und das schaltet man nicht ungefragt ein.
 *
 * Auf einem ZWEITEN Geraet hat das gekostet, was es kosten musste: die
 * Einstellungen liegen je Geraet in der Ablage, auf dem iPad war der
 * Schalter also wieder aus - und weil ein abgeschalteter Knopf mit Absicht
 * gar nicht erst erscheint, stand auf Fionas Bildschirm einfach kein
 * Mikrofon. Kein Hinweis, keine Erklaerung, nichts (M4s).
 *
 * Umgestellt auf Wunsch der Eltern, die die Frage fuer ihre Kinder
 * beantwortet haben. Der Schalter bleibt, der Hinweis im Elternbereich
 * bleibt, und die Sprechprobe dort sagt jetzt in einem Satz, woran es
 * liegt, wenn kein Mikrofon da ist. */
/* `klang:false` - die beiden Rueckmeldetoene sind ab Werk AUS.
 *
 * Bis Q4 hingen sie am selben Schalter wie die Sprache, mit der
 * Begruendung „wer ,Ton aus' sagt, meint nicht ,nur die Stimme aus'". Das
 * war fuer den Schalter richtig und fuer die Voreinstellung falsch: Fiona
 * liest noch nicht, sie BRAUCHT die Stimme - wer die Toene loswerden
 * wollte, musste ihr also das Vorlesen mit abschalten. Es gab keine
 * Stellung, in der die App vorliest und dabei still ist.
 *
 * Jetzt gibt es zwei Schalter. `ton` bleibt der grosse: aus heisst alles
 * aus, Stimme wie Toene. `klang` ist der kleine darunter und steht ab
 * Werk auf aus - auf Wunsch der Eltern, die es auf dem Geraet gehoert
 * haben. Er sitzt im Elternbereich und nicht in der Kopfzeile: es ist
 * keine Entscheidung, die ein Kind mitten in einer Aufgabe treffen soll.
 *
 * Geloescht ist nichts. `src/kern/klang.js` steht unveraendert da, der
 * Rauchtest misst die Toene weiter - er schaltet sie dafuer ein. */
let P=null, Sitzung=null, Stand={}, Einst={ ton:true, klang:false, abend:false, sprachmodus:true, pin:'0000',
  antwortweise:{ ...WEISE_VOREINSTELLUNG },
  // Je Kind UND Ebene, nicht ein Schalter fuer alle: der Vorlauf gehoert
  // zu der Ebene, die er erklaert. `stadtstaatenGezeigt` war der eine
  // Schalter, den es dafuer gab, und er ist mit der Lerneinheit
  // weggefallen.
  vorlaufGezeigt:{}, hauptstadtAuswahl:true,
  // Leas Regler und ihre Eingabeweise beim Rechnen. Beide gehören in die
  // Einstellungen und nicht ins Profil: das Profil sagt, WER spielt, die
  // Einstellung, wie es gerade eingestellt ist.
  reihenGeteilt: Rechnen.GETEILT_STANDARD, rechenweise:{},
  // Die Sprechprobe (M4r). Sie gehoert hierher und nicht ins Protokoll:
  // sie sagt nichts ueber ein Kind, sondern ueber dieses Geraet.
  sprechprobe:[] };

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
    // `warGesessen`, nicht `istGesessen`: eine Runde, die einmal offen war,
    // geht nicht wieder zu. Gemessen ueber ein Jahr Spiel war Runde 2 an 47
    // von 208 Sitzungen wieder verschlossen - Fiona setzte sich hin, und
    // Asien und Nordamerika waren weg, weil sie eines davon zuletzt
    // danebengeraten hatte.
    if (!bisher.every(k => Leitner.warGesessen(stand, k.id))) break;
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

/* ---------- Die Leiter (I2) ----------------------------------------------
 *
 * Befund U2 des Inhalt-Audits: „Die Tiefe waechst nicht mit."
 *
 * Jedes Profil hatte eine FESTE `laenderTiefe` - Fiona 3, Lea 13, die
 * Eltern 17. Fiona sah in Europa drei Laender: heute, morgen und in einem
 * Jahr. Gemessen waren das 0,5 Runden Vorrat; acht ihrer Laenderebenen und
 * alle sieben Flaggenebenen standen auf demselben Wert.
 *
 * Fuer die KONTINENTE gibt es die Loesung seit langem und eine Zeile
 * darueber: `kontinentRunde` oeffnet Runde fuer Runde, sobald das Kind die
 * offenen kann. Fuer Laender und Flaggen hat es nie jemand nachgezogen.
 * Das hier ist dieselbe Bewegung, mit denselben zwei Entscheidungen:
 *
 *   `warGesessen`, NICHT `istGesessen`. Eine Stufe, die einmal offen war,
 *   geht nicht wieder zu. Bei den Kontinenten ist genau das gemessen
 *   worden: an 47 von 208 Sitzungen war Runde 2 wieder verschlossen, weil
 *   das Kind einmal danebengeraten hatte.
 *
 *   Die Tiefe des Profils ist der ANFANG, nicht die Grenze. Wer heute
 *   anfaengt, sieht drei; wer die drei kann, sieht sechs.
 *
 * WARUM DREI AUF EINMAL und nicht eins: bei einem waere die Stufe kein
 * Ereignis, sondern ein Rauschen - und der Vorrat waechst so langsam, dass
 * die Sitzung ihn weiter ueberholt. Drei ist die Zahl, mit der Fionas
 * Ebene nach der ersten gekonnten Stufe von 0,5 auf 1,0 Runden geht und
 * nach der zweiten darueber.
 *
 * WAS ES KOSTET, und das steht hier, weil es auffaellt: der
 * Fortschrittsbalken kann SINKEN. Wer zwei von drei Laendern gesammelt hat
 * und die dritte Stufe oeffnet, steht bei zwei von sechs. Das ist der
 * Preis dafuer, dass der Balken zeigt, was OFFEN ist, und nicht, was es
 * auf der Welt gibt.
 *
 * Der schlimmste Fall ist dabei ausgeschlossen, und zwar rechnerisch: ein
 * VOLLER Balken kann nicht einbrechen. Damit er voll ist, muss jedes
 * offene Land einen Aufkleber haben (Fach 3), und Fach 3 heisst auch Fach
 * 2 - die Stufe waere also laengst offen. „Alles gesammelt" und „es kommt
 * noch etwas" koennen nicht gleichzeitig gelten. Der Haken auf der
 * Station (N11) wird deshalb nie zurueckgenommen.
 */
const LEITER_STUFE = 3;

/* `liste` sind die Gegenstaende, die DIESE Ebene fragt - nicht alle
 * Laender des Kontinents. Der Unterschied hat beim ersten Anlauf gebissen:
 * die Flaggenebene fragt nur Laender MIT gezeichneter Flagge, die Leiter
 * lief aber ueber alle. Ein Land ohne Flagge kommt damit nie in eine
 * Sitzung, wird nie gekonnt - und die Leiter blieb an ihm haengen. Afrika
 * hoerte bei fuenfzehn von achtundzwanzig auf, ohne dass etwas rot wurde:
 * der Vorrat war ja da, er wurde nur nie geoeffnet.
 *
 * Und die Obergrenze ist der groesste RANG, nicht die Laenge der Liste.
 * Bei einer gesiebten Liste sind das zwei verschiedene Zahlen (28 Eintraege,
 * Raenge bis 30), und die Laenge waere die falsche: die Leiter haette zwei
 * Raenge vor dem Ende angehalten. */
function leiterTiefe(liste, stand, grund, kennung){
  const hoechster = Math.max(...liste.map(x => x.rang || 0), 0);
  let tiefe = Math.max(1, grund);
  while (tiefe < hoechster) {
    const offen = liste.filter(x => x.rang <= tiefe);
    if (!offen.length) break;
    if (!offen.every(x => Leitner.warGesessen(stand, kennung(x)))) break;
    tiefe += LEITER_STUFE;
  }
  return Math.min(tiefe, hoechster);
}
/* Ein Rahmen, der NUR dieses eine Stueck zeigt.
 *
 * Stand bis R3 im Forscherbuch und wird seit dem Vorlauf an zwei Stellen
 * gebraucht - also gehoert er an eine. Gerechnet aus dem Pfad selbst, mit
 * acht Prozent Luft ringsum: im Rahmen der ganzen Karte ist Bremen
 * praktisch unsichtbar, und ein Bild, auf dem man die Form nicht erkennt,
 * ist keins.
 */
/**
 * Ein Buchstabe als Bild - dieselben Zuege, die gleich nachgefahren werden.
 *
 * Steht hier einmal und wird von drei Stellen gelesen: Vorlauf,
 * Forscherbuch und Schreibschirm. Vorher stand die Fallunterscheidung
 * „Umriss oder Rechenkleber" an zwei Stellen abgeschrieben - eine dritte
 * Sorte haette sie zu einer dritten Abschrift gemacht.
 */
const buchstabenBild = (x, ton) => {
  // Eine ZEICHENFOLGE, kein Zeichen: die Zahl 14 ist zwei Ziffern
  // nebeneinander. Bei allem anderen ist die Folge einen lang, und dann
  // ist das hier dieselbe Zeichnung wie vorher.
  const folge = x.zeichenFolge || [x.zeichen];
  /* 66 und nicht 100: die Zeichen sind im Kasten rund 56 breit, also liegen
     bei vollem Abstand vierzig Punkte Luft dazwischen - „1 0" statt „10".
     Eine Zahl ist ein Wort, keine zwei Bilder. Bei einem einzelnen Zeichen
     aendert sich dadurch nichts. */
  const teile = folge.map((z, i) => Schreiben.zuegeVon(z)
    .map(d => `<path transform="translate(${i * 66} 0)" d="${d}"/>`).join('')).join('');
  return `
  <svg class="zeichenbild" viewBox="0 0 ${(folge.length - 1) * 66 + 100} 100"
       preserveAspectRatio="xMidYMid meet"
       aria-hidden="true" fill="none" stroke="${ton}" stroke-width="9"
       stroke-linecap="round" stroke-linejoin="round">${teile}</svg>`;
};

/** Das Bild EINES Stuecks - Umriss, Rechnung oder Buchstabe.
 *
 * `offen` heisst „noch nicht gesammelt". Ein offener Umriss ist blass, und
 * das ist kein Schmuck: im Forscherbuch stehen gesammelte und offene
 * nebeneinander, und der Unterschied ist die ganze Auskunft. Der erste
 * Entwurf dieser Zusammenfassung hat ihn verloren - die Strichdeckung
 * stand fest auf .6 statt .25 -, und gemerkt hat es der Bildvergleich. */
/* Der Stanzrand (Q28).
 *
 * Bis hierher war ein „Aufkleber" ein flacher Umriss in einem weissen
 * Kasten - also ein Kartenausschnitt, kein Aufkleber. Was einen ausmacht,
 * ist der weisse Rand, den die Stanze stehen laesst, und der Schatten
 * darunter. Beides entsteht aus DEMSELBEN Pfad, dreimal gezeichnet:
 *
 *     1. weiter, sehr blasser Strich   der Schatten ringsum
 *     2. weisser Strich darueber       der Stanzrand
 *     3. die Flaeche selbst            der Aufkleber
 *     4. ein Verlauf obendrauf         der Glanz
 *
 * Alle Striche tragen `vector-effect="non-scaling-stroke"`, sind also in
 * BILDSCHIRMpunkten breit und nicht in Kartenkoordinaten. Ohne das waere
 * der Rand auf der Weltkarte unsichtbar und auf einem Bundesland ein
 * Klumpen: die Umrisse dieser App leben in Rahmen, die sich um mehr als
 * das Tausendfache unterscheiden.
 *
 * Und deshalb steht hier auch KEIN Versatz nach unten fuer den Schatten:
 * ein `translate` gaelte in Kartenkoordinaten und waere auf Bremen eine
 * Bildschirmbreite. Der Schatten liegt ringsum, nicht darunter.
 *
 * Was noch nicht gesammelt ist, bekommt nichts davon: es ist der SCHATTEN
 * des Aufklebers, nicht der Aufkleber. */
const stueckBild = (x, ton, rahmen, offen = false) =>
  /* Das gezeichnete Wort (E7/E5b) kommt VOR dem Kartenumriss: es traegt
     seine Farben selbst, und der Aufkleberweg darunter wuerde sie durch
     EINEN Ton ersetzen - genau die Auskunft, die das Bild ausmacht.
     Was noch nicht gesammelt ist, wird blass wie ueberall im Buch; die
     Farben bleiben, damit man sieht, WAS dort zu holen ist. */
    x.bild  ? `<div class="bildkleber${offen ? ' offen' : ''}"
                >${Englisch.bildSvg(x.bild, 'wortbild')}</div>`
  : x.pfad  ? `<svg viewBox="${rahmen}" aria-hidden="true">${offen ? '' : `
                <path d="${x.pfad}" fill-rule="evenodd" class="kleberschatten"/>
                <path d="${x.pfad}" fill-rule="evenodd" class="kleberrand"/>`}
               <path d="${x.pfad}" fill-rule="evenodd"
                fill="${ton}" stroke="var(--tinte)" stroke-opacity="${offen ? .25 : .6}"
                stroke-width="1.6" vector-effect="non-scaling-stroke"/>${offen ? '' : `
               <path d="${x.pfad}" fill-rule="evenodd" class="kleberglanz"/>`}</svg>`
  : x.zeichenFolge ? buchstabenBild(x, ton)
  /* Die beiden Bilder der Englischebene (E3).
   *
   * Sie kommen VOR dem Rechenzweig, weil beide dieselbe letzte Zeile
   * treffen wuerden - ein englischer Gegenstand hat kein `frage`, und der
   * Kasten waere leer.
   *
   * Der Farbfleck traegt seinen Ton als Marke am Markup, nicht im
   * Stilblatt: welche zehn Farben es gibt, steht in den Daten, und eine
   * Liste im Stylesheet daneben waere dieselbe Auskunft an zwei Orten. */
  /* Die Flagge (F2). Sie kommt VOR allem anderen ausser dem Umriss:
     ein Flaggen-Gegenstand hat keinen `pfad`, kein `frage` und kein
     `farbton`, und ohne diese Zeile fiele er auf den Rechenkasten
     durch - ein leerer Kasten mit `undefined` darin.
     
     Was OFFEN ist, wird blass. Das ist dieselbe Auskunft wie beim
     blassen Umriss: im Buch stehen gesammelte und offene nebeneinander,
     und der Unterschied ist der ganze Sinn der Seite. */
  : x.flagge   ? `<div class="flaggenkleber${offen ? ' offen' : ''}"
                    >${Flaggen.flaggeSvg(x.flagge)}</div>`
  /* Der Satz zum Selbersagen (E9) hat weder Umriss noch Farbe noch
     Ziffer - er IST ein Satz. Er bekommt denselben Wortkasten wie die
     Wendungen der Eltern, nur enger gesetzt. Ohne diesen Zweig fiele er
     auf den Rechenkasten durch und zeigte `undefined` - genau derselbe
     Weg wie bei der Flagge, und aus demselben Grund. */
  : x.sorte === 'chunk'
                 ? `<div class="wortkleber satzkleber" style="--ton:${ton}">${x.wort}</div>`
  /* Das Lautpaar (E5) zeigt BEIDE Woerter, nicht eines. Der Vorlauf sagt,
     wie die Aufgabe aussieht - und die Aufgabe IST das Paar. Ein Kaestchen
     mit „think" allein waere eine Vokabel und keine Hoeruebung; genau
     dieselbe Ueberlegung steht beim falschen Freund ein Stueck weiter
     unten. Ohne diesen Zweig fiel das Stueck auf den Rechenkasten durch
     und zeigte `undefined` - gemeldet von `passt`, sechzehnmal. */
  : x.sorte === 'laut'
                 ? `<div class="wortkleber lautkleber" style="--ton:${ton}"
                      lang="en">${x.wort} · ${x.gegen}</div>`
  : x.luecke || x.deutsch
                 ? `<div class="wortkleber" style="--ton:${ton}">${x.name}</div>`
  : x.farbton    ? `<div class="farbfleck" style="--farbton:${x.farbton}"></div>`
  : x.ziffern    ? `<div class="ziffernkleber" style="--ton:${ton}">${x.ziffern}</div>`
  :           `<div class="rechenkleber" style="--ton:${ton}">${x.frage}</div>`;

/** EIN Aufkleber, so wie er im Buch klebt.
 *
 * Drei Stellen zeigen denselben: das Buch, der Lobsatz im Augenblick des
 * Verdienens und der Endbildschirm. Vor Q28 war das keine Frage - nur das
 * Buch zeigte ihn ueberhaupt, die anderen beiden sagten eine Zahl. */
const kleberBild = (x, i, ebeneId) => stueckBild(x, `var(${FL[i % 7]})`,
  eigenerRahmen(x.pfad) || vbVon(ebeneId));

/** Was unter dem Bild steht. Beim Buchstaben sein Merkwort. */
/* Beim englischen Gegenstand steht das WORT darunter - und zwar nur im
   Vorlauf und im Buch, nie in der Aufgabe. Dort waere es die Antwort. */
/* Unter einer Flagge steht ihr Land - ohne „=". Das Gleichzeichen gehoert
   zur Rechenaufgabe („3 + 4 = 7"), und dorthin faellt jeder Gegenstand
   durch, der keinen eigenen Zweig hat. Genau das ist hier passiert: im
   Vorlauf stand „= Frankreich" unter der Trikolore. */
const stueckFuss = (x) => x.flagge ? x.name
                        : x.bild ? x.wort
                        : x.pfad ? x.name : x.zeichenFolge ? x.wort
                        /* Unter dem Lautpaar steht, WORUM es geht - „Das
                           englische th" -, nicht noch einmal ein Wort. Die
                           beiden Woerter stehen schon im Kasten, und ihr
                           Name ist die Stolperstelle. */
                        : x.sorte === 'laut' ? x.stolperName
                        : x.sorte ? x.wort
                        /* Beim falschen Freund steht die FALLE darunter, nicht
                           die Uebersetzung: der Aufkleber ist das PAAR
                           (`get` gegen `became`), und das Paar ist die ganze
                           Lehre. Ein Aufkleber, der nur „get" zeigt, waere
                           eine Vokabel und kein falscher Freund.
                           Der erste Anlauf schnitt das Wort mit einem
                           regulaeren Ausdruck aus `warum` heraus - eine
                           Zeichenkette zu zerlegen, die es als Feld daneben
                           gibt, ist die Sorte Klugheit, die beim naechsten
                           Satzzeichen bricht. */
                        : x.falle ? `nicht ${x.falle}`
                        // Bei einer Wendung steht der DEUTSCHE Satz darunter -
                        // er ist die Aufgabe, das Englische die Antwort.
                        : x.deutsch ? x.deutsch
                        : `= ${x.name}`;

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

/* `voll` heisst: was diese Ebene UEBERHAUPT enthaelt, ohne die Grenzen
   des Kindes. Gebraucht von den Abzeichen (D2): ihre Menge muss
   feststehen, sonst waechst sie mit Fionas Kontinentrunde mit und ein
   verdientes Abzeichen ginge wieder verloren. */
function vorrat(ebeneId, stand = Stand, voll = false){
  const [art, kont] = ebeneId.split(':');
  if (art==='kontinente') {
    const bis = voll ? RUNDEN : (P.id==='fiona' ? kontinentRunde(stand) : RUNDEN);
    return D.kontinente.filter(k=>k.runde<=bis)
      .map(k=>({ id:k.id, name:k.name, aliasse:k.aliasse, aussprache:k.aussprache,
                 pfad:k.pfad, anker:k.anker }));
  }
  if (art==='laender') {
    // `nachbarDE` wird mitgereicht, damit das Abzeichen „alle Nachbarn von
    // Deutschland" seine Menge aus den DATEN nimmt (D2b) - wie
    // `stadtstaat` bei den Bundesländern.
    const tiefe = leiterTiefe(D.laender[kont] || [], stand, P.laenderTiefe, l => l.a3);
    return D.laender[kont].filter(l=>voll || l.rang<=tiefe)
      .map(l=>({ id:l.a3, name:l.name, aliasse:l.aliasse, aussprache:l.aussprache,
                 pfad:l.pfad, anker:l.anker, nachbarDE:l.nachbarDE }));
  }
  if (art==='bundeslaender')
    // `stadtstaat` wird mitgereicht, damit das Abzeichen „die drei
    // Stadtstaaten" seine Menge aus den DATEN nimmt und nicht aus einer
    // Liste von Kennungen (D2).
    return D.deutschland.map(b=>({ id:b.id, name:b.name, aliasse:[], aussprache:[b.name.toLowerCase()],
      pfad:b.pfad, anker:b.anker, stadtstaat:b.stadtstaat }));
  /* Wer grenzt an wen (I21). DERSELBE Vorrat wie eine Zeile darueber,
     nur mit `grenzt` dazu - es ist dieselbe Karte und dieselben sechzehn
     Gebiete, gefragt wird nur etwas anderes. Ein eigener Datensatz waere
     die zweite Wahrheit, die beim naechsten Umriss veraltet. */
  if (art==='nachbarn')
    return D.deutschland.map(b=>({ id:b.id, name:b.name, aliasse:[],
      aussprache:[b.name.toLowerCase()], pfad:b.pfad, anker:b.anker,
      stadtstaat:b.stadtstaat, grenzt:b.grenzt || [] }));
  /* „Was ist groesser?" (I22) - EIN Gegenstand je PAAR, nicht je Land.
   *
   * Das ist die Sache selbst: gelernt wird nicht „Polen", sondern
   * „Spanien ist groesser als Polen". Ein Gegenstand je Land waere ein
   * Leitner-Stand fuer etwas, das es nicht gibt - ein Land ist nicht
   * fuer sich gross, sondern immer im Vergleich.
   *
   * KEINE TIEFE (`voll` wird nicht gefragt). Warum, steht bei der Ebene
   * selbst: zwei Flaechen zu vergleichen setzt kein Wissen voraus.
   *
   * `pfad` bleibt DRAUSSEN. Der Gegenstand ist ein Paar und hat keinen
   * eigenen Umriss; die Umrisse holt sich der Bildschirm aus
   * `D.laender[kont]`, weil beide Laender ihren eigenen brauchen. Ein
   * `pfad` hier waere die halbe Antwort im Buch und im Vorlauf - genau
   * die Weiche, die der Flaggenvorrat eine Zeile weiter unten kennt. */
  if (art==='groesser') {
    const namen = new Map((D.laender[kont] || []).map(l => [l.a3, l]));
    return (D.paare[kont] || []).filter(([g,k]) => namen.has(g) && namen.has(k))
      .map(([g,k,mal]) => ({ id:`gr:${kont}:${g}-${k}`, gross:g, klein:k, mal,
        name: namen.get(g).name, kleinName: namen.get(k).name,
        aliasse: namen.get(g).aliasse, aussprache: namen.get(g).aussprache }));
  }
  // Erzeugt statt aufgelistet - hundert Rechenaufgaben schreibt niemand hin.
  // Die Kennung kommt aus der Aufgabe selbst (`p3+4`), damit der
  // Leitner-Stand über Sitzungen trägt.
  /* Der Flaggenvorrat (F2) sind DIESELBEN Laender wie auf der Karte.
   *
   * Name, Schreibweisen und Aussprache kommen aus `LAENDER` und werden
   * dort gepflegt (Konzept 1.2) - eine zweite Faktenliste waere die, die
   * beim naechsten Namen veraltet. `rang` traegt die Tiefe je Profil mit,
   * ohne einen neuen Regler.
   *
   * `pfad` wird ABSICHTLICH NICHT mitgereicht. Er ist der Kartenumriss,
   * und wer ihn im Gegenstand hat, bekommt im Buch und im Vorlauf den
   * Umriss statt der Flagge gezeigt - die Kartenkarte kennt genau diese
   * Weiche. Hier ist die Flagge das Bild, und der Umriss waere die halbe
   * Antwort.
   *
   * `voll` gilt wie bei den Laendern: die Menge eines Abzeichens darf
   * nicht mit der Tiefe des Profils wackeln (D2b). */
  /* DIE ENGERE BEDINGUNG ZUERST.
   *
   * Hier stand sie hinter der allgemeinen (`art==='flaggen'`), und die
   * schluckte sie: `D.laender['paare']` gibt es nicht, also kam eine
   * leere Liste zurueck. Der Rauchtest sagte es sofort - „die Kachel
   * steht da und fragt nichts" -, aber gruen waere sie in jedem Tor
   * gewesen, das nur zaehlt statt zu spielen. */
  /* „Auf die Karte" (F4): dieselben Laender wie `laender:europa`, MIT
   * Umriss (der wird gebraucht - es wird ja auf die Karte getippt) und
   * mit Flagge.
   *
   * `hatFlagge` filtert, und das ist keine Formalie: `FLAGGEN_EXTRA`
   * (der Tschad, Irland, ...) hat KEINEN Kartenumriss und darf hier
   * nicht auftauchen - sonst fragte die Ebene nach einem Ort, den es auf
   * keiner Karte dieser App gibt. Das Tor `flaggen` haelt beide Listen
   * getrennt; hier wirkt die Trennung. */
  if (art==='flaggen' && kont==='karte') {
    const mitFlagge = (D.laender.europa || []).filter(l => Flaggen.flaggeFragbar(l.a3));
    const tiefe = leiterTiefe(mitFlagge, stand, P.laenderTiefe, l => `fk:${l.a3}`);
    return mitFlagge.filter(l => voll || l.rang<=tiefe)
      .map(l=>({ id:`fk:${l.a3}`, a3:l.a3, name:l.name, aliasse:l.aliasse,
                 aussprache:l.aussprache, flagge:l.a3, pfad:l.pfad, anker:l.anker }));
  }
  if (art==='flaggen' && kont==='paare') {
    const namen = new Map();
    for (const liste of Object.values(D.laender))
      for (const l of liste) namen.set(l.a3, l);
    const nameVon = (a3) => namen.get(a3)
      || Flaggen.FLAGGEN_EXTRA.find(f => f.a3 === a3) || { name: a3 };
    const aus = [];
    for (const p of Flaggen.fragbarePaare())
      for (const a3 of p.paar) {
        const l = nameVon(a3), gegen = nameVon(p.paar.find(x => x !== a3));
        aus.push({ id:`fp:${a3}:${p.paar.join('-')}`, a3, name:l.name,
          aliasse:l.aliasse, aussprache:l.aussprache, flagge:a3,
          gegen: gegen.name, gegenA3: p.paar.find(x => x !== a3), grund: p.grund });
      }
    return aus;
  }
  if (art==='flaggen') {
    const mitFlagge = (D.laender[kont] || []).filter(l => Flaggen.flaggeFragbar(l.a3));
    const tiefe = leiterTiefe(mitFlagge, stand, P.laenderTiefe, l => `fl:${l.a3}`);
    return mitFlagge.filter(l => voll || l.rang<=tiefe)
      .map(l=>({ id:`fl:${l.a3}`, a3:l.a3, name:l.name, aliasse:l.aliasse,
                 aussprache:l.aussprache, flagge:l.a3 }));
  }
  /* Die Verwechslungen (F3).
   *
   * EIN Gegenstand je Paar und Richtung: „Welche ist Rumaenien?" und
   * „Welche ist der Tschad?" sind zwei Aufgaben, nicht eine - wer die
   * eine kann, hat die andere noch nicht. Aus elf fragbaren Paaren
   * werden so 22 Gegenstaende.
   *
   * `fragbarePaare()` und nicht die ganze Liste: zwei Paare kann man
   * NICHT fragen, weil sie sich in dieser Darstellung um null Prozent
   * unterscheiden (Rumaenien/Tschad, Monaco/Indonesien). Sie werden im
   * Vorlauf gezeigt und erklaert, aber nie abgefragt - der Grund steht
   * bei `AEHNLICH`.
   *
   * Der Name kommt aus `LAENDER`, wo es einen gibt, und sonst aus
   * `FLAGGEN_EXTRA`: acht dieser Laender haben in dieser App keinen
   * Kartenumriss und stehen deshalb nur dort. */
  if (art==='rechnen')
    return kont==='reihen'     ? Rechnen.reihenVorrat()
         : kont==='gross'      ? Rechnen.grossVorrat()
         : kont==='verdoppeln' ? Rechnen.verdoppelnVorrat()
         : kont==='luecke'     ? Rechnen.lueckenVorrat()
         : kont==='prozent'    ? Rechnen.prozentVorrat()
         : kont==='zehner'     ? Rechnen.zehnerVorrat()
         : kont==='einheiten'  ? Rechnen.einheitenVorrat()
         : kont==='nachbar'    ? Rechnen.nachbarVorrat()
         : Rechnen.vorrat();
  // Sechsundzwanzig, gezaehlt und von Natur aus begrenzt - dieselbe Regel
  // wie beim Rechenvorrat (Backlog Paragraf 5.2).
  if (art==='schreiben')
    return kont==='diktat'  ? Schreiben.vorratDiktat()
         : kont==='ziffern' ? Schreiben.vorratZiffern()
         : kont==='zahlen'  ? Schreiben.vorratZahlen(Rechnen.gesprochen)
         :                    Schreiben.vorrat();
  // Fuenfundzwanzig, und sie stehen nicht hier: die zehn Farben und die 15
  // Zahlen leiten sich aus den amtlichen Listen ab (E3). Waechst der Vorrat
  // mit E4, aendert sich an dieser Zeile nichts.
  /* „Sag es" (E6) spielt DENSELBEN Vorrat - und bekommt trotzdem einen
     eigenen Leitner-Stand.
     
     Die Kennung wird deshalb umgehaengt (`sg:blue` statt `blue`). Ohne
     das teilten sich zwei Ebenen ein Fach: wer „blue" gehoert und
     gezeigt hat, haette es damit auch gesagt. Dieselbe Ueberlegung und
     dieselbe Bauart wie bei „Auf die Karte" (`fk:ITA`).
     
     Die ENGERE Bedingung zuerst - die allgemeine darunter schluckt sie
     sonst, und die Ebene bekaeme den Vorrat der Schwester samt ihren
     Kennungen. Das hat bei den Flaggen eine Runde gekostet. */
  if (art==='englisch' && kont==='sagen')
    return Englisch.vorratHoeren().map(x => ({ ...x, id:`sg:${x.id}` }));
  /* Die zwanzig Saetze (E9). Sie tragen ihre Kennung selbst mit (`en:chunk:…`)
     und brauchen deshalb kein Umhaengen wie „Sag es". */
  if (art==='englisch' && kont==='satz')
    return Englisch.vorratChunks();
  /* Die 24 Woerter zum Legen (E8). Eigene Kennung (`lg:`) und eigener
     Leitner-Stand, wie bei „Sag es" - und aus demselben Grund: gehoert
     ist nicht geschrieben. Der Vorrat filtert selbst, welche Woerter sich
     ueberhaupt aus Buchstabenkarten legen lassen. */
  if (art==='englisch' && kont==='legen')
    return Englisch.vorratLegen();
  /* Die zwanzig Saetze zum Zusammensetzen (E9c). Eigene Kennung (`bs:`)
     aus demselben Grund: gesagt ist nicht gebaut. */
  if (art==='englisch' && kont==='bauen')
    return Englisch.vorratBauen();
  /* Die Lautpaar-Gegenstaende (E5): jedes Paar in beiden Richtungen. Sie
     tragen ihre Kennung selbst mit (`lt:…`).
     WER NICHT LIEST, BEKOMMT NUR DIE GEMALTEN. Der Filter sitzt hier und
     nicht auf dem Bildschirm: eine Aufgabe, die erst beim Zeichnen
     merkt, dass sie kein Bild hat, koennte nur noch einen leeren Kasten
     zeigen - und der sieht aus wie eine Antwortmoeglichkeit. */
  if (art==='englisch' && kont==='laute')
    return Englisch.vorratLaute({ nurMalbar: !!P.vorlesen });
  /* Die gezeichneten Woerter (E7). Der Vorrat waechst mit den Bildern -
     heute sechzehn. Eigene Kennung (`ls:`), wie ueberall: gehoert ist
     nicht gelesen. */
  if (art==='englisch' && kont==='lesen')
    return Englisch.vorratLesen();
  if (art==='englisch')
    return Englisch.vorratHoeren();
  // Dreissig Fallen, aufgeschrieben und nicht erzeugt: eine Falle ist ein
  // Einzelstueck, es gibt keine Regel, aus der man sie rechnen koennte.
  if (art==='freunde')
    return Englisch.vorratFreunde();
  if (art==='verben')
    return Englisch.vorratVerben();
  if (art==='praeposition')
    return Englisch.vorratPraepositionen();
  if (art==='wendungen')
    return Englisch.vorratWendungen();
  if (art==='hoersatz')
    return Englisch.vorratHoersaetze();
  if (art==='hauptstaedte') {
    // Europa: dieselben Länder wie `laender:europa`, dieselbe Tiefe je
    // Profil - gefragt wird nur nach etwas anderem. `hauptstadt` und `ort`
    // stehen an den Ländern selbst (gebacken), `ablenker` und `falle`
    // kommen aus den Fakten.
    if (kont)
      // `voll` gilt hier genauso wie bei den Ländern: die Menge eines
      // Abzeichens darf nicht mit der Tiefe des Profils wackeln. Diese
      // Zeile hat `voll` bis D2b stillschweigend übergangen.
    {
      // Dieselbe Falle wie bei den Flaggen: gefragt wird nur, wer eine
      // gebackene Hauptstadt hat - also laeuft die Leiter auch nur ueber die.
      const mitStadt = D.laender[kont].filter(l => l.hauptstadt);
      const tiefe = leiterTiefe(mitStadt, stand, P.laenderTiefe, l => l.a3);
      return mitStadt.filter(l => voll || l.rang<=tiefe)
        .map(l=>({ id:l.a3, name:l.hauptstadt,
          aliasse:[], aussprache:[l.hauptstadt.toLowerCase()], pfad:l.pfad, anker:l.anker,
          ort:l.ort, gebiet:l.name, wovon:l.wovon, ablenker:l.ablenker||[], falle:l.falle }));
    }
    return D.deutschland.filter(b=>!b.stadtstaat).map(b=>({ id:b.id, name:b.hauptstadt,
      aliasse:[], aussprache:[b.hauptstadt.toLowerCase()], pfad:b.pfad, anker:b.anker,
      ort:b.ort, gebiet:b.name, ablenker:b.ablenker||[], falle:b.falle }));
  }
  return [];
}
/**
 * Was dieses Profil je zu sehen bekommt - oder `null` fuer „alles".
 *
 * Gebraucht von den Abzeichen (D2b): ein Abzeichen darf nichts verlangen,
 * was ein Profil nie zu Gesicht bekommt - das waere ein Ziel, das ewig
 * offen steht.
 *
 * SEIT DER LEITER (I2) IST DAS FUER ALLE DASSELBE, naemlich alles. Hier
 * stand vorher eine Menge, die an `P.laenderTiefe` haengt, und daneben
 * der Satz „Die Laendertiefe waechst nicht". Genau das stimmt nicht mehr:
 * sie ist der Anfang und nicht die Grenze, und wer die offenen Laender
 * kann, bekommt drei dazu, bis der Kontinent zu Ende ist.
 *
 * Die Zeile hier war damit die zweite Stelle, an der die alte Annahme
 * stand - und die stillste: sie haette Fiona die Abzeichen fuer Europa
 * dauerhaft vorenthalten, waehrend sie die Laender laengst gefragt
 * bekommt. Kein Tor haette es gemeldet; ein Abzeichen, das nicht
 * erscheint, sieht aus wie eins, das noch nicht verdient ist.
 */
function erreichbar(ebeneId){
  return null;
}
/* Die Fingergrenze und der Boden, den die App fuer eine noch brauchbare
   Trefferflaeche setzt - samt dem, was zuletzt WIRKLICH gemessen wurde.

   Sie stehen hier oben, ausserhalb des Aufgabenbildschirms, und das ist
   keine Stilfrage: der erste Anlauf legte `kreisPx` in denselben Scope
   wie die Aufgabe. Damit war die Karte bei JEDER Aufgabe wieder leer,
   `tippbar()` sagte immer ja, und „Wo liegt Guatemala?" wurde gestellt,
   obwohl Guatemala 11,9 Bildpunkte Trefferflaeche hat. Gruen war alles -
   gefunden hat es der Rauchtest, der die Frage mitgelesen hat.

   `kreisPx` haelt je Gebiet den Durchmesser seiner entkoppelten
   Trefferflaeche in Bildpunkten, so wie `trefferflaechen()` ihn zuletzt
   gerechnet hat. Kein Eintrag heisst: gross genug, es braucht keine. */
/* Mulberry32: der Würfel mit Saat.
 *
 * Stand zweimal im Spiel, und die eine Fassung sagte es sogar selbst -
 * „derselbe Mulberry32 wie bei den Hauptstädten". Das Tor `doppelt` hat
 * beide gefunden.
 *
 * Warum nicht `Math.random`: die Reihenfolge der Möglichkeiten muss aus dem
 * Keim der Sitzung folgen, sonst steht bei jedem Neuzeichnen etwas anderes
 * da. Und warum nicht ein einfacher Kongruenzgenerator: der legte die
 * richtige Antwort zehnmal hintereinander auf Platz 2 oder 3. Mulberry32
 * verwürfelt den Keim, bevor er zählt. Gefunden hat das der Rauchtest,
 * nicht das Auge.
 */
const rnd = (k)=>{ let x=k>>>0; return ()=>{
  x=(x+0x6D2B79F5)>>>0;
  let t=Math.imul(x^(x>>>15), 1|x);
  t=(t+Math.imul(t^(t>>>7), 61|t))^t;
  return ((t^(t>>>14))>>>0)/4294967296; }; };

const MIN_PT = 44, MIN_REST = 20;
const kreisPx = new Map();
/* Der Nadelplan - gerechnet, nicht bei jeder Aufgabe neu.
 *
 * Die Freiflaechensuche fragt `elementFromPoint`, und zwar bis zu
 * fuenfmal je Kandidat. Sie haengt aber nur an zwei Dingen: welche
 * Gebiete auf der Karte stehen und wie gross die Karte ist. Beides bleibt
 * ueber eine ganze Sitzung gleich - die Aufgabe wechselt, die Karte
 * nicht. Der Schluessel haelt genau das fest, der Plan steht in
 * WELTPUNKTEN und ueberlebt damit jedes Neuzeichnen. */
let nadelSchluessel = '', nadelPlan = [];
/* Kann man dieses Gebiet ueberhaupt antippen?

   `MIN_REST` ist der Boden, den die App selbst fuer eine noch brauchbare
   Trefferflaeche setzt. Wer darunter liegt, liegt dort nicht aus
   Nachlaessigkeit, sondern weil der Nachbar zu nah ist (siehe die Kappung
   in `trefferflaechen`) - und dann ist „Wo liegt Haiti?" keine
   Erdkundefrage mehr, sondern eine Fingeruebung.

   Seit den Nadeln ist das der ZWEITE Ausweg, nicht der erste: wer am Ort
   keine 20 Punkte bekommt, bekommt seine Flaeche NEBEN der Karte, volle
   44 Punkte, mit einem Faden zum Gebiet. `kreisPx` traegt dann die Nadel,
   nicht den gekappten Kreis - und die Frage kommt wieder. Nur wo auch
   dafuer kein Platz ist, bleibt es beim Verzicht. */
/* Die Notbremse aus P7 - und was aus ihr geworden ist.
 *
 * Sie sagt: nach einem Gebiet, das der Finger nicht treffen kann, wird
 * nicht umgekehrt gefragt. Seit P10 die Nadeln gebracht hat, gibt es
 * diesen Fall nicht mehr: gemessen ueber alle sechs Kartenebenen und zwei
 * Fenstergroessen sind es NULL Faelle, weil jedes zu kleine Gebiet eine
 * Nadel mit vollen 44 Punkten bekommt.
 *
 * Damit ist sie unerreichbar - und die Gegenprobe dazu konnte seit P10
 * nicht mehr anschlagen. Die Zusage steht jetzt im Tor `ziehen`: ein
 * Gebiet ohne Trefferstelle ist dort ein FEHLER, der Fall darf gar nicht
 * erst entstehen.
 *
 * Die Zeile bleibt trotzdem stehen. Sie kostet nichts, und sie ist die
 * richtige Antwort fuer den Tag, an dem eine siebte Karte doch einen Fall
 * hat, den keine Nadel rettet - dann meldet das Tor ihn, und bis er
 * repariert ist, stellt die App wenigstens keine unbeantwortbare Frage.
 * Was sie NICHT mehr ist: ein Beweis. Deshalb steht keine Gegenprobe mehr
 * daneben, die so tut. */
const tippbar = (id) => !kreisPx.has(id) || kreisPx.get(id) >= MIN_REST;

const NAMEN = {};
D.kontinente.forEach(k=>NAMEN[k.id]=k.name);
Object.values(D.laender).flat().forEach(l=>NAMEN[l.a3]=l.name);
D.deutschland.forEach(b=>NAMEN[b.id]=b.name);
/* Und die Paare aus „Was ist groesser?" (I22). Ohne diese Zeile stuende
   im Elternprotokoll `gr:europa:ESP-POL` - dieselbe Luecke, die die
   Rechenaufgaben zwei Absaetze weiter unten schon einmal hatten. */
for (const [k, paare] of Object.entries(D.paare || {}))
  for (const [g, kl] of paare) NAMEN[`gr:${k}:${g}-${kl}`] = `${NAMEN[g]} oder ${NAMEN[kl]}`;
// Auch die Rechenaufgaben: sonst steht im Elternprotokoll `p3+4` statt
// „3 + 4". Das Protokoll ist das eine, was Eltern wirklich lesen.
//
// Abgeleitet aus der EBENENLISTE, nicht aus einer Aufzaehlung der
// Vorraete daneben. Hier standen zwei Aufrufe, seit R4 gibt es drei
// Rechenebenen - die 158 Aufgaben der Eltern fehlten still, und im Protokoll
// stand fuer sie `g12*13` statt „12 × 13". Eine Liste neben einer Liste
// veraltet; diese kann es nicht mehr (Regel 6).
//
// `vorrat` haengt fuer Karten am Profil, fuer `art:'rechnen'` nicht -
// deshalb nur diese Ebenen. Die Gebietsnamen kommen drei Zeilen weiter
// oben aus den Daten selbst und decken damit schon jedes Profil ab.
for (const e of EBENEN.filter(e=>e.art==='rechnen'))
  for (const r of vorrat(e.id)) NAMEN[r.id]=r.frage;
// Und die Buchstaben: im Protokoll steht sonst `bu:A` statt „A".
for (const r of [...Schreiben.vorrat(), ...Schreiben.vorratDiktat(),
                 ...Schreiben.vorratZiffern(),
                 ...Schreiben.vorratZahlen(Rechnen.gesprochen)])
  NAMEN[r.id]=r.zeichen;

const standSchluessel = (ebeneId)=>`${P.id}:${ebeneId}`;
async function standLaden(ebeneId){
  try { Stand = (await Ablage.hole('fortschritt', standSchluessel(ebeneId))) || Leitner.neuerStand(); }
  catch(e){ Stand = Leitner.neuerStand(); }
}
async function standSichern(ebeneId){
  try { await Ablage.setze('fortschritt', standSchluessel(ebeneId), Stand); } catch(e){}
  gleichlaufBald();
}
/* Der Umzug nach Mittelamerika (A6).
 *
 * Neun Laender sind von `laender:nordamerika` auf die eigene Karte
 * gewandert. Ihr Leitner-Stand steht aber unter der ALTEN Ebene: wer
 * Kuba dreimal richtig hatte, faende es sonst als frisches Gebiet
 * wieder, und der Aufkleber im Forscherbuch waere weg. Fuer ein Kind
 * ist das kein Datenschema, das ist geloeschte Arbeit.
 *
 * Kopiert, nicht verschoben: die Eintraege bleiben auch unter
 * Nordamerika stehen. Sie stoeren dort nicht - `Leitner.fortschritt`
 * geht ueber den VORRAT der Ebene und sieht sie gar nicht -, und wer
 * eine Fassung zurueckrollt, hat seinen Stand noch.
 *
 * Laeuft genau einmal je Kind: sobald unter der neuen Kennung etwas
 * steht, ist nichts mehr zu tun. */
async function umzugMittelamerika(){
  const neu = `${P.id}:laender:mittelamerika`;
  try {
    if (await Ablage.hole('fortschritt', neu)) return;
    const alt = await Ablage.hole('fortschritt', `${P.id}:laender:nordamerika`);
    if (!alt) return;
    const ids = (D.laender.mittelamerika || []).map(l => l.a3);
    const mit = Object.fromEntries(ids.filter(id => alt[id]).map(id => [id, alt[id]]));
    if (Object.keys(mit).length) await Ablage.setze('fortschritt', neu, mit);
  } catch(e){}
}
async function einstLaden(){
  try { Einst = { ...Einst, ...(await Ablage.hole('einstellungen','alles') || {}) }; } catch(e){}
  tonAn = Einst.ton;
  stimmenWunsch = Einst.stimme || null; stimmeSuchen();
  document.documentElement.setAttribute('data-abend', Einst.abend ? 'an' : 'aus');
}
async function einstSichern(){ try{ await Ablage.setze('einstellungen','alles',Einst); }catch(e){} }

/* ---------- Gleichlauf: dieselben Aufkleber auf allen Geraeten (Q29) ----
 *
 * Alles Rechnen steht in `src/kern/gleichlauf.js` und ist dort ohne
 * Browser zu pruefen. Hier steht nur, WANN es laeuft und WO die Ablage
 * ist - das ist die eine Aufgabe, die das Spiel behalten muss.
 *
 * Drei Zusagen, und sie sind hier eingebaut, nicht versprochen:
 *
 *  1. OHNE Familienschluessel passiert gar nichts. Kein Aufruf, kein
 *     Netz, kein Byte. Die App laeuft exakt wie vor dieser Runde, und das
 *     ist die Voreinstellung.
 *  2. Fehler sind still. Kein Netz heisst „spaeter nochmal" - im Spiel
 *     ist davon nichts zu sehen, nur im Elternbereich steht, wann es
 *     zuletzt geklappt hat.
 *  3. Es wird nie GEWARTET. Der Gleichlauf laeuft neben dem Spiel her;
 *     kein Bildschirm haengt an ihm.
 */
const GLEICHLAUF_ADRESSE = (BAU.gleichlauf || '');
/* Vier Sekunden nach der letzten Aenderung, nicht bei jeder.
 *
 * Eine Runde erzeugt bis zu sechzehn Sicherungen. Ohne die Sammelfrist
 * waeren das sechzehn Aufrufe fuer einen Stand, der sich am Ende einmal
 * unterscheidet - und auf einem Telefon im Zug sechzehn Fehlschlaege. */
const GLEICHLAUF_FRIST = 4000;
let gleichlaufUhr = null, gleichlaufLaeuft = false;
let gleichlaufStand = { zuletzt: 0, fehler: null, gesendet: 0 };

const gleichlaufAn = () => !!(GLEICHLAUF_ADRESSE && Einst.familienschluessel);

/* Aussperren geht nicht durch Loesen (Audit B).
 *
 * „Dieses Geraet loesen" loest NUR das Geraet, auf dem man es tippt - wer
 * den Familienschluessel hat, hat ihn. Wer wirklich aussperren will, legt
 * einen NEUEN Schluessel an und traegt ihn auf den uebrigen Geraeten nach;
 * der alte Raum verfaellt dann von selbst nach 180 Tagen (die Frist steht
 * im Dienst, siehe dienst/gleichlauf-worker.js). Genau dieser Satz steht
 * seit Q32 auch im Elternbereich - ohne ihn kaeme niemand darauf. */

/** Alles, was reist, aus der Ablage holen. */
async function gleichlaufSammeln(){
  const aus = { fassung: 1, fortschritt: {}, einstellungen: {} };
  try {
    const d = await Ablage.alleMitSchluessel('fortschritt');
    for (const [k, w] of d) aus.fortschritt[k] = w;
    const e = await Ablage.alleMitSchluessel('einstellungen');
    for (const [k, w] of e) if (Gleichlauf.REIST(k)) aus.einstellungen[k] = w;
    /* Das Protokoll reist mit, aber nur so weit das Budget reicht (Q30).
       Beschnitten wird schon HIER und nicht erst beim Zusammenfuehren:
       sonst baut ein Geraet mit zwei Jahren Geschichte erst einen
       Umschlag von zwei Megabyte und wirft ihn dann weg. */
    const pr = {};
    for (const [k, w] of await Ablage.alleMitSchluessel('protokoll')) pr[k] = w;
    aus.protokoll = Gleichlauf.protokollVereinen({}, pr);
  } catch(e){}
  return aus;
}

/** Was zurueckkommt, wieder ablegen - und nur, was sich geaendert hat. */
async function gleichlaufAblegen(vereint, vorher){
  let geaendert = 0;
  for (const [k, w] of Object.entries(vereint.fortschritt || {})) {
    if (JSON.stringify(w) === JSON.stringify((vorher.fortschritt || {})[k])) continue;
    try { await Ablage.setze('fortschritt', k, w); geaendert++; } catch(e){}
  }
  for (const [k, w] of Object.entries(vereint.einstellungen || {})) {
    if (JSON.stringify(w) === JSON.stringify((vorher.einstellungen || {})[k])) continue;
    try { await Ablage.setze('einstellungen', k, w); geaendert++; } catch(e){}
  }
  /* Beim Protokoll wird nur ANGEHAENGT, nie verglichen: ein Eintrag
     aendert sich nie, und was schon dasteht, muss nicht neu geschrieben
     werden. Der Vergleich waere hier auch teuer - es koennen tausend
     sein. */
  for (const [k, w] of Object.entries(vereint.protokoll || {})) {
    if ((vorher.protokoll || {})[k] !== undefined) continue;
    try { await Ablage.setze('protokoll', k, w); geaendert++; } catch(e){}
  }
  return geaendert;
}

/**
 * Eine Runde Gleichlauf. Gibt zurueck, was danach zu sagen ist.
 *
 * `gleichlaufLaeuft` ist kein Schmuck: der Start ruft ihn, das Ende einer
 * Runde ruft ihn, und der Elternbereich hat einen Knopf. Zwei Laeufe
 * gleichzeitig wuerden sich gegenseitig die Fassung wegnehmen und beide
 * im Streitfall landen.
 */
async function gleichlaufFahren(){
  if (!gleichlaufAn() || gleichlaufLaeuft) return gleichlaufStand;
  gleichlaufLaeuft = true;
  try {
    const meiner = await gleichlaufSammeln();
    const r = await Gleichlauf.runde(GLEICHLAUF_ADRESSE, Einst.familienschluessel, meiner);
    if (r.fehler) { gleichlaufStand = { ...gleichlaufStand, fehler: r.fehler }; return gleichlaufStand; }
    const geaendert = await gleichlaufAblegen(r.stand, meiner);
    gleichlaufStand = { zuletzt: Date.now(), fehler: null, gesendet: geaendert };
    /* Was aus dem Netz kam, gilt ab sofort - auch fuer die Ebene, die
       gerade offen ist. Ohne diese Zeile schriebe die naechste Antwort
       den alten Stand zurueck und machte den Gleichlauf rueckgaengig. */
    if (geaendert && Sitzung && Sitzung.ebeneId) await standLaden(Sitzung.ebeneId);
  } catch(e) {
    gleichlaufStand = { ...gleichlaufStand, fehler: 'unerwartet: ' + (e && e.message) };
  } finally { gleichlaufLaeuft = false; }
  return gleichlaufStand;
}

/** Nach einer Aenderung: bald, aber nicht sofort. */
function gleichlaufBald(){
  if (!gleichlaufAn()) return;
  clearTimeout(gleichlaufUhr);
  gleichlaufUhr = setTimeout(() => { gleichlaufFahren(); }, GLEICHLAUF_FRIST);
}

/* ---------- Bildschirmwechsel ------------------------------------------- */
/* Ein Bildschirm, der auf Daten wartet, sagt das - aber erst nach einem
 * Augenblick.
 *
 * Gemessen auf 3G und OHNE Lager (also beim allerersten Besuch, bevor der
 * Service Worker die Ebenendaten hat): das Forscherbuch braucht 3,0 s bei
 * einer nachzuladenden Ebene und 7,5 s bei fuenf. So lange stand der ALTE
 * Bildschirm da - ein Kind tippt auf „Forscherbuch", und sieben Sekunden
 * lang passiert nichts. Mit Lager sind es 0,66 s, und die Drossel aendert
 * daran nichts: der Service Worker legt alle Ebenendaten ins Lager.
 *
 * Ein Wartezeichen, das SOFORT kaeme, blitzte im Normalfall nur auf und
 * machte die App unruhig. Deshalb erst nach `WARTEZEICHEN_AB`; darunter
 * merkt niemand etwas.
 *
 * Die Entscheidung faellt HIER und nicht an den Aufrufstellen: jeder
 * Bildschirm, der je auf etwas wartet, ist damit versorgt - auch der
 * naechste, an den heute niemand denkt.
 */
const WARTEZEICHEN_AB = 300;
const wartezeichen = () => {
  const w = el('div', 'schirm warten');
  // Drei Punkte, kein Wort: Fiona liest nicht. Die Ansage sagt es ihr.
  w.innerHTML = `<div class="mitte"><div class="punkte" role="status"
    aria-label="Wird geladen"><i></i><i></i><i></i></div></div>`;
  return w;
};
/* Wer zuletzt GERUFEN wurde, gewinnt - nicht, wer zuerst fertig ist.
 *
 * Zwei Aufrufe koennen sich ueberholen: `bau()` ist asynchron, und der
 * langsamere raeumt beim Fertigwerden ALLE bisherigen Bildschirme weg -
 * auch den, den der schnellere danach schon hingestellt hat. Uebrig
 * bleibt der Bildschirm, den niemand zuletzt wollte.
 *
 * Gefunden mit `SMARTKIDS_DROSSEL=12` (zwoelffach gedrosselte Seite): auf
 * „Zurueck" folgte sofort „Eltern", die PIN-Tastatur stand da, und im
 * naechsten Augenblick war sie weg - der Weltenwahl-Bau war spaeter
 * fertig geworden und hat sie mitgenommen. Auf einem schnellen Geraet
 * faellt es nicht auf; auf einem langsamen Telefon ist es genau der
 * Doppeltipp, den ein Kind macht, wenn nichts passiert.
 *
 * Eine Nummer je Aufruf genuegt. Der Bau eines ueberholten Aufrufs wird
 * still verworfen - sein Bildschirm kommt gar nicht erst an die Buehne. */
let zeigeLauf = 0;
/* ---------- Der Grund der Welt (N7) --------------------------------------
 *
 * Befund G1 aus dem Grafik-Audit: alles steht auf Weiss. Es gibt keinen
 * Ort, keine Atmosphaere, keinen Unterschied zwischen „ich bin in der
 * Erdkunde" und „ich rechne". Weiss ist die Farbe von Papier, nicht von
 * Spielen.
 *
 * DIE MASCHINE STAND SCHON DA und war nur abgeschaltet: `body` hat seit
 * langem einen Verlauf von `--grund` nach `--grund-2`, und beide standen
 * im Hellmodus auf reinem Weiss. Es fehlte nicht die Technik, es fehlte
 * die Farbe.
 *
 * GESETZT WIRD SIE AM WURZELELEMENT, genau wie der Abendmodus, und aus
 * derselben Ueberlegung wie beim Menue-Balken: kein Schalter, den man an
 * jedem Bildschirm umlegen muss, sondern eine ABLEITUNG an der einen
 * Stelle, durch die jeder Bildschirmwechsel laeuft. Wer die Welt
 * verlaesst, verliert den Grund von selbst - es gibt keinen Ort, an dem
 * man das vergessen kann.
 *
 * DIE ZAHL IST DIE FLAECHENFARBE DER WELT (`farbe: 5` bei Erdkunde), also
 * genau der Ton, den ihre Kachel schon traegt. Ein zweiter Farbwert
 * daneben waere eine zweite Wahrheit ueber dieselbe Welt.
 */
/* VOR der Weltenwahl gibt es keine Welt - auch dann nicht, wenn `Welt`
   noch den Wert von vorhin traegt. Der erste Anlauf hat das uebersehen:
   die Weltenwahl stand in Erdkunde-Blau da, weil `Welt` ab Werk auf der
   ersten Welt steht. Ein Ort, den man noch nicht betreten hat, darf keine
   Farbe haben - sonst sagt der Grund etwas Falsches, und das ist
   schlimmer, als wenn er nichts sagt.

   Die Liste steht hier und nicht als Merkmal an jedem Bildschirm: es sind
   die vier Bildschirme, die UEBER den Welten liegen, und die aendern sich
   seltener als die Welten darunter. */
const OHNE_GRUND = new Set(['profilwahl', 'weltenwahl', 'forscherbuch', 'elternTor']);

function grundSetzen(bau){
  const w = WELTEN.find(x => x.id === Welt);
  const d = document.documentElement;
  if (w && !OHNE_GRUND.has(bau && bau.name)) d.setAttribute('data-welt', String(w.farbe));
  else d.removeAttribute('data-welt');
}

function zeige(bau){
  const meins = ++zeigeLauf;
  const fertig = Promise.resolve(bau());
  /* Das Wartezeichen ist selbst ein `.schirm` - damit raeumt der Code
     unten es weg wie jeden anderen, und es kann nicht haengenbleiben. */
  let uhr = setTimeout(()=>{
    uhr = null;
    if (meins !== zeigeLauf) return;
    const w = wartezeichen();
    buehne.appendChild(w);
    requestAnimationFrame(()=>w.classList.add('da'));
  }, WARTEZEICHEN_AB);
  fertig.then(neu=>{
    if (uhr) clearTimeout(uhr);
    if (meins !== zeigeLauf) return;
    // ALLE bisherigen Bildschirme, nicht nur den sichtbaren. Wird zeige()
    // zweimal kurz hintereinander gerufen, bleibt sonst einer haengen -
    // im Elternbereich schimmerten drei Bildschirme uebereinander.
    const alte = [...buehne.querySelectorAll('.schirm')];
    /* DER GRUND, an der einen Stelle, durch die jeder Bildschirmwechsel
       laeuft. Vor dem Einhaengen, damit der neue Bildschirm nicht kurz
       auf dem alten Grund steht. */
    grundSetzen(bau);
    neu.classList.add('schirm'); buehne.appendChild(neu);
    requestAnimationFrame(()=>{
      neu.classList.add('da');
      alte.forEach(a=>{ a.classList.remove('da'); setTimeout(()=>a.remove(),340); });
    });
  });
}

/* Die Zeile unter dem Namen — ABGELEITET, nicht geraten.
 *
 * Hier stand `${p.alter} Jahre · ${p.eingabe.includes('sprechen') ? 'sprechen
 * und ziehen' : 'tippen und ziehen'}`. Zwei Annahmen in einer Zeile, und
 * beide brachen, sowie ein drittes Profil dazukam: Eltern hat kein Alter
 * („null Jahre") und zieht nicht („tippen und ziehen").
 *
 * Eine Verzweigung mit zwei Aesten beschreibt zwei Profile. Sie ist keine
 * Regel, sondern eine Aufzaehlung mit anderen Mitteln.
 */
/* Die Zeile unter dem Namen: Alter und wie geantwortet wird.
 *
 * `sprechen` steht nur da, wenn der Sprachmodus WIRKLICH an ist. Es ist
 * eine Option hinter einem Schalter im Elternbereich; wer sie hier immer
 * lesen wuerde, bekaeme ein Versprechen, das der Bildschirm nicht haelt -
 * und Fiona sah bis A4 genau das.
 *
 * Und `aufzaehlen` statt `join(' und ')`: seit alle Profile sprechen
 * duerfen, stand dort „ziehen und tippen und sprechen". Das ist kein
 * Deutsch, und es hat die Kachel so breit gemacht, dass Violeta 15 Punkte
 * in den Bereich des Telefons rutschte - gefunden von `passt` auf der
 * Groesse mit Leiste, im selben Lauf, in dem das Sprechen dazukam. */
/* Was auf der Profilkachel steht - und was NICHT.
 *
 * „sprechen" stand hier seit A4 mit dabei, sobald der Sprachmodus an war.
 * Seit er ab Werk an ist (M4s), steht es auf ALLEN vier Kacheln - und
 * sagt damit nichts mehr aus, was die Kacheln unterschiede. Bezahlt hat
 * es die Breite: „tippen oder sprechen" schob Violetas Kachel sieben
 * Punkte in den Bereich des Telefons, gemessen von `passt` auf der Groesse
 * mit Browserleiste. Dieselbe Stelle wie in A4, dieselbe Ursache.
 *
 * Die Kachel sagt jetzt, wie das Kind ANTWORTET. Dass es dabei sprechen
 * darf, gilt ueberall und steht am Mikrofon selbst. */
const profilzeile = (p) => [
  p.alter ? `${p.alter} Jahre` : null,
  aufzaehlen(p.eingabe.filter(x => x !== 'sprechen')),
].filter(Boolean).join(' · ');

/* ---------- Profilwahl --------------------------------------------------- */
/* „Heute schon geübt" (A4h).
 *
 * EINE Marke je Kind mit dem Tag darin - kein Zaehler, keine Kette, kein
 * „drei Tage hintereinander". Der ANTON-Abgleich nennt den Punkt
 * ausdruecklich MIT dem Zusatz „kein Streak-Zwang", und der Grund steht
 * in `src/inhalt/abzeichen.js`: ein Abzeichen fuer zehn Tage am Stueck
 * bestraft einen Krankheitstag. Was hier steht, ist eine ruhige Zeile
 * ueber HEUTE - sie kann morgen wieder da sein, und sie kann fehlen,
 * ohne dass etwas verloren geht.
 *
 * Warum eine Marke und nicht das Protokoll: die Profilwahl ist der erste
 * Bildschirm. Alle Eintraege zu lesen, um vier Ja/Nein-Fragen zu
 * beantworten, hiesse bei einem Jahr Spielzeit fuenftausend Datensaetze
 * fuer vier Zeilen. Die Marke ist ein String je Kind.
 *
 * Der Tag ist ORTSZEIT und als `YYYY-MM-DD` abgelegt. Nicht als
 * Zeitstempel: „heute" ist eine Frage an den Kalender des Kindes, nicht
 * an die Uhr - wer um 23:50 anfaengt und um 00:10 aufhoert, hat an zwei
 * Tagen geuebt, und das ist richtig so. */
const heute = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-`
       + `${String(d.getDate()).padStart(2,'0')}`;
};
/* DIESE MARKE IST ABGELOEST (N2). Die Zeile „heute schon geuebt" ist dem
 * Tagesziel gewichen: es sagt dasselbe und mehr, und Fiona kann es lesen -
 * drei Sterne, von denen zwei leuchten, sind eine Auskunft, ein Satz ist
 * fuer sie ein Muster. Was oben ueber „kein Streak-Zwang" steht, gilt
 * unveraendert weiter und ist der Grund, warum das Tagesziel jeden Tag bei
 * null anfaengt: es kann fehlen, ohne dass etwas verloren geht.
 *
 * Der Schluessel `geuebt:` wird nicht mehr geschrieben und nicht mehr
 * gelesen. Alte Eintraege bleiben liegen und stoeren nicht - ein
 * Aufraeumlauf ueber die Ablage waere mehr Risiko als Gewinn. */

/* ---------- Das Tagesziel (N2) -------------------------------------------
 *
 * Befund S5 aus dem Spiel-Audit: es gibt kein Morgen. Wer gestern alles
 * richtig hatte, hat heute dieselbe Ausgangslage wie jemand, der nie
 * gespielt hat - und damit keinen Grund, die App noch einmal zu oeffnen.
 *
 * DREI STERNE JE TAG, je Kind. Eine abgeschlossene Uebung fuellt einen.
 * Warum drei und nicht fuenf: eine Uebung sind vier bis acht Fragen, drei
 * davon sind zehn bis fuenfzehn Minuten. Das ist fuer eine Sechsjaehrige
 * ein Tagespensum und kein Programm - und ein Ziel, das man NICHT
 * erreichen kann, ist schlimmer als keins.
 *
 * WARUM EIN EIGENER SCHLUESSEL und nicht `geuebt:` weitergenutzt: dort
 * stand ein blosses Datum, und der Vergleich darauf lief an zwei Stellen.
 * Den Wert zu einem Objekt zu machen haette beide still gebrochen. Der
 * alte Schluessel ist inzwischen ganz abgeloest - die Zeile „heute schon
 * geuebt", die er trug, ist dem Tagesziel gewichen.
 */
const TAGESZIEL = 3;
const TAGESKEY = (id) => `tagesziel:${id}`;
let tagesStand = {};

/* NUR KINDER, und das steht an EINER Stelle. Die Eltern tippen hier
   gelegentlich etwas nach - ein Tagespensum waere fuer sie eine
   Aufforderung, die niemand gestellt hat, und drei leere Sterne unter
   „Stephan" sehen aus wie eine Mahnung. Gefragt wird nach `alter`, weil
   das der Unterschied IST; ein zweites Merkmal „istKind" waere eine
   Wahrheit, die man vergessen kann nachzutragen. */
const istKind = (p) => !!(p && p.alter);

/** Wieviele Sterne hat dieses Kind HEUTE - gestrige zaehlen nicht. */
function tagesSterne(id){
  const e = tagesStand[TAGESKEY(id)];
  return (e && e.tag === heute()) ? Math.min(e.zahl || 0, TAGESZIEL) : 0;
}

/** Drei Sterne als Zeichen - gefuellt, was heute geschafft ist.
 *
 * KEIN TEXT, und das ist der Punkt: Fiona liest nicht. „2 von 3" waere
 * fuer sie ein Muster; drei Sterne, von denen zwei leuchten, sind eine
 * Auskunft. */
const tagesZeichen = (id) => {
  const n = tagesSterne(id);
  return `<div class="tagesziel${n >= TAGESZIEL ? ' voll' : ''}" aria-label="${
    n} von ${TAGESZIEL} Tagessternen">${
    Array.from({ length: TAGESZIEL }, (_, i) =>
      STERN(i < n ? 'var(--stern-an)' : 'var(--stern-aus)', 16)).join('')}</div>`;
};

/* DAS HAUS (N6) — was ALLE Kinder heute zusammen geschafft haben.
 *
 * Das Tagesziel steht auf jeder Kachel und gilt fuer ein Kind. Daneben
 * fehlte das, was zwei Geschwister zu einer Sache macht: eine Zahl, an
 * der beide arbeiten. Wer als Zweite kommt, sieht dann nicht nur ihre
 * eigenen drei Sterne, sondern auch, dass die andere schon da war.
 *
 * KEIN Wettbewerb und keine Rangliste. Gezaehlt wird die SUMME, nicht
 * der Vorsprung: „vier von sechs im Haus" sagt, dass noch etwas fehlt,
 * und nicht, wer weiter ist. Eine Rangliste zwischen einer Sechs- und
 * einer Achtjaehrigen haette immer dieselbe Siegerin.
 *
 * DIE ZAHL WIRD ABGELEITET, nicht geschrieben. Der Nachtplan nannte
 * acht Sterne - das ist bei drei je Kind und zwei Kindern nicht zu
 * erreichen, und ein Ziel, das niemand erreichen kann, ist schlimmer als
 * keines. `TAGESZIEL` mal Anzahl der Kinder ist heute sechs und morgen
 * neun, wenn ein drittes Kind dazukommt - ohne dass jemand daran denken
 * muss (Regel 6). */
const hausKinder = () => Object.values(PROFILE).filter(istKind);
const hausZiel = () => TAGESZIEL * hausKinder().length;
const hausSterne = () => hausKinder().reduce((n, p) => n + tagesSterne(p.id), 0);

/** Das Haus als Zeichenreihe - und ein Wort, wenn es voll ist.
 *
 * Die Sterne sind fuer Fiona, das Wort fuer Lea. Ohne Wort waere „voll"
 * nur ein Farbwechsel; ohne Sterne waere es nur ein Satz. */
const hausZeichen = () => {
  const ziel = hausZiel(); if (!ziel) return '';
  const n = hausSterne(), voll = n >= ziel;
  return `<div class="haus${voll ? ' voll' : ''}" data-haus="${n}/${ziel}"
       aria-label="${n} von ${ziel} Sternen im Haus">${
    Array.from({ length: ziel }, (_, i) =>
      STERN(i < n ? 'var(--stern-an)' : 'var(--stern-aus)', 14)).join('')
    }${voll ? '<span>Das Haus ist voll!</span>' : ''}</div>`;
};

/** Eine Uebung ist zu Ende: ein Stern mehr - hoechstens bis zum Ziel.
 *
 * Gibt zurueck, ob DIESER Schritt das Ziel voll gemacht hat. Der
 * Endbildschirm braucht das, und er soll es nicht selbst ausrechnen
 * muessen: zwei Stellen, die dieselbe Schwelle pruefen, sind zwei
 * Schwellen, sobald eine davon einmal angefasst wird. */
async function tagesSchritt(){
  if (!istKind(P)) return false;
  const k = TAGESKEY(P.id), t = heute();
  const alt = tagesStand[k];
  const vorher = (alt && alt.tag === t) ? (alt.zahl || 0) : 0;
  if (vorher >= TAGESZIEL) return false;
  const jetzt = vorher + 1;
  tagesStand[k] = { tag: t, zahl: jetzt };
  try { await Ablage.setze('einstellungen', k, tagesStand[k]); } catch(e){}
  return jetzt === TAGESZIEL;
}

async function geuebtLaden(){
  tagesStand = {};
  try {
    for (const [k, w] of await Ablage.alleMitSchluessel('einstellungen'))
      if (String(k).startsWith('tagesziel:')) tagesStand[k] = w;
  } catch(e){}
}

function profilwahl(){
  const s = el('div');
  s.innerHTML = kopf({ mitte:'<span class="marke">Smart Kids</span>', rechts:
      zeichenKnopf('ton', tonAn?'tonAn':'tonAus', tonAn?'Ton ausschalten':'Ton einschalten')
    + zeichenKnopf('abend', Einst.abend?'abend':'tag', Einst.abend?'Heller machen':'Dunkler machen') }) + `
    <div class="mitte">
      ${/* Das Haus steht NEBEN der Frage, nicht darunter.
           Gemessen: als eigene Zeile kostet es 28 Punkte, und auf dem
           kleinsten Geraet (iPhone SE quer, 667 x 375) faellt „Violeta"
           damit unter den Rand - genau die Falle, in die schon das
           Tagesziel gelaufen ist. In der Titelzeile kostet es nichts:
           die Zeile ist ohnehin so hoch wie die Ueberschrift, und quer
           ist daneben Platz. */''}
      <div class="titelzeile">
        <div class="titel">Wer spielt?</div>
        ${hausZeichen()}
      </div>
      <div class="wahl">${Object.values(PROFILE).map(p=>`
        <button class="kachel wer" data-profil="${p.id}" style="--ton:var(${p.farbe})">
          ${streu(p.id)}
          <div class="kreis" style="background:var(${p.farbe})">${p.name[0]}</div>
          <div class="name">${p.name}</div>
          <div class="rolle">${profilzeile(p)}</div>
          ${/* DAS TAGESZIEL ERSETZT DEN SATZ „heute schon geuebt" - es sagt
               dasselbe und mehr, und Fiona kann es lesen. Beides
               untereinander hat die Kachel so hoch gemacht, dass auf dem
               kleinsten Geraet (iPhone SE quer, 667 x 375) „Violeta"
               18 Punkte ueber den Rand lief und die Wand von acht
               Kacheln auf vier fiel. Das Tor hat es gemeldet.

               Es steht auf JEDER Kinderkachel, auch bei null: ein Ziel,
               das erst erscheint, wenn man es angefangen hat, laedt
               niemanden ein, es anzufangen. */
            istKind(p) ? tagesZeichen(p.id) : ''}
        </button>`).join('')}</div>
    </div>`;
  s.querySelector('#ton').onclick=(e)=>{ tonAn=!tonAn; Einst.ton=tonAn; einstSichern();
    e.target.textContent=tonAn?'Ton an':'Ton aus'; };
  s.querySelector('#abend').onclick=(e)=>{ Einst.abend=!Einst.abend; einstSichern();
    document.documentElement.setAttribute('data-abend',Einst.abend?'an':'aus');
    e.target.textContent=Einst.abend?'Abend':'Tag'; };
  s.querySelectorAll('[data-profil]').forEach(b=>b.onclick=async ()=>{
    P=PROFILE[b.dataset.profil]; Ablage.setze('profile',P.id,{ id:P.id, zuletzt:Date.now() }).catch(()=>{});
    sagen(P.name);
    // Erst umziehen, dann zeigen: die Weltenwahl summiert den Stand schon.
    await umzugMittelamerika();
    // Und die Tiere holen, BEVOR gespielt wird: der Endbildschirm
    // entscheidet synchron und haette sonst eine leere Sammlung vor sich.
    await tiereLaden();
    zeige(weltenwahl); });
  // Hier ist noch kein Kind gewaehlt - also wird immer angesagt. Wer lesen
  // kann, hoert einen Satz zuviel; wer nicht liest, kaeme sonst nicht los.
  ansagen(`Wer möchte spielen? ${aufzaehlen(Object.values(PROFILE).map(x=>x.name))}?`);
  /* Und das Haus wird GESAGT, nicht nur gezeigt - wer nicht liest,
     bekommt es sonst nur als Farbe mit. Nur wenn es voll ist: ein
     „vier von sechs" bei jedem Start waere eine Mahnung. */
  if (hausZiel() && hausSterne() >= hausZiel())
    ansagen('Das Haus ist voll! Ihr habt heute alle Sterne zusammen.');
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
    aus.push({ ...e, ...Leitner.fortschritt(vorrat(e.id, st), st),
               pokal: await pokalStand(e.id) });
  }
  return aus;
}

/* ---------- Abzeichen (D2) ----------------------------------------------
 *
 * Die Regeln stehen in `src/inhalt/abzeichen.js`, samt Referenzabgleich.
 * Hier steht nur, wie sie AUSSEHEN und wo sie hingehoeren.
 *
 * Die Bildsprache ist die, die G12 aufgemacht hat: gefuellte Formen OHNE
 * Kontur sind Tapete (der Streu auf der Profilkachel), Formen MIT
 * Tintenkontur bedeuten etwas (Stern, Pokal). Ein Abzeichen bedeutet
 * etwas - also Kontur.
 */
const ABZEICHENBILD = {
  welt: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/>'
      + '<path d="M3.4 9h17.2M3.4 15h17.2" fill="none"/>',
  stadt: '<path d="M3 20V9l4-2.5V20zM9.5 20V4l5-2v18zM17 20V10l4 2.5V20z"/>'
       + '<path d="M2 20.5h20" fill="none" stroke-linecap="round"/>',
  karte: '<path d="M2.6 5.8 9 3.4v14.8l-6.4 2.4zM9 3.4l6 2.4v14.8l-6-2.4zM15 5.8l6.4-2.4v14.8L15 20.6z"/>',
  nachbarn: '<circle cx="12" cy="12" r="4"/>'
          + '<circle cx="12" cy="3.4" r="1.9"/><circle cx="12" cy="20.6" r="1.9"/>'
          + '<circle cx="3.4" cy="12" r="1.9"/><circle cx="20.6" cy="12" r="1.9"/>'
          + '<circle cx="5.9" cy="5.9" r="1.6"/><circle cx="18.1" cy="5.9" r="1.6"/>'
          + '<circle cx="5.9" cy="18.1" r="1.6"/><circle cx="18.1" cy="18.1" r="1.6"/>',
  reihe: '<rect x="3" y="3" width="18" height="18" rx="4.5"/>'
       + '<path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8" fill="none" stroke-linecap="round"/>',
  doppelt: '<circle cx="8" cy="12" r="5.4"/><circle cx="16" cy="12" r="5.4"/>',
  schild: '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>'
        + '<path d="M6.6 15.6h10.8M9 4v3.2h6V4" fill="none" stroke-linecap="round"/>',
  abc: '<path d="M12 3 4.6 20.4h4.2l1.3-3.4h3.8l1.3 3.4h4.2z"/>'
     + '<path d="M10.9 13.4h2.2" fill="none" stroke-linecap="round"/>',
  /* Krone fuer die Landeshauptstaedte, Kachel mit Strich fuer Minus,
     Kachel mit O fuer die Vokale. Alle drei in der Formensprache, die
     schon da ist: `reihe` ist dieselbe Kachel mit einem Kreuz. In D2
     haben drei Motive den Blick nicht bestanden (Schildkroete als
     Karomuster, Muschel als Heissluftballon) - deshalb hier nichts
     Gegenstaendliches, wo ein Zeichen genuegt. */
  krone: '<path d="M3.5 17.5 2 6.5l5 4L12 3l5 7.5 5-4-1.5 11z"/>'
       + '<path d="M3.9 20.6h16.2" fill="none" stroke-linecap="round"/>',
  minus: '<rect x="3" y="3" width="18" height="18" rx="4.5"/>'
       + '<path d="M7.6 12h8.8" fill="none" stroke-linecap="round"/>',
  /* Freistehend, nicht auf einer Kachel: `minus` ist schon eine Kachel
     mit einem Strich, und zwei Kacheln mit einem Zeichen darin sind bei
     28 Punkten (kurzes Querformat) kaum auseinanderzuhalten. Neben `abc`,
     dem A, liest sich das freistehende O als Buchstabe. */
  vokal: '<ellipse cx="12" cy="12" rx="6.8" ry="8.6"/>'
       + '<ellipse cx="12" cy="12" rx="2.9" ry="4.3" fill="none"/>',
  /* Die Sprechblase der Satzebene (E9b). Sie ist im Spiel schon die
     Kachel von „Sag den Satz" (`BLASENSTRICH`) - hier dieselbe Form in
     der Abzeichensprache: gefuellt mit Kontur, die Zeilen darin ohne
     Fuellung. `schild` ist ebenfalls ein Rechteck mit Strichen, aber
     ohne Schwanz; bei 34 Punkten ist der Schwanz der Unterschied, den
     man sieht. */
  blase: '<path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-5 4v-4h-.5A2.5 2.5 0 0 1 3 13.5z"/>'
       + '<path d="M7 7.4h10M7 11h6" fill="none" stroke-linecap="round"/>',
  medaille: '<path d="M8.2 2.6 12 9.4 15.8 2.6" fill="none" stroke-linecap="round"/>'
          + '<circle cx="12" cy="15.4" r="6.2"/>'
          + '<path d="M9.4 15.6l1.9 1.9 3.4-3.9" fill="none" stroke-linecap="round"/>',
};
/** Ein Abzeichenbild. `voll` faerbt es golden, sonst bleibt es blass. */
const ABZ = (n, voll, g=34)=>`<svg width="${g}" height="${g}" viewBox="0 0 24 24"
  fill="var(${voll?'--stern-an':'--stern-aus'})" stroke="var(${voll?'--tinte':'--tinte-3'})"
  stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${ABZEICHENBILD[n]||''}</svg>`;

/* „Einmal ganz ohne Fehler" ist kein Mengenabzeichen, sondern ein
 * EREIGNIS - es laesst sich aus dem Leitner-Stand nicht zurueckrechnen.
 * Also wird es abgelegt, genau wie der Pokal, und genau dort: bei den
 * Einstellungen, nicht im Fortschritt. „Von vorne" loescht eine Ebene;
 * was einmal fehlerfrei war, war es. */
const glattSchluessel = () => `ohnefehler:${P.id}`;
async function glattStand(){
  try { return (await Ablage.hole('einstellungen', glattSchluessel())) || null; }
  catch(e){ return null; }
}
async function glattSetzen(wert){
  try { await Ablage.setze('einstellungen', glattSchluessel(), wert); } catch(e){}
}

/* ---------- Fionas Tiere (T1) -------------------------------------------
 *
 * Ein Sammelalbum neben dem Forscherbuch. Der Unterschied ist der ZWECK,
 * und er ist der ganze Grund, warum es getrennt ist: der Aufkleber im
 * Forscherbuch IST der Lerngegenstand („Afrika", „3 + 4") - das Tier ist
 * es nicht. Es ist der Lohn dafuer, dass eine Runde ohne einen einzigen
 * Fehlversuch durchging.
 *
 * WARUM NEBEN DEM BUCH UND NICHT DARIN VERMISCHT: wer die Tiere unter die
 * Aufkleber mischt, macht aus „Afrika" und „der Fuchs" dasselbe. Sie
 * bekommen deshalb ein eigenes Kapitel - dieselbe Bauart wie die
 * Abzeichen, und aus demselben Grund.
 *
 * WARUM IM EIGENEN SCHLUESSEL und nicht in `Einst`: `Einst` liegt unter
 * `einstellungen/alles` und REIST NICHT - dort stehen die PIN und der
 * Ton, die auf dem Geraet bleiben sollen. Die Sammlung eines Kindes muss
 * aber mitreisen: wer auf dem iPad einen Fuchs bekommt, hat ihn auch auf
 * dem iPhone. Also ein eigener Schluessel je Kind, und `Gleichlauf.REIST`
 * laesst ihn durch.
 */
const tierSchluessel = () => `tiere:${P.id}`;
/* Im Speicher gehalten, weil der Endbildschirm SYNCHRON entscheiden muss:
   er zeichnet das Tier, das er gerade vergeben hat, und kann nicht auf die
   Ablage warten. Geladen wird bei der Profilwahl, geschrieben nebenher. */
let TierStand = { ids: [], gorilla: 0, szenen: {} };
async function tiereLaden(){
  TierStand = { ids: [], gorilla: 0, szenen: {} };
  try { TierStand = { ...TierStand,
    ...(await Ablage.hole('einstellungen', tierSchluessel()) || {}) }; } catch(e){}
  if (!TierStand.szenen || typeof TierStand.szenen !== 'object') TierStand.szenen = {};
  /* UMBENANNTE RAEUME BEHALTEN IHRE SZENE.
     Die Szene liegt unter dem NAMEN des Raumes - wird er umbenannt,
     steht das Zimmer beim naechsten Start leer da, ohne dass etwas
     kaputt waere. Zwei Namen sind schon einmal ausgeliefert worden,
     bevor sie zu breit fuer die Zelle waren (I23); dieser Bogen holt
     ihre Szenen herueber. Er darf wachsen, aber nie schrumpfen. */
  for (const [alt, neu] of Object.entries(RAUM_UMBENANNT))
    if (TierStand.szenen[alt] && !TierStand.szenen[neu]) {
      TierStand.szenen[neu] = TierStand.szenen[alt];
      delete TierStand.szenen[alt];
    }
}
/** Alter Raumname -> heutiger. Nur fuer schon ausgelieferte Namen. */
const RAUM_UMBENANNT = { 'Am Fruchtstand': 'Auf dem Markt',
                         'Beim Sommerfest': 'Beim Fest' };
function tiereSichern(){
  Ablage.setze('einstellungen', tierSchluessel(), TierStand).catch(()=>{});
  gleichlaufBald();
}

/**
 * Was diese Runde einbringt - EINMAL je Sitzung.
 *
 * `st.tiere` haelt die Entscheidung fest. Ohne das bekaeme ein zweiter
 * Aufruf von `endschirm()` ein zweites Mal etwas: der Bildschirm wird bei
 * jedem `zeige()` neu gebaut, und `ansicht` fotografiert ihn zweimal.
 * Ein Aufkleber, der sich durch Hinsehen vermehrt, ist keiner.
 *
 * ZWEI DINGE KOENNEN GESCHEHEN, und sie haengen an Verschiedenem:
 *
 *   DER LEBENSRAUM  Ist die EBENE fertig - jeder Umriss im Buch -, dann
 *                   kommen ihre Tiere dazu. Nicht die gute Runde zaehlt,
 *                   sondern das Fertigwerden; deshalb kann es auch bei
 *                   einer Runde mit Fehlern geschehen.
 *   DER GORILLA     War die Runde NICHT fehlerfrei, kommt er vorbei. Er
 *                   wird nicht gesammelt (siehe `tiere.js`), sondern
 *                   gezaehlt.
 *
 * Beides zusammen ist moeglich - und dann steht der Lebensraum da, nicht
 * der Gorilla: die Ebene fertig zu haben ist die groessere Nachricht.
 */
function tierFuer(st){
  if (st.tiere !== undefined) return st.tiere;
  /* Gerechnet auf `st.alle` und `Stand` - genau der Menge, aus der auch
     der Fortschrittsbalken kommt. Zwei Zaehler fuer „ist die Ebene
     fertig" waeren zwei Zahlen, die eines Tages auseinanderlaufen. */
  const f = Leitner.fortschritt(st.alle, Stand);
  const neu = (f.gesamt && f.gesammelt === f.gesamt)
    ? Tiere.raumTiere(st.ebeneId, TierStand.ids) : [];
  if (neu.length) {
    TierStand = { ...TierStand, ids: [...TierStand.ids, ...neu.map(t => t.id)] };
    tiereSichern();
    return (st.tiere = { raum: Tiere.raumZu(st.ebeneId), neu });
  }
  /* DIE SAMMLUNG SELBST oeffnet einen Raum (T6) - aber erst, wenn diese
     Runde keinen gebracht hat. Zwei gruene Zeilen auf einem
     Endbildschirm sind fuer ein sechsjaehriges Kind keine zwei
     Nachrichten, sondern keine; die Schwelle wartet dann bis zum
     naechsten Mal, und sie laeuft nicht weg. */
  const ausZahl = Tiere.raumAbZahl(TierStand.ids);
  if (ausZahl) {
    TierStand = { ...TierStand, ids: [...TierStand.ids, ...ausZahl.neu.map(t => t.id)] };
    tiereSichern();
    return (st.tiere = { raum: ausZahl.raum, neu: ausZahl.neu });
  }
  /* --- OHNE FEHLER: EIN AUFKLEBER, SOFORT (I27) ----------------------
   *
   * Bis hierher zahlte nur das FERTIGWERDEN einer Ebene - und das
   * dauert. Der erste Durchgang brachte nichts, der zweite auf einmal
   * drei oder sechs. Gemeldet hat es der Nutzer, und er hat recht: ein
   * Lohn, der beim ersten Mal ausbleibt und beim zweiten in Buendeln
   * kommt, erklaert sich keinem Kind. Er erklaert sich nicht einmal
   * einem Erwachsenen, der zusieht.
   *
   * Eine fehlerfreie Runde bringt deshalb EINEN Aufkleber aus dem Raum
   * dieser Ebene - sofort, beim ersten Mal, und wieder, solange dort
   * noch etwas liegt. Es bleibt bei EINER Nachricht je Bildschirm: die
   * beiden Faelle darueber sind groesser und stehen deshalb davor.
   *
   * „Ohne Fehler" heisst AUF ANHIEB: `st.glatt` zaehlt die Aufgaben,
   * die ohne Fehlversuch sassen. Wer sich durchprobiert, bekommt den
   * Gorilla - das war schon so und bleibt so.
   *
   * Was dadurch NICHT passiert: der Raum wird nicht groesser. Wer ihn
   * fehlerfrei leerspielt, bekommt beim Fertigwerden nichts mehr - und
   * das ist richtig herum. Der Lohn ist nach VORNE gewandert, nicht
   * vermehrt worden. */
  if (st.glatt === st.liste.length) {
    const uebrig = Tiere.raumTiere(st.ebeneId, TierStand.ids);
    if (uebrig.length) {
      const eins = uebrig[0];
      TierStand = { ...TierStand, ids: [...TierStand.ids, eins.id] };
      tiereSichern();
      return (st.tiere = { raum: Tiere.raumZu(st.ebeneId), neu: [eins],
                           grund: 'ohne Fehler' });
    }
  }
  if (st.glatt < st.liste.length) {
    TierStand = { ...TierStand, gorilla: (TierStand.gorilla || 0) + 1 };
    tiereSichern();
    return (st.tiere = { gorilla: Tiere.tierMit(Tiere.GORILLA) });
  }
  /* DER LOHN, DER NICHTS SAGTE (I18).
   *
   * Gemessen: von Leas vierzig Ebenen zahlen sechsundzwanzig nichts.
   * Neun Hauptstadtebenen fuehren in EINE Stadt, zehn Flaggenebenen in
   * EINEN Vogelpark, sieben Englischebenen in EIN Riff. Wer die zweite
   * fertig macht, bekam bis hierher nichts - und hoerte nichts. Der
   * Bildschirm sagte „Gut gemacht" und schwieg, und das ist die Stelle,
   * an der ein Kind aufhoert zu fragen, wofuer es das tut.
   *
   * Es GIBT etwas zu holen, es steht nur weiter weg: die beiden Raeume
   * mit Schwelle sind der Lohn fuer das Sammeln selbst. Also sagt der
   * Bildschirm, wie weit es noch ist - kein neuer Lohn, sondern der
   * vorhandene, sichtbar gemacht.
   *
   * NUR WENN DIE EBENE FERTIG IST. Nach einer Runde mitten in einer
   * Ebene waere es keine Nachricht, sondern eine Mahnung; und nach einer
   * Runde mit Fehlern kommt der Gorilla, der steht darueber. Zwei
   * Nachrichten auf einem Endbildschirm sind fuer ein sechsjaehriges
   * Kind keine zwei, sondern keine - dieselbe Ueberlegung wie bei T6. */
  if (f.gesamt && f.gesammelt === f.gesamt) {
    const weiter = Tiere.naechsteSchwelle(TierStand.ids);
    const schon = Tiere.raumZu(st.ebeneId);
    if (schon || weiter) return (st.tiere = { schon, weiter });
  }
  return (st.tiere = null);
}

/**
 * Der Satz, wenn es diesmal nichts zu holen gab (I18).
 *
 * EIN Satz und nicht zwei: „Der Vogelpark ist schon offen" allein ist
 * eine Feststellung ueber die Vergangenheit, „noch vier Tiere" allein
 * haengt in der Luft. Zusammen sind sie eine Auskunft: das hier ist
 * geschafft, und das da kommt als naechstes.
 *
 * Er steht hier EINMAL und wird zweimal gelesen - vom Bildschirm und von
 * der Ansage. Zwei Fassungen desselben Satzes waeren die naechste, die
 * auseinanderlaeuft (Regel 6: was zweimal dasteht, veraltet einmal), und
 * ausgerechnet fuer Fiona waere die gesprochene die falsche.
 */
function weiterSatz(tier){
  /* „X ist schon offen" und nicht „X hast du schon": die Raumtitel sind
     Ortsangaben („In der Stadt", „Vor der Haustuer"), und die stehen im
     Deutschen nicht als Objekt. Dieselbe Wendung wie in der gruenen
     Zeile darueber - „In der Stadt ist offen: Taube, Ratte und
     Streifenhoernchen" -, nur mit „schon". */
  const schon = tier.schon ? `${tier.schon.titel} ist schon offen.` : '';
  if (!tier.weiter) return `${schon} Du hast alle Tiere!`.trim();
  const n = tier.weiter.fehlt;
  /* Und der zweite Halbsatz nennt den naechsten Ort als NAMEN nach einem
     Doppelpunkt, statt ihn zu beugen: „dann geht In der Tiefsee auf"
     waere kein Satz. */
  return `${schon} Noch ${n === 1 ? 'ein Tier' : `${n} Tiere`} — `
    + `dann kommt ein neuer Ort: ${tier.weiter.raum.titel}.`;
}

/* Auf der Kachel steht der Name OHNE Artikel, gesprochen wird er MIT.
   „das Känguru" lief auf dem Aufkleber ueber beide Raender - gemessen im
   Buch, 68 Punkte breit. Der Artikel gehoert zum Gehoerten (Fiona lernt
   ihn dort), nicht auf ein Schild von der Breite eines Daumens. */
const ohneArtikel = (name) => String(name).replace(/^(der|die|das) /, '');

/** Ein Tier als Bild. `RAHMEN` kommt aus den Daten, nicht von hier. */
const tierBild = (t, klasse = '') => `<svg class="tierbild ${klasse}"
  viewBox="${Tiere.RAHMEN}" role="img" aria-label="${t.name}">${t.bild}</svg>`;

/**
 * Welche Abzeichen einer Ebene sind verdient? Nur die Kennungen.
 *
 * Gebraucht an zwei Stellen - im Forscherbuch und am Ende einer Sitzung,
 * um zu sehen, ob gerade eines DAZUGEKOMMEN ist. Zweimal gerechnet hiesse
 * zweimal anders gerechnet; in diesem Verzeichnis sind so schon zwei
 * Sternformeln entstanden.
 */
function verdiente(ebeneId, stand){
  return Abzeichen.abzeichenDer(ebeneId, vorrat(ebeneId, stand, true),
    { name: P.name, erreichbar: erreichbar(ebeneId) })
    .map(a => Abzeichen.stand(a, id => Leitner.istGesammelt(stand, id)))
    .filter(a => a.verdient);
}

/* ---------- Der Pokal (B2) ----------------------------------------------
 *
 * Ein Pokal steht fuer einen bestandenen TEST, nicht fuer eine Sammlung.
 * Das ist der ganze Unterschied zu den Sternen und den Aufklebern: die
 * bekommt man fuers Ueben, den Pokal nur dafuer, dass man es einmal OHNE
 * Hilfen gezeigt hat.
 *
 * Er liegt bei den Einstellungen und nicht im Fortschritt, weil er kein
 * Lernstand ist: „von vorne" loescht den Fortschritt einer Ebene - einen
 * bestandenen Test loescht es nicht. Was man gezeigt hat, hat man gezeigt.
 */
const pokalSchluessel = (ebeneId) => `pokal:${P.id}:${ebeneId}`;
async function pokalStand(ebeneId){
  try { return (await Ablage.hole('einstellungen', pokalSchluessel(ebeneId))) || null; }
  catch(e){ return null; }
}
async function pokalSetzen(ebeneId, wert){
  try { await Ablage.setze('einstellungen', pokalSchluessel(ebeneId), wert); } catch(e){}
}

/* Wer darf einen Test machen?
 *
 * NUR WER LIEST. Fionas Auswahl aus vier Moeglichkeiten ist ihr
 * Eingabeweg, keine Hilfe - ohne sie waere der Test fuer sie keine
 * Pruefung, sondern eine Sperre. Ein Test, den ein Kind nicht bestehen
 * KANN, ist kein Test.
 *
 * Und nur auf Kartenebenen: beim Rechnen gibt es keinen Vorrat, der
 * einmal „durch" ist, und damit auch kein Ende, an dem ein Test staende.
 */
const testErlaubt = (b) => P.eingabe.includes('tippen')
  && ebeneArt(b.id) === 'karte' && b.gesamt > 0;
/** Offen ist der Test erst, wenn die Ebene GANZ gesammelt ist. */
const testOffen = (b) => testErlaubt(b) && b.gesammelt >= b.gesamt;

/* Bestanden ab vier Fuenfteln.
 *
 * Nicht „alles richtig": bei sechzehn Bundeslaendern haengt ein Pokal
 * sonst an einem einzigen Verrutscher, und der Test wird zu einer Sache,
 * die man wieder und wieder anfaengt. Nicht die Haelfte: dann steht der
 * Pokal fuer etwas, das man auch raten kann. Vier Fuenftel sind bei
 * sechzehn Gegenstaenden dreizehn - man darf dreimal danebenliegen. */
const BESTANDEN_AB = 0.8;

/** Der Kopf, den beide Wahlbildschirme tragen. Einmal geschrieben. */
const wahlKopf = (mitte) => kopf({ links: zurueckKnopf(), mitte:`<span class="marke">${mitte}</span>`,
  rechts: zeichenKnopf('buch','buch','Forscherbuch')
        + zeichenKnopf('eltern','eltern',BEREICH_ELTERN) });

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
            <div class="stand">${kleberMarke(gesammelt, gesamt, true)}</div>
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
/* Zwei Ebenen, EINE Kachel (Q17).
 *
 * „Hauptstädte" gab es zweimal - Deutschland und Europa -, und auf der
 * Kachel stand beide Male dasselbe Wort. Was sie unterscheidet, ist die
 * Ueberzeile, und die ist in der Ebenenwahl ausgeblendet, seit dort das
 * Bild oben liegt (Q8). Zwei Kacheln, ein Name, kein Unterschied.
 *
 * Es war aber nicht nur haesslich, es war eine Sackgasse: mit elf Ebenen
 * passte Leas letzte Kachel auf dem Zielgeraet nicht mehr in die Wand -
 * sie endete bei y = 491 in einem 390 Punkte hohen Fenster, ohne Rollen
 * und ohne Hinweis. „Hauptstädte Europa" war fuer sie und die Eltern
 * schlicht nicht zu erreichen (Q13).
 *
 * Beides loest dieselbe Sache: die Ebenen einer `gruppe` stehen als EINE
 * Kachel da, und wer sie antippt, wird gefragt wohin. Aus elf werden
 * zehn, und der doppelte Name verschwindet - die zweite Ebene heisst
 * jetzt dort, wo es darauf ankommt, „Deutschland" bzw. „Europa".
 *
 * Wer nur EINE der Ebenen hat, bekommt keine Frage mit einer Antwort:
 * Fiona hat Europa nicht, ihre Kachel fuehrt wie bisher direkt hinein.
 *
 * Die Ebenen selbst bleiben unberuehrt - eigene Kennung, eigener
 * Leitner-Stand, eigener Fortschritt, eigene Abzeichen. Zusammengelegt
 * ist nur, was man SIEHT.
 */
function gruppiert(balken){
  const aus = [], schon = new Set();
  for (const b of balken) {
    if (!b.gruppe) { aus.push(b); continue; }
    if (schon.has(b.gruppe)) continue;
    schon.add(b.gruppe);
    const teile = balken.filter(x => x.gruppe === b.gruppe);
    if (teile.length === 1) { aus.push(teile[0]); continue; }
    // Der Stand der Gruppe ist die Summe ihrer Teile - sonst zeigte die
    // Kachel den Fortschritt einer Haelfte und veruntreute die andere.
    aus.push({ ...b, gruppenKachel:b.gruppe, teile,
      gesammelt: teile.reduce((n, x) => n + x.gesammelt, 0),
      gekonnt:   teile.reduce((n, x) => n + x.gekonnt, 0),
      gesamt:    teile.reduce((n, x) => n + x.gesamt, 0),
      anteil:    teile.reduce((n, x) => n + x.anteil, 0) / teile.length,
      // Ein Pokal steht erst da, wenn ALLE Teile bestanden sind.
      pokal:     teile.every(x => x.pokal) });
  }
  return aus;
}

/* ---------- Der Weg (N11) -------------------------------------------------
 *
 * Befunde G6, S8, S7 - und alle drei sagen dasselbe von verschiedenen
 * Seiten: „Elf identisch grosse, identisch schwere Kacheln. Keine
 * Hierarchie, kein Anfang, kein Ziel. Das Auge hat keinen Einstieg."
 * „Nichts sagt fang hier an, nichts sagt das kannst du schon, nichts sagt
 * das ist neu." „Fortschritt ist eine Zahl, kein Ort - es gibt keinen Weg,
 * auf dem man weiter vorne stuende als gestern."
 *
 * Aus der Wand wird eine Strecke. Jede Ebene ist eine STATION mit einem
 * von drei Zustaenden:
 *
 *   geschafft  alles gesammelt - liegt hinter einem, traegt einen Haken
 *   dran       hier geht es weiter - leuchtet, und die Figur steht dort
 *   wartet     kommt noch - ruhiger Rand, blasses Bild
 *
 * Und zwischen den Stationen liegt ein BAND. Hinter der Station, auf der
 * man steht, ist es voll, davor blass: der Fortschritt ist damit ein ORT
 * auf dem Schirm und keine Zahl mehr (S7).
 *
 * ES WIRD NICHTS GESPERRT, und das ist eine Entscheidung gegen den
 * naechstliegenden Entwurf. „Was noch zu weit ist, wartet" haette man als
 * Schloss lesen koennen; ein Kind, das heute Afrika will, bekaeme dann
 * eine Tuer statt einer Uebung. Der Unterschied zwischen „das ist neu"
 * und „das darfst du nicht" kostet nichts, wenn man ihn nur MALT: das
 * Auge bekommt seinen Einstieg, der Finger behaelt alle elf.
 *
 * WELCHE STATION IST DRAN? Die ERSTE, die noch nicht fertig ist - und
 * das ist der zweite Entwurf. Der erste nahm die zuletzt begonnene:
 * „dort hat das Kind aufgehoert, dorthin will es zurueck." Angesehen war
 * es falsch, und zwar sichtbar. Leas Stand geht quer durch die Welt -
 * Kontinente unberuehrt, Hauptstaedte halb -, und damit lag hinter der
 * Station, auf der sie steht, ein volles Band ueber vier Kacheln mit
 * LEEREM Fortschrittsbalken. Zwei Aussagen auf einer Kachel, die
 * einander widersprechen: das Band sagte „schon gegangen", der Balken
 * „noch nichts". Dieselbe Falle, an der schon die Sterne und die
 * Aufkleberzahl haengengeblieben sind (S1, S2).
 *
 * Mit der ERSTEN offenen Station stimmt es von selbst: alles davor ist
 * fertig, weil es sonst selbst die erste offene waere. Was hinter einem
 * liegt, ist damit genau das, was man kann - und das Band sagt dasselbe
 * wie der Haken darauf.
 *
 * Es ist eine EMPFEHLUNG, keine Reihenfolge: wer Afrika will, tippt auf
 * Afrika. Ist alles fertig, ist keine Station dran und das Band ist auf
 * ganzer Laenge voll.
 *
 * Der Weg laeuft in der LESEREIHENFOLGE, nicht als Schlange mit
 * Kehren. Eine Schlange braucht die Stelle, an der die Zeile umbricht -
 * und die kennt das Stilblatt nicht: sie haengt an der Fensterbreite. Wer
 * sie in Zahlen je Fensterformat aufschreibt, hat sieben Zahlen, die bei
 * der zwoelften Ebene alle falsch sind. Das Band verbindet deshalb, was
 * nebeneinander steht, und bricht mit der Zeile um.
 */
const stationFertig = (b) => b.gesamt > 0 && b.gesammelt >= b.gesamt;

function wegStationen(balken){
  const dran = balken.find(b => !stationFertig(b)) || null;
  // Ohne offene Station liegt ALLES hinter einem - dann ist `bisHier` die
  // ganze Laenge und das Band durchgehend voll.
  const bisHier = dran ? balken.indexOf(dran) : balken.length;
  return balken.map((b, i) => ({ b,
    /* Vier Zustaende, drei davon sichtbar verschieden. `offen` ist eine
       Station HINTER dem Weg, an der schon gearbeitet wurde - sie sieht
       aus wie eine gewoehnliche Kachel, denn sie ist keine. Sie blass zu
       machen hiesse, einen halbvollen Balken auszugrauen. */
    zustand: stationFertig(b) ? 'geschafft'
           : b === dran       ? 'dran'
           : b.gesammelt > 0  ? 'offen' : 'wartet',
    hinter: i <= bisHier }));
}

/* Die Marke auf der Station. Sie sitzt in der AUSSENECKE oben links,
 * nicht in der Kachel - und das ist der zweite Anlauf.
 *
 * Der erste legte sie innen in dieselbe Ecke, mit der Ueberlegung, dort
 * beanspruche den Platz weder das Bild (mittig) noch der Name (unten)
 * noch das Auge (unten rechts). `passt` hat es gemessen und widerlegt:
 * die Weltkarte auf „Kontinente" fuellt ihre Kachel bis in die Ecken, und
 * die Scheibe deckte 12 bis 14 % davon zu - erlaubt sind 6. Fuer Fiona
 * IST das Bild der Name; ein Siebtel davon fuer eine Marke herzugeben,
 * die dasselbe in klein sagt, waere ein schlechter Tausch.
 *
 * Draussen liegt sie in der Rundung der Kachelecke, also dort, wo ohnehin
 * nichts steht - und ueber den Rand der Wand laeuft sie nicht: vier
 * Punkte, und die Wand sitzt in einem Kasten mit Polsterung.
 *
 * Die Figur steht nur bei den Kindern - derselbe Schalter wie beim Jubel
 * und auf dem Endbildschirm (N9). Fuer Stephan waere sie Zierde; fuer
 * Fiona ist sie das Einzige auf diesem Bildschirm, das ohne ein Wort
 * sagt „hier bist du". */
const stationMarke = (zustand) =>
  zustand === 'geschafft'
    ? `<span class="wegmarke fertig" role="img" aria-label="schon geschafft">${
        ZEI('haken', 18)}</span>`
: zustand === 'dran'
    ? `<span class="wegmarke hier" role="img" aria-label="hier geht es weiter">${
    ton().feier ? figur('freut', 22) : ZEI('weiter', 18)}</span>`
: '';

async function ebenenwahl(gruppe = null){
  const s = el('div');
  // Nur die Ebenen DIESER Welt. Ohne den Filter wäre die Weltenwahl eine
  // Zwischentür, die nichts zutut - und drei Runden später hätte niemand
  // mehr gewusst, wozu sie da war.
  const welt = WELTEN.find(w => w.id === Welt) || WELTEN[0];
  const alle = (await staende()).filter(b => weltVon(b) === welt.id);
  // Innerhalb einer Gruppe heisst die Kachel nach dem ORT, nicht nach der
  // Frage: „Deutschland" und „Europa", nicht zweimal „Hauptstädte".
  const balken = gruppe ? alle.filter(b => b.gruppe === gruppe).map(b => ({ ...b,
                            ueber: b.titel, titel: b.wo || b.titel }))
                        : gruppiert(alle);
  /* „— wo?" gilt nur, wo die Teile ORTE sind (die Hauptstaedte auf neun
     Karten). Seit I21 gibt es eine Gruppe, deren Teile zwei FRAGEN sind:
     „Bundesländer — Wie heißen sie? / Wer grenzt an wen?". Dort waere
     „Bundesländer — wo?" schlicht falsch, und die Ueberschrift stuende
     ueber zwei Kacheln, von denen keine einen Ort nennt.
     Entschieden wird an den Teilen selbst und nicht an einer Liste von
     Gruppennamen: wo die Kachelnamen mit einem Fragezeichen enden, ist
     die Ueberschrift schon eine Frage. */
  const teileGruppe = gruppe ? alle.filter(b => b.gruppe === gruppe) : [];
  const frage = gruppe
    ? (alle.find(b => b.gruppe === gruppe)?.titel || welt.name)
      + (teileGruppe.some(b => /\?$/.test(b.wo || '')) ? ' — was möchtest du?' : ' — wo?')
    : 'Womit möchtest du anfangen?';
  // Der Weg wird EINMAL gerechnet: das Markup braucht ihn, die Ansage
  // braucht dieselbe Station, und zweimal gerechnet waeren es zwei, die
  // getrennt veralten (Regel 6).
  const stationen = wegStationen(balken);
  const hier = stationen.find(x => x.zustand === 'dran');
  s.innerHTML = wahlKopf(gruppe ? welt.name : welt.name) + `
    <div class="mitte">
      <div class="titel">${frage}</div>
      <div class="wahl ebenen weg">${stationen.map(({ b, zustand, hinter })=>`
        <div class="kachelpaar station ${zustand}${hinter ? ' hinter' : ''}">
        <button class="kachel bunt" data-ebene="${b.id}"${
          b.gruppenKachel ? ` data-gruppe="${b.gruppenKachel}"` : ''
        }${zustand === 'dran' ? ' aria-current="step"' : ''
        } style="--ton:var(--f${b.farbe})">
          ${silhouette(b.id)}
          <div class="ueber">${b.ueber}</div>
          <div class="name">${b.titel}</div>
          <div class="kachelfuss">
            <div class="stand">${kleberMarke(b.gesammelt, b.gesamt, true)}${
              /* Der Pokal steht NEBEN dem Aufkleberstand, nicht darueber:
                 beide sagen „was du hier hast", und beide gehoeren damit in
                 dieselbe Zeile. Der erste Anlauf legte ihn absolut ueber die
                 Kachel - dort lag er auf der Zahl. */
              b.pokal ? `<span class="pokal" title="Test bestanden">${POKAL}</span>` : ''}</div>
            ${fortschrittBalken(b)}
          </div>
        </button>
        ${b.gruppenKachel ? '' : `
        <button class="knopf rund schau" data-schau="${b.id}"
                aria-label="${b.titel} anschauen" title="Anschauen">${ZEI('auge', 22)}</button>`}
        ${stationMarke(zustand)}
        <div class="kachelknoepfe">${
          /* Der Test steht erst da, wenn die Ebene ganz gesammelt ist (B2).
             Vorher waere er kein „Test am Ende", sondern eine zweite Art
             zu ueben - und der Pokal waere nichts wert. */
          !b.gruppenKachel && testOffen(b) ? `
          <button class="leise mini" data-test="${b.id}">Test</button>` : ''}
        </div></div>`).join('')}</div>
    </div>`;
  // Zurück führt in die Welt, nicht bis zur Profilwahl: sonst wäre die
  // Weltenwahl eine Tür, die nur in eine Richtung aufgeht.
  // Aus einer Gruppe fuehrt „Zurück" in die WAND, nicht in die Weltenwahl:
  // sonst waere die Frage „wo?" eine Tuer, hinter der man zwei Schritte
  // zurueckfaellt.
  s.querySelector('#zur').onclick=()=>zeige(gruppe ? ()=>ebenenwahl() : weltenwahl);
  s.querySelector('#buch').onclick=()=>zeige(forscherbuch);
  s.querySelector('#eltern').onclick=()=>zeige(elternTor);
  s.querySelectorAll('[data-ebene]').forEach(b=>b.onclick=()=>{
    // Eine Gruppenkachel fragt erst, wohin.
    if (b.dataset.gruppe) { zeige(()=>ebenenwahl(b.dataset.gruppe)); return; }
    const id=b.dataset.ebene;
    // Beim ERSTEN Mal auf dieser Ebene: erst anschauen, dann raten (R3).
    // Danach nur noch auf Wunsch, ueber den Knopf „anschauen" an der
    // Kachel - wer eine Ebene kennt, will nicht jedes Mal blaettern.
    if (!Einst.vorlaufGezeigt[`${P.id}:${id}`]) zeige(()=>vorlauf(id));
    else starten(id); });
  s.querySelectorAll('[data-schau]').forEach(b=>b.onclick=(ev)=>{
    ev.stopPropagation(); zeige(()=>vorlauf(b.dataset.schau)); });
  // In den Test geht es OHNE Vorlauf: wer geprueft wird, schaut sich die
  // Antworten nicht vorher an.
  s.querySelectorAll('[data-test]').forEach(b=>b.onclick=(ev)=>{
    ev.stopPropagation(); starten(b.dataset.test, true); });

  /* „von vorne" steht NICHT mehr an der Kachel (Q8).
   *
   * Es gab den Knopf zweimal - hier und im Pausenbildschirm einer Ebene -,
   * und beide taten dasselbe: Fortschritt loeschen, Leitner-Stand leeren,
   * zwei Tipper zur Sicherheit. Regel 6. Der Weg dorthin ist jetzt: Ebene
   * betreten, Kreuz, „von vorne" - ein Tipp mehr, und niemand verliert
   * etwas. Wer alles gekonnt hat, kommt weiterhin ohne den Elternbereich
   * an seine Aufgaben.
   *
   * Weg musste er aus einem anderen Grund. Er hing UNTER der Kachel und
   * nur an Kacheln MIT Fortschritt: das kostete rund 37 Punkte je Reihe
   * und liess die Reihe ausfransen, weil die Zeile mal da war und mal
   * nicht. Ohne ihn passt die hohe Kachelform, mit ihr nicht. */
  /* Und die Stimme sagt, WO man steht. Fuer Fiona ist die Ansage der
     zweite Weg auf diesen Bildschirm: sie sieht die Figur an der Station
     und hoert denselben Namen. */
  ansagen(`${gruppe ? frage : welt.name + '. ' + frage} `
    + `${aufzaehlen(balken.map(b=>b.titel))}?`
    + (hier ? ` Du bist bei ${hier.b.titel}.` : ''));
  return s;
}

/* ---------- Der Vorlauf (R3) ---------------------------------------------
 *
 * Vor jeder Ebene ein Blättern statt eines Rätsels: alle Gegenstände der
 * Ebene mit Bild und Namen, antippen liest vor, unten „Jetzt starten".
 *
 * Er ERSETZT die Stadtstaaten-Lerneinheit, statt neben sie zu treten.
 * Die stand bisher allein vor `hauptstaedte`, und zwei
 * Vorschaltbildschirme hintereinander wären einer zuviel gewesen. Ihre
 * Form war ohnehin schon die richtige - Titel, ein Satz, ein Gitter aus
 * Umrissen zum Antippen, ein Knopf. Der Vorlauf ist ihre
 * Verallgemeinerung, und der erklärende Satz bleibt: er steht jetzt als
 * der Satz DIESER Ebene da.
 *
 * Der Satz wird abgeleitet, nicht je Ebene hingeschrieben — dieselbe
 * Regel wie beim Kartenhinweis (B15). Sonst hätte die vierte Karte
 * keinen.
 *
 * Die Karten sind die des Forscherbuchs (`.kleber`, `.aufkleber`). Das
 * ist kein Sparen: es ist derselbe Gegenstand in derselben Sprache, und
 * ein Kind, das im Buch geblättert hat, erkennt ihn hier wieder.
 */
const vorlaufSchluessel = (ebeneId) => `${P.id}:${ebeneId}`;

/* Was der Vorlauf zeigt - und warum das bei Rechenaufgaben etwas anderes
 * ist als bei Gebieten.
 *
 * R3 sagte „alle Gegenstaende der Ebene". Das war fuer GEBIETE gedacht:
 * sechzehn Bundeslaender, ein Bildschirm, und danach kennt man sie. Die
 * Rechenebenen haben die Regel still geerbt - und ihr Vorrat ist
 * ERZEUGT: 100 Aufgaben bei Fiona, 140 bei Lea, 158 bei den Eltern.
 *
 * Gemessen auf dem Zielgeraet: 100 Karten sind 2,8 Bildschirme, 158 sind
 * 4,2. Das ist kein Blaettern mehr, das ist die Einmaleins-Tafel - und
 * sie steht vor der ERSTEN Sitzung einer Sechsjaehrigen.
 *
 * Der Vorlauf soll erklaeren, was kommt (B1 aus dem ANTON-Abgleich), und
 * dafuer braucht es Beispiele, keinen Vorrat. Wieviele? So viele, wie
 * gleich kommen - `P.sitzung`. Die Zahl steht schon im Profil und wird
 * hier nicht neu erfunden.
 *
 * Genommen wird nicht der Anfang, sondern jede n-te: sonst stuenden bei
 * „Plus und Minus" acht Mal `1 + irgendwas` da und kein einziges Minus.
 */
/* Wieviele Beispiele der Vorlauf einer Ebene zeigt - oder `null` fuer
 * „alle". Zwei Zahlen, und beide sind gemessen und nicht gesetzt:
 *
 *   P.sitzung  Rechnen und falsche Freunde. Seit E10 auch die: dreissig
 *              Fallen sind keine Vorschau, sondern eine Tafel. Gemessen
 *              hat es `passt` - die dreissig Aufkleber liefen auf dem
 *              Zielgeraet acht Punkte ueber den Rand, bei zehn Spalten
 *              und drei Reihen. Zwoelf stehen in zwei Reihen.
 *   DREI       Wendungen und Hoeren. Hier steht ein ganzer SATZ auf der
 *              Kachel, und zwar zweimal - englisch und deutsch. Eine
 *              solche Kachel ist drei Zeilen hoch statt einer, und damit
 *              gilt die Rechnung aus `vorlaufGitter` nicht mehr: sie
 *              rechnet mit 41 Punkten je Reihe. Mit zwanzig wie mit
 *              zwoelf Beispielen lag die zweite Reihe unter dem
 *              Startknopf.
 *
 *              Erst sechs, und das war um Haaresbreite zu knapp: HIER
 *              gruen, auf dem Runner 19 Punkte darueber, und ein Wort
 *              lag zu 17 Prozent auf „Jetzt starten". Derselbe Browser,
 *              andere Schriftmasse - also EINE Reihe statt zwei
 *              (`vorlaufGitter` legt bis drei Karten in eine), und der
 *              Streit um Zeilenumbrueche ist damit keiner mehr.
 *              Drei Beispiele zeigen, wie die Aufgabe aussieht; das ist
 *              die ganze Aufgabe des Vorlaufs.
 *
 * Und warum ueberhaupt gekuerzt wird, steht darueber: der Vorlauf zeigt
 * Beispiele, nicht den Vorrat. */
/* Und „Leg das Wort" (E8) - zwoelf, und die Zahl ist gemessen.
 *
 * Vierundzwanzig Karten wollen bei 88 Punkten Mindestbreite ACHT Spalten.
 * Auf dem iPhone SE quer (667 breit, 643 fuers Gitter) passen davon nur
 * sieben - `auto-fit` legt sieben an, aus drei Reihen werden vier, und in
 * den 174 Punkten Bandhoehe misst eine Karte dann 23 Punkte. Gemessen von
 * `passt`, nicht gerechnet: die Fingergrenze ist 44.
 *
 * Warum nicht die enge Spaltenbreite wie bei neun Spalten (`.kleber.viel`,
 * 56 statt 88): die 88 stehen dort aus einem eigenen Grund - bei 76 brach
 * „Niedersachsen" mitten im Wort. Eine Grenze anzuruehren, die einen
 * anderen Fall traegt, waere der teuerste Weg zur schmalsten Karte.
 *
 * Zwoelf wollen sechs Spalten (528 Punkte) und zwei Reihen. Und es
 * entspricht dem, was der Vorlauf ueberhaupt tut: er zeigt BEISPIELE,
 * nicht den Vorrat - derselbe Satz steht drei Absaetze weiter oben. */
/* Und die beiden SATZEBENEN: drei, wie bei den Wendungen der Eltern.
 *
 * Auch das ist gemessen, und der Befund ist aelter als die Ebene, die ihn
 * ans Licht gebracht hat: „Sag den Satz" (E9) zeigt seit v46x alle zwanzig
 * Saetze im Vorlauf, und `passt` hat es nie gesehen - das Tor misst nur,
 * was es BETRITT, und diese Ebene hat es nie betreten. Mit „Bau den Satz"
 * (E9c) kam sie in den Gang, und dann standen die Zahlen da: auf dem
 * Zielgeraet liefen sechs Kaesten 31 Punkte ueber den Rand des Bandes,
 * auf dem iPhone SE quer 159, und einer lag zu 78 Prozent auf „Jetzt
 * starten". Ein Satzkasten ist drei Zeilen hoch, zwanzig davon sind
 * sieben Reihen, und das Band hat Platz fuer drei.
 *
 * Drei ist keine neue Zahl: „Wendungen" und „Hoeren und schreiben" tragen
 * sie seit E11, und aus demselben Grund - ihre Kaesten sind auch Saetze. */
/* Und die Lautpaare: drei. Zweiunddreissig Gegenstaende sind sechzehn
 * Paare in zwei Richtungen - im Vorlauf stuende jedes Paar ZWEIMAL da,
 * denn der Kasten zeigt das Paar und nicht die Richtung. Drei Beispiele
 * zeigen, wie die Aufgabe aussieht; das ist die ganze Aufgabe des
 * Vorlaufs. */
const VORLAUF_JE = (art, ebeneId) =>
    ebeneId === 'englisch:laute' ? 3
  : ['englisch:satz', 'englisch:bauen'].includes(ebeneId) ? 3
  : ebeneId === 'englisch:legen' ? 12
  /* „Lies das Wort" (E7): ZWOELF von sechzehn, dieselbe Zahl wie beim
     Legen und aus demselben Grund. Mit sechzehn farbigen Bildern lief die
     Wand auf dem iPhone SE quer 47 Punkte aus dem Kasten - gemessen von
     `passt`, nicht geschaetzt. Solange die Bilder Umrisse in Tinte waren,
     passten sie; seit sie Bilder sind, brauchen sie Platz. */
  : ebeneId === 'englisch:lesen' ? 12
  : ['rechnen', 'freunde', 'verben', 'praeposition'].includes(art) ? P.sitzung
  : ['wendungen', 'hoersatz'].includes(art) ? 3
  : null;
function vorlaufVorrat(ebeneId){
  const alle = vorrat(ebeneId);
  const wieviel = VORLAUF_JE(ebeneArt(ebeneId), ebeneId);
  if (!wieviel || alle.length <= wieviel) return alle;
  const schritt = Math.floor(alle.length / wieviel);
  return alle.filter((_, i) => i % schritt === 0).slice(0, wieviel);
}

/* Wieviele Beispielkarten NEBENEINANDER stehen.
 *
 * Zwei Saetze, und der Rest folgt:
 *   hoechstens ACHT in einer Reihe - mehr wird auf dem Zielgeraet zu schmal
 *   ab vier Karten ZWEI Reihen, gleich lang - das Band ueber dem Knopf ist
 *   hoch genug fuer zwei, und eine Reihe mit zwei Karten unter einer mit
 *   acht sieht aus wie ein Rest, nicht wie eine zweite Reihe
 *
 * Sechzehn Bundeslaender stehen damit wie bisher acht und acht, sechs
 * Rechenaufgaben drei und drei. Wie BREIT und HOCH eine Karte dabei werden
 * darf, steht im Stilblatt; von hier bekommt es nur die beiden Zahlen, aus
 * denen es die Hoechstmasse des Gitters rechnet.
 *
 * Vorher legte `auto-fill` immer acht Spuren an. Sechs Karten belegten
 * sechs davon: die Reihe stand links, rechts blieb ein Loch von
 * vierhundert Punkten, und darueber und darunter je ein Drittel leeres
 * Band. Das sah nicht nach Auswahl aus, sondern nach vergessenem Inhalt.
 */
/* Und HOECHSTENS drei Reihen.
 *
 * Gemessen auf dem Zielgeraet mit Leiste: dem Gitter bleiben zwischen
 * Satz und Knopf 172 Punkte, eine Karte braucht mindestens 41 und die
 * Luecke 8. Vier Reihen sind 188 - die letzte lag acht Punkte im
 * Streifen des iPhone. Aufgefallen ist das erst beim Abc: sechzehn
 * Bundeslaender ergaben zwei Reihen, sechsundzwanzig Buchstaben vier.
 *
 * Die Breite gibt dafuer nach: aus acht Spalten werden neun, und die
 * Karte wird 85 statt 96 Punkte breit. Das traegt auch das laengste
 * Merkwort („Xylofon"). Hoehe ist hier die knappe Groesse, nicht Breite. */
const REIHEN_MAX = 3;
const vorlaufGitter = (n) => {
  const reihen = n <= 3 ? 1 : Math.min(REIHEN_MAX, Math.max(2, Math.ceil(n / 8)));
  return { reihen, spalten: Math.max(1, Math.ceil(n / reihen)) };
};

/** Der eine Satz, den dieser Vorlauf mitgibt. Abgeleitet, nicht gesammelt. */
function vorlaufSatz(ebeneId){
  const [art, kont] = ebeneId.split(':');
  /* Der Satz der Kontinent-Hauptstädte wird ABGELEITET, seit es die
     Ebene zweimal gibt (I14: Europa und Südosteuropa). Vorher stand hier
     ein Satz, der für Europa geschrieben war — „nicht die größte Stadt,
     bei einem Land hier sind das zwei verschiedene". Für Südosteuropa ist
     er schlicht falsch: alle sieben Hauptstädte SIND die größte Stadt
     ihres Landes, und die Ablenker sind durchweg kleiner. Ein Satz, den
     die zweite Karte still zur Lüge macht, ist Regel 6 in Reinform.

     Der Zusatz hängt an `falle`, und `falle` hängt an `regierungssitz`
     aus den gebackenen Daten (Niederlande: Den Haag). Damit sagt der Satz
     genau das, was in den Daten steht — nicht mehr.

     Seit I19 zählt er sie AUCH und nennt sie beim Namen. „Ein Land hier
     ist besonders" stand auf allen acht Karten — und war auf dreien
     falsch: Asien hat zwei (Malaysia, Sri Lanka), Afrika zwei
     (Elfenbeinküste, Benin), Südamerika zwei (Chile, Bolivien). Genau
     dieselbe Falle wie in I14, nur eine Ebene weiter: ein Satz, der für
     die erste Karte geschrieben wurde und den die zweite still zur Lüge
     macht.

     Und bei EINEM Land steht das Besondere ganz da, mit beiden Städten —
     bei zweien wäre das ein Absatz statt eines Satzes, und ein Vorlauf,
     den niemand zu Ende liest, ist keiner. */
  if (art === 'hauptstaedte' && kont) {
    const liste = D.laender[karteVon(ebeneId)] || [];
    const besonders = liste.filter(l => l.hauptstadt && l.falle && l.regierungssitz);
    const basis = 'Zur Auswahl stehen echte Städte des Landes — gesucht ist die '
      + '<strong>Hauptstadt</strong>.';
    if (!besonders.length) return basis;
    if (besonders.length === 1) {
      const l = besonders[0];
      /* Der Ländername steht hinter einem Gedankenstrich und nicht hinter
         einer Präposition: „in Niederlande" wäre falsch, „in den
         Niederlanden" bräuchte den Artikel und den Fall je Land. Ein
         gebeugter Ländername ist eine Auskunft, die in den Daten nicht
         steht — und was nicht dasteht, wird hier nicht erfunden. */
      return `${basis} Ein Land hier ist besonders — ${l.name}: die Regierung `
        + `sitzt in ${l.regierungssitz}, Hauptstadt ist trotzdem ${l.hauptstadt}.`;
    }
    return `${basis} ${ZAHLWORT[besonders.length] || besonders.length} Länder hier `
      + `sind besonders — ${aufzaehlen(besonders.map(l => l.name), 'und')}: dort `
      + 'sitzt die Regierung in einer anderen Stadt als der Hauptstadt.';
  }
  if (art === 'hauptstaedte')
    return 'Berlin, Hamburg und Bremen fehlen hier: sie sind <strong>Stadtstaaten</strong>, '
      + 'die Stadt ist das ganze Bundesland. Sie <em>sind</em> ihre Hauptstadt.';
  /* Der Satz der Flaggenebene (F2). Er sagt die VEREINFACHUNG mit an:
     alle Flaggen stehen hier im selben Rechteck, obwohl die Schweiz in
     Wirklichkeit quadratisch ist. Das Konzept haelt fest, dass eine
     Vereinfachung ausgesprochen und nicht verschwiegen wird - und der
     Vorlauf ist die Stelle, an der man sie hoert. */
  if (art === 'flaggen' && kont === 'karte')
    return 'Eine Flagge steht da, und du tippst auf das Land, zu dem sie gehört. '
      + 'Hier gehören <strong>Flagge, Form und Ort</strong> zusammen — '
      + 'das ist die schwerste der drei Flaggenebenen.';
  if (art === 'flaggen' && kont === 'paare')
    return 'Zwei Flaggen, die sich sehr ähnlich sehen — und eine davon ist gesucht. '
      + 'Nach jeder Antwort steht da, <strong>woran</strong> man sie unterscheidet. '
      + 'Zwei Paare kann man gar nicht sehen; die stehen hier zum Anschauen.';
  if (art === 'flaggen')
    return P.eingabe.includes('tippen')
      ? 'Gleich siehst du eine Flagge und tippst den Namen des Landes. '
        + 'Alle stehen im <strong>gleichen Rechteck</strong> — die Schweiz ist in '
        + 'Wirklichkeit quadratisch. Tippe hier eine an, dann hörst du das Land.'
      : 'Gleich sage ich dir ein Land, und du tippst auf seine <strong>Flagge</strong>. '
        + 'Tippe hier eine an, dann hörst du schon mal, wie sie heißt.';
  /* „Sag es" (E6). Der Satz nennt die Zusage, auf die es ankommt: es
     wird NICHT bewertet. Wer das nicht ausspricht, laesst ein Kind
     glauben, da sitze ein Pruefer - und dann sagt es lieber nichts. */
  /* Der Satz zum Selbersagen (E9). Dieselbe Zusage wie bei „Sag es" -
     und ein Satz mehr dazu, WOHER die Saetze kommen: sie sind nicht
     erfunden, sondern Instanzen amtlicher Redemittel. Das steht hier,
     weil der Vorlauf die Stelle ist, an der ein Kind (und ein Elternteil
     daneben) erfaehrt, womit es zu tun hat. */
  if (art === 'englisch' && kont === 'satz')
    return englischHoerbar()
      ? 'Du hörst einen ganzen Satz und sagst ihn nach. Auch hier wird '
        + '<strong>nicht bewertet</strong>. Die Sätze stehen so im Lehrplan — '
        + 'sie sind das, was man in der vierten Klasse sagen können soll.'
      : 'Hier steht ein englischer Satz, und du sagst ihn laut. Es wird '
        + '<strong>nicht bewertet</strong>. Vorlesen kann dir dieses Gerät ihn '
        + 'leider nicht — ihm fehlt eine englische Stimme.';
  /* „Leg das Wort" (E8). Der Satz nennt BEIDE Wege - ohne ihn findet ein
     Kind den Tippweg nicht, weil eine Karte, die man ziehen kann, nicht
     danach aussieht, als koenne man sie auch antippen. */
  /* „Lies das Wort" (E7). Der Satz sagt die Richtung - ohne ihn sieht die
     Ebene aus wie „Hören und zeigen", und sie ist dessen Umkehrung. */
  if (art === 'englisch' && kont === 'lesen')
    return 'Ein englisches Wort steht da, und du suchst das <strong>Bild</strong> '
      + 'dazu. Vorgelesen wird hier nichts — sonst müsstest du es ja nicht lesen.';
  /* „Zwei Wörter, ein Laut" (E5). Der Satz sagt, WORUM es geht - ohne
     ihn sieht die Ebene aus wie eine Vokabelabfrage mit zwei Antworten.
     Und er sagt die Zusage mit: die Erklaerung kommt immer, auch wenn man
     richtig lag. */
  if (art === 'englisch' && kont === 'laute')
    return 'Zwei Wörter, die sich fast gleich anhören — eines wird gesagt, und '
      + 'du tippst es an. Danach steht immer da, <strong>woran</strong> man sie '
      + 'unterscheidet. Tippe hier eins an, dann hörst du es schon mal.';
  /* „Bau den Satz" (E9c). Der Satz nennt, was ANDERS ist als nebenan -
     und die Notfassung gleich mit: ohne englische Stimme steht der Satz
     da, und dann ist es Abschreiben statt Zuhoeren. Das auszusprechen
     kostet eine Zeile und erspart einem Kind die Frage, warum es hier
     einmal so und einmal anders ist. */
  if (art === 'englisch' && kont === 'bauen')
    return englischHoerbar()
      ? 'Du hörst einen englischen Satz, und du legst ihn aus <strong>Wortkarten</strong>. '
        + 'Du kannst eine Karte ziehen oder sie antippen — dann springt sie an die '
        + 'nächste Lücke. Den Satz kannst du dir so oft anhören, wie du magst.'
      : 'Der Satz steht oben, und du legst ihn aus <strong>Wortkarten</strong>. '
        + 'Vorlesen kann dir dieses Gerät ihn leider nicht — ihm fehlt eine '
        + 'englische Stimme; deshalb steht er da.';
  if (art === 'englisch' && kont === 'legen')
    return 'Das Wort steht oben, und du legst es aus Buchstaben. '
      + 'Du kannst eine Karte <strong>ziehen</strong> oder sie einfach '
      + '<strong>antippen</strong> — dann springt sie an die nächste Lücke.';
  if (art === 'englisch' && kont === 'sagen')
    return englischHoerbar()
      ? 'Du hörst ein Wort und sagst es nach. Es wird <strong>nicht bewertet</strong> — '
        + 'niemand zählt hier Fehler. Wenn du magst, tippe auf das Mikrofon; '
        + 'sonst tippst du einfach auf „Gesagt".'
      : 'Hier steht ein englisches Wort, und du sagst es laut. Es wird '
        + '<strong>nicht bewertet</strong>. Vorlesen kann dir dieses Gerät es leider '
        + 'nicht — ihm fehlt eine englische Stimme.';
  if (art === 'rechnen')
    return `So sehen die Aufgaben aus — hier ein paar davon, `
      + `gleich kommen ${P.sitzung}. Antippen sagt dir die Aufgabe und das Ergebnis.`;
  if (art === 'schreiben' && kont === 'zahlen')
    return 'Gleich sage ich dir eine Zahl, und du schreibst sie — '
      + 'die großen mit zwei Ziffern. Tippe hier eine an, dann hörst du sie.';
  if (art === 'schreiben' && kont === 'ziffern')
    return 'Das sind die zehn Ziffern. Mit ihnen schreibt man jede Zahl. '
      + 'Tippe eine an, dann sage ich dir, wie sie heißt.';
  if (art === 'schreiben' && kont === 'diktat')
    return 'Gleich sage ich dir einen Buchstaben, und du schreibst ihn — '
      + 'ohne Vorlage. Tippe hier einen an, dann hörst du ihn schon mal.';
  if (art === 'schreiben')
    return 'Das sind die Buchstaben, die du schreiben lernst. Tippe einen an, '
      + 'dann sage ich dir, wie er heißt.';
  if (art === 'wendungen')
    /* Zwei Zeilen und nicht drei: der Satz steht ueber den Beispielen
       und nimmt ihnen die Hoehe weg. Der erste Anlauf war drei Zeilen
       lang, und zusammen mit den Satzkacheln lief der Vorlauf auf dem
       Runner ueber den Rand. */
    return 'Ein deutscher Satz, und du tippst ihn auf <strong>Englisch</strong> — '
      + 'mehr als eine Fassung ist richtig. Tippe hier eine an.';
  if (art === 'hoersatz')
    return englischHoerbar()
      ? 'Ich sage einen englischen Satz — <strong>einmal, in normalem Tempo</strong>. '
        + 'Du schreibst, was angekommen ist. Noch einmal hören geht, es wird nur gezählt.'
      : 'Dieses Gerät hat <strong>keine englische Stimme</strong>. Statt zu hören '
        + 'übersetzt du deshalb — dieselben Sätze, nur aus dem Deutschen.';
  if (art === 'freunde')
    return 'Ein deutscher Satz, daneben derselbe auf <strong>Englisch</strong> — '
      + 'mit einer Lücke. Genau dort sitzt die Falle. Tippe hier eine an, '
      + 'dann siehst du sie ganz.';
  if (art === 'praeposition')
    /* Auch hier nennt der Satz die Falle vorher - und zwar die GATTUNG
       der Falle: es ist immer das deutsche Wort, das mituebersetzt wird.
       Wer das weiss, prueft beim Tippen nach; wer es nicht weiss, faellt
       jedes Mal auf dieselbe Art herein und lernt nur, dass er sich
       irrt. */
    return 'Ein deutscher Satz, daneben der englische — es fehlt genau '
      + '<strong>ein kleines Wort</strong>. Die Falle ist jedes Mal die '
      + 'wörtliche Übersetzung. Tippe hier eins an.';
  if (art === 'verben')
    /* Der Satz nennt die Falle beim Namen, und zwar VOR der ersten
       Aufgabe. Das ist bei dieser Ebene der halbe Lerninhalt: wer weiss,
       dass gleich „buyed" in der Luft liegt, greift beim Tippen einen
       Wimpernschlag lang nach. Genau dieser Wimpernschlag fehlt im
       Ernstfall. */
    return 'Ein deutscher Satz in der <strong>Vergangenheit</strong>, daneben '
      + 'derselbe auf Englisch — mit einer Lücke. Die Falle ist jedes Mal '
      + 'dieselbe: die regelmäßige Form auf <em>-ed</em>. Tippe hier eins an.';
  if (art === 'englisch')
    return englischHoerbar()
      ? 'Gleich sage ich dir ein Wort auf <strong>Englisch</strong>, und du '
        + 'tippst auf das richtige Bild. Tippe hier eins an, dann hörst du es schon mal.'
      : 'Dieses Gerät hat <strong>keine englische Stimme</strong>. Die Wörter '
        + 'stehen deshalb geschrieben da — hören kannst du sie hier nicht.';
  return 'Tippe auf ein Bild, dann sage ich dir, wie es heißt.';
}

/* Wohin „Zurück" fuehrt, entscheidet der AUFRUFER (Q20).
 *
 * Bis hierher stand `ebenenwahl` fest darin - und das war richtig,
 * solange der Vorlauf nur von dort kam. Seit das Auge auf dem Telefon
 * weggefallen ist (Q18), kommt er auch aus dem Forscherbuch, und dann
 * faellt „Zurück" in einen Bildschirm, den das Kind gar nicht verlassen
 * hat. */
/* Der Satz „Diese Karte fehlt noch" stand zweimal fast gleich da: einmal
 * im Vorlauf, einmal beim Starten (Regel 6). Das war nicht nur doppelte
 * Pflege - es war auch nicht mehr zu SAGEN, welche der beiden Stellen
 * eine Gegenprobe verstellt, weil beide Wachen bis aufs Zeichen gleich
 * lauteten. Jetzt gibt es einen Schirm und zwei unterscheidbare Wachen.
 */
function karteFehltSchirm(){
  const s = el('div');
  s.innerHTML = kopf({ links: zurueckKnopf() }) + `
    <div class="mitte"><div class="titel">Diese Karte fehlt noch</div>
    <div class="unter">Sie wird beim ersten Mal aus dem Netz geholt.
      Probier es noch einmal, wenn du wieder Verbindung hast.</div></div>`;
  s.querySelector('#zur').onclick = () => zeige(ebenenwahl);
  return s;
}

async function vorlauf(ebeneId, zurueck = null){
  const s = el('div');
  // Erst die Karte holen, DANN den Vorrat lesen.
  //
  // `teilen()` schneidet die Pfade aus dem Startbuendel heraus - ohne
  // `ebeneLaden` hat jedes Stueck ein leeres `pfad`, und der Vorlauf malte
  // sechzehn Kaesten mit dem Wort „undefined". `starten()` macht dasselbe
  // in derselben Reihenfolge; wer den Vorrat anfasst, muss vorher laden.
  if (!(await ebeneLaden(ebeneId))) return karteFehltSchirm();
  await standLaden(ebeneId);
  const ebene = EBENEN.find(e => e.id === ebeneId);
  const stuecke = vorlaufVorrat(ebeneId);
  const gitter = vorlaufGitter(stuecke.length);
  const satz = vorlaufSatz(ebeneId);
  // Der eigene Rahmen zeigt das Stueck gross; nur wenn er sich aus dem
  // Pfad nicht rechnen laesst, faellt es auf den Rahmen der ganzen Karte
  // zurueck - dieselbe Regel wie im Spielbildschirm.
  const ganzeKarte = vbVon(ebeneId);
  const rahmen = (x) => eigenerRahmen(x.pfad) || ganzeKarte;
  /* WAS ES ZU HOLEN GIBT - VOR DER RUNDE, nicht danach (I27).
   *
   * Ein Lohn, von dem man erst hinterher erfaehrt, ist eine
   * Ueberraschung. Ueberraschungen taugen zum Feiern und nicht zum
   * Ueben: sie geben keinen Grund, sich JETZT anzustrengen. Wer weiss,
   * dass eine fehlerfreie Runde einen Aufkleber bringt, hat einen.
   *
   * Gesagt wird es nur, wenn dort wirklich noch etwas liegt - ein
   * Versprechen ins Leere ist schlimmer als keines -, und nur den
   * Kindern: `ton().feier` ist derselbe Schalter, an dem auch Jubel,
   * Sterne und Figur haengen. Der Name des Tieres steht dabei, weil
   * „ein Aufkleber" nichts ist, was man sich vorstellen kann, und „der
   * Pudel" schon. */
  const lohnSatz = (() => {
    if (!ton().feier) return '';
    const holbar = Tiere.raumTiere(ebeneId, TierStand.ids);
    return holbar.length ? ` Ohne Fehler gibt es einen Aufkleber: ${holbar[0].name}.` : '';
  })();
  s.innerHTML = kopf({ links: zurueckKnopf(),
    mitte:`<span class="marke">${ebene ? ebene.titel : 'Anschauen'}</span>` }) + `
    <div class="rollen vorlauf">
      <div class="unter mitte-satz">${satz}${lohnSatz}</div>
      <div class="kleber${gitter.spalten > 8 ? ' viel' : ''}" style="--spalten:${
        gitter.spalten};--reihen:${gitter.reihen}">${stuecke.map((x, i) => `
        <button class="aufkleber da" data-lesen="${vorlaufAnsage(x, ebeneId)}"
                data-sprache="${x.sorte ? 'en' : 'de'}"
                title="${x.gebiet ? `${x.gebiet}: ${x.name}` : x.name}">
          ${stueckBild(x, `var(${FL[i%7]})`, rahmen(x))}
          <span>${stueckFuss(x)}</span>
          ${x.gebiet ? `<span class="dazu">${x.gebiet}</span>` : ''}
        </button>`).join('')}</div>
    </div>
    <div class="reihe vorlauffuss">
      <button class="knopf haupt" id="los">${ZEI('weiter', 22)}Jetzt starten</button>
    </div>`;
  s.querySelector('#zur').onclick = () => zeige(zurueck || ebenenwahl);
  ansagenBinden(s);
  s.querySelector('#los').onclick = () => {
    Einst.vorlaufGezeigt[vorlaufSchluessel(ebeneId)] = true;
    einstSichern();
    starten(ebeneId);
  };
  // Der Satz wird ANGESAGT, nicht nur hingeschrieben: Fiona liest nicht.
  // Die Namen selbst kommen beim Antippen - alle sechzehn am Stück
  // vorzulesen wäre ein Monolog, kein Blättern.
  ansagen(`${ebene ? ebene.titel : 'Anschauen'}. ${satz.replace(/<[^>]+>/g, '')} `
    + 'Wenn du fertig bist, tippe auf „Jetzt starten".');
  return s;
}

/** Was beim Antippen gesagt wird. Bei den Hauptstädten das PAAR. */
function vorlaufAnsage(x, ebeneId){
  // Der englische Gegenstand sagt SEIN Wort, und zwar auf Englisch. Ein
  // deutscher Rahmensatz drumherum („Das heißt blue.") liefe durch die
  // englische Stimme und klänge nach nichts.
  if (x.sorte) return x.wort;
  // Der falsche Freund wird DEUTSCH angesagt - der Satz ist die Aufgabe,
  // das englische Wort die Antwort.
  if (x.luecke) return `${x.satz} ${x.warum}`;
  // Wendung und Hoersatz: angesagt wird der DEUTSCHE Satz. Das englische
  // Wort im Vorlauf vorzusprechen waere bei E12 die halbe Antwort.
  if (x.deutsch) return x.deutsch;
  // Bei einem Buchstaben das Merkwort, bei einer Zahl ihr Zahlwort.
  if (x.zeichenFolge) return /[A-ZÄÖÜ]/.test(x.zeichen)
    ? `${x.zeichen} wie ${x.wort}.` : `Die ${x.wort}.`;
  if (x.gebiet) return `Die Hauptstadt von ${x.gebiet} ist ${x.name}.`;
  if (x.frage)  return `${x.frage} ist ${x.name}.`;
  return x.name;
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
  // Deutschland nur, wenn die Kennung KEINEN Kontinent nennt:
  // `hauptstaedte:europa` braucht Europa, nicht Deutschland.
  if (art==='bundeslaender' || art==='nachbarn' || (art==='hauptstaedte' && !kont)) {
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

  // Nur Karten-Ebenen holen eine Karte nach. `rechnen:plusminus` hat auch
  // etwas hinter dem Doppelpunkt - der erste Anlauf zog daraufhin
  // `daten/laender-plusminus.json`, bekam 404, und die Rechenebene ging
  // gar nicht mehr auf.
  /* `flaggen:karte` (F4) braucht dieselbe Karte wie `laender:europa` -
     sie steht in `KARTE_ZU`, nicht hinter dem Doppelpunkt. */
  const karte = karteVon(ebeneId);
  /* `groesser` holt dieselbe Karte wie `laender` (I22) - ohne diese
     Zeile stand die Ebene mit leeren Umrissen da, und der Bildschirm
     zeichnete acht unsichtbare Laender. */
  if ((art!=='laender' && art!=='hauptstaedte' && art!=='groesser'
       && ebeneId!=='flaggen:karte')
      || !karte || geholt.has(karte)) return true;
  try {
    const t = await (await fetch(`./daten/laender-${karte}.json`)).json();
    D.laender[karte] = t.laender; D.umgebung[karte] = t.umgebung; D.vbL[karte] = t.vbL;
    geholt.add(karte);
    return true;
  } catch(e){ return false; }
}

async function starten(ebeneId, alsTest = false){
  if (!(await ebeneLaden(ebeneId))) { zeige(karteFehltSchirm); return; }
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
  /* DER BOGEN (N3) - einmal, auf die fertige Liste. Beim Rechnen ist sie
     aus mehreren Sitzungen zusammengesetzt und danach gemischt; nur hier
     steht sie so da, wie das Kind sie spielen wird. */
  const listeMitBogen = Leitner.bogen(liste, Stand);
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
  /* Ein TEST fragt ALLES, einmal (B2).
   *
   * Nicht der Leitner: der waehlt nach Faelligkeit und wuerde ein Gebiet
   * zweimal bringen und ein anderes gar nicht. Ein Test, der nur die
   * wackeligen Gegenstaende abfragt, misst nicht, was jemand kann - er
   * misst, was der Leitner gerade fuer wackelig haelt. */
  const testListe = alsTest ? mischenMit(alle, keim) : null;
  /* Welche Abzeichen es VORHER schon gab (D2).
   *
   * Ohne diesen Griff waere ein neues Abzeichen am Ende nicht von einem
   * alten zu unterscheiden, und der Endbildschirm muesste entweder alle
   * aufzaehlen oder schweigen. Beides waere schade: der Moment, in dem
   * eines dazukommt, ist der einzige, in dem es sich lohnt, es zu sagen. */
  /* `neueKleber` haelt die KENNUNGEN, nicht die Gegenstaende.
     Der Gegenstand steht in `alle`, und zwar genau einmal - eine zweite
     Kopie waere eine zweite Wahrheit, sobald der Leitner ihn verschiebt. */
  /* `serie` und `besteSerie` (N1): wieviele Aufgaben AM STUECK auf Anhieb
     gesessen haben, und wieviele es im besten Lauf dieser Runde waren.
     Beides gehoert der Sitzung und nicht dem Kind - eine Serie ueber Tage
     waere eine andere Zusage und braucht die Ablage. */
  Sitzung = { ebeneId, alle, liste: testListe || listeMitBogen, i:0, glatt:0, wie:[],
              serie:0, besteSerie:0, neuSicher:[],
              aufkleber:0, neueKleber:[], keim, begonnen:Date.now(), test: alsTest,
              /* ZEITEN JE AUFGABE (I27) - fuer die Erwachsenen.
                 Gemessen wird von der vorigen Antwort bis zu dieser, das
                 Lob dazwischen also mitgezaehlt. Das ist bei jeder
                 Aufgabe gleich viel und faelscht deshalb keinen
                 Vergleich; die Alternative waere ein zweiter Zeitpunkt
                 in drei Bildschirmbauern, und drei Stellen fuer eine
                 Zahl sind zwei zuviel. */
              zeiten:[], aufgabeAb: Date.now(),
              abzVorher: new Set(verdiente(ebeneId, Stand).map(a => a.id)) };
  zeige(schirmZu(ebeneId));
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
 * meint nicht „nur die Stimme aus". Seit Q4 gibt es darunter einen
 * zweiten, kleineren - `Einst.klang`, ab Werk aus -, damit die App
 * vorlesen und trotzdem still sein kann.
 *
 * Aufgeloeste Aufgaben bleiben STUMM. „Weiss ich nicht" ist kein Fehler,
 * und die App sagt dazu schon „Kein Problem" - ein Geraeusch obendrauf
 * machte aus dem Ausweg eine Niederlage. Eine „fast" richtige Antwort
 * ebenso: sie bekommt eine Rueckfrage, keine Wertung.
 */
/* JEDE Antwort geht hier durch - auch die falsche, die keine Wertung
 * ausloest, weil das Kind es noch einmal versuchen darf. Genau deshalb
 * gehoert die Serie hierher und nicht in `werten`:
 *
 *   `werten` laeuft erst, wenn eine Aufgabe ERLEDIGT ist. Ein Fehlgriff,
 *   nach dem man es noch einmal probiert, kommt dort nie an - und die
 *   Serie blieb nach einem Danebengriff sichtbar stehen. Das Tor hat es
 *   gemeldet: „nach einem Fehler steht sie noch auf 3".
 *
 * DER MOMENT IST DER FEHLGRIFF, nicht das Ende der Aufgabe. Wer daneben
 * tippt, soll die Flamme in derselben Sekunde ausgehen sehen, in der er
 * es merkt - alles andere waere eine Buchhaltung und kein Spiel.
 *
 * Sechzehn Aufrufstellen, EIN Ort: die Serie an sechzehn Zweigen
 * nachzutragen ist genau die Sorte Pflege, die beim siebzehnten
 * Bildschirm vergessen wird.
 */
function klangZu(ergebnis){
  // Zwei Schalter, und beide muessen an sein: `tonAn` ist der grosse in
  /* Der Serienbruch steht VOR dem Ausstieg fuer den Ton. Stuende er
     dahinter, haette „Ton aus" die Serie unsterblich gemacht - eine
     Einstellung, die still eine Spielregel aendert. */
  if (ergebnis === 'falsch' && Sitzung && Sitzung.serie) { Sitzung.serie = 0; serieZeigen(); }
  // der Kopfzeile (aus heisst alles aus), `Einst.klang` der kleine im
  // Elternbereich, der ab Werk auf aus steht.
  if (hoertZu || !tonAn || !Einst.klang) return;
  if (ergebnis === 'richtig') Klang.richtig();
  else if (ergebnis === 'falsch') Klang.falsch();
}

function werten(ziel, ergebnis, versuch){
  const st = Sitzung;
  // Der richtige Ton fuer BEIDE Bildschirme, weil hier beide durchkommen.
  klangZu(ergebnis);
  // Gefragt wird, ob der Gegenstand seinen Aufkleber HIER BEKOMMT - also am
  // selben Mass, an dem das Buch ihn zeigt. Vorher stand hier das laufende
  // Fach, und weil das zurueckfaellt, meldete der Endbildschirm denselben
  // Aufkleber ein zweites und drittes Mal als "neu".
  const hatteVorher = Leitner.istGesammelt(Stand, ziel.id);
  const sicherVorher = Leitner.istGekonnt(Stand, ziel.id);
  Stand = Leitner.verschieben(Stand, ziel.id, ergebnis === 'richtig', Date.now());
  /* DIE SERIE. Sie haengt an derselben Bedingung wie `glatt` - auf Anhieb
     richtig - und steht deshalb genau hier und an keiner zweiten Stelle.
     Zwei Zaehler fuer dieselbe Sache an zwei Orten sind in diesem
     Verzeichnis schon einmal auseinandergelaufen (die Sternformel), und
     eine Serie, die der Kopf anders zaehlt als der Endbildschirm, ist
     schlimmer als keine.

     EIN FEHLER SETZT SIE AUF NULL, auch der zweite Versuch, der dann
     sitzt. Das ist die ganze Spannung: sie ist etwas wert, WEIL man sie
     verlieren kann. */
  if (ergebnis === 'richtig' && versuch === 1) {
    st.glatt++;
    st.serie++;
    if (st.serie > st.besteSerie) st.besteSerie = st.serie;
    st.zeiten.push((Date.now() - (st.aufgabeAb || st.begonnen)) / 1000);
  } else if (ergebnis === 'falsch' || versuch > 1) {
    st.serie = 0;
  }
  if (ergebnis === 'richtig') st.aufgabeAb = Date.now();
  /* UND DIE ANZEIGE GLEICH MIT, hier und nicht an den Aufrufstellen.
   *
   * `kopfNachziehenIn` steht an acht Orten - und im FALSCH-Zweig steht es
   * an keinem. Die Serie blieb deshalb nach einem Fehlgriff stehen: der
   * Zaehler war null, das Zeichen zeigte weiter eine Drei. Das Tor hat es
   * gemeldet, und die Lehre ist dieselbe wie beim Menue, das im Spiel
   * sichtbar blieb: kein Schalter, den man an acht Stellen umlegen muss,
   * sondern eine ABLEITUNG an der einen Stelle, an der die Sache
   * entschieden wird. Wer hier vorbeikommt, hat die Serie geaendert - also
   * wird sie hier auch gezeigt. */
  serieZeigen();
  st.wie[st.i] = (ergebnis === 'richtig' && versuch === 1) ? 'glatt' : 'geschafft';
  const neuerAufkleber = !hatteVorher && Leitner.istGesammelt(Stand, ziel.id);
  if (neuerAufkleber) { st.aufkleber++; st.neueKleber.push(ziel.id); }
  /* NEU SICHER (N4). Dieselbe Bauart wie der Aufkleber daneben - vorher
     gefragt, nachher gefragt, Unterschied gemerkt. Und aus demselben
     Grund: ohne das „vorher" waere jede weitere richtige Antwort auf
     denselben Gegenstand ein zweites „jetzt sitzt es".
     Fach 5 ist die Schwelle, weil `istGekonnt` sie setzt - dieselbe, an
     der das Buch „davon sicher" zaehlt, nicht eine zweite daneben. */
  if (!sicherVorher && Leitner.istGekonnt(Stand, ziel.id)) st.neuSicher.push(ziel.id);
  standSichern(st.ebeneId);
  return neuerAufkleber;
}

/* AB DREI, und die Zahl ist nicht beliebig.
 *
 * Bei zwei richtigen hintereinander ist noch nichts passiert - das kann
 * jedem unterlaufen, und ein Zeichen, das staendig da ist, sagt nichts.
 * Bei drei faengt es an, sich nach etwas anzufuehlen, und genau da soll
 * es AUFTAUCHEN: der Moment des Erscheinens ist die Belohnung, nicht die
 * Anzeige selbst.
 *
 * Sie steht EINMAL hier und wird von beiden Stellen gelesen, die sie
 * brauchen - dem Kopf und dem Endbildschirm. */
const SERIE_AB = 3;

/** Das Serienzeichen - Flamme und Zahl, oder nichts.
 *
 * `mitZahl` ist aus, wo die Zahl schon im SATZ daneben steht. Auf dem
 * Endbildschirm stand sonst „(Flamme) 4  4 am Stueck richtig!" - dieselbe
 * Vier zweimal nebeneinander, und das liest sich wie ein Fehler. Im Kopf
 * dagegen gibt es keinen Satz, dort IST die Zahl die Auskunft. */
const serieZeichen = (n, mitZahl = true) => n < SERIE_AB ? '<span class="serie leer"></span>'
  : `<span class="serie" aria-label="${n} richtige hintereinander">`
    + '<svg viewBox="0 0 24 24" aria-hidden="true">'
    /* `currentColor` und eine Klasse statt zweier Zahlen: die Farben
       stehen in `marken.css`, wie alle anderen auch. Ein Sechserwert im
       Quelltext waere der Ton, den der Abendmodus nicht mitnimmt. */
    + '<path fill="currentColor" d="M12 2c1 5-3 6-3 10a3 3 0 0 0 6 0c0-2-1-3-1-4 3 2 5 5 5 8a7 7 0 0 1-14 0c0-5 4-8 7-14Z"/>'
    + '<path class="kern" d="M12 12c1 2 2 3 2 5a2 2 0 0 1-4 0c0-2 1-3 2-5Z"/>'
    + '</svg>' + (mitZahl ? `<b>${n}</b>` : '') + '</span>';

/** Das Serienzeichen im sichtbaren Bildschirm auffrischen - von ueberall. */
function serieZeigen(){
  const s = document.querySelector('.schirm.da');
  const ser = s && s.querySelector('.serie');
  if (ser) ser.outerHTML = serieZeichen(Sitzung ? Sitzung.serie : 0);
}

/** Kopf nachziehen: Sterne, Fortschrittsband und Serie, auf jedem Bildschirm. */
function kopfNachziehenIn(s){
  const st = Sitzung;
  const st1 = s.querySelector('.sterne');
  if (st1) st1.outerHTML = sterne(sterneFuer(st.glatt, st.liste.length));
  const punkt = s.querySelectorAll('.band i')[st.i];
  if (punkt) punkt.className = st.wie[st.i] || 'weiter';
  /* Die Serie wird ERSETZT und nicht nur beschriftet: das neue Element
     startet damit seine Auftauch-Bewegung von vorn. Wer nur die Zahl
     tauscht, bekommt beim Sprung von drei auf vier keine Regung, und
     genau die ist gemeint. Derselbe Weg wie in `werten` - eine Funktion,
     nicht zwei Zeilen an zwei Orten. */
  serieZeigen();
}

/* DAS WIEDERSEHEN (N4).
 *
 * „Die kennst du schon - die kommt noch mal." Ein Pfeil im Kreis, kein
 * Wort: Fiona liest nicht, und ein Satz wie „diese Aufgabe war letztes
 * Mal falsch" waere ausserdem ein Vorwurf. Der Pfeil sagt dasselbe
 * freundlich - es ist eine WIEDERHOLUNG und keine Strafe.
 *
 * ER STEHT IM KOPF und nicht an der Frage, und das ist die ganze
 * Entscheidung dieser Runde: `aufgabenKopf` ist der eine Ort, den JEDE
 * Aufgabenart passiert. An der Frage haette er in acht Bildschirmen
 * nachgetragen werden muessen, und beim neunten haette ihn jemand
 * vergessen - so wie `kopfNachziehenIn` im Falsch-Zweig vergessen wurde. */
const wiederZeichen = (st) => {
  const ziel = st.liste[st.i];
  if (!ziel || !Leitner.kommtZurueck(Stand, ziel.id)) return '';
  return '<span class="wieder" aria-label="Die kennst du schon — die kommt noch einmal">'
    + '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor"'
    + ' d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z"/></svg></span>';
};

/** Der Kopf, den jede Aufgabe trägt - Band und Sterne aus einer Hand. */
/* --- PUNKTE FUER TEMPO (I27) ------------------------------------------
 *
 * „Es muss einen Vorteil bringen, wenn man Aufgaben schnell loest."
 * Bis hierher brachte es keinen: der Endbildschirm zaehlte richtige
 * Antworten, und ob sie nach drei oder nach dreissig Sekunden kamen,
 * stand nirgends.
 *
 * Zehn Punkte fuer jede Aufgabe, die AUF ANHIEB sass - das ist der
 * Boden, und er haengt am Koennen, nicht an der Hast. Dazu ein
 * Zuschlag, der mit der Zeit faellt: fuenf unter fuenf Sekunden, drei
 * unter zehn, einer unter zwanzig. Wer richtig UND schnell ist, bekommt
 * die Haelfte mehr; wer richtig und langsam ist, bekommt trotzdem seine
 * zehn. Raten wird nicht billiger: ein Fehlversuch kostet die zehn und
 * den Zuschlag gleich mit.
 *
 * Die Stufen sind grob und sollen es sein. Eine stetige Formel waere
 * genauer und im Kopf nicht nachzurechnen - und was man nicht
 * nachrechnen kann, spornt nicht an, es aergert nur. */
const PUNKT_BASIS = 10;
const TEMPO_STUFEN = [[5, 5], [10, 3], [20, 1]];
const tempoZuschlag = (sek) => {
  for (const [bis, punkte] of TEMPO_STUFEN) if (sek <= bis) return punkte;
  return 0;
};
const punkteFuer = (st) => {
  const basis = st.glatt * PUNKT_BASIS;
  const tempo = (st.zeiten || []).reduce((a, sek) => a + tempoZuschlag(sek), 0);
  return { basis, tempo, gesamt: basis + tempo };
};
/** m:ss - zweistellig, damit die Zahl beim Laufen nicht springt. */
const alsUhr = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
/* DIE UHR LAEUFT, sie wird nicht nachgezogen.
 *
 * Eine Zeit, die nur bei jeder Antwort weiterspringt, ist keine Zeit,
 * sondern ein Zaehler. Ein Intervall, das nachsieht, ob es die Anzeige
 * ueberhaupt gibt, kostet nichts, wenn es sie nicht gibt - und es muss
 * an keiner Stelle abgeschaltet werden, an der man es vergessen
 * koennte. Dieselbe Ueberlegung wie bei der Menueleiste: eine
 * Ableitung in jedem Takt statt eines Schalters an acht Orten.
 *
 * UNTER `?flott` STEHT SIE STILL. Die Bildtore vergleichen Aufnahmen
 * auf den Bildpunkt genau; eine Zahl, die zwischen zwei Laeufen
 * weiterlaeuft, macht jede von ihnen rot - und zwar zu Recht, ohne
 * dass etwas kaputt waere. `?flott` setzen nur die Tore. */
setInterval(() => {
  if (FLOTT) return;
  const u = document.querySelector('.schirm.da #uhr');
  if (u && Sitzung && Sitzung.begonnen) u.textContent = alsUhr(Date.now() - Sitzung.begonnen);
}, 1000);

const aufgabenKopf = (st) => kopf({
  links: schliessenKnopf('Übung beenden'),
  mitte:`<div class="bandreihe">${wiederZeichen(st)}<div class="band" aria-label="Aufgabe ${st.i+1} von ${st.liste.length}">${
    st.liste.map((_,i)=>`<i class="${
      i<st.i ? (st.wie[i]||'weiter') : i===st.i ? 'jetzt' : 'offen'}"${
      /* DIE KNACKNUSS im Band (N3). Das letzte Feld ist groesser und
         traegt einen Ring - ohne ein Wort, denn Fiona liest nicht. Man
         sieht von der ersten Aufgabe an, dass am Ende etwas wartet, und
         genau das ist der Bogen: ein Ende, auf das man zulaeuft.
         Erst ab vier Aufgaben, weil `bogen` darunter nicht gliedert -
         ein Ring, hinter dem keine Knacknuss steht, waere ein
         Versprechen, das die Runde nicht haelt.

         ALS MERKMAL UND NICHT ALS KLASSE: der Rauchtest liest die
         Klassen der Punkte, um den Stand der Runde zu zaehlen, und hat
         eine zusaetzliche Klasse als „schon erledigt" gelesen. Die
         Knacknuss ist kein ZUSTAND des Punktes, sondern eine Eigenschaft
         der Aufgabe dahinter - sie gehoert nicht in dieselbe Spalte. */
      (i === st.liste.length - 1 && st.liste.length >= 4) ? ' data-knack' : ''}></i>`).join('')
  }</div>${serieZeichen(st.serie)}</div>`,
  /* Die Uhr steht, wo bei den Kindern die Sterne stehen (I27).
     Nicht daneben: der Kopf hat drei Faecher, und ein viertes waere auf
     844 x 390 genau das, was `passt` seit je meldet. Die Erwachsenen
     bekommen keine Sterne - `sterneFuer` gibt ihnen ohnehin nichts,
     was sie lesen wollen -, sondern die laufende Zeit. */
  rechts: ton().feier
    ? sterne(sterneFuer(st.glatt, st.liste.length))
    : `<span class="uhr" id="uhr" aria-label="Zeit">${
        FLOTT ? '0:00' : alsUhr(Date.now() - st.begonnen)}</span>` });

/* ---------- Die Pause (R1) ----------------------------------------------
 *
 * Das Kreuz im Spiel fuehrte bis hierher wortlos zur Ebenenwahl. Es fuehrt
 * jetzt auf einen Bildschirm mit drei Wegen - und einer davon ist der, um
 * den der Nutzer gebeten hat: mitten in einer Runde alles auf null setzen.
 *
 * Warum ein ganzer Bildschirm und keine kleine Blase am Kreuz:
 *
 *   - Im Kopf ist kein Platz. Links das Kreuz, in der Mitte das
 *     Fortschrittsband, rechts die Sterne - auf dem iPhone quer ist die
 *     Zeile voll. Ein vierter Knopf haette eines der drei verdraengt.
 *   - Ein Kind, das nicht liest, braucht grosse Ziele. Diese Knoepfe sind
 *     so gross wie die auf dem Endbildschirm, und der ist der einzige
 *     andere Ort, an dem es etwas zu entscheiden gibt.
 *   - Und: neben dem Kreuz stuende sonst eine Taste, die eine Woche Uebung
 *     wegraeumt. Genau daneben. Der Umweg ueber diesen Bildschirm IST der
 *     Schutz.
 *
 * Zwei Tipper fuer das Loeschen, wie auf der Ebenenwahl: der erste sagt,
 * was verschwindet, der zweite tut es.
 */
function pauseSchirm(){
  const s = el('div');
  const ebene = EBENEN.find(e => e.id === Sitzung.ebeneId);
  const titel = ebene ? ebene.titel : 'diese Übung';
  s.innerHTML = kopf({}) + `
    <div class="mitte">
      <div class="titel">Pause</div>
      <div class="reihe siegwahl">
        <button class="knopf haupt" id="weiter">${ZEI('weiter', 22)}Weiterspielen</button>
        <button class="knopf" id="raus">${ZEI('kacheln', 22)}Übung beenden</button>
        <button class="knopf warnend" id="null">${ZEI('weg', 22)}Von vorne anfangen</button>
      </div>
      <div class="unter" id="was">Bei „von vorne" verschwindet alles, was du
        in <strong>${titel}</strong> schon gesammelt hast.</div>
    </div>`;
  s.querySelector('#weiter').onclick = () => zeige(schirmZu(Sitzung.ebeneId));
  s.querySelector('#raus').onclick = () => zeige(ebenenwahl);
  const knopf = s.querySelector('#null');
  knopf.onclick = async () => {
    if (knopf.dataset.sicher !== 'ja') {
      knopf.dataset.sicher = 'ja';
      /* `innerHTML` und nicht `textContent`: seit Q34 traegt der Knopf ein
         Zeichen, und `textContent` haette es beim Umbenennen mit
         weggeworfen - ausgerechnet auf dem Schritt, auf dem es am meisten
         zaehlt. */
      knopf.innerHTML = ZEI('weg', 22) + 'Wirklich löschen?';
      s.querySelector('#was').textContent =
        `Alle Häkchen in ${titel} sind dann weg, und es geht bei der ersten Aufgabe los.`;
      sagen(`Soll ${titel} wirklich von vorne losgehen?`);
      return;
    }
    // Der Fortschritt liegt in der Ablage, die Haekchen haengen am
    // Leitner-Stand. Beides gehoert weg - und `Stand = {}` ist nicht
    // Kosmetik: `starten()` liest ihn gleich wieder, und ohne das Leeren
    // begaenne die neue Runde mit den alten Faechern.
    await Ablage.loesche('fortschritt', `${P.id}:${Sitzung.ebeneId}`).catch(()=>{});
    Stand = {};
    sagen(`${titel} fängt wieder von vorne an.`);
    starten(Sitzung.ebeneId);
  };
  ansagen('Pause. Weiterspielen, Übung beenden, oder von vorne anfangen?');
  return s;
}

/**
 * Der Satz nach der Antwort. Auch der steht an EINER Stelle.
 *
 * Das Lob kommt zuerst und steht für sich. Die Sache danach - der Name oder
 * die Rechnung - ist das, was gelernt wird, nicht der Applaus.
 */
/* Der Aufkleber wird GEZEIGT, nicht angekuendigt (Q28).
 *
 * Hier stand die Zeile „Neuer Aufkleber!" - ein Wort ueber ein Bild, das
 * nirgends zu sehen war. Fiona liest nicht; fuer sie war das nichts.
 * Jetzt klebt der Aufkleber selbst da, und das Wort steht darunter. */
const letzterKleber = () => {
  const st = Sitzung;
  if (!st || !st.neueKleber.length) return '';
  const id = st.neueKleber[st.neueKleber.length - 1];
  const i = st.alle.findIndex(x => x.id === id);
  return i < 0 ? '' : kleberBild(st.alle[i], i, st.ebeneId);
};

/* ---------- Die Figur (N9) -----------------------------------------------
 *
 * Befund G3, und er ist der einzige des Grafik-Audits, der die Nachpruefung
 * am Quelltext unbeschadet ueberstanden hat: NULL Treffer fuer eine Figur
 * im ganzen Verzeichnis. Es ist niemand da. Fuer ein sechsjaehriges Kind
 * ist das der groesste Einzelmangel der Oberflaeche - es gibt niemanden,
 * der sich mitfreut und niemanden, dem man etwas zeigt.
 *
 * SIE STEHT NICHT STAENDIG DA, und das ist eine Entscheidung gegen den
 * ersten Entwurf. Eine Figur am Rand des Aufgabenbildschirms haette auf
 * 844 x 390 entweder die Karte verdeckt oder den Mikrofonknopf - und eine
 * Bedienflaeche zu verdecken ist teurer als eine Figur wert ist. Sie
 * kommt DORT, wo sie zaehlt: im Augenblick der Rueckmeldung und auf dem
 * Endbildschirm. Ein Begleiter, der nur dann auftaucht, wenn etwas
 * passiert, ist ausserdem mehr wert als einer, der immer herumsteht.
 *
 * IM STIL DER WORTBILDER: flaechig, zwei Toene je Farbe, keine
 * Umrisslinien, Licht von oben links. Das ist der Stilanker, den das
 * Grafik-Audit benannt hat - ein zweiter Stil daneben waere genau der
 * Bruch, den es vermeiden soll.
 *
 * DREI STIMMUNGEN, mehr nicht. Der Unterschied liegt im MUND und in den
 * Augen, nicht im Koerper: wer die Figur zweimal neu zeichnet, hat zwei
 * Figuren. */
const FIGUR = {
  freut:  { mund: 'M24 40c3 4 9 4 12 0', auge: 3.2, braue: '' },
  staunt: { mund: 'M30 41a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', auge: 3.6,
            braue: 'M20 23h7M33 23h7' },
  feiert: { mund: 'M22 38c4 7 12 7 16 0Z', auge: 3.2, braue: '' },
};
const figur = (stimmung = 'freut', groesse = 44) => {
  const f = FIGUR[stimmung] || FIGUR.freut;
  return `<svg class="figur figur-${stimmung}" width="${groesse}" height="${groesse}"`
    + ' viewBox="0 0 60 60" aria-hidden="true">'
    /* Der Koerper: eine Flaeche, ein Ton, ein dunkler Rand unten - so
       bekommt er Volumen ohne Verlauf und ohne Filter (die Safari-Falle
       aus dem Schwesterprojekt gilt hier genauso). */
    + '<path class="k2" d="M30 6c13 0 22 9 22 22s-9 26-22 26S8 46 8 28 17 6 30 6Z"/>'
    + '<path class="k1" d="M30 6c11 0 19 7 21 18-3 9-11 15-21 15s-18-6-21-15C11 13 19 6 30 6Z"/>'
    + `<circle class="a" cx="23" cy="31" r="${f.auge}"/>`
    + `<circle class="a" cx="37" cy="31" r="${f.auge}"/>`
    + (f.braue ? `<path class="a" d="${f.braue}" stroke-width="2" fill="none" stroke="currentColor"/>` : '')
    + `<path class="a" d="${f.mund}" ${stimmung === 'staunt' ? '' : 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"'}/>`
    + '</svg>';
};

function lobsatz(s, sache, fastText, spruch, nebenbei, neuerAufkleber){
  const frage = s.querySelector('#frage');
  if (!frage) return;
  /* Die Figur nur bei den Kinderprofilen - derselbe Schalter wie beim
     Jubel. Ein Begleiter, der Stephan beim Nachtragen zusieht, waere
     Zierde; bei Fiona ist er der Grund, es noch einmal zu machen. */
  /* 32 Punkte, nicht 44: so hoch wie die Lobzeile selbst. Groesser
     waere die Figur der Grund, aus dem die Karte darunter springt -
     gemessen, nicht befuerchtet. */
  const wer = ton().feier ? figur(fastText ? 'staunt' : 'freut', 32) : '';
  frage.innerHTML = fastText
    ? `<span class="fastText">${wer}${fastText}</span>`
    : `<span class="richtigText${ton().feier ? ' feier' : ''}"><b class="jubel">${
        wer}${spruch || 'Richtig!'}</b> ${sache}</span>`
      + (neuerAufkleber ? `<span class="neuerkleber">${letzterKleber()}<b>${
          /* Auch GESCHRIEBEN im Ton des Profils: derselbe Satz, dieselbe
             Quelle. Ein Ausrufezeichen auf dem Schirm und keines in der
             Ansage waere zweierlei Mass fuer dieselbe Nachricht. */
          ton().kleberSagt.trim()}</b></span>` : '')
      + (nebenbei ? `<span class="nebenbei">${nebenbei}</span>` : '');
}

/* Ein Eintrag ins Protokoll - EINE Stelle fuer alle drei
 * Aufgabenbildschirme.
 *
 * Bis E3 stand dieser Block dreimal fast gleich da: im Rechenschirm, im
 * Schreibschirm und - frisch abgeschrieben - im Englischschirm.
 * Unterschiedlich war EINE Zeile, die Eingabeart. Gefunden hat es `doppelt`
 * beim dritten Mal, und das ist genau der Zeitpunkt, an dem es sich noch
 * billig aufloesen laesst: bei vier Kopien pflegt man drei und vergisst
 * eine, und das Protokoll ist die Datei, an der man es zuletzt merkt -
 * sie wird erst im Elternbereich gelesen, Wochen spaeter.
 *
 * `versuch` und `beginn` kommen mit, statt aus einem Abschluss zu
 * stammen: sie gehoeren zur Aufgabe, nicht zum Bildschirm. */
/* Die abgelehnte Antwort wackelt.
 *
 * Der Neustart der Bewegung braucht die Zeile in der Mitte: `remove`,
 * einen Lesezugriff auf `offsetWidth`, dann `add`. Ohne den Lesezugriff
 * fasst der Browser beide Aenderungen zu einer zusammen, und beim zweiten
 * Fehlversuch in Folge passiert gar nichts.
 *
 * Genau das ist der Grund, warum diese sechs Zeilen EINMAL dastehen und
 * nicht je Bildschirm: es ist keine Bewegung, sondern ein Kniff, und ein
 * Kniff, den man an zwei Stellen pflegt, ist an einer davon bald weg. */
const wackelt = (k) => {
  if (!k) return;
  k.classList.remove('falsch'); void k.offsetWidth;
  k.classList.add('falsch');
  setTimeout(() => k.classList.remove('falsch'), 900);
};

/** Zur naechsten Aufgabe - oder zum Ende. Auch das stand dreimal da. */
const weiterIn = (st) => {
  st.i++;
  if (st.i >= st.liste.length) zeige(endschirm);
  else zeige(schirmZu(st.ebeneId));
};

function eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn, eingabeart }){
  Protokoll.schreiben(Protokoll.eintrag({
    zeit: Date.now(), profil: P.id, ebene: st.ebeneId, gebietId: ziel.id,
    eingabeart,
    ergebnis, roheingabe: String(roh), sicherheit: null,
    dauerMs: Date.now()-beginn, versuch,
    fachVorher, fachNachher: Stand[ziel.id]?.fach ?? fachVorher,
  }));
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
/* DER AUSWEG KOSTET UND GIBT ETWAS (S12).
 *
 * „Weiß ich nicht" ist richtig - ein Kind muss aussteigen duerfen. Nur
 * kostete der Knopf nichts und brachte nichts: ein Druck, die Loesung
 * steht da, weiter. Wer ihn zweimal gedrueckt hat, druckt ihn beim
 * dritten Mal, bevor er die Frage gelesen hat.
 *
 * Jetzt hat er zwei Stufen. Der erste Druck nimmt falsche Antworten
 * WEG - das ist der Tipp, und er kostet: die Aufgabe zaehlt danach
 * nicht mehr als „auf Anhieb". Der zweite loest auf wie bisher.
 *
 * OHNE EIN WORT verstanden: es sind einfach weniger. Fiona ist sechs
 * und liest nicht; „Tipp" auf einem Knopf waere fuer sie ein Muster.
 *
 * UND ER STAND NEUNMAL DA. Neun Bildschirme, neunmal dasselbe Markup,
 * neunmal dieselbe Verdrahtung (Regel 6). Jetzt einmal - wer einen
 * zehnten Aufgabenschirm baut, bekommt den Ausweg mit, ohne daran zu
 * denken.
 */
const WEISSNICHT_KNOPF = `<button class="leise" id="weissnicht" data-stufe="tipp"
  >${ZEI('frage', 20)}Weiß ich nicht</button>`;
/* Acht Bildschirme stellen den Knopf allein in seine Leiste, der
   Schreibschirm haengt ihn neben „Fertig" und „Noch mal". Deshalb zwei
   Marken und nicht zwei Knoepfe: die Leiste ist verschieden, der Knopf
   ist derselbe. */
const WEISSNICHT = `<div class="werkzeug">${WEISSNICHT_KNOPF}</div>`;

/** Der Tipp: falsche Antworten verschwinden - hoechstens die Haelfte.
 *
 * Gibt zurueck, ob wirklich etwas weggefallen ist. Bei zwei Antworten
 * faellt nichts weg: „eine wegnehmen" waere dort die Loesung und kein
 * Tipp. Das entscheidet die Rechnung und kein Bildschirm einzeln -
 * sonst muesste jeder neue Schirm daran denken.
 */
function tippWegnehmen(s, wahl, istRichtig){
  const alle = [...s.querySelectorAll(wahl)]
    .filter(x => !x.disabled && !x.classList.contains('weg'));
  const falsch = alle.filter(x => !istRichtig(x));
  /* WIEVIELE, rechnet `Tipp.tippMenge` - und zwar dort, weil es eine
     Regel ist und kein Bildschirm. Sie gilt an fuenf Auswahlschirmen
     gleich, und ohne Browser laesst sie sich nachrechnen: `spielprobe`
     tut das an sechs Faellen. */
  const nehmen = Tipp.tippMenge(falsch.length);
  if (nehmen < 1) return false;
  /* Weggenommen wird von HINTEN, nicht gewuerfelt: zweimal derselbe
     Bildschirm soll zweimal dasselbe tun, sonst ist der Tipp ein
     Glueckspiel und der Rauchtest misst Rauschen. */
  falsch.slice(-nehmen).forEach(x => {
    x.classList.add('weg'); x.disabled = true; });
  return true;
}

/** Den Ausweg verdrahten - EINE Stelle fuer neun Bildschirme.
 *
 * `tipp` ist wahlfrei: wo es nichts wegzunehmen gibt (ein Tippfeld, ein
 * freies Schreibfeld, ein Wort zum Legen), loest der Knopf sofort auf.
 * Das ist ehrlicher als eine erste Stufe, die nichts tut - ein Knopf,
 * der beim ersten Druck nichts macht, ist ein kaputter Knopf.
 */
function ausweg(s, aufloesen, tipp){
  const k = s.querySelector('#weissnicht'); if (!k) return;
  k.onclick = () => {
    if (k.dataset.stufe === 'tipp' && tipp && tipp()) {
      k.dataset.stufe = 'loesung';
      k.innerHTML = ZEI('auge', 20) + 'Zeig es mir';
      sagen('Ich nehme welche weg. Probier noch einmal.');
      return;
    }
    aufloesen();
  };
}

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
      ${WEISSNICHT}
    </div>`;

  const luecke = s.querySelector('#luecke');
  const rein = s.querySelector('#rein');
  const ausschalten = ()=>{
    s.querySelectorAll('.zahl').forEach(z=>z.disabled=true);
    if (rein) { rein.disabled = true; s.querySelector('#pruef').disabled = true; }
  };

  const protokollieren = (ergebnis, roh, fachVorher) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn,
      eingabeart: weise==='tippen' ? 'tippen' : 'antippen' });

  const weiter = () => weiterIn(st);

  function aufloesen(grund){
    if (erledigt) return;
    erledigt = beendet(s);
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
    sagen(`Kein Problem. ${ziel.geloest}.`);
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  /** Das Geschriebene zu einer Zahl — oder zu nichts. */
  function gelesen(roh){
    const t = String(roh).trim().replace(/\s/g, '');
    if (!/^-?\d+$/.test(t)) return null;
    return +t;
  }



  function bewerte(zahl, knopf){
    if (erledigt) return;
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (zahl === ziel.wert) {
      erledigt = beendet(s);
      const neuerAufkleber = werten(ziel, 'richtig', versuch);
      kopfNachziehenIn(s);
      protokollieren('richtig', zahl, fachVorher);
      ausschalten();
      luecke.textContent = ziel.wert; luecke.classList.add('gefuellt');
      if (knopf) knopf.classList.add('stimmt');
      const spruch = lob();
      lobsatz(s, `${ziel.frage} = ${ziel.wert}.`, null, spruch, '', neuerAufkleber);
      sagen(`${spruch} ${ziel.geloest}.` + kleberSatz(neuerAufkleber));
      setTimeout(weiter, LOBPAUSE);
      return;
    }
    protokollieren('falsch', zahl, fachVorher);
    klangZu('falsch');
    if (versuch >= 3) return aufloesen('dreimal');
    // Die Zahl sagt selbst, dass sie abgelehnt wurde - wie das Etikett auf
    // der Karte. Ein Satz allein reicht einer Sechsjährigen nicht.
    wackelt(knopf);
    const f = s.querySelector('#frage');
    const satz = 'Nicht ganz — probier es noch einmal.';
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    sagen(satz);
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
      if (z === null) { wackelt(rein); rein.focus(); return; }
      bewerte(z, rein);
      rein.value = '';
    };
    s.querySelector('#pruef').onclick = pruefen;
    rein.addEventListener('keydown', e=>{ if (e.key==='Enter') pruefen(); });
    if (weise==='tippen') setTimeout(()=>rein.focus(), 360);
  }

  ausweg(s, () => aufloesen('aufgegeben'),
    () => tippWegnehmen(s, '#auswahl .zahl', x => +x.dataset.zahl === ziel.wert));
  s.querySelector('#zur').onclick = ()=> zeige(pauseSchirm);

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
  const ansageText = weise==='tippen' ? ziel.gesagt
    : `${ziel.gesagt} ${aufzaehlen(zahlen.map(z=>Rechnen.gesprochen(z)))}?`;
  ansagen(ansageText);
  /* Auch hier - und hier braucht es ihn am meisten: auf der Karte steht
     die Frage wenigstens noch als Bild da, eine Rechenaufgabe mit vier
     gesprochenen Moeglichkeiten ist ohne Ton weg. */
  nochHoerenIns(s, ansageText);
  return s;
}

/* ---------- Der Englischbildschirm (E3) ---------------------------------
 *
 * „Hoeren und zeigen": die App sagt ein englisches Wort, vier Bilder stehen
 * da, das Kind tippt. Es ist die Ebene-4-Aufgabe aus Erdkunde - vier
 * Moeglichkeiten, eine richtig -, nur dass die Frage nicht dasteht,
 * sondern GESAGT wird.
 *
 * DIE FRAGE IST DER TON, und daraus folgt alles Weitere:
 *
 *   Das Wort wird mit `vorlesen(..., 'en')` gesagt, nicht mit `sagen` oder
 *   `ansagen`. Beide fragen das Profil - `ansagen` nach `P.vorlesen`
 *   („lies mir die Aufgabe vor, ich kann noch nicht lesen"), `sagen` nach
 *   dem Ton. Hier ist das falsch: Lea traegt `vorlesen: false` und
 *   bekaeme damit vier Bilder ohne Frage. Ein Vorlesehelfer ist
 *   abschaltbar, eine Aufgabe nicht.
 *
 *   Findet das Geraet KEINE englische Stimme, ist die Ebene sonst stumm -
 *   fuer Fiona also gar keine Aufgabe. Dann steht das Wort geschrieben da,
 *   und das ist eine ehrliche Notloesung: Lea kann weiterspielen, Fiona
 *   nicht. Der Elternbereich sagt seit E2, ob das Geraet eine Stimme hat.
 *   Verschwiegen wird es nirgends.
 *
 * Die drei Ablenker kommen aus DERSELBEN Sorte (`Englisch.ablenkerFuer`).
 * Stuenden neben einem Farbfleck drei Ziffern, waere die Aufgabe ohne ein
 * Wort Englisch zu loesen.
 */
/* ---------- Wendungen (E11) und Hoeren und schreiben (E12) --------------
 *
 * EIN Bildschirm, zwei Ebenen - dieselbe Ueberlegung wie beim
 * Schreibschirm, der vier traegt. Was sie unterscheidet, ist eine
 * Eigenschaft der AUFGABE und nicht des Bildschirms:
 *
 *   `ziel.deutsch` steht da      die Wendung: deutsch lesen, englisch tippen
 *   `ziel.satzEn` wird gesagt    der Hoersatz: englisch hoeren, englisch tippen
 *
 * Beide vergleichen einen GANZEN SATZ gegen eine MENGE zugelassener
 * Antworten. Eine einzige zuzulassen hiesse Auswendiglernen zu pruefen
 * statt Koennen - „Could we have the bill" ist genauso richtig wie
 * „Could we get the bill".
 *
 * DAS ZWEITE HOEREN WIRD GEZAEHLT, NICHT BESTRAFT. Es kostet keinen
 * Versuch und keinen Stern; die Zahl steht im Elternbereich. Eine Zahl,
 * die man sieht, wirkt ohne Strafe - und sie ist das Einzige, was hier
 * ueberhaupt misst, wie gut das Hoeren wirklich ist.
 */
function satzschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;
  /* `gehoert` entscheidet, welche der beiden Ebenen hier laeuft - und es
     haengt an ZWEI Dingen: ob der Gegenstand einen englischen Satz zum
     Hoeren mitbringt (E12) und ob dieses Geraet ihn ueberhaupt sagen kann.
     Ohne englische Stimme faellt „Hoeren und schreiben" auf die Frage von
     E11 zurueck - derselbe Satz, aus dem Deutschen. Den englischen Satz
     hinzuschreiben waere die Antwort; geprueft wuerde Abschreiben. */
  const gehoert = !!ziel.satzEn && englischHoerbar();

  const protokollieren = (ergebnis, roh, fachVorher) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn,
      eingabeart: 'tippen' });
  const weiter = () => weiterIn(st);

  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">${gehoert
      ? 'Schreib auf, was du hörst.'
      : 'Wie sagt man das auf Englisch?'}</div>
    <div class="satzfeld">
      ${gehoert ? '' : `<div class="satzdeutsch">${ziel.deutsch}</div>`}
      <input class="eingabe satz-eingabe" id="rein" inputmode="text" lang="en"
             autocomplete="off" autocorrect="off" autocapitalize="off"
             spellcheck="false" aria-label="der englische Satz">
      <div class="tippfeld"><button class="knopf haupt" id="pruef">Prüfen</button></div>
      ${WEISSNICHT}
    </div>`;

  const rein = s.querySelector('#rein');
  const ausschalten = () => { rein.disabled = true;
    s.querySelectorAll('#pruef, #nochhoeren').forEach(k => k.disabled = true); };

  /* Der Satz wird gesagt, sobald der Bildschirm steht - und danach nur auf
     Wunsch. `vorlesen` und nicht `ansagen`: der Satz IST die Aufgabe, und
     Stephan traegt `vorlesen: false`. Dieselbe Stelle wie bei E3. */
  if (gehoert) vorlesen(ziel.satzEn, 'en');

  function aufloesen(){
    if (erledigt) return;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', '', fachVorher);
    ausschalten();
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="loesung">Kein Problem: `
      + `<strong lang="en">${ziel.richtig[0]}</strong></span>`;
    sagen('Kein Problem.');
    if (gehoert) vorlesen(ziel.richtig[0], 'en');
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  function bewerte(roh){
    if (erledigt) return;
    const eingabe = Englisch.wieGesagt(roh);
    if (!eingabe) { wackelt(rein); rein.focus(); return; }
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    /* Getroffen wird auf der NORMALFORM verglichen, gezeigt wird die
       aufgeschriebene Fassung - nicht die getippte.
       Der erste Anlauf zeigte `roh`, also genau das, was eingetippt war.
       Wer den Satz in Grossbuchstaben und ohne Punkt tippt, bekam ihn so
       zurueck und als „Stimmt." bestaetigt; die einzige Stelle, an der
       ueberhaupt die richtige Schreibung zu sehen ist, zeigte damit die
       eigene. */
    const getroffen = ziel.richtig.find(r => Englisch.wieGesagt(r) === eingabe);
    if (getroffen) {
      erledigt = beendet(s);
      const neuerAufkleber = werten(ziel, 'richtig', versuch);
      kopfNachziehenIn(s);
      protokollieren('richtig', roh, fachVorher);
      ausschalten();
      const spruch = lob();
      /* Was der Nebensatz sagt, haengt daran, was die Aufgabe NICHT
         geprueft hat - und das ist bei den beiden Ebenen jeweils das
         andere:
           Wendungen  Der Sinn war gegeben, offen bleibt die Vielfalt.
                      Also eine zweite gueltige Fassung; genau das ist
                      der Inhalt dieser Ebene - es gibt nicht die eine
                      richtige Antwort.
           Hoeren     Die Fassung stand nie zur Wahl, der Sinn schon.
                      Also die Bedeutung: wer einen Satz richtig
                      aufschreibt, den er nicht verstanden hat, hat
                      gehoert und nicht gelernt. */
      const andere = ziel.richtig.find(r => Englisch.wieGesagt(r) !== eingabe);
      const nebenbei = gehoert
        ? `Auf Deutsch: ${ziel.deutsch}`
        : (andere ? `Geht auch: <span lang="en">${andere}</span>` : '');
      lobsatz(s, `<strong lang="en">${getroffen}</strong>`, null, spruch,
        nebenbei, neuerAufkleber);
      sagen(spruch);
      setTimeout(weiter, LOBPAUSE);
      return;
    }
    protokollieren('falsch', roh, fachVorher);
    klangZu('falsch');
    if (versuch >= 3) return aufloesen();
    wackelt(rein);
    const f = s.querySelector('#frage');
    const satz = gehoert ? 'Noch nicht ganz — hör es dir noch einmal an.'
                         : 'Noch nicht ganz — anders herum probieren.';
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    sagen(satz);
    rein.select();
  }

  const pruefen = () => bewerte(rein.value);
  s.querySelector('#pruef').onclick = pruefen;
  rein.addEventListener('keydown', e => { if (e.key === 'Enter') pruefen(); });
  ausweg(s, aufloesen);
  s.querySelector('#zur').onclick = () => zeige(pauseSchirm);
  setTimeout(() => rein.focus(), 360);

  /* „Noch einmal hören" - derselbe Knopf wie ueberall, nur mit dem
     dritten Beweggrund: hier wird er GEZAEHLT (Regel 6 - er stand hier
     einmal eigenhaendig nachgebaut, mit eigener Kennung und eigenem
     Beschriftungstext). Der Vorlauf verspricht ihn ausdruecklich. */
  const b = gehoert ? nochHoerenKnopf(ziel.satzEn, 'en', true) : null;
  if (b) s.querySelector('.werkzeug').appendChild(b);
  if (!gehoert) ansagen(ziel.deutsch);
  return s;
}

/* ---------- Falsche Freunde (E10) ---------------------------------------
 *
 * Ein deutscher Satz mit einer Falle, daneben derselbe Satz auf Englisch -
 * mit einer Luecke genau an der Falle. Getippt wird das eine Wort.
 *
 * WARUM GETIPPT UND NICHT AUSGEWAEHLT, obwohl das Konzept „zwei Fassungen,
 * welche stimmt?" beschreibt: die Profiltabelle sagt fuer Stephan und
 * Violeta „Auswahl statt Tippen: NIE", und Tor E-f prueft das. Beides
 * zusammen geht nicht, und die Tabelle ist die Referenz. Die ganze
 * Begruendung steht bei `FREUNDE` in `src/inhalt/englisch.js` - kurz: eine
 * Auswahl aus zweien laesst sich zur Haelfte erraten, und was man ERKENNT,
 * kann man noch lange nicht sagen.
 *
 * DIE FALLE WIRD ERKANNT, NICHT ANGEBOTEN. Wer sie tippt, bekommt genau
 * dort die Auskunft, was das Wort wirklich heisst - und dieser Fehlversuch
 * zaehlt wie jeder andere. Er wird nicht bestraft und nicht geschenkt.
 */
/* Die Frage ueber der Luecke - je Ebene eine andere (I8).
 *
 * Beide Ebenen teilen sich diesen Bildschirm, aber nicht die Aufgabe: bei
 * den falschen Freunden ist der ganze SATZ zu uebersetzen und die Luecke
 * nur die Stelle, an der es schiefgeht. Bei den Verben steht der Satz
 * schon da; gesucht ist EINE Form. „Wie heißt der Satz auf Englisch?"
 * ueber „He ___ me his number." waere dort schlicht falsch - der Satz
 * steht ja bereits auf Englisch.
 */
/* Welche Ebenen ein SCHMALES Lueckenfeld bekommen.
 *
 * Die Breite ist je Ebene fest und verraet deshalb nichts - aber sie muss
 * zur laengsten Antwort DIESER Ebene passen. Bei den Praepositionen ist
 * das „about" mit fuenf Zeichen; mit den fuenfzehn der falschen Freunde
 * zerriss der Satz auf dem Zielgeraet in zwei Zeilen. */
const SCHMAL_LUECKE = new Set(['praeposition']);

const FRAGE_LUECKE = {
  freunde: 'Wie heißt der Satz auf Englisch?',
  verben:  'Wie heißt das Verb in der Vergangenheit?',
  praeposition: 'Welches kleine Wort fehlt?',
};

function freundeschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;

  const protokollieren = (ergebnis, roh, fachVorher) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn,
      eingabeart: 'tippen' });
  const weiter = () => weiterIn(st);

  /* Die Luecke wird zum Eingabefeld - an der Stelle, an der das Wort
     fehlt, und nicht darunter. Ein Feld unter dem Satz waere ein Formular;
     hier soll man den Satz LESEN und die Luecke fuellen. */
  const satzMitFeld = ziel.luecke.replace('___',
    '<input class="eingabe wort-eingabe" id="rein" inputmode="text" '
    + 'autocomplete="off" autocorrect="off" autocapitalize="off" '
    + 'spellcheck="false" lang="en" aria-label="das fehlende Wort">');

  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">${FRAGE_LUECKE[ebeneArt(st.ebeneId)]
      || FRAGE_LUECKE.freunde}</div>
    <div class="freundefeld">
      <div class="freundsatz">${ziel.satz}</div>
      <div class="freundluecke${SCHMAL_LUECKE.has(ebeneArt(st.ebeneId)) ? ' eng' : ''}"
           lang="en">${satzMitFeld}</div>
      <div class="tippfeld"><button class="knopf haupt" id="pruef">Prüfen</button></div>
      ${WEISSNICHT}
    </div>`;

  const rein = s.querySelector('#rein');
  const ausschalten = () => { rein.disabled = true;
    s.querySelector('#pruef').disabled = true; };
  /* Die Luecke gefuellt zeigen - beim Loesen wie beim Aufgeben. Ohne das
     bliebe der Satz unvollstaendig stehen, und man saehe nie, wie er
     richtig heisst. */
  const fuellen = (wort) => {
    const l = s.querySelector('.freundluecke');
    if (l) l.innerHTML = ziel.luecke.replace('___',
      `<span class="luecke gefuellt">${wort}</span>`);
  };

  function aufloesen(){
    if (erledigt) return;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', '', fachVorher);
    ausschalten();
    fuellen(ziel.richtig[0]);
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="loesung">Kein Problem: `
      + `<strong lang="en">${ziel.richtig[0]}</strong>. ${ziel.warum}</span>`;
    sagen(`Kein Problem. ${ziel.warum}`);
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  function bewerte(roh){
    if (erledigt) return;
    const eingabe = Englisch.wieGetippt(roh);
    // Leer ist KEIN Fehlversuch - wie beim Rechnen. Wer auf „Prüfen"
    // tippt, ohne etwas geschrieben zu haben, hat sich nicht geirrt.
    if (!eingabe) { wackelt(rein); rein.focus(); return; }
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (ziel.richtig.some(r => Englisch.wieGetippt(r) === eingabe)) {
      erledigt = beendet(s);
      const neuerAufkleber = werten(ziel, 'richtig', versuch);
      kopfNachziehenIn(s);
      protokollieren('richtig', roh, fachVorher);
      ausschalten();
      fuellen(eingabe);
      const spruch = lob();
      /* Der Grund steht AUCH beim richtigen Treffer da, als Nebensatz.
         Wer „got" auf Anhieb tippt, weiss deshalb noch nicht, warum
         `become` daneben liegt - und das ist der Inhalt dieser Ebene. */
      lobsatz(s, `<strong lang="en">${ziel.richtig[0]}</strong>.`, null, spruch,
        ziel.warum, neuerAufkleber);
      sagen(`${spruch} ${ziel.warum}`);
      setTimeout(weiter, LOBPAUSE);
      return;
    }
    protokollieren('falsch', roh, fachVorher);
    klangZu('falsch');
    if (versuch >= 3) return aufloesen();
    wackelt(rein);
    /* IN DIE FALLE GETIPPT - der Augenblick, um den es geht.
       Sie bekommt einen eigenen Satz, nicht das allgemeine „Nicht ganz":
       wer `become` schreibt, hat nicht irgendetwas Falsches geschrieben,
       sondern GENAU das Naheliegende. Das ist die Auskunft, fuer die die
       Ebene da ist - und sie kommt aus den Daten, nicht aus einem Vorrat
       netter Saetze. */
    const inDieFalle = eingabe === Englisch.wieGetippt(ziel.falle);
    const satz = inDieFalle ? `Genau die Falle. ${ziel.warum}`
                            : 'Nicht ganz — noch einmal.';
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    sagen(satz);
    rein.select();
  }

  const pruefen = () => bewerte(rein.value);
  s.querySelector('#pruef').onclick = pruefen;
  rein.addEventListener('keydown', e => { if (e.key === 'Enter') pruefen(); });
  ausweg(s, aufloesen);
  s.querySelector('#zur').onclick = () => zeige(pauseSchirm);
  setTimeout(() => rein.focus(), 360);
  // Angesagt wird der DEUTSCHE Satz - er ist die Aufgabe. Fuer Stephan und
  // Violeta steht `vorlesen: false`, also passiert hier nichts; die Zeile
  // steht trotzdem da, weil die Ebene sonst als einzige gar nicht ansagt.
  ansagen(ziel.satz);
  return s;
}

/* ---------- „Sag es" (E6) ------------------------------------------------
 *
 * Die erste Ebene, auf der ein Kind etwas SAGT statt zu tippen, zu ziehen
 * oder anzutippen - und die einzige, die kein Urteil faellt.
 *
 * DREI REGELN AUS DEM KONZEPT (Form 3), und alle drei stehen gegen das,
 * was eine Lern-App sonst tut:
 *
 *   KEIN URTEIL. Was das Mikrofon versteht, wird nicht bewertet. Eine
 *   Sechsjaehrige, die zum ersten Mal „blue" sagt, spricht es falsch aus;
 *   das ist der Normalfall und nicht der Fehlerfall. Eine App, die ihr
 *   dafuer ein rotes Kreuz zeigt, bringt ihr bei, den Mund zu halten -
 *   und das ist das Gegenteil dessen, wofuer diese Ebene da ist. Jede
 *   Aeusserung zaehlt deshalb als getan: die Aufgabe war „sag es", und
 *   sie hat es gesagt.
 *
 *   HOECHSTENS ZWEI ANLAEUFE. Gemeint ist der Fall, in dem gar nichts
 *   ankommt - Stille, ein zu leises Kind, ein Mikrofon, das abbricht.
 *   Beim zweiten Mal geht es weiter, ohne Aufloesung und ohne Trostsatz.
 *   Wer dreimal aufgefordert wird, dasselbe noch einmal zu sagen, hoert
 *   eine Bewertung, auch wenn keine ausgesprochen wird.
 *
 *   ETWAS SICHTBARES PASSIERT. Ohne Urteil braucht es eine andere
 *   Rueckmeldung, sonst spricht das Kind ins Leere. Der Fleck blueht auf,
 *   sobald etwas ankommt. Das ist die ganze Antwort, und sie ist genug.
 *
 * UND SIE IST OHNE MIKROFON ZU ENDE ZU SPIELEN. Der Sprachmodus ist eine
 * Einstellung, die Erlaubnis kann fehlen, der Browser kann es nicht. Dann
 * steht „Gesagt" da und tut dasselbe. Eine Ebene, die ohne Mikrofon in
 * einer Sackgasse endet, ist fuer das Kind ein kaputtes Spiel - und der
 * Knopf steht IMMER da, nicht nur ersatzweise: auch wer sprechen darf,
 * darf einfach weitergehen.
 *
 * WAS SIE NICHT TUT: die Aussprache messen. Kein Prozentwert, keine
 * Sterne fuer „gut gesprochen". Das koennte diese App nicht, und wo sie
 * es koennte, sollte sie es nicht - der Ort dafuer ist ein Mensch, der
 * daneben sitzt.
 */
function sagenschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false, leer = 0;
  /* Wie oft ein Anlauf ins Leere gehen darf, bevor es weitergeht. */
  const ANLAEUFE = 2;

  /* Ohne englische Stimme steht das Wort da - sonst waere gar nicht zu
     erfahren, WAS zu sagen ist. Mit Stimme steht es nirgends: gehoert und
     nachgesprochen ist die Aufgabe, gelesen waere es eine andere.
     
     Der Aufruf steht hier AUSGESCHRIEBEN und nicht in einer zweiten
     Marke `stumm`. Die gibt es nebenan im Hoerschirm, und `inhalt` hat
     die Doppelung im selben Augenblick gemeldet, in dem sie entstand:
     eine Gegenprobe sucht genau diese Zeile, und bei zwei Fundstellen
     entscheidet die Reihenfolge, welche sie verstellt. */
  /* Ein ganzer Satz (E9) hat kein Bild - er IST etwas Gesagtes. An die
     Stelle des Flecks tritt deshalb die Sprechblase, dasselbe Zeichen
     wie auf der Kachel: das Kind sieht, dass hier gesprochen wird, und
     nicht, WAS - das kommt aus dem Ohr. */
  const istSatz = ziel.sorte === 'chunk';
  const bild = (x) => istSatz
    ? `<span class="satzblase gross"><svg width="120" height="120" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">${BLASENSTRICH}</svg></span>`
    : x.farbton
    ? `<span class="farbfleck gross" style="--farbton:${x.farbton}"></span>`
    : `<span class="ziffernbild gross">${x.ziffern}</span>`;

  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">${istSatz
      ? 'Sag den Satz auf Englisch.' : 'Sag es auf Englisch.'}</div>
    <div class="englischfeld">
      <div class="sagenbild" id="sagenbild">${bild(ziel)}</div>
      ${englischHoerbar() ? '' : `<div class="sagenwort" lang="en">${ziel.wort}</div>`}
      <div class="werkzeug"></div>
      <div class="sprachzeile" id="sprachzeile"></div>
    </div>`;

  const protokollieren = (ergebnis, roh, fachVorher, eingabeart) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn, eingabeart });
  const weiter = () => weiterIn(st);

  /** Der Fleck blueht auf - die einzige Rueckmeldung, die es hier gibt. */
  const aufbluehen = () => s.querySelector('#sagenbild')?.classList.add('gesagt');

  /**
   * Gesagt. Mehr wird nicht geprueft, und das ist die Zusage der Ebene.
   *
   * `ergebnis:'richtig'` und nicht ein eigenes Wort: das Protokoll
   * sammelt nur `richtig` und `gezeigt` ins Forscherbuch (Regel 6 - eine
   * zweite Liste erlaubter Werte waere die, die beim naechsten Umbau
   * veraltet). Und es ist auch nicht geschummelt: die Aufgabe lautete
   * „sag es", nicht „sag es richtig".
   */
  function gutschreiben(roh, eingabeart){
    if (erledigt) return;
    versuch++;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    const neuerAufkleber = werten(ziel, 'richtig', 1);
    kopfNachziehenIn(s);
    protokollieren('richtig', roh, fachVorher, eingabeart);
    aufbluehen();
    ausschalten();
    const spruch = lob();
    lobsatz(s, `<strong lang="en">${ziel.wort}</strong>.`, null, spruch, '', neuerAufkleber);
    sagen(spruch + kleberSatz(neuerAufkleber));
    // Und das Wort noch einmal auf Englisch - als letztes, was im Ohr
    // bleibt, steht das Vorbild und nicht der eigene Versuch.
    vorlesen(ziel.wort, 'en');
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  const ausschalten = () => {
    const g = s.querySelector('#gesagt'); if (g) g.disabled = true;
    const m = s.querySelector('#mikro'); if (m) m.disabled = true;
  };

  /** Nichts angekommen. Beim zweiten Mal geht es trotzdem weiter. */
  function insLeere(){
    if (erledigt) return;
    leer++;
    if (leer < ANLAEUFE) return;
    const satz = 'Ich habe dich nicht gehört — macht nichts.';
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    sagen(satz);
    gutschreiben('', 'sprechen');
  }

  s.querySelector('#zur').onclick = () => zeige(pauseSchirm);

  /* DIE REIHENFOLGE IST DIE AUSSAGE.
   *
   * Erst das Mikrofon, dann das Ohr, zuletzt „Gesagt". Der erste Anlauf
   * hatte „Gesagt" als grossen Hauptknopf ganz oben und das Mikrofon
   * darunter - auf dem Bildschirmfoto bei 844 x 390 sofort falsch: auf
   * einer Ebene, die „Sag es" heisst, ist Sprechen die Hauptsache und
   * Weitergehen der Ausweg. Wer den Ausweg gross macht, bekommt ihn
   * benutzt. (Regel 4 - kein Tor ersetzt den Blick; gemeldet hat es
   * keines.)
   *
   * Und „Gesagt" ist NUR dann leise, wenn es ein Mikrofon gibt. Ohne
   * eines ist es der einzige Weg weiter und muss aussehen wie einer. */
  const werkzeug = s.querySelector('.werkzeug');
  sprachweg({ spricht: P.eingabe.includes('sprechen'), werkzeug,
    liste: s.querySelector('#sprachzeile'),
    bewerte: (roh) => gutschreiben(roh, 'sprechen'),
    ohneErgebnis: insLeere });
  {
    const b = nochHoerenKnopf(ziel.wort, 'en');
    if (b) werkzeug.appendChild(b);
  }
  const mitMikro = !!s.querySelector('#mikro');
  const fertig = el('button', mitMikro ? 'knopf leise' : 'knopf haupt', 'Gesagt');
  fertig.id = 'gesagt';
  fertig.onclick = () => gutschreiben('', 'antippen');
  werkzeug.appendChild(fertig);

  /* Das Vorbild zuerst. `vorlesen` und nicht `ansagen`: es ist keine
     Vorlesehilfe fuer ein Kind, das nicht liest, sondern die Aufgabe
     selbst - Lea bekommt es genauso. */
  vorlesen(ziel.wort, 'en');
  return s;
}

function englischschirm(){
  /* Zwei Ebenen, ein Einstieg - unterschieden am Teil hinter dem
     Doppelpunkt, wie beim Schreib- und beim Flaggenschirm. Die Weiche
     steht HIER und nicht in `schirmZu`: dort haengt sie an `art`, und
     `art` ist bei beiden `englisch`. */
  if (['sagen', 'satz'].includes(String(Sitzung.ebeneId).split(':')[1]))
    return sagenschirm();
  if (['legen', 'bauen'].includes(String(Sitzung.ebeneId).split(':')[1]))
    return legeschirm();
  if (String(Sitzung.ebeneId).split(':')[1] === 'laute') return lauteschirm();
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;

  /* DIE DRITTE EBENE AUF DIESEM BILDSCHIRM: „Lies das Wort" (E7).
   *
   * Sie ist die UMKEHRUNG von „Hören und zeigen", und der Unterschied ist
   * genau eine Zeile: dort ist das geschriebene Wort die Antwort und darf
   * nirgends stehen, hier IST es die Frage und muss stehen. Vier Bilder
   * darunter, eines gehoert dazu.
   *
   * Und deshalb wird hier NICHT vorgelesen. Wer das Wort hoert, muss es
   * nicht mehr lesen - die Ebene pruefte dann dasselbe wie die
   * Schwesterebene, und niemand saehe den Unterschied. Ein Knopf zum
   * Nachhoeren gibt es aus demselben Grund nicht. */
  const liest = String(st.ebeneId).endsWith(':lesen');
  // Ohne englische Stimme steht das Wort da. MIT Stimme steht es nirgends -
  // geschrieben waere es die Antwort, und geprueft wuerde Lesen statt Hoeren.
  const stumm = liest || !englischHoerbar();

  const r1 = rnd(st.keim + st.i * 7919);
  const auswahl = mischenMit([ziel, ...Englisch.ablenkerFuer(ziel, r1)],
                             st.keim + st.i * 7919);

  /* Das Bild einer Moeglichkeit. Die gezeichneten Woerter (E7) kommen
     ueber `bildSvg` - EINE Stelle fuer alle drei Bildschirme, die
     dieselben Zeichnungen zeigen (Regel 6: was zweimal dasteht, veraltet
     einmal). */
  const bild = (x) => x.bild
    ? Englisch.bildSvg(x.bild)
    : x.farbton
    ? `<span class="farbfleck" style="--farbton:${x.farbton}"></span>`
    : `<span class="ziffernbild">${x.ziffern}</span>`;

  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">${stumm
      ? `Wo ist <strong lang="en">${ziel.wort}</strong>?`
      : 'Tippe auf das Bild, das du hörst.'}</div>
    <div class="englischfeld">
      <div class="engwahl" id="auswahl">${auswahl.map(x =>
        `<button class="engkarte" data-id="${x.id}" aria-label="${x.wort}"
                 lang="en">${bild(x)}</button>`).join('')}</div>
      ${WEISSNICHT}
    </div>`;

  const ausschalten = () => s.querySelectorAll('.engkarte').forEach(k => k.disabled = true);
  const zeigen = () => { const k = s.querySelector(`.engkarte[data-id="${ziel.id}"]`);
    if (k) k.classList.add('stimmt'); return k; };

  const protokollieren = (ergebnis, roh, fachVorher) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn,
      eingabeart: 'antippen' });

  const weiter = () => weiterIn(st);

  function aufloesen(){
    if (erledigt) return;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', '', fachVorher);
    ausschalten();
    zeigen();
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="loesung">Kein Problem. Das ist `
      + `<strong lang="en">${ziel.wort}</strong>.</span>`;
    // Der deutsche Trost und das englische Wort sind ZWEI Aeusserungen.
    // In einem Satz gemischt liefe „blue" durch die deutsche Stimme.
    sagen('Kein Problem. Das ist:');
    vorlesen(ziel.wort, 'en');
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }



  function bewerte(id, knopf){
    if (erledigt) return;
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (id === ziel.id) {
      erledigt = beendet(s);
      const neuerAufkleber = werten(ziel, 'richtig', versuch);
      kopfNachziehenIn(s);
      protokollieren('richtig', id, fachVorher);
      ausschalten();
      if (knopf) knopf.classList.add('stimmt');
      const spruch = lob();
      lobsatz(s, `<strong lang="en">${ziel.wort}</strong>.`, null, spruch, '', neuerAufkleber);
      sagen(spruch + kleberSatz(neuerAufkleber));
      vorlesen(ziel.wort, 'en');
      setTimeout(weiter, LOBPAUSE);
      return;
    }
    protokollieren('falsch', id, fachVorher);
    klangZu('falsch');
    if (versuch >= 3) return aufloesen();
    wackelt(knopf);
    const f = s.querySelector('#frage');
    const satz = liest ? 'Nicht ganz — lies noch einmal.'
                       : 'Nicht ganz — hör noch einmal hin.';
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    sagen(satz);
    // Und dann das Wort noch einmal - ohne es waere „hoer noch einmal hin"
    // eine Aufforderung ohne Gegenstand. Beim LESEN steht es ja da.
    if (!liest) vorlesen(ziel.wort, 'en');
  }

  s.querySelectorAll('.engkarte').forEach(k =>
    k.onclick = () => bewerte(k.dataset.id, k));
  ausweg(s, aufloesen,
    () => tippWegnehmen(s, '#auswahl .engkarte', x => x.dataset.id === ziel.id));
  s.querySelector('#zur').onclick = () => zeige(pauseSchirm);

  /* Die Frage selbst - siehe den Kopf dieser Funktion: `vorlesen` und nicht
     `ansagen`, weil sie kein Vorlesehelfer ist.

     BEIM LESEN (E7) NICHT: dort ist das geschriebene Wort die Frage. Wer
     es hoert, muss es nicht mehr lesen - die Ebene pruefte dann dasselbe
     wie ihre Schwester, und niemand saehe den Unterschied. Der
     Nachhoerknopf faellt aus demselben Grund weg. */
  if (!liest) {
    vorlesen(ziel.wort, 'en');
    nochHoerenIns(s, ziel.wort, 'en');
  }
  return s;
}

/* ---------- „Leg das Wort" (E8) ------------------------------------------
 *
 * REFERENZABGLEICH. Drei Vorbilder, und was sie WIRKLICH tun:
 *
 * 1. Das Montessori-Bewegliche-Alphabet. Buchstaben liegen als
 *    Gegenstaende da, das Wort wird GELEGT, nicht geschrieben. Was es
 *    tut: es trennt die Rechtschreibung von der Handschrift - ein Kind,
 *    das den Stift noch nicht fuehrt, kann trotzdem richtig schreiben.
 *    Zu uebernehmen: Buchstaben als Karten, und die Vorlage bleibt
 *    liegen.
 *
 * 2. ANTON, „Wort legen". Karten werden GEZOGEN. Was es tut: die
 *    Bewegung ist die Antwort, und wo die Karte landet, ist die
 *    Entscheidung - nicht nur WELCHE Karte, sondern auch WOHIN.
 *    Zu uebernehmen: das Ziehen mit Nachsicht, das die App aus der Karte
 *    schon hat.
 *
 * 3. Duolingo, „word bank". Getippt, nicht gezogen: die Karte springt an
 *    die naechste freie Stelle. Was es tut: es macht die Aufgabe auf
 *    einem Telefon mit einer Hand loesbar - Ziehen ist auf kleinen
 *    Bildschirmen die fehleranfaellige Bedienung, nicht die bequeme.
 *    Zu uebernehmen: der Tippweg NEBEN dem Ziehweg, nicht statt seiner.
 *
 * DAS SOLL, daraus abgeleitet:
 *   - Die Vorlage steht die ganze Zeit da (Lehrplan: „abschreibend, mit
 *     Vorlage"). Sie zu verstecken waere eine andere Aufgabe.
 *   - Beide Wege fuehren zum Ziel: ziehen UND tippen.
 *   - Eine falsch gelegte Karte kommt zurueck. In der Luecke steht nie
 *     ein falscher Buchstabe - abgeschrieben wird richtig oder gar
 *     nicht.
 *
 * ABSTAND ZUM STAND VOR DER RUNDE: null von drei. Es gab kein Legen.
 *
 * WARUM NICHT FREI TIPPEN: das kann die App laengst (Flaggen, Wendungen,
 * Diktat), und es ist die schwerere Aufgabe. Der Lehrplan verlangt fuer
 * Jahrgangsstufe 3 ausdruecklich das Abschreiben.
 */
function legeschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;
  const wort = ziel.wort;
  /* ZWEI EBENEN, EIN BILDSCHIRM. Bei „Leg das Wort" (E8) sind die Karten
     Buchstaben und das Ziel ein Wort, bei „Bau den Satz" (E9c) sind die
     Karten Woerter und das Ziel ein Satz. Alles andere ist gleich - das
     Ziehen, das Tippen, die drei Versuche, die Aufloesung. */
  const istSatz = String(st.ebeneId).endsWith(':bauen');
  const teile = istSatz ? wort.split(' ') : [...wort];
  /* UND EIN UNTERSCHIED, DER KEINE FORMSACHE IST: die Vorlage.
     „Abschreibend, mit Vorlage" ist beim Wort der Auftrag des Lehrplans;
     beim Satz heisst die Aufgabe „hoeren, zusammensetzen, sagen" - da
     waere der Satz danebengeschrieben die Loesung. Er steht deshalb nur
     da, wenn dieses Geraet ihn nicht sprechen kann. Dieselbe Notfassung
     wie bei „Sag es" und „Sag den Satz", und aus demselben Grund: eine
     Aufgabe, die man weder hoeren noch lesen kann, ist keine. */
  const zeigtVorlage = !istSatz || !englischHoerbar();
  /* Genau die Teile des Ziels, gemischt - keine Ablenker.
     Abschreiben ist kein Raetsel, und Zusammensetzen auch nicht: wer
     Ablenker dazulegt, prueft das Suchen statt das Schreiben. */
  const karten = mischenMit(teile, st.keim + st.i * 7919);

  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">${istSatz ? 'Bau den Satz.' : 'Leg das Wort.'}</div>
    <div class="legefeld">
      ${zeigtVorlage ? `<div class="vorlage${istSatz ? ' satzvorlage' : ''}"
        id="vorlage" lang="en">${wort}</div>` : ''}
      <div class="legereihe" id="legereihe">${teile.map((c, i) =>
        `<span class="leerstelle${istSatz ? ' wortluecke' : ''}"
               data-i="${i}" data-b="${c}"></span>`).join('')}</div>
      <div class="legevorrat" id="legevorrat">${karten.map((c, i) =>
        `<button class="etikett legekarte${istSatz ? ' wortkarte' : ''}"
                 data-b="${c}" data-k="${i}"
                 lang="en" aria-label="${c}">${c}</button>`).join('')}</div>
      ${WEISSNICHT}
    </div>`;

  const stellen = () => [...s.querySelectorAll('.leerstelle')];
  const offen = () => stellen().find(x => !x.classList.contains('voll')) || null;
  const ausschalten = () => s.querySelectorAll('.legekarte').forEach(k => k.disabled = true);

  const protokollieren = (ergebnis, roh, fachVorher, eingabeart) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn, eingabeart });

  const weiter = () => weiterIn(st);

  /* Was unter dem Finger liegt, leuchtet auf - dieselbe Zusage wie auf der
     Karte: Nachsicht ohne Anzeige waere Zauberei. */
  let drueber = null;
  const zeigen = (stelle) => {
    if (drueber === stelle) return;
    if (drueber) drueber.classList.remove('drueber');
    drueber = stelle;
    if (stelle) stelle.classList.add('drueber');
  };

  function aufloesen(){
    if (erledigt) return;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', '', fachVorher, 'ziehen');
    ausschalten();
    stellen().forEach(x => { x.textContent = x.dataset.b; x.classList.add('voll','gezeigt'); });
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="loesung">Kein Problem. So `
      + `${istSatz ? 'heißt der Satz' : 'schreibt man'}: `
      + `<strong lang="en">${wort}</strong>.</span>`;
    // Der deutsche Trost und das englische Wort sind ZWEI Aeusserungen -
    // in einem Satz gemischt liefe „fifteen" durch die deutsche Stimme.
    sagen(istSatz ? 'Kein Problem. So heißt der Satz:' : 'Kein Problem. So schreibt man:');
    vorlesen(wort, 'en');
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  function fertig(eingabeart){
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    const neuerAufkleber = werten(ziel, 'richtig', versuch + 1);
    kopfNachziehenIn(s);
    protokollieren('richtig', wort, fachVorher, eingabeart);
    ausschalten();
    const spruch = lob();
    lobsatz(s, `<strong lang="en">${wort}</strong>.`, null, spruch, '', neuerAufkleber);
    sagen(spruch + kleberSatz(neuerAufkleber));
    vorlesen(wort, 'en');
    setTimeout(weiter, LOBPAUSE);
  }

  /**
   * Eine Karte auf eine Luecke.
   *
   * Passt sie, bleibt sie liegen. Passt sie nicht, kommt sie zurueck -
   * in der Luecke steht NIE ein falscher Buchstabe. Das ist keine
   * Bequemlichkeit, sondern die Aufgabe: wer abschreibt, sieht am Ende
   * das richtige Wort, nicht seinen Fehler.
   */
  function legen(karte, stelle, eingabeart, von){
    if (erledigt || !stelle || karte.classList.contains('weg')) return;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (stelle.dataset.b === karte.dataset.b) {
      stelle.textContent = karte.dataset.b;
      stelle.classList.add('voll');
      karte.classList.add('weg');
      if (!offen()) fertig(eingabeart);
      return;
    }
    versuch++;
    protokollieren('falsch', karte.dataset.b, fachVorher, eingabeart);
    klangZu('falsch');
    if (von) zurueckFliegen(karte, von);
    if (versuch >= 3) return aufloesen();
    wackelt(karte);
    const f = s.querySelector('#frage');
    const satz = istSatz
      ? (zeigtVorlage ? 'Nicht ganz — schau noch einmal auf den Satz.'
                      : 'Nicht ganz — hör noch einmal hin.')
      : 'Nicht ganz — schau noch einmal auf das Wort.';
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    sagen(satz);
  }

  /* Der Treffertest fuers Legen: eine Luecke, die noch frei ist. Volle
     Luecken zaehlen nicht - sonst faengt die naechstbeste schon besetzte
     Stelle den Zug ab, und das Kind sieht nicht, warum nichts passiert. */
  const lueckeUnter = (x, y) => {
    const treffer = (px, py) => {
      const e = document.elementFromPoint(px, py);
      if (!e || !e.closest) return null;
      const l = e.closest('.leerstelle');
      return l && !l.classList.contains('voll') ? l : null;
    };
    const t = nachsichtig(treffer, x, y);
    return t ? t.marke : null;
  };

  s.querySelectorAll('.legekarte').forEach(karte => {
    /* Der Ziehweg (ANTON) und der Tippweg (Duolingo) nebeneinander.
       Getippt springt die Karte an die NAECHSTE freie Stelle - gezogen
       entscheidet der Finger, welche es ist. */
    ziehbar(karte, {
      ueber: lueckeUnter,
      zeigen,
      abgelegt: (stelle, ctx) => legen(karte, stelle, 'ziehen', ctx.von),
      insLeere: (b, von) => {
        zurueckFliegen(b, von);
        /* Nach dem Lob nicht mehr: der Satz stuende dann statt „Richtig!"
           da, und gewertet ist laengst. Dieselbe Vorsicht wie in `legen`. */
        if (erledigt) return;
        const f = s.querySelector('#frage');
        const sagt = istSatz ? 'Lass es auf einer Lücke los.'
                             : 'Lass ihn auf einer Lücke los.';
        if (f) f.innerHTML = `<span class="fastText">${sagt}</span>`;
        sagen(sagt);
      },
    });
    karte.onclick = () => legen(karte, offen(), 'antippen', null);
  });

  ausweg(s, aufloesen);
  s.querySelector('#zur').onclick = () => zeige(pauseSchirm);

  /* Einmal hoeren, bevor gelegt wird. Beim Wort ist das eine Zutat -
     abgeschrieben wird das Geschriebene. Beim Satz ist es die AUFGABE:
     ohne ihn steht eine Reihe Wortkarten da und nichts, was sagt, was
     daraus werden soll. */
  vorlesen(wort, 'en');
  nochHoerenIns(s, wort, 'en');
  return s;
}

/* ---------- „Zwei Wörter, ein Laut" (E5) ---------------------------------
 *
 * Die wichtigste Form des Englischkonzepts, und die einzige, bei der die
 * Maschine keinen Messfehler hat: sie hat das Wort gesagt, sie weiss
 * welches, ein richtiger Tipp ist richtig. Beurteilt wird das OHR und
 * nicht die Aussprache eines Kindes.
 *
 * Gebaut wie `paarschirm` (die Verwechslungen, F3), und das ist kein
 * Zufall: es ist dieselbe Aufgabe in einem anderen Sinn. Zwei
 * Moeglichkeiten, die sich fast gleichen; die Seite wird gewuerfelt; und
 * der GRUND wird immer genannt, ob richtig oder falsch geantwortet wurde.
 * Der Grund ist der eigentliche Inhalt - dass man einmal richtig geraten
 * hat, nimmt niemand mit.
 *
 * EIN Versuch und nicht drei, aus demselben Grund wie dort: bei zwei
 * Moeglichkeiten waere der zweite kein Versuch, sondern der Rest.
 *
 * WAS HIER ANDERS IST als bei den Flaggen: die Frage steht nicht da. Sie
 * wird GESPROCHEN, und sie muss noch einmal zu hoeren sein - deshalb der
 * Knopf zum Nachhoeren, und deshalb gibt es die Ebene ohne englische
 * Stimme gar nicht (`wenn` in ihrem Eintrag).
 */
function lauteschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;

  /* Die Zeichnung zu einem der beiden Woerter. Sie kommt aus dem STUECK
     und nicht aus einer zweiten Nachschlagerei: `vorratLaute` legt beide
     Pfade daneben, und wer hier noch einmal suchte, haette die zweite
     Fassung derselben Zuordnung (Regel 6: was zweimal dasteht, veraltet
     einmal). */
  const bildZu = (w) => w === ziel.wort ? ziel.bild
    : w === ziel.gegen ? ziel.gegenBild : null;

  /* Die Seite wird GEWUERFELT, mit dem Keim der Aufgabe. Ohne das stuende
     das gefragte Wort immer links, sobald es in den Daten links steht -
     und die Ebene pruefte, ob man die Liste auswendig kann. */
  const zwei = mischenMit([{ wort: ziel.wort, gesucht: true },
                           { wort: ziel.gegen, gesucht: false }],
                          st.keim + st.i * 7919);

  const protokollieren = (ergebnis, roh, fachVorher) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn,
      eingabeart: 'antippen' });
  const weiter = () => weiterIn(st);

  /* MIT BILDERN statt Buchstaben, wenn das Kind nicht liest.
   *
   * Fiona (6) sieht zwei geschriebene Woerter nicht als Woerter, sondern
   * als zwei Muster - die Ebene gaebe es fuer sie nur dem Anschein nach.
   * Mit Bildern ist es genau dieselbe Aufgabe: hoeren und zeigen, und was
   * die beiden unterscheidet, ist ein einziger Laut.
   *
   * BEIDE oder KEINES. Stuende ein Bild neben einem Wort, waere die
   * Antwort „das mit dem Bild" - deshalb haengt es an beiden Pfaden und
   * nicht an einem. Der Vorrat gibt fuer dieses Profil ohnehin nur
   * gemalte Paare her; die Bedingung hier ist die zweite Haelfte
   * derselben Zusage und faengt den Fall ab, in dem der Filter ausfaellt.
   *
   * `aria-label` bleibt das WORT, auch beim Bild: die Vorlesehilfe des
   * Geraets soll etwas zu sagen haben, und die Tore finden die Karte an
   * `data-wort` wie zuvor. */
  const mitBild = !!P.vorlesen && zwei.every(x => bildZu(x.wort));
  const bildZuKarte = (w) => Englisch.bildSvg(bildZu(w), 'wortbild lautbildchen');

  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">Welches Wort hörst du?</div>
    <div class="englischfeld">
      <div class="engwahl lautwahl${mitBild ? ' lautbilder' : ''}" id="auswahl">${zwei.map(x =>
        `<button class="engkarte lautkarte${mitBild ? ' mitbild' : ''}" data-wort="${x.wort}"
                 lang="en" aria-label="${x.wort}">${
          mitBild ? bildZuKarte(x.wort) : x.wort}</button>`).join('')}</div>
      ${WEISSNICHT}
    </div>`;

  const ausschalten = () => s.querySelectorAll('.lautkarte')
    .forEach(k => k.disabled = true);
  /* NACH der Antwort wird die richtige hervorgehoben - beide bleiben
     lesbar. Wer sieht, WELCHES der beiden es war, hat in dem Augenblick
     das Paar gelernt und nicht nur seine Haelfte. */
  const zeigen = () => {
    const k = s.querySelector(`.lautkarte[data-wort="${ziel.wort}"]`);
    if (k) k.classList.add('stimmt');
  };
  /* Der Grund gehoert zur STOLPERSTELLE, nicht zum Paar - er steht in den
     Daten einmal und gilt fuer alle vier Paare darunter (Regel 6). Was
     das Paar dazutut, ist der Fall: „think — nicht sink". */
  const erklaerung = () => `<strong lang="en">${ziel.wort}</strong> — nicht `
    + `<strong lang="en">${ziel.gegen}</strong>. ${ziel.grund}`;

  function aufloesen(){
    if (erledigt) return;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', '', fachVorher);
    ausschalten(); zeigen();
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="loesung">${erklaerung()}</span>`;
    // Das englische Wortpaar und der deutsche Grund sind ZWEI
    // Aeusserungen - in einem Satz gemischt liefe „think" durch die
    // deutsche Stimme.
    vorlesen(ziel.wort, 'en');
    sagen(ziel.grund);
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  function bewerte(wort, knopf){
    if (erledigt) return;
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (wort === ziel.wort) {
      erledigt = beendet(s);
      const neuerAufkleber = werten(ziel, 'richtig', versuch);
      kopfNachziehenIn(s);
      protokollieren('richtig', wort, fachVorher);
      ausschalten(); zeigen();
      const spruch = lob();
      /* Der Grund steht NEBEN dem Lob und nicht statt seiner - `nebenbei`
         ist genau dafuer da. Wer richtig lag, soll trotzdem erfahren,
         WORAN es lag. */
      lobsatz(s, `<strong lang="en">${ziel.wort}</strong>.`, null, spruch,
        erklaerung(), neuerAufkleber);
      sagen(spruch + '. ' + ziel.grund);
      vorlesen(ziel.wort, 'en');
      standSichern(st.ebeneId);
      setTimeout(weiter, LOBPAUSE);
      return;
    }
    protokollieren('falsch', wort, fachVorher);
    klangZu('falsch');
    /* NUR EIN Versuch bei zwei Moeglichkeiten - derselbe Grund wie bei den
       Verwechslungen: ein zweiter waere kein Versuch, sondern der Rest. */
    wackelt(knopf);
    setTimeout(aufloesen, 260);
  }

  s.querySelectorAll('.lautkarte').forEach(k =>
    k.onclick = () => bewerte(k.dataset.wort, k));
  ausweg(s, aufloesen,
    () => tippWegnehmen(s, '#auswahl .lautkarte', x => x.dataset.wort === ziel.wort));
  s.querySelector('#zur').onclick = () => zeige(pauseSchirm);

  /* Die Frage IST das gesprochene Wort. `vorlesen` und nicht `ansagen`:
     es ist keine Vorlesehilfe fuer ein Kind, das nicht liest, sondern die
     Aufgabe selbst - und ohne sie steht der Bildschirm ohne Frage da. */
  vorlesen(ziel.wort, 'en');
  nochHoerenIns(s, ziel.wort, 'en');
  return s;
}

/* ---------- Der Flaggenschirm (F2) ---------------------------------------
 *
 * EINE Ebene, VIER Erfahrungen - und genau das ist der Entwurf (Konzept
 * 1.3). Die Ebene sagt, WAS gefragt wird; das Profil sagt, WIE geantwortet
 * wird. Dieselbe Regel, nach der `spielschirm` seit jeher gebaut ist
 * (`kannLesen`, `kandidaten`, `umgekehrt`).
 *
 *   Fiona     Die App SAGT „Deutschland", vier Flaggen stehen da, eine
 *             wird angetippt. Kein Wort Schrift - sie liest noch nicht,
 *             und ohne diese Richtung koennte sie nicht mitspielen.
 *   Lea       Die Flagge steht da, der Name wird getippt.
 *   Die Eltern  Dasselbe ohne Auswahl (`kandidaten:0`) - vier
 *             Moeglichkeiten sind die groesste Hilfe, die das Spiel kennt.
 *
 * ZWEI RICHTUNGEN, EIN LEITNER-STAND. „Zeig mir Deutschland" und „Wie
 * heisst das?" sind zwei Fragen an DASSELBE Wissen, und die zweite ist die
 * schwerere. Zwei Ebenen daraus zu machen hiesse: wer die Flagge
 * Rumaeniens angetippt kennt, muesste sie getippt von vorn lernen.
 *
 * Die schwerere Richtung ist bei Fiona jede DRITTE und nie die erste -
 * dieselbe Stelle und derselbe Grund wie `umgekehrt` auf der Karte.
 *
 * WAS HIER NOCH FEHLT: das Sprechen. Es steht als F2b im Backlog, und der
 * Grund ist kein Vergessen: der Sprachweg (Mikrofon, Rueckfrage,
 * Zwischenergebnis, der EINE Ausgang aus F13) sitzt in `spielschirm`
 * eingewachsen. Ihn hier nachzubauen waere eine zweite Fassung von
 * dreihundert Zeilen, in denen vier gemeldete Fehler stecken (F13, F14,
 * F15) - und die zweite Fassung haette sie wieder. Er gehoert
 * herausgeloest, und das ist eine eigene Runde am groessten Bildschirm der
 * App.
 */
function flaggenschirm(){
  /* Zwei Ebenen, ein Einstieg - unterschieden am Teil hinter dem
     Doppelpunkt, wie beim Schreibschirm. `flaggen:paare` ist eine andere
     Aufgabe (zwei Flaggen, ein Versuch, eine Erklaerung) und bekommt
     deshalb einen eigenen Bildschirm; die WEICHE steht hier, damit
     `schirmZu` eine Zeile je ART behaelt und nicht je Ebene. */
  /* DREI Ebenen teilen sich die Art `flaggen`, und die Weiche steht hier,
     damit `schirmZu` eine Zeile je ART behaelt statt einer je Ebene:
     
       flaggen:<karte>   vier Flaggen oder ein Eingabefeld  (dieser Schirm)
       flaggen:paare     zwei Flaggen und eine Erklaerung   (paarschirm)
       flaggen:karte     die Flagge auf die Landkarte       (spielschirm)
     
     Der letzte Fall ist der Grund, warum die Weiche nicht in `schirmZu`
     steht: dort haengt sie an `art`, und `art` ist bei allen dreien
     dasselbe. */
  const teil = String(Sitzung.ebeneId).split(':')[1];
  if (teil === 'paare') return paarschirm();
  if (teil === 'karte') return spielschirm();
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;

  const kannLesen = P.eingabe.includes('tippen');
  /* Die Auswahl schlaegt die Ebene vor, das Profil kann sie verbieten -
     und im TEST gibt es sie nie (B2). Wortgleich zu `spielschirm`. */
  const darfWaehlen = P.kandidaten > 0 && !st.test;
  /* WELCHE RICHTUNG - und die Voreinstellung ist die SCHWERERE.
   *
   * Wer lesen und schreiben kann, bekommt „Wie heisst das Land?" und
   * tippt den Namen. Das ist derselbe Weg, den Lea auf der Karte laengst
   * geht (`kandidaten:99` heisst dort: kein Auswahlzwang, sie schreibt).
   * Die leichtere Richtung - vier Flaggen, eine antippen - kommt bei ihr
   * jede DRITTE; sie ist die Abwechslung, nicht der Normalfall.
   *
   * Der erste Anlauf hatte es umgekehrt, und das war an einer Runde zu
   * sehen: Lea bekam dreimal hintereinander vier Flaggen zum Antippen.
   * Aus „welches Land ist das" wird damit „welches von diesen vieren",
   * und das ist die groesste Hilfe, die das Spiel kennt (B2) - als
   * Regelfall verschenkt sie die Ebene.
   *
   * Wer NICHT liest, bekommt immer die Auswahl: die andere Richtung
   * verlangt einen getippten Namen, und den kann Fiona nicht geben. */
  const zeigen = !kannLesen || (darfWaehlen && st.i % 3 === 2);

  const r1 = rnd(st.keim + st.i * 7919);
  const alle = vorrat(st.ebeneId);
  /* Die ABLENKER kommen aus dem ganzen Vorrat der Karte, nicht aus der
   * Tiefe des Profils.
   *
   * Fiona lernt in Europa drei Laender (`laenderTiefe:3`). Zoege die
   * Auswahl nur daraus, staenden DREI Flaggen da statt vier - und nach
   * zwei Runden waere die Aufgabe, sich drei Plaetze zu merken. Ein
   * Ablenker muss nicht lernbar sein, er muss falsch sein.
   *
   * `voll` ist genau dafuer da und wird an anderen Stellen schon so
   * benutzt (D2b). */
  const ganzeKarte = vorrat(st.ebeneId, Stand, true);

  /* Die Ablenker sind GEWAEHLT, nicht gewuerfelt (Soll 4).
   *
   * Zuerst eine wirklich verwechselbare Flagge, dann eine gleich GEBAUTE,
   * dann der Rest. Ohne den ersten Schritt stuende neben Rumaenien nie der
   * Tschad und neben Honduras nie Nicaragua - und die Ebene uebte genau
   * das nicht, was schwer ist.
   *
   * HOECHSTENS EINE verwechselbare. Zwei davon in einer Auswahl sind kein
   * Lernen mehr, sondern Raten mit besserer Begruendung. */
  const ablenker = () => {
    const andere = ganzeKarte.filter(x => x.id !== ziel.id);
    /* Zwei von HEUTE, eine von MORGEN — und das ist der zweite Anlauf.
     *
     * Der erste zog alle drei aus dem ganzen Kontinent und legte nur EINE
     * ausdrücklich hinter die Leiter. Der Rauchtest hat nachgemessen und
     * das Gegenteil gefunden: bei drei offenen Ländern liegen vierzehn
     * von siebzehn Flaggen jenseits der Leiter, also kamen im Schnitt
     * DREI von vier Antworten von dort.
     *
     * Das ist keine Kleinigkeit, sondern eine andere Aufgabe. Wer drei
     * Flaggen sieht, die er noch nie gesehen hat, und eine, die er kennt,
     * braucht den Namen in der Frage gar nicht zu lesen - er tippt auf
     * die bekannte. Die Ebene misst dann Vertrautheit statt Wissen, und
     * sie meldet sich nie: die Antworten sind richtig.
     *
     * Also umgekehrt: die Ablenker kommen aus dem, was das Kind GERADE
     * lernt, und genau eine kommt von jenseits der Leiter.
     *
     *   heute   zwingt zum Unterscheiden - drei Flaggen, die alle
     *           bekannt sind, lassen sich nur über den Namen trennen
     *   morgen  eine einzige, als Vorschau. Wiedererkennen kommt vor
     *           benennen: wer Portugal dreimal danebenliegen sah, hat es
     *           schon halb gelernt, wenn es zum ersten Mal gefragt wird.
     *
     * Reicht `heute` nicht (Fiona hat am ersten Tag zwei andere Länder),
     * wird von morgen aufgefüllt. Das ist der Anfang und geht vorbei -
     * die Leiter macht daraus in wenigen Sitzungen eine echte Auswahl. */
    const heuteDrin = new Set(alle.map(x => x.id));
    const nah = Flaggen.nahDran(ziel.a3);
    const muster = Flaggen.baumuster(Flaggen.flaggeVon(ziel.a3).bau);
    const gleich = (x) => Flaggen.baumuster(Flaggen.flaggeVon(x.a3).bau) === muster;
    const misch = (l) => mischenMit(l, st.keim + st.i * 7919);
    /* Die Reihenfolge INNERHALB eines Topfes: erst die verwechselbare,
       dann die mit demselben Bauplan, dann der Rest. `nahDran` gibt nur,
       was sich unterscheiden LÄSST - Rumänien und der Tschad trennen sich
       nur im Blauton und stehen deshalb nie nebeneinander. */
    const ordnen = (l) => [...misch(l.filter(x => nah.has(x.a3))),
                           ...misch(l.filter(x => !nah.has(x.a3) && gleich(x))),
                           ...misch(l.filter(x => !nah.has(x.a3) && !gleich(x)))];
    const heute  = ordnen(andere.filter(x => heuteDrin.has(x.id)));
    const morgen = ordnen(andere.filter(x => !heuteDrin.has(x.id)));
    const aus = [...heute.slice(0, 2), ...morgen.slice(0, 1)];
    // Aufgefüllt wird aus dem, was übrig ist - erst morgen, dann heute.
    for (const x of [...morgen, ...heute]) {
      if (aus.length >= 3) break;
      if (!aus.includes(x)) aus.push(x);
    }
    return aus.slice(0, 3);
  };

  /* Die Eingabeart wird MITGEGEBEN, seit es drei gibt (F2b): antippen,
     tippen, sprechen. Sie aus `zeigen` abzuleiten liesse zwei davon als
     eine durchgehen - und das Protokoll ist die einzige Stelle, an der
     jemals nachzusehen ist, welchen Weg ein Kind wirklich genommen hat. */
  const protokollieren = (ergebnis, roh, fachVorher, eingabeart) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn,
      eingabeart: eingabeart || (zeigen ? 'antippen' : 'tippen') });
  const weiter = () => weiterIn(st);

  const auswahl = zeigen
    ? mischenMit([ziel, ...ablenker()], st.keim + st.i * 7919) : [];

  /* Die Frage.
   *
   * In der Zeigerichtung steht der Landesname DA - auch fuer Fiona, die
   * ihn nicht liest: er wird ihr gesagt, und wer daneben sitzt, soll
   * mitlesen koennen. In der Nennrichtung darf er nirgends stehen, sonst
   * ist er die Antwort. */
  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">${zeigen
      /* Der NAME STEHT VORN, und das ist kein Geschmack, sondern
         Grammatik: „die Flagge von Vereinigtes Koenigreich" ist falsch,
         und richtig waere „vom Vereinigten Koenigreich" - also je nach
         Land ein anderer Fall und ein anderer Artikel. Die Tuerkei, die
         Schweiz, die Niederlande, die Ukraine, die USA: fuenfzehn der 69
         Namen tragen einen Artikel. Eine Beugungstabelle waere eine
         zweite Faktenliste fuer einen Satz.
         
         Vorangestellt steht jeder Name im Nominativ, so wie er in den
         Daten steht - und der Satz stimmt fuer alle 69. Gesprochen klingt
         er sogar besser: „Vereinigtes Koenigreich. Wo ist die Flagge?" */
      ? `<strong>${ziel.name}</strong> — wo ist die Flagge?`
      : 'Zu welchem Land gehört diese Flagge?'}</div>
    <div class="flaggenfeld">${zeigen ? `
      <div class="flaggenwahl" id="auswahl">${auswahl.map(x =>
        `<button class="flaggenkarte" data-id="${x.id}" aria-label="${x.name}"
          >${Flaggen.flaggeSvg(x.flagge)}</button>`).join('')}</div>` : `
      <div class="flaggengross">${Flaggen.flaggeSvg(ziel.flagge, { titel:'Flagge' })}</div>
      <div class="tippfeld">
        <input class="eingabe" id="rein" inputmode="text" autocomplete="off"
               autocorrect="off" autocapitalize="off" spellcheck="false"
               aria-label="Name des Landes">
        <button class="knopf haupt" id="pruef">Prüfen</button>
      </div>`}
      ${WEISSNICHT}${zeigen ? '' : `
      <div class="sprachzeile" id="sprachzeile"></div>`}
    </div>`;

  const rein = s.querySelector('#rein');
  const ausschalten = () => {
    s.querySelectorAll('.flaggenkarte').forEach(k => k.disabled = true);
    if (rein) { rein.disabled = true; s.querySelector('#pruef').disabled = true; }
  };
  const richtigeZeigen = () => {
    const k = s.querySelector(`.flaggenkarte[data-id="${ziel.id}"]`);
    if (k) k.classList.add('stimmt');
  };

  function aufloesen(){
    if (erledigt) return;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', rein ? rein.value : '', fachVorher);
    ausschalten();
    richtigeZeigen();
    const f = s.querySelector('#frage');
    /* Beim Aufloesen steht in der NENNrichtung die Flagge schon da - was
       fehlt, ist der Name. In der Zeigerichtung ist es umgekehrt. Beide
       Male wird genau das nachgeliefert, was das Kind nicht hatte. */
    if (f) f.innerHTML = `<span class="loesung">Kein Problem. Das ist `
      + `<strong>${ziel.name}</strong>.</span>`;
    sagen(`Kein Problem. Das ist ${ziel.name}.`);
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  function gutschreiben(ergebnis, roh, fachVorher, nebenbei, eingabeart){
    erledigt = beendet(s);
    const neuerAufkleber = werten(ziel, ergebnis, versuch);
    kopfNachziehenIn(s);
    protokollieren(ergebnis, roh, fachVorher, eingabeart);
    ausschalten();
    richtigeZeigen();
    const spruch = ergebnis === 'richtig' ? lob() : null;
    lobsatz(s, `<strong>${ziel.name}</strong>.`, null, spruch, nebenbei || '',
      neuerAufkleber);
    if (spruch) sagen(spruch + kleberSatz(neuerAufkleber));
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  /** Die Zeigerichtung: eine von vier Flaggen ist angetippt. */
  function gewaehlt(id, knopf){
    if (erledigt) return;
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (id === ziel.id) { if (knopf) knopf.classList.add('stimmt');
      return gutschreiben('richtig', id, fachVorher); }
    protokollieren('falsch', id, fachVorher);
    klangZu('falsch');
    if (versuch >= 3) return aufloesen();
    wackelt(knopf);
    /* Der Hinweis nennt, was WIRKLICH angetippt wurde - nicht „leider
       nein". Ein Kind, das auf Luxemburg tippt und „das ist Luxemburg"
       hoert, hat in diesem Augenblick zwei Flaggen gelernt statt keiner.
       Dieselbe Bauart wie der Zughinweis auf der Karte (A3). */
    const daneben = ganzeKarte.find(x => x.id === id);
    const satz = daneben ? `Das ist ${daneben.name}.` : 'Nicht ganz — schau noch einmal hin.';
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    sagen(satz);
  }

  /**
   * Die Nennrichtung - GETIPPT ODER GESPROCHEN, ein Ort (F2b).
   *
   * Der Sprachweg war die eine Antwortform aus dem Wunsch, die die
   * Flaggen noch nicht hatten („zum Eintippen, zum Einsprechen"). Er
   * bekommt hier keine eigene Fassung: `sprachweg` (Mikrofon, Frist,
   * Ausstieg) und `erhoert` (was aus dem Gehoerten wird) stehen seit
   * dieser Runde als Bauteile daneben und werden von der Karte und von
   * hier benutzt. Was diese Ebene beisteuert, ist der Vorrat, gegen den
   * gehoert wird - `alle`, also genau die Laender dieser Karte.
   *
   * Der Unterschied zwischen den beiden Wegen ist EINER: getippt wird
   * die Rechtschreibung bewertet (sie ist Lerninhalt), gesprochen der
   * gemeinte Ort. „Rumänien" mit ie ist beim Tippen ein Hinweis wert und
   * beim Sprechen gar nicht zu hoeren.
   */
  function benannt(roh, eingabeart = 'tippen', ctx = {}){
    if (erledigt) return;
    const text = String(roh || '').trim();
    if (!text) { if (rein) { wackelt(rein); rein.focus(); } return; }
    let gehoert = null;
    if (eingabeart === 'sprechen') {
      gehoert = erhoert(text, ctx, { kand: alle, ziel, bewerte: benannt,
        stelle: s.querySelector('#sprachzeile'),
        unverstanden: () => eintragen(st, ziel, { ergebnis:'unverstanden',
          roh:text, fachVorher: Stand[ziel.id]?.fach ?? 1, versuch, beginn,
          eingabeart:'sprechen' }) });
      if (!gehoert) return;
    }
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (gehoert) {
      if (gehoert.id === ziel.id)
        return gutschreiben('richtig', gehoert.gehoert || text, fachVorher, '', 'sprechen');
      protokollieren('falsch', text, fachVorher, 'sprechen');
      klangZu('falsch');
      if (versuch >= 3) return aufloesen();
      return hinweis(`Das wäre ${gehoert.name}.`);
    }
    /* Dieselbe Nachsicht wie auf der Karte, und aus derselben Stelle:
       `Vergleich.rechtschreibung` kennt die Aliasse und laesst einen
       Tippfehler als „fast" durch. Ein zweiter Abgleich hier waere eine
       zweite Nachsicht, und eine der beiden waere die strengere - ohne
       dass jemand entschieden haette, welche. */
    const r = Vergleich.rechtschreibung(text, ziel);
    if (r.urteil === 'richtig' || r.urteil === 'fast')
      return gutschreiben(r.urteil === 'richtig' ? 'richtig' : 'fast', text, fachVorher,
        r.urteil === 'richtig' ? (r.nebenbei || '') : '');
    protokollieren('falsch', text, fachVorher);
    klangZu('falsch');
    if (versuch >= 3) return aufloesen();
    /* Und auch hier: sagen, was es GEWESEN waere. `abgleich` sucht das
       naechstliegende Land aus dem Vorrat dieser Ebene - wer „Rumänien"
       tippt und den Tschad vor sich hat, soll das erfahren. */
    const t = Vergleich.abgleich(text, alle);
    hinweis(t.art === 'nochmal'
      ? 'Das kenne ich noch nicht — schau noch mal hin.'
      : t.id === ziel.id ? 'Fast! Schau noch mal ganz genau hin.'
      : `Das wäre ${t.name}.`);
    if (rein) rein.select();
  }

  /** Was nach einem Fehlversuch in der Fragezeile steht - und gesagt wird. */
  function hinweis(satz){
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="fastText">${satz}</span>`;
    sagen(satz);
  }

  s.querySelectorAll('.flaggenkarte').forEach(k =>
    k.onclick = () => gewaehlt(k.dataset.id, k));
  if (rein) {
    const pruefen = () => benannt(rein.value, 'tippen');
    s.querySelector('#pruef').onclick = pruefen;
    rein.addEventListener('keydown', e => { if (e.key === 'Enter') pruefen(); });
    setTimeout(() => rein.focus(), 360);
    /* Und der Sprachweg daneben - nur in der Nennrichtung. In der
       Zeigerichtung STEHT der Landesname in der Frage; ihn auszusprechen
       waere keine Antwort, sondern Vorlesen.
       
       Das Mikrofon steht in der EINGABEZEILE, neben „Prüfen" - nicht
       unten bei „Weiß ich nicht". Es ist der zweite Weg zur Antwort und
       nicht der zweite Weg zum Aufgeben; wer es dorthin stellt, wo man
       hinsieht, wenn man nicht weiterweiss, sagt etwas anderes, als er
       meint. */
    sprachweg({ spricht: P.eingabe.includes('sprechen'),
      werkzeug: s.querySelector('.tippfeld'),
      liste: s.querySelector('#sprachzeile'), bewerte: benannt });
  }
  ausweg(s, aufloesen,
    () => tippWegnehmen(s, '#auswahl .flaggenkarte', x => x.dataset.id === ziel.id));
  s.querySelector('#zur').onclick = () => zeige(pauseSchirm);

  /* Angesagt wird nur die ZEIGErichtung. In der Nennrichtung waere der
     Landesname die Antwort - vorgelesen waere die Aufgabe geloest, bevor
     sie gestellt ist. */
  if (zeigen) ansagen(`${ziel.name}. Wo ist die Flagge?`);
  return s;
}

/* ---------- Die Verwechslungen (F3) --------------------------------------
 *
 * ZWEI Flaggen, die sich sehr aehnlich sehen, und die Frage „Welche ist
 * Rumaenien?". Das ist die Ebene, die es sonst nirgends gibt, und sie ist
 * der Grund, warum die Flaggen mehr sind als Bildchen.
 *
 * SIE ZEIGT EINE FALLE, STATT SIE ZU VERMEIDEN - dieselbe Bauart wie
 * „Falsche Freunde" (E10) und aus demselben Grund: bei Lea und den Eltern
 * ist die Verknuepfung da und nur zugewachsen. Fuer Fiona waere sie
 * falsch; sie lernt gerade erst, dass eine Flagge zu einem Land gehoert.
 *
 * DER UNTERSCHIED WIRD IMMER GENANNT, ob richtig oder falsch geantwortet
 * wurde. Das ist der eigentliche Inhalt: „Luxemburgs Blau ist heller" ist
 * das, was man mitnimmt - nicht, dass man einmal richtig geraten hat. Er
 * steht bei den DATEN (`grund` in `AEHNLICH`), weil er zur Sache gehoert.
 *
 * ZWEI Moeglichkeiten und nicht vier: mehr waeren nicht schwerer,
 * sondern eine andere Aufgabe. Der Reiz liegt darin, dass die beiden
 * nebeneinander stehen und man trotzdem hinsehen muss.
 */
function paarschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;

  /* Die Seite, auf der die richtige steht, wird GEWUERFELT - mit dem Keim
     der Aufgabe, wie ueberall. Ohne das stuende bei „Welche ist
     Rumaenien?" die richtige immer links, weil das Paar so notiert ist,
     und die Ebene pruefte, ob man die Liste auswendig kann. */
  const zwei = mischenMit([{ a3: ziel.a3, id: ziel.id, name: ziel.name },
    { a3: ziel.gegenA3, id: `gegen:${ziel.gegenA3}`, name: ziel.gegen }],
    st.keim + st.i * 7919);

  const protokollieren = (ergebnis, roh, fachVorher) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn,
      eingabeart: 'antippen' });
  const weiter = () => weiterIn(st);

  s.innerHTML = aufgabenKopf(st) + `
    <div class="frage" id="frage">Welche ist <strong>${ziel.name}</strong>?</div>
    <div class="flaggenfeld">
      <div class="flaggenwahl paare" id="auswahl">${zwei.map(x =>
        `<button class="flaggenkarte gross" data-id="${x.id}" aria-label="${x.name}"
          >${Flaggen.flaggeSvg(x.a3)}</button>`).join('')}</div>
      ${WEISSNICHT}
    </div>`;

  const ausschalten = () => s.querySelectorAll('.flaggenkarte')
    .forEach(k => k.disabled = true);
  /* NACH der Antwort bekommt JEDE der beiden ihren Namen - auch die
     falsche. Wer „das ist Luxemburg" liest, hat in diesem Augenblick zwei
     Flaggen gelernt statt einer; nur die eigene zu benennen waere die
     halbe Lehre. */
  const beideBenennen = () => {
    for (const x of zwei) {
      const k = s.querySelector(`.flaggenkarte[data-id="${x.id}"]`);
      if (!k || k.querySelector('.paarname')) continue;
      const n = el('div', 'paarname'); n.textContent = x.name;
      k.appendChild(n);
      if (x.id === ziel.id) k.classList.add('stimmt');
    }
  };
  const erklaeren = () => {
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = `<span class="loesung">${ziel.grund}</span>`;
    sagen(ziel.grund);
  };

  function aufloesen(){
    if (erledigt) return;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', '', fachVorher);
    ausschalten(); beideBenennen(); erklaeren();
    standSichern(st.ebeneId);
    setTimeout(weiter, LOBPAUSE);
  }

  function bewerte(id, knopf){
    if (erledigt) return;
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    if (id === ziel.id) {
      erledigt = beendet(s);
      const neuerAufkleber = werten(ziel, 'richtig', versuch);
      kopfNachziehenIn(s);
      protokollieren('richtig', id, fachVorher);
      ausschalten(); beideBenennen();
      /* Der Unterschied steht NEBEN dem Lob und nicht statt seiner:
         `nebenbei` ist genau dafuer da (die Hauptstadtebene nutzt es fuer
         ihre Fallen). Wer richtig lag, soll trotzdem erfahren, WORAN. */
      lobsatz(s, `<strong>${ziel.name}</strong>.`, null, lob(), ziel.grund,
        neuerAufkleber);
      sagen(lob() + '. ' + ziel.grund);
      standSichern(st.ebeneId);
      setTimeout(weiter, LOBPAUSE);
      return;
    }
    protokollieren('falsch', id, fachVorher);
    klangZu('falsch');
    /* NUR EIN Versuch bei zwei Moeglichkeiten.
     *
     * Ein zweiter waere keiner: es bleibt genau eine uebrig. „Noch einmal
     * versuchen" hiesse hier „tippe auf die andere", und das ist kein
     * Ueberlegen, sondern ein Ausschlussverfahren mit einem Schritt.
     * Deshalb geht es sofort in die Aufloesung - mit der Erklaerung, die
     * ohnehin die Sache ist. */
    wackelt(knopf);
    setTimeout(aufloesen, 260);
  }

  s.querySelectorAll('.flaggenkarte').forEach(k =>
    k.onclick = () => bewerte(k.dataset.id, k));
  ausweg(s, aufloesen,
    () => tippWegnehmen(s, '#auswahl .flaggenkarte', x => x.dataset.id === ziel.id));
  s.querySelector('#zur').onclick = () => zeige(pauseSchirm);
  ansagen(`Welche ist ${ziel.name}?`);
  return s;
}

/* ---------- Der Schreibschirm (N2a, N3, N4) ------------------------------
 *
 * Vier Ebenen, ein Bildschirm:
 *
 *   schreiben:buchstaben  Vorlage nachfahren, dann frei schreiben
 *   schreiben:diktat      angesagt, ohne Vorlage geschrieben
 *   schreiben:ziffern     dasselbe wie oben, mit den zehn Ziffern
 *   schreiben:zahlen      angesagt: „vierzehn" - geschrieben in ZWEI Feldern
 *
 * Zwei Achsen, und beide sind Eigenschaften der AUFGABE, nicht des
 * Bildschirms: ob eine Vorlage dasteht (`ansage`), und wie viele Zeichen
 * geschrieben werden (`ziel.zeichenFolge`). Ein Bildschirm, der beides
 * ablaeuft, ist einer statt vier - und vier waeren vier Stellen, an denen
 * die naechste Aenderung dreimal vergessen wird.
 *
 * Was NICHT gezaehlt wird: Fehlversuche beim Nachfahren. Wer auf der Linie
 * abrutscht, hat nichts falsch gemacht, sondern geuebt. Die drei Versuche
 * gehoeren dem freien Schreiben, so wie bei jeder anderen Aufgabe auch.
 */
function schreibschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const beginn = Date.now();
  let versuch = 0, erledigt = false;

  /* Wird die Aufgabe ANGESAGT oder gezeigt?
   *
   * Bei „:diktat" und „:zahlen" steht der gesuchte Buchstabe bzw. die Zahl
   * NIRGENDS - weder in der Frage noch in einer Beschriftung. Sonst waere
   * das Diktat ein Abmalen mit Ton. Der Rauchtest prueft genau das. */
  const ansage = /:(diktat|zahlen)$/.test(st.ebeneId);
  /** Die Zeichen, die geschrieben werden. Bei der 14 sind es zwei. */
  const folge = ziel.zeichenFolge || [ziel.zeichen];
  /** Wogegen erkannt wird - Buchstaben oder Ziffern. Nie beides. */
  const satz = ziel.satz === 'ziffern' ? Schreiben.ZIFFERN : Schreiben.BUCHSTABEN;
  /* Der Satz steht EINMAL. Er wird an zwei Stellen gebraucht - beim Aufbau
     und noch einmal, wenn der Ton nachtraeglich angeht -, und zwei
     Abschriften desselben Satzes sind zwei Saetze, sobald einer geaendert
     wird. Er darf ausserdem das Gesuchte NICHT nennen; eine stehende
     Gegenprobe greift genau diese Zeile an. */
  const DIKTATFRAGE = ziel.satz === 'ziffern'
    ? 'Schreib die Zahl, die du hörst.'
    : 'Schreib den Buchstaben, den du hörst.';

  let phase = ansage ? 'frei' : 'nach';   // 'nach' -> 'frei'
  let zugNr = 0;                          // welcher Zug der Vorlage dran ist
  let fertig = [];                        // die schon nachgefahrenen Zuege
  let meine = folge.map(() => []);        // je Feld die frei geschriebenen Zuege
  /* Die Zuege der Aufgabe selbst.
   *
   * Bei einem Buchstaben und einer Ziffer steht das am Gegenstand; eine
   * ZAHL hat keine eigenen - sie besteht aus ihren Ziffern. Der erste
   * Anlauf griff hier auf `eigeneZuege.length` zu und stuerzte bei jeder
   * einstelligen Zahl ab: der Bildschirm stand da, nahm aber nichts an. */
  const eigeneZuege = ziel.zuege || Schreiben.zuegeVon(folge[0]);
  let laeuft = null;                      // { feld, punkte } unter dem Finger

  s.innerHTML = aufgabenKopf(st) + `
    <div class="schreibraum">
    <div class="frage" id="frage">${ansage
      ? (tonAn ? DIKTATFRAGE
               : '<span class="fastText">Für diese Übung brauchst du den Ton.</span>')
      : `Fahre das <strong>${ziel.zeichen}</strong> nach.`}</div>
    <div class="schreibfeld"><div class="blaetter">${folge.map((z, i) => `
      <div class="feldkasten">
        <svg class="schreibblatt" data-feld="${i}" viewBox="0 0 100 100" role="application"
             aria-label="${ansage ? `Schreibfläche ${i + 1} von ${folge.length}`
                                  : `Schreibfläche für ${ziel.zeichen}`}">
          <g class="linien" aria-hidden="true">
            <line x1="0" y1="10" x2="100" y2="10"/>
            <line x1="0" y1="90" x2="100" y2="90"/>
          </g>
          <g class="vorlage" aria-hidden="true"></g>
          <g class="gemalt" aria-hidden="true"></g>
          <path class="zug" aria-hidden="true"/>
          <g class="anfang" aria-hidden="true"></g>
        </svg>
      </div>`).join('')}</div></div>
    <div class="werkzeug">
      <button class="knopf haupt" id="fertigknopf" hidden>Fertig</button>${ansage ? `
      <button class="knopf" id="hoeren">${
        tonAn ? 'Noch mal hören' : 'Ton einschalten'}</button>` : ''}
      ${/* Auch dieser Knopf traegt jetzt sein Zeichen (S12b).
           Er stand neben dem Ausweg, und seit der sein Fragezeichen hat,
           war er der einzige ohne - auf Fionas Bildschirm, und sie ist
           sechs und liest nicht. „Jeder Knopf traegt ein Zeichen" ist
           die haerteste Zusage dieser App; sie gilt nicht nur fuer die
           Knoepfe, an die man gerade denkt.
           Der Kreispfeil und nicht der Papierkorb: der Knopf wischt zwar
           die Striche weg, aber er tut es, damit derselbe Buchstabe noch
           einmal drankommt - dasselbe wie „Noch mal" auf dem
           Endbildschirm, nur eine Ebene kleiner. Ein Papierkorb hiesse
           „weg damit", und das ist es nicht. */
        ''}<button class="leise" id="nochmal">${ZEI('nochmal', 20)}Noch mal</button>
      ${/* Hier stand derselbe Knopf OHNE Zeichen - als einziger von neun.
           Und ausgerechnet auf Fionas Bildschirm: sie ist sechs und
           liest nicht, „Weiß ich nicht" ist fuer sie ein Muster. Die
           Zusage „jeder Knopf traegt ein Zeichen" gilt seit S12 auch
           hier, weil es nur noch EINEN Knopf gibt. */ WEISSNICHT_KNOPF}
    </div></div>`;

  const blaetter = [...s.querySelectorAll('.schreibblatt')];
  const fertigKnopf = s.querySelector('#fertigknopf');
  const sagFrage = (html, klasse='') => {
    const f = s.querySelector('#frage');
    if (f) f.innerHTML = klasse ? `<span class="${klasse}">${html}</span>` : html;
  };
  const alsPfad = (punkte) => punkte.length < 2 ? ''
    : 'M' + punkte.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');

  /** Alles neu zeichnen. Eine Stelle, damit kein Zustand zweimal gilt. */
  function malen(){
    blaetter.forEach((blatt, i) => {
      // Die Vorlage steht nur beim Nachfahren - und beim Vormachen, wenn
      // nach drei Fehlversuchen gezeigt wird, wie es geht.
      blatt.querySelector('.vorlage').innerHTML =
        phase === 'nach' ? eigeneZuege.map((d, k) => `<path d="${d}" class="${
            k < zugNr ? 'schon' : k === zugNr ? 'dran' : 'spaeter'}"/>`).join('')
      : phase === 'zeigen' ? Schreiben.zuegeVon(folge[i]).map((d, k) =>
            `<path d="${d}" class="dran malt" pathLength="100" style="animation-duration:${
              VORMACHEN_JE_ZUG}ms;animation-delay:${k * VORMACHEN_JE_ZUG}ms"/>`).join('')
      : '';
      blatt.querySelector('.gemalt').innerHTML =
        (phase === 'nach' ? fertig : meine[i]).map(z => `<path d="${alsPfad(z)}"/>`).join('');
      blatt.querySelector('.zug').setAttribute('d',
        laeuft && laeuft.feld === i ? alsPfad(laeuft.punkte) : '');
      /* Der Anfangspunkt wird GEZEICHNET oder nicht - nicht versteckt.
       *
       * Der erste Anlauf setzte `kreis.hidden = true`. Das tut nichts:
       * `hidden` ist eine Eigenschaft von HTML-Elementen, ein `<circle>`
       * ist keines. Der gruene Punkt stand deshalb auch noch da, als die
       * Vorlage laengst weg war. Gesehen auf der Aufnahme, nicht gemessen. */
      const zeig = phase === 'nach' && !laeuft && zugNr < eigeneZuege.length;
      const p = zeig ? Schreiben.abtasten(eigeneZuege[zugNr], 2)[0] : null;
      blatt.querySelector('.anfang').innerHTML = p
        ? `<circle class="anfang-punkt" cx="${p[0]}" cy="${p[1]}" r="5"/>` : '';
    });
    fertigKnopf.hidden = phase !== 'frei' || !meine.some(m => m.length);
  }

  /* Vom Finger in den Kasten - ueber die Matrix des SVG, nicht ueber seinen
   * Rahmen.
   *
   * Der erste Anlauf rechnete `getBoundingClientRect` gegen 100 und setzte
   * dabei voraus, dass das Feld quadratisch ist. Es war es nicht: ein SVG
   * ist von sich aus 100 % breit, und `aspect-ratio` allein aendert daran
   * nichts. Der Buchstabe stand mittig und klein in einem breiten Kasten,
   * der Finger landete daneben - und zwar unsichtbar, denn gezeichnet
   * wurde ja an der richtigen Stelle, nur gemessen an der falschen.
   *
   * `getScreenCTM()` ist genau die Abbildung, die der Browser selbst
   * benutzt. Damit haengt die Richtigkeit nicht mehr am Stilblatt. */
  const zuKasten = (blatt, ev) => {
    const p = blatt.createSVGPoint();
    p.x = ev.clientX; p.y = ev.clientY;
    const q = p.matrixTransform(blatt.getScreenCTM().inverse());
    return [q.x, q.y];
  };

  function anfangen(blatt, i, ev){
    if (erledigt) return;
    ev.preventDefault();
    try { blatt.setPointerCapture(ev.pointerId); } catch(e){}
    laeuft = { feld: i, punkte: [zuKasten(blatt, ev)] };
    malen();
  }
  function ziehen(blatt, i, ev){
    if (!laeuft || laeuft.feld !== i) return;
    ev.preventDefault();
    const p = zuKasten(blatt, ev);
    const letzt = laeuft.punkte[laeuft.punkte.length-1];
    // Punkte, die praktisch aufeinanderliegen, bringen nichts und machen
    // die Messung langsam: bei 36 Vorlagen x 48 Punkten zaehlt das.
    if (Math.hypot(p[0]-letzt[0], p[1]-letzt[1]) > 0.8) { laeuft.punkte.push(p); malen(); }
  }
  function loslassen(){
    if (!laeuft) return;
    const { feld, punkte } = laeuft; laeuft = null;
    if (punkte.length < 3) { malen(); return; }   // ein Tipper ist kein Zug
    if (phase === 'nach') nachfahrenWerten(punkte);
    else if (phase === 'frei') {
      meine[feld].push(punkte); malen();
      // Von selbst pruefen nur, wenn es EIN Feld gibt und die erwartete
      // Zahl von Zuegen da ist. Bei zwei Feldern waere jeder Zeitpunkt
      // geraten - dort entscheidet der Knopf.
      if (folge.length === 1 && meine[0].length >= eigeneZuege.length)
        setTimeout(pruefen, 500);
    }
  }

  /** Ein nachgefahrener Zug - und wenn er nicht sass, WORAN es lag. */
  function nachfahrenWerten(zug){
    const r = Schreiben.nachgefahren(eigeneZuege[zugNr], zug);
    if (!r.gut) {
      klangZu('falsch');
      // Der Grund wird benannt, nicht nur die Ablehnung. Genau das ist der
      // Unterschied zwischen „nicht ganz" und einer Hilfe (A3 im ANTON-
      // Abgleich, hier von Anfang an eingebaut).
      const satzHin = !r.richtig ? 'Fang beim Punkt an.'
                    : !r.ganz    ? 'Fahre den Strich ganz zu Ende.'
                    : r.deckung < Schreiben.DECKUNG_MIN ? 'Fahre die ganze Linie nach.'
                    : 'Bleib auf der Linie.';
      sagFrage(satzHin, 'fastText'); sagen(satzHin);
      malen();
      return;
    }
    fertig.push(zug); zugNr++;
    klangZu('richtig');
    if (zugNr < eigeneZuege.length) {
      const satzHin = `Gut. Jetzt der ${zugNr === 1 ? 'zweite' : zugNr === 2 ? 'dritte' : 'nächste'} Strich.`;
      sagFrage(satzHin); sagen(satzHin);
      malen();
      return;
    }
    // Alle Zuege sitzen: die Vorlage geht weg, jetzt schreibt sie selbst.
    phase = 'frei'; meine = folge.map(() => []);
    sagFrage(`Genau! Jetzt schreib das <strong>${ziel.zeichen}</strong> selbst.`);
    sagen(`Genau! Jetzt schreib das ${ziel.zeichen} selbst.`);
    malen();
  }

  const protokollieren = (ergebnis, roh, fachVorher) =>
    eintragen(st, ziel, { ergebnis, roh, fachVorher, versuch, beginn,
      eingabeart: 'schreiben' });

  const weiter = () => weiterIn(st);

  /** Vormachen statt ablehnen - nach drei Fehlversuchen oder auf Wunsch. */
  function aufloesen(){
    if (erledigt) return;
    erledigt = beendet(s);
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
    st.wie[st.i] = 'gezeigt';
    kopfNachziehenIn(s);
    protokollieren('gezeigt', '', fachVorher);
    phase = 'zeigen'; meine = folge.map(() => []); laeuft = null;
    malen();
    sagFrage(`Kein Problem. So geht ${folge.length > 1 ? 'die' : 'das'} `
      + `<strong>${ziel.zeichen}</strong>.`, 'loesung');
    sagen(`Kein Problem. ${ziel.geloest}.`);
    standSichern(st.ebeneId);
    // Auch das Vormachen geht durch `schauPause`: sonst wartet der
    // Rauchtest bei jedem Zeichen drei Sekunden, die er nicht prueft -
    // genau der Fall, den der Kartenweg schon einmal gekostet hat.
    const zuege = Math.max(...folge.map(z => Schreiben.zuegeVon(z).length));
    setTimeout(weiter, LOBPAUSE + schauPause(zuege * VORMACHEN_JE_ZUG));
  }

  /** Das frei Geschriebene beurteilen - Feld fuer Feld. */
  function pruefen(){
    if (erledigt || phase !== 'frei' || !meine.some(m => m.length)) return;
    versuch++;
    const fachVorher = Stand[ziel.id]?.fach ?? 1;
    const gelesen = meine.map(m => Schreiben.erkennen(m, satz));
    const stimmt = gelesen.every((e, i) => e.sicher && e.zeichen === folge[i]);
    if (stimmt) {
      erledigt = beendet(s);
      const neuerAufkleber = werten(ziel, 'richtig', versuch);
      kopfNachziehenIn(s);
      protokollieren('richtig', gelesen.map(e => e.zeichen).join(''), fachVorher);
      const spruch = lob();
      lobsatz(s, `${folge.length > 1 ? 'Das ist die' : 'Das ist ein'} ${ziel.zeichen}.`,
        null, spruch, '', neuerAufkleber);
      sagen(`${spruch} ${ziel.geloest}.` + kleberSatz(neuerAufkleber));
      setTimeout(weiter, LOBPAUSE);
      return;
    }
    protokollieren('falsch', gelesen.map(e => e.zeichen || '?').join(''), fachVorher);
    klangZu('falsch');
    if (versuch >= 3) return aufloesen();
    /* Auch hier wird der Fehler BENANNT, wo das ehrlich geht: wenn etwas
     * sicher erkannt wurde, nur eben das Falsche, ist das eine Auskunft.
     * Bei „unsicher" waere sie geraten - dann sagt sie es lieber.
     *
     * Im Diktat wird das GESUCHTE nicht genannt: es steht dort nirgends,
     * und es im Tadel nachzuliefern hiesse, die Aufgabe nach dem ersten
     * Fehlversuch zu verraten. */
    const daneben = gelesen.findIndex((e, i) => !(e.sicher && e.zeichen === folge[i]));
    const e = gelesen[daneben];
    const wo = folge.length > 1 ? ` im ${daneben === 0 ? 'ersten' : 'zweiten'} Feld` : '';
    const nochmal = ansage ? 'Versuch es noch einmal.'
                           : `Probier das ${ziel.zeichen} noch einmal.`;
    const satzHin = e && e.sicher
      ? `Das sieht${wo} aus wie ein ${e.zeichen}. ${nochmal}`
      : `Das kann ich${wo} noch nicht lesen. ${nochmal}`;
    sagFrage(satzHin, 'fastText'); sagen(satzHin);
    meine = folge.map(() => []); malen();
  }

  blaetter.forEach((blatt, i) => {
    blatt.addEventListener('pointerdown', (ev)=>anfangen(blatt, i, ev));
    blatt.addEventListener('pointermove', (ev)=>ziehen(blatt, i, ev));
    blatt.addEventListener('pointerup', loslassen);
    blatt.addEventListener('pointercancel', loslassen);
    blatt.addEventListener('pointerleave', loslassen);
  });

  fertigKnopf.onclick = pruefen;
  /* „Noch mal hören" spricht IMMER - auch wenn das Profil sonst nichts
     vorgelesen bekaeme. Wer ausdruecklich darauf tippt, hat gebeten, und
     eine Bitte wird nicht vom Profil beantwortet.

     Und wenn der Ton AUS ist, schaltet derselbe Knopf ihn an.

     Das ist kein Sonderfall, sondern eine Sackgasse: auf diesen Ebenen
     existiert die Aufgabe NUR gesprochen. Wer den Ton einmal ausgeschaltet
     hat - der Knopf steht auf der Profilwahl -, bekaeme hier ein leeres
     Blatt und keinen Hinweis, worauf er wartet. */
  const hoeren = s.querySelector('#hoeren');
  if (hoeren) hoeren.onclick = async ()=>{
    if (!tonAn) {
      tonAn = true; Einst.ton = true; await einstSichern();
      hoeren.textContent = 'Noch mal hören';
      const f = s.querySelector('#frage');
      if (f) f.textContent = DIKTATFRAGE;
    }
    vorlesen(ziel.gesagt);
  };
  s.querySelector('#nochmal').onclick = ()=>{
    if (erledigt) return;
    laeuft = null;
    if (phase === 'frei') meine = folge.map(() => []);
    else { fertig = []; zugNr = 0; }
    malen();
  };
  ausweg(s, aufloesen);
  s.querySelector('#zur').onclick = ()=> zeige(pauseSchirm);

  malen();
  ansagen(ziel.gesagt);
  return s;
}

/* ---------- Der Spielbildschirm ------------------------------------------ */
/**
 * „Ich habe X verstanden. Stimmt das?" - mit zwei Knoepfen. (F2b)
 *
 * Sie stehen unter der Sprachzeile, nicht in der Antwortliste: was das
 * Geraet verstanden hat, gehoert zum Mikrofon, nicht zur Karte. `stelle`
 * ist der Rueckfall fuer Bildschirme ohne Sprachzeile.
 */
function rueckfrage(t, roh, ctx, { ziel, stelle, bewerte }) {
  const wo = ctx.status || stelle;
  if (ctx.status) ctx.status.textContent = t.id === ziel.id
    ? `Meintest du ${t.name}?` : `Ich habe „${t.name}" verstanden. Stimmt das?`;
  sagen(ctx.status ? ctx.status.textContent : '');
  let kasten = wo.parentNode.querySelector('#nachfrage');
  if (!kasten) {
    kasten = el('div','nachfrage'); kasten.id = 'nachfrage';
    wo.parentNode.insertBefore(kasten, wo.nextSibling);
  }
  kasten.innerHTML = '';
  const weg = ()=>{ kasten.remove(); };
  const ja = el('button','leise','Ja');
  ja.id = 'jaSicher';
  ja.onclick = ()=>{ weg(); bewerte(roh,'sprechen',{ ...ctx, bestaetigt:t }); };
  const nein = el('button','leise','Nein');
  nein.id = 'neinNochmal';
  // „Nein" kostet nichts. Der Irrtum lag beim Geraet, nicht beim Kind.
  nein.onclick = ()=>{ weg();
    if (ctx.status) ctx.status.textContent = 'Dann sag es noch einmal — tipp auf das Mikrofon.'; };
  kasten.append(ja, nein);
}

/**
 * Was aus einer Aeusserung wird - VOR dem Versuchszaehler. (F2b)
 *
 * NICHT VERSTANDEN IST KEIN FEHLVERSUCH.
 *
 * Der Abgleich stand bis F14 unter dem Zaehler: eine Aeusserung, die die
 * Erkennung verschluckt hat, kostete einen der drei Versuche - und nach
 * dreien loeste die App die Aufgabe auf. Wer dreimal hintereinander
 * undeutlich verstanden wurde, bekam die Antwort gezeigt, ohne ein
 * einziges Mal falsch geraten zu haben.
 *
 * Das ist nicht dasselbe wie eine falsche Antwort: „ich habe dich nicht
 * gehoert" ist eine Aussage ueber MICH, nicht ueber das Kind. Es steht
 * deshalb VOR dem Zaehler und geht ohne Wertung wieder heraus -
 * protokolliert wird es trotzdem, denn genau diese Zeilen sind das
 * Rohmaterial fuer den eingefrorenen Korpus (M4r). Die Protokollzeile
 * schreibt die EBENE (`unverstanden`): sie allein weiss, welche Felder
 * ihr Gegenstand hat.
 *
 * Und der Satz nennt, WAS angekommen ist. „Das habe ich nicht verstanden"
 * sagt niemandem, ob das Mikrofon nichts gehoert hat oder ob der Abgleich
 * das Gehoerte nicht zuordnen konnte - genau daran ist die Fehlersuche
 * vom Zielgeraet haengengeblieben.
 *
 * DIE RUECKFRAGE WIRD GESTELLT - UND BEANTWORTBAR (F15). Der Abgleich
 * kennt drei Ausgaenge, und der mittlere ist der wichtigste: er
 * verwandelt eine Erkennungsschwaeche in eine Bestaetigungsfrage. Sie
 * kostet nichts, bis sie beantwortet ist:
 *   Ja   -> gewertet wie gesprochen (richtig, wenn es das Ziel war;
 *           falsch, wenn das Kind einen anderen Namen bestaetigt)
 *   Nein -> kein Versuch verbraucht, noch einmal sprechen
 * Warum „Ja" bei einem FREMDEN Namen trotzdem falsch zaehlt: sonst waere
 * die Rueckfrage ein Freifahrtschein. Bestaetigt wird, was verstanden
 * wurde - nicht, dass es stimmt.
 *
 * Gibt `null` zurueck, wenn schon reagiert wurde - dann ist die Aufgabe
 * noch offen und hat nichts gekostet.
 */
function erhoert(roh, ctx, { kand, ziel, stelle, bewerte, unverstanden }) {
  /* Eine BESTAETIGTE Rueckfrage kommt ein zweites Mal herein - dann steht
     das Urteil schon fest und wird nicht neu erhoert. */
  if (ctx.bestaetigt) return { ...ctx.bestaetigt, art:'angenommen' };
  const t = Vergleich.hoerAbgleich(ctx.varianten || [roh], kand);
  if (t.art === 'nochmal') {
    const satz = roh ? `Ich habe „${roh}“ verstanden. Sag es noch einmal.`
                     : 'Ich habe nichts gehört. Sag es noch einmal.';
    if (ctx.status) ctx.status.textContent = satz;
    sagen(satz);
    if (unverstanden) unverstanden(roh);
    return null;
  }
  if (t.art === 'rueckfrage') { rueckfrage(t, roh, ctx, { ziel, stelle, bewerte }); return null; }
  return t;
}

/* ---------- Der Sprachweg als BAUTEIL (F2b) ------------------------------
 *
 * Er sass bis hierher in `spielschirm` eingewachsen: Mikrofon,
 * Zwischenergebnis, Frist, der EINE Ausgang aus F13. Hundertsiebzig
 * Zeilen, in denen vier gemeldete Fehler stecken (F13, F14, F15) - und
 * jede zweite Fassung davon haette sie wieder.
 *
 * Damit sprechen jetzt ZWEI Bildschirme: die Karte und die Flaggen. Der
 * Aufrufer stellt nur `bewerte(roh, 'sprechen', { status, varianten })` -
 * was aus dem Gehoerten wird, weiss die Ebene, nicht das Mikrofon.
 *
 * `werkzeug` ist die Zeile mit den Knoepfen, `liste` die Stelle darunter,
 * an der die Sprachzeile stehen darf. Beide werden mitgegeben und nicht
 * gesucht: der Flaggenschirm hat keine Antwortliste, und ein Bauteil, das
 * sich seinen Platz selbst sucht, findet auf dem naechsten Bildschirm den
 * falschen.
 */
function sprachweg({ spricht, werkzeug, liste, bewerte, ohneErgebnis }) {
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
  /* Der Sprachweg - und warum er einen Zustand braucht (F13).
   *
   * Gemeldet vom Zielgeraet, gefunden von keinem Tor: „Ich habe den
   * Sprachmodus angeschaltet, im Spiel auf das Mikrofon getippt, es ging
   * los, ich habe reingesprochen - und konnte den Modus nicht mehr
   * beenden. Es kam keine Auswertung."
   *
   * Nachgesehen: der Knopf war ein EINWEG-Schalter. Er baute bei jedem
   * Tipp einen neuen Erkenner, startete ihn und vergass ihn sofort. Damit
   * fehlten drei Dinge auf einmal, und jedes einzelne haette gereicht:
   *
   *   1. KEIN AUSSTIEG. Es gab nirgends ein `stop()`. Wer fertig
   *      gesprochen hatte, konnte das der App nicht sagen. Ein zweiter
   *      Tipp baute einen ZWEITEN Erkenner neben den ersten - auf iOS
   *      wirft das, und der Fang war weg.
   *   2. KEIN `onend`. Endet die Erkennung ohne Ergebnis - Stille, ein
   *      Abbruch durch das Betriebssystem, ein Wechsel in eine andere
   *      App -, dann feuert `onresult` nie. Die Zeile „… ich hoere" blieb
   *      stehen, fuer immer. Genau das war zu sehen.
   *   3. KEINE FRIST. Ohne Ergebnis und ohne Ende wartete die Anzeige
   *      unbegrenzt.
   *
   * Dazu ein vierter, den man nur sieht: der atmende Ring am Mikrofon lief
   * IMMER, auch wenn gar nicht zugehoert wurde. Die App sah also aus, als
   * hoerte sie zu, waehrend sie es nicht tat - und als hoerte sie weiter
   * zu, nachdem sie aufgehoert hatte. Der Ring atmet jetzt nur noch
   * waehrend des Zuhoerens.
   *
   * Der Knopf ist deshalb ein SCHALTER: der erste Tipp hoert zu, der
   * zweite sagt „fertig". Und jeder Weg heraus - Ergebnis, Fehler, Ende,
   * Frist - fuehrt durch `aufhoeren()`, damit es keinen Zustand gibt, aus
   * dem man nicht herauskommt.
   */
  if (kannSprechen && Erk) {
    const mik=el('button','mikro',MIKRO);
    mik.id = 'mikro';
    mik.setAttribute('aria-label','Antwort sprechen');
    const status=el('div','unter'); status.id='sprachstand';
    status.style.fontSize='var(--s-klein)';
    /* Wie lange hoechstens zugehoert wird.
     *
     * Nicht laenger: ein Kind spricht einen Landesnamen in zwei Sekunden.
     * Nicht kuerzer: ein langer Name mit einer Denkpause davor
     * braucht seine Zeit, und ein Fenster, das mitten im Wort zufaellt,
     * ist schlimmer als eines, das zu lange offen steht. */
    const HOERDAUER = 8000;
    let laeuft = null, uhr = null, gehoert = false, zwischen = null;
    /** Der EINE Weg heraus. Jeder Ausgang geht hier durch. */
    const aufhoeren = (satz) => {
      if (uhr) { clearTimeout(uhr); uhr = null; }
      laeuft = null;
      hoerenEndet();            // ab jetzt darf die App wieder reden
      mik.classList.remove('hoert');
      mik.setAttribute('aria-label','Antwort sprechen');
      if (satz) status.textContent = satz;
    };
    mik.onclick=()=>{
      // Zweiter Tipp heisst „fertig". `stop()` liefert das, was bis hierher
      // verstanden wurde - anders als `abort()`, das es wegwirft.
      if (laeuft) { try{ laeuft.stop(); }catch(err){ aufhoeren('Fertig.'); } return; }
      const e=new Erk();
      e.lang='de-DE'; e.maxAlternatives=3; e.continuous=false;
      // Zwischenergebnisse: sie beweisen dem Kind, dass etwas ankommt.
      // Wo der Browser sie nicht kann, aendert die Zeile nichts.
      e.interimResults=true;
      gehoert = false; zwischen = null;
      e.onresult=(ev)=>{
        /* ALLE Lesarten UND ALLE Abschnitte.
         *
         * Zwei Dinge, die frueher weggeworfen wurden:
         *
         * `maxAlternatives = 3` steht seit dem ersten Tag da - und es
         * wurde nur `r[0]` gelesen. Die Erkennung liefert ihre
         * Unsicherheit frei Haus, und die Menge der moeglichen Antworten
         * ist geschlossen: wir muessen nicht raten, welche Lesart stimmt,
         * wir koennen alle fragen.
         *
         * Und `ev.results` kann MEHRERE Abschnitte haben - das Geraet
         * schneidet eine Aeusserung an einer Atempause. Gelesen wurde nur
         * der letzte. Wer „Ich glaube | das ist Asien" sagte, verlor die
         * eine Haelfte; wer „Asien | glaube ich" sagte, verlor die
         * andere - und welche, hing an der Atempause. Jetzt kommen beide
         * mit, einzeln und aneinandergehaengt. */
        const varianten = [], stuecke = [];
        for (let n = 0; n < ev.results.length; n++) {
          const r = ev.results[n];
          for (let i = 0; i < r.length; i++) {
            const t = String(r[i].transcript).trim();
            if (t && !varianten.includes(t)) varianten.push(t);
            if (i === 0 && t) stuecke.push(t);
          }
        }
        const ganz = stuecke.join(' ').trim();
        if (ganz && !varianten.includes(ganz)) varianten.unshift(ganz);
        const roh = ganz || varianten[0] || '';
        if (!ev.results[ev.results.length-1].isFinal) {
          // Das Zwischenergebnis wird AUFGEHOBEN, nicht nur angezeigt:
          // wenn die Erkennung danach ohne Endergebnis abbricht - auf dem
          // Telefon der Normalfall bei Stille -, ist es alles, was wir
          // haben. Es wegzuwerfen hiesse, das Kind noch einmal sprechen
          // zu lassen, obwohl wir es verstanden haben.
          if (roh) zwischen = { roh, varianten };
          status.textContent = `… ${roh}`;
          return;
        }
        gehoert = true;
        zwischen = null;
        status.textContent=`gehört: „${roh}“`;
        try{ e.stop(); }catch(err){}
        aufhoeren();
        bewerte(roh,'sprechen',{status, varianten});
      };
      e.onerror=(ev)=>{
        const was = ev && ev.error;
        aufhoeren(
          was==='not-allowed' || was==='service-not-allowed'
            ? 'Das Mikrofon ist nicht erlaubt. Bitte in den Einstellungen freigeben.'
          : was==='no-speech'
            ? 'Ich habe nichts gehört — tipp noch mal und sag es laut.'
            : 'Das hat nicht geklappt — tipp noch mal auf das Mikrofon.');
        if (ohneErgebnis) ohneErgebnis(was || 'fehler');
      };
      /* Der Ausgang, der gefehlt hat. Er kommt IMMER - auch wenn das
       * Betriebssystem die Erkennung von sich aus beendet.
       *
       * Und er wirft nicht weg, was schon da war: endet die Erkennung
       * ohne Endergebnis, aber mit einem Zwischenergebnis, wird DAS
       * gewertet. Auf dem Telefon endet die Erkennung bei Stille von
       * selbst, und das letzte Zwischenergebnis ist dann oft der volle
       * Satz - er ging bisher verloren, und das Kind wurde gebeten, noch
       * einmal zu sagen, was es gerade gesagt hatte. */
      e.onend=()=>{
        if (gehoert) return aufhoeren();
        if (zwischen) {
          const z = zwischen; zwischen = null;
          status.textContent = `gehört: „${z.roh}“`;
          aufhoeren();
          bewerte(z.roh,'sprechen',{status, varianten:z.varianten});
          return;
        }
        aufhoeren('Fertig. Ich habe nichts verstanden — tipp noch mal auf das Mikrofon.');
        /* UND DIE EBENE ERFAEHRT ES (E6).
         *
         * Bis hierher endete ein Anlauf ohne Ergebnis still im Mikrofon:
         * die Sprachzeile sagte es, sonst niemand. Fuer die Karte reicht
         * das - dort ist die Aufgabe erst zu Ende, wenn etwas gewertet
         * wurde. „Sag es" faellt gar kein Urteil und kennt stattdessen
         * hoechstens zwei Anlaeufe; ohne diesen Ausgang koennte sie den
         * zweiten nicht zaehlen und ein Kind stuende vor einem Knopf,
         * der nie weitergeht. Der zweite Benutzer eines Bauteils zeigt,
         * was dem ersten gefehlt hat. */
        if (ohneErgebnis) ohneErgebnis('nichts');
      };
      try{
        hoerenBeginnt();        // Lautsprecher aus, BEVOR das Mikrofon angeht
        e.start();
        laeuft = e;
        mik.classList.add('hoert');
        mik.setAttribute('aria-label','Fertig — das Gesagte prüfen');
        status.textContent='… ich höre. Tipp noch mal, wenn du fertig bist.';
        uhr = setTimeout(()=>{ if (laeuft) { try{ laeuft.stop(); }catch(err){ aufhoeren('Fertig.'); } } },
          HOERDAUER);
      }catch(err){ aufhoeren('Mikrofon nicht verfügbar.'); }
    };
    werkzeug.appendChild(mik); liste.appendChild(status);
  }
}

/* ---------- Das Legebauteil: Ziehen mit Nachsicht (E8) -----------------
 *
 * Es hat drei Jahre lang genau EINEN Benutzer gehabt und wohnte deshalb
 * mitten in `spielschirm`: das Etikett, das auf ein Land gezogen wird.
 * Mit E8 (Buchstaben in Leerstellen legen) bekommt es einen zweiten, und
 * damit stellt sich dieselbe Frage wie bei `sprachweg`: nachbauen oder
 * herausloesen.
 *
 * Nachbauen waere teurer, als es aussieht. In diesen hundert Zeilen
 * stecken sechs gemessene Befunde, und keiner davon ist zu erraten: die
 * 6-Punkte-Schwelle zwischen Tippen und Ziehen, die abgeschaltete
 * Einlauf-Animation (eine CSS-Animation steht ueber dem Inline-Stil,
 * auch abgelaufen), die Drosselung der Umkreissuche auf ein Bild, das
 * Zuhoeren am Fenster statt `setPointerCapture`, das Haengen UNTER dem
 * Finger und die Grenze der Nachsicht. Eine zweite Fassung haette sie
 * alle wieder - und `tor/ziehen.mjs` misst nur die erste.
 *
 * Herausgeloest sind vier Nahtstellen, und sie sind genau das, was die
 * KARTE ausmacht:
 *
 *   ueber(x,y)        was liegt dort? Eine Marke, oder nichts. Was eine
 *                     Marke ist, weiss nur der Aufrufer - auf der Karte
 *                     eine Gebiets-Kennung, beim Legen eine Leerstelle.
 *   zeigen(marke)     was aufleuchtet. Nachsicht ohne Anzeige waere
 *                     Zauberei; ohne diese Nahtstelle koennte man sie
 *                     vergessen, und niemand saehe es.
 *   abgelegt(marke)   was eine Antwort IST. Der Aufrufer entscheidet.
 *   insLeere(b, von)  ins Nichts gezogen: keine falsche Antwort, sondern
 *                     gar keine. Der Satz dazu gehoert dem Aufrufer, denn
 *                     „Lass es auf dem Land los" gilt nur auf der Karte.
 *
 * Was NICHT herausgeloest ist: die Ringsuche selbst. Sie traegt die eine
 * Nachsichtszahl, und zwei Zahlen waeren zwei Nachsichten. Wer nachsichtig
 * treffen will, gibt seinen eigenen Treffertest hinein.
 */

/* Warum ueberhaupt Nachsicht: ein Kind zielt mit dem Daumen, und Luxemburg
 * ist auf der Europakarte kleiner als sein Fingerkuppenabdruck. Ohne
 * Nachsicht landet der Zug im Nachbarland oder im Meer, das Kind hat
 * richtig gedacht und falsch getroffen - und erfaehrt nie warum.
 *
 * Nachsicht heisst hier NICHT „die Flaeche wird groesser gerechnet".
 * Getestet wird weiter mit echtem Treffertest an echten Umrissen - nur
 * eben nicht an einem Punkt, sondern auf Ringen um ihn herum, von innen
 * nach aussen. Der erste Treffer gewinnt, also gewinnt immer das
 * naechstgelegene Ziel. Die Form bleibt die Form; nur der Finger darf
 * dicker sein als ein Bildpunkt.
 *
 * Der Ring hoert bei NACHSICHT auf. Ohne Grenze traefe jeder Wurf
 * irgendetwas, und ein Fehlgriff mitten im Meer wuerde als falsche
 * Antwort gewertet - das kostet einen der drei Versuche fuer etwas, das
 * gar keine Antwort war.
 */
const NACHSICHT = 60;                      // Bildpunkte
/**
 * Ringsuche um einen Punkt. `treffer(px,py)` gibt eine Marke oder nichts.
 *
 * Gibt `{ marke, genau }` zurueck - `genau` sagt, ob schon der Punkt selbst
 * getroffen hat. Die Karte braucht das fuer ihren Hinweis „liegt weiter
 * oben"; wer es nicht braucht, sieht es nicht an.
 */
function nachsichtig(treffer, x, y){
  const genau = treffer(x, y);
  if (genau) return { marke: genau, genau: true };
  for (let r = 10; r <= NACHSICHT; r += 10) {
    for (let i = 0; i < 16; i++) {
      const w = i * Math.PI / 8;
      const m = treffer(x + Math.cos(w) * r, y + Math.sin(w) * r);
      if (m) return { marke: m, genau: false };
    }
  }
  return null;
}

/**
 * Wo haengt das Gezogene, waehrend es am Finger ist?
 *
 * NICHT unter dem Finger. Ein Bildschirmfoto vom iPhone quer zeigt den
 * Grund: das groesste Etikett war 240 x 160 Punkte gross (bis A5
 * „Australien und Ozeanien", zweizeilig), Australien auf der Weltkarte
 * 60 x 50 - mittig am Finger deckt das Etikett sein eigenes Ziel
 * VOLLSTAENDIG zu. Das Aufleuchten nuetzt dann nichts, weil niemand es
 * sieht.
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

/** Das Gezogene fliegt sichtbar an seinen Platz zurueck statt zu blinken. */
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
 * Macht ein Element ziehbar. Die vier Nahtstellen stehen im Kopf oben.
 *
 * `beimAufheben` ist die fuenfte und die kleinste: die Karte liest den
 * Namen vor, sobald das Etikett am Finger haengt. Ein Buchstabe hat
 * nichts vorzulesen, was ein Kind weiterbraechte.
 */
function ziehbar(b, { ueber, zeigen, abgelegt, insLeere, beimAufheben }){
  // Nicht `setPointerCapture`: das Gezogene klebt am Finger und faengt
  // damit jeden Treffertest ab. Es hoert waehrend des Zuges auf,
  // anfassbar zu sein (`.zieht{pointer-events:none}`) - und dann liefe
  // der Fang ins Leere. Das Fenster hoert stattdessen zu; das haelt den
  // Zug auch, wenn der Finger das Element verlaesst.
  //
  // Aufgehoben wird erst nach 6 Punkten Weg. Vorher ist es ein Tippen,
  // und Tippen soll den Namen vorlesen, nicht das Element verschieben -
  // sonst zuckt es bei jeder Beruehrung.
  let start=null, heim=null, zeiger=null, auf=false, zug=null;
  // Das Element folgt dem Finger in JEDEM Ereignis - das ist billig und
  // darf nicht ruckeln. Die Umkreissuche dagegen kostet ueber dem Meer
  // bis zu 96 Treffertests, und jeder davon erzwingt einen Durchlauf des
  // Stylings. Einmal je Bild reicht: schneller als das Auge ist ohnehin
  // keine Anzeige.
  let angemeldet=false, zuletzt=null;
  // Beim Aufheben wird aus der Antwortkachel ein SCHILD.
  //
  // Die Kachel war bis A5 240 x 160 Punkte gross („Australien und
  // Ozeanien" brach auf zwei Zeilen), Australien auf der Weltkarte
  // 60 x 50 - am Finger deckt sie mehrere Gebiete auf einmal zu. Als
  // einzeiliges Schild ist sie rund ein Drittel so gross. Die Breite wird
  // deshalb NICHT festgehalten: ohne Breite schrumpft ein
  // `position:fixed` Kasten auf seinen Inhalt.
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
    /* Solange etwas am Finger haengt, sind die Lupenknoepfe TAUB.
     *
     * Sie liegen ueber der Karte, und wer sein Etikett dort ablegt,
     * legt es auf einen Knopf statt auf ein Land - `elementFromPoint`
     * liefert den Knopf, die Umkreissuche findet nichts, und die
     * Antwort ist weg. Gemessen von `ziehen`: von oben traf man nur
     * noch bis 30 statt 40 Punkte, sobald die Knoepfe dastanden. */
    document.body.dataset.zieht = '1';
    b.style.left=heim.left+'px'; b.style.top=heim.top+'px'; b.style.margin='0';
    const z=b.getBoundingClientRect(); zug={b:z.width,h:z.height};
    if (beimAufheben) beimAufheben(); };
  const bewegen=(ev)=>{ if(!start||ev.pointerId!==zeiger) return;
    if(!auf){ if(Math.hypot(ev.clientX-start.x, ev.clientY-start.y) < 6) return; aufheben(); }
    b.style.transform = haengen(heim, zug, ev.clientX, ev.clientY);
    zuletzt={x:ev.clientX,y:ev.clientY};
    if (angemeldet) return;
    angemeldet=true;
    requestAnimationFrame(()=>{ angemeldet=false;
      if(!start||!zuletzt) return;
      zeigen(ueber(zuletzt.x, zuletzt.y));
    });
  };
  const aufraeumen=()=>{
    delete document.body.dataset.zieht;
    b.classList.remove('zieht'); b.style.position=''; b.style.left='';
    b.style.top=''; b.style.width=''; b.style.margin=''; b.style.transform='';
    b.style.animation='';
    zeigen(null); start=null; zeiger=null; auf=false; zug=null;
    removeEventListener('pointermove',bewegen);
    removeEventListener('pointerup',los);
    removeEventListener('pointercancel',abbruch);
  };
  const abbruch=()=>aufraeumen();
  const los=(ev)=>{ if(!start||ev.pointerId!==zeiger) return;
    // Nie aufgehoben: das war ein Tippen. Der Klickhandler liest vor.
    if(!auf){ aufraeumen(); return; }
    const t = ueber(ev.clientX, ev.clientY);
    const von = b.getBoundingClientRect();
    aufraeumen();
    // Der Ablegepunkt wandert mit: aus ihm und dem Anker des gesuchten
    // Gebiets wird der Hinweis „liegt weiter oben" (A3).
    if (t) { abgelegt(t, { etikett:b, punkt:{ x:ev.clientX, y:ev.clientY }, von }); return; }
    // Ins Leere gezogen. Das ist keine falsche Antwort - es war gar
    // keine. Es kostet keinen Versuch, aber es bleibt sichtbar.
    insLeere(b, von);
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

function spielschirm(){
  const s = el('div'), st = Sitzung, ziel = st.liste[st.i];
  const [art, kont] = st.ebeneId.split(':');
  const istHaupt = art==='hauptstaedte';
  /* „Wer grenzt an wen?" (I21) beantwortet man auf der KARTE - wie die
     umgekehrte Frage, und aus demselben Grund: die Antwort ist ein Ort,
     kein Name. Sie ist trotzdem nicht dieselbe Frage, und deshalb zwei
     Namen und nicht einer:
       `umgekehrt` heisst „das gesuchte Gebiet ist NICHT markiert" -
          sonst stuende die Antwort auf der Karte.
       `karteAntwortet` heisst „getippt wird auf die Karte".
     Bei den Nachbarn ist das erste falsch und das zweite wahr: das
     gefragte Land MUSS hervorgehoben sein, es ist ja der Bezugspunkt.
     Der erste Anlauf hatte beides an `umgekehrt` haengen, und damit war
     Hessen unsichtbar - „Welches Bundesland grenzt an Hessen?" auf einer
     Karte ohne Hessen. */
  const istNachbar = art==='nachbarn';
  /* „Was ist groesser?" (I22) - und warum `istNachbar` dafuer NICHT das
     Vorbild ist, obwohl beide auf der Karte beantwortet werden:
       bei den Nachbarn ist das markierte Gebiet der BEZUG der Frage und
          nie die Antwort;
       hier sind ZWEI Gebiete markiert, und genau eines davon IST die
          Antwort.
     Deshalb steht ueberall dort, wo bisher „das gesuchte Gebiet" stand,
     jetzt `zielIds` - eine Liste, die bei allen anderen Ebenen genau ein
     Stueck lang ist. */
  const istGroesser = art==='groesser';
  const zielIds = istGroesser ? [ziel.gross, ziel.klein] : [ziel.id];
  /* Der Schalter steht HIER, weil die Flaechen ihn schon brauchen.
   *
   * Er stand zuerst weiter unten bei den Antwortwegen - dort, wo er
   * inhaltlich hingehoert. Dann warf der Bildschirm eine
   * ReferenceError, noch bevor er gebaut war: `const` gilt erst ab
   * seiner Zeile, und die Flaechen werden sechzig Zeilen frueher
   * gerechnet. Der Rauchtest meldete nur „Karte nicht da". */

  const kannLesen = P.eingabe.includes('tippen');
  /* ... und nur fuer Gebiete, die man auch treffen kann (P7).
   *
   * Gemessen am Bildschirm hat `npm run ziehen` (Abschnitt `treffer`)
   * Trefferflaechen von 7,6 Bildpunkten gefunden - Haiti und die
   * Dominikanische Republik liegen 4,2 Punkte auseinander, dort passt
   * kein Kreis mehr zwischen zwei Anker. Die Fingergrenze ist 44.
   *
   * Der erste Gedanke war, die Karte fuer diese Frage zu ZOOMEN. Er ist
   * falsch, und zwar an der Wurzel: „Wo liegt Luxemburg?" mit einer auf
   * Luxemburg gezoomten Karte beantwortet sich selbst. Die umgekehrte
   * Frage lebt davon, dass die ganze Karte dasteht.
   *
   * Also andersherum: sie wird fuer solche Gebiete nicht gestellt. Das
   * Kind lernt Haiti weiter - ueber den Namen, nicht ueber einen
   * Vier-Punkt-Treffer. `st.i % 3 === 2` sorgt dafuer, dass die
   * umgekehrte Frage nie die erste ist; bis dahin hat `trefferflaechen`
   * laengst gemessen, und `kreisPx` steht. */
  /* „Auf die Karte" (F4) ist IMMER die umgekehrte Frage - das ist ihr
     ganzer Zweck. Sonst bleibt es bei jeder dritten (B3). */
  const aufKarte = art === 'flaggen' && kont === 'karte';
  const umgekehrt = aufKarte
    || (kannLesen && !istHaupt && !istNachbar && !istGroesser
        && st.i % 3 === 2 && tippbar(ziel.id));
  const karteAntwortet = umgekehrt || istNachbar || istGroesser;
  // Auswahl mit VIER Moeglichkeiten - bei den Hauptstaedten und bei den
  // Bundeslaendern. Sechzehn Namen zu kennen ist die Aufgabe; sechzehn
  // Namen gleichzeitig zu lesen ist eine andere.
  /* Die Ebene schlaegt eine Auswahl vor, das Profil kann sie verbieten.
   *
   * `kandidaten:0` heisst „nie eine Auswahl" - das ist eine Eigenschaft
   * (R4). Der erste Anlauf hat stattdessen die feste Vier bei den
   * Bundeslaendern GELOESCHT und alles dem Profil ueberlassen; damit bekam
   * Lea (`kandidaten:99`) sechzehn Moeglichkeiten statt vier, und der
   * Rauchtest lief in einen Zeitablauf. Die Vier ist eine Eigenschaft der
   * EBENE - Bundeslaender schreibt man nicht, man erkennt sie -, das
   * Verbot eine des Profils. Zwei verschiedene Dinge. */
  /* Das Verbot steht EINMAL da.
   *
   * `P.kandidaten > 0` stand zweimal: hier und unten bei `wieviel`. Zwei
   * Sperren fuer eine Sache sehen nach Sorgfalt aus und sind das
   * Gegenteil - die zweite rettete still, was die erste durchliess, und
   * die Gegenprobe „Eltern bekommt doch eine Auswahl" konnte deshalb seit
   * R4 nichts beweisen: Eingriff angekommen, Tor gruen. Gefunden hat das
   * nicht der Blick auf den Quelltext, sondern die Probe selbst. */
  const darfWaehlen = P.kandidaten > 0;
  /* Im TEST gibt es keine Auswahl (B2).
   *
   * Vier Moeglichkeiten sind die groesste Hilfe, die das Spiel kennt: sie
   * machen aus „wie heisst das" ein „welches von diesen vieren". Genau
   * darum geht der Test ohne sie. */
  const istAuswahl = (istHaupt || art==='bundeslaender') && darfWaehlen && !st.test;
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
    // Bei den Bundeslaendern immer vier, sonst nach Profil - und bei
    // `kandidaten:0` gar keine (dann steht oben `istAuswahl` auf falsch
    // und es wird getippt).
    const wieviel = art==='bundeslaender' && darfWaehlen
      ? 4 : Math.min(P.kandidaten, st.alle.length);
    const n = Math.min(wieviel, st.alle.length) - 1;
    kand = misch([ziel, ...misch(st.alle.filter(x=>x.id!==ziel.id), r1).slice(0, Math.max(1,n))], r1);
  }

  // Die Karte zeigt IMMER die ganze Welt - auch die Kontinente, die in
  // Fionas Runde noch nicht drankommen. Sonst fehlen auf ihrer Weltkarte
  // Asien und Nordamerika, und was uebrig bleibt, sieht nach kaputter Karte
  // aus statt nach einer Auswahl. Die Runde begrenzt, WONACH gefragt wird -
  // nicht, was es auf der Welt gibt.
  const alleKontinente = D.kontinente.map(k=>({ id:k.id, name:k.name, pfad:k.pfad, anker:k.anker }));
  /* Bei „Was ist groesser?" sind die Gegenstaende PAARE und haben
     keinen Umriss - gezeichnet werden die Laender der Karte, und zwar
     ALLE Ziele, nicht die eines Lerntiefe-Ausschnitts: die Ebene hat
     keine Leiter (siehe `vorrat`). */
  const formen = art==='kontinente' ? alleKontinente
    : istGroesser ? (D.laender[kont] || []).map(l =>
        ({ id:l.a3, name:l.name, pfad:l.pfad, anker:l.anker }))
    : st.alle;
  const vb = vbVon(st.ebeneId);
  // Die Vierfaerbung gilt fuer die deutsche Karte - `D.farben` kennt nur
  // Bundeslaender. Auf der Europakarte gilt derselbe Farbkreis wie bei
  // den Laendern, sonst saehe dieselbe Karte in zwei Ebenen verschieden aus.
  const farbeVon=(g,i)=> (art==='bundeslaender'||istNachbar||(istHaupt && !kont))
    ? `var(${VIER[(D.farben[g.id]??i)%4]})` : `var(${FL[i%7]})`;
  const karte = karteVon(st.ebeneId);
  const umgebung = (karte && D.umgebung[karte])
    ? D.umgebung[karte].map(p=>`<path d="${p}" fill="var(--linie)" opacity=".55"/>`).join('') : '';
  /* Der Rand der Umgebung BLENDET AUS, statt abgeschnitten zu enden.
   *
   * Die grauen Nachbarn kommen aus einem Ausschnitt der Weltkarte, und der
   * ist ein Rechteck in Laenge und Breite. Auf Mittelamerika endet
   * Kolumbien deshalb unten rechts an einer Kante, die keine Kueste ist -
   * ein grauer Block mit zwei geraden Seiten. Gemessen am gebauten Spiel:
   * die Umgebung reicht dort mit vollem Grau bis an den Rahmen. Als Karte
   * ist das richtig (dort HOERT der Ausschnitt auf), als Bild sieht es aus
   * wie ein Fehler - der Atlas loest das seit je mit einem weichen Rand.
   *
   * Zehn Prozent, nicht sechs und nicht vierzehn: bei sechs bleibt die
   * Kante unten rechts stehen, bei vierzehn verliert Mexiko seine Gestalt -
   * und Mexiko ist der Anhaltspunkt, an dem ein Kind erkennt, wo es ist.
   * Durchprobiert und nebeneinandergelegt, nicht geraten.
   *
   * Es liegt IN der Lupe, wandert also beim Zoomen mit. Das ist Absicht:
   * die harte Kante gibt es nur bei Zoomstufe 1, wo der Ausschnitt im
   * sichtbaren Feld endet. Wer hineinzoomt, schneidet ohnehin mitten durch
   * Laender, und das ist ein gewoehnlicher Kartenrand.
   *
   * ZWEI Masken hintereinander statt einer mit `mix-blend-mode`: Blendmodi
   * in Masken sind auf iOS nicht verlaesslich, und das Zielgeraet ist ein
   * iPhone. Geschachtelte Masken sind SVG 1.1 und tun es ueberall.
   *
   * Nur die GRAUEN gehen aus. Was gefragt wird, behaelt seine Farbe bis an
   * den Rand - sonst waere ein Ziel am Rahmen blasser als eines in der
   * Mitte, und die Karte wuerde die Aufgabe verraten. */
  const RANDBLENDE = 0.10;
  const [rvx, rvy, rvw, rvh] = vb.split(' ').map(Number);
  // Waagerecht und senkrecht sind dieselbe Blende, einmal gedreht - der
  // Unterschied sind vier Zahlen, und die stehen deshalb hier und nicht
  // zweimal ausgeschrieben.
  // Der Verlauf steht IN der Maske, nicht daneben. Eine Maske rechnet mit
  // Helligkeit: Weiss heisst „ganz sichtbar", Schwarz „ganz weg". Das sind
  // keine Farben im Sinne des Gestaltungssystems, und weil sie hier drin
  // stehen, sieht das Tor `inhalt` ihnen das auch an.
  const blende = (id, [x1, y1, x2, y2]) => `
    <mask id="rand${id}" maskUnits="userSpaceOnUse"
          x="${rvx}" y="${rvy}" width="${rvw}" height="${rvh}">
      <linearGradient id="bl${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="${RANDBLENDE}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="${1 - RANDBLENDE}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <rect x="${rvx}" y="${rvy}" width="${rvw}" height="${rvh}" fill="url(#bl${id})"/></mask>`;
  // Ohne Umgebung keine Blende: eine Maske, die nichts verdeckt, waere ein
  // Bezeichner, den irgendwann jemand fuer benutzt haelt.
  const randBlende = umgebung ? blende('x', [0, 0, 1, 0]) + blende('y', [0, 0, 0, 1]) : '';
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
  /* Bei der umgekehrten Frage ist das gesuchte Gebiet eine Flaeche wie
   * jede andere - sonst steht die Antwort auf der Karte.
   *
   * Das war beim ersten Blick auf das Bild zu sehen und in keinem Tor:
   * `path.ziel` bekommt `fill:var(--ziel)`, also die Akzentfarbe. Die
   * Frage „Wo liegt Berlin?" haette Berlin angemalt. Kein Tor haette das
   * gemeldet - sie messen Groessen und Zustaende, nicht den Sinn. */
  const flaechen = formen.map((g,i)=>`<path class="geb ${
      zielIds.includes(g.id) && !umgekehrt ? 'ziel'
        : gesessen(g.id) ? 'gesessen' : 'ruhig'}" data-id="${g.id}"
      d="${g.pfad}" fill-rule="evenodd" fill="${farbeVon(g,i)}"/>`).join('');
  // Ein Haken auf jedem Gebiet, das schon einmal sass. Farbe allein sagt "anders",
  // ein Haken sagt "geschafft" - und er trifft auch die, die Farben
  // schlecht unterscheiden.
  // Und der Haken auch: fehlte er nur beim gesuchten Gebiet, waere GENAU
  // DAS der Hinweis - unter lauter abgehakten Nachbarn.
  const haken = formen.filter(g=>g.anker && gesessen(g.id)
      && (umgekehrt || !zielIds.includes(g.id)))
    .map(g=>`<g class="haken" data-id="${g.id}" data-x="${g.anker[0]}" data-y="${g.anker[1]}">
        <circle r="13" fill="var(--gut)" stroke="var(--papier)" stroke-width="2.5"/>
        <path d="M-6 0 L-2 4.5 L6.5 -4.5" fill="none" stroke="var(--papier)"
              stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`).join('');
  const konturen = formen.map(g=>`<path d="${g.pfad}" fill-rule="evenodd"/>`).join('');
  // Der Umriss des gesuchten Gebiets, zweimal: ein ruhiger dicker Rand und
  // darueber ein pulsierender. Ohne das ist bei sieben Pastellflaechen nicht
  // zu erkennen, welche gemeint ist.
  const zielForm = formen.find(g=>g.id===ziel.id) || ziel;
  /* Was hervorgehoben wird. Bei allen Ebenen ausser „Was ist groesser?"
     ist das genau ein Umriss - dann steht hier dieselbe Liste wie
     bisher, nur als Liste. */
  const zielFormen = istGroesser
    ? zielIds.map(id => formen.find(g => g.id === id)).filter(Boolean)
    : [zielForm];
  // Der Zeiger wird in BILDSCHIRMPUNKTEN gezeichnet, nicht in
  // Kartenkoordinaten: sonst schrumpft er mit dem Massstab und ist auf
  // Thueringen nur noch ein blauer Fleck.
  // Und kein Zeiger: er sagt, WO das gesuchte Gebiet liegt - im Test ist
  // genau das die Frage.
  /* BEIDE bekommen einen Zeiger (I22), nicht nur einer.
     Fiona liest nicht: fuer sie ist der Zeiger das Wort „diese hier".
     Einer allein waere die Antwort. */
  const zeigerFuer = (f) => f.anker && !st.test
    ? `<g class="zeiger" data-id="${f.id}" data-x="${f.anker[0]}" data-y="${f.anker[1]}">
         <path d="M0 -2 L-9 -17 L9 -17 Z" fill="var(--akzent)"/>
         <circle cy="-26" r="11" fill="var(--akzent)" stroke="white" stroke-width="2.5"/>
         <path d="M0 -32 L0 -21 M0 -18.5 L0 -18.4" stroke="white" stroke-width="2.6"
               stroke-linecap="round" fill="none"/>
       </g>` : '';
  const zeiger = zielFormen.map(zeigerFuer).join('');
  /* Der dicke Rand und der pulsierende darueber - je Gebiet, das zur
     Frage gehoert. Sie standen hier einzeln im Markup; als Liste sind
     es zwei Zeilen weniger und ein Sonderfall statt keinem. */
  const markierung = zielFormen.map(f => `
          <path class="zielrand" d="${f.pfad}" fill="none" fill-rule="evenodd"
                stroke="var(--tinte)" stroke-width="3.5" stroke-linejoin="round"
                vector-effect="non-scaling-stroke"/>
          <path class="zielpuls" d="${f.pfad}" fill="none" fill-rule="evenodd"
                stroke="var(--akzent)" stroke-width="3" stroke-linejoin="round"
                vector-effect="non-scaling-stroke"/>`).join('');
  // Ebene 4 fragt nach der Hauptstadt, nicht nach der Schreibweise. Eine Stadt
  // zu tippen, die man noch nie gesehen hat, prueft das Buchstabieren - nicht
  // das Wissen, um das es hier geht. Deshalb ist diese Ebene fuer BEIDE
  // Profile eine Auswahl. Im Elternbereich abschaltbar, dann tippt Lea auch
  // hier wieder.
  /* DIE UMGEKEHRTE FRAGE (B3).
   *
   * Dieselbe Karte, andersherum gelesen: nicht „wie heisst dieses Gebiet"
   * mit hervorgehobenem Umriss, sondern „WO LIEGT Bayern" auf einer Karte
   * ohne jede Markierung. Das ist die billigste neue Aufgabenform - sie
   * braucht keine neuen Daten - und die mit dem groessten Zugewinn: einen
   * Namen wiedererkennen und ein Gebiet FINDEN sind zwei verschiedene
   * Faehigkeiten, und bisher wurde nur die erste geuebt.
   *
   * WER: nur wer liest. Fiona bekaeme die Frage vorgelesen, aber ihr
   * Weg ist das Ziehen eines Etiketts auf ein hervorgehobenes Gebiet -
   * ohne Hervorhebung faende sie auf einer Weltkarte nichts, woran sie
   * sich festhalten koennte. Das ist eine eigene Runde wert, keine
   * Nebenbemerkung.
   *
   * WANN: jede dritte Aufgabe, und zwar an der LAUFENDEN NUMMER, nicht am
   * Wuerfel. Eine gewuerfelte Mischung waere nicht nachstellbar - der
   * Rauchtest und die Bildabnahme muessten raten, welche Aufgabe gerade
   * welche Form hat. Vorhersagbar heisst hier auch: das Kind merkt das
   * Muster nicht, weil zwischen zwei umgekehrten Fragen immer zwei
   * normale liegen.
   *
   * NICHT bei den Hauptstaedten: dort ist die Antwort ein Punkt, kein
   * Gebiet - „Wo liegt Berlin" waere ein Tippen auf einen Kreis von acht
   * Punkten Durchmesser.
   */
  const tippt = !karteAntwortet && P.eingabe.includes('tippen')
    && !(istAuswahl && Einst.hauptstadtAuswahl);
  const spricht = P.eingabe.includes('sprechen');
  // Antippen oder Ziehen - je Kind gemerkt, mit der Voreinstellung als
  // Rueckfall. `let`, weil der Umschalter sie mitten in der Aufgabe aendern
  // koennen muss, ohne den Bildschirm neu zu bauen: ein Neuaufbau wuerde
  // die begonnene Aufgabe zuruecksetzen.
  let weise = Einst.antwortweise?.[P.id]
    || WEISE_VOREINSTELLUNG[P.id] || 'ziehen';
  // „von Polen", aber „vom Vereinigten Königreich" - die drei Ausnahmen
  // stehen als `wovon` bei den Fakten, der Rest wird abgeleitet.
  /* Die FLAGGE ist die Frage, nicht der Name (F4).
     Sie steht im Fragetext und nicht daneben: der Bildschirm hat keine
     zweite Zeile frei, und eine Flagge ueber der Karte waere ein zweites
     Bild neben dem, auf das man tippen soll. */
  const frageText = aufKarte
      ? `Wohin gehört diese Flagge? ${Flaggen.flaggeSvg(ziel.flagge,
          { klasse:'frageflagge', titel:'Flagge' })}`
    : umgekehrt ? `Wo liegt ${ziel.name}?`
    : istNachbar ? `Welches Bundesland grenzt an ${ziel.name}?`
    : istGroesser ? 'Welches Land ist größer?'
    : istHaupt ? `Wie heißt die Hauptstadt ${ziel.wovon || `von ${ziel.gebiet}`}?`
    : art==='kontinente' ? 'Wie heißt dieser Kontinent?'
    : art==='laender' ? 'Wie heißt dieses Land?' : 'Wie heißt dieses Bundesland?';
  const fach = Stand[ziel.id]?.fach ?? 1;

  s.innerHTML = `
    ${aufgabenKopf(st)}
    <!-- Der Platz fuer das Lob wird NICHT freigehalten - gemessen, nicht
         entschieden (Q45).
         Die gezeichnete Karte wandert beim Lob 47 Punkte nach unten und
         wird dabei 48 kleiner, von 273 auf 225 - achtzehn Prozent, genau
         in dem Augenblick, in dem das Kind auf die Form schaut, die es
         eben getroffen hat. 22 davon kosten der Satz zum Mitnehmen (D3),
         26 die Lobzeile, die es seit langem gibt.
         Der Platz LIESSE sich freihalten: Frage und kommendes Lob in
         dieselbe Rasterzelle, dann ist sie von Anfang an so hoch wie das
         Lob, und die Karte steht still - gemessen 0 Punkte statt 48, ohne
         eine einzige geratene Zahl. Gebaut, gemessen, und wieder
         herausgenommen: die 48 Punkte hat der Bildschirm nicht. Das Tor
         passt meldete „noch einmal hoeren" 4 bis 6 Punkte ueber dem Rand auf dem
         iPhone SE quer und 25 Punkte im Wischbereich auf dem Zielgeraet
         mit Browserleiste. Auch die halbe Fassung (nur die Sachzeile
         freigehalten, 22 Punkte) lag noch 12 Punkte im Wischbereich.
         Ein Knopf, den der Daumen nicht trifft, ist teurer als eine Karte,
         die rueckt. Was bleibt, ist eine Ratsche im Rauchtest: der Sprung
         darf nicht groesser werden als er heute ist. -->
    <div class="frage" id="frage">${frageText}</div>
    <div class="feld">
      <div class="karte" id="karte" style="--karte-ar:${(()=>{const v=vb.split(' ').map(Number);
        return (v[2]/v[3]).toFixed(4);})()}">
        <svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet">
          <defs><clipPath id="wasch"><circle id="waschKreis" cx="0" cy="0" r="900"
            style="transform-box:fill-box;transform-origin:center"/></clipPath>${randBlende}</defs>
          <!-- ALLES, was zur Karte gehoert, liegt in dieser einen Gruppe -
               damit die Lupe EINE Zahl verschiebt und nicht dreizehn. -->
          <g id="lupe">
          <g mask="url(#randx)"><g mask="url(#randy)">
            <g id="umg">${umgebung}</g></g></g>
          <g id="fl">${flaechen}</g>
          <!-- Erst die Trefferflaechen, dann die Haken: seit P10 sitzt ein
               Haken auf dem Nadelkopf, und lag er darunter, deckte der Kopf
               ihn zu - ein gruener Ring mit einem farbigen Punkt darin, ohne
               Haken. Beide nehmen keine Tipps an, die Reihenfolge kostet
               also nichts. -->
          <g id="treffer"></g>
          <g id="haken">${haken}</g>
          <g id="fahne"></g>
          <path id="belohn" d="" fill="var(--wasch)" clip-path="url(#wasch)" style="display:none"/>
          <g fill="none" stroke="var(--tinte)" stroke-opacity=".5" stroke-width="1.1"
             vector-effect="non-scaling-stroke">${konturen}</g>
          ${umgekehrt ? '' : `${markierung}
          ${zeiger}`}
          <path id="kontur" d="" fill="none" stroke="var(--tinte)" stroke-width="2.4"
                vector-effect="non-scaling-stroke" stroke-linejoin="round" style="display:none"/>
          <circle id="stadtpunkt" r="0" fill="var(--akzent)" stroke="white" stroke-width="2"
                  vector-effect="non-scaling-stroke" style="display:none"/>
          </g>
        </svg>
      </div>
      <div class="seite" id="seite"></div>
    </div>`;

  const seite = s.querySelector('#seite');
  const liste = el('div','wahlliste'), werkzeug = el('div','werkzeug');
  seite.append(liste, werkzeug);

  /* Die Lupenknoepfe stehen NEBEN der Karte, nicht auf ihr (Q33).
   *
   * Sie lagen bis hierher absolut positioniert unten rechts IN der Karte.
   * Audit A hat gemessen, was das kostet: auf dem Zielgeraet sind 70,4 %
   * von Australien verdeckt, die Mitte des Gebiets liegt auf
   * `#lupeMinus` - und das auf allen sieben Groessen, zwischen 16,9 und
   * 71,8 %. Antworten ging trotzdem (die Umkreissuche findet das Gebiet),
   * SEHEN nicht: „Wie heisst dieser Kontinent?", und „dieser" liegt unter
   * einem Knopf.
   *
   * Eine andere Ecke ist keine Loesung - alle vier gemessen, keine ist
   * frei: unten links verschwindet das Saarland zu 99,9 %, oben rechts
   * Berlin zu 100 %. Und ein Polster in der Karte macht sie 16 % kleiner,
   * weil ihr Kasten ein festes Seitenverhaeltnis hat.
   *
   * Die Werkzeugspalte kostet die Karte dagegen NICHTS: ihre Breite
   * bestimmt die Antwortliste, und die ist breiter als 44 Punkte. Dort
   * stehen ohnehin schon das Mikrofon und der Hoerknopf.
   *
   * Angehaengt hier und nicht im Markup, weil `werkzeug` erst hier
   * entsteht - und ZUERST, damit die Lupe ueber dem Ausweg steht: sie
   * gehoert zur Karte, „Weiss ich nicht" zur Aufgabe. */
  const lupen = el('div','lupenknoepfe');
  lupen.innerHTML = `
    <button class="lupenknopf" id="lupePlus" aria-label="Karte größer">${ZEI('lupeAuf', 24)}</button>
    <button class="lupenknopf" id="lupeMinus" aria-label="Karte kleiner">${ZEI('lupeZu', 24)}</button>
    <button class="lupenknopf ganz" id="lupeGanz" aria-label="Ganze Karte">${ZEI("ganzeKarte", 22)}</button>`;
  werkzeug.appendChild(lupen);
  /* „Noch einmal hoeren" wird ZULETZT angehaengt - nach dem Mikrofon und
     dem Umschalter -, damit die Reihenfolge dieselbe bleibt, wenn einer
     der beiden fehlt. Der Satz kommt mit; gesagt wird er weiter unten
     erst nach dem Bildwechsel, aber der Knopf steht sofort. */
  const nochHoerenAnhaengen = (satz) => {
    const b = nochHoerenKnopf(satz);
    if (b) werkzeug.appendChild(b);
  };

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
    erledigt = beendet(s);
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
    sagen(satz);
    standSichern(st.ebeneId);
    setTimeout(()=>{ st.i++;
      if (st.i>=st.liste.length) zeige(endschirm); else zeige(spielschirm); }, LOBPAUSE);
  }
  s.querySelector('#zur').onclick=()=>zeige(pauseSchirm);

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

  function trefferflaechen(){
    const svg=s.querySelector('.karte svg'); if(!svg) return;
    const g=svg.querySelector('#treffer');
    /* Der Massstab wird an der LUPENGRUPPE genommen, nicht an der Wurzel.
     *
     * Seit M4z sitzt zwischen beiden eine Transformation. Die Wurzel weiss
     * nichts davon: sie meldet weiter den Massstab der ganzen Karte, und
     * damit haetten die Trefferkreise beim Hineinzoomen ihre Groesse
     * behalten, waehrend die Laender darunter wachsen - Nadeln fuer
     * Gebiete, die man laengst treffen kann. */
    const lupenG = svg.querySelector('#lupe');
    const ctm=(lupenG || svg).getScreenCTM(); if(!g||!ctm) return;
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
    /* ZWEI Zeiger sind moeglich (I22) - `querySelector` nahm den ersten
       und liess den zweiten in Kartengroesse stehen, also winzig. */
    for (const zg of s.querySelectorAll('.zeiger')) {
      const zp = s.querySelector(`path.geb[data-id="${zg.dataset.id || zielIds[0]}"]`);
      const zb = zp ? zp.getBBox() : {width:0,height:0};
      const gross = Math.max(zb.width, zb.height) * k;
      zg.style.display = gross < 190 ? '' : 'none';
      // Feste Groesse am Bildschirm: 1/k hebt den Kartenmassstab auf.
      const px = 1 / k;
      const x = +zg.dataset.x, y = +zg.dataset.y;
      const oben = (zb.height * k < 44) ? -zb.height/2 - 4*px : 0;   // ueber winzigen Flaechen
      zg.setAttribute('transform', `translate(${x} ${y + oben}) scale(${px.toFixed(3)})`);
    }
    kreisPx.clear();
    /* Wie gross wird der Kreis AM ORT?
     *
     * Einmal gerechnet, zweimal gebraucht: der Nadelplan muss VOR den
     * Kreisen wissen, wer am Ort zu wenig bekommt. Der erste Anlauf hat
     * die zehn Zeilen abgeschrieben - und das Tor `inhalt` hat es sofort
     * gemeldet, weil eine stehende Gegenprobe ihren Suchtext ploetzlich
     * zweimal fand. Regel 6, gefunden von einer Probe. */
    const kreisAmOrt = (n) => {
      let rPx = MIN_PT/2, naechster = Infinity;
      for (const m of mit) {
        if (m.x.id === n.x.id || !m.x.anker) continue;
        const d = Math.hypot(n.x.anker[0]-m.x.anker[0], n.x.anker[1]-m.x.anker[1]) * k;
        if (d > 0) { naechster = Math.min(naechster, d); rPx = Math.min(rPx, d * 0.55); }
      }
      rPx = Math.max(rPx, MIN_REST/2);
      /* Und der Boden darf die Regel darueber NICHT aufheben.
       *
       * Genau das tat er. Weiter oben steht seit F16 „ein Trefferkreis
       * darf den Anker eines ANDEREN Gebiets nicht verschlucken" - und
       * `Math.max(rPx, MIN_REST/2)` hat es wieder eingerissen, sobald
       * zwei Anker naeher als achtzehn Bildpunkte beieinanderlagen.
       *
       * Gemessen hat es niemand, weil die Zahl in Node gerechnet wurde
       * und dort mit einem angenommenen Kartenmassstab (P6). Am
       * Bildschirm, auf 844 x 390, sind es vier Faelle: wer auf den Anker
       * von Nicaragua zeigt, bekam Costa Rica; Guatemala und Honduras
       * bekamen El Salvador; die Dominikanische Republik bekam Haiti.
       *
       * Gekappt wird knapp DIESSEITS des naechsten fremden Ankers - 0,9
       * davon. Das ist die kleinstmoegliche Einschraenkung: die Zeile
       * oben (`d * 0.55`) kann einen fremden Anker gar nicht erreichen,
       * nur der Boden konnte es. Ein erster Anlauf mit 0,45 hat auch
       * Berlin, Hamburg und das Saarland um vier Punkte beschnitten, ohne
       * dass dort etwas zu berichtigen gewesen waere - gemessen und
       * wieder verworfen.
       *
       * Wo auch das nicht reicht - Haiti und die Dominikanische Republik
       * liegen 4,2 Punkte auseinander -, half bis P10 kein Kreis mehr.
       * Seitdem wandert die Flaeche an eine Nadel. */
      if (Number.isFinite(naechster)) rPx = Math.min(rPx, naechster * 0.9);
      return rPx;
    };
    /* Erst leeren, dann suchen.
     *
     * Die Nadelsuche weiter unten fragt `elementFromPoint`, also den
     * wirklichen Bildschirm. Stuenden die Trefferkreise des letzten
     * Durchgangs noch da, laese sie ihre eigene Arbeit als besetzt. */
    g.innerHTML = '';
    const nadeln = nadelplanFuer();

    /* Haken in fester Bildschirmgroesse, wie der Zeiger: sonst sind sie auf
     * der Weltkarte winzig und auf Bremen riesig.
     *
     * Und wer an der Nadel haengt, bekommt seinen Haken AN DER NADEL.
     *
     * Gemessen auf der Nordamerikakarte, mit allen Laendern gesessen:
     * zehn Haken von 26 Punkten Durchmesser, davon vierzehn Paare
     * uebereinander, das engste 4,2 Punkte auseinander. In Mittelamerika
     * lag ein gruener Fleck, und welches Land abgehakt war, sah man
     * nicht. Der Haken sagt „geschafft" - er muss dort stehen, wo das
     * Kind das Land findet, und das ist seit P10 der Nadelkopf. */
    s.querySelectorAll('.haken').forEach(h=>{
      const n = nadeln.find(x => x.id === h.dataset.id);
      const x = n ? n.x : h.dataset.x, y = n ? n.y : h.dataset.y;
      h.setAttribute('transform', `translate(${x} ${y}) scale(${(1/k).toFixed(3)})`);
    });
    const stuecke = mit.filter(n=>n.gross*k<MIN_PT).map(n=>{
      const rPx = kreisAmOrt(n);
      /* Und wenn auch das nicht reicht, haengt die Flaeche an einer Nadel.
         Dann zaehlt IHRE Groesse, nicht der gekappte Kreis am Ort: sie ist
         die Stelle, an der ein Finger dieses Gebiet trifft. Der kleine
         Kreis bleibt trotzdem stehen - wer genau zielt, soll auch am Ort
         treffen duerfen. */
      const nadel = nadeln.find(x => x.id === n.x.id);
      kreisPx.set(n.x.id, nadel ? MIN_PT : +(rPx * 2).toFixed(1));
      /* Und sichtbar fuer das Tor: `npm run ziehen --nur=treffer` liest
         diese Marke und haelt sie gegen den gemessenen Kreis. Ohne sie
         waere die Entscheidung „zu klein zum Antippen" eine Zahl, die nur
         im Kopf des Programms steht. */
      const pf = s.querySelector(`path.geb[data-id="${n.x.id}"]`);
      if (pf) pf.dataset.klein = kreisPx.get(n.x.id) < MIN_REST ? '1' : '';
      const amOrt = `<circle data-id="${n.x.id}" cx="${n.x.anker[0]}" cy="${n.x.anker[1]}"
        r="${(rPx/k).toFixed(1)}" fill="transparent" style="pointer-events:all"/>`;
      if (!nadel) return amOrt;
      const farbe = pf ? pf.getAttribute('fill') : 'var(--papier)';
      /* Haengt das GESUCHTE Gebiet an einer Nadel, wird ihr Faden zum
       * Wegweiser.
       *
       * Der Zeiger steht am Ort, und das bleibt so: er sagt, WO das Land
       * liegt, und das ist der Lerninhalt. Gemessen auf der
       * Nordamerikakarte ist der Ort aber ein Pulk - der Zeiger stand auf
       * (285,320), und innerhalb von zehn Punkten liegen vier Laender.
       * Wohin das Etikett gehoert, sagt er nicht: das ist der Nadelkopf,
       * 44 Punkte gross, vierzig Punkte weiter unten.
       *
       * Beides zusammen ergibt den Weg: der Zeiger zeigt auf das Land,
       * der hervorgehobene Faden fuehrt von dort zur Flaeche, auf die man
       * ablegt.
       *
       * NUR wenn das Ziel ohnehin markiert ist. Bei der umgekehrten Frage
       * („Wo liegt Guatemala?") ist die Karte die Antwort - ein leuchtender
       * Faden waere sie auch. Dieselbe Bedingung wie beim Zielrand. */
      const wegweiser = !umgekehrt && zielIds.includes(n.x.id) ? ' nadelziel' : '';
      return amOrt + `
        <line class="nadelfaden${wegweiser}" x1="${n.x.anker[0]}" y1="${n.x.anker[1]}"
              x2="${nadel.x}" y2="${nadel.y}"/>
        <circle class="nadelfuss${wegweiser}" cx="${n.x.anker[0]}" cy="${n.x.anker[1]}"
                r="${(2.4/k).toFixed(2)}"/>
        <circle class="nadelkopf${wegweiser}" cx="${nadel.x}" cy="${nadel.y}"
                r="${(7/k).toFixed(2)}" fill="${farbe}"/>
        <circle class="annadel" data-id="${n.x.id}" cx="${nadel.x}" cy="${nadel.y}"
                r="${(MIN_PT/2/k).toFixed(1)}" fill="transparent"
                style="pointer-events:all"/>`;
    });
    g.innerHTML = stuecke.join('');

    /* --- Die Nadeln -------------------------------------------------
     *
     * Wo ein Gebiet am Ort keine 20 Punkte bekommt, weil der Nachbar zu
     * nah ist, wandert seine Trefferflaeche NEBEN die Karte: volle 44
     * Punkte im Meer, ein Faden dorthin, ein Kopf in der Farbe des
     * Gebiets. Das Konzept sagt es seit K3, Kapitel 5.4 - gebaut war
     * bisher nur der halbe Satz.
     *
     * Warum fuer ALLE betroffenen Gebiete und nicht nur fuer das
     * gesuchte: eine Nadel, die nur beim gefragten Land erschiene, waere
     * die Antwort. Neun Nadeln auf der Nordamerikakarte sagen nichts -
     * wer „Wo liegt Guatemala?" beantworten will, muss trotzdem wissen,
     * wo Guatemala liegt, und dem Faden von dort folgen.
     */
    function nadelplanFuer(){
      const kasten = s.querySelector('.karte');
      const kb = kasten ? kasten.getBoundingClientRect() : null;
      if (!kb || !kb.width) return [];
      // `k` gehoert in den Schluessel: derselbe Kasten bei doppeltem
      // Massstab ist eine andere Karte, und ihr Nadelplan ein anderer.
      const schluessel = `${mit.map(m=>m.x.id).join(',')}|`
        + `${kb.width.toFixed(0)}x${kb.height.toFixed(0)}|${k.toFixed(3)}`;
      if (schluessel === nadelSchluessel) return nadelPlan;

      const hin = (a) => { const p = svg.createSVGPoint();
        p.x = a[0]; p.y = a[1]; const r = p.matrixTransform(ctm); return { x:r.x, y:r.y }; };
      const zurueck = (x, y) => { const p = svg.createSVGPoint();
        p.x = x; p.y = y; const r = p.matrixTransform(ctm.inverse());
        return { x:+r.x.toFixed(1), y:+r.y.toFixed(1) }; };
      const ankerPx = mit.filter(m=>m.x.anker).map(m => ({ id:m.x.id, ...hin(m.x.anker) }));

      // Wer braucht eine Nadel? Wer am Ort keine 20 Punkte bekommt -
      // gerechnet mit `kreisAmOrt`, derselben Funktion, die den Kreis
      // gleich darunter wirklich setzt.
      const braucht = [];
      for (const n of mit) {
        if (!n.x.anker || n.gross * k >= MIN_PT) continue;
        if (kreisAmOrt(n) * 2 < MIN_REST)
          braucht.push({ id:n.x.id, anker:n.x.anker, ...hin(n.x.anker) });
      }

      /* Die Reihenfolge ist die des Bildschirms, nicht die der Daten:
         von oben nach unten, bei Gleichstand von links nach rechts. Ein
         Zufall in der Reihenfolge waere ein Zufall in der Lage - und
         zwei Aufnahmen derselben Karte saehen verschieden aus. */
      braucht.sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.id < b.id ? -1 : 1));

      const gesetzt = [], plan = [];
      /* Gesehen wird DURCH das, was oben liegt (`elementsFromPoint`).
       *
       * `elementFromPoint` liefert nur das oberste Element - und ueber der
       * Karte liegen Haken, Fahnen und der Zeiger. Ein Punkt mitten auf
       * Frankreich, an dem gerade ein Haken steht, galt damit als frei.
       * Aufgefallen ist das, als die Haken an die Nadeln wanderten und
       * damit selbst zu dem wurden, worueber gesucht wird. */
      const freiVonFlaeche = (x, y) => {
        const r = MIN_PT/2 * 0.7;
        for (const [dx, dy] of [[0,0],[r,0],[-r,0],[0,r],[0,-r]])
          for (const e of document.elementsFromPoint(x + dx, y + dy))
            if (e.closest && e.closest('path.geb')) return false;
        return true;
      };
      for (const b of braucht) {
        // Nach DRAUSSEN suchen: vom Kartenmittelpunkt weg liegt das Meer.
        const raus = Math.atan2(b.y - (kb.top + kb.height/2),
                                b.x - (kb.left + kb.width/2));
        let platz = null;
        for (let r = MIN_PT; r <= 170 && !platz; r += 10) {
          for (let i = 0; i < 25 && !platz; i++) {
            const w = raus + (i % 2 ? 1 : -1) * Math.ceil(i/2) * Math.PI/12;
            const x = b.x + Math.cos(w) * r, y = b.y + Math.sin(w) * r;
            if (x - MIN_PT/2 < kb.left || x + MIN_PT/2 > kb.right)  continue;
            if (y - MIN_PT/2 < kb.top  || y + MIN_PT/2 > kb.bottom) continue;
            if (gesetzt.some(p => Math.hypot(x-p.x, y-p.y) < MIN_PT)) continue;
            // Kein fremder Anker unter der Nadel - dieselbe Regel wie bei
            // den Kreisen am Ort (F16): das Kleinere gewinnt, aber es
            // sperrt niemanden aus.
            if (ankerPx.some(p => p.id !== b.id
                && Math.hypot(x-p.x, y-p.y) < MIN_PT/2 + 4)) continue;
            if (!freiVonFlaeche(x, y)) continue;
            platz = { x, y };
          }
        }
        if (!platz) continue;          // dann bleibt es beim Verzicht (P7)
        gesetzt.push(platz);
        plan.push({ id:b.id, ...zurueck(platz.x, platz.y) });
      }
      nadelSchluessel = schluessel; nadelPlan = plan;
      return plan;
    }
  }

  if (karteAntwortet) {
    /* Die Karte IST die Antwortliste.
     *
     * Kein Etikett, kein Feld, kein Mikrofon - wer „Wo liegt Bayern?"
     * beantwortet, tippt auf die Karte. Gemessen wird mit demselben
     * `zielUnter`, das auch ein abgelegtes Etikett auffaengt: derselbe
     * Treffertest, dieselbe Nachsicht fuer den Daumen. Zwei Rechnungen
     * fuer dieselbe Frage waeren zwei Stellen, an denen sie
     * auseinanderlaufen koennen.
     *
     * Der Satz daneben sagt, was zu tun ist. Ohne ihn steht auf dem
     * Schirm eine Frage und nichts, was nach Antwort aussieht. */
    const sag = el('div','hinweis');
    sag.textContent = 'Tippe auf die Karte.';
    liste.append(sag);
    const karte = s.querySelector('.karte svg');
    karte.style.cursor = 'pointer';
    karte.addEventListener('click', (ev) => {
      if (erledigt) return;
      // Wer die Karte gerade geschoben oder aufgezogen hat, hat nicht
      // getippt. Ohne das beantwortet jedes Verschieben die Frage - mit
      // dem Land, das zufaellig unter dem Finger lag.
      if (lupe && lupe.gezogen()) return;
      const t = zielUnter(ev.clientX, ev.clientY);
      // Ins Meer getippt ist keine falsche Antwort, sondern gar keine -
      // dieselbe Regel wie beim Ziehen ins Leere.
      if (!t) { sag.className = 'hinweis nochmal';
        sag.textContent = 'Tippe auf ein Land, nicht ins Meer.';
        sagen('Tippe auf ein Land, nicht ins Meer.'); return; }
      bewerte(NAMEN[t.id] || '', 'zeigen',
        { getroffen: t.id, punkt: { x: ev.clientX, y: ev.clientY }, hin: sag });
    });
  } else if (tippt) {
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
      ziehbar(b, {
        ueber: zielUnter,
        zeigen: (t) => drueberSetzen(t ? t.id : null),
        abgelegt: (t, ctx) => bewerte(k.name, 'ziehen',
          { etikett:b, getroffen:t.id, punkt:ctx.punkt }),
        insLeere: (el_, von) => {
          zurueckFliegen(el_, von);
          const h = liste.querySelector('.hinweis') || liste.appendChild(el('div','hinweis'));
          h.className='hinweis nochmal';
          // Kurz genug fuer eine Zeile: der Satz stand auf dem iPhone quer
          // zweizeilig am unteren Rand und schob die Antwortliste hoch.
          h.textContent='Lass es auf dem Land los.';
          sagen('Lass es auf dem Land los.');
        },
        beimAufheben: () => vorlesen(k.name),
      });
      liste.appendChild(b); });
  }

  /* Der leise Ausweg. Er steht bewusst klein und ohne Farbe da: er soll
   * erreichbar sein, aber nicht einladen.
   *
   * Im TEST steht er gar nicht da (B2). Er zeigt die Loesung - in einer
   * Pruefung ist das kein Ausweg, sondern die Antwort. */
  if (!st.test) {
    const weiter = el('button','leise');
    weiter.id = 'ueberspringen';
    // Q34: mit Zeichen. Derselbe Ausweg wie im Rechnen, dasselbe Zeichen.
    weiter.innerHTML = ZEI('frage', 20) + 'Weiß ich nicht';
    weiter.onclick = ()=>aufloesen('uebersprungen');
    werkzeug.appendChild(weiter);
  }

  /* KEIN Zeichen an diesem Knopf (Q34), und das ist kein Vergessen.
   *
   * Audit A zaehlt ihn weiter als „stumm und blind", zu Recht: fuer ein
   * Kind, das nicht liest, steht dort nichts. Ein Zeichen waere hier aber
   * nicht dasselbe wie an den anderen zehn. Er ist ein UMSCHALTER - seine
   * Beschriftung wechselt zwischen „Lieber antippen" und „Lieber ziehen",
   * und ein Zeichen, das dabei stehenbliebe, waere die halbe Zeit falsch.
   * Es braeuchte zwei, und dann steht die Frage im Raum, ob ein Zeichen
   * ueberhaupt sagen kann, was „ziehen statt antippen" heisst. Das ist
   * eine eigene Runde und keine Zeile hier.
   *
   * Der Umschalter steht nur dort, wo er etwas zu schalten hat: bei einer
   * Auswahl mit Etiketten. Beim Tippfeld gibt es nichts umzuschalten - und
   * bei der umgekehrten Frage erst recht nicht: dort ist die Karte die
   * Antwort, es gibt kein Etikett, das man ziehen oder antippen koennte.
   * Gesehen auf dem Bild: „Lieber ziehen" stand neben „Wo liegt Berlin?"
   * und haette nichts getan. */
  if (!tippt && !karteAntwortet) {
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
      sagen(weise==='antippen' ? 'Jetzt kannst du antippen.' : 'Jetzt kannst du ziehen.');
    };
    werkzeug.appendChild(um);
  }

  /* Der Sprachweg steht seit F2b als eigenes Bauteil daneben - er ist
     nicht mehr die Sache dieses Bildschirms, sondern die des Mikrofons.
     
     NICHT bei der umgekehrten Frage. Dort IST die Karte die Antwortliste
     (siehe unten): getippt wird auf ein Gebiet, und es gibt nichts zu
     sagen. Der Satz „kein Etikett, kein Feld, kein Mikrofon" stand seit
     B3 im Quelltext - das Mikrofon stand trotzdem da, denn angehaengt
     wurde es weiter oben und ohne Bedingung. Aufgefallen ist es an der
     ersten Aufnahme von „Auf die Karte" (F4): dort ist JEDE Frage die
     umgekehrte, und da stand ein Mikrofon neben einer Landkarte. Kein
     Tor ersetzt den Blick (Regel 4) - siebzehn davon liefen daran
     vorbei. */
  if (!karteAntwortet) sprachweg({ spricht, werkzeug, liste, bewerte });

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
    const t = nachsichtig(treffer, x, y);
    return t ? { id: t.marke, genau: t.genau } : null;
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
   * Kopf nachziehen, sobald geantwortet wurde.
   *
   * Der Bildschirm wird je Aufgabe EINMAL gebaut - der Kopf zeigte damit
   * immer den Stand VOR der laufenden Antwort. Nachgespielt: vier von vier
   * richtig, und der Kopf stand bei zwei Sternen, waehrend der
   * Endbildschirm drei zeigte. Ein Fortschritt, der erst beim naechsten
   * Bild nachkommt, ist keine Rueckmeldung, sondern eine Verzoegerung.
   */
  const kopfNachziehen = () => kopfNachziehenIn(s);

  /**
   * Der Fehler wird BENANNT, nicht nur abgelehnt (A3).
   *
   * Bis hierher stand bei jedem Fehlgriff auf der Karte „Nicht ganz -
   * probier es noch einmal." Das ist der Vorwurf, den sich ANTON
   * einfaengt: eine Ablehnung ohne Auskunft. Die Daten fuer eine bessere
   * Antwort liegen laengst da - jedes Gebiet hat einen Anker.
   *
   * Zwei Auskuenfte, und beide nur, wenn sie stimmen:
   *
   *   WAS DA IST   der Name des Gebiets unter dem Finger. Ihn gibt es
   *                nur fuer Gebiete dieser Ebene; auf einer Kontinent-
   *                karte liegt ringsum Umgebung ohne Namen.
   *   WO ES HIN MUSS  die Richtung vom Ablegepunkt zum Anker des
   *                gesuchten Gebiets - in BILDSCHIRMpunkten, denn der
   *                Satz beschreibt, was das Kind sieht.
   *
   * Wer nur ein paar Punkte danebenliegt, bekommt KEINE Richtung: „weiter
   * oben" waere dort falscher als nichts - es schickte ihn weg von der
   * Stelle, an der er fast richtig lag. Dann sagt der Satz genau das.
   */
  /* Der Hinweis bei „Was ist groesser?" (I22).
   *
   * `zugHinweis` taugt hier nicht: er nennt eine RICHTUNG zum gesuchten
   * Gebiet, und die gibt es nicht - beide stehen ja markiert da. Wer das
   * kleinere getippt hat, hat die Frage verstanden und sich vertan; wer
   * daneben getippt hat, hat sie nicht verstanden. Zwei verschiedene
   * Lagen, zwei verschiedene Saetze. */
  function groesserHinweis(ctx){
    if (ctx.getroffen === ziel.klein)
      return `Das ist ${ziel.kleinName}. Das andere Land ist größer.`;
    const wo = NAMEN[ctx.getroffen];
    return (wo ? `Das ist ${wo}. ` : '')
      + `Es geht um ${ziel.name} und ${ziel.kleinName}.`;
  }

  function zugHinweis(roh, ctx){
    const wo = NAMEN[ctx.getroffen];
    const fremd = wo && ctx.getroffen !== ziel.id;
    // Der Anker des gesuchten Gebiets auf dem Schirm - dieselbe Rechnung
    // wie beim Namensschild und beim Schreibblatt.
    let richtung = null;
    const svg = s.querySelector('.karte svg');
    if (svg && ziel.anker && ctx.punkt) {
      const pt = svg.createSVGPoint();
      pt.x = ziel.anker[0]; pt.y = ziel.anker[1];
      const q = pt.matrixTransform(svg.getScreenCTM());
      richtung = Richtung.richtungswort(q.x - ctx.punkt.x, q.y - ctx.punkt.y);
    }
    const teile = [];
    if (fremd) teile.push(`Das ist ${wo}.`);
    if (roh === ziel.name && !fremd) teile.push('Der Name stimmt.');
    teile.push(richtung ? `${ziel.name} liegt ${richtung}.`
                        : `${ziel.name} ist ganz nah — schau noch mal genau hin.`);
    return teile.join(' ');
  }

  /* --- Bewertung. EIN Ort, egal welcher Eingabeweg. --- */
  async function bewerte(roh, eingabeart, ctx){
    if (erledigt) return;

    /* Der Sprachweg steht VOR dem Versuchszaehler, und warum, steht bei
       `erhoert` - einmal, fuer beide Bildschirme: was zweimal dasteht,
       veraltet einmal (Regel 6). */
    let vorurteil = null;
    if (eingabeart==='sprechen') {
      vorurteil = erhoert(roh, ctx, { kand, ziel, bewerte, stelle: liste,
        unverstanden: () => Protokoll.schreiben(Protokoll.eintrag({
          zeit: Date.now(), profil: P.id, ebene: st.ebeneId, gebietId: ziel.id,
          eingabeart, ergebnis: 'unverstanden', roheingabe: roh,
          sicherheit: null, dauerMs: Date.now()-beginn, versuch,
          fachVorher: Stand[ziel.id]?.fach ?? 1,
          fachNachher: Stand[ziel.id]?.fach ?? 1,
        })) });
      // `null` heisst: es ist schon reagiert, die Aufgabe ist noch offen
      // und hat nichts gekostet.
      if (!vorurteil) return;
    }

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
    } else if (eingabeart==='zeigen') {
      /* Die umgekehrte Frage (B3): getippt wird auf die Karte.
       *
       * Gewertet wird NUR, wo der Finger lag - der Name spielt keine
       * Rolle, denn er stand ja in der Frage. Beim Ziehen ist das anders:
       * dort muss BEIDES stimmen, das Etikett und der Ort.
       *
       * Der Hinweis ist derselbe wie beim Ziehen (A3): er nennt das
       * getroffene Gebiet und die Richtung zum gesuchten. Genau dafuer
       * ist er gebaut, und er passt hier sogar besser - beim Ziehen weiss
       * das Kind schon, wie das Gebiet heisst; hier sucht es danach. */
      /* Bei den Nachbarn sind MEHRERE Treffer richtig (I21) - jeder,
         der das gefragte Land beruehrt. Die Liste steht am Gebiet und
         kommt aus derselben Tafel wie die Vierfaerbung; hier steht keine
         zweite. */
      /* Und bei „Was ist groesser?" ist genau EINES der beiden
         markierten Laender richtig (I22). */
      if (istGroesser ? ctx.getroffen===ziel.gross
        : istNachbar ? (ziel.grenzt || []).includes(ctx.getroffen)
                     : ctx.getroffen===ziel.id) ergebnis='richtig';
      else text = istGroesser ? groesserHinweis(ctx) : zugHinweis('', ctx);
    } else if (eingabeart==='ziehen') {
      if (ctx.getroffen===ziel.id && roh===ziel.name) ergebnis='richtig';
      else text = zugHinweis(roh, ctx);
    } else if (eingabeart==='tippen') {
      // Das ganze Gebiet, nicht nur sein Name - sonst zaehlt kein Alias.
      const r = Vergleich.rechtschreibung(roh, ziel);
      if (r.urteil==='richtig') { ergebnis='richtig'; nebenbei = r.nebenbei || ''; }
      else if (r.urteil==='fast'){ ergebnis='fast'; text=r.hinweis; }
      else { const t=Vergleich.abgleich(roh,kand);
        text = t.art==='nochmal' ? 'Das kenne ich noch nicht — schau noch mal hin.'
             : t.id===ziel.id ? 'Fast! Schau noch mal ganz genau hin.' : `Das wäre ${t.name}.`; }
    } else {
      // Schon oben gerechnet - „nicht verstanden" ist dort hinausgegangen.
      const t = vorurteil;
      sicherheit = t.abstand!==undefined ? +(1-t.abstand).toFixed(2) : null;
      // „nochmal" und „rueckfrage" sind oben hinausgegangen; hier steht
      // nur noch, was sicher verstanden oder ausdruecklich bestaetigt ist.
      if (t.id!==ziel.id) text=`Das wäre ${t.name}.`;
      else ergebnis='richtig';
    }

    if (ergebnis!=='falsch') {
      erledigt = beendet(s);
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
      /* Gelobt wird, WAS GETIPPT WURDE - bei den Nachbarn ist das nicht
         das gefragte Land (I21). Wer auf Hessen tippt, hat Hessen
         gefunden; „Das ist Bayern" waere die Antwort auf eine Frage, die
         niemand gestellt hat. Der Leitner-Stand bleibt am gefragten Land:
         geuebt wird „Bayerns Nachbarn", nicht „Hessen". */
      /* Und bei „Was ist groesser?" ist es das groessere Land - der
         Aufkleber gehoert auf die Flaeche, die die Antwort war (I22). */
      const gelobt = istGroesser
        ? (zielFormen.find(f => f.id === ziel.gross) || ziel)
        : istNachbar && ctx.getroffen
        ? (st.alle.find(x => x.id === ctx.getroffen) || ziel) : ziel;
      belohnung(s, gelobt, ergebnis==='fast' ? text : null, istHaupt, nebenbei, spruch,
                neuerAufkleber,
                istGroesser ? groesserSatz(ziel)
                : istNachbar && gelobt !== ziel
                  ? `${gelobt.name} grenzt an ${ziel.name}.` : null);
      /* Und Fiona HOERT den Satz - sie liest nicht (D3).
         Derselbe Vorrang wie auf dem Bildschirm: wo die umgekehrte Frage
         schon etwas zu sagen hat, tritt die Zugabe zurueck. Und sie kommt
         ZULETZT, nach dem Aufkleber: das Lob gehoert dem Kind, der Satz
         dem Gebiet. */
      const mitnehmen = ergebnis === 'richtig' && !nebenbei ? Saetze.satzZu(ziel.id) : null;
      /* „Das ist Spanien" waere hier keine Antwort auf die Frage - sie
         hiess ja nicht, wie das Land heisst (I22). Gesagt wird, was
         herausgekommen ist, und um wieviel. */
      sagen(ergebnis==='fast' ? text
        : istGroesser ? `${spruch} ${groesserSatz(ziel)}` + kleberSatz(neuerAufkleber)
        : `${spruch} Das ist ${ziel.name}.` + kleberSatz(neuerAufkleber)
          + (mitnehmen ? ` ${mitnehmen}` : ''));
    } else if (st.test) {
      /* Im Test ist EIN Versuch alles (B2).
       *
       * „Keine Loesung nach drei Fehlern" allein waere zu wenig gedacht:
       * ohne Aufloesung koennte man beliebig oft raten, und bei vier
       * Moeglichkeiten hat man nach dreimal Raten recht. Ein Versuch je
       * Aufgabe ist die einzige Fassung, die den Pokal etwas wert laesst.
       *
       * Die Aufgabe endet, aber die Antwort steht NICHT da: was hier
       * fehlt, gehoert in die naechste Uebungsrunde, nicht in die
       * Pruefung. */
      erledigt = beendet(s);
      // Der Leitner erfaehrt es: nicht gekonnt ist nicht gekonnt, ob mit
      // oder ohne Hilfen. Sonst waere ein Test eine Runde, die den
      // Lernstand nicht anfasst - und genau die Gegenstaende, die im Test
      // durchfallen, kaemen nicht wieder.
      Stand = Leitner.verschieben(Stand, ziel.id, false, Date.now());
      st.wie[st.i] = 'daneben';
      kopfNachziehen();
      standSichern(st.ebeneId);
      klangZu('falsch');
      const f = s.querySelector('#frage');
      if (f) f.innerHTML = `<span class="fastText">Das war nicht richtig.</span>`;
      sagen('Das war nicht richtig.');
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
      sagen(text);
    }

    Protokoll.schreiben(Protokoll.eintrag({
      zeit: Date.now(), profil: P.id, ebene: st.ebeneId, gebietId: ziel.id,
      eingabeart, ergebnis, roheingabe: eingabeart==='ziehen' ? '' : roh,
      sicherheit, dauerMs: Date.now()-beginn, versuch,
      fachVorher, fachNachher: Stand[ziel.id]?.fach ?? fachVorher,
    }));

    // Der Kartenweg zeigt sein Lob auf dem Spielschirm selbst, also kuerzer
    // als der Rechenweg - aber durch dieselbe Tuer (siehe `schauPause`).
    if (erledigt) setTimeout(()=>{ st.i++;
      if (st.i>=st.liste.length) zeige(endschirm); else zeige(spielschirm);
    }, schauPause(ergebnis==='fast' ? 2400 : 1600));
  }

  /* --- Die Lupe (M4z) -------------------------------------------------
   *
   * Gemeldet vom Geraet: „teilweise haben wir Laender, die zu klein sind
   * zum Antippen, und man hat keine Chance, das richtige Land zu treffen
   * oder ueberhaupt zu sehen, um welches es sich handelt."
   *
   * Die Nadeln (P10) loesen das ANTIPPEN - sie holen eine Trefferflaeche
   * neben die Karte. Sie loesen das ANSEHEN nicht: wer wissen will, wie
   * El Salvador aussieht, bekommt vier Bildpunkte. Dafuer gibt es keine
   * Trefferflaeche, sondern nur einen Massstab.
   *
   * Gebaut als EINE Gruppe mit EINER Transformation. Alles andere -
   * Treffertest, Nadeln, Haken, Zeiger - rechnet ueber
   * `getScreenCTM()` und zieht damit von allein mit; das ist der Grund,
   * warum die Lupe im Bildbereich sitzt und nicht im Datenbereich.
   *
   * Drei Wege hinein, weil drei verschiedene Leute sie brauchen:
   *   - ZWEI FINGER ziehen auf: was jedes Kind von jedem Telefon kennt.
   *   - Die KNOEPFE + und −: fuer den Schreibtisch, fuer eine Maus, und
   *     fuer Fiona, die von einer Geste nicht weiss, dass es sie gibt.
   *   - DOPPELTIPP: hinein an der getippten Stelle, heraus zur ganzen
   *     Karte.
   * Und einer heraus, der immer denselben Zustand herstellt: „ganze
   * Karte". Ein Kind, das sich verirrt hat, braucht einen Knopf und
   * keine Geste.
   *
   * Was die Lupe NICHT tut: sie ueberlebt keine Aufgabe. Der
   * Spielbildschirm wird je Aufgabe neu gebaut, also faengt jede Frage
   * bei der ganzen Karte an. Das ist Absicht - eine Karte, die noch von
   * der letzten Frage auf Kuba steht, waehrend nach Kanada gefragt wird,
   * sieht kaputt aus.
   */
  const lupe = (() => {
    const kasten = s.querySelector('.karte');
    const svg = kasten && kasten.querySelector('svg');
    const g = svg && svg.querySelector('#lupe');
    if (!g) return null;
    const [vx, vy, vw, vh] = vb.split(/\s+/).map(Number);
    const MAX = 8;
    let k = 1, tx = 0, ty = 0;

    /* WOHIN DIE KARTE UEBERHAUPT DARF: auf das GEZEICHNETE, nicht auf
     * den Rahmen.
     *
     * Bis hierher wurde gegen die `viewBox` geklemmt - also gegen den
     * Rahmen, den der Kartenschnitt vorgibt. Der ist bei mehreren
     * Karten deutlich groesser als das Land darin: er haelt Abstand,
     * damit nichts am Bildrand klebt. Hineingezoomt heisst das, dass
     * der sichtbare Ausschnitt vollstaendig im Abstand landen kann -
     * und dann steht da offenes Meer, ohne ein einziges Land. „Beim
     * Reinzoomen sind ploetzlich die Laender weg."
     *
     * Geklemmt wird deshalb gegen den Kasten der SPIELBAREN Flaechen
     * (`#fl`). Ist er kleiner als der sichtbare Ausschnitt - bei
     * Massstab 1 immer -, wird mittig gesetzt statt geklemmt; sonst
     * waere die Grenze eine Fessel und nicht ein Gelaender. */
    /* SPAETER GEMESSEN, NICHT BEIM BAU.
     *
     * Der erste Anlauf holte den Kasten hier, einmal - und bekam
     * nichts: die Karte wird NACHGELADEN, und beim Bau des
     * Bildschirms steht in `#fl` noch keine einzige Flaeche. `inhalt`
     * blieb `null`, die Klemmung fiel auf den Rahmen zurueck, und
     * alles war wie vorher. Das Tor hat es gemeldet, nicht ich.
     *
     * Also bei jedem Gebrauch fragen, bis einmal etwas dasteht - dann
     * gemerkt. Ein Kasten, der sich waehrend einer Aufgabe aendert,
     * gibt es nicht: geladen wird einmal. */
    const flG = svg.querySelector('#fl');
    let inhalt = null;
    const inhaltKasten = () => {
      if (inhalt) return inhalt;
      try {
        const bb = flG && flG.getBBox();
        if (bb && bb.width > 0 && bb.height > 0) inhalt = bb;
      } catch (e) {}
      return inhalt;
    };
    /** Grenzen fuer die Verschiebung auf EINER Achse. */
    const spanne = (a0, aw, c0, cw) => {
      const hi = a0 - k * c0;              // Inhalt beginnt spaetestens am Rand
      const lo = a0 + aw - k * (c0 + cw);  // und endet fruehestens am anderen
      return lo > hi ? [(lo + hi) / 2, (lo + hi) / 2] : [lo, hi];
    };
    const klemmen = () => {
      const c = inhaltKasten() || { x: vx, y: vy, width: vw, height: vh };
      const [lx, hx] = spanne(vx, vw, c.x, c.width);
      const [ly, hy] = spanne(vy, vh, c.y, c.height);
      tx = Math.min(hx, Math.max(lx, tx));
      ty = Math.min(hy, Math.max(ly, ty));
    };
    /* UND ZULETZT: ES MUSS ETWAS ZU SEHEN SEIN.
     *
     * Klemmen allein reicht nicht. Der Kasten der Flaechen ist ein
     * RECHTECK, die Karte ist keines: gemessen auf Mittelamerika liegt
     * der Kasten bei 22,108 und ist 750 x 529 gross - in seiner
     * oberen linken Ecke ist nichts als Meer. Wer bei vollem Massstab
     * weit genug zieht, landet genau dort, und die Klemmung sagt
     * zufrieden ja.
     *
     * Also wird nachgesehen, nicht gerechnet: liegt ueberhaupt ein
     * Anker im Fenster? Jede spielbare Flaeche hat einen, und er liegt
     * IN ihr. Ist keiner da, rueckt das Fenster auf den naechsten -
     * das ist kein Zurueckschnappen, denn es geschieht nur in dem
     * einen Zustand, den niemand haben will: leeres Meer. */
    const etwasImBlick = () => {
      const a0 = (vx - tx) / k, a1 = (vx + vw - tx) / k;
      const b0 = (vy - ty) / k, b1 = (vy + vh - ty) / k;
      const mx = (a0 + a1) / 2, my = (b0 + b1) / 2;
      let nah = null, weit = Infinity;
      for (const f of formen) {
        if (!f.anker) continue;
        const [x, y] = f.anker;
        if (x >= a0 && x <= a1 && y >= b0 && y <= b1) return;
        const d = (x - mx) * (x - mx) + (y - my) * (y - my);
        if (d < weit) { weit = d; nah = f.anker; }
      }
      if (!nah) return;
      tx = vx + vw / 2 - k * nah[0];
      ty = vy + vh / 2 - k * nah[1];
      klemmen();
    };
    const zeigen = () => {
      klemmen();
      etwasImBlick();
      g.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) `
        + `scale(${k.toFixed(4)})`);
      kasten.dataset.lupe = k > 1.01 ? k.toFixed(1) : '';
      // Die Trefferflaechen haengen am Massstab - und der hat sich gerade
      // geaendert. Ohne das bleiben die Nadeln stehen, wo die Karte
      // vorher war (Regel: erst messen, dann urteilen).
      trefferflaechen();
    };
    /** Einen Bildschirmpunkt in die Koordinaten der Karte umrechnen. */
    const inSvg = (x, y) => {
      const m = svg.getScreenCTM();
      if (!m) return null;
      const q = svg.createSVGPoint(); q.x = x; q.y = y;
      return q.matrixTransform(m.inverse());
    };
    /** Um `f` groesser werden - und dabei den Punkt `p` (Kartenkoordinaten)
     *  festhalten. Ohne `p`: die Mitte des sichtbaren Ausschnitts. */
    /* Ohne Ziel: die Mitte dessen, was gerade an LAND zu sehen ist.
     *
     * Vorher war es die Mitte des Rahmens - und die liegt auf mehreren
     * Karten im offenen Meer. Der Kommentar unten sagt es fuer den
     * +-Knopf bei der gewoehnlichen Frage; bei der umgekehrten blieb
     * es dabei, und dort ist es genauso falsch: wer „Wo liegt Kenia?"
     * beantworten will, drueckt auf +, um genauer hinzusehen - und
     * bekommt Wasser.
     *
     * Genommen wird die Mitte des Stuecks, das sichtbarer Ausschnitt
     * und gezeichnete Flaeche gemeinsam haben. Das verraet nichts: es
     * haengt nur daran, wohin schon geschaut wird, nicht daran, wo die
     * Antwort liegt. */
    const landmitte = () => {
      const c = inhaltKasten(); if (!c) return null;
      const auf = (a0, aw, c0, cw, t) => {
        const s0 = (a0 - t) / k, s1 = (a0 + aw - t) / k;      // Sichtfenster
        const l = Math.max(s0, c0), r = Math.min(s1, c0 + cw);
        const m = l < r ? (l + r) / 2 : c0 + cw / 2;
        return k * m + t;
      };
      return { x: auf(vx, vw, c.x, c.width, tx), y: auf(vy, vh, c.y, c.height, ty) };
    };
    const um = (f, p) => {
      const neu = Math.max(1, Math.min(MAX, k * f));
      if (Math.abs(neu - k) < 1e-4) return;
      const halt = p || landmitte() || { x: vx + vw / 2, y: vy + vh / 2 };
      const cx = (halt.x - tx) / k, cy = (halt.y - ty) / k;
      k = neu; tx = halt.x - k * cx; ty = halt.y - k * cy;
      zeigen();
    };
    const umPunkt = (f, x, y) => { const p = inSvg(x, y); if (p) um(f, p); };
    const ganz = () => { k = 1; tx = 0; ty = 0; zeigen(); };

    /* Worauf zielt der +-Knopf?
     *
     * Auf die Mitte zu zoomen ist die bequeme Antwort und die falsche:
     * gemessen auf der Mittelamerikakarte liegt die Mitte des Rahmens im
     * offenen Meer noerdlich von Jamaika. Dreimal auf + und das gesuchte
     * Land war aus dem Bild - genau das, was die Lupe verhindern soll.
     *
     * Also auf das GESUCHTE Gebiet, wenn es eines gibt.
     *
     * NICHT bei der umgekehrten Frage: „Wo liegt Guatemala?" waere
     * beantwortet, sobald die Karte von allein dorthin faehrt. Dort bleibt
     * es bei der Mitte - und der Doppeltipp trifft ohnehin die Stelle, auf
     * die das Kind selbst zeigt. */
    const anker = (!umgekehrt && zielForm && zielForm.anker)
      ? { x: zielForm.anker[0], y: zielForm.anker[1] } : null;
    const halten = () => (anker ? { x: k * anker.x + tx, y: k * anker.y + ty } : null);

    /* Gesucht wird im BILDSCHIRM, nicht mehr im Kartenkasten: die Knoepfe
     * stehen seit Q33 in der Werkzeugspalte (siehe dort). */
    s.querySelector('#lupePlus').onclick  = () => um(1.6, halten());
    s.querySelector('#lupeMinus').onclick = () => um(1 / 1.6, halten());
    s.querySelector('#lupeGanz').onclick  = ganz;

    /* Ziehen und Aufziehen.
     *
     * Ein Finger schiebt die Karte - aber NUR wenn sie groesser als das
     * Fenster ist. Bei ganzer Karte gibt es nichts zu schieben, und ein
     * Schieben, das nichts tut, verschluckt nur den Tipp: „Tippe auf die
     * Karte" ist bei der umgekehrten Frage die ganze Bedienung.
     *
     * Zwei Finger ziehen auf. Der Abstand der beiden ist das Mass, ihre
     * Mitte der Festpunkt.
     */
    const finger = new Map();
    let zog = false, start = null;
    const mitte = () => { const a = [...finger.values()];
      return { x:(a[0].x + a[1].x) / 2, y:(a[0].y + a[1].y) / 2,
               d:Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }; };
    kasten.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.lupenknopf')) return;
      finger.set(e.pointerId, { x:e.clientX, y:e.clientY });
      if (finger.size === 2) start = { ...mitte(), k, tx, ty };
      else start = { x:e.clientX, y:e.clientY, k, tx, ty };
      zog = false;
      /* Gefangen wird der Zeiger NUR, wenn es etwas zu ziehen gibt: bei
         zwei Fingern oder in einer vergroesserten Karte. Bei ganzer Karte
         gehoert jeder Tipp der Karte selbst - „Tippe auf die Karte" ist
         bei der umgekehrten Frage die ganze Bedienung. */
      if (finger.size >= 2 || k > 1.01) kasten.setPointerCapture?.(e.pointerId);
    });
    kasten.addEventListener('pointermove', (e) => {
      if (!finger.has(e.pointerId)) return;
      finger.set(e.pointerId, { x:e.clientX, y:e.clientY });
      if (finger.size >= 2 && start && start.d) {
        const m = mitte();
        if (m.d > 0 && start.d > 0) {
          k = Math.max(1, Math.min(MAX, start.k * (m.d / start.d)));
          const p = inSvg(start.x, start.y);
          if (p) { const cx = (p.x - start.tx) / start.k, cy = (p.y - start.ty) / start.k;
            tx = p.x - k * cx; ty = p.y - k * cy; }
          zog = true; zeigen();
        }
        return;
      }
      if (k <= 1.01 || !start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      // Erst ab acht Punkten ist es ein Schieben. Darunter ist es ein
      // Tipp mit ruhiger Hand, und der gehoert der Karte.
      if (!zog && Math.hypot(dx, dy) < 8) return;
      zog = true;
      const m = svg.getScreenCTM();
      if (!m) return;
      tx = start.tx + dx / m.a; ty = start.ty + dy / m.d;
      zeigen();
    });
    const los = (e) => {
      finger.delete(e.pointerId);
      if (!finger.size) start = null;
      if (zog) { const bis = Date.now() + 400; kasten.dataset.gezogenBis = bis; }
    };
    kasten.addEventListener('pointerup', los);
    kasten.addEventListener('pointercancel', los);

    /* KEIN Doppeltipp - und das ist eine Entscheidung, keine Luecke.
     *
     * Er war gebaut: zweimal tippen hinein, noch einmal heraus. Auf der
     * umgekehrten Frage („Wo liegt Guatemala?") ist ein Tipp auf die Karte
     * aber die ANTWORT. Ein Kind, das zoomen will, haette mit dem ersten
     * Tipp geantwortet - und mit dem zweiten die Karte verschoben,
     * waehrend die Auswertung laeuft.
     *
     * Gefunden hat es nicht das Nachdenken, sondern die Bildabnahme: sie
     * spielt die umgekehrte Frage durch, tippte zweimal kurz
     * hintereinander auf dieselbe Stelle, und blieb dann stehen, weil die
     * Frage nicht weiterging.
     *
     * Zwei Finger und die Knoepfe reichen. Beide kollidieren mit nichts.
     */

    return { um, umPunkt, ganz, wert: () => k,
             gezogen: () => +(kasten.dataset.gezogenBis || 0) > Date.now() };
  })();

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
  // 500 ms, und `?flott` kuerzt sie mit: sonst wartete der Rauchtest an
  // fuenf Stellen 900 ms auf eine Ansage, die es noch gar nicht gab.
  const ansageText = (() => {
    const teile = [frageText];
    // Bei der umgekehrten Frage waere die Aufzaehlung der Kandidaten die
    // halbe Antwort - gefragt ist ja gerade, WO eines davon liegt.
    if (!tippt && !karteAntwortet) teile.push(aufzaehlen(kand.map(k=>k.name)) + '?');
    return teile.join(' ');
  })();
  nochHoerenAnhaengen(ansageText);
  setTimeout(()=>{ ansagen(ansageText); }, FLOTT ? 60 : 500);
  return s;
}

/* ---------- Belohnungsmoment --------------------------------------------- */
/* „Das ist X." an EINER Stelle (Q45).
   Der Platzhalter, der den Raum fuer das Lob freihaelt, muss genau den
   Satz tragen, der gleich kommt - sonst haelt er den falschen Raum frei.
   Zwei Schablonen mit demselben Wortlaut waeren genau die Sorte Dopplung,
   die einmal veraltet (Regel 6). */
const sacheSatz = (ziel) => `Das ist ${ziel.name}.`;

/* `stattSatz`: bei den Nachbarn (I21) steht dort nicht „Das ist Hessen",
   sondern „Hessen grenzt an Bayern" - die Antwort ist keine Benennung,
   sondern eine Beziehung, und der Lobsatz muss beide Namen halten.
   Ein Sonderfall IN `sacheSatz` ginge nicht: die Funktion kennt nur EIN
   Gebiet, und hier sind es zwei. */
function belohnung(s, ziel, fastText, zeigeStadt, nebenbei, spruch, neuerAufkleber,
                   stattSatz){
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
  // Der Stadtpunkt erscheint NACH der richtigen Antwort - als Zugabe.
  //
  // Die Lage steht am Gegenstand selbst, nicht in `D.deutschland`: seit es
  // die Ebene „Hauptstädte in Europa" gibt (R6), liegt die Hälfte der
  // Städte gar nicht in Deutschland. `vorrat()` gibt `ort` mit.
  if (zeigeStadt && ziel.ort && punkt) {
    punkt.setAttribute('cx',ziel.ort[0]); punkt.setAttribute('cy',ziel.ort[1]);
    punkt.style.display='';
    punkt.animate([{r:0},{r:7}],{duration:300,delay:600,easing:'cubic-bezier(.34,1.56,.64,1)',fill:'forwards'});
  }
  nameAufDieKarte(s, ziel);
  /* Ein Satz zum Mitnehmen (D3) - aber nur, wenn `nebenbei` frei ist.
   *
   * Der Platz ist schon vergeben: bei der umgekehrten Frage steht dort,
   * WO das Getippte lag („Das ist Bayern. Bremen liegt weiter oben.").
   * Diese Auskunft gehoert zur Aufgabe, der Satz ist eine Zugabe - und
   * eine Zugabe verdraengt nichts.
   *
   * Kein Ersatz, wenn es keinen Satz gibt: `satzZu` gibt dann `null`,
   * und `lobsatz` laesst die Zeile weg. Ein Fuellsatz saehe aus wie
   * einer und waere keiner. */
  lobsatz(s, stattSatz || sacheSatz(ziel), fastText, spruch,
          nebenbei || Saetze.satzZu(ziel.id) || '', neuerAufkleber);
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
    'dominant-baseline':'central', 'font-size':SCHRIFT, class:'fahnentext' });
  g.appendChild(text);

  /* Der Name wird gesetzt - einzeilig oder in zwei Zeilen.
   *
   * Jede Zeile ist ein eigenes `tspan` mit eigenem `x`; sonst zoege das
   * `x` des Textknotens die zweite Zeile nicht mit, wenn die Fahne
   * spaeter verschoben wird. */
  const setzen = (zeilen, x = 0) => {
    text.textContent = '';
    text.setAttribute('x', x);
    if (zeilen.length === 1) { text.textContent = zeilen[0]; return; }
    zeilen.forEach((z, i) => text.appendChild(knoten('tspan',
      { x, dy: i === 0 ? -SCHRIFT * 0.55 : SCHRIFT * 1.1 }, z)));
  };

  /* Wo bricht ein Name um?
   *
   * Am BINDESTRICH oder an einer LUECKE, und zwar an der Stelle, die der
   * Mitte am naechsten liegt - „Mecklenburg-" / „Vorpommern", nicht
   * „Mecklenburg-Vorpom-" / „mern". Ein einzelnes langes Wort wird NICHT
   * getrennt: dafuer braeuchte es ein Woerterbuch, und eine falsche
   * Trennfuge liest sich schlimmer als eine breite Fahne.
   *
   * Der Bindestrich bleibt am Ende der ersten Zeile stehen, wie es sich
   * gehoert: „Nordrhein-" / „Westfalen".
   */
  const umbrechen = (name) => {
    const mitte = name.length / 2;
    let beste = null, abstand = Infinity;
    for (let i = 0; i < name.length; i++) {
      if (name[i] !== '-' && name[i] !== ' ') continue;
      const d = Math.abs(i - mitte);
      if (d < abstand) { abstand = d; beste = i; }
    }
    if (beste === null) return [name];
    return name[beste] === '-'
      ? [name.slice(0, beste + 1), name.slice(beste + 1)]
      : [name.slice(0, beste), name.slice(beste + 1)];
  };

  let zeilen = [ziel.name];
  setzen(zeilen);
  let tb = text.getBBox();
  const fb = flaeche.getBBox();
  const passt = tb.width + luft*2 <= fb.width * 0.92
             && tb.height + luft*1.4 <= fb.height * 0.7;

  /* Passt der Name nicht ins Gebiet UND ist die Fahne breiter als die
   * ganze Karte, wird umgebrochen.
   *
   * Der Anlass steht im Bericht der Ton-Runde: auf dem Zielgeraet
   * (844x390) ist die Deutschlandkarte rund 170 Bildschirmpunkte breit,
   * „Mecklenburg-Vorpommern" bei 21 px Schrift 260. Die Fahne liess sich
   * dann nicht mehr in die Karte klemmen - beide Seiten schoben
   * gegeneinander, und der Name hing links heraus. Zweizeilig sind es
   * rund 150 Punkte, und er passt.
   *
   * Gemessen wird gegen die Karte, nicht gegen den Bildschirm: neben der
   * Karte stehen die Antwortknoepfe. */
  const vbB = svg.viewBox.baseVal;
  if (!passt && tb.width + luft*2 > vbB.width * 0.98) {
    const zwei = umbrechen(ziel.name);
    if (zwei.length === 2) { zeilen = zwei; setzen(zeilen); tb = text.getBBox(); }
  }
  const b = tb.width, h = tb.height;

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
    const vb = vbB;
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
    /* Waagerecht in die Karte klemmen - so nah am Gebiet wie moeglich.
     *
     * Ist die Fahne trotz Umbruch breiter als die Karte, schieben beide
     * Klemmungen gegeneinander und die letzte gewinnt: der Name haengt
     * dann auf EINER Seite heraus. Mittig ueberstehen ist in dem Fall das
     * kleinere Uebel - und es ist auf jeder Seite gleich viel. */
    if (2 * halbB > vb.width) {
      dx = vb.x + vb.width / 2 - ziel.anker[0];
    } else {
      const links  = ziel.anker[0] + dx - halbB;
      const rechts = ziel.anker[0] + dx + halbB;
      if (links  < vb.x)             dx += vb.x - links;
      if (rechts > vb.x + vb.width)  dx -= rechts - (vb.x + vb.width);
    }
    rand.setAttribute('x', dx - halbB);
    rand.setAttribute('y', dy - halbH);
    // Neu setzen mit verschobenem `x` - die Zeilen stehen in `zeilen`,
    // nicht im DOM: `textContent` wuerde zwei Zeilen zu einer verkleben.
    setzen(zeilen, dx);
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
  /* Der Test hat ein Urteil, die Uebung hat einen Fortschritt (B2).
   *
   * Gezaehlt wird `glatt` - beim ERSTEN Versuch richtig. Im Test gibt es
   * ohnehin nur einen, aber die Zahl kommt aus derselben Stelle wie
   * ueberall sonst: zwei Zaehler fuer dieselbe Sache waeren zwei Zahlen,
   * die eines Tages auseinanderlaufen (F2 und F3 im Stand, beide genau so
   * entstanden). */
  const bestanden = st.test && st.glatt >= Math.ceil(st.liste.length * BESTANDEN_AB);
  if (st.test && bestanden) pokalSetzen(st.ebeneId,
    { zeit: Date.now(), richtig: st.glatt, von: st.liste.length });
  /* Was ist in DIESER Sitzung dazugekommen (D2)? Hoechstens eines wird
     genannt - zwei Abzeichen auf einmal sind selten, und wer drei Zeilen
     vorgelesen bekommt, hoert bei der dritten nicht mehr zu. */
  const abzNeu = verdiente(st.ebeneId, Stand).filter(a => !st.abzVorher.has(a.id))[0];
  /* Und das Tier - VOR dem Markup, denn es entscheidet sich hier und wird
     dabei abgelegt. Ein Aufruf, nicht zwei: `tierFuer` merkt sich das
     Ergebnis an der Sitzung. */
  const tier = tierFuer(st);   // { raum, neu:[…] } oder { gorilla } oder null
  /* DER TAGESSTERN (N2). Er wird HIER vergeben und nicht beim letzten
     Lob: „die Uebung ist zu Ende" ist genau dieser Bildschirm, und ein
     Kind, das mitten in einer Runde aufhoert, hat sie nicht zu Ende
     gebracht.
     Der Aufruf ist absichtlich NICHT abgewartet - der Bildschirm soll
     nicht auf die Ablage warten. Was er anzeigt, steht schon in
     `tagesStand`, denn `tagesSchritt` setzt es, bevor es schreibt. */
  const zielVollDanach = tagesSchritt();
  const tagesJetzt = P ? tagesSterne(P.id) : 0;
  /* Eine ganze Runde ohne einen einzigen Fehlversuch. Kein Mengen-
     abzeichen, sondern ein Ereignis - und deshalb abgelegt. Es zaehlt das
     ERSTE Mal: „einmal ganz ohne Fehler" ist ein Tag, kein Zustand. */
  if (st.glatt === st.liste.length) glattStand().then(alt => { if (!alt) glattSetzen(
    { zeit: Date.now(), ebene: st.ebeneId, ebeneTitel: (EBENEN.find(e => e.id === st.ebeneId) || {}).titel || st.ebeneId,
      von: st.liste.length }); });
  /* Die BUEHNE nur bei den Kinderprofilen (N10) - derselbe Schalter wie
     bei Jubel, Sternen und Figur. Stephan bekommt seinen Bildschirm als
     Ganzes: er will das Ergebnis lesen, nicht ihm zusehen. */
  s.innerHTML=kopf({}) + `
    <div class="mitte${ton().feier ? ' buehne' : ''}">
      ${/* STERNE, FIGUR UND ZEILE IN EINEM KASTEN (I18).
           Untereinander sind sie 156 der 364 Punkte, die dieser
           Bildschirm im vollsten Fall braucht - und auf 844 x 390 stehen
           378 zur Verfuegung. Der Kasten aendert daran hier nichts; er
           gibt dem kurzen Querformat die Moeglichkeit, aus drei
           Bloecken EINE Reihe zu machen (siehe `@media`). Ohne ihn
           liesse sich das mit Stilblatt allein nicht sagen: drei
           Geschwister in einer Spalte werden nicht zur Reihe, ohne dass
           alle anderen es auch werden. */''}
      <div class="siegkopf">
      ${st.test ? `<div class="siegsterne">${bestanden ? POKALGROSS : ''}</div>`
        : ton().siegsterne ? `<div class="siegsterne${ton().feier ? ' feier' : ''}"
             >${sterne(n,56)}</div>` : ''}
      ${/* Die Figur feiert mit (N9) - gross, ueber der Zeile, nur bei den
           Kinderprofilen. Auf dem Endbildschirm ist Platz, und hier ist
           sie am meisten wert: das ist der Augenblick, in dem ein Kind
           jemandem etwas zeigen moechte. */
        ton().feier ? `<div class="figurgross">${figur('feiert', 64)}</div>` : ''}
      <div class="gross">${st.test
        ? (bestanden ? 'Test bestanden!' : 'Noch nicht ganz.') : ton().ende}</div>
      </div>
      <div class="unter">${st.test
        ? `${st.glatt} von ${st.liste.length} richtig — ohne Hilfen.`
          + (bestanden ? '' : ` Ab ${Math.ceil(st.liste.length * BESTANDEN_AB)} gibt es den Pokal.`)
        : `${st.glatt} von ${st.liste.length} auf Anhieb richtig.`}</div>
      ${/* PUNKTE UND ZEIT - nur fuer die Erwachsenen (I27).
           Die Kinder bekommen Sterne, Aufkleber und eine Figur, die
           mitfeiert; eine vierte Waehrung waere fuer sie keine
           Nachricht, sondern Rauschen. Fuer Stephan und Violeta ist es
           umgekehrt: Sterne sagen ihnen nichts, eine Zahl schon.
           Der Zuschlag steht SEPARAT da und nicht in der Summe
           versteckt. Wer wissen will, ob sich Tempo lohnt, muss sehen,
           wieviel es gebracht hat - sonst ist es ein Versprechen ohne
           Beleg. */''}
      ${!ton().feier ? (() => {
        const pk = punkteFuer(st);
        return `<div class="punkte"><b>${pk.gesamt}</b> Punkte`
          + `<span>${pk.basis} für richtig`
          + (pk.tempo ? ` · ${pk.tempo} für Tempo` : ' · kein Tempo-Zuschlag')
          + ` · ${alsUhr(Date.now() - st.begonnen)} gesamt</span></div>`;
      })() : ''}
      ${/* NEU SICHER (N4). Der Kasten sagt zum ersten Mal, was er weiss:
           „das kannst du jetzt". Genannt wird es nur, wenn es DIESE Runde
           passiert ist, und hoechstens drei Namen - wer fuenf Zeilen
           vorgelesen bekommt, hoert bei der dritten nicht mehr zu (das
           steht schon beim Abzeichen daneben und gilt hier genauso). */
        st.neuSicher.length ? `<div class="neusicher"><i class="siegel"></i><span>${
          st.neuSicher.length === 1 ? 'Das kannst du jetzt sicher: '
            : `${st.neuSicher.length} kannst du jetzt sicher: `}${
          aufzaehlen(st.neuSicher.slice(0, 3).map(id =>
            (st.alle.find(x => x.id === id) || {}).name || id), 'und')}${
          st.neuSicher.length > 3 ? ' …' : ''}</span></div>` : ''}
      ${/* Tagesziel und beste Serie stehen in EINEM Kasten (I18) - aus
           demselben Grund wie der Jubelkopf: zwei kleine Zeilen, die auf
           dem kurzen Querformat nebeneinander passen und untereinander
           55 Punkte kosten. */''}
      <div class="siegstand">
      ${/* DAS TAGESZIEL (N2). Es steht unter dem Ergebnis der Runde, weil
           es vom TAG erzaehlt und nicht von dieser Uebung - und es steht
           nur ausserhalb des Tests: ein Test ist eine Pruefung, kein
           Tagespensum. */
        !st.test && istKind(P) ? `<div class="tagesende${tagesJetzt >= TAGESZIEL ? ' voll' : ''}">${
          tagesZeichen(P ? P.id : '')}<span>${
            tagesJetzt >= TAGESZIEL ? 'Tagesziel geschafft!'
            : `${tagesJetzt} von ${TAGESZIEL} heute`}</span></div>` : ''}
      ${/* DIE BESTE SERIE (N1). Sie steht nur da, wenn es eine GAB - eine
           Zeile „beste Serie: 1" waere die Mitteilung, dass nichts
           passiert ist. Und sie steht ueber dem Abzeichen, weil sie
           von DIESER Runde erzaehlt und das Abzeichen vom Ganzen. */
        st.besteSerie >= SERIE_AB ? `<div class="serieende">${
          serieZeichen(st.besteSerie, false)}<span>${st.besteSerie} am Stück richtig!</span></div>` : ''}
      </div>
      ${abzNeu ? `<div class="abzneu">${ABZ(abzNeu.zeichen, true, 40)}
        <span>Neues Abzeichen: ${abzNeu.titel}</span></div>` : ''}
      ${/* Die Tiere (T1). Sie stehen UEBER dem Balken und unter dem Satz:
           es ist die Antwort auf „wie lief es", und die steht oben. */
        tier && tier.neu ? `<div class="tierneu">${
          tier.neu.map(t => tierBild(t)).join('')}
        <span>${tier.grund
          ? `${tier.grund.charAt(0).toUpperCase()}${tier.grund.slice(1)}! `
            + `${aufzaehlen(tier.neu.map(t => t.name), 'und')} für dein Buch.`
          : `${tier.raum.titel} ist offen: ${aufzaehlen(tier.neu.map(t => t.name), 'und')}!`
        }</span></div>`
        : tier && tier.gorilla ? `<div class="tierneu hilft">${tierBild(tier.gorilla)}
        <span>${tier.gorilla.name} übt mit dir weiter.</span></div>`
        : tier && tier.weiter ? `<div class="tierneu noch">${
            tierBild(Tiere.tierMit(tier.weiter.raum.tiere[0]))}
        <span>${weiterSatz(tier)}</span></div>`
        : tier && tier.schon ? `<div class="tierneu noch"><span>${weiterSatz(tier)}</span></div>`
        : ''}
      ${fortschrittBalken(f, 'breit')}
      ${/* `data-neu` traegt die ZAHL der neuen Aufkleber ins Markup.
           Der Rauchtest hat sie vorher aus dem Satz gelesen - und der
           lautet „6 neue!", ohne das Wort „Aufkleber". Die Pruefung lief
           damit ins Leere, und die Gegenprobe hat es gemeldet: das Tor
           blieb gruen, obwohl der Fehler drin war. Eine Klasse oder eine
           Marke ist eine Zusage des Programms; ein Satz ist Text, den
           jemand aendern darf. */''}
      <div class="buchstand" data-neu="${st.aufkleber}">${
        /* Was diese Runde eingebracht hat, steht hier als BILD - in
           derselben Zeile, in der vorher nur das Zeichen stand. Nicht
           darueber: der Endbildschirm hat auf 844 x 390 keine Zeile
           uebrig, und eine neue haette die Knoepfe hinausgeschoben.
           Hoechstens drei, sonst wird die Zeile in einer guten Runde
           laenger als der Bildschirm. */
        st.neueKleber.length
          ? `<span class="kleberzeile">${st.neueKleber.slice(0, 3).map((id, n) => {
              const i = st.alle.findIndex(x => x.id === id);
              return i < 0 ? '' : `<span class="frischerkleber" style="--nr:${n}"
                >${kleberBild(st.alle[i], i, st.ebeneId)}</span>`;
            }).join('')}</span>`
          : kleberMarke(f.gesammelt, f.gesamt)}<span>${
        st.aufkleber ? ton().neueKleber(st.aufkleber)
        : `von ${f.gesamt} im Buch`}</span></div>${
        /* Warum noch keiner da ist - aber nur, solange noch keiner da ist.
           Danach ist der Satz eine Erklaerung fuer etwas, das man sieht. */
        !st.aufkleber && !f.gesammelt
          ? `<div class="leiser">${ton().ersterKleber}</div>` : ''}
      <div class="reihe siegwahl${ton().feier && st.aufkleber ? ' feier' : ''}">
        <button class="knopf haupt" id="nochmal">${ZEI('nochmal', 22)}${
          st.test ? (bestanden ? 'Weiter üben' : 'Noch einmal üben') : 'Noch einmal'}</button>
        <button class="knopf" id="buch">${ZEI('buch', 22)}Forscherbuch</button>
        <button class="knopf" id="andere">${ZEI('kacheln', 22)}Etwas anderes</button>
      </div>
    </div>`;
  /* Nach einem Test fuehrt der Hauptknopf ins UEBEN, nicht in den naechsten
   * Test - auch wenn er bestanden wurde. Wer durchgefallen ist, soll nicht
   * gleich noch einmal geprueft werden, und wer bestanden hat, hat hier
   * nichts mehr zu holen. Der Test steht weiter an der Kachel. */
  s.querySelector('#nochmal').onclick=()=>starten(st.ebeneId);
  s.querySelector('#buch').onclick=()=>zeige(forscherbuch);
  s.querySelector('#andere').onclick=()=>zeige(ebenenwahl);
  /* `ansagen`, nicht `vorlesen`.
   *
   * Hier stand `vorlesen('Geschafft!')` - also unbedingt, an jedem Profil
   * vorbei. Der Endbildschirm rief damit auch Lea und den Eltern
   * „Geschafft!" hinterher, obwohl beide Profile `vorlesen:false` tragen.
   * Aufgefallen ist es nie: der Rauchtest zaehlt nur die ANSAGE der
   * Aufgabe (`Wie heißt` / `Was ist`), und dieser Satz ist keine. */
  ansagen(ton().ende);
  if (abzNeu) ansagen(`Neues Abzeichen! ${abzNeu.titel}`);
  /* Fiona liest nicht - fuer sie IST die Ansage der Satz. Und der Gorilla
     bekommt einen freundlichen: er ist kein Tadel, sondern der, der
     wiederkommt. */
  if (tier && tier.neu)
    ansagen(`${tier.raum.titel} ist offen! Du bekommst ${aufzaehlen(tier.neu.map(t => t.name), 'und')}.`);
  else if (tier && tier.gorilla)
    ansagen(`${tier.gorilla.name} kommt vorbei und übt mit dir weiter.`);
  /* Fiona liest nicht - fuer sie IST die Ansage der Satz, und dieser
     hier ist der einzige, den sie nach einer fertigen Ebene ueberhaupt
     zu hoeren bekam. */
  else if (tier && (tier.weiter || tier.schon)) ansagen(weiterSatz(tier));
  ansagen(`Du hast ${st.glatt} von ${st.liste.length} auf Anhieb richtig. `
    + (st.aufkleber ? `${st.aufkleber} neue Aufkleber! `
       : f.gesammelt ? '' : `${ton().ersterKleber} `)
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
/* Das Buch holt die Umrisse NACH, die es zeigen will.
 *
 * Der Umriss eines Bundeslands oder eines Landes liegt nicht im
 * Startbuendel - er wird geholt, wenn die Ebene betreten wird (`budget`:
 * 56 von 94 KB Geometrie gehoerten allein Deutschland). Das Buch hat das
 * nie getan: es rief `vorrat()` fuer jede Ebene und nahm, was gerade da
 * war.
 *
 * Wer die Bundeslaender gestern gespielt hat und heute das Buch aufmacht,
 * ohne die Ebene vorher zu betreten, sah deshalb auf JEDER Karte das Wort
 * „undefined" - der Kasten faellt ohne `pfad` auf die Rechen-Darstellung
 * zurueck und setzt `x.frage`, die es bei einem Gebiet nicht gibt.
 *
 * Kein Tor hat es gemeldet, und keines konnte: der Rauchtest oeffnet das
 * Buch, NACHDEM er die Ebene gespielt hat, und das Vorbild `quer-buch`
 * zeigt Kontinente - die liegen im Startbuendel.
 *
 * Geholt wird nur, was gezeigt wird: die Ebenen mit Aufklebern und die
 * eine, aus der die Vorschau kommt. Wer alles hoelte, zoege sechs
 * Kontinente und Deutschland nach, um drei Aufkleber zu zeigen.
 */
/* Welches Kapitel im Buch zuletzt offen stand (Q44).
 *
 * AUSSERHALB der Funktion, weil `forscherbuch` bei jedem Aufruf neu baut:
 * wer einen Aufkleber antippt und zurueckkommt, soll dort weiterlesen, wo
 * er war, und nicht auf Seite eins. */
let buchKapitel = null;


/* ---------- Die Landschaft (T2) ----------------------------------------
 *
 * Wer einen Lebensraum voll hat, bekommt ein BILD dazu, in das er seine
 * Tiere hineinstellen kann. Der Wunsch war: „Da kann man dann jedes Tier
 * reinbringen und kann sich dann ein kleines Szenario umsetzen."
 *
 * ES WIRD GETIPPT, NICHT GEZOGEN. Erst auf ein Tier, dann auf einen
 * Platz. Ziehen waere naeher an der Vorstellung - und auf dem Zielgeraet
 * die schlechtere Bedienung: ein sechsjaehriger Finger, der ein Tier
 * ueber ein 780 Punkte breites Bild zieht, verliert es unterwegs, und
 * ein losgelassenes Tier ohne Platz muss irgendwohin. Zwei Tipps sind
 * immer eindeutig, und sie sind mit dem Rauchtest nachzuspielen - ein
 * Zug ist es nur unter Vorbehalt.
 *
 * NEUN PLAETZE IN DREI REIHEN, und die Reihen sind verschieden hoch: die
 * hinterste traegt die kleinsten Tiere, die vorderste die groessten.
 * Das ist die ganze Tiefe des Bildes, und sie kostet nichts - drei
 * Zeilenhoehen im Raster.
 *
 * JEDES Tier darf hinein, nicht nur die drei des Raumes. Ein Elefant in
 * der Karibik ist kein Fehler, sondern der Witz an der Sache; die Tiere
 * des Raumes stehen nur VORN in der Bank, damit das Naheliegende auch
 * das Naechste ist.
 *
 * DER STAND STEHT IM PROFIL, nicht am Geraet: er reist mit `tiere:` mit
 * (siehe `gleichlauf.js`). Gespeichert wird die Reihe der neun Plaetze,
 * nicht Bildpunkte - ein Bild, das auf dem iPad anders gross ist als auf
 * dem iPhone, haette sonst zwei Wahrheiten.
 */
function landschaft(titel, zurueck){
  const s = el('div');
  const k = Tiere.kulisseZu(titel);
  const raum = Tiere.RAEUME.find(r => r.titel === titel);
  const eigene = new Set(raum ? raum.tiere : []);
  /* Die Bank: alles, was dem Kind gehoert - die Tiere DIESES Raumes
     zuerst. Der Gorilla ist nicht dabei; er wird nicht gesammelt. */
  const habe = (TierStand.ids || []).map(Tiere.tierMit).filter(t => t && t.bild);
  const bank = [...habe.filter(t => eigene.has(t.id)),
                ...habe.filter(t => !eigene.has(t.id))];
  /* Die neun Plaetze. Was im Stand steht, aber nicht (mehr) im Besitz
     ist, faellt weg - sonst stuende ein Tier im Bild, das im Buch nicht
     existiert. */
  const daheim = new Set(bank.map(t => t.id));
  const alt = (TierStand.szenen || {})[titel];
  const plaetze = Array.from({ length: Tiere.PLAETZE }, (_, i) => {
    const id = alt && Array.isArray(alt.stand) ? alt.stand[i] : null;
    return id && daheim.has(id) ? id : null; });

  let gewaehlt = null;

  const sichern = () => {
    TierStand = { ...TierStand,
      szenen: { ...(TierStand.szenen || {}),
        [titel]: { stand: [...plaetze], zeit: Date.now() } } };
    tiereSichern();
  };

  const reihe = (i) => Math.floor(i / 3);
  const platzHtml = (id, i) => {
    const t = id ? Tiere.tierMit(id) : null;
    return `<button class="platz r${reihe(i)}${t ? ' voll' : ' frei'}" data-platz="${i}"
      aria-label="${t ? `${t.name} wegnehmen` : `Platz ${i + 1}`}"
      >${t ? tierBild(t, 'imbild') : ''}</button>`;
  };
  /* OHNE NAMEN. In der Wand des Buches steht er - dort wird gesammelt,
     und dort gehoert er hin. Hier ist die Bank ein Werkzeugkasten: der
     Name wird gesprochen und steht in der Zeile im Bild, sobald ein
     Tier in der Hand ist. Gemessen: mit Namen braucht ein Stueck 68
     Punkte, ohne 44 - und bei dreissig Tieren ist das der Unterschied
     zwischen einer Bank, die auf das kleinste Geraet passt, und einer,
     die 416 Punkte unter dem Rand endet. */
  const bankHtml = (t) => `<button class="bankstueck${
      plaetze.includes(t.id) ? ' weg' : ''}${gewaehlt === t.id ? ' gewaehlt' : ''}"
      data-tier="${t.id}" style="--ton:${t.ton}"
      aria-label="${t.name}" title="${t.name}">${tierBild(t)}</button>`;

  s.innerHTML = kopf({ links: zurueckKnopf('Buch'),
      mitte: `<span class="marke">${titel}</span>`,
      rechts: `<button class="knopf" id="leeren" aria-label="Alle Tiere wegräumen"
                 title="Wegräumen">${ZEI('zu', 22)}<span class="wort">Wegräumen</span></button>` })
    + `<div class="rollen landschaft">
        <div class="szene" style="--ton:${k.ton}">
          <svg class="kulisse" viewBox="${Tiere.SZENE}" role="img"
               aria-label="${titel}">${k.bild}</svg>
          ${/* Zeile und Plaetze liegen ZUSAMMEN ueber der Kulisse, als
                Spalte. Der erste Anlauf setzte die Zeile als freien
                Ueberzug in den Himmel und die Plaetze auf feste 22 %:
                auf dem kleinsten Geraet lag sie damit ueber dem
                hintersten Platz, und `passt` meldete sie als verdeckt.
                Eine Spalte kann sich nicht selbst ueberdecken - und die
                22 % waren ohnehin geraten, wo eine Zeile ihre Hoehe
                mitbringt. */''}
          <div class="szeneinhalt">
            <p class="szenesatz hinweis" id="szenesatz">Erst ein Tier, dann ein Platz.</p>
            <div class="plaetze">${plaetze.map(platzHtml).join('')}</div>
          </div>
        </div>
        <div class="bankspalte">
          <div class="tierbank">${bank.map(bankHtml).join('')}</div>
          <button class="knopf bankmehr" id="mehrtiere" hidden
                  data-lesen="Mehr Tiere">${ZEI('weiter', 20)}<span class="wort">Mehr Tiere</span></button>
        </div>
      </div>`;

  const feld = s.querySelector('.plaetze');
  const bankfeld = s.querySelector('.tierbank');
  const mehr = s.querySelector('#mehrtiere');

  /* ---- Die Bank BLAETTERT, wenn sie voll ist (T4) --------------------
   *
   * Gemessen auf 667 x 375 - dem kleinsten Geraet, das `passt` faehrt:
   * neben dem Bild bleiben 254 x 303 Punkte, also 5 Spalten mal 6 Reihen
   * zu 44 plus Luecke - dreissig Kaesten. Beim elften Lebensraum sind es
   * dreiunddreissig, und die Bank lag 29 Punkte unter dem Rand.
   *
   * Es ist kein Grundrissfehler, sondern eine FLAECHE, die nicht da ist:
   * neun Plaetze zu 44 verlangen ein Bild von mindestens 288 x 162, und
   * was daneben oder darunter uebrig bleibt, fasst in keiner Anordnung
   * dreiunddreissig Kaesten zu 44. Rollen ist keine Loesung (dieselbe
   * Zeile steht im Tor: ein Kind rollt nicht in einer Liste, von der es
   * nicht weiss, dass sie weitergeht), kleiner geht nicht (44 ist die
   * Fingergrenze), also wird geblaettert.
   *
   * EIN Knopf und nicht zwei: er laeuft im Kreis. „Vor" und „Zurueck"
   * waeren zwei Zeichen, zwischen denen ein sechsjaehriges Kind waehlen
   * muesste, und die Bank hat heute zwei Seiten.
   *
   * Wieviel auf eine Seite passt, wird GEMESSEN und nicht gesetzt: der
   * Kasten ist auf dem Telefon 44 und auf dem iPad 56 Punkte breit, und
   * die Bank ist mal Spalte, mal Zeile. Eine feste Zahl waere auf dem
   * grossen Geraet eine halb leere Bank. */
  let seite = 0, jeSeite = bank.length;
  const messen = () => {
    const k = bankfeld.querySelector('.bankstueck');
    if (!k) return bank.length;
    const kb = k.getBoundingClientRect(), rb = bankfeld.getBoundingClientRect();
    if (!kb.width || !rb.width) return bank.length;
    const l = parseFloat(getComputedStyle(bankfeld).gap) || 0;
    const sp = Math.max(1, Math.floor((rb.width  + l) / (kb.width  + l)));
    const ze = Math.max(1, Math.floor((rb.height + l) / (kb.height + l)));
    return Math.max(6, sp * ze);
  };
  const satz = s.querySelector('#szenesatz');
  /* Der Name traegt seinen Artikel („die Schlange") - am Satzanfang muss
     der gross werden, sonst steht dort „die Schlange ist da." mit kleinem
     d. Hier und nicht in den Daten: der Artikel gehoert zum Namen, die
     Grossschreibung zum Satz. */
  const sagen = (text) => { const t = text.charAt(0).toUpperCase() + text.slice(1);
    satz.textContent = t; ansagen(t); };

  /* Neu gezeichnet werden nur die beiden Listen, nicht der Bildschirm.
     `zeige()` waere eine Ueberblendung samt Kulisse - fuer einen Tipp,
     der sich wie Hinstellen anfuehlen soll. */
  const male = () => {
    feld.innerHTML = plaetze.map(platzHtml).join('');
    const seiten = Math.max(1, Math.ceil(bank.length / jeSeite));
    seite = Math.min(seite, seiten - 1);
    bankfeld.innerHTML = bank.slice(seite * jeSeite, (seite + 1) * jeSeite)
      .map(bankHtml).join('');
    mehr.hidden = seiten < 2;
    binden();
  };

  function binden(){
    feld.querySelectorAll('.platz').forEach(b => b.onclick = () => {
      const i = +b.dataset.platz;
      if (plaetze[i]) {                       // besetzt: wieder wegnehmen
        const t = Tiere.tierMit(plaetze[i]);
        plaetze[i] = null; sichern(); male();
        sagen(`${t.name} geht wieder weg.`);
        return;
      }
      if (!gewaehlt) { sagen('Tippe zuerst auf ein Tier.'); return; }
      const t = Tiere.tierMit(gewaehlt);
      /* Jedes Tier steht hoechstens EINMAL im Bild. Zweimal derselbe
         Koala waere kein Szenario, sondern ein Fehler, den niemand
         zurueckdrehen kann - und die Bank haette kein Zeichen mehr
         dafuer, was schon drin ist. */
      const vorher = plaetze.indexOf(gewaehlt);
      if (vorher >= 0) plaetze[vorher] = null;
      plaetze[i] = gewaehlt; gewaehlt = null;
      sichern(); male();
      sagen(`${t.name} ist da.`);
    });
    bankfeld.querySelectorAll('.bankstueck').forEach(b => b.onclick = () => {
      const id = b.dataset.tier, t = Tiere.tierMit(id);
      const drin = plaetze.indexOf(id);
      if (drin >= 0) {                        // schon im Bild: wieder holen
        plaetze[drin] = null; sichern(); male();
        sagen(`${t.name} geht wieder weg.`);
        return;
      }
      gewaehlt = gewaehlt === id ? null : id;
      male();
      sagen(gewaehlt ? `${t.name}. Jetzt einen Platz.` : t.name);
    });
  }
  binden();

  /* Gemessen wird, sobald der Kasten eine Groesse HAT - also nach dem
     Anhaengen, und wieder beim Drehen des Geraets. Ein `ResizeObserver`
     statt eines Zeitgebers: der Bildschirm wird losgeloest gebaut und
     erst danach eingehaengt, eine Frist waere hier geraten. */
  const beobachter = new ResizeObserver(() => {
    const n = messen();
    if (n !== jeSeite) { jeSeite = n; male(); }
  });
  beobachter.observe(bankfeld);

  mehr.onclick = () => {
    const seiten = Math.max(1, Math.ceil(bank.length / jeSeite));
    seite = (seite + 1) % seiten;
    male();
    sagen(seiten > 1 ? `Noch mehr Tiere. Seite ${seite + 1} von ${seiten}.` : 'Alle Tiere.');
  };

  s.querySelector('#zur').onclick = () => zeige(zurueck || forscherbuch);
  s.querySelector('#leeren').onclick = () => {
    if (!plaetze.some(Boolean)) { sagen('Es ist noch kein Tier im Bild.'); return; }
    plaetze.fill(null); gewaehlt = null; sichern(); male();
    sagen('Alles weggeräumt.');
  };
  ansagen(`${titel}. Tippe auf ein Tier und dann in das Bild.`);
  return s;
}

async function forscherbuch(){
  const s = el('div');
  // Erster Durchgang: die Staende lesen und zaehlen. Das geht OHNE Umrisse -
  // der leichte Stand haelt Kennung, Name und Anker.
  const staende = [];
  for (const e of meineEbenen()) {
    let st={}; try{ st=(await Ablage.hole('fortschritt',`${P.id}:${e.id}`))||{}; }catch(err){}
    const alle = vorrat(e.id);
    staende.push({ e, st,
      da: alle.filter(g => Leitner.istGesammelt(st, g.id)).length,
      offen: alle.filter(g => !Leitner.istGesammelt(st, g.id)).length });
  }
  // Welche Ebene die Vorschau stellt, entscheidet sich schon hier - sonst
  // waere ihr Umriss der eine, der wieder fehlt.
  const dranStand = staende.filter(x => x.da && x.offen).sort((a,b)=>b.da-a.da)[0]
                 || staende.find(x => x.offen);
  await Promise.all(staende
    .filter(x => x.da || x === dranStand)
    .map(x => ebeneLaden(x.e.id).catch(()=>false)));

  // Zweiter Durchgang: jetzt mit Umrissen.
  const gruppen = [];
  for (const { e, st } of staende) {
    const alle = vorrat(e.id);
    const vb = vbVon(e.id);
    const stuecke = alle.map((g,i)=>({
      ...g, gesammelt: Leitner.istGesammelt(st, g.id), gekonnt: Leitner.istGekonnt(st, g.id),
      fach: st[g.id]?.fach ?? 0, i }));
    /* `welt` kommt aus `weltVon` und nicht aus einer Liste hier: dieselbe
       Regel, die die Weltenwahl schon benutzt. Eine zweite Zuordnung
       daneben waere die naechste, die veraltet (Regel 6: was zweimal
       dasteht, veraltet einmal). */
    gruppen.push({ id:e.id, titel:e.titel, farbe:e.farbe, vb, welt: weltVon(e),
      da: stuecke.filter(x=>x.gesammelt), offen: stuecke.filter(x=>!x.gesammelt) });
  }
  const gesamt = gruppen.reduce((a,g)=>a+g.da.length,0);
  const gekonnt = gruppen.reduce((a,g)=>a+g.da.filter(x=>x.gekonnt).length,0);
  const vollen = gruppen.filter(g=>g.da.length);

  // Die Vorschau kommt aus der Ebene, an der GERADE gearbeitet wird - der
  // mit den meisten Aufklebern, die noch nicht fertig ist. Wer noch gar
  // nichts hat, bekommt die erste Ebene gezeigt. Dieselbe Wahl wie oben,
  // nur an den fertigen Gruppen.
  const dran = gruppen.find(g => g.id === (dranStand && dranStand.e.id));
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
  /* ---------- EINE Seite, fuenfmal (Buch-Audit II) -----------------
   *
   * Bis v411 hat jedes Kapitel seinen eigenen Grundriss mitgebracht, und
   * das Querformat wurde daraus ERSCHLOSSEN: `.rollen.buch > .gruppe`
   * links, `> :not(.gruppe)` rechts. Die Annahme dahinter - „im Buch
   * wechseln sich Ueberschrift und Block ab" - ist zweimal gebrochen,
   * beide Male teuer und beide Male erst spaet sichtbar: einmal, weil
   * `.abzkopf` auf dem kurzen Querformat `display:none` war und aus der
   * Platzierung fiel (jeder Block lag danach in der SCHMALEN Spalte),
   * und einmal, weil das Tierkapitel drei Bloecke mitbringt statt einem.
   *
   * Jetzt ist das Paar die STRUKTUR und keine Vermutung mehr: eine
   * Spalte fuer das, was die Seite SAGT (Titel, Zahl, Balken, Fusssatz),
   * eine fuer das, was sie ZEIGT. Was dazwischen fehlt oder dazukommt,
   * ist gleichgueltig - es gibt keine Reihenfolge mehr zu erraten.
   *
   * Und der Fusssatz bekommt damit zum ersten Mal einen Ort. Er stand
   * linksbuendig unter einer mittigen Karte und gehoerte optisch zu
   * nichts (Audit I, B8).
   */
  /* DER ZUSATZ IST EINE ZEILE, kein Anhaengsel (Runde 4).
   *
   * Er stand als `<small>` IM Titel und ist damit umgebrochen, wo die
   * Spalte gerade endete: „Deine Abzeichen 3 / verdient" und „Als
   * Naechstes: Europa 0 von 3 / gesammelt" - beide Male mitten im Satz,
   * beide Male sah es aus wie ein abgeschnittener Text. Gesehen haben
   * das die drei Vorbilder, die es bis Runde 4 nicht gab.
   *
   * Jetzt hat er eine eigene Zeile in der FUSS-Rolle. Damit bricht er
   * dort, wo ein Satz bricht - und die linke Spalte hat die Form, die
   * das Buch ohnehin behauptet: Titel, Zusatz, Balken, Fusssatz. */
  /* `zurueck` und `versteckt` seit den Welten (B12).
     Eine Weltseite haelt mehrere dieser Abschnitte: die Uebersicht und
     je einen fuer ihre Ebenen. Sichtbar ist genau einer - dieselbe
     Mechanik wie im Tierkapitel, eine Ebene hoeher. */
  const buchSeite = ({ id, titel, zusatz = '', balken = '', zeigt, fuss = '',
                       zurueck = '', versteckt = false }) => `
    <section class="buchseite" data-seite="${id}"${versteckt ? ' hidden' : ''}>
      <div class="buchspalte">
        ${zurueck}
        <h3 class="gruppe">${titel}</h3>
        ${zusatz ? `<p class="gruppenzusatz">${zusatz}</p>` : ''}
        ${balken}
        ${fuss}
      </div>
      <div class="buchraster">${zeigt}</div>
    </section>`;

  const kleber = (g, x, offen) => `
    <button class="aufkleber ${offen?'':'da'} ${x.gekonnt?'sicher':''} ${x.pfad?'':'rechnen'}"
            data-art="${x.frage ? 'rechnen' : 'karte'}"
            data-lesen="${offen?'Das kennst du noch nicht.'
              :(x.zeichenFolge ? (/[A-ZÄÖÜ]/.test(x.zeichen)
                    ? `${x.zeichen} wie ${x.wort}` : `Die ${x.wort}`)
                : x.frage ? `${x.frage} = ${x.name}` : x.name)}"
            title="Fach ${x.fach||'—'}">
      ${stueckBild(x, offen && x.pfad ? 'var(--linie)' : `var(${FL[x.i%7]})`,
                   eigenerRahmen(x.pfad) || g.vb, offen)}
      <span>${offen ? '?' : stueckFuss(x)}</span>
      ${x.gekonnt?'<i class="siegel"></i>':''}
    </button>`;

  /* --- Die Albumseite IST die Karte (Q28) ---------------------------
   *
   * Der Wunsch war „ich will immer ALLE sehen". Genau das stand hier
   * schon einmal - sechzig graue Kaesten mit Fragezeichen, ueber alle
   * Ebenen auf einmal - und es ist gescheitert: es sah nach Arbeit aus.
   * Die Lehre steht oben und gilt weiter.
   *
   * Der Fehler war aber nicht „alle zeigen". Es waren die KAESTEN. Ein
   * leerer Kasten mit einem Fragezeichen ist eine Pruefungsfrage; eine
   * blasse Flaeche auf einer Karte ist ein Stueck Welt, das noch keine
   * Farbe hat. Dieselbe Menge, das Gegenteil an Wirkung.
   *
   * Also die Karte selbst: was gesammelt ist, klebt in Farbe und mit
   * Stanzrand darauf, der Rest liegt blass darunter. Fiona sieht auf
   * einen Blick alles - und keine einzige Luecke sieht aus wie eine
   * Aufgabe. Es kostet ausserdem kein neues Bild: die Umrisse sind da,
   * und der Rahmen ist der der ganzen Karte, den `vbVon` ohnehin liefert.
   *
   * Und es kostet WENIGER Hoehe als vorher, nicht mehr - eine Karte statt
   * eines Kachelgitters. Das Buch ist auf 844 x 390 randvoll (siehe die
   * Messung weiter unten: 318 Punkte Inhalt bei 318 sichtbaren), und ein
   * Vorschlag, der eine Zeile kostet, waere hier keiner.
   *
   * Wer keine Karte hat - Rechnen, Schreiben -, behaelt die Kacheln. Ein
   * Kaestchen mit „3 + 4" IST dort der Aufkleber; eine Karte gibt es
   * nicht, und eine erfundene waere schlimmer als keine.
   *
   * Angetippt wird die ganze Karte, nicht das einzelne Land: `beruehrung`
   * misst Trefferflaechen an Bedienelementen, und ein Pfad in einem SVG
   * ist keines. Bremen waere ausserdem sechs Punkte gross. Die Karte
   * sagt, was darauf klebt.
   */
  const hatKarte = (g) => g.vb && [...g.da, ...g.offen].some(x => x.pfad);
  const albumKarte = (g) => {
    const alle = [...g.da, ...g.offen].sort((a, b) => a.i - b.i);
    const namen = g.da.map(x => x.name).filter(Boolean);
    /* Die UMGEBUNG als Grund - sonst schwebt Europa im Nichts.
     *
     * Auf der Laenderebene sind nur zwoelf Laender modelliert. Ohne den
     * Grund liegen zwoelf Flecken in einem leeren Rahmen, und niemand
     * erkennt darin Europa - gesehen auf der ersten Aufnahme dieser
     * Karte. Die Umrisse drumherum liegen schon in den Daten; das
     * Spielfeld zeichnet sie seit R1. Hier sind sie blasser als dort:
     * im Spiel sind sie Kulisse, im Buch duerfen sie den Aufklebern
     * nicht die Schau stehlen. */
    const [, kont] = String(g.id).split(':');
    const grund = (kont && D.umgebung[kont])
      ? D.umgebung[kont].map(d => `<path d="${d}" class="albumgrund"/>`).join('') : '';
    return `
    <button class="albumkarte" data-lesen="${g.titel}. ${namen.length
        ? `Du hast ${namen.slice(0, 8).join(', ')}${namen.length > 8 ? ' und mehr' : ''}.`
        : 'Hier ist noch nichts.'}">
      <svg viewBox="${g.vb}" role="img" aria-label="${g.titel}"
           style="aspect-ratio:${(() => { const z = String(g.vb).trim().split(/\s+/).map(Number);
             return (z[2] > 0 && z[3] > 0) ? `${z[2]} / ${z[3]}` : '3 / 2'; })()}">${
        /* Das Seitenverhaeltnis muss AN DAS BILD, nicht ins Stylesheet.
         *
         * Ein `<svg>` mit `viewBox` und `width:auto` nimmt nicht die
         * Breite, die zur Hoehe passt - es nimmt die volle Breite seines
         * Kastens. Steht der Kasten auf `fit-content`, beissen sich beide,
         * und heraus kommt eine Briefmarke: gemessen 279 statt 580 Punkte
         * Breite bei 290 Punkten Hoehe. Mit `aspect-ratio` aus derselben
         * `viewBox` rechnet der Browser die Breite aus, und die Karte
         * fuellt ihren Platz. Je Karte eine andere Zahl, also gehoert sie
         * hierher und nicht in eine Regel. */''}
        ${grund}
        ${alle.filter(x => !x.gesammelt && x.pfad).map(x =>
          `<path d="${x.pfad}" fill-rule="evenodd" class="albumoffen"/>`).join('')}
        ${alle.filter(x => x.gesammelt && x.pfad).map(x => `
          <g class="albumkleber">
          <path d="${x.pfad}" fill-rule="evenodd" class="kleberschatten"/>
          <path d="${x.pfad}" fill-rule="evenodd" class="kleberrand"/>
          <path d="${x.pfad}" fill-rule="evenodd" fill="var(${FL[x.i % 7]})"
                stroke="var(--tinte)" stroke-opacity=".6" stroke-width="1.6"
                vector-effect="non-scaling-stroke"/>
          <path d="${x.pfad}" fill-rule="evenodd" class="kleberglanz"/>
          </g>`).join('')}
      </svg>
    </button>`;
  };

  /* --- Die Rechentafel (B4b) ----------------------------------------
   *
   * Das Gegenstueck zur Albumkarte, fuer die Ebenen, die keine haben.
   *
   * GEMESSEN, nicht vermutet: von den sieben Kapitelseiten nutzten zwei
   * unter 30 % ihrer Hoehe - die Abzeichen 25 % und „Plus und Minus"
   * 29 %. Die Kartenseiten liegen bei 95 %, und der Unterschied ist
   * nicht Schmuck: die Albumkarte zeigt die GANZE Menge auf einmal, das
   * Gesammelte in Farbe und das Offene blass darunter. Die Rechenseite
   * zeigte nur das Gesammelte - eine Reihe Aufkleber am oberen Rand,
   * darunter nichts, und nirgends eine Vorstellung davon, wie gross die
   * Sache ist.
   *
   * Der naheliegende Griff waere gewesen, die offenen Aufkleber blass
   * danebenzustellen, so wie es die Karte tut. Er ist gemessen falsch:
   * `Rechnen.vorrat()` liefert fuer „Plus und Minus" 45 Additionen und
   * 55 Subtraktionen. Hundert blasse Kaesten sind buchstaeblich die
   * „sechzig leeren Kaesten", die dieser Bildschirm schon einmal teuer
   * bezahlt hat.
   *
   * Der Unterschied zwischen der Karte und den sechzig Kaesten ist
   * nicht die Zahl der Stuecke, sondern dass die Karte eine FORM hat:
   * man liest sie als Bild und nicht als Liste. Genau das kann eine
   * Rechentafel auch - `a` nach unten, `b` nach rechts, ein Feld je
   * Aufgabe. Sie ist ein Bild, kein Verzeichnis: hundert Felder darin
   * ergeben ein Muster, das ein Kind auf einen Blick liest („die linke
   * obere Ecke ist voll"), und ein Elternteil auch.
   *
   * Ein KNOPF je Rechenart, nicht je Feld. Ein Feld waere auf dem
   * Telefon 14 Punkte breit, und `beruehrung` misst Trefferflaechen an
   * Bedienelementen - dieselbe Ueberlegung wie bei der Albumkarte, die
   * ebenfalls EIN Knopf ist und nicht sechzehn.
   *
   * Die Regel steht ueber den DATEN und nicht ueber einer Liste von
   * Ebenenkennungen: was `a`, `b` und eine Rechenart hat, bekommt eine
   * Tafel. Damit gilt sie auch fuer die Reihen und fuer „Grosse Zahlen",
   * und fuer die naechste Rechenebene, die noch niemand geschrieben hat.
   * Wo auch nur ein Stueck nicht dazu passt, gibt es keine Tafel -
   * lieber die Aufkleberwand als eine Tafel mit Loechern, die keine
   * sind. */
  const RECHENZEICHEN = { plus:'+', minus:'−', mal:'×', durch:':', quadrat:'²' };
  const RECHENWORT = { plus:'Plus', minus:'Minus', mal:'Mal', durch:'Geteilt', quadrat:'Quadrat' };
  const rechenTafel = (g) => {
    const alle = [...g.da, ...g.offen];
    if (!alle.length || !alle.every(x => RECHENZEICHEN[x.rechenart]
        && Number.isInteger(x.a) && Number.isInteger(x.b) && x.a > 0 && x.b > 0)) return '';
    const arten = [];
    for (const x of alle) if (!arten.includes(x.rechenart)) arten.push(x.rechenart);
    /* Ein Feld ist 10 Einheiten breit, das Kaestchen darin 8 - der Rest
       ist die Fuge. Absolute Einheiten sind hier keine Sorge: die
       `viewBox` skaliert, und das Kaestchen bekommt seine Punktgroesse
       erst aus der Spaltenbreite. */
    return `<div class="rechentafel">${arten.map(art => {
      const teil = alle.filter(x => x.rechenart === art);
      const breit = Math.max(...teil.map(x => x.b));
      const hoch  = Math.max(...teil.map(x => x.a));
      const da = teil.filter(x => x.gesammelt).length;
      const satz = `${RECHENWORT[art]}: ${da} von ${teil.length}`;
      return `
      <button class="tafelfeld" data-art="${art}" data-lesen="${satz} gesammelt."
              data-da="${da}" data-gesamt="${teil.length}"
              style="--ton:var(${FL[(g.farbe - 1 + 7) % 7]})">
        <svg viewBox="0 0 ${breit * 10} ${hoch * 10}" role="img" aria-label="${satz}"
             style="aspect-ratio:${breit} / ${hoch}">${teil.map(x => `
          <rect x="${(x.b - 1) * 10 + 1}" y="${(x.a - 1) * 10 + 1}" width="8" height="8" rx="2"
                class="tafel${x.gesammelt ? (x.gekonnt ? 'sicher' : 'da') : 'zu'}"/>`).join('')}
        </svg>
        <span class="tafelfuss"><b>${RECHENZEICHEN[art]}</b> ${da} von ${teil.length}</span>
      </button>`;
    }).join('')}</div>`;
  };

  /* --- Die Abzeichen (D2) ------------------------------------------
   *
   * Sie stehen OBEN, vor den Aufklebern: das Abzeichen ist die Aussage,
   * der Aufkleber der Beleg. Wer das Buch aufschlaegt, soll zuerst
   * lesen, was er kann, und danach, woraus es besteht.
   *
   * Gezeigt werden ALLE - die verdienten zuerst, danach die offenen,
   * sortiert nach dem, was noch fehlt. Warum nicht mehr nur eines oder
   * drei, steht ausfuehrlich unten bei `naechste`: es ist die Forderung
   * des Referenzabgleichs („sichtbar, BEVOR man es hat") und keine
   * Platzrechnung.
   *
   * Bei Gleichstand entscheidet die Reihenfolge der Tafel, damit sie
   * sich nicht von Aufruf zu Aufruf aendert - `ansicht` vergleicht
   * Bildpunkte.
   */
  const marken = [];
  for (const { e, st } of staende)
    for (const a of Abzeichen.abzeichenDer(e.id, vorrat(e.id, st, true),
                                           { name: P.name, erreichbar: erreichbar(e.id) }))
      marken.push({ ...Abzeichen.stand(a, id => Leitner.istGesammelt(st, id)), ebeneTitel: e.titel });
  const ohneFehler = await glattStand();
  /* „bei Kontinente" waere falsches Deutsch, und die Ebenentitel stehen
     ohne Artikel da („Kontinente", „Bundesländer", „Plus und Minus"). Ein
     Doppelpunkt braucht keinen Fall. */
  /* Das EINE Abzeichen, das nicht aus der Tafel kommt - es haengt an
     einer Runde und nicht an einem Vorrat. Es braucht seinen kurzen
     Namen deshalb hier; ohne ihn stand auf der Zelle „undefined", und
     der Rauchtest hat es sofort gemeldet. */
  if (ohneFehler) marken.unshift({ id:'ohne-fehler', zeichen:'medaille', verdient:true, fehlt:0,
    kurz:'Ohne Fehler',
    titel:`Einmal ganz ohne Fehler: ${ohneFehler.ebeneTitel}.` });
  const verdient = marken.filter(a => a.verdient);
  /* Das offene Abzeichen steht nur da, wenn es schon eines GIBT.
   *
   * Gemessen, nicht entschieden: auf dem Telefon quer mit Browserleiste
   * sind 340 Punkte Hoehe da, und das Forscherbuch war schon vorher
   * randvoll - `passt` hat gemeldet, dass die untere Aufkleberreihe
   * herausfaellt. Der erste Versuch war, dafuer die Vorschau
   * auszublenden; das hat bei einem frischen Konto den ganzen Bildschirm
   * geleert, denn dort IST die Vorschau der Inhalt.
   *
   * Also andersherum: wer noch kein Abzeichen hat, bekommt seinen
   * naechsten Schritt weiter von der Vorschau („Als Nächstes: Europa")
   * - dieselbe Auskunft, nur mit Bildern. Wer schon eines hat, hat den
   * Block ohnehin, und eine Zeile mehr kostet eine Zeile.
   */
  /* ALLE offenen, nicht drei (B4b). Und die Begruendung kommt aus dem
   * Referenzabgleich, nicht aus dem freien Platz.
   *
   * Vorgeschichte: erst EINES (als das ganze Buch eine rollende Seite war
   * und jede Zeile mit den Aufkleberreihen um denselben Platz stritt),
   * seit Q44 drei (das eigene Kapitel nutzte gemessen 18 % seiner Hoehe).
   * Beide Zahlen waren Platzrechnungen, und beide Male stand daneben die
   * Sorge vor „sechzig leeren Kaesten".
   *
   * Das SOLL in `src/inhalt/abzeichen.js` sagt seit dem ersten Tag etwas
   * anderes, und es steht dort als abgeleitete Forderung, nicht als
   * Meinung: „Es ist sichtbar, BEVOR man es hat, mit dem, was noch
   * fehlt." Der Duolingo-Abgleich begruendet sie: „Ein Abzeichen, das erst
   * beim Erreichen erscheint, ist bis dahin unsichtbar." Mit `slice(0, 3)`
   * war genau das der Fall - auf der gemessenen Seite standen 6 von 9,
   * waehrend der Reiter darueber „3/9" versprach. Der Nenner war da, die
   * Sache dahinter nicht.
   *
   * Die Lehre von den sechzig Kaesten bleibt unverletzt, weil sie an der
   * ZAHL haengt und nicht am leeren Kasten - dieselbe Unterscheidung wie
   * im Tierkapitel. Hundert waeren es nicht - genau deshalb bekommt die
   * Rechenseite eine Tafel und keine hundert blassen Aufkleber.
   *
   * HIER STAND EINE ZAHL, DIE AUFGEHOERT HAT ZU STIMMEN: „die Tafel hat
   * elf Eintraege, einer davon fuenfmal gestuft: hoechstens sechzehn
   * Abzeichen kann ein Profil ueberhaupt haben". Mit E9b sind es fuenfzehn
   * Eintraege, einer fuenffach und einer vierfach gestuft - bis zu
   * dreiundzwanzig, und Fiona hatte danach dreizehn statt neun.
   *
   * Die Seite zeigt sie trotzdem ALLE, und zwar aus dem Grund, den B4b
   * aufgeschrieben hat: der Reiter darueber traegt den Nenner, und eine
   * Seite, die weniger zeigt als er verspricht, ist dieselbe Luege in die
   * andere Richtung. Was mehr wird, rollt in seinem Kasten - genauso wie
   * die fuenfzehn Raeume im Tierkapitel. Eine gezaehlte Zahl in einem
   * Kommentar veraltet genau dann, wenn niemand mehr nachzaehlt; diese
   * hier ist jetzt keine Grenze mehr, sondern eine Geschichte. */
  const naechste = verdient.length
    ? marken.filter(a => !a.verdient).sort((a,b)=>a.fehlt-b.fehlt) : [];
  /* Ein Knopf, kein Kasten: Fiona liest nicht, sie tippt an und hoert.
     Ein `div` mit `data-lesen` waere fuer sie stumm - der Rundgang bindet
     zwar den Klick, aber `beruehrung` misst Trefferflaechen nur an
     Bedienelementen, und mit dem Finger trifft man nur, was gross genug
     ist. */
  /* DAS ZEICHEN IST DAS BILD, der Satz die Bildunterschrift (Audit II, K1).
   *
   * Gemessen: die Abzeichenseite war zu 92 % Text - 312 Zeichen bei 8 %
   * Bildanteil, und das Zeichen daneben 22 Punkte gross. Ausgerechnet
   * der Ort, an dem das Buch sagt „das KANNST du", war fuer ein
   * sechsjaehriges Kind, das nicht liest, eine Wand aus Buchstaben.
   *
   * Jetzt eine Zelle wie jede andere: Zeichen gross oben, darunter EIN
   * Titel. Der ganze Satz („Dir fehlen noch 5") steht nicht mehr im
   * Bild, sondern in der ANSAGE - dort erreicht er Fiona wirklich, und
   * Lea liest den Titel. */
  const markeBild = (a) => `
    <button class="abz zelle ${a.verdient?'da':'offen'}" data-abz="${a.id}"
            data-lesen="${a.verdient ? a.titel
              : `Fast. ${a.titel} Dir ${a.fehlt===1?'fehlt noch eins':`fehlen noch ${a.fehlt}`}.`}">
      ${ABZ(a.zeichen, a.verdient)}
      <span class="was">${a.kurz}</span>
      ${a.verdient ? '' : `<span class="fehlt">${a.fehlt}</span>`}
    </button>`;

  /* --- Das Buch bekommt Kapitel (Q44) --------------------------------
   *
   * Gemessen auf dem Zielgeraet (844 x 390 quer, 318 Punkte sichtbar):
   * bei sechs Gruppen stehen 842 Punkte Inhalt in 318, und sechs von
   * zwoelf Bloecken fangen erst UNTER der Unterkante an - vier ganze
   * Gruppen und die Vorschau. Zwei Gruppen passen, die dritte kippt es.
   *
   * Fionas Wunsch war ausdruecklich, dass sie IMMER ALLE sieht. Ein Buch,
   * das man dreimal rollen muss, erfuellt ihn nicht; und ein Kind, das
   * nicht liest, rollt nicht auf Verdacht - es sieht zwei Karten und
   * glaubt, das sei alles.
   *
   * Also Reiter, wie ein Sammelalbum Kapitel hat. Der Streifen zeigt
   * jede Gruppe AUF EINMAL - Farbe, Zahl, Name -, und darunter steht
   * genau eine ganz da. Was sie hat, sieht sie also immer vollstaendig;
   * was darin steckt, ohne zu rollen. Und die eine Albumkarte bekommt
   * dabei mehr Hoehe als vorher zwei nebeneinander.
   *
   * Die Grenze ist gemessen und keine runde Zahl. Bis zu zwei Kapiteln
   * ist der Streifen unnoetig - und ein Reiter, den man nicht braucht,
   * ist eine Tuer mehr vor demselben Inhalt.
   */
  /* Die Gebiete einer Gruppe, die dem Kind gehoeren UND einen Satz haben.
     In der Reihenfolge des Vorrats, nicht gewuerfelt: das Buch soll beim
     zweiten Aufschlagen dasselbe zeigen, und `ansicht` vergleicht
     Bildpunkte. */
  const satzGebiete = (g) => g.da.filter(x => Saetze.satzZu(x.id));

  const kapitel = [];
  /* --- Meine Tiere (T1) ----------------------------------------------
   *
   * Ein eigenes Kapitel, VOR den Abzeichen: es ist das, was Fiona sucht,
   * wenn sie das Buch aufschlaegt. Gezeigt werden alle GEMALTEN - die
   * gesammelten in Farbe, die fehlenden blass.
   *
   * Die leeren Kaesten sind hier kein Rueckfall in „sechzig leere
   * Kaesten" (die Lehre, die dieser Bildschirm einmal teuer bezahlt hat).
   * Der Unterschied ist die ZAHL und der Zweck: ein Sammelalbum LEBT vom
   * leeren Platz, solange man ihn zu Ende fuellen kann. Zwoelf sind zu
   * Ende zu bringen, die 124 des Plans waeren es nicht - deshalb steht
   * hier nur, was es wirklich gibt.
   *
   * Der Gorilla steht NICHT in der Wand, sondern als Zeile darunter. Er
   * ist kein Sammelstueck: eine Reihe von Gorillas waere eine Liste der
   * Runden, die nicht geklappt haben - und die gehoert nicht in das Buch
   * eines sechsjaehrigen Kindes. Wie oft er da war, steht als Satz da,
   * und zwar in seinem Ton. */
  {
    const habe = new Set(TierStand.ids || []);
    const alle = Tiere.sammelbar();
    const dabei = alle.filter(t => habe.has(t.id));
    /* NACH LEBENSRAUM gruppiert, und nur die Raeume, deren Bilder es
       schon gibt. Ein Raum ist die Einheit, in der gesammelt wird - drei
       Tiere nebeneinander, alle drei oder keines. Eine Wand aus sechzehn
       Einzelstuecken haette dieselben Tiere und keinen Zusammenhang; so
       sieht man, WOFUER es sie gab.

       Die Ebenen, deren Bilder noch fehlen, stehen hier NICHT. Ein Raum
       mit drei Fragezeichen, den man nicht oeffnen kann, waere kein
       Versprechen, sondern eine Mahnung - dieselbe Lehre wie bei den
       sechzig leeren Kaesten. */
    /* Kein Entdoppeln nach Titel mehr: seit I15 haelt ein Raum seine
       Ebenen als LISTE, und damit steht jeder Titel genau einmal in
       `RAEUME` - `inhalt` setzt es durch. Der Filter davor war die
       Stelle, die beim Zusammenlegen des Bauernhofs (drei Eintraege) und
       des Riffs (vier) noetig war. */
    const fertig = Tiere.RAEUME
      .map(r => ({ ...r, stuecke: r.tiere.map(Tiere.tierMit).filter(t => t && t.bild) }))
      .filter(r => r.stuecke.length === r.tiere.length);
    /* DIE OFFENEN UND EINER MEHR - gemessen und nicht entschieden.
       Fuenf Raeume zu drei Tieren sind 430 Punkte hoch; auf dem
       Zielgeraet sind 318 sichtbar, und ein Kind, das nicht liest, rollt
       nicht auf Verdacht. Dieselbe Regel wie bei den Abzeichen: alles
       Verdiente, und EINES, das noch fehlt. Eines ist der naechste
       Schritt, fuenf sind eine Liste dessen, was man nicht hat. */
    const offen = fertig.filter(r => r.stuecke.some(t => habe.has(t.id)));
    const naechsterRaum = fertig.find(r => !r.stuecke.some(t => habe.has(t.id)));
    const raeume = naechsterRaum ? [...offen, naechsterRaum] : offen;
    /* DAS KAPITEL GIBT ES ERST, WENN ETWAS DRIN IST.
     *
     * Gemessen, nicht entschieden: bis zu zwei Kapiteln gibt es keine
     * Reiter, dann stehen sie UNTEREINANDER (`OHNE_REITER`). Ein leeres
     * Tierkapitel obendrauf schob die Albumkarte auf dem Zielgeraet 72
     * Punkte unter die Kante - gefunden von `passt`, auf allen vier
     * Groessen.
     *
     * Und es ist auch inhaltlich richtig: drei graue Fragezeichen aus
     * einem Raum, den das Kind noch gar nicht kennt, sind kein
     * Versprechen, sondern eine Mahnung. Dieselbe Lehre wie bei den
     * sechzig leeren Kaesten, die dieser Bildschirm schon einmal teuer
     * bezahlt hat. Wer das erste Tier hat, bekommt das Kapitel - und
     * darin dann auch den naechsten Raum zu sehen. */
    /* EIN RAUM AUF EINMAL, und die anderen als Reiter darueber (T2).
     *
     * Bis hierher standen alle offenen Raeume UNTEREINANDER. Das war
     * richtig, solange es zwei waren, und es bricht bei dreien: gemessen
     * auf dem Zielgeraet steht ein Raum mit Tuer und drei Aufklebern 160
     * Punkte hoch, sichtbar sind 318. Mit fuenf Raeumen lagen die
     * unteren 689 Punkte unter dem Rand - `passt` hat es gemeldet, sowie
     * es das Kapitel zum ersten Mal mit einem vollen Stand gesehen hat.
     * Kein neuer Fehler: er war seit T1 da und hatte nur nie einen
     * Zeugen. Ein Bildschirm, dessen Hoehe mit dem Fortschritt waechst,
     * hat irgendwann jedes Kind ausgesperrt.
     *
     * `overflow:auto` waere keine Loesung - dieselbe Zeile steht im Tor:
     * ein Kind rollt nicht in einer Liste, von der es nicht weiss, dass
     * sie weitergeht.
     *
     * Also dasselbe Mittel wie beim Buch selbst, eine Ebene tiefer -
     * aber NICHT als zweite Reiterzeile (Runde 3, Befund B2).
     *
     * Eine Reiterzeile ueber einer Reiterzeile war die auffaelligste
     * Unruhe im Buch: dieselbe Geste, zwei Bedeutungen, uebereinander.
     * Und sie war zu klein - die fuenfzehn Raumreiter waren 32 Punkte
     * breit, wo 44 die Grenze sind (Befund K2). Beides faellt hier weg.
     *
     * Jetzt hat die Seite denselben Bau wie die vier anderen: LINKS,
     * was sie sagt, RECHTS ein Raster aus Zellen. Das Raster zeigt
     * zuerst die fuenfzehn RAEUME; ein Tipp tauscht es gegen die drei
     * Tiere dieses Raumes und die Tuer. Zwei Zustaende derselben Seite,
     * kein zweiter Reiter.
     *
     * Der Preis ist ein Tipp mehr bis zu einem Tier - dafuer stehen die
     * Raumnamen zum ersten Mal DA statt nur gesprochen zu werden, und
     * jede Zelle ist mit dem Daumen zu treffen.
     *
     * Der Bauplan aus dem Audit („alle fuenfzehn Raeume untereinander,
     * Rollen ist hier richtig") ist NICHT gebaut, und zwar gemessen:
     * fuenfzehn Baender brauchen rund 1950 Punkte in einem Raster, das
     * auf dem Zielgeraet 244 hoch ist. `passt` geht von jedem Knopf zum
     * ersten rollenden Vorfahren hinauf - das waeren vierzig rote
     * Knoepfe gewesen. Dieselbe Zeile steht seit T2 hier: ein Kind
     * rollt nicht in einer Liste, von der es nicht weiss, dass sie
     * weitergeht. */
    const raumVoll = (r) => r.stuecke.every(t => habe.has(t.id));
    if (dabei.length) kapitel.push({ id:'tiere', titel:'Meine Tiere', farbe:6,
      zahl:dabei.length, gesamt:alle.length,
      lesen:`Deine Tiere. Du hast ${dabei.length === 1 ? 'eins'
        : dabei.length ? dabei.length : 'noch keins'} von ${alle.length}.`,
      /* OHNE Zahl in der Ueberschrift: der Reiter darueber traegt sie
         seit Runde 2 als `45/45`. Zweimal dieselbe Auskunft auf einem
         Bildschirm ist keine Betonung, sondern Rauschen (Regel 6).
         Bei den Ebenenkapiteln bleibt der Zusatz stehen - dort sagt er
         etwas ANDERES als der Reiter, naemlich wieviele davon sicher
         sind. */
      inhalt: buchSeite({ id:'tiere', titel:'Meine Tiere',
        fuss: TierStand.gorilla ? `<p class="buchsatz" data-lesen="${
            `Der Gorilla war schon ${TierStand.gorilla === 1 ? 'einmal' : TierStand.gorilla + '-mal'} da und hat mit dir geübt.`
          }">Der Gorilla war schon ${TierStand.gorilla === 1 ? 'einmal'
            : `${TierStand.gorilla}-mal`} da und hat mit dir geübt.</p>` : '',
        zeigt:`
        ${/* AUF DEM REITER STEHT EIN TIER, nicht die Landschaft.
              Der erste Anlauf trug den Kulissenstreifen. Bei 28 x 17
              Punkten sind „Wald und Wiese", „Der Dschungel", „Der
              Regenwald" und „Wald und Fluss" vier gruene Flecken - und
              das sind vier von zehn. Ein Tier ist bei 28 Punkten noch
              zu erkennen (dafuer ist es gezeichnet, das misst
              `probebild` am Aufkleber) und es ist ausserdem das, was
              das Kind gesammelt hat: der Raum mit dem Wal.
              Gezeigt wird das erste Tier, das dem Kind GEHOERT - beim
              naechsten Raum, in dem es noch keines hat, das erste blass.
              Ein farbiges Tier auf einem Reiter, hinter dem keines
              steht, waere ein Versprechen, das die Seite nicht haelt.
              Die Landschaft traegt weiter die TUER darunter - dorthin
              fuehrt sie, und dort ist sie gross genug. */''}
        ${/* DAS RASTER, ERSTER ZUSTAND: die fuenfzehn Raeume.
             Eine Zelle traegt ein Tier aus dem Raum und den Namen -
             den VOLLEN Namen, denselben, den die Tuer traegt und den
             die Ansage spricht. Ohne Artikel waeren drei von fuenfzehn
             eine Zeile kuerzer, aber „Dschungel" auf der Zelle und
             „Der Dschungel" an der Tuer waeren zwei Namen fuer einen
             Raum - was zweimal dasteht, veraltet einmal (Regel 6). Das Raster gleicht die Zeilenhoehe ohnehin
             aus.
             Das Tier ist blass, solange keines gesammelt ist; die Zahl
             „0 von drei" steht in der Ansage, nicht im Bild. */''}
        <div class="raumgitter">${raeume.map((r) => {
          const meins = r.stuecke.filter(t => habe.has(t.id));
          const zeichen = meins[0] || r.stuecke[0];
          return `
          <button class="raumzelle${meins.length ? '' : ' leer'}"
                  data-raumwahl="${r.titel}"
                  data-lesen="${r.titel}. ${meins.length} von drei."
            >${zeichen ? tierBild(zeichen, 'raumzeichen') : ''
            }<span>${ohneArtikel(r.titel)}</span></button>`;
        }).join('')}</div>
        ${raeume.map((r) => `<div class="tierraum" data-raumseite="${r.titel}" hidden>
          ${/* EIN VOLLER RAUM WIRD ZUR TUER (T2).
                Solange etwas fehlt, ist die Zeile eine Ueberschrift; ist
                der Raum voll, ist sie der Knopf in die Landschaft - und
                traegt die Kulisse als Streifen, damit auch ein Kind, das
                nicht liest, sieht, wohin es geht. Kein zweiter Knopf
                daneben: eine Zeile, die manchmal etwas kann, ist
                weniger zu lernen als zwei Zeilen, von denen eine
                meistens fehlt. */''}
          ${/* Der Weg zurueck ins Raster steht VOR der Zeile, nicht
                daneben: er gehoert zur Seite, nicht zum Raum. Er traegt
                denselben Pfeil wie „Zurueck" in der Kopfzeile - eine
                Geste, eine Bedeutung. */''}
          <div class="raumkopf">
            <button class="raumzu" data-raumzu
                    data-lesen="Zurück zu allen Räumen"
                    aria-label="Alle Räume">${ZURUECK}</button>
          ${raumVoll(r) && Tiere.kulisseZu(r.titel)
            ? `<button class="raumauf" data-raum="${r.titel}"
                 data-lesen="${r.titel} anschauen"
                 aria-label="${r.titel} anschauen"><svg class="raumstreifen"
                 viewBox="${Tiere.SZENE}" role="presentation"
                 >${Tiere.kulisseZu(r.titel).bild}</svg><span>${r.titel}</span>
                 ${ZEI('auge', 20)}</button>`
            : `<h4>${r.titel}</h4>`}
          </div>
          <div class="tierwand">${r.stuecke.map(t => `
            <button class="tierfeld${habe.has(t.id) ? ' da' : ''}"
                    style="--ton:${t.ton}"
                    data-lesen="${habe.has(t.id) ? t.name
                      : `${t.name} fehlt dir noch. Mach ${r.titel} fertig.`}"
                    >${tierBild(t)}<span>${habe.has(t.id) ? ohneArtikel(t.name) : '?'}</span></button>`).join('')}</div>
        </div>`).join('')}` }) });
  }
  if (verdient.length) kapitel.push({
    id:'abzeichen', titel:'Abzeichen', farbe:2,
    zahl:verdient.length, gesamt:marken.length,
    lesen:`Deine Abzeichen. Du hast ${verdient.length===1?'eins':verdient.length}.`,
    inhalt: buchSeite({ id:'abzeichen', titel:'Deine Abzeichen',
      /* KEIN Zusatz. Der Reiter darueber traegt „3/9" - „3 verdient"
         sagt dasselbe noch einmal, und ob eine Zelle verdient oder
         offen ist, steht im Raster selbst (gruen gegen bernstein).
         Dieselbe Entscheidung wie beim Tierkapitel in Runde 2; sie
         faellt hier erst auf, seit die Seite ein Vorbild hat. */
      zeigt:`<div class="abzeichen">${verdient.map(markeBild).join('')}${
        naechste.map(markeBild).join('')}</div>`,
      /* DER FUSSSATZ IST DER SATZ SELBST (B4b).
       *
       * Was auf dieser Seite fehlt, ist kein Platz, sondern eine
       * Auskunft: neun bernsteinfarbene Zellen tragen je eine Zahl, und
       * keine sagt, WELCHE davon als naechste faellt. Die Reihenfolge
       * steht zwar im Raster (sortiert nach `fehlt`), aber eine
       * Sortierung ist nichts, was ein Kind sieht.
       *
       * Und es ist zugleich die Stelle, an der der Khan-Abgleich zum
       * ersten Mal wirklich eingeloest wird: „der Text ist die
       * Belohnung, nicht das Bild". Der ganze Titelsatz („Du kennst alle
       * Doppelten.") stand bisher NUR in der Ansage - Fiona hoert ihn,
       * Lea liest ihn nirgends. */
      fuss: (() => {
        /* „Noch 5, dann heisst es: ..." und nicht „Fast geschafft:
           ...". Der erste Anlauf setzte den Titelsatz direkt hinter
           die Anrede, und dann stand da „Fast geschafft: Du kannst
           alle Verdopplungen" - also die Belohnung im Praesens,
           obwohl sie noch nicht gilt. Gesehen auf dem Vorbild. */
        if (!naechste.length) return `<p class="buchsatz"
          data-lesen="Du hast alle Abzeichen.">Du hast alle Abzeichen.</p>`;
        const a = naechste[0];
        const satz = `Noch ${a.fehlt===1?'eins':a.fehlt}, dann heißt es: ${a.titel}`;
        return `<p class="buchsatz" data-lesen="${satz}">${satz}</p>`;
      })() }) });
  /* --- DAS BUCH BEKOMMT WELTEN (B12) --------------------------------
   *
   * Bis v428 war jede Ebene ein Kapitel. Das trug, solange es fuenf
   * waren, und es bricht mit dem Fortschritt: gemessen an einem Profil
   * mit Fortschritt auf ALLEN Ebenen stehen SIEBZEHN Reiter im Streifen,
   * davon zwoelf sichtbar - auf dem Zielgeraet, nicht in einem
   * Randfall. Fuenf Kapitel waren ohne Rollen nicht zu erreichen, und
   * der Streifen nahm 109 von 390 Punkten.
   *
   * Das ist derselbe Fehler, den Q44 einmal behoben hat, eine Ebene
   * hoeher: ein Bildschirm, dessen Bedienleiste mit dem Fortschritt
   * waechst, sperrt irgendwann jedes Kind aus. Und Rollen ist hier so
   * wenig eine Loesung wie dort - ein Kind, das nicht liest, rollt nicht
   * auf Verdacht.
   *
   * Also GROEBER GESCHNITTEN: ein Reiter je WELT. Das ist keine neue
   * Ordnung, sondern die, welche die App auf der Weltenwahl ohnehin hat,
   * und sie kommt aus derselben Regel (`weltVon`). Aus siebzehn Reitern
   * werden sieben, und sie waechst nicht mehr mit der zwanzigsten Ebene.
   *
   * WAS DARIN LIEGT, ist der Bau des Tierkapitels, noch einmal: links
   * was die Seite sagt, rechts ein Raster aus Zellen; ein Tipp tauscht
   * das Raster gegen die Ebene. KEINE zweite Reiterzeile - „eine
   * Reiterzeile ueber einer Reiterzeile war die auffaelligste Unruhe im
   * Buch" steht seit Runde 3 im Tierkapitel, und sie gilt hier genauso.
   *
   * Eine Welt mit EINER Ebene bekommt kein Raster: sie zeigt die Ebene
   * gleich. Ein Raster vor einer einzigen Zelle ist eine Tuer mehr vor
   * demselben Inhalt - dieselbe Ueberlegung wie bei `OHNE_REITER`. */
  const gruppenSeite = (g, { inWelt = false, seiteId = g.id } = {}) => buchSeite({
    id: seiteId, titel: g.titel, versteckt: inWelt,
    zurueck: inWelt ? `<button class="raumzu" data-weltzu
        data-lesen="Zurück zu allen Ebenen" aria-label="Zurück"
        >${ZURUECK}</button>` : '',
      /* Nur das, was der Reiter NICHT sagt. Er traegt „16/16"; die
         Zahl der Aufkleber noch einmal davorzusetzen waere dieselbe
         Auskunft zweimal - was zweimal dasteht, veraltet einmal
         (Regel 6). „Sicher" ist die zweite Stufe und steht nirgends
         sonst. */
      zusatz: g.da.filter(x=>x.gekonnt).length
        ? `${g.da.filter(x=>x.gekonnt).length} davon sicher`
        : '',
      /* Karte, Tafel, Wand - in dieser Reihenfolge, und die Tafel
         ERSETZT die Wand statt ueber ihr zu stehen. Das ist kein
         Geschmack: `passt` verlangt, dass jeder Aufkleber innerhalb
         seines rollenden Kastens liegt („ein Kind scrollt nicht in
         einer Liste, von der es nicht weiss, dass sie weitergeht"),
         und eine Tafel darueber schiebt die letzte Reihe der Wand
         hinaus. Beides zusammen ginge nur auf Kosten der Wand. */
      zeigt: hatKarte(g) ? albumKarte(g) : (rechenTafel(g)
        || `<div class="kleber gross">${g.da.map(x=>kleber(g,x,false)).join('')}</div>`),
      fuss:`${/* DIE BILDUNTERSCHRIFT DER TAFEL (B4b).
            Ein Raster aus hundert Kaestchen ist keine Sprache, die ein
            Kind schon kennt - die Landkarte ist eine, das hier nicht.
            Also steht daneben, was ein Kaestchen IST und was die drei
            Staerken heissen. Genau ein Satz, und nur dort, wo die Tafel
            wirklich steht: auf einer Kartenseite waere er falsch. */
        (!hatKarte(g) && rechenTafel(g))
          ? `<p class="buchsatz" data-lesen="Jedes Kästchen ist eine Aufgabe. Die kräftigen kannst du sicher, die blassen hast du schon geübt."
             >Jedes Kästchen ist eine Aufgabe. Die kräftigen kannst du sicher,
              die blassen hast du schon geübt.</p>` : ''}${
          /* Ein Satz zum Mitnehmen, hier zum NACHLESEN (Q46).
            Im Spiel steht er einen Augenblick und ist dann weg - genau
            dann, wenn das Kind noch mit dem Treffer beschaeftigt ist. Das
            Buch ist der Ort, an dem man nachschaut; also steht er hier
            noch einmal, und zwar zu einem Gebiet, das dem Kind GEHOERT.
            Ein Tipp auf die Karte nimmt den naechsten. Warum nicht ein
            Tipp auf das einzelne Gebiet: die Albumkarte ist EIN Knopf,
            und Bremen waere darauf vier Bildpunkte gross - eine
            Trefferflaeche, die kein Finger trifft (`beruehrung`). */
        satzGebiete(g).length ? `<p class="buchsatz" data-gruppe="${g.id}"
          data-lesen="${Saetze.satzZu(satzGebiete(g)[0].id)}"
          >${Saetze.satzZu(satzGebiete(g)[0].id)}</p>` : ''}` });

  const weltName = (id) => (WELTEN.find(w => w.id === id) || {}).name || id;
  for (const w of WELTEN) {
    const gs = vollen.filter(g => g.welt === w.id);
    if (!gs.length) continue;
    const zahl   = gs.reduce((a, g) => a + g.da.length, 0);
    const gesamt = gs.reduce((a, g) => a + g.da.length + g.offen.length, 0);
    const id = `welt:${w.id}`;
    /* EINE Ebene: keine Uebersicht, die Ebene steht gleich da. Der
       Reiter traegt trotzdem den Weltnamen - er ist der Ort, und die
       Ueberschrift darunter sagt, was drinliegt. */
    if (gs.length === 1) {
      kapitel.push({ id, titel: w.name, farbe: w.farbe, zahl, gesamt,
        lesen: `${gs[0].titel}. ${gs[0].da.length===1?'Ein Aufkleber'
          :`${gs[0].da.length} Aufkleber`}.`,
        inhalt: gruppenSeite(gs[0], { seiteId: id }) });
      continue;
    }
    /* WO ES IN DIESER WELT WEITERGEHT (B14).
     *
     * Die Uebersicht nutzte gemessen 28 % ihrer Hoehe, und der Grund
     * war nicht nur der Platz: sie sagte ausser dem Weltnamen NICHTS,
     * was nicht schon auf dem Reiter stand. Die eine Auskunft, die es
     * hier und nur hier gibt, ist die Richtung - das Kapitel „Als
     * Naechstes" waehlt EINE Ebene fuer das ganze Buch, und innerhalb
     * einer Welt ist danach nicht mehr zu sehen, wo man stehengeblieben
     * ist.
     *
     * Gewaehlt wird nach derselben Regel wie dort: die Ebene mit den
     * meisten Aufklebern, die noch nicht fertig ist. Zwei Regeln fuer
     * dieselbe Frage waeren zwei, die eines Tages auseinanderlaufen. */
    const weiter = gs.filter(g => g.offen.length)
      .sort((a, b) => b.da.length - a.da.length)[0];
    const sicher = gs.reduce((a, g) => a + g.da.filter(x => x.gekonnt).length, 0);
    kapitel.push({ id, titel: w.name, farbe: w.farbe, zahl, gesamt,
      lesen: `${w.name}. ${zahl} von ${gesamt} Aufklebern.`,
      inhalt: buchSeite({ id, titel: w.name,
        /* Dasselbe Wort wie auf den Ebenenseiten: „sicher" ist die
           zweite Stufe und steht nirgends sonst. Der Reiter traegt die
           erste (`20/20`). */
        zusatz: sicher ? `${sicher} davon sicher` : '',
        fuss: weiter
          ? `<p class="buchsatz" data-lesen="Als Nächstes hier: ${weiter.titel}. Noch ${
               weiter.offen.length}.">Als Nächstes hier: ${weiter.titel}. Noch ${
               weiter.offen.length}.</p>`
          : `<p class="buchsatz" data-lesen="Diese Welt hast du ganz."
             >Diese Welt hast du ganz.</p>`,
        /* Die Zelle traegt DEN UMRISS DER EBENE, nicht ein Zeichen
           daneben: `silhouette` zeichnet genau das, was die Kachel auf
           der Ebenenwahl zeigt - ein Kind, das nicht liest, erkennt
           Afrika wieder. Und die Zahl, die der Reiter nicht mehr traegt:
           er zaehlt jetzt die ganze Welt. */
        zeigt: `<div class="raumgitter">${gs.map(g => `
          <button class="raumzelle ebenenzelle${g.da.length ? '' : ' leer'}${
                    weiter && g.id === weiter.id ? ' dran' : ''}"
                  data-ebenenwahl="${g.id}"
                  style="--ton:var(${FL[(g.farbe - 1 + 7) % 7]})"
                  data-lesen="${g.titel}. ${g.da.length} von ${
                    g.da.length + g.offen.length}."
            >${silhouette(g.id)}<span>${g.titel}</span><small>${g.da.length}/${
              g.da.length + g.offen.length}</small></button>`).join('')}</div>`,
      }) + gs.map(g => gruppenSeite(g, { inWelt: true })).join('') });
  }
  /* Die Vorschau steht nur da, wo die Karte sie nicht schon zeigt.
     Auf der Albumkarte liegt jedes offene Gebiet blass darunter -
     dieselbe Auskunft, an derselben Stelle, ohne Fragezeichen. Der
     Knopf oben rechts (Q20) bleibt davon unberuehrt: er haengt an
     `vorschau`, und die wird weiter gerechnet. */
  if (vorschau.length && !(dran && vollen.includes(dran) && hatKarte(dran))) kapitel.push({
    /* Ohne Zahl, und das ist der Punkt (Buch-Audit II, B6).
       Hier stand `vorschau.length` - die Menge der OFFENEN Stuecke. Sie
       stand gleich gross und gleich gewichtet neben „45", „16" und „4",
       die alle das GESAMMELTE zaehlen: dieselbe Stelle, dieselbe Form,
       die Gegenrichtung. „Als Naechstes" ist auch keine Sammlung,
       sondern ein Hinweis - ein Reiter ohne Zahl sagt das von selbst. */
    id:'naechstes', titel:'Als Nächstes', farbe:dran.farbe,
    lesen:`Als Nächstes: ${dran.titel}.`,
    inhalt: buchSeite({ id:'naechstes', titel:`Als Nächstes: ${dran.titel}`,
      zusatz:`${
        /* WIE WEIT das Kind in dieser Gruppe ist (G15c).
         *
         * Die Vorschauseite nutzte gemessen 29 % ihrer Hoehe - der
         * schlechteste Wert der sieben Kapitelseiten. Der naheliegende
         * Griff waere gewesen, die drei Karten groesser zu machen; das
         * haette den Kasten gefuellt und nichts gesagt.
         *
         * Und es haette meine eigene Messung befriedigt, ohne die Sache
         * zu verbessern: „genutzt" misst, wo der Inhalt AUFHOERT, nicht
         * ob er etwas taugt. Eine Kennzahl, die sich durch einen
         * hoeheren leeren Kasten erfuellen laesst, misst den Kasten.
         *
         * Also mehr AUSKUNFT statt mehr Luft, und zwar die, welche die
         * Seite selbst aufwirft: sie sagt „als Naechstes" - dann gehoert
         * dazu, wie weit es noch ist. Dieselbe Zeile und derselbe Balken
         * wie auf den anderen Kapitelseiten; nichts Neues, nur nicht
         * mehr weggelassen. */
        (() => { const gesamt = dran.da.length + dran.offen.length;
          return gesamt ? `${dran.da.length} von ${gesamt} gesammelt` : ''; })()
        }`,
      balken:`${(() => { const gesamt = dran.da.length + dran.offen.length;
        return gesamt ? fortschrittBalken({ gesammelt: dran.da.length, gesamt,
          anteil: dran.da.filter(x => x.gekonnt).length / gesamt }) : ''; })()}`,
      zeigt:`${hatKarte(dran)
        /* Auch das Naechste ist eine KARTE, wenn es eine hat - ganz
           blass, weil noch nichts darauf klebt. Drei Kaesten mit
           Fragezeichen sagen „drei Aufgaben"; eine leere Karte sagt
           „hier ist noch Platz". Dasselbe Wissen, das Gegenteil an
           Ton. */
        ? albumKarte(dran)
        : `<div class="kleber gross vorschau">${vorschau.map(x=>kleber(dran,x,true)).join('')}</div>`}` }) });

  const OHNE_REITER = 2;   // gemessen, siehe oben
  const mitReitern = kapitel.length > OHNE_REITER;
  /* Welches Kapitel offen steht: das zuletzt gewaehlte, sonst die
     ABZEICHEN, sonst das, an dem gerade gearbeitet wird, sonst das erste.
     Die Merkstelle liegt AUSSEN (`buchKapitel`), damit ein Blick auf einen
     Aufkleber und zurueck nicht jedes Mal auf Seite eins landet.

     Die Abzeichen zuerst, und das ist keine Reihenfolge aus Bequemlichkeit
     - es ist dieselbe, in der sie vorher OBEN standen: das Abzeichen ist
     die Aussage, der Aufkleber der Beleg. Wer das Buch aufschlaegt, soll
     zuerst sehen, was er kann. Der erste Anlauf schlug beim Kapitel „dran"
     auf, und der Rauchtest hat es gemeldet: er wartete 25 Sekunden auf
     `.abzeichen` und fand sie nicht, weil sie eine Seite weiter lagen. */
  const offen = !mitReitern ? null
    : (kapitel.find(k => k.id === buchKapitel)
       || kapitel.find(k => k.id === 'abzeichen')
       || kapitel.find(k => k.id === (dran && dran.id)) || kapitel[0]).id;

  const leer = `<div class="mitte">
           <div class="titel">Hier kommen deine Aufkleber hin</div>
           <div class="unter">Für jedes Gebiet, das du zweimal richtig hattest,
             kommt einer dazu. Such dir eine Karte aus — der erste ist schnell da.</div>
         </div>`;
  const seiten = (welches) => (gesamt ? '' : leer)
    + kapitel.filter(k => !mitReitern || k.id === welches).map(k => k.inhalt).join('')
    /* „Du hast alles gefunden" haengt an `vorschau`, NICHT daran, ob es
       ein Vorschaukapitel gibt (Q44).
       Der erste Anlauf fragte nach dem Kapitel - und der Satz stand
       prompt bei einem Buch mit zwei halbvollen Landkarten da: dort ist
       die Vorschau nur UNTERDRUECKT, weil die Albumkarte das Offene
       ohnehin blass zeigt. Zwei von sieben Kontinenten sind nicht
       „alles". */
    + (gesamt && !vorschau.length
       ? `<h3 class="gruppe">Du hast alles gefunden.</h3>` : '');

  /* Ein Reiter ist ein KNOPF mit Zahl und Namen.
     Die Zahl steht gross und in der Farbe der Ebene: Fiona liest den Namen
     nicht, aber sie erkennt „ihre" Farbe wieder und sieht, wieviel darin
     steckt. Angesagt wird beides (`data-lesen`), damit sie es auch hoert. */
  /* Auf dem Reiter steht `da/gesamt`, nicht `da`.
   *
   * Die nackte Zahl sagte nur die Haelfte: „45" heisst 45 von 124, „16"
   * heisst 16 von 16 - das eine ist ein Anfang, das andere fertig, und
   * beide sahen gleich aus. Mit dem Nenner sieht ein Kind zum ersten Mal,
   * WIEVIEL ES UEBERHAUPT GIBT; das ist der Punkt, an dem das Buch von
   * seinen drei Vorbildern am weitesten weg war (Panini, Pokedex,
   * Fitness zeigen alle „142 / 151").
   *
   * Ein Kapitel OHNE `gesamt` ist keine Sammlung („Als Naechstes") und
   * bekommt gar keine Zahl - sonst zaehlte eine davon in die andere
   * Richtung. */
  const reiter = (k) => `
      <button class="reiter${k.id===offen?' da':''}" data-kap="${k.id}" role="tab"
              aria-selected="${k.id===offen}" data-lesen="${k.lesen}">
        ${k.gesamt ? `<span class="reiterzahl" style="color:var(${FL[(k.farbe-1+7)%7]})"
          >${k.zahl}<small>/${k.gesamt}</small></span>` : ''}
        <span class="was">${k.titel}</span>
      </button>`;

  s.innerHTML = kopf({ links: zurueckKnopf(),
    /* DIE KOPFZAHL IST DIE SUMME DER REITER (Buch-Audit II, B3).
     *
     * Hier stand „20 Aufkleber", waehrend die Reiter 45 + 3 + 4 + 16
     * sagten: `gesamt` zaehlte nur die Ebenen-Aufkleber, Tiere und
     * Abzeichen waren nicht darin. Zwei Zahlen ueber demselben Inhalt,
     * in verschiedenen Einheiten, ohne dass es dastand.
     *
     * Jetzt wird sie AUS den Kapiteln gerechnet und nicht daneben. Sie
     * kann den Reitern damit nicht mehr widersprechen - nicht, weil
     * jemand aufpasst, sondern weil es dieselbe Zahl ist. */
    mitte:`<span class="marke">${
      kapitel.reduce((a, k) => a + (k.gesamt ? k.zahl : 0), 0)} von ${
      kapitel.reduce((a, k) => a + (k.gesamt || 0), 0)} gesammelt</span>`,
    /* Der Weg zurueck in den Vorlauf steht im KOPF, nicht im Fluss (Q20).
     *
     * Der erste Anlauf setzte ihn unter die Vorschau. Der Rauchtest hat
     * sofort gemeldet, was das kostet: 364 Punkte Inhalt bei 318
     * sichtbaren - das Buch fing schon bei fuenf Karten an zu rollen, und
     * die Vorschau stand halb unter dem Rand. Ein Knopf, der eine Zeile
     * braucht, nimmt sie dem, was er anbietet.
     *
     * Nachgemessen bei Leas Buch mit zwei Aufklebern und zwei
     * Vorschaukarten (Q23): 318 Punkte Inhalt bei 318 sichtbaren - NULL
     * Luft. Neben die Ueberschrift „Als Nächstes" passt er also auch
     * nicht; im Kopf ist der Platz schon da, rechts stand nichts.
     *
     * Er traegt aber ein WORT, nicht nur das Auge. Oben rechts, weit weg
     * von der Vorschau, ist ein nacktes Zeichen ein Raetsel - anders als
     * an der Kachel, wo es direkt auf dem Gegenstand sass. Auf schmalen
     * Fenstern faellt das Wort weg (`.knopf .wort`), dort ist es dieselbe
     * Knappheit wie bei „Zurück". */
    rechts: vorschau.length
      ? `<button class="knopf" id="allesehen" aria-label="${dran.titel} anschauen"
                 title="Alle ansehen">${ZEI('auge', 22)}<span class="wort">Ansehen</span></button>`
      : '' })
    + (mitReitern ? `<div class="buchreiter" role="tablist">${
        kapitel.map(reiter).join('')}</div>` : '')
    + `<div class="rollen buch${mitReitern ? ' kapitel' : ''}">${seiten(offen)}</div>`;
  s.querySelector('#zur').onclick=()=>zeige(weltenwahl);
  /* Ein Reiter wechselt die SEITE, nicht den Bildschirm (Q44).
   *
   * `zeige(forscherbuch)` waere eine Ueberblendung samt vollem Neuaufbau -
   * und damit dieselbe Wartezeit wie beim Aufschlagen, fuer einen Griff,
   * der sich wie Blaettern anfuehlen soll. Die Seiten sind ohnehin schon
   * gebaut; ausgetauscht wird nur, welche im Kasten steht. */
  const seitenKasten = s.querySelector('.rollen');
  s.querySelectorAll('[data-kap]').forEach(r => r.addEventListener('click', () => {
    buchKapitel = r.dataset.kap;
    s.querySelectorAll('[data-kap]').forEach(a => {
      const jetzt = a.dataset.kap === buchKapitel;
      a.classList.toggle('da', jetzt);
      a.setAttribute('aria-selected', String(jetzt));
    });
    seitenKasten.innerHTML = seiten(buchKapitel);
    seitenKasten.scrollTop = 0;
    /* Die neuen Kaesten haben noch keinen Zuhoerer - und zwar KEINEN,
       nicht nur keinen fuers Vorlesen. Deshalb dieselbe Stelle wie beim
       Aufbau (Q46). */
    seiteBinden(seitenKasten);
  }));
  /* Der Weg zurueck in den Vorlauf (Q20).
   *
   * Auf dem Telefon ist das Auge an der Kachel weggefallen (Q18), weil
   * seine Trefferflaeche auf dem Namen lag. Damit gab es dort KEINEN Weg
   * mehr, sich eine Ebene noch einmal anzusehen - der Vorlauf erscheint
   * nur beim ersten Betreten, und `vorlaufGezeigt` wird nie
   * zurueckgesetzt.
   *
   * Hier ist Platz, den die Kachel nicht hat, und hier steht die Frage
   * schon: „Als Nächstes: Europa" mit drei Karten daneben. Der Knopf
   * zeigt alle - und traegt das Auge, damit Fiona ihn ohne Lesen
   * wiedererkennt.
   *
   * „Zurück" fuehrt von dort ins BUCH, nicht in die Ebenenwahl: das Kind
   * war im Buch. */
  const zumVorlauf = s.querySelector('#allesehen');
  if (zumVorlauf) zumVorlauf.onclick = () => zeige(() => vorlauf(dran.id, forscherbuch));
  /* ALLE Zuhoerer der Seite an einer Stelle - und die laeuft auch nach
     dem Blaettern (Q46).
     Der erste Anlauf band den Kartentipp einmal beim Aufbau. Ein
     Kapitelwechsel tauscht den Inhalt aus, und dabei wurde nur
     `[data-lesen]` neu gebunden: auf jeder Seite ausser der ersten war
     der Satz danach fest. Der Rauchtest hat es gemeldet - er blaettert
     erst zum Kartenkapitel und tippt dann. */
  const seiteBinden = (wo) => {
    ansagenBinden(wo);
    kartensatzBinden(wo);
    /* Der Weg in die Landschaft (T2) - HIER und nicht beim Aufbau, aus
       demselben Grund wie der Kartensatz: ein Kapitelwechsel tauscht den
       Inhalt aus, und ein einmal gebundener Zuhoerer haengt danach an
       einem Knopf, den es nicht mehr gibt. `addEventListener` neben dem
       `onclick` der Zeile darueber, sonst waere die Tuer stumm. */
    wo.querySelectorAll('.raumauf').forEach(b => b.addEventListener('click',
      () => zeige(() => landschaft(b.dataset.raum, forscherbuch))));
    /* Das Raster blendet um, statt neu zu bauen - dieselbe Entscheidung
       wie bei den Kapitelreitern (Q44), aus demselben Grund. `hidden`
       und nicht `display`, damit die Seite auch fuer den Vorleser weg
       ist.
       Seit Runde 3 sind es ZWEI Zustaende derselben Seite und keine
       Reiterzeile mehr: entweder steht das Raumraster da oder ein Raum.
       Deshalb wird auch das Raster selbst geschaltet - haette es nur
       `data-raumseite`, waere es beim ersten Tipp mitverschwunden und
       nie wiedergekommen. */
    const raumZeigen = (raum) => {
      const gitter = wo.querySelector('.raumgitter');
      if (gitter) gitter.hidden = raum !== null;
      wo.querySelectorAll('[data-raumseite]').forEach(seite => {
        seite.hidden = seite.dataset.raumseite !== raum; });
    };
    wo.querySelectorAll('[data-raumwahl]').forEach(b => b.addEventListener('click',
      () => raumZeigen(b.dataset.raumwahl)));
    wo.querySelectorAll('[data-raumzu]').forEach(b => b.addEventListener('click',
      () => raumZeigen(null)));
    /* Dasselbe eine Ebene hoeher: die Weltseite (B12).
       Hier wird nicht ein Raster gegen einen Kasten getauscht, sondern
       ein ganzer `.buchseite`-Abschnitt gegen einen anderen - die
       Uebersicht traegt links den Weltnamen, eine Ebene links ihren
       eigenen Titel samt Fusssatz. Ohne das waere der Satz zum
       Mitnehmen heimatlos geworden, und der Grundriss der Seite („EINE
       Seite, fuenfmal") haette eine sechste Fassung bekommen. */
    const weltZeigen = (id) => {
      wo.querySelectorAll('.buchseite').forEach(seite => {
        const uebersicht = String(seite.dataset.seite || '').startsWith('welt:');
        seite.hidden = id === null ? !uebersicht : seite.dataset.seite !== id;
      });
    };
    wo.querySelectorAll('[data-ebenenwahl]').forEach(b => b.addEventListener('click',
      () => weltZeigen(b.dataset.ebenenwahl)));
    wo.querySelectorAll('[data-weltzu]').forEach(b => b.addEventListener('click',
      () => weltZeigen(null)));
  };
  /* Ein Tipp auf die Albumkarte blaettert den Satz weiter (Q46).
   *
   * `addEventListener` und nicht `onclick`: die Zeile darueber hat dort
   * schon einen Zuhoerer gesetzt, der den Kartentitel vorliest. Ein
   * zweites `onclick` haette ihn ersetzt, und das Buch waere fuer Fiona
   * still geworden - sie hoert den Titel, nicht den Satz.
   *
   * Gezaehlt wird AM ELEMENT (`dataset.dran`), nicht in einer Variablen
   * hier: der Bildschirm wird beim Kapitelwechsel neu gebaut, eine
   * Variable waere dann wieder auf null. */
  function kartensatzBinden(wo) {
  wo.querySelectorAll('.albumkarte').forEach(karte => {
    /* Die SEITE fragen, nicht das Elternelement.
       Bis zum Buch-Umbau lagen Karte und Satz im selben Kasten; jetzt
       steht der Satz in der linken Spalte und die Karte in der rechten -
       Geschwister, keine Verwandtschaft ersten Grades. Der Rauchtest hat
       es gemeldet: ein Tipp auf die Karte blaetterte den Satz nicht mehr
       weiter. `closest` haelt beide Faelle. */
    const seite = karte.closest('.buchseite') || karte.parentElement;
    const zeile = seite?.querySelector('.buchsatz');
    if (!zeile) return;
    const g = gruppen.find(x => x.id === zeile.dataset.gruppe);
    const wo = g ? satzGebiete(g) : [];
    if (wo.length < 2) return;   // nichts zu blaettern
    karte.addEventListener('click', () => {
      const n = ((+zeile.dataset.dran || 0) + 1) % wo.length;
      zeile.dataset.dran = n;
      const satz = Saetze.satzZu(wo[n].id);
      zeile.textContent = satz;
      zeile.dataset.lesen = satz;
      vorlesen(satz);
    });
  });
  }
  seiteBinden(s);
  ansagen(gesamt
    ? `Dein Forscherbuch. Du hast ${gesamt} Aufkleber${gekonnt?`, ${gekonnt} davon sicher`:''}`
      + `${verdient.length ? ` und ${verdient.length===1?'ein Abzeichen':`${verdient.length} Abzeichen`}` : ''}. `
      + `Tipp etwas an, dann sage ich dir, was es ist.`
      // Fiona liest nicht: ein Knopf, der nur zu SEHEN ist, ist fuer sie
      // keiner. Das Auge oben rechts wird deshalb angesagt - und mit dem,
      // was es tut, nicht mit seinem Namen.
      + (vorschau.length ? ` Oben rechts ist ein Auge. Tipp es an, dann `
        + `zeige ich dir alles aus ${dran.titel}.` : '')
    : 'Dein Forscherbuch ist noch leer. Such dir eine Karte aus — der erste Aufkleber ist schnell da.');
  return s;
}

/* ---------- Elternbereich ------------------------------------------------ */
/* Die PIN ist eine Tuerklinke, kein Schloss: sie liegt unverschluesselt in
   der Ablage und haelt neugierige Achtjaehrige ab, nicht Angreifer. */
/* ---------- Die Sprechprobe (M4r) ----------------------------------------
 *
 * Sie beantwortet EINE Frage, und zwar die, die vor allen anderen steht:
 * springt das Mikrofon auf diesem Geraet ueberhaupt an?
 *
 * Warum das kein Tor kann: der Rauchtest baut die Erkennung NACH
 * (`window.SpeechRecognition = ErkNachbau`). Er prueft damit den Zustand
 * drumherum - dass man das Zuhoeren beenden kann, dass ein Ende ohne
 * Ergebnis sichtbar wird. Ob Safari im Querformat auf einem iPhone das
 * Mikrofon oeffnet, kann er nicht wissen; sein Nachbau sagt immer ja.
 *
 * Und warum nicht einfach spielen und schauen: weil ein Fehlschlag dort
 * nichts erklaert. „Es passiert nichts" kann heissen, dass die Erlaubnis
 * fehlt, dass das Mikrofon nie aufging, dass es aufging und nichts
 * hoerte, oder dass es hoerte und das Ergebnis verlorenging - vier
 * verschiedene Sachen, und man sieht ihnen dasselbe an. Aufgezeichnet
 * wird deshalb die ABFOLGE der Ereignisse mit Zeiten; die
 * unterscheidet sie.
 *
 * Aufgehoben wird in den Einstellungen, nicht im Kopf: die halbe Stunde
 * mit dem Geraet in der Hand endet sonst mit einem Gefuehl statt mit
 * Zahlen, und beim naechsten Start ist alles weg.
 */
const PROBE_MAX = 20;            // mehr braucht niemand zum Urteilen
const PROBE_DAUER = 8000;        // dieselbe Frist wie im Spiel

/** Median einer Zahlenliste - `null`, wenn keine da ist. */
const median = (xs) => {
  const a = xs.filter(x => Number.isFinite(x)).sort((p, q) => p - q);
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : Math.round((a[m-1] + a[m]) / 2);
};

function sprechprobe(s){
  const knopf = s.querySelector('#probe');
  const weg   = s.querySelector('#probeweg');
  const stand = s.querySelector('#probestand');
  if (!knopf || !stand) return;
  const Erk = window.SpeechRecognition || window.webkitSpeechRecognition;

  const zeigen = () => {
    const laeufe = Einst.sprechprobe || [];
    const mitTon    = laeufe.filter(l => l.folge.some(([, was]) => was === 'audiostart'));
    const mitWort   = laeufe.filter(l => l.text);
    const fehler    = laeufe.filter(l => l.fehler);
    const bisTon    = median(laeufe.map(l => (l.folge.find(([, w]) => w === 'audiostart') || [])[0]));
    const bisWort   = median(laeufe.map(l => (l.folge.find(([, w]) => w === 'ergebnis') || [])[0]));
    const letzter   = laeufe[laeufe.length - 1];
    const zaehl = {};
    for (const f of fehler) zaehl[f.fehler] = (zaehl[f.fehler] || 0) + 1;
    stand.innerHTML = `
      <table class="tab"><tbody>
        <tr><td>Erkennung im Browser</td><td class="num">${
          Erk ? (window.SpeechRecognition ? 'SpeechRecognition' : 'webkitSpeechRecognition')
              : 'gibt es nicht'}</td></tr>
        <tr><td>Versuche</td><td class="num" data-probe="versuche">${laeufe.length}</td></tr>
        <tr><td>davon mit Mikrofon (<em>audiostart</em>)</td>
          <td class="num" data-probe="mikrofon">${mitTon.length}</td></tr>
        <tr><td>davon mit verstandenem Wort</td>
          <td class="num" data-probe="wort">${mitWort.length}</td></tr>
        <tr><td>Fehler</td><td class="num">${
          fehler.length ? Object.entries(zaehl).map(([k, n]) => `${k} ${n}×`).join(', ') : '—'}</td></tr>
        <tr><td>bis das Mikrofon aufging</td><td class="num">${
          bisTon === null ? '—' : bisTon + ' ms'}</td></tr>
        <tr><td>bis zum ersten Wort</td><td class="num">${
          bisWort === null ? '—' : bisWort + ' ms'}</td></tr>
      </tbody></table>
      ${letzter ? `<p class="unter" id="probelauf">Letzter Versuch: ${
        letzter.folge.map(([ms, was]) => `${was} ${ms} ms`).join(' · ')}${
        letzter.text ? ` — „${letzter.text}“` : ''}${
        letzter.fehler ? ` — Fehler: ${letzter.fehler}` : ''}</p>` : ''}`;
  };
  zeigen();

  weg.onclick = async () => { Einst.sprechprobe = []; await einstSichern(); zeigen(); };

  if (!Erk) { knopf.disabled = true; return; }

  let laeuft = null, uhr = null, lauf = null;
  const t0 = () => Date.now();
  const fertig = async () => {
    if (uhr) { clearTimeout(uhr); uhr = null; }
    laeuft = null;
    knopf.textContent = 'Mikrofon prüfen';
    if (lauf) {
      const alle = (Einst.sprechprobe || []).concat([lauf]).slice(-PROBE_MAX);
      Einst.sprechprobe = alle; lauf = null;
      await einstSichern();
    }
    zeigen();
  };

  knopf.onclick = () => {
    // Zweiter Tipp heisst „fertig" - wie im Spiel. Ein zweiter Erkenner
    // neben dem ersten wirft auf iOS, und dann waere der Versuch weg.
    if (laeuft) { try { laeuft.stop(); } catch (e) { fertig(); } return; }
    const e = new Erk();
    e.lang = 'de-DE'; e.maxAlternatives = 3; e.continuous = false; e.interimResults = true;
    const start = t0();
    lauf = { zeit: start, folge: [], text: '', fehler: '' };
    const merk = (was) => lauf && lauf.folge.push([Date.now() - start, was]);
    /* ALLE Ereignisse, nicht nur die mit Ergebnis. Genau dazwischen liegt
       die Auskunft: `audiostart` ohne `speechstart` heisst „Mikrofon
       offen, nichts gehoert"; gar kein `audiostart` heisst „nie
       aufgegangen". Beides sieht auf dem Bildschirm gleich aus. */
    for (const was of ['start', 'audiostart', 'soundstart', 'speechstart',
                       'speechend', 'soundend', 'audioend', 'nomatch'])
      e['on' + was] = () => merk(was);
    e.onresult = (ev) => {
      const r = ev.results[ev.results.length - 1];
      const t = String(r[0].transcript).trim();
      merk(r.isFinal ? 'ergebnis' : 'zwischen');
      if (t) lauf.text = t;
      if (r.isFinal) { try { e.stop(); } catch (err) {} }
    };
    e.onerror = (ev) => { merk('fehler'); if (lauf) lauf.fehler = (ev && ev.error) || 'unbekannt'; };
    e.onend = () => { merk('ende'); fertig(); };
    try {
      e.start();
      laeuft = e;
      knopf.textContent = 'Fertig';
      uhr = setTimeout(() => { if (laeuft) { try { laeuft.stop(); } catch (err) { fertig(); } } },
        PROBE_DAUER);
    } catch (err) {
      lauf.fehler = 'start: ' + (err && err.message || err);
      fertig();
    }
  };
}

function elternTor(){
  const s = el('div'); let eingabe='';
  s.innerHTML = kopf({ links: zurueckKnopf() }) + `
    <div class="mitte">
      <div class="titel">${BEREICH_ELTERN}</div>
      <div class="unter">Vier Ziffern.${Einst.pin==='0000'
        ? ' Voreingestellt ist <code>0000</code> — drinnen änderbar.' : ''}</div>
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
  /* Alte Eintraege trugen `profil:'eltern'`. Sie werden hier umgeschrieben
     statt in der Ablage: ein Protokoll ist ein Mitschnitt, und einen
     Mitschnitt aendert man nicht rueckwirkend - man liest ihn richtig. */
  const eintraege = (await Protokoll.lesen())
    .map(e => e.profil === ALTES_ELTERN ? { ...e, profil: alsProfil(e.profil) } : e);
  const a = Protokoll.auswerten(eintraege, NAMEN);
  const speicher = await Ablage.dauerhaft();

  /* Der Bereich kennt DREI Profile (R7).
   *
   * Bis hierher warf er alles in einen Topf: eine Zahl „Antworten", eine
   * Liste Wackelkandidaten ueber alle Profile hinweg, ein Loeschknopf fuer
   * genau das Profil, mit dem man hereingekommen war. Die Abnahme im
   * Konzept (M6) lautet aber „Was kann LEA noch nicht?" - und die war so
   * nicht zu beantworten: Fionas Polen und Leas Polen standen in
   * derselben Zeile, und wer als Lea hereinkam, konnte Fionas Daten weder
   * sehen noch loeschen.
   *
   * Die Liste kommt aus PROFILE, nicht aus den Eintraegen: ein Profil,
   * das noch nie gespielt hat, muss sichtbar sein (sonst sieht „noch
   * nichts gespielt" aus wie „gibt es nicht"), und ein viertes Profil
   * steht hier von selbst, ohne dass jemand diese Stelle anfasst. */
  const profile = Object.values(PROFILE).map(pr => {
    const meine = eintraege.filter(e => e.profil === pr.id);
    return { pr, n: meine.length, a: Protokoll.auswerten(meine, NAMEN) };
  });
  const gespielt = profile.filter(x => x.n);

  const zeile = (z)=>`<tr><td>${z.name}</td>
    <td class="num">${z.n}</td>
    <td class="num">${Math.round(z.quote*100)} %</td>
    <td class="num">${(z.schnitt/1000).toFixed(1)} s</td>
    <td><div class="balken klein"><i style="width:${Math.round(z.quote*100)}%;
      background:${z.quote>.7?'var(--gut)':z.quote>.4?'var(--achtung)':'var(--warn)'}"></i></div></td></tr>`;

  s.innerHTML = kopf({ links: zurueckKnopf(),
    mitte:`<span class="marke">${BEREICH_ELTERN}</span>` }) + `
    <div class="rollen eltern">
      <h3 class="gruppe">Überblick</h3>
      <div class="kacheln">
        <div class="wert"><b>${a.gesamt}</b><span>Antworten</span></div>
        <div class="wert"><b>${a.gesamt?Math.round(a.richtig/a.gesamt*100):0} %</b><span>richtig</span></div>
        <div class="wert"><b>${a.tage.length}</b><span>Tage gespielt</span></div>
        <div class="wert"><b>${gespielt.length}</b><span>Profile</span></div>
      </div>

      <table class="tab" style="margin-top:var(--r3)"><thead><tr><th>Profil</th>
        <th class="num">Antworten</th><th class="num">richtig</th>
        <th class="num">Ø Zeit</th><th class="num">Tage</th></tr></thead>
        <tbody>${profile.map(({ pr, n, a:e })=>`<tr><td>${pr.name}</td>
          <td class="num">${n}</td>
          <td class="num">${n ? Math.round(e.richtig/n*100)+' %' : '—'}</td>
          <td class="num">${n ? (e.schnitt/1000).toFixed(1)+' s' : '—'}</td>
          <td class="num">${e.tage.length || '—'}</td></tr>`).join('')}</tbody></table>

      <h3 class="gruppe">${VERGLEICH.map(id=>PROFILE[id].name).join(' gegen ')}</h3>
      ${(()=>{
        /* Der Vergleich (N1).
         *
         * Verglichen wird, was ohnehin gezaehlt wird: auf Anhieb richtig
         * und die Zeit. Keine erfundene Punktzahl - die waere `glatt` noch
         * einmal, nur mit einem Faktor davor, und in diesem Verzeichnis
         * steht keine Zahl an zwei Stellen.
         *
         * Gerechnet wird in `Protokoll.vergleich`, nicht hier: dieselbe
         * Zaehlung soll das Tor pruefen koennen, ohne einen Browser zu
         * starten. */
        const v = Protokoll.vergleich(eintraege, VERGLEICH);
        const zelle = (t, fuehrt)=>`<td class="num${fuehrt?' fuehrt':''}">${
          t.aufgaben ? `${t.glatt} von ${t.aufgaben}<span class="dazu">${
            (t.schnitt/1000).toFixed(1)} s</span>` : '—'}</td>`;
        const reihe = (name, je, dick)=>{
          const [x, y] = VERGLEICH.map(id=>je[id]);
          return `<tr${dick?' class="summe"':''}><td>${name}</td>
            ${zelle(x, x.glatt > y.glatt)}${zelle(y, y.glatt > x.glatt)}</tr>`;
        };
        if (!VERGLEICH.some(id=>v.summe[id].aufgaben))
          return `<p class="unter">Noch nichts gespielt. Sobald ihr beide eine Übung
            gemacht habt, steht hier, wer wie viele auf Anhieb richtig hatte.</p>`;
        return `<p class="unter">Gezählt wird, was <strong>auf Anhieb richtig</strong>
            war — beim ersten Versuch, ohne Hilfe. Die Zeit steht daneben, sie
            entscheidet nichts.</p>
          <table class="tab" id="duell"><thead><tr><th>Übung</th>
            ${VERGLEICH.map(id=>`<th class="num">${PROFILE[id].name}</th>`).join('')}
            </tr></thead><tbody>
            ${v.reihen.map(r=>reihe(EBENEN.find(e=>e.id===r.ebene)?.titel || r.ebene, r.je)).join('')}
            ${reihe('Zusammen', v.summe, true)}</tbody></table>
          <p class="unter" id="duellsatz">${v.vorn
            ? `<strong>${PROFILE[v.vorn].name}</strong> liegt vorn: ${
                v.summe[v.vorn].glatt} auf Anhieb richtig gegen ${
                v.summe[VERGLEICH.find(id=>id!==v.vorn)].glatt}.`
            : 'Es steht gleich.'}</p>`;
      })()}

      <h3 class="gruppe">Zuletzt geübt</h3>
      ${eintraege.length ? `<table class="tab" id="zuletzt"><thead><tr><th class="num">Wann</th>
        <th>Profil</th><th>Aufgabe</th><th class="num">Ergebnis</th></tr></thead><tbody>
        ${eintraege.slice(-10).reverse().map(e=>`<tr>
          <td class="num">${new Date(e.zeit).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</td>
          <td>${PROFILE[e.profil]?.name || e.profil}</td>
          <td>${NAMEN[e.gebietId] || e.gebietId}</td>
          <td class="num">${e.ergebnis}</td></tr>`).join('')}</tbody></table>`
        : `<p class="unter">Noch nichts geübt.</p>`}

      <h3 class="gruppe">Wackelkandidaten</h3>
      <p class="unter">Die fünf mit den meisten Fehlversuchen — <strong>je Profil</strong>.
        Zusammengezählt beantworten sie die Frage nicht, um die es hier geht.</p>
      ${gespielt.length ? gespielt.map(({ pr, a:e })=>`
        <p class="unter"><strong>${pr.name}</strong></p>
        ${e.wackelkandidaten.length ? `<table class="tab"><thead><tr><th>Gebiet</th>
          <th class="num">Versuche</th><th class="num">richtig</th><th class="num">Ø Zeit</th><th></th></tr></thead>
          <tbody>${e.wackelkandidaten.map(zeile).join('')}</tbody></table>`
          : `<p class="unter">Noch zu wenig gespielt.</p>`}`).join('')
        : `<p class="unter">Noch zu wenig gespielt.</p>`}

      <h3 class="gruppe">Ausspracheliste — was gesagt, was verstanden</h3>
      ${gespielt.some(x=>x.a.aussprache.length) ? `<table class="tab"><thead><tr><th>Profil</th>
        <th>gesagt</th><th>gemeint</th>
        <th class="num">Ergebnis</th></tr></thead><tbody>
        ${gespielt.flatMap(({ pr, a:e })=>e.aussprache.map(x=>({ ...x, wer:pr.name })))
          .sort((x,y)=>x.zeit-y.zeit).slice(-25).reverse()
          .map(x=>`<tr><td>${x.wer}</td><td><em>„${x.gesagt}“</em></td>
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
      <p class="unter" id="enstimme"></p>
      <p class="unter" id="nochmalzahl"></p>

      <h3 class="gruppe">Rückmeldeton</h3>
      <p class="unter">Zwei kurze Töne: einer nach einer richtigen, einer nach einer
        falschen Antwort. <strong>Ab Werk aus.</strong> Das Vorlesen ist davon nicht
        betroffen — es hängt am Lautsprecher in der Kopfzeile, und der bleibt der große
        Schalter: steht <em>er</em> auf aus, ist alles still.</p>
      <div class="reihe" style="justify-content:flex-start">
        <button class="knopf" id="klang">${Einst.klang?'Rückmeldeton ausschalten':'Rückmeldeton einschalten'}</button>
      </div>

      <h3 class="gruppe">Sprachmodus</h3>
      <p class="unter">Die Spracherkennung läuft <strong>nicht auf dem Gerät</strong>.
        Was das Kind sagt, geht zur Erkennung an Apple beziehungsweise den Browserhersteller.
        Alles andere — Fortschritt, Protokoll, Profile — bleibt hier und geht nirgendwohin.</p>
      <div class="reihe" style="justify-content:flex-start">
        <button class="knopf" id="sprach">${Einst.sprachmodus?'Sprachmodus ausschalten':'Sprachmodus einschalten'}</button>
      </div>

      <h3 class="gruppe">Sprechprobe — löst das Mikrofon aus?</h3>
      <p class="unter">Die Frage <em>vor</em> allen anderen (M4r). Ob die Erkennung ein
        Wort richtig zuordnet, steht in der Ausspracheliste weiter oben — aber ob das
        Mikrofon auf <em>diesem</em> Gerät im Querformat überhaupt anspringt, sagt kein
        Tor und kein Nachbau. Nur das Gerät in der Hand.
        <br>Jedes Antippen ist <strong>ein Versuch</strong>: sprich einen Kontinentnamen
        und lies ab, was ankam. Aufgezeichnet wird die Abfolge der Ereignisse mit
        Zeiten — dann sieht man den Unterschied zwischen „hat nie zugehört" und
        „hat zugehört und nichts verstanden".</p>
      ${(() => {
        /* Warum steht kein Mikrofon da? DREI Gruende, und sie sehen auf dem
         * Bildschirm eines Kindes alle gleich aus - naemlich nach nichts.
         *
         * Gemeldet vom iPad: „über Fionas Profil ist das blaue Icon für die
         * Spracheingabe gar nicht da." Woran es liegt, war von aussen nicht
         * zu unterscheiden: Schalter aus? Browser kann es nicht? Profil
         * darf es nicht? Hier steht es jetzt, in drei Zeilen, auf dem
         * Geraet selbst - und zwar unabhaengig davon, ob gerade jemand
         * spielt. */
        const erk = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        const alsApp = window.matchMedia?.('(display-mode: standalone)').matches
                    || window.navigator.standalone === true;
        const wer = Object.values(PROFILE).filter(x => x.eingabe.includes('sprechen'))
                          .map(x => x.name);
        /* „ja"/„nein" statt Haken und Kreuz: die beiden Zeichen liegen
           ausserhalb des geladenen Schriftschnitts und wuerden auf dem
           Geraet als leere Kaesten stehen - gemeldet vom Tor `inhalt`,
           dasselbe wie damals bei den PIN-Punkten (F7). */
        const zeile = (gut, text) => `<li><strong>${gut ? 'ja' : 'nein'}</strong> — ${text}</li>`;
        return `<ul class="unter" style="list-style:none;padding-left:0;line-height:1.7">
          ${zeile(Einst.sprachmodus, `Sprachmodus ist <strong>${Einst.sprachmodus ? 'an' : 'aus'}</strong>`
            + `${Einst.sprachmodus ? '' : ' — der Schalter darüber'}`)}
          ${zeile(erk, erk ? 'Dieser Browser kann Spracherkennung'
            : 'Dieser Browser kann <strong>keine</strong> Spracherkennung — '
              + 'auf dem iPhone und iPad geht es nur in <strong>Safari</strong>')}
          ${zeile(wer.length, `Profile mit Sprechen: <strong>${wer.join(', ') || 'keins'}</strong>`)}
          <li style="opacity:.7">Gestartet ${alsApp ? 'als App vom Home-Bildschirm' : 'im Browser'}</li>
        </ul>`;
      })()}
      <div class="reihe" style="justify-content:flex-start">
        <button class="knopf" id="probe">Mikrofon prüfen</button>
        <button class="knopf leise" id="probeweg">Versuche verwerfen</button>
      </div>
      <div id="probestand"></div>

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

      <h3 class="gruppe">Aufkleber auf allen Geräten</h3>
      ${!BAU.gleichlauf ? `
        <p class="unter">Der Gleichlauf ist <strong>nicht eingerichtet</strong>.
          Alles bleibt auf diesem Gerät — so wie bisher. Wie ein eigener
          Dienst dafür aufgesetzt wird, steht in
          <code>dienst/gleichlauf-worker.js</code>; es dauert rund fünf
          Minuten und kostet nichts.</p>`
      : !Einst.familienschluessel ? `
        <p class="unter">Zwei Geräte mit demselben <strong>Familienschlüssel</strong>
          teilen sich die Aufkleber. Der Schlüssel bleibt bei euch: was über
          das Netz geht, ist zugesperrt, und der Dienst kann es nicht lesen.</p>
        <div class="reihe" style="justify-content:flex-start">
          <button class="knopf haupt" id="glneu">Neuen Schlüssel anlegen</button>
        </div>
        <p class="unter">Auf dem zweiten Gerät stattdessen den Schlüssel des
          ersten eintragen:</p>
        <div class="reihe" style="justify-content:flex-start">
          <input class="eingabe schluesselfeld" id="glfeld" inputmode="latin"
                 autocapitalize="characters" spellcheck="false"
                 placeholder="ABCD-EFGH-JKMN-PQRS">
          <button class="knopf" id="glnehmen">Übernehmen</button>
        </div>
        <span class="unter" id="glstand"></span>`
      : `
        <p class="unter">Dieses Gerät läuft mit. Der Schlüssel steht auch auf
          jedem anderen Gerät, das dieselben Aufkleber zeigen soll — abtippen,
          nicht verschicken.</p>
        <p class="unter">Ist ein Gerät weg oder soll es nicht mehr mitlaufen:
          hier <strong>lösen</strong> und einen <strong>neuen Schlüssel</strong>
          anlegen, dann den auf den übrigen Geräten eintragen. Nur lösen reicht
          nicht — wer den alten Schlüssel hat, kommt weiter in den alten Raum.
          Der wird nach einem halben Jahr ohne Abgleich von selbst geleert.</p>
        <div class="wert schluesselschild">
          <b>${Einst.familienschluessel}</b><span>Familienschlüssel</span></div>
        <div class="reihe" style="justify-content:flex-start">
          <button class="knopf haupt" id="gljetzt">Jetzt abgleichen</button>
          <button class="knopf" id="gllos" style="color:var(--warn)">Dieses Gerät lösen</button>
        </div>
        <span class="unter" id="glstand"></span>`}

      <h3 class="gruppe">Ausfuhr und Löschen</h3>
      <div class="reihe" style="justify-content:flex-start">
        <button class="knopf" id="csv">Als CSV sichern</button>
        <button class="knopf" id="json">Als JSON sichern</button>
      </div>
      <p class="unter">Löschen geht <strong>je Profil</strong> und ist nicht
        zurückzunehmen: Fortschritt, Protokoll und Aufkleber sind dann weg.
        Zweimal tippen.</p>
      <div class="reihe" style="justify-content:flex-start">
        ${profile.map(({ pr })=>`<button class="knopf" data-weg="${pr.id}"
          style="color:var(--warn)">Alles von ${pr.name} löschen</button>`).join('')}
      </div>
      <div id="ausgabe"></div>

      <h3 class="gruppe">Diese Fassung</h3>
      <table class="tab"><tbody>
        <tr><td>Fassung</td><td class="num">${BAU.fassung}</td></tr>
        <tr><td>Bau</td><td class="num">v${BAU.bau}</td></tr>
        <tr><td>Einchecker</td><td class="num">${BAU.stand}</td></tr>
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
  sprechprobe(s);
  s.querySelector('#sprach').onclick=async(e)=>{
    Einst.sprachmodus=!Einst.sprachmodus; await einstSichern();
    e.target.textContent=Einst.sprachmodus?'Sprachmodus ausschalten':'Sprachmodus einschalten'; };
  s.querySelector('#klang').onclick=async(e)=>{
    Einst.klang=!Einst.klang; await einstSichern();
    // Zum Anhoeren, ohne den Elternbereich zu verlassen: wer den Schalter
    // umlegt, will wissen, was er sich einhandelt. Beim AUSschalten
    // schweigt es - ein Ton als Quittung fuers Abschalten waere eine
    // Frechheit.
    if (Einst.klang && tonAn) Klang.richtig();
    e.target.textContent=Einst.klang?'Rückmeldeton ausschalten':'Rückmeldeton einschalten'; };
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
  /* Und die englische Stimme - eine Auskunft, keine Wahl (E2).
   *
   * Gewaehlt wird sie nicht: die Lieblingsliste sind Apples deutsche
   * Ansagestimmen und sagen ueber eine englische nichts. Aber ob es
   * ueberhaupt eine gibt, gehoert hierher - denn wenn nicht, SCHWEIGT die
   * vierte Welt, und das soll niemand fuer einen Fehler halten. Der Weg
   * dorthin steht dabei; er ist ein anderer als beim Deutschen. */
  const enZeigen = () => {
    const p = s.querySelector('#enstimme'); if (!p) return;
    p.innerHTML = englischHoerbar()
      ? `Für Englisch nimmt die App <strong>${stimmeEn.name}</strong> (${stimmeEn.lang}).`
      : 'Für <strong>Englisch</strong> hat dieses Gerät keine Stimme. Die englischen '
        + 'Wörter bleiben dann still — lieber das als eine deutsche Stimme, die '
        + '„cat" wie „katt" sagt. Nachladen unter <em>Einstellungen › '
        + 'Bedienungshilfen › Gesprochene Inhalte › Stimmen › Englisch</em>.';
  };
  /* Wie oft der Satz ein zweites Mal gehoert wurde (E12).
   *
   * Sie steht hier und nirgends im Spiel: waehrend der Aufgabe waere sie
   * ein Punktestand und damit eine Strafe. Das Konzept sagt ausdruecklich
   * „nicht bestraft, nur gezaehlt" - und eine Zahl, die man RUHIG
   * nachliest, wirkt anders als eine, die einem beim Tippen zusieht.
   *
   * Sie ist ausserdem das Einzige, was ueberhaupt etwas ueber das Hoeren
   * sagt: „richtig" allein ist auch die Antwort, die erst beim vierten
   * Anlauf ankam. */
  {
    const p = s.querySelector('#nochmalzahl');
    const n = Einst.nochmalGehoert?.[P.id] || 0;
    if (p) p.innerHTML = n
      ? `„Hören und schreiben": <strong>${n}-mal</strong> ein zweites Mal gehört. `
        + 'Das kostet nichts — es steht hier, damit man es sieht.'
      : '„Hören und schreiben": bisher kein zweites Hören.';
  }
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
      vorlesen('Super gemacht! Das ist Australien.');
      tonAn = alterTon;
    });
  };
  stimmenZeichnen(); enZeigen();
  if ('speechSynthesis' in window)
    speechSynthesis.addEventListener('voiceschanged',
      () => { stimmenZeichnen(); enZeigen(); }, { once:false });

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

  /* --- Gleichlauf (Q29) ------------------------------------------------
   *
   * Alles hier ist Elternsache: es gibt keinen Weg dorthin, der nicht
   * durch die PIN fuehrt, und im Spiel ist von alldem nichts zu sehen.
   *
   * Der Stand wird GEZEIGT und nicht behauptet: „zuletzt abgeglichen"
   * kommt aus derselben Uhr, die der Gleichlauf stellt. Ohne das waere
   * hier ein Knopf, der nichts sagt - und ein Elternteil, das nicht
   * weiss, ob es funktioniert hat. */
  const glstand = s.querySelector('#glstand');
  const glSchreiben = (satz) => { if (glstand) glstand.textContent = satz; };
  /* „vor drei Minuten", nicht „02.09. 19:41".
   *
   * Die Frage, die hier jemand hat, ist „laeuft es noch?" - und darauf
   * antwortet ein Abstand, keine Uhrzeit. Eine Uhrzeit muss man erst mit
   * der eigenen vergleichen, und bei „19:41" weiss man nicht, ob das
   * heute war. Ab einem Tag steht das Datum trotzdem da: „vor 40
   * Stunden" rechnet auch niemand. */
  const glVorher = (t) => {
    const s2 = Math.round((Date.now() - t) / 1000);
    if (s2 < 90) return 'gerade eben';
    if (s2 < 5400) return `vor ${Math.round(s2 / 60)} Minuten`;
    if (s2 < 86400) return `vor ${Math.round(s2 / 3600)} Stunden`;
    return 'am ' + new Date(t).toLocaleString('de-DE',
      { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  };
  const glMelden = (st) => glSchreiben(st.fehler
    ? `Zuletzt nicht geklappt: ${st.fehler}.`
      + (st.zuletzt ? ` Davor ${glVorher(st.zuletzt)}.` : '')
    : st.zuletzt ? `Zuletzt abgeglichen ${glVorher(st.zuletzt)}`
      + (st.gesendet ? ` — ${st.gesendet} Einträge sind dazugekommen.` : '.')
    : 'Noch nicht abgeglichen.');
  if (Einst.familienschluessel && BAU.gleichlauf) {
    glMelden(gleichlaufStand);
    /* Die Zeile zieht NACH, ohne dass jemand etwas antippt.
     *
     * Zwei Gruende: der Abstand wird von selbst aelter („vor 3 Minuten"
     * stimmt nach zehn nicht mehr), und ein Gleichlauf, der im
     * Hintergrund fertig wird, waehrend jemand hier steht, soll zu sehen
     * sein. Vorher stimmte die Zeile nur im Augenblick des Aufbaus - und
     * eine Anzeige, die nur auf Knopfdruck stimmt, ist keine.
     *
     * Beendet wird die Uhr daran, dass ihr Element aus dem Baum ist
     * (`isConnected`), nicht an einem Ereignis: Bildschirme werden hier
     * ausgetauscht, nicht abgemeldet, und eine Uhr, die auf ein
     * Abmelden wartet, das es nicht gibt, laeuft ewig weiter. */
    const uhr = setInterval(() => {
      if (!glstand.isConnected) { clearInterval(uhr); return; }
      glMelden(gleichlaufStand);
    }, 15000);
    /* Und beim Oeffnen einmal wirklich abgleichen. Nicht darauf warten -
       der Bildschirm steht sofort da, die Zeile zieht nach. */
    gleichlaufFahren().then(glMelden);
  }

  const glNeu = s.querySelector('#glneu');
  if (glNeu) glNeu.onclick = async () => {
    Einst.familienschluessel = Gleichlauf.schluesselNeu();
    await einstSichern();
    zeige(eltern);
  };
  const glNehmen = s.querySelector('#glnehmen');
  if (glNehmen) glNehmen.onclick = async () => {
    const roh = s.querySelector('#glfeld').value;
    /* Geprueft wird HIER, nicht erst beim ersten Aufruf. Ein Schluessel
       mit einem Zahlendreher fuehrt sonst in einen leeren Raum, der wie
       ein leeres Konto aussieht - und niemand kaeme darauf, dass ein
       Zeichen falsch ist. */
    if (!Gleichlauf.ausCode(roh)) {
      glSchreiben('Das sind nicht sechzehn Zeichen. Bitte noch einmal ansehen.');
      return;
    }
    Einst.familienschluessel = Gleichlauf.alsCode(Gleichlauf.ausCode(roh));
    await einstSichern();
    zeige(eltern);
  };
  const glJetzt = s.querySelector('#gljetzt');
  if (glJetzt) glJetzt.onclick = async () => {
    glSchreiben('Läuft …');
    glMelden(await gleichlaufFahren());
  };
  const glLos = s.querySelector('#gllos');
  if (glLos) glLos.onclick = async () => {
    /* Zweimal tippen, wie beim Loeschen - nur ist hier NICHTS weg: der
       Stand dieses Geraets bleibt vollstaendig stehen, es laeuft nur
       nicht mehr mit. Genau das steht auch da, sonst klingt „lösen"
       gefaehrlicher als es ist. */
    if (glLos.dataset.sicher !== 'ja') {
      glLos.dataset.sicher = 'ja';
      glLos.textContent = 'Wirklich lösen?';
      glSchreiben('Die Aufkleber auf diesem Gerät bleiben. Es läuft nur nicht mehr mit.');
      return;
    }
    Einst.familienschluessel = null;
    await einstSichern();
    zeige(eltern);
  };

  s.querySelector('#csv').onclick=()=>sichern(Protokoll.alsCsv(eintraege,NAMEN),
    `lernkiste-${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8');
  s.querySelector('#json').onclick=()=>sichern(Protokoll.alsJson(eintraege),
    `lernkiste-${new Date().toISOString().slice(0,10)}.json`,'application/json');
  /* Ein Griff fuer alle Loeschknoepfe. Die Nachfrage sitzt am Knopf
   * selbst (`data-sicher`), damit zwei Knoepfe nebeneinander sich nicht
   * gegenseitig scharf machen. */
  s.querySelectorAll('[data-weg]').forEach(k=>k.onclick=async()=>{
    const id = k.dataset.weg, name = PROFILE[id].name;
    if (k.dataset.sicher!=='ja'){ k.dataset.sicher='ja';
      k.textContent=`Wirklich? Alles von ${name} löschen`; return; }
    await Ablage.profilLoeschen(id);
    for (const eb of EBENEN) await Ablage.loesche('fortschritt',`${id}:${eb.id}`).catch(()=>{});
    s.querySelector('#ausgabe').innerHTML=`<p class="unter">${name}: gelöscht.</p>`;
    // Wer sich selbst geloescht hat, kann hier nicht stehen bleiben - der
    // Kopf traegt den eigenen Namen und der Stand ist fort. Wer ein
    // ANDERES Profil geloescht hat, will die Zahlen daneben weiter sehen.
    setTimeout(()=>zeige(id===P.id ? profilwahl : elternbereich),schauPause(900));
  });
  return s;
}

/* ---------- Start --------------------------------------------------------- */

/**
 * Der alte Elternstand zieht zu Stephan um (N1).
 *
 * Er liegt unter `eltern:<ebene>` und waere nach der Umbenennung
 * unerreichbar - vorhanden, aber von nichts mehr gelesen. Das ist die
 * unangenehmste Sorte Datenverlust: nichts ist weg, es kommt nur nie
 * wieder zum Vorschein.
 *
 * Die Schluessel lassen sich nicht auflisten (`alles` gibt Werte, keine
 * Schluessel), also werden sie GEBAUT - aus `EBENEN`, die es ohnehin gibt.
 * Umgezogen wird nur, was drueben noch nicht steht: wer schon als Stephan
 * gespielt hat, verliert nichts.
 */
async function umzugEltern(){
  for (const eb of EBENEN) {
    const alt = `${ALTES_ELTERN}:${eb.id}`, neu = `${VERGLEICH[0]}:${eb.id}`;
    try {
      const stand = await Ablage.hole('fortschritt', alt);
      if (!stand) continue;
      if (!(await Ablage.hole('fortschritt', neu)))
        await Ablage.setze('fortschritt', neu, stand);
      await Ablage.loesche('fortschritt', alt);
    } catch(e){}
  }
}

/* Beim Start EINMAL - und ohne darauf zu warten.
 *
 * `zeige(profilwahl)` steht vor dem Gleichlauf und nicht dahinter: der
 * erste Bildschirm darf nicht an einem Netzaufruf haengen. Wer im Zug
 * startet, sieht die Profilwahl sofort; was aus dem Netz kommt, kommt
 * spaeter und aendert nur die Zahlen. */
(async ()=>{ await einstLaden(); await geuebtLaden(); await umzugEltern(); zeige(profilwahl);
  if (gleichlaufAn()) gleichlaufFahren(); })();
