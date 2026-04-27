import rateLimit from 'express-rate-limit';

/**
 * Limitador geral de requisições
 */
export const limitadorGeral = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { sucesso: false, mensagem: 'Muitas requisições deste IP, tente novamente mais tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limitador específico para login (mais restritivo)
 */
export const limitadorLogin = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // 3 tentativas
  message: { sucesso: false, mensagem: 'Muitas tentativas de login. Tente novamente em 5 minutos' },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = req.body?.email;
    return email && typeof email === 'string' ? email.toLowerCase() : req.ip;
  },
  handler: (req, res) => {
    const retryAfter = Math.ceil(5 * 60);
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      sucesso: false,
      mensagem: 'Muitas tentativas de login. Tente novamente em 5 minutos',
      tentativasRestantes: 0,
      retryAfter
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limitador para recuperação de senha
 */
export const limitadorRecuperacaoSenha = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // 3 tentativas
  message: { sucesso: false, mensagem: 'Muitas tentativas de recuperação de senha. Tente novamente em 5 minutos' },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = req.body?.email;
    return email && typeof email === 'string' ? email.toLowerCase() : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});
