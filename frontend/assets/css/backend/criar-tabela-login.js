import mysql from 'mysql2/promise';

async function criarTabelaLoginBloqueios() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'usbw',
            database: 'carteira'
        });

        const sql = `
            CREATE TABLE IF NOT EXISTS login_bloqueios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                tentativas INT DEFAULT 0,
                bloqueado_ate TIMESTAMP NULL,
                codigo_desbloqueio VARCHAR(191),
                ultima_tentativa TIMESTAMP NULL,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
        `;

        await connection.execute(sql);
        console.log('✅ Tabela login_bloqueios criada com sucesso!');

    } catch (erro) {
        console.error('❌ Erro ao criar tabela:', erro);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

criarTabelaLoginBloqueios();