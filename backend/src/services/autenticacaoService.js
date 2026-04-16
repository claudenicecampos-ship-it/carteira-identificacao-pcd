import { UsuarioRepository } from '../repositories/usuarioRepository.js';
import { SessaoRepository } from '../repositories/sessaoRepository.js';
import { RecuperacaoSenhaRepository } from '../repositories/recuperacaoSenhaRepository.js';
import { criptografarSenha, compararSenha, validarForçaSenha } from '../utils/criptografia.js';
import { gerarToken, gerarRefreshToken } from '../utils/token.js';
import { gerarQRCode, validarQRCode } from '../utils/qrcode.js';
import { validarEmail, validarCPF } from '../utils/validacao.js';
import { enviarEmailConfirmacao, enviarEmailRecuperacao, enviarEmailLogin } from '../utils/email.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export class AutenticacaoService {
  /**
   * Registra novo usuário
   */
  static async registrar(nome, email, senha, cpf, telefone, data_nascimento) {
    // Validações
    if (!validarEmail(email)) {
      return { success: false, status: 400, message: 'Email inválido' };
    }

    if (!validarCPF(cpf)) {
      return { success: false, status: 400, message: 'CPF inválido' };
    }

    if (!validarForçaSenha(senha)) {
      return { success: false, status: 400, message: 'Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial' };
    }

    // Verificar se email já existe
    if (await UsuarioRepository.emailExiste(email)) {
      return { success: false, status: 409, message: 'Email já cadastrado' };
    }

    // Verificar se CPF já existe
    if (await UsuarioRepository.cpfExiste(cpf)) {
      return { success: false, status: 409, message: 'CPF já cadastrado' };
    }

    // Criptografar senha
    const senhaHash = await criptografarSenha(senha);

    // Gerar QR Code
    const qrCodeData = await gerarQRCode(null, email);

    // Criar usuário
    const role = email.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user';
    const dados = {
      nome,
      email,
      senha: senhaHash,
      cpf,
      telefone,
      data_nascimento,
      qr_code: qrCodeData.codigoUnico,
      role
    };

    const usuario_id = await UsuarioRepository.criar(dados);
    const usuario = await UsuarioRepository.buscarPorId(usuario_id);

    // Gerar tokens
    const token = gerarToken(usuario_id, email, role);
    const refreshToken = gerarRefreshToken(usuario_id);

    // Criar sessão
    const expira_em = new Date();
    expira_em.setDate(expira_em.getDate() + 7); // 7 dias
    await SessaoRepository.criar(usuario_id, refreshToken, '', '', expira_em);

    return {
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          qr_code: usuario.qr_code
        },
        token,
        refreshToken
      }
    };
  }

  /**
   * Login de usuário
   */
  static async login(email, senha, endereco_ip = '', user_agent = '') {
    // Buscar usuário
    const usuario = await UsuarioRepository.buscarPorEmail(email);
    
    if (!usuario) {
      return { success: false, status: 401, message: 'Email ou senha incorretos' };
    }

    if (!usuario.ativo) {
      return { success: false, status: 403, message: 'Usuário desativado' };
    }

    // Comparar senha
    const senhaValida = await compararSenha(senha, usuario.senha);
    if (!senhaValida) {
      return { success: false, status: 401, message: 'Email ou senha incorretos' };
    }

    // Gerar tokens
    const token = gerarToken(usuario.id, usuario.email, usuario.role || 'user');
    const refreshToken = gerarRefreshToken(usuario.id);

    // Criar sessão
    const expira_em = new Date();
    expira_em.setDate(expira_em.getDate() + 7); // 7 dias
    await SessaoRepository.criar(usuario.id, refreshToken, endereco_ip, user_agent, expira_em);

    // Enviar notificação de login
    try {
      await enviarEmailLogin(usuario.email, usuario.nome, endereco_ip);
    } catch (erro) {
      console.error('Erro ao enviar email de notificação:', erro);
    }

    return {
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          qr_code: usuario.qr_code,
          role: usuario.role || 'user'
        },
        token,
        refreshToken
      }
    };
  }

  /**
   * Renova token usando refresh token
   */
  static async renovarToken(refreshToken, endereco_ip = '', user_agent = '') {
    // Buscar sessão
    const sessao = await SessaoRepository.buscarPorToken(refreshToken);
    
    if (!sessao) {
      return { success: false, status: 401, message: 'Refresh token inválido ou expirado' };
    }

    // Buscar usuário
    const usuario = await UsuarioRepository.buscarPorId(sessao.usuario_id);
    
    if (!usuario) {
      return { success: false, status: 404, message: 'Usuário não encontrado' };
    }

    // Gerar novo token
    const novoToken = gerarToken(usuario.id, usuario.email, usuario.role || 'user');

    return {
      success: true,
      data: {
        token: novoToken,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role || 'user'
        }
      }
    };
  }

  /**
   * Solicita recuperação de senha
   */
  static async solicitarRecuperacaoSenha(email) {
    const usuario = await UsuarioRepository.buscarPorEmail(email);
    
    if (!usuario) {
      // Não retornar erro para não expor se email existe
      return { success: true, data: { mensagem: 'Se o email existe, enviaremos instruções' } };
    }

    // Gerar token único
    const token = uuidv4();
    const expira_em = new Date();
    expira_em.setHours(expira_em.getHours() + 1); // 1 hora

    // Salvar token
    await RecuperacaoSenhaRepository.criar(usuario.id, token, expira_em);

    // Enviar email
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/recuperar-senha.html?token=${token}`;
    await enviarEmailRecuperacao(usuario.email, usuario.nome, link);

    return { success: true, data: { mensagem: 'Email de recuperação enviado' } };
  }

  /**
   * Redefine senha
   */
  static async redefinirSenha(token, novaSenha) {
    if (!validarForçaSenha(novaSenha)) {
      return { success: false, status: 400, message: 'Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial' };
    }

    // Buscar token
    const recuperacao = await RecuperacaoSenhaRepository.buscarPorToken(token);
    
    if (!recuperacao) {
      return { success: false, status: 400, message: 'Token inválido ou expirado' };
    }

    // Criptografar nova senha
    const senhaHash = await criptografarSenha(novaSenha);

    // Atualizar senha
    await UsuarioRepository.atualizar(recuperacao.usuario_id, {
      senha: senhaHash
    });

    // Marcar token como utilizado
    await RecuperacaoSenhaRepository.marcarComoUtilizado(recuperacao.id);

    // Encerrar todas as sessões
    await SessaoRepository.encerrarTodasSessoes(recuperacao.usuario_id);

    return { success: true, data: { mensagem: 'Senha alterada com sucesso' } };
  }

  /**
   * Logout
   */
  static async logout(usuario_id) {
    await SessaoRepository.encerrarTodasSessoes(usuario_id);
    return { success: true, data: { mensagem: 'Logout realizado com sucesso' } };
  }

  /**
   * Registrar administrador
   */
  static async registrarAdmin(nome, email, senha, cpf) {
    // Verificar se já existe admin
    const adminExistente = await UsuarioRepository.buscarPorRole('admin');
    if (adminExistente) {
      return { success: false, status: 400, message: 'Administrador já existe' };
    }

    // Validações
    if (!validarEmail(email)) {
      return { success: false, status: 400, message: 'Email inválido' };
    }

    if (!validarCPF(cpf)) {
      return { success: false, status: 400, message: 'CPF inválido' };
    }

    if (!validarForçaSenha(senha)) {
      return { success: false, status: 400, message: 'Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial' };
    }

    // Verificar se email já existe
    if (await UsuarioRepository.emailExiste(email)) {
      return { success: false, status: 409, message: 'Email já cadastrado' };
    }

    // Verificar se CPF já existe
    if (await UsuarioRepository.cpfExiste(cpf)) {
      return { success: false, status: 409, message: 'CPF já cadastrado' };
    }

    // Criptografar senha
    const senhaHash = await criptografarSenha(senha);

    // Gerar QR Code
    const qrCodeData = await gerarQRCode(null, email);

    // Criar usuário admin
    const dados = {
      nome,
      email,
      senha: senhaHash,
      cpf,
      role: 'admin',
      qr_code: qrCodeData.codigoUnico
    };

    const usuario_id = await UsuarioRepository.criar(dados);
    const usuario = await UsuarioRepository.buscarPorId(usuario_id);

    // Gerar tokens
    const token = gerarToken(usuario_id, email);
    const refreshToken = gerarRefreshToken(usuario_id);

    // Criar sessão
    const expira_em = new Date();
    expira_em.setDate(expira_em.getDate() + 7); // 7 dias
    await SessaoRepository.criar(usuario_id, refreshToken, '', '', expira_em);

    return {
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          qr_code: usuario.qr_code
        },
        token,
        refreshToken
      }
    };
  }
}
