import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Target, Zap, ShieldCheck, Flame, Clock, CloudRain, Navigation2, Send, Calendar } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import CostImpactCard from './CostImpactCard';
import { USERS } from '../auth/jwt';
import { createTrip, getNavproToken } from '../services/navproApi';

const SAT_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SAT_ATT = 'Tiles &copy; Esri';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const redIcon = new L.Icon({
  iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41],
});

const DRIVERS = USERS.filter(u => u.role === 'driver');

function LocationPicker({ pickupPosition, destPosition, setLocation }) {
  const [routePath, setRoutePath] = useState(null);
  const map = useMapEvents({ click(e){ setLocation([e.latlng.lat, e.latlng.lng]); } });
  
  useEffect(() => {
    if (!pickupPosition || !destPosition) { setRoutePath(null); return; }
    fetch(`https://router.project-osrm.org/route/v1/driving/${pickupPosition[1]},${pickupPosition[0]};${destPosition[1]},${destPosition[0]}?overview=full&geometries=geojson`)
      .then(r=>r.json()).then(data=>{
        let path = [pickupPosition,destPosition];
        if(data.routes?.[0]) path = data.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]);
        setRoutePath(path);
        map.fitBounds(L.latLngBounds(path), { padding: [50, 50], maxZoom: 14 });
      }).catch(()=>{
        const path = [pickupPosition,destPosition];
        setRoutePath(path);
        map.fitBounds(L.latLngBounds(path), { padding: [50, 50], maxZoom: 14 });
      });
  },[pickupPosition,destPosition,map]);

  useEffect(() => {
    if (pickupPosition && !destPosition) map.flyTo(pickupPosition, 13);
    else if (destPosition && !pickupPosition) map.flyTo(destPosition, 13);
  }, [pickupPosition, destPosition, map]);

  return (<>
    {pickupPosition && <Marker position={pickupPosition}><Popup>📦 Pickup</Popup></Marker>}
    {destPosition && <Marker position={destPosition} icon={redIcon}><Popup>🏁 Destination</Popup></Marker>}
    {routePath && <Polyline positions={routePath} color="#3b82f6" weight={5} opacity={0.8}/>}
  </>);
}

function AutocompleteSearch({ placeholder, icon, value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    if (query.length > 2 && focused && query !== value) {
      const delayFn = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
          .then(r => r.json())
          .then(d => {
            if (Array.isArray(d)) setSuggestions(d);
            else setSuggestions([]);
          }).catch(()=>setSuggestions([]));
      }, 800);
      return () => clearTimeout(delayFn);
    } else {
      setSuggestions([]);
    }
  }, [query, focused, value]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '0.5rem', padding: '0.6rem 0.8rem' }}>
        {icon}
        <input 
          value={query} 
          onChange={e => { setQuery(e.target.value); onChange && onChange(e.target.value); }} 
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder} 
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '0.5rem', fontSize: '0.85rem', color: '#0f172a' }} 
        />
      </div>
      {suggestions.length > 0 && focused && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '0.5rem', marginTop: '4px', zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {suggestions.map((s, i) => (
            <div 
              key={i} 
              onClick={() => { setQuery(s.display_name); setSuggestions([]); onSelect(s); }}
              style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #eee' : 'none', fontSize: '0.78rem', color: '#333' }}
              onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const iS = {padding:'0.6rem 0.9rem',background:'#f8fafc',border:'1px solid rgba(0,0,0,0.12)',borderRadius:'0.5rem',color:'#0f172a',fontSize:'0.88rem',outline:'none',fontFamily:'inherit',width:'100%',boxSizing:'border-box'};

export const DispatchPanel = () => {
  const [pickupPosition, setPickupPosition] = useState([33.4255,-111.9400]);
  const [destPosition, setDestPosition] = useState(null);
  const [pinMode, setPinMode] = useState('PICKUP');
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [pickupName, setPickupName] = useState('');
  const [destName, setDestName] = useState('');
  const [tripMsg, setTripMsg] = useState('');
  const [creatingTrip, setCreatingTrip] = useState(false);
  const resultsRef = useRef(null);

  const reverseGeocode = async (lat, lng, isPickup) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.display_name?.split(',').slice(0, 3).join(',') || 'Unknown location';
      if (isPickup) setPickupName(addr);
      else setDestName(addr);
    } catch {
      if (isPickup) setPickupName(`Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
      else setDestName(`Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
    }
  };

  const handleMapClick = (latlng) => {
    if (pinMode==='PICKUP') { setPickupPosition(latlng); reverseGeocode(latlng[0], latlng[1], true); setPinMode('DESTINATION'); }
    else { setDestPosition(latlng); reverseGeocode(latlng[0], latlng[1], false); }
  };

  const handleDispatch = async () => {
    if (!pickupPosition||!destPosition){ alert('Set both Pickup and Destination on the map.'); return; }
    setLoading(true); setResults(null); setTripMsg('');
    try {
      const res = await fetch('http://localhost:3000/api/dispatch/match',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({pickupLat:pickupPosition[0],pickupLng:pickupPosition[1],destLat:destPosition[0],destLng:destPosition[1],isHighPriority}),
      });
      const data = await res.json();
      setResults(data);
      const best = data.optimalDrivers?.[0];
      if (best) {
        const matched = DRIVERS.find(d => d.truckId === best.vehicleId || d.name === best.name) || DRIVERS[0];
        setSelectedDriverId(matched.id);
        setSelectedVehicle(matched.truckId);
      }
      setLoadingAi(true); setAiExplanation(null);
      fetch('http://localhost:3000/api/dispatch/explain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({results:data})})
        .then(r=>r.json()).then(d=>setAiExplanation(d.explanation)).catch(()=>setAiExplanation({summary:'AI reasoning offline.'})).finally(()=>setLoadingAi(false));
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch(err){ alert('Backend offline. Run: npm start in /backend'); }
    finally { setLoading(false); }
  };

  const handleCreateTrip = async () => {
    if (!selectedDriverId){ setTripMsg('❌ Select a driver.'); return; }
    if (!pickupPosition||!destPosition){ setTripMsg('❌ Set both map pins first.'); return; }
    if (!scheduleDate){ setTripMsg('❌ Select a scheduled date/time.'); return; }
    setCreatingTrip(true); setTripMsg('');
    const driver = DRIVERS.find(d=>d.id===selectedDriverId);
    const tripInfo = {
      driver_id: driver?.id,
      scheduled_start_time: new Date(scheduleDate).toISOString().replace(/\.\d{3}/,''),
      stop_points:[
        {latitude:pickupPosition[0],longitude:pickupPosition[1],address_name:pickupName||'Pickup',dwell_time:30,notes:''},
        {latitude:destPosition[0],longitude:destPosition[1],address_name:destName||'Destination',dwell_time:0,notes:''},
      ],
    };
    const hasToken = !!getNavproToken();
    if (hasToken) {
      const key = Date.now().toString();
      const res = await createTrip(tripInfo, key);
      setCreatingTrip(false);
      if (res.ok) setTripMsg(`✅ NavPro Trip Created! ID: ${res.data?.trip_id}`);
      else setTripMsg('❌ NavPro error: ' + (res.data?.msg||'Failed'));
    } else {
      try {
        const res = await fetch('http://localhost:3000/api/dispatch/assign',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({driverId:driver?.id||'d1',pickupLat:pickupPosition[0],pickupLng:pickupPosition[1],destLat:destPosition[0],destLng:destPosition[1],addressName:pickupName||'Pickup'}),
        });
        const data = await res.json();
        setTripMsg(data.success ? `✅ Trip Created! ID: ${data.trip_id}` : `❌ ${data.message||'Failed'}`);
      } catch { setTripMsg('❌ Backend offline.'); }
      setCreatingTrip(false);
    }
  };

  const cardStyle = {background:'#fff',border:'1px solid rgba(0,0,0,0.08)',borderRadius:'0.75rem',padding:'1.25rem',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',marginBottom:'1rem'};

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem',paddingBottom:'2rem'}}>
      <div style={{position:'relative',width:'100%',height:'65vh',minHeight:'550px',borderRadius:'1rem',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
        {/* Background Map */}
        <MapContainer center={[33.4255,-111.9400]} zoom={10} style={{height:'100%',width:'100%',zIndex:0}}>
          <TileLayer url={SAT_URL} attribution={SAT_ATT}/>
          <LocationPicker pickupPosition={pickupPosition} destPosition={destPosition} setLocation={handleMapClick}/>
        </MapContainer>

        {/* Floating Left Panel - overflow visible so suggestions don't get clipped */}
        <div style={{position:'absolute',top:20,left:20,width:400,background:'rgba(255,255,255,0.98)',backdropFilter:'blur(10px)',zIndex:1000,borderRadius:'1rem',boxShadow:'0 8px 32px rgba(0,0,0,0.2)',display:'flex',flexDirection:'column', overflow: 'visible'}}>
          <div style={{padding:'1.25rem'}}>
            <h2 style={{color:'var(--primary)',display:'flex',alignItems:'center',gap:8,marginBottom:'1rem',fontSize:'1.2rem',margin:0}}><Zap size={20}/> AI Dispatch + Creator</h2>
            
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'1rem',background:'#f1f5f9',padding:'0.5rem',borderRadius:'0.75rem'}}>
            <div onClick={()=>setPinMode('PICKUP')} style={{border:pinMode==='PICKUP'?'2px solid #3b82f6':'2px solid transparent',borderRadius:'0.6rem',padding:'2px'}}>
              <AutocompleteSearch 
                placeholder="Search Pickup Location..." 
                icon={<MapPin size={16} color="#3b82f6"/>}
                value={pickupName}
                onChange={setPickupName}
                onSelect={(s)=>{
                  setPickupPosition([parseFloat(s.lat), parseFloat(s.lon)]);
                  setPickupName(s.display_name.split(',').slice(0,3).join(','));
                  setPinMode('DESTINATION');
                }}
              />
            </div>
            <div onClick={()=>setPinMode('DESTINATION')} style={{border:pinMode==='DESTINATION'?'2px solid #ef4444':'2px solid transparent',borderRadius:'0.6rem',padding:'2px'}}>
              <AutocompleteSearch 
                placeholder="Search Destination..." 
                icon={<Target size={16} color="#ef4444"/>}
                value={destName}
                onChange={setDestName}
                onSelect={(s)=>{
                  setDestPosition([parseFloat(s.lat), parseFloat(s.lon)]);
                  setDestName(s.display_name.split(',').slice(0,3).join(','));
                }}
              />
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginBottom:'1rem'}}>
            <div>
              <label style={{fontSize:'0.78rem',color:'#64748b',display:'flex',alignItems:'center',gap:5,marginBottom:'0.3rem'}}><Calendar size={13}/> Schedule Date &amp; Time</label>
              <input type="datetime-local" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} style={iS}/>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:'0.85rem',color:isHighPriority?'#d97706':'#64748b'}}>
              <input type="checkbox" checked={isHighPriority} onChange={e=>setIsHighPriority(e.target.checked)} style={{accentColor:'#f59e0b'}}/> <Flame size={15}/> High Priority
            </label>
          </div>

          <button onClick={handleDispatch} disabled={loading} style={{width:'100%',padding:'0.85rem',background:'linear-gradient(135deg,#3b82f6,#6d28d9)',border:'none',borderRadius:'0.6rem',color:'white',fontFamily:'inherit',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>
            {loading?'Analyzing…':<><Search size={16}/> Run AI Match</>}
          </button>
          </div>
        </div>
      </div>

      {/* RESULTS SECTION */}
      {results && (
        <div ref={resultsRef} style={{display:'flex',flexDirection:'column',gap:'1rem', marginTop: '1rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h3 style={{margin:0,color:'#0f172a',fontSize:'1.2rem'}}>Matches ({results.tripDistance} mi)</h3>
          </div>

              {/* Optimal AI Match */}
              {results.optimalDrivers?.[0] && (() => {
                const driver = results.optimalDrivers[0];
                const u = DRIVERS.find(d=>d.truckId===driver.vehicleId)||{name:driver.name,truckId:driver.vehicleId};
                const isSelected = selectedVehicle===driver.vehicleId;
                return (
                  <div style={{...cardStyle,position:'relative',border:`2px solid ${isSelected?'#3b82f6':'#e2e8f0'}`,margin:0,padding:'1rem'}}>
                    <div style={{position:'absolute',top:0,right:0,background:'#3b82f6',color:'white',padding:'2px 8px',borderBottomLeftRadius:'0.5rem',fontSize:'0.65rem',fontWeight:700}}>AI PICK</div>
                    <h4 style={{margin:'0 0 4px',fontSize:'0.9rem',color:'#0f172a',display:'flex',justifyContent:'space-between'}}>{u.name} <span style={{fontSize:'0.8rem',color:'#3b82f6'}}>★ {driver.rating}</span></h4>
                    <div style={{display:'flex',gap:6,marginBottom:8}}>
                      <span style={{background:'rgba(0,0,0,0.06)',color:'#475569',padding:'0.15rem 0.5rem',borderRadius:'999px',fontSize:'0.7rem',fontWeight:600}}>{u.truckId}</span>
                      <span style={{background:'rgba(59,130,246,0.12)',color:'#3b82f6',padding:'0.15rem 0.5rem',borderRadius:'999px',fontSize:'0.7rem',fontWeight:600}}>Score: {driver.matchScore}%</span>
                    </div>
                    <CostImpactCard driver={driver}/>
                    <button onClick={()=>{setSelectedDriverId(DRIVERS.find(d=>d.truckId===driver.vehicleId)?.id||'');setSelectedVehicle(driver.vehicleId);}}
                      style={{marginTop:8,width:'100%',padding:'0.5rem',border:`1px solid ${isSelected?'#3b82f6':'#cbd5e1'}`,borderRadius:'0.5rem',background:isSelected?'rgba(59,130,246,0.1)':'transparent',color:isSelected?'#3b82f6':'#475569',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'0.8rem'}}>
                      {isSelected ? '✓ Selected' : 'Select Driver'}
                    </button>
                  </div>
                );
              })()}

              {/* Fastest Match */}
              {results.nearestTrucks?.[0] && results.nearestTrucks[0].vehicleId !== results.optimalDrivers?.[0]?.vehicleId && (() => {
                const driver = results.nearestTrucks[0];
                const u = DRIVERS.find(d=>d.truckId===driver.vehicleId)||{name:driver.name,truckId:driver.vehicleId};
                const isSelected = selectedVehicle===driver.vehicleId;
                return (
                  <div style={{...cardStyle,border:`2px solid ${isSelected?'#3b82f6':'#f59e0b'}`,margin:0,padding:'1rem'}}>
                    <h4 style={{margin:'0 0 4px',fontSize:'0.9rem',color:'#0f172a'}}>Fastest: {u.name}</h4>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{background:'rgba(245,158,11,0.12)',color:'#d97706',padding:'0.15rem 0.5rem',borderRadius:'999px',fontSize:'0.7rem',fontWeight:600}}>{u.truckId}</span>
                      <span style={{fontWeight:600,color:'#0f172a',fontSize:'0.8rem'}}>ETA: {driver.etaMins}m</span>
                    </div>
                    <button onClick={()=>{setSelectedDriverId(DRIVERS.find(d=>d.truckId===driver.vehicleId)?.id||'');setSelectedVehicle(driver.vehicleId);}}
                      style={{marginTop:8,width:'100%',padding:'0.5rem',border:`1px solid ${isSelected?'#3b82f6':'#f59e0b'}`,borderRadius:'0.5rem',background:isSelected?'rgba(59,130,246,0.1)':'rgba(245,158,11,0.08)',color:isSelected?'#3b82f6':'#d97706',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'0.8rem'}}>
                      {isSelected ? '✓ Selected' : 'Select Fastest'}
                    </button>
                  </div>
                );
              })()}

          {/* Create Dispatch Form */}
          <div style={{border:'2px solid rgba(59,130,246,0.25)',borderRadius:'0.75rem',padding:'1.25rem',background:'#fff'}}>
            <h3 style={{margin:'0 0 1rem',color:'#0f172a',display:'flex',alignItems:'center',gap:8,fontSize:'1.1rem'}}><Send size={18}/> Schedule & Dispatch Trip</h3>
            
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginBottom:'1rem'}}>
                  <div>
                    <label style={{fontSize:'0.75rem',color:'#64748b',display:'block',marginBottom:'0.2rem'}}>Selected Vehicle</label>
                    <input value={selectedVehicle || 'None selected'} readOnly style={{...iS,background:'#e2e8f0',color:'#475569',cursor:'not-allowed',padding:'0.5rem'}}/>
                  </div>
                  <div style={{background:getNavproToken()?'rgba(16,185,129,0.08)':'rgba(245,158,11,0.08)',border:`1px solid ${getNavproToken()?'rgba(16,185,129,0.25)':'rgba(245,158,11,0.25)'}`,borderRadius:'0.5rem',padding:'0.5rem',fontSize:'0.7rem',color:getNavproToken()?'#059669':'#d97706',display:'flex',alignItems:'center',gap:5}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:getNavproToken()?'#10b981':'#f59e0b',flexShrink:0}}/>
                    {getNavproToken()?'Will send to NavPro API':'Demo mode — local backend'}
                  </div>
                </div>

                {tripMsg && <div style={{padding:'0.6rem',background:tripMsg.startsWith('✅')?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${tripMsg.startsWith('✅')?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.2)'}`,borderRadius:'0.5rem',color:tripMsg.startsWith('✅')?'#059669':'#dc2626',fontSize:'0.8rem',marginBottom:'0.85rem'}}>{tripMsg}</div>}

            <button onClick={handleCreateTrip} disabled={creatingTrip} style={{width:'100%',padding:'0.85rem',background:'linear-gradient(135deg,#3b82f6,#6d28d9)',border:'none',borderRadius:'0.6rem',color:'white',fontFamily:'inherit',fontWeight:700,fontSize:'0.95rem',cursor:'pointer',boxShadow:'0 4px 16px rgba(59,130,246,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {creatingTrip?'Creating…':<><Send size={18}/> Create Trip</>}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default DispatchPanel;
