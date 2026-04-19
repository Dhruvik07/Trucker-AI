import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Info, Clock, MapPin, Truck, PhoneCall, X, Trash2 } from 'lucide-react';

export const AlertsPanel = () => {
    const [alerts, setAlerts] = useState([]);
    const [activeCall, setActiveCall] = useState(null);

    useEffect(() => {
        const fetchAlerts = () => {
            fetch('http://localhost:3000/api/alerts')
                .then(res => res.json())
                .then(data => setAlerts(data))
                .catch(err => console.error("Error fetching alerts:", err));
        };
        fetchAlerts();
        const intval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(intval);
    }, []);

    const getIcon = (severity) => {
        switch (severity) {
            case 'CRITICAL': return <AlertOctagon size={24} color="var(--danger)" />;
            case 'WARNING': return <AlertTriangle size={24} color="var(--warning)" />;
            default: return <Info size={24} color="var(--primary)" />;
        }
    };

    const acknowledgeAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const clearAllAlerts = () => {
        setAlerts([]);
    };

    const callDriver = (driver) => {
        setActiveCall(driver);
        setTimeout(() => {
            alert(`Could not reach ${driver} via VOIP... Sending automated SMS sequence.`);
            setActiveCall(null);
        }, 2000);
    };

    const trackLive = () => {
        alert("Tracking connection established. Redirecting to Live Asset viewer...");
    };

    if (alerts.length === 0) {
        return (
            <div className="flex-col justify-center items-center h-full animate-fade-in" style={{ opacity: 0.7 }}>
                <ShieldCheck size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
                <h2>All Clear</h2>
                <p>No active compliance warnings or safety issues.</p>
            </div>
        );
    }

    return (
        <div className="flex-col gap-6 animate-fade-in">
            <div className="glass-panel p-6">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h2 style={{ color: 'var(--danger)', margin: 0 }}>Active Incidents</h2>
                <button
                    onClick={clearAllAlerts}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.5rem', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit' }}
                >
                    <Trash2 size={14} /> Clear All
                </button>
            </div>
            <p style={{ color: '#64748b', marginBottom: 0 }}>Real-time safety and compliance monitoring. Take immediate action below.</p>
            </div>

            <div className="flex-col gap-4">
                {alerts.map(alert => (
                    <div key={alert.id} className="glass-panel p-6 flex-row items-center gap-6" style={{ borderLeft: `4px solid var(--${alert.severity.toLowerCase()})` }}>
                        <div className={alert.severity === 'CRITICAL' ? 'animate-pulse-danger' : ''}>
                            {getIcon(alert.severity)}
                        </div>

                        <div className="flex-col" style={{ flex: 1 }}>
                            <div className="flex-row items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                                <span className={`badge badge-${alert.severity.toLowerCase()}`}>{alert.type.replace('_', ' ')}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="flex-row items-center gap-1">
                                    <Clock size={14} />
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="flex-row items-center gap-1">
                                    <Truck size={14} />
                                    Driver: {alert.driver}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{alert.message}</h3>
                        </div>

                        <div className="flex-col gap-2">
                            <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                title="Clear this alert"
                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.8rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit' }}
                            >
                                <X size={14} /> Clear
                            </button>

                            {alert.type === 'SOS_STOLEN' && (
                                <button className="btn btn-danger" onClick={trackLive} style={{ padding: '0.5rem' }}>
                                    <MapPin size={16} /> Track Live
                                </button>
                            )}

                            {alert.severity === 'CRITICAL' && alert.type !== 'SOS_STOLEN' && (
                                <button className="btn btn-primary" onClick={() => callDriver(alert.driver)} style={{ padding: '0.5rem' }}>
                                    {activeCall === alert.driver ? 'Calling...' : <><PhoneCall size={16} /> Call Driver</>}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsPanel;
