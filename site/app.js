const DATA=/*__DATA__*/[];
const BUILT="/*__DATE__*/", BUILT_ISO="/*__ISO__*/";
const TYPE_ORDER=["Villa","Propriété","Maison","Mas","Bastide","Manoir","Penthouse","Appartement","Chalet"];
const PLURAL={Villa:"Villas",Propriété:"Propriétés",Maison:"Maisons",Mas:"Mas",Bastide:"Bastides",Manoir:"Manoirs",Penthouse:"Penthouses",Appartement:"Appartements",Chalet:"Chalets"};
const ZONES=["Côte d'Azur","Var","Provence","Occitanie"];
const EQ_ORDER=["piscine","climatisation","terrasse","balcon","jardin","garage","parking","ascenseur","pieds dans l'eau","accès plage","vue panoramique","toit-terrasse","plain-pied","spa","maison d'amis","pool house","tennis","résidence sécurisée","gardien","piscine chauffée","cheminée","domotique","meublé","neuf","rénové","à rénover","anneau de port","ponton","vue sur les îles","coucher de soleil","cave","dressing","cuisine équipée","alarme","sauna","hammam","salle de sport","panneaux solaires","arrosage automatique","calme"];
const DPE_COL={A:"#1f8a4c",B:"#4ea34a",C:"#9bbf3b",D:"#e8c21d",E:"#f0a02a",F:"#e5692a",G:"#d0302f"};
const esc=s=>String(s??"").replace(/[&<>"'`]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"}[c]));
// adresse web sûre : uniquement http(s), sinon lien neutre
const safeU=u=>/^https?:\/\/[^\s"'<>`]+$/i.test(String(u||""))?String(u):"#";
const num=v=>Number.isFinite(+v)&&v!==null&&v!==""?+v:null;
const fr=n=>Number(n).toLocaleString("fr-FR");
const eur=n=>fr(n)+" €";
const eurS=n=>n>=1e6?(n/1e6).toLocaleString("fr-FR",{maximumFractionDigits:n>=1e7?1:2})+" M€":Math.round(n/1e3)+" k€";
const nz=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const ha=n=>n>=10000?(n/10000).toLocaleString("fr-FR",{maximumFractionDigits:2})+" ha":fr(n)+" m²";
const NEWMS=7*864e5, TBUILT=Date.parse(BUILT_ISO)||Date.now();
DATA.forEach(x=>{
  x.ppm=x.surface?Math.round(x.prix/x.surface):null;
  x.isNew=x.ajoute&&TBUILT-Date.parse(x.ajoute)<NEWMS&&x.ajoute!=="2026-09-29";
  x.drop=x.prix_avant&&x.prix_avant>x.prix?x.prix_avant-x.prix:0;
  x.eq=x.equipements||[];
  x.hay=nz([x.ville,x.quartier,x.titre,x.type,x.zone,x.source,x.agence,x.dep,...x.eq,...(x.atouts||[]),x.description,x.details&&x.details.adresse].join(" "));
});

/* ---------- icônes ---------- */
const P='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">';
const I={
  area:P+'<path d="M4 4h16v16H4z"/><path d="M4 9h5M15 4v5M4 15h5M15 15v5"/></svg>',
  bed:P+'<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18v2M21 18v2M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/></svg>',
  bath:P+'<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3zM6 12V6a2 2 0 0 1 3.5-1.3"/></svg>',
  land:P+'<path d="M12 22V12M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/></svg>',
  cam:P+'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  ext:P+'<path d="M7 17L17 7M9 7h8v8"/></svg>',
  l:P+'<path d="M15 5l-7 7 7 7"/></svg>', r:P+'<path d="M9 5l7 7-7 7"/></svg>',
  grid:P+'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  check:P+'<path d="M5 12l5 5L20 7"/></svg>'
};
const EQI={
  "piscine":'<path d="M2 17c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 21c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 14V5a2 2 0 0 1 4 0M16 14V5a2 2 0 0 0-4 0M8 9h8"/>',
  "piscine chauffée":'<path d="M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 13c0-2 2-2 2-4s-2-2-2-4M13 13c0-2 2-2 2-4s-2-2-2-4"/>',
  "climatisation":'<path d="M12 2v20M4.9 7l14.2 10M4.9 17L19.1 7M9 4l3 2 3-2M9 20l3-2 3 2"/>',
  "balcon":'<path d="M4 12h16M5 12v8M9 12v8M13 12v8M17 12v8M3 20h18M8 12V5h8v7"/>',
  "terrasse":'<path d="M12 3v3M5 12H3M21 12h-2M6.3 6.3l1.4 1.4M17.7 6.3l-1.4 1.4"/><circle cx="12" cy="12" r="3.5"/><path d="M3 20h18"/>',
  "toit-terrasse":'<path d="M3 11l9-7 9 7M5 10v10h14V10M9 20v-5h6v5"/>',
  "jardin":'<path d="M12 22V12M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>',
  "garage":'<path d="M3 21V8l9-5 9 5v13M7 21v-8h10v8M7 17h10"/>',
  "parking":'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  "ascenseur":'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 9l3-3 3 3M9 15l3 3 3-3"/>',
  "pieds dans l'eau":'<path d="M2 16c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 20c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><circle cx="17" cy="6" r="3"/>',
  "accès plage":'<path d="M3 20h18M6 20l6-14 6 14M12 6V3"/>',
  "vue panoramique":'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  "spa":'<path d="M3 14h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2zM8 10c0-1.5 1-1.5 1-3M12 10c0-1.5 1-1.5 1-3M16 10c0-1.5 1-1.5 1-3"/>',
  "tennis":'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8"/>',
  "cheminée":'<path d="M12 22c4 0 6-2.5 6-6 0-4-3-5.5-4-9-2 2-3 3.5-3 6-1-1-2-2-2-3.5C7.5 11 6 13 6 16c0 3.5 2 6 6 6z"/>',
  "alarme":'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  "résidence sécurisée":'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  "gardien":'<circle cx="12" cy="7" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  "maison d'amis":'<path d="M2 12l6-5 6 5M4 11v9h8v-9M14 12l4-3 4 3M16 11v9h4v-9"/>',
  "pool house":'<path d="M3 11l9-7 9 7M5 10v6M19 10v6M2 19c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>',
  "anneau de port":'<path d="M12 3v15M8 7h8M5 13c0 4 3 7 7 7s7-3 7-7M5 13l-2 1M19 13l2 1"/>',
  "ponton":'<path d="M3 11h18M6 11v9M12 11v9M18 11v9M2 20c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
  "coucher de soleil":'<path d="M17 18a5 5 0 0 0-10 0M12 9V3M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1"/>',
  "vue sur les îles":'<path d="M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M5 15c1-3 3-5 5-5s3 2 4 5M13 15c.8-2 2-3 3.5-3s2.7 1 3.5 3"/>',
  "domotique":'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  "panneaux solaires":'<path d="M4 14l2-10h12l2 10zM3 14h18M9 4l-1 10M15 4l1 10M5 9h14M12 14v6M8 20h8"/>',
  "salle de sport":'<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  "meublé":'<path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M3 12h18v5H3zM5 17v3M19 17v3"/>'
};
const eqIcon=k=>P+(EQI[k]||'<path d="M5 12l5 5L20 7"/>')+'</svg>';

/* ---------- photos : si une adresse ne répond pas, on passe à la suivante ---------- */
const PH={};DATA.forEach(x=>PH[x.id]=x);
function imgFail(el){const x=PH[el.dataset.id];let i=+el.dataset.i+1;
  if(x&&i<x.photos.length&&!el.classList.contains("b")){el.dataset.i=i;el.src=safeU(x.photos[i]);return}
  if(el.classList.contains("b")){el.remove();return}
  el.remove();const ph=el.closest(".ph");if(ph&&!ph.querySelector("img"))ph.insertAdjacentHTML("beforeend",'<div class="none">Photo sur le site de l\'annonceur</div>')}
// un seul écouteur pour toutes les images (erreur ou chargement), au lieu d'attributs onerror dans le HTML
document.addEventListener("error",e=>{const el=e.target;if(!(el instanceof HTMLImageElement))return;
  if(el.dataset.id!==undefined){imgFail(el);return}
  if(el.dataset.gone==="parent"){el.parentNode&&el.parentNode.remove();return}
  if(el.dataset.gone==="self")el.remove()},true);
document.addEventListener("load",e=>{const el=e.target;if(el instanceof HTMLImageElement&&el.classList.contains("b"))el.classList.add("ok")},true);
const img=(x,i,cls="",eager=false)=>`<img class="${cls}" ${cls==="b"?"data-src":"src"}="${esc(safeU(x.photos[i]))}" data-id="${esc(x.id)}" data-i="${i}" alt="${esc(x.type+" à "+x.ville)}" ${eager?"":'loading="lazy"'} decoding="async" referrerpolicy="no-referrer">`;

/* ---------- carte d'un bien ---------- */
function card(x){
  const s=[];
  if(x.surface)s.push(`<span class="tnum">${I.area}${fr(x.surface)} m²</span>`);
  if(num(x.chambres))s.push(`<span>${I.bed}${num(x.chambres)} ch.</span>`);
  if(num(x.sdb))s.push(`<span>${I.bath}${num(x.sdb)} sdb</span>`);
  if(x.terrain)s.push(`<span class="tnum">${I.land}${ha(x.terrain)}</span>`);
  const top=EQ_ORDER.filter(k=>x.eq.includes(k)&&!["calme","cave","dressing","cuisine équipée","rénové"].includes(k)).slice(0,4);
  const q=x.quartier&&nz(x.quartier)!==nz(x.ville)&&x.quartier.length<34?` <small>· ${esc(x.quartier)}</small>`:"";
  return `<article class="card" data-id="${esc(x.id)}" tabindex="0" aria-label="${esc(x.type+" à "+x.ville+", "+eur(x.prix))}">
    <div class="ph">${img(x,0,"a")}${x.photos[1]?img(x,1,"b"):""}
      <div class="badges"><span class="bdg">${esc(x.type)}</span>${x.isNew?'<span class="bdg new">Nouveau</span>':""}${x.drop?`<span class="bdg down">− ${eurS(x.drop)}</span>`:""}${x.photos.length>1?`<span class="bdg cnt">${I.cam}${x.photos.length}</span>`:""}</div>
    </div>
    <div class="cb">
      <div class="pr"><b class="tnum">${eur(x.prix)}</b>${x.ppm?`<span class="tnum">${fr(x.ppm)} €/m²</span>`:""}</div>
      <div class="city">${esc(x.ville)}${q}</div>
      <p class="ttl">${esc(x.titre||x.resume||x.description)}</p>
      <div class="specs">${s.join("")}</div>
      ${top.length?`<div class="eqs">${top.map(k=>`<span>${esc(cap(k))}</span>`).join("")}</div>`:""}
      <div class="cf"><span><b>${esc(x.source)}</b>${x.agence?" · "+esc(x.agence):""}</span><a class="ext" href="${esc(safeU(x.url))}" target="_blank" rel="noopener noreferrer">Voir sur le site${I.ext}</a></div>
    </div>
  </article>`;
}

/* ---------- état, filtres ---------- */
const st={types:new Set(),zones:new Set(),q:"",budget:"",beds:0,eq:new Set(),sort:"type",view:"liste",open:{},limit:48};
const BUDGETS=[["","Tous les budgets"],["0-500000","Moins de 500 000 €"],["500000-1000000","500 000 € à 1 M€"],["1000000-2000000","1 à 2 M€"],["2000000-5000000","2 à 5 M€"],["5000000-15000000","5 à 15 M€"],["15000000-999000000","Plus de 15 M€"]];
const BEDS=[[0,"Peu importe"],[1,"1 chambre et +"],[2,"2 chambres et +"],[3,"3 chambres et +"],[4,"4 chambres et +"],[5,"5 chambres et +"],[7,"7 chambres et +"]];
const SORTS=[["type","Par type de bien"],["recent","Les plus récents"],["price-desc","Prix décroissant"],["price-asc","Prix croissant"],["surface-desc","Surface décroissante"],["surface-asc","Surface croissante"],["ppm-asc","Prix au m² croissant"],["land-desc","Plus grand terrain"],["drop","Baisses de prix"]];
const OPT_GROUPS=[
  ["La mer",["pieds dans l'eau","accès plage","vue panoramique","vue sur les îles","coucher de soleil","ponton","anneau de port"]],
  ["Extérieurs",["piscine","piscine chauffée","jardin","terrasse","toit-terrasse","balcon","pool house","maison d'amis"]],
  ["Confort",["climatisation","ascenseur","cheminée","cuisine équipée","dressing","cave","meublé","plain-pied","domotique"]],
  ["Bien-être et loisirs",["spa","sauna","hammam","salle de sport","tennis"]],
  ["Stationnement et sécurité",["garage","parking","résidence sécurisée","gardien","alarme"]],
  ["État et environnement",["neuf","rénové","à rénover","calme","panneaux solaires","arrosage automatique"]]];
function list(skip){
  const words=nz(st.q).trim().split(/\s+/).filter(Boolean);
  const [bmin,bmax]=st.budget?st.budget.split("-").map(Number):[0,Infinity];
  return DATA.filter(x=>
    (skip==="type"||!st.types.size||st.types.has(x.type))&&
    (skip==="zone"||!st.zones.size||st.zones.has(x.zone))&&
    (!words.length||words.every(w=>x.hay.includes(w)))&&
    (skip==="budget"||(x.prix>=bmin&&x.prix<bmax))&&
    (skip==="beds"||!st.beds||(x.chambres||0)>=st.beds)&&
    (skip==="eq"||[...st.eq].every(k=>x.eq.includes(k))));
}
function sorted(a){
  const nl=(v,d)=>v==null?d:v;
  const f={"price-desc":(p,q)=>q.prix-p.prix,"price-asc":(p,q)=>p.prix-q.prix,"surface-desc":(p,q)=>nl(q.surface,-1)-nl(p.surface,-1),
    "surface-asc":(p,q)=>nl(p.surface,1e9)-nl(q.surface,1e9),"ppm-asc":(p,q)=>nl(p.ppm,1e9)-nl(q.ppm,1e9),"land-desc":(p,q)=>nl(q.terrain,-1)-nl(p.terrain,-1),
    recent:(p,q)=>(q.ajoute||"").localeCompare(p.ajoute||"")||q.prix-p.prix, drop:(p,q)=>q.drop-p.drop||q.prix-p.prix,
    type:(p,q)=>(TYPE_ORDER.indexOf(p.type)-TYPE_ORDER.indexOf(q.type))||q.prix-p.prix};
  return a.slice().sort(f[st.sort]);
}
const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>';
let popKind=null;
function pillLabel(k){
  if(k==="type"){const n=st.types.size;return n===1?PLURAL[[...st.types][0]]:n?"Types":"Type"}
  if(k==="zone"){const n=st.zones.size;return n===1?[...st.zones][0]:n?"Zones":"Zone"}
  if(k==="budget")return st.budget?BUDGETS.find(b=>b[0]===st.budget)[1]:"Budget";
  if(k==="beds")return st.beds?st.beds+" ch. et +":"Chambres";
  if(k==="opts")return "Options";
  if(k==="sort")return "Trier : "+SORTS.find(x=>x[0]===st.sort)[1].toLowerCase();
}
function pillCount(k){return k==="type"&&st.types.size>1?st.types.size:k==="zone"&&st.zones.size>1?st.zones.size:k==="opts"?st.eq.size:0}
function pillOn(k){return k==="type"?st.types.size>0:k==="zone"?st.zones.size>0:k==="budget"?!!st.budget:k==="beds"?st.beds>0:k==="opts"?st.eq.size>0:false}
function anyFilter(){return st.types.size||st.zones.size||st.q||st.budget||st.beds||st.eq.size}
let drawer=null;
const BIGI={type:P+'<path d="M3 11l9-7 9 7M5 10v10h14V10M9 20v-6h6v6"/></svg>',zone:P+'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',eq:P+'<path d="M2 17c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 14V5a2 2 0 0 1 4 0M16 14V5a2 2 0 0 0-4 0M8 9h8"/></svg>'};
function bigVal(k){
  if(k==="type"){const t=[...st.types];return !t.length?"Tous les biens":t.length===1?PLURAL[t[0]]:t.map(x=>PLURAL[x]).join(", ")}
  if(k==="zone"){const z=[...st.zones];return !z.length?"Toute la côte":z.join(", ")}
  if(k==="eq"){const e=[...st.eq];return !e.length?"Piscine, clim, balcon…":e.length===1?cap(e[0]):e.length+" choisis"}
}
function chips(n){
  document.getElementById("big3").innerHTML=[["type","Type"],["zone","Zone"],["eq","Équipements"]].map(([k,l])=>{
    const set=k==="type"?st.types.size:k==="zone"?st.zones.size:st.eq.size;
    return `<button class="bb${set?" set":""}" type="button" data-drawer="${k}" aria-expanded="${drawer===k}" aria-controls="drawer"><span class="bi">${BIGI[k]}</span><span class="bt"><b>${l}</b><span class="v">${esc(bigVal(k))}</span></span><svg class="cv" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>`}).join("");
  const el=document.getElementById("fpills");
  el.innerHTML=`<span class="fsum" id="count" aria-live="polite">${n?n+" bien"+(n>1?"s":""):"Aucun bien"}${anyFilter()?' · <button class="clear" type="button" id="clearAll">Tout effacer</button>':""}</span>`
    +`<span class="pills-r">`+["budget","beds","sort"].map(k=>`<button class="fp small${pillOn(k)?" on":""}" type="button" data-pop="${k}" aria-haspopup="dialog" aria-expanded="${popKind===k}">${esc(pillLabel(k))}${CHEV}</button>`).join("")+`</span>`;
  drawHTML();
}
function drawHTML(){
  const d=document.getElementById("drawer");
  if(!drawer){d.hidden=true;d.innerHTML="";return}
  d.hidden=false;let body="",sel=0;
  if(drawer==="type"){const b=list("type");sel=st.types.size;
    body=`<div class="dchips">${TYPE_ORDER.filter(t=>DATA.some(x=>x.type===t)).map(t=>{const c=b.filter(x=>x.type===t).length;return `<button class="chip${!c&&!st.types.has(t)?" zero":""}" type="button" data-dv="${t}" aria-pressed="${st.types.has(t)}"${!c&&!st.types.has(t)?" data-z='1'":""}>${PLURAL[t]}<small>${c}</small></button>`}).join("")}</div>`}
  if(drawer==="zone"){const b=list("zone");sel=st.zones.size;
    body=`<div class="dchips">${ZONES.map(z=>{const c=b.filter(x=>x.zone===z).length;return `<button class="chip${!c&&!st.zones.has(z)?" zero":""}" type="button" data-dv="${z}" aria-pressed="${st.zones.has(z)}">${z}<small>${c}</small></button>`}).join("")}</div>`}
  if(drawer==="eq"){const b=list("eq");sel=st.eq.size;const tot=o=>DATA.some(x=>x.eq.includes(o));
    body=OPT_GROUPS.map(([g,keys])=>{const ks=keys.filter(o=>tot(o)||st.eq.has(o));if(!ks.length)return"";
      return `<div class="dg"><h4>${g}</h4><div class="dchips">${ks.map(o=>{const c=b.filter(x=>x.eq.includes(o)&&[...st.eq].every(e=>x.eq.includes(e))).length;return `<button class="chip eq${!c&&!st.eq.has(o)?" zero":""}" type="button" data-dv="${esc(o)}" aria-pressed="${st.eq.has(o)}">${eqIcon(o)}${esc(cap(o))}<small>${c}</small></button>`}).join("")}</div></div>`}).join("")}
  const hint={type:"Plusieurs types possibles",zone:"Plusieurs zones possibles",eq:"Le bien doit avoir tout ce qui est choisi"}[drawer];
  d.innerHTML=body+`<div class="dfoot"><span>${hint}</span>${sel?`<button type="button" data-dclr="1">Effacer</button>`:""}</div>`;
}
document.getElementById("big3").addEventListener("click",e=>{const b=e.target.closest("[data-drawer]");if(!b)return;drawer=drawer===b.dataset.drawer?null:b.dataset.drawer;closePop();chips(list().length)});
document.getElementById("drawer").addEventListener("click",e=>{
  const c=e.target.closest("[data-dv]");
  if(c){const v=c.dataset.dv,S=drawer==="type"?st.types:drawer==="zone"?st.zones:st.eq;S.has(v)?S.delete(v):S.add(v);reset();render();return}
  if(e.target.closest("[data-dclr]")){(drawer==="type"?st.types:drawer==="zone"?st.zones:st.eq).clear();reset();render()}
});
/* ---------- panneaux de choix ---------- */
const pop=document.getElementById("pop"),popback=document.getElementById("popback");
const optRow=(type,name,val,checked,label,n,icon)=>`<label class="opt${n===0&&!checked?" off":""}"><input type="${type}" name="${name}" value="${esc(val)}"${checked?" checked":""}>${icon?`<span class="ico">${icon}</span>`:""}<span class="lb2">${esc(label)}</span>${n!=null?`<small class="tnum">${n}</small>`:""}</label>`;
function popHTML(k){
  let title="",sub="",body="",wide=false;
  if(k==="type"){const b=list("type");title="Type de bien";sub="plusieurs choix possibles";
    body=`<div class="pgrid one">${TYPE_ORDER.filter(t=>DATA.some(d=>d.type===t)).map(t=>optRow("checkbox","type",t,st.types.has(t),PLURAL[t],b.filter(x=>x.type===t).length)).join("")}</div>`}
  if(k==="zone"){const b=list("zone");title="Zone";sub="plusieurs choix possibles";
    const Z={"Côte d'Azur":"Alpes-Maritimes (06)","Var":"Var (83)","Provence":"Bouches-du-Rhône (13)","Occitanie":"Gard, Hérault, Aude, Pyrénées-Orientales"};
    body=`<div class="pgrid one">${ZONES.map(z=>optRow("checkbox","zone",z,st.zones.has(z),z+" · "+Z[z],b.filter(x=>x.zone===z).length)).join("")}</div>`}
  if(k==="budget"){const b=list("budget");title="Budget";
    body=`<div class="pgrid one">${BUDGETS.map(([v,l])=>{const[a,c]=v?v.split("-").map(Number):[0,Infinity];return optRow("radio","budget",v,st.budget===v,l,b.filter(x=>x.prix>=a&&x.prix<c).length)}).join("")}</div>`}
  if(k==="beds"){const b=list("beds");title="Chambres";
    body=`<div class="pgrid one">${BEDS.map(([v,l])=>optRow("radio","beds",v,st.beds===v,l,b.filter(x=>!v||(x.chambres||0)>=v).length)).join("")}</div>`}
  if(k==="opts"){const b=list("eq");wide=true;title="Options";sub="le bien doit tout avoir";
    const total=o=>DATA.filter(x=>x.eq.includes(o)).length;
    body=OPT_GROUPS.map(([g,keys])=>{const ks=keys.filter(o=>total(o)||st.eq.has(o));if(!ks.length)return"";
      return `<div class="pgroup"><h4>${g}</h4><div class="pgrid">${ks.map(o=>optRow("checkbox","eq",o,st.eq.has(o),cap(o),b.filter(x=>x.eq.includes(o)&&[...st.eq].every(e=>x.eq.includes(e))).length,eqIcon(o))).join("")}</div></div>`}).join("")}
  if(k==="sort"){title="Trier";
    body=`<div class="pgrid one">${SORTS.map(([v,l])=>optRow("radio","sort",v,st.sort===v,l,null)).join("")}</div>`}
  const n=list().length;
  pop.classList.toggle("wide",wide);
  pop.innerHTML=`<div class="ph2"><h3>${title}</h3>${sub?`<span>${sub}</span>`:""}</div><div class="pbody">${body}</div>
    <div class="pfoot">${k==="sort"?"<span></span>":`<button class="clr" type="button" data-clr="${k}">Effacer</button>`}<button class="go" type="button" data-close="1">${n?"Voir "+n+" bien"+(n>1?"s":""):"Aucun bien"}</button></div>`;
}
function placePop(btn){
  if(innerWidth<=600){pop.style.left="";pop.style.top="";return}
  const host=document.getElementById("filtres").getBoundingClientRect(),r=btn.getBoundingClientRect();
  const w=pop.offsetWidth;let left=r.left-host.left;if(left+w>host.width-16)left=Math.max(16,r.right-host.left-w);
  pop.style.left=left+"px";pop.style.top=(r.bottom-host.top+8)+"px";
}
function openPop(k){
  if(popKind===k)return closePop();
  popKind=k;drawer=null;popHTML(k);pop.hidden=false;popback.hidden=false;chips(list().length);
  const btn=document.querySelector(`[data-pop="${k}"]`);placePop(btn);
  const first=pop.querySelector("input");if(first&&innerWidth>600)first.focus({preventScroll:true});
}
function closePop(){if(!popKind)return;const k=popKind;popKind=null;pop.hidden=true;popback.hidden=true;chips(list().length);const b=document.querySelector(`[data-pop="${k}"]`);if(b)b.focus({preventScroll:true})}
function refreshPop(){if(!popKind)return;const sc=pop.querySelector(".pbody").scrollTop;popHTML(popKind);pop.querySelector(".pbody").scrollTop=sc}
pop.addEventListener("change",e=>{const i=e.target;if(!i.name)return;
  if(i.name==="type"){i.checked?st.types.add(i.value):st.types.delete(i.value)}
  if(i.name==="zone"){i.checked?st.zones.add(i.value):st.zones.delete(i.value)}
  if(i.name==="eq"){i.checked?st.eq.add(i.value):st.eq.delete(i.value)}
  if(i.name==="budget")st.budget=i.value;
  if(i.name==="beds")st.beds=+i.value;
  if(i.name==="sort")st.sort=i.value;
  reset();render();refreshPop();
  if(i.name==="sort")closePop();
});
pop.addEventListener("click",e=>{
  const c=e.target.closest("[data-clr]");if(c){const k=c.dataset.clr;if(k==="type")st.types.clear();if(k==="zone")st.zones.clear();if(k==="budget")st.budget="";if(k==="beds")st.beds=0;if(k==="opts")st.eq.clear();reset();render();refreshPop();return}
  if(e.target.closest("[data-close]")){closePop();document.getElementById("biens").scrollIntoView({behavior:"smooth",block:"start"})}
});
popback.addEventListener("click",closePop);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&popKind){e.preventDefault();closePop()}});
addEventListener("resize",()=>{if(popKind)placePop(document.querySelector(`[data-pop="${popKind}"]`))});
let lastList=[];
function render(){
  const a=sorted(list());lastList=a;
  chips(a.length);
  if(st.view==="carte"){drawMap(a);return}
  const out=document.getElementById("out");
  if(!a.length){out.innerHTML=`<div class="empty"><h3>Aucun bien ne correspond</h3><p>Retirez un équipement, élargissez le budget ou changez de zone.</p></div>`;return}
  if(st.sort==="type"){
    out.innerHTML=TYPE_ORDER.map(t=>{const g=a.filter(x=>x.type===t);if(!g.length)return"";
      const lim=st.open[t]?g.length:12,rest=g.length-lim;
      return `<div class="ghead"><h2>${PLURAL[t]}</h2><span class="gc">${g.length} bien${g.length>1?"s":""}, de ${eurS(Math.min(...g.map(x=>x.prix)))} à ${eurS(Math.max(...g.map(x=>x.prix)))}</span></div>
        <div class="grid">${g.slice(0,lim).map(card).join("")}</div>${rest>0?`<div class="more"><button class="morebtn" type="button" data-more="${t}">Voir les ${rest} autres ${PLURAL[t].toLowerCase()}</button></div>`:""}`}).join("");
  }else{
    const rest=a.length-st.limit;
    out.innerHTML=`<div class="grid">${a.slice(0,st.limit).map(card).join("")}</div>${rest>0?`<div class="more"><button class="morebtn" type="button" data-more="*">Afficher ${Math.min(rest,48)} biens de plus</button></div>`:""}`;
  }
}

/* ---------- carte interactive ---------- */
let map=null,cluster=null,mini=null;
const hasL=()=>typeof window.L!=="undefined";
// Fond de carte : OpenFreeMap (gratuit, sans clé, sans limite), style clair ou sombre selon le thème.
// Si WebGL ou le réseau font défaut, bascule sur la carte standard d'OpenStreetMap (gratuite, sans clé).
const OFM="https://tiles.openfreemap.org/styles/";
const ATTR_OFM='<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> · données © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';
// MapLibre GL (module) et son pont vers Leaflet sont hébergés sur le site, dans vendor/, et chargés seulement à l'ouverture d'une carte.
const MGL_MOD="./vendor/maplibre-gl.mjs",MGL_BRIDGE="vendor/leaflet-maplibre-gl.js";
let mglP=null;const bases=[];
const webgl=()=>{try{const c=document.createElement("canvas");return !!(c.getContext("webgl2")||c.getContext("webgl"))}catch(e){return false}};
const loadJS=u=>new Promise((ok,ko)=>{const s=document.createElement("script");s.src=u;s.onload=ok;s.onerror=ko;document.head.appendChild(s)});
function ensureMGL(){if(!mglP)mglP=(webgl()?import(MGL_MOD).then(m=>{window.maplibregl=m.default&&m.default.Map?m.default:m;return loadJS(MGL_BRIDGE)}).then(()=>!!(window.maplibregl&&L.maplibreGL)):Promise.resolve(false)).catch(()=>false);return mglP}
const osm=()=>L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'});
function addBase(m){
  ensureMGL().then(ok=>{
    if(!m._container)return;
    if(!ok){osm().addTo(m);return}
    const lay=L.maplibreGL({style:OFM+(isDark()?"dark":"positron"),attribution:ATTR_OFM});lay.addTo(m);bases.push([m,lay]);
    const gl=lay.getMaplibreMap&&lay.getMaplibreMap();let ready=false,fell=false;
    const fall=()=>{if(fell||ready||!m._container)return;fell=true;try{m.removeLayer(lay)}catch(e){}osm().addTo(m)};
    if(gl){gl.once("styledata",()=>ready=true);gl.once("load",()=>ready=true);
      gl.on("error",e=>{if(!ready&&!(e&&e.sourceId))fall()})}  // erreur du style lui-même (pas d'une tuile)
    const check=()=>{if(ready||fell)return;if(document.visibilityState!=="visible"){document.addEventListener("visibilitychange",()=>setTimeout(check,6000),{once:true});return}if(gl&&gl.isStyleLoaded())ready=true;else fall()};
    setTimeout(check,12000);
  });
}
function restyle(){bases.forEach(([m,l])=>{try{if(m._container&&l.getMaplibreMap)l.getMaplibreMap().setStyle(OFM+(isDark()?"dark":"positron"))}catch(e){}})}
/* la fiche d'aperçu de la carte doit rester entière à l'écran, jamais cachée sous la barre des filtres */
addEventListener("resize",()=>{if(map)map.invalidateSize()});
function popVisible(el){if(!el||!el.isConnected)return;const r=el.getBoundingClientRect(),f=document.getElementById("filtres").getBoundingClientRect();
  const haut=(getComputedStyle(document.getElementById("filtres")).position==="sticky"?f.bottom:76),bas=innerHeight-12;
  if(r.top<haut)scrollBy({top:r.top-haut,behavior:"smooth"});else if(r.bottom>bas)scrollBy({top:Math.min(r.bottom-bas,r.top-haut),behavior:"smooth"})}
function drawMap(a){
  if(!hasL()){document.getElementById("map").innerHTML='<div class="empty"><h3>Carte indisponible</h3><p>La bibliothèque de carte n\'a pas pu se charger. Réessayez plus tard.</p></div>';return}
  if(!map){
    map=L.map("map",{scrollWheelZoom:true,zoomControl:true,maxZoom:18,minZoom:3}).setView([43.35,5.6],8);
    addBase(map);
    cluster=L.markerClusterGroup?L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:48,iconCreateFunction:c=>L.divIcon({className:"cl",html:`<div>${c.getChildCount()}</div>`,iconSize:[0,0]})}):L.layerGroup();
    map.addLayer(cluster);
    map.on("popupopen",e=>{const el=e.popup.getElement(),b=el.querySelector("[data-open]");if(b)b.onclick=()=>openFiche(b.dataset.open);setTimeout(()=>popVisible(el),300)});
  }
  cluster.clearLayers();
  const pts=[];
  a.filter(x=>x.geo).forEach(x=>{
    const m=L.marker(x.geo,{icon:L.divIcon({className:"pm",html:`<span>${eurS(x.prix)}</span>`,iconSize:[0,0]}),title:x.type+" à "+x.ville,keyboard:true});
    m.bindPopup(()=>`<div class="mpop">${x.photos[0]?`<img src="${esc(safeU(x.photos[0]))}" alt="" referrerpolicy="no-referrer" data-gone="self">`:""}<div class="t"><b class="tnum">${eur(x.prix)}</b><div class="c">${esc(x.type)} · ${esc(x.ville)}</div><div class="mini">${[x.surface&&fr(x.surface)+" m²",num(x.chambres)&&num(x.chambres)+" ch.",x.piscine&&"piscine"].filter(Boolean).join(" · ")}</div><button type="button" data-open="${esc(x.id)}">Voir la fiche</button></div></div>`,{maxWidth:260,minWidth:240,autoPanPaddingTopLeft:[20,20],autoPanPaddingBottomRight:[20,20]});
    cluster.addLayer(m);pts.push(x.geo);
  });
  setTimeout(()=>{map.invalidateSize();if(pts.length)map.fitBounds(L.latLngBounds(pts).pad(0.08),{maxZoom:13})},60);
}

/* ---------- fiche ultra détaillée ---------- */
const fiche=document.getElementById("fiche"),fb=document.getElementById("fBody");
let cur=null;
const row=(k,v)=>v==null||v===""||v===false?"":`<tr><th>${k}</th><td>${v}</td></tr>`;
function similaires(x){
  const house=t=>!["Appartement","Penthouse"].includes(t);
  return DATA.filter(y=>y.id!==x.id&&y.zone===x.zone&&house(y.type)===house(x.type)&&y.prix>x.prix*.6&&y.prix<x.prix*1.6)
    .sort((a,b)=>Math.abs(a.prix-x.prix)-Math.abs(b.prix-x.prix)).slice(0,4);
}
function openFiche(id,push=true){
  const x=PH[id];if(!x)return;cur=x;
  const d=x.details||{};
  const where=[x.quartier&&nz(x.quartier)!==nz(x.ville)?x.quartier:null,x.ville,`${x.zone} (${x.dep})`].filter(Boolean).map(esc).join(" · ");
  const n=x.photos.length,mos=x.photos.slice(0,5);
  const keys=[[x.surface&&fr(x.surface)+" m²","habitables"],[x.terrain&&ha(x.terrain),"de terrain"],[num(x.pieces),"pièces"],[num(x.chambres),"chambres"],[num(x.sdb),"salles de bains"],[d.etage!=null&&d.etage!==""?(isNaN(d.etage)?d.etage:(+d.etage===0?"RDC":d.etage+"ᵉ")):null,"étage"],[d.surface_terrasse&&fr(d.surface_terrasse)+" m²","de terrasse"],[num(d.distance_mer_m)&&(d.distance_mer_m>=1000?(d.distance_mer_m/1000).toLocaleString("fr-FR")+" km":num(d.distance_mer_m)+" m"),"de la mer"]].filter(k=>k[0]);
  const also=(x.aussi||[]).filter(a=>a.url&&a.url!==x.url);
  const sim=similaires(x);
  const dpeBar=l=>l?`<div class="dpe">${"ABCDEFG".split("").map(c=>`<span class="d${c}${c===l?" on":""}">${c}</span>`).join("")}</div>`:"";
  fb.innerHTML=`<div class="wrap">
    <div class="mosaic n${Math.min(n,5)}">${mos.map((p,i)=>`<button class="m" type="button" data-ph="${i}" aria-label="Agrandir la photo ${i+1}">${img(x,i,"",i<3)}</button>`).join("")}
      ${n>1?`<button class="ibtn allph" type="button" data-ph="0">${I.grid}Voir les ${n} photos</button>`:""}</div>
    <div class="fhead">
      <div><div class="kick">${esc(x.type)} · vue mer${x.isNew?" · nouveau":""}</div><h2>${esc(x.titre||x.type+" à "+x.ville)}</h2><div class="where">${where}</div></div>
      <div class="bigprice"><b class="tnum">${eur(x.prix)}</b>${x.ppm?`<small class="tnum">${fr(x.ppm)} € le m² habitable</small>`:""}${x.drop?`<div class="was tnum">Baisse de ${eur(x.drop)} (avant ${eur(x.prix_avant)})</div>`:""}</div>
    </div>
    ${keys.length?`<div class="keys">${keys.map(([v,l])=>`<div class="key"><b class="tnum">${esc(v)}</b><span>${l}</span></div>`).join("")}</div>`:""}
    <div class="fbody">
      <div>
        <h3 class="h3">Description</h3>
        <p class="desc">${esc(x.description||x.resume||"")}</p>
        <p class="mini">D'après l'annonce publiée par ${esc(x.source)}${x.agence?" ("+esc(x.agence)+")":""}. Le texte original est sur le site de l'annonceur.</p>
        ${x.eq.length?`<h3 class="h3">Équipements</h3><div class="eqgrid">${EQ_ORDER.filter(k=>x.eq.includes(k)).map(k=>`<div class="eqi">${eqIcon(k)}${esc(cap(k))}</div>`).join("")}</div>`:""}
        ${x.atouts&&x.atouts.length?`<h3 class="h3">Les atouts selon l'annonce</h3><div class="tags">${x.atouts.map(a=>`<span class="tag">${esc(cap(a))}</span>`).join("")}</div>`:""}
        <h3 class="h3">Caractéristiques</h3>
        <table class="tbl"><tbody>
          ${row("Type de bien",esc(x.type))}
          ${row("Surface habitable",x.surface&&fr(x.surface)+" m²")}
          ${row("Terrain",x.terrain&&ha(x.terrain))}
          ${row("Surface des terrasses",d.surface_terrasse&&fr(d.surface_terrasse)+" m²")}
          ${row("Surface du jardin",d.surface_jardin&&fr(d.surface_jardin)+" m²")}
          ${row("Pièces",num(x.pieces))}${row("Chambres",num(x.chambres))}${row("Salles de bains / d'eau",num(x.sdb))}
          ${row("Étage",d.etage!=null?esc(d.etage)+(d.nb_etages?" sur "+esc(d.nb_etages):""):null)}
          ${row("Exposition",esc(d.exposition))}
          ${row("État",esc(d.etat))}
          ${row("Chauffage",esc(d.chauffage))}
          ${row("Stationnement",esc(d.stationnement))}
          ${row("Piscine",x.piscine===true?(x.eq.includes("piscine chauffée")?"Oui, chauffée":"Oui"):x.piscine===false?"Non":null)}
          ${row("Distance à la mer",num(d.distance_mer_m)&&(d.distance_mer_m>=1000?(d.distance_mer_m/1000).toLocaleString("fr-FR")+" km":num(d.distance_mer_m)+" m"))}
          ${row("Année de construction",num(x.annee)||num(d.annee))}
          ${row("Charges",d.charges_mois&&eur(d.charges_mois)+" par mois")}
          ${row("Taxe foncière",d.taxe_fonciere&&eur(d.taxe_fonciere)+" par an")}
          ${row("Honoraires",d.honoraires?(isNaN(d.honoraires)?esc(d.honoraires):eur(d.honoraires)):null)}
          ${row("Consommation énergie",num(d.dpe_kwh)&&fr(d.dpe_kwh)+" kWh/m²/an")}
          ${row("Émissions (GES)",d.ges?esc(d.ges)+(num(d.ges_kg)?" · "+num(d.ges_kg)+" kg CO₂/m²/an":""):null)}
          ${row("Adresse ou secteur",esc(d.adresse))}
          ${row("Référence",esc(x.ref))}
          ${row("Annonceur",esc(x.source+(x.agence?" · "+x.agence:"")))}
        </tbody></table>
        ${/^[A-G]$/.test(x.dpe||"")?`<h3 class="h3">Diagnostic énergie</h3><div class="mini">Classe ${x.dpe}</div>${dpeBar(x.dpe)}`:""}
        ${x.geo?`<h3 class="h3">Situation</h3><div id="miniMap"></div><p class="mapnote">Position approximative (${x.geoPrec==="quartier"?"quartier":"commune"}). L'adresse exacte est communiquée par l'annonceur.</p>`:""}
      </div>
      <aside class="side"><div class="stick">
        <div class="box">
          <div class="bp tnum">${eur(x.prix)}</div>
          <p>${x.ppm?`${fr(x.ppm)} € le m² · `:""}${esc(x.ville)}</p>
          ${x.drop?`<p class="drop">Prix baissé de ${eur(x.drop)}</p>`:""}
          <a class="btn" href="${esc(safeU(x.url))}" target="_blank" rel="noopener noreferrer">Voir l'annonce sur ${esc(x.source)}${I.ext}</a>
          ${also.length?`<div class="alt">Aussi chez ${also.map(a=>`<a href="${esc(safeU(a.url))}" target="_blank" rel="noopener noreferrer">${esc(a.source)}</a>`).join(", ")}</div>`:""}
        </div>
        <div class="box mini">Ajoutée le ${new Date(x.ajoute+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})} · vérifiée le ${new Date(x.verifie+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}.<br>Les informations viennent de l'annonce. Prix, disponibilité et visites se voient directement avec l'annonceur.</div>
      </div></aside>
    </div>
  </div>
  ${sim.length?`<section class="simil"><div class="wrap"><div class="ghead"><h2>Dans le même esprit</h2><span class="gc">${esc(x.zone)}, budget voisin</span></div><div class="grid">${sim.map(card).join("")}</div></div></section>`:""}`;
  document.getElementById("fSite").href=safeU(x.url);
  if(!fiche.open)fiche.showModal();
  fb.scrollTop=0;fb.setAttribute('tabindex','-1');fb.focus({preventScroll:true});
  if(mini){mini.remove();mini=null}
  if(x.geo&&hasL()){setTimeout(()=>{const el=document.getElementById("miniMap");if(!el)return;mini=L.map(el,{maxZoom:18,minZoom:3,zoomControl:true,scrollWheelZoom:false,dragging:!L.Browser.mobile,attributionControl:true}).setView(x.geo,x.geoPrec==="quartier"?14:13);addBase(mini);L.circle(x.geo,{radius:x.geoPrec==="quartier"?450:900,color:"#B1192F",weight:1.5,fillColor:"#B1192F",fillOpacity:.14}).addTo(mini)},80)}
  if(push){try{history.replaceState(null,"","#bien"+x.id)}catch(e){}}
}
function closeFiche(){fiche.close()}
fiche.addEventListener("close",()=>{cur=null;if(mini){mini.remove();mini=null}try{history.replaceState(null,"",location.pathname+location.search+(st.view==="carte"?"#carte":""))}catch(e){}});
document.getElementById("fBack").addEventListener("click",closeFiche);
fb.addEventListener("click",e=>{
  const p=e.target.closest("[data-ph]");if(p){openLb(+p.dataset.ph);return}
  if(e.target.closest("a"))return;
  const c=e.target.closest(".card");if(c)openFiche(c.dataset.id);
});
document.getElementById("fShare").addEventListener("click",()=>{
  if(!cur)return;const u=location.href.split("#")[0]+"#bien"+cur.id;
  const done=m=>{const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)};
  try{navigator.clipboard.writeText(u).then(()=>done("Lien copié"),()=>done(u))}catch(e){done(u)}
});

/* ---------- visionneuse photos ---------- */
const lb=document.getElementById("lb");let li=0;
function openLb(i){if(!cur||!cur.photos.length)return;lb.hidden=false;
  document.getElementById("lbThumbs").innerHTML=cur.photos.map((p,k)=>`<button type="button" data-k="${k}" aria-label="Photo ${k+1}"><img src="${esc(safeU(p))}" alt="" loading="lazy" referrerpolicy="no-referrer" data-gone="parent"></button>`).join("");
  showLb(i)}
function showLb(i){const n=cur.photos.length;li=(i+n)%n;
  document.getElementById("lbImg").innerHTML=`<img src="${esc(safeU(cur.photos[li]))}" alt="${esc(cur.type+" à "+cur.ville+", photo "+(li+1))}" referrerpolicy="no-referrer">${n>1?`<button class="nv pv" type="button" data-s="-1" aria-label="Précédente">${I.l}</button><button class="nv nx" type="button" data-s="1" aria-label="Suivante">${I.r}</button>`:""}`;
  document.getElementById("lbIdx").textContent=`${li+1} / ${n} · ${cur.type} à ${cur.ville}`;
  document.querySelectorAll("#lbThumbs button").forEach(b=>{const on=+b.dataset.k===li;b.setAttribute("aria-current",on);if(on)b.scrollIntoView({block:"nearest",inline:"nearest"})})}
function closeLb(){lb.hidden=true}
lb.addEventListener("click",e=>{const s=e.target.closest("[data-s]");if(s)return showLb(li+ +s.dataset.s);const k=e.target.closest("[data-k]");if(k)return showLb(+k.dataset.k);if(e.target.closest("#lbX"))closeLb()});
let tx=null;const lbi=document.getElementById("lbImg");
lbi.addEventListener("touchstart",e=>tx=e.touches[0].clientX,{passive:true});
lbi.addEventListener("touchend",e=>{if(tx==null)return;const d=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(d)>40)showLb(li+(d<0?1:-1))});
document.addEventListener("keydown",e=>{
  if(!lb.hidden){if(e.key==="Escape"){e.preventDefault();closeLb()}if(e.key==="ArrowRight")showLb(li+1);if(e.key==="ArrowLeft")showLb(li-1);return}
});
fiche.addEventListener("cancel",e=>{if(!lb.hidden){e.preventDefault();closeLb()}});

/* ---------- recherche avec suggestions ---------- */
const qi=document.getElementById("q"),sg=document.getElementById("sugg");
const SUG=(()=>{const m=new Map();const add=(label,kind)=>{const k=nz(label)+"|"+kind;const o=m.get(k);if(o)o.n++;else m.set(k,{label,kind,n:1})};
  DATA.forEach(x=>{add(x.ville,"Ville");if(x.quartier&&x.quartier.length<30&&nz(x.quartier)!==nz(x.ville))add(x.quartier,"Quartier");x.eq.forEach(e=>add(cap(e),"Équipement"))});
  ZONES.forEach(z=>add(z,"Zone"));return [...m.values()]})();
let sIdx=-1,sItems=[];
function showSugg(){const q=nz(qi.value).trim();if(q.length<2){sg.hidden=true;qi.setAttribute("aria-expanded","false");return}
  sItems=SUG.filter(s=>nz(s.label).includes(q)).sort((a,b)=>(nz(b.label).startsWith(q)-nz(a.label).startsWith(q))||b.n-a.n).slice(0,8);
  if(!sItems.length){sg.hidden=true;return}
  sIdx=-1;sg.innerHTML=sItems.map((s,i)=>`<li role="option" id="s${i}" data-i="${i}" aria-selected="false"><span>${esc(s.label)}</span><small>${s.kind} · ${s.n}</small></li>`).join("");
  sg.hidden=false;qi.setAttribute("aria-expanded","true")}
function pick(i){const s=sItems[i];if(!s)return;
  if(s.kind==="Équipement"){st.eq.add(nz(s.label)===nz("pieds dans l'eau")?"pieds dans l'eau":EQ_ORDER.find(k=>nz(k)===nz(s.label))||s.label.toLowerCase());qi.value="";st.q=""}
  else if(s.kind==="Zone"){st.zones=new Set([s.label]);qi.value="";st.q=""}
  else{qi.value=s.label;st.q=s.label}
  sg.hidden=true;reset();render()}
qi.addEventListener("input",()=>{st.q=qi.value;reset();render();showSugg()});
qi.addEventListener("keydown",e=>{if(sg.hidden)return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();sIdx=(sIdx+(e.key==="ArrowDown"?1:-1)+sItems.length)%sItems.length;[...sg.children].forEach((li,k)=>li.setAttribute("aria-selected",k===sIdx));qi.setAttribute("aria-activedescendant","s"+sIdx)}
  if(e.key==="Enter"&&sIdx>=0){e.preventDefault();pick(sIdx)}
  if(e.key==="Escape")sg.hidden=true});
sg.addEventListener("mousedown",e=>{const li=e.target.closest("li");if(li){e.preventDefault();pick(+li.dataset.i)}});
qi.addEventListener("blur",()=>setTimeout(()=>sg.hidden=true,120));

/* ---------- événements ---------- */
const reset=()=>{st.open={};st.limit=48};
function setView(v,scroll){st.view=v;document.body.classList.toggle("vcarte",v==="carte");document.getElementById("vList").setAttribute("aria-pressed",v==="liste");document.getElementById("vMap").setAttribute("aria-pressed",v==="carte");
  document.getElementById("out").hidden=v==="carte";document.getElementById("mapView").hidden=v!=="carte";render();
  try{history.replaceState(null,"",location.pathname+location.search+(v==="carte"?"#carte":""))}catch(e){}
  if(scroll)document.getElementById("filtres").scrollIntoView({behavior:"smooth"})}
document.getElementById("vList").onclick=()=>setView("liste");
document.getElementById("vMap").onclick=()=>setView("carte");
document.querySelectorAll("[data-view]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();setView(a.dataset.view,true)}));
const out=document.getElementById("out");
const hoverLoad=e=>{const c=e.target.closest&&e.target.closest(".card");if(!c)return;const b=c.querySelector("img.b[data-src]");if(b){b.src=b.dataset.src;b.removeAttribute("data-src")}};
document.addEventListener("pointerover",hoverLoad,{passive:true});
out.addEventListener("click",e=>{
  const m=e.target.closest("[data-more]");if(m){if(m.dataset.more==="*")st.limit+=48;else st.open[m.dataset.more]=true;render();return}
  if(e.target.closest("a"))return;
  const c=e.target.closest(".card");if(c)openFiche(c.dataset.id);
});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("card")){e.preventDefault();openFiche(e.target.dataset.id)}});
document.getElementById("navOpts").addEventListener("click",e=>{e.preventDefault();document.getElementById("filtres").scrollIntoView({behavior:"smooth"});setTimeout(()=>{drawer="eq";chips(list().length)},350)});
document.getElementById("fpills").addEventListener("click",e=>{
  const p=e.target.closest("[data-pop]");if(p){openPop(p.dataset.pop);return}
  if(e.target.closest("#clearAll")){st.types.clear();st.zones.clear();st.eq.clear();Object.assign(st,{q:"",budget:"",beds:0});qi.value="";closePop();drawer=null;reset();render()}
});

/* ---------- ouverture, chiffres, sources ---------- */
(function(){
  const withPh=DATA.filter(x=>x.photos.length);
  // photos d'ouverture choisies à la main (filigrane discret), sinon les plus beaux biens hors Michaël Zingraf (grand filigrane)
  const HERO=[20,9,22].map(i=>PH[i]).filter(x=>x&&x.photos.length);
  const heroes=(HERO.length?HERO:[...withPh].filter(x=>x.source!=="Michaël Zingraf").sort((a,b)=>b.prix-a.prix).slice(0,3));
  const box=document.getElementById("heroImgs"),cr=document.getElementById("heroCredit");let hk=0;
  const slides=heroes.map(x=>{const im=new Image();im.alt="";im.referrerPolicy="no-referrer";im.onerror=()=>im.remove();im.onload=()=>{if(!box.querySelector("img.on")){im.classList.add("on");cr.textContent=`${x.type} à ${x.ville} · ${eurS(x.prix)} · voir la fiche`;cr.onclick=()=>openFiche(x.id)}};im.src=safeU(x.photos[0]);box.appendChild(im);return [im,x]});
  if(slides.length>1&&!matchMedia("(prefers-reduced-motion:reduce)").matches)setInterval(()=>{const ok=slides.filter(([im])=>im.isConnected&&im.complete&&im.naturalWidth);if(ok.length<2)return;
    hk=(hk+1)%ok.length;ok.forEach(([im],k)=>im.classList.toggle("on",k===hk));const x=ok[hk][1];cr.textContent=`${x.type} à ${x.ville} · ${eurS(x.prix)} · voir la fiche`;cr.onclick=()=>openFiche(x.id)},6500);
  const p=DATA.map(x=>x.prix),nPh=DATA.reduce((s,x)=>s+x.photos.length,0),cities=new Set(DATA.map(x=>x.ville)).size,news=DATA.filter(x=>x.isNew).length;
  // date réelle de la dernière vérification des annonces (et non la date de reconstruction du site)
  const lastV=DATA.map(x=>x.verifie||"").sort().pop();
  const vDate=lastV?new Date(lastV+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):BUILT;
  document.getElementById("heroSub").textContent=`${DATA.length} maisons, villas et appartements vue mer en vente sur la côte méditerranéenne française. Annonces vérifiées le ${vDate}.`;
  document.getElementById("stats").innerHTML=[[DATA.length,"biens vue mer"],[fr(nPh),"photos d'annonces"],[eurS(Math.min(...p))+" à "+eurS(Math.max(...p)),"prix affichés"],[news?news:cities,news?"ajoutés cette semaine":"communes"]]
    .map(([n,l])=>`<div class="stat"><div class="n tnum">${n}</div><div class="l">${l}</div></div>`).join("");
  const src={};DATA.forEach(x=>{src[x.source]=src[x.source]||{n:0,u:x.url};src[x.source].n++});
  document.getElementById("foot1").textContent=`Annonces relevées sur ${Object.keys(src).length} sites d'agences et de portails. Dernière vérification : ${vDate}. Chaque bien a une vue mer écrite dans son annonce et au moins une photo publiée par l'annonceur.`;
  document.getElementById("foot2").textContent="Sud'perbe n'est pas une agence : pour visiter, négocier ou acheter, passez par l'annonceur. Les sites qui bloquent la lecture automatique (SeLoger, Leboncoin, Bien'ici, Belles Demeures, Green-Acres) ne sont pas inclus.";
  document.getElementById("srcs").innerHTML=Object.entries(src).sort((a,b)=>b[1].n-a[1].n).map(([k,v])=>{let h="";try{h=new URL(v.u).origin}catch(e){}return `<a href="${esc(safeU(h))}" target="_blank" rel="noopener noreferrer">${esc(k)} (${v.n})</a>`}).join("");
})();

/* ---------- thème ---------- */
const root=document.documentElement,tb=document.getElementById("theme");
const isDark=()=>{const a=root.getAttribute("data-theme");return a?a==="dark":matchMedia("(prefers-color-scheme:dark)").matches};
function themeIcon(){tb.innerHTML=isDark()?P+'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>':P+'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'}
try{const s=localStorage.getItem("sp-theme");if(s)root.setAttribute("data-theme",s)}catch(e){}
tb.onclick=()=>{const d=!isDark();root.setAttribute("data-theme",d?"dark":"light");try{localStorage.setItem("sp-theme",d?"dark":"light")}catch(e){}themeIcon();restyle()};
try{matchMedia("(prefers-color-scheme:dark)").addEventListener("change",()=>{themeIcon();restyle()})}catch(e){}
themeIcon();
render();
const h=location.hash;
if(/^#bien\d+$/.test(h))openFiche(h.slice(5),false);
else if(h==="#carte")setView("carte");
