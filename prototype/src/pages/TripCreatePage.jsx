import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Plus, X, Route, Clock, MapPin, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { createTrip, queryDrivers, getRoutingProfiles, getNavproToken } from '../services/navproApi';

// ─── Map Icons ────────────────────────────────────────────────────────────────
const pinIcon = (color, label) => L.divIcon({
  html: `<div style="background:${color};color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid rgba(255,255,255,0.5);box-shadow:0 2px 8px rgba(0,0,0,0.4)">${label}</div>`,
  className:'', iconSize:[28,28], iconAnchor:[14,14], popupAnchor:[0,-16],
});

const inputS = {width:'100%',padding:'0.6rem 0.9rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',color:'#f8fafc',fontSize:'0.88rem',outline:'none',fontFamily:'inherit',boxSizing:'border-box'};
const labelS = {fontSize:'0.78rem',color:'#94a3b8',marginBottom:'0.3rem',display:'block'};
const fieldS = {display:'flex',flexDirection:'column',marginBottom:'0.85rem'};

const DEFAULT_CENTER = [33.4255, -111.9400];

function MapPicker({ stops, activeStop, onPick }) {
  useMapEvents({
    click(e) {
      if (activeStop !== null) onPick(activeStop, [e.latlng.lat, e.latlng.lng]);
    },
  });
  return stops.map((s, i) =>
    s.position ? (
      <Marker key={i} position={s.position} icon={pinIcon(i === 0 ? '#10b981' : i === stops.length-1 ? '#ef4444' : '#3b82f6', i+1)}>
        <Popup><b>Stop {i+1}</b><br/>{s.address_name || 'Unnamed'}</Popup>
      </Marker>
    ) : null
  );
}

export default function TripCreatePage() {
  const hasToken = !!getNavproToken();
  const [drivers, setDrivers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [stops, setStops] = useState([
    { address_name:'', appointment_time:'', dwell_time:30, notes:'', position:null },
    { address_name:'', appointment_time:'', dwell_time:0, notes:'', position:null },
  ]);
  const [activeStop, setActiveStop] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasToken) return;
    queryDrivers({driver_status:'ACTIVE'}).then(r => setDrivers(r.ok ? (r.data?.data||[]) : []));
    getRoutingProfiles().then(r => setProfiles(r.ok ? (r.data?.data||[]) : []));
  }, [hasToken]);

  const addStop = () => setStops(s => [...s, {address_name:'',appointment_time:'',dwell_time:0,notes:'',position:null}]);
  const removeStop = (idx) => setStops(s => s.filter((_,i) => i!==idx));
  const updateStop = (idx, key, val) => setStops(s => s.map((st,i) => i===idx ? {...st,[key]:val} : st));
  const pickOnMap = (idx, pos) => updateStop(idx, 'position', pos);

  const handleSubmit = async () => {
    if (!selectedDriver) { setError('Select a driver.'); return; }
    if (!scheduledStart) { setError('Set a scheduled start time.'); return; }
    const validStops = stops.filter(s => s.position);
    if (validStops.length < 2) { setError('Place at least 2 stops on the map.'); return; }

    setSubmitting(true); setError(''); setResult(null);
    const tripInfo = {
      driver_id: parseInt(selectedDriver),
      scheduled_start_time: new Date(scheduledStart).toISOString().replace(/\.\d{3}/,''),
      stop_points: validStops.map(s => ({
        latitude: s.position[0],
        longitude: s.position[1],
        address_name: s.address_name || 'Stop',
        appointment_time: s.appointment_time ? new Date(s.appointment_time).toISOString().replace(/\.\d{3}/,'') : undefined,
        dwell_time: parseInt(s.dwell_time) || 0,
        notes: s.notes || '',
      })),
    };
    if (selectedProfile) tripInfo.routing_profile_id = parseInt(selectedProfile);

    const key = crypto.randomUUID?.() || Date.now().toString();
    const res = await createTrip(tripInfo, key);
    setSubmitting(false);
    if (res.ok) setResult({ success: true, trip_id: res.data?.trip_id });
    else setError(res.data?.msg || 'Failed to create trip.');
  };

  const stopColors = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444'];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
      {!hasToken && <div style={{padding:'1rem 1.5rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'0.75rem',color:'#fbbf24',fontSize:'0.85rem'}}>⚠️ No NavPro token. Sign out and add your Bearer token on login to create real trips.</div>}

      {result?.success && (
        <div style={{padding:'1rem 1.5rem',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'0.75rem',color:'#34d399',fontSize:'0.9rem'}}>
          ✅ Trip created! Trip ID: <strong>{result.trip_id}</strong>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:'1.5rem',alignItems:'start'}}>
        {/* Left: Form */}
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="glass-panel" style={{padding:'1.25rem'}}>
            <h3 style={{margin:'0 0 1rem',fontSize:'1rem',color:'#f8fafc'}}>Trip Details</h3>

            <div style={fieldS}>
              <label style={labelS}>Assign Driver</label>
              <select value={selectedDriver} onChange={e=>setSelectedDriver(e.target.value)} style={inputS}>
                <option value="">Select driver…</option>
                {drivers.map(d => (
                  <option key={d.driver_id} value={d.driver_id}>
                    {d.basic_info?.driver_first_name} {d.basic_info?.driver_last_name} (ID: {d.driver_id})
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldS}>
              <label style={labelS}>Scheduled Start Time</label>
              <input type="datetime-local" value={scheduledStart} onChange={e=>setScheduledStart(e.target.value)} style={inputS}/>
            </div>

            <div style={fieldS}>
              <label style={labelS}>Routing Profile (optional)</label>
              <select value={selectedProfile} onChange={e=>setSelectedProfile(e.target.value)} style={inputS}>
                <option value="">Default profile</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name} ({p.truck_ft_length}ft)</option>)}
              </select>
            </div>
          </div>

          {/* Stops */}
          <div className="glass-panel" style={{padding:'1.25rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <h3 style={{margin:0,fontSize:'1rem',color:'#f8fafc'}}>Stop Points ({stops.length})</h3>
              <button onClick={addStop} style={{display:'flex',alignItems:'center',gap:4,padding:'0.3rem 0.7rem',background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'0.4rem',cursor:'pointer',color:'#60a5fa',fontSize:'0.8rem',fontFamily:'inherit'}}>
                <Plus size={13}/> Add Stop
              </button>
            </div>
            {stops.map((s,i) => (
              <div key={i} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${activeStop===i?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`,borderRadius:'0.6rem',padding:'0.9rem',marginBottom:'0.6rem',cursor:'pointer'}} onClick={()=>setActiveStop(i)}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.6rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:22,height:22,borderRadius:'50%',background:stopColors[i]||'#64748b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.68rem',fontWeight:700,color:'white'}}>{i+1}</div>
                    <span style={{fontSize:'0.8rem',color:'#94a3b8',fontWeight:500}}>{i===0?'Origin':i===stops.length-1?'Destination':`Stop ${i+1}`}</span>
                    {s.position && <span style={{fontSize:'0.68rem',color:'#34d399'}}>📍 pinned</span>}
                  </div>
                  {stops.length>2 && <button onClick={e=>{e.stopPropagation();removeStop(i);}} style={{background:'none',border:'none',cursor:'pointer',color:'#64748b',padding:0}}><X size={14}/></button>}
                </div>
                <input value={s.address_name} onChange={e=>updateStop(i,'address_name',e.target.value)} placeholder="Address name" style={{...inputS,marginBottom:'0.4rem',fontSize:'0.82rem'}} onClick={e=>e.stopPropagation()}/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 80px',gap:'0.4rem'}}>
                  <input type="datetime-local" value={s.appointment_time} onChange={e=>updateStop(i,'appointment_time',e.target.value)} style={{...inputS,fontSize:'0.78rem'}} onClick={e=>e.stopPropagation()}/>
                  <input type="number" value={s.dwell_time} onChange={e=>updateStop(i,'dwell_time',e.target.value)} placeholder="Dwell (min)" style={{...inputS,fontSize:'0.78rem'}} onClick={e=>e.stopPropagation()}/>
                </div>
              </div>
            ))}
            <div style={{fontSize:'0.75rem',color:'#475569',marginTop:'0.5rem',textAlign:'center'}}>Click a stop then tap the map to pin its location</div>
          </div>

          {error && <div style={{padding:'0.75rem 1rem',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'0.6rem',color:'#fca5a5',fontSize:'0.85rem'}}>{error}</div>}

          <button onClick={handleSubmit} disabled={submitting} style={{width:'100%',padding:'0.9rem',background:'linear-gradient(135deg,#3b82f6,#6d28d9)',border:'none',borderRadius:'0.75rem',color:'white',fontFamily:'inherit',fontWeight:700,fontSize:'0.95rem',cursor:'pointer',boxShadow:'0 0 20px rgba(59,130,246,0.35)'}}>
            {submitting ? 'Creating Trip…' : '🚛 Create & Dispatch Trip'}
          </button>
        </div>

        {/* Right: Map */}
        <div style={{position:'sticky',top:'1rem'}}>
          <div style={{borderRadius:'0.75rem',overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)',height:580}}>
            <div style={{padding:'0.6rem 1rem',background:'rgba(24,24,27,0.9)',borderBottom:'1px solid rgba(255,255,255,0.08)',fontSize:'0.8rem',color:'#64748b',display:'flex',alignItems:'center',gap:6}}>
              <MapPin size={13}/> Active stop: <strong style={{color:'#f8fafc'}}>Stop {activeStop+1} — {activeStop===0?'Origin':activeStop===stops.length-1?'Destination':`Stop ${activeStop+1}`}</strong>
            </div>
            <MapContainer center={DEFAULT_CENTER} zoom={10} style={{height:'calc(100% - 36px)',width:'100%'}}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO'/>
              <MapPicker stops={stops} activeStop={activeStop} onPick={pickOnMap}/>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
