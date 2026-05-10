/* ─────────────────────────────────────────────────────────
   analytics.js
   Tynt skall som rutere events til Plausible Analytics.
   Plausible-scriptet lastes via <head> i hver HTML-fil.

   Bruk:
     analytics.track('event_navn', { prop1: 'verdi' })

   Eksempler:
     analytics.track('generate_lead', { type: 'guide' })
     analytics.track('click_phone')
     analytics.track('click_email')

   Hvis Plausible-scriptet ikke er lastet (f.eks. ved
   nettverksfeil eller ad-blocker) feiler kallene stille.
   ───────────────────────────────────────────────────────── */

const analytics = (function () {
  function track(event, props) {
    if (typeof window.plausible === 'function') {
      if (props && Object.keys(props).length > 0) {
        window.plausible(event, { props: props });
      } else {
        window.plausible(event);
      }
    }
  }

  return { track };
})();
