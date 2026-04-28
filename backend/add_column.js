import mysql from 'mysql2/promise';

(async () => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '910108Pm*',
        database: 'carteira',
        port: 3307
    });

    try {
        await conn.execute(`ALTER TABLE carteiras ADD COLUMN codigo_verificacao VARCHAR(100) UNIQUE AFTER numero_carteira`);
        console.log('Coluna codigo_verificacao adicionada com sucesso!');
    } catch (erro) {
        console.log('Erro ao adicionar coluna (pode já existir):', erro.message);
    }

    await conn.end();
})();