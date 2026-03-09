/* =============================================
   På Millimetern – main.js
   Navigasjon, scroll-effekter, animasjoner
   ============================================= */

// ── Årstall i footer ──
document.getElementById('year').textContent = new Date().getFullYear();

// ── Header: legg til .scrolled ved scroll ──
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Mobilmeny ──
const toggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

toggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Lukk mobilmeny ved klikk på lenke
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

// ── Scroll-reveal ──
// Legg til .reveal på seksjoner som skal animeres inn
const revealTargets = document.querySelectorAll(
  '.tjeneste-card, .om-oss-inner > *, .facts-strip .fact, .blogg-card, .portfolio-card'
);

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealTargets.forEach(el => observer.observe(el));
