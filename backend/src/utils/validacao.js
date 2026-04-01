import validator from 'validator';

/**
 * Valida email
 */
export const validarEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Valida CPF (básico)
 */
export const validarCPF = (cpf) => {
  if (!cpf || cpf.length !== 11) return false;
  
  // Remover caracteres especiais
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  // Calcular primeiro dígito verificador
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  // Calcular segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
};

/**
 * Valida telefone
 */
export const validarTelefone = (telefone) => {
  const telefoneLimpo = telefone.replace(/\D/g, '');
  return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
};

/**
 * Valida data no formato DD/MM/YYYY
 */
export const validarData = (data) => {
  const regex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012])\/(19|20)\d{2}$/;
  return regex.test(data);
};

/**
 * Valida CEP
 */
export const validarCEP = (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
};
