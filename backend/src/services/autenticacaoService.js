import { UsuarioRepository } from '../repositories/usuarioRepository.js';
import { SessaoRepository } from '../repositories/sessaoRepository.js';
import { RecuperacaoSenhaRepository } from '../repositories/recuperacaoSenhaRepository.js';
import { CarteiraRepository } from '../repositories/carteiraRepository.js';
import { LoginBloqueioRepository } from '../repositories/loginBloqueioRepository.js';
import { resetLoginRateLimit } from '../middlewares/rateLimiter.js';
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
    // Validações básicas
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
    const role = email.toLowerCase() === 'admin@carteira.com' ? 'admin' : 'user';
    const dados = {
      nome,
      email,
      senha: senhaHash,
      cpf,
      telefone: telefone || null,
      data_nascimento: data_nascimento || null,
      qr_code: qrCodeData.codigoUnico,
      role
    };

    const usuario_id = await UsuarioRepository.criar(dados);
    const usuario = await UsuarioRepository.buscarPorId(usuario_id);

    const token = gerarToken(usuario_id, usuario.email, usuario.role || role);
    const refreshToken = gerarRefreshToken(usuario_id);

    const expira_em = new Date();
    expira_em.setDate(expira_em.getDate() + 7);
    await SessaoRepository.criar(usuario_id, refreshToken, '', '', expira_em);

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        qr_code: usuario.qr_code,
        role: usuario.role || role
      },
      token,
      refreshToken
    };
  }

  /**   * Verifica se email existe
   */
  static async verificarEmailExiste(email) {
    return await UsuarioRepository.emailExiste(email);
  }

  static parseBloqueadoAte(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const normalized = value.includes('T') ? value : value.replace(' ', 'T');
      return new Date(normalized);
    }
    return new Date(value);
  }

  /**
   * Verifica se email está bloqueado (sem tentar login)
   */
  static async verificarBloqueio(email) {
    const bloqueio = await LoginBloqueioRepository.buscarPorEmail(email);
    
    if (bloqueio?.bloqueado_ate) {
      const bloqueadoAte = this.parseBloqueadoAte(bloqueio.bloqueado_ate);
      const agora = new Date();
      
      if (bloqueadoAte > agora) {
        const segundosRestantes = Math.ceil((bloqueadoAte.getTime() - agora.getTime()) / 1000);
        const minutos = Math.floor(segundosRestantes / 60);
        const segundos = segundosRestantes % 60;
        return {
          bloqueado: true,
          bloqueadoAte: bloqueadoAte.toISOString(),
          segundosRestantes,
          codigoDesbloqueio: bloqueio.codigo_desbloqueio
        };
      } else {
        // Bloqueio expirou, limpar
        await LoginBloqueioRepository.resetarBloqueio(email);
        return { bloqueado: false };
      }
    }
    
    return { bloqueado: false };
  }

  static async removerBloqueio(id) {
    const bloqueio = await LoginBloqueioRepository.buscarPorId(id);
    if (!bloqueio) {
      throw new Error('Bloqueio de login não encontrado');
    }

    await LoginBloqueioRepository.removerPorId(id);
    return bloqueio;
  }

  /**   * Login de usuário
   */
  static async login(email, senha, endereco_ip = '', user_agent = '') {
    // Verificar bloqueio prévio
    const bloqueio = await LoginBloqueioRepository.buscarPorEmail(email);
    if (bloqueio?.bloqueado_ate) {
      const bloqueadoAte = this.parseBloqueadoAte(bloqueio.bloqueado_ate);
      if (bloqueadoAte > new Date()) {
        // Calcula corretamente o tempo restante em segundos
        const segundosRestantes = Math.ceil((bloqueadoAte.getTime() - Date.now()) / 1000);
        const minutos = Math.floor(segundosRestantes / 60);
        const segundos = segundosRestantes % 60;
        const erro = new Error(`Conta bloqueada. Tente novamente em ${minutos}m ${segundos}s.`);
        erro.status = 429;
        erro.retryAfter = segundosRestantes;
        erro.codigoDesbloqueio = bloqueio.codigo_desbloqueio;
        throw erro;
      }
    }

    // Buscar usuário
    const usuario = await UsuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      const falha = await LoginBloqueioRepository.registrarFalha(email, 3, 5); // Adicionei os parâmetros maxTentativas e minutosBloqueio
      if (falha.bloqueadoAte) {
        const erro = new Error(`Muitas tentativas de login. Tente novamente em ${Math.floor(falha.segundosRestantes / 60)} minutos e ${falha.segundosRestantes % 60} segundos.`);
        erro.status = 429;
        erro.retryAfter = falha.segundosRestantes; // Tempo real calculado
        erro.codigoDesbloqueio = falha.codigoDesbloqueio;
        throw erro;
      }

      const erro = new Error(`Email ou senha incorretos. Você tem ${falha.restantes} tentativa(s) restante(s).`);
      erro.status = 401;
      erro.remaining = falha.restantes;
      throw erro;
    }

    if (!usuario.ativo) {
      throw new Error('Usuário desativado');
    }

    // Comparar senha
    const senhaValida = await compararSenha(senha, usuario.senha);
    if (!senhaValida) {
      const falha = await LoginBloqueioRepository.registrarFalha(email, 3, 5); // Adicionei os parâmetros maxTentativas e minutosBloqueio
      if (falha.bloqueadoAte) {
        const erro = new Error(`Muitas tentativas de login. Tente novamente em ${Math.floor(falha.segundosRestantes / 60)} minutos e ${falha.segundosRestantes % 60} segundos.`);
        erro.status = 429;
        erro.retryAfter = falha.segundosRestantes; // Tempo real calculado
        erro.codigoDesbloqueio = falha.codigoDesbloqueio;
        throw erro;
      }

      const erro = new Error(`Email ou senha incorretos. Você tem ${falha.restantes} tentativa(s) restante(s).`);
      erro.status = 401;
      erro.remaining = falha.restantes;
      throw erro;
    }

    resetLoginRateLimit(email);

    // Gerar tokens
    const token = gerarToken(usuario.id, usuario.email, usuario.role || 'user');
    const refreshToken = gerarRefreshToken(usuario.id);

    // Criar sessão
    const expira_em = new Date();
    expira_em.setDate(expira_em.getDate() + 7); // 7 dias
    await SessaoRepository.criar(usuario.id, refreshToken, endereco_ip, user_agent, expira_em);

    // Verificar se o usuário já tem carteira
    const carteira = await CarteiraRepository.buscarPorUsuarioId(usuario.id);
    const carteiraFormatada = carteira ? {
      id: carteira.id,
      usuario_id: carteira.usuario_id,
      tipo: carteira.tipo,
      numeroCarteira: carteira.numero_carteira,
      descricao: carteira.descricao,
      ativa: Boolean(carteira.ativa),
      dataNascimento: carteira.data_nascimento,
      endereco: carteira.endereco,
      cidade: carteira.cidade,
      estado: carteira.estado,
      cep: carteira.cep,
      telefone: carteira.telefone,
      tipoDeficiencia: carteira.tipo_deficiencia,
      grauDeficiencia: carteira.grau_deficiencia,
      cid: carteira.cid,
      necessitaAcompanhante: Boolean(carteira.necessita_acompanhante),
      numeroLaudo: carteira.numero_laudo,
      dataLaudo: carteira.data_laudo,
      nomeMedico: carteira.nome_medico,
      crmMedico: carteira.crm_medico,
      foto: carteira.foto,
      laudoUrl: carteira.laudo_url,
      tipoSanguineo: carteira.tipo_sanguineo,
      contatoEmergencia: carteira.contato_emergencia,
      alergias: carteira.alergias,
      medicacoes: carteira.medicacoes,
      comunicacao: carteira.comunicacao,
      nomeResponsavel: carteira.nome_responsavel,
      cpfResponsavel: carteira.cpf_responsavel,
      vinculoResponsavel: carteira.vinculo_responsavel,
      nome: carteira.nome,
      cpf: carteira.cpf,
      rg: carteira.rg,
      sexo: carteira.sexo
    } : null;

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        qr_code: usuario.qr_code,
        role: usuario.role || 'user',
        possuiCarteira: Boolean(carteiraFormatada)
      },
      carteira: carteiraFormatada,
      token,
      refreshToken
    };
  }

  /**
   * Renova token usando refresh token
   */
  static async renovarToken(refreshToken) {
    // Buscar sessão
    const sessao = await SessaoRepository.buscarPorToken(refreshToken);

    if (!sessao) {
      throw new Error('Refresh token inválido ou expirado');
    }

    // Buscar usuário
    const usuarioRenovado = await UsuarioRepository.buscarPorId(sessao.usuario_id);

    if (!usuarioRenovado) {
      throw new Error('Usuário não encontrado');
    }

    // Gerar novo token
    const novoToken = gerarToken(usuarioRenovado.id, usuarioRenovado.email, usuarioRenovado.role || 'user');

    return {
      token: novoToken,
      usuario: {
        id: usuarioRenovado.id,
        nome: usuarioRenovado.nome,
        email: usuarioRenovado.email,
        role: usuarioRenovado.role || 'user'
      }
    };
  }

  /**
   * Solicita recuperação de senha
   */
  static async desbloquearLogin(email, codigo) {
    if (!email || !codigo) {
      throw new Error('Email e código de desbloqueio são obrigatórios');
    }

    const sucesso = await LoginBloqueioRepository.desbloquearPorCodigo(email, codigo);
    if (!sucesso) {
      throw new Error('Código inválido ou bloqueio não encontrado');
    }

    resetLoginRateLimit(email);
    return { mensagem: 'Bloqueio removido com sucesso' };
  }

  static async solicitarRecuperacaoSenha(email) {
    const usuario = await UsuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      // Não retornar erro para não expor se email existe
      return { mensagem: 'Se o email existe, enviaremos instruções' };
    }

    // Gerar token único
    const token = uuidv4();
    console.log('Token gerado:', token); // Debug
    const expira_em = new Date();
    expira_em.setHours(expira_em.getHours() + 1); // 1 hora

    // Salvar token
    await RecuperacaoSenhaRepository.criar(usuario.id, token, expira_em);

    // Enviar email
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/recuperar-senha.html?token=${token}`;
    await enviarEmailRecuperacao(usuario.email, usuario.nome, token, link);

    return { mensagem: 'Email de recuperação enviado' };
  }

  /**
   * Redefine senha
   */
  static async redefinirSenha(token, novaSenha) {
    console.log('Token recebido para redefinição:', token); // Debug
    if (!validarForçaSenha(novaSenha)) {
      throw new Error('Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial');
    }

    // Buscar token
    const recuperacao = await RecuperacaoSenhaRepository.buscarPorToken(token);

    if (!recuperacao) {
      console.log('Token não encontrado ou expirado'); // Debug
      throw new Error('Token inválido ou expirado');
    }

    console.log('Token válido encontrado:', recuperacao); // Debug

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

  /**
   * Registrar administrador
   */
  static async registrarAdmin(nome, email, senha, cpf) {
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
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        qr_code: usuario.qr_code
      },
      token,
      refreshToken
    };
  }
}
