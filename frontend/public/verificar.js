// GO Card PCD — verificar.js
// Lê os dados da URL (QR Code) e renderiza a carteira completa

const API_BASE = 'http://localhost:3000/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

async function verifyCard(code) {
  return apiRequest(`/cards/verify/${code}`);
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
  "J44":"DPOC","P96":"Deficiência Múltipla"
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('pt-BR');
}

function formatCPF(v) {
  if (!v) return '—';
  const n = v.replace(/\D/g,'');
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '—';
}

function checkExpiry(validadeISO) {
  if (!validadeISO) return;
  const validade = new Date(validadeISO);
  const hoje = new Date();
  const banner = document.getElementById('verificacaoBanner');
  if (!banner) return;

  if (validade < hoje) {
    banner.classList.remove('vb-valid');
    banner.classList.add('vb-expired');
    banner.querySelector('h2').textContent = 'Documento Expirado';
    banner.querySelector('p').textContent = 'Esta carteira está vencida. O titular deve renovar o documento.';
    banner.querySelector('.vb-stamp').textContent = 'EXPIRADO';
  }
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (!code) {
    showError('Nenhum código de verificação encontrado na URL.');
    return;
  }

  verifyCard(code).then(data => {
    renderCard(data);
  }).catch(error => {
    console.error('Erro na verificação:', error);
    showError('Erro na verificação: ' + error.message);
  });
}

function showError(msg) {
  const banner = document.getElementById('verificacaoBanner');
  if (banner) {
    banner.classList.add('vb-expired');
    banner.querySelector('h2').textContent = 'Erro na Verificação';
    banner.querySelector('p').textContent = msg;
    banner.querySelector('.vb-stamp').textContent = 'INVÁLIDO';
  }
}

function renderCard(d) {
  // Foto
  if (d.foto) {
    const el = document.getElementById('fotoWallet');
    if (el) {
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
  setText('rgWallet', d.rg || '—');
  setText('cidadeWallet', d.cidade && d.estado ? `${d.cidade} / ${d.estado}` : (d.cidade || '—'));
  setText('acompanhanteWallet', d.acompanhante ? 'Sim' : 'Não');

  // Deficiência
  setText('tipoDefWallet', d.tipo_deficiencia || '—');
  setText('grauDefWallet', d.grau_deficiencia || '—');
  const cidUpper = (d.cid || '').toUpperCase();
  const cidLabel = cidUpper ? `${cidUpper} — ${validCIDs[cidUpper] || 'Ver laudo'}` : '—';
  setText('cidWallet', cidLabel);
  setText('comunicacaoWallet', d.comunicacao || 'Nenhuma');

  // Laudo
  setText('laudoWallet', d.numero_laudo || '—');
  setText('dataLaudoWallet', formatDate(d.data_laudo));
  setText('medicoWallet', d.nome_medico || '—');
  setText('crmWallet', d.crm_medico || '—');

  // Rodapé
  setText('dataEmissao', formatDate(d.data_emissao));
  setText('dataValidade', formatDate(d.validade));
  setText('numeroCarteira', d.numero_carteira);
  setText('codigoVerificacao', d.codigo_verificacao);

  // Emergência
  setText('tipoSanguineoDisplay', d.tipoSanguineo || 'Não informado');
  setText('contatoDisplay', d.contatoEmergencia || 'Não informado');
  setText('alergiasDisplay', d.alergias || 'Nenhuma informada');
  setText('medicacoesDisplay', d.medicacoes || 'Nenhuma informada');
  setText('comunicacaoDisplay', d.comunicacao || 'Nenhuma necessidade especial');
  setText('acompanhanteDisplay', d.necessitaAcompanhante || '—');

  // Verifica validade
  checkExpiry(d.validade);
}

// Baixar PNG
document.getElementById('downloadBtn')?.addEventListener('click', async () => {
  const card = document.getElementById('walletCard');
  if (!card) return;
  try {
    const canvas = await html2canvas(card, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `carteira-go-card-verificada-${Date.now()}.png`;
    link.click();
  } catch (e) {
    alert('Erro ao baixar. Tente novamente.');
  }
});

document.getElementById('printBtn')?.addEventListener('click', () => window.print());

document.addEventListener('DOMContentLoaded', loadFromURL);
