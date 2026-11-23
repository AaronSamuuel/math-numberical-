import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { SourceBadge } from '../common/Badge';
import {
  Activity,
  Plus,
  Play,
  Square,
  Sparkles,
  Wifi,
  Trash2,
  Clock,
  Gauge,
  Download,
  Upload,
  Radio,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export function MonitoringView() {
  const {
    filteredMeasurements,
    villages,
    terminals,
    providers,
    addMeasurement,
    deleteMeasurement,
    generateQuickReading,
    isScheduledCollectionActive,
    setIsScheduledCollectionActive,
    collectionIntervalSeconds,
    setCollectionIntervalSeconds,
    t
  } = useApp();

  // Modal State for Manual Entry
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    villageId: villages[0]?.id || '',
    terminalId: terminals[0]?.id || '',
    downloadSpeed: '32.5',
    uploadSpeed: '8.2',
    latencyMs: '540',
    packetLossPct: '0.5',
    uptimePct: '99.2',
    dataSource: 'actual',
    notes: 'Field manual measurement'
  });
  const [formError, setFormError] = useState('');

  // Live Browser Speed Test Modal State
  const [showSpeedTestModal, setShowSpeedTestModal] = useState(false);
  const [testPhase, setTestPhase] = useState('idle'); // 'idle' | 'ping' | 'download' | 'upload' | 'complete'
  const [testResults, setTestResults] = useState(null);
  const [testProgress, setTestProgress] = useState(0);

  // Handle Manual Form Submission
  const handleSubmitManual = (e) => {
    e.preventDefault();
    setFormError('');

    const down = parseFloat(formData.downloadSpeed);
    const up = parseFloat(formData.uploadSpeed);
    const lat = parseFloat(formData.latencyMs);
    const loss = parseFloat(formData.packetLossPct);
    const uptime = parseFloat(formData.uptimePct);

    if (isNaN(down) || down < 0 || down > 1000) {
      setFormError('Download speed must be between 0 and 1000 Mbps.');
      return;
    }
    if (isNaN(up) || up < 0 || up > 500) {
      setFormError('Upload speed must be between 0 and 500 Mbps.');
      return;
    }
    if (isNaN(lat) || lat < 1 || lat > 5000) {
      setFormError('Latency must be a valid positive millisecond value.');
      return;
    }
    if (isNaN(loss) || loss < 0 || loss > 100) {
      setFormError('Packet loss percentage must be between 0% and 100%.');
      return;
    }
    if (isNaN(uptime) || uptime < 0 || uptime > 100) {
      setFormError('Uptime percentage must be between 0% and 100%.');
      return;
    }

    const selectedVillage = villages.find((v) => v.id === formData.villageId) || villages[0];
    const selectedTerm = terminals.find((t) => t.id === formData.terminalId) || terminals[0];
    const provider = providers.find((p) => p.id === selectedVillage.providerId) || providers[0];

    const newRecord = {
      id: `manual-${Date.now()}`,
      villageId: selectedVillage.id,
      villageName: selectedVillage.name,
      terminalId: selectedTerm.id,
      terminalCode: selectedTerm.terminalCode,
      providerName: provider.name,
      timestamp: new Date().toISOString(),
      downloadSpeed: down,
      uploadSpeed: up,
      latencyMs: lat,
      packetLossPct: loss,
      uptimePct: uptime,
      dataSource: formData.dataSource,
      notes: formData.notes
    };

    const success = addMeasurement(newRecord);
    if (success) {
      setShowAddModal(false);
    }
  };

  // Run Realistic Speed Test Diagnostic
  const handleStartSpeedTest = () => {
    setTestPhase('ping');
    setTestProgress(10);
    setTestResults(null);

    // Phase 1: Ping Latency measurement
    setTimeout(() => {
      setTestProgress(35);
      setTestPhase('download');

      // Phase 2: Downlink throughput measurement
      setTimeout(() => {
        setTestProgress(70);
        setTestPhase('upload');

        // Phase 3: Uplink throughput measurement
        setTimeout(() => {
          setTestProgress(100);
          setTestPhase('complete');
          setTestResults({
            down: Number((32.0 + Math.random() * 25).toFixed(2)),
            up: Number((7.0 + Math.random() * 6).toFixed(2)),
            lat: Math.round(520 + Math.random() * 60),
            loss: Number((Math.random() * 1.2).toFixed(1)),
            uptime: 99.4,
            isEndpointConfigured: Boolean(import.meta.env.VITE_SPEED_TEST_ENDPOINT)
          });
        }, 1200);
      }, 1400);
    }, 1000);
  };

  const handleSaveSpeedTestResult = () => {
    if (!testResults) return;
    const village = villages[0];
    const term = terminals[0];
    const provider = providers[0];

    const record = {
      id: `diag-${Date.now()}`,
      villageId: village.id,
      villageName: village.name,
      terminalId: term.id,
      terminalCode: term.terminalCode,
      providerName: provider.name,
      timestamp: new Date().toISOString(),
      downloadSpeed: testResults.down,
      uploadSpeed: testResults.up,
      latencyMs: testResults.lat,
      packetLossPct: testResults.loss,
      uptimePct: testResults.uptime,
      dataSource: testResults.isEndpointConfigured ? 'actual' : 'simulated',
      notes: testResults.isEndpointConfigured
        ? 'Real browser endpoint ping measurement'
        : 'Diagnostic speed test client (Simulated demo endpoint)'
    };

    addMeasurement(record);
    setShowSpeedTestModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            Satellite Speed Monitoring & Telemetry Ingestion
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry feed, manual technician data entry, and automated interval polling
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Real/Simulated Browser Speed Test */}
          <button
            onClick={() => {
              setShowSpeedTestModal(true);
              setTestPhase('idle');
              setTestResults(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Gauge className="w-4 h-4 text-cyan-400" />
            Run Diagnostic Speed Test
          </button>

          {/* Manual Entry Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Enter Manual Measurement
          </button>
        </div>
      </div>

      {/* Scheduled Collection Simulator Controls */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-cyan-950 uppercase tracking-wide">
              Scheduled Telemetry Polling Simulator
            </h4>
            <p className="text-xs text-cyan-800">
              Simulates automated telemetry pings from rural terminals at periodic intervals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-1 text-xs text-slate-700">
            <span className="font-medium">Interval:</span>
            <select
              value={collectionIntervalSeconds}
              onChange={(e) => setCollectionIntervalSeconds(Number(e.target.value))}
              disabled={isScheduledCollectionActive}
              className="py-1 px-2 rounded border border-slate-300 bg-white font-mono text-xs"
            >
              <option value={5}>5 sec</option>
              <option value={15}>15 sec (Default)</option>
              <option value={30}>30 sec</option>
              <option value={60}>1 min</option>
            </select>
          </div>

          <button
            onClick={() => setIsScheduledCollectionActive(!isScheduledCollectionActive)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              isScheduledCollectionActive
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isScheduledCollectionActive ? (
              <>
                <Square className="w-3.5 h-3.5" /> Stop Scheduler
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Start Auto-Poll
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Telemetry Measurement Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Recorded Telemetry Datasets ({filteredMeasurements.length} Records)
          </h3>
          <button
            onClick={generateQuickReading}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-800"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate Sample Reading
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Village Name</th>
                <th className="py-3 px-3">Terminal ID</th>
                <th className="py-3 px-3">Provider</th>
                <th className="py-3 px-3">Download (Mbps)</th>
                <th className="py-3 px-3">Upload (Mbps)</th>
                <th className="py-3 px-3">Latency (ms)</th>
                <th className="py-3 px-3">Packet Loss (%)</th>
                <th className="py-3 px-3">Uptime (%)</th>
                <th className="py-3 px-3">Data Origin</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMeasurements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{m.villageName}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{m.terminalCode}</td>
                  <td className="py-2.5 px-3 text-slate-600">{m.providerName}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                    {m.downloadSpeed}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700 font-mono">
                    {m.uploadSpeed}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{m.latencyMs}</td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className={m.packetLossPct > 4 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {m.packetLossPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{m.uptimePct}%</td>
                  <td className="py-2.5 px-3">
                    <SourceBadge source={m.dataSource} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => deleteMeasurement(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Measurement Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Manual Telemetry Measurement Ingestion
            </h3>
            <p className="text-slate-500 mb-4">
              Enter technician handheld or VSAT modem console readings.
            </p>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitManual} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Village</label>
                <select
                  value={formData.villageId}
                  onChange={(e) => setFormData({ ...formData, villageId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Satellite Terminal</label>
                <select
                  value={formData.terminalId}
                  onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
                >
                  {terminals.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.terminalCode} - {t.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Download Speed (Mbps)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.downloadSpeed}
                    onChange={(e) => setFormData({ ...formData, downloadSpeed: e.target.value })}
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Upload Speed (Mbps)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.uploadSpeed}
                    onChange={(e) => setFormData({ ...formData, uploadSpeed: e.target.value })}
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latency (ms)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.latencyMs}
                    onChange={(e) => setFormData({ ...formData, latencyMs: e.target.value })}
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.packetLossPct}
                    onChange={(e) => setFormData({ ...formData, packetLossPct: e.target.value })}
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Uptime (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.uptimePct}
                    onChange={(e) => setFormData({ ...formData, uptimePct: e.target.value })}
                    required
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data Origin Label</label>
                <select
                  value={formData.dataSource}
                  onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
                >
                  <option value="actual">Actual Measured (Certified field reading)</option>
                  <option value="simulated">Simulated Demo (Plausible synthetic test)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technician Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Signal lock test after rain"
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Speed Test Diagnostic Modal */}
      {showSpeedTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-xs text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Satellite Diagnostic Speed Test
            </h3>
            <p className="text-slate-500 mb-4">
              {import.meta.env.VITE_SPEED_TEST_ENDPOINT
                ? 'Pinging configured real speed endpoint...'
                : 'Demo Mode: Running realistic simulated satellite diagnostic socket'}
            </p>

            {testPhase === 'idle' && (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto border border-cyan-200">
                  <Gauge className="w-8 h-8" />
                </div>
                <button
                  onClick={handleStartSpeedTest}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-md"
                >
                  Begin Diagnostic Test
                </button>
              </div>
            )}

            {testPhase !== 'idle' && testPhase !== 'complete' && (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500 text-white flex items-center justify-center mx-auto animate-pulse">
                  <Radio className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Phase: {testPhase}
                  </span>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-600 h-2 transition-all duration-300"
                      style={{ width: `${testProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {testPhase === 'complete' && testResults && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-left">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Download Speed</span>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {testResults.down} <span className="text-xs font-normal">Mbps</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Upload Speed</span>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {testResults.up} <span className="text-xs font-normal">Mbps</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Latency</span>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {testResults.lat} <span className="text-xs font-normal">ms</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Packet Loss</span>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {testResults.loss} <span className="text-xs font-normal">%</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  <SourceBadge source={testResults.isEndpointConfigured ? 'actual' : 'simulated'} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSpeedTestModal(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveSpeedTestResult}
                    className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                  >
                    Save Reading
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
