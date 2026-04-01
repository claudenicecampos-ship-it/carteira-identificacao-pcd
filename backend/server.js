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
const PORT = process.env.PORT || 3000;

// Middlewares de Segurança
app.use(helmet());
app.use(configurarSegurancaHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5000',
  credentials: true
}));

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
