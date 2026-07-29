"use client";
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, Sparkles, User, Phone, Users, Moon } from 'lucide-react';

function GuestFormContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || 'DIRECT';

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCount, setGuestCount] = useState('2');
  const [nights, setNights] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Terra Stays Admin WhatsApp (India Code 91)
  const ADMIN_WHATSAPP = "918777659549";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    setSubmitting(true);

    try {
      // 1. Record lead into Supabase
      await supabase.from('leads').insert([
        {
          guest_name: guestName,
          phone: guestPhone,
          guest_count: parseInt(guestCount) || 1,
          nights: parseInt(nights) || 1,
          ref_code: refCode,
          status: 'Enquired',
          total_amount: 0,
          commission_amount: 0
        }
      ]);
    } catch (error) {
      console.error("Error saving lead:", error);
    }

    setSubmitting(false);
    setSubmitted(true);

    // 2. Format WhatsApp URL
    const message = `Hello Terra Stays! 🌿\n\nI scanned the QR code at partner (${refCode}) and would like to reserve a stay:\n\n• Guest Name: ${guestName}\n• Phone: ${guestPhone}\n• Guests: ${guestCount}\n• Stay Duration: ${nights} night(s)`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;

    // 3. Trigger immediate app launch on mobile
    window.location.href = whatsappUrl;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', maxWidth: '440px', width: '100%', boxShadow: '0 12px 30px rgba(0,0,0,0.05)', border: '1px solid #E2E2DE' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EAF4EE', color: '#2B6A4B', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
            <Sparkles size={14} /> Partner Guest Check-in
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 300, color: '#1B2B22', margin: '0 0 6px 0' }}>Welcome to Terra Stays</h1>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
            Referred by partner: <strong style={{ color: '#1B2B22', fontFamily: 'monospace' }}>{refCode}</strong>
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={48} color="#2B6A4B" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#1B2B22', marginBottom: '8px' }}>Redirecting to WhatsApp...</h3>
            <p style={{ color: '#666', fontSize: '0.85rem' }}>If WhatsApp didn't open automatically, tap below:</p>
            <button 
              onClick={() => {
                const message = `Hello Terra Stays! 🌿\n\nI scanned the QR code at partner (${refCode}) and would like to reserve a stay:\n\n• Guest Name: ${guestName}\n• Phone: ${guestPhone}\n• Guests: ${guestCount}\n• Stay Duration: ${nights} night(s)`;
                window.location.href = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
              }}
              style={{ marginTop: '1rem', width: '100%', padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Send size={16} /> Open WhatsApp Manually
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1B2B22', marginBottom: '6px' }}>
                <User size={14} /> Your Full Name
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Ananya Sharma"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: '#FAFAFA' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1B2B22', marginBottom: '6px' }}>
                <Phone size={14} /> WhatsApp Phone Number
              </label>
              <input 
                type="tel" 
                required 
                placeholder="e.g. 9876543210"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: '#FAFAFA' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1B2B22', marginBottom: '6px' }}>
                  <Users size={14} /> Guest Count
                </label>
                <input 
                  type="number" 
                  min="1"
                  required 
                  value={guestCount}
                  onChange={e => setGuestCount(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: '#FAFAFA' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1B2B22', marginBottom: '6px' }}>
                  <Moon size={14} /> Nights
                </label>
                <input 
                  type="number" 
                  min="1"
                  required 
                  value={nights}
                  onChange={e => setNights(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: '#FAFAFA' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', padding: '14px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {submitting ? "Saving Check-in..." : "Confirm & Open WhatsApp"} <Send size={16} />
            </button>

          </form>
        )}

      </motion.div>
    </div>
  );
}

export default function GuestPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Loading check-in page...</div>}>
      <GuestFormContent />
    </Suspense>
  );
}