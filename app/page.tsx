"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowRight, Mountain, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

export default function PartnerRegistry() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    businessName: '', 
    ownerName: '', 
    whatsapp: '', 
    email: '' 
  });
  const [refCode, setRefCode] = useState('');

  const handleRegister = async () => {
    if (!formData.businessName || !formData.ownerName || !formData.whatsapp) {
      alert("Please fill in the required fields.");
      return;
    }

    setLoading(true);
    
    // Generate Code: First 4 letters + random 3-digit number
    const code = formData.businessName.substring(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900);
    
    // Insert into Supabase
    const { error } = await supabase.from('affiliates').insert([
      { 
        ref_code: code, 
        business_name: formData.businessName, 
        owner_name: formData.ownerName, 
        whatsapp: formData.whatsapp, 
        email: formData.email 
      }
    ]);

    if (!error) { 
      setRefCode(code); 
      setStep(2); 
    } else { 
      console.error(error);
      alert("Registry error: " + error.message); 
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <AnimatePresence mode="wait">
        
        {/* STEP 0: THE OFFICIAL TERMS & CONDITIONS (BROCHURE UPDATE) */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ maxWidth: '600px', width: '100%' }}>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#1B2B22', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color="white" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.02em', color: '#1B2B22' }}>Partner Protocol</h1>
              </div>
              <p style={{ color: '#888', fontWeight: 300, fontStyle: 'italic' }}>Official B2B Partnership Agreement — Terra Stays</p>
            </div>
            
            <div style={{ height: '380px', overflowY: 'auto', paddingRight: '1rem', borderLeft: '1px solid #E2E2DE', paddingLeft: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '0.85rem', color: '#555', lineHeight: '1.7' }}>
                
                <section>
                  <p style={{ fontWeight: 700, color: '#1B2B22', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '8px' }}>01 / BOOKING & PAYMENT</p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>• Commission calculated on final confirmed room tariff.</li>
                    <li>• Payments processed within 5-7 working days after guest checkout.</li>
                    <li>• Minimum 2-night stay required for commission eligibility.</li>
                  </ul>
                </section>

                <section>
                  <p style={{ fontWeight: 700, color: '#1B2B22', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '8px' }}>02 / TARIFF & INCLUSIONS</p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>• Tariffs include Breakfast, Lunch, Dinner, and Evening Tea.</li>
                    <li>• Meals served as per Terra Mist standard menu and timings.</li>
                    <li>• No commission applies to restaurant or food-only orders.</li>
                  </ul>
                </section>

                <section>
                  <p style={{ fontWeight: 700, color: '#1B2B22', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '8px' }}>03 / EXPERIENCES POLICY</p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>• Partners may inform guests about curated experiences (Astrophotography, Hikes).</li>
                    <li>• Partners <span style={{ color: '#B35B3E' }}>may not</span> quote prices or collect payments for experiences.</li>
                    <li>• No commission applies to experience bookings.</li>
                  </ul>
                </section>

                <section>
                  <p style={{ fontWeight: 700, color: '#1B2B22', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '8px' }}>04 / GENERAL TERMS</p>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>• Collaboration valid for one (1) year from date of agreement.</li>
                    <li>• Either party may terminate with 15 days prior written notice.</li>
                    <li>• Guests referred must follow all Terra Stays property rules.</li>
                  </ul>
                </section>

                <section style={{ backgroundColor: '#F2EFE9', padding: '15px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <p style={{ fontWeight: 700, color: '#1B2B22', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '8px' }}>PARTNER RECOGNITION</p>
                  <p style={{ fontSize: '0.8rem', color: '#1B2B22' }}>High-performing partners receive priority listing on the official Terra Stays website and complimentary stay invitations.</p>
                </section>

              </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
              <button 
                onClick={() => setStep(1)} 
                className="btn-minimal" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#1B2B22', color: 'white' }}
              >
                Accept & Proceed <ArrowRight size={16} />
              </button>
              <p style={{ textAlign: 'center', fontSize: '9px', color: '#aaa', marginTop: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                By clicking, you agree to the Terra Stays B2B Partnership terms.
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '400px', width: '100%' }}>
            <h2 style={{ fontSize: '0.75rem', color: '#aaa', letterSpacing: '0.2em', marginBottom: '3.5rem' }}>01 / REGISTRATION</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div className="group">
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#aaa', marginBottom: '4px' }}>Business Name</p>
                <input className="input-minimal" placeholder="e.g. Pine Retreat" onChange={e => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <div className="group">
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#aaa', marginBottom: '4px' }}>Owner Name</p>
                <input className="input-minimal" placeholder="Full Name" onChange={e => setFormData({...formData, ownerName: e.target.value})} />
              </div>
              <div className="group">
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#aaa', marginBottom: '4px' }}>WhatsApp</p>
                <input className="input-minimal" placeholder="+91..." onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
              <div className="group">
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#aaa', marginBottom: '4px' }}>Email</p>
                <input className="input-minimal" placeholder="contact@email.com" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <button onClick={handleRegister} className="btn-minimal" disabled={loading} style={{ background: '#1B2B22' }}>
                {loading ? "Registering..." : "Generate Entry Asset"}
              </button>
              <button onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '10px', letterSpacing: '0.1em', cursor: 'pointer' }}>REVIEW TERMS</button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: THE SUCCESS & QR */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ background: '#121212', padding: '50px', borderRadius: '100%', display: 'inline-block', boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}>
                <QRCodeCanvas 
                  value={`https://${typeof window !== 'undefined' ? window.location.host : ''}/guest?ref=${refCode}`} 
                  size={140} 
                  fgColor="#121212" 
                  bgColor="#ffffff" 
                />
              </div>
              <div style={{ position: 'absolute', bottom: '-10px', right: '10px', background: '#1B2B22', color: '#fff', padding: '10px', borderRadius: '50%' }}>
                <CheckCircle size={24} />
              </div>
            </div>
            <h3 style={{ marginTop: '3rem', fontWeight: 300, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#1B2B22' }}>Registry Complete</h3>
            <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', letterSpacing: '0.2em' }}>ID: {refCode}</p>
            <button onClick={() => window.print()} style={{ marginTop: '2rem', background: 'none', border: 'none', color: '#B35B3E', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 700 }}>
              DOWNLOAD PRINT ASSET
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}