# Audit: das Forscherbuch

Stand v408 · gemessen am 5.9.2026 · Werkzeug im Sitzungsverzeichnis
(`buch/audit.mjs`, `buch/tinte.mjs`)

**Messstelle.** Alle Zahlen stammen aus dem **gebauten** Bündel
(`dist/index.html`), über **HTTP** ausgeliefert, in Chromium, mit einem
vollen Stand: 45 Tiere, 15 Räume, Kontinente und Bundesländer fertig,
Europa und Afrika halb. Drei Größen: 844 × 390 (das Zielgerät),
1180 × 820 (iPad) und 667 × 375 (die engste, die `passt` fährt).

**Ein erster Anlauf hat über `file://` gemessen** — dann schlägt jedes
Nachladen fehl, die Bundesländer haben keine Umrisse, und das Buch zeigt
sechzehnmal „undefined". Das sah aus wie ein Befund und war die
Messstelle (Regel 5). Über HTTP ist es weg.

---

## 0 · Referenzabgleich

Drei Vorbilder, und zwar aufgeschrieben, was sie **tun** — nicht, wie sie
aussehen.

| Vorbild | Was es TUT |
|---|---|
| **Panini-Sammelalbum** | Die Seite ist **voll**, bevor das Kind anfängt: jedes Bild hat seinen Platz, und der leere Platz trägt den Umriss dessen, was fehlt. Der Lohn ist das Füllen, nicht das Wachsen. |
| **Pokédex** | **Ein** Raster, **eine** Kartenform für alle 151. Gefangen und nicht gefangen unterscheiden sich in der Sättigung, nicht im Grundriss. Oben eine einzige Zahl: „142 / 151". |
| **Apple Fitness — Auszeichnungen** | Eine Spalte gleich großer Medaillen, chronologisch. Jede trägt Datum und einen Satz. Kein Element ist größer, weil es wichtiger wäre — die Menge erzählt. |

**Was alle drei teilen:** ein Raster, eine Kastenform, eine Kopfzahl, und
**der leere Platz ist sichtbar**. Was keines tut: je Kapitel einen anderen
Grundriss.

### Das Soll

| | |
|---|---|
| **S1** | Ein Buch, **ein** Raster. Nicht fünf Kapitel mit vier Grundrissen. |
| **S2** | **Eine** Kastenform für jedes Ding — Aufkleber, Abzeichen, Karte, Tier. |
| **S3** | Die Kopfzahl und die Reiterzahlen zählen **dasselbe**. |
| **S4** | Der leere Platz ist ein **Platz**, kein Rand. Die Seite ist voll. |
| **S5** | Eine Hierarchie: Überschrift → Rasterzelle → Fußnote. Heute hat alles dieselbe Stimme. |

---

## Der Abstand, gemessen

### B1 · Vier Grundrisse in einem Buch

Fünf Kapitel, vier völlig verschiedene Seitenaufbauten:

| Kapitel | Aufbau |
|---|---|
| Meine Tiere | zweite Reiterzeile (15 Räume) + Türbalken + Aufkleberreihe + Fußsatz |
| Abzeichen | zweispaltige Liste aus Pillen |
| Kontinente / Bundesländer | Titel links, **eine** große Karte mittig, Merksatz darunter |
| Als Nächstes | Titel + Balken + eine blasse Karte |

Ein Kind, das blättert, lernt bei jedem Reiter einen neuen Grundriss.
Gegen S1 und S2.

### B2 · Zwei Reiterzeilen übereinander

Das Tierkapitel hat **seine eigene** Reiterzeile (15 Räume) innerhalb
einer Seite, die selbst über Reiter erreicht wird. Auf den anderen vier
Seiten gibt es diese Zeile nicht — die Zeile erscheint und verschwindet je
nach Kapitel. Das ist die auffälligste Unruhe im ganzen Bildschirm.

### B3 · Die Kopfzahl widerspricht den Reitern

Oben steht **„20 Aufkleber"**. Die Reiter sagen 45 · 3 · 4 · 16 · 3.
`gesamt` zählt nur die Ebenen-Aufkleber (4 + 16 = 20); Tiere und Abzeichen
sind nicht darin. Zwei Zahlen über demselben Inhalt, in verschiedenen
Einheiten, ohne dass es dasteht. Gegen S3.

### B4 · Die Seite ist zur Hälfte leer — gemessen

Anteil der Bildpunkte im Inhaltskasten, die nicht der weiße Grund sind:

| | Telefon 844×390 | iPad 1180×820 | eng 667×375 |
|---|---|---|---|
| Meine Tiere | 15,5 % | 7,2 % | 20,4 % |
| Abzeichen | 33,9 % | 20,0 % | 53,1 % |
| Kontinente | **6,3 %** | **5,4 %** | 8,5 % |
| Bundesländer | 7,6 % | 7,6 % | 10,2 % |
| Als Nächstes | 8,7 % | 7,4 % | 10,5 % |

**Auf dem iPad tragen vier von fünf Seiten unter acht Prozent Tinte.** Die
Kartenseiten sind eine Karte in einem sonst weißen Feld; rechts daneben
liegen auf dem Zielgerät rund 55 % der Breite völlig ungenutzt (siehe das
Bundesländer-Bild). Gegen S4.

Die Abzeichenseite ist der Gegenpol: auf 667 × 375 liegt sie mit 53 % Tinte
und 129 % Inhaltshöhe über dem Rand und **rollt**.

### B5 · Drei von fünf Seiten rollen auf der engsten Größe

Gemessen (Inhalt gegen sichtbare Höhe): Abzeichen 129 %, Bundesländer
100 %, Als Nächstes 103 %. Auf dem Zielgerät rollt „Als Nächstes" mit
97 % knapp. Ein Buch, dessen Seiten teils rollen und teils halb leer sind,
hat keinen Rhythmus.

### B6 · Die Reiterzahlen sind nicht vergleichbar

„45" (Tiere), „3" (Abzeichen), „4" (Kontinente), „16" (Bundesländer),
„3" (offene Vorschau) stehen gleich groß und gleich gewichtet
nebeneinander — es sind aber vier verschiedene Dinge: gesammelte Tiere,
verdiente Abzeichen, gesammelte Gebiete, **noch offene** Gebiete. Die
letzte Zahl zählt in die andere Richtung.

### B7 · Kein Kapitel zeigt, was fehlt

Panini und Pokédex leben davon, dass der **leere Platz sichtbar** ist. Im
Buch ist das Offene entweder blass auf der Karte (Erdkunde, gut) oder es
kommt schlicht nicht vor: das Tierkapitel zeigt nur den geöffneten Raum,
die Abzeichenseite nur verdiente und angefangene. Von 124 geplanten Tieren
sieht das Kind drei.

### B8 · Der Merksatz hat keinen Ort

„In Afrika fließt der Nil …" steht linksbündig unter einer mittig
stehenden Karte — er gehört optisch zu nichts. Auf der Tierseite steht an
derselben Stelle „Der Gorilla war schon 3-mal da", zentriert. Zwei Sätze,
zwei Ausrichtungen, dieselbe Rolle.

### B9 · Die Farben tragen kein System

Fünf Reiterzahlen in fünf Akzentfarben, die Aufkleber in sieben
Flächenfarben nach Position (`FL[x.i%7]`), die Abzeichen in Grün und
Gelb nach Zustand. Drei Farbsysteme auf einem Bildschirm. Keines sagt dem
Kind etwas, das es nicht schon sieht.

### B10 · Das Vorbild zeigt ein fast leeres Buch

`tor/vorbilder/quer-buch.png` hält ein Buch mit **zwei** Aufklebern und
ohne Reiterzeile fest. Der Zustand, den ein Kind nach ein paar Wochen
sieht — fünf Kapitel, 45 Tiere — hat **kein** Vorbild. `quer-buch-tiere`
zeigt nur das Tierkapitel. Drei der fünf Seiten sind von keinem Tor je
angesehen worden. Das ist der Grund, warum B1 bis B9 so lange stehen
konnten.

**Erledigt in Runde 4 (v422).** „Abzeichen", „Bundesländer" und „Als
Nächstes" haben ein Vorbild bekommen, alle drei mit vollem Stand — 49
Aufnahmen statt 46. Damit ist jeder der sechs Buchbildschirme bezeugt.

Und der Befund hat sich sofort bestätigt: **beim ersten Ansehen standen
auf zwei der drei neuen Seiten Sätze, die mitten im Wort umbrachen.**
Der Zusatz war ein `<small>` IM Titel und brach dort, wo die schmale
linke Spalte gerade endete — „Deine Abzeichen 3 / verdient" und „Als
Nächstes: Europa 0 von 3 / gesammelt". Kein Tor hatte je hingesehen; die
Tonleiter zählt Werte, `passt` misst Ränder, und beides war grün.

Der Zusatz ist jetzt eine eigene Zeile in der Fuß-Rolle. Dabei fiel
zweierlei auf, was ohne das Bild nicht aufgefallen wäre: „3 verdient"
sagt dasselbe wie der Reiter „3/9" und ist weg, und „16 Aufkleber, 2
davon sicher" ist auf „2 davon sicher" gekürzt — die 16 steht schon
oben.

---

## Was daraus folgt

Der Befund ist **nicht** „es sieht altbacken aus". Er ist:

> Das Buch ist als **Sammlung von Sonderfällen** gewachsen. Jedes Kapitel
> hat den Grundriss bekommen, der zu seinem Inhalt passte, und keiner den,
> der zum Buch passt.

Deshalb ist der Griff auch keine Politur, sondern **ein Raster für alle**.

---

## Die Bilder zum Befund

Sie liegen in `docs/bilder/buch-audit/` — vom Zielgerät, mit vollem Stand:

| Datei | zeigt |
|---|---|
| `telefon-tiere.png` | B2: zwei Reiterzeilen übereinander · B3: „20 Aufkleber" über „45 Meine Tiere" |
| `telefon-abzeichen.png` | B1: der Listengrundriss, den sonst keine Seite hat |
| `telefon-kontinente.png` | B4: 6,3 % Tinte · B8: der Merksatz ohne Ort |
| `telefon-bundeslaender.png` | B4: die rechte Hälfte des Bildschirms ist leer |
| `telefon-naechstes.png` | B6: die „3" zählt in die andere Richtung |
| `ipad-kontinente.png` | B4 auf dem grossen Schirm: 5,4 % Tinte |

---

## Der Umbau — Vorschlag in vier Runden

Die Reihenfolge ist nicht beliebig: **das Raster kommt vor allem, was
darauf steht**, und die Vorbilder kommen zuletzt, sonst werden dieselben
Bilder viermal erneuert.

### Runde 1 · Das Raster, und `passt` bekommt eine Zahl dafür

Eine Rasterzelle, überall dieselbe: quadratisch, mindestens 44 pt,
Bild oben, Name darunter. Aufkleber, Tier und Abzeichen sind dieselbe
Zelle in drei Füllungen. Die Kartenseiten behalten ihre Karte — sie
**ist** der Gegenstand (Q28) —, bekommen aber denselben Rahmen und
denselben Randabstand wie das Raster.

Neu gemessen und als Zahl festgehalten: **Tinte je Seite mindestens
18 %** auf allen drei Größen (heute 5,4 bis 53). Eine Ratsche, kein Soll —
sie darf nur steigen.

*Kosten: eine Runde, ~220 s Kette, plus die zwei Vorbilder.*

### Runde 2 · Eine Zahl, die stimmt (B3, B6)

Die Kopfzeile zählt **alles**: „68 gesammelt". Die Reiter tragen
`da / gesamt` statt einer nackten Zahl — „4/7", „16/16", „45/124". Damit
zählt jede Zahl dasselbe und in dieselbe Richtung, und B7 ist nebenbei
gelöst: das Kind sieht, wie viel es überhaupt gibt.

„Als Nächstes" wird kein Kapitel mehr, sondern ein **Streifen unter der
Kopfzeile** — es ist keine Sammlung, sondern ein Hinweis.

*Kosten: eine Runde, dieselbe Kette; `smoke` und `inhalt` brauchen je eine
Gegenprobe.*

### Runde 3 · Das Tierkapitel bekommt den Grundriss der anderen (B2)

Die zweite Reiterzeile fällt weg. Statt dessen: **alle 15 Räume
untereinander als Bänder**, jedes Band mit seiner Kulisse als Streifen,
den drei Tieren im selben Raster und der Tür rechts. Das ist derselbe
Aufbau wie eine Kartenseite — Überschrift, Raster, Fußnote — nur
fünfzehnmal. Rollen ist hier richtig: es ist **eine** Liste, kein
Blättern.

*Kosten: eine Runde. Das ist der grösste Eingriff; `passt` fährt hier den
teuersten Stand.*

### Runde 4 · Die Vorbilder und die Tore

`ansicht` bekommt **alle fünf** Kapitelseiten als Vorbild statt zweier
(B10) — mit vollem Stand, auf dem Zielgerät. Dazu die Tinte-Ratsche aus
Runde 1 als Tor und eine Gegenprobe je neuer Prüfung.

*Kosten: eine Runde, danach ist der Bildschirm zum ersten Mal vollständig
bezeugt.*

### Was ich NICHT vorschlage

- **Keine neue Farbwelt.** B9 ist echt, aber drei Farbsysteme werden nicht
  besser, indem ein viertes dazukommt. Sie fallen mit dem Raster von
  selbst zusammen: eine Zelle, eine Farbregel.
- **Kein Umbau der Aufkleber selbst.** Der Umriss auf der Karte ist
  gemessen richtig (Q28) und ist nicht das Problem.
- **Keine Animation.** Ein Buch, das wackelt, liest sich nicht besser —
  und alles, was auf iOS gut aussehen soll, müsste ohne `filter` auskommen
  (die Safari-Falle, Regel 13). Der Aufwand stünde gegen einen Gewinn, den
  keine der drei Referenzen hat.
