/* ─────────────────────────────────────────────────────────
   personvern-banner.js
   Enkel informasjonsbanner – ikke samtykkebanner (vi bruker
   ingen sporings-cookies). Vises én gang, huskes i localStorage.
   ───────────────────────────────────────────────────────── */

(function () {
  const NØKKEL = 'pam_personvern_sett';

  if (localStorage.getItem(NØKKEL)) return;

  const banner = document.createElement('div');
  banner.id = 'personvern-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Informasjon om personvern');
  banner.innerHTML = `
    <div class="pvb-innhold">
      <p>
        Denne nettsiden bruker ingen sporings-cookies.
        Vi behandler kun opplysninger du selv sender inn via skjema.
        <a href="/pamillimetern/personvern.html">Les personvernerklæringen →</a>
      </p>
      <button id="pvb-lukk" aria-label="Lukk personvernmelding">OK, skjønt</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Animer inn
  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('synlig'));
  });

  document.getElementById('pvb-lukk').addEventListener('click', () => {
    banner.classList.remove('synlig');
    banner.classList.add('skjult');
    localStorage.setItem(NØKKEL, '1');
    setTimeout(() => banner.remove(), 400);
  });
})();
