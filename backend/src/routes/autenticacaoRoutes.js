import express from 'express';
import { AutenticacaoController } from '../controllers/autenticacaoController.js';
import { verificarToken } from '../middlewares/autenticacao.js';
import { limitadorRecuperacaoSenha } from '../middlewares/rateLimiter.js';

const router = express.Router();

/**
 * @route POST /api/auth/registrar
 * @desc Registra novo usuário
 * @access Public
 */
router.post('/registrar', AutenticacaoController.registrar);

/**
 * @route POST /api/auth/verificar-email
 * @desc Verifica se email existe
 * @access Public
 */
router.post('/verificar-email', AutenticacaoController.verificarEmail);

/**
 * @route POST /api/auth/login
 * @desc Realiza login
 * @access Public
 */
router.post('/login', AutenticacaoController.login);
router.post('/desbloquear', AutenticacaoController.desbloquear);

/**
 * @route POST /api/auth/renovar-token
 * @desc Renova o token JWT
 * @access Private
 */
router.post('/renovar-token', AutenticacaoController.renovarToken);

/**
 * @route POST /api/auth/recuperar-senha
 * @desc Solicita recuperação de senha
 * @access Public
 */
router.post('/recuperar-senha', limitadorRecuperacaoSenha, AutenticacaoController.recuperarSenha);

/**
 * @route POST /api/auth/redefinir-senha
 * @desc Redefine a senha
 * @access Public
 */
router.post('/redefinir-senha', AutenticacaoController.redefinirSenha);

/**
 * @route POST /api/auth/criar-admin
 * @desc Criar usuário administrador (apenas se não existir)
 * @access Public (temporário)
 */
router.post('/criar-admin', AutenticacaoController.criarAdmin);

export default router;
