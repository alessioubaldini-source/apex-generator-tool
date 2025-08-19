// js/state.js

let codeHistory = [];

export function loadState() {
  try {
    codeHistory = JSON.parse(localStorage.getItem('apexCodeHistory') || '[]');
  } catch (e) {
    console.warn('Error loading data from localStorage:', e);
    codeHistory = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem('apexCodeHistory', JSON.stringify(codeHistory));
  } catch (e) {
    console.warn('Error saving stats:', e);
  }
}

export function addToHistory(tabType, code) {
  const historyItem = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    tabType: tabType,
    code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
    fullCode: code,
  };

  codeHistory.unshift(historyItem);
  if (codeHistory.length > 50) {
    codeHistory = codeHistory.slice(0, 50);
  }
  saveHistory();
}

export function clearHistoryState() {
  codeHistory = [];
  try {
    localStorage.removeItem('apexCodeHistory');
  } catch (e) {
    console.warn('Error clearing history from localStorage:', e);
  }
}

export const getHistory = () => [...codeHistory];
export const findHistoryItem = (id) => codeHistory.find((h) => h.id == id);
