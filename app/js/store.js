/* Traks — Stato, salvataggio sul dispositivo e migrazioni */
/* ---------- dati ---------- */
const KEY = 'traks.v1';
let storageOk = true;
function load(){ try{ const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; }catch(e){ storageOk = false; return null; } }
let S = load() || {};
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); storageOk = true; }catch(e){ storageOk = false; } }
let saveT; function saveSoon(){ clearTimeout(saveT); saveT = setTimeout(save, 300); }

function v1Routines(){
  return PROGRAM_V1.map(p => ({id:p.id, name:p.name, focus:p.focus, cardio:p.cardio ? 15 : 0, cardioNote:p.cardio ? 'Camminata in salita' : '', rot:true,
    items:p.ex.map(e => ({ex:e.id, s:e.s, r:e.r.slice(), rir:e.rir || '', rest:e.main ? 180 : e.bw ? 60 : 120, main:!!e.main, inc:e.inc ? num(e.inc) : 0, note:e.note || '', ss:!!e.ss}))}));
}
/* modelli di partenza per chi installa l'app da zero */
const T_ = (ex, s, r0, r1, rir, o) => Object.assign({ex, s, r:[r0, r1], rir:rir || '', rest:0, main:false, inc:0, note:'', ss:false}, o || {});
const TEMPLATES = [
  {id:'ul', n:'Upper / Lower', d:'4 giorni, alterna parte alta e gambe', r:() => v1Routines().map(r => Object.assign(r, {id:uid()}))},
  {id:'ppl', n:'Push Pull Legs', d:'3 o 6 giorni, spinta, tirata, gambe', r:() => [
    {name:'Push', focus:'Petto, spalle, tricipiti', items:[T_('panca-piana', 4, 5, 8, '1-2', {main:true}), T_('shoulder-manubri', 3, 8, 10, '1-2'), T_('inclinata-30', 3, 8, 12, '1-2'), T_('alzate-cavo', 3, 12, 15, '0-1'), T_('pushdown-corda', 3, 10, 12, '0-1', {ss:true}), T_('overhead-cavo', 3, 10, 12, '0-1')]},
    {name:'Pull', focus:'Dorso, bicipiti', items:[T_('trazioni-cl', 4, 5, 8, '1-2', {main:true}), T_('rematore-bil', 3, 6, 10, '1-2'), T_('lat-stretta', 3, 8, 12, '1-2'), T_('face-pull', 3, 12, 15, '0-1'), T_('curl-ez', 3, 8, 12, '0-1', {ss:true}), T_('hammer', 3, 10, 12, '0-1')]},
    {name:'Legs', focus:'Quadricipiti, femorali, polpacci', items:[T_('squat', 4, 5, 8, '1-2', {main:true}), T_('rdl-bil', 3, 6, 10, '1-2'), T_('leg-press', 3, 10, 12, '1-2'), T_('curl-sdraiato', 3, 10, 12, '0-1'), T_('calf-piedi', 4, 10, 15, '0-1'), T_('plank', 3, 30, 60)]}]},
  {id:'fb', n:'Full body', d:'3 giorni, tutto il corpo ogni volta', r:() => [
    {name:'Full A', focus:'Squat e panca', items:[T_('squat', 3, 5, 8, '1-2', {main:true}), T_('panca-piana', 3, 5, 8, '1-2', {main:true}), T_('rematore-manubrio', 3, 8, 12, '1-2'), T_('alzate-manubri', 3, 12, 15, '0-1'), T_('crunch-cavo', 3, 10, 15)]},
    {name:'Full B', focus:'Stacco e military', items:[T_('stacco', 3, 3, 6, '2', {main:true}), T_('military', 3, 6, 8, '1-2', {main:true}), T_('lat-prona', 3, 8, 12, '1-2'), T_('affondi', 3, 8, 12, '1-2'), T_('curl-manubri', 3, 10, 12, '0-1')]},
    {name:'Full C', focus:'Leg press e panca inclinata', items:[T_('leg-press', 3, 8, 12, '1-2', {main:true}), T_('inclinata-30', 3, 8, 10, '1-2'), T_('pulley', 3, 8, 12, '1-2'), T_('curl-seduto', 3, 10, 12, '0-1'), T_('pushdown', 3, 10, 12, '0-1')]}]},
  {id:'beg', n:'Principiante', d:'2 giorni, macchine e movimenti base', r:() => [
    {name:'Giorno 1', focus:'Base', items:[T_('leg-press', 3, 10, 12, '2-3'), T_('chest-press', 3, 10, 12, '2-3'), T_('lat-prona', 3, 10, 12, '2-3'), T_('shoulder', 2, 10, 12, '2-3'), T_('plank', 3, 20, 40)]},
    {name:'Giorno 2', focus:'Base', items:[T_('goblet', 3, 10, 12, '2-3'), T_('row-macchina', 3, 10, 12, '2-3'), T_('panca-manubri', 3, 10, 12, '2-3'), T_('curl-seduto', 2, 10, 12, '2-3'), T_('crunch', 3, 12, 20)]}]}
];
function applyTemplate(id){
  const t = TEMPLATES.find(x => x.id === id); if (!t) return;
  const list = t.r().map(r => Object.assign({id:uid(), focus:'', cardio:0, cardioNote:'', rot:true}, r, r.id ? {} : {id:uid()}));
  S.routines.push(...list); S.onboard = false; save();
}
function v1Session(s){
  const r = S.routines.find(x => x.id === s.day);
  const items = r ? clone(r.items) : Object.keys(s.sets || {}).map(id => newItem(id));
  return {id:s.id || uid(), rid:r ? r.id : null, name:r ? r.name : String(s.day || 'Allenamento'), focus:r ? r.focus : '', date:s.date, start:s.start || s.date, dur:s.dur || 0,
    items, sets:s.sets || {}, cardio:s.cardio || '', cardioOn:r ? !!r.cardio : !!s.cardio, cardioNote:r ? r.cardioNote : '', bw:s.bw || '', note:s.note || ''};
}
function migrate(){
  if (!S.v){
    const old = Array.isArray(S.sessions) ? S.sessions : [];
    const hadData = old.length > 0 || !!(S.draft && S.draft.day);
    /* chi aveva la versione 1 tiene la sua scheda, chi parte da zero sceglie un modello */
    S.routines = hadData ? v1Routines() : [];
    S.onboard = !hadData;
    S.sessions = old.filter(s => s && s.sets && s.date).map(v1Session);
    if (S.draft && S.draft.day){ const dr = S.draft; const conv = v1Session(dr); S.draft = Object.assign(conv, {open:{}, editId:dr.editId}); if (!dr.editId) delete S.draft.editId; }
    else S.draft = null;
    S.settings = Object.assign({}, DEF_SET);
    S.customEx = {}; S.exNotes = {}; S.body = []; S.v = 2;
  }
  S.settings = Object.assign({}, DEF_SET, S.settings || {});
  if (!Array.isArray(S.routines)) S.routines = [];
  if (!Array.isArray(S.sessions)) S.sessions = [];
  if (!Array.isArray(S.body)) S.body = [];
  S.customEx = S.customEx || {}; S.exNotes = S.exNotes || {};
  S.sessions = S.sessions.filter(s => s && s.id && s.date && s.sets && Array.isArray(s.items));
  if (S.draft && !Array.isArray(S.draft.items)) S.draft = null;
  S.sessions.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
migrate(); save();

/* tema: 'dark', 'light' oppure 'auto' (segue il dispositivo) */
function applyTheme(){
  if (typeof document === 'undefined') return;
  let t = S.settings.theme;
  if (t === 'auto') t = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  if (t === 'light') document.documentElement.dataset.theme = 'light'; else delete document.documentElement.dataset.theme;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === 'light' ? '#F1F2F4' : '#0B0C0E';
}
applyTheme();
if (typeof window !== 'undefined' && window.matchMedia) matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
