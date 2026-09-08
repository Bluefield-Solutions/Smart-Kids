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

## Das Werkzeug

`npm run vielfalt` misst die Tabelle oben bei jedem Lauf neu. Es lädt die
**gebaute** Datei und fragt für jedes Profil `vorrat()` — nicht die
Datenmodule. Der Unterschied ist der ganze Befund U2: `src/inhalt/erdkunde.js`
kennt 17 europäische Länder, Fiona sieht drei.

`--tor` macht daraus eine Prüfung mit der Grenze von zwei Runden.
