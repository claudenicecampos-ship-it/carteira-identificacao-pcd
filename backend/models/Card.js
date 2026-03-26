const db = require('../config/database');

class Card {
  static async create(cardData) {
    const {
      user_id, numero_carteira, nome, data_nascimento, sexo, cpf, rg, telefone,
      email, endereco, cidade, estado, tipo_deficiencia, grau_deficiencia, cid,
      numero_laudo, data_laudo, nome_medico, crm_medico, acompanhante,
      foto, laudo_file, validade, codigo_verificacao
    } = cardData;

    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO cards (
          user_id, numero_carteira, nome, data_nascimento, sexo, cpf, rg, telefone,
          email, endereco, cidade, estado, tipo_deficiencia, grau_deficiencia, cid,
          numero_laudo, data_laudo, nome_medico, crm_medico, acompanhante,
          foto, laudo_file, validade, codigo_verificacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user_id, numero_carteira, nome, data_nascimento, sexo, cpf, rg, telefone,
        email, endereco, cidade, estado, tipo_deficiencia, grau_deficiencia, cid,
        numero_laudo, data_laudo, nome_medico, crm_medico, acompanhante ? 1 : 0,
        foto, laudo_file, validade, codigo_verificacao
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM cards WHERE user_id = ?', [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row && row.foto) {
            row.foto = row.foto.toString('base64');
          }
          if (row && row.laudo_file) {
            row.laudo_file = row.laudo_file.toString('base64');
          }
          resolve(row);
        }
      });
    });
  }

  static async findByVerificationCode(codigo) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM cards WHERE codigo_verificacao = ?', [codigo], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row && row.foto) {
            row.foto = row.foto.toString('base64');
          }
          if (row && row.laudo_file) {
            row.laudo_file = row.laudo_file.toString('base64');
          }
          resolve(row);
        }
      });
    });
  }

  static async findByCPF(cpf) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM cards WHERE cpf = ?', [cpf], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async update(cardId, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });

    values.push(cardId);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE cards SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  static async addEmergencyContact(cardId, contactData) {
    const { nome, telefone, parentesco } = contactData;
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO emergency_contacts (card_id, nome, telefone, parentesco) VALUES (?, ?, ?, ?)',
        [cardId, nome, telefone, parentesco],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  }

  static async getEmergencyContacts(cardId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM emergency_contacts WHERE card_id = ?', [cardId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Card;