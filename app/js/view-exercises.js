/* Traks — Libreria esercizi, scheda esercizio, selettore */
/* =========================================================
   ESERCIZI
   ========================================================= */
function renderExLib(){
  const v = V(); v.q = v.q || ''; v.m = v.m || '';
  app.innerHTML = `
    <div class="top"><div class="mark">Esercizi</div><button class="iconbtn pri" data-act="new-ex">+ Nuovo</button></div>
    <div class="search" style="margin-top:16px">${SEARCH}<input class="inp" id="exSearch" placeholder="Cerca tra ${allEx().length} esercizi" value="${esc(v.q)}" autocomplete="off"></div>
    <div class="pills">${['', 'mine', ...Object.keys(M)].map(k => `<button class="pill ${v.m === k ? 'on' : ''}" data-act="ex-filter" data-m="${k}">${k === '' ? 'Tutti' : k === 'mine' ? 'Creati da te' : M[k]}</button>`).join('')}</div>
    <div id="exres" class="list" style="margin-top:10px"></div>`;
  fillExLib();
}
function exMatches(e, q, m){
  if (m === 'mine' && !e.custom) return false;
  if (m && m !== 'mine' && e.m !== m && !(e.m2 || []).includes(m)) return false;
  if (!q) return true;
  const hay = (e.n + ' ' + (M[e.m] || '') + ' ' + (EQ[e.eq] || '')).toLowerCase();
  return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
}
function fillExLib(){
  const v = V(), use = exUsage(), el = document.getElementById('exres'); if (!el) return;
  const list = allEx().filter(e => exMatches(e, v.q, v.m));
  el.innerHTML = list.length ? list.map(e => `<button class="row" data-act="exdetail" data-ex="${e.id}">
    <span class="t"><b>${esc(e.n)}</b><span>${M[e.m] || ''} · ${EQ[e.eq] || ''}${e.custom ? ' · creato da te' : ''}</span></span>
    <span class="r">${use[e.id] ? use[e.id] + '×' : ''}</span></button>`).join('')
    : `<p class="empty">Nessun esercizio trovato.</p><button class="btn sec" data-act="new-ex">Crea “${esc(v.q || 'nuovo esercizio')}”</button>`;
}
const MET = {w:[['e1', '1RM stimato'], ['top', 'Peso max'], ['vol', 'Volume'], ['reps', 'Reps max']], b:[['reps', 'Reps max'], ['top', 'Zavorra max']],
  a:[['reps', 'Reps max'], ['top', 'Assistenza']], t:[['reps', 'Secondi max'], ['top', 'Peso max']], c:[['top', 'Distanza'], ['reps', 'Minuti']]};
function metricVal(k, sets){ return k === 'e1' ? bestE1(sets) : k === 'top' ? topKg(sets) : k === 'vol' ? volSets(sets) : topReps(sets); }
function metricUnit(t, k){ if (k === 'reps') return t === 't' ? 's' : t === 'c' ? 'min' : 'reps'; if (t === 'c') return 'km'; return U(); }
function exHistory(id){ return S.sessions.filter(s => filled(s.sets[id]).length); }
function renderExDetail(){
  const v = V(), e = EX(v.ex), T = TY[e.t] || TY.w, mets = MET[e.t] || MET.w; v.k = v.k || mets[0][0];
  const hist = exHistory(e.id), asc = hist.slice().reverse();
  const pts = asc.map(s => ({date:s.date, v:metricVal(v.k, s.sets[e.id])})).filter(p => p.v);
  let recs = '';
  if (hist.length){
    const all = hist.flatMap(s => work(s.sets[e.id]).map(x => ({x, s})));
    const by = f => all.reduce((b, o) => (f(o.x) > (b ? f(b.x) : -1) ? o : b), null);
    const card = (t, val, s) => `<div><span>${t}</span><b>${val}</b><small>${s ? dShort(s.date) : ''}</small></div>`;
    if (e.t === 'w'){
      const h = by(x => (num(x.kg) || 0) * 1000 + (num(x.reps) || 0)), e1 = by(x => e1rm(x.kg, x.reps)), sv = by(x => (num(x.kg) || 0) * (num(x.reps) || 0)), mr = by(x => num(x.reps) || 0);
      const bv = hist.reduce((b, s) => volSets(s.sets[e.id]) > (b ? volSets(b.sets[e.id]) : -1) ? s : b, null);
      recs = `<div class="recgrid">
        ${h ? card('Peso massimo', `${fmtKg(h.x.kg)} ${U()} × ${h.x.reps}`, h.s) : ''}
        ${e1 ? card('1RM stimato', `${fmtN(e1rm(e1.x.kg, e1.x.reps))} ${U()}`, e1.s) : ''}
        ${sv ? card('Miglior serie', `${fmtKg(sv.x.kg)} × ${sv.x.reps}`, sv.s) : ''}
        ${bv ? card('Volume in una sessione', `${Math.round(volSets(bv.sets[e.id])).toLocaleString('it-IT')} ${U()}`, bv) : ''}
        ${mr ? card('Più ripetizioni', `${mr.x.reps} × ${fmtKg(mr.x.kg) || 0} ${U()}`, mr.s) : ''}
        ${card('Sessioni', hist.length, null)}</div>`;
      const rr = [];
      for (let r = 1; r <= 12; r++){ const c = all.filter(o => num(o.x.reps) >= r); if (c.length) rr.push([r, Math.max(...c.map(o => num(o.x.kg) || 0))]); }
      recs += rr.length ? `<div class="card" style="margin-top:10px"><h4 style="margin-bottom:12px">Record per ripetizioni</h4>
        <div class="rtable">${rr.map(([r, k]) => `<div><span>${r} rep</span><b>${fmtKg(k)}</b></div>`).join('')}</div></div>` : '';
    } else {
      const mr = by(x => num(x.reps) || 0), mk = by(x => num(x.kg) || 0);
      recs = `<div class="recgrid">${mr ? card(e.t === 't' ? 'Tempo massimo' : e.t === 'c' ? 'Minuti massimi' : 'Più ripetizioni', `${mr.x.reps}${e.t === 't' ? ' s' : e.t === 'c' ? ' min' : ''}`, mr.s) : ''}
        ${mk && num(mk.x.kg) ? card(e.t === 'c' ? 'Distanza massima' : e.t === 'a' ? 'Assistenza massima' : 'Zavorra massima', `${fmtKg(mk.x.kg)} ${e.t === 'c' ? 'km' : U()}`, mk.s) : ''}
        ${card('Sessioni', hist.length, null)}</div>`;
    }
  }
  const usedIn = S.routines.filter(r => r.items.some(it => it.ex === e.id));
  app.innerHTML = `
    <div class="top"><button class="iconbtn round" data-act="back" aria-label="Indietro">${I_BACK}</button>${e.custom ? `<div class="row-gap"><button class="iconbtn" data-act="edit-ex" data-ex="${e.id}">Modifica</button></div>` : ''}</div>
    <div class="doneHero" style="margin-top:24px">${esc(e.n)}</div>
    <p class="heroSub">${M[e.m] || ''} · ${EQ[e.eq] || ''}</p>
    ${hist.length ? `<div class="segc">${mets.map(([k, n]) => `<button class="${v.k === k ? 'on' : ''}" data-act="ex-metric" data-k="${k}">${n}</button>`).join('')}</div>
      <div class="card">${lineChart(pts, metricUnit(e.t, v.k), mets.find(m => m[0] === v.k)[1])}</div>
      <h2>Record</h2>${recs}` : '<p class="empty">Nessuna sessione registrata.</p>'}
    <h2>Nota</h2>
    <textarea class="inp" data-exnote="${e.id}" placeholder="Aggiungi una nota">${esc(S.exNotes[e.id] || '')}</textarea>
    ${usedIn.length ? `<h2>Nelle tue schede</h2><div class="list">${usedIn.map(r => `<button class="row" data-act="routine" data-rid="${r.id}"><span class="t"><b>${esc(r.name)}</b></span><span class="r">${(r.items.find(it => it.ex === e.id) || {}).s} serie</span></button>`).join('')}</div>` : ''}
    ${hist.length ? `<h2>Storico</h2><div class="plist" style="max-height:none;border-top:0">${hist.map(s => `<button data-act="detail" data-id="${s.id}"><span>${dShort(s.date)} · ${esc(s.name)}</span><b>${esc(perfText(e, filled(s.sets[e.id])))}</b></button>`).join('')}</div>` : ''}
    ${e.custom ? `<button class="btn sec" data-act="del-ex" data-ex="${e.id}" style="margin-top:30px;color:var(--fail)">Archivia esercizio</button>` : ''}`;
}
function openProgress(exId){
  const e = EX(exId), hist = exHistory(exId).slice(0, 12).reverse();
  const k = e.t === 'w' ? 'e1' : (MET[e.t] || MET.w)[0][0];
  const pts = hist.map(s => ({date:s.date, v:metricVal(k, s.sets[exId]), sets:filled(s.sets[exId])})).filter(p => p.v);
  const ov = openSheet(`<h3>${esc(e.n)}</h3><p>${hist.length ? `Ultime ${hist.length} sessioni` : 'Ancora nessuna sessione'}</p>
    ${hist.length ? lineChart(pts, metricUnit(e.t, k), (MET[e.t] || MET.w)[0][1]) : ''}
    ${S.exNotes[exId] ? `<div class="note mine" style="margin-bottom:12px">${esc(S.exNotes[exId])}</div>` : ''}
    <div class="plist">${hist.slice().reverse().map(s => `<div><span>${dShort(s.date)}</span><b>${esc(perfText(e, filled(s.sets[exId])))}</b></div>`).join('')}</div>
    <button class="btn sec" data-act="exdetail" data-ex="${exId}" style="margin-top:14px">Record e grafici completi</button>
    <button class="btn sec" data-s="x">Chiudi</button>`);
  ov.addEventListener('click', ev => { if (ev.target.closest('[data-s]')) ov.remove(); });
}
function exForm(prev, prefillName){
  return new Promise(res => {
    const e = prev || {n:prefillName || '', m:'pet', m2:[], eq:'man', t:'w'};
    const opts = (o, sel) => Object.entries(o).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(typeof v === 'string' ? v : v.n)}</option>`).join('');
    const ov = openSheet(`<h3>${prev ? 'Modifica esercizio' : 'Nuovo esercizio'}</h3><p></p>
      <div class="form" style="margin-top:0">
        <div class="field"><label>Nome</label><input class="inp finp" id="exf-n" value="${esc(e.n)}" placeholder="Es. Panca inclinata Hammer"></div>
        <div class="f2"><div class="field"><label>Muscolo principale</label><select class="inp" id="exf-m">${opts(M, e.m)}</select></div>
        <div class="field"><label>Attrezzo</label><select class="inp" id="exf-eq">${opts(EQ, e.eq)}</select></div></div>
        <div class="field"><label>Come si registra</label><select class="inp" id="exf-t" ${prev && exHistory(prev.id).length ? 'disabled' : ''}>${opts(TY, e.t)}</select></div>
        <div class="field"><label>Muscoli secondari</label><div class="rtog" id="exf-m2">${Object.keys(M).filter(k => k !== 'car' && k !== 'tot').map(k => `<button type="button" class="tbtn ${(e.m2 || []).includes(k) ? 'on' : ''}" data-m2="${k}">${M[k]}</button>`).join('')}</div></div>
      </div>
      <div style="height:18px"></div>
      <button class="btn pri" data-s="ok">${prev ? 'Salva' : 'Crea esercizio'}</button><button class="btn sec" data-s="no">Annulla</button>`);
    ov.addEventListener('click', ev => {
      const t = ev.target.closest('[data-m2]'); if (t){ t.classList.toggle('on'); return; }
      if (ev.target === ov){ res(null); return; }
      const b = ev.target.closest('[data-s]'); if (!b) return;
      if (b.dataset.s === 'no'){ ov.remove(); res(null); return; }
      const n = ov.querySelector('#exf-n').value.trim();
      if (!n){ toast('Scrivi il nome'); return; }
      const id = prev ? prev.id : 'c-' + uid();
      const m = ov.querySelector('#exf-m').value;
      S.customEx[id] = {id, n, m, eq:ov.querySelector('#exf-eq').value, t:ov.querySelector('#exf-t').value,
        m2:[...ov.querySelectorAll('#exf-m2 .on')].map(x => x.dataset.m2).filter(x => x !== m), custom:true};
      save(); ov.remove(); res(id);
    });
    setTimeout(() => { const i = ov.querySelector('#exf-n'); if (i && !prev) i.focus(); }, 300);
  });
}
function pickExercises(exclude, single){
  return new Promise(res => {
    const sel = [], use = exUsage(); let q = '', m = '';
    const ov = openSheet(`<h3>${single ? 'Scegli esercizio' : 'Aggiungi esercizi'}</h3>
      <div class="sticky"><div class="search">${SEARCH}<input class="inp" id="pkq" placeholder="Cerca" autocomplete="off"></div>
      <div class="pills" id="pkm">${['', ...Object.keys(M)].map(k => `<button class="pill ${k === '' ? 'on' : ''}" data-pm="${k}">${k ? M[k] : 'Tutti'}</button>`).join('')}</div></div>
      <div id="pkl"></div>
      <div class="pkfoot">${single ? '' : '<button class="btn pri" data-s="ok" id="pkok" disabled style="opacity:.5">Scegli almeno un esercizio</button>'}
      <button class="btn sec" data-s="new">+ Crea nuovo esercizio</button></div>`);
    const draw = () => {
      let list = allEx().filter(e => !exclude.includes(e.id) && exMatches(e, q, m));
      let html = '';
      const row = e => `<button data-pid="${e.id}" class="${sel.includes(e.id) ? 'sel' : ''}"><span><b>${esc(e.n)}</b><span>${M[e.m] || ''} · ${EQ[e.eq] || ''}${use[e.id] ? ` · fatto ${use[e.id]}×` : ''}</span></span>${single ? '' : `<span class="box">${CHECK}</span>`}</button>`;
      if (!q && !m){
        const top = list.filter(e => use[e.id]).sort((a, b) => use[b.id] - use[a.id]).slice(0, 8);
        if (top.length) html += `<div class="month">Più usati</div><div class="pk">${top.map(row).join('')}</div><div class="month">Tutti</div>`;
      }
      html += list.length ? `<div class="pk">${list.map(row).join('')}</div>` : '<p class="empty">Nessun risultato.</p>';
      ov.querySelector('#pkl').innerHTML = html;
      const ok = ov.querySelector('#pkok');
      if (ok){ ok.disabled = !sel.length; ok.style.opacity = sel.length ? 1 : .5; ok.textContent = sel.length ? `Aggiungi ${sel.length} ${sel.length === 1 ? 'esercizio' : 'esercizi'}` : 'Scegli almeno un esercizio'; }
    };
    draw();
    ov.querySelector('#pkq').addEventListener('input', ev => { q = ev.target.value.trim(); draw(); });
    ov.addEventListener('click', async ev => {
      if (ev.target === ov){ res([]); return; }
      const pm = ev.target.closest('[data-pm]');
      if (pm){ m = pm.dataset.pm; ov.querySelectorAll('[data-pm]').forEach(b => b.classList.toggle('on', b === pm)); draw(); return; }
      const p = ev.target.closest('[data-pid]');
      if (p){ const id = p.dataset.pid; if (single){ ov.remove(); res([id]); return; }
        const i = sel.indexOf(id); i >= 0 ? sel.splice(i, 1) : sel.push(id); draw(); return; }
      const b = ev.target.closest('[data-s]'); if (!b) return;
      if (b.dataset.s === 'ok'){ ov.remove(); res(sel.slice()); }
      else if (b.dataset.s === 'new'){ ov.style.display = 'none'; const id = await exForm(null, q); ov.style.display = '';
        if (id){ if (single){ ov.remove(); res([id]); return; } sel.push(id); draw(); } }
    });
  });
}
