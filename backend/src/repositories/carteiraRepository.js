import pool from '../config/database.js';

export class CarteiraRepository {
  static async criar(dados) {
    try {
      console.log("ok")
      const conexao = await pool.getConnection();
      console.log("con", conexao)
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
      console.log("conexao feita")
      const [resultado] = await conexao.execute(
        `INSERT INTO carteiras (usuario_id, tipo, numero_carteira, descricao, ativa, data_nascimento, endereco, cidade, estado, telefone, tipo_deficiencia, grau_deficiencia, cid, necessita_acompanhante, numero_laudo, data_laudo, nome_medico, crm_medico, foto, laudo_url, tipo_sanguineo, contato_emergencia, alergias, medicacoes, comunicacao, nome_responsavel, cpf_responsavel, vinculo_responsavel, nome, cpf, rg, sexo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        valores
      );
      console.log("vdd ",resultado);
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

  static async buscarPorCpf(cpf) {
    if (!cpf) return null;
    try {
      const conexao = await pool.getConnection();
      const [resultado] = await conexao.execute(
        'SELECT * FROM carteiras WHERE cpf = ? LIMIT 1',
        [cpf.replace(/\D/g, '')]
      );
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar carteira por CPF: ' + erro.message);
    }
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
      
      // Se ainda não encontrou, tentar buscar por codigo_verificacao
      if (resultado.length === 0) {
        [resultado] = await conexao.execute(
          'SELECT * FROM carteiras WHERE codigo_verificacao = ? AND ativa = 1 LIMIT 1',
          [numeroCarteira]
        );
      }
      
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar carteira por código: ' + erro.message);
    }
  }
}