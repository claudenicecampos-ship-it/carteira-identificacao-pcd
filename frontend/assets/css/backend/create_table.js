import mysql from 'mysql2/promise';

(async () => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'usbw',
        database: 'carteira'
    });

    const sql = `CREATE TABLE IF NOT EXISTS carteiras (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        tipo VARCHAR(50) NOT NULL,
        numero_carteira VARCHAR(100) UNIQUE NOT NULL,
        descricao TEXT,
        ativa BOOLEAN DEFAULT TRUE,
        data_nascimento DATE,
        endereco TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(10),
        telefone VARCHAR(15),
        tipo_deficiencia VARCHAR(50),
        grau_deficiencia VARCHAR(50),
        cid VARCHAR(20),
        necessita_acompanhante BOOLEAN DEFAULT FALSE,
        numero_laudo VARCHAR(100),
        data_laudo DATE,
        nome_medico VARCHAR(255),
        crm_medico VARCHAR(100),
        foto LONGTEXT,
        laudo_url LONGTEXT,
        tipo_sanguineo VARCHAR(5),
        contato_emergencia VARCHAR(255),
        alergias TEXT,
        medicacoes TEXT,
        comunicacao VARCHAR(100),
        nome_responsavel VARCHAR(255),
        cpf_responsavel VARCHAR(14),
        vinculo_responsavel VARCHAR(100),
        nome VARCHAR(255),
        cpf VARCHAR(11),
        rg VARCHAR(20),
        sexo VARCHAR(10),
        criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_ativa (ativa)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;

    await conn.execute(sql);
    console.log('Table created');
    await conn.end();
})();