import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, LogIn, X, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export function AdminLoginModal({ isOpen, onClose }) {
  const { loginAsAdmin, t } = useApp();
  const [email, setEmail] = useState('admin@bharatnet-satellite.gov.in');
  const [password, setPassword] = useState('Admin@2025#Sat');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide administrator email and password.');
      return;
    }

    const success = loginAsAdmin(email, password);
    if (success) {
      onClose();
    } else {
      setError('Invalid administrator credentials.');
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@bharatnet-satellite.gov.in');
    setPassword('Admin@2025#Sat');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-xs relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Administrator Login</h3>
            <p className="text-slate-500 text-[11px]">Rural Satellite Management Console</p>
          </div>
        </div>

        {error && (
          <div className="my-3 p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-cyan-600 hover:text-cyan-800 text-[11px] font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Auto-Fill Demo Credentials
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition shadow-md"
            >
              Authenticate & Open Admin Console
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 text-center">
          In local demo mode, any valid format email/password pair is accepted.
        </div>
      </div>
    </div>
  );
}
