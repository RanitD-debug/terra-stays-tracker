"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Check, Compass } from 'lucide-react';

function GuestBookingContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || 'DIRECT';

  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    guestCount: '2',
    nights: '2'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Determine commission tier based on length of stay
  const calculateCommissionRate = (nightsCount: number) => {
    if (nightsCount >= 3) return 15;
    if (nightsCount === 2) return 12;
    return 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double-clicking / rapid button presses
    if (isSubmitting) return;

    if (!formData.guestName || !formData.phone) {
      alert("Please provide your name and phone number.");
      return;
    }

    setIsSubmitting(true);

    const nightsNum = parseInt(formData.nights) || 1;
    const commissionRate = calculateCommissionRate(nightsNum);

    try {
      // 1. Save lead into Supabase
      const { error } = await supabase.from('leads').insert([
        {
          ref_code: refCode,
          guest_name: formData.guestName,
          phone: formData.phone,
          guest_count: parseInt(formData.guestCount) || 1,
          nights: nightsNum,
          commission_rate: commissionRate,
          status: 'pending'
        }
      ]);

      if (error) {
        console.error("Supabase Error:", error);
        alert("Failed to submit request. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);

      // 2. Prepare WhatsApp message for instant host notification
      const terraWhatsappNumber = "919876543210"; // Replace with your actual Terra Stays WhatsApp Number
      const message = encodeURIComponent(
        `Hello Terra Stays! 🌿\n\nI scanned the QR code at boutique partner (${refCode}) and would like to reserve a stay:\n\n` +
        `• *Guest Name:* ${formData.guestName}\n` +
        `• *Phone:* ${formData.phone}\n` +
        `• *Guests:* ${formData.guestCount}\n` +
        `• *Duration:* ${formData.nights} night(s)\n\n` +
        `Please share availability and room tariffs.`
      );

      // Small delay so guest sees submission feedback before redirect
      setTimeout(() => {
        window.location.href = `https://wa.me/${terraWhatsappNumber}?text=${message}`;
      }, 1200);

    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#F7F6F2' }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '420px', width: '100%', background: '#ffffff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #EAE8E1' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#1B2B22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Compass size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: '#1B2B22', letterSpacing: '-0.02em' }}>Terra Stays</h1>
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>Boutique Partner Experience Protocol</p>
        </div>

        {submitted ? (
          /* SUCCESS STATE */
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: '#E7F0EB', color: '#1B2B22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Check size={28} />
            </div>
            <h2 style={{ fontSize: '1.2rem', color: '#1B2B22', fontWeight: 400 }}>Request Received</h2>
            <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
              Redirecting you to WhatsApp to connect directly with the Terra Stays team...
            </p>
          </motion.div>
        ) : (
          /* BOOKING FORM */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#1B2B22', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Ananya Sharma" 
                value={formData.guestName}
                onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#1B2B22', marginBottom: '6px', textTransform: 'uppercase' }}>WhatsApp Number</label>
              <input 
                type="tel" 
                required
                placeholder="+91 98765 43210" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#1B2B22', marginBottom: '6px', textTransform: 'uppercase' }}>Guests</label>
                <select 
                  value={formData.guestCount}
                  onChange={e => setFormData({ ...formData, guestCount: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#1B2B22', marginBottom: '6px', textTransform: 'uppercase' }}>Nights</label>
                <select 
                  value={formData.nights}
                  onChange={e => setFormData({ ...formData, nights: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #DDD', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="1">1 Night</option>
                  <option value="2">2 Nights</option>
                  <option value="3">3 Nights</option>
                  <option value="4">4+ Nights</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ marginTop: '1rem', width: '100%', padding: '14px', backgroundColor: isSubmitting ? '#A0AAB0' : '#1B2B22', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em', cursor: isSubmitting ? 'not-allowed' : 'pointer', textTransform: 'uppercase', transition: 'background 0.2s' }}
            >
              {isSubmitting ? "Connecting..." : "Confirm & Open WhatsApp"}
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#aaa' }}>
              Partner Code: <span style={{ fontWeight: 600, color: '#1B2B22' }}>{refCode}</span>
            </p>
          </form>
        )}

      </motion.div>
    </div>
  );
}

export default function GuestBookingPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <GuestBookingContent />
    </Suspense>
  );
}