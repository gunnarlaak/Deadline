# Deadline 2.0 – tähtajad ja GradeCalc

Eestikeelne tudengi veebirakendus GitHub Pagesi jaoks. Töötab telefonis ja arvutis, pärast esmast laadimist ka võrguühenduseta.

## Tähtajad
- Eksamite, kodutööde ja projektide tähtajad; lisamine, muutmine, kustutamine ja tehtuks märkimine.
- Kiireloomulised tööd, päevade loendur, kalender, otsing ja filtreerimine.
- ICS-kalendrisse eksportimine.

## GradeCalc (uus 2.0)
- Lisa kuni 50 ainet ja igasse kuni 60 hindekomponenti.
- Sisesta tööde tüübid, tulemused protsentides (0–100) ja osakaalud (0,1–100%).
- Määra iga aine soovitud lõpptulemus protsentides (0–100).
- Arvuta tehtud tööde kaalutud keskmine, seni kogutud lõpphinde punktid ja hinnatud tööde osakaal.
- Kui kaalud annavad täpselt 100% ja **ainult üks hinne on teadmata ning see on eksam**, arvuta minimaalne vajalik eksamitulemus.
- Eraldi teated puuduva või liiga suure osakaalude summa, rohkemate hindamata tööde ning võimatu eesmärgi korral.
- Eesmärgi juba saavutamisel näita, et matemaatiliselt piisab eksamil 0%-st; õppeaine läbimise eraldi miinimumnõudeid ei arvestata.
- Näidisarvutus: 80% × 30% + 70% × 30% + eksam × 40% = 80%, mistõttu eksamil on vaja vähemalt **87,5%**.

### Arvutus
Lõpphinne = Σ(töö tulemus (%) × töö osakaal (%)) / 100.

Eksamilt vajalik tulemus = (soovitud lõpptulemus − seni kogutud kaalutud punktid) × 100 / eksami kaal (%).

Tulemust näidatakse ülespoole ümardatult 0,1 protsendipunkti täpsusega, et näidatud hinne kindlasti vastaks eesmärgile.

**NB!** Mõnel kursusel on lisaks üldisele keskmisele eraldi eksami või tööde läbimise miinimumnõuded. GradeCalc ei arvesta neid automaatselt. 0–100% ei võrdu automaatselt Eesti 0–5 hindeskaalaga; hinnete piirid sõltuvad koolist.

## Andmed, varukoopia ja turvalisus
- Tähtajad salvestatakse senisesse `deadline.student.tasks.v1` võtmesse, nii et 1.1 andmed säilivad.
- GradeCalc ained salvestatakse eraldi `deadline.student.grades.v2` võtmesse (`localStorage`).
- Nii tavalised kui ka AES-256-GCM-ga krüptitud varukoopiad sisaldavad nüüd **tähtaegu ja hindeid**.
- Vanade, versiooni 1 varukoopiate import jätab olemasolevad ainehinded puutumata.
- Krüptitud varukoopia: PBKDF2-SHA256 (310 000 iteratsiooni), juhuslik sool, AES-256-GCM; parooli serverisse ei saadeta.
- CSP keelab välised skriptid ja ühendused; kasutajatekst HTML-iks renderdamisel kodeeritakse; andmeid valideeritakse ka importimisel.
- Kõik kasutaja andmed jäävad brauserisse krüpteerimata. **Sama `gunnarlaak.github.io` päritolu eri projektid jagavad localStorage'i** – eraldi domeen aitab isolatsioonile kaasa. Krüptitud on ainult allalaaditud krüptitud varukoopia.
- Äpp ei paku sisselogimist, seadmetevahelist sünkroonimist ega automaatseid teavitusi.

## GitHub Pages
Settings → Pages → Build and deployment → **Deploy from a branch**, branch **main**, folder **/(root)** → Save.

Siht-URL: https://gunnarlaak.github.io/Deadline/

## Failid
`index.html`, `styles.css`, `app.js`, `grade-math.js`, `grades.js`, `security.js`, `sw.js`, `manifest.webmanifest`, `icons/`.