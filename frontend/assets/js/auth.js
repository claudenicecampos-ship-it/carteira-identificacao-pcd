// Configuracoes globais
const STORAGE_KEYS = {
    TOKEN: 'carteira_token',
    REFRESH_TOKEN: 'carteira_refresh_token',
    USER: 'carteira_user',
    USERS_DB: 'carteira_users_db'
};

/**
 * Gera um token simples para simulacao local
 */
function gerarTokenLocal() {
    return 'local_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Obtem o banco de usuarios local
 */
function obterUsuariosDB() {
    const db = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    return db ? JSON.parse(db) : [];
}

/**
 * Salva o banco de usuarios local
 */
function salvarUsuariosDB(usuarios) {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usuarios));
}

/**
 * Exibe toast com mensagem
 */
function mostrarToast(mensagem, tipo = 'info', duracao = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duracao);
}

const API_BASE_URL = 'http://localhost:3000';

/**
 * Faz requisicao para o backend (API)
 */
async function fazerRequisicao(endpoint, metodo = 'GET', dados = null) {
    const url = `${API_BASE_URL}/api${endpoint}`;

    let resposta;
    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        resposta = await fetch(url, {
            method: metodo,
            headers,
            body: dados ? JSON.stringify(dados) : null
        });
    } catch (erro) {
        throw new Error(`Falha de requisição (network): ${erro.message}. URL: ${url}`);
    }

    const corpoTexto = await resposta.text();

    let json;
    try {
        json = corpoTexto ? JSON.parse(corpoTexto) : null;
    } catch (e) {
        throw new Error(`Resposta inválida do servidor (não JSON): ${corpoTexto || 'sem conteúdo'}. Status: ${resposta.status}`);
    }

    if (!resposta.ok) {
        const mensagem = json?.mensagem || `Erro ${resposta.status}: ${corpoTexto}`;
        throw new Error(mensagem);
    }

    if (!json?.sucesso) {
        const mensagem = json?.mensagem || 'Erro inesperado';
        throw new Error(`${mensagem} (status ${resposta.status})`);
    }

    return json;
}

/**
 * Salva dados de autenticação
 */
function salvarAutenticacao(token, refreshToken, usuario) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(usuario));
}

/**
 * Remove dados de autenticação
 */
function removerAutenticacao() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
}

/**
 * Obtém usuário do localStorage
 */
function obterUsuario() {
    const usuario = localStorage.getItem(STORAGE_KEYS.USER);
    return usuario ? JSON.parse(usuario) : null;
}

/**
 * Verifica se usuário está autenticado
 */
function estaAutenticado() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) !== null;
}

/**
 * Alterna visibilidade da senha
 */
function togglePassword(id) {
    const input = document.getElementById(id);
    const tipo = input.type === 'password' ? 'text' : 'password';
    input.type = tipo;
}

/**
 * Formata CPF para display
 */
function formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove formatação de CPF
 */
function removerFormatacaoCPF(cpf) {
    return cpf.replace(/\D/g, '');
}

/**
 * Valida força da senha no frontend
 */
function validarSenha(senha) {
    const requisitos = {
        minimo: senha.length >= 8,
        maiuscula: /[A-Z]/.test(senha),
        minuscula: /[a-z]/.test(senha),
        numero: /\d/.test(senha),
        especial: /[@$!%*?&]/.test(senha)
    };

    return Object.values(requisitos).every(r => r);
}

/**
 * Calcula força da senha
 */
function calcularForcaSenha(senha) {
    let forca = 0;

    if (senha.length >= 8) forca++;
    if (senha.length >= 12) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[a-z]/.test(senha)) forca++;
    if (/\d/.test(senha)) forca++;
    if (/[@$!%*?&]/.test(senha)) forca++;

    if (forca <= 2) return { forca: 'weak', cor: '#f44336' };
    if (forca <= 4) return { forca: 'medium', cor: '#ff9800' };
    return { forca: 'strong', cor: '#4CAF50' };
}

/**
 * Atualiza indicador de força da senha
 */
function atualizarForcaSenha(senhaId, containerID = 'passwordStrength') {
    const input = document.getElementById(senhaId);
    const container = document.getElementById(containerID);
    
    if (!input || !container) return;

    const forca = calcularForcaSenha(input.value);
    container.className = `password-strength ${forca.forca}`;

    // Atualizar requisitos visuais se na página de cadastro/recuperação
    const req1 = document.getElementById('req1');
    if (req1) {
        document.getElementById('req1').classList.toggle('valid', input.value.length >= 8);
        document.getElementById('req2').classList.toggle('valid', /[A-Z]/.test(input.value));
        document.getElementById('req3').classList.toggle('valid', /[a-z]/.test(input.value));
        document.getElementById('req4').classList.toggle('valid', /\d/.test(input.value));
        document.getElementById('req5').classList.toggle('valid', /[@$!%*?&]/.test(input.value));
    }
}

/**
 * Valida email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Limpa erros do formulário
 */
function limparErros() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

/**
 * Limpa erro de um campo específico
 */
function limparErrosCampo(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = '';
    }
}

/**
 * Mostra erro em um campo
 */
function mostrarErro(fieldId, mensagem) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = mensagem;
    }
}

/**
 * Desabilita botão e mostra spinner
 */
function desabilitarBotao(botaoId) {
    const botao = document.getElementById(botaoId);
    if (botao) {
        botao.disabled = true;
        const spinner = botao.querySelector('.spinner');
        if (spinner) {
            spinner.classList.add('active');
        }
    }
}

/**
 * Habilita botão e esconde spinner
 */
function habilitarBotao(botaoId) {
    const botao = document.getElementById(botaoId);
    if (botao) {
        botao.disabled = false;
        const spinner = botao.querySelector('.spinner');
        if (spinner) {
            spinner.classList.remove('active');
        }
    }
}
