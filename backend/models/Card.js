const { run, get, all } = require('../config/database');

function pickValue(source, keys, fallback = null) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== '') {
      return source[key];
    }
  }
  return fallback;
}

function normalizeBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'Sim';
}

function toBase64(value) {
  if (!value) return null;
  return Buffer.isBuffer(value) ? value.toString('base64') : value;
}

function normalizeCard(row) {
  if (!row) return null;

  return {
    ...row,
    acompanhante: Boolean(row.acompanhante),
    foto: toBase64(row.foto),
    laudo_file: toBase64(row.laudo_file),
  };
}

class Card {
  static async create(cardData) {
    const payload = {
      user_id: pickValue(cardData, ['user_id']),
      numero_carteira: pickValue(cardData, ['numero_carteira']),
      nome: pickValue(cardData, ['nome']),
      data_nascimento: pickValue(cardData, ['data_nascimento', 'dataNascimento']),
      sexo: pickValue(cardData, ['sexo']),
      cpf: pickValue(cardData, ['cpf']),
      rg: pickValue(cardData, ['rg']),
      telefone: pickValue(cardData, ['telefone']),
      email: pickValue(cardData, ['email']),
      endereco: pickValue(cardData, ['endereco']),
      cidade: pickValue(cardData, ['cidade']),
      estado: pickValue(cardData, ['estado']),
      tipo_deficiencia: pickValue(cardData, ['tipo_deficiencia', 'tipoDeficiencia']),
      grau_deficiencia: pickValue(cardData, ['grau_deficiencia', 'grauDeficiencia']),
      cid: pickValue(cardData, ['cid']),
      numero_laudo: pickValue(cardData, ['numero_laudo', 'numeroLaudo']),
      data_laudo: pickValue(cardData, ['data_laudo', 'dataLaudo']),
      nome_medico: pickValue(cardData, ['nome_medico', 'nomeMedico']),
      crm_medico: pickValue(cardData, ['crm_medico', 'crmMedico']),
      acompanhante: normalizeBoolean(pickValue(cardData, ['acompanhante', 'necessitaAcompanhante'], 0)) ? 1 : 0,
      foto: pickValue(cardData, ['foto']),
      laudo_file: pickValue(cardData, ['laudo_file', 'laudoFile']),
      data_emissao: pickValue(cardData, ['data_emissao', 'dataEmissao'], new Date().toISOString().split('T')[0]),
      validade: pickValue(cardData, ['validade']),
      codigo_verificacao: pickValue(cardData, ['codigo_verificacao']),
    };

    const result = await run(
      `INSERT INTO cards (
        user_id, numero_carteira, nome, data_nascimento, sexo, cpf, rg, telefone,
        email, endereco, cidade, estado, tipo_deficiencia, grau_deficiencia, cid,
        numero_laudo, data_laudo, nome_medico, crm_medico, acompanhante, foto,
        laudo_file, data_emissao, validade, codigo_verificacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.user_id,
        payload.numero_carteira,
        payload.nome,
        payload.data_nascimento,
        payload.sexo,
        payload.cpf,
        payload.rg,
        payload.telefone,
        payload.email,
        payload.endereco,
        payload.cidade,
        payload.estado,
        payload.tipo_deficiencia,
        payload.grau_deficiencia,
        payload.cid,
        payload.numero_laudo,
        payload.data_laudo,
        payload.nome_medico,
        payload.crm_medico,
        payload.acompanhante,
        payload.foto,
        payload.laudo_file,
        payload.data_emissao,
        payload.validade,
        payload.codigo_verificacao,
      ]
    );

    return this.findById(result.id);
  }

  static async findById(id) {
    const row = await get('SELECT * FROM cards WHERE id = ?', [id]);
    return normalizeCard(row);
  }

  static async findByUserId(userId) {
    const row = await get(
      'SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1',
      [userId]
    );
    return normalizeCard(row);
  }

  static async findByVerificationCode(code) {
    const row = await get('SELECT * FROM cards WHERE codigo_verificacao = ?', [code]);
    return normalizeCard(row);
  }

  static async getEmergencyContacts(cardId) {
    return all(
      'SELECT id, nome, telefone, parentesco FROM emergency_contacts WHERE card_id = ? ORDER BY id ASC',
      [cardId]
    );
  }

  static async addEmergencyContact(cardId, contact) {
    const nome = pickValue(contact, ['nome']);
    const telefone = pickValue(contact, ['telefone']);
    const parentesco = pickValue(contact, ['parentesco'], 'Não informado');

    const result = await run(
      'INSERT INTO emergency_contacts (card_id, nome, telefone, parentesco) VALUES (?, ?, ?, ?)',
      [cardId, nome, telefone, parentesco]
    );

    return { id: result.id, nome, telefone, parentesco };
  }

  static async update(cardId, updateData) {
    const allowedFields = [
      'nome', 'data_nascimento', 'sexo', 'cpf', 'rg', 'telefone', 'email', 'endereco',
      'cidade', 'estado', 'tipo_deficiencia', 'grau_deficiencia', 'cid', 'numero_laudo',
      'data_laudo', 'nome_medico', 'crm_medico', 'acompanhante', 'foto', 'laudo_file',
      'data_emissao', 'validade', 'codigo_verificacao'
    ];

    const fieldMap = {
      dataNascimento: 'data_nascimento',
      tipoDeficiencia: 'tipo_deficiencia',
      grauDeficiencia: 'grau_deficiencia',
      numeroLaudo: 'numero_laudo',
      dataLaudo: 'data_laudo',
      nomeMedico: 'nome_medico',
      crmMedico: 'crm_medico',
      laudoFile: 'laudo_file',
      dataEmissao: 'data_emissao',
      necessitaAcompanhante: 'acompanhante',
    };

    const normalized = {};
    Object.entries(updateData || {}).forEach(([key, value]) => {
      const dbKey = fieldMap[key] || key;
      if (allowedFields.includes(dbKey)) {
        normalized[dbKey] = dbKey === 'acompanhante' ? (normalizeBoolean(value) ? 1 : 0) : value;
      }
    });

    const entries = Object.entries(normalized);
    if (!entries.length) {
      return this.findById(cardId);
    }

    const clause = entries.map(([field]) => `${field} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    values.push(cardId);

    await run(`UPDATE cards SET ${clause} WHERE id = ?`, values);
    return this.findById(cardId);
  }
}

module.exports = Card;
