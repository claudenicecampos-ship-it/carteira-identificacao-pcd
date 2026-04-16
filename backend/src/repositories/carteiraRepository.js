import pool from '../config/database.js';

export class CarteiraRepository {
  static async criar(dados) {
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        `INSERT INTO carteiras (
           usuario_id, tipo, numero_carteira, descricao, ativa,
           data_nascimento, endereco, cidade, estado, cep, telefone,
           tipo_deficiencia, grau_deficiencia, cid, necessita_acompanhante,
           numero_laudo, data_laudo, nome_medico, crm_medico, foto, laudo_url,
           tipo_sanguineo, contato_emergencia, alergias, medicacoes,
           comunicacao, nome_responsavel, cpf_responsavel, vinculo_responsavel
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dados.usuario_id || null,
          dados.tipo || null,
          dados.numero_carteira,
          dados.descricao || null,
          dados.ativa === false ? 0 : 1,
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
          dados.vinculo_responsavel || null
        ]
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
        'SELECT * FROM carteiras WHERE usuario_id = ? AND (ativa = 1 OR ativa IS NULL) LIMIT 1',
        [usuario_id]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar carteira: ' + erro.message);
    }
  }
}