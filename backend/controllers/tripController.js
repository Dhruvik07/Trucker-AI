import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateAlerts } from '../utils/alertEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/mockDB.json');

const getDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));

export const getActiveTrips = (req, res) => {
    try {
        const db = getDB();
        const activeTrips = db.trips.filter(t => t.status === 'ACTIVE');
        res.json(activeTrips);
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};

export const updateTripLocation = (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng, speed } = req.body;

        const db = getDB();
        const trip = db.trips.find(t => t.id === id);

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Find truck and update
        const truck = db.trucks.find(t => t.driver_id === trip.driver_id);
        if (truck) {
            if (lat !== undefined) truck.lat = lat;
            if (lng !== undefined) truck.lng = lng;
            if (speed !== undefined) truck.speed = speed;
            saveDB(db);
            res.json({ success: true, truck });
        } else {
            res.status(404).json({ error: 'Assigned truck not found' });
        }
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};

export const getAlerts = (req, res) => {
    try {
        const db = getDB();
        res.json(db.alerts || []);
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};

export const runAlertEvaluation = (req, res) => {
    try {
        const newAlerts = evaluateAlerts();
        res.json({ success: true, newAlerts });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};

export const postAlert = (req, res) => {
    try {
        const db = getDB();
        const { type, severity, message, driver } = req.body;
        const newAlert = {
            id: `alert-${Date.now()}`,
            type: type || 'SOS_STOLEN',
            severity: severity || 'CRITICAL',
            message: message || 'SOS signal received.',
            driver: driver || 'unknown',
            timestamp: new Date().toISOString(),
        };
        if (!db.alerts) db.alerts = [];
        db.alerts.push(newAlert);
        saveDB(db);
        res.json({ success: true, alert: newAlert });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};

