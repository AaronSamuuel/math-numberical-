import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  INITIAL_PROVIDERS,
  INITIAL_VILLAGES,
  INITIAL_TERMINALS,
  generateInitialMeasurements,
  generateSimulatedReading
} from '../data/mockData';
import { TRANSLATIONS } from '../translations/i18n';
import { DEFAULT_THRESHOLDS, detectConnectivityEvents } from '../utils/eventDetection';
import { DEFAULT_WEIGHTS, calculateConnectivityScore } from '../utils/scoring';
import { isSupabaseConfigured, supabase, STORAGE_KEYS } from '../utils/supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Language & Accessibility Settings
  const [language, setLanguage] = useState(() => localStorage.getItem('sat_lang') || 'en');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('sat_contrast') === 'true');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('sat_text_size') || 'normal');
  const [lowDataMode, setLowDataMode] = useState(() => localStorage.getItem('sat_low_data') === 'true');

  // 2. Telemetry Entities
  const [villages, setVillages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VILLAGES);
      return saved ? JSON.parse(saved) : INITIAL_VILLAGES;
    } catch {
      return INITIAL_VILLAGES;
    }
  });

  const [terminals, setTerminals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TERMINALS);
      return saved ? JSON.parse(saved) : INITIAL_TERMINALS;
    } catch {
      return INITIAL_TERMINALS;
    }
  });

  const [providers, setProviders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      return saved ? JSON.parse(saved) : INITIAL_PROVIDERS;
    } catch {
      return INITIAL_PROVIDERS;
    }
  });

  const [measurements, setMeasurements] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
      return saved ? JSON.parse(saved) : generateInitialMeasurements();
    } catch {
      return generateInitialMeasurements();
    }
  });

  // 3. Admin Authentication & Session
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState(() => {
    try {
      return localStorage.getItem('sat_admin_email') || 'admin@bharatnet-satellite.gov.in';
    } catch {
      return 'admin@bharatnet-satellite.gov.in';
    }
  });

  // 4. Thresholds & Weights
  const [thresholds, setThresholds] = useState(() => {
    try {
      const saved = localStorage.getItem('sat_thresholds');
      return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
    } catch {
      return DEFAULT_THRESHOLDS;
    }
  });

  const [scoreWeights, setScoreWeights] = useState(() => {
    try {
      const saved = localStorage.getItem('sat_weights');
      return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
    } catch {
      return DEFAULT_WEIGHTS;
    }
  });

  // 5. Dashboard Filters
  const [selectedVillageId, setSelectedVillageId] = useState('all');
  const [selectedTerminalId, setSelectedTerminalId] = useState('all');
  const [selectedProviderId, setSelectedProviderId] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // 'all', '24h', '7d'

  // 6. Automation & Scheduled Collection Simulator
  const [isScheduledCollectionActive, setIsScheduledCollectionActive] = useState(false);
  const [collectionIntervalSeconds, setCollectionIntervalSeconds] = useState(15);

  // 7. System Meta & Status
  const [isDemoMode] = useState(!isSupabaseConfigured);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [toastNotification, setToastNotification] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VILLAGES, JSON.stringify(villages));
      localStorage.setItem(STORAGE_KEYS.TERMINALS, JSON.stringify(terminals));
      localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
      localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Storage quota warning or disabled local storage:', e);
    }
  }, [villages, terminals, providers, measurements]);

  useEffect(() => {
    localStorage.setItem('sat_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sat_contrast', highContrast ? 'true' : 'false');
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('sat_text_size', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('sat_low_data', lowDataMode ? 'true' : 'false');
  }, [lowDataMode]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scheduled telemetry generator timer
  useEffect(() => {
    if (!isScheduledCollectionActive || lowDataMode) return;
    const interval = setInterval(() => {
      // Pick random village
      const randomVillage = villages[Math.floor(Math.random() * villages.length)];
      const terminal = terminals.find(t => t.villageId === randomVillage.id) || terminals[0];
      const provider = providers.find(p => p.id === randomVillage.providerId) || providers[0];
      const newReading = generateSimulatedReading(randomVillage, terminal, provider);

      setMeasurements(prev => [newReading, ...prev]);
      setLastUpdated(new Date());
    }, collectionIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [isScheduledCollectionActive, collectionIntervalSeconds, villages, terminals, providers, lowDataMode]);

  // Toast Helper
  const showToast = useCallback((message, type = 'info') => {
    setToastNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastNotification(prev => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Translation helper
  const t = useCallback((key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  }, [language]);

  // Filtered measurements
  const filteredMeasurements = useMemo(() => {
    return measurements.filter(m => {
      if (selectedVillageId !== 'all' && m.villageId !== selectedVillageId) return false;
      if (selectedTerminalId !== 'all' && m.terminalId !== selectedTerminalId) return false;
      if (selectedProviderId !== 'all') {
        const vil = villages.find(v => v.id === m.villageId);
        if (vil?.providerId !== selectedProviderId) return false;
      }
      if (dateRange === '24h') {
        const cutoff = Date.now() - 24 * 3600 * 1000;
        if (new Date(m.timestamp).getTime() < cutoff) return false;
      } else if (dateRange === '7d') {
        const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
        if (new Date(m.timestamp).getTime() < cutoff) return false;
      }
      return true;
    });
  }, [measurements, selectedVillageId, selectedTerminalId, selectedProviderId, dateRange, villages]);

  // Detected Events
  const events = useMemo(() => {
    return detectConnectivityEvents(filteredMeasurements, thresholds);
  }, [filteredMeasurements, thresholds]);

  // Overall Telemetry KPIs
  const overallKPIs = useMemo(() => {
    const totalVillages = villages.length;
    const activeTerminals = terminals.filter(t => t.status === 'ONLINE').length;
    
    if (filteredMeasurements.length === 0) {
      return {
        totalVillages,
        activeTerminals,
        avgDownload: 0,
        avgUpload: 0,
        avgLatency: 0,
        avgPacketLoss: 0,
        avgUptime: 0,
        status: 'OFFLINE',
        lastTimestamp: null
      };
    }

    const speeds = filteredMeasurements.map(m => m.downloadSpeed).filter(s => typeof s === 'number');
    const uploads = filteredMeasurements.map(m => m.uploadSpeed).filter(s => typeof s === 'number');
    const latencies = filteredMeasurements.map(m => m.latencyMs).filter(l => typeof l === 'number');
    const losses = filteredMeasurements.map(m => m.packetLossPct).filter(p => typeof p === 'number');
    const uptimes = filteredMeasurements.map(m => m.uptimePct).filter(u => typeof u === 'number');

    const avgDownload = speeds.length ? Number((speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1)) : 0;
    const avgUpload = uploads.length ? Number((uploads.reduce((a, b) => a + b, 0) / uploads.length).toFixed(1)) : 0;
    const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const avgPacketLoss = losses.length ? Number((losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(1)) : 0;
    const avgUptime = uptimes.length ? Number((uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(1)) : 0;

    let status = 'ONLINE';
    if (avgDownload < thresholds.minDownloadSpeedMbps || avgPacketLoss > thresholds.maxPacketLossPct) {
      status = 'DEGRADED';
    }
    if (avgDownload <= 1.0 && avgPacketLoss > 50) {
      status = 'OFFLINE';
    }

    const latest = [...filteredMeasurements].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    return {
      totalVillages,
      activeTerminals,
      avgDownload,
      avgUpload,
      avgLatency,
      avgPacketLoss,
      avgUptime,
      status,
      lastTimestamp: latest ? latest.timestamp : null
    };
  }, [villages, terminals, filteredMeasurements, thresholds]);

  // Actions
  const addMeasurement = useCallback((meas) => {
    // Validate duplicates for same terminal & timestamp
    const duplicate = measurements.some(
      m => m.terminalId === meas.terminalId && Math.abs(new Date(m.timestamp) - new Date(meas.timestamp)) < 1000
    );
    if (duplicate) {
      showToast('Rejected: Duplicate measurement record exists for this terminal and exact timestamp.', 'error');
      return false;
    }

    setMeasurements(prev => [meas, ...prev]);
    setLastUpdated(new Date());
    showToast(`Measurement successfully recorded (${meas.downloadSpeed} Mbps).`, 'success');
    return true;
  }, [measurements, showToast]);

  const updateMeasurement = useCallback((id, updated) => {
    setMeasurements(prev => prev.map(m => (m.id === id ? { ...m, ...updated } : m)));
    showToast('Measurement record updated.', 'info');
  }, [showToast]);

  const deleteMeasurement = useCallback((id) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    showToast('Measurement record removed.', 'warning');
  }, [showToast]);

  const generateQuickReading = useCallback(() => {
    const targetVil = selectedVillageId !== 'all' 
      ? villages.find(v => v.id === selectedVillageId) || villages[0]
      : villages[Math.floor(Math.random() * villages.length)];
    const terminal = terminals.find(t => t.villageId === targetVil.id) || terminals[0];
    const provider = providers.find(p => p.id === targetVil.providerId) || providers[0];
    const reading = generateSimulatedReading(targetVil, terminal, provider);

    setMeasurements(prev => [reading, ...prev]);
    setLastUpdated(new Date());
    showToast(`Plausible simulated reading generated for ${targetVil.name} (${reading.downloadSpeed} Mbps). Clearly labeled as SIMULATED.`, 'info');
  }, [selectedVillageId, villages, terminals, providers, showToast]);

  const resetToMockData = useCallback(() => {
    setVillages(INITIAL_VILLAGES);
    setTerminals(INITIAL_TERMINALS);
    setProviders(INITIAL_PROVIDERS);
    setMeasurements(generateInitialMeasurements());
    setThresholds(DEFAULT_THRESHOLDS);
    setScoreWeights(DEFAULT_WEIGHTS);
    setLastUpdated(new Date());
    showToast('Telemetry & database reset to original calibrated demo state.', 'info');
  }, [showToast]);

  // Village management
  const addVillage = useCallback((newVil) => {
    setVillages(prev => [...prev, newVil]);
    showToast(`Village ${newVil.name} registered.`, 'success');
  }, [showToast]);

  const updateVillage = useCallback((id, updated) => {
    setVillages(prev => prev.map(v => (v.id === id ? { ...v, ...updated } : v)));
    showToast('Village record updated.', 'info');
  }, [showToast]);

  const deleteVillage = useCallback((id) => {
    setVillages(prev => prev.filter(v => v.id !== id));
    showToast('Village record deleted.', 'warning');
  }, [showToast]);

  // Terminal management
  const addTerminal = useCallback((newTerm) => {
    setTerminals(prev => [...prev, newTerm]);
    showToast(`Satellite terminal ${newTerm.terminalCode} registered.`, 'success');
  }, [showToast]);

  const updateTerminal = useCallback((id, updated) => {
    setTerminals(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    showToast('Terminal record updated.', 'info');
  }, [showToast]);

  const deleteTerminal = useCallback((id) => {
    setTerminals(prev => prev.filter(t => t.id !== id));
    showToast('Terminal record removed.', 'warning');
  }, [showToast]);

  // Authentication actions
  const loginAsAdmin = useCallback((email, password) => {
    // Demo admin login support or Supabase Auth
    if (email && password) {
      setIsAdmin(true);
      setAdminEmail(email);
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
      localStorage.setItem('sat_admin_email', email);
      showToast(`Welcome Administrator (${email})`, 'success');
      return true;
    }
    return false;
  }, [showToast]);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    showToast('Administrator session logged out.', 'info');
  }, [showToast]);

  // Simulate dispatch notification (SMS/Email)
  const dispatchAlertNotification = useCallback((event) => {
    const dest = 'village-head@panchayat.gov.in / SMS: +91-98401XXXXX';
    showToast(`Alert Notification Dispatched via simulated SMS & Email to ${dest} for ${event.title}`, 'success');
  }, [showToast]);

  const value = {
    language,
    setLanguage,
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
    lowDataMode,
    setLowDataMode,
    villages,
    terminals,
    providers,
    measurements,
    filteredMeasurements,
    events,
    overallKPIs,
    selectedVillageId,
    setSelectedVillageId,
    selectedTerminalId,
    setSelectedTerminalId,
    selectedProviderId,
    setSelectedProviderId,
    dateRange,
    setDateRange,
    isScheduledCollectionActive,
    setIsScheduledCollectionActive,
    collectionIntervalSeconds,
    setCollectionIntervalSeconds,
    isAdmin,
    adminEmail,
    loginAsAdmin,
    logoutAdmin,
    thresholds,
    setThresholds,
    scoreWeights,
    setScoreWeights,
    isDemoMode,
    isOffline,
    lastUpdated,
    toastNotification,
    showToast,
    t,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    generateQuickReading,
    resetToMockData,
    addVillage,
    updateVillage,
    deleteVillage,
    addTerminal,
    updateTerminal,
    deleteTerminal,
    dispatchAlertNotification
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
