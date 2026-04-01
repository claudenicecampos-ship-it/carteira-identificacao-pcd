// Lógica específica da página de RECUPERAR SENHA

let stepAtual = 1;
let emailRecuperacao = '';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recuperarForm');
    const novaSenhaInput = document.getElementById('novaSenha');

    if (form) {
        form.addEventListener('submit', (e) => e.preventDefault());
    }

    // Atualizar força da senha
    if (novaSenhaInput) {
        novaSenhaInput.addEventListener('input', () => {
            atualizarForcaSenha('novaSenha');
        });
    }

    // Verificar se há token na URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        // Pular para step de redefinição
        stepAtual = 3;
        mostrarStep();
    }
});

function mostrarStep() {
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepAtual}`).classList.add('active');
}

async function enviarEmail() {
    const email = document.getElementById('email').value.trim();

    if (!email || !validarEmail(email)) {
        mostrarErro('email', 'Email inválido');
        return;
    }

    try {
        desabilitarBotao('enviarBtn');
        limparErros();

        const resposta = await fazerRequisicao('/auth/recuperar-senha', 'POST', { email });

        if (resposta.sucesso) {
            emailRecuperacao = email;
            document.getElementById('emailInfo').textContent = email;
            
            stepAtual = 2;
            mostrarStep();
            
            mostrarToast('Email de recuperação enviado!', 'success');
        }
    } catch (erro) {
        mostrarToast(erro.message, 'error');
        habilitarBotao('enviarBtn');
    }
}

function voltarStep() {
    if (stepAtual > 1) {
        stepAtual--;
        mostrarStep();
    }
}

async function redefinirSenha() {
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    limparErros();

    // Validar nova senha
    if (!validarSenha(novaSenha)) {
        mostrarErro('novaSenha', 'Senha não atende aos requisitos de segurança');
        return;
    }

    // Validar confirmação
    if (novaSenha !== confirmarSenha) {
        mostrarErro('confirmarSenha', 'Senhas não coincidem');
        return;
    }

    try {
        desabilitarBotao('redefinirBtn');

        // Obter token da URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            throw new Error('Token não encontrado');
        }

        const resposta = await fazerRequisicao('/auth/redefinir-senha', 'POST', {
            token,
            novaSenha
        });

        if (resposta.sucesso) {
            // Remover autenticação anterior
            removerAutenticacao();
            
            mostrarToast('Senha alterada com sucesso!', 'success');
            
            // Mostrar tela de sucesso
            stepAtual = 4;
            mostrarStep();

            // Redirecionar para login após 3 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
    } catch (erro) {
        mostrarToast(erro.message, 'error');
        habilitarBotao('redefinirBtn');
    }
}
