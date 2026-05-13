// central-direitos-page.js
// Scripts exclusivos da página Central de Direitos

// Modal Denuncia
const denunciaModal = document.getElementById('denunciaModal');
const btnDenuncia = document.getElementById('btnDenuncia');
const closeDenuncia = document.getElementById('closeDenuncia');

btnDenuncia?.addEventListener('click', () => {
    denunciaModal?.classList.remove('hidden');
});

closeDenuncia?.addEventListener('click', () => {
    denunciaModal?.classList.add('hidden');
});

denunciaModal?.addEventListener('click', (e) => {
    if (e.target === denunciaModal) {
        denunciaModal.classList.add('hidden');
    }
});

// Modal Leis
const leisModal = document.getElementById('leisModal');
const closeLeis = document.getElementById('closeLeis');

function mostrarLeis() {
    leisModal?.classList.remove('hidden');
}

closeLeis?.addEventListener('click', () => {
    leisModal?.classList.add('hidden');
});

leisModal?.addEventListener('click', (e) => {
    if (e.target === leisModal) {
        leisModal.classList.add('hidden');
    }
});

// Chat
function iniciarChat() {
    mostrarToast('Funcionalidade de chat em breve!', 'info');
}

// Evidencia preview
document.getElementById('evidenciaDenuncia')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const preview = this.previousElementSibling;
        preview.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><polyline points="20 6 9 17 4 12"></polyline></svg><span>' + file.name + '</span>';
        preview.classList.add('has-file');
    }
});

async function obterArquivoBase64(id) {
    const input = document.getElementById(id);
    if (!input || !input.files || !input.files[0]) {
        return null;
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo de evidencia'));
        reader.readAsDataURL(input.files[0]);
    });
}

// Formulario de Denuncia
document.getElementById('denunciaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!estaAutenticado()) {
        mostrarToast('Faca login para registrar uma denuncia', 'error');
        return;
    }
    const tipo = document.getElementById('tipoDenuncia').value;
    const titulos = {
        'fila': 'Negaram Fila Prioritaria',
        'acesso': 'Falta de Acessibilidade',
        'atendimento': 'Atendimento Discriminatorio',
        'transporte': 'Problema em Transporte',
        'estacionamento': 'Vaga Reservada Ocupada',
        'outro': 'Outra Violacao'
    };
    const evidenciaBase64 = await obterArquivoBase64('evidenciaDenuncia');
    const dados = {
        localidade: document.getElementById('localDenuncia').value.trim(),
        endereco: document.getElementById('enderecoDenuncia').value.trim(),
        evidencia_url: evidenciaBase64,
        tipo_denuncia: tipo,
        titulo: titulos[tipo] || 'Denuncia',
        descricao: document.getElementById('descricaoDenuncia').value.trim()
    };
    try {
        const resposta = await fazerRequisicao('/denuncias', 'POST', dados);
        if (resposta.sucesso) {
            mostrarToast('Denuncia registrada com sucesso', 'success');
            denunciaModal?.classList.add('hidden');
            e.target.reset();
            const preview = document.querySelector('.laudo-preview');
            if (preview) {
                preview.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg><span>Clique para anexar foto</span>';
                preview.classList.remove('has-file');
            }
        }
    } catch (erro) {
        mostrarToast('Erro ao registrar denuncia: ' + erro.message, 'error');
    }
});

// Verificar se o usuario tem carteira
document.addEventListener('DOMContentLoaded', function() {
    verificarAcessoCentralDireitos();
});

async function verificarAcessoCentralDireitos() {
    try {
        const usuario = JSON.parse(localStorage.getItem('carteira_user') || 'null');
        const carteiraCadastrada = localStorage.getItem('carteira_cadastrada');
        const token = localStorage.getItem('carteira_token');
        if (!usuario || !token || carteiraCadastrada !== 'true') {
            try {
                const resposta = await fazerRequisicao('/carteiras/minha', 'GET');
                if (!resposta.sucesso || !resposta.data) {
                    window.location.href = 'cadastro_carteira.html';
                    return;
                }
            } catch (erro) {
                window.location.href = 'cadastro_carteira.html';
                return;
            }
        }
    } catch (erro) {
        console.error('Erro ao verificar acesso:', erro);
    }
}
