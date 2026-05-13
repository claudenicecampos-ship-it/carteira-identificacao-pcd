// comunidade-page.js
// Scripts exclusivos da página Comunidade

// Mapa Interativo com Leaflet
let mapa;
const locaisAcessiveis = [
    { nome: 'Shopping Center Norte', lat: -23.5155, lng: -46.6233, avaliacao: 4.8 },
    { nome: 'Parque Ibirapuera', lat: -23.5875, lng: -46.6576, avaliacao: 4.6 },
    { nome: 'Parque Lage', lat: -22.9568, lng: -43.2129, avaliacao: 4.9 },
    { nome: 'Parque da Cidade', lat: -15.7942, lng: -47.8822, avaliacao: 4.7 },
    { nome: 'Shopping Morumbi', lat: -23.6229, lng: -46.6978, avaliacao: 4.5 },
    { nome: 'Hospital das Clinicas', lat: -23.5559, lng: -46.6699, avaliacao: 4.3 },
];

function inicializarMapa() {
    mapa = L.map('mapaInterativo').setView([-23.5505, -46.6333], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapa);
    // Adicionar marcadores de locais acessiveis
    locaisAcessiveis.forEach(local => {
        const icone = L.divIcon({
            className: 'marcador-acessivel',
            html: `<div style="background: var(--primary-600, #326fa1); color: white; padding: 6px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                <span style="margin-right: 4px;">♿</span>${local.avaliacao}
            </div>`,
            iconSize: [80, 30],
            iconAnchor: [40, 15]
        });
        L.marker([local.lat, local.lng], { icon: icone })
            .addTo(mapa)
            .bindPopup(`<strong>${local.nome}</strong><br>Avaliacao: ${local.avaliacao}/5`);
    });
}

function centrarMapa(lat, lng) {
    if (mapa) {
        mapa.setView([lat, lng], 15);
    }
}

function buscarLocal() {
    const endereco = document.getElementById('searchLocation').value.trim();
    if (!endereco) {
        mostrarToast('Digite um endereco para buscar', 'warning');
        return;
    }
    // Simulacao de busca - em producao usaria API de geocoding
    mostrarToast('Buscando: ' + endereco, 'info');
    // Centralizar no Brasil por padrao
    mapa.setView([-15.7942, -47.8822], 4);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function participarGrupo(grupo) {
    mostrarToast('Voce solicitou participar do grupo ' + grupo + '!', 'success');
}

function participarEvento(evento) {
    mostrarToast('Inscricao realizada para: ' + evento, 'success');
}

// Verificar acesso e inicializar
document.addEventListener('DOMContentLoaded', function() {
    verificarAcessoComunidade();
    inicializarMapa();
});

async function verificarAcessoComunidade() {
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
