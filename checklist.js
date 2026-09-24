/* Keuzelijsten voor het formulier "Medewerker toevoegen".
   Regels toevoegen of weghalen mag; let op de aanhalingstekens en de komma's. */
var FUNCTIES = [
  "Junior accountmanager",
  "Senior accountmanager",
  "Accountmanager retail",
  "Verkoop medewerker",
  "Verkoop binnendienst",
  "Inkoop",
  "Imports",
  "Productiemedewerker",
  "Kwaliteitsmedewerker",
  "Expeditie medewerker",
  "Expeditie leidinggevende",
  "Chauffeur",
  "Administratie medewerker",
  "Marketing medewerker",
  "Stagiair"
];

var AFDELINGEN = [
  "Verkoop",
  "Inkoop",
  "Kwaliteit",
  "Expeditie",
  "Transport",
  "Douane/imports",
  "Administratie",
  "Marketing"
];

/* Standaardchecklist. Pas dit bestand aan om de fases en taken te wijzigen.
   dag = aantal dagen na de startdatum; negatief is voor de startdatum. */
var DEFAULT_STATE = {
  "version": 1,
  "updated": "2026-09-21T09:23:01.778Z",
  "phases": [
    {
      "id": "pre",
      "naam": "Pre-boarding",
      "van": -14,
      "tot": -1
    },
    {
      "id": "dag1",
      "naam": "Eerste dag",
      "van": 0,
      "tot": 0
    },
    {
      "id": "week1",
      "naam": "Eerste week",
      "van": 1,
      "tot": 7
    },
    {
      "id": "maand1",
      "naam": "Eerste maand",
      "van": 8,
      "tot": 30
    },
    {
      "id": "m23",
      "naam": "Maand 2 en 3",
      "van": 31,
      "tot": 90
    }
  ],
  "items": [
    {
      "id": "p1",
      "fase": "pre",
      "titel": "Welkomstmail met starttijd, adres, parkeren en programma dag 1",
      "wie": "HR",
      "dag": -7
    },
    {
      "id": "p2",
      "fase": "pre",
      "titel": "Buddy koppelen en informeren",
      "wie": "Leidinggevende",
      "dag": -7
    },
    {
      "id": "p3",
      "fase": "pre",
      "titel": "Account, laptop, telefoon en toegangspas klaarzetten",
      "wie": "IT",
      "dag": -3
    },
    {
      "id": "p4",
      "fase": "pre",
      "titel": "Team laten weten wie er komt en wanneer",
      "wie": "Leidinggevende",
      "dag": -3
    },
    {
      "id": "p5",
      "fase": "pre",
      "titel": "Werkplek inrichten",
      "wie": "Facilitair",
      "dag": -2
    },
    {
      "id": "d1",
      "fase": "dag1",
      "titel": "Ontvangst en rondleiding",
      "wie": "Buddy",
      "dag": 0
    },
    {
      "id": "d2",
      "fase": "dag1",
      "titel": "Kennismaking met het team",
      "wie": "Leidinggevende",
      "dag": 0
    },
    {
      "id": "d3",
      "fase": "dag1",
      "titel": "Uitleg systemen (ERP, mail, Teams)",
      "wie": "IT",
      "dag": 0
    },
    {
      "id": "d4",
      "fase": "dag1",
      "titel": "Veiligheids- en hygiëne-instructie",
      "wie": "QA",
      "dag": 0
    },
    {
      "id": "d5",
      "fase": "dag1",
      "titel": "Afsluitend gesprek: hoe was je eerste dag?",
      "wie": "Leidinggevende",
      "dag": 0
    },
    {
      "id": "w1",
      "fase": "week1",
      "titel": "Meelopen met collega's",
      "wie": "Buddy",
      "dag": 3
    },
    {
      "id": "w2",
      "fase": "week1",
      "titel": "Uitleg producten en productgroepen",
      "wie": "Buddy",
      "dag": 4
    },
    {
      "id": "w3",
      "fase": "week1",
      "titel": "Kennismaking met inkoop, verkoop, logistiek, finance en QA",
      "wie": "Leidinggevende",
      "dag": 5
    },
    {
      "id": "w4",
      "fase": "week1",
      "titel": "Eerste kleine eigen taak",
      "wie": "Leidinggevende",
      "dag": 5
    },
    {
      "id": "w5",
      "fase": "week1",
      "titel": "Evaluatie eerste week",
      "wie": "Leidinggevende",
      "dag": 7
    },
    {
      "id": "m1",
      "fase": "maand1",
      "titel": "Doelen voor maand 2 en 3 vastleggen",
      "wie": "Leidinggevende",
      "dag": 14
    },
    {
      "id": "m2",
      "fase": "maand1",
      "titel": "Kerntaak zelfstandig uitvoeren met begeleiding",
      "wie": "Buddy",
      "dag": 21
    },
    {
      "id": "m3",
      "fase": "maand1",
      "titel": "Check-in met buddy",
      "wie": "Buddy",
      "dag": 28
    },
    {
      "id": "m4",
      "fase": "maand1",
      "titel": "30-dagengesprek",
      "wie": "Leidinggevende",
      "dag": 30
    },
    {
      "id": "q1",
      "fase": "m23",
      "titel": "Feedback ophalen bij collega's",
      "wie": "Leidinggevende",
      "dag": 60
    },
    {
      "id": "q2",
      "fase": "m23",
      "titel": "Evaluatiegesprek einde proeftijd",
      "wie": "Leidinggevende",
      "dag": 75
    },
    {
      "id": "q3",
      "fase": "m23",
      "titel": "Medewerker geeft feedback op de onboarding",
      "wie": "HR",
      "dag": 90
    }
  ],
  "hires": []
};
