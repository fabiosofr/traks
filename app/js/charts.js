/* Traks — Grafici SVG */
/* =========================================================
   GRAFICI
   ========================================================= */
function lineChart(pts, unit, label){
  if (pts.length < 2) return '<p class="empty" style="padding:6px 0 14px">Servono almeno due sessioni.</p>';
  const W = 320, H = 140, P = 14, L = 6, vs = pts.map(p => p.v), mn = Math.min(...vs), mx = Math.max(...vs), span = mx - mn || 1;
  const xy = pts.map((p, i) => [L + P + i * (W - 2 * P - L) / (pts.length - 1), H - P - (p.v - mn) / span * (H - 2 * P)]);
  const area = `M${xy[0][0]},${H - P} ` + xy.map(a => `L${a[0]},${a[1]}`).join(' ') + ` L${xy[xy.length - 1][0]},${H - P} Z`;
  const first = pts[0].v, lastV = pts[pts.length - 1].v, diff = lastV - first;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
    <defs><linearGradient id="g${pts.length}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".22"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
    <line x1="${L + P}" x2="${W - P}" y1="${H - P}" y2="${H - P}" class="c-axis"/>
    <line x1="${L + P}" x2="${W - P}" y1="${P}" y2="${P}" class="c-grid" stroke-dasharray="3 4"/>
    <text x="${L + P}" y="${P - 4}" class="c-text" font-size="10">${fmtN(mx)}</text>
    <path class="areaIn" d="${area}" fill="url(#g${pts.length})"/>
    <polyline class="draw c-line" pathLength="1" fill="none" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${xy.map(a => a.join(',')).join(' ')}"/>
    ${xy.length <= 40 ? xy.map((a, i) => `<circle class="dotIn c-dot ${i === xy.length - 1 ? 'now' : ''}" style="animation-delay:${(.15 + i / xy.length * .8).toFixed(2)}s" cx="${a[0]}" cy="${a[1]}" r="${i === xy.length - 1 ? 5 : 2.5}"/>`).join('') : `<circle cx="${xy[xy.length - 1][0]}" cy="${xy[xy.length - 1][1]}" r="5" class="c-dot now"/>`}
  </svg><div class="chartLeg"><span>${dShort(pts[0].date)}</span><span>${esc(label)}: ${fmtN(first)} → ${fmtN(lastV)} ${unit} (${diff >= 0 ? '+' : ''}${fmtN(diff)})</span><span>${dShort(pts[pts.length - 1].date)}</span></div>`;
}
function barChart(vals, labels, fmt){
  const W = 320, H = 130, P = 16, n = vals.length, mx = Math.max(...vals, 1), bw = (W - 2 * P) / n;
  return `<svg class="chart" viewBox="0 0 ${W} ${H + 14}" role="img">
    ${vals.map((v, i) => { const h = v / mx * (H - 2 * P), x = P + i * bw + bw * .18, y = H - P - h;
      return `<rect class="grow c-bar ${i === n - 1 ? 'now' : v ? 'has' : ''}" style="animation-delay:${i * 35}ms" x="${x}" y="${v ? y : H - P - 2}" width="${bw * .64}" height="${v ? Math.max(h, 2) : 2}" rx="3"/>
      ${v && (i === n - 1 || v === mx) ? `<text x="${x + bw * .32}" y="${y - 4}" class="c-val" font-size="9" text-anchor="middle">${fmt(v)}</text>` : ''}
      ${i % 2 === (n - 1) % 2 ? `<text x="${x + bw * .32}" y="${H + 6}" class="c-text" font-size="9" text-anchor="middle">${labels[i]}</text>` : ''}`; }).join('')}
  </svg>`;
}
