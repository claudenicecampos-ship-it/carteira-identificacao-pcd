// GO Card PCD — script.js (Cadastro)
// Validacoes completas para documento oficial brasileiro

const API_BASES = Array.from(new Set([
  window.location.protocol.startsWith('http') ? `${window.location.origin}/api` : null,
  'http://localhost:3000/api',
  'http://localhost:3001/api'
].filter(Boolean)));

let authToken = localStorage.getItem('carteira_token');

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

// API functions
async function apiRequest(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(options.headers || {})
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let lastNetworkError = null;

  for (const apiBase of API_BASES) {
    const url = `${apiBase}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(data?.error || data || 'API request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        lastNetworkError = error;
        continue;
      }
      throw error;
    }
  }

  throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está aberto.');
}

async function registerUser(email, password) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  authToken = data.token;
  localStorage.setItem('carteira_token', authToken);
  return data;
}

async function loginUser(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  authToken = data.token;
  localStorage.setItem('carteira_token', authToken);
  return data;
}

async function createCard(cardData) {
  const formData = cardData instanceof FormData ? cardData : new FormData();

  if (!(cardData instanceof FormData)) {
    Object.keys(cardData).forEach(key => {
      if (cardData[key] !== null && cardData[key] !== undefined) {
        formData.append(key, cardData[key]);
      }
    });
  }

  return apiRequest('/carteiras', {
    method: 'POST',
    body: formData
  });
}

function logout() {
  authToken = null;
  localStorage.removeItem('carteira_token');
  window.location.reload();
}

// ===== CAMPOS =====
const fields = {
  foto: { input: document.getElementById('foto-input'), error: document.getElementById('fotoError'), preview: document.getElementById('fotoPreview') },
  nome: { input: document.getElementById('nome'), error: document.getElementById('nomeError'), check: document.getElementById('nomeCheck') },
  dataNascimento: { input: document.getElementById('dataNascimento'), error: document.getElementById('dataError'), check: document.getElementById('dataCheck') },
  sexo: { input: document.getElementById('sexo'), error: document.getElementById('sexoError') },
  cpf: { input: document.getElementById('cpf'), error: document.getElementById('cpfError'), check: document.getElementById('cpfCheck') },
  rg: { input: document.getElementById('rg'), error: document.getElementById('rgError'), check: document.getElementById('rgCheck') },
  telefone: { input: document.getElementById('telefone'), error: document.getElementById('telefoneError'), check: document.getElementById('telefoneCheck') },
  email: { input: document.getElementById('email'), error: document.getElementById('emailError'), check: document.getElementById('emailCheck') },
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
};

const submitBtn = document.getElementById('submitBtn');
let laudoFileData = null;
let fotoFileData = null;

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

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
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
  return v.trim().length >= 5 && /^[a-záéíóúàâêôãõçñ\s.]+$/i.test(v.trim()); 
}

function isValidCRM(v) { 
  const trimmed = v.trim().toUpperCase();
  // Formato: CRM-UF 123456 ou CRP-UF 123456 ou CRFa-UF 123456
  return trimmed.length >= 6 && /^(CRM|CRP|CRFA)[\s\-]?[A-Z]{2}[\s\-]?\d{4,6}$/i.test(trimmed.replace(/\s+/g,''));
}

// ===== MASCARAS =====
function onlyDigits(value, maxDigits) {
  return String(value || '').replace(/\D/g,'').slice(0, maxDigits);
}

function maskCPF(v) {
  const n = onlyDigits(v, 11);
  return n.replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskRG(v) {
  const n = onlyDigits(v, 9);
  if (n.length <= 2) return n;
  if (n.length <= 5) return n.replace(/(\d{2})(\d)/, '$1.$2');
  if (n.length <= 8) return n.replace(/(\d{2})(\d{3})(\d)/, '$1.$2.$3');
  return n.replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
}

function maskTelefone(v) {
  const n = onlyDigits(v, 11);
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
    email: 'E-mail inválido',
    cidade: 'Informe o município corretamente',
    cid: 'CID não encontrado. Ex: F84, H90, G80',
    numeroLaudo: 'Informe o número do laudo',
    nomeMedico: 'Nome do profissional inválido',
    crmMedico: 'Formato inválido. Ex: CRM-SP 123456',
    dataLaudo: 'Data do laudo inválida',
    laudoFile: 'Anexe o laudo médico (PDF ou imagem)',
    foto: 'Selecione uma foto 3x4',
  };
  return msgs[f] || 'Campo inválido';
}

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

fields.email.input?.addEventListener('input', e => {
  setValid('email', isValidEmail(e.target.value), e.target.value);
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

// Selects
document.getElementById('sexo')?.addEventListener('change', checkForm);
document.getElementById('estado')?.addEventListener('change', checkForm);
document.getElementById('tipoDeficiencia')?.addEventListener('change', checkForm);
document.getElementById('grauDeficiencia')?.addEventListener('change', checkForm);
document.getElementById('necessitaAcompanhante')?.addEventListener('change', checkForm);

document.getElementById('cpfResponsavel')?.addEventListener('input', e => {
  e.target.value = maskCPF(e.target.value);
  checkForm();
});

// ===== UPLOAD DE FOTO - CORRIGIDO =====
if (fields.foto.input) {
  fields.foto.input.addEventListener('change', function(e) {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('Nenhum arquivo selecionado');
      return;
    }
    
    // Validar tipo de arquivo
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      if (fields.foto.error) {
        fields.foto.error.textContent = 'Formato inválido. Use JPG, PNG ou GIF.';
        fields.foto.error.classList.add('show');
      }
      e.target.value = ''; // Limpa o input
      return;
    }
    
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      if (fields.foto.error) {
        fields.foto.error.textContent = 'Arquivo muito grande. Máximo 5MB.';
        fields.foto.error.classList.add('show');
      }
      e.target.value = ''; // Limpa o input
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = function() {
      fotoFileData = reader.result;
      if (fields.foto.preview) {
        fields.foto.preview.style.backgroundImage = `url('${reader.result}')`;
        fields.foto.preview.classList.add('has-image');
        // Esconde o ícone SVG dentro do preview
        const svgIcon = fields.foto.preview.querySelector('svg');
        if (svgIcon) {
          svgIcon.style.display = 'none';
        }
      }
      if (fields.foto.error) {
        fields.foto.error.textContent = '';
        fields.foto.error.classList.remove('show');
      }
      checkForm();
    };
    reader.onerror = function() {
      if (fields.foto.error) {
        fields.foto.error.textContent = 'Erro ao ler o arquivo. Tente novamente.';
        fields.foto.error.classList.add('show');
      }
    };
    reader.readAsDataURL(file);
  });
}

<<<<<<<< HEAD:frontend/assets/js/script.js
// ===== UPLOAD DE LAUDO - CORRIGIDO =====
if (fields.laudoFile.input) {
  fields.laudoFile.input.addEventListener('change', function(e) {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('Nenhum arquivo de laudo selecionado');
      return;
    }
    
    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      if (fields.laudoFile.error) {
        fields.laudoFile.error.textContent = 'Arquivo muito grande. Máximo 10MB.';
        fields.laudoFile.error.classList.add('show');
      }
      e.target.value = ''; // Limpa o input
      return;
    }
    
    // Validar tipo de arquivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      if (fields.laudoFile.error) {
        fields.laudoFile.error.textContent = 'Formato inválido. Use PDF, JPG ou PNG.';
        fields.laudoFile.error.classList.add('show');
      }
      e.target.value = ''; // Limpa o input
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
}
========
// Laudo File
fields.laudoFile.input?.addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    fields.laudoFile.error.textContent = 'Arquivo muito grande. Máximo 5MB.';
    fields.laudoFile.error.classList.add('show');
    return;
  }
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    fields.laudoFile.error.textContent = 'Formato inválido. Use PDF, JPG ou PNG.';
    fields.laudoFile.error.classList.add('show');
    return;
  }
  
  const reader = new FileReader();
  reader.onloadend = () => {
    laudoFileData = reader.result;
    fields.laudoFile.preview.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--success-500)">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span style="color: var(--success-600); font-weight: 500">${file.name}</span>
    `;
    fields.laudoFile.preview.classList.add('has-file');
    fields.laudoFile.error.textContent = '';
    fields.laudoFile.error.classList.remove('show');
    checkForm();
  };
  reader.readAsDataURL(file);
});
>>>>>>>> 9b63bc8bf2dfd0cd4475962410d494b918007981:frontend/public/script.js

function getAccountCredentials() {
  const email = (fields.email.input?.value || '').trim().toLowerCase();
  const cpfDigits = (fields.cpf.input?.value || '').replace(/\D/g, '');
  const password = `GoCard@${cpfDigits.slice(-6).padStart(6, '0')}`;

  return { email, password };
}

function getFormIssues() {
  const fotoOk = fields.foto.preview?.classList.contains('has-image');
  const laudoOk = fields.laudoFile.preview?.classList.contains('has-file');
  const issues = [];

  if (!fotoOk) issues.push('adicione a foto 3x4');
  if (!isValidName(fields.nome.input?.value || '')) issues.push('preencha o nome completo');
  if (!isValidDate(fields.dataNascimento.input?.value || '')) issues.push('informe uma data de nascimento válida');
  if (!document.getElementById('sexo')?.value) issues.push('selecione o sexo');
  if (!isValidCPF(fields.cpf.input?.value || '')) issues.push('digite um CPF válido');
  if (!isValidRG(fields.rg.input?.value || '')) issues.push('digite um RG válido');
  if (!isValidTelefone(fields.telefone.input?.value || '')) issues.push('digite um telefone válido');
  if (!isValidEmail(fields.email.input?.value || '')) issues.push('digite um e-mail válido');
  if (!isValidCity(fields.cidade.input?.value || '')) issues.push('preencha o município');
  if (!document.getElementById('estado')?.value) issues.push('selecione o estado');
  if (!document.getElementById('tipoDeficiencia')?.value) issues.push('selecione o tipo de deficiência');
  if (!document.getElementById('grauDeficiencia')?.value) issues.push('selecione o grau da deficiência');
  if (!isValidCID(fields.cid.input?.value || '')) issues.push('informe um CID válido');
  if (!document.getElementById('necessitaAcompanhante')?.value) issues.push('informe se necessita de acompanhante');
  if (!isValidLaudo(fields.numeroLaudo.input?.value || '')) issues.push('informe o número do laudo');
  if (!isValidDate(fields.dataLaudo.input?.value || '')) issues.push('informe a data do laudo');
  if (!isValidMedico(fields.nomeMedico.input?.value || '')) issues.push('preencha o nome do profissional');
  if (!isValidCRM(fields.crmMedico.input?.value || '')) issues.push('digite um CRM/CRP/CRFa válido');
  if (!laudoOk) issues.push('anexe o laudo médico');

  return issues;
}

function checkForm() {
  if (!submitBtn) return false;

  const ok = getFormIssues().length === 0;
  submitBtn.style.opacity = ok ? '1' : '0.75';
  submitBtn.style.cursor = ok ? 'pointer' : 'not-allowed';
  submitBtn.title = ok ? 'Formulário pronto para envio' : 'Preencha todos os campos obrigatórios corretamente';
  return ok;
}

<<<<<<<< HEAD:frontend/assets/js/script.js
// ===== SUBMIT - CORRIGIDO COM ASYNC =====
document.getElementById('registrationForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const fotoSrc = fotoFileData || (fields.foto.preview?.style.backgroundImage.slice(5, -2) || '');
========
// ===== SUBMIT =====
document.getElementById('registrationForm')?.addEventListener('submit', async(e) => {
  e.preventDefault();

  const issues = getFormIssues();
  if (issues.length > 0) {
    alert('Revise os campos obrigatórios antes de enviar:\n\n• ' + issues.join('\n• '));
    checkForm();
    return;
  }

  const originalButtonHtml = submitBtn?.innerHTML;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Enviando...</span>';
  }

  const fotoSrc = fields.foto.preview.style.backgroundImage.slice(5, -2);
>>>>>>>> 9b63bc8bf2dfd0cd4475962410d494b918007981:frontend/public/script.js

  const accountCredentials = getAccountCredentials();

  const data = {
    foto: fotoSrc,
    nome: fields.nome.input?.value.trim() || '',
    data_nascimento: fields.dataNascimento.input?.value || '',
    sexo: document.getElementById('sexo')?.value || '',
    cpf: fields.cpf.input?.value.replace(/\D/g,'') || '',
    rg: fields.rg.input?.value.replace(/\D/g,'') || '',
    telefone: fields.telefone.input?.value.replace(/\D/g,'') || '',
    email: fields.email.input?.value.trim() || '',
    endereco: document.getElementById('endereco')?.value.trim() || '',
    cidade: fields.cidade.input?.value.trim() || '',
    estado: document.getElementById('estado')?.value || '',
    tipo_deficiencia: document.getElementById('tipoDeficiencia')?.value || '',
    grau_deficiencia: document.getElementById('grauDeficiencia')?.value || '',
    cid: fields.cid.input?.value.toUpperCase().trim() || '',
    necessita_acompanhante: document.getElementById('necessitaAcompanhante')?.value || '',
    comunicacao: document.getElementById('comunicacao')?.value || '',
    numero_laudo: fields.numeroLaudo.input?.value.trim() || '',
    data_laudo: fields.dataLaudo.input?.value || '',
    nome_medico: fields.nomeMedico.input?.value.trim() || '',
    crm_medico: fields.crmMedico.input?.value.trim().toUpperCase() || '',
    laudo_url: laudoFileData,
    nome_responsavel: document.getElementById('nomeResponsavel')?.value.trim() || '',
    cpf_responsavel: document.getElementById('cpfResponsavel')?.value.trim() || '',
    vinculo_responsavel: document.getElementById('vinculoResponsavel')?.value || '',
    tipo_sanguineo: document.getElementById('tipoSanguineo')?.value || '',
    alergias: document.getElementById('alergias')?.value.trim() || '',
    medicacoes: document.getElementById('medicacoes')?.value.trim() || '',
    contato_emergencia: document.getElementById('contatoEmergencia')?.value.trim() || '',
  };

  // Create card
  const formData = new FormData();
  formData.append('nome', data.nome);
    formData.append('data_nascimento', data.dataNascimento);
    formData.append('sexo', data.sexo);
    formData.append('cpf', data.cpf);
    formData.append('rg', data.rg);
    formData.append('telefone', data.telefone);
    formData.append('email', data.email);
    formData.append('endereco', data.endereco);
    formData.append('cidade', data.cidade);
    formData.append('estado', data.estado);
    formData.append('tipo_deficiencia', data.tipoDeficiencia);
    formData.append('grau_deficiencia', data.grauDeficiencia);
    formData.append('cid', data.cid);
    formData.append('numero_laudo', data.numeroLaudo);
    formData.append('data_laudo', data.dataLaudo);
    formData.append('nome_medico', data.nomeMedico);
    formData.append('crm_medico', data.crmMedico);
    formData.append('acompanhante', data.necessitaAcompanhante === 'Sim' ? '1' : '0');

    const fotoFile = fields.foto.input?.files?.[0];
    if (fotoFile) {
      formData.append('foto', fotoFile, fotoFile.name || 'foto.jpg');
    }

    const laudoFile = fields.laudoFile.input?.files?.[0];
    if (laudoFile) {
      formData.append('laudoFile', laudoFile, laudoFile.name);
    }

    const createdCard = await createCard(formData);
    localStorage.setItem('userRegistration', JSON.stringify({ ...data, card: createdCard }));
    alert('Carteira criada com sucesso!');
    window.location.href = 'carteira.html';
  } catch (error) {
    alert('Erro ao criar carteira: ' + error.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalButtonHtml || '<span>Gerar Carteira GO Card PCD</span>';
    }
    checkForm();
  }
>>>>>>>> 9b63bc8bf2dfd0cd4475962410d494b918007981:frontend/public/script.js
});

checkForm();

// ===== CHATBOT =====
const chatbotModal = document.getElementById('chatbotModal');
document.getElementById('chatbotBtn')?.addEventListener('click', e => { 
  e.preventDefault(); 
  chatbotModal?.classList.remove('hidden'); 
});
document.getElementById('closeChatbot')?.addEventListener('click', () => {
  chatbotModal?.classList.add('hidden');
});
chatbotModal?.addEventListener('click', e => { 
  if (e.target === chatbotModal) chatbotModal.classList.add('hidden'); 
});

function addMsg(text, isUser = false) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = isUser ? 'user-message' : 'bot-message';
  div.innerHTML = `<p>${text}</p>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('cadastro') || m.includes('preencher') || m.includes('formulário')) return chatbotResponses.cadastro;
  if (m.includes('cid') || m.includes('código') || m.includes('classificação')) return chatbotResponses.cid;
  if (m.includes('direito') || m.includes('benefício')) return chatbotResponses.direitos;
  if (m.includes('laudo') || m.includes('médico') || m.includes('crm')) return chatbotResponses.laudo;
  if (m.includes('renov') || m.includes('validade') || m.includes('prazo')) return chatbotResponses.renovacao;
  if (m.includes('acompanhante') || m.includes('assistente')) return chatbotResponses.acompanhante;
  return chatbotResponses.default;
}

function sendChat() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  addMsg(msg, true);
  input.value = '';
  setTimeout(() => addMsg(getBotReply(msg)), 500);
}

document.getElementById('sendChat')?.addEventListener('click', sendChat);
document.getElementById('chatInput')?.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendChat();
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  checkForm();
});
    window.location.reload();
  } catch (error) {
    alert('Erro no login: ' + error.message);
  }
});

>>>>>>>> 9b63bc8bf2dfd0cd4475962410d494b918007981:frontend/public/script.js
