import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/mockDB.json');

const getDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));

export const evaluateAlerts = () => {
    const db = getDB();
    const activeTrips = db.trips.filter(t => t.status === 'ACTIVE');
    let currentAlerts = [...(db.alerts || [])];
    const newAlerts = [];

    activeTrips.forEach(trip => {
        const truck = db.trucks.find(t => t.driver_id === trip.driver_id);
        const driver = db.drivers.find(d => d.id === trip.driver_id);

        if (!truck || !driver) return;

        // 1. Idle Risk Check
        if (truck.speed === 0) {
            newAlerts.push({
                id: `A-${Date.now()}-IDLE`,
                trip_id: trip.id,
                driver_id: trip.driver_id,
                driver_name: driver.name,
                severity: 'warning',
                type: 'Idle Risk',
                message: `Truck stationary for extended period outside approved stop zone.`,
                timestamp: new Date().toISOString()
            });
        }

        // 2. HOS Risk Check
        // If trip requires X hours but remaining is tight
        if (driver.hos_remaining < 2) {
            newAlerts.push({
                id: `A-${Date.now()}-HOS`,
                trip_id: trip.id,
                driver_id: trip.driver_id,
                driver_name: driver.name,
                severity: 'critical',
                type: 'HOS Risk',
                message: `Remaining HOS (${driver.hos_remaining}h) less than remaining trip drive time + buffer`,
                timestamp: new Date().toISOString()
            });
        }

        // 3. SOS Event passthrough (simulated if truck condition says SOS)
        if (truck.condition === 'SOS') {
            newAlerts.push({
                id: `A-${Date.now()}-SOS`,
                trip_id: trip.id,
                driver_id: trip.driver_id,
                driver_name: driver.name,
                severity: 'critical',
                type: 'SOS',
                message: `Immediate critical alert from driver app.`,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Replace old alerts for simplicity in this demo build, keep it fresh
    db.alerts = newAlerts;
    saveDB(db);
    return newAlerts;
};
