// Lógica específica da página de LOGIN

document.addEventListener('DOMContentLoaded', () => {
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
});

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
            
            // Verificar se o usuário já tem carteira cadastrada
            verificarCarteiraERedirect();
        }
    } catch (erro) {
        mostrarToast(erro.message, 'error');
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
            
            setTimeout(() => {
                window.location.href = 'carteira.html';
            }, 1000);
        } else {
            // Usuário não tem carteira - vai para cadastro
            setTimeout(() => {
                window.location.href = 'cadastro_carteira.html';
            }, 1000);
        }
    } catch (erro) {
        // Fallback: verificar localStorage
        const carteiraLocal = localStorage.getItem('userRegistration');
        const carteiraCadastrada = localStorage.getItem('carteira_cadastrada');
        
        if (carteiraLocal && carteiraCadastrada === 'true') {
            setTimeout(() => {
                window.location.href = 'carteira.html';
            }, 1000);
        } else {
            setTimeout(() => {
                window.location.href = 'cadastro_carteira.html';
            }, 1000);
        }
    }
}
