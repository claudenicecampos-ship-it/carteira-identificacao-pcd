import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import routes from './src/routes/index.js';
import { limitadorGeral } from './src/middlewares/rateLimiter.js';
import { sanitizarEntrada } from './src/middlewares/xssProtecao.js';
import { configurarSegurancaHeaders } from './src/middlewares/segurancaHeaders.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

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
app.options('*', cors(corsOptions));

// Limitador de requisições
app.use(limitadorGeral);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Uploads estáticos
app.use('/imgs', express.static(path.join(__dirname, 'imgs')));
app.use('/laudos', express.static(path.join(__dirname, 'laudos')));

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

function iniciarServidor(port) {
  const server = app.listen(port, () => {
    console.log(`✅ Servidor rodando em http://localhost:${port}`);
    console.log(`📝 Health check: http://localhost:${port}/health`);
    console.log(`🔐 Segurança: JWT, XSS Protection, Rate Limiting, SQL Injection Prevention`);
  });

  server.on('error', (erro) => {
    if (erro.code === 'EADDRINUSE') {
      console.error(`❌ Porta ${port} está ocupada. Por favor, libere a porta ou configure uma porta diferente.`);
      console.error(`💡 Para liberar a porta: taskkill /PID <PID> /F (substitua <PID> pelo ID do processo)`);
      console.error(`💡 Para usar outra porta: defina a variável de ambiente PORT=3001`);
      process.exit(1);
    }

    console.error('Erro ao iniciar o servidor:', erro);
    process.exit(1);
  });
}

iniciarServidor(PORT);
