import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Satellite,
  Globe2,
  Sliders,
  Sparkles,
  Wifi,
  WifiOff,
  UserCheck,
  LogIn,
  SunMedium,
  CheckCircle2,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

export function Header({ onOpenAdminModal }) {
  const {
    language,
    setLanguage,
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
    lowDataMode,
    setLowDataMode,
    isOffline,
    isDemoMode,
    lastUpdated,
    generateQuickReading,
    isAdmin,
    adminEmail,
    logoutAdmin,
    toastNotification,
    t
  } = useApp();

  const [showAccessMenu, setShowAccessMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 sm:px-6">
      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className={`mb-3 p-3 rounded-lg text-sm flex items-center justify-between shadow-sm transition-all ${
          toastNotification.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-300'
            : toastNotification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
            : 'bg-cyan-50 text-cyan-800 border border-cyan-300'
        }`}>
          <div className="flex items-center gap-2">
            {toastNotification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            {toastNotification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toastNotification.type === 'info' && <Info className="w-4 h-4 text-cyan-600 shrink-0" />}
            <span className="font-medium">{toastNotification.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Status badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-sm shadow-cyan-200">
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {t('appTitle')}
              </h1>
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300" title="Running in self-contained local demonstration mode">
                  DEMO MODE
                </span>
              )}
              {isOffline && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> OFFLINE (CACHED)
                </span>
              )}
              {lowDataMode && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                  LOW DATA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t('appSubtitle')} &bull; Last Sync:{' '}
              <span className="font-mono">{lastUpdated.toLocaleTimeString()}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Simulate Button for College Demo */}
          <button
            onClick={generateQuickReading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-sm transition active:scale-95"
            title="Generates a plausible simulated telemetry reading for demonstration"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('quickSimulateBtn')}</span>
          </button>

          {/* Language Switcher (EN / TA) */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 p-0.5 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded font-semibold transition ${
                language === 'en'
                  ? 'bg-white text-cyan-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 rounded font-semibold transition ${
                language === 'ta'
                  ? 'bg-white text-cyan-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Accessibility & Display Controls Menu */}
          <div className="relative">
            <button
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              title="Accessibility & Display settings"
              aria-label="Display and Accessibility Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {showAccessMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 font-bold text-slate-800">
                  <span>Display & Accessibility</span>
                  <button onClick={() => setShowAccessMenu(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* High Contrast Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">High Contrast Mode</span>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                        highContrast ? 'bg-black text-yellow-300 font-bold' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {highContrast ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Text Size */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Font Sizing</span>
                    <div className="flex rounded border border-slate-200 bg-slate-50 p-0.5">
                      <button
                        onClick={() => setTextSize('normal')}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${textSize === 'normal' ? 'bg-white shadow text-cyan-700' : 'text-slate-500'}`}
                      >
                        1x
                      </button>
                      <button
                        onClick={() => setTextSize('large')}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${textSize === 'large' ? 'bg-white shadow text-cyan-700' : 'text-slate-500'}`}
                      >
                        1.2x
                      </button>
                      <button
                        onClick={() => setTextSize('xl')}
                        className={`px-1.5 py-0.5 rounded text-[12px] font-bold ${textSize === 'xl' ? 'bg-white shadow text-cyan-700' : 'text-slate-500'}`}
                      >
                        1.4x
                      </button>
                    </div>
                  </div>

                  {/* Low Data Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Low-Data Mode</span>
                    <button
                      onClick={() => setLowDataMode(!lowDataMode)}
                      className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                        lowDataMode ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {lowDataMode ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Auth Status Button */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{adminEmail.split('@')[0]}</span>
              <button
                onClick={logoutAdmin}
                className="ml-1 text-[11px] text-rose-600 hover:underline"
              >
                ({t('logout')})
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('adminLogin')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
