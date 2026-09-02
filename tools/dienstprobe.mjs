/* Dienstprobe - spricht der AUFGESETZTE Dienst das Protokoll? (Q30)
 *
 * Nicht zu verwechseln mit dem Tor `gleichlauf`. Das prueft die DATEI
 * `dienst/gleichlauf-worker.js`, indem es ihre `fetch`-Methode aufruft -
 * ohne Netz, in Millisekunden, in der Kette. Es kann nichts darueber
 * sagen, ob jemand sie richtig ausgeliefert hat: ob das KV-Lager
 * angebunden ist, ob die Adresse stimmt, ob eine Zwischenstelle die
 * Vorabfrage schluckt.
 *
 * Genau das prueft dieses Werkzeug, und zwar an einem WEGWERFRAUM: es
 * legt unter einer zufaelligen Kennung etwas ab, liest es zurueck und
 * geht wieder. Ein bestehender Raum wird nie angefasst.
 *
 *     npm run dienstprobe -- https://smart-kids-gleichlauf.dein-konto.workers.dev
 *
 * Grün heisst: die Adresse kann in die Repository-Variable
 * `SMARTKIDS_GLEICHLAUF`, und der naechste Bau schaltet den Gleichlauf
 * ein.
 */
import * as G from '../src/kern/gleichlauf.js';

const adresse = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(adresse)) {
  console.log('\n  Aufruf:  npm run dienstprobe -- https://…\n');
  process.exit(2);
}

const fehler = [];
const pruefe = (satz, ob) => { if (!ob) fehler.push(satz); };
console.log(`\n  Dienstprobe gegen ${adresse}`);

const code = G.schluesselNeu();
const raum = await G.raumVon(code);
const schloss = await G.schlossVon(code);
console.log(`    Wegwerfraum ${raum.slice(0, 8)}…`);

/* 1. Erreichbar? Ein leerer Raum muss „Fassung 0" sagen und nicht 404 -
 *    der Client unterscheidet „noch nichts da" von „kaputt". */
const leer = await G.holen(adresse, raum);
pruefe(`der Dienst antwortet nicht: ${leer.fehler}`, !leer.fehler);
if (!leer.fehler) pruefe(`ein leerer Raum meldet Fassung ${leer.fassung} statt 0`,
  (+leer.fassung || 0) === 0);

/* 2. Eine ganze Runde ueber den Client - also genau das, was die App tut. */
const meiner = { fortschritt: { 'probe:ebene': { stueck: { fach:3, hoechstes:3, zuletzt: 1 } } } };
const r = await G.runde(adresse, code, meiner);
pruefe(`der Gleichlauf meldet: ${r.fehler}`, !r.fehler);
pruefe('der Gleichlauf hat nichts gesendet, obwohl der Raum leer war', r.gesendet === true);

/* 3. Kommt es zurueck - und zugesperrt? */
const wieder = await G.holen(adresse, raum);
pruefe('nach dem Ablegen steht der Raum immer noch auf Fassung 0',
  (+wieder.fassung || 0) >= 1);
pruefe('im Raum steht Klartext', !/probe:ebene|stueck/.test(String(wieder.stand)));
const auf = wieder.stand ? await G.aufsperren(schloss, wieder.stand) : null;
pruefe('der eigene Schluessel sperrt den eigenen Raum nicht auf',
  !!(auf && auf.fortschritt && auf.fortschritt['probe:ebene']));

/* 4. Die Fassungspruefung - ohne sie verlieren zwei Geraete Aufkleber. */
const alt = await G.senden(adresse, raum, 0, 'EGAL');
pruefe('eine ALTE Fassung wird angenommen — dann überschreibt ein Gerät das andere',
  alt.streit === true);

/* 5. Und ein zweiter Lauf desselben Standes schreibt nicht noch einmal. */
const nochmal = await G.runde(adresse, code, r.stand || meiner);
pruefe('ein Gerät, das schon alles hat, schreibt trotzdem', nochmal.gesendet === false);

if (fehler.length) {
  console.log('');
  for (const f of fehler) console.log(`  ✗ ${f}`);
  console.log(`\n  Dienstprobe ROT: ${fehler.length} von den Zusagen halten nicht.`);
  console.log('  Der Dienst ist noch nicht bereit — die Adresse noch NICHT eintragen.\n');
  process.exit(1);
}
console.log('    Erreichbar, legt ab, gibt zurück, sperrt zu, zählt Fassungen');
console.log(`\n  Dienstprobe grün. Die Adresse kann als Repository-Variable`);
console.log(`  SMARTKIDS_GLEICHLAUF = ${adresse}`);
console.log('  eingetragen werden; der nächste Bau schaltet den Gleichlauf ein.');
console.log('  Der Wegwerfraum bleibt leer stehen und wird von niemandem gefunden.\n');
