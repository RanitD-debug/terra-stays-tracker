"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { LogIn, KeyRound, Building, ArrowRight, AlertCircle } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [refCode, setRefCode] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (codeParam) {
      setRefCode(codeParam);
    }
  }, [codeParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanCode = refCode.trim().toUpperCase();
    const cleanIdent = identifier.trim().toLowerCase();

    // Query partner by ref_code
    const { data: partner, error: fetchErr } = await supabase
      .from('affiliates')
      .select('*')
      .eq('ref_code', cleanCode)
      .single();

    setLoading(false);

    if (fetchErr || !partner) {
      setError('Invalid referral code or credentials. Please check and try again.');
      return;
    }

    if (cleanIdent && partner.business_name.toLowerCase() !== cleanIdent) {
      setError('Business name / username does not match this referral code.');
      return;
    }

    // Save session locally and redirect
    localStorage.setItem('terra_partner', JSON.stringify(partner));
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', color: '#1B2B22', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 12px 35px rgba(0,0,0,0.04)', border: '1px solid #E2E2DE' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EAF4EE', color: '#2B6A4B', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
            <LogIn size={14} /> Partner Portal
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 300, margin: '0 0 6px 0' }}>Welcome Back</h1>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>Log in with your Referral Code to view guest leads & payouts</p>
        </div>

        {error && (
          <div style={{ background: '#FDF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              <KeyRound size={14} /> Referral Code (e.g. BOUT1234 or INDV5678)
            </label>
            <input 
              type="text" 
              required 
              placeholder="Enter Ref Code" 
              value={refCode} 
              onChange={e => setRefCode(e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#FAFAFA', fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              <Building size={14} /> Business Name / Unique Username (Optional)
            </label>
            <input 
              type="text" 
              placeholder="Confirm business name or username" 
              value={identifier} 
              onChange={e => setIdentifier(e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '14px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #EDEDE9' }}>
          <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>
            Don't have a referral code yet?{' '}
            <a href="/" style={{ color: '#1B2B22', fontWeight: 600, textDecoration: 'none' }}>Register Here</a>
          </p>
        </div>

      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}