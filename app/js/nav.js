/* Traks — Navigazione tra le schermate, animazioni di ingresso */
/* =========================================================
   NAVIGAZIONE
   ========================================================= */
const app = document.getElementById('app');
let stack = [{name:'home'}], hcount = 0;
const V = () => stack[stack.length - 1];
const ROOTS = ['home', 'history', 'exlib', 'stats', 'more'];
function push(){ try { history.pushState({traks:1}, ''); hcount++; } catch(_) {} }
function show(){
  render(); window.scrollTo(0, 0);
  app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter'); stagger(); countUp();
  const n = V().name;
  document.body.classList.toggle('notabs', n === 'session' || n === 'redit');
  const root = stack[0].name;
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === root));
  wake(n === 'session'); runClock(n === 'session');
}
function tab(name){ const fromHome = stack.length === 1 && stack[0].name === 'home'; stack = [{name}]; if (name !== 'home' && fromHome && hcount === 0) push(); show(); }
function nav(v){ stack.push(v); push(); show(); }
function replaceTop(v){ stack[stack.length - 1] = v; show(); }
function back(){ if (stack.length > 1 && hcount > 0) history.back(); else if (stack.length > 1){ stack.pop(); show(); } else tab('home'); }
window.addEventListener('popstate', () => {
  hcount = Math.max(0, hcount - 1);
  if (document.querySelector('.ov')) { document.querySelectorAll('.ov').forEach(o => o.remove()); push(); return; }
  if (stack.length > 1){ stack.pop(); show(); }
  else if (V().name !== 'home'){ stack = [{name:'home'}]; show(); }
});
let lock = null;
async function wake(on){
  try {
    if (on && !lock && 'wakeLock' in navigator){ lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); }
    else if (!on && lock){ await lock.release(); lock = null; }
  } catch(_) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && V().name === 'session') wake(true); });
let clockInt;
function runClock(on){
  clearInterval(clockInt);
  if (!on || !S.draft || S.draft.editId) return;
  const tickClock = () => { const el = document.getElementById('elapsed'); if (el && S.draft) el.textContent = clock(Date.now() - new Date(S.draft.start).getTime()); };
  tickClock(); clockInt = setInterval(tickClock, 1000);
}
let toastT;
const calm = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
/* gli elementi della schermata entrano uno dopo l'altro */
function stagger(){
  [...app.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 6)));
  app.querySelectorAll('.list, .stats, .tools, .ach, .recgrid').forEach(l => [...l.children].forEach((c, j) => c.style.setProperty('--j', Math.min(j, 8))));
}
/* i numeri grandi salgono da zero al loro valore */
function countUp(){
  if (calm()) return;
  app.querySelectorAll('.stat b, .wkHead > div > b, .recgrid b').forEach(el => {
    const node = el.firstChild; if (!node || node.nodeType !== 3) return;
    const txt = node.textContent.trim(); if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(txt)) return;
    const dec = (txt.split(',')[1] || '').length, target = parseFloat(txt.replace(/\./g, '').replace(',', '.'));
    if (!target) return;
    const t0 = performance.now(), dur = 700;
    const step = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      node.textContent = (target * e).toLocaleString('it-IT', {minimumFractionDigits:dec, maximumFractionDigits:dec}) + (node.textContent.endsWith(' ') ? ' ' : '');
      if (p < 1) requestAnimationFrame(step); else node.textContent = txt + (/\s$/.test(node.textContent) ? ' ' : ''); };
    const keepSpace = /\s$/.test(node.textContent); node.textContent = '0' + (keepSpace ? ' ' : '');
    requestAnimationFrame(step);
  });
}
function buzz(ms){ try { if (S.settings.vibe && navigator.vibrate) navigator.vibrate(ms); } catch(_) {} }
const PLATE_IWF = ['#E0413C', '#3B7BEA', '#EFC53A', '#37B26C', '#D9DCE1', '#E0413C', '#3B7BEA'];
function celebrate(n){
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('div'); c.className = 'confetti';
  c.innerHTML = Array.from({length:n || 46}, (_, i) => `<i style="left:${Math.random() * 100}%;background:${i % 3 ? PLATE_IWF[i % 5] : '#E9C46A'};--dx:${(Math.random() - .5) * 160}px;--r:${(Math.random() - .5) * 900}deg;animation-delay:${Math.random() * .35}s;animation-duration:${1.2 + Math.random() * .9}s"></i>`).join('');
  document.body.appendChild(c); setTimeout(() => c.remove(), 2600);
}
/* l'obiettivo della settimana come un bilanciere: un disco per ogni allenamento */
function plateMeter(n, goal){
  const W = 320, H = 86, cy = 43, slots = Math.min(7, Math.max(goal, n)), pw = 15, gap = 3, inner = 130;
  let s = `<svg class="meter" viewBox="0 0 ${W} ${H}" role="img" aria-label="${n} allenamenti su ${goal} questa settimana">
    <defs><pattern id="kn" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#4a5059"/><path d="M0 0v5M0 0h5" stroke="#6b727c" stroke-width="1"/></pattern>
    <linearGradient id="bar" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9aa1aa"/><stop offset=".5" stop-color="#5f656e"/><stop offset="1" stop-color="#3b4048"/></linearGradient></defs>
    <rect x="2" y="${cy - 3.5}" width="${W - 4}" height="7" rx="3.5" fill="url(#bar)"/>
    <rect x="${inner + 14}" y="${cy - 4}" width="${W - 2 * inner - 28}" height="8" rx="2" fill="url(#kn)"/>
    <rect x="${inner}" y="${cy - 11}" width="7" height="22" rx="2" fill="#7c838d"/><rect x="${W - inner - 7}" y="${cy - 11}" width="7" height="22" rx="2" fill="#7c838d"/>`;
  for (let i = 0; i < slots; i++){
    const h = Math.max(42, 80 - i * 7), y = cy - h / 2, done = i < n;
    const xl = inner - (i + 1) * (pw + gap), xr = W - inner + gap + i * (pw + gap);
    const fill = done ? `fill="${PLATE_IWF[i]}"` : 'class="slot"';
    const st = done ? ` class="pf" style="animation-delay:${.05 + i * .07}s"` : '';
    s += `<rect${st} x="${xl}" y="${y}" width="${pw}" height="${h}" rx="3" ${fill}/><rect${st} x="${xr}" y="${y}" width="${pw}" height="${h}" rx="3" ${fill}/>`;
  }
  return s + '</svg>';
}
function toast(msg, gold){ const t = document.getElementById('toast'); t.textContent = msg; t.classList.toggle('gold', !!gold); t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

function render(){
  app.classList.remove('enter');
  const n = V().name;
  const R = {home:renderHome, session:renderSession, history:renderHistory, detail:renderDetail, done:renderDone, exlib:renderExLib, exdetail:renderExDetail,
    stats:renderStats, more:renderMore, redit:renderRoutineEdit, routines:renderRoutines, body:renderBody, settings:renderSettings, ach:renderAch};
  (R[n] || renderHome)();
}
