# 📊 Scripts de Gerenciamento do Banco de Dados

Este diretório contém scripts úteis para gerenciar o banco de dados SQLite da aplicação Carteira de Identificação PCD.

## 📋 Scripts Disponíveis

### 1. **Reset Database** (`reset-database.js`)
Limpa completamente o banco de dados e recria as tabelas do zero.

```bash
npm run reset-db
```

**O que faz:**
- ❌ Remove o arquivo `database.db`
- ✅ Cria um novo banco de dados vazio
- 📋 Recria todas as tabelas (users, cards, emergency_contacts)
- 🔑 Cria índices para melhor performance
- ⚠️ **Aviso:** Todos os dados serão perdidos!

**Quando usar:**
- Início do desenvolvimento
- Testes com dados limpos
- Correção de problemas no esquema

---

### 2. **Seed Database** (`seed-database.js`)
Popula o banco com dados de exemplo para testes.

```bash
npm run seed-db
```

**O que faz:**
- 👤 Cria 2 usuários de teste com senhas
- 🎫 Cria 2 carteiras PCD de exemplo
- 📞 Cria contatos de emergência
- 🔐 Senhas em hash (bcryptjs)

**Dados de Teste Criados:**

**Usuário 1:**
- Email: `usuario1@teste.com`
- Senha: `senha123`
- Carteira: PCD-2024-001 (João Silva Santos)

**Usuário 2:**
- Email: `usuario2@teste.com`
- Senha: `senha456`
- Carteira: PCD-2024-002 (Maria Oliveira Costa)

**Quando usar:**
- Após reset do banco
- Teste de funcionalidades
- Demonstrações
- Testes de segurança

---

### 3. **Backup Database** (`backup-database.js`)
Cria uma cópia de segurança do banco de dados atual.

```bash
npm run backup-db
```

**O que faz:**
- 💾 Cria cópia do banco em `backend/backups/`
- 📅 Nomeia com timestamp (ex: `database-2024-03-26_123456.db`)
- 📊 Exibe tamanho do backup
- 📋 Lista últimos 5 backups

**Quando usar:**
- Antes de testes destrutivos
- Salvar dados importantes
- Recuperação em caso de problema
- Controle de versão

---

### 4. **Initialize Database** (Combinado)
Executa reset e seed em sequência.

```bash
npm run init-db
```

**Equivalente a:**
```bash
npm run reset-db && npm run seed-db
```

**Quando usar:**
- Primeira vez configurando o projeto
- Resetar para estado de teste padrão

---

## 🚀 Guia Rápido de Uso

### Primeira Execução
```bash
# 1. Navegar para pasta do backend
cd backend

# 2. Instalar dependências (se não feito ainda)
npm install

# 3. Inicializar banco com dados de teste
npm run init-db

# 4. Iniciar servidor
npm start
```

### Fluxo de Testes
```bash
# 1. Backup de segurança (opcional)
npm run backup-db

# 2. Limpar banco
npm run reset-db

# 3. Popular com dados de teste
npm run seed-db

# 4. Iniciar testes
npm start
```

### Recuperação de Erro
```bash
# Se banco ficar corrompido:
npm run init-db

# Se precisar melhorar o esquema:
npm run reset-db
# [Editar database.js se necessário]
npm run seed-db
```

---

## 🗂️ Estrutura do Banco de Dados

```
database.db
├── users (Usuários)
│   ├── id (PK)
│   ├── email (UNIQUE)
│   ├── password (hash bcryptjs)
│   └── created_at
│
├── cards (Carteiras)
│   ├── id (PK)
│   ├── user_id (FK → users.id)
│   ├── numero_carteira (UNIQUE)
│   ├── nome, cpf, rg
│   ├── data_nascimento, sexo
│   ├── tipo_deficiencia, grau_deficiencia
│   ├── foto (BLOB)
│   ├── laudo_file (BLOB)
│   └── [...outros campos]
│
└── emergency_contacts (Contatos)
    ├── id (PK)
    ├── card_id (FK → cards.id)
    ├── nome, telefone, parentesco
```

---

## 🔍 Consultas Úteis

Se quiser verificar os dados manualmente:

```bash
# Abrir banco no SQLite CLI
sqlite3 backend/database.db

# Listar usuários
SELECT id, email, created_at FROM users;

# Listar carteiras
SELECT id, numero_carteira, nome, tipo_deficiencia FROM cards;

# Listar contatos de emergência
SELECT c.nome, e.nome, e.telefone FROM cards c
LEFT JOIN emergency_contacts e ON c.id = e.card_id;

# Sair
.exit
```

---

## 📈 Performance

Índices foram criados para otimizar queries:
- ✅ `idx_users_email` - Busca rápida por email
- ✅ `idx_cards_user_id` - Carteiras por usuário
- ✅ `idx_cards_cpf` - Busca por CPF
- ✅ `idx_emergency_card_id` - Contatos por carteira

---

## 🛡️ Segurança

✅ **Implementado:**
- Senhas com hash bcryptjs (10 rounds)
- Prepared statements (SQL injection protection)
- Foreign keys habilitadas
- Índices para validação de UNIQUE

---

## 📝 Editar Dados de Teste

Para personalizar os dados de teste, edite:
```
backend/scripts/seed-database.js
```

Procure por:
```javascript
db.run(`INSERT OR IGNORE INTO users...`, [
  // Modifique email/senha aqui
  'novo@email.com',
  hashedPassword
```

Depois execute:
```bash
npm run init-db
```

---

## 🆘 Troubleshooting

**Erro: "database.db is locked"**
- Feche todas as conexões do banco
- Pode haver outro servidor rodando
- Execute: `taskkill /IM node.exe /F` (Windows)

**Erro ao fazer seed**
- Verifique se reset foi bem-sucedido
- Verifique dependências: `npm install bcryptjs`

**Backup não criado**
- Verifique permissões de pasta `backend/backups/`
- Pasta será criada automaticamente se não existir

---

## 📚 Referências

- **SQLite**: https://www.sqlite.org/
- **bcryptjs**: https://github.com/dcodeIO/bcrypt.js
- **Node.js sqlite3**: https://github.com/mapbox/node-sqlite3

---

**Última atualização:** Março 2024
**Versão:** 1.0.0
