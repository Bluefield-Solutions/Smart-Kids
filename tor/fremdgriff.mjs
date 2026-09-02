/* Der FREMDGRIFF — greift die Flaeche, auf der ein Wort steht, dieses Wort?
 *
 * Die Frage klingt selbstverstaendlich und ist es nicht. Zwischen den zwei
 * Pruefungen, die `passt` schon hatte, liegt ein Fall, den keine von ihnen
 * sieht und den man auch nicht SIEHT:
 *
 *   - „verdeckt" fragt nach der MITTE eines Knopfes. Die Mitte kann frei
 *     sein, waehrend die Ecke belegt ist.
 *   - „ueberlappen" sieht nur Elemente IM FLUSS. Was absolut liegt, liegt
 *     mit Absicht uebereinander - und faellt heraus.
 *   - Und ein durchsichtiger Knopf malt nichts. Sichtbar ist das Wort
 *     darunter, greifbar der Knopf darueber.
 *
 * Genau so war es beim Auge an der Ebenenkachel (Q18): es traegt seit Q16
 * keine Flaeche, seine Trefferflaeche blieb aber 44 Punkte und reichte bei
 * ALLEN NEUN Kacheln in die Namenszeile - bis zu 38 x 15 Punkte, ein
 * Drittel von „Mittelamerika". Siebzehn Tore waren gruen; gefunden hat es
 * das Auge.
 *
 * Gefragt wird deshalb nicht nach Kaesten, sondern nach dem, was ein Finger
 * TUT: an Punkten auf der Schrift eines bedienbaren Elements wird
 * `elementFromPoint` befragt. Antwortet ein ANDERES bedienbares Element,
 * ist der Griff fremd.
 *
 * Diese Datei ist der EINE Ort dafuer. Sie wird von `passt` (sieben Groessen,
 * 22 Bildschirme) und vom Rauchtest (die Bildschirme mitten in einer
 * Aufgabe, die `passt` nie sieht) benutzt - haette jeder seine eigene
 * Fassung, veraltete eine davon (Regel 6).
 *
 * Sie laeuft IN DER SEITE. Also keine Verweise nach draussen, keine
 * Modulvariablen, keine Grenzen von oben - alles steht im Rumpf.
 */

/** Wieviel Prozent eines Wortes unter fremdem Griff liegen duerfen.
 *
 * Anteilig, nicht absolut (Regel 2) - und nicht null: die Zeilenkaesten
 * einer Schrift enden auf Bruchteilen von Bildpunkten, und welcher Knopf
 * an so einer Kante antwortet, entscheidet die Rundung des jeweiligen
 * Chromium. Null waere keine Strenge, sondern eine Wette darauf. */
export const FREMD_ZU = 5;

/** Laeuft in der Seite. Gibt Befunde zurueck: `{ schluessel, meldung }` (leer = gut).
 *
 * Der Schluessel traegt keine Zahlen und ist deshalb ueber zwei Blicke
 * hinweg vergleichbar; die Meldung traegt ihre Messstelle mit (Regel 5). */
export function fremdgriff() {
  const FREMD_ZU = 5;   // dieselbe Zahl; die Seite sieht das Modul nicht
  const AUSWAHL = '.schirm.da button, .schirm.da .kachel, .schirm.da .etikett, '
    + '.schirm.da .knopf, .schirm.da .zi, .schirm.da .eingabe, .schirm.da .aufkleber';
  const bedien = [...document.querySelectorAll(AUSWAHL)];
  // Der Besitzer eines Punktes: das INNERSTE bedienbare Element darueber.
  const eignerVon = (el) => { while (el) { if (bedien.includes(el)) return el;
    el = el.parentElement; } return null; };
  const aus = [];
  for (const k of bedien) {
    const kb = k.getBoundingClientRect();
    if (kb.width < 2 || kb.height < 2) continue;
    // Die ZEILENKAESTEN der Schrift, nicht der Kasten des Elements: ein
    // `.name` ist kachelbreit, das Wort darin ist es nicht.
    const kaesten = [];
    const gehen = document.createTreeWalker(k, NodeFilter.SHOW_TEXT);
    for (let n = gehen.nextNode(); n; n = gehen.nextNode()) {
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const x of r.getClientRects())
        if (x.width > 2 && x.height > 2) kaesten.push(x);
    }
    let punkte = 0, fremd = 0; const wer = new Set(); let ersterFremder = null;
    for (const x of kaesten) for (let i = 0; i < 12; i++) for (let j = 0; j < 3; j++) {
      const px = x.left + x.width * (i + .5) / 12, py = x.top + x.height * (j + .5) / 3;
      if (px < 0 || py < 0 || px > innerWidth || py > innerHeight) continue;
      punkte++;
      const e = eignerVon(document.elementFromPoint(px, py));
      if (!e || e === k || k.contains(e) || e.contains(k)) continue;
      fremd++;
      ersterFremder = ersterFremder || e;
      wer.add('.' + (String(e.className || e.tagName).split(' ').join('.')));
    }
    if (!punkte) continue;
    const anteil = Math.round(fremd * 100 / punkte);
    if (anteil > FREMD_ZU) {
      /* Die Messstelle kommt MIT (Regel 5): welcher Knopf, welche Worte,
       * welche zwei Kaesten. Beim ersten Lauf meldete das Tor drei
       * Befunde als „greift .etikett" und „greift .leise" - und daran war
       * nicht zu erkennen, ob da wirklich ein Knopf falsch sitzt oder ob
       * gerade ein Etikett am Finger haengt. Eine Zahl ohne Messstelle
       * kostet genau diese Runde. */
      const kk = (r) => `${r.left.toFixed(0)}|${r.top.toFixed(0)}`
        + `–${r.right.toFixed(0)}|${r.bottom.toFixed(0)}`;
      const f = ersterFremder.getBoundingClientRect();
      const wort = (k.textContent.trim() || k.className).slice(0, 22).replace(/\s+/g, ' ');
      const fremderName = [...wer].join(', ');
      aus.push({
        /* Der SCHLUESSEL traegt keine Zahlen.
         *
         * Er entscheidet, ob zwei Blicke denselben Befund sehen - und
         * genau daran ist der erste Anlauf gescheitert: die Meldung trug
         * (richtigerweise, Regel 5) ihre Messstelle mit, und die
         * Bildpunkte aendern sich zwischen zwei Aufgaben immer. Zwei
         * Blicke sahen damit nie „dasselbe", und ein eingebauter Fehler
         * blieb unentdeckt, obwohl er in jedem einzelnen Blick dastand. */
        schluessel: `${wort}|${fremderName}`,
        meldung: `„${wort}" — ${anteil} % des Wortes greift `
          + `${fremderName} „${(ersterFremder.textContent || '').trim().slice(0, 18)
          .replace(/\s+/g, ' ')}" statt den eigenen Knopf `
          + `(erlaubt ${FREMD_ZU} %, ${fremd} von ${punkte} Punkten; `
          + `Schrift ${kaesten.map(kk).join(' ')} gegen Knopf ${kk(f)})`,
      });
    }
  }
  return aus;
}

/* Der BEOBACHTER — der Fremdgriff ohne Stationenliste (Q19).
 *
 * `passt` steuert vierzehn Bildschirme selbst an und prueft dort. Der
 * Rauchtest kommt an andere: die Aufgabe mit Karte und Etiketten, den
 * Hinweis nach einem Fehlversuch, das Lob, die Fahne mit dem Namen, den
 * Endbildschirm. Genau dort liegen die meisten Kaesten uebereinander.
 *
 * Er wird deshalb NICHT an Stationen aufgerufen. Eine Stationenliste ist
 * eine Stelle, an der man etwas vergessen kann, und dieses Verzeichnis hat
 * das mehrfach bezahlt - dieselbe Ueberlegung wie bei `ui.sync()` drueben:
 * lieber eine Ableitung als ein Schalter. Ein Beobachter in der Seite sieht
 * jedem Bildschirmwechsel zu und prueft selbst; wer morgen einen neuen
 * Bildschirm baut, traegt dafuer nichts ein.
 *
 * Gemessen wird nur im RUHENDEN Bild: waehrend einer Ueberblendung liegen
 * zwei Bildschirme uebereinander, und dann greift natuerlich der obere. Das
 * waere kein Befund, sondern ein Messfehler. Was uebersprungen wurde, wird
 * gezaehlt und ausgegeben - eine Pruefung, die nie zum Zug kam, meldet
 * sonst „nichts gefunden" und beweist nichts (Regel 1).
 *
 * Laeuft in der Seite. Erwartet `window.__fremdgriff`.
 */
export function griffBeobachter() {
  window.__griff = { meldungen: [], geprueft: 0, uebersprungen: 0, arten: {}, einmal: [] };
  const G = window.__griff;
  const gesehen = new Set();
  /* Ein Befund zaehlt erst, wenn er BLEIBT.
   *
   * Der erste Lauf meldete drei Fremdgriffe - „Bremen" und „Hessen" unter
   * einem anderen Etikett, „Brasilien" unter „Weiss ich nicht". Der
   * naechste Lauf meldete keinen einzigen davon. Ein Tor, das mal
   * anschlaegt und mal nicht, ist schlimmer als keines: es kostet jedes
   * Mal eine Untersuchung und beweist nie etwas.
   *
   * Der Grund ist die Sache selbst: waehrend das Kind ein Etikett zieht,
   * haengt es am Finger und liegt ueber den anderen. Das IST ein fremder
   * Griff - und zwar der richtige. Dasselbe gilt fuer den Augenblick, in
   * dem eine Antwortliste neu gesetzt wird.
   *
   * Ein Fehler in der Anordnung bleibt dagegen liegen. Also muss ein
   * Verdacht in ZWEI aufeinanderfolgenden Blicken dastehen, beide im
   * ruhenden Bild.
   */
  const verdacht = new Set();
  let letzteMarke = null;

  const pruefen = () => {
    const schirme = document.querySelectorAll('.schirm.da');
    // Am Finger haengt etwas: dann liegt es ueber allem, und das gehoert
    // sich so. Gemessen wird die Anordnung, nicht der Zug.
    if (document.querySelector('.schirm.da .zieht')
      || schirme.length !== 1
      || document.getAnimations().some(a => a.playState === 'running'
           && a.effect?.getTiming().iterations !== Infinity)) {
      /* Der Verdacht bleibt ueber einen uebersprungenen Blick hinweg
       * stehen.
       *
       * Der erste Anlauf loeschte ihn hier - und damit nie ein Befund
       * bestaetigt: waehrend gespielt wird, liegt zwischen zwei ruhenden
       * Bildern fast immer ein bewegtes. Der eingebaute Fehler (die
       * Werkzeugspalte 60 Punkte auf der Antwortliste) stand in JEDEM
       * einzelnen Blick da, wurde zweimal als Verdacht notiert und
       * zweimal wieder vergessen. Der Rauchtest meldete gruen.
       *
       * Zurueckgesetzt wird beim BILDSCHIRMWECHSEL - dort verliert ein
       * Verdacht seinen Gegenstand. Ein bewegtes Zwischenbild tut das
       * nicht. */
      G.uebersprungen++; return;
    }
    G.geprueft++;
    /* WELCHE Bildschirme gesehen wurden, nicht nur wieviele.
     *
     * „20 geprueft" beweist noch nicht, dass die Aufgabe darunter war -
     * und die ist der ganze Grund, warum diese Pruefung auch im Rauchtest
     * laeuft. `passt` steuert nur Wahlbildschirme an. */
    const s = schirme[0];
    const art = s.querySelector('.karte svg, .etikett, .zahl, .eingabe, .feldreihe') ? 'aufgabe'
              : s.querySelector('.kachel') ? 'wahl'
              : s.querySelector('.aufkleber') ? 'buch' : 'sonst';
    G.arten[art] = (G.arten[art] || 0) + 1;
    const marke = (s.className || 'Bildschirm').split(' ').slice(0, 2).join('.');
    if (marke !== letzteMarke) { verdacht.clear(); letzteMarke = marke; }
    const jetzt = new Map();
    for (const b of window.__fremdgriff())
      jetzt.set(`${marke}: ${b.schluessel}`, `${marke}: ${b.meldung}`);
    for (const [schluessel, zeile] of jetzt) {
      if (!verdacht.has(schluessel)) continue;   // erst einmal gesehen
      // Derselbe Befund steht auf zwoelf Aufgaben zwoelfmal. Einmal reicht.
      if (gesehen.has(schluessel) || gesehen.size >= 20) continue;
      gesehen.add(schluessel); G.meldungen.push(zeile);
      // Bestaetigt ist kein Verdacht mehr.
      G.einmal = G.einmal.filter(x => x !== schluessel);
    }
    verdacht.clear();
    for (const schluessel of jetzt.keys()) {
      verdacht.add(schluessel);
      // Auskunft, kein Befund: was EINMAL dastand und sich nicht
      // bestaetigt hat. Ohne diese Zahl waere nicht zu sehen, ob die
      // Bestaetigung etwas verschluckt - „nichts gefunden" saehe genauso
      // aus wie „alles wieder weggefiltert".
      if (!G.einmal.includes(schluessel) && G.einmal.length < 20)
        G.einmal.push(schluessel);
    }
  };

  /* Ein TAKT, kein Anstoss durch Aenderungen.
   *
   * Der erste Anlauf haengte die Pruefung an einen `MutationObserver`:
   * Bildschirm geaendert, kurz warten, nachsehen. Das klang sparsam und
   * hat schlecht getroffen - von rund zwoelf gespielten Aufgaben kamen
   * VIER unter den Blick, und welche vier, entschied der Zufall. Ein
   * eingebauter Fehler blieb dabei unentdeckt: die Werkzeugspalte lag 60
   * Punkte auf der Antwortliste, und der Rauchtest meldete gruen.
   *
   * Ein Takt trifft jeden Bildschirm, der stehenbleibt - und um genau die
   * geht es. Er kostet nichts: der Blick selbst sind wenige Millisekunden,
   * und im ruhenden Bild passiert ohnehin nichts anderes. */
  const start = () => setInterval(pruefen, 350);
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start);
  else start();
}
