// Construit le site Sud'perbe : site/modele.html + data/biens.json + data/communes.json
//   → index.html (dépôt) et _site/index.html (mise en ligne).
//   node scripts/build.js --artefact chemin.html  → écrit aussi une version sans squelette (aperçu claude.ai)
const fs = require('fs');
const path = require('path');
const R = p => path.join(__dirname, '..', p);
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const data = JSON.parse(fs.readFileSync(R('data/biens.json'), 'utf8'));
const etat = JSON.parse(fs.readFileSync(R('data/etat.json'), 'utf8'));
const communes = JSON.parse(fs.readFileSync(R('data/communes.json'), 'utf8'));

// ---- position sur la carte : quartier connu, sinon centre de la commune, avec un petit décalage stable ----
const cIndex = {};
for (const [k, v] of Object.entries(communes)) if (!k.startsWith('_')) cIndex[norm(k)] = v;
const manquantes = new Set();
for (const x of data) {
  const c = cIndex[norm(x.ville)];
  if (!c) { manquantes.add(x.ville); continue; }
  const txt = norm([x.quartier, x.details && x.details.adresse, x.titre].join(' '));
  let pos = c.c, prec = 'commune';
  for (const [q, p] of Object.entries(c.q || {})) if (txt.includes(norm(q))) { pos = p; prec = 'quartier'; break; }
  const h = (x.id * 2654435761) >>> 0, a = (h % 360) * Math.PI / 180, r = (prec === 'quartier' ? 0.0022 : 0.0045) * (0.35 + ((h >>> 9) % 100) / 154);
  x.geo = [+(pos[0] + r * Math.sin(a)).toFixed(5), +(pos[1] + r * Math.cos(a) * 1.35).toFixed(5)];
  x.geoPrec = prec;
}
if (manquantes.size) console.log('Communes sans coordonnées (à ajouter dans data/communes.json) :', [...manquantes].join(', '));

// ---- page ----
const [y, m, d] = etat.derniere_maj.split('-').map(Number);
const quand = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const leaflet = fs.readFileSync(R('site/leaflet.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const tpl = fs.readFileSync(R('site/modele.html'), 'utf8')
  .replace('/*__LEAFLET_CSS__*/', () => leaflet)
  .replace('/*__DATA__*/[]', () => JSON.stringify(data).replace(/</g, '\\u003c'))
  .replace('/*__DATE__*/', quand)
  .replace('/*__ISO__*/', etat.derniere_maj);
const [headPart, bodyPart] = tpl.split('<!--/head-->');
const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta property="og:title" content="Sud'perbe · Vue mer, prix mistral">
<meta property="og:description" content="${data.length} maisons, villas et appartements vue mer à vendre sur la côte méditerranéenne.">
${data[0] && data[0].photos[0] ? `<meta property="og:image" content="${data[0].photos[0]}">` : ''}
${headPart.trim()}
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${bodyPart.trim()}
</body>
</html>
`;
fs.writeFileSync(R('index.html'), html);
fs.mkdirSync(R('_site'), { recursive: true });
fs.writeFileSync(R('_site/index.html'), html);
const ai = process.argv.indexOf('--artefact');
if (ai > 0) fs.writeFileSync(process.argv[ai + 1], tpl.replace('<!--/head-->', ''));
console.log(`Site construit : ${data.length} biens, ${data.filter(x => x.geo).length} placés sur la carte, données du ${quand}, ${(html.length / 1024).toFixed(0)} Ko`);
