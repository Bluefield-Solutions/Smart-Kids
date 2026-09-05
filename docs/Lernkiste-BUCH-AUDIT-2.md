# Audit II: das Forscherbuch — Boutique, Struktur, Kind, Schönheit

Stand v410 · gemessen am 5.9.2026 · `npm run buch-audit` (Bilder und
Grundriss) und `node tools/buch-feinmass.mjs` (Tonleiter, Stimme, Griffe)

Das erste Audit hat den **Grundriss** vermessen: fünf Kapitel, vier
Aufbauten, halbleere Seiten. Dieses hier misst das, was ein Bildschirm
„gemacht" aussehen lässt — und es kommt etwas anderes heraus, als ich
erwartet hatte.

**Messstelle.** Gebautes Bündel über HTTP, Chromium, 844 × 390, voller
Stand (45 Tiere, 15 Räume, zwei fertige Karten, zwei halbe). Gezählt wird
über **alle fünf Kapitelseiten** zusammen; „×26" heißt: sechsundzwanzig
Textknoten tragen diesen Wert.

---

## Der rote Faden

> **Das Buch ist überall gleich laut und überall anders gebaut.
> Es müsste überall gleich gebaut sein und verschieden laut.**

Das ist der ganze Befund, und alles Weitere hängt daran.

**Gleich laut:** von 82 Textknoten stehen **66 in Fett** (Schnitt ≥ 700).
Es gibt genau **einen** Abstand, der etwas trennt — 8 Punkte, 130-mal
verwendet — und **keinen einzigen** über 12. Wo etwas Luft hat, ist es
nicht Absicht, sondern Rest: die einzige große senkrechte Lücke im
Inhaltskasten misst 127 Punkte und stammt aus einer Ausrichtung, nicht aus
einer Entscheidung.

Wenn alles fett ist, kann nichts hervortreten. Wenn alles 8 Punkte
auseinandersteht, gruppiert sich nichts. Ein Bildschirm ohne Betonung
liest sich wie eine Liste — auch dann, wenn er keine ist.

**Anders gebaut:** vier Grundrisse (Audit I, B1), und die Fluchtlinien
sind je Seite andere:

| Seite | linke Kanten (Punkte ab Kasten) |
|---|---|
| Meine Tiere | 0 · 12 · 76 · 214 |
| Abzeichen | 0 · 214 · 259 · 527 · 572 · 719 |
| Kontinente | 0 · 12 · 214 · 223 |
| Bundesländer | 0 · 12 · 214 · 223 |
| Als Nächstes | 0 · 12 · 214 · 223 |

Geteilt werden **zwei** Linien: 0 und 214. Und die 214 ist nicht gesetzt,
sie ist die linke Kante der Kartenkachel — sie stimmt auf vier Seiten
zufällig überein und auf der fünften nicht.

**Boutique ist keine Zutat.** Es ist genau diese Umkehrung: das Gerüst
steht fest, damit die Betonung frei wird. Panini, Pokédex und die
Fitness-Auszeichnungen machen alle dasselbe — immer dieselbe Zelle,
immer dieselben Ränder, und dann darf **eine** Sache groß sein.

---

## 1 · Boutique-Layout: was gemessen fehlt

### C1 · 80 % der Schrift ist fett

| Grösse/Schnitt | Vorkommen | wo |
|---|---|---|
| 14/700 | 26 | fast jeder Fliesstext |
| 24/800 | 25 | die Reiterzahlen |
| 17/700 | 15 | Überschriften |
| 14/400 | 6 | die wenigen normalen Texte |
| 14/600 | 4 | Reiterbeschriftung |
| 10/400 · 13/400 | 6 | Kleintext |
| 17/800 | 3 | „Deine Abzeichen" — **eine** Überschrift, die aus der Reihe fällt |

Vier Schnitte (400/600/700/800) auf drei Größen ergeben acht
Kombinationen — mehr als eine Tonleiter braucht, und trotzdem ohne
Hierarchie, weil die häufigste Stufe (14/700) die *unterste* ist.

**Soll:** drei Stufen, ein Schnitt je Stufe. Überschrift 20/700 ·
Zelle 14/600 · Fußnote 12/400. Alles andere wird eine davon.

### C2 · Es gibt keinen großen Abstand

Gemessene Abstände: **8** (130×), **2** (57×), **12** (25×), **4** (8×).
Das ist die halbe Tonleiter — der Teil, der Dinge *trennt*, fehlt ganz.
Ohne 24 und 32 kann eine Seite keine Gruppen bilden, und ohne Gruppen
sieht jede Seite aus wie ein Stapel.

**Soll:** 4 · 8 · 16 · 24 · 40, und zwar mit einer Regel — 8 innerhalb
einer Zelle, 16 zwischen Zellen, 24 zwischen Gruppen, 40 zwischen
Abschnitten.

### C3 · Zwanzig Schatten, die nichts tun

Von vier Schattenwerten ist einer `0px 0px 0px 0px` und kommt **20-mal**
vor. Er zeichnet nichts; er steht da, weil eine Regel ihn setzt und eine
andere ihn zurücknimmt. Toter Stil ist kein Schönheitsfehler, aber er ist
das Zeichen dafür, dass niemand mehr überblickt, was gilt.

### C4 · Drei Farben umgehen die Marken

Unter sieben Grundfarben stehen drei als rohes `rgb(...)`:
`rgb(230,239,226)`, `rgb(226,238,244)`, `rgb(244,232,214)` — die
Aufklebertöne der Tiere, die als `ton` in den **Daten** stehen. Das war
eine bewusste Entscheidung (der Ton gehört zum Tier), aber sie hat einen
Preis, den man jetzt sieht: drei Farben im Bild, die kein Abendmodus und
keine Marke je erreicht. Gegen Regel 6, mit Ansage.

### C5 · Sieben Klassen kommen genau einmal vor

38 Klassen im Buch, 7 davon einmalig (`abzkopf`, `vorschau`, …). Jede ist
ein Sonderfall, den man beim nächsten Umbau übersieht.

---

## 2 · Struktur: der Bauplan fehlt, nicht die Ordnung

Die Seiten sind **in sich** sauber — das Problem ist, dass es fünf
verschiedene „in sich" gibt. Es fehlt die Ebene darüber:

```
heute:   Kopf │ Reiter │ ??? (fünfmal etwas anderes)
soll:    Kopf │ Reiter │ Titel · Zähler · Balken │ RASTER │ Fußsatz
```

Jede Seite hat dieselben fünf Teile — nur mit anderem Inhalt. Die
Kartenseiten füllen das Raster mit *einer* Zelle (der Karte), das
Tierkapitel mit fünfzehn Bändern, die Abzeichen mit Medaillen. **Ein**
Bauplan, drei Füllungen.

Damit fällt auch B2 aus Audit I: die zweite Reiterzeile im Tierkapitel
braucht es nicht mehr, weil das Raster untereinander läuft.

---

## 3 · Kindgerecht: Fiona kann nicht lesen

Das ist der Teil, der mich am meisten überrascht hat.

### K1 · Die Abzeichenseite ist zu 92 % Text

| Seite | Zeichen | Bildanteil der Fläche |
|---|---|---|
| Abzeichen | **312** | **8 %** |
| Meine Tiere | 188 | 38 % |
| Bundesländer | 164 | 38 % |
| Kontinente | 149 | 66 % |
| Als Nächstes | 123 | 56 % |

Die Abzeichen sind der Ort, an dem das Buch sagt „das **kannst** du" —
und ausgerechnet er ist für ein sechsjähriges Kind, das nicht liest, eine
Wand aus Buchstaben. Das Zeichen daneben ist 22 Punkte groß, der Satz
zieht sich über zwei Zeilen.

**Soll:** die Medaille wird das Bild und der Satz die Bildunterschrift —
nicht umgekehrt. Zeichen mindestens 44 Punkte, ein Wort darunter, der
ganze Satz nur in der Ansage.

### K2 · Fünfzehn Griffe unter der Fingergrenze

Auf der Tierseite sind **15** Griffe kleiner als 44 Punkte — die
Raumreiter mit ihren 28 × 17 Punkten. `passt` meldet das als *Hinweis*,
nicht als Fehler; das war für Reiter richtig, solange es drei waren. Bei
fünfzehn ist es die Hauptbedienung des Kapitels.

Mit dem Raster aus Abschnitt 2 verschwindet der Befund, statt behoben zu
werden — die Reiter fallen weg.

### K3 · „Zurück" wird nicht angesagt

Der einzige Griff im ganzen Buch ohne `data-lesen` und ohne
`aria-label`. Er trägt ein Wort, das Fiona nicht liest, und ein Zeichen,
das ihr niemand vorspricht. Ein Satz Arbeit.

### K4 · Die Zahl 45 ist für Fiona keine Zahl

Die Reiter tragen ihre Menge als Ziffer (45, 3, 4, 16, 3) in 24/800. Ein
Kind, das nicht liest, liest auch keine zweistelligen Zahlen sicher. Das
Bild auf dem Reiter (Audit I: das erste eigene Tier) trägt hier mehr als
die Ziffer — im Tierkapitel gibt es das schon, in den anderen vier nicht.

---

## 4 · Schön: was nach dem Aufräumen übrig bleibt

Wenn C1 bis C5 und Abschnitt 2 erledigt sind, bleiben drei Dinge, die
wirklich Gestaltung sind und nicht Ordnung:

- **S1 · Der Kopf trägt nichts.** „20 Aufkleber" in der Mitte, zwei
  Knöpfe außen. Ein Buch, das eine Sammlung ist, darf oben zeigen, wie
  weit sie ist — ein Band, nicht eine Zahl.
- **S2 · Die Zelle hat keine Kante.** Aufkleber, Abzeichen und
  Kartenkachel haben drei verschiedene Rahmen (20 · 12 · 999 Punkte
  Radius). Eine Sammlung sieht aus wie eine Sammlung, wenn die Fassung
  immer dieselbe ist.
- **S3 · Der leere Platz fehlt.** Das ist der eine Punkt, an dem das Buch
  von seinen drei Vorbildern am weitesten weg ist — und der einzige, der
  ohne neues Material Freude macht: ein Kind, das sieht, dass 79 Plätze
  auf es warten, blättert weiter.

---

## Was das für den Umbau ändert

Der Plan aus Audit I bleibt in der Reihenfolge richtig, bekommt aber
**vor** Runde 1 einen Schritt, den ich vorher nicht hatte:

### Runde 0 · Die Tonleiter (neu)

Drei Schriftstufen, fünf Abstände, **ein** Radius, ein Schatten — als
Marken in `marken.css`, und der tote Nullschatten fliegt raus. Das ist
eine Stunde Arbeit und macht die drei folgenden Runden erst billig: wer
danach eine Zelle baut, hat nichts mehr zu entscheiden.

Dazu die Ratsche, die es messbar hält: **höchstens 3 Schriftstufen,
höchstens 2 Radien, höchstens 5 Abstandswerte im Buch** — gemessen von
`buch-feinmass`, das dafür ein Tor wird.

Danach unverändert:

1. **Das Raster** — eine Zelle, überall dieselbe (Audit I, Runde 1)
2. **Eine Zahl, die stimmt** — Kopfband statt Kopfzahl, `da/gesamt` (I/2)
3. **Das Tierkapitel bekommt den Bauplan der anderen** (I/3)
4. **Vorbilder und Tore** — alle fünf Seiten (I/4)

Und drei Kleinigkeiten, die in jede der Runden nebenbei passen: K3
(„Zurück" ansagen, ein Satz), C3 (Nullschatten), C5 (die sieben
Einmal-Klassen).
