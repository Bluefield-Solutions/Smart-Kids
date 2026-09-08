# Inhalt-Audit — was in dieser App zu üben ist, und wie oft es sich wiederholt

*Aufgenommen am 8. September 2026 auf v553. Gemessen mit `npm run vielfalt`
an der gebauten Datei, je Profil mit seiner eigenen Tiefe.*

Alle bisherigen Audits dieses Verzeichnisses haben gefragt, wie die App
**aussieht** (Grafik) und wie sie sich **spielt** (Spiel). Dieses fragt, was
in ihr **drin** ist — und die erste Zahl beantwortet die Frage, mit der der
Auftrag anfing: „Wenn man beim zweiten Mal startet, kommen dann wieder die
gleichen Sätze?"

## Die eine Zahl

> **78 von 100 Profil-Ebenen tragen weniger als zwei volle Runden Vorrat.**

Eine Runde ist bei Fiona 6 Aufgaben, bei Lea 8, bei den Eltern 12. Eine
Ebene mit zwölf Gegenständen ist für einen Elternteil damit **eine** Runde:
die zweite Sitzung zeigt dieselben zwölf, nur gemischt. Das ist keine
Wiederholung im Sinne des Leitner-Kastens — der will Abstände —, sondern
Auswendiglernen einer Liste.

Die schärfsten Fälle, vor dieser Runde:

| Profil | Ebene | Vorrat | Runden |
|---|---|---|---|
| Eltern | Hören und schreiben | 12 | **1,0** |
| Eltern | Wendungen | 20 | 1,7 |
| Eltern | Falsche Freunde | 30 | 2,5 |
| Eltern | Länder Ozeanien | 3 | **0,3** |
| Eltern | Länder Nordamerika | 4 | **0,3** |
| Eltern | Kontinente | 6 | **0,5** |
| Lea | Flaggen Europa | 13 | 1,6 |
| Fiona | Flaggen Europa | **3** | **0,5** |
| Fiona | jede Länder- und Flaggenebene | **3** | **0,5** |

Gesund sind nur die **erzeugten** Ebenen: Fionas Plus und Minus (100
Aufgaben, 16,7 Runden), Leas Reihen (140, 17,5), das große Einmaleins (158,
13,2) und „Lies das Wort" (84, 10,5). Überall dort, wo Inhalt **aufgelistet**
statt gerechnet wird, ist er zu knapp.

## Drei Ursachen, nicht eine

**U1 · Der Vorrat ist zu klein.** Zwölf Diktatsätze, zwanzig Wendungen,
dreißig falsche Freunde. Das ist eine Liste, die jemand angelegt hat, damit
die Ebene existiert — nicht eine, von der jemand ein Jahr lang lernt.

**U2 · Die Tiefe wächst nicht mit.** Jedes Profil hat eine feste
`laenderTiefe`: Fiona 3, Lea 13, Eltern 17. Fiona sieht in Europa **drei**
Länder — heute, morgen und in einem Jahr. Für die Kontinente gibt es diesen
Mechanismus längst (`kontinentRunde` öffnet Runde für Runde), für Länder und
Flaggen nie. Dass die *falschen* Antworten aus dem ganzen Kontinent kommen,
macht es nicht besser: sie tauchen als Ablenker auf und werden nie gefragt.

**U3 · Die Sitzung ist länger als der Vorrat.** Bei den Eltern sind zwölf
Aufgaben je Runde die Regel. Jede Ebene unter 24 Gegenständen ist damit
strukturell eine Wiederholung.

## Der Fund, der alles ändert: 200 Umrisse liegen ungenutzt herum

Die Kartendaten in `src/geo/` enthalten **jeden** Länderumriss ihres
Kontinents — gezeichnet wird der ganze Kontinent, gefragt wird nur, was in
`src/inhalt/erdkunde.js` einen **Namen** hat. Gezählt:

| Kontinent | benannt | gebacken, aber namenlos |
|---|---|---|
| Europa | 17 | **34** (NOR SWE FIN PRT IRL HUN HRV SRB BGR SVK SVN ISL BLR LTU EST LVA ALB MKD BIH MNE MDA …) |
| Asien | 12 | **47** (KAZ UZB MNG SAU IRQ SYR ISR KOR PRK AFG ARE OMN …) |
| Afrika | 12 | **43** (LBY TUN NAM ZMB ZWE MOZ CMR CIV MLI SEN GHA …) |
| Nordamerika | 4 | 38 |
| Mittelamerika | 9 | 25 |
| Ozeanien | 3 | 10 |
| Südamerika | 12 | 3 |

Die Rohdaten (`roh/`, 79 MB Natural Earth) liegen nicht im Verzeichnis und
sind zum Bauen auch nicht nötig — **die Umrisse sind schon gebacken**. Ein
neues Land kostet damit einen Namen, einen Rang und eine Aussprache, keine
Kartenarbeit. Realistisch nutzbar (ohne Streugebiete, Überseegebiete und
Kleinststaaten) sind rund **100 zusätzliche Länder**.

Was ein neues Land **nicht** geschenkt bekommt: eine Flagge (die werden in
`src/inhalt/flaggen.js` aus Bauarten gezeichnet) und eine Hauptstadt (die
wird für Europa aus Natural Earth gebacken, für die anderen Kontinente
nicht). Beides ist Handarbeit, beides ist ohne Rohdaten möglich.

## Die Pakete

| | Paket | Was es bringt | Aufwand |
|---|---|---|---|
| 1 | **I1 · Englisch für Erwachsene** | 12→34 Diktatsätze, 20→60 Wendungen, 30→60 falsche Freunde | mittel |
| 2 | **I2 · Die Leiter** | Länder- und Flaggentiefe wächst mit dem Können; neue Ziele erscheinen erst als Ablenker | mittel |
| 3 | **I3 · Die Welt wird größer** | ~100 Länder mehr aus den schon gebackenen Umrissen | groß |
| 4 | **I4 · Rechnen mit mehr Arten** | Verdoppeln, Zerlegen, Nachbarzahlen, Uhrzeit, Geld | mittel |
| 5 | **I5 · Flaggen** | mehr Flaggen, mehr Verwechslungspaare | groß |
| 6 | **I6 · Englisch für Kinder** | Wortschatz und Sätze je Gebiet aufstocken | mittel |

### I1 · Englisch für Erwachsene — **gebaut (v554)**

Die drei Elternebenen waren die schärfsten Fälle der Tabelle und sind es
nicht mehr:

| Ebene | vorher | nachher | Runden |
|---|---|---|---|
| Falsche Freunde | 30 | **60** | 2,5 → 5,0 |
| Wendungen | 20 | **60** | 1,7 → 5,0 |
| Hören und schreiben | 12 | **34** | 1,0 → 2,8 |

Die Diktatsätze sind kein eigener Vorrat, sondern eine **Auswahl** der
Wendungen — sie sind mitgewachsen, weil die Wendungen gewachsen sind. Zwei
Listen wären zwei, die auseinanderlaufen: was zweimal dasteht, veraltet
einmal (Regel 6). Genommen ist nur, was die Neun-Wörter-Grenze hält: ein Diktat misst
das Hören, ab einer gewissen Länge das Behalten.

**Und die Grenze im Tor rechnet jetzt in Runden statt in Stück.** Vorher
stand dort „mindestens 25 falsche Freunde — das Konzept nennt rund dreißig"
und „mindestens 12 Diktatsätze". Die zweite Zahl hat den schärfsten Befund
dieses Audits nicht gemeldet, sondern **festgeschrieben**: zwölf war genau
der Wert, bei dem die zweite Sitzung die erste ist. Ab jetzt steht die
Grenze bei vier Runden für die Wendungen und die Fallen und bei zwei für die
Diktatsätze, gerechnet aus der Sitzungslänge der Eltern (Regel 2: Grenzen
anteilig, nie absolut). Nachgeprüft: auf zwölf zurückgedreht meldet das Tor
„nur 12 Diktatsätze — das sind 1.0 Runden, nötig sind 2".

### I2 · Die Leiter — **gebaut (v555)**

`laenderTiefe` war eine feste Zahl am Profil. Sie ist jetzt ein **Anfang**:
wer die offenen Länder kann, bekommt drei dazu. Dieselbe Bewegung, die es
für die Kontinente seit langem gibt (`kontinentRunde`) und die für Länder
und Flaggen nie jemand nachgezogen hat — bis auf die Zeile, die dort schon
steht: `warGesessen`, nicht `istGesessen`. Eine Stufe, die einmal offen war,
geht nicht wieder zu.

| | vorher | jetzt |
|---|---|---|
| Fionas Europa | 3, für immer | 3 → 6 → … → 17 |
| Fionas Afrika/Asien/Südamerika | 3 | 3 → 12 |
| Leas Europa | 13 | 13 → 17 |
| Ebenen unter zwei Runden | 78 von 100 | **63 von 100** |

Die fünfzehn, die dadurch aus der Mängelliste fallen, sind Fionas und Leas
Länder- und Flaggenebenen. Die verbleibenden 63 sind fast alle Elternebenen,
und deren Leiter steht schon oben — ihr Vorrat wächst nur noch mit I3.

**Der Fortschrittsbalken kann dabei sinken**, und das steht hier, weil es
auffällt: wer zwei von drei Ländern gesammelt hat und die nächste Stufe
öffnet, steht bei zwei von sechs. Der schlimmste Fall ist trotzdem
ausgeschlossen, und zwar rechnerisch: ein **voller** Balken kann nicht
einbrechen. Damit er voll ist, braucht jedes offene Land einen Aufkleber
(Fach 3) — und Fach 3 heißt auch Fach 2, die Stufe wäre also längst offen.
„Alles gesammelt" und „es kommt noch etwas" können nicht gleichzeitig
gelten. Der Haken auf der Station (N11) wird nie zurückgenommen.

### Und die Ablenker: zwei von heute, eine von morgen

Der Auftrag hat es vorgeschlagen — erst zeigen, was später drankommt, dann
danach fragen. Der erste Anlauf legte genau **eine** der drei falschen
Antworten hinter die Leiter. Der Rauchtest hat nachgemessen und das
Gegenteil gefunden: bei drei offenen Ländern liegen vierzehn von siebzehn
Flaggen jenseits der Leiter, also kamen im Schnitt **drei von vier**
Antworten von dort.

Das ist keine Kleinigkeit, sondern eine andere Aufgabe. Wer drei Flaggen
sieht, die er noch nie gesehen hat, und eine, die er kennt, braucht den
Namen in der Frage gar nicht zu lesen — er tippt auf die bekannte. Die Ebene
misst dann Vertrautheit statt Wissen, und sie meldet sich nie: die Antworten
sind ja richtig.

Also umgekehrt: **zwei Ablenker aus dem, was das Kind gerade lernt, und
genau einer von jenseits der Leiter.** Zwei bekannte zwingen zum
Unterscheiden, der eine unbekannte ist die Vorschau. Gemessen im Rauchtest:
`1 von 4 Antworten liegen jenseits der Leiter`.

### Und ein Abzeichen, das seit D2c niemand bekommen konnte

Die Leiter hat einen zweiten Fehler mitgenommen, den niemand suchte.
`erreichbar()` sagte den Abzeichen, was ein Profil je zu sehen bekommt —
gerechnet aus der **festen** Ländertiefe, mit dem Satz „Die Ländertiefe
wächst nicht" daneben. Deutschlands neun Nachbarn liegen auf den Rängen 4
bis 12, Fionas Tiefe war 3: „Du kennst alle Nachbarn von Deutschland" war
für sie ausgeschlossen — zu Recht, damals.

Mit der Leiter ist es das nicht mehr, und die Zeile wäre die zweite Stelle
gewesen, an der die alte Annahme steht — die stillste noch dazu: ein
Abzeichen, das nicht erscheint, sieht aus wie eines, das noch nicht verdient
ist. Im Buch stehen für Fiona jetzt **14 statt 12** Abzeichen; dazugekommen
sind „Nachbarn" (9) und „Hauptstädte" (13).

Das Tor hielt dieselbe Annahme fest („sie käme nie hin") und ist mitgewandert
— es prüft ab jetzt die Gegenrichtung, die genauso fehlschlagen kann: das
Abzeichen **muss** da sein. Die stehende Gegenprobe dazu wurde umgedreht;
ihr Eingriff ist die alte Fassung von `erreichbar`.

**Drei Arme im Nachweis**, weil zwei nichts bewiesen hätten: die Leiter fängt
bei drei an · wer die drei kann, sieht sechs · wer **zwei von dreien** kann,
sieht weiter drei. Ohne den dritten Arm hätte der zweite nur gezeigt, dass
irgendein Stand irgendetwas öffnet — eine Prüfung, die nie etwas meldet,
ist kein Beweis (Regel 1). Gemessen: `3 → 6 → ganz 17 von 17 · mit einer Lücke
bleibt es bei 3`.

**Vier stehende Gegenproben** halten I2 fest: die Leiter steigt nicht mehr ·
die Leiter öffnet ohne Können · alle Ablenker kommen von jenseits der Leiter ·
die Erreichbarkeit hängt wieder an einer festen Tiefe. Alle vier schlagen an.

### I3 · Die Welt wird größer — **gebaut (v556)**

45 Länder mehr, ohne eine einzige Zeile Kartenarbeit: **Asien 12 → 30,
Afrika 12 → 30, Europa 17 → 26**. Die Umrisse lagen alle schon gebacken im
Baum; `prototyp/bauen.mjs` sagt es selbst — *„Was gespielt wird, entscheidet
`erdkunde.js` — hier und nirgends sonst."* Ein neues Land kostet einen Namen,
einen Rang und eine Aussprache.

Dazu **45 neue Sätze zum Mitnehmen**, einer je Land: *„Kasachstan ist das
größte Land der Erde ohne Meer."* · *„Auf Madagaskar leben Lemuren — sonst
nirgends auf der Welt."* · *„In Island gibt es Vulkane und heiße Quellen
mitten im Eis."* Keine Einwohnerzahlen (die veralten), keine Hauptstädte (das
ist eine eigene Ebene) — das eine Bild, das ein Kind mit dem Namen verbindet.

| | vorher | jetzt |
|---|---|---|
| Länder | 69 | **114** |
| Gebiete gesamt | 107 | **152** |
| Ebenen unter zwei Runden | 63 von 100 | **54 von 100** |

**Europa hat eine Grenze, und sie ist gemessen.** Der erste Versuch legte
19 europäische Länder dazu (36 gesamt). `ziehen` hat es sofort gemeldet:
Griechenland fiel mit **18,1 pt** unter den Finger und bekam keine Nadel
mehr, Ungarn und die Slowakei lagen mit ihren Nadelköpfen **12,3 pt**
auseinander. Europas Karte trägt auf 844 × 390 keine 36 antippbaren Länder.

Zurückgestellt sind deshalb die zehn kleinsten — Serbien, Slowakei, Kroatien,
Bosnien und Herzegowina, Litauen, Albanien, Slowenien, Lettland,
Nordmazedonien, Estland. **Ihre Sätze bleiben geschrieben**: sie kosten
nichts und sparen die Arbeit an dem Tag, an dem Europa einen eigenen
Ausschnitt bekommt, wie ihn Mittelamerika schon hat. Das ist der nächste
Schritt für diesen Kontinent, und er braucht die Rohdaten.

**Zwei Tore hielten Annahmen fest, die mit den Ländern gefallen sind:**

*Jedes Land hat eine Flagge.* Das stimmte, solange jedes benannte Land eine
gezeichnete hatte. Die 45 neuen haben keine — Flaggen sind Handarbeit in
`flaggen.js`. Die Regel hätte zwei Auswege gelassen: 45 Flaggen an einem
Nachmittag zeichnen, oder 45 Länder wieder streichen, damit ein Tor grün
wird. Das zweite ist die Reihenfolge, in der Daten falsch werden. Jetzt
trennt `flaggeFragbar` das Gezeichnete vom Gefragten (`FLAGGEN_EXTRA` sagt es
selbst: „nur zum Zeigen, nicht zum Fragen"), und eine **Ratsche** hält fest,
dass die Zahl der gefragten Flaggen nicht sinkt. Das hat nebenbei einen
echten Fund freigelegt: Irland gegen Italien und Russland gegen Slowenien
sind auf dem Raster **nicht zu unterscheiden** — sie standen plötzlich in
derselben Auswahl, weil ihre Länder Namen bekamen.

*Jedes europäische Land steht auf der Hauptstädte-Ebene.* Die Hauptstadt
kommt gebacken aus Natural Earth; die neun neuen haben keine. Auch hier eine
Ratsche statt einer Blankoregel: **17** europäische Länder tragen eine, und
die Zahl darf nicht sinken — genau der Fehler, an dem Prag, Wien, Bern,
Kopenhagen und Luxemburg einmal eine ganze Fassung lang aus der Ebene
gefallen sind.

## Das Werkzeug

`npm run vielfalt` misst die Tabelle oben bei jedem Lauf neu. Es lädt die
**gebaute** Datei und fragt für jedes Profil `vorrat()` — nicht die
Datenmodule. Der Unterschied ist der ganze Befund U2: `src/inhalt/erdkunde.js`
kennt 17 europäische Länder, Fiona sieht drei.

Seit I2 nennt es **drei** Zahlen statt einer: *Anfang* (der Vorrat am ersten
Tag), *Leiter* (wohin er wächst, wenn alles Offene gekonnt ist) und *Ganz*
(was es überhaupt gibt). Gemessen wird die **Leiter** — eine Ebene, die bei
drei anfängt und bei siebzehn endet, ist keine Ebene mit drei Gegenständen.
Wer den Anfang misst, misst den ersten Tag und nennt ihn das Spiel.

`--tor` macht daraus eine Prüfung mit der Grenze von zwei Runden.
