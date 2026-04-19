import React from 'react';
import MapDashboard from '../components/MapDashboard';
import AlertsPanel from '../components/AlertsPanel';
import ActiveTripsPanel from '../components/ActiveTripsPanel';
import DemoControls from '../components/DemoControls';

const Dashboard = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <MapDashboard />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 1.2fr)', gap: '2rem' }}>
                <div>
                    <h2 className="mb-4 text-xl">Active Trips</h2>
                    <ActiveTripsPanel />
                </div>
                <div className="flex-col gap-6">
                    <div>
                        <h2 className="mb-4 text-xl">Incoming Alerts</h2>
                        <AlertsPanel />
                    </div>
                    <DemoControls />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
