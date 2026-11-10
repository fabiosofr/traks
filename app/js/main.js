/* Traks — Gestione degli eventi e avvio */
/* =========================================================
   EVENTI
   ========================================================= */
async function addToDraft(ids){
  const d = S.draft; let n = 0;
  for (const id of ids){ if (d.sets[id]) continue; const it = newItem(id); d.items.push(it); d.sets[id] = buildSets(it); n++; }
  if (n){ save(); render(); const last = document.querySelector(`section[data-exid="${CSS.escape(ids[ids.length - 1])}"]`); if (last) last.scrollIntoView({behavior:'smooth', block:'start'}); }
}
document.addEventListener('click', e => {
  const tb = e.target.closest('[data-tab]');
  if (tb && !tb.closest('.ov')){ tab(tb.dataset.tab); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act;
  const sheet = b.closest('.ov');
  if (sheet) sheet.remove();
  const d = S.draft;
  switch (a){
    case 'back': back(); break;
    case 'detail': nav({name:'detail', id:b.dataset.id}); break;
    case 'exdetail': nav({name:'exdetail', ex:b.dataset.ex}); break;
    case 'routines': nav({name:'routines'}); break;
    case 'body': nav({name:'body'}); break;
    case 'ach': nav({name:'ach'}); break;
    case 'settings': nav({name:'settings'}); break;
    case 'pick': {
      const pk = document.getElementById('picker');
      pk.innerHTML = pk.innerHTML ? '' : `<div class="chips">${S.routines.map(r => `<button class="chip" data-act="start" data-rid="${r.id}">${esc(r.name)}</button>`).join('')}</div>`; break; }
    case 'start': { const r = routine(b.dataset.rid); if (r) startWorkout(newDraft(r, r.id)); break; }
    case 'start-free': startWorkout(newDraft({name:'Allenamento libero', items:[]})).then(ok => { if (ok) pickExercises([]).then(ids => ids.length && addToDraft(ids)); }); break;
    case 'repeat': { const s = S.sessions.find(x => x.id === b.dataset.id); if (s) startWorkout(newDraft(s, s.rid && routine(s.rid) ? s.rid : null)); break; }
    case 'resume': nav({name:'session'}); break;
    case 'discard': ask(d && d.editId ? 'Annullare le modifiche?' : 'Scartare l’allenamento in corso?', d && d.editId ? 'Annulla modifiche' : 'Scarta', true).then(y => { if (y){ S.draft = null; save(); stopRest(); render(); } }); break;
    case 'discard-in': ask('Scartare l’allenamento in corso? Le serie segnate andranno perse.', 'Scarta', true).then(y => { if (y){ S.draft = null; save(); stopRest(); back(); } }); break;
    case 'routine': { const r = routine(b.dataset.rid); if (r) routineSheet(r); break; }
    case 'new-routine': openRoutineEditor({id:uid(), name:'', focus:'', cardio:0, cardioNote:'', rot:true, items:[]}, true); break;
    case 'edit-routine': { const r = routine(b.dataset.rid); if (r) openRoutineEditor(r, false); break; }
    case 'dup-routine': { const r = routine(b.dataset.rid); if (!r) break; const c = Object.assign(clone(r), {id:uid(), name:r.name + ' (copia)', rot:false}); S.routines.splice(S.routines.indexOf(r) + 1, 0, c); save(); render(); toast('Scheda duplicata'); break; }
    case 'del-routine': { const r = routine(b.dataset.rid); if (!r) break; ask(`Eliminare la scheda ${esc(r.name)}? Lo storico degli allenamenti resta.`, 'Elimina', true).then(y => { if (!y) return; S.routines = S.routines.filter(x => x.id !== r.id); save(); if (V().name === 'redit') back(); else render(); toast('Scheda eliminata'); }); break; }
    case 'rt-up': case 'rt-down': { const i = +b.dataset.i, j = a === 'rt-up' ? i - 1 : i + 1; if (j < 0 || j >= S.routines.length) break; [S.routines[i], S.routines[j]] = [S.routines[j], S.routines[i]]; save(); render(); break; }
    case 'rt-rot': { const r = S.routines[+b.dataset.i]; r.rot = !r.rot; save(); render(); break; }
    case 'restore-v1': S.routines = v1Routines(); save(); render(); toast('Scheda ripristinata'); break;
    case 'template': applyTemplate(b.dataset.t); render(); toast('Schede aggiunte'); break;
    case 'templates': { const ov = openSheet(`<h3>Modelli</h3><p></p><div class="list">${TEMPLATES.map(t => `<button class="row" data-act="template" data-t="${t.id}"><span class="t"><b>${t.n}</b></span><span class="r"><span class="chev">›</span></span></button>`).join('')}</div>`); break; }
    case 'skip-onboard': S.onboard = false; save(); render(); break;
    /* editor scheda */
    case 'r-rot': V().r.rot = !V().r.rot; render(); break;
    case 'r-add': pickExercises(V().r.items.map(x => x.ex)).then(ids => { if (!ids.length) return; V().r.items.push(...ids.map(newItem)); render(); window.scrollTo(0, document.body.scrollHeight); }); break;
    case 'r-up': case 'r-down': { const L = V().r.items, i = +b.dataset.i, j = a === 'r-up' ? i - 1 : i + 1; if (j < 0 || j >= L.length) break; [L[i], L[j]] = [L[j], L[i]]; render(); break; }
    case 'r-del': V().r.items.splice(+b.dataset.i, 1); render(); break;
    case 'r-swap': { const L = V().r.items, i = +b.dataset.i; pickExercises(L.map(x => x.ex), true).then(ids => { if (!ids.length) return; const n = newItem(ids[0]), same = EX(ids[0]).t === EX(L[i].ex).t;
      L[i] = Object.assign({}, L[i], {ex:ids[0], inc:0, r:same ? L[i].r : n.r, rir:same ? L[i].rir : n.rir}); render(); }); break; }
    case 'r-main': { const it = V().r.items[+b.dataset.i]; it.main = !it.main; render(); break; }
    case 'r-ss': { const it = V().r.items[+b.dataset.i]; it.ss = !it.ss; render(); break; }
    case 'r-save': {
      const v = V(), r = v.r;
      if (!r.name.trim()){ toast('Dai un nome alla scheda'); document.getElementById('rf-n').focus(); break; }
      if (!r.items.length){ toast('Aggiungi almeno un esercizio'); break; }
      r.name = r.name.trim(); r.items.forEach(it => { it.s = Math.max(1, Math.min(20, parseInt(it.s) || 1)); it.r = [parseInt(it.r[0]) || 1, Math.max(parseInt(it.r[1]) || 1, parseInt(it.r[0]) || 1)]; });
      const i = S.routines.findIndex(x => x.id === r.id); if (i >= 0) S.routines[i] = r; else S.routines.push(r);
      save(); back(); toast('Scheda salvata'); break; }
    /* sessione */
    case 'add-ex': pickExercises(d.items.map(x => x.ex)).then(ids => ids.length && addToDraft(ids)); break;
    case 'ex-menu': exMenu(b.dataset.ex); break;
    case 'check': {
      primeAudio();
      const row = b.closest('.set'), exId = row.dataset.ex, i = +row.dataset.i, arr = d.sets[exId], x = arr[i];
      if (!x.done){
        const kgI = row.querySelector('[data-k="kg"]'), rpI = row.querySelector('[data-k="reps"]');
        if (x.reps === '' && rpI.placeholder && !isNaN(num(rpI.placeholder))) x.reps = String(num(rpI.placeholder));
        if (x.kg === '' && kgI.placeholder && num(kgI.placeholder) != null && kgI.placeholder !== '0') x.kg = String(num(kgI.placeholder));
        if (x.reps === ''){ rpI.focus(); toast('Inserisci le ripetizioni'); return; }
      }
      x.done = !x.done; if (x.done) buzz(12);
      if (x.done && arr[i + 1] && arr[i + 1].kg === '' && x.kg !== '' && x.t !== 'w') arr[i + 1].kg = x.kg;
      if (x.done && d.open) delete d.open[exId];
      saveSoon(); updateCount();
      const idx = d.items.findIndex(t => t.ex === exId), it = d.items[idx], e2 = EX(exId);
      if (x.done && isPR(e2, x, bestBefore(exId, d.editId, d.editId ? d.date : null)))
        { toast(`Nuovo record su ${e2.n}${e2.t === 'w' ? `: 1RM stimato ${fmtN(e1rm(x.kg, x.reps))} ${U()}` : ''}`, true); celebrate(28); buzz([20, 60, 40]); }
      const inSS = it.ss && idx < d.items.length - 1;
      if (x.done && !d.editId && S.settings.autoRest){ if (inSS) stopRest(); else startRest(x.t === 'w' ? Math.min(60, restOf(it)) : restOf(it)); }
      refreshEx(exId);
      if (x.done){ const nr = document.querySelector(`section[data-exid="${CSS.escape(exId)}"] .set[data-i="${i}"]`); if (nr) nr.classList.add("just"); }
      if (x.done){
        let target = null;
        if (inSS) target = document.querySelector(`section[data-exid="${CSS.escape(d.items[idx + 1].ex)}"]`);
        else if (arr.every(y => y.done)) target = document.querySelector('section.ex.cur');
        else if (idx > 0 && d.items[idx - 1].ss){ let k = idx - 1; while (k > 0 && d.items[k - 1].ss) k--; const first = d.sets[d.items[k].ex]; if (first.some(y => !y.done)) target = document.querySelector(`section[data-exid="${CSS.escape(d.items[k].ex)}"]`); }
        if (target) setTimeout(() => target.scrollIntoView({behavior:'smooth', block:'start'}), 120);
      }
      break; }
    case 'set-type': {
      const row = b.closest('.set'), x = d.sets[row.dataset.ex][+row.dataset.i];
      const exId = row.dataset.ex, cur = x.t || 'n', [num0] = setLabel(d.sets[exId], +row.dataset.i);
      const opts = [['n', 'Allenante', cur === 'n' ? num0 : '1', 'Conta per volume e record'], ['w', 'Riscaldamento', 'R', 'Non conta nei record'], ['d', 'Drop set', 'D', 'Scendi di peso senza pausa'], ['f', 'Cedimento', 'C', 'Fino a non riuscire più']];
      const ov = openSheet(`<h3>Tipo di serie</h3><p></p><div class="typeList">${opts.map(([k, n, L, s]) => `<button class="typeOpt ${cur === k ? 'on' : ''}" data-ty="${k}"><span class="i ${k}">${L}</span><span><b>${n}</b></span></button>`).join('')}</div>`);
      ov.addEventListener('click', ev => { const o = ev.target.closest('[data-ty]'); if (!o) return;
        if (o.dataset.ty === 'n') delete x.t; else x.t = o.dataset.ty; saveSoon(); ov.remove(); refreshEx(exId); updateCount(); });
      break; }
    case 'add-warm': { const arr = d.sets[b.dataset.ex], at = arr.filter(x => x.t === 'w').length;
      arr.splice(at, 0, {kg:'', reps:'', t:'w', done:false}); saveSoon(); refreshEx(b.dataset.ex); updateCount();
      const inp = document.querySelector(`section[data-exid="${CSS.escape(b.dataset.ex)}"] .set[data-i="${at}"] [data-k="kg"]`); if (inp) inp.focus(); break; }
    case 'toggle-ex': d.open = d.open || {}; d.open[b.dataset.ex] = true; refreshEx(b.dataset.ex); break;
    case 'add-set': { const arr = d.sets[b.dataset.ex], last = arr[arr.length - 1] || {}; arr.push({kg:last.kg || '', reps:'', done:false}); saveSoon(); refreshEx(b.dataset.ex); updateCount(); break; }
    case 'del-set': { const arr = d.sets[b.dataset.ex]; if (arr.length > 1 && !arr[arr.length - 1].done){ arr.pop(); saveSoon(); refreshEx(b.dataset.ex); updateCount(); } break; }
    case 'ex-note': { const id = b.dataset.ex; textSheet('Nota fissa', 'Resta su questo esercizio in tutti gli allenamenti.', S.exNotes[id], 'Es. sedile al 4, presa larga').then(t => { if (t == null) return; t = t.trim(); if (t) S.exNotes[id] = t; else delete S.exNotes[id]; save(); refreshEx(id); }); break; }
    case 'ex-rest': { const id = b.dataset.ex, it = d.items.find(x => x.ex === id);
      const ov = openSheet(`<h3>Recupero</h3><p></p><div class="grid3">${[30, 45, 60, 75, 90, 120, 150, 180, 240, 300].map(s => `<button class="chip" data-rs="${s}" style="${restOf(it) === s ? 'border-color:var(--or);color:var(--or)' : ''}">${restFmt(s)}</button>`).join('')}</div>`);
      ov.addEventListener('click', ev => { const c = ev.target.closest('[data-rs]'); if (!c) return; it.rest = +c.dataset.rs; save(); ov.remove(); refreshEx(id); });
      break; }
    case 'ex-replace': { const id = b.dataset.ex; pickExercises(d.items.map(x => x.ex), true).then(ids => { if (!ids.length) return;
      const nid = ids[0], it = d.items.find(x => x.ex === id), n = newItem(nid);
      Object.assign(it, {ex:nid, inc:0}); if (EX(nid).t !== EX(id).t){ it.r = n.r; it.rir = n.rir; }
      delete d.sets[id]; d.sets[nid] = buildSets(it); save(); render(); }); break; }
    case 'ex-move': { const i = d.items.findIndex(x => x.ex === b.dataset.ex), j = i + +b.dataset.d; if (j < 0 || j >= d.items.length) break; [d.items[i], d.items[j]] = [d.items[j], d.items[i]]; save(); render(); break; }
    case 'ex-ss': { const it = d.items.find(x => x.ex === b.dataset.ex); it.ss = !it.ss; save(); render(); break; }
    case 'ex-remove': { const id = b.dataset.ex;
      const doIt = () => { d.items = d.items.filter(x => x.ex !== id); delete d.sets[id]; save(); render(); };
      if (d.sets[id].some(x => x.done)) ask('Rimuovere l’esercizio? Le serie segnate andranno perse.', 'Rimuovi', true).then(y => y && doIt()); else doIt(); break; }
    case 'progress': openProgress(b.dataset.ex); break;
    case 'finish': finish(); break;
    /* storico */
    case 'cal': V().mo = (V().mo || 0) + +b.dataset.d; render(); break;
    case 'edit': {
      const s = S.sessions.find(x => x.id === b.dataset.id); if (!s) break;
      (async () => {
        if (S.draft && !(await ask('Hai un allenamento in corso. Scartarlo per modificare questo?', 'Scarta e modifica', true))) return;
        S.draft = draftFromSession(s); save(); nav({name:'session'});
      })(); break; }
    case 'del': { const id = b.dataset.id; ask('Eliminare questo allenamento?', 'Elimina', true).then(y => { if (y){ S.sessions = S.sessions.filter(x => x.id !== id); save(); back(); toast('Allenamento eliminato'); } }); break; }
    case 'save-as-routine': { const s = S.sessions.find(x => x.id === b.dataset.id); if (!s) break;
      nameSheet('Nome della nuova scheda', s.rid ? s.name + ' (variante)' : '').then(n => { if (!n) return; const r = routineFromSession(s, n); S.routines.push(r); if (!s.rid){ s.rid = r.id; s.name = n; } save(); render(); toast('Scheda creata'); }); break; }
    case 'update-routine': { const s = S.sessions.find(x => x.id === b.dataset.id), r = s && routine(s.rid); if (!r) break;
      r.items = itemsOf(s).filter(it => filled(s.sets[it.ex]).length).map(it => { const old = r.items.find(x => x.ex === it.ex); return old ? Object.assign(clone(old), {ss:it.ss}) : clone(it); });
      save(); render(); toast('Scheda aggiornata'); break; }
    /* esercizi */
    case 'ex-filter': V().m = b.dataset.m; document.querySelectorAll('[data-act="ex-filter"]').forEach(x => x.classList.toggle('on', x === b)); fillExLib(); break;
    case 'new-ex': exForm(null, V().q).then(id => { if (id){ toast('Esercizio creato'); nav({name:'exdetail', ex:id}); } }); break;
    case 'edit-ex': exForm(EX(b.dataset.ex)).then(id => { if (id){ render(); toast('Salvato'); } }); break;
    case 'del-ex': { const id = b.dataset.ex; ask('Archiviare l’esercizio? Sparisce dalla libreria, ma lo storico resta.', 'Archivia', true).then(y => { if (!y) return; S.customEx[id].hidden = true; S.routines.forEach(r => r.items = r.items.filter(x => x.ex !== id)); save(); back(); }); break; }
    case 'ex-metric': V().k = b.dataset.k; render(); break;
    /* progressi */
    case 'period': V().p = +b.dataset.p; render(); break;
    case 'schart': V().c = b.dataset.c; render(); break;
    case 'body-k': V().k = b.dataset.k; render(); break;
    case 'body-add': bodyForm(); break;
    case 'body-del': { const id = b.dataset.id; ask('Eliminare la misurazione?', 'Elimina', true).then(y => { if (y){ S.body = S.body.filter(x => x.id !== id); save(); render(); } }); break; }
    /* impostazioni */
    case 'st-toggle': S.settings[b.dataset.k] = !S.settings[b.dataset.k]; save(); render(); break;
    case 'goal': S.settings.weekGoal = Math.max(1, Math.min(7, S.settings.weekGoal + +b.dataset.d)); save(); render(); break;
    case 'plate': { const p = +b.dataset.p, L = S.settings.plates, i = L.indexOf(p); if (i >= 0){ if (L.length === 1){ toast('Serve almeno un disco'); break; } L.splice(i, 1); } else L.push(p); L.sort((x, y) => y - x); save(); render(); break; }
    case 'unit': setUnit(b.dataset.u); break;
    case 'theme': S.settings.theme = b.dataset.t; save(); applyTheme(); render(); break;
    case 'restart-program': ask('Ripartire dalla settimana 1 da oggi?', 'Riparti').then(y => { if (y){ S.settings.programStart = Date.now(); S.deloadAt = null; save(); render(); } }); break;
    case 'wipe': ask('Cancellare tutto? Allenamenti, schede, esercizi e misure verranno eliminati. Esporta prima un backup.', 'Cancella tutto', true).then(y => y && ask('Sei sicuro? Non si può annullare.', 'Sì, cancella', true)).then(y => { if (!y) return; S = {}; migrate(); save(); stack = [{name:'home'}]; show(); toast('Dati cancellati'); }); break;
    /* home */
    case 'deload': S.deloadAt = Date.now(); save(); render(); toast('Fatto'); break;
    case 'export': exportData(); break;
    case 'export-csv': if (S.sessions.length) exportCSV(); else toast('Non ci sono ancora allenamenti'); break;
    case 'import': document.getElementById('importFile').click(); break;
    /* strumenti */
    case 'tool-1rm': tool1rm(); break;
    case 'tool-timer': toolTimer(); break;
    case 'timer': startRest(+b.dataset.sec); break;
    case 'rest-add': restAdjust(30); break;
    case 'rest-sub': restAdjust(-15); break;
    case 'rest-stop': stopRest(); break;
  }
});
document.addEventListener('input', e => {
  const t = e.target, ds = t.dataset;
  if (ds.k && S.draft && t.closest('.set')){
    const row = t.closest('.set'), exId = row.dataset.ex;
    S.draft.sets[exId][+row.dataset.i][ds.k] = t.value.trim().replace(',', '.'); saveSoon();
  }
  else if (ds.f && S.draft){ S.draft[ds.f] = ds.f === 'bw' ? t.value.trim().replace(',', '.') : t.value; saveSoon(); }
  else if (ds.rf && V().r){ V().r[ds.rf] = ds.rf === 'cardio' ? (parseInt(t.value) || 0) : t.value; }
  else if (ds.if && V().r){
    const it = V().r.items[+ds.i], v = t.value;
    if (ds.if === 'r0') it.r[0] = v; else if (ds.if === 'r1') it.r[1] = v;
    else if (ds.if === 'rest') it.rest = parseInt(v) || 0; else if (ds.if === 'inc') it.inc = num(v) || 0;
    else it[ds.if] = v;
  }
  else if (ds.st){ const n = num(t.value); if (n != null && n >= 0){ S.settings[ds.st] = ds.st === 'deloadEvery' ? Math.round(n) : n; saveSoon(); } }
  else if (ds.exnote){ const v = t.value.trim(); if (v) S.exNotes[ds.exnote] = v; else delete S.exNotes[ds.exnote]; saveSoon(); }
  else if (t.id === 'exSearch'){ V().q = t.value.trim(); fillExLib(); }
});
document.addEventListener('focusin', e => { if (e.target.matches('.set .inp')) e.target.select && setTimeout(() => { try { e.target.select(); } catch(_) {} }, 0); });

show();
(function intro(){
  const el = document.getElementById('intro');
  let seen = false; try { seen = sessionStorage.getItem('traks.intro') === '1'; sessionStorage.setItem('traks.intro', '1'); } catch(_) {}
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const end = () => { el.classList.add('out'); setTimeout(() => el.remove(), 220); };
  if (seen || reduce) { el.remove(); return; }
  el.addEventListener('click', end);
  setTimeout(end, 950);
})();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
