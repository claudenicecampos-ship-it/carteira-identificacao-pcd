import { AutenticacaoService } from '../services/autenticacaoService.js';
import { registrarAuditoria } from '../middlewares/auditoria.js';

export class AutenticacaoController {
  /**
   * POST /api/auth/registrar
   */
  static async registrar(req, res) {
    const { nome, email, senha, cpf, telefone, data_nascimento } = req.body;

    // Validar campos obrigatórios
    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome, email, senha e CPF são obrigatórios'
      });
    }

    const resultado = await AutenticacaoService.registrar(
      nome,
      email,
      senha,
      cpf,
      telefone,
      data_nascimento
    );

    if (!resultado.success) {
      return res.status(resultado.status).json({
        sucesso: false,
        mensagem: resultado.message
      });
    }

    // Registrar auditoria
    await registrarAuditoria(
      resultado.data.usuario.id,
      'REGISTRO',
      'usuarios',
      resultado.data.usuario.id,
      null,
      resultado.data.usuario,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário registrado com sucesso',
      data: resultado.data
    });
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Email e senha são obrigatórios'
      });
    }

    const resultado = await AutenticacaoService.login(
      email,
      senha,
      req.ip,
      req.get('user-agent')
    );

    if (!resultado.success) {
      return res.status(resultado.status).json({
        sucesso: false,
        mensagem: resultado.message
      });
    }

    // Registrar auditoria
    await registrarAuditoria(
      resultado.data.usuario.id,
      'LOGIN',
      'usuarios',
      resultado.data.usuario.id,
      null,
      { email: resultado.data.usuario.email },
      req.ip,
      req.get('user-agent')
    );

    res.status(200).json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      data: resultado.data
    });
  }

  /**
   * POST /api/auth/renovar-token
   */
  static async renovarToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Refresh token é obrigatório'
      });
    }

    const resultado = await AutenticacaoService.renovarToken(
      refreshToken,
      req.ip,
      req.get('user-agent')
    );

    if (!resultado.success) {
      return res.status(resultado.status).json({
        sucesso: false,
        mensagem: resultado.message
      });
    }

    res.status(200).json({
      sucesso: true,
      mensagem: 'Token renovado com sucesso',
      data: resultado.data
    });
  }

  /**
   * POST /api/auth/recuperar-senha
   */
  static async recuperarSenha(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Email é obrigatório'
      });
    }

    const resultado = await AutenticacaoService.solicitarRecuperacaoSenha(email);

    res.status(200).json({
      sucesso: true,
      mensagem: resultado.data.mensagem
    });
  }

  /**
   * POST /api/auth/redefinir-senha
   */
  static async redefinirSenha(req, res) {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Token e nova senha são obrigatórios'
      });
    }

    const resultado = await AutenticacaoService.redefinirSenha(token, novaSenha);

    if (!resultado.success) {
      return res.status(resultado.status).json({
        sucesso: false,
        mensagem: resultado.message
      });
    }

    res.status(200).json({
      sucesso: true,
      mensagem: resultado.data.mensagem
    });
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    const usuario_id = req.usuario_id;

    if (!usuario_id) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário não autenticado'
      });
    }

    const resultado = await AutenticacaoService.logout(usuario_id);

    // Registrar auditoria
    await registrarAuditoria(
      usuario_id,
      'LOGOUT',
      'usuarios',
      usuario_id,
      null,
      null,
      req.ip,
      req.get('user-agent')
    );

    res.status(200).json({
      sucesso: true,
      mensagem: resultado.data.mensagem
    });
  }

  /**
   * POST /api/auth/criar-admin
   */
  static async criarAdmin(req, res) {
    const { nome, email, senha, cpf } = req.body;

    const resultado = await AutenticacaoService.registrarAdmin(nome, email, senha, cpf);

    if (!resultado.success) {
      return res.status(resultado.status).json({
        sucesso: false,
        mensagem: resultado.message
      });
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Administrador criado com sucesso',
      data: resultado.data
    });
  }
}
