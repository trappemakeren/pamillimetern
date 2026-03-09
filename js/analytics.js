/* ─────────────────────────────────────────────────────────
   analytics.js
   Laster Google Analytics kun etter eksplisitt samtykke.
   Samtykke lagres i localStorage: pam_ga_samtykke = 'ja' | 'nei'

   Bruk:
     analytics.samtykke()   → har brukeren samtykket?
     analytics.aksepter()   → bruker godtar – last GA
     analytics.avslaa()     → bruker avslår – ikke last GA
     analytics.tilbakestill() → slett samtykke (for testing)
   ───────────────────────────────────────────────────────── */

const analytics = (function () {
  const NØKKEL   = 'pam_ga_samtykke';
  const GA_ID    = 'G-XXXXXXXXXX'; // ← BYTT UT MED DITT MÅLINGS-ID FRA GOOGLE ANALYTICS

  function samtykke() {
    return localStorage.getItem(NØKKEL);
  }

  function lastGA() {
    if (window._gaLastet) return;
    window._gaLastet = true;

    // Legg til GA-script
    const script = document.createElement('script');
    script.async = true;
    script.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true,         // IP-anonymisering
      allow_google_signals: false, // Ingen remarketing
      allow_ad_personalization_signals: false
    });
  }

  function aksepter() {
    localStorage.setItem(NØKKEL, 'ja');
    lastGA();
  }

  function avslaa() {
    localStorage.setItem(NØKKEL, 'nei');
    // Sørg for at GA ikke lastes
    window['ga-disable-' + GA_ID] = true;
  }

  function tilbakestill() {
    localStorage.removeItem(NØKKEL);
    localStorage.removeItem('pam_personvern_sett');
    location.reload();
  }

  // Last GA automatisk hvis bruker allerede har samtykket
  if (samtykke() === 'ja') {
    lastGA();
  }

  return { samtykke, aksepter, avslaa, tilbakestill };
})();
