import express from 'express';
import { CarteiraController } from '../controllers/carteiraController.js';

const router = express.Router();

router.post('/', CarteiraController.criar);

export default router;
