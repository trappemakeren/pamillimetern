
// Konverterer Google Drive-lenker til direkte bilde-URL
function driveUrl(url, bredde = 1200) {
  if (!url) return '';
  // Format: https://drive.google.com/file/d/FILE_ID/view
  let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) {
    // Format: https://drive.google.com/uc?...id=FILE_ID
    m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  }
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}=w${bredde}`;
  return url; // returner uendret hvis ukjent format
}
/* =============================================
   På Millimetern – portfolio.js
   
   Henter prosjekter fra Google Sheets og
   rendrer dem som portfolio-kort.
   
   OPPSETT:
   1. Opprett et Google Sheets-ark med kolonnene:
      tittel | kategori | beskrivelse | bilde_url | dato | fremhevet
   2. Publiser arket: Fil → Del → Publiser til nettet → CSV
   3. Lim inn URL-en nedenfor i SHEET_CSV_URL
   ============================================= */

const PORTFOLIO_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoVe-zXOkx8Ujj34RY9T6kEdPDS3XIpkQLJMFpInB6FKKSJfIhjqlkvWUavq-lOfhcN9G9ElXVeN9c/pub?gid=904554919&single=true&output=csv';

// Kategorier for filtrering
const KATEGORIER = ['Alle', 'Kjøkken', 'Garderobe', 'Møbler', 'Annet'];

async function lastPortfolio(maxAntall = 6) {
  const container = document.getElementById('portfolio-grid');
  if (!container) return;

  // Vis eksempel-kort hvis Sheet-URL ikke er satt ennå
  if (PORTFOLIO_SHEET_CSV_URL.includes('DIN_GOOGLE')) {
    container.innerHTML = lagDemoKort();
    initReveal();
    return;
  }

  try {
    const res = await fetch(PORTFOLIO_SHEET_CSV_URL);
    if (!res.ok) throw new Error('Kunne ikke hente portfolio-data');
    const csv = await res.text();
    const prosjekter = parseCSV(csv);
    const fremhevede = prosjekter
      .filter(p => p.publiser?.toLowerCase() === 'ja' && p.fremhevet?.toLowerCase() === 'ja')
      .slice(0, maxAntall);

    container.innerHTML = fremhevede.map(kortHTML).join('');
    initReveal();
  } catch (err) {
    console.warn('Portfolio-feil:', err.message);
    container.innerHTML = lagDemoKort();
    initReveal();
  }
}

function kortHTML(p) {
  return `
    <article class="portfolio-card">
      <img
        src="${p.bilde_url ? driveUrl(p.bilde_url) : 'images/placeholder.jpg'}"
        alt="${p.tittel}"
        loading="lazy"
      />
      <div class="portfolio-card-overlay">
        <h4>${p.tittel}</h4>
        <p>${p.kategori}${p.dato ? ' · ' + p.dato : ''}</p>
      </div>
    </article>
  `;
}

// Demo-innhold til siden Google Sheets er koblet til
function lagDemoKort() {
  const demo = [
    { tittel: 'Kjøkken, Valdres', kategori: 'Kjøkken', farge: '#D4C5B0' },
    { tittel: 'Garderobe, Oslo',  kategori: 'Garderobe', farge: '#C9B99A' },
    { tittel: 'Spisebord',        kategori: 'Møbler', farge: '#BFB0A0' },
    { tittel: 'Innebygd hylle',   kategori: 'Møbler', farge: '#D9CDBF' },
    { tittel: 'Kjøkken, Bergen',  kategori: 'Kjøkken', farge: '#CFC0AD' },
    { tittel: 'Walk-in garderobe',kategori: 'Garderobe', farge: '#C4B5A2' },
  ];
  return demo.map(d => `
    <article class="portfolio-card" style="background:${d.farge}">
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:0.5">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#5C5449" stroke-width="1.2">
          <rect x="8" y="8" width="32" height="32" rx="2"/>
          <circle cx="18" cy="18" r="4"/>
          <path d="M8 32 l10-10 8 8 6-6 8 8"/>
        </svg>
      </div>
      <div class="portfolio-card-overlay" style="transform:translateY(0);background:linear-gradient(to top,rgba(28,25,21,0.8) 0%,transparent 100%)">
        <h4>${d.tittel}</h4>
        <p>${d.kategori}</p>
      </div>
    </article>
  `).join('');
}

// Enkel CSV-parser (håndterer komma, anførselstegn og \r\n)
function parseCSV(tekst) {
  const linjer = tekst.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const overskrifter = linjer[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return linjer.slice(1).filter(l => l.trim()).map(linje => {
    const verdier = linje.split(','); // enkel split - handterer tomme felt
    return Object.fromEntries(
      overskrifter.map((h, i) => [h, (verdier[i] || '').replace(/^"|"$/g, '').trim()])
    );
  });
}

function initReveal() {
  const kort = document.querySelectorAll('.portfolio-card');
  kort.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.07}s`;
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  kort.forEach(k => obs.observe(k));
}

// Start
lastPortfolio();
