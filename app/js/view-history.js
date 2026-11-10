/* Traks — Fine allenamento, storico, dettaglio */
/* =========================================================
   FINE, STORICO, DETTAGLIO
   ========================================================= */
function muscleChips(s){
  const m = musclesOfItems(itemsOf(s), it => work(s.sets[it.ex]).length);
  const keys = Object.keys(m).sort((a, b) => m[b] - m[a]);
  return keys.length ? `<div class="mchips">${keys.map(k => `<span class="mchip ${m[k] < 1 ? 'low' : ''}">${M[k]}<b>${fmtN(m[k])}</b></span>`).join('')}</div>` : '';
}
function structureChanged(s){
  const r = s.rid && routine(s.rid); if (!r) return false;
  const a = r.items.map(x => x.ex).join(','), b = itemsOf(s).filter(it => filled(s.sets[it.ex]).length).map(x => x.ex).join(',');
  return a !== b && itemsOf(s).map(x => x.ex).join(',') !== a;
}
function renderDone(){
  const s = S.sessions.find(x => x.id === V().id); if (!s){ tab('home'); return; }
  const rec = records(s);
  app.innerHTML = `
    <div class="top"><div class="mark">traks<i>.</i></div></div>
    <div class="doneHero">${esc(s.name)}<span>salvato</span></div>
    <div class="stats three">
      <div class="stat"><span>Durata</span><b>${s.dur ? fmtDur(s.dur).replace(' min', '<small> min</small>') : '—'}</b></div>
      <div class="stat"><span>Serie</span><b>${setsDone(s)}<small>/${plannedSets(s)}</small></b></div>
      <div class="stat"><span>Volume</span><b>${volume(s).toLocaleString('it-IT')}<small> ${U()}</small></b></div>
    </div>
    ${rec.length ? `<div class="records"><h3>${rec.length === 1 ? 'Nuovo record' : rec.length + ' nuovi record'}</h3>${rec.map(r => `<p><b>${esc(r.e.n)}</b><span>${r.what}: ${r.txt}, ${r.prev}</span></p>`).join('')}</div>` : ''}
    ${muscleChips(s) ? `<div class="card"><h4>Muscoli</h4>${muscleChips(s)}</div>` : ''}
    <div style="height:22px"></div>
    <button class="btn pri" data-tab="home">Fine</button>
    ${!s.rid ? `<button class="btn sec" data-act="save-as-routine" data-id="${s.id}">Salva come scheda</button>` : ''}
    ${structureChanged(s) ? `<button class="btn sec" data-act="update-routine" data-id="${s.id}">Aggiorna la scheda con questi esercizi</button>` : ''}
    `;
}
function renderHistory(){
  const v = V(); v.mo = v.mo || 0;
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + v.mo);
  const y = base.getFullYear(), m = base.getMonth();
  const days = new Date(y, m + 1, 0).getDate(), off = (new Date(y, m, 1).getDay() + 6) % 7;
  const byDay = {};
  for (const s of S.sessions){ const d = new Date(s.date); if (d.getFullYear() === y && d.getMonth() === m) (byDay[d.getDate()] = byDay[d.getDate()] || []).push(s); }
  const today = new Date(), isCur = today.getFullYear() === y && today.getMonth() === m;
    let cal = ['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(x => `<div class="h">${x}</div>`).join('');
  for (let i = 0; i < off; i++) cal += '<div class="c x"></div>';
  for (let d = 1; d <= days; d++){ const l = byDay[d];
    cal += l ? `<button class="c on ${isCur && d === today.getDate() ? 'today' : ''}" data-act="detail" data-id="${l[0].id}" aria-label="${d}, ${esc(l[0].name)}">${d}</button>` : `<div class="c ${isCur && d === today.getDate() ? 'today' : ''}">${d}</div>`; }
  let list = '', lastM = '';
  for (const s of S.sessions){ const mm = dMonth(s.date); if (mm !== lastM){ list += `${lastM ? '</div>' : ''}<div class="month">${mm}</div><div class="list">`; lastM = mm; } list += itemHTML(s); }
  if (lastM) list += '</div>';
  app.innerHTML = `
    <div class="top"><div class="mark">Storico</div><span class="mu" style="font-size:14px">${S.sessions.length} allenamenti</span></div>
    <div class="card" style="margin-top:16px">
      <div class="calHead"><button class="mini" data-act="cal" data-d="-1" aria-label="Mese precedente">‹</button><b>${base.toLocaleDateString('it-IT', {month:'long', year:'numeric'})}</b><button class="mini" data-act="cal" data-d="1" aria-label="Mese successivo">›</button></div>
      <div class="cal">${cal}</div>
    </div>
    ${S.sessions.length ? list : `<p class="empty">Nessun allenamento salvato.</p>`}`;
}
function renderDetail(){
  const s = S.sessions.find(x => x.id === V().id); if (!s){ back(); return; }
  const rec = records(s), recEx = new Set(rec.map(r => r.e.id));
  const G = ssGroups(itemsOf(s));
  app.innerHTML = `
    <div class="top"><button class="iconbtn round" data-act="back" aria-label="Indietro">${I_BACK}</button>
      <div class="row-gap"><button class="iconbtn" data-act="edit" data-id="${s.id}">Modifica</button><button class="iconbtn round" data-act="del" data-id="${s.id}" aria-label="Elimina">${I_TRASH}</button></div></div>
    <div class="doneHero" style="margin-top:24px">${esc(s.name)}</div>
    <p class="heroSub">${dLong(s.date)}${s.dur ? ', ' + fmtDur(s.dur) : ''}</p>
    <div class="stats three" style="margin-top:0">
      <div class="stat"><span>Serie</span><b>${setsDone(s)}<small>/${plannedSets(s)}</small></b></div>
      <div class="stat"><span>Volume</span><b>${volume(s).toLocaleString('it-IT')}<small> ${U()}</small></b></div>
      <div class="stat"><span>Record</span><b>${rec.length}</b></div>
    </div>
    ${muscleChips(s)}
    <div style="height:16px"></div>
    <button class="btn pri" data-act="repeat" data-id="${s.id}">Ripeti questo allenamento</button>
    <button class="btn sec" data-act="save-as-routine" data-id="${s.id}">Salva come scheda</button>
    <div class="detail">${itemsOf(s).map((it, i) => { const e = EX(it.ex), f = filled(s.sets[it.ex]), e1 = e.t === 'w' ? bestE1(f) : 0;
      return `<div class="ex ${G[i] ? 'ssg' : ''}"><div class="exTop"><div class="exName">${esc(e.n)} ${recEx.has(e.id) ? '<span class="tag gold">Record</span>' : ''}</div>${f.length ? `<button class="mini" data-act="exdetail" data-ex="${it.ex}">Progressi</button>` : ''}</div>
      <div class="vals">${f.length ? esc(perfText(e, f)) : '<span style="color:var(--mu)">Non fatto</span>'}</div>
      ${e1 ? `<div class="last" style="margin-top:6px">1RM stimato ${fmtN(e1)} ${U()} · volume ${Math.round(volSets(f)).toLocaleString('it-IT')} ${U()}</div>` : ''}</div>`; }).join('')}
      ${s.cardio ? `<div class="ex"><div class="exName">Cardio</div><div class="vals">${esc(s.cardio)} min</div></div>` : ''}
      ${s.bw ? `<div class="ex"><div class="exName">Peso corporeo</div><div class="vals">${esc(fmtKg(s.bw))} ${U()}</div></div>` : ''}
      ${s.note ? `<div class="ex"><div class="exName">Note</div><div class="last">${esc(s.note)}</div></div>` : ''}
    </div>`;
}
function routineFromSession(s, name){
  return {id:uid(), name, focus:s.focus || '', cardio:s.cardioOn ? (num(s.cardio) || 15) : 0, cardioNote:s.cardioNote || '', rot:false,
    items:itemsOf(s).map(it => Object.assign(clone(it), {s:Math.max(work(s.sets[it.ex]).length, 1)}))};
}
