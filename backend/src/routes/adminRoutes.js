import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { verificarToken, verificarAdmin } from '../middlewares/autenticacao.js';

const router = express.Router();

router.get('/usuarios', verificarToken, verificarAdmin, AdminController.listarUsuarios);
router.get('/carteiras', verificarToken, verificarAdmin, AdminController.listarCarteiras);
router.get('/denuncias', verificarToken, verificarAdmin, AdminController.listarDenuncias);
router.patch('/usuarios/:id/status', verificarToken, verificarAdmin, AdminController.atualizarUsuarioStatus);
router.patch('/carteiras/:id/status', verificarToken, verificarAdmin, AdminController.atualizarCarteiraStatus);

export default router;
