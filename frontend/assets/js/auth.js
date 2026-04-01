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

/**
 * Simula requisicao de forma local (sem backend)
 */
async function fazerRequisicao(endpoint, metodo = 'GET', dados = null) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Registrar novo usuario
    if (endpoint === '/auth/registrar' && metodo === 'POST') {
        const usuarios = obterUsuariosDB();
        
        // Verificar se email ja existe
        if (usuarios.find(u => u.email === dados.email)) {
            throw new Error('Este email ja esta cadastrado');
        }
        
        // Verificar se CPF ja existe
        if (usuarios.find(u => u.cpf === dados.cpf)) {
            throw new Error('Este CPF ja esta cadastrado');
        }
        
        // Criar novo usuario
        const novoUsuario = {
            id: Date.now(),
            nome: dados.nome,
            email: dados.email,
            cpf: dados.cpf,
            telefone: dados.telefone,
            data_nascimento: dados.data_nascimento,
            senha: dados.senha, // Em producao seria hash
            criadoEm: new Date().toISOString()
        };
        
        usuarios.push(novoUsuario);
        salvarUsuariosDB(usuarios);
        
        const token = gerarTokenLocal();
        const refreshToken = gerarTokenLocal();
        
        return {
            sucesso: true,
            data: {
                token: token,
                refreshToken: refreshToken,
                usuario: {
                    id: novoUsuario.id,
                    nome: novoUsuario.nome,
                    email: novoUsuario.email,
                    cpf: novoUsuario.cpf
                }
            }
        };
    }
    
    // Login
    if (endpoint === '/auth/login' && metodo === 'POST') {
        const usuarios = obterUsuariosDB();
        const usuario = usuarios.find(u => u.email === dados.email && u.senha === dados.senha);
        
        if (!usuario) {
            throw new Error('Email ou senha incorretos');
        }
        
        const token = gerarTokenLocal();
        const refreshToken = gerarTokenLocal();
        
        return {
            sucesso: true,
            data: {
                token: token,
                refreshToken: refreshToken,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    cpf: usuario.cpf
                }
            }
        };
    }
    
    throw new Error('Endpoint nao implementado no modo local');
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
