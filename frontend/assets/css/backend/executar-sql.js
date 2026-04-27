import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executarSQL() {
    let connection;

    try {
        // Conectar ao MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'usbw',
            multipleStatements: true
        });

        // Ler o arquivo SQL
        const sqlFile = path.join(__dirname, '..', 'database', 'carteira_database.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Executar o SQL
        console.log('Executando script SQL...');
        await connection.execute(sql);
        console.log('✅ Script SQL executado com sucesso!');

    } catch (erro) {
        console.error('❌ Erro ao executar SQL:', erro);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

executarSQL();