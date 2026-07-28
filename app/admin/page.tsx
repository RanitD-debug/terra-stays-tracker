"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { BarChart, Users, Building, DollarSign, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all leads and affiliates from Supabase
    const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    const { data: affiliatesData } = await supabase.from('affiliates').select('*');

    if (leadsData) setLeads(leadsData);
    if (affiliatesData) setAffiliates(affiliatesData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate high-level stats
  const totalLeads = leads.length;
  const totalPartners = affiliates.length;
  const totalNightsBooked = leads.reduce((acc, curr) => acc + (Number(curr.nights) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 300, color: '#1B2B22', margin: 0 }}>Terra Stays Analytics</h1>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Real-time partner performance and lead tracking</p>
          </div>
          <button 
            onClick={fetchData} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Refreshing..." : "Refresh Live Data"}
          </button>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E2DE', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Inbound Leads</span>
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

        {/* RECENT LEADS DATA TABLE */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E2DE', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#1B2B22', marginBottom: '1.5rem' }}>Recent Scanned Leads</h2>
          
          {leads.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No guest scans recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E2DE', color: '#888' }}>
                    <th style={{ padding: '12px' }}>GUEST</th>
                    <th style={{ padding: '12px' }}>PHONE</th>
                    <th style={{ padding: '12px' }}>PARTNER REF</th>
                    <th style={{ padding: '12px' }}>GUESTS / NIGHTS</th>
                    <th style={{ padding: '12px' }}>COMMISSION TIER</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F0F0EC' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#1B2B22' }}>{lead.guest_name}</td>
                      <td style={{ padding: '12px', color: '#555' }}>{lead.phone}</td>
                      <td style={{ padding: '12px' }}><span style={{ background: '#F0EFEA', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>{lead.ref_code}</span></td>
                      <td style={{ padding: '12px', color: '#555' }}>{lead.guest_count} guests · {lead.nights} night(s)</td>
                      <td style={{ padding: '12px', color: '#1B2B22', fontWeight: 600 }}>{lead.commission_rate}%</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2B6A4B', background: '#EAF4EE', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <CheckCircle2 size={12} /> {lead.status || 'Received'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}