import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Edit3, RefreshCw, Search, X, Upload, FileText, Lock, Unlock } from 'lucide-react';
import { queryDocuments, editDocument, addDocument, deleteDocument, getNavproToken } from '../services/navproApi';

const inputS = {width:'100%',padding:'0.6rem 0.9rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',color:'#f8fafc',fontSize:'0.88rem',outline:'none',fontFamily:'inherit',boxSizing:'border-box'};
const labelS = {fontSize:'0.78rem',color:'#94a3b8',marginBottom:'0.3rem',display:'block'};
const fieldS = {display:'flex',flexDirection:'column',marginBottom:'0.85rem'};

const DOC_TYPES = ['BILL_OF_LADING','PROOF_OF_DELIVERY','TRIP_SHEET','CAT_SCALE','FUEL_RECEIPT','INVOICE','RATE_CONFIRMATION','OTHER'];
const TYPE_COLORS = {'BILL_OF_LADING':'#3b82f6','PROOF_OF_DELIVERY':'#10b981','FUEL_RECEIPT':'#f59e0b','INVOICE':'#8b5cf6','RATE_CONFIRMATION':'#06b6d4','OTHER':'#64748b'};

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

export default function DocumentsPage() {
  const hasToken = !!getNavproToken();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploadForm, setUploadForm] = useState({document_type:'BILL_OF_LADING',is_private:false});
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const fetchDocs = useCallback(async () => {
    if (!hasToken) return;
    setLoading(true);
    const params = {};
    if (typeFilter) params.document_types = [typeFilter];
    const res = await queryDocuments(params);
    setDocs(res.ok ? (res.data?.data || []) : []);
    setLoading(false);
  }, [hasToken, typeFilter]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async () => {
    if (!selectedFile) { setMsg('❌ Please select a file'); return; }
    setSaving(true); setMsg('');
    const res = await addDocument(selectedFile, { document_type: uploadForm.document_type, is_private: uploadForm.is_private });
    setSaving(false);
    if (res.ok) { setMsg('✅ Document uploaded!'); fetchDocs(); setSelectedFile(null); setUploadForm({document_type:'BILL_OF_LADING',is_private:false}); }
    else setMsg('❌ ' + (res.data?.msg || 'Upload failed'));
  };

  const handleEdit = async () => {
    setSaving(true); setMsg('');
    const res = await editDocument({ document_id: editTarget.document_id, document_name: editTarget.document_name, is_private: editTarget.is_private, scope: editTarget.scope || 'UPLOAD_FILE' });
    setSaving(false);
    if (res.ok) { setMsg('✅ Updated!'); fetchDocs(); setEditTarget(null); }
    else setMsg('❌ ' + (res.data?.msg || 'Failed'));
  };

  const handleDelete = async (id, scope) => {
    if (!window.confirm('Delete this document?')) return;
    await deleteDocument(id, scope || 'UPLOAD_FILE'); fetchDocs();
  };

  const filtered = docs.filter(d => d.document_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
      {!hasToken && <div style={{padding:'1rem 1.5rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'0.75rem',color:'#fbbf24',fontSize:'0.85rem'}}>⚠️ No NavPro token. Sign out and add your Bearer token on login.</div>}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
        <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap',flex:1}}>
          <div style={{position:'relative'}}>
            <Search size={13} style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',color:'#64748b'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…" style={{...inputS,paddingLeft:'2rem',width:200}}/>
          </div>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{...inputS,width:180}}>
            <option value="">All Types</option>
            {DOC_TYPES.map(t=><option key={t}>{t.replace(/_/g,' ')}</option>)}
          </select>
          <button onClick={fetchDocs} style={{padding:'0.5rem 0.7rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.5rem',cursor:'pointer',color:'#94a3b8'}}><RefreshCw size={14}/></button>
        </div>
        <button onClick={()=>setShowUpload(true)} style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 1rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:'0.85rem'}}><Upload size={15}/> Upload Document</button>
      </div>

      <div className="glass-panel" style={{overflow:'hidden'}}>
        {loading ? <div style={{padding:'3rem',textAlign:'center',color:'#64748b'}}>Loading…</div>
        : filtered.length===0 ? <div style={{padding:'3rem',textAlign:'center',color:'#64748b'}}>{hasToken?'No documents found.':'Add NavPro token to see data.'}</div>
        : <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              {['Document','Type','Uploaded By','Date','Privacy','Actions'].map(h=>(
                <th key={h} style={{padding:'0.8rem 1.1rem',textAlign:'left',fontSize:'0.72rem',color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d,i)=>{
              const typeColor = TYPE_COLORS[d.document_type] || '#64748b';
              return (
                <tr key={d.document_id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)',background:i%2?'rgba(255,255,255,0.01)':'transparent'}}>
                  <td style={{padding:'0.9rem 1.1rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <FileText size={15} style={{color:typeColor,flexShrink:0}}/>
                      <div>
                        <div style={{fontWeight:600,color:'#f8fafc',fontSize:'0.85rem'}}>{d.document_name}</div>
                        <div style={{fontSize:'0.7rem',color:'#475569'}}>ID: {d.document_id} · {d.size}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'0.9rem 1.1rem'}}>
                    <span style={{padding:'0.2rem 0.55rem',borderRadius:'0.35rem',fontSize:'0.68rem',fontWeight:600,background:`${typeColor}22`,color:typeColor}}>{d.document_type?.replace(/_/g,' ')}</span>
                  </td>
                  <td style={{padding:'0.9rem 1.1rem',fontSize:'0.8rem',color:'#94a3b8'}}>{d.upload_by||'—'}</td>
                  <td style={{padding:'0.9rem 1.1rem',fontSize:'0.78rem',color:'#64748b'}}>{d.upload_date ? new Date(d.upload_date).toLocaleDateString() : '—'}</td>
                  <td style={{padding:'0.9rem 1.1rem'}}>
                    {d.is_private ? <Lock size={14} style={{color:'#f87171'}}/> : <Unlock size={14} style={{color:'#34d399'}}/>}
                  </td>
                  <td style={{padding:'0.9rem 1.1rem'}}>
                    <div style={{display:'flex',gap:'0.35rem'}}>
                      {d.scope==='UPLOAD_FILE' && <>
                        <button onClick={()=>setEditTarget({...d})} style={{padding:'0.35rem 0.6rem',background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:'0.4rem',cursor:'pointer',color:'#60a5fa'}}><Edit3 size={13}/></button>
                        <button onClick={()=>handleDelete(d.document_id,d.scope)} style={{padding:'0.35rem 0.6rem',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'0.4rem',cursor:'pointer',color:'#f87171'}}><Trash2 size={13}/></button>
                      </>}
                      {d.document_url && <a href={d.document_url} target="_blank" rel="noreferrer" style={{padding:'0.35rem 0.6rem',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'0.4rem',color:'#34d399',fontSize:'0.72rem',textDecoration:'none'}}>View</a>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>}
      </div>

      {showUpload && (
        <Modal title="Upload Document" onClose={()=>{setShowUpload(false);setMsg('');setSelectedFile(null);}}>
          <div style={fieldS}>
            <label style={labelS}>Document Type</label>
            <select value={uploadForm.document_type} onChange={e=>setUploadForm(p=>({...p,document_type:e.target.value}))} style={inputS}>
              {DOC_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div style={fieldS}>
            <label style={labelS}>File</label>
            <div style={{border:'2px dashed rgba(255,255,255,0.15)',borderRadius:'0.6rem',padding:'1.5rem',textAlign:'center',cursor:'pointer',color:'#64748b',fontSize:'0.85rem'}} onClick={()=>fileRef.current?.click()}>
              {selectedFile ? <><FileText size={18} style={{marginBottom:4}}/><br/>{selectedFile.name}</> : <><Upload size={18} style={{marginBottom:4}}/><br/>Click to select file</>}
            </div>
            <input ref={fileRef} type="file" style={{display:'none'}} onChange={e=>setSelectedFile(e.target.files[0])}/>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:'1rem',color:'#94a3b8',fontSize:'0.85rem'}}>
            <input type="checkbox" checked={uploadForm.is_private} onChange={e=>setUploadForm(p=>({...p,is_private:e.target.checked}))}/> Private document
          </label>
          {msg && <div style={{padding:'0.5rem 0.75rem',background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',borderRadius:'0.4rem',marginBottom:'0.75rem',fontSize:'0.82rem',color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
          <button onClick={handleUpload} disabled={saving} style={{width:'100%',padding:'0.75rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',fontFamily:'inherit',fontWeight:600,cursor:'pointer'}}>{saving?'Uploading…':'Upload'}</button>
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Document" onClose={()=>{setEditTarget(null);setMsg('');}}>
          <div style={fieldS}>
            <label style={labelS}>Document Name</label>
            <input value={editTarget.document_name||''} onChange={e=>setEditTarget(p=>({...p,document_name:e.target.value}))} style={inputS}/>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:'1rem',color:'#94a3b8',fontSize:'0.85rem'}}>
            <input type="checkbox" checked={editTarget.is_private||false} onChange={e=>setEditTarget(p=>({...p,is_private:e.target.checked}))}/> Private document
          </label>
          {msg && <div style={{padding:'0.5rem 0.75rem',background:msg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',borderRadius:'0.4rem',marginBottom:'0.75rem',fontSize:'0.82rem',color:msg.startsWith('✅')?'#34d399':'#f87171'}}>{msg}</div>}
          <button onClick={handleEdit} disabled={saving} style={{width:'100%',padding:'0.75rem',background:'var(--primary)',border:'none',borderRadius:'0.5rem',color:'white',fontFamily:'inherit',fontWeight:600,cursor:'pointer'}}>{saving?'Saving…':'Save'}</button>
        </Modal>
      )}
    </div>
  );
}
