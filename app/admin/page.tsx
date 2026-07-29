"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { RefreshCw, CheckCircle2, X, PauseCircle, Download, Printer } from 'lucide-react';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'partners'>('leads');
  const [selectedPartnerQR, setSelectedPartnerQR] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation modal state for manual payment input
  const [confirmingLead, setConfirmingLead] = useState<any | null>(null);
  const [inputPayment, setInputPayment] = useState('');
  const [inputCommission, setInputCommission] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data: leadsData } = await supabase.from('leads').select('*');
    const { data: affiliatesData } = await supabase.from('affiliates').select('*');

    if (leadsData) setLeads([...leadsData].reverse());
    if (affiliatesData) setAffiliates([...affiliatesData].reverse());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmBooking = async () => {
    if (!confirmingLead) return;

    const totalAmt = parseFloat(inputPayment) || 0;
    const commAmt = parseFloat(inputCommission) || 0;

    await supabase
      .from('leads')
      .update({
        status: 'Confirmed',
        total_amount: totalAmt,
        commission_amount: commAmt
      })
      .eq('id', confirmingLead.id);

    setConfirmingLead(null);
    setInputPayment('');
    setInputCommission('');
    fetchData();
  };

  const handlePauseBooking = async (leadId: string) => {
    await supabase.from('leads').update({ status: 'Paused' }).eq('id', leadId);
    fetchData();
  };

  const downloadPartnerQR = () => {
    const canvas = document.getElementById('admin-partner-qr-canvas') as HTMLCanvasElement;
    if (canvas && selectedPartnerQR) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${selectedPartnerQR.business_name.replace(/\s+/g, '_')}_TerraStays_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const getBusinessName = (refCode: string) => {
    const match = affiliates.find(a => a.ref_code === refCode);
    return match ? match.business_name : 'Direct / Unknown';
  };

  const totalLeads = leads.length;
  const totalPartners = affiliates.length;
  const totalCommissionDisbursed = leads.reduce((acc, curr) => acc + (Number(curr.commission_amount) || 0), 0);

  const filteredLeads = leads.filter(lead => 
    lead.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm) ||
    lead.ref_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getBusinessName(lead.ref_code).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartners = affiliates.filter(partner => 
    partner.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.ref_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.whatsapp?.includes(searchTerm) ||
    partner.upi_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 300, color: '#1B2B22', margin: 0 }}>Terra Stays Admin Console</h1>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Manual payment approval, commission generator, and partner manager</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Refreshing..." : "Refresh Live Data"}
          </button>
        </div>

        {/* METRICS SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Total Inbound Scans</span>
            <p style={{ fontSize: '2rem', fontWeight: 400, color: '#1B2B22', margin: '8px 0 0 0' }}>{totalLeads}</p>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Active Partners</span>
            <p style={{ fontSize: '2rem', fontWeight: 400, color: '#1B2B22', margin: '8px 0 0 0' }}>{totalPartners}</p>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Total Commission Approved</span>
            <p style={{ fontSize: '2rem', fontWeight: 600, color: '#2B6A4B', margin: '8px 0 0 0' }}>₹{totalCommissionDisbursed.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* SEARCH & TABS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E2DE' }}>
            <button onClick={() => setActiveTab('leads')} style={{ padding: '12px 18px', border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: activeTab === 'leads' ? 700 : 400, color: activeTab === 'leads' ? '#1B2B22' : '#888', borderBottom: activeTab === 'leads' ? '2px solid #1B2B22' : 'none', cursor: 'pointer' }}>
              Guest Scan Records ({leads.length})
            </button>
            <button onClick={() => setActiveTab('partners')} style={{ padding: '12px 18px', border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: activeTab === 'partners' ? 700 : 400, color: activeTab === 'partners' ? '#1B2B22' : '#888', borderBottom: activeTab === 'partners' ? '2px solid #1B2B22' : 'none', cursor: 'pointer' }}>
              Registered Partners ({affiliates.length})
            </button>
          </div>

          <input 
            type="text"
            placeholder="Search name, phone, code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '10px 14px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', background: '#fff', minWidth: '240px' }}
          />
        </div>

        {/* TAB 1: GUEST SCAN LEADS */}
        {activeTab === 'leads' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E2DE', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#1B2B22', marginBottom: '1.5rem' }}>Guest Booking Management</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E2DE', color: '#888' }}>
                    <th style={{ padding: '12px' }}>GUEST</th>
                    <th style={{ padding: '12px' }}>PHONE</th>
                    <th style={{ padding: '12px' }}>PARTNER SOURCE</th>
                    <th style={{ padding: '12px' }}>REF CODE</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}>PAYMENT TAKEN (₹)</th>
                    <th style={{ padding: '12px' }}>COMMISSION (₹)</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ADMIN ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, idx) => {
                    const isConfirmed = lead.status === 'Confirmed';
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F0F0EC' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{lead.guest_name}</td>
                        <td style={{ padding: '12px', color: '#555' }}>{lead.phone}</td>
                        <td style={{ padding: '12px', fontWeight: 500, color: '#1B2B22' }}>{getBusinessName(lead.ref_code)}</td>
                        <td style={{ padding: '12px' }}><span style={{ background: '#F0EFEA', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>{lead.ref_code}</span></td>
                        <td style={{ padding: '12px' }}>
                          {isConfirmed ? (
                            <span style={{ color: '#2B6A4B', background: '#EAF4EE', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Confirmed</span>
                          ) : lead.status === 'Paused' ? (
                            <span style={{ color: '#991B1B', background: '#FDF2F2', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Paused</span>
                          ) : (
                            <span style={{ color: '#B45309', background: '#FFFBEB', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Enquired</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>₹{Number(lead.total_amount || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#2B6A4B' }}>₹{Number(lead.commission_amount || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button 
                              onClick={() => { setConfirmingLead(lead); setInputPayment(lead.total_amount || ''); setInputCommission(lead.commission_amount || ''); }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#2B6A4B', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              <CheckCircle2 size={12} /> Confirm & Set Payout
                            </button>
                            <button 
                              onClick={() => handlePauseBooking(lead.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 8px', background: '#F0EFEA', color: '#555', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              <PauseCircle size={12} /> Pause
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTERED PARTNERS WITH UPI */}
        {activeTab === 'partners' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E2DE', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#1B2B22', marginBottom: '1.5rem' }}>Partner Network Directory</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E2DE', color: '#888' }}>
                    <th style={{ padding: '12px' }}>NAME / USERNAME</th>
                    <th style={{ padding: '12px' }}>TYPE</th>
                    <th style={{ padding: '12px' }}>OWNER</th>
                    <th style={{ padding: '12px' }}>REF CODE</th>
                    <th style={{ padding: '12px' }}>PAYOUT UPI ID</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map((partner, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F0F0EC' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{partner.business_name}</td>
                      <td style={{ padding: '12px' }}><span style={{ textTransform: 'capitalize', fontSize: '0.75rem', background: '#F0EFEA', padding: '2px 6px', borderRadius: '4px' }}>{partner.account_type || 'business'}</span></td>
                      <td style={{ padding: '12px', color: '#555' }}>{partner.owner_name}</td>
                      <td style={{ padding: '12px' }}><span style={{ background: '#F0EFEA', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>{partner.ref_code}</span></td>
                      <td style={{ padding: '12px', color: '#2B6A4B', fontFamily: 'monospace', fontWeight: 600 }}>{partner.upi_id || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => setSelectedPartnerQR({ ...partner, guestUrl: `${origin}/guest?ref=${partner.ref_code}` })} style={{ padding: '6px 12px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>View QR</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL TO MANUALLY ENTER PAYMENT TAKEN & COMMISSION EARNED */}
        <AnimatePresence>
          {confirmingLead && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '100%', position: 'relative' }}>
                <button onClick={() => setConfirmingLead(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>

                <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0' }}>Confirm Booking & Set Payout</h3>
                <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 1.25rem 0' }}>Guest: <strong>{confirmingLead.guest_name}</strong> | Partner Ref: <strong>{confirmingLead.ref_code}</strong></p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Total Booking Amount Taken from Guest (₹)</label>
                    <input type="number" placeholder="e.g. 5000" value={inputPayment} onChange={e => setInputPayment(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Commission Earned for Partner (₹)</label>
                    <input type="number" placeholder="e.g. 600" value={inputCommission} onChange={e => setInputCommission(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                </div>

                <button onClick={handleConfirmBooking} style={{ width: '100%', padding: '12px', background: '#2B6A4B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Save & Notify Partner Dashboard
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL TO VIEW / PRINT / DOWNLOAD QR CODE */}
        <AnimatePresence>
          {selectedPartnerQR && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '100%', textAlign: 'center', position: 'relative' }}>
                <button onClick={() => setSelectedPartnerQR(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
                
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0' }}>{selectedPartnerQR.business_name}</h3>
                <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>Ref: <strong>{selectedPartnerQR.ref_code}</strong></p>

                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #E2E2DE', display: 'inline-block', marginBottom: '1.25rem' }}>
                  <QRCodeCanvas id="admin-partner-qr-canvas" value={selectedPartnerQR.guestUrl} size={180} level={"H"} includeMargin={true} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={downloadPartnerQR} style={{ width: '100%', padding: '10px', background: '#2B6A4B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Download size={16} /> Download QR Image
                  </button>
                  <button onClick={() => window.print()} style={{ width: '100%', padding: '10px', background: '#F0EFEA', color: '#1B2B22', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Printer size={16} /> Print Standee
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}