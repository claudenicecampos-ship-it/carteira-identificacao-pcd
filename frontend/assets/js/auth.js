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

const POSSIBLE_BACKEND_PORTS = [3001, 3005, 3006, 3007, 3008, 3009];
const BACKEND_HOST = 'localhost';
let API_BASE_URL = `http://${BACKEND_HOST}:${POSSIBLE_BACKEND_PORTS[0]}`;
let backendResolved = false;

async function resolveApiBaseUrl() {
    if (backendResolved && API_BASE_URL) {
        return API_BASE_URL;
    }

    for (const port of POSSIBLE_BACKEND_PORTS) {
        const origin = `http://${BACKEND_HOST}:${port}`;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const resposta = await fetch(`${origin}/health`, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (resposta.ok) {
                API_BASE_URL = origin;
                backendResolved = true;
                return origin;
            }
        } catch (erro) {
            // continua para a próxima porta
        }
    }

    API_BASE_URL = `http://${BACKEND_HOST}:${POSSIBLE_BACKEND_PORTS[0]}`;
    backendResolved = false;
    return API_BASE_URL;
}

/**
 * Faz requisicao para o backend (API)
 */
function limparCacheCarteiraLocal() {
    localStorage.removeItem('carteira_dados');
    localStorage.removeItem('userRegistration');
    localStorage.removeItem('carteira_cadastrada');
}

async function fazerRequisicao(endpoint, metodo = 'GET', dados = null) {
    const baseUrl = await resolveApiBaseUrl();
    const url = `${baseUrl}/api${endpoint}`;
    const timeoutMs = 5000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let resposta;
    try {
        const isFormData = typeof FormData !== 'undefined' && dados instanceof FormData;
        const headers = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        resposta = await fetch(url, {
            method: metodo,
            headers,
            body: dados ? (isFormData ? dados : JSON.stringify(dados)) : null,
            signal: controller.signal
        });
    } catch (erro) {
        if (erro.name === 'AbortError') {
            throw new Error('Tempo de resposta excedido. Tente novamente.');
        }
        throw new Error(`Falha de requisição (network): ${erro.message}. URL: ${url}`);
    } finally {
        clearTimeout(timeoutId);
    }

    const corpoTexto = await resposta.text();

    let json;
    try {
        json = corpoTexto ? JSON.parse(corpoTexto) : null;
    } catch (e) {
        throw new Error(`Resposta inválida do servidor (não JSON): ${corpoTexto || 'sem conteúdo'}. Status: ${resposta.status}`);
    }

    const retryAfter = resposta.headers.get('retry-after');
    const remaining = resposta.headers.get('x-ratelimit-remaining');

    if (!resposta.ok) {
        const mensagem = json?.mensagem || `Erro ${resposta.status}: ${corpoTexto}`;
        const erro = new Error(mensagem);
        erro.status = resposta.status;
        erro.headers = {
            retryAfter: retryAfter ? parseInt(retryAfter, 10) : null,
            remaining: remaining ? parseInt(remaining, 10) : null
        };
        throw erro;
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

/**
 * Gera numero unico da carteira
 */
function gerarNumeroCarteira() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GO-PCD-${timestamp}-${random}`;
}

/**
 * Verifica se usuario ja tem carteira cadastrada
 * @param {number|string} usuarioId - ID do usuario
 * @returns {Promise<{temCarteira: boolean, carteira: object|null}>}
 */
async function verificarCarteiraExistente(usuarioId) {
    try {
        // Busca a carteira do usuário autenticado via endpoint protegido
        const resposta = await fazerRequisicao('/carteiras/minha', 'GET');
        if (resposta.sucesso && resposta.data) {
            return { temCarteira: true, carteira: resposta.data };
        }
        return { temCarteira: false, carteira: null };
    } catch (erro) {
        if (erro.status === 404) {
            limparCacheCarteiraLocal();
            return { temCarteira: false, carteira: null };
        }

        // Se backend nao disponivel, verifica localStorage
        const carteiraLocal = localStorage.getItem('carteira_dados');
        if (carteiraLocal) {
            const dados = JSON.parse(carteiraLocal);
            const usuario = obterUsuario();
            if (usuario && dados.email === usuario.email) {
                return { temCarteira: true, carteira: dados };
            }
        }
        return { temCarteira: false, carteira: null };
    }
}

async function verificarCpfCarteiraExistente(cpf) {
    const cpfLimpo = String(cpf || '').replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        throw new Error('CPF invalido');
    }

    const resposta = await fazerRequisicao(`/carteiras/verificar-cpf/${cpfLimpo}`, 'GET');
    return {
        existe: !!resposta?.data?.existe,
        carteira: resposta?.data?.carteira || null
    };
}

/**
 * Redireciona usuario baseado se tem carteira ou nao
 */
async function redirecionarUsuario() {
    const usuario = obterUsuario();
    if (!usuario) {
        window.location.href = 'index.html';
        return;
    }

    const { temCarteira, carteira } = await verificarCarteiraExistente(usuario.id || usuario.email);
    
    if (temCarteira && carteira) {
        // Salva a carteira no localStorage para exibicao rapida
        localStorage.setItem('carteira_dados', JSON.stringify(carteira));
        window.location.href = 'carteira.html';
    } else {
        window.location.href = 'cadastro_carteira.html';
    }
}

/**
 * Salva carteira no banco de dados
 * @param {object} dadosCarteira - Dados da carteira
 * @returns {Promise<{sucesso: boolean, carteira?: object, mensagem?: string}>}
 */
async function salvarCarteiraBackend(dadosCarteira, arquivos = {}) {
    console.log('[v0] salvarCarteiraBackend chamado');
    
    const usuario = obterUsuario();
    console.log('[v0] Usuario obtido:', usuario);
    
    if (!usuario) {
        console.error('[v0] Usuario nao autenticado!');
        throw new Error('Usuario nao autenticado');
    }

    // Gera numero da carteira se nao existir
    if (!dadosCarteira.numero_carteira) {
        dadosCarteira.numero_carteira = gerarNumeroCarteira();
        console.log('[v0] Numero da carteira gerado:', dadosCarteira.numero_carteira);
    }

    // Adiciona dados do usuario
    dadosCarteira.usuario_id = usuario.id;
    dadosCarteira.email = usuario.email;

    // Define datas
    const hoje = new Date();
    const validade = new Date();
    validade.setFullYear(validade.getFullYear() + 5); // 5 anos de validade

    dadosCarteira.data_emissao = hoje.toISOString().split('T')[0];
    dadosCarteira.data_validade = validade.toISOString().split('T')[0];
    dadosCarteira.status = 'ativa';

    const formData = new FormData();
    if (arquivos.foto) {
        formData.append('foto', arquivos.foto);
    }
    if (arquivos.laudo) {
        formData.append('laudo', arquivos.laudo);
    }

    Object.entries(dadosCarteira).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }
        formData.append(key, String(value));
    });

    console.log('[v0] FormData preparado para envio:', formData);

    try {
        console.log('[v0] Tentando enviar para API /carteiras...');
        const resposta = await fazerRequisicao('/carteiras', 'POST', formData);
        console.log('[v0] Resposta da API:', resposta);
        
        if (resposta.sucesso) {
            // Salva tambem no localStorage como cache
            const carteiraFinal = resposta.data || dadosCarteira;
            localStorage.setItem('carteira_dados', JSON.stringify(carteiraFinal));
            console.log('[v0] Carteira salva no banco e localStorage');
            return { sucesso: true, carteira: carteiraFinal };
        }
        throw new Error(resposta.mensagem || 'Erro ao salvar carteira');
    } catch (erro) {
        console.warn('[v0] Erro ao enviar para API:', erro.message);
        throw erro;
    }
}

async function atualizarCarteiraBackend(dadosCarteira, arquivos = {}) {
    const usuario = obterUsuario();
    if (!usuario) {
        throw new Error('Usuario nao autenticado');
    }

    const formData = new FormData();
    if (arquivos.foto) {
        formData.append('foto', arquivos.foto);
    }
    if (arquivos.laudo) {
        formData.append('laudo', arquivos.laudo);
    }

    Object.entries(dadosCarteira).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }
        formData.append(key, String(value));
    });

    const resposta = await fazerRequisicao('/carteiras/minha', 'PUT', formData);
    const carteiraFinal = resposta.data || dadosCarteira;
    localStorage.setItem('carteira_dados', JSON.stringify(carteiraFinal));
    localStorage.setItem('userRegistration', JSON.stringify(carteiraFinal));
    localStorage.setItem('carteira_cadastrada', 'true');
    return { sucesso: true, carteira: carteiraFinal };
}

/**
 * Busca carteira do usuario do banco de dados
 * @returns {Promise<object|null>}
 */
async function buscarCarteiraUsuario() {
    const usuario = obterUsuario();
    if (!usuario) {
        return null;
    }

    try {
        const resposta = await fazerRequisicao('/carteiras/minha', 'GET');
        if (resposta.sucesso && resposta.data) {
            // Atualiza cache local
            localStorage.setItem('carteira_dados', JSON.stringify(resposta.data));
            return resposta.data;
        }
        return null;
    } catch (erro) {
        if (erro.status === 404) {
            limparCacheCarteiraLocal();
            return null;
        }

        // Retorna dados do localStorage se backend nao disponivel
        const carteiraLocal = localStorage.getItem('carteira_dados');
        if (carteiraLocal) {
            return JSON.parse(carteiraLocal);
        }
        return null;
    }
}

/**
 * Mostra toast de notificacao moderna
 */
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 4000) {
    // Remove toasts anteriores
    const containerExistente = document.querySelector('.toast-container');
    if (containerExistente) {
        containerExistente.remove();
    }

    // Cria container
    const container = document.createElement('div');
    container.className = 'toast-container';
    
    // Cria toast
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    // Icone baseado no tipo
    const icones = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    toast.innerHTML = `
        ${icones[tipo] || icones.info}
        <span>${mensagem}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    container.appendChild(toast);
    document.body.appendChild(container);

    // Remove automaticamente
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => container.remove(), 300);
    }, duracao);
}
