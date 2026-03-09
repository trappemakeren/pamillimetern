# På Millimetern Møbelsnekkeri – Nettside

Live: https://trappemakeren.github.io/pamillimetern/
Fremtidig domene: https://pamillimetern.no

---

## Nettstedsstruktur

```
pamillimetern.no/
│
├── index.html                     Forside
├── om-oss.html                    Om verkstedet
├── kjokken.html                   Tjeneste: Kjøkken
├── garderobe.html                 Tjeneste: Garderobe
├── mobeler.html                   Tjeneste: Møbler
├── portfolio.html                 Alle prosjekter (galleri)
├── blogg.html                     Oversikt over guider/artikler
├── guide.html                     Kundeguide / forespørselsskjema
├── kontakt.html                   Kontaktside
├── 404.html                       Feilside
│
├── blogg/
│   ├── hva-koster-skreddersydd-kjokken.html
│   ├── ikea-vs-snekker-kjokken.html
│   ├── hvor-lang-tid-tar-kjokken.html
│   ├── materialer-garderobe.html
│   ├── bestille-skreddersydde-mobeler.html
│   └── velge-kjokkenfront.html
│
├── fagfolk/
│   └── index.html                 B2B-landingsside (entreprenører/arkitekter)
│
└── en/                            Engelsk versjon (hreflang)
    ├── index.html
    ├── about.html
    ├── kitchen.html
    ├── wardrobe.html
    ├── furniture.html
    ├── portfolio.html
    ├── guides.html
    ├── contact.html
    ├── request.html
    └── blog/
        ├── what-does-a-custom-kitchen-cost.html
        ├── ikea-vs-custom-kitchen.html
        ├── how-long-does-a-kitchen-take.html
        ├── wardrobe-materials.html
        ├── ordering-custom-furniture.html
        └── choosing-kitchen-fronts.html
```

---

## Designmanual

### Fargepalett

| Navn         | Hex       | Bruk                                      |
|--------------|-----------|-------------------------------------------|
| Pergament    | `#F5F0E8` | Bakgrunn, primær                          |
| Mørk eik     | `#1C1915` | Tekst, header, mørke seksjoner            |
| Terrakotta   | `#8B5E3C` | Aksent, CTA, kategorimerker               |
| Lys gull     | `#C49A6C` | Sekundæraksent, B2B-stripe, hover         |
| Mellomsort   | `#5C5449` | Brødtekst (sekundær)                      |
| Lys grå      | `#9C9288` | Diskret tekst, etiketter                  |
| Delikat linje| `#DDD8CE` | Skillelinjer, kanter                      |
| Hvit         | `#FDFAF5` | Kort-bakgrunn, kontrast mot mørkt         |

CSS-variabler:
```css
--clr-bg:        #F5F0E8
--clr-bg-dark:   #1C1915
--clr-ink:       #1C1915
--clr-ink-mid:   #5C5449
--clr-ink-light: #9C9288
--clr-accent:    #8B5E3C
--clr-accent-lt: #C49A6C
--clr-line:      #DDD8CE
--clr-white:     #FDFAF5
```

---

### Typografi

| Rolle           | Font                  | Vekt       | Bruk                                  |
|-----------------|-----------------------|------------|---------------------------------------|
| Display/titler  | Cormorant Garamond    | 300–500    | H1, H2, logotext, sitater             |
| Kursiv display  | Cormorant Garamond    | italic     | Fremhevede ord i titler               |
| Brødtekst       | DM Sans               | 300–500    | Avsnitt, navigasjon, labels           |

```css
--font-display: 'Cormorant Garamond', Georgia, serif
--font-body:    'DM Sans', system-ui, sans-serif
```

**Størrelser (typisk):**

| Element            | Størrelse      | Vekt  | Tracking         |
|--------------------|----------------|-------|------------------|
| H1 (hero)          | clamp(48–76px) | 400   | -0.01em          |
| H2 (seksjon)       | clamp(32–52px) | 400   | –                |
| H3 (kort/tittel)   | 20–28px        | 400   | –                |
| Brødtekst          | 14–16px        | 300   | –                |
| Etiketter/labels   | 10–11px        | 400   | 0.15–0.2em       |
| Navigasjon         | 13px           | 400   | 0.06em           |
| CTA-knapper        | 12px           | 500   | 0.10–0.12em      |

---

### Tone og språkbruk

- **Språk:** Norsk bokmål (primær), engelsk (sekundær under `/en/`)
- **Tone:** Profesjonell og varm – snekkerens stemme, ikke et selskaps
- **Unngå:** "høy kvalitet", "konkurransedyktige priser", "ledende aktør"
- **Bruk heller:** Konkrete og sanselige beskrivelser – materialer, teknikker, tid, håndverk
- **CTA-språk:** Naturlig og ikke masete – "Start din forespørsel", "Se våre arbeider"
- **B2B-tone:** Mer direkte og teknisk, men aldri kald

---

### Layout og komposisjon

- **Maks bredde:** `1280px` (`--max-w`)
- **Grid:** CSS Grid, typisk 2- eller 3-kolonner
- **Gap mellom kort:** `2px` (tett mosaikk-estetikk)
- **Seksjonspadding:** `80–120px` vertikalt, `80px` horisontalt
- **Avrunding:** `2–4px` (`--radius-sm/md`) – svært subtilt, nær rektangulært

---

### Knapper

| Type         | Stil                                              |
|--------------|---------------------------------------------------|
| Primær       | Mørk bakgrunn (`#1C1915`), hvit tekst, uppercase  |
| Ghost        | Transparent, border-bottom, ingen ramme           |
| Outline      | Tynn ramme i gull, brukes på mørk bakgrunn        |
| CTA (nav)    | Svart, compact, uppercase, høyrejustert i nav     |

Hover: primær → terrakotta (`#8B5E3C`)

---

### Animasjon

- **Transition standard:** `0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- **Hover på kort:** bakgrunn → `#1C1915`, tekst → `#FDFAF5`
- **Pil-ikoner:** translateX(3–4px) ved hover
- **Scroll-indikator:** puls-animasjon (opacity + scaleY)

---

### B2B-stripe

- Plassering: øverst på alle sider, over navigasjonsmenyen
- Bakgrunn: `#1C1915` (mørk eik)
- Tekst: `#C49A6C` (lys gull), 10px, letter-spacing 0.1em
- Høyre-justert lenke: «For entreprenører og arkitekter →»
- Lander på: `/fagfolk/`

---

## Versjonshistorikk

| Versjon | Dato       | Beskrivelse |
|---------|------------|-------------|
| v1.0.3  | 2026-03-09 | B2B-stripe slankere, header endret til sticky (ikke fixed) |
| v1.0.2  | 2026-03-09 | Fiks: alle absolutte paths prefixet med /pamillimetern/ for GitHub Pages |
| v1.0.1  | 2026-03-09 | Fiks: base href-tag og relative CSS/JS-stier i undermapper |
| v1.0.0  | 2026-03-09 | Ny B2B-seksjon: /fagfolk/ for entreprenører og arkitekter |

_(Eldre commits uten versjonsnummer er gjort før versjonering ble innført)_

---

## Teknisk stack

| Komponent     | Løsning                          | Kostnad              |
|---------------|----------------------------------|----------------------|
| Hosting       | GitHub Pages                     | Gratis               |
| Kode          | Ren HTML/CSS/JS                  | –                    |
| Kontaktskjema | Formspree (ID: `mzdjddbw`)       | Gratis inntil 50/mnd |
| Portfolio     | Google Sheets → CSV              | Gratis               |
| Fonter        | Google Fonts                     | Gratis               |

---

## Koble til eget domene (pamillimetern.no)

1. GitHub → Settings → Pages → Custom domain → skriv `pamillimetern.no` → Save
2. Hos Domeneshop: legg inn DNS-postene GitHub viser
3. I koden: fjern `<base href="/pamillimetern/">` fra alle HTML-filer og bytt alle `/pamillimetern/`-stier tilbake til `/`

---

## Google Sheets – portfolio

CSV-URL satt i `js/portfolio-page.js`.  
Kolonner: `prosjektnr | tittel | kategori | beskrivelse | bilde_url | bilde_url_2 | bilde_url_3 | dato | fremhevet | publiser | mappe_id`  
Sett `publiser=JA` for å vise. `fremhevet=JA` vises øverst.

---

## Formspree – kontaktskjema

Form ID: `mzdjddbw` · Endpoint: `https://formspree.io/f/mzdjddbw`  
Brukes i: `kontakt.html`, `guide.html`, `en/contact.html`, `en/request.html`, `fagfolk/index.html`  
B2B-forespørsler merket med `kilde: fagfolk`.
