# ⚡ Quick Start - Carteira

Guia rápido para colocar a aplicação em funcionamento em menos de 5 minutos.

## Pré-requisitos
- Node.js 16+ instalado
- MySQL Server executando
- npm/yarn

## 1️⃣ Banco de Dados (2 minutos)

### Windows - CMD ou PowerShell:
```batch
mysql -u root -p < database\carteira_database.sql
```

### Mac/Linux:
```bash
mysql -u root -p < database/carteira_database.sql
```

Será solicitada a senha do MySQL. Digite e pressione Enter.

## 2️⃣ Backend (2 minutos)

```bash
cd backend

# Copiar configurações
copy .env.example .env          # Windows
cp .env.example .env            # Mac/Linux

# Instalar dependências
npm install

# ⚠️ IMPORTANTE: Editar o arquivo .env com suas configurações
# - DB_PASSWORD: sua senha do MySQL
# - JWT_SECRET: gerar uma chave segura (mínimo 32 caracteres)
# - EMAIL_USER e EMAIL_PASSWORD: suas credenciais de email (opcional)

# Iniciar servidor
npm start
```

**Esperado:**
```
✅ Servidor rodando em http://localhost:3000
📝 Health check: http://localhost:3000/health
🔐 Segurança: JWT, XSS Protection, Rate Limiting, SQL Injection Prevention
```

## 3️⃣ Frontend (30 segundos)

### Opção A - Usar Live Server (Recomendado)
1. Instalar extensão "Live Server" no VS Code
2. Abrir `frontend/pages/login.html`
3. Botão direito → "Open with Live Server"

### Opção B - Diretamente no Navegador
1. Abrir `frontend/pages/login.html` no navegador
2. Ou servir via Python:
   ```bash
   python -m http.server 5000
   ```

### Opção C - Usar Node.js http-server
```bash
npm install -g http-server
cd frontend
http-server -p 5000
```

## 🧪 Testando

### 1. Abre Frontend
- Vá para: `http://localhost:5000/pages/login.html` (ou onde estiver)
- Ou `frontend/pages/login.html` localmente

### 2. Crie uma Conta
- Clique em "Criar nova conta"
- Preencha o formulário
- Senha deve ter: Maiúscula, minúscula, número, especial, 8+ caracteres
- Exemplo: `Senha@123`

### 3. Faça Login
- Use credenciais criadas

### 4. Dashboard
- Veja seu QR Code único
- Notificação de segurança

## 🔗 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `backend/.env` | Configurações sensíveis (criar a partir de `.env.example`) |
| `database/carteira_database.sql` | Schema MySQL |
| `frontend/pages/login.html` | Tela de login |
| `frontend/pages/cadastro.html` | Tela de cadastro |
| `frontend/pages/recuperar-senha.html` | Recuperação de senha |
| `README.md` | Documentação completa |
| `GUIA_IMPLEMENTACAO.md` | Como adicionar novas funcionalidades |

## 🆘 Troubleshooting

### Erro: "Cannot connect to database"
```bash
# Verificar se MySQL está rodando
mysql -u root -p
# Confirmar .env tem credenciais corretas
```

### Erro: CORS
- Frontend em porta diferente? Adicione em `backend/.env`:
  ```
  CORS_ORIGIN=http://localhost:PORTA_FRONTEND
  ```

### Erro: "Port 3000 already in use"
```bash
# Mudar porta em .env
PORT=3001
```

### Email não funciona
- Usar Gmail? Gerar [App Password](https://myaccount.google.com/apppasswords)
- Inserir em `EMAIL_PASSWORD` no `.env`

## 📊 API Endpoints

```
POST   /api/auth/registrar          # Criar conta
POST   /api/auth/login              # Fazer login
POST   /api/auth/renovar-token      # Renovar JWT
POST   /api/auth/recuperar-senha    # Solicitar recuperação
POST   /api/auth/redefinir-senha    # Redefinir senha
POST   /api/auth/logout             # Fazer logout
GET    /health                      # Health check
```

## 🔐 URLs de Teste

| Página | URL |
|--------|-----|
| Login | `http://localhost:5000/pages/login.html` |
| Cadastro | `http://localhost:5000/pages/cadastro.html` |
| Recuperação | `http://localhost:5000/pages/recuperar-senha.html` |
| Dashboard | `http://localhost:5000/index.html` |
| API Health | `http://localhost:3000/health` |

## 📝 Dados de Teste

Usuário criado automaticamente no banco:
- **Email:** admin@carteira.com
- **Senha:** (hash - use interface de cadastro)

## ✅ Checklist

- [ ] MySQL rodando
- [ ] `backend/.env` editado com credenciais
- [ ] `npm install` completo
- [ ] `npm start` sem erros
- [ ] Frontend abrindo sem CORS errors
- [ ] Consegue registrar novo usuário
- [ ] Consegue fazer login
- [ ] Dashboard mostra QR Code

## 🚀 Próximas Etapas

1. Implementar funcionalidades de carteiras (ver `GUIA_IMPLEMENTACAO.md`)
2. Configurar SSL/HTTPS em produção
3. Configurar domínio real
4. Implementar recuperação de senha por email
5. Adicionar testes automatizados

## 📞 Suporte

Problemas? Consulte:
- `README.md` - Documentação completa
- `GUIA_IMPLEMENTACAO.md` - Como expandir a aplicação
- `backend/.env.example` - Todas as variáveis disponíveis

---

**Tudo pronto? Boa sorte no desenvolvimento! 🎉**
