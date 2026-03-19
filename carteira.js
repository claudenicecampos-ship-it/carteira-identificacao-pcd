// GO Card PCD - Sistema da Carteira Digital
// Database de CIDs
const validCIDs = {
  "6A02": "Transtorno do Espectro Autista",
  "A00": "Sem Deficiencia",
  "A01": "Deficiencia Auditiva",
  "A15": "Deficiencia Fisica",
  "B99": "Deficiencia Auditiva",
  "C00": "Deficiencia Fisica",
  "C50": "Deficiencia Fisica",
  "D89": "Deficiencia Auditiva",
  "E10": "Deficiencia Fisica",
  "E11": "Deficiencia Fisica",
  "E89": "Deficiencia Fisica",
  "F01": "Deficiencia Intelectual",
  "F10": "Deficiencia Intelectual",
  "F20": "Deficiencia Intelectual",
  "F32": "Deficiencia Intelectual",
  "F41": "Deficiencia Intelectual",
  "F60": "Deficiencia Intelectual",
  "F70": "Deficiencia Intelectual Leve",
  "F71": "Deficiencia Intelectual Moderada",
  "F72": "Deficiencia Intelectual Grave",
  "F73": "Deficiencia Intelectual Profunda",
  "F78": "Deficiencia Intelectual",
  "F79": "Deficiencia Intelectual",
  "F84": "Transtorno Global do Desenvolvimento",
  "F88": "Deficiencia Intelectual",
  "F89": "Deficiencia Intelectual",
  "F99": "Deficiencia Intelectual",
  "G06": "Deficiencia Fisica",
  "G11": "Deficiencia Fisica",
  "G20": "Doenca de Parkinson",
  "G80": "Paralisia Cerebral",
  "G82": "Paraplegia/Tetraplegia",
  "G89": "Deficiencia Fisica",
  "G99": "Deficiencia Fisica",
  "H00": "Deficiencia Visual",
  "H04": "Deficiencia Visual",
  "H10": "Deficiencia Visual",
  "H20": "Deficiencia Visual",
  "H25": "Catarata",
  "H26": "Deficiencia Visual",
  "H28": "Deficiencia Visual",
  "H30": "Deficiencia Visual",
  "H33": "Deficiencia Visual",
  "H34": "Deficiencia Visual",
  "H35": "Deficiencia Visual",
  "H36": "Deficiencia Visual",
  "H40": "Glaucoma",
  "H42": "Deficiencia Visual",
  "H43": "Deficiencia Visual",
  "H44": "Deficiencia Visual",
  "H46": "Deficiencia Visual",
  "H47": "Deficiencia Visual",
  "H48": "Deficiencia Visual",
  "H49": "Deficiencia Visual",
  "H50": "Deficiencia Visual",
  "H51": "Deficiencia Visual",
  "H52": "Deficiencia Visual",
  "H53": "Deficiencia Visual",
  "H54": "Cegueira/Baixa Visao",
  "H55": "Deficiencia Visual",
  "H57": "Deficiencia Visual",
  "H59": "Deficiencia Visual",
  "H60": "Deficiencia Auditiva",
  "H66": "Deficiencia Auditiva",
  "H71": "Deficiencia Auditiva",
  "H72": "Deficiencia Auditiva",
  "H73": "Deficiencia Auditiva",
  "H74": "Deficiencia Auditiva",
  "H75": "Deficiencia Auditiva",
  "H80": "Deficiencia Auditiva",
  "H81": "Deficiencia Auditiva",
  "H83": "Deficiencia Auditiva",
  "H90": "Surdez",
  "H91": "Perda Auditiva",
  "H92": "Deficiencia Auditiva",
  "H93": "Deficiencia Auditiva",
  "H95": "Deficiencia Auditiva",
  "I10": "Deficiencia Fisica",
  "I50": "Deficiencia Fisica",
  "I63": "AVC",
  "I69": "Deficiencia Fisica",
  "I99": "Deficiencia Fisica",
  "J43": "Deficiencia Fisica",
  "J44": "DPOC",
  "J45": "Deficiencia Fisica",
  "J99": "Deficiencia Fisica",
  "K95": "Deficiencia Fisica",
  "L99": "Deficiencia Fisica",
  "M06": "Artrite Reumatoide",
  "M17": "Deficiencia Fisica",
  "M19": "Deficiencia Fisica",
  "M35": "Deficiencia Fisica",
  "M99": "Deficiencia Fisica",
  "N18": "Doenca Renal Cronica",
  "N99": "Deficiencia Fisica",
  "O99": "Sem Deficiencia",
  "P96": "Deficiencia Multipla",
  "Q05": "Espinha Bifida",
  "Q10": "Deficiencia Visual",
  "Q30": "Deficiencia Auditiva",
  "Q99": "Deficiencia Intelectual",
  "R99": "A Classificar",
  "T88": "Deficiencia Fisica",
  "Y89": "Deficiencia Fisica",
  "Z99": "Dependencia de Equipamentos"
};

// Funcao para formatar data
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

// Funcao para formatar CPF
function formatCPF(cpf) {
  if (!cpf) return '-';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Gerar numero de carteira
function generateCardNumber() {
  return 'GC' + Date.now().toString().slice(-8);
}

// Carregar dados da carteira
function loadWalletData() {
  const userDataStr = localStorage.getItem('userRegistration');

  if (!userDataStr) {
    alert('Nenhum cadastro encontrado. Redirecionando para o formulario...');
    window.location.href = 'index.html';
    return;
  }

  const userData = JSON.parse(userDataStr);

  // Preencher dados principais
  document.getElementById('nomeWallet').textContent = userData.nome || '-';
  
  // Formatar data de nascimento
  const dataNasc = userData.dataNascimento ? formatDate(userData.dataNascimento + 'T00:00:00') : '-';
  document.getElementById('dataWallet').textContent = dataNasc;

  // CPF formatado
  document.getElementById('cpfWallet').textContent = formatCPF(userData.cpf);

  // CID e Deficiencia
  const cidUpper = (userData.cid || '').toUpperCase();
  document.getElementById('cidWallet').textContent = cidUpper || '-';
  
  const deficiencia = validCIDs[cidUpper] || 'Nao especificada';
  document.getElementById('deficienciaWallet').textContent = deficiencia;

  // Cidade
  document.getElementById('cidadeWallet').textContent = userData.cidade || '-';

  // Carregar foto
  if (userData.foto) {
    document.getElementById('fotoWallet').style.backgroundImage = `url('${userData.foto}')`;
  }

  // Datas de emissao e validade
  const dataEmissao = userData.dataEmissao ? formatDate(userData.dataEmissao) : formatDate(new Date().toISOString());
  document.getElementById('dataEmissao').textContent = dataEmissao;

  const validade = userData.validade ? formatDate(userData.validade) : formatDate(new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString());
  document.getElementById('dataValidade').textContent = validade;

  // Numero da carteira
  const numeroCarteira = userData.numeroCarteira || generateCardNumber();
  document.getElementById('numeroCarteira').textContent = numeroCarteira;

  // Atualizar no localStorage se necessario
  if (!userData.numeroCarteira || !userData.dataEmissao || !userData.validade) {
    userData.numeroCarteira = numeroCarteira;
    userData.dataEmissao = userData.dataEmissao || new Date().toISOString();
    userData.validade = userData.validade || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('userRegistration', JSON.stringify(userData));
  }

  // Informacoes de emergencia
  document.getElementById('tipoSanguineoDisplay').textContent = userData.tipoSanguineo || 'Nao informado';
  document.getElementById('contatoDisplay').textContent = userData.contatoEmergencia || 'Nao informado';
  document.getElementById('alergiasDisplay').textContent = userData.alergias || 'Nenhuma informada';
  document.getElementById('medicacoesDisplay').textContent = userData.medicacoes || 'Nenhuma informada';

  // Gerar QR Code
  generateQRCode(userData);
}

// Gerar QR Code dinamico
function generateQRCode(userData) {
  const qrcodeContainer = document.getElementById('qrcodeWallet');
  qrcodeContainer.innerHTML = '';

  // Dados para o QR Code (informacoes vitais)
  const qrData = {
    nome: userData.nome,
    cpf: userData.cpf,
    cid: userData.cid,
    deficiencia: validCIDs[userData.cid?.toUpperCase()] || 'Nao especificada',
    tipoSanguineo: userData.tipoSanguineo || 'N/I',
    alergias: userData.alergias || 'Nenhuma',
    medicacoes: userData.medicacoes || 'Nenhuma',
    contatoEmergencia: userData.contatoEmergencia || 'N/I',
    numeroCarteira: userData.numeroCarteira,
    validade: userData.validade
  };

  // URL de verificacao ou dados JSON
  const qrContent = JSON.stringify(qrData);

  try {
    new QRCode(qrcodeContainer, {
      text: qrContent,
      width: 140,
      height: 140,
      colorDark: '#1e3a5f',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    qrcodeContainer.innerHTML = '<p style="color: #999; font-size: 12px;">QR Code</p>';
  }
}

// Botao Imprimir
document.getElementById('printBtn')?.addEventListener('click', () => {
  window.print();
});

// Botao Baixar PNG
document.getElementById('downloadBtn')?.addEventListener('click', async () => {
  const walletCard = document.getElementById('walletCard');

  try {
    const canvas = await html2canvas(walletCard, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `carteira-go-card-${Date.now()}.png`;
    link.click();
  } catch (error) {
    console.error('Erro ao baixar:', error);
    alert('Erro ao baixar a carteira. Tente novamente.');
  }
});

// ==================== MODAIS ====================
const guiaLegalModal = document.getElementById('guiaLegalModal');
const denunciaModal = document.getElementById('denunciaModal');

// Guia Legal
document.getElementById('guiaLegalBtn')?.addEventListener('click', () => {
  guiaLegalModal?.classList.remove('hidden');
});

document.getElementById('closeGuiaLegal')?.addEventListener('click', () => {
  guiaLegalModal?.classList.add('hidden');
});

// Denuncia
document.getElementById('denunciaBtn')?.addEventListener('click', () => {
  denunciaModal?.classList.remove('hidden');
});

document.getElementById('closeDenuncia')?.addEventListener('click', () => {
  denunciaModal?.classList.add('hidden');
});

// Suporte
document.getElementById('suporteBtn')?.addEventListener('click', () => {
  alert('Conectando ao suporte... Em breve voce sera atendido por um de nossos especialistas.');
});

// Fechar modais ao clicar fora
guiaLegalModal?.addEventListener('click', (e) => {
  if (e.target === guiaLegalModal) {
    guiaLegalModal.classList.add('hidden');
  }
});

denunciaModal?.addEventListener('click', (e) => {
  if (e.target === denunciaModal) {
    denunciaModal.classList.add('hidden');
  }
});

// Formulario de Denuncia
document.getElementById('denunciaForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const local = document.getElementById('localDenuncia').value;
  const tipo = document.getElementById('tipoDenuncia').value;
  const descricao = document.getElementById('descricaoDenuncia').value;
  
  // Gerar protocolo
  const protocolo = 'DEN' + Date.now().toString().slice(-10);
  
  // Simular envio
  alert(`Denuncia registrada com sucesso!\n\nProtocolo: ${protocolo}\n\nSua denuncia sera encaminhada aos orgaos competentes. Voce recebera atualizacoes sobre o andamento.`);
  
  denunciaModal?.classList.add('hidden');
  e.target.reset();
});

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
  loadWalletData();
});
