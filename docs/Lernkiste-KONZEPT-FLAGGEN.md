# Flaggen — Konzept

**Stand:** entworfen am 06.09.2026, nach dem Wunsch der Familie: *„Wir möchten
gerne Länderflaggen sehen und dann entweder den Ländern zuordnen, oder eine
Variante zum Eintippen, zum Einsprechen. Fokus auf Europa und die anderen
Kontinente. Für alle Profile."*

Dieses Dokument ist der Ort für die **Begründungen**. Was zu tun ist, steht als
Runden F0 bis F5 in `docs/Lernkiste-BACKLOG.md` — und dort **nur** das, damit
nichts zweimal dasteht und eine der beiden Fassungen veraltet (Regel 6).

---

## § 0 · Referenzabgleich — was die Vorbilder TUN

Regel 10: *Das Soll kommt aus der Referenz, nicht aus mir.* Drei Vorbilder,
benannt, mit dem, was sie tun und was sie kosten.

### Vorbild 1 · Seterra / GeoGuessr — „Flags of Europe"

Die meistbenutzte Flaggenübung im Netz. **Was sie tut:** eine Flagge, vier bis
sechs Namen als Text, antippen. Danach eine Landkarte, auf der die Flagge an
ihren Platz gesetzt wird.

**Was daran gut ist:** die zweite Form. Flagge und Ort werden im selben
Durchgang verknüpft, nicht in zwei getrennten Übungen. Ein Kind, das Rumänien
auf der Karte findet und dieselbe Flagge dort hinsetzt, hat zwei Dinge
gleichzeitig gelernt.

**Was daran schlecht ist:** die Auswahl ist **immer** Text. Wer nicht liest,
kann nicht mitmachen. Fiona wäre ausgeschlossen.

### Vorbild 2 · Montessori — die Flaggenstecker auf der Kontinentkarte

Holzkarte, Löcher an den Ländern, kleine Fähnchen zum Hineinstecken.
**Was sie tut:** das Kind hält die Flagge in der Hand und sucht ihren Platz.
Die Bewegung ist die Aufgabe.

**Was daran gut ist:** die Richtung. Nicht „welches Land ist das?", sondern
„wohin gehört das hier?" — die Flagge ist der Gegenstand, das Land die Antwort.
Und es funktioniert **ohne ein Wort Schrift**.

**Was daran schlecht ist:** es gibt keine Rückmeldung. Wer das Fähnchen falsch
steckt, merkt es nicht.

### Vorbild 3 · Anton — „Flaggen" in Sachkunde

**Was es tut:** Multiple Choice mit Bildern statt Text, plus eine Schreibform
für ältere Klassen. **Was daran gut ist:** dieselbe Aufgabe hat je nach Klasse
eine andere Antwortform, und das ist **keine zweite Aufgabe** — es ist dieselbe,
anders beantwortet. **Was daran schlecht ist:** die Flaggen sind Fotos, also 200
Dateien; und die Auswahl ist zufällig, also stehen Rumänien und der Tschad nie
nebeneinander — genau dort, wo es interessant würde.

### Das Soll, daraus abgeleitet

| # | Aus welcher Referenz | Soll |
|---|---|---|
| 1 | Montessori | Die Übung geht **ohne Schrift**. Fiona muss sie spielen können. |
| 2 | Anton | Die **Antwortform folgt dem Profil**, nicht der Ebene. Eine Ebene, vier Erfahrungen. |
| 3 | Seterra | Flagge und **Ort** werden verknüpft, nicht nur Flagge und Name. |
| 4 | Anton (Gegenteil) | Die Ablenker sind **gewählt**, nicht gewürfelt: verwechselbare Flaggen gehören nebeneinander. |
| 5 | Montessori (Gegenteil) | Jeder Fehler bekommt eine Antwort — die App sagt, was es wirklich war. |

**Abstand zum Heute: alles.** Es gibt noch keine einzige Flagge in der App.

---

## § 1 · Die vier Festlegungen, die alles andere tragen

### 1.1 Die Flaggen sind GEZEICHNET, nicht fotografiert — und zwar aus einer Beschreibung

Die App ist **eine** Datei und lädt nichts nach. 69 Flaggen als Bilder wären 69
Dateien; als eingebackene Bilder wären sie ein Vielfaches des heutigen Bündels.

Der zweite Gedanke — jede Flagge als SVG-Pfade wie die Tiere — ist besser und
immer noch falsch: eine Flagge ist keine Zeichnung, sondern eine **Bauanweisung**.
„Drei Querstreifen: schwarz, rot, gold" ist die ganze Wahrheit über die deutsche
Flagge, und sie ist neunzig Zeichen lang.

Also eine kleine **Formsprache**, und aus ihr wird gezeichnet:

```js
{ a3:'DEU', bau:{ art:'streifen', quer:true, farben:['#000000','#DD0000','#FFCE00'] } }
{ a3:'FRA', bau:{ art:'streifen',            farben:['#002395','#FFFFFF','#ED2939'] } }
{ a3:'JPN', bau:{ art:'einfarbig', farben:['#FFFFFF'],
                  zeichen:{ form:'scheibe', farbe:'#BC002D', gross:0.60 } } }
{ a3:'DNK', bau:{ art:'nordkreuz', grund:'#C8102E', kreuz:'#FFFFFF' } }
```

**Acht Bauarten und rund zwölf Zeichen** decken alle 69 ab. Der Preis ist ein
paar hundert Zeilen Daten; der Gewinn ist, dass eine Flagge **prüfbar** wird —
man kann eine Bauanweisung gegen die Wirklichkeit lesen, ein gemaltes Bild nicht.

**Ein Rahmen für alle: `0 0 48 32`.** Dieselbe Begründung wie beim Tierrahmen
(`0 0 48 48`): eine Wand mit gemischten Seitenverhältnissen zeigt Flaggen in
verschiedenen Größen, und dann ist die Größe ein Hinweis auf die Antwort statt
auf gar nichts. **Die Schweiz und der Vatikan sind in Wirklichkeit quadratisch,
Nepal ist es gar nicht** — das ist eine Vereinfachung, sie wird im Vorlauf
gesagt und nicht verschwiegen.

### 1.2 Der Vorrat sind die Länder, die es schon gibt — 69 Stück

`LAENDER` in `src/inhalt/erdkunde.js` hält bereits 69 Länder mit Namen,
Schreibweisen (`aliasse`), Aussprachevarianten (`aussprache`) und einer
Lerntiefe (`rang`):

| Karte | Länder |
|---|---|
| Europa | **17** |
| Asien | 12 |
| Afrika | 12 |
| Südamerika | 12 |
| Mittelamerika | 9 |
| Nordamerika | 4 |
| Australien | 3 |

Das ist genau das Gewünschte: **Fokus Europa** (die tiefste Liste), die großen
Länder je Kontinent, keine Nischen. Und es kostet **keine zweite Faktenliste** —
Namen, Schreibweisen und Aussprache stehen schon da und werden gepflegt.

**`rang` trägt die Tiefe je Profil mit**, ohne einen neuen Regler: Fiona spielt
`rang ≤ 3`, Lea `≤ 13`, die Eltern `≤ 17`. Ein eigener `flaggenTiefe`-Regler wäre
dieselbe Auskunft an einem zweiten Ort.

**Erst Runde F3 erweitert den Vorrat**, und zwar nur, weil sie es muss: die
Verwechslungspaare brauchen Irland, Norwegen, Schweden, Portugal, Ungarn,
Monaco, den Tschad und die Elfenbeinküste — Länder ohne Kartenumriss in dieser
App. Sie stehen dann in `FLAGGEN_EXTRA` und können in „Auf die Karte" **nicht**
vorkommen; ein Tor setzt das durch, statt sich darauf zu verlassen.

### 1.3 Die Ebene sagt WAS gefragt wird, das Profil sagt WIE

Das ist die Regel, nach der diese App überall gebaut ist (`spielschirm`:
`kannLesen`, `kandidaten`, `umgekehrt`). Für die Flaggen heißt sie:

| Profil | Was steht da | Wie geantwortet wird | Warum |
|---|---|---|---|
| **Fiona** (6, liest nicht) | Die App **sagt** „Deutschland" | Vier Flaggen, eine antippen | Ohne Schrift spielbar — Soll 1 |
| **Fiona**, jede dritte | Eine Flagge steht da | **Sprechen**: „Wie heißt das Land?" | Sie kann sprechen, nicht schreiben |
| **Lea** (8) | Eine Flagge steht da | **Tippen** oder sprechen | Sie schreibt |
| **Stephan/Violeta** | Eine Flagge steht da | **Tippen**, ohne Auswahl (`kandidaten:0`) | Vier Möglichkeiten sind die größte Hilfe, die es gibt |

**Eine Ebene, vier Erfahrungen — und ein Bildschirm.** Nicht vier Ebenen: vier
Ebenen hätten vier Leitner-Stände, und wer die Flagge Rumäniens getippt kennt,
müsste sie gesprochen von vorn lernen. Es ist dasselbe Können.

Die Umkehrung ist keine Spielerei: **„Zeig mir Deutschland"** und **„Wie heißt
das?"** sind zwei verschiedene Fragen an dasselbe Wissen, und die zweite ist die
schwerere. Deshalb ist sie bei Fiona jede dritte und nie die erste — genau wie
`umgekehrt` auf der Karte.

### 1.4 Eine Kachel, nicht sieben

Die Erdkundewelt zeigt heute **zehn** Kacheln (Kontinente, sieben Karten,
Bundesländer, und *eine* für beide Hauptstadt-Ebenen). Gemessen trägt die Wand
auf dem Zielgerät **zwölf** (Q13/Q27). Sieben Flaggenebenen wären siebzehn.

Also dieselbe Lösung wie bei den Hauptstädten: **`gruppe:'flaggen'`**. Eine
Kachel „Flaggen", ein Tipp darauf fragt „wo?", dahinter die sieben Karten. Die
Erdkundewand geht von zehn auf **elf** — der Mechanismus steht seit Q17 und wird
nicht neu gebaut.

Und deshalb passen auch die späteren Formen hinein, ohne dass die Wand wächst:
„Verwechslungen" (F3) und „Auf die Karte" (F4) sind der **achte und neunte
Eintrag derselben Gruppe**, nicht zwei weitere Kacheln.

---

## § 2 · Die Spielformen

### F2 · „Flaggen" — die Grundform, sieben Karten

Beschrieben in § 1.3. Der Bildschirm heißt `flaggenschirm()` und ist dem
`englischschirm()` nachgebaut, nicht dem `spielschirm()`: keine Karte, vier
Kacheln, eine stimmt.

**Die Ablenker sind gewählt, nicht gewürfelt** (Soll 4). Die Regel:

1. Zuerst die **verwechselbaren** Flaggen desselben Kontinents (aus `AEHNLICH`,
   siehe § 3.2) — höchstens eine, sonst rät man nicht mehr, sondern verzweifelt.
2. Dann Flaggen mit **derselben Bauart** (drei Querstreifen zu drei
   Querstreifen).
3. Dann der Rest des Kontinents.

Ohne Schritt 1 stünde neben Rumänien nie der Tschad, und die Ebene übte genau
das nicht, was schwer ist.

### F3 · „Verwechslungen" — die falschen Freunde der Flaggen

Für Lea und die Eltern. **Zwei** Flaggen nebeneinander, die sich sehr ähnlich
sehen, und die Frage: *„Welche ist Rumänien?"*

Das ist die Ebene, die es sonst nirgends gibt, und sie ist der Grund, warum die
Flaggen mehr sind als Bildchen:

| Paar | Unterschied | Wer verwechselt es |
|---|---|---|
| Rumänien / Tschad | Blauton (heller / dunkler) | fast alle |
| Niederlande / Luxemburg | Blauton (dunkel / hell) | fast alle |
| Monaco / Indonesien | Seitenverhältnis | alle |
| Irland / Elfenbeinküste | Reihenfolge (grün links / orange links) | fast alle |
| Norwegen / Island | Farbtausch | viele |
| Australien / Neuseeland | Zahl und Farbe der Sterne | viele |
| Slowenien / Slowakei | Wappen | viele |
| Ecuador / Kolumbien | Wappen | viele |

**Das ist eine Ebene, die eine Falle ZEIGT statt sie zu vermeiden** — dieselbe
Bauart wie „Falsche Freunde" (E10), und aus demselben Grund: bei den Eltern ist
die Verknüpfung längst da und nur zugewachsen.

### F4 · „Auf die Karte" — die Montessori-Form

Die Flagge liegt unten, die Karte steht oben, und sie wird auf ihr Land gezogen.
Das ist Soll 3, und es ist die einzige Form, die Flagge, Umriss und Lage
gleichzeitig verlangt.

Sie ist die **teuerste** Runde, weil sie in `spielschirm()` eingreift — den
größten Bildschirm der App (1700 Zeilen). Deshalb steht sie hinten und nicht
vorn: F2 und F3 tragen sich allein.

**Nur Länder mit Umriss** (also nicht `FLAGGEN_EXTRA`), und **nur Länder, die
man treffen kann**: P10/P7 haben gemessen, dass neun Gebiete Trefferflächen
unter der Fingergrenze haben. Dieselbe Regel wie dort — wo man nicht treffen
kann, wird nicht gefragt.

### Was NICHT kommt, und warum

* **Flaggen-Memory.** Ein zweiter Bildschirmtyp, ein zweiter Fortschrittsbegriff,
  kein Leitner. Es wäre ein Spiel neben der App, nicht in ihr.
* **„Welche Farben hat die Flagge?"** Das prüft Farbnamen, nicht Länder.
* **Flaggen malen.** Wäre die Schreibwelt mit anderem Inhalt, und die
  Strichbewertung dort ist auf Buchstaben geeicht.

---

## § 3 · Datenmodell

### 3.1 `src/inhalt/flaggen.js`

```js
export const RAHMEN = '0 0 48 32';

/** Die Bauanweisung je Land. Kein Code, nur Daten - bewacht vom Tor `flaggen`. */
export const FLAGGEN = [ { a3:'DEU', bau:{…} }, … ];

/**
 * Die EINE Stelle, die eine Bauanweisung in Formen uebersetzt.
 *
 * Sie hat ZWEI Abnehmer: `flaggeSvg` macht daraus ein Bild, das Tor macht
 * daraus ein Raster und misst, ob sich zwei Flaggen zu aehnlich sehen. Zwei
 * getrennte Uebersetzungen waeren zwei Wahrheiten (Regel 6), und die
 * gemessene waere nicht die gezeigte - das Tor bezeugte dann eine Flagge,
 * die niemand sieht.
 */
export function flaggeTeile(bau){ … }   // → [{form:'rechteck'|'scheibe'|'pfad', …}]
export function flaggeSvg(a3, opt){ … } // → '<svg …>'
export const AEHNLICH = [ ['ROU','TCD'], ['NLD','LUX'], … ];
```

### 3.2 Die acht Bauarten

| Bauart | Beispiele | Felder |
|---|---|---|
| `einfarbig` | Japan, Marokko | `farben[1]`, `zeichen?` |
| `streifen` | Frankreich, Italien, Nigeria | `farben[]`, `quer?`, `breiten?`, `zeichen?` |
| `nordkreuz` | Dänemark | `grund`, `kreuz`, `innen?` |
| `mittkreuz` | Schweiz | `grund`, `kreuz` |
| `feld` | USA, Australien | ein `streifen` plus `ecke:{…}` |
| `dreieck` | Tschechien, Kuba, Philippinen | `farben[]`, `keil:{farbe, tief}` |
| `schraeg` | DR Kongo | `grund`, `band:{farbe, breit}` |
| `raute` | Brasilien | `grund`, `raute:{farbe}`, `zeichen?` |

Zeichen: `scheibe`, `stern`, `sterne`, `mond`, `rad`, `sonne`, `ahorn`,
`wappen`, `kreuzchen`, `dreizack`, `zeder`, `adler`.

### 3.3 Was ein `wappen` ist, und warum es nicht weggelassen wird

Sechs der 69 Flaggen unterscheiden sich von einer anderen **nur** durch ihr
Wappen: Mexiko (sonst Italien mit anderen Maßen), Spanien, Ecuador (sonst
Kolumbien), Guatemala, El Salvador, Paraguay.

Ein Wappen ist nicht zu zeichnen und wird auch nicht versucht. Was gezeichnet
wird, ist ein **Zeichen an der richtigen Stelle in der richtigen Farbe** — eine
Andeutung, aber eine unterscheidende. **Der Maßstab dafür ist keine Meinung,
sondern das Tor:** wenn zwei Flaggen, die zusammen in einer Auswahl stehen
können, sich zu ähnlich sehen, ist die Flagge falsch gezeichnet — nicht
„vereinfacht".

---

## § 4 · Die Tore

### `npm run flaggen` — das neue Untertor in `inhalt`

| Prüfung | Was sie sagt |
|---|---|
| **Vollzähligkeit** | Jedes Land aus `LAENDER` hat eine Bauanweisung, und jede Bauanweisung ein Land. |
| **Unterscheidbarkeit** | Kein Paar, das zusammen in einer Auswahl stehen kann, ist im Raster näher als die Schwelle. **Das ist die Prüfung, die trägt** — sie fängt die weggelassene Andeutung. |
| **Kontrast zum Grund** | Eine weiße Flagge auf weißer Karte ist keine. Jede braucht einen sichtbaren Rand. |
| **Bauart bekannt** | Kein Tippfehler in `art`, kein Zeichen ohne Pfad. |
| **`FLAGGEN_EXTRA` hat keinen Umriss** | Sonst könnte „Auf die Karte" nach einem Land fragen, das dort nicht liegt. |

**Die Unterscheidbarkeit wird am RASTER gemessen, nicht an der Beschreibung.**
Zwei Beschreibungen sind immer verschieden — sie stehen ja in verschiedenen
Zeilen. Verschieden **aussehen** ist etwas anderes, und nur das zählt (Regel 12:
jede Zahl trägt ihre Messstelle mit).

### Die übrigen Tore

* `smoke` — ein Abschnitt `flaggen`: eine Runde je Antwortform, und die
  Blindprobe „steht überhaupt eine Flagge da".
* `passt` — die Ebenenwahl mit **elf** Kacheln, der Gruppenwähler mit sieben,
  und der Flaggenbildschirm auf allen Geräten.
* `ansicht` — vier neue Aufnahmen: Gruppenwähler, Auswahlform, Tippform,
  Verwechslung.
* `beruehrung` — die Flaggenkacheln gegen die Fingergrenze.
* `doku` — die Zahl der Flaggen hier gegen die Zahl in den Daten.

### Und die Gegenproben

Jede neue Prüfung bekommt eine stehende Gegenprobe, und jede prüft zuerst, ob
ihr Eingriff angekommen ist (Regel 5, Regel 3). Die wichtigste:
**einer Flagge ihr unterscheidendes Zeichen wegnehmen** — das Tor muss anschlagen,
sonst prüft es nur, dass Rechtecke da sind.

---

## § 5 · Was das für Fiona bedeutet

Sie ist sechs und liest nicht. Alles hier ist so gebaut, dass sie es spielen
kann:

* Die App **sagt** das Land, sie tippt auf eine von vier Flaggen. Kein Wort
  Schrift.
* Jede dritte Frage kommt umgekehrt und wird **gesprochen** beantwortet — der
  Weg, den sie in der Erdkunde schon kennt.
* Ihre Tiefe ist `rang ≤ 3`: in Europa Russland, Deutschland, das Vereinigte
  Königreich. Drei Flaggen, nicht siebzehn.
* Die Flaggen sind **Farbflächen**. Sie sind für ein Kind, das nicht liest, das
  Zugänglichste in der ganzen App — leichter als ein Länderumriss und viel
  leichter als ein Wort.

**Q12 gilt hier genauso**: Fionas Runde ist mit drei Ländern je Karte kurz. Die
Flaggen machen das nicht schlimmer — sieben Karten mal drei sind 21 Flaggen —,
aber sie lösen es auch nicht. Das bleibt Q12.
