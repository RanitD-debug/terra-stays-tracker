"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { Building2, UserCheck, ShieldCheck, QrCode, ArrowRight, LogIn, AlertCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<'policy' | 'select' | 'form' | 'qr'>('policy');
  const [accountType, setAccountType] = useState<'business' | 'individual'>('business');

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [upiId, setUpiId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refCode, setRefCode] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const nameToRegister = businessName.trim();

    // Check for duplicate username in Individual mode
    if (accountType === 'individual') {
      const { data: existingUser } = await supabase
        .from('affiliates')
        .select('business_name')
        .ilike('business_name', nameToRegister);

      if (existingUser && existingUser.length > 0) {
        setError('This username is already taken. Please choose another unique username.');
        setLoading(false);
        return;
      }
    }

    // Generate unique referral code
    const prefix = accountType === 'business' ? 'BOUT' : 'INDV';
    const generatedCode = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;

    const { error: insertError } = await supabase.from('affiliates').insert([
      {
        business_name: nameToRegister,
        owner_name: ownerName,
        whatsapp: whatsapp,
        upi_id: upiId,
        ref_code: generatedCode,
        account_type: accountType
      }
    ]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setRefCode(generatedCode);
      setStep('qr');
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const guestUrl = `${origin}/guest?ref=${refCode}`;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', color: '#1B2B22', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      
      {/* TOP HEADER */}
      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 300, margin: 0, letterSpacing: '0.05em' }}>TERRA STAYS</h2>
        <button 
          onClick={() => router.push('/login')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1B2B22', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
        >
          <LogIn size={14} /> Partner Login
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', maxWidth: '460px', width: '100%', boxShadow: '0 12px 35px rgba(0,0,0,0.04)', border: '1px solid #E2E2DE' }}>
        
        {/* STEP 1: POLICY ACCEPTANCE */}
        {step === 'policy' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2B6A4B', background: '#EAF4EE', padding: '6px 12px', borderRadius: '20px', width: 'fit-content', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              <ShieldCheck size={14} /> Partner Network Terms
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 300, margin: '0 0 1rem 0' }}>Terra Stays Partner Policy</h1>
            
            <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: '1.6', background: '#FAFAFA', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EDEDE9', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              <p style={{ margin: '0 0 8px 0' }}>• Earn transparent commissions on all guest stays referred through your standee QR code.</p>
              <p style={{ margin: '0 0 8px 0' }}>• Payments are calculated and disbursed directly to your registered UPI ID once confirmed by Terra Stays Admin.</p>
              <p style={{ margin: 0 }}>• QR codes must remain clearly visible at your designated reception or hospitality counter.</p>
            </div>

            <button 
              onClick={() => setStep('select')}
              style={{ width: '100%', padding: '14px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              I Accept & Agree <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: SELECT ACCOUNT TYPE */}
        {step === 'select' && (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 300, margin: '0 0 8px 0' }}>Register Account</h1>
            <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>Select your partnership category to continue:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div 
                onClick={() => { setAccountType('business'); setStep('form'); }}
                style={{ padding: '1.25rem', border: '1px solid #E2E2DE', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', background: '#FAFAFA', transition: 'all 0.2s' }}
              >
                <div style={{ background: '#1B2B22', color: '#fff', padding: '10px', borderRadius: '10px' }}><Building2 size={20} /></div>
                <div>
                  <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>Business Partner</h3>
                  <p style={{ color: '#888', fontSize: '0.78rem', margin: '2px 0 0 0' }}>For resorts, boutique stays, cafes, and travel desks</p>
                </div>
              </div>

              <div 
                onClick={() => { setAccountType('individual'); setStep('form'); }}
                style={{ padding: '1.25rem', border: '1px solid #E2E2DE', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', background: '#FAFAFA', transition: 'all 0.2s' }}
              >
                <div style={{ background: '#2B6A4B', color: '#fff', padding: '10px', borderRadius: '10px' }}><UserCheck size={20} /></div>
                <div>
                  <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>Individual Affiliate</h3>
                  <p style={{ color: '#888', fontSize: '0.78rem', margin: '2px 0 0 0' }}>For freelance hosts, influencers, and local guides</p>
                </div>
              </div>
            </div>

            <button onClick={() => setStep('policy')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer' }}>← Back to Policy</button>
          </div>
        )}

        {/* STEP 3: REGISTRATION FORM */}
        {step === 'form' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 300, margin: 0 }}>
              {accountType === 'business' ? 'Boutique Business Details' : 'Individual Affiliate Profile'}
            </h1>

            {error && (
              <div style={{ background: '#FDF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                {accountType === 'business' ? 'Boutique / Business Name' : 'Unique Username'}
              </label>
              <input 
                type="text" 
                required 
                placeholder={accountType === 'business' ? 'e.g. Pine Retreat Resort' : 'e.g. ranit_explores'} 
                value={businessName} 
                onChange={e => setBusinessName(e.target.value)} 
                style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Owner / Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Ranit Dutta" 
                value={ownerName} 
                onChange={e => setOwnerName(e.target.value)} 
                style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>WhatsApp Number</label>
              <input 
                type="tel" 
                required 
                placeholder="e.g. 9876543210" 
                value={whatsapp} 
                onChange={e => setWhatsapp(e.target.value)} 
                style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>UPI ID (for future payouts)</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. username@upi or phone@paytm" 
                value={upiId} 
                onChange={e => setUpiId(e.target.value)} 
                style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '14px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '6px' }}
            >
              {loading ? "Generating Asset..." : "Generate Entry Asset"}
            </button>
            <button type="button" onClick={() => setStep('select')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer' }}>← Back</button>
          </form>
        )}

        {/* STEP 4: GENERATED QR CODE */}
        {step === 'qr' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EAF4EE', color: '#2B6A4B', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
              <QrCode size={14} /> Asset Generated
            </div>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 4px 0' }}>{businessName}</h2>
            <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 1.5rem 0' }}>
              Referral Code: <strong style={{ color: '#1B2B22', fontFamily: 'monospace' }}>{refCode}</strong>
            </p>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #E2E2DE', display: 'inline-block', marginBottom: '1.5rem' }}>
              <QRCodeCanvas value={guestUrl} size={200} level={"H"} includeMargin={true} />
            </div>

            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.25rem' }}>
              Save your referral code (<strong style={{ color: '#1B2B22' }}>{refCode}</strong>) to log into your partner dashboard anytime.
            </p>

            <button 
              onClick={() => router.push(`/login?code=${refCode}`)}
              style={{ width: '100%', padding: '14px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Go to Partner Dashboard Login <ArrowRight size={16} />
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}