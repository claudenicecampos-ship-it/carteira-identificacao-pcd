import express from 'express';
import { DenunciaController } from '../controllers/denunciaController.js';
import { verificarToken, verificarAdmin } from '../middlewares/autenticacao.js';

const router = express.Router();

router.post('/', verificarToken, DenunciaController.criar);
router.get('/all', verificarToken, verificarAdmin, DenunciaController.listarTodas);
router.patch('/:id/resolver', verificarToken, verificarAdmin, DenunciaController.resolver);

export default router;
