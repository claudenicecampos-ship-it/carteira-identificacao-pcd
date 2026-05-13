import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

export class CarteiraRepository {
  static async criar(dados) {
    try {
      logger.info('Iniciando repositório de criação de carteira', {
        usuario_id: dados.usuario_id,
        numero_carteira: dados.numero_carteira,
        cpf: dados.cpf,
        nome: dados.nome,
        tem_foto: !!dados.foto,
        tem_laudo: !!dados.laudo_url
      });
      const conexao = await pool.getConnection();
      logger.info('Conexão obtida para criar carteira');
      const valores = [
        dados.usuario_id || null,
        dados.tipo || null,
        dados.numero_carteira,
        dados.descricao || null,
        1, // ativa
        dados.data_nascimento || null,
        dados.endereco || null,
        dados.cidade || null,
        dados.estado || null,
        dados.telefone || null,
        dados.tipo_deficiencia || null,
        dados.grau_deficiencia || null,
        dados.cid || null,
        dados.necessita_acompanhante ? 1 : 0,
        dados.numero_laudo || null,
        dados.data_laudo || null,
        dados.nome_medico || null,
        dados.crm_medico || null,
        dados.foto || null,
        dados.laudo_url || null,
        dados.tipo_sanguineo || null,
        dados.contato_emergencia || null,
        dados.alergias || null,
        dados.medicacoes || null,
        dados.comunicacao || null,
        dados.nome_responsavel || null,
        dados.cpf_responsavel || null,
        dados.vinculo_responsavel || null,
        dados.nome || null,
        dados.cpf || null,
        dados.rg || null,
        dados.sexo || null
      ].map(v => v === undefined ? null : v); // Converte undefined para null
      const [resultado] = await conexao.execute(
        `INSERT INTO carteiras (usuario_id, tipo, numero_carteira, descricao, ativa, data_nascimento, endereco, cidade, estado, telefone, tipo_deficiencia, grau_deficiencia, cid, necessita_acompanhante, numero_laudo, data_laudo, nome_medico, crm_medico, foto, laudo_url, tipo_sanguineo, contato_emergencia, alergias, medicacoes, comunicacao, nome_responsavel, cpf_responsavel, vinculo_responsavel, nome, cpf, rg, sexo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        valores
      );
      logger.info('Insert de carteira executado com sucesso', { insertId: resultado.insertId });
      conexao.release();
      return resultado.insertId;
    } catch (erro) {
      logger.error('Erro ao criar carteira no repositório', { mensagem: erro.message, usuario_id: dados.usuario_id, numero_carteira: dados.numero_carteira, stack: erro.stack });
      throw new Error('Erro ao criar carteira: ' + erro.message);
    }
  }

  static async buscarPorUsuarioId(usuario_id) {
    logger.info('Verificando carteira existente por usuário', { usuario_id });
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT * FROM carteiras WHERE usuario_id = ? AND ativa = 1 LIMIT 1',
        [usuario_id]
      );
      conexao.release();
      if (resultado.length > 0) {
        logger.info('Carteira existente encontrada para usuário', { usuario_id, carteira_id: resultado[0].id });
      } else {
        logger.info('Nenhuma carteira ativa encontrada para usuário', { usuario_id });
      }
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      logger.error('Erro ao buscar carteira por usuário', { mensagem: erro.message, usuario_id, stack: erro.stack });
      throw new Error('Erro ao buscar carteira: ' + erro.message);
    }
  }

  static async buscarPorCpf(cpf) {
    if (!cpf) {
      logger.info('Busca por CPF ignorada porque CPF não foi informado');
      return null;
    }

    logger.info('Verificando carteira existente por CPF', { cpf });
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT * FROM carteiras WHERE cpf = ? LIMIT 1',
        [cpf.replace(/\D/g, '')]
      );
      conexao.release();
      if (resultado.length > 0) {
        logger.info('CPF já cadastrado em carteira existente', { cpf, carteira_id: resultado[0].id });
      } else {
        logger.info('CPF não encontrado em carteira existente', { cpf });
      }
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      logger.error('Erro ao buscar carteira por CPF', { mensagem: erro.message, cpf, stack: erro.stack });
      throw new Error('Erro ao buscar carteira por CPF: ' + erro.message);
    }
  }

  static async atualizarPorUsuarioId(usuario_id, dados) {
    try {
      logger.info('Atualizando carteira por usuario', {
        usuario_id,
        cpf: dados.cpf,
        numero_carteira: dados.numero_carteira,
        tem_foto: !!dados.foto,
        tem_laudo: !!dados.laudo_url
      });

      const conexao = await pool.getConnection();
      const valores = [
        dados.tipo || null,
        dados.numero_carteira,
        dados.descricao || null,
        dados.data_nascimento || null,
        dados.endereco || null,
        dados.cidade || null,
        dados.estado || null,
        dados.telefone || null,
        dados.tipo_deficiencia || null,
        dados.grau_deficiencia || null,
        dados.cid || null,
        dados.necessita_acompanhante ? 1 : 0,
        dados.numero_laudo || null,
        dados.data_laudo || null,
        dados.nome_medico || null,
        dados.crm_medico || null,
        dados.foto || null,
        dados.laudo_url || null,
        dados.tipo_sanguineo || null,
        dados.contato_emergencia || null,
        dados.alergias || null,
        dados.medicacoes || null,
        dados.comunicacao || null,
        dados.nome_responsavel || null,
        dados.cpf_responsavel || null,
        dados.vinculo_responsavel || null,
        dados.nome || null,
        dados.cpf || null,
        dados.rg || null,
        dados.sexo || null,
        usuario_id
      ].map(v => v === undefined ? null : v);

      const [resultado] = await conexao.execute(
        `UPDATE carteiras
         SET tipo = ?, numero_carteira = ?, descricao = ?, data_nascimento = ?, endereco = ?, cidade = ?, estado = ?, telefone = ?, tipo_deficiencia = ?, grau_deficiencia = ?, cid = ?, necessita_acompanhante = ?, numero_laudo = ?, data_laudo = ?, nome_medico = ?, crm_medico = ?, foto = ?, laudo_url = ?, tipo_sanguineo = ?, contato_emergencia = ?, alergias = ?, medicacoes = ?, comunicacao = ?, nome_responsavel = ?, cpf_responsavel = ?, vinculo_responsavel = ?, nome = ?, cpf = ?, rg = ?, sexo = ?
         WHERE usuario_id = ? AND ativa = 1`,
        valores
      );
      conexao.release();
      return resultado.affectedRows > 0;
    } catch (erro) {
      logger.error('Erro ao atualizar carteira no repositorio', { mensagem: erro.message, usuario_id, stack: erro.stack });
      throw new Error('Erro ao atualizar carteira: ' + erro.message);
    }
  }

  static async cpfExiste(cpf) {
    const carteira = await this.buscarPorCpf(cpf);
    return !!carteira;
  }

  static async buscarPorNumeroCarteira(numeroCarteira) {
    if (!numeroCarteira) return null;
    try {
      const conexao = await pool.getConnection();
      
      // Tentar buscar por numero_carteira
      let [resultado] = await conexao.execute(
        'SELECT * FROM carteiras WHERE numero_carteira = ? AND ativa = 1 LIMIT 1',
        [numeroCarteira]
      );
      
      // Se não encontrou, tentar buscar por id (se for número)
      if (resultado.length === 0) {
        const id = parseInt(numeroCarteira, 10);
        if (!isNaN(id)) {
          [resultado] = await conexao.execute(
            'SELECT * FROM carteiras WHERE id = ? AND ativa = 1 LIMIT 1',
            [id]
          );
        }
      }
      
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar carteira por código: ' + erro.message);
    }
  }
}
