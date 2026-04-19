import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/mockDB.json');

const getDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));

export const getFleet = (req, res) => {
    try {
        const db = getDB();
        const trucksWithDrivers = db.trucks.map(t => {
            const driver = db.drivers.find(d => d.id === t.driver_id);
            return { ...t, driver };
        });
        res.json(trucksWithDrivers);
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};

export const postAlert = (req, res) => {
    try {
        const { type, truckId, message } = req.body;
        console.log(`ALERT [${type}] for Truck ${truckId}: ${message}`);
        res.json({ success: true, message: `Alert ${type} registered for ${truckId}` });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};
