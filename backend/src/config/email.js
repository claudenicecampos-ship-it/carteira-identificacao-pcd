import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || process.env.MAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.MAIL_PASS
  }
});

if (!transporter.options.auth.user || !transporter.options.auth.pass) {
  console.error('⚠️ Configuração de email incompleta: verifique EMAIL_USER/MAIL_USER e EMAIL_PASSWORD/MAIL_PASS.');
}

export default transporter;
