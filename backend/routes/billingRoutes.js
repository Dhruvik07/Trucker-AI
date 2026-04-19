import express from 'express';
import { submitBilling } from '../controllers/billingController.js';

const router = express.Router();

router.post('/submit', submitBilling);

export default router;
