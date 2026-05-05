export const logger = {
  info: (...mensagens) => console.log('[CARTEIRA]', new Date().toISOString(), ...mensagens),
  warn: (...mensagens) => console.warn('[CARTEIRA]', new Date().toISOString(), ...mensagens),
  error: (...mensagens) => console.error('[CARTEIRA]', new Date().toISOString(), ...mensagens)
};
