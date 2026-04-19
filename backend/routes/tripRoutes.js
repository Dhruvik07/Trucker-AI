import express from 'express';
import { getActiveTrips, updateTripLocation, getAlerts, runAlertEvaluation, postAlert } from '../controllers/tripController.js';

const router = express.Router();

router.get('/active', getActiveTrips);
router.post('/:id/location', updateTripLocation);
router.get('/alerts', getAlerts);
router.post('/alerts', postAlert);
router.post('/alerts/evaluate', runAlertEvaluation);

export default router;
