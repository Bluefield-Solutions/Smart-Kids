// Was `tools/schnell.mjs` und `tools/kette.mjs` gemeinsam haben.
//
// Beide fahren Tore als eigene Prozesse, sammeln deren Ausgabe ein und
// melden gruen oder rot mit einer Dauer daneben. Das stand zweimal da, bis
// `npm run doppelt` es im selben Lauf gemeldet hat, in dem `tools/kette.mjs`
// entstand — 118 Token (Regel 6).
//
// Was NICHT hierher gehoert: die Reihenfolge, das Becken, der Abbruch beim
// ersten Rot. Das ist genau der Unterschied zwischen der schnellen Bahn und
// der vollen Kette, und ein gemeinsamer Helfer, der beides koennte, waere
// laenger als die zwei Fassungen zusammen.
import { spawn } from 'node:child_process';

export const s = (ms) => `${(ms / 1000).toFixed(1)} s`;
export const rot = (x) => `\x1b[31m${x}\x1b[0m`;
export const gruen = (x) => `\x1b[32m${x}\x1b[0m`;
export const grau = (x) => `\x1b[90m${x}\x1b[0m`;

/** Ein Tor als eigener Prozess. Ausgabe wird gesammelt, nicht durchgereicht. */
export const lauf = (befehl, args = []) => new Promise((fertig) => {
  const k = spawn(process.execPath, [befehl, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  let aus = '';
  k.stdout.on('data', d => aus += d);
  k.stderr.on('data', d => aus += d);
  k.on('close', code => fertig({ code, aus }));
});

/* Jedes Tor misst SEINE Dauer, nicht die der Gruppe.
 *
 * Im ersten Anlauf von tools/schnell.mjs stand dort zweimal dieselbe
 * Gruppenzeit - beide Tore meldeten damit die Zahl des langsameren, und ich
 * haette das kuerzere optimiert, ohne es zu merken. Eine Zahl, die fuer
 * zwei Dinge gilt, gilt fuer keines: jede Zahl traegt ihre Messstelle mit
 * (Regel 5). Deshalb steht die Zeitnahme hier und nicht am Aufrufer. */
export const mitZeit = async (name, datei, args = []) => {
  const a = Date.now(); const r = await lauf(datei, args);
  return { name, ...r, ms: Date.now() - a };
};
