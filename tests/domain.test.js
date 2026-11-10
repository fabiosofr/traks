// Test delle funzioni di calcolo. Avvio: node --test tests/
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path'), vm = require('vm');

function load(state){
  const store = {}; if (state) store['traks.v1'] = JSON.stringify(state);
  const ctx = vm.createContext({console, localStorage: {getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }}, setTimeout, clearTimeout});
  const src = ['exercise-data', 'utils', 'store', 'domain'].map(f => fs.readFileSync(path.join(__dirname, '..', 'app', 'js', f + '.js'), 'utf8')).join('\n');
  vm.runInContext(src + '\nthis.T = {S: () => S, e1rm, volume, setsDone, records, streaks, nextRoutine, closedRange, lastPerf, work, ssGroups, newItem, weightSeries, num, fmtKg};', ctx);
  return {T: ctx.T, store};
}
const day = n => new Date(Date.now() - n * 864e5).toISOString();
const sess = (id, ago, rid, sets) => ({id, rid, name: rid, date: day(ago), start: day(ago), dur: 36e5, items: Object.keys(sets).map(ex => ({ex, s: 3, r: [6, 8]})), sets});

test('1RM stimato (Epley)', () => {
  const {T} = load();
  assert.strictEqual(T.e1rm(100, 1), 100);
  assert.ok(Math.abs(T.e1rm(100, 5) - 116.67) < 0.01);
  assert.strictEqual(T.e1rm('', 5), 0);
});

test('numeri con la virgola', () => {
  const {T} = load();
  assert.strictEqual(T.num('82,5'), 82.5);
  assert.strictEqual(T.num(''), null);
  assert.strictEqual(T.fmtKg('82.5'), '82,5');
});

test('primo avvio: nessuna scheda, benvenuto attivo', () => {
  const {T} = load();
  assert.strictEqual(T.S().v, 2);
  assert.strictEqual(T.S().routines.length, 0);
  assert.strictEqual(T.S().onboard, true);
});

test('i dati della versione 1 vengono convertiti senza perdite', () => {
  const {T} = load({sessions: [{id: 'a', day: 'UA', date: day(2), sets: {'panca-piana': [{kg: '80', reps: '6'}]}, bw: '79.5'}]});
  const S = T.S();
  assert.strictEqual(S.routines.length, 4);
  assert.strictEqual(S.sessions.length, 1);
  assert.strictEqual(S.sessions[0].rid, 'UA');
  assert.strictEqual(S.sessions[0].sets['panca-piana'][0].kg, '80');
  assert.strictEqual(T.nextRoutine().id, 'LA');
});

test('il riscaldamento non conta in volume e serie', () => {
  const {T} = load();
  const s = sess('x', 1, 'A', {'panca-piana': [{kg: '40', reps: '10', t: 'w'}, {kg: '80', reps: '6'}, {kg: '80', reps: '6'}]});
  assert.strictEqual(T.volume(s), 960);
  assert.strictEqual(T.setsDone(s), 2);
});

test('record: solo se supera una prestazione precedente', () => {
  const {T} = load();
  const a = sess('a', 5, 'A', {'panca-piana': [{kg: '80', reps: '6'}]}), b = sess('b', 1, 'A', {'panca-piana': [{kg: '82.5', reps: '6'}]});
  T.S().sessions.push(b, a);
  assert.strictEqual(T.records(a).length, 0);
  assert.strictEqual(T.records(b).length, 1);
});

test('progressione: aumento solo a range chiuso su tutte le serie', () => {
  const {T} = load();
  const it = {ex: 'panca-piana', s: 3, r: [6, 8]};
  const full = [{kg: '80', reps: '8'}, {kg: '80', reps: '8'}, {kg: '80', reps: '8'}];
  assert.strictEqual(T.closedRange(it, {work: full}), true);
  assert.strictEqual(T.closedRange(it, {work: [...full.slice(0, 2), {kg: '80', reps: '7'}]}), false);
  assert.strictEqual(T.closedRange(it, {work: full.slice(0, 2)}), false);
  assert.strictEqual(T.closedRange(it, null), false);
});

test('superserie: gruppi consecutivi', () => {
  const {T} = load();
  assert.deepStrictEqual(Array.from(T.ssGroups([{ss: true}, {ss: false}, {}, {ss: true}, {ss: true}, {}])), ['A', 'A', '', 'B', 'B', 'B']);
});
