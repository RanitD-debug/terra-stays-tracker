"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { RefreshCw, CheckCircle2, X, PauseCircle, Download, Printer } from 'lucide-react';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'partners'>('leads');
  const [selectedPartnerQR, setSelectedPartnerQR] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [confirmingLead, setConfirmingLead] = useState<any | null>(null);
  const [inputPayment, setInputPayment] = useState('');
  const [inputCommission, setInputCommission] = useState('');

  const fetchAllData = async () => {
    // 1. Read Local Backup Data
    let localLeads: any[] = [];
    let localAffiliates: any[] = [];
    try {
      localLeads = JSON.parse(localStorage.getItem('ts_leads') || '[]');
      localAffiliates = JSON.parse(localStorage.getItem('ts_affiliates') || '[]');
    } catch (e) {
      console.error(e);
    }

    // 2. Fetch from Supabase
    let supaLeads: any[] = [];
    let supaAffiliates: any[] = [];

    try {
      const { data: lData } = await supabase.from('leads').select('*');
      const { data: aData } = await supabase.from('affiliates').select('*');
      if (lData) supaLeads = lData;
      if (aData) supaAffiliates = aData;
    } catch (err) {
      console.error("Supabase fetch notice:", err);
    }

    // 3. Merge both sources (Supabase + LocalStorage) without duplicates
    const combinedLeadsMap = new Map();
    [...localLeads, ...supaLeads].forEach(item => {
      const idKey = item.id || `${item.guest_name}_${item.phone}_${item.ref_code}`;
      combinedLeadsMap.set(idKey, item);
    });

    const combinedAffiliatesMap = new Map();
    [...localAffiliates, ...supaAffiliates].forEach(item => {
      const codeKey = item.ref_code || item.business_name;
      combinedAffiliatesMap.set(codeKey, item);
    });

    const mergedLeads = Array.from(combinedLeadsMap.values()).reverse();
    const mergedAffiliates = Array.from(combinedAffiliatesMap.values()).reverse();

    setLeads(mergedLeads);
    setAffiliates(mergedAffiliates);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleConfirmBooking = async () => {
    if (!confirmingLead) return;

    const totalAmt = parseFloat(inputPayment) || 0;
    const commAmt = parseFloat(inputCommission) || 0;

    // Update in memory & localStorage
    const updatedLeads = leads.map(lead => {
      if (lead.id === confirmingLead.id || (lead.guest_name === confirmingLead.guest_name && lead.phone === confirmingLead.phone)) {
        return {
          ...lead,
          status: 'Confirmed',
          total_amount: totalAmt,
          commission_amount: commAmt
        };
      }
      return lead;
    });

    setLeads(updatedLeads);
    localStorage.setItem('ts_leads', JSON.stringify(updatedLeads));

    // Update in Supabase
    try {
      if (confirmingLead.id) {
        await supabase
          .from('leads')
          .update({ status: 'Confirmed', total_amount: totalAmt, commission_amount: commAmt })
          .eq('id', confirmingLead.id);
      }
    } catch (e) {}

    setConfirmingLead(null);
    setInputPayment('');
    setInputCommission('');
  };

  const handlePauseBooking = async (leadId: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status: 'Paused' };
      }
      return lead;
    });

    setLeads(updatedLeads);
    localStorage.setItem('ts_leads', JSON.stringify(updatedLeads));

    try {
      await supabase.from('leads').update({ status: 'Paused' }).eq('id', leadId);
    } catch (e) {}
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
    return match ? match.business_name : 'Direct / Partner';
  };

  const totalLeads = leads.length;
  const totalPartners = affiliates.length;
  const totalCommissionDisbursed = leads.reduce((acc, curr) => acc + (Number(curr.commission_amount) || 0), 0);

  const filteredLeads = leads.filter(lead => 
    lead.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm) ||
    lead.ref_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartners = affiliates.filter(partner => 
    partner.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.ref_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 300, color: '#1B2B22', margin: 0 }}>Terra Stays Admin Console</h1>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Manual payment approval & partner manager</p>
          </div>
          <button 
            onClick={fetchAllData} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh Records
          </button>
        </div>

        {/* METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Total Inbound Scans</span>
            <p style={{ fontSize: '2rem', fontWeight: 400, color: '#1B2B22', margin: '8px 0 0 0' }}>{totalLeads}</p>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Active Partners</span>
            <p style={{ fontSize: '2rem', fontWeight: 400, color: '#1B2B22', margin: '8px 0 0 0' }}>{totalPartners}</p>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Total Commission Approved</span>
            <p style={{ fontSize: '2rem', fontWeight: 600, color: '#2B6A4B', margin: '8px 0 0 0' }}>₹{totalCommissionDisbursed.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* TABS & SEARCH */}
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

        {/* TAB 1: GUEST LEADS */}
        {activeTab === 'leads' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E2DE', padding: '1.5rem' }}>
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
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>No guest scan records found.</td>
                    </tr>
                  ) : filteredLeads.map((lead, idx) => {
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

        {/* TAB 2: PARTNERS */}
        {activeTab === 'partners' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E2DE', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#1B2B22', marginBottom: '1.5rem' }}>Partner Directory</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E2DE', color: '#888' }}>
                    <th style={{ padding: '12px' }}>NAME / USERNAME</th>
                    <th style={{ padding: '12px' }}>OWNER</th>
                    <th style={{ padding: '12px' }}>REF CODE</th>
                    <th style={{ padding: '12px' }}>UPI ID</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>No registered partners found.</td>
                    </tr>
                  ) : filteredPartners.map((partner, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F0F0EC' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{partner.business_name}</td>
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

        {/* MODAL TO CONFIRM BOOKING */}
        <AnimatePresence>
          {confirmingLead && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '100%', position: 'relative' }}>
                <button onClick={() => setConfirmingLead(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>

                <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0' }}>Confirm Booking & Set Payout</h3>
                <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 1.25rem 0' }}>Guest: <strong>{confirmingLead.guest_name}</strong> | Partner Ref: <strong>{confirmingLead.ref_code}</strong></p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Total Booking Amount Taken (₹)</label>
                    <input type="number" placeholder="e.g. 5000" value={inputPayment} onChange={e => setInputPayment(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Commission Earned for Partner (₹)</label>
                    <input type="number" placeholder="e.g. 600" value={inputCommission} onChange={e => setInputCommission(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                </div>

                <button onClick={handleConfirmBooking} style={{ width: '100%', padding: '12px', background: '#2B6A4B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Save & Confirm Booking
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* QR MODAL */}
        <AnimatePresence>
          {selectedPartnerQR && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1 }} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '100%', textAlign: 'center', position: 'relative' }}>
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