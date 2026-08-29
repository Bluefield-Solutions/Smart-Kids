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
