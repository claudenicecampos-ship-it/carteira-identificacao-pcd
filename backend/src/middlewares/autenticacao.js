import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token não fornecido'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          sucesso: false,
          mensagem: 'Token inválido ou expirado'
        });
      }

      req.usuario_id = decoded.usuario_id;
      req.email = decoded.email;
      req.role = decoded.role || 'user';
      next();
    });
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar token'
    });
  }
};

export const verificarAdmin = (req, res, next) => {
  if (req.email !== 'admin@gmail.com' && req.role !== 'admin') {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Acesso negado: apenas administrador'
    });
  }
  next();
};

export const verificarTokenRefresh = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Refresh token não fornecido'
      });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          sucesso: false,
          mensagem: 'Refresh token inválido ou expirado'
        });
      }

      req.usuario_id = decoded.usuario_id;
      next();
    });
  } catch (erro) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar refresh token'
    });
  }
};
