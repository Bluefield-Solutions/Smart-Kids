/* Feinmass fuer das Forscherbuch: was ein Bildschirm „gemacht" aussehen
 * laesst, ist selten Geschmack - es ist meistens eine TONLEITER.
 *
 * Gemessen wird deshalb nicht „schoen", sondern die Zahl der
 * verschiedenen Werte je Sorte: Schriftgroessen, Radien, Abstaende,
 * Farben, Schatten, Fluchtlinien. Wenige, wiederkehrende Werte sehen
 * gemacht aus; viele, einmalige sehen gewachsen aus.
 *
 * Dazu drei Dinge, die fuer ein Kind zaehlen, das NICHT LESEN kann:
 * wieviel der Flaeche Bild statt Text ist, ob jeder Griff angesagt wird
 * (`data-lesen`), und ob er mit dem Daumen zu treffen ist.
 *
 * Kein Tor - ein Blickwerkzeug (Regel 4): es urteilt nicht, es zaehlt.
 */
import fs from 'node:fs';
import { oeffneBuch, AUS } from './buch-oeffnen.mjs';
import { TIERE } from '../src/inhalt/tiere.js';

const { b, s, server, kapitel: kaps } = await oeffneBuch();

const alles = { schrift: {}, radius: {}, luft: {}, farbe: {}, grund: {}, schatten: {},
                flucht: {}, klassen: {}, jeSeite: [], tafel: false };
const zaehl = (o, k) => { o[k] = (o[k] || 0) + 1; };

/* Seit B12 ist ein Kapitel eine WELT, und die Ebenen liegen darin. Wer
   nur die Reiter durchklickt, misst von „Erdkunde" das Raster und nie
   eine Albumkarte - und die Rechentafel gar nicht. Also je Kapitel: die
   Seite selbst und danach jede Zelle darin. */
const seitenFolge = [];
for (const k of kaps) {
  await s.click(`[data-kap="${k}"]`);
  await s.waitForTimeout(400);
  seitenFolge.push({ k, zelle: null });
  const zellen = await s.$$eval('.ebenenzelle', z => z.map(x => x.dataset.ebenenwahl));
  for (const z of zellen) seitenFolge.push({ k, zelle: z });
}
for (const { k, zelle } of seitenFolge) {
  await s.click(`[data-kap="${k}"]`);
  await s.waitForTimeout(250);
  if (zelle) {
    await s.click(`.ebenenzelle[data-ebenenwahl="${zelle}"]`);
    await s.waitForTimeout(250);
  }
  const m = await s.evaluate(() => {
    const schirm = document.querySelector('.schirm.da');
    const kasten = schirm.querySelector('.rollen.buch');
    const rk = kasten.getBoundingClientRect();
    const raus = { schrift: [], radius: [], luft: [], farbe: [], grund: [],
                   schatten: [], flucht: [], klassen: [], klein: [], ohneStimme: [],
                   zeichen: 0, bildFlaeche: 0, textFlaeche: 0 };
    /* GEMESSEN WIRD DAS BUCH, nicht der Bildschirm.
       Audit II hat den ganzen Schirm gezaehlt und dabei die Kopfzeile
       der App mitgenommen („Zurueck", „Ansehen", die Marke) - die steht
       auf JEDEM Bildschirm und gehoert nicht zur Tonleiter des Buches.
       Die Zahlen hier sind deshalb NICHT die aus Audit II; die
       Messstelle ist enger (Regel 5). */
    const buch = [...schirm.querySelectorAll('.rollen.buch, .buchreiter')];
    const alle = buch.flatMap(k => [k, ...k.querySelectorAll('*')]);
    for (const e of alle) {
      const r = e.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const c = getComputedStyle(e);
      for (const kl of e.classList) raus.klassen.push(kl);
      // Schrift zaehlt nur, wo wirklich Text steht
      const eigenerText = [...e.childNodes]
        .filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join('');
      if (eigenerText) {
        raus.schrift.push(`${Math.round(parseFloat(c.fontSize))}/${c.fontWeight}`);
        raus.farbe.push(c.color);
        raus.zeichen += eigenerText.length;
        raus.textFlaeche += r.width * r.height;
      }
      /* Radien nur an KAESTEN. Ein SVG kann eine Ecke tragen, ohne dass
         sie im Bild eine Kante ist - der eine Achter, der hier lange
         uebrig blieb, kam von einem Kulissenstreifen. */
      const rad = parseFloat(c.borderTopLeftRadius);
      if (rad > 0.5 && !(e instanceof SVGElement)) raus.radius.push(Math.round(rad));
      if (c.backgroundColor !== 'rgba(0, 0, 0, 0)') raus.grund.push(c.backgroundColor);
      if (c.boxShadow && c.boxShadow !== 'none') raus.schatten.push(c.boxShadow);
      for (const v of [c.paddingTop, c.paddingLeft, c.gap, c.marginTop])
        { const z = Math.round(parseFloat(v)); if (z > 0) raus.luft.push(z); }
      // Fluchtlinien: linke Kante, aber nur von Blocken im Inhaltskasten
      if (kasten.contains(e) && r.width > rk.width * 0.12)
        raus.flucht.push(Math.round(r.left - rk.left));
      if (e.tagName === 'SVG' || e.tagName === 'svg' || e.tagName === 'IMG')
        raus.bildFlaeche += r.width * r.height;
      // Griffe: Groesse und Ansage
      const griff = e.matches('button, [role="tab"], a, [onclick]');
      if (griff) {
        if (r.width < 44 || r.height < 44) raus.klein.push(
          `${(e.textContent || '').trim().slice(0, 18) || e.className} ${Math.round(r.width)}×${Math.round(r.height)}`);
        if (!e.dataset.lesen && !e.getAttribute('aria-label'))
          raus.ohneStimme.push((e.textContent || '').trim().slice(0, 22) || e.className);
      }
    }
    raus.kasten = { b: Math.round(rk.width), h: Math.round(rk.height) };
    raus.tafel = !!schirm.querySelector('.rechentafel .tafelfeld');
    return raus;
  });
  for (const [feld, liste] of Object.entries({ schrift: m.schrift, radius: m.radius,
        luft: m.luft, farbe: m.farbe, grund: m.grund, schatten: m.schatten,
        flucht: m.flucht, klassen: m.klassen }))
    for (const v of liste) zaehl(alles[feld], String(v));
  if (m.tafel) alles.tafel = true;
  alles.jeSeite.push({ kapitel: zelle ? `${k} › ${zelle}` : k, zeichen: m.zeichen,
    bildAnteil: m.bildFlaeche / (m.bildFlaeche + m.textFlaeche || 1),
    flucht: [...new Set(m.flucht)].sort((a, c) => a - c),
    klein: m.klein, ohneStimme: m.ohneStimme });
}
/* ---------- Zweitens: passt JEDER Name in seine Aufkleberkarte? -------
 *
 * Die Tonleiter hat den Tiernamen auf die NAMEN-Rolle gehoben - dieselbe
 * Groesse wie ueberall sonst. Damit brach „Streifenhoernchen" in drei
 * Zeilen, die letzte mit einem einzelnen „n". Gesehen hat das der
 * Bildvergleich, und zwar nur, WEIL dieses eine Tier zufaellig auf dem
 * Vorbild stand: von 124 Namen stehen drei im Bild.
 *
 * Deshalb wird hier nicht der Name gemessen, der gerade dasteht,
 * sondern jeder: eine sichtbare Karte, der Reihe nach mit jedem Namen
 * beschriftet, Zeilen gezaehlt. Das faengt beides - eine zu schmale
 * Karte und ein zu langes neues Tier.
 *
 * Der Artikel faellt weg, weil `ohneArtikel` ihn im Spiel auch
 * wegnimmt (spiel.js). Die Karte wird danach zurueckgesetzt.
 */
/* Erst nachsehen, ob es das Kapitel gibt. Ein `click` auf etwas, das
   nicht da ist, laeuft in die Zeitgrenze und sieht aus wie ein Haenger -
   das Tor soll aber sagen, dass es NICHTS geprueft hat. */
if (await s.locator('[data-kap="tiere"]').count()) {
  await s.click('[data-kap="tiere"]');
  await s.waitForTimeout(400);
  /* Seit Runde 3 steht zuerst das Raumraster da; eine Aufkleberkarte
     gibt es erst IM Raum. Ohne diesen Tipp faende die Messung keine
     sichtbare Karte und meldete „NICHTS geprueft" - richtig, aber
     nutzlos. */
  if (await s.locator('.schirm.da .raumzelle').count()) {
    await s.locator('.schirm.da .raumzelle').first().click();
    await s.waitForTimeout(300);
  }
}
const NAMEN = [...new Set(TIERE.map(t => String(t.name).replace(/^(der|die|das) /, '')))];
alles.langeNamen = await s.evaluate((namen) => {
  const sp = [...document.querySelectorAll('.schirm.da .tierfeld span')]
    .find(e => e.getBoundingClientRect().width > 1);
  if (!sp) return null;                       // kein Tierkapitel im Stand
  const alt = sp.textContent;
  const zeilenhoehe = parseFloat(getComputedStyle(sp).lineHeight);
  const zuviel = [];
  for (const n of namen) {
    sp.textContent = n;
    const z = Math.round(sp.getBoundingClientRect().height / zeilenhoehe);
    if (z > 2) zuviel.push(`${n} (${z} Zeilen)`);
  }
  sp.textContent = alt;
  return { geprueft: namen.length, zuviel,
    karte: Math.round(sp.closest('.tierfeld').getBoundingClientRect().width) };
}, NAMEN);

await b.close(); server.close();
fs.writeFileSync(`${AUS}/feinmass.json`, JSON.stringify(alles, null, 1));

const zeig = (name, o, n = 99) => {
  const e = Object.entries(o).sort((a, c) => c[1] - a[1]);
  console.log(`\n  ${name}: ${e.length} verschiedene`);
  console.log('    ' + e.slice(0, n).map(([v, z]) => `${v}×${z}`).join('  ').slice(0, 460));
};
/* ---------- Die Ratsche (Runde 0) ------------------------------------
 *
 * Sie zaehlt WERTE, nicht Geschmack: wieviele verschiedene
 * Schriftstufen, Radien und Abstaende das Buch traegt. Wenige,
 * wiederkehrende Werte sehen gemacht aus; viele, einmalige sehen
 * gewachsen aus - das war der ganze Befund aus Audit II.
 *
 * Die Grenzen sind das, was nach Runde 0 GEMESSEN dasteht, nicht ein
 * Wunsch: 3 Schriftstufen (Titel, Name, Fussnote), 2 Radien (Kasten und
 * Pille), 3 Abstaende (eng, mittel, weit). Eine Ratsche darf nur
 * strenger werden - wer eine vierte Stufe braucht, muss sie begruenden
 * und die Zahl hier hochsetzen.
 *
 * Gemessen wird das BUCH, nicht der Bildschirm: die Kopfzeile der App
 * steht auf jedem Schirm und gehoert nicht zur Tonleiter des Buches.
 * Die Zahlen aus Audit II sind deshalb groesser - andere Messstelle
 * (Regel 5).
 */
const GRENZEN = { schrift: 3, radius: 2, luft: 3 };
/* DER BILDANTEIL EINER SAMMELSEITE (N12).
 *
 * Die Ratsche im Rauchtest fragt, wieviel der Seite BENUTZT wird. Das
 * ist die halbe Frage: eine Seite fuellt sich auch mit einem hoeheren
 * leeren Kasten, und genau in diese Falle ist N12 zwischendurch gelaufen
 * - zwei grosse Zellen mit derselben briefmarkengrossen Weltkarte darin,
 * Fuellung 95 %, Bildanteil unveraendert.
 *
 * Gemessen wird deshalb daneben, wieviel der beschriebenen Flaeche BILD
 * ist. Vorher und nachher, 844 x 390, voller Stand:
 *
 *   tiere 12 → 45   welt:erdkunde 26 → 84   abzeichen 19 → 55
 *   kontinente 69   rechnen 69   bundeslaender 44   naechstes 0
 *
 * 35 und nicht 44: der schlechteste Wert unter den Bildseiten ist
 * `bundeslaender` mit 44, und ein Buch mit einem Gegenstand weniger darf
 * nicht rot werden - dieselbe Luft wie bei der Ratsche nebenan.
 *
 * EINE AUSNAHME, und sie liegt am gestellten Stand und nicht an der
 * Seite: `naechstes` steht hier bei 0 %, weil die Vorschau in DIESEM
 * Stand nur Text zeigt - dieselbe Seite traegt anderswo eine Albumkarte
 * (`quer-buch-naechstes`). Sie hat also nichts, was wachsen koennte.
 *
 * `abzeichen` war die zweite und ist es nicht mehr: 19 → 55 %. Die Wand
 * stand mit 81 % Fuellung fast ganz da, und darin klebten 44 Punkte
 * Zeichen unter einem gleich grossen Namen. Ein Abzeichen ist ein
 * ZEICHEN mit einer Unterschrift, nicht umgekehrt.
 *
 * Eine Ausnahme mit Namen und Zahl, nicht ein weicherer Grenzwert: ein
 * Grenzwert, der sie durchlaesst, laesst auch alles andere durch. */
const BILD_MIN = 35;
const OHNE_BILDPFLICHT = new Set(['naechstes']);
if (process.argv.includes('--tor')) {
  const fehler = [];
  for (const [feld, grenze] of Object.entries(GRENZEN)) {
    const werte = Object.entries(alles[feld]).sort((a, b) => b[1] - a[1]);
    if (werte.length > grenze)
      fehler.push(`${feld}: ${werte.length} verschiedene Werte, erlaubt sind ${grenze}`
        + ` — ${werte.map(([v, z]) => `${v}×${z}`).join(' ')}`);
  }
  /* Und die zweite Zusage: kein Tiername braucht drei Zeilen.
     Sie steht hier und nicht in `inhalt`, weil sie nur im Browser zu
     haben ist - eine Zeichenzahl waere ein Ersatz, kein Mass: „Mmmm..."
     ist bei gleicher Laenge doppelt so breit wie „lllll...". */
  /* Und die zweite Blindprobe: ohne eine Ebene OHNE Landkarte hat die
     Tonleiter die Rechentafel nie gesehen. Genau so ist der Rechenkleber
     jahrelang neben der Leiter gestanden (20/700, Radius 10, Polster 4) -
     nicht weil das Tor zu lasch war, sondern weil sein gestellter Stand
     die Seite gar nicht enthielt. Eine Prüfung, die etwas nie sieht,
     meldet darüber auch nichts und ist insoweit kein Beweis (Regel 1). */
  const blass = alles.jeSeite
    .filter(x => !OHNE_BILDPFLICHT.has(x.kapitel))
    .map(x => ({ was: x.kapitel, anteil: Math.round(x.bildAnteil * 100) }))
    .filter(x => x.anteil < BILD_MIN);
  if (blass.length)
    fehler.push(`${blass.length} Sammelseiten zeigen weniger als ${BILD_MIN} % Bild `
      + `(${blass.map(x => `${x.was} ${x.anteil} %`).join(' · ')}) — eine Albumseite `
      + 'mit einer Briefmarke darauf ist keine Albumseite');
  if (!alles.tafel)
    fehler.push('keine Rechentafel unter den Kapiteln — der gestellte Stand hat keine '
      + 'Ebene ohne Landkarte, und dann ist die Seite mit der eigenen Bildsprache ungemessen');
  const ln = alles.langeNamen;
  if (!ln) fehler.push('kein Tierkapitel im Stand — die Namensprobe hat NICHTS geprüft');
  else if (ln.zuviel.length)
    fehler.push(`${ln.zuviel.length} von ${ln.geprueft} Tiernamen brauchen drei Zeilen `
      + `in der ${ln.karte} Punkte breiten Aufkleberkarte — ${ln.zuviel.join(' · ')}`);

  if (fehler.length) {
    console.log('\n  Tor `tonleiter` ROT:');
    fehler.forEach(f => console.log('    ✗ ' + f));
    console.log('');
    process.exit(1);
  }
  console.log(`\n  tonleiter grün: ${Object.keys(alles.schrift).length} Schriftstufen, `
    + `${Object.keys(alles.radius).length} Radien, ${Object.keys(alles.luft).length} Abstände `
    + `im Buch — gemessen an ${alles.jeSeite.length} Seiten in ${kaps.length} `
    + `Kapiteln auf 844 × 390.`);
  console.log(`    Und ${ln.geprueft} Tiernamen passen in zwei Zeilen `
    + `(Karte ${ln.karte} Punkte breit); die Rechentafel war dabei.`);
  console.log('    Bildanteil je Seite: ' + alles.jeSeite
    .map(x => `${x.kapitel.split('›').pop().trim()} ${Math.round(x.bildAnteil * 100)} %`)
    .join(' · ') + `  (Ratsche: mindestens ${BILD_MIN} %, ohne `
    + `${[...OHNE_BILDPFLICHT].join(' und ')})`);
  process.exit(0);
}
console.log(`\n  Feinmass am Forscherbuch, 844 x 390, voller Stand, ${kaps.length} Kapitel, `
  + `${alles.jeSeite.length} Seiten`);
zeig('Schriftgrössen (Grösse/Schnitt)', alles.schrift);
zeig('Eckenradien', alles.radius);
zeig('Abstände (padding · gap · margin)', alles.luft);
zeig('Textfarben', alles.farbe);
zeig('Grundfarben', alles.grund);
zeig('Schatten', alles.schatten, 6);
const lnB = alles.langeNamen;
console.log(`\n  Tiernamen in der Aufkleberkarte (${lnB ? lnB.karte : '?'} Punkte breit): `
  + (!lnB ? 'kein Tierkapitel im Stand'
    : lnB.zuviel.length ? `${lnB.zuviel.length} von ${lnB.geprueft} brauchen drei Zeilen — `
        + lnB.zuviel.join(' · ')
    : `alle ${lnB.geprueft} passen in zwei Zeilen`));
console.log(`\n  Klassen: ${Object.keys(alles.klassen).length} verschiedene, `
  + `${Object.values(alles.klassen).filter(z => z === 1).length} kommen genau EINMAL vor`);
console.log('\n  Je Seite');
for (const p of alles.jeSeite)
  console.log(`    ${p.kapitel.padEnd(15)} ${String(p.zeichen).padStart(4)} Zeichen · `
    + `Bildanteil ${(p.bildAnteil * 100).toFixed(0).padStart(3)} % · `
    + `${p.flucht.length} Fluchtlinien [${p.flucht.slice(0, 8).join(' ')}] · `
    + `${p.klein.length} Griffe unter 44 · ${p.ohneStimme.length} ohne Ansage`);
