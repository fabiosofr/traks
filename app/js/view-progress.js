/* Traks — Progressi, corpo, traguardi */
/* =========================================================
   PROGRESSI
   ========================================================= */
function renderStats(){
  const v = V(); v.p = v.p ?? 90;
  const P = v.p, from = P ? Date.now() - P * DAY_MS : 0;
  const ss = S.sessions.filter(s => new Date(s.date).getTime() >= from);
  const tot = ss.reduce((a, s) => ({dur:a.dur + (s.dur || 0), vol:a.vol + volume(s), sets:a.sets + setsDone(s)}), {dur:0, vol:0, sets:0});
  const nW = 12, ws = weekStart(), weeks = Array.from({length:nW}, (_, i) => ws - (nW - 1 - i) * WEEK_MS);
  const wv = weeks.map(w => S.sessions.filter(s => { const t = new Date(s.date).getTime(); return t >= w && t < w + WEEK_MS; }));
  const wl = weeks.map(w => { const d = new Date(w); return d.getDate() + '/' + (d.getMonth() + 1); });
  v.c = v.c || 'vol';
  const chartVals = v.c === 'vol' ? wv.map(l => l.reduce((a, s) => a + volume(s), 0)) : v.c === 'n' ? wv.map(l => l.length) : wv.map(l => l.reduce((a, s) => a + (s.dur || 0), 0) / 60000);
  const fmtC = v.c === 'vol' ? x => x >= 1000 ? fmtN(x / 1000) + 't' : Math.round(x) : x => Math.round(x);
  const spanW = Math.max(1, P ? P / 7 : ss.length ? (Date.now() - new Date(ss[ss.length - 1].date).getTime()) / WEEK_MS : 1);
  const mus = {};
  for (const s of ss){ const m = musclesOfItems(itemsOf(s), it => work(s.sets[it.ex]).length); for (const k in m) mus[k] = (mus[k] || 0) + m[k]; }
  const mk = Object.keys(M).filter(k => k !== 'car' && k !== 'tot').sort((a, b) => (mus[b] || 0) - (mus[a] || 0));
  const st = streaks(), ev = prEvents(), evP = ev.filter(x => new Date(x.s.date).getTime() >= from);
  const wsr = weightSeries(), lastW = wsr[wsr.length - 1];
  const topEx = Object.entries(exUsage()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => EX(id)).filter(e => e.t === 'w');
  app.innerHTML = `
    <div class="top"><div class="mark">Progressi</div><button class="iconbtn" data-act="ach">Traguardi</button></div>
    <div class="segc" style="margin-top:16px">${[[30, '30 giorni'], [90, '3 mesi'], [365, '1 anno'], [0, 'Sempre']].map(([k, n]) => `<button class="${P === k ? 'on' : ''}" data-act="period" data-p="${k}">${n}</button>`).join('')}</div>
    <div class="stats">
      <div class="stat"><span>Allenamenti</span><b>${ss.length}</b><small class="sub">${fmtN(ss.length / spanW)} a settimana</small></div>
      <div class="stat"><span>Tempo in palestra</span><b>${tot.dur ? fmtDur(tot.dur).replace(' min', '<small> min</small>') : '—'}</b><small class="sub">${ss.length && tot.dur ? 'media ' + fmtDur(tot.dur / ss.length) : ''}</small></div>
      <div class="stat"><span>Volume sollevato</span><b>${fmtN(tot.vol / 1000)}<small> t</small></b><small class="sub">${tot.vol.toLocaleString('it-IT')} ${U()}</small></div>
      <div class="stat"><span>Serie allenanti</span><b>${tot.sets}</b><small class="sub">${evP.length} record nel periodo</small></div>
    </div>
    <div class="card"><div class="calHead"><h4 style="margin:0">Ultime 12 settimane</h4></div>
      <div class="segc" style="margin-top:12px">${[['vol', 'Volume'], ['n', 'Allenamenti'], ['dur', 'Minuti']].map(([k, n]) => `<button class="${v.c === k ? 'on' : ''}" data-act="schart" data-c="${k}">${n}</button>`).join('')}</div>
      ${barChart(chartVals, wl, fmtC)}</div>
    <h2>Serie a settimana per muscolo</h2>
    <div class="card">
      <div class="mbars">${mk.map(k => { const val = (mus[k] || 0) / spanW, mx = 25;
        return `<div class="mbar"><span>${M[k]}</span><span class="tr"><span class="zone" style="left:${10 / mx * 100}%;width:${10 / mx * 100}%"></span><span class="fill grow-x" style="width:${Math.min(100, val / mx * 100)}%;${val >= 10 && val <= 20 ? 'background:var(--ok)' : ''}"></span></span><span class="v">${fmtN(val)}</span></div>`; }).join('')}</div></div>
    ${topEx.length ? `<h2>1RM stimato, esercizi più fatti</h2><div class="list">${topEx.map(e => { const h = exHistory(e.id), now = h.length ? bestE1(h[0].sets[e.id]) : 0;
      const old = h.filter(s => new Date(s.date).getTime() >= from); const first = old.length ? bestE1(old[old.length - 1].sets[e.id]) : now; const d = now - first;
      return `<button class="row" data-act="exdetail" data-ex="${e.id}"><span class="t"><b>${esc(e.n)}</b><span>${h.length} sessioni</span></span><span class="r col"><b style="font-family:var(--disp);color:var(--tx);font-size:15px">${fmtN(now)} ${U()}</b><br><span style="color:${d > 0 ? 'var(--ok)' : d < 0 ? 'var(--fail)' : 'var(--mu)'}">${d > 0 ? '+' : ''}${fmtN(d)}</span></span></button>`; }).join('')}</div>` : ''}
    <h2>Record recenti</h2>
    ${ev.length ? `<div class="list">${ev.slice(0, 8).map(x => `<button class="row" data-act="exdetail" data-ex="${x.e.id}"><span class="t"><b>${esc(x.e.n)}</b><span>${dShort(x.s.date)} · ${x.e.t === 'w' ? '1RM stimato' : x.e.t === 't' ? 'secondi' : 'ripetizioni'}</span></span><span class="r col"><b style="font-family:var(--disp);color:var(--or);font-size:15px">${fmtN(x.val)}</b><br>prima ${fmtN(x.prev)}</span></button>`).join('')}</div>`
      : '<p class="empty">Ancora nessun record.</p>'}
    <div class="h2row"><h2>Corpo</h2><button class="mini" data-act="body">Misure</button></div>
    <button class="card" data-act="body" style="display:block;width:100%;text-align:left">${lastW ? `<h4>Peso: ${fmtN(lastW.v)} ${U()}</h4><p class="cap">${dShort(lastW.date)}</p>${lineChart(wsr.slice(-30), U(), 'Peso')}` : '<h4 style="margin:0">Aggiungi la prima misura</h4>'}</button>`;
}
function renderBody(){
  const v = V(); v.k = v.k || 'w';
  const def = BODY.find(b => b[0] === v.k);
  const pts = v.k === 'w' ? weightSeries() : S.body.filter(b => num(b[v.k])).map(b => ({date:b.date, v:num(b[v.k])})).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const latest = {}; for (const b of S.body.slice().sort((a, c) => String(a.date).localeCompare(String(c.date)))) for (const [k] of BODY) if (num(b[k])) latest[k] = {v:num(b[k]), date:b.date};
  const ws = weightSeries(); if (ws.length) latest.w = {v:ws[ws.length - 1].v, date:ws[ws.length - 1].date};
  app.innerHTML = `
    <div class="top"><button class="iconbtn round" data-act="back" aria-label="Indietro">${I_BACK}</button><button class="iconbtn pri" data-act="body-add">+ Misura</button></div>
    <div class="doneHero" style="margin-top:24px">Corpo</div>
    <div class="pills">${BODY.map(([k, n]) => `<button class="pill ${v.k === k ? 'on' : ''}" data-act="body-k" data-k="${k}">${n}</button>`).join('')}</div>
    <div class="card">${lineChart(pts, lab(def[2]), def[1])}</div>
    <div class="stats">${BODY.filter(([k]) => latest[k]).map(([k, n, u]) => `<div class="stat"><span>${n}</span><b>${fmtN(latest[k].v)}<small> ${lab(u)}</small></b><small class="sub">${dShort(latest[k].date)}</small></div>`).join('')}</div>
    <h2>Misurazioni</h2>
    ${S.body.length ? `<div class="list">${S.body.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).map(b => `<div class="row"><span class="t"><b>${dShort(b.date)}</b><span>${BODY.filter(([k]) => num(b[k])).map(([k, n, u]) => `${n} ${fmtKg(b[k])} ${lab(u)}`).join(' · ')}</span></span><button class="mini" data-act="body-del" data-id="${b.id}" aria-label="Elimina">✕</button></div>`).join('')}</div>`
      : '<p class="empty">Nessuna misurazione.</p>'}`;
}
function bodyForm(){
  const today = new Date().toISOString().slice(0, 10);
  const ov = openSheet(`<h3>Nuova misurazione</h3><p></p>
    <div class="form" style="margin-top:0"><div class="field"><label>Data</label><input class="inp finp" type="date" id="bf-date" value="${today}"></div>
    <div class="f2">${BODY.map(([k, n, u]) => `<div class="field"><label>${n} (${lab(u)})</label><input class="inp" inputmode="decimal" data-bf="${k}" placeholder="—"></div>`).join('')}</div></div>
    <div style="height:18px"></div><button class="btn pri" data-s="ok">Salva</button><button class="btn sec" data-s="no">Annulla</button>`);
  ov.addEventListener('click', ev => {
    const b = ev.target.closest('[data-s]'); if (!b) return;
    if (b.dataset.s === 'ok'){
      const e = {id:uid(), date:new Date((ov.querySelector('#bf-date').value || today) + 'T12:00:00').toISOString()};
      let any = false; ov.querySelectorAll('[data-bf]').forEach(i => { const n = num(i.value); if (n != null){ e[i.dataset.bf] = n; any = true; } });
      if (!any){ toast('Inserisci almeno un valore'); return; }
      S.body.push(e); save(); toast('Misurazione salvata');
    }
    ov.remove(); render();
  });
}

/* ---------- traguardi ---------- */
function achList(){
  const n = S.sessions.length, vol = S.sessions.reduce((a, s) => a + volume(s), 0), sets = S.sessions.reduce((a, s) => a + setsDone(s), 0);
  const pr = prEvents().length, st = streaks().best, ex = Object.keys(exUsage()).length, kg = U() === 'lb' ? 2.2046 : 1;
  const hrs = S.sessions.reduce((a, s) => a + (s.dur || 0), 0) / 36e5;
  return [
    ['Primo passo', 'Il primo allenamento', n, 1], ['In carreggiata', '10 allenamenti', n, 10], ['Abitudine', '25 allenamenti', n, 25],
    ['Mezzo centinaio', '50 allenamenti', n, 50], ['Centurione', '100 allenamenti', n, 100], ['Veterano', '250 allenamenti', n, 250],
    ['Prime 10 tonnellate', `10.000 ${U()} sollevati`, vol, 1e4 * kg], ['Cento tonnellate', `100.000 ${U()} sollevati`, vol, 1e5 * kg], ['Mille tonnellate', `1.000.000 ${U()} sollevati`, vol, 1e6 * kg],
    ['Primo record', 'Batti una tua prestazione', pr, 1], ['Collezionista', '25 record', pr, 25], ['Macchina da record', '100 record', pr, 100],
    ['Costante', '4 settimane di fila sull’obiettivo', st, 4], ['Inarrestabile', '12 settimane di fila', st, 12], ['Mezzo anno', '26 settimane di fila', st, 26],
    ['Mille serie', '1.000 serie allenanti', sets, 1000], ['Esploratore', '20 esercizi diversi', ex, 20], ['Ore di ferro', '100 ore in palestra', hrs, 100]
  ].map(([t, d, v, g]) => ({t, d, v, g, got:v >= g}));
}
function renderAch(){
  const L = achList(), got = L.filter(a => a.got).length;
  app.innerHTML = `
    <div class="top"><button class="iconbtn round" data-act="back" aria-label="Indietro">${I_BACK}</button></div>
    <div class="doneHero" style="margin-top:24px">Traguardi</div>
    <p class="heroSub">${got} su ${L.length} sbloccati</p>
    <div class="ach">${L.map(a => `<div class="${a.got ? 'got' : ''}"><b>${a.t}</b><span>${a.d}</span><div class="pb"><i class="grow-x" style="width:${Math.min(100, a.v / a.g * 100)}%"></i></div></div>`).join('')}</div>`;
}
