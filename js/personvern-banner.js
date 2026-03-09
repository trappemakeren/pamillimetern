/* ─────────────────────────────────────────────────────────
   personvern-banner.js  (v2 – med GA-samtykke)
   Viser samtykkebanner første gang. Husker valg i localStorage.
   Avhenger av analytics.js som må lastes FØR denne filen.
   ───────────────────────────────────────────────────────── */

(function () {
  const NØKKEL = 'pam_personvern_sett';

  // Allerede tatt et valg – ikke vis banner
  if (localStorage.getItem(NØKKEL)) return;

  // Finn riktig base-sti for lenker (håndterer undermapper)
  const base = document.querySelector('base')?.href || '/';

  const banner = document.createElement('div');
  banner.id = 'personvern-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-modal', 'false');
  banner.setAttribute('aria-label', 'Informasjonskapsler og personvern');
  banner.innerHTML = `
    <div class="pvb-innhold">
      <div class="pvb-tekst">
        <strong>Informasjonskapsler</strong>
        <p>
          Vi bruker ingen sporings-cookies som standard. Vi vil gjerne bruke
          Google Analytics for å forstå hvordan siden brukes – kun med ditt samtykke.
          <a href="${base}personvern.html">Les mer →</a>
        </p>
      </div>
      <div class="pvb-knapper">
        <button id="pvb-avslaa">Bare nødvendige</button>
        <button id="pvb-aksepter">Godta analyse</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('synlig'));
  });

  document.getElementById('pvb-aksepter').addEventListener('click', () => {
    localStorage.setItem(NØKKEL, '1');
    analytics.aksepter();
    lukkBanner();
  });

  document.getElementById('pvb-avslaa').addEventListener('click', () => {
    localStorage.setItem(NØKKEL, '1');
    analytics.avslaa();
    lukkBanner();
  });

  function lukkBanner() {
    banner.classList.remove('synlig');
    banner.classList.add('skjult');
    setTimeout(() => banner.remove(), 400);
  }
})();
