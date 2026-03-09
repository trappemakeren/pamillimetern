# På Millimetern Møbelsnekkeri – Nettside

Live: https://trappemakeren.github.io/pamillimetern/
Fremtidig domene: https://pamillimetern.no

---

## Versjonshistorikk

| Versjon | Dato | Beskrivelse |
|---------|------|-------------|
| v1.0.3 | 2026-03-09 | B2B-stripe slankere, header endret til sticky (ikke fixed) |
| v1.0.2 | 2026-03-09 | Fiks: alle absolutte paths prefixet med /pamillimetern/ for GitHub Pages |
| v1.0.1 | 2026-03-09 | Fiks: base href-tag og relative CSS/JS-stier i undermapper |
| v1.0.0 | 2026-03-09 | Ny B2B-seksjon: /fagfolk/ for entreprenører og arkitekter |

_(Eldre commits uten versjonsnummer er gjort før versjonering ble innført)_

---

## Teknisk stack

| Komponent | Løsning | Kostnad |
|-----------|---------|---------|
| Hosting | GitHub Pages | Gratis |
| Kode | Ren HTML/CSS/JS | – |
| Kontaktskjema | Formspree (ID: `mzdjddbw`) | Gratis inntil 50/mnd |
| Portfolio/blogg | Google Sheets → CSV | Gratis |
| Fonter | Cormorant Garamond + DM Sans (Google Fonts) | Gratis |

---

## Filstruktur

```
/
├── index.html              Forside (NO)
├── om-oss.html
├── kjokken.html
├── garderobe.html
├── mobeler.html
├── kontakt.html
├── portfolio.html
├── blogg.html
├── guide.html              Kundeguide / forespørselsskjema
├── 404.html
├── .nojekyll               Nødvendig for GitHub Pages
├── css/
│   ├── main.css            Globale stiler og variabler
│   ├── fagfolk.css         B2B-stripe og fagfolk-seksjon
│   ├── blogg.css
│   ├── guide.css
│   ├── kontakt.css
│   ├── portfolio-page.css
│   ├── tjeneste.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── portfolio.js
│   ├── portfolio-page.js
│   ├── blogg.js
│   ├── blogg-en.js
│   └── guide.js
├── blogg/                  Norske bloggartikler
├── fagfolk/                B2B-seksjon for entreprenører og arkitekter
│   └── index.html
└── en/                     Engelsk versjon
    ├── index.html, about.html, kitchen.html, wardrobe.html
    ├── furniture.html, contact.html, portfolio.html
    ├── guides.html, request.html
    └── blog/
```

---

## Koble til eget domene (pamillimetern.no)

### Når domenet er klart:
1. GitHub → Settings → Pages → Custom domain → skriv `pamillimetern.no` → Save
2. Hos Domeneshop: legg inn DNS-postene GitHub viser
3. I koden: fjern `<base href="/pamillimetern/">` fra alle HTML-filer og bytt alle `/pamillimetern/`-stier tilbake til `/`

---

## Google Sheets – portfolio

CSV-URL er satt i `js/portfolio-page.js`.

Kolonner i arket:
`prosjektnr | tittel | kategori | beskrivelse | bilde_url | bilde_url_2 | bilde_url_3 | dato | fremhevet | publiser | mappe_id`

Sett `publiser=JA` for å vise et prosjekt. `fremhevet=JA` vises øverst.

---

## Formspree – kontaktskjema

Form ID: `mzdjddbw`
Endpoint: `https://formspree.io/f/mzdjddbw`

Brukes i: `kontakt.html`, `guide.html`, `en/contact.html`, `en/request.html`, `fagfolk/index.html`

B2B-forespørsler fra `/fagfolk/` er merket med `kilde: fagfolk` i skjemadata.

---

## Oppdatere innhold

### Portfolio
Oppdater Google Sheets-arket. Endringer vises umiddelbart på siden.

### Nye bloggartikler
1. Lag ny `.html` i `/blogg/` (norsk) og `/en/blog/` (engelsk)
2. Legg til lenke i `blogg.html` og `en/guides.html`
3. Husk `<base href="/pamillimetern/">` i `<head>`

### Deploy
Claude committer direkte via git. Siden oppdaterer seg automatisk innen 1–2 minutter etter push.
