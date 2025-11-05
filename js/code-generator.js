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

function generateCustomMessage() {
  const type = document.getElementById('cmType').value;

  if (type === 'confirm') {
    return `CustomMessage.show({
                                icon: 'info/warning/error/success',
                                title: 'titolo',
                                message: 'mess',
                                footer: ''
                              });`;
  } else {
    return `CustomMessage.confirm({
        icon: 'info/warning/error/success',
        title: 'titolo',
        message: 'mess',
        footer: '',
      }).then((result) => {
        if (result) {
            // utente ha premuto OK
        }
        else {
            // utente ha premuto ANNULLA o X
        } 
});`;
  }
}

function generateAbilitazioni() {
  const type = document.getElementById('abiType').value;
  switch (type) {
    case 'wnfi-bh':
      return `declare
                  P1_IN VARCHAR2(1000);
                  P2_OUT VARCHAR2(1000);
              begin
                  KXXXX_ABI_XXXXX.P_WNFI_ABI ( v('APP_PAGE_ID'),
                                            :P_C_VAR,
                                            P1_IN,    -- eventuale parametri di input 
                                            P2_OUT ); -- eventuale parametro di output 
              
                  :PXXX_ABI_INS_MASTER := KX003_ABI_UTL_APEX.F_ABI_INS_MST(v('APP_PAGE_ID'), 
                                                                          :P_C_VAR, 
                                                                          <STATIC ID REGION MASTER>);
              
              end;`;
    case 'wnfi-pl':
      return `let fAbiInsXXXX = $v("PXXX_ABI_INS_MASTER") == 'true' ? true : false;cmsAbiInsert (<STATIC ID REGION MASTER>,fAbiInsXXXX );`;
    case 'wnri':
      return `TXXX.COL1||';'||To_Char(TXXX.COL2,'ddmmyyyy') ID_ROW_ABI,
      KX003_ABI_UTL_APEX.F_GET_ABI(v('APP_PAGE_ID'),:P_C_VAR,'WNRI',TXXX.COL1||';'||To_Char(TXXX.COL2,'ddmmyyyy'), <STATIC ID REGION>,null,'UD') F_ABI_UD`;
    case 'item':
      return `-- da mettere in proprietà Apex Read-Only dell'item che si vuole gestire
      KX003_ABI_UTL_APEX.F_ABI_ITM (v('APP_PAGE_ID'),:P_C_VAR,<STATIC ID REGION>,<NOME ITEM>,<PROPRIETA>,:ID_ROW_ABI ) = 'false'`;
    case 'region':
      return `-- da mettere in proprietà Apex Read-Only dell'item che si vuole gestire
      KX003_ABI_UTL_APEX.F_ABI_REG (v('APP_PAGE_ID'),:P_C_VAR,<STATIC ID REGION>,<PROPRIETA>,:ID_ROW_ABI )`;
    case 'config':
      return `insert into TX006_TYP_ABI (page_id, c_reg, c_ctr, t_ctr, t_exe, f_chg_ses, n_min_cache) values (<ID PAGE>, <STATIC ID REGION>, 'WNRI', 'WhenNewRecordInstance', 'KXXX_ABI_XXXXX.P_WNRI_XXXX(@P_N_PAG_ID@,@P_C_VAR@,@P1_V@,@P2_D@,@P3_N@)', 'N', 60);`;
    case 'debug':
      return `DECLARE   
                v_session_id VARCHAR2(100);
              BEGIN    
                APEX_UTIL.SET_SECURITY_GROUP_ID(p_security_group_id => APEX_UTIL.FIND_SECURITY_GROUP_ID('CMS'));

                  APEX_CUSTOM_AUTH.LOGIN (
                      p_uname       => 'proprio_utente',              
                      p_session_id  => V('APP_SESSION'),
                      p_app_page    => '123'||':1234'); -- APP ID + ':PAGE_ID'

                /* INTERROGARE IL RISULTATO DELLE ABILITAZIONI NELLE TABELLE:
                TX004_ABI_EXE
                TX005_ABI
                */
              END ;
              `;
    default:
      code = '';
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
    case 'custom-message':
      code = generateCustomMessage();
      break;
    case 'abilitazioni':
      code = generateAbilitazioni();
      break;
    default:
      code = '// Tab personalizzato: ' + tabId;
  }

  return { code, tabId };
}
