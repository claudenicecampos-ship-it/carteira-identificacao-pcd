// Lógica específica da página de CADASTRO

let stepAtual = 1;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastroForm');
    const nomeInput = document.getElementById('nome');
    const cpfInput = document.getElementById('cpf');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const senhaInput = document.getElementById('senha');

    if (form) {
        form.addEventListener('submit', handleCadastro);
    }

    // Formatar CPF conforme digita
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 11) valor = valor.slice(0, 11);
            
            if (valor.length > 5) {
                valor = valor.slice(0, 3) + '.' + valor.slice(3, 6) + '.' + valor.slice(6, 9) + '-' + valor.slice(9);
            } else if (valor.length > 3) {
                valor = valor.slice(0, 3) + '.' + valor.slice(3);
            }
            
            e.target.value = valor;
            
            // Validar CPF em tempo real
            limparErros();
        });
    }

    // Formatar telefone conforme digita
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 11) valor = valor.slice(0, 11);
            
            if (valor.length > 6) {
                valor = '(' + valor.slice(0, 2) + ') ' + valor.slice(2, 7) + '-' + valor.slice(7);
            } else if (valor.length > 2) {
                valor = '(' + valor.slice(0, 2) + ') ' + valor.slice(2);
            }
            
            e.target.value = valor;
        });
    }

    // Validar email em tempo real
    if (emailInput) {
        emailInput.addEventListener('blur', (e) => {
            if (e.target.value && !validarEmail(e.target.value)) {
                mostrarErro('email', '❌ Email inválido');
            } else {
                limparErrosCampo('email');
            }
        });
    }

    // Atualizar força da senha
    if (senhaInput) {
        senhaInput.addEventListener('input', () => {
            atualizarForcaSenha('senha');
        });
    }
});

function proximoStep() {
    if (stepAtual === 1) {
        if (validarStep1()) {
            stepAtual = 2;
            mostrarStep();
        }
    }
}

function voltarStep() {
    if (stepAtual > 1) {
        stepAtual--;
        mostrarStep();
    }
}

function mostrarStep() {
    // Esconder todos os steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });

    // Mostrar step atual
    document.getElementById(`step${stepAtual}`).classList.add('active');
}

function validarStep1() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value;
    const dataNascimento = document.getElementById('data_nascimento').value;

    limparErros();

    // Validar nome
    if (!nome) {
        mostrarErro('nome', '❌ Nome é obrigatório');
        return false;
    }
    if (nome.length < 3) {
        mostrarErro('nome', '❌ Nome deve ter pelo menos 3 caracteres');
        return false;
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
        mostrarErro('nome', '❌ Nome deve conter apenas letras e espaços');
        return false;
    }

    // Validar email
    if (!email) {
        mostrarErro('email', '❌ Email é obrigatório');
        return false;
    }
    if (!validarEmail(email)) {
        mostrarErro('email', '❌ Email inválido (ex: usuario@email.com)');
        return false;
    }

    // Validar CPF
    const cpfLimpo = removerFormatacaoCPF(cpf);
    if (!cpfLimpo) {
        mostrarErro('cpf', '❌ CPF é obrigatório');
        return false;
    }
    if (cpfLimpo.length !== 11) {
        mostrarErro('cpf', '❌ CPF deve ter 11 dígitos');
        return false;
    }
    if (!validarCPFValido(cpfLimpo)) {
        mostrarErro('cpf', '❌ CPF inválido');
        return false;
    }

    // Validar telefone (se preenchido)
    if (telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');
        if (telefoneLimpo.length < 10) {
            mostrarErro('telefone', '❌ Telefone deve ter pelo menos 10 dígitos');
            return false;
        }
        if (telefoneLimpo.length > 11) {
            mostrarErro('telefone', '❌ Telefone não pode ter mais de 11 dígitos');
            return false;
        }
        if (!/^(\d)\1{9,10}$/.test(telefoneLimpo)) {
            // OK - não é tudo o mesmo número
        } else {
            mostrarErro('telefone', '❌ Telefone inválido');
            return false;
        }
    }

    return true;
}

/**
 * Valida CPF usando algoritmo de dígitos verificadores
 */
function validarCPFValido(cpf) {
    // Remover formatação
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Verificar tamanho
    if (cpfLimpo.length !== 11) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    // Calcular primeiro dígito verificador
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

    // Calcular segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

    return true;
}

function validarStep2() {
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const aceitar = document.getElementById('aceitar').checked;

    limparErros();

    // Validar senha
    if (!senha) {
        mostrarErro('senha', '❌ Senha é obrigatória');
        return false;
    }
    
    if (!validarSenha(senha)) {
        mostrarErro('senha', '❌ Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial (@, $, !, %, *, ?, &)');
        return false;
    }

    // Validar confirmação
    if (!confirmarSenha) {
        mostrarErro('confirmarSenha', '❌ Confirmação de senha é obrigatória');
        return false;
    }
    
    if (senha !== confirmarSenha) {
        mostrarErro('confirmarSenha', '❌ Senhas não coincidem');
        return false;
    }

    // Validar aceite
    if (!aceitar) {
        mostrarErro('aceitar', '❌ Você deve aceitar os termos e condições');
        return false;
    }

    return true;
}

async function handleCadastro(e) {
    e.preventDefault();

    if (!validarStep2()) {
        return;
    }

    try {
        desabilitarBotao('cadastroBtn');

        const dados = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            cpf: removerFormatacaoCPF(document.getElementById('cpf').value),
            telefone: document.getElementById('telefone').value,
            data_nascimento: document.getElementById('data_nascimento').value,
            senha: document.getElementById('senha').value
        };

        const resposta = await fazerRequisicao('/auth/registrar', 'POST', dados);

        if (resposta.sucesso) {
            // Salvar dados de autenticação
            salvarAutenticacao(
                resposta.data.token,
                resposta.data.refreshToken,
                resposta.data.usuario
            );

            mostrarToast('Conta criada com sucesso!', 'success');
            
            // Mostrar tela de sucesso
            stepAtual = 3;
            mostrarStep();

            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (erro) {
        mostrarToast(erro.message, 'error');
        habilitarBotao('cadastroBtn');
    }
}
