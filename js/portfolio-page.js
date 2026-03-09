/* =============================================
   På Millimetern – portfolio-page.js
   Filtrering, lightbox med slideshow og Google Sheets-henting
   Bilder hentes automatisk fra Google Drive-mappe via mappe_id-kolonne
   ============================================= */

const PORTFOLIO_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoVe-zXOkx8Ujj34RY9T6kEdPDS3XIpkQLJMFpInB6FKKSJfIhjqlkvWUavq-lOfhcN9G9ElXVeN9c/pub?gid=904554919&single=true&output=csv';
const DRIVE_API_KEY     = 'AIzaSyC2h-K_sKpCoKD_cd8L8InA43rsO9Jnn74';

const DEMO_PROSJEKTER = [
  { tittel: 'Kjøkken, Gjøvik',         kategori: 'Kjøkken',   beskrivelse: 'Et lyst og luftig kjøkken med profilerte fronter i hvit matt lakk.', dato: '2024' },
  { tittel: 'Walk-in garderobe, Oslo',  kategori: 'Garderobe', beskrivelse: 'Innebygd garderobe fra gulv til tak med skjulte hengsler og glidedører i røkt eik.', dato: '2024' },
  { tittel: 'Spisebord i eik',          kategori: 'Møbler',    beskrivelse: 'Massivt eikebord med organisk kant og stålunderramme.', dato: '2023' },
  { tittel: 'Kjøkken, Valdres',         kategori: 'Kjøkken',   beskrivelse: 'Mørkt kjøkken i matt antrasitt med åpne hyller i naturlig eik.', dato: '2023' },
];

let alleProsjekter  = [];
let aktivKategori   = 'Alle';
let lysbildeIndeks  = 0;
let slideIndeks     = 0;
let aktivProsjekter = [];

// ── Google Drive URL-konvertering ──
function driveUrl(fileId, bredde = 1200) {
  if (!fileId) return '';
  // Håndter at vi får full URL eller bare ID
  let id = fileId;
  let m = fileId.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) m = fileId.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) id = m[1];
  return `https://lh3.googleusercontent.com/d/${id}=w${bredde}`;
}

// ── Hent alle bilder i en Drive-mappe via API ──
async function hentMappebilder(mappeId) {
  if (!mappeId || !mappeId.trim()) return [];
  // Støtter full URL (https://drive.google.com/drive/folders/ID) eller bare ID
  let id = mappeId.trim();
  const m = id.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (m) id = m[1];
  try {
    const url = `https://www.googleapis.com/drive/v3/files`
      + `?q='${id}'+in+parents+and+mimeType+contains+'image/'`
      + `&fields=files(id,name)&orderBy=name&pageSize=50`
      + `&key=${DRIVE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.files || []).map(f => f.id);
  } catch {
    return [];
  }
}

// ── Normaliser kategori ──
function normaliserKategori(verdi) {
  const v = (verdi || '').toLowerCase().trim();
  if (v === 'kjokken' || v === 'kjøkken') return 'Kjøkken';
  if (v === 'garderobe')                  return 'Garderobe';
  if (v === 'mobel' || v === 'møbler' || v === 'mobeler') return 'Møbler';
  return 'Annet';
}

// ── Last inn prosjekter ──
async function lastProsjekter() {
  const galleri = document.getElementById('portfolio-galleri');

  if (PORTFOLIO_CSV_URL.includes('DIN_GOOGLE')) {
    alleProsjekter = DEMO_PROSJEKTER;
    visProsjekter('Alle');
    return;
  }

  try {
    const res = await fetch(PORTFOLIO_CSV_URL);
    if (!res.ok) throw new Error();
    const csv = await res.text();

    const rader = parseCSV(csv).filter(p => p.publiser?.toLowerCase() === 'ja');

    // Hent bilder fra Drive-mapper parallelt
    alleProsjekter = await Promise.all(rader.map(async p => {
      const kategori = normaliserKategori(p.kategori);

      // Støtter både mappe_id-kolonne og gamle bilde_url-kolonner
      let bilder = [];
      if (p.mappe_id && p.mappe_id.trim()) {
        bilder = await hentMappebilder(p.mappe_id.trim());
      } else {
        // Fallback: enkelt-URLer fra gamle kolonner
        bilder = [p.bilde_url, p.bilde_url_2, p.bilde_url_3]
          .filter(u => u && u.trim())
          .map(u => {
            let m = u.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (!m) m = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            return m ? m[1] : u;
          });
      }

      return { ...p, kategori, _bilder: bilder };
    }));

    visProsjekter('Alle');
  } catch {
    alleProsjekter = DEMO_PROSJEKTER;
    visProsjekter('Alle');
  }
}

// ── Vis filtrerte prosjekter ──
function visProsjekter(kategori) {
  aktivKategori   = kategori;
  aktivProsjekter = kategori === 'Alle'
    ? alleProsjekter
    : alleProsjekter.filter(p => p.kategori === kategori);

  const galleri  = document.getElementById('portfolio-galleri');
  const antallEl = document.getElementById('antall-visning');
  antallEl.textContent = `${aktivProsjekter.length} prosjekt${aktivProsjekter.length !== 1 ? 'er' : ''}`;
  galleri.innerHTML    = aktivProsjekter.map((p, i) => kortHTML(p, i)).join('');

  galleri.querySelectorAll('.pgalleri-kort').forEach((el, i) => {
    el.addEventListener('click', () => apneLysbilde(i));
  });
}

// ── HTML for ett kort ──
function kortHTML(p, i) {
  const farge    = ['#D4C5B0','#C9B99A','#BFB0A0','#D9CDBF','#CFC0AD','#C4B5A2'][i % 6];
  const bilder   = p._bilder || [];
  const forsteId = bilder[0];

  const bildeEl = forsteId
    ? `<img src="${driveUrl(forsteId)}" alt="${p.tittel}" loading="lazy" />`
    : `<div class="pgalleri-placeholder" style="background:${farge}">
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2">
          <rect x="8" y="8" width="32" height="32" rx="2"/>
          <circle cx="18" cy="18" r="4"/>
          <path d="M8 32 l10-10 8 8 6-6 8 8"/>
        </svg>
        <span>${p.tittel}</span>
      </div>`;

  return `
    <article class="pgalleri-kort" role="button" tabindex="0" aria-label="${p.tittel}">
      ${bildeEl}
      <div class="pgalleri-overlay">
        <div class="pgalleri-kat">${p.kategori}</div>
        <div class="pgalleri-tittel">${p.tittel}</div>
      </div>
    </article>
  `;
}

// ── Åpne lightbox ──
function apneLysbilde(indeks) {
  lysbildeIndeks = indeks;
  slideIndeks    = 0;
  oppdaterLysbilde();
  document.getElementById('lightbox').style.display = 'flex';
  document.getElementById('lightbox-bakgrunn').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// ── Oppdater lightbox-innhold ──
function oppdaterLysbilde() {
  const p      = aktivProsjekter[lysbildeIndeks];
  const bilder = p._bilder || [];

  document.getElementById('lightbox-tittel').textContent      = p.tittel;
  document.getElementById('lightbox-kategori').textContent    = p.kategori;
  document.getElementById('lightbox-beskrivelse').textContent = p.beskrivelse || '';

  // Vis/skjul piler basert på antall bilder
  const slideshow = document.getElementById('slideshow');
  slideshow.classList.toggle('ett-bilde', bilder.length <= 1);

  // Sett aktivt bilde
  byttSlide(0, bilder);

  // Bygg thumbnails
  const thumbContainer = document.getElementById('slideshow-thumbnails');
  if (bilder.length > 1) {
    thumbContainer.innerHTML = bilder.map((id, i) =>
      `<button class="slideshow-thumb ${i === 0 ? 'aktiv' : ''}" data-slide="${i}" aria-label="Bilde ${i + 1}">
         <img src="${driveUrl(id, 200)}" alt="Bilde ${i + 1}" loading="lazy" />
       </button>`
    ).join('');
    thumbContainer.querySelectorAll('.slideshow-thumb').forEach(btn => {
      btn.addEventListener('click', () => byttSlide(parseInt(btn.dataset.slide)));
    });
    thumbContainer.style.display = 'flex';
  } else {
    thumbContainer.innerHTML = '';
    thumbContainer.style.display = 'none';
  }
}

// ── Bytt bilde i slideshow ──
function byttSlide(nyIndeks, bilder) {
  bilder = bilder || (aktivProsjekter[lysbildeIndeks]._bilder || []);
  if (nyIndeks < 0) nyIndeks = bilder.length - 1;
  if (nyIndeks >= bilder.length) nyIndeks = 0;
  slideIndeks = nyIndeks;

  const img = document.getElementById('lightbox-bilde');
  img.src           = bilder[slideIndeks] ? driveUrl(bilder[slideIndeks]) : '';
  img.style.display = bilder[slideIndeks] ? 'block' : 'none';

  const teller = document.getElementById('slideshow-teller');
  teller.textContent = bilder.length > 1 ? `${slideIndeks + 1} / ${bilder.length}` : '';

  document.querySelectorAll('.slideshow-thumb').forEach((t, i) => {
    t.classList.toggle('aktiv', i === slideIndeks);
  });
}

function lukkLysbilde() {
  document.getElementById('lightbox').style.display = 'none';
  document.getElementById('lightbox-bakgrunn').style.display = 'none';
  document.body.style.overflow = '';
}

// ── Filter-knapper ──
document.getElementById('filter-knapper')?.addEventListener('click', (e) => {
  const knapp = e.target.closest('.filter-btn');
  if (!knapp) return;
  document.querySelectorAll('.filter-btn').forEach(k => k.classList.remove('active'));
  knapp.classList.add('active');
  visProsjekter(knapp.dataset.kategori);
});

// ── Slide-piler (innen ett prosjekt) ──
document.getElementById('slide-forrige')?.addEventListener('click', (e) => {
  e.stopPropagation();
  byttSlide(slideIndeks - 1);
});
document.getElementById('slide-neste')?.addEventListener('click', (e) => {
  e.stopPropagation();
  byttSlide(slideIndeks + 1);
});

// ── Lightbox-knapper ──
document.getElementById('lightbox-lukk')?.addEventListener('click', lukkLysbilde);
document.getElementById('lightbox-bakgrunn')?.addEventListener('click', lukkLysbilde);

document.getElementById('lightbox-neste')?.addEventListener('click', () => {
  lysbildeIndeks = (lysbildeIndeks + 1) % aktivProsjekter.length;
  slideIndeks = 0;
  oppdaterLysbilde();
});
document.getElementById('lightbox-forrige')?.addEventListener('click', () => {
  lysbildeIndeks = (lysbildeIndeks - 1 + aktivProsjekter.length) % aktivProsjekter.length;
  slideIndeks = 0;
  oppdaterLysbilde();
});

// ── Sveip (touch) ──
let touchStartX = 0, touchStartY = 0;
document.getElementById('lightbox')?.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
document.getElementById('lightbox')?.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
  if (Math.abs(dx) > 50 && dy < 80) {
    const bilder = aktivProsjekter[lysbildeIndeks]._bilder || [];
    if (bilder.length > 1) {
      byttSlide(dx < 0 ? slideIndeks + 1 : slideIndeks - 1);
    } else {
      lysbildeIndeks = dx < 0
        ? (lysbildeIndeks + 1) % aktivProsjekter.length
        : (lysbildeIndeks - 1 + aktivProsjekter.length) % aktivProsjekter.length;
      slideIndeks = 0;
      oppdaterLysbilde();
    }
  }
}, { passive: true });

// ── Tastaturnavigasjon ──
document.addEventListener('keydown', (e) => {
  if (document.getElementById('lightbox').style.display === 'none') return;
  const bilder = aktivProsjekter[lysbildeIndeks]._bilder || [];
  if (e.key === 'Escape') {
    lukkLysbilde();
  } else if (e.key === 'ArrowRight') {
    if (bilder.length > 1 && slideIndeks < bilder.length - 1) byttSlide(slideIndeks + 1);
    else { lysbildeIndeks = (lysbildeIndeks + 1) % aktivProsjekter.length; slideIndeks = 0; oppdaterLysbilde(); }
  } else if (e.key === 'ArrowLeft') {
    if (bilder.length > 1 && slideIndeks > 0) byttSlide(slideIndeks - 1);
    else { lysbildeIndeks = (lysbildeIndeks - 1 + aktivProsjekter.length) % aktivProsjekter.length; slideIndeks = 0; oppdaterLysbilde(); }
  }
});

// ── CSV-parser ──
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

// ── Start ──
lastProsjekter();
