import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OverviewView } from './components/dashboard/OverviewView';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { LagrangeView } from './components/lagrange/LagrangeView';
import { ComparisonView } from './components/comparison/ComparisonView';
import { SimulatorView } from './components/simulator/SimulatorView';
import { AccuracyView } from './components/accuracy/AccuracyView';
import { VillageComparisonView } from './components/villages/VillageComparisonView';
import { EventsView } from './components/events/EventsView';
import { AIInsightsView } from './components/ai/AIInsightsView';
import { ReportsView } from './components/reports/ReportsView';
import { AdminView } from './components/admin/AdminView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { Menu } from 'lucide-react';

function MainLayout() {
  const [currentView, setCurrentView] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const { highContrast, textSize } = useApp();

  // Dynamic text size classes
  const textSizeClass =
    textSize === 'xl' ? 'text-[17px]' : textSize === 'large' ? 'text-[15px]' : 'text-sm';

  return (
    <div
      className={`min-h-screen flex bg-slate-50 text-slate-800 ${textSizeClass} ${
        highContrast ? 'contrast-125 saturate-150' : ''
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header Bar with Hamburger */}
        <div className="lg:hidden bg-navy-950 text-white px-4 py-2.5 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg bg-navy-900 text-slate-300 hover:text-white"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-xs tracking-wider text-cyan-400 uppercase">
              SAT-NET ESTIMATOR
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Lagrange Platform</span>
        </div>

        {/* Global Desktop & Mobile Top Header */}
        <Header onOpenAdminModal={() => setShowAdminModal(true)} />

        {/* Primary Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'overview' && <OverviewView onNavigate={setCurrentView} />}
          {currentView === 'monitoring' && <MonitoringView />}
          {currentView === 'lagrange' && <LagrangeView />}
          {currentView === 'comparison' && <ComparisonView />}
          {currentView === 'simulator' && <SimulatorView />}
          {currentView === 'accuracy' && <AccuracyView />}
          {currentView === 'villages' && <VillageComparisonView />}
          {currentView === 'events' && <EventsView />}
          {currentView === 'ai' && <AIInsightsView />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'admin' && (
            <AdminView onOpenAdminModal={() => setShowAdminModal(true)} />
          )}
          {currentView === 'settings' && <SettingsView />}
        </main>

        {/* Institutional & Disclaimer Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>
              &copy; {new Date().getFullYear()} Satellite Internet Speed Estimator for Remote Villages &bull; College Mini-Project
            </span>
            <span className="text-[11px] text-slate-400">
              Department of Mathematics & Numerical Methods &bull; Tamil Nadu Pilot VSAT Network
            </span>
          </div>
        </footer>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
