// Donne les biens vérifiés depuis le plus longtemps : node scripts/a-verifier.js 30
const b = require('../data/biens.json');
const n = parseInt(process.argv[2] || '30', 10);
b.slice().sort((x, y) => (x.verifie || '').localeCompare(y.verifie || '') || x.id - y.id).slice(0, n)
  .forEach(x => console.log([x.id, x.verifie, x.source, x.ville, x.prix, x.url].join(' | ')));
