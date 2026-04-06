import pool from '../config/database.js';

export class DenunciaRepository {
  static async criar(dados) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `INSERT INTO denuncias (usuario_id, titulo, descricao, tipo_denuncia, status, prioridade, localidade, endereco, evidencia_url, resolvida_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dados.usuario_id || null,
          dados.titulo,
          dados.descricao,
          dados.tipo_denuncia,
          dados.status || 'pendente',
          dados.prioridade || 'normal',
          dados.localidade || null,
          dados.endereco || null,
          dados.evidencia_url || null,
          dados.resolvida_em || null
        ]
      );
      conexao.release();
      return resultado.insertId;
    } catch (erro) {
      throw new Error('Erro ao criar denúncia: ' + erro.message);
    }
  }

  static async listarTodas() {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT * FROM denuncias ORDER BY criada_em DESC'
      );
      conexao.release();
      return resultado;
    } catch (erro) {
      throw new Error('Erro ao listar denúncias: ' + erro.message);
    }
  }

  static async buscarPorId(id) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT * FROM denuncias WHERE id = ?',
        [id]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar denúncia por ID: ' + erro.message);
    }
  }

  static async marcarResolvida(id) {
    try {
      const conexao = await pool.getConnection();
      await conexao.execute(
        'UPDATE denuncias SET status = ?, resolvida_em = ? WHERE id = ?',
        ['resolvida', new Date(), id]
      );
      conexao.release();
    } catch (erro) {
      throw new Error('Erro ao marcar denúncia como resolvida: ' + erro.message);
    }
  }
}

