# På Millimetern Møbelsnekkeri – Nettside

## Teknisk oversikt
- **Hosting:** GitHub Pages (gratis, ingen credits)
- **Kode:** Ren HTML/CSS/JS
- **Skjema:** Formspree (gratis inntil 50 innleveringer/mnd)
- **Innhold:** Google Sheets → CSV (portfolio og blogg)
- **Fonter:** Cormorant Garamond + DM Sans (Google Fonts)

---

## Komme i gang (første gangs oppsett)

### 1. Opprett GitHub-konto
Gå til github.com og registrer deg gratis.

### 2. Opprett et nytt repository
1. Klikk New (grønn knapp øverst til høyre)
2. Gi det navn: pamillimetern
3. Velg Public
4. Klikk Create repository

### 3. Last opp filene
1. Pakk ut ZIP-filen du laster ned fra Claude
2. Gå til ditt nye repository på GitHub
3. Klikk Add file → Upload files
4. Dra alle filene og mappene inn i vinduet
5. Klikk Commit changes

Viktig: Pass på at .nojekyll-filen er med (den er skjult men ligger i ZIP-en).

### 4. Aktiver GitHub Pages
1. Gå til Settings i repository
2. Klikk Pages i venstremenyen
3. Under Source, velg Deploy from a branch
4. Velg branch: main, mappe: / (root)
5. Klikk Save

Siden er live på: https://DITTBRUKERNAVN.github.io/pamillimetern

---

## Formspree – kontaktskjema

### Oppsett (én gang)
1. Gå til formspree.io og registrer deg gratis
2. Klikk New Form
3. Kopier Form endpoint: https://formspree.io/f/DITTID

### Legg inn ID i koden
Finn og erstatt DIN_FORMSPREE_ID i disse fire filene:
- kontakt.html
- guide.html
- en/contact.html
- en/request.html

### E-postvarsler
Formspree sender automatisk e-post til registrert adresse.
Endre under Notifications i Formspree-dashboardet.

---

## Koble til eget domene (pamillimetern.no)

### I GitHub
1. Settings → Pages → Custom domain
2. Skriv inn pamillimetern.no og klikk Save
3. GitHub viser hvilke DNS-poster du trenger

### Hos Domeneshop.no
Logg inn og legg inn DNS-postene GitHub viser deg under DNS for pamillimetern.no.

---

## Oppdatere innhold

### Portfolio
Oppdater Google Sheets-arket. CSV-URL er satt i js/portfolio-page.js.

### Nye bloggartikler
Lag ny HTML i /blogg/ (NO) og /en/blog/ (EN).
Oppdater blogg.html og en/guides.html med lenke til ny artikkel.

### Deploye endringer
Rediger filen direkte på GitHub (blyant-ikon) og klikk Commit changes.
Siden oppdaterer seg automatisk innen 1-2 minutter.

---

## Filstruktur

```
/
├── index.html              Forside (NO)
├── om-oss.html, kjokken.html, garderobe.html, mobeler.html
├── kontakt.html, portfolio.html, blogg.html, guide.html
├── 404.html
├── .nojekyll               Nødvendig for GitHub Pages
├── css/
├── js/
├── blogg/                  Norske bloggartikler
└── en/                     Engelsk versjon
    ├── index.html, about.html, kitchen.html, wardrobe.html
    ├── furniture.html, contact.html, portfolio.html
    ├── guides.html, request.html
    └── blog/
```
