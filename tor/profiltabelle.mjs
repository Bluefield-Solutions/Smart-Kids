/* Die Profiltabelle aus dem Backlog - EINE Lesestelle fuer alle Tore.
 *
 * Das Soll kommt aus der Referenz, nicht aus dem Prueflig: was ein Tor
 * ERWARTET, darf nicht aus der Datei kommen, die eine Gegenprobe
 * anfasst (Regel 3). Setzt man in `prototyp/spiel.js` Fionas
 * Tiefe auf zwoelf und liest der Test sie dort ab, wandert das Soll mit
 * und der Test bleibt gruen. Gelesen wird deshalb die Tabelle im Backlog -
 * dieselbe Stelle, an der der Nutzer die Zahl entschieden hat.
 *
 * Bis hierher stand dieser Leser nur in `tor/smoke.mjs`. `spielprobe`
 * braucht dieselben Zahlen (Sitzungslaenge und Tiefe je Profil), und ein
 * zweiter Leser waere genau das, was Regel 6 verbietet: was zweimal
 * dasteht, veraltet einmal - und dann pruefen zwei Tore verschiedene
 * Profile, ohne dass eines rot wird.
 *
 * Fehler sammelt dieses Modul in `FEHLER`. Der Aufrufer haengt sie an
 * seine eigene Liste - eine fehlende Zeile darf nicht still zu einem
 * leeren Soll werden, gegen das alles gruen ist.
 */
import fs from 'node:fs';

export const FEHLER = [];
export const BACKLOG = fs.readFileSync('docs/Lernkiste-BACKLOG.md', 'utf8');

/* Die Kennungen der Profile - aus der KOPFZEILE der Tabelle, nicht aus
 * einer Liste hier.
 *
 * Vor N1 stand in vier Toren `['fiona','lea','eltern']`. Die vierte Spalte
 * (Violeta) haette sie alle still falsch gemacht: jede Zeile waere um eins
 * verrutscht, und Violetas Werte waeren als Stephans geprueft worden.
 * Eine Tabelle, die ihre eigenen Namen traegt, kann das nicht.
 *
 * Die Kennung ist das erste Wort der Spalte, klein: „Fiona (6)" -> `fiona`. */
export const PROFIL_IDS = (() => {
  const z = BACKLOG.match(/^\|\s*\|\s*Fiona[^|]*\|.+\|\s*$/m);
  if (!z) { FEHLER.push('Die Kopfzeile der Profiltabelle fehlt im Backlog — '
    + 'dann weiß der Rauchtest nicht, welche Spalte wem gehört'); return []; }
  return z[0].split('|').slice(2, -1)
    .map(t => t.trim().split(/[\s(]/)[0].toLowerCase()).filter(Boolean);
})();

/** Der angezeigte Name je Kennung - „stephan" steht als „Stephan" da. */
export const NAME_VON = Object.fromEntries(PROFIL_IDS.map(id =>
  [id, id.charAt(0).toUpperCase() + id.slice(1)]));

/** Dieselben Namen in Tabellenreihenfolge. */
export const PROFILNAMEN = PROFIL_IDS.map(id => NAME_VON[id]);

/**
 * Eine Zeile der Profiltabelle als Zellen - oder nichts samt Fehler.
 *
 * `wozu` sagt, was ohne diese Zeile ungeprueft bliebe. Vorher stand dieser
 * Zehnzeiler dreimal da, einmal je Zeile; eine fehlende Zeile darf nicht
 * still zu einem leeren Soll werden, gegen das alles gruen ist.
 */
export function zeile(name, wozu){
  const z = BACKLOG.match(new RegExp(`^\\|\\s*${name}\\s*\\|(.+)\\|\\s*$`, 'm'));
  if (!z) { FEHLER.push(`Die Zeile „${name}" fehlt im Backlog — `
    + `dann prüft der Rauchtest ${wozu} gegen nichts`); return null; }
  return z[1].split('|');
}

/** Dieselbe Zeile als Zahl je Profil. */
export function zahlen(name, wozu){
  const zellen = zeile(name, wozu);
  if (!zellen) return {};
  const n = zellen.map(t => +(t.match(/\d+/) || [])[0]).filter(Number.isFinite);
  return Object.fromEntries(PROFIL_IDS.map((id, i) => [id, n[i]]));
}

export const SITZUNG = zahlen('Aufgaben je Sitzung', 'den Vorlauf');
export const TIEFE = zahlen('Ländertiefe', 'die Tiefe');
