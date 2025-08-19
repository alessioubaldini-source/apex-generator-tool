// js/ui.js
import { getHistory } from './state.js';
import { applySyntaxHighlighting } from './code-utils.js';

const elements = {
  codeOutput: document.getElementById('codeOutput'),
  historyContainer: document.getElementById('historyContainer'),
  sandboxOutput: document.getElementById('sandboxOutput'),
  copyBtn: document.getElementById('copyBtn'),
  tabsContainer: document.getElementById('tabsContainer'),
  generatorPanel: document.querySelector('.generator-panel'),
  generateBtn: document.getElementById('generateBtn'),
};

export function displayCode(code) {
  const formattedCode = applySyntaxHighlighting(code);
  elements.codeOutput.innerHTML = formattedCode;
}

export function displayInitialCode() {
  const initialCode =
    "// Oracle APEX JavaScript Generator Pro 🚀\n// Strumento avanzato per la generazione di snippet APEX\n\n// Funzionalità disponibili:\n// • Syntax highlighting completo\n// • Cronologia codice con timestamp  \n// • Statistiche utilizzo\n// • Sandbox per test codice\n// • Formattazione automatica\n\nconsole.log('APEX JS Generator Pro inizializzato! ✨');";
  displayCode(initialCode);
}

export function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));
  document.querySelectorAll('.tab:not(.add-tab-btn)').forEach((tab) => tab.classList.remove('active'));

  const targetContent = document.getElementById(tabName);
  if (targetContent) {
    targetContent.classList.add('active');
  }

  const targetTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
}

export function updateHistoryUI() {
  const history = getHistory();
  if (!elements.historyContainer) return;

  if (history.length === 0) {
    elements.historyContainer.innerHTML = '<div style="color: #6c757d; font-size: 11px;">Nessuna cronologia</div>';
    return;
  }

  elements.historyContainer.innerHTML = history
    .slice(0, 10)
    .map(
      (item) => `
            <div class="history-item" data-item-id="${item.id}">
                <div class="history-type">${getTabDisplayName(item.tabType)}</div>
                <div style="font-size: 10px; margin: 3px 0;">${item.code.replace(/</g, '&lt;')}</div>
                <div class="history-time">${formatTimestamp(item.timestamp)}</div>
            </div>
        `
    )
    .join('');
}

export function logToSandbox(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const className = type === 'error' ? 'sandbox-error' : '';
  const icon = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' }[type] || '➡️';

  elements.sandboxOutput.innerHTML += `<div class="${className}">[${timestamp}] ${icon} ${message}</div>`;
  elements.sandboxOutput.scrollTop = elements.sandboxOutput.scrollHeight;
}

export function showCopyFeedback(message) {
  const originalText = elements.copyBtn.textContent;
  elements.copyBtn.textContent = message;
  setTimeout(() => {
    elements.copyBtn.textContent = originalText;
  }, 2000);
}

// Helper functions
function getTabDisplayName(tabId) {
  const tabButton = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (tabButton) return tabButton.textContent;

  const names = {
    'ajax-flow': 'Ajax Flow',
    'ajax-plsql': 'PL/SQL',
    setvalue: 'Set Value',
    getvalue: 'Get Value',
    wecr: 'WECR',
    'click-sim': 'Click',
    'call-da': 'Call DA',
  };
  return names[tabId] || tabId;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / 60000);

  if (diffMinutes < 1) return 'ora';
  if (diffMinutes < 60) return `${diffMinutes}m fa`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h fa`;
  return date.toLocaleDateString();
}
