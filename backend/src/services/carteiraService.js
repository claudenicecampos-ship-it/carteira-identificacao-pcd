import { CarteiraRepository } from '../repositories/carteiraRepository.js';
import {
  validarCPF,
  validarCidade,
  validarCRM,
  validarData,
  validarEstado,
  validarNome,
  validarRG,
  validarTelefone,
  validarCID,
  validarSexo
} from '../utils/validacao.js';
import { logger } from '../utils/logger.js';

export class CarteiraService {
  static logAndThrow(message, context = {}) {
    logger.warn('Validação de criação de carteira falhou', { message, ...context });
    const erro = new Error(message);
    return erro;
  }

  static async criarCarteira(dados) {
    logger.info('Iniciando validação de dados para criação de carteira', {
      usuario_id: dados.usuario_id,
      cpf: dados.cpf,
      numero_carteira: dados.numero_carteira
    });
    if (!validarNome(dados.nome)) {
      throw this.logAndThrow('Nome do titular inválido', { nome: dados.nome, usuario_id: dados.usuario_id });
    }

    if (!validarData(dados.data_nascimento)) {
      throw this.logAndThrow('Data de nascimento inválida', { data_nascimento: dados.data_nascimento, usuario_id: dados.usuario_id });
    }

    if (!validarSexo(dados.sexo)) {
      throw this.logAndThrow('Sexo inválido', { sexo: dados.sexo, usuario_id: dados.usuario_id });
    }

    if (!validarCPF(dados.cpf)) {
      throw this.logAndThrow('CPF inválido', { cpf: dados.cpf, usuario_id: dados.usuario_id });
    }

    if (!validarRG(dados.rg)) {
      throw this.logAndThrow('RG inválido', { rg: dados.rg, usuario_id: dados.usuario_id });
    }

    if (!validarTelefone(dados.telefone)) {
      throw this.logAndThrow('Telefone inválido', { telefone: dados.telefone, usuario_id: dados.usuario_id });
    }

    if (!validarCidade(dados.cidade)) {
      throw this.logAndThrow('Cidade inválida', { cidade: dados.cidade, usuario_id: dados.usuario_id });
    }

    if (!validarEstado(dados.estado)) {
      throw this.logAndThrow('Estado inválido', { estado: dados.estado, usuario_id: dados.usuario_id });
    }

    if (!dados.tipo_deficiencia) {
      throw this.logAndThrow('Tipo de deficiência é obrigatório', { usuario_id: dados.usuario_id });
    }

    if (!dados.grau_deficiencia) {
      throw this.logAndThrow('Grau da deficiência é obrigatório', { usuario_id: dados.usuario_id });
    }

    if (!validarCID(dados.cid)) {
      throw this.logAndThrow('CID inválido', { cid: dados.cid, usuario_id: dados.usuario_id });
    }

    if (!dados.numero_laudo || typeof dados.numero_laudo !== 'string' || dados.numero_laudo.trim().length < 3) {
      throw this.logAndThrow('Número do laudo inválido', { numero_laudo: dados.numero_laudo, usuario_id: dados.usuario_id });
    }

    if (!validarData(dados.data_laudo)) {
      throw this.logAndThrow('Data do laudo inválida', { data_laudo: dados.data_laudo, usuario_id: dados.usuario_id });
    }

    if (!validarNome(dados.nome_medico)) {
      throw this.logAndThrow('Nome do médico inválido', { nome_medico: dados.nome_medico, usuario_id: dados.usuario_id });
    }

    if (!validarCRM(dados.crm_medico)) {
      throw this.logAndThrow('CRM do médico inválido', { crm_medico: dados.crm_medico, usuario_id: dados.usuario_id });
    }

    if (dados.nome_responsavel && !validarNome(dados.nome_responsavel)) {
      throw this.logAndThrow('Nome do responsável inválido', { nome_responsavel: dados.nome_responsavel, usuario_id: dados.usuario_id });
    }

    if (dados.cpf_responsavel && !validarCPF(dados.cpf_responsavel)) {
      throw this.logAndThrow('CPF do responsável inválido', { cpf_responsavel: dados.cpf_responsavel, usuario_id: dados.usuario_id });
    }

    if ((dados.nome_responsavel && !dados.cpf_responsavel) || (dados.cpf_responsavel && !dados.nome_responsavel)) {
      throw this.logAndThrow('Nome e CPF do responsável devem ser preenchidos juntos', { nome_responsavel: dados.nome_responsavel, cpf_responsavel: dados.cpf_responsavel, usuario_id: dados.usuario_id });
    }

    const carteiraExistente = await CarteiraRepository.buscarPorUsuarioId(dados.usuario_id);
    if (carteiraExistente) {
      logger.warn('Usuário já possui carteira cadastrada', { usuario_id: dados.usuario_id, carteira_id: carteiraExistente.id });
      const erro = new Error('Usuário já possui carteira cadastrada');
      erro.status = 409;
      throw erro;
    }

    const cpfExistente = await CarteiraRepository.buscarPorCpf(dados.cpf);
    if (cpfExistente) {
      logger.warn('CPF já cadastrado em outra carteira', { cpf: dados.cpf, carteira_id: cpfExistente.id, usuario_id: dados.usuario_id });
      const erro = new Error('CPF já cadastrado em outra carteira');
      erro.status = 409;
      throw erro;
    }

    logger.info('Validações concluídas, persistindo carteira', {
      usuario_id: dados.usuario_id,
      numero_carteira: dados.numero_carteira,
      cpf: dados.cpf
    });

    const carteiraId = await CarteiraRepository.criar(dados);
    logger.info('Carteira criada com sucesso no serviço', {
      carteiraId,
      usuario_id: dados.usuario_id,
      numero_carteira: dados.numero_carteira
    });
    return { id: carteiraId, ...dados };
  }

  static validarDadosCarteira(dados) {
    if (!validarNome(dados.nome)) {
      throw this.logAndThrow('Nome do titular invalido', { nome: dados.nome, usuario_id: dados.usuario_id });
    }
    if (!validarData(dados.data_nascimento)) {
      throw this.logAndThrow('Data de nascimento invalida', { data_nascimento: dados.data_nascimento, usuario_id: dados.usuario_id });
    }
    if (!validarSexo(dados.sexo)) {
      throw this.logAndThrow('Sexo invalido', { sexo: dados.sexo, usuario_id: dados.usuario_id });
    }
    if (!validarCPF(dados.cpf)) {
      throw this.logAndThrow('CPF invalido', { cpf: dados.cpf, usuario_id: dados.usuario_id });
    }
    if (!validarRG(dados.rg)) {
      throw this.logAndThrow('RG invalido', { rg: dados.rg, usuario_id: dados.usuario_id });
    }
    if (!validarTelefone(dados.telefone)) {
      throw this.logAndThrow('Telefone invalido', { telefone: dados.telefone, usuario_id: dados.usuario_id });
    }
    if (!validarCidade(dados.cidade)) {
      throw this.logAndThrow('Cidade invalida', { cidade: dados.cidade, usuario_id: dados.usuario_id });
    }
    if (!validarEstado(dados.estado)) {
      throw this.logAndThrow('Estado invalido', { estado: dados.estado, usuario_id: dados.usuario_id });
    }
    if (!dados.tipo_deficiencia) {
      throw this.logAndThrow('Tipo de deficiencia e obrigatorio', { usuario_id: dados.usuario_id });
    }
    if (!dados.grau_deficiencia) {
      throw this.logAndThrow('Grau da deficiencia e obrigatorio', { usuario_id: dados.usuario_id });
    }
    if (!validarCID(dados.cid)) {
      throw this.logAndThrow('CID invalido', { cid: dados.cid, usuario_id: dados.usuario_id });
    }
    if (!dados.numero_laudo || typeof dados.numero_laudo !== 'string' || dados.numero_laudo.trim().length < 3) {
      throw this.logAndThrow('Numero do laudo invalido', { numero_laudo: dados.numero_laudo, usuario_id: dados.usuario_id });
    }
    if (!validarData(dados.data_laudo)) {
      throw this.logAndThrow('Data do laudo invalida', { data_laudo: dados.data_laudo, usuario_id: dados.usuario_id });
    }
    if (!validarNome(dados.nome_medico)) {
      throw this.logAndThrow('Nome do medico invalido', { nome_medico: dados.nome_medico, usuario_id: dados.usuario_id });
    }
    if (!validarCRM(dados.crm_medico)) {
      throw this.logAndThrow('CRM do medico invalido', { crm_medico: dados.crm_medico, usuario_id: dados.usuario_id });
    }
    if (dados.nome_responsavel && !validarNome(dados.nome_responsavel)) {
      throw this.logAndThrow('Nome do responsavel invalido', { nome_responsavel: dados.nome_responsavel, usuario_id: dados.usuario_id });
    }
    if (dados.cpf_responsavel && !validarCPF(dados.cpf_responsavel)) {
      throw this.logAndThrow('CPF do responsavel invalido', { cpf_responsavel: dados.cpf_responsavel, usuario_id: dados.usuario_id });
    }
    if ((dados.nome_responsavel && !dados.cpf_responsavel) || (dados.cpf_responsavel && !dados.nome_responsavel)) {
      throw this.logAndThrow('Nome e CPF do responsavel devem ser preenchidos juntos', { nome_responsavel: dados.nome_responsavel, cpf_responsavel: dados.cpf_responsavel, usuario_id: dados.usuario_id });
    }
  }

  static async atualizarCarteira(usuario_id, dados) {
    const carteiraExistente = await CarteiraRepository.buscarPorUsuarioId(usuario_id);
    if (!carteiraExistente) {
      const erro = new Error('Carteira nao encontrada para edicao');
      erro.status = 404;
      throw erro;
    }

    const dadosAtualizados = {
      ...carteiraExistente,
      ...dados,
      usuario_id,
      numero_carteira: carteiraExistente.numero_carteira,
      foto: dados.foto || carteiraExistente.foto,
      laudo_url: dados.laudo_url || carteiraExistente.laudo_url
    };

    this.validarDadosCarteira(dadosAtualizados);

    const cpfExistente = await CarteiraRepository.buscarPorCpf(dadosAtualizados.cpf);
    if (cpfExistente && Number(cpfExistente.usuario_id) !== Number(usuario_id)) {
      const erro = new Error('CPF ja cadastrado em outra carteira');
      erro.status = 409;
      throw erro;
    }

    const atualizado = await CarteiraRepository.atualizarPorUsuarioId(usuario_id, dadosAtualizados);
    if (!atualizado) {
      const erro = new Error('Carteira nao encontrada para edicao');
      erro.status = 404;
      throw erro;
    }

    return await CarteiraRepository.buscarPorUsuarioId(usuario_id);
  }

  static async buscarPorUsuario(usuario_id) {
    return await CarteiraRepository.buscarPorUsuarioId(usuario_id);
  }

  static async buscarPorNumero(numeroCarteira) {
    if (!numeroCarteira || typeof numeroCarteira !== 'string') {
      throw new Error('Código da carteira inválido');
    }
    return await CarteiraRepository.buscarPorNumeroCarteira(numeroCarteira.trim());
  }
  static async verificarCpf(cpf) {
    if (!validarCPF(cpf)) {
      throw this.logAndThrow('CPF invalido', { cpf });
    }

    const carteira = await CarteiraRepository.buscarPorCpf(cpf);
    return { existe: !!carteira };
  }
}
