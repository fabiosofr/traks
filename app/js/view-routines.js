/* Traks — Elenco schede ed editor */
/* =========================================================
   SCHEDE: elenco e editor
   ========================================================= */
function renderRoutines(){
  app.innerHTML = `
    <div class="top"><button class="iconbtn round" data-act="back" aria-label="Indietro">${I_BACK}</button><button class="iconbtn pri" data-act="new-routine">+ Nuova</button></div>
    <div class="doneHero" style="margin-top:24px">Le tue schede</div>
    <div class="listHead"><span>Scheda</span><span>In rotazione</span></div>
    <div class="list">${S.routines.map((r, i) => `<div class="row">
      <button class="t" data-act="routine" data-rid="${r.id}" style="text-align:left;flex:1"><b>${esc(r.name)}</b><span>${r.items.length} esercizi${r.focus ? ' · ' + esc(r.focus) : ''}</span></button>
      <span class="rbtns"><button class="mini" data-act="rt-up" data-i="${i}" aria-label="Sposta su" ${i ? '' : 'disabled style="opacity:.3"'}>↑</button><button class="mini" data-act="rt-down" data-i="${i}" aria-label="Sposta giù" ${i < S.routines.length - 1 ? '' : 'disabled style="opacity:.3"'}>↓</button>
      <button class="sw ${r.rot ? 'on' : ''}" data-act="rt-rot" data-i="${i}" role="switch" aria-checked="${r.rot}" aria-label="In rotazione"></button></span></div>`).join('') || '<p class="empty">Nessuna scheda.</p>'}</div>
    <button class="btn sec" data-act="templates" style="margin-top:20px">Aggiungi da un modello</button>`;
}
function renderRoutineEdit(){
  const v = V(), r = v.r;
  const G = ssGroups(r.items);
  const mus = musclesOfItems(r.items, it => +it.s || 0), mk = Object.keys(mus).sort((a, b) => mus[b] - mus[a]);
  app.innerHTML = `
    <div class="stick"><div class="sessHead">
      <button class="iconbtn round" data-act="back" aria-label="Annulla">${I_X}</button>
      <div class="sessTitle">${v.isNew ? 'Nuova scheda' : 'Modifica'}</div>
      <button class="iconbtn pri" data-act="r-save" style="justify-self:end">Salva</button></div></div>
    <div class="form">
      <div class="field"><label for="rf-n">Nome</label><input class="inp" id="rf-n" data-rf="name" value="${esc(r.name)}" placeholder="Es. Push, Gambe, Full body A"></div>
      <div class="field"><label for="rf-f">Obiettivo o descrizione (facoltativo)</label><input class="inp" id="rf-f" data-rf="focus" value="${esc(r.focus)}" placeholder="Es. Spinta pesante"></div>
      <div class="f2"><div class="field"><label for="rf-c">Cardio finale, minuti</label><input class="inp" id="rf-c" data-rf="cardio" inputmode="numeric" value="${r.cardio || ''}" placeholder="0 = nessuno"></div>
      <div class="field"><label for="rf-cn">Tipo di cardio</label><input class="inp" id="rf-cn" data-rf="cardioNote" value="${esc(r.cardioNote || '')}" placeholder="Camminata in salita"></div></div>
      <div class="swrow" style="padding-top:0"><div><b>In rotazione</b><span>Compare come “prossimo allenamento” a turno con le altre</span></div><button class="sw ${r.rot ? 'on' : ''}" data-act="r-rot" role="switch" aria-checked="${!!r.rot}"></button></div>
    </div>
    <div class="h2row"><h2>Esercizi</h2><span class="mu" style="font-size:13px">${r.items.length} esercizi · ${r.items.reduce((a, it) => a + (+it.s || 0), 0)} serie</span></div>
    <div class="stack">${r.items.map((it, i) => { const e = EX(it.ex), T = TY[e.t] || TY.w; return `
      <div class="ritem ${it.ss && i < r.items.length - 1 ? 'ssl' : ''}">
        <div class="rhead"><b>${G[i] ? `<span class="tag blue" style="margin-right:6px">${G[i]}</span>` : ''}${esc(e.n)}<small>${M[e.m] || ''} · ${EQ[e.eq] || ''}</small></b>
          <span class="rbtns"><button class="mini" data-act="r-up" data-i="${i}" aria-label="Sposta su">↑</button><button class="mini" data-act="r-down" data-i="${i}" aria-label="Sposta giù">↓</button><button class="mini" data-act="r-swap" data-i="${i}" aria-label="Sostituisci">⇄</button><button class="mini" data-act="r-del" data-i="${i}" aria-label="Rimuovi">✕</button></span></div>
        <div class="rgrid">
          <div><label>Serie</label><input class="inp sm" inputmode="numeric" data-if="s" data-i="${i}" value="${it.s}"></div>
          <div><label>${T.b} min</label><input class="inp sm" inputmode="numeric" data-if="r0" data-i="${i}" value="${it.r[0]}"></div>
          <div><label>${T.b} max</label><input class="inp sm" inputmode="numeric" data-if="r1" data-i="${i}" value="${it.r[1]}"></div>
          <div><label>RIR</label><input class="inp sm" data-if="rir" data-i="${i}" value="${esc(it.rir)}" placeholder="—"></div>
          <div><label>Recupero s</label><input class="inp sm" inputmode="numeric" data-if="rest" data-i="${i}" value="${it.rest || ''}" placeholder="${restOf(Object.assign({}, it, {rest:0}))}"></div>
        </div>
        <div class="rtog">
          <button class="tbtn ${it.main ? 'on' : ''}" data-act="r-main" data-i="${i}">Principale</button>
          ${i < r.items.length - 1 ? `<button class="tbtn blue ${it.ss ? 'on' : ''}" data-act="r-ss" data-i="${i}">Superserie col successivo</button>` : ''}
          ${e.t === 'w' ? `<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mu)">Salto di carico <input class="inp sm" inputmode="decimal" data-if="inc" data-i="${i}" value="${it.inc ? fmtKg(it.inc) : ''}" placeholder="${fmtKg(defInc(e))}" style="width:64px;height:34px;font-size:13px"> ${U()}</span>` : ''}
        </div>
        <input class="inp note-in" data-if="note" data-i="${i}" value="${esc(it.note)}" placeholder="Nota per questo esercizio (facoltativa)">
      </div>`; }).join('')}</div>
    <button class="btn ghost" data-act="r-add" style="margin-top:12px">+ Aggiungi esercizi</button>
    ${mk.length ? `<div class="card" style="margin-top:22px"><h4>Serie per muscolo</h4>
      <div class="mchips">${mk.map(k => `<span class="mchip ${mus[k] < 2 ? 'low' : ''}">${M[k]}<b>${fmtN(mus[k])}</b></span>`).join('')}</div></div>` : ''}
    ${v.isNew ? '' : `<button class="btn sec" data-act="del-routine" data-rid="${r.id}" style="margin-top:22px;color:var(--fail)">Elimina scheda</button>`}
    <div style="height:40px"></div>`;
}
function openRoutineEditor(r, isNew){ nav({name:'redit', r:clone(r), isNew}); }
