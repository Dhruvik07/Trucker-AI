import express from 'express';
import { getFleet, postAlert } from '../controllers/fleetController.js';

const router = express.Router();

router.get('/', getFleet);
router.post('/alert', postAlert);

export default router;
