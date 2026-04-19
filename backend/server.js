import express from 'express';
import cors from 'cors';

import fleetRoutes from './routes/fleetRoutes.js';
import dispatchRoutes from './routes/dispatchRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import tripRoutes from './routes/tripRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Main App Routes
app.use('/api/fleet', fleetRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/trips', tripRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
