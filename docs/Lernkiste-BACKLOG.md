# Backlog

Vier Anforderungen vom 29.08.2026, aufgenommen und in Runden geschnitten.
Jede Runde hat ein **Ziel** und ein **Abnahmekriterium** — so, wie in diesem
Verzeichnis gearbeitet wird.

Was hier steht, ist geprüft und nicht geschätzt: wo etwas schon da ist,
steht es dabei; wo etwas an Daten hängt, ist die Quelle nachgesehen.

---

## Entschieden

| Frage | Antwort | steht in |
|---|---|---|
| Welche Kacheln? | **alle drei** Wahlbildschirme — Profilwahl, Weltenwahl, Ebenenwahl | R2 |
| Überlappen wirklich gesehen? | nicht sicher → **Prüfung bauen**, statt zu raten | R2 |
| Wo steht das Elternprofil? | **dritte Kachel bei den Kindern**, ohne PIN | R4 |
| Ein Profil oder zwei? | **eins** — ihr spielt es beide | R4 |
| Erst Entwürfe? | **ja**, zwei bis drei Aufnahmen vor dem Umbau | R2 |
| Welcher Entwurf? | **B · Bild** — jede Kachel zeigt ihren echten Umriss | R2 |
| Welcher Grund? | **weiß** statt des hellen Blaus — Fassung offen (W1/W2/W3) | R2 |

Offen ist nur noch der **Name** des dritten Profils. „Eltern" ist ein
Platzhalter; in eurer Nachricht stand „Adam-Profil" — wenn es so heißen
soll, ändert das eine Zeile.

---

## Was schon dasteht — damit niemand zweimal baut

| Anforderung | schon da | was wirklich fehlt |
|---|---|---|
| **2** Zurücksetzen | „von vorne" je Ebene auf der Ebenenwahl, mit Nachfrage; „Alles löschen" im Elternbereich. Der Rauchtest prüft: danach 0 Gegenstände. | der Weg **aus dem laufenden Spiel** heraus |
| **3** Memory-Vorlauf | die Stadtstaaten-Lerneinheit (drei Umrisse, antippbar, vorgelesen) — die Form gibt es also | ein Blättermodus **je Ebene**, mit „Jetzt starten" |
| **4** Elternprofil | ein Profil ist acht Zeilen: `eingabe`, `vorlesen`, `kandidaten`, `laenderTiefe`, `sitzung`, `streng` | **Inhalt.** Siehe unten — das ist die eigentliche Arbeit |
| **1** Kacheln | `passt` prüft auf 7 Größen, dass nichts über den **Rand** läuft, und findet mit `elementFromPoint` **verdeckte** Texte | Element gegen Element: zwei Kacheln, die sich um 3 px überlappen, sieht heute niemand |

---

## Der Fund, der #4 bestimmt

**Die Länderdaten enthalten fünf Länder je Kontinent. Fünfundzwanzig
insgesamt.** Sie stehen als handverlesene Liste (`ziele`) in
`tools/backen-laender.mjs`; die Rohdaten von Natural Earth enthalten alle.
Lea nutzt mit `laenderTiefe: 5` bereits jedes davon.

Ein schwierigeres Erdkunde-Profil ist damit **kein Gestaltungsthema,
sondern ein Datenthema**. Ohne neue Daten bliebe als „schwerer" nur:
dieselben **63 Gebiete** (6 Kontinente + 25 Länder + 16 Bundesländer +
16 Städte), aber ohne Auswahl und ohne Hilfen — für einen
Erwachsenen, der alle 25 Länder kennt, ist das nicht schwer, sondern nur
lästig.

Geprüft, damit die Runde nicht am Anfang steckenbleibt:

```
https://raw.githubusercontent.com/nvkelso/.../ne_10m_admin_0_countries.geojson
→ 200, 13 287 234 B
```

Die Quelle ist von hier aus erreichbar. Das Risiko ist keins mehr.

**Aber ein zweites steht daneben:** `budget` erlaubt **250 KB je
nachgeladener Ebene**, und Europa liegt mit fünf Ländern schon bei
**107 KB**. Zwölf Länder sprengen das voraussichtlich. Das ist in R5 zu
klären, nicht zu übergehen — die Grenze steht dort, weil die Kinder die
Ebene auf einem Telefon nachladen.

---

## Konzept: das Elternprofil

### Wie es heißt: **Adam**

Nicht „Eltern". Das war ein Platzhalter aus der Konzeptrunde, und er ist
falsch: die Kachel steht neben Fiona und Lea, und die tragen ihre Namen.
Eine Kachel „Eltern" neben zwei Vornamen liest sich wie eine Einstellung,
nicht wie ein Mitspieler — und sie ist einer. Entschieden nach der
Formulierung des Nutzers („das Adam-Profil spielen wir beide").

Der Name steht ab R4 an genau **einer** Stelle: im Profil selbst
(`PROFILE.adam.name`). Überall sonst wird er von dort gelesen. „Elternprofil"
bleibt in diesem Dokument als Gattungsbegriff stehen — im Programm und auf
dem Bildschirm heißt es Adam.

### Was es ist

Eine **dritte Kachel neben Fiona und Lea**, ohne PIN. Es spielt dieselben
Bildschirme, dieselbe Wertung, denselben Leitner — nur mit anderem Inhalt
und ohne die Hilfen für Kinder.

| | Fiona (6) | Lea (8) | Adam |
|---|---|---|---|
| Eingabe | ziehen, sprechen | ziehen, tippen | **nur tippen** |
| Vorlesen | ja | nein | nein |
| Auswahl statt Tippen | 4 Möglichkeiten | nur Ebene 4 | **nie** |
| Ländertiefe | 3 | 5 | **12** |
| Aufgaben je Sitzung | 6 | 8 | **12** |
| streng | nein | ja | ja |

Mechanisch ist das billig — ein Profil wird an acht Stellen gelesen. Teuer
ist der Inhalt, und der zerfällt in zwei sehr verschiedene Hälften.

### Mathe für Erwachsene — erzeugt, und vor allem: BEGRENZT

Der erste Entwurf dieses Abschnitts hatte einen Fehler, der erst beim
Nachrechnen auffiel, und er ist lehrreich genug, um stehenzubleiben.

Er lautete: „Plus und Minus im Zahlenraum 1000, zweistellig × einstellig,
dreistellige Division, Quadratzahlen." Klingt vernünftig. **Gezählt sind
das 321 200 Aufgaben allein für die Addition.**

Das ist nicht bloß viel, es bricht drei Dinge auf einmal:

- Das **Forscherbuch** zeichnet jeden Gegenstand einer Ebene. Es wären
  dreihunderttausend Kästchen.
- **`spielprobe`** rechnet jede Aufgabe und jede angebotene Zahl nach —
  heute 240 Aufgaben in einer Sekunde.
- Und der **Leitner** braucht Wiederholung. Bei 321 200 Aufgaben sieht man
  dieselbe nie zweimal; ein Verfahren gegen das Vergessen, dem man nie
  begegnet, ist keins.

Ein Vorrat muss also **von Natur aus begrenzt** sein — so wie Fionas 100
(alle Summen bis 10) und Leas 140 (die Reihen 6 bis 10). Nicht künstlich
gekürzt, sondern durch die Regel selbst.

Deshalb nicht der Zahlenraum, sondern die **Sorte** von Aufgabe:

| Sorte | Regel | Beispiel | Anzahl |
|---|---|---|---|
| `mal-gross` | 11…19 × 11…19, ohne die Quadrate | 13 × 17 | 72 |
| `quadrat` | 12² bis 25² | 17² | 14 |
| `geteilt-gross` | die Umkehrung von `mal-gross` | 221 : 13 | 72 |
| | | **gesamt** | **158** |

Nachgerechnet: 158 Aufgaben, **158 eindeutige Kennungen**, keine
Überschneidung zwischen `mal-gross` und `quadrat`, größter Wert 625. Die
Größenordnung von Lea (140) — und 13 × 17 ist für einen Erwachsenen eine
echte Aufgabe, 347 + 268 dagegen nur Fleißarbeit.

**Was damit bewusst NICHT kommt:** dreistellige Addition. Sie lässt sich
nicht begrenzen, ohne willkürlich auszudünnen, und eine willkürliche
Auswahl wäre kein Vorrat, sondern eine Stichprobe. Wenn ihr sie wollt,
wird sie eine eigene Ebene mit einer eigenen, tragenden Regel — das ist
eine Entscheidung, keine Zeile Code.

**Zwei Dinge bleiben neu und nicht geschenkt:**

1. `gesprochen()` geht heute bis **100** („sechsundfünfzig"). Der größte
   Wert hier ist 625 — die nächste Stufe braucht es also trotzdem, und die
   deutschen Zahlwörter sind ab Hundert unangenehm
   („sechshundertfünfundzwanzig").
2. Die **Ablenker**. Bei Fiona sind es ±1 und die Gegenrechnung, bei Lea
   die Nachbarn in der Reihe. Bei 13 × 17 greift man nach 13 × 16 oder
   nach dem vergessenen Kreuzprodukt — das ist eigene Denkarbeit, keine
   Zeile Code.

Die Zahlen stehen — wie bei C1 und C2 — **im Abgleichdokument**, und das
Tor `doku` legt sie neben den Code.

### Erdkunde für Erwachsene — hängt an Daten

- **Länder:** von 5 auf 12 je Kontinent, also 25 → 60. Natural Earth
  liefert `NAME_DE`, die deutschen Namen müssen also nicht von Hand
  geschrieben werden. Neu backen, Budget prüfen (siehe oben).
- **Hauptstädte Europas:** braucht Stadtdaten, die es heute nur für
  Deutschland gibt. `ne_10m_populated_places` führt Hauptstädte mit
  Koordinaten; `tools/backen-staedte.mjs` ist die Vorlage.

---

## Die Runden, in dieser Reihenfolge

Die Reihenfolge ist **nicht die Wichtigkeit, sondern die Tragfähigkeit** —
dieselbe Regel wie im ANTON-Fahrplan: jede Runde soll auf der vorigen
stehen können. Zwei Zwänge gibt es wirklich:

- **R2 vor R3 und R4**, weil beide neue Kacheln bauen. Wer sie vorher baut,
  gestaltet sie zweimal.
- **R5 vor R6**, weil man auf Daten, die es nicht gibt, nichts prüfen kann.

Alles andere ist frei, und deshalb steht die kleinste Runde vorn.

### R1 · Von vorne, mitten im Spiel  ·  ERLEDIGT

**Ziel:** Aus einer laufenden Runde heraus alles auf null setzen — die
Häkchen weg, die Farben zurück, die nächste Aufgabe fängt bei Fach 1 an.

Der Weg dafür gibt es schon (`Ablage.loesche('fortschritt', …)`), und die
Häkchen hängen am Leitner-Stand (`gesessen()`), fallen also von selbst weg.
Was fehlt, ist der Knopf und die Nachfrage — zwei Tipper, wie auf der
Ebenenwahl, denn ein Fehlgriff räumt eine Woche Übung weg.

**Abnahme:** Der Rauchtest spielt eine Runde, setzt mitten darin zurück und
weist nach: null Gegenstände in der Ablage, keine Häkchen auf der Karte,
und die laufende Sitzung beginnt neu statt weiterzuzählen.

**Erledigt.** Das Kreuz im Spiel führt jetzt auf einen **Pausenbildschirm**
mit drei Wegen: Weiterspielen · Übung beenden · Von vorne anfangen. Kein
vierter Knopf im Kopf — dort ist im Querformat kein Platz, und eine Taste,
die eine Woche Übung wegräumt, gehört nicht neben das Kreuz.

Der Rauchtest weist alle drei Teile der Abnahme nach und meldet
`1 → 0 Gegenstände, Band jetzt (0 erledigt), 0 Häkchen`. Zwei stehende
Gegenproben; die zweite hat drei Anläufe gebraucht, weil der Test den
Unterschied zwischen „fängt neu an" und „zählt weiter" zunächst gar nicht
sehen konnte — siehe `docs/Lernkiste-STAND.md`.

### R2 · Eine Kachelsprache für alle drei Wahlbildschirme  ·  ERLEDIGT

**Ziel:** Profilwahl, Weltenwahl und Ebenenwahl sehen aus wie **eine**
Familie. Heute sind es drei Entwürfe aus drei Runden.

Dazu das Tor, das heute fehlt: **Element gegen Element.** `passt` misst
gegen den Rand und findet mit `elementFromPoint` verdeckte Texte — zwei
Kacheln, die sich um wenige Punkte überschneiden, sieht es nicht. Das ist
die blinde Stelle, nach der ihr gefragt habt.

**Entwürfe liegen vor und sind entschieden:** `docs/entwuerfe/` — gewählt
ist **B · Bild** (jede Kachel zeigt ihren echten Umriss) mit **weißem
Grund** statt des hellen Blaus. Offen ist nur noch, welche der drei
Weiß-Fassungen (W1 reinweiß · W2 reinweiß mit kräftigerer Kachel · W3 fast
weiß).

**Der weiße Grund ist kein Detail dieser Runde, sondern ihr Kern.**
`--grund` ist eine globale Marke: jeder Bildschirm ändert sich mit, weiße
Karten auf weißem Grund brauchen ihre Trennung aus Rand statt Fläche, und
alle 15 Vorbilder in `tor/vorbilder/` werden neu. Die Begründung des alten
Blautons steht in `marken.css` und wird mit dieser Runde bewusst gedreht —
sie darf nicht stillschweigend verschwinden.

**Abnahme:** Das neue Tor ist rot, wenn sich zwei Geschwister überlappen
(Gegenprobe: eine Kachel um 4 px verschieben). `passt` bleibt auf allen 7
Größen grün. Und die Aufnahmen der drei Bildschirme liegen nebeneinander —
**angesehen**, nicht nur gemessen: Regel 7.

**Erledigt.** Gebaut als W2. Das Tor sitzt in `passt` statt daneben — die
Tour über 7 Größen × 9 Bildschirme steht dort schon, ein zweites Werkzeug
wäre auseinandergelaufen. Die Gegenprobe verschiebt um **60 px**, nicht um
4: bei 4 px überlappt gar nichts, die Reihenlücke ist größer, und das Tor
blieb zu Recht grün. Vier Befunde kamen erst vom Blick auf die Aufnahmen,
und `lesbarkeit` musste erst lernen, das Wasserzeichen zu sehen — es fand
dann zehn Kontrastfehler. Alles in `docs/Lernkiste-STAND.md`.

### R3 · Memory-Vorlauf  ·  mittel

**Ziel:** Vor jeder Ebene ein Blättern statt eines Rätsels. Alle Gebiete
der Ebene mit Namen, Umriss und — bei den Hauptstädten — der Zuordnung;
antippen liest vor. Unten „Jetzt starten".

Erreichbar über die Kachel, und beim **ersten** Betreten einer Ebene von
selbst. Das deckt zugleich **B1** aus dem ANTON-Abgleich („Erklärung vor
der Übung"), das dort seit Runde 4 offen steht — der Abgleich beschreibt
genau das: *„Bei uns gibt es sie einmal (Stadtstaaten). Jede Ebene bräuchte
ihre."*

> **Kollision, die vorher zu klären ist:** die Stadtstaaten-Lerneinheit
> geht heute schon beim ersten Betreten von `hauptstaedte` auf
> (`Einst.stadtstaatenGezeigt`). Zwei Vorschaltbildschirme hintereinander
> sind einer zuviel. Entweder der Vorlauf **enthält** die Stadtstaaten-
> Erklärung als eigene Karte, oder die Lerneinheit weicht ihm. Ich halte
> das Erste für richtig — dann gibt es eine Form statt zweier —, aber es
> ist eine Entscheidung und keine Nebensache.

**Abnahme:** Der Rauchtest geht für beide Kinder über den Vorlauf ins
Spiel; für Fiona wird jeder Name **angesagt** (sie liest nicht). `passt`
grün auf 7 Größen — der Vorlauf zeigt bis zu 16 Gebiete auf einmal, das ist
die engste Stelle.

### R4 · Elternprofil, erste Hälfte: Profil und Mathe  ·  mittel

**Ziel:** Die dritte Kachel steht und ist spielbar — mit den **drei** neuen
Rechensorten (158 Aufgaben). Ohne neue Daten, also ohne Wartezeit.

**Enthält außerdem:** die Auswahl zu einer Eigenschaft des Profils machen
(siehe Konzept). Ohne das spielen die Eltern die Bundesländer mit vier
Möglichkeiten — oder die Kinder verlieren ihre.

**Abnahme:** `spielprobe` rechnet **jede** erzeugte Aufgabe gegen JavaScript
nach und prüft jede angebotene Zahl (so wie heute für 240 Aufgaben). `doku`
legt die Verteilungen neben die Abgleichtabelle. Der Rauchtest spielt das
Profil durch. Und `gesprochen()` sagt 347 richtig — mit Gegenprobe.

### R5 · Mehr Länder  ·  Datenrunde, eigenes Risiko

**Ziel:** 12 Länder je Kontinent statt 5. Liste erweitern, neu backen,
Berichte und Gebietszahl nachziehen.

**Zu klären, bevor gebaut wird:** Europa liegt mit 5 Ländern bei 107 von
250 KB. Passt 12? Wenn nicht: gröbere Geometrie für die schwere Ebene, oder
die Ebene teilen. Das ist eine Messung von einer Viertelstunde und
entscheidet den Zuschnitt der ganzen Runde.

**Abnahme:** `budget` grün ohne angehobene Grenze. `inhalt`/`topologie`
grün für alle neuen Gebiete. Die Gebietszahl im Konzept stimmt wieder.

### R6 · Erdkunde für Erwachsene  ·  mittel

**Ziel:** Die schweren Ebenen auf den neuen Daten — Länder in Tiefe 12,
und Hauptstädte Europas.

**Abnahme:** wie R4, plus `beruehrung` für die neuen Städte (ein Gebiet
unter 44 pt braucht eine entkoppelte Trefferfläche).

---

## Was dadurch liegen bleibt

Aus dem ANTON-Fahrplan bleiben offen: **A3** (der Fehler wird auch beim
Ziehen benannt), **A4** („heute schon geübt"), **B2** (Test ohne Hilfen),
**B3** (mehr Formen), **D1** (ein Begleiter — braucht Bilder und damit
euch), **D2** (Abzeichen) und **D3** (Sätze). **B1** wird von R3
miterledigt.

*Die erste Fassung dieser Liste vergaß A3 und D1 — nachgezählt statt
erinnert.*

Und aus der Prozessrunde: die **festen Wartezeiten im Rauchtest** — der
nächste und riskanteste Hebel gegen die Laufzeit. Er gehört zwischen zwei
Inhaltsrunden, nicht in eine hinein.
