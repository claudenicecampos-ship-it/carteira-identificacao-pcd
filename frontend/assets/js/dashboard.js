// Dashboard - Página Principal
// Funções específicas do dashboard

document.addEventListener('DOMContentLoaded', () => {
    // Validar autenticação
    if (!estaAutenticado()) {
        window.location.href = './pages/login.html';
        return;
    }

    // Carregar dados do usuário
    const usuario = obterUsuario();
    if (usuario) {
        document.getElementById('nomeUsuario').textContent = usuario.nome || 'Usuário';
        
        // Mostrar QR Code se disponível
        if (usuario.qr_code) {
            const container = document.getElementById('userQRCode');
            if (container) {
                container.innerHTML = `
                    <div class="qr-code-container">
                        <p style="font-size: 12px; color: #666; margin-bottom: 10px;">
                            Seu código único (para carteira):
                        </p>
                        <code style="background: #f5f5f5; padding: 8px 12px; border-radius: 4px; font-size: 11px; word-break: break-all; display: block;">
                            ${usuario.qr_code}
                        </code>
                    </div>
                `;
            }
        }
    }
});

/**
 * Executar logout
 */
async function fazerLogout() {
    try {
        // Desabilitar botão durante processamento
        event.target.disabled = true;
        event.target.textContent = 'Saindo...';

        // Chamar endpoint de logout
        try {
            await fazerRequisicao('/auth/logout', 'POST');
        } catch (erro) {
            console.warn('Erro ao chamar logout endpoint:', erro);
        }
        
        // Remover autenticação
        removerAutenticacao();
        
        // Mostrar mensagem
        mostrarToast('Logout realizado com sucesso', 'success');
        
        // Redirecionar para login após 1 segundo
        setTimeout(() => {
            window.location.href = './pages/login.html';
        }, 1000);
    } catch (erro) {
        console.error('Erro ao fazer logout:', erro);
        mostrarToast('Erro ao fazer logout', 'error');
        
        // Habilitar botão novamente
        if (event.target) {
            event.target.disabled = false;
            event.target.textContent = 'Sair';
        }
    }
}

/**
 * Navegar para página
 */
function navegarPara(pagina) {
    window.location.href = `./pages/${pagina}.html`;
}
