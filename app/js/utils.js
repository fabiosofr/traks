/* Traks — Funzioni di utilità e formattazione */
/* ---------- utilità ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = v => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
const r2 = v => Math.round(v * 100) / 100;
const fmtKg = v => { const n = num(v); return n == null ? '' : String(r2(n)).replace('.', ','); };
const fmtN = (v, d = 1) => { const p = Math.pow(10, d); return (Math.round(v * p) / p).toLocaleString('it-IT'); };
const pad2 = n => String(n).padStart(2, '0');
const dShort = iso => new Date(iso).toLocaleDateString('it-IT', {day:'2-digit', month:'short'}).replace('.', '');
const dWeek = iso => new Date(iso).toLocaleDateString('it-IT', {weekday:'short'}).replace('.', '');
const dLong = iso => new Date(iso).toLocaleDateString('it-IT', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
const dMonth = iso => new Date(iso).toLocaleDateString('it-IT', {month:'long', year:'numeric'});
const fmtDur = ms => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${pad2(m % 60)}`; };
const clock = ms => { const t = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
  return (h ? h + ':' + pad2(m) : m) + ':' + pad2(s); };
const restFmt = sec => sec < 60 ? sec + ' s' : sec % 60 ? `${Math.floor(sec / 60)}:${pad2(sec % 60)} min` : sec / 60 + ' min';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const I_BACK = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
const I_DOWN = '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
const I_X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const I_TIMER = '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V10M10 3h4M18.5 6.5l1.2-1.2"/></svg>';
const I_TRASH = '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg>';
const SEARCH = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
