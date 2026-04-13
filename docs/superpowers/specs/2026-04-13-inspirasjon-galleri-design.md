# Inspirasjons-galleri på forsiden

**Dato:** 2026-04-13
**Status:** Godkjent design, klar for implementering

## Sammendrag

Ny seksjon på index.html som viser 6 utvalgte prosjekter i et asymmetrisk mosaikk-grid med kategori-badges, filterknapper og lightbox. Erstatter eksisterende portfolio-preview-seksjon (`.portfolio-preview`).

## Beslutninger

| Beslutning | Valg | Begrunnelse |
|---|---|---|
| Plassering | Rett etter hero + facts strip, før tjenester | Gir besøkende visuelt bevis tidlig |
| Eksisterende portfolio-preview | Fjernes helt | Unngår duplisering |
| Klikkhandling | Lightbox på forsiden med pil-navigasjon | Brukeren trenger ikke forlate siden |
| Arkitektur | Ny dedikert js/inspirasjon.js | Ren separasjon, portfolio.js forblir uendret |
| Duplisert kode | parseCSV og driveUrl kopieres bevisst | Filene er ~10 linjer hver, og en delt utils.js gir unødvendig kompleksitet for dette prosjektet |

## Plassering i sidestruktur

Ny seksjon settes inn etter facts-strip. Resten av siderekkefølgen beholdes uendret, bortsett fra at `.portfolio-preview` fjernes.

```
Hero
Facts Strip
→ INSPIRASJON (ny) ←
Tjenester
Om oss
(portfolio-preview FJERNET — identifisert via <section class="portfolio-preview">)
Blogg Preview
CTA Band
Footer
```

## HTML-struktur

```html
<section class="inspirasjon" id="inspirasjon">
  <div class="section-header">
    <span class="section-label">UTVALGTE ARBEIDER</span>
    <h2>Inspirasjon</h2>
  </div>

  <div class="inspirasjon-filter" role="group" aria-label="Filtrer etter kategori">
    <button class="insp-filter-btn active" data-filter="alle" aria-pressed="true">Alle</button>
    <button class="insp-filter-btn" data-filter="kjokken" aria-pressed="false">Kjøkken</button>
    <button class="insp-filter-btn" data-filter="garderobe" aria-pressed="false">Garderobe</button>
    <button class="insp-filter-btn" data-filter="mobler" aria-pressed="false">Møbler</button>
  </div>

  <div class="inspirasjon-grid" id="inspirasjon-grid">
    <div class="inspirasjon-loading">Laster prosjekter…</div>
  </div>

  <div class="inspirasjon-cta">
    <a href="/pamillimetern/portfolio.html" class="btn btn-ghost">Se hele portfolioen →</a>
  </div>

  <!-- Lightbox -->
  <div class="insp-lightbox" id="insp-lightbox" hidden>
    <div class="insp-lightbox-backdrop"></div>
    <div class="insp-lightbox-content">
      <button class="insp-lightbox-close" aria-label="Lukk">×</button>
      <button class="insp-lightbox-prev" aria-label="Forrige">‹</button>
      <button class="insp-lightbox-next" aria-label="Neste">›</button>
      <img class="insp-lightbox-img" src="" alt="" />
      <div class="insp-lightbox-info">
        <h4 class="insp-lightbox-title"></h4>
        <p class="insp-lightbox-kategori"></p>
      </div>
    </div>
  </div>
</section>
```

**Merk:** Seksjonen har `id="inspirasjon"` for mulig ankerlinking.

## Kategori-slug-normalisering

Kategorier fra Google Sheets (f.eks. "Kjøkken", "Garderobe", "Møbler") normaliseres til ASCII-slugs for bruk i `data-kategori` og `data-filter`:

| Sheets-verdi | Slug | Badge-klasse |
|---|---|---|
| Kjøkken | `kjokken` | `insp-badge--kjokken` |
| Garderobe | `garderobe` | `insp-badge--garderobe` |
| Møbler | `mobler` | `insp-badge--mobler` |
| Annet / ukjent | `annet` | `insp-badge--annet` |

Normaliseringsfunksjon i JS: lowercase, erstatt `ø` → `o`, `æ` → `ae`, `å` → `aa`, fjern andre spesialtegn.

## CSS Grid-layout

### Desktop (>1024px) — 12-kolonne grid

```
┌──────────────────┬─────────────┐
│                  │   Bilde 2   │
│    Bilde 1       │  (5col)     │
│   (7col, 2row)   ├─────────────┤
│                  │   Bilde 3   │
│                  │  (5col)     │
├──────────┬───────┴──┬──────────┤
│ Bilde 4  │ Bilde 5  │ Bilde 6  │
│  (4col)  │  (4col)  │  (4col)  │
└──────────┴──────────┴──────────┘
```

CSS Grid-regler:
```css
.inspirasjon-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 280px 280px auto;
  gap: 1rem;
  max-width: var(--max-w);
  margin: 0 auto;
}

.insp-card:nth-child(1) { grid-column: 1 / 8;  grid-row: 1 / 3; }
.insp-card:nth-child(2) { grid-column: 8 / 13; grid-row: 1; }
.insp-card:nth-child(3) { grid-column: 8 / 13; grid-row: 2; }
.insp-card:nth-child(4) { grid-column: 1 / 5;  grid-row: 3; }
.insp-card:nth-child(5) { grid-column: 5 / 9;  grid-row: 3; }
.insp-card:nth-child(6) { grid-column: 9 / 13; grid-row: 3; }
```

Desktop: Rad 1 og 2 har fast høyde (280px) slik at bilde 1 (2 rader) og bilde 2+3 (1 rad hver) er proporsjonale. Rad 3 (de tre bunnskortene) bruker `aspect-ratio: 4/3`.

### Tablet (≤1024px)

2 kolonner jevnt (`grid-template-columns: 1fr 1fr`), alle kort lik størrelse med `aspect-ratio: 4/3`. Asymmetrisk layout oppheves.

### Mobil (≤768px)

1 kolonne, alle kort `aspect-ratio: 4/3`.

**Merk:** Breakpoints matcher eksisterende verdier i responsive.css (1024px, 768px).

## Kort-komponent (.insp-card)

```html
<article class="insp-card" data-kategori="kjokken">
  <img src="..." alt="Prosjektnavn" loading="lazy" />
  <span class="insp-badge insp-badge--kjokken">Kjøkken</span>
  <div class="insp-card-overlay">
    <h4>Prosjektnavn</h4>
    <p>Kjøkken</p>
  </div>
</article>
```

### Hover-oppførsel
- Bildet skaleres `transform: scale(1.04)` med `transition: transform 0.6s ease`
- Overlay med prosjektnavn + kategori glir opp fra bunnen (translateY)

### Touch-enheter
På `@media (hover: none)`: `.insp-card-overlay` er permanent synlig (`transform: translateY(0)`), i tråd med eksisterende `.portfolio-card-overlay`-mønster i responsive.css.

### Kategori-badges

Liten pill øverst til venstre i hvert bilde:

| Kategori | Bakgrunnsfarge | Tekstfarge |
|---|---|---|
| Kjøkken | `#8B5E3C` (terrakotta) | `#FDFAF5` |
| Garderobe | `#3A6E9E` (stålblå) | `#FDFAF5` |
| Møbler | `#5C5449` (mørk grå) | `#FDFAF5` |
| Annet | `#9C9288` (lys grå) | `#FDFAF5` |

Styling: `font-size: 0.7rem`, `padding: 0.25rem 0.75rem`, `border-radius: 2rem`, `letter-spacing: 0.05em`, `text-transform: uppercase`.

## Filterknapper

Horisontalt sentrerte pill-knapper med:
- Default: `background: transparent`, `border: 1px solid var(--clr-line)`, `color: var(--clr-ink-mid)`
- Aktiv: `border-color: var(--clr-accent)`, `color: var(--clr-accent)`, `aria-pressed="true"`
- Hover: `border-color: var(--clr-ink-mid)`

Ved filtrering:
1. Hent alle publiserte prosjekter som matcher valgt kategori-slug (eller alle)
2. Sorter: fremhevet=JA først, deretter etter dato fallende
3. Vis de 6 første
4. Re-render grid med fade-animasjon (kort fader ut 0.2s, nye fader inn 0.2s)

## Lightbox

### Åpning
- Klikk på et bilde → vis lightbox med `hidden`-attributt fjernet
- Body får `overflow: hidden` for å låse scroll
- Bakgrunn: `rgba(28, 25, 21, 0.92)` med `backdrop-filter: blur(4px)`

### Innhold
- Bildet vises sentrert, `max-width: 90vw`, `max-height: 80vh`, `object-fit: contain`
- Prosjektnavn og kategori under bildet

### Navigasjon
- Forrige/neste-knapper (‹ / ›) på sidene av bildet
- Piltaster venstre/høyre for tastaturnavigasjon
- Wraparound: etter siste bilde → tilbake til første

### Lukking
- Klikk på X-knapp
- Klikk på backdrop (utenfor bildet)
- Escape-tast
- Body scroll gjenopprettes

### Animasjon
- Fade-in: opacity 0→1 over 0.25s
- Bildet: scale 0.95→1 over 0.3s ease-out

## Tilgjengelighet

- Alle animasjoner (card fade, lightbox fade, image scale, hover) respekterer `prefers-reduced-motion: reduce` via eksisterende global regel i responsive.css (linje 378). Ingen ekstra CSS nødvendig.
- Filterknapper bruker `role="group"` med `aria-label` og `aria-pressed`.
- Lightbox-knapper har `aria-label`.
- Bilder har `alt`-tekst fra prosjekttittel.

## JavaScript (js/inspirasjon.js)

### Konstanter
```js
const INSPIRASJON_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoVe-zXOkx8Ujj34RY9T6kEdPDS3XIpkQLJMFpInB6FKKSJfIhjqlkvWUavq-lOfhcN9G9ElXVeN9c/pub?gid=904554919&single=true&output=csv';
```

### Datahenting
1. Fetch CSV fra `INSPIRASJON_CSV_URL`
2. Parse med lokal `parseCSV()` (kopi fra portfolio.js, ~10 linjer)
3. Filtrer: `publiser` kolonne = "JA" (case-insensitive)
4. Sorter: `fremhevet` = "JA" først, deretter dato fallende
5. Lagre alle publiserte prosjekter i modul-variabel for filtrering

### Bildehåndtering
- Primært: `bilde_url`-kolonnen
- Konverter Drive-lenker via lokal `driveUrl(url, bredde)` (kopi fra portfolio.js)
- Fallback: Bruk `mappe_id` med Google Drive API for å hente første bilde fra mappe

### Funksjoner
```
driveUrl(url, bredde)      — konverter Drive-lenker til direkte bilde-URL
parseCSV(tekst)            — parse CSV til array av objekter
slugify(kategori)          — normaliser norsk kategori til ASCII-slug
hentProsjekter()           — fetch + parse + filtrer publiserte
renderGalleri(prosjekter)  — generer HTML for 6 kort i grid
filtrerKategori(kategori)  — filtrer og re-render med animasjon
aapneLightbox(index)       — vis lightbox med prosjektdata
lukkLightbox()             — skjul lightbox, gjenopprett scroll
navigerLightbox(retning)   — +1 eller -1 for neste/forrige
init()                     — entry point, kalt på DOMContentLoaded
```

### Lastetilstand
Viser `<div class="inspirasjon-loading">Laster prosjekter…</div>` i gridet mens fetch pågår (matchende stil som `.portfolio-loading`).

### Feilhåndtering
- Hvis fetch feiler: vis 6 placeholder-kort med fargede bakgrunner (lik dagens portfolio demo-kort)
- Console.warn ved feil, ikke synlig for bruker

### Script-rekkefølge
`<script src="js/inspirasjon.js" defer>` legges til i index.html etter portfolio.js. Merk: `portfolio.js` kjører `lastPortfolio()` som kaller `document.getElementById('portfolio-grid')` — dette returnerer `null` (siden portfolio-preview er fjernet) og bailer ut tidlig. Ingen konflikt.

## Filer som endres

| Fil | Endring |
|---|---|
| `index.html` | Legg til inspirasjon-seksjon etter `</section><!-- facts-strip -->`. Fjern `<section class="portfolio-preview">...</section>`. Legg til `<script src="js/inspirasjon.js" defer>` |
| `css/main.css` | Ny CSS-seksjon for `.inspirasjon`, `.inspirasjon-grid`, `.insp-card`, `.insp-badge`, `.insp-filter-btn`, `.insp-lightbox`, `.inspirasjon-loading` |
| `css/responsive.css` | Breakpoints 1024px og 768px for inspirasjon-grid. Touch-overlay-regel for `.insp-card-overlay` i `@media (hover: none)` |
| `js/inspirasjon.js` | Ny fil (~150 linjer) |

## Berører IKKE

- `js/portfolio.js` — forblir uendret (getElementById returnerer null og bailer ut)
- `portfolio.html` — forblir uendret
- Engelske sider (`en/`) — ikke i scope
- Blogg-preview — forblir som den er
