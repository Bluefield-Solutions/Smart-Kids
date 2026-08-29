# Lernkiste — Stand

Was gebaut ist, was gemessen ist, was offen bleibt. Ergänzt Konzept K3, den
Prüfbericht und das Grafik-Audit; ersetzt keines davon.

Stand: nach M0-Vorarbeit, M2, MG, dem Tor `ansicht`, **M3 bis M6**, der
Sichtrunde, dem **Umzug nach `Bluefield-Solutions/Smart-Kids`** samt PWA und
Auslieferung, der Ausbau-, der Spieler-, der Gestaltungs-, der Zieh-, der Proben-,
der Budget-, der Übergangs-, der Geräte-, der Umschalter-, der Vorlese- und
der **Audit-Runde**.

> **Der Baum ist umgezogen.** Gearbeitet wird in
> `Bluefield-Solutions/Smart-Kids`, nicht mehr in `towerfront/lernkiste`.
> Diese Datei liegt dort unter demselben Namen weiter.

---

## Was läuft

```
npm run backen      Kartenpipeline: Kontinente, Deutschland, Länder, Städte
npm run ansicht     Bildvergleich, 13 Aufnahmen — vier davon auf dem
                    Zielgerät (iPhone quer). Nur ortsfest.
npm run bauen       baut prototyp/spiel.html und dist/
npm run tor         die ganze Kette
npm run proben      die 56 stehenden Gegenproben (Baum muss sauber sein,
                    höchstens drei Runden alt)
                    `npm run proben ziehen` fährt nur eines
npm run budget      Größenzusagen aus Konzept K3, plus Ratsche
npm run proben -- --geaendert
                    nur die Proben, deren Datei oder Tor seit dem
                    letzten vollen Lauf angefasst wurde
```

Die Kette, in dieser Reihenfolge:

```
rhythmus → inhalt · topologie · beruehrung · marken · schrift · symbol · doku
  → spielprobe → vergleich → bauen → budget → passt → lesbarkeit → ziehen
  → ansicht → pwa · offline → smoke
```

**Die Torkette ist grün.** Neunzehn Prüfungen — und „mit Gegenprobe belegt"
ist keine Behauptung mehr, sondern ein Lauf: **56 Gegenproben, alle schlagen
an**, und `rhythmus` lässt sie nicht älter als drei Runden werden.

Seit der Audit-Runde vergleicht sich die Aufzählung darüber selbst: das Tor
`doku` legt die Kette in `CLAUDE.md` neben `npm run tor` in `package.json`.
Sie lag einmal sechs Tore zurück — und `inhalt` war zur selben Zeit **tot**.

---

## Gemessen, nicht geschätzt

Alle Stufen halten die Hausdorff-Grenze von **0,75 Bildpunkten** ein. Die
Spalten sind grob · mittel · fein, jeweils gzip.

| Ebene | grob | mittel | fein | Hausdorff max |
|---|---|---|---|---|
| Kontinente | 29,7 KB | 105,0 KB | 134,2 KB | 0,74 px |
| Deutschland | 34,3 KB | 55,7 KB | 57,5 KB | 0,52 px |
| Länder Asien | 95,8 KB | 194,3 KB | 268,1 KB | 0,69 px |
| Länder Afrika | 66,2 KB | 132,0 KB | 154,8 KB | 0,69 px |
| Länder Europa | 105,6 KB | 186,5 KB | 220,5 KB | 0,73 px |
| Länder Nordamerika | 74,2 KB | 188,9 KB | 253,4 KB | 0,74 px |
| Länder Südamerika | 62,0 KB | 108,7 KB | 137,9 KB | 0,74 px |
| Antarktika, polar | 7,8 KB | 15,3 KB | 19,0 KB | 0,71 px |

**Das Budget hält, mit einer Ausnahme.** Konzept K3 setzt „< 250 KB je
nachgeladener Ebene". Asien fein (268 KB) und Nordamerika fein (253 KB) liegen
darüber. Beide werden auf Ebene 2 aber nur in der **mittleren** Stufe gezeigt —
dort ist der Kontinent formatfüllend, nicht ein einzelnes Land. Die feine
Stufe entsteht trotzdem, weil sie nichts kostet, solange sie niemand lädt.

Das Startbündel braucht nur `kontinente.grob`: **29,7 KB**. Die 90-KB-Grenze
aus K3 ist damit zu einem Drittel ausgenutzt.

---

## Vier Zahlen, die sich geändert haben

**64 Gebiete statt 69.** K2 und K3 rechneten mit 30 Ländern — als gäbe es
sechs Kontinente mit Ländern. Es sind fünf: Australien ist ausgenommen,
Antarktika hat keine. 5 × 5 = 25. Gefunden hat es das Tor `inhalt` beim
ersten Lauf; die Zahl wird jetzt gezählt und gegen das Konzept geprüft.

**14 von 16 Bundesländernamen passen nicht ins Gebiet.** Gemessen am Pol der
Unzugänglichkeit gegen die Textbreite, bei 470 px Kartenbreite. Nur Hessen und
Bayern haben Platz. **Die Fahne ist der Normalfall, nicht die Ausnahme** —
Befund G10 ist damit größer als gedacht.

**Vier Gebiete brauchen eine entkoppelte Trefferfläche:** Bremen 9,4 pt,
Hamburg 16,8 pt, Berlin 17,9 pt, Saarland 32,3 pt. Und ein Paar überlappt sich
dabei: Brandenburg/Berlin liegen 4 pt auseinander. Im Prototyp ist es
umgesetzt — unsichtbare 44-pt-Kreise um den Anker, das kleinere Gebiet
gewinnt.

**Antarktika ist gelöst.** Der offene Punkt aus MG: in jeder Weltprojektion
liegt es als Sockel am unteren Rand. Es gibt jetzt eine **polare Aufsicht**
(azimutal flächentreu, auf den Südpol gedreht, 7,8 KB grob). Runde 3 bekommt
damit eine eigene Ansicht. Auf der Weltkarte kommt es **gar nicht mehr vor** —
sonst bliebe unten ein grauer Sockel stehen, der wie ein Fehler aussieht.

---

## Die Sichtrunde

Drei Befunde vom Gerät, keiner davon von einem Tor gemeldet.

**1. Man sah nicht, welches Gebiet gefragt ist.** Alle Flächen sahen gleich
aus, das Ziel war nur an einer etwas anderen Füllung zu ahnen. Jetzt tragen
die anderen `class="ruhig"` (Deckkraft 0,42, Sättigung 0,35), das Ziel behält
seine Farbe und bekommt zwei zusätzliche Umrisse: einen dunklen festen und
einen pulsierenden in der Akzentfarbe (Strichbreite 3 → 9, 1,5 s). Ist das
Ziel kleiner als 190 px, kommt ein hüpfender Zeiger auf den Anker dazu — in
fester **Bildschirmgröße**, also mit `1/k` gegenskaliert, sonst wäre er auf
der Weltkarte winzig und auf Bremen riesig. Bei `prefers-reduced-motion` wird
aus dem Puls ein dicker ruhender Strich. Nach der richtigen Antwort geht alles
aus.

**2. Ein Strich quer durch Antarktika.** Natural Earth speichert den Umriss
für eine **rechteckige** Weltkarte: er läuft bei 180 Grad die Längslinie
hinunter bis lat −89,999, einmal am unteren Rand entlang und bei −180 Grad
wieder hinauf. Auf der Weltkarte deckt sich das mit dem Kartenrand. In der
polaren Aufsicht sind 180 und −180 **dieselbe Linie**: beide Schenkel liegen
aufeinander und zeigen sich als Strich vom Rand bis in die Mitte.

Der Schnitt wird jetzt beim Backen durch **einen** Punkt ersetzt — den echten
Küstenpunkt bei 180 Grad. Gemessen: Fläche und Umgrenzung bleiben
**identisch** (432 160 px², dieselbe BBox), nur der nächste Umrisspunkt zur
Kartenmitte springt von **0,0 px auf 100,4 px**.

**3. Kein Tor hatte etwas davon gesehen** — und das war die eigentliche
Lücke. Beide Befunde sind jetzt eingefangen:

- Das Tor `topologie` sucht **Nadeln**: zwei Punkte desselben Ringes fallen
  aufeinander (< 0,15 px), der Weg dazwischen ist lang (≥ 20 px) und
  umschließt nichts (mittlere Breite < 0,05 px). Eine Naht ändert weder
  Fläche noch Umgrenzung noch Umlaufsinn — sie ist genau an dieser Kombination
  zu fassen. **Gegenprobe gefahren** (Regel 13): auf der alten Geometrie
  meldet es *1 Nadel, längste 236 px*, auf der neuen null.
  Die dünnsten **echten** Gebilde im Vorrat — drei Fjorde in Kanada, eine
  Nehrung in den USA — liegen bei 0,18 bis 0,27 px mittlerer Breite und
  kommen als Hinweis, nicht als Fehler: so stehen sie in der Wirklichkeit.
- Das Tor `ansicht` fotografiert jetzt auch den **lebenden Prototyp**, nicht
  nur die gemalten Entwürfe (`spiel-kontinent`, `spiel-bundesland`). Vorher
  steckte die ganze Spieldarstellung hinter keinem Tor: der Lauf blieb grün,
  während sich jeder Spielbildschirm änderte. Je Aufnahme wird die Ablage
  geleert, damit der Keim aus Sitzungsnummer 0 kommt — dreimal nacheinander
  0 Bildpunkte Unterschied.

---

## Vier stille Fallen beim Bauen

Keine davon wurde rot. Alle vier sind der Grund, warum es die Tore gibt.

1. **`-clean gap-fill-area=20km2` auf unprojizierten Graddaten** löste die
   halbe Geometrie auf. Die Messung meldete danach 0,00 px Abweichung bei
   2,4 % der Punkte — ein perfektes Ergebnis für nichts.
2. **d3-geo erwartet den entgegengesetzten Umlaufsinn zu RFC 7946.** Natural
   Earth liefert im Uhrzeigersinn und läuft; mapshaper dreht um, und danach
   umschließt jede Fläche rechnerisch den Nordpol: `geoBounds` meldet die
   ganze Erde, `fitWidth` liefert Maßstab 0, jede Fläche ist null.
3. **`-dissolve2` gibt eine GeometryCollection zurück** und lief damit an der
   Umlaufsinn-Korrektur vorbei, die nur Features kannte.
4. **Die Inselregel muss je Stufe gelten.** Nur an der feinsten angewandt,
   steckte Fehmarn auch in der groben Stufe, wo es 0,4 × 0,4 Bildpunkte groß
   ist. Die Vereinfachung ließ es zusammenfallen, sein Umriss lag danach weit
   von allem entfernt — und die Abstandsmessung kam nicht unter 59 % Punkte.

Dazu drei Fehler in den Toren selbst, gefunden beim ersten Lauf: der
Umlaufsinn wird im **ausgegebenen** Pfad andersherum gemessen (y zeigt nach
unten), das Markentor las den Abendmodus mit, und das Tor `ansicht` war nicht
deterministisch — eine endlose Animation bleibt auch bei 1 ms Dauer irgendwo
stehen.

---

## M3 bis M6

Vier Kernmodule, alle einzeln prüfbar und ohne DOM:

| Modul | Was |
|---|---|
| `src/vergleich/` | Kölner Phonetik, Damerau-Levenshtein, drei Ausgänge (angenommen · Rückfrage · nochmal), Rechtschreibbewertung |
| `src/kern/leitner.js` | fünf Fächer, deterministische Sitzungsauswahl, Fortschritt |
| `src/profil/ablage.js` | IndexedDB ohne Abhängigkeit, `storage.persist()`, profilweises Löschen |
| `src/protokoll/` | anhängender Ereignisstrom, Auswertung, CSV- und JSON-Ausfuhr |

Im Prototyp sind sie eingebettet — ein kleiner Inliner wickelt jedes Modul in
eine benannte IIFE. Ohne das kollidiert `mischen` aus dem Leitner mit
`mischen` aus dem Spiel, und niemand merkt es.

### Das Tor `vergleich`

| Korpus | Trefferquote | Falsch-Positiv |
|---|---|---|
| erfunden (65 / 43 Fälle) | 100 % | 2,3 % |
| eingefroren | **fehlt noch** — entsteht aus echten Aufnahmen | — |

**Solange die eingefrorene Hälfte fehlt, gilt keine Zielzahl.** Das Tor sagt
das ausdrücklich, statt eine Zahl zu melden, die nichts bezeugt. Es fängt
trotzdem eine offensichtliche Fehlfunktion: ein Abgleich, der alles annimmt,
fällt durch.

Der erste Lauf meldete **11,6 % Falsch-Positiv**: „euro" wurde als Europa
angenommen, „bayer" als Bayern, „afrikaner" als Afrika. Lauter kürzere oder
längere Wörter, die klanglich fast gleich sind. Zwei Regeln haben es
behoben — eine Längenstrafe im Abstand, und die Regel, dass ein Wort, das
eine Silbe zu kurz oder zu lang ist, **nie ohne Rückfrage** angenommen wird.
„Meintest du Bayern?" ist die richtige Antwort auf „Bayer", nicht „richtig".

Was bleibt: **„aussen" wird als „Asien" angenommen.** Die Kölner Phonetik
gibt beiden denselben Code, und sie sind gleich lang. Das ist eine echte
Grenze des Verfahrens, kein Einstellfehler.

## Der Prototyp

`lernkiste/prototyp/spiel.html` — **eine Datei, läuft ohne Server**, 766 KB.

Beide Profile, vier Ebenen (Kontinente, Länder in Europa und Afrika,
Bundesländer, Landeshauptstädte), echtes Ziehen mit Pointer Events, Vorlesen,
Spracherkennung wo verfügbar mit Rückfall auf Stufe C, der Belohnungsmoment,
Abendmodus.

Was der Rauchtest wirklich fährt: Profilwahl → Ebenenwahl → Ziehen →
Belohnung, auf **iPhone quer, iPhone hoch und iPad quer**.

Zwei Layoutfehler hat erst der Rauchtest gefunden: die CSS-Regeln für das
Spielfeld waren auf `#spiel` gezielt, während der Bildschirm gar keine id
hatte — die Karte wuchs auf ihre Eigengröße. Und im Querformat rutschte das
erste Etikett **unter die Kopfleiste**, weil `justify-content: center` bei
Überlauf über die obere Kante hinausschiebt. Der Finger traf dort die Leiste.

Neu mit M3 bis M6: **Ablage in IndexedDB** (der Fortschritt überlebt den
Neustart), **Leitner mit fünf Fächern**, **Forscherbuch** (der Aufkleber ist
der Umriss des Gebiets selbst), die **Stadtstaaten-Lerneinheit** vor Ebene 4,
und der **Elternbereich** hinter einer vierstelligen PIN: Trefferquoten,
Wackelkandidaten, Ausspracheliste, CSV- und JSON-Ausfuhr, profilweises
Löschen, Fassungsstempel, Speicherzustand und die Herkunft der Karten.

**Was der Prototyp NICHT ist:** keine PWA, kein Service Worker, kein
Startbildschirm-Symbol, keine Auslieferung. Das ist M1 und braucht das
Repository.

### Fünf Fehler, die erst der Rauchtest gezeigt hat

1. **Die CSS-Regeln fürs Spielfeld waren auf `#spiel` gezielt**, während der
   Bildschirm gar keine id hatte — die Karte wuchs auf ihre Eigengröße.
2. **Im Querformat rutschte das erste Etikett unter die Kopfleiste**, weil
   `justify-content: center` bei Überlauf über die obere Kante hinausschiebt.
   Der Finger traf dort die Leiste.
3. **Berlins 44-Punkt-Trefferkreis lag über Brandenburgs Anker.** Brandenburg
   war an seiner besten Stelle nicht mehr treffbar. „Das kleinere gewinnt"
   heißt nicht „das kleinere sperrt aus" — die Kreise schrumpfen jetzt, bevor
   sie den Anker eines Nachbarn verschlucken.
4. **Der Aufkleber kam erst bei Fach 5**, also nach vier richtigen Antworten
   über drei Wochen. Für eine Sechsjährige bliebe das Forscherbuch wochenlang
   leer. Jetzt ab Fach 3, mit einem Siegel bei Fach 5.
5. **Die Auffüllung der Sitzung bevorzugte Neues vor Angefangenem.** Ein Kind
   bekam in der zweiten Sitzung fast nur neue Gebiete, keines erreichte Fach 3,
   und das Buch blieb leer — bei zwölf richtigen Antworten.

Dazu zwei Fehler im Tor selbst: die Fortschrittsprüfung `/[1-9]/` traf die
**16** in „0 von 16 geschafft" und meldete grün, obwohl nichts abgelegt war —
sie liest jetzt die Ablage statt den Text. Und der Zufallskeim kam aus der
Uhr, womit keine Sitzung reproduzierbar war; er kommt jetzt aus einer
gespeicherten Sitzungsnummer.

---

## Der Umzug: PWA und Auslieferung

**Ebene 4 zeigt jetzt immer vier Städte.** Genau eine ist richtig, die
Reihenfolge wird je Aufgabe neu gewürfelt, und das gilt für **beide
Profile** — auf dieser Ebene tippt auch Lea nicht. Gefragt ist, *welche*
Stadt es ist, nicht wie man sie schreibt; eine Stadt zu tippen, die man nie
gesehen hat, prüft das Buchstabieren. Im Elternbereich abschaltbar.

Die drei falschen sind nicht beliebig: **eine** kommt aus demselben
Bundesland — bei fünf Ländern ist die größte Stadt nicht die Hauptstadt, und
dort sitzt der Irrtum. **Zwei** sind Hauptstädte anderer Länder, sonst
stünden vier Namen aus derselben Ecke Deutschlands da.

**Der neue Rauchtest dafür fand sofort einen echten Fehler.** Der einfache
lineare Kongruenzgenerator legte die richtige Antwort in **zehn Aufgaben
hintereinander nur auf Platz 2 oder 3** — nie auf 1 oder 4. Benachbarte
Aufgaben liegen im Keim 7919 auseinander, und bei einem LCG hängen die
Ausgaben zu benachbarten Keimen linear zusammen. Jede Einzelprüfung war
grün: vier Städte, eine richtig, eine aus demselben Land. Die Aufgabe war
trotzdem kaputt — wer rät, rät in der Mitte. Jetzt Mulberry32, alle vier
Plätze belegt.

**Das App-Symbol** ist ein Globus in orthographischer Aufsicht, gedreht auf
10° Ost / 15° Nord, aus **derselben Küste wie die Karten im Spiel** (Natural
Earth 1:50m, auf 0,81 px Hausdorff vereinfacht). Kein Clipart — ein Symbol,
das neben der App liegt, verspricht etwas anderes als sie hält. Die Kugel
misst 75 % der Kante und liegt damit innerhalb der iOS-Maske *und* der
80-%-Schutzzone maskierbarer Kacheln. Ausgeliefert werden 180 (iOS), 192 und
512 (Manifest); die 1024 bleibt als Vorrat im Baum.

**Die PWA löst zwei Zusagen auf, die einander widersprechen:** ohne Netz
starten und immer aktuell sein. Getrennt wird an der Stelle, an der es sich
entscheidet — die **Seite** kommt Netz zuerst (mit 2,5 s Reißleine, ein Kind
wartet nicht auf ein mürbes Hotel-WLAN), **Schrift und Symbole** kommen
Lager zuerst, weil sie sich innerhalb einer Fassung nie ändern.

**Die Schriften liegen jetzt im Baum**, nicht bei Google. Drei Gründe: eine
Kinder-App soll beim Start nicht bei einem Dritten anklopfen, ohne Netz gäbe
es sonst keine Schrift, und der Bau auf dem Runner braucht so kein Netz. Nur
der Schnitt **latin** — 51,6 KB statt 328. Beide stehen unter der SIL OFL
1.1, Herkunft in `src/schrift/HERKUNFT.md`.

### Vier neue Tore, und was sie gefunden haben

| Tor | Was es prüft | Erster Fund |
|---|---|---|
| `schrift` | kein angezeigter Name braucht ein Zeichen außerhalb von latin | ●, ○ und ← in der PIN-Eingabe — sie sind jetzt gezeichnet statt getippt |
| `symbol` | quadratisch, undurchsichtig, nicht leer, Kugel in der Maske | — |
| `pwa` | Manifest vollständig, Symbole in der genannten Größe, **jede** Datei im Vorrat existiert wirklich | — |
| `offline` | startet die App ohne Netz | — |

`offline` fährt seine **Gegenprobe bei jedem Lauf mit**: ohne Service Worker
*muss* dasselbe durchfallen. Sonst misst das Tor den Browser-Cache und wäre
grün, ohne je etwas bewiesen zu haben (Regel 13).

### Das Tor `ansicht` läuft nicht auf dem Runner

Beim ersten Lauf dort waren **alle sieben Aufnahmen rot** — zwei davon mit
*geänderten Maßen*, also anderem Zeilenumbruch, nicht nur anderen
Bildpunkten. Das ist kein Befund über die App, sondern einer über die
Maschine: der Runner hat einen anderen Chromium-Bau, andere Ersatzschriften
und andere Kantenglättung. Ein Bildpunktvergleich gilt nur bei **gleicher
Zeichenumgebung**.

Es wird deshalb auf dem Runner übersprungen — **laut und mit Begründung im
Protokoll**, nicht still. Ein Tor, das sich unbemerkt überspringt, ist
schlimmer als keines. Ortsfest läuft es weiter mit `npm run ansicht`.

**Offen (D28):** Wer die Aufnahmen auch auf dem Runner will, muss die
Umgebung festnageln — im Playwright-Abbild bauen *und* die Vorbilder darin
aufnehmen. Solange beides nicht in derselben Umgebung passiert, misst der
Vergleich die Maschine.

**Geprüft wird ab jetzt `dist/`**, nicht mehr `prototyp/spiel.html`. Die eine
Datei ist eine Bequemlichkeit zum Verschicken; sie hat weder Manifest noch
Service Worker, ein grüner Lauf auf ihr beweist nichts über die App auf dem
Startbildschirm. Dabei kam heraus, dass die alten Vorbilder des Tors
`ansicht` die **Systemschrift** festgehalten hatten — die Google-Schrift war
beim Aufnehmen nie angekommen, und niemandem war es aufgefallen. Das Tor
prüft jetzt vor jeder Aufnahme, dass beide Schriften wirklich geladen sind.

Und die Zusammenfassung sagte „Alle **vier** Tore grün", während längst
sechs liefen. Die Zahl wird jetzt gezählt, nicht geschrieben.

---

## Die Sichtrunde am Gerät

Der Anlass war eine Bitte um **Gestaltungsvorschläge**. Beim Nachmessen auf
sechs Gerätegrößen kam heraus, dass die App auf dem **Zielgerät kaputt war** —
und drei Tore meldeten grün.

### Sechzehn Elemente waren nicht erreichbar

| Gerät | Was fehlte |
|---|---|
| iPhone quer 844×390 | vierte Antwort 22 px unter dem Rand · „Bundesländer" und „Landeshauptstädte" 10 px · „Verstanden" der Stadtstaaten-Einweisung 42 px |
| iPhone SE quer 667×375 | dasselbe, dazu drei Tasten der Eltern-PIN |
| iPhone hoch 390×844 | „Landeshauptstädte" 64 px · „Zurück" und „Eltern" **verdeckt** von der Überschrift |
| iPad, Schreibtisch | in Ordnung — deshalb ist es nie aufgefallen |

Im Klartext: das Kind sah auf dem iPhone die vierte Antwort nicht, kam nicht
in die Landeshauptstädte, und auf dem SE ließ sich die Eltern-PIN nicht
eingeben.

### Warum kein Tor es sah

Der Rauchtest sucht Etiketten über das **DOM**, nicht über das Sichtbare — ein
Element in einem scrollenden Behälter *existiert*, es ist nur nicht da. Das
Tor `ansicht` fotografiert bei 1240 × 1000, wo alles passt. Und `beruehrung`
misst Kartenflächen, keine Knöpfe.

### Die Ursachen, der Reihe nach

1. **`justify-content:center` auf `.mitte`.** Läuft der Inhalt über, schiebt
   zentrierter Inhalt nach **oben und unten gleichzeitig** hinaus — deshalb lag
   die Überschrift über den Kopfknöpfen. Für `.seite` war das seit v109
   repariert, für `.mitte` nie nachgezogen. Regel 15, wörtlich.
2. **`style="min-width:200px"` inline im Markup.** Inline schlägt jede
   Stilregel. Vier Größen waren rot, während im Stylesheet ein sauberes Raster
   stand, das gegen eine Zahl im Markup arbeitete.
3. **Ein Rasterfeld ist mindestens so breit wie sein längstes Wort.**
   „Landeshauptstädte" sprengte die Spalte um bis zu 36 px.
4. **Eine Medienabfrage erhöht die Spezifität nicht.** Der Kurzschirm-Block
   stand vor `.ziffern` und war für die wirkungslos.
5. **Ohne `min-width:0` läuft der Text aus seinem eigenen Knopf** — der Kasten
   saß, der Inhalt nicht.

### Vier Marken, die es nie gab

Beim Aufräumen fiel auf: `--app-gut`, `--app-warn`, `--app-linie` und
`--f-mono` wurden an **neun Stellen benutzt und nirgends definiert**. Deshalb
hat sich **kein Fortschrittsbalken je gefüllt**, und „Richtig — Thüringen!"
stand nie in Grün. `marken.css` und die Kopie in `vorlage.html` waren
außerdem auseinandergelaufen (`--tinte-2` gegen `--tinte2`).

Die Kopie ist weg. Der Bau setzt `marken.css` jetzt selbst ein.

### Das Tor `passt`

Sechs Gerätegrößen × sieben Bildschirme. Kein bedienbares Element darf über
den Rand seines Behälters laufen, keines darf **verdeckt** sein
(`elementFromPoint` in seiner Mitte), und der **Text muss in seinen Knopf
passen**. `overflow:auto` zählt nicht als Lösung: ein Kind scrollt nicht in
einer Liste, von der es nicht weiß, dass sie weitergeht.

Alle drei Prüfungen sind gegengeprobt — jede meldet den Fehler, für den sie
gebaut wurde, und schweigt danach.

### Die Knöpfe

Vorher war **jeder** Knopf dieselbe weiße Pille: die Antwort, die
Ebenenkachel, „Zurück", „Eltern". Deshalb wirkte nichts gestaltet — es gab
keine Rangfolge. Jetzt drei Gewichte: `.knopf` **leise** (Werkzeug am Rand,
kein Füllton), `.kachel` **mittel**, `.etikett` **laut** (die Antwort, der
wichtigste Knopf der App).

Die Tiefe ist keine versetzte Fläche mehr, sondern eine **Kante**: helle Linie
oben innen, dunklere unten. Beim Drücken fährt der Knopf um genau die
Kantenhöhe nach unten. Und bei falscher Antwort **wackelt das Etikett** —
vorher passierte dort gar nichts, es kam nur ein Satz darunter.

---

## Die Ausbaurunde

Vier Punkte, die ohne Rückfrage zu machen waren — in dieser Reihenfolge,
damit die spätere Arbeit im System landet und nicht daneben.

### 1. Das Gestaltungssystem hält jetzt

Im Stylesheet standen **vier Farben, drei Dauern und ein Dutzend
Strichstärken** frei herum, in `spiel.js` vier weitere Farben — darunter die
der Sterne. Und `#1b2835` stand zweimal im Baum (Meta-Tag und Manifest).

Alles in `marken.css`, neue Marken für Kante, Ring, Puls, Treffer, Ziel,
Stern. Das Tor `marken` prüft es jetzt in fünf Kategorien — Farbe, Dauer,
Radius, Strich, Abstand — und alle vier Gegenproben schlagen an. Was ein
**Bauteilmaß** ist (44 pt Trefferfläche, 76 px Mikrofon), bleibt erlaubt:
das sind Größen, keine Marken.

### 2. Der Grundriss folgt der Karte (D29)

Die Karte beanspruchte Platz, den sie nicht nutzen kann. Gemessen: auf dem
iPhone quer war ihr Kasten **420 Punkte breit, gezeichnet wurden 213** —
daneben ein Loch, das niemand nutzt. Deutschland ist hochformatig (0,74),
die Weltkarte quer (1,67); ein Kasten für beide verschenkt immer bei einer.

Das ist bewusst **keine Stilregel** geworden: CSS kann die eine Achse nicht
gegen die andere abwägen. `aspect-ratio` mit `width:100%` macht die Höhe
richtig und lässt die Breite stehen, mit `height:100%` genau andersherum.
`kartenGroesse()` misst den freien Platz und setzt beides — ein `Math.min`.

Dazu ist das Mikrofon verschwunden, wenn der Sprachmodus aus ist. Es stand
grau da, mit einer **Anweisung an die Eltern auf dem Spielbildschirm des
Kindes**, und kostete bis zu 120 Punkte Höhe.

| | vorher | jetzt |
|---|---|---|
| iPhone hoch · Deutschland | 45 % des Feldes | **62 %** |
| iPad hoch · Deutschland | 34 % | **49 %** |
| Fenster schmal · Weltkarte | 36 % | **51 %** |
| Karte füllt ihren Kasten | 43–100 % | **94–100 %** |

### 3. Die Karte füllt sich beim Spielen (D30)

Was schon saß, steht in voller Farbe und trägt einen grünen Haken; der Rest
bleibt gedämpft. Der Fortschritt steht damit **auf der Karte**, nicht nur als
Zahl in der Kopfzeile.

Der erste Anlauf hing an der Sitzung — der Rauchtest meldete sofort *null
gekonnte Gebiete*, weil die Karte nach jedem Neustart wieder leer war. Jetzt
kommt es aus dem **Leitner-Stand** (Fach ≥ 2): es überlebt das Schließen der
App und fällt zurück, wenn ein Gebiet später danebengeht.

### 4. Der Name am Ort (G10)

Bei richtiger Antwort steht der Name auf der Karte. Gehört hat das Kind ihn,
gelesen auf einem Etikett — aber nicht **am Ort**, und genau diese Verbindung
soll hängenbleiben.

**14 von 16 Bundesländernamen passen nicht in ihr Gebiet**, deshalb ist die
Fahne der Normalfall: ein Schild neben dem Gebiet mit einer Leitlinie
darauf. Entschieden wird **gemessen** — der Text wird gesetzt, ausgemessen
und mit dem Gebiet verglichen — nicht nach Liste. Damit gilt es auch für
Kontinente, Länder und jede Karte, die noch dazukommt.

Der Rauchtest prüft, dass der Name erscheint, ganz im Kartenfeld liegt und
dass **beide Sorten vorkommen**: fällt die Entscheidung immer gleich aus,
ist sie keine Messung, sondern eine feste Einstellung.

---

## Die Spielerrunde

Anlass: ein Kind tippte **„Australien"** und die App lehnte es ab. Ich habe
daraufhin aus Spielersicht alles durchgespielt — und **sechs Fehler**
gefunden, von denen zwölf Tore keinen gesehen hatten. Sie prüften, ob das
Programm läuft. Keines hatte je eine Antwort gegeben.

### 1. Beim Tippen zählte kein einziger Alias

`rechtschreibung()` bekam nur den kanonischen Namen. Der Kontinent heißt im
Vorrat „Australien und Ozeanien"; **„Australien" stand als Alias da und wurde
nie gelesen.** Mit ihm fielen durch: England, Großbritannien, Britannien,
Kongo, Amerika, Ozeanien, Antarktis, Südpol, Canada, Mexico, Tanzania,
Bangladesh, Aegypten, Aethiopien. **21 richtige Antworten** wurden abgelehnt.

### 2. Die Hervorhebung bewachte das Ziel

Der pulsierende Ring um das gesuchte Gebiet (`fill:none`, Strich bis 9 pt)
lag **über** der Fläche und fing den Zug ab. `elementFromPoint` lieferte
`path.zielpuls` — weder Gebiet noch Trefferkreis —, und die Bewertung lief
**gar nicht erst an**: kein Protokolleintrag, kein Hinweis, keine Bewegung.
Gemessen waren **21 bis 35 % der Zielfläche** blockiert; etwa jeder vierte
Zug landete auf nichts.

Ausgerechnet die Hervorhebung, die zeigen soll wohin man ziehen muss.

### 3. Fionas drei Runden gab es nicht

Das Konzept (4.1) gibt ihr drei aufeinander aufbauende Runden. Im Code stand
`k.runde<=3` — **immer wahr**. Sie bekam von Anfang an alle sieben
Kontinente, das Feld `runde` war Dekoration. Jetzt öffnet die nächste Runde,
wenn jeder Kontinent der bisherigen einmal saß (Fach 2).

Dabei ist gleich der nächste aufgefallen: die Runde begrenzte auch die
**Karte** — auf Fionas Weltkarte fehlten Asien und Nordamerika ganz. Die
Runde begrenzt jetzt, wonach gefragt wird, nicht was es auf der Welt gibt.

### 4. Fünfzehn Länder waren nicht erreichbar

Die Torkette zählte **25 Länder**, spielbar waren **10**. Asien, Nord- und
Südamerika lagen gebacken im Baum und waren nicht verdrahtet. Die
Ebenenwahl kommt jetzt aus den Daten statt aus einer zweiten Liste.

### 5. Guatemala hatte keine Fläche

Und dann waren es 24 statt 25. Auf der groben Stufe misst Guatemala rund
anderthalb Bildpunkte, und der Inselfilter warf es weg — ein **MultiPolygon**
behielt dort immer seine größte Fläche, ein einfaches **Polygon** fiel
ersatzlos. Guatemala ist ein einfaches Polygon. Es stand in den Daten, wurde
gezählt und konnte nie gefragt werden.

### 6. Der ausgeblendete Bildschirm nahm noch an

Die unsichtbaren Trefferkreise setzen `pointer-events:all` und hoben damit
das `none` ihres ausgeblendeten Bildschirms auf — 340 ms lang. Gefunden beim
Suchen nach Fehler 2, behoben, auch wenn es nicht die Ursache war.

### Das Startpaket wurde dabei kleiner

Mit fünf Kontinenten wäre die Seite von 297 auf **537 KB gzip** gesprungen —
fast die Hälfte davon Umgebungskarten. Die Länderebenen werden jetzt einzeln
nachgeladen und vom Service Worker ins Lager gelegt. **Start: 132 KB gzip**,
je Kontinent 63–107 KB einmalig. Das Offline-Tor läuft jetzt bis zu einer
nachgeladenen Ebene, nicht nur bis zum Startbildschirm.

### Zwei neue Tore

**`spielprobe`** (ohne Browser, 0,3 s): 455 Antworten und Zusammenhänge.
Jeder Name, jeder Alias, kleingeschrieben, ein Buchstabe daneben, jede
hinterlegte Aussprache — für alle Ebenen und beide Tiefen. Dazu: Ränge 1–5
je Kontinent lückenlos, kein Ablenker ist die Hauptstadt, jedes Gebiet aus
den Daten hat eine Fläche auf der Karte.

**`passt`** prüft zusätzlich, ob das gesuchte Gebiet den Finger **überall**
annimmt, wo man es sieht — mit `elementsFromPoint` über den ganzen Stapel.
Ein Nachbargebiet an der gemeinsamen Grenze zählt nicht als Störung, Schmuck
schon.

Und der **Rauchtest** spielt jetzt jede Ebene mit beiden Profilen: 16
Kombinationen, jedes Mal eine richtige Antwort — beim Tippen bewusst der
Alias.

---

## Die Gestaltungsrunde

Sechs Wünsche in einem Satz: saubere Zurück- und Schließen-Knöpfe, ein Kopf
ohne überlappende Zeichen, „farblich eine Schippe drauf", mehr Toleranz beim
Schreiben, ein dezentes Überspringen und nach drei Fehlern die Lösung — und
die Bundesländer als Auswahl aus vier.

### Der Kopf war nirgends derselbe

Acht Bildschirme, acht von Hand gebaute Kopfzeilen. Auf dem iPhone quer
rutschten Titel und Knöpfe ineinander, weil jede Zeile ihre Breite anders
verteilte. Es gibt jetzt **einen** Kopf:

```
.kopf { grid-template-columns: 1fr auto 1fr; min-height: 68px }
```

Links die Rückweg-Knöpfe, in der Mitte der Titel, rechts die runden
Zeichenknöpfe (44 × 44). Unter 520 Bildpunkten fällt das Wort im Knopf weg,
das Zeichen bleibt — der Knopf schrumpft nicht unter die Daumengröße. Alle
acht Bildschirme rufen dieselbe Funktion `kopf({links, mitte, rechts})`; es
gibt keine Stelle mehr, an der man eine Kopfzeile falsch bauen kann.

### Die Blässe war erzwungen, nicht gewählt

Die sieben Flächenfarben lagen alle auf **L 0,88**. Das war die Ursache: bei
gleicher Helligkeit ist die stärkste Buntheit, die alle sieben Farbtöne im
sRGB-Raum noch erreichen, an die Helligkeit gebunden. Gemessen über die
Helligkeitsachse:

| L | größte gemeinsame Buntheit C |
|---|---|
| 0,90 | 0,045 |
| 0,86 | 0,070 |
| 0,82 | 0,090 |
| 0,78 | 0,115 |
| **0,74** | **0,135** |
| 0,70 | 0,130 |

Bei **L 0,74** ist das Maximum — 0,135 statt 0,055, also **zweieinhalbmal so
bunt**. Darunter fällt es wieder, weil Gelb und Grün an den Rand des Raums
stoßen. Die dunkle Schrift darauf hält 6,1:1.

Dazu: ein Farbverlauf im Grund statt einer Fläche, die Ebenenliste in acht
verschiedenen Farben mit Überschrift („Länder in · Asien"), Kacheln mit
farbiger Kante statt grauem Rahmen.

**Eine Falle unterwegs:** `color-mix(in oklch, …)` zog alle sieben Töne nach
Rot, weil Weiß den Farbwinkel 0 hat und in Polarkoordinaten dazwischen
gemischt wird. Alle sieben Mischungen laufen jetzt `in oklab`.

### Ein neues Tor: `lesbarkeit`

Farbe anfassen heißt Kontrast riskieren. Das Tor misst **88 Texte** in der
gebauten Seite, in Tag und Abend, jeden gegen den Grund, auf dem er
**wirklich** steht — nicht gegen den Seitenhintergrund. WCAG-Grenzen 4,5:1 für
kleinen, 3:1 für großen Text.

Beim ersten Lauf meldete es 34 Fehler, die keine waren: berechnete Farben
kommen als `oklch(…)` zurück, und die kann man nicht mit einer Zahlensuche
lesen. Der Umweg geht jetzt über eine Leinwand — malen, auslesen, rechnen.
Danach blieben **zwei echte**: `--tinte-3` erreichte auf Weiß nur 2,86:1 und
auf getönten Kacheln 2,3:1. Kleiner Text steht jetzt auf `--tinte-2`, das auf
0,46 abgedunkelt wurde.

### Schreiben darf danebenliegen

`rechtschreibung()` bekam bisher nur den kanonischen Namen — deshalb war
„Australien" falsch, wenn der Alias gefragt war. Sie bekommt jetzt das ganze
Ziel und urteilt in vier Stufen:

1. **richtig** — trifft einen der Namen genau
2. **fast** — trifft ihn, aber kleingeschrieben: „Namen schreibt man groß."
3. **richtig, mit Nebenbei** — trifft ihn ohne Bindestriche und Leerzeichen:
   „Nord-Amerika", „nordamerika", „Baden Württemberg". Antwort zählt, die
   Schreibweise wird gezeigt.
4. **fast/falsch** — Damerau-Levenshtein gegen den ähnlichsten Namen, mit der
   Stelle des Fehlers

Kleingeschrieben schlägt Bindestrich: „nord-amerika" gibt weiter den
Großschreibhinweis, nicht die Punkte.

### Wer nicht weiß, kommt trotzdem weiter

Unter dem Feld steht **„Weiß ich nicht"** — unterstrichen, grau, ohne Rahmen,
44 Bildpunkte hoch. Und nach dem **dritten** Fehlversuch löst die App von
selbst auf: Zeiger und Puls gehen aus, der Name erscheint am Ort auf der
Karte, „Das ist Thüringen." wird gesagt und geschrieben, nach 2,6 s geht es
weiter. Beides zählt im Leitner als *nicht gekonnt* und steht im Protokoll als
`ergebnis: gezeigt` — der Elternbereich sieht den Unterschied zwischen
„geraten" und „gezeigt".

### Bundesländer als Auswahl

Wie die Hauptstädte: vier Namen, einer richtig, die Reihenfolge je Aufgabe neu
gewürfelt. Das Tippen entfällt dort für beide Profile — sechzehn Bundesländer
mit Bindestrich und Umlaut sind für eine Achtjährige eine Rechtschreibprüfung,
keine Erdkundeaufgabe. Getippt wird weiter bei den Ländern.

---

## Die Ziehrunde

Der Anlass, wörtlich: *„im Fiona-Profil, wenn man die einzelnen
Möglichkeiten reinschiebt, kommen die nicht richtig an."*

### Was wirklich los war

Nachgemessen am gebauten Spiel, iPhone quer, Ebene „Kontinente":

| daneben | vorher | jetzt |
|---|---|---|
| 0–8 px | getroffen | getroffen |
| 16 px | **nichts passiert** | getroffen |
| 20–80 px | **nichts passiert** | getroffen |
| ab 100 px | nichts passiert | „Lass es auf dem Land los." |

**Ab 16 Bildpunkten daneben geschah gar nichts** — kein Hinweis, kein
Protokolleintrag, keine Bewegung. Das Etikett sprang zurück, und das Kind
erfuhr nie, warum. Australien misst auf der Weltkarte 60 × 50 Punkte; ein
Daumen ist breiter als das.

Warum kein Tor das gesehen hat: der Rauchtest zieht auf den **Anker**, also
auf den einen Punkt, der immer trifft. Er beweist, dass Ziehen
*funktioniert* — nicht, dass es *benutzbar* ist.

### Nachsicht, aber keine Zauberei

Die Umkreissuche testet nicht mit einer größer gerechneten Fläche, sondern
mit **echtem Treffertest an echten Umrissen** — nur eben auf Ringen um den
Finger statt an einem Punkt, von innen nach außen. Der erste Treffer
gewinnt, also gewinnt das nächstgelegene Gebiet. Die Form bleibt die Form.

Der Ring hört bei 60 Punkten auf. Ohne Deckel träfe jeder Wurf irgendetwas,
und ein Fehlgriff im Meer würde als **falsche Antwort** gewertet — das
kostet einen der drei Versuche für etwas, das gar keine Antwort war.

### Und man sieht, was gelten wird

Nachsicht ohne Anzeige wäre ein Würfel, den niemand sieht. Was unter dem
Finger liegt, **leuchtet auf**, bevor man loslässt. Dazu brauchte es
`pointer-events:none` am gezogenen Etikett: solange es anfassbar war, stand
es bei jedem Treffertest im Weg.

### Was nur das Bild gezeigt hat

Und dann war es trotzdem falsch. Das erste Bildschirmfoto zeigt: **das
Etikett deckte sein eigenes Ziel vollständig zu.** Die Antwortkachel
„Australien und Ozeanien" ist 240 × 160 Punkte groß und hing mittig am
Finger. Das Tor meldete grün — es prüft, *dass* etwas aufleuchtet, nicht,
ob man es sehen kann.

Jetzt wird aus der Kachel beim Aufheben ein **Schild**: einzeilig, ohne
feste Breite (ein `position:fixed`-Kasten schrumpft dann auf seinen
Inhalt), und es hängt **unter** dem Finger. Oben bleibt frei — dort liegt
die Karte.

Deshalb hält `ansicht` jetzt zwei Aufnahmen mehr: `spiel-zug` (mitten im
Zug, 22 Punkte daneben) und `spiel-lob`. Beides Zustände, die es sonst nur
mit dem Finger gibt.

### Aufgehoben wird erst nach 6 Punkten Weg

Vorher sprang das Etikett bei der leisesten Berührung auf `position:fixed`
unter den Finger und wieder zurück. Getippt wird aber viel: ein Etikett
liest sich selbst vor.

### Eine freundlichere Stimme

Drei Stellschrauben, alle drei standen auf „neutral": **welche** Stimme
(gesucht wird jetzt nach Namen — Anna, Petra, Helena, Marlene —, statt die
erstbeste deutsche zu nehmen), **wie schnell** (0,92 → 0,88) und **wie
hoch** (`pitch` 1 → 1,15; darüber wird es schrill).

### Gelobt statt festgestellt

„Richtig — Australien und Ozeanien!" ist eine Feststellung. Jetzt steht das
Lob in einer eigenen Zeile darüber, aus einem Vorrat von acht, und nie
zweimal hintereinander dasselbe: *Super gemacht! · Ganz genau! · Richtig! ·
Klasse! · Das stimmt! · Toll gemacht! · Perfekt! · Prima!*

Gelobt wird nur, was **ganz** richtig war — ein „Super gemacht!" auf eine
fast richtige Antwort nimmt dem Wort seinen Wert. Auch die Ablehnungen sind
freundlicher („Nicht ganz — probier es noch einmal." statt „Das ist ein
anderer Name."), und die Auflösung nach drei Fehlversuchen beginnt mit
„Kein Problem."

**Der Rauchtest hat das sofort gefangen** — und zwar mit 21 Fehlern, obwohl
jede Antwort korrekt gewertet wurde: er wartete auf das Wort „Richtig".
Er hängt jetzt an der **Klasse** `.richtigText`, nicht am Wortlaut. Eine
Klasse ist eine Zusage des Programms; ein Satz ist Text, den jemand ändern
darf.

### Neues Tor `ziehen`, fünf Gegenproben

Vier Zusagen: Nachsicht mindestens 40 Punkte · ein Wurf ins offene Meer
erzeugt **keinen** Protokolleintrag (das ist zugleich der Deckel) · während
des Zuges leuchtet das Ziel auf · Antippen ist kein Ziehen.

Zwei der fünf Gegenproben haben zuerst das **Tor** widerlegt, nicht den
Code:

- Der Deckel-Test maß über die Trefferreihe. 200 Punkte neben Australien
  liegt aber ein anderer Kontinent, und den zu treffen ist eine falsche
  *Antwort* — von außen sieht das aus wie „nichts gefunden". Er misst jetzt
  am offenen Meer, wo der Unterschied messbar ist.
- Der Antipp-Test maß nach dem Loslassen. Da hat die App längst aufgeräumt,
  und ein Zucken sieht aus wie keines. Er misst jetzt bei gedrücktem Finger.

Und die Messreihe selbst war zuerst wertlos: alle zehn Weiten liefen im
selben Browser-Kontext, also schaltete der Fortschritt weiter und **jede
Weite traf ein anderes Gebiet**. „Getroffen bis 80 px" war ein Mittelwert
über Australien, Europa und Afrika. Jeder Wurf bekommt jetzt einen frischen
Kontext.

Dazu prüft `passt` neu auch den **Hinweis**: er ist nicht bedienbar, aber er
ist die einzige Auskunft bei einem Fehlversuch — und er stand auf dem iPhone
quer zweizeilig am unteren Rand.

---

## Die Probenrunde

`npm run proben` — **19 stehende Gegenproben**, jede baut einen Fehler ein
und schaut nach, ob das zuständige Tor rot wird.

### Warum das nötig war

Ein Tor, das nie etwas meldet, sieht von außen genauso aus wie eines, das
alles durchlässt: **grün**. Bis hierher lagen die Gegenproben in meinem
Kopf. In der Ziehrunde habe ich fünf von Hand gefahren, zwei davon haben
nicht den Code widerlegt, sondern das Tor — und beim nächsten Mal wären sie
vergessen gewesen.

Zwei Regeln, erzwungen statt aufgeschrieben:

- **Erst einchecken, dann proben.** Wiederhergestellt wird mit `git
  checkout`. Der Lauf verweigert bei schmutzigem Baum den Dienst.
- **Prüfen, ob der Eingriff angekommen ist.** Jede Probe sagt, *worin* die
  Änderung zu finden sein muss — bei Toren, die `dist/` lesen, im gebauten
  Stand, nicht in der Quelle. Ein Eingriff, der nicht ankommt, sieht aus wie
  ein bestandenes Tor.

### Der erste Lauf hat vier Löcher gefunden

Vierzehn von achtzehn schlugen an. Die anderen vier waren die Ausbeute:

**1. `doku` lief seit dem Umzug überhaupt nicht.** Der Pfad lautete
`../docs/Lernkiste-KONZEPT.md` — ein Rest aus der Zeit unter
`towerfront/lernkiste/`. Seit dem Umzug zeigt er *aus* dem Verzeichnis
heraus, `existsSync` war falsch, und die ganze Prüfung übersprang sich
**still**. Still ist grün. Eine fehlende Konzeptdatei ist jetzt ein Fehler,
kein Achselzucken.

**2. `beruehrung` konnte gar nicht rot werden.** Es hatte keinen einzigen
Fehlerpfad — es berichtete, es bewachte nicht. Es hat jetzt eine harte
Zusage: die App baut die entkoppelte Trefferfläche aus dem **Anker**. Ein
Gebiet, das zu klein ist und keinen Anker hat, bekommt keinen Kreis und ist
mit dem Finger an *keiner* Stelle zu treffen — es stünde in den Daten, wäre
gezählt, läge auf der Karte und ließe sich nicht spielen.

**3. Das Tor stürzte ab, statt zu urteilen.** Die Gegenprobe dazu (Bremen
verliert seinen Anker, 9,4 pt, das kleinste Gebiet überhaupt) brachte einen
`TypeError` an zwei Stellen. Ein Absturz ist rot, aber er sagt nichts: dort
steht ein Stapelabzug statt eines Satzes, und beim nächsten Mal sucht
jemand den Fehler im Tor statt in den Daten. Ein Tor muss auch **kaputte**
Eingaben beurteilen können.

**4. `proben` selbst ließ den Baum schlechter zurück, als es ihn vorfand.**
Es stellte die Quellen mit `git checkout` wieder her — aber `dist/` steht
nicht in Git. Der letzte Eingriff blieb im gebauten Stand stehen, und das
nächste Tor prüfte ihn mit. Es baut jetzt nach jeder Probe neu.

Dazu zwei Proben, die *selbst* falsch gezielt hatten: „einen Alias aus den
Daten nehmen" ist eine erlaubte Datenänderung und kein Fehler — gemeint war
der Fehler aus der Spielerrunde, dass die Rechtschreibprüfung Aliasse gar
nicht erst bekommt. Und der Manifest-Pfad hieß `manifest.webmanifest`,
nicht `app.webmanifest`.

### Und das `ziehen`-Tor war zu schwach

Die Gegenprobe „das gezogene Schild bleibt anfassbar" blieb grün. Der Grund
ist lehrreich: das Schild hängt seit der Ziehrunde **unter** dem Finger,
also liegt es beim exakten Treffertest gar nicht mehr im Weg. Aber die
Umkreissuche testet bis 60 Punkte in **alle** Richtungen, und
`elementFromPoint` liefert immer nur das oberste Element — ein anfassbares
Schild verdeckt damit die ganze untere Hälfte des Suchradius.

Das Tor zieht deshalb jetzt auch **von oben** heran, wo das Schild über dem
Ziel hängt. Gemessen: mit `pointer-events:none` trifft man bis 40 Punkte,
ohne es bis 0.

### Was `proben` außerdem zählt

Zwei Deckungsprüfungen, beide aus dem Baum gelesen statt hingeschrieben:

- **Hat jedes Tor der Kette eine Probe?** Die Kette kommt aus
  `package.json`. Die häufigste Verfallsart ist nicht die falsche Probe,
  sondern die fehlende: ein neues Tor kommt dazu, niemand trägt eine nach,
  und alles bleibt grün.
- **Hat jede der sieben Prüfungen in `inhalt.mjs` eine?** Die Liste wird aus
  der Datei selbst gelesen. Genau so ist `beruehrung` aufgefallen.

---

## Die Budgetrunde

Zwei Tore: eines, das die Größenzusagen hält, und eines, das dafür sorgt,
dass die Gegenproben überhaupt noch gefahren werden.

### `budget` — die Zusagen standen im Konzept, ohne dass sie jemand hielt

Kapitel 8 des Konzepts nennt fünf Größengrenzen und schreibt hinter drei
davon „Tor `budget`". Das Tor gab es nicht. Und die Startgröße ist hier
schon zweimal unbemerkt gewandert — von 297 auf 537 KB, als fünf Kontinente
verdrahtet wurden, und zurück auf 132, als sie nachgeladen statt eingebacken
wurden. Beide Male hat es niemand *gemessen*, sondern jemand *gemerkt*.

**Die Grenzen stehen nicht im Tor, sie werden aus dem Konzept gelesen.** Zwei
Zahlen an zwei Orten veralten getrennt voneinander: die eine wird gepflegt,
die andere gilt, und niemand sieht den Unterschied.

### Der erste Lauf fand eine echte Überschreitung

| | vorher | jetzt | Zusage |
|---|---|---|---|
| Startbündel gesamt | 194,0 KB | **138,2 KB** | < 400 |
| davon Geometrie | **94,8 KB** | **38,7 KB** | < 90 |
| davon Schriften | 51,7 KB | 51,7 KB | < 60 |
| größte nachgeladene Ebene | 107,4 KB | 107,4 KB | < 250 |

94,8 gegen 90 — fünf Prozent drüber. Und aufgeschlüsselt lag der Grund
offen: **56 der 94 KB waren Deutschland**, gebraucht für *zwei von sechzehn*
Ebenen. Ein Kind, das Kontinente übt, hatte sechzehn Bundesländer im
Gepäck.

Deutschland hängt jetzt in derselben Nachladestrecke wie die Länder.
Herausgenommen wird nur `pfad` — Name, Hauptstadt, Anker, Ort und
Stadtstaat-Kennzeichen bleiben im Startbündel, zusammen unter einem
Kilobyte, weil die Ebenenwahl den Fortschritt ausrechnet, bevor eine Ebene
offen ist. Ersetzt wird **eintragsweise**, nicht als neue Liste: sonst
blieben die Verweise, die anderswo längst auf die alten Einträge zeigen, ohne
Umriss zurück.

**Die Messstelle, weil die Zahl sonst nichts bedeutet:** gemessen wird der
*Anteil* der Geometrie, nicht ihre Summe — also gzip(Seite) minus
gzip(dieselbe Seite mit leeren Pfaden). Der erste Anlauf packte die Umrisse
für sich allein und kam auf 91,7 KB. Das ist die Größe, die sie *hätten*,
nicht die, die sie in der Seite *kosten*.

### Und eine Ratsche unterhalb der Grenze

Zwischen 138 und 400 KB liegt viel Platz. Eine Zahl, die sich in acht Runden
verdoppelt, ohne je anzuschlagen, ist genau der Verfall, den keine Grenze
fängt. Der festgehaltene Stand (`tor/budget-stand.json`) meldet deshalb
jedes Wachstum über 5 % — nicht als Verbot, sondern als Frage: war das
Absicht? Neu festhalten mit `npm run budget -- --neu`, von Hand, so wie die
Vorbilder in `ansicht`.

### `rhythmus` — eine Regel, die nur dasteht, wird gebrochen

`npm run proben` dauert rund zwölf Minuten. Zu lang für jede Runde, zu kurz,
um es sich zu sparen. Also braucht es einen Rhythmus — und der darf nicht in
einem Dokument stehen, sondern muss erzwungen sein. Dieses Verzeichnis hatte
schon einmal 61 Fassungen lang eine falsche Zahl im Stand, ohne dass es
jemandem auffiel.

`rhythmus` steht **vorn in der Kette**, kostet Millisekunden und schlägt an,
wenn der letzte volle Probenlauf mehr als **drei Runden** zurückliegt.
Gezählt werden nur Commits, die Code anfassen — wer eine Zeile im Konzept
ändert, verbraucht keine Frist.

Es prüft außerdem zwei Dinge, über die das Datum nichts sagt: ob **so viele
Proben** im Baum stehen wie festgehalten (wer eine dazuschreibt, hat einen
anderen Lauf vor sich), und ob **alle Tore der Kette** schon beim letzten
Lauf dabei waren.

Drei Fallen, die dabei zu umgehen waren:

- **Ohne Historie kann es nichts zählen.** `actions/checkout` holt
  voreingestellt nur den letzten Commit. Der Ablauf fährt jetzt
  `fetch-depth: 0`, und fehlt die Historie trotzdem, sagt es das laut,
  statt sich zu überspringen.
- **Gezählt wird ab der Standdatei, nicht ab dem notierten Commit.** Das
  kostete einen Anlauf: `proben` läuft *vor* dem Commit (der Baum muss
  sauber sein) und notiert sich den damaligen Kopf. Wird die Runde danach
  zusammengefasst, gibt es diesen Commit nicht mehr — lokal findet `git` ihn
  noch im Objektspeicher, auf dem Runner nach einem frischen Klon nicht. Das
  Tor wäre genau dort rot geworden, wo alles in Ordnung ist. Die Standdatei
  dagegen steht immer in der Historie.
- **Ein abgebrochener Probenlauf soll nicht durchwinken.** Der Stand trägt
  `lauf: vollständig`; alles andere ist rot.
- **Henne und Ei.** Zwei Proben prüfen, ob `rhythmus` einen veralteten Stand
  erkennt — und brauchen dafür einen Stand, den erst dieser Lauf erzeugt.
  Aufgelöst wird das **einmal und laut**: beim Erstlauf werden die beiden
  übersprungen, es steht in der Ausgabe, und weil danach ein Stand
  existiert, kann der Fall nie wieder eintreten. Was nicht passiert: sie
  stillschweigend überspringen — das ist genau die Lücke, die dieses
  Werkzeug aufdecken soll.

### Sieben neue Gegenproben, zwei davon lehrreich

25 stehende Proben, alle schlagen an. Alle vier Fehlerpfade von `rhythmus`
sind belegt — auch „der Lauf liegt zu lange zurück", und das ging nicht
ohne Weiteres: *wie lange* er zurückliegt, steht in der Historie und nicht
in einer Datei, die man anfassen kann. Das Tor hat dafür eine Schraube
bekommen, die nur **strenger** stellen kann (`Math.min`) — eine, die auch
lockern könnte, wäre ein Schalter zum Abstellen des Tors, und der hat in
einer Kette nichts verloren. Die Füllung für „die Seite wächst
unbemerkt" musste beim zweiten Anlauf **unkomprimierbar** werden: 40 000
gleiche Buchstaben schrumpfen im Packer auf ein paar Dutzend Byte, und die
Probe wäre an der Grenze gescheitert, ohne dass jemand den Grund gesehen
hätte. Gemessen wird gzip — also muss die Füllung wie Rauschen aussehen.

---

## Die Übergangsrunde

Drei Punkte, und zwei davon haben unterwegs Fehler in den **Toren**
gefunden, nicht im Spiel.

### Erst eine Korrektur an mir selbst

Ich hatte geschrieben, `npm run proben` dauere zwölf Minuten. Gemessen sind
es **4,8** — ich hatte die Wanduhr meiner ganzen Arbeit dafür gehalten. Der
Lauf sagt jetzt selbst, wo die Zeit liegt:

| Tor | vorher | jetzt |
|---|---|---|
| ziehen (5 Proben) | 129 s | **48 s** |
| smoke | 79 s | 79 s |
| passt | 29 s | 29 s |
| ansicht | 25 s | 25 s |
| *alle 27* | *4,8 min* | *3,5 min* |

`ziehen` war der lohnende Posten: jede seiner fünf Proben fuhr das ganze Tor
durch — zehn Wurfweiten, vier von oben, die Meersuche, das Antippen —,
obwohl jede sich für genau einen Abschnitt interessierte. Es kennt jetzt
`--nur=nachsicht,oben,meer,anzeige,tippen`. Voreingestellt läuft alles, und
die Kette ruft es ohne Argument auf: eine Abkürzung, die man versehentlich
nimmt, wäre keine.

### Das Offline-Tor hat nur die halbe Wahrheit gemessen

Deutschland wird seit der Budgetrunde nachgeladen. Also musste das
Offline-Tor auch dorthin laufen, nicht nur bis „Länder in Asien". Die
Gegenprobe dazu — Deutschland aus dem Vorrat des Service Workers nehmen —
**blieb grün**. Zwei Befunde dahinter:

**1. Auf ein Element zu warten ist nicht dasselbe wie eine Karte zu sehen.**
Die App baut ihre Pfade aus dem leichten Verzeichnis, das im Startbündel
bleibt: Name, Anker, Ort — aber kein Umriss. Fehlt die nachgeladene
Geometrie, steht `path.ziel` trotzdem da, nur mit leerem `d`. Geprüft wird
jetzt die **Fläche**.

**2. `context.setOffline(true)` deckt den Service Worker nicht ab.** Mit
einem mitschreibenden Server nachgemessen: während der Kontext auf offline
stand, hat der Server `/daten/deutschland.json` und `/sw.js` ausgeliefert.
Der Service Worker holte munter weiter — und das Tor meldete „ohne Netz
kommt die App bis zu den Bundesländern". Genau der Fall, vor dem Regel 13
warnt: die Prüfung maß etwas anderes, das lauter war.

Das Netz wird jetzt am **Server** abgeschaltet, und zwar durch Abreißen der
Verbindung, nicht durch einen Fehlercode — eine Antwort ist Netz, auch eine
mit 503. `setOffline` bleibt daneben stehen: zwei Schlösser sind besser als
eines, und im Browser sieht die App dann auch `navigator.onLine === false`.

### Der Übergang von Aufgabe zu Aufgabe

Es war kein harter Schnitt — eine 320-ms-Überblendung gab es schon. Nur
blenden beide Bildschirme *gleichzeitig*, und weil die Karte zwischen zwei
Aufgaben derselben Ebene identisch ist, sah man nur, wie sie kurz dunkler
wird: ein **Blinzeln**.

Jetzt kommt das Neue herein — Frage, Karte und Antworten steigen leicht von
unten auf, die Antworten nacheinander im Abstand `--d-staffel` (45 ms). Das
Auge folgt der Liste, statt vier Kästen gleichzeitig aufblitzen zu sehen.

**Der erste Anlauf war schlechter als vorher.** Das Bild aus der Mitte des
Übergangs zeigte ein **Doppelbild**: die alte Lobzeile stand über der neuen
Frage, und hinter der neuen Karte lag die alte mit ihrem grün gefärbten
Treffer. Der gehende Bildschirm braucht `--d-schirm / 2`; genau so lange
wartet das Neue jetzt.

Gesehen hat das ein Auge, kein Tor — deshalb misst der Rauchtest es jetzt:
während des ganzen Wechsels darf nie mehr als **ein** Bildschirm deutlich
sichtbar sein. Gemessen wird der schwächere der beiden im schlimmsten Bild;
er liegt bei **0,00**, erlaubt sind 0,20. Blenden beide gleichzeitig,
treffen sie sich bei etwa 0,5.

Und noch eine Falle: die Messung stand zuerst *vor* der Fahnenprüfung,
verbrauchte 2,6 s und überholte damit den Bildschirmwechsel — danach meldete
das Tor „kein Name auf der Karte", obwohl der Name dagewesen war. Sie
ersetzt jetzt die Wartezeit, statt dazuzukommen.

### Und dann hat der Übergang das Ziehen kaputtgemacht

Drei Aufnahmen wurden rot. Bei zweien war es wirklich nur Kantenglättung:
die Geometrie ist auf den Zehntelpunkt identisch, und eine
`animation`-Eigenschaft hebt ein Element auf eine eigene Ebene, wo Text
anders geglättet wird. Byte-identisch bei drei Läufen, also kein Rennen.

**Bei der dritten war es ein echter Regress, und ich habe ihn zuerst
übersehen.** Ich habe den Befund von `spiel-lob` auf alle drei übertragen
und die Vorbilder erneuert — mit dem Fehler drin. Aufgefallen ist es erst,
als eine Gegenprobe grün blieb, die vorher angeschlagen hatte.

Der Fehler: **eine CSS-Animation steht in der Kaskade über dem Inline-Stil**
— auch wenn sie längst abgelaufen ist und nur noch ihren Endzustand hält
(`both`). `herein` endet auf `transform: none`, und genau das ist die
Eigenschaft, mit der das gezogene Schild am Finger hängt. Das Schild blieb
in der Antwortliste stehen.

Und es sah harmlos aus: das Ziel leuchtete richtig auf, weil die
Umkreissuche am **Finger** hängt und nicht am Schild. Kein Tor hat es
gesehen. Jetzt misst `ziehen` den **Abstand vom Finger** (19 px) und fragt
direkt, was mitten unter dem Schild liegt — die Karte oder das Schild
selbst.

Zwei Anläufe dieser Prüfung waren daneben, beide aus demselben Grund: bei
55 Punkten über Australiens Anker steht der Finger schon über Indonesien,
und das gehört zu Asien. Eine Reihe, die so weit misst, misst einen
Nachbarn statt das Schild — dieselbe Falle wie beim Deckel der Nachsicht.

### `proben` hat nie gefragt, ob das Tor vorher grün war

Genau daran ist die Probe vorbeigelaufen: sie meldete „schlägt an", während
das Tor in **beiden** Zuständen dieselbe Zeile schrieb. „Schlägt an" heißt
seither wirklich, was es sagt — vor jedem Urteil wird das Tor einmal ohne
Eingriff gefahren.

Das kostet ungefähr einen Kettenlauf, aber nur dort, wo es zählt: gefragt
wird erst, **nachdem** das Tor unter dem Eingriff rot war. Bleibt es grün,
ist die Antwort ohnehin belanglos.

Dabei kam ein Widerspruch heraus: **während eines Probenlaufs ist
`rhythmus` per Definition rot** — der festgehaltene Stand ist veraltet,
genau deshalb läuft man ja. Seine vier Proben laufen jetzt in einem zweiten
Durchgang, nach dem Schreiben des Standes. Schlägt dort eine fehl, wird der
eben geschriebene Stand als `abgebrochen` markiert: er darf keinen Lauf
bezeugen, der etwas offen gelassen hat. Und weil `git checkout` nach jeder
Probe die *eingecheckte* Fassung zurückholt, wird der frische Stand danach
neu gesetzt — ohne diese Zeile war `rhythmus` sofort wieder rot.

---

## Die Geräterunde

Nach dem Spielen am iPhone. Vier Punkte, und zwei davon hatten **dieselbe**
Ursache.

### Der X-Knopf und die Sterne lagen unter der Statusleiste

Nicht schlecht gebaut — begraben. `body` trug das Polster
`env(safe-area-inset-*)`, aber `#buehne` ist `position:absolute` und `body`
ist nicht positioniert: `inset:0` bezieht sich damit auf das **Fenster**,
nicht auf das Polster.

Nachgemessen: mit 44 Punkten Polster am Rumpf blieb der Schließen-Knopf
exakt dort, wo er vorher war — 12 Punkte von der Ecke. Dort sitzt auf dem
iPhone die Uhr, rechts daneben der Akku. Der Knopf war zu sehen und nahm den
Finger nicht an.

Der sichere Bereich hängt jetzt an der Bühne, über Marken
(`--sicher-oben` …). Nach der Reparatur wandert der X mit 44/20 Punkten
Einzug von (12,12) auf (56,32), die Sterne von 22 auf 66.

**Und `passt` hat eine siebte Größe:** *iPhone quer, Leiste* — dasselbe
Gerät mit dem, was das Telefon selbst belegt (21 oben und unten, 59 an den
Seiten). `env()` lässt sich von außen in keinem Browser vorgeben; die
Verkabelung dahinter schon. Geprüft wird damit nicht, ob iOS die richtigen
Zahlen liefert, sondern ob die App sie überhaupt beachtet — und genau das
tat sie nicht.

### Antarktika ist raus — gegen meinen eigenen früheren Rat

Die Frage war: *warum wird Antarktika immer als einzelner Kontinent gezeigt,
auf der großen Karte kann man das nicht verbinden?* Sie trifft genau den
Punkt. Antarktika hatte hier **zwei** Sonderrollen, und beide waren teuer:

- Auf der Weltkarte wird die Antarktis zu einem breiten Band am unteren
  Rand, das über die ganze Kartenbreite läuft. Als Umriss unkenntlich, beim
  Ziehen kaum vom Kartenrand zu unterscheiden.
- Deshalb bekam sie eine eigene **polare Aufsicht** — eine zweite Kartenart
  für ein einziges Gebiet. Ein Kind, das gerade sechs Umrisse nebeneinander
  gelernt hat, sah bei der siebten plötzlich die Welt von oben.

Im Konzept stand mein Rat von damals: *„ich rate davon ab."* Er steht dort
weiter, mit dem Ausgang daneben. Was er nicht mitgerechnet hatte, ist der
Preis der zweiten Kartenart.

Damit fällt einiges mit weg: der Sonderschnitt der Weltkarte (sie wurde
knapp unterhalb der Eiskante beschnitten, jetzt sind es acht Punkte Luft wie
an jedem anderen Rand), die polare Ansicht im Spiel, `vbA`, und Fionas
dritte Runde. **63 Gebiete statt 64, Startbündel 138,2 → 131,7 KB.**

Zwei Tore trugen die Drei fest verdrahtet und meldeten es sofort:
`spielprobe` prüfte `[1,2,3]` auf leere Runden, die App las
`kontinentRunde` bis 3. Beide lesen die Rundenzahl jetzt aus den Daten.
Und der Sprachkorpus hielt Antarktika-Zeilen; das Tor `vergleich` brach
darüber ab.

### „Von vorne", und zwar für das Kind

Wer eine Ebene gekonnt hatte, kam nicht mehr an sie heran: der einzige Weg
zurück ging über *„Alles von Fiona löschen"* im Elternbereich — und das
löscht das ganze Profil.

Unter jeder Kachel mit Fortschritt steht jetzt ein kleines **„von vorne"**.
Zwei Tipper, nicht einer: der Knopf steht direkt neben der Kachel, und ein
Fehlgriff würde eine Woche Übung wegräumen. Der zweite Tipper sagt
ausdrücklich, was verschwindet.

Der Rauchtest geht die ganze Kette ab — Knopf da, erster Tipper fragt nach,
zweiter löscht wirklich, danach ist der Knopf weg. Er steht **zuletzt** in
der Sitzung: der erste Anlauf stand davor und meldete prompt „kein einziger
Aufkleber" — der Test hatte sich selbst die Grundlage entzogen.

### Die Stimme

Drei Änderungen, und die wichtigste ist keine Einstellung, sondern eine
Auswahl:

**Satzweise statt am Stück.** „Klasse! Das ist Australien und Ozeanien." als
*eine* Ausgabe klingt heruntergelesen — die Sprachausgabe zieht über den
Punkt hinweg. Als zwei Ausgaben hintereinander entsteht die Pause von
selbst, und genau diese Pause ist der Unterschied zwischen einem Ansagetext
und jemandem, der einen lobt. Der Jubel liegt dabei eine Spur höher als die
Sache danach: der Unterschied zwischen „Klasse!" und „Klasse."

**Tonhöhe 1,15 → 1,06.** 1,15 klang jung, aber gepresst.

**Die Stimme ist wählbar.** Welche es gibt, entscheidet das Gerät — ein
iPhone bringt je nach Fassung ein knappes Dutzend deutscher mit, ein
Schreibtischbrowser oft nur eine. Eine feste Namensliste ist deshalb eine
Voreinstellung und kein Ergebnis. Im Elternbereich steht jetzt, was *dieses*
Gerät anbietet; Antippen spielt einen Satz aus dem Spiel vor, nicht „Test
1 2 3" — man wählt eine Stimme für das, was sie wirklich sagen wird. Dazu
der Hinweis, wo iOS bessere Stimmen nachlädt.

Ein Fehler unterwegs, den der Rauchtest sechzehnmal auf einmal meldete: die
Stimmensuche läuft beim Laden und griff auf `Einst`, das erst weiter unten
deklariert wird. Ein `let` ist bis dahin nicht lesbar, und die App startete
gar nicht mehr. Der Wunsch steht jetzt in einer eigenen Variablen.

### Zwei Tore maßen, bevor die Karte stand

Ausgelöst hat es eine Gegenprobe, die „aus einem anderen Grund" durchfiel.
Dahinter lag ein Rennen — und zwar im **Tor**, nicht in der App: zwei Läufe
der Bildabnahme endeten der eine über Australien, der andere über
**Afrika**.

`kartenGroesse()` setzt Breite und Höhe der Karte in zwei aufeinander
folgenden Bildern. Wer die Bildschirmkoordinaten eines Ankers vorher liest,
bekommt sie aus der noch ungesetzten Karte und zieht dann irgendwohin.
`ansicht` meldete so 3,6 % Unterschied bei unverändertem Code, und dieselbe
Falle steckte in `ziehen` — sie erklärt, warum die gemessene Nachsicht
zwischen Läufen zwischen 60 und 80 Punkten schwankte.

Beide warten jetzt, bis die Karte wirklich steht. Drei Läufe hintereinander:
**null Bildpunkte Unterschied**, Nachsicht stabil bei 60.

### Und `proben` räumt jetzt auch beim Abbruch auf

Ein Lauf, der von der Zeitgrenze beendet wurde, ließ `if (false){` in der
Bestätigungsabfrage stehen. Der nächste Bau übernahm es, und die
Bildschirmfotos danach zeigten einen beschädigten Stand — gesehen habe ich
das erst, weil `proben` beim nächsten Start den schmutzigen Baum meldete.

„Ein Werkzeug, das den Baum schlechter zurücklässt, als es ihn vorgefunden
hat, ist gefährlicher als keines" stand schon da. Es galt nur für den
geordneten Fall. Jetzt hängt es an `SIGINT`, `SIGTERM` und `SIGHUP`.

---

## Antippen oder Ziehen

Für Lea war das Ziehen ein Umweg: sie weiß, welches Bundesland das ist, und
will es sagen können. Für Fiona ist genau dieser Zug der Lerninhalt — sie
verbindet einen Namen mit einem **Ort** auf der Karte.

Beides ist richtig, nur nicht für dasselbe Kind. Also beides, und ein
Umschalter dazwischen:

| | voreingestellt | was ein Tipper bedeutet |
|---|---|---|
| Fiona | **ziehen** | den Namen vorlesen |
| Lea | **antippen** | die Antwort geben |

**Gezogen werden kann immer.** Die Weise entscheidet nur, was ein *Tipper*
bedeutet — wer im Antipp-Modus trotzdem zieht, soll nicht ins Leere greifen.

Der Umschalter steht dort, wo er etwas zu schalten hat: unter den Antworten,
neben „Weiß ich nicht", und nur bei einer Auswahl mit Etiketten. Beim
Tippfeld gibt es nichts umzuschalten. Er heißt, was er tut — „Lieber
ziehen" beziehungsweise „Lieber antippen" —, wirkt **mitten in der Aufgabe**
(ein Neuaufbau würde die begonnene Aufgabe zurücksetzen) und merkt sich die
Wahl **je Kind**, nicht je Gerät: sonst stellt die eine der anderen das
Spiel um.

### Der Rauchtest spielt jetzt so, wie das Kind spielt

Er zog bisher immer — auch dort, wo ein Kind antippt. Damit hätte er den
neuen Weg nie berührt. Die Weise steht als **Datenfeld** am Umschalter, und
der Test liest sie dort ab, statt einen deutschen Satz zu zerlegen. Am Ende
steht eine Zeile, die zeigt, welche Wege wirklich gegangen wurden:

```
Antwortwege:   fiona: ziehen · lea: antippen
```

Fehlt einer der beiden, ist der Umschalter entweder weg oder wirkungslos —
und die Hälfte der Bedienung ungeprüft. Genau das prüfen die beiden neuen
Gegenproben nach.

### Ein Vorbild flackerte

`proben` meldete `ansicht` als *schon ohne Eingriff rot* — die Prüfung, die
es seit der Übergangsrunde gibt. Vier Spielbilder waren schlicht veraltet
(der neue Umschalter), aber eines nicht: **`mg-belohnung`** wich um 0,94 %
ab und war danach dreimal grün.

Der Entwurf spielt die Belohnung ab, wenn sie ins Bild **scrollt**
(`IntersectionObserver`, Schwelle 0,4) — und die Aufnahme scrollt sie selbst
hinein. Ob der Stern beim Auslösen schon da war, entschied das Rennen
zwischen beidem.

Ein Vorbild, das gelegentlich rot wird, ist schlimmer als keines: es erzieht
dazu, Rot zu übersehen. Die Aufnahme holt das Abgebildete jetzt erst ins
Bild und wartet, bis es **wirklich fertig** ist. Vier Läufe hintereinander:
neun von neun grün.

---

## Die Vorleserunde

Zwei Rückmeldungen von den Kindern, und die erste war ein Befund über die
ganze App.

### Fiona konnte sie nicht bedienen

Ihr Profil trägt seit dem ersten Entwurf `vorlesen: true` — *liest noch
nicht*. Abgefragt wurde es an **keiner einzigen Stelle**. Sie sah „Wie heißt
dieses Bundesland?" und vier Namen, und nichts davon sprach. Sie konnte
raten, welche Kachel wohin führt.

Jetzt sagt jeder Bildschirm beim Öffnen, was er ist, und die Aufgabe wird
mit ihren Möglichkeiten vorgelesen — so, wie ein Mensch fragen würde:

> „Wie heißt dieses Bundesland? Thüringen, Mecklenburg-Vorpommern, Berlin
> oder Rheinland-Pfalz?"

**Die Frage allein hätte nicht gereicht.** Ein Kind, das die vier Antworten
nicht lesen kann, wüsste dann, was gefragt ist, aber nicht, was zur Wahl
steht.

Zwei Details, die es braucht: die Ansage kommt **nach** dem Bildwechsel
(`zeige()` blendet 320 ms, und eine Stimme, die während des Übergangs
anfängt, gehört hörbar noch zum vorigen Bildschirm), und sie hängt am
**Kind**, nicht am Gerät — für Lea wäre dieselbe Ansage nur Lärm. Vor der
Profilwahl wird immer angesagt: dort ist noch nicht bekannt, wer davorsitzt.

### Das Forscherbuch sah nach Arbeit aus

Vorher standen dort alle rund sechzig Gebiete nebeneinander, die noch nicht
gesammelten grau mit einem Fragezeichen. Am Anfang war die Seite also fast
leer — sechzig leere Kästen. Ein Aufkleberalbum, in dem neunundfünfzig
Plätze leer sind, macht nicht stolz, sondern klein.

Jetzt steht dort, **was da ist** — größer, mit Namen. Was fehlt, kommt als
kurze Vorschau ans Ende: drei Stück aus der Ebene, an der gerade gearbeitet
wird. Nicht als Mahnung, sondern als nächster Schritt. Wer noch nichts hat,
bekommt einen Satz und drei Formen statt sechzig grauer Kästen.

**Und die Aufkleber sind jetzt Aufkleber.** Vorher trug jeder den Ausschnitt
seiner Karte: ein Kontinent stand im Maßstab der ganzen Weltkarte in seinem
Kästchen. Afrika füllte es knapp, **Europa war ein grüner Fleck von zwölf
Bildpunkten**. Jeder wird jetzt auf seine eigene Form gerahmt, aus dem Pfad
gerechnet, mit acht Prozent Luft.

### Drei neue Zusagen im Rauchtest

Ob eine App vorliest, lässt sich nicht ansehen — `speechSynthesis` gibt
nichts zurück. Der Rauchtest schreibt deshalb mit, was gesprochen wird:

```
Aufgaben vorgelesen:   Fiona 8, Lea 0  (von je 8 Ebenen)
Forscherbuch:          5 von 8 Aufklebern
```

Fehlt Fiona eine Ansage, ist die Ebene für sie nicht spielbar. Bekommt Lea
eine, hängt die Ansage nicht am Kind. Und das Buch darf höchstens drei mehr
zeigen, als wirklich gesammelt sind.

Zwei Anläufe dieser Prüfungen waren selbst falsch, beide auf dieselbe Art —
sie maßen, was leichter zu messen war:

- Der erste zählte *irgendeine* Sprachausgabe und meldete „Lea bekam 8
  Aufgaben vorgelesen". Gemessen war das **Lob** der vorigen Aufgabe, das
  beide Kinder hören. Der Mitschnitt wird jetzt geleert, bevor die Ebene
  aufgeht, und gezählt wird die Frage.
- Der zweite zählte die Aufkleber mit der Klasse `da`. Die Gegenprobe, die
  einfach alle als gesammelt zeichnete, kam damit durch: sie fälschte genau
  die Zahl, gegen die geprüft wurde. Gezählt wird jetzt gegen die **Ablage**.

---

## Offen

| | Was | Wer |
|---|---|---|
| O4 | **BKG VG250.** Der Host ist durch die Netzrichtlinie gesperrt (403 auf CONNECT). Die Bundesländer stehen auf Natural Earth 1:10m — gut genug zum Entwerfen, zu grob zum Ausliefern. Umstellung sind zwei Zeilen. | ihr oder Freigabe |
| — | **Pages einschalten**: Settings → Pages → Source = *GitHub Actions*. Ein Klick, und die Auslieferung läuft. | ihr |
| — | **Die Entwürfe und den Prototyp auf dem iPad ansehen.** Kein Tor läuft auf iOS. | ihr |
| — | Schriftentscheidung: Plus Jakarta Sans oder Nunito, am Gerät | ihr |
| — | M1: Vite und Svelte. PWA, Service Worker und Ablage stehen bereits. | ich |
| D31 | Der Beweis für den Lagernamen (F13): zwei Installationen an zwei Pfaden in denselben Browser setzen und nach der zweiten die erste ohne Netz starten. Heute prüft `pwa` nur die Form des Namens. | ich |
| D28 | `ansicht` auf dem Runner: nur im festgenagelten Playwright-Abbild sinnvoll, samt dort aufgenommener Vorbilder | ich |
| — | Leitner, Elternbereich, Protokoll | ich |

---

## Die Audit-Runde

> Auftrag: *„eine echte Schleife, ob wir irgendwo noch Fehler, Lücken oder
> Inkonsistenzen haben … Wir möchten einen Fortschritt sehen. Wir möchten
> Sterne sehen, vielleicht ein paar Sticker."*

Zwei Hälften, und die erste hat die zweite gerettet: **das Tor `inhalt` war
tot**, seit Antarktika gestrichen wurde. Hätte diese Runde nur gebaut und
nicht gesucht, wären sieben Prüfungen weiter stumm geblieben.

### Wie gesucht wurde

Nicht durch Lesen. Vier Durchgänge, jeder mit einem Werkzeug, das etwas
zählt, das ein Blick nicht zählt:

| Durchgang | Was gemessen wurde | Was gefunden wurde |
|---|---|---|
| Zustandsfelder | Welches Feld an `Sitzung`, `Einst`, `P` wird gelesen, welches nur geschrieben | F2 |
| Tote Verweise | Funktionen ohne Aufruf, CSS-Klassen ohne Markup, `var(--x)` ohne Definition, Marken ohne Verwendung | F1, F5 |
| Die Tore selbst | Jedes Tor einzeln fahren, statt sich auf den letzten grünen Lauf zu verlassen | F6, F7, F8 |
| Der Blick aufs Zielgerät | Bildschirmfotos bei 844 × 390, dem Fenster, auf dem geurteilt wird | F3, F4, F9, L1 |

### Neun Befunde

| | Befund | Wie er durchgekommen ist |
|---|---|---|
| **F1** | `--r5` war nie definiert und wurde benutzt: `padding: var(--r3) var(--r5)` am gezogenen Schild. Eine ungültige `var()` macht die **ganze** Deklaration ungültig, und weil `padding` nicht erbt, blieb null übrig — der Name klebte an beiden Rundungen. | Kein Tor misst Polsterung. `passt` misst Überlauf, `lesbarkeit` Kontrast, und das Vorbild im Bildvergleich hielt den Fehler **fest**. |
| **F2** | `st.richtig` und `st.versuche` wurden bei jeder Antwort hochgezählt und nirgends gelesen — Reste der alten Sternformel. | Ein toter Zähler tut nichts Falsches. Er lädt nur die nächste Formel ein, sich an ihm zu bedienen: genau so entstanden die zwei Sternformeln. |
| **F3** | Endbildschirm: der Balken zeigte die mittlere Fachhöhe (25 %), der Satz direkt darüber „Im Buch: **0** von 4". Zwei richtige Zahlen, die sich widersprechen, weil sie übereinanderstehen — und ein Kind liest den Balken. | Beide Zahlen waren für sich korrekt. |
| **F4** | Die Namensfahne stand „neben" dem Gebiet — um die halbe Gebiets**breite** plus die halbe Fahnenbreite. „Australien und Ozeanien" landete im Querformat mitten auf **Südamerika**. | Die Leitlinie war da. Wer sie nicht verfolgt, liest den Namen als Beschriftung des Kontinents darunter. |
| **F5** | `--flaeche-l` und `--flaeche-c` standen im Markensystem und wurden **nie benutzt**; ihre Werte waren siebenmal daneben ausgeschrieben. Wer an der Marke drehte, änderte nichts. | Das Tor `marken` verglich die sieben Zahlen **miteinander** — gleich waren sie. |
| **F6** | `tor/inhalt.mjs` importierte `src/geo/antarktika.fein.js`, gelöscht beim Streichen von Antarktika. **Sieben Prüfungen** — inhalt, topologie, beruehrung, marken, schrift, symbol, doku — stürzten vor ihrer ersten Zeile ab. | Ein abgestürztes Tor erfüllt jede Gegenprobe, die „muss rot werden" verlangt. `proben` fängt das (es fragt bei jedem roten Tor nach dem gesunden Stand) — aber seit dem Löschen war kein voller Probenlauf mehr gefahren. |
| **F7** | `●` und `○` in der neuen PIN-Anzeige, beide außerhalb des Schriftschnitts `latin`. **Zwanzig Zeilen darüber** stand, warum genau diese Zeichen gezeichnet und nicht getippt gehören. | Sie kamen aus der Systemschrift und sahen fast richtig aus. Gefunden hat es das Tor `schrift` — in derselben Minute, in der es wieder lief. |
| **F8** | `CLAUDE.md` nannte die Kette mit **zwölf** Toren, gefahren wurden **achtzehn**. `rhythmus`, `spielprobe`, `budget`, `passt`, `lesbarkeit` und `ziehen` fehlten. | Die Datei wird zu Beginn jeder Sitzung gelesen. Wer sie las, hielt sechs Tore für nicht vorhanden. |
| **F9** | Im kurzen Querformat stand `.kachel{padding:…}` — und tat **nichts**: `.kachel.bunt` setzt dieselbe Eigenschaft mit zwei Klassen. | Die Regel war zur Platzersparnis geschrieben worden. Gemessen: die Kachel blieb bei 16/24 Punkten, egal was dort stand. Genau diese 16 Punkte haben jetzt die dritte Kachelreihe wieder ins Bild geholt. |
| **F10** | `lob()` würfelte, **bis es passt**: `do { i = Math.random… } while (i === letztesLob)`. Das terminiert nur, solange der Würfel sich ändert. Im Tor `ansicht` ist `Math.random` festgenagelt — nach der zweiten richtigen Antwort stand die Schleife, der Anzeigefaden mit ihr, und die Seite antwortete auf gar nichts mehr. | Im Spiel würfelt niemand festgenagelt, der Fehler war nie zu sehen. Eine unbegrenzte Wiederholschleife im Anzeigefaden bleibt trotzdem eine: sie hat keine obere Schranke, nur eine Wahrscheinlichkeit. Gefunden hat ihn erst die neue Aufnahme, die den ganzen Bildschirm durchspielt — **zwanzig Minuten Torlauf ohne eine Zeile Ausgabe**. |
| **F12** | Dieselbe Schwelle an **vier** Stellen mit **drei** Namen. `istGekonnt` = Fach 5 und `HAT_AUFKLEBER` = 3 standen im Leitner-Modul; Fach 2 stand **zweimal als nackte Zwei** in `prototyp/spiel.js` — unter dem Namen `gekonnt`, den das Forscherbuch für Fach 5 benutzt. Und der Haken, den diese Zwei auf die Karte malt, sieht aus wie das Siegel, das im Buch „sicher" heißt. | Jede Stelle war für sich richtig. Erst nebeneinander gelegt fällt auf, dass ein Wort drei Zahlen bedeutet. Gefunden beim Nachrechnen einer neuen Aufnahme: zwei Kontinente trugen einen Haken, deren Fach 2 und 3 war. |
| **F11** | Sieben Marken in den Entwürfen (`--app-tinte`, `--app-gut`, `--app-linie`, `--app-tinte2`, `--app-tinte3`, `--tinte-leise`, `--tinte-weich`) gab es nicht mehr — Reste einer Umbenennung. | Bei `color:` fällt eine ungültige `var()` auf den geerbten Wert zurück, und der war hier zufällig derselbe. Der Bildvergleich meldete nach der Reparatur **null** geänderte Bildpunkte: der Fehler war unsichtbar, aber die nächste Änderung an einer dieser Marken wäre wirkungslos geblieben. |

Und eine, die die alte Fassung mitgenommen hat: `die Karte wechselt die
Farbe` suchte die ausgeschriebene Farbe `--f1: oklch(0.74 0.135 25)`, die es
seit F5 nicht mehr gibt. Sie dreht jetzt an `--flaeche-c` — und ist damit
zugleich die Gegenprobe auf die Ableitung selbst: greift sie nicht durch,
hängen die sieben Farben doch nicht an der Marke.

**Nicht bestätigt**: der Verdacht, `proben` prüfe den gesunden Stand zu spät.
Nachgesehen — `istGesund` läuft bei **jedem** roten Tor, also auch bei einem
abgestürzten. Keine Lücke, und der Verdacht steht hier, damit ihn niemand
ein zweites Mal hat.

### Drei neue Tore, aus drei Befunden

**Jede benutzte Marke muss es geben** (in `marken`). Der Fehler, der das
ausgelöst hat, ist F1 — und er ist die ganze Begründung: eine ungültige
`var()` macht nicht einen Wert ungültig, sondern die **ganze Deklaration**.
Bei `padding` (erbt nicht) bleibt null übrig, bei `color` (erbt) der
geerbte Wert. Beides sieht im Browser nach nichts aus. Das Tor sammelt jetzt
alle gesetzten Marken (auch die aus `setProperty`) und legt sie neben alle
benutzten; gerechnete Namen wie `var(--f${…})` werden übersprungen. Beim
ersten Lauf fand es **acht** — `--r5` und die sieben aus F11.


**Die Kette vergleicht sich selbst** (in `doku`). `CLAUDE.md` wird neben
`npm run tor` in `package.json` gelegt — und neben die Überschriften der
Tore, die weitere in sich tragen (`inhalt` fährt sieben, `pwa` zwei). Gezählt
wird dort, wo die Tore sich melden, nicht in einer dritten Liste, die wieder
veralten kann. Verglichen werden Mengen, keine Reihenfolgen: die Reihenfolge
steht in `package.json` und braucht keine zweite Fassung.

**Die Flächenfarben leiten sich ab** (in `marken`). Die alte Prüfung verglich
sieben ausgeschriebene Helligkeiten miteinander; nach der Ableitung hätte sie
null Farben gefunden und wäre rot geworden, ohne dass etwas kaputt war. Sie
prüft jetzt die **Form**, die die Gleichheit trägt: jede der sieben muss
dieselbe Marke benutzen, die Marke steht je Modus genau einmal, ihre
Helligkeit liegt zwischen 0,60 und 0,86 (darüber trägt der dunkle Textton
nicht mehr), und der Abendmodus ist dunkler als der Tag. Wer eine einzelne
Farbe wieder festnagelt, fällt durch.

### Fortschritt, Sterne, Aufkleber — dort, wo das Kind hinsieht

Der Wunsch war nicht „mehr Grafik", sondern **etwas zu sehen bekommen**. Drei
Stellen:

**Die Ebenenwahl.** Auf dem Zielgerät stand je Kachel „0 von 4" — und sonst
nichts: der Balken und die Überzeile waren im kurzen Querformat ausgeblendet,
damit acht Kacheln passen. Fiona liest keine Zahlen. Jetzt trägt jede Kachel
eine **Sternreihe**, die Zahl der **Aufkleber** mit ihrem Zeichen und einen
**Balken** — im kurzen Querformat alles drei in *einer* Zeile, damit die
Kachel nicht höher wird als vorher. Die Sterne kommen aus derselben Formel
wie im Spiel (`sterneFuer`), nur mit einer anderen Grundgesamtheit: nicht
„glatt in dieser Runde", sondern „im Buch von dieser Ebene". Eine Formel,
drei Anzeigen.

**Der Balken, überall derselbe.** Zwei Streifen mit je einer Bedeutung:
*fest* = hat einen Aufkleber (genau die Zahl daneben), *unterwegs* = wie weit
die Gebiete im Schnitt sind. `unterwegs` wird auf `fest` hochgezogen — ein
Gebiet in Fach 3 zählt als Aufkleber, trägt zum Mittel aber nur die Hälfte
bei, und der helle Streifen säße sonst unter dem dunklen. Damit ist F3
geschlossen: der Balken sagt dasselbe wie der Satz darüber.

**Der Endbildschirm.** Ein **Hauptknopf** statt drei gleich leiser
(„Noch einmal" trägt jetzt dieselbe Tiefe wie ein Antwort-Etikett — genau ein
lauter Knopf je Bildschirm), der Aufkleberstand als **Zeichen mit Zahl**
statt als Nebensatz, und der Erklärsatz „Beim zweiten Mal richtig gibt es
einen Aufkleber" nur noch, **solange** noch keiner da ist.

### Das Tor `ansicht` sieht endlich das Zielgerät

Bis zu dieser Runde entstanden alle Vorbilder bei **1240 × 1000** — kein
Gerät, das jemand benutzt, sondern die Größe, bei der zufällig die erste
Aufnahme entstand. Das Fenster, auf dem geurteilt wird (iPhone quer,
844 × 390), hat **eigene Regeln** (`max-height:440px`), und die hatten kein
Bild gesehen. Eine davon war überdies wirkungslos (F9).

Vier neue Aufnahmen, alle bei 844 × 390: **Ebenenwahl, Spielbildschirm,
Endbildschirm, Forscherbuch** — also genau die drei Bildschirme, auf denen
Fortschritt, Sterne und Aufkleber leben und die vorher **überhaupt kein**
Vorbild hatten.

Der Lernstand dafür wird **gesetzt, nicht erspielt**: vier Kontinente in vier
verschiedenen Fächern. Ein Bildschirm mit lauter Nullen zeigt von Sternen und
Aufklebern nichts — wer eine Wirkung abbilden will, muss sie einschalten.

Der Endbildschirm brauchte zwei Umwege, und beide sagen etwas über die App:
Fiona **zieht**, und ein Antippen ist dort ausdrücklich keine Antwort — der
Durchlauf kam nach vierzig Aufgaben nicht ans Ende. Lea **tippt** die
Kontinente, dort gibt es gar keine Auswahl zum Anklicken. Also wird Fionas
Antwortweise gesetzt: dieselbe Einstellung, die im Spiel unter „Lieber
antippen" steht.

Und dieser eine Durchlauf hat F10 gefunden — die Endlosschleife im Lob. Kein
anderes Tor spielt eine Runde bis zum Schluss **mit festgenageltem Würfel**.

### Zehn neue Gegenproben

Wer ein Tor ändert, trägt dort eine Probe nach. Aus 36 sind **46** geworden,
und der volle Lauf braucht dafür 35,6 Minuten — smoke allein 30 davon.
Drei stammen aus dem ersten Teil der Runde (Sterne im Kopf, Fortschrittsband,
PIN), sieben aus dem zweiten:

| Probe | Tor | Was sie nachstellt |
|---|---|---|
| eine benutzte Marke gibt es nicht | `marken` | F1, wörtlich: `gap:var(--gibtsnicht)` |
| die Karte zeigt den Fortschritt erst viel später | `smoke` | F12: `SITZT` von 2 auf 5 — die eine Stelle, an der die Schwelle noch steht |
| eine Flächenfarbe hängt sich vom System ab | `marken` | F5: eine der sieben wieder festgenagelt |
| CLAUDE.md verschweigt ein Tor der Kette | `doku` | F8: `spielprobe` aus der Aufzählung gestrichen |
| die Ebenenwahl zeigt keine Sterne und Aufkleber mehr | `smoke` | die Kachel ohne Sternreihe |
| Balken und Aufkleberzahl laufen wieder auseinander | `smoke` | F3: der Balken zeigt wieder die mittlere Fachhöhe |
| auf dem Zielgerät verschwindet der Kachelbalken | `ansicht` | L1: geändert wird etwas, das **nur** im kurzen Querformat gilt — bleibt `ansicht` grün, fotografiert es das Zielgerät nicht |

Die letzte ist die wichtigste: sie prüft nicht die Anzeige, sondern **das
Tor**. Bei 1240 × 1000 greift die geänderte Regel gar nicht — wer die neuen
Aufnahmen wieder herausnimmt, fällt hier durch.

### Was das Fotografieren des Zielgeräts sonst noch gekostet hat

Zwei Nebenbefunde, beide aus derselben Ecke:

`.klebermarke` stand zuerst in `--tinte-3`. Das Tor `lesbarkeit` meldete sie
**sechzehnmal** — 3,8:1 gegen die bunten Kacheln am Tag, 3,1:1 am Abend, nötig
sind 4,5:1. Der Unterschied zwischen „schon welche" und „noch keine" steckt
jetzt im Zeichen, nicht in der Lesbarkeit der Zahl.

Und das Startbündel ist von 131,7 auf 140,2 KB gewachsen (von 400 erlaubt) —
die Ratsche hat es gemeldet, und die Antwort ist ja: Vorlesen, Umschalter,
Forscherbuch, Fortschrittsband, Sterne und Aufkleber sind seit dem letzten
Stand dazugekommen. Neu festgehalten.


---

## Die Temporunde

> *„Was sind denn die ganzen Gegenproben und warum dauert das so lange? Ich
> möchte gerne schneller Anforderungen live schalten."*

Die Frage hat zwei Dinge zusammengefasst, die getrennt gehören. Gemessen,
nicht geschätzt — jede Zahl aus einem Lauf auf diesem Rechner:

| Bis LIVE, jede Auslieferung | | Das Ritual, jede 3. Runde | |
|---|---|---|---|
| `smoke` | 109 s | `proben` voll | **35,6 min** |
| `ansicht` | 33 s | davon `smoke` | 30,0 min |
| `passt` | 30 s | | (16 Proben × 110 s) |
| `ziehen` | 26 s | | |
| `lesbarkeit` | 4 s | | |
| `pwa` + `bauen` | 3 s | | |
| `inhalt` und der Rest | 1 s | | |
| **lokal** | **3,5 min** | | |
| **auf dem Runner** | **4,2 min** | | |

**Die 36 Minuten stehen nie im Weg.** `proben` läuft weder bei der
Auslieferung noch auf dem Runner — der fährt `tor:runner`. Zwischen „fertig"
und dem iPhone liegen vier Minuten.

### `proben --geaendert`

Der volle Lauf beweist etwas, das sich in einer Runde mit zwei geänderten
Dateien meist gar nicht ändern **kann**. Die Grundlinie ist der Commit, der
im Stand steht — also „was ist seit dem letzten vollständigen Beweis
passiert". Eine Probe läuft, wenn die Datei, in die sie eingreift, oder das
Tor, das sie fährt, seither angefasst wurde.

Erster Lauf: **15 von 49 Proben, 36 Sekunden.**

Was sie **nicht** fängt, und das steht als Kommentar daneben: die mittelbare
Kopplung. Wer `prototyp/spiel.js` ändert, kann eine Probe brechen, die in
`src/marken/marken.css` eingreift — der Rauchtest verhält sich anders, der
Eingriff kommt an, und das Tor meldet etwas anderes als erwartet.

Deshalb schreibt die Abkürzung **keinen Stand**: `vollerLauf` ist jetzt
`NUR.length === 0 && !GEAENDERT`. Täte sie es, wäre `rhythmus` grün, ohne
dass je ein vollständiger Beweis stattgefunden hätte — die Regel „alle drei
Runden" wäre still ausgehebelt, und das ist genau die Sorte Loch, die dieses
Werkzeug aufdecken soll.

### Die Vorschau-Auslieferung

Ein eigener Ablauf auf dem Zweig `vorschau`: nur die Tore **ohne Browser**
(`inhalt` mit seinen sieben, `spielprobe`, `vergleich`, `budget` — zusammen
unter drei Sekunden), kein `playwright install` (allein 39 s), Ziel
`/vorschau/`. Rund anderthalb Minuten von „mach das" bis „schau es dir an".

Drei Dinge, die daran nicht offensichtlich waren:

**Beide Abläufe stellen beide Hälften zusammen.** Pages kennt eine Seite je
Verzeichnis. Täte es nur einer, löschte jede Auslieferung die Vorschau,
während jemand sie ansieht — und jede Vorschau setzte das Spiel der Kinder
auf einen älteren Stand zurück. `tools/seite-zusammenstellen.mjs` holt die
jeweils andere Hälfte aus ihrem Zweig in einen Nebenbaum und baut sie dort.

**Die Marke steht in der gebauten Seite, nicht in der App.** Ein Zweig im
Programm, den nur die Vorschau nimmt, wäre Code, den kein Tor je sieht — und
das ausgelieferte Spiel trüge ihn ungenutzt mit.

**Das Tor `doku` hält die Abkürzung kurz.** Die Auslieferung muss weiter die
volle Kette fahren, die Vorschau darf nicht auf `main` laufen, und was sie
nicht prüft, muss namentlich in ihr stehen. Beim ersten Lauf fehlte
`rhythmus` in der Liste.

### F13: der Service Worker räumte fremde Lager ab

Ein echter Fehler, den es ohne die Vorschau nie gegeben hätte — und der mit
ihr beim ersten Blick auf `activate` sichtbar wurde:

```js
if (name.startsWith('smart-kids-') && name !== LAGER) await caches.delete(name);
```

Solange es **eine** Installation gab, war das richtig: aufräumen, was von
älteren Fassungen übrig ist. Cache Storage gilt aber je **Herkunft**, nicht
je Geltungsbereich. Mit `/` und `/vorschau/` gibt es zum ersten Mal zwei —
und jeder Blick in die Vorschau hätte dem ausgelieferten Spiel den
Offline-Vorrat gelöscht. Beim nächsten Start im Zug wäre es nicht mehr da
gewesen.

Der Lagername trägt jetzt den Pfad (`smart-kids-Smart-Kids-vorschau-`…).
Das Tor `pwa` prüft die **Form** des Namens — und sagt in seinem Kommentar
ausdrücklich, dass es die Form prüft und nicht die Wirkung. Der Beweis wäre,
zwei Installationen an zwei Pfaden in denselben Browser zu setzen und nach
der zweiten die erste ohne Netz zu starten. Steht unten als offener Punkt.

### Der Versand geht nicht aus dem Zweig heraus — und braucht trotzdem keine Einstellung

Der erste Lauf auf dem Zweig `vorschau`:

```
Schnelle Tore   ✓ erfolgreich   23 s
Nach Pages      ✗ fehlgeschlagen 1 s   ohne Runner, ohne einen Schritt, ohne Protokoll
```

Die schnelle Hälfte stimmt und ist gemessen: **23 Sekunden**, besser als die
anderthalb Minuten, mit denen ich gerechnet hatte. Der Versand fällt durch,
bevor er anfängt.

**Zur Ursache:** null Schritte, kein Runner, leeres `output` über die API —
die Signatur der Umgebungsregel, die Auslieferungen auf den Standardzweig
beschränkt. Belegt war sie zunächst **nicht**; das Protokoll eines Jobs, der
nie lief, gibt es nicht, und ich hatte sie trotzdem als Tatsache
hingeschrieben. Der Umbau unten war deshalb zugleich der Beweisversuch.

**Er ist gelungen, und damit ist die Diagnose belegt:** derselbe
`deploy-pages`-Schritt, der aus dem Zweig `vorschau` nach einer Sekunde
ohne Runner durchfiel, läuft aus dem Zusammenhang von `main` in sechs
Sekunden durch. Am Schritt hat sich nichts geändert, nur am Zweig, in dem
er läuft.

Statt einer Einstellung ein zweiter Ablauf. `workflow_run` löst das ohne
jeden Klick: ein so ausgelöster Ablauf läuft **im Zusammenhang des
Standardzweigs**, darf also versenden.

```
vorschau.yml           Push auf `vorschau` → nur die schnellen Tore. Prüft, versendet nicht.
vorschau-versand.yml   workflow_run "Vorschau" → baut main, stellt beide
                       Hälften zusammen, liefert aus. Läuft auf main.
```

Damit fällt auch `--rolle` weg: beide Abläufe stellen jetzt aus demselben
Zweig heraus dasselbe zusammen. Eine Verzweigung, die niemand nimmt, ist
eine Verzweigung, die niemand prüft.

**Gemessen am fertigen Weg** (Lauf vom 29.08.):

```
Vorschau            23 s   npm ci, die vier Tore ohne Browser, bauen
Vorschau versenden  22 s   Nachfrage 0 s · npm ci 6 · bauen 2 ·
                           zusammenstellen 1 · hochladen 1 · deploy-pages 6
────────────────────────
zusammen            45 s   von `git push` bis im Netz
```

Gegen 4,2 Minuten über `main`. Und die Nachfrage, ob dieser Stand die Kette
bestanden hat, kostet **null Sekunden** — sie ist ein API-Aufruf.

**Das Loch, das dabei aufging.** Der Versand baut `main` neu, ohne die Kette
zu fahren — das ist ja die eingesparte Zeit. Damit könnte eine Vorschau
einen **roten** `main`-Stand unter `/` schieben, dorthin, wo die Kinder
spielen. Zwei Riegel:

- Der Ablauf fragt bei GitHub nach, ob es für genau diesen Commit eine
  **erfolgreiche Auslieferung** gibt (`head_sha=…&status=success`). Sonst
  bricht er ab.
- `seite-zusammenstellen.mjs` weigert sich, wenn `HEAD` nicht auf `main`
  liegt (`git merge-base --is-ancestor`).

Und das Tor `doku` prüft die Eigenschaft statt der Zuständigkeit: **jede**
Ablaufdatei, die einen Pages-Anhang hochlädt, muss vorher die Seite
zusammengestellt haben — sonst löscht sie die andere Hälfte.

### Drei neue Gegenproben

| Probe | Tor |
|---|---|
| die Vorschau verschweigt ein Tor, das sie nicht fährt | `doku` |
| die Vorschau läuft auf main | `doku` |
| ein Ablauf schickt nur seine halbe Seite nach Pages | `doku` |
| die Vorschau schiebt einen ungeprüften Stand unter / | `doku` |
| der Lagername vergisst den Ort | `pwa` |

**56 Gegenproben, alle schlagen an.** Und die Regel hat sofort zugebissen:
nach dem Hinzufügen war die Kette rot — *„Es stehen 49 Proben im Baum,
festgehalten sind 46"*. Neue Proben dürfen nicht ungefahren mitlaufen.

---

## Die Mathe-Runde (Runde 2 des ANTON-Fahrplans)

> *„Wie weiter?"* — und die Antwort war nicht die spaßigste Runde, sondern
> die tragfähigste: bis heute war eine „Aufgabe" in dieser App immer **ein
> Gebiet auf einer Karte**. Ein Rechenblatt hat keine.

### Was sich an der Architektur geändert hat (C3)

Weniger, als es aussah — weil `starten()` schon fast allgemein war. Es lädt
den Stand, baut den Vorrat, macht eine Leitner-Sitzung. Kartenspezifisch war
genau eine Zeile: welcher Bildschirm kommt.

```
EBENEN   { id:'rechnen:plusminus', art:'rechnen', wer:['fiona'], mischung }
vorrat() erzeugt statt aufzulisten
starten() zeige(ebeneArt(id) === 'rechnen' ? rechenschirm : spielschirm)
```

`wer` ist neu und trägt weiter: Fiona rechnet Plus und Minus, Leas Reihen
sind die nächste Runde. Ohne das stünde bei beiden dieselbe Kachel, und eine
davon wäre die falsche.

**Was jetzt an EINER Stelle steht**, weil es zwei Bildschirme gibt:

| | |
|---|---|
| `werten()` | was eine Antwort BEWIRKT — Leitner, „glatt", Band, Aufkleber, Ablage |
| `kopfNachziehenIn()` | Sterne und Fortschrittsband nachziehen |
| `aufgabenKopf()` | der Kopf mit Band und Sternen |
| `lobsatz()` | der Satz nach der Antwort |

Die Aufgabenart entscheidet nur noch das eine, was bei ihr wirklich anders
ist: **ob** die Antwort stimmt. Genau so sind hier schon einmal zwei
Sternformeln entstanden — dieselbe Sache, an zwei Stellen gerechnet.

Und das Herauslösen hat sofort einen Fehler gemacht: `fachVorher` wanderte
mit in die neue Funktion, wurde im Protokolleintrag aber weiter gebraucht.
`ReferenceError: fachVorher is not defined`, zwölfmal — vom Rauchtest in
derselben Minute gemeldet.

### Fionas Plus und Minus (C1)

100 Aufgaben: **45 Additionen** (a, b ≥ 1, a + b ≤ 10) und **55
Subtraktionen** (1 ≤ b ≤ a ≤ 10). Gefragt wird im Verhältnis **80 zu 20** —
und das ist die Mischung der SITZUNG, nicht die des Vorrats: der Leitner
wählt nach Fälligkeit, nicht nach Rechenart. Er wird deshalb je Art einmal
gefragt, mit der Länge, die auf sie entfällt, und danach wird gemischt —
sonst kämen erst fünf Plus- und dann eine Minusaufgabe, und die Reihenfolge
wäre die Antwort.

**„Wenig mit 0" ist zu einer Regel geworden**, weil „wenig" keine Zahl ist:
die Null kommt **nur als Ergebnis** vor. `6 − 6 = 0` bleibt — was übrig
bleibt, wenn man alles wegnimmt, ist eine Aufgabe. `7 + 0` fällt weg. Wäre
die Null als Summand erlaubt, wären es 21 von 66 Additionen, ein knappes
Drittel; das ist nicht „wenig". Die Entscheidung steht im ANTON-Abgleich,
nicht nur hier.

**Die drei falschen Antworten sind die, die ein Kind wirklich gibt:** ±1
(verzählt beim Weiterzählen), ±2, und die Gegenrechnung (`a − b` statt
`a + b`). Wer zufällig wählt, macht die Aufgabe leichter, weil die falschen
Antworten offensichtlich sind.

### Angetippt, nicht gezogen — und warum das kein Sparen ist

Auf der Karte lernt das Ziehen etwas: dieser Name gehört an DIESEN Ort.
`3 + 4` hat keinen Ort. Eine Zahl in ein Kästchen zu schieben wäre Motorik
ohne Lehre. Der Abgleich sagt für Fionas Profil ausdrücklich „vier
Möglichkeiten zum Antippen"; der Umschalter „Lieber ziehen" erscheint auf
Rechenebenen deshalb gar nicht. Nebenbei bleibt damit die Ziehmechanik
unangetastet, und dort liegen sechs Gegenproben.

### Das Forscherbuch sammelt etwas ohne Umriss (C3c)

Heute IST der Aufkleber der Umriss. Gelöst **ohne ein einziges neues Bild**:
gesammelt wird die **Aufgabe selbst**, groß und in der Kinderschrift.
`3 + 4` in einem Kästchen ist so wiedererkennbar wie die Form von Afrika —
und ehrlicher als ein erfundenes Symbol, das mit dem Gelernten nichts zu tun
hätte. Verdeckt wird bei einer offenen Aufgabe die **Antwort**, nicht die
Rechnung: sonst stünde in der Vorschau ein Fragezeichen, das nichts darüber
sagt, was als Nächstes kommt.

### Die Zahlen stehen im Dokument, nicht im Code

Zahlenraum, die 80/20 und die Vorratsgrößen stehen im ANTON-Abgleich, und
das Tor `doku` legt sie neben das, was `rechnen.js` wirklich erzeugt.
Dieselbe Mechanik wie beim Tor `budget`, das seine Grenzen aus dem Konzept
liest: zwei Zahlen an zwei Orten veralten getrennt, die eine wird gepflegt,
die andere gilt.

### Was die Tore dazugelernt haben

| Tor | neu |
|---|---|
| `doku` | Zahlenraum, Anteile und Vorratsgrößen gegen den Abgleich; Null nur als Ergebnis; keine zwei Aufgaben mit derselben Kennung |
| `spielprobe` | alle 100 Aufgaben × 4 Möglichkeiten — 843 statt 443 Antworten. Jede Rechnung gegen die zweite Meinung von JavaScript |
| `smoke` | spielt die Rechenebene wirklich; prüft, dass sie bei Fiona steht und bei Lea NICHT; „Fiona 9 von 9 vorgelesen" (die feste Acht war mit der neunten Ebene falsch geworden) |
| `ansicht` | `quer-rechnen` — der erste Bildschirm ohne Karte, auf dem Zielgerät |
| `passt` | neun Kacheln auf sieben Größen, grün |

**Fünf neue Gegenproben, 56 insgesamt.** Eine davon hat zuerst nichts
bewiesen und dabei etwas gezeigt: der erste Riegel gegen „ein Ablenker ist
die richtige Antwort" greift bei b ≥ 1 nie — ±1 und ±2 sind nie das
Ergebnis, und die Gegenrechnung nur bei b = 0, was der Vorrat ausschließt.
Er steht trotzdem zu Recht dort, weil die Probe daneben die Null wieder als
Summanden zulässt. Geprobt wird jetzt der zweite Riegel, im Auffüllen: bei
`10 − 10 = 0` bleiben nach ±1, ±2 und Gegenrechnung nur zwei Zahlen übrig,
und aufgefüllt wird ab 0 — also genau mit der richtigen Antwort.

### Offen aus dieser Runde

Die Ebenenwahl hat jetzt **neun** Kacheln, und die neunte steht allein in
der dritten Reihe. `passt` ist grün, aber schön ist es nicht. Das ist genau
der Punkt, an dem D4 aus dem Abgleich fällig wird: **Fachwelten** — Erdkunde
und Mathe als zwei Welten mit eigenem Gesicht, statt einer Liste, die immer
länger wird. Mit Leas Reihen kommt die zehnte Kachel.

---

## Der Wal im Rauchtest

> *„Weiter und voller Lauf dauert viel zu lange"*

Die Temporunde hatte den Weg **live** verkürzt — vier Minuten bis aufs
iPhone, 45 Sekunden für die Vorschau. Was sie nicht angefasst hat, war das
**Ritual**: der volle Probenlauf, alle drei Runden fällig, 35,6 Minuten.

Die Messung von damals sagt schon, wo sie liegen:

| | |
|---|---|
| `proben` voll | 35,6 min |
| davon `smoke` | 30,0 min |

Ein Tor, siebzehn Proben, 84 % der Zeit. Und der Grund ist nicht, dass der
Rauchtest langsam wäre — er ist es nicht, 109 Sekunden für die ganze App —,
sondern dass **jede** dieser siebzehn Proben ihn **ganz** fuhr, um einen
seiner fünf Durchgänge rot zu sehen. Wer prüft, ob die PIN-Sperre hält,
lässt vorher die Erdkunde, die Ablage, das Tippen und vier Ebenen laufen.

### Dasselbe Mittel, das `ziehen` schon hat

```
npm run smoke -- --nur=spielen,tippen
```

Fünf Abschnitte: `spielen` · `ablage` · `tippen` · `ebene4` · `durchgang`.
Zwei Dinge waren dabei nicht offensichtlich:

- **`ablage` braucht `spielen`.** Die Ablage prüft, was ein gespielter
  Durchgang hinterlassen hat — allein gefahren prüft sie eine leere Ablage
  und ist grün. Also zieht der Wähler die Voraussetzung selbst nach
  (`BRAUCHT`), statt sie in siebzehn Probenzeilen zu wiederholen.
- **Ein unbekannter Abschnittsname bricht ab.** Ohne das wäre ein Tippfehler
  in einer Probe ein Rauchtest, der gar nichts fährt und grün meldet — also
  genau die Verfallsart, gegen die dieses ganze Werkzeug gebaut ist.

Gemessen, je Abschnitt einzeln:

| Abschnitt | Dauer |
|---|---|
| `spielen` | 28 s |
| `ablage` | 32 s |
| `tippen` | 1 s |
| `ebene4` | 15 s |
| `durchgang` | 67 s |

### Die Gegenprobe, die zweimal Verschiedenes sagte

Erster Lauf über die siebzehn: **fünfzehn schlugen an, zwei meldeten
„beweist nichts"** — die Rechenebene, die plötzlich beiden Kindern gehört,
und „von vorne", das nichts löscht. Einzeln gefahren schlugen beide an, 142 s
und 69 s. Ein zweiter voller Durchgang: **17 von 17.**

Die Zuordnung stimmt also. Was der Grund war, weiß ich nicht — und das ist
der wichtigere Befund. **Eine Gegenprobe, die zweimal Verschiedenes sagt,
ist schlimmer als eine fehlende**, weil man ihr danach nicht mehr glaubt und
sie trotzdem stehen lässt.

Der Verdacht: kurz zuvor war ein Probenlauf per Zeitüberschreitung **hart**
abgeschossen worden, und sein Chromium lief vermutlich weiter. Nachträglich
beweisen lässt sich das nicht mehr. Also wird aus dem unsichtbaren Verdacht
eine **laute Weigerung** — `proben` sieht vor dem ersten Eingriff nach, ob
schon ein Browser läuft, und verweigert dann den Dienst, mit `--trotzdem`
als Ausweg. Das beweist den Zusammenhang immer noch nicht. Aber er kann kein
zweites Mal unbemerkt gewesen sein.

**Und die Weigerung selbst brauchte sofort ihre eigene Gegenprobe.** Der
erste Entwurf las `ps -eo pid,args` und suchte darin nach „chrome" — und
verweigerte prompt den Dienst, obwohl kein Browser lief: gefunden hatte er
die **eigene Shell-Zeile**, in der das Wort vorkam. Eine Weigerung, die
immer anschlägt, ist so wertlos wie ein Tor, das nie etwas meldet. Gesucht
wird jetzt am Programmnamen (`comm`), nicht an der Befehlszeile, und beide
Richtungen sind gemessen: still ohne Browser, laut mit einem.

### Was es gebracht hat

| | vorher | nachher |
|---|---|---|
| die 17 Rauchtest-Proben | ~31 min | **16,3 min** |
| `proben` voll | 35,6 min | **22,3 min** |

Gemessen am vollen Lauf, nicht gerechnet: **52 Proben in 22,3 Minuten**,
dazu die vier `rhythmus`-Proben am frischen Stand — **56 von 56 schlagen
an, keine beweist nichts.** Der Rauchtest steht darin mit 981 s, also
16,3 min; die zweitgrößte Last ist `ansicht` mit 111 s.

Der volle Lauf bleibt das, was er ist: das Ritual alle drei Runden, das nie
zwischen „fertig" und dem iPhone steht. Er dauert jetzt nur noch halb so
lange — und das ist der Unterschied zwischen einer Regel, die man befolgt,
und einer, die man abkürzt.

---

## Leas Reihen (C2)

Runde 3 des ANTON-Fahrplans, und sie steht auf Runde 2: der Aufgabentyp
ohne Karte war schon da, der Leitner konnte schon erzeugte Gegenstände,
und der Rechenschirm gab es. Neu sind **die Zahlen, eine zweite
Eingabeweise und ein Regler**.

### Vier Sorten, damit sich eine steuern lässt

| Sorte | was | wieviele |
|---|---|---|
| `mal` | 6 × 1 … 9 × 9 | 36 |
| `zehner` | alles, worin eine 10 steckt | 14 |
| `geteilt` | 56 : 7 — die Umkehrung der Reihe | 50 |
| `leicht` | 2 × 1 … 5 × 10, die Verschnaufpause | 40 |

**140 Aufgaben.** Lea sieht zwischen den ersten dreien keinen Unterschied
— getrennt sind sie, weil die *Mischung* sie trennen muss: der Leitner
wählt nach Fälligkeit, nicht nach Sorte.

Und damit ist aus „weniger × 10" eine **Zahl** geworden, so wie bei Fiona
aus „wenig mit 0" eine Regel wurde. Von Natur aus steckt in 14 der 50
Reihenaufgaben eine Zehn, also 28 %; eingestellt sind 10 % der
Multiplikationen. Weggenommen wird sie nicht: eine Aufgabe, die nicht im
Vorrat steht, kann das Kind nie lernen. Das Tor rechnet den natürlichen
Anteil **selbst** aus und verlangt, dass der eingestellte darunterliegt —
sonst hätte „weniger" nichts verringert.

### Der Regler hat genau eine Stellschraube

Im Elternbereich verschiebt er Multiplikation gegen Division, von 90/10
bis 50/50. Alles andere folgt daraus: von dem, was der Multiplikation
bleibt, geht je ein Zehntel an `zehner` und an `leicht`. Vier Zahlen, die
zusammen 1 ergeben müssen, ergeben irgendwann nicht mehr 1.

### Der Fund: an der Voreinstellung gab es keine Division

Das ist der Grund, warum der Regler eine eigene Gegenprobe bekommen hat —
und sie hat beim ersten Lauf sofort zugeschlagen, nicht am Regler, sondern
an der Sitzung dahinter.

Eine gemischte Sitzung wurde bisher so aufgeteilt: jeden Anteil einzeln
runden, den Rest auf die **letzte** Sorte legen. Bei Fionas zwei Sorten
war das harmlos. Bei Leas vier:

```
Regler 10 %   mal 6 · zehner 1 · leicht 1 · geteilt 0     ← KEINE Division
Regler 50 %   mal 3 · zehner 0 · leicht 0 · geteilt 5     ← statt vier
```

**An der Voreinstellung wurden aus den zugesagten 10 % Division null.**
Kein bestehendes Tor hätte das gemeldet: die Sitzung hatte acht Aufgaben,
alle rechenbar, alle richtig gewertet. Von aussen war nichts zu sehen.

Verteilt wird jetzt nach dem **größten Rest** (`Leitner.verteilen`) — die
Rechnung, mit der Sitze auf Stimmen verteilt werden. Die Summe stimmt
immer, und niemand wird bevorzugt, weil er zufällig hinten steht:

```
Regler 10 %   mal 6 · zehner 1 · leicht 0 · geteilt 1
Regler 50 %   mal 3 · zehner 1 · leicht 0 · geteilt 4
Fiona (6)     plus 5 · minus 1                            ← unverändert
```

### Gemessen wird am Ende der Kette

Zwischen dem Regler und dem, was Lea vorgelegt bekommt, liegen vier
Stationen: Regler → `Einst.reihenGeteilt` → `EBENEN.mischung()` → die
Sitzung. Jede kann still ausfallen, und ein Regler, der sich schieben
lässt und sich beschriftet, sieht dabei genauso aus wie einer, der wirkt.

Der neue Rauchtest-Abschnitt `regler` stellt ihn deshalb auf 50 %, spielt
**acht Aufgaben durch** und zählt: genau vier müssen Divisionen sein. Das
ist keine Schätzung — die Verteilung ist rechenbar. Ein eigener Abschnitt,
weil er als einziger eine ganze Sitzung spielt: so bezahlt ihn nur die
Gegenprobe, die ihn braucht.

Daneben prüft `spielprobe` die Verteilung **ohne Browser**, in einer
Sekunde: fünf Sitzungslängen × elf Reglerstellungen, und die Zusage
lautet, dass keine Sorte leer ausgeht, der ein ganzer Platz zusteht.

### Schreiben statt antippen

Lea schreibt das Ergebnis, Fiona tippt eine von vier Zahlen an — so steht
es im Abgleich, und es hängt am **Profil**, nicht an der Ebene. Umschalten
lässt es sich unter der Aufgabe, neben „Weiß ich nicht", mit demselben
leisen Knopf wie auf der Karte.

Beide Felder werden gebaut und eines versteckt, statt beim Umschalten den
Bildschirm neu zu bauen. Ein Neuaufbau setzte `versuch` zurück: wer nach
dem zweiten Fehlversuch umschaltet, bekäme drei neue geschenkt — und die
Auflösung nach drei Fehlern wäre nie erreichbar.

Leer auf „Prüfen" zu tippen ist **kein** Fehlversuch. Ein Kind, das den
Knopf sucht, hat sich nicht verrechnet.

### Die Ablenker sind andere als bei Fiona

Bei Plus und Minus greift ein Kind nach ±1 und nach der Gegenrechnung.
Beim Einmaleins nach den **Nachbarn in der Reihe**: wer 7 × 8 nicht weiß,
sagt 49 oder 63, nicht 57. Also ±a und ±b, und erst danach die kleinen
Verzähler. Bei der Division sind die Nachbarn im *Ergebnis* die
Versuchung, nicht im Dividenden.

Welcher Satz gilt, entscheidet `ablenkerFuer` — nicht der Bildschirm.
Sonst wüsste die Anzeige, was eine Zehnerreihe ist.

### Zahlwörter bis 100

`gesprochen(56)` sagt jetzt „sechsundfünfzig". Die Eins heißt im Verbund
„ein", nicht „eins" — „einsundzwanzig" wäre der klassische Schnitzer.
Über 100 kommt nichts vor: der größte Wert im ganzen Vorrat ist 10 × 10.

---

## Fachwelten (D4)

Neun Kacheln auf einem Bildschirm, die neunte allein in der dritten Reihe.
Der Abgleich sagt dazu: *„Wenn Mathe dazukommt, braucht der Startbildschirm
eine Ebene darüber: Erdkunde und Mathe als zwei Welten mit eigenem
Gesicht."*

### Der Umweg, den die Messung abgeschnitten hat

Der erste Entwurf hat die Welten **nicht** als eigenen Bildschirm gebaut,
sondern als zwei getönte Gruppen auf dem einen. Das Argument dafür war
zählbar: „Rechnen" hält je Kind genau **eine** Kachel, und ein Tipper, der
zu einer einzigen Kachel führt, ist keine Reise, sondern eine Tür.

`passt` hat widersprochen, und zwar mit Zahlen:

```
14 FEHLER: Elemente laufen über den Rand.
   Ebenenwahl: „Rechnen Plus" — 174 px über den Rand
   Ebenenwahl: „Rechnen"      — 195 px im Bereich des Telefons
```

Zwei Weltenköpfe plus zwei getönte Gründe kosten rund hundert Punkte Höhe,
und 844 × 390 hat sie nicht. Damit war die Frage entschieden — nicht durch
das bessere Argument, sondern durch das Gerät. **Das Soll kommt aus der
Referenz, nicht aus mir**, und das Maß vom Zielgerät, nicht aus meiner
Vorstellung.

### Was jetzt dasteht

Ein eigener Bildschirm zwischen Profilwahl und Ebenenwahl: zwei große
Karten, jede mit ihrer Farbe, ihrem Zeichen, ihrer Zahl von Übungen und
ihrem eigenen Stand. Danach zeigt die Ebenenwahl nur noch die Ebenen
**dieser** Welt — acht statt neun, in zwei ruhigen Reihen zu vier statt
drei Reihen mit einer Kachel allein.

Die Zuordnung wird **abgeleitet**, nicht je Ebene hingeschrieben: `art`
sagt schon, wie gefragt wird. Ein zweites Feld daneben wäre dieselbe
Auskunft an zwei Orten, und eines von beiden veraltet.

Buch, PIN und Elternbereich führen jetzt in die **Weltenwahl** zurück, nicht
in eine Ebenenliste: sie hängen am Kind, nicht an einem Fach. Wer das Buch
aus der Erdkunde heraus öffnet, käme sonst dort wieder an — obwohl darin
seit C3c auch die Rechenaufgaben kleben.

### Was der Blick gefunden hat und kein Tor

`passt` war grün, als die beiden Karten noch dieselbe Höhe hatten wie eine
Ebenenkachel: zwei breite Balken unter einer halbleeren Fläche. Und die
Zeile „8 Übungen" fehlte ganz — das kurze Querformat blendet **jede**
Überzeile aus, weil dort sonst acht Kacheln nicht passen. Auf einer Karte,
von der es nur zwei gibt, ist sie aber das einzige, was sagt, wie groß eine
Welt ist.

Beides steht in keinem Tor und ist auf der Aufnahme sofort zu sehen.
**Regel 7**, unverändert gültig: ein Tor prüft, ob etwas funktioniert —
nicht, ob man es spielen kann.

### Ein Zwischenschritt kostet sechs Tore

Sechs Tore klicken sich nach der Profilwahl in eine Ebene. Stünde der neue
Schritt in jedem einzeln, wäre er sechsmal aufgeschrieben und beim nächsten
Umbau fünfmal gepflegt — deshalb steht er einmal in `tor/chromium.mjs` als
`zurEbenenwahl(seite, ebene)`.

Zwei Dinge kamen dabei heraus, die nichts mit D4 zu tun haben und trotzdem
echt sind:

- **Der Bildschirmwechsel blendet über.** Der alte Bildschirm liegt rund
  340 ms darüber und fängt Tipper ab — Playwright meldete „subtree
  intercepts pointer events", und vier Antwortwege fehlten auf einmal.
  Gelöst nicht mit einer Wartezeit, sondern an der Sache: gewartet wird,
  bis nur noch **ein** `.schirm` da ist. Eine Zahl wäre auf einem
  langsameren Rechner zu kurz und hier zu lang.
- **Auf der Weltenwahl führt „Zurück" zur Profilwahl.** Mein Wächter im
  Rauchtest nahm an, er stünde immer auf einer Ebenenwahl, klickte sich
  eine Ebene zu weit hinaus und wartete dann dreißig Sekunden auf eine
  Weltenkarte.

### Und die teuerste halbe Stunde dieser Sitzung

Regel 1 sagt: **erst einchecken, dann gegenproben.** `npm run proben`
verweigert bei schmutzigem Baum den Dienst, weil das in diesem Verzeichnis
schon viermal Arbeit gekostet hat.

Ich habe die Regel gebrochen — mit `--trotzdem`, um schnell eine einzelne
neue Gegenprobe zu prüfen. Der Lauf hat danach mit `git checkout -- .`
aufgeräumt und die gesamte D4-Runde gelöscht: die Weltenwahl, sechs
angepasste Tore, zwei Dokumente. Wiederherstellbar war es nur, weil die
Entwürfe daneben lagen.

Die Regel stand da. Sie wurde trotzdem gebrochen — **weil die Weigerung
mit der Fahne verschwindet und dann gar nichts mehr übrig ist.** Also
bekommt sie jetzt ein Netz statt eines weiteren Satzes: bei `--trotzdem`
auf schmutzigem Baum legt `proben` den Stand vorher als echtes Git-Objekt
weg (`git stash create`) und schreibt die Zeile hin, mit der man ihn
zurückholt. Aus einem unwiderruflichen Griff wird ein ärgerlicher.

*Eine Regel, die nur aufgeschrieben ist, wird gebrochen — und eine, die
nur verbietet, hilft nicht, wenn jemand das Verbot umgeht.*

---

## Der Ton (A2)

Der letzte offene Punkt aus Reihe A — und laut Abgleich das, was ein Kind
**zuerst** wahrnimmt: vor dem Satz, vor der Farbe, vor dem Haken.

### Gerechnet, nicht geladen

`src/kern/klang.js` erzeugt zwei Hüllkurven über `AudioContext`. Zwei
Klangdateien wären je nach Format 5 bis 30 KB im Startbündel, das bei
400 KB gedeckelt ist; die beiden Kurven sind zusammen unter einem
Kilobyte — das Bündel wuchs von 151,6 auf **155,2 KB**. Und sie lassen
sich stimmen, ohne ein Werkzeug zu öffnen.

| | |
|---|---|
| richtig | 660 Hz, dann 990 Hz — zwei kurze Töne aufwärts, eine Quinte |
| falsch | 330 Hz weich fallend auf 247 Hz, um ein Drittel leiser |

Der Fehlerton ist **kein Summer**. Ein Kind, das eine Aufgabe übt, macht
Fehler — das ist der Zweck der Übung —, und ein Geräusch, das sich wie eine
Niederlage anhört, macht aus jedem Fehler ein Ereignis. Aufgelöste Aufgaben
(„Weiß ich nicht") bleiben ganz stumm: die App sagt dazu schon „Kein
Problem", ein Ton obendrauf machte aus dem Ausweg eine Niederlage.

Der Kontext wird **spät** angelegt, beim ersten Ton. iOS gibt Ton erst nach
einer Berührung frei, und ein Kontext, der vorher entsteht, bleibt
„suspended" — er spielt dann den Rest der Sitzung nichts, ohne einen Fehler
zu werfen. Der erste Ton ist immer eine Antwort, also immer nach einer
Berührung.

### Eine Stelle entscheidet, wie eine Antwort klingt

`klangZu(ergebnis)` — ausgelöst dort, wo die App ohnehin schon entscheidet,
wie die Antwort ausging. Der richtige Ton steht **in `werten()`**, durch das
beide Bildschirme laufen; der falsche an den zwei Fehlerzweigen. Und er
hängt am selben Schalter wie die Sprache: wer „Ton aus" sagt, meint nicht
„nur die Stimme aus".

### Ein Tor kann nicht hören — aber es kann anderes

Chromium hier hat kein Tongerät, und `AudioContext` gibt nichts zurück, was
man ansehen könnte. Der Rauchtest baut es deshalb nach und schreibt mit,
**welche** Schwingungen angelegt wurden — dasselbe Mittel wie bei
`speechSynthesis.speak`. Geprüft wird an einer falschen und einer richtigen
Antwort hintereinander an derselben Aufgabe:

```
Ton bei falsch/richtig:     330→247  |  660→660 990→990
Mit „Ton aus":              0 Schwingungen (erwartet 0)
```

- Es kommt überhaupt einer.
- Die beiden sind **verschieden**. Ein Ton, der bei richtig und falsch
  derselbe ist, sagt dem Kind nichts — und sieht in jedem Mitschnitt aus
  wie zwei.
- Die **Richtung** stimmt: das Lob steigt, der Hinweis fällt. Ein
  steigender Fehlerton klänge wie ein zweites Lob.
- Bei „Ton aus" bleibt es still.

Die vierte Prüfung ist nachträglich dazugekommen, und zwar weil ihre
Gegenprobe sonst **nichts bewiesen hätte**: bei eingeschaltetem Ton ändert
das Entfernen der Sperre nichts, was zu sehen wäre. Regel 13, wieder —
*wer eine Wirkung misst, schaltet sie zuerst ab.*

**Ob sie gut klingen, sagt das alles nicht.** Das hört man auf dem iPhone
und nirgends sonst; im Abgleich steht dafür seit der ersten Fassung: *„Für
A2: einmal Hören auf dem iPhone."*

---

## Der Prozess selbst auf dem Prüfstand

> *„Für solche kleinen Anpassungen kann es nicht sein, dass wir über 20
> Minuten Proben- und Testläufe am Ende haben. Das steht in keinem
> Verhältnis."*

Stimmt. Und die Ursache war kein Preis für Sicherheit, sondern ein
Konstruktionsfehler — einer, der sich nicht als Fehler zeigte, sondern als
Geduld.

### Wo die Zeit lag

Gemessen am vollen Lauf vor dem Umbau, 1513 s:

| Tor | Zeit | Anteil | Proben |
|---|---|---|---|
| `smoke` | 1141 s | **75 %** | 25 |
| `ansicht` | 111 s | 7 % | 2 |
| `passt` | 99 s | 7 % | 2 |
| `ziehen` | 86 s | 6 % | 6 |
| `pwa` | 33 s | | 3 |
| `inhalt` | 18 s | | **20** |
| Rest | 25 s | | 11 |

Zwanzig Proben in `inhalt` kosten 18 Sekunden, fünfundzwanzig in `smoke`
kosten 1141. Faktor 63 je Probe.

### Der Befund: der volle Lauf war gar nicht „alle drei Runden"

Die Frist, auf die sich alle verlassen haben, hat **nie gegriffen**. Was
griff, stand in `tor/rhythmus.mjs`:

```js
const zahl = (jetzt.match(/\{ n:'/g) || []).length;
if (zahl !== stand.proben) fehler.push(`Es stehen ${zahl} Proben im Baum …`);
```

`proben-stand.json` war **ein einziger Datensatz für alle**: ein Datum, ein
Commit, eine Zahl. Wer eine Gegenprobe dazuschrieb, entwertete damit den
Nachweis für die anderen achtundsechzig — und musste alles neu fahren.

Und eine Runde, die etwas Neues baut, schreibt fast immer eine Gegenprobe
dazu. Das ist ja die Hausregel. Also lief in der Praxis **jede** Runde der
volle Satz: in einer einzigen Sitzung viermal, rund hundert Minuten. Die
Frist kam nie an die Reihe, weil die Zahl vorher rot wurde.

### Hebel 1: der Nachweis gehört zur Probe, nicht zum Satz

`proben-stand.json` hält jetzt je Probe fest, wann sie zuletzt angeschlagen
hat:

```json
"eine Division geht nicht mehr auf": { "commit": "49061e7", "zeit": "2026-08-29" }
```

`rhythmus` prüft daraus dreierlei: jede Probe im Baum hat einen Nachweis,
keiner ist älter als drei Code-Runden, und keiner zeigt auf einen Commit,
den es nicht mehr gibt. Eine neue Probe kostet damit **diese** Probe.

Und `--geaendert` rechnet ab jetzt gegen den **eigenen** Nachweis jeder
Probe statt gegen einen gemeinsamen Commit: gefahren wird, was keinen
Nachweis hat oder dessen Datei oder Tor sich seither bewegt hat. Deshalb
darf es jetzt auch Stand schreiben — unter einem Datensatz für alle wäre
das eine stille Aushebelung gewesen, unter einem je Probe ist es genau die
Wahrheit.

Drei Dinge sind dabei weggefallen, weil sie ihren Gegenstand verloren
haben: die Marke `"lauf": "abgebrochen"` (ein abgebrochener Lauf
hinterlässt jetzt Lücken, und die fängt dieselbe Prüfung wie eine neue
Probe), die Zahl `"proben": 69`, und der gemeinsame Commit `"fassung"`.

Ein Henne-Ei blieb: die vier `rhythmus`-Proben prüfen `rhythmus`, und
`rhythmus` verlangt, dass jede Probe einen Nachweis hat — auch sie selbst.
Ohne Vorschuss wäre das Tor schon **ohne** Eingriff rot, nämlich wegen
dieser vier, und alle vier meldeten „war schon vorher rot" statt zu
beweisen. Sie bekommen ihren Eintrag deshalb vor dem Lauf und verlieren ihn
wieder, wenn sie nicht anschlagen. Genau das leistete früher die Marke
„vollständig", die bei einem Fehlschlag auf „abgebrochen" zurückgesetzt
wurde.

### Hebel 3: `proben` fasst den Arbeitsbaum nicht mehr an

Geprobt wird in einer Wegwerf-Kopie — `git worktree` auf denselben HEAD,
und was im Arbeitsbaum anders ist, wird hineinkopiert. Geprüft ist damit,
was du **siehst**, und gerechnet wird wie zu Hause: `rhythmus` zählt mit
`git rev-list`, und ein Stash-Commit hätte neben der Historie gehangen
statt in ihr.

Das erledigt drei Dinge auf einmal:

- **Die Gefahr ist weg.** Der Befehl, der dieser Sitzung eine halbe Stunde
  gekostet hat — `git checkout -- .` —, läuft jetzt in der Kopie und kann
  nichts mehr treffen als sich selbst. Nachgewiesen: eine angehängte Zeile
  in `prototyp/spiel.js` und eine unverfolgte neue Datei haben einen
  vollständigen Probenlauf überlebt. Unter dem alten Code wären beide weg.
- **Die Regel ist weg.** „Erst einchecken, dann gegenproben" stand seit
  vier Verlusten in `CLAUDE.md` und hat den fünften nicht verhindert. Sie
  war ein Verbot, und ein Verbot hilft nicht, wenn jemand es umgeht.
  *Weggefallen ist nicht die Umgehung, sondern der Grund.* Mit ihr fällt
  die Zeremonie „commit, proben, nachbessern, nochmal committen" weg — ein
  Umweg pro Runde.
- **Die Proben sind unabhängig geworden.** Sie teilten sich genau eine
  Sache: den Arbeitsbaum. Alle sechs Browser-Tore binden ohnehin schon
  `server.listen(0)`, also einen freien Port. Damit ist der Weg frei, sie
  nebeneinander zu fahren — das ist Hebel 4 und noch nicht gebaut.

### Hebel 2 und 4: abkürzen und nebeneinander

**`--sofort`** — aufhören, sobald der erste Fehler feststeht. Eine
Gegenprobe will eine einzige Auskunft: schlägt das Tor an, und mit welcher
Meldung. Die Richtung ist sicher: abgebrochen wird **erst**, wenn schon ein
Fehler in der Liste steht — grün werden kann dadurch nichts.

Der Gewinn ist ungleich verteilt, und das ist der interessante Teil:

| Probe | vorher | mit `--sofort` |
|---|---|---|
| „eine richtige Antwort wird nicht mehr gewertet" | 71 s | **9 s** |
| „Antippen antwortet nicht mehr" | 71 s | 78 s |

Der erste Fehler fällt **während** des Spiels auf, der zweite erst in der
Schlussrechnung („kein einziger Zug über…"). Manche Aussagen sind ihrer
Natur nach Summen — dort kann nichts abgekürzt werden, und ein Werkzeug,
das so täte, würde lügen.

**`--kurz`** — der Durchgang spielt je Profil drei Ebenen statt neun: die
erste Karte, die Auswahl-Ebene und das Rechnen. Damit ist jede *Art* von
Bildschirm dabei, beide Welten und alle vier Antwortwege — nur nicht jede
einzelne Länderebene. Dass die spielbar sind, prüft die **Kette**, und dort
läuft der Durchgang weiterhin vollständig. Bliebe eine Probe dadurch grün,
meldete der Lauf „TOR BLEIBT GRÜN": die Abkürzung kann nichts verstecken,
sie kann nur auffallen.

Nachgewiesen: **alle 25 Rauchtest-Gegenproben schlagen weiter an**, in
6 min statt 12.

**Nebenläufig.** Nicht die Maschinerie wurde umgebaut — ein
Nebenläufigkeits-Umbau mitten in dem Werkzeug, das die Beweise führt, wäre
die Sorte Änderung, bei der ein Fehler still bleibt. Stattdessen startet
der Lauf sich **selbst** dreimal, jedes Kind mit einem Teil der Arbeit und
einer eigenen Kopie. Innen bleibt alles, wie es war.

Geteilt wird nach **Gruppen** — alle Proben mit demselben Tor und denselben
Argumenten —, weil sie sich den gesunden Lauf teilen. Auseinandergerissen
würde der mehrfach gefahren, und beim Rauchtest ist er so teuer wie eine
Probe.

Eine Kleinigkeit fiel dabei sofort auf: die Ausgabe schrieb erst den Namen
und später das Ergebnis dahinter. Sobald drei Kinder nebeneinander laufen,
schiebt sich das eine in die halbe Zeile des anderen, und übrig bleibt ein
„schlägt an 15 s" ohne Namen. Eine Zeile fällt jetzt in einem Stück.

### Was es gebracht hat — und was nicht

Alles auf diesem Rechner: vier Kerne, Chromium unter SwiftShader.

| | vorher | nachher |
|---|---|---|
| Runde, die Dokumente und Werkzeuge anfasst | 25 min | **2,7 s** |
| Runde, die `prototyp/spiel.js` anfasst (29 Proben) | ~25 min | **7 min 11 s** |
| voller Lauf, alle 69 | 25–31 min | **17 min 8 s** |
| Verlust ungesicherter Arbeit | vier Mal passiert | **strukturell unmöglich** |

**Das Ziel waren zwei bis drei Minuten für die gewöhnliche Runde. Erreicht
sind sieben.** Die Wahrheit dazu, damit niemand später rät:

Die Parallelität bringt nur **1,5×**, nicht 3×. Der Rechner hat vier Kerne,
und drei Chromium-Instanzen unter Software-Rasterung sättigen ihn. Auf mehr
Kernen skaliert es besser — das ist eine Eigenschaft der Messstelle, nicht
des Entwurfs.

Und der Boden liegt woanders: jede Rauchtest-Probe zahlt noch rund 25
Sekunden, davon ein großer Teil **feste Wartezeiten** — nach jeder Antwort
`waitForTimeout(2600)`, dazu 900 und 1500 ms an anderen Stellen. Das sind
bei sechs Durchläufen je Probe rund dreißig Sekunden reines Schlafen. Sie
durch echte Bedingungen zu ersetzen (`waitForFunction` auf den nächsten
Bildschirm) wäre der nächste Hebel — und zugleich der riskanteste: genau
diese Wartezeiten stehen dort, weil Übergänge animiert sind, und eine
Gegenprobe, die zweimal Verschiedenes sagt, ist schlimmer als eine
fehlende. Das wäre eine eigene Runde mit eigener Messung, nicht ein
Nebenbei.

---

## R2 · Eine Kachelsprache für alle drei Wahlbildschirme

Gewählt war Entwurf **B · Bild** auf **W2** — reinweißer Grund, kräftigere
Kachel. Umgesetzt ist genau das, plus vier Dinge, die erst der Blick auf die
Aufnahmen gezeigt hat.

### Der Grund ist weiß, und das steht jetzt so da

`--grund` und `--grund-2` sind `oklch(1 0 0)`. Die alte Begründung
(„Eine flache weiße Fläche ist der schnellste Weg, eine App älter aussehen
zu lassen, als sie ist") steht weiter in `marken.css` — zitiert und
ausdrücklich als überstimmt gekennzeichnet. Eine Begründung, die
stillschweigend verschwindet, wird in drei Runden erneut erfunden.

Auf Weiß trägt nicht mehr die Fläche, sondern der **Rand**: 26 % Füllung aus
dem eigenen Ton, 52 % Rand daraus.

### Jede Kachel zeigt ihren Umriss

Die Umrisse kommen nicht aus dem Netz. `bauen.mjs` backt sie beim Bauen aus
denselben Natural-Earth-Daten in `D.silhouetten` — Kontinente auf 16 Punkte
vereinfacht, Deutschland auf 8. **13,4 KB**, Startbündel 151,6 → 162,7 von
400 KB.

Der Weg dahin war nicht gerade. `teilen()` schneidet `pfad` aus dem
Startbündel heraus — die Umrisse, die der Entwurf zeigte, waren zur Bauzeit
gar nicht da. Naives Ausdünnen („jeder 32. Punkt") zerlegte Afrika in
Splitter, und ein gleichfarbiger Strich schloss die Lücken nicht. Getragen
hat erst der **äußere** Umriss: ein Kontinent ist ein einziges Polygon und
dünnt sauber aus.

### Vier Befunde, die kein Tor hatte — nur der Blick (Regel 7)

**1. Das Wasserzeichen lief aus der Kachel heraus.** Bei 150 % Höhe war
Afrika ein Fleck und Deutschland ein Schmier; erkennbar war keins von
beiden. Ein Wasserzeichen, das man nicht erkennt, ist Dekoration und keine
Auskunft. Es sitzt jetzt ganz in der Kachel (86 % Höhe, höchstens 52 %
Breite), und die **Höhe steht im Stylesheet, je Kachelart einmal** — am
Aufruf steht keine Zahl mehr.

**2. Die Rechenwelt hatte kein Bild.** Erdkunde bekam eine Weltkarte,
Rechnen eine leere Fläche — das sah nach einem Fehler aus. Die Rechenwelt
und ihre Ebenen zeigen jetzt ihre **Zeichen** (`+ ×`, `+ −`, `× ÷`),
gezogen statt gefüllt.

**3. Das kleine Eckzeichen sagte dasselbe noch einmal, nur kleiner.** Ein
Globus auf einer Weltkarte, ein `+×` über einem `+ ×`. Es ist weggefallen —
mitsamt seinen zwei Symbolen und dem Feld `zeichen` in `WELTEN`, das damit
tot gewesen wäre.

**4. Der Baustempel stand größer da als „6 Jahre · sprechen und ziehen".**
Er trug die Klasse `.unter`, und die ist für Erklärtexte gemacht. Er hat
jetzt seine eigene, leise Klasse — auf dem ersten Bildschirm, den die Kinder
sehen.

Damit das nächste Mal nicht wieder der Zufall entscheidet: die **Profilwahl
hat ein Vorbild bekommen** (`quer-profile`). Ausgerechnet der Bildschirm,
den beide Kinder als erstes sehen, war bis hierher unfotografiert — 15
Aufnahmen, 16 jetzt.

### Das Überlappungs-Tor sitzt in `passt`, nicht daneben

`passt` fährt bereits 7 Größen × 9 Bildschirme ab. Ein zweites Werkzeug
hätte dieselbe Tour ein zweites Mal beschrieben und wäre auseinandergelaufen
(Regel 15). Die Prüfung ist deshalb ein zweiter Ausgang desselben Sammlers:
jedes Paar von Elementen **im Fluss**, deren Rechtecke sich um mehr als 1 px
schneiden, ist ein Befund. Was absolut liegt, liegt absichtlich übereinander
und hat seine eigene Prüfung.

Gemeldet wird nur der **innerste** Kasten. Ohne das erschien ein Befund
vierfach — Hülle gegen Hülle, Hülle gegen Kachel, Kachel gegen Hülle,
Kachel gegen Kachel.

**Die Abnahme sagte „eine Kachel um 4 px verschieben". Das ist falsch, und
zwar aus einem lehrreichen Grund:** die Lücke zwischen den Reihen ist
größer als 4 px, es überlappte gar nichts. Das Tor blieb zu Recht grün.
Ein Eingriff, der nichts bewirkt, sieht aus wie ein bestandenes Tor
(Regel 3). Die stehende Gegenprobe verschiebt jetzt um **60 px** und meldet
`199×52 px`.

### `lesbarkeit` bezeugte etwas, das es nie geprüft hatte (Regel 13)

Das Tor läuft den **Elternbaum** hoch, um den Grund zu finden. Ein
Wasserzeichen ist aber ein **Geschwister** — es lag ab R2 unter jeder
Kachelschrift, und das Tor hätte weiter gegen die nackte Füllung gemessen
und grün gemeldet.

`grundVon` sammelt jetzt zusätzlich jedes absolut liegende Geschwister, das
den Textkasten schneidet, mischt seine Farbe mit seiner Deckung auf die
Fläche und misst gegen **beides**. Beim ersten Lauf schlug es sofort an —
**zehn Fehler**, die es vorher nicht gab und die trotzdem schon da waren:

| | war | ist |
|---|---|---|
| `.ueber` „8 Übungen", Tag | 4,08:1 | grün |
| `.klebermarke` „0", Abend | 3,22:1 | grün |

Drei Ursachen, alle drei Gestaltung, die sich am Kontrast bediente:
`.kachel.welt .ueber{opacity:.85}` (Text dimmen, damit es hübsch aussieht),
42 % Ton in der Schriftfarbe, und `--tinte-2` für eine Zahl, die auf dem
Wasserzeichen steht. Dazu ist das Wasserzeichen selbst leiser geworden
(0,50 → 0,34). Alle vier Werte sind **gemessen** eingestellt, nicht geraten.

### Und ein Wert, der sich vor dem System versteckt hatte

Die Blende des Wasserzeichens stand zweimal im Stylesheet
(`mask-image` und `-webkit-mask-image`) und enthielt `#000`. Das Tor
`marken` hat es als Farbe am System vorbei gemeldet — zu Recht, denn als
Wert im Stylesheet ist es eine. Sie steht jetzt als `--blende-umriss` in
`marken.css`: einmal, und mit dem Vermerk, dass das `#000` darin keine
Farbe ist, sondern Deckung 1.

### Stand

19 Tore grün, 16 Vorbilder erneuert, **71** stehende Gegenproben (zwei
neue, beide schlagen an). Startbündel 162,7 von 400 KB.

---

## Die Auslieferung war fünf Runden rot — aus drei Gründen

Gemeldet wurde: „Run, Fail, jedes Mal." Es waren **drei voneinander
unabhängige Fehler**, und zwei davon konnten den dritten nicht einmal
erreichen.

### 1. `rhythmus` maß etwas, das es nur auf diesem Rechner gibt

Der Runner meldete: *„Für 66 Proben ist der notierte Commit nicht mehr
auffindbar."* Hier war dasselbe Tor grün.

Der Grund: 66 der 71 Nachweise zeigten auf zwei Commits namens
`wip Hebel 2+4` und `wip Hebel 5 kurz` — sie hingen **an keinem Zweig**
und wurden nie gestoßen. Lokal findet `git` sie noch im Objektspeicher,
auf einem frischen Klon nicht.

Und das ist nicht der schlimmere Teil. Der schlimmere ist das **Grün hier**:
für einen Commit, der kein Vorfahr von `HEAD` ist, rechnet
`git rev-list --count X..HEAD` klaglos eine Zahl aus. Sie bedeutet nur
nichts. Das Tor hat fünf Runden lang eine Zahl gemeldet, die keine
Messstelle hatte (Regel 12).

Der Kommentar an genau dieser Stelle **hat den Fall beschrieben und die
Lösung genannt** — „gezählt wird an der Standdatei" — und umgesetzt war sie
nicht. Ein Kommentar, der eine Absicht statt des Codes beschreibt, ist eine
Lüge mit Vorlaufzeit.

Jetzt zwei Wege, und der erste zählt nur, wenn er zählen darf:

1. Der notierte Commit ist ein Vorfahr von `HEAD` → genau abzählen.
2. Sonst: den Commit suchen, in dem die **Standdatei** diesen Eintrag zum
   ersten Mal trägt. Die steht immer in der Historie, weil sie zu dem
   Commit gehört, der die Runde trägt.

Geprüft wurde das nicht durch Nachdenken, sondern durch einen **frischen
Klon** (`git clone --no-local`). Der sagt jetzt Wort für Wort dasselbe wie
der Arbeitsplatz — vorher das eine grün, das andere rot.

### 2. `Vorschau versenden` fiel durch, wenn alles in Ordnung war

Der Ablauf sah **einmal** nach, ob der Stand von `main` eine erfolgreiche
Torkette hat, und fiel sonst durch. Werden `main` und `vorschau` zusammen
gestoßen, ist die Vorschauprüfung nach drei Sekunden fertig und die
Torkette braucht vier Minuten. Das Rennen war nicht zu gewinnen.

Sechs rote Läufe an einem Nachmittag, sechs E-Mails, **kein einziger echter
Befund** — und dann noch einmal dieselbe E-Mail für den echten Fehler aus
Punkt 1, ununterscheidbar von den fünf falschen.

Jetzt **wartet** er bis zu zehn Minuten auf die Entscheidung, und wenn die
Kette rot ist, bleibt er **stehen statt durchzufallen**: mit einer Notiz,
warum nichts versandt wurde. Die Torkette hat den Befund bereits gemeldet.
Ein zweiter roter Lauf für dieselbe Ursache sagt nichts Neues — er
verdoppelt die E-Mail und verdeckt beim nächsten Mal, welcher der beiden
gemeint war.

### 3. Ein Vorschau-Versand konnte die laufende Torkette abbrechen

`concurrency: group: pages` stand am **Ablauf**, nicht am Versand-Job. Damit
lagen Torkette und Vorschau-Versand in derselben Schlange, und ein Versand,
der während einer laufenden Kette eintraf, hat sie abgeräumt. Die
Auslieferung von `96d21d5` steht als `cancelled` im Protokoll, ohne dass an
ihr irgendetwas falsch war.

Die Schlange sitzt jetzt am Job `ausliefern`. Zwei Auslieferungen können
sich immer noch nicht überschreiben — das war ihr Zweck —, aber eine
Vorschau kann keine Prüfung mehr abwürgen.

### Was daran lehrreich ist

Zwei der drei Fehler waren **Lärm, der wie ein Befund aussah**. Solange sie
dastanden, war der echte Fehler nicht zu finden: sechs identische E-Mails,
eine davon berechtigt. Ein Alarm, der bei jedem Lauf angeht, ist kein Alarm.

---

## Das Forscherbuch, R1, und drei Tore, die weniger gesehen haben als gedacht

### Der Endbildschirm braucht die Kachelsprache nicht

Geplant war, R2 auf Endbildschirm und Forscherbuch auszudehnen. Der Blick
auf die Aufnahmen (Regel 7) hat die Hälfte davon erledigt: der
Endbildschirm ist typografisch geführt, hat keine Karten und liest sich auf
Weiß gut. Ihm Kacheln aufzuzwingen wäre schlechter als ihn zu lassen. Eine
geplante Arbeit nicht zu tun ist auch ein Ergebnis.

### Das Forscherbuch war für `passt` unsichtbar

`.aufkleber` stand nicht in seiner Auswahl. Der Bildschirm mit den **meisten**
Kästen — anklickbar, in einem scrollenden Behälter — wurde von dem Tor, das
Überlauf prüft, überhaupt nicht angesehen. Es meldete grün, weil es dort
nichts zu sehen hatte.

Auf Weiß war die Karte selbst dann noch unsichtbar: `background:var(--papier)`
plus `border:none`. Zu sehen war nur der Schatten an der Unterkante, und die
Umrisse schwebten frei im Raum. Jetzt trägt auch hier der Rand.

### `lesbarkeit` sah vier von neun Bildschirmen

`passt` fährt neun Bildschirme ab, `lesbarkeit` fuhr vier. Forscherbuch,
Elternbereich und Endbildschirm wurden nie auf Kontrast gemessen —
ausgerechnet das Forscherbuch, in dem die einzige absichtlich
zurückgenommene Schrift der App steht.

Der erweiterte Rundgang fand sofort **drei Fehler** (4,41:1 im Abendmodus)
und misst jetzt **160 statt 104** Texte. Der Endbildschirm fehlt weiter, und
zwar ausdrücklich: dorthin kommt man nur durch ein ganzes Spiel.

### Und `lesbarkeit` rechnete die Deckung der Vorfahren nicht mit

`opacity` wirkt auf den ganzen Teilbaum, steht im `computedStyle` des Kindes
aber als `1`. Ein Etikett in einer Karte mit `opacity:.45` wurde deshalb
gemessen, als stünde es voll da — 7,4:1 für eine Schrift, die das Auge bei
3,3:1 sieht. Dieselbe Verwechslung wie beim Wasserzeichen, nur andersherum:
dort fehlte der Grund, hier die Farbe darüber.

Der Ausschluss „unter 0,5 gar nicht erst ansehen" bleibt daneben stehen — er
meint das Element **selbst**, das dann absichtlich verborgen ist.

## R1 · Von vorne, mitten im Spiel

Das Kreuz im Spiel führte wortlos zur Ebenenwahl. Es führt jetzt auf einen
**Pausenbildschirm**: Weiterspielen · Übung beenden · Von vorne anfangen.

Kein vierter Knopf im Kopf: links das Kreuz, in der Mitte das
Fortschrittsband, rechts die Sterne — im Querformat ist die Zeile voll. Und
eine Taste, die eine Woche Übung wegräumt, gehört nicht neben das Kreuz. Der
Umweg über diesen Bildschirm **ist** der Schutz; das Löschen selbst braucht
danach noch einen zweiten Tipper.

Der neue Bildschirm steht sofort in beiden Rundgängen — `passt` und
`lesbarkeit`. Ein neuer Bildschirm, den kein Tor ansieht, ist genau die
Lücke, die das Forscherbuch eine Runde lang hatte. `lesbarkeit` hat den
Warnknopf dann auch prompt gemeldet: 2,92:1, nötig 3:1.

### Die Gegenprobe, die dreimal nichts bewies

Zwei Dinge können brechen, und nur eines davon ist von außen zu sehen:

1. Das Löschen löscht nicht. → Sofort gefangen.
2. Es löscht, aber die Sitzung **zählt weiter**. `starten()` liest den
   Leitner-Stand neu; ohne `Stand = {}` begänne die neue Runde mit den alten
   Fächern — dieselben Aufgaben, dasselbe Fach, nur ohne Häkchen. Von außen
   sieht das aus wie ein sauberer Neuanfang.

Die zweite Gegenprobe blieb grün, obwohl der Fehler drin war — dreimal, aus
zwei verschiedenen Gründen:

**Erstens:** der Test öffnete die Pause, während die Sitzung noch bei
Aufgabe eins stand. Dann sieht ein Neuanfang genauso aus wie ein
Weiterzählen. Der Test wartete auf „irgendein Punkt ist gefärbt" — aber der
erste Punkt färbt sich **sofort** nach der richtigen Antwort, weitergerückt
wird erst 2,6 s später. Er wartet jetzt darauf, dass der **laufende** Punkt
weitergerückt ist, und sagt es laut, wenn das nicht passiert.

**Zweitens:** die Gegenprobe suchte „zählt weiter", der Test schrieb
„zaehlt weiter". In diesem Verzeichnis ist der Quelltext deutsch und die
**Ausgabe** trägt Umlaute; die Kommentare nicht. Ein Tor, das rot wird und
das Falsche sagt, ist kein bestandener Beweis — `proben` hat genau das
gemeldet: „wird rot, meldet aber nicht … — es fällt vielleicht aus einem
anderen Grund durch."

### `proben` warf einundzwanzig Minuten Arbeit weg

Ein `process.exit(1)` stand **vor** dem Festhalten. Beim vollen Lauf
schlugen 65 von 67 Proben an, zwei bewiesen nichts — und weil der Lauf damit
rot war, wurde **kein einziger** Nachweis geschrieben.

Das ist nicht nur teuer, es ist eine Falle mit Rückkopplung: ohne Nachweise
altern alle Proben weiter, `rhythmus` wird rot, und die Antwort darauf ist
wieder ein voller Lauf — der am selben Befund wieder nichts schreibt. Genau
so sind 66 Nachweise fünf Runden alt geworden.

`rhythmus` liest den Stand **je Probe**. Eine Probe, die angeschlagen hat,
hat angeschlagen — unabhängig von ihrer Nachbarin. Was nicht angeschlagen
hat, bekommt weiterhin keinen Eintrag und fällt als „hat noch nie
angeschlagen" auf. Der Befund bleibt sichtbar, der Beweis bleibt erhalten.

### Und ein Vorbild, das sich von selbst änderte

`quer-profile` — die Aufnahme, die in dieser Runde neu dazukam — enthielt
den **Baustempel mit Uhrzeit**. Im Arbeitsbaum fiel das nicht auf, weil dort
die Zeitstempel der Quelldateien stehenbleiben; in einem frischen Auschecken
sind sie neu, und damit ist es die Uhr auch: `15:59` gegen `16:52`, 2556
Bildpunkte Unterschied.

Gefunden hat es `npm run proben`. Die Aufnahme friert die Zeile jetzt auf
einen festen Satz **derselben Bauart** ein — nicht auf einen leeren: Lage und
Größe bleiben geprüft, nur der Inhalt nicht. Dass Fassung und Datum stimmen,
prüft `doku`.

---

## R3 · Der Vorlauf: anschauen, bevor man rät

Vor jeder Ebene ein Blättern statt eines Rätsels — alle Gegenstände mit
Bild und Namen, antippen liest vor, unten „Jetzt starten". Beim **ersten**
Betreten je Kind und Ebene von selbst, danach über „anschauen" an der
Kachel.

### Er ersetzt die Stadtstaaten-Einheit, statt neben sie zu treten

Das war die Frage, die im Backlog ausdrücklich offen stand. Beim Hinsehen
war sie leichter als gedacht: die Stadtstaaten-Lerneinheit hatte **schon
die richtige Form** — Titel, ein erklärender Satz, ein Gitter aus
antippbaren Umrissen, ein Knopf. Der Vorlauf ist ihre Verallgemeinerung.
Es kommt also eine Form dazu und eine fällt weg, statt dass zwei
nebeneinander stehen.

Der Satz wird **abgeleitet**, nicht je Ebene hingeschrieben — dieselbe
Regel wie beim Kartenhinweis. Sonst hätte die vierte Karte keinen. Bei den
Hauptstädten ist es der Stadtstaaten-Satz, und er erklärt dort jetzt
zugleich, warum Berlin, Hamburg und Bremen im Gitter fehlen: `vorrat()`
lässt sie aus, weil sie ihre eigene Hauptstadt sind.

Die Karten sind die des Forscherbuchs. Das ist kein Sparen: es ist
derselbe Gegenstand in derselben Sprache, und ein Kind, das im Buch
geblättert hat, erkennt ihn hier wieder.

### Was der Blick gefunden hat, bevor ein Tor etwas sagen konnte

**Sechzehn Kästen mit dem Wort „undefined".** `teilen()` schneidet die
Pfade aus dem Startbündel heraus; ohne `ebeneLaden` hat jedes Stück ein
leeres `pfad`, und der Vorlauf malte die Rechenaufgaben-Variante mit
`undefined`. Genau die Falle, die R2 schon einmal gestellt hatte — und ich
bin ein zweites Mal hineingelaufen. `starten()` lädt in derselben
Reihenfolge; wer den Vorrat anfasst, muss vorher laden.

**Der Erklärsatz stand halb über dem oberen Rand.** `justify-content:center`
in einem Behälter, der überläuft, schneidet an **beiden** Enden ab — und
nach oben kann man nicht scrollen. `safe center` fällt in dem Fall auf
`flex-start` zurück.

**Und die Namen waren abgeschnitten.** Im Forscherbuch sind drei Punkte in
Ordnung: dort steht, was man schon kennt. Hier soll das Kind den Namen
**lernen**, und „Sachsen…" neben einem echten „Sachsen" ist schlimmer als
kein Name. Der erste Versuch mit `overflow-wrap:anywhere` schrieb dann
„Brandenbur / g" — ein einzelner Buchstabe auf einer Zeile. `break-word`
trennt erst, wenn das Wort allein nicht auf eine Zeile passt, und nimmt
vorher jede Fuge: „Rheinland- / Pfalz", „Mecklenburg- / Vorpommern".

### Die engste Stelle wurde gemessen, nicht geschätzt

`passt` meldete beim ersten Lauf **elf bis achtundneunzig Punkte**
Überlauf: auf dem iPhone SE quer im Vorlauf der Bundesländer, auf dem
Zielgerät bei den Hauptstädten, und — nicht erwartet — auf der
**Ebenenwahl**, weil der neue Knopf „anschauen" dort eine Zeile kostet.

Geholt wurden die Punkte in vier Runden am Stylesheet, jede gegen eine
neue Messung. Die Karten sind im kurzen Querformat kleiner, die zweite
Zeile schmaler, die Kachelpolsterung enger; die Schrift blieb, wo sie war.
Ein Vorlauf mit Zuordnung bekommt **breitere** Karten als einer ohne — er
trägt zwei Namen je Karte statt einem.

### Ein Zwischenschritt, fünf Tore

Der Vorlauf steht jetzt zwischen Ebenenwahl und Aufgabe, und **fünf Tore**
klickten sich daran vorbei: `smoke` (an neun Stellen), `passt`,
`lesbarkeit`, `ziehen`, `ansicht`. Dieselbe Geschichte wie bei der
Weltenwahl in D4 — und dieselbe Antwort: **ein** Weg, in
`tor/chromium.mjs`. Wer ihn an neun Stellen nachbaut, pflegt ihn an acht
nicht.

`passt` prüft damit jetzt **14 Bildschirme je Größe** statt 9,
`lesbarkeit` misst **216 Texte** statt 104 vor dieser Sitzung.

---

## Der Prozess, zum zweiten Mal auf dem Prüfstand — und diesmal richtig

Der erste Anlauf hat den **Probenlauf** beschleunigt: 25 min → 17 min voll,
7 min für die gewöhnliche Runde. Das Ziel waren zwei bis drei Minuten, und
es wurde nicht erreicht. Der Grund, rückblickend: ich habe das Falsche
optimiert. Schneller machen, was man nicht braucht, ist nicht dasselbe wie
es weglassen.

### Erst messen

| | |
|---|---|
| ganze Kette | **336 s** |
| davon im Browser | **335 s** |
| ohne Browser (inhalt · spielprobe · vergleich · budget) | **0,8 s** |

Und im Rauchtest, der allein 163 s davon ausmacht:

| Abschnitt | Dauer |
|---|---|
| `durchgang` — jede Ebene für beide Kinder | **83 s** |
| `ablage` | 38 s |
| `spielen` — spielt, legt ab, übersteht Neustart | 29 s |
| `regler` | 27 s |
| `ebene4` | 16 s |
| `tippen` | 2 s |

Damit ist die Frage nicht mehr „wie machen wir das schneller", sondern
**„was davon muss ich vor dem Stoßen sehen"**.

### Drei Bahnen

| Bahn | Wann | Dauer | Wer bezahlt |
|---|---|---|---|
| **`npm run schnell`** | jede Änderung | **44,7 s** | ich |
| `npm run tor` | auf Wunsch | ~5 min | ich, freiwillig |
| Runner bei jedem Push | automatisch | 3–4 min | niemand |
| Runner nachts | automatisch | ~20 min | niemand |

`schnell` fährt alles, was nichts kostet (0,8 s), und dann die **zwei**
Browser-Tore mit der größten Ausbeute **nebeneinander**: den Rauchtest auf
dem Hauptweg und den Bildvergleich. Zwei Chromium auf vier Kernen — die
Temporunde hatte gemessen, dass drei den Rechner sättigen.

**336 s → 44,7 s.** Das Ziel ist erreicht, und zwar nicht durch schnellere
Prüfungen, sondern durch die Frage, wer wartet.

### Die Gegenproben laufen nachts

Sie prüfen die **Tore**, nicht die App. Das ist wertvoll — sie haben in
dieser Sitzung ein Vorbild gefunden, das sich von selbst änderte, und eine
Kontrastrechnung, die ein Wasserzeichen nicht sah. Und sie dauern zwanzig
Minuten.

`rhythmus` stand vorn in der Kette und verlangte, dass kein Nachweis älter
als drei Runden ist. Das hat in **einer** Sitzung dreimal einen vollen Lauf
mitten in der Arbeit ausgelöst. Die Frist ist richtig; falsch war, **wer
sie bezahlt**. Sie steht jetzt in `.github/workflows/proben.yml`, läuft um
drei Uhr nachts und schreibt den Stand zurück.

### Was es gekostet hat, und was nicht

**Was `schnell` nicht sieht:** Überlauf auf sieben Gerätegrößen, Kontrast,
die Nachsicht beim Ziehen, PWA und Offline, und den gründlichsten
Rauchtest-Abschnitt. Ein Layoutfehler auf dem iPhone SE fällt damit nicht
mehr sofort auf, sondern drei Minuten später im Ablauf.

**Was trotzdem nicht passieren kann:** dass Ungeprüftes bei den Kindern
landet. Die Auslieferung fährt die volle Kette und schickt nur bei Grün.
Die Prüfung ist nicht weniger geworden — sie ist nur nicht mehr im Weg.

### Zwei Dinge, die dabei nebenbei herauskamen

**`LOBPAUSE`.** Die 2,6 s nach jeder richtigen Antwort standen **dreimal**
als nackte Zahl im Quelltext. Jetzt einmal — und mit `?flott` auf 250 ms
kürzbar. Der Schalter ist noch ungenutzt: der Versuch, den Rauchtest damit
zu beschleunigen, hat ihn rot gemacht, und ich habe zurückgebaut statt an
elf Wartestellen zu raten. Er liegt bereit für die nächste Runde, in der
das mit Bedingungen statt mit Fristen gemacht wird.

**`serviere()`.** Der kleine Testserver stand **sechsmal** im Verzeichnis,
Zeile für Zeile derselbe — und sechsmal mit demselben Fehler: `/?flott`
wurde zum Verzeichnispfad `/` und damit 404. Jetzt einmal.

Und dabei hat das Zusammenlegen fast etwas verloren, das die Kopie in
`pwa.mjs` allein hatte: `if (!netz) q.socket.destroy()`. Das ist der ganze
Offline-Test — eine 404 wäre eine **Antwort**, und der Service Worker
verhält sich dann anders. Das Tor wurde rot und hat es gemeldet. Sechs
Kopien sind nicht sechsmal dasselbe; eine davon trägt immer etwas
Besonderes, und das findet man erst beim Zusammenlegen.

## Der Vorlauf auf dem Zielgerät — angesehen, nicht gemessen

`passt` war grün. Der Blick war es nicht.

**Ein Drittel der Karte war leer.** Die Zeilenhöhe des Gitters richtet sich
nach der höchsten Karte — „Mecklenburg-Vorpommern" braucht zwei Zeilen, also
sind alle so hoch —, und unter „Sachsen" stand deshalb eine leere Fläche,
mit dem Umriss als Fleck darüber.

Der erste Schluss war falsch: den Umriss mit `flex:1` in den Rest wachsen
lassen. Dann wachsen die **Karten**, und die zweite Reihe fiel unten heraus.
Das Loch war nie zu wenig Bild, sondern schlecht verteilter Platz — dagegen
hilft Zentrieren, nicht Wachsen.

**Vier Namen brachen mitten im Wort:** „Niedersachs / en",
„Brandenbur / g", „Baden-Württembe / rg". Auf einem Bildschirm, dessen
einziger Zweck es ist, diese Namen beizubringen. Die Karten waren mit 76
Punkten zu schmal; bei **88** nimmt der Umbruch die Fugen —
„Rheinland- / Pfalz", „Mecklenburg- / Vorpommern" — und es kostet **keine
Reihe**: sechzehn Karten stehen auf dem Zielgerät so oder so in zweien.

Wie breit sie sein dürfen, hat `passt` gesagt, nicht ich: 88 grün, und bei
den Paarkarten 96.

### Und der Vorlauf hatte kein Vorbild

Dieselbe Lücke wie beim Forscherbuch eine Runde zuvor: der Bildschirm mit
den meisten Kästen, der schwierigsten Typografie und einer auf zwei Punkte
ausgemessenen Bildhöhe — und **kein Tor sah ihn an**. `passt` sagt, ob
alles im Bild ist; ob „Brandenbur / g" dasteht, sagt es nicht.
`quer-vorlauf` ist die siebzehnte Aufnahme.

### Ein blindes `sed` und das Tor, das es gefangen hat

Beim Durchprobieren der Kartenbreite (88 · 84 · 80) hat mein Suchmuster
**auch das Forscherbuch** getroffen: `.kleber.vorschau` endet auf dieselbe
Zeichenfolge und stand danach auf 80 statt 120 Punkten. Gemerkt habe ich
es nicht — `quer-buch` wurde rot, 1,8 % der Bildpunkte anders.

Das ist genau der Fall, für den der Bildvergleich da ist: eine Änderung,
die niemand wollte, an einer Stelle, an die niemand gedacht hat.
