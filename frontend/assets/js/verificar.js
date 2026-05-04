// GO Card PCD — verificar.js
// Lê os dados da URL (QR Code) e renderiza a carteira completa

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

function buildStaticUrl(filePath) {
  if (!filePath) return null;
  if (/^(https?:)?\/\//.test(filePath)) return filePath;
  if (filePath.startsWith('/')) return filePath;
  if (filePath.startsWith('imgs/') || filePath.startsWith('laudos/')) {
    return '/' + filePath;
  }
  return filePath;
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
  const encoded = params.get('d');

  if (!encoded) {
    // Fallback: tenta localStorage (quando aberto diretamente)
    const raw = localStorage.getItem('userRegistration');
    if (raw) {
      renderCard(JSON.parse(raw));
      return;
    }
    showError('Nenhum dado encontrado. QR Code inválido ou expirado.');
    return;
  }

  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(json);
    renderCard(data);
  } catch (e) {
    showError('Erro ao ler os dados do QR Code. O código pode estar danificado.');
  }
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
  const fotoUrl = buildStaticUrl(d.foto);
  const fotoEl = document.getElementById('fotoWallet');
  if (fotoEl) {
    if (fotoUrl) {
      fotoEl.src = fotoUrl;
    } else {
      fotoEl.removeAttribute('src');
    }
  }

  // Dados pessoais
  setText('nomeWallet', d.nome);
  setText('dataWallet', formatDate(d.dataNascimento));
  const sexoMap = { M: 'Masculino', F: 'Feminino', NB: 'Não Binário' };
  setText('sexoWallet', sexoMap[d.sexo] || d.sexo);
  setText('cpfWallet', formatCPF(d.cpf));
  setText('rgWallet', d.rg || '—');
  setText('cidadeWallet', d.cidade && d.estado ? `${d.cidade} / ${d.estado}` : (d.cidade || '—'));
  setText('acompanhanteWallet', d.necessitaAcompanhante || '—');

  // Deficiência
  setText('tipoDefWallet', d.tipoDeficiencia || '—');
  setText('grauDefWallet', d.grauDeficiencia || '—');
  const cidUpper = (d.cid || '').toUpperCase();
  const cidLabel = cidUpper ? `${cidUpper} — ${validCIDs[cidUpper] || 'Ver laudo'}` : '—';
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

  // Rodapé
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
