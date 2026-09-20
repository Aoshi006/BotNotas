
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm";

const cfg = window.BOTNOTAS_CONFIG || {};
const configured =
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_ANON_KEY &&
  !cfg.SUPABASE_URL.includes("COLE_AQUI") &&
  !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI");

const supabase = configured ? createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const state = {
  page: "home",
  session: null,
  loading: false,
  notas: [],
  itens: [],
  aliases: new Map(),
  products: [],
  productRows: [],
  productFilter: "Todos",
  selectedMonth: new Date().toISOString().slice(0,7),
  activeList: null,
  listItems: [],
  listSearch: "",
  marketMode: false,
  listLoaded: false,
  listLoading: false,
  listError: null,
  wishlist: [],
  wishlistLoaded: false,
  vehicle: null,
  fuelings: [],
  maintenances: [],
  vehicleReminders: [],
  obdSessions: [],
  vehicleTab: "summary",
  vehicleLoading: false,
  vehicleLoaded: false,
  vehicleError: null,
  userAliases: [],
  moreSection: "main",
  moreSearch: "",
  moreNoteId: null,
  notificationDismissals: new Set(),
  expandedMaintenanceId: null,
  expandedFuelingId: null,
  expandedReminderId: null,
  expandedObdId: null,
  vehicleFormOpen: {fuel:false,maintenance:false,reminder:false,obd:false}
};

const view = document.querySelector("#view");
const subtitle = document.querySelector("#page-subtitle");
const navButtons = [...document.querySelectorAll(".nav-item")];
const backdrop = document.querySelector("#sheet-backdrop");
const sheet = document.querySelector("#product-sheet");
const topActions = document.querySelector(".top-actions");

function ensureDynamicImageStyles(){
  if(document.getElementById("prisma-image-styles")) return;
  const style = document.createElement("style");
  style.id = "prisma-image-styles";
  style.textContent = `
    .product-photo,.shopping-photo,.sheet-photo,.quick-photo{display:flex;align-items:center;justify-content:center;overflow:hidden}
    .product-photo.has-image,.shopping-photo.has-image,.sheet-photo.has-image,.quick-photo.has-image{padding:0;background:rgba(255,255,255,.04)}
    .product-photo.has-image img,.shopping-photo.has-image img,.sheet-photo.has-image img,.quick-photo.has-image img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
    .quick-add{align-items:center}
    .quick-photo{width:42px;height:42px;border-radius:12px;flex:none;font-size:22px;margin-right:10px;background:rgba(255,255,255,.04)}
    .shopping-actions-top{margin-left:auto;display:flex;gap:8px;align-items:flex-start}
    .image-mini-btn{width:34px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;cursor:pointer}
    .image-mini-btn:hover{background:rgba(255,255,255,.10)}
    .sheet-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .sheet-actions .full{grid-column:1 / -1}
    .image-note{margin-top:6px;font-size:12px;opacity:.75}
    .wish-section{margin-top:4px}
    .wish-form{display:grid;gap:8px;margin-bottom:14px}
    .wish-form .search{margin:0}
    .wish-form-row{display:grid;grid-template-columns:1.4fr 1fr;gap:8px}
    .wish-select{min-height:46px;border-radius:14px;border:1px solid rgba(168,192,226,.13);background:#101a2c;color:#fff;padding:0 12px}
    .wish-list{display:grid;gap:9px}
    .wish-card{border:1px solid rgba(168,192,226,.13);border-radius:18px;padding:12px;background:linear-gradient(180deg,#131f36,#0e182a)}
    .wish-main{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .wish-name{font-size:12px;font-weight:950}
    .wish-meta,.wish-note{font-size:9px;color:#9eb0c8;margin-top:4px}
    .wish-price{font-size:15px;font-weight:950;white-space:nowrap;color:#20e0d1}
    .wish-status{margin-top:8px;font-size:9px;color:#ffca58}
    .wish-actions{display:grid;grid-template-columns:1fr 1fr auto;gap:7px;margin-top:10px}
    .wish-actions button{min-height:40px;border-radius:12px;font-size:9px;font-weight:900}
    .wish-delete{width:40px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);color:#ff6680}
    .ending-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .ending-card{border:1px solid rgba(255,255,255,.10);background:#101a2d;border-radius:16px;padding:10px;display:grid;grid-template-columns:auto 1fr;gap:9px;align-items:center}
    .ending-photo{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:rgba(122,85,255,.12);font-size:24px}
    .ending-photo.has-image{padding:0}
    .ending-photo.has-image img{width:100%;height:100%;object-fit:cover;display:block}
    .ending-name{font-size:9px;font-weight:900;line-height:1.2}
    .ending-meta{font-size:8px;color:var(--muted);margin-top:3px}
    .ending-badge{display:inline-block;margin-top:5px;padding:4px 6px;border-radius:999px;font-size:7px;font-weight:900;background:rgba(255,177,0,.10);color:#ffcb55;border:1px solid rgba(255,177,0,.20)}
    .ending-badge.urgent{background:rgba(255,91,111,.10);color:#ff788d;border-color:rgba(255,91,111,.22)}
    .ending-add{grid-column:1/-1;width:100%;min-height:34px;border-radius:10px;border:1px solid rgba(32,224,209,.20);background:rgba(32,224,209,.06);color:#20e0d1;font-size:8px;font-weight:900}
    @media (max-width:420px){.sheet-actions{grid-template-columns:1fr}.ending-grid{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);
}

ensureDynamicImageStyles();


const replenishmentStyle = document.createElement("style");
replenishmentStyle.textContent = `
  .ending-actions{grid-column:1/-1;display:grid;grid-template-columns:1fr auto;gap:8px;width:100%}
  .ending-ignore{min-height:42px;padding:0 14px;border-radius:13px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);color:#9fb0c7;font-size:9px;font-weight:800}
  .ending-ignore:hover{border-color:rgba(255,255,255,.22);color:#fff}
  @media(max-width:520px){.ending-actions{grid-template-columns:1fr}.ending-ignore{min-height:38px}}
`;
document.head.appendChild(replenishmentStyle);


const vehicleStyle = document.createElement("style");
vehicleStyle.id = "prisma-vehicle-styles";
vehicleStyle.textContent = `
  .vehicle-hero{position:relative;overflow:hidden;border:1px solid rgba(168,192,226,.14);background:linear-gradient(135deg,#111c31,#0b1424);border-radius:24px;padding:18px;margin-bottom:14px}
  .vehicle-hero:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;right:-70px;top:-85px;background:radial-gradient(circle,rgba(32,224,209,.14),transparent 65%)}
  .vehicle-title{display:flex;gap:12px;align-items:center}
  .vehicle-icon{width:52px;height:52px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-size:28px;background:linear-gradient(145deg,rgba(122,85,255,.18),rgba(32,224,209,.09));border:1px solid rgba(255,255,255,.08)}
  .vehicle-name{font-size:18px;font-weight:950}
  .vehicle-desc{font-size:10px;color:#99abc2;margin-top:3px}
  .vehicle-km{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-top:18px}
  .vehicle-km strong{font-size:28px;letter-spacing:-1px}
  .vehicle-km span{font-size:9px;color:#9db0c9}
  .vehicle-tabs{display:flex;gap:7px;overflow-x:auto;padding:1px 0 10px;scrollbar-width:none}
  .vehicle-tabs::-webkit-scrollbar{display:none}
  .vehicle-tab{white-space:nowrap;border-radius:999px;border:1px solid rgba(168,192,226,.13);background:#0e182a;color:#9fb1c8;min-height:38px;padding:0 13px;font-size:9px;font-weight:900}
  .vehicle-tab.active{color:#fff;border-color:rgba(32,224,209,.34);background:rgba(32,224,209,.09)}
  .vehicle-stat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .vehicle-stat{border:1px solid rgba(168,192,226,.12);border-radius:17px;padding:12px;background:#101a2d}
  .vehicle-stat span{display:block;color:#91a5bf;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.6px}
  .vehicle-stat strong{display:block;font-size:16px;margin-top:5px}
  .vehicle-stat small{display:block;color:#8ea1b8;font-size:8px;margin-top:3px}
  .vehicle-form{display:grid;gap:9px}
  .vehicle-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .vehicle-row.three{grid-template-columns:repeat(3,1fr)}
  .vehicle-field{display:grid;gap:5px}
  .vehicle-field label{font-size:8px;text-transform:uppercase;letter-spacing:.6px;color:#90a4bd;font-weight:900}
  .vehicle-field input,.vehicle-field select,.vehicle-field textarea{width:100%;min-height:44px;border-radius:13px;border:1px solid rgba(168,192,226,.13);background:#0d1728;color:#fff;padding:10px 11px;outline:none}
  .vehicle-field textarea{min-height:76px;resize:vertical}
  .vehicle-check{display:flex;gap:8px;align-items:center;color:#a9b9cd;font-size:10px}
  .vehicle-check input{width:18px;height:18px}
  .vehicle-list{display:grid;gap:9px}
  .vehicle-card{border:1px solid rgba(168,192,226,.12);border-radius:17px;background:linear-gradient(180deg,#111d32,#0d1728);padding:12px}
  .vehicle-card-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
  .vehicle-card-title{font-size:11px;font-weight:950}
  .vehicle-card-date{font-size:8px;color:#8fa2ba;margin-top:3px}
  .vehicle-card-value{font-size:15px;font-weight:950;color:#20e0d1;white-space:nowrap}
  .vehicle-card-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
  .vehicle-pill{font-size:8px;font-weight:850;color:#b4c2d5;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);border-radius:999px;padding:5px 7px}
  .vehicle-note{font-size:9px;line-height:1.45;color:#95a8bf;margin-top:8px}
  .vehicle-items{margin-top:9px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06);display:grid;gap:5px}
  .vehicle-item-row{display:flex;justify-content:space-between;gap:12px;font-size:9px;color:#b8c5d5}
  .vehicle-delete{margin-top:9px;min-height:34px;border-radius:11px;border:1px solid rgba(255,103,126,.14);background:rgba(255,103,126,.05);color:#ff7b8f;font-size:8px;font-weight:900}
  .vehicle-status{display:inline-flex;border-radius:999px;padding:5px 8px;font-size:8px;font-weight:950;margin-top:7px}
  .vehicle-status.ok{background:rgba(32,224,209,.09);color:#45e7da;border:1px solid rgba(32,224,209,.18)}
  .vehicle-status.soon{background:rgba(255,188,66,.08);color:#ffd066;border:1px solid rgba(255,188,66,.18)}
  .vehicle-status.late{background:rgba(255,91,111,.09);color:#ff7d91;border:1px solid rgba(255,91,111,.2)}
  .vehicle-empty{padding:20px;border-radius:17px;border:1px dashed rgba(168,192,226,.14);text-align:center;color:#8ea2ba;font-size:10px}
  .vehicle-subtle{font-size:9px;color:#879bb4;line-height:1.45}
  .vehicle-km-edit{border:0;background:transparent;color:#20e0d1;font-size:9px;font-weight:900;padding:6px 0}
  .vehicle-year-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
  .vehicle-alert-count{font-weight:950;color:#ffca58}
  .obd-number{font-size:18px;font-weight:950}
  .vehicle-wish .wish-section{margin-top:0}
  @media(max-width:520px){
    .vehicle-row,.vehicle-row.three{grid-template-columns:1fr 1fr}
    .vehicle-row.three .vehicle-field:last-child{grid-column:1/-1}
  }
`;
document.head.appendChild(vehicleStyle);


const accordionStyle = document.createElement("style");
accordionStyle.id = "prisma-accordion-styles";
accordionStyle.textContent = `
  .vehicle-card.compact{padding:0;overflow:hidden}
  .vehicle-card-toggle{width:100%;display:block;text-align:left;border:0;background:transparent;color:inherit;padding:12px;cursor:pointer}
  .vehicle-card-toggle:hover{background:rgba(255,255,255,.018)}
  .vehicle-card-toggle .vehicle-card-head{align-items:center}
  .vehicle-chevron{flex:none;width:26px;height:26px;border-radius:9px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#91a5bd;font-size:12px;transition:transform .16s ease}
  .vehicle-card.expanded .vehicle-chevron{transform:rotate(180deg);color:#20e0d1}
  .vehicle-card-details{padding:0 12px 12px;border-top:1px solid rgba(255,255,255,.055)}
  .vehicle-card-details .vehicle-card-meta{margin-top:10px}
  .vehicle-compact-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
  .vehicle-form-toggle{width:100%;min-height:44px;border-radius:14px;border:1px solid rgba(32,224,209,.18);background:rgba(32,224,209,.06);color:#41e7db;font-size:9px;font-weight:950}
  .vehicle-collapsible-form{margin-top:10px;padding:12px;border:1px solid rgba(168,192,226,.10);border-radius:16px;background:rgba(255,255,255,.018)}
  .vehicle-collapsed-hint{font-size:8px;color:#8296ae;margin-top:5px}
`;
document.head.appendChild(accordionStyle);


const moreStyle = document.createElement("style");
moreStyle.id = "prisma-more-styles";
moreStyle.textContent = `
  .more-back{border:0;background:transparent;color:#20e0d1;font-size:10px;font-weight:900;padding:4px 0 12px}
  .more-grid{display:grid;gap:9px}
  .more-card{width:100%;text-align:left;border:1px solid rgba(168,192,226,.12);background:linear-gradient(180deg,#111d32,#0d1728);border-radius:18px;padding:14px;color:#fff}
  .more-card-top{display:flex;justify-content:space-between;gap:12px;align-items:center}
  .more-card-title{font-size:11px;font-weight:950}
  .more-card-sub{font-size:9px;color:#91a5bd;margin-top:4px;line-height:1.45}
  .more-card-value{font-size:13px;font-weight:950;color:#20e0d1;white-space:nowrap}
  .more-search{width:100%;min-height:44px;border:1px solid rgba(168,192,226,.13);background:#0d1728;border-radius:14px;padding:0 13px;color:#fff;margin-bottom:10px;outline:none}
  .purchase-items{margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,.06);display:grid;gap:6px}
  .purchase-item{display:grid;grid-template-columns:1fr auto;gap:10px;font-size:9px;color:#b6c4d6}
  .purchase-item small{display:block;color:#8194ad;margin-top:2px}
  .alias-row{display:grid;grid-template-columns:1fr auto 1fr auto;gap:7px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.055);font-size:9px}
  .alias-arrow{color:#6f849e}
  .store-bar{height:7px;border-radius:999px;background:rgba(255,255,255,.055);overflow:hidden;margin-top:8px}
  .store-bar i{display:block;height:100%;background:linear-gradient(90deg,#7a55ff,#20e0d1);border-radius:999px}
  .settings-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.055)}
  .settings-row:last-child{border-bottom:0}
  .settings-row b{font-size:10px}
  .settings-row span{display:block;font-size:8px;color:#8fa3bb;margin-top:3px}
  .settings-action{border:1px solid rgba(32,224,209,.18);background:rgba(32,224,209,.07);color:#45e7da;border-radius:12px;min-height:36px;padding:0 11px;font-size:8px;font-weight:900}
  .fuel-auto-badge{display:inline-flex;padding:4px 7px;border-radius:999px;background:rgba(122,85,255,.10);border:1px solid rgba(122,85,255,.18);color:#b7a6ff;font-size:8px;font-weight:900}
`;
document.head.appendChild(moreStyle);


const finalPolishStyle = document.createElement("style");
finalPolishStyle.id = "prisma-final-polish-styles";
finalPolishStyle.textContent = `
  .products-toolbar{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:10px}
  .products-toolbar .search{margin:0;flex:1}
`;
document.head.appendChild(finalPolishStyle);


const finalFeatureStyle = document.createElement("style");
finalFeatureStyle.id = "prisma-final-feature-styles";
finalFeatureStyle.textContent = `
  .notify-btn{position:relative}
  .notify-badge{position:absolute;right:-4px;top:-5px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#ff5b6f;color:#fff;font-size:9px;font-weight:950;display:flex;align-items:center;justify-content:center;border:2px solid #091321}
  .notification-list{display:grid;gap:9px;margin-top:10px}
  .notification-card{border:1px solid rgba(168,192,226,.12);background:linear-gradient(180deg,#111d32,#0d1728);border-radius:17px;padding:12px}
  .notification-top{display:flex;gap:10px;align-items:flex-start}
  .notification-icon{width:38px;height:38px;flex:none;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(122,85,255,.12);font-size:19px}
  .notification-title{font-size:11px;font-weight:950}
  .notification-text{font-size:9px;color:#96a9c0;line-height:1.45;margin-top:3px}
  .notification-actions{display:flex;gap:7px;margin-top:10px}
  .notification-actions button{min-height:36px;border-radius:11px;font-size:8px;font-weight:900;padding:0 11px}
  .notification-open{border:1px solid rgba(32,224,209,.2);background:rgba(32,224,209,.07);color:#42e5d8}
  .notification-dismiss{border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);color:#9fb0c7}
  .fusion-box{border:1px solid rgba(122,85,255,.18);background:rgba(122,85,255,.045);border-radius:18px;padding:13px;margin-top:12px}
  .fusion-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .fusion-list{display:grid;gap:8px;margin-top:10px}
  .fusion-card{border:1px solid rgba(255,255,255,.08);background:#0d1728;border-radius:14px;padding:11px}
  .fusion-title{font-size:10px;font-weight:950}
  .fusion-meta{font-size:8px;color:#90a4bd;margin-top:4px;line-height:1.4}
  @media(max-width:520px){.fusion-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(finalFeatureStyle);

const vehicleNav = document.querySelector('[data-page="fuel"]');
if(vehicleNav){
  const icon = vehicleNav.querySelector("span");
  const label = vehicleNav.querySelector("b");
  if(icon) icon.textContent = "🚗";
  if(label) label.textContent = "Veículo";
}


const money = v => Number(v || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const num = v => Number(v || 0);

function norm(s){
  return String(s ?? "").trim().replace(/\s+/g," ");
}

function searchNorm(s){
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g," ")
    .trim()
    .replace(/\s+/g," ");
}

const SEARCH_SYNONYMS = {
  LEITE: ["LEITE","LTE","LT"],
  FRANGO: ["FRANGO","FGO"],
  KETCHUP: ["KETCHUP","CATCHUP","CATCH","KETCH"],
  REFRIGERANTE: ["REFRIGERANTE","REFRI","REF"],
  DESODORANTE: ["DESODORANTE","DESOD","DES"],
  SABONETE: ["SABONETE","SAB"],
  BATATA: ["BATATA","BAT"],
  CEBOLINHA: ["CEBOLINHA","CEB"],
  COUVE: ["COUVE"],
  ARROZ: ["ARROZ"],
  CAFE: ["CAFE"],
  PAPEL: ["PAPEL"],
  HIGIENICO: ["HIGIENICO","HIG"],
  GASOLINA: ["GASOLINA","GAS"],
  ETANOL: ["ETANOL","ETA"],
  OLEO: ["OLEO"]
};

function expandSearchToken(token){
  const t = searchNorm(token);
  for(const [canonical, variants] of Object.entries(SEARCH_SYNONYMS)){
    if(canonical === t || variants.includes(t)) return variants;
  }
  return [t];
}

function productSearchText(product){
  // Procura somente no nome real + aliases daquele produto.
  // Não usa categoria/unidade para evitar falsos positivos como "leite"
  // encontrando gasolina, shampoo etc.
  const names = [product.name];

  for(const [alias, canonical] of state.aliases.entries()){
    if(searchNorm(canonical) === searchNorm(product.name)){
      names.push(alias);
    }
  }

  return searchNorm(names.join(" "));
}

function smartMatch(product, query){
  const q = searchNorm(query);
  if(!q) return true;

  const hay = productSearchText(product);
  const hayTokens = hay.split(" ").filter(Boolean);
  const queryTokens = q.split(" ").filter(Boolean);

  return queryTokens.every(qToken=>{
    const variants = expandSearchToken(qToken);

    return variants.some(v=>{
      if(!v) return false;

      // termo inteiro ou pedaço normal do nome
      if(hay.includes(v)) return true;

      // abreviações curtas só valem quando batem com um token real
      if(v.length <= 3){
        return hayTokens.some(ht=>ht === v);
      }

      // palavras maiores aceitam começo do token
      return hayTokens.some(ht=>ht.startsWith(v) || v.startsWith(ht) && ht.length >= 4);
    });
  });
}

function canon(name){
  let n = norm(name);
  const seen = new Set();
  for(let i=0;i<10;i++){
    if(seen.has(n)) break;
    seen.add(n);
    const next = state.aliases.get(n);
    if(!next || next===n) break;
    n = norm(next);
  }
  return n;
}
function iconFor(name, unit){
  const s = String(name || "").toUpperCase();
  if (/CAFE/.test(s)) return "☕";
  if (/LEITE/.test(s)) return "🥛";
  if (/PAPEL.*HIG/.test(s)) return "🧻";
  if (/SABONETE/.test(s)) return "🧼";
  if (/ARROZ/.test(s)) return "🍚";
  if (/REFRIG|COCA|GUARANA/.test(s)) return "🥤";
  if (/GASOLINA|ETANOL|DIESEL/.test(s)) return "⛽";
  if (/MACA|BANANA|MAMAO|MANGA|UVA|LARANJA|LIMAO|ABACAXI|MELANCIA|MELAO|PERA/.test(s)) return "🍎";
  if (/FRANGO|CARNE|COXA|PEITO/.test(s)) return "🥩";
  if (/SHAMPOO|DESOD|HIDRAT/.test(s)) return "🧴";
  if (String(unit||"").toUpperCase()==="KG") return "⚖️";
  return "📦";
}
function categoryFor(name){
  const s = String(name||"").toUpperCase();
  if (/SABONETE|SHAMPOO|DESOD|PAPEL HIG|FRALDA|HIDRAT/.test(s)) return "Higiene";
  if (/REFRIG|SUCO|AGUA|CAFE|CHA/.test(s)) return "Bebidas";
  if (/GASOLINA|ETANOL|DIESEL/.test(s)) return "Combustível";
  return "Mercado";
}
function formatDate(v){
  if(!v) return "—";
  const d = new Date(v);
  if(Number.isNaN(d.getTime())) return String(v);
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

function slugifyProductName(s){
  return searchNorm(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,60) || "produto";
}

function imageUrlFor(product){
  return String(product?.imageUrl || product?.imagem_url || "").trim();
}

function photoMarkup({name, unit, icon, imageUrl}, className="product-photo"){
  const src = imageUrlFor({imageUrl});
  const fallback = icon || iconFor(name, unit);
  if(src){
    return `<div class="${className} has-image"><img src="${escapeHtml(src)}" alt="${escapeHtml(name || "Produto")}" loading="lazy"></div>`;
  }
  return `<div class="${className}">${fallback}</div>`;
}

function findProductRowByName(name){
  const key = searchNorm(name);
  return state.productRows.find(r=>searchNorm(r.nome) === key) || null;
}

async function ensureProductRow(product){
  const productName = typeof product === "string" ? product : product?.name;
  const productUnit = typeof product === "string" ? null : (product?.unit || product?.unidade || null);
  if(!productName) return null;

  const existing = findProductRowByName(productName);
  if(existing) return existing;

  const { data, error } = await supabase
    .from("produtos")
    .insert({
      user_id: state.session.user.id,
      nome: productName,
      unidade_padrao: productUnit
    })
    .select("id,user_id,nome,categoria,unidade_padrao,imagem_url,codigo_barras,monitorar_reposicao,familia_reposicao")
    .single();

  if(error) throw error;
  state.productRows.push(data);
  return data;
}

async function chooseProductImage(product, source="gallery"){
  const target = typeof product === "string" ? (productByName(product) || { name: product, unit: "" }) : product;
  if(!target?.name){
    alert("Não foi possível identificar o produto para a imagem.");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  if(source==="camera") input.setAttribute("capture","environment");

  input.addEventListener("change", async ()=>{
    const file = input.files?.[0];
    if(!file) return;
    const prepared = await prepareProductPhoto(file);
    await uploadProductImage(target, prepared);
  }, { once:true });

  input.click();
}

async function prepareProductPhoto(file){
  try{
    const bitmap = await createImageBitmap(file);
    const maxSide = 1200;
    const ratio = Math.min(maxSide/bitmap.width, maxSide/bitmap.height, 1);
    const drawW = Math.max(1,Math.round(bitmap.width*ratio));
    const drawH = Math.max(1,Math.round(bitmap.height*ratio));

    const size = Math.max(drawW,drawH);
    const canvas = document.createElement("canvas");
    canvas.width=size;
    canvas.height=size;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});

    ctx.fillStyle="#ffffff";
    ctx.fillRect(0,0,size,size);

    const x=Math.round((size-drawW)/2);
    const y=Math.round((size-drawH)/2);
    ctx.drawImage(bitmap,x,y,drawW,drawH);

    // Se os cantos da foto forem claros e parecidos, normaliza o fundo claro para branco.
    // Isso ajuda fotos tiradas contra prateleira/fundo claro sem destruir embalagens coloridas.
    const image=ctx.getImageData(0,0,size,size);
    const data=image.data;
    const samples=[
      [2,2],[size-3,2],[2,size-3],[size-3,size-3]
    ].map(([sx,sy])=>{
      const i=(sy*size+sx)*4;
      return [data[i],data[i+1],data[i+2]];
    });

    const avg=samples.reduce((a,c)=>[a[0]+c[0],a[1]+c[1],a[2]+c[2]],[0,0,0]).map(v=>v/samples.length);
    const light=(avg[0]+avg[1]+avg[2])/3>185;
    const spread=Math.max(...samples.flatMap(c=>[
      Math.abs(c[0]-avg[0]),Math.abs(c[1]-avg[1]),Math.abs(c[2]-avg[2])
    ]));

    if(light && spread<55){
      for(let i=0;i<data.length;i+=4){
        const dr=data[i]-avg[0], dg=data[i+1]-avg[1], db=data[i+2]-avg[2];
        const dist=Math.sqrt(dr*dr+dg*dg+db*db);
        const brightness=(data[i]+data[i+1]+data[i+2])/3;
        if(dist<58 && brightness>150){
          data[i]=255; data[i+1]=255; data[i+2]=255;
        }
      }
      ctx.putImageData(image,0,0);
    }

    const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",0.88));
    if(!blob) return file;

    const base=(file.name||"produto").replace(/\.[^.]+$/,"");
    return new File([blob],`${base}-prisma.jpg`,{type:"image/jpeg"});
  }catch(err){
    console.warn("prepareProductPhoto:",err);
    return file;
  }
}


async function uploadProductImage(product, file){
  if(!state.session){
    alert("Você precisa estar logado para enviar imagens.");
    return;
  }

  try{
    const row = await ensureProductRow(product);
    const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const ext = rawExt.replace(/[^a-z0-9]/g,"") || "jpg";
    const fileName = `${slugifyProductName(product.name)}-${Date.now()}.${ext}`;
    const filePath = `${state.session.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("produtos")
      .upload(filePath, file, { upsert: false, cacheControl: "3600" });

    if(uploadError) throw uploadError;

    const { data: pub } = supabase.storage.from("produtos").getPublicUrl(filePath);
    const publicUrl = pub?.publicUrl || "";

    const { data: updated, error: updateError } = await supabase
      .from("produtos")
      .update({
        imagem_url: publicUrl,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", row.id)
      .select("id,user_id,nome,categoria,unidade_padrao,imagem_url,codigo_barras,monitorar_reposicao,familia_reposicao")
      .single();

    if(updateError) throw updateError;

    const idx = state.productRows.findIndex(r=>r.id === updated.id || searchNorm(r.nome) === searchNorm(updated.nome));
    if(idx >= 0) state.productRows[idx] = updated;
    else state.productRows.push(updated);

    buildProducts();
    render();

    const refreshed = state.products.find(p=>searchNorm(p.name) === searchNorm(product.name));
    if(refreshed && !sheet.classList.contains("hidden")) openProduct(refreshed);

    alert(`Imagem atualizada para ${product.name}.`);
  }catch(err){
    console.error("uploadProductImage:", err);
    alert("Não foi possível enviar a imagem: " + (err?.message || String(err)));
  }
}



async function init(){
  if(!configured){
    render();
    return;
  }

  const { data:{ session }, error } = await supabase.auth.getSession();
  if(error){
    state.loadError = error.message;
    render();
    return;
  }

  state.session = session;

  // Evita fazer consultas ao banco diretamente dentro do callback de Auth.
  // Isso pode travar o cliente Supabase em alguns navegadores.
  supabase.auth.onAuthStateChange((event, session)=>{
    state.session = session;

    if(event === "SIGNED_OUT"){
      state.loading = false;
      state.notas = [];
      state.itens = [];
      state.products = [];
      state.productRows = [];
      state.listItems = [];
      state.activeList = null;
      state.listLoaded = false;
      state.listLoading = false;
      state.listError = null;
      state.wishlist = [];
      state.wishlistLoaded = false;
      state.vehicle = null;
      state.fuelings = [];
      state.maintenances = [];
      state.vehicleReminders = [];
      state.obdSessions = [];
      state.vehicleError = null;
      state.vehicleLoaded = false;
      state.userAliases = [];
      state.moreSection = "main";
      state.moreSearch = "";
      state.moreNoteId = null;
      state.notificationDismissals = new Set();
      render();
      return;
    }

    if(event === "SIGNED_IN"){
      setTimeout(()=>loadData(), 0);
    }
  });

  if(session) await loadData();
  else render();
}
async function loadData(){
  if(state.loading) return;

  state.loading = true;
  state.loadError = null;
  render();

  try{
    const [notesRes, itemsRes, aliasRes, userAliasRes, productsRes, wishlistRes, notificationRes] = await Promise.all([
      supabase.from("notas")
        .select("id,chave,nome_estabelecimento,cnpj,data_emissao,valor_total")
        .order("data_emissao",{ascending:false}),
      supabase.from("itens")
        .select("id,nota_id,produto,quantidade,unidade,preco_unitario,valor_total"),
      supabase.from("produtos_alias")
        .select("alias,produto_canonico"),
      supabase.from("produto_alias_usuario")
        .select("id,user_id,alias,produto_canonico,tipo,grupo_id,criado_em")
        .order("criado_em",{ascending:false}),
      supabase.from("produtos")
        .select("id,user_id,nome,categoria,unidade_padrao,imagem_url,codigo_barras,monitorar_reposicao,familia_reposicao"),
      supabase.from("lista_desejos")
        .select("id,user_id,nome,valor_previsto,categoria,prioridade,observacao,status,criado_em,comprado_em")
        .order("criado_em",{ascending:false}),
      supabase.from("notificacoes_dispensadas")
        .select("chave")
    ]);

    const err = notesRes.error || itemsRes.error || aliasRes.error || userAliasRes.error || productsRes.error || wishlistRes.error || notificationRes.error;
    if(err) throw err;

    state.notas = notesRes.data || [];
    state.itens = itemsRes.data || [];
    state.userAliases = userAliasRes.data || [];
    state.aliases = new Map((aliasRes.data || []).map(x=>[norm(x.alias), norm(x.produto_canonico)]));
    for(const x of state.userAliases){
      state.aliases.set(norm(x.alias), norm(x.produto_canonico));
    }
    state.productRows = productsRes.data || [];
    state.wishlist = wishlistRes.data || [];
    state.wishlistLoaded = true;
    state.notificationDismissals = new Set((notificationRes.data || []).map(x=>String(x.chave)));
    buildProducts();

    // Lista e Veículo são pré-carregados em segundo plano.
    // Assim a Home aparece logo e, depois, trocar de aba fica praticamente instantâneo.
    queueBackgroundPreload();

  }catch(err){
    console.error("Prisma loadData:", err);
    state.loadError = err?.message || String(err);
  }finally{
    state.loading = false;
    render();
  }
}



let backgroundPreloadPromise=null;

function queueBackgroundPreload(){
  if(backgroundPreloadPromise || !state.session) return;

  backgroundPreloadPromise=(async()=>{
    const jobs=[];

    if(!state.listLoaded && !state.listLoading){
      jobs.push((async()=>{
        state.listLoading=true;
        try{
          const err=await loadShoppingList();
          if(err) throw new Error(err);
          state.listLoaded=true;
          state.listError=null;
        }catch(err){
          console.error("Prisma preload Lista:",err);
          state.listError=err?.message||String(err);
        }finally{
          state.listLoading=false;
          if(state.page==="list") render();
        }
      })());
    }

    if(!state.vehicleLoaded && !state.vehicleLoading){
      jobs.push((async()=>{
        try{
          await loadVehicleData();
          state.vehicleLoaded=true;
        }catch(err){
          console.error("Prisma preload Veículo:",err);
          state.vehicleError=err?.message||String(err);
        }finally{
          if(state.page==="fuel") render();
        }
      })());
    }

    await Promise.allSettled(jobs);
  })().finally(()=>{backgroundPreloadPromise=null;});
}

function withTimeout(promise, ms, label){
  let timer;
  const timeout = new Promise((_, reject)=>{
    timer = setTimeout(()=>reject(new Error(label + " demorou mais de " + Math.round(ms/1000) + " segundos.")), ms);
  });
  return Promise.race([promise, timeout]).finally(()=>clearTimeout(timer));
}

async function openListPage(){
  state.page="list";
  state.listError=null;

  // Se já temos a lista em memória, abre imediatamente.
  if(state.listLoaded || state.activeList){
    render();
    if(!state.listLoaded) queueBackgroundPreload();
    return;
  }

  // Se o preload já está em andamento, não dispara outra consulta.
  if(state.listLoading){
    render();
    return;
  }

  state.listLoading=true;
  render();

  try{
    const err=await withTimeout(loadShoppingList(),12000,"A leitura da Lista no Supabase");
    if(err) throw new Error(err);
    state.listLoaded=true;
  }catch(e){
    console.error("Prisma Lista:",e);
    state.listError=e?.message||String(e);
  }finally{
    state.listLoading=false;
    render();
  }
}

async function loadShoppingList(){
  if(!state.session) return null;

  let { data: lists, error } = await supabase
    .from("listas")
    .select("id,user_id,nome,ativa,criado_em")
    .eq("ativa", true)
    .order("criado_em",{ascending:true})
    .limit(1);

  if(error) return error.message;

  if(!lists || !lists.length){
    const { data: created, error: createError } = await supabase
      .from("listas")
      .insert({
        user_id: state.session.user.id,
        nome: "Lista principal",
        ativa: true
      })
      .select("id,user_id,nome,ativa,criado_em")
      .single();

    if(createError) return createError.message;
    state.activeList = created;
  } else {
    state.activeList = lists[0];
  }

  const { data: items, error: itemError } = await supabase
    .from("lista_itens")
    .select("id,lista_id,produto,unidade,quantidade,peso_kg,preco_previsto,preco_atual,no_carrinho,criado_em")
    .eq("lista_id", state.activeList.id)
    .order("criado_em",{ascending:true});

  if(itemError) return itemError.message;
  state.listItems = items || [];
  return null;
}

function productByName(name){
  const n = norm(name).toLocaleLowerCase("pt-BR");
  return state.products.find(p=>norm(p.name).toLocaleLowerCase("pt-BR")===n);
}

function isKg(unit){
  return String(unit || "").trim().toUpperCase() === "KG";
}

function itemEffectiveQty(item){
  return isKg(item.unidade) ? num(item.peso_kg) : num(item.quantidade || 1);
}

function itemEffectivePrice(item){
  const current = num(item.preco_atual);
  return current > 0 ? current : num(item.preco_previsto);
}

function itemTotal(item){
  return itemEffectiveQty(item) * itemEffectivePrice(item);
}

async function addProductToList(product){
  if(!state.activeList){
    const err = await loadShoppingList();
    if(err){
      alert("Não foi possível preparar a Lista: " + err);
      return;
    }
    state.listLoaded = true;
  }

  const existing = state.listItems.find(i=>norm(i.produto).toLowerCase()===norm(product.name).toLowerCase());
  if(existing){
    if(!isKg(existing.unidade)){
      await updateListItem(existing.id,{quantidade:num(existing.quantidade||1)+1},false);
    }
    state.page="list";
    render();
    closeProduct();
    return;
  }

  const payload = {
    lista_id: state.activeList.id,
    produto: product.name,
    unidade: product.unit || null,
    quantidade: 1,
    peso_kg: isKg(product.unit) ? null : null,
    preco_previsto: product.price || null,
    preco_atual: null,
    no_carrinho: false
  };

  const { data: inserted, error } = await supabase
    .from("lista_itens")
    .insert(payload)
    .select("id,lista_id,produto,unidade,quantidade,peso_kg,preco_previsto,preco_atual,no_carrinho,criado_em")
    .single();

  if(error){
    alert("Não foi possível adicionar: " + error.message);
    return;
  }

  if(inserted) state.listItems.push(inserted);
  state.listLoaded=true;
  state.page="list";
  render();
  closeProduct();
}

async function updateListItem(id, changes, refresh=true){
  const { error } = await supabase.from("lista_itens").update(changes).eq("id",id);
  if(error){
    alert("Erro ao salvar: " + error.message);
    return false;
  }
  const local = state.listItems.find(i=>i.id===id);
  if(local) Object.assign(local,changes);
  if(refresh) render();
  return true;
}

async function deleteListItem(id){
  const { error } = await supabase.from("lista_itens").delete().eq("id",id);
  if(error){
    alert("Erro ao remover: " + error.message);
    return;
  }
  state.listItems = state.listItems.filter(i=>i.id!==id);
  render();
}



async function addWishlistItem({name, value=null, category=null, priority="Normal", note=""}){
  if(!name || !norm(name)) return;
  const { data, error } = await supabase
    .from("lista_desejos")
    .insert({
      user_id: state.session.user.id,
      nome: norm(name),
      valor_previsto: value && Number(value)>0 ? Number(value) : null,
      categoria: category || null,
      prioridade: priority || "Normal",
      observacao: note || null,
      status: "desejado"
    })
    .select("id,user_id,nome,valor_previsto,categoria,prioridade,observacao,status,criado_em,comprado_em")
    .single();
  if(error){ alert("Não foi possível adicionar à lista de desejos: " + error.message); return; }
  state.wishlist.unshift(data);
  render();
}

async function addProductToWishlist(product){
  const exists = state.wishlist.some(w=>w.status!=="comprado" && searchNorm(w.nome)===searchNorm(product.name));
  if(exists){ alert("Esse produto já está na lista de desejos."); return; }
  await addWishlistItem({
    name: product.name,
    value: product.price || null,
    category: product.category || null,
    priority: "Normal"
  });
  closeProduct();
}

async function updateWishlistItem(id, changes){
  const payload={...changes};
  if(changes.status==="comprado") payload.comprado_em = new Date().toISOString();
  if(changes.status!==undefined && changes.status!=="comprado") payload.comprado_em = null;
  const { data,error } = await supabase
    .from("lista_desejos")
    .update(payload)
    .eq("id",id)
    .select("id,user_id,nome,valor_previsto,categoria,prioridade,observacao,status,criado_em,comprado_em")
    .single();
  if(error){alert("Erro ao atualizar desejo: "+error.message);return;}
  const i=state.wishlist.findIndex(x=>x.id===id);
  if(i>=0) state.wishlist[i]=data;
  render();
}

async function deleteWishlistItem(id){
  const { error } = await supabase.from("lista_desejos").delete().eq("id",id);
  if(error){alert("Erro ao remover desejo: "+error.message);return;}
  state.wishlist=state.wishlist.filter(x=>x.id!==id);
  render();
}

function wishlistCard(item){
  const waiting=item.status==="aguardando_nota";
  const value=item.valor_previsto ? money(item.valor_previsto) : "Sem valor previsto";
  return `<article class="wish-card">
    <div class="wish-main">
      <div><div class="wish-name">${escapeHtml(item.nome)}</div><div class="wish-meta">${escapeHtml(item.categoria||"Sem categoria")} • ${escapeHtml(item.prioridade||"Normal")}</div></div>
      <div class="wish-price">${value}</div>
    </div>
    ${item.observacao?`<div class="wish-note">${escapeHtml(item.observacao)}</div>`:""}
    ${waiting?`<div class="wish-status">🧾 Comprado • aguardando nota/XML</div>`:""}
    <div class="wish-actions">
      ${waiting?`<button class="secondary" data-wish-status="desejado" data-wish-id="${item.id}">↩ Voltar</button>`:`<button class="secondary" data-wish-status="aguardando_nota" data-wish-id="${item.id}">🧾 Aguardando nota</button>`}
      <button class="primary" data-wish-status="comprado" data-wish-id="${item.id}">✓ Comprado</button>
      <button class="wish-delete" data-wish-delete="${item.id}">×</button>
    </div>
  </article>`;
}

function wishlistSection(){
  const active=state.wishlist.filter(x=>x.status!=="comprado");
  const total=active.reduce((s,x)=>s+num(x.valor_previsto),0);
  return `<section class="section wish-section">
    <div class="section-head"><div class="section-title">❤️ Comprar depois</div><div class="section-note">${active.length} itens • ${money(total)} previstos</div></div>
    <form id="wish-form" class="wish-form">
      <input id="wish-name" class="search" placeholder="Ex.: Limpador de para-brisa" required>
      <div class="wish-form-row">
        <input id="wish-value" class="search" inputmode="decimal" placeholder="Valor previsto">
        <select id="wish-priority" class="wish-select"><option>Normal</option><option>Alta</option><option>Baixa</option></select>
      </div>
      <input id="wish-category" class="search" placeholder="Categoria (ex.: Carro, Casa)">
      <input id="wish-note" class="search" placeholder="Observação (opcional)">
      <button class="primary" style="width:100%" type="submit">＋ Adicionar à lista de desejos</button>
    </form>
    <div class="wish-list">${active.length?active.map(wishlistCard).join(""):`<div class="empty-list"><div class="empty-list-icon">❤️</div><b>Nada para comprar depois</b><span>Adicione algo que não quer esquecer.</span></div>`}</div>
  </section>`;
}

function buildProducts(){
  const noteById = new Map(state.notas.map(n=>[n.id,n]));
  const groups = new Map();
  const libraryByName = new Map((state.productRows || []).map(r=>[searchNorm(r.nome), r]));

  for(const item of state.itens){
    const canonical = canon(item.produto);
    const note = noteById.get(item.nota_id);
    const price = num(item.preco_unitario);
    if(!canonical || !(price>0)) continue;

    if(!groups.has(canonical)) groups.set(canonical,[]);
    groups.get(canonical).push({
      ...item,
      canonical,
      date: note?.data_emissao || null,
      store: note?.nome_estabelecimento || "—"
    });
  }

  const built = [...groups.entries()].map(([name, rows], idx)=>{
    rows.sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
    const prices = rows.map(r=>num(r.preco_unitario)).filter(v=>v>0);
    const latest = rows[rows.length-1];
    const previous = rows.length>1 ? rows[rows.length-2] : null;
    const last = num(latest.preco_unitario);
    const prev = previous ? num(previous.preco_unitario) : last;
    const delta = prev>0 ? ((last-prev)/prev)*100 : 0;
    const avg = prices.length ? prices.reduce((a,b)=>a+b,0)/prices.length : 0;
    const directLibrary = libraryByName.get(searchNorm(name));
    const mappedLibraries = (state.productRows || []).filter(r=>canon(r.nome)===name);
    const library = directLibrary || mappedLibraries.find(r=>r.imagem_url) || mappedLibraries.find(r=>r.categoria) || mappedLibraries[0] || null;
    const finalUnit = latest.unidade || library?.unidade_padrao || "";

    return {
      id: library?.id || String(idx+1),
      libraryId: library?.id || null,
      icon: iconFor(name, finalUnit),
      imageUrl: library?.imagem_url || "",
      barcode: library?.codigo_barras || "",
      family: library?.familia_reposicao || automaticFamily(name),
      monitorReplenishment: library?.monitorar_reposicao !== false,
      name,
      price:last,
      delta,
      avg,
      min:prices.length ? Math.min(...prices) : 0,
      max:prices.length ? Math.max(...prices) : 0,
      category:library?.categoria || categoryFor(name),
      categoryManual:Boolean(library?.categoria),
      unit:finalUnit,
      latestDate:latest.date,
      latestStore:latest.store,
      history:rows
    };
  });

  for(const row of (state.productRows || [])){
    if(canon(row.nome) !== norm(row.nome)) continue;
    const exists = built.some(p=>searchNorm(p.name) === searchNorm(row.nome));
    if(exists) continue;
    built.push({
      id: row.id,
      libraryId: row.id,
      icon: iconFor(row.nome, row.unidade_padrao),
      imageUrl: row.imagem_url || "",
      barcode: row.codigo_barras || "",
      family: row.familia_reposicao || automaticFamily(row.nome),
      monitorReplenishment: row.monitorar_reposicao !== false,
      name: row.nome,
      price: 0,
      delta: 0,
      avg: 0,
      min: 0,
      max: 0,
      category: row.categoria || categoryFor(row.nome),
      categoryManual:Boolean(row.categoria),
      unit: row.unidade_padrao || "",
      latestDate: null,
      latestStore: "—",
      history: []
    });
  }

  state.products = built.sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
}

async function login(email,password){
  const { error } = await supabase.auth.signInWithPassword({email,password});
  return error;
}
async function logout(){
  await supabase.auth.signOut();
}

function render(){
  if(!configured){
    navButtons.forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
    view.innerHTML = setupScreen();
    bindView();
    return;
  }
  if(!state.session){
    navButtons.forEach(b=>b.classList.remove("active"));
    view.innerHTML = loginScreen();
    bindView();
    return;
  }

  navButtons.forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));

  if(state.loading){
    view.innerHTML = `<div class="loading">Carregando seus dados do Supabase…</div>`;
    return;
  }

  if(state.loadError){
    view.innerHTML = `<div class="setup-banner">Erro ao carregar dados: ${escapeHtml(state.loadError)}</div>`;
    return;
  }

  view.innerHTML = ({home, list:shoppingList, products, fuel, more})[state.page]();
  updateTopUser();
  bindView();
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}


function notificationItems(){
  const out=[];

  for(const x of endingCandidates().filter(x=>x.estimate.urgent)){
    const latest=x.product.latestDate || "sem-data";
    out.push({
      key:`repo:${searchNorm(x.estimate.family)}:${latest}`,
      icon:"📦",
      title:`${x.estimate.family} pode estar acabando`,
      text:`Última compra há ${x.estimate.daysSince} dias; ciclo estimado em ${x.estimate.expectedDays} dias.`,
      page:"home"
    });
  }

  for(const item of state.vehicleReminders){
    const r=reminderState(item);
    if(r.status==="Em dia") continue;
    const due=r.dueDate ? r.dueDate.toISOString().slice(0,10) : (r.dueKm||"");
    out.push({
      key:`vehicle-reminder:${item.id}:${r.status}:${due}`,
      icon:"🔧",
      title:`${item.titulo}: ${r.status}`,
      text:[r.dueDate?`data prevista ${formatDate(r.dueDate)}`:null,r.dueKm?`${Math.round(r.dueKm).toLocaleString("pt-BR")} km`:null].filter(Boolean).join(" • "),
      page:"fuel",
      vehicleTab:"reminders"
    });
  }

  for(const item of state.fuelings.filter(x=>x.origem_automatica && !num(x.odometro))){
    out.push({
      key:`fuel-km:${item.id}`,
      icon:"⛽",
      title:"Abastecimento com km pendente",
      text:`${formatDate(item.data)}${item.estabelecimento?` • ${item.estabelecimento}`:""} — complete o odômetro para entrar no cálculo de consumo.`,
      page:"fuel",
      vehicleTab:"fuel"
    });
  }

  for(const item of state.wishlist.filter(x=>x.status==="aguardando_nota")){
    out.push({
      key:`wish-note:${item.id}`,
      icon:"🧾",
      title:"Compra aguardando nota",
      text:`${item.nome} foi marcado como comprado, mas a nota/XML ainda está pendente.`,
      page:"more"
    });
  }

  return out.filter(x=>!state.notificationDismissals.has(x.key));
}

async function dismissNotification(key){
  state.notificationDismissals.add(String(key));
  render();
  const {error}=await supabase.from("notificacoes_dispensadas").upsert({
    user_id:state.session.user.id,
    chave:String(key),
    dispensado_em:new Date().toISOString()
  },{onConflict:"user_id,chave"});
  if(error) console.error("dismissNotification:",error);
}

function openNotifications(){
  const items=notificationItems();
  backdrop.classList.remove("hidden");
  sheet.classList.remove("hidden");
  sheet.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      <div class="sheet-photo">🔔</div>
      <div><div class="sheet-title">Avisos do Prisma</div><div class="image-note">${items.length?`${items.length} aviso(s) precisam da sua atenção.`:"Nenhum aviso pendente."}</div></div>
      <button class="sheet-close" data-close>✕</button>
    </div>
    <div class="notification-list">
      ${items.length?items.map((n,i)=>`<article class="notification-card">
        <div class="notification-top"><div class="notification-icon">${n.icon}</div><div><div class="notification-title">${escapeHtml(n.title)}</div><div class="notification-text">${escapeHtml(n.text)}</div></div></div>
        <div class="notification-actions"><button class="notification-open" data-notify-open="${i}">Abrir</button><button class="notification-dismiss" data-notify-dismiss="${i}">Dispensar</button></div>
      </article>`).join(""):`<div class="vehicle-empty">Tudo certo por aqui. O sininho volta a mostrar número quando surgir algo que precise de atenção.</div>`}
    </div>`;

  sheet.querySelector("[data-close]")?.addEventListener("click",closeProduct);
  sheet.querySelectorAll("[data-notify-dismiss]").forEach(btn=>btn.addEventListener("click",async()=>{
    const n=items[Number(btn.dataset.notifyDismiss)];
    if(n) await dismissNotification(n.key);
    openNotifications();
  }));
  sheet.querySelectorAll("[data-notify-open]").forEach(btn=>btn.addEventListener("click",()=>{
    const n=items[Number(btn.dataset.notifyOpen)];
    if(!n) return;
    closeProduct();
    state.page=n.page;
    if(n.vehicleTab) state.vehicleTab=n.vehicleTab;
    if(n.page==="more") state.moreSection="main";
    render();
  }));
}

function updateTopUser(){
  if(!state.session) return;
  const email=state.session.user?.email || "";
  const notifications=notificationItems();
  topActions.innerHTML = `
    <div class="user-pill">● dados reais <button class="logout-btn" id="logout">sair</button></div>
    <button class="icon-btn notify-btn" id="notifications-button" aria-label="Notificações">🔔${notifications.length?`<span class="notify-badge">${notifications.length>99?"99+":notifications.length}</span>`:""}</button>`;
  document.querySelector("#logout")?.addEventListener("click",logout);
  document.querySelector("#notifications-button")?.addEventListener("click",openNotifications);
}
function setupScreen(){
  subtitle.textContent="Configuração inicial";
  return `
  <div class="auth-screen"><div class="auth-card">
    <div class="auth-logo">🧾</div>
    <h2>Conectar ao Supabase</h2>
    <p>Esta versão já está pronta para usar seus produtos reais. Falta apenas preencher o arquivo <b>config.js</b> com a URL e a chave ANON/PUBLISHABLE do projeto.</p>
    <div class="setup-banner">Nunca coloque a <b>service_role</b> no front-end. Use somente a chave pública ANON/PUBLISHABLE.</div>
  </div></div>`;
}
function loginScreen(){
  subtitle.textContent="Acesso aos seus dados";
  return `
  <div class="auth-screen"><form class="auth-card" id="login-form">
    <div class="auth-logo">🧾</div>
    <h2>Entrar no Prisma</h2>
    <p>Seus dados pessoais de compras ficam protegidos pelo login do Supabase.</p>
    <div class="auth-field"><label>E-mail</label><input id="login-email" type="email" autocomplete="email" required></div>
    <div class="auth-field"><label>Senha</label><input id="login-password" type="password" autocomplete="current-password" required></div>
    <button class="primary" style="width:100%" type="submit">Entrar</button>
    <div class="auth-msg" id="auth-msg"></div>
  </form></div>`;
}

function chartHTML(points=[590,720,660,790,842.9], labels=["Mai","Jun","Jul","Ago","Set"]){
  const w=720,h=122,pad=8;
  const vals=points.map(Number).filter(Number.isFinite);
  const min=Math.min(...vals), max=Math.max(...vals);
  const range=(max-min)||1;
  const coords=points.map((v,i)=>{
    const x=pad + i*((w-pad*2)/(points.length-1||1));
    const y=100 - ((v-min)/range)*70;
    return [x,y];
  });
  const path=coords.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");
  const fill=path+` L ${coords.at(-1)[0]},122 L ${coords[0][0]},122 Z`;
  return `<div class="chart"><svg viewBox="0 0 720 122" preserveAspectRatio="none">
    <defs><linearGradient id="lineGrad" x1="0" x2="1"><stop offset="0" stop-color="#7a55ff"/><stop offset="1" stop-color="#20e0d1"/></linearGradient>
    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a55ff" stop-opacity=".50"/><stop offset="1" stop-color="#7a55ff" stop-opacity=".03"/></linearGradient></defs>
    <g class="chart-grid"><line x1="0" y1="28" x2="720" y2="28"/><line x1="0" y1="64" x2="720" y2="64"/><line x1="0" y1="100" x2="720" y2="100"/></g>
    <path class="chart-fill" d="${fill}"/><path class="chart-path" d="${path}"/>
    ${coords.map(p=>`<circle class="chart-dot" cx="${p[0]}" cy="${p[1]}" r="5"/>`).join("")}
  </svg><div class="chart-labels">${labels.map(x=>`<span>${x}</span>`).join("")}</div></div>`;
}

function median(values){
  const v = values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!v.length) return 0;
  const mid = Math.floor(v.length/2);
  return v.length%2 ? v[mid] : (v[mid-1]+v[mid])/2;
}

function daysBetween(a,b){
  const da = new Date(a), db = new Date(b);
  if(Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return 0;
  return Math.max(0,(db-da)/(1000*60*60*24));
}


function automaticFamily(name){
  const s = searchNorm(name);

  if(/\bOVO(S)?\b/.test(s) || /\bOVO\b/.test(s)) return "OVOS";
  if(/\bLEITE\b|\bLTE\b/.test(s)) return "LEITE";
  if(/\bSABONETE\b/.test(s)) return "SABONETE";
  if(/\bPAPEL\b.*\bHIG/.test(s)) return "PAPEL HIGIÊNICO";
  if(/\bREFRIG|\bCOCA\b|\bGUARANA\b/.test(s)) return "REFRIGERANTE";
  if(/\bARROZ\b/.test(s)) return "ARROZ";
  if(/\bCAFE\b/.test(s)) return "CAFÉ";
  if(/\bFRANGO\b|\bFGO\b|\bCOXA\b.*\bFRANGO\b/.test(s)) return "FRANGO";

  return norm(name);
}

function replenishmentFamily(product){
  return norm(product.family || automaticFamily(product.name));
}

function packageFactorForFamily(product){
  const family = replenishmentFamily(product);
  const s = searchNorm(product.name);

  // Para ovos, C/20 e C/30 representam quantidades diferentes do mesmo consumo.
  if(family === "OVOS"){
    const m = s.match(/\bC\s*(\d{1,3})\b/) || s.match(/\bC\/?\s*(\d{1,3})\b/);
    if(m) return Math.max(1, Number(m[1]) || 1);

    const m2 = s.match(/\b(\d{2})\s*OVOS?\b/);
    if(m2) return Math.max(1, Number(m2[1]) || 1);
  }

  return 1;
}

function familyEvents(familyName){
  const rows = [];
  for(const p of state.products){
    if(replenishmentFamily(p) !== familyName) continue;
    const factor = packageFactorForFamily(p);

    for(const row of (p.history || [])){
      rows.push({
        date: row.date,
        qty: Math.max(0.01, num(row.quantidade) || 1) * factor
      });
    }
  }

  const byDay = new Map();
  for(const row of rows){
    const d = new Date(row.date || 0);
    if(Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0,10);
    if(!byDay.has(key)) byDay.set(key,{date:key,qty:0});
    byDay.get(key).qty += row.qty;
  }

  return [...byDay.values()].sort((a,b)=>new Date(a.date)-new Date(b.date));
}

function familyRepresentative(familyName){
  const members = state.products.filter(p=>replenishmentFamily(p)===familyName);
  if(!members.length) return null;

  return [...members].sort((a,b)=>{
    const da = new Date(a.latestDate || 0).getTime();
    const db = new Date(b.latestDate || 0).getTime();
    return db-da;
  })[0];
}

function familyMonitoringEnabled(familyName){
  const members = state.products.filter(p=>replenishmentFamily(p)===familyName);
  if(!members.length) return true;
  // Se qualquer cadastro da família foi explicitamente desativado, a família sai das previsões.
  return !members.some(p=>p.monitorReplenishment === false);
}

async function setFamilyMonitoring(product, enabled){
  const family = replenishmentFamily(product);
  const members = state.products.filter(p=>replenishmentFamily(p)===family);

  try{
    for(const member of members){
      const row = await ensureProductRow(member);
      const { data, error } = await supabase
        .from("produtos")
        .update({
          monitorar_reposicao: enabled,
          familia_reposicao: family,
          atualizado_em: new Date().toISOString()
        })
        .eq("id", row.id)
        .select("id,user_id,nome,categoria,unidade_padrao,imagem_url,codigo_barras,monitorar_reposicao,familia_reposicao")
        .single();

      if(error) throw error;

      const idx = state.productRows.findIndex(r=>r.id===data.id);
      if(idx>=0) state.productRows[idx]=data;
      else state.productRows.push(data);
    }

    buildProducts();
    render();

    const refreshed = state.products.find(p=>searchNorm(p.name)===searchNorm(product.name));
    if(refreshed && !sheet.classList.contains("hidden")) openProduct(refreshed);
  }catch(err){
    console.error("setFamilyMonitoring:", err);
    alert("Não foi possível salvar essa preferência: " + (err?.message || String(err)));
  }
}


async function changeProductCategory(product){
  const current = product.category || categoryFor(product.name);
  const typed = prompt(
    "Categoria do produto.\n\nDigite uma categoria, por exemplo:\nMercado, Higiene, Bebidas, Combustível.\n\nDeixe vazio para voltar à categoria automática.",
    product.categoryManual ? current : ""
  );

  if(typed === null) return;

  const manual = norm(typed);
  const categoryValue = manual || null;

  try{
    const row = await ensureProductRow(product);

    const { data, error } = await supabase
      .from("produtos")
      .update({
        categoria: categoryValue,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", row.id)
      .select("id,user_id,nome,categoria,unidade_padrao,imagem_url,codigo_barras,monitorar_reposicao,familia_reposicao")
      .single();

    if(error) throw error;

    const idx = state.productRows.findIndex(r=>r.id===data.id);
    if(idx>=0) state.productRows[idx]=data;
    else state.productRows.push(data);

    buildProducts();
    render();

    const refreshed = state.products.find(p=>searchNorm(p.name)===searchNorm(product.name));
    if(refreshed && !sheet.classList.contains("hidden")) openProduct(refreshed);
  }catch(err){
    console.error("changeProductCategory:", err);
    alert("Não foi possível alterar a categoria: " + (err?.message || String(err)));
  }
}

async function changeReplenishmentFamily(product){
  const current = replenishmentFamily(product);
  const typed = prompt(
    "Família de reposição.\nProdutos da mesma família contam como o mesmo consumo.\nEx.: OVO C/20 e OVO C/30 → OVOS",
    current
  );
  if(typed === null) return;

  const family = norm(typed);
  if(!family) return;

  try{
    const row = await ensureProductRow(product);
    const { data, error } = await supabase
      .from("produtos")
      .update({
        familia_reposicao: family,
        atualizado_em: new Date().toISOString()
      })
      .eq("id", row.id)
      .select("id,user_id,nome,categoria,unidade_padrao,imagem_url,codigo_barras,monitorar_reposicao,familia_reposicao")
      .single();

    if(error) throw error;

    const idx = state.productRows.findIndex(r=>r.id===data.id);
    if(idx>=0) state.productRows[idx]=data;
    else state.productRows.push(data);

    buildProducts();
    render();
    const refreshed = state.products.find(p=>searchNorm(p.name)===searchNorm(product.name));
    if(refreshed && !sheet.classList.contains("hidden")) openProduct(refreshed);
  }catch(err){
    console.error("changeReplenishmentFamily:", err);
    alert("Não foi possível alterar a família: " + (err?.message || String(err)));
  }
}

function recurringEstimate(product){
  if(product.category === "Combustível") return null;

  const family = replenishmentFamily(product);
  if(!familyMonitoringEnabled(family)) return null;

  const events = familyEvents(family);
  if(events.length < 2) return null;

  const samples = [];
  for(let i=1;i<events.length;i++){
    const gap = daysBetween(events[i-1].date, events[i].date);
    if(gap < 3 || gap > 240) continue;

    // A quantidade anterior ajuda a diferenciar, por exemplo,
    // bandeja de 20 ovos de bandeja de 30 ovos.
    samples.push(gap / Math.max(0.01, events[i-1].qty || 1));
  }
  if(!samples.length) return null;

  const daysPerUnit = median(samples);
  const latest = events.at(-1);
  const expectedDays = Math.max(3, daysPerUnit * Math.max(0.01, latest.qty || 1));
  const today = new Date().toISOString().slice(0,10);
  const daysSince = daysBetween(latest.date,today);
  const ratio = daysSince / expectedDays;

  if(ratio < 0.75) return null;

  return {
    family,
    daysSince: Math.round(daysSince),
    expectedDays: Math.round(expectedDays),
    ratio,
    status: ratio >= 1.05 ? "Pode estar acabando" : "Fique de olho",
    urgent: ratio >= 1.05
  };
}

function endingCandidates(){
  const families = new Map();

  for(const p of state.products){
    const family = replenishmentFamily(p);
    if(families.has(family)) continue;

    const representative = familyRepresentative(family);
    if(!representative) continue;

    const estimate = recurringEstimate(representative);
    if(estimate) families.set(family,{product:representative,estimate});
  }

  return [...families.values()]
    .sort((a,b)=>b.estimate.ratio-a.estimate.ratio)
    .slice(0,4);
}

function endingCard({product:p,estimate:e}){
  return `<article class="ending-card">
    ${photoMarkup(p,"ending-photo")}
    <div>
      <div class="ending-name">${escapeHtml(e.family.toUpperCase())}</div>
      <div class="ending-meta">última compra há ${e.daysSince} dias • ciclo ~${e.expectedDays} dias</div>
      <span class="ending-badge ${e.urgent?"urgent":""}">${e.status}</span>
    </div>
    <div class="ending-actions">
      <button class="ending-add" data-add-list="${p.id}">＋ Adicionar à lista</button>
      <button class="ending-ignore" data-ignore-replenishment="${p.id}">Não preciso acompanhar</button>
    </div>
  </article>`;
}


function availableMonths(){
  const months = new Set();
  for(const n of state.notas){
    const d = new Date(n.data_emissao || 0);
    if(Number.isNaN(d.getTime())) continue;
    months.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  }
  const current = new Date().toISOString().slice(0,7);
  months.add(current);
  return [...months].sort().reverse();
}

function monthLabel(key){
  const [y,m] = String(key).split("-").map(Number);
  if(!y || !m) return key;
  const label = new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"})
    .format(new Date(y,m-1,1));
  return label.charAt(0).toUpperCase()+label.slice(1);
}

function noteMonthKey(note){
  const d = new Date(note?.data_emissao || 0);
  if(Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function previousMonthKey(key){
  const [y,m]=String(key).split("-").map(Number);
  const d=new Date(y,m-2,1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function monthSelectorHTML(id="month-selector"){
  return `<select id="${id}" class="month-selector">
    ${availableMonths().map(m=>`<option value="${m}" ${m===state.selectedMonth?"selected":""}>${escapeHtml(monthLabel(m))}</option>`).join("")}
  </select>`;
}

function home(){
  subtitle.textContent="Seu assistente de compras";

  const selected = state.selectedMonth || new Date().toISOString().slice(0,7);
  const selectedNotes = state.notas.filter(n=>noteMonthKey(n)===selected);
  const totalMonth = selectedNotes.reduce((s,n)=>s+num(n.valor_total),0);

  const prevKey = previousMonthKey(selected);
  const prevTotal = state.notas
    .filter(n=>noteMonthKey(n)===prevKey)
    .reduce((s,n)=>s+num(n.valor_total),0);

  const monthDelta = prevTotal>0 ? ((totalMonth-prevTotal)/prevTotal)*100 : null;
  const recent = selectedNotes.slice(0,4);

  const movements=[...state.products]
    .filter(p=>Math.abs(p.delta)>=0.01)
    .sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta))
    .slice(0,2);

  const ending = endingCandidates();

  const byMonth=new Map();
  state.notas.forEach(n=>{
    const d=new Date(n.data_emissao||0);
    if(Number.isNaN(d.getTime())) return;
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    byMonth.set(key,(byMonth.get(key)||0)+num(n.valor_total));
  });

  const monthEntries=[...byMonth.entries()].sort().slice(-5);
  const monthVals=monthEntries.map(x=>x[1]);
  const monthLabels=monthEntries.map(([k])=>{
    const [y,m]=k.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR",{month:"short"}).format(new Date(y,m-1,1)).replace(".","");
  });

  return `
    <section class="hero">
      <div class="hero-month-row">
        <div class="eyebrow">💰 Gasto do mês</div>
        ${monthSelectorHTML("home-month-selector")}
      </div>
      <div class="hero-value">${money(totalMonth)}</div>
      <div class="hero-chip">
        <span class="real-badge">● dados reais</span>
        ${monthDelta===null ? "" : `<span>${monthDelta>=0?"↑":"↓"} ${Math.abs(monthDelta).toFixed(1).replace(".",",")}% vs. ${escapeHtml(monthLabel(prevKey))}</span>`}
      </div>
    </section>

    <section class="section">
      <div class="grid-2">
        <div class="card mini-card"><div class="mini-icon">🛒</div><div><div class="card-label">Lista ativa</div><div class="card-value">${state.listItems.length} itens</div><div class="card-sub">${state.listItems.filter(i=>i.no_carrinho).length} no carrinho</div></div></div>
        <div class="card mini-card"><div class="mini-icon">📦</div><div><div class="card-label">Pode estar acabando</div><div class="card-value">${ending.length}</div><div class="card-sub">com base no histórico</div></div></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Gastos por mês</div><div class="section-note">dados reais</div></div>
      ${monthVals.length>1 ? chartHTML(monthVals,monthLabels) : `<div class="card-sub">Ainda faltam meses suficientes para o gráfico.</div>`}
    </section>

    <div class="collapse">
      <button data-collapse><span>🕒 Compras de ${escapeHtml(monthLabel(selected))}</span><span>⌄</span></button>
      <div class="collapse-body">
        ${recent.length ? recent.map(n=>`<div class="purchase-row"><div><strong>${escapeHtml(String(n.nome_estabelecimento||"").toUpperCase())}</strong><span>${formatDate(n.data_emissao)}</span></div><strong>${money(n.valor_total)}</strong></div>`).join("") : `<div class="card-sub">Nenhuma compra nesse mês.</div>`}
      </div>
    </div>

    <section class="section">
      <div class="section-head"><div class="section-title">Movimentos de preço</div><div class="section-note">últimas variações</div></div>
      <div class="product-grid">
        ${movements.length ? movements.map(productCard).join("") : `<div class="card-sub">Ainda não há produtos repetidos suficientes.</div>`}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Pode estar acabando</div><div class="section-note">estimativa pelo seu histórico</div></div>
      ${ending.length ? `<div class="ending-grid">${ending.map(endingCard).join("")}</div>` : `<div class="card-sub">Ainda não há ciclos de compra suficientes para estimar reposição.</div>`}
    </section>`;
}
function productCard(p){
  const cls=p.delta<0?"down":"up", arrow=p.delta<0?"↓":"↑";
  const unit=p.unit ? `<div class="unit-tag">${escapeHtml(p.unit)}</div>` : "";
  const priceText = p.price>0 ? `${money(p.price)}${p.unit?.toUpperCase()==="KG"?"/kg":""}` : "Sem preço";
  const deltaText = p.history.length > 1 ? `${arrow} ${Math.abs(p.delta).toFixed(1).replace(".",",")}%` : "novo";
  return `<button class="product-card" data-product="${p.id}">
    ${photoMarkup(p, "product-photo")}
    <div class="product-info">
      <div class="product-name">${escapeHtml(p.name.toUpperCase())}</div>
      ${unit}
      <div class="product-meta"><div class="product-price">${priceText}</div><span class="delta ${cls}">${deltaText}</span></div>
    </div>
  </button>`;
}

function products(){
  subtitle.textContent="Sua biblioteca de produtos";

  const dynamicCategories = [...new Set(
    state.products
      .map(p=>norm(p.category))
      .filter(Boolean)
  )].sort((a,b)=>a.localeCompare(b,"pt-BR"));

  const cats=["Todos",...dynamicCategories];

  if(!cats.includes(state.productFilter)) state.productFilter="Todos";

  const visible = state.productFilter==="Todos"
    ? state.products
    : state.products.filter(p=>norm(p.category)===state.productFilter);

  return `
    <div class="products-toolbar">
      <input id="product-search" class="search" placeholder="🔎 Buscar produtos, marcas ou categorias">
    </div>
    <div class="filter-row">${cats.map(c=>`<button class="filter-chip ${state.productFilter===c?"active":""}" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}</div>
    <div id="products-grid" class="product-grid">${visible.map(productCard).join("")}</div>`;
}

function shoppingList(){
  if(state.listLoading){
    subtitle.textContent="Sua lista de compras";
    return `<div class="loading">Carregando sua Lista do Supabase…</div>`;
  }
  if(state.listError){
    subtitle.textContent="Sua lista de compras";
    return `
      <div class="setup-banner">
        <b>Erro ao abrir a Lista:</b><br>${escapeHtml(state.listError)}
      </div>
      <button class="primary" id="retry-list" style="width:100%;margin-top:10px">Tentar novamente</button>`;
  }
  subtitle.textContent="Sua lista de compras";

  const estimated = state.listItems.reduce((s,i)=>{
    const q = isKg(i.unidade) ? (num(i.peso_kg)>0 ? num(i.peso_kg) : 0) : num(i.quantidade||1);
    return s + q*num(i.preco_previsto);
  },0);

  const cart = state.listItems
    .filter(i=>i.no_carrinho)
    .reduce((s,i)=>s+itemTotal(i),0);

  const pending = state.listItems.filter(i=>!i.no_carrinho).length;
  const inCart = state.listItems.filter(i=>i.no_carrinho).length;

  const rawQ = state.listSearch.trim();
  const q = rawQ.toLowerCase();

  const availableProducts = state.products
    .filter(p=>!state.listItems.some(i=>searchNorm(i.produto)===searchNorm(p.name)));

  const candidates = availableProducts
    .filter(p=>smartMatch(p,q))
    .sort((a,b)=>{
      if(q) return a.name.localeCompare(b.name,"pt-BR");
      return (b.history?.length||0) - (a.history?.length||0);
    })
    .slice(0, q ? 12 : 4);

  const exactInLibrary = rawQ
    ? state.products.some(p=>searchNorm(p.name)===searchNorm(rawQ))
    : false;

  const exactInList = rawQ
    ? state.listItems.some(i=>searchNorm(i.produto)===searchNorm(rawQ))
    : false;

  const showCustomAdd = Boolean(rawQ && !exactInLibrary && !exactInList);

  return `
    <section class="hero list-summary">
      <div class="eyebrow">🛒 ${escapeHtml(state.activeList?.nome || "Lista principal")}</div>
      <div class="hero-value">${money(estimated)}</div>
      <div class="hero-chip">${state.listItems.length} itens • ${inCart} no carrinho • ${pending} faltando</div>
      <button type="button" class="market-mode-toggle" id="market-mode-toggle" aria-pressed="${state.marketMode?"true":"false"}">
        ${state.marketMode ? "✕ Sair do modo mercado" : "🛒 Modo mercado"}
      </button>
    </section>

    <section class="section add-list-card ${state.marketMode ? "market-hidden" : ""}">
      <div class="section-head">
        <div class="section-title">Adicionar produto</div>
        <div class="section-note">da sua biblioteca real</div>
      </div>
      <input id="list-search" class="search" placeholder="🔎 Digite arroz, leite, batata..." value="${escapeHtml(state.listSearch)}">
      ${!q ? `<div class="search-hint">Mais comprados recentemente</div>` : ""}
      ${showCustomAdd ? `
        <div class="custom-list-add-wrap">
          <div class="custom-list-add-copy">
            <span class="quick-photo custom-list-icon">＋</span>
            <span>
              <b>Adicionar “${escapeHtml(rawQ)}”</b>
              <small>Ainda não comprado • escolha como deseja comprar</small>
            </span>
          </div>
          <div class="custom-list-unit-actions">
            <button data-add-custom-list="${escapeHtml(rawQ)}" data-custom-unit="UN">UN</button>
            <button data-add-custom-list="${escapeHtml(rawQ)}" data-custom-unit="KG">KG</button>
          </div>
        </div>` : ""}
      <div class="quick-add-grid">
        ${candidates.map(p=>`
          <button class="quick-add" data-add-list="${p.id}">
            ${photoMarkup(p, "quick-photo")}
            <span><b>${escapeHtml(p.name)}</b><small>${money(p.price)}${isKg(p.unit)?"/kg":""} • ${escapeHtml(p.unit||"")}</small></span>
            <strong>＋</strong>
          </button>`).join("") || (!showCustomAdd ? `<div class="card-sub">Nenhum produto encontrado.</div>` : "")}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Itens da lista</div><div class="section-note">salvo no Supabase</div></div>
      <div id="shopping-list" class="${state.marketMode ? "market-mode-list" : ""}">
        ${state.listItems.length ? state.listItems.map(shoppingItem).join("") : `
          <div class="empty-list">
            <div class="empty-list-icon">🛒</div>
            <b>Sua lista está vazia</b>
            <span>Use a busca acima para adicionar um produto.</span>
          </div>`}
      </div>
    </section>

    <section class="section totals-section ${state.marketMode ? "market-totals" : ""}">
      <div class="grid-2">
        <div class="card"><div class="card-label">Estimado</div><div class="card-value">${money(estimated)}</div></div>
        <div class="card"><div class="card-label">No carrinho</div><div class="card-value cyan">${money(cart)}</div></div>
      </div>
    </section>`;
}

function shoppingItem(item){
  const product = productByName(item.produto);
  const icon = product?.icon || iconFor(item.produto,item.unidade);
  const imageUrl = product?.imageUrl || "";
  const kg = isKg(item.unidade);
  const predicted = num(item.preco_previsto);
  const total = itemTotal(item);

  const quantityControl = kg ? `
      <label class="market-field">
        <span>⚖️ Peso</span>
        <div class="market-input-wrap">
          <input class="market-input" data-weight="${item.id}" inputmode="decimal"
            placeholder="0,000" value="${num(item.peso_kg)>0 ? num(item.peso_kg).toFixed(3).replace(".",",") : ""}">
          <em>kg</em>
        </div>
      </label>` : `
      <div class="market-field">
        <span>Quantidade</span>
        <div class="qty-control">
          <button data-minus="${item.id}">−</button>
          <span>${num(item.quantidade||1)}</span>
          <button data-plus="${item.id}">＋</button>
        </div>
      </div>`;

  return `
  <article class="shopping-item ${item.no_carrinho?"picked":""}" data-item="${item.id}">
    <div class="shopping-top">
      ${photoMarkup({name:item.produto, unit:item.unidade, icon, imageUrl}, "shopping-photo")}
      <div>
        <div class="shopping-name">${escapeHtml(item.produto.toUpperCase())}</div>
        <div class="shopping-last">${product && predicted>0 ? `Último ${money(predicted)}${kg?"/kg":""} • ${escapeHtml(item.unidade||"")}` : `Sem histórico de preço • ${escapeHtml(item.unidade||"UN")}`}</div>
        ${!product ? (()=>{ const links=possibleLinksForManualItem(item); return links.length ? `
          <div class="manual-link-box">
            <span>Produto parecido encontrado no histórico:</span>
            ${links.map(p=>`<button data-link-manual-item="${item.id}" data-link-product="${p.id}">Vincular a ${escapeHtml(p.name)}</button>`).join("")}
          </div>` : ""; })() : ""}
      </div>
      <div class="shopping-actions-top">
        <button class="image-mini-btn" data-upload-product="${escapeHtml(item.produto)}" title="Adicionar ou trocar imagem">🖼️</button>
        <button class="remove-item" data-remove="${item.id}" title="Remover">×</button>
      </div>
    </div>

    <div class="market-row">
      ${quantityControl}
      <label class="market-field">
        <span>Preço atual ${kg?"/kg":""}</span>
        <div class="market-input-wrap">
          <b>R$</b>
          <input class="market-input" data-price="${item.id}" inputmode="decimal"
            placeholder="${predicted.toFixed(2).replace(".",",")}"
            value="${num(item.preco_atual)>0 ? num(item.preco_atual).toFixed(2).replace(".",",") : ""}">
        </div>
      </label>
    </div>

    <div class="shopping-bottom">
      <button class="check-btn ${item.no_carrinho?"checked":""}" data-check="${item.id}">
        ${item.no_carrinho?"✓ No carrinho":"○ Pegar"}
      </button>
      <div class="item-total">
        <span>Total</span><strong>${(kg && !(num(item.peso_kg)>0)) ? "—" : money(total)}</strong>
      </div>
    </div>
  </article>`;
}


function parseDecimal(v){
  let s = String(v ?? "").trim().replace(/\s/g,"").replace(/R\$/gi,"");
  if(!s) return null;

  const comma = s.lastIndexOf(",");
  const dot = s.lastIndexOf(".");

  if(comma >= 0 && dot >= 0){
    // O último separador é tratado como decimal.
    if(comma > dot){
      s = s.replace(/\./g,"").replace(",",".");
    }else{
      s = s.replace(/,/g,"");
    }
  }else if(comma >= 0){
    s = s.replace(/\./g,"").replace(",",".");
  }else{
    // Com apenas ponto, preserva como decimal. Ex.: input type=number retorna 6.59.
    const dots = (s.match(/\./g)||[]).length;
    if(dots > 1){
      const last = s.lastIndexOf(".");
      s = s.slice(0,last).replace(/\./g,"") + "." + s.slice(last+1);
    }
  }

  s = s.replace(/[^0-9.+-]/g,"");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function isoDate(v){
  if(!v) return new Date().toISOString().slice(0,10);
  return String(v).slice(0,10);
}

function monthsAfter(dateStr, months){
  if(!dateStr || !(Number(months)>0)) return null;
  const d = new Date(dateStr + "T12:00:00");
  if(Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + Number(months));
  return d;
}

function dateDiffDays(from, to){
  const a = new Date(from);
  const b = new Date(to);
  if(Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.round((b-a)/86400000);
}

async function loadVehicleData(){
  if(!state.session) return;

  state.vehicleLoading = true;
  state.vehicleError = null;

  let { data:vehicles, error:vehicleErr } = await supabase
    .from("veiculos")
    .select("id,user_id,apelido,marca,modelo,ano,portas,motor,meta_consumo,km_atual,preco_gasolina_flex,preco_etanol_flex,observacoes,dados_iniciais_importados,criado_em,atualizado_em")
    .order("criado_em",{ascending:true})
    .limit(1);

  if(vehicleErr) throw vehicleErr;

  let vehicle = vehicles?.[0] || null;

  if(!vehicle){
    const { data,error } = await supabase
      .from("veiculos")
      .insert({
        user_id: state.session.user.id,
        apelido: "Fiesta",
        marca: "Ford",
        modelo: "Fiesta",
        ano: 2010,
        portas: 4,
        motor: "1.0",
        meta_consumo: 14,
        km_atual: 178000,
        preco_gasolina_flex: null,
        preco_etanol_flex: null,
        observacoes: "Motor retificado.",
        dados_iniciais_importados: false
      })
      .select("id,user_id,apelido,marca,modelo,ano,portas,motor,meta_consumo,km_atual,preco_gasolina_flex,preco_etanol_flex,observacoes,dados_iniciais_importados,criado_em,atualizado_em")
      .single();

    if(error) throw error;
    vehicle = data;
  }

  state.vehicle = vehicle;

  if(vehicle && !vehicle.dados_iniciais_importados){
    await seedKnownVehicleHistory(vehicle.id);
    const { data,error } = await supabase
      .from("veiculos")
      .update({dados_iniciais_importados:true,atualizado_em:new Date().toISOString()})
      .eq("id",vehicle.id)
      .select("id,user_id,apelido,marca,modelo,ano,portas,motor,meta_consumo,km_atual,preco_gasolina_flex,preco_etanol_flex,observacoes,dados_iniciais_importados,criado_em,atualizado_em")
      .single();
    if(error) throw error;
    state.vehicle = data;
  }

  const [fuelRes,maintRes,remRes,obdRes] = await Promise.all([
    supabase.from("veiculo_abastecimentos")
      .select("id,veiculo_id,data,odometro,combustivel,litros,valor_total,preco_litro,tanque_completo,ar_condicionado,fonte,observacao,nota_chave,estabelecimento,origem_automatica,criado_em")
      .eq("veiculo_id",state.vehicle.id)
      .order("data",{ascending:false})
      .order("odometro",{ascending:false}),
    supabase.from("veiculo_manutencoes")
      .select("id,veiculo_id,data,odometro,descricao,oficina,itens,valor_pecas,valor_mao_obra,valor_total,observacao,criado_em")
      .eq("veiculo_id",state.vehicle.id)
      .order("data",{ascending:false}),
    supabase.from("veiculo_lembretes")
      .select("id,veiculo_id,titulo,categoria,data_base,intervalo_meses,km_base,intervalo_km,ativo,observacao,criado_em")
      .eq("veiculo_id",state.vehicle.id)
      .eq("ativo",true)
      .order("criado_em",{ascending:false}),
    supabase.from("veiculo_obd_sessoes")
      .select("id,veiculo_id,data_hora,distancia_km,combustivel_litros,consumo_kml,litros_hora,fonte,parcial,observacao,criado_em")
      .eq("veiculo_id",state.vehicle.id)
      .order("data_hora",{ascending:false})
  ]);

  const err = fuelRes.error || maintRes.error || remRes.error || obdRes.error;
  if(err) throw err;

  state.fuelings = fuelRes.data || [];
  state.maintenances = maintRes.data || [];
  state.vehicleReminders = remRes.data || [];
  state.obdSessions = obdRes.data || [];

  const imported = await syncFuelNotesFromPurchases();
  if(imported>0) await refreshFuelings();

  state.vehicleLoading = false;
  state.vehicleLoaded = true;
}

async function seedKnownVehicleHistory(vehicleId){
  // Abastecimentos não são inventados nem estimados.
  // Eles entram pelas notas fiscais ou por cadastro manual.
  const maintenances = [
    {
      veiculo_id:vehicleId,data:"2025-05-29",odometro:165820,descricao:"Revisão / serviços",valor_pecas:1275,valor_mao_obra:600,valor_total:1875,
      itens:[
        {nome:"Aditivo",valor:60},{nome:"Descarbonante",valor:30},{nome:"Filtro de óleo",valor:30},{nome:"Junta do tucho",valor:110},
        {nome:"Mão de obra",valor:600},{nome:"Pivô",valor:260},{nome:"Radiador",valor:550},{nome:"Silicone",valor:40},
        {nome:"Água desmineralizada",valor:15},{nome:"Óleo lubrificante",valor:180}
      ]
    },
    {
      veiculo_id:vehicleId,data:"2025-07-07",odometro:166830,descricao:"Sistema de arrefecimento",valor_pecas:615,valor_mao_obra:150,valor_total:765,
      itens:[
        {nome:"Aditivo",valor:60},{nome:"Carcaça termostática",valor:540},{nome:"Mão de obra",valor:150},{nome:"Água desmineralizada",valor:15}
      ]
    },
    {
      veiculo_id:vehicleId,data:"2025-10-02",odometro:170000,descricao:"Revisão / manutenção",valor_pecas:585,valor_mao_obra:300,valor_total:885,
      itens:[
        {nome:"Descarbonante",valor:35},{nome:"Filtro de ar",valor:40},{nome:"Filtro de combustível",valor:30},{nome:"Fluido de freio",valor:35},
        {nome:"Fluido da direção hidráulica",valor:40},{nome:"Limpeza de bico",valor:100},{nome:"Mão de obra",valor:300},
        {nome:"Porca de roda",valor:30},{nome:"Reparo de bico",valor:40},{nome:"Rolamento de roda",valor:170},{nome:"Válvula anti-chama",valor:65}
      ]
    },
    {
      veiculo_id:vehicleId,data:"2026-01-22",odometro:170000,descricao:"Revisão / manutenção",valor_pecas:740,valor_mao_obra:350,valor_total:1090,
      itens:[
        {nome:"Aditivo",valor:90},{nome:"Batedor",valor:270},{nome:"Filtro de ar",valor:40},{nome:"Filtro de combustível",valor:30},
        {nome:"Filtro de óleo",valor:30},{nome:"Mão de obra",valor:350},{nome:"Reservatório",valor:100},{nome:"Óleo lubrificante",valor:180}
      ]
    },
    {
      veiculo_id:vehicleId,data:"2026-05-14",odometro:178000,descricao:"Reparo / manutenção",valor_pecas:630,valor_mao_obra:200,valor_total:830,
      itens:[
        {nome:"Bico ejetor",valor:280},{nome:"Filtro de combustível",valor:30},{nome:"Mão de obra",valor:200},
        {nome:"Reparo de bico",valor:30},{nome:"Rolamento dianteiro lado carona",valor:130},{nome:"Velas de ignição",valor:160}
      ]
    }
  ];

  const existingMaint = await supabase.from("veiculo_manutencoes").select("id").eq("veiculo_id",vehicleId).limit(1);
  if(!existingMaint.error && !(existingMaint.data||[]).length){
    const r=await supabase.from("veiculo_manutencoes").insert(maintenances);
    if(r.error) throw r.error;
  }
}


function fuelTypeFromName(name){
  const x=searchNorm(name);
  if(/\b(GASOLINA|GAS COMUM|GAS ADIT|GASOL COMUM|GASOL ADIT)\b/.test(x)) return "Gasolina";
  if(/\b(ETANOL|ALCOOL|ALCOOL HIDR|ETAN HIDR)\b/.test(x)) return "Etanol";
  if(/\b(DIESEL|S10|S 10)\b/.test(x)) return "Diesel";
  return null;
}

function fuelPurchasesFromNotes(){
  const noteById=new Map(state.notas.map(n=>[String(n.id),n]));
  const grouped=new Map();

  for(const item of state.itens){
    const fuel=fuelTypeFromName(item.produto);
    if(!fuel) continue;

    const note=noteById.get(String(item.nota_id));
    if(!note) continue;

    const key=`${note.chave || note.id}::${fuel}`;
    if(!grouped.has(key)){
      grouped.set(key,{
        note,
        fuel,
        liters:0,
        total:0,
        weightedPrice:0,
        priceWeight:0
      });
    }

    const g=grouped.get(key);
    const qty=Math.max(0,num(item.quantidade));
    const total=Math.max(0,num(item.valor_total));
    const unit=Math.max(0,num(item.preco_unitario));

    g.liters += qty;
    g.total += total;
    if(unit>0 && qty>0){
      g.weightedPrice += unit*qty;
      g.priceWeight += qty;
    }
  }

  return [...grouped.values()].filter(x=>x.liters>0 || x.total>0);
}

async function syncFuelNotesFromPurchases(){
  if(!state.vehicle) return 0;

  const found=fuelPurchasesFromNotes();
  if(!found.length) return 0;

  const existing=new Set(
    state.fuelings
      .filter(x=>x.nota_chave)
      .map(x=>`${String(x.nota_chave)}::${String(x.combustivel||"")}`)
  );

  const rows=[];
  for(const x of found){
    const noteKey=String(x.note.chave || x.note.id);
    const uniq=`${noteKey}::${x.fuel}`;
    if(existing.has(uniq)) continue;

    const price=x.liters>0
      ? (x.total>0 ? x.total/x.liters : (x.priceWeight>0 ? x.weightedPrice/x.priceWeight : null))
      : null;

    rows.push({
      veiculo_id:state.vehicle.id,
      data:isoDate(x.note.data_emissao),
      odometro:null,
      combustivel:x.fuel,
      litros:x.liters || null,
      valor_total:x.total || null,
      preco_litro:price,
      tanque_completo:false,
      ar_condicionado:false,
      fonte:"NFC-e",
      observacao:"Importado automaticamente do histórico de compras. Complete o odômetro quando quiser calcular o consumo.",
      nota_chave:noteKey,
      estabelecimento:x.note.nome_estabelecimento || null,
      origem_automatica:true
    });
  }

  if(!rows.length) return 0;

  const {error}=await supabase.from("veiculo_abastecimentos").insert(rows);
  if(error) throw error;
  return rows.length;
}

async function refreshFuelings(){
  const {data,error}=await supabase.from("veiculo_abastecimentos")
    .select("id,veiculo_id,data,odometro,combustivel,litros,valor_total,preco_litro,tanque_completo,ar_condicionado,fonte,observacao,nota_chave,estabelecimento,origem_automatica,criado_em")
    .eq("veiculo_id",state.vehicle.id)
    .order("data",{ascending:false})
    .order("odometro",{ascending:false});
  if(error) throw error;
  state.fuelings=data||[];
}

async function completeImportedFueling(item){
  const currentKm=item.odometro ? String(item.odometro) : "";
  const kmText=prompt("Odômetro nesse abastecimento:",currentKm);
  if(kmText===null) return;

  const km=parseDecimal(kmText);
  if(!km || km<=0){
    alert("Informe uma quilometragem válida.");
    return;
  }

  const full=confirm("O tanque foi completado nesse abastecimento?\n\nOK = Sim\nCancelar = Não");
  const ac=confirm("Você usou ar-condicionado nesse período?\n\nOK = Sim\nCancelar = Não");

  const {error}=await supabase.from("veiculo_abastecimentos")
    .update({
      odometro:km,
      tanque_completo:full,
      ar_condicionado:ac,
      observacao:item.origem_automatica
        ? "Importado automaticamente da nota fiscal; dados de uso completados no Prisma."
        : item.observacao
    })
    .eq("id",item.id);

  if(error){
    alert("Erro ao completar abastecimento: "+error.message);
    return;
  }

  if(km>num(state.vehicle.km_atual)){
    await supabase.from("veiculos")
      .update({km_atual:km,atualizado_em:new Date().toISOString()})
      .eq("id",state.vehicle.id);
  }

  await loadVehicleData();
  render();
}

function fuelingChronological(){
  return [...state.fuelings].sort((a,b)=>{
    const ka=num(a.odometro), kb=num(b.odometro);
    if(ka!==kb) return ka-kb;
    return new Date(a.data||0)-new Date(b.data||0);
  });
}

function fuelingConsumptionMap(){
  const rows=fuelingChronological();
  const map=new Map();
  for(let i=1;i<rows.length;i++){
    const prev=rows[i-1], cur=rows[i];
    const dist=num(cur.odometro)-num(prev.odometro);
    const liters=num(cur.litros);
    const valid=cur.tanque_completo!==false && dist>0 && liters>0;
    map.set(cur.id, valid ? {distance:dist,kml:dist/liters} : null);
  }
  return map;
}

function validFuelConsumptions(){
  const map=fuelingConsumptionMap();
  return state.fuelings
    .map(x=>map.get(x.id))
    .filter(Boolean)
    .filter(x=>Number.isFinite(x.kml) && x.kml>0 && x.kml<40);
}

function maintenanceTotal(){
  return state.maintenances.reduce((sum,x)=>sum+num(x.valor_total),0);
}

function maintenanceTotalByYear(year){
  return state.maintenances
    .filter(x=>new Date(x.data+"T12:00:00").getFullYear()===year)
    .reduce((sum,x)=>sum+num(x.valor_total),0);
}

function reminderState(item){
  const now = new Date();
  const kmNow = num(state.vehicle?.km_atual);
  const dueDate = monthsAfter(item.data_base, item.intervalo_meses);
  const dueKm = (num(item.km_base)>0 && num(item.intervalo_km)>0)
    ? num(item.km_base)+num(item.intervalo_km)
    : null;

  let late=false, soon=false;
  let days=null, kmLeft=null;

  if(dueDate){
    days=dateDiffDays(now,dueDate);
    if(days < 0) late=true;
    else if(days <= 30) soon=true;
  }

  if(dueKm && kmNow>0){
    kmLeft=dueKm-kmNow;
    if(kmLeft <= 0) late=true;
    else if(kmLeft <= 1000) soon=true;
  }

  return {
    dueDate,
    dueKm,
    days,
    kmLeft,
    status: late ? "Vencido" : soon ? "Próximo" : "Em dia",
    cls: late ? "late" : soon ? "soon" : "ok"
  };
}

function latestFuelPrice(type){
  const target=searchNorm(type);
  const rows=state.fuelings
    .filter(x=>searchNorm(x.combustivel||"")===target && num(x.preco_litro)>0)
    .sort((a,b)=>new Date(b.data||0)-new Date(a.data||0));
  return rows.length ? num(rows[0].preco_litro) : 0;
}

function normalizeStoredFuelPrice(value){
  const n=num(value);
  // Corrige automaticamente o bug antigo: 6,59 tinha sido salvo como 659.
  if(n>=100 && n<10000) return n/100;
  return n;
}

function flexStoredGas(){
  const saved=normalizeStoredFuelPrice(state.vehicle?.preco_gasolina_flex);
  return saved>0 ? saved : (latestFuelPrice("Gasolina")||5.99);
}
function flexStoredEth(){
  const saved=normalizeStoredFuelPrice(state.vehicle?.preco_etanol_flex);
  return saved>0 ? saved : (latestFuelPrice("Etanol")||4.10);
}

async function saveFlexPrices(){
  if(!state.vehicle) return;
  const gas=parseDecimal(document.querySelector("#gas")?.value);
  const eth=parseDecimal(document.querySelector("#eth")?.value);
  if(!(gas>0) || !(eth>0)) return;

  // Mantém a interface responsiva mesmo com internet lenta.
  state.vehicle.preco_gasolina_flex=gas;
  state.vehicle.preco_etanol_flex=eth;

  const {data,error}=await supabase.from("veiculos")
    .update({preco_gasolina_flex:gas,preco_etanol_flex:eth,atualizado_em:new Date().toISOString()})
    .eq("id",state.vehicle.id)
    .select("id,user_id,apelido,marca,modelo,ano,portas,motor,meta_consumo,km_atual,preco_gasolina_flex,preco_etanol_flex,observacoes,dados_iniciais_importados,criado_em,atualizado_em")
    .single();
  if(error){console.error("flex prices",error);return;}
  state.vehicle=data;
}

function vehicleSummary(){
  const cons=validFuelConsumptions();
  const avg=cons.length ? cons.reduce((s,x)=>s+x.kml,0)/cons.length : 0;
  const lastMaint=state.maintenances[0];
  const alertStates=state.vehicleReminders.map(reminderState);
  const attention=alertStates.filter(x=>x.status!=="Em dia").length;
  const y2025=maintenanceTotalByYear(2025), y2026=maintenanceTotalByYear(2026);

  return `
    <section class="section">
      <div class="vehicle-stat-grid">
        <div class="vehicle-stat"><span>Consumo médio</span><strong>${avg?avg.toFixed(2).replace(".",",")+" km/L":"—"}</strong><small>meta ${num(state.vehicle?.meta_consumo||14).toFixed(0)} km/L</small></div>
        <div class="vehicle-stat"><span>Manutenção acumulada</span><strong>${money(maintenanceTotal())}</strong><small>${state.maintenances.length} registros</small></div>
        <div class="vehicle-stat"><span>Última manutenção</span><strong>${lastMaint?formatDate(lastMaint.data):"—"}</strong><small>${lastMaint?.odometro?Number(lastMaint.odometro).toLocaleString("pt-BR")+" km":"sem km"}</small></div>
        <div class="vehicle-stat"><span>Alertas</span><strong class="${attention?"vehicle-alert-count":""}">${attention}</strong><small>${attention?"pedem atenção":"nenhum pendente"}</small></div>
      </div>
      <div class="vehicle-year-grid">
        <div class="vehicle-stat"><span>Manutenção 2025</span><strong>${money(y2025)}</strong></div>
        <div class="vehicle-stat"><span>Manutenção 2026</span><strong>${money(y2026)}</strong></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Últimos serviços</div><div class="section-note">histórico real</div></div>
      <div class="vehicle-list">${state.maintenances.slice(0,3).map(vehicleMaintenanceCard).join("") || `<div class="vehicle-empty">Nenhuma manutenção registrada.</div>`}</div>
    </section>

    <section class="flex-card">
      <div class="section-head"><div class="section-title">Calculadora Flex</div><div class="section-note">70% como referência</div></div>
      <div class="flex-inputs">
        <div class="field"><label>Gasolina (R$/L)</label><input id="gas" type="number" step=".01" value="${flexStoredGas().toFixed(2)}"></div>
        <div class="field"><label>Etanol (R$/L)</label><input id="eth" type="number" step=".01" value="${flexStoredEth().toFixed(2)}"></div>
      </div>
      <div id="flex-result" class="flex-result"></div>
    </section>`;
}

function vehicleFuelingCard(item){
  const cmap=fuelingConsumptionMap();
  const c=cmap.get(item.id);
  const price=num(item.preco_litro)>0 ? num(item.preco_litro) : (num(item.valor_total)>0&&num(item.litros)>0 ? num(item.valor_total)/num(item.litros) : 0);
  const open=String(state.expandedFuelingId||"")===String(item.id);
  return `<article class="vehicle-card compact ${open?"expanded":""}">
    <button class="vehicle-card-toggle" data-toggle-fueling="${item.id}" aria-expanded="${open}">
      <div class="vehicle-card-head">
        <div><div class="vehicle-card-title">⛽ ${escapeHtml(item.combustivel||"Combustível")} ${item.origem_automatica?`<span class="fuel-auto-badge">NFC-e automática</span>`:""}</div><div class="vehicle-card-date">${formatDate(item.data)}${item.odometro?` • ${num(item.odometro).toLocaleString("pt-BR")} km`:" • km pendente"}</div></div>
        <div style="display:flex;align-items:center;gap:9px"><div class="vehicle-card-value">${num(item.valor_total)>0?money(item.valor_total):(price?money(price)+"/L":"—")}</div><span class="vehicle-chevron">⌄</span></div>
      </div>
      <div class="vehicle-compact-meta">
        ${num(item.litros)>0?`<span class="vehicle-pill">${num(item.litros).toFixed(3).replace(".",",")} L</span>`:""}
        ${price?`<span class="vehicle-pill">${money(price)}/L</span>`:""}
        ${c?`<span class="vehicle-pill">${c.kml.toFixed(2).replace(".",",")} km/L</span>`:""}
      </div>
    </button>
    ${open?`<div class="vehicle-card-details">
      <div class="vehicle-card-meta">
        ${c?`<span class="vehicle-pill">${c.distance.toLocaleString("pt-BR")} km percorridos</span>`:""}
        <span class="vehicle-pill">${item.tanque_completo===false?"parcial":"tanque completo"}</span>
        ${item.ar_condicionado?`<span class="vehicle-pill">❄️ ar-condicionado</span>`:""}
        ${item.fonte?`<span class="vehicle-pill">${escapeHtml(item.fonte)}</span>`:""}
        ${item.estabelecimento?`<span class="vehicle-pill">${escapeHtml(item.estabelecimento)}</span>`:""}
      </div>
      ${item.observacao?`<div class="vehicle-note">${escapeHtml(item.observacao)}</div>`:""}
      ${item.origem_automatica?`<button class="secondary" style="width:100%;margin-top:9px" data-complete-fueling="${item.id}">${item.odometro?"Editar dados de uso":"Completar odômetro / tanque"}</button>`:""}
      <button class="vehicle-delete" data-delete-fueling="${item.id}">Excluir registro</button>
    </div>`:""}
  </article>`;
}
function vehicleFuel(){
  const cons=validFuelConsumptions();
  const avg=cons.length ? cons.reduce((s,x)=>s+x.kml,0)/cons.length : 0;
  const last=state.fuelings[0];
  return `
    <section class="section">
      <div class="vehicle-stat-grid">
        <div class="vehicle-stat"><span>Média calculada</span><strong>${avg?avg.toFixed(2).replace(".",",")+" km/L":"—"}</strong><small>meta ${num(state.vehicle?.meta_consumo||14).toFixed(0)} km/L</small></div>
        <div class="vehicle-stat"><span>Último abastecimento</span><strong>${last?formatDate(last.data):"—"}</strong><small>${last?.litros?num(last.litros).toFixed(2).replace(".",",")+" L":"sem litros"}</small></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Novo abastecimento</div><div class="section-note">salvo no Supabase</div></div>
      <button class="vehicle-form-toggle" data-toggle-vehicle-form="fuel">${state.vehicleFormOpen.fuel?"Fechar formulário":"＋ Registrar abastecimento"}</button>
      ${state.vehicleFormOpen.fuel?`<div class="vehicle-collapsible-form"><form id="vehicle-fuel-form" class="vehicle-form">
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Data</label><input id="vf-date" type="date" value="${isoDate()}"></div>
          <div class="vehicle-field"><label>Odômetro</label><input id="vf-km" inputmode="decimal" placeholder="${num(state.vehicle?.km_atual).toLocaleString("pt-BR")}"></div>
        </div>
        <div class="vehicle-row three">
          <div class="vehicle-field"><label>Combustível</label><select id="vf-fuel"><option>Gasolina</option><option>Etanol</option></select></div>
          <div class="vehicle-field"><label>Litros</label><input id="vf-liters" inputmode="decimal" placeholder="0,000"></div>
          <div class="vehicle-field"><label>Valor total</label><input id="vf-total" inputmode="decimal" placeholder="0,00"></div>
        </div>
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Preço/L opcional</label><input id="vf-price" inputmode="decimal" placeholder="calculado se vazio"></div>
          <div class="vehicle-field"><label>Fonte</label><select id="vf-source"><option>Manual</option><option>NFC-e</option><option>OBD</option><option>Waze</option></select></div>
        </div>
        <div class="vehicle-row">
          <label class="vehicle-check"><input id="vf-full" type="checkbox" checked> Tanque completo</label>
          <label class="vehicle-check"><input id="vf-ac" type="checkbox"> Usei ar-condicionado</label>
        </div>
        <div class="vehicle-field"><label>Observação</label><input id="vf-note" placeholder="Opcional"></div>
        <button class="primary" type="submit">Salvar abastecimento</button>
      </form></div>`:`<div class="vehicle-collapsed-hint">Abra somente quando precisar registrar manualmente.</div>`}
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Histórico de abastecimentos</div><div class="section-note">${state.fuelings.length} registros</div></div>
      <div class="vehicle-list">${state.fuelings.map(vehicleFuelingCard).join("") || `<div class="vehicle-empty">Nenhum abastecimento registrado.</div>`}</div>
    </section>`;
}

function vehicleMaintenanceCard(item){
  let parts=[];
  if(Array.isArray(item.itens)) parts=item.itens;
  else if(item.itens && typeof item.itens==="object") parts=Object.values(item.itens);
  const open=String(state.expandedMaintenanceId||"")===String(item.id);
  return `<article class="vehicle-card compact ${open?"expanded":""}">
    <button class="vehicle-card-toggle" data-toggle-maint="${item.id}" aria-expanded="${open}">
      <div class="vehicle-card-head">
        <div><div class="vehicle-card-title">🔧 ${escapeHtml(item.descricao||"Manutenção")}</div><div class="vehicle-card-date">${formatDate(item.data)}${item.odometro?` • ${num(item.odometro).toLocaleString("pt-BR")} km`:""}</div></div>
        <div style="display:flex;align-items:center;gap:9px"><div class="vehicle-card-value">${money(item.valor_total)}</div><span class="vehicle-chevron">⌄</span></div>
      </div>
      <div class="vehicle-compact-meta">
        ${num(item.valor_pecas)>0?`<span class="vehicle-pill">Peças ${money(item.valor_pecas)}</span>`:""}
        ${num(item.valor_mao_obra)>0?`<span class="vehicle-pill">Mão de obra ${money(item.valor_mao_obra)}</span>`:""}
        ${item.oficina?`<span class="vehicle-pill">${escapeHtml(item.oficina)}</span>`:""}
      </div>
    </button>
    ${open?`<div class="vehicle-card-details">
      ${parts.length?`<div class="vehicle-items">${parts.map(p=>`<div class="vehicle-item-row"><span>${escapeHtml(p.nome||p.item||"Item")}</span><strong>${num(p.valor)>0?money(p.valor):""}</strong></div>`).join("")}</div>`:""}
      ${item.observacao?`<div class="vehicle-note">${escapeHtml(item.observacao)}</div>`:""}
      <button class="vehicle-delete" data-delete-maint="${item.id}">Excluir registro</button>
    </div>`:""}
  </article>`;
}
function vehicleMaintenance(){
  return `
    <section class="section">
      <div class="vehicle-stat-grid">
        <div class="vehicle-stat"><span>Total acumulado</span><strong>${money(maintenanceTotal())}</strong><small>desde 2025 nos registros importados</small></div>
        <div class="vehicle-stat"><span>Serviços registrados</span><strong>${state.maintenances.length}</strong><small>peças + mão de obra</small></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Registrar manutenção</div><div class="section-note">serviço completo</div></div>
      <button class="vehicle-form-toggle" data-toggle-vehicle-form="maintenance">${state.vehicleFormOpen.maintenance?"Fechar formulário":"＋ Nova manutenção"}</button>
      ${state.vehicleFormOpen.maintenance?`<div class="vehicle-collapsible-form"><form id="vehicle-maint-form" class="vehicle-form">
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Data</label><input id="vm-date" type="date" value="${isoDate()}"></div>
          <div class="vehicle-field"><label>Odômetro</label><input id="vm-km" inputmode="decimal" placeholder="${num(state.vehicle?.km_atual).toLocaleString("pt-BR")}"></div>
        </div>
        <div class="vehicle-field"><label>Descrição</label><input id="vm-desc" placeholder="Ex.: troca de óleo e filtros" required></div>
        <div class="vehicle-field"><label>Oficina</label><input id="vm-shop" placeholder="Opcional"></div>
        <div class="vehicle-row three">
          <div class="vehicle-field"><label>Peças</label><input id="vm-parts-total" inputmode="decimal" placeholder="0,00"></div>
          <div class="vehicle-field"><label>Mão de obra</label><input id="vm-labor" inputmode="decimal" placeholder="0,00"></div>
          <div class="vehicle-field"><label>Total</label><input id="vm-total" inputmode="decimal" placeholder="auto"></div>
        </div>
        <div class="vehicle-field"><label>Itens — um por linha</label><textarea id="vm-items" placeholder="Óleo lubrificante | 180&#10;Filtro de óleo | 30"></textarea></div>
        <div class="vehicle-field"><label>Observação</label><textarea id="vm-note" placeholder="Opcional"></textarea></div>
        <button class="primary" type="submit">Salvar manutenção</button>
      </form></div>`:`<div class="vehicle-collapsed-hint">O histórico fica visível sem o formulário ocupar a tela.</div>`}
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Histórico de manutenção</div><div class="section-note">${state.maintenances.length} serviços</div></div>
      <div class="vehicle-list">${state.maintenances.map(vehicleMaintenanceCard).join("") || `<div class="vehicle-empty">Nenhuma manutenção registrada.</div>`}</div>
    </section>`;
}

function vehicleReminderCard(item){
  const r=reminderState(item);
  const details=[];
  if(r.dueDate) details.push(`data prevista ${formatDate(r.dueDate)}`);
  if(r.dueKm) details.push(`${Math.round(r.dueKm).toLocaleString("pt-BR")} km`);
  const open=String(state.expandedReminderId||"")===String(item.id);
  return `<article class="vehicle-card compact ${open?"expanded":""}">
    <button class="vehicle-card-toggle" data-toggle-reminder="${item.id}" aria-expanded="${open}">
      <div class="vehicle-card-head">
        <div><div class="vehicle-card-title">🔔 ${escapeHtml(item.titulo)}</div><div class="vehicle-card-date">${escapeHtml(item.categoria||"Manutenção")}</div></div>
        <div style="display:flex;align-items:center;gap:8px"><span class="vehicle-status ${r.cls}">${r.status}</span><span class="vehicle-chevron">⌄</span></div>
      </div>
      ${details.length?`<div class="vehicle-note">${details.join(" • ")}</div>`:""}
    </button>
    ${open?`<div class="vehicle-card-details">
      <div class="vehicle-card-meta">
        ${num(item.intervalo_meses)>0?`<span class="vehicle-pill">a cada ${item.intervalo_meses} meses</span>`:""}
        ${num(item.intervalo_km)>0?`<span class="vehicle-pill">a cada ${num(item.intervalo_km).toLocaleString("pt-BR")} km</span>`:""}
      </div>
      ${item.observacao?`<div class="vehicle-note">${escapeHtml(item.observacao)}</div>`:""}
      <button class="vehicle-delete" data-delete-reminder="${item.id}">Excluir lembrete</button>
    </div>`:""}
  </article>`;
}
function vehicleReminders(){
  return `
    <section class="section">
      <div class="section-head"><div class="section-title">Alertas de manutenção</div><div class="section-note">tempo primeiro • km opcional</div></div>
      <p class="vehicle-subtle">Como o odômetro pode não estar sempre atualizado, o Prisma usa a data como referência principal. Você pode acrescentar quilometragem quando quiser.</p>
      <button class="vehicle-form-toggle" style="margin-top:12px" data-toggle-vehicle-form="reminder">${state.vehicleFormOpen.reminder?"Fechar formulário":"＋ Criar lembrete"}</button>
      ${state.vehicleFormOpen.reminder?`<div class="vehicle-collapsible-form"><form id="vehicle-reminder-form" class="vehicle-form">
        <div class="vehicle-field"><label>Lembrete</label><input id="vr-title" placeholder="Ex.: troca de óleo" required></div>
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Categoria</label><input id="vr-category" placeholder="Motor, freios..."></div>
          <div class="vehicle-field"><label>Data-base</label><input id="vr-date" type="date" value="${isoDate()}"></div>
        </div>
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Repetir em meses</label><input id="vr-months" type="number" min="0" placeholder="Ex.: 6"></div>
          <div class="vehicle-field"><label>Km-base opcional</label><input id="vr-km-base" inputmode="decimal" placeholder="${num(state.vehicle?.km_atual).toLocaleString("pt-BR")}"></div>
        </div>
        <div class="vehicle-field"><label>Repetir em km opcional</label><input id="vr-km-interval" inputmode="decimal" placeholder="Ex.: 5000"></div>
        <div class="vehicle-field"><label>Observação</label><input id="vr-note" placeholder="Opcional"></div>
        <button class="primary" type="submit">Criar lembrete</button>
      </form></div>`:""}
    </section>

    <section class="section">
      <div class="vehicle-list">${state.vehicleReminders.map(vehicleReminderCard).join("") || `<div class="vehicle-empty">Nenhum lembrete ainda. Cadastre apenas os intervalos que você realmente quer acompanhar.</div>`}</div>
    </section>`;
}

function vehicleObdCard(item){
  const kml=num(item.consumo_kml)>0 ? num(item.consumo_kml) : (num(item.distancia_km)>0&&num(item.combustivel_litros)>0 ? num(item.distancia_km)/num(item.combustivel_litros) : 0);
  const open=String(state.expandedObdId||"")===String(item.id);
  return `<article class="vehicle-card compact ${open?"expanded":""}">
    <button class="vehicle-card-toggle" data-toggle-obd="${item.id}" aria-expanded="${open}">
      <div class="vehicle-card-head">
        <div><div class="vehicle-card-title">📟 Sessão OBD</div><div class="vehicle-card-date">${formatDate(item.data_hora)} • ${escapeHtml(item.fonte||"ELM327")}</div></div>
        <div style="display:flex;align-items:center;gap:9px"><div class="vehicle-card-value">${kml?kml.toFixed(2).replace(".",",")+" km/L":"—"}</div><span class="vehicle-chevron">⌄</span></div>
      </div>
      <div class="vehicle-compact-meta">
        ${num(item.distancia_km)>0?`<span class="vehicle-pill">${num(item.distancia_km).toFixed(2).replace(".",",")} km</span>`:""}
        ${num(item.combustivel_litros)>0?`<span class="vehicle-pill">${num(item.combustivel_litros).toFixed(3).replace(".",",")} L</span>`:""}
      </div>
    </button>
    ${open?`<div class="vehicle-card-details">
      <div class="vehicle-card-meta">
        ${num(item.litros_hora)>0?`<span class="vehicle-pill">${num(item.litros_hora).toFixed(2).replace(".",",")} L/h</span>`:""}
        ${item.parcial?`<span class="vehicle-pill">sessão parcial</span>`:""}
      </div>
      ${item.observacao?`<div class="vehicle-note">${escapeHtml(item.observacao)}</div>`:""}
      <button class="vehicle-delete" data-delete-obd="${item.id}">Excluir sessão</button>
    </div>`:""}
  </article>`;
}
function vehicleObd(){
  return `
    <section class="section">
      <div class="section-head"><div class="section-title">ELM327 / OBD</div><div class="section-note">registro opcional</div></div>
      <p class="vehicle-subtle">Aqui entram distância, combustível usado, consumo médio e L/h medidos pelo app OBD. Não depende de rota fixa e pode marcar sessões parciais quando o aplicativo começar depois da saída.</p>
      <button class="vehicle-form-toggle" style="margin-top:12px" data-toggle-vehicle-form="obd">${state.vehicleFormOpen.obd?"Fechar formulário":"＋ Registrar sessão OBD"}</button>
      ${state.vehicleFormOpen.obd?`<div class="vehicle-collapsible-form"><form id="vehicle-obd-form" class="vehicle-form">
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Data/hora</label><input id="vo-date" type="datetime-local"></div>
          <div class="vehicle-field"><label>Fonte</label><input id="vo-source" value="ELM327" placeholder="ELM327"></div>
        </div>
        <div class="vehicle-row three">
          <div class="vehicle-field"><label>Distância km</label><input id="vo-distance" inputmode="decimal" placeholder="0,00"></div>
          <div class="vehicle-field"><label>Combustível L</label><input id="vo-liters" inputmode="decimal" placeholder="0,000"></div>
          <div class="vehicle-field"><label>L/h</label><input id="vo-lph" inputmode="decimal" placeholder="opcional"></div>
        </div>
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Consumo km/L opcional</label><input id="vo-kml" inputmode="decimal" placeholder="auto"></div>
          <label class="vehicle-check"><input id="vo-partial" type="checkbox"> Sessão parcial</label>
        </div>
        <div class="vehicle-field"><label>Observação</label><input id="vo-note" placeholder="Opcional"></div>
        <button class="primary" type="submit">Salvar sessão OBD</button>
      </form></div>`:""}
    </section>
    <section class="section">
      <div class="vehicle-list">${state.obdSessions.map(vehicleObdCard).join("") || `<div class="vehicle-empty">Nenhuma sessão OBD registrada.</div>`}</div>
    </section>`;
}

function vehicleWishlist(){
  const carWishlist=state.wishlist.filter(x=>x.status!=="comprado" && searchNorm(x.categoria||"")==="CARRO");
  const total=carWishlist.reduce((s,x)=>s+num(x.valor_previsto),0);
  return `
    <section class="section vehicle-wish">
      <div class="section-head"><div class="section-title">❤️ Lista do carro</div><div class="section-note">${carWishlist.length} itens • ${money(total)}</div></div>
      <form id="vehicle-wish-form" class="vehicle-form">
        <div class="vehicle-field"><label>Item</label><input id="vw-name" placeholder="Ex.: Limpador de para-brisa" required></div>
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Valor previsto</label><input id="vw-value" inputmode="decimal" placeholder="0,00"></div>
          <div class="vehicle-field"><label>Prioridade</label><select id="vw-priority"><option>Normal</option><option>Alta</option><option>Baixa</option></select></div>
        </div>
        <div class="vehicle-field"><label>Observação</label><input id="vw-note" placeholder="Opcional"></div>
        <button class="primary" type="submit">Adicionar à lista do carro</button>
      </form>
      <div class="wish-list" style="margin-top:12px">${carWishlist.length?carWishlist.map(wishlistCard).join(""):`<div class="vehicle-empty">Nada pendente para o carro.</div>`}</div>
    </section>`;
}

async function saveVehicleProfile(){
  const km=parseDecimal(document.querySelector("#vehicle-current-km")?.value);
  const target=parseDecimal(document.querySelector("#vehicle-target")?.value);
  if(!state.vehicle) return;

  const payload={
    km_atual:km && km>0 ? km : state.vehicle.km_atual,
    meta_consumo:target && target>0 ? target : state.vehicle.meta_consumo,
    atualizado_em:new Date().toISOString()
  };

  const {data,error}=await supabase.from("veiculos")
    .update(payload).eq("id",state.vehicle.id)
    .select("id,user_id,apelido,marca,modelo,ano,portas,motor,meta_consumo,km_atual,preco_gasolina_flex,preco_etanol_flex,observacoes,dados_iniciais_importados,criado_em,atualizado_em")
    .single();

  if(error){alert("Erro ao salvar veículo: "+error.message);return;}
  state.vehicle=data;
  render();
}

async function addFuelingFromForm(){
  const date=document.querySelector("#vf-date").value;
  const km=parseDecimal(document.querySelector("#vf-km").value);
  const liters=parseDecimal(document.querySelector("#vf-liters").value);
  const total=parseDecimal(document.querySelector("#vf-total").value);
  let price=parseDecimal(document.querySelector("#vf-price").value);
  if(!price && total && liters) price=total/liters;

  if(!km || !liters){alert("Informe odômetro e litros.");return;}

  const payload={
    veiculo_id:state.vehicle.id,
    data:date || isoDate(),
    odometro:km,
    combustivel:document.querySelector("#vf-fuel").value,
    litros:liters,
    valor_total:total,
    preco_litro:price,
    tanque_completo:document.querySelector("#vf-full").checked,
    ar_condicionado:document.querySelector("#vf-ac").checked,
    fonte:document.querySelector("#vf-source").value,
    observacao:norm(document.querySelector("#vf-note").value)||null,
    nota_chave:null,
    estabelecimento:null,
    origem_automatica:false
  };

  const {error}=await supabase.from("veiculo_abastecimentos").insert(payload);
  if(error){alert("Erro ao salvar abastecimento: "+error.message);return;}

  if(km>num(state.vehicle.km_atual)){
    await supabase.from("veiculos").update({km_atual:km,atualizado_em:new Date().toISOString()}).eq("id",state.vehicle.id);
  }
  state.vehicleFormOpen.fuel=false;
  await loadVehicleData();
  render();
}

function parseMaintenanceItems(text){
  return String(text||"").split("\n").map(line=>line.trim()).filter(Boolean).map(line=>{
    const parts=line.split("|");
    return {nome:norm(parts[0]),valor:parseDecimal(parts[1])||0};
  });
}

async function addMaintenanceFromForm(){
  const parts=parseDecimal(document.querySelector("#vm-parts-total").value)||0;
  const labor=parseDecimal(document.querySelector("#vm-labor").value)||0;
  const typedTotal=parseDecimal(document.querySelector("#vm-total").value);
  const km=parseDecimal(document.querySelector("#vm-km").value);
  const desc=norm(document.querySelector("#vm-desc").value);
  if(!desc){alert("Informe a descrição do serviço.");return;}

  const payload={
    veiculo_id:state.vehicle.id,
    data:document.querySelector("#vm-date").value || isoDate(),
    odometro:km,
    descricao:desc,
    oficina:norm(document.querySelector("#vm-shop").value)||null,
    itens:parseMaintenanceItems(document.querySelector("#vm-items").value),
    valor_pecas:parts,
    valor_mao_obra:labor,
    valor_total:typedTotal!==null ? typedTotal : parts+labor,
    observacao:norm(document.querySelector("#vm-note").value)||null
  };

  const {error}=await supabase.from("veiculo_manutencoes").insert(payload);
  if(error){alert("Erro ao salvar manutenção: "+error.message);return;}

  if(km && km>num(state.vehicle.km_atual)){
    await supabase.from("veiculos").update({km_atual:km,atualizado_em:new Date().toISOString()}).eq("id",state.vehicle.id);
  }
  state.vehicleFormOpen.maintenance=false;
  await loadVehicleData();
  render();
}

async function addReminderFromForm(){
  const title=norm(document.querySelector("#vr-title").value);
  if(!title){alert("Informe o lembrete.");return;}

  const payload={
    veiculo_id:state.vehicle.id,
    titulo:title,
    categoria:norm(document.querySelector("#vr-category").value)||null,
    data_base:document.querySelector("#vr-date").value || isoDate(),
    intervalo_meses:Number(document.querySelector("#vr-months").value)||null,
    km_base:parseDecimal(document.querySelector("#vr-km-base").value),
    intervalo_km:parseDecimal(document.querySelector("#vr-km-interval").value),
    ativo:true,
    observacao:norm(document.querySelector("#vr-note").value)||null
  };

  if(!payload.intervalo_meses && !payload.intervalo_km){
    alert("Informe pelo menos o intervalo em meses ou em km.");
    return;
  }

  const {error}=await supabase.from("veiculo_lembretes").insert(payload);
  if(error){alert("Erro ao criar lembrete: "+error.message);return;}
  state.vehicleFormOpen.reminder=false;
  await loadVehicleData();
  render();
}

async function addObdFromForm(){
  const distance=parseDecimal(document.querySelector("#vo-distance").value);
  const liters=parseDecimal(document.querySelector("#vo-liters").value);
  let kml=parseDecimal(document.querySelector("#vo-kml").value);
  if(!kml && distance && liters) kml=distance/liters;

  const localDate=document.querySelector("#vo-date").value;
  const dateIso=localDate ? new Date(localDate).toISOString() : new Date().toISOString();

  const payload={
    veiculo_id:state.vehicle.id,
    data_hora:dateIso,
    distancia_km:distance,
    combustivel_litros:liters,
    consumo_kml:kml,
    litros_hora:parseDecimal(document.querySelector("#vo-lph").value),
    fonte:norm(document.querySelector("#vo-source").value)||"ELM327",
    parcial:document.querySelector("#vo-partial").checked,
    observacao:norm(document.querySelector("#vo-note").value)||null
  };

  const {error}=await supabase.from("veiculo_obd_sessoes").insert(payload);
  if(error){alert("Erro ao salvar sessão OBD: "+error.message);return;}
  state.vehicleFormOpen.obd=false;
  await loadVehicleData();
  render();
}

async function deleteVehicleRow(table,id){
  if(!confirm("Excluir este registro?")) return;
  const {error}=await supabase.from(table).delete().eq("id",id);
  if(error){alert("Erro ao excluir: "+error.message);return;}
  await loadVehicleData();
  render();
}


function fuel(){
  subtitle.textContent="Veículo";

  if(state.vehicleError){
    return `<div class="setup-banner"><b>Módulo Veículo ainda não está preparado no Supabase.</b><br>${escapeHtml(state.vehicleError)}<br><br>Rode o arquivo <b>PRISMA_MODULO_VEICULO.sql</b> e atualize a página.</div>`;
  }

  if(state.vehicleLoading || !state.vehicle){
    return `<div class="loading">Carregando módulo Veículo…</div>`;
  }

  const v=state.vehicle;
  const tabs=[
    ["summary","Resumo"],
    ["fuel","Abastecimento"],
    ["maintenance","Manutenção"],
    ["reminders","Alertas"],
    ["obd","OBD"],
    ["wishlist","Comprar depois"]
  ];

  const content={
    summary:vehicleSummary,
    fuel:vehicleFuel,
    maintenance:vehicleMaintenance,
    reminders:vehicleReminders,
    obd:vehicleObd,
    wishlist:vehicleWishlist
  }[state.vehicleTab]?.() || vehicleSummary();

  return `
    <section class="vehicle-hero">
      <div class="vehicle-title">
        <div class="vehicle-icon">🚗</div>
        <div>
          <div class="vehicle-name">${escapeHtml(v.apelido||"Fiesta")}</div>
          <div class="vehicle-desc">${escapeHtml(v.marca||"Ford")} ${escapeHtml(v.modelo||"Fiesta")} ${v.ano||""} • ${v.portas||4} portas${v.motor?` • ${escapeHtml(v.motor)}`:""}</div>
        </div>
      </div>
      <div class="vehicle-km">
        <div><span>QUILOMETRAGEM ATUAL</span><strong>${num(v.km_atual).toLocaleString("pt-BR")} km</strong></div>
        <button class="vehicle-km-edit" id="vehicle-edit-toggle">editar</button>
      </div>
      <form id="vehicle-profile-form" class="vehicle-form" style="display:none;margin-top:12px">
        <div class="vehicle-row">
          <div class="vehicle-field"><label>Km atual</label><input id="vehicle-current-km" inputmode="decimal" value="${num(v.km_atual)}"></div>
          <div class="vehicle-field"><label>Meta km/L</label><input id="vehicle-target" inputmode="decimal" value="${num(v.meta_consumo||14)}"></div>
        </div>
        <button class="primary" type="submit">Salvar</button>
      </form>
    </section>

    <div class="vehicle-tabs">
      ${tabs.map(([id,label])=>`<button class="vehicle-tab ${state.vehicleTab===id?"active":""}" data-vehicle-tab="${id}">${label}</button>`).join("")}
    </div>

    ${content}`;
}

function fusionGroups(){
  const groups=new Map();
  for(const row of state.userAliases.filter(x=>x.tipo==="fusao" && x.grupo_id)){
    if(!groups.has(row.grupo_id)) groups.set(row.grupo_id,{id:row.grupo_id,destination:row.produto_canonico,sources:[]});
    groups.get(row.grupo_id).sources.push(row.alias);
  }
  return [...groups.values()];
}

async function mergeProducts(sourceA, sourceB, finalName){
  const a=norm(sourceA), b=norm(sourceB), dest=norm(finalName);
  if(!a || !b || !dest){alert("Escolha dois produtos e informe o nome final.");return;}
  if(searchNorm(a)===searchNorm(b)){alert("Escolha dois produtos diferentes.");return;}

  const pA=state.products.find(p=>searchNorm(p.name)===searchNorm(a));
  const pB=state.products.find(p=>searchNorm(p.name)===searchNorm(b));
  if(!pA || !pB){alert("Escolha produtos existentes na biblioteca.");return;}

  const groupId=crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const rows=[a,b].map(alias=>({
    user_id:state.session.user.id,
    alias,
    produto_canonico:dest,
    tipo:"fusao",
    grupo_id:groupId
  }));

  const {data,error}=await supabase.from("produto_alias_usuario")
    .upsert(rows,{onConflict:"user_id,alias"})
    .select("id,user_id,alias,produto_canonico,tipo,grupo_id,criado_em");
  if(error){alert("Erro ao fundir produtos: "+error.message);return;}

  for(const row of data||[]){
    const idx=state.userAliases.findIndex(x=>searchNorm(x.alias)===searchNorm(row.alias));
    if(idx>=0) state.userAliases[idx]=row; else state.userAliases.unshift(row);
    state.aliases.set(norm(row.alias),norm(row.produto_canonico));
  }

  buildProducts();
  render();
}

async function undoFusion(groupId){
  const group=fusionGroups().find(g=>g.id===groupId);
  if(!group) return;
  if(!confirm(`Desfazer a fusão ${group.sources.join(" + ")} → ${group.destination}?`)) return;

  const {error}=await supabase.from("produto_alias_usuario").delete().eq("grupo_id",groupId).eq("user_id",state.session.user.id);
  if(error){alert("Erro ao desfazer fusão: "+error.message);return;}

  const removed=state.userAliases.filter(x=>x.grupo_id===groupId);
  state.userAliases=state.userAliases.filter(x=>x.grupo_id!==groupId);
  for(const row of removed) state.aliases.delete(norm(row.alias));

  // Se o nome final foi criado apenas para a fusão e não existe em nenhuma nota,
  // remove o cadastro vazio para não deixar um card fantasma.
  const rawExists=state.itens.some(i=>searchNorm(i.produto)===searchNorm(group.destination));
  if(!rawExists){
    const destRow=state.productRows.find(r=>searchNorm(r.nome)===searchNorm(group.destination));
    if(destRow){
      const del=await supabase.from("produtos").delete().eq("id",destRow.id);
      if(!del.error) state.productRows=state.productRows.filter(r=>r.id!==destRow.id);
    }
  }

  // Reconstroi aliases globais + pessoais restantes para preservar aliases normais.
  const globalRes=await supabase.from("produtos_alias").select("alias,produto_canonico");
  state.aliases=new Map((globalRes.data||[]).map(x=>[norm(x.alias),norm(x.produto_canonico)]));
  for(const x of state.userAliases) state.aliases.set(norm(x.alias),norm(x.produto_canonico));
  buildProducts();
  render();
}

async function addUserAlias(aliasName, canonicalName){
  const alias=norm(aliasName), canonical=norm(canonicalName);
  if(!alias || !canonical){alert("Informe o nome da nota e o produto correto.");return;}
  if(searchNorm(alias)===searchNorm(canonical)){alert("O alias e o produto correto não podem ser iguais.");return;}

  const {data,error}=await supabase.from("produto_alias_usuario")
    .upsert({
      user_id:state.session.user.id,
      alias,
      produto_canonico:canonical,
      tipo:"alias",
      grupo_id:null
    },{onConflict:"user_id,alias"})
    .select("id,user_id,alias,produto_canonico,tipo,grupo_id,criado_em")
    .single();

  if(error){alert("Erro ao salvar alias: "+error.message);return;}

  const i=state.userAliases.findIndex(x=>searchNorm(x.alias)===searchNorm(alias));
  if(i>=0) state.userAliases[i]=data; else state.userAliases.unshift(data);
  state.aliases.set(norm(data.alias),norm(data.produto_canonico));
  buildProducts();
  render();
}

async function deleteUserAlias(id){
  const row=state.userAliases.find(x=>x.id===id);
  const {error}=await supabase.from("produto_alias_usuario").delete().eq("id",id);
  if(error){alert("Erro ao excluir alias: "+error.message);return;}
  state.userAliases=state.userAliases.filter(x=>x.id!==id);
  if(row) state.aliases.delete(norm(row.alias));
  buildProducts();
  render();
}

function purchaseHistoryMore(){
  const q=searchNorm(state.moreSearch);
  const selected=state.selectedMonth || new Date().toISOString().slice(0,7);

  const monthNotes=state.notas.filter(n=>noteMonthKey(n)===selected);

  const filtered=monthNotes.filter(n=>{
    if(!q) return true;
    return searchNorm(`${n.nome_estabelecimento||""} ${n.chave||""} ${formatDate(n.data_emissao)}`).includes(q);
  });

  const itemMap=new Map();
  for(const item of state.itens){
    const k=String(item.nota_id);
    if(!itemMap.has(k)) itemMap.set(k,[]);
    itemMap.get(k).push(item);
  }

  const monthTotal=monthNotes.reduce((s,n)=>s+num(n.valor_total),0);

  return `
    <button class="more-back" data-more-back>‹ Voltar</button>
    <section class="section">
      <div class="section-head">
        <div>
          <div class="section-title">🧾 Histórico de compras</div>
          <div class="section-note">${monthNotes.length} notas • ${money(monthTotal)}</div>
        </div>
        ${monthSelectorHTML("history-month-selector")}
      </div>
      <input class="more-search" id="more-search" value="${escapeHtml(state.moreSearch)}" placeholder="Buscar loja, data ou chave">
      <div class="more-grid">
        ${filtered.map(n=>{
          const items=itemMap.get(String(n.id))||[];
          const open=String(state.moreNoteId||"")===String(n.id);
          return `<article class="more-card">
            <button class="more-card" style="padding:0;border:0;background:transparent" data-more-note="${n.id}">
              <div class="more-card-top">
                <div><div class="more-card-title">${escapeHtml(n.nome_estabelecimento||"Estabelecimento")}</div><div class="more-card-sub">${formatDate(n.data_emissao)} • ${items.length} itens</div></div>
                <div class="more-card-value">${money(n.valor_total)}</div>
              </div>
            </button>
            ${open?`<div class="purchase-items">${items.map(i=>`<div class="purchase-item"><div>${escapeHtml(i.produto)}<small>${num(i.quantidade)} ${escapeHtml(i.unidade||"")} × ${money(i.preco_unitario)}</small></div><strong>${money(i.valor_total)}</strong></div>`).join("")}<div class="purchase-item"><div><b>Chave</b><small>${escapeHtml(n.chave||"—")}</small></div></div></div>`:""}
          </article>`;
        }).join("") || `<div class="vehicle-empty">Nenhuma compra encontrada em ${escapeHtml(monthLabel(selected))}.</div>`}
      </div>
    </section>`;
}
function smartProductsMore(){
  const productOptions=state.products.slice().sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
  const normalAliases=state.userAliases.filter(x=>x.tipo!=="fusao");
  const fusions=fusionGroups();
  return `
    <button class="more-back" data-more-back>‹ Voltar</button>
    <section class="section">
      <div class="section-head"><div class="section-title">🧠 Produtos inteligentes</div><div class="section-note">corrigir + fundir + desfazer</div></div>
      <p class="vehicle-subtle">A nota original nunca é alterada. O Prisma só decide como aqueles nomes devem aparecer e ser analisados dentro do aplicativo.</p>

      <div class="fusion-box">
        <div class="section-title">🔗 Fundir dois produtos</div>
        <div class="vehicle-subtle" style="margin-top:4px">Escolha dois produtos e já defina o nome final. Histórico, preços e previsão passam a ser analisados juntos.</div>
        <form id="fusion-form" class="vehicle-form" style="margin-top:10px">
          <div class="fusion-grid">
            <div class="vehicle-field"><label>Produto A</label><select id="fusion-a" required><option value="">Selecione</option>${productOptions.map(p=>`<option>${escapeHtml(p.name)}</option>`).join("")}</select></div>
            <div class="vehicle-field"><label>Produto B</label><select id="fusion-b" required><option value="">Selecione</option>${productOptions.map(p=>`<option>${escapeHtml(p.name)}</option>`).join("")}</select></div>
          </div>
          <div class="vehicle-field"><label>Nome final</label><input id="fusion-name" placeholder="Ex.: OVOS" required></div>
          <button class="primary" type="submit">Fundir e renomear</button>
        </form>
      </div>

      <div class="fusion-box">
        <div class="section-title">✏️ Corrigir um nome da nota</div>
        <form id="alias-form" class="vehicle-form" style="margin-top:10px">
          <div class="vehicle-field"><label>Nome que vem na nota</label><input id="alias-name" placeholder="Ex.: LTE INT 1L" required></div>
          <div class="vehicle-field"><label>Nome que o Prisma deve usar</label><input id="alias-canonical" list="canonical-products" placeholder="Ex.: LEITE INTEGRAL 1L" required></div>
          <datalist id="canonical-products">${productOptions.map(p=>`<option value="${escapeHtml(p.name)}">`).join("")}</datalist>
          <button class="primary" type="submit">Salvar correção</button>
        </form>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Fusões feitas</div><div class="section-note">${fusions.length}</div></div>
      <div class="fusion-list">${fusions.length?fusions.map(g=>`<article class="fusion-card"><div class="fusion-title">${escapeHtml(g.destination)}</div><div class="fusion-meta">${g.sources.map(escapeHtml).join(" + ")}</div><button class="vehicle-delete" data-fusion-undo="${g.id}">Desfazer fusão</button></article>`).join(""):`<div class="vehicle-empty">Nenhuma fusão feita.</div>`}</div>
    </section>

    <section class="section">
      <div class="section-head"><div class="section-title">Correções de nome</div><div class="section-note">${normalAliases.length}</div></div>
      ${normalAliases.length?normalAliases.map(a=>`<div class="alias-row"><span>${escapeHtml(a.alias)}</span><span class="alias-arrow">→</span><b>${escapeHtml(a.produto_canonico)}</b><button class="wish-delete" data-alias-delete="${a.id}">×</button></div>`).join(""):`<div class="vehicle-empty">Nenhuma correção manual ainda.</div>`}
    </section>`;
}

function establishmentsMore(){
  const map=new Map();
  for(const n of state.notas){
    const name=norm(n.nome_estabelecimento)||"Sem nome";
    if(!map.has(name)) map.set(name,{name,total:0,count:0,last:null});
    const x=map.get(name);
    x.total+=num(n.valor_total);
    x.count++;
    if(!x.last || new Date(n.data_emissao)>new Date(x.last)) x.last=n.data_emissao;
  }
  const rows=[...map.values()].sort((a,b)=>b.total-a.total);
  const max=rows[0]?.total||1;
  const total=rows.reduce((sum,x)=>sum+x.total,0);

  return `
    <button class="more-back" data-more-back>‹ Voltar</button>
    <section class="section">
      <div class="section-head"><div class="section-title">🏪 Estabelecimentos</div><div class="section-note">${rows.length} locais • ${money(total)}</div></div>
      <div class="more-grid">
        ${rows.map(x=>`<article class="more-card">
          <div class="more-card-top">
            <div><div class="more-card-title">${escapeHtml(x.name)}</div><div class="more-card-sub">${x.count} compras • última ${formatDate(x.last)} • ticket médio ${money(x.total/x.count)}</div></div>
            <div class="more-card-value">${money(x.total)}</div>
          </div>
          <div class="store-bar"><i style="width:${Math.max(3,Math.min(100,x.total/max*100))}%"></i></div>
        </article>`).join("") || `<div class="vehicle-empty">Nenhum estabelecimento ainda.</div>`}
      </div>
    </section>`;
}

function settingsMore(){
  const email=state.session?.user?.email||"";
  const autoFuel=state.fuelings.filter(x=>x.origem_automatica).length;
  return `
    <button class="more-back" data-more-back>‹ Voltar</button>
    <section class="section">
      <div class="section-head"><div class="section-title">⚙️ Configurações</div><div class="section-note">Prisma</div></div>
      <div class="settings-row"><div><b>Conta</b><span>${escapeHtml(email)}</span></div><button class="settings-action" id="settings-logout">Sair</button></div>
      <div class="settings-row"><div><b>Atualizar dados agora</b><span>Notas, produtos, lista, desejos e veículo</span></div><button class="settings-action" id="settings-refresh">Atualizar</button></div>
      <div class="settings-row"><div><b>Notas de combustível</b><span>${autoFuel} abastecimentos importados automaticamente</span></div><button class="settings-action" id="settings-fuel-sync">Sincronizar</button></div>
      <div class="settings-row"><div><b>Dados carregados</b><span>${state.notas.length} notas • ${state.products.length} produtos • ${state.maintenances.length} manutenções</span></div></div>
      <div class="settings-row"><div><b>Prisma</b><span>Compras + Produtos + Lista + Reposição + Veículo + Scanner</span></div><strong>v1.0</strong></div>
    </section>`;
}

function more(){
  subtitle.textContent="Mais";

  if(state.moreSection==="history") return purchaseHistoryMore();
  if(state.moreSection==="smart") return smartProductsMore();
  if(state.moreSection==="stores") return establishmentsMore();
  if(state.moreSection==="settings") return settingsMore();

  const items=[
    ["history","🧾","Histórico de compras","Abra qualquer nota e veja os itens"],
    ["smart","🧠","Produtos inteligentes","Corrija abreviações e nomes da nota"],
    ["stores","🏪","Estabelecimentos","Totais, quantidade e ticket médio"],
    ["settings","⚙️","Configurações","Conta, sincronização e dados do Prisma"]
  ];

  return `${wishlistSection()}
    <section class="section">
      <div class="section-head"><div class="section-title">Mais ferramentas</div><div class="section-note">tudo funcional</div></div>
      <div class="menu-list">
        ${items.map(i=>`<button class="menu-item" data-more-section="${i[0]}"><div><div class="menu-title">${i[1]} ${i[2]}</div><div class="menu-sub">${i[3]}</div></div><span>›</span></button>`).join("")}
      </div>
    </section>`;
}

function bindView(){

  document.querySelectorAll("[data-toggle-maint]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id=btn.dataset.toggleMaint;
      state.expandedMaintenanceId=String(state.expandedMaintenanceId||"")===String(id)?null:id;
      render();
    });
  });
  document.querySelectorAll("[data-toggle-fueling]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id=btn.dataset.toggleFueling;
      state.expandedFuelingId=String(state.expandedFuelingId||"")===String(id)?null:id;
      render();
    });
  });
  document.querySelectorAll("[data-toggle-reminder]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id=btn.dataset.toggleReminder;
      state.expandedReminderId=String(state.expandedReminderId||"")===String(id)?null:id;
      render();
    });
  });
  document.querySelectorAll("[data-toggle-obd]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const id=btn.dataset.toggleObd;
      state.expandedObdId=String(state.expandedObdId||"")===String(id)?null:id;
      render();
    });
  });
  document.querySelectorAll("[data-toggle-vehicle-form]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const key=btn.dataset.toggleVehicleForm;
      if(!(key in state.vehicleFormOpen)) return;
      state.vehicleFormOpen[key]=!state.vehicleFormOpen[key];
      render();
    });
  });


  document.querySelectorAll("[data-more-section]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.moreSection=btn.dataset.moreSection;
      state.moreNoteId=null;
      state.moreSearch="";
      render();
    });
  });

  document.querySelector("[data-more-back]")?.addEventListener("click",()=>{
    state.moreSection="main";
    state.moreNoteId=null;
    state.moreSearch="";
    render();
  });

  const moreSearch=document.querySelector("#more-search");
  if(moreSearch){
    let moreTimer;
    moreSearch.addEventListener("input",()=>{
      state.moreSearch=moreSearch.value;
      const pos=moreSearch.selectionStart ?? state.moreSearch.length;
      clearTimeout(moreTimer);
      moreTimer=setTimeout(()=>{
        render();
        const next=document.querySelector("#more-search");
        if(next){next.focus();try{next.setSelectionRange(pos,pos);}catch(e){}}
      },100);
    });
  }

  document.querySelectorAll("[data-more-note]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.moreNoteId=String(state.moreNoteId||"")===String(btn.dataset.moreNote) ? null : btn.dataset.moreNote;
      render();
    });
  });

  document.querySelector("#fusion-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    await mergeProducts(
      document.querySelector("#fusion-a").value,
      document.querySelector("#fusion-b").value,
      document.querySelector("#fusion-name").value
    );
  });

  document.querySelectorAll("[data-fusion-undo]").forEach(btn=>{
    btn.addEventListener("click",()=>undoFusion(btn.dataset.fusionUndo));
  });

  document.querySelector("#alias-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    await addUserAlias(
      document.querySelector("#alias-name").value,
      document.querySelector("#alias-canonical").value
    );
  });

  document.querySelectorAll("[data-alias-delete]").forEach(btn=>{
    btn.addEventListener("click",()=>deleteUserAlias(btn.dataset.aliasDelete));
  });

  document.querySelector("#settings-refresh")?.addEventListener("click",async()=>{
    await loadData();
  });

  document.querySelector("#settings-logout")?.addEventListener("click",logout);

  document.querySelector("#settings-fuel-sync")?.addEventListener("click",async()=>{
    try{
      const qty=await syncFuelNotesFromPurchases();
      await refreshFuelings();
      alert(qty ? `${qty} abastecimento(s) importado(s) das notas.` : "Nenhuma nota nova de combustível para importar.");
      render();
    }catch(err){
      alert("Erro ao sincronizar combustível: "+(err?.message||String(err)));
    }
  });

  document.querySelectorAll("[data-complete-fueling]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const item=state.fuelings.find(x=>String(x.id)===String(btn.dataset.completeFueling));
      if(item) completeImportedFueling(item);
    });
  });


  document.querySelectorAll("[data-vehicle-tab]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      state.vehicleTab=btn.dataset.vehicleTab;
      render();
    });
  });

  document.querySelector("#vehicle-edit-toggle")?.addEventListener("click",()=>{
    const f=document.querySelector("#vehicle-profile-form");
    if(f) f.style.display=f.style.display==="none"?"grid":"none";
  });

  document.querySelector("#vehicle-profile-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    await saveVehicleProfile();
  });

  document.querySelector("#vehicle-fuel-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    await addFuelingFromForm();
  });

  document.querySelector("#vehicle-maint-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    await addMaintenanceFromForm();
  });

  document.querySelector("#vehicle-reminder-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    await addReminderFromForm();
  });

  document.querySelector("#vehicle-obd-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    await addObdFromForm();
  });

  document.querySelector("#vehicle-wish-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    const value=parseDecimal(document.querySelector("#vw-value").value);
    await addWishlistItem({
      name:document.querySelector("#vw-name").value,
      value:value && value>0 ? value : null,
      category:"Carro",
      priority:document.querySelector("#vw-priority").value,
      note:document.querySelector("#vw-note").value
    });
  });

  document.querySelectorAll("[data-delete-fueling]").forEach(btn=>{
    btn.addEventListener("click",()=>deleteVehicleRow("veiculo_abastecimentos",btn.dataset.deleteFueling));
  });
  document.querySelectorAll("[data-delete-maint]").forEach(btn=>{
    btn.addEventListener("click",()=>deleteVehicleRow("veiculo_manutencoes",btn.dataset.deleteMaint));
  });
  document.querySelectorAll("[data-delete-reminder]").forEach(btn=>{
    btn.addEventListener("click",()=>deleteVehicleRow("veiculo_lembretes",btn.dataset.deleteReminder));
  });
  document.querySelectorAll("[data-delete-obd]").forEach(btn=>{
    btn.addEventListener("click",()=>deleteVehicleRow("veiculo_obd_sessoes",btn.dataset.deleteObd));
  });


  const wishForm=document.querySelector("#wish-form");
  if(wishForm){
    wishForm.addEventListener("submit",async e=>{
      e.preventDefault();
      const valueText=document.querySelector("#wish-value").value.trim().replace(",",".");
      const value=valueText ? Number(valueText) : null;
      await addWishlistItem({
        name:document.querySelector("#wish-name").value,
        value:Number.isFinite(value)?value:null,
        category:document.querySelector("#wish-category").value.trim() || null,
        priority:document.querySelector("#wish-priority").value,
        note:document.querySelector("#wish-note").value.trim()
      });
    });
  }

  document.querySelectorAll("[data-wish-status]").forEach(btn=>{
    btn.addEventListener("click",()=>updateWishlistItem(btn.dataset.wishId,{status:btn.dataset.wishStatus}));
  });
  document.querySelectorAll("[data-wish-delete]").forEach(btn=>{
    btn.addEventListener("click",()=>deleteWishlistItem(btn.dataset.wishDelete));
  });

  const marketToggle=document.querySelector("#market-mode-toggle");
  if(marketToggle){
    const toggleMarket=(ev)=>{
      if(ev?.type==="pointerup" && ev.pointerType==="mouse") return;
      if(ev?.type==="click" && marketToggle.dataset.touchHandled==="1"){
        marketToggle.dataset.touchHandled="0";
        return;
      }
      if(ev?.type==="pointerup"){
        marketToggle.dataset.touchHandled="1";
        ev.preventDefault();
      }
      state.marketMode=!state.marketMode;
      render();
    };
    marketToggle.addEventListener("pointerup",toggleMarket,{passive:false});
    marketToggle.addEventListener("click",toggleMarket);
  }


  document.querySelector("#retry-list")?.addEventListener("click",async()=>{
    state.listLoaded = false;
    await openListPage();
  });


  const listSearch=document.querySelector("#list-search");
  if(listSearch){
    let timer;
    listSearch.addEventListener("input",()=>{
      state.listSearch=listSearch.value;
      const pos=listSearch.selectionStart ?? state.listSearch.length;
      clearTimeout(timer);
      timer=setTimeout(()=>{
        render();
        const next=document.querySelector("#list-search");
        if(next){
          next.focus();
          try{ next.setSelectionRange(pos,pos); }catch(e){}
        }
      },120);
    });
  }

  document.querySelectorAll("[data-add-list]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      const p=state.products.find(x=>String(x.id)===String(btn.dataset.addList));
      if(p) await addProductToList(p);
    });
  });

  document.querySelectorAll("[data-add-custom-list]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      await addCustomItemToList(
        btn.dataset.addCustomList,
        btn.dataset.customUnit
      );
    });
  });

  document.querySelectorAll("[data-link-manual-item]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      const item=state.listItems.find(x=>String(x.id)===String(btn.dataset.linkManualItem));
      const product=state.products.find(x=>String(x.id)===String(btn.dataset.linkProduct));
      if(item && product) await linkManualListItem(item,product);
    });
  });

  document.querySelectorAll("[data-check]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      const item=state.listItems.find(x=>x.id===btn.dataset.check);
      if(item) await updateListItem(item.id,{no_carrinho:!item.no_carrinho});
    });
  });

  document.querySelectorAll("[data-minus]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      const item=state.listItems.find(x=>x.id===btn.dataset.minus);
      if(item) await updateListItem(item.id,{quantidade:Math.max(1,num(item.quantidade||1)-1)});
    });
  });
  document.querySelectorAll("[data-plus]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      const item=state.listItems.find(x=>x.id===btn.dataset.plus);
      if(item) await updateListItem(item.id,{quantidade:num(item.quantidade||1)+1});
    });
  });

  document.querySelectorAll("[data-price]").forEach(inp=>{
    inp.addEventListener("change",async()=>{
      const v=Number(inp.value.replace(",","."));
      await updateListItem(inp.dataset.price,{preco_atual:Number.isFinite(v)&&v>0?v:null});
    });
  });

  document.querySelectorAll("[data-weight]").forEach(inp=>{
    inp.addEventListener("change",async()=>{
      const v=Number(inp.value.replace(",","."));
      await updateListItem(inp.dataset.weight,{peso_kg:Number.isFinite(v)&&v>0?v:null});
    });
  });

  document.querySelectorAll("[data-remove]").forEach(btn=>{
    btn.addEventListener("click",async()=>{
      await deleteListItem(btn.dataset.remove);
    });
  });

  document.querySelectorAll("[data-upload-product]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      await chooseProductImage(btn.dataset.uploadProduct,"camera");
    });
  });


  document.querySelectorAll("[data-ignore-replenishment]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const p=state.products.find(x=>String(x.id)===String(btn.dataset.ignoreReplenishment));
      if(!p) return;
      if(confirm(`Parar de mostrar "${replenishmentFamily(p)}" em "Pode estar acabando"?`)){
        await setFamilyMonitoring(p,false);
      }
    });
  });

  const loginForm=document.querySelector("#login-form");
  if(loginForm){
    loginForm.addEventListener("submit",async e=>{
      e.preventDefault();
      const msg=document.querySelector("#auth-msg");
      msg.textContent="Entrando…";
      const err=await login(
        document.querySelector("#login-email").value.trim(),
        document.querySelector("#login-password").value
      );
      msg.textContent=err ? err.message : "";
    });
    return;
  }

  document.querySelectorAll("[data-collapse]").forEach(btn=>{
    btn.addEventListener("click",()=>btn.closest(".collapse").classList.toggle("open"));
  });


  ["#home-month-selector","#history-month-selector"].forEach(sel=>{
    document.querySelector(sel)?.addEventListener("change",e=>{
      state.selectedMonth=e.target.value;
      state.moreNoteId=null;
      render();
    });
  });

  document.querySelectorAll("[data-product]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const p=state.products.find(x=>String(x.id)===String(btn.dataset.product));
      if(p) openProduct(p);
    });
  });

  document.querySelectorAll("[data-filter]").forEach(btn=>{
    btn.addEventListener("click",()=>{state.productFilter=btn.dataset.filter;render();});
  });

  const search=document.querySelector("#product-search");
  if(search) search.addEventListener("input",()=>{
    const q=search.value.trim();
    document.querySelectorAll(".product-card").forEach(card=>{
      const p=state.products.find(x=>String(x.id)===String(card.dataset.product));
      card.style.display=(p && smartMatch(p,q)) ? "" : "none";
    });
  });

  const gas=document.querySelector("#gas"), eth=document.querySelector("#eth");
  if(gas && eth){
    let flexTimer;
    const onFlexInput=()=>{
      updateFlex();
      clearTimeout(flexTimer);
      flexTimer=setTimeout(()=>saveFlexPrices(),500);
    };
    gas.addEventListener("input",onFlexInput);
    eth.addEventListener("input",onFlexInput);
    gas.addEventListener("change",saveFlexPrices);
    eth.addEventListener("change",saveFlexPrices);
    updateFlex();
  }

}

function updateFlex(){
  const gas=Number(document.querySelector("#gas")?.value), eth=Number(document.querySelector("#eth")?.value), out=document.querySelector("#flex-result");
  if(!out) return;
  if(!(gas>0&&eth>0)){out.innerHTML="<span>Informe os dois preços.</span>";return}
  const ratio=eth/gas*100, limit=gas*.70;
  const etanol=eth<=limit;
  out.innerHTML=`<span class="eyebrow">Resultado agora</span><strong>${etanol?"ETANOL COMPENSA":"GASOLINA COMPENSA"}</strong><span class="card-sub">Etanol está em ${ratio.toFixed(1).replace(".",",")}% do preço da gasolina. Limite de 70%: ${money(limit)}.</span>`;
}




async function deleteLibraryProduct(product){
  if(!product) return;

  if((product.history||[]).length>0){
    alert(
      "Esse produto possui histórico real vindo de nota fiscal.\\n\\n" +
      "O Prisma protege esse histórico e não permite apagar o produto por aqui. " +
      "Você ainda pode alterar nome/fusão, categoria, família, imagem e monitoramento."
    );
    return;
  }

  const row=state.productRows.find(r=>String(r.id)===String(product.id))
    || state.productRows.find(r=>searchNorm(r.nome)===searchNorm(product.name));

  if(!row){
    alert("Esse produto não possui um cadastro independente para excluir.");
    return;
  }

  const ok=confirm(
    `Excluir "${product.name}" do Prisma?\\n\\n` +
    "Ele não possui histórico de nota fiscal. Esta ação remove o cadastro da biblioteca."
  );
  if(!ok) return;

  const {error}=await supabase.from("produtos").delete().eq("id",row.id);
  if(error){
    alert("Não foi possível excluir o produto: "+error.message);
    return;
  }

  state.productRows=state.productRows.filter(r=>String(r.id)!==String(row.id));
  buildProducts();
  closeProduct();
  render();
}

function openProduct(p){
  backdrop.classList.remove("hidden");
  sheet.classList.remove("hidden");
  const arrow=p.delta<0?"↓":"↑", cls=p.delta<0?"down":"up";
  const history=p.history.slice(-8);
  const chart=history.length>1
    ? chartHTML(history.map(x=>num(x.preco_unitario)), history.map(x=>formatDate(x.date).slice(0,5)))
    : `<div class="card-sub">Ainda há apenas um registro de preço.</div>`;

  sheet.innerHTML=`
    <div class="sheet-handle"></div>
    <div class="sheet-head">
      ${photoMarkup(p, "sheet-photo")}
      <div>
        <div class="sheet-title">${escapeHtml(p.name)}</div>
        <div class="sheet-price">${p.price>0 ? money(p.price) + (p.unit?.toUpperCase()==="KG"?"/kg":"") : "Sem preço recente"}</div>
        <span class="delta ${cls}">${p.history.length>1 ? `${arrow} ${Math.abs(p.delta).toFixed(1).replace(".",",")}%` : "novo"}</span>
        <div class="image-note">${p.imageUrl ? "Imagem do produto disponível." : "Sem imagem ainda — usa emoji como fallback."}</div>
      </div>
      <button class="sheet-close" data-close>✕</button>
    </div>
    <div class="stats">
      <div class="stat"><span>Último</span><b>${p.price>0 ? money(p.price) : "—"}</b></div>
      <div class="stat"><span>Média</span><b>${p.avg>0 ? money(p.avg) : "—"}</b></div>
      <div class="stat"><span>Menor</span><b>${p.min>0 ? money(p.min) : "—"}</b></div>
      <div class="stat"><span>Maior</span><b>${p.max>0 ? money(p.max) : "—"}</b></div>
    </div>
    <div class="card-sub" style="margin-bottom:8px">${formatDate(p.latestDate)} • ${escapeHtml(String(p.latestStore).toUpperCase())} • ${escapeHtml(p.unit||"")}</div>
    ${chart}
    <div class="sheet-actions">
      <button class="secondary" id="sheet-category">🏷️ Categoria: ${p.category}${p.categoryManual ? " • manual" : " • automática"}</button>
      <button class="secondary" id="sheet-camera-image">📷 Tirar foto</button>
      <button class="secondary" id="sheet-upload-image">🖼️ ${p.imageUrl ? "Galeria / trocar" : "Escolher da galeria"}</button>
<button class="secondary" id="sheet-family">🔗 Família: ${escapeHtml(replenishmentFamily(p))}</button>
      <button class="secondary" id="sheet-monitor-replenishment">${p.monitorReplenishment === false ? "🔕 Não monitorado" : "🔔 Monitorar reposição"}</button>
      <button class="secondary" id="sheet-add-wishlist">❤️ Comprar depois</button>
      <button class="primary full" id="sheet-add-list">🛒 Adicionar à lista</button>
      <button class="danger-product full" id="sheet-delete-product">🗑 Excluir produto</button>
    </div>`;

  sheet.querySelector("[data-close]").addEventListener("click",closeProduct);
  sheet.querySelector("#sheet-add-list")?.addEventListener("click",()=>addProductToList(p));
  sheet.querySelector("#sheet-add-wishlist")?.addEventListener("click",()=>addProductToWishlist(p));
  sheet.querySelector("#sheet-camera-image")?.addEventListener("click",()=>chooseProductImage(p,"camera"));
  sheet.querySelector("#sheet-upload-image")?.addEventListener("click",()=>chooseProductImage(p,"gallery"));
  sheet.querySelector("#sheet-category")?.addEventListener("click",()=>changeProductCategory(p));
  sheet.querySelector("#sheet-family")?.addEventListener("click",()=>changeReplenishmentFamily(p));
  sheet.querySelector("#sheet-monitor-replenishment")?.addEventListener("click",()=>setFamilyMonitoring(p,p.monitorReplenishment === false));
  sheet.querySelector("#sheet-delete-product")?.addEventListener("click",()=>deleteLibraryProduct(p));
}
function closeProduct(){backdrop.classList.add("hidden");sheet.classList.add("hidden");}
backdrop.addEventListener("click",closeProduct);

navButtons.forEach(btn=>btn.addEventListener("click",async()=>{
  if(!state.session && configured) return;

  window.scrollTo({top:0,behavior:"smooth"});

  if(btn.dataset.page === "list"){
    await openListPage();
    return;
  }

  if(btn.dataset.page === "fuel"){
    state.page="fuel";

    if(state.vehicleLoaded || state.vehicle){
      render();
      if(!state.vehicleLoaded) queueBackgroundPreload();
      return;
    }

    if(state.vehicleLoading){
      render();
      return;
    }

    state.vehicleLoading=true;
    render();
    try{
      await loadVehicleData();
      state.vehicleLoaded=true;
    }catch(err){
      state.vehicleError=err?.message||String(err);
      state.vehicleLoading=false;
    }
    render();
    return;
  }

  if(btn.dataset.page === "more"){
    state.page = "more";
    state.moreSection = "main";
    state.moreNoteId = null;
    state.moreSearch = "";
    render();
    return;
  }

  state.page = btn.dataset.page;
  render();
}));

init();
