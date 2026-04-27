// GO Card PCD — carteira.js
// Carrega dados do localStorage e gera QR Code que aponta para carteira.html?d=<token>

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
  "E10":"Diabetes Tipo 1","E11":"Diabetes Tipo 2","J43":"Enfisema","J45":"Asma Grave"
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('pt-BR');
}

function formatCPF(v) {
  if (!v) return '—';
  const n = v.replace(/\D/g,'');
  if (n.length !== 11) return v;
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
}

function formatRG(v) {
  if (!v) return '—';
  const n = v.replace(/\D/g,'');
  if (n.length < 7) return v;
  if (n.length === 9) return n.replace(/(\d{2})(\d{3})(\d{3})(\d)/,'$1.$2.$3-$4');
  if (n.length === 8) return n.replace(/(\d{2})(\d{3})(\d{3})/,'$1.$2.$3');
  return n.replace(/(\d{1,2})(\d{3})(\d{3})/,'$1.$2.$3');
}

function formatTelefone(v) {
  if (!v) return '—';
  const n = v.replace(/\D/g,'');
  if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return v;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '—';
}

function parseEncodedData(encoded) {
  if (!encoded) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch (e) {
    console.error('Erro ao decodificar dados codificados:', e);
    return null;
  }
}

function setVerifyModeUI(enabled) {
  const banner = document.getElementById('verificacaoBanner');
  const tabs = document.querySelector('.wallet-card-tabs');
  const editLink = document.querySelector('.action-buttons .btn-secondary');
  const qrcodeSection = document.querySelector('.qrcode-column');
  const stampSection = document.querySelector('.verify-stamp-column');

  if (banner) banner.style.display = enabled ? 'flex' : 'none';
  if (tabs) tabs.style.display = enabled ? 'none' : '';
  if (editLink) editLink.style.display = enabled ? 'none' : '';
  if (qrcodeSection) qrcodeSection.style.display = enabled ? 'none' : '';
  if (stampSection) stampSection.style.display = enabled ? 'flex' : 'none';

  document.body.classList.toggle('verify-mode', enabled);
}

function loadVerificationData() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('d');

  if (!encoded) {
    loadWalletData();
    return;
  }

  const data = parseEncodedData(encoded);
  if (!data) {
    alert('Erro ao ler os dados do QR Code. O código pode estar danificado.');
    setVerifyModeUI(true);
    return;
  }

  renderCard(data);
  setVerifyModeUI(true);
}

function generateCardNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GC${timestamp}${random}`;
}

function generateVerifyCode(cpf, numero) {
  const raw = (cpf || '') + (numero || '') + 'GOCARD2025';
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return 'VER-' + Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
}

/**
 * Normaliza os dados da carteira, mapeando campos do banco para campos de exibicao
 */
function normalizarDadosCarteira(dados) {
  const d = { ...dados };
  
  // Mapeia campos do banco (snake_case) para campos de exibicao (camelCase)
  const mapeamento = {
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
    'data_validade': 'validade',
    'laudo_url': 'laudoArquivo',
    'laudoUrl': 'laudoArquivo',
  };
  
  for (const [snakeCase, camelCase] of Object.entries(mapeamento)) {
    if (d[snakeCase] !== undefined && d[camelCase] === undefined) {
      d[camelCase] = d[snakeCase];
    }
  }
  
  // Normaliza necessitaAcompanhante para texto
  if (typeof d.necessitaAcompanhante === 'boolean') {
    d.necessitaAcompanhante = d.necessitaAcompanhante ? 'Sim' : 'Nao';
  }
  
  return d;
}

async function loadWalletData() {
  setVerifyModeUI(false);
  
  let d = null;
  
  // 1. Primeiro tenta buscar do banco de dados via API
  try {
    if (typeof buscarCarteiraUsuario === 'function') {
      const carteiraBackend = await buscarCarteiraUsuario();
      if (carteiraBackend) {
        d = carteiraBackend;
      }
    }
  } catch (erro) {
    // Continua para tentar localStorage
  }
  
  // 2. Se nao encontrou no backend, tenta carteira_dados (novo formato)
  if (!d) {
    const carteiraDados = localStorage.getItem('carteira_dados');
    if (carteiraDados) {
      try {
        d = JSON.parse(carteiraDados);
      } catch (e) {
        // Continua
      }
    }
  }
  
  // 3. Fallback para userRegistration (formato antigo)
  if (!d) {
    const raw = localStorage.getItem('userRegistration');
    if (raw) {
      try {
        d = JSON.parse(raw);
      } catch (e) {
        // Continua
      }
    }
  }
  
  // Se nenhum dado encontrado, redireciona
  if (!d) {
    // Verifica se usuario esta logado
    if (typeof estaAutenticado === 'function' && estaAutenticado()) {
      // Usuario logado mas sem carteira - redireciona para cadastro
      window.location.href = 'cadastro_carteira.html';
    } else {
      // Usuario nao logado - redireciona para login
      window.location.href = 'index.html';
    }
    return;
  }

  // Normaliza campos que podem vir com nomes diferentes do banco
  d = normalizarDadosCarteira(d);

  // Gerar / recuperar metadados
  if (!d.numeroCarteira && !d.numero_carteira) {
    d.numeroCarteira = generateCardNumber();
  } else if (d.numero_carteira && !d.numeroCarteira) {
    d.numeroCarteira = d.numero_carteira;
  }
  
  if (!d.dataEmissao && !d.data_emissao) {
    d.dataEmissao = new Date().toISOString();
  } else if (d.data_emissao && !d.dataEmissao) {
    d.dataEmissao = d.data_emissao;
  }
  
  if (!d.validade && !d.data_validade) {
    d.validade = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString();
  } else if (d.data_validade && !d.validade) {
    d.validade = d.data_validade;
  }
  
  if (!d.codigoVerificacao) {
    d.codigoVerificacao = generateVerifyCode(d.cpf, d.numeroCarteira);
  }
  
  // Salva dados atualizados no localStorage
  localStorage.setItem('carteira_dados', JSON.stringify(d));
  localStorage.setItem('userRegistration', JSON.stringify(d)); // Compatibilidade

  // Foto
  if (d.foto) {
    const el = document.getElementById('fotoWallet');
    if (el) {
      el.style.backgroundImage = `url('${d.foto}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.innerHTML = '';
    }
  }

  // Dados pessoais
  setText('nomeWallet', d.nome);
  setText('dataWallet', formatDate(d.dataNascimento));
  const sexoMap = { M: 'Masculino', F: 'Feminino', NB: 'Não Binário' };
  setText('sexoWallet', sexoMap[d.sexo] || d.sexo);
  setText('cpfWallet', formatCPF(d.cpf));
  setText('rgWallet', formatRG(d.rg));
  setText('cidadeWallet', d.cidade && d.estado ? `${d.cidade} / ${d.estado}` : (d.cidade || '—'));
  setText('acompanhanteWallet', d.necessitaAcompanhante || '—');

  // Deficiência
  setText('tipoDefWallet', d.tipoDeficiencia || '—');
  setText('grauDefWallet', d.grauDeficiencia || '—');
  const cidUpper = (d.cid || '').toUpperCase();
  const baseCode = cidUpper.split('.')[0];
  const cidLabel = cidUpper ? `${cidUpper} — ${validCIDs[baseCode] || validCIDs[cidUpper] || 'Ver laudo'}` : '—';
  setText('cidWallet', cidLabel);
  setText('comunicacaoWallet', d.comunicacao || 'Nenhuma');

  // Laudo
  setText('laudoWallet', d.numeroLaudo || '—');
  setText('dataLaudoWallet', formatDate(d.dataLaudo));
  setText('medicoWallet', d.nomeMedico || '—');
  setText('crmWallet', d.crmMedico || '—');

  // Responsável legal
  if (d.nomeResponsavel) {
    const block = document.getElementById('responsavelBlock');
    if (block) block.style.display = '';
    setText('responsavelWallet', `${d.nomeResponsavel}${d.vinculoResponsavel ? ' (' + d.vinculoResponsavel + ')' : ''}`);
  }

  // Rodapé oficial
  setText('dataEmissao', formatDate(d.dataEmissao));
  setText('dataValidade', formatDate(d.validade));
  setText('numeroCarteira', d.numeroCarteira);
  setText('codigoVerificacao', d.codigoVerificacao);

  // Emergência
  setText('tipoSanguineoDisplay', d.tipoSanguineo || 'Não informado');
  setText('contatoDisplay', d.contatoEmergencia || 'Não informado');
  setText('alergiasDisplay', d.alergias || 'Nenhuma informada');
  setText('medicacoesDisplay', d.medicacoes || 'Nenhuma informada');
  setText('comunicacaoDisplay', d.comunicacao || 'Nenhuma necessidade especial');
  setText('acompanhanteDisplay', d.necessitaAcompanhante || '—');

  // Gerar QR Code
  generateQRCode(d);
  initWalletTabs();
}

function initWalletTabs() {
  const walletCard = document.getElementById('walletCard');
  const btnCarteira = document.getElementById('tabCarteira');
  const btnQRCode = document.getElementById('tabQRCode');
  if (!walletCard || !btnCarteira || !btnQRCode) return;

  btnCarteira.addEventListener('click', () => {
    walletCard.classList.remove('flipped');
    btnCarteira.classList.add('active');
    btnQRCode.classList.remove('active');
  });

  btnQRCode.addEventListener('click', () => {
    walletCard.classList.add('flipped');
    btnQRCode.classList.add('active');
    btnCarteira.classList.remove('active');
  });
}

function generateQRCode(d) {
  const container = document.getElementById('qrcodeWallet');
  if (!container) {
    console.log('[v0] Container QR Code nao encontrado');
    return;
  }
  container.innerHTML = '';

  // Dados essenciais para o QR Code (sem a foto para não exceder o limite do QR Code)
  // A foto será buscada do localStorage pelo ID quando necessário
  const payload = {
    n: d.nome,
    dn: d.dataNascimento,
    sx: d.sexo,
    cpf: d.cpf,
    rg: d.rg,
    tel: d.telefone,
    end: d.endereco,
    cid: d.cidade,
    uf: d.estado,
    td: d.tipoDeficiencia,
    gd: d.grauDeficiencia,
    cd: d.cid,
    na: d.necessitaAcompanhante,
    com: d.comunicacao,
    nl: d.numeroLaudo,
    dl: d.dataLaudo,
    nm: d.nomeMedico,
    crm: d.crmMedico,
    nr: d.nomeResponsavel,
    vr: d.vinculoResponsavel,
    ts: d.tipoSanguineo,
    al: d.alergias,
    med: d.medicacoes,
    ce: d.contatoEmergencia,
    nc: d.numeroCarteira,
    de: d.dataEmissao,
    val: d.validade,
    cv: d.codigoVerificacao
    // Foto removida do QR Code - será buscada pelo ID
  };

  // Codifica em base64 compactado
  const jsonStr = JSON.stringify(payload);
  const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
  
  // URL da pagina de verificacao
  const baseUrl = window.location.origin + window.location.pathname.replace('carteira.html', '');
  const verifyURL = `${baseUrl}carteira.html?d=${encoded}`;

  console.log('[v0] QR Code URL length:', verifyURL.length);

  // Verificar se a biblioteca QRCode esta disponivel
  if (typeof QRCode === 'undefined') {
    console.log('[v0] Biblioteca QRCode nao carregada, tentando fallback');
    container.innerHTML = `
      <div style="width:130px;height:130px;display:flex;align-items:center;justify-content:center;background:#f0f0f0;border-radius:8px;">
        <span style="color:#666;font-size:10px;text-align:center;">QR Code<br>Carregando...</span>
      </div>
    `;
    // Tentar carregar a biblioteca novamente
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => generateQRCode(d);
    document.head.appendChild(script);
    return;
  }

  try {
    new QRCode(container, {
      text: verifyURL,
      width: 130,
      height: 130,
      colorDark: '#1e3a5f',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.L // L = menor redundancia = mais dados
    });
    console.log('[v0] QR Code gerado com sucesso');
  } catch (e) {
    console.log('[v0] Erro ao gerar QR Code:', e);
    container.innerHTML = `
      <div style="width:130px;height:130px;display:flex;align-items:center;justify-content:center;background:#fff;border:2px dashed #ccc;border-radius:8px;">
        <span style="color:#999;font-size:10px;text-align:center;">Erro QR<br>${e.message}</span>
      </div>
    `;
  }
}

// Imprimir
document.getElementById('printBtn')?.addEventListener('click', () => window.print());

// Baixar PNG
document.getElementById('downloadBtn')?.addEventListener('click', async () => {
  const card = document.getElementById('walletCard');
  if (!card) return;
  
  const btn = document.getElementById('downloadBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span>Gerando...</span>';
  btn.disabled = true;
  
  try {
    if (typeof html2canvas === 'undefined') {
      throw new Error('Biblioteca html2canvas não carregada');
    }
    
    const canvas = await html2canvas(card, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });
    
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `carteira-go-card-${Date.now()}.png`;
    link.click();
  } catch (e) {
    console.log('[v0] Erro ao baixar PNG:', e);
    alert('Erro ao gerar imagem. Tente usar a opção "Imprimir" e salvar como PDF.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Baixar PDF
function showWalletFront() {
  const walletCard = document.getElementById('walletCard');
  const btnCarteira = document.getElementById('tabCarteira');
  const btnQRCode = document.getElementById('tabQRCode');
  if (!walletCard || !btnCarteira || !btnQRCode) return;
  walletCard.classList.remove('flipped');
  btnCarteira.classList.add('active');
  btnQRCode.classList.remove('active');
}

// Certifica que a carteira abre sempre pelo lado correto
showWalletFront();

document.getElementById('downloadPdfBtn')?.addEventListener('click', async () => {
  const card = document.getElementById('walletCard');
  if (!card) return;
  
  const btn = document.getElementById('downloadPdfBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span>Gerando PDF...</span>';
  btn.disabled = true;
  
  try {
    if (typeof html2canvas === 'undefined') {
      throw new Error('Biblioteca html2canvas não carregada');
    }
    
    const canvas = await html2canvas(card, {
      backgroundColor: '#1e3a5f',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });
    
    // Criar PDF usando jsPDF
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      // Fallback: baixar como imagem
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `carteira-go-card-${Date.now()}.png`;
      link.click();
      alert('PDF não disponível. Imagem PNG baixada.');
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const imgData = canvas.toDataURL('image/png');
    
    // Calcular dimensoes do PDF (A4 ou tamanho customizado)
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    
    // PDF em formato cartao (tamanho cartao de credito: 85.6mm x 53.98mm, mas maior para legibilidade)
    const pdfWidth = 210; // A4 width em mm
    const pdfHeight = pdfWidth / ratio;
    
    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`carteira-go-card-${Date.now()}.pdf`);
    
  } catch (e) {
    console.log('[v0] Erro ao baixar PDF:', e);
    alert('Erro ao gerar PDF. Use a opção "Imprimir" e selecione "Salvar como PDF".');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Modais
const guiaLegalModal = document.getElementById('guiaLegalModal');
const denunciaModal = document.getElementById('denunciaModal');

document.getElementById('guiaLegalBtn')?.addEventListener('click', () => guiaLegalModal?.classList.remove('hidden'));
document.getElementById('closeGuiaLegal')?.addEventListener('click', () => guiaLegalModal?.classList.add('hidden'));
document.getElementById('denunciaBtn')?.addEventListener('click', () => denunciaModal?.classList.remove('hidden'));
document.getElementById('closeDenuncia')?.addEventListener('click', () => denunciaModal?.classList.add('hidden'));

guiaLegalModal?.addEventListener('click', e => { if (e.target === guiaLegalModal) guiaLegalModal.classList.add('hidden'); });
denunciaModal?.addEventListener('click', e => { if (e.target === denunciaModal) denunciaModal.classList.add('hidden'); });

document.getElementById('denunciaForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const protocolo = 'DEN' + Date.now().toString().slice(-10);
  alert(`Denúncia registrada!\n\nProtocolo: ${protocolo}\n\nSua denúncia será encaminhada ao MP, Defensoria Pública e ONGs parceiras.`);
  denunciaModal?.classList.add('hidden');
  e.target.reset();
});

// Visualizar Laudo
document.getElementById('verLaudoBtn')?.addEventListener('click', () => {
  const raw = localStorage.getItem('userRegistration');
  if (!raw) return;
  const d = JSON.parse(raw);
  if (d.laudoArquivo) {
    // Abrir em nova aba
    const newWindow = window.open();
    if (d.laudoArquivo.startsWith('data:application/pdf')) {
      newWindow.document.write(`<iframe src="${d.laudoArquivo}" style="width:100%;height:100%;border:none;"></iframe>`);
    } else {
      newWindow.document.write(`<img src="${d.laudoArquivo}" style="max-width:100%;height:auto;">`);
    }
  } else {
    alert('Nenhum laudo anexado.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('d')) {
    loadVerificationData();
  } else {
    loadWalletData();
  }
});
