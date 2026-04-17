import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // Use TLS (porta 587) - false = STARTTLS
  auth: {
    user: process.env.EMAIL_USER || process.env.MAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.MAIL_PASS
  }
});

if (!transporter.options.auth.user || !transporter.options.auth.pass) {
  console.error('⚠️ Configuração de email incompleta: verifique EMAIL_USER/MAIL_USER e EMAIL_PASSWORD/MAIL_PASS.');
}

export default transporter;
