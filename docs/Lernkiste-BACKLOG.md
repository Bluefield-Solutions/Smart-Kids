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

| | Fiona (6) | Lea (8) | Eltern |
|---|---|---|---|
| Eingabe | ziehen, sprechen | ziehen, tippen | **nur tippen** |
| Vorlesen | ja | nein | nein |
| Ton | kindlich | kindlich | **sachlich** |
| Auswahl statt Tippen | 4 Möglichkeiten | nur Ebene 4 | **nie** |
| Ländertiefe | 3 | 5 | **12** |
| Aufgaben je Sitzung | 6 | 8 | **12** |
| streng | nein | ja | ja |

Die Spalten werden **der Reihe nach** gelesen (`fiona`, `lea`, `eltern`).
Eine vierte Spalte einzufügen, ohne die Tore mitzuziehen, macht sie still
falsch — das ist der eigentliche Kern von N1.

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

Gemessen wird an 1040 kuenstlich verkrummten Fassungen der 26 Vorlagen
(Versatz, Groesse, leichte Drehung, Zittern, jeder vierte Zug bricht zu
frueh ab) und an 400 Gekritzeln aus zufaelligen Punktfolgen. Die Zahlen
sind fest gewuerfelt, also bei jedem Lauf dieselben.

| Was | Soll |
|---|---|
| Vorlage erkennt sich selbst | 26 von 26 |
| Krumm geschrieben, richtig erkannt | mindestens 90 % |
| Sicher erkannt, aber der falsche Buchstabe | höchstens 2 % |
| Gekritzel als Buchstabe angenommen | höchstens 1 % |

**Der letzte Wert ist der, auf den es ankommt.** Ein Erkenner, der alles
annimmt, erkennt nichts — und N3 (Buchstabe nach Ansage) waere sinnlos,
weil jede Kritzelei als Antwort durchginge.

---

## § 3 · Offen — die Rangliste

Ein Blick, keine Suche. Die Blöcke darunter sagen, was jeder Punkt ist.

| # | Punkt | wer merkt es | Nutzen | Aufwand | hängt an |
|---|---|---|---|---|---|
| 1 | **N2a** Buchstaben nachfahren, Striche vergleichen | Fiona | hoch | groß | — |
| 2 | **N3** Buchstabe vorgelesen, selbst schreiben | Fiona | hoch | mittel | N2a |
| 3 | **N4** Zahlen 1 bis 20 | Fiona | hoch | klein | N2a |
| 4 | **N1** Stephan und Violeta, mit Vergleich | ihr beide | hoch | mittel | — |
| 4a | **N2b** Der Klassifikator als Auffangnetz | Fiona | mittel | mittel | N2a |
| 5 | **S1** Drei Sterne bedeuten zwei Dinge | Fiona, Lea | hoch | klein | — |
| 6 | **A3** Der Fehler wird auch beim Ziehen benannt | Fiona, Lea | hoch | mittel | — |
| 7 | **M4r** Sprechen auf dem iPhone, ein Mal wirklich | Fiona | hoch | mittel | ihr, einmal |
| 8 | **B3** „Wo liegt Bayern?" — die umgekehrte Frage | Lea | mittel | mittel | — |
| 9 | **B2** Test ohne Hilfen, mit Pokal | Lea | mittel | mittel | — |
| 10 | **A4** „Heute schon geübt" | alle | mittel | klein | — |
| 11 | **D3** Ein Satz zum Mitnehmen | Fiona, Lea | mittel | groß | 63 Sätze |
| 12 | **D2** Abzeichen, die etwas sagen | Fiona, Lea | mittel | mittel | — |
| 13 | **D1** Ein Begleiter | Fiona | mittel | groß | Bilder — also ihr |
| 14 | **S2** Auf der Kachel steht Anteil neben Anzahl | Fiona, Lea | gering | klein | S1 |
| 15 | **P1** `passt` und `ziehen` nebeneinander | nur ich | gering | klein | — |
| 16 | **P2** Die festen Wartezeiten im Rauchtest | nur ich | gering | mittel | — |
| 17 | **P3** Der Größenwächter im Korpus hat keine Gegenprobe | nur ich | gering | klein | M4r |
| 18 | **P4** 47 von 92 Regelverweisen zeigen ins Leere | nur ich | gering | mittel | — |

---

### N1 · Stephan und Violeta — zwei Elternprofile, die sich vergleichen

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

**Abnahme.** Der Rauchtest liest **vier** Profilnamen aus § 2.1 und findet
jeden auf der Profilwahl und in der Übersicht wieder; er spielt eine
Aufgabe als Stephan und eine als Violeta und weist nach, dass der
Fortschritt des einen den des anderen nicht bewegt; der Vergleichsbildschirm
zeigt beide Zahlen und benennt, wer vorn liegt. Gegenprobe: beide Profile
auf denselben Ablageschlüssel legen — dann muss die Prüfung rot werden.

---

### N2a · Buchstaben nachfahren — das große neue Spiel, nur für Fiona

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

**Abnahme (Entwurf).** Ein Tor `schreiben` spielt gezeichnete Züge ein —
also echte Punktfolgen, keine Bilder — und prüft: ein sauber nachgefahrenes
A wird angenommen; ein A, das die Vorlage um mehr als die erlaubte Breite
verlässt, nicht; ein frei geschriebenes A wird als A erkannt; ein O wird
**nicht** als A erkannt (das ist die Hälfte, die zählt — Regel 1). Und
`passt` nimmt den Schreibbildschirm auf allen 7 Größen mit: eine
Schreibfläche, die auf 844 × 390 zu klein ist, ist keine.

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

### N3 · Der Buchstabe wird vorgelesen, Fiona schreibt ihn

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

**Abnahme.** Der Rauchtest hört die Ansage (wie heute bei Fionas
Aufgabenansage) und weist nach, dass **kein** Vorbild auf dem Bildschirm
steht — sonst ist es N2a mit Ton. Nach drei Fehlversuchen erscheint es.

---

### N4 · Zahlen 1 bis 20

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

**Abnahme.** Wie N2a/N3, dazu: die Ansage sagt „vierzehn" und nicht „eins
vier" (`gesprochen()` kann das längst), und eine zweistellige Zahl wird nur
angenommen, wenn **beide** Ziffern stimmen und in der richtigen Reihenfolge
stehen.

---

### S1 · Drei Sterne bedeuten zwei verschiedene Dinge

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

**Abnahme.** Ein Tor findet die zwei Aufrufe und weist nach, dass sie
verschiedene Formen speisen. Gegenprobe: beide wieder auf dieselbe Form
legen — muss rot werden.

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

**A3 · Der Fehler wird auch beim Ziehen benannt** *(Rang 6, Nutzen hoch)*
Heute: „Nicht ganz — probier es noch einmal." Möglich: *„Das ist Bayern.
Thüringen liegt weiter oben."* Die Daten dafür sind da (Nachbarschaft,
Himmelsrichtung aus den Ankerpunkten). Das ist der Unterschied zwischen
Raten und Lernen, und er trifft **beide** Kinder in **jeder** Erdkunderunde.
*Abnahme: `spielprobe` prüft, dass jede Ablehnung einen Grund nennt.*

**B3 · Mehr Aufgabenformen** *(Rang 8)* — ohne neue Daten möglich:
umgekehrt („Wo liegt Bayern?"), Nachbarn, größer/kleiner, Puzzle,
Steckbrief. **Teilbar: jede Form einzeln.** Die umgekehrte Frage ist die
billigste und die mit dem größten Zugewinn, weil sie dieselbe Karte in die
andere Richtung liest.

**B2 · Test am Ende, ohne Hilfen** *(Rang 9)* — keine Auswahl, keine Lösung
nach drei Fehlern, kein Zeiger. Wer besteht, bekommt den **Pokal** der
Ebene. Der einzige Ort, an dem ein Pokal etwas bedeutet.

**A4 · „Heute schon geübt"** *(Rang 10)* — eine ruhige Zeile auf dem
Startbildschirm, kein Streak-Zwang. *Abnahme: die Zeile stimmt nach einem
Neustart.*

**D3 · Etwas erzählen können** *(Rang 11)* — nach einer Runde ein Satz zum
Mitnehmen. *„In Ägypten fließt der längste Fluss der Welt."* Klein je Satz,
groß in der Summe: 63 Gebiete wollen ihren Satz.

**D2 · Abzeichen, die etwas über das Kind sagen** *(Rang 12)* — nicht „50
Aufgaben", sondern *„Du kennst alle Nachbarn von Deutschland"*.

**D1 · Ein Begleiter** *(Rang 13)* — die Figur, die durch die App führt.
Sie wird nicht gekauft, sie ist da. **Braucht Bilder, und die entstehen
nicht im Code** — dieser Punkt liegt bei euch, nicht bei mir.

---

### Prozess und Prüfbarkeit — Nutzen gering, aber nicht null

**M4r · Sprechen, ein Mal wirklich auf dem iPhone** *(Rang 7 — die
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
