/* Traks — Allenamento in corso */
/* =========================================================
   SESSIONE
   ========================================================= */
function buildSets(it){
  const e = EX(it.ex), lp = lastPerf(it.ex);
  const up = S.settings.autoInc && closedRange(it, lp), inc = incOf(it);
  return Array.from({length:Math.max(1, +it.s || 1)}, (_, i) => {
    const ref = lp ? (lp.work[i] || lp.work[lp.work.length - 1]) : null;
    let kg = ref && ref.kg !== '' && ref.kg != null ? String(ref.kg) : '';
    if (up && num(kg) != null) kg = String(r2(num(kg) + inc));
    if (e.t !== 'w' && e.t !== 'c' && !num(kg)) kg = '';
    return {kg, reps:'', done:false};
  });
}
function newDraft(src, rid){
  const items = clone(src.items || []);
  const sets = {};
  for (const it of items) sets[it.ex] = buildSets(it);
  return {id:uid(), rid:rid || null, name:src.name || 'Allenamento libero', focus:src.focus || '', start:new Date().toISOString(), items, sets,
    cardioOn:!!(src.cardio || src.cardioOn), cardioNote:src.cardioNote || '', cardio:'', bw:'', note:'', open:{}};
}
function draftFromSession(s){
  const sets = {};
  for (const it of itemsOf(s)){
    const src = s.sets[it.ex] || [];
    sets[it.ex] = src.length ? src.map(x => ({kg:x.kg ?? '', reps:x.reps ?? '', t:x.t, rir:x.rir, done:x.reps !== '' && x.reps != null})) : [{kg:'', reps:'', done:false}];
  }
  return {id:s.id, editId:s.id, rid:s.rid, name:s.name, focus:s.focus || '', start:s.start, date:s.date, dur:s.dur, items:clone(itemsOf(s)), sets,
    cardioOn:!!s.cardioOn, cardioNote:s.cardioNote || '', cardio:s.cardio || '', bw:s.bw || '', note:s.note || '', open:{}};
}
async function startWorkout(d){
  if (S.draft && !(await ask(S.draft.editId ? 'Stai modificando un allenamento. Annullare le modifiche e iniziarne uno nuovo?' : 'Hai già un allenamento in corso. Scartarlo e iniziarne uno nuovo?', 'Inizia nuovo', true))) return false;
  S.draft = d; save(); nav({name:'session'});
  return true;
}
function renderSession(){
  const d = S.draft; if (!d){ stack = [{name:'home'}]; renderHome(); return; }
  const G = ssGroups(d.items);
  app.innerHTML = `
    <div class="stick"><div class="sessHead">
      <button class="iconbtn round" data-act="back" aria-label="Riduci">${I_DOWN}</button>
      <div class="sessTitle">${esc(d.name)}${d.editId ? '<small>Modifica</small>' : `<small id="elapsed">0:00</small>`}</div>
      <span class="count" id="count"></span></div>
      <div class="prog"><span id="progbar"></span></div></div>
    <div id="exlist">${d.items.map((it, i) => exHTML(it, d, G[i])).join('')}</div>
    ${d.items.length ? '' : ''}
    <button class="btn ghost" data-act="add-ex" style="margin-top:14px">+ Aggiungi esercizio</button>
    <div class="extra">
      ${!d.rid && !d.editId ? `<div class="field"><label for="f-name">Nome</label><input class="inp" id="f-name" data-f="name" value="${esc(d.name)}"></div>` : ''}
      ${d.cardioOn ? `<div class="field"><label for="f-cardio">${d.cardioNote ? esc(d.cardioNote) : 'Cardio'} · minuti</label><input class="inp" id="f-cardio" inputmode="numeric" data-f="cardio" value="${esc(d.cardio)}" placeholder="15"></div>` : ''}
      <div class="field"><label for="f-bw">Peso corporeo · ${U()}</label><input class="inp" id="f-bw" inputmode="decimal" data-f="bw" value="${esc(fmtKg(d.bw))}" placeholder="—"></div>
      <div class="field"><label for="f-note">Note</label><textarea class="inp" id="f-note" data-f="note">${esc(d.note)}</textarea></div>
      <button class="btn pri" data-act="finish">${d.editId ? 'Salva modifiche' : 'Salva allenamento'}</button>
      ${d.editId ? '' : '<button class="link" data-act="discard-in">Scarta allenamento</button>'}
    </div>`;
  updateCount(); markCurrent();
}
function refFor(arr, i, lp){
  if (!lp) return null;
  const warm = arr[i].t === 'w', k = arr.slice(0, i).filter(x => (x.t === 'w') === warm).length;
  const pool = lp.sets.filter(x => (x.t === 'w') === warm);
  return pool[k] || (warm ? null : pool[pool.length - 1] || null);
}
function setLabel(arr, i){
  const x = arr[i];
  if (x.t === 'w') return ['R', 'w']; if (x.t === 'd') return ['D', 'd']; if (x.t === 'f') return ['C', 'f'];
  let n = 0; for (let k = 0; k <= i; k++) if (arr[k].t !== 'w') n++;
  return [String(n), 'n'];
}
function exHTML(it, d, grp){
  const e = EX(it.ex), T = TY[e.t] || TY.w, arr = d.sets[it.ex] || [];
  const lp = lastPerf(it.ex, d.editId);
  const complete = arr.length && arr.every(x => x.done), open = d.open && d.open[it.ex];
  const b = bestBefore(it.ex, d.editId, d.editId ? d.date : null);
  const prs = arr.map(x => x.done && isPR(e, x, b));
  if (complete && !open){
    return `<section class="ex done-ex ${grp ? 'ssg' : ''}" data-exid="${it.ex}">
      <button class="exToggle" data-act="toggle-ex" data-ex="${it.ex}">
        <span class="okdot">${CHECK}</span>
        <span><span class="exName">${esc(e.n)}${prs.some(Boolean) ? ' <span class="tag gold">Record</span>' : ''}</span><span class="exSum">${esc(perfText(e, filled(arr)))}</span></span>
        <span class="edit">Modifica</span></button></section>`;
  }
  let hint = '';
  if (closedRange(it, lp) && !d.editId)
    hint = `<span class="up-tag">↑ ${fmtKg(incOf(it))} ${U()}</span>`;
  const firstKg = (arr.find(x => x.kg !== '' && x.t !== 'w') || {}).kg;
  const rirCol = S.settings.rirCol && (e.t === 'w' || e.t === 'b' || e.t === 'a');
  const myNote = S.exNotes[it.ex];
  return `<section class="ex ${grp ? 'ssg' : ''} ${rirCol ? 'rircol' : ''}" data-exid="${it.ex}">
    <div class="exTop"><button class="exName" data-act="progress" data-ex="${it.ex}">${esc(e.n)}<small>${M[e.m] || ''}${e.eq ? ' · ' + (EQ[e.eq] || '') : ''}</small></button>
      <button class="mini dots3" data-act="ex-menu" data-ex="${it.ex}" aria-label="Opzioni esercizio">···</button></div>
    <div class="exMeta"><span><b>${it.s} × ${range(it)}</b>${T.b === 'sec' ? ' s' : T.b === 'min' ? ' min' : ''}</span>${grp ? `<span class="ss-tag">Superserie ${grp}</span>` : ''}${hint}</div>
    ${it.note ? `<div class="note">${esc(it.note)}</div>` : ''}
    ${myNote ? `<div class="note mine">${esc(myNote)}</div>` : ''}
    <div class="sets">
      <div class="setHead"><span>N°</span><span>${lab(T.a)}</span><span>${T.b}</span>${rirCol ? '<span>RIR</span>' : ''}<span></span></div>
      ${arr.map((x, i) => { const [L, cls] = setLabel(arr, i); const ref = refFor(arr, i, lp);
        return `<div class="set ${x.done ? 'done' : ''} ${prs[i] ? 'pr' : ''} ${x.t === 'w' ? 'warm' : ''}" data-ex="${it.ex}" data-i="${i}">
        <button class="i ${cls}" data-act="set-type" aria-label="Tipo di serie">${L}</button>
        <input class="inp" inputmode="decimal" data-k="kg" value="${esc(fmtKg(x.kg))}" placeholder="${esc(ref && ref.kg !== '' ? fmtKg(ref.kg) : e.t === 'w' ? '—' : '0')}" aria-label="${esc(e.n)} serie ${i + 1} ${lab(T.a)}">
        <input class="inp" inputmode="numeric" data-k="reps" value="${esc(x.reps)}" placeholder="${esc(ref ? ref.reps : x.t === 'w' ? '' : it.r ? it.r[1] : '')}" aria-label="${esc(e.n)} serie ${i + 1} ${T.b}">
        ${rirCol ? `<input class="inp rir" inputmode="decimal" data-k="rir" value="${esc(x.rir ?? '')}" placeholder="${esc((it.rir || '').split('-')[0])}" aria-label="RIR">` : ''}
        <button class="ck" data-act="check" aria-label="Serie ${i + 1} fatta">${prs[i] ? 'PR' : CHECK}</button></div>`; }).join('')}
    </div>
    <div class="exFoot">
      <span></span>
      <span class="row-gap">${arr.length > 1 && !arr[arr.length - 1].done ? `<button class="mini" data-act="del-set" data-ex="${it.ex}">− Serie</button>` : ''}${e.t === 'c' ? '' : `<button class="mini" data-act="add-warm" data-ex="${it.ex}">+ Riscaldamento</button>`}<button class="mini" data-act="add-set" data-ex="${it.ex}">+ Serie</button></span>
    </div></section>`;
}
function refreshEx(id){
  const d = S.draft, idx = d.items.findIndex(x => x.ex === id), old = document.querySelector(`section[data-exid="${CSS.escape(id)}"]`);
  if (!old || idx < 0) return;
  const tmp = document.createElement('div'); tmp.innerHTML = exHTML(d.items[idx], d, ssGroups(d.items)[idx]); old.replaceWith(tmp.firstElementChild);
  markCurrent();
}
function markCurrent(){
  const d = S.draft; if (!d) return;
  let found = false;
  document.querySelectorAll('section.ex').forEach(sec => {
    const arr = d.sets[sec.dataset.exid] || [];
    const cur = !found && !(arr.length && arr.every(x => x.done));
    if (cur) found = true;
    sec.classList.toggle('cur', cur);
  });
}
function updateCount(){
  const d = S.draft; if (!d) return;
  let done = 0, tot = 0, vol = 0;
  for (const it of d.items){ const a = d.sets[it.ex] || []; done += a.filter(x => x.done).length; tot += a.length;
    if (EX(it.ex).t === 'w') for (const x of a) if (x.done && x.t !== 'w') vol += (num(x.kg) || 0) * (num(x.reps) || 0); }
  const c = document.getElementById('count'), b = document.getElementById('progbar');
  if (c) c.innerHTML = `${done}/${tot} serie${vol ? `<small>${Math.round(vol).toLocaleString('it-IT')} ${U()}</small>` : ''}`;
  if (b) b.style.width = (tot ? done / tot * 100 : 0) + '%';
}
function sessionFromDraft(d){
  const s = {id:d.id, rid:d.rid || null, name:(d.name || 'Allenamento').trim() || 'Allenamento', focus:d.focus || '', date:d.editId ? d.date : new Date().toISOString(), start:d.start,
    dur:d.editId ? d.dur : Date.now() - new Date(d.start).getTime(), items:clone(d.items), sets:{}, cardio:d.cardio, cardioOn:d.cardioOn, cardioNote:d.cardioNote, bw:d.bw, note:(d.note || '').trim()};
  for (const it of d.items) s.sets[it.ex] = filled(d.sets[it.ex]).filter(x => x.done || d.editId).map(x => {
    const o = {kg:x.kg, reps:x.reps}; if (x.t) o.t = x.t; if (x.rir !== '' && x.rir != null) o.rir = x.rir; return o; });
  return s;
}
async function finish(){
  const d = S.draft;
  const any = Object.values(d.sets).some(a => a.some(x => x.done));
  const unchecked = Object.values(d.sets).reduce((n, a) => n + a.filter(x => !x.done && x.reps !== '').length, 0);
  if (!d.editId && !any && !(await ask('Non hai spuntato nessuna serie. Salvare lo stesso?', 'Salva'))) return;
  if (!d.editId && unchecked && !(await ask(`${unchecked} ${unchecked === 1 ? 'serie compilata non è spuntata' : 'serie compilate non sono spuntate'} e non verranno salvate.`, 'Salva lo stesso'))) return;
  const s = sessionFromDraft(d);
  if (d.editId){ const i = S.sessions.findIndex(x => x.id === d.editId); if (i >= 0) S.sessions[i] = s; else S.sessions.unshift(s); }
  else S.sessions.unshift(s);
  S.sessions.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const wasEdit = !!d.editId;
  S.draft = null; save(); stopRest();
  if (wasEdit){ back(); toast('Modifiche salvate'); }
  else { replaceTop({name:'done', id:s.id}); buzz([30, 50, 30]); if (records(s).length) setTimeout(() => celebrate(), 250); }
}
