// js/code-generator.js

/**
 * Indenta ogni riga di una stringa multi-riga.
 * @param {string} text La stringa da indentare.
 * @param {number} spaces Il numero di spazi per l'indentazione.
 * @returns {string} La stringa indentata.
 */
function indent(text, spaces) {
  const indentation = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => indentation + line)
    .join('\n');
}

function generateAjaxFlow() {
  const processName = document.getElementById('processName').value || 'MY_PROCESS';
  const params = document.getElementById('ajaxParams').value || 'x01: "value"';
  const success = document.getElementById('successAction').value || 'console.log("Success:", data);';

  return `// Inizializzo lo spinner 
  let spinner = apex.util.showSpinner();
  // Chiamata Ajax Process - ${processName}
apex.server.process(
    '${processName}',
    {
${indent(params, 8)}
    },
    {   dataType: 'json', 
        success: function (pData) { 
        console.log('Success:', pData); } 
    } 
    ).done(function (pData) { 
        console.log('done:', pData); 
        spinner.remove(); 
        ${indent(success, 12)}
    });`;
}

function generateAjaxPlsql() {
  const vars = document.getElementById('plsqlVars').value || 'l_param VARCHAR2(100);';
  const logic = document.getElementById('plsqlLogic').value || '-- Logica business';

  return `-- PL/SQL Ajax Process
DECLARE
${indent(vars, 4)}
BEGIN
    -- Inizializzazione sicura delle variabili di output
    l_result := NULL;

${indent(logic, 4)}
    
    -- Risposta JSON
    apex_json.open_object;
    apex_json.write('success', true);
    apex_json.write('message', 'Operazione completata');
    apex_json.write('data', l_result);
    apex_json.close_object;
    
EXCEPTION
    WHEN OTHERS THEN
        apex_json.open_object;
        apex_json.write('success', false);
        apex_json.write('message', 'Errore: ' || SQLERRM);
        apex_json.close_object;
END;`;
}

function generateSetValue() {
  const item = document.getElementById('setItemName').value || 'P1_ITEM';
  const value = document.getElementById('setValue').value || "'new_value'";
  const method = document.getElementById('setMethod').value;

  let code = `// Set Value - ${item}\n`;

  if (method === 'apex') {
    code += `// APEX JavaScript API\napex.item("${item}").setValue(${value});\n`;
  } else {
    // Corretto: $s non usa il selettore jQuery '#' ma il nome dell'item
    code += `// jQuery (APEX Shortcut)\n$s("${item}", ${value});\n`;
  }

  return code;
}

function generateGetValue() {
  const item = document.getElementById('getItemName').value || 'P1_ITEM';
  const method = document.getElementById('getMethod').value;

  if (method === 'apex') {
    return `// Get Value APEX
var value = apex.item("${item}").getValue();
console.log('Valore per ${item}:', value);`;
  } else {
    // Corretto: $v non usa il selettore jQuery '#' ma il nome dell'item
    return `// jQuery (APEX Shortcut)
var value = $v("${item}");
console.log('Valore per ${item}:', value);`;
  }
}

function generateWecr() {
  return `// Creare una variabile per ogni colonna necessaria ad effettuare i controlli
let idx_col1;
let idx_col2;
// Necessari per la risposta
let tMsg;
let tItem;
// Elenco delle colonne per cui deve scattare i controlli
let itemsRegion1 = ['COLONNA_A', 'COLONNA_B', 'COLONNA_C'];

function controlliWECR(region, view, record, itemsChanged) {
  console.log('controlli WECR', region);

  if (region === 'REGION1') {
    //Recupero degli indici dei campi utilizzati nel controlli del WhenExitChangedRecord
    idx_col1 = view.grid.model.getFieldKey('NOME_COLONNA_1');
    idx_col2 = view.grid.model.getFieldKey('NOME_COLONNA_2');

    if (WhenExitChangedRecord.fSearchItem(itemsChanged, itemsRegion1)) {
      // richiamiamo la funzione java per effettuare i controlli della relativa region
      controlliRegion1(record);
    }
  }

  // return messaggio errore
  if (tMsg) {
    // messaggio di errore, campi da evidenziare in rosso
    return [tMsg, tItem.split(',')];
  } else {
    return '';
  }
}
// funzione java per richiamare i controlli WECR della Region1 
function controlliRegion1(record) {
  apex.server.process(
    'CTR_WECR_REGION_1', //PL/SQL process name
    {
      // parametri di ingresso del plsql
      x01: record.record[idx_col1],
      x02: record.record[idx_col2],
    },
    {
      dataType: 'json',
      async: false,
      success: function (pData) {
        console.log('success');
        // parametri di output della procedura PLSQL
        tMsg = pData.v_t_msg;
        tItem = pData.v_t_ele_itm;
      },
    }
  );
}`;
}

function generateClick() {
  const target = document.getElementById('clickTarget').value || 'P1_SUBMIT';

  return `// Simula Click jQuery\n$('#${target}').click();`;
}

function generateCallDa() {
  const target = document.getElementById('daTarget').value || 'document';
  const event = document.getElementById('daEvent').value || 'custom-event';
  const method = document.getElementById('daMethod').value;

  if (method === 'apex') {
    return `// Call Dynamic Action
apex.event.trigger(${target}, '${event}');`;
  } else {
    return `// Call Dynamic Action
$.event.trigger('${event}');`;
  }
}

export function generateCode() {
  const activeTab = document.querySelector('.tab-content.active');
  if (!activeTab) return null;

  const tabId = activeTab.id;
  let code = '';

  switch (tabId) {
    case 'ajax-flow':
      code = generateAjaxFlow();
      break;
    case 'ajax-plsql':
      code = generateAjaxPlsql();
      break;
    case 'setvalue':
      code = generateSetValue();
      break;
    case 'getvalue':
      code = generateGetValue();
      break;
    case 'wecr':
      code = generateWecr();
      break;
    case 'click-sim':
      code = generateClick();
      break;
    case 'call-da':
      code = generateCallDa();
      break;
    default:
      code = '// Tab personalizzato: ' + tabId;
  }

  return { code, tabId };
}
