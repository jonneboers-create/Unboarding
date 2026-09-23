# Onboarding-dashboard

Dashboard om de onboarding van nieuwe medewerkers bij te houden. Per medewerker een checklist in
vijf fases (pre-boarding, eerste dag, eerste week, eerste maand, maand 2 en 3), met deadlines die
zichzelf uitrekenen vanaf de startdatum. Wat over tijd is, kleurt rood.

Geen server, geen database, geen build-stap: het zijn vier statische bestanden die je op GitHub
Pages kunt zetten.

## Wat zit waar

| Bestand | Inhoud |
|---|---|
| `index.html` | Het geraamte van de pagina. Laadt de andere bestanden. |
| `styles.css` | Alle opmaak, inclusief kleuren voor licht en donker thema. |
| `checklist.js` | De standaardchecklist: fases en taken. **Dit bestand pas je aan om de inhoud te wijzigen.** |
| `app.js` | De logica: opslaan, datums uitrekenen, schermen tekenen. |
| `docs/onboarding-sjabloon-onenote.docx` | Dezelfde checklist als Word-sjabloon om in OneNote te plakken. |
| `HANDLEIDING.md` | Uitleg voor de gebruikers: HR, IT en leidinggevenden. |
| `.nojekyll` | Zegt tegen GitHub Pages dat het de bestanden niet hoeft te verwerken. |

## Lokaal bekijken

Dubbelklik op `index.html`. Het werkt direct in je browser, zonder installatie.

## Op GitHub Pages zetten

1. Maak op github.com een nieuwe repository aan, bijvoorbeeld `onboarding`. Kies **Public** als je
   de link met collega's wilt delen; met een gratis account werkt Pages alleen voor publieke
   repositories.
2. Klik op **Add file > Upload files**, sleep alle bestanden en de map `docs` erin en klik op
   **Commit changes**.
3. Ga naar **Settings > Pages**. Zet *Source* op **Deploy from a branch**, *Branch* op **main** en
   de map op **/ (root)**. Klik op **Save**.
4. Wacht een minuut en ververs. Bovenaan verschijnt de link:
   `https://<gebruikersnaam>.github.io/onboarding/`

Via de opdrachtregel gaat het zo:

```bash
git init
git add .
git commit -m "Onboarding-dashboard"
git branch -M main
git remote add origin https://github.com/<gebruikersnaam>/onboarding.git
git push -u origin main
```

Daarna nog stap 3 hierboven. Latere wijzigingen zet je live met:

```bash
git add .
git commit -m "Checklist aangepast"
git push
```

Binnen een minuut staat de nieuwe versie online.

## De checklist aanpassen

Open `checklist.js`. Daarin staan twee lijsten:

- `phases`: de fases, met `van` en `tot` in dagen ten opzichte van de startdatum.
- `items`: de taken, elk met `fase`, `titel`, `wie` en `dag`. Bij `dag` is `-7` zeven dagen vóór de
  startdatum en `14` veertien dagen erna.

Een taak toevoegen doe je zo:

```js
{ "id": "w6", "fase": "week1", "titel": "Rondleiding koelhuis", "wie": "Logistiek", "dag": 2 },
```

Geef elke taak een `id` dat verder nergens voorkomt. Taken die maar voor één medewerker gelden,
voeg je niet hier toe maar in het dashboard zelf, met **+ Punt toevoegen** onder een fase.

Let op: een browser waarin al gegevens zijn opgeslagen, blijft zijn eigen opgeslagen versie
gebruiken. Exporteer dan eerst, pas het JSON-bestand aan en importeer het weer.

## Waar staan de gegevens

In de opslag van de browser (localStorage), op het apparaat waar je werkt. Er gaat niets naar
GitHub of naar een server. Dat betekent ook dat een collega die de link opent, met een leeg
dashboard begint en jouw ingevulde medewerkers niet ziet.

Gebruik daarom **Exporteren** en **Importeren** linksonder in het dashboard. Exporteren maakt een
JSON-bestand met alles erin, als back-up of om aan een collega te geven. Importeren leest zo'n
bestand weer in en vervangt wat er in die browser stond.

Wil je dat iedereen dezelfde, gedeelde stand ziet, dan is een kleine backend nodig, bijvoorbeeld
GitHub Actions met het JSON-bestand in de repository, of een dienst als Supabase.

## Licentie

MIT, zie `LICENSE`.
