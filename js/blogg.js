/* =============================================
   På Millimetern – blogg.js
   
   Henter bloggartikler fra Google Sheets og
   rendrer dem som artikkelkort på forsiden.
   
   OPPSETT:
   Kolonnene i Sheets: tittel | ingress | kategori | dato | slug | bilde_url
   ============================================= */

const BLOGG_SHEET_CSV_URL = 'DIN_BLOGG_SHEETS_CSV_URL_HER';

async function lastBlogg(maxAntall = 3) {
  const container = document.getElementById('blogg-grid');
  if (!container) return;

  if (BLOGG_SHEET_CSV_URL.includes('DIN_BLOGG')) {
    container.innerHTML = lagDemoBlogg();
    return;
  }

  try {
    const res = await fetch(BLOGG_SHEET_CSV_URL);
    if (!res.ok) throw new Error('Kunne ikke hente blogg-data');
    const csv = await res.text();
    const artikler = parseCSV(csv).slice(0, maxAntall);
    container.innerHTML = artikler.map(bloggKortHTML).join('');
  } catch (err) {
    console.warn('Blogg-feil:', err.message);
    container.innerHTML = lagDemoBlogg();
  }
}

function bloggKortHTML(a) {
  return `
    <article class="blogg-card">
      <div class="blogg-card-meta">${a.kategori || 'Guide'}${a.dato ? ' · ' + a.dato : ''}</div>
      <h4><a href="blogg/${a.slug || '#'}.html">${a.tittel}</a></h4>
      <p>${a.ingress}</p>
      <a href="blogg/${a.slug || '#'}.html">Les mer →</a>
    </article>
  `;
}

function lagDemoBlogg() {
  const artikler = [
    {
      meta: 'Guide · Kjøkken',
      tittel: 'Hva koster et skreddersydd kjøkken?',
      ingress: 'Prisen på et håndlaget kjøkken avhenger av mange faktorer – men svaret er sjelden så høyt som folk tror.',
      href: 'blogg/hva-koster-skreddersydd-kjokken.html'
    },
    {
      meta: 'Guide · Kjøkken',
      tittel: 'IKEA-kjøkken vs. snekkerkjøkken – hva er forskjellen?',
      ingress: 'Et standard kjøkken passer et standard rom. Men de fleste rom er ikke standard. Her er hva du faktisk får ved å velge en snekker.',
      href: 'blogg/ikea-vs-snekker-kjokken.html'
    },
    {
      meta: 'Guide · Garderobe',
      tittel: 'Hvilke materialer er best til garderobe?',
      ingress: 'Fra massivt tre til MDF og finér – vi forklarer forskjellene og hjelper deg velge riktig for ditt behov og budsjett.',
      href: 'blogg/materialer-garderobe.html'
    },
  ];
  return artikler.map(a => `
    <article class="blogg-card">
      <div class="blogg-card-meta">${a.meta}</div>
      <h4><a href="${a.href}">${a.tittel}</a></h4>
      <p>${a.ingress}</p>
      <a href="${a.href}">Les mer →</a>
    </article>
  `).join('');
}

function parseCSV(tekst) {
  const linjer = tekst.trim().split('\n');
  const overskrifter = linjer[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return linjer.slice(1).map(linje => {
    const verdier = linje.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    return Object.fromEntries(
      overskrifter.map((h, i) => [h, (verdier[i] || '').replace(/^"|"$/g, '').trim()])
    );
  });
}

lastBlogg();
