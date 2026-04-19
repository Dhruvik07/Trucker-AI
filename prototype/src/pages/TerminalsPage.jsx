import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, RefreshCw, X, Users, Building2, UserPlus, UserMinus } from 'lucide-react';
import { getTerminals, createTerminal, editTerminal, deleteTerminal, getTerminalMembers, addTerminalMember, deleteTerminalMember, getNavproToken } from '../services/navproApi';

const inputS = {width:'100%',padding:'0.6rem 0.9rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',color:'#f8fafc',fontSize:'0.88rem',outline:'none',fontFamily:'inherit',boxSizing:'border-box'};
const labelS = {fontSize:'0.78rem',color:'#94a3b8',marginBottom:'0.3rem',display:'block'};
const fieldS = {display:'flex',flexDirection:'column',marginBottom:'0.85rem'};

function Modal({ title, onClose, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#18181b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'1rem',padding:'2rem',width:'100%',maxWidth:'500px',maxHeight:'85vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h3 style={{margin:0,color:'#f8fafc'}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function TerminalsPage() {
  const hasToken = !!getNavproToken();
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [newName, setNewName] = useState('');
  const [addMemberId, setAddMemberId] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchTerminals = useCallback(async () => {
    if (!hasToken) return;
    setLoading(true);
    const res = await getTerminals();
    setTerminals(res.ok ? (res.data?.terminals || []) : []);
    setLoading(false);
  }, [hasToken]);

  const fetchMembers = useCallback(async (id) => {
    setLoadingMembers(true);
    const res = await getTerminalMembers(id);
    setMembers(res.ok ? (res.data?.data || []) : []);
    setLoadingMembers(false);
  }, []);

  useEffect(() => { fetchTerminals(); }, [fetchTerminals]);
  useEffect(() => { if (selected) fetchMembers(selected.terminal_id); }, [selected, fetchMembers]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true); setMsg('');
    const res = await createTerminal(newName.trim());
    setSaving(false);
    if (res.ok) { setMsg('✅ Terminal created!'); fetchTerminals(); setNewName(''); }
    else setMsg('❌ ' + (res.data?.msg || 'Failed'));
  };

  const handleEdit = async () => {
    setSaving(true); setMsg('');
    const res = await editTerminal(editTarget.terminal_id, editTarget.terminal_name);
    setSaving(false);
    if (res.ok) { setMsg('✅ Updated!'); fetchTerminals(); setEditTarget(null); }
    else setMsg('❌ ' + (res.data?.msg || 'Failed'));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this terminal and all its members?')) return;
    await deleteTerminal(id);
    if (selected?.terminal_id === id) setSelected(null);
    fetchTerminals();
  };

  const handleAddMember = async () => {
    if (!addMemberId || !selected) return;
    setSaving(true);
    await addTerminalMember(selected.terminal_id, [parseInt(addMemberId)]);
    setSaving(false);
    setAddMemberId('');
    fetchMembers(selected.terminal_id);
  };

  const handleRemoveMember = async (memberId) => {
    if (!selected) return;
    await deleteTerminalMember(selected.terminal_id, memberId);
    fetchMembers(selected.terminal_id);
  };

  const btnPrimary = {display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 1rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'0.85rem'};

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
      {!hasToken && <div style={{padding:'1rem 1.5rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'0.75rem',color:'#fbbf24',fontSize:'0.85rem'}}>⚠️ No NavPro token. Sign out and add your Bearer token on login.</div>}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2 style={{margin:0,display:'flex',alignItems:'center',gap:'0.5rem'}}><Building2 size={22}/> Terminals</h2>
        <div style={{display:'flex',gap:'0.6rem'}}>
          <button onClick={fetchTerminals} style={{padding:'0.5rem 0.7rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',cursor:'pointer',color:'#94a3b8'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowCreate(true)} style={btnPrimary}><Plus size={15}/> New Terminal</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:'1.5rem'}}>
        {/* Terminal list */}
        <div className="glass-panel" style={{padding:'1rem',display:'flex',flexDirection:'column',gap:'0.5rem',maxHeight:500,overflowY:'auto'}}>
          {loading ? <div style={{padding:'2rem',textAlign:'center',color:'#64748b'}}>Loading…</div>
          : terminals.length===0 ? <div style={{padding:'2rem',textAlign:'center',color:'#64748b'}}>{hasToken?'No terminals.':'Add token.'}</div>
          : terminals.map(t => (
            <div key={t.terminal_id} onClick={()=>setSelected(t)}
              style={{padding:'0.85rem 1rem',borderRadius:'0.6rem',cursor:'pointer',background:selected?.terminal_id===t.terminal_id?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.03)',border:`1px solid ${selected?.terminal_id===t.terminal_id?'rgba(59,130,246,0.35)':'rgba(255,255,255,0.07)'}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:600,color:'#f8fafc',fontSize:'0.88rem'}}>{t.terminal_name}</div>
                <div style={{fontSize:'0.72rem',color:'#64748b',marginTop:2}}>{t.member_number} members</div>
              </div>
              <div style={{display:'flex',gap:'0.3rem'}}>
                <button onClick={e=>{e.stopPropagation();setEditTarget({...t});}} style={{padding:'0.28rem 0.5rem',background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'0.35rem',cursor:'pointer',color:'#60a5fa'}}><Edit3 size={12}/></button>
                <button onClick={e=>{e.stopPropagation();handleDelete(t.terminal_id);}} style={{padding:'0.28rem 0.5rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'0.35rem',cursor:'pointer',color:'#f87171'}}><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Members panel */}
        <div className="glass-panel" style={{overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {!selected ? (
            <div style={{padding:'3rem',textAlign:'center',color:'#64748b'}}>← Select a terminal to manage its members</div>
          ) : <>
            <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:700,color:'#f8fafc'}}>{selected.terminal_name}</div>
                <div style={{fontSize:'0.75rem',color:'#64748b'}}>{members.length} member(s)</div>
              </div>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <input value={addMemberId} onChange={e=>setAddMemberId(e.target.value)} placeholder="Driver ID" style={{...inputS,width:110,fontSize:'0.82rem'}}/>
                <button onClick={handleAddMember} disabled={saving} style={{...btnPrimary,padding:'0.45rem 0.9rem',fontSize:'0.82rem'}}><UserPlus size={14}/> Add</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {loadingMembers ? <div style={{padding:'2rem',textAlign:'center',color:'#64748b'}}>Loading members…</div>
              : members.length===0 ? <div style={{padding:'2rem',textAlign:'center',color:'#64748b'}}>No members in this terminal.</div>
              : <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    {['Member','Email','Phone','Status','Role','Remove'].map(h=>(
                      <th key={h} style={{padding:'0.75rem 1.1rem',textAlign:'left',fontSize:'0.7rem',color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m,i)=>(
                    <tr key={m.member_id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',background:i%2?'rgba(255,255,255,0.01)':'transparent'}}>
                      <td style={{padding:'0.8rem 1.1rem',fontWeight:600,color:'#f8fafc',fontSize:'0.85rem'}}>{m.member_first_name} {m.member_last_name}</td>
                      <td style={{padding:'0.8rem 1.1rem',fontSize:'0.78rem',color:'#94a3b8'}}>{m.member_email||'—'}</td>
                      <td style={{padding:'0.8rem 1.1rem',fontSize:'0.78rem',color:'#94a3b8'}}>{m.member_phone_number||'—'}</td>
                      <td style={{padding:'0.8rem 1.1rem',fontSize:'0.75rem',color:m.member_status==='Active'?'#34d399':'#64748b'}}>{m.member_status}</td>
                      <td style={{padding:'0.8rem 1.1rem',fontSize:'0.75rem',color:'#94a3b8'}}>{m.member_role}</td>
                      <td style={{padding:'0.8rem 1.1rem'}}>
                        <button onClick={()=>handleRemoveMember(m.member_id)} style={{padding:'0.3rem 0.55rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'0.4rem',cursor:'pointer',color:'#f87171'}}><UserMinus size={13}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>}
            </div>
          </>}
        </div>
      </div>

      {showCreate && (
        <Modal title="Create Terminal" onClose={()=>{setShowCreate(false);setMsg('');}}>
          <div style={fieldS}>
            <label style={labelS}>Terminal Name (must be unique)</label>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Phoenix Terminal 1" style={inputS}/>
          </div>
          {msg && <div style={{padding:'0.5rem 0.75rem',background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',borderRadius:'0.4rem',marginBottom:'0.75rem',fontSize:'0.82rem',color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
          <button onClick={handleCreate} disabled={saving} style={{width:'100%',padding:'0.75rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',fontFamily:'inherit',fontWeight:600,cursor:'pointer'}}>{saving?'Creating…':'Create Terminal'}</button>
        </Modal>
      )}

      {editTarget && (
        <Modal title="Rename Terminal" onClose={()=>{setEditTarget(null);setMsg('');}}>
          <div style={fieldS}>
            <label style={labelS}>Terminal Name</label>
            <input value={editTarget.terminal_name} onChange={e=>setEditTarget(p=>({...p,terminal_name:e.target.value}))} style={inputS}/>
          </div>
          {msg && <div style={{padding:'0.5rem 0.75rem',background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',borderRadius:'0.4rem',marginBottom:'0.75rem',fontSize:'0.82rem',color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
          <button onClick={handleEdit} disabled={saving} style={{width:'100%',padding:'0.75rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',fontFamily:'inherit',fontWeight:600,cursor:'pointer'}}>{saving?'Saving…':'Save'}</button>
        </Modal>
      )}
    </div>
  );
}
