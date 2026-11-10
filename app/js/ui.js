/* Traks — Pannelli, conferme, timer di recupero */
/* ---------- dialoghi ---------- */
function openSheet(html){
  const ov = document.createElement('div'); ov.className = 'ov'; ov.innerHTML = `<div class="sheet" role="dialog">${html}</div>`;
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov); return ov;
}
function ask(msg, yes, danger, alt){
  return new Promise(res => {
    const ov = openSheet(`<h3>${msg}</h3><p></p>
      <button class="btn pri ${danger ? 'danger' : ''}" data-ask="1">${yes}</button>
      ${alt ? `<button class="btn sec" data-ask="2">${alt}</button>` : ''}
      <button class="btn sec" data-ask="0">Annulla</button>`);
    ov.addEventListener('click', e => {
      const b = e.target.closest('[data-ask]');
      if (e.target === ov) return res(alt ? null : false);
      if (b){ ov.remove(); const v = b.dataset.ask; res(alt ? (v === '1' ? true : v === '2' ? false : null) : v === '1'); }
    });
  });
}
function textSheet(title, sub, val, ph){
  return new Promise(res => {
    const ov = openSheet(`<h3>${title}</h3><p>${sub}</p><textarea class="inp" id="tsv" placeholder="${esc(ph || '')}">${esc(val || '')}</textarea>
      <div style="height:12px"></div><button class="btn pri" data-s="ok">Salva</button><button class="btn sec" data-s="no">Annulla</button>`);
    ov.addEventListener('click', e => { if (e.target === ov) return res(null); const b = e.target.closest('[data-s]'); if (!b) return; const v = ov.querySelector('#tsv').value; ov.remove(); res(b.dataset.s === 'ok' ? v : null); });
    setTimeout(() => ov.querySelector('#tsv').focus(), 300);
  });
}
function nameSheet(title, val){
  return new Promise(res => {
    const ov = openSheet(`<h3>${title}</h3><p></p><input class="inp finp" id="nsv" value="${esc(val || '')}">
      <div style="height:12px"></div><button class="btn pri" data-s="ok">Salva</button><button class="btn sec" data-s="no">Annulla</button>`);
    ov.addEventListener('click', e => { if (e.target === ov) return res(null); const b = e.target.closest('[data-s]'); if (!b) return; const v = ov.querySelector('#nsv').value.trim(); if (b.dataset.s === 'ok' && !v){ toast('Scrivi un nome'); return; } ov.remove(); res(b.dataset.s === 'ok' ? v : null); });
    setTimeout(() => ov.querySelector('#nsv').select(), 300);
  });
}
function exMenu(id){
  const d = S.draft, i = d.items.findIndex(x => x.ex === id), it = d.items[i], e = EX(id);
  openSheet(`<h3>${esc(e.n)}</h3><p>${M[e.m] || ''} · ${EQ[e.eq] || ''}</p>
    <button class="btn sec" data-act="ex-note" data-ex="${id}">${S.exNotes[id] ? 'Modifica la tua nota' : 'Aggiungi una nota fissa'}</button>
    <button class="btn sec" data-act="ex-rest" data-ex="${id}">Recupero: ${restFmt(restOf(it))}</button>
    <button class="btn sec" data-act="ex-replace" data-ex="${id}">Sostituisci esercizio</button>
    <div class="row-gap"><button class="btn sec" data-act="ex-move" data-d="-1" data-ex="${id}" ${i ? '' : 'disabled style="opacity:.4"'}>Sposta su</button><button class="btn sec" data-act="ex-move" data-d="1" data-ex="${id}" ${i < d.items.length - 1 ? '' : 'disabled style="opacity:.4"'}>Sposta giù</button></div>
    ${i < d.items.length - 1 ? `<button class="btn sec" data-act="ex-ss" data-ex="${id}">${it.ss ? 'Togli la superserie col successivo' : 'Superserie con il successivo'}</button>` : ''}
    <button class="btn sec" data-act="exdetail" data-ex="${id}">Record e storico</button>
    <button class="btn sec" data-act="ex-remove" data-ex="${id}" style="color:var(--fail)">Rimuovi dall’allenamento</button>`);
}

/* ---------- recupero ---------- */
const restEl = document.getElementById('rest');
let rest = {end:0, total:0, int:null}, actx = null;
function primeAudio(){ try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch(_) {} }
function beep(){
  if (!S.settings.sound) return;
  try {
    if (!actx) return; const t = actx.currentTime;
    [0, .22].forEach(off => { const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = 880; g.gain.setValueAtTime(.0001, t + off); g.gain.exponentialRampToValueAtTime(.25, t + off + .02); g.gain.exponentialRampToValueAtTime(.0001, t + off + .16);
      o.connect(g).connect(actx.destination); o.start(t + off); o.stop(t + off + .18); });
  } catch(_) {}
}
function startRest(sec){
  primeAudio();
  rest.total = sec; rest.end = Date.now() + sec * 1000; rest.fired = false; restEl.classList.remove('end'); restEl.classList.add('on');
  clearInterval(rest.int); rest.int = setInterval(tick, 250); tick();
}
function tick(){
  const left = Math.max(0, Math.round((rest.end - Date.now()) / 1000));
  const m = Math.floor(left / 60), s = pad2(left % 60);
  restEl.querySelector('.t').innerHTML = left > 0 ? `${m}:${s}<small>Recupero</small>` : `Vai<small>Recupero finito</small>`;
  restEl.querySelector('.bar').style.width = (rest.total ? left / rest.total * 100 : 0) + '%';
  restEl.querySelector('.rf').style.strokeDashoffset = String(138.2 * (1 - (rest.total ? left / rest.total : 0)));
  if (left <= 0 && !rest.fired){
    rest.fired = true; clearInterval(rest.int); restEl.classList.add('end');
    if (S.settings.vibe && navigator.vibrate) navigator.vibrate([250, 120, 250]);
    beep();
    setTimeout(() => { if (rest.end <= Date.now()) stopRest(); }, 4000);
  }
}
function stopRest(){ clearInterval(rest.int); restEl.classList.remove('on'); }
function restAdjust(sec){ rest.end = Math.max(Date.now() + 1000, rest.end + sec * 1000); rest.total = Math.max(rest.total + sec, 1); rest.fired = false; restEl.classList.remove('end'); clearInterval(rest.int); rest.int = setInterval(tick, 250); tick(); }
