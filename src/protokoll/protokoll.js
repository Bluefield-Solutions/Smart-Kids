/* Der Ereignisstrom. Anhaengend, nie aendernd.
 *
 * `roheingabe` ist der wertvollste Teil: nach zwei Wochen steht dort
 * schwarz auf weiss, wie das Erkennungssystem Fionas Aussprache tatsaechlich
 * hoert - und daraus waechst die eingefrorene Korpushaelfte mit echten Daten
 * statt mit Vermutungen.
 */
import * as A from '../profil/ablage.js';

/* Ein Eintrag - EINE Stelle, die weiss, was einer braucht.
 *
 * Bis P8 haben `tor/ansicht.mjs` und `tor/smoke.mjs` diese Vorgaben
 * nachgebaut, statt sie zu benutzen: zweimal `roheingabe: ''`,
 * `sicherheit: null`, `fachVorher`, `fachNachher`. Waere hier ein Feld
 * dazugekommen, haetten beide Tore einen Bildschirm gemessen, den es so
 * nie gibt. Gefunden hat es `npm run doppelt`.
 *
 * `modul: 'erdkunde'` ist raus. Es wurde geschrieben und NIE gelesen -
 * nicht im Elternbericht, nicht in der CSV-Ausfuhr - und es stand seit
 * C1 auch noch falsch da: Fionas Rechenaufgaben trugen `erdkunde`. Wer
 * das Modul braucht, liest es aus `ebene`; dort steht es richtig.
 */
export function eintrag(x) {
  return {
    zeit: x.zeit, profil: x.profil, ebene: x.ebene, gebietId: x.gebietId,
    eingabeart: x.eingabeart, ergebnis: x.ergebnis,
    roheingabe: x.roheingabe ?? '', sicherheit: x.sicherheit ?? null,
    dauerMs: x.dauerMs, versuch: x.versuch,
    fachVorher: x.fachVorher ?? null, fachNachher: x.fachNachher ?? null,
  };
}
export const schreiben = (e) => A.anhaengen('protokoll', e).catch(() => {});
export const lesen = (profil) => A.alles('protokoll')
  .then(a => a.filter(e => !profil || e.profil === profil).sort((x, y) => x.zeit - y.zeit))
  .catch(() => []);

/* ---------------------------------------------------------- Auswertung -- */

export function auswerten(eintraege, namen) {
  const je = new Map();
  for (const e of eintraege) {
    const z = je.get(e.gebietId) || { id: e.gebietId, name: namen[e.gebietId] || e.gebietId,
                                      richtig: 0, fast: 0, falsch: 0, dauer: 0, n: 0 };
    z[e.ergebnis] = (z[e.ergebnis] || 0) + 1;
    z.dauer += e.dauerMs || 0; z.n++;
    je.set(e.gebietId, z);
  }
  const liste = [...je.values()].map(z => ({ ...z,
    quote: z.n ? z.richtig / z.n : 0, schnitt: z.n ? Math.round(z.dauer / z.n) : 0 }));
  return {
    gesamt: eintraege.length,
    richtig: eintraege.filter(e => e.ergebnis === 'richtig').length,
    /* Die mittlere Antwortzeit ueber ALLE Eintraege - dieselbe Rechnung wie
     * je Gebiet, nur eine Ebene hoeher. Sie steht hier und nicht beim
     * Aufrufer, damit die Uebersicht je Profil nicht ihre eigene
     * Mittelung mitbringt und die beiden Zahlen auseinanderlaufen. */
    schnitt: eintraege.length
      ? Math.round(eintraege.reduce((n, e) => n + (e.dauerMs || 0), 0) / eintraege.length) : 0,
    jeGebiet: liste.sort((a, b) => a.quote - b.quote),
    /** Die fuenf mit den meisten Fehlversuchen. */
    wackelkandidaten: liste.filter(z => z.n >= 2).sort((a, b) =>
      (b.falsch + b.fast) - (a.falsch + a.fast)).slice(0, 5),
    /** Was gesagt wurde vs. was verstanden wurde. Der Rueckkanal fuer M4. */
    aussprache: eintraege.filter(e => e.eingabeart === 'sprechen' && e.roheingabe)
      .map(e => ({ zeit: e.zeit, gesagt: e.roheingabe, gemeint: namen[e.gebietId] || e.gebietId,
                   ergebnis: e.ergebnis, sicherheit: e.sicherheit })),
    /** Verlauf nach Tagen. */
    tage: [...eintraege.reduce((m, e) => {
      const t = new Date(e.zeit).toISOString().slice(0, 10);
      const z = m.get(t) || { tag: t, n: 0, richtig: 0 };
      z.n++; if (e.ergebnis === 'richtig') z.richtig++;
      return m.set(t, z);
    }, new Map()).values()],
  };
}

/* ------------------------------------------------------------- Ausfuhr -- */

export function alsCsv(eintraege, namen) {
  const kopf = ['zeit','profil','ebene','gebiet','eingabeart','ergebnis','roheingabe',
                'sicherheit','dauerMs','versuch','fachVorher','fachNachher'];
  const zeile = (e) => [
    new Date(e.zeit).toISOString(), e.profil, e.ebene, namen[e.gebietId] || e.gebietId,
    e.eingabeart, e.ergebnis, e.roheingabe, e.sicherheit ?? '', e.dauerMs, e.versuch,
    e.fachVorher ?? '', e.fachNachher ?? '',
  ].map(w => { const s = String(w ?? ''); return /[";\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; })
   .join(';');
  return '﻿' + [kopf.join(';'), ...eintraege.map(zeile)].join('\r\n');
}
export const alsJson = (eintraege) => JSON.stringify(eintraege, null, 2);

/**
 * Zwei Profile nebeneinander (N1).
 *
 * Verglichen wird, was ohnehin gezaehlt wird: **auf Anhieb richtig** und
 * die Zeit. Keine neue Groesse, keine Punkte, die sich jemand ausgedacht
 * hat - in diesem Verzeichnis steht keine Zahl an zwei Stellen, und eine
 * erfundene Punktzahl waere genau das: `glatt` noch einmal, nur mit einem
 * Faktor davor.
 *
 * Was eine AUFGABE ist: ein Eintrag, der sie beendet - `richtig` oder
 * `gezeigt`. Die Fehlversuche dazwischen stehen als eigene Eintraege im
 * Protokoll und duerfen nicht mitgezaehlt werden, sonst haette der
 * Ungeduldigere mehr „Aufgaben" als der Gruendliche.
 *
 * `glatt` heisst: beim ERSTEN Versuch richtig, ohne Hilfe. Dieselbe
 * Bedeutung wie im Kopf waehrend der Sitzung und auf dem Endbildschirm.
 */
export function vergleich(eintraege, wer) {
  const leer = () => ({ aufgaben: 0, glatt: 0, dauer: 0 });
  const jeEbene = new Map();
  const gesamt = Object.fromEntries(wer.map(id => [id, leer()]));
  for (const e of eintraege) {
    if (!wer.includes(e.profil)) continue;
    if (e.ergebnis !== 'richtig' && e.ergebnis !== 'gezeigt') continue;
    if (!jeEbene.has(e.ebene))
      jeEbene.set(e.ebene, Object.fromEntries(wer.map(id => [id, leer()])));
    for (const topf of [jeEbene.get(e.ebene)[e.profil], gesamt[e.profil]]) {
      topf.aufgaben++;
      topf.dauer += e.dauerMs || 0;
      if (e.ergebnis === 'richtig' && e.versuch === 1) topf.glatt++;
    }
  }
  const fertig = (t) => ({ ...t,
    anteil: t.aufgaben ? t.glatt / t.aufgaben : 0,
    schnitt: t.aufgaben ? Math.round(t.dauer / t.aufgaben) : 0 });
  const reihen = [...jeEbene.entries()].map(([ebene, je]) => ({
    ebene, je: Object.fromEntries(wer.map(id => [id, fertig(je[id])])) }))
    .sort((a, b) => a.ebene.localeCompare(b.ebene));
  const summe = Object.fromEntries(wer.map(id => [id, fertig(gesamt[id])]));
  /* Wer vorn liegt - und `null`, wenn es gleich steht oder einer noch
   * gar nicht gespielt hat. „Gleichstand" ist ein Ergebnis; ihn zu einem
   * Sieger zu runden waere die einzige Stelle, an der dieser Vergleich
   * etwas behaupten koennte, was nicht gemessen ist. */
  const spieler = wer.filter(id => summe[id].aufgaben);
  let vorn = null;
  if (spieler.length === wer.length && wer.length === 2) {
    const [a, b] = wer;
    if (summe[a].glatt !== summe[b].glatt)
      vorn = summe[a].glatt > summe[b].glatt ? a : b;
  }
  return { wer, reihen, summe, vorn };
}
