// Lógica específica da página de RECUPERAR SENHA

let stepAtual = 1;
let emailRecuperacao = '';
let codigoGerado = '';

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
        // Pular para step de redefinição e preencher o token automaticamente
        stepAtual = 3;
        mostrarStep();
        const recoveryTokenInput = document.getElementById('recoveryToken');
        if (recoveryTokenInput) {
            recoveryTokenInput.value = token;
        }
    }
    
    // Configurar input do código
    setupCodigoInput();
});

function mostrarStep() {
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    const stepEl = document.getElementById(`step${stepAtual}`);
    if (stepEl) {
        stepEl.classList.add('active');
    }
}

// Configura os inputs do código de verificação
function setupCodigoInput() {
    const inputs = document.querySelectorAll('.codigo-input');
    
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Apenas números
            e.target.value = value.replace(/\D/g, '').slice(0, 1);
            
            // Auto-avançar para próximo input
            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            // Backspace volta para input anterior
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
        
        // Permitir colar código completo
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const digits = paste.replace(/\D/g, '').split('');
            
            digits.forEach((digit, i) => {
                if (inputs[index + i]) {
                    inputs[index + i].value = digit;
                }
            });
            
            // Focar no último input preenchido ou no próximo vazio
            const lastIndex = Math.min(index + digits.length - 1, inputs.length - 1);
            inputs[lastIndex].focus();
        });
    });
}

// Gera um código de 6 dígitos
function gerarCodigoRecuperacao() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

            stepAtual = 3;
            mostrarStep();

            mostrarToast('Email de recuperação enviado! Copie o token enviado e cole abaixo.', 'success');
            return;
        }
    } catch (erro) {
        mostrarToast(erro.message || 'Falha ao solicitar recuperação de senha. Verifique o servidor.', 'error');
    } finally {
        habilitarBotao('enviarBtn');
    }
}

function voltarStep() {
    if (stepAtual > 1) {
        stepAtual--;
        mostrarStep();
    }
}

function irParaStep3() {
    stepAtual = 3;
    mostrarStep();
}

function reenviarCodigo() {
    // Limpar inputs
    document.querySelectorAll('.codigo-input').forEach(input => {
        input.value = '';
    });
    
    // Gerar novo código
    codigoGerado = gerarCodigoRecuperacao();
    
    const recuperacaoData = {
        email: emailRecuperacao,
        codigo: codigoGerado,
        expira: Date.now() + (60 * 60 * 1000)
    };
    localStorage.setItem('recuperacao_temp', JSON.stringify(recuperacaoData));
    
    mostrarToast(`Novo código enviado! (Dev: ${codigoGerado})`, 'success');
}

async function redefinirSenha() {
    const tokenInput = document.getElementById('recoveryToken').value.trim();
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    limparErros();

    if (!tokenInput) {
        mostrarErro('recoveryToken', 'Token de recuperação é obrigatório');
        return;
    }

    // Validar formato do token (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tokenInput)) {
        mostrarErro('recoveryToken', 'Token inválido. Copie exatamente como recebido no email.');
        return;
    }

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

        const token = tokenInput;

        const resposta = await fazerRequisicao('/auth/redefinir-senha', 'POST', {
            token,
            novaSenha
        });

        if (resposta.sucesso) {
            finalizarRedefinicao();
            return;
        }

        mostrarToast('Falha ao redefinir senha. Tente novamente.', 'error');
    } catch (erro) {
        mostrarToast(erro.message || 'Falha ao redefinir senha. Verifique o servidor.', 'error');
    } finally {
        habilitarBotao('redefinirBtn');
    }
}

function finalizarRedefinicao() {
    // Remover autenticação anterior
    removerAutenticacao();
    
    mostrarToast('Senha alterada com sucesso!', 'success');
    
    // Mostrar tela de sucesso
    stepAtual = 4;
    mostrarStep();

    // Redirecionar para login após 3 segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}
