document.addEventListener('DOMContentLoaded', () => {
    if (!estaAutenticado()) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = obterUsuario();
    if (!usuario || usuario.email.toLowerCase() !== 'admin@gmail.com') {
        mostrarToast('Acesso negado. Login como administrador necessário.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    carregarDenuncias();

    document.getElementById('logoutAdmin')?.addEventListener('click', () => {
        removerAutenticacao();
        window.location.href = 'index.html';
    });
});

async function carregarDenuncias() {
    const container = document.getElementById('adminList');
    const loading = document.getElementById('adminLoading');
    const empty = document.getElementById('adminEmpty');

    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    container.innerHTML = '';

    try {
        const resposta = await fazerRequisicao('/denuncias/all', 'GET');
        const denuncias = resposta.data || [];

        if (denuncias.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        denuncias.forEach(denuncia => {
            const item = document.createElement('div');
            item.className = 'admin-card';
            item.innerHTML = `
                <div class="admin-card-header">
                    <strong>Denúncia #${denuncia.id}</strong>
                    <span class="status-badge ${denuncia.status}">${denuncia.status.toUpperCase()}</span>
                </div>
                <div class="admin-card-body">
                    <p><strong>Título:</strong> ${denuncia.titulo}</p>
                    <p><strong>Tipo:</strong> ${denuncia.tipo_denuncia || '—'}</p>
                    <p><strong>Localidade:</strong> ${denuncia.localidade || '—'}</p>
                    <p><strong>Endereço:</strong> ${denuncia.endereco || '—'}</p>
                    <p><strong>Descrição:</strong> ${denuncia.descricao || '—'}</p>
                    <p><strong>Preso por:</strong> #${denuncia.usuario_id}</p>
                    ${denuncia.evidencia_url ? `<p><strong>Evidência:</strong> <a href="${denuncia.evidencia_url}" target="_blank">Ver imagem</a></p>` : ''}
                    <p><strong>Criada em:</strong> ${formatarData(denuncia.criada_em)}</p>
                    ${denuncia.resolvida_em ? `<p><strong>Resolvida em:</strong> ${formatarData(denuncia.resolvida_em)}</p>` : ''}
                </div>
                <div class="admin-card-actions">
                    ${denuncia.status !== 'resolvida' ? `<button class="btn btn-primary" onclick="resolverDenuncia(${denuncia.id})">Marcar como resolvida</button>` : ''}
                </div>
            `;
            container.appendChild(item);
        });
    } catch (erro) {
        mostrarToast('Erro ao carregar denúncias: ' + erro.message, 'error');
    } finally {
        loading.classList.add('hidden');
    }
}

async function resolverDenuncia(id) {
    try {
        const resposta = await fazerRequisicao(`/denuncias/${id}/resolver`, 'PATCH');
        if (resposta.sucesso) {
            mostrarToast('Denúncia marcada como resolvida', 'success');
            carregarDenuncias();
        }
    } catch (erro) {
        mostrarToast('Erro ao resolver denúncia: ' + erro.message, 'error');
    }
}

function formatarData(valor) {
    if (!valor) return '—';
    const data = new Date(valor);
    return data.toLocaleString('pt-BR');
}
