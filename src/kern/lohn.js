/**
 * WAS EIN RAUM KOSTET (E32/E33).
 *
 * Ein Lebensraum haelt drei Tiere, und es gibt zwei Wege dorthin: eine
 * fehlerfreie Runde bringt eines (I27), eine fertige Ebene bringt ihren
 * ANTEIL. Was beides zusammen kostet, stand bis E32 nirgends - und
 * heraus kam eine Verkehrung: „An der Quelle" mit 24 Ebenen und 245
 * amtlichen Woertern war fuer VIER richtige Antworten leer, „Im Wald"
 * mit elf kostete achtzehn.
 *
 * DIE RECHNUNG STEHT HIER UND NICHT DREIMAL. Das Spiel braucht den
 * Anteil, `spielprobe` den Preis der Raeume, deren Groessen aus den
 * Daten kommen, und der Rauchtest den Preis ALLER Raeume - mit dem
 * echten `vorrat()`, den es nur im Browser gibt. Drei Fassungen davon
 * waeren drei Wahrheiten, und die erste, die auseinanderliefe, waere
 * die im Tor: sie wuerde dann gruen melden, was im Spiel anders
 * gerechnet wird (Regel 6).
 */

/**
 * Wieviele Tiere EINE fertige Ebene aus ihrem Raum holt.
 *
 * Drei durch die Zahl der Ebenen, aufgerundet. Bei einer Ebene sind das
 * alle drei - dort gibt es nichts anderes, was zahlen koennte, und fuer
 * die elf Raeume mit nur einer Ebene aendert sich damit nichts. Ab drei
 * Ebenen ist es eines, dann fuellen drei fertige Ebenen den Raum.
 */
export const anteilVon = (raum) =>
  !raum ? 0
  : raum.ebenen && raum.ebenen.length
    ? Math.ceil(raum.tiere.length / raum.ebenen.length)
    : raum.tiere.length;

/**
 * Die laengste Runde, die ein Raum hergeben kann.
 *
 * Die Grenze fuer den Lohn einer fehlerfreien Runde - und sie ist
 * gerechnet, nicht gesetzt. Eine feste Zahl („mindestens acht") haette
 * die elf Raeume mit einer Ebene getroffen und Fiona dazu, deren
 * Laenderrunden wegen `laenderTiefe` drei Aufgaben lang sind. Bei einer
 * Ebene ist die eigene Runde die beste, die Bedingung ist dann immer
 * wahr.
 *
 * `groessen` sind die Vorratsgroessen der Ebenen des Raums. Eine, die
 * gerade nicht zu haben ist (eine Karte, die noch nicht geladen wurde),
 * gehoert nicht hinein: sie macht die Grenze dann kleiner und nie
 * groesser - eine Grenze, die an einem Ladezustand haengt, darf nicht
 * strenger werden.
 */
export const besteRunde = (groessen, sitzung) =>
  Math.min(sitzung, Math.max(0, ...groessen.filter(n => n > 0)) || sitzung);

/**
 * Was drei Tiere kosten - in richtigen Antworten, auf dem billigeren
 * der beiden Wege.
 *
 * Ueber die fertigen Ebenen: die kleinsten zuerst, je Gegenstand ZWEI
 * richtige Antworten (Fach 1 → 2 → 3, und ab Fach 3 gibt es den
 * Aufkleber). Ueber die fehlerfreien Runden: je Tier eine volle Runde.
 */
export function preisVon({ tiere, ebenen, groessen, sitzung }) {
  const n = groessen.filter(x => x > 0).sort((a, b) => a - b);
  if (!n.length) return null;
  const anteil = anteilVon({ tiere: { length: tiere }, ebenen: { length: ebenen } });
  const noetig = Math.ceil(tiere / Math.max(1, anteil));
  const ueberFertig = n.slice(0, noetig).reduce((a, x) => a + x, 0) * 2;
  const runde = besteRunde(n, sitzung);
  return { preis: Math.min(ueberFertig, tiere * runde), runde, anteil };
}
