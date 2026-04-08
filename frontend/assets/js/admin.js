document.addEventListener('DOMContentLoaded', () => {
    if (!estaAutenticado()) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = obterUsuario();
    if (!usuario || usuario.role !== 'admin') {
        mostrarToast('Acesso negado. Login como administrador necessário.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    carregarPainelAdmin();

    document.getElementById('logoutAdmin')?.addEventListener('click', () => {
        removerAutenticacao();
        window.location.href = 'index.html';
    });
});

async function carregarPainelAdmin() {
    atualizarResumo({ usuarios: 0, carteiras: 0, denuncias: 0 });
    await Promise.all([
        carregarUsuarios(),
        carregarCarteiras(),
        carregarDenuncias()
    ]);
}

function atualizarResumo({ usuarios, carteiras, denuncias }) {
    document.getElementById('totalUsers').textContent = usuarios;
    document.getElementById('totalCarteiras').textContent = carteiras;
    document.getElementById('totalDenuncias').textContent = denuncias;
}

async function carregarUsuarios() {
    const container = document.getElementById('usuariosList');
    const loading = document.getElementById('usuariosLoading');
    const empty = document.getElementById('usuariosEmpty');

    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    container.innerHTML = '';

    try {
        const resposta = await fazerRequisicao('/admin/usuarios', 'GET');
        const usuarios = resposta.data || [];

        atualizarResumo({
            usuarios: usuarios.length,
            carteiras: parseInt(document.getElementById('totalCarteiras').textContent, 10) || 0,
            denuncias: parseInt(document.getElementById('totalDenuncias').textContent, 10) || 0
        });

        if (usuarios.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Cadastrado em</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(usuario => `
                        <tr>
                            <td>${usuario.id}</td>
                            <td>${usuario.nome}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.role || 'user'}</td>
                            <td><span class="status-badge ${usuario.ativo ? 'ativo' : 'inativo'}">${usuario.ativo ? 'Ativo' : 'Inativo'}</span></td>
                            <td>${formatarData(usuario.criado_em)}</td>
                            <td class="admin-card-actions">
                                <button class="btn btn-secondary" onclick="alterarUsuarioStatus(${usuario.id}, ${usuario.ativo ? 0 : 1})">
                                    ${usuario.ativo ? 'Desativar' : 'Ativar'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (erro) {
        mostrarToast('Erro ao carregar usuários: ' + erro.message, 'error');
    } finally {
        loading.classList.add('hidden');
    }
}

async function carregarCarteiras() {
    const container = document.getElementById('carteirasList');
    const loading = document.getElementById('carteirasLoading');
    const empty = document.getElementById('carteirasEmpty');

    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    container.innerHTML = '';

    try {
        const resposta = await fazerRequisicao('/admin/carteiras', 'GET');
        const carteiras = resposta.data || [];

        atualizarResumo({
            usuarios: parseInt(document.getElementById('totalUsers').textContent, 10) || 0,
            carteiras: carteiras.length,
            denuncias: parseInt(document.getElementById('totalDenuncias').textContent, 10) || 0
        });

        if (carteiras.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuário</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Carteira</th>
                        <th>Status</th>
                        <th>Criada em</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${carteiras.map(carteira => `
                        <tr>
                            <td>${carteira.id}</td>
                            <td>${carteira.usuario_nome || '—'}</td>
                            <td>${carteira.usuario_email || '—'}</td>
                            <td>${carteira.tipo || '—'}</td>
                            <td>${carteira.numero_carteira || '—'}</td>
                            <td><span class="status-badge ${carteira.ativa ? 'ativo' : 'inativo'}">${carteira.ativa ? 'Ativa' : 'Inativa'}</span></td>
                            <td>${formatarData(carteira.criada_em)}</td>
                            <td class="admin-card-actions">
                                <button class="btn btn-secondary" onclick="alterarCarteiraStatus(${carteira.id}, ${carteira.ativa ? 0 : 1})">
                                    ${carteira.ativa ? 'Desativar' : 'Ativar'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (erro) {
        mostrarToast('Erro ao carregar carteiras: ' + erro.message, 'error');
    } finally {
        loading.classList.add('hidden');
    }
}

async function carregarDenuncias() {
    const container = document.getElementById('denunciasList');
    const loading = document.getElementById('denunciasLoading');
    const empty = document.getElementById('denunciasEmpty');

    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    container.innerHTML = '';

    try {
        const resposta = await fazerRequisicao('/admin/denuncias', 'GET');
        const denuncias = resposta.data || [];

        atualizarResumo({
            usuarios: parseInt(document.getElementById('totalUsers').textContent, 10) || 0,
            carteiras: parseInt(document.getElementById('totalCarteiras').textContent, 10) || 0,
            denuncias: denuncias.length
        });

        if (denuncias.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Tipo</th>
                        <th>Localidade</th>
                        <th>Status</th>
                        <th>Usuário</th>
                        <th>Criada em</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${denuncias.map(denuncia => `
                        <tr>
                            <td>${denuncia.id}</td>
                            <td>${denuncia.titulo}</td>
                            <td>${denuncia.tipo_denuncia || '—'}</td>
                            <td>${denuncia.localidade || '—'}</td>
                            <td><span class="status-badge ${denuncia.status}">${denuncia.status.toUpperCase()}</span></td>
                            <td>#${denuncia.usuario_id}</td>
                            <td>${formatarData(denuncia.criada_em)}</td>
                            <td class="admin-card-actions">
                                ${denuncia.status !== 'resolvida' ? `<button class="btn btn-primary" onclick="resolverDenuncia(${denuncia.id})">Resolver</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (erro) {
        mostrarToast('Erro ao carregar denúncias: ' + erro.message, 'error');
    } finally {
        loading.classList.add('hidden');
    }
}

async function alterarUsuarioStatus(id, ativa) {
    try {
        await fazerRequisicao(`/admin/usuarios/${id}/status`, 'PATCH', { ativa });
        mostrarToast('Status do usuário atualizado com sucesso', 'success');
        carregarUsuarios();
    } catch (erro) {
        mostrarToast('Erro ao atualizar status do usuário: ' + erro.message, 'error');
    }
}

async function alterarCarteiraStatus(id, ativa) {
    try {
        await fazerRequisicao(`/admin/carteiras/${id}/status`, 'PATCH', { ativa });
        mostrarToast('Status da carteira atualizado com sucesso', 'success');
        carregarCarteiras();
    } catch (erro) {
        mostrarToast('Erro ao atualizar status da carteira: ' + erro.message, 'error');
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
