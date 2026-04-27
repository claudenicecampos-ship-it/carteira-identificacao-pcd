import pool from '../config/database.js';

export class SessaoRepository {
  /**
   * Cria nova sessão
   */
  static async criar(usuario_id, token_refresh, endereco_ip, user_agent, expira_em) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `INSERT INTO sessoes (usuario_id, token_refresh, endereco_ip, user_agent, expira_em, ativa)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [usuario_id, token_refresh, endereco_ip, user_agent, expira_em]
      );
      conexao.release();
      return resultado.insertId;
    } catch (erro) {
      throw new Error('Erro ao criar sessão: ' + erro.message);
    }
  }

  /**
   * Busca sessão ativa por token
   */
  static async buscarPorToken(token_refresh) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `SELECT * FROM sessoes 
         WHERE token_refresh = ? AND ativa = 1 AND expira_em > NOW()`,
        [token_refresh]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar sessão: ' + erro.message);
    }
  }

  /**
   * Encerra todas as sessões do usuário
   */
  static async encerrarTodasSessoes(usuario_id) {
    try {
      const conexao = await pool.getConnection();
      await conexao.execute(
        'UPDATE sessoes SET ativa = 0 WHERE usuario_id = ?',
        [usuario_id]
      );
      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao encerrar sessões: ' + erro.message);
    }
  }

  /**
   * Atualiza último acesso
   */
  static async atualizarUltimoAcesso(id) {
    try {
      const conexao = await pool.getConnection();
      await conexao.execute(
        'UPDATE sessoes SET ultimo_acesso = NOW() WHERE id = ?',
        [id]
      );
      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao atualizar último acesso: ' + erro.message);
    }
  }
}
