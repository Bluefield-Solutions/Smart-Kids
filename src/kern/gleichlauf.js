/* Gleichlauf - dieselben Aufkleber auf allen Geraeten.
 *
 * REFERENZABGLEICH (Schritt 0 der Arbeitsweise).
 *
 * Drei Vorbilder, und was sie WIRKLICH tun:
 *
 * 1. Anki (AnkiWeb). Ein Konto, ein Server, der die Karten im Klartext
 *    haelt. Was es tut: es macht den Gleichlauf zur Nebensache - man merkt
 *    ihn nicht. Was es kostet: der Betreiber sieht alles, und es braucht
 *    eine Anmeldung, also eine E-Mail-Adresse.
 *    Zu uebernehmen: der Gleichlauf laeuft von selbst mit, nicht auf Knopf.
 *    NICHT zu uebernehmen: das Konto.
 *
 * 2. Obsidian Sync. Ende-zu-Ende verschluesselt; der Betreiber sieht nur
 *    einen Haufen Bytes. Was es tut: es trennt „wer darf lesen" von „wer
 *    speichert". Der Schluessel bleibt beim Nutzer.
 *    Zu uebernehmen: genau das. Es ist der einzige Weg, der die Zusage aus
 *    K3 13.3 nicht bricht, sondern verschiebt: es geht etwas ins Netz,
 *    aber niemand dort kann es lesen.
 *
 * 3. Das WLAN-Passwort auf der Rueckseite des Routers. Ein Code, den man
 *    abtippt, und danach nie wieder. Kein Konto, kein Verfahren.
 *    Zu uebernehmen: die Kopplung ist EIN Code, den ein Erwachsener von
 *    einem Bildschirm auf den anderen tippt.
 *
 * DAS SOLL, daraus abgeleitet:
 *   - Kein Konto, keine E-Mail, kein Name. Ein Familienschluessel.
 *   - Der Server sieht nur Bytes: Raumkennung und Inhalt sind beide aus
 *     dem Schluessel abgeleitet, den er nie bekommt.
 *   - Offline aendert sich nichts. Wer nie koppelt, merkt nichts davon.
 *   - Zusammengefuehrt wird OHNE Rueckfrage: aus zwei Staenden wird
 *     einer, und zwar so, dass niemand etwas verliert.
 *
 * ABSTAND ZUM HEUTIGEN STAND, gemessen vor der Runde: es gibt nichts.
 * `src/profil/ablage.js` sagt „es gibt keinen Code, der etwas hochlaedt",
 * und das stimmte.
 *
 * WAS ABSICHTLICH FEHLT: eine Anmeldung, ein Wiederherstellen ohne Code,
 * ein Rueckgaengig. Wer den Code verliert, hat den Raum verloren - und
 * behaelt alles, was auf seinem Geraet steht. Das ist der Preis dafuer,
 * dass niemand sonst hineinsehen kann, und er ist hier richtig herum
 * bezahlt: verloren geht ein Gleichlauf, nie ein Aufkleber.
 */

/* ---------- Der Familienschluessel ------------------------------------
 *
 * Achtzig Bit, als sechzehn Zeichen in vier Gruppen: K7QM-3XR9-2FTB-HN45.
 *
 * Warum achtzig und nicht hundertachtundzwanzig: der Code wird von einem
 * Menschen von einem Bildschirm auf ein Telefon getippt. Sechsundzwanzig
 * Zeichen tippt niemand zweimal. Und achtzig Bit sind hier reichlich -
 * geraten wird gegen einen Server, der jede Anfrage einzeln beantwortet;
 * das ist kein Passwort in einer gestohlenen Datei, das man milliardenfach
 * durchprobiert.
 *
 * Das Alphabet ist Crockfords Base32: ohne I, L, O und U. Die ersten drei
 * sehen wie 1 und 0 aus, das vierte macht aus einem Zufallscode
 * gelegentlich ein Wort, das ein Kind vorliest.
 */
const ABC = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const BITS = 80;

/** Ein neuer Schluessel. Zufall aus der Krypto-Quelle, nicht aus `Math`. */
export function schluesselNeu(zufall = (n) => crypto.getRandomValues(new Uint8Array(n))) {
  return alsCode(zufall(BITS / 8));
}

/** Bytes -> Code mit Bindestrichen. */
export function alsCode(bytes) {
  let bit = 0, wert = 0, aus = '';
  for (const b of bytes) {
    wert = (wert << 8) | b; bit += 8;
    while (bit >= 5) { bit -= 5; aus += ABC[(wert >> bit) & 31]; }
  }
  if (bit) aus += ABC[(wert << (5 - bit)) & 31];
  return (aus.match(/.{1,4}/g) || []).join('-');
}

/**
 * Code -> Bytes. Grosszuegig beim Lesen, streng beim Ergebnis.
 *
 * Getippt wird auf einem Telefon: Kleinbuchstaben, Leerzeichen statt
 * Bindestrich, eine O statt der Null. Alles davon wird hier eingerenkt -
 * und wenn danach nicht genau die richtige Zahl Zeichen dasteht, kommt
 * `null` zurueck und nicht ein halber Schluessel.
 */
export function ausCode(text) {
  /* Eingerenkt wird NUR, was Crockford selbst einrenkt: I und L sehen wie
   * die Eins aus, O wie die Null. Sonst nichts.
   *
   * Der erste Entwurf war grosszuegiger und hat dabei gueltige Zeichen
   * zerstoert: er machte aus Q eine Null und aus U ein V. Q GEHOERT zum
   * Alphabet - jeder Code mit einem Q war danach ein anderer, und der
   * Raum, in dem die Aufkleber liegen, ein fremder. U gehoert nicht dazu;
   * es still zu V zu machen heisst, einen Tippfehler zu raten statt ihn
   * zu melden. Ein U im Code ist ein Fehler, und als solcher soll er
   * auffallen.
   *
   * Gefunden hat das der erste Lauf des Tores - an einem zufaelligen
   * Schluessel, in dem ein Q vorkam. Deshalb prueft es seither auch einen
   * FESTEN Code, in dem jedes Zeichen des Alphabets einmal steht: ein
   * Fehler, der vom Wuerfel abhaengt, wird sonst irgendwann uebersehen. */
  const roh = String(text || '').toUpperCase()
    .replace(/O/g, '0').replace(/[IL]/g, '1')
    .replace(/[^0-9A-Z]/g, '');
  if (roh.length !== Math.ceil(BITS / 5)) return null;
  let bit = 0, wert = 0; const aus = [];
  for (const z of roh) {
    const i = ABC.indexOf(z);
    if (i < 0) return null;
    wert = (wert << 5) | i; bit += 5;
    if (bit >= 8) { bit -= 8; aus.push((wert >> bit) & 255); }
  }
  return aus.length === BITS / 8 ? new Uint8Array(aus) : null;
}

/* ---------- Raum und Schloss ------------------------------------------
 *
 * Beide kommen aus demselben Code, mit verschiedenen Vorsilben. Der Server
 * bekommt den RAUM (er muss wissen, wohin) und nie das SCHLOSS.
 *
 * Warum eine einzelne Runde SHA-256 und kein PBKDF2: die Eingabe ist
 * bereits achtzig Bit gleichverteilter Zufall, kein Passwort. Ein
 * Streckverfahren schuetzt gegen Woerterbuecher; hier gibt es kein
 * Woerterbuch, gegen das es schuetzen koennte. Es waere Zeremonie.
 */
const roh = (s) => new TextEncoder().encode(s);

async function abgeleitet(code, zweck) {
  const bytes = ausCode(code);
  if (!bytes) throw new Error('kein gültiger Familienschlüssel');
  const eingabe = new Uint8Array([...roh(zweck + '|'), ...bytes]);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', eingabe));
}

/** Die Kennung des Raums auf dem Server. 32 Hexzeichen. */
export async function raumVon(code) {
  return [...(await abgeleitet(code, 'raum'))].slice(0, 16)
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Der Schluessel, mit dem der Inhalt zugesperrt wird. Bleibt hier. */
export async function schlossVon(code) {
  return crypto.subtle.importKey('raw', await abgeleitet(code, 'schloss'),
    { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

const zuB64 = (u8) => btoa(String.fromCharCode(...u8));
const ausB64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

/** Zusperren. Der Zufallsstreifen steht vorn, damit er mitreist. */
export async function zusperren(schloss, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const inhalt = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv },
    schloss, roh(JSON.stringify(obj))));
  return zuB64(new Uint8Array([...iv, ...inhalt]));
}

/** Aufsperren. Gibt `null`, wenn der Schluessel nicht passt. */
export async function aufsperren(schloss, b64) {
  try {
    const alles = ausB64(b64);
    const klar = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: alles.slice(0, 12) }, schloss, alles.slice(12));
    return JSON.parse(new TextDecoder().decode(klar));
  } catch { return null; }
}

/* ---------- Zusammenfuehren -------------------------------------------
 *
 * Die eine Stelle, an der entschieden wird, was gilt. Sie ist REIN: rein
 * hinein, rein heraus, kein Netz, keine Uhr, keine Ablage. Nur so laesst
 * sie sich ohne Browser pruefen, und nur so kann eine Gegenprobe zeigen,
 * dass die Pruefung etwas taugt.
 *
 * Die Regel in einem Satz: NIEMAND VERLIERT ETWAS.
 *
 * Fuer einen Leitner-Satz heisst das im Einzelnen:
 *
 *   hoechstes   das Groessere. Es faellt von sich aus nie (siehe
 *               leitner.js), und daran haengt der Aufkleber. Wer auf dem
 *               iPad Afrika gesammelt hat, hat es danach auch auf dem
 *               iPhone.
 *   fach        vom JUENGEREN Satz. Das laufende Fach faellt nach einer
 *               falschen Antwort, und das soll es auch - sonst waere ein
 *               Fehler auf dem zweiten Geraet folgenlos.
 *   faellig     ebenso: es gehoert zum Fach.
 *   richtig
 *   falsch      das Groessere, NICHT die Summe. Beide Geraete tragen die
 *               gemeinsame Vorgeschichte; addiert waere sie doppelt
 *               gezaehlt. Das Groessere zaehlt zu wenig, wenn parallel
 *               geuebt wurde - und zu wenig ist hier der harmlose Fehler:
 *               es erfindet keine Uebung, die nicht stattgefunden hat.
 *   zuletzt     das Spaetere.
 *
 * Und die Rechnung ist verbandsartig: sie haengt nicht von der
 * Reihenfolge ab (`vereinen(a,b)` = `vereinen(b,a)` in allem, was zaehlt)
 * und wiederholt sich folgenlos. Das ist keine Feinheit, sondern die
 * Bedingung dafuer, dass drei Geraete ohne Schiedsrichter zusammenkommen.
 */
const zahl = (x, weg = 0) => (typeof x === 'number' && isFinite(x)) ? x : weg;

/* Auch EIN Satz allein wird durchgerechnet, nicht durchgereicht.
 *
 * Hier stand `if (!a) return b; if (!b) return a;` - und damit kam ein
 * Gegenstand, den nur ein Geraet kennt, unveraendert durch. Ist er nicht
 * vollstaendig (ein alter Satz ohne `richtig`/`falsch` etwa), fehlen die
 * Felder auch im Umschlag; beim NAECHSTEN Abgleich treffen dann zwei
 * Saetze aufeinander, die Felder kommen dazu, und der Stand sieht
 * geaendert aus, obwohl niemand etwas geuebt hat. Ergebnis: ein
 * ueberfluessiges Schreiben je Gegenstand, bei jedem ersten Abgleich.
 *
 * Gefunden hat das `npm run dienstprobe` gegen den echten Dienst - die
 * Zeile „ein Gerät, das schon alles hat, schreibt trotzdem". Im Tor war
 * es unsichtbar, weil dessen Beispielsaetze vollstaendig sind: eine
 * Pruefung mit sauberen Daten sieht die Sorte Fehler nie, die von
 * unsauberen kommt. */
export function satzVereinen(a, b) {
  if (!a && !b) return a || b;
  // Fehlt einer, zaehlt der andere zweimal - das Ergebnis ist dann er
  // selbst, aber vollstaendig ausgerechnet.
  const x = a || b, y = b || a;
  const az = zahl(x.zuletzt), bz = zahl(y.zuletzt);
  const jung = az >= bz ? x : y;
  const [aa, bb] = [x, y];
  return { ...jung,
    hoechstes: Math.max(zahl(aa.hoechstes, zahl(aa.fach, 1)), zahl(bb.hoechstes, zahl(bb.fach, 1))),
    richtig: Math.max(zahl(aa.richtig), zahl(bb.richtig)),
    falsch: Math.max(zahl(aa.falsch), zahl(bb.falsch)),
    zuletzt: Math.max(az, bz) };
}

/** Ein ganzer Leitner-Stand (Gegenstand -> Satz). */
export function standVereinen(a, b) {
  const aus = { ...(a || {}) };
  for (const [id, satz] of Object.entries(b || {})) aus[id] = satzVereinen(aus[id], satz);
  return aus;
}

/* Welche Einstellungen mitreisen - und warum nicht alle.
 *
 * `glatt` ist ein Ereignis („einmal ganz ohne Fehler"), und es zaehlt das
 * ERSTE Mal: zusammengefuehrt wird deshalb das FRUEHERE, nicht das
 * spaetere. `nr:` ist der Sitzungszaehler, aus dem die Aufgabenfolge
 * gewuerfelt wird; das Groessere gewinnt, sonst kaeme auf dem zweiten
 * Geraet zweimal dieselbe Runde.
 *
 * Alles andere bleibt am Geraet: die Stimme, die Lautstaerke, die PIN.
 * Es sind Einstellungen des GERAETS, nicht des Kindes - und die PIN
 * gehoert ohnehin nicht in einen Umschlag, der reist, auch wenn er
 * zugesperrt ist. */
/* `ohnefehler:` UND NICHT `glatt` - hier stand zwei Fassungen lang der
 * falsche Name.
 *
 * Der Schluessel, den die App schreibt, heisst `ohnefehler:<kind>`
 * (`glattSchluessel()` in `spiel.js`); `glatt` heisst nur die ZAHL in
 * einer Sitzung. Dieser Filter liess also `glatt` durch, das es gar nicht
 * gibt, und sperrte `ohnefehler:fiona` aus: „Einmal ganz ohne Fehler" ist
 * nie zwischen iPhone und iPad gereist.
 *
 * Und das Tor daneben hat es bezeugt statt gefunden: `tor/gleichlauf.mjs`
 * fragte `REIST('glatt')` - also genau den Namen aus dieser Zeile und
 * nicht den aus der App. Eine Pruefung, die ihren Gegenstand aus dem
 * Prueflig abschreibt, kann nie etwas melden (Regel 1: sie ist kein
 * Beweis). Sie fragt jetzt nach dem Schluessel, den die App wirklich
 * schreibt.
 *
 * `tiere:` (T1) ist die Sammlung eines Kindes und muss aus demselben
 * Grund mitreisen wie der Fortschritt: wer auf dem iPad einen Fuchs
 * bekommt, hat ihn auch auf dem iPhone. */
export const REIST = (k) => String(k).startsWith('ohnefehler:')
  || String(k).startsWith('nr:')
  || String(k).startsWith('geuebt:')
  || String(k).startsWith('tiere:');

/* Die Landschaften (T2) - je RAUM die juengere Aufstellung.
 *
 * Hier gilt NICHT die Vereinigung wie bei den Aufklebern, und das ist
 * der Unterschied zwischen einer Sammlung und einem Bild: zwei
 * Aufkleberstaende zusammenzuwerfen ergibt einen groesseren Stand, zwei
 * Aufstellungen zusammenzuwerfen ergibt ein Durcheinander - Tiere, die
 * das Kind weggeraeumt hat, stuenden wieder da, und auf jedem Platz
 * gaebe es zwei Anwaerter. Ein Raum ist EIN Bild; das zuletzt gemalte
 * gilt.
 *
 * MUSS VERTAUSCHBAR SEIN: `vereinen(a,b)` und `vereinen(b,a)` muessen
 * dasselbe ergeben, sonst schicken sich zwei Geraete endlos denselben
 * Stand (die Lehre, die `geordnet()` weiter unten traegt). Bei gleicher
 * Zeit entscheidet deshalb erst die Zahl der Tiere und dann der Text -
 * beides haengt nicht daran, wer zuerst gefragt hat.
 */
function szenenVereinen(a, b) {
  const aus = { ...(a || {}) };
  for (const [raum, neu] of Object.entries(b || {})) {
    const alt = aus[raum];
    if (!alt) { aus[raum] = neu; continue; }
    aus[raum] = juengere(alt, neu);
  }
  return aus;
}
function juengere(a, b) {
  const za = zahl(a && a.zeit), zb = zahl(b && b.zeit);
  if (za !== zb) return za > zb ? a : b;
  const na = (a.stand || []).filter(Boolean).length;
  const nb = (b.stand || []).filter(Boolean).length;
  if (na !== nb) return na > nb ? a : b;
  return JSON.stringify(a) <= JSON.stringify(b) ? a : b;
}

export function einstVereinen(a, b) {
  /* Gefiltert wird auf BEIDEN Seiten, nicht nur auf der ankommenden.
   *
   * Der erste Entwurf uebernahm `a` im Ganzen und filterte nur `b` - und
   * damit lag die PIN des eigenen Geraets im Umschlag, sobald der eigene
   * Stand der aeltere war. Gefunden hat das die Zeile „die PIN reist mit"
   * im Tor, im ersten Lauf. Ein Filter, der nur eine Richtung kennt, ist
   * keiner. */
  const aus = Object.fromEntries(Object.entries(a || {}).filter(([k]) => REIST(k)));
  for (const [k, w] of Object.entries(b || {})) {
    if (!REIST(k)) continue;
    if (!(k in aus)) { aus[k] = w; continue; }
    if (String(k).startsWith('nr:')) { aus[k] = Math.max(zahl(aus[k]), zahl(w)); continue; }
    /* „heute schon geübt" (A4h): der SPAETERE Tag gilt. Er steht als
       `YYYY-MM-DD` da, und in dieser Schreibweise ist der spaetere Tag
       auch der groessere Text - deshalb genuegt ein Vergleich, und es
       braucht kein Datum daraus zu werden. Wer auf dem iPad geuebt hat,
       sieht es danach auch auf dem iPhone. */
    if (String(k).startsWith('geuebt:')) {
      aus[k] = String(w) > String(aus[k]) ? w : aus[k]; continue; }
    /* `tiere:` (T1): die VEREINIGUNG der Sammlungen, und beim Gorilla die
       groessere Zahl. Nicht „das juengere gewinnt": wer auf dem iPad
       einen Fuchs und auf dem iPhone eine Eule bekommen hat, hat beide -
       ein Aufkleber, den ein anderes Geraet wegnimmt, waere schlimmer
       als gar kein Gleichlauf. */
    if (String(k).startsWith('tiere:')) {
      const alt = aus[k] || {}, neu = w || {};
      aus[k] = { ids: [...new Set([...(alt.ids || []), ...(neu.ids || [])])],
                 gorilla: Math.max(zahl(alt.gorilla), zahl(neu.gorilla)),
                 szenen: szenenVereinen(alt.szenen, neu.szenen) };
      continue;
    }
    // `ohnefehler:`: das FRUEHERE gilt.
    const alt = aus[k], neu = w;
    aus[k] = (zahl(neu && neu.zeit, Infinity) < zahl(alt && alt.zeit, Infinity)) ? neu : alt;
  }
  return aus;
}

/* Schluessel in fester Reihenfolge, bis nach unten durch.
 *
 * Das ist keine Kosmetik. `gleich()` vergleicht zwei Umschlaege als Text,
 * und daran haengt die Frage, ob ueberhaupt gesendet wird. Ohne feste
 * Reihenfolge kommt aus `vereinen(a,b)` und `vereinen(b,a)` derselbe
 * INHALT in verschiedener Schreibweise - zwei Geraete haetten sich
 * gegenseitig endlos denselben Stand geschickt, jedes in der Meinung,
 * der andere habe etwas Neues. Gefunden hat das die Zeile „die
 * Reihenfolge aendert das Ergebnis" im Tor, im ersten Lauf. */
function geordnet(x) {
  if (Array.isArray(x)) return x.map(geordnet);
  if (!x || typeof x !== 'object') return x;
  const aus = {};
  for (const k of Object.keys(x).sort()) aus[k] = geordnet(x[k]);
  return aus;
}

/* ---------- Das Protokoll (Q30) ---------------------------------------
 *
 * Es ist anhaengend: jeder Eintrag hat einen Schluessel, der ihn eindeutig
 * macht (`zeit-zufall`), und niemand aendert je einen. Zusammenfuehren ist
 * deshalb die einfachste Rechnung dieser Datei - eine Vereinigung.
 *
 * DIE GRENZE IST DAS EIGENTLICHE THEMA, und sie ist gemessen: ein Eintrag
 * mit Schluessel wiegt 241 Byte. Tausend Antworten sind 235 KB, fuenftausend
 * 1,15 MB - und zugesperrt kommt ein Drittel dazu. Ein Kind mit sechzehn
 * Antworten am Tag ist nach zwei Monaten bei tausend. Ohne Grenze waere der
 * Umschlag nach einem halben Jahr groesser als der Dienst annimmt, und der
 * Gleichlauf hoerte still auf zu funktionieren - genau dann, wenn am
 * meisten drinsteht.
 *
 * Also reist nur das JUENGSTE, bis das Budget voll ist. Was aelter ist,
 * bleibt auf dem Geraet, auf dem es entstanden ist: die Ausfuhr im
 * Elternbereich liest weiter alles, sie liest ja lokal. Was reist, ist die
 * gemeinsame juengere Geschichte - und das ist es, was der Elternbereich
 * zeigt.
 *
 * 300 KB, nicht 512: der Dienst nimmt 512 KB, zugesperrt und in Base64
 * wird aus 300 rund 410, und der Fortschritt braucht auch noch Platz.
 */
export const PROTOKOLL_BUDGET = 300 * 1024;

export function protokollVereinen(a, b, budget = PROTOKOLL_BUDGET) {
  const alle = { ...(a || {}), ...(b || {}) };
  /* Sortiert wird nach der ZEIT im Eintrag, nicht nach dem Schluessel.
     Der Schluessel faengt zwar mit der Zeit an, ist aber Text - und als
     Text steht „9…" vor „10…". */
  const zeit = (e) => zahl(e && e.zeit);
  const reihe = Object.entries(alle).sort((x, y) => zeit(y[1]) - zeit(x[1]));
  const aus = {};
  let wiegt = 0;
  for (const [k, e] of reihe) {
    const gross = k.length + JSON.stringify(e).length + 4;
    if (wiegt + gross > budget) break;
    wiegt += gross; aus[k] = e;
  }
  return aus;
}

/** Der ganze Umschlag: zwei Staende hinein, einer heraus. */
export function vereinen(a, b) {
  const A = a || {}, B = b || {};
  const fortschritt = {};
  for (const k of new Set([...Object.keys(A.fortschritt || {}), ...Object.keys(B.fortschritt || {})]))
    fortschritt[k] = standVereinen((A.fortschritt || {})[k], (B.fortschritt || {})[k]);
  return geordnet({ fassung: 1,
           fortschritt,
           protokoll: protokollVereinen(A.protokoll, B.protokoll),
           einstellungen: einstVereinen(A.einstellungen, B.einstellungen) });
}

/** Sind zwei Umschlaege gleich? Entscheidet, ob ueberhaupt gesendet wird. */
export function gleich(a, b) {
  return JSON.stringify(a || null) === JSON.stringify(b || null);
}

/* ---------- Der Weg zum Dienst ----------------------------------------
 *
 * Zwei Aufrufe, mehr ist es nicht. Sie stehen hier und nicht im Spiel,
 * damit die Adresse EINEN Ort hat - und weil ein Tor sie so gegen einen
 * nachgebauten Dienst fahren kann, ohne einen Browser zu starten.
 *
 * Fehler werden nicht geworfen, sondern gemeldet: der Gleichlauf ist eine
 * Nebensache. Kein Netz heisst „spaeter nochmal", nicht „das Spiel ist
 * kaputt". Das ist der ganze Unterschied zwischen einer App, die offline
 * laeuft, und einer, die es behauptet.
 */
export async function holen(adresse, raum, netz = fetch) {
  try {
    const a = await netz(`${adresse}/v1/${raum}`, { method: 'GET' });
    if (!a.ok) return { fehler: `Dienst antwortet ${a.status}` };
    return await a.json();
  } catch (e) { return { fehler: 'kein Netz' }; }
}

export async function senden(adresse, raum, fassung, stand, netz = fetch) {
  try {
    const a = await netz(`${adresse}/v1/${raum}`, { method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fassung, stand }) });
    const w = await a.json().catch(() => ({}));
    if (a.status === 409) return { streit: true, ...w };
    if (!a.ok) return { fehler: `Dienst antwortet ${a.status}` };
    return w;
  } catch (e) { return { fehler: 'kein Netz' }; }
}

/**
 * Eine ganze Runde: holen, zusammenfuehren, zurueckgeben.
 *
 * Was hier NICHT steht, ist die Ablage - die gehoert dem Spiel. Diese
 * Funktion bekommt den eigenen Stand und gibt den vereinten zurueck;
 * damit ist sie ohne Browser und ohne Datenbank zu pruefen.
 *
 * Der Streitfall (409) wird genau EINMAL wiederholt. Zweimal hintereinander
 * dazwischenzufunken schafft nur, wer im selben Augenblick auf dem dritten
 * Geraet spielt - und dann ist der naechste Gleichlauf in vier Sekunden
 * ohnehin faellig. Eine Schleife waere hier ein Weg, sich selbst
 * aufzuhaengen.
 */
export async function runde(adresse, code, meiner, netz = fetch) {
  const raum = await raumVon(code);
  const schloss = await schlossVon(code);
  for (let versuch = 0; versuch < 2; versuch++) {
    const da = await holen(adresse, raum, netz);
    if (da.fehler) return { fehler: da.fehler };
    const dort = da.stand ? await aufsperren(schloss, da.stand) : null;
    if (da.stand && !dort)
      return { fehler: 'der Familienschlüssel passt nicht zu diesem Raum' };
    const vereint = vereinen(dort, meiner);
    // Nichts Neues? Dann auch nichts senden. Ein Gleichlauf, der bei jedem
    // Aufruf schreibt, laesst die Fassungszahl ins Kraut schiessen und
    // macht aus einem stillen Geraet einen Schwaetzer.
    if (dort && gleich(dort, vereint)) return { stand: vereint, gesendet: false };
    const hin = await senden(adresse, raum, +da.fassung || 0,
      await zusperren(schloss, vereint), netz);
    if (hin.fehler) return { fehler: hin.fehler, stand: vereint };
    if (hin.streit) continue;
    return { stand: vereint, gesendet: true };
  }
  return { fehler: 'zwei Geräte gleichzeitig — beim nächsten Mal' };
}
