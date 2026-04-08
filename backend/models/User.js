const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'go-card-pcd-secret';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

class User {
  static async create(email, password) {
    const normalizedEmail = normalizeEmail(email);
    const hashedPassword = await bcrypt.hash(String(password || ''), 10);

    const result = await run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [normalizedEmail, hashedPassword]
    );

    return { id: result.id, email: normalizedEmail };
  }

  static async findByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;

    return get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
  }

  static async findById(id) {
    return get('SELECT id, email, created_at FROM users WHERE id = ?', [id]);
  }

  static verifyPassword(password, hash) {
    return bcrypt.compare(String(password || ''), String(hash || ''));
  }

  static generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }
}

module.exports = User;
module.exports.JWT_SECRET = JWT_SECRET;
