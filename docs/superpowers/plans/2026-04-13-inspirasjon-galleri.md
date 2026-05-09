# Inspirasjons-galleri Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Legg til en inspirasjons-galleri-seksjon på forsiden av pamillimetern.no som viser 6 utvalgte prosjekter i et asymmetrisk mosaikk-grid med kategori-badges, filter og lightbox.

**Architecture:** Ny dedikert `js/inspirasjon.js` henter data fra Google Sheets CSV (samme kilde som portfolio.js), rendrer 6 kort i et 12-kolonne CSS Grid med tre asymmetriske rader. Eksisterende `.portfolio-preview`-seksjon fjernes. Klikk på bilde åpner lightbox med pil-navigasjon.

**Tech Stack:** Plain HTML5, CSS3 (Grid), vanilla JavaScript ES2017+. Ingen rammeverk eller bygg-steg. GitHub Pages hosting.

**Spec:** `docs/superpowers/specs/2026-04-13-inspirasjon-galleri-design.md`

**Testmetode:** Prosjektet har ingen test-rammeverk — verifisering skjer manuelt ved å åpne `index.html` i nettleser etter hvert task. For lokal preview, kjør `python3 -m http.server 8000` i repo-roten og besøk `http://localhost:8000/`.

---

## Filstruktur

| Fil | Endring | Ansvar |
|---|---|---|
| `index.html` | Modifiser | Fjern `.portfolio-preview`-seksjon, legg til ny `.inspirasjon`-seksjon, registrer nytt script |
| `css/main.css` | Modifiser | Legg til CSS for `.inspirasjon`, `.inspirasjon-grid`, `.insp-card`, `.insp-badge`, `.insp-filter-btn`, `.insp-lightbox` |
| `css/responsive.css` | Modifiser | Breakpoints 1024px (2 col) og 768px (1 col), touch-overlay-regel |
| `js/inspirasjon.js` | Opprett | Henter data, rendrer galleri, håndterer filter og lightbox |

---

## Task 1: Opprett tom JS-fil og registrer i HTML

**Files:**
- Create: `js/inspirasjon.js`
- Modify: `index.html` (script-listen nederst i body)

- [ ] **Step 1: Opprett tom js/inspirasjon.js med stub**

Innhold:
```js
/* =============================================
   På Millimetern – inspirasjon.js
   
   Henter prosjekter fra Google Sheets og rendrer
   inspirasjons-galleriet på forsiden.
   ============================================= */

const INSPIRASJON_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoVe-zXOkx8Ujj34RY9T6kEdPDS3XIpkQLJMFpInB6FKKSJfIhjqlkvWUavq-lOfhcN9G9ElXVeN9c/pub?gid=904554919&single=true&output=csv';

console.log('inspirasjon.js loaded');
```

- [ ] **Step 2: Legg til script-tag i index.html**

I script-listen nederst i `<body>` (etter `js/portfolio.js`), legg til:
```html
<script src="js/inspirasjon.js" defer></script>
```

- [ ] **Step 3: Verifiser i nettleser**

Åpne forsiden, sjekk at konsollen viser "inspirasjon.js loaded" og ingen 404-feil.

- [ ] **Step 4: Commit**

```bash
git add js/inspirasjon.js index.html
git commit -m "feat: opprett tom inspirasjon.js og registrer script"
```

---

## Task 2: Fjern eksisterende portfolio-preview og legg til ny inspirasjon-seksjon (HTML)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Fjern hele `.portfolio-preview`-seksjonen**

Lokaliser `<!-- ===================== PORTFOLIO PREVIEW ===================== -->` (rundt linje 292) og slett hele `<section class="portfolio-preview">...</section>`-blokken inkludert kommentaren.

- [ ] **Step 2: Sett inn ny inspirasjon-seksjon etter facts-strip**

Etter `</section>` for `.facts-strip` (rundt linje 167), før `<!-- ===================== TJENESTER ===================== -->`, sett inn:

```html
<!-- ===================== INSPIRASJON ===================== -->
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

- [ ] **Step 2.5: Oppdater navigasjonen**

Hvis nav-lenken `<a href="#tjenester">Tjenester</a>` finnes både i hovednav og mobil-meny: ingen endring nødvendig (Tjenester-seksjonen flyttes ikke). Inspirasjon trenger ikke nav-lenke.

- [ ] **Step 3: Verifiser i nettleser**

Åpne forsiden:
- Inspirasjon-seksjonen vises rett etter facts-strip
- "Laster prosjekter…" vises som plassholder
- Filterknapper er synlige
- Den gamle portfolio-preview er borte
- "Se hele portfolioen →"-knappen er synlig under

Layout vil se rotete ut – CSS kommer i task 3.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: bytt ut portfolio-preview med inspirasjon-seksjon (HTML)"
```

---

## Task 3: CSS for seksjon-container, header og filterknapper

**Files:**
- Modify: `css/main.css`

- [ ] **Step 1: Legg til seksjon-CSS i main.css**

Etter `.portfolio-preview`-seksjonen (eller hvor som helst i fil-rekkefølgen som gir mening – før blogg-preview), legg til:

```css
/* ══════════════════════════════════
   INSPIRASJON GALLERI
══════════════════════════════════ */
.inspirasjon {
  padding: var(--space-xl) var(--space-md);
  max-width: var(--max-w);
  margin: 0 auto;
}

.inspirasjon-loading {
  color: var(--clr-ink-light);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  padding: var(--space-md) 0;
  text-align: center;
}

/* Filterknapper */
.inspirasjon-filter {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: var(--space-md);
}

.insp-filter-btn {
  background: transparent;
  border: 1px solid var(--clr-line);
  color: var(--clr-ink-mid);
  padding: 0.5rem 1.25rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.insp-filter-btn:hover {
  border-color: var(--clr-ink-mid);
  color: var(--clr-ink);
}

.insp-filter-btn.active {
  border-color: var(--clr-accent);
  color: var(--clr-accent);
}

.inspirasjon-cta {
  text-align: center;
  margin-top: var(--space-md);
}
```

- [ ] **Step 2: Verifiser i nettleser**

Filterknapper skal være sentrerte, pill-formet, med "Alle" markert (terrakotta-farget border og tekst). Andre knapper grå. Hover gjør grå til mørkere.

- [ ] **Step 3: Commit**

```bash
git add css/main.css
git commit -m "feat: CSS for inspirasjon-seksjon container og filterknapper"
```

---

## Task 4: CSS for asymmetrisk mosaikk-grid

**Files:**
- Modify: `css/main.css`

- [ ] **Step 1: Legg til grid-CSS i main.css**

Rett etter `.inspirasjon-cta`-regelen:

```css
/* Mosaikk-grid */
.inspirasjon-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 280px 280px auto;
  gap: 1rem;
  margin-bottom: var(--space-md);
}

.insp-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--clr-line);
  cursor: pointer;
}

.insp-card:nth-child(1) { grid-column: 1 / 8;  grid-row: 1 / 3; }
.insp-card:nth-child(2) { grid-column: 8 / 13; grid-row: 1; }
.insp-card:nth-child(3) { grid-column: 8 / 13; grid-row: 2; }
.insp-card:nth-child(4) { grid-column: 1 / 5;  grid-row: 3; aspect-ratio: 4/3; }
.insp-card:nth-child(5) { grid-column: 5 / 9;  grid-row: 3; aspect-ratio: 4/3; }
.insp-card:nth-child(6) { grid-column: 9 / 13; grid-row: 3; aspect-ratio: 4/3; }

.insp-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.insp-card:hover img {
  transform: scale(1.04);
}

.insp-card-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(28,25,21,0.9) 0%, transparent 100%);
  padding: 2rem 1.5rem 1.5rem;
  transform: translateY(100%);
  transition: transform var(--transition);
}

.insp-card:hover .insp-card-overlay {
  transform: translateY(0);
}

.insp-card-overlay h4 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--clr-white);
}

.insp-card-overlay p {
  font-size: 0.8rem;
  color: rgba(253,250,245,0.7);
  margin-top: 0.3rem;
}
```

- [ ] **Step 2: Verifiser i nettleser**

Layout skal fortsatt bare vise "Laster prosjekter…" (gridet er tomt). Inspekter med devtools at gridet har 12 kolonner og 3 rader. Ingen visuell endring ennå før data lastes.

- [ ] **Step 3: Commit**

```bash
git add css/main.css
git commit -m "feat: CSS for asymmetrisk mosaikk-grid"
```

---

## Task 5: CSS for kategori-badges

**Files:**
- Modify: `css/main.css`

- [ ] **Step 1: Legg til badge-CSS**

Rett etter `.insp-card-overlay p`:

```css
/* Kategori-badges */
.insp-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 0.7rem;
  font-family: var(--font-body);
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--clr-white);
  z-index: 2;
}

.insp-badge--kjokken   { background: #8B5E3C; }
.insp-badge--garderobe { background: #3A6E9E; }
.insp-badge--mobler    { background: #5C5449; }
.insp-badge--annet     { background: #9C9288; }
```

- [ ] **Step 2: Commit**

```bash
git add css/main.css
git commit -m "feat: CSS for kategori-badges"
```

---

## Task 6: CSS for lightbox

**Files:**
- Modify: `css/main.css`

- [ ] **Step 1: Legg til lightbox-CSS**

Etter badge-reglene:

```css
/* Lightbox */
.insp-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: insp-fade-in 0.25s ease-out;
}

.insp-lightbox[hidden] {
  display: none;
}

.insp-lightbox-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(28, 25, 21, 0.92);
  backdrop-filter: blur(4px);
}

.insp-lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: insp-scale-in 0.3s ease-out;
}

.insp-lightbox-img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.insp-lightbox-info {
  text-align: center;
  color: var(--clr-white);
}

.insp-lightbox-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
}

.insp-lightbox-kategori {
  font-size: 0.85rem;
  color: rgba(253,250,245,0.7);
  margin-top: 0.25rem;
}

.insp-lightbox-close,
.insp-lightbox-prev,
.insp-lightbox-next {
  position: absolute;
  background: rgba(253,250,245,0.1);
  border: 1px solid rgba(253,250,245,0.2);
  color: var(--clr-white);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.insp-lightbox-close:hover,
.insp-lightbox-prev:hover,
.insp-lightbox-next:hover {
  background: rgba(253,250,245,0.2);
}

.insp-lightbox-close { top: -3rem; right: 0; }
.insp-lightbox-prev  { left: -4rem; top: 50%; transform: translateY(-50%); }
.insp-lightbox-next  { right: -4rem; top: 50%; transform: translateY(-50%); }

@keyframes insp-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes insp-scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
```

- [ ] **Step 2: Commit**

```bash
git add css/main.css
git commit -m "feat: CSS for inspirasjon-lightbox"
```

---

## Task 7: Responsive CSS

**Files:**
- Modify: `css/responsive.css`

- [ ] **Step 1: Finn 1024px-breakpoint i responsive.css**

Søk etter `@media (max-width: 1024px)` – det finnes flere blokker. Velg en passende plass å legge til inspirasjon-regler (gjerne i nærheten av portfolio-relaterte regler).

- [ ] **Step 2: Legg til 1024px-regler**

Inne i `@media (max-width: 1024px) { ... }`:

```css
  /* Inspirasjon: 2 kolonner jevnt */
  .inspirasjon-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }
  .inspirasjon-grid .insp-card {
    grid-column: auto !important;
    grid-row: auto !important;
    aspect-ratio: 4/3;
  }
```

- [ ] **Step 3: Legg til 768px-regler**

Inne i `@media (max-width: 768px) { ... }`:

```css
  /* Inspirasjon: 1 kolonne */
  .inspirasjon-grid {
    grid-template-columns: 1fr;
  }
  
  /* Lightbox-knapper inn i synlig område på mobil */
  .insp-lightbox-close { top: 1rem; right: 1rem; }
  .insp-lightbox-prev  { left: 0.5rem; }
  .insp-lightbox-next  { right: 0.5rem; }
```

- [ ] **Step 4: Legg til touch-regel**

Inne i `@media (hover: none)`-blokken (rundt linje 332), ved siden av `.portfolio-card-overlay`:

```css
  .insp-card-overlay {
    transform: translateY(0) !important;
    opacity: 1 !important;
  }
```

- [ ] **Step 5: Verifiser**

Endre nettleserbredde:
- >1024px: tre rader, asymmetrisk (selv om gridet er tomt)
- ≤1024px: 2-kolonne grid
- ≤768px: 1-kolonne

- [ ] **Step 6: Commit**

```bash
git add css/responsive.css
git commit -m "feat: responsive breakpoints for inspirasjon-galleri"
```

---

## Task 8: JavaScript – CSV-fetch og parsing

**Files:**
- Modify: `js/inspirasjon.js`

- [ ] **Step 1: Erstatt stub med fullstendig data-modul**

Erstatt hele filen med:

```js
/* =============================================
   På Millimetern – inspirasjon.js
   
   Henter prosjekter fra Google Sheets og rendrer
   inspirasjons-galleriet på forsiden.
   ============================================= */

const INSPIRASJON_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoVe-zXOkx8Ujj34RY9T6kEdPDS3XIpkQLJMFpInB6FKKSJfIhjqlkvWUavq-lOfhcN9G9ElXVeN9c/pub?gid=904554919&single=true&output=csv';

let alleProsjekter = [];
let synligeProsjekter = [];
let aktivLightboxIndex = 0;

// Konverterer Google Drive-lenker til direkte bilde-URL
function driveUrl(url, bredde = 1200) {
  if (!url) return '';
  let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}=w${bredde}`;
  return url;
}

// Enkel CSV-parser
function parseCSV(tekst) {
  const linjer = tekst.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const overskrifter = linjer[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return linjer.slice(1).filter(l => l.trim()).map(linje => {
    const verdier = linje.split(',');
    return Object.fromEntries(
      overskrifter.map((h, i) => [h, (verdier[i] || '').replace(/^"|"$/g, '').trim()])
    );
  });
}

// Normaliser norsk kategori til ASCII-slug
function slugify(s) {
  if (!s) return 'annet';
  return s.toLowerCase()
    .replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'aa')
    .replace(/[^a-z0-9]/g, '');
}

async function hentProsjekter() {
  try {
    const res = await fetch(INSPIRASJON_CSV_URL);
    if (!res.ok) throw new Error('CSV-fetch feilet');
    const csv = await res.text();
    const alle = parseCSV(csv);
    alleProsjekter = alle
      .filter(p => (p.publiser || '').toLowerCase() === 'ja')
      .sort((a, b) => {
        const aFrem = (a.fremhevet || '').toLowerCase() === 'ja' ? 1 : 0;
        const bFrem = (b.fremhevet || '').toLowerCase() === 'ja' ? 1 : 0;
        if (bFrem !== aFrem) return bFrem - aFrem;
        return (b.dato || '').localeCompare(a.dato || '');
      });
    return alleProsjekter;
  } catch (err) {
    console.warn('Inspirasjon-feil:', err.message);
    return [];
  }
}

// Initialiserer ved DOMContentLoaded
async function init() {
  const data = await hentProsjekter();
  console.log('Hentet', data.length, 'publiserte prosjekter');
  // Render kommer i neste task
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

- [ ] **Step 2: Verifiser i nettleser-konsoll**

Åpne forsiden, sjekk konsollen: "Hentet N publiserte prosjekter" der N > 0.

- [ ] **Step 3: Commit**

```bash
git add js/inspirasjon.js
git commit -m "feat: CSV-fetch og parsing for inspirasjon-galleri"
```

---

## Task 9: JavaScript – Render galleri

**Files:**
- Modify: `js/inspirasjon.js`

- [ ] **Step 1: Legg til render-funksjoner**

Etter `hentProsjekter`-funksjonen, legg til:

```js
function kortHTML(p, index) {
  const slug = slugify(p.kategori);
  const bildeKilde = p.bilde_url ? driveUrl(p.bilde_url) : '';
  return `
    <article class="insp-card" data-kategori="${slug}" data-index="${index}">
      ${bildeKilde 
        ? `<img src="${bildeKilde}" alt="${escapeHtml(p.tittel || '')}" loading="lazy" />`
        : `<div style="width:100%;height:100%;background:var(--clr-line);"></div>`}
      <span class="insp-badge insp-badge--${slug}">${escapeHtml(p.kategori || 'Annet')}</span>
      <div class="insp-card-overlay">
        <h4>${escapeHtml(p.tittel || '')}</h4>
        <p>${escapeHtml(p.kategori || '')}${p.dato ? ' · ' + escapeHtml(p.dato) : ''}</p>
      </div>
    </article>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderGalleri(prosjekter) {
  const container = document.getElementById('inspirasjon-grid');
  if (!container) return;
  synligeProsjekter = prosjekter.slice(0, 6);
  if (synligeProsjekter.length === 0) {
    container.innerHTML = '<div class="inspirasjon-loading">Ingen prosjekter å vise.</div>';
    return;
  }
  container.innerHTML = synligeProsjekter.map((p, i) => kortHTML(p, i)).join('');
}
```

- [ ] **Step 2: Oppdater `init()` til å kalle render**

Erstatt `init()`-funksjonen:

```js
async function init() {
  await hentProsjekter();
  renderGalleri(alleProsjekter);
}
```

- [ ] **Step 3: Verifiser i nettleser**

- 6 bilder vises i mosaikk-grid
- Bilde 1 er stort (venstre, 2 rader)
- Bilde 2+3 stablet til høyre
- Bilde 4+5+6 jevnt nederst
- Kategori-badges synlige med riktig farge (terrakotta/blå/grå)
- Hover på et kort: bildet zoomes 1.04x og overlay glir opp

- [ ] **Step 4: Commit**

```bash
git add js/inspirasjon.js
git commit -m "feat: render inspirasjons-galleri med 6 prosjekter"
```

---

## Task 10: JavaScript – Filtrering

**Files:**
- Modify: `js/inspirasjon.js`

- [ ] **Step 1: Legg til filtrer-funksjon**

Etter `renderGalleri`:

```js
function filtrerKategori(slug) {
  const filtrert = slug === 'alle'
    ? alleProsjekter
    : alleProsjekter.filter(p => slugify(p.kategori) === slug);
  
  const container = document.getElementById('inspirasjon-grid');
  if (container) {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.2s ease';
    setTimeout(() => {
      renderGalleri(filtrert);
      container.style.opacity = '1';
    }, 200);
  }
}

function settOppFilter() {
  const knapper = document.querySelectorAll('.insp-filter-btn');
  knapper.forEach(btn => {
    btn.addEventListener('click', () => {
      knapper.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      filtrerKategori(btn.dataset.filter);
    });
  });
}
```

- [ ] **Step 2: Kall settOppFilter() i init**

Oppdater `init()`:

```js
async function init() {
  await hentProsjekter();
  renderGalleri(alleProsjekter);
  settOppFilter();
}
```

- [ ] **Step 3: Verifiser**

- Klikk "Kjøkken": kun kjøkken-prosjekter vises (med fade-overgang)
- Klikk "Garderobe": kun garderober
- Klikk "Møbler": kun møbler  
- Klikk "Alle": tilbake til alle 6
- Aktiv knapp endrer farge (terrakotta)

- [ ] **Step 4: Commit**

```bash
git add js/inspirasjon.js
git commit -m "feat: filtrering etter kategori med fade-animasjon"
```

---

## Task 11: JavaScript – Lightbox

**Files:**
- Modify: `js/inspirasjon.js`

- [ ] **Step 1: Legg til lightbox-funksjoner**

Etter `settOppFilter`:

```js
function aapneLightbox(index) {
  if (index < 0 || index >= synligeProsjekter.length) return;
  aktivLightboxIndex = index;
  const p = synligeProsjekter[index];
  const lightbox = document.getElementById('insp-lightbox');
  const img = lightbox.querySelector('.insp-lightbox-img');
  const tittel = lightbox.querySelector('.insp-lightbox-title');
  const kategori = lightbox.querySelector('.insp-lightbox-kategori');

  img.src = p.bilde_url ? driveUrl(p.bilde_url, 1600) : '';
  img.alt = p.tittel || '';
  tittel.textContent = p.tittel || '';
  kategori.textContent = p.kategori || '';

  lightbox.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function lukkLightbox() {
  const lightbox = document.getElementById('insp-lightbox');
  lightbox.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function navigerLightbox(retning) {
  const ny = (aktivLightboxIndex + retning + synligeProsjekter.length) % synligeProsjekter.length;
  aapneLightbox(ny);
}

function settOppLightbox() {
  const lightbox = document.getElementById('insp-lightbox');
  if (!lightbox) return;

  // Klikk på kort
  document.getElementById('inspirasjon-grid').addEventListener('click', e => {
    const kort = e.target.closest('.insp-card');
    if (kort) aapneLightbox(parseInt(kort.dataset.index, 10));
  });

  // Lukk-knapp og backdrop
  lightbox.querySelector('.insp-lightbox-close').addEventListener('click', lukkLightbox);
  lightbox.querySelector('.insp-lightbox-backdrop').addEventListener('click', lukkLightbox);

  // Pil-knapper
  lightbox.querySelector('.insp-lightbox-prev').addEventListener('click', () => navigerLightbox(-1));
  lightbox.querySelector('.insp-lightbox-next').addEventListener('click', () => navigerLightbox(1));

  // Tastatur
  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape') lukkLightbox();
    if (e.key === 'ArrowLeft') navigerLightbox(-1);
    if (e.key === 'ArrowRight') navigerLightbox(1);
  });
}
```

- [ ] **Step 2: Kall settOppLightbox() i init**

```js
async function init() {
  await hentProsjekter();
  renderGalleri(alleProsjekter);
  settOppFilter();
  settOppLightbox();
}
```

- [ ] **Step 3: Verifiser**

- Klikk på et bilde: lightbox åpnes med stort bilde, tittel og kategori
- Klikk X: lukker
- Klikk utenfor bildet: lukker
- Trykk Escape: lukker
- Klikk ‹/›: bytter til forrige/neste prosjekt
- Piltastene: samme funksjon
- Wraparound: går fra siste til første og motsatt
- Body scroller ikke mens lightbox er åpen

- [ ] **Step 4: Commit**

```bash
git add js/inspirasjon.js
git commit -m "feat: lightbox med pil-navigasjon for inspirasjon-galleri"
```

---

## Task 12: Feilhåndtering – placeholders ved fetch-feil

**Files:**
- Modify: `js/inspirasjon.js`

- [ ] **Step 1: Legg til placeholder-funksjon**

Etter `escapeHtml`:

```js
function lagPlaceholderKort() {
  const farger = ['#D4C5B0', '#C9B99A', '#BFB0A0', '#D9CDBF', '#CFC0AD', '#C4B5A2'];
  return farger.map((f, i) => `
    <article class="insp-card" style="background:${f};" data-index="${i}">
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:0.4">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#5C5449" stroke-width="1.2">
          <rect x="8" y="8" width="32" height="32" rx="2"/>
          <circle cx="18" cy="18" r="4"/>
          <path d="M8 32 l10-10 8 8 6-6 8 8"/>
        </svg>
      </div>
    </article>
  `).join('');
}
```

- [ ] **Step 2: Bruk placeholder ved tomt resultat**

Oppdater `renderGalleri`:

```js
function renderGalleri(prosjekter) {
  const container = document.getElementById('inspirasjon-grid');
  if (!container) return;
  synligeProsjekter = prosjekter.slice(0, 6);
  if (synligeProsjekter.length === 0) {
    container.innerHTML = lagPlaceholderKort();
    return;
  }
  container.innerHTML = synligeProsjekter.map((p, i) => kortHTML(p, i)).join('');
}
```

- [ ] **Step 3: Verifiser**

For å teste: midlertidig endre `INSPIRASJON_CSV_URL` til en ugyldig URL. Last siden – 6 fargede placeholder-kort skal vises i mosaikk-grid. Endre tilbake.

- [ ] **Step 4: Commit**

```bash
git add js/inspirasjon.js
git commit -m "feat: placeholder-kort ved tomt fetch-resultat"
```

---

## Task 13: Helhetlig sluttverifisering og push

**Files:**
- Ingen endringer

- [ ] **Step 1: Helhetstest i nettleser**

Åpne forsiden:
- [ ] Hero, facts-strip, inspirasjon-seksjon, tjenester, om oss, blogg-preview, CTA, footer i denne rekkefølgen
- [ ] Inspirasjon viser 6 prosjekter i mosaikk-grid på desktop
- [ ] Alle bilder lastes (ingen brutt-bilde-ikoner)
- [ ] Kategori-badges har riktig farge per kategori
- [ ] Hover-effekt fungerer (zoom + overlay)
- [ ] Filterknapper fungerer (Alle / Kjøkken / Garderobe / Møbler)
- [ ] Lightbox åpnes og kan navigeres med X, klikk-utenfor, Escape, piltaster, ‹/› knapper
- [ ] "Se hele portfolioen →" lenker til portfolio.html
- [ ] Resize til ≤1024px: 2-kolonne layout
- [ ] Resize til ≤768px: 1-kolonne layout
- [ ] Konsoll har ingen feil

- [ ] **Step 2: Verifiser i mobil-emulator**

DevTools mobil-modus:
- [ ] Touch: overlay alltid synlig på kortene
- [ ] Lightbox-knapper er synlige inne på skjermen

- [ ] **Step 3: Push til GitHub**

```bash
git push
```

- [ ] **Step 4: Verifiser live-siden**

Vent ~1-2 min på GitHub Pages-deploy. Besøk https://trappemakeren.github.io/pamillimetern/ og gjør samme verifisering som i Step 1.

---

## Sluttkriterier

Implementeringen er ferdig når:
- ✅ Alle 13 task-er er committet
- ✅ Live-siden viser inspirasjons-galleriet med ekte data fra Google Sheets
- ✅ Filtrering, lightbox, navigasjon og responsivitet fungerer
- ✅ Ingen konsollerfeil
- ✅ `.portfolio-preview` er borte fra forsiden
