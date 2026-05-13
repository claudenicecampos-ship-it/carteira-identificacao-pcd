import express from 'express';
import { CarteiraController } from '../controllers/carteiraController.js';
import { verificarToken } from '../middlewares/autenticacao.js';
import { uploadCarteira } from '../middlewares/uploadArquivos.js';

const router = express.Router();

router.post('/', verificarToken, uploadCarteira, CarteiraController.criar);
router.get('/minha', verificarToken, CarteiraController.buscarMinha);
router.put('/minha', verificarToken, uploadCarteira, CarteiraController.atualizarMinha);
router.get('/verificar-cpf/:cpf', verificarToken, CarteiraController.verificarCpf);
router.get('/:numeroCarteira', CarteiraController.buscarPorNumero);

export default router;
