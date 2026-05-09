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

// Initialiserer ved DOMContentLoaded
async function init() {
  await hentProsjekter();
  renderGalleri(alleProsjekter);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
