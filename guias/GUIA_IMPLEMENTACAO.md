# 📚 Guia de Implementação - Carteira

Este documento descreve como adicionar novas funcionalidades seguindo a arquitetura estabelecida.

## Padrão de Desenvolvimento

A aplicação segue o padrão **MVC com separação clara de responsabilidades**:

```
Request → Route → Middleware → Controller → Service → Repository → Database
```

## Passo a Passo para Nova Funcionalidade

### 1. Definir a Rota

**arquivo: `backend/src/routes/novaFuncaoRoutes.js`**

```javascript
import express from 'express';
import { NovaFuncaoController } from '../controllers/novaFuncaoController.js';
import { verificarToken } from '../middlewares/autenticacao.js';
import { limitadorRateLimitGeneral } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @route GET /api/novo-recurso/:id
 * @desc Busca recurso por ID
 * @access Private (requer autenticação)
 */
router.get('/:id', verificarToken, NovaFuncaoController.buscar);

/**
 * @route POST /api/novo-recurso
 * @desc Cria novo recurso
 * @access Private
 */
router.post('/', verificarToken, limitadorRateLimit, NovaFuncaoController.criar);

export default router;
```

Depois adicionar em `backend/src/routes/index.js`:

```javascript
import novaFuncaoRoutes from './novaFuncaoRoutes.js';

router.use('/novo-recurso', novaFuncaoRoutes);
```

### 2. Criar o Repository

**arquivo: `backend/src/repositories/novaFuncaoRepository.js`**

```javascript
import pool from '../config/database.js';

export class NovaFuncaoRepository {
  /**
   * Busca por ID
   */
  static async buscarPorId(id, usuario_id) {
    try {
      const conexao = await pool.getConnection();
      
      // ✅ Sempre usar queries parametrizadas
      const [resultado] = await conexao.execute(
        'SELECT * FROM tabela WHERE id = ? AND usuario_id = ?',
        [id, usuario_id] // Parâmetros seguros
      );
      
      conexao.release();
      return resultado.length > 0 ? resultado[0] : null;
    } catch (erro) {
      throw new Error('Erro ao buscar: ' + erro.message);
    }
  }

  /**
   * Criar novo recurso
   */
  static async criar(dados) {
    try {
      const conexao = await pool.getConnection();
      
      const [resultado] = await conexao.execute(
        'INSERT INTO tabela (campo1, campo2, usuario_id) VALUES (?, ?, ?)',
        [dados.campo1, dados.campo2, dados.usuario_id]
      );
      
      conexao.release();
      return resultado.insertId;
    } catch (erro) {
      throw new Error('Erro ao criar: ' + erro.message);
    }
  }
}
```

### 3. Criar o Service

**arquivo: `backend/src/services/novaFuncaoService.js`**

```javascript
import { NovaFuncaoRepository } from '../repositories/novaFuncaoRepository.js';

export class NovaFuncaoService {
  /**
   * Busca e valida permissão
   */
  static async buscar(id, usuario_id) {
    // ✅ Validação de lógica de negócio
    const recurso = await NovaFuncaoRepository.buscarPorId(id, usuario_id);
    
    if (!recurso) {
      throw new Error('Recurso não encontrado');
    }
    
    return recurso;
  }

  /**
   * Cria com validações
   */
  static async criar(dados, usuario_id) {
    // ✅ Validações simples podem vir aqui
    if (!dados.campo1) {
      throw new Error('Campo obrigatório');
    }

    dados.usuario_id = usuario_id;
    return await NovaFuncaoRepository.criar(dados);
  }
}
```

### 4. Criar o Controller

**arquivo: `backend/src/controllers/novaFuncaoController.js`**

```javascript
import { NovaFuncaoService } from '../services/novaFuncaoService.js';
import { registrarAuditoria } from '../middlewares/auditoria.js';

export class NovaFuncaoController {
  /**
   * GET /api/novo-recurso/:id
   */
  static async buscar(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario_id;

      // ✅ Validação de parâmetro
      if (!id || isNaN(id)) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'ID inválido'
        });
      }

      const resultado = await NovaFuncaoService.buscar(id, usuario_id);

      res.status(200).json({
        sucesso: true,
        data: resultado
      });
    } catch (erro) {
      res.status(404).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  /**
   * POST /api/novo-recurso
   */
  static async criar(req, res) {
    try {
      const { campo1, campo2 } = req.body;
      const usuario_id = req.usuario_id;

      // ✅ Validação de entrada
      if (!campo1 && !campo2) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Campos obrigatórios não preenchidos'
        });
      }

      const id = await NovaFuncaoService.criar(
        { campo1, campo2 },
        usuario_id
      );

      // ✅ Registrar auditoria
      await registrarAuditoria(
        usuario_id,
        'CRIAR_RECURSO',
        'tabela',
        id,
        null,
        { campo1, campo2 },
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        sucesso: true,
        mensagem: 'Recurso criado com sucesso',
        data: { id }
      });
    } catch (erro) {
      res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }
}
```

## Implementar Funcionalidade Específica: Carteiras

### 1. Repository

```javascript
export class CarteiraRepository {
  static async buscarPorUsuario(usuario_id) {
    const conexao = await pool.getConnection();
    const [resultado] = await conexao.execute(
      'SELECT * FROM carteiras WHERE usuario_id = ? AND ativa = 1',
      [usuario_id]
    );
    conexao.release();
    return resultado;
  }

  static async criar(usuario_id, tipo, numero_carteira, descricao) {
    const conexao = await pool.getConnection();
    const [resultado] = await conexao.execute(
      `INSERT INTO carteiras (usuario_id, tipo, numero_carteira, descricao, saldo, ativa)
       VALUES (?, ?, ?, ?, 0, 1)`,
      [usuario_id, tipo, numero_carteira, descricao]
    );
    conexao.release();
    return resultado.insertId;
  }

  static async atualizarSaldo(id, novoSaldo) {
    const conexao = await pool.getConnection();
    await conexao.execute(
      'UPDATE carteiras SET saldo = ? WHERE id = ?',
      [novoSaldo, id]
    );
    conexao.release();
  }
}
```

### 2. Service

```javascript
export class CarteiraService {
  static async listar(usuario_id) {
    return await CarteiraRepository.buscarPorUsuario(usuario_id);
  }

  static async criar(usuario_id, tipo, numero_carteira, descricao) {
    if (!tipo || !numero_carteira) {
      throw new Error('Tipo e número da carteira são obrigatórios');
    }

    // ✅ Validação de tipo
    const tiposValidos = ['débito', 'crédito', 'poupança'];
    if (!tiposValidos.includes(tipo)) {
      throw new Error('Tipo de carteira inválido');
    }

    return await CarteiraRepository.criar(
      usuario_id,
      tipo,
      numero_carteira,
      descricao
    );
  }

  static async transferir(carteiraOrigem, carteiraDestino, valor) {
    // ✅ Validação de negócio
    if (valor <= 0) {
      throw new Error('Valor deve ser positivo');
    }

    // Buscar carteiras...
    // Validar saldo...
    // Atualizar saldos (idealamente em transação)
  }
}
```

### 3. Controller

```javascript
export class CarteiraController {
  static async listar(req, res) {
    try {
      const carteiras = await CarteiraService.listar(req.usuario_id);
      res.json({ sucesso: true, data: carteiras });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }

  static async criar(req, res) {
    try {
      const { tipo, numero_carteira, descricao } = req.body;
      const id = await CarteiraService.criar(
        req.usuario_id,
        tipo,
        numero_carteira,
        descricao
      );
      res.status(201).json({ sucesso: true, data: { id } });
    } catch (erro) {
      res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
  }
}
```

## Frontend - Comunicação com API

### Exemplo: Listar Carteiras

```javascript
// frontend/assets/js/carteiras.js

async function carregarCarteiras() {
  try {
    const resposta = await fazerRequisicao('/carteiras');
    
    if (resposta.sucesso) {
      renderizarCarteiras(resposta.data);
    }
  } catch (erro) {
    mostrarToast(erro.message, 'error');
  }
}

function renderizarCarteiras(carteiras) {
  const container = document.getElementById('carteirasContainer');
  
  container.innerHTML = carteiras.map(carteira => `
    <div class="card-carteira">
      <h3>${carteira.tipo}</h3>
      <p>Saldo: R$ ${carteira.saldo.toFixed(2)}</p>
      <button onclick="verCarteira(${carteira.id})">Ver Detalhes</button>
    </div>
  `).join('');
}
```

## Padrão de Segurança por Feature

### SQL Injection Prevention ✅
```javascript
// ❌ NÃO FAZER
query = `SELECT * FROM usuarios WHERE id = ${id}`;

// ✅ FAZER
query = 'SELECT * FROM usuarios WHERE id = ?';
values = [id];
resultado = await conexao.execute(query, values);
```

### XSS Protection ✅
```javascript
// Usar middleware sanitizarEntrada em todas as rotas
app.use(sanitizarEntrada);

// Ou sanitizar manualmente
import { sanitizar } from '../middlewares/xssProtecao.js';
const nomeLimpo = sanitizar(nome);
```

### Autenticação JWT ✅
```javascript
// Proteger rotas privadas
router.post('/acao', verificarToken, controller.acao);

// Middleware verifica automaticamente
export const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ mensagem: 'Acesso negado' });
    req.usuario_id = decoded.usuario_id;
    next();
  });
};
```

### Rate Limiting ✅
```javascript
// Aplicar limite por rota sensível
router.post('/transferencia', limitadorGeral, verificarToken, controller.transferir);

// Ou criar limitador específico
const limitadorTransferencia = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10
});
```

### Validação de Permissão ✅
```javascript
// Sempre verificar se usuário tem permissão
static async buscarCarteira(id, usuario_id) {
  const carteira = await CarteiraRepository.buscarPorId(id);
  
  // ✅ Verificar se pertence ao usuário
  if (carteira.usuario_id !== usuario_id) {
    throw new Error('Acesso negado');
  }
  
  return carteira;
}
```

## Exemplo Completo: Transferência entre Carteiras

### 1. Rota
```javascript
router.post('/transferir', verificarToken, limitadorTransferencia, TransferenciaController.transferir);
```

### 2. Repository
```javascript
static async buscarCarteira(id) {
  const [resultado] = await conexao.execute(
    'SELECT * FROM carteiras WHERE id = ?', [id]
  );
  return resultado[0];
}

static async atualizarSaldo(id, novoSaldo) {
  await conexao.execute(
    'UPDATE carteiras SET saldo = ? WHERE id = ?',
    [novoSaldo, id]
  );
}

// ✅ Usar transação
static async transferir(carteiraOId, carteiraDId, valor) {
  const conexao = await pool.getConnection();
  await conexao.beginTransaction();
  try {
    await conexao.execute(
      'UPDATE carteiras SET saldo = saldo - ? WHERE id = ?',
      [valor, carteiraOId]
    );
    await conexao.execute(
      'UPDATE carteiras SET saldo = saldo + ? WHERE id = ?',
      [valor, carteiraDId]
    );
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  }
  conexao.release();
}
```

### 3. Service
```javascript
static async transferir(carteiraOrigemId, carteiraDestinoId, valor, usuario_id) {
  // ✅ Validações
  if (valor <= 0) throw new Error('Valor inválido');
  if (carteiraOrigemId === carteiraDestinoId) {
    throw new Error('Não pode transferir para a mesma carteira');
  }

  // ✅ Verificar permissão
  const cartOrigem = await CarteiraRepository.buscarCarteira(carteiraOrigemId);
  if (cartOrigem.usuario_id !== usuario_id) {
    throw new Error('Acesso negado');
  }

  const cartDestino = await CarteiraRepository.buscarCarteira(carteiraDestinoId);

  // ✅ Validar saldo
  if (cartOrigem.saldo < valor) {
    throw new Error('Saldo insuficiente');
  }

  // ✅ Usar transação no repository
  await CarteiraRepository.transferir(carteiraOrigemId, carteiraDestinoId, valor);
}
```

### 4. Controller
```javascript
static async transferir(req, res) {
  try {
    const { carteiraOrigemId, carteiraDestinoId, valor } = req.body;
    
    await TransferenciaService.transferir(
      carteiraOrigemId,
      carteiraDestinoId,
      valor,
      req.usuario_id
    );

    await registrarAuditoria(
      req.usuario_id,
      'TRANSFERENCIA',
      'carteiras',
      carteiraOrigemId,
      null,
      { para: carteiraDestinoId, valor },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      sucesso: true,
      mensagem: 'Transferência realizada com sucesso'
    });
  } catch (erro) {
    res.status(400).json({ sucesso: false, mensagem: erro.message });
  }
}
```

## Checklist de Segurança

Para cada nova feature, verifique:

- [ ] Queries parametrizadas (sem concatenação de strings)
- [ ] Rotas protegidas com `verificarToken`
- [ ] Validação de entrada (frontend + backend)
- [ ] Sanitização de dados via middleware `sanitizarEntrada`
- [ ] Rate limiting em operações sensíveis
- [ ] Verificação de permissão (usuário só acessa seus dados)
- [ ] Registro de auditoria
- [ ] Tratamento de erros apropriado
- [ ] Validação de tipos de dados
- [ ] Inputs escapados/sanitizados no frontend

---

**Desenvolvido com segurança em primeiro lugar** 🔐
