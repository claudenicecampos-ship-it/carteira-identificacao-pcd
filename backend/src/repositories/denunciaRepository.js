import pool from '../config/database.js';

export class DenunciaRepository {
  static async criar(dados) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `INSERT INTO denuncias (usuario_id, titulo, descricao, tipo_denuncia, status, prioridade, localidade, evidencia_url)
         VALUES (?, ?, ?, ?, 'pendente', ?, ?, ?)`,
        [
          dados.usuario_id || null,
          dados.titulo,
          dados.descricao,
          dados.tipo_denuncia,
          dados.prioridade || 'normal',
          dados.localidade || null,
          dados.evidencia_url || null
        ]
      );
      conexao.release();
      return resultado.insertId;
    } catch (erro) {
      throw new Error('Erro ao criar denúncia: ' + erro.message);
    }
  }
}
