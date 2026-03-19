// GO Card PCD - Sistema de Cadastro
// CID Validator - Database de códigos válidos
const validCIDs = {
  "6A02": "Autismo",
  A00: "Sem Deficiência",
  A01: "Deficiência Auditiva",
  A15: "Deficiência Física",
  B99: "Deficiência Auditiva",
  C00: "Deficiência Física",
  C50: "Deficiência Física",
  D89: "Deficiência Auditiva",
  E10: "Deficiência Física",
  E11: "Deficiência Física",
  E89: "Deficiência Física",
  F01: "Deficiência Intelectual",
  F10: "Deficiência Intelectual",
  F20: "Deficiência Intelectual",
  F32: "Deficiência Intelectual",
  F41: "Deficiência Intelectual",
  F60: "Deficiência Intelectual",
  F70: "Deficiência Intelectual",
  F71: "Deficiência Intelectual",
  F72: "Deficiência Intelectual",
  F73: "Deficiência Intelectual",
  F78: "Deficiência Intelectual",
  F79: "Deficiência Intelectual",
  F84: "Deficiência Intelectual",
  F88: "Deficiência Intelectual",
  F89: "Deficiência Intelectual",
  F99: "Deficiência Intelectual",
  G06: "Deficiência Física",
  G11: "Deficiência Física",
  G20: "Deficiência Física",
  G80: "Deficiência Física",
  G82: "Deficiência Física",
  G89: "Deficiência Física",
  G99: "Deficiência Física",
  H00: "Deficiência Visual",
  H04: "Deficiência Visual",
  H10: "Deficiência Visual",
  H20: "Deficiência Visual",
  H25: "Deficiência Visual",
  H26: "Deficiência Visual",
  H28: "Deficiência Visual",
  H30: "Deficiência Visual",
  H33: "Deficiência Visual",
  H34: "Deficiência Visual",
  H35: "Deficiência Visual",
  H36: "Deficiência Visual",
  H40: "Deficiência Visual",
  H42: "Deficiência Visual",
  H43: "Deficiência Visual",
  H44: "Deficiência Visual",
  H46: "Deficiência Visual",
  H47: "Deficiência Visual",
  H48: "Deficiência Visual",
  H49: "Deficiência Visual",
  H50: "Deficiência Visual",
  H51: "Deficiência Visual",
  H52: "Deficiência Visual",
  H53: "Deficiência Visual",
  H54: "Deficiência Visual",
  H55: "Deficiência Visual",
  H57: "Deficiência Visual",
  H59: "Deficiência Visual",
  H60: "Deficiência Auditiva",
  H66: "Deficiência Auditiva",
  H71: "Deficiência Auditiva",
  H72: "Deficiência Auditiva",
  H73: "Deficiência Auditiva",
  H74: "Deficiência Auditiva",
  H75: "Deficiência Auditiva",
  H80: "Deficiência Auditiva",
  H81: "Deficiência Auditiva",
  H83: "Deficiência Auditiva",
  H90: "Deficiência Auditiva",
  H91: "Deficiência Auditiva",
  H92: "Deficiência Auditiva",
  H93: "Deficiência Auditiva",
  H95: "Deficiência Auditiva",
  I10: "Deficiência Física",
  I50: "Deficiência Física",
  I63: "Deficiência Física",
  I69: "Deficiência Física",
  I99: "Deficiência Física",
  J43: "Deficiência Física",
  J44: "Deficiência Física",
  J45: "Deficiência Física",
  J99: "Deficiência Física",
  K95: "Deficiência Física",
  L99: "Deficiência Física",
  M06: "Deficiência Física",
  M17: "Deficiência Física",
  M19: "Deficiência Física",
  M35: "Deficiência Física",
  M99: "Deficiência Física",
  N18: "Deficiência Física",
  N99: "Deficiência Física",
  O99: "Sem Deficiência",
  P96: "Deficiência Múltipla",
  Q05: "Deficiência Física",
  Q10: "Deficiência Visual",
  Q30: "Deficiência Auditiva",
  Q99: "Deficiência Intelectual",
  R99: "A Classificar",
  T88: "Deficiência Física",
  Y89: "Deficiência Física",
  Z99: "Sem Deficiência",
};

// Respostas do Chatbot
const chatbotResponses = {
  cadastro: "Para realizar o cadastro, preencha todos os campos do formulário. Você precisará de uma foto, dados pessoais e o código CID do seu laudo médico. Se precisar de ajuda com algum campo específico, me diga qual!",
  cid: "O CID (Classificação Internacional de Doenças) é um código que identifica sua condição de saúde. Você encontra esse código no seu laudo médico. Exemplos: F84 para TEA, H90 para deficiência auditiva.",
  direitos: "Com a Carteira GO Card você tem direito a: fila prioritária, isenção de taxas em alguns casos, acompanhante em hospitais, entre outros. Na Central de Direitos você encontra a lista completa!",
  ajuda: "Estou aqui para ajudar! Posso esclarecer dúvidas sobre: cadastro, CID, direitos da PCD, renovação da carteira ou problemas técnicos. Sobre o que deseja saber?",
  laudo: "Se seu laudo foi negado, nossa equipe de Assistência Social pode ajudar você a entender o motivo e orientar como obter o laudo correto. Deseja que eu conecte você a um atendente?",
  renovacao: "A carteira GO Card tem validade de 5 anos. Você receberá notificações quando estiver próximo do vencimento. A renovação pode ser feita aqui mesmo no sistema!",
  default: "Entendi! Vou verificar como posso ajudar com isso. Se a resposta não resolver sua dúvida, posso conectar você a um atendente humano. Deseja falar com alguém da equipe?"
};

// Elementos do DOM
const form = document.getElementById("registrationForm");
const formFields = {
  foto: {
    input: document.getElementById("foto-input"),
    error: document.getElementById("fotoError"),
    preview: document.getElementById("fotoPreview"),
  },
  nome: {
    input: document.getElementById("nome"),
    error: document.getElementById("nomeError"),
    check: document.getElementById("nomeCheck"),
  },
  dataNascimento: {
    input: document.getElementById("dataNascimento"),
    error: document.getElementById("dataError"),
    check: document.getElementById("dataCheck"),
  },
  cpf: {
    input: document.getElementById("cpf"),
    error: document.getElementById("cpfError"),
    check: document.getElementById("cpfCheck"),
  },
  cid: {
    input: document.getElementById("cid"),
    error: document.getElementById("cidError"),
    check: document.getElementById("cidCheck"),
  },
  cidade: {
    input: document.getElementById("cidade"),
    error: document.getElementById("cidadeError"),
    check: document.getElementById("cidadeCheck"),
  },
};

const submitBtn = document.getElementById("submitBtn");

// Validadores
function isValidName(name) {
  return name.trim().length >= 3 && /^[a-záéíóúàâêôãõçñ\s]+$/i.test(name);
}

function isValidBirthDate(date) {
  if (!date) return false;
  const birthDate = new Date(date + "T00:00:00");
  return birthDate < new Date();
}

function isValidCPF(cpf) {
  return cpf.trim().length === 11 && /^\d+$/.test(cpf);
}

function isValidCID(cid) {
  const upperCID = cid.toUpperCase().trim();
  return validCIDs.hasOwnProperty(upperCID);
}

function isValidCity(city) {
  return city.trim().length >= 2 && /^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇÑ\s-]+$/i.test(city);
}

// Atualizar validação nos inputs
if (formFields.nome.input) {
  formFields.nome.input.addEventListener("input", (e) => {
    const isValid = isValidName(e.target.value);
    updateFieldValidation("nome", isValid, e.target.value);
  });
}

if (formFields.dataNascimento.input) {
  formFields.dataNascimento.input.addEventListener("input", (e) => {
    const isValid = isValidBirthDate(e.target.value);
    updateFieldValidation("dataNascimento", isValid, e.target.value);
  });
}

if (formFields.cpf.input) {
  formFields.cpf.input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11);
    const isValid = isValidCPF(e.target.value);
    updateFieldValidation("cpf", isValid, e.target.value);
  });
}

if (formFields.cid.input) {
  formFields.cid.input.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
    const isValid = isValidCID(e.target.value);
    updateFieldValidation("cid", isValid, e.target.value);
  });
}

if (formFields.cidade.input) {
  formFields.cidade.input.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase();
    const isValid = isValidCity(e.target.value);
    updateFieldValidation("cidade", isValid, e.target.value);
  });
}

// Upload de foto
if (formFields.foto.input) {
  formFields.foto.input.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        formFields.foto.preview.style.backgroundImage = `url('${reader.result}')`;
        formFields.foto.preview.classList.add("has-image");
        checkFormValidity();
      };
      reader.readAsDataURL(file);
    }
  });
}

function updateFieldValidation(fieldName, isValid, value) {
  const field = formFields[fieldName];
  if (!field) return;

  if (value === "" || value === undefined) {
    field.input.classList.remove("valid");
    if (field.error) {
      field.error.textContent = "";
      field.error.classList.remove("show");
    }
    checkFormValidity();
    return;
  }

  if (isValid) {
    field.input.classList.add("valid");
    if (field.error) {
      field.error.textContent = "";
      field.error.classList.remove("show");
    }
  } else {
    field.input.classList.remove("valid");
    if (field.error) {
      field.error.classList.add("show");

      // Mensagens de erro
      switch (fieldName) {
        case "nome":
          field.error.textContent = "Nome deve ter pelo menos 3 caracteres e conter apenas letras";
          break;
        case "dataNascimento":
          field.error.textContent = "Data de nascimento inválida";
          break;
        case "cpf":
          field.error.textContent = "CPF deve ter 11 dígitos";
          break;
        case "cid":
          field.error.textContent = "CID inválido (Ex: A00, H90, 6A02)";
          break;
        case "cidade":
          field.error.textContent = "Cidade deve conter apenas letras";
          break;
      }
    }
  }

  checkFormValidity();
}

function checkFormValidity() {
  if (!submitBtn) return;

  const allValid =
    isValidName(formFields.nome?.input?.value || "") &&
    isValidBirthDate(formFields.dataNascimento?.input?.value || "") &&
    isValidCPF(formFields.cpf?.input?.value || "") &&
    isValidCID(formFields.cid?.input?.value || "") &&
    isValidCity(formFields.cidade?.input?.value || "") &&
    formFields.foto?.preview?.style.backgroundImage !== "";

  submitBtn.disabled = !allValid;
}

// Submissão do formulário
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const tipoSanguineo = document.getElementById("tipoSanguineo")?.value || "";
    const alergias = document.getElementById("alergias")?.value || "";
    const medicacoes = document.getElementById("medicacoes")?.value || "";
    const contatoEmergencia = document.getElementById("contatoEmergencia")?.value || "";

    const formData = {
      nome: formFields.nome.input.value,
      dataNascimento: formFields.dataNascimento.input.value,
      cpf: formFields.cpf.input.value,
      cid: formFields.cid.input.value.toUpperCase(),
      cidade: formFields.cidade.input.value.toUpperCase(),
      foto: formFields.foto.preview.style.backgroundImage.slice(5, -2),
      // Informações de Emergência (QR Code Dinâmico)
      tipoSanguineo: tipoSanguineo,
      alergias: alergias,
      medicacoes: medicacoes,
      contatoEmergencia: contatoEmergencia,
      // Metadados
      dataEmissao: new Date().toISOString(),
      validade: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 5 anos
    };

    localStorage.setItem("userRegistration", JSON.stringify(formData));

    // Redirecionar para carteira
    window.location.href = "carteira.html";
  });
}

// ==================== CHATBOT ====================
const chatbotModal = document.getElementById("chatbotModal");
const chatbotBtn = document.getElementById("chatbotBtn");
const closeChatbot = document.getElementById("closeChatbot");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const chatMessages = document.getElementById("chatMessages");

if (chatbotBtn) {
  chatbotBtn.addEventListener("click", (e) => {
    e.preventDefault();
    chatbotModal.classList.remove("hidden");
  });
}

if (closeChatbot) {
  closeChatbot.addEventListener("click", () => {
    chatbotModal.classList.add("hidden");
  });
}

if (chatbotModal) {
  chatbotModal.addEventListener("click", (e) => {
    if (e.target === chatbotModal) {
      chatbotModal.classList.add("hidden");
    }
  });
}

function addMessage(text, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = isUser ? "user-message" : "bot-message";
  messageDiv.innerHTML = `<p>${text}</p>`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  if (message.includes("cadastro") || message.includes("preencher") || message.includes("formulário")) {
    return chatbotResponses.cadastro;
  }
  if (message.includes("cid") || message.includes("código") || message.includes("classificação")) {
    return chatbotResponses.cid;
  }
  if (message.includes("direito") || message.includes("benefício") || message.includes("fila")) {
    return chatbotResponses.direitos;
  }
  if (message.includes("ajuda") || message.includes("help") || message.includes("como")) {
    return chatbotResponses.ajuda;
  }
  if (message.includes("laudo") || message.includes("negado") || message.includes("recusado")) {
    return chatbotResponses.laudo;
  }
  if (message.includes("renovar") || message.includes("renovação") || message.includes("validade")) {
    return chatbotResponses.renovacao;
  }
  
  return chatbotResponses.default;
}

function handleChatSubmit() {
  const message = chatInput.value.trim();
  if (!message) return;
  
  addMessage(message, true);
  chatInput.value = "";
  
  // Simular delay de resposta
  setTimeout(() => {
    const response = getBotResponse(message);
    addMessage(response);
  }, 800);
}

if (sendChat) {
  sendChat.addEventListener("click", handleChatSubmit);
}

if (chatInput) {
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleChatSubmit();
    }
  });
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  console.log("[GO Card] Sistema inicializado");
  checkFormValidity();
});
