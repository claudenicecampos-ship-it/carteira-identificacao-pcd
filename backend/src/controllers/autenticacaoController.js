import { AutenticacaoService } from '../services/autenticacaoService.js';
import { registrarAuditoria } from '../middlewares/auditoria.js';

export class AutenticacaoController {
  /**
   * POST /api/auth/registrar
   */
  static async registrar(req, res) {
    try {
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

      // Registrar auditoria
      await registrarAuditoria(
        resultado.usuario.id,
        'REGISTRO',
        'usuarios',
        resultado.usuario.id,
        null,
        resultado.usuario,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário registrado com sucesso',
        data: resultado
      });
    } catch (erro) {
      console.error('Erro ao registrar:', erro);
      res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
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

      // Registrar auditoria
      await registrarAuditoria(
        resultado.usuario.id,
        'LOGIN',
        'usuarios',
        resultado.usuario.id,
        null,
        { email: resultado.usuario.email },
        req.ip,
        req.get('user-agent')
      );

      res.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso',
        data: resultado
      });
    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
      res.status(401).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  /**
   * POST /api/auth/renovar-token
   */
  static async renovarToken(req, res) {
    try {
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

      res.status(200).json({
        sucesso: true,
        mensagem: 'Token renovado com sucesso',
        data: resultado
      });
    } catch (erro) {
      console.error('Erro ao renovar token:', erro);
      res.status(401).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  /**
   * POST /api/auth/recuperar-senha
   */
  static async recuperarSenha(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Email é obrigatório'
        });
      }

      await AutenticacaoService.solicitarRecuperacaoSenha(email);

      res.status(200).json({
        sucesso: true,
        mensagem: 'Se o email existe, enviaremos instruções de recuperação'
      });
    } catch (erro) {
      console.error('Erro ao solicitar recuperação:', erro);
      res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  /**
   * POST /api/auth/redefinir-senha
   */
  static async redefinirSenha(req, res) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Token e nova senha são obrigatórios'
        });
      }

      const resultado = await AutenticacaoService.redefinirSenha(token, novaSenha);

      res.status(200).json({
        sucesso: true,
        mensagem: resultado.mensagem
      });
    } catch (erro) {
      console.error('Erro ao redefinir senha:', erro);
      res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      const usuario_id = req.usuario_id;

      if (!usuario_id) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Usuário não autenticado'
        });
      }

      await AutenticacaoService.logout(usuario_id);

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
        mensagem: 'Logout realizado com sucesso'
      });
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
      res.status(400).json({
        sucesso: false,
        mensagem: erro.message
      });
    }
  }
}
