/* =============================================
   På Millimetern – blogg-en.js
   
   English blog article preview for homepage.
   Shows demo cards linking to English blog articles.
   When Google Sheets blog integration is set up,
   update BLOGG_SHEET_CSV_URL with the sheet URL.
   ============================================= */

const BLOGG_SHEET_CSV_URL_EN = 'DIN_BLOGG_SHEETS_CSV_URL_HER';

async function lastBloggEn(maxAntall = 3) {
  const container = document.getElementById('blogg-grid');
  if (!container) return;

  if (BLOGG_SHEET_CSV_URL_EN.includes('DIN_BLOGG')) {
    container.innerHTML = lagDemoBloggEn();
    return;
  }

  try {
    const res = await fetch(BLOGG_SHEET_CSV_URL_EN);
    if (!res.ok) throw new Error('Could not fetch blog data');
    const csv = await res.text();
    const artikler = parseCSVEn(csv).slice(0, maxAntall);
    container.innerHTML = artikler.map(bloggKortHTMLEn).join('');
  } catch (err) {
    console.warn('Blog error:', err.message);
    container.innerHTML = lagDemoBloggEn();
  }
}

function bloggKortHTMLEn(a) {
  return `
    <article class="blogg-card">
      <div class="blogg-card-meta">${a.category || 'Guide'}${a.date ? ' · ' + a.date : ''}</div>
      <h4><a href="/en/blog/${a.slug || '#'}.html">${a.title}</a></h4>
      <p>${a.excerpt}</p>
      <a href="/en/blog/${a.slug || '#'}.html">Read more →</a>
    </article>
  `;
}

function lagDemoBloggEn() {
  const artikler = [
    {
      meta: 'Guide · Kitchens',
      tittel: 'What does a custom kitchen cost?',
      ingress: 'The price of a handmade kitchen depends on many factors – but the answer is rarely as high as people expect.',
      href: '/en/blog/what-does-a-custom-kitchen-cost.html'
    },
    {
      meta: 'Guide · Kitchens',
      tittel: 'IKEA kitchen vs. custom kitchen – what\'s the difference?',
      ingress: 'A standard kitchen fits a standard room. But most rooms aren\'t standard. Here\'s what you actually get when you choose a carpenter.',
      href: '/en/blog/ikea-vs-custom-kitchen.html'
    },
    {
      meta: 'Guide · Wardrobes',
      tittel: 'What are the best materials for a wardrobe?',
      ingress: 'From solid timber to MDF and veneer – we explain the differences and help you choose right for your needs and budget.',
      href: '/en/blog/wardrobe-materials.html'
    },
  ];
  return artikler.map(a => `
    <article class="blogg-card">
      <div class="blogg-card-meta">${a.meta}</div>
      <h4><a href="${a.href}">${a.tittel}</a></h4>
      <p>${a.ingress}</p>
      <a href="${a.href}">Read more →</a>
    </article>
  `).join('');
}

function parseCSVEn(tekst) {
  const linjer = tekst.trim().split('\n');
  const overskrifter = linjer[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return linjer.slice(1).map(linje => {
    const verdier = linje.split(',');
    return Object.fromEntries(
      overskrifter.map((h, i) => [h, (verdier[i] || '').replace(/^"|"$/g, '').trim()])
    );
  });
}

lastBloggEn();
