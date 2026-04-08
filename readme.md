# Carteira de Identificação PCD

Sistema de carteira digital para pessoas com deficiência, conforme Lei 13.146/2015.

## Estrutura do Projeto

O projeto foi reestruturado em arquitetura tradicional multi-page com separação por camadas:

```
carteira-identificacao-pcd/
├── backend/                 # Backend Node.js com MVC
│   ├── config/
│   │   └── database.js      # Configuração SQLite
│   ├── controllers/         # Lógica de controle
│   ├── middleware/
│   │   └── auth.js          # Autenticação JWT
│   ├── models/
│   │   ├── User.js          # Modelo de usuário
│   │   └── Card.js          # Modelo de carteira
│   ├── routes/
│   │   ├── auth.js          # Rotas de autenticação
│   │   ├── cards.js         # Rotas de carteiras
│   │   └── users.js         # Rotas de usuários
│   ├── server.js            # Servidor principal
│   └── package.json
├── frontend/
│   └── public/              # Arquivos estáticos
│       ├── index.html       # Página de cadastro/login
│       ├── carteira.html    # Visualização da carteira
│       ├── verificar.html   # Verificação via QR Code
│       ├── styles.css       # Estilos
│       ├── script.js        # Lógica do frontend
│       ├── carteira.js      # Lógica da carteira
│       └── verificar.js     # Lógica de verificação
└── readme.md
```

## Funcionalidades Implementadas

### Segurança
- **XSS Protection**: Sanitização de entradas usando DOMPurify
- **SQL Injection Protection**: Uso de prepared statements
- **Autenticação JWT**: Tokens seguros para sessões
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Helmet**: Headers de segurança HTTP

### Backend
- API RESTful com Express.js
- Banco de dados SQLite
- Autenticação de usuários
- CRUD de carteiras PCD
- Upload de arquivos (foto e laudo médico)
- Validação de dados

### Frontend
- Interface responsiva
- Formulário de cadastro com validações
- Sistema de login
- Visualização da carteira digital
- QR Code para verificação
- Verificação pública de carteiras

## Como Executar

### Backend
```bash
cd backend
npm install
npm start
# ou para desenvolvimento:
npm run dev
```

### Frontend
O frontend é servido pelo backend. Acesse http://localhost:3000

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual

### Carteiras
- `POST /api/cards` - Criar carteira (autenticado)
- `GET /api/cards/my` - Obter carteira do usuário (autenticado)
- `GET /api/cards/verify/:code` - Verificar carteira publicamente

## Banco de Dados

O sistema usa SQLite com as seguintes tabelas:
- `users`: Usuários do sistema
- `cards`: Carteiras PCD
- `emergency_contacts`: Contatos de emergência

## Validações Implementadas

- CPF válido
- RG válido
- Telefone brasileiro
- E-mail
- CID-10/CID-11
- Dados médicos obrigatórios
- Arquivos de até 5MB

## Próximos Passos

- Implementar renovação automática
- Notificações por e-mail
- Integração com órgãos governamentais
- App mobile
- Relatórios e estatísticas