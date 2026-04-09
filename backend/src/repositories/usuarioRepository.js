import pool from '../config/database.js';

export class UsuarioRepository {
  /**
   * Busca usuário por email
   */
  static async buscarPorEmail(email) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT id, nome, email, senha, cpf, telefone, data_nascimento, qr_code, role, ativo, criado_em FROM usuarios WHERE email = ?',
        [email]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar usuário por email: ' + erro.message);
    }
  }

  /**
   * Busca usuário por role
   */
  static async buscarPorRole(role) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT id, nome, email, cpf, telefone, data_nascimento, qr_code, role, ativo, criado_em FROM usuarios WHERE role = ? LIMIT 1',
        [role]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar usuário por role: ' + erro.message);
    }
  }

  /**
   * Busca usuário por ID
   */
  static async buscarPorId(id) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT id, nome, email, cpf, telefone, data_nascimento, qr_code, role, ativo, criado_em FROM usuarios WHERE id = ?',
        [id]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar usuário por ID: ' + erro.message);
    }
  }

  /**
   * Cria novo usuário
   */
  static async criar(dados) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `INSERT INTO usuarios (nome, email, senha, cpf, telefone, data_nascimento, qr_code, role, ativo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dados.nome,
          dados.email,
          dados.senha,
          dados.cpf,
          dados.telefone || null,
          dados.data_nascimento || null,
          dados.qr_code || null,
          dados.role || 'user',
          true
        ]
      );
      conexao.release();
      return resultado.insertId;
    } catch (erro) {
      throw new Error('Erro ao criar usuário: ' + erro.message);
    }
  }

  /**
   * Atualiza usuário
   */
  static async atualizar(id, dados) {
    try {
      const conexao = await pool.getConnection();
      const campos = [];
      const valores = [];

      Object.keys(dados).forEach(chave => {
        campos.push(`${chave} = ?`);
        valores.push(dados[chave]);
      });

      valores.push(id);

      await conexao.execute(
        `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
        valores
      );
      conexao.release();
      return true;
    } catch (erro) {
      throw new Error('Erro ao atualizar usuário: ' + erro.message);
    }
  }

  /**
   * Verifica se email já existe
   */
  static async emailExiste(email) {
    const usuario = await this.buscarPorEmail(email);
    return usuario !== null;
  }

  /**
   * Verifica se CPF já existe
   */
  static async cpfExiste(cpf) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT id FROM usuarios WHERE cpf = ?',
        [cpf]
      );
      conexao.release();
      return resultado.length > 0;
    } catch (erro) {
      throw new Error('Erro ao verificar CPF: ' + erro.message);
    }
  }
}
