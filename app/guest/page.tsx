"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

function GuestContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1); 
  const [data, setData] = useState({ name: '', phone: '', heads: '', days: '' });
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = searchParams.get('ref');
    if (r) { 
      // Force uppercase to match the codes generated in the Boutique Owner registry
      const upperRef = r.toUpperCase();
      setRef(upperRef); 
      localStorage.setItem('last_ref', upperRef); 
    }
  }, [searchParams]);

  /**
   * Commission Logic as per Brochure:
   * 1-4 guests: 15%
   * 5-8 guests: 12%
   * 9-12 guests: 10%
   */
  const calculateCommissionRate = (numGuests: number) => {
    if (numGuests >= 1 && numGuests <= 4) return 15;
    if (numGuests >= 5 && numGuests <= 8) return 12;
    if (numGuests >= 9) return 10;
    return 0;
  };

  const handleFinalSubmit = async () => {
    if (!data.heads || !data.days) {
      alert("Please enter the number of guests and days.");
      return;
    }

    setLoading(true);
    const finalRef = ref || localStorage.getItem('last_ref');
    const guestCount = Number(data.heads);
    const rate = calculateCommissionRate(guestCount);
    
    if (!finalRef) {
        alert("Error: No Referral Code detected. Please scan a valid QR code.");
        setLoading(false);
        return;
    }

    // 1. Save to Supabase (Ensure you added the 'commission_rate' column in Supabase)
    const { error } = await supabase.from('leads').insert([
      {
        guest_name: data.name, 
        guest_phone: data.phone,
        referred_by: finalRef, 
        heads: guestCount,
        days: Number(data.days),
        commission_rate: rate 
      }
    ]);

    if (error) {
      console.error("Supabase Error:", error);
      // Handling the Foreign Key Constraint error specifically
      if (error.code === "23503") {
        alert(`Boutique Not Found: The ID "${finalRef}" is not registered. Please register the boutique first.`);
      } else {
        alert("Error: " + error.message);
      }
      setLoading(false);
      return;
    }

    // 2. Trigger WhatsApp (Stealth trigger to your number)
    const msg = `*New Lead: Terra Mist*%0A*Guest:* ${data.name}%0A*Phone:* ${data.phone}%0A*Group Size:* ${guestCount}%0A*Stay:* ${data.days} Days%0A*Commission:* ${rate}%25%0A*Ref:* ${finalRef}`;
    window.open(`https://wa.me/919330093526?text=${msg}`, '_blank'); 

    // 3. Move to Success Screen
    setStep(3);
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F2EFE9', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* TERRA STAYS HEADER */}
      <nav style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.1em', color: '#1B2B22' }}>TERRA</span>
          <span style={{ fontSize: '8px', letterSpacing: '0.4em', color: '#1B2B22', opacity: 0.6 }}>STAYS</span>
        </div>
        <div style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.3 }}>
          "Where Silence Hugs"
        </div>
      </nav>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: GUEST INFO */}
        {step === 1 && (
          <motion.div key="g1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ maxWidth: '400px', width: '100%' }}>
            <h1 style={{ fontFamily: 'serif', fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1B2B22' }}>Guest Registry</h1>
            <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#888', marginBottom: '4rem' }}>Welcome to Terra Mist.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <input className="input-minimal" placeholder="Full Name" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
              <input className="input-minimal" placeholder="WhatsApp Number" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
              <button 
                onClick={() => { if(data.name && data.phone) setStep(2); else alert("Please enter details"); }} 
                className="btn-minimal" 
                style={{ backgroundColor: '#1B2B22' }}
              >
                Continue Registration
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: STAY DETAILS & COMMISSION CALCULATION */}
        {step === 2 && (
          <motion.div key="g2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ maxWidth: '400px', width: '100%' }}>
            <h1 style={{ fontFamily: 'serif', fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1B2B22' }}>Stay Details</h1>
            <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#888', marginBottom: '4rem' }}>Curating your experience.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <input type="number" className="input-minimal" placeholder="Number of Guests" value={data.heads} onChange={e => setData({...data, heads: e.target.value})} />
              <input type="number" className="input-minimal" placeholder="Stay Duration (Days)" value={data.days} onChange={e => setData({...data, days: e.target.value})} />
              <button 
                onClick={handleFinalSubmit} 
                className="btn-minimal" 
                disabled={loading}
                style={{ backgroundColor: '#B35B3E' }}
              >
                {loading ? "Processing..." : "Confirm Booking"}
              </button>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '10px', cursor: 'pointer' }}>BACK TO INFO</button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: FINAL LINKS SCREEN */}
        {step === 3 && (
          <motion.div key="g3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: '450px' }}>
             <h1 style={{ fontFamily: 'serif', fontSize: '3.5rem', color: '#1B2B22', marginBottom: '1.5rem' }}>Thank You</h1>
             <p style={{ color: '#888', fontStyle: 'italic', marginBottom: '4rem' }}>Request received. Stay connected with the community.</p>
             
             <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', paddingTop: '3rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                {/* INSTAGRAM LINK */}
                <a href="https://www.instagram.com/theterrastays?utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B35B3E" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.2em', color: '#aaa' }}>INSTAGRAM</span>
                </a>

                {/* WEBSITE LINK */}
                <a href="https://www.terrastays.in" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2B22" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.2em', color: '#aaa' }}>WEBSITE</span>
                </a>
             </div>
             <p style={{ marginTop: '5rem', fontSize: '9px', letterSpacing: '0.3em', color: '#ccc', fontWeight: 'bold' }}>TERRA STAYS PARTNER NETWORK</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function GuestPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2EFE9', color: '#aaa', fontStyle: 'italic' }}>Loading Terra Mist...</div>}>
      <GuestContent />
    </Suspense>
  );
}