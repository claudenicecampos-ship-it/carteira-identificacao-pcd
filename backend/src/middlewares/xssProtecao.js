import sanitizeHtml from 'sanitize-html';

/**
 * Middleware para sanitizar entrada (proteção contra XSS)
 * Remove tags HTML e scripts maliciosos
 */
export const sanitizarEntrada = (req, res, next) => {
  // Sanitizar body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        }).trim();
      }
    });
  }

  // Sanitizar query
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeHtml(req.query[key], {
          allowedTags: [],
          allowedAttributes: {}
        }).trim();
      }
    });
  }

  // Sanitizar params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeHtml(req.params[key], {
          allowedTags: [],
          allowedAttributes: {}
        }).trim();
      }
    });
  }

  next();
};

/**
 * Sanitiza uma string para XSS protection
 */
export const sanitizar = (texto) => {
  if (typeof texto !== 'string') return texto;
  
  return sanitizeHtml(texto, {
    allowedTags: [],
    allowedAttributes: {}
  })
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};
