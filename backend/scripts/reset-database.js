/**
 * Script de Reset do Banco de Dados
 * Remove e recria o banco do zero
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database.db');

console.log('⚠️  Resetando banco de dados...\n');

// Deletar banco existente
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✓ Banco anterior removido');
}

// Criar novo banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao criar banco:', err.message);
    process.exit(1);
  }
  
  console.log('✓ Novo banco criado');
  initializeDatabase();
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, function(err) {
      if (err) console.error('❌ Erro na tabela users:', err);
      else console.log('✓ Tabela "users" criada');
    });

    // Cards table
    db.run(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        numero_carteira TEXT UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        data_nascimento DATE NOT NULL,
        sexo TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        rg TEXT,
        telefone TEXT,
        email TEXT,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        tipo_deficiencia TEXT NOT NULL,
        grau_deficiencia TEXT NOT NULL,
        cid TEXT NOT NULL,
        numero_laudo TEXT,
        data_laudo DATE,
        nome_medico TEXT,
        crm_medico TEXT,
        acompanhante BOOLEAN DEFAULT 0,
        foto BLOB,
        laudo_file BLOB,
        data_emissao DATE DEFAULT CURRENT_DATE,
        validade DATE,
        codigo_verificacao TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, function(err) {
      if (err) console.error('❌ Erro na tabela cards:', err);
      else console.log('✓ Tabela "cards" criada');
    });

    // Emergency contacts table
    db.run(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        telefone TEXT NOT NULL,
        parentesco TEXT,
        FOREIGN KEY (card_id) REFERENCES cards (id)
      )
    `, function(err) {
      if (err) console.error('❌ Erro na tabela emergency_contacts:', err);
      else console.log('✓ Tabela "emergency_contacts" criada');
    });

    // Criar índices para melhor performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`, function(err) {
      if (err) console.error('❌ Erro ao criar índice:', err);
      else console.log('✓ Índices criados');
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id)`, function(err) {
      if (err) console.error('❌ Erro ao criar índice:', err);
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_cards_cpf ON cards(cpf)`, function(err) {
      if (err) console.error('❌ Erro ao criar índice:', err);
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_emergency_card_id ON emergency_contacts(card_id)`, function(err) {
      if (err) console.error('❌ Erro ao criar índice:', err);
    });
  });

  // Fechar após um tempo
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar banco:', err);
        process.exit(1);
      }
      console.log('\n✅ Banco de dados resetado com sucesso!\n');
      console.log('📌 Próximo passo: Execute "npm run seed" para popular com dados de teste\n');
      process.exit(0);
    });
  }, 1000);
}
