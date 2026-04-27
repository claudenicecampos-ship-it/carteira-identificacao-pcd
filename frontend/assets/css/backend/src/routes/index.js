import express from 'express';
import autenticacaoRoutes from './autenticacaoRoutes.js';
import carteiraRoutes from './carteiraRoutes.js';
import denunciaRoutes from './denunciaRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', autenticacaoRoutes);
router.use('/carteiras', carteiraRoutes);
router.use('/denuncias', denunciaRoutes);
router.use('/admin', adminRoutes);

export default router;
