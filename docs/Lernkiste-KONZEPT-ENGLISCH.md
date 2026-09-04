# Konzept: Englisch — die vierte Welt

**Stand 04.09.2026, v356. Noch nichts davon ist gebaut.** Dieses Dokument
ist der Schritt 0 zu den Paketen E1 bis E12 im Backlog: drei Vorbilder
benannt, aufgeschrieben was sie TUN, ein Soll daraus abgeleitet, der
Abstand gemessen. Das Soll kommt aus der **Referenz**, nicht aus mir
(Regel 3) — bei einem Schulfach heisst Referenz zusätzlich: aus dem
Lehrplan, nach dem Lea unterrichtet wird.

---

## § 0 · Für wen — und das sind zwei verschiedene Kinder

| | Fiona | Lea | Stephan & Violeta |
|---|---|---|---|
| Alter, Stand | 6, **erste Klasse** | 8, **dritte Klasse** | erwachsen, **Abitur** |
| Englisch | ab Klasse 3, also **in zwei Jahren** | **ab jetzt**, LehrplanPLUS Bayern | lange her, seither wenig geredet |
| Liest | **nein** | ja, sicher | selbstverständlich |
| Vorwissen | keins | „ein bisschen was gelesen, ein, zwei Sätze gesagt" | **viel, aber eingerostet** |
| Das Problem | es gibt noch keins | Wortschatz aufbauen | **nicht Wissen, sondern Zugriff** |
| Was die App leisten soll | Ohr und Mut, sonst nichts | **das begleiten, was in der Schule läuft** | das Vorhandene **wieder erreichbar** machen |

Daraus folgt schon fast alles. Für Lea ist Englisch ein **Schulfach mit
einem Lehrplan**, und die App hat gefälligst denselben Wortschatz zu
benutzen wie ihr Unterricht — sonst lernt sie zweimal verschiedene
Wörter und hat von beidem die Hälfte. Für Fiona ist Englisch **kein
Schulfach**, sondern ein Spiel mit Klängen; sie liest nicht, also gibt es
für sie keine Buchstabe-zu-Bild-Aufgabe, keine geschriebene Antwort und
keine Rechtschreibung. Nicht „vereinfacht" — **anders**.

Und für Stephan und Violeta ist Englisch **weder Schulfach noch Spiel**,
sondern ein Wiederfinden: der Wortschatz ist da, er kommt nur nicht, wenn
man ihn braucht. Das ist eine dritte Aufgabe, keine schwerere Fassung der
zweiten — dazu § 2b.

Das ist genau das Muster, das in dieser App schon zweimal steht:
`schreiben:*` gehört nur Fiona, `rechnen:reihen` nur Lea. Die Welt
verschwindet für den anderen von selbst, weil `wer:[...]` an der Ebene
hängt und die Weltenwahl leere Welten wegfiltert. Englisch braucht dafür
keine neue Mechanik, nur die richtigen Einträge.

---

## § 1 · Schritt 0 — der Referenzabgleich

### Vorbild 1 · Studycat „VoicePlay" (Kinder 2–8, Englisch/Spanisch)

**Was es TUT.** Das Kind spricht ein Wort, und *im Spiel passiert etwas*:
ein Ballon platzt, ein verstecktes Ding kommt zum Vorschein. Ein
Ohr-Symbol sagt, wann es dran ist. In manchen Spielen kann das Kind
danach auf einen Gegenstand tippen und **die eigene Aufnahme hören**.
Die Erkennung ist **auf Kinderstimmen trainiert** und läuft **ganz auf
dem Gerät** — kein Netz nötig, nichts wird hochgeladen oder gespeichert.

**Was daraus zu übernehmen ist.** Zwei Dinge, und sie sind die wichtigsten
im ganzen Dokument:

1. **Sprechen ist eine TÜR, kein RICHTER.** Der Lohn fürs Sprechen ist,
   dass etwas passiert — nicht eine Note. Kein Prozentwert, kein
   „73 % Aussprache", kein rotes Kreuz auf die Stimme eines Kindes.
2. **Die eigene Stimme hören** ist die Rückmeldung, die wirklich trägt.
   Nicht das Urteil der Maschine, sondern das eigene Ohr am eigenen Wort.

**Was NICHT zu übernehmen ist.** Die auf Kinder trainierte Erkennung auf
dem Gerät. Studycat ist eine native App und bringt ihr eigenes Modell
mit; eine PWA aus einer HTML-Datei kann das nicht — dazu § 3.

### Vorbild 2 · Lingumi (Kleinkinder, Englisch, > 2 Mio. Nutzer)

**Was es TUT.** Kurze Einheiten, in jeder ein paar wenige Wörter, und in
jeder Einheit eine Sprechaufgabe an einer eigenen „child speech
detection". Der Aufbau ist streng: **hören, verstehen, dann erst
sprechen** — nie umgekehrt.

**Was daraus zu übernehmen ist.** Die **Reihenfolge**, und dass eine
Einheit klein ist. Nicht zwanzig Wörter und ein Test, sondern vier Wörter
und viermal Wiedersehen.

### Vorbild 3 · LehrplanPLUS Bayern + ISB-Wortschatzliste Jgst. 3/4

**Was es TUT.** Der bayerische Lehrplan legt für die Grundschule einen
**verbindlichen Wortschatz** fest — rund **140 Wörter für die
Jahrgangsstufen 3 UND 4 zusammen**, nach Themengebieten geordnet (my
family, animals, at school, colours, numbers, body, food and drink,
clothes, weather, time). Die Wörter werden ausdrücklich **nicht einzeln**
gelernt, sondern immer an den Redemitteln des jeweiligen Themengebiets.
Geschrieben wird in Klasse 3 **abschreibend, mit Vorlage** — Bilder
beschriften, Listen anlegen —, nicht frei.

**Was daraus zu übernehmen ist.** Der **Wortschatz selbst**, und zwar
vollständig. 140 Wörter über zwei Schuljahre sind so wenig, dass die App
sie **zu Ende bringen** kann. Das ist ein seltener Luxus: bei Erdkunde
sind es 107 Gebiete und die Welt hört dort nicht auf; hier gibt es eine
Liste, die ein Kind wirklich leerspielen kann.

Und zum Vergleich, damit die Zahl eine **Messstelle** hat (Regel 5):
Cambridge „Pre A1 Starters", die internationale Prüfung für 6- bis
12-Jährige, verlangt **über 500 Wörter**. Der bayerische Grundschulstoff
ist also gut ein Viertel davon. Wir bauen für den Lehrplan, nicht für die
Prüfung — Lea schreibt keine Starters-Prüfung, sie schreibt eine Probe.

### Der Abstand: null von sieben

Die App kann heute **nichts** davon. Kein englisches Wort, keine englische
Stimme, keine Höraufgabe. Der Abstand ist der ganze Weg — anders als bei
D2 oder D3, wo es Teile schon gab.

| Was die Vorbilder tun | die App heute |
|---|---|
| englischer Wortschatz nach Themen | — |
| Wort hören, Bild zeigen | — |
| Laute unterscheiden (minimal pairs) | — |
| nachsprechen, es passiert etwas | — (Mikrofon gibt es, auf **Deutsch**) |
| die eigene Stimme hören | — |
| geschriebenes Wort zum Bild (Klasse 3) | — |
| englische Vorlesestimme | — (`sagen()` steht fest auf `de-DE`) |

---

## § 2 · Was die Forschung zum Alter sagt — und was es fürs Spiel heisst

Vier Befunde, jeder mit einer Folge für den Bau:

**1. Hören kommt vor Sprechen, und dazwischen liegt eine stille Zeit.**
Kinder verstehen lange, bevor sie produzieren; Unterricht, der Sprechen
erzwingt, schadet mehr als er nützt.
→ **Das Mikrofon ist nie der Einstieg.** Eine Ebene beginnt mit Hören und
Zeigen. Sprechen kommt später und bleibt freiwillig.

**2. Grundschulkinder verkraften WENIGER als die 6 bis 10 neuen Vokabeln,
die für ältere Schüler gelten** — begrenztes Arbeitsgedächtnis, noch
wackelige Lautvorstellungen. Was zählt, ist **Wiedersehen über Zeit**,
nicht Menge je Sitzung.
→ **Vier neue Wörter je Sitzung, der Rest ist Wiederholung.** Das
Leitner-Fach, das für Rechnen und Schreiben schon in der App steckt
(C3b), ist genau dieses Werkzeug — es muss nur mit Wörtern statt mit
Aufgaben gefüttert werden.

**3. Chunks schlagen Einzelwörter.** „How are you?" wird als ein Stück
gelernt, nicht als drei Wörter mit Grammatik dazwischen.
→ Jedes Themengebiet endet mit **einem Satz, den das Kind wirklich sagen
kann**. Das ist derselbe Gedanke wie D3 („ein Satz zum Mitnehmen"), nur
zum Selbersagen statt zum Anhören.

**4. Deutschsprachige Kinder stolpern über vorhersagbare Laute:**
*th* (→ „sinking" statt „thinking"), *w* gegen *v* („wine" → „vine"),
die **Auslautverhärtung** (dog → „dock", bad → „bat" — im Deutschen ist
sie Pflicht, im Englischen ändert sie das Wort), und /e/ gegen /æ/
(„pet" gegen „pat").
→ Das ist keine Fehlerliste zum Anstreichen, sondern eine **Bauliste für
Höraufgaben**. Wer den Unterschied nicht *hört*, kann ihn nicht sprechen.
Genau dafür gibt es Spielform 2.

---

## § 2b · Und die Erwachsenen — ein ganz anderer Fall

Stephan und Violeta haben Abitur und seither wenig Englisch geredet. Das
ist kein „Lea, nur schwerer" — es ist ein eigener, gut untersuchter Fall,
und die Forschung dazu sagt vier Dinge, von denen drei überraschen.

**1. Der passive Wortschatz ist zwei- bis dreimal so groß wie der aktive.**
Sie *kennen* die Wörter. Was fehlt, ist der Weg vom Kennen zum Sagen.
→ Also **keine Vokabeln beibringen.** Die Aufgabe ist Zugriff, nicht
Erwerb.

**2. Produktion verfällt schneller als Verstehen** — was zuerst geht, ist
das Sprechen, nicht das Erkennen.
→ Also **produktiv abfragen**: das Wort **schreiben**, nicht aus vier
auswählen. Wiedererkennen misst genau das, was bei ihnen noch da ist, und
übt genau das, was sie nicht brauchen.

**3. Und der Befund, der die Reihenfolge umdreht.** „False beginners" —
Erwachsene mit Schulfremdsprache — schlagen echte Anfänger deutlich in der
**Produktion**, aber ihr **Hörverstehen ist auf das Niveau echter Anfänger
zurückgefallen**. Das Ohr geht zuerst.
→ Also ist Hören für sie **nicht die Aufwärmübung, sondern der harte
Teil**. Kein langsam Diktiertes: normales Tempo, verschliffene Wörter, ein
Satz statt eines Wortes. Genau die Aufgabe, bei der sie sich unangenehm
ertappt fühlen — und die einzige, die dort etwas bewegt.

**4. Die Lücke ist bei Wortverbindungen am größten**, nicht bei
Einzelwörtern. Man weiß *bill* und *make*, aber nicht, dass man *„Could we
get the bill?"* sagt und nicht *„Can I become the bill?"*.
→ Also **Wendungen statt Wörter** — und dazu das, was Deutschen mit
Schulenglisch verlässlich passiert: **falsche Freunde**. *become* ist nicht
*bekommen*, *eventually* nicht *eventuell*, *actually* nicht *aktuell*,
*gift* ist Gift im englischen Sinn nicht, sondern ein Geschenk, und ein
*Handy* heißt auf Englisch nicht Handy. Das ist der peinliche Wortschatz,
den ein Abiturient längst zu kennen glaubt — und beim Reden trotzdem
danebengreift.

### Was das für die Aufgaben heißt

Die Elternspalte der Profiltabelle (§ 2.1 im Backlog) passt bereits genau:
**nur tippen, nie Auswahl statt Tippen, sachlicher Ton, streng, 12
Aufgaben je Sitzung.** Das ist produktiver Abruf, und er steht dort seit
N1. Für Englisch heißt das ohne eine einzige neue Regel: sie **schreiben**
die Antwort. Fiona zeigt, Lea liest und schreibt ab, die Eltern
produzieren.

**Ein Nebeneffekt, der Arbeit spart:** die Erwachsenen brauchen **keine
Bilder**. Ihr Englisch kann also fertig sein, **bevor die 140 Zeichnungen
aus E4 existieren** — es hängt nur an der Wortliste und an der Stimme.

### Ein Widerspruch, den diese Prüfschleife gefunden hat

In der Profiltabelle steht für Stephan und Violeta **„Vorlesen: nein"**.
Für Englisch geht das nicht: eine Höraufgabe **ist** Vorlesen.

Der Widerspruch ist keiner, sobald man die Spalte richtig liest — sie
meint *Vorlesen als **Lesehilfe***, also die Frage laut sagen, weil das
Kind sie nicht lesen kann. Bei Englisch ist der Ton nicht die Hilfe,
sondern **der Gegenstand**. Zwei verschiedene Dinge unter einem Wort.

Das muss in der Tabelle stehen und nicht nur hier, sonst liest es ein Tor
falsch — und der Rauchtest würde entweder eine stumme Aufgabe durchwinken
oder eine richtige anschlagen. Nachgetragen als **QS3**.

---

## § 3 · Die Sprachfrage — ehrlich, mit Zahlen

Das ist der Teil, an dem dieses Konzept anders aussieht als eine
Werbeseite.

### Was Spracherkennung bei Kindern wirklich leistet

Gemessen an veröffentlichten Wortfehlerraten (WER) — je kleiner, desto
besser:

| Fall | WER |
|---|---|
| Whisper-Small, Kinder lesen vor (MyST, **englische Muttersprachler**) | **13,9 %** |
| dasselbe, eigens auf Kinderstimmen nachtrainiert | 9,1 % |
| Whisper-Small, Kinder sprechen frei (CSLU) | **32,0 %** |
| dasselbe, nachtrainiert | 27,2 % |

Das sind **Kinder, deren Muttersprache Englisch ist**, mit einem Modell,
das eigens für sie nachtrainiert wurde. Fast jedes dritte Wort geht
daneben, sobald sie frei sprechen.

Lea ist acht, spricht Deutsch und lernt Englisch seit ein paar Wochen.
Sie liegt in **jeder** Hinsicht schlechter als diese Messreihe: jünger,
Nicht-Muttersprachlerin, unsichere Lautbildung. Eine veröffentlichte Zahl
für genau ihren Fall habe ich nicht gefunden — aber die Richtung ist
eindeutig, und sie zeigt nach unten.

**Daraus folgt die härteste Festlegung dieses Konzepts:**

> **Aussprache wird nicht bewertet. Nie. Von keiner Zahl, keinem Balken,
> keinem Stern.**

Ein System, das bei jedem dritten Wort irrt, darf einem achtjährigen Kind
nicht sagen, ob es richtig gesprochen hat. Es würde in einem von drei
Fällen ein richtiges Kind korrigieren — und ein Kind, das lernt, dass
Englischsprechen bestraft wird, hört auf zu sprechen. Das ist kein
Datenschutz-Argument und kein Bequemlichkeitsargument, es ist ein
Messfehler-Argument: **das Werkzeug ist für dieses Urteil nicht genau
genug.**

### Was das Mikrofon stattdessen tut

Es ist eine **Tür**. Das Kind sagt „red", und der rote Ballon platzt.
Erkennt die App nichts, sagt sie es **über sich selbst, nicht über das
Kind**:

> „Ich hab dich nicht gehört. Tipp drauf, dann geht's weiter."

Nicht *„Das war nicht richtig."* Der Unterschied ist der ganze Punkt.

### Und was dabei wohin geht

Auf dem iPhone gibt es die Spracherkennung im Browser als
`webkitSpeechRecognition` (Safari ab 14.5) — die App benutzt sie schon
für Deutsch. Recherchiert und bestätigt:

- **Die Aufnahme geht an Apple.** Safari zeigt dazu selbst einen Hinweis.
  Es ist keine Erkennung auf dem Gerät.
- Apples eigene, **wirklich lokale** Erkennung (`SpeechAnalyzer`, ab
  iOS 26) hat **keine Web-Schnittstelle**. Eine PWA kommt nicht heran.
  Genau deshalb kann Studycat es und wir nicht: die sind eine native App.
- Das Tor „Nichts verlässt das Gerät" **merkt davon nichts** — es zählt
  Netzaufrufe der Seite, und die Erkennung läuft am Browser vorbei durchs
  Betriebssystem. Das Tor lügt nicht, es sieht nur woanders hin. Wer nur
  auf seine grüne Zeile schaut, hält eine Zusage für geprüft, die es nicht
  ist (Regel 1: eine Prüfung, die das nie melden kann, ist an dieser
  Stelle kein **Beweis**).

**Die Festlegung, entschieden am 04.09.:** Sprechen bleibt drin, aber
sichtbar und abschaltbar. Konkret:

1. Der Sprachmodus ist **aus**, solange ihn niemand einschaltet — wie
   heute.
2. Im Elternbereich steht **ein ehrlicher Satz**, kein Kleingedrucktes:
   *„Zum Erkennen schickt das iPhone die Aufnahme an Apple. Ohne
   Sprachmodus bleibt alles auf dem Gerät — spielbar ist die App auch
   dann vollständig."*
3. **Jede Aufgabe ist ohne Mikrofon lösbar.** Kein Weg durch die App
   hängt am Sprechen. Das wird nicht behauptet, sondern **geprüft** —
   siehe § 7, Tor E-b.

---

## § 4 · Der Inhalt — 140 Wörter, und sie sind zu schaffen

### Die Wirbelsäule: der verbindliche Wortschatz

Der Wortschatz kommt aus der ISB-Liste zum LehrplanPLUS, geordnet nach
den Themengebieten des Lehrplans. Damit deckt sich das, was Lea in der
App übt, mit dem, was sie in der Probe braucht.

**Offen und ehrlich: die vollständige Liste liegt mir noch nicht vor.**
Der Netzzugang dieser Umgebung sperrt `isb.bayern.de` und
`lehrplanplus.bayern.de`; ich habe die Themengebiete und Stichproben von
Wörtern über Suchtreffer bestätigt, aber nicht die Liste selbst. **Das
ist Paket E1** und die Vorbedingung für alles andere — eine Wortliste, die
ich mir ausdenke, wäre genau der Fehler, den Regel 3 verbietet: das Soll
käme dann aus mir statt aus der **Referenz**.

Bestätigte Themengebiete und Stichproben:

| Themengebiet | belegte Wörter (Stichprobe) |
|---|---|
| my family | brother, family, father, mother, sister, friend |
| animals | cat, dog, fish, hamster, horse, mouse, pet, rabbit |
| at school | blackboard, book, chair, class(room), pen, pencil, picture, rubber, school(bag), teacher |
| colours | black, blue, brown, grey, green, orange, pink, red, white, yellow |
| numbers | 1–12, dazu 15, 30, 45 |
| food and drink | apple, bread, butter, cheese, chicken, chips, chocolate, egg |
| body · clothes · weather · time | im Lehrplan genannt, Wörter noch zu holen |

### Zwei Wortschätze, nicht einer

- **Lea:** die volle Lehrplanliste, Themengebiet für Themengebiet.
- **Fiona:** eine **Teilmenge**, ausgewählt nach *hörbar und zeigbar* —
  Tiere, Farben, Zahlen 1–10, Körperteile. Alles, was sich als Bild
  hinstellen lässt. Keine Wörter wie „about" oder „please", die man nicht
  malen kann.

Fionas Liste ist eine **abgeleitete Teilmenge**, keine zweite Liste. Sonst
stünde derselbe Wortschatz zweimal da, und eine der beiden Fassungen
**veraltet** (Regel 6). Im Datenmodell heisst das: ein Feld `bild` am Wort,
und Fionas Vorrat ist „alle mit Bild".

### Die Bilder

140 Wörter wollen Bilder, und die App ist **eine** HTML-Datei. Fotos
scheiden aus. Was passt, ist das, womit die App ohnehin gebaut ist:
**SVG-Pfade im Quelltext**, so wie die Streumotive, die Zackensterne und
die Buchstabenvorlagen. Klein, scharf in jeder Größe, mitgebacken.

Das ist **Arbeit und kein Code**, so wie D1 („ein Begleiter"). Deshalb ist
es ein eigenes Paket (E4) und deshalb steht dort eine Zahl: **wie viele
Bilder fehlen noch**, damit der Fortschritt sichtbar ist statt gefühlt.

---

## § 5 · Die Spielformen

Neun, und jede hat eine Begründung aus § 1 bis § 3. Die Spalte „ohne
Mikrofon" ist keine Höflichkeit, sondern die Zusage aus § 3.

| # | Form | für wen | liest? | ohne Mikrofon? |
|---|---|---|---|---|
| 1 | **Hören und zeigen** | Fiona, Lea | nein | ja |
| 2 | **Zwei Wörter, ein Laut Unterschied** | **alle drei** | nein | ja |
| 3 | **Sag es — und es passiert etwas** | Fiona, Lea | nein | **ja** (tippen geht immer) |
| 4 | **Wort zum Bild** | Lea | ja | ja |
| 5 | **Abschreiben** | Lea | ja | ja |
| 6 | **Der Satz, den du sagen kannst** | Lea | ja | ja |
| 7 | **Hören und schreiben** | Eltern | ja | ja |
| 8 | **Die Wendung, nicht das Wort** | Eltern | ja | ja |
| 9 | **Falsche Freunde** | Eltern | ja | ja |

Form 2 steht bei allen dreien — mit **verschiedenen Paaren**. Fiona
bekommt *dog/dock*, die Eltern *thirty/dirty* und *worse/verse*. Dieselbe
Mechanik, dieselbe Datei, ein Feld `stufe` am Paar. Nicht zwei Spiele, die
gleich aussehen und getrennt veralten (Regel 6, sonst **veraltet** eines
von beiden).

### 1 · Hören und zeigen

Die App sagt *„cat"*, vier Bilder stehen da, das Kind tippt. Das ist
**genau die Mechanik, die die App schon hat** — die Ebene-4-Aufgabe aus
Erdkunde („vier Städte, eine richtig"), nur mit Bildern statt Namen.
Billigste Form mit dem größten Zugewinn, und die einzige, die Fiona vom
ersten Tag an ohne Erklärung bedienen kann.

*Rückwärts geht auch:* Bild steht, vier Wörter werden **nacheinander
vorgelesen**, das Kind tippt beim richtigen. Kostet mehr Zeit, prüft
aber echtes Hören statt Wiedererkennen.

### 2 · Zwei Wörter, ein Laut Unterschied  *(die wichtigste Form)*

*think* / *sink*. *wine* / *vine*. *dog* / *dock*. *pet* / *pat*.
Zwei Bilder, ein Wort wird gesagt, das Kind tippt das gehörte.

Warum das die wichtigste Form ist: es sind **genau die vier Stolperstellen
deutschsprachiger Kinder** aus § 2. Und es ist die einzige Form, die den
Unterschied trainiert, **ohne dass die App die Aussprache des Kindes
beurteilen muss** — sie beurteilt das Ohr, und das kann sie sauber.

Die Maschine hat hier keinen Messfehler: Sie hat das Wort gesagt, sie
weiss, welches. Ein richtiger Tipp ist richtig. Kein WER, keine
Unsicherheit.

Die Paare stehen als Daten in der Liste, mit dem Grund dabei — nicht als
Zufallsauswahl, denn ein zufälliges Paar prüft eine zufällige Sache.

### 3 · Sag es — und es passiert etwas

Ein Bild, das Ohr-Symbol, und wenn das Kind spricht, **passiert etwas
Sichtbares**: der Ballon platzt, das Tier wacht auf, die Farbe fliesst
ins Bild. Nach Studycat.

Drei Regeln, alle drei aus § 3:

- **Kein Urteil.** Verstanden = die Tür geht auf. Nicht verstanden = *„Ich
  hab dich nicht gehört"*, und der Tippweg steht offen.
- **Höchstens zwei Anläufe**, dann geht es weiter. Ein Kind dreimal
  wiederholen zu lassen, weil die Maschine schlecht hört, ist die
  Bestrafung aus § 3 in langsam.
- **Nachher die eigene Stimme hören.** Falls die Aufnahme zu bekommen ist
  (`MediaRecorder` neben der Erkennung) — das ist zu **messen**, nicht zu
  versprechen. Steht als offene Frage in E6.

### 4 · Wort zum Bild  *(Lea)*

Das geschriebene *cat* zu einem von vier Bildern. Ab Klasse 3 sieht der
Lehrplan Lesen im Wortumfang ausdrücklich vor. Für Fiona gibt es das
nicht — sie liest noch kein Deutsch.

### 5 · Abschreiben  *(Lea)*

Der Lehrplan sagt für Klasse 3 **abschreibend, mit Vorlage**: Bilder
beschriften, Listen anlegen. Also **nicht** frei buchstabieren, sondern:
Wort steht als Vorlage, Buchstaben liegen daneben, das Kind legt es. Die
Bausteine dafür (Buchstabenkarten, Ziehen, Nachsicht beim Treffen) hat die
App aus N2a schon.

### 6 · Der Satz, den du sagen kannst  *(Lea)*

Am Ende eines Themengebiets **ein Chunk**: *„I've got a brother."* —
*„My favourite colour is blue."* Hören, zusammensetzen, sagen. Das ist
Befund 3 aus § 2, und es ist die Form, die aus Vokabeln Sprache macht.

---

### 7 · Hören und schreiben  *(Eltern)*

Ein **ganzer Satz**, einmal gesprochen, in normalem Tempo — nicht
buchstabiert, nicht verlangsamt. Geschrieben wird, was ankam.

Das ist Befund 3 aus § 2b in einer Aufgabe: Erwachsene mit Schulenglisch
halten sich fürs Hören für zu gut und sind es nicht. Ein zweites Mal
Hören gibt es, aber es wird **gezählt** — nicht bestraft, nur gezählt.
Eine Zahl, die man sieht, wirkt ohne Strafe.

Bewusst **nicht** verlangsamt: langsames Englisch übt langsames Englisch.
Was am Flughafen gesprochen wird, ist schnell.

### 8 · Die Wendung, nicht das Wort  *(Eltern)*

Deutsch steht da, Englisch wird getippt — aber nie ein Einzelwort:
*„Können wir zahlen?"* → *„Could we get the bill, please?"*

Mehrere Lösungen gelten. *„Could we have the bill"* ist genauso richtig.
Die App hält deshalb **eine Menge** richtiger Antworten je Wendung, keine
einzige — sonst prüft sie Auswendiglernen statt Können. Die Nachsicht
beim Vergleichen gibt es in der App schon (Schreibtoleranz aus R6); für
Englisch kommt dazu, dass Groß- und Kleinschreibung und der Punkt am Ende
egal sind.

### 9 · Falsche Freunde  *(Eltern)*

Ein deutscher Satz mit einer Falle: *„Ich habe einen Brief bekommen."*
Zwei englische Fassungen stehen da, eine mit `become`. Welche stimmt?

Das ist die einzige Form, in der die App **die typische Falle** zeigt statt
sie zu vermeiden — und sie funktioniert nur, weil beide Fassungen plausibel
aussehen. Ein falscher Freund, den man erkennt, wenn man ihn sieht, ist
keiner mehr; genau darum geht es.

Und es ist die Form mit der besten Trefferquote fürs Geld: die Liste ist
kurz (rund dreißig Fallen tragen die meisten Fehler), sie ist **speziell
für Deutschsprachige** richtig, und sie braucht **kein einziges Bild**.

---

## § 6 · Wie es in die App passt

Sehr gut, und das ist kein Zufall: die Trennung, die C3 („Aufgabentyp ohne
Karte") eingezogen hat, war genau dafür da.

```
WELTEN         + { id:'englisch', name:'Englisch', farbe:1 }
EBENEN         + englisch:hoeren     wer:['fiona','lea']
               + englisch:laute      (alle - mit `stufe` am Lautpaar)
               + englisch:sprechen   wer:['fiona','lea']
               + englisch:lesen      wer:['lea']
               + englisch:schreiben  wer:['lea']
               + englisch:saetze     wer:['lea']
               + englisch:diktat     wer:['stephan','violeta']
               + englisch:wendungen  wer:['stephan','violeta']
               + englisch:freunde    wer:['stephan','violeta']
                 (alle mit art:'englisch')
weltVon(e)     + art === 'englisch' → 'englisch'
silhouette()   + ein Zeichen für die Welt „englisch"  ← sonst leere Kachel
src/inhalt/englisch.js   Wortschatz, Themengebiete, Lautpaare, Wendungen,
                         falsche Freunde

Je Profil sichtbar: Fiona 3 Ebenen, Lea 6, die Eltern 4. Neun Einträge,
aber nie mehr als sechs auf einem Bildschirm — die Kachelwand fasst zwölf
(Q13/Q27), das ist also unkritisch.
```

**Was schon da ist und mitbenutzt wird:** Leitner-Fach je Ebene und Profil,
Sterne und Balken, Aufkleber und Abzeichen, das Forscherbuch mit Kapiteln,
die Vorlese-Stimme, der Sprachmodus samt seinem Zustand aus F13, die
Nachsicht beim Treffen, `passt` und `ansicht` für den Grundriss.

**Was neu gebraucht wird — und dabei ein Fund:**

`sagen()` steht heute fest auf `u.lang='de-DE'`, und `stimmeSuchen()`
filtert `v.lang.startsWith('de')`. **Für Englisch muss beides je Ebene
umschaltbar sein.** Dabei fällt ein Risiko auf, das kein Tor heute sähe:

> Findet das Gerät **keine englische Stimme**, ist die halbe Welt stumm —
> und für Fiona, die nicht liest, ist eine stumme Aufgabe **gar keine
> Aufgabe**, sondern vier Bilder ohne Frage.

Das ist derselbe Fehler wie F15 (`speechSynthesis` lief gar nicht, und
kein Tor merkte es). Also braucht es eine sichtbare Auskunft und ein Tor
dafür — Paket E2 und Tor E-c.

---

## § 7 · Was gemessen wird

Ohne Tore geht hier nichts an den Start. Sieben, und jedes mit einer
Gegenprobe, die zuerst prüft, ob ihr Eingriff angekommen ist (Regel 10).

| Tor | prüft | Gegenprobe schlägt an, wenn |
|---|---|---|
| **E-a** `inhalt` | jedes Wort hat Themengebiet, Vertonung und (falls für Fiona) ein Bild; jedes Lautpaar hat einen Grund | ein Wort verliert sein Bild und steht trotzdem in Fionas Vorrat |
| **E-b** `smoke` | **jede** Englisch-Aufgabe ist ohne Mikrofon zu Ende zu spielen | ein Weg verlangt Sprechen |
| **E-c** `smoke` | fehlt die englische Stimme, sagt die App es — statt stumm zu bleiben | die Stimmensuche findet nichts und die App schweigt |
| **E-d** `smoke` | die Sprechaufgabe endet nach zwei Anläufen und wertet nie eine Aussprache | ein dritter Anlauf erscheint; oder irgendwo steht eine Aussprachezahl |
| **E-e** `passt` | die vierte Weltkachel läuft auf keiner der sieben Größen über | die Weltenwahl bekommt eine fünfte Karte |
| **E-f** `smoke` | die Elternaufgaben verlangen eine **getippte** Antwort, nie eine Auswahl | eine Elternebene bietet vier Möglichkeiten an |
| **E-g** `inhalt` | jede Wendung hält **mehrere** gültige Antworten; jeder falsche Freund hat beide Fassungen | eine Wendung steht mit genau einer Lösung da |

### Die vierte Weltkachel — gemessen, nicht behauptet

**Der erste Entwurf dieses Dokuments hat bei E3 „`passt` grün mit vier
Weltkarten" versprochen. Diese Prüfschleife hat es nachgemessen, und so
einfach ist es nicht.**

Gemessen wurde mit einer eingebauten vierten Welt, gebaut, `passt` über
alle sieben Größen (Messstelle: `dist/index.html`, Chromium, 04.09.):

| | |
|---|---|
| echte Überläufe | **0** |
| Ratschenwerte, die sich ändern | **38** |
| die Wand fasst (iPhone SE quer) | **genau 4** Kacheln, die 5. fällt raus |

Also: **die vierte Welt passt — die fünfte nicht.** Englisch ist die
letzte Welt, die auf das Zielgerät geht. Wer danach eine fünfte will,
braucht einen anderen Grundriss, keine weitere Kachel.

Und sie ist nicht umsonst. Vier Karten teilen sich dieselbe Breite, also
schrumpft **jedes vorhandene Weltbild**:

| Welt | vorher | mit vier Welten |
|---|---|---|
| Erdkunde | 214 pt | **127 pt** (−41 %) |
| Rechnen | 54 pt | 32 pt |
| Schreiben | 47 pt | 28 pt |

Das ist **kein Fehler, sondern ein Preis** — und einer, den ein Blick
beurteilen muss, kein Tor (Regel 4: kein Tor ersetzt den **Blick**).
Deshalb gehört in E3 ein Schritt, der im ersten Entwurf fehlte: *die
Weltenwahl mit vier Karten ansehen, dann entscheiden, dann `--neu`* — mit
der Begründung im Einchecker. Ein `--neu` ohne Blick wäre das Stillegen
einer Ratsche, die gerade das Richtige gemeldet hat.

**E-b und E-d sind die beiden, um die es geht.** Sie prüfen keine
Rechnung, sondern eine **Zusage an ein Kind** — und eine Zusage, die
niemand nachmisst, ist eine Absichtserklärung.

Und ein Wort zur Ehrlichkeit von E-b: es misst, dass die App **ohne
Mikrofon spielbar** ist. Es misst **nicht**, wohin die Aufnahme geht, wenn
das Mikrofon an ist — das kann kein Tor dieser App, weil die Erkennung am
Browser vorbeiläuft (§ 3). Diese Grenze gehört in den Quelltext des Tors,
nicht nur in dieses Dokument: sonst liest sie in einem Jahr jemand als
„geprüft" (Regel 5 — jede Zahl trägt ihre **Messstelle** mit, und diese
hier trägt sie besonders nötig).

---

## § 8 · Was bewusst NICHT kommt

- **Keine Aussprachenote.** Begründet in § 3, und zwar mit Zahlen.
- **Keine Grammatikregeln.** Chunks, sonst nichts. Ein Achtjähriger lernt
  „I've got", nicht das Present Perfect.
- **Keine Übersetzungsaufgaben Deutsch → Englisch.** Bild → Wort, nicht
  Wort → Wort. Das ist die Reihenfolge, in der Sprache entsteht.
- **Kein Streak, kein Tageszwang.** Wie bei A4h entschieden: eine ruhige
  Zeile, kein Druck.
- **Keine aufgenommenen Sprachdateien.** Sie sprengen die eine Datei;
  Vorlesen macht das Gerät (§ 6).
- **Kein Cambridge-Wortschatz.** 500 Wörter sind das falsche Ziel für ein
  Kind, das gerade anfängt — der Lehrplan ist die Referenz, nicht die
  Prüfung.

---

## § 9 · Die Reihenfolge

Zwölf Pakete. Die Zerlegung folgt einer Regel: **nach jedem Paket ist die
App spielbar** — kein halbes Fach im Auslieferungsstand.

| Paket | was | Abnahme |
|---|---|---|
| **E1** | Wortschatz holen und eintragen: ISB-Liste, Themengebiete, Fiona-Teilmenge | `inhalt` zählt die Wörter je Themengebiet und meldet, wenn eins leer ist |
| **E2** | Englische Stimme: `sagen()` je Ebene, Stimmensuche, Auskunft wenn keine da ist | Tor E-c |
| **E3** | Vierte Welt, erste Ebene: **Hören und zeigen** | am Gerät gespielt; `passt` grün mit vier Weltkarten (E-e) |
| **E4** | Die Bilder — SVG je Wort. **Zahl offen halten:** wie viele fehlen | `inhalt` meldet jedes Wort ohne Bild, das Fiona bekommen soll |
| **E5** | **Zwei Wörter, ein Laut Unterschied** — die Lautpaare mit Grund | Tor E-a; und die vier Stolperstellen aus § 2 sind alle vertreten |
| **E6** | **Sag es** — Sprechaufgabe, zwei Anläufe, kein Urteil; eigene Stimme prüfen | Tore E-b und E-d |
| **E7** | Lea liest: **Wort zum Bild** | am Gerät |
| **E8** | Lea schreibt: **Abschreiben mit Vorlage** | am Gerät; `passt` für die Buchstabenkarten |
| **E9** | **Der Satz, den du sagen kannst** + Abzeichen je Themengebiet | Abzeichen erscheint erst, wenn das Gebiet voll ist |
| **E10** | Eltern: **falsche Freunde** — rund 30 Fallen, zwei Fassungen je Falle | Tor E-g; und E-f (getippt, nie Auswahl) |
| **E11** | Eltern: **Wendungen** je Themengebiet, mit mehreren gültigen Antworten | Tor E-g; Groß-/Kleinschreibung und Schlusspunkt sind egal |
| **E12** | Eltern: **Hören und schreiben** — ganzer Satz, normales Tempo, zweites Hören wird gezählt | am Gerät; die Zahl der Wiederholungen steht im Elternbereich |

**E1 vor allem anderen — aber nur für Lea und Fiona.**  Ohne die richtige
Wortliste baut man ein Fach, das an Leas Unterricht vorbeigeht, und merkt
es erst bei der ersten Probe.

**E10 hängt an nichts.** Die falschen Freunde brauchen weder die
Lehrplanliste noch ein einziges Bild — sie sind eine eigene, kurze Liste,
und sie sind für Deutschsprachige richtig, nicht für irgendwen. **Solange
E1 blockiert ist, ist E10 das Paket, das laufen kann.** Nach E2 (englische
Stimme) und E3 (die vierte Welt) ist es der kürzeste Weg zu etwas, das
wirklich benutzt wird.

Drei Zielgruppen — und die Reihenfolge folgt nicht dem Alter, sondern
dem, was nicht blockiert ist.

