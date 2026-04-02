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
        // Pular para step de redefinição
        stepAtual = 3;
        mostrarStep();
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

        // Tentar enviar via API primeiro
        try {
            const resposta = await fazerRequisicao('/auth/recuperar-senha', 'POST', { email });

            if (resposta.sucesso) {
                emailRecuperacao = email;
                document.getElementById('emailInfo').textContent = email;
                
                stepAtual = 2;
                mostrarStep();
                
                mostrarToast('Email de recuperação enviado!', 'success');
                habilitarBotao('enviarBtn');
                return;
            }
        } catch (erro) {
            console.log('API indisponível, usando modo offline');
        }
        
        // Modo offline: simular envio e usar código local
        codigoGerado = gerarCodigoRecuperacao();
        emailRecuperacao = email;
        
        // Salvar código no localStorage (em produção, isso seria feito no servidor)
        const recuperacaoData = {
            email: email,
            codigo: codigoGerado,
            expira: Date.now() + (60 * 60 * 1000) // 1 hora
        };
        localStorage.setItem('recuperacao_temp', JSON.stringify(recuperacaoData));
        
        document.getElementById('emailInfo').textContent = email;
        
        stepAtual = 2;
        mostrarStep();
        
        // Em modo desenvolvimento, mostrar o código (remover em produção)
        mostrarToast(`Código enviado! (Dev: ${codigoGerado})`, 'success');
        
    } catch (erro) {
        mostrarToast(erro.message, 'error');
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

async function verificarCodigo() {
    const inputs = document.querySelectorAll('.codigo-input');
    let codigo = '';
    
    inputs.forEach(input => {
        codigo += input.value;
    });
    
    if (codigo.length !== 6) {
        mostrarToast('Digite o código completo de 6 dígitos', 'error');
        return;
    }
    
    try {
        desabilitarBotao('verificarCodigoBtn');
        
        // Tentar verificar via API
        try {
            const resposta = await fazerRequisicao('/auth/verificar-codigo', 'POST', { 
                email: emailRecuperacao,
                codigo 
            });
            
            if (resposta.sucesso) {
                stepAtual = 3;
                mostrarStep();
                mostrarToast('Código verificado!', 'success');
                habilitarBotao('verificarCodigoBtn');
                return;
            }
        } catch (erro) {
            console.log('API indisponível, verificando localmente');
        }
        
        // Verificar localmente
        const recuperacaoData = JSON.parse(localStorage.getItem('recuperacao_temp') || '{}');
        
        if (recuperacaoData.codigo === codigo && Date.now() < recuperacaoData.expira) {
            stepAtual = 3;
            mostrarStep();
            mostrarToast('Código verificado!', 'success');
        } else if (Date.now() >= recuperacaoData.expira) {
            mostrarToast('Código expirado. Solicite um novo.', 'error');
        } else {
            mostrarToast('Código incorreto', 'error');
        }
        
    } catch (erro) {
        mostrarToast(erro.message, 'error');
    } finally {
        habilitarBotao('verificarCodigoBtn');
    }
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

        // Obter token da URL ou usar código verificado
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        // Tentar via API
        try {
            const resposta = await fazerRequisicao('/auth/redefinir-senha', 'POST', {
                token: token || null,
                email: emailRecuperacao,
                novaSenha
            });

            if (resposta.sucesso) {
                finalizarRedefinicao();
                return;
            }
        } catch (erro) {
            console.log('API indisponível, salvando localmente');
        }
        
        // Modo offline: atualizar senha no localStorage
        const usuarios = obterUsuariosDB();
        const usuarioIndex = usuarios.findIndex(u => u.email === emailRecuperacao);
        
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex].senha = novaSenha; // Em produção, isso seria hash
            salvarUsuariosDB(usuarios);
        }
        
        // Limpar dados de recuperação
        localStorage.removeItem('recuperacao_temp');
        
        finalizarRedefinicao();

    } catch (erro) {
        mostrarToast(erro.message, 'error');
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
