import mysql from 'mysql2/promise';

async function testarConexao() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'usbw',
            database: 'carteira'
        });

        const [rows] = await conn.execute('SELECT id, nome, cpf, rg, sexo, numero_carteira FROM carteiras WHERE usuario_id = 1');
        console.log('Carteiras do usuário 1:', rows);

        await conn.end();
    } catch (erro) {
        console.error('Erro:', erro.message);
    }
}

testarConexao();