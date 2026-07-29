"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { Users, IndianRupee, LogOut, Printer, RefreshCw, CheckCircle2, Clock, Download } from 'lucide-react';
import { supabase } from '../supabaseClient'; // ADDED SUPABASE IMPORT

export default function PartnerDashboard() {
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('terra_partner');
    if (!saved) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(saved);
    setPartner(parsed);
    fetchSupabaseLeads(parsed.ref_code);
  }, []);

  // FIXED: Now fetching directly from Supabase 'guest_scans' table!
  const fetchSupabaseLeads = async (refCode: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guest_scans')
        .select('*')
        .eq('ref_code', refCode)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching partner leads:", error);
      } else if (data) {
        setLeads(data);
      }
    } catch (e) {
      console.error("Database connection exception:", e);
    }
    setLoading(false);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('dash-qr-canvas') as HTMLCanvasElement;
    if (canvas && partner) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${partner.business_name.replace(/\s+/g, '_')}_TerraStays_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('terra_partner');
    router.push('/login');
  };

  if (!partner) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const guestUrl = `${origin}/guest?ref=${partner.ref_code}`;

  const totalEnquiries = leads.length;
  const confirmedLeads = leads.filter(l => l.status === 'Confirmed');
  
  // FIXED: Changed 'commission_amount' to 'commission' to match database
  const totalEarningsINR = confirmedLeads.reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', color: '#1B2B22', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2B6A4B' }}>
              Partner Console
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 300, margin: '2px 0 0 0' }}>{partner.business_name}</h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={() => fetchSupabaseLeads(partner.ref_code)} 
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#fff', border: '1px solid #E2E2DE', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
              {loading ? "Syncing..." : "Refresh Live Leads"}
            </button>
            <button 
              onClick={() => setShowLogoutModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>

        {/* SPLIT LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* LEFT: QR CODE & PROFILE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E2DE', padding: '2rem', textAlign: 'center' }}>
              <span style={{ background: '#F0EFEA', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>
                REF: {partner.ref_code}
              </span>

              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #EDEDE9', display: 'inline-block', margin: '1.25rem 0' }}>
                <QRCodeCanvas id="dash-qr-canvas" value={guestUrl} size={180} level={"H"} includeMargin={true} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={downloadQR}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#2B6A4B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <Download size={16} /> Download QR Code Image
                </button>
                <button 
                  onClick={() => window.print()}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#F0EFEA', color: '#1B2B22', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  <Printer size={16} /> Print Standee
                </button>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E2DE', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Account Info</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #FAFAFA', paddingBottom: '6px' }}>
                  <span style={{ color: '#888' }}>Owner Name:</span>
                  <strong style={{ color: '#1B2B22' }}>{partner.owner_name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #FAFAFA', paddingBottom: '6px' }}>
                  <span style={{ color: '#888' }}>WhatsApp:</span>
                  <strong style={{ color: '#1B2B22' }}>{partner.whatsapp}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Payout UPI ID:</span>
                  <strong style={{ color: '#2B6A4B', fontFamily: 'monospace' }}>{partner.upi_id || 'Not Provided'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: STATS & TABLE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E2DE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Enquiries</span>
                  <Users size={16} />
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 400, margin: 0 }}>{totalEnquiries}</p>
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E2DE' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Confirmed Payout</span>
                  <IndianRupee size={16} color="#2B6A4B" />
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 600, color: '#2B6A4B', margin: 0 }}>₹{totalEarningsINR.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E2DE', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem 0' }}>Referred Guests & Booking Status</h3>

              {leads.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No guest scans recorded yet for this code.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E2DE', color: '#888' }}>
                        <th style={{ padding: '10px' }}>GUEST NAME</th>
                        <th style={{ padding: '10px' }}>PHONE</th>
                        <th style={{ padding: '10px' }}>STATUS</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>EARNED COMMISSION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, idx) => {
                        const isConfirmed = lead.status === 'Confirmed';
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #F0F0EC' }}>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{lead.guest_name || 'Guest'}</td>
                            <td style={{ padding: '10px', color: '#666' }}>
                              {isConfirmed ? lead.guest_phone : `${lead.guest_phone?.substring(0, 3) || '***'}*****${lead.guest_phone?.slice(-2) || '**'}`}
                            </td>
                            <td style={{ padding: '10px' }}>
                              {isConfirmed ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EAF4EE', color: '#2B6A4B', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  <CheckCircle2 size={12} /> Confirmed
                                </span>
                              ) : lead.status === 'Paused' ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FDF2F2', color: '#991B1B', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  Paused
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FFFBEB', color: '#B45309', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  <Clock size={12} /> Enquired
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: isConfirmed ? '#2B6A4B' : '#888' }}>
                              {isConfirmed ? `₹${Number(lead.commission || 0).toLocaleString('en-IN')}` : 'Pending Admin Check'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* LOGOUT MODAL */}
        <AnimatePresence>
          {showLogoutModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '100%', textAlign: 'center', position: 'relative' }}>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0' }}>Confirm Logout</h3>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>Are you sure you want to log out of your partner dashboard?</p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '10px', background: '#F0EFEA', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                  <button onClick={handleLogout} style={{ flex: 1, padding: '10px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Yes, Logout</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}