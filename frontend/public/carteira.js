// GO Card PCD — carteira.js
// Carrega dados da API e gera QR Code que aponta para verificar.html

const API_BASES = Array.from(new Set([
  'http://localhost:3001/api',
  'http://localhost:3000/api',
  window.location.protocol.startsWith('http') ? `${window.location.origin}/api` : null
].filter(Boolean)));
let authToken = localStorage.getItem('carteira_token');

async function apiRequest(endpoint, options = {}) {
  let lastNetworkError = null;

  for (const apiBase of API_BASES) {
    const url = `${apiBase}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      const data = contentType.includes('application/json') ? JSON.parse(text) : text;

      if (!response.ok) {
        if (!contentType.includes('application/json')) {
          lastNetworkError = new Error(`Resposta não JSON do servidor em ${url}`);
          continue;
        }
        throw new Error(data.error || data.mensagem || data || 'API request failed');
      }

      if (!contentType.includes('application/json')) {
        throw new Error(`Resposta inesperada do servidor em ${url}`);
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        lastNetworkError = error;
        continue;
      }
      if (error.message && error.message.startsWith('Resposta não JSON')) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Não foi possível conectar ao servidor.');
}

async function getMyCard() {
  return apiRequest('/carteiras/minha');
}

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

function loadWalletData() {
  if (!authToken) {
    alert('Você precisa fazer login primeiro.');
    window.location.href = 'index.html';
    return;
  }

  getMyCard().then(data => {
    renderCard(data);
  }).catch(error => {
    console.error('Erro ao carregar carteira:', error);
    alert('Erro ao carregar carteira: ' + error.message);
    window.location.href = 'index.html';
  });
}

function renderCard(d) {
  // Foto
  if (d.foto) {
    const el = document.getElementById('fotoWallet');
    if (el) {
      // Assuming foto is base64 string
      el.style.backgroundImage = `url('data:image/jpeg;base64,${d.foto}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.innerHTML = '';
    }
  }

  // Dados pessoais
  setText('nomeWallet', d.nome);
  setText('dataWallet', formatDate(d.data_nascimento));
  const sexoMap = { M: 'Masculino', F: 'Feminino', NB: 'Não Binário' };
  setText('sexoWallet', sexoMap[d.sexo] || d.sexo);
  setText('cpfWallet', formatCPF(d.cpf));
  setText('rgWallet', formatRG(d.rg));
  setText('cidadeWallet', d.cidade && d.estado ? `${d.cidade} / ${d.estado}` : (d.cidade || '—'));
  setText('acompanhanteWallet', d.acompanhante ? 'Sim' : 'Não');

  // Deficiência
  setText('tipoDefWallet', d.tipo_deficiencia || '—');
  setText('grauDefWallet', d.grau_deficiencia || '—');
  const cidUpper = (d.cid || '').toUpperCase();
  const baseCode = cidUpper.split('.')[0];
  const cidLabel = cidUpper ? `${cidUpper} — ${validCIDs[baseCode] || validCIDs[cidUpper] || 'Ver laudo'}` : '—';
  setText('cidWallet', cidLabel);
  setText('comunicacaoWallet', d.comunicacao || 'Nenhuma');

  // Laudo
  setText('laudoWallet', d.numero_laudo || '—');
  setText('dataLaudoWallet', formatDate(d.data_laudo));
  setText('medicoWallet', d.nome_medico || '—');
  setText('crmWallet', d.crm_medico || '—');

  // Rodapé oficial
  setText('dataEmissao', formatDate(d.data_emissao));
  setText('dataValidade', formatDate(d.validade));
  setText('numeroCarteira', d.numero_carteira);
  setText('codigoVerificacao', d.codigo_verificacao);

  // Gerar QR Code
  generateQRCode(d);
}

function generateQRCode(d) {
  const container = document.getElementById('qrcodeWallet');
  if (!container) {
    console.log('[v0] Container QR Code nao encontrado');
    return;
  }
  container.innerHTML = '';

  // Dados essenciais para o QR Code (sem a foto para reduzir tamanho)
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
    cv: d.codigoVerificacao,
    ft: d.foto ? d.foto.substring(0, 100) + '...' : '' // Apenas referencia
  };

  // Codifica em base64 compactado
  const jsonStr = JSON.stringify(payload);
  const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
  
  // URL da pagina de verificacao
  const baseUrl = window.location.origin + window.location.pathname.replace('carteira.html', '');
  const verifyURL = `${baseUrl}verificar.html?code=${d.codigo_verificacao}`;

  console.log('[v0] QR Code URL:', verifyURL);

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
document.getElementById('suporteBtn')?.addEventListener('click', () => {
  alert('Conectando ao suporte... Em breve você será atendido por um de nossos especialistas.');
});

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

document.addEventListener('DOMContentLoaded', loadWalletData);
