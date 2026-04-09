import pool from '../config/database.js';

export class CarteiraRepository {
  static async criar(dados) {
    try {
      const conexao = await pool.getConnection();
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
        dados.cep || null,
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
        `INSERT INTO carteiras VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        valores
      );
      conexao.release();
      return resultado.insertId;
    } catch (erro) {
      throw new Error('Erro ao criar carteira: ' + erro.message);
    }
  }

  static async buscarPorUsuarioId(usuario_id) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT * FROM carteiras WHERE usuario_id = ? AND ativa = 1 LIMIT 1',
        [usuario_id]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar carteira: ' + erro.message);
    }
  }
}