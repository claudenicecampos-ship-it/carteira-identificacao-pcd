import { CarteiraRepository } from './src/repositories/carteiraRepository.js';

(async () => {
    const dados = {
        usuario_id: 1,
        tipo: 'PCD',
        numero_carteira: 'TEST124',
        descricao: 'Teste',
        data_nascimento: '1990-01-01',
        endereco: 'Rua Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234567',
        telefone: '11999999999',
        tipo_deficiencia: 'Física',
        grau_deficiencia: 'Moderada',
        cid: 'M54.2',
        necessita_acompanhante: false,
        numero_laudo: 'LAUDO001',
        data_laudo: '2023-01-01',
        nome_medico: 'Dr. Silva',
        crm_medico: '12345',
        foto: null,
        laudo_url: null,
        tipo_sanguineo: 'O+',
        contato_emergencia: null,
        alergias: null,
        medicacoes: null,
        comunicacao: null,
        nome_responsavel: null,
        cpf_responsavel: null,
        vinculo_responsavel: null,
        nome: 'João Silva',
        cpf: '12345678909',
        rg: '12345678',
        sexo: 'M'
    };

    try {
        const id = await CarteiraRepository.criar(dados);
        console.log('ID:', id);
    } catch (e) {
        console.error('Erro:', e.message);
    }
})();