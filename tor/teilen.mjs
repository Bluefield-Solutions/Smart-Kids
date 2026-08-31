// Ein Tor in Teillaeufe zerlegen — die gemeinsame Haelfte.
//
// `smoke` (P2) und `passt` (P4) laufen als je drei Prozesse nebeneinander.
// Beide muessen dasselbe koennen: `--teil=i/n` lesen, Unsinn darin
// zurueckweisen, und hinschreiben, was dieser Teil faehrt und was es
// insgesamt gibt. Das stand zweimal da, bis `npm run doppelt` es gemeldet
// hat - 120 Token, im selben Lauf, in dem der zweite entstand (Regel 6).
//
// Was NICHT hierher gehoert: WIE verteilt wird. `smoke` wiegt seine
// Abschnitte, weil sie zwischen 0 und 79 s kosten; `passt` teilt reihum,
// weil seine sieben Groessen gemessen alle dasselbe kosten. Ein
// gemeinsamer Verteiler muesste beides koennen und waere laenger als die
// zwei Zeilen, die er spart.

/**
 * Liest `--teil=i/n` aus der Befehlszeile.
 *
 * @param {string} tor Name fuer die Fehlermeldung.
 * @returns {{i:number,n:number}|null} `null`, wenn nicht geteilt wird.
 */
export function teilVon(tor) {
  const roh = (process.argv.find(a => a.startsWith('--teil=')) || '').split('=')[1];
  if (!roh) return null;
  const [i, n] = roh.split('/').map(Number);
  if (!Number.isInteger(i) || !Number.isInteger(n) || n < 1 || i < 0 || i >= n) {
    console.error(`\n  ${tor}: --teil=${roh} ist unbrauchbar. `
      + 'Erwartet wird i/n mit 0 <= i < n.\n');
    process.exit(2);
  }
  return { i, n };
}

/**
 * Schreibt die Zeile, an der `tools/kette.mjs` die Deckung nachzaehlt.
 *
 * Getrennt mit `|`, nicht mit Komma: „iPhone quer, Leiste" HAT ein Komma
 * im Namen. Im ersten Anlauf zerfiel es beim Nachzaehlen in zwei Groessen,
 * von denen keine existiert, und die Nachzaehlung haette gemeldet, dass
 * ein Teil sie nicht faehrt. Ein Trennzeichen, das im Text vorkommt, ist
 * keines.
 *
 * Das Format steht HIER und nicht im Laeufer: sonst stuende es zweimal da,
 * und die eine Seite koennte sich aendern, ohne dass die andere es
 * erfaehrt - dann prueft die Nachzaehlung nichts mehr und meldet es nicht.
 */
export function meldeTeil(tor, teil, meine, alle) {
  if (!teil) return;
  /* Ein LEERER Teil ist der stillste Fall von allen: er faehrt nichts,
   * findet nichts und meldet gruen. Beim Einrichten ist er mir schon
   * begegnet - `smoke --teil=12/13` bekam keinen einzigen Abschnitt, weil
   * dreizehn Stuecke auf dreizehn Toepfe nicht aufgehen, sobald zwei
   * gleich schwer sind. In der Kette kann das nicht vorkommen, dort sind
   * es drei Teile; auf der Befehlszeile schon. */
  if (!meine.length) {
    console.error(`\n  ${tor}: Teil ${teil.i + 1}/${teil.n} fährt nichts. `
      + 'Ein leerer Teillauf meldet grün, ohne etwas geprüft zu haben — '
      + `von ${alle.length} Stücken ist keines hier gelandet. Weniger Teile.\n`);
    process.exit(2);
  }
  console.log(`  TEILE ${teil.i + 1}/${teil.n}: ${meine.join('|')}  VON: ${alle.join('|')}`);
}
