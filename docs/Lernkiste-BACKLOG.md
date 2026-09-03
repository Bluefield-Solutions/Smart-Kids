# Backlog

Diese Datei ist **zweierlei**, und das muss man wissen, bevor man sie
anfasst:

1. Die Liste dessen, was noch zu tun ist — sortiert nach **Nutzen für
   euch**, seit dem 30.08.2026 (vorher: nach Tragfähigkeit; siehe § 0).
2. Eine **Quelle, aus der Tore lesen**. Abschnitt § 2 ist kein Text,
   sondern Eingabe für `tor/smoke.mjs` und `tor/inhalt.mjs`. Wer dort eine
   Zeile umbenennt, macht ein Tor blind — die Tore melden das zwar
   ausdrücklich („Die Zeile ‚Ländertiefe' fehlt im Backlog"), aber sie
   melden es erst, wenn jemand sie fährt.

Was hier steht, ist geprüft und nicht geschätzt: wo etwas schon da ist,
steht es dabei; wo etwas an Daten hängt, ist die Quelle nachgesehen; jede
Zahl trägt ihre Messstelle.

---

## § 0 · Wonach hier sortiert wird — und was sich daran geändert hat

Bis zum 30.08.2026 stand oben, was am **tragfähigsten** war: jede Runde
sollte auf der vorigen stehen können. Das war richtig, solange das Gerüst
gebaut wurde — und es hat einen Preis, den man erst am Ergebnis sieht:
eine Reihenfolge nach Tragfähigkeit schiebt das, was ein Kind *merkt*,
immer wieder nach hinten.

**Ab jetzt wird nach Nutzen sortiert.** Nutzen heißt hier genau eine
Frage, und keine andere:

> *Wer merkt was davon — in der nächsten Sitzung, ohne dass es ihm jemand
> erklärt?*

Drei Stufen, mehr braucht es nicht:

| Stufe | heißt |
|---|---|
| **hoch** | Fiona, Lea oder ihr merkt es beim nächsten Spielen von selbst |
| **mittel** | fällt auf, wenn man es sucht, oder wirkt erst über Wochen |
| **gering** | merkt nur, wer am Code sitzt (Laufzeit, Prüfbarkeit, Ordnung) |

Der Aufwand steht daneben, aber er sortiert nicht. Er sagt nur, wie eine
Runde geschnitten werden muss.

**Tragfähigkeit ist damit nicht weg — sie ist vom Sortierkriterium zum
Zwang geworden.** Es gibt genau drei echte:

- **N2a vor N3.** Ohne Erkennung kein Diktat.
- **N2a vor N4.** Zahlen sind dieselbe Maschine mit anderen Vorlagen; wer
  sie vorher baut, baut sie zweimal.
- **§ 2 und der Code gemeinsam.** Die Profiltabelle unten und `PROFILE` in
  `prototyp/spiel.js` müssen in *einem* Schritt geändert werden, sonst ist
  der Rauchtest rot (siehe N1).

Alles andere ist frei, und deshalb steht ab hier der Nutzen vorn.

---

## § 1 · Entschieden — damit es nicht zweimal verhandelt wird

| Frage | Antwort | seit |
|---|---|---|
| Welche Kacheln in einer Sprache? | **alle drei** Wahlbildschirme — Profil, Welt, Ebene | R2 |
| Welcher Entwurf? | **B · Bild** — jede Kachel zeigt ihren echten Umriss | R2 |
| Welcher Grund? | **weiß** (Fassung W2) statt des hellen Blaus | R2 |
| Wie heißt das dritte Profil? | **Eltern** (nicht „Adam") — jetzt aufgelöst durch N1 | R4 |
| Wie heißt der PIN-Bereich? | **„Für Eltern"** — anderer Name als das Profil | R4 |
| Vorlauf oder Lerneinheit? | der **Vorlauf ersetzt** die Stadtstaaten-Einheit | R3 |
| Was steuert die Auswahl? | die **Ebene** sagt „vier Möglichkeiten", das **Profil** sagt „nie" | R4 |
| Ein Vorrat darf wie groß sein? | **von Natur aus begrenzt** — siehe § 5.2 | R4 |
| Wonach wird sortiert? | **Nutzen**, nicht Tragfähigkeit | 30.08.2026 |
| Wie wird ein Buchstabe erkannt? | **beides, gestuft** — Striche zuerst, Klassifikator als Netz (W-A) | 30.08.2026 |
| Wie streng? | Nachfahren **locker**, freies Schreiben **mittel**, nach drei Fehlern vormachen (W-B) | 30.08.2026 |
| Was vergleichen die Eltern? | **fehlerfrei beim ersten Versuch**, Zeit daneben — keine neue Zahl (W-C) | 30.08.2026 |
| Wo steht das Schreibspiel? | **dritte Welt**, nur für Fiona sichtbar (W-D) | 30.08.2026 |

---

## § 2 · Die Tabellen, aus denen Tore lesen

**Nicht Prosa. Eingabe.** Gelesen von `tor/smoke.mjs` (Profilnamen, Tiefe,
Sitzungslänge, Auswahlverbot, Ton, Vorlesen) und `tor/inhalt.mjs` (Ton je
Profil, die drei Rechensorten). Der Grund ist Regel 3 (das Soll kommt aus der
Referenz, nicht aus mir): das Erwartete darf
nicht aus der Datei kommen, die geprüft wird. Setzt man Fionas Tiefe in
`spiel.js` auf zwölf und stünde das Soll auch dort, wanderte die Erwartung
mit — und vor einer Sechsjährigen stünden zwölf Länder.

### 2.1 Die drei Profile

| | Fiona (6) | Lea (8) | Stephan | Violeta |
|---|---|---|---|---|
| Eingabe | ziehen, sprechen | ziehen, tippen | **nur tippen** | **nur tippen** |
| Vorlesen | ja | nein | nein | nein |
| Ton | kindlich | kindlich | **sachlich** | **sachlich** |
| Auswahl statt Tippen | 4 Möglichkeiten | nur Ebene 4 | **nie** | **nie** |
| Ländertiefe | 3 | **13** | **17** | **17** |
| Aufgaben je Sitzung | 6 | 8 | **12** | **12** |
| streng | nein | ja | ja | ja |

> **Zwei Zeilen dieser Tabelle widersprechen sich — gemessen in Q12.** Fionas
> Ländertiefe ist 3, ihre Sitzung ist 6 lang: auf **jeder** der sieben
> Länderebenen bekommt sie deshalb drei Aufgaben, nie sechs. Die App füllt
> richtig nicht auf (`spielprobe` bezeugt das), also ist ihre Erdkunde-Runde
> halb so lang wie ihr Rechnen, ihr Schreiben und ihre Bundesländer. Das ist
> kein Programmfehler, sondern eine Entscheidung, die hier fällt — und sie ist
> noch nicht gefallen.

**Stephan und Violeta sind Spalte für Spalte gleich.** Das ist keine
Bequemlichkeit, sondern die Bedingung des Vergleichs: wer verschiedene
Aufgaben bekäme, ließe sich nicht vergleichen. Verschieden ist nur der
Name — und die Farbe der Kachel.

Die **Kennungen kommen aus der Kopfzeile**, nicht aus einer Liste im Tor:
das erste Wort einer Spalte, klein geschrieben. Vor N1 stand in vier Toren
`['fiona','lea','eltern']`; eine vierte Spalte hätte sie still falsch
gemacht — jede Zeile wäre um eins verrutscht, und Violetas Werte wären als
Stephans geprüft worden. Jetzt trägt die Tabelle ihre eigenen Namen.

### 2.2 Der Rechenvorrat der Eltern

| Sorte | Regel | Beispiel | Anzahl |
|---|---|---|---|
| `mal-gross` | 11…19 × 11…19, ohne die Quadrate | 13 × 17 | 72 |
| `quadrat` | 12² bis 25² | 17² | 14 |
| `geteilt-gross` | die Umkehrung von `mal-gross` | 221 : 13 | 72 |
| | | **gesamt** | **158** |

Fionas Vorrat ist 100 (alle Summen bis 10), Leas 140 (die Reihen 6 bis 10);
deren Sollzahlen stehen im ANTON-Abgleich (C1, C2), aus demselben Grund.

### 2.3 Was die Buchstabenerkennung leisten muss

Gelesen von `tor/schreiben.mjs`. Auch hier gilt Regel 3: stuende das Soll
in `src/inhalt/schreiben.js`, wuerden die beiden Schwellen (`ABSTAND_MAX`,
`VORSPRUNG_MIN`) so lange verschoben, bis das Tor gruen ist — und das Tor
pruefte sich selbst.

Gemessen wird an kuenstlich verkrummten Fassungen aller 36 Vorlagen — 26
Buchstaben und 10 Ziffern — und an 800 Gekritzeln aus zufaelligen
Punktfolgen. Verzerrt werden Lage, Groesse, Drehung und Zittern; jeder
vierte Zug bricht zu frueh ab; und — seit N4 — werden Zuege **verbunden
und geteilt**, weil ein Kind den Finger nicht immer absetzt. Die Zahlen
sind fest gewuerfelt, also bei jedem Lauf dieselben.

Der Nachtrag ist keine Feinheit: ohne verbundene Zuege konnte die Messung
den Preis des Zug-Aufschlags nicht sehen und empfahl einen, der neun
Prozentpunkte kostet. Eine Messung, die den Preis einer Sache nicht sehen
kann, empfiehlt sie immer.

| Was | Soll |
|---|---|
| Vorlage erkennt sich selbst | 36 von 36 |
| Krumm geschrieben, richtig erkannt | mindestens 88 % |
| Sicher erkannt, aber das falsche Zeichen | höchstens 2 % |
| Gekritzel als Zeichen angenommen | höchstens 1 % |

**Der letzte Wert ist der, auf den es ankommt.** Ein Erkenner, der alles
annimmt, erkennt nichts — und N3 (Buchstabe nach Ansage) waere sinnlos,
weil jede Kritzelei als Antwort durchginge.

---

## § 3 · Offen — die Rangliste

Ein Blick, keine Suche. Die Blöcke darunter sagen, was jeder Punkt ist.

| # | Punkt | wer merkt es | Nutzen | Aufwand | hängt an |
|---|---|---|---|---|---|
| ~~1~~ | ~~**N2a** Buchstaben nachfahren~~ | Fiona | hoch | groß | **gefahren** |
| ~~2~~ | ~~**N3** Buchstabe angesagt, selbst geschrieben~~ | Fiona | hoch | mittel | **gefahren** |
| ~~3~~ | ~~**N4** Zahlen 1 bis 20~~ | Fiona | hoch | klein | **gefahren** |
| ~~4~~ | ~~**N1** Stephan und Violeta, mit Vergleich~~ | ihr beide | hoch | mittel | **gefahren** |
| ~~5~~ | ~~**S1** Drei Sterne bedeuten zwei Dinge~~ | Fiona, Lea | hoch | klein | **gefahren** |
| ~~6~~ | ~~**A3** Der Fehler wird auch beim Ziehen benannt~~ | Fiona, Lea | hoch | mittel | **gefahren** |
| ~~7~~ | ~~**F13** Der Sprachmodus hatte keinen Ausgang~~ | Fiona | hoch | klein | **gefahren** |
| ~~8~~ | ~~**F14** Gesprochenes als Satz verstehen~~ | Fiona | hoch | mittel | **gefahren** |
| ~~9~~ | ~~**F15** Vier Hebel für die Sprachqualität~~ | Fiona | hoch | mittel | **gefahren** |
| ~~10~~ | ~~**B3** Die umgekehrte Frage~~ | Lea | mittel | mittel | **gefahren** |
| ~~11~~ | ~~**S3** Die Buchstabenkarten im Vorlauf~~ | Fiona | gering | klein | **gefahren** |
| ~~12~~ | ~~**B2** Test ohne Hilfen, mit Pokal~~ | Lea | mittel | mittel | **gefahren** |
| ~~13~~ | ~~**G12** Profilfarben und der Streu auf der Kachel~~ | Fiona, Lea, Stephan | — | mittel | **gewünscht, gefahren** |
| ~~14~~ | ~~**D2** Abzeichen, die etwas sagen~~ | Fiona, Lea | mittel | mittel | **gefahren** |
| 1 | **N2b** Der Klassifikator als Auffangnetz | Fiona | mittel | mittel | echte Züge |
| ~~—~~ | ~~**M4r** Sprechen auf dem iPhone~~ | | | | **gefahren 01.09.** |
| ~~3~~ | ~~**A4h** „Heute schon geübt"~~ | | | | **gefahren (Q31)** |
| 4 | **D3** Ein Satz zum Mitnehmen | Fiona, Lea | mittel | groß | 63 Sätze |
| 5 | **D1** Ein Begleiter | Fiona | mittel | groß | Bilder — also ihr |
| ~~6~~ | ~~**S2** Anteil neben Anzahl~~ | | | | **gefahren (Q31)** |
| ~~7~~ | ~~**Q1** Zwei Gegenproben beweisen nichts~~ | | | | **nachgesehen (Q31): beide schlagen an** |
| ~~—~~ | ~~**Q2** überholte Nachweise~~ | | | | **gefahren 01.09.** |
| ~~2~~ | ~~**Q33** Die Lupenknöpfe liegen auf der Karte~~ | | | | **gefahren (Q33): Verdeckung 0 %** |
| 9 | **P2** Die festen Wartezeiten im Rauchtest | nur ich | gering | mittel | — |
| ~~10~~ | ~~**P3** Größenwächter ohne Gegenprobe~~ | | | | **gefahren (Q31)** |
| ~~—~~ | ~~**D2c** Deutschlands Nachbarn~~ | | | | **gefahren** |
| ~~—~~ | ~~**D2b** Mehr Abzeichen~~ | | | | **gefahren** |
| ~~—~~ | ~~**P5** Die Größenratsche~~ | | | | **gefahren** |
| ~~—~~ | ~~**P1** `passt` und `ziehen` nebeneinander~~ | | | | **gefahren** |
| ~~—~~ | ~~**P4** Regelverweise ins Leere~~ | | | | **gefahren** |

*Nachgezogen am 01.09.2026.* Fünf Zeilen standen hier als „offen", während
ihr eigener Abschnitt weiter unten seit Runden **ERLEDIGT** trägt — die
Tabelle wurde nicht mitgepflegt, als die Punkte fielen. Genau die Falle, die
Regel 6 beschreibt, diesmal in einem Dokument: wer nur die Rangliste liest,
arbeitet an Erledigtem.

**A4** hiess doppelt. „Heute schon geübt" aus dem ANTON-Katalog und die
Runde A4 im STAND (Sprechen in allen Profilen, Hörknopf für Fiona) sind
zwei verschiedene Dinge; der Katalogpunkt heisst deshalb jetzt **A4h**.

---

### N1 · Stephan und Violeta  ·  ERLEDIGT

**Ziel.** Aus der einen Kachel „Eltern" werden zwei: **Stephan** (mit PH)
und **Violeta** (mit einem T). Gleiche Aufgaben, gleiche Schwierigkeit,
gleicher Ton — verschieden ist nur, **wer** gespielt hat. Und am Ende ein
Bildschirm, auf dem das nebeneinander steht: wer hat bei welcher Aufgabe
wie viele Punkte.

**Was schon dasteht.** Der Fortschritt wird bereits **je Profil** abgelegt
(`fortschritt` unter `${P.id}:${ebene}`, `spiel.js:740`). Ein zweites
Elternprofil speichert also von selbst getrennt; nichts muss umgezogen
werden. Auch der Elternbereich kennt seit R7 drei Profile statt eines und
zeigt Zahlen, Wackelkandidaten und einen Löschknopf **je Profil**.

**Was wirklich fehlt.** Drei Dinge:

1. Die Spalte in § 2.1 — und im selben Schritt die Tore, die sie der Reihe
   nach lesen. Vier Profile, vier Spalten, und `smoke.mjs` liest heute
   `['fiona','lea','eltern']` fest. Das ist die Stelle, an der diese Runde
   *technisch* stattfindet.
2. Der **Vergleich**. Zwei Fortschrittsstände nebeneinander sind noch kein
   Wettkampf: es braucht eine Größe, die man vergleichen kann. Entschieden
   ist **fehlerfrei beim ersten Versuch, Zeit daneben** (W-C) — beides wird
   längst gezählt, keine neue Zahl entsteht.
3. Der alte Stand unter der Kennung `eltern`. Er gehört einem von euch —
   nur weiß niemand, wem. Vorschlag: er wird **Stephan** zugeschlagen und
   das steht dabei, statt ihn stillschweigend zu verlieren oder zu
   verdoppeln.

**Erledigt.** Vier Kacheln auf der Profilwahl, Spalte für Spalte gleiche
Werte für die beiden Erwachsenen, und im Elternbereich ein Bildschirm
**Stephan gegen Violeta**: je Übung und zusammen, wie viele Aufgaben *auf
Anhieb richtig* waren, die Zeit klein daneben. Wer in einer Zeile vorn
liegt, ist markiert — sonst müsste man zwei Zahlen im Kopf vergleichen.

Der eigentliche Umbau lag woanders, als er aussah: **vier Tore lasen die
Spalten der Reihe nach** (`['fiona','lea','eltern']`). Eine vierte Spalte
hätte jede Zeile um eins verschoben, und Violetas Werte wären als Stephans
geprüft worden — lautlos. Die Kennungen kommen jetzt aus der **Kopfzeile**
der Tabelle; eine fünfte Spalte würde von selbst mitgeprüft.

Und die Lücke, die dabei sichtbar wurde: fällt eine Spalte *weg*, prüft
jedes Tor stillschweigend ein Profil weniger — keines wird rot, weil ihnen
allen dasselbe Soll fehlt. Der Rauchtest vergleicht deshalb jetzt die Zahl
der Profile in der App mit der Zahl der Spalten.

Der alte Stand unter der Kennung `eltern` ist **Stephan zugeschlagen** und
zieht beim ersten Start um; das Protokoll wird beim Lesen umgeschrieben,
nicht in der Ablage — ein Mitschnitt wird nicht rückwirkend geändert.

**Abnahme, gefahren.** Der Rauchtest liest vier Profilnamen aus § 2.1,
findet jeden in der Übersicht und je einen Löschknopf, spielt **alle vier**
Profile durch, und setzt einen Mitschnitt mit bekanntem Ausgang: die
Erwartung (2 von 3 gegen 1 von 2, Stephan vorn) steht im Tor
ausgeschrieben, nicht als zweiter Aufruf derselben Rechnung. Zwei stehende
Gegenproben: eine lässt „auf Anhieb" zu „richtig" werden, eine nimmt der
Tabelle eine Spalte.

---

### N2a · Buchstaben nachfahren  ·  ERLEDIGT

**Ziel.** Ein Buchstabe steht groß auf dem Bildschirm, zum Beispiel ein A.
Fiona fährt ihn mit dem Finger nach. Danach — weiter unten oder auf einem
zweiten Schritt — schreibt sie ihn **frei**, und das Spiel sagt ihr, ob es
ein A geworden ist, und macht es richtig vor, wenn nicht.

Das ist der Punkt mit dem größten Nutzen im ganzen Verzeichnis, und zwar
aus einem Grund: **Fiona kann noch nicht lesen.** Alles andere hier macht
ihr das Abfragen leichter. Das hier bringt ihr etwas bei, das sie danach
überall braucht — auch in diesem Spiel selbst.

**Was das an der Architektur ändert — drei Stellen, wie damals bei Mathe:**

1. Ein **vierter Eingabeweg**. Heute gibt es ziehen, sprechen, tippen. Ein
   Strichzug ist keiner davon: er hat eine Richtung, eine Reihenfolge und
   eine Zahl von Zügen, und er wird nicht beantwortet, sondern *gemacht*.
2. Eine **dritte Welt** neben Erdkunde und Rechnen, sichtbar nur für Fiona
   (W-D). Das ist kein Zusatz, sondern ein Umbau der Weltenwahl: sie trägt
   heute zwei Karten und ist auf 844 × 390 gemessen eng. `passt` muss sie in
   **beiden** Fassungen sehen — mit drei Karten für Fiona, mit zwei für die
   anderen.
3. Ein **Vorrat aus Vorlagen** statt aus Gebieten oder erzeugten Aufgaben:
   26 Buchstaben, jeder mit seinen Zügen. Das ist von Natur aus begrenzt
   (§ 5.2 ist damit erfüllt) — aber die Züge muss jemand hinschreiben.

**Der Nachfahr-Teil ist der billige.** Ob ein Finger auf einer Vorlage
bleibt, ist eine Abstandsmessung: Punkt für Punkt gegen den Pfad, dazu die
Reihenfolge. Das ist Rechnen, kein Erkennen — und es braucht nichts, was
nicht schon da ist (SVG-Pfade, `getPointAtLength`, Zeigerereignisse).

**Der Erkennungs-Teil ist der teure.** Entschieden ist der gestufte Weg
(W-A): erst die Striche, dann ein kleiner Klassifikator als Auffangnetz.
Hier steht nur die erste Stufe — sie trägt das Spiel allein, und ohne sie
gäbe es keinen Maßstab, an dem man messen könnte, ob das Netz überhaupt
etwas fängt. Die Strenge kommt aus W-B: nachfahren locker, frei schreiben
mittel, nach drei Fehlversuchen wird vorgemacht.

**Erledigt.** Die dritte Welt steht (nur Fiona sieht sie), 26 Buchstaben in
einer kleinen Pfadsprache, Nachfahren Zug für Zug und freies Schreiben mit
Erkennung. Die Schwellen sind **gemessen**, nicht gegriffen: der Raum wurde
durchprobiert (siehe die Tabelle in `src/inhalt/schreiben.js`), und der
erste Entwurf hätte jedes vierzehnte Gekritzel zum Buchstaben erklärt, ohne
dafür einen Buchstaben mehr zu erkennen.

Drei Fehler fand nur der **Blick**, keiner ein Tor: `hidden` wurde von
`.zahlen{display:flex}` überstimmt (Lea sah beim Rechnen die Auswahl UND
das Tippfeld), `aspect-ratio` auf einem SVG tut nichts (das Schreibfeld war
820 × 180 statt quadratisch), und `hidden` gibt es auf einem SVG-Element
gar nicht (der grüne Anfangspunkt blieb stehen). Zwei weitere fand das neue
Tor selbst: O und Q waren überhaupt nicht nachzufahren, und ein halb
gezogener kurzer Strich galt als fertig.

**Abnahme, gefahren.** Ein Tor `schreiben` spielt gezeichnete Züge ein —
also echte Punktfolgen, keine Bilder — und prüft: ein sauber nachgefahrenes
A wird angenommen; ein A, das die Vorlage um mehr als die erlaubte Breite
verlässt, nicht; ein frei geschriebenes A wird als A erkannt; ein O wird
**nicht** als A erkannt (das ist die Hälfte, die zählt — Regel 1). Und
`passt` nimmt den Schreibbildschirm auf allen 7 Größen mit: eine
Schreibfläche, die auf 844 × 390 zu klein ist, ist keine.

Gemessen ist das jetzt: 26 von 26 Vorlagen erkennen sich selbst, **96,9 %**
der krumm geschriebenen werden richtig gelesen, **0,7 %** werden für einen
anderen Buchstaben gehalten, **0 von 400** Gekritzeln gelten als Buchstabe.
Die Schreibfläche ist auf dem Zielgerät **262 × 262** Punkte — quadratisch,
weil das Werkzeug im kurzen Querformat daneben statt darunter steht (180
gegen 270 Punkte Höhe, gemessen). Vier stehende Gegenproben.

---

### N2b · Der Klassifikator als Auffangnetz

**Ziel.** Was der Strichvergleich ablehnt, bekommt eine zweite Meinung: ein
kleiner mitgebackener Klassifikator über das gezeichnete Bild — ohne
Reihenfolge, ohne Richtung, nur die Form.

**Warum überhaupt.** Der Strichvergleich verlangt, dass Fiona ungefähr in
der gedachten Reihenfolge schreibt. Sechsjährige tun das nicht zuverlässig:
ein A von unten links nach oben und wieder herunter ist ein A, auch wenn es
in drei Zügen und in der falschen Ordnung entsteht. Das Netz fängt genau
diese Fälle.

**Warum erst danach.** Ein Auffangnetz kann man nur prüfen, wenn man weiß,
was durchfällt. Vor N2a gibt es diese Menge nicht — und eine Prüfung, die
nie etwas meldet, ist kein Beweis (Regel 1).

**Abnahme.** Gemessen wird an dem, was N2a abgelehnt hat: wie viele davon
sind in Wahrheit richtig, und wie viele falsche kommen durch? Beide Zahlen
müssen dastehen, sonst ist es kein Netz, sondern ein Nachgeben. Und die
Gegenprobe schaltet das Netz ab — die erste Zahl muss dann messbar fallen.

---

### N3 · Der Buchstabe wird vorgelesen, Fiona schreibt ihn  ·  ERLEDIGT

**Ziel.** Kein Vorbild mehr auf dem Bildschirm. Das Spiel sagt „Q", Fiona
schreibt ein Q, das Spiel prüft, ob es eines ist.

Das ist die Stufe, an der aus Nachfahren **Können** wird — und sie ist
klein, *wenn* N2a die Erkennung mitbringt. Neu ist nur die Aufgabe selbst:
ansagen statt zeigen, und ein Weg zurück zum Vorbild, wenn es dreimal
nicht klappt (dieselbe Regel wie „Lösung nach drei Fehlern").

**Vorsicht bei den Namen.** „Q" heißt gesprochen /kuː/, aber Fiona hört im
Zweifel „Kuh". Die Ansage braucht vermutlich beides: den Buchstabennamen
und ein Wort dazu („Q wie Quelle"). Das ist eine Entscheidung über den
Inhalt, keine Zeile Code — sie gehört in die Runde, nicht davor.

**Erledigt.** Als **eigene Ebene** („Buchstaben hören") neben dem
Nachfahren, nicht als Schalter daran — aus einem Grund, der sich erst beim
Bauen zeigte: einen Buchstaben nachfahren zu können heißt nicht, ihn aus
dem Gehör schreiben zu können. Wären es dieselben Gegenstände, würde das
eine Können für das andere gutgeschrieben, und der Leitner hätte einen
Stand, den es nicht gibt. Die Kennungen sind deshalb `bu:A` und `di:A`,
und der Rauchtest weist nach, dass die beiden Stände sich nicht berühren.

Die Namensfrage aus dem Entwurf („Q heißt gesprochen /kuː/, aber Fiona
hört im Zweifel ‚Kuh'") ist entschieden: die Ansage sagt **beides** —
*„Schreib ein Q. Q wie Quelle."* Dasselbe Merkwort, das schon im Vorlauf
steht. Und „Noch mal hören" spricht **immer**, auch wenn ein Profil sonst
nichts vorgelesen bekäme: wer ausdrücklich darauf tippt, hat gebeten.

Die Kachel zeigt einen **Lautsprecher** statt eines zweiten Buchstabens —
Fiona liest die Überschrift nicht, und der Unterschied zur Nachbarkachel
ist genau, dass man den Buchstaben hört.

**Und ein Befund, der nicht aus der Anforderung kam:** mit abgeschaltetem
Ton hat diese Ebene **gar keine Aufgabe**. Die App schaltet ihn nicht
eigenmächtig an — das wäre eine Entscheidung des Kindes, die man ihm nicht
wegnimmt —, sondern sagt, woran es liegt, und derselbe Knopf heißt dann
„Ton einschalten". Drei stehende Gegenproben statt zwei.

**Abnahme, gefahren.** Der Rauchtest liest den gesuchten Buchstaben aus der
**Ansage**, nicht vom Bildschirm — wer ihn vom Bildschirm liest, kann
danach nicht mehr behaupten, dass er dort nicht steht. Und dann weist er
nach: keine Vorlage auf dem Blatt, der Buchstabe in keinem Text und in
keiner Beschriftung, ein sauber geschriebener wird angenommen, und nach
drei Fehlversuchen wird er vorgemacht. **Drei** stehende Gegenproben: eine
lässt die Vorlage stehen, eine schreibt den Buchstaben in die Frage, eine
nimmt den Hinweis auf den fehlenden Ton weg.

---

### N4 · Zahlen 1 bis 20  ·  ERLEDIGT

**Ziel.** Dasselbe wie N2a und N3, mit den Ziffern. 1 bis 20 heißt: die
zehn Ziffern schreiben können, und die Zahl als Ganzes lesen und schreiben.

**Das ist absichtlich nicht dasselbe wie „20 Vorlagen".** Zwanzig ist
zweimal etwas: die Zahl *zwanzig* (die man hört und meint) und die zwei
Zeichen 2 und 0 (die man schreibt). Der Vorrat sind **zehn** Ziffern-
Vorlagen; die Zahlen 1 bis 20 sind Aufgaben darauf. Das hält den Vorrat
begrenzt (§ 5.2) und macht die zweistelligen Zahlen zur Aufgabe, die sie
sind.

**Und hier hängt es mit Mathe zusammen:** Fiona rechnet bereits bis 10 und
tippt die Antwort aus vier Möglichkeiten. Wenn sie Ziffern schreiben kann,
könnte sie das Ergebnis irgendwann *schreiben* statt es auszuwählen. Das
ist keine Anforderung, sondern eine Tür, die N4 aufmacht.

**Erledigt.** Zwei Ebenen wie bei den Buchstaben: *Zahlen nachfahren* (die
zehn Ziffern) und *Zahlen hören* (die zwanzig Zahlen, angesagt).

Aus „beide Ziffern, richtige Reihenfolge" ist ein **Aufbau** geworden statt
einer Prüfung: der Bildschirm stellt so viele Schreibfelder hin, wie die
Zahl Ziffern hat. Die 14 wird links als 1 und rechts als 4 geschrieben, und
jedes Feld wird für sich erkannt. Vertauscht gilt nicht — der Rauchtest
weist das an einer echten Zahl nach (51 statt 15 abgelehnt).

Erkannt wird gegen **die Ziffern**, nicht gegen alle 36 Zeichen. Das ist
kein Beiwerk: eine 0 und ein O sind dieselbe Form, eine 1 und ein I auch.
Gemessen kostet der gemeinsame Vergleich fast einen Prozentpunkt richtig
erkannter Ziffern und macht aus jeder sauberen 0 ein „bin mir nicht sicher".

**Abnahme, gefahren.** Die Ansage sagt „vierzehn" und nicht „eins vier";
`gesprochen()` aus dem Rechenmodul liefert das Zahlwort — dieselbe Auskunft
ein zweites Mal hinzuschreiben hieße, dass eines von beiden veraltet.
`passt` prüft den Zwei-Felder-Bildschirm auf allen 7 Größen und blättert
dafür weiter, bis wirklich eine zweistellige Zahl kommt. Zwei stehende
Gegenproben: eine lässt die Reihenfolge fallen, eine hält die Ziffern gegen
die Buchstaben.

---

### S1 · Drei Sterne bedeuten zwei verschiedene Dinge  ·  ERLEDIGT

**Der Befund.** Am Ende einer Sitzung zeigt der Endbildschirm Sterne für
die **Sitzung** (`sterneFuer(st.glatt, st.liste.length)`). Auf der
Ebenenwahl zeigt dieselbe Sternform den **Lebensfortschritt** derselben
Ebene (`sterneFuer(b.gesammelt, b.gesamt)`).

Ein Kind spielt also fehlerfrei, sieht **drei** Sterne, tippt auf
„Weiter" — und sieht auf der Kachel **einen**. Dieselbe Form, dieselbe
Farbe, zwei Bedeutungen. Für ein sechsjähriges Kind ist das nicht
„differenziert", das ist ein Wortbruch.

**Der Nutzen ist hoch und der Aufwand klein**, deshalb steht es auf Platz 5
und nicht bei den Kleinigkeiten. Zu entscheiden ist nur, welche der beiden
Bedeutungen die Sterne behalten und was die andere bekommt.

**Erledigt — und S2 gleich mit.** Die Sterne gehören der **Sitzung**. Auf
der Kachel stehen nur noch die Aufkleberzahl (mit anteilig gefülltem
Zeichen) und der zweiteilige Balken; die Sterne sind dort weg.

Das löst beide Befunde mit einer Entscheidung: dieselbe Form meint nicht
mehr zweierlei, und auf der Kachel steht nicht mehr ein Anteil neben einer
Anzahl. Auf der Aufnahme davor stand „Bundesländer: 1 Stern, 9 Aufkleber"
neben „Asien: 2 Sterne, 2 Aufkleber" — wer die Kacheln vergleicht, und
Kinder vergleichen sie, las das Gegenteil dessen, was dastand.

**Abnahme, gefahren.** `inhalt` prüft an der ZAHL, die hineingeht, nicht an
der Stelle, an der gezeichnet wird: jeder Aufruf von `sterneFuer` bekommt
`st.glatt`. Wer die Sterne künftig woanders hinsetzen will, darf das —
solange sie dieselbe Zahl meinen. Der Rauchtest prüft, dass auf der Kachel
keine mehr stehen. Zwei stehende Gegenproben; eine setzt die Sterne genau
so zurück, wie sie waren.

---

### S2 · Auf der Kachel steht Anteil neben Anzahl

Sterne und Balken zeigen einen **Anteil**, die Aufklebernummer eine
**Anzahl**. Nebeneinander heißt das: neun Aufkleber und ein Stern (Länder
Asien, 9 von 60) stehen neben zwei Aufklebern und zwei Sternen
(Kontinente, 2 von 6). Wer die Kacheln vergleicht — und Kinder vergleichen
sie —, liest daraus das Gegenteil dessen, was dasteht.

Gehört zu S1, ist aber die kleinere Hälfte: hier ist niemand *falsch*
informiert, nur schlecht.

---

### Q1 · Zwei Gegenproben beweisen nichts mehr

**Stand 01.09.2026, nach dem ersten vollen Lauf seit P6.** Er hat nicht
vier, sondern **zweiundzwanzig** kaputte Proben gefunden. Zwanzig davon
sind repariert; die Ursachen standen in `docs/Lernkiste-STAND.md` unter
Q1/Q2. Offen bleiben zwei:

- **die Buchstabenkarten rutschen wieder zusammen** — `passt` bleibt
  **grün**, obwohl `--kleber-eng-min` von 56 auf 72 px steht. Das ist ein
  echtes Loch im Tor, keine veraltete Erwartung: `passt` sieht die
  Aufkleberkarten im Vorlauf an dieser Stelle nicht.
- **eine Spalte fehlt in der Profiltabelle** — `smoke` wird rot, aber mit
  einer anderen Meldung. Noch nicht untersucht, welcher Abschnitt
  stattdessen anschlägt.

*Abnahme:* beide schlagen an, und zwar mit **ihrer** Meldung.

---

### Q2 · Der Nachweis der Gegenproben ist überholt  ·  **GEFAHREN 01.09.2026**

151 von 213 Proben hatten einen überholten Nachweis. Der Lauf hat 26
Minuten gekostet und **zweiundzwanzig** kaputte Proben gefunden — nicht
die vier, die im Bericht standen. Die größte Einzelursache war ein Fehler
im Probenwerkzeug selbst: der gesunde Vergleichslauf baute nicht, und
`dist/` steht nicht in Git. Acht Proben fielen daran aus, und zwar
**abhängig von der Reihenfolge**.

Was bleibt: der Lauf gehört zwischen zwei Runden, nicht in eine. Und er
gehört **regelmäßig** gefahren — vier Runden Pause haben gereicht, damit
sich zweiundzwanzig Löcher ansammeln, von denen der Bericht vier kannte.

*Abnahme:* `--geaendert` meldet null ohne Nachweis und null überholte.

---

### Aus dem ANTON-Katalog, offen

**A3 · Der Fehler wird auch beim Ziehen benannt**  ·  **ERLEDIGT**
Statt „Nicht ganz — probier es noch einmal." steht dort jetzt *„Das ist
Schleswig-Holstein. Thüringen liegt weiter unten."* — das Gebiet unter dem
Finger und die Richtung zum gesuchten.

Gerechnet wird in **Bildschirmpunkten**, nicht in Kartenkoordinaten: der
Satz beschreibt, was das Kind sieht. Und wer weniger als 40 Punkte
danebenliegt, bekommt **keine** Richtung — „weiter oben" wäre dort falscher
als nichts, es schickte ihn weg von der Stelle, an der er fast richtig lag.

*Abnahme, gefahren:* `spielprobe` prüft das Richtungswort an allen acht
Himmelsrichtungen und an der Nähe — ohne Browser, denn die Richtung ist
eine Rechnung. Der Rauchtest zieht zweimal daneben, einmal je Achse, und
prüft **das Vorzeichen** jeder genannten Richtung; die Schwelle selbst
gehört der App, sonst prüfte die Rechnung sich gegen sich selbst. Zwei
stehende Gegenproben, eine davon vertauscht oben und unten.

**B3 · Mehr Aufgabenformen** *(Rang 2)* — ohne neue Daten möglich:
umgekehrt („Wo liegt Bayern?"), Nachbarn, größer/kleiner, Puzzle,
Steckbrief. **Teilbar: jede Form einzeln.** Die umgekehrte Frage ist die
billigste und die mit dem größten Zugewinn, weil sie dieselbe Karte in die
andere Richtung liest.

**B2 · Test am Ende, ohne Hilfen** *(Rang 4)* — keine Auswahl, keine Lösung
nach drei Fehlern, kein Zeiger. Wer besteht, bekommt den **Pokal** der
Ebene. Der einzige Ort, an dem ein Pokal etwas bedeutet.

**A4 · „Heute schon geübt"** *(Rang 5)* — eine ruhige Zeile auf dem
Startbildschirm, kein Streak-Zwang. *Abnahme: die Zeile stimmt nach einem
Neustart.*

**D3 · Etwas erzählen können** *(Rang 6)* — nach einer Runde ein Satz zum
Mitnehmen. *„In Ägypten fließt der längste Fluss der Welt."* Klein je Satz,
groß in der Summe: 63 Gebiete wollen ihren Satz.

**D2 · Abzeichen, die etwas über das Kind sagen** *(Rang 7)* — nicht „50
Aufgaben", sondern *„Du kennst alle Nachbarn von Deutschland"*.

**D1 · Ein Begleiter** *(Rang 8)* — die Figur, die durch die App führt.
Sie wird nicht gekauft, sie ist da. **Braucht Bilder, und die entstehen
nicht im Code** — dieser Punkt liegt bei euch, nicht bei mir.

---

### Prozess und Prüfbarkeit — Nutzen gering, aber nicht null

### D2 · Abzeichen, die etwas über das Kind sagen  ·  ERLEDIGT

**Referenzabgleich** (Schritt 0, ausführlich in `src/inhalt/abzeichen.js`):

| Vorbild | was es TUT | was übernommen wurde |
|---|---|---|
| **Duolingo**, Achievements | hängt eine nächste Sprosse an eine Leiter ohne Ende und zeigt einen Balken dorthin. „50 Wörter" ist eine Zahl, kein Satz. | der **sichtbare nächste Schritt** — ein Abzeichen, das erst beim Erreichen erscheint, ist bis dahin unsichtbar. |
| **Khan Academy**, Mastery | das Abzeichen **ist** der Name der Fähigkeit. | der **Text ist die Belohnung**, nicht das Bild. |
| **Panini-Sammelalbum** | teilt das Album in benannte **Gruppen**; „vollständig" gilt je Gruppe. | die Menge braucht einen **Namen, den ein Kind kennt**, und muss klein genug sein, um sie zu Ende zu bringen. |

**Abstand vor der Runde: null von vier.** Es gab Sterne (je Sitzung),
Aufkleber (je Gegenstand) und den Pokal (je bestandenem Test) — drei
Zählwerke über einen Gegenstand oder eine Sitzung. Keines nennt eine
Menge, keines ergibt einen Satz.

**Was gebaut wurde:** elf Abzeichen über vier Ebenen, dazu „Einmal ganz
ohne Fehler". Die Menge kommt **immer** aus einer Regel über die Daten —
`stadtstaat` steht am Bundesland, die fünf Reihen entstehen aus **einem**
Eintrag über `rechenart` und `a`, die Buchstaben des eigenen Namens aus
dem Profilnamen. Kein einziges Verzeichnis von Kennungen.

| Entscheidung | warum |
|---|---|
| **dieselbe Schwelle wie der Aufkleber** | wer alle drei Stadtstaaten als Aufkleber hat und trotzdem kein Abzeichen bekäme, hätte recht mit „ich hab die doch alle". Ein Abzeichen ist eine Aussage über die MENGE, keine höhere Hürde je Stück. |
| **genau ein offenes** | der Bildschirm hat diese Lehre schon einmal teuer bezahlt (sechzig leere Kästen). Eines ist der nächste Schritt, zehn sind eine Mahnung. |
| **die Menge aus dem VOLLEN Vorrat** | Fiona bekommt die Kontinente rundenweise. Mit drei von vier stünde neben „Du kennst alle Kontinente" sonst „Dir fehlt noch eins" — obwohl es sechs sind. Die Zahl muss die ganze Menge meinen. |
| **Ansage am Endbildschirm** | Fiona liest nicht. Ein Abzeichen, das nur dasteht, bekommt sie nicht mit. |

**Absichtlich NICHT gebaut: „Zehn Tage hintereinander".** Der
ANTON-Abgleich nennt es als Beispiel, und es wäre leicht — das Protokoll
trägt die Tage. **A4** ist aber mit dem ausdrücklichen Zusatz *„kein
Streak-Zwang"* aufgeschrieben, und ein Abzeichen für zehn Tage am Stück
ist der stärkste Streak-Zwang, den es gibt: es bestraft einen
Krankheitstag. Das Prinzip des Abgleichs wird von den Mengen besser
bedient als von einem Kalender.

**Zwei Fehler, beide auf der Aufnahme gefunden** (Regel 8):

1. Ein Abzeichen stand **ohne Bild** da — die Tafel nannte `deutschland`,
   die Bildtafel kennt `karte`. Daraus wurde das achte Tor,
   **`abzeichen`**: leere Menge, ganze Menge, fehlendes Bild, und die neun
   Nachbarn gegen die Daten. Vier Gegenproben, alle anschlagend.
2. **Das Abzeichen aus dem Abgleich kann niemand bekommen.** „Du kennst
   alle Nachbarn von Deutschland" war der erste Eintrag der Tafel. Die App
   liefert aber **zwölf** europäische Länder, nicht 51: ins Spiel kommt
   nur, was in `erdkunde.js` einen Rang hat, die gebackenen Umrisse sind
   Geometrie und kein Vorrat. Von den neun Nachbarn sind vier dabei —
   **Dänemark, Luxemburg, die Schweiz, Österreich und Tschechien kommen im
   Spiel gar nicht vor.** Das Abzeichen ist raus; lieber keins als eines,
   das ewig offen steht. Ob die fünf ins Spiel sollen, ist eine
   Entscheidung über den Inhalt und steht als **D2c**.

   Gefunden hat das die **Gegenprobe**, nicht das Tor: das Tor maß gegen
   die gebackene Geometrie statt gegen den gelieferten Vorrat (Regel 5).
   Jetzt misst es richtig. Und meine Begründung dafür, die Menge aus dem
   vollen Vorrat zu nehmen, war zweimal hintereinander falsch — erst
   „sonst lässt sich ein Abzeichen verlieren" (kann man nicht,
   `istGesammelt` liest den Höchststand), dann „sonst stimmt der Satz bei
   den Nachbarn nicht" (das Abzeichen gibt es nicht mehr). Der Grund, der
   übrig blieb und belegt ist: die **Zahl** daneben muss die ganze Menge
   zählen.

**Und ein dritter, im Werkzeug:** `loese()` im Rauchtest zog das Etikett
auf den **Anker** des Ziels. Bei Berlin (19 pt Radius, ringsum
Brandenburg) landet man damit auf dem Nachbarn — Regel 12, ein Raster ist
nur so fein wie sein kleinstes Ziel. Die Punktsuche steht jetzt einmal als
`zielPunkt` in `chromium.mjs` und wird von `loese` und `durchgang`
benutzt: Trefferkreis, Anker, Raster, Kastenmitte, in dieser Reihenfolge.

**Abnahme:** Rauchtestabschnitt `abzeichen` und Tor `abzeichen`. Acht
Gegenproben, alle anschlagend (174 insgesamt).

---

### D2c · Deutschlands Nachbarn fehlten im Spiel  ·  ERLEDIGT

**Entschieden: ja, sie kommen rein.** Dänemark, Luxemburg, die Schweiz,
Österreich und Tschechien sind seit dieser Runde im Spiel — Europa hat
statt zwölf jetzt **siebzehn** Länder, die App insgesamt 103 Gebiete statt
98.

**Die Reihenfolge ist die eigentliche Entscheidung.** `rang` ist keine
Rangliste, sondern eine Lerntiefe: ein Profil spielt `rang <=
laenderTiefe`. Bisher war die Reihenfolge die Einwohnerzahl — für ein Kind
in Deutschland die falsche: die Ukraine ist größer als Österreich, aber
Österreich ist nebenan. Auf **4 bis 12 stehen jetzt genau die neun
Nachbarn**, nach Einwohnerzahl geordnet; davor bleiben Russland,
Deutschland und das Vereinigte Königreich, damit Fiona mit ihrer Tiefe 3
dieselben drei behält wie gestern; dahinter der Rest.

**Niemand verliert etwas.** Lea steht jetzt auf Tiefe 13 statt 5. Damit hat
sie alles, was sie hatte (Italien ist die 13), **plus die neun Nachbarn**.
Auf der Ebene „Hauptstädte" bekommt sie drei dazu — Warschau, Amsterdam,
Brüssel: acht statt fünf. Nachgezählt, nicht geschätzt; der erste Anlauf
schrieb in den Quelltext „ändert sich für sie nichts", und das war falsch.
Die Eltern gehen von 12 auf 17.

~~**Die Hauptstädte der fünf Neuen fehlen noch.**~~ **Nachgetragen in P11**
— und der Grund war ein anderer als hier vermutet: nicht die fehlenden
Rohdaten, sondern eine zweite Liste dessen, was gespielt wird. Siehe P11.

**Dreimal dieselbe Zeile, dreimal derselbe Fehler.** `prototyp/bauen.mjs`,
`tor/inhalt.mjs` und `tor/spielprobe.mjs` fragten alle nach dem **gebackenen**
Rang (`filter(x => x.rang)`) statt nach dem aus `erdkunde.js`. Der
gebackene stammt vom Tag des Backens: die fünf standen dort mit
`rang: null`. Folge — der Bau lieferte stur 60 Länder statt 65, und
`spielprobe` meldete für alle fünf „hat keine Fläche auf der Karte", obwohl
die Fläche seit jeher da ist. Dieselbe Lehre wie bei den Nachbarn selbst:
**die Geometrie ist der Vorrat, `erdkunde.js` ist die Ware.** Das Tor
vergleicht die beiden Listen jetzt ausdrücklich.

**Und eine Erwartung, die umfiel.** `inhalt` und `spielprobe` verlangten
beide, dass **jeder** Kontinent genau so viele Länder hat wie das tiefste
Profil spielt (`1..TIEFSTE`). Europa hat jetzt 17, die anderen vier haben
12 — kein Fehler, sondern eine Entscheidung. Geprüft wird deshalb, was
wirklich schiefgeht: die **Lücke** (lückenlos 1..n je Kontinent) und dazu,
dass die tiefste Tiefe irgendwo eingelöst wird. Regel 2, in ihrer zweiten
Form: eine absolute Erwartung an eine anteilige Sache.

**Ist Luxemburg zu treffen?** Das war die Frage, wegen der F17 vor dieser
Runde stand. Gemessen im Browser, iPhone quer 844 × 390, Länderebene
Europa — die entkoppelten Trefferkreise:

| | Kreis |
|---|---|
| Luxemburg, Belgien, Niederlande, Österreich, Tschechien | **20 pt** |
| Schweiz | 24,9 pt |
| Polen | 30,9 pt |
| Dänemark | 33,9 pt |
| *zum Vergleich: Berlin, Bremen, Hamburg, Saarland* | *12,3–13,4 pt* |

20 pt liegt unter der Fingergrenze von 44 — aber es ist der **Boden**
(`MIN_REST`), den die App bewusst setzt, damit ein Kreis nicht den Anker
des Nachbarn verschluckt (siehe F16). Die vier kleinsten Bundesländer
liegen seit Monaten bei 12 bis 13 pt und werden gespielt. Die fünf Neuen
bringen also **keine neue Fehlerklasse**, sie stellen sich in eine
bestehende Reihe. Wer 44 pt für Luxemburg will, braucht eine größere
Karte — das ist eine eigene Sache und steht als **P7**.

Wichtig auch: **gezogen wird hier gar nicht.** Lea und die Eltern
*schreiben* den Ländernamen; die Karte zeigt nur, welches Land gefragt ist.
Der Trefferkreis zählt nur bei der umgekehrten Frage („Wo liegt
Luxemburg?"), und die kommt bei jeder dritten Aufgabe.

---


Von den neun Nachbarn Deutschlands sind **vier** in der App: Frankreich,
Belgien, Polen, die Niederlande. Es fehlen **Dänemark, Luxemburg, die
Schweiz, Österreich, Tschechien** — Europa hat im Spiel zwölf Länder, und
die fünf sind nicht darunter.

Das ist eine Entscheidung über den **Inhalt**, nicht über den Code: sollen
die fünf dazu? Dafür spricht, dass Kinder die Nachbarländer im Sachkunde-
unterricht lernen und dass Österreich und die Schweiz für zwei
deutschsprachige Kinder näher liegen als Rumänien. Dagegen spricht, dass
die Reihenfolge nach Bekanntheit gebaut ist und fünf kleine Länder auf den
vorderen Rängen sie verschieben. **Zwölf würden sechzehn.**

Solange das offen ist, gibt es kein Abzeichen „alle Nachbarn von
Deutschland" — obwohl der ANTON-Abgleich genau diesen Satz als Beispiel
nennt.

---

### D2b · Mehr Abzeichen, wenn diese getragen haben  ·  ERLEDIGT

**Vier neue, elf zusammen.** Der Maßstab ist der aus D2: die Menge kommt
aus den **Daten**, nicht aus einer Liste von Kennungen, und der Satz muss
ohne Fußnote wahr sein.

| Ebene | Abzeichen | Stücke |
|---|---|---|
| Länder in Europa | **„Du kennst alle Nachbarn von Deutschland."** | 9 |
| Hauptstädte (Deutschland) | „Du kennst alle Landeshauptstädte." | 13 |
| Plus und Minus | „Du kannst alle Minusaufgaben." | 55 |
| Buchstaben | „Du kennst alle Vokale." | 5 |

Der erste ist **der Satz aus dem ANTON-Abgleich**. Er war der erste Eintrag
der Tafel, flog in D2 wieder heraus (fünf der neun Nachbarn gab es im Spiel
nicht) und ist seit D2c erreichbar. `nachbarDE` steht an den Ländern
selbst — wer ein zehntes Nachbarland einträgt, setzt die Fahne, und das
Abzeichen zählt von allein weiter.

**Was daran nicht gebaut wurde und warum:** „Du kennst alle Länder in
Asien" wäre zwölf von achtundvierzig — eine Behauptung, die das Kind
später als Lüge erlebt. Ein Abzeichen ist ein Satz, und ein Satz muss
stimmen.

**Die Erreichbarkeitsregel ist zurück.** „Was das Kind nie zu sehen
bekommt, wird ihm nicht angeboten" stand in D2 schon einmal in
`abzeichen.js`, fiel mangels Fall wieder heraus — und hat seit D2c genau
einen: Fiona spielt Europa bis Rang 3, die Nachbarn stehen auf 4 bis 12.
Ohne die Regel stünde bei ihr ein Ziel, das sie nie erreicht.

Wichtig: das ist **nicht** dasselbe wie „steht heute nicht im Vorrat".
Fionas Kontinentrunde *wächst* — ihre sechs Kontinente sind alle
erreichbar, auch wenn heute nur vier drankommen. Die Ländertiefe wächst
nicht. `erreichbar(ebeneId)` sagt deshalb, was ein Profil **je** zu sehen
bekommt, und steht neben dem Vorrat, nicht an seiner Stelle.

**Zwei Fehler, beide vom Tor gefunden.** Der `abzeichen`-Prüfstand aus D2
meldete sofort: „nachbarn-de wählt nichts aus 17 Stücken" (sein eigener
Vorrat trug die Fahne `nachbarDE` nicht mit) und „alle-landeshauptstaedte
hängt an der Ebene *hauptstaedte*, die es nicht gibt" (sie fehlte in seiner
Vorratstabelle). Beide Male hatte das Tor recht, und beide Male lag der
Fehler an **seiner** Messstelle, nicht an der Tafel — Regel 5.

**Und einer, den nur der Blick fand:** `minus` und `vokal` waren beide eine
Kachel mit einem Zeichen darin und bei 28 Punkten — der Größe im kurzen
Querformat — kaum auseinanderzuhalten. Das O steht jetzt frei; neben `abc`,
dem A, liest es sich als Buchstabe.

Nebenbei berichtigt: `vorrat('hauptstaedte:europa')` hat den Schalter
`voll` stillschweigend übergangen und immer nach `laenderTiefe` gefiltert.
Für Abzeichen wäre die Menge damit von der Tiefe des Profils abhängig
gewesen — genau das, was D2 verhindern wollte.

---


Zwölf sind ein Anfang, kein Vorrat. Naheliegend und schon als Regel
schreibbar: *„Du kennst alle Bundesländer im Osten"* (aus `ort`), *„Du
kennst alle Länder, die an Deutschland grenzen"* für die Eltern in voller
Tiefe, *„Du kannst alle Aufgaben mit Zehnerübergang"*, *„Du kannst deinen
Nachnamen schreiben"*. **Erst nach einmal Spielen** — welche Sätze etwas
bedeuten, entscheidet sich am Kind und nicht am Datenmodell.

---

### G12 · Profilfarben und der Streu auf der Kachel  ·  ERLEDIGT

**Gewünscht, nicht abgeleitet.** Fiona türkis, Lea hellgrün, Stephan blau;
Fiona Sterne, Herzen, Schildkröten in mehreren Farben, Meerestiere und
große Muscheln; Lea Totenköpfe als Erinnerung an Mexiko, weiß, mit Augen,
die in Blau und dunklem Grün schillern. Violeta war nicht gemeint und
behält ihr Violett.

**Was daran eine Entscheidung war:**

| | |
|---|---|
| **die Farben** | aus der **vorhandenen** Palette getauscht, nicht neu gemischt. Die sieben Flächen sind auf gleiche Helligkeit geeicht, damit derselbe Textton auf allen trägt; eine achte Farbe daneben wäre die eine, auf der der Name nicht mehr lesbar ist. f7→f4, f5→f3, f3→f5. |
| **wer einen Streu bekommt** | nur die Kinder. Die Eltern lesen ihren Namen; Fiona nicht — für sie war die Kachel bisher nur ein Farbfleck. Türkis und Hellgrün liegen 45 Grad auseinander, das Muster trägt den Unterschied, den die Farbe allein nicht mehr trägt. |
| **keine Tintenkontur** | Stern und Pokal haben eine, weil sie etwas bedeuten. Der Streu bedeutet nichts. Ausnahme ist der Totenkopf: weiß auf Hellgrün braucht einen Umriss — und der ist grün, nicht Tinte. |
| **feste Plätze** | ein gewürfelter Streu sähe bei jedem Laden anders aus, und `ansicht` vergleicht Bildpunkte. Die Tafel im Quelltext **ist** das Bild. |
| **Prozent statt Punkte** | die Kachel ist quer 190 × 125 Punkte groß und auf dem Schreibtisch 240 × 250. Mit festen Punkten wäre der Streu in einem der beiden Fälle ein Haufen in einer Ecke. |

**Drei Motive waren nicht zu erkennen** und sind neu gezeichnet — gesehen
auf der Aufnahme, nicht gemessen (Regel 8): die Schildkröte war ein Karo
(Flossen unter dem Panzer, Gitter darauf), die Muschel ein Heißluftballon
(falsch herum), das Seepferdchen die Ziffer Drei. Das Seepferdchen ist
jetzt ein Wal — ein Tier, das seine ganze Auskunft im Umriss trägt.

**Abnahme:** Rauchtestabschnitt `streu` — vier verschiedene Farbtöne in
ihren Bändern und paarweise 20 Grad auseinander, neun Motivarten in acht
Farben, Schildkröten in vier, zehn Totenköpfe mit dreistufigem Augenverlauf,
**null** bei den Eltern, kein Motiv auf einem Namen. Neun Gegenproben, alle
anschlagend.

**Ein Tor ist dabei nachgegeben worden**, und das gehört benannt:
`lesbarkeit` rechnete eine Streuschicht wie ein Wasserzeichen — als volle
Fläche in ihrer geerbten Tintenfarbe, die nirgends gemalt wird — und
meldete sechs lesbare Texte rot (1,16:1 für eine Zeile, die auf jeder
Aufnahme steht). Es zählt jetzt die Motive statt der Schicht. Dass es
danach noch anschlägt, ist mit einer eigenen Gegenprobe belegt, und die
alte zum Wasserzeichen schlägt weiter an. Der eine Befund, der die
Modelländerung überlebt hat (4,46:1 statt 4,5), ist behoben — durch
dunkleren Text, nicht durch blasseren Streu.

**Was es kostet:** das Startbündel wächst um **5,8 KB gzip** (170,0 statt
164,2 KB für die Seite; 223,9 von 400 KB erlaubt).

---

### P16 · Das Auge an der Kachel  ·  ERLEDIGT

P14 hatte gemessen: **56 Trefferflächen unter 44 pt**, alle derselbe Knopf —
„anschauen" unter jeder Kachel der Ebenenwahl, **16 Punkte hoch**. Geholt
waren dort zehn Punkte Luft (16 → 26); die Rechnung sagte, dass 44 in einer
Zeile *unter* der Kachel nicht zu haben sind.

**Also nicht darunter, sondern darin.** „anschauen" ist jetzt ein **Auge in
der Kachel** — 44 × 44, dieselbe runde Knopfform wie Buch und Elternbereich.
Und es ist zugleich das bessere Zeichen: das Wort „anschauen" war für eine
Sechsjährige, die nicht liest, ohnehin stumm.

**Das Ergebnis ist mehr als der eine Knopf.** Die Zeile unter der Kachel
trug in den meisten Fällen *nur* diesen einen Knopf; „von vorne" gibt es
erst mit Fortschritt, „Test" erst mit einer vollen Ebene. Leer heißt jetzt
weg (`:empty`), und damit fallen je Reihe 26 Punkte. Auf dem iPad passen
statt drei Kacheln **vier** in eine Reihe.

```
passt --hinweise:  vorher 56 Trefferflächen unter 44 pt
                   nachher 0
```

Auf **allen sieben Größen × 21 Bildschirmen** ist jetzt jedes Ziel für den
Finger mindestens 44 Punkte groß — zum ersten Mal, seit das gemessen wird.

**Geprüft wird beides**: dass das Auge in den Vorlauf führt, und dass es die
Ebene **nicht startet**. Es liegt über der Kachel, und die Kachel ist selbst
ein Knopf; ein Tipp, der durchschlägt, würde die Sitzung anfangen statt die
Karten zu zeigen — und das fällt niemandem auf, weil beide Wege auf einen
plausiblen Bildschirm führen. Unterschieden wird an dem, was nur der Vorlauf
hat: das Gitter der Aufkleber und „Jetzt starten".

---

### P15 · Der Zeiger steht im Pulk  ·  ERLEDIGT

Gemessen auf der Nordamerikakarte, Guatemala als Ziel: der Zeiger („!")
steht auf **(285, 320)** — und innerhalb von zehn Punkten liegen dort vier
Länder. Er sagt richtig, *wo* Guatemala liegt; er sagt nicht, **wohin das
Etikett gehört.** Das ist seit P10 der Nadelkopf, 44 Punkte groß, vierzig
Punkte weiter unten.

**Der Zeiger bleibt, wo er ist.** Er zeigt auf das Land, und das ist der
Lerninhalt — ihn an die Nadel zu hängen hieße, die Geografie durch die
Bedienung zu ersetzen. Stattdessen wird der **Faden** des gesuchten Gebiets
zum Wegweiser: dieselbe Akzentfarbe wie der Zielrand, etwas dicker. Beides
zusammen ergibt den Weg — der Zeiger zeigt auf das Land, der Faden führt
von dort zur Fläche, auf die man ablegt.

**Nur wenn das Ziel ohnehin markiert ist.** Bei „Wo liegt Guatemala?" ist
die Karte die Antwort, und ein leuchtender Faden wäre sie auch. Dieselbe
Bedingung wie beim Zielrand — und beide Hälften sind geprüft: der Rauchtest
verlangt den Wegweiser bei jeder normalen Frage nach einem Gebiet an der
Nadel (drei kamen vor) und verbietet ihn bei jeder umgekehrten. Zwei
Gegenproben, eine je Richtung; ohne die zweite wäre der Faden nicht Zierat,
sondern Verrat.

---

### P4 · 101 Verweise in die Regelliste eines anderen Verzeichnisses  ·  ERLEDIGT

Gemessen: **197 Verweise der Form „Regel N"** in `tor/`, `tools/`, `src/`,
`prototyp/` und `docs/`. Die Eiserne Liste hatte **elf** Regeln. Allein die
Verweise auf 12, 13, 14 und 15 waren **101** — sie zeigten auf nichts.

Die Diagnose stand schon hier und stimmt: die gemeinten Regeln gibt es
alle, sie stehen nur unter anderen Nummern. Die Verweise folgen der
Nummerierung eines **anderen** Verzeichnisses; sie sind aus dem Gedächtnis
entstanden, und das Gedächtnis hatte die falsche Liste offen.

**Drei Regeln fehlten hier wirklich** — und jede hat in *diesem*
Verzeichnis eine Runde gekostet, sonst hätte ich sie nicht aufgenommen:

| neu | wofür sie hier steht |
|---|---|
| 12 · Ein Raster ist nur so fein wie sein kleinstes Ziel | der Rauchtest zog auf Berlins Anker und landete auf Brandenburg — gemeldet wurde eine Zeitüberschreitung statt „daneben" |
| 13 · Safari-Falle: kein Filter, wo ein gebackener Verlauf reicht | aus einem SVG-Filter über einer großen Fläche wird auf iOS ein schwarzes Bild |
| 14 · Das Modell darf nicht vom Gemessenen abhängen | ein Korpus, der das Urteil des Abgleichs übernimmt, misst 100 % — immer |

**Und der teurere Fall lag darunter: Nummern, die es gibt und die etwas
anderes meinen.** 29 Stück, jede einzeln nachgesehen:

- **„Regel 3" hieß achtmal „ist der Eingriff angekommen"** — das ist hier
  die 10. Ausgerechnet in `proben.mjs` stand über der Prüfung, ob ein
  Eingriff ankam, die Überschrift „Regel 3".
- **„Regel 4" hieß siebenmal „das Soll darf nicht aus dem Prüfling
  kommen"** (hier 3) und viermal „das Modell darf nicht vom Gemessenen
  abhängen" (jetzt 14).
- **„Regel 7" und „Regel 8" hießen achtmal „der Blick auf die Aufnahme"** —
  hier die 4.
- **„Regel 11" hieß fünfmal „Safari"** — hier jetzt die 13.
- **„Regel 1" hieß zweimal „erst einchecken, dann gegenproben"** — die
  Regel, die es hier nicht mehr gibt, weil ihr Grund weg ist (das ist die
  9).

**Das Tor `regeln` prüft zweierlei, und mit zwei verschiedenen Härten.**

Die **Nummer** ist ein Fehler: sie muss in der Liste stehen, und die Liste
wird aus `CLAUDE.md` gelesen, nicht abgeschrieben. Wer eine Regel
dazuschreibt, muss das Tor nicht anfassen.

Das **Stichwort** ist eine Ratsche: im Satz neben dem Verweis soll ein Wort
aus der Regel stehen. Als Fehler wäre das falsch — der Test ist unscharf,
und viele richtige Verweise sagen dieselbe Sache mit anderen Worten
(„bewies deshalb nichts" für Regel 1). Beim ersten Lauf hätte er
**65 richtige** Verweise gemeldet, und ein Tor, das so oft unrecht hat,
wird abgeschaltet. Als Ratsche taugt er: 46 sind bestätigt, mehr dürfen es
nicht werden. Dieselbe Bauart wie `budget`.

**Ein Fehler beim Bauen, vom Tor selbst gefunden:** die erste Fassung zog
die Stichworte nur aus der **Überschrift** einer Regel. Regel 1 hat zwei
Sätze, und zitiert wird fast immer der zweite („wer eine Wirkung misst,
schaltet sie zuerst ab") — damit fielen siebzehn richtige Verweise durch.
Jetzt zählt der ganze Absatz.

**Und ein Anlauf, den ich verworfen habe.** Der erste Versuch war ein
Skript, das jeden Verweis automatisch der Regel zuordnet, deren Stichworte
danebenstehen. Es hat 33 Stellen geändert — und beim Durchsehen war
mindestens ein Drittel davon falsch (aus „Auf der Aufnahme (Regel 8)" wurde
„Regel 13", also Safari). Zurückgenommen und von Hand gemacht: vier
mechanische Klassen mit 84 Stellen, dann 29 einzeln nachgesehen.

---

### P13 · Sieben Haken auf einem Fleck  ·  ERLEDIGT

Ein Haken sagt „geschafft". Er ist 26 Punkte groß, in fester
Bildschirmgröße, und er steht am **Anker** des Gebiets. In Mittelamerika
liegen sieben Anker so eng beieinander, dass daraus ein grüner Fleck wurde.

**Gemessen, bevor etwas geändert wurde** — auf der Nordamerikakarte, 844 ×
390, mit allen Ländern gesessen:

```
10 Haken · 14 Paare übereinander · engster Abstand 4,2 pt (bei 26 pt Durchmesser)
```

Ich hatte in der Schrittliste geschrieben, der Haken sei „dort vier Punkte
groß". Das war falsch: er ist überall 26 Punkte groß. **Vier Punkte war der
Abstand zwischen zweien**, nicht ihre Größe — die Diagnose stimmte, die
Begründung nicht.

**Wer an der Nadel hängt, bekommt seinen Haken an der Nadel** (P10). Der
Haken sagt „geschafft", und er muss dort stehen, wo das Kind das Land
findet. Danach: **null Paare übereinander**, engster Abstand 40 pt.

**Zwei Dinge fielen dabei auf, die nichts mit den Haken zu tun hatten.**

*Die Reihenfolge im SVG war falsch herum.* Der Haken lag unter den
Trefferflächen, also unter dem Nadelkopf — sichtbar war ein grüner Ring mit
einem farbigen Punkt darin, ohne Haken. Jetzt stehen die Haken darüber;
beide nehmen keine Tipps an, die Reihenfolge kostet nichts.

*Die Platzsuche der Nadeln sah nur das oberste Element.*
`elementFromPoint` liefert genau eines, und über der Karte liegen Haken,
Fahnen und der Zeiger. Ein Punkt mitten auf Frankreich, an dem gerade ein
Haken stand, galt damit als freie Fläche. Gefunden wurde das erst, als die
Haken selbst an die Nadeln wanderten und zu dem wurden, worüber gesucht
wird. Jetzt `elementsFromPoint` — es sieht durch.

**Das Tor misst es jetzt auf allen sieben Karten**, mit einem gestellten
Stand, in dem alles gesessen ist (ohne den stünde kein einziger Haken da,
und die Prüfung liefe über eine leere Menge):

```
bundeslaender  15 Haken, engster Abstand 18,7 pt
laender:europa 16 Haken, engster Abstand 13,9 pt
laender:nordamerika 11 Haken, engster Abstand 24,9 pt
```

**Die Grenze ist der Radius, nicht der Durchmesser** — und das ist
angesehen, nicht gerechnet: zwei Haken, die sich *berühren*, sind zwei
Haken; auf der Deutschlandkarte liegen mehrere Anker 20 bis 25 Punkte
auseinander, und dort steht sichtbar einer je Land. Eine Grenze am
Durchmesser hätte acht solcher Paare gemeldet, die niemanden stören. Erst
wenn die **Mitte** des einen in der Scheibe des anderen liegt, ist es kein
Paar mehr, sondern ein Fleck.

---

### P14 · Was ein Kind antippt, misst jetzt jemand  ·  ERLEDIGT

S3 war erledigt, die Zahl im Backlog überholt (47,8 pt statt 42). Die
Frage, die übrig blieb: **was misst `passt` eigentlich nicht?**

Es maß eine **Klassenliste** — `.kachel`, `.knopf`, `.etikett`, `.zi`,
`.mikro`, `.sterne`, `.aufkleber`. Eine Klassenliste veraltet: `.zahl` (die
vier Möglichkeiten beim Rechnen) stand nie darin. Jetzt steht `button` mit
in der Liste. Wer einen neuen Bildschirm baut, muss dafür nichts eintragen.

**Der erste Lauf danach: 56 Trefferflächen unter 44 pt**, und alle waren
derselbe Knopf — **„anschauen" an jeder Kachel der Ebenenwahl, 16 Punkte
hoch.** Drei solcher Knöpfe kann eine Kachel tragen („anschauen", „von
vorne", „Test"), und keiner war je gemessen worden.

**44 sind dort nicht zu erreichen, und das ist gerechnet:** von 390 Punkten
bleiben mit Leiste 348; davon gehen Kopf und Frage ab; für drei Zeilen aus
Kachel (56), Knopfzeile (16) und Abstand (8) bleibt genau nichts übrig. Ein
44er Knopf je Kachel kostete 84 Punkte, die es nicht gibt — deshalb steht im
Stylesheet seit R3 „kleiner, statt einen der beiden wegzulassen".

**Was zu holen war, ist geholt: 16 → 26 pt.** Über dem Knopf liegen 2
Punkte Luft bis zur Kachel, darunter 8 bis zur nächsten Zeile — zehn
Punkte, die niemand benutzte. Padding plus gleich großer negativer Rand
holt sie, ohne dass sich am Bild irgendetwas ändert (die 32 eingefrorenen
Aufnahmen sind unverändert grün).

**Was ein Fehlgriff kostet, ist dafür klein**: daneben liegt die Kachel, und
die startet die Ebene — also genau das, was das Kind ohnehin wollte. Der
Hinweis bleibt im Bericht stehen, jetzt mit einer Zahl, die jemand liest.

---

### P12 · Die Sprechprobe — das Werkzeug für M4r  ·  ERLEDIGT

M4r sagt es selbst: „eine halbe Stunde mit dem Gerät in der Hand, und kann
nicht von mir kommen." Was von hier kommen kann, ist das **Instrument** —
damit diese halbe Stunde mit Zahlen endet und nicht mit einem Eindruck.

Der Rauchtest baut die Erkennung nach (`window.SpeechRecognition =
ErkNachbau`). Er prüft damit den Zustand drumherum — dass man das Zuhören
beenden kann, dass ein Ende ohne Ergebnis sichtbar wird. **Ob Safari im
Querformat auf einem iPhone das Mikrofon öffnet, kann er nicht wissen: sein
Nachbau sagt immer ja.**

Und „einfach spielen und schauen" hilft nicht, weil ein Fehlschlag dort
nichts erklärt. Deshalb zeichnet die Sprechprobe die **Abfolge** auf, nicht
das Ergebnis — die Tabelle oben bei M4r zeigt, was sich damit
unterscheiden lässt.

**Was der Rauchtest daran prüft — und was ausdrücklich nicht.** Nicht, ob
ein Mikrofon etwas versteht: das geht nur auf dem Gerät. Sondern, dass das
Werkzeug **unterscheidet**. Zwei Versuche, einer mit Wort und einer ohne,
und die Anzeige muss sie auseinanderhalten. Eine Anzeige, die nach jedem
Versuch dasselbe sagt, wäre schlimmer als keine. Die Gegenprobe macht genau
das kaputt (`mitWort = laeufe` statt `laeufe.filter(l => l.text)`) und der
Rauchtest wird rot.

**Am Nachbau war dafür etwas nachzutragen:** er meldete weder `start` noch
`audiostart`. Die Browser tun beides, und die Sprechprobe liest genau daran
ab, ob das Mikrofon aufgegangen ist — ohne die zwei Zeilen hätte sie im
Rauchtest nie etwas anderes als „nie aufgegangen" sagen können, und der
Abschnitt hätte eine Anzeige geprüft, die gar nicht anspringen kann.

---

### P11 · Fünf Hauptstädte, die keinem Tor gefehlt haben  ·  ERLEDIGT

Prag, Wien, Bern, Kopenhagen und Luxemburg standen nicht auf der Ebene
„Hauptstädte in Europa". Der Backlog nannte als Grund die fehlenden
Rohdaten — 400 MB Natural Earth. Das war falsch. Die Rohdaten haben
gefehlt, aber sie waren nicht das Problem:

**`tools/backen-laender.mjs` hielt seine eigene Liste dessen, was gespielt
wird.** Zwölf Länder je Kontinent, mit Namen und Reihenfolge. Als Europa in
D2c auf siebzehn wuchs, wurde sie nicht mitgezogen — und weil die
Hauptstädte nur für Länder *dieser* Liste gebacken werden, gab es die fünf
Punkte nirgends. Dieselbe Lehre wie in D2c, eine Ebene tiefer: **die
Geometrie ist der Vorrat, `erdkunde.js` ist die Ware.**

Das Werkzeug liest die Zielliste jetzt aus `erdkunde.js`. Ein Lauf, und die
Ebene hat siebzehn Hauptstädte statt zwölf.

**Warum kein Tor das gemeldet hat — das ist der eigentliche Befund.**

Die Prüfung stand da und war blind. Sie lief über
`LAENDER_EUROPA_GROB.filter(l => l.rang)` — also über den **gebackenen**
Rang. Die fünf waren ohne `rang` gebacken, standen deshalb nicht in ihrer
Liste, und das Tor prüfte zwölf von siebzehn und meldete grün. **Wer den
Vorrat nach dem Vorrat fragt, bekommt immer ja.**

Das war der *fünfte* Leser des gebackenen Rangs. D2c hat drei gefunden,
P11 zwei weitere:

| Wo | Was er las | Folge |
|---|---|---|
| `tor/inhalt.mjs` | `LAENDER_EUROPA_GROB.filter(l => l.rang)` | prüfte 12 von 17 und meldete grün |
| `prototyp/bauen.mjs`, `umgebung` | `roh.filter(l => !l.rang)` | die fünf wurden **zweimal** gezeichnet — grau darunter, bunt darüber. Man sieht nichts, man bezahlt nur den Pfad zweimal: **7 KB** im Nachladepaket Europa |

Das Tor zählt jetzt über `erdkunde.js` und schlägt an, wenn ein gespieltes
Land nicht gebacken ist. Gegenprobe eingetragen.

**Und dann fiel Kopenhagen ins Meer.**

Sobald Dänemark ein gespieltes Land war, meldete `inhalt`: „Kopenhagen
liegt nicht in Dänemark (430.8, 403.5) — der Stadtpunkt erschiene neben dem
Land". Nachgemessen: Kopenhagen liegt auf **Seeland**, und Seeland misst auf
der groben Stufe **12,7 Bildpunkte im Quadrat** — knapp unter der Grenze von
16, die `inselnFiltern` setzt. Dänemark wurde als Jütland gezeichnet.

Das stand seit jeher so da und ist niemandem aufgefallen, weil Dänemark
Umgebung war: ein Umriss ohne Namen wird nicht geprüft.

Die Grenze zu senken wäre die falsche Antwort — sie holt auf **jeder** Karte
Splitter zurück. Gehalten wird nur, was gebraucht wird: **die Insel, auf der
die Hauptstadt liegt, bleibt.** Dieselbe Regel wie eine Zeile tiefer, wo ein
Gebiet nie ganz verschwinden darf. Dänemark hat jetzt zwei Teile statt einem
(386 → 583 Punkte); Schweden, Finnland und Montenegro haben je ein bis zwei
Punkte verloren, weil die Vereinfachung über den ganzen Kontinent optimiert.
Hausdorff bleibt 0,73 px.

**Die Ablenker der fünf** stehen in `erdkunde.js`, nach derselben Regel wie
die zwölf davor: die Stadt, die ein Kind für die Hauptstadt *halten* könnte.
Brünn und Ostrava, Graz und Salzburg, **Zürich** und Genf, Aarhus und
Odense.

**Luxemburg bekommt keine** — und das steht jetzt ausdrücklich da. Die
zweitgrößte Stadt ist Esch an der Alzette mit 36 000 Einwohnern; ein
Ablenker, den niemand kennt, ist keiner. Die Falle, um die es auf dieser
Ebene geht, gibt es dort gar nicht: die Hauptstadt heißt wie das Land und
ist die größte Stadt. Die Aufgabe ist damit leichter als die anderen
sechzehn, und das ist die Wahrheit über Luxemburg, keine Lücke. Das Tor
verlangt **zwei Ablenker oder einen Satz, warum es keine gibt** — eine leere
Liste ohne Grund sieht genauso aus wie eine vergessene.

**Nachgemessen, weil es zu gut klang:** der Neubau mit frischen Rohdaten hat
die eingecheckten Dateien **byteweise reproduziert** — alle 51 Umrisse
Europas unverändert, bevor die Zielliste umgestellt wurde. Der Backvorgang
ist also reproduzierbar, und die Änderung ist genau das, was sie sein soll.

---

### P10 · Die neun Gebiete, die man nicht treffen konnte  ·  ERLEDIGT

P7 hat den Fall geschlossen, indem es die Frage weggelassen hat: wo man
nicht treffen kann, wird nicht gefragt. Neun Gebiete waren betroffen —
Belgien und Luxemburg auf der Europakarte (18,8 pt Trefferfläche) und die
sieben in Mittelamerika (7,6 bis 15,9 pt). Für sie kam „Wo liegt …?" nie.

Das war die richtige Notbremse und die falsche Lösung. **Das Konzept hatte
die richtige seit K3 aufgeschrieben** und niemand hatte sie gebaut:

> Die *Trefferfläche* ist ein unsichtbarer Kreis um den Anker, mindestens
> 44 × 44 Punkte (Apple HIG), **bei Bedarf mit einer dünnen Leitlinie zum
> echten Gebiet.**

Gebaut war der Kreis. Die Leitlinie stand nur da.

**Jetzt hängen die neun an einer Nadel.** Bleibt nach der Kappung am Ort
weniger als `MIN_REST` übrig, wandert die Trefferfläche neben die Karte:
volle 44 Punkte in freier Fläche, ein Faden zum Gebiet, ein Kopf in der
Farbe des Gebiets. Gemessen im Browser auf 844 × 390:

```
laender:europa       9 von 17 unter 44 pt · kleinste Kreise AUT 20, CZE 20, NLD 20 · 2 an der Nadel
laender:nordamerika  9 von 12 unter 44 pt · kleinste Kreise CUB 20, PAN 20, HND 44 · 7 an der Nadel
```

`nicht antippbar:` steht auf keiner der sieben Karten mehr.

**Drei Entscheidungen, die nicht offensichtlich sind.**

*Nadeln bekommen ALLE betroffenen Gebiete, nie nur das gefragte.* Eine
Nadel, die erst bei „Wo liegt Luxemburg?" erschiene, wäre die Antwort. Neun
Nadeln sagen nichts — wer die Frage beantworten will, muss trotzdem wissen,
wo Luxemburg liegt, und dem Faden von dort folgen.

*Der Platz wird am wirklichen Bildschirm gesucht, nicht gerechnet.* Die
Suche geht vom Kartenmittelpunkt nach außen, in Ringen von 44 bis 170
Punkten, und fragt für jeden Kandidaten `elementFromPoint` — Mitte und vier
Punkte auf 0,7 des Radius. Frei heißt: kein gespieltes Gebiet darunter, kein
fremder Anker in Reichweite, keine andere Nadel näher als 44 Punkte, alles
innerhalb des Kartenkastens. Findet sich nichts, bleibt es beim Verzicht aus
P7 — das ist jetzt der Ausnahmefall, nicht die Regel.

*Der kleine Kreis am Ort bleibt trotzdem stehen.* Wer genau zielt, soll auch
am Ort treffen dürfen. `kreisPx` trägt dann die Nadel, nicht den gekappten
Kreis: sie ist die Stelle, an der ein Finger das Gebiet wirklich trifft.

**Vier eigene Fehler, alle von einem Tor oder vom Bild gefunden.**

1. *Der Faden schluckte den Tipp, für den er da ist.* Er beginnt am Anker
   und liegt dort über dem kleinen Trefferkreis; ein Klick auf das Gebiet
   traf danach weder Kreis noch Fläche. Faden, Fuß und Kopf sind seitdem
   `pointer-events:none` — sie sind Bild, nicht Bedienung.
2. *Die neue Prüfung im Tor konnte gar nicht anschlagen.* „Wer auf die Nadel
   tippt, bekommt ihr Gebiet" liest den Trefferkreis, und der liegt selbst
   obenauf. Geprüft wird jetzt **durch** ihn hindurch
   (`elementsFromPoint`), ob ein gespieltes Gebiet darunter liegt. Die
   Gegenprobe — die Platzsuche abgeschaltet — macht das Tor an fünf Stellen
   rot; vorher blieb es grün.
3. *Die Rechnung stand zweimal da.* Der Nadelplan braucht vor den Kreisen,
   wer am Ort zu wenig bekommt — ich hatte die zehn Zeilen abgeschrieben.
   Gemeldet hat es `inhalt`, weil eine stehende Gegenprobe ihren Suchtext
   plötzlich **zweimal** fand. Jetzt eine Funktion, `kreisAmOrt`.
4. *`zeigeAufKarte` fand auf keiner Länderkarte etwas.* Der eingebettete
   Datenblock hält zu jedem Land Kennung und Name, aber weder Umriss noch
   Anker — die kommen erst mit `daten/laender-<kontinent>.json`. Der Helfer
   suchte den Anker und warf „steht nicht in den Daten". Aufgefallen ist es
   erst, als die umgekehrte Frage dort überhaupt gestellt wurde.

**Und der Rauchtest prüft jetzt die Gegenrichtung.** Er hat bisher gezeigt,
dass die Frage AUSBLEIBT; das war nach dieser Runde falsch und wurde sofort
rot („kein Gebiet als zu klein markiert — dann prüft dieser Abschnitt
nichts"). Er zeigt jetzt, dass sie kommt und dass man sie beantworten kann:

```
An der Nadel:  7 Gebiete auf der Nordamerikakarte, 0 bleiben zu klein · 9 Aufgaben,
               davon 3 × „Wo liegt …?" (Guatemala, Mexiko, Costa Rica),
               2 davon an der Nadel — alle getippt und gewertet
```

Guatemala und Costa Rica sind genau die Länder, nach denen vorher nie
gefragt wurde. Die umgekehrte Frage wird dabei nicht mehr übersprungen,
sondern beantwortet — getippt wird dort, wo ein Kind tippt: auf die größte
Trefferfläche.

**Was kein Tor prüft**, und deshalb als Aufnahme festgehalten ist
(`quer-nadeln`): wie es aussieht. Der erste Entwurf zog die Fäden mit 3
Punkten in voller Deckung — über der Landenge lag ein Gitter. Jetzt 1,5
Punkte bei 55 %. Ob zwei Köpfe übereinanderliegen oder ein Faden quer über
die halbe Karte geht, sieht nur ein Mensch.

Die beiden Zahlen `MIN_PT` und `MIN_REST` stehen jetzt auch im Konzept,
Kapitel 5.4, samt der dreistufigen Mechanik und der Angabe, welches Tor sie
wo misst. Sie standen vorher nur im Quelltext; das Konzept nannte 44 und
sonst nichts, und in der Tabelle in Kapitel 11 stand als Tor noch
`beruehrung` — das seit P6 keine Kartenpixel mehr rechnet.

---

### P9 · Ein Tor, das doppelte Wahrheiten meldet  ·  ERLEDIGT

Diese Sitzung hat Regel 6 **viermal** bezahlt: `pfadZuPolys` stand in vier
Dateien (F16/F17), `filter(x => x.rang)` in drei (D2c), die Rangprüfung in
zwei (D2c), `MIN_PT`/`MIN_REST` im Spiel und noch einmal im Tor. Jedes Mal
derselbe Befund: eine Fassung wurde gepflegt, die andere galt, und niemand
sah den Unterschied.

`npm run doppelt` sucht Quelltext, der zweimal dasteht. Was zweimal
dastehen **darf**, steht in `tor/doppelt-erlaubt.json` — und jeder Eintrag
braucht einen Satz. Ein Eintrag ohne Begründung macht das Tor rot: er wäre
ein Freibrief, kein Beschluss.

**In Token gemessen, nicht in Zeilen** — und das ist der Unterschied
zwischen einem Tor, das anschlägt, und einem, das nichts findet. Der erste
Anlauf verglich normierte Zeilen, fand fünfzehn Dopplungen und ausgerechnet
die vier nicht, für die er gebaut ist. Der Grund stand sofort da:

```
bauen.mjs           const #=#.#(§); if(!#) continue;
backen-staedte.mjs  const # = #.#(§);
                    if (!#) continue;
```

Dieselbe Sache, einmal auf einer Zeile, einmal auf zweien. Wer eine Kopie
anlegt, formatiert sie um.

**Die Fenstergröße ist an der Vergangenheit geeicht**, nicht daran, wie
ruhig sie ist. Gemessen am Baum von `55950e4`, also vor F17, als
`pfadZuPolys` noch dreimal dastand:

| Fenster | Befunde heute | findet `pfadZuPolys` von damals |
|---|---|---|
| 40 | 84 | ja |
| 50 | 53 | ja |
| 80 | 25 | ja |
| **100** | **16** | **ja** |
| 120 | 11 | **nein** |

Hundert ist also das größte Fenster, das den Fall noch fängt — und damit
das leiseste. Wer es höher dreht, dreht genau den Befund weg, der F16 und
F17 gekostet hat.

**Der erste echte Lauf hat sofort eine Dopplung gefunden, die ich am
selben Tag angelegt hatte:** der Abschnitt `treffer` aus P6 schrieb den
Seitenaufbau ab, den `aufgabe()` sechzig Zeilen weiter oben schon hatte —
samt dem Warten auf `kartenGroesse()`, an dem die gemessene Nachsicht
einmal zwischen 60 und 80 Punkten geschwankt hat. Beides steht jetzt als
`inEbene` in `chromium.mjs`.

**Was es nicht kann:** es findet den Text, nicht die Absicht. Zwei Stellen,
die dasselbe tun, aber verschieden geschrieben sind, entgehen ihm.

---

### P8 · Elf Dopplungen, die zusammengehören  ·  ERLEDIGT

Der erste Lauf von `doppelt` hat fünfzehn gefunden. Vier davon sind
Tabellen, die sich naturgemäß wiederholen — die Probenliste, die
Abzeichentafel, die Länderlisten, die Backziele. Sie stehen mit Begründung
in `tor/doppelt-erlaubt.json` und bleiben.

Die anderen elf gehören zusammengelegt. Sie stehen ebenfalls dort, jede mit
ihrem Satz, damit die Ratsche keine **neuen** durchlässt — aber sie sind
Arbeit, nicht Beschluss:

| Wo | Was |
|---|---|
| `ansicht` · `smoke` | derselbe gestellte Protokollstand in zwei Toren. **Der gefährlichste**: laufen sie auseinander, messen die beiden Tore verschiedene Elternberichte |
| `spiel.js` ×2, `tor/schreiben.mjs` | Mulberry32. Die Fassung im Tor ist Absicht (sie rechnet nach); die beiden im Spiel nicht |
| `smoke.mjs` ×2 | zwei Leser derselben Backlog-Tabelle |
| `inhalt.mjs` ×2 | zwei Leser derselben Konzepttabelle |
| `schreiben.js` ×2 | zweimal dieselbe Neuabtastung eines Striches |
| `bauen.mjs` · `entwuerfe/bauen.mjs` | `bbox` zweimal |
| `ansicht` · `ziehen` | Ziel und Anker aus der Seite lesen |
| `smoke` · `ziehen` | der Rest des Seitenaufbaus um `inEbene` herum |
| `rechnen.js` ×2 | zwei Aufgabenbauer mit demselben Bauplan |
| `spiel.js` ×2 | der Antwortweg samt Mischen, für Karte und Rechnen |
| `backen-kontinente` · `backen-laender` | der Importblock — der harmloseste |

**Drei davon sind weg — und einer meiner Sätze oben war falsch.**

Ich hatte geschrieben, `ansicht` und `smoke` trügen *denselben* gestellten
Protokollstand. Beim Hinsehen stimmte das nicht: die beiden Listen sind
verschieden lang und haben verschiedene Zeilen. Doppelt war zweierlei —
**die Vorgaben eines Protokolleintrags** und **der Elternvergleich**.

**1. Die Vorgaben.** `src/protokoll/protokoll.js` hat eine `eintrag()`, die
weiss, was ein Eintrag braucht. Beide Tore haben sie nachgebaut:
`roheingabe: ''`, `sicherheit: null`, `fachVorher`, `fachNachher`. Wäre dort
ein Feld dazugekommen, hätten beide einen Bildschirm gemessen, den es so
nicht gibt. Beide rufen jetzt `eintrag()` auf.

Dabei fiel `modul: 'erdkunde'` auf: geschrieben, **nie gelesen** — nicht im
Elternbericht, nicht in der CSV-Ausfuhr — und seit C1 auch noch falsch, weil
Fionas Rechenaufgaben damit als Erdkunde protokolliert wurden. Es ist raus.
Wer das Modul braucht, liest es aus `ebene`; dort steht es richtig.

**2. Der Elternvergleich.** *Das* war wirklich zweimal da: Stephan zwei von
drei, Violeta eins von zwei. `ansicht` fotografiert die Tabelle, `smoke`
rechnet sie nach — laufen die Zeilen auseinander, zeigt das Bild etwas, das
niemand mehr prüft. Beide lesen jetzt `ELTERN_VERGLEICH` aus
`tor/gestellt.mjs`.

Beim Zusammenlegen kam sofort „0 von 3" heraus: `versuch` stand als Vorgabe
im Tor, und das eine Tor setzte sie, das andere nicht. „Auf Anhieb oder
nicht" **ist** der gestellte Fall — es steht jetzt an jeder Zeile der
Vorlage, auch die Einsen.

**3. Mulberry32 im Spiel.** Zweimal derselbe Würfel, und die eine Fassung
sagte es sogar selbst: „derselbe Mulberry32 wie bei den Hauptstädten". Jetzt
einmal. Die dritte Fassung im Tor `schreiben` bleibt mit Absicht: ein
Nachrechner, der die geprüfte Funktion aufruft, prüft nichts.

**Und das Tor hat dabei seine eigene Zahl korrigiert.** Es meldete
„von 5 auf 33 Zeilen gewachsen", nachdem ich Mulberry32 zusammengelegt und
einen erklärenden Absatz darüber geschrieben hatte — gewachsen war nur meine
Erklärung. Gezählt werden jetzt **Token**, also das, was wirklich verglichen
wurde. Eine Zahl, die auf Kommentare anschlägt, erzieht dazu, keine zu
schreiben.

**Die acht übrigen sind abgearbeitet — und beim Abarbeiten kamen sechs
weitere zum Vorschein, die das Tor gar nicht gemeldet hatte.**

Das ist eine Eigenschaft des Tors, die vorher niemand kannte: es fasst
Fundstellen **je Dateipaar** zusammen und zeigt nur die größte. In
`tor/smoke.mjs` lagen sechs Dopplungen hintereinander gestapelt — jede kam
erst zum Vorschein, als die davor weg war. Gemeldet wurden nie mehr als
eine. Wer nach dem ersten Fund aufhört, hält eine Datei für sauber, in der
noch fünf stehen.

| Zusammengelegt | Wohin | Was es wert war |
|---|---|---|
| `inhalt.mjs` ×2 | `gegenAbgleich()` | zwei Leser derselben Konzepttabelle. Beim Zusammenlegen fiel auf: Fionas Block meldete eine fehlende Abgleichdatei als Fehler, Leas übersprang sie still |
| `schreiben.js` ×2 | `gleichWeit()` | zwei Neuabtastungen. Die eine tastete eine Kurve dicht ab und dann gleich weit, die andere nur gleich weit — hätten sie sich unterschieden, wäre **jeder** Buchstabenvergleich schief gewesen |
| `smoke.mjs` ×2 | `backlogZeile()` / `backlogZahlen()` | drei Leser derselben Backlog-Tabelle, nicht zwei |
| `bauen.mjs` · `entwuerfe/bauen.mjs` | `rahmen()` / `sichtfeld()` in `geo-backen.mjs` | `bbox` — einmal als Rechteck, einmal gleich als viewBox-Zeichenkette |
| `ansicht` · `ziehen` | `zielUndEtikett()` | Ziel und Anker aus der laufenden Seite |
| `smoke` · `ziehen` | `ausAblage()`, `standVon()`, `stelleAblage()` | **zwölf** Zugriffe auf IndexedDB, nicht zwei |
| `smoke.mjs` ×2 (verdeckt) | `abgeschlossen()` | der Abschluss einer Aufgabe, dreimal: Schreiben, Rechnen, Karte |
| `smoke.mjs` ×2 (verdeckt) | `schreibeSauber()`, `angenommen()` | dreimal derselbe Verzug beim Schreiben — eine geradere Kopie hätte eine andere Toleranz geprüft |
| `smoke.mjs` ×2 (verdeckt) | `naechsteAufgabe()`, `angesagtMit()` | Warten auf Ansage und Ziel |
| `rechnen.js` ×2 | `malAufgabe()`, `teilAufgabe()` mit Kennung | vier Aufgabenbauer, zwei Paare. Frage, Ansage und Lösung eines Produkts hängen nicht daran, wie groß die Zahlen sind |
| `backen-kontinente` · `backen-laender` | — | der Importblock, bleibt |

**Sieben von zwölf Ablage-Zugriffen legten die Läden nicht an.** Sie liefen
nur, weil vorher in derselben Sitzung ein anderer Abschnitt die Ablage
gebaut hatte. So sieht eine Dopplung aus, die nichts kostet — bis zu dem
Tag, an dem ein Abschnitt allein läuft.

**Eine Dopplung habe ich gemessen und stehen lassen:** die beiden
Umschalter der Antwortweise in `spiel.js`. Beide schalten eine Größe, die
ihre Umgebung nach dem Klick weiterliest (die Etiketten in `b.onclick`, die
`eingabeart` beim Werten); ein gemeinsamer Helfer bräuchte Lesen und Setzen
als Rückrufe und wäre länger als die 125 Token, die er spart. Der Satz
steht so in `tor/doppelt-erlaubt.json`.

**Aber beim Messen fiel das Eigentliche auf.** Beide Umschalter tragen ihre
Weise als `data-weise` am Knopf — eine Zusage an die Tore. Gelesen wurde sie
nur auf der Karte. Der Rechenschirm hatte dieselbe Zusage und **kein Tor**,
das sie prüft. Der Rauchtest liest sie jetzt auch dort und vergleicht sie
mit dem, was sichtbar offen ist; die Gegenprobe (`data-weise` lügt) macht
ihn an drei Stellen rot. So verfällt eine Dopplung wirklich: nicht sichtbar,
sondern indem eine Hälfte ungeprüft bleibt.

Übrig bleiben acht Einträge in der Erlaubnisliste, alle mit einem echten
Satz: fünf Tabellen (Probenliste, Länderlisten, Backziele, Abzeichentafel,
Buchstabenvorlage), der Importblock, der nachrechnende Mulberry32 im Tor
`schreiben` und die beiden Umschalter.

---

### P6 · `beruehrung` rechnete mit einem angenommenen Kartenmaßstab  ·  ERLEDIGT

Das Tor rechnet Trefferflächen mit `KARTE_PX/1000` — 470 Bildpunkte
geteilt durch die viewBox-Breite, die es auf 1000 schätzt. Gemessen im
Browser stimmt das nicht: auf 844 × 390 **bindet die Höhe**, nicht die
Breite. Für Europa (viewBox 1015,7 × 876) sagt die Node-Rechnung 36,1 pt
für die Schweiz, der Browser 24,9 — rund 35 % daneben, und die Vorzeichen
kippen: Node sieht Österreich, Tschechien und Polen gar nicht als „zu
klein", der Browser schon.

Betroffen sind auch die Zahlen, die das Tor **heute schon** für Deutschland
ausgibt. Regel 5, wörtlich: die Zahl und ihre Messstelle gehören zusammen
— und diese Zahl entsteht am falschen Ort. Sie gehört in den Browser
(`tor/pwa.mjs` oder ein eigener Abschnitt im Rauchtest), nicht in Node.

Gefunden in D2c, als die Node-Rechnung gegen eine Browsermessung gehalten
wurde, die es zufällig schon gab.

**Umgesetzt — und die Messung hat sofort vier echte Fehler gefunden.**

`npm run ziehen` hat einen Abschnitt `treffer`: er öffnet **jede der sieben
Karten** auf 844 × 390 und misst, was wirklich da steht. Geprüft werden
zwei Zusagen, und beide gehen nur am Bildschirm:

1. **Wer auf den Anker eines Gebiets zeigt, bekommt dieses Gebiet.**
   Gelesen wird mit `elementFromPoint` und der Regel des Spiels —
   Trefferkreis vor Umriss —, nicht mit einer zweiten Rechnung daneben.
2. **Was kleiner ist als ein Daumen, hat einen Kreis.**

Der erste Lauf war rot:

```
laender:nordamerika: wer auf den Anker von Nicaragua zeigt, bekommt CRI
laender:nordamerika: wer auf den Anker von Guatemala zeigt, bekommt SLV
laender:nordamerika: wer auf den Anker von Honduras zeigt, bekommt SLV
laender:nordamerika: wer auf den Anker von Dominikanische Republik zeigt,
                     bekommt HTI
```

Das ist **genau die Falle aus F16**, nur auf einer anderen Karte: der
Zeiger zeigt hin, und wer hinzieht, bekommt den Nachbarn.

**Die Ursache stand drei Zeilen unter der Regel, die sie verletzt.**
`trefferflaechen()` schrumpft jeden Kreis auf `d · 0,55` des Abstands zum
nächsten fremden Anker — das kann einen fremden Anker gar nicht erreichen.
Danach aber hebt `Math.max(rPx, MIN_REST/2)` das wieder auf, sobald zwei
Anker näher als achtzehn Punkte beieinanderliegen. Der Boden riss die
Regel ein, unter deren eigenem Kommentar er steht.

Gekappt wird jetzt knapp diesseits des nächsten fremden Ankers (`· 0,9`).
Ein erster Anlauf mit `0,45` hat auch Berlin, Hamburg und das Saarland um
vier Punkte beschnitten, wo nichts zu berichtigen war — gemessen und
verworfen. Was es kostet, in Bildpunkten Durchmesser:

| | vorher | nachher |
|---|---|---|
| Bundesländer, Afrika, Asien, Südamerika | — | **unverändert** |
| Belgien, Luxemburg | 20 | 18,8 |
| Guatemala | 20 | 11,9 |
| Haiti, Dominikanische Republik | 20 | **7,6** |

Die letzten beiden liegen 4,2 Punkte auseinander. Dort hilft kein Kreis
mehr — nur eine größere Karte, und das ist **P7**. Bis dahin gilt: lieber
ein kleiner Kreis als einer, der den Nachbarn aussperrt. Vorher war die
Anzeige eine Lüge; jetzt ist sie klein, aber wahr.

**Und `beruehrung` sagt keine Bildpunkte mehr.** Es nennt die vier engsten
Bundesländer in Karteneinheiten (Bremen 20, Hamburg 35,8, Berlin 38,
Saarland 68,8 von 1000) und schreibt dazu, dass die Bildpunktzahl in
`ziehen` gemessen wird — hier wäre sie geraten. Seine harte Zusage bleibt
und gilt jetzt für **alle** sechzehn statt nur für die kleinen: welches
Gebiet unter den Daumen fällt, hängt am Bildschirm, und den gibt es in
Node nicht.

---

### P7 · Wo man nicht treffen kann, wird nicht gefragt  ·  ERLEDIGT

Auf der Europakarte (iPhone quer) ist Luxemburgs Trefferkreis 20 pt groß —
der Boden, den `MIN_REST` setzt, damit er nicht Belgiens Anker verschluckt.
Die Fingergrenze ist 44. Dasselbe gilt für Belgien, die Niederlande,
Österreich und Tschechien, und seit Monaten für Berlin, Bremen, Hamburg
und das Saarland (12–13 pt).

Ein größerer Kreis ist keine Lösung — er nimmt dem Nachbarn seine Stelle,
und genau das hat F16 gekostet.

**Und der Zoom ist auch keine.** So stand es hier: „die Karte bei der
umgekehrten Frage auf die Gegend zoomen, in der das gesuchte Gebiet liegt".
Das ist an der Wurzel falsch. Die Frage lautet **„Wo liegt Luxemburg?"** —
eine auf Luxemburg gezoomte Karte beantwortet sie selbst. Die umgekehrte
Frage lebt davon, dass die ganze Karte dasteht.

**Also andersherum: sie wird für solche Gebiete nicht gestellt.**

`trefferflaechen()` schreibt jetzt mit, wie groß jede entkoppelte
Trefferfläche wirklich geworden ist, und `umgekehrt` fragt dieselbe Zahl:
liegt sie unter `MIN_REST` — dem Boden, den die App selbst für eine noch
brauchbare Fläche setzt —, kommt die Frage nicht. Das Kind lernt Haiti
weiter, über den Namen statt über einen Vier-Punkt-Treffer.

Betroffen sind neun Gebiete: Belgien und Luxemburg (18,8 pt) sowie die
sieben in Mittelamerika (7,6 bis 15,9). Auf allen anderen Karten ändert
sich nichts.

**Zwei eigene Fehler, beide vom Rauchtest gefunden.**

Der erste war ein Scope-Fehler mit stiller Wirkung: die Karte der
gemessenen Kreise lag im selben Gültigkeitsbereich wie der
Aufgabenbildschirm und war deshalb bei **jeder** Aufgabe wieder leer.
`tippbar()` sagte immer ja, alles war grün — und „Wo liegt Guatemala?"
wurde weiter gestellt. Gefunden hat es der Rauchtest, weil er mitliest,
*welche* Frage kommt.

Der zweite: `weitergegangen()` wartet unter anderem auf `path.ziel` — den
es bei der umgekehrten Frage mit Absicht nicht gibt, das gesuchte Gebiet
ist ja nicht markiert. Der Helfer lief in die Zeitüberschreitung, die
Schleife brach nach fünf Aufgaben ab, und der Abschnitt meldete „keine
einzige Wo-liegt-Frage".

**Und die Prüfung geht in beide Richtungen**, sonst wäre „nie fragen" auch
grün: neun Aufgaben auf der Nordamerikakarte, genau eine davon „Wo liegt
Mexiko?" — Mexiko ist groß —, keine für die sieben kleinen. Eine Regel,
die filtert, nicht eine, die abschaltet.

---

### P5 · Die Größenratsche fragt die falsche Runde  ·  ERLEDIGT

`budget` meldet Wachstum über **5 %** gegen einen von Hand festgehaltenen
Stand. Das ist richtig gedacht und hat einen blinden Fleck: eine Runde mit
**+4,8 %** schlägt nicht an — und hält den Stand auch nicht nach. Die
nächste Runde misst dann gegen einen zu alten Wert und wird nach etwas
gefragt, das zur Hälfte nicht ihre Schuld ist.

Gemessen in dieser Runde: der Stand lag bei 208,2 KB, das Bündel bei 223,9.
Von den 15,7 KB stammen **9,9 aus B2** (Pokal, Testmodus, Rauchtest) und
5,8 aus G12. B2 war grün, weil +4,75 % unter der Grenze lag.

**Vorschlag:** den gemessenen Wert bei jedem grünen Lauf mitschreiben — als
zweite Zahl neben dem bestätigten Stand, nicht an seiner Stelle. Dann sagt
der Bericht „seit der letzten Bestätigung +4,8 %", und die Frage landet bei
der Runde, die das Wachstum verursacht hat. Die Ratsche selbst bleibt, wie
sie ist: sie darf sich nicht selbst zurücksetzen, sonst schlägt sie nie an.

**Umgesetzt genau so.** `tor/budget-stand.json` trägt zwei Blöcke:
`bestaetigt` (was jemand angesehen und mit `--neu` abgenickt hat — die
Ratsche misst weiter dagegen) und `gesehen` (was der letzte grüne Lauf
gemessen hat, ändert nichts am Urteil). Der Bericht sagt jetzt bei jedem
Lauf, auch dem grünen:

```
Startbündel: 223.9 → 232 KB   +3.6 % seit der Bestätigung,
                              davon +3.6 % in diesem Lauf
                              — noch 1.4 % bis zur Frage
```

Der erste Lauf hat es gleich bewiesen: D2 und F16 zusammen haben **3,6 %
der fünf** verbraucht. Ohne P5 hätte das die Länder-Runde erfahren, nicht
diese.

Mitgeschrieben wird nur, wenn sich etwas geändert hat — sonst wäre der
Baum nach jedem Kettenlauf schmutzig, und `proben` verweigert bei
schmutzigem Baum den Dienst (Regel 1). Und der fehlende `gesehen`-Block
ist ein **Fehler**, kein Hinweis: ein Tor, das nach einem stillen Rückbau
einfach weniger *sagt*, bleibt grün und fällt keinem auf.

**Und die neue Zeile hat sofort etwas gefunden**, das seit Monaten still
verfallen war. Die Gegenprobe „die Seite wächst unbemerkt" spritzt
Füllstoff ein und erwartet, dass die Ratsche anschlägt. Sie tat es nicht
mehr:

```
Startbündel: 232 → 242.1 KB   +4.4 % seit der Bestätigung
                              — noch 0.6 % bis zur Frage
```

Zwei Fehler in einer Probe, beide vom selben Typ:

**Regel 2, wörtlich.** Eingespritzt wurden **24 000 Zeichen** — eine
absolute Zahl gegen eine anteilige Grenze. Gegen den Stand von 208 KB
waren das +11,5 %, gegen 232 KB nur noch +4,4 %, und die Ratsche fragt ab
5 %. Die Probe hat aufgehört zu beweisen, ohne dass irgendetwas rot wurde.
Jetzt hängt die Menge an `bestaetigt.start` — ein Zehntel davon, gemessen
nach dem Packen, nicht geschätzt.

**Und die Füllung war gar kein Rauschen.** Der Generator rechnete
`x * 1103515245 + 12345` in JavaScript-Gleitkomma; das Produkt sprengt
2^53, wird gerundet, und die Folge läuft in einen kurzen Zyklus. 24 000
Zeichen schrumpften im Packer auf 10,1 KB, wo 62 Symbole 18 hergeben — die
Probe spritzte also nur halb soviel ein, wie ihr Name behauptete. Mit
`Math.imul` sind es jetzt 0,75 Byte je Zeichen, genau die Entropie des
Alphabets.

---

### B2 · Der Test ohne Hilfen, mit Pokal  ·  ERLEDIGT

Nach den Übungsrunden eine Runde **ohne Auswahl, ohne „Weiß ich nicht", ohne
Zeiger** — und mit **einem** Versuch je Aufgabe. Wer besteht, bekommt den
**Pokal** der Ebene. Der einzige Ort, an dem ein Pokal etwas bedeutet, weil er
für etwas steht, das man wirklich gezeigt hat.

**Sechs Entscheidungen und warum:**

| | |
|---|---|
| **offen ab** | die Ebene ist ganz gesammelt. Vorher wäre es kein „Test am Ende", sondern eine zweite Art zu üben — und der Pokal wäre nichts wert. |
| **wer** | nur wer liest. Fionas Auswahl aus vier Möglichkeiten ist ihr **Eingabeweg**, keine Hilfe; ohne sie wäre der Test für sie keine Prüfung, sondern eine Sperre. Ein Test, den ein Kind nicht bestehen *kann*, ist keiner. |
| **Umfang** | **alle** Gegenstände, einmal, gemischt — nicht der Leitner. Der wählt nach Fälligkeit und würde messen, was **er** für wackelig hält. |
| **Versuche** | **einer**. „Keine Lösung nach drei Fehlern" allein wäre zu wenig gedacht: bei vier Möglichkeiten hat man nach dreimal Raten recht. |
| **bestanden ab** | **vier Fünfteln**. Nicht alles richtig — dann hängt der Pokal an einem einzigen Verrutscher. Nicht die Hälfte — dann steht er für etwas, das man raten kann. Bei 16 Bundesländern sind es 13. |
| **wo er liegt** | bei den Einstellungen, nicht im Fortschritt. „Von vorne" löscht eine Ebene; einen bestandenen Test löscht es **nicht**. Was man gezeigt hat, hat man gezeigt. |

Ein Fehlversuch beendet die Aufgabe, aber die Antwort steht **nicht** da: was
im Test fehlt, gehört in die nächste Übungsrunde, nicht in die Prüfung. Der
Leitner erfährt es trotzdem — sonst wäre ein Test eine Runde, die den Lernstand
nicht anfasst, und genau die Gegenstände, die durchfallen, kämen nicht wieder.

**Abnahme** (aus dem ANTON-Abgleich, wörtlich): *„der Rauchtest spielt einen
Test durch und prüft, dass die Hilfen fehlen"*. Der Abschnitt `test` prüft alle
drei Hilfen **einzeln**, den einen Versuch, die 16 Aufgaben, den Pokal am Ende
und an der Kachel — und dass Fiona bei **gefüllter** Ebene keinen angeboten
bekommt (sonst bezeugte die Prüfung nur, dass sie noch nichts gesammelt hat).

---

### B3 · Die umgekehrte Frage  ·  ERLEDIGT (erste Form)

**„Wo liegt Bayern?"** — dieselbe Karte, andersherum gelesen. Nicht „wie heißt
dieses Gebiet" mit hervorgehobenem Umriss, sondern der Name in der Frage und
eine Karte **ohne jede Markierung**. Einen Namen wiedererkennen und ein Gebiet
*finden* sind zwei Fähigkeiten; geübt wurde bisher nur die erste.

**Wer:** alle, die lesen — Lea, Stephan, Violeta. Fiona bekäme die Frage
vorgelesen, aber ihr Weg ist das Ziehen eines Etiketts auf ein hervorgehobenes
Gebiet; ohne Hervorhebung fände sie auf einer Weltkarte keinen Halt. Das ist
eine eigene Runde wert, keine Nebenbemerkung.

**Wann:** jede dritte Aufgabe, an der laufenden Nummer und nicht am Würfel —
eine gewürfelte Mischung wäre nicht nachstellbar, und Rauchtest wie Bildabnahme
müssten raten, welche Aufgabe gerade welche Form hat. Nicht bei den
Hauptstädten: dort ist die Antwort ein Punkt, kein Gebiet.

**Wie geantwortet wird:** ein Tipp auf die Karte, gemessen mit demselben
`zielUnter`, das auch ein abgelegtes Etikett auffängt — derselbe Treffertest,
dieselbe Nachsicht für den Daumen. Ein Fehlgriff bekommt den Hinweis aus A3:
*„Das ist Saarland. Berlin liegt weiter oben rechts."* Er passt hier sogar
besser als beim Ziehen — dort kennt das Kind den Namen schon, hier sucht es ihn.

**Zwei Fehler in der eigenen Änderung, beide beim Hinsehen gefunden:**
das gesuchte Gebiet trug weiterhin die Klasse `ziel` und damit die
Akzentfarbe — **die Frage beantwortete sich selbst**; und der Umschalter
„Lieber ziehen" stand daneben, ohne etwas zu schalten zu haben. Kein Tor
hätte das gemeldet: sie messen Größen und Zustände, nicht den Sinn.

**Offen bleiben die anderen Formen** (Nachbarn, größer/kleiner, Puzzle,
Steckbrief) — jede einzeln machbar, keine so billig wie diese.

---

### S3 · Die Buchstabenkarten im Vorlauf  ·  ERLEDIGT

Der Backlog sagte „zwei Punkte zu klein". **Gemessen war es mehr:** das Gitter
legte auf dem Zielgerät **acht** Spalten an statt neun, die 26 Karten fielen in
**vier** Reihen statt drei, und jede Karte war **77 × 42** statt 88 × 62.

Die Ursache ist ein alter Bekannter: eine **absolute** Untergrenze (72 px) stand
neben einem **gerechneten** Wert (`100 % / 9 − Abstand` = 68) und überstimmte
ihn — neun Spalten zu 72 brauchen 680 Punkte, das Gitter hat 644. Und die Regel
stand **zweimal**: im Grundsatz und im kurzen Querformat. Gepflegt wurde die
obere, gegolten hat auf dem Zielgerät die untere.

Jetzt ist die Untergrenze eine **Marke** (`--kleber-eng-min: 56px`) an einer
Stelle, und sie liegt **unter** dem gerechneten Wert statt darüber.

**Und der eigentliche Grund, warum es liegen blieb:** `passt` führte zu kleine
Flächen als **Hinweis**, nicht als Fehler. Für einen Aufkleber ist das jetzt ein
Fehler — er ist nie aus gutem Grund schmal, im Gegensatz zum Zurück-Pfeil. Ein
Hinweis, den niemand liest, ist dasselbe wie keiner.

---

### F17 · Der Ankerprüfstand galt für sechzehn von zweiundachtzig  ·  ERLEDIGT

F16 hat Brandenburgs Anker berichtigt. Diese Runde beantwortet die Frage,
die danach offen war: **prüft das irgendwer für die anderen sechsundsechzig
Gebiete?** Nein. `topologie` sah `STAEDTE` an — Deutschland. Sechs
Kontinente und sechzig Länder haben ebenfalls einen Anker, und keiner hat
ihn je angesehen.

Der Anker ist keine Zierde. An ihm hängen der **Zeiger**, der dem Kind die
Stelle zeigt, das **Häkchen** auf einem gekonnten Gebiet, die
**Namensfahne** und die **entkoppelte Trefferfläche** für alles, was
kleiner ist als ein Daumen — `formen.filter(x => x.anker)`. Ein Gebiet ohne
Anker steht auf der Karte und lässt sich nicht spielen.

**Gemessen:** 82 gespielte Gebiete, davon 3 mit einem Loch im größten Teil
(Brandenburg, Niedersachsen, Südafrika). Null Anker außerhalb, null
fehlend. Gemessen an den Umrissen, die `bauen.mjs` wirklich einbackt —
grob für Kontinente und Länder, mittel für die Bundesländer. Nicht an den
feinen: die liegen im Baum, aber kein Kind fasst sie an (Regel 5).

**Die vierte Kopie.** `prototyp/bauen.mjs` hatte seine eigene
`pfadZuPolys`-Fassung mit `polys.push([ring])` — jeder Ring ein Polygon
ohne Loch, dieselbe Zeile, die in `backen-staedte.mjs` Brandenburg nach
Berlin gesetzt hatte. Sie stand hier ein zweites Mal, für die Kontinente
und für alle sechzig Länder. Beide lesen jetzt dieselben Funktionen aus
`geo-backen.mjs`.

**Und was das gebracht hat: heute nichts.** Regel 1 — die Wirkung
abschalten und nachmessen. Mit und ohne die Berichtigung stehen dieselben
Zahlen da: 82 geprüft, 3 mit Loch, 0 außerhalb. In keinem der drei Fälle
landete die lochblinde Suche zufällig *im* Loch. Es ist also eine
Vorbeugung und keine Fundstelle, und es steht hier so, damit niemand später
eine Heldentat daraus liest. Bezahlt macht es sich beim nächsten Land mit
Enklave — und eines davon kommt in der nächsten Runde.

**`beruehrung` braucht keine eigene Erweiterung.** Sein Fehlerpfad ist „ein
zu kleines Gebiet hat keinen Anker und ist deshalb nicht zu treffen".
Seit `topologie` für **alle** 82 einen brauchbaren Anker verlangt, ist der
Fall strukturell ausgeschlossen — für Luxemburg genauso wie für Bremen.

Zwei neue Gegenproben: ein gespieltes Land verliert seinen Umriss (beweist,
dass die Schleife die Länder überhaupt erreicht), und der Fall, den der
erste Anlauf selbst gebaut hat — das Tor schrieb `ausDatei || berechnet`
und fand damit für ein Bundesland *ohne* Anker klaglos einen. Die
Gegenprobe „das kleinste Gebiet verliert seinen Anker" hat es sofort
gesagt: sie wurde rot, aber aus dem falschen Grund. Ein Tor, das eine
Lücke selbst füllt, prüft sie nicht mehr.

### F16 · Brandenburgs Anker lag in Berlin  ·  ERLEDIGT

**Gefunden hat es der Rauchtest, nicht das Tor, das dafür da ist.** Der
Abschnitt `abzeichen` zog „Brandenburg" auf Brandenburgs Anker und bekam
„Das ist Berlin." Gemessen auf dem Zielgerät (844 × 390): der Anker liegt
1,8 Bildpunkte neben dem Mittelpunkt von Berlins Trefferkreis, der 10
Bildpunkte Radius hat.

**Ursache im Werkzeug.** `tools/backen-staedte.mjs` machte aus jedem Ring
eines Pfades ein eigenes Polygon *ohne Loch* — unter einem Kommentar, der
das Gegenteil ankündigte. Der größte einbeschriebene Kreis kannte das Loch
nicht, und die Mitte von Brandenburg ist Berlin.

**Warum es keinem auffiel.** `topologie` prüft „Anker liegt im Gebiet"
gegen den Außenring **ohne Löcher**. Ein Anker im Loch ist im Außenring.
Die stehende Gegenprobe schob den Anker weit vor die Küste — den echten
Fall konnte sie nicht sehen. Es gibt jetzt eine zweite, die genau den
Wert einsetzt, der bis hierher in den Daten stand.

**Was das im Spiel war:** am Anker hängen Zeiger, Häkchen, Namensfahne und
Trefferkreis. Die App zeigte dem Kind die Stelle, auf die es ziehen soll —
und diese Stelle war Berlin.

Geändert: `geo-backen.mjs` (Ringe zu Polygonen, einmal statt dreimal),
`backen-staedte.mjs` (benutzt es; rechnet Anker jetzt auch ohne die 400 MB
Rohdaten), `staedte.js` (Brandenburg und Niedersachsen — die zwei
Bundesländer mit Loch), `inhalt.mjs` (Tor prüft Löcher mit),
`chromium.mjs` (`zielPunkt` prüft seinen Punkt, statt ihn zu behaupten).

Im selben Zug: das Forscherbuch stand auf dem Zielgerät bei 322 Punkten in
322 sichtbaren — bei null Spielraum. Das Abzeichenband hätte es gekippt.
Zurückgeholt an den Gruppenüberschriften (90 Punkte für zwei Wörter), nicht
am Band: 44 Punkte sind die Fingergrenze.

### F15 · Vier Hebel für die Sprachqualität  ·  ERLEDIGT

**Der Befund war diesmal ein Bauchgefühl** („funktioniert halbwegs, aber noch
nicht ganz") plus **eine klare Forderung**: beim Sprechen muss der Lautsprecher
aus sein. Beides zusammen ergab vier Eingriffe.

**1. Die App schweigt, solange sie zuhört.** Das Mikrofon hörte den eigenen
Lautsprecher mit: die Aufgabe wird angesagt, das Kind tippt währenddessen auf
das Mikrofon — und die Erkennung bekommt „Wie heißt dieser Kontinent" ins Ohr
statt Fionas Antwort. Darin findet niemand einen Kontinent.
Umgesetzt als **ein Riegel an einer Stelle**, nicht als Aufräumen an dreizehn
Aufrufstellen: jede Stimme läuft durch `vorlesen`, jeder Ton durch `klangZu`.
Wer eine vierzehnte Stelle dazubaut, ist automatisch abgedeckt — dieselbe
Überlegung wie bei Regel 6. Dazu `speechSynthesis.cancel()` beim Anschalten:
der Riegel hält, was danach kommt, das Abschneiden erwischt den laufenden Satz.

**2. Alle Abschnitte, nicht nur der letzte.** `ev.results` kann mehrere
Abschnitte haben — das Gerät schneidet eine Äußerung an einer Atempause.
Gelesen wurde nur der letzte. Wer „Ich glaube | das ist Asien" sagte, verlor
die eine Hälfte; wer „Asien | glaube ich" sagte, die andere — und welche, hing
an der Atempause.

**3. Zwischenergebnisse werden gerettet.** Endet die Erkennung ohne
Endergebnis — auf dem Telefon bei Stille der **Normalfall** —, war alles weg,
obwohl das letzte Zwischenergebnis oft der volle Satz ist. Das Kind wurde
gebeten, noch einmal zu sagen, was es gerade gesagt hatte.

**4. Die Rückfrage ist beantwortbar.** Der Abgleich kennt drei Ausgänge, und
laut seinem eigenen Kommentar ist der mittlere der wichtigste: er „verwandelt
eine Erkennungsschwäche in eine Bestätigungsfrage — und die kann ein Kind
beantworten". **Konnte es aber nicht.** „Meintest du Hessen?" stand auf dem
Schirm, und im selben Augenblick war die Aufgabe vorbei und als nicht gekonnt
verbucht. Gemessen: **3 von 121 richtigen Äußerungen** enden so („hessn",
„hesen", „chiena") — das Kind hat den Namen gesagt, unsicher war das Gerät,
bezahlt hat das Kind. Jetzt: **Ja** wertet, was bestätigt wurde; **Nein**
kostet keinen Versuch. „Ja" auf einen *fremden* Namen zählt weiterhin falsch,
sonst wäre die Rückfrage ein Freifahrtschein.

**Gemessen und bewusst NICHT geändert:**
- **`GRENZE_ANNAHME` lockern**, damit mehr Äußerungen als beantwortbare
  Rückfrage statt als „nicht verstanden" enden: die Trefferquote liegt schon
  bei 100 %, es wäre also nichts zu holen — nur mehr falsche Vorschläge.
- **Nach „nicht verstanden" automatisch weiterhören**: genau das war F13. Ein
  Zustand, der sich selbst neu startet, ist wieder einer, aus dem das Kind
  nicht herauskommt.
- **`SpeechGrammarList`** (der Erkennung die sechs möglichen Wörter nennen)
  wäre der größte Hebel überhaupt — Safari auf iOS ignoriert sie. Eine Zeile,
  die nichts tut, gehört nicht in den Quelltext.

Der Rauchtest-Abschnitt `sprechen` prüft jetzt **sieben** Dinge, vier
Gegenproben halten die vier Eingriffe fest.

---

### F14 · Gesprochenes wurde als Wort verstanden, nicht als Satz  ·  ERLEDIGT

**Gemeldet vom Zielgerät, direkt nach F13.** Die Aufnahme ließ sich beenden —
aber das Gesagte wurde nie erkannt, es kam immer „sag es noch einmal".

**Vier Fehler auf einem Weg**, jeder für sich schon ausreichend:

1. **Es kommt ein Satz an, kein Wort.** Ein Diktiergerät liefert „Ich glaube
   das ist Asien", nicht „Asien". Der Abgleich fiel darüber — und zwar an
   seiner **Längenstrafe**, genau der Strafe, die ihn davor bewahrt, „euro"
   für Europa zu nehmen. Sie ist richtig und durfte nicht weg. Stattdessen
   bekommt jetzt **jede zusammenhängende Wortgruppe** ihre Chance.
   Die Füllwortliste war der alte Versuch, dasselbe mit einer Liste zu
   lösen. Gemessen: von 18 wirklichkeitsnahen Äußerungen fielen **4** durch.
   Eine Liste kennt immer nur die Redewendungen, an die jemand gedacht hat.
2. **`maxAlternatives = 3` wurde angefordert und weggeworfen.** Drei Zeilen
   weiter wurde nur `r[0]` gelesen. Die Erkennung liefert ihre Unsicherheit
   frei Haus — und die Antwortmenge ist geschlossen, wir müssen gar nicht
   raten, welche Lesart stimmt: wir können alle fragen.
3. **Die Meldung verschwieg das Gehörte.** „Das habe ich nicht verstanden"
   sagt niemandem, ob das Mikrofon nichts gehört hat oder der Abgleich nichts
   zuordnen konnte. Genau daran ist diese Fehlersuche fast gescheitert.
   Jetzt steht da: *Ich habe „…" verstanden. Sag es noch einmal.*
4. **Nicht verstanden kostete einen von drei Versuchen.** Nach drei
   Verständnisfehlern löste die App die Aufgabe auf — ohne dass das Kind ein
   einziges Mal falsch geraten hätte. „Ich habe dich nicht gehört" ist eine
   Aussage über **mich**, nicht über das Kind. Protokolliert wird es
   trotzdem: genau diese Zeilen sind das Rohmaterial für M4r.

**Der Wächter des Ausschnitts.** Ein Fenster darf kein **Bestimmungswort**
abschneiden, das direkt daneben steht (nord, süd, ost, west, neu, alt, …).
Ohne diese Sperre nahm der Abgleich „süd sudan" als **Sudan** an — ein echtes
Nachbarland, das es im Spiel nicht gibt, glatt als ein anderes gewertet. Der
Korpus hat es in demselben Lauf gemeldet, in dem der Ausschnitt entstand.
Der Unterschied zur alten Füllwortliste ist der Punkt: die zählte auf, was
weggelassen werden **darf**, und war deshalb immer unvollständig; diese zählt
auf, was **nicht** weggelassen werden darf — eine kleine, feste Klasse.

**Warum das Tor 100 % meldete, während nichts ging.** Es maß `abgleich` mit
nackten Wörtern; die App rechnet `hoerAbgleich` mit ganzen Äußerungen. Ein
Tor, das die Stufe darunter misst, bezeugt eine Rechnung, die niemand fährt
(Regel 5). Der Korpus hat jetzt beide Formen: **121 Treffer, 91
Nichttreffer**, davon ganze Sätze in beiden Hälften — auch solche, in denen
ein **falscher** Name steht. Gemessen: **100 % Treffer, 0 % falsch-positiv**.

**Fünf stehende Gegenproben**, und zwei davon haben Fehler in meinen eigenen
Prüfungen gefunden, bevor sie halfen: der geprüfte Satz „Das ist X" kam schon
durch die alte Liste (die Prüfung hätte nichts bewiesen), und die Prüfung auf
„die Aufgabe ist noch offen" suchte die Marke des Treffers statt die der
Auflösung — sie konnte gar nicht anschlagen.

---

### F13 · Der Sprachmodus hatte keinen Ausgang  ·  ERLEDIGT

**Gemeldet vom Zielgerät.** Sprachmodus im Elternbereich eingeschaltet, im
Spiel auf das Mikrofon getippt, „ich höre" erschienen, hineingesprochen —
und dann ging es nicht weiter. Kein Beenden, keine Auswertung.

**Nachgestellt und bestätigt.** Es waren drei Fehler auf einmal, und jeder
allein hätte gereicht:

1. **Kein `stop()`.** Wer fertig gesprochen hatte, konnte es der App nicht
   sagen. Ein zweiter Tipp baute einen **zweiten** Erkenner neben den
   ersten; auf iOS wirft das, und das Gesagte war weg.
2. **Kein `onend`.** Endet die Erkennung ohne Ergebnis — Stille, ein
   Abbruch durch das Betriebssystem, ein Wechsel in eine andere App —,
   dann feuert `onresult` nie. Die Zeile „… ich höre" blieb stehen, für
   immer. Genau das war zu sehen.
3. **Keine Frist.** Ohne Ergebnis und ohne Ende wartete die Anzeige
   unbegrenzt.

Dazu ein vierter, den man nur **sieht**: der atmende Ring am Mikrofon lief
immer, auch wenn gar nicht zugehört wurde. Die App sah aus, als hörte sie
zu, während sie es nicht tat — und als hörte sie weiter zu, nachdem sie
aufgehört hatte.

**Behoben.** Der Knopf ist ein **Schalter**: erster Tipp hört zu, zweiter
sagt „fertig" (`stop()`, nicht `abort()` — `stop()` liefert das bis dahin
Verstandene, `abort()` wirft es weg). Jeder Weg heraus — Ergebnis, Fehler,
Ende, Frist von 8 s — führt durch **ein einziges** `aufhoeren()`; es gibt
keinen Zustand mehr, aus dem man nicht herauskommt. Fehler bekommen eigene
Sätze (`not-allowed` nennt die Einstellungen, `no-speech` bittet lauter zu
sprechen), Zwischenergebnisse zeigen dem Kind, dass etwas ankommt, und der
Ring atmet nur noch während des Zuhörens.

**Warum kein Tor das gefunden hat.** Es gab keins, das den Sprachweg
angefasst hätte — die Spracherkennung existiert im Prüfbrowser nicht. Jetzt
gibt es einen Nachbau von `SpeechRecognition` im Rauchtest (er zählt
Starts und Stopps und wirft beim zweiten Start, wie iOS es tut) und den
Abschnitt `sprechen`, der vier Dinge prüft: Antippen beginnt und man
**sieht** es · ein zweiter Tipp beendet es · ein Ende ohne Ergebnis
hinterlässt keine Sackgasse · ein gesprochener Name wird wirklich
gewertet. Zwei stehende Gegenproben halten die beiden ersten Fehler fest.

**Was das nicht ersetzt: M4r.** Der Nachbau beweist die *Logik*, nicht das
Mikrofon. Ob Safari im Querformat auf dem iPhone auslöst, sagt weiterhin
nur das Gerät.

---

**M4r · Sprechen, ein Mal wirklich auf dem iPhone** *(Rang 1 — die
Ausnahme in diesem Block, Nutzen hoch)*
Der Sprachweg ist **Fionas zweiter Eingabeweg** und wurde nie auf dem
Zielgerät geprüft. Das Werkzeug für die eingefrorene Korpushälfte steht
seit dieser Woche (`npm run korpus`, mit Selbstprüfung); die Abnahme aus M6
verlangt zehn gesprochene Kontinentnamen von Fiona, mindestens acht richtig
zugeordnet, keiner falsch angenommen. **Bevor sie hundert Formen spricht,
muss klar sein, dass das Mikrofon auf dem iPhone im Querformat überhaupt
zuverlässig auslöst.** Das ist eine halbe Stunde mit dem Gerät in der Hand
und kann nicht von mir kommen.

**Das Werkzeug dafür steht jetzt** (P12): Elternbereich → *Sprechprobe —
löst das Mikrofon aus?*. Jedes Antippen ist ein Versuch, und aufgezeichnet
wird die **Abfolge der Ereignisse mit Zeiten**:

```
start 0 ms · audiostart 380 ms · speechstart 700 ms · ergebnis 1240 ms · ende 1310 ms — „Europa"
```

Damit lassen sich vier Dinge unterscheiden, die auf dem Bildschirm alle
gleich aussehen — „es passiert nichts":

| Was man sieht | Woran man es erkennt |
|---|---|
| die Erlaubnis fehlt | `fehler: not-allowed` |
| das Mikrofon ging nie auf | kein `audiostart` |
| es ging auf und hörte nichts | `audiostart`, kein `speechstart` |
| es hörte und das Ergebnis ging verloren | `speechstart`, kein `ergebnis` |

Aufgehoben wird in den Einstellungen (die letzten zwanzig Versuche), nicht
im Kopf: sonst endet die halbe Stunde mit einem Gefühl statt mit Zahlen,
und beim nächsten Start ist alles weg. „Versuche verwerfen" setzt zurück.

**Was am Gerät zu tun ist:** Sprachmodus einschalten, iPhone quer, zehnmal
antippen und je einen Kontinentnamen sagen. Dann die Tabelle abschreiben —
*Versuche*, *davon mit Mikrofon*, *davon mit verstandenem Wort*, die
Mediane und die Fehler. Das ist die Antwort auf M4r; erst danach lohnt sich
der Korpus.

**P1 · `passt` (54 s) und `ziehen` (48 s) laufen hintereinander**, obwohl
beide unabhängige Browsertore sind. Spart etwa 45 s je vollem Lauf.

**P2 · Die festen Wartezeiten im Rauchtest** — der nächste und riskanteste
Hebel gegen die Laufzeit. Gehört zwischen zwei Inhaltsrunden, nicht in eine
hinein.

**P3 · Der Größenwächter in `vergleich`** (mindestens 100 Treffer, 50
Nicht-Treffer im eingefrorenen Korpus) ist die einzige Prüfung ohne
Gegenprobe — weil ihr Gegenstand noch nicht existiert. Fällt mit M4r.

~~**S3 · Die Buchstabenkarten im Vorlauf sind zwei Punkte zu klein.**~~
**Erledigt — und die Zahl hier war überholt.** Nachgemessen auf dem iPhone
quer **mit** Leiste: die 26 Karten des Abc sind **47,8 × 74,4 pt**, ohne
Leiste 61,8 × 87,5. Repariert wurde das mit der Dreizeilen-Grenze
(`REIHEN_MAX`), und seither führt `passt` einen zu kleinen **Aufkleber als
FEHLER**, nicht mehr als Hinweis — der Satz „ein Jahr lang stand es als
HINWEIS im Bericht" steht im Tor selbst.

Was in P14 daraus wurde: die Suche nach dem, was **sonst noch** niemand
misst. Siehe dort.

~~**P4 · Die Regelnummern im Quelltext zeigen in eine andere Regelliste.**~~
**Erledigt** — siehe unten, Abschnitt P4.

---

## Q29 erledigt: der Gleichlauf steht, der Dienst fehlt noch

**Geschrieben und geprüft** ist alles: Familienschlüssel, Raum, Schloss,
Zusammenführung, Elternbereich, ein eigenes Tor mit sechs Gegenproben und
die Messung „nichts verlässt das Gerät" im Rauchtest.

**Offen ist genau ein Schritt, und er liegt bei euch:** den Dienst
aufsetzen. Cloudflare-Konto, `wrangler deploy` — die Anleitung steht im
Kopf von `dienst/gleichlauf-worker.js`. Danach (Q30):

1. `npm run dienstprobe -- https://…` — grün heißt, der Dienst spricht das
   Protokoll. Er legt dafür in einem Wegwerfraum ab und geht wieder.
2. Die Adresse als Repository-Variable `SMARTKIDS_GLEICHLAUF` eintragen
   (Settings → Secrets and variables → Actions → Variables). Kein
   Einchecken nötig; der nächste Bau nimmt sie mit.

Bis dahin ist der Gleichlauf aus, und der Elternbereich sagt das auch.

Und eine Naht bleibt unbewacht: dass die App den Gleichlauf wirklich
anstößt, prüft kein Tor, sondern `npm run zweigeraete` von Hand. Der
Grund steht im Kopf des Werkzeugs — eine Adresse, die sich zur Laufzeit
setzen ließe, wäre ein Weg, die Aufkleber eines Kindes anderswohin zu
schicken.

---

## § 4 · Was bewusst nicht kommt

- **Dreistellige Addition für die Eltern.** Sie lässt sich nicht begrenzen,
  ohne willkürlich auszudünnen — und eine willkürliche Auswahl ist kein
  Vorrat, sondern eine Stichprobe. Wenn ihr sie wollt, wird sie eine eigene
  Ebene mit einer eigenen, tragenden Regel.
- **Gekaufter Schmuck, Avatare, Währungen.** Der Begleiter (D1) ist da, er
  wird nicht verdient.
- **Streaks, die man verliert.** A4 zieht, ohne zu drohen.

---

## § 5 · Das Archiv — erledigt, aber die Begründungen gelten weiter

Die Runden R1 bis R7 sind gefahren. Was hier steht, ist nicht ihr Verlauf
(der steht in `docs/Lernkiste-STAND.md`), sondern das, was **weiter gilt**.

### 5.1 Die Runden in einer Zeile

| | Ziel | Ergebnis |
|---|---|---|
| **R1** | Von vorne, mitten im Spiel | Pausenbildschirm mit drei Wegen; zwei Gegenproben |
| **R2** | Eine Kachelsprache für alle drei Wahlbildschirme | B · Bild auf Weiß (W2); Überlappungstor sitzt **in** `passt` |
| **R3** | Memory-Vorlauf je Ebene | ersetzt die Stadtstaaten-Einheit; deckt B1 mit ab |
| **R4** | Elternprofil und Mathe für Erwachsene | 158 Aufgaben; `spielprobe` rechnet 398 nach |
| **R5** | 12 Länder je Kontinent statt 5 | billiger als befürchtet: 107,4 → 107,6 KB |
| **R6** | Erdkunde für Erwachsene | `hauptstaedte:europa` für Lea und Eltern |
| **R7** | Der Elternbereich kennt drei Profile | „Was kann Lea noch nicht?" ist beantwortbar |

### 5.2 Die Regel, die aus R4 kam und alles Weitere bindet

Der erste Entwurf des Elternvorrats lautete „Plus und Minus im Zahlenraum
1000, zweistellig × einstellig, dreistellige Division". Klingt vernünftig.
**Gezählt sind das 321 200 Aufgaben allein für die Addition.**

Das bricht drei Dinge auf einmal: das Forscherbuch zeichnet jeden
Gegenstand einer Ebene (dreihunderttausend Kästchen), `spielprobe` rechnet
jede Aufgabe nach, und der Leitner braucht **Wiederholung** — bei 321 200
Aufgaben sieht man dieselbe nie zweimal, und ein Verfahren gegen das
Vergessen, dem man nie begegnet, ist keins.

> **Ein Vorrat muss von Natur aus begrenzt sein — durch die Regel selbst,
> nicht durch nachträgliches Kürzen.**

Deshalb 158 statt 321 200. Deshalb sind es in N4 **zehn Ziffern** und nicht
zwanzig Zahlen. Und deshalb ist die erste Frage an jede neue Ebene: *wie
viele Gegenstände hat sie, gezählt?*

### 5.3 Der Budgetbefund, der sich als falsch erwiesen hat

Vor R5 stand hier die Befürchtung, zwölf Länder je Kontinent sprengten die
250 KB je nachgeladener Ebene. Gemessen wuchs das größte Bündel von
**107,4 auf 107,6 KB**. Der Grund stand die ganze Zeit im gebauten Bündel:
**jedes** Land eines Kontinents wird ohnehin ausgeliefert, die namenlosen
als `umgebung`. Sieben Länder mehr zu benennen heißt, sieben Formen von
`umgebung` nach `laender` zu schieben — es kostet Name, Rang und Anker,
sonst nichts.

*Die Lehre ist nicht „Budgets sind egal", sondern: die Befürchtung war eine
Schätzung, und die Messung dauerte eine Viertelstunde.*

**Der Stand heute** (gemessen 30.08.2026, gzip, `npm run budget`):
Startbündel **183 von 400 KB**, größte nachgeladene Ebene **108,3 von
250 KB**. Für das Schreibspiel heißt das: **217 KB Luft im Start** — genug für Vorlagen
und einen kleinen Erkenner, nicht genug für ein geladenes Modell.

### 5.4 Die zwei Achsen des Sprechens

| | was es heißt | wer |
|---|---|---|
| `vorlesen` | „lies mir die **Aufgabe** vor, ich kann noch nicht lesen" | nur Fiona |
| `ton` | „wie redet die App, wenn sie **von sich aus** redet" | kindlich jubelt, sachlich schweigt |

Was jemand ausdrücklich angetippt hat, um es zu hören, bleibt unbedingt:
**eine Bitte wird nicht vom Profil beantwortet.** Diese Regel gilt für N3
weiter — Fiona darf sich den Buchstaben so oft ansagen lassen, wie sie
will.

### 5.5 Kleines, das erledigt ist — steht hier, damit es nicht wieder aufgemacht wird

- „aussen → asien" ist behoben (Kölner Phonetik mit eigenem Diphthong-Code,
  Falsch-Positiv 2,3 → 0,0 %).
- Die Siegsterne sind bei sachlichem Ton weg — wegen Redundanz, nicht wegen
  Geschmack. Im Kopf während der Sitzung bleiben sie.
- Die Namensfahne bricht am Bindestrich oder an der Lücke, die der Mitte am
  nächsten liegt.
- „Forscherbuch" bleibt, wie es heißt.
- Was einmal geschafft war, bleibt geschafft: der Leitner führt eine
  monotone Höchstmarke (`hoechstes`), Aufkleber fallen nicht mehr aus dem
  Buch.
- `beruehrung` brauchte für die Städte nichts: eine Stadt ist nie ein Ziel,
  das man trifft.

---

## § 6 · Die vier Weichen — gestellt am 30.08.2026

Vier Stellen, an denen die Antwort die Arbeit verändert. Sie sind
beantwortet; hier steht die Antwort **und** was sie kostet, damit später
niemand raten muss, warum es so gebaut ist.

**W-A · Erkennung: beides, gestuft.**
Zuerst der Vergleich der Strichzüge gegen die Vorlage (Richtung,
Reihenfolge, Anzahl, Lage), und was dort durchfällt, geht an einen kleinen
mitgebackenen Klassifikator über das gezeichnete Bild.

*Was das heißt:* das ist der sicherste, aber auch der einzige Weg mit zwei
Verfahren. Er zerfällt deshalb in zwei Runden — **N2a** baut das Nachfahren
und den Strichvergleich (der zum Nachfahren ohnehin gebraucht wird), **N2b**
setzt den Klassifikator als Auffangnetz darunter. Nach N2a ist das Spiel
spielbar; N2b macht es nachsichtig gegen Fionas eigene Schreibwege. Die
Reihenfolge ist keine Bequemlichkeit: ohne N2a gibt es keinen Maßstab, an
dem man messen könnte, ob das Auffangnetz überhaupt etwas fängt (Regel 1 —
eine Prüfung, die nie etwas meldet, ist kein Beweis). Und der Platz ist da:
217 KB Luft im Startbündel (§ 5.3).

**W-B · Strenge: beim Nachfahren locker, beim freien Schreiben mittel.**
Nach drei Fehlversuchen wird der Buchstabe **vorgemacht** statt abgelehnt —
dieselbe Regel wie „Lösung nach drei Fehlern" bei den Gebieten.

*Was das heißt:* „locker" und „mittel" sind keine Zahlen, und Zahlen aus dem
Bauch sind in diesem Verzeichnis schon dreimal teuer geworden. Die
Toleranzen werden deshalb **gemessen eingestellt**: an echten Zügen, die
Fiona einmal macht — und bis die vorliegen, an absichtlich krummen Zügen,
die das Tor selbst erzeugt. Die Zahl kommt aus der Messung, nicht aus mir.

**W-C · Punkte beim Elternvergleich: fehlerfrei beim ersten Versuch, Zeit
daneben.**
Keine neue Größe. `glatt` wird bereits gezählt, die Zeit ebenfalls.

*Was das heißt:* der Vergleich gilt sofort für **alle** Ebenen, auch für die,
die es noch nicht gibt, und keine Zahl steht an zwei Stellen. Was er nicht
kann: knapp geschafft und mühsam geschafft unterscheiden. Wenn euch das
fehlt, ist das später eine eigene, kleine Entscheidung — keine, die N1
aufhält.

**W-D · Das Schreibspiel ist eine dritte Welt, und nur Fiona sieht sie.**

*Was das heißt:* die Weltenwahl trägt heute zwei Karten und ist auf
844 × 390 gemessen eng — als zwei Weltenköpfe auf einen Bildschirm sollten,
fand `passt` **14 Überläufe**. Eine dritte Karte ist deshalb kein Zusatz,
sondern ein Umbau dieses Bildschirms, und er gehört in N2a hinein statt
hinterher. Für Lea und euch bleibt die Weltenwahl bei zwei Karten: der
Bildschirm sieht je nach Profil verschieden aus, und das muss `passt` in
**beiden** Fassungen sehen.

---

## Q3 erledigt: weicher Kartenrand und Grönland

**Der Mittelamerika-Ausschnitt.** Erledigt, aber anders als angekündigt. Ich
hatte einen fehlenden Bezugsrahmen vermutet; die Aufnahme zeigt, dass er da
ist (Mexiko, Yucatán, Florida, Kolumbien). Falsch aussah der **Rand** der
grauen Umgebung: eine gerade Maskenkante, die keine Küste ist. Sie blendet
jetzt über die äußeren zehn Prozent aus, auf **allen** Karten und nicht nur
auf dieser. Gemessen: Mittelamerika von 22 auf 5, Afrika und Nordamerika von
22 auf 4. Tor `ziehen --nur=rand`, mit stehender Gegenprobe.

**Grönland.** Erledigt, als viertes Ziel Nordamerikas auf Rang 4 — also für
Lea und euch, nicht für Fiona, deren drei Länder unverändert bleiben. Neue
Aufnahme `quer-nordamerika` als Zeuge.

### Was dabei offen blieb

- **Das Randtor beweist auf zwei von sechs Karten nichts.** Asien und
  Südamerika messen mit und ohne Blende dasselbe: ihre Umgebung kommt dem
  Rahmen nicht nahe genug. Kein Fehler, aber es steht im Tor, damit niemand
  die sechs grünen Zeilen für sechs Beweise hält.
- **Die Kachelzeile der Ebenenwahl.** Nordamerika hat jetzt vier Ziele statt
  drei; an der Zahl der Kacheln ändert das nichts. Die Grenze der
  Kachelzeile ist damit weiter ungemessen — sie steht seit A6 auf der Liste.


---

## Q12 offen: Fionas Erdkunde-Runde ist halb so lang wie alles andere

Gemessen in Q12 über 47 Ebene-Profil-Paare (`npm run spielprobe`):

| | |
|---|---|
| Fiona, alle sieben Länderebenen | **3 statt 6** Aufgaben |
| Fiona, Kontinente in Runde 1 | 4 statt 6 |
| Fiona, Rechnen · Schreiben · Bundesländer | 6, wie in der Tabelle |

Die Mechanik ist in Ordnung: gedeckelt, nicht mit Wiederholungen aufgefüllt,
und das ist jetzt bezeugt. Was nicht stimmt, sind die beiden Zahlen in der
Profiltabelle. Drei Wege, und alle drei sind Inhalt, nicht Technik:

1. **Ländertiefe 3 → 6.** Sechs Länder je Kontinent für eine Sechsjährige.
   Die Namen dafür stehen alle schon da (Ozeanien hat nur drei — dort bliebe
   es bei drei).
2. **Sitzungslänge auf Länderebenen bei 3 lassen** und die Tabelle ehrlich
   machen: eine kurze Runde ist für ein Kind, das noch nicht liest, kein
   Mangel.
3. **Lassen, wie es ist**, und die Zahl 6 als Obergrenze lesen.

Entschieden wird das am Gerät, nicht hier.

**Ozeanien bleibt bei drei Zielen.** Der Grund steht in Q12 im STAND und im
Quelltext: das kleinste Ziel der App ist El Salvador mit 1,71 Quadratgrad an
einem Stück, und von den vier Kandidaten (Salomonen, Neukaledonien, Fidschi,
Vanuatu) kommt allein Neukaledonien in die Nähe — ein Überseegebiet, kein Land,
nach dem hier gefragt wird.


---

## Q13 erledigt (Q27): die Kachelwand fasst zwölf

**Gelöst in Q27 auf Weg 1**, aber nicht mit der Zahl, die hier stand: die
Kachel ist ab elf Ebenen ein **Sechstel der Wand** breit statt fester 108
Punkte. Auf dem Zielgerät sind das 130, auf dem kleinsten Gerät 100 — ein
fester Wert hätte auf einem der drei Geräte danebengelegen. Gemessen trägt die
Wand jetzt zwölf Kacheln auf allen drei Telefonformaten (vorher zehn).

Der Preis ist der, der unten steht: zwei Namen brechen um. Nachgesehen im
Bildschirmfoto und für tragbar befunden — es betrifft Namen ab zwölf Zeichen
und erst ab der elften Ebene. Der Rest dieses Eintrags ist der Befund, wie er
gemessen war.

---

### Der ursprüngliche Befund

Gemessen auf dem Zielgerät (844 × 390, mit und ohne Leiste):

| | |
|---|---|
| Ebenen für Fiona | 10 — passen |
| Ebenen für Lea und die Eltern | **11** — die elfte endet bei y = 470 bzw. 491 |
| Fenster | 390 Punkte hoch, `overflow:visible`, kein Scrollen |

**„Hauptstädte Europa" ist für Lea und euch auf dem iPhone quer nicht zu
erreichen.** Kein Tor hat es gesagt: `passt` fährt die Ebenenwahl mit dem
Standardprofil, und das hat zehn.

Dazu kommt: **zwei Kacheln heißen beide „Hauptstädte"** (Deutschland und
Europa). Die Überzeile, die sie unterscheidet, ist in der Ebenenwahl
ausgeblendet — sie stand bis R2 oben in der Kachel, dort liegt jetzt das Bild.

Drei Wege, und alle drei kosten etwas:

1. **Schmalere Kacheln.** Bei 108 statt 134 Punkten passen alle elf in zwei
   Reihen zu sechs (gemessen: Unterkante 369 von 378). Preis: vier Namen
   brechen um — „Nordamerik/a", „Mittelameri/ka", „Bundesländ/er",
   „Hauptstädt/e". Mit einer Schriftstufe weniger wäre das zu heilen, dann ist
   der Name aber auf dem Zielgerät so groß wie eine Fußzeile.
2. **Niedrigere Kacheln, drei Reihen.** Braucht 92 Punkte weniger auf drei
   Reihen, also 112 → 81 Punkte Kachelhöhe. Das Kachelbild fiele von 50 auf
   19 Punkte — es ist für Fiona der Name.
3. **Weniger Kacheln.** „Hauptstädte Deutschland" und „Hauptstädte Europa" in
   EINE Kachel legen, die beim Antippen fragt wohin. Löst beide Befunde auf
   einmal (elf werden zehn, und der doppelte Name verschwindet), kostet aber
   einen Tipp mehr.

Was `passt` noch nicht kann: es fährt die Ebenenwahl nur mit dem Standardprofil.
Wer das repariert, trägt Leas Ebenenwahl in die Bildschirmliste nach — sonst
bleibt derselbe Befund beim nächsten Mal wieder ungesehen.


---

## Q16 erledigt (Q18): das Auge liegt nicht mehr auf dem Namen

**Gelöst in Q18 auf Weg 2:** auf dem Telefon entfällt das Auge. Was hier steht,
ist der Befund, wie er gemessen war — und die drei Wege, damit der nächste, der
an der Kachel baut, nicht wieder von vorne rechnet.

Gemessen auf 844 × 390 mit Leiste, Leas Ebenenwahl:

| | Kachel | Trefferfläche des Auges liegt über dem Namen |
|---|---|---|
| Kontinente | 134 × 112 | **22 × 13 px** |
| Europa | 134 × 112 | 6 × 13 px |
| Afrika | 134 × 112 | 3 × 13 px |
| iPad quer | 240 × 112 | — |

Ein Kind, das auf das Ende von „Kontinente" tippt, öffnet die **Vorschau**
statt die Ebene. Auf dem iPad passiert das nicht: dort ist die Kachel 240 statt
134 Punkte breit.

Rechnen lässt es sich nicht wegdiskutieren: die Kachel ist 134 × 112, das Auge
muss 44 × 44 messen (Fingergrenze), und der Name steht zentriert über die volle
Breite. Ein zweiter Knopf in einer Kachel dieser Größe hat keinen Platz, der
nicht schon vergeben ist.

Drei Wege — und alle drei hängen an der Wandentscheidung aus Q13:

1. **Breitere Kacheln.** Löst beides auf einmal (Leas elfte Kachel und das
   Auge), kostet aber die Reihe: bei 134 passen fünf nebeneinander.
2. **Kein Auge auf dem Telefon.** Die Vorschau erscheint beim ersten Betreten
   einer Ebene ohnehin von selbst; das Auge ist der Weg, sie noch einmal zu
   sehen. Auf dem Gerät, auf dem sie nicht hinpasst, könnte sie entfallen —
   dann ist die Kachel ein einziges, sauberes Ziel.
3. **Name links, Auge rechts** statt beide zentriert. Dann bricht
   „Mittelamerika" bei 90 Punkten Textbreite um.

**Was in Q16 schon gemacht ist:** das Auge hing 2 bis 4 Punkte über die untere
Kachelkante hinaus und sitzt jetzt drin.

**Verworfen in Q16:** dem Auge dieselbe Fläche und Kante zu geben wie jedem
anderen Knopf (Q15). Gebaut, angesehen, weggeworfen — auf einer 112 Punkte
hohen Kachel ist eine gefüllte Scheibe von 44 Punkten ein Viertel der Fläche,
sie legt sich über den Namen und ragt über die Kante. Der Grund steht jetzt im
Stylesheet, damit es niemand ein zweites Mal versucht.


---

## Q13/Q16 erledigt: die Wand trägt wieder

Beides gelöst durch die Zusammenlegung der beiden „Hauptstädte"-Ebenen (Q17):
Lea hat zehn statt elf Kacheln, und der doppelte Name ist weg.

**Das Auge lag danach weiter auf dem Namen.** Die Zusammenlegung nimmt eine
Kachel weg, sie macht die übrigen aber nicht breiter — bei zehn Kacheln sind es
weiterhin fünf je Reihe zu 134 Punkten. Geschlossen ist das erst in **Q18**,
und zwar auf Weg 2: auf dem Telefon entfällt das Auge ganz.

---

## Q18 erledigt (Q20): auf dem Telefon gibt es das zweite Anschauen wieder

**Gelöst auf Weg 2** — dem, von dem hier steht, er sei „der Ort, an dem ein
Kind danach suchen würde": ein Auge oben rechts im Forscherbuch. Der
Rauchtest fährt die ganze Schleife (hin in den Vorlauf, dort stehen Karten,
„Zurück" führt ins **Buch** und nicht in die Ebenenwahl), und zwei
Gegenproben halten sie fest.

Der Eintrag stand seither als „offen" da — nachgesehen in Q31. Was folgt,
ist der Befund, wie er gemessen war.

---

### Der ursprüngliche Befund

Mit dem Auge (Q18) ist auf dem Telefon der einzige Weg weggefallen, den Vorlauf
einer Ebene **noch einmal** zu sehen. Beim ersten Betreten erscheint er weiter
von selbst; danach nicht mehr, und `Einst.vorlaufGezeigt` wird nie
zurückgesetzt.

Auf dem iPad und im Schreibtischfenster ist das Auge da — der Verlust trifft
genau das Zielgerät.

Was dagegen spräche, es einfach wieder hinzustellen, steht in Q16: gerechnet
passt kein zweiter 44-Punkt-Knopf in eine Kachel von 134 × 112.

Drei Ideen, keine gemessen:

1. **Im Vorlauf selbst.** Am Ende der Runde steht ohnehin ein Bildschirm mit
   drei Karten („Als Nächstes"). Von dort in den ganzen Vorlauf zu kommen wäre
   ein Knopf an einer Stelle, an der Platz ist.
2. **Im Forscherbuch.** Dort liegen die gesammelten Aufkleber je Ebene. Ein
   „alle ansehen" gehört inhaltlich dorthin — und der Bildschirm ist nicht eng.
3. **Im Elternbereich zurücksetzen.** Billigste Fassung, aber die falsche:
   ein Kind, das noch einmal blättern will, fragt dann einen Erwachsenen.

Nummer 1 ist der Vorschlag; Nummer 2 der Ort, an dem ein Kind danach suchen
würde. Beides ist zu messen, bevor es gebaut wird — auf 844 × 390 mit Leiste ist
noch kein Bildschirm groß.

---

## Q20 gemessen und verworfen: breitere Kacheln gibt es nicht

Der Vorschlag lautete: jetzt, wo das Auge weg ist, vier breitere Kacheln je
Reihe statt fünf — dann würde das Bild größer, und Fiona liest das Bild.

**Er ist schon arithmetisch falsch.** Es sind zehn Kacheln. Vier je Reihe sind
drei Reihen, nicht zwei. Fünf je Reihe ist keine Wahl, sondern eine Folge der
Kachelzahl.

Gemessen auf 844 × 390 (Leiste: die Anordnung ist dieselbe, der sichere Bereich
schneidet unten 21 Punkte ab):

| | |
|---|---|
| Wand | 10 Kacheln à 134 × 112 in 2 Reihen |
| Breite | 5 × 134 + 4 × 8 = **702** von 726 nutzbaren — 24 Punkte übrig |
| Höhe | Wand endet bei **357**, sicher bis 369 — **12 Punkte übrig** |
| Bild | 89 × 48, **höhenbegrenzt** (max-width wäre 110, genutzt 89) |

Die 12 Punkte reichen für 6 Punkte je Reihe, also Kachel 118 und Bild 54 — acht
Prozent mehr Bild, und der ganze Spielraum wäre aufgebraucht. Ein Browser, der
zwei Punkte anders rechnet, schiebt die zweite Reihe in den Wischstreifen. Das
ist kein Gewinn, das ist eine Wette.

### Woraus die 112 Punkte bestehen

| | |
|---|---|
| Polsterung oben + unten | 16 |
| Bild | 48 |
| Abstand | 11 |
| Name | 19 |
| Fuß (Aufkleberzahl 20 hoch, Balken 5) | 20 |

Jeder Posten außer den Abständen trägt etwas: das Bild ist für Fiona der Name,
der Name ist für Lea der Name, die Zahl sagt „wie viel habe ich", der Balken
sagt „wie weit bin ich". Das Bild hinter den Namen zu legen ist in Q8 gemessen
und verworfen worden — es kostet Kontrast (4,34 : 1 statt 4,5).

### Was übrig bleibt, falls es je wieder aufkommt

1. **Weniger Kacheln.** Der einzige Weg zu wirklich breiteren: acht statt zehn,
   dann sind vier je Reihe zwei Reihen und die Kachel wird 175 breit. Das Bild
   bliebe trotzdem 48 hoch — es hängt an der Höhe, nicht an der Breite. Also
   kein Gewinn für Fiona, nur ruhigere Kacheln.
2. **Die Frage kleiner.** Über der Wand stehen 61 Punkte für „Womit möchtest du
   anfangen?". Zehn davon wären zu holen. Sie sind aber das, was dem Kind sagt,
   was zu tun ist.
3. **Die Aufkleberzahl weg, nur der Balken bleibt.** Bild 48 → 63 (+31 %). Der
   einzige Posten mit echtem Gewinn — und der einzige, der Lea etwas wegnimmt.

Keiner der drei ist gebaut. Sie stehen hier, damit der nächste, der an der
Kachel baut, nicht wieder von vorn rechnet.


---

## Q24 offen: „Kontinentumriss" ist eine Zusage, keine Rechnung

`bauen` prüft seit Q24, dass jedes Ziel einer Ebene im Sichtfeld ihres
Kachelbildes liegt — aber nur, wo Bild und Ziele aus **derselben Karte** kommen
(`zielUmriss()`). Für die fünf Kontinentebenen kommt der Umriss aus der
**Weltkarte** und die Anker aus der **Länderkarte**: zwei Koordinatensysteme,
und ein Vergleich der Zahlen wäre keiner.

Dort ist `kontinentUmriss(id, …)` also eine **Angabe**, die der Bau glaubt. Wer
sie falsch macht — so wie Ozeanien es zwei Fassungen lang war — kommt durch.

Zwei Wege, keiner gemessen:

1. **Alle Kachelbilder aus den Zielen bauen**, wie Mittelamerika und Ozeanien es
   tun. Dann gilt die Rechnung überall. Es ändert aber das Bild von fünf
   Ebenen: „Europa" wäre nicht mehr der Kontinent, sondern die 17 Länder, nach
   denen gefragt wird. Ob das besser oder schlechter ist, entscheidet der Blick,
   nicht die Prüfbarkeit.
2. **Die Anker in die Weltkarte projizieren.** Dann ist die Rechnung auch für
   Kontinentbilder anzustellen, ohne dass sich ein Bild ändert. Kostet eine
   zweite Projektion im Bau und die Frage, ob beide wirklich dieselbe sind.

Nummer 2 ist der saubere Weg, Nummer 1 der billigere.

---

## Q25 gemessen und verworfen: die Anker in die Weltkarte projizieren

Weg 2 aus „Q24 offen" — die Anker der Ebenen in das Koordinatensystem der
Weltkarte bringen, damit der Wächter auch für Kontinentbilder rechnen kann.

**Geht mit den vorhandenen Daten nicht.** `KONTINENTE_GROB` hält nur
Kontinentumrisse, keine Länder; `KARTEN_GROB[k]` hält die Länder, aber in einer
eigenen, je Kontinent angepassten Projektion. Es gibt keinen gemeinsamen Rahmen
und keine Projektionsparameter, aus denen sich einer rechnen ließe — beide
Datensätze tragen nur projizierte Punkte, keine Längen- und Breitengrade.

Und der naheliegende Ersatz trägt nicht. Gemessen wurde, ob sich der Fall am
**Seitenverhältnis** erkennen lässt (Länderkarte gegen Kontinentumriss):

| | Verhältnis |
|---|---|
| europa | 0,74 |
| nordamerika | 0,76 |
| **australien** | **1,10** |
| asien | 1,14 |
| suedamerika | 1,16 |
| afrika | 1,26 |

Der Fall, den es zu finden gilt, liegt **mitten im Feld**. Kein Signal — und gut,
dass das vor dem Bauen gemessen wurde.

Was bliebe: beim Backen Längen- und Breitengrade mitführen, dann ist jede
Projektion nachträglich anzustellen. Das ist ein Eingriff in die
Backwerkzeuge, nicht in ein Tor.


---

## Q33 erledigt (Q33): die Lupenknöpfe liegen auf der Karte

**Gemessen in Audit A (Q32), auf allen sieben Größen.** Die drei Lupenknöpfe
sitzen absolut positioniert unten rechts **in** `.karte` und verdecken damit
das, was dort liegt:

| Größe | verdeckt |
|---|---|
| iPhone SE quer | **71,8 %** von Australien |
| iPhone hoch | 71,2 % |
| **iPhone quer, Leiste (Zielgerät)** | **70,4 %** — die Mitte des Gebiets liegt auf `#lupeMinus` |
| iPhone quer | 60,3 % |
| Fenster schmal | 42,1 % |
| iPad hoch | 19,5 % |
| iPad quer | 16,9 % |

Antworten geht trotzdem (die Umkreissuche findet das Gebiet, mit einem echten
Zug nachgeprüft). Was nicht geht, ist es zu **sehen**: „Wie heißt dieser
Kontinent?", und „dieser" liegt unter einem Knopf. Das trifft Lea genauso wie
Fiona.

**Eine andere Ecke ist keine Lösung** — alle vier gemessen, an zwei Karten:

| Knöpfe | Kontinente | Bundesländer |
|---|---|---|
| rechts unten (heute) | 70,4 % Australien | 22,8 % Bayern |
| links unten | 6,3 % Nordamerika | **99,9 % Saarland** |
| links oben | 25,5 % Nordamerika | 21,7 % Nordrhein-Westfalen |
| rechts oben | 27,0 % Asien | **100 % Berlin** |

Die freieren Ecken tauschen ein großes Gebiet gegen ein winziges, und ein
winziges ganz zu verdecken ist schlimmer. Das Problem ist nicht die Ecke,
sondern dass die Knöpfe **überhaupt auf der Karte liegen**.

**Zwei Wege, beide gemessen:**

1. **Polster rechts an `.karte`** (52 pt). Verdeckung auf jeder Größe null,
   eine Zeile CSS — und die Karte wird um **16 %** kleiner (328 × 175 →
   277 × 147 pt auf dem Zielgerät). Für Fiona, die ohnehin mit kleinen Zielen
   kämpft, ist das ein echter Preis.
2. **Die Knöpfe aus der Karte in die Werkzeugspalte.** Kostet die Karte
   nichts. Die Frage ist, ob auf 390 Punkten Höhe neben Mikrofon, Hörknopf
   und den beiden leisen Auswegen noch drei mal 44 Punkte Platz haben. Das
   entscheidet der Blick auf dem Gerät, nicht die Rechnung hier.

**Solange es offen ist, hält eine Ratsche.** `passt` misst die Verdeckung
seit Q32 und führt sie in `tor/masse-stand.json` (21 Einträge). Schlechter
darf es nicht werden.

*Warum kein Tor es je gesehen hat:* `passt` prüft seit langem, ob Schmuck
über dem Ziel liegt — aber nur, was `e.closest('.karte svg')` erfüllt. Die
Lupenknöpfe sind HTML und liegen **neben** dem svg im selben Kasten. Eine
Prüfung, die nur in die Zeichnung schaut, sieht nicht, was darüber liegt.

**Geschlossen in Q33:** Weg 2, und der Blick auf dem Gerät hat entschieden
wie. Untereinander passen sie nicht — nebeneinander schon: die drei Knöpfe
stehen in einer Zeile in der Werkzeugspalte, die dafür von 109 auf 133 Punkte
wächst; die Antwortliste gibt den Platz her (262 → 238), der Kartenkasten
bleibt Punkt für Punkt derselbe. Gemessen über alle sieben Größen:
**Verdeckung 0 %, Kartenfläche +0,0 %.**

Die Ratsche ist dabei weggefallen und durch eine Regel ersetzt: liegt ein
Bedienelement über der Karte, ist `passt` rot. Eine Ratsche sagt „nicht
schlimmer als gestern" — hier ist aber jeder Prozentpunkt falsch. Die 21
Einträge in `tor/masse-stand.json` sind gelöscht.

---

## Q34 erledigt (Q33): die App sagt alles und zeigt nichts

**Gemessen in Audit A (Q32).** Elf Stationen auf dem Zielgerät, **21
antippbare Dinge ohne jedes Signal** für ein Kind, das nicht liest — kein
Bild, keine Ziffer, keine Stimme beim Antippen. Sie stehen in Gruppen:

- **Pausenbildschirm**: alle drei Knöpfe („Weiterspielen", „Übung beenden",
  „Von vorne anfangen") — und der dritte löscht die Runde.
- **Endbildschirm**: alle drei („Noch einmal", „Forscherbuch", „Etwas
  anderes") — die Gabelung nach jeder Sitzung, und einer führt zu ihren
  Aufklebern.
- **Aufgabe**: „Weiß ich nicht" und „Lieber antippen" — ihre beiden Auswege.
- **Vorlauf**: „Jetzt starten".

Jeder dieser Bildschirme **spricht** — die Ansagen sind da und gut gebaut
(„Pause. Weiterspielen, Übung beenden, oder von vorne anfangen?"). Was fehlt,
ist die Brücke vom Satz zum Kasten: sie trägt allein die Reihenfolge, und die
trägt nur, wenn Fiona zugehört hat und sich erinnert.

**Drei Wege, keiner gemessen:**

1. **Ein Zeichen auf jeden dieser Knöpfe.** Das Buch für „Forscherbuch", der
   Pfeil für „Noch einmal", das Kreuz für „Übung beenden". Es gibt die
   Zeichenbibliothek (`ZEI`) schon; es sind rund zehn Knöpfe.
2. **`data-lesen` auf jeden Knopf**, so wie es die Aufkleber und Albumkarten
   längst tragen: antippen sagt, was er tut, bevor er es tut. Das ist billig
   und passt zur bestehenden Mechanik — aber es setzt voraus, dass ein
   antippbarer Knopf beim ersten Antippen **nicht auslöst**, und das ist eine
   Änderung an der Bedienung, keine an der Gestaltung.
3. **Beides**, mit dem Zeichen als Hauptsache und der Stimme als Zugabe.

Nummer 1 ist der Weg, der nichts an der Bedienung ändert.

**Geschlossen in Q33:** Weg 1. Zeichen tragen jetzt Weiterspielen, Übung
beenden, Von vorne anfangen, Weiß ich nicht, Jetzt starten, Überspringen und
Forscherbuch. `#weise` bleibt bewusst ohne — seine Aufschrift wechselt
zwischen „Lieber antippen" und „Lieber ziehen", ein festes Zeichen wäre dort
die Hälfte der Zeit falsch.

---

## Q35 erledigt (Q35): kein Tor sieht ein gefülltes Forscherbuch

**Gefunden in Q32 beim Schreiben einer Gegenprobe.** `passt` geht das
Forscherbuch an — und sieht dort **null Aufkleber und eine Albumkarte**. Sein
Durchgang löst die Rechenaufgaben mit „Weiß ich nicht" und sammelt deshalb
nichts. Genau der Kasten, in dem Audit A einen abgeschnittenen Text gefunden
hat, kommt in `passt` also gar nicht vor.

`smoke` spielt ganze Sitzungen und erreicht ein gefülltes Buch — es zählt
dort Aufkleber und Fragezeichen —, misst aber keine Maße. Die beiden Tore
teilen sich die Arbeit so, dass die **gefüllte Aufkleberwand** zwischen ihnen
durchfällt: das eine sieht sie und misst nicht, das andere misst und sieht
sie nicht.

Zwei Wege:

1. **`passt` sammelt Aufkleber.** Ein paar richtige Antworten statt „Weiß ich
   nicht" in Fionas Rechenebene, und das Buch ist voll. Kostet Laufzeit im
   längsten Tor der Kette.
2. **Die Maßprüfungen wandern in einen gemeinsamen Baustein**, den `passt`
   und `smoke` beide aufrufen — so wie `fremdgriff` und `teilen` es schon
   sind. Dann misst `smoke` die Kästen dort, wo es ohnehin steht.

Nummer 2 ist der saubere Weg und passt zu dem, was hier schon gebaut ist.


---

## Q36 erledigt (Q32): die Gruppierung war von keinem Tor mehr bewacht

Zwei Ebenen teilen sich seit Q17 eine Kachel („Hauptstädte"). Bewiesen wurde
das über eine **Nebenwirkung**: ohne Gruppierung standen elf Kacheln da, und
die elfte lief aus dem Bild — `passt` wurde rot.

Q31 hat die Nebenwirkung beseitigt (die Wand wird ab elf Ebenen ein Sechstel
breit, zwölf passen), und damit die Prüfung gleich mit. **Dreiunddreißig
Fassungen lang** bewies die Gegenprobe nichts mehr, ohne dass etwas rot wurde.
`smoke` fing es ebenfalls nicht: seine Zählung geht seit Q17 ausdrücklich
*hinter* die Gruppenkacheln und ist dadurch blind dafür, dass keine mehr da
ist.

**Geschlossen in Q32:** `smoke` prüft die Sache statt der Nebenwirkung — steht
eine gruppierte Ebene mit mehr als einer eigenen Kachel offen auf der Wand,
wird es rot. Das Soll (`GRUPPIERT = ['hauptstaedte']`) steht ausgeschrieben
im Tor, nicht aus der Kennung abgeleitet: der erste Anlauf las den Stamm vor
dem Doppelpunkt und wurde am **gesunden** Spiel rot, weil `rechnen:plusminus`,
`rechnen:reihen` und `rechnen:gross` denselben Stamm teilen und keine Gruppe
sind. Eine Regel, die sich ihre Erwartung aus der Schreibweise holt, misst die
Schreibweise.

**Die Lehre, die bleibt:** eine Gegenprobe, die auf eine *Nebenwirkung* zeigt,
verfällt, sobald jemand die Nebenwirkung repariert — und zwar lautlos. Wer
eine Zusage prüft, prüft sie an der Sache.


---

## Q37 erledigt (Q33): eine Zahl, die die Maschine misst

`smoke` prüft, dass `?flott` den Kartenweg mindestens **1,5×** kürzt. In der
vollen Kette (acht Browser nebeneinander auf vier Kernen) wurde daraus einmal
**1,42×** und das Tor rot. Allein gefahren, auf ruhiger Maschine: **1,8×** für
die Karte, **2,4×** fürs Rechnen.

Die App hat sich nicht geändert. Unter Last wird die kurze Pause relativ
teurer als die lange, und das Verhältnis fällt. Nach Regel 5 trägt jede Zahl
ihre Messstelle mit — diese hier hat keine: sie hängt an der Zahl der Kerne
und der Nachbarläufe.

Es als „Flattern" abzutun wäre falsch. Der Befund ist, dass ein **Verhältnis
zweier Wartezeiten** unter Last kein Maß für einen Schalter ist.

Zwei Wege:

1. **Nicht das Verhältnis messen, sondern den Schalter**: `?flott` setzt eine
   Pause auf einen festen kleinen Wert. Prüfbar ist, dass die App diesen Wert
   auch benutzt — an der Marke, nicht an der Stoppuhr. Das ist unabhängig von
   der Last und beweist genau das, was die Zusage sagt.
2. **Den Abschnitt aus dem Nebeneinander nehmen**, damit er allein misst.
   Billiger, aber es bleibt eine Stoppuhr — und die nächste schnellere oder
   langsamere Maschine verschiebt die Grenze wieder.

Nummer 1 ist der Weg. Die Zeitmessung selbst bleibt im Bericht stehen, sie ist
als *Auskunft* nützlich — nur nicht als Tor.

**Geschlossen in Q33:** Weg 1. `smoke` fängt `window.setTimeout` ab und liest
die **angeforderte** Pause statt der vergangenen Zeit. Übrig ist eine einzige
Zahl, `LESEZEIT_MIN = 1200`, und drei Ja/Nein-Aussagen daran: es wird
überhaupt eine Pause angefordert · im normalen Lauf ist sie mindestens so
lang · mit `?flott` ist sie kürzer. `KUERZER_UM` ist ersatzlos weg, die
Stoppuhr steht nur noch als Auskunft im Bericht.


---

## Q38 erledigt (Q33): die Blindprobe unter der Randmessung stand auf den Lupenknöpfen

Aufgefallen, weil `ziehen` nach Q33 rot wurde: die Flächenmessung der
Umgebung fiel von 217 auf 22, auf Südamerika auf 9.

Die 217 waren nie die Umgebung, sondern die dunkle Kante der drei
Lupenknöpfe, die im aufgenommenen Kartenausschnitt lagen — deshalb stand auf
**allen sieben Karten derselbe Wert**, und die Blindprobe („kein Grau in der
Fläche, dann beweist die Null am Rand nichts", Schwelle 20) konnte
dreiunddreißig Fassungen lang nicht anschlagen.

Sie fragt jetzt nach der Fläche, die Grau trägt — mit ausgeblendeter Umgebung
glatt 0,00 % auf allen sieben Karten, mit ihr 0,02 bis 23,37 %. Dazu eine
zweite Zeile, die zählt, wie viele Karten die Zusage überhaupt auf die Probe
stellen (ein Drittel, mindestens zwei; heute fünf von sieben). Zwei
Gegenproben nachgetragen.

Die Randwerte selbst waren nicht betroffen, die Eichung des Deckels gilt
unverändert.


---

## Q39 halb erledigt (Q34): der nächtliche Probenlauf war noch nie grün

Nachgesehen beim Prüfen der Auslieferung (Q33). Der Arbeitsablauf
**Gegenproben** (`proben.yml`, jede Nacht 02:00 UTC) ist **fünfmal gelaufen
und fünfmal rot** — seit es ihn gibt, am 29.08. Gemeldet wird das nur als
Warnung im Protokoll, und die sieht niemand.

Der letzte Lauf (02.09., af28aba): **210 schlagen an, 21 beweisen nichts,
0 kamen nicht an.** Die 21 zerfallen in drei Gruppen:

| Anzahl | Tor | Was das Protokoll sagt |
|---|---|---|
| 12 | `ansicht` | „ist schon OHNE Eingriff rot" |
| 8 | `smoke` | „ist schon OHNE Eingriff rot" — alle acht sind Farbmessungen (Streu, Profiltöne, Schildkröten, Totenköpfe) |
| 1 | `ziehen` | „bleibt grün, obwohl der Fehler drin ist" (zwei Nadelköpfe rücken enger zusammen) |

**Die ersten zwölf sind eine Sache, und es ist Regel 16.** Die Auslieferung
fährt `npm run tor:runner`, also `SMARTKIDS_OHNE_ANSICHT=1` — dort ist
`ansicht` ausdrücklich abgeschaltet, weil die Vorbilder auf diesem Rechner
entstehen und der Runner anders rastert. `npm run proben` kennt diesen
Schalter nicht und fährt `ansicht` mit. Jede Probe, die `ansicht` auslöst,
findet es **vor** ihrem Eingriff schon rot und meldet zu Recht „beweist
nichts".

> **Nachgetragen nach dem Lauf vom 03.09.:** hier stand „die ersten zwanzig",
> und die acht Farbproben in `smoke` waren mitgezählt. Das war falsch. Sie
> haben mit dem Runner nichts zu tun — siehe Q39b. Ich hatte zwei Gruppen
> zusammengeworfen, weil sie in derselben Spalte standen.

Das heißt: **die Auslieferung ist grün, weil sie wegsieht — und der
Probenlauf ist rot, weil er hinsieht.** Beides beschreibt dieselbe Lücke.

Drei Wege:

1. **`npm run proben` auf dem Runner denselben Schalter geben**
   (`SMARTKIDS_OHNE_ANSICHT=1`) und die 20 Proben dort ausdrücklich
   **auslassen** statt sie scheitern zu lassen. Ehrlich, billig — und es
   schreibt fest, dass zwanzig Nachweise nur auf diesem Rechner entstehen.
2. **Die Vorbilder auf dem Runner backen** statt hier. Dann prüft der Runner
   wirklich, und dieser Rechner bekommt die Abweichung zu sehen. Das ist der
   saubere Weg und der teure: 37 Aufnahmen, und die Sichtprüfung wandert von
   „ich sehe das Bild" zu „ich lade ein Artefakt herunter".
3. **Denselben Chromium erzwingen** (Version festnageln, Schriftpaket
   gleichziehen) und hoffen, dass die Rasterung dann übereinstimmt. Das ist
   genau die Wette, die Regel 16 schon einmal verloren hat.

Nummer 1 sofort, damit der nächtliche Lauf endlich etwas aussagt; Nummer 2
als eigene Runde.

**Der eine Befund, der davon unabhängig ist, ist der dritte:** „zwei
Nadelköpfe rücken enger zusammen als bestätigt" — `ziehen` bleibt grün,
obwohl der Fehler drin ist. Das ist keine Umgebungsfrage, sondern ein Tor,
das an dieser Stelle nichts beweist. Hier reicht `SMARTKIDS_OHNE_ANSICHT`
nicht; das ist Handarbeit.

**Geschlossen in Q34: Weg 1, und ein Stück mehr.**

`npm run proben` kennt jetzt den Unterschied zwischen „beweist nichts" und
**„hier nicht zu beweisen"**. Steht `SMARTKIDS_OHNE_ANSICHT=1` in der
Umgebung, werden die zwölf `ansicht`-Proben *ausgelassen*: beim Namen
genannt, getrennt gezählt — und **ohne Nachweis**. Sie altern also weiter,
und `rhythmus` macht sie fällig; sein Befund sagt seit dieser Runde auch
dazu, wo sie zu fahren sind (`npm run proben -- ansicht`, auf dem
Arbeitsrechner). Ausgelassen heißt nicht erlassen.

Darunter eine Schranke, damit der Auslass nicht zum Ausschalter wird: greift
er im vollen Lauf auf mehr als **ein Fünftel** aller Proben, ist das ein
Befund. Heute sind es 12 von 269.

**Und die neun übrigen sagen ab jetzt, warum.** „War schon vorher rot" stand
bisher ohne den Grund im Protokoll — der Grund war nur mit `--laut` zu
haben, und den nächtlichen Lauf startet niemand eben noch einmal. Die
Ausgabe des **gesunden** Laufs steht jetzt immer darunter, bei jedem blinden
Urteil. Was `smoke --nur=streu` auf dem Runner bemängelt, sagt uns die
nächste Nacht, statt dass ich es hier rate.

Der Umbau hat gleich eine Falle mit aufgedeckt, die nur auftritt, wenn
`proben` sich selbst fährt: `node_modules` ist in der Wegwerf-Kopie ein
**Zeiger**, `.gitignore` hält aber nur `node_modules/` — ein Verzeichnis.
Git meldete den Zeiger als unbekannt, `statSync` folgte ihm, und das
Werkzeug kopierte ihn auf sich selbst (`ERR_FS_CP_EINVAL`). Zeiger werden
jetzt übersprungen.

**Offen bleibt Q39b:** die acht Farbproben in `smoke` und die eine in
`ziehen`. Sie sind erst zu beurteilen, wenn der nächste nächtliche Lauf
seine Begründung mitliefert.


---

## Q39b erledigt (Q39b): eine Prüfung in `smoke`, die jeden Ausschnitt rot macht

**Gemessen am Lauf vom 03.09. (Nr. 6, von Hand angestoßen auf `22332de`) und
hier nachgestellt.** Von 21 Befunden sind 14 geblieben — und zehn davon haben
**eine** Ursache, die mit dem Runner nichts zu tun hat.

`smoke` prüft am Ende, ob der **Fremdgriff** überhaupt zum Zug kam:

```
✗ Der Fremdgriff hat keinen einzigen ruhenden Bildschirm gesehen —
  dann beweist „nichts gefunden" nichts (Regel 1)
```

Das ist eine richtige Prüfung mit einem falschen Geltungsbereich. Sie zählt,
was der ganze Lauf gesehen hat — und wird auch dann gestellt, wenn der Lauf
gar nicht der ganze war. `npm run smoke -- --nur=streu` kommt an keinem
ruhenden Bildschirm vorbei, also ist das Tor rot, **auf jeder Maschine**:

```
Fremdgriff geprüft:   0 ruhende Bildschirme (keine), 0 in Bewegung übersprungen
```

Nachgestellt auf dem Arbeitsrechner, nicht vermutet — dort steht dieselbe
Zeile.

**Was das gekostet hat:** zehn Gegenproben, die einen Abschnitt einzeln
fahren (acht um den Streu, `der Fehlgriff auf der Karte wird nicht mehr
benannt`, `der Hinweis zeigt in die falsche Richtung`), beweisen seitdem
nichts. Sie melden es auch brav — nur stand der Grund bis Q34 nicht im
Protokoll, und deshalb hat ihn fünf Nächte lang niemand gelesen. Die Torkette
blieb grün, weil sie `smoke` in vier Teilen fährt und jeder Teil mehrere
Abschnitte enthält.

Die Prüfung direkt darunter macht es schon richtig:

```js
else if (!griffStand.arten.aufgabe && laeuft('spielen'))
```

— sie fragt erst, ob der Abschnitt überhaupt lief. Der ersten fehlt genau
dieser Zusatz.

**Zwei Wege.** Der Unterschied zwischen ihnen ist Regel 1: eine Prüfung,
die nie etwas meldet, ist kein Beweis — und das gilt auch für die
Nachfrage, ob sie überhaupt zum Zug kam.

1. **Aus dem Gesehenen ableiten:** `geprueft === 0` ist nur dann ein Befund,
   wenn der Lauf überhaupt Bildschirme zum Ruhen hatte — also wenn
   `uebersprungen > 0`. Braucht keine Liste. Das Loch: bricht der Beobachter
   selbst, stehen beide auf null und nichts schlägt an.
2. **Den Abschnitt nennen**, wie die Prüfung darunter es tut. Dafür muss
   erst **gemessen** werden, welche der vierzehn Abschnitte überhaupt einen
   ruhenden Bildschirm erzeugen — je Abschnitt einmal `--nur=<name>` und die
   Fremdgriff-Zeile ablesen. Eine Liste, die man errät, ist die falsche.

Nummer 2, und die Messung gehört davor.

**Die vier übrigen sind eine eigene Sache** und jede für sich: `smoke` /
„das Buch rollt wieder beim zweiten Aufkleber", `lesbarkeit` / „die Deckung
der Vorfahren zählt beim Kontrast nicht", `passt` / „bei elf Kacheln bricht
der Name wieder auf einen Buchstaben", `ziehen` / „zwei Nadelköpfe rücken
enger zusammen als bestätigt". Alle vier melden **TOR BLEIBT GRÜN** — das Tor
lässt den eingebauten Fehler durch. Das ist der schwerste der drei Befundtypen
und nichts an der Umgebung.

**Und einer ist neu:** „Ein Teillauf hat kein Ergebnis hinterlassen
(`.probenbaum-2.json`)". Ein Arbeiter ist abgestürzt, seine Proben sind
ungeprüft. Ob das an der neuen Gegenprobe liegt, die `proben` selbst fährt
(sie legt eine Wegwerf-Kopie **in** einer Wegwerf-Kopie an), ist die erste
Frage — und die Antwort steht im Protokoll des nächsten Laufs, weil blinde
Urteile ihre Ausgabe jetzt mitbringen.

**Geschlossen in Q39b:** Weg 2, aber ohne Liste — die Messung hat den
zweiten Weg gleich mit widerlegt. `tippen`, `regler` und `hinweis` bringen je
EINEN ruhenden Bildschirm, und auf dem Runner mit sechs Arbeitern null: eine
Regel je Abschnitt hinge an der Zahl der freien Kerne. Entschieden wird jetzt
nach der Herkunft des Ausschnitts (voller Lauf und `--teil` tragen die
Zusage, `--nur` nicht). Alle zehn Proben schlagen wieder an.

**Geschlossen in Q35** (das Forscherbuch): der Rauchtest pflanzt jetzt auch
eine halbe Rechenebene — eine Ebene ohne Landkarte zeigt einzelne Kleber, und
erst damit ist das Buch gefüllt. Drei Blindproben nachgetragen (mindestens
drei Karten, mindestens eine blasse, und gemessen wird erst nach der
Überblendung). Die Messung hat sofort einen echten Fehler gefunden: das Buch
war 794 Punkte hoch in 318 sichtbaren, weil ein `display:none`-Kopf die
Rasterplatzierung verschob. 794 → 341, nichts steht mehr unsichtbar unter
der Kante.


---

## Q39c erledigt (Q35): die vier „TOR BLEIBT GRÜN"

Alle vier geschlossen, jede mit einer eigenen Ursache — und keine davon war
eine schlecht geschriebene Probe:

| Probe | Tor | Ursache |
|---|---|---|
| das Buch rollt beim zweiten Aufkleber | `smoke` | das Buch war nie gefüllt (Q35); dazu drehte der Eingriff an `svg`-Höhen, und ein Rechenkleber hat kein `svg` |
| die Deckung der Vorfahren | `lesbarkeit` | frisches Profil, leeres Buch — der offene Aufkleber wurde nie gezeichnet |
| bei elf Kacheln bricht der Name | `passt` | schlägt wieder an, ohne Zutun |
| zwei Nadelköpfe rücken enger zusammen | `ziehen` | der Eingriff hing an einer Messung von damals (90 über 78,2); der Abstand ist auf 100,3 gewachsen |

Der Nadelkopf-Fall ist der lehrreichste: **eine Gegenprobe, deren Eingriff an
einer vergangenen Messung hängt, verfällt mit jeder Verbesserung.** Der
Eingriff steht jetzt auf 200 Punkten — mehr als die halbe Kartenbreite,
darüber kann kein Kopfabstand liegen.

Und der Kontrast-Fall hat einen echten Befund mitgebracht: die blassen
Vorschaukleber standen bei 2,22 : 1 statt 3 : 1.

**Offen bleibt aus dieser Ecke nichts mehr** — außer dem, was der nächste
nächtliche Lauf zeigt.


---

## Q39d erledigt (Q39d): eine Probe, die hier anschlägt und dort nicht

**Der Stand nach dieser Runde, gemessen am Lauf vom 03.09. (Nr. 7 auf
`8ef3e6c`):**

| Lauf | Befunde |
|---|---|
| Nr. 5, 02.09. (`af28aba`) | 21 |
| Nr. 6, nach Q34 (`22332de`) | 14 |
| Nr. 7, nach Q35/Q39b/Q39c (`8ef3e6c`) | **1** |

`253 schlagen an, 1 beweisen nichts, 0 kamen nicht an, 12 ausgelassen.`

Der eine, der bleibt: **„bei elf Kacheln bricht der Name wieder auf einen
Buchstaben"** — `passt` bleibt auf dem Runner grün, obwohl der Fehler drin
ist. **Auf diesem Rechner schlägt dieselbe Probe an** (nachgemessen in
dieser Runde). Sie ist damit weder kaputt noch tot, sondern
umgebungsabhängig — und das ist genau die Sorte Befund, die man nicht raten
darf.

Was zu klären ist, in dieser Reihenfolge:

1. **Woran hängt der Umbruch?** Der Eingriff nimmt `padding` und
   `letter-spacing` für elf Kacheln heraus; ob daraus ein einzelner
   Buchstabe wird, entscheidet die Schriftmetrik. `passt` prüft mit
   `schriftDa`, dass die eigene Schrift geladen ist — aber nicht, dass sie
   *dieselbe* ist wie hier.
2. **Oder hängt es am Zustand?** Elf Kacheln setzen elf offene Ebenen
   voraus. Steht auf dem Runner ein anderes Profil, gibt es die elfte
   Kachel nicht, und dann prüft die Probe eine Wand, die es nicht gibt.

Nummer 2 ist billiger zu prüfen und deshalb zuerst: der Lauf müsste sagen,
wie viele Kacheln er gesehen hat. Sagt er es nicht, ist das der erste
Befund.

**Geschlossen in Q39d — und keine der beiden Vermutungen stimmte.** Der
Grund stand längst im Tor: `passt` überspringt seine Waisenmessung bei
`SMARTKIDS_OHNE_ANSICHT` **ausdrücklich und mit Ansage**, weil sie eine
Schriftmessung ist (Regel 16). Seit Q39a diesen Schalter für den nächtlichen
Lauf setzt, konnte die Gegenprobe dort nicht mehr anschlagen — sie fiel in
dieselbe Falle wie die zwölf `ansicht`-Proben, nur in einem anderen Tor.

Aufgefallen ist es erst, **nachdem** Q39a die zwölf offensichtlichen Fälle
weggeräumt hatte. Der eine, der übrig blieb, war derselbe Fall im Schatten
der anderen.

Eine Probe sagt es jetzt selbst: `nurMitAnsicht: true`. `proben` lässt sie
dort aus, `rhythmus` zählt sie zu den Nachweisen, die nur hier entstehen.


---

## Q39e erledigt (Q39e): dreizehn Nachweise, die nur ein Rechner erneuern kann

Nach Q39a und Q39d gibt es **dreizehn** Gegenproben, die der nächtliche Lauf
auslässt: zwölf an `ansicht`, eine an der Schriftmessung in `passt`. Sie
bekommen dort keinen Nachweis, altern also weiter — und nach drei Tagen wäre
der Lauf rot für etwas, das er nicht abstellen kann. **Genau das Rot, das
man wegerklären muss**, und nach dem dritten Mal liest es niemand mehr.

Zwei Hälften, und beide sind nötig:

1. **Auf dem Runner werden sie genannt, nicht angemahnt.** `rhythmus` weiß
   jetzt, wo es läuft. Die Namen stehen mit ihrem Alter im Protokoll —
   „ausgenommen" heißt nicht „unsichtbar" —, und der grüne Schlusssatz sagt
   dazu, dass er sie ausgenommen hat. Ein grüner Satz, der mehr behauptet
   als der Lauf geprüft hat, ist die stillste Art, ein Tor abzuschalten.
2. **`rhythmus` steht wieder vorn in der Kette.** Sonst stellte die Frist
   für diese dreizehn **niemand** — der Runner darf nicht, und hier lief es
   nicht. Der Grund für den Auszug ist weg: es zählte damals in *Runden am
   Code* und stand nach einer Sitzung auf 47 Runden Rückstand; seit dem
   Umbau zählt es in **Tagen** und kostet Millisekunden.

Darunter dieselbe Schranke wie in `proben`: greift die Ausnahme auf mehr als
ein Fünftel aller Nachweise, ist das ein Befund. Heute sind es dreizehn von
270.

**Gemessen, beide Richtungen** (ein Nachweis künstlich auf 33 Tage gesetzt):
auf dem Arbeitsrechner ein harter Befund mit dem Befehl, der ihn abstellt;
mit dem Schalter eine Zeile im Protokoll und ein grüner Lauf.

