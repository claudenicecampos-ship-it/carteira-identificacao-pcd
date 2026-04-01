import bcryptjs from 'bcryptjs';

/**
 * Criptografa a senha usando bcrypt
 * @param {string} senha - Senha em texto plano
 * @returns {Promise<string>} - Senha criptografada
 */
export const criptografarSenha = async (senha) => {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(senha, salt);
};

/**
 * Compara senha em texto plano com hash
 * @param {string} senha - Senha em texto plano
 * @param {string} hash - Hash da senha
 * @returns {Promise<boolean>} - True se senhas correspondem
 */
export const compararSenha = async (senha, hash) => {
  return await bcryptjs.compare(senha, hash);
};

/**
 * Valida força da senha
 * Requerimentos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
export const validarForçaSenha = (senha) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(senha);
};

/**
 * Gera uma string aleatória segura
 * @param {number} tamanho - Tamanho da string
 * @returns {string} - String aleatória
 */
export const gerarStringAleatoria = (tamanho = 32) => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let resultado = '';
  for (let i = 0; i < tamanho; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return resultado;
};
