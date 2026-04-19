import React, { useState, useEffect } from 'react';
import { Navigation2, Truck, Box } from 'lucide-react';

export const ActiveTripsPanel = () => {
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        const fetchTrips = () => {
            fetch('http://localhost:3000/api/trips/active')
                .then(res => res.json())
                .then(data => setTrips(data))
                .catch(err => console.error("Error fetching active trips:", err));
        };

        fetchTrips();
        const intval = setInterval(fetchTrips, 5000);
        return () => clearInterval(intval);
    }, []);

    if (trips.length === 0) {
        return (
            <div className="glass-panel p-6 flex-col items-center justify-center text-center">
                <Box size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No live trips right now.</p>
            </div>
        );
    }

    return (
        <div className="flex-col gap-4">
            {trips.map(trip => (
                <div key={trip.id} className="glass-panel p-4 flex-row justify-between items-center" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex-row items-center gap-4">
                        <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', color: 'var(--primary)' }}>
                            <Navigation2 size={24} />
                        </div>
                        <div className="flex-col">
                            <h4 style={{ margin: 0, fontSize: '1rem' }}>{trip.id}</h4>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Assigned Driver: {trip.driver_id}
                            </span>
                        </div>
                    </div>
                    <div className="flex-col items-end">
                        <span className="badge badge-primary">{trip.status}</span>
                        <span style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>Started: {new Date(trip.scheduled_start_time).toLocaleTimeString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActiveTripsPanel;
