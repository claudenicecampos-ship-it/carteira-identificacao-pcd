<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import routes from './src/routes/index.js';
import { limitadorGeral } from './src/middlewares/rateLimiter.js';
import { sanitizarEntrada } from './src/middlewares/xssProtecao.js';
import { configurarSegurancaHeaders } from './src/middlewares/segurancaHeaders.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de Segurança
app.use(helmet());
app.use(configurarSegurancaHeaders);
const corsOptions = {
  origin: process.env.NODE_ENV === 'development'
    ? true
    : process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5000'],
  credentials: true
};

app.use(cors(corsOptions));

// Limitador de requisições
app.use(limitadorGeral);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Sanitizar entrada
app.use(sanitizarEntrada);

// Rotas
app.use('/api', routes);

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    sucesso: true,
    mensagem: 'API está funcionando',
    timestamp: new Date()
  });
});

// Páginas estáticas do frontend (em produção)
app.use(express.static('./frontend'));

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno do servidor',
    timestamp: new Date()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Segurança: JWT, XSS Protection, Rate Limiting, SQL Injection Prevention`);
});
=======
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
      scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'https:', 'data:']
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);

// Serve frontend for any unmatched routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

function startServer(port) {
  const normalizedPort = Number(port) || 3000;
  const server = app.listen(normalizedPort, () => {
    console.log(`Server running at http://localhost:${normalizedPort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = normalizedPort + 1;
      console.warn(`Port ${normalizedPort} is already in use. Trying http://localhost:${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error('Failed to start server:', error);
    process.exit(1);
  });

  return server;
}

startServer(PORT);

module.exports = app;
>>>>>>> 9b63bc8bf2dfd0cd4475962410d494b918007981
