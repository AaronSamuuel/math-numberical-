import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Globe2,
  Sliders,
  Wifi,
  Database,
  Key,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';

export function SettingsView() {
  const {
    language,
    setLanguage,
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
    lowDataMode,
    setLowDataMode,
    isDemoMode,
    t
  } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-600" />
          {t('navSettings')}
        </h2>
        <p className="text-xs text-slate-500">
          Preferences, language localization, accessibility options, and external API service statuses
        </p>
      </div>

      {/* Localization & Accessibility Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
          <Globe2 className="w-4 h-4 text-cyan-600" /> Language & Accessibility Preferences
        </h3>

        <div className="space-y-3">
          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">System Interface Language</span>
              <span className="text-slate-500 text-[11px]">Toggle between English and தமிழ் (Tamil)</span>
            </div>
            <div className="flex border border-slate-300 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded font-semibold ${language === 'en' ? 'bg-white shadow text-cyan-700' : 'text-slate-600'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-3 py-1 rounded font-semibold ${language === 'ta' ? 'bg-white shadow text-cyan-700' : 'text-slate-600'}`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-800 block">High Contrast Mode</span>
              <span className="text-slate-500 text-[11px]">Enhances border definitions and text legibility for outdoor sunlight</span>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-1 rounded font-semibold ${highContrast ? 'bg-slate-900 text-yellow-400 font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              {highContrast ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Text Sizing */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-800 block">Typography Scaling</span>
              <span className="text-slate-500 text-[11px]">Adjust dashboard font sizing</span>
            </div>
            <div className="flex border border-slate-300 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setTextSize('normal')}
                className={`px-2.5 py-1 rounded font-bold ${textSize === 'normal' ? 'bg-white shadow text-cyan-700' : 'text-slate-600'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setTextSize('large')}
                className={`px-2.5 py-1 rounded font-bold ${textSize === 'large' ? 'bg-white shadow text-cyan-700' : 'text-slate-600'}`}
              >
                Large
              </button>
              <button
                onClick={() => setTextSize('xl')}
                className={`px-2.5 py-1 rounded font-bold ${textSize === 'xl' ? 'bg-white shadow text-cyan-700' : 'text-slate-600'}`}
              >
                Extra Large
              </button>
            </div>
          </div>

          {/* Low Data Mode */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-800 block">Low-Data Optimization Mode</span>
              <span className="text-slate-500 text-[11px]">Pauses automated background polling & reduces chart animations</span>
            </div>
            <button
              onClick={() => setLowDataMode(!lowDataMode)}
              className={`px-3 py-1 rounded font-semibold ${lowDataMode ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
            >
              {lowDataMode ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* External Integration & API Status Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
          <Key className="w-4 h-4 text-cyan-600" /> External API & Backend Integration Status
        </h3>

        <div className="divide-y divide-slate-100">
          {/* Supabase Status */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Supabase PostgreSQL & Auth</span>
              <span className="text-slate-500 text-[11px]">
                {isDemoMode
                  ? 'Local Demo Mode Active (No credentials supplied, using persistent browser LocalStorage)'
                  : 'Connected to remote Supabase Cloud Instance'}
              </span>
            </div>
            <div>
              {isDemoMode ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                  Local Demo Mode
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Connected
                </span>
              )}
            </div>
          </div>

          {/* Speed Test Endpoint */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">VITE_SPEED_TEST_ENDPOINT</span>
              <span className="text-slate-500 text-[11px]">
                {import.meta.env.VITE_SPEED_TEST_ENDPOINT
                  ? `Active: ${import.meta.env.VITE_SPEED_TEST_ENDPOINT}`
                  : 'Unconfigured &bull; Using verified simulated diagnostic speed testing'}
              </span>
            </div>
            <div>
              {import.meta.env.VITE_SPEED_TEST_ENDPOINT ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Configured
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                  Simulated
                </span>
              )}
            </div>
          </div>

          {/* Notification Webhook */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">VITE_NOTIFICATION_WEBHOOK_URL</span>
              <span className="text-slate-500 text-[11px]">
                {import.meta.env.VITE_NOTIFICATION_WEBHOOK_URL
                  ? `Active: ${import.meta.env.VITE_NOTIFICATION_WEBHOOK_URL}`
                  : 'Unconfigured &bull; Using in-memory toast notifications for simulated alerts'}
              </span>
            </div>
            <div>
              {import.meta.env.VITE_NOTIFICATION_WEBHOOK_URL ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Configured
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                  Simulated
                </span>
              )}
            </div>
          </div>

          {/* AI Insights API */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">VITE_AI_API_KEY</span>
              <span className="text-slate-500 text-[11px]">
                Deterministic rule-based explanation engine is active.
              </span>
            </div>
            <div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-cyan-800">
                Rule Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
