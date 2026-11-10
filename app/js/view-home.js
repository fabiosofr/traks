/* Traks — Schermata Home */
/* =========================================================
   HOME
   ========================================================= */
function renderHome(){
  const rot = rotation(), nr = nextRoutine();
  const wc = thisWeekCount(), goal = S.settings.weekGoal, st = streaks();
  const ws = weekStart(), week = S.sessions.filter(s => new Date(s.date).getTime() >= ws);
  const wkVol = week.reduce((a, s) => a + volume(s), 0);
  const va = weekAvgVals();
  const trained = new Set(week.map(s => (new Date(s.date).getDay() + 6) % 7)), todayIdx = (new Date().getDay() + 6) % 7;
  const welcome = S.onboard && !S.routines.length;
  const others = S.routines.filter(r => !nr || r.id !== nr.id);
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>';
  app.innerHTML = `
    <div class="top home-top"><div class="mark">traks<i>.</i></div><button class="iconbtn round" data-act="tool-timer" aria-label="Timer">${I_TIMER}</button></div>
    ${S.draft ? `<div class="banner"><p>${S.draft.editId ? 'Stai modificando' : 'Allenamento in corso:'} <b>${esc(S.draft.name)}</b> · ${setsDoneDraft(S.draft)} serie segnate</p>
      <div class="row-gap"><button class="btn pri" data-act="resume">Riprendi</button><button class="btn sec" data-act="discard">${S.draft.editId ? 'Annulla' : 'Scarta'}</button></div></div>` : ''}
    ${welcome ? `<section class="today welcome"><p class="kicker">Benvenuto in Traks</p><h1 class="hero long">I tuoi allenamenti</h1>
      <div class="list">${TEMPLATES.map(t => `<button class="row" data-act="template" data-t="${t.id}"><span class="t"><b>${t.n}</b></span><span class="r"><span class="chev">›</span></span></button>`).join('')}
        <button class="row add" data-act="new-routine">+ Crea la mia scheda da zero</button></div>
      <button class="link" data-act="skip-onboard">Salta</button></section>`
    : `<section class="today">
      ${nr ? `<p class="kicker">Prossimo allenamento</p>
        <h1 class="hero ${nr.name.length > 9 ? 'long' : ''}">${esc(nr.name)}</h1>
        <p class="heroSub">${nr.focus ? esc(nr.focus) + ' · ' : ''}${nr.items.length} esercizi · ${nr.items.reduce((a, it) => a + +it.s, 0)} serie</p>
        <button class="btn pri" data-act="start" data-rid="${nr.id}">${PLAY}Inizia allenamento</button>`
      : `<p class="kicker">${S.routines.length ? 'Nessuna scheda in rotazione' : 'Nessuna scheda'}</p><h1 class="hero long">Pronto quando vuoi</h1>
        <button class="btn pri" data-act="new-routine">Crea una scheda</button>`}
      <div class="rot">${others.map(r => `<button data-act="start" data-rid="${r.id}">${esc(r.name)}</button>`).join('')}<button class="free" data-act="start-free">+ Libero</button></div>
    </section>`}
    <div class="home-grid"><div>
    <div class="h2row"><h2>Questa settimana</h2><b class="wkCount">${wc}<small> / ${goal}</small></b></div>
    <div class="card weekCard">
      ${plateMeter(wc, goal)}
      <div class="wkDays">${['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => `<div class="${trained.has(i) ? 'on' : ''} ${i === todayIdx ? 'now' : ''}">${d}<i></i></div>`).join('')}</div>
    </div>
    <div class="card metrics">
      <div><span>Volume</span>${wkVol ? `<b>${fmtN(wkVol / 1000, 1)}<small> t</small></b>` : '<b class="na">—</b>'}</div>
      <div><span>Sett. di fila</span><b class="${st.cur ? '' : 'na'}">${st.cur}</b></div>
      <button data-act="body"><span>Peso medio</span>${va.length ? `<b>${fmtN(va.reduce((a, b) => a + b, 0) / va.length)}<small> ${U()}</small></b>` : '<b class="na">—</b>'}</button>
    </div>
    </div><div>
    ${welcome ? '' : `<div class="h2row"><h2>Schede</h2><button class="mini" data-act="routines">Gestisci</button></div>
    <div class="list">${S.routines.map(r => `<button class="row" data-act="routine" data-rid="${r.id}">
      <span class="t"><b>${esc(r.name)}</b><span>${r.focus ? esc(r.focus) + ' · ' : ''}${r.items.length} esercizi</span></span>
      <span class="r">${r.rot ? '' : '<span class="tag grey">Fuori rotazione</span>'}<span class="chev">›</span></span></button>`).join('')}
      <button class="row add" data-act="new-routine">+ Nuova scheda</button></div>`}
    ${S.sessions.length ? `<div class="h2row"><h2>Ultimi allenamenti</h2>${S.sessions.length > 5 ? '<button class="mini" data-tab="history">Tutti</button>' : ''}</div>
      <div class="list">${S.sessions.slice(0, 5).map(itemHTML).join('')}</div>` : ''}
    </div></div>
    ${storageOk ? '' : `<p class="warn">Il salvataggio non funziona in questa anteprima. Installa Traks sul telefono per tenere i dati.</p>`}
  `;
}
function setsDoneDraft(d){ let n = 0; for (const k in d.sets) n += d.sets[k].filter(x => x.done).length; return n; }
function itemHTML(s){
  const pr = records(s).length;
  return `<button class="item" data-act="detail" data-id="${s.id}">
    <span class="d">${new Date(s.date).getDate()}<small>${new Date(s.date).toLocaleDateString('it-IT', {month:'short'}).replace('.', '')}</small></span>
    <span class="n">${esc(s.name)}${s.dur ? `<small>${fmtDur(s.dur)}${volume(s) ? ' · ' + volume(s).toLocaleString('it-IT') + ' ' + U() : ''}</small>` : ''}</span>
    <span class="c">${setsDone(s)}/${plannedSets(s)} serie${pr ? `<b>${pr} record</b>` : ''}</span></button>`;
}
function routineSheet(r){
  const G = ssGroups(r.items);
  openSheet(`<h3>${esc(r.name)}</h3><p>${r.focus ? esc(r.focus) + ' · ' : ''}${r.items.length} esercizi${r.cardio ? ` · cardio ${r.cardio} min` : ''}</p>
    <div class="plist" style="max-height:40vh;margin-bottom:16px">${r.items.map((it, i) => `<div><span style="color:var(--tx);white-space:normal">${G[i] ? `<span class="tag blue" style="margin-right:6px">${G[i]}</span>` : ''}${esc(EX(it.ex).n)}</span><b>${it.s} × ${range(it)}</b></div>`).join('') || '<div><span>Nessun esercizio</span></div>'}</div>
    <button class="btn pri" data-act="start" data-rid="${r.id}">Inizia</button>
    <div class="row-gap"><button class="btn sec" data-act="edit-routine" data-rid="${r.id}">Modifica</button><button class="btn sec" data-act="dup-routine" data-rid="${r.id}">Duplica</button></div>
    <button class="btn sec" data-act="del-routine" data-rid="${r.id}" style="color:var(--fail)">Elimina scheda</button>`);
}
