"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { QrCode, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCode = searchParams.get('code') || '';

  const [refCode, setRefCode] = useState(prefilledCode);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledCode) {
      setRefCode(prefilledCode.trim().toUpperCase());
    }
  }, [prefilledCode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = refCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter your referral code.');
      return;
    }

    setLoading(true);

    try {
      // Query Supabase case-insensitively
      const { data, error: fetchErr } = await supabase
        .from('affiliates')
        .select('*')
        .ilike('ref_code', cleanCode)
        .single();

      if (fetchErr || !data) {
        setError('Invalid Referral Code. Please check the code generated during registration.');
        setLoading(false);
        return;
      }

      // Check password (if set)
      if (data.password && password && data.password !== password) {
        setError('Incorrect password for this referral code.');
        setLoading(false);
        return;
      }

      // Save partner session locally
      localStorage.setItem('terra_partner', JSON.stringify(data));

      // Redirect to partner dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Login exception:", err);
      setError('System lookup error. Please check your credentials and try again.');
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', color: '#1B2B22', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 12px 35px rgba(0,0,0,0.04)', border: '1px solid #E2E2DE' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EAF4EE', color: '#2B6A4B', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
            <Sparkles size={14} /> Partner Access
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 300, color: '#1B2B22', margin: '0 0 6px 0' }}>Partner Login</h1>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>Enter your registered Referral Code and Password</p>
        </div>

        {error && (
          <div style={{ background: '#FDF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '10px 12px', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1B2B22', marginBottom: '6px' }}>
              <QrCode size={14} /> Referral Code / Username
            </label>
            <input 
              type="text" 
              name="username"
              autoComplete="username"
              required 
              placeholder="e.g. BOUT1234 or INDV5678" 
              value={refCode} 
              onChange={e => setRefCode(e.target.value.toUpperCase())} 
              style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: '#FAFAFA', fontFamily: 'monospace', fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#1B2B22', marginBottom: '6px' }}>
              <Lock size={14} /> Password
            </label>
            <input 
              type="password" 
              name="password"
              autoComplete="current-password"
              required 
              placeholder="Enter your account password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: '#FAFAFA' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#1B2B22', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? "Authenticating..." : "Access Dashboard"} <LogIn size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '0.8rem', cursor: 'pointer' }}>
            ← Need to register a new partner account?
          </button>
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