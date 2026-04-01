import express from 'express';
import autenticacaoRoutes from './autenticacaoRoutes.js';

const router = express.Router();

router.use('/auth', autenticacaoRoutes);

export default router;
