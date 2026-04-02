import express from 'express';
import { DenunciaController } from '../controllers/denunciaController.js';

const router = express.Router();

router.post('/', DenunciaController.criar);

export default router;
