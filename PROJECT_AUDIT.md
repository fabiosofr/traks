# Traks — Audit del progetto

Data: 10 novembre 2026. Fotografia del progetto prima dell'evoluzione descritta nelle Master Project Instructions.

## 1. Cos'è oggi

Traks è una web app installabile (PWA) per registrare gli allenamenti in palestra. È in italiano, pensata prima per smartphone, e funziona interamente sul dispositivo: nessun server, nessun account.

| Aspetto | Stato |
|---|---|
| Stack | HTML + CSS + JavaScript puro, nessun framework, nessuna dipendenza, nessuna build |
| Struttura | Un solo file `index.html` di 2.141 righe (≈500 CSS, ≈1.600 JS) |
| Persistenza | `localStorage`, chiave `traks.v1`, un unico oggetto JSON (`S`) |
| Offline | Service worker `sw.js` (pagina dalla rete, risorse dalla cache) |
| PWA | `manifest.webmanifest`, icone, installabile |
| Backend, database, API | Assenti |
| Autenticazione, utenti | Assenti: un dispositivo = un utente |
| Test automatici | Assenti (solo collaudi manuali nel browser) |
| Git / GitHub | Nessun repository |
| Documentazione | Assente |

## 2. Funzionalità presenti e funzionanti

Verificate nel browser a misura di telefono (collaudo del 9 novembre, oltre 40 passaggi).

**Allenamento**
- Schede illimitate con rotazione automatica ("prossimo allenamento").
- Modelli di partenza: Upper/Lower, Push Pull Legs, Full body, Principiante.
- Editor scheda: esercizi, serie, range di ripetizioni, RIR, recupero, salto di carico, note, superserie, riordino, sostituzione, duplicazione, eliminazione.
- Sessione: peso, ripetizioni, RIR per serie (facoltativo), spunta serie, tipi di serie (allenante, riscaldamento, drop set, cedimento), aggiunta/rimozione/sostituzione/riordino esercizi durante la sessione, allenamento libero.
- Timer di recupero automatico e modificabile, con suono e vibrazione.
- Valori dell'ultima sessione già proposti nei campi; aumento del carico proposto quando si chiude il range (double progression).
- Salvataggio automatico della sessione in corso e ripresa dopo chiusura.
- Record personali in tempo reale (peso massimo, 1RM stimato con formula di Epley, ripetizioni).
- Riepilogo di fine allenamento: durata, serie, volume, record, muscoli allenati.

**Storico e progressi**
- Storico con calendario mensile, dettaglio, modifica, ripetizione, eliminazione.
- Statistiche per periodo, grafici delle ultime 12 settimane (volume, allenamenti, minuti).
- Serie settimanali per gruppo muscolare.
- Scheda esercizio: grafici (1RM stimato, peso max, volume, ripetizioni), record, record per numero di ripetizioni.
- Misure corporee: peso, grasso, vita, petto, braccio, coscia, fianchi, collo.
- Traguardi (18) e serie di settimane consecutive sull'obiettivo.

**Libreria esercizi**
- Circa 125 esercizi reali con muscolo principale, secondari, attrezzo, tipo di registrazione.
- Esercizi personalizzati, ricerca, filtri per muscolo, note personali.

**Altro**
- Impostazioni: kg/lb con conversione, obiettivo settimanale, recuperi, suono, vibrazione.
- Backup completo in JSON (esporta/importa), esportazione CSV.
- Strumenti: calcolo 1RM, timer.

## 3. Cosa manca rispetto alle istruzioni

| Area richiesta | Stato | Nota |
|---|---|---|
| Multiutente, registrazione, login | Manca | Richiede un backend |
| Database persistente condiviso | Manca | Oggi solo `localStorage` |
| Registrazione a invito | Manca | |
| Modalità demo | Manca | |
| Navigazione Home / Workout / Progressi / Nutrition / Profilo | Diversa | Oggi: Allena / Storico / Esercizi / Progressi / Altro |
| Tema chiaro | Manca | Solo tema scuro |
| Onboarding con profilo | Parziale | Solo scelta del modello di scheda |
| RPE, rest-pause, altri tipi di progressione | Parziale | C'è RIR e double progression |
| Libreria: nome inglese, istruzioni, errori, varianti, difficoltà, preferiti, recenti | Parziale | Ci sono nome, muscoli, attrezzo |
| Muscle heatmap anatomica | Manca | Ci sono le barre per muscolo |
| Foto dei progressi e confronto | Manca | |
| Nutrizione | Manca | |
| Recupero (sonno, passi, stanchezza…) | Manca | |
| AI Coach | Manca | Richiede un server per custodire la chiave |
| Community, sfide | Manca | |
| README, `.gitignore`, `.env.example`, guide | Manca | |
| Test automatici | Manca | |

## 4. Problemi tecnici individuati

1. **File unico.** Tutto in `index.html`: difficile da mantenere, da rivedere su GitHub e da far crescere con le nuove sezioni.
2. **Stato globale.** Un oggetto `S` globale letto e scritto ovunque; va bene oggi, ma serve un livello dati per poterlo sincronizzare con un database.
3. **Dati legati al browser.** Cambiare telefono o svuotare il browser fa perdere tutto, salvo backup manuale.
4. **Nessuna identità utente.** I record non hanno proprietario né data di modifica: servono entrambi per la sincronizzazione.
5. **Nessun test.** Le funzioni di calcolo (1RM, volume, record, serie di settimane) sono pure e facili da coprire.
6. **Tema fisso.** I colori sono già variabili CSS, quindi il tema chiaro è fattibile senza riscrivere.
7. **Testi nel codice.** Le stringhe italiane sono sparse nel codice: per le traduzioni vanno raccolte.
8. **Accessibilità.** Etichette ARIA presenti sui controlli principali; mancano gestione del focus nei pannelli e verifica dei contrasti nel tema chiaro.

## 5. Cosa va conservato

- Lo stack senza dipendenze e senza build: è il motivo per cui un amico potrà avviare il progetto in un minuto.
- Tutte le funzionalità dell'elenco al punto 2.
- Il formato dei dati esistenti (`traks.v1`, versione 2) e la conversione automatica dalla versione 1.
- L'identità grafica: grafite, arancio, oro dei record, bilanciere settimanale.
- Il funzionamento offline.

## 6. Vincoli dell'ambiente di sviluppo

- Disponibili: Node.js 24, git.
- Non disponibili su questo computer: Docker, GitHub CLI, Python.
- Nessun account Supabase o hosting configurato: vanno creati dal proprietario del progetto.
