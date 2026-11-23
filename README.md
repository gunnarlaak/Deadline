# Deadline 1.1 – tähtaegade jälgija

Eestikeelne mobiilis ja arvutis töötav veebirakendus eksamite, kodutööde ja projektide tähtaegade jälgimiseks.

## Võimalused
- Tähtaegade lisamine, muutmine, kustutamine, tehtuks märkimine ning tähtaegade loend ja kalender.
- Tähtaegade esiletõstmine ja automaatne päevade arvestus.
- JSON-varukoopia (tavaline) ning **AES-256-GCM-ga krüptitud JSON-varukoopia** (parooliga).
- Krüptitud varukoopia taastamine, pärand-varukoopiate import.
- .ics-kalendrisse eksportimine.
- Offline-tugi pärast esmast laadimist (PWA).

## 1.1 turvaparandused
- `Content-Security-Policy` metatagiga piiratud skriptid, stiilid, ühendused ja objektid. Kõik JavaScripti ja CSS-i failid on lokaalsed, väliseid teeke pole.
- Kaitse pahatahtlike või vigaste ülesandetüüpide vastu (`Object.hasOwn`).
- Muudatus loetakse salvestatuks alles pärast edukat `localStorage` kirjutamist.
- Importimisel vigased kirjed ei asenda olemasolevaid ülesandeid.
- Valikulised krüptitud varukoopiad: PBKDF2-SHA256 (310 000 iteratsiooni), juhuslik sool ja AES-256-GCM. Krüpteerimine käib seadmes; parooli serverile ei saadeta.
- Offline-teenusetöötaja puhverdab ainult äpi enda fikseeritud failid.

## Olulised piirangud
- **Kohalikud ülesanded on brauseri `localStorage`-s endiselt krüpteerimata.** Parooliga on kaitstud ainult allalaaditud krüptitud varukoopia.
- `github.io` projektikaustad jagavad sama päritolu (origin) salvestusruumi. Sama konto teises projektis töötav JavaScript võib pääseda juurde Deadline'i andmetele. Paremaks eraldatuseks kasuta **eraldi domeeni või alamdomeeni**.
- GitHub Pages ei lase staatilise projekti kaudu määrata täiendavaid kohandatud HTTP-turvapäiseid (näiteks CSP `frame-ancestors`). CSP on siin metatagina.
- Brauseri andmete kustutamisel kaovad tähtajad; tee regulaarselt varukoopiaid. Kadunud krüptoparooli ei ole võimalik taastada.
- Ei ole kasutajakontosid, sünkroonimist ega tõuketeavitusi.
- Avalik lähtekood ei sisalda kasutajate tähtaegu.

## Avaldamine GitHub Pagesis
1. Repository → Settings → Pages.
2. Source: Deploy from a branch → `main` → `/(root)` → Save.
3. Ava `https://gunnarlaak.github.io/Deadline/`.

**Äpi kasutamiseks pole serverit ega API-võtit vaja.**