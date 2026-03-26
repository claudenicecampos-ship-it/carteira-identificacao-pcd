const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
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
    `);

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
    `);

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
    `);
  });
}

module.exports = db;