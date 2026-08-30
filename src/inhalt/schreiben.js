/**
 * Schreiben - Buchstaben und (spaeter) Ziffern mit dem Finger.
 *
 * Nur fuer Fiona. Sie ist sechs und liest noch nicht; alles andere in
 * dieser App macht ihr das Abfragen leichter, das hier bringt ihr etwas
 * bei, das sie danach ueberall braucht.
 *
 * ------------------------------------------------------------------
 * EINE Quelle fuer Form und Messung
 * ------------------------------------------------------------------
 * Ein Zug steht als Pfadzeichenkette da - `M20 90 L50 10`. Dieselbe
 * Zeichenkette zeichnet das SVG auf dem Bildschirm UND wird hier
 * abgetastet, wenn gemessen wird, ob der Finger auf ihr geblieben ist.
 *
 * Der erste Entwurf hatte zwei Fassungen: Punktlisten zum Messen und
 * Pfade zum Zeichnen. Das ist genau die Falle aus Regel 6 - was zweimal
 * dasteht, veraltet einmal, und man saehe es nicht: die Vorlage auf dem
 * Bildschirm liefe langsam von der Vorlage weg, gegen die geprueft wird,
 * und das Kind bekaeme gesagt, es sei danebengefahren, obwohl es genau
 * auf der Linie war.
 *
 * Der Preis ist ein eigener Abtaster (`abtasten`), weil `getPointAtLength`
 * einen Browser braucht und das Tor in Node laeuft. Er kann M, L und Q -
 * mehr braucht kein Druckbuchstabe.
 *
 * ------------------------------------------------------------------
 * Der Kasten
 * ------------------------------------------------------------------
 * Alle Zuege leben in einem Kasten 0..100 x 0..100. Oben ist 10, die
 * Grundlinie 90. Alle Laengen und Toleranzen unten sind KASTENPUNKTE -
 * also Anteile dieses Kastens, nicht Bildschirmpunkte (Regel 5: jede Zahl
 * traegt ihre Messstelle). Auf dem iPhone quer ist die Schreibflaeche rund
 * 300 Bildpunkte hoch; ein Kastenpunkt sind dort also etwa 3 Bildpunkte.
 */

/** Der Kasten, in dem jeder Zug lebt. */
export const KASTEN = 100;

/**
 * Die grossen Druckbuchstaben, jeder als Folge von Zuegen.
 *
 * Gross und nicht klein: Fiona lernt in der Vorschule Grossbuchstaben,
 * sie haben keine Ober- und Unterlaengen und sind mit dem Finger in
 * wenigen Zuegen zu treffen. Klein- und Schreibschrift waeren eine eigene
 * Ebene, keine Fussnote hier.
 *
 * Die REIHENFOLGE der Zuege ist die Schreibreihenfolge, die Richtung
 * jedes Zuges seine Schreibrichtung. Beides wird beim Nachfahren
 * verlangt - dort ist es der Lerninhalt - und beim freien Schreiben nur
 * noch als Stichentscheid gewertet (siehe `erkennen`).
 *
 * `wort` ist das Merkwort. Fiona hoert „A wie Affe"; ein Buchstabenname
 * allein ist fuer sie ein Laut ohne Haken, an dem er haengenbleibt.
 */
export const BUCHSTABEN = [
  { zeichen:'A', wort:'Affe',      zuege:['M20 90 L50 10', 'M50 10 L80 90', 'M32 58 L68 58'] },
  { zeichen:'B', wort:'Baum',      zuege:['M30 10 L30 90', 'M30 10 Q70 10 70 30 Q70 50 30 50',
                                          'M30 50 Q75 50 75 70 Q75 90 30 90'] },
  { zeichen:'C', wort:'Clown',     zuege:['M75 25 Q50 5 35 25 Q20 50 35 75 Q50 95 75 75'] },
  { zeichen:'D', wort:'Drache',    zuege:['M30 10 L30 90', 'M30 10 Q75 15 75 50 Q75 85 30 90'] },
  { zeichen:'E', wort:'Elefant',   zuege:['M30 10 L30 90', 'M30 10 L75 10', 'M30 50 L65 50',
                                          'M30 90 L75 90'] },
  { zeichen:'F', wort:'Fisch',     zuege:['M30 10 L30 90', 'M30 10 L75 10', 'M30 50 L65 50'] },
  { zeichen:'G', wort:'Giraffe',   zuege:['M75 25 Q50 5 35 25 Q20 50 35 75 Q55 95 75 72 L75 55 L58 55'] },
  { zeichen:'H', wort:'Haus',      zuege:['M25 10 L25 90', 'M75 10 L75 90', 'M25 50 L75 50'] },
  { zeichen:'I', wort:'Igel',      zuege:['M50 10 L50 90'] },
  { zeichen:'J', wort:'Jäger',     zuege:['M65 10 L65 70 Q65 92 42 88 Q28 85 28 70'] },
  { zeichen:'K', wort:'Katze',     zuege:['M28 10 L28 90', 'M72 10 L32 52', 'M40 45 L75 90'] },
  { zeichen:'L', wort:'Löwe',      zuege:['M30 10 L30 90 L75 90'] },
  { zeichen:'M', wort:'Maus',      zuege:['M22 90 L22 10 L50 60 L78 10 L78 90'] },
  { zeichen:'N', wort:'Nase',      zuege:['M25 90 L25 10 L75 90 L75 10'] },
  { zeichen:'O', wort:'Ohr',       zuege:['M50 10 Q22 10 22 50 Q22 90 50 90 Q78 90 78 50 Q78 10 50 10'] },
  { zeichen:'P', wort:'Pferd',     zuege:['M30 90 L30 10', 'M30 10 Q72 10 72 32 Q72 54 30 54'] },
  { zeichen:'Q', wort:'Quelle',    zuege:['M50 10 Q22 10 22 50 Q22 90 50 90 Q78 90 78 50 Q78 10 50 10',
                                          'M58 68 L82 94'] },
  { zeichen:'R', wort:'Rakete',    zuege:['M30 90 L30 10', 'M30 10 Q72 10 72 32 Q72 52 30 52',
                                          'M45 52 L75 90'] },
  { zeichen:'S', wort:'Sonne',     zuege:['M74 26 Q66 8 46 12 Q26 16 30 36 Q34 52 55 56 '
                                        + 'Q76 60 74 74 Q72 92 48 90 Q30 88 26 72'] },
  { zeichen:'T', wort:'Tiger',     zuege:['M25 12 L75 12', 'M50 12 L50 90'] },
  { zeichen:'U', wort:'Uhr',       zuege:['M25 10 L25 62 Q25 90 50 90 Q75 90 75 62 L75 10'] },
  { zeichen:'V', wort:'Vogel',     zuege:['M25 10 L50 90 L75 10'] },
  { zeichen:'W', wort:'Wolke',     zuege:['M18 10 L32 90 L50 35 L68 90 L82 10'] },
  { zeichen:'X', wort:'Xylofon',   zuege:['M25 10 L75 90', 'M75 10 L25 90'] },
  { zeichen:'Y', wort:'Yak',       zuege:['M25 10 L50 50 L75 10', 'M50 50 L50 90'] },
  { zeichen:'Z', wort:'Zebra',     zuege:['M25 12 L75 12 L25 88 L75 88'] },
];

/* ---------------------------------------------------------------------
 * Der Abtaster: aus einer Pfadzeichenkette werden Punkte
 * ------------------------------------------------------------------ */

/** Ein Pfad in seine Stuecke zerlegt. Kennt M, L und Q - mehr nicht. */
function stuecke(pfad){
  const teile = String(pfad).match(/[MLQ]|-?\d+(?:\.\d+)?/g) || [];
  const aus = []; let i = 0, hier = null;
  const zahl = () => {
    const z = Number(teile[i++]);
    if (!Number.isFinite(z)) throw new Error(`Pfad „${pfad}": Zahl erwartet`);
    return z;
  };
  while (i < teile.length) {
    const befehl = teile[i++];
    if (befehl === 'M') hier = [zahl(), zahl()];
    else if (befehl === 'L') { const zu = [zahl(), zahl()]; aus.push({ von:hier, zu }); hier = zu; }
    else if (befehl === 'Q') {
      const c = [zahl(), zahl()], zu = [zahl(), zahl()];
      aus.push({ von:hier, c, zu }); hier = zu;
    } else throw new Error(`Pfad „${pfad}": „${befehl}" kenne ich nicht`);
  }
  if (!aus.length) throw new Error(`Pfad „${pfad}": kein einziges Stück`);
  return aus;
}

/** Ein Punkt auf einem Stueck, bei 0 <= t <= 1. */
function auf(s, t){
  if (!s.c) return [s.von[0] + (s.zu[0]-s.von[0])*t, s.von[1] + (s.zu[1]-s.von[1])*t];
  const u = 1 - t;
  return [u*u*s.von[0] + 2*u*t*s.c[0] + t*t*s.zu[0],
          u*u*s.von[1] + 2*u*t*s.c[1] + t*t*s.zu[1]];
}

const weit = (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1]);

/**
 * Einen Pfad in `n` gleich weit auseinanderliegende Punkte abtasten.
 *
 * Gleich weit nach BOGENLAENGE, nicht nach Parameter: bei einer Kurve
 * liegen gleiche t-Schritte am Bogen verschieden weit auseinander, und
 * die Deckungsmessung unten wuerde in den Kurven streng und auf den
 * Geraden nachlaessig - also ausgerechnet dort streng, wo ein Kind
 * ohnehin Muehe hat.
 */
export function abtasten(pfad, n = 32){
  const dicht = [];
  for (const s of stuecke(pfad)) {
    const schritte = s.c ? 48 : 8;
    for (let k = 0; k <= schritte; k++) {
      const p = auf(s, k/schritte);
      if (!dicht.length || weit(dicht[dicht.length-1], p) > 1e-9) dicht.push(p);
    }
  }
  const bis = [0];
  for (let i = 1; i < dicht.length; i++) bis.push(bis[i-1] + weit(dicht[i-1], dicht[i]));
  const ganz = bis[bis.length-1];
  if (!ganz) return Array.from({ length:n }, () => dicht[0].slice());
  const aus = []; let j = 0;
  for (let k = 0; k < n; k++) {
    const ziel = ganz * k / (n-1);
    while (j < bis.length-2 && bis[j+1] < ziel) j++;
    const spanne = bis[j+1] - bis[j];
    const t = spanne ? (ziel - bis[j]) / spanne : 0;
    aus.push([dicht[j][0] + (dicht[j+1][0]-dicht[j][0])*t,
              dicht[j][1] + (dicht[j+1][1]-dicht[j][1])*t]);
  }
  return aus;
}

/** Die Laenge eines Pfades in Kastenpunkten. */
export const laenge = (pfad) => {
  const p = abtasten(pfad, 128);
  let l = 0; for (let i = 1; i < p.length; i++) l += weit(p[i-1], p[i]);
  return l;
};

/* ---------------------------------------------------------------------
 * Nachfahren: ist der Finger auf der Linie geblieben?
 * ------------------------------------------------------------------ */

/**
 * Wie weit darf der Finger von der Linie weg sein - beim NACHFAHREN.
 *
 * Locker, so entschieden (W-B im Backlog): beim Nachfahren geht es darum,
 * die Bewegung zu lernen, nicht sie zu treffen. 14 Kastenpunkte sind auf
 * der Schreibflaeche des iPhones rund 42 Bildpunkte - etwa eine
 * Fingerkuppe links und rechts der Linie.
 *
 * Die Zahl ist vorlaeufig und ausdruecklich so gekennzeichnet: endgueltig
 * eingestellt wird sie an echten Zuegen von Fiona. Bis die vorliegen,
 * misst das Tor `schreiben` an absichtlich krummen Zuegen, die es selbst
 * erzeugt.
 */
export const TOLERANZ_NACH = 14;
/** Soviel der Vorlage muss beruehrt sein, sonst war es kein Nachfahren. */
export const DECKUNG_MIN = 0.85;

/**
 * Einen nachgefahrenen Zug bewerten.
 *
 * Vier Fragen, und alle vier muessen ja sagen:
 *
 *  - DECKUNG: ist die ganze Vorlage beruehrt worden?
 *  - ABWEICHUNG: ist der Finger auf der Linie geblieben?
 *  - ANFANG UND ENDE: hat er dort angefangen und dort aufgehoert, wo der
 *    Zug anfaengt und aufhoert?
 *  - RICHTUNG: ging es von vorn nach hinten? Beim Nachfahren ist das der
 *    Lerninhalt - ein A faengt oben an.
 *
 * Die letzten beiden Fragen sind teuer erkauft; das Tor hat sie gefunden:
 *
 * Die RICHTUNG stand zuerst als „der erste Punkt liegt naeher am Anfang
 * der Vorlage als an ihrem Ende". Bei O und Q ist der Anfang das Ende -
 * beide Abstaende sind gleich, „naeher" ist nie wahr, und die beiden
 * Buchstaben waren ueberhaupt nicht nachzufahren. Verglichen wird deshalb
 * der ganze Zug gegen die Vorlage, einmal vorwaerts und einmal rueckwaerts.
 *
 * Und die DECKUNG allein reicht nicht: sie zaehlt, wieviel der Vorlage in
 * Reichweite eines Fingers liegt, und bei einem KURZEN Zug reicht die
 * Toleranz weit. Der Querbalken des A ist 36 Kastenpunkte lang; wer die
 * Haelfte faehrt, deckt mit 14 Punkten Nachsicht 89 Prozent ab und war
 * „fertig". Vier Zuege verhielten sich so. Also muss der Finger auch dort
 * ankommen, wo der Zug endet.
 */
export function nachgefahren(pfad, punkte, toleranz = TOLERANZ_NACH){
  const vorlage = abtasten(pfad, 48);
  if (!punkte || punkte.length < 2)
    return { gut:false, deckung:0, abweichung:Infinity, richtig:false, ganz:false };
  const nah = (p, liste) => Math.min(...liste.map(q => weit(p, q)));
  const beruehrt = vorlage.filter(v => nah(v, punkte) <= toleranz).length;
  const deckung = beruehrt / vorlage.length;
  // Der GROESSTE Abstand, nicht der mittlere: ein Ausflug quer ueber das
  // Feld verschwindet im Mittel, ist aber genau das, was nicht gelten darf.
  const abweichung = Math.max(...punkte.map(p => nah(p, vorlage)));
  const meins = abtasten2(punkte, 24), soll = abtasten2(vorlage, 24);
  const richtig = mittelPaar(meins, soll) <= mittelPaar(meins, soll.slice().reverse());
  const ganz = weit(punkte[0], vorlage[0]) <= toleranz
            && weit(punkte[punkte.length-1], vorlage[vorlage.length-1]) <= toleranz;
  return { gut: deckung >= DECKUNG_MIN && abweichung <= toleranz && richtig && ganz,
           deckung, abweichung, richtig, ganz };
}

/* ---------------------------------------------------------------------
 * Erkennen: welcher Buchstabe ist das?
 * ------------------------------------------------------------------ */

/**
 * Alles auf denselben Kasten bringen - GLEICHMAESSIG.
 *
 * Gleichmaessig heisst: ein Faktor fuer beide Achsen. Der erste Entwurf
 * zog jede Achse einzeln auf volle Breite, und damit wurde aus einem
 * schmalen I ein Quadrat - I und O waren nicht mehr zu unterscheiden. Das
 * Seitenverhaeltnis IST ein Merkmal des Buchstabens.
 */
export function normieren(zuege){
  const alle = zuege.flat();
  if (!alle.length) return zuege;
  const xs = alle.map(p => p[0]), ys = alle.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const spanne = Math.max(x1-x0, y1-y0) || 1;
  const f = (KASTEN * 0.8) / spanne;
  // Mittig setzen, damit ein klein geschriebener Buchstabe nicht an der
  // Ecke klebt und dadurch schon deshalb weit weg liegt.
  const mx = (x0+x1)/2, my = (y0+y1)/2;
  return zuege.map(z => z.map(p => [ (p[0]-mx)*f + KASTEN/2, (p[1]-my)*f + KASTEN/2 ]));
}

/** Der mittlere Abstand von jedem Punkt in `a` zum naechsten in `b`. */
function einseitig(a, b){
  let s = 0;
  for (const p of a) { let m = Infinity;
    for (const q of b) { const d = weit(p, q); if (d < m) m = d; } s += m; }
  return s / a.length;
}

/** Wie verschieden sind zwei Punktwolken - unabhaengig von Zug und Richtung. */
const formAbstand = (a, b) => (einseitig(a, b) + einseitig(b, a)) / 2;

/** Aufschlag je Zug, den einer zuviel oder zuwenig hat. */
export const STRAFE_ZUGZAHL = 5;
/** Aufschlag, wenn ein Zug verkehrt herum geschrieben wurde. */
export const STRAFE_RICHTUNG = 1.5;
/** Aufschlag, wenn die Zuege in anderer Reihenfolge kamen. */
export const STRAFE_REIHENFOLGE = 1.5;

/**
 * Der Abstand zwischen dem, was geschrieben wurde, und einer Vorlage.
 *
 * Zwei Anteile, und beide sind noetig:
 *
 *  - die FORM (`formAbstand`) sieht nur die Punktwolke. Sie unterscheidet
 *    A von O, aber nicht M von W-auf-dem-Kopf.
 *  - die FOLGE vergleicht Zug gegen Zug, in der Reihenfolge und in der
 *    Richtung, in der geschrieben wurde. Sie ist es, die „Richtung,
 *    Reihenfolge, Anzahl" aus der Entscheidung W-A traegt.
 *
 * Richtung und Reihenfolge werden dabei als STICHENTSCHEID gewertet, nicht
 * als Veto: wer ein richtiges A von unten nach oben schreibt, hat ein A
 * geschrieben. Verlangt wird die Richtung dort, wo sie der Lerninhalt ist
 * - beim Nachfahren. Beim freien Schreiben kostet sie einen kleinen
 * Aufschlag, und der entscheidet nur, wenn die Form es nicht tut.
 */
export function abstandZu(zuege, vorlageZuege){
  const form = formAbstand(zuege.flat(), vorlageZuege.flat());
  const unterschied = Math.abs(zuege.length - vorlageZuege.length);
  if (unterschied) return form + STRAFE_ZUGZAHL * unterschied;

  // Gleich viele Zuege: jeden dem naechstliegenden zuordnen, gierig.
  // Bei hoechstens vier Zuegen je Buchstabe ist das dieselbe Zuordnung,
  // die eine vollstaendige Suche faende - und sie bleibt lesbar.
  const offen = vorlageZuege.map((v, i) => ({ v, i }));
  let summe = 0, verdreht = false;
  zuege.forEach((z, k) => {
    let beste = null, wert = Infinity;
    for (const kandidat of offen) {
      const a = abtasten2(z), b = abtasten2(kandidat.v);
      // Verkehrt herum geschrieben zaehlt, kostet aber seinen Aufschlag.
      const hier = Math.min(mittelPaar(a, b),
                            mittelPaar(a, b.slice().reverse()) + STRAFE_RICHTUNG);
      if (hier < wert) { wert = hier; beste = kandidat; }
    }
    if (beste.i !== k) verdreht = true;
    summe += wert;
    offen.splice(offen.indexOf(beste), 1);
  });
  const folge = summe / zuege.length;
  return (form + folge) / 2 + (verdreht ? STRAFE_REIHENFOLGE : 0);
}

/** Zwei Punktfolgen gleicher Laenge Punkt fuer Punkt vergleichen. */
function mittelPaar(a, b){
  let s = 0; for (let i = 0; i < a.length; i++) s += weit(a[i], b[i]);
  return s / a.length;
}
/** Eine Punktfolge auf feste Laenge bringen, gleich weit nach Bogenlaenge. */
function abtasten2(punkte, n = 24){
  if (punkte.length === n) return punkte;
  const bis = [0];
  for (let i = 1; i < punkte.length; i++) bis.push(bis[i-1] + weit(punkte[i-1], punkte[i]));
  const ganz = bis[bis.length-1];
  if (!ganz) return Array.from({ length:n }, () => punkte[0].slice());
  const aus = []; let j = 0;
  for (let k = 0; k < n; k++) {
    const ziel = ganz * k / (n-1);
    while (j < bis.length-2 && bis[j+1] < ziel) j++;
    const spanne = bis[j+1] - bis[j];
    const t = spanne ? (ziel - bis[j]) / spanne : 0;
    aus.push([punkte[j][0] + (punkte[j+1][0]-punkte[j][0])*t,
              punkte[j][1] + (punkte[j+1][1]-punkte[j][1])*t]);
  }
  return aus;
}

/** Die abgetasteten und genormten Zuege einer Vorlage - einmal gerechnet. */
const vorlagen = new Map();
export function vorlageZuege(zeichen){
  if (!vorlagen.has(zeichen)) {
    const b = BUCHSTABEN.find(x => x.zeichen === zeichen);
    if (!b) throw new Error(`Kein Zeichen „${zeichen}"`);
    vorlagen.set(zeichen, normieren(b.zuege.map(z => abtasten(z, 24))));
  }
  return vorlagen.get(zeichen);
}

/**
 * Bis hierher gilt es als derselbe Buchstabe - und soviel Vorsprung
 * braucht der Beste vor dem Zweiten.
 *
 * Zwei Schwellen und nicht eine, aus demselben Grund wie beim
 * Wortvergleich (`src/vergleich/vergleich.js`): ein Gekritzel liegt von
 * ALLEN Buchstaben weit weg - das faengt `ABSTAND_MAX`. Ein O dagegen
 * liegt einem Q sehr nah; wenn zwei Vorlagen fast gleich gut passen, ist
 * die Antwort nicht „das Naehere", sondern „ich bin mir nicht sicher" -
 * das faengt `VORSPRUNG_MIN`.
 *
 * Beide Zahlen sind GEMESSEN, nicht gegriffen. Gemessen woran (Regel 5):
 * an 1040 kuenstlich verkrummten Fassungen der 26 Vorlagen - Versatz,
 * Groesse, leichte Drehung, Zittern, und jeder vierte Zug bricht zu frueh
 * ab - gegen 400 Gekritzel aus zufaelligen Punktfolgen. Der Raum wurde
 * durchprobiert, bevor eine Zahl feststand:
 *
 *     Abstand  Vorsprung |  richtig erkannt  |  Gekritzel angenommen
 *        10       1.2    |       97 %        |       0,0 %
 *        11       1.2    |       97 %        |       0,3 %
 *        11       1.6    |       97 %        |       0,0 %
 *        13       1.2    |       97 %        |       7,0 %
 *        14       1.2    |       97 %        |      10,0 %
 *
 * Der erste Entwurf stand bei 13 und 1,2 - und haette jedes vierzehnte
 * Gekritzel zu einem Buchstaben erklaert. Die Tabelle zeigt, dass das
 * nichts eingebracht haette: von 13 auf 11 herunter kostet KEINEN einzigen
 * richtig erkannten Buchstaben. Blind nachjustieren heisst, durch ein
 * Schluesselloch zu schauen.
 *
 * `npm run schreiben` faehrt dieselbe Messung bei jedem Lauf und meldet,
 * wie knapp der schlechteste Fall war. Das Soll steht nicht hier, sondern
 * im Backlog - sonst wuerde die Schwelle so lange verschoben, bis das Tor
 * gruen ist, und das Tor pruefte sich selbst (Regel 3).
 */
export const ABSTAND_MAX = 11;
export const VORSPRUNG_MIN = 1.6;

/**
 * Welcher Buchstabe wurde geschrieben?
 *
 * `zuege` sind rohe Punktfolgen, so wie der Finger sie hinterlassen hat -
 * in beliebiger Groesse und an beliebiger Stelle. Zurueck kommt der beste
 * Treffer MIT seinen Zahlen, damit der Aufrufer (und das Tor) sehen, wie
 * sicher er ist.
 */
export function erkennen(zuege){
  const meine = normieren((zuege || []).filter(z => z && z.length > 1).map(z => abtasten2(z)));
  if (!meine.length) return { zeichen:null, abstand:Infinity, vorsprung:0, sicher:false, liste:[] };
  const liste = BUCHSTABEN
    .map(b => ({ zeichen:b.zeichen, abstand: abstandZu(meine, vorlageZuege(b.zeichen)) }))
    .sort((a, b) => a.abstand - b.abstand);
  const vorsprung = liste.length > 1 ? liste[1].abstand - liste[0].abstand : Infinity;
  return {
    zeichen: liste[0].zeichen,
    abstand: liste[0].abstand,
    vorsprung,
    sicher: liste[0].abstand <= ABSTAND_MAX && vorsprung >= VORSPRUNG_MIN,
    liste,
  };
}

/* ---------------------------------------------------------------------
 * Der Vorrat
 * ------------------------------------------------------------------ */

/**
 * Die 26 Buchstaben als Gegenstaende, so wie der Leitner sie erwartet.
 *
 * Von Natur aus begrenzt - 26, gezaehlt und nicht geschaetzt. Das ist die
 * Regel aus R4 (siehe Backlog Paragraf 5.2), und sie ist der Grund, warum
 * die Ziffern spaeter ZEHN Vorlagen bekommen und nicht zwanzig Zahlen.
 *
 * `name` ist ueberall sonst „die richtige Antwort" - hier der Buchstabe
 * selbst. `frage` ist, was im Forscherbuch gross im Kaestchen steht.
 */
export function vorrat(){
  return BUCHSTABEN.map(b => ({
    id: `bu:${b.zeichen}`,
    zeichen: b.zeichen,
    name: b.zeichen,
    frage: b.zeichen,
    wort: b.wort,
    zuege: b.zuege,
    aussprache: [b.zeichen.toLowerCase()],
    gesagt: `${b.zeichen} wie ${b.wort}. Fahre den Buchstaben nach.`,
    geloest: `Das ist ein ${b.zeichen}, wie ${b.wort}`,
  }));
}

/**
 * Derselbe Buchstabe, andere Frage: er wird ANGESAGT, nicht gezeigt (N3).
 *
 * Eine eigene Kennung (`di:` statt `bu:`) und damit ein eigener
 * Leitner-Stand - und das ist der ganze Grund, warum es eine zweite Ebene
 * ist und kein Schalter an der ersten: einen Buchstaben nachfahren zu
 * koennen heisst nicht, ihn aus dem Gehoer schreiben zu koennen. Waeren
 * es dieselben Gegenstaende, wuerde das eine Koennen fuer das andere
 * gutgeschrieben, und der Leitner haette einen Stand, den es nicht gibt.
 *
 * `zuege` bleibt dran, obwohl hier nichts nachgefahren wird: die Vorlage
 * wird gebraucht, wenn nach drei Fehlversuchen VORGEMACHT wird - und im
 * Forscherbuch ist der Aufkleber derselbe Buchstabe.
 *
 * Was in `gesagt` NICHT steht, ist so wichtig wie das, was dasteht: der
 * Satz nennt den Buchstaben, aber auf dem Bildschirm erscheint er nicht.
 * Sonst waere das Diktat ein Abmalen mit Ton.
 */
export function vorratDiktat(){
  return BUCHSTABEN.map(b => ({
    id: `di:${b.zeichen}`,
    zeichen: b.zeichen,
    name: b.zeichen,
    frage: b.zeichen,
    wort: b.wort,
    zuege: b.zuege,
    aussprache: [b.zeichen.toLowerCase()],
    gesagt: `Schreib ein ${b.zeichen}. ${b.zeichen} wie ${b.wort}.`,
    geloest: `Das ist ein ${b.zeichen}, wie ${b.wort}`,
  }));
}
