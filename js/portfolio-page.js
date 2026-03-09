/* =============================================
   På Millimetern – portfolio-page.js
   Filtrering, lightbox med slideshow og Google Sheets-henting
   
   Mediehåndtering:
   - Bilder: Google Drive-mappe via API (mappe_id-kolonne)
   - Video:  YouTube (youtube_id-kolonne) – autoplay, muted, loop, ingen kontroller
   ============================================= */

const PORTFOLIO_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoVe-zXOkx8Ujj34RY9T6kEdPDS3XIpkQLJMFpInB6FKKSJfIhjqlkvWUavq-lOfhcN9G9ElXVeN9c/pub?gid=904554919&single=true&output=csv';
const DRIVE_API_KEY     = 'AIzaSyC2h-K_sKpCoKD_cd8L8InA43rsO9Jnn74';

const DEMO_PROSJEKTER = [
  { tittel: 'Kjøkken, Gjøvik',        kategori: 'Kjøkken',   beskrivelse: 'Et lyst og luftig kjøkken med profilerte fronter i hvit matt lakk.', dato: '2024' },
  { tittel: 'Walk-in garderobe, Oslo', kategori: 'Garderobe', beskrivelse: 'Innebygd garderobe fra gulv til tak med skjulte hengsler og glidedører i røkt eik.', dato: '2024' },
  { tittel: 'Spisebord i eik',         kategori: 'Møbler',    beskrivelse: 'Massivt eikebord med organisk kant og stålunderramme.', dato: '2023' },
  { tittel: 'Kjøkken, Valdres',        kategori: 'Kjøkken',   beskrivelse: 'Mørkt kjøkken i matt antrasitt med åpne hyller i naturlig eik.', dato: '2023' },
];

let alleProsjekter  = [];
let aktivKategori   = 'Alle';
let lysbildeIndeks  = 0;
let slideIndeks     = 0;
let aktivProsjekter = [];

// ── Google Drive bilde-URL ──
function driveUrl(fileId, bredde = 1200) {
  if (!fileId) return '';
  let id = fileId;
  let m = fileId.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) m = fileId.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) id = m[1];
  return `https://lh3.googleusercontent.com/d/${id}=w${bredde}`;
}

// ── YouTube ID-ekstraksjon ──
// Støtter: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID, eller bare ID
function youtubeId(verdi) {
  if (!verdi || !verdi.trim()) return null;
  const v = verdi.trim();
  let m;
  m = v.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);        if (m) return m[1];
  m = v.match(/[?&]v=([a-zA-Z0-9_-]{11})/);             if (m) return m[1];
  m = v.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);          if (m) return m[1];
  m = v.match(/\/embed\/([a-zA-Z0-9_-]{11})/);           if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;           // bare ID
  return null;
}

// ── YouTube embed-URL for gallerikort (bakgrunnsvideo, muted autoplay loop) ──
function ytKortUrl(id) {
  return `https://www.youtube-nocookie.com/embed/${id}`
    + `?autoplay=1&mute=1&loop=1&playlist=${id}`
    + `&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
}

// ── YouTube embed-URL for lightbox (med lyd-kontroll synlig, autoplay) ──
function ytLightboxUrl(id) {
  return `https://www.youtube-nocookie.com/embed/${id}`
    + `?autoplay=1&mute=1&loop=1&playlist=${id}`
    + `&modestbranding=1&rel=0&iv_load_policy=3`;
}

// ── YouTube thumbnail som stillbilde ──
function ytThumbnail(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// ── Hent alle bilder fra en Drive-mappe via API ──
async function hentMappebilder(mappeId) {
  if (!mappeId || !mappeId.trim()) return [];
  let id = mappeId.trim();
  const m = id.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (m) id = m[1];
  try {
    const q = encodeURIComponent(`'${id}' in parents and mimeType contains 'image/'`);
    const url = `https://www.googleapis.com/drive/v3/files`
      + `?q=${q}&fields=files(id,name,mimeType)&orderBy=name&pageSize=50`
      + `&key=${DRIVE_API_KEY}`;
    // Timeout på 5 sekunder – Drive API skal ikke blokkere hele lastet
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.files || []).map(f => ({
      type:  'bilde',
      id:    f.id,
      navn:  f.name,
    }));
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
  if (PORTFOLIO_CSV_URL.includes('DIN_GOOGLE')) {
    alleProsjekter = DEMO_PROSJEKTER.map(p => ({ ...p, _medier: [] }));
    visProsjekter('Alle');
    return;
  }

  try {
    const res = await fetch(PORTFOLIO_CSV_URL);
    if (!res.ok) throw new Error();
    const csv = await res.text();
    const rader = parseCSV(csv).filter(p => p.publiser?.toLowerCase() === 'ja');

    alleProsjekter = await Promise.all(rader.map(async p => {
      const kategori = normaliserKategori(p.kategori);

      // Bilder fra Drive-mappe
      let medier = [];
      if (p.mappe_id && p.mappe_id.trim()) {
        medier = await hentMappebilder(p.mappe_id.trim());
        // Fallback til bilde_url-kolonner hvis Drive API feiler (f.eks. 403)
        if (medier.length === 0) {
          for (const u of [p.bilde_url, p.bilde_url_2, p.bilde_url_3]) {
            if (!u || !u.trim() || youtubeId(u.trim())) continue;
            let m = u.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (!m) m = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (m) medier.push({ type: 'bilde', id: m[1], navn: '' });
          }
        }
      } else {
        // Fallback: gamle bilde_url-kolonner
        // Sjekker også om noen av disse er YouTube-URLer (feilplassert)
        for (const u of [p.bilde_url, p.bilde_url_2, p.bilde_url_3]) {
          if (!u || !u.trim()) continue;
          const ytID = youtubeId(u.trim());
          if (ytID) {
            medier.push({ type: 'youtube', id: ytID, navn: 'Video' });
          } else {
            let m = u.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (!m) m = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            medier.push({ type: 'bilde', id: m ? m[1] : u, navn: '' });
          }
        }
      }

      // YouTube-video legges inn som eget medium (plasseres sist i slideshowet)
      // Støtter kommaseparert liste med flere YouTube-IDer
      if (p.youtube_id && p.youtube_id.trim()) {
        const ytIDer = p.youtube_id.split(',').map(s => s.trim()).filter(Boolean);
        for (const ytRaw of ytIDer) {
          const ytID = youtubeId(ytRaw);
          if (ytID) medier.push({ type: 'youtube', id: ytID, navn: 'Video' });
        }
      }

      return { ...p, kategori, _medier: medier };
    }));

    visProsjekter('Alle');
  } catch {
    alleProsjekter = DEMO_PROSJEKTER.map(p => ({ ...p, _medier: [] }));
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

// ── HTML for ett galleri-kort ──
function kortHTML(p, i) {
  const farge  = ['#D4C5B0','#C9B99A','#BFB0A0','#D9CDBF','#CFC0AD','#C4B5A2'][i % 6];
  const medier = p._medier || [];

  // Foretrekk første bilde som forsidebilde; fall tilbake på YouTube-thumbnail
  const bildeMedium = medier.find(m => m.type === 'bilde');
  const ytMedium    = medier.find(m => m.type === 'youtube');
  const harVideo    = !!ytMedium;

  let mediEl;
  if (bildeMedium) {
    mediEl = `<img src="${driveUrl(bildeMedium.id)}" alt="${p.tittel}" loading="lazy" />`;
  } else if (ytMedium) {
    // Ingen bilde – vis YouTube-thumbnail som forsidebilde
    mediEl = `<img src="${ytThumbnail(ytMedium.id)}" alt="${p.tittel}" loading="lazy" />`;
  } else {
    mediEl = `<div class="pgalleri-placeholder" style="background:${farge}">
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2">
        <rect x="8" y="8" width="32" height="32" rx="2"/>
        <circle cx="18" cy="18" r="4"/>
        <path d="M8 32 l10-10 8 8 6-6 8 8"/>
      </svg>
      <span>${p.tittel}</span>
    </div>`;
  }

  return `
    <article class="pgalleri-kort${harVideo ? ' har-video' : ''}" role="button" tabindex="0" aria-label="${p.tittel}">
      ${mediEl}
      ${harVideo ? `<div class="pgalleri-video-ikon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.45)"/>
          <polygon points="10,8 17,12 10,16" fill="white"/>
        </svg>
      </div>` : ''}
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

// ── Fjern YouTube-iframe fra lightbox ──
function fjernYtIframe() {
  const el = document.getElementById('lightbox-yt-iframe');
  if (el) el.remove();
}

// ── Oppdater lightbox-innhold ──
function oppdaterLysbilde() {
  const p      = aktivProsjekter[lysbildeIndeks];
  const medier = p._medier || [];

  document.getElementById('lightbox-tittel').textContent      = p.tittel;
  document.getElementById('lightbox-kategori').textContent    = p.kategori;
  document.getElementById('lightbox-beskrivelse').textContent = p.beskrivelse || '';

  const slideshow = document.getElementById('slideshow');
  slideshow.classList.toggle('ett-bilde', medier.length <= 1);

  byttSlide(0, medier);

  // Thumbnails
  const thumbContainer = document.getElementById('slideshow-thumbnails');
  if (medier.length > 1) {
    thumbContainer.innerHTML = medier.map((m, i) => {
      if (m.type === 'youtube') {
        return `<button class="slideshow-thumb yt-thumb ${i === 0 ? 'aktiv' : ''}" data-slide="${i}" aria-label="Video ${i + 1}">
          <img src="${ytThumbnail(m.id)}" alt="Video ${i + 1}" loading="lazy" />
          <div class="thumb-play-ikon">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.55)"/>
              <polygon points="10,8 17,12 10,16" fill="white"/>
            </svg>
          </div>
        </button>`;
      }
      return `<button class="slideshow-thumb ${i === 0 ? 'aktiv' : ''}" data-slide="${i}" aria-label="Bilde ${i + 1}">
        <img src="${driveUrl(m.id, 200)}" alt="Bilde ${i + 1}" loading="lazy" />
      </button>`;
    }).join('');
    thumbContainer.querySelectorAll('.slideshow-thumb').forEach(btn => {
      btn.addEventListener('click', () => byttSlide(parseInt(btn.dataset.slide)));
    });
    thumbContainer.style.display = 'flex';
  } else {
    thumbContainer.innerHTML = '';
    thumbContainer.style.display = 'none';
  }
}

// ── Bytt medium i slideshow ──
function byttSlide(nyIndeks, medier) {
  medier = medier || (aktivProsjekter[lysbildeIndeks]._medier || []);
  if (nyIndeks < 0) nyIndeks = medier.length - 1;
  if (nyIndeks >= medier.length) nyIndeks = 0;
  slideIndeks = nyIndeks;

  const medium = medier[slideIndeks];
  const img    = document.getElementById('lightbox-bilde');

  // Rydd alltid opp YouTube-iframe fra forrige slide
  fjernYtIframe();

  if (medium && medium.type === 'youtube') {
    // YouTube: lag iframe
    img.style.display = 'none';
    img.src = '';

    const iframe = document.createElement('iframe');
    iframe.id            = 'lightbox-yt-iframe';
    iframe.src           = ytLightboxUrl(medium.id);
    iframe.allow         = 'autoplay; fullscreen';
    iframe.allowFullscreen = true;
    iframe.frameBorder   = '0';
    iframe.className     = 'lightbox-yt-iframe';
    img.parentNode.insertBefore(iframe, img);

  } else {
    // Bilde
    img.src           = medium ? driveUrl(medium.id) : '';
    img.style.display = medium ? 'block' : 'none';
  }

  const teller = document.getElementById('slideshow-teller');
  teller.textContent = medier.length > 1 ? `${slideIndeks + 1} / ${medier.length}` : '';

  document.querySelectorAll('.slideshow-thumb').forEach((t, i) => {
    t.classList.toggle('aktiv', i === slideIndeks);
  });
}

function lukkLysbilde() {
  fjernYtIframe();
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

// ── Slide-piler ──
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
  fjernYtIframe();
  lysbildeIndeks = (lysbildeIndeks + 1) % aktivProsjekter.length;
  slideIndeks = 0;
  oppdaterLysbilde();
});
document.getElementById('lightbox-forrige')?.addEventListener('click', () => {
  fjernYtIframe();
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
    const medier = aktivProsjekter[lysbildeIndeks]._medier || [];
    if (medier.length > 1) {
      byttSlide(dx < 0 ? slideIndeks + 1 : slideIndeks - 1);
    } else {
      fjernYtIframe();
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
  const medier = aktivProsjekter[lysbildeIndeks]._medier || [];
  if (e.key === 'Escape') {
    lukkLysbilde();
  } else if (e.key === 'ArrowRight') {
    if (medier.length > 1 && slideIndeks < medier.length - 1) byttSlide(slideIndeks + 1);
    else { fjernYtIframe(); lysbildeIndeks = (lysbildeIndeks + 1) % aktivProsjekter.length; slideIndeks = 0; oppdaterLysbilde(); }
  } else if (e.key === 'ArrowLeft') {
    if (medier.length > 1 && slideIndeks > 0) byttSlide(slideIndeks - 1);
    else { fjernYtIframe(); lysbildeIndeks = (lysbildeIndeks - 1 + aktivProsjekter.length) % aktivProsjekter.length; slideIndeks = 0; oppdaterLysbilde(); }
  }
});

// RFC 4180-kompatibel parser – håndterer linjeskift og komma inne i anførselstegn
function parseCSV(tekst) {
  const rader = [];
  let felt = [], verdi = '', iAnforsels = false;
  const t = tekst.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (iAnforsels) {
      if (c === '"' && t[i + 1] === '"') { verdi += '"'; i++; }
      else if (c === '"') { iAnforsels = false; }
      else { verdi += c; }
    } else {
      if (c === '"') { iAnforsels = true; }
      else if (c === ',') { felt.push(verdi.trim()); verdi = ''; }
      else if (c === '\n') {
        felt.push(verdi.trim());
        rader.push(felt);
        felt = []; verdi = '';
      } else { verdi += c; }
    }
  }
  if (verdi || felt.length) { felt.push(verdi.trim()); if (felt.some(v => v)) rader.push(felt); }

  if (rader.length < 2) return [];
  const overskrifter = rader[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
  return rader.slice(1)
    .filter(rad => rad.some(v => v))
    .map(rad => Object.fromEntries(overskrifter.map((h, i) => [h, rad[i] ?? ''])));
}

// ── Start ──
lastProsjekter();
