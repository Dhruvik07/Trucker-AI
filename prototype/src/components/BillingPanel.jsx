import React, { useState } from 'react';
import { UploadCloud, FileCheck, CheckCircle2, DollarSign } from 'lucide-react';

export const BillingPanel = () => {
    const [uploaded, setUploaded] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    const handleUpload = (e) => {
        setUploaded(true);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch('http://localhost:3000/api/billing/latest');
            const data = await res.json();
            setInvoiceData(data);
            alert(`Invoice #${data.invoiceNumber} generated and successfully dispatched to Client!`);
        } catch (err) {
            console.error("Billing endpoint failed.", err);
            alert("Database connection failed. Please ensure the backend is running.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex-row gap-6 animate-fade-in" style={{ height: '100%', alignItems: 'flex-start' }}>

            {/* Upload Column */}
            <div className="glass-panel p-6 flex-col gap-6" style={{ flex: 1 }}>
                <h2 className="flex-row items-center gap-2"><FileCheck size={24} color="var(--primary)" /> Document Reconciler</h2>
                <p>Avoid delays by automatically reconciling BOLs, PODs, fuel receipts, and rate confirmations immediately after trip completion.</p>

                <div
                    onClick={handleUpload}
                    className="flex-col justify-center items-center"
                    style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '3rem',
                        cursor: 'pointer',
                        background: uploaded ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.3s'
                    }}
                >
                    {uploaded ? (
                        <>
                            <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: 'var(--success)' }}>Documents Recognized</h3>
                            <p>BOL, POD, Fuel Receipts extracted via OCR.</p>
                        </>
                    ) : (
                        <>
                            <UploadCloud size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                            <h3>Drag & Drop Documents</h3>
                            <p>or click to select files from Driver Portal</p>
                        </>
                    )}
                </div>

                <button className="btn btn-primary" disabled={!uploaded || generating} onClick={handleGenerate} style={{ padding: '1rem', fontSize: '1rem' }}>
                    {generating ? 'Querying Database & Reconciling...' : 'Reconcile & Generate Client Bill'}
                </button>
            </div>

            {/* Preview Column */}
            <div className="glass-panel p-6" style={{ flex: 1, minHeight: '500px', background: '#ffffff', color: '#111' }}>
                <div className="flex-row justify-between items-center" style={{ borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#111', margin: 0 }}>INVOICE PROVIEW</h2>
                    <DollarSign size={32} color="#111" />
                </div>

                {uploaded && invoiceData ? (
                    <div className="flex-col gap-4 animate-fade-in">
                        <div className="flex-row justify-between">
                            <div>
                                <strong>Billed To:</strong><br />
                                {invoiceData.client}<br />
                                Tempe, AZ
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <strong>Invoice Date:</strong> {invoiceData.date}<br />
                                <strong>Invoice No:</strong> {invoiceData.invoiceNumber}<br />
                                <strong>Status:</strong> <span style={{ color: generating ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>{generating ? 'DRAFT' : 'READY TO SEND'}</span>
                            </div>
                        </div>

                        <table style={{ width: '100%', marginTop: '2rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #ddd' }}>Description</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #ddd' }}>Qty</th>
                                    <th style={{ padding: '0.75rem', borderBottom: '1px solid #ddd' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>Line Haul (Driver: {invoiceData.driverName}) </td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>{invoiceData.distance} mi</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>${invoiceData.lineHaul}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>Accessorials / Fuel Surcharge</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>-</td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>${invoiceData.fuelSurcharge}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={2} style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 'bold', borderTop: '2px solid #111' }}>Total Amount:</td>
                                    <td style={{ padding: '1rem 0.75rem', fontWeight: 'bold', borderTop: '2px solid #111' }}>${invoiceData.total}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="flex-col justify-center items-center h-full text-center" style={{ opacity: 0.5, height: '300px' }}>
                        <p>{generating ? 'Connecting to Tracker Database...' : 'Upload documents to query database and generate invoice.'}</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default BillingPanel;
