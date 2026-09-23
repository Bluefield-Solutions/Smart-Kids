# Deutsch — Rechtschreibung und Sprache untersuchen

Die vierte Fachwelt. Nur für Lea (3. Klasse, Bayern). Ziel ist nicht „Deutsch
üben", sondern: **was in einer Klassenarbeit der 3. Jahrgangsstufe verlangt
wird, wird hier vorher gekonnt.**

---

## Woher der Stoff kommt

Nicht aus mir. Zwei amtliche Quellen, beide ausgelesen und im Verzeichnis
abgelegt:

| Quelle | Liegt als | Umfang |
|---|---|---|
| Grundwortschatz für die Jahrgangsstufen 3 und 4 (ISB/StMUK) | `docs/referenz/ISB-Grundwortschatz-34.txt` | **234 Wörter in 25 Gruppen** |
| Grundwortschatz für die Jahrgangsstufen 1 und 2 (ISB/StMUK) | `docs/referenz/ISB-Grundwortschatz-12.txt` | **244 Wörter in 30 Gruppen** |
| LehrplanPLUS, Lernbereich *Richtig schreiben* 3/4 | Kompetenzerwartungen, unten zitiert | — |
| LehrplanPLUS, Lernbereich *Sprache untersuchen* 3 | Wortarten, Zeitformen, Satzglieder, Satzarten | — |

**Messstelle der Zahlen:** gezählt am ausgelesenen Text der beiden PDF-Dateien
vom 23.09.2026, ausgelesen mit `pypdf` 6.17, je zwei Seiten, vollständig. Nicht
geschätzt und nicht aus dem Gedächtnis. Die PDF-Dateien selbst liegen nicht im
Verzeichnis, der ausgelesene Text schon — die Quelle ist aus diesem Container
nicht erreichbar (Organisationssperre), er ist also die einzige Fassung, die
wir haben.

### Was der Lehrplan verlangt

> Die Schülerinnen und Schüler üben Rechtschreibung anhand des verbindlichen
> Grundwortschatzes für die Jahrgangsstufen 3 und 4 und schreiben gängige
> Schreibungen (Konsonantenverdoppelung, Auslautverhärtung) routiniert richtig.

Dazu: Rechtschreibbewusstsein am eigenen Text, ein wachsender individueller
Übungswortschatz (Lernwörterkartei), fehlerfreies Abschreiben, Überarbeiten mit
dem Wörterbuch.

Und der Satz, der den ganzen Aufbau dieser Welt bestimmt:

> Jedes Wort des Grundwortschatzes ist nur **einem** Übungsschwerpunkt
> zugeordnet.

Deshalb ist die Ebene hier das Rechtschreibphänomen, nicht das Thema, nicht die
Woche und nicht der Anfangsbuchstabe.

---

## Die 25 Gruppen aus 3/4

| Gruppe | Wörter | Gruppe | Wörter |
|---|--:|---|--:|
| Silbentrennung | 42 | Umlautung + Auslautverhärtung | 11 |
| `<r>` nach Vokal | 17 | Präteritumsformen | 28 |
| `<ie>` | 14 | Häufigkeitswortschatz | 25 |
| Mitlautverdopplung | 10 | `<ß>` | 4 |
| `<tz>` | 4 | **Merkwörter** (elf kleine Gruppen) | **29** |
| `<ck>` | 5 | | |
| silbentrennendes `<h>` | 8 | | |
| Verhärtung | 10 | | |
| Umlautung | 6 | | |
| flektierte Wörter im Satz | 21 | | |

Die elf kleinen Gruppen (`<Ch>` mit einem Wort, `<y>` mit einem, `<zz>`, `<dt>`,
`<V>`, /ks/, Dehnungs-`<h>`, Doppelvokal, `<ä>` ohne Ableitung, `<i>` statt
`<ie>`, `<ai>`) werden **eine** Ebene „Merkwörter". Eine Kachel für ein Wort
wäre keine Ebene, sondern ein Krümel. Die Begründung beim Fehler nennt trotzdem
die genaue Besonderheit — die Gliederung geht also nicht verloren, nur die
Kachelwand wird nicht absurd.

**Die Bündelungsregel kommt aus der Liste selbst, nicht aus mir:** gebündelt
wird genau das, was die amtliche Liste unter der Überschrift *Wörter mit
nicht-regelhaften Rechtschreibbesonderheiten* führt. Das sind in 3/4 elf
Gruppen mit 29 Wörtern und in 1/2 sieben Gruppen mit 22 Wörtern. Alles, wofür
es eine Strategie gibt, bleibt eine eigene Ebene — auch `<tz>` mit vier
Wörtern, denn dort ist die Regel der Inhalt, nicht das Wort.

---

## Aufbau der Welt

Zwei Stufen. Die Deutsch-Kachel führt auf **vier Abteilungen**, jede davon erst
auf ihre Ebenen. Kein Scrollen auf 844 × 390.

```
Deutsch
├── Rechtschreibung 3/4        15 Ebenen · 234 Wörter
├── Wiederholung 1/2           24 Ebenen · 244 Wörter
├── Sprache untersuchen        10 Ebenen
│     Nomen · Verb · Adjektiv · Artikel · Pronomen
│     Gegenwart · Vergangenheit · Zukunft
│     Satzarten · Satzglieder
└── Proben                      2 Kacheln, immer offen
      Probe Rechtschreibung · Probe Sprache untersuchen
```

### Eine Übungsrunde

Zwanzig Wörter. Je Wort:

1. Der Satz steht da, die Lücke ist sichtbar, der ganze Satz wird vorgelesen —
   das Zielwort mit.
2. **Erstes Treffen:** vier Schreibweisen zur Wahl. **Zweites und drittes:**
   frei getippt auf den eigenen Buchstabentasten (alphabetisch, Umschalttaste,
   Umlaute und ß).
3. Falsch → **erst die Regel, dann die Lösung.** Die Regel zeigt das Paar:
   „Verlängere: Abend – Abende, dann hörst du das d."
4. Groß-/Kleinschreibung zählt als Fehler, aber mit **eigener** Meldung — sie
   ist ein anderer Fehler als ein falscher Buchstabe.

Ein Wort sitzt nach **dreimal richtig an drei verschiedenen Tagen**. Eine Ebene
ist geschafft, wenn **vier Fünftel** ihrer Wörter sitzen; die letzten Brocken
wandern ins Fehlerheft und kommen wieder.

### Die zwei Proben

Immer offen, eigene Kacheln. Je zwanzig Aufgaben, gezogen aus **allem**, was
Lea je geübt hat, gewichtet zu den Fehlerwörtern hin — nicht aus der letzten
Runde, sonst misst die Probe das Kurzzeitgedächtnis und die Note ist geschenkt.

Am Ende ein Notenspiegel. Fest, nicht abschaltbar. Der Notenschlüssel ist im
Elternbereich einstellbar, weil Bayern **keinen** landesweit verbindlichen
Schlüssel für Diktate kennt: Art. 52 BayEUG gibt nur die sechs Notenstufen,
§ 10 GrSO nur Zahl und Ankündigung — den Schlüssel setzt die Lehrerkonferenz.
Ein fest eingebauter Schlüssel wäre also eine Erfindung.

### Das Fehlerheft

Im Elternbereich, nur für Deutsch. Oben: welche Phänomene sitzen und welche
nicht, als Balken. Darunter aufklappbar die einzelnen Wörter je Phänomen, mit
Leas letzter Schreibweise daneben — damit man zu Hause gezielt abfragen kann.

---

## Die Entscheidungen

Zwölf Runden Verhör, jede Verzweigung besucht.

| # | Entschieden |
|---|---|
| 1 | Nur Lea · Rechtschreibung zuerst · neue Welt „Deutsch" · strikt amtlich |
| 2 | Wort als Lerneinheit, Regel als Begründung · Regler im Elternbereich · Fehlerheft nur Deutsch · dieselben Tier-Aufkleber |
| 3 | Eigene Buchstabentasten · vorgelesen im Satz · Übungsprobe mit Notenspiegel · Schulbegriff plus Erklärung |
| 4 | Erst die Regel, dann die Lösung · Satz mit Lücke sichtbar · Groß/klein zählt mit eigener Meldung · zwanzig Wörter je Runde |
| 5 | Alphabetische Tasten mit Umschalttaste · dreimal richtig an drei Tagen · Probe immer offen · ich schreibe die Sätze nach festen Regeln |
| 6 | Notenschlüssel einstellbar im Elternbereich |
| 7 | Alle Wörter aus 3/4 · Grundwortschatz 1/2 als Auffrischung mit hinein |
| 8 | Eine Ebene je Phänomen · Probe quer aus allem Gelernten · Fehlerheft erst Regeln, dann Wörter · Wortarten und Zeitformen kommen mit |
| 9 | Wortarten und Zeitformen je beides im Wechsel · Begriffe einstellbar · zwei getrennte Proben |
| 10 | Drei Sätze je Wort · Ebene geschafft bei vier Fünfteln · Note immer, fest |
| 11 | Eine Form fragen, das Paar in der Regel · eine Ebene „Merkwörter" · 1/2 als eigene Abteilung · flektierte Wörter als Lückensatz, getippt |
| 12 | Leiter: erst wählen, dann tippen · alle fünf Wortarten · drei Zeitformen · Satzarten **und** Satzglieder |
| 13 | Zwei Stufen statt einer langen Wand · ein Satz je Wort in der Wiederholung · Lieferung in drei Etappen |

### Der Regler für die Begriffe

Der Lehrplan nennt Nomen, Verb, Adjektiv. Viele bayerische 3. Klassen sagen
noch Namenwort, Tunwort, Wiewort. Welches Leas Klasse benutzt, weiß niemand von
uns sicher — also schaltet ein Regler im Elternbereich die Beschriftung um,
statt dass ich rate. Standard sind die Fachbegriffe, weil die bis zum Abitur
gelten.

---

## Was ich ohne Rückfrage festgelegt habe

Damit es nachprüfbar ist und nicht stillschweigend:

1. **Die Sätze schreibe ich nach festen Regeln:** höchstens neun Wörter; nur
   Wortschatz aus Leas Welt; das Zielwort steht **nie** am Satzanfang, sonst
   verrät der Satzanfang die Großschreibung; kein zweites Lernwort desselben
   Phänomens im selben Satz.
2. **Dieselben Sätze tragen beide Abteilungen.** Ein Satz, der „Sonne" übt,
   trägt später die Frage nach der Wortart und nach der Zeitform. Kein zweites
   Satzmaterial.
3. **Drei Sätze je Wort in 3/4, einer je Wort in 1/2** — rund 950 Sätze.
4. **Die Präteritumsformen zählen als eigene Wörter.** „bleiben" und „blieben"
   sind zwei Lerneinheiten; gefragt wird mal die eine, mal die andere, und die
   Regel zeigt immer das ganze Paar.
5. **Vorschlag für den Notenschlüssel** (im Elternbereich änderbar):
   1 ab 96 %, 2 ab 81 %, 3 ab 61 %, 4 ab 41 %, 5 ab 16 %, sonst 6.

---

## Die drei Etappen

Jede für sich spielbar, jede mit voller Torkette, Push und Auslieferung.

| Etappe | Inhalt |
|---|---|
| **1** | Rechtschreibung 3/4: 15 Ebenen, 234 Wörter, ~700 Sätze, Buchstabentasten, Regelbegründungen, Fehlerheft, Probe Rechtschreibung |
| **2** | Wiederholung 1/2: 24 Ebenen, 244 Wörter, 244 Sätze |
| **3** | Sprache untersuchen: Wortarten, Zeitformen, Satzarten, Satzglieder, Probe Sprache untersuchen, Begriffe-Regler |
