# 📁 Estrutura Completa - Carteira

Visualização completa da estrutura implementada:

```
carteira/
│
├─ 📄 README.md                          ← Documentação principal
├─ 📄 QUICK_START.md                     ← Início rápido (5 min)
├─ 📄 SEGURANCA.md                       ← Detalhes de segurança
├─ 📄 GUIA_IMPLEMENTACAO.md              ← Como expandir
├─ 📄 .gitignore                         ← Arquivo ignorado no git
├─ 🔧 setup.sh                           ← Setup para Linux/Mac
├─ 🔧 setup.bat                          ← Setup para Windows
│
├─ 📊 frontend/                          ← Aplicação Cliente
│   ├─ 📄 index.html                     ← Dashboard (protegido)
│   │
│   ├─ 📁 pages/
│   │   ├─ 📄 login.html                 ← Tela de login
│   │   ├─ 📄 cadastro.html              ← Tela de cadastro
│   │   └─ 📄 recuperar-senha.html       ← Recuperação de senha
│   │
│   └─ 📁 assets/
│       ├─ 📁 css/
│       │   └─ 🎨 auth.css               ← Estilos de autenticação
│       │
│       └─ 📁 js/
│           ├─ 🔧 auth.js                ← Lógica compartilhada
│           ├─ 🔧 login.js               ← Lógica do login
│           ├─ 🔧 cadastro.js            ← Lógica do cadastro
│           └─ 🔧 recuperar-senha.js     ← Lógica de recuperação
│
├─ 🖥️  backend/                          ← API REST Node.js
│   ├─ 📄 package.json                   ← Dependências
│   ├─ 📄 .env.example                   ← Variáveis template
│   ├─ 📄 .env                           ← Variáveis reais (criar)
│   │
│   └─ 📁 src/
│       ├─ 🚀 server.js                  ← Arquivo principal
│       │
│       ├─ 📁 config/                    ← Configurações
│       │   ├─ 🔧 database.js            ← Pool MySQL
│       │   └─ 🔧 email.js               ← Nodemailer
│       │
│       ├─ 📁 routes/                    ← Definição de rotas
│       │   ├─ 🛣️  index.js              ← Agregador de rotas
│       │   └─ 🛣️  autenticacaoRoutes.js ← Rotas de auth
│       │
│       ├─ 📁 controllers/               ← Camada de control
│       │   └─ 🎮 autenticacaoController.js
│       │
│       ├─ 📁 services/                  ← Lógica de negócio
│       │   └─ ⚙️ autenticacaoService.js
│       │
│       ├─ 📁 repositories/              ← Acesso de dados
│       │   ├─ 💾 usuarioRepository.js
│       │   ├─ 💾 recuperacaoSenhaRepository.js
│       │   └─ 💾 sessaoRepository.js
│       │
│       ├─ 📁 middlewares/               ← Proteção & lógica
│       │   ├─ 🛡️  autenticacao.js       ← JWT verification
│       │   ├─ 🛡️  xssProtecao.js        ← Sanitização de input
│       │   ├─ 🛡️  rateLimiter.js        ← Rate limiting
│       │   ├─ 🛡️  segurancaHeaders.js   ← Helmet headers
│       │   └─ 🛡️  auditoria.js          ← Audit logging
│       │
│       └─ 📁 utils/                     ← Funções utilitárias
│           ├─ 🔐 criptografia.js        ← Bcrypt + validação
│           ├─ 🔐 token.js               ← JWT generation
│           ├─ 🎯 qrcode.js              ← QR Code unique
│           ├─ 📧 email.js               ← Email templates
│           └─ ✔️  validacao.js          ← Validações
│
├─ 🗄️  database/                         ← Banco de dados
│   └─ 📊 carteira_database.sql          ← Schema MySQL
│       ├─ 👥 usuarios
│       ├─ 💳 carteiras
│       ├─ 📢 denuncias
│       ├─ 🔑 recuperacao_senha
│       ├─ 🔐 sessoes
│       └─ 📝 auditoria
│
└─ 📚 (Este arquivo)
```

## 🎯 Fluxo de Requisição

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                   │
│  index.html, login.html, cadastro.html                 │
│  assets/js/(auth, login, cadastro, recuperar-senha)   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   × HTTP Request + Data
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              SERVIDOR (Backend - Node.js)              │
├─────────────────────────────────────────────────────────┤
│ 1. server.js - Express app                              │
│    ├─ Helmet (Security Headers)                         │
│    ├─ CORS (Seguro)                                     │
│    └─ Rate Limiting                                     │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│           MIDDLEWARE (Proteção Camada 1)               │
│  ├─ sanitizarEntrada (XSS Prevention)                   │
│  ├─ limitadorGeral/limitadorLogin (Rate Limiting)       │
│  └─ verificarToken (JWT Authentication)                │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│         ROUTES (routes/autenticacaoRoutes.js)           │
│  GET  /api/auth/*                                       │
│  POST /api/auth/login                                   │
│  POST /api/auth/registrar                               │
│  POST /api/auth/renovar-token                           │
│  etc...                                                 │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│     CONTROLLERS (controllers/autenticacaoController.js) │
│  - Recebe requisição                                    │
│  - Valida parâmetros                                    │
│  - Chama service                                        │
│  - Retorna resposta                                     │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│     SERVICES (services/autenticacaoService.js)          │
│  - Lógica de negócio                                    │
│  - Validações                                           │
│  - Orquestração                                         │
│  - Chama repository                                     │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│   REPOSITORIES (repositories/*.Repository.js)           │
│  ├─ usuarioRepository                                   │
│  ├─ recuperacaoSenhaRepository                          │
│  └─ sessaoRepository                                    │
│  - Acesso aos dados                                     │
│  - Queries parametrizadas (SQL Injection Prevention)    │
│  - Retorna dados do DB                                  │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│          DATABASE (MySQL - carteira_database)           │
│  ├─ usuarios (dados pessoais + hash senha)             │
│  ├─ carteiras (carteiras digitais)                      │
│  ├─ denuncias (denúncias registradas)                   │
│  ├─ recuperacao_senha (tokens temporários)              │
│  ├─ sessoes (rastreamento JWT)                          │
│  └─ auditoria (logs de ações)                           │
└────────────────────────────────────────────────────────┘
```

## 🔄 Ciclo de Vida de uma Requisição

### Exemplo: POST /api/auth/login

```javascript
// 1. Cliente envia
POST http://localhost:3000/api/auth/login
{
  email: "usuario@email.com",
  senha: "SenhaForte@123"
}

// 2. Middleware: Sanitização XSS
✅ Entrada verificada - sem scripts

// 3. Middleware: Rate Limiting
✅ Usuário dentro do limite (5 tentativas/15min)

// 4. Route: autenticacaoRoutes.js
router.post('/login', limitadorLogin, AutenticacaoController.login)

// 5. Controller: autenticacaoController.js
- Recebe req, res
- Extrai email e senha
- Valida tipos
- Chama service.login()

// 6. Service: autenticacaoService.js
- Busca usuário no repository
- Compara senha com bcrypt
- Gera tokens JWT
- Cria sessão

// 7. Repository: usuarioRepository.js
- Query parametrizada:
  SELECT * FROM usuarios WHERE email = ?
  com parâmetro [email]
- Proteção contra SQL Injection ✅

// 8. Database: MySQL
- Busca usuário
- Retorna dados

// 9. Service: volta ao controller
- Retorna token, refreshToken, usuario

// 10. Controller: responde ao cliente
{
  sucesso: true,
  data: {
    usuario: { id, nome, email, qr_code },
    token: "jwt_access_token",
    refreshToken: "jwt_refresh_token"
  }
}

// 11. Cliente: recebe e salva
localStorage.setItem('carteira_token', token)
localStorage.setItem('carteira_refresh_token', refreshToken)
localStorage.setItem('carteira_user', JSON.stringify(usuario))

// 12. Cliente: próximas requisições
Authorization: Bearer eyJhbGc...
```

## 📊 Tabelas do Banco

### usuarios
```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    senha VARCHAR(255),          -- Hash Bcrypt
    cpf VARCHAR(11) UNIQUE,
    qr_code TEXT UNIQUE,         -- Código único
    refreshToken VARCHAR(500),
    ativo BOOLEAN,
    criado_em TIMESTAMP
);
```

### carteiras
```sql
CREATE TABLE carteiras (
    id INT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50),            -- débito, crédito, poupança
    numero_carteira VARCHAR(100),
    saldo DECIMAL(10, 2),        -- Precisão financeira
    ativa BOOLEAN,
    criada_em TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### recuperacao_senha
```sql
CREATE TABLE recuperacao_senha (
    id INT PRIMARY KEY,
    usuario_id INT,
    token VARCHAR(255) UNIQUE,   -- UUID único
    expira_em TIMESTAMP,         -- 1 hora
    utilizado BOOLEAN,           -- Uso único
    criado_em TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### sessoes
```sql
CREATE TABLE sessoes (
    id INT PRIMARY KEY,
    usuario_id INT,
    token_refresh VARCHAR(500),
    endereco_ip VARCHAR(45),     -- Rastreamento
    user_agent TEXT,             -- Navegador/dispositivo
    ativa BOOLEAN,
    expira_em TIMESTAMP,         -- Válido 7 dias
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### auditoria
```sql
CREATE TABLE auditoria (
    id INT PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(100),           -- LOGIN, LOGOUT, REGISTR, etc
    tabela VARCHAR(100),         -- usuarios, carteiras, etc
    registro_id INT,
    endereco_ip VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP          -- Todos os eventos assinados
);
```

## 🔐 Camadas de Segurança

```
┌────────────────────────────────────────────────────────┐
│        CLIENTE - Frontend Security                    │
│ • Validação de entrada                                 │
│ • Escaping de dados                                    │
│ • HTTPS requerido                                      │
│ • localStorage protegido (HTTPOnly Cookie melhor)      │
│ • Sanitização de saídas                               │
└────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│        TRANSPORTE - Network Security                  │
│ • HTTPS/TLS obrigatório                                │
│ • Certificado válido                                   │
│ • HSTS habilitado                                      │
│ • CORS validado                                        │
└────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│       SERVIDOR - Application Security                 │
│ • Rate Limiting (previne brute force)                  │
│ • Sanitização XSS (middleware)                         │
│ • JWT validation (autenticação)                        │
│ • Helmet headers (security headers)                    │
│ • Validação de entrada (dupla camada)                  │
│ • Erro handling (sem exposição)                        │
└────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────┐
│      DATABASE - Data Security                         │
│ • Queries parametrizadas (SQL Injection prevention)    │
│ • Bcrypt hashing (senha)                               │
│ • Índices de performance                               │
│ • Constraints de integridade                           │
│ • Backup automático                                    │
│ • Auditoria completa                                   │
│ • Controle de acesso por usuário                       │
└────────────────────────────────────────────────────────┘
```

## 🚀 Próximas Funcionalidades

### Phase 2 - Carteiras
```
├─ GET    /api/carteiras           ← Listar
├─ POST   /api/carteiras           ← Criar
├─ PUT    /api/carteiras/:id       ← Editar
├─ DELETE /api/carteiras/:id       ← Deletar
└─ POST   /api/carteiras/transferir ← Transferência
```

### Phase 3 - Denúncias
```
├─ GET    /api/denuncias           ← Listar
├─ POST   /api/denuncias           ← Criar
├─ PUT    /api/denuncias/:id       ← Editar status
└─ GET    /api/denuncias/:id       ← Detalhes
```

### Phase 4 - Admin
```
├─ GET    /api/admin/usuarios      ← Gestão de usuários
├─ PUT    /api/admin/usuarios/:id  ← Editar/desativar
├─ GET    /api/admin/auditoria     ← Ver logs
└─ GET    /api/admin/stats         ← Relatórios
```

---

**Arquitetura profissional, escalável e segura! 🔐**
