# 📊 Informações Armazenadas em Cada Tabela do Banco de Dados

## 1️⃣ Tabela: `usuarios`
**O que salva:** Informações de cadastro e autenticação dos usuários

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único do usuário (chave primária) |
| `nome` | VARCHAR(255) | Nome completo do usuário |
| `email` | VARCHAR(255) | Email único para login e contato |
| `senha` | VARCHAR(255) | Senha criptografada do usuário |
| `cpf` | VARCHAR(11) | CPF único (11 dígitos) |
| `telefone` | VARCHAR(15) | Telefone para contato |
| `data_nascimento` | DATE | Data de nascimento (formato: YYYY-MM-DD) |
| `endereco` | TEXT | Endereço completo do usuário |
| `cidade` | VARCHAR(100) | Cidade de residência |
| `estado` | VARCHAR(2) | UF - Estado (ex: SP, RJ) |
| `cep` | VARCHAR(10) | Código de Endereçamento Postal |
| `qr_code` | VARCHAR(191) | QR Code único gerado para identificação |
| `refreshToken` | VARCHAR(191) | Token de renovação de autenticação |
| `ativo` | BOOLEAN | Status do usuário (ativo = TRUE, bloqueado = FALSE) |
| `criado_em` | TIMESTAMP | Data/hora de criação do registro |
| `atualizado_em` | TIMESTAMP | Data/hora da última alteração |

---

## 2️⃣ Tabela: `carteiras`
**O que salva:** Carteiras de identificação PCD do usuário

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único da carteira |
| `usuario_id` | INT | ID do usuário proprietário (FK) |
| `tipo` | VARCHAR(50) | Tipo de carteira (ex: física, digital) |
| `numero_carteira` | VARCHAR(100) | Número único da carteira |
| `descricao` | TEXT | Descrição/observações sobre a carteira |
| `saldo` | DECIMAL(10,2) | Saldo/créditos na carteira |
| `moeda` | VARCHAR(3) | Moeda usada (ex: BRL, USD) |
| `ativa` | BOOLEAN | Status da carteira (ativa = TRUE) |
| `criada_em` | TIMESTAMP | Data/hora de criação |
| `atualizada_em` | TIMESTAMP | Data/hora da última alteração |

---

## 3️⃣ Tabela: `denuncias`
**O que salva:** Denúncias de violação de direitos e discriminação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único da denúncia |
| `usuario_id` | INT | ID do usuário que reportou (FK) |
| `titulo` | VARCHAR(255) | Título resumido da denúncia |
| `descricao` | TEXT | Descrição detalhada do ocorrido |
| `tipo_denuncia` | VARCHAR(100) | Tipo (ex: discriminação, violência, negação de direito) |
| `status` | VARCHAR(50) | Status (pendente, em análise, encerrada, resolvida) |
| `prioridade` | VARCHAR(20) | Nível (normal, alta, urgente) |
| `localidade` | TEXT | Local onde ocorreu (endereço/cidade) |
| `evidencia_url` | TEXT | URL de imagens/documentos anexados |
| `criada_em` | TIMESTAMP | Data/hora de criação |
| `atualizada_em` | TIMESTAMP | Data/hora da última alteração |
| `resolvida_em` | TIMESTAMP | Data/hora de resolução (NULL até ser resolvida) |

---

## 4️⃣ Tabela: `recuperacao_senha`
**O que salva:** Tokens para recuperação de senha do usuário

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único do token |
| `usuario_id` | INT | ID do usuário que solicitou (FK) |
| `token` | VARCHAR(255) | Token único e seguro para redefinição |
| `expira_em` | TIMESTAMP | Data/hora de expiração do token (1 hora) |
| `utilizado` | BOOLEAN | Se já foi usado (TRUE = já redefiniu) |
| `criado_em` | TIMESTAMP | Data/hora de geração do token |

---

## 5️⃣ Tabela: `sessoes`
**O que salva:** Sessões ativas e histórico de acesso dos usuários

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único da sessão |
| `usuario_id` | INT | ID do usuário logado (FK) |
| `token_refresh` | VARCHAR(191) | Token para renovar autenticação |
| `endereco_ip` | VARCHAR(45) | IP do dispositivo (IPv4 ou IPv6) |
| `user_agent` | TEXT | Navegador/dispositivo usado (ex: Chrome, Safari) |
| `ativa` | BOOLEAN | Se a sessão está válida (ativa = TRUE) |
| `criada_em` | TIMESTAMP | Data/hora de login |
| `expira_em` | TIMESTAMP | Data/hora de expiração (7 dias por padrão) |
| `ultimo_acesso` | TIMESTAMP | Data/hora do último acesso |

---

## 6️⃣ Tabela: `auditoria`
**O que salva:** Log de todas as ações/alterações realizadas no sistema

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único do log |
| `usuario_id` | INT | ID do usuário que realizou a ação |
| `acao` | VARCHAR(100) | Tipo de ação (INSERT, UPDATE, DELETE, LOGIN, LOGOUT) |
| `tabela` | VARCHAR(100) | Qual tabela foi afetada |
| `registro_id` | INT | ID do registro que foi modificado |
| `valores_antigos` | TEXT | Dados anteriores (para rastrear mudanças) |
| `valores_novos` | TEXT | Dados novos (para rastrear mudanças) |
| `endereco_ip` | VARCHAR(45) | IP de quem fez a ação |
| `user_agent` | TEXT | Navegador/dispositivo de quem fez |
| `criado_em` | TIMESTAMP | Data/hora da ação |

---

## 🤔 Análise: Tabela `carteiras` é Necessária?

### ✅ **Por que MANTER a tabela `carteiras` separada:**

1. **Relação 1:N (Um-para-Muitos)**
   - Um usuário pode ter **múltiplas carteiras**
   - Ex: Carteira física + digital, temporária + permanente

2. **Ciclo de Vida Independente**
   - Carteira pode ser **desativada** sem bloquear o usuário
   - Cada carteira tem seu próprio `numero_carteira` único
   - Histórico de criação/ativação separado

3. **Campos Específicos da Carteira**
   - `saldo` (créditos/benefícios)
   - `moeda` (BRL, USD)
   - `tipo` (física, digital, temporária)
   - `numero_carteira` (código único)

4. **Flexibilidade Futura**
   - Adicionar campos sem alterar `usuarios`
   - Suporte a carteiras compartilhadas
   - Rastreamento de uso por carteira

### ❌ **Alternativa: Salvar na tabela `usuarios`**

Se cada usuário tiver **apenas uma carteira**, você poderia adicionar campos em `usuarios`:

```sql
ALTER TABLE usuarios ADD COLUMN (
    tipo_carteira VARCHAR(50),
    numero_carteira VARCHAR(100) UNIQUE,
    saldo DECIMAL(10,2) DEFAULT 0.00,
    moeda VARCHAR(3) DEFAULT 'BRL',
    carteira_ativa BOOLEAN DEFAULT TRUE,
    carteira_criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Vantagens:**
- Schema mais simples
- Menos JOINs nas consultas
- Menos tabelas para gerenciar

**Desvantagens:**
- Limita a 1 carteira por usuário
- Polui a tabela `usuarios` com campos específicos
- Dificulta expansão futura

### 💡 **Recomendação**

**Mantenha a tabela `carteiras`** porque:
- PCD pode ter diferentes tipos de carteiras
- Permite expansão para múltiplas carteiras
- Mantém organização e flexibilidade
- É padrão em sistemas similares

Se quiser **simplificar**, pode remover `carteiras` e mover os campos para `usuarios`, mas perderá flexibilidade.

---

## 📋 Resumo Rápido

| Tabela | Salva | Exemplo |
|--------|-------|---------|
| **usuarios** | Dados pessoais, email, CPF, enderço | Pedro, pedro@email.com, 12345678901 |
| **carteiras** | Carteiras de identificação PCD | Carteira 123456, tipo: física, ativa |
| **denuncias** | Reclamações de discriminação/direitos | "Fui discriminado no banco", status: pendente |
| **recuperacao_senha** | Tokens temporários para mudar senha | Token: xyz123abc, expira em 1 hora |
| **sessoes** | Logins ativos e acessos | Usuário logado de IP 192.168.1.1, válido por 7 dias |
| **auditoria** | Histórico de TUDO que aconteceu | Quem fez o quê, quando, de onde |

---

## 🔗 Relacionamentos (Chaves Estrangeiras)

- **usuarios** ← principal
  - `carteiras.usuario_id` → `usuarios.id`
  - `denuncias.usuario_id` → `usuarios.id`
  - `recuperacao_senha.usuario_id` → `usuarios.id`
  - `sessoes.usuario_id` → `usuarios.id`
  - `auditoria.usuario_id` → `usuarios.id` (opcional)

> **Cascata:** Se um usuário for deletado, todos seus dados em carteiras, denúncias, etc. são removidos automaticamente.

---

**Data:** 02/04/2026 | **Versão:** 1.0
