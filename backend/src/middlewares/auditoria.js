import pool from '../config/database.js';

export const registrarAuditoria = async (usuario_id, acao, tabela, registro_id, valores_antigos, valores_novos, endereco_ip, user_agent) => {
  try {
    const conexao = await pool.getConnection();
    
    await conexao.execute(
      `INSERT INTO auditoria (usuario_id, acao, tabela, registro_id, valores_antigos, valores_novos, endereco_ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        acao,
        tabela,
        registro_id,
        valores_antigos ? JSON.stringify(valores_antigos) : null,
        valores_novos ? JSON.stringify(valores_novos) : null,
        endereco_ip,
        user_agent
      ]
    );

    conexao.release();
  } catch (erro) {
    console.error('Erro ao registrar auditoria:', erro);
  }
};
