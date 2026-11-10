# Traks — Piano di implementazione

Riferimenti: `PROJECT_AUDIT.md` e le Master Project Instructions.

## Decisioni di architettura

### 1. Lo stack resta quello attuale
HTML, CSS e JavaScript puro, senza framework e senza build. Il file unico viene diviso in moduli (`app/css`, `app/js`), ma il codice non viene riscritto. Motivo: funziona, è collaudato, e chi clona il repository non deve installare nulla per avviare l'app.

### 2. Prima il dispositivo, poi il cloud
L'app continua a salvare tutto sul dispositivo e a funzionare offline. La sincronizzazione con il database è uno strato in più, attivo solo se configurato.

Ne derivano tre modalità con lo stesso codice:

| Modalità | Dati | Per chi |
|---|---|---|
| **Locale** | Solo sul dispositivo, nessun account | Chi clona e usa l'app da solo |
| **Condivisa** | Dispositivo + Supabase, un account per persona | Il gruppo di amici su un unico hosting |
| **Demo** | Dati dimostrativi in uno spazio separato, mai mescolati ai reali | Chi vuole provare |

### 3. Backend: Supabase
Scelto perché ha un piano gratuito sufficiente per un gruppo di amici e copre tutto ciò che serve senza scrivere un server:

- **Auth**: registrazione, login, logout, recupero password, eliminazione account.
- **PostgreSQL con Row Level Security**: ogni riga appartiene a un utente e solo lui la legge o la modifica. I controlli sono nel database, non nel frontend.
- **Storage privato**: foto dei progressi, accessibili solo al proprietario.
- **Edge Functions**: custodiscono la chiave del provider AI, che non arriva mai al browser, e applicano i limiti di utilizzo.

Registrazione a invito: un codice configurabile, verificato lato server da una funzione del database al momento dell'iscrizione.

L'unica libreria esterna prevista è il client `supabase-js`, caricato solo in modalità condivisa.

### 4. Hosting
Il frontend è statico: va bene GitHub Pages, Netlify o Cloudflare Pages (tutti gratuiti). Il database e le funzioni stanno su Supabase. Nessun deploy viene fatto in automatico.

### 5. Navigazione
Le cinque sezioni richieste, con ciò che esiste oggi ridistribuito senza perdere nulla:

| Nuova sezione | Contiene |
|---|---|
| **Home** | Dashboard del giorno, allenamento programmato, settimana, record recenti, recupero, nutrizione |
| **Workout** | Schede, rotazione, libreria esercizi, storico, sessione |
| **Progressi** | Statistiche, grafici, record, heatmap, corpo, foto, traguardi |
| **Nutrition** | Diario, alimenti, obiettivi, acqua |
| **Profilo** | Dati personali, recupero, impostazioni, backup, account, privacy |

AI Coach: pulsante sempre raggiungibile da ogni sezione.

### 6. Nota su scelte precedenti
Nei giorni scorsi sono stati tolti dall'app il saluto con la data e i suggerimenti sempre visibili. Le nuove istruzioni chiedono una Home con saluto, data e suggerimenti AI: tornano, ma dentro la dashboard e in forma sobria, non come testo esplicativo sparso nelle schermate.

## Fasi

Ogni fase si chiude solo dopo il collaudo nel browser (telefono e desktop) e con i test automatici verdi.

### STEP 1 — Audit ✅
- `PROJECT_AUDIT.md`, `IMPLEMENTATION_PLAN.md`.

### STEP 2 — Foundation
1. Repository git, `.gitignore`, `README.md`, `.env.example`. ✅ in questa sessione
2. Divisione di `index.html` in moduli CSS e JS, senza cambiare il comportamento. ✅ in questa sessione
3. Test automatici delle funzioni di calcolo (`node --test`, nessuna dipendenza).
4. Livello dati: ogni record con identificativo, proprietario e data di modifica; coda delle modifiche da sincronizzare.
5. Schema Supabase (`supabase/migrations`) con RLS su tutte le tabelle; funzione per il codice invito.
6. Schermate di accesso: registrazione con codice invito, login, logout, recupero password; scelta "usa senza account"; modalità demo.
7. Sincronizzazione dispositivo ↔ database, con importazione dei dati locali già presenti al primo accesso.
8. Design system: tema chiaro e scuro, componenti documentati, layout desktop.
9. Testi raccolti in un file unico per lingua (`app/js/i18n/it.js`).

### STEP 3 — Core fitness
- Onboarding: obiettivo, livello, giorni disponibili, attrezzatura.
- Nuova Home dinamica (giorno di allenamento / giorno di riposo).
- Sezione Workout con schede, storico e libreria.
- Schede: RPE oltre al RIR, rest-pause, modello Bro Split, pianificazione settimanale per giorno.
- Progressione: double progression (esiste), lineare, basata sul RIR, basata sul volume; sempre calcolata sulla prestazione reale.
- Libreria: nome inglese, descrizione, difficoltà, istruzioni, errori comuni, consigli, varianti, alternative, preferiti, recenti. I testi tecnici vanno scritti e riletti esercizio per esercizio.
- Fine allenamento: confronto con la sessione precedente della stessa scheda.

### STEP 4 — Analytics
- Heatmap muscolare anatomica (fronte e retro, SVG).
- Volume, intensità, frequenza e performance mostrati come metriche distinte.
- Confronto tra periodi, filtri per esercizio e muscolo.
- Misure personalizzate.
- Foto dei progressi (Storage privato in modalità condivisa, IndexedDB in locale) e confronto affiancato.

### STEP 5 — AI
- Edge Function `coach`: riceve la domanda, legge i dati dell'utente con la sua sessione (quindi con RLS), chiama il provider configurato, risponde in italiano.
- Provider configurabile tramite variabili d'ambiente lato server; limiti giornalieri per utente.
- Le modifiche a schede o dati sono proposte e applicate solo dopo conferma.
- Senza configurazione, la sezione mostra come attivarla e il resto dell'app funziona normalmente.
- Analisi che non richiedono AI (stalli, volume per muscolo, frequenza) calcolate in locale e disponibili sempre.

### STEP 6 — Wellness
- Nutrition: diario per pasto, calorie, macro, fibre, acqua, preferiti, ricette, obiettivi, riepiloghi.
- Database alimenti: Open Food Facts (aperto, con fonte dichiarata) per la ricerca online, più un elenco base di alimenti generici con fonte indicata; i valori inseriti a mano sono marcati come stimati. Predisposizione per il barcode.
- Recupero: sonno, frequenza a riposo, passi, stanchezza, dolori, qualità percepita; solo andamento, nessuna diagnosi e nessun semaforo "puoi allenarti".
- Punti di aggancio documentati per Apple Health, Health Connect, Garmin, Fitbit.

### STEP 7 — Advanced
- Gamification: estensione dei traguardi esistenti, sfide personali, condivisione del riepilogo.
- Community (solo modalità condivisa): amici, condivisione facoltativa degli allenamenti, classifiche facoltative; tutto disattivato in partenza.
- Video analysis: solo struttura e documentazione del limite. Non verrà dichiarata funzionante.

### STEP 8 — Final quality
- Revisione di UI, accessibilità, prestazioni, sicurezza (RLS provata con due account), responsive.
- Documentazione finale e controllo che nel repository non ci siano segreti.

## Cosa serve dal proprietario del progetto

Queste azioni non possono essere fatte dall'assistente:

1. Creare un progetto gratuito su supabase.com e copiare URL e chiave pubblica nel file di configurazione (istruzioni nel README quando la fase sarà pronta).
2. Creare il repository su GitHub e fare il primo push.
3. Per l'AI Coach: una chiave API del provider scelto, da inserire tra i segreti di Supabase.

Fino ad allora tutto viene sviluppato e collaudato in modalità locale; la parte condivisa viene preparata e documentata, ma il collaudo con due account reali richiede il punto 1.

## Dati esistenti

- La chiave `traks.v1` e il formato attuale restano validi.
- Ogni cambio di formato passa da una funzione di migrazione, come già avviene dalla versione 1 alla 2.
- Prima di ogni migrazione l'app conserva una copia dello stato precedente sul dispositivo.
