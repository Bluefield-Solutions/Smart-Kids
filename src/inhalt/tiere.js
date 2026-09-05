/* Die Tiere - Fionas Sammelalbum (T1).
 *
 * ZWEI DINGE STEHEN HIER, und sie sind mit Absicht EINE Liste:
 *
 *   DER PLAN   alles, was einmal dazugehoeren soll - 124 Stueck, so wie
 *              Stephan sie geschickt hat, in seiner Reihenfolge.
 *   DAS BILD   die, die schon gemalt sind. `bild` fehlt beim Rest.
 *
 * Zwei Listen waeren zwei Wahrheiten (Regel 6: was zweimal dasteht,
 * veraltet einmal) - und die eine, die man beim Nachtragen vergisst, waere
 * genau die mit den Bildern. `gemalt()` ist der Vorrat, `PLAN` ist er auch;
 * `inhalt` zaehlt beide auseinander und meldet den Stand.
 *
 * DER GORILLA IST DER EINZIGE AFFE, und er ist die Ausnahme in allem:
 * er wird nicht verdient, sondern kommt, wenn eine Runde NICHT fehlerfrei
 * war. Deshalb steht er nicht im Vorrat der Belohnungen (`belohnungen()`),
 * und deshalb hat er ein freundliches Gesicht: er sagt „komm, nochmal",
 * nicht „das war schlecht". Ein sechsjaehriges Kind liest einen Ausdruck,
 * bevor es einen Satz liest.
 *
 * WARUM DIE FARBEN ROH DASTEHEN und nicht aus `marken.css` kommen: ein
 * Fuchs ist orange, ein Panda schwarzweiss. Das ist keine Gestaltung,
 * sondern die Sache selbst - dieselbe Begruendung wie bei den Farben der
 * Englischebene (E3). Ein Fuchs, der im Abendmodus grau wird, ist kein
 * Fuchs mehr.
 *
 * WARUM SVG UND KEIN BILD: die App ist EINE Datei und laedt nichts nach.
 * 124 Bilder waeren 124 Dateien; als Pfade kosten sie ein paar hundert
 * Byte das Stueck und sind bei jeder Groesse scharf. Der Preis: jedes
 * muss gezeichnet werden, und das dauert. Deshalb der Plan.
 *
 * KEIN `transform`, KEIN `<circle>` - dieselbe Messstelle wie beim
 * Englischbild (E3): `passt` misst die gezeichnete Ausdehnung je PFAD im
 * eigenen Koordinatenraum. Eine Gruppentransformation faellt dabei
 * heraus, ein `<circle>` wird gar nicht gefunden, und heraus kommt eine
 * Zahl, die mit dem Bild nichts zu tun hat. `inhalt` setzt es durch.
 *
 * Der Rahmen ist bei ALLEN `0 0 48 48`. Eine Kachelwand mit gemischten
 * Rahmen haette Tiere in verschiedenen Groessen - und der Elefant waere
 * so gross wie die Maus oder umgekehrt, je nachdem wer den Rahmen enger
 * gezeichnet hat.
 */
export const RAHMEN = '0 0 48 48';

/* Der Affe, der keiner ist. Seine Kennung steht hier und nicht an drei
   Stellen im Spiel - wer ihn umbenennt, benennt ihn einmal um. */
export const GORILLA = 'gorilla';

export const TIERE = [
  { id:'maus', name:'die Maus', art:'tier', zeichen:'🐭' },
  { id:'panda', name:'der Panda', art:'tier', zeichen:'🐼' },
  { id:'baer', name:'der Bär', art:'tier', zeichen:'🐻' },
  { id:'fuchs', name:'der Fuchs', art:'tier', zeichen:'🦊',
    bild:'<path d="M11 22.5c-4.4 1-7.2 5-7.2 10.2 0 5.4 3.2 8.8 8 8.8 1.7 0 3-.5 4-1.4-3.2-.6-5.2-3-5.2-6.4 0-2.4 1-4.4 2.8-5.6z" fill="#e07a34"/><path d="M9.4 34.2c-.5 3.4 1.6 6.2 5.4 6.8-1 .9-2.3 1.4-4 1.4-3 0-5.2-1.6-6.2-4.2 1.2-1.8 2.8-3.2 4.8-4z" fill="#f3ece2"/><path d="M24 16c7.6 0 12.4 5.4 12.4 13.6v7.6c0 2.6-1.6 4.2-4.4 4.2H16c-2.8 0-4.4-1.6-4.4-4.2v-7.6C11.6 21.4 16.4 16 24 16z" fill="#e8853a"/><path d="M24 27c3.6 0 6 2.6 6 6.8v3.6c0 2.6-1.4 4-4 4h-4c-2.6 0-4-1.4-4-4v-3.6c0-4.2 2.4-6.8 6-6.8z" fill="#f7f1e8"/><path d="M14.4 4.6c.6-.4 1.3-.2 1.9.4l5.4 6.2c-2.6.5-4.8 1.6-6.6 3.2l-1-8.2c-.1-.8 0-1.3.3-1.6z" fill="#e8853a"/><path d="M33.6 4.6c-.6-.4-1.3-.2-1.9.4l-5.4 6.2c2.6.5 4.8 1.6 6.6 3.2l1-8.2c.1-.8 0-1.3-.3-1.6z" fill="#e8853a"/><path d="M15.2 6.4l3.6 4.2c-1.2.4-2.3 1-3.2 1.7z" fill="#3a3138"/><path d="M32.8 6.4l-3.6 4.2c1.2.4 2.3 1 3.2 1.7z" fill="#3a3138"/><path d="M24 10.4c6 0 10.2 4 10.2 9.8S30 30.2 24 30.2 13.8 26 13.8 20.2 18 10.4 24 10.4z" fill="#ef9350"/><path d="M24 19.6c3.8 0 6.4 2.4 6.4 6.2s-2.6 5.8-6.4 5.8-6.4-2.2-6.4-5.8 2.6-6.2 6.4-6.2z" fill="#f7f1e8"/><path d="M19.6 18c1 0 1.8.9 1.8 2s-.8 2-1.8 2-1.8-.9-1.8-2 .8-2 1.8-2z" fill="#33292f"/><path d="M28.4 18c1 0 1.8.9 1.8 2s-.8 2-1.8 2-1.8-.9-1.8-2 .8-2 1.8-2z" fill="#33292f"/><path d="M24 23.6c1.5 0 2.5.8 2.5 1.9s-1 1.8-2.5 1.8-2.5-.7-2.5-1.8 1-1.9 2.5-1.9z" fill="#33292f"/>' },
  { id:'koala', name:'der Koala', art:'tier', zeichen:'🐨',
    bild:'<path d="M10.6 8.6c4.6 0 7.6 3.2 7.6 8.2s-3 8.2-7.6 8.2S3 21.8 3 16.8s3-8.2 7.6-8.2z" fill="#98a2ac"/><path d="M37.4 8.6c4.6 0 7.6 3.2 7.6 8.2s-3 8.2-7.6 8.2-7.6-3.2-7.6-8.2 3-8.2 7.6-8.2z" fill="#98a2ac"/><path d="M10.6 12.4c2.6 0 4.4 1.8 4.4 4.4s-1.8 4.4-4.4 4.4-4.4-1.8-4.4-4.4 1.8-4.4 4.4-4.4z" fill="#cfd6dc"/><path d="M37.4 12.4c2.6 0 4.4 1.8 4.4 4.4s-1.8 4.4-4.4 4.4-4.4-1.8-4.4-4.4 1.8-4.4 4.4-4.4z" fill="#cfd6dc"/><path d="M24 24.4c7 0 11.4 4.4 11.4 11.2v3.2c0 3-2 4.8-5.4 4.8H18c-3.4 0-5.4-1.8-5.4-4.8v-3.2c0-6.8 4.4-11.2 11.4-11.2z" fill="#8d97a1"/><path d="M24 31c4 0 6.6 2.6 6.6 6.6 0 3.4-2.4 5.4-6.6 5.4s-6.6-2-6.6-5.4c0-4 2.6-6.6 6.6-6.6z" fill="#b9c1c8"/><path d="M24 5c7.6 0 12.6 5 12.6 12.6S31.6 30.2 24 30.2 11.4 25.2 11.4 17.6 16.4 5 24 5z" fill="#98a2ac"/><path d="M18.6 14.4c1.3 0 2.2 1 2.2 2.4s-.9 2.4-2.2 2.4-2.2-1-2.2-2.4.9-2.4 2.2-2.4z" fill="#282e35"/><path d="M29.4 14.4c1.3 0 2.2 1 2.2 2.4s-.9 2.4-2.2 2.4-2.2-1-2.2-2.4.9-2.4 2.2-2.4z" fill="#282e35"/><path d="M24 18.6c3.4 0 5.6 1.8 5.6 4.6 0 3-2.2 5-5.6 5s-5.6-2-5.6-5c0-2.8 2.2-4.6 5.6-4.6z" fill="#3b434d"/><path d="M21.6 20.2c1.2-.6 2.4-.6 3.4.2-1.2.2-2.3.6-3.4 1.2z" fill="#6a747f"/>' },
  { id:'hase', name:'der Hase', art:'tier', zeichen:'🐰' },
  { id:'gorilla', name:'der Gorilla', art:'tier', zeichen:'🦍',
    bild:'<path d="M12.6 26.4c-3.6.5-6 3.5-6 8 0 3.8 1.4 6.3 3.7 6.7 2 .4 3.4-1 3.4-3.4V27.6z" fill="#3f444c"/><path d="M35.4 26.4c3.6.5 6 3.5 6 8 0 3.8-1.4 6.3-3.7 6.7-2 .4-3.4-1-3.4-3.4V27.6z" fill="#3f444c"/><path d="M24 20.5c7.6 0 11.8 4.6 11.8 11.4v5.6c0 3.2-2.1 5-5.4 5H17.6c-3.3 0-5.4-1.8-5.4-5v-5.6c0-6.8 4.2-11.4 11.8-11.4z" fill="#4a505a"/><path d="M24 27c4.6 0 7.6 2.9 7.6 7.2 0 4-3 6.6-7.6 6.6s-7.6-2.6-7.6-6.6c0-4.3 3-7.2 7.6-7.2z" fill="#6d747e"/><path d="M14.6 9.6c-2.4 0-4 1.7-4 4s1.6 4 4 4 4-1.7 4-4-1.6-4-4-4z" fill="#3f444c"/><path d="M33.4 9.6c-2.4 0-4 1.7-4 4s1.6 4 4 4 4-1.7 4-4-1.6-4-4-4z" fill="#3f444c"/><path d="M24 5c6.2 0 10.4 4.2 10.4 10.2S30.2 25.4 24 25.4 13.6 21.2 13.6 15.2 17.8 5 24 5z" fill="#4a505a"/><path d="M24 12.4c4.2 0 7 2.6 7 6.4s-2.8 6.2-7 6.2-7-2.4-7-6.2 2.8-6.4 7-6.4z" fill="#8f959e"/><path d="M20.2 14.8c.9 0 1.6.8 1.6 1.8s-.7 1.8-1.6 1.8-1.6-.8-1.6-1.8.7-1.8 1.6-1.8z" fill="#20242a"/><path d="M27.8 14.8c.9 0 1.6.8 1.6 1.8s-.7 1.8-1.6 1.8-1.6-.8-1.6-1.8.7-1.8 1.6-1.8z" fill="#20242a"/><path d="M20.6 20.4c1.1 1.2 2.2 1.8 3.4 1.8s2.3-.6 3.4-1.8c-.5 2.2-1.6 3.3-3.4 3.3s-2.9-1.1-3.4-3.3z" fill="#20242a"/><path d="M17.4 9.4c2-1.8 4.2-2.7 6.6-2.7s4.6.9 6.6 2.7c-1.9-.9-4.1-1.4-6.6-1.4s-4.7.5-6.6 1.4z" fill="#2d3138"/>' },
  { id:'vogel', name:'der Vogel', art:'tier', zeichen:'🐦' },
  { id:'pinguin', name:'der Pinguin', art:'tier', zeichen:'🐧',
    bild:'<path d="M9.6 27.4c-1.6 1.5-2.6 4-2.6 7 0 3.4 1.2 5.8 3 6.4v-14z" fill="#2f3540"/><path d="M38.4 27.4c1.6 1.5 2.6 4 2.6 7 0 3.4-1.2 5.8-3 6.4v-14z" fill="#2f3540"/><path d="M24 5c8.2 0 13 6 13 15.8v13.4C37 40.4 32.4 44 24 44S11 40.4 11 34.2V20.8C11 11 15.8 5 24 5z" fill="#2f3540"/><path d="M24 15.6c4.8 0 7.8 3.6 7.8 9.8v8.6c0 4.4-2.6 6.8-7.8 6.8s-7.8-2.4-7.8-6.8v-8.6c0-6.2 3-9.8 7.8-9.8z" fill="#fbfbf8"/><path d="M19.4 12.4c1.1 0 2 1 2 2.2s-.9 2.2-2 2.2-2-1-2-2.2.9-2.2 2-2.2z" fill="#fbfbf8"/><path d="M28.6 12.4c1.1 0 2 1 2 2.2s-.9 2.2-2 2.2-2-1-2-2.2.9-2.2 2-2.2z" fill="#fbfbf8"/><path d="M19.6 13.4c.7 0 1.2.6 1.2 1.4s-.5 1.4-1.2 1.4-1.2-.6-1.2-1.4.5-1.4 1.2-1.4z" fill="#20242c"/><path d="M28.4 13.4c.7 0 1.2.6 1.2 1.4s-.5 1.4-1.2 1.4-1.2-.6-1.2-1.4.5-1.4 1.2-1.4z" fill="#20242c"/><path d="M24 17.2c2.3 0 3.9 1.3 3.9 2.9 0 1.8-1.6 3.1-3.9 3.1s-3.9-1.3-3.9-3.1c0-1.6 1.6-2.9 3.9-2.9z" fill="#f2a23c"/><path d="M18.6 43c-.4 1.4-1.8 2.2-3.8 2.2-2.2 0-3.4-.8-3.4-1.8 0-.9.9-1.5 2.6-1.8z" fill="#f2a23c"/><path d="M29.4 43c.4 1.4 1.8 2.2 3.8 2.2 2.2 0 3.4-.8 3.4-1.8 0-.9-.9-1.5-2.6-1.8z" fill="#f2a23c"/>' },
  { id:'tiger', name:'der Tiger', art:'tier', zeichen:'🐯' },
  { id:'loewe', name:'der Löwe', art:'tier', zeichen:'🦁',
    bild:'<path d="M24 3c11.6 0 19 7.4 19 19s-7.4 19-19 19S5 33.6 5 22 12.4 3 24 3z" fill="#c07a2e"/><path d="M24 6.2l3.4 3.4 4.6-1.6-.6 4.8 4.6 1.8-3.4 3.4 2.6 4.1-4.8.8-.2 4.9-4.4-2-3.8 3-2-4.4-4.9.5 1.2-4.7-4.3-2.4 3.8-3.1-1.6-4.6 4.9.4 1.4-4.7z" fill="#cf8a37"/><path d="M13.6 33.4c1.9 0 3.2 1.3 3.2 3.4v4.4c0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5v-4.4c0-2.1.4-3.4 1.8-3.4z" fill="#e0a94f"/><path d="M34.4 33.4c1.9 0 3.2 1.3 3.2 3.4v4.4c0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5v-4.4c0-2.1.4-3.4 1.8-3.4z" fill="#e0a94f"/><path d="M24 24.6c7.4 0 12 4.2 12 11v3.2c0 2.8-1.8 4.4-5 4.4H17c-3.2 0-5-1.6-5-4.4v-3.2c0-6.8 4.6-11 12-11z" fill="#e0a94f"/><path d="M15.4 6.6c2.6 0 4.4 1.9 4.4 4.6s-1.8 4.6-4.4 4.6-4.4-1.9-4.4-4.6 1.8-4.6 4.4-4.6z" fill="#c07a2e"/><path d="M32.6 6.6c2.6 0 4.4 1.9 4.4 4.6s-1.8 4.6-4.4 4.6-4.4-1.9-4.4-4.6 1.8-4.6 4.4-4.6z" fill="#c07a2e"/><path d="M24 7.4c6.8 0 11.2 4.4 11.2 11.2S30.8 29.8 24 29.8 12.8 25.4 12.8 18.6 17.2 7.4 24 7.4z" fill="#f0c069"/><path d="M19.4 15.6c1.1 0 1.9 1 1.9 2.2s-.8 2.2-1.9 2.2-1.9-1-1.9-2.2.8-2.2 1.9-2.2z" fill="#3b2a13"/><path d="M28.6 15.6c1.1 0 1.9 1 1.9 2.2s-.8 2.2-1.9 2.2-1.9-1-1.9-2.2.8-2.2 1.9-2.2z" fill="#3b2a13"/><path d="M24 20.4c1.9 0 3.2 1 3.2 2.4 0 1.6-1.3 2.6-3.2 2.6s-3.2-1-3.2-2.6c0-1.4 1.3-2.4 3.2-2.4z" fill="#3b2a13"/><path d="M20.6 25.4c1.1 1.1 2.2 1.7 3.4 1.7s2.3-.6 3.4-1.7c-.5 2.1-1.6 3.2-3.4 3.2s-2.9-1.1-3.4-3.2z" fill="#8a5a20"/>' },
  { id:'schwein', name:'das Schwein', art:'tier', zeichen:'🐷' },
  { id:'kueken', name:'das Küken', art:'tier', zeichen:'🐥' },
  { id:'schluepfendes-kueken', name:'das schlüpfende Küken', art:'tier', zeichen:'🐣' },
  { id:'eule', name:'die Eule', art:'tier', zeichen:'🦉',
    bild:'<path d="M10.4 6.6c-.9-.6-1.9-.3-2.3.8l-2 5.4c1.6-1 3.4-1.7 5.4-2.1z" fill="#6b4c33"/><path d="M37.6 6.6c.9-.6 1.9-.3 2.3.8l2 5.4c-1.6-1-3.4-1.7-5.4-2.1z" fill="#6b4c33"/><path d="M24 8c9.4 0 15.4 6.6 15.4 16.8 0 9-5.8 14.6-15.4 14.6S8.6 33.8 8.6 24.8C8.6 14.6 14.6 8 24 8z" fill="#8a6647"/><path d="M24 24c5 0 8.2 3 8.2 7.8 0 4.6-3.2 7.6-8.2 7.6s-8.2-3-8.2-7.6c0-4.8 3.2-7.8 8.2-7.8z" fill="#c9a97f"/><path d="M16.6 12.6c4.2 0 7 2.9 7 7.2s-2.8 7.2-7 7.2-7-2.9-7-7.2 2.8-7.2 7-7.2z" fill="#e9dcc6"/><path d="M31.4 12.6c4.2 0 7 2.9 7 7.2s-2.8 7.2-7 7.2-7-2.9-7-7.2 2.8-7.2 7-7.2z" fill="#e9dcc6"/><path d="M16.6 15.8c2.3 0 4 1.8 4 4.2s-1.7 4.2-4 4.2-4-1.8-4-4.2 1.7-4.2 4-4.2z" fill="#2c2620"/><path d="M31.4 15.8c2.3 0 4 1.8 4 4.2s-1.7 4.2-4 4.2-4-1.8-4-4.2 1.7-4.2 4-4.2z" fill="#2c2620"/><path d="M24 19.6c1.3 0 2.2.9 2.2 2.2l-2.2 4.4-2.2-4.4c0-1.3.9-2.2 2.2-2.2z" fill="#e8a33e"/><path d="M18.4 40.2c1.4 0 2.4.9 2.4 2.2s-1 2.2-2.4 2.2-2.4-.9-2.4-2.2 1-2.2 2.4-2.2z" fill="#e8a33e"/><path d="M29.6 40.2c1.4 0 2.4.9 2.4 2.2s-1 2.2-2.4 2.2-2.4-.9-2.4-2.2 1-2.2 2.4-2.2z" fill="#e8a33e"/>' },
  { id:'adler', name:'der Adler', art:'tier', zeichen:'🦅' },
  { id:'amsel', name:'die Amsel', art:'tier', zeichen:'🐦‍⬛' },
  { id:'ente', name:'die Ente', art:'tier', zeichen:'🦆' },
  { id:'wolf', name:'der Wolf', art:'tier', zeichen:'🐺' },
  { id:'einhorn', name:'das Einhorn', art:'tier', zeichen:'🦄' },
  { id:'elch', name:'der Elch', art:'tier', zeichen:'🫎' },
  { id:'schmetterling', name:'der Schmetterling', art:'tier', zeichen:'🦋',
    bild:'<path d="M22.4 9.6c-4.8-4.6-9.6-6.2-13.4-4.4C5 7.2 3.6 11.6 5 17c1.4 5.4 5.2 8.6 10 8.6 3 0 5.6-1.2 7.4-3.2z" fill="#5b7fd4"/><path d="M25.6 9.6c4.8-4.6 9.6-6.2 13.4-4.4 4 1.9 5.4 6.4 4 11.8-1.4 5.4-5.2 8.6-10 8.6-3 0-5.6-1.2-7.4-3.2z" fill="#5b7fd4"/><path d="M22.4 24.8c-3.4-2.8-7-3.6-10-2.2-3.2 1.5-4.6 4.8-3.6 8.6 1 3.8 3.9 6 7.6 6 2.8 0 5.2-1.2 6.6-3.2z" fill="#8aa8ea"/><path d="M25.6 24.8c3.4-2.8 7-3.6 10-2.2 3.2 1.5 4.6 4.8 3.6 8.6-1 3.8-3.9 6-7.6 6-2.8 0-5.2-1.2-6.6-3.2z" fill="#8aa8ea"/><path d="M13.6 10.8c2.6.2 5 1.4 7.2 3.6-2.6.4-5 .2-7.2-.8z" fill="#e8c447"/><path d="M34.4 10.8c-2.6.2-5 1.4-7.2 3.6 2.6.4 5 .2 7.2-.8z" fill="#e8c447"/><path d="M24 8c1.7 0 2.9 1.3 2.9 3.2v22.4c0 3.6-1 6-2.9 8-1.9-2-2.9-4.4-2.9-8V11.2C21.1 9.3 22.3 8 24 8z" fill="#3a3f52"/><path d="M20.6 3.4c.6-.4 1.3-.2 1.7.5l2.1 3.6c-1 .2-1.9.7-2.6 1.4l-1.7-3.7c-.3-.7-.1-1.4.5-1.8z" fill="#3a3f52"/><path d="M27.4 3.4c-.6-.4-1.3-.2-1.7.5l-2.1 3.6c1 .2 1.9.7 2.6 1.4l1.7-3.7c.3-.7.1-1.4-.5-1.8z" fill="#3a3f52"/>' },
  { id:'schildkroete', name:'die Schildkröte', art:'tier', zeichen:'🐢',
    bild:'<path d="M37.6 22.4c3.4 0 5.8 2.2 5.8 5.4 0 3-2 5-5 5.2l.6 2.4c.2.9-.3 1.6-1.2 1.6-.7 0-1.2-.4-1.4-1.1l-.9-3.3c-2.2-.9-3.6-2.8-3.6-5.2 0-3.2 2.3-5 5.7-5z" fill="#8cc48d"/><path d="M40.2 26.2c.8 0 1.4.7 1.4 1.6s-.6 1.6-1.4 1.6-1.4-.7-1.4-1.6.6-1.6 1.4-1.6z" fill="#2f3a2f"/><path d="M11.4 33.6c1.7 0 3 1.2 3 3v3.6c0 1.4-.9 2.3-2.3 2.3s-2.3-.9-2.3-2.3v-3.2c0-2.1.6-3.4 1.6-3.4z" fill="#8cc48d"/><path d="M32 33.6c1.7 0 3 1.2 3 3v3.6c0 1.4-.9 2.3-2.3 2.3s-2.3-.9-2.3-2.3v-3.2c0-2.1.6-3.4 1.6-3.4z" fill="#8cc48d"/><path d="M8.6 26.6c-1.6-.6-3-.2-3.8 1-.9 1.3-.6 2.8.6 3.7l2.6 1.9 1.6-5.4z" fill="#8cc48d"/><path d="M22 11.4c9 0 15 5.6 15 14.4 0 5.6-2.6 8.6-7.4 8.6H14.4c-4.8 0-7.4-3-7.4-8.6 0-8.8 6-14.4 15-14.4z" fill="#4e9a63"/><path d="M22 15.6c6.4 0 10.6 3.9 10.6 10 0 3.4-1.6 5.2-4.6 5.2H16c-3 0-4.6-1.8-4.6-5.2 0-6.1 4.2-10 10.6-10z" fill="#67b478"/><path d="M22 18.6c1.9 0 3.2 1.3 3.2 3.2S23.9 25 22 25s-3.2-1.3-3.2-3.2 1.3-3.2 3.2-3.2z" fill="#4e9a63"/><path d="M14.4 22.8c1.6 0 2.7 1.1 2.7 2.7s-1.1 2.7-2.7 2.7-2.7-1.1-2.7-2.7 1.1-2.7 2.7-2.7z" fill="#4e9a63"/><path d="M29.6 22.8c1.6 0 2.7 1.1 2.7 2.7s-1.1 2.7-2.7 2.7-2.7-1.1-2.7-2.7 1.1-2.7 2.7-2.7z" fill="#4e9a63"/><path d="M22 27.8c1.6 0 2.7 1.1 2.7 2.7s-1.1 2.7-2.7 2.7-2.7-1.1-2.7-2.7 1.1-2.7 2.7-2.7z" fill="#4e9a63"/>' },
  { id:'schlange', name:'die Schlange', art:'tier', zeichen:'🐍',
    bild:'<path d="M43.4 37.6c-2.6 2.4-6 3.6-10.2 3.6-4.6 0-8-1.4-10.2-4.2-1.8-2.3-4.2-3.4-7.2-3.4-2.6 0-4.6.8-6 2.4-.8.9-2 1-2.8.2-.9-.8-1-1.9-.2-2.8 2.2-2.5 5.2-3.8 9-3.8 4.2 0 7.6 1.6 10.2 4.8 1.6 2 3.9 3 7.2 3 3.4 0 6-1 7.8-3z" fill="#4d8a3c"/><path d="M14.6 25.6c4.4 0 8 1.7 10.8 5 1.5 1.8 3.4 2.7 5.8 2.7 2.6 0 4.6-1 6.2-3 .7-1 1.8-1.1 2.7-.4 1 .7 1.1 1.8.4 2.7-2.3 3-5.4 4.5-9.3 4.5-3.6 0-6.6-1.4-9-4.2-2-2.3-4.5-3.5-7.6-3.5-2.2 0-4 .5-5.4 1.5-.9.6-2 .4-2.6-.5-.6-.9-.4-2 .5-2.6 2-1.5 4.5-2.2 7.5-2.2z" fill="#6cb054"/><path d="M13.6 12.6c1.6-1 3-.7 4.2.9l4.4 6c-1.6.5-3 1.4-4.2 2.6l-4.8-6.2c-1-1.3-.8-2.5.4-3.3z" fill="#6cb054"/><path d="M12.6 4.6c4.6 0 7.6 3 7.6 7.6s-3 7.6-7.6 7.6S5 16.8 5 12.2s3-7.6 7.6-7.6z" fill="#7cbf62"/><path d="M9.6 9.4c1 0 1.8.9 1.8 2s-.8 2-1.8 2-1.8-.9-1.8-2 .8-2 1.8-2z" fill="#23301c"/><path d="M16.6 9.4c1 0 1.8.9 1.8 2s-.8 2-1.8 2-1.8-.9-1.8-2 .8-2 1.8-2z" fill="#23301c"/><path d="M12.8 17.6c.6-.1 1.1.3 1.2 1l.3 2.6 2.4.6c.6.2 1 .7.8 1.3-.1.6-.7 1-1.3.8l-2.6-.7-2.1 1.6c-.5.4-1.1.3-1.5-.2-.4-.5-.3-1.1.2-1.5l2.1-1.6-.3-2.6c-.1-.7.2-1.2.8-1.3z" fill="#c8455a"/><path d="M11.6 27.4c1.3 0 2.2.9 2.2 2.2s-.9 2.2-2.2 2.2-2.2-.9-2.2-2.2.9-2.2 2.2-2.2z" fill="#4d8a3c"/><path d="M22.6 30.6c1.3 0 2.2.9 2.2 2.2s-.9 2.2-2.2 2.2-2.2-.9-2.2-2.2.9-2.2 2.2-2.2z" fill="#4d8a3c"/><path d="M33.6 33.6c1.3 0 2.2.9 2.2 2.2s-.9 2.2-2.2 2.2-2.2-.9-2.2-2.2.9-2.2 2.2-2.2z" fill="#3d7030"/>' },
  { id:'eidechse', name:'die Eidechse', art:'tier', zeichen:'🦎' },
  { id:'tyrannosaurus', name:'der Tyrannosaurus', art:'tier', zeichen:'🦖' },
  { id:'langhalssaurier', name:'der Langhalssaurier', art:'tier', zeichen:'🦕' },
  { id:'krake', name:'der Krake', art:'tier', zeichen:'🐙' },
  { id:'tintenfisch', name:'der Tintenfisch', art:'tier', zeichen:'🦑' },
  { id:'delfin', name:'der Delfin', art:'tier', zeichen:'🐬',
    bild:'<path d="M3.4 30.6c-1.9.2-3.4-.2-4.6-1.2 1-.3 1.8-.9 2.4-1.8z" fill="#c9d8e8"/><path d="M9.6 22.6c-3.4-.4-6.2.3-8.4 2.1-.9.7-1 1.8-.3 2.6.6.8 1.7.9 2.6.2 1.6-1.2 3.6-1.6 6.1-1.2z" fill="#7ba3cc"/><path d="M18.6 10.6c9 0 15.2 4 18.2 11.2l8.6 4.4c1 .5 1.6 1.3 1.6 2.3s-.6 1.8-1.6 2.3l-9.4 4.6c-3.4 4.2-8 6.4-13.6 6.4C10.2 41.8 4 36.4 4 28c0-11 5-17.4 14.6-17.4z" fill="#7ba3cc"/><path d="M16.6 27.4c9.4 0 14.6 2.2 14.6 6.2 0 4.3-4.6 7-11.6 7C12 40.6 5 35.4 5 29c0-2.2.5-3.4 1.5-3.4.8 0 1.4.9 2 2.4.9 1.4 4.6 1.4 8.1 1.4z" fill="#e9f0f7"/><path d="M22.4 3.2c1.2-.8 2.4-.5 3.2.8 1.9 2.9 2.6 7 2 12.2-1.8-3-4.1-5.4-6.9-7.2-1.2-.8-1.4-2-.4-3.4z" fill="#7ba3cc"/><path d="M17.4 30.8c-2.4 2.2-3.6 4.6-3.6 7.2-2-1.4-2.8-3.4-2.4-5.8z" fill="#5b83ad"/><path d="M45.8 24.4c1.2-.4 2 .2 2.2 1.6.2 1.6-.4 3.4-1.6 5.4 1.2 2 1.8 3.8 1.6 5.4-.2 1.4-1 2-2.2 1.6-2-.7-3.8-2.6-5.4-5.6z" fill="#5b83ad"/><path d="M12.8 21.4c1.2 0 2.1 1 2.1 2.3s-.9 2.3-2.1 2.3-2.1-1-2.1-2.3.9-2.3 2.1-2.3z" fill="#25334a"/><path d="M7.6 31.2c2.6 1.6 5.4 2.4 8.4 2.4-2.6 1.4-5.4 1.4-8.4 0z" fill="#cfdded"/>' },
  { id:'krabbe', name:'die Krabbe', art:'tier', zeichen:'🦀',
    bild:'<path d="M9.6 33.4c-1.4 1-2.6 2.4-3.4 4.2-.4.9-1.3 1.2-2.1.8-.8-.4-1.1-1.3-.7-2.2 1.1-2.4 2.7-4.3 4.8-5.6z" fill="#c8442f"/><path d="M38.4 33.4c1.4 1 2.6 2.4 3.4 4.2.4.9 1.3 1.2 2.1.8.8-.4 1.1-1.3.7-2.2-1.1-2.4-2.7-4.3-4.8-5.6z" fill="#c8442f"/><path d="M12.4 36.6c-1 1.4-1.6 3-1.8 4.9-.1 1-.9 1.6-1.8 1.5-.9-.1-1.5-.9-1.4-1.9.3-2.5 1.2-4.7 2.6-6.5z" fill="#c8442f"/><path d="M35.6 36.6c1 1.4 1.6 3 1.8 4.9.1 1 .9 1.6 1.8 1.5.9-.1 1.5-.9 1.4-1.9-.3-2.5-1.2-4.7-2.6-6.5z" fill="#c8442f"/><path d="M10.6 14.6c3.4 0 5.8 2.4 5.8 5.8 0 1.8-.7 3.3-1.9 4.3l2.9 3.2c.7.8.6 1.8-.2 2.4-.8.6-1.8.4-2.4-.4l-3.2-4c-3.4-.2-5.6-2.5-5.6-5.7 0-3.4 2.2-5.6 4.6-5.6z" fill="#d9503a"/><path d="M8.8 15.6c2.4 0 4 1.7 4 4.2 0 1.4-.5 2.5-1.4 3.2l-1.2-2.8-1.6 2.9c-2-.5-3.2-2-3.2-4 0-2.2 1.6-3.5 3.4-3.5z" fill="#e8674f"/><path d="M37.4 14.6c-3.4 0-5.8 2.4-5.8 5.8 0 1.8.7 3.3 1.9 4.3l-2.9 3.2c-.7.8-.6 1.8.2 2.4.8.6 1.8.4 2.4-.4l3.2-4c3.4-.2 5.6-2.5 5.6-5.7 0-3.4-2.2-5.6-4.6-5.6z" fill="#d9503a"/><path d="M39.2 15.6c-2.4 0-4 1.7-4 4.2 0 1.4.5 2.5 1.4 3.2l1.2-2.8 1.6 2.9c2-.5 3.2-2 3.2-4 0-2.2-1.6-3.5-3.4-3.5z" fill="#e8674f"/><path d="M24 20.4c7.6 0 12.4 4 12.4 10.4 0 5.2-4.4 8.4-12.4 8.4s-12.4-3.2-12.4-8.4c0-6.4 4.8-10.4 12.4-10.4z" fill="#e05540"/><path d="M18.4 9.6c1.3 0 2.2.9 2.2 2.2v8.8c-1.5.1-2.9.4-4.2.8v-9.6c0-1.3.7-2.2 2-2.2z" fill="#d9503a"/><path d="M29.6 9.6c-1.3 0-2.2.9-2.2 2.2v8.8c1.5.1 2.9.4 4.2.8v-9.6c0-1.3-.7-2.2-2-2.2z" fill="#d9503a"/><path d="M18.4 6.2c1.9 0 3.2 1.4 3.2 3.4s-1.3 3.4-3.2 3.4-3.2-1.4-3.2-3.4 1.3-3.4 3.2-3.4z" fill="#fbf7f2"/><path d="M29.6 6.2c1.9 0 3.2 1.4 3.2 3.4s-1.3 3.4-3.2 3.4-3.2-1.4-3.2-3.4 1.3-3.4 3.2-3.4z" fill="#fbf7f2"/><path d="M18.4 8c.9 0 1.5.7 1.5 1.6s-.6 1.6-1.5 1.6-1.5-.7-1.5-1.6.6-1.6 1.5-1.6z" fill="#2a1d18"/><path d="M29.6 8c.9 0 1.5.7 1.5 1.6s-.6 1.6-1.5 1.6-1.5-.7-1.5-1.6.6-1.6 1.5-1.6z" fill="#2a1d18"/><path d="M20 29.6c1.4 1.2 2.7 1.8 4 1.8s2.6-.6 4-1.8c-.6 2-2 3-4 3s-3.4-1-4-3z" fill="#8d2c1e"/>' },
  { id:'fisch', name:'der Fisch', art:'tier', zeichen:'🐟' },
  { id:'korallenfisch', name:'der Korallenfisch', art:'tier', zeichen:'🐠' },
  { id:'kugelfisch', name:'der Kugelfisch', art:'tier', zeichen:'🐡' },
  { id:'wal', name:'der Wal', art:'tier', zeichen:'🐋',
    bild:'<path d="M38.6 20.4c1.6-2.4 3.4-4.2 5.4-5.4 1.4-.8 2.4-.4 2.6 1 .3 2.2-.6 5.4-2.6 9.6 2 4.2 2.9 7.4 2.6 9.6-.2 1.4-1.2 1.8-2.6 1-2-1.2-3.8-3-5.4-5.4z" fill="#3f6ea8"/><path d="M17.8 12.6c12 0 20.2 5.4 20.2 14.8S29.8 42 17.8 42C9.2 42 3 36 3 27.4s6.2-14.8 14.8-14.8z" fill="#4c81c1"/><path d="M14.8 30.6c9.6 0 16.2 1.9 16.2 5.4 0 3.4-6 6-14 6C8.6 42 3 36.6 3 29.4c0-2.6.4-4 1.4-4 .8 0 1.4 1 2 2.8.8 1.6 4 2.4 8.4 2.4z" fill="#e7eef7"/><path d="M27 15.6c2.6 1.4 4.6 3.2 6 5.4-2.4-.9-4.7-1.5-7-1.8z" fill="#3f6ea8"/><path d="M9.6 21c1.2 0 2.1 1 2.1 2.3s-.9 2.3-2.1 2.3-2.1-1-2.1-2.3.9-2.3 2.1-2.3z" fill="#22304a"/><path d="M17.4 11.2c-.5-2.4-.2-4.4 1-6.2.6-.9 1.7-1 2.5-.3.8.6.9 1.6.3 2.5-.7 1-.9 2.2-.6 3.6z" fill="#9dc0e4"/><path d="M14.6 11.8c-1.7-1.6-3.5-2.4-5.4-2.4-1.1 0-1.8.8-1.8 1.8s.7 1.7 1.8 1.8c1 0 2 .3 3 .9z" fill="#9dc0e4"/><path d="M23.6 12.6c1-2 2.5-3.4 4.4-4.2 1-.4 2 0 2.4 1 .4 1-.1 2-1.1 2.4-1 .4-1.8 1.1-2.5 2.1z" fill="#9dc0e4"/>' },
  { id:'orca', name:'der Orca', art:'tier', zeichen:'🫍' },
  { id:'hai', name:'der Hai', art:'tier', zeichen:'🦈' },
  { id:'leopard', name:'der Leopard', art:'tier', zeichen:'🐆' },
  { id:'krokodil', name:'das Krokodil', art:'tier', zeichen:'🐊',
    bild:'<path d="M9.6 30c1.5 0 2.6 1.1 2.6 2.8v4c0 1.3-.9 2.1-2.1 2.1s-2.1-.8-2.1-2.1v-4c0-1.7.2-2.8 1.6-2.8z" fill="#4d8a4a"/><path d="M23.6 30c1.5 0 2.6 1.1 2.6 2.8v4c0 1.3-.9 2.1-2.1 2.1s-2.1-.8-2.1-2.1v-4c0-1.7.2-2.8 1.6-2.8z" fill="#4d8a4a"/><path d="M30 12.6c.9 0 1.4.7 1.2 1.7l-2.2 10.4c1.8 1.2 2.8 3 2.8 5.3 0 3.4-2.2 5.4-6 5.4H10.6c-4.4 0-7-2.6-7-6.6 0-4.6 3.6-7.6 9-7.6h9.8l6-8.1c.4-.4.9-.5 1.6-.5z" fill="#5c9e58"/><path d="M35.4 20.6c6 0 9.6 2.6 9.6 6.8 0 4-3.4 6.4-9 6.4H26c-3.4 0-5.4-1.7-5.4-4.4 0-1.2.4-2.2 1-3-1-.9-1.6-2.1-1.6-3.5 0-2.7 2-4.4 5.2-4.4z" fill="#6cb066"/><path d="M28.6 26.6l1.6 2.6h-3.2zM33.4 26.6l1.6 2.6h-3.2zM38.2 26.6l1.6 2.6h-3.2z" fill="#f4f8f2"/><path d="M27 17.4c1.6 0 2.8 1.2 2.8 2.9s-1.2 2.9-2.8 2.9-2.8-1.2-2.8-2.9 1.2-2.9 2.8-2.9z" fill="#8ac97f"/><path d="M27 19c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4.6-1.4 1.4-1.4z" fill="#25301f"/>' },
  { id:'robbe', name:'die Robbe', art:'tier', zeichen:'🦭' },
  { id:'zebra', name:'das Zebra', art:'tier', zeichen:'🦓' },
  { id:'orang-utan', name:'der Orang-Utan', art:'tier', zeichen:'🦧' },
  { id:'yeti', name:'der Yeti', art:'tier', zeichen:'🫈' },
  { id:'nashorn', name:'das Nashorn', art:'tier', zeichen:'🦏' },
  { id:'nilpferd', name:'das Nilpferd', art:'tier', zeichen:'🦛' },
  { id:'elefant', name:'der Elefant', art:'tier', zeichen:'🐘',
    bild:'<path d="M20 17.5c9 0 14.5 4.5 14.5 12.5v6c0 1.6-1.2 2.6-2.8 2.6h-1.9c-1.6 0-2.8-1-2.8-2.6v-2.4h-9.4V36c0 1.6-1.2 2.6-2.8 2.6h-1.9c-1.6 0-2.8-1-2.8-2.6v-6C10.1 22 15 17.5 20 17.5z" fill="#96a2b0"/><path d="M31.5 8c6.3 0 10.5 4.4 10.5 11 0 4-1.4 7-3.8 8.6V36c0 1.6-1.2 2.6-2.8 2.6h-2c-1.6 0-2.8-1-2.8-2.6v-5.7c-5.4-.9-8.8-4.9-8.8-10.6C21.8 12.6 25.4 8 31.5 8z" fill="#a6b2bf"/><path d="M22.4 12.6c3 0 5.2 2.6 5.2 6.6s-2.2 7-5.2 7-5-3-5-7 2-6.6 5-6.6z" fill="#8695a5"/><path d="M41.2 22.6c1.4.7 2.3 2.3 2.3 4.6 0 4.6-1.3 8-1.3 11.2 0 1.4.8 2.2 1.9 2.2.7 0 1.3-.3 1.7-.9-.3 1.7-1.5 2.7-3.2 2.7-2.4 0-4-1.9-4-5 0-3.6 1.3-6.8 1.3-10.6 0-1.8-.3-3.2-.9-4.2z" fill="#a6b2bf"/><path d="M36.6 15.4c.9 0 1.6.8 1.6 1.9s-.7 1.9-1.6 1.9-1.6-.8-1.6-1.9.7-1.9 1.6-1.9z" fill="#2d333c"/>' },
  { id:'mammut', name:'das Mammut', art:'tier', zeichen:'🦣' },
  { id:'dromedar', name:'das Dromedar', art:'tier', zeichen:'🐪' },
  { id:'trampeltier', name:'das Trampeltier', art:'tier', zeichen:'🐫' },
  { id:'giraffe', name:'die Giraffe', art:'tier', zeichen:'🦒',
    bild:'<path d="M15.4 30c1.9 0 3.2 1.3 3.2 3.4v7.4c0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5v-7.4c0-2.1.4-3.4 1.8-3.4z" fill="#dba33e"/><path d="M25 30c1.9 0 3.2 1.3 3.2 3.4v7.4c0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5v-7.4c0-2.1.4-3.4 1.8-3.4z" fill="#dba33e"/><path d="M20.4 18.6c6.6 0 10.6 3.6 10.6 9.6 0 4.4-2.6 6.8-7.2 6.8h-7c-4.6 0-7.2-2.4-7.2-6.8 0-6 4.2-9.6 10.8-9.6z" fill="#e8b34c"/><path d="M30.4 4.6c5 0 8 3.2 8 8.4 0 4-1.8 6.6-4.8 7.6l-1.8 8.2c-.4 1.9-1.6 2.9-3.4 2.6-1.8-.3-2.6-1.6-2.2-3.5l2-9.2c-1-1.4-1.6-3.2-1.6-5.3 0-5.4 2.9-8.8 3.8-8.8z" fill="#e8b34c"/><path d="M32.6 3c4.8 0 8 3.4 8 8.4 0 4.4-2.6 7.2-6.8 7.2s-6.8-2.8-6.8-7.2C27 6.4 30.2 3 32.6 3z" fill="#efc266"/><path d="M29.4 9.6c.9 0 1.5.8 1.5 1.8s-.6 1.8-1.5 1.8-1.5-.8-1.5-1.8.6-1.8 1.5-1.8z" fill="#3d3320"/><path d="M27.6.6c.8-.2 1.5.3 1.7 1.2l.7 3.2c-1 .2-1.9.6-2.6 1.2l-.9-3.8c-.2-.9.3-1.6 1.1-1.8z" fill="#c88f33"/><path d="M37.6.6c-.8-.2-1.5.3-1.7 1.2l-.7 3.2c1 .2 1.9.6 2.6 1.2l.9-3.8c.2-.9-.3-1.6-1.1-1.8z" fill="#c88f33"/><path d="M16 22.4c1.5 0 2.6 1.1 2.6 2.6s-1.1 2.6-2.6 2.6-2.6-1.1-2.6-2.6 1.1-2.6 2.6-2.6z" fill="#c88f33"/><path d="M25.2 21.4c1.3 0 2.2.9 2.2 2.2s-.9 2.2-2.2 2.2-2.2-.9-2.2-2.2.9-2.2 2.2-2.2z" fill="#c88f33"/><path d="M20.8 28.4c1.3 0 2.2.9 2.2 2.2s-.9 2.2-2.2 2.2-2.2-.9-2.2-2.2.9-2.2 2.2-2.2z" fill="#c88f33"/><path d="M33.6 22.6c1.2 0 2 .9 2 2.1s-.8 2.1-2 2.1-2-.9-2-2.1.8-2.1 2-2.1z" fill="#c88f33"/>' },
  { id:'kaenguru', name:'das Känguru', art:'tier', zeichen:'🦘',
    bild:'<path d="M20.6 30.6c-2.6 3.6-6.6 6.4-12 8.4-1 .4-2 0-2.4-1s0-2 1-2.4c4.6-1.7 8-4 10.2-7z" fill="#a86c35"/><path d="M25.6 27.6c3.4 0 5.6 2.4 5.6 6.2 0 2-.5 3.6-1.5 4.8h4.5c1.2 0 2 .8 2 1.9s-.8 1.9-2 1.9h-11c-2.6 0-4.2-1.6-4.2-4.2v-4.4c0-3.9 2.4-6.2 6.6-6.2z" fill="#b5763c"/><path d="M26.4 12.6c5.4 0 8.8 4 8.8 10.4 0 6.8-3.6 10.8-9.6 10.8-5.2 0-8.4-3-8.4-8 0-7.8 4-13.2 9.2-13.2z" fill="#c98a4b"/><path d="M22.4 22.6c3 0 5 1.9 5 4.9s-2 5.1-5 5.1-4.6-2.1-4.6-5.1 1.6-4.9 4.6-4.9z" fill="#e0a468"/><path d="M33.4 20.6c1.2 0 2 .8 2 2 0 .9-.4 1.6-1.2 1.9l-3.4 1.3c-1 .4-1.9 0-2.3-1-.4-1 0-1.9 1-2.3z" fill="#b5763c"/><path d="M33.6 6.6c3.6 0 6 2.6 6 6.6 0 2.6-1 4.6-2.8 5.7l-2 5.5c-.5 1.3-1.6 1.8-2.9 1.3-1.2-.5-1.7-1.6-1.2-2.9l1.9-5.2c-1.4-1.2-2.2-3-2.2-5.2 0-3.9 1.8-5.8 3.2-5.8z" fill="#c98a4b"/><path d="M34.6 5.6c3.8 0 6.4 2.6 6.4 6.6s-2.6 6.6-6.4 6.6-6.4-2.6-6.4-6.6 2.6-6.6 6.4-6.6z" fill="#d6975a"/><path d="M30.6.6c.9-.2 1.6.3 1.8 1.3l1 5.2c-.9.1-1.7.4-2.4.9L29.4 2.4c-.2-1 .3-1.7 1.2-1.8z" fill="#c98a4b"/><path d="M39.4.8c.9.3 1.3 1.1 1 2l-1.8 5.1c-.7-.5-1.5-.9-2.4-1.1l1.4-5.1c.3-.9 1-1.3 1.8-.9z" fill="#c98a4b"/><path d="M31.4 3.2l.8 3.2c-.4.1-.8.3-1.1.5zM38.6 3.4l-1 3.1c-.4-.2-.8-.3-1.2-.4z" fill="#8f5a2c"/><path d="M36.6 10c.9 0 1.6.8 1.6 1.9s-.7 1.9-1.6 1.9-1.6-.8-1.6-1.9.7-1.9 1.6-1.9z" fill="#3a2a1b"/><path d="M29.4 12.4c1 0 1.7.7 1.7 1.6s-.7 1.6-1.7 1.6-1.7-.7-1.7-1.6.7-1.6 1.7-1.6z" fill="#3a2a1b"/>' },
  { id:'bison', name:'der Bison', art:'tier', zeichen:'🦬' },
  { id:'wasserbueffel', name:'der Wasserbüffel', art:'tier', zeichen:'🐃' },
  { id:'stier', name:'der Stier', art:'tier', zeichen:'🐂' },
  { id:'kuh', name:'die Kuh', art:'tier', zeichen:'🐄' },
  { id:'widder', name:'der Widder', art:'tier', zeichen:'🐏' },
  { id:'pferd', name:'das Pferd', art:'tier', zeichen:'🐎' },
  { id:'esel', name:'der Esel', art:'tier', zeichen:'🫏' },
  { id:'schaf', name:'das Schaf', art:'tier', zeichen:'🐑' },
  { id:'hund', name:'der Hund', art:'tier', zeichen:'🐕' },
  { id:'pudel', name:'der Pudel', art:'tier', zeichen:'🐩' },
  { id:'blindenhund', name:'der Blindenhund', art:'tier', zeichen:'🦮' },
  { id:'rettungshund', name:'der Rettungshund', art:'tier', zeichen:'🐕‍🦺' },
  { id:'fluegel', name:'der Flügel', art:'tier', zeichen:'🪽' },
  { id:'feder', name:'die Feder', art:'tier', zeichen:'🪶' },
  { id:'schwarze-katze', name:'die schwarze Katze', art:'tier', zeichen:'🐈‍⬛' },
  { id:'katze', name:'die Katze', art:'tier', zeichen:'🐈' },
  { id:'hahn', name:'der Hahn', art:'tier', zeichen:'🐓' },
  { id:'truthahn', name:'der Truthahn', art:'tier', zeichen:'🦃' },
  { id:'dodo', name:'der Dodo', art:'tier', zeichen:'🦤' },
  { id:'pfau', name:'der Pfau', art:'tier', zeichen:'🦚' },
  { id:'papagei', name:'der Papagei', art:'tier', zeichen:'🦜' },
  { id:'schwan', name:'der Schwan', art:'tier', zeichen:'🦢' },
  { id:'flamingo', name:'der Flamingo', art:'tier', zeichen:'🦩' },
  { id:'taube', name:'die Taube', art:'tier', zeichen:'🕊️' },
  { id:'dachs', name:'der Dachs', art:'tier', zeichen:'🦡' },
  { id:'stinktier', name:'das Stinktier', art:'tier', zeichen:'🦨' },
  { id:'waschbaer', name:'der Waschbär', art:'tier', zeichen:'🦝' },
  { id:'biber', name:'der Biber', art:'tier', zeichen:'🦫' },
  { id:'otter', name:'der Otter', art:'tier', zeichen:'🦦' },
  { id:'faultier', name:'das Faultier', art:'tier', zeichen:'🦥' },
  { id:'pfotenspur', name:'die Pfotenspur', art:'tier', zeichen:'🐾' },
  { id:'igel', name:'der Igel', art:'tier', zeichen:'🦔',
    bild:'<path d="M25.6 12.4c8.2 0 13.6 5.4 13.6 13.6 0 6.4-4.4 10.4-11.6 10.4H16.4c-5.4 0-8.8-3.4-8.8-8.6 0-8.6 8-15.4 18-15.4z" fill="#7b5c40"/><path d="M12.6 16.6l-4.8-3.2 2.4 5.4zM17.6 13.6l-3.6-4.6 1 6zM24 12.2l-1.6-5.8-1.4 5.8zM30.4 13l1.8-5.6-4 4.8zM36.2 16.4l4.6-3.6-6 2.6zM39.4 21.6l5.6-1.4-5.8-.6z" fill="#5a4230"/><path d="M12.4 24.4c5.6 0 9.4 3.4 9.4 8.8 0 3.6-2.4 5.6-6.6 5.6-6 0-10-3.6-10-8.4 0-3.8 2.6-6 7.2-6z" fill="#dcbc93"/><path d="M8.2 27.8c1.1 0 1.9.9 1.9 2.1s-.8 2.1-1.9 2.1-1.9-.9-1.9-2.1.8-2.1 1.9-2.1z" fill="#33291f"/><path d="M5.2 32.6c1.5 0 2.6 1 2.6 2.4s-1.1 2.4-2.6 2.4-2.6-1-2.6-2.4 1.1-2.4 2.6-2.4z" fill="#33291f"/><path d="M16.6 38.4c1.4 0 2.4.9 2.4 2.2s-1 2.2-2.4 2.2-2.4-.9-2.4-2.2 1-2.2 2.4-2.2z" fill="#5a4230"/><path d="M28.6 36.4c1.4 0 2.4.9 2.4 2.2s-1 2.2-2.4 2.2-2.4-.9-2.4-2.2 1-2.2 2.4-2.2z" fill="#5a4230"/>' },
  { id:'streifenhoernchen', name:'das Streifenhörnchen', art:'tier', zeichen:'🐿️' },
  { id:'ratte', name:'die Ratte', art:'tier', zeichen:'🐀' },
  { id:'drache', name:'der Drache', art:'tier', zeichen:'🐉' },
  { id:'phoenix', name:'der Phönix', art:'tier', zeichen:'🐦‍🔥' },
  { id:'kaktus', name:'der Kaktus', art:'pflanze', zeichen:'🌵' },
  { id:'tannenbaum', name:'der Tannenbaum', art:'pflanze', zeichen:'🎄' },
  { id:'palme', name:'die Palme', art:'pflanze', zeichen:'🌴' },
  { id:'kleeblatt', name:'das Kleeblatt', art:'pflanze', zeichen:'🍀' },
  { id:'koralle', name:'die Koralle', art:'pflanze', zeichen:'🪸' },
  { id:'muschel', name:'die Muschel', art:'pflanze', zeichen:'🐚' },
  { id:'nest', name:'das Nest', art:'pflanze', zeichen:'🪺' },
  { id:'blumenstrauss', name:'der Blumenstrauß', art:'pflanze', zeichen:'💐' },
  { id:'tulpe', name:'die Tulpe', art:'pflanze', zeichen:'🌷' },
  { id:'rose', name:'die Rose', art:'pflanze', zeichen:'🌹' },
  { id:'hibiskus', name:'der Hibiskus', art:'pflanze', zeichen:'🌺' },
  { id:'lotus', name:'die Lotusblume', art:'pflanze', zeichen:'🪷' },
  { id:'hyazinthe', name:'die Hyazinthe', art:'pflanze', zeichen:'🪻' },
  { id:'welke-blume', name:'die welke Blume', art:'pflanze', zeichen:'🥀' },
  { id:'kirschbluete', name:'die Kirschblüte', art:'pflanze', zeichen:'🌸' },
  { id:'bluete', name:'die Blüte', art:'pflanze', zeichen:'🌼' },
  { id:'sonnenblume', name:'die Sonnenblume', art:'pflanze', zeichen:'🌻' },
  { id:'sonne', name:'die Sonne', art:'pflanze', zeichen:'🌞' },
  { id:'apfel', name:'der Apfel', art:'obst', zeichen:'🍏' },
  { id:'birne', name:'die Birne', art:'obst', zeichen:'🍐' },
  { id:'melone', name:'die Melone', art:'obst', zeichen:'🍉' },
  { id:'erdbeere', name:'die Erdbeere', art:'obst', zeichen:'🍓' },
  { id:'weintrauben', name:'die Weintrauben', art:'obst', zeichen:'🍇' },
  { id:'kiwi', name:'die Kiwi', art:'obst', zeichen:'🥝' },
  { id:'ananas', name:'die Ananas', art:'obst', zeichen:'🍍' },
  { id:'milchflasche', name:'die Milchflasche', art:'preis', zeichen:'🍼' },
  { id:'bronzemedaille', name:'die Bronzemedaille', art:'preis', zeichen:'🥉' },
  { id:'medaille', name:'die Medaille', art:'preis', zeichen:'🏅' },
  { id:'pokal', name:'der Pokal', art:'preis', zeichen:'🏆' },
  { id:'goldmedaille', name:'die Goldmedaille', art:'preis', zeichen:'🥇' },
  { id:'orden', name:'der Orden', art:'preis', zeichen:'🎖️' },
  { id:'rosette', name:'die Rosette', art:'preis', zeichen:'🏵️' },
  { id:'silbermedaille', name:'die Silbermedaille', art:'preis', zeichen:'🥈' },
  { id:'eintrittskarte', name:'die Eintrittskarte', art:'preis', zeichen:'🎫' },
  { id:'kinokarte', name:'die Kinokarte', art:'preis', zeichen:'🎟️' },
  { id:'schleife', name:'die Schleife', art:'preis', zeichen:'🎗️' },
  { id:'zirkuszelt', name:'das Zirkuszelt', art:'preis', zeichen:'🎪' },
];

/* ---------- Die Lebensraeume ------------------------------------------
 *
 * WOFUER es ein Tier gibt, und das ist der Kern: nicht fuer eine gute
 * Runde, sondern dafuer, dass eine EBENE FERTIG ist. Wer alle Länder
 * Australiens im Buch hat, bekommt Kaenguru, Koala und Schlange dazu -
 * die Tiere, die dort leben.
 *
 * Das ist ein anderer Handel als „drei Sterne, ein Aufkleber": er dauert
 * laenger, und er sagt etwas. Ein Kind, das die Savanne aufmacht, hat
 * Afrika zu Ende gebracht; das Tier ist der Beleg, nicht der Preis.
 *
 * DREI JE RAUM, und das ist gemessen und nicht gesetzt: drei passen in
 * eine Reihe der Tierwand, drei sind in einem Satz zu sagen („Elefant,
 * Giraffe und Löwe"), und drei sind wenig genug, dass ein Raum, dessen
 * Bilder noch fehlen, nicht die halbe Sammlung blockiert.
 *
 * Die Kennungen sind die der EBENEN aus `spiel.js`. Ein Raum ohne Ebene
 * waere nie zu oeffnen, eine Ebene ohne Raum gaebe nie etwas - `inhalt`
 * prueft beide Richtungen gegen die Ebenenliste.
 */
export const RAEUME = [
  { ebene:'kontinente',          titel:'Im Meer',
    tiere:['wal', 'delfin', 'pinguin'] },
  { ebene:'laender:europa',      titel:'Wald und Wiese',
    tiere:['fuchs', 'igel', 'eule'] },
  { ebene:'laender:afrika',      titel:'Die Savanne',
    tiere:['elefant', 'giraffe', 'loewe'] },
  { ebene:'laender:australien',  titel:'Das Outback',
    tiere:['kaenguru', 'koala', 'schlange'] },
  { ebene:'laender:mittelamerika', titel:'Die Karibik',
    tiere:['schildkroete', 'krabbe', 'krokodil'] },
  /* Ab hier fehlen noch Bilder. Die Raeume stehen trotzdem schon da:
     sie sind die Liste dessen, was zu malen ist - und `inhalt` zaehlt
     sie ab, damit „noch nicht gemalt" eine Zahl hat und keine
     Erinnerung. */
  { ebene:'laender:asien',       titel:'Der Dschungel',
    tiere:['tiger', 'panda', 'orang-utan'] },
  { ebene:'laender:nordamerika', titel:'Wald und Fluss',
    tiere:['waschbaer', 'adler', 'biber'] },
  { ebene:'laender:suedamerika', titel:'Der Regenwald',
    tiere:['papagei', 'faultier', 'schmetterling'] },
  { ebene:'bundeslaender',       titel:'Vor der Haustür',
    tiere:['hase', 'amsel', 'katze'] },
  /* Beide Hauptstadt-Ebenen fuehren in DENSELBEN Raum. Wer Europas
     Hauptstaedte kann, hat die Stadt aufgemacht; die deutschen noch
     einmal zu verlangen waere dieselbe Muehe fuer dieselben drei
     Tiere. */
  { ebene:'hauptstaedte:europa', titel:'In der Stadt',
    tiere:['taube', 'ratte', 'streifenhoernchen'] },
  { ebene:'hauptstaedte',        titel:'In der Stadt',
    tiere:['taube', 'ratte', 'streifenhoernchen'] },
];

/** Was gemalt ist - der wirkliche Vorrat. */
export const gemalt = () => TIERE.filter(t => t.bild);

/** Ein Stueck an seiner Kennung. */
export const tierMit = (id) => TIERE.find(t => t.id === id) || null;

/** Der Lebensraum einer Ebene - oder `null`, wenn sie keinen hat. */
export const raumZu = (ebeneId) => RAEUME.find(r => r.ebene === ebeneId) || null;

/**
 * Was das Fertigwerden DIESER Ebene einbringt - nur, was gemalt ist und
 * noch fehlt.
 *
 * Ein Raum, dessen Bilder noch nicht da sind, gibt nichts; er
 * verschwindet aber nicht, sondern wartet. Waere es umgekehrt - eine
 * Kennung ohne Bild im Stand -, stuende im Buch ein leeres Kaestchen mit
 * einem Namen, und niemand wuesste, ob das ein Fehler ist.
 */
export function raumTiere(ebeneId, habe = []) {
  const r = raumZu(ebeneId);
  if (!r) return [];
  const da = new Set(habe);
  return r.tiere.map(tierMit).filter(t => t && t.bild && !da.has(t.id));
}

/** Alles, was ueberhaupt zu sammeln ist: die Tiere der Raeume, gemalt. */
export const sammelbar = () => {
  const ids = new Set(RAEUME.flatMap(r => r.tiere));
  return gemalt().filter(t => ids.has(t.id) && t.id !== GORILLA);
};

