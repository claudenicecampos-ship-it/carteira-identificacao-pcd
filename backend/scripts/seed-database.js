/**
 * Script de Seeding do Banco de Dados
 * Popula o banco com dados de exemplo para testes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../database.db');

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('❌ Erro ao abrir banco de dados:', err.message);
    process.exit(1);
  }
  
  console.log('✅ Conectado ao banco SQLite');
  
  try {
    await seedDatabase();
    console.log('✅ Banco de dados populado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao semear dados:', error);
    process.exit(1);
  }
});

async function seedDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 1. Criar usuários de teste
        console.log('\n📝 Criando usuários de teste...');
        
        const hashedPassword1 = await bcrypt.hash('senha123', 10);
        const hashedPassword2 = await bcrypt.hash('senha456', 10);
        
        db.run(
          `INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)`,
          ['usuario1@teste.com', hashedPassword1],
          function(err) {
            if (err) console.error('Erro ao inserir usuário 1:', err);
            else console.log('  ✓ Usuário 1 criado: usuario1@teste.com');
          }
        );
        
        db.run(
          `INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)`,
          ['usuario2@teste.com', hashedPassword2],
          function(err) {
            if (err) console.error('Erro ao inserir usuário 2:', err);
            else console.log('  ✓ Usuário 2 criado: usuario2@teste.com');
          }
        );

        // 2. Criar carteiras
        console.log('\n🎫 Criando carteiras de teste...');
        
        db.run(
          `INSERT OR IGNORE INTO cards (
            user_id, numero_carteira, nome, data_nascimento, sexo, 
            cpf, rg, telefone, email, endereco, cidade, estado,
            tipo_deficiencia, grau_deficiencia, cid, numero_laudo,
            data_laudo, nome_medico, crm_medico, acompanhante,
            validade, codigo_verificacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            1, // user_id
            'PCD-2024-001', // numero_carteira
            'João Silva Santos', // nome
            '1990-01-15', // data_nascimento
            'M', // sexo
            '12345678901', // cpf
            '1234567-8', // rg
            '11987654321', // telefone
            'joao@example.com', // email
            'Rua das Flores, 123', // endereco
            'São Paulo', // cidade
            'SP', // estado
            'Mobilidade Reduzida', // tipo_deficiencia
            'Moderado', // grau_deficiencia
            'M54', // cid
            'LAU-2023-0001', // numero_laudo
            '2023-06-15', // data_laudo
            'Dr. Carlos Mendes', // nome_medico
            '123456/SP', // crm_medico
            1, // acompanhante
            '2026-12-31', // validade
            'VER-PCD-2024-001' // codigo_verificacao
          ],
          function(err) {
            if (err) console.error('Erro ao inserir carteira 1:', err);
            else console.log('  ✓ Carteira 1 criada: PCD-2024-001 (João Silva)');
          }
        );

        db.run(
          `INSERT OR IGNORE INTO cards (
            user_id, numero_carteira, nome, data_nascimento, sexo, 
            cpf, rg, telefone, email, endereco, cidade, estado,
            tipo_deficiencia, grau_deficiencia, cid, numero_laudo,
            data_laudo, nome_medico, crm_medico, acompanhante,
            validade, codigo_verificacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            2, // user_id
            'PCD-2024-002', // numero_carteira
            'Maria Oliveira Costa', // nome
            '1985-03-22', // data_nascimento
            'F', // sexo
            '98765432109', // cpf
            '9876543-2', // rg
            '11912345678', // telefone
            'maria@example.com', // email
            'Av. Paulista, 456', // endereco
            'São Paulo', // cidade
            'SP', // estado
            'Deficiência Visual', // tipo_deficiencia
            'Severo', // grau_deficiencia
            'H54', // cid
            'LAU-2023-0002', // numero_laudo
            '2023-05-10', // data_laudo
            'Dra. Paula Oliveira', // nome_medico
            '789012/SP', // crm_medico
            0, // acompanhante
            '2025-11-30', // validade
            'VER-PCD-2024-002' // codigo_verificacao
          ],
          function(err) {
            if (err) console.error('Erro ao inserir carteira 2:', err);
            else console.log('  ✓ Carteira 2 criada: PCD-2024-002 (Maria Oliveira)');
          }
        );

        // 3. Criar contatos de emergência
        console.log('\n📞 Criando contatos de emergência...');
        
        db.run(
          `INSERT OR IGNORE INTO emergency_contacts (card_id, nome, telefone, parentesco)
           VALUES (?, ?, ?, ?)`,
          [1, 'Ana Silva', '11987654321', 'Esposa'],
          function(err) {
            if (err) console.error('Erro ao inserir contato 1:', err);
            else console.log('  ✓ Contato 1 criado: Ana Silva (Esposa)');
          }
        );

        db.run(
          `INSERT OR IGNORE INTO emergency_contacts (card_id, nome, telefone, parentesco)
           VALUES (?, ?, ?, ?)`,
          [1, 'Pedro Silva', '11912345678', 'Filho'],
          function(err) {
            if (err) console.error('Erro ao inserir contato 2:', err);
            else console.log('  ✓ Contato 2 criado: Pedro Silva (Filho)');
          }
        );

        db.run(
          `INSERT OR IGNORE INTO emergency_contacts (card_id, nome, telefone, parentesco)
           VALUES (?, ?, ?, ?)`,
          [2, 'Roberto Costa', '11998765432', 'Irmão'],
          function(err) {
            if (err) console.error('Erro ao inserir contato 3:', err);
            else console.log('  ✓ Contato 3 criado: Roberto Costa (Irmão)');
          }
        );

        // Aguardar um pouco para garantir que as inserções foram feitas
        setTimeout(() => {
          resolve();
        }, 1000);

      } catch (error) {
        reject(error);
      }
    });
  });
}
