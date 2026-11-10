/* Traks — Calcoli: serie, volume, 1RM, rotazione, settimane, record */
/* ---------- esercizi ---------- */
const U = () => S.settings.unit;
const lab = s => s.replace('U', U());
function EX(id){ return S.customEx[id] || LIB[id] || {id, n:id, m:'tot', m2:[], eq:'alt', t:'w'}; }
function allEx(){ return [...Object.values(LIB), ...Object.values(S.customEx).filter(e => !e.hidden)].sort((a, b) => a.n.localeCompare(b.n, 'it')); }
function defInc(e){ if (U() === 'lb') return 5; return {bil:2.5, ez:2.5, mp:2.5, man:2, cav:2.5, mac:5, kb:4}[e.eq] || 2.5; }
const incOf = it => it.inc || defInc(EX(it.ex));
function restOf(it){ if (it.rest) return it.rest; const t = EX(it.ex).t; return it.main ? S.settings.restMain : (t === 'b' || t === 't') ? S.settings.restBw : S.settings.restDef; }
function newItem(id){
  const t = EX(id).t;
  return {ex:id, s:t === 'c' ? 1 : 3, r:t === 't' ? [30, 45] : t === 'c' ? [10, 20] : [8, 12], rir:t === 'c' || t === 't' ? '' : '1-2', rest:0, main:false, inc:0, note:'', ss:false};
}
const range = it => !it.r ? '' : it.r[0] === it.r[1] ? String(it.r[0]) : it.r[0] + '-' + it.r[1];
function exUsage(){ const c = {}; for (const s of S.sessions) for (const k in s.sets) if (filled(s.sets[k]).length) c[k] = (c[k] || 0) + 1; return c; }

/* ---------- serie e calcoli ---------- */
function filled(arr){ return (arr || []).filter(x => x && x.reps !== '' && x.reps != null); }
const work = arr => filled(arr).filter(x => x.t !== 'w');
const e1rm = (kg, reps) => { const k = num(kg), r = num(reps); if (!k || !r || r <= 0) return 0; return r === 1 ? k : k * (1 + r / 30); };
const bestE1 = arr => Math.max(0, ...work(arr).map(x => e1rm(x.kg, x.reps)));
const topKg = arr => Math.max(0, ...work(arr).map(x => num(x.kg) || 0));
const topReps = arr => Math.max(0, ...work(arr).map(x => num(x.reps) || 0));
const volSets = arr => work(arr).reduce((a, x) => a + (num(x.kg) || 0) * (num(x.reps) || 0), 0);
const itemsOf = s => s.items || [];
function volume(s){ let v = 0; for (const it of itemsOf(s)) if (EX(it.ex).t === 'w') v += volSets(s.sets[it.ex]); return Math.round(v); }
function setsDone(s){ let n = 0; for (const it of itemsOf(s)) n += work(s.sets[it.ex]).length; return n; }
function plannedSets(s){ return itemsOf(s).reduce((a, it) => a + (+it.s || 0), 0); }
function lastPerf(exId, beforeId){
  let skip = !!beforeId && S.sessions.some(s => s.id === beforeId);
  for (const s of S.sessions){
    if (skip){ if (s.id === beforeId) skip = false; continue; }
    const f = filled(s.sets && s.sets[exId]); if (f.length) return {date:s.date, sets:f, work:work(f).length ? work(f) : f};
  }
  return null;
}
function closedRange(it, lp){ return !!lp && EX(it.ex).t === 'w' && it.r && lp.work.length >= it.s && lp.work.every(x => num(x.reps) >= it.r[1]); }
function roundTo(v, step){ return Math.round(v / step) * step; }
const minStep = () => Math.min(...S.settings.plates) * 2 || 2.5;

function perfText(e, arr){
  const u = U();
  return arr.map(x => {
    const tag = x.t === 'w' ? ' risc.' : x.t === 'd' ? ' drop' : x.t === 'f' ? ' ced.' : '';
    const rir = x.rir !== '' && x.rir != null ? ` @${x.rir}` : '';
    const kg = num(x.kg);
    let s;
    if (e.t === 'w') s = `${fmtKg(x.kg) || '?'} ${u} × ${x.reps}`;
    else if (e.t === 'b') s = kg ? `${x.reps} (+${fmtKg(kg)} ${u})` : `${x.reps}`;
    else if (e.t === 'a') s = kg ? `${x.reps} (−${fmtKg(kg)} ${u})` : `${x.reps}`;
    else if (e.t === 't') s = `${x.reps} s` + (kg ? ` (+${fmtKg(kg)} ${u})` : '');
    else s = (kg ? `${fmtKg(kg)} km in ` : '') + `${x.reps} min`;
    return s + rir + tag;
  }).reduce((g, s) => { const last = g[g.length - 1]; if (last && last[0] === s) last[1]++; else g.push([s, 1]); return g; }, [])
    .map(([s, n]) => n > 1 ? `${s} · ${n} serie` : s).join(' / ');
}

/* ---------- schede e rotazione ---------- */
const rotation = () => S.routines.filter(r => r.rot);
const routine = id => S.routines.find(r => r.id === id);
function nextRoutine(){
  const rot = rotation(); if (!rot.length) return null;
  const last = S.sessions.find(s => rot.some(r => r.id === s.rid));
  if (!last) return rot[0];
  return rot[(rot.findIndex(r => r.id === last.rid) + 1) % rot.length];
}
function ssGroups(items){
  const L = []; let code = 65, i = 0;
  while (i < items.length){
    let j = i; while (j < items.length - 1 && items[j].ss) j++;
    if (j > i){ const ch = String.fromCharCode(code++); for (let k = i; k <= j; k++) L[k] = ch; } else L[i] = '';
    i = j + 1;
  }
  return L;
}
function musclesOfItems(items, setsFn){
  const m = {};
  for (const it of items){
    const e = EX(it.ex); if (e.m === 'car') continue;
    const n = setsFn(it); if (!n) continue;
    m[e.m] = (m[e.m] || 0) + n;
    for (const x of e.m2 || []) m[x] = (m[x] || 0) + n * .5;
  }
  return m;
}

/* ---------- settimane, fase ---------- */
function weekStartOf(t){ const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }
const weekStart = () => weekStartOf(Date.now());
function thisWeekCount(){ const ws = weekStart(); return S.sessions.filter(s => new Date(s.date).getTime() >= ws).length; }
function firstTime(){ return S.settings.programStart || (S.sessions.length ? new Date(S.sessions[S.sessions.length - 1].date).getTime() : Date.now()); }
function programWeek(){ return Math.floor((Date.now() - firstTime()) / WEEK_MS) + 1; }
function weeksSinceDeload(){ return Math.floor((Date.now() - Math.max(firstTime(), S.deloadAt || 0)) / WEEK_MS) + 1; }
const inRientro = () => S.settings.rientro && programWeek() <= 2;
function weekCounts(){ const m = {}; for (const s of S.sessions){ const w = weekStartOf(new Date(s.date).getTime()); m[w] = (m[w] || 0) + 1; } return m; }
function streaks(){
  const m = weekCounts(), goal = S.settings.weekGoal; let curS = 0, best = 0, run = 0;
  let w = weekStart();
  if ((m[w] || 0) < goal) w -= WEEK_MS;
  while ((m[w] || 0) >= goal){ curS++; w -= WEEK_MS; }
  if (S.sessions.length){
    const first = weekStartOf(new Date(S.sessions[S.sessions.length - 1].date).getTime());
    for (let x = first; x <= weekStart(); x += WEEK_MS){ const key = weekStartOf(x + DAY_MS); if ((m[key] || 0) >= goal){ run++; best = Math.max(best, run); } else run = 0; x = key; }
  }
  return {cur:curS, best:Math.max(best, curS)};
}

/* ---------- peso corporeo ---------- */
function weightSeries(){
  const pts = [];
  for (const b of S.body) if (num(b.w)) pts.push({date:b.date, v:num(b.w)});
  for (const s of S.sessions) if (num(s.bw)) pts.push({date:s.date, v:num(s.bw)});
  return pts.sort((a, b) => String(a.date).localeCompare(String(b.date)));
}
function weekAvgVals(){ const from = Date.now() - WEEK_MS; return weightSeries().filter(p => new Date(p.date).getTime() >= from).map(p => p.v); }
function weekAvgText(){ const v = weekAvgVals(); if (!v.length) return '';
  return `Peso medio ultimi 7 giorni: ${fmtN(v.reduce((a, b) => a + b, 0) / v.length)} ${U()} (${v.length} rilevazioni)`; }

/* ---------- record ---------- */
function bestBefore(exId, skipId, beforeDate){
  const b = {had:false, e1:0, kg:0, reps:0};
  for (const s of S.sessions){
    if (s.id === skipId) continue;
    if (beforeDate && String(s.date) >= String(beforeDate)) continue;
    const w = work(s.sets[exId]); if (!w.length) continue;
    b.had = true; b.e1 = Math.max(b.e1, bestE1(w)); b.kg = Math.max(b.kg, topKg(w)); b.reps = Math.max(b.reps, topReps(w));
  }
  return b;
}
function isPR(e, x, b){
  if (!b.had || x.t === 'w' || x.reps === '' || x.reps == null) return false;
  if (e.t === 'w') return e1rm(x.kg, x.reps) > b.e1 + 1e-9 || (num(x.kg) || 0) > b.kg + 1e-9;
  if (e.t === 'b' || e.t === 't') return (num(x.reps) || 0) > b.reps;
  return false;
}
function records(s){
  const out = [];
  for (const it of itemsOf(s)){
    const e = EX(it.ex), w = work(s.sets[it.ex]); if (!w.length) continue;
    const b = bestBefore(it.ex, s.id, s.date); if (!b.had) continue;
    if (e.t === 'w'){
      const top = topKg(w), e1 = bestE1(w);
      if (top > b.kg){ const best = w.filter(x => num(x.kg) === top).sort((a, c) => num(c.reps) - num(a.reps))[0];
        out.push({e, what:'Peso massimo', txt:`${fmtKg(top)} ${U()} × ${best.reps}`, prev:`prima ${fmtKg(b.kg)} ${U()}`}); }
      else if (e1 > b.e1 + 1e-9) out.push({e, what:'1RM stimato', txt:`${fmtN(e1)} ${U()}`, prev:`prima ${fmtN(b.e1)} ${U()}`});
    } else if (e.t === 'b' || e.t === 't'){
      const r = topReps(w); if (r > b.reps) out.push({e, what:e.t === 't' ? 'Tempo massimo' : 'Ripetizioni massime', txt:`${r}${e.t === 't' ? ' s' : ''}`, prev:`prima ${b.reps}`});
    }
  }
  return out;
}
function prEvents(){
  const best = {}, ev = [];
  for (const s of S.sessions.slice().reverse()){
    for (const it of itemsOf(s)){
      const e = EX(it.ex); if (!['w', 'b', 't'].includes(e.t)) continue;
      const w = work(s.sets[it.ex]); if (!w.length) continue;
      const val = e.t === 'w' ? bestE1(w) : topReps(w); if (!val) continue;
      if (best[it.ex] != null && val > best[it.ex] + 1e-9) ev.push({s, e, val, prev:best[it.ex]});
      best[it.ex] = Math.max(best[it.ex] ?? 0, val);
    }
  }
  return ev.reverse();
}
