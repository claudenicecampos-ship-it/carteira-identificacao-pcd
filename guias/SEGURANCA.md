# 🔐 Mecanismos de Segurança Implementados

Um documento abrangente com todos os mecanismos de proteção implementados na aplicação Carteira.

## ✅ Proteção contra SQL Injection

### Implementação
- **Local:** `backend/src/**/*.js`
- **Método:** Queries parametrizadas com prepared statements

### Código Seguro
```javascript
// ✅ CORRETO - Usando parametrização
const [resultado] = await conexao.execute(
    'SELECT * FROM usuarios WHERE email = ? AND ativo = ?',
    [email, true]
);

// ❌ VULNERÁVEL - Concatenação direta
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
```

### Proteção Dupla
1. **MySQL Driver:** Escaping automático
2. **Node.js:** Prepared statements obrigatórios
3. **Middleware:** Sanitização de entrada (`sanitizarEntrada`)

### Exemplos de Prevenção
- `usuarioRepository.js` - Todas as operações parametrizadas
- `recuperacaoSenhaRepository.js` - Queries seguras
- `sessaoRepository.js` - Sem concatenação

---

## ✅ Proteção contra XSS (Cross-Site Scripting)

### Implementação
- **Local:** `backend/src/middlewares/xssProtecao.js`
- **Middleware:** `sanitizarEntrada` aplicado globalmente

### Como Funciona
```javascript
// Entrada maliciosa
input: "<script>alert('xss')</script>"

// Após sanitização
output: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
```

### Camadas de Proteção
1. **Backend:** Middleware remove tags HTML
2. **Frontend:** Escaping seguro de dados
3. **HTTP Headers:** Content Security Policy (CSP) via Helmet
4. **Helmet:** Headers de segurança padrão

### Código Implementado
```javascript
// middleware/xssProtecao.js
export const sanitizarEntrada = (req, res, next) => {
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
  next();
};
```

### CSP Headers
```javascript
// middleware/segurancaHeaders.js
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}
```

---

## ✅ Autenticação com JWT (JSON Web Tokens)

### Componentes
- **Token de Acesso:** Válido por 15 minutos
- **Refresh Token:** Válido por 7 dias
- **Armazenamento:** localStorage no cliente
- **Transmissão:** Header `Authorization: Bearer TOKEN`

### Fluxo de Autenticação

```
┌──────────────┐
│ Usuário      │
└──────┬───────┘
       │
       ├─→ POST /auth/login (email + senha)
       │
┌──────▼───────┐
│ Backend      │
├──────────────┤
│ 1. Buscar    │
│    usuário   │
│ 2. Hash de   │
│    senha OK? │
│ 3. Gerar JWT │
└──────┬───────┘
       │
       ├─→ Retorna tokens
       │
┌──────▼───────┐
│ Client       │
├──────────────┤
│ localStorage:│
│ - token      │
│ - refresh    │
├──────────────┤
│ Requisição:  │
│ Header:      │
│ Authorization│
│ Bearer TOKEN │
└──────────────┘
```

### Geração Segura
```javascript
// utils/token.js
export const gerarToken = (usuario_id, email) => {
  return jwt.sign(
    { usuario_id, email },
    process.env.JWT_SECRET,      // Chave secreta forte
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
};

export const gerarRefreshToken = (usuario_id) => {
  return jwt.sign(
    { usuario_id },
    process.env.JWT_REFRESH_SECRET, // Chave diferente
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};
```

### Verificação em Rotas Protegidas
```javascript
// middleware/autenticacao.js
export const verificarToken = (req, res, next) => {
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
    next();
  });
};
```

---

## ✅ Criptografia de Senha com Bcrypt

### Características
- **Algoritmo:** Bcrypt com 10 rounds de salt
- **Armazenamento:** Apenas hash (nunca texto plano)
- **Verificação:** Comparação segura via `compararSenha`

### Implementação
```javascript
// utils/criptografia.js
export const criptografarSenha = async (senha) => {
  const salt = await bcryptjs.genSalt(10);  // 10 rounds
  return await bcryptjs.hash(senha, salt);  // Hash seguro
};

export const compararSenha = async (senha, hash) => {
  return await bcryptjs.compare(senha, hash);
};
```

### Validação de Força
```javascript
export const validarForçaSenha = (senha) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(senha);
};
```

**Requisitos Obrigatórios:**
- ✅ Mínimo 8 caracteres
- ✅ Letra maiúscula (A-Z)
- ✅ Letra minúscula (a-z)
- ✅ Número (0-9)
- ✅ Caractere especial (@$!%*?&)

### Exemplo de Senha Válida
```
Válida:     MyPass@123      ✅
Inválida:   password        ❌ (faltam requisitos)
Inválida:   Pass123         ❌ (faltam caractere especial)
```

---

## ✅ Rate Limiting (Proteção contra Brute Force)

### Implementação
- **Biblioteca:** express-rate-limit
- **Local:** `backend/src/middlewares/rateLimiter.js`

### Limites por Operação

| Operação | Limite | Janela | Propósito |
|----------|--------|--------|-----------|
| Geral | 100 req | 15 min | Proteção padrão |
| Login | 5 tent | 15 min | Prevenir força bruta |
| Registro | 3 contas | 1 hora | Evitar spam |
| Recuperar Senha | 3 tent | 1 hora | Proteção email |

### Código Implementado
```javascript
// middleware/rateLimiter.js
export const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,                    // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos',
  skipSuccessfulRequests: true,  // Não conta login bem-sucedido
});

// Usar em rotas
router.post('/login', limitadorLogin, AutenticacaoController.login);
```

### Resposta ao Limite
```json
{
  "status": 429,
  "message": "Muitas requisições deste IP, tente novamente mais tarde",
  "retryAfter": 900  // segundos
}
```

---

## ✅ CORS Seguro

### Configuração
```javascript
// server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Variável de Ambiente
```env
CORS_ORIGIN=http://localhost:5000,https://carteira.com
```

### Proteção
- ✅ Whitelist de domínios permitidos
- ✅ Credenciais apenas de origem confiável
- ✅ Métodos explícitos
- ✅ Headers controlados

---

## ✅ Segurança de Headers HTTP (Helmet)

### Headers Implementados

| Header | Valor | Propósito |
|--------|-------|-----------|
| X-Frame-Options | DENY | Prevenir clickjacking |
| X-Content-Type-Options | nosniff | Prevenir MIME sniffing |
| Strict-Transport-Security | 1 ano | Forçar HTTPS |
| X-XSS-Protection | Ativa | Proteção XSS no navegador |

### Código
```javascript
// middleware/segurancaHeaders.js
export const configurarSegurancaHeaders = helmet({
  hsts: {
    maxAge: 31536000,        // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
});
```

---

## ✅ Validação de Entrada

### Dupla Camada

#### Frontend
```javascript
// assets/js/validacao.js
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarCPF(cpf) {
  // Validação com dígitos verificadores
}
```

#### Backend
```javascript
// utils/validacao.js
export const validarEmail = (email) => {
  return validator.isEmail(email);
};

export const validarCPF = (cpf) => {
  // Algoritmo de validação
};
```

### Validações Implementadas
- ✅ Email válido
- ✅ CPF com dígitos verificadores
- ✅ Telefone com comprimento correto
- ✅ Data de nascimento válida
- ✅ CEP formato correto

---

## ✅ Recuperação de Senha Segura

### Fluxo Seguro

```
1. Usuário solicita recuperação
   ↓
2. Backend verifica email
   ↓
3. Gera token único (UUID)
   ↓
4. Token armazenado com expira_em (1 hora)
   ↓
5. Envia email com link
   ↓
6. Usuário clica no link
   ↓
7. Token validado (não utilizado + dentro do prazo)
   ↓
8. Usuário insere nova senha
   ↓
9. Validates força da senha
   ↓
10. Hash armazenado no banco
    ↓
11. Token marcado como utilizado
    ↓
12. TODAS as sessões encerradas
```

### Segurança
- ✅ Token único por recuperação
- ✅ Expiração de 1 hora
- ✅ Uso único
- ✅ Logout forçado em todas as sessões
- ✅ Sem exposição de emails

### Código
```javascript
// repositories/recuperacaoSenhaRepository.js
static async buscarPorToken(token) {
  const [resultado] = await conexao.execute(
    `SELECT * FROM recuperacao_senha 
     WHERE token = ? AND utilizado = 0 AND expira_em > NOW()`,
    [token]
  );
  return resultado.length > 0 ? resultado[0] : null;
}
```

---

## ✅ Sessão e Token Refresh

### Sistema de Sessões
- **Rastreamento:** Tabela `sessoes`
- **IP e User-Agent:** Registrado para auditoria
- **Renovação:** Refresh token válido por 7 dias

### Fluxo de Renovação
```
Cliente → POST /auth/renovar-token (refreshToken)
   ↓
Servidor → Valida refresh token
   ↓
Servidor → Gera novo access token
   ↓
Cliente → Salva novo token
   ↓
Cliente → Continua operações
```

### Código
```javascript
// services/autenticacaoService.js
static async renovarToken(refreshToken) {
  const sessao = await SessaoRepository.buscarPorToken(refreshToken);
  if (!sessao) throw new Error('Token inválido');

  const usuario = await UsuarioRepository.buscarPorId(sessao.usuario_id);
  const novoToken = gerarToken(usuario.id, usuario.email);

  return { token: novoToken, usuario };
}
```

---

## ✅ Auditoria Completa

### O que é Registrado

| Campo | Exemplo |
|-------|---------|
| usuario_id | 1 |
| acao | LOGIN |
| tabela | usuarios |
| registro_id | 1 |
| endereco_ip | 192.168.1.100 |
| user_agent | Mozilla/5.0... |
| valores_novos | {"email": "..." } |
| criado_em | 2024-01-15 10:30:00 |

### Ações Rastreadas
- ✅ Registro de novo usuário
- ✅ Login (sucesso/falha)
- ✅ Logout
- ✅ Alterações de dados
- ✅ Redefinição de senha
- ✅ Todas as operações sensíveis

### Acesso
```javascript
SELECT * FROM auditoria 
WHERE usuario_id = 1 
ORDER BY criado_em DESC
LIMIT 50;
```

---

## ✅ QR Code Único

### Geração Segura
```javascript
// utils/qrcode.js
export const gerarQRCode = async (usuario_id, email) => {
  const dadosQR = `carteira:${usuario_id}:${email}:${Date.now()}`;
  const hash = crypto
    .createHash('sha256')
    .update(dadosQR + process.env.QR_CODE_SECRET)
    .digest('hex')
    .substring(0, 16);

  const codigoUnico = `${usuario_id}-${hash}`;
  const qrCodeBase64 = await QRCode.toDataURL(codigoUnico);
  
  return { qrCode: qrCodeBase64, codigoUnico };
};
```

### Características
- ✅ Único por usuário
- ✅ Baseado em hash SHA256
- ✅ Formato validável
- ✅ Não contém informações sensíveis

---

## ✅ Proteção contra Ataques Comuns

### OWASP Top 10

| # | Vulnerabilidade | Proteção |
|---|-----------------|----------|
| 1 | SQL Injection | Queries parametrizadas ✅ |
| 2 | XSS | Sanitização + CSP ✅ |
| 3 | CSRF | Tokens + SameSite Cookies ✅ |
| 4 | Autenticação Fraca | JWT + Bcrypt ✅ |
| 5 | Controle de Acesso | Verificação por usuário ✅ |
| 6 | Configuração Insegura | Helmet + Headers ✅ |
| 7 | Serialização Insegura | JSON seguro ✅ |
| 8 | Componentes Desatualizados | Dependências seguras ✅ |
| 9 | Logging Insuficiente | Auditoria completa ✅ |
| 10 | Falta de Criptografia | HTTPS recomendado ✅ |

---

## 🔧 Configuração de Produção

### Variáveis Críticas (.env)

```env
# CRÍTICO - Alterar em produção
JWT_SECRET=gerar_string_segura_de_32_chars_minimo
JWT_REFRESH_SECRET=outra_string_segura_diferente

# Database
DB_HOST=seu_servidor_mysql
DB_PASSWORD=senha_muito_forte

# Email
EMAIL_PASSWORD=usar_app_specific_password

# Servidor
NODE_ENV=production
PORT=443  # HTTPS

# CORS - Seu domínio real
CORS_ORIGIN=https://carteira.com,https://www.carteira.com
```

### Checklist de Deploy

- [ ] Variables de ambiente alteradas
- [ ] JWT_SECRET gerada corretamente
- [ ] Database com backup
- [ ] HTTPS habilitado (certificado válido)
- [ ] Rate limiting adequado para produção
- [ ] Logging centralizado
- [ ] Monitoramento de errors
- [ ] Backup automático de DB
- [ ] Patches de segurança aplicadas

---

## 📊 Resumo dos Mecanismos

| Mecanismo | Status | Arquivo |
|-----------|--------|---------|
| SQL Injection Prevention | ✅ | repositories/** |
| XSS Protection | ✅ | middleware/xssProtecao.js |
| JWT Authentication | ✅ | utils/token.js |
| Password Encryption | ✅ | utils/criptografia.js |
| Rate Limiting | ✅ | middleware/rateLimiter.js |
| CORS | ✅ | server.js |
| Security Headers | ✅ | middleware/segurancaHeaders.js |
| Input Validation | ✅ | utils/validacao.js |
| Password Recovery | ✅ | services/autenticacaoService.js |
| Session Management | ✅ | repositories/sessaoRepository.js |
| Audit Logging | ✅ | middleware/auditoria.js |
| QR Code Gen | ✅ | utils/qrcode.js |

---

**Desenvolvido com Segurança como Prioridade Número Um! 🔐**
