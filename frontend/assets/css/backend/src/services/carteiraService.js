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
  validarCEP,
  validarSexo
} from '../utils/validacao.js';

export class CarteiraService {
  static async criarCarteira(dados) {
    if (!validarNome(dados.nome)) {
      throw new Error('Nome do titular inválido');
    }

    if (!validarData(dados.data_nascimento)) {
      throw new Error('Data de nascimento inválida');
    }

    if (!validarSexo(dados.sexo)) {
      throw new Error('Sexo inválido');
    }

    if (!validarCPF(dados.cpf)) {
      throw new Error('CPF inválido');
    }

    if (!validarRG(dados.rg)) {
      throw new Error('RG inválido');
    }

    if (!validarTelefone(dados.telefone)) {
      throw new Error('Telefone inválido');
    }

    if (!validarCidade(dados.cidade)) {
      throw new Error('Cidade inválida');
    }

    if (!validarEstado(dados.estado)) {
      throw new Error('Estado inválido');
    }

    if (!dados.tipo_deficiencia) {
      throw new Error('Tipo de deficiência é obrigatório');
    }

    if (!dados.grau_deficiencia) {
      throw new Error('Grau da deficiência é obrigatório');
    }

    if (!validarCID(dados.cid)) {
      throw new Error('CID inválido');
    }

    if (!dados.numero_laudo || typeof dados.numero_laudo !== 'string' || dados.numero_laudo.trim().length < 3) {
      throw new Error('Número do laudo inválido');
    }

    if (!validarData(dados.data_laudo)) {
      throw new Error('Data do laudo inválida');
    }

    if (!validarNome(dados.nome_medico)) {
      throw new Error('Nome do médico inválido');
    }

    if (!validarCRM(dados.crm_medico)) {
      throw new Error('CRM do médico inválido');
    }

    if (dados.cep && !validarCEP(dados.cep)) {
      throw new Error('CEP inválido');
    }

    if (dados.nome_responsavel && !validarNome(dados.nome_responsavel)) {
      throw new Error('Nome do responsável inválido');
    }

    if (dados.cpf_responsavel && !validarCPF(dados.cpf_responsavel)) {
      throw new Error('CPF do responsável inválido');
    }

    if ((dados.nome_responsavel && !dados.cpf_responsavel) || (dados.cpf_responsavel && !dados.nome_responsavel)) {
      throw new Error('Nome e CPF do responsável devem ser preenchidos juntos');
    }

    const carteiraExistente = await CarteiraRepository.buscarPorUsuarioId(dados.usuario_id);
    if (carteiraExistente) {
      const erro = new Error('Usuário já possui carteira cadastrada');
      erro.status = 409;
      throw erro;
    }

    const cpfExistente = await CarteiraRepository.buscarPorCpf(dados.cpf);
    if (cpfExistente) {
      const erro = new Error('CPF já cadastrado em outra carteira');
      erro.status = 409;
      throw erro;
    }

    const carteiraId = await CarteiraRepository.criar(dados);
    return { id: carteiraId, ...dados };
  }

  static async buscarPorUsuario(usuario_id) {
    return await CarteiraRepository.buscarPorUsuarioId(usuario_id);
  }
}
