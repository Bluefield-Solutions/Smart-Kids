/* Namensabgleich gegen eine GESCHLOSSENE Kandidatenmenge.
 *
 * Der eigentliche Trick liegt nicht in der Erkennung, sondern hier: wir
 * wissen zu jeder Aufgabe, welche drei bis sieben Antworten in Frage kommen.
 * Es muss also nicht erkannt werden, WAS gesagt wurde, sondern nur, welchem
 * der Woerter es am naechsten kommt.
 *
 * Fuenf Stufen (Konzept K3, Kapitel 6.2):
 *   1 normalisieren   2 Alias   3 Koelner Phonetik
 *   4 Levenshtein     5 Abstand zum Zweitbesten
 */

const FUELLWOERTER = /^(das ist|das hier ist|ich glaube|das heisst|das waere|aeh+|oeh?m+|hm+)\s+/;

export function normalisieren(s) {
  return (s || '').toLowerCase().trim()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(FUELLWOERTER, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Koelner Phonetik. Fuer Deutsch deutlich besser geeignet als Soundex, weil
 * sie auf die deutsche Aussprache gebaut ist: "Austraaljen" und "Australien"
 * bekommen denselben Code, "Meier" und "Mayr" auch.
 *
 * Regeln nach Postel 1969. Buchstaben ausserhalb A–Z werden uebersprungen.
 */
export function koelnerPhonetik(wort) {
  /* DIPHTHONGE zuerst - sonst verschwinden sie.
   *
   * Die Koelner Phonetik gibt jedem Vokal die 0 und streicht sie danach
   * bis auf die erste. „au" wird damit zu nichts, und „aussen" bekommt
   * denselben Code wie „Asien" (086). Genau diese Verwechslung rutscht
   * seit K1 durch den Abgleich: ein Kind sagt „aussen", das Spiel wertet
   * ASIEN als richtig.
   *
   * Ein Diphthong ist aber ein eigener Laut, kein Vokalpaar. Er bekommt
   * deshalb einen eigenen Code, der die Nullstreichung ueberlebt:
   *
   *   au           -> A    „aussen" ist nicht „Asien"
   *   eu, aeu, oi  -> 9    „Europa" IST „Oiropa" - dieselbe Zeile, weil
   *                        derselbe Laut. Genau dafuer ist die Phonetik da.
   *
   * „ei" und „ai" bleiben absichtlich draussen: im Deutschen stehen sie
   * oft NICHT fuer einen Diphthong („Uk-ra-i-ne"), und die Variante
   * „ukrajine" haengt daran. Gemessen: mit ihnen faellt sie durch.
   */
  const w = normalisieren(wort).replace(/ /g, '').toUpperCase()
    .replace(/AEU|EU|OI|OY/g, 'Ä')
    .replace(/AU/g, 'Ö');
  if (!w) return '';
  const codes = [];
  for (let i = 0; i < w.length; i++) {
    const z = w[i], vor = w[i - 1], nach = w[i + 1];
    let c = null;
    switch (z) {
      case 'A': case 'E': case 'I': case 'J': case 'O': case 'U': case 'Y': c = '0'; break;
      case 'B': c = '1'; break;
      case 'P': c = (nach === 'H') ? '3' : '1'; break;
      case 'D': case 'T': c = 'CSZ'.includes(nach) ? '8' : '2'; break;
      case 'F': case 'V': case 'W': c = '3'; break;
      case 'G': case 'K': case 'Q': c = '4'; break;
      case 'C':
        if (i === 0) c = 'AHKLOQRUX'.includes(nach) ? '4' : '8';
        else if ('SZ'.includes(vor)) c = '8';
        else c = 'AHKOQUX'.includes(nach) ? '4' : '8';
        break;
      case 'X': c = 'CKQ'.includes(vor) ? '8' : '48'; break;
      case 'L': c = '5'; break;
      case 'M': case 'N': c = '6'; break;
      case 'R': c = '7'; break;
      case 'S': case 'Z': c = '8'; break;
      case 'H': c = null; break;   // H erzeugt keinen Code
      case 'Ä': c = '9'; break;    // eu / aeu / oi - ein Laut, ein Code
      case 'Ö': c = 'A'; break;    // au - ein anderer
      default: c = null;
    }
    if (c !== null) codes.push(c);
  }
  // Doppelte zusammenziehen, dann alle Nullen ausser der ersten streichen.
  let s = codes.join('').replace(/(.)\1+/g, '$1');
  return s[0] + s.slice(1).replace(/0/g, '');
}

/**
 * Damerau-Levenshtein: wie Levenshtein, aber eine VERTAUSCHUNG zaehlt als
 * ein Schritt, nicht als zwei.
 *
 * Das ist kein Feinschliff. "Bayren" statt "Bayern" ist der haeufigste
 * Tippfehler eines Kindes, und mit reinem Levenshtein liegt er zwei Schritte
 * daneben - also gleich weit wie ein echtes falsches Wort. Die Rueckmeldung
 * waere "falsch" gewesen statt "fast".
 */
export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      const kosten = a[i-1] === b[j-1] ? 0 : 1;
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + kosten);
      if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1])
        d[i][j] = Math.min(d[i][j], d[i-2][j-2] + 1);   // Vertauschung
    }
  return d[m][n];
}
const relativ = (a, b) => levenshtein(a, b) / Math.max(a.length, b.length, 1);

/** Alle Schreibweisen eines Kandidaten. */
function formen(k) {
  return [k.name, ...(k.aliasse || []), ...(k.aussprache || [])]
    .filter(Boolean).map(normalisieren).filter(Boolean);
}

/**
 * Abstand einer Eingabe zu EINEM Kandidaten. Klein ist gut.
 * Gibt zusaetzlich den Laengenunterschied zurueck - der entscheidet, ob ein
 * Treffer sicher ist oder nur eine Rueckfrage wert.
 *
 * Die Laengenstrafe ist nicht Feinschliff. Ohne sie nimmt der Abgleich
 * "euro" fuer Europa, "bayer" fuer Bayern und "afrikaner" fuer Afrika an:
 * lauter kuerzere oder laengere Woerter, die klanglich fast gleich sind. Das
 * Tor `vergleich` hat dafuer 11,6 % Falsch-Positiv gemeldet.
 */
export function abstandZu(eingabe, k) {
  const e = normalisieren(eingabe);
  if (!e) return { d: 1, laenge: 1 };
  const eP = koelnerPhonetik(e);
  let best = 1, besteLaenge = 1;
  for (const f of formen(k)) {
    const laenge = Math.abs(e.length - f.length) / Math.max(e.length, f.length, 1);
    if (f === e) return { d: 0, laenge: 0 };                // Stufe 1/2: Treffer
    const buchstaben = relativ(e, f);
    const klang = eP && koelnerPhonetik(f) ? relativ(eP, koelnerPhonetik(f)) : 1;
    // Der Klang zaehlt mehr: ein Kind spricht richtig und schreibt falsch.
    const d = Math.min(buchstaben, 0.35 * buchstaben + 0.65 * klang) + 0.8 * laenge;
    if (d < best) { best = d; besteLaenge = laenge; }
  }
  return { d: best, laenge: besteLaenge };
}

export const GRENZE_ANNAHME = 0.34;   // darueber: gar nicht erst annehmen
export const GRENZE_SICHER  = 0.12;   // darunter: ohne Rueckfrage
export const ABSTAND_NOETIG = 0.14;   // Vorsprung vor dem Zweitbesten
export const GRENZE_NAH     = 0.22;   // Vorsprung allein genuegt nur bis hier
export const LAENGE_SICHER  = 0.15;   // darueber IMMER nur Rueckfrage

/**
 * Der Abgleich. Drei Ausgaenge statt zwei:
 *   { art:'angenommen' }  { art:'rueckfrage' }  { art:'nochmal' }
 *
 * Der mittlere ist der wichtigste: er verwandelt eine Erkennungsschwaeche in
 * eine Bestaetigungsfrage - und die kann ein Kind beantworten.
 */
export function abgleich(eingabe, kandidaten) {
  if (!normalisieren(eingabe)) return { art: 'nochmal', grund: 'leer' };
  const bewertet = kandidaten
    .map(k => { const r = abstandZu(eingabe, k); return { k, d: r.d, laenge: r.laenge }; })
    .sort((a, b) => a.d - b.d);
  const [erster, zweiter] = bewertet;
  if (!erster || erster.d > GRENZE_ANNAHME) return { art: 'nochmal', grund: 'zu weit' };
  const vorsprung = zweiter ? zweiter.d - erster.d : 1;
  // Ein Wort, das eine Silbe zu kurz oder zu lang ist, wird NIE ohne
  // Rueckfrage angenommen - auch wenn es klanglich passt. "Meintest du
  // Bayern?" ist die richtige Antwort auf "Bayer", nicht "richtig".
  /* Ein VORSPRUNG allein macht einen Treffer nicht sicher.
   *
   * Hier stand `erster.d <= GRENZE_SICHER || vorsprung >= ABSTAND_NOETIG`.
   * Der Vorsprung sagt aber nur „kein anderer Kandidat ist nah" - nicht
   * „dieser ist nah genug". In einer geschlossenen Menge ist das meistens
   * dasselbe; nicht aber, wenn jemand ein ANDERES echtes Wort sagt, das
   * zufaellig in der Naehe eines Kandidaten liegt.
   *
   * Gefunden beim Nachhoeren der Aussprachevarianten (R5): „Irak" wurde
   * glatt als IRAN angenommen. Zwei echte Nachbarlaender, ein Buchstabe
   * Unterschied bei vier - und der Rest Asiens ist weit weg, also war der
   * Vorsprung gross. Ein falsches Land wurde als richtig gewertet.
   *
   * `GRENZE_NAH` deckelt das: der Vorsprung zaehlt nur, solange der
   * Abstand selbst noch anstaendig ist. Daraufhin heisst die Antwort auf
   * „Irak" nicht mehr „richtig", sondern „Meintest du Iran?" - und genau
   * dafuer gibt es die Rueckfrage.
   *
   * Der Wert ist GEMESSEN, nicht gesetzt. Durchprobiert von 0,12 bis
   * 0,34 gegen den erfundenen Korpus: die Trefferquote bleibt ueberall
   * bei 100 %, der Falsch-Positiv-Anteil bei 2,3 %. Was sich aendert, ist
   * die Zahl der Rueckfragen (8 bei 0,12, 3 ab 0,22) und ob „Irak"
   * durchrutscht (ab 0,25 ja). 0,22 ist der groesste Wert, der ihn noch
   * faengt - also der, der am wenigsten Rueckfragen kostet. */
  const sicher = (erster.d <= GRENZE_SICHER
                  || (vorsprung >= ABSTAND_NOETIG && erster.d <= GRENZE_NAH))
                 && erster.laenge < LAENGE_SICHER;
  return {
    art: sicher ? 'angenommen' : 'rueckfrage',
    id: erster.k.id, name: erster.k.name,
    abstand: +erster.d.toFixed(3), vorsprung: +vorsprung.toFixed(3),
  };
}

/* ------------------------------------------------ Gehoertes (Fiona) ----- */

/* Wieviele Woerter ein Ausschnitt hoechstens hat.
 *
 * Der laengste Eintrag im Vorrat ist „Australien und Ozeanien" - drei
 * Woerter. Seit A5 ist das der ALIAS und nicht mehr der Name; erkannt
 * werden muss er weiterhin, also bleibt die Vier.
 * Vier laesst Luft fuer „Nordrhein Westfalen" mit einem verschluckten
 * Bindestrich, ohne dass halbe Saetze zu Kandidaten werden. */
export const FENSTER_MAX = 4;

/* Woerter, die NIE weggelassen werden duerfen.
 *
 * Sie sind keine Fuellwoerter, sondern das Gegenteil: die kleine, geschlossene
 * Klasse deutscher Erdkunde-Bestimmungswoerter. Genau sie trennen ein Gebiet
 * vom naechsten - Nordamerika von Suedamerika, Sudan von Sued-Sudan,
 * Afrika von Suedafrika, Korea von Nordkorea.
 *
 * Diese Liste ist der Waechter des Ausschnitts, und sie ist gemessen:
 * ohne sie nahm der Abgleich „sued sudan" als SUDAN an - ein echtes
 * Nachbarland, das es im Spiel nicht gibt, glatt als ein anderes gewertet.
 * Der Korpus hat es in demselben Lauf gemeldet, in dem der Ausschnitt
 * eingebaut wurde.
 *
 * Der Unterschied zur alten Fuellwortliste ist wichtig: DIE zaehlte auf,
 * was weggelassen werden darf - und war damit immer unvollstaendig, weil
 * niemand alle Redewendungen eines Kindes kennt. DIESE zaehlt auf, was
 * NICHT weggelassen werden darf, und diese Klasse ist klein und steht fest. */
const BESTIMMEND = new Set(['nord','noerdlich','sued','suedlich','ost','oestlich',
  'west','westlich','mittel','zentral','neu','alt','gross','klein','sankt','sant','san']);

/** Alle zusammenhaengenden Wortgruppen einer Aeusserung, laengste zuerst.
 *
 * Ein Ausschnitt faellt weg, sobald er ein bestimmendes Wort ABSCHNEIDET,
 * das direkt daneben steht: „sued | sudan" darf nicht zu „sudan" werden.
 * Weiter weg im Satz stoert es nicht - „im sueden ist das Afrika" soll
 * weiterhin gehen. */
function fenster(satz) {
  const w = normalisieren(satz).split(' ').filter(Boolean);
  const aus = [];
  for (let n = Math.min(FENSTER_MAX, w.length); n >= 1; n--)
    for (let i = 0; i + n <= w.length; i++) {
      if (BESTIMMEND.has(w[i - 1]) || BESTIMMEND.has(w[i + n])) continue;
      aus.push(w.slice(i, i + n).join(' '));
    }
  return aus;
}

const RANG = { angenommen: 0, rueckfrage: 1, nochmal: 2 };
const besser = (a, b) => RANG[a.art] !== RANG[b.art]
  ? RANG[a.art] < RANG[b.art]
  : (a.abstand ?? 1) < (b.abstand ?? 1);

/**
 * Der Abgleich fuer GESPROCHENES. Zwei Dinge, die `abgleich` nicht kann:
 *
 * 1. ES KOMMT EIN SATZ AN, KEIN WORT. Ein Diktiergeraet liefert „Ich glaube
 *    das ist Asien", nicht „Asien". `abgleich` faellt darueber, und zwar an
 *    seiner Laengenstrafe - genau der Strafe, die ihn sonst davor bewahrt,
 *    „euro" fuer Europa zu nehmen. Sie ist richtig und darf nicht weg;
 *    stattdessen bekommt jede zusammenhaengende Wortgruppe ihre Chance.
 *
 *    Die Fuellwortliste war der Versuch, dasselbe mit einer Liste zu loesen.
 *    Gemessen: von achtzehn wirklichkeitsnahen Aeusserungen fielen vier
 *    durch - „Ich glaube das ist Asien", „Afrika, glaube ich", „Ähm Europa",
 *    „äh, Afrika". Eine Liste kennt immer nur die Fuellwoerter, an die
 *    jemand gedacht hat; ein Ausschnitt braucht sie gar nicht zu kennen.
 *
 * 2. ES KOMMT MEHR ALS EINE LESART AN. Die Erkennung liefert bis zu drei
 *    Alternativen. Sie wurden angefordert und weggeworfen - dabei ist die
 *    zweite oft die richtige: die Menge ist geschlossen, wir muessen nicht
 *    raten, welche stimmt, wir koennen alle fragen.
 *
 * Die Laengenstrafe bleibt der Waechter: „amerika" allein wird gegen
 * „nordamerika" NICHT angenommen (Abstand 0,66 gegen die Grenze 0,34), und
 * genau deshalb macht ein Ausschnitt aus einem Satz keinen Treffer, den es
 * nicht gibt.
 *
 * Gibt zusaetzlich `gehoert` zurueck: den Ausschnitt, der gewonnen hat.
 * Ohne ihn kann niemand sehen, WARUM etwas angenommen wurde.
 */
export function hoerAbgleich(varianten, kandidaten) {
  const liste = (Array.isArray(varianten) ? varianten : [varianten])
    .map(v => (v || '').trim()).filter(Boolean);
  let best = { art: 'nochmal', grund: 'leer' }, gehoert = '';
  const gesehen = new Set();
  for (const v of liste)
    for (const stueck of fenster(v)) {
      if (!stueck || gesehen.has(stueck)) continue;
      gesehen.add(stueck);
      const r = abgleich(stueck, kandidaten);
      if (besser(r, best)) { best = r; gehoert = stueck; }
    }
  return { ...best, gehoert };
}

/* -------------------------------------------------- Tippen (Lea) -------- */

/**
 * Rechtschreibbewertung. Die Rechtschreibung IST der Lerninhalt - deshalb
 * sagt die Rueckmeldung, WAS falsch war, nicht nur DASS.
 *
 * Nimmt das GEBIET, nicht nur seinen Namen: sonst sind alle Aliasse beim
 * Tippen tot. Genau das ist passiert - ein Kind tippte "Australien", der
 * Kontinent heisst im Vorrat "Australien und Ozeanien", und "Australien"
 * stand als Alias da, wurde aber nie gelesen. Mit ihm fielen England,
 * Kongo, Amerika, Canada, Mexico, Tanzania und Bangladesh durch.
 *
 * Ein String wird weiterhin angenommen - dann gibt es eben nur einen Namen.
 */
export function rechtschreibung(eingabe, ziel) {
  const namen = typeof ziel === 'string'
    ? [ziel]
    : [ziel.name, ...(ziel.aliasse || [])].filter(Boolean);
  const e = (eingabe || '').trim();
  if (!e) return { urteil: 'leer' };
  if (!namen.length) return { urteil: 'falsch' };
  const haupt = namen[0];

  /* 1. Zeichen fuer Zeichen gleich - mit dem Namen oder einem Alias. */
  if (namen.includes(e)) return { urteil: 'richtig' };

  /* 2. Nur die Grossschreibung daneben.
     Das bleibt ein Hinweis und wird NICHT durchgewunken: dass Namen gross
     geschrieben werden, ist Lerninhalt und kein Tippfehler. Diese Pruefung
     steht bewusst VOR der lockeren unten - sonst rutschte "nordamerika"
     ueber den Alias "Nord Amerika" als richtig durch. */
  if (namen.some(n => n.toLowerCase() === e.toLowerCase()))
    return { urteil: 'fast', hinweis: 'Fast! Namen schreibt man groß.' };

  /* 3. Bindestrich, Leerzeichen, Umlautumschrift: RICHTIG.
     "Nord-Amerika", "Nord Amerika" und "Nordamerika" sind derselbe Name;
     "Aegypten" ist die uebliche Umschrift von "Ägypten". Wer einem Kind
     dafuer "fast" sagt, bringt ihm bei, dass es sich geirrt hat.
     Der Hinweis geht trotzdem mit - neben dem Haken, nicht statt seiner,
     und er nennt immer die HAUPTSCHREIBWEISE, nie den Alias. */
  const locker = (x) => normalisieren(x.replace(/[-\s]/g, ''));
  if (namen.some(n => locker(n) === locker(e))) {
    // Die Grossschreibung wird auch hier geprueft, nicht nur bei exakter
    // Uebereinstimmung: sonst gibt "baden-württemberg" einen Hinweis und
    // "badenwürttemberg" nicht - dieselbe Sache, zwei Antworten.
    if (e[0] === e[0].toLowerCase() && haupt[0] !== haupt[0].toLowerCase())
      return { urteil: 'fast', hinweis: 'Fast! Namen schreibt man groß.' };
    const fehlt = [...'äöüß'].find(u => haupt.toLowerCase().includes(u)
                                     && !e.toLowerCase().includes(u));
    if (fehlt) return { urteil: 'richtig',
      nebenbei: `Mit ${fehlt.toUpperCase()} ist es noch schöner: ${haupt}.` };
    if (haupt.replace(/\s/g, '') !== haupt.replace(/[-\s]/g, '')
        || e.includes('-') !== haupt.includes('-')
        || /\s/.test(e) !== /\s/.test(haupt))
      return { urteil: 'richtig', nebenbei: `Man schreibt es so: ${haupt}.` };
    return { urteil: 'richtig', nebenbei: `Man schreibt es so: ${haupt}.` };
  }

  /* 4. Ein Buchstabe daneben - die Stelle zeigen, nicht die Loesung.
     Gemessen gegen den AEHNLICHSTEN der zulaessigen Namen. */
  let nah = haupt, dNah = Infinity;
  for (const n of namen) {
    const d = levenshtein(e.toLowerCase(), n.toLowerCase());
    if (d < dNah) { dNah = d; nah = n; }
  }
  if (dNah <= Math.max(1, Math.floor(nah.length / 8))) {
    let i = 0; while (i < e.length && e[i].toLowerCase() === nah[i]?.toLowerCase()) i++;
    return { urteil: 'fast', stelle: i,
      hinweis: `Fast! Schau noch mal ab dem ${i + 1}. Buchstaben.` };
  }
  return { urteil: 'falsch' };
}

