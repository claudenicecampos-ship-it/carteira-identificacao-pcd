import mysql from 'mysql2/promise';

async function limparBloqueios() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'usbw',
    database: 'carteira'
  });

  try {
    console.log('🗑️  Limpando TODA a tabela login_bloqueios...\n');

    // Deletar todos os registros
    const [resultado] = await conn.execute(
      `TRUNCATE TABLE login_bloqueios`
    );

    console.log('✅ Tabela login_bloqueios foi completamente limpa!');
    
    console.log('\n🎉 Todos os bloqueios foram removidos!');

  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await conn.end();
  }
}

limparBloqueios();
