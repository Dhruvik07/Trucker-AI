import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Trash2, Edit3, RefreshCw, Search, X, BarChart2, Phone, Mail } from 'lucide-react';
import { queryDrivers, inviteDriver, editDriver, deleteDriver, queryDriverPerformance, getNavproToken } from '../services/navproApi';

const STATUS_COLORS = { ACTIVE:'#10b981', INACTIVE:'#64748b', PENDING:'#f59e0b' };
const DRIVER_TYPES = ['OWNER_OPERATOR_OO','COMPANY_DRIVER_CM','LEASE_OWNER_LO','COMPANY_DRIVER_C','OTHER'];
const inputS = { width:'100%', padding:'0.6rem 0.9rem', background:'#f8fafc', border:'1px solid rgba(0,0,0,0.12)', borderRadius:'0.5rem', color:'#0f172a', fontSize:'0.88rem', outline:'none', fontFamily:'inherit', boxSizing:'border-box' };
const labelS = { fontSize:'0.78rem', color:'#475569', marginBottom:'0.3rem', display:'block' };
const fieldS = { display:'flex', flexDirection:'column', marginBottom:'0.85rem' };

function TokenWarning() {
  return (
    <div style={{padding:'1rem 1.5rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'0.75rem',color:'#d97706',fontSize:'0.85rem',marginBottom:'1.5rem'}}>
      ⚠️ <strong>NavPro token required</strong> — Sign out and add your Bearer token on the login screen to enable Invite / Create / Delete operations. Without a token, data is in demo mode.
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#ffffff',border:'1px solid rgba(0,0,0,0.1)',borderRadius:'1rem',padding:'2rem',width:'100%',maxWidth:'500px',maxHeight:'85vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h3 style={{margin:0,color:'#0f172a'}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer'}}><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DriversPage() {
  const hasToken = !!getNavproToken();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab] = useState('list');
  const [showInvite, setShowInvite] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [perfData, setPerfData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [inviteForm, setInviteForm] = useState({driver_first_name:'',driver_last_name:'',driver_email:'',driver_phone_number:'',driver_password:'',driver_type:'OWNER_OPERATOR_OO'});

  const fetchDrivers = useCallback(async () => {
    if (!hasToken) return;
    setLoading(true);
    const params = {};
    if (statusFilter) params.driver_status = statusFilter;
    const res = await queryDrivers(params);
    setDrivers(res.ok ? (res.data?.data || []) : []);
    setLoading(false);
  }, [hasToken, statusFilter]);

  const fetchPerf = useCallback(async () => {
    if (!hasToken) return;
    const now = new Date();
    const start = new Date(now - 30*24*60*60*1000).toISOString().split('.')[0]+'Z';
    const end = now.toISOString().split('.')[0]+'Z';
    const res = await queryDriverPerformance({page:0,page_size:50,time_range:{start_time:start,end_time:end}});
    setPerfData(res.ok ? (res.data?.data || []) : []);
  }, [hasToken]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);
  useEffect(() => { if (tab==='performance') fetchPerf(); }, [tab, fetchPerf]);

  const handleInvite = async () => {
    if (!hasToken) { setMsg('❌ NavPro token required. Sign out and add it on the login page.'); return; }
    setSaving(true); setMsg('');
    const res = await inviteDriver(inviteForm);
    setSaving(false);
    if (res.ok) { setMsg('✅ Invited!'); fetchDrivers(); }
    else setMsg('❌ ' + (res.data?.msg || JSON.stringify(res.data) || 'Failed — check your NavPro token'));
  };

  const handleEdit = async () => {
    setSaving(true); setMsg('');
    const res = await editDriver({
      driver_id: editTarget.driver_id,
      driver_first_name: editTarget.basic_info?.driver_first_name,
      driver_last_name: editTarget.basic_info?.driver_last_name,
      driver_phone_number: editTarget.basic_info?.driver_phone_number || '000-000-0000',
      driver_type: editTarget.basic_info?.driver_type || 'OTHER',
    });
    setSaving(false);
    if (res.ok) { setMsg('✅ Updated!'); fetchDrivers(); setEditTarget(null); }
    else setMsg('❌ ' + (res.data?.msg || 'Failed'));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this driver?')) return;
    await deleteDriver(id); fetchDrivers();
  };

  const filtered = drivers.filter(d => {
    const name = `${d.basic_info?.driver_first_name||''} ${d.basic_info?.driver_last_name||''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const btnPrimary = {display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 1rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'0.85rem'};
  const btnIcon = (color) => ({padding:'0.35rem 0.6rem',background:`rgba(${color},0.12)`,border:`1px solid rgba(${color},0.3)`,borderRadius:'0.4rem',cursor:'pointer',color:`rgb(${color})`});

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
      {!hasToken && <TokenWarning />}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
        <div style={{display:'flex',gap:'0.5rem'}}>
          {['list','performance'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{padding:'0.5rem 1.1rem',borderRadius:'0.5rem',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'0.83rem',background:tab===t?'var(--primary)':'rgba(255,255,255,0.06)',color:tab===t?'white':'#94a3b8'}}>
              {t==='list'?'Driver List':'Performance'}
            </button>
          ))}
        </div>
        {tab==='list' && (
          <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap'}}>
            <div style={{position:'relative'}}>
              <Search size={13} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#64748b'}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...inputS,paddingLeft:'2rem',width:180}}/>
            </div>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{...inputS,width:130}}>
              <option value="">All Statuses</option>
              {['ACTIVE','INACTIVE','PENDING'].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={fetchDrivers} style={{padding:'0.5rem 0.7rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',cursor:'pointer',color:'#94a3b8'}}><RefreshCw size={14}/></button>
            <button onClick={()=>setShowInvite(true)} style={btnPrimary}><Plus size={15}/> Invite Driver</button>
          </div>
        )}
      </div>

      {tab==='list' && (
        <div className="glass-panel" style={{overflow:'hidden'}}>
          {loading ? <div style={{padding:'3rem',textAlign:'center',color:'#64748b'}}>Loading…</div>
          : filtered.length===0 ? <div style={{padding:'3rem',textAlign:'center',color:'#64748b'}}>{hasToken?'No drivers found.':'Add NavPro token to see data.'}</div>
          : <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                {['Driver','Contact','Status','Work Status','Location','Actions'].map(h=>(
                  <th key={h} style={{padding:'0.8rem 1.1rem',textAlign:'left',fontSize:'0.72rem',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d,i)=>(
                <tr key={d.driver_id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',background:i%2?'rgba(255,255,255,0.01)':'transparent'}}>
                  <td style={{padding:'0.9rem 1.1rem'}}>
                    <div style={{fontWeight:600,color:'#f8fafc',fontSize:'0.88rem'}}>{d.basic_info?.driver_first_name} {d.basic_info?.driver_last_name}</div>
                    <div style={{fontSize:'0.72rem',color:'#475569'}}>ID: {d.driver_id} · {d.basic_info?.driver_type?.replace(/_/g,' ')}</div>
                  </td>
                  <td style={{padding:'0.9rem 1.1rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.77rem',color:'#94a3b8'}}><Phone size={11}/>{d.basic_info?.driver_phone_number||'—'}</div>
                    <div style={{display:'flex',alignItems:'center',gap:4,fontSize:'0.77rem',color:'#94a3b8',marginTop:2}}><Mail size={11}/>{d.basic_info?.driver_email||'—'}</div>
                  </td>
                  <td style={{padding:'0.9rem 1.1rem'}}>
                    <span style={{padding:'0.2rem 0.6rem',borderRadius:'999px',fontSize:'0.7rem',fontWeight:600,background:`${STATUS_COLORS[d.status]||'#64748b'}22`,color:STATUS_COLORS[d.status]||'#64748b',border:`1px solid ${STATUS_COLORS[d.status]||'#64748b'}44`}}>{d.status||'—'}</span>
                  </td>
                  <td style={{padding:'0.9rem 1.1rem',fontSize:'0.8rem',color:'#94a3b8'}}>{d.basic_info?.work_status||'—'}</td>
                  <td style={{padding:'0.9rem 1.1rem',fontSize:'0.75rem',color:'#64748b',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.driver_location?.last_known_location||'—'}</td>
                  <td style={{padding:'0.9rem 1.1rem'}}>
                    <div style={{display:'flex',gap:'0.35rem'}}>
                      <button onClick={()=>setEditTarget(d)} style={{...btnIcon('59,130,246'),color:'#60a5fa'}}><Edit3 size={13}/></button>
                      <button onClick={()=>handleDelete(d.driver_id)} style={{...btnIcon('239,68,68'),color:'#f87171'}}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>}
        </div>
      )}

      {tab==='performance' && (
        <div className="glass-panel" style={{overflow:'hidden'}}>
          {perfData.length===0 ? <div style={{padding:'3rem',textAlign:'center',color:'#64748b'}}>{hasToken?'No performance data for last 30 days.':'Add NavPro token.'}</div>
          : <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                {['Driver ID','Sched Miles','Actual Miles','OOR Miles','Sched Time','Actual Time'].map(h=>(
                  <th key={h} style={{padding:'0.8rem 1.1rem',textAlign:'left',fontSize:'0.72rem',color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perfData.map((p,i)=>(
                <tr key={p.driver_id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',background:i%2?'rgba(255,255,255,0.01)':'transparent'}}>
                  <td style={{padding:'0.85rem 1.1rem',fontWeight:600,color:'#f8fafc'}}>{p.driver_id}</td>
                  <td style={{padding:'0.85rem 1.1rem',color:'#94a3b8'}}>{p.schedule_miles}</td>
                  <td style={{padding:'0.85rem 1.1rem',color:p.actual_miles>p.schedule_miles?'#f87171':'#34d399'}}>{p.actual_miles}</td>
                  <td style={{padding:'0.85rem 1.1rem',color:p.oor_miles>0?'#fbbf24':'#94a3b8'}}>{p.oor_miles}</td>
                  <td style={{padding:'0.85rem 1.1rem',color:'#94a3b8'}}>{p.schedule_time} min</td>
                  <td style={{padding:'0.85rem 1.1rem',color:p.actual_time>p.schedule_time?'#f87171':'#34d399'}}>{p.actual_time} min</td>
                </tr>
              ))}
            </tbody>
          </table>}
        </div>
      )}

      {showInvite && (
        <Modal title="Invite New Driver" onClose={()=>{setShowInvite(false);setMsg('');}}>
          {[['driver_first_name','First Name','text'],['driver_last_name','Last Name','text'],['driver_email','Email','email'],['driver_phone_number','Phone (111-222-3333)','text'],['driver_password','Password','password']].map(([k,lbl,type])=>(
            <div key={k} style={fieldS}>
              <label style={labelS}>{lbl}</label>
              <input type={type} value={inviteForm[k]} onChange={e=>setInviteForm(p=>({...p,[k]:e.target.value}))} style={inputS}/>
            </div>
          ))}
          <div style={fieldS}>
            <label style={labelS}>Driver Type</label>
            <select value={inviteForm.driver_type} onChange={e=>setInviteForm(p=>({...p,driver_type:e.target.value}))} style={inputS}>
              {DRIVER_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          {msg && <div style={{padding:'0.5rem 0.75rem',background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',borderRadius:'0.4rem',marginBottom:'0.75rem',fontSize:'0.82rem',color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
          <button onClick={handleInvite} disabled={saving} style={{width:'100%',padding:'0.75rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',fontFamily:'inherit',fontWeight:600,cursor:'pointer'}}>{saving?'Inviting…':'Send Invitation'}</button>
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Driver" onClose={()=>{setEditTarget(null);setMsg('');}}>
          {[['driver_first_name','First Name'],['driver_last_name','Last Name'],['driver_phone_number','Phone (111-222-3333)']].map(([k,lbl])=>(
            <div key={k} style={fieldS}>
              <label style={labelS}>{lbl}</label>
              <input type="text" value={editTarget.basic_info?.[k]||''} onChange={e=>setEditTarget(p=>({...p,basic_info:{...p.basic_info,[k]:e.target.value}}))} style={inputS}/>
            </div>
          ))}
          <div style={fieldS}>
            <label style={labelS}>Driver Type</label>
            <select value={editTarget.basic_info?.driver_type||'OTHER'} onChange={e=>setEditTarget(p=>({...p,basic_info:{...p.basic_info,driver_type:e.target.value}}))} style={inputS}>
              {DRIVER_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          {msg && <div style={{padding:'0.5rem 0.75rem',background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',borderRadius:'0.4rem',marginBottom:'0.75rem',fontSize:'0.82rem',color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
          <button onClick={handleEdit} disabled={saving} style={{width:'100%',padding:'0.75rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',fontFamily:'inherit',fontWeight:600,cursor:'pointer'}}>{saving?'Saving…':'Save Changes'}</button>
        </Modal>
      )}
    </div>
  );
}
