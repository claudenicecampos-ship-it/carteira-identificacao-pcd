import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function resetarBloqueio() {
  let conexao;
  try {
    conexao = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('🔓 Resetando bloqueios de login...\n');

    // Mostrar bloqueios atuais
    const [bloqueios] = await conexao.execute(
      'SELECT email, tentativas, bloqueado_ate FROM login_bloqueios WHERE bloqueado_ate IS NOT NULL'
    );

    if (bloqueios.length > 0) {
      console.log('📋 Bloqueios encontrados:');
      bloqueios.forEach(b => {
        console.log(`  - Email: ${b.email}`);
        console.log(`    Tentativas: ${b.tentativas}`);
        console.log(`    Bloqueado até: ${b.bloqueado_ate}\n`);
      });
    }

    // Resetar todos os bloqueios
    const [resultado] = await conexao.execute(
      `UPDATE login_bloqueios 
       SET tentativas = 0, 
           bloqueado_ate = NULL, 
           codigo_desbloqueio = NULL, 
           ultima_tentativa = CURRENT_TIMESTAMP,
           atualizado_em = CURRENT_TIMESTAMP 
       WHERE bloqueado_ate IS NOT NULL`
    );

    console.log(`✅ ${resultado.affectedRows} bloqueio(s) resetado(s) com sucesso!\n`);
    console.log('🎉 Agora você pode fazer login normalmente com un bloqueio de apenas 5 minutos em caso de erro.');

  } catch (erro) {
    console.error('❌ Erro ao resetar bloqueios:', erro.message);
    process.exit(1);
  } finally {
    if (conexao) await conexao.end();
  }
}

resetarBloqueio();
