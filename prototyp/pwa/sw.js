// Service Worker.
//
// Zwei Zusagen, die einander widersprechen:
//   1. Die App muss OHNE Netz starten - im Zug, im Keller, im Flugzeug.
//   2. Die App muss IMMER AKTUELL sein - was auf main liegt, laeuft.
//
// Aufgeloest wird das an der Stelle, an der es sich entscheidet: die SEITE
// wird zuerst aus dem Netz geholt, alles andere zuerst aus dem Lager.
//
//   - Die Seite (index.html) traegt das ganze Spiel und aendert sich bei
//     jeder Auslieferung. Also Netz zuerst - aber mit einer Reissleine von
//     2,5 Sekunden. Ein Kind wartet nicht auf ein muerbes Hotel-WLAN; nach
//     2,5 s kommt die letzte bekannte Fassung aus dem Lager, und die neue
//     ist beim naechsten Start da.
//
//     DIE REISSLEINE ENTSCHEIDET NUR, WAS GEZEIGT WIRD - nicht, ob
//     weitergeladen wird. Das war der Fehler: der Abruf wurde beim
//     Zeitablauf VERWORFEN, also landete auch nichts im Lager, also war
//     beim naechsten Start wieder dieselbe alte Fassung da. Auf einer
//     Leitung, die fuer 324 KB laenger als 2,5 s braucht, hat die App
//     sich damit NIE erneuert - nachgestellt mit 3,5 s Antwortzeit: drei
//     Starts hintereinander die alte Fassung, und auch fuenf Sekunden
//     spaeter lag nur die alte im Lager. Genau das hat auf dem Geraet
//     der Kinder eine sehr alte Fassung stehen lassen.
//   - Schrift und Symbole aendern sich INNERHALB einer Fassung nie. Also
//     Lager zuerst, ohne Umweg. Bei einer neuen Fassung heisst das Lager
//     anders, und alles wird einmal neu geholt.
const FASSUNG = '__FASSUNG__';
// Der Lagername traegt den ORT mit, an dem dieser Service Worker sitzt.
//
// Sonst raeumen zwei Installationen einander ab: `activate` loescht JEDES
// Lager, das mit dem Namen anfaengt und nicht das eigene ist - und mit der
// Vorschau unter /vorschau/ gibt es zum ersten Mal zwei. Wer die Vorschau
// oeffnete, haette dem ausgelieferten Spiel den Offline-Vorrat geloescht,
// und beim naechsten Start ohne Netz waere es nicht mehr da gewesen.
// Cache Storage gilt je HERKUNFT, nicht je Geltungsbereich; der Name muss
// den Unterschied also selbst tragen.
const SIPPE = 'smart-kids' + new URL('./', self.location).pathname.replace(/\//g, '-');
const LAGER = SIPPE + FASSUNG;
const VORRAT = __VORRAT__;
const ZU_LANGSAM = 2500;

self.addEventListener('install', (e) => {
  // skipWaiting: sonst uebernimmt die neue Fassung erst, wenn ALLE Fenster
  // zu sind. Auf einem Startbildschirm-Symbol ist das nie.
  e.waitUntil(caches.open(LAGER).then(l => l.addAll(VORRAT)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const name of await caches.keys())
      if (name.startsWith(SIPPE) && name !== LAGER) await caches.delete(name);
    await self.clients.claim();
  })());
});

async function seiteHolen(anfrage, ereignis) {
  const lager = await caches.open(LAGER);
  /* Der Abruf laeuft weiter, gleich wer das Rennen gewinnt - und er legt
     ab, sobald er ankommt. `waitUntil` haelt den Service Worker dafuer am
     Leben; ohne das darf der Browser ihn nach der Antwort abschalten, und
     der Nachschub waere wieder weg. */
  const abruf = fetch(anfrage, { cache: 'no-store' }).then(async (netz) => {
    if (!netz || !netz.ok) throw new Error('Antwort nicht in Ordnung');
    await lager.put('./index.html', netz.clone());
    return netz;
  });
  if (ereignis && ereignis.waitUntil) ereignis.waitUntil(abruf.catch(() => {}));
  else abruf.catch(() => {});
  try {
    return await Promise.race([
      abruf,
      new Promise((_, nein) => setTimeout(() => nein(new Error('zu langsam')), ZU_LANGSAM)),
    ]);
  } catch (e) {
    const alt = await lager.match('./index.html');
    if (alt) return alt;
    // Nichts im Lager - dann bleibt nur warten, so lange es dauert.
    return abruf;
  }
}

async function stueckHolen(anfrage) {
  const lager = await caches.open(LAGER);
  const da = await lager.match(anfrage);
  if (da) return da;
  const netz = await fetch(anfrage);
  if (netz && netz.ok && new URL(anfrage.url).origin === self.location.origin)
    await lager.put(anfrage, netz.clone());
  return netz;
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') e.respondWith(seiteHolen(e.request, e));
  else if (new URL(e.request.url).origin === self.location.origin)
    e.respondWith(stueckHolen(e.request));
});
