// js/main.js
import { loadState, addToHistory, clearHistoryState, findHistoryItem } from './state.js';
import * as ui from './ui.js';
import { generateCode as generateCodeFromModule } from './code-generator.js';
import * as codeUtils from './code-utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  loadState();
  ui.updateHistoryUI();
  ui.displayInitialCode();
}

function setupEventListeners() {
  const elements = {
    tabsContainer: document.getElementById('tabsContainer'),
    generateBtn: document.getElementById('generateBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    copyBtn: document.getElementById('copyBtn'),
    testBtn: document.getElementById('testBtn'),
    historyContainer: document.getElementById('historyContainer'),
  };

  elements.tabsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
      if (e.target.dataset.action === 'add-tab') {
        ui.showAddTabModal();
      } else if (e.target.dataset.tab) {
        ui.switchTab(e.target.dataset.tab);
      }
    }
  });

  elements.generateBtn.addEventListener('click', handleGenerateCode);
  elements.clearHistoryBtn.addEventListener('click', handleClearHistory);
  elements.copyBtn.addEventListener('click', handleCopyCode);
  elements.testBtn.addEventListener('click', handleTestCode);

  elements.historyContainer.addEventListener('click', (e) => {
    const historyItem = e.target.closest('.history-item');
    if (historyItem && historyItem.dataset.itemId) {
      handleLoadFromHistory(historyItem.dataset.itemId);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      handleGenerateCode();
    }
  });
}

function handleGenerateCode() {
  const result = generateCodeFromModule();
  if (result) {
    const formattedCode = codeUtils.formatCode(result.code);
    ui.displayCode(formattedCode);
    addToHistory(result.tabId, formattedCode);
    ui.updateHistoryUI();
    ui.logToSandbox('✨ Codice generato e formattato automaticamente', 'success');
  }
}

function handleClearHistory() {
  if (confirm('Vuoi davvero cancellare tutta la cronologia?')) {
    clearHistoryState();
    ui.updateHistoryUI();
    ui.logToSandbox('🗑️ Cronologia cancellata', 'info');
  }
}

function handleCopyCode() {
  const codeOutput = document.getElementById('codeOutput');
  const codeText = codeOutput.textContent || codeOutput.innerText;
  codeUtils.copyCode(codeText, ui.showCopyFeedback);
}

function handleTestCode() {
  const codeOutput = document.getElementById('codeOutput');
  let code = codeOutput.textContent || codeOutput.innerText;
  codeUtils.testCode(code, ui.logToSandbox);
}

function handleLoadFromHistory(itemId) {
  const item = findHistoryItem(itemId);
  if (item) {
    ui.switchTab(item.tabType);
    ui.displayCode(item.fullCode);
    ui.logToSandbox(`📂 Codice caricato dalla cronologia: ${item.tabType}`, 'info');
  }
}
