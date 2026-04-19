import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchDrivers } from '../utils/matchAlgorithm.js';
import { createTrip } from '../utils/navproApi.js';
import { generateExplanation } from '../utils/llmApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/mockDB.json');

const getDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));

export const matchJob = (req, res) => {
    try {
        const { pickupLat, pickupLng, destLat, destLng, isHighPriority } = req.body;
        const db = getDB();
        const fuelPrice = db.fuelPrice || 3.85;
        const truckMpg = db.truckMpg || 6.5;
        const result = matchDrivers(pickupLat, pickupLng, destLat, destLng, isHighPriority, db.trucks, db.drivers, fuelPrice, truckMpg);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};

export const assignJob = async (req, res) => {
    try {
        const { driverId, pickupLat, pickupLng, destLat, destLng, addressName } = req.body;

        const stopPoints = [
            {
                latitude: pickupLat,
                longitude: pickupLng,
                address_name: addressName || "Pickup Location",
                appointment_time: new Date(Date.now() + 3600000).toISOString(),
                dwell_time: 30
            },
            {
                latitude: destLat,
                longitude: destLng,
                address_name: "Destination Hub",
                appointment_time: new Date(Date.now() + 10800000).toISOString(),
                dwell_time: 0
            }
        ];

        const tripData = {
            id: `TRIP-${Date.now()}`,
            status: 'ACTIVE',
            scheduled_start_time: new Date().toISOString(),
            driver_id: driverId,
            routing_profile_id: 1,
            stop_points: stopPoints
        };

        const result = await createTrip(tripData);

        // Save to our mock local DB for active monitoring
        const db = getDB();
        db.trips.push(tripData);
        saveDB(db);

        res.json({ ...result, internalTripDetails: tripData });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};

export const explainMatch = async (req, res) => {
    try {
        const explanation = await generateExplanation(req.body.results);
        res.json({ explanation });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};
