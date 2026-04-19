import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { queryVehicles } from '../services/navproApi';
import { getNavproToken } from '../services/navproApi';

// ─── Custom SVG Icons ─────────────────────────────────────────────────────────
const makeDivIcon = (svg, size = 40) =>
  L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });

const TRUCK_SVG = `
<div style="
  width:42px;height:42px;
  background:linear-gradient(135deg,#f59e0b,#d97706);
  border-radius:10px;
  border:2px solid rgba(255,255,255,0.3);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 12px rgba(245,158,11,0.5);
  font-size:22px;line-height:1;
">🚛</div>`;

const DRIVER_SVG = `
<div style="
  width:38px;height:38px;
  background:linear-gradient(135deg,#3b82f6,#6d28d9);
  border-radius:50%;
  border:2px solid rgba(255,255,255,0.35);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 12px rgba(59,130,246,0.5);
  font-size:20px;line-height:1;
">🧍</div>`;

const INACTIVE_TRUCK_SVG = `
<div style="
  width:38px;height:38px;
  background:linear-gradient(135deg,#64748b,#475569);
  border-radius:10px;
  border:2px solid rgba(255,255,255,0.15);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(0,0,0,0.4);
  font-size:20px;line-height:1;opacity:0.7;
">🚛</div>`;

const truckIcon = makeDivIcon(TRUCK_SVG, 42);
const driverIcon = makeDivIcon(DRIVER_SVG, 38);
const inactiveTruckIcon = makeDivIcon(INACTIVE_TRUCK_SVG, 38);

// ─── Mock fallback positions (Tempe, AZ area) ─────────────────────────────────
const MOCK_FLEET = [
  { id: 't1', name: 'Mike Torres', vehicle: 'T-001', lat: 33.4255, lng: -111.9400, status: 'IN_TRANSIT', speed: 55, hos: 8.5, type: 'truck' },
  { id: 't2', name: 'Sarah Chen', vehicle: 'T-002', lat: 33.4480, lng: -111.9200, status: 'IN_TRANSIT', speed: 62, hos: 6.2, type: 'truck' },
  { id: 't3', name: 'James Patel', vehicle: 'T-003', lat: 33.3950, lng: -111.9650, status: 'AVAILABLE', speed: 0, hos: 11.0, type: 'driver' },
  { id: 't4', name: 'Lisa Nguyen', vehicle: 'T-004', lat: 33.4600, lng: -111.8900, status: 'IN_TRANSIT', speed: 48, hos: 4.0, type: 'truck' },
  { id: 't5', name: 'Carlos Rivera', vehicle: 'T-005', lat: 33.3750, lng: -111.9100, status: 'INACTIVE', speed: 0, hos: 0, type: 'truck' },
];

const statusColors = {
  IN_TRANSIT: '#10b981',
  AVAILABLE: '#3b82f6',
  INACTIVE: '#64748b',
  OFF_DUTY: '#f59e0b',
};

export const MapDashboard = () => {
  const center = [33.4255, -111.9400];
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const hasToken = !!getNavproToken();

  useEffect(() => {
    const loadFleet = async () => {
      setLoading(true);
      if (hasToken) {
        try {
          const res = await queryVehicles({ status: 'ACTIVE', vehicle_type: 'TRUCK' });
          if (res.ok && res.data?.data?.length > 0) {
            const mapped = res.data.data.map((v) => ({
              id: String(v.vehicle_id),
              name: v.assignments_drivers?.assign_driver_info?.[0]?.assign_driver_name || 'Unassigned',
              vehicle: v.vehicle_no,
              lat: 33.4255 + (Math.random() - 0.5) * 0.15,
              lng: -111.94 + (Math.random() - 0.5) * 0.15,
              status: v.vehicle_status,
              speed: 0,
              hos: 8,
              type: 'truck',
            }));
            setFleet(mapped);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('NavPro vehicle fetch failed, using mock data', e);
        }
      }
      // Fallback: local backend or mock
      try {
        const res = await fetch('http://localhost:3000/api/truckers');
        if (res.ok) {
          const data = await res.json();
          setFleet(data.filter(d => d.currentLat).map(d => ({
            id: d.id, name: d.name, vehicle: d.vehicleId,
            lat: d.currentLat, lng: d.currentLng,
            status: d.status, speed: d.speed || 0, hos: d.hosRemaining || 0, type: 'truck',
          })));
          setLoading(false);
          return;
        }
      } catch { /* use mock */ }
      setFleet(MOCK_FLEET);
      setLoading(false);
    };
    loadFleet();
  }, [hasToken]);

  const activeCount = fleet.filter(f => f.status === 'IN_TRANSIT').length;

  const filteredFleet = fleet.filter(f => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (f.name && f.name.toLowerCase().includes(query)) ||
      (f.vehicle && f.vehicle.toLowerCase().includes(query)) ||
      (f.type && f.type.toLowerCase().includes(query))
    );
  });

  return (
    <div className="glass-panel animate-fade-in flex-col" style={{ height: '520px', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>Live Fleet Map</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Tracking {activeCount} active vehicles{!hasToken ? ' (demo data)' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search driver or truck..."
            style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.12)', outline: 'none', background: '#f8fafc', fontSize: '0.85rem', width: '200px' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.78rem', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ fontSize: '1rem' }}>🚛</span> Truck</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ fontSize: '1rem' }}>🧍</span> Driver</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, AEX, GeoEye"
          />

          {!loading && filteredFleet.map((unit) => {
            const icon = unit.type === 'driver'
              ? driverIcon
              : unit.status === 'INACTIVE' ? inactiveTruckIcon : truckIcon;

            return (
              <Marker key={unit.id} position={[unit.lat, unit.lng]} icon={icon}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{unit.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: 2 }}>🚛 {unit.vehicle}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[unit.status] || '#888', display: 'inline-block' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: statusColors[unit.status] || '#888' }}>{unit.status}</span>
                    </div>
                    {unit.speed > 0 && <div style={{ fontSize: '0.75rem', color: '#666' }}>Speed: {unit.speed} mph</div>}
                    {unit.hos > 0 && <div style={{ fontSize: '0.75rem', color: '#666' }}>HOS: {unit.hos}h remaining</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9,9,11,0.6)', zIndex: 999 }}>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading fleet positions…</div>
          </div>
        )}
      </div>

      <style>{`
        .leaflet-container { background: #0f172a; font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .leaflet-popup-content p { margin: 0; }
        .leaflet-popup-tip-container { display: none; }
      `}</style>
    </div>
  );
};

export default MapDashboard;
