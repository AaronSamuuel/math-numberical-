import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Activity,
  Calculator,
  GitCompare,
  FlaskConical,
  Target,
  MapPin,
  BellRing,
  Sparkles,
  FileText,
  ShieldAlert,
  Settings,
  Radio,
  Menu,
  X
} from 'lucide-react';

export function Sidebar({ currentView, setCurrentView, mobileOpen, setMobileOpen }) {
  const { t, isAdmin, events } = useApp();

  const navItems = [
    { id: 'overview', label: t('navOverview'), icon: LayoutDashboard },
    { id: 'monitoring', label: t('navMonitoring'), icon: Activity },
    { id: 'lagrange', label: t('navLagrange'), icon: Calculator, highlight: true },
    { id: 'comparison', label: t('navComparison'), icon: GitCompare },
    { id: 'simulator', label: t('navSimulator'), icon: FlaskConical },
    { id: 'accuracy', label: t('navAccuracy'), icon: Target },
    { id: 'villages', label: t('navVillages'), icon: MapPin },
    {
      id: 'events',
      label: t('navEvents'),
      icon: BellRing,
      badge: events.length > 0 ? events.length : null
    },
    { id: 'ai', label: t('navAI'), icon: Sparkles },
    { id: 'reports', label: t('navReports'), icon: FileText },
    { id: 'admin', label: t('navAdmin'), icon: ShieldAlert, adminOnly: true },
    { id: 'settings', label: t('navSettings'), icon: Settings }
  ];

  const handleSelect = (id) => {
    setCurrentView(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-950 text-slate-300 border-r border-navy-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Banner */}
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">SAT-NET SPEED</span>
              <p className="text-[10px] text-slate-400 font-medium">Lagrange Estimator Platform</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                    : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                } ${item.highlight && !isActive ? 'border border-cyan-500/30 text-cyan-300 bg-cyan-950/20' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.adminOnly && !isAdmin && (
                    <span className="text-[9px] uppercase px-1 rounded bg-navy-800 text-slate-400 font-mono">
                      LOCK
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Hardware Telemetry Pill */}
        <div className="p-3 border-t border-navy-900 bg-navy-950/50">
          <div className="p-2.5 rounded-lg bg-navy-900/80 border border-navy-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Telemetry Engine</span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Formula: P(x) = \u03A3 y_i \u22C5 L_i(x)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
