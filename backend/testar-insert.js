import mysql from 'mysql2/promise';

async function testarInsert() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'usbw',
            database: 'carteira'
        });

        console.log('Testando INSERT com TODOS os 32 campos...');
        const [result] = await conn.execute(
            `INSERT INTO carteiras (
               usuario_id, tipo, numero_carteira, descricao,
               data_nascimento, endereco, cidade, estado, telefone,
               tipo_deficiencia, grau_deficiencia, cid, necessita_acompanhante,
               numero_laudo, data_laudo, nome_medico, crm_medico, foto, laudo_url,
               tipo_sanguineo, contato_emergencia, alergias, medicacoes,
               comunicacao, nome_responsavel, cpf_responsavel, vinculo_responsavel,
               nome, cpf, rg, sexo
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                1, 'PCD', 'PCD017', 'Carteira de teste',
                '1990-01-01', 'Rua Teste, 123', 'São Paulo', 'SP', '01234567', '11999999999',
                'Física', 'Moderada', 'M54.2', 0,
                'LAUDO001', '2023-01-01', 'Dr. Silva', '12345', null, null,
                'O+', null, null, null,
                null, null, null, null,
                'João Silva', '12345678909', '12345678', 'M'
            ]
        );
        console.log('✅ Inserção bem-sucedida, ID:', result.insertId);

    } catch (erro) {
        console.error('❌ Erro na inserção:', erro.message);
    } finally {
        if (conn) await conn.end();
    }
}

testarInsert();