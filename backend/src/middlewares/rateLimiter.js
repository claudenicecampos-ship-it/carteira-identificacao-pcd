import rateLimit from 'express-rate-limit';

/**
 * Limitador geral de requisições
 */
export const limitadorGeral = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limitador específico para login (mais restritivo)
 */
export const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos',
  skipSuccessfulRequests: true,
});

/**
 * Limitador para registro (mais restritivo)
 */
export const limitadorRegistro = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  message: 'Muitas tentativas de registro. Tente novamente em uma hora',
});

/**
 * Limitador para recuperação de senha
 */
export const limitadorRecuperacaoSenha = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 tentativas por hora
  message: 'Muitas tentativas de recuperação de senha. Tente novamente em uma hora',
});
