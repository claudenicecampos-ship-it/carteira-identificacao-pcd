import transporter from '../config/email.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Envia email de confirmação
 */
export const enviarEmailConfirmacao = async (email, nome, link) => {
  try {
    const opcoes = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Confirme seu email - Carteira',
      html: `
        <h2>Bem-vindo, ${nome}!</h2>
        <p>Para confirmar seu email, clique no link abaixo:</p>
        <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Email</a>
        <p>Ou copie e cole este link no seu navegador:</p>
        <p>${link}</p>
        <p>Este link expira em 1 hora.</p>
      `
    };

    await transporter.sendMail(opcoes);
    return true;
  } catch (erro) {
    console.error('Erro ao enviar email:', erro);
    throw new Error('Erro ao enviar email de confirmação');
  }
};

/**
 * Envia email de recuperação de senha
 */
export const enviarEmailRecuperacao = async (email, nome, token, link) => {
  try {
    const opcoes = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Recupere sua senha - Carteira',
      html: `
        <h2>Olá, ${nome}!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Use o token abaixo no formulário de recuperação de senha:</p>
        <p style="font-size: 20px; font-weight: bold;">${token}</p>
        <p>Ou clique no link abaixo para abrir o formulário automaticamente:</p>
        <a href="${link}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
        <p>Este token expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
      `
    };

    await transporter.sendMail(opcoes);
    return true;
  } catch (erro) {
    console.error('Erro ao enviar email:', erro);
    throw new Error('Erro ao enviar email de recuperação');
  }
};

/**
 * Envia notificação de login
 */
export const enviarEmailLogin = async (email, nome, endereco_ip) => {
  try {
    const opcoes = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Novo login na sua conta - Carteira',
      html: `
        <h2>Olá, ${nome}!</h2>
        <p>Uma nova sessão foi iniciada em sua conta.</p>
        <p><strong>Endereço IP:</strong> ${endereco_ip}</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p>Se não foi você, altere sua senha imediatamente.</p>
      `
    };

    await transporter.sendMail(opcoes);
    return true;
  } catch (erro) {
    console.error('Erro ao enviar email:', erro);
    // Não lançar erro para não interromper o login
  }
};
