import express from 'express';
import { matchJob, assignJob, explainMatch } from '../controllers/dispatchController.js';

const router = express.Router();

router.post('/match', matchJob);
router.post('/assign', assignJob);
router.post('/explain', explainMatch);

export default router;
