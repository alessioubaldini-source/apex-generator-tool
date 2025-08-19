# 🚀 Oracle APEX JS Generator

Un'applicazione web avanzata progettata per accelerare lo sviluppo in Oracle APEX generando snippet di codice JavaScript e PL/SQL comuni e ripetitivi. Questo strumento fornisce un'interfaccia intuitiva per configurare e creare codice per chiamate AJAX, manipolazione di item, Dynamic Actions e altro ancora, con funzionalità complete di syntax highlighting, formattazione automatica e una sandbox di test integrata.

 <!-- Sostituisci con un URL di uno screenshot reale -->

---

## ✨ Funzionalità Principali

- **Generazione di Codice Versatile**: Crea snippet per:
  - **Flusso Ajax**: Chiamate `apex.server.process` complete di spinner e gestione della callback `.done()`.
  - **Ajax PL/SQL**: Template per il blocco PL/SQL lato server con gestione JSON e delle eccezioni.
  - **Set/Get Value**: Imposta e recupera valori da item APEX usando sia l'API `apex.item` che le shortcut jQuery (`$s`, `$v`).
  - **WECR**: Template per il plugin "When Exit Changed Record", per gestire la logica su griglie interattive.
  - **Simulazione Click**: Genera codice per simulare il click su un elemento tramite jQuery.
  - **Chiamata a Dynamic Action**: Attiva Dynamic Actions programmaticamente tramite `apex.event.trigger`.
- **Interfaccia Utente Interattiva**: Un'interfaccia pulita basata su tab per una facile navigazione e configurazione.
- **Anteprima e Generazione Live**: Visualizza un'anteprima dello snippet e genera il codice finale con un solo click.
- **Syntax Highlighting**: Evidenzia automaticamente la sintassi di JavaScript, PL/SQL e delle API APEX per una migliore leggibilità.
- **Formattazione Automatica del Codice**: Assicura che il codice generato sia pulito, correttamente indentato e consistente.
- **Sandbox di Test Integrata**: Testa il codice JavaScript generato in un ambiente APEX simulato (`mock`) senza lasciare la pagina.
- **Cronologia Persistente**: Salva automaticamente gli snippet generati nel `localStorage` per riferimenti futuri, anche dopo aver chiuso il browser.
- **Copia negli Appunti**: Copia facilmente il codice da utilizzare nella tua applicazione APEX.

---

## 💻 Stack Tecnologico

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Nessuna Dipendenza**: Costruito senza librerie o framework esterni per garantire massima leggerezza e velocità.

---

## 📂 Struttura del Progetto

Il progetto è organizzato in modo modulare per separare le responsabilità e migliorare la manutenibilità.

```
/
├── index.html         # La pagina principale dell'applicazione (UI)
├── style.css          # Tutti gli stili per l'applicazione
├── js/
│   ├── main.js        # Logica principale dell'applicazione e gestione degli eventi
│   ├── code-generator.js # Funzioni per la generazione degli snippet di codice
│   ├── code-utils.js  # Funzioni di utilità (syntax highlighting, formattazione, test)
│   ├── state.js       # Gestione dello stato (cronologia con localStorage)
│   └── ui.js          # Manipolazione del DOM e aggiornamenti dell'interfaccia utente
└── README.md          # Questo file
```
