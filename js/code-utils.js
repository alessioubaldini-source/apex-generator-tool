// js/code-utils.js

export function applySyntaxHighlighting(code) {
  if (typeof code !== 'string') return '';

  // La causa principale dell'errore di rendering era che le regole di highlighting (regex) interferivano tra loro.
  // Ad esempio, la regola per le stringhe ("...") applicava la colorazione alla classe CSS (class="syntax-comment")
  // aggiunta dalla regola precedente per i commenti, rompendo l'HTML.
  // La nuova implementazione risolve questo problema in modo robusto:
  // 1. Esegue l'escape dell'intero codice.
  // 2. Isola commenti e stringhe sostituendoli con segnaposto unici e memorizzando il loro HTML corretto.
  // 3. Applica le altre regole di highlighting sul codice "pulito" (con i segnaposto).
  // 4. Re-inserisce l'HTML di commenti e stringhe, garantendo che non ci siano interferenze.

  const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const placeholders = {};
  let placeholderId = 0;

  // Isola commenti e stringhe
  let processedCode = escapedCode
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|--.*$)/gm, (match) => {
      const id = `__HL_${placeholderId++}__`;
      placeholders[id] = `<span class="syntax-comment">${match}</span>`;
      return id;
    })
    .replace(/('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")/g, (match) => {
      const id = `__HL_${placeholderId++}__`;
      placeholders[id] = `<span class="syntax-string">${match}</span>`;
      return id;
    });

  // Applica le altre regole sul codice con i segnaposto
  processedCode = processedCode
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>')
    .replace(/\b(function|const|let|var|if|else|for|while|return|try|catch|throw|new|async|await|true|false|null|undefined)\b/g, '<span class="syntax-keyword">$1</span>')
    .replace(/\b(DECLARE|BEGIN|END|IF|THEN|ELSE|ELSIF|WHEN|OTHERS|EXCEPTION|SELECT|FROM|WHERE|INTO|INSERT|UPDATE|DELETE)\b/g, '<span class="syntax-plsql">$1</span>')
    .replace(/\b(apex\.item|apex\.server|apex\.event|apex\.region|apex\.message|apex\.json)\b/g, '<span class="syntax-apex">$1</span>')
    .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, '<span class="syntax-function">$1</span>');

  // Sostituisce i segnaposto con il loro contenuto HTML
  return processedCode.replace(/__HL_\d+__/g, (match) => placeholders[match] || match);
}

export function formatCode(code) {
  try {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentUnit = '    '; // 4 spaces
    const formattedLines = [];

    lines.forEach((line) => {
      let trimmedLine = line.trim();

      if (trimmedLine.length === 0) {
        formattedLines.push(''); // Keep empty lines for better readability
        return;
      }

      // Adjust indent for closing braces/keywords before processing the line
      // Handles }, ], END, EXCEPTION, ELSE, ELSIF, WHEN (for PL/SQL CASE)
      if (trimmedLine.match(/^(}|\]|END|EXCEPTION|ELSE|ELSIF|WHEN)/i)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      let currentIndent = indentUnit.repeat(indentLevel);
      formattedLines.push(currentIndent + trimmedLine);

      // Adjust indent for opening braces/keywords after processing the line
      // Handles {, [, BEGIN, DECLARE, THEN, LOOP, FOR, WHILE, CASE, PACKAGE, FUNCTION, PROCEDURE, TRIGGER, TYPE, VIEW, WITH
      if (trimmedLine.match(/({|\[|BEGIN|DECLARE|THEN|LOOP|FOR|WHILE|CASE|PACKAGE|FUNCTION|PROCEDURE|TRIGGER|TYPE|VIEW|WITH)$/i)) {
        indentLevel++;
      }
    });

    // Additional passes for common formatting issues and consistency
    let finalCode = formattedLines.join('\n');

    // Ensure semicolons are followed by a newline (unless it's followed by a comment or is at the end of the line)
    finalCode = finalCode.replace(/;(?!\s*(?:\/\/|\/\*|$))/g, ';\n');

    // Remove multiple consecutive empty lines
    finalCode = finalCode.replace(/\n\s*\n\s*\n/g, '\n\n');

    return finalCode.trim(); // Trim overall result to remove leading/trailing newlines
  } catch (error) {
    console.error('Formatting error:', error);
    return code;
  }
}
export function testCode(code, logger) {
  try {
    logger('🧪 Inizio test del codice...', 'info');

    // Aggiunto controllo per prevenire l'esecuzione di codice non-JavaScript (es. PL/SQL).
    // Il test falliva perché tentava di interpretare i commenti PL/SQL (`--`) o le keyword
    // come codice JS. Questo controllo intercetta il codice PL/SQL e mostra un errore chiaro.
    if (code.trim().startsWith('--') || code.trim().toUpperCase().startsWith('DECLARE')) {
      logger('❌ Il codice PL/SQL non può essere eseguito nella sandbox JavaScript.', 'error');
      return;
    }

    if (code.includes('eval(') || code.includes('Function(')) {
      throw new Error('Codice potenzialmente pericoloso rilevato');
    }

    const mockApex = {
      item: function (id) {
        return {
          getValue: function () {
            logger(`➡️ GetValue from ${id}`, 'info');
            return 'mock_value';
          },
          setValue: function (val) {
            logger(`📝 Set ${id} = ${val}`, 'success');
          },
          getNode: function () {
            return {
              click: function () {
                logger(`🖱️ Click su ${id}`, 'success');
              },
            };
          },
        };
      },
      server: {
        process: function (name, params, options) {
          logger(`☁️ Process chiamato: ${name}`, 'success');
          const mockData = { success: true, message: 'Mock response' };

          // Simula la callback success: se fornita
          if (options && typeof options.success === 'function') {
            setTimeout(() => {
              logger(`➡️ Eseguo callback success:`, 'info');
              options.success(mockData);
            }, 500);
          }

          // Ritorna un oggetto promise-like con il metodo .done()
          return {
            done: function (callback) {
              setTimeout(() => {
                logger(`➡️ Eseguo callback .done()`, 'info');
                if (typeof callback === 'function') {
                  callback(mockData);
                }
              }, 500);
              return this; // Permette il chaining
            },
          };
        },
      },
      event: {
        trigger: function (target, event, data) {
          logger(`⚡ Evento '${event}' triggered`, 'success');
        },
      },
      message: {
        showPageSuccess: function (msg) {
          logger(`✅ Success: ${msg}`, 'success');
        },
        showErrors: function (errors) {
          logger(`❌ Errori: ${JSON.stringify(errors)}`, 'error');
        },
      },
      util: {
        showSpinner: function () {
          logger(`✅ Success: showSpinner`, 'success');
        },
      },
    };

    const mockJQuery = function (selector) {
      return {
        val: function (value) {
          if (value !== undefined) {
            logger(`📝 jQuery set ${selector} = ${value}`, 'success');
            return this;
          }
          logger(`➡️ jQuery get value from ${selector}`, 'info');
          return 'mock_jquery_value';
        },
        click: function () {
          logger(`🖱️ jQuery click su ${selector}`, 'success');
        },
        trigger: function (event) {
          logger(`⚡ jQuery trigger '${event}' su ${selector}`, 'success');
        },
        length: 1,
      };
    };

    const mockConsole = {
      log: function (...args) {
        logger(`🗣️ ${args.join(' ')}`, 'info');
      },
      error: function (...args) {
        logger(`❌ ${args.join(' ')}`, 'error');
      },
      warn: function (...args) {
        logger(`⚠️ ${args.join(' ')}`, 'warning');
      },
    };

    // Mock per le shortcut APEX $s e $v
    const $s = function (id, value) {
      logger(`📝 $s (Set) per ${id} = ${value}`, 'success');
      mockApex.item(id).setValue(value);
    };
    const $v = function (id) {
      logger(`➡️ $v (Get) per ${id}`, 'info');
      return mockApex.item(id).getValue();
    };

    const testFunction = new Function('apex', '$', 'console', '$s', '$v', code);
    testFunction(mockApex, mockJQuery, mockConsole, $s, $v);

    logger('✅ Test completato senza errori', 'success');
  } catch (error) {
    logger(`❌ Errore nel test: ${error.message}`, 'error');
  }
}

function fallbackCopy(text, showFeedback) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand('copy');
    showFeedback('✅ Copiato!');
  } catch (err) {
    showFeedback('❌ Errore copia');
  }

  document.body.removeChild(textArea);
}

export function copyCode(codeText, showFeedback) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(codeText)
      .then(() => showFeedback('✅ Copiato!'))
      .catch(() => fallbackCopy(codeText, showFeedback));
  } else {
    fallbackCopy(codeText, showFeedback);
  }
}
