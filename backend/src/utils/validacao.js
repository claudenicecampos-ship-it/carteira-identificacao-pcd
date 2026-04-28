import validator from 'validator';

const validUFs = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

/**
 * Valida email
 */
export const validarEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Valida nome completo
 */
export const validarNome = (nome) => {
  if (!nome || typeof nome !== 'string') return false;
  const valor = nome.trim();
  return valor.length >= 3 && /^[a-zA-ZÀ-ÿ]+(?:[\s]+[a-zA-ZÀ-ÿ]+)+$/.test(valor);
};

/**
 * Valida CPF com algorítmo de dígitos verificadores
 */
export const validarCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') return false;
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i), 10) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10), 10)) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i), 10) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11), 10)) return false;

  return true;
};

/**
 * Valida telefone brasileiro
 */
export const validarTelefone = (telefone) => {
  if (!telefone || typeof telefone !== 'string') return false;
  const telefoneLimpo = telefone.replace(/\D/g, '');
  return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
};

/**
 * Valida RG básico (7-9 dígitos)
 */
export const validarRG = (rg) => {
  if (!rg || typeof rg !== 'string') return false;
  const rgLimpo = rg.replace(/\D/g, '');
  return rgLimpo.length >= 7 && rgLimpo.length <= 9;
};

/**
 * Valida sexo do titular
 */
export const validarSexo = (sexo) => {
  return ['M', 'F', 'NB', 'Não Binário', 'Nao Binario', 'Outro'].includes(String(sexo).trim());
};

/**
 * Valida estado brasileiro (UF)
 */
export const validarEstado = (estado) => {
  if (!estado || typeof estado !== 'string') return false;
  return validUFs.includes(estado.trim().toUpperCase());
};

/**
 * Valida CID simples
 */
export const validarCID = (cid) => {
  if (!cid || typeof cid !== 'string') return false;
  const valor = cid.toUpperCase().trim();
  return /^[A-TV-Z]\d{2}(?:\.\d{1,2})?$/.test(valor);
};

/**
 * Valida CRM/CRP/CRFa
 */
export const validarCRM = (crm) => {
  if (!crm || typeof crm !== 'string') return false;
  const valor = crm.toUpperCase().replace(/\s+/g, '');
  return /^(CRM|CRP|CRFA)[\-]?[A-Z]{2}[\-]?\d{4,6}$/.test(valor);
};

/**
 * Valida cidade
 */
export const validarCidade = (cidade) => {
  if (!cidade || typeof cidade !== 'string') return false;
  const valor = cidade.trim();
  return valor.length >= 2 && /^[a-zA-ZÀ-ÿ\s\-]+$/.test(valor);
};

/**
 * Valida data em formatos ISO ou DD/MM/YYYY
 */
export const validarData = (data) => {
  if (!data || typeof data !== 'string') return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  const brRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[012])\/(19|20)\d{2}$/;

  let date;
  if (isoRegex.test(data)) {
    date = new Date(data);
  } else if (brRegex.test(data)) {
    const [dia, mes, ano] = data.split('/');
    date = new Date(`${ano}-${mes}-${dia}`);
  } else {
    return false;
  }

  return !Number.isNaN(date.getTime());
};

/**
 * Valida CEP
 */
export const validarCEP = (cep) => {
  if (!cep || typeof cep !== 'string') return false;
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
};

/**
 * Gera um código de verificação único
 */
export const gerarCodigoVerificacao = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
