import React from 'react';
import { Settings, AlertTriangle, Crosshair, PhoneCall } from 'lucide-react';

export const DemoControls = () => {

    const simulateDelay = async () => {
        // Evaluate alerts backend logic to trigger idle 
        try {
            await fetch('http://localhost:3000/api/alerts/evaluate', {
                method: 'POST'
            });
            alert('Evaluating alerts triggers on backend. Watch Alerts panel.');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="glass-panel p-4 flex-col gap-3" style={{ position: 'relative' }}>
            <div className="flex-row items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Settings size={18} /> <h3 style={{ fontSize: '1rem', margin: 0 }}>Demo Controls</h3>
            </div>
            <div className="flex-row gap-2">
                <button onClick={simulateDelay} className="btn py-1" style={{ fontSize: '0.8rem', background: '#334155' }}>
                    Trigger Alert Check
                </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>These controls are strictly for demo simulation.</p>
        </div>
    );
};

export default DemoControls;
