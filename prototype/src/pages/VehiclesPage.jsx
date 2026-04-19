import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, RefreshCw, Search, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { queryVehicles, addVehicle, editVehicle, deleteVehicle, updateVehicleStatus, getNavproToken } from '../services/navproApi';

const inputS = {width:'100%',padding:'0.6rem 0.9rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',color:'#f8fafc',fontSize:'0.88rem',outline:'none',fontFamily:'inherit',boxSizing:'border-box'};
const labelS = {fontSize:'0.78rem',color:'#94a3b8',marginBottom:'0.3rem',display:'block'};
const fieldS = {display:'flex',flexDirection:'column',marginBottom:'0.85rem'};

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#18181b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'1rem',padding:'2rem',width:'100%',maxWidth:'520px',maxHeight:'85vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h3 style={{margin:0,color:'#f8fafc'}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const STATUS_COLORS = {ACTIVE:'#10b981',INACTIVE:'#64748b'};
const VEHICLE_TYPES = ['TRUCK','TRAILER'];
const FUEL_TYPES = ['GASOLINE','DIESEL','BIO_DIESEL','ETHANOL'];
const TRAILER_TYPES = ['FLATBED','VAN','REEFER','CONTAINER','DRY_BULK'];
const AXLE_OPTS = ['AXLES_1','AXLES_2','AXLES_3','AXLES_4','AXLES_5','AXLES_6','AXLES_7','AXLES_8'];

const emptyVehicle = {vehicle_no:'',vehicle_type:'TRUCK',fuel_type:'DIESEL',trailer_type:'',axles:'AXLES_5',gross_vehicle_weight:'',vehicle_year:'',vehicle_make:'',vehicle_model:'',vehicle_vin:''};

export default function VehiclesPage() {
  const hasToken = !!getNavproToken();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyVehicle);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchVehicles = useCallback(async () => {
    if (!hasToken) return;
    setLoading(true);
    const params = {};
    if (typeFilter) params.vehicle_type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    const res = await queryVehicles(params);
    setVehicles(res.ok ? (res.data?.data || []) : []);
    setLoading(false);
  }, [hasToken, typeFilter, statusFilter]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleAdd = async () => {
    setSaving(true); setMsg('');
    const payload = {...form};
    if (payload.vehicle_type === 'TRUCK') delete payload.trailer_type;
    if (payload.gross_vehicle_weight) payload.gross_vehicle_weight = parseInt(payload.gross_vehicle_weight);
    const res = await addVehicle(payload);
    setSaving(false);
    if (res.ok) { setMsg('✅ Vehicle added!'); fetchVehicles(); setForm(emptyVehicle); }
    else setMsg('❌ ' + (res.data?.msg || 'Failed to add vehicle'));
  };

  const handleEdit = async () => {
    setSaving(true); setMsg('');
    const payload = {
      vehicle_id: editTarget.vehicle_id,
      vehicle_no: editTarget.vehicle_no,
      vehicle_vin: editTarget.vehicle_vin || '',
      fuel_type: editTarget.fuel_type || 'DIESEL',
      axles: editTarget.axles || 'AXLES_5',
      gross_vehicle_weight: parseInt(editTarget.gross_vehicle_weight) || 0,
      vehicle_make: editTarget.vehicle_make || '',
      vehicle_model: editTarget.vehicle_model || '',
      status: editTarget.vehicle_status,
    };
    const res = await editVehicle(payload);
    setSaving(false);
    if (res.ok) { setMsg('✅ Updated!'); fetchVehicles(); setEditTarget(null); }
    else setMsg('❌ ' + (res.data?.msg || 'Failed'));
  };

  const handleToggleStatus = async (v) => {
    const newStatus = v.vehicle_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateVehicleStatus(v.vehicle_id, newStatus);
    fetchVehicles();
  };

  const handleDelete = async (ids) => {
    if (!window.confirm('Delete selected vehicle(s)?')) return;
    await deleteVehicle(ids); fetchVehicles();
  };

  const filtered = vehicles.filter(v => v.vehicle_no?.toLowerCase().includes(search.toLowerCase()));
  const btnPrimary = {display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 1rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'0.85rem'};

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
      {!hasToken && <div style={{padding:'1rem 1.5rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'0.75rem',color:'#fbbf24',fontSize:'0.85rem'}}>⚠️ No NavPro token. Sign out and add your Bearer token on the login screen.</div>}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
        <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap',flex:1}}>
          <div style={{position:'relative'}}>
            <Search size={13} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#64748b'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicles…" style={{...inputS,paddingLeft:'2rem',width:190}}/>
          </div>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{...inputS,width:120}}>
            <option value="">All Types</option>
            {VEHICLE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{...inputS,width:130}}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button onClick={fetchVehicles} style={{padding:'0.5rem 0.7rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',cursor:'pointer',color:'#94a3b8'}}><RefreshCw size={14}/></button>
        </div>
        <button onClick={()=>setShowAdd(true)} style={btnPrimary}><Plus size={15}/> Add Vehicle</button>
      </div>

      <div className="glass-panel" style={{overflow:'hidden'}}>
        {loading ? <div style={{padding:'3rem',textAlign:'center',color:'#64748b'}}>Loading…</div>
        : filtered.length===0 ? <div style={{padding:'3rem',textAlign:'center',color:'#64748b'}}>{hasToken?'No vehicles found.':'Add NavPro token to see data.'}</div>
        : <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              {['Vehicle','Type','Status','Make / Model','VIN','Owner','Actions'].map(h=>(
                <th key={h} style={{padding:'0.8rem 1.1rem',textAlign:'left',fontSize:'0.72rem',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v,i)=>(
              <tr key={v.vehicle_id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',background:i%2?'rgba(255,255,255,0.01)':'transparent'}}>
                <td style={{padding:'0.9rem 1.1rem'}}>
                  <div style={{fontWeight:600,color:'#f8fafc',fontSize:'0.88rem'}}>{v.vehicle_no}</div>
                  <div style={{fontSize:'0.72rem',color:'#475569'}}>ID: {v.vehicle_id}</div>
                </td>
                <td style={{padding:'0.9rem 1.1rem'}}>
                  <span style={{padding:'0.2rem 0.55rem',borderRadius:'0.35rem',fontSize:'0.7rem',fontWeight:600,background:v.vehicle_type==='TRUCK'?'rgba(245,158,11,0.15)':'rgba(59,130,246,0.15)',color:v.vehicle_type==='TRUCK'?'#fbbf24':'#60a5fa'}}>{v.vehicle_type}</span>
                </td>
                <td style={{padding:'0.9rem 1.1rem'}}>
                  <button onClick={()=>handleToggleStatus(v)} style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',cursor:'pointer',color:STATUS_COLORS[v.vehicle_status]||'#64748b',fontFamily:'inherit',fontSize:'0.8rem',padding:0}}>
                    {v.vehicle_status==='ACTIVE'?<ToggleRight size={18}/>:<ToggleLeft size={18}/>} {v.vehicle_status}
                  </button>
                </td>
                <td style={{padding:'0.9rem 1.1rem',fontSize:'0.8rem',color:'#94a3b8'}}>{[v.vehicle_make,v.vehicle_model].filter(Boolean).join(' ')||'—'}</td>
                <td style={{padding:'0.9rem 1.1rem',fontSize:'0.75rem',color:'#64748b',fontFamily:'monospace'}}>{v.vehicle_vin||'—'}</td>
                <td style={{padding:'0.9rem 1.1rem',fontSize:'0.8rem',color:'#94a3b8'}}>{v.owner_name||'—'}</td>
                <td style={{padding:'0.9rem 1.1rem'}}>
                  <div style={{display:'flex',gap:'0.35rem'}}>
                    <button onClick={()=>setEditTarget({...v})} style={{padding:'0.35rem 0.6rem',background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'0.4rem',cursor:'pointer',color:'#60a5fa'}}><Edit3 size={13}/></button>
                    <button onClick={()=>handleDelete([v.vehicle_id])} style={{padding:'0.35rem 0.6rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'0.4rem',cursor:'pointer',color:'#f87171'}}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>

      {showAdd && (
        <Modal title="Add Vehicle" onClose={()=>{setShowAdd(false);setMsg('');}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 1rem'}}>
            {[['vehicle_no','Vehicle No.'],['vehicle_vin','VIN'],['vehicle_make','Make'],['vehicle_model','Model'],['vehicle_year','Year (YYYY)'],['gross_vehicle_weight','Gross Weight (lbs)']].map(([k,lbl])=>(
              <div key={k} style={fieldS}>
                <label style={labelS}>{lbl}</label>
                <input value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={inputS}/>
              </div>
            ))}
          </div>
          {[['vehicle_type','Vehicle Type',VEHICLE_TYPES],['fuel_type','Fuel Type',FUEL_TYPES],['axles','Axles',AXLE_OPTS]].map(([k,lbl,opts])=>(
            <div key={k} style={fieldS}>
              <label style={labelS}>{lbl}</label>
              <select value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={inputS}>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {form.vehicle_type==='TRAILER' && (
            <div style={fieldS}>
              <label style={labelS}>Trailer Type</label>
              <select value={form.trailer_type} onChange={e=>setForm(p=>({...p,trailer_type:e.target.value}))} style={inputS}>
                <option value="">Select…</option>
                {TRAILER_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          )}
          {msg && <div style={{padding:'0.5rem 0.75rem',background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',borderRadius:'0.4rem',marginBottom:'0.75rem',fontSize:'0.82rem',color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
          <button onClick={handleAdd} disabled={saving} style={{width:'100%',padding:'0.75rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',fontFamily:'inherit',fontWeight:600,cursor:'pointer'}}>{saving?'Adding…':'Add Vehicle'}</button>
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Vehicle" onClose={()=>{setEditTarget(null);setMsg('');}}>
          {[['vehicle_no','Vehicle No.'],['vehicle_vin','VIN'],['vehicle_make','Make'],['vehicle_model','Model'],['gross_vehicle_weight','Gross Weight (lbs)']].map(([k,lbl])=>(
            <div key={k} style={fieldS}>
              <label style={labelS}>{lbl}</label>
              <input value={editTarget[k]||''} onChange={e=>setEditTarget(p=>({...p,[k]:e.target.value}))} style={inputS}/>
            </div>
          ))}
          {msg && <div style={{padding:'0.5rem 0.75rem',background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',borderRadius:'0.4rem',marginBottom:'0.75rem',fontSize:'0.82rem',color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
          <button onClick={handleEdit} disabled={saving} style={{width:'100%',padding:'0.75rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',fontFamily:'inherit',fontWeight:600,cursor:'pointer'}}>{saving?'Saving…':'Save Changes'}</button>
        </Modal>
      )}
    </div>
  );
}
