import mysql from 'mysql2/promise';

async function resetarTodosBloqueios() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'usbw',
    database: 'carteira'
  });

  try {
    console.log('🔓 Resetando TODOS os bloqueios de login...\n');

    // Resetar completamente (DELETE e recriar com valores zerados)
    const [resultado1] = await conn.execute(
      `DELETE FROM login_bloqueios WHERE email = 'alex@gmail.com'`
    );

    const [resultado2] = await conn.execute(
      `INSERT INTO login_bloqueios (email, tentativas, bloqueado_ate, codigo_desbloqueio, ultima_tentativa)
       VALUES ('alex@gmail.com', 0, NULL, NULL, CURRENT_TIMESTAMP)`
    );

    console.log('✅ alex@gmail.com foi completamente resetado!');
    
    // Verificar estado final
    const [rows] = await conn.execute('SELECT * FROM login_bloqueios WHERE email = ?', ['alex@gmail.com']);
    console.log('\n📋 Estado atual:', rows[0]);
    
    console.log('\n🎉 Agora você pode fazer login sem bloqueios!');

  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await conn.end();
  }
}

resetarTodosBloqueios();
