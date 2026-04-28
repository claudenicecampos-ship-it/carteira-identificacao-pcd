import mysql from 'mysql2/promise';

(async () => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'usbw',
        database: 'carteira'
    });

    await conn.execute(`CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(191) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        cpf VARCHAR(11) UNIQUE NOT NULL,
        telefone VARCHAR(15),
        data_nascimento DATE,
        qr_code VARCHAR(191) UNIQUE,
        role VARCHAR(20) DEFAULT 'user',
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_cpf (cpf),
        INDEX idx_ativa (ativo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`);

    console.log('usuarios table created');
    await conn.end();
})();