// Lógica específica da página de LOGIN

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('loginForm');
    
    if (form) {
        form.addEventListener('submit', handleLogin);
    }

    // Auto-preencher se "Lembrar-me" estava ativo
    const emailSalvo = localStorage.getItem('carteira_email_salvo');
    if (emailSalvo) {
        document.getElementById('email').value = emailSalvo;
        document.getElementById('lembrarMe').checked = true;
    }

    await verificarBackend();
});

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

    const backendAtivo = await verificarBackend();
    if (!backendAtivo) {
        habilitarBotao('loginBtn');
        return;
    }

    if (!validarEmail(email)) {
        mostrarErro('email', 'Email inválido');
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

            mostrarToast('Login realizado com sucesso!', 'success');

            const usuario = resposta.data.usuario;
            if (usuario?.role === 'admin') {
                window.location.href = 'admin.html';
                return;
            }

            if (usuario?.possuiCarteira) {
                if (resposta.data.carteira) {
                    localStorage.setItem('userRegistration', JSON.stringify(resposta.data.carteira));
                    localStorage.setItem('carteira_cadastrada', 'true');
                }
                window.location.href = 'carteira.html';
                return;
            }

            window.location.href = 'cadastro_carteira.html';
        }
    } catch (erro) {
        let mensagem = erro.message || 'Erro ao conectar';
        if (erro?.status === 429) {
            const retry = erro.headers?.retryAfter;
            if (retry) {
                const minutos = Math.ceil(retry / 60);
                mensagem = `Muitas tentativas de login. Tente novamente em ${minutos} minuto(s).`;
            }
        } else {
            const restantes = erro.headers?.remaining;
            if (restantes != null && restantes > 0) {
                mensagem += ` Você tem ${restantes} tentativa(s) restante(s) antes do bloqueio de 5 minutos.`;
            }
        }

        mostrarToast(mensagem, 'error');
        habilitarBotao('loginBtn');
    }
}

// Verifica se o usuário já tem uma carteira e redireciona corretamente
async function verificarCarteiraERedirect() {
    try {
        // Tentar buscar carteira do usuário na API
        const resposta = await fazerRequisicao('/carteiras/minha', 'GET');
        
        if (resposta.sucesso && resposta.data) {
            // Usuário já tem carteira - salva dados e vai para carteira.html
            localStorage.setItem('userRegistration', JSON.stringify(resposta.data));
            localStorage.setItem('carteira_cadastrada', 'true');
            window.location.href = 'carteira.html';
        } else {
            // Usuário não tem carteira - vai para cadastro
            window.location.href = 'cadastro_carteira.html';
        }
    } catch (erro) {
        // Fallback: verificar localStorage
        const carteiraLocal = localStorage.getItem('userRegistration');
        const carteiraCadastrada = localStorage.getItem('carteira_cadastrada');
        
        if (carteiraLocal && carteiraCadastrada === 'true') {
            window.location.href = 'carteira.html';
        } else {
            window.location.href = 'cadastro_carteira.html';
        }
    }
}
