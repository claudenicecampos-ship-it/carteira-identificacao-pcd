/**
 * informacoes-carteira.js
 * Página responsável por exibir informações de uma carteira obtida via QR Code
 * Principios: Clean Code, Single Responsibility, DRY
 */

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const CID_DESCRIPTIONS = {
  "6A02": "Transtorno do Espectro Autista", "F84": "Transtorno Global do Desenvolvimento",
  "F70": "Deficiência Intelectual Leve", "F71": "Deficiência Intelectual Moderada",
  "F72": "Deficiência Intelectual Grave", "F73": "Deficiência Intelectual Profunda",
  "F78": "Deficiência Intelectual", "F79": "Deficiência Intelectual",
  "G80": "Paralisia Cerebral", "G82": "Paraplegia / Tetraplegia", "G20": "Doença de Parkinson",
  "H54": "Cegueira / Baixa Visão", "H90": "Surdez", "H91": "Perda Auditiva",
  "F01": "Deficiência Intelectual", "F20": "Transtorno Psicossocial",
  "I63": "AVC", "I69": "Sequela de AVC", "Q05": "Espinha Bífida",
  "G11": "Ataxia", "M06": "Artrite Reumatoide", "N18": "Doença Renal Crônica",
  "J44": "DPOC", "P96": "Deficiência Múltipla",
  "H00": "Deficiência Visual", "H10": "Deficiência Visual", "H25": "Catarata", "H40": "Glaucoma",
  "H60": "Deficiência Auditiva", "H66": "Deficiência Auditiva", "H72": "Deficiência Auditiva",
  "E10": "Diabetes Tipo 1", "E11": "Diabetes Tipo 2", "J43": "Enfisema", "J45": "Asma Grave"
};

const GENDER_MAP = { M: 'Masculino', F: 'Feminino', NB: 'Não Binário' };

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * Formata data ISO para formato brasileiro
 * @param {string} isoDate - Data em formato ISO (ex: 2000-01-15)
 * @returns {string} Data formatada (ex: 15/01/2000) ou '—' se vazia
 */
function formatDate(isoDate) {
  if (!isoDate) return '—';
  try {
    const date = new Date(isoDate + (isoDate.length === 10 ? 'T00:00:00' : ''));
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return isoDate;
  }
}

/**
 * Formata CPF com máscara
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado (ex: 123.456.789-00) ou original se inválido
 */
function formatCPF(cpf) {
  if (!cpf) return '—';
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) return cpf;
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata RG com máscara
 * @param {string} rg - RG sem formatação
 * @returns {string} RG formatado
 */
function formatRG(rg) {
  if (!rg) return '—';
  const numbers = rg.replace(/\D/g, '');
  if (numbers.length < 7) return rg;
  if (numbers.length === 9) return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
  if (numbers.length === 8) return numbers.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
  return numbers.replace(/(\d{1,2})(\d{3})(\d{3})/, '$1.$2.$3');
}

/**
 * Formata telefone com máscara
 * @param {string} tel - Telefone sem formatação
 * @returns {string} Telefone formatado ou original se inválido
 */
function formatPhone(tel) {
  if (!tel) return '—';
  const numbers = tel.replace(/\D/g, '');
  if (numbers.length === 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  if (numbers.length === 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return tel;
}

/**
 * Constrói URL da imagem de backend
 * @param {string} filePath - Caminho do arquivo
 * @returns {string|null} URL completa ou null
 */
function buildImageUrl(filePath) {
  if (!filePath) return null;
  if (/^(https?:)?\/\//.test(filePath)) return filePath;
  
  const trimmed = filePath.replace(/^\/+/, '');
  if (trimmed.startsWith('imgs/') || trimmed.startsWith('laudos/')) {
    return `${ENV_BACKEND_URL}/${trimmed}`;
  }
  return `${ENV_BACKEND_URL}/${trimmed}`;
}

/**
 * Tenta ler a carteira local do profile logado ou de cache local
 * @returns {object|null}
 */
function getWalletFromLocalStorage() {
  const carteiraDados = localStorage.getItem('carteira_dados');
  if (carteiraDados) {
    try {
      return JSON.parse(carteiraDados);
    } catch (e) {
      console.warn('Erro ao parsear carteira_dados local:', e);
    }
  }

  const userRegistration = localStorage.getItem('userRegistration');
  if (userRegistration) {
    try {
      return JSON.parse(userRegistration);
    } catch (e) {
      console.warn('Erro ao parsear userRegistration local:', e);
    }
  }

  return null;
}

// ============================================================================
// DOM HELPERS
// ============================================================================

/**
 * Define o texto de um elemento pelo ID
 * @param {string} elementId - ID do elemento
 * @param {string} value - Valor a exibir
 */
function setText(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value || '—';
  }
}

/**
 * Define o src de uma imagem com validação
 * @param {string} elementId - ID da imagem
 * @param {string} url - URL da imagem
 */
function setImage(elementId, url) {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (!url) {
    element.style.display = 'none';
    return;
  }

  fetch(url, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        element.src = url;
      } else {
        element.style.display = 'none';
      }
    })
    .catch(() => {
      element.style.display = 'none';
    });
}

/**
 * Exibe um estado de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('contentState').style.display = 'none';
  document.getElementById('errorState').style.display = 'block';
  document.getElementById('errorMessage').textContent = message;
}

/**
 * Exibe o conteúdo carregado
 */
function showContent() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('errorState').style.display = 'none';
  document.getElementById('contentState').style.display = 'block';
}

// ============================================================================
// DATA NORMALIZATION
// ============================================================================

/**
 * Normaliza dados da carteira mapeando campos do banco para a aplicação
 * @param {object} data - Dados brutos da carteira
 * @returns {object} Dados normalizados
 */
function normalizeWalletData(data) {
  const normalized = { ...data };
  
  const fieldMapping = {
    'data_nascimento': 'dataNascimento',
    'tipo_deficiencia': 'tipoDeficiencia',
    'grau_deficiencia': 'grauDeficiencia',
    'necessita_acompanhante': 'necessitaAcompanhante',
    'numero_laudo': 'numeroLaudo',
    'data_laudo': 'dataLaudo',
    'nome_medico': 'nomeMedico',
    'crm_medico': 'crmMedico',
    'tipo_sanguineo': 'tipoSanguineo',
    'contato_emergencia': 'contatoEmergencia',
    'nome_responsavel': 'nomeResponsavel',
    'cpf_responsavel': 'cpfResponsavel',
    'vinculo_responsavel': 'vinculoResponsavel',
    'numero_carteira': 'numeroCarteira',
    'data_emissao': 'dataEmissao',
    'data_validade': 'dataValidade',
    'laudo_url': 'laudoArquivo',
  };

  Object.entries(fieldMapping).forEach(([dbField, appField]) => {
    if (normalized[dbField] !== undefined && normalized[appField] === undefined) {
      normalized[appField] = normalized[dbField];
    }
  });

  // Normaliza booleanos
  if (typeof normalized.necessitaAcompanhante === 'boolean') {
    normalized.necessitaAcompanhante = normalized.necessitaAcompanhante ? 'Sim' : 'Não';
  }

  return normalized;
}

// ============================================================================
// CID HANDLING
// ============================================================================

/**
 * Obtém descrição do CID
 * @param {string} cid - Código CID
 * @returns {string} Descrição formatada do CID ou 'Ver laudo' se não encontrado
 */
function getCIDDescription(cid) {
  if (!cid) return '—';
  
  const cidUpper = cid.toUpperCase();
  const baseCode = cidUpper.split('.')[0];
  const description = CID_DESCRIPTIONS[baseCode] || CID_DESCRIPTIONS[cidUpper] || 'Ver laudo';
  
  return `${cidUpper} — ${description}`;
}

// ============================================================================
// DATA LOADING & DISPLAY
// ============================================================================

/**
 * Carrega dados da carteira via API usando o numeroCarteira
 * @returns {Promise<object>} Dados da carteira ou null
 */
async function loadWalletDataFromAPI(numeroCarteira) {
  try {
    const url = `${ENV_BACKEND_URL}/api/carteiras/${encodeURIComponent(numeroCarteira)}`;
    console.log('[API] Buscando carteira:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: Carteira não encontrada ou servidor indisponível`);
    }
    
    const result = await response.json();
    if (!result.data && !result.sucesso) {
      throw new Error(result.mensagem || 'Resposta inválida do servidor');
    }
    
    return result.data || result;
  } catch (error) {
    console.error('[API] Erro ao buscar carteira:', error);
    throw error;
  }
}

/**
 * Extrai o numeroCarteira da URL (parâmetro 'id')
 * @returns {string|null} numeroCarteira ou null
 */
function getCarteirasIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || params.get('numero_carteira');
}

/**
 * Renderiza todos os campos da carteira na página
 * @param {object} data - Dados normalizados da carteira
 */
function renderWalletInfo(data) {
  // Cabeçalho
  setText('cardNumberDisplay', `Nº ${data.numeroCarteira || '—'}`);

  // Foto
  setImage('fotoDisplay', buildImageUrl(data.foto));

  // Dados Pessoais
  setText('nomeDisplay', data.nome);
  setText('dataNascimentoDisplay', formatDate(data.dataNascimento));
  setText('sexoDisplay', GENDER_MAP[data.sexo] || data.sexo);
  setText('cpfDisplay', formatCPF(data.cpf));
  setText('rgDisplay', formatRG(data.rg));

  // Endereço
  setText('enderecoDisplay', data.endereco);
  setText('cidadeDisplay', data.cidade && data.estado ? `${data.cidade} / ${data.estado}` : data.cidade);
  setText('telefoneDisplay', formatPhone(data.telefone));

  // Deficiência
  setText('tipoDeficienciaDisplay', data.tipoDeficiencia);
  setText('grauDeficienciaDisplay', data.grauDeficiencia);
  setText('cidDisplay', getCIDDescription(data.cid));
  setText('acompanhanteDisplay', data.necessitaAcompanhante);
  setText('comunicacaoDisplay', data.comunicacao);

  // Laudo Médico
  setText('numeroLaudoDisplay', data.numeroLaudo);
  setText('dataLaudoDisplay', formatDate(data.dataLaudo));
  setText('medicoDisplay', data.nomeMedico);
  setText('crmDisplay', data.crmMedico);

  // Saúde e Emergência
  setText('tipoSanguineoDisplay', data.tipoSanguineo);
  setText('alergiasDisplay', data.alergias);
  setText('medicacoesDisplay', data.medicacoes);
  setText('contatoEmergenciaDisplay', formatPhone(data.contatoEmergencia));

  // Responsável Legal
  if (data.nomeResponsavel) {
    document.getElementById('responsavelSection').style.display = 'block';
    setText('nomeResponsavelDisplay', data.nomeResponsavel);
    setText('cpfResponsavelDisplay', formatCPF(data.cpfResponsavel));
    setText('vinculoResponsavelDisplay', data.vinculoResponsavel);
  }

  // Carteira
  setText('numeroCarteiraDisplay', data.numeroCarteira);
  setText('dataEmissaoDisplay', formatDate(data.dataEmissao));
  setText('dataValidadeDisplay', formatDate(data.dataValidade));
  setText('codigoVerificacaoDisplay', data.codigoVerificacao);

  showContent();
}

/**
 * Inicializa a página carregando e exibindo dados da carteira
 */
async function initializePage() {
  const numeroCarteira = getCarteirasIdFromURL();
  let walletData = null;

  if (numeroCarteira) {
    try {
      walletData = await loadWalletDataFromAPI(numeroCarteira);
    } catch (error) {
      console.warn('Falha ao carregar pela URL:', error);
      const storedWallet = getWalletFromLocalStorage();
      if (storedWallet) {
        walletData = storedWallet;
      } else {
        showError(`Erro ao carregar carteira: ${error.message}`);
        return;
      }
    }
  } else {
    const storedWallet = getWalletFromLocalStorage();
    if (!storedWallet) {
      showError('ID da carteira não fornecido. Escaneie um QR Code válido ou abra a carteira pelo perfil logado.');
      return;
    }
    walletData = storedWallet;
  }

  const normalizedData = normalizeWalletData(walletData);
  renderWalletInfo(normalizedData);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', initializePage);
