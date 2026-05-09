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

// Initialiserer ved DOMContentLoaded
async function init() {
  await hentProsjekter();
  renderGalleri(alleProsjekter);
  settOppFilter();
  settOppLightbox();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
