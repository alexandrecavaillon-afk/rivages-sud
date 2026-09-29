// Règles communes aux scripts de Sud'perbe : zones, types, équipements, nettoyage d'une fiche.
const ZONE = { '06': "Côte d'Azur", '83': 'Var', '13': 'Provence', '30': 'Occitanie', '34': 'Occitanie', '11': 'Occitanie', '66': 'Occitanie' };
const TYPES = ['Villa', 'Maison', 'Mas', 'Bastide', 'Propriété', 'Appartement', 'Penthouse', 'Chalet', 'Manoir'];
const SEA = /(vue[^.]{0,30}mer|mer[^.]{0,20}vue|pieds? dans l.eau|front de mer|face (a|à) la mer|face mer|sea ?view|vue sur la (mer|m[ée]diterran)|panoram[^.]{0,30}(mer|baie|golfe|m[ée]diterran)|vue (sur la )?(baie|golfe|m[ée]diterran|iles|îles)|acc[eè]s (direct )?(a|à) la mer|waterfront|premi[eè]re ligne)/i;

// Équipements proposés en filtres : libellé → motif cherché dans le texte de l'annonce
const EQUIP = {
  'piscine': /piscine|swimming|pool(?! house)/i,
  'piscine chauffée': /piscine (chauff|à débordement chauff)|heated pool/i,
  'climatisation': /climatis|\bclim\b|air condition|reversible|réversible/i,
  'balcon': /balcon/i,
  'terrasse': /terrasse/i,
  'toit-terrasse': /toit[- ]terrasse|rooftop|roof terrace/i,
  'jardin': /jardin|garden/i,
  'garage': /garage/i,
  'parking': /parking|stationnement|place de parc|carport/i,
  'ascenseur': /ascenseur|elevator|lift\b/i,
  'cave': /\bcave\b|cellier|wine cellar/i,
  "pieds dans l'eau": /pieds dans l.eau|waterfront|front de mer|direct access to the sea|accès direct (à la )?mer/i,
  'accès plage': /accès (à la |direct à la )?plage|plage à pied|beach access/i,
  'vue panoramique': /panoram/i,
  "maison d'amis": /maison d.amis|maison d.invités|guest house|dépendance/i,
  'pool house': /pool[- ]house/i,
  'spa': /\bspa\b|jacuzzi|jaccuzi|bain à remous|hot tub/i,
  'sauna': /sauna/i,
  'hammam': /hammam/i,
  'salle de sport': /salle de (sport|fitness)|\bgym\b|fitness/i,
  'tennis': /tennis|padel/i,
  'cheminée': /chemin[ée]e|fireplace/i,
  'domotique': /domotique|smart home/i,
  'alarme': /alarme|vidéosurveillance|video surveillance/i,
  'gardien': /gardien|concierge|caretaker/i,
  'résidence sécurisée': /résidence (fermée|sécurisée|privée)|domaine (fermé|privé|sécurisé)|gated/i,
  'plain-pied': /plain[- ]pied|single[- ]storey/i,
  'cuisine équipée': /cuisine (équipée|aménagée|américaine équipée)|fitted kitchen|equipped kitchen/i,
  'meublé': /\bmeubl[ée]|furnished/i,
  'dressing': /dressing/i,
  'ponton': /ponton|amarrage|jetty/i,
  'anneau de port': /anneau|mooring|place de bateau/i,
  'calme': /\bcalme\b|quiet|au calme/i,
  'neuf': /\bneuf\b|construction neuve|brand new|vefa|livraison 20\d\d/i,
  'rénové': /rénov[ée]|refait à neuf|renovated/i,
  'à rénover': /à rénover|à rafraîchir|travaux à prévoir|to renovate/i,
  'vue sur les îles': /vue [^.]{0,30}(îles|iles|lérins|porquerolles|port-cros)/i,
  'coucher de soleil': /coucher de soleil|sunset/i,
  'panneaux solaires': /panneaux (solaires|photovolta)|solar/i,
  'arrosage automatique': /arrosage automatique|irrigation/i
};
const EQUIP_KEYS = Object.keys(EQUIP);

// Nombre entier positif. Accepte 1250000, "1 250 000 €", "180 m²", "1.250.000", "12,5" ; tout autre texte donne null.
const int = v => {
  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;
  let t = String(v).replace(/[\s\u00a0\u202f]/g, '').replace(/(€|euros?|eur|m²|m2|ha|m)$/i, '');
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  t = t.replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const n = Math.round(Number(t));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const date = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : null;
const today = () => new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());

function goodPhoto(u) {
  if (typeof u !== 'string') return false;
  u = u.trim();
  if (!/^https:\/\/[^\s\[\]<>"'\\`]+$/.test(u) || u.length > 2000 || !safeUrl(u)) return false;
  if (/bg-default|placeholder|logo|no-?photo|default\.(jpg|png)|\/icons?\/|staticmap/i.test(u)) return false;
  const p = u.split('?')[0];
  return /\.(jpe?g|png|webp|avif)$/i.test(p) || /(media\.studio-net\.fr|cloudfront\.net|apimo|cloudinary|imgix|etreproprio|immo-facile|jalis|hestia|cdn\.|images?\.|photos?\.)/i.test(u);
}
function equipements(o) {
  const txt = [o.titre, o.description, o.resume, ...(o.atouts || [])].join(' · ')
    .replace(/(possibilit[ée]s?|projet|permis|pr[ée]vu|emplacement)[^.·]{0,40}(piscine|pool)|sans piscine|pas de piscine/gi, ' ');
  const s = new Set((o.equipements || []).filter(e => EQUIP_KEYS.includes(e)));
  for (const k of EQUIP_KEYS) if (EQUIP[k].test(txt)) s.add(k);
  if (o.piscine === true) s.add('piscine');
  if (s.has('piscine chauffée')) s.add('piscine');
  if (s.has('toit-terrasse')) s.add('terrasse');
  return EQUIP_KEYS.filter(k => s.has(k));
}
const DETAIL_KEYS = ['etage', 'nb_etages', 'exposition', 'etat', 'chauffage', 'charges_mois', 'taxe_fonciere', 'honoraires', 'dpe_kwh', 'ges', 'ges_kg', 'surface_terrasse', 'surface_jardin', 'distance_mer_m', 'stationnement', 'adresse'];
// Détails numériques (entiers) et détails texte : tout le reste est ignoré.
const DETAIL_NUM = ['nb_etages', 'charges_mois', 'taxe_fonciere', 'dpe_kwh', 'ges_kg', 'surface_terrasse', 'surface_jardin', 'distance_mer_m'];

// ---- sécurité : les données viennent de sites tiers, elles ne doivent jamais pouvoir injecter du code dans la page ----
// Texte : chaîne simple, sans balises ni caractères de contrôle, tirets longs remplacés, longueur bornée.
const txt = (v, max = 300) => {
  if (v === null || v === undefined) return '';
  let t = String(v).replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]/g, ' ');
  // pas de coordonnées personnelles (adresses électroniques, numéros de téléphone) recopiées depuis une annonce
  t = t.replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, ' ').replace(/(?<![\d-])(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}(?![\d-])/g, ' ');
  t = t.replace(/\s+[\u2014\u2013]\s+/g, ', ').replace(/[\u2014\u2013]/g, '-').replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t;
};
const txtOrNull = (v, max) => { const t = txt(v, max); return t || null; };
// Adresse web : uniquement http(s), sans espaces ni guillemets, longueur bornée.
const safeUrl = u => {
  if (typeof u !== 'string') return null;
  u = u.trim();
  if (u.length > 2000 || !/^https?:\/\/[^\s"'<>\\`]+$/i.test(u)) return null;
  try { const p = new URL(u); return /^https?:$/.test(p.protocol) && p.hostname.includes('.') ? p.href : null; } catch (e) { return null; }
};

// Nettoie une fiche. Renvoie [fiche, null] ou [null, raison]. Une fiche sans photo est refusée (raison "sans photo").
function clean(o, defaults = {}) {
  if (!o || typeof o !== 'object') return [null, 'pas un objet'];
  const dep = String(o.dep || '').padStart(2, '0').slice(0, 2);
  if (!ZONE[dep]) return [null, `département ${o.dep} hors zone`];
  const url = safeUrl(o.url);
  if (!url) return [null, "URL de l'annonce manquante ou invalide"];
  const prix = int(o.prix);
  if (!prix || prix < 30000) return [null, 'prix manquant ou incohérent'];
  const all = [o.titre, o.description, o.resume, ...(Array.isArray(o.atouts) ? o.atouts : [])].map(v => txt(v, 6000)).join(' ');
  if (!SEA.test(all)) return [null, 'vue mer non écrite dans titre, description ou atouts'];
  const ville = txt(o.ville, 60).replace(/\s*\(\d{2,5}\)\s*/g, '').trim();
  if (!ville) return [null, 'ville manquante'];
  const type = TYPES.find(t => norm(t) === norm(o.type)) || (/(appart|studio|\bt\d)/i.test(o.type || '') ? 'Appartement' : 'Maison');
  const photos = [...new Set((o.photos || []).map(p => typeof p === 'string' ? p.trim() : '').filter(goodPhoto))].slice(0, 12);
  const annee = int(o.annee);
  const det = {};
  const src = o.details && typeof o.details === 'object' ? o.details : {};
  for (const k of DETAIL_KEYS) {
    if (src[k] === undefined || src[k] === null || src[k] === '') continue;
    if (DETAIL_NUM.includes(k)) { const n = int(src[k]); if (n !== null) det[k] = n; continue; }
    if (k === 'ges') { if (/^[A-G]$/i.test(String(src[k]))) det[k] = String(src[k]).toUpperCase(); continue; }
    if (k === 'etage' && /^-?\d{1,3}$/.test(String(src[k]).trim())) { det[k] = parseInt(src[k], 10); continue; }
    if (k === 'honoraires' && typeof src[k] === 'number') { const n = int(src[k]); if (n !== null) det[k] = n; continue; }
    const t = txt(src[k], k === 'adresse' ? 160 : 120); if (t) det[k] = t;
  }
  const f = {
    id: Number.isInteger(o.id) ? o.id : null,
    source: txt(o.source, 60) || 'Inconnue', agence: txtOrNull(o.agence, 80), url, ref: txtOrNull(o.ref, 40), type,
    titre: txt(o.titre, 160), ville, quartier: txtOrNull(o.quartier, 120),
    dep, zone: ZONE[dep], prix, prix_avant: int(o.prix_avant) || undefined,
    surface: int(o.surface), terrain: int(o.terrain), pieces: int(o.pieces), chambres: int(o.chambres), sdb: int(o.sdb),
    piscine: o.piscine === true ? true : o.piscine === false ? false : null,
    atouts: Array.isArray(o.atouts) ? [...new Set(o.atouts.map(a => txt(a, 80)).filter(Boolean))].slice(0, 14) : [],
    dpe: /^[A-G]$/i.test(o.dpe || '') ? o.dpe.toUpperCase() : null,
    annee: annee && annee > 1500 && annee <= 2035 ? annee : null,
    resume: txt(o.resume, 1500) || undefined,
    description: txt(o.description, 6000), photos,
    details: Object.keys(det).length ? det : undefined,
    aussi: (() => { const l = (Array.isArray(o.aussi) ? o.aussi : []).map(a => a && safeUrl(a.url) ? { source: txt(a.source, 60) || 'Autre site', url: safeUrl(a.url) } : null).filter(Boolean).slice(0, 6); return l.length ? l : undefined; })(),
    ajoute: date(o.ajoute) || defaults.ajoute || today(),
    verifie: date(o.verifie) || defaults.verifie || today(),
    essais_photos: int(o.essais_photos) || undefined
  };
  f.equipements = equipements(f);
  if (f.equipements.includes('piscine') && f.piscine === null) f.piscine = true;
  if (!photos.length) return [f, 'sans photo'];
  return [f, null];
}
const sameBien = (x, y) => (x.url === y.url && x.prix === y.prix) ||
  (norm(y.ville) === norm(x.ville) && Math.abs(y.prix - x.prix) <= y.prix * 0.01 &&
    (x.surface === null || y.surface === null ? x.prix === y.prix && x.type === y.type : Math.abs(y.surface - x.surface) <= 3));
const writeList = (file, arr) => require('fs').writeFileSync(file, '[\n' + arr.map(x => JSON.stringify(x)).join(',\n') + (arr.length ? '\n' : '') + ']\n');

module.exports = { txt, safeUrl, ZONE, TYPES, SEA, EQUIP, EQUIP_KEYS, int, norm, date, today, goodPhoto, equipements, clean, sameBien, writeList };
