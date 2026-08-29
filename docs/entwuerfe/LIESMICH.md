# Entwürfe für R2 — die Kachelsprache

Drei Fassungen der **drei Wahlbildschirme** (Profilwahl, Weltenwahl,
Ebenenwahl), gebaut mit den echten Marken, der echten Schrift und den
echten Umrissen, aufgenommen auf **844 × 390** — dem Zielgerät.

| | Idee | Preis |
|---|---|---|
| **A · Ruhig** | Weiße Karte, Farbe nur als Kante und im Zeichen. **Ein** Fortschritt (Ring mit Zahl) statt Sterne + Aufkleber + Balken. | Am wenigsten „Spiel". Ein Kind, das nicht liest, hat weniger, woran es sich festhält. |
| **B · Bild** | Jede Kachel zeigt **ihren echten Umriss** als Wasserzeichen. Erkennbar, bevor man liest. | Der Umriss muss vom Text freigehalten werden — und er sagt nichts über den Fortschritt. |
| **C · Groß** | Die heutige Richtung zu Ende gebracht: volle Farbe, große Schrift, der Stand in **einer** Zeile statt im gedrängten Fuß. | Acht satte Farbflächen nebeneinander sind viel. Die Kontraste sind hier am knappsten. |

Neu erzeugen: `node docs/entwuerfe/bauen.mjs` (braucht einen Bau in
`dist/`). Das ist **kein Teil der App und kein Teil der Torkette** — nur
zum Ansehen.

## Was beim Ansehen aufgefallen ist

Vier Mängel steckten schon in der ersten Fassung dieser Entwürfe, und drei
davon hätte später ein Tor gefunden — der vierte keins:

1. Der Umriss lief in **B** über das Wort „Bundesländer". Ein
   Überlappungsfehler im Entwurf gegen Überlappungen.
2. **B** gab nur einer von acht Kacheln ein Bild. Eine Idee, die zu einem
   Achtel gezeigt wird, ist nicht zu beurteilen.
3. Die leeren Sterne verschwanden in **C** auf dem satten Grund. Sie nehmen
   jetzt die Farbe ihrer Umgebung — `lesbarkeit` hätte das sonst gemeldet.
4. In **A** blieb bei null Fortschritt ein Punkt stehen: eine runde
   Strichkappe auf einem Bogen der Länge null.

Und: „1 Übungen" stand auf der Rechnen-Karte.

---

## Gewählt: B — mit weißem Grund

> *„B aber anderer Hintergrund, nicht das helle Blau, am besten weiß"*

Der helle Blauton ist eine **begründete Entscheidung aus einer früheren
Runde**. In `src/marken/marken.css` steht daneben:

> *„Der Grund ist nicht mehr fast-weiss, sondern ein kuehler heller Ton mit
> einem Hauch Farbe — und er bekommt einen Verlauf. Eine flache weisse
> Flaeche ist der schnellste Weg, eine App aelter aussehen zu lassen, als
> sie ist."*

Euer Wunsch geht vor; der Satz steht hier, damit später niemand rätselt,
warum die Entscheidung gedreht wurde.

**Und Weiß hat eine Folge, die man sehen muss:** `--papier` *ist* schon
reines Weiß. Auf weißem Grund verlieren weiße Karten ihre Trennung —
überall in der App, nicht nur auf den drei Wahlbildschirmen. Drei
Fassungen lösen das verschieden:

| | Grund | Kachel | Preis |
|---|---|---|---|
| **W1 · Reinweiß** | reines Weiß, kein Verlauf | unverändert (16 % Tönung) | Die Tönung trägt allein. Am ruhigsten — und am blassesten. |
| **W2 · Reinweiß, kräftigere Kachel** | reines Weiß | 26 % Tönung, 1,5 px Rand, Umriss deutlicher | Farbiger und griffiger. Näher an „bunt", weiter weg von „ruhig". |
| **W3 · Fast weiß** | ein Hauch Ton, kaum sichtbarer Verlauf | unverändert | Liest sich als Weiß, behält Tiefe. Der Kompromiss — und damit auch halb der alte Zustand. |

**Was in R2 daran hängt**, wenn der Grund wirklich weiß wird — es ist
nicht eine Zeile:

- `--grund` und `--grund-2` sind **globale** Marken. Jeder Bildschirm
  ändert sich mit, nicht nur die drei Wahlbildschirme.
- Weiße Karten auf weißem Grund brauchen ihre Trennung aus **Rand oder
  Schatten**. Wo heute nur die Fläche trennt, muss etwas nachrücken.
- `lesbarkeit` rechnet Kontraste gegen den Grund. Weiß ist heller als der
  heutige Grund, also werden die meisten Werte **besser** — aber die
  hellen Töne (`--tinte-3`, die Aufkleberzahl) sind schon heute knapp und
  müssen neu gemessen werden.
- Der **Abendmodus** hat einen eigenen Grund und bleibt unberührt.
- Alle 15 Aufnahmen in `tor/vorbilder/` ändern sich — bewusst erneuern und
  im selben Commit einchecken.
