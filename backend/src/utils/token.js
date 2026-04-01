import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Gera token JWT
 * @param {number} usuario_id - ID do usuário
 * @param {string} email - Email do usuário
 * @returns {string} - Token JWT
 */
export const gerarToken = (usuario_id, email) => {
  return jwt.sign(
    { usuario_id, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
};

/**
 * Gera refresh token
 * @param {number} usuario_id - ID do usuário
 * @returns {string} - Refresh token
 */
export const gerarRefreshToken = (usuario_id) => {
  return jwt.sign(
    { usuario_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

/**
 * Verifica validade do token
 * @param {string} token - Token JWT
 * @returns {object} - Payload do token ou erro
 */
export const verificarToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (erro) {
    throw new Error('Token inválido ou expirado');
  }
};
