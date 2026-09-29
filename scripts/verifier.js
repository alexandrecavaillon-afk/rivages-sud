// Garde-fou des données de Sud'perbe.
//   node scripts/verifier.js --essai          → contrôle data/nouveaux.json et data/changements.json sans rien écrire
//   node scripts/verifier.js [--avant F.json] [--passage-claude] → intègre nouveautés et changements dans data/biens.json, nettoie,
//                                               dédoublonne, met en attente les biens sans photo, puis vide les fichiers d'entrée.
//   Avec --avant, refuse d'écrire si le nombre de biens baisse de plus de 30 % par rapport au fichier F.
const fs = require('fs');
const path = require('path');
const C = require('./commun.js');
const D = p => path.join(__dirname, '..', 'data', p);
const args = process.argv.slice(2);
const ESSAI = args.includes('--essai');
const ai = args.indexOf('--avant');
const AVANT = ai >= 0 ? args[ai + 1] : null;
// Un essai de photos ne compte que si Claude a vraiment cherché pendant ce passage (option --passage-claude).
const PASSAGE_CLAUDE = args.includes('--passage-claude');
const TODAY = C.today();
const MAX_ESSAIS_PHOTOS = 14; // ≈ une semaine à deux passages par jour

function readJSON(f, def) {
  if (!fs.existsSync(f)) return def;
  const t = fs.readFileSync(f, 'utf8').trim();
  if (!t) return def;
  try { return JSON.parse(t); } catch (e) { throw new Error(`${path.basename(f)} n'est pas un JSON valide : ${e.message}`); }
}
let biens, attente, nouveaux, chg;
try {
  biens = readJSON(D('biens.json'), null);
  attente = readJSON(D('attente.json'), []);
  nouveaux = readJSON(D('nouveaux.json'), []);
  chg = readJSON(D('changements.json'), {});
} catch (e) { console.error('ERREUR :', e.message); process.exit(1); }
if (!Array.isArray(biens) || !Array.isArray(attente) || !Array.isArray(nouveaux)) { console.error('ERREUR : biens.json, attente.json et nouveaux.json doivent être des tableaux [ ... ]'); process.exit(1); }
chg = { retirer: [], prix: [], photos: [], verifies: [], ...chg };
const R = { ajoutes: 0, enAttente: 0, sortisAttente: 0, abandonnes: 0, doublons: 0, retires: 0, prix: 0, photos: 0, verifies: 0, ecartes: [] };

// ---- contrôle des entrées ----
const accepted = [];
nouveaux.forEach((o, i) => {
  const [f, why] = C.clean({ ...o, id: null }, { ajoute: TODAY, verifie: TODAY });
  if (!f) { R.ecartes.push(`nouveaux[${i}] (${o && o.ville}, ${o && o.prix}) : ${why}`); return; }
  f.ajoute = TODAY; f.verifie = TODAY;
  accepted.push([f, why]);
});
const all = [...biens, ...attente];
const ids = new Set(all.map(b => b.id));
for (const r of chg.retirer) if (!ids.has(r && r.id)) R.ecartes.push(`retirer : id ${r && r.id} inconnu`);
for (const p of chg.prix) if (!ids.has(p && p.id) || !C.int(p.prix)) R.ecartes.push(`prix : id ${p && p.id} inconnu ou prix invalide`);
for (const p of chg.photos) if (!ids.has(p && p.id) || !Array.isArray(p.photos)) R.ecartes.push(`photos : id ${p && p.id} inconnu ou liste invalide`);

if (ESSAI) {
  console.log(`Essai : ${accepted.filter(a => !a[1]).length} nouveauté(s) prêtes, ${accepted.filter(a => a[1]).length} sans photo (iront en attente), ${chg.retirer.length} retrait(s), ${chg.prix.length} prix, ${chg.photos.length} ajout(s) de photos, ${chg.verifies.length} vérifié(s).`);
  R.ecartes.forEach(r => console.log('  À corriger :', r));
  process.exit(0);
}

// ---- intégration ----
const retirer = new Set(chg.retirer.map(r => r && r.id));
const outB = [], outA = [];
function place(f, why) {
  if (why === 'sans photo') {
    if (PASSAGE_CLAUDE) f.essais_photos = (f.essais_photos || 0) + 1;
    if (f.essais_photos > MAX_ESSAIS_PHOTOS) { R.abandonnes++; return; }
    outA.push(f); return;
  }
  delete f.essais_photos;
  outB.push(f);
}
for (const b of all) {
  if (retirer.has(b.id)) { R.retires++; continue; }
  const p = chg.prix.find(p => p && p.id === b.id && C.int(p.prix));
  if (p && C.int(p.prix) !== b.prix) { b.prix_avant = b.prix; b.prix = C.int(p.prix); R.prix++; }
  const ph = chg.photos.find(p => p && p.id === b.id && Array.isArray(p.photos));
  if (ph) { b.photos = [...new Set([...(b.photos || []), ...ph.photos])]; R.photos++; }
  if (chg.verifies.includes(b.id) || p || ph) { b.verifie = TODAY; R.verifies++; }
  const wasWaiting = attente.includes(b);
  const [f, why] = C.clean(b, { ajoute: '2026-09-29', verifie: '2026-09-29' });
  if (!f) { R.ecartes.push(`id ${b.id} retiré au nettoyage : ${why}`); continue; }
  if (wasWaiting && !why) R.sortisAttente++;
  place(f, why);
}
for (const [n, why] of accepted) {
  const d = [...outB, ...outA].find(y => C.sameBien(n, y));
  if (d) {
    R.doublons++;
    for (const k of ['surface', 'terrain', 'pieces', 'chambres', 'sdb', 'dpe', 'annee', 'quartier']) if (d[k] === null && n[k] !== null) d[k] = n[k];
    for (const p of n.photos) if (d.photos.length < 12 && !d.photos.includes(p)) d.photos.push(p);
    if (n.url !== d.url && !(d.aussi || []).some(a => a.url === n.url)) (d.aussi = d.aussi || []).push({ source: n.source, url: n.url });
    d.verifie = TODAY;
    if (outA.includes(d) && d.photos.length) { outA.splice(outA.indexOf(d), 1); delete d.essais_photos; outB.push(d); R.sortisAttente++; }
    continue;
  }
  if (why === 'sans photo') R.enAttente++; else R.ajoutes++;
  place(n, why);
}
// identifiants stables : on garde ceux qui existent, on numérote les nouveaux à la suite
let max = [...outB, ...outA].reduce((m, x) => Number.isInteger(x.id) ? Math.max(m, x.id) : m, -1);
const seen = new Set();
for (const x of [...outB, ...outA]) { if (!Number.isInteger(x.id) || seen.has(x.id)) x.id = ++max; seen.add(x.id); }

if (AVANT && fs.existsSync(AVANT)) {
  const n0 = (readJSON(AVANT, []) || []).length;
  if (n0 && outB.length < n0 * 0.7) { console.error(`ERREUR : ${outB.length} biens contre ${n0} avant, baisse de plus de 30 %. Rien n'est écrit.`); process.exit(1); }
}
if (outB.length < 50) { console.error(`ERREUR : seulement ${outB.length} biens, c'est anormal. Rien n'est écrit.`); process.exit(1); }

const clip = o => JSON.parse(JSON.stringify(o)); // retire les champs undefined
C.writeList(D('biens.json'), outB.map(clip));
C.writeList(D('attente.json'), outA.map(clip));
fs.writeFileSync(D('nouveaux.json'), '[]\n');
fs.writeFileSync(D('changements.json'), JSON.stringify({ retirer: [], prix: [], photos: [], verifies: [] }, null, 1) + '\n');
const resume = `${outB.length} biens en ligne · ${R.ajoutes} ajouté(s), ${R.retires} retiré(s), ${R.prix} prix modifié(s), ${R.photos} galerie(s) complétée(s), ${outA.length} en attente de photos`;
fs.writeFileSync(D('etat.json'), JSON.stringify({ derniere_maj: TODAY, resume }, null, 1) + '\n');
console.log(resume + (R.doublons ? `, ${R.doublons} doublon(s) fusionné(s)` : '') + (R.abandonnes ? `, ${R.abandonnes} abandonné(s) faute de photo` : ''));
R.ecartes.forEach(r => console.log('  Écarté :', r));
