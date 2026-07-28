"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  BarChart, Users, Building, RefreshCw, CheckCircle2, 
  QrCode, Printer, X, ExternalLink, Calendar, Search, MessageSquare, Phone, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'partners'>('leads');
  const [selectedPartnerQR, setSelectedPartnerQR] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Fetch all leads without relying on created_at sorting
      const { data: leadsData, error: leadsErr } = await supabase
        .from('leads')
        .select('*');

      if (leadsErr) {
        console.error("Leads Fetch Error:", leadsErr);
        setErrorMessage(`Leads Table Error: ${leadsErr.message}`);
      } else if (leadsData) {
        setLeads(leadsData.reverse()); // Show newest entries first
      }

      // Fetch all affiliates without relying on created_at sorting
      const { data: affiliatesData, error: affErr } = await supabase
        .from('affiliates')
        .select('*');

      if (affErr) {
        console.error("Affiliates Fetch Error:", affErr);
        setErrorMessage(prev => prev ? `${prev} | Affiliates Error: ${affErr.message}` : `Affiliates Table Error: ${affErr.message}`);
      } else if (affiliatesData) {
        setAffiliates(affiliatesData.reverse()); // Show newest entries first
      }
    } catch (err: any) {
      console.error("Unexpected fetch error:", err);
      setErrorMessage(err.message || "Failed to connect to database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBusinessName = (refCode: string) => {
    const match = affiliates.find(a => a.ref_code === refCode);
    return match ? match.business_name : 'Direct / Unknown';
  };

  const totalLeads = leads.length;
  const totalPartners = affiliates.length;
  const totalNightsBooked = leads.reduce((acc, curr) => acc + (Number(curr.nights) || 0), 0);

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
    partner.whatsapp?.includes(searchTerm)
  );

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 300, color: '#1B2B22', margin: 0 }}>Terra Stays Control Center</h1>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Comprehensive partner tracking, scan logs, and partner records</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Refreshing..." : "Refresh Live Data"}
          </button>
        </div>

        {/* ERROR BANNER IF ANY */}
        {errorMessage && (
          <div style={{ background: '#FDF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <div>
              <strong>Database Query Notice:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* METRICS SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Inbound Scans</span>
              <Users size={18} color="#1B2B22" />
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 400, color: '#1B2B22', margin: 0 }}>{totalLeads}</p>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Boutiques</span>
              <Building size={18} color="#1B2B22" />
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 400, color: '#1B2B22', margin: 0 }}>{totalPartners}</p>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Room Nights</span>
              <BarChart size={18} color="#1B2B22" />
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 400, color: '#1B2B22', margin: 0 }}>{totalNightsBooked}</p>
          </div>

        </div>

        {/* SEARCH & FILTER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E2DE' }}>
            <button 
              onClick={() => setActiveTab('leads')}
              style={{ padding: '12px 18px', border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: activeTab === 'leads' ? 700 : 400, color: activeTab === 'leads' ? '#1B2B22' : '#888', borderBottom: activeTab === 'leads' ? '2px solid #1B2B22' : 'none', cursor: 'pointer' }}
            >
              Guest Scan Records ({leads.length})
            </button>
            <button 
              onClick={() => setActiveTab('partners')}
              style={{ padding: '12px 18px', border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: activeTab === 'partners' ? 700 : 400, color: activeTab === 'partners' ? '#1B2B22' : '#888', borderBottom: activeTab === 'partners' ? '2px solid #1B2B22' : 'none', cursor: 'pointer' }}
            >
              Registered Boutiques ({affiliates.length})
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} color="#aaa" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search by name, phone, or code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
            />
          </div>
        </div>

        {/* TAB 1: GUEST SCAN LEADS */}
        {activeTab === 'leads' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E2DE', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#1B2B22', marginBottom: '1.5rem' }}>Guest QR Scan Audit Log</h2>
            
            {filteredLeads.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No scan records match your search.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E2DE', color: '#888' }}>
                      <th style={{ padding: '12px' }}>GUEST NAME</th>
                      <th style={{ padding: '12px' }}>PHONE</th>
                      <th style={{ padding: '12px' }}>REFERRING BOUTIQUE</th>
                      <th style={{ padding: '12px' }}>REF CODE</th>
                      <th style={{ padding: '12px' }}>DURATION</th>
                      <th style={{ padding: '12px' }}>COMMISSION</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>DIRECT ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead, idx) => {
                      const businessName = getBusinessName(lead.ref_code);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #F0F0EC' }}>
                          <td style={{ padding: '12px', fontWeight: 600, color: '#1B2B22' }}>{lead.guest_name}</td>
                          <td style={{ padding: '12px', color: '#555' }}>{lead.phone}</td>
                          <td style={{ padding: '12px', color: '#1B2B22', fontWeight: 500 }}>{businessName}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: '#F0EFEA', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700, color: '#1B2B22' }}>
                              {lead.ref_code}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#555' }}>{lead.guest_count} guest(s) · {lead.nights} night(s)</td>
                          <td style={{ padding: '12px', color: '#2B6A4B', fontWeight: 700 }}>{lead.commission_rate}% Tier</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <a 
                              href={`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#EAF4EE', color: '#2B6A4B', borderRadius: '6px', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
                            >
                              <MessageSquare size={12} /> Chat Guest
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REGISTERED BOUTIQUES WITH QR CODES */}
        {activeTab === 'partners' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E2DE', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#1B2B22', marginBottom: '1.5rem' }}>Boutique Partner Registry & QR Assets</h2>
            
            {filteredPartners.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No boutique partners match your search.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E2DE', color: '#888' }}>
                      <th style={{ padding: '12px' }}>BUSINESS NAME</th>
                      <th style={{ padding: '12px' }}>OWNER</th>
                      <th style={{ padding: '12px' }}>REF CODE</th>
                      <th style={{ padding: '12px' }}>WHATSAPP</th>
                      <th style={{ padding: '12px' }}>DESIGNATED QR</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartners.map((partner, idx) => {
                      const guestUrl = `${origin}/guest?ref=${partner.ref_code}`;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #F0F0EC' }}>
                          <td style={{ padding: '12px', fontWeight: 600, color: '#1B2B22' }}>{partner.business_name}</td>
                          <td style={{ padding: '12px', color: '#555' }}>{partner.owner_name}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: '#F0EFEA', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight 700, color: '#1B2B22' }}>
                              {partner.ref_code}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#555' }}>{partner.whatsapp}</td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'inline-block', background: '#fff', padding: '4px', border: '1px solid #ddd', borderRadius: '6px' }}>
                              <QRCodeCanvas value={guestUrl} size={48} level={"M"} />
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button 
                                onClick={() => setSelectedPartnerQR({ ...partner, guestUrl })}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                <QrCode size={13} /> View QR
                              </button>
                              <a 
                                href={`https://wa.me/${partner.whatsapp?.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#EAF4EE', color: '#2B6A4B', borderRadius: '6px', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
                              >
                                <Phone size={12} /> Contact
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL OVERLAY TO PRINT / INSPECT QR CODE */}
        <AnimatePresence>
          {selectedPartnerQR && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#fff', borderRadius: '16px', padding: '2.5rem', maxWidth: '420px', width: '100%', textAlign: 'center', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                
                <button onClick={() => setSelectedPartnerQR(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  <X size={20} />
                </button>

                <h3 style={{ fontSize: '1.25rem', color: '#1B2B22', margin: '0 0 4px 0', fontWeight: 600 }}>{selectedPartnerQR.business_name}</h3>
                <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 1.5rem 0' }}>Owner: {selectedPartnerQR.owner_name} | Code: <strong style={{ color: '#1B2B22' }}>{selectedPartnerQR.ref_code}</strong></p>

                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', display: 'inline-block', marginBottom: '1.5rem' }}>
                  <QRCodeCanvas value={selectedPartnerQR.guestUrl} size={220} level={"H"} includeMargin={true} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={() => window.print()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <Printer size={16} /> Print Standee Asset
                  </button>
                  <a 
                    href={selectedPartnerQR.guestUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#888', fontSize: '0.75rem', textDecoration: 'none', marginTop: '4px' }}
                  >
                    Test Guest URL <ExternalLink size={12} />
                  </a>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}