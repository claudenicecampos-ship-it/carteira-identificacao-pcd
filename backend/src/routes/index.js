import express from 'express';
import autenticacaoRoutes from './autenticacaoRoutes.js';
import carteiraRoutes from './carteiraRoutes.js';
import denunciaRoutes from './denunciaRoutes.js';

const router = express.Router();

router.use('/auth', autenticacaoRoutes);
router.use('/carteiras', carteiraRoutes);
router.use('/denuncias', denunciaRoutes);

export default router;
