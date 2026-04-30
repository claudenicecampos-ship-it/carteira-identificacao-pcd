// GO Card PCD — script.js (Cadastro)
// Validacoes completas para documento oficial brasileiro

const validCIDs = {
  "6A02":"Transtorno do Espectro Autista","F84":"Transtorno Global do Desenvolvimento",
  "F70":"Deficiência Intelectual Leve","F71":"Deficiência Intelectual Moderada",
  "F72":"Deficiência Intelectual Grave","F73":"Deficiência Intelectual Profunda",
  "F78":"Deficiência Intelectual","F79":"Deficiência Intelectual",
  "G80":"Paralisia Cerebral","G82":"Paraplegia / Tetraplegia","G20":"Doença de Parkinson",
  "H54":"Cegueira / Baixa Visão","H90":"Surdez","H91":"Perda Auditiva",
  "F01":"Deficiência Intelectual","F20":"Transtorno Psicossocial",
  "I63":"AVC","I69":"Sequela de AVC","Q05":"Espinha Bífida",
  "G11":"Ataxia","M06":"Artrite Reumatoide","N18":"Doença Renal Crônica",
  "J44":"DPOC","P96":"Deficiência Múltipla",
  "H00":"Deficiência Visual","H10":"Deficiência Visual","H25":"Catarata","H40":"Glaucoma",
  "H60":"Deficiência Auditiva","H66":"Deficiência Auditiva","H72":"Deficiência Auditiva",
  "H80":"Deficiência Auditiva","H81":"Deficiência Auditiva","H83":"Deficiência Auditiva",
  "G06":"Deficiência Física","G89":"Deficiência Física","G99":"Deficiência Física",
  "I50":"Insuficiência Cardíaca","I10":"Hipertensão com Deficiência",
  "M17":"Artrose de Joelho","M19":"Artrose","M35":"Lúpus",
  "Q10":"Deficiência Visual Congênita","Q30":"Deficiência Auditiva Congênita",
  "Q99":"Deficiência Intelectual Congênita","R99":"A Classificar",
  "E10":"Diabetes Tipo 1","E11":"Diabetes Tipo 2",
  "J43":"Enfisema","J45":"Asma Grave"
};

// DDDs validos do Brasil
const validDDDs = [
  '11','12','13','14','15','16','17','18','19', // SP
  '21','22','24', // RJ
  '27','28', // ES
  '31','32','33','34','35','37','38', // MG
  '41','42','43','44','45','46', // PR
  '47','48','49', // SC
  '51','53','54','55', // RS
  '61', // DF
  '62','64', // GO
  '63', // TO
  '65','66', // MT
  '67', // MS
  '68', // AC
  '69', // RO
  '71','73','74','75','77', // BA
  '79', // SE
  '81','87', // PE
  '82', // AL
  '83', // PB
  '84', // RN
  '85','88', // CE
  '86','89', // PI
  '91','93','94', // PA
  '92','97', // AM
  '95', // RR
  '96', // AP
  '98','99' // MA
];

const chatbotResponses = {
  cadastro: "Para o cadastro preencha: foto, dados pessoais, tipo e grau da deficiência, CID do laudo médico, dados do profissional responsável e informações de emergência. Todos os campos com (*) são obrigatórios pela Lei 13.146/2015.",
  cid: "O CID é o código da sua condição no laudo médico. Exemplos: F84 (TEA), H90 (Surdez), G80 (Paralisia Cerebral), F70-F73 (Deficiência Intelectual). Você encontra no seu laudo médico.",
  direitos: "Com a Carteira GO Card você tem: atendimento prioritário (Lei 10.048), acompanhante em hospitais (Art. 22 LBI), passe livre (Lei 8.899), vagas reservadas, isenção de IPI e BPC. Veja a Central de Direitos!",
  laudo: "O laudo precisa ter: número do laudo, data, nome e registro profissional (CRM/CRP/CRFa) do responsável. Anexe o arquivo PDF ou imagem do seu laudo no formulário.",
  renovacao: "A carteira tem validade de 5 anos. Você receberá notificações quando estiver próxima do vencimento. A renovação é feita aqui no sistema, bastando atualizar os dados.",
  acompanhante: "O direito ao acompanhante é garantido pelo Art. 22 da Lei 13.146/2015. Se necessita de acompanhante, marque 'Sim' no campo correspondente para que conste na sua carteira.",
  default: "Entendi! Posso ajudar com: cadastro, CID, direitos, laudo médico, renovação ou acompanhante. Se preferir, posso conectar você a um atendente humano."
};

// Variáveis globais
let laudoFileData = null;
let fotoFileData = null;
let fields = {};
let submitBtn = null;

// ===== VALIDADORES =====
function isValidName(v) { 
  const trimmed = v.trim();
  return trimmed.length >= 3 && /^[a-záéíóúàâêôãõçñ\s]+$/i.test(trimmed) && trimmed.includes(' '); 
}

function isValidDate(v) { 
  if (!v) return false;
  const date = new Date(v + 'T00:00:00');
  const today = new Date();
  return date <= today && date.getFullYear() >= 1900;
}

function isValidCPF(v) {
  const n = v.replace(/\D/g,'');
  if (n.length !== 11) return false;
  // Verifica se todos os digitos sao iguais
  if (/^(\d)\1+$/.test(n)) return false;
  // Validacao do primeiro digito verificador
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(n[i]) * (10 - i);
  let r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(n[9])) return false;
  // Validacao do segundo digito verificador
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(n[i]) * (11 - i);
  r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(n[10]);
}

function isValidRG(v) { 
  const n = v.replace(/\D/g,'');
  // RG brasileiro tem entre 7 e 9 digitos (varia por estado)
  return n.length >= 7 && n.length <= 9;
}

function isValidTelefone(v) {
  const n = v.replace(/\D/g,'');
  // Telefone brasileiro: DDD (2 digitos) + numero (8 ou 9 digitos)
  if (n.length < 10 || n.length > 11) return false;
  const ddd = n.substring(0, 2);
  if (!validDDDs.includes(ddd)) return false;
  // Celular deve comecar com 9
  if (n.length === 11 && n[2] !== '9') return false;
  // Telefone fixo nao pode comecar com 9
  if (n.length === 10 && n[2] === '9') return false;
  return true;
}

function isValidContatoEmergencia(v) {
  const trimmed = v.trim();
  if (!trimmed) return true;
  // Agora valida apenas o número de telefone
  return isValidTelefone(trimmed);
}

function isValidCity(v) { 
  return v.trim().length >= 2 && /^[a-záéíóúàâêôãõçñ\s\-]+$/i.test(v.trim());
}

function isValidCID(v) { 
  const code = v.toUpperCase().trim();
  // Aceita formato completo (F84.0) ou simplificado (F84)
  const baseCode = code.split('.')[0];
  return validCIDs.hasOwnProperty(baseCode) || validCIDs.hasOwnProperty(code);
}

function isValidLaudo(v) { return v.trim().length >= 3; }

function isValidMedico(v) {
  const trimmed = v.trim();
  if (trimmed.length < 3) return false;
  return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s.'-]+$/i.test(trimmed);
}

function isValidCRM(v) {
  const trimmed = v.trim().toUpperCase();
  // Formato: CRM-UF 123456 ou CRP-UF 123456 ou CRFa-UF 123456
  return trimmed.length >= 6 && /^(CRM|CRP|CRFA)[\s\-]?[A-Z]{2}[\s\-]?\d{4,6}$/i.test(trimmed.replace(/\s+/g,''));
}

function isValidOptionalName(v) {
  const trimmed = v.trim();
  return trimmed === '' || isValidName(trimmed);
}

function isValidOptionalCPF(v) {
  const trimmed = v.trim();
  return trimmed === '' || isValidCPF(trimmed);
}

function isValidOptionalVinculo(v) {
  if (!v) return true;
  return v.trim().length >= 3;
}

// ===== MASCARAS =====
function maskCPF(v) {
  const n = v.replace(/\D/g,'').slice(0,11);
  return n.replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskRG(v) {
  const n = v.replace(/\D/g,'').slice(0,9);
  if (n.length <= 2) return n;
  if (n.length <= 5) return n.replace(/(\d{2})(\d)/, '$1.$2');
  if (n.length <= 8) return n.replace(/(\d{2})(\d{3})(\d)/, '$1.$2.$3');
  return n.replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
}

function maskTelefone(v) {
  const n = v.replace(/\D/g,'').slice(0,11);
  if (n.length <= 2) return `(${n}`;
  if (n.length <= 6) return `(${n.slice(0,2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
}

// ===== FEEDBACK =====
function setValid(fieldName, isValid, value) {
  const f = fields[fieldName];
  if (!f || !f.input) return;
  if (!value || value === '') {
    f.input.classList.remove('valid','invalid');
    if (f.check) f.check.classList.remove('show');
    if (f.error) { f.error.textContent = ''; f.error.classList.remove('show'); }
    checkForm(); 
    return;
  }
  f.input.classList.toggle('valid', isValid);
  f.input.classList.toggle('invalid', !isValid);
  if (f.check) f.check.classList.toggle('show', isValid);
  if (f.error) {
    f.error.classList.toggle('show', !isValid);
    if (!isValid) f.error.textContent = errorMsg(fieldName);
    else f.error.textContent = '';
  }
  checkForm();
}

function errorMsg(f) {
  const msgs = {
    nome: 'Nome completo inválido (mínimo 3 letras e sobrenome)',
    dataNascimento: 'Data inválida ou futura',
    cpf: 'CPF inválido — verifique os dígitos',
    rg: 'RG inválido — deve ter entre 7 e 9 dígitos',
    telefone: 'Telefone inválido — use (DDD) + número',
    cidade: 'Informe o município corretamente',
    cid: 'CID não encontrado. Ex: F84, H90, G80',
    numeroLaudo: 'Informe o número do laudo',
    nomeMedico: 'Nome do profissional inválido',
    crmMedico: 'Formato inválido. Ex: CRM-SP 123456',
    contatoEmergencia: 'Contato de emergência inválido. Use (11) 99999-9999',
    dataLaudo: 'Data do laudo inválida',
    laudoFile: 'Anexe o laudo médico (PDF ou imagem)',
    nomeResponsavel: 'Nome do responsável inválido',
    cpfResponsavel: 'CPF do responsável inválido',
    vinculoResponsavel: 'Vínculo inválido',
    foto: 'Selecione uma foto 3x4',
  };
  return msgs[f] || 'Campo inválido';
}

function markFieldError(fieldName, message) {
  const f = fields[fieldName];
  if (!f || !f.input) return;
  f.input.classList.add('invalid');
  if (f.check) f.check.classList.remove('show');
  if (f.error) {
    f.error.textContent = message;
    f.error.classList.add('show');
  }
}

function validateFormOnSubmit() {
  const invalidFields = [];

  if (!isValidName(fields.nome.input?.value || '')) {
    markFieldError('nome', errorMsg('nome'));
    invalidFields.push('Nome completo');
  }
  if (!isValidDate(fields.dataNascimento.input?.value || '')) {
    markFieldError('dataNascimento', errorMsg('dataNascimento'));
    invalidFields.push('Data de nascimento');
  }
  if (!document.getElementById('sexo')?.value) {
    markFieldError('sexo', 'Selecione o sexo');
    invalidFields.push('Sexo');
  }
  if (!isValidCPF(fields.cpf.input?.value || '')) {
    markFieldError('cpf', errorMsg('cpf'));
    invalidFields.push('CPF');
  }
  if (!isValidRG(fields.rg.input?.value || '')) {
    markFieldError('rg', errorMsg('rg'));
    invalidFields.push('RG');
  }
  if (!isValidTelefone(fields.telefone.input?.value || '')) {
    markFieldError('telefone', errorMsg('telefone'));
    invalidFields.push('Telefone');
  }
  if (!isValidCity(fields.cidade.input?.value || '')) {
    markFieldError('cidade', errorMsg('cidade'));
    invalidFields.push('Município');
  }
  if (!document.getElementById('estado')?.value) {
    markFieldError('estado', 'Selecione o estado');
    invalidFields.push('Estado');
  }
  if (!document.getElementById('tipoDeficiencia')?.value) {
    markFieldError('tipoDeficiencia', 'Selecione o tipo de deficiência');
    invalidFields.push('Tipo de deficiência');
  }
  if (!document.getElementById('grauDeficiencia')?.value) {
    markFieldError('grauDeficiencia', 'Selecione o grau da deficiência');
    invalidFields.push('Grau da deficiência');
  }
  if (!isValidCID(fields.cid.input?.value || '')) {
    markFieldError('cid', errorMsg('cid'));
    invalidFields.push('CID');
  }
  if (!isValidLaudo(fields.numeroLaudo.input?.value || '')) {
    markFieldError('numeroLaudo', errorMsg('numeroLaudo'));
    invalidFields.push('Número do laudo');
  }
  if (!isValidDate(fields.dataLaudo.input?.value || '')) {
    markFieldError('dataLaudo', errorMsg('dataLaudo'));
    invalidFields.push('Data do laudo');
  }
  if (!isValidMedico(fields.nomeMedico.input?.value || '')) {
    markFieldError('nomeMedico', errorMsg('nomeMedico'));
    invalidFields.push('Nome do médico');
  }
  if (!isValidCRM(fields.crmMedico.input?.value || '')) {
    markFieldError('crmMedico', errorMsg('crmMedico'));
    invalidFields.push('CRM/CRP/CRFa');
  }
  if (!isValidContatoEmergencia(fields.contatoEmergencia.input?.value || '')) {
    markFieldError('contatoEmergencia', errorMsg('contatoEmergencia'));
    invalidFields.push('Contato de emergência');
  }

  return invalidFields;
}

function buildInvalidFieldMessage(fieldsList) {
  if (!fieldsList.length) return null;
  const firstFields = fieldsList.slice(0, 5);
  const moreCount = fieldsList.length - firstFields.length;
  return `Preencha corretamente: ${firstFields.join(', ')}${moreCount > 0 ? ` e mais ${moreCount} campo(s)` : ''}.`;
}

function showInvalidFieldSummary(invalidFields) {
  const message = buildInvalidFieldMessage(invalidFields);
  if (!message) return;
  if (typeof mostrarNotificacao === 'function') {
    mostrarNotificacao(message, 'error');
  } else if (typeof mostrarToast === 'function') {
    mostrarToast(message, 'error');
  } else {
    alert(message);
  }
}

function checkForm() {
  const fotoOk = fields.foto?.preview?.classList.contains('has-image');
  const laudoOk = fields.laudoFile?.preview?.classList.contains('has-file');
  return fotoOk
    && isValidName(fields.nome.input?.value || '')
    && isValidDate(fields.dataNascimento.input?.value || '')
    && !!document.getElementById('sexo')?.value
    && isValidCPF(fields.cpf.input?.value || '')
    && isValidRG(fields.rg.input?.value || '')
    && isValidTelefone(fields.telefone.input?.value || '')
    && isValidCity(fields.cidade.input?.value || '')
    && !!document.getElementById('estado')?.value
    && !!document.getElementById('tipoDeficiencia')?.value
    && !!document.getElementById('grauDeficiencia')?.value
    && isValidCID(fields.cid.input?.value || '')
    && isValidLaudo(fields.numeroLaudo.input?.value || '')
    && isValidDate(fields.dataLaudo.input?.value || '')
    && isValidMedico(fields.nomeMedico.input?.value || '')
    && isValidCRM(fields.crmMedico.input?.value || '')
    && isValidOptionalName(fields.nomeResponsavel.input?.value || '')
    && isValidOptionalCPF(fields.cpfResponsavel.input?.value || '')
    && isValidOptionalVinculo(fields.vinculoResponsavel.input?.value || '')
    && isValidContatoEmergencia(fields.contatoEmergencia.input?.value || '')
    && laudoOk;
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Inicializando Script - DOMContentLoaded disparado');
  
  // ===== CAMPOS =====
  fields = {
    foto: { input: document.getElementById('foto-input'), error: document.getElementById('fotoError'), preview: document.getElementById('fotoPreview') },
    nome: { input: document.getElementById('nome'), error: document.getElementById('nomeError'), check: document.getElementById('nomeCheck') },
    dataNascimento: { input: document.getElementById('dataNascimento'), error: document.getElementById('dataError'), check: document.getElementById('dataCheck') },
    sexo: { input: document.getElementById('sexo'), error: document.getElementById('sexoError') },
    cpf: { input: document.getElementById('cpf'), error: document.getElementById('cpfError'), check: document.getElementById('cpfCheck') },
    rg: { input: document.getElementById('rg'), error: document.getElementById('rgError'), check: document.getElementById('rgCheck') },
    telefone: { input: document.getElementById('telefone'), error: document.getElementById('telefoneError'), check: document.getElementById('telefoneCheck') },
    contatoEmergencia: { input: document.getElementById('contatoEmergencia'), error: document.getElementById('contatoEmergenciaError'), check: document.getElementById('contatoEmergenciaCheck') },
    cidade: { input: document.getElementById('cidade'), error: document.getElementById('cidadeError'), check: document.getElementById('cidadeCheck') },
    estado: { input: document.getElementById('estado'), error: document.getElementById('estadoError') },
    tipoDeficiencia: { input: document.getElementById('tipoDeficiencia'), error: document.getElementById('tipoDeficienciaError') },
    grauDeficiencia: { input: document.getElementById('grauDeficiencia'), error: document.getElementById('grauDeficienciaError') },
    cid: { input: document.getElementById('cid'), error: document.getElementById('cidError'), check: document.getElementById('cidCheck') },
    numeroLaudo: { input: document.getElementById('numeroLaudo'), error: document.getElementById('laudoError'), check: document.getElementById('laudoCheck') },
    dataLaudo: { input: document.getElementById('dataLaudo'), error: document.getElementById('dataLaudoError'), check: document.getElementById('dataLaudoCheck') },
    nomeMedico: { input: document.getElementById('nomeMedico'), error: document.getElementById('medicoError'), check: document.getElementById('medicoCheck') },
    crmMedico: { input: document.getElementById('crmMedico'), error: document.getElementById('crmError'), check: document.getElementById('crmCheck') },
    laudoFile: { input: document.getElementById('laudoFile'), error: document.getElementById('laudoFileError'), preview: document.getElementById('laudoPreview') },
    nomeResponsavel: { input: document.getElementById('nomeResponsavel'), error: document.getElementById('nomeResponsavelError'), check: document.getElementById('nomeResponsavelCheck') },
    cpfResponsavel: { input: document.getElementById('cpfResponsavel'), error: document.getElementById('cpfResponsavelError'), check: document.getElementById('cpfResponsavelCheck') },
    vinculoResponsavel: { input: document.getElementById('vinculoResponsavel'), error: document.getElementById('vinculoResponsavelError') }
  };

  submitBtn = document.getElementById('submitBtn');
  
  console.log('✅ Campos inicializados:', {
    foto_input: fields.foto.input ? '✓' : '✗',
    submitBtn: submitBtn ? '✓' : '✗'
  });

  // Adicionar todos os event listeners aqui
  inicializarEventListeners();
});

function inicializarEventListeners() {
  console.log('🎯 Inicializando Event Listeners');

// ===== EVENTOS DE VALIDACAO =====
  fields.nome.input?.addEventListener('input', e => {
    setValid('nome', isValidName(e.target.value), e.target.value);
  });

  fields.dataNascimento.input?.addEventListener('input', e => {
    setValid('dataNascimento', isValidDate(e.target.value), e.target.value);
  });

  fields.dataLaudo.input?.addEventListener('input', e => {
    setValid('dataLaudo', isValidDate(e.target.value), e.target.value);
  });

  fields.cpf.input?.addEventListener('input', e => {
    e.target.value = maskCPF(e.target.value);
    setValid('cpf', isValidCPF(e.target.value), e.target.value);
  });

  fields.rg.input?.addEventListener('input', e => {
    e.target.value = maskRG(e.target.value);
    setValid('rg', isValidRG(e.target.value), e.target.value);
  });

  fields.telefone.input?.addEventListener('input', e => {
    e.target.value = maskTelefone(e.target.value);
    setValid('telefone', isValidTelefone(e.target.value), e.target.value);
  });

  fields.contatoEmergencia.input?.addEventListener('input', e => {
    e.target.value = maskTelefone(e.target.value);
    setValid('contatoEmergencia', isValidContatoEmergencia(e.target.value), e.target.value);
  });

  fields.cidade.input?.addEventListener('input', e => {
    setValid('cidade', isValidCity(e.target.value), e.target.value);
  });

  fields.cid.input?.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
    const valid = isValidCID(e.target.value);
    setValid('cid', valid, e.target.value);
    const desc = document.getElementById('cidDesc');
    if (desc) {
      const baseCode = e.target.value.split('.')[0].toUpperCase();
      desc.textContent = valid ? (validCIDs[baseCode] || validCIDs[e.target.value.toUpperCase()] || '') : '';
    }
  });

  fields.numeroLaudo.input?.addEventListener('input', e => {
    setValid('numeroLaudo', isValidLaudo(e.target.value), e.target.value);
  });

  fields.nomeMedico.input?.addEventListener('input', e => {
    setValid('nomeMedico', isValidMedico(e.target.value), e.target.value);
  });

  fields.crmMedico.input?.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
    setValid('crmMedico', isValidCRM(e.target.value), e.target.value);
  });

  fields.nomeResponsavel.input?.addEventListener('input', e => {
    setValid('nomeResponsavel', isValidOptionalName(e.target.value), e.target.value);
  });

  fields.cpfResponsavel.input?.addEventListener('input', e => {
    e.target.value = maskCPF(e.target.value);
    setValid('cpfResponsavel', isValidOptionalCPF(e.target.value), e.target.value);
  });

  fields.vinculoResponsavel.input?.addEventListener('change', e => {
    setValid('vinculoResponsavel', isValidOptionalVinculo(e.target.value), e.target.value);
  });

  // Selects
  document.getElementById('sexo')?.addEventListener('change', () => checkForm());
  document.getElementById('estado')?.addEventListener('change', () => checkForm());
  document.getElementById('tipoDeficiencia')?.addEventListener('change', () => checkForm());
  document.getElementById('grauDeficiencia')?.addEventListener('change', () => checkForm());

  // ===== UPLOAD DE FOTO - CORRIGIDO COM LOGGING =====
  if (fields.foto.input) {
    console.log('📷 Foto input encontrado, adicionando listener');
    fields.foto.input.addEventListener('change', function(e) {
      console.log('📸 Mudança no input de foto detectada');
      const file = e.target.files?.[0];
      if (!file) {
        console.log('❌ Nenhum arquivo selecionado');
        return;
      }
      
      console.log('📄 Arquivo selecionado:', {
        nome: file.name,
        tipo: file.type,
        tamanho: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      
      // Validar tipo de arquivo
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        console.error('❌ Tipo de arquivo inválido:', file.type);
        if (fields.foto.error) {
          fields.foto.error.textContent = 'Formato inválido. Use JPG, PNG ou GIF.';
          fields.foto.error.classList.add('show');
        }
        e.target.value = '';
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('❌ Arquivo muito grande:', file.size);
        if (fields.foto.error) {
          fields.foto.error.textContent = 'Arquivo muito grande. Máximo 5MB.';
          fields.foto.error.classList.add('show');
        }
        e.target.value = '';
        return;
      }
      
      console.log('🔄 Iniciando FileReader...');
      const reader = new FileReader();
      reader.onloadstart = function() {
        console.log('▶️ FileReader iniciado');
      };
      reader.onloadend = function() {
        console.log('✅ FileReader concluído');
        fotoFileData = reader.result;
        console.log('💾 FotoFileData definido');

        if (fields.foto.preview) {
          console.log('🖼️ Atualizando preview da foto');
          fields.foto.preview.style.backgroundImage = `url('${reader.result}')`;
          fields.foto.preview.classList.add('has-image');
          console.log('✓ Classe has-image adicionada');

          const svgIcon = fields.foto.preview.querySelector('svg');
          if (svgIcon) {
            svgIcon.style.display = 'none';
            console.log('✓ SVG icon escondido');
          }
        } else {
          console.error('❌ fields.foto.preview é null');
        }

        if (fields.foto.error) {
          fields.foto.error.textContent = '';
          fields.foto.error.classList.remove('show');
        }
        checkForm();
      };
      reader.onerror = function() {
        console.error('❌ Erro no FileReader:', reader.error);
        if (fields.foto.error) {
          fields.foto.error.textContent = 'Erro ao ler o arquivo. Tente novamente.';
          fields.foto.error.classList.add('show');
        }
      };
      reader.readAsDataURL(file);
    });
  } else {
    console.error('❌ Element foto-input não encontrado!');
  }

  // ===== UPLOAD DE LAUDO - CORRIGIDO =====
  if (fields.laudoFile.input) {
    console.log('📋 Laudo input encontrado, adicionando listener');
    fields.laudoFile.input.addEventListener('change', function(e) {
      console.log('📄 Mudança no input de laudo detectada');
      const file = e.target.files?.[0];
      if (!file) {
        console.log('❌ Nenhum arquivo de laudo selecionado');
        return;
      }
      
      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        if (fields.laudoFile.error) {
          fields.laudoFile.error.textContent = 'Arquivo muito grande. Máximo 10MB.';
          fields.laudoFile.error.classList.add('show');
        }
        e.target.value = '';
        return;
      }
      
      // Validar tipo de arquivo
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        if (fields.laudoFile.error) {
          fields.laudoFile.error.textContent = 'Formato inválido. Use PDF, JPG ou PNG.';
          fields.laudoFile.error.classList.add('show');
        }
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = function() {
        laudoFileData = reader.result;
        if (fields.laudoFile.preview) {
          fields.laudoFile.preview.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--success-500); width: 24px; height: 24px;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span style="color: var(--success-600); font-weight: 500">${file.name}</span>
          `;
          fields.laudoFile.preview.classList.add('has-file');
        }
        if (fields.laudoFile.error) {
          fields.laudoFile.error.textContent = '';
          fields.laudoFile.error.classList.remove('show');
        }
        checkForm();
      };
      reader.onerror = function() {
        if (fields.laudoFile.error) {
          fields.laudoFile.error.textContent = 'Erro ao ler o arquivo. Tente novamente.';
          fields.laudoFile.error.classList.add('show');
        }
      };
      reader.readAsDataURL(file);
    });
  } else {
    console.error('❌ Element laudoFile não encontrado!');
  }

  // Permitir clique na área de preview para abrir o seletor de arquivo
  if (fields.foto.preview && fields.foto.input) {
    fields.foto.preview.addEventListener('click', () => fields.foto.input.click());
  }
  if (fields.laudoFile.preview && fields.laudoFile.input) {
    fields.laudoFile.preview.addEventListener('click', () => fields.laudoFile.input.click());
  }

  // ===== SUBMIT - INTEGRADO COM BANCO DE DADOS =====

  const registrationForm = document.getElementById('registrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const invalidFields = validateFormOnSubmit();
      if (invalidFields.length) {
        showInvalidFieldSummary(invalidFields);
        return;
      }
      
      // Desabilita o botao durante o envio
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<span class="spinner"></span> Salvando...';
      }

      const fotoFile = fields.foto.input?.files?.[0] || null;
      const laudoFile = fields.laudoFile.input?.files?.[0] || null;
      const fotoSrc = fotoFileData || (fields.foto.preview?.style.backgroundImage.slice(5, -2) || '');

      // Mapeia os campos do formulario para os campos do banco de dados (tabela carteiras)
      const dadosCarteira = {
        // Campos principais da carteira
        tipo: document.getElementById('tipoDeficiencia')?.value || 'PCD',
        descricao: validCIDs[fields.cid.input?.value.toUpperCase().split('.')[0]] || 'Pessoa com Deficiencia',
        ativa: true,
        
        // Dados pessoais
        data_nascimento: fields.dataNascimento.input?.value || null,
        endereco: document.getElementById('endereco')?.value.trim() || null,
        cidade: fields.cidade.input?.value.trim() || '',
        estado: document.getElementById('estado')?.value || '',
        telefone: fields.telefone.input?.value.replace(/\D/g,'') || '',
        
        // Dados da deficiencia
        tipo_deficiencia: document.getElementById('tipoDeficiencia')?.value || '',
        grau_deficiencia: document.getElementById('grauDeficiencia')?.value || '',
        cid: fields.cid.input?.value.toUpperCase().trim() || '',
        necessita_acompanhante: document.getElementById('necessitaAcompanhante')?.value === 'Sim',
        comunicacao: document.getElementById('comunicacao')?.value || null,
        
        // Dados do laudo
        numero_laudo: fields.numeroLaudo.input?.value.trim() || '',
        data_laudo: fields.dataLaudo.input?.value || null,
        nome_medico: fields.nomeMedico.input?.value.trim() || '',
        crm_medico: fields.crmMedico.input?.value.trim().toUpperCase() || '',
        
        // Dados de emergencia
        tipo_sanguineo: document.getElementById('tipoSanguineo')?.value || null,
        contato_emergencia: document.getElementById('contatoEmergencia')?.value.trim() || null,
        alergias: document.getElementById('alergias')?.value.trim() || null,
        medicacoes: document.getElementById('medicacoes')?.value.trim() || null,
        
        // Dados do responsavel
        nome_responsavel: document.getElementById('nomeResponsavel')?.value.trim() || null,
        cpf_responsavel: document.getElementById('cpfResponsavel')?.value?.replace(/\D/g,'') || null,
        vinculo_responsavel: document.getElementById('vinculoResponsavel')?.value || null,
        
        // Dados extras para exibicao local (nao vao para o banco)
        nome: fields.nome.input?.value.trim() || '',
        cpf: fields.cpf.input?.value.replace(/\D/g,'') || '',
        rg: fields.rg.input?.value.replace(/\D/g,'') || '',
        sexo: document.getElementById('sexo')?.value || '',
      };

      console.log('[v0] Iniciando salvamento da carteira...');
      console.log('[v0] Dados da carteira:', dadosCarteira);

      const usuario = typeof obterUsuario === 'function' ? obterUsuario() : null;
      if (!usuario) {
        if (typeof mostrarToast === 'function') {
          mostrarToast('Você precisa estar logado para gerar a carteira.', 'error');
        }
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
      }

      const { temCarteira, carteira: carteiraExistente } = await verificarCarteiraExistente(usuario.id);
      if (temCarteira && carteiraExistente) {
        localStorage.setItem('carteira_dados', JSON.stringify(carteiraExistente));
        if (typeof mostrarToast === 'function') {
          mostrarToast('Já existe uma carteira cadastrada para este usuário. Redirecionando...', 'info');
        }
        setTimeout(() => window.location.href = 'carteira.html', 1200);
        return;
      }

      try {
        // Usa a funcao salvarCarteiraBackend do auth.js se disponivel
        if (typeof salvarCarteiraBackend === 'function') {
          console.log('[v0] Usando salvarCarteiraBackend...');
          const resultado = await salvarCarteiraBackend(dadosCarteira, { foto: fotoFile, laudo: laudoFile });
          if (resultado.sucesso) {
            const dadosCompletos = {
              ...dadosCarteira,
              ...resultado.carteira,
              numero_carteira: resultado.carteira?.numero_carteira || dadosCarteira.numero_carteira,
              data_emissao: resultado.carteira?.data_emissao || new Date().toISOString().split('T')[0],
              data_validade: resultado.carteira?.data_validade || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            };
            console.log('[v0] Salvando no localStorage:', dadosCompletos);
            localStorage.setItem('carteira_dados', JSON.stringify(dadosCompletos));
            localStorage.setItem('carteira_cadastrada', 'true');

            if (typeof mostrarToast === 'function') {
              mostrarToast('Carteira cadastrada com sucesso!', 'success');
            }

            setTimeout(() => {
              window.location.href = 'carteira.html';
            }, 1500);
            return;
          }
        } else {
          console.log('[v0] salvarCarteiraBackend nao disponivel, usando fazerRequisicao diretamente...');
          if (typeof fazerRequisicao === 'function') {
            const timestamp = Date.now().toString(36).toUpperCase();
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            dadosCarteira.numero_carteira = `GO-PCD-${timestamp}-${random}`;

            if (usuario) {
              dadosCarteira.usuario_id = usuario.id;
            }

            const formData = new FormData();
            Object.entries(dadosCarteira).forEach(([key, value]) => {
              if (value === undefined || value === null) return;
              formData.append(key, String(value));
            });
            if (fotoFile) {
              formData.append('foto', fotoFile);
            }
            if (laudoFile) {
              formData.append('laudo', laudoFile);
            }

            console.log('[v0] Enviando FormData para API /carteiras');
            const resposta = await fazerRequisicao('/carteiras', 'POST', formData);
            console.log('[v0] Resposta da API:', resposta);

            if (resposta.sucesso) {
              const carteiraCriada = resposta.data || dadosCarteira;
              localStorage.setItem('carteira_dados', JSON.stringify({
                ...dadosCarteira,
                ...carteiraCriada
              }));
              localStorage.setItem('carteira_cadastrada', 'true');

              if (typeof mostrarToast === 'function') {
                mostrarToast('Carteira cadastrada com sucesso!', 'success');
              }

              setTimeout(() => {
                window.location.href = 'carteira.html';
              }, 1500);
              return;
            }
          }
        }
      } catch (erro) {
        console.error('[v0] Erro ao salvar carteira:', erro);
        console.error('[v0] Stack:', erro.stack);

        if (erro.status && erro.status < 500) {
          if (typeof mostrarToast === 'function') {
            mostrarToast(erro.message, 'error');
          }
          return;
        }

        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        dadosCarteira.numero_carteira = `GO-PCD-${timestamp}-${random}`;
        dadosCarteira.data_emissao = new Date().toISOString().split('T')[0];
        dadosCarteira.data_validade = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        localStorage.setItem('carteira_dados', JSON.stringify(dadosCarteira));
        localStorage.setItem('carteira_cadastrada', 'true');

        if (typeof mostrarNotificacao === 'function') {
          mostrarNotificacao('Carteira salva localmente. Sera sincronizada quando o servidor estiver disponivel.', 'warning');
        }

        setTimeout(() => {
          window.location.href = 'carteira.html';
        }, 2000);
        return;
      } finally {
        // Reabilita o botao
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
          submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Gerar Carteira Digital
          `;
        }
      }

      // Fallback final: salva localmente
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      dadosCarteira.numero_carteira = `GO-PCD-${timestamp}-${random}`;
      dadosCarteira.data_emissao = new Date().toISOString().split('T')[0];
      dadosCarteira.data_validade = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      localStorage.setItem('carteira_dados', JSON.stringify(dadosCarteira));
      localStorage.setItem('carteira_cadastrada', 'true');
      
      setTimeout(() => {
        window.location.href = 'carteira.html';
      }, 1000);
    });
  } else {
    console.error('registrationForm nao encontrado!');
  }

  console.log('✅ Todos os event listeners inicializados');

  // Inicializar validação do formulário
  checkForm();
}
