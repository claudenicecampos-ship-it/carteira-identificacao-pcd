import pool from '../config/database.js';

export class RecuperacaoSenhaRepository {
  /**
   * Cria token de recuperação de senha
   */
  static async criar(usuario_id, token, expira_em) {
    try {
      const conexao = await pool.getConnection();
      
      // Invalidar tokens anteriores
      await conexao.execute(
        'UPDATE recuperacao_senha SET utilizado = 1 WHERE usuario_id = ? AND utilizado = 0',
        [usuario_id]
      );

      const [resultado] = await conexao.execute(
        `INSERT INTO recuperacao_senha (usuario_id, token, expira_em)
         VALUES (?, ?, ?)`,
        [usuario_id, token, expira_em]
      );
      
      conexao.release();
      return resultado.insertId;
    } catch (erro) {
      throw new Error('Erro ao criar token de recuperação: ' + erro.message);
    }
  }

  /**
   * Busca por token
   */
  static async buscarPorToken(token) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `SELECT * FROM recuperacao_senha 
         WHERE token = ? AND utilizado = 0 AND expira_em > NOW()`,
        [token]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar token: ' + erro.message);
    }
  }

  /**
   * Marca token como utilizado
   */
  static async marcarComoUtilizado(id) {
    try {
      const conexao = await pool.getConnection();
      await conexao.execute(
        'UPDATE recuperacao_senha SET utilizado = 1 WHERE id = ?',
        [id]
      );
      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao marcar token como utilizado: ' + erro.message);
    }
  }
}
