import mysql from 'mysql2/promise';

async function criarTabelaSessoes() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'usbw',
            database: 'carteira'
        });

        const sql = `
            CREATE TABLE IF NOT EXISTS sessoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                token_refresh VARCHAR(191) UNIQUE NOT NULL,
                endereco_ip VARCHAR(45),
                user_agent TEXT,
                ativa BOOLEAN DEFAULT TRUE,
                criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expira_em TIMESTAMP NOT NULL,
                ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                INDEX idx_usuario_id (usuario_id),
                INDEX idx_token (token_refresh),
                INDEX idx_ativa (ativa),
                INDEX idx_expira_em (expira_em)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
        `;

        await connection.execute(sql);
        console.log('✅ Tabela sessoes criada com sucesso!');

    } catch (erro) {
        console.error('❌ Erro ao criar tabela:', erro);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

criarTabelaSessoes();