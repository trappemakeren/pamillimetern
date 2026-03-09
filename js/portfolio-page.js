/* =============================================
   På Millimetern – portfolio-page.js
   Filtrering, lightbox med slideshow og Google Sheets-henting
   Bilder og videoer (mp4) hentes fra Google Drive-mappe via mappe_id-kolonne
   Videoer spilles automatisk, uten lyd og uten kontroller.
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

// ── Er dette en video-fil? ──
function erVideo(filnavn) {
  return /\.(mp4|mov|webm)$/i.test(filnavn || '');
}

// ── Google Drive bilde-URL ──
function driveUrl(fileId, bredde = 1200) {
  if (!fileId) return '';
  let id = fileId;
  let m = fileId.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) m = fileId.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) id = m[1];
  return `https://lh3.googleusercontent.com/d/${id}=w${bredde}`;
}

// ── Google Drive video-URL (direkte nedlasting/streaming) ──
function driveVideoUrl(fileId) {
  if (!fileId) return '';
  let id = fileId;
  let m = fileId.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) m = fileId.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) id = m[1];
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

// ── Hent alle mediefiler (bilder + mp4) fra en Drive-mappe ──
async function hentMappebilder(mappeId) {
  if (!mappeId || !mappeId.trim()) return [];
  let id = mappeId.trim();
  const m = id.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (m) id = m[1];
  try {
    // Hent både bilder og mp4-videoer i én forespørsel
    const q = encodeURIComponent(
      `'${id}' in parents and (mimeType contains 'image/' or mimeType = 'video/mp4' or mimeType = 'video/quicktime')`
    );
    const url = `https://www.googleapis.com/drive/v3/files`
      + `?q=${q}&fields=files(id,name,mimeType)&orderBy=name&pageSize=50`
      + `&key=${DRIVE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    // Returner objekt med id, navn og type for hvert media
    return (data.files || []).map(f => ({
      id:      f.id,
      navn:    f.name,
      erVideo: f.mimeType.startsWith('video/'),
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

      let medier = []; // Array av { id, navn, erVideo }
      if (p.mappe_id && p.mappe_id.trim()) {
        medier = await hentMappebilder(p.mappe_id.trim());
      } else {
        // Fallback: gamle bilde_url-kolonner (antas å være bilder)
        medier = [p.bilde_url, p.bilde_url_2, p.bilde_url_3]
          .filter(u => u && u.trim())
          .map(u => {
            let m = u.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (!m) m = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            const id = m ? m[1] : u;
            return { id, navn: '', erVideo: false };
          });
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
  const farge   = ['#D4C5B0','#C9B99A','#BFB0A0','#D9CDBF','#CFC0AD','#C4B5A2'][i % 6];
  const medier  = p._medier || [];
  const forste  = medier[0];

  let mediEl;
  if (!forste) {
    // Ingen media – vis placeholder
    mediEl = `<div class="pgalleri-placeholder" style="background:${farge}">
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2">
        <rect x="8" y="8" width="32" height="32" rx="2"/>
        <circle cx="18" cy="18" r="4"/>
        <path d="M8 32 l10-10 8 8 6-6 8 8"/>
      </svg>
      <span>${p.tittel}</span>
    </div>`;
  } else if (forste.erVideo) {
    // Video som bakgrunn i kortet – autoplay, muted, loop, ingen kontroller
    mediEl = `<video src="${driveVideoUrl(forste.id)}" autoplay muted loop playsinline
                class="pgalleri-video" aria-hidden="true"></video>
              <div class="pgalleri-video-ikon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                  <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.35)"/>
                  <polygon points="10,8 17,12 10,16" fill="white"/>
                </svg>
              </div>`;
  } else {
    mediEl = `<img src="${driveUrl(forste.id)}" alt="${p.tittel}" loading="lazy" />`;
  }

  return `
    <article class="pgalleri-kort" role="button" tabindex="0" aria-label="${p.tittel}">
      ${mediEl}
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

// ── Stopp aktiv video i lightbox (ved bytte/lukking) ──
function stoppLightboxVideo() {
  const v = document.getElementById('lightbox-video');
  if (v) { v.pause(); v.src = ''; }
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

  // Bygg thumbnails
  const thumbContainer = document.getElementById('slideshow-thumbnails');
  if (medier.length > 1) {
    thumbContainer.innerHTML = medier.map((m, i) => {
      if (m.erVideo) {
        return `<button class="slideshow-thumb ${i === 0 ? 'aktiv' : ''}" data-slide="${i}" aria-label="Video ${i + 1}">
          <div class="thumb-video-ikon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.5)"/>
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

// ── Bytt media i slideshow ──
function byttSlide(nyIndeks, medier) {
  medier = medier || (aktivProsjekter[lysbildeIndeks]._medier || []);
  if (nyIndeks < 0) nyIndeks = medier.length - 1;
  if (nyIndeks >= medier.length) nyIndeks = 0;
  slideIndeks = nyIndeks;

  const medium = medier[slideIndeks];
  const img    = document.getElementById('lightbox-bilde');
  let   vid    = document.getElementById('lightbox-video');

  if (medium && medium.erVideo) {
    // Vis video, skjul bilde
    img.style.display = 'none';
    img.src = '';
    if (!vid) {
      // Lag video-element første gang
      vid = document.createElement('video');
      vid.id          = 'lightbox-video';
      vid.autoplay    = true;
      vid.muted       = true;
      vid.loop        = true;
      vid.playsInline = true;
      vid.style.cssText = 'max-width:100%;max-height:70vh;display:block;margin:auto;border-radius:4px;';
      img.parentNode.insertBefore(vid, img);
    }
    vid.src           = driveVideoUrl(medium.id);
    vid.style.display = 'block';
    vid.load();
    vid.play().catch(() => {});
  } else {
    // Vis bilde, stopp/skjul video
    if (vid) { vid.pause(); vid.src = ''; vid.style.display = 'none'; }
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
  stoppLightboxVideo();
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
  stoppLightboxVideo();
  lysbildeIndeks = (lysbildeIndeks + 1) % aktivProsjekter.length;
  slideIndeks = 0;
  oppdaterLysbilde();
});
document.getElementById('lightbox-forrige')?.addEventListener('click', () => {
  stoppLightboxVideo();
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
      stoppLightboxVideo();
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
    else { stoppLightboxVideo(); lysbildeIndeks = (lysbildeIndeks + 1) % aktivProsjekter.length; slideIndeks = 0; oppdaterLysbilde(); }
  } else if (e.key === 'ArrowLeft') {
    if (medier.length > 1 && slideIndeks > 0) byttSlide(slideIndeks - 1);
    else { stoppLightboxVideo(); lysbildeIndeks = (lysbildeIndeks - 1 + aktivProsjekter.length) % aktivProsjekter.length; slideIndeks = 0; oppdaterLysbilde(); }
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
