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

*(Diese Zahl war zur Hälfte falsch — siehe I6 am Ende. Die Hälfte, die
stimmte, ist mit I1 bis I5 abgearbeitet; übrig sind zwei.)*

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
Ausschnitt bekommt, wie ihn Mittelamerika schon hat.

*(Dieser Tag ist I11, gleich unten. Der Satz „und er braucht die Rohdaten",
der hier stand, war falsch — sie liegen unter `roh/`, und I7 hat sie
benutzt.)*

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

### I5 · Die Flaggen — **gebaut (v557)**

35 Flaggen mehr (69 → 104), gezeichnet im vorhandenen Formenvorrat — keine
neue Bauart, kein Sonderfall. Dazu **sechs neue Verwechslungspaare**, und
die sind nicht erfunden, sondern echt: Mali gegen Guinea (Spiegelbild), Mali
gegen Senegal (nur der Stern), Irak gegen Syrien, Ungarn gegen Bulgarien.
Die Ebene „Verwechslungen" wächst damit von 22 auf **34** Gegenstände.

| Ebene | vorher | jetzt (Leiter) |
|---|---|---|
| Flaggen Europa | 17 | **23** |
| Flaggen Afrika | 12 | **28** |
| Flaggen Asien | 12 | **25** |
| Verwechslungen | 22 | **34** |
| Ebenen unter zwei Runden | 54 von 100 | **46 von 100** |

**Was der Blick gefunden hat, und kein Tor.** Drei Fehler standen in
Zeichnungen, die alle Prüfungen bestanden hatten:

- **Simbabwe** hatte keinen weißen Keil. `keil` gehört zur Bauart `dreieck`;
  bei `streifen` wird er stillschweigend ignoriert. Die Flagge war heil, nur
  falsch.
- **Syrien** war rot-weiß-schwarz. Seit Dezember 2024 führt das Land die
  Unabhängigkeitsflagge — grün oben, drei rote Sterne. Der Datenstand dieser
  App ist 2025; die alte wäre keine Vereinfachung gewesen, sondern eine
  falsche Auskunft.
- **Afghanistan** steht gar nicht mehr da. Welche Flagge das Land heute
  führt, ist umstritten. Eine Lern-App, die ein Kind auf eine der beiden
  festlegt, behauptet etwas, das nicht feststeht.

**Und ein Fehler in der Leiter, den erst die Flaggen sichtbar machten.**
`leiterTiefe` lief über *alle* Länder eines Kontinents, die Flaggenebene
fragt aber nur die mit gezeichneter Flagge. Ein Land ohne Flagge kommt
damit nie in eine Sitzung, wird nie gekonnt — und die Leiter blieb an ihm
hängen. Afrika hörte bei **15 von 28** auf, ohne dass etwas rot wurde: der
Vorrat war da, er wurde nur nie geöffnet. Dasselbe galt für die Hauptstädte.
Die Leiter läuft jetzt über das, was die Ebene wirklich fragt.

**Zwei Farbtöne stehen heller da, als die Fähnchenbücher sie führen.** Das
Raster misst den Abstand zweier Farben als geraden Weg durch den RGB-Würfel,
und dieser Weg unterschätzt genau eine Nachbarschaft: Blau gegen Grün.
Bulgariens amtliches `#00966E` liegt von Russlands `#0039A6` **108,6**
Einheiten entfernt — die Schwelle sind **110**. Zwei Einheiten, und das Tor
meldete „nicht zu beantworten" für ein Paar, das jeder Mensch auf Anhieb
trennt. Statt die Schwelle zu senken (dann fände das Tor nichts mehr) oder
das Paar auszunehmen (dann stünde eine unlösbare Aufgabe im Spiel), steht
dort jetzt das Grasgrün, das die meisten Darstellungen ohnehin zeigen.

### I4 · Drei neue Rechenarten — **gebaut (v558)**

Nicht mehr Aufgaben, sondern eine andere **Frage**. Fionas Vorrat war nie
knapp — 100 Aufgaben, 16,7 Runden. Knapp war die *Art*: sie rechnet seit
einem Jahr Plus und Minus. Drei neue Ebenen, eine je Könnensstufe, und jede
fragt auf dem Stoff, den es schon gibt, etwas anderes:

| Ebene | für | Aufgaben | was sie fragt |
|---|---|---|---|
| **Doppelt und halb** | Fiona | 29 | „Doppelt 7" · „Halb 14" · „3 + ? = 10" |
| **Was fehlt?** | Lea | 45 | „7 × ? = 42" — dieselben Reihen, umgedrehte Frage |
| **Prozent im Kopf** | Eltern | 50 | „25 % von 320" |

„Was fehlt?" ist nicht dieselbe Aufgabe wie „7 × 6": wer die Reihe aufsagen
kann, kommt bei der ersten Form durch — bei dieser muss er suchen. Deshalb
eine eigene Ebene und keine Beimischung.

**Und der Rauchtest musste rechnen lernen.** Er liest die Frage vom Schirm
und **rechnet selbst nach** — „ein Nachrechner, der die geprüfte Funktion
benutzt, prüft nichts". Sein Ausdruck traf vier Formen (`3 + 4`, `7 × 8`);
die drei neuen traf er nicht, und er meldete für alle drei Ebenen *„die
richtige Antwort ? steht nicht unter —"*. Das war kein Fehlalarm: er **konnte
die Ebene nicht spielen**. Jetzt kennt er sieben Formen — und die Ansage
darf auf drei Arten anfangen statt auf einer, denn „Drei plus wieviel ist
zehn?" ist genauso eine vorgelesene Frage wie „Was ist sieben plus vier?".

**Ein Anker wurde mehrdeutig, und das Tor hat es gefangen.** Fiona hat jetzt
zwei Rechenebenen; `art:'rechnen', wer:['fiona']` steht damit zweimal im
Bündel. Eine stehende Gegenprobe hätte ihren Eingriff nur zur Hälfte
angebracht und für immer „kam nicht an" gemeldet — `anker` hat es beim ersten
Lauf gefunden, bevor eine Sitzung damit vertan war.

### I6 · Was ein Mangel ist und was die Welt — **die Kennzahl war zur Hälfte falsch**

Die Schlagzeile dieses Audits — *78 von 100 Profil-Ebenen unter zwei Runden* —
war zur Hälfte kein Befund. „Länder in Nordamerika" hat vier Einträge, weil
Nordamerika vier Länder hat. Deutschland hat sechzehn Bundesländer. Das
Alphabet hat sechsundzwanzig Buchstaben. Eine Ebene, deren Vorrat **die Welt**
ist, kann nicht wachsen — und sie soll es nicht: wer sie „repariert",
erfindet Länder.

Dazu kommt, was beim ersten Zählen niemand nachgesehen hat:
`Leitner.sitzung` schneidet auf `Math.min(laenge, alle.length)`. Wer vier
Länder hat, bekommt eine Runde mit **vier** Aufgaben, nicht zwölf mit dreimal
denselben. Und dass dieselben vier in der nächsten Sitzung wiederkommen, ist
bei einem Leitner-Kasten kein Fehler, sondern der Sinn — er lebt von
Wiederholung mit Abstand.

Die Grenze gilt deshalb ab jetzt nur, wo der Vorrat eine **Liste ist, die
jemand geschrieben hat**: Sätze, Wendungen, Vokabeln, Fallen,
Verwechslungspaare, Rechenaufgaben. Die kann immer länger werden, und wenn
sie kürzer ist als eine Sitzung, hat jemand aufgehört zu schreiben.

**Gemessen nach allen fünf Paketen:**

> **2 von 104 Profil-Ebenen** liegen unter zwei Runden — beide dieselbe:
> „Hauptstädte in Europa" für die Eltern, 17 Städte bei 12 Aufgaben je Runde
> (1,4 Runden). 44 weitere liegen darunter, weil ihr Vorrat die Welt ist.

**Und das war der nächste Schritt** — I7, gleich unten: die neun europäischen
Länder aus I3 hatten keine gebackene Hauptstadt, weil sie zur Zeit des letzten
Backens noch nicht in `erdkunde.js` standen.

### I7 · Die neun Hauptstädte — **gebaut (v559)**

Der letzte gemessene Mangel des Audits, und er brauchte keine einzige neue
Zeile Inhalt: die neun europäischen Länder aus I3 (Portugal, Schweden, Ungarn,
Belarus, Bulgarien, Finnland, Norwegen, Irland, Island) trugen keine
Hauptstadt, weil `src/geo/` seit vor I3 nicht neu gebacken worden war. Ein
Umriss bekommt dort Name, Rang, Hauptstadt und **Stadtlage** nur, wenn er zur
Zeit des Backens in `erdkunde.js` steht — die neun standen im Spiel und nicht
in den Daten.

`npm run backen` trägt sie nach, aus derselben Quelle wie die siebzehn davor:
Natural Earth führt sie als `Admin-0 capital` samt deutschem Namen. Von Hand
geschrieben ist nur, was sich nicht rechnen lässt — die **zwei Ablenker** je
Land, nach der Regel, die schon für die siebzehn galt: die Stadt, die jemand
für die Hauptstadt *halten* könnte, weil sie größer oder bekannter ist.
Göteborg gegen Stockholm, Porto gegen Lissabon, Cork gegen Dublin.

**Island bekommt keine** und steht deshalb bei Luxemburg unter
`HAUPTSTADT_OHNE_ABLENKER`: nach Reykjavík kommt Kópavogur, und das ist ein
Vorort davon; die größte Stadt außerhalb des Hauptstadtgebiets ist Akureyri
mit 19 000 Einwohnern. Ein Ablenker, den niemand kennt, ist keiner — das steht
seit R6 dort, und es gilt für Island genauso.

> **Gemessen: 0 von 104 Profil-Ebenen unter zwei Runden.**
> „Hauptstädte in Europa" steht bei 26 Städten — 2,2 Runden für die Eltern,
> 3,3 für Lea. Die Ratsche in `inhalt` ist von 17 auf 26 gestiegen.

**Und die Zahl bleibt jetzt gemessen.** `npm run vielfalt --tor` steht seit
dieser Runde **in der Torkette**, direkt hinter `anker`: 1,9 Sekunden, weil es
die Seite einmal lädt und nichts zeichnet. Ohne diese Zeile wäre der ganze
Audit eine Momentaufnahme — und der Befund, mit dem er anfing, kann leise
zurückkehren: eine Ebene für ein weiteres Profil freizugeben kostet eine Zeile
und halbiert den Vorrat, ohne dass irgendetwas rot wird. Die stehende
Gegenprobe schneidet die Hörsätze auf acht (bei zwölf Aufgaben je Sitzung) und
verlangt, dass das Tor es sagt.

### I8 · Gestern und heute — **gebaut (v560)**

Bis hierher hat dieses Audit **Listen verlängert**. Das war die halbe
Antwort auf das, was der Auftrag sagte: „Es muss noch viel mehr Varianten
geben." Eine längere Liste ist keine Variante — es ist dieselbe Frage mit
mehr Zetteln. Die andere Hälfte ist eine **neue Frage auf demselben
Stoff**, und für die Eltern ist das der eine Stoff, an dem
deutschsprachige Erwachsene lebenslang hängen bleiben: die
unregelmäßigen Verben. Man *weiß*, dass „buy" unregelmäßig ist, und
schreibt unter Druck trotzdem „buyed".

**72 Verben, sechs volle Runden** — geordnet nach Klang und nicht nach
Alphabet: die -ought/-aught-Gruppe, die Reihe i–a–u, die o-e-Gruppe, das
-ew, die -t-Endungen und zuletzt die vier, die sich gar nicht ändern
(put — put — put). Wer sie so sieht, lernt Muster; wer sie alphabetisch
sieht, lernt Einzelstücke.

**Dieselbe Bauform wie die falschen Freunde, und das ist der Grund für die
Ebene.** Die Falle wird nicht angeboten, sondern *erkannt*: wer „catched"
tippt, bekommt an genau dieser Stelle die drei Formen zu sehen, statt nur
„falsch". Der Bildschirm ist derselbe; die `art` ist trotzdem eine eigene,
weil Vorlaufsatz, Kachelzeichen, Frage und Leitner-Stand es nicht sind.
Über „He ___ me his number." stünde sonst „Wie heißt der Satz auf
Englisch?" — der Satz steht ja schon auf Englisch. Er lautet jetzt „Wie
heißt das Verb in der Vergangenheit?".

**Die Zusage wird geprüft, nicht behauptet.** Der Vorlauf sagt wörtlich:
„Die Falle ist jedes Mal dieselbe: die regelmäßige Form auf -ed." Das ist
eine Aussage über Daten, und Daten wachsen — der zwölfte, der hier ein Verb
nachträgt, schreibt eine Falle hin, die ihm einfällt, und die Aufgabe
funktioniert weiter. `inhalt` **rechnet die regelmäßige Form aus der
Grundform** (die im Grund steht, nicht in einer zweiten Spalte) und
vergleicht: 69 von 72 stimmen mit der gerechneten Form überein, drei
stehen namentlich als Ausnahme, weil dort *beide* Formen gelten
(learnt/learned) und die Falle deshalb eine falsch geschriebene dritte ist.

Beim ersten Lauf war die Regel unvollständig und nicht die Daten: sie
wollte „flyed" sehen, wo „flied" stand — -y nach Konsonant wird -ied. Das
ist die erfreulichere Richtung.

**Der Prüfblock ist EINER für beide Ebenen**, ebenso die Schleife im
Rauchtest, die die Falle tippt und die Erklärung erwartet. Ein zweiter,
abgeschriebener Block wäre Regel 6 — und zwar besonders leise, weil eine
Kopie beim ersten Lauf grün ist.

### I9 · Das kleine Wort — **gebaut (v562)**

Die dritte Ebene in der Lückenbauform, und die, an der man am häufigsten
erkannt wird. Ein Deutscher, der fließend Englisch spricht, sagt „I am
waiting **on** the bus" — nicht, weil ihm ein Wort fehlt, sondern weil er
das deutsche „auf" mitübersetzt. Es ist der eine Fehler, den Jahre im
Ausland nicht abschleifen: die Präposition hängt am Verb, nicht am Sinn,
und muss deshalb *paarweise* gelernt werden.

**58 Fallen, knapp fünf Runden**, geordnet nach der deutschen Präposition
und nicht nach dem englischen Verb: auf, von, an, über, mit, vor, in, zu.
Wer die Liste pflegt, sieht dann sofort, welche Gruppe dünn ist. Die Falle
ist immer die **wörtliche Übersetzung**, und in jedem Grund steht, *welches
deutsche Wort* in die Irre führt — ohne diesen Halbsatz wäre die Auskunft
„so heißt es eben", und das lernt niemand.

**Was das Tor hier prüft, ist neu:** die Ebene verspricht „es fehlt genau
ein kleines Wort". Das bricht auf zwei lautlose Arten — jemand trägt eine
Wendung als richtige Antwort ein („for the"), und die Lücke ist keine mehr;
oder jemand erfindet eine Falle, die es im Englischen gar nicht gibt, und
sie ist dann kein Fehler, den jemand *macht*. `inhalt` hält beides gegen
eine **geschlossene Liste von 44 englischen Präpositionen**: gefragt werden
10 verschiedene, als Falle stehen 16 — alle daraus.

**Und ein Befund, den nur der Blick gefunden hat.** Das Eingabefeld ist
15 Zeichen breit, für alle Aufgaben gleich — mit gutem Grund: ein Feld, das
so breit ist wie die Lösung, verrät ihre Länge. Bei den Präpositionen ist
die längste Antwort aber „about" mit fünf Zeichen, und mit fünfzehn zerriss
„They accused him ___ fraud." auf 844 × 390 in zwei Zeilen — „fraud." stand
allein darunter. Die Breite ist jetzt **je Ebene** fest (acht Zeichen hier)
und verrät damit genauso wenig. `passt` blieb dabei grün, und zu Recht: ein
Umbruch ist kein Überlauf. Gefunden hat es das Bild, gehalten wird es vom
Bildvergleich — die Gegenprobe macht das Feld wieder breit und verlangt,
dass `ansicht` es sieht.

### I10 · Zehn und drüber · Meter und Gramm — **gebaut (v563)**

Leas Rechenwelt war bis hierher das Einmaleins: drei Ebenen, alle mal und
geteilt. Was fehlte, ist das, woran das zweite und dritte Schuljahr
wirklich hängen — der **Zehnerübergang** und die **Größen**.

**„Zehn und drüber" fragt nur Aufgaben MIT Übergang** — 129 davon. Ohne
ihn wären es zwei Ziffern nebeneinander und keine Aufgabe. Und der
Ablenker ist nicht ein Nachbar, sondern *der Fehler selbst*: wer 23 + 8
falsch rechnet, rechnet **21** — Einer addiert, Übertrag vergessen. Beim
Minus spiegelbildlich: 23 − 8 wird zu 25, weil 8 − 3 statt 13 − 8
gerechnet wird. Steht diese eine Zahl nicht unter den vieren, prüft die
Ebene nur noch, ob jemand ungefähr richtig rechnet — und das tut die Ebene
daneben schon. Deshalb bleibt sie beim Mischen drin; gemischt wird nur ihre
Lage.

**„Meter und Gramm" fragt in beide Richtungen** — 140 Aufgaben aus sieben
Paaren (m/cm, km/m, cm/mm, kg/g, h/min, min/s, l/ml). „3 m = ? cm" kann man
sich zusammenreimen, „300 cm = ? m" verlangt dieselbe Regel rückwärts. Nur
ganze Zahlen: „2500 g = ? kg" wäre 2,5, und das Eingabefeld dieser Ebene
trägt `inputmode="numeric"`. Die Ablenker sind **Faktorfehler**, nichts
sonst — die Zahl unverändert, ein Zehner zu wenig, einer zu viel. Ein
zufälliger Nachbar wäre hier ein Geschenk: wer 300 rechnet und 301
danebenstehen sieht, hat keine Wahl zu treffen.

**Und ein Vorrat kann auch zu GROSS sein.** Der erste Anlauf ging bei
„Zehn und drüber" über alle Zehner von 20 bis 99 und kam auf 319 Aufgaben.
Das ist keine Fülle, sondern eine Halde: bei zwölf Aufgaben je Sitzung sieht
Lea dieselbe erst nach sechsundzwanzig Runden wieder, und ein Leitner-Kasten
lebt von Wiederholung *mit Abstand* — er wird durch einen größeren Vorrat
nicht besser, sondern wirkungslos. Dazu kommt, was die 319 wirklich waren:
der Kern dieser Aufgabe ist das Paar aus Einer und Summand (3 + 8 geht über
zehn), der Zehner wird nur mitgeschleppt. Achtzig Zehner sind achtzigmal
dieselbe Frage. Drei genügen — 20, 50, 80 —, damit die Antwort nicht
auswendig gelernt werden kann: **129 Aufgaben, elf Runden.** Diese Grenze
misst kein Tor, und sie sollte auch keins: sie ist eine Aussage über
Lernen, nicht über Daten. Aufgefallen ist sie am Weltenbild — „Rechnen ·
0/644" stand da, wo vorher 0/185 stand.

**Und ein Fund, den dieses Paket nebenbei gemacht hat.** `spielprobe`
rechnet jede Aufgabe und jede angebotene Zahl nach — aber nur die aus
`vorrat()`, `reihenVorrat()` und `grossVorrat()`. Die **fünf Vorräte aus I4**
(Verdoppeln, Halbieren, Zerlegen, Lücke, Prozent) standen seit ihrer
Entstehung nicht in dieser Zeile und wurden **nie nachgerechnet** — das Tor
meldete trotzdem grün, weil es zählte, was es geprüft hat, und nicht, was
es hätte prüfen müssen. Sie stehen jetzt alle darin, jede mit ihrer eigenen
Rechnung und ihrer eigenen Grenze: **10 920 nachgerechnete Antworten statt
8 588**.

**Zwei Zeichen mussten neu**, und einer davon war ein Befund am Bild: „Meter
und Gramm" trug zuerst dasselbe Mal-und-Durch wie „Reihen 6 bis 10" —
zwei Kacheln nebeneinander, die sich nur in der Farbe unterschieden. Jetzt
zeigt sie einen langen Strich, ein Gleichheitszeichen und drei kurze: *das
eine ist so viel wie das andere, nur kleiner gestückelt.*

### I11 · Südosteuropa bekommt eine Karte — **gebaut (v564)**

Der Ausweg, den I3 aufgeschrieben und nicht genommen hat. Sieben der zehn
zurückgestellten Länder liegen dicht beieinander — 13 bis 23 Grad Ost, 39
bis 50 Grad Nord — und ergeben eine fast quadratische Karte. Auf ihr hat
jedes den Maßstab, den es auf der Europakarte nicht bekommen kann.

> **Gemessen von `ziehen`:** auf der neuen Karte (202 × 276 pt) ist **eines
> von sieben** unter der Fingergrenze (Nordmazedonien, 28,9 pt), **keine
> Nadel**, engster Hakenabstand 18,8 pt. Auf der Europakarte wären alle
> sieben darunter gewesen.

**Und drei der zehn waren nie das Problem.** Litauen, Lettland und Estland
sind auf der Europakarte so groß wie Österreich und Tschechien, die seit
Langem dabei sind — sie fielen bei I3 nur *im Paket* mit den anderen
sieben. Sie stehen jetzt als Rang 27 bis 29 auf der Europakarte, und
`ziehen` misst dort **29 Länder, 2 an der Nadel, engster Kopfabstand
68,2 pt** — gegen 12,3 pt beim gescheiterten Versuch mit 36.
Europa trägt damit auch drei Hauptstädte mehr: Vilnius, Riga, Tallinn.

**Der Name ist „Südosteuropa" und nicht „Balkan"**, weil die Slowakei und
Slowenien nicht auf der Balkanhalbinsel liegen. Ein Kartenname, der zwei
seiner sieben Länder ausschließt, ist falsch, auch wenn er kürzer ist.

**Ein Fehler, den erst das Messen sichtbar gemacht hat.** Die Flaggenebenen
entstehen aus den Kartenschlüsseln, die Flaggen selbst sind Handarbeit —
mit der achten Karte stand eine achte Flaggenkachel da, hinter der *nichts*
lag: sieben Länder, null gezeichnete Flaggen. Sie ließ sich öffnen und
zeigte eine leere Sitzung. Kein Tor sieht so etwas von selbst; die Wand ist
voll, die Kachel ist da. Gefunden hat es `vielfalt` mit einer Zeile
„0 Gegenstände". Jetzt fragt die Ebene selbst, ob ihre Karte überhaupt eine
Flagge hat — wer die sieben morgen zeichnet, bekommt die Kachel von selbst.

### I12 · Fünf Flaggen für Südosteuropa — **gebaut (v565)**

Die leere Kachel aus I11, gefüllt. **Fünf** von sieben — und die zwei, die
fehlen, fehlen mit einem Grund, der älter ist als dieses Paket: die
Slowakei und Slowenien stehen seit F3 unter „nur zum Zeigen, nicht zum
Fragen", weil beide dieselbe weiß-blau-rote Trikolore tragen wie Russland
und sich nur durch ein Wappen unterscheiden, das auf 48 × 32 Punkten ein
Fleck ist. Das war gemessen, nicht gefühlt, und es gilt weiter. Wer sie
fragbar machen will, muss das Raster ändern, nicht die Zeichnung.

**Kroatien ist der Grenzfall, der es geschafft hat.** Rot-weiß-blau hat
auch die Niederlande, in derselben Reihenfolge — was die beiden trennt,
ist das Schachbrett. Es ist deshalb *groß*, viel größer als in
Wirklichkeit, und es hat fünf mal fünf Felder statt der echten dreizehn
Reihen: bei 48 Punkten Breite wäre ein Feld der echten Teilung einen
halben Punkt breit, und fünf ist das Feinste, was auf diesem Raster noch
als Muster zu sehen ist statt als Grauwert.

**Ein Tor hat einen Ausweg verweigert, und es hatte recht.** Bosnien
brauchte ein großes Dreieck von oben rechts nach unten links; der erste
Anlauf nahm dafür `art:'eigen'` — die Tür, durch die eine Flagge an der
Formsprache vorbei gezeichnet wird. Die Antwort war: *„6 Flaggen umgehen
die Formsprache (erlaubt sind 5) — dann ist nicht die Flagge besonders,
sondern die Sprache zu eng."* Jetzt gibt es die Form `keil` mit frei
gesetzten Ecken, und sie taugt für jede nächste.

**Und eine Farbe steht bewusst falsch.** Serbiens Wappen ist in
Wirklichkeit rot. Auf dem roten Oberstreifen ist ein rotes Schild aber
nicht da — man sieht nur den Zipfel, der ins Blau ragt, und eine Andeutung,
die zur Hälfte unsichtbar ist, ist keine. Es ist jetzt gold, wie die Krone
darauf.

**Drei neue Verwechslungspaare** (Kroatien/Niederlande, Serbien/Niederlande,
Serbien/Russland). Sie stehen auf *verschiedenen Karten* und begegnen sich
in einer Flaggenrunde nie — genau dafür gibt es diese Liste: sie ist eine
Aussage über die Welt, nicht über den Vorrat einer Ebene.

### I13 · Vorher und nachher — **gebaut (v566)**

Aus diesem Audit hat Lea vier neue Ebenen bekommen, die Eltern drei — und
Fiona eine. Sie ist sechs und liest nicht; jede Ebene für sie muss ohne
Text auskommen, und das ist der Grund, warum es für sie am schwersten ist.

„Vorher und nachher" ist die **einzige Rechenart der App, bei der nicht
gerechnet wird.** „Was kommt nach sieben?" ist eine Frage an die
*Zahlenreihe*. Wer sie beantwortet, indem er eins dazuzählt, hat sie noch
nicht verstanden; wer die Reihe kann, sagt es sofort. Das ist der Stoff,
auf dem alles andere steht — der Zehnerübergang, den Lea seit I10 übt, ist
ohne eine sitzende Zahlenreihe nicht zu machen.

**Zahlenraum zwanzig**, obwohl Fionas Plus und Minus bis zehn geht: die
Reihe hört bei zehn nicht auf, und die schwierige Stelle ist genau der
Übergang. „Was kommt nach neun?" und „Was kommt vor zwanzig?" sind die
zwei Fragen, an denen man merkt, ob die Reihe sitzt oder ob jemand bis
zehn auswendig aufsagt. **38 Aufgaben**, von Natur aus begrenzt wie die
Kontinente.

**Und eine Prüfung, die es vorher nicht gab.** Drei Ebenen haben nicht
irgendwelche Ablenker, sondern *einen bestimmten* — den Fehler, den ein
Kind dort wirklich macht: bei der Zahlenreihe die Zahl selbst (wer die
Frage nicht verstanden hat, tippt sie), beim Zehnerübergang das Ergebnis
ohne Übertrag. Steht er nicht unter den vier Möglichkeiten, funktioniert
die Aufgabe weiter und prüft etwas anderes. Bis hierher stand das nur in
Kommentaren — ein Kommentar ist keine Prüfung. Jetzt rechnet `spielprobe`
es nach.

Die Gegenprobe dazu hat im ersten Anlauf **nichts bewiesen**: sie strich
die Zahl aus der Ablenkerliste, und bei „Nach 7" kam die Sieben als
*Ergebnis minus eins* durch die Hintertür zurück. Das Tor blieb zu Recht
grün. Erst der zweite Eingriff nimmt sie auf jedem Weg heraus.

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
