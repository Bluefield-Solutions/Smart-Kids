/* Die Flaggen (F1) - Bauanweisungen, kein Bild.
 *
 * WARUM KEINE BILDER: die App ist EINE Datei und laedt nichts nach. 69
 * Flaggen als Fotos waeren 69 Dateien; eingebacken waeren sie ein
 * Vielfaches des heutigen Buendels.
 *
 * WARUM AUCH KEINE PFADE wie bei den Tieren: eine Flagge ist keine
 * Zeichnung, sondern eine BAUANWEISUNG. „Drei Querstreifen: schwarz, rot,
 * gold" ist die ganze Wahrheit ueber die deutsche Flagge, und sie ist
 * neunzig Zeichen lang. Als Pfade waere dieselbe Auskunft zehnmal so
 * gross und nicht mehr zu lesen - und wer sie korrigieren wollte, muesste
 * Koordinaten rechnen statt Farben zu tauschen.
 *
 * DIE EINE STELLE, die eine Bauanweisung in Formen uebersetzt, ist
 * `flaggeTeile`. Sie hat ZWEI Abnehmer:
 *
 *   flaggeSvg    macht daraus ein Bild fuer den Bildschirm
 *   flaggeRaster macht daraus ein grobes Punktfeld fuer das Tor, das misst,
 *                ob sich zwei Flaggen zu aehnlich SEHEN
 *
 * Zwei getrennte Uebersetzungen waeren zwei Wahrheiten - und was zweimal
 * dasteht, veraltet einmal (Regel 6). Die
 * gemessene waere nicht die gezeigte: das Tor bezeugte dann eine Flagge,
 * die niemand zu sehen bekommt. Deshalb gibt es nur DREI Grundformen -
 * Rechteck, Scheibe, Vieleck -, und beide Abnehmer koennen alle drei
 * genau. Ein SVG-Pfad, den nur der Browser versteht, waere hier ein
 * blinder Fleck.
 *
 * DIE REIHENFOLGE IST DIE MALREIHENFOLGE. Was spaeter kommt, liegt oben.
 * Der Mond ist deshalb keine Sonderform, sondern eine Scheibe mit einer
 * zweiten Scheibe in Grundfarbe darueber - genau so, wie man ihn malt.
 *
 * EIN RAHMEN FUER ALLE: 0 0 48 32. Dieselbe Begruendung wie beim
 * Tierrahmen: eine Wand mit gemischten Seitenverhaeltnissen zeigt Flaggen
 * in verschiedenen Groessen, und dann ist die Groesse ein Hinweis auf die
 * Antwort statt auf gar nichts. Die Schweiz ist in Wirklichkeit
 * quadratisch - das ist eine Vereinfachung, sie steht im Vorlauf und wird
 * nicht verschwiegen.
 */

export const BREIT = 48, HOCH = 32;
export const RAHMEN = `0 0 ${BREIT} ${HOCH}`;

/* ---------- Die Grundformen ---------------------------------------------
 *
 * Drei, und mehr sollen es nicht werden: jede weitere muss von BEIDEN
 * Abnehmern genau gekonnt werden, und „genau" heisst beim Raster, dass ein
 * Punkt drin oder draussen ist. Ein Bezier ist das nicht. */

const rechteck = (x, y, b, h, farbe) => ({ form:'rechteck', x, y, b, h, farbe });
const scheibe  = (x, y, r, farbe)    => ({ form:'scheibe', x, y, r, farbe });
const vieleck  = (punkte, farbe)     => ({ form:'vieleck', punkte, farbe });

/** Ein Stern mit `zacken` Spitzen. Die erste zeigt nach oben. */
function sternPunkte(x, y, r, zacken = 5, innenAnteil = 0.382){
  const p = [];
  for (let i = 0; i < zacken * 2; i++) {
    const w = -Math.PI / 2 + (i * Math.PI) / zacken;
    const rr = i % 2 ? r * innenAnteil : r;
    p.push([+(x + rr * Math.cos(w)).toFixed(2), +(y + rr * Math.sin(w)).toFixed(2)]);
  }
  return p;
}

/** Ein Stern als fertige Form. */
const stern = (x, y, r, farbe, zacken = 5) =>
  vieleck(sternPunkte(x, y, r, zacken), farbe);

/* Die Sonne von Argentinien und Uruguay: eine Scheibe mit kurzen Strahlen.
 * Sechzehn Zacken mit flachem Innenradius - aus zwei Schritten Abstand
 * sieht das aus wie eine Sonne und nicht wie ein Stern, und genau darauf
 * kommt es an. */
const sonne = (x, y, r, farbe) => vieleck(sternPunkte(x, y, r, 16, 0.68), farbe);

/* Ein Wappen wird NICHT gezeichnet (Konzept 3.3).
 *
 * Sechs der 69 Flaggen unterscheiden sich von einer anderen nur durch ihr
 * Wappen. Ein Wappen zu zeichnen ist nicht moeglich; es wegzulassen macht
 * aus Mexiko Italien. Was bleibt, ist eine ANDEUTUNG an der richtigen
 * Stelle in der richtigen Farbe - und ob sie reicht, entscheidet kein
 * Auge, sondern das Tor `flaggen`: zwei Flaggen, die zusammen in einer
 * Auswahl stehen koennen, duerfen sich im Raster nicht zu aehnlich sehen.
 *
 * Die Form ist ein Schild, weil fast jedes dieser Wappen eines ist. */
function schild(x, y, b, h, farbe){
  const l = x - b / 2, r = x + b / 2, o = y - h / 2, u = y + h / 2;
  return vieleck([[l, o], [r, o], [r, u - h * 0.35],
    [x, u], [l, u - h * 0.35]], farbe);
}

/** Ein Kranz aus gleichen Sternen auf einem Kreis - die Fahne der Union. */
function sternKranz(x, y, kreis, wieviel, r, farbe){
  const aus = [];
  for (let i = 0; i < wieviel; i++) {
    const w = -Math.PI / 2 + (i * 2 * Math.PI) / wieviel;
    aus.push(stern(+(x + kreis * Math.cos(w)).toFixed(2),
                   +(y + kreis * Math.sin(w)).toFixed(2), r, farbe));
  }
  return aus;
}

/* ---------- Die Bauarten -------------------------------------------------
 *
 * Acht, und ein Notausgang. Der Notausgang (`eigen`) ist fuer die vier
 * Flaggen, die keiner Regel folgen - der Union Jack, Suedafrika,
 * Papua-Neuguinea, Groenland. Das Tor ZAEHLT sie: waechst die Zahl,
 * bedeutet das, dass die Formsprache nicht mehr passt, und dann gehoert
 * sie erweitert statt umgangen. */
export const BAUARTEN = ['einfarbig', 'streifen', 'nordkreuz', 'mittkreuz',
  'dreieck', 'schraeg', 'raute', 'viertel', 'eigen'];

/** Streifen mit Gewichten: `breiten` sind Anteile, nicht Punkte. */
function streifenTeile(farben, hoch, breiten){
  const g = breiten && breiten.length === farben.length
    ? breiten : farben.map(() => 1);
  const summe = g.reduce((a, b) => a + b, 0);
  const ganz = hoch ? BREIT : HOCH;
  const aus = [];
  let lauf = 0;
  for (let i = 0; i < farben.length; i++) {
    const dick = (g[i] / summe) * ganz;
    // Der LETZTE Streifen geht bis an den Rand. Ohne diese Zeile bleibt bei
    // neun Streifen (Griechenland, Uruguay) ein Rundungsspalt stehen, und
    // durch den scheint der Grund - im Raster ein Unterschied, im Bild ein
    // Haarstrich.
    const bis = i === farben.length - 1 ? ganz : lauf + dick;
    aus.push(hoch ? rechteck(+lauf.toFixed(3), 0, +(bis - lauf).toFixed(3), HOCH, farben[i])
                  : rechteck(0, +lauf.toFixed(3), BREIT, +(bis - lauf).toFixed(3), farben[i]));
    lauf = bis;
  }
  return aus;
}

/** Der Union Jack - dreimal gebraucht (GBR, AUS, NZL), also einmal gebaut. */
function unionJack(x, y, b, h){
  const blau = '#012169', weiss = '#FFFFFF', rot = '#C8102E';
  const t = [rechteck(x, y, b, h, blau)];
  // Die Schraegkreuze als vier Keile - ein Balken quer durch ein Rechteck
  // ist als Vieleck genau, als gedrehtes Rechteck waere er es nicht.
  const dW = h * 0.30, dR = h * 0.16;
  const schraeg = (farbe, d) => {
    t.push(vieleck([[x, y], [x + d, y], [x + b, y + h - d], [x + b, y + h],
                    [x + b - d, y + h], [x, y + d]], farbe));
    t.push(vieleck([[x + b, y], [x + b, y + d], [x + d, y + h], [x, y + h],
                    [x, y + h - d], [x + b - d, y]], farbe));
  };
  schraeg(weiss, dW); schraeg(rot, dR);
  // Das gerade Kreuz liegt OBEN - so ist es auf der Flagge auch.
  t.push(rechteck(x, y + h / 2 - h * 0.17, b, h * 0.34, weiss));
  t.push(rechteck(x + b / 2 - b * 0.10, y, b * 0.20, h, weiss));
  t.push(rechteck(x, y + h / 2 - h * 0.10, b, h * 0.20, rot));
  t.push(rechteck(x + b / 2 - b * 0.058, y, b * 0.116, h, rot));
  return t;
}

/**
 * Aus einer Bauanweisung werden Formen. Die EINE Stelle - siehe Kopf.
 *
 * Die Reihenfolge ist die Malreihenfolge: Grund, dann Aufsatz (Ecke,
 * Keil), dann Zeichen.
 */
export function flaggeTeile(bau){
  const t = [];
  const a = bau.art;

  if (a === 'einfarbig') t.push(rechteck(0, 0, BREIT, HOCH, bau.farben[0]));
  else if (a === 'streifen') t.push(...streifenTeile(bau.farben, bau.hoch, bau.breiten));
  else if (a === 'nordkreuz') {
    t.push(rechteck(0, 0, BREIT, HOCH, bau.grund));
    const d = HOCH * 0.22, mx = BREIT * 0.36;
    t.push(rechteck(0, HOCH / 2 - d / 2, BREIT, d, bau.kreuz));
    t.push(rechteck(mx - d / 2, 0, d, HOCH, bau.kreuz));
    // Islands und Norwegens Innenkreuz - ohne es waeren beide Daenemark
    // mit anderen Farben.
    if (bau.innen) {
      const i = d * 0.45;
      t.push(rechteck(0, HOCH / 2 - i / 2, BREIT, i, bau.innen));
      t.push(rechteck(mx - i / 2, 0, i, HOCH, bau.innen));
    }
  }
  else if (a === 'mittkreuz') {
    t.push(rechteck(0, 0, BREIT, HOCH, bau.grund));
    const l = HOCH * 0.62, d = HOCH * 0.20;
    t.push(rechteck(BREIT / 2 - l / 2, HOCH / 2 - d / 2, l, d, bau.kreuz));
    t.push(rechteck(BREIT / 2 - d / 2, HOCH / 2 - l / 2, d, l, bau.kreuz));
  }
  else if (a === 'dreieck') {
    t.push(...streifenTeile(bau.farben, bau.hoch, bau.breiten));
    const tief = (bau.keil.tief ?? 0.42) * BREIT;
    t.push(vieleck([[0, 0], [tief, HOCH / 2], [0, HOCH]], bau.keil.farbe));
  }
  else if (a === 'schraeg') {
    /* Die Mittellinie laeuft von links unten nach rechts oben, und ALLE
     * Baender liegen auf ihr. Der erste Entwurf hing sie an ihre
     * Unterkante - dann lag das schmale Band nicht in der Mitte des
     * breiten, sondern an dessen Rand, und aus dem gelben Streifen mit
     * rotem Saum wurde ein zweifarbiger Balken. */
    t.push(rechteck(0, 0, BREIT, HOCH, bau.grund));
    const y1 = HOCH * (bau.von ?? 1), y2 = HOCH * (bau.bis ?? 0);
    // Tansania ist zweifarbig geteilt: unter der Linie eine zweite Farbe.
    if (bau.zweit)
      t.push(vieleck([[0, y1], [BREIT, y2], [BREIT, HOCH], [0, HOCH]], bau.zweit));
    for (const b of bau.baender) {
      const d = b.breit * HOCH;
      t.push(vieleck([[0, y1 - d / 2], [BREIT, y2 - d / 2],
                      [BREIT, y2 + d / 2], [0, y1 + d / 2]], b.farbe));
    }
  }
  else if (a === 'raute') {
    t.push(rechteck(0, 0, BREIT, HOCH, bau.grund));
    const rb = BREIT * 0.38, rh = HOCH * 0.40;
    t.push(vieleck([[BREIT / 2, HOCH / 2 - rh], [BREIT / 2 + rb, HOCH / 2],
                    [BREIT / 2, HOCH / 2 + rh], [BREIT / 2 - rb, HOCH / 2]], bau.raute));
  }
  else if (a === 'viertel') {
    const [lo, ro, lu, ru] = bau.farben;
    t.push(rechteck(0, 0, BREIT / 2, HOCH / 2, lo));
    t.push(rechteck(BREIT / 2, 0, BREIT / 2, HOCH / 2, ro));
    t.push(rechteck(0, HOCH / 2, BREIT / 2, HOCH / 2, lu));
    t.push(rechteck(BREIT / 2, HOCH / 2, BREIT / 2, HOCH / 2, ru));
    if (bau.kreuz) {
      const d = HOCH * 0.16;
      t.push(rechteck(0, HOCH / 2 - d / 2, BREIT, d, bau.kreuz));
      t.push(rechteck(BREIT / 2 - d / 2, 0, d, HOCH, bau.kreuz));
    }
  }
  else if (a === 'eigen') t.push(...bau.teile());
  else throw new Error(`Unbekannte Bauart „${a}"`);

  // Die ECKE (Kanton) liegt ueber dem Grund und unter den Zeichen.
  if (bau.ecke) {
    const e = bau.ecke, b = (e.breit ?? 0.5) * BREIT, h = (e.hoch ?? 0.5) * HOCH;
    if (e.union) t.push(...unionJack(0, 0, b, h));
    else {
      t.push(rechteck(0, 0, b, h, e.farbe));
      if (e.kreuz) {
        const d = h * 0.22;
        t.push(rechteck(0, h / 2 - d / 2, b, d, e.kreuz));
        t.push(rechteck(b / 2 - d / 2, 0, d, h, e.kreuz));
      }
    }
  }

  for (const z of [].concat(bau.zeichen || [])) t.push(...zeichenTeile(z));
  return t;
}

/** Ein Zeichen wird zu Formen. Zwoelf Sorten, alle aus den drei Grundformen. */
function zeichenTeile(z){
  const x = (z.x ?? 0.5) * BREIT, y = (z.y ?? 0.5) * HOCH;
  const r = (z.gross ?? 0.3) * HOCH / 2;
  switch (z.form) {
    case 'scheibe': return [scheibe(x, y, r, z.farbe)];
    // Ein Ring ist zwei Scheiben - die zweite in Grundfarbe. Genau so malt
    // man ihn, und beide Abnehmer koennen es ohne Sonderfall.
    case 'ring': return [scheibe(x, y, r, z.farbe),
                         scheibe(x, y, r * (z.loch ?? 0.62), z.grund)];
    case 'stern': return [stern(x, y, r, z.farbe, z.zacken ?? 5)];
    case 'sterne': return (z.liste || []).map(([sx, sy, sr]) =>
      stern(sx * BREIT, sy * HOCH, (sr ?? z.gross ?? 0.14) * HOCH / 2, z.farbe));
    case 'kranz': return sternKranz(x, y, (z.kreis ?? 0.28) * HOCH, z.wieviel ?? 12,
      r, z.farbe);
    // Der Mond: eine Scheibe, und darueber eine versetzte in Grundfarbe.
    case 'mond': return [scheibe(x, y, r, z.farbe),
      scheibe(x + r * (z.biss ?? 0.34), y, r * (z.innen ?? 0.86), z.grund)];
    case 'sonne': return [sonne(x, y, r, z.farbe), scheibe(x, y, r * 0.55, z.farbe)];
    case 'ahorn': return [ahornblatt(x, y, r, z.farbe)];
    case 'schild': return [schild(x, y, r * (z.weit ?? 1.3), r * 1.8, z.farbe)];
    // Ein Vogel und ein Adler sind dieselbe Andeutung mit anderen Massen:
    // ein Koerper und zwei Schwingen. Mehr ist bei 48 Punkten Breite nicht
    // zu sehen, und mehr behauptet diese Form auch nicht.
    case 'vogel': return vogelTeile(x, y, r, z.farbe);
    case 'balken': return [rechteck(x - r, y - r * (z.dick ?? 0.3), r * 2,
      r * 2 * (z.dick ?? 0.3), z.farbe)];
    /* Ein liegendes Dreieck - Nicaragua, El Salvador, Guatemala fuehren
     * eines im Wappen, und es ist bei diesen dreien das EINZIGE, woran man
     * sie auseinanderhaelt: drei blau-weiss-blaue Querstreifen hat auch
     * Honduras. Der erste Entwurf setzte hier einen kleinen Stern in der
     * Grundfarbe; gemessen lagen Nicaragua und Honduras danach 0,035
     * auseinander, also praktisch gleich. Das Tor hat es gemeldet, bevor
     * es jemand gesehen hat. */
    /* Das Schachbrett (I12) - Kroatiens Wappen und das EINZIGE, woran es
       von den Niederlanden zu unterscheiden ist: rot-weiss-blau haben
       beide, in derselben Reihenfolge. Fuenf mal fuenf statt der echten
       dreizehn Reihen: bei 48 Punkten Breite ist ein Feld der echten
       Teilung ein halber Punkt breit, und fuenf ist das Feinste, was auf
       diesem Raster noch als Muster zu sehen ist statt als Grauwert. */
    /* Ein grosses Dreieck mit frei gesetzten Ecken (I12).
       Bosnien braucht eines von oben rechts nach unten links, und das
       Tor hatte recht, als es den Ausweg `art:'eigen'` verweigert hat:
       „dann ist nicht die Flagge besonders, sondern die Sprache zu eng".
       Die Ecken stehen in ANTEILEN der Flagge, damit die Form fuer jede
       naechste taugt und nicht fuer diese eine. */
    case 'keil': return [vieleck((z.punkte || []).map(([a, b]) =>
      [+(a * BREIT).toFixed(2), +(b * HOCH).toFixed(2)]), z.farbe)];
    case 'schach': {
      const n = z.felder ?? 5, k = (r * 2) / n, aus = [];
      aus.push(rechteck(x - r, y - r, r * 2, r * 2, z.grund ?? W));
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
        if ((i + j) % 2 === 0)
          aus.push(rechteck(x - r + i * k, y - r + j * k, k, k, z.farbe));
      return aus;
    }
    case 'dreieckchen': return [vieleck([[x, y - r],
      [x + r * 0.95, y + r * 0.65], [x - r * 0.95, y + r * 0.65]], z.farbe)];
    default: throw new Error(`Unbekanntes Zeichen „${z.form}"`);
  }
}

function ahornblatt(x, y, r, farbe){
  // Elf Spitzen, wie das echte Blatt - gezaehlt und nicht geschaetzt.
  const p = [[0, -1], [0.16, -0.55], [0.52, -0.62], [0.40, -0.28],
    [0.86, 0.06], [0.62, 0.14], [0.70, 0.46], [0.28, 0.36],
    [0.16, 0.44], [0.24, 1], [-0.24, 1], [-0.16, 0.44], [-0.28, 0.36],
    [-0.70, 0.46], [-0.62, 0.14], [-0.86, 0.06], [-0.40, -0.28],
    [-0.52, -0.62], [-0.16, -0.55]];
  return vieleck(p.map(([a, b]) => [+(x + a * r).toFixed(2), +(y + b * r).toFixed(2)]), farbe);
}

/* Ein Vogel mit AUSGEBREITETEN SCHWINGEN, Kopf und gegabeltem Schwanz.
 *
 * Der erste Entwurf war ein Dreieck mit zwei Ecken und sollte „Vogel"
 * heissen. Auf dem Bogen mit allen 69 sah man sofort, was er wirklich
 * war: ein PFEIL. Fuenf Flaggen trugen ihn - Aegypten, Uganda, Mexiko,
 * Guatemala, Ecuador -, und ein Kind haette gelernt, dass auf der
 * aegyptischen Flagge ein Pfeil steht.
 *
 * KEIN TOR HAT DAS GEMELDET, und keines haette es koennen: die Form war
 * da, gross genug, in der richtigen Farbe, und alle Abstaende stimmten.
 * Ob ein Bild das Richtige ZEIGT, sieht ein Auge: kein Tor ersetzt den
 * Blick (Regel 4). Deshalb wird
 * der Bogen gemalt und angesehen, bevor eine Flagge in die App geht. */
function vogelTeile(x, y, r, farbe){
  const p = [[0, -0.95], [0.18, -0.62], [0.60, -0.80], [1.30, -0.30],
    [0.62, -0.05], [0.30, 0.20], [0.42, 0.85], [0, 0.55],
    [-0.42, 0.85], [-0.30, 0.20], [-0.62, -0.05], [-1.30, -0.30],
    [-0.60, -0.80], [-0.18, -0.62]];
  return [vieleck(p.map(([a, b]) => [+(x + a * r).toFixed(2), +(y + b * r).toFixed(2)]),
    farbe)];
}

/* ---------- Die beiden Abnehmer ----------------------------------------- */

const alsPfad = (p) => 'M' + p.map(([x, y]) => `${x} ${y}`).join('L') + 'Z';

/**
 * JEDE Form wird zu einem PFAD - auch das Rechteck und die Scheibe.
 *
 * Nicht aus Ordnungsliebe, sondern weil es die MESSSTELLE ist. `passt`
 * misst ein Kachel-Wasserzeichen ueber `getBBox()` und `isPointInFill()`
 * je PFAD; ein `<rect>` und ein `<circle>` findet es gar nicht erst.
 * Die deutsche Flagge besteht aus drei Rechtecken - als `<rect>`
 * gezeichnet war sie fuer das Tor UNSICHTBAR, und der Lauf meldete
 * nichts. Nicht „gruen": nichts. Ein stiller Ausfall ist schlimmer als
 * ein roter Lauf.
 *
 * Dieselbe Lehre und dieselbe Zeile wie bei den Tieren und beim
 * Englischbild (E3), wo sie schon einmal eine Runde gekostet hat.
 *
 * Die Scheibe wird zu zwei Halbbogen. Das ist die uebliche Schreibweise
 * fuer einen Kreis als Pfad und exakt - kein genaehertes Vieleck.
 */
function alsPfadTeil(t){
  if (t.form === 'rechteck') {
    const x = +t.x.toFixed(2), y = +t.y.toFixed(2);
    const b = +t.b.toFixed(2), h = +t.h.toFixed(2);
    return `M${x} ${y}h${b}v${h}h${-b}Z`;
  }
  if (t.form === 'scheibe') {
    const x = +t.x.toFixed(2), y = +t.y.toFixed(2), r = +t.r.toFixed(2);
    return `M${+(x - r).toFixed(2)} ${y}a${r} ${r} 0 1 0 ${r * 2} 0`
         + `a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
  }
  return alsPfad(t.punkte);
}

/**
 * Das Bild.
 *
 * `preserveAspectRatio` bleibt auf der Voreinstellung: eine Flagge, die
 * zur Kachel verzerrt wird, ist eine andere Flagge - Monaco und Indonesien
 * unterscheiden sich um nichts anderes.
 */
export function flaggeSvg(a3, { klasse = 'flagge', titel = '' } = {}){
  const f = flaggeVon(a3);
  if (!f) return '';
  const inhalt = flaggeTeile(f.bau)
    .map(t => `<path d="${alsPfadTeil(t)}" fill="${t.farbe}"/>`).join('');
  /* Der RAND gehoert zur Flagge, nicht zum Stilblatt.
   *
   * Japan ist weiss mit einer roten Scheibe. Ohne Rand steht auf einer
   * weissen Karte eine rote Scheibe und sonst nichts - die Flagge hat
   * keine Kontur mehr, und das Kind sieht kein Rechteck. Das ist keine
   * Gestaltungsfrage, sondern die Sache selbst: eine Flagge ist ein
   * Rechteck. Deshalb hier und nicht in `vorlage.html`. */
  return `<svg class="${klasse}" viewBox="${RAHMEN}" role="img"`
    + (titel ? ` aria-label="${titel}"` : ' aria-hidden="true"')
    + `>${inhalt}<rect x="0.4" y="0.4" width="${BREIT - 0.8}" height="${HOCH - 0.8}"`
    + ' fill="none" stroke="rgba(0,0,0,.28)" stroke-width="0.8"/></svg>';
}

const imVieleck = (px, py, p) => {
  let drin = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
      drin = !drin;
  }
  return drin;
};

/**
 * Das Punktfeld fuer das Tor.
 *
 * Gemessen wird an den FORMEN, die auch gezeichnet werden - nicht an der
 * Bauanweisung. Zwei Bauanweisungen sind immer verschieden, sie stehen ja
 * in verschiedenen Zeilen; verschieden AUSSEHEN ist etwas anderes, und nur
 * das zaehlt (Regel 5: jede Zahl traegt ihre Messstelle mit).
 *
 * Gibt je Punkt ein `[r,g,b]` zurueck, Zeile fuer Zeile.
 */
export function flaggeRaster(bau, spalten = 24, zeilen = 16){
  const teile = flaggeTeile(bau);
  const aus = [];
  for (let zy = 0; zy < zeilen; zy++) {
    for (let zx = 0; zx < spalten; zx++) {
      const px = ((zx + 0.5) / spalten) * BREIT, py = ((zy + 0.5) / zeilen) * HOCH;
      let farbe = '#FFFFFF';
      // Von hinten nach vorne: was zuletzt gemalt wurde, liegt oben.
      for (const t of teile) {
        const drin = t.form === 'rechteck'
          ? px >= t.x && px < t.x + t.b && py >= t.y && py < t.y + t.h
          : t.form === 'scheibe'
          ? (px - t.x) ** 2 + (py - t.y) ** 2 <= t.r ** 2
          : imVieleck(px, py, t.punkte);
        if (drin) farbe = t.farbe;
      }
      aus.push(zuRgb(farbe));
    }
  }
  return aus;
}

export function zuRgb(hex){
  const h = String(hex).replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16),
          parseInt(h.slice(4, 6), 16)];
}

/**
 * Wie weit zwei Flaggen auseinanderliegen.
 *
 * ZWEI ZAHLEN, und die zweite ist die, auf die es ankommt:
 *
 *   mittel   der mittlere Farbabstand ueber alle Punkte
 *   anteil   der Anteil der Punkte, die sich DEUTLICH unterscheiden
 *
 * Der Mittelwert allein taugt hier nicht, und das ist gemessen und nicht
 * vermutet: China und Vietnam sind beide rot mit gelben Sternen und liegen
 * im Mittel 0,09 auseinander - dieselbe Zahl wie zwei Flaggen, die sich
 * ueberall ein bisschen unterscheiden. Fuer ein Kind sind das aber zwei
 * verschiedene Faelle: „ueberall ein bisschen anders" ist nicht zu
 * beantworten, „an EINER Stelle deutlich anders" schon - man schaut auf
 * den Stern.
 *
 * `anteil` misst genau das: wieviel Flaeche steht deutlich anders da.
 * Fuenfzehn von 384 Punkten sind ein Fleck, den man sieht.
 */
export function unterschied(a, b, spalten = 24, zeilen = 16){
  const ra = flaggeRaster(a, spalten, zeilen), rb = flaggeRaster(b, spalten, zeilen);
  let summe = 0, deutlich = 0;
  for (let i = 0; i < ra.length; i++) {
    const d = Math.sqrt((ra[i][0] - rb[i][0]) ** 2 + (ra[i][1] - rb[i][1]) ** 2
                      + (ra[i][2] - rb[i][2]) ** 2) / 441.673;
    summe += d;
    if (d > 0.25) deutlich++;
  }
  return { mittel: summe / ra.length, anteil: deutlich / ra.length };
}

/** Nur der Mittelwert - fuer Auskuenfte, nicht fuer Zusagen. */
export const abstand = (a, b, spalten, zeilen) => unterschied(a, b, spalten, zeilen).mittel;

/* ---------- Die Flaggen --------------------------------------------------
 *
 * 69 Stueck - genau die Laender, die `LAENDER` in `erdkunde.js` schon
 * haelt. Keine zweite Faktenliste: Name, Schreibweisen und Aussprache
 * stehen dort und werden dort gepflegt (Konzept 1.2). Hier steht NUR, wie
 * die Flagge aussieht. Das Tor `flaggen` haelt beide Listen nebeneinander
 * und meldet jedes Land ohne Flagge und jede Flagge ohne Land.
 *
 * DIE FARBEN STEHEN ROH DA und kommen nicht aus `marken.css` - dieselbe
 * Begruendung wie bei den Tieren und den Englischfarben: das ist keine
 * Gestaltung, sondern die Sache selbst. Eine deutsche Flagge, die im
 * Abendmodus grau wird, ist keine deutsche Flagge.
 *
 * Wo eine Farbe amtlich festgelegt ist, steht die amtliche. Wo ein
 * NACHBARLAND dieselbe Farbe in einem anderen Ton fuehrt - Rumaenien und
 * der Tschad, die Niederlande und Luxemburg -, steht der Ton, der sie
 * unterscheidet. Das ist keine Freiheit, sondern der Kern der Sache: genau
 * daran erkennt man sie.
 *
 * WIE GROSS EIN ZEICHEN IST, entscheidet nicht der Geschmack, sondern das
 * Tor. Sechs dieser Flaggen unterscheiden sich von einer anderen NUR durch
 * ihr Wappen; ist die Andeutung zu klein, sind es zwei gleiche Flaggen mit
 * verschiedenen Namen. `unterschied()` misst es, und die Zahlen im Bericht
 * sind die Abnahme. */

const W = '#FFFFFF', SW = '#000000';

export const FLAGGEN = [
  /* --- Europa: siebzehn, die tiefste Liste (Fokus der Familie) --------- */
  { a3:'DEU', bau:{ art:'streifen', farben:[SW, '#DD0000', '#FFCE00'] } },
  { a3:'GBR', bau:{ art:'eigen', teile:() => unionJack(0, 0, BREIT, HOCH) } },
  { a3:'FRA', bau:{ art:'streifen', hoch:true, farben:['#002395', W, '#ED2939'] } },
  { a3:'POL', bau:{ art:'streifen', farben:[W, '#DC143C'] } },
  { a3:'NLD', bau:{ art:'streifen', farben:['#AE1C28', W, '#21468B'] } },
  { a3:'BEL', bau:{ art:'streifen', hoch:true, farben:[SW, '#FAE042', '#ED2939'] } },
  { a3:'CZE', bau:{ art:'dreieck', farben:[W, '#D7141A'],
                    keil:{ farbe:'#11457E', tief:0.46 } } },
  { a3:'AUT', bau:{ art:'streifen', farben:['#ED2939', W, '#ED2939'] } },
  /* Die Schweiz ist in Wirklichkeit QUADRATISCH. Sie steht hier im selben
     Rahmen wie alle - siehe Kopf der Datei. Der Vorlauf sagt es. */
  { a3:'CHE', bau:{ art:'mittkreuz', grund:'#FF0000', kreuz:W } },
  { a3:'DNK', bau:{ art:'nordkreuz', grund:'#C8102E', kreuz:W } },
  /* Luxemburgs Blau ist HELLER als das niederlaendische, und das ist der
     ganze Unterschied zwischen den beiden Flaggen. Steht in `AEHNLICH`. */
  { a3:'LUX', bau:{ art:'streifen', farben:['#ED2939', W, '#00A1DE'] } },
  { a3:'ITA', bau:{ art:'streifen', hoch:true, farben:['#009246', W, '#CE2B37'] } },
  /* Spanien OHNE Wappen waere ein Streifenbild, das es sonst nirgends
     gibt - die Andeutung bleibt trotzdem, und sie sitzt LINKS, wo das
     Wappen sitzt, und nicht in der Mitte. */
  { a3:'ESP', bau:{ art:'streifen', farben:['#AA151B', '#F1BF00', '#AA151B'],
                    breiten:[1, 2, 1],
                    zeichen:{ form:'schild', x:0.30, y:0.5, gross:0.40, farbe:'#AD1519' } } },
  { a3:'UKR', bau:{ art:'streifen', farben:['#005BBB', '#FFD500'] } },
  /* Rumaeniens Blau ist DUNKLER als das des Tschad. Der ganze Unterschied. */
  { a3:'ROU', bau:{ art:'streifen', hoch:true, farben:['#002B7F', '#FCD116', '#CE1126'] } },
  { a3:'GRC', bau:{ art:'streifen',
                    farben:['#0D5EAF', W, '#0D5EAF', W, '#0D5EAF', W, '#0D5EAF', W, '#0D5EAF'],
                    ecke:{ breit:0.375, hoch:0.5555, farbe:'#0D5EAF', kreuz:W } } },

  /* --- Suedosteuropa: fuenf von sieben (I12) ---------------------------- *
   *
   * Mit der Karte aus I11 stand eine Flaggenkachel da, hinter der nichts
   * lag. Sieben Laender - und nur fuenf davon lassen sich auf 48 x 32
   * Punkten so zeichnen, dass sie von den anderen zu UNTERSCHEIDEN sind.
   *
   * Die Slowakei und Slowenien fehlen hier mit Absicht: sie stehen seit
   * F3 in `FLAGGEN_EXTRA` („nur zum Zeigen, nicht zum Fragen"), weil
   * beide dieselbe weiss-blau-rote Trikolore tragen wie Russland und sich
   * nur durch ein Wappen unterscheiden, das auf diesem Raster ein Fleck
   * ist. Das war gemessen, nicht gefuehlt, und es gilt weiter. Wer sie
   * fragbar machen will, muss das Raster aendern, nicht die Zeichnung -
   * und dann steht diese Entscheidung neu an.
   *
   * Kroatien ist der Grenzfall, der es geschafft hat: rot-weiss-blau hat
   * auch die Niederlande, in derselben Reihenfolge. Was die beiden
   * trennt, ist das Schachbrett - und deshalb ist es GROSS, viel groesser
   * als in Wirklichkeit. Eine Andeutung, die zu klein ist, macht aus zwei
   * Flaggen eine. */
  /* Serbiens Wappen ist GOLD und nicht rot, obwohl das echte Schild rot
     ist. Der Grund steht im Bild: ein rotes Schild auf dem roten
     Oberstreifen ist dort nicht da, und man sieht nur den Zipfel, der ins
     Blau ragt - eine Andeutung, die zur Haelfte unsichtbar ist, ist
     keine. Gold hebt sich von allen drei Streifen ab, und Gold ist die
     Krone, die auf dem echten Wappen sitzt. */
  { a3:'SRB', bau:{ art:'streifen', farben:['#C6363C', '#0C4076', W],
                    zeichen:{ form:'schild', x:0.33, y:0.5, gross:0.44,
                              farbe:'#EDB92E' } } },
  { a3:'HRV', bau:{ art:'streifen', farben:['#FF0000', W, '#171796'],
                    zeichen:{ form:'schach', x:0.5, y:0.5, gross:0.68,
                              farbe:'#FF0000', grund:W } } },
  /* Bosnien: blau, ein gelber Keil von oben rechts nach unten links, und
     eine Reihe weisser Sterne DIAGONAL an seiner langen Kante entlang -
     die einzige Diagonale unter allen Flaggen dieser App, und damit das,
     was sie unverwechselbar macht.
     Die echte Flagge zeigt neun Sterne, zwei davon halb ueber den Rand
     geschnitten. Hier sind es fuenf ganze: ein halber Stern auf 32
     Punkten Hoehe ist kein halber Stern, sondern ein Fleck. */
  { a3:'BIH', bau:{ art:'einfarbig', farben:['#002F6C'],
                    zeichen:[{ form:'keil', farbe:'#FECB00',
                               punkte:[[0.30, 0], [1, 0], [1, 1]] },
                             { form:'sterne', farbe:W,
                               liste:[[0.13, 0.10, 0.17], [0.305, 0.295, 0.17],
                                      [0.48, 0.49, 0.17], [0.655, 0.685, 0.17],
                                      [0.83, 0.88, 0.17]] }] } },
  /* Albanien: der Doppeladler ist auf diesem Raster ein Adler. Dieselbe
     Andeutung wie bei Mexiko und Guatemala, und dieselbe Ehrlichkeit -
     mehr behauptet die Form `vogel` nicht. */
  { a3:'ALB', bau:{ art:'einfarbig', farben:['#E41E20'],
                    zeichen:{ form:'vogel', gross:0.66, farbe:SW } } },
  { a3:'MKD', bau:{ art:'einfarbig', farben:['#D20000'],
                    zeichen:{ form:'sonne', gross:0.74, farbe:'#FFE600' } } },

  /* --- Asien: zwoelf --------------------------------------------------- */
  { a3:'IND', bau:{ art:'streifen', farben:['#FF9933', W, '#138808'],
                    zeichen:{ form:'ring', gross:0.32, farbe:'#000080', grund:W, loch:0.55 } } },
  /* China: fuenf Sterne OBEN LINKS. Vietnam hat einen grossen in der
     Mitte - beide rot, beide gelb. Nur die Lage haelt sie auseinander,
     also muss sie stimmen. */
  { a3:'CHN', bau:{ art:'einfarbig', farben:['#EE1C25'],
                    zeichen:[{ form:'stern', x:0.13, y:0.30, gross:0.40, farbe:'#FFDE00' },
                             { form:'sterne', farbe:'#FFDE00',
                               liste:[[0.27, 0.13, 0.14], [0.33, 0.26, 0.14],
                                      [0.33, 0.44, 0.14], [0.27, 0.57, 0.14]] }] } },
  { a3:'IDN', bau:{ art:'streifen', farben:['#CE1126', W] } },
  { a3:'PAK', bau:{ art:'streifen', hoch:true, farben:[W, '#01411C'], breiten:[1, 3],
                    zeichen:[{ form:'mond', x:0.60, y:0.5, gross:0.56, farbe:W,
                               grund:'#01411C', biss:0.30 },
                             { form:'stern', x:0.76, y:0.34, gross:0.22, farbe:W }] } },
  { a3:'BGD', bau:{ art:'einfarbig', farben:['#006A4E'],
                    zeichen:{ form:'scheibe', x:0.45, y:0.5, gross:0.58, farbe:'#F42A41' } } },
  { a3:'JPN', bau:{ art:'einfarbig', farben:[W],
                    zeichen:{ form:'scheibe', gross:0.60, farbe:'#BC002D' } } },
  { a3:'PHL', bau:{ art:'dreieck', farben:['#0038A8', '#CE1126'],
                    keil:{ farbe:W, tief:0.44 },
                    zeichen:{ form:'sonne', x:0.12, y:0.5, gross:0.30, farbe:'#FCD116' } } },
  { a3:'VNM', bau:{ art:'einfarbig', farben:['#DA251D'],
                    zeichen:{ form:'stern', gross:0.62, farbe:'#FFFF00' } } },
  { a3:'TUR', bau:{ art:'einfarbig', farben:['#E30A17'],
                    zeichen:[{ form:'mond', x:0.36, y:0.5, gross:0.54, farbe:W,
                               grund:'#E30A17', biss:0.32 },
                             { form:'stern', x:0.53, y:0.5, gross:0.24, farbe:W }] } },
  { a3:'IRN', bau:{ art:'streifen', farben:['#239F40', W, '#DA0000'],
                    zeichen:{ form:'schild', gross:0.34, weit:1.1, farbe:'#DA0000' } } },
  { a3:'THA', bau:{ art:'streifen',
                    farben:['#A51931', W, '#2D2A4A', W, '#A51931'],
                    breiten:[1, 1, 2, 1, 1] } },
  { a3:'MMR', bau:{ art:'streifen', farben:['#FECB00', '#34B233', '#EA2839'],
                    zeichen:{ form:'stern', gross:0.62, farbe:W } } },

  /* --- Afrika: zwoelf --------------------------------------------------- */
  { a3:'NGA', bau:{ art:'streifen', hoch:true, farben:['#008751', W, '#008751'] } },
  { a3:'ETH', bau:{ art:'streifen', farben:['#078930', '#FCDD09', '#DA121A'],
                    zeichen:[{ form:'scheibe', gross:0.70, farbe:'#0F47AF' },
                             { form:'stern', gross:0.46, farbe:'#FCDD09' }] } },
  { a3:'EGY', bau:{ art:'streifen', farben:['#CE1126', W, SW],
                    zeichen:{ form:'vogel', gross:0.34, farbe:'#C09300' } } },
  { a3:'COD', bau:{ art:'schraeg', grund:'#007FFF', von:0.92, bis:0.08,
                    baender:[{ farbe:'#CE1021', breit:0.34 },
                             { farbe:'#F7D618', breit:0.20 }],
                    zeichen:{ form:'stern', x:0.13, y:0.20, gross:0.38, farbe:'#F7D618' } } },
  { a3:'TZA', bau:{ art:'schraeg', grund:'#1EB53A', zweit:'#00A3DD',
                    von:1, bis:0,
                    baender:[{ farbe:'#FCD116', breit:0.36 }, { farbe:SW, breit:0.24 }] } },
  { a3:'ZAF', bau:{ art:'eigen', teile:() => suedafrika() } },
  { a3:'KEN', bau:{ art:'streifen', farben:[SW, W, '#BB0000', W, '#006600'],
                    breiten:[5, 1, 5, 1, 5],
                    zeichen:{ form:'schild', gross:0.50, weit:0.75, farbe:'#BB0000' } } },
  { a3:'UGA', bau:{ art:'streifen',
                    farben:[SW, '#FCDC04', '#D90000', SW, '#FCDC04', '#D90000'],
                    zeichen:[{ form:'scheibe', gross:0.56, farbe:W },
                             { form:'vogel', gross:0.22, farbe:'#9CA69C' }] } },
  { a3:'DZA', bau:{ art:'streifen', hoch:true, farben:['#006233', W],
                    zeichen:[{ form:'mond', x:0.50, y:0.5, gross:0.54, farbe:'#D21034',
                               grund:W, biss:0.34 },
                             { form:'stern', x:0.63, y:0.5, gross:0.24, farbe:'#D21034' }] } },
  { a3:'SDN', bau:{ art:'dreieck', farben:['#D21034', W, SW],
                    keil:{ farbe:'#007229', tief:0.40 } } },
  { a3:'MAR', bau:{ art:'einfarbig', farben:['#C1272D'],
                    zeichen:{ form:'stern', gross:0.58, farbe:'#006233' } } },
  { a3:'AGO', bau:{ art:'streifen', farben:['#CE1126', SW],
                    zeichen:{ form:'ring', gross:0.36, farbe:'#FFCB00', grund:SW,
                              loch:0.5 } } },

  /* --- Nordamerika: vier ------------------------------------------------ */
  { a3:'USA', bau:{ art:'streifen',
                    farben:['#B22234', W, '#B22234', W, '#B22234', W, '#B22234',
                            W, '#B22234', W, '#B22234', W, '#B22234'],
                    ecke:{ breit:0.40, hoch:0.5385, farbe:'#3C3B6E' },
                    zeichen:{ form:'sterne', farbe:W,
                      liste:[[0.06, 0.07, 0.09], [0.14, 0.07, 0.09], [0.22, 0.07, 0.09],
                             [0.30, 0.07, 0.09], [0.10, 0.17, 0.09], [0.18, 0.17, 0.09],
                             [0.26, 0.17, 0.09], [0.06, 0.27, 0.09], [0.14, 0.27, 0.09],
                             [0.22, 0.27, 0.09], [0.30, 0.27, 0.09], [0.10, 0.37, 0.09],
                             [0.18, 0.37, 0.09], [0.26, 0.37, 0.09], [0.06, 0.47, 0.09],
                             [0.14, 0.47, 0.09], [0.22, 0.47, 0.09], [0.30, 0.47, 0.09]] } } },
  { a3:'MEX', bau:{ art:'streifen', hoch:true, farben:['#006847', W, '#CE1126'],
                    zeichen:{ form:'vogel', gross:0.40, farbe:'#7B5B2E' } } },
  { a3:'CAN', bau:{ art:'streifen', hoch:true, farben:['#FF0000', W, '#FF0000'],
                    breiten:[1, 2, 1],
                    zeichen:{ form:'ahorn', gross:0.70, farbe:'#FF0000' } } },
  { a3:'GRL', bau:{ art:'eigen', teile:() => groenland() } },

  /* --- Mittelamerika: neun ---------------------------------------------- */
  /* VIER blau-weiss-blaue Querstreifen stehen hier nebeneinander:
     Honduras, Nicaragua, El Salvador, Guatemala (senkrecht). Sie sind in
     Wirklichkeit schwer zu unterscheiden, und genau deshalb muss die
     Andeutung in der Mitte GROSS genug sein - sonst ist die Aufgabe nicht
     zu beantworten, statt nur schwer. Das Tor rechnet es nach. */
  { a3:'GTM', bau:{ art:'streifen', hoch:true, farben:['#4997D0', W, '#4997D0'],
                    zeichen:{ form:'vogel', gross:0.42, farbe:'#4E7C3A' } } },
  { a3:'HTI', bau:{ art:'streifen', farben:['#00209F', '#D21034'],
                    zeichen:[{ form:'balken', gross:0.40, dick:0.72, farbe:W },
                             { form:'schild', gross:0.18, farbe:'#D21034' }] } },
  { a3:'CUB', bau:{ art:'dreieck',
                    farben:['#002A8F', W, '#002A8F', W, '#002A8F'],
                    keil:{ farbe:'#CF142B', tief:0.42 },
                    zeichen:{ form:'stern', x:0.13, y:0.5, gross:0.30, farbe:W } } },
  { a3:'DOM', bau:{ art:'viertel',
                    farben:['#002D62', '#CE1126', '#CE1126', '#002D62'], kreuz:W,
                    zeichen:{ form:'schild', gross:0.24, farbe:'#008000' } } },
  { a3:'HND', bau:{ art:'streifen', farben:['#0073CF', W, '#0073CF'],
                    zeichen:{ form:'sterne', farbe:'#0073CF',
                      liste:[[0.50, 0.50, 0.19], [0.39, 0.41, 0.19], [0.61, 0.41, 0.19],
                             [0.39, 0.59, 0.19], [0.61, 0.59, 0.19]] } } },
  { a3:'NIC', bau:{ art:'streifen', farben:['#0067C6', W, '#0067C6'],
                    zeichen:{ form:'dreieckchen', gross:0.50, farbe:'#0067C6' } } },
  { a3:'SLV', bau:{ art:'streifen', farben:['#0F47AF', W, '#0F47AF'],
                    zeichen:{ form:'dreieckchen', gross:0.50, farbe:'#C6A700' } } },
  { a3:'CRI', bau:{ art:'streifen',
                    farben:['#002B7F', W, '#CE1126', W, '#002B7F'],
                    breiten:[1, 1, 2, 1, 1] } },
  { a3:'PAN', bau:{ art:'viertel', farben:[W, '#DA121A', '#072357', W],
                    zeichen:{ form:'sterne', farbe:'#072357',
                      liste:[[0.25, 0.25, 0.24], [0.75, 0.75, 0.24]] } } },

  /* --- Australien: drei ------------------------------------------------- */
  { a3:'AUS', bau:{ art:'einfarbig', farben:['#00008B'],
                    ecke:{ breit:0.5, hoch:0.5, union:true },
                    zeichen:{ form:'sterne', farbe:W,
                      liste:[[0.25, 0.78, 0.22], [0.72, 0.28, 0.15], [0.82, 0.52, 0.15],
                             [0.72, 0.76, 0.15], [0.62, 0.52, 0.15], [0.74, 0.52, 0.10]] } } },
  { a3:'PNG', bau:{ art:'eigen', teile:() => papua() } },
  /* Neuseeland: VIER rote Sterne, Australien SECHS weisse. Das ist der
     ganze Unterschied, und deshalb steht das Paar in `AEHNLICH`. */
  { a3:'NZL', bau:{ art:'einfarbig', farben:['#00247D'],
                    ecke:{ breit:0.5, hoch:0.5, union:true },
                    zeichen:{ form:'sterne', farbe:'#CC142B',
                      liste:[[0.74, 0.24, 0.20], [0.87, 0.52, 0.20],
                             [0.74, 0.80, 0.20], [0.61, 0.52, 0.20]] } } },

  /* --- Suedamerika: zwoelf ---------------------------------------------- */
  { a3:'BRA', bau:{ art:'raute', grund:'#009C3B', raute:'#FFDF00',
                    zeichen:{ form:'scheibe', gross:0.48, farbe:'#002776' } } },
  { a3:'COL', bau:{ art:'streifen', farben:['#FCD116', '#003893', '#CE1126'],
                    breiten:[2, 1, 1] } },
  { a3:'ARG', bau:{ art:'streifen', farben:['#74ACDF', W, '#74ACDF'],
                    zeichen:{ form:'sonne', gross:0.40, farbe:'#F6B40E' } } },
  { a3:'PER', bau:{ art:'streifen', hoch:true, farben:['#D91023', W, '#D91023'] } },
  { a3:'VEN', bau:{ art:'streifen', farben:['#FFCC00', '#00247D', '#CF0821'],
                    zeichen:{ form:'sterne', farbe:W,
                      liste:[[0.31, 0.45, 0.12], [0.40, 0.41, 0.12], [0.49, 0.39, 0.12],
                             [0.58, 0.41, 0.12], [0.67, 0.45, 0.12], [0.41, 0.53, 0.12],
                             [0.57, 0.53, 0.12], [0.49, 0.56, 0.12]] } } },
  /* Chile stand zuerst als `eigen` da. Das Tor hat es gezaehlt und
     abgelehnt - zu Recht: es ist ein Zweistreifer mit einem Kanton, und
     genau das kann die Formsprache. Der Notausgang war Bequemlichkeit,
     kein Sonderfall. */
  { a3:'CHL', bau:{ art:'streifen', farben:[W, '#D52B1E'],
                    ecke:{ breit:0.3333, hoch:0.5, farbe:'#0039A6' },
                    zeichen:{ form:'stern', x:0.1667, y:0.25, gross:0.34, farbe:W } } },
  /* Ecuador ist Kolumbien mit Wappen - dieselben Streifen, dieselben
     Breiten. Die Andeutung ist deshalb GROSS und liegt mittig, wo das
     Wappen liegt. Gemessen lagen die beiden zuerst 0,06 auseinander. */
  { a3:'ECU', bau:{ art:'streifen', farben:['#FFDD00', '#0F47AF', '#CE1126'],
                    breiten:[2, 1, 1],
                    zeichen:{ form:'vogel', gross:0.46, farbe:'#7F5000' } } },
  { a3:'BOL', bau:{ art:'streifen', farben:['#D52B1E', '#F9E300', '#007934'],
                    zeichen:{ form:'schild', gross:0.28, farbe:'#8B5A2B' } } },
  { a3:'PRY', bau:{ art:'streifen', farben:['#D52B1E', W, '#0038A8'],
                    zeichen:{ form:'ring', gross:0.30, farbe:'#009B3A', grund:W,
                              loch:0.55 } } },
  { a3:'URY', bau:{ art:'streifen',
                    farben:[W, '#0038A8', W, '#0038A8', W, '#0038A8', W, '#0038A8', W],
                    ecke:{ breit:0.4167, hoch:0.5555, farbe:W },
                    zeichen:{ form:'sonne', x:0.21, y:0.28, gross:0.34, farbe:'#F6B40E' } } },
  { a3:'GUY', bau:{ art:'eigen', teile:() => guyana() } },
  { a3:'SUR', bau:{ art:'streifen',
                    farben:['#377E3F', W, '#B40A2D', W, '#377E3F'],
                    breiten:[2, 1, 4, 1, 2],
                    zeichen:{ form:'stern', gross:0.48, farbe:'#ECC81D' } } },
  /* --- I5: die Flaggen zu den Laendern aus I3 --------------------------
   *
   * I3 hat 45 Laender aus den schon gebackenen Umrissen geholt; ihre
   * Flaggen gab es nicht, denn die werden hier GEZEICHNET. Was jetzt
   * folgt, ist derselbe Formenvorrat wie oben - keine neue Bauart, keine
   * Sonderfaelle. Wo eine Flagge im Original ein Wappen traegt, steht
   * hier die Form, die bei 48 Punkten Breite ueberhaupt zu sehen ist: ein
   * Schild, eine Sonne, ein Stern. Mehr behauptet die Zeichnung nicht.
   *
   * Was NICHT hier steht, steht mit Grund nicht hier: Nepal (kein
   * Rechteck), Sri Lanka und Kambodscha (ein Wappen, das seine Form
   * traegt) und der Jemen (rot-weiss-schwarz ohne Zeichen - im Raster
   * nicht von Syrien und dem Irak zu trennen). Ein Land ohne Flagge steht
   * auf den Kartenebenen und nicht auf den Flaggenebenen; `flaggeFragbar`
   * siebt danach. */

  // --- Europa ---
  { a3:'PRT', bau:{ art:'streifen', hoch:true, farben:['#046A38', '#DA291C'],
      breiten:[2, 3],
      zeichen:{ form:'ring', x:0.4, y:0.5, gross:0.52, farbe:'#FFE900',
                grund:'#DA291C' } } },
  { a3:'SWE', bau:{ art:'nordkreuz', grund:'#006AA7', kreuz:'#FECC00' } },
  { a3:'FIN', bau:{ art:'nordkreuz', grund:W, kreuz:'#003580' } },
  { a3:'HUN', bau:{ art:'streifen', farben:['#CD2A3E', W, '#00A550'] } },
  /* Bulgariens Gruen und Ungarns Gruen stehen HELLER da, als die
     Faehnchenbuecher sie fuehren - und das ist gemessen, nicht Geschmack.
     Das Raster misst den Abstand zweier Farben als geraden Weg durch den
     RGB-Wuerfel, und dieser Weg unterschaetzt genau eine Nachbarschaft:
     Blau gegen Gruen. Bulgariens amtliches #00966E liegt von Russlands
     #0039A6 108,6 Einheiten entfernt - die Schwelle sind 110. Zwei
     Einheiten, und das Tor meldete „nicht zu beantworten" fuer ein Paar,
     das jeder Mensch auf Anhieb trennt.
     Statt die Schwelle zu senken (dann faende das Tor nichts mehr) oder
     das Paar auszunehmen (dann stuende eine unloesbare Aufgabe im Spiel),
     steht hier der Ton, den die meisten Darstellungen ohnehin zeigen: ein
     Grasgruen. Abstand jetzt 138 bzw. 127 Einheiten. */
  { a3:'BGR', bau:{ art:'streifen', farben:[W, '#00A550', '#D62612'] } },
  { a3:'BLR', bau:{ art:'streifen', farben:['#C8313E', '#4AA657'], breiten:[2, 1],
      ecke:{ farbe:W, breit:0.14, hoch:1 } } },

  // --- Asien ---
  { a3:'KOR', bau:{ art:'einfarbig', farben:[W],
      zeichen:[{ form:'scheibe', x:0.5, y:0.5, gross:0.46, farbe:'#CD2E3A' },
               { form:'mond', x:0.5, y:0.5, gross:0.46, farbe:'#0047A0',
                 grund:'#CD2E3A', biss:0.5, innen:1 },
               { form:'balken', x:0.18, y:0.22, gross:0.20, dick:0.5, farbe:SW },
               { form:'balken', x:0.82, y:0.22, gross:0.20, dick:0.5, farbe:SW },
               { form:'balken', x:0.18, y:0.78, gross:0.20, dick:0.5, farbe:SW },
               { form:'balken', x:0.82, y:0.78, gross:0.20, dick:0.5, farbe:SW }] } },
  { a3:'SAU', bau:{ art:'einfarbig', farben:['#165D31'],
      zeichen:{ form:'balken', x:0.5, y:0.68, gross:0.62, dick:0.16, farbe:W } } },
  /* Syrien fuehrt seit Dezember 2024 die Unabhaengigkeitsflagge: gruen
     oben, drei rote Sterne in der Mitte. Der Datenstand dieser App ist
     2025 (`STAND` in erdkunde.js) - die alte rot-weiss-schwarze waere
     hier keine Vereinfachung, sondern eine falsche Auskunft. */
  { a3:'SYR', bau:{ art:'streifen', farben:['#007A3D', W, SW],
      zeichen:{ form:'sterne', farbe:'#CE1126',
                liste:[[0.34, 0.5, 0.30], [0.5, 0.5, 0.30], [0.66, 0.5, 0.30]] } } },
  { a3:'IRQ', bau:{ art:'streifen', farben:['#CE1126', W, SW],
      zeichen:{ form:'balken', x:0.5, y:0.5, gross:0.44, dick:0.22,
                farbe:'#007A3D' } } },
  { a3:'UZB', bau:{ art:'streifen', farben:['#0099B5', W, '#1EB53A'],
      zeichen:[{ form:'mond', x:0.22, y:0.2, gross:0.26, farbe:W,
                 grund:'#0099B5', biss:0.4 },
               { form:'sterne', farbe:W,
                 liste:[[0.36, 0.2, 0.12], [0.46, 0.2, 0.12], [0.56, 0.2, 0.12]] }] } },
  { a3:'MYS', bau:{ art:'streifen',
      farben:['#CC0001', W, '#CC0001', W, '#CC0001', W, '#CC0001'],
      ecke:{ farbe:'#010066', breit:0.5, hoch:0.57 },
      zeichen:[{ form:'mond', x:0.2, y:0.28, gross:0.34, farbe:'#FFCC00',
                 grund:'#010066', biss:0.4 },
               { form:'stern', x:0.34, y:0.28, gross:0.24, zacken:7,
                 farbe:'#FFCC00' }] } },
  { a3:'PRK', bau:{ art:'streifen', farben:['#024FA2', W, '#ED1C27', W, '#024FA2'],
      breiten:[3, 1, 8, 1, 3],
      zeichen:[{ form:'scheibe', x:0.32, y:0.5, gross:0.44, farbe:W },
               { form:'stern', x:0.32, y:0.5, gross:0.32, farbe:'#ED1C27' }] } },
  { a3:'KAZ', bau:{ art:'einfarbig', farben:['#00AFCA'],
      zeichen:[{ form:'sonne', x:0.52, y:0.42, gross:0.42, farbe:'#FEC50C' },
               { form:'vogel', x:0.52, y:0.74, gross:0.30, farbe:'#FEC50C' }] } },
  { a3:'JOR', bau:{ art:'dreieck', farben:[SW, W, '#007A3D'],
      keil:{ farbe:'#CE1126', tief:0.42 },
      zeichen:{ form:'stern', x:0.14, y:0.5, gross:0.2, zacken:7, farbe:W } } },
  { a3:'AZE', bau:{ art:'streifen', farben:['#00B5E2', '#EF3340', '#509E2F'],
      zeichen:[{ form:'mond', x:0.5, y:0.5, gross:0.3, farbe:W,
                 grund:'#EF3340', biss:0.4 },
               { form:'stern', x:0.66, y:0.5, gross:0.2, zacken:8, farbe:W }] } },
  { a3:'TJK', bau:{ art:'streifen', farben:['#CC0000', W, '#006600'],
      breiten:[2, 3, 2],
      zeichen:{ form:'kranz', x:0.5, y:0.5, kreis:0.2, wieviel:7, gross:0.12,
                farbe:'#F8C300' } } },
  { a3:'ISR', bau:{ art:'streifen', farben:[W, '#0038B8', W, '#0038B8', W],
      breiten:[1, 1, 4, 1, 1],
      zeichen:{ form:'stern', x:0.5, y:0.5, gross:0.44, zacken:6,
                farbe:'#0038B8' } } },
  { a3:'ARE', bau:{ art:'streifen', farben:['#00732F', W, SW],
      ecke:{ farbe:'#FF0000', breit:0.25, hoch:1 } } },
  /* AFGHANISTAN STEHT HIER NICHT, und das ist kein Vergessen: welche
     Flagge das Land heute fuehrt, ist umstritten - die schwarz-rot-gruene
     der Republik und die weisse der heutigen Machthaber stehen
     nebeneinander. Eine Lern-App, die ein Kind auf eine der beiden
     festlegt, behauptet etwas, das nicht feststeht. Afghanistan steht
     deshalb auf der Kartenebene und nicht auf der Flaggenebene;
     `flaggeFragbar` siebt danach. */

  // --- Afrika ---
  { a3:'GHA', bau:{ art:'streifen', farben:['#CE1126', '#FCD116', '#006B3F'],
      zeichen:{ form:'stern', x:0.5, y:0.5, gross:0.3, farbe:SW } } },
  { a3:'MLI', bau:{ art:'streifen', hoch:true,
      farben:['#14B53A', '#FCD116', '#CE1126'] } },
  { a3:'GIN', bau:{ art:'streifen', hoch:true,
      farben:['#CE1126', '#FCD116', '#009460'] } },
  { a3:'SEN', bau:{ art:'streifen', hoch:true,
      farben:['#00853F', '#FDEF42', '#E31B23'],
      /* Der Stern traegt hier die ganze Unterscheidung: Mali und Senegal
         sind sonst dieselbe Flagge. Bei 0,34 mass das Tor 1,6 % Flaeche -
         unter dem Boden von 3 %, also nicht zu beantworten. Auf der
         echten Flagge ist der Stern gross; hier steht er so gross, wie er
         dort ist, und misst 7 %. */
      zeichen:{ form:'stern', x:0.5, y:0.5, gross:0.62, farbe:'#00853F' } } },
  { a3:'CMR', bau:{ art:'streifen', hoch:true,
      farben:['#007A5E', '#CE1126', '#FCD116'],
      zeichen:{ form:'stern', x:0.5, y:0.5, gross:0.34, farbe:'#FCD116' } } },
  { a3:'NER', bau:{ art:'streifen', farben:['#E05206', W, '#0DB02B'],
      zeichen:{ form:'scheibe', x:0.5, y:0.5, gross:0.3, farbe:'#E05206' } } },
  { a3:'BFA', bau:{ art:'streifen', farben:['#EF2B2D', '#009E49'],
      zeichen:{ form:'stern', x:0.5, y:0.5, gross:0.34, farbe:'#FCD116' } } },
  { a3:'MWI', bau:{ art:'streifen', farben:[SW, '#CE1126', '#339E35'],
      zeichen:{ form:'sonne', x:0.5, y:0.2, gross:0.3, farbe:'#CE1126' } } },
  { a3:'ZMB', bau:{ art:'einfarbig', farben:['#198A00'],
      zeichen:[{ form:'balken', x:0.72, y:0.72, gross:0.14, dick:2.4,
                 farbe:'#DE2010' },
               { form:'balken', x:0.86, y:0.72, gross:0.14, dick:2.4, farbe:SW },
               { form:'balken', x:0.97, y:0.72, gross:0.14, dick:2.4,
                 farbe:'#EF7D00' },
               { form:'vogel', x:0.84, y:0.24, gross:0.3, farbe:'#EF7D00' }] } },
  { a3:'SOM', bau:{ art:'einfarbig', farben:['#4189DD'],
      zeichen:{ form:'stern', x:0.5, y:0.5, gross:0.5, farbe:W } } },
  /* `keil` gehoert zur Bauart `dreieck` - bei `streifen` wird er still
     ignoriert, und Simbabwe stand ohne seinen weissen Keil da. Kein Tor
     konnte das melden: die Flagge war heil, nur falsch. Gefunden beim
     Ansehen (Regel 4: kein Tor ersetzt den Blick). */
  { a3:'ZWE', bau:{ art:'dreieck',
      farben:['#006400', '#FFD200', '#D40000', SW, '#D40000', '#FFD200', '#006400'],
      keil:{ farbe:W, tief:0.34 },
      zeichen:{ form:'stern', x:0.12, y:0.5, gross:0.3, farbe:'#D40000' } } },
  { a3:'RWA', bau:{ art:'streifen', farben:['#00A1DE', '#FAD201', '#20603D'],
      breiten:[2, 1, 1],
      zeichen:{ form:'sonne', x:0.82, y:0.28, gross:0.26, farbe:'#E5BE01' } } },
  { a3:'BEN', bau:{ art:'streifen', farben:['#FCD116', '#E8112D'],
      ecke:{ farbe:'#008751', breit:0.36, hoch:1 } } },
  { a3:'TUN', bau:{ art:'einfarbig', farben:['#E70013'],
      zeichen:[{ form:'scheibe', x:0.5, y:0.5, gross:0.66, farbe:W },
               { form:'mond', x:0.5, y:0.5, gross:0.46, farbe:'#E70013',
                 grund:W, biss:0.4 },
               { form:'stern', x:0.56, y:0.5, gross:0.24, farbe:'#E70013' }] } },
  { a3:'MOZ', bau:{ art:'dreieck',
      farben:['#009A00', W, SW, W, '#FFD100'], breiten:[4, 1, 4, 1, 4],
      keil:{ farbe:'#CE1126', tief:0.4 },
      zeichen:{ form:'stern', x:0.13, y:0.5, gross:0.3, farbe:'#FFD100' } } },
  { a3:'MDG', bau:{ art:'streifen', farben:['#FC3D32', '#007E3A'],
      ecke:{ farbe:W, breit:0.34, hoch:1 } } },
];

/* ---------- Die fuenf, die keiner Regel folgen ---------------------------
 *
 * Der Notausgang aus dem Kopf dieser Datei. Das Tor ZAEHLT sie: waechst
 * die Zahl, ist nicht diese Flagge besonders, sondern die Formsprache zu
 * eng - und dann gehoert sie erweitert und nicht umgangen. */

function suedafrika(){
  const gruen = '#007A4D', gelb = '#FFB915', rot = '#DE3831', blau = '#002395';
  return [
    rechteck(0, 0, BREIT, HOCH / 2, rot),
    rechteck(0, HOCH / 2, BREIT, HOCH / 2, blau),
    // Das liegende Y: ein Keil von links, der sich nach rechts oeffnet.
    vieleck([[0, 0], [BREIT * 0.30, 0], [BREIT, HOCH * 0.34],
             [BREIT, HOCH * 0.66], [BREIT * 0.30, HOCH], [0, HOCH],
             [BREIT * 0.42, HOCH / 2]], W),
    vieleck([[0, HOCH * 0.20], [BREIT * 0.20, HOCH * 0.20], [BREIT, HOCH * 0.42],
             [BREIT, HOCH * 0.58], [BREIT * 0.20, HOCH * 0.80], [0, HOCH * 0.80],
             [BREIT * 0.30, HOCH / 2]], gruen),
    vieleck([[0, 0], [BREIT * 0.30, HOCH / 2], [0, HOCH]], gelb),
    vieleck([[0, HOCH * 0.14], [BREIT * 0.19, HOCH / 2], [0, HOCH * 0.86]], SW),
  ];
}

function groenland(){
  const rot = '#D00C33';
  /* Oben weiss, unten rot - und die Scheibe genau andersherum: ihre obere
   * Haelfte ist rot, ihre untere weiss.
   *
   * Mit Rechteck und Scheibe allein geht das NICHT. Jede Reihenfolge, die
   * die obere Scheibenhaelfte rot macht, macht die untere mit; und ein
   * Rechteck darueber nimmt sie ganz weg. Es braucht eine halbe Scheibe,
   * und die ist ein Vieleck - die dritte Grundform, genau dafuer da. */
  return [ rechteck(0, 0, BREIT, HOCH / 2, W), rechteck(0, HOCH / 2, BREIT, HOCH / 2, rot),
    halbscheibe(BREIT * 0.36, HOCH / 2, HOCH * 0.32, true, rot),
    halbscheibe(BREIT * 0.36, HOCH / 2, HOCH * 0.32, false, W) ];
}

/** Eine halbe Scheibe als Vieleck. `oben` heisst: die obere Haelfte. */
function halbscheibe(x, y, r, oben, farbe){
  const p = [];
  for (let i = 0; i <= 24; i++) {
    const w = Math.PI * (i / 24) + (oben ? Math.PI : 0);
    p.push([+(x + r * Math.cos(w)).toFixed(2), +(y + r * Math.sin(w)).toFixed(2)]);
  }
  return vieleck(p, farbe);
}

function papua(){
  const rot = '#CE1126', gelb = '#FCD116';
  return [
    vieleck([[0, 0], [BREIT, 0], [0, HOCH]], rot),
    vieleck([[BREIT, 0], [BREIT, HOCH], [0, HOCH]], SW),
    ...[[0.72, 0.30, 0.15], [0.82, 0.52, 0.15], [0.72, 0.74, 0.15],
        [0.62, 0.52, 0.15], [0.72, 0.52, 0.10]]
      .map(([x, y, r]) => stern(x * BREIT, y * HOCH, r * HOCH / 2, W)),
    ...vogelTeile(BREIT * 0.32, HOCH * 0.34, HOCH * 0.21, gelb),
  ];
}

function guyana(){
  const gruen = '#009E49', gelb = '#FCD116', rot = '#CE1126';
  return [ rechteck(0, 0, BREIT, HOCH, gruen),
    vieleck([[0, 0], [BREIT, HOCH / 2], [0, HOCH]], W),
    vieleck([[0, HOCH * 0.06], [BREIT * 0.93, HOCH / 2], [0, HOCH * 0.94]], gelb),
    vieleck([[0, 0], [BREIT * 0.52, HOCH / 2], [0, HOCH]], SW),
    vieleck([[0, HOCH * 0.07], [BREIT * 0.46, HOCH / 2], [0, HOCH * 0.93]], rot) ];
}

/* ---------- Die Laender ohne Umriss (F3) ---------------------------------
 *
 * Acht Flaggen, die es in dieser App NICHT auf der Karte gibt - und sie
 * stehen hier trotzdem, weil die Ebene „Verwechslungen" sie braucht.
 *
 * Rumaenien ohne den Tschad ist kein Paar. Irland ohne die
 * Elfenbeinkueste auch nicht. Wer die acht weglaesst, hat eine Ebene
 * ueber Verwechslungen, in der die Haelfte der Verwechslungen fehlt.
 *
 * SIE DUERFEN IN „AUF DIE KARTE" (F4) NICHT VORKOMMEN. Ein Land ohne
 * Umriss laesst sich nicht auf sein Gebiet ziehen; gefragt wuerde nach
 * einem Ort, den es auf keiner Karte dieser App gibt. Das Tor `flaggen`
 * setzt es durch, statt sich darauf zu verlassen, dass jemand daran
 * denkt.
 *
 * Der NAME steht hier - anders als bei den 69, deren Namen aus `LAENDER`
 * kommen. Das ist keine zweite Faktenliste, sondern die einzige: fuer
 * diese acht gibt es nirgendwo sonst einen Eintrag. `aussprache` fehlt,
 * weil sie nur in der Wahlform vorkommen und dort nichts gesprochen
 * beantwortet wird. */
export const FLAGGEN_EXTRA = [
  /* RUSSLAND steht hier seit I26, und das ist eine INHALTLICHE
     Entscheidung, keine zeichnerische: es ist von der Europakarte
     genommen worden (siehe `erdkunde.js`). Die Flagge bleibt, weil zwei
     Verwechslungspaare an ihr haengen - Serbien und Bulgarien tragen
     dieselben drei Farben, und ohne die russische Trikolore daneben ist
     nicht zu zeigen, worin der Unterschied besteht. Gefragt wird sie
     nicht mehr; dafuer ist diese Liste da. */
  { a3:'RUS', name:'Russland',
    bau:{ art:'streifen', farben:[W, '#0039A6', '#D52B1E'] } },
  { a3:'TCD', name:'Tschad',
    bau:{ art:'streifen', hoch:true, farben:['#002664', '#FECB00', '#C60C30'] } },
  { a3:'IRL', name:'Irland',
    bau:{ art:'streifen', hoch:true, farben:['#169B62', W, '#FF883E'] } },
  { a3:'CIV', name:'Elfenbeinküste', aliasse:['Cote d\'Ivoire', 'Elfenbeinkueste'],
    bau:{ art:'streifen', hoch:true, farben:['#FF8200', W, '#009A44'] } },
  { a3:'NOR', name:'Norwegen',
    bau:{ art:'nordkreuz', grund:'#BA0C2F', kreuz:W, innen:'#00205B' } },
  { a3:'ISL', name:'Island',
    bau:{ art:'nordkreuz', grund:'#02529C', kreuz:W, innen:'#DC1E35' } },
  { a3:'MCO', name:'Monaco',
    bau:{ art:'streifen', farben:['#CE1126', W] } },
  { a3:'SVN', name:'Slowenien',
    bau:{ art:'streifen', farben:[W, '#005DA4', '#D50000'],
          zeichen:{ form:'schild', x:0.28, y:0.36, gross:0.28, farbe:'#005DA4' } } },
  { a3:'SVK', name:'Slowakei',
    bau:{ art:'streifen', farben:[W, '#0B4EA2', '#EE1C25'],
          zeichen:{ form:'schild', x:0.34, y:0.5, gross:0.34, farbe:'#EE1C25' } } },
];

/* ---------- Nachschlagen ------------------------------------------------- */

/* Nachgeschlagen wird ueber BEIDE Listen. Wer eine Flagge sucht, will
   die Flagge - ob das Land einen Kartenumriss hat, ist eine andere Frage
   und wird dort gestellt, wo sie zaehlt (`FLAGGEN_EXTRA`). */
const NACH_A3 = new Map([...FLAGGEN, ...FLAGGEN_EXTRA].map(f => [f.a3, f]));
export const flaggeVon = (a3) => NACH_A3.get(a3) || null;
export const hatFlagge = (a3) => NACH_A3.has(a3);

/* GEZEICHNET IST NICHT GEFRAGT (I3).
 *
 * `FLAGGEN_EXTRA` sagt es eine Seite weiter oben selbst: diese acht sind
 * „nur zum Zeigen, nicht zum Fragen" - sie stehen als Gegenstueck in den
 * Verwechslungen und haben deshalb keine `aussprache`. Solange keines
 * ihrer Laender in `erdkunde.js` einen Namen hatte, war das ohne Folgen:
 * `hatFlagge` und „wird gefragt" trafen dieselbe Menge.
 *
 * Mit I3 haben sie Namen. Irland, Slowenien und die Slowakei standen
 * damit ploetzlich in der Flaggenwahl - und das Tor hat sofort gemeldet,
 * warum das nicht geht: Irland gegen Italien und Russland gegen
 * Slowenien sind auf dem Raster nicht zu unterscheiden. Ihre
 * Zeichnungen sind fuer den NEBENEINANDER-Fall gemacht, wo daneben steht,
 * worauf zu achten ist.
 *
 * Also zwei Mengen statt einer. Was gefragt wird, steht in `FLAGGEN` -
 * und ein Land aus I3 kommt in die Flaggenebene, sobald jemand seine
 * Flagge dort eintraegt, nicht vorher. */
const FRAGBAR = new Set(FLAGGEN.map(f => f.a3));
export const flaggeFragbar = (a3) => FRAGBAR.has(a3);

/**
 * Das BAUMUSTER einer Flagge - dieselbe Bauart, dasselbe Streifenbild.
 *
 * Es gibt die eine Haelfte von `AEHNLICH`, die sich pruefen laesst. Die
 * andere - ob Menschen zwei Flaggen wirklich verwechseln - laesst sich an
 * einem Raster NICHT messen, und der erste Anlauf hat genau das versucht:
 * das Tor verlangte, dass sich zwei „aehnliche" Flaggen auf hoechstens
 * 30 % der Flaeche unterscheiden. Es meldete daraufhin, die Niederlande
 * und Luxemburg (31 %) und Indonesien und Polen (100 %) verwechsle
 * niemand. Beide sind Schulbeispiele: das eine sind zwei Blautoene, das
 * andere ist dieselbe Flagge auf dem Kopf. Ein Bildpunkt sieht bei einer
 * Umkehrung den groesstmoeglichen Unterschied, ein Mensch sieht zweimal
 * Rot und Weiss.
 *
 * Was BLEIBT, ist der bauliche Grund der Verwechslung: gleiche Bauart,
 * gleiche Zahl und Richtung der Streifen. Das ist pruefbar, und es ist
 * kein schwaecherer Ersatz - es ist die Aussage, die stimmt.
 */
export function baumuster(bau){
  const teile = [bau.art];
  if (bau.art === 'streifen' || bau.art === 'dreieck')
    teile.push(bau.hoch ? 'hoch' : 'quer', String(bau.farben.length));
  if (bau.ecke) teile.push(bau.ecke.union ? 'union' : 'ecke');
  return teile.join('/');
}

/**
 * Die Paare, die man wirklich verwechselt (F3).
 *
 * Sie stehen HIER und nicht im Tor: sie sind eine Aussage ueber die WELT,
 * keine ueber die App.
 *
 * `fragbar:false` HEISST: DIESES PAAR KANN MAN NICHT FRAGEN.
 *
 * Und das ist die wichtigste Zeile dieser Liste. Zwei Beispiele, beide
 * gemessen und nicht vermutet:
 *
 *   Rumaenien und der Tschad unterscheiden sich NUR im Blauton
 *   (#002B7F gegen #002664). Im Raster sind sie zu 0,0 % verschieden.
 *   Monaco und Indonesien unterscheiden sich NUR im Seitenverhaeltnis -
 *   und in dieser App stehen alle Flaggen im selben Rahmen (siehe Kopf).
 *   Also ebenfalls 0,0 %.
 *
 * „Welche ist Rumaenien?" hat dann keine Antwort, die man SEHEN kann.
 * Wer sie trotzdem stellt, bringt einem Kind bei zu raten und nennt das
 * Lernen. Diese Paare werden GEZEIGT und erklaert - „diese beiden sind
 * praktisch gleich, der Unterschied ist der Blauton" -, aber nie
 * abgefragt. Das ist kein Rueckzug, sondern der ehrlichere Inhalt: dass
 * es Flaggen gibt, die man nicht auseinanderhalten kann, ist selbst
 * etwas, das man ueber Flaggen lernen kann.
 *
 * Das Tor setzt beides durch: ein Paar unter dem Boden MUSS
 * `fragbar:false` tragen, und ein Paar mit `fragbar:false` muss auch
 * wirklich zu nah sein - sonst waere die Ausnahme eine Bequemlichkeit.
 *
 * `grund` ist der Satz, den die Ebene zeigt. Er steht bei den Daten, weil
 * er zur Sache gehoert und nicht zur Anzeige.
 */
export const AEHNLICH = [
  { paar:['NLD', 'LUX'], grund:'Luxemburgs Blau ist heller.' },
  { paar:['IDN', 'POL'], grund:'Dieselben Farben, andere Reihenfolge: Polen ist weiß oben.' },
  { paar:['ROU', 'TCD'], grund:'Nur der Blauton — der Tschad ist dunkler.', fragbar:false },
  { paar:['IRL', 'CIV'], grund:'Spiegelbild: Irland ist grün am Mast, die Elfenbeinküste orange.' },
  { paar:['NOR', 'ISL'], grund:'Dieselben drei Farben, vertauscht.' },
  { paar:['AUS', 'NZL'], grund:'Australien hat sechs weiße Sterne, Neuseeland vier rote.' },
  { paar:['ECU', 'COL'], grund:'Ecuador trägt ein Wappen, Kolumbien nicht.' },
  { paar:['SVN', 'SVK'], grund:'Das Wappen sitzt anders und hat andere Farben.' },
  /* Die drei aus I12. Sie stehen auf VERSCHIEDENEN Karten - Kroatien und
     Serbien in Suedosteuropa, die Niederlande und Russland in Europa -,
     und in einer Flaggenrunde ihrer eigenen Karte begegnen sie sich
     deshalb nie. Genau dafuer ist diese Liste da: sie ist eine Aussage
     ueber die WELT, nicht ueber den Vorrat einer Ebene. Wer Kroatien und
     die Niederlande nebeneinander gesehen hat, verwechselt sie danach
     nicht mehr - das ist der ganze Zweck von F3. */
  { paar:['HRV', 'NLD'], grund:'Kroatien trägt das rot-weiße Schachbrett in der Mitte.' },
  { paar:['SRB', 'NLD'], grund:'Serbien hat Blau in der Mitte, die Niederlande Weiß.' },
  { paar:['SRB', 'RUS'], grund:'Dieselben drei Farben, umgekehrte Reihenfolge — Serbien ist rot oben.' },
  { paar:['MCO', 'IDN'], grund:'Nur das Seitenverhältnis — Monaco ist fast quadratisch.',
    fragbar:false },
  { paar:['ITA', 'MEX'], grund:'Mexiko trägt einen Adler in der Mitte.' },
  { paar:['CRI', 'THA'], grund:'Dieselben Streifen, andere Farbe in der Mitte.' },
  { paar:['HND', 'NIC'], grund:'Honduras hat fünf Sterne, Nicaragua ein Dreieck.' },
  { paar:['CHN', 'VNM'], grund:'China hat fünf Sterne in der Ecke, Vietnam einen in der Mitte.' },
  /* --- I5: sechs Paare, die mit den neuen Flaggen entstanden sind ------
     Sie stehen nicht hier, weil das Tor sie verlangt, sondern weil sie
     ECHT sind - jedes einzelne ist ein Griff daneben, den Erwachsene
     machen. Der Vorrat der Verwechslungen waechst damit von elf auf
     siebzehn fragbare Paare. */
  { paar:['MLI', 'SEN'], grund:'Senegal trägt einen grünen Stern in der Mitte, Mali nicht.' },
  { paar:['MLI', 'GIN'], grund:'Spiegelbild: Mali ist grün am Mast, Guinea rot.' },
  { paar:['IRQ', 'SYR'], grund:'Syrien ist grün oben und hat drei rote Sterne, der Irak ist rot oben.' },
  { paar:['IRQ', 'TJK'], grund:'Tadschikistan ist grün unten und trägt eine Krone.' },
  { paar:['HUN', 'BGR'], grund:'Dieselben drei Farben, andere Reihenfolge: Ungarn ist rot oben.' },
  { paar:['RUS', 'BGR'], grund:'In der Mitte: Russland blau, Bulgarien grün.' },
];

/** Die Paare, nach denen man FRAGEN kann - der Vorrat der Ebene F3. */
export const fragbarePaare = () => AEHNLICH.filter(x => x.fragbar !== false);

/** Zu welchem Land ist DIESES hier zu verwechseln? Fuer die Ablenkerwahl. */
export function nahDran(a3){
  const aus = new Set();
  for (const x of AEHNLICH)
    if (x.paar.includes(a3)) aus.add(x.paar.find(y => y !== a3));
  return aus;
}
