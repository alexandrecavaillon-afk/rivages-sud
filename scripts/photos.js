// Récupère les photos d'une annonce dont les images se chargent en JavaScript.
//   node scripts/photos.js https://www.exemple.fr/annonce-123
// Ouvre la page dans un navigateur sans écran (Playwright), attend le chargement, fait défiler la page,
// puis affiche en JSON les adresses des grandes images de l'annonce (hors logos et « annonces similaires »).
// Respecte le fichier robots.txt du site : si la page y est interdite, rien n'est ouvert.
const url = process.argv[2];
// Uniquement des pages web publiques : pas de fichiers locaux, pas d'adresses internes (localhost, réseau privé, métadonnées du serveur).
const PRIVE = h => /^(localhost|.*\.local|.*\.internal|metadata\.google\.internal)$/i.test(h) || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[|::1)/.test(h) || /^\d+$/.test(h);
const publique = u => { try { const p = new URL(u); return /^https?:$/.test(p.protocol) && p.hostname.includes('.') && !PRIVE(p.hostname); } catch (e) { return false; } };
if (!publique(url || '')) { console.error('Usage : node scripts/photos.js https://site-public/annonce'); process.exit(1); }

async function allowedByRobots(u) {
  try {
    const { origin, pathname } = new URL(u);
    const r = await fetch(origin + '/robots.txt', { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return true;
    const lines = (await r.text()).split(/\r?\n/).map(l => l.replace(/#.*/, '').trim());
    let applies = false; const dis = [], allow = [];
    for (const l of lines) {
      const [k, ...v] = l.split(':'); const val = v.join(':').trim(); const key = (k || '').toLowerCase();
      if (key === 'user-agent') applies = val === '*';
      else if (applies && key === 'disallow' && val) dis.push(val);
      else if (applies && key === 'allow' && val) allow.push(val);
    }
    const hit = rules => rules.filter(p => pathname.startsWith(p.replace(/\*.*$/, ''))).reduce((m, p) => Math.max(m, p.length), -1);
    return hit(allow) >= hit(dis);
  } catch (e) { return true; }
}

(async () => {
  if (!(await allowedByRobots(url))) { console.log(JSON.stringify({ url, refus: 'page interdite par robots.txt', photos: [] })); return; }
  let chromium;
  try { ({ chromium } = require('playwright')); } catch (e) { console.log(JSON.stringify({ url, erreur: 'Playwright absent', photos: [] })); return; }
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, locale: 'fr-FR' });
    await page.route('**/*', r => publique(r.request().url()) || /^(data|blob):/.test(r.request().url()) ? r.continue() : r.abort());
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    for (let y = 0; y < 12000; y += 800) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(250); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1500);
    const res = await page.evaluate(() => {
      const out = new Map();
      const bad = /logo|icon|avatar|sprite|marker|picto|flag|favicon|badge|staticmap|maps\.g|placeholder|blank|loader|pixel|bg-default|\.svg|\.gif|agent|negociat|team|equipe/i;
      const sim = '[class*=similar],[class*=Similar],[class*=related],[class*=autres],[id*=similar],[class*=suggest],[class*=recommend],footer,header nav';
      const here = location.pathname;
      const other = e => { const a = e.closest('a[href]'); if (!a) return false; const h = a.getAttribute('href') || ''; if (/^#|^javascript|\.(jpe?g|png|webp)/i.test(h)) return false; try { const p = new URL(h, location.href); return p.pathname !== here && p.pathname.length > 12; } catch (x) { return false; } };
      const big = s => { if (!s) return null; let b = null, bw = 0; s.split(',').forEach(p => { const [u, d] = p.trim().split(/\s+/); const v = parseFloat(d) || 1; if (v >= bw) { bw = v; b = u; } }); return b; };
      const add = (u, w, t) => { if (!u || u.startsWith('data:')) return; try { u = new URL(u.trim(), location.href).href; } catch (e) { return; } if (bad.test(u)) return; const o = out.get(u); if (!o) out.set(u, { w, t }); else if (w > o.w) o.w = w; };
      document.querySelectorAll('img,source').forEach(i => {
        if (i.closest(sim) || other(i)) return;
        const el = i.tagName === 'SOURCE' ? i.parentElement : i; const r = el.getBoundingClientRect();
        const w = Math.max(i.naturalWidth || 0, Math.round(r.width)); const t = Math.round(r.top + scrollY);
        const lazy = i.dataset.src || i.dataset.lazy || i.dataset.original || i.getAttribute('data-lazy-src') || i.dataset.full || i.dataset.zoom;
        if (i.tagName === 'IMG' && (i.naturalWidth >= 400 || r.width >= 250)) add(big(i.srcset) || i.currentSrc || i.src, w, t);
        if (i.tagName === 'SOURCE' && i.srcset) add(big(i.srcset), w, t);
        if (lazy) add(lazy, w, t);
        if (i.dataset.srcset) add(big(i.dataset.srcset), w, t);
      });
      document.querySelectorAll('a[href]').forEach(a => { if (/\.(jpe?g|png|webp)(\?|$)/i.test(a.href) && !a.closest(sim)) add(a.href, 0, Math.round(a.getBoundingClientRect().top + scrollY)); });
      const og = document.querySelector('meta[property="og:image"]'); if (og) add(og.content, 0, -1);
      const txt = document.body.innerText;
      const statut = /sous compromis|sous offre/i.test(txt) ? 'sous compromis ?' : /n'est plus disponible|plus en ligne|introuvable|n'existe plus/i.test(txt) ? 'introuvable ?' : 'en vente ?';
      return { titre: document.title, statut, photos: [...out].sort((a, b) => a[1].t - b[1].t).map(([u]) => u).slice(0, 12) };
    });
    console.log(JSON.stringify({ url: page.url(), ...res }, null, 1));
  } catch (e) {
    console.log(JSON.stringify({ url, erreur: String(e.message || e).slice(0, 200), photos: [] }));
  } finally { await browser.close(); }
})();
