import pool from '../config/database.js';

export class AdminRepository {
  static async listarUsuarios() {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `SELECT id, nome, email, cpf, telefone, role, ativo, criado_em
         FROM usuarios
         ORDER BY criado_em DESC`
      );
      conexao.release();
      return resultado;
    } catch (erro) {
      throw new Error('Erro ao listar usuários: ' + erro.message);
    }
  }

  static async listarCarteiras() {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `SELECT c.id,
                c.usuario_id,
                u.nome AS usuario_nome,
                u.email AS usuario_email,
                c.tipo,
                c.numero_carteira,
                c.ativa,
                c.criada_em,
                c.data_nascimento,
                c.endereco,
                c.cidade,
                c.estado,
                c.cep,
                c.telefone,
                c.tipo_deficiencia,
                c.grau_deficiencia,
                c.cid,
                c.numero_laudo,
                c.laudo_url
         FROM carteiras c
         LEFT JOIN usuarios u ON c.usuario_id = u.id
         ORDER BY c.criada_em DESC`
      );
      conexao.release();
      return resultado;
    } catch (erro) {
      throw new Error('Erro ao listar carteiras: ' + erro.message);
    }
  }

  static async atualizarUsuarioStatus(id, ativa) {
    try {
      const conexao = await pool.getConnection();
      await conexao.execute(
        'UPDATE usuarios SET ativo = ? WHERE id = ?',
        [ativa ? 1 : 0, id]
      );
      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao atualizar status do usuário: ' + erro.message);
    }
  }

  static async atualizarCarteiraStatus(id, ativa) {
    try {
      const conexao = await pool.getConnection();
      await conexao.execute(
        'UPDATE carteiras SET ativa = ? WHERE id = ?',
        [ativa ? 1 : 0, id]
      );
      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao atualizar status da carteira: ' + erro.message);
    }
  }
}
