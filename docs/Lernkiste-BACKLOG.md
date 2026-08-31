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
| Ländertiefe | 3 | 5 | **12** | **12** |
| Aufgaben je Sitzung | 6 | 8 | **12** | **12** |
| streng | nein | ja | ja | ja |

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
| 1 | **M4r** Sprechen auf dem iPhone, ein Mal wirklich | Fiona | hoch | mittel | ihr, einmal |
| 2 | **N2b** Der Klassifikator als Auffangnetz | Fiona | mittel | mittel | echte Züge |
| 3 | **A4** „Heute schon geübt" | alle | mittel | klein | — |
| 4 | **D3** Ein Satz zum Mitnehmen | Fiona, Lea | mittel | groß | 63 Sätze |
| 5 | **D1** Ein Begleiter | Fiona | mittel | groß | Bilder — also ihr |
| 6 | **S2** Auf der Kachel steht Anteil neben Anzahl | Fiona, Lea | gering | klein | S1 |
| 7 | **D2c** Fehlen Deutschlands Nachbarn im Spiel? | Fiona, Lea | mittel | mittel | **eure Entscheidung** |
| 8 | **D2b** Mehr Abzeichen, wenn diese getragen haben | Fiona, Lea | mittel | klein | D2, einmal spielen |
| 9 | **P5** Die Größenratsche fragt die falsche Runde | nur ich | mittel | klein | — |
| 10 | **P1** `passt` und `ziehen` nebeneinander | nur ich | gering | klein | — |
| 11 | **P2** Die festen Wartezeiten im Rauchtest | nur ich | gering | mittel | — |
| 12 | **P3** Der Größenwächter im Korpus hat keine Gegenprobe | nur ich | gering | klein | M4r |
| 13 | **P4** 47 von 92 Regelverweisen zeigen ins Leere | nur ich | gering | mittel | — |

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
   die gebackene Geometrie statt gegen den gelieferten Vorrat (Regel 12).
   Jetzt misst es richtig. Und meine Begründung dafür, die Menge aus dem
   vollen Vorrat zu nehmen, war zweimal hintereinander falsch — erst
   „sonst lässt sich ein Abzeichen verlieren" (kann man nicht,
   `istGesammelt` liest den Höchststand), dann „sonst stimmt der Satz bei
   den Nachbarn nicht" (das Abzeichen gibt es nicht mehr). Der Grund, der
   übrig blieb und belegt ist: die **Zahl** daneben muss die ganze Menge
   zählen.

**Und ein dritter, im Werkzeug:** `loese()` im Rauchtest zog das Etikett
auf den **Anker** des Ziels. Bei Berlin (19 pt Radius, ringsum
Brandenburg) landet man damit auf dem Nachbarn — Regel 14, ein Raster ist
nur so fein wie sein kleinstes Ziel. Die Punktsuche steht jetzt einmal als
`zielPunkt` in `chromium.mjs` und wird von `loese` und `durchgang`
benutzt: Trefferkreis, Anker, Raster, Kastenmitte, in dieser Reihenfolge.

**Abnahme:** Rauchtestabschnitt `abzeichen` und Tor `abzeichen`. Acht
Gegenproben, alle anschlagend (174 insgesamt).

---

### D2c · Fehlen Deutschlands Nachbarn im Spiel?

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

### D2b · Mehr Abzeichen, wenn diese getragen haben

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

### P5 · Die Größenratsche fragt die falsche Runde

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
(Regel 12). Der Korpus hat jetzt beide Formen: **121 Treffer, 91
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

**P1 · `passt` (54 s) und `ziehen` (48 s) laufen hintereinander**, obwohl
beide unabhängige Browsertore sind. Spart etwa 45 s je vollem Lauf.

**P2 · Die festen Wartezeiten im Rauchtest** — der nächste und riskanteste
Hebel gegen die Laufzeit. Gehört zwischen zwei Inhaltsrunden, nicht in eine
hinein.

**P3 · Der Größenwächter in `vergleich`** (mindestens 100 Treffer, 50
Nicht-Treffer im eingefrorenen Korpus) ist die einzige Prüfung ohne
Gegenprobe — weil ihr Gegenstand noch nicht existiert. Fällt mit M4r.

**S3 · Die Buchstabenkarten im Vorlauf sind zwei Punkte zu klein.**
Gemessen mit `npm run passt -- --hinweise` auf dem iPhone quer mit Leiste:
die 26 Karten des Abc sind **42 pt** hoch, die Zielmarke ist 44. `passt`
führt das als Hinweis, nicht als Fehler — zu Recht, es sind zwei Punkte.
Es steht hier, weil ausgerechnet diese Karten das sind, was Fiona antippt,
um „A wie Affe" zu hören.

**P4 · Die Regelnummern im Quelltext zeigen in eine andere Regelliste.**
Gemessen am 30.08.2026: **92 Verweise der Form „Regel N"** stehen in `tor/`,
`tools/`, `src/`, `prototyp/spiel.js` und `docs/`. Die Eisernen Regeln in
`CLAUDE.md` sind **elf**. Also zeigen allein die 47 Verweise auf Regel 12,
13 und 15 auf nichts.

Die Diagnose ist nicht „falsch gezählt": die gemeinten Regeln gibt es alle,
sie stehen nur unter anderen Nummern (Messstelle ist hier 5 und nicht 12,
„erst abschalten, dann messen" steckt hier in 1 und nicht in 13, „was
zweimal dasteht" ist 6 und nicht 15). Die Verweise folgen der Nummerierung
eines **anderen** Verzeichnisses. Sie sind beim Schreiben aus dem Gedächtnis
entstanden, und das Gedächtnis hatte die falsche Liste offen.

Das ist genau der Schaden, vor dem Regel 6 warnt — eine Regel, auf die man
sich per Nummer beruft, die es unter dieser Nummer nicht gibt, ist eine
Begründung, die niemand nachschlagen kann. Der Ausweg ist entweder die
Nummer abzuschaffen (die Regel mit ihren Worten zitieren) oder ein Tor, das
jede Nummer gegen `CLAUDE.md` prüft. **Ich halte das Tor für richtig** — es
ist zehn Zeilen und hält die Verweise für immer ehrlich.

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
