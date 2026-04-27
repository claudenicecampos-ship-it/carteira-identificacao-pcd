import mysql from 'mysql2/promise';

async function verificarECorrigir() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'usbw',
    database: 'carteira'
  });

  try {
    console.log('🔍 Analisando bloqueios...\n');

    const [bloqueios] = await conn.execute('SELECT * FROM login_bloqueios');
    
    if (bloqueios.length === 0) {
      console.log('✅ Nenhum bloqueio ativo no banco. Tudo limpo!');
      return;
    }

    bloqueios.forEach(b => {
      const agora = new Date();
      const bloqueadoAte = new Date(b.bloqueado_ate);
      const diffMs = bloqueadoAte.getTime() - agora.getTime();
      const diffMinutos = Math.floor(diffMs / 60000);
      const diffSegundos = Math.floor((diffMs % 60000) / 1000);
      
      console.log(`📧 Email: ${b.email}`);
      console.log(`   Bloqueado até: ${b.bloqueado_ate}`);
      console.log(`   Tempo restante: ${diffMinutos}m ${diffSegundos}s`);
      console.log('');
    });

    // Se houver bloqueio, limpar tudo
    if (bloqueios.length > 0) {
      console.log('🗑️  Limpando todos os bloqueios...');
      await conn.execute('TRUNCATE TABLE login_bloqueios');
      console.log('✅ Bloqueios foram deletados!');
    }

  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await conn.end();
  }
}

verificarECorrigir();
