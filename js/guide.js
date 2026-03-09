/* =============================================
   På Millimetern – guide.js
   Steg-navigasjon, validering og progressbar
   ============================================= */

const TOTAL_STEG = 5;
let aktivtSteg = 1;

// ── Initialiser fra URL-parameter ──
// guide.html?type=kjokken hopper rett til valgt type
(function initFraURL() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const typeMap = {
    kjokken:   'Kjøkken',
    garderobe: 'Garderobe',
    mobel:     'Møbel',
    annet:     'Annet',
  };
  if (type && typeMap[type]) {
    const radio = document.querySelector(`input[name="type"][value="${typeMap[type]}"]`);
    if (radio) radio.checked = true;
  }
})();

// ── Hent alle steg-elementer ──
function getSteg(nr) {
  return document.getElementById(`step-${nr}`);
}
function getDot(nr) {
  return document.querySelector(`.guide-step-dot[data-step="${nr}"]`);
}

// ── Oppdater progressbar ──
function oppdaterProgress(steg) {
  const prosent = (steg / TOTAL_STEG) * 100;
  document.getElementById('guide-progress-bar').style.width = `${prosent}%`;
}

// ── Oppdater steg-dots i aside ──
function oppdaterDots(steg) {
  for (let i = 1; i <= TOTAL_STEG; i++) {
    const dot = getDot(i);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i === steg)   dot.classList.add('active');
    if (i < steg)     dot.classList.add('done');
  }
}

// ── Valider nåværende steg ──
function validerSteg(steg) {
  if (steg === 1) {
    const valgt = document.querySelector('input[name="type"]:checked');
    if (!valgt) {
      visValideringsFeil('Du må velge hva du trenger hjelp med.');
      return false;
    }
  }
  if (steg === 4) {
    const valgt = document.querySelector('input[name="tidshorisont"]:checked');
    if (!valgt) {
      visValideringsFeil('Vennligst velg en tidshorisont.');
      return false;
    }
  }
  fjernValideringsFeil();
  return true;
}

function visValideringsFeil(melding) {
  let feil = document.getElementById('validering-feil');
  if (!feil) {
    feil = document.createElement('div');
    feil.id = 'validering-feil';
    feil.style.cssText = `
      color: #C0392B;
      background: rgba(192,57,43,0.08);
      border: 1px solid rgba(192,57,43,0.2);
      border-radius: 4px;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    `;
  }
  feil.textContent = melding;
  const aktivStegEl = getSteg(aktivtSteg);
  const stepNav = aktivStegEl.querySelector('.step-nav');
  aktivStegEl.insertBefore(feil, stepNav);
  feil.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function fjernValideringsFeil() {
  const feil = document.getElementById('validering-feil');
  if (feil) feil.remove();
}

// ── Gå til neste steg ──
function neste(fraSteg) {
  if (!validerSteg(fraSteg)) return;

  const gammelt = getSteg(fraSteg);
  const nytt = getSteg(fraSteg + 1);
  if (!nytt) return;

  gammelt.classList.remove('active');
  nytt.classList.add('active');
  aktivtSteg = fraSteg + 1;

  oppdaterProgress(aktivtSteg);
  oppdaterDots(aktivtSteg);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Gå til forrige steg ──
function forrige(fraSteg) {
  if (fraSteg <= 1) return;
  fjernValideringsFeil();

  const gammelt = getSteg(fraSteg);
  const nytt = getSteg(fraSteg - 1);

  gammelt.classList.remove('active');
  nytt.classList.add('active');
  aktivtSteg = fraSteg - 1;

  oppdaterProgress(aktivtSteg);
  oppdaterDots(aktivtSteg);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Filnavn-visning ved opplasting ──
const filInput = document.getElementById('bilde');
if (filInput) {
  filInput.addEventListener('change', () => {
    const filnavn = filInput.files[0]?.name;
    const tekst = document.querySelector('.file-upload-text');
    if (filnavn && tekst) tekst.textContent = `✓ ${filnavn}`;
  });
}

// ── Skjema-innsending ──
// Netlify Forms håndterer selve POST-en.
// Vi viser en tilpasset takk-melding i stedet for redirect.
const form = document.getElementById('guide-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitKnapp = form.querySelector('[type="submit"]');
    submitKnapp.disabled = true;
    submitKnapp.textContent = 'Sender…';

    try {
      const formData = new FormData(form);
      // Formspree endpoint – sett inn riktig ID fra formspree.io
      const formspreeUrl = form.action || 'https://formspree.io/f/mzdjddbw';
      const res = await fetch(formspreeUrl, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        form.style.display = 'none';
        document.getElementById('guide-takk').style.display = 'flex';
        document.getElementById('guide-progress-bar').style.width = '100%';
        oppdaterDots(6); // alle done
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Nettverksfeil');
      }
    } catch {
      submitKnapp.disabled = false;
      submitKnapp.textContent = 'Send forespørsel →';
      visValideringsFeil('Noe gikk galt. Prøv igjen, eller send oss en e-post direkte.');
    }
  });
}

// ── Init ──
oppdaterProgress(1);
oppdaterDots(1);
