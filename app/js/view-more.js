/* Traks — Altro, impostazioni, strumenti, backup */
/* =========================================================
   ALTRO, IMPOSTAZIONI, STRUMENTI
   ========================================================= */
function renderMore(){
  app.innerHTML = `
    <div class="top"><div class="mark">Altro</div></div>
    <h2>Strumenti</h2>
    <div class="tools">
      <button class="tool" data-act="tool-1rm"><b>Calcolo 1RM</b><span>Il tuo massimale stimato</span></button>
      <button class="tool" data-act="tool-timer"><b>Timer</b><span>Un recupero quando vuoi</span></button></div>
    <h2>Sezioni</h2>
    <div class="list">
      <button class="row" data-act="routines"><span class="t"><b>Schede e rotazione</b><span>${S.routines.length} schede, ${rotation().length} in rotazione</span></span><span class="r"><span class="chev">›</span></span></button>
      <button class="row" data-act="body"><span class="t"><b>Misure corporee</b><span>Peso, grasso, circonferenze</span></span><span class="r"><span class="chev">›</span></span></button>
      <button class="row" data-act="ach"><span class="t"><b>Traguardi</b><span>${achList().filter(a => a.got).length} sbloccati</span></span><span class="r"><span class="chev">›</span></span></button>
      <button class="row" data-act="settings"><span class="t"><b>Impostazioni</b><span>Tema, unità, recuperi, obiettivi</span></span><span class="r"><span class="chev">›</span></span></button>
    </div>
    <h2>Backup</h2>
    <div class="list">
      <button class="row" data-act="export"><span class="t"><b>Esporta backup</b><span>${S.lastBackup ? `Ultimo: ${dShort(S.lastBackup)}` : 'Mai fatto'}</span></span><span class="r"><span class="chev">›</span></span></button>
      <button class="row" data-act="import"><span class="t"><b>Importa backup</b></span><span class="r"><span class="chev">›</span></span></button>
      <button class="row" data-act="export-csv"><span class="t"><b>Esporta in CSV</b><span>Per Excel o Fogli Google</span></span><span class="r"><span class="chev">›</span></span></button>
    </div>
    <p class="mu" style="font-size:12px;text-align:center;margin-top:30px">Traks 2.0</p>`;
}
function swRow(k, title, sub){ return `<div class="swrow"><div><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</div><button class="sw ${S.settings[k] ? 'on' : ''}" data-act="st-toggle" data-k="${k}" role="switch" aria-checked="${!!S.settings[k]}"></button></div>`; }
function numRow(k, title, sub, unit){ return `<div class="swrow"><div><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</div><span style="display:flex;align-items:center;gap:6px"><input class="inp" inputmode="decimal" data-st="${k}" value="${esc(fmtKg(S.settings[k]))}">${unit ? `<small class="mu">${unit}</small>` : ''}</span></div>`; }
function renderSettings(){
  const st = S.settings;
  app.innerHTML = `
    <div class="top"><button class="iconbtn round" data-act="back" aria-label="Indietro">${I_BACK}</button></div>
    <div class="doneHero" style="margin-top:24px">Impostazioni</div>
    <h2>Aspetto</h2>
    <div class="segc">${[['auto', 'Sistema'], ['light', 'Chiaro'], ['dark', 'Scuro']].map(([k, n]) => `<button class="${st.theme === k ? 'on' : ''}" data-act="theme" data-t="${k}">${n}</button>`).join('')}</div>
    <h2>Unità</h2>
    <div class="segc"><button class="${st.unit === 'kg' ? 'on' : ''}" data-act="unit" data-u="kg">Chilogrammi</button><button class="${st.unit === 'lb' ? 'on' : ''}" data-act="unit" data-u="lb">Libbre</button></div>
    <h2>Obiettivi</h2>
    <div class="card" style="margin-top:0">
      <div class="swrow"><div><b>Allenamenti a settimana</b></div>
        <span class="stepper"><button data-act="goal" data-d="-1" aria-label="Meno">−</button><b>${st.weekGoal}</b><button data-act="goal" data-d="1" aria-label="Più">+</button></span></div>
    </div>
    <h2>Recuperi</h2>
    <div class="card" style="margin-top:0">
      ${swRow('autoRest', 'Timer automatico', '')}
      ${numRow('restMain', 'Esercizi principali', '', 's')}
      ${numRow('restDef', 'Complementari', '', 's')}
      ${numRow('restBw', 'Corpo libero e a tempo', '', 's')}
      ${swRow('sound', 'Suono a fine recupero', '')}
      ${swRow('vibe', 'Vibrazione', '')}
    </div>
    <h2>Allenamento</h2>
    <div class="card" style="margin-top:0">
      ${swRow('autoInc', 'Progressione automatica', 'Aumenta il carico quando chiudi il range')}
      ${swRow('rirCol', 'Colonna RIR', '')}
    </div>
    <h2>Dati</h2>
    <button class="btn sec" data-act="wipe" style="color:var(--fail)">Cancella tutti i dati</button>`;
}
async function setUnit(u){
  if (u === U()) return;
  const f = u === 'lb' ? 2.20462 : 1 / 2.20462;
  const conv = await ask(`Passare a ${u === 'lb' ? 'libbre' : 'chilogrammi'}?`, 'Converti anche i dati salvati', false, 'Cambia solo l’etichetta');
  if (conv === null) return;
  if (conv){
    const c = v => { const n = num(v); return n == null ? v : String(Math.round(n * f * 10) / 10); };
    const fix = s => { for (const it of itemsOf(s)){ if (EX(it.ex).t === 'c') continue; for (const x of s.sets[it.ex] || []) x.kg = c(x.kg); } if (s.bw) s.bw = c(s.bw); };
    S.sessions.forEach(fix); if (S.draft) fix(S.draft);
    S.body.forEach(b => { if (num(b.w)) b.w = num(c(b.w)); });
    S.routines.forEach(r => r.items.forEach(it => { if (it.inc) it.inc = Math.round(it.inc * f * 4) / 4; }));
  }
  S.settings.unit = u;
  S.settings.bar = u === 'lb' ? 45 : 20;
  S.settings.plates = u === 'lb' ? [45, 35, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25];
  save(); render(); toast(u === 'lb' ? 'Ora in libbre' : 'Ora in chilogrammi');
}

/* ---------- strumenti ---------- */
function tool1rm(){
  const ov = openSheet(`<h3>Calcolo 1RM</h3><div class="howto">Inserisci un peso e quante ripetizioni hai fatto con quel peso, fino a 10–12. Ottieni il <b>massimale stimato</b> e i carichi in percentuale, utili per scegliere il peso delle serie.</div>
    <div class="f2"><div class="field"><label>Peso (${U()})</label><input class="inp" id="t1k" inputmode="decimal" placeholder="80"></div><div class="field"><label>Ripetizioni</label><input class="inp" id="t1r" inputmode="numeric" placeholder="6"></div></div>
    <div id="t1o" style="margin:16px 0"></div><button class="btn sec" data-s="x">Chiudi</button>`);
  const upd = () => {
    const m = e1rm(ov.querySelector('#t1k').value, ov.querySelector('#t1r').value), o = ov.querySelector('#t1o');
    if (!m){ o.innerHTML = ''; return; }
    o.innerHTML = `<div class="stat" style="text-align:center"><span>Massimale stimato</span><b style="font-size:34px">${fmtN(m)}<small> ${U()}</small></b></div>
      <div class="rtable" style="margin-top:10px">${[95, 90, 85, 80, 75, 70, 65, 60].map(p => `<div><span>${p}% · ~${Math.max(1, Math.round(30 * (100 / p - 1)))} rep</span><b>${fmtN(roundTo(m * p / 100, minStep()))}</b></div>`).join('')}</div>`;
  };
  ov.querySelectorAll('input').forEach(i => i.addEventListener('input', upd));
  ov.addEventListener('click', e => { if (e.target.closest('[data-s]')) ov.remove(); });
}
function toolTimer(){
  openSheet(`<h3>Timer</h3><div class="howto">Scegli una durata: il recupero parte subito e alla fine ti avvisa con suono e vibrazione. Dalla barra in basso aggiungi o togli tempo.</div>
    <div class="grid3">${[30, 45, 60, 90, 120, 150, 180, 240, 300].map(s => `<button class="chip" data-act="timer" data-sec="${s}">${restFmt(s)}</button>`).join('')}</div>`);
}

/* ---------- backup ---------- */
function exportData(){
  const data = {settings:S.settings, routines:S.routines, customEx:S.customEx, exNotes:S.exNotes, sessions:S.sessions, body:S.body, deloadAt:S.deloadAt || null};
  const blob = new Blob([JSON.stringify({app:'traks', version:3, exported:new Date().toISOString(), data}, null, 2)], {type:'application/json'});
  download(blob, `traks-backup-${new Date().toISOString().slice(0, 10)}.json`, 'Backup Traks');
  S.lastBackup = new Date().toISOString(); save();
}
function exportCSV(){
  const rows = [['data', 'allenamento', 'esercizio', 'muscolo', 'serie', 'tipo', 'peso_' + U(), 'ripetizioni', 'rir', 'durata_min', 'note']];
  for (const s of S.sessions.slice().reverse()) for (const it of itemsOf(s)){
    const e = EX(it.ex);
    filled(s.sets[it.ex]).forEach((x, i) => rows.push([s.date.slice(0, 10), s.name, e.n, M[e.m] || '', i + 1, {w:'riscaldamento', d:'drop', f:'cedimento'}[x.t] || 'normale', fmtKg(x.kg), x.reps, x.rir ?? '', s.dur ? Math.round(s.dur / 60000) : '', i === 0 ? s.note || '' : '']));
  }
  const csv = '﻿' + rows.map(r => r.map(c => { const t = String(c ?? ''); return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; }).join(';')).join('\n');
  download(new Blob([csv], {type:'text/csv'}), `traks-${new Date().toISOString().slice(0, 10)}.csv`, 'Traks CSV');
}
function download(blob, name, title){
  try {
    const file = new File([blob], name, {type:blob.type});
    if (navigator.canShare && navigator.canShare({files:[file]})) { navigator.share({files:[file], title}).catch(() => {}); return; }
  } catch(_) {}
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast('File esportato');
}
document.getElementById('importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const raw = JSON.parse(await f.text());
    if (!raw || raw.app && raw.app !== 'traks') throw 0;
    let next;
    if (raw.data && Array.isArray(raw.data.sessions)) next = Object.assign({v:2}, raw.data);
    else if (Array.isArray(raw.sessions)) next = {sessions:raw.sessions, deloadAt:raw.deloadAt};
    else throw 0;
    const n = next.sessions.length;
    if (!(await ask(`Il backup contiene ${n} allenamenti${next.routines ? ` e ${next.routines.length} schede` : ''}. Sostituirà i dati attuali.`, 'Importa', true))) return;
    const keep = {lastBackup:S.lastBackup};
    S = Object.assign(next, keep); migrate(); save(); stack = [{name:'home'}]; show(); toast('Backup importato');
  } catch(_) { toast('File non valido: scegli un backup esportato da Traks'); }
});
