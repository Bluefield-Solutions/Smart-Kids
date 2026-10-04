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
| **2** | Wiederholung 1/2: 24 Ebenen in **zwei** Abteilungen, 245 Einträge, 278 Lerneinheiten, 278 Sätze — **gebaut (E27)** |
| **3** | Sprache untersuchen: 10 Ebenen, 724 Aufgaben, Probe Sprache untersuchen, Begriffe-Regler — **gebaut (E29)** |


---

## Etappe 1 — gebaut, gemessen, ausgeliefert

Was am 23.09.2026 tatsächlich steht. Die Zahlen sind gezählt, nicht
geschätzt; das Untertor `deutsch` rechnet sie bei jedem Lauf nach.

| | |
|---|--:|
| Gruppen des Grundwortschatzes 3/4 | 25 |
| davon Ebenen (die elf „nicht-regelhaften" gebündelt) | **15** |
| Einträge der amtlichen Liste | **234** |
| Lerneinheiten (jede Form eine) | **322** |
| Lückensätze, drei je Lerneinheit | **966** |
| falsche Schreibweisen, drei je Lerneinheit | **966** |
| Formen mit entschiedener Heimat (Kollisionen der Liste) | 19 |

**Eine Abweichung von der Planung**, und sie steht hier, damit sie nicht
untergeht: geplant waren „rund 45 Ebenen" über alle drei Etappen. Nachgezählt
sind es 51 — die Liste 1/2 hat 30 Gruppen, nicht die 26, die ich angenommen
hatte.

### Was die Tore halten

Das Untertor `deutsch` misst bei jedem Lauf:

- jedes der 322 Lernwörter steht in `docs/referenz/ISB-Grundwortschatz-34.txt`
  — gelesen mit einem **groben Sieb**, nicht mit demselben Zerleger, der die
  Daten gebaut hat;
- 234 Einträge in 15 Ebenen (die Gegenrichtung: was fehlt, fällt an der Zahl auf);
- alle 966 Sätze gegen die vier Satzregeln;
- drei verschiedene falsche Schreibweisen je Wort;
- eine Begründung je Ebene und je Besonderheit, jede mit ihrem Beleg;
- **kein Profil sieht mehr als vier Welten** (fiona 4 · lea 4 · stephan 3 ·
  violeta 3).

Sechs stehende Gegenproben halten das fest, alle sechs schlagen gemessen an.

### Was offen bleibt

- **Der Rauchtest kennt die Deutsch-Welt noch nicht.** `WELT_VON` in
  `tor/chromium.mjs` findet sie, aber es gibt keinen Abschnitt `--nur=deutsch`,
  der eine Runde durchspielt. Geprüft ist die Welt damit im Inhalt, nicht im
  Spielen; nachgesehen habe ich sie von Hand, in sechzehn Aufnahmen auf
  844 × 390.
- **Die Deutsch-Wand trägt zwei Kacheln** und wirkt dadurch leer. Das füllt
  sich mit Etappe 2 (Wiederholung 1/2) und 3 (Sprache untersuchen) auf vier.
- Die Referenz `ISB-Grundwortschatz-34.txt` enthält zwei Artefakte des
  PDF-Auszugs („Geschichte, G e-⏎sicht" und „n e-⏎ben"). Sie ist **nicht**
  berichtigt worden — das Tor macht sie beim Lesen rückgängig, damit der Text
  die Quelle bleibt und nicht meine Abschrift.

---

## Etappe 2 — gebaut, gemessen (04.10.2026)

Die Zahlen sind gezählt, nicht geschätzt; das Untertor `deutsch` rechnet sie
bei jedem Lauf nach.

| | gezählt |
|---|---|
| Gruppen der amtlichen Liste 1/2 | 30 |
| davon Ebenen im Spiel | **24** (die sieben „nicht-regelhaften Besonderheiten" sind eine) |
| Einträge | **245** |
| verschiedene Einträge | **244** — „suchen" steht zweimal da |
| Lerneinheiten | **278** — ein Paar wie „gehen – geht" sind zwei |
| Lückensätze | **278**, einer je Einheit |
| falsche Schreibweisen | 834, drei je Einheit |

**Das Konzeptpapier sagte „244 Wörter".** Das war die Zahl der verschiedenen
Einträge, und sie ist richtig — sie heißt nur etwas anderes als „so viel ist zu
lernen". Beides steht jetzt da.

### Zwei Abteilungen, und der Schnitt ist gemessen

Auf dem Zielgerät (844 × 390) stehen **sieben Kacheln je Reihe und drei Reihen
ins Bild — einundzwanzig.** Vierundzwanzig Ebenen in einer Wand wären unten
herausgelaufen, genau wie die Rechtschreibwand in E26b. Der Schnitt ist deshalb
keiner von mir, sondern der der amtlichen Liste selbst: sie führt ihre Gruppen
unter drei Überschriften.

| Abteilung | Ebenen | aus der amtlichen Überschrift |
|---|---|---|
| **Hören und Silben** | 17 | „Nutzung des phonologischen und des silbischen Prinzips" |
| **Ableiten und Merken** | 7 | „Nutzung des morphologischen Prinzips" · „Schreibungen, für die nicht auf Strategien zurückgegriffen wird" |

Die Deutsch-Welt hat damit **vier Kacheln** statt zwei: Rechtschreibung, Hören
und Silben, Ableiten und Merken, Probe. Der Backlog-Eintrag „die Deutsch-Wand
trägt zwei Kacheln und wirkt leer" ist damit erledigt.

### Die Liste widerspricht sich wieder — diesmal zweimal

Sie sagt von sich: *„Jedes Wort des Grundwortschatzes ist nur einem besonderen
Übungsschwerpunkt zugeordnet."* Nachgezählt stimmt das hier **zweimal nicht**:

- **„suchen"** steht unter `<en>` **und** unter `<ch>`.
- **„spielen"** steht als Grundform von „spielen – spielt" unter `<Sp>` und
  noch einmal für sich unter `<ie>`.

`HEIMAT12` löst das nach **einem** Satz statt von Fall zu Fall: ein Wort gehört
dorthin, wo seine **eigene** Schwierigkeit liegt. Die Endung -en haben auch
„brauchen" und „machen"; das `<ch>` in „suchen" ist das, was man sich merken
muss. Und „spielen – spielt" trägt mehr als „spielen" allein.

### Was geteilt wird statt zweimal dazustehen

`doppelt` hat beim ersten Lauf drei echte Dopplungen gemeldet, und alle drei
sind **zusammengelegt**, nicht eingetragen:

- die Maschine, die aus einem Wort drei falsche Schreibweisen macht
  (`verschreiberMit` in `deutsch.js`),
- die neun Umformungszeilen für Phänomene, die es in beiden Abteilungen gibt
  (ie, tz, ck, ß, doppelte Mitlaute, Umlautung, Verhärtung, Mitsprechen,
  r nach dem Selbstlaut),
- die Prüfung der vier Satzregeln in `tor/inhalt.mjs` (`pruefeSaetze`).

Eingetragen wurden nur die **Datentabellen**, die sich allein in der Form
gleichen — und jede mit einem Satz, warum.

### Ein eigener Raum: An der Quelle

Die 24 Ebenen führen **nicht** in den Märchenraum. Dort führen schon sechzehn
hinein; mit vierzig wäre der Raum nach dem dritten Tag voll und die restlichen
siebenunddreißig Ebenen gäben nichts mehr. Ein Raum ist ein Versprechen auf
drei Tiere.

**„An der Quelle"** mit Ente, Elch und Eidechse — den letzten drei gemalten
Tieren ohne Raum. Und „Quelle" steht in der amtlichen Liste 1/2, unter den
Wörtern mit `<Qu>`: der Zusammenhang ist wieder keiner, der erfunden werden
musste.

---

## Etappe 3 — gebaut, gemessen (04.10.2026)

Zehn Ebenen und eine eigene Probe. Der LehrplanPLUS führt für die dritte
Jahrgangsstufe im Lernbereich *Sprache untersuchen* vier Dinge; sie stehen
jetzt als Daten in `src/inhalt/sprache.js`.

| Ebenengruppe | Ebenen | Aufgaben | woher der Stoff kommt |
|---|---|---|---|
| Wortarten | 5 | 520 | aus den 600 Lernwörtern — mit **ihren** Sätzen |
| Zeitformen | 3 | 84 | aus den Paaren der amtlichen Liste plus Hilfsverbtafel |
| Satzarten | 1 | 30 | 30 eigene Sätze, zehn je Art |
| Satzglieder | 1 | 90 | 30 eigene Sätze, jeder mit allen dreien |
| **zusammen** | **10** | **724** | |

Je Wortart: Nomen 224 · Verb 182 · Adjektiv 56 · Artikel 9 · Pronomen 49.

### Die Zusage „dieselben Sätze" — wo sie gilt und wo nicht

Für die **Wortarten** ist sie eingelöst: jede Aufgabe nimmt ein Lernwort, das
schon dasteht, und den Satz, in dem es schon steht. Kein zweiter Satz, kein
zweites Wort. Die Stelle der Marke kommt aus der **Lücke** des Satzes und nicht
aus einer Suche — „Mein kleiner Finger tut weh" enthält „ein" zweimal.

Für **Satzarten** und **Satzglieder** gilt sie nicht, und der Grund ist
gemessen: von den 1244 vorhandenen Sätzen sind 1136 Aussagen, 100 Fragen und
**acht** Ausrufe. Wer bei dieser Verteilung immer „Aussage" tippt, hat 91 %.
Und Satzglieder brauchen eine Auszeichnung, die kein Satz mitbringt.

### Gefragt wird nach dem Markierten

Nicht „wo ist das Nomen?", sondern „was für ein Wort ist das markierte?". Die
Ebene heißt nach dem, **woran** sie übt, nicht nach der Antwort — eine
Nomen-Ebene zeigt deshalb auch Verben und Artikel. Sonst lernt ein Kind, auf
das zweite Wort zu tippen.

Bei einem Fehler kommt die Erklärung des **gewählten** Begriffs, nicht die des
richtigen: sie sagt, warum die Wahl nicht passt, und verrät die Lösung nicht.
Erst beim dritten Versuch löst der Bildschirm auf — dieselbe Leiter wie beim
Diktat.

### Der Begriffsregler

Der Lehrplan sagt *Nomen, Verb, Adjektiv*; viele bayerische dritte Klassen
sagen noch *Namenwort, Tunwort, Wiewort*. Welches Leas Klasse benutzt, weiß
niemand von uns sicher — **ein Regler im Elternbereich schaltet die
Beschriftung um, statt dass es geraten wird.** Ab Werk die Fachbegriffe, weil
die bis zum Abitur gelten. Eine Tafel, zwei Spalten; der Regler wählt die
Spalte, nicht die Liste.

### Zwei Proben, ein Mechanismus

`PROBEN_FELD` in `spiel.js` sagt, welche Ebenen eine Probe zusammenliest und
woher ein Gegenstand weiß, in welche davon er gehört. Die Wörterprobe liest die
fünfzehn Rechtschreibebenen, die Sprachprobe die zehn Sprachebenen; beide über
denselben Code. Die Heimat eines Sprachgegenstands wird dabei aus `aufgabenZu`
selbst gebaut — die einzige Auskunft, die nicht auseinanderlaufen kann.

Welcher Bildschirm eine Aufgabe trägt, entscheidet der **Gegenstand** und nicht
die Ebene: wer keine Knöpfe mitbringt, bekommt den Diktatbildschirm. In der
Probe liegen beide Sorten nebeneinander.

### Der Raum

Die zehn Ebenen führen vorerst in **„Im Märchen"**, den Raum der
Rechtschreibung — nicht gern, aber gemessen: gemalt sind 86 Tiere, und nach „An
der Quelle" sind genau zwei ohne Raum. Ein vierter Deutschraum braucht drei
neue Zeichnungen und ist eine eigene Runde.
