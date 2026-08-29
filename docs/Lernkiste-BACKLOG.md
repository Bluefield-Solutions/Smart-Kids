# Backlog

Vier Anforderungen vom 29.08.2026, aufgenommen und in Runden geschnitten.
Jede Runde hat ein **Ziel** und ein **Abnahmekriterium** — so, wie in diesem
Verzeichnis gearbeitet wird.

Was hier steht, ist geprüft und nicht geschätzt: wo etwas schon da ist,
steht es dabei; wo etwas an Daten hängt, ist die Quelle nachgesehen.

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
dieselben 47 Gebiete, aber ohne Auswahl und ohne Hilfen — für einen
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

### Was es ist

Eine **dritte Kachel neben Fiona und Lea**, ohne PIN. Es spielt dieselben
Bildschirme, dieselbe Wertung, denselben Leitner — nur mit anderem Inhalt
und ohne die Hilfen für Kinder.

| | Fiona (6) | Lea (8) | Eltern |
|---|---|---|---|
| Eingabe | ziehen, sprechen | ziehen, tippen | **nur tippen** |
| Vorlesen | ja | nein | nein |
| Auswahl statt Tippen | 4 Möglichkeiten | nur Ebene 4 | **nie** |
| Ländertiefe | 3 | 5 | **12** |
| Aufgaben je Sitzung | 6 | 8 | **12** |
| streng | nein | ja | ja |

Mechanisch ist das billig — ein Profil wird an acht Stellen gelesen. Teuer
ist der Inhalt, und der zerfällt in zwei sehr verschiedene Hälften.

### Mathe für Erwachsene — erzeugt, nicht gesammelt

Dieselbe Maschinerie wie bei Fiona und Lea (`src/inhalt/rechnen.js`
erzeugt Aufgaben samt Kennung), nur andere Sorten:

| Sorte | Beispiel | Anzahl |
|---|---|---|
| `gross-plus` / `gross-minus` | 347 + 268 | erzeugt, Zahlenraum 1000 |
| `zweistellig-mal` | 47 × 8 | 90 × 9 |
| `gross-geteilt` | 851 : 23 | geht auf, dreistellig |
| `quadrat` | 17² | 12 bis 25 |

**Zwei Dinge sind dabei neu und nicht geschenkt:**

1. `gesprochen()` geht heute bis **100** („sechsundfünfzig"). Für 347
   braucht es die nächste Stufe — und die deutschen Zahlwörter sind ab
   Hundert unangenehm („dreihundertsiebenundvierzig").
2. Die **Ablenker**. Bei Fiona sind es ±1 und die Gegenrechnung, bei Lea
   die Nachbarn in der Reihe. Für 47 × 8 wäre ±1 lächerlich — dort greift
   man nach dem vergessenen Übertrag (376 statt 376… also 326) oder nach
   der falschen Stelle. Das ist eigene Denkarbeit, keine Zeile Code.

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

### R1 · Von vorne, mitten im Spiel  ·  klein

**Ziel:** Aus einer laufenden Runde heraus alles auf null setzen — die
Häkchen weg, die Farben zurück, die nächste Aufgabe fängt bei Fach 1 an.

Der Weg dafür gibt es schon (`Ablage.loesche('fortschritt', …)`), und die
Häkchen hängen am Leitner-Stand (`gesessen()`), fallen also von selbst weg.
Was fehlt, ist der Knopf und die Nachfrage — zwei Tipper, wie auf der
Ebenenwahl, denn ein Fehlgriff räumt eine Woche Übung weg.

**Abnahme:** Der Rauchtest spielt eine Runde, setzt mitten darin zurück und
weist nach: null Gegenstände in der Ablage, keine Häkchen auf der Karte,
und die laufende Sitzung beginnt neu statt weiterzuzählen.

### R2 · Eine Kachelsprache für alle drei Wahlbildschirme  ·  mittel

**Ziel:** Profilwahl, Weltenwahl und Ebenenwahl sehen aus wie **eine**
Familie. Heute sind es drei Entwürfe aus drei Runden.

Dazu das Tor, das heute fehlt: **Element gegen Element.** `passt` misst
gegen den Rand und findet mit `elementFromPoint` verdeckte Texte — zwei
Kacheln, die sich um wenige Punkte überschneiden, sieht es nicht. Das ist
die blinde Stelle, nach der ihr gefragt habt.

**Abnahme:** Das neue Tor ist rot, wenn sich zwei Geschwister überlappen
(Gegenprobe: eine Kachel um 4 px verschieben). `passt` bleibt auf allen 7
Größen grün. Und die Aufnahmen der drei Bildschirme liegen nebeneinander —
**angesehen**, nicht nur gemessen: Regel 7.

### R3 · Memory-Vorlauf  ·  mittel

**Ziel:** Vor jeder Ebene ein Blättern statt eines Rätsels. Alle Gebiete
der Ebene mit Namen, Umriss und — bei den Hauptstädten — der Zuordnung;
antippen liest vor. Unten „Jetzt starten".

Erreichbar über die Kachel, und beim **ersten** Betreten einer Ebene von
selbst. Das deckt zugleich **B1** aus dem ANTON-Abgleich („Erklärung vor
dem Test"), das dort seit Runde 4 offen steht.

**Abnahme:** Der Rauchtest geht für beide Kinder über den Vorlauf ins
Spiel; für Fiona wird jeder Name **angesagt** (sie liest nicht). `passt`
grün auf 7 Größen — der Vorlauf zeigt bis zu 16 Gebiete auf einmal, das ist
die engste Stelle.

### R4 · Elternprofil, erste Hälfte: Profil und Mathe  ·  mittel

**Ziel:** Die dritte Kachel steht und ist spielbar — mit den vier neuen
Rechensorten. Ohne neue Daten, also ohne Wartezeit.

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

Aus dem ANTON-Fahrplan bleiben offen: **D2** (Abzeichen), **A4** („heute
schon geübt"), **B2** (Test ohne Hilfen), **B3** und **D3**. **B1** wird
von R3 miterledigt.

Und aus der Prozessrunde: die **festen Wartezeiten im Rauchtest** — der
nächste und riskanteste Hebel gegen die Laufzeit. Er gehört zwischen zwei
Inhaltsrunden, nicht in eine hinein.
