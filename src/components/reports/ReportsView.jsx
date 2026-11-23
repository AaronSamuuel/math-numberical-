import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateSatelliteReport } from '../../utils/pdfGenerator';
import { calculateLagrangeInterpolation } from '../../utils/lagrange';
import { performLOOCV } from '../../utils/metrics';
import { calculateConnectivityScore } from '../../utils/scoring';
import { FileText, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export function ReportsView() {
  const {
    villages,
    terminals,
    measurements,
    events,
    selectedVillageId,
    setSelectedVillageId,
    scoreWeights,
    showToast,
    t
  } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);

  const currentVillageId = selectedVillageId !== 'all' ? selectedVillageId : (villages[0]?.id || '');
  const village = villages.find((v) => v.id === currentVillageId) || villages[0];
  const terminal = terminals.find((t) => t.villageId === village?.id) || terminals[0];

  const villageMeasurements = measurements
    .filter((m) => m.villageId === village?.id)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const handleDownloadReport = () => {
    setIsGenerating(true);
    try {
      // Compute interpolation details for the report
      let lagrangeResult = null;
      let accuracyMetrics = null;

      if (villageMeasurements.length >= 2) {
        const t0 = new Date(villageMeasurements[0].timestamp).getTime();
        const pts = villageMeasurements.map((m) => ({
          x: Number(((new Date(m.timestamp).getTime() - t0) / (3600 * 1000)).toFixed(2)),
          y: m.downloadSpeed
        }));
        const midHour = (pts[0].x + pts[pts.length - 1].x) / 2;
        lagrangeResult = calculateLagrangeInterpolation(pts, midHour);
        if (pts.length >= 3) {
          accuracyMetrics = performLOOCV(pts);
        }
      }

      // Compute connectivity score
      const speeds = villageMeasurements.map((m) => m.downloadSpeed);
      const uploads = villageMeasurements.map((m) => m.uploadSpeed);
      const latencies = villageMeasurements.map((m) => m.latencyMs);
      const losses = villageMeasurements.map((m) => m.packetLossPct);
      const uptimes = villageMeasurements.map((m) => m.uptimePct);

      const avgDown = speeds.length ? Number((speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1)) : 0;
      const avgUp = uploads.length ? Number((uploads.reduce((a, b) => a + b, 0) / uploads.length).toFixed(1)) : 0;
      const avgLat = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 520;
      const avgLoss = losses.length ? Number((losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(1)) : 1.0;
      const avgUptime = uptimes.length ? Number((uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(1)) : 99.0;

      const connectivityScore = calculateConnectivityScore({
        downloadSpeed: avgDown,
        uploadSpeed: avgUp,
        latencyMs: avgLat,
        packetLossPct: avgLoss,
        uptimePct: avgUptime
      }, scoreWeights);

      generateSatelliteReport({
        village,
        terminal,
        measurements: villageMeasurements,
        lagrangeResult,
        accuracyMetrics,
        connectivityScore,
        events: events.filter((e) => e.villageId === village?.id)
      });

      showToast(`PDF Dossier for ${village?.name} downloaded successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF report.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            {t('reportsTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('reportsDesc')}
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition shadow-md shadow-cyan-950 active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Building PDF...' : t('generatePdfBtn')}
        </button>
      </div>

      {/* Target Village Selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Target Village for Report:</span>
          <select
            value={currentVillageId}
            onChange={(e) => setSelectedVillageId(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
          >
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.district})
              </option>
            ))}
          </select>
        </div>
        <span className="font-mono text-slate-500">
          Available Records: <strong className="text-slate-800">{villageMeasurements.length}</strong>
        </span>
      </div>

      {/* Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-xs space-y-4">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Document Blueprint & Academic Verification
            </h3>
            <p className="text-slate-500 text-[11px]">
              Formatted for official review, viva voce presentations, and technical documentation
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800">Sections Included in PDF:</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>Executive Summary & Village Geographic Metadata</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>Summary Telemetry Metrics (Mean/Peak/Min/Latency/Loss)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>Lagrange Interpolation Basis Polynomial Breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>Held-Out LOOCV Accuracy Metrics (MAE, RMSE, MAPE)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800">Verification & Transparency:</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>Explicit labeling of Actual Measured vs Simulated demo points</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>Extrapolation risk and physical divergence warnings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
                <span>SLA disclaimer on non-independent mathematical approximation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
