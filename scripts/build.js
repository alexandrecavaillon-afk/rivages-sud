// Construit le site Sud'perbe dans _site/ (ce dossier est ce qui est mis en ligne, rien d'autre) :
//   index.html, app.js (données + code), style.css, polices, bibliothèques de la carte, icônes,
//   pages légales, 404, robots.txt (et sitemap.xml une fois le site lancé).
// Réglages de lancement : site/lancement.json  {"public": false, "domaine": null}
//   public=false → le site demande aux moteurs de recherche de ne pas l'indexer (noindex + robots.txt).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const R = p => path.join(__dirname, '..', p);
const OUT = R('_site');
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const read = p => fs.readFileSync(R(p), 'utf8');
const data = JSON.parse(read('data/biens.json'));
const etat = JSON.parse(read('data/etat.json'));
const communes = JSON.parse(read('data/communes.json'));
const lancement = JSON.parse(read('site/lancement.json'));
const PUBLIC = lancement.public === true;
const DOMAINE = typeof lancement.domaine === 'string' && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(lancement.domaine) ? lancement.domaine.toLowerCase() : null;
const BASE = DOMAINE ? '/' : '/rivages-sud/';
const ORIGINE = DOMAINE ? `https://${DOMAINE}` : 'https://alexandrecavaillon-afk.github.io';

// ---- position sur la carte : quartier connu, sinon centre de la commune, avec un petit décalage stable ----
// Les coordonnées doivent être des nombres situés sur la côte méditerranéenne française, sinon elles sont ignorées.
const okPos = p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) && p[0] > 41.2 && p[0] < 44.6 && p[1] > 2.4 && p[1] < 7.9;
const cIndex = {};
for (const [k, v] of Object.entries(communes)) {
  if (k.startsWith('_') || !v || !okPos(v.c)) continue;
  const q = {};
  for (const [qn, qp] of Object.entries(v.q && typeof v.q === 'object' ? v.q : {})) if (okPos(qp)) q[qn] = qp;
  cIndex[norm(k)] = { c: v.c, q };
}
const manquantes = new Set();
for (const x of data) {
  const c = cIndex[norm(x.ville)];
  if (!c) { manquantes.add(x.ville); continue; }
  const txt = norm([x.quartier, x.details && x.details.adresse, x.titre].join(' '));
  let pos = c.c, prec = 'commune';
  for (const [q, p] of Object.entries(c.q)) if (txt.includes(norm(q))) { pos = p; prec = 'quartier'; break; }
  const h = (x.id * 2654435761) >>> 0, a = (h % 360) * Math.PI / 180, r = (prec === 'quartier' ? 0.0022 : 0.0045) * (0.35 + ((h >>> 9) % 100) / 154);
  x.geo = [+(pos[0] + r * Math.sin(a)).toFixed(5), +(pos[1] + r * Math.cos(a) * 1.35).toFixed(5)];
  x.geoPrec = prec;
}
if (manquantes.size) console.log('Communes sans coordonnées (à ajouter dans data/communes.json) :', [...manquantes].join(', '));

// ---- fichiers statiques ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'vendor'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'fonts'), { recursive: true });
const write = (p, c) => fs.writeFileSync(path.join(OUT, p), c);
const hash = c => crypto.createHash('sha256').update(c).digest('hex').slice(0, 10);
const noMap = c => c.replace(/\n?\/\/# sourceMappingURL=\S+\s*$/, '\n'); // pas de lien vers des fichiers .map absents
for (const f of ['leaflet.js', 'leaflet.markercluster.js', 'leaflet-maplibre-gl.js', 'maplibre-gl.mjs', 'maplibre-gl-shared.mjs', 'maplibre-gl-worker.mjs'])
  write('vendor/' + f, noMap(read('site/vendor/' + f)));
for (const f of fs.readdirSync(R('site/fonts'))) if (/\.woff2$/.test(f)) fs.copyFileSync(R('site/fonts/' + f), path.join(OUT, 'fonts', f));
for (const f of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) fs.copyFileSync(R('site/' + f), path.join(OUT, f));

const css = read('site/style.css') + '\n' + read('site/vendor/leaflet.css').replace(/\/\*[\s\S]*?\*\//g, '') + '\n' + read('site/vendor/MarkerCluster.css');
const cssName = `style.css?v=${hash(css)}`;
write('style.css', css);

// ---- en-tête commun : sécurité, icônes, indexation ----
const CSP_SITE = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' https: data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://tiles.openfreemap.org",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  'upgrade-insecure-requests'
].join('; ');
const CSP_PAGE = "default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests";
const head = ({ title, description, csp, canonical, base }) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="color-scheme" content="light dark">
${PUBLIC ? '' : '<meta name="robots" content="noindex, nofollow">\n'}<title>${title}</title>
<meta name="description" content="${description}">
${canonical && DOMAINE ? `<link rel="canonical" href="${ORIGINE}${BASE}${canonical === '/' ? '' : canonical}">\n` : ''}<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${base}favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="${base}apple-touch-icon.png">
<link rel="stylesheet" href="${base}${cssName}">`;

// ---- page principale ----
const [y, m, d] = etat.derniere_maj.split('-').map(Number);
const quand = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const app = read('site/app.js')
  .replace('/*__DATA__*/[]', () => JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'))
  .replace('/*__DATE__*/', quand)
  .replace('/*__ISO__*/', etat.derniere_maj);
if (app.includes('/*__DATA__*/')) throw new Error('Données non insérées dans app.js');
const appName = `app.js?v=${hash(app)}`;
write('app.js', app);
const tpl = read('site/modele.html');
const [headPart, bodyPart] = tpl.split('<!--/head-->');
const titre = (headPart.match(/<title>([^<]*)<\/title>/) || [])[1] || "Sud'perbe";
const desc = (headPart.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
const ogImg = data[0] && data[0].photos[0] && /^https:\/\//.test(data[0].photos[0]) ? data[0].photos[0].replace(/"/g, '%22') : null;
const index = `<!doctype html>
<html lang="fr">
<head>
${head({ title: titre, description: desc, csp: CSP_SITE, canonical: '/', base: '' })}
<meta property="og:title" content="Sud'perbe · Vue mer, prix mistral">
<meta property="og:description" content="${data.length} maisons, villas et appartements vue mer à vendre sur la côte méditerranéenne.">
${ogImg ? `<meta property="og:image" content="${ogImg}">\n` : ''}</head>
<body>
${bodyPart.trim().replace('<script src="app.js"></script>', `<script src="${appName}"></script>`)}
</body>
</html>
`;
if (/\son[a-z]+=|\sstyle=/i.test(bodyPart)) throw new Error('modele.html contient un attribut style= ou on…= (interdit par la politique de sécurité)');
if (/\son(error|load|click|mouse\w*|focus|blur|key\w*)=|\sstyle="/i.test(read('site/app.js'))) throw new Error('app.js génère un attribut style= ou on…= (interdit par la politique de sécurité)');
write('index.html', index);

// ---- pages légales et 404 ----
const pages = fs.readdirSync(R('site/pages')).filter(f => f.endsWith('.html'));
for (const f of pages) {
  const src = read('site/pages/' + f);
  const t = (src.match(/<!-- titre: (.*?) -->/) || [])[1] || "Sud'perbe";
  const is404 = f === '404.html';
  const b = is404 ? BASE : '';
  write(f, `<!doctype html>
<html lang="fr">
<head>
${head({ title: `${t} · Sud'perbe`, description: `${t} du site Sud'perbe.`, csp: CSP_PAGE, canonical: is404 ? null : f, base: b })}
</head>
<body class="legal">
<header class="top"><div class="wrap"><a class="logo" href="${b || './'}">Sud<i>'</i>perbe</a><a class="back" href="${b || './'}">Retour aux annonces</a></div></header>
<main class="wrap doc">
${src.replace(/<!-- titre: .*? -->\n?/, '').replace(/href="\.\/"/g, `href="${b || './'}"`).trim()}
</main>
<footer><div class="wrap"><nav class="flinks" aria-label="Informations légales"><a href="${b}mentions-legales.html">Mentions légales</a><a href="${b}confidentialite.html">Confidentialité</a><a href="${b}conditions.html">Conditions d'utilisation</a></nav></div></footer>
</body>
</html>
`);
}

// ---- moteurs de recherche ----
if (PUBLIC) {
  write('robots.txt', `User-agent: *\nAllow: /\n${DOMAINE ? `Sitemap: ${ORIGINE}/sitemap.xml\n` : ''}`);
  if (DOMAINE) write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...pages.filter(f => f !== '404.html')].map(f => `  <url><loc>${ORIGINE}/${f}</loc></url>`).join('\n')}\n</urlset>\n`);
} else {
  write('robots.txt', 'User-agent: *\nDisallow: /\n');
}

const size = fs.readdirSync(OUT, { recursive: true }).reduce((s, f) => { const p = path.join(OUT, f); return fs.statSync(p).isFile() ? s + fs.statSync(p).size : s; }, 0);
console.log(`Site construit : ${data.length} biens, ${data.filter(x => x.geo).length} placés sur la carte, données du ${quand}, ${(size / 1024).toFixed(0)} Ko, ${PUBLIC ? 'indexable' : 'non indexé (avant lancement)'}${DOMAINE ? ', domaine ' + DOMAINE : ''}`);
