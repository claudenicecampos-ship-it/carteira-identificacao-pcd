// Lógica específica da página de LOGIN

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('loginForm');
    
    if (form) {
        form.addEventListener('submit', handleLogin);
    }

    habilitarBotao('loginBtn');

    // Auto-preencher se "Lembrar-me" estava ativo
    const emailSalvo = localStorage.getItem('carteira_email_salvo');
    if (emailSalvo) {
        document.getElementById('email').value = emailSalvo;
        document.getElementById('lembrarMe').checked = true;
        
        // Verificar se há bloqueio ativo para o email salvo
        await verificarBloqueioAoCarregar(emailSalvo);
    }

    await verificarBackend();
});

// Verifica se há bloqueio ativo ao carregar a página
async function verificarBloqueioAoCarregar(email) {
    try {
        const baseUrl = await resolveApiBaseUrl();
        const resposta = await fetch(`${baseUrl}/api/auth/verificar-bloqueio/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const dados = await resposta.json();
        
        if (dados.sucesso && dados.data && dados.data.bloqueado) {
            // Há bloqueio ativo, mostrar contagem regressiva
            const segundosRestantes = dados.data.segundosRestantes;
            if (segundosRestantes > 0) {
                exibirContagemRegressiva(segundosRestantes, 'loginForm');
                desabilitarBotao('loginBtn');
            } else {
                // Bloqueio expirou - habilita novamente
                habilitarBotao('loginBtn');
                removerToastBloqueio();
            }
        } else {
            // Sem bloqueio - garante que botão está habilitado
            habilitarBotao('loginBtn');
            removerToastBloqueio();
        }
    } catch (erro) {
        // Se falhar a verificação, habilita botão como fallback
        console.log('Erro ao verificar bloqueio:', erro.message);
        habilitarBotao('loginBtn');
        removerToastBloqueio();
    }
}

async function verificarBackend() {
    try {
        const baseUrl = await resolveApiBaseUrl();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const resposta = await fetch(`${baseUrl}/health`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!resposta.ok) {
            throw new Error('Servidor indisponível');
        }

        return true;
    } catch (erro) {
        mostrarToast('Servidor não está ativo. Inicie o backend com npm run dev em backend.', 'error');
        habilitarBotao('loginBtn');
        return false;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    limparErros();
    
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const lembrarMe = document.getElementById('lembrarMe').checked;

    // Validações
    if (!email || !senha) {
        mostrarErro('email', 'Email e senha são obrigatórios');
        return;
    }

    if (!validarEmail(email)) {
        mostrarErro('email', 'Email inválido');
        return;
    }

    const backendAtivo = await verificarBackend();
    if (!backendAtivo) {
        mostrarToast('Servidor não está ativo. Inicie o backend com npm run dev em backend.', 'error');
        return;
    }

    try {
        desabilitarBotao('loginBtn');
        
        const resposta = await fazerRequisicao('/auth/login', 'POST', {
            email,
            senha
        });

        if (resposta.sucesso) {
            // Salvar dados de autenticação
            salvarAutenticacao(
                resposta.data.token,
                resposta.data.refreshToken,
                resposta.data.usuario
            );

            // Salvar email se "Lembrar-me" está marcado
            if (lembrarMe) {
                localStorage.setItem('carteira_email_salvo', email);
            } else {
                localStorage.removeItem('carteira_email_salvo');
            }

            // Remove toast anterior se existir
            const toastAntigo = document.querySelector('.toast-container');
            if (toastAntigo) toastAntigo.remove();

            // Mostra toast de sucesso
            mostrarToast('Login realizado com sucesso!', 'success');

            const usuario = resposta.data.usuario;
            
            // Admin vai para painel admin
            if (usuario?.role === 'admin') {
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
                return;
            }

            // Verifica se usuario tem carteira cadastrada
            if (usuario?.possuiCarteira || resposta.data.carteira) {
                if (resposta.data.carteira) {
                    // Salva nos dois formatos para compatibilidade
                    localStorage.setItem('carteira_dados', JSON.stringify(resposta.data.carteira));
                    localStorage.setItem('userRegistration', JSON.stringify(resposta.data.carteira));
                    localStorage.setItem('carteira_cadastrada', 'true');
                }
                setTimeout(() => {
                    window.location.href = 'carteira.html';
                }, 1000);
                return;
            }

            // Verifica se usuario tem carteira via API separada
            try {
                const { temCarteira, carteira } = await verificarCarteiraExistente(usuario.id);
                if (temCarteira && carteira) {
                    localStorage.setItem('carteira_dados', JSON.stringify(carteira));
                    localStorage.setItem('userRegistration', JSON.stringify(carteira));
                    localStorage.setItem('carteira_cadastrada', 'true');
                    setTimeout(() => {
                        window.location.href = 'carteira.html';
                    }, 1000);
                    return;
                }
            } catch (e) {
                // Se falhar a verificacao, continua para cadastro
            }

            // Usuario sem carteira - vai para cadastro
            setTimeout(() => {
                window.location.href = 'cadastro_carteira.html';
            }, 1000);
        }
    } catch (erro) {
        let mensagem = erro.message || 'Erro ao conectar';
        if (erro?.status === 429) {
            const retry = erro.headers?.retryAfter;
            if (retry && retry > 0) {
                exibirContagemRegressiva(retry, 'loginForm');
                // Não habilita o botão aqui, será habilitado quando o bloqueio expirar
                return;
            } else {
                // Se não veio retryAfter, tenta buscar o tempo real do backend
                const foiBloqueado = await tentarMostrarContadorBloqueio(email);
                if (foiBloqueado) {
                    return;
                }
                // Se não estava bloqueado, habilita e tenta novo login
                habilitarBotao('loginBtn');
            }
        } else {
            const restantes = erro.headers?.remaining;
            if (restantes != null && restantes > 0) {
                mensagem += ` Você tem ${restantes} tentativa(s) restante(s) antes do bloqueio de 5 minutos.`;
            }
            mostrarToast(mensagem, 'error');
            habilitarBotao('loginBtn');
        }
    }
}

// Consulta o backend para tentar mostrar o contador de bloqueio
async function tentarMostrarContadorBloqueio(email) {
    try {
        const baseUrl = await resolveApiBaseUrl();
        const resposta = await fetch(`${baseUrl}/api/auth/verificar-bloqueio/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const dados = await resposta.json();
        if (dados.sucesso && dados.data && dados.data.bloqueado && dados.data.segundosRestantes > 0) {
            exibirContagemRegressiva(dados.data.segundosRestantes, 'loginForm');
            return true; // Ainda está bloqueado
        } else {
            // Bloqueio foi removido ou nunca existiu
            habilitarBotao('loginBtn');
            removerToastBloqueio();
            return false;
        }
    } catch (erro) {
        // Erro ao verificar - habilita botão como fallback
        console.log('Erro ao verificar bloqueio:', erro.message);
        habilitarBotao('loginBtn');
        removerToastBloqueio();
        return false;
    }
}

// Variável global para controlar o intervalo de bloqueio
let intervaloBloqueio = null;
let toastBloqueio = null;
let intervaloVerificacaoDesbloqueio = null;

// Remove o toast de bloqueio se existir
function removerToastBloqueio() {
    if (intervaloBloqueio) {
        clearInterval(intervaloBloqueio);
        intervaloBloqueio = null;
    }
    if (intervaloVerificacaoDesbloqueio) {
        clearInterval(intervaloVerificacaoDesbloqueio);
        intervaloVerificacaoDesbloqueio = null;
    }
    if (toastBloqueio && document.body.contains(toastBloqueio)) {
        toastBloqueio.remove();
        toastBloqueio = null;
    }
    const toastExistente = document.querySelector('[data-bloqueio-toast]');
    if (toastExistente) {
        toastExistente.remove();
    }
}

// Verifica se o bloqueio foi removido manualmente do banco de dados
async function verificarDesbloqueioManual(email) {
    try {
        const baseUrl = await resolveApiBaseUrl();
        const resposta = await fetch(`${baseUrl}/api/auth/verificar-bloqueio/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const dados = await resposta.json();
        
        if (dados.sucesso && !dados.data.bloqueado) {
            // Bloqueio foi removido manualmente!
            removerToastBloqueio();
            mostrarToast('✅ Sua conta foi desbloqueada! Você pode fazer login agora.', 'success', 5000);
            habilitarBotao('loginBtn');
            return true;
        }
    } catch (erro) {
        console.log('Erro ao verificar desbloqueio manual:', erro.message);
    }
    return false;
}

// Função para exibir contagem regressiva de bloqueio
function exibirContagemRegressiva(segundosRestantes, formId) {
    // Se já existe um toast de bloqueio ativo, não cria outro
    if (toastBloqueio && document.body.contains(toastBloqueio)) {
        return;
    }
    let segundos = parseInt(segundosRestantes, 10);
    if (isNaN(segundos) || segundos <= 0) segundos = 300;
    // Remove toast anterior se existir
    removerToastBloqueio();
    // Cria container para o toast de bloqueio
    toastBloqueio = document.createElement('div');
    toastBloqueio.setAttribute('data-bloqueio-toast', 'true');
    toastBloqueio.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-weight: 500;
        min-width: 300px;
    `;
    document.body.appendChild(toastBloqueio);
    const atualizarMensagem = () => {
        const minutos = Math.floor(segundos / 60);
        const secs = segundos % 60;
        let mensagem;
        if (minutos > 0 && secs > 0) {
            mensagem = `Sua conta está bloqueada. Tente novamente em ${minutos} minuto(s) e ${secs} segundo(s)`;
        } else if (minutos > 0) {
            mensagem = `Sua conta está bloqueada. Tente novamente em ${minutos} minuto(s)`;
        } else {
            mensagem = `Sua conta está bloqueada. Tente novamente em ${secs} segundo(s)`;
        }
        toastBloqueio.textContent = mensagem;
    };
    atualizarMensagem();
    // Limpa intervalo anterior se existir
    if (intervaloBloqueio) {
        clearInterval(intervaloBloqueio);
    }
    
    // Obter email para verificação de desbloqueio manual
    const email = document.getElementById('email')?.value?.trim();
    
    // Verificar a cada 3 segundos se o bloqueio foi removido manualmente
    if (email && intervaloVerificacaoDesbloqueio === null) {
        intervaloVerificacaoDesbloqueio = setInterval(async () => {
            const fdesbloqueado = await verificarDesbloqueioManual(email);
            if (fdesbloqueado) {
                clearInterval(intervaloBloqueio);
                intervaloBloqueio = null;
            }
        }, 3000);
    }
    
    intervaloBloqueio = setInterval(() => {
        segundos--;
        if (segundos <= 0) {
            removerToastBloqueio();
            mostrarToast('Bloqueio expirado! Você pode tentar fazer login novamente.', 'success', 4000);
            habilitarBotao('loginBtn');
            document.getElementById('email').focus();
        } else {
            atualizarMensagem();
        }
    }, 1000);
}

// Verifica se o usuário já tem uma carteira e redireciona corretamente
async function verificarCarteiraERedirect() {
    try {
        // Primeiro tenta usar a funcao do auth.js se disponivel
        if (typeof verificarCarteiraExistente === 'function') {
            const usuario = obterUsuario();
            if (usuario) {
                const { temCarteira, carteira } = await verificarCarteiraExistente(usuario.id || usuario.email);
                if (temCarteira && carteira) {
                    localStorage.setItem('carteira_dados', JSON.stringify(carteira));
                    localStorage.setItem('userRegistration', JSON.stringify(carteira));
                    localStorage.setItem('carteira_cadastrada', 'true');
                    window.location.href = 'carteira.html';
                    return;
                }
            }
        }
        
        // Fallback: tentar buscar carteira do usuário na API diretamente
        const resposta = await fazerRequisicao('/carteiras/minha', 'GET');
        
        if (resposta.sucesso && resposta.data) {
            // Usuário já tem carteira - salva dados e vai para carteira.html
            localStorage.setItem('carteira_dados', JSON.stringify(resposta.data));
            localStorage.setItem('userRegistration', JSON.stringify(resposta.data));
            localStorage.setItem('carteira_cadastrada', 'true');
            window.location.href = 'carteira.html';
        } else {
            // Usuário não tem carteira - vai para cadastro
            window.location.href = 'cadastro_carteira.html';
        }
    } catch (erro) {
        if (erro.status === 404) {
            localStorage.removeItem('carteira_dados');
            localStorage.removeItem('userRegistration');
            localStorage.removeItem('carteira_cadastrada');
            window.location.href = 'cadastro_carteira.html';
            return;
        }

        // Fallback: verificar localStorage
        const carteiraDados = localStorage.getItem('carteira_dados');
        const carteiraLocal = localStorage.getItem('userRegistration');
        const carteiraCadastrada = localStorage.getItem('carteira_cadastrada');
        
        if ((carteiraDados || carteiraLocal) && carteiraCadastrada === 'true') {
            window.location.href = 'carteira.html';
        } else {
            window.location.href = 'cadastro_carteira.html';
        }
    }
}
