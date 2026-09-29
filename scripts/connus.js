// Liste les annonces déjà connues (en ligne et en attente de photos), pour éviter les doublons.
//   node scripts/connus.js                → nombre de biens par site
//   node scripts/connus.js etreproprio    → id | ville | prix | surface | URL des biens dont l'URL contient ce mot
const fs = require('fs');
const path = require('path');
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8')); } catch (e) { return []; } };
const b = [...read('biens.json'), ...read('attente.json').map(x => ({ ...x, attente: true }))];
const q = (process.argv[2] || '').toLowerCase();
if (!q) {
  const m = {};
  b.forEach(x => { let h = '?'; try { h = new URL(x.url).host.replace(/^www\./, ''); } catch (e) {} m[h] = (m[h] || 0) + 1; });
  Object.entries(m).sort((a, c) => c[1] - a[1]).forEach(([h, n]) => console.log(n, h));
  console.log(b.length, 'biens connus au total');
} else {
  b.filter(x => [x.url, ...(x.aussi || []).map(a => a.url)].join(' ').toLowerCase().includes(q))
    .forEach(x => console.log([x.id, x.ville, x.prix, x.surface ?? '-', x.url, x.attente ? 'EN ATTENTE DE PHOTOS' : ''].join(' | ')));
}
