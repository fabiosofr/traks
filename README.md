# Traks

App per chi si allena in palestra: schede, registrazione degli allenamenti, storico, progressi e record. Funziona nel browser su telefono, tablet e computer, e si può installare come app (PWA) senza passare dagli store.

Progetto personale condiviso tra amici. Non è un prodotto commerciale.

## Stato del progetto

| Funzione | Stato |
|---|---|
| Schede, rotazione, modelli di partenza | Funziona |
| Registrazione allenamenti, timer, tipi di serie, superserie | Funziona |
| Storico, calendario, record, statistiche, grafici | Funziona |
| Libreria esercizi ed esercizi personalizzati | Funziona |
| Misure corporee, traguardi | Funziona |
| Backup JSON ed esportazione CSV | Funziona |
| Uso offline e installazione come PWA | Funziona |
| Account, database condiviso, modalità demo | In sviluppo |
| Nutrizione, recupero, AI Coach, community | In programma |

Il dettaglio è in [PROJECT_AUDIT.md](PROJECT_AUDIT.md) e [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

Oggi i dati restano **solo sul dispositivo** su cui usi l'app. Fai un backup ogni tanto da *Altro → Backup*.

## Avvio in locale

Serve solo [Node.js](https://nodejs.org) 20 o successivo. Non ci sono dipendenze da installare.

```bash
git clone <indirizzo-del-repository>
cd traks
npm start
```

Poi apri http://localhost:8642. Il terminale mostra anche l'indirizzo da aprire dal telefono, se è sulla stessa Wi-Fi del computer.

Per usare un'altra porta: `node tools/serve.js 3000`.

> Aprire `app/index.html` con un doppio clic non basta: il browser non salva i dati per le pagine aperte come file.

## Installarla sul telefono

L'installazione come app richiede un indirizzo `https`, quindi l'app va pubblicata (vedi sotto). Una volta aperta dal telefono:

- **iPhone (Safari)**: Condividi → Aggiungi alla schermata Home.
- **Android (Chrome)**: menu ⋮ → Installa app.

## Pubblicarla

La cartella `app/` è un sito statico: si pubblica così com'è, senza build.

| Servizio | Come |
|---|---|
| Netlify | Trascina la cartella `app/` su app.netlify.com/drop, oppure collega il repository con `app` come cartella di pubblicazione |
| Cloudflare Pages | Collega il repository, nessun comando di build, cartella di output `app` |
| GitHub Pages | Settings → Pages → *Deploy from a branch* → ramo `main`, cartella `/ (root)`. La pagina alla radice porta da sola all'app in `app/` |

Tutti e tre hanno un piano gratuito sufficiente.

Pubblicare il codice su GitHub **non** rende l'app raggiungibile online: serve uno dei servizi qui sopra. E finché la modalità condivisa non è pronta, ogni persona vede solo i dati del proprio dispositivo, anche usando lo stesso indirizzo.

## Aggiornare

```bash
git pull
```

Se l'app è pubblicata, ripubblica la cartella `app/`. Chi sviluppa deve aumentare il numero in `CACHE` dentro `app/sw.js` a ogni rilascio, e aggiungere lì eventuali file nuovi.

I dati sul dispositivo non vengono toccati dagli aggiornamenti: i cambi di formato passano da una conversione automatica.

## Struttura

```
app/                  l'applicazione (sito statico)
  index.html          pagina e ordine di caricamento dei moduli
  css/app.css         stili e variabili di colore
  js/
    exercise-data.js  libreria esercizi, costanti, modelli di scheda
    utils.js          formattazione e utilità
    store.js          stato, salvataggio, migrazioni
    domain.js         calcoli: volume, 1RM, record, rotazione
    nav.js            navigazione tra le schermate
    view-*.js         una schermata per file
    charts.js         grafici SVG
    ui.js             pannelli, conferme, timer di recupero
    main.js           eventi e avvio
  sw.js               funzionamento offline
tests/                test automatici
tools/serve.js        server locale di sviluppo
```

I moduli sono script classici caricati in ordine da `index.html` e condividono lo stesso ambito globale. Per aggiungere un esercizio basta una riga in `LIBRAW` dentro `exercise-data.js`.

## Test

```bash
npm test
```

Coprono i calcoli (1RM, volume, record, progressione, superserie) e la conversione dei dati dalla versione 1.

## Privacy e sicurezza

- Nel repository non devono finire chiavi, password, file `.env`, backup o foto: il `.gitignore` li esclude già.
- Le chiavi dei servizi esterni andranno solo lato server. Vedi [.env.example](.env.example).
- I backup esportati contengono dati personali (peso, misure): non caricarli su GitHub.
