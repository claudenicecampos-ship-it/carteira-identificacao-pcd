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
      throw new Error('Email inválido');
    }

    if (!validarCPF(cpf)) {
      throw new Error('CPF inválido');
    }

    if (!validarForçaSenha(senha)) {
      throw new Error('Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial');
    }

    // Verificar se email já existe
    if (await UsuarioRepository.emailExiste(email)) {
      throw new Error('Email já cadastrado');
    }

    // Verificar se CPF já existe
    if (await UsuarioRepository.cpfExiste(cpf)) {
      throw new Error('CPF já cadastrado');
    }

    // Criptografar senha
    const senhaHash = await criptografarSenha(senha);

    // Gerar QR Code
    const qrCodeData = await gerarQRCode(null, email);

    // Criar usuário
    const dados = {
      nome,
      email,
      senha: senhaHash,
      cpf,
      telefone,
      data_nascimento,
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
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        qr_code: usuario.qr_code
      },
      token,
      refreshToken
    };
  }

  /**
   * Login de usuário
   */
  static async login(email, senha, endereco_ip = '', user_agent = '') {
    // Buscar usuário
    const usuario = await UsuarioRepository.buscarPorEmail(email);
    
    if (!usuario) {
      throw new Error('Email ou senha incorretos');
    }

    if (!usuario.ativo) {
      throw new Error('Usuário desativado');
    }

    // Comparar senha
    const senhaValida = await compararSenha(senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Email ou senha incorretos');
    }

    // Gerar tokens
    const token = gerarToken(usuario.id, usuario.email);
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
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        qr_code: usuario.qr_code
      },
      token,
      refreshToken
    };
  }

  /**
   * Renova token usando refresh token
   */
  static async renovarToken(refreshToken, endereco_ip = '', user_agent = '') {
    // Buscar sessão
    const sessao = await SessaoRepository.buscarPorToken(refreshToken);
    
    if (!sessao) {
      throw new Error('Refresh token inválido ou expirado');
    }

    // Buscar usuário
    const usuario = await UsuarioRepository.buscarPorId(sessao.usuario_id);
    
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Gerar novo token
    const novoToken = gerarToken(usuario.id, usuario.email);

    return {
      token: novoToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
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
      return { mensagem: 'Se o email existe, enviaremos instruções' };
    }

    // Gerar token único
    const token = uuidv4();
    const expira_em = new Date();
    expira_em.setHours(expira_em.getHours() + 1); // 1 hora

    // Salvar token
    await RecuperacaoSenhaRepository.criar(usuario.id, token, expira_em);

    // Enviar email
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/redefinir-senha?token=${token}`;
    await enviarEmailRecuperacao(usuario.email, usuario.nome, link);

    return { mensagem: 'Email de recuperação enviado' };
  }

  /**
   * Redefine senha
   */
  static async redefinirSenha(token, novaSenha) {
    if (!validarForçaSenha(novaSenha)) {
      throw new Error('Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial');
    }

    // Buscar token
    const recuperacao = await RecuperacaoSenhaRepository.buscarPorToken(token);
    
    if (!recuperacao) {
      throw new Error('Token inválido ou expirado');
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

    return { mensagem: 'Senha alterada com sucesso' };
  }

  /**
   * Logout
   */
  static async logout(usuario_id) {
    await SessaoRepository.encerrarTodasSessoes(usuario_id);
    return { mensagem: 'Logout realizado com sucesso' };
  }
}
