import mysql from 'mysql2/promise';

async function verificarBloqueios() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'usbw',
    database: 'carteira'
  });

  const [rows] = await conn.execute('SELECT * FROM login_bloqueios');
  console.log('Bloqueios no banco:\n', rows);
  await conn.end();
}

verificarBloqueios().catch(console.error);
