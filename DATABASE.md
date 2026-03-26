# 📊 Documentação do Banco de Dados

## Visão Geral

O banco de dados SQLite armazena dados da Carteira de Identificação PCD com suporte a múltiplos usuários, múltiplas carteiras por usuário e contatos de emergência.

---

## 🏗️ Diagrama de Relacionamento (ER Diagram)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │──────────┐
│ email (UNIQUE)  │          │
│ password        │          │
│ created_at      │          │
└─────────────────┘          │
                              │ 1:N
                              │
                    ┌─────────────────────────────┐
                    │         CARDS               │
                    ├─────────────────────────────┤
                    │ id (PK)                     │──────┐
                    │ user_id (FK)                │      │
                    │ numero_carteira (UNIQUE)    │      │
                    │ nome                        │      │
                    │ cpf (UNIQUE)                │      │ 1:N
                    │ rg                          │      │
                    │ data_nascimento             │      │
                    │ sexo                        │      │
                    │ telefone                    │      │
                    │ email                       │      │
                    │ endereco                    │      │
                    │ cidade                      │      │
                    │ estado                      │      │
                    │ tipo_deficiencia            │      │
                    │ grau_deficiencia            │      │
                    │ cid                         │      │
                    │ numero_laudo                │      │
                    │ data_laudo                  │      │
                    │ nome_medico                 │      │
                    │ crm_medico                  │      │
                    │ acompanhante                │      │
                    │ foto (BLOB)                 │      │
                    │ laudo_file (BLOB)           │      │
                    │ data_emissao                │      │
                    │ validade                    │      │
                    │ codigo_verificacao (UNIQUE) │      │
                    │ created_at                  │      │
                    └─────────────────────────────┘      │
                                                          │
                              ┌───────────────────────────┘
                              │
                    ┌─────────────────────────────┐
                    │  EMERGENCY_CONTACTS         │
                    ├─────────────────────────────┤
                    │ id (PK)                     │
                    │ card_id (FK)                │
                    │ nome                        │
                    │ telefone                    │
                    │ parentesco                  │
                    └─────────────────────────────┘
```

---

## 📋 Tabelas Detalhadas

### 1️⃣ Tabela: `USERS`

**Propósito:** Armazenar credenciais de usuários

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Identificador único |
| `email` | TEXT | UNIQUE, NOT NULL | Email único do usuário |
| `password` | TEXT | NOT NULL | Senha com hash bcryptjs |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `email` (idx_users_email)

**Exemplo:**
```sql
INSERT INTO users (email, password)
VALUES ('usuario@teste.com', '$2a$10$...');
```

---

### 2️⃣ Tabela: `CARDS`

**Propósito:** Armazenar dados das carteiras PCD

| Coluna | Tipo | Modelo | Descrição |
|--------|------|--------|-----------|
| `id` | INTEGER | PK, AI | ID único da carteira |
| `user_id` | INTEGER | FK → users.id | Usuário proprietário |
| `numero_carteira` | TEXT | UNIQUE | Número único da carteira (ex: PCD-2024-001) |
| `nome` | TEXT | - | Nome completo |
| `data_nascimento` | DATE | - | Data dd/mm/yyyy |
| `sexo` | TEXT | - | M/F |
| `cpf` | TEXT | UNIQUE | CPF com ou sem máscara |
| `rg` | TEXT | - | RG documentação |
| `telefone` | TEXT | - | Telefone de contato |
| `email` | TEXT | - | Email do titular |
| `endereco` | TEXT | - | Endereço completo |
| `cidade` | TEXT | - | Município |
| `estado` | TEXT | - | UF (SP, RJ, etc) |
| `tipo_deficiencia` | TEXT | - | Tipo (Mobilidade, Visual, Auditiva, etc) |
| `grau_deficiencia` | TEXT | - | Grau (Leve, Moderado, Severo) |
| `cid` | TEXT | - | Código ICD-11 (ex: M54) |
| `numero_laudo` | TEXT | - | Número de identificação do laudo |
| `data_laudo` | DATE | - | Data do laudo médico |
| `nome_medico` | TEXT | - | Nome do médico responsável |
| `crm_medico` | TEXT | - | CRM/CREMESP do médico |
| `acompanhante` | BOOLEAN | DEFAULT 0 | Tem direito a acompanhante |
| `foto` | BLOB | - | Foto em base64 ou binário |
| `laudo_file` | BLOB | - | Documento do laudo em binário |
| `data_emissao` | DATE | DEFAULT CURRENT_DATE | Data de emissão |
| `validade` | DATE | - | Data de validade |
| `codigo_verificacao` | TEXT | UNIQUE | Código QR/verificação (ex: VER-PCD-2024-001) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Quando foi criada |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → users.id
- UNIQUE: `numero_carteira`, `cpf`, `codigo_verificacao`
- INDEX: idx_cards_user_id, idx_cards_cpf

**Exemplo:**
```sql
INSERT INTO cards (
  user_id, numero_carteira, nome, data_nascimento, sexo,
  cpf, tipo_deficiencia, grau_deficiencia, cid
) VALUES (
  1, 'PCD-2024-001', 'João Silva', '1990-01-15', 'M',
  '12345678901', 'Mobilidade Reduzida', 'Moderado', 'M54'
);
```

---

### 3️⃣ Tabela: `EMERGENCY_CONTACTS`

**Propósito:** Armazenar contatos de emergência para cada carteira

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | ID único |
| `card_id` | INTEGER | FK → cards.id | Carteira relacionada |
| `nome` | TEXT | NOT NULL | Nome do contato |
| `telefone` | TEXT | NOT NULL | Telefone de contato |
| `parentesco` | TEXT | - | Relacionamento (Esposa, Filho, Irmão, etc) |

**Índices:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `card_id` → cards.id (idx_emergency_card_id)

**Exemplo:**
```sql
INSERT INTO emergency_contacts (card_id, nome, telefone, parentesco)
VALUES (1, 'Ana Silva', '11987654321', 'Esposa');
```

---

## 🔑 Relacionamentos

### Um Usuário → Muitas Carteiras (1:N)
```sql
SELECT u.email, c.numero_carteira, c.nome
FROM users u
LEFT JOIN cards c ON u.id = c.user_id
WHERE u.email = 'usuario@teste.com';
```

### Uma Carteira → Muitos Contatos (1:N)
```sql
SELECT c.numero_carteira, e.nome, e.telefone, e.parentesco
FROM cards c
LEFT JOIN emergency_contacts e ON c.id = e.card_id
WHERE c.numero_carteira = 'PCD-2024-001';
```

---

## 🛡️ Integridade Referencial

**Foreign Keys Habilitadas:**

```sql
PRAGMA foreign_keys = ON;
```

- `cards.user_id` → `users.id`
- `emergency_contacts.card_id` → `cards.id`

**Comportamento:**
- ❌ Não pode inserir carteira sem usuário válido
- ❌ Não pode inserir contato sem carteira válida
- 🗑️ Deletar usuário → Deleta suas carteiras
- 🗑️ Deletar carteira → Deleta seus contatos

---

## 📊 Queries Úteis

### Usuários
```sql
-- Listar todos os usuários
SELECT id, email, created_at FROM users;

-- Listar carteiras de um usuário
SELECT email, COUNT(*) as total_carteiras
FROM users u
LEFT JOIN cards c ON u.id = c.user_id
GROUP BY u.id;

-- Usuário com mais carteiras
SELECT email, COUNT(*) as total
FROM users u
LEFT JOIN cards c ON u.id = c.user_id
GROUP BY u.id
ORDER BY total DESC LIMIT 1;
```

### Carteiras
```sql
-- Todas as carteiras com dados do usuário
SELECT u.email, c.numero_carteira, c.nome, c.tipo_deficiencia
FROM users u
JOIN cards c ON u.id = c.user_id;

-- Carteiras expirando em 2024
SELECT numero_carteira, nome, validade
FROM cards
WHERE DATE(validade) <= DATE('2024-12-31')
ORDER BY validade ASC;

-- Carteiras por tipo de deficiência
SELECT tipo_deficiencia, COUNT(*) as total
FROM cards
GROUP BY tipo_deficiencia;

-- Carteiras com acompanhante
SELECT numero_carteira, nome, acompanhante
FROM cards
WHERE acompanhante = 1;
```

### Contatos
```sql
-- Contatos de uma carteira
SELECT nome, telefone, parentesco
FROM emergency_contacts
WHERE card_id = 1;

-- Carteira com seus contatos
SELECT c.numero_carteira, c.nome as titular,
       e.nome as contato, e.telefone, e.parentesco
FROM cards c
LEFT JOIN emergency_contacts e ON c.id = e.card_id
WHERE c.numero_carteira = 'PCD-2024-001';
```

---

## 🔄 Fluxo de Dados

```
1. Usuário se registra
   → INSERT INTO users (email, password)
   ↓
2. Usuário faz login
   ← SELECT * FROM users WHERE email = ?
   ↓
3. Usuário cria carteira
   → INSERT INTO cards (user_id, ...)
   ↓
4. Sistema verifica dados
   ← SELECT * FROM cards WHERE user_id = ?
   ↓
5. Usuário adiciona contato
   → INSERT INTO emergency_contacts (card_id, ...)
   ↓
6. Usuário visualiza carteira completa
   ← SELECT c.*, e.* FROM cards c
      LEFT JOIN emergency_contacts e ON c.id = e.card_id
```

---

## 📈 Estimativa de Tamanho

Exemplo para 1.000 usuários:

| Tabela | Registros | Tamanho Estimado |
|--------|-----------|-----------------|
| users | 1.000 | ~100 KB |
| cards | 2.000 | ~2 MB (com fotos em BLOB) |
| emergency_contacts | 4.000 | ~150 KB |
| **Total** | ~7.000 | **~2-3 MB** |

*Nota: BLOB de fotos pode aumentar consideravelmente*

---

## 🔐 Segurança

✅ **Implementado:**
- Senhas com hash bcryptjs (não armazenadas em texto plano)
- Prepared statements (proteção contra SQL injection)
- Foreign keys para integridade referencial
- UNIQUE constraints para evitar duplicatas
- Validação de tipo MIME em uploads

---

## 🚀 Otimizações Aplicadas

1. **Índices Criados:**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_cards_user_id ON cards(user_id);
   CREATE INDEX idx_cards_cpf ON cards(cpf);
   CREATE INDEX idx_emergency_card_id ON emergency_contacts(card_id);
   ```

2. **Queries Otimizadas:**
   - Uso de prepared statements
   - JOINs eficientes
   - Limit/Offset para paginação

3. **Armazenamento:**
   - BLOB para fotos/documentos
   - TEXT para descrições longas
   - DATE para comparações temporais

---

## 📝 Versionamento

| Versão | Data | Mudanca |
|--------|------|---------|
| 1.0 | Mar 2024 | Criação inicial do schema |

---

## 🆘 Recovery

**Restaurar de backup:**
```bash
# 1. Parar servidor
# 2. Copiar backup
cp backups/database-2024-03-26_123456.db backend/database.db
# 3. Iniciar servidor
npm start
```

---

**Última atualização:** Março 2024
