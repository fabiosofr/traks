/* Traks — Libreria esercizi, costanti e modelli di scheda */
/* =========================================================
   LIBRERIA ESERCIZI
   id | nome | muscolo | secondari | attrezzo | tipo
   tipi: w peso×reps, b corpo libero (+zavorra), a assistito, t a tempo, c cardio km+min
   ========================================================= */
const LIBRAW = `
panca-piana|Panca piana bilanciere|pet|tri,spa|bil|w
panca-inclinata-bil|Panca inclinata bilanciere|pet|spa,tri|bil|w
panca-declinata|Panca declinata bilanciere|pet|tri|bil|w
panca-manubri|Panca piana manubri|pet|tri,spa|man|w
inclinata-30|Panca inclinata 30° manubri|pet|spa,tri|man|w
inclinata-15|Panca inclinata 15° manubri|pet|spa,tri|man|w
panca-mp|Panca piana al multipower|pet|tri,spa|mp|w
chest-press|Chest press macchina|pet|tri,spa|mac|w
chest-press-incl|Chest press inclinata macchina|pet|spa,tri|mac|w
croci-manubri|Croci manubri|pet||man|w
croci-cavi|Croci ai cavi|pet||cav|w
croci-cavi-basso|Croci ai cavi dal basso|pet|spa|cav|w
pec-deck|Pec deck|pet||mac|w
dip-petto|Dip alle parallele|pet|tri,spa|cl|b
piegamenti|Piegamenti|pet|tri,spa|cl|b
pullover|Pullover manubrio|pet|dor|man|w
trazioni|Trazioni zavorrate / lat machine|dor|bic|cl|w
trazioni-cl|Trazioni|dor|bic|cl|b
trazioni-supine|Trazioni presa supina|dor|bic|cl|b
trazioni-assistite|Trazioni assistite|dor|bic|mac|a
lat-prona|Lat machine prona|dor|bic|cav|w
lat-supina|Lat machine presa supina|dor|bic|cav|w
lat-stretta|Lat machine presa stretta|dor|bic|cav|w
lat-monobraccio|Lat machine monobraccio|dor|bic|cav|w
pulley|Pulley presa stretta|dor|bic|cav|w
pulley-larga|Pulley presa larga|dor|spa,bic|cav|w
rematore-bil|Rematore bilanciere|dor|bic,lom|bil|w
rematore-manubrio|Rematore manubrio|dor|bic|man|w
chest-row|Chest supported row|dor|bic,spa|mac|w
t-bar|T-bar row|dor|bic|bil|w
row-macchina|Row macchina|dor|bic|mac|w
pullover-cavo|Pullover al cavo|dor||cav|w
stacco|Stacco da terra|dor|fem,glu,lom|bil|w
stacco-sumo|Stacco sumo|glu|qua,fem,dor|bil|w
rack-pull|Rack pull|dor|glu,lom,trp|bil|w
hyperext|Hyperextension|lom|glu,fem|cl|b
military|Military press bilanciere|spa|tri|bil|w
shoulder-manubri|Shoulder press manubri|spa|tri|man|w
shoulder|Shoulder press macchina|spa|tri|mac|w
arnold|Arnold press|spa|tri|man|w
alzate-manubri|Alzate laterali manubri|spa||man|w
alzate-cavo|Alzate laterali cavo|spa||cav|w
alzate-macchina|Alzate laterali macchina|spa||mac|w
alzate-frontali|Alzate frontali|spa||man|w
alzate-posteriori|Alzate posteriori manubri|spa|dor|man|w
reverse-pec|Reverse pec deck|spa|dor|mac|w
face-pull|Face pull|spa|trp|cav|w
tirate-mento|Tirate al mento|spa|trp|bil|w
scrollate|Scrollate manubri|trp||man|w
scrollate-bil|Scrollate bilanciere|trp||bil|w
curl-bil|Curl bilanciere|bic|avb|bil|w
curl-ez|Curl bilanciere EZ|bic|avb|ez|w
curl-manubri|Curl manubri|bic|avb|man|w
hammer|Hammer curl|bic|avb|man|w
curl-panca-incl|Curl su panca inclinata|bic||man|w
curl-concentrato|Curl concentrato|bic||man|w
curl-scott|Curl alla panca Scott|bic||ez|w
curl-cavo|Curl al cavo|bic||cav|w
curl-macchina|Curl macchina|bic||mac|w
curl-bayesian|Bayesian curl al cavo|bic||cav|w
pushdown|Pushdown cavi|tri||cav|w
pushdown-corda|Pushdown con corda|tri||cav|w
french-press|French press EZ|tri||ez|w
overhead-cavo|Estensioni sopra la testa al cavo|tri||cav|w
overhead-manubrio|Estensioni sopra la testa manubrio|tri||man|w
panca-stretta|Panca presa stretta|tri|pet|bil|w
dip-tricipiti|Dip tricipiti|tri|pet|cl|b
dip-macchina|Dip macchina|tri|pet|mac|w
kickback|Kickback manubrio|tri||man|w
wrist-curl|Wrist curl|avb||man|w
reverse-curl|Curl presa inversa|avb|bic|ez|w
farmer|Farmer walk|avb|trp|man|t
squat|Squat bilanciere|qua|glu,lom|bil|w
front-squat|Front squat|qua|glu|bil|w
hack|Hack squat|qua|glu|mac|w
pendulum|Pendulum squat|qua|glu|mac|w
leg-press|Leg press|qua|glu|mac|w
squat-mp|Squat al multipower|qua|glu|mp|w
goblet|Goblet squat|qua|glu|kb|w
bulgarian|Bulgarian split squat|qua|glu,fem|man|w
affondi|Affondi manubri|qua|glu|man|w
affondi-camminata|Affondi in camminata|qua|glu|man|w
step-up|Step up|qua|glu|man|w
leg-ext|Leg extension|qua||mac|w
sissy|Sissy squat|qua||cl|b
rdl|RDL manubri|fem|glu,lom|man|w
rdl-bil|Stacco rumeno bilanciere|fem|glu,lom|bil|w
stacco-gambe-tese|Stacco a gambe tese|fem|glu,lom|bil|w
curl-seduto|Leg curl seduto|fem||mac|w
curl-sdraiato|Leg curl sdraiato|fem||mac|w
nordic|Nordic curl|fem||cl|b
good-morning|Good morning|fem|lom,glu|bil|w
hip-thrust|Hip thrust bilanciere|glu|fem|bil|w
hip-thrust-mac|Hip thrust macchina|glu|fem|mac|w
glute-bridge|Glute bridge|glu|fem|cl|b
kickback-cavo|Slanci al cavo|glu||cav|w
abductor|Abductor macchina|glu||mac|w
adductor|Adductor macchina|adu||mac|w
swing|Kettlebell swing|glu|fem,lom|kb|w
calf-piedi|Calf in piedi|pol||mac|w
calf-seduto|Calf seduto|pol||mac|w
calf-leg-press|Calf alla leg press|pol||mac|w
calf-singolo|Calf monopodalico|pol||cl|b
crunch|Crunch|add||cl|b
crunch-cavo|Crunch al cavo|add||cav|w
crunch-macchina|Crunch macchina|add||mac|w
leg-raises|Leg raises alla sbarra|add||cl|b
knee-raises|Knee raises|add||cl|b
plank|Plank|add||cl|t
side-plank|Side plank|add||cl|t
dead-bug|Dead bug|add||cl|b
ab-wheel|Ab wheel|add||cl|b
russian-twist|Russian twist|add||cl|b
pallof|Pallof press|add||cav|w
hollow|Hollow hold|add||cl|t
clean|Girata al petto|tot|fem,glu,trp|bil|w
thruster|Thruster|tot|qua,spa|bil|w
burpees|Burpees|tot||cl|b
corsa|Corsa|car||alt|c
tapis|Camminata in salita|car||mac|c
cyclette|Cyclette|car||mac|c
ellittica|Ellittica|car||mac|c
vogatore|Vogatore|car||mac|c
scale|Stair climber|car||mac|c
bici|Bici|car||alt|c
nuoto|Nuoto|car||alt|c
corda|Salto della corda|car||alt|t`;
const LIB = {};
LIBRAW.trim().split('\n').forEach(l => { const [id, n, m, m2, eq, t] = l.split('|'); LIB[id] = {id, n, m, m2:m2 ? m2.split(',') : [], eq, t}; });

const M = {pet:'Petto', dor:'Dorso', spa:'Spalle', trp:'Trapezi', bic:'Bicipiti', tri:'Tricipiti', avb:'Avambracci', qua:'Quadricipiti', fem:'Femorali', glu:'Glutei', adu:'Adduttori', pol:'Polpacci', add:'Addome', lom:'Lombari', tot:'Total body', car:'Cardio'};
const EQ = {bil:'Bilanciere', man:'Manubri', cav:'Cavi', mac:'Macchina', cl:'Corpo libero', kb:'Kettlebell', ez:'Bilanciere EZ', mp:'Multipower', ela:'Elastici', alt:'Altro'};
const TY = {
  w:{n:'Peso e ripetizioni', a:'U', b:'reps'},
  b:{n:'Corpo libero, zavorra facoltativa', a:'+U', b:'reps'},
  a:{n:'Assistito (peso di aiuto)', a:'−U', b:'reps'},
  t:{n:'A tempo (secondi)', a:'U', b:'sec'},
  c:{n:'Cardio (distanza e minuti)', a:'km', b:'min'}
};
const BODY = [['w','Peso','U'],['bf','Grasso corporeo','%'],['waist','Vita','cm'],['chest','Petto','cm'],['arm','Braccio','cm'],['thigh','Coscia','cm'],['hips','Fianchi','cm'],['neck','Collo','cm']];

/* la scheda della versione 1, usata per convertire i dati vecchi e come punto di partenza */
const PROGRAM_V1 = [
  {id:'UA', name:'Upper A', focus:'Spinta pesante', cardio:true, ex:[
    {id:'panca-piana', s:4, r:[4,6], rir:'1-2', main:true, inc:'2,5'},
    {id:'lat-prona', s:3, r:[6,8], rir:'1-2'},
    {id:'inclinata-30', s:3, r:[8,10], rir:'1-2'},
    {id:'chest-row', s:3, r:[8,10], rir:'1-2'},
    {id:'alzate-cavo', s:3, r:[10,15], rir:'0-1', note:'Parti dal lato sinistro'},
    {id:'pushdown', s:3, r:[10,12], rir:'0-1', ss:true},
    {id:'hammer', s:3, r:[10,12], rir:'0-1'}]},
  {id:'LA', name:'Lower A', focus:'Quadricipiti', cardio:false, ex:[
    {id:'hack', s:4, r:[5,8], rir:'1-2', main:true, inc:'5'},
    {id:'bulgarian', s:3, r:[8,10], rir:'2', note:'Ripetizioni per gamba'},
    {id:'leg-ext', s:3, r:[10,15], rir:'0-1'},
    {id:'curl-seduto', s:3, r:[10,12], rir:'0-1'},
    {id:'calf-piedi', s:4, r:[8,12], rir:'0-1'},
    {id:'dead-bug', s:3, r:[10,10], bw:true, note:'Ripetizioni per lato'}]},
  {id:'UB', name:'Upper B', focus:'Tirata pesante', cardio:true, ex:[
    {id:'trazioni', s:4, r:[4,6], rir:'1-2', main:true, inc:'2,5', note:'Segna la zavorra o il peso della lat'},
    {id:'shoulder', s:3, r:[6,8], rir:'1-2'},
    {id:'inclinata-15', s:3, r:[8,10], rir:'1-2'},
    {id:'pulley', s:3, r:[8,10], rir:'1-2'},
    {id:'alzate-manubri', s:3, r:[12,15], rir:'0-1'},
    {id:'curl-ez', s:3, r:[8,10], rir:'0-1'},
    {id:'face-pull', s:2, r:[15,15]}]},
  {id:'LB', name:'Lower B', focus:'Catena posteriore', cardio:false, ex:[
    {id:'rdl', s:4, r:[6,8], rir:'1-2', main:true, inc:'5'},
    {id:'leg-press', s:3, r:[8,12], rir:'1-2', note:'Piedi a metà pedana'},
    {id:'curl-sdraiato', s:3, r:[8,12], rir:'0-1'},
    {id:'calf-seduto', s:4, r:[10,15], rir:'0-1'},
    {id:'leg-raises', s:3, r:[8,12], rir:'0-1', bw:true},
    {id:'side-plank', s:3, r:[30,45], bw:true, note:'Secondi per lato'}]}
];

const DEF_SET = {theme:'dark', unit:'kg', bar:20, plates:[25,20,15,10,5,2.5,1.25], weekGoal:4, restDef:120, restMain:180, restBw:60,
  autoRest:true, autoInc:true, rirCol:false, sound:true, vibe:true, rientro:false, deloadEvery:6, programStart:null};
const PLATE_OPTS = {kg:[50,25,20,15,10,5,2.5,2,1.25,1,0.5], lb:[55,45,35,25,15,10,5,2.5,1.25]};
const DAY_MS = 864e5, WEEK_MS = 7 * DAY_MS;
