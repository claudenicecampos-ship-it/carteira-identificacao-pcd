# 🔐 Carteira - Arquitetura e Segurança

Uma aplicação completa com arquitetura profissional multi-page, implementação de camadas (MVC/Clean Architecture) e mecanismos de segurança robustos.

## 📋 Estrutura do Projeto

```
carteira/
├── frontend/                 # Aplicação Cliente
│   ├── assets/
│   │   ├── css/
│   │   │   └── auth.css     # Estilos de autenticação
│   │   └── js/
│   │       ├── auth.js      # Lógica compartilhada de autenticação
│   │       ├── login.js     # Lógica do login
│   │       ├── cadastro.js  # Lógica do cadastro
│   │       └── recuperar-senha.js
│   └── pages/
│       ├── login.html
│       ├── cadastro.html
│       └── recuperar-senha.html
│
├── backend/                  # API REST Node.js
│   ├── src/
│   │   ├── config/          # Configurações
│   │   │   ├── database.js  # Conexão MySQL
│   │   │   └── email.js     # Configuração de email
│   │   ├── controllers/     # Controllers (camada de controle)
│   │   │   └── autenticacaoController.js
│   │   ├── services/        # Services (lógica de negócio)
│   │   │   └── autenticacaoService.js
│   │   ├── repositories/    # Repositories (acesso de dados)
│   │   │   ├── usuarioRepository.js
│   │   │   ├── recuperacaoSenhaRepository.js
│   │   │   └── sessaoRepository.js
│   │   ├── routes/          # Definição de rotas
│   │   │   ├── autenticacaoRoutes.js
│   │   │   └── index.js
│   │   ├── middlewares/     # Middlewares de segurança
│   │   │   ├── autenticacao.js
│   │   │   ├── xssProtecao.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── segurancaHeaders.js
│   │   │   └── auditoria.js
│   │   ├── utils/           # Funções utilitárias
│   │   │   ├── criptografia.js
│   │   │   ├── token.js
│   │   │   ├── qrcode.js
│   │   │   ├── email.js
│   │   │   └── validacao.js
│   │   └── server.js        # Arquivo principal
│   ├── package.json
│   ├── .env.example
│   └── .env (criar localmente)
│
└── database/
    └── carteira_database.sql # Schema do banco

```

## 🔒 Mecanismos de Segurança

### 1. **Proteção contra SQL Injection**
- ✅ Queries parametrizadas em todas as operações
- ✅ Uso de prepared statements no MySQL
- ✅ Input sanitization antes de processar

```javascript
// ❌ VULNERÁVEL
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;

// ✅ SEGURO
const [resultado] = await conexao.execute(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
);
```

### 2. **Proteção contra XSS (Cross-Site Scripting)**
- ✅ Sanitização de todas as entradas via middleware `sanitizarEntrada`
- ✅ Remoção de tags HTML e scripts
- ✅ Escaping de caracteres especiais
- ✅ Content Security Policy (CSP) via Helmet

```javascript
// Middleware automaticamente limpa inputs maliciosos
app.use(sanitizarEntrada);
```

### 3. **Autenticação com JWT**
- ✅ Token de acesso (15 minutos)
- ✅ Refresh token (7 dias)
- ✅ Verificação em rotas protegidas
- ✅ Middleware `verificarToken` para proteção

```javascript
// Gerar tokens seguros
const token = gerarToken(usuario_id, email);
const refreshToken = gerarRefreshToken(usuario_id);
```

### 4. **Criptografia de Senha**
- ✅ Bcrypt com 10 rounds de salt
- ✅ Validação de força de senha
- ✅ Hash único para cada usuário

```javascript
// Requisitos de senha (8+ caracteres)
- Letra maiúscula
- Letra minúscula
- Número
- Caractere especial (@, $, !, %, *, ?, &)
```

### 5. **Rate Limiting**
- ✅ Limitador geral: 100 requisições/15 min
- ✅ Login: 5 tentativas/15 min
- ✅ Registro: 3 registros/hora
- ✅ Recuperação de senha: 3 tentativas/hora

### 6. **CORS Seguro**
- ✅ Whitelist de domínios permitidos
- ✅ Credentials habilitadas
- ✅ Headers apropriados

### 7. **Segurança de Headers HTTP**
- ✅ Helmet para headers de segurança
- ✅ HSTS (1 ano)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff

### 8. **QR Code Único**
- ✅ E para cada usuário na criação
- ✅ Validação de formato
- ✅ Identificador único baseado em hash

### 9. **Sessão e Token Refresh**
- ✅ Tabela de sessões para rastreamento
- ✅ Refresh token válido por até 7 dias
- ✅ Logout encerrando todas as sessões
- ✅ Renovação automática via `/auth/renovar-token`

### 10. **Auditoria e Logging**
- ✅ Registro de todas as ações em `auditoria`
- ✅ Rastreamento de IP e User-Agent
- ✅ Histórico de valores alterados (antes/depois)

### 11. **Recuperação de Senha Segura**
- ✅ Token único de 1 hora
- ✅ Verificação de validade antes de redefinir
- ✅ Token de uso único
- ✅ Encerramento de todas as sessões ao resetar

### 12. **Validação de Entrada**
- ✅ Email válido
- ✅ CPF válido com dígitos verificadores
- ✅ Telefone com comprimento correto
- ✅ Data de nascimento

## 🚀 Instalação e Setup

### Pré-requisitos
- Node.js (v16+)
- MySQL Server
- npm ou yarn

### 1. Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Executar script
source database/carteira_database.sql
```

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas configurações
# Importante: alterar DB_PASSWORD, JWT_SECRET, EMAIL_USER, EMAIL_PASSWORD

# Iniciar servidor
npm start         # Produção
npm run dev       # Desenvolvimento (com nodemon)
```

### 3. Frontend

- Abrir arquivos HTML diretamente no navegador
- OU usar servidor HTTP local (Python, Live Server, etc)
- Alterar `API_URL` em `frontend/assets/js/auth.js` se necessário

## 🔗 Endpoints da API

### Autenticação

#### POST `/api/auth/registrar`
Registra novo usuário
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "Senha@123",
  "cpf": "12345678901",
  "telefone": "11999999999",
  "data_nascimento": "1990-01-01"
}
```

#### POST `/api/auth/login`
Realiza login
```json
{
  "email": "joao@email.com",
  "senha": "Senha@123"
}
```

#### POST `/api/auth/renovar-token`
Renova token de acesso
```json
{
  "refreshToken": "token_refresh"
}
```

#### POST `/api/auth/recuperar-senha`
Solicita recuperação de senha
```json
{
  "email": "joao@email.com"
}
```

#### POST `/api/auth/redefinir-senha`
Redefine a senha
```json
{
  "token": "token_recuperacao",
  "novaSenha": "NovaSenha@456"
}
```

#### POST `/api/auth/logout`
Realiza logout (requer autenticação)

## 🔐 Fluxo de Segurança

### Login
1. Usuário envia email + senha
2. Backend busca usuário no DB (prepared statement)
3. Compara senha com Bcrypt
4. Gera JWT token (15 min) + refresh token (7 dias)
5. Registra sessão na auditoria
6. Envia notificação por email
7. Salva tokens no localStorage do cliente

### Cadastro
1. Valida força de senha (frontend + backend)
2. Verifica email e CPF únicos
3. Sanitiza dados de entrada (XSS)
4. Criptografa senha com Bcrypt
5. Gera QR Code único
6. Cria usuário no banco (queries parametrizadas)
7. Gera tokens JWT
8. Retorna QR Code ao cliente

### Recuperação de Senha
1. Valida email existente (sem exposição)
2. Gera token único de 1 hora
3. Envia link com token por email
4. Usuário clica no link
5. Valida token e data de expiração
6. Solicita nova senha
7. Valida força de senha
8. Atualiza no banco com hash
9. Encerra todas as sessões (logout forçado)

## 📊 Tabelas do Banco

- **usuarios** - Dados de usuários com QR Code e tokens
- **carteiras** - Carteiras dos usuários
- **denuncias** - Denúncias registradas
- **recuperacao_senha** - Tokens de recuperação
- **sessoes** - Sessões ativas e refresh tokens
- **auditoria** - Log de todas as ações

## 🧪 Testando a Aplicação

### 1. Teste de Cadastro
- Acessar `frontend/pages/cadastro.html`
- Preencher com dados válidos
- Verificar validação de senha forte
- Confirmar email

### 2. Teste de Login
- Dados de teste já inseridos no banco
- Email: `admin@carteira.com`
- Token salvo no localStorage

### 3. Teste de Recuperação
- Acessar `frontend/pages/recuperar-senha.html`
- Usar email válido
- Verificar email-mock (modo desenvolvimento)

### 4. Teste de XSS
- Tentar injetar script: `<script>alert('xss')</script>`
- Será automaticamente sanitizado

### 5. Teste de SQL Injection
- Tentar: `' OR '1'='1` no email
- Queries parametrizadas prevenirão ataque

## ⚡ Performance e Boas Práticas

- ✅ Connection pooling no MySQL
- ✅ Índices nas tabelas principais
- ✅ JWT para escalabilidade (stateless)
- ✅ Async/await para operações assíncronas
- ✅ Error handling robusto
- ✅ Validação em 2 camadas (frontend + backend)
- ✅ Código modular e reutilizável

## 📝 Variáveis de Ambiente (.env)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=senha
DB_DATABASE=carteira
JWT_SECRET=sua_chave_secreta_64_chars
JWT_REFRESH_SECRET=sua_chave_refresh_secreta
PORT=3000
CORS_ORIGIN=http://localhost:5000
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=senha_app_específica
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verificar se MySQL está rodando
- Confirmar credenciais em .env
- Executar script SQL

### Erro: "CORS error"
- Adicionar domínio em `CORS_ORIGIN`
- Usar `http://localhost:PORT`

### Email não é enviado
- Gerar App Password (Gmail)
- Verificar `EMAIL_USER` e `EMAIL_PASSWORD`
- Testar com `nodemailer.createTestAccount()`

## 📚 Referências

- [OWASP Security Guidelines](https://owasp.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

---

**Desenvolvido com ❤️ e 🔐 Segurança**
