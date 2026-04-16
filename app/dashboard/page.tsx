"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Disc, TrendingUp, Users, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [creds, setCreds] = useState({ email: '', code: '' });
  const [leads, setLeads] = useState<any[]>([]);

  const handleLogin = async () => {
    const { data } = await supabase.from('affiliates').select('*').eq('email', creds.email).eq('ref_code', creds.code).single();
    if (data) {
      setUser(data);
      const { data: leadData } = await supabase.from('leads').select('*').eq('referred_by', data.ref_code);
      setLeads(leadData || []);
    } else alert("Invalid Dossier Credentials");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FDFDFA] p-10 rounded-[2.5rem] w-full max-w-sm shadow-[0_20px_50px_rgba(232,119,34,0.2)]">
          <Disc className="mx-auto text-[#E87722] mb-4 animate-spin-slow" size={48} />
          <h1 className="text-2xl font-black text-center mb-8 tracking-tighter">PARTNER LOGBOOK</h1>
          <input onChange={e => setCreds({...creds, email: e.target.value})} placeholder="EMAIL ADDRESS" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-4 outline-none focus:border-[#E87722]" />
          <input onChange={e => setCreds({...creds, code: e.target.value})} placeholder="ACCESS CODE" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-6 outline-none focus:border-[#E87722]" />
          <button onClick={handleLogin} className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-black transition">UNLOCK DASHBOARD</button>
        </motion.div>
      </div>
    );
  }

  const earnings = leads.filter(l => l.payment_status === 'confirmed').length * 500;

  return (
    <div className="min-h-screen bg-[#FDFDFA] text-[#1A1A1A] p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[#E87722] font-black tracking-widest text-xs mb-2 uppercase">Official Partner</p>
            <h1 className="text-4xl font-black tracking-tighter">{user.business_name}</h1>
          </div>
          <button onClick={() => window.location.reload()} className="p-3 bg-gray-100 rounded-full hover:bg-red-50 text-red-500 transition"><LogOut size={20}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#2D3F33] text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
             <div className="relative z-10">
               <TrendingUp className="mb-4 text-[#E87722]" />
               <p className="text-sm opacity-60">Total Earnings</p>
               <p className="text-5xl font-black mt-2">₹{earnings}</p>
             </div>
             <div className="absolute -right-10 -bottom-10 opacity-10 text-[150px] rotate-12"><Disc /></div>
          </div>
          <div className="bg-white border-2 border-gray-100 p-8 rounded-[2rem] shadow-sm">
             <Users className="mb-4 text-gray-400" />
             <p className="text-sm text-gray-400">Total Referrals</p>
             <p className="text-5xl font-black mt-2 text-[#1A1A1A]">{leads.length}</p>
          </div>
        </div>

        <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Recent Scans</h3>
        <div className="space-y-3">
          {leads.map((l, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl">
              <div>
                <p className="font-bold">{l.guest_name}</p>
                <p className="text-xs text-gray-400">{l.heads} People • {l.days} Days</p>
              </div>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black ${l.payment_status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {l.payment_status.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}