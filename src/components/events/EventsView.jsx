import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BellRing,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Radio,
  Sliders,
  Send,
  CheckCircle2,
  Info
} from 'lucide-react';

export function EventsView() {
  const {
    events,
    thresholds,
    setThresholds,
    dispatchAlertNotification,
    t
  } = useApp();

  const [showConfig, setShowConfig] = useState(false);
  const [localThresholds, setLocalThresholds] = useState(thresholds);

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    setThresholds(localThresholds);
    setShowConfig(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-rose-600" />
            {t('eventsTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('detectedAnomalies')} &bull; Distinguishes confirmed link outages from test server failures
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
        >
          <Sliders className="w-3.5 h-3.5" /> Configure Detection Rules
        </button>
      </div>

      {/* Disclaimers & Integrity Note */}
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong>Outage Diagnostic Logic: </strong>
          <span>{t('outageVsFailNotice')}</span>
        </div>
      </div>

      {/* Configurable Threshold Drawer */}
      {showConfig && (
        <form onSubmit={handleSaveThresholds} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Rule Threshold Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Acceptable Speed (Mbps)</label>
              <input
                type="number"
                step="0.5"
                value={localThresholds.minDownloadSpeedMbps}
                onChange={(e) => setLocalThresholds({ ...localThresholds, minDownloadSpeedMbps: parseFloat(e.target.value) })}
                className="w-full p-2 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Acceptable Latency (ms)</label>
              <input
                type="number"
                step="10"
                value={localThresholds.maxLatencyMs}
                onChange={(e) => setLocalThresholds({ ...localThresholds, maxLatencyMs: parseFloat(e.target.value) })}
                className="w-full p-2 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Packet Loss (%)</label>
              <input
                type="number"
                step="0.5"
                value={localThresholds.maxPacketLossPct}
                onChange={(e) => setLocalThresholds({ ...localThresholds, maxPacketLossPct: parseFloat(e.target.value) })}
                className="w-full p-2 rounded border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sudden Drop Trigger (%)</label>
              <input
                type="number"
                step="5"
                value={localThresholds.speedDropPercentage}
                onChange={(e) => setLocalThresholds({ ...localThresholds, speedDropPercentage: parseFloat(e.target.value) })}
                className="w-full p-2 rounded border border-slate-300 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
            >
              Apply Rules
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <span className="font-semibold text-slate-700">All Satellite Links Nominal</span>
            <p>No sudden speed drops, transponder congestion, or connection outages detected in current view.</p>
          </div>
        ) : (
          events.map((evt) => {
            const isCritical = evt.severity === 'critical';
            const isWarning = evt.severity === 'warning';

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border transition shadow-sm bg-white ${
                  isCritical ? 'border-l-4 border-l-rose-500' : isWarning ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500">
                    {new Date(evt.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3">{evt.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    Village: <strong className="text-slate-800">{evt.villageName}</strong>
                  </span>

                  <button
                    onClick={() => dispatchAlertNotification(evt)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                  >
                    <Send className="w-3 h-3 text-cyan-600" />
                    {t('simulateAlertBtn')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
