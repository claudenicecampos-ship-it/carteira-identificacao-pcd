// cadastro-page.js
// Scripts exclusivos da página de cadastro (modal Termos/Privacidade)

function abrirModalTermos(e) {
    e.preventDefault();
    document.getElementById('modalTermos').classList.add('show');
}

function abrirModalPrivacidade(e) {
    e.preventDefault();
    document.getElementById('modalPrivacidade').classList.add('show');
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Fechar modal ao clicar fora do conteudo
document.addEventListener('click', function(event) {
    const modalTermos = document.getElementById('modalTermos');
    const modalPrivacidade = document.getElementById('modalPrivacidade');
    if (event.target === modalTermos) {
        fecharModal('modalTermos');
    }
    if (event.target === modalPrivacidade) {
        fecharModal('modalPrivacidade');
    }
});
