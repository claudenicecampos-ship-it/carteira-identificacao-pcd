import express from 'express';
import { CarteiraController } from '../controllers/carteiraController.js';
import { verificarToken } from '../middlewares/autenticacao.js';
import { uploadCarteira } from '../middlewares/uploadArquivos.js';

const router = express.Router();

router.post('/', verificarToken, uploadCarteira, CarteiraController.criar);
router.get('/minha', verificarToken, CarteiraController.buscarMinha);
router.get('/:numeroCarteira', CarteiraController.buscarPorNumero);

export default router;
