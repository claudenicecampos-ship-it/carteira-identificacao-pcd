import express from 'express';
import { CarteiraController } from '../controllers/carteiraController.js';
import { verificarToken } from '../middlewares/autenticacao.js';

const router = express.Router();

router.post('/', verificarToken, CarteiraController.criar);
router.get('/minha', verificarToken, CarteiraController.buscarMinha);

export default router;
