import React, { useState, useRef } from 'react';
import { ShieldAlert, Upload, FileText, CheckCircle2, AlertCircle, Truck, Clock } from 'lucide-react';
import { addDocument, getNavproToken } from '../services/navproApi';
import { useAuth } from '../auth/AuthContext';

const DOC_TYPES = [
  { key: 'BILL_OF_LADING',   label: 'Bill of Lading (BOL)' },
  { key: 'PROOF_OF_DELIVERY', label: 'Proof of Delivery (POD)' },
  { key: 'FUEL_RECEIPT',     label: 'Fuel Receipt' },
  { key: 'RATE_CONFIRMATION', label: 'Rate Confirmation' },
  { key: 'TRIP_SHEET',       label: 'Trip Sheet' },
];

export default function DriverAppView() {
  const { user } = useAuth();
  const hasToken = !!getNavproToken();
  const [selectedType, setSelectedType] = useState('BILL_OF_LADING');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [sosLoading, setSosLoading] = useState(false);
  const fileRef = useRef();

  const handleSOS = async () => {
    setSosLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/trips/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SOS_STOLEN',
          severity: 'CRITICAL',
          driver: user?.id || user?.username || 'unknown',
          message: `🚨 SOS signal from ${user?.name} — Truck ${user?.truckId}. Immediate assistance required!`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('🚨 SOS alert sent! Dispatcher has been notified.');
      } else {
        alert('⚠️ SOS sent but backend returned an error.');
      }
    } catch (e) {
      alert('⚠️ Could not reach backend. Make sure the backend server is running.');
    } finally {
      setSosLoading(false);
    }
  };


  const handleUpload = async () => {
    if (!selectedFile) { setUploadMsg('❌ Please select a file.'); return; }
    setUploading(true); setUploadMsg('');

    if (hasToken) {
      const res = await addDocument(selectedFile, { document_type: selectedType, is_private: false });
      setUploading(false);
      if (res.ok) {
        setUploadMsg('✅ Document uploaded to NavPro successfully!');
        setSelectedFile(null);
      } else {
        setUploadMsg('❌ Upload failed: ' + (res.data?.msg || 'Unknown error'));
      }
    } else {
      // Simulate upload without token
      await new Promise(r => setTimeout(r, 1200));
      setUploading(false);
      setUploadMsg('✅ Document submitted (demo mode — add NavPro token for live upload).');
      setSelectedFile(null);
    }
  };

  const inputS = { width:'100%', padding:'0.6rem 0.9rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'0.5rem', color:'#f8fafc', fontSize:'0.88rem', outline:'none', fontFamily:'inherit', boxSizing:'border-box' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:640, margin:'0 auto' }}>
      {/* Driver info card */}
      <div className="glass-panel" style={{ padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, color:'white' }}>
          {user?.avatar}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:'1rem', color:'#f8fafc' }}>{user?.name}</div>
          <div style={{ fontSize:'0.8rem', color:'#64748b', display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
            <Truck size={13}/> Truck: <strong style={{color:'#94a3b8'}}>{user?.truckId || 'Unassigned'}</strong>
            <span style={{color:'#334155'}}>·</span>
            <Clock size={13}/> {new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
          </div>
        </div>
        <div style={{ padding:'0.3rem 0.7rem', borderRadius:'999px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#34d399', fontSize:'0.72rem', fontWeight:600 }}>
          ON DUTY
        </div>
      </div>

      {/* SOS Panel */}
      <div className="glass-panel" style={{ padding:'1.5rem', background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.2)', textAlign:'center' }}>
        <h2 style={{ margin:'0 0 0.5rem', display:'flex', justifyContent:'center', alignItems:'center', gap:8, color:'#f87171', fontSize:'1.1rem' }}>
          <ShieldAlert size={20}/> Emergency Actions
        </h2>
        <p style={{ margin:'0 0 1.25rem', fontSize:'0.85rem', color:'#94a3b8' }}>Press only in case of an emergency, accident, or vehicle theft.</p>
        <button
          onClick={handleSOS}
          disabled={sosLoading}
          style={{ width:'100%', padding:'1rem', background: sosLoading ? '#991b1b' : 'linear-gradient(135deg,#ef4444,#b91c1c)', border:'none', borderRadius:'0.75rem', color:'white', fontSize:'1.05rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 0 25px rgba(239,68,68,0.35)', letterSpacing:'0.02em' }}>
          {sosLoading ? '📡 Sending Alert…' : '🆘 SOS / Mark as Stolen'}
        </button>
      </div>

      {/* Document Upload */}
      <div className="glass-panel" style={{ padding:'1.5rem' }}>
        <h2 style={{ margin:'0 0 1.25rem', fontSize:'1.05rem', display:'flex', alignItems:'center', gap:8, color:'#f8fafc' }}>
          <FileText size={18}/> Post-Delivery Documents
        </h2>

        {!hasToken && (
          <div style={{ padding:'0.6rem 0.9rem', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'0.5rem', color:'#fbbf24', fontSize:'0.8rem', marginBottom:'1rem' }}>
            ⚠️ Demo mode — uploads won't reach NavPro. Add your token on the login screen.
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          <div>
            <label style={{ fontSize:'0.78rem', color:'#94a3b8', marginBottom:'0.3rem', display:'block' }}>Document Type</label>
            <select value={selectedType} onChange={e=>setSelectedType(e.target.value)} style={inputS}>
              {DOC_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize:'0.78rem', color:'#94a3b8', marginBottom:'0.3rem', display:'block' }}>Select File</label>
            <div
              style={{ border:'2px dashed rgba(255,255,255,0.12)', borderRadius:'0.65rem', padding:'1.5rem', textAlign:'center', cursor:'pointer', color:'#64748b', fontSize:'0.85rem', transition:'border-color 0.2s' }}
              onClick={() => fileRef.current?.click()}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(59,130,246,0.4)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'}>
              {selectedFile
                ? <><FileText size={20} style={{color:'#60a5fa',marginBottom:6}}/><br/><span style={{color:'#f8fafc',fontWeight:500}}>{selectedFile.name}</span><br/><span style={{fontSize:'0.75rem'}}>{(selectedFile.size/1024).toFixed(1)} KB</span></>
                : <><Upload size={20} style={{marginBottom:6}}/><br/>Click to select file<br/><span style={{fontSize:'0.75rem',color:'#475569'}}>PDF, PNG, JPG, DOCX supported</span></>}
            </div>
            <input ref={fileRef} type="file" style={{display:'none'}} accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={e=>{ setSelectedFile(e.target.files[0]); setUploadMsg(''); }}/>
          </div>

          {uploadMsg && (
            <div style={{ padding:'0.6rem 0.9rem', background:uploadMsg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${uploadMsg.startsWith('✅')?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`, borderRadius:'0.5rem', fontSize:'0.83rem', color:uploadMsg.startsWith('✅')?'#34d399':'#f87171', display:'flex', alignItems:'center', gap:8 }}>
              {uploadMsg.startsWith('✅') ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>} {uploadMsg}
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading} style={{ width:'100%', padding:'0.8rem', background:uploading?'#1d4ed8':'var(--primary)', border:'none', borderRadius:'0.65rem', color:'white', fontFamily:'inherit', fontWeight:600, fontSize:'0.92rem', cursor:'pointer', boxShadow:'0 0 15px rgba(59,130,246,0.25)' }}>
            {uploading ? '⏳ Uploading…' : <><Upload size={16} style={{marginRight:6}}/> Submit Document</>}
          </button>
        </div>
      </div>

      {/* Checklist */}
      <div className="glass-panel" style={{ padding:'1.25rem 1.5rem' }}>
        <h3 style={{ margin:'0 0 1rem', fontSize:'0.95rem', color:'#f8fafc' }}>Post-Delivery Checklist</h3>
        {DOC_TYPES.map(t => (
          <label key={t.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'0.5rem 0', cursor:'pointer', fontSize:'0.87rem', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <input type="checkbox" style={{width:15,height:15,accentColor:'#3b82f6'}}/> {t.label}
          </label>
        ))}
      </div>
    </div>
  );
}
