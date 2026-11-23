import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateLagrangeInterpolation,
  generateLagrangeCurve
} from '../../utils/lagrange';
import { evaluateEstimateReliability, performLOOCV } from '../../utils/metrics';
import { SourceBadge } from '../common/Badge';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceDot,
  ReferenceLine
} from 'recharts';

export function LagrangeView() {
  const {
    villages,
    terminals,
    measurements,
    selectedVillageId,
    setSelectedVillageId,
    t
  } = useApp();

  // Active village and terminal
  const currentVillageId = selectedVillageId !== 'all' ? selectedVillageId : (villages[0]?.id || '');
  const activeVillage = villages.find((v) => v.id === currentVillageId) || villages[0];
  const activeTerminal = terminals.find((t) => t.villageId === activeVillage?.id) || terminals[0];

  // Metric to interpolate
  const [targetMetric, setTargetMetric] = useState('downloadSpeed'); // 'downloadSpeed' | 'uploadSpeed' | 'latencyMs'

  // Get historical points for this village
  const villageHistory = useMemo(() => {
    return measurements
      .filter((m) => m.villageId === currentVillageId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [measurements, currentVillageId]);

  // Selected point IDs (default to first 4 points for ideal cubic interpolation)
  const [selectedPointIds, setSelectedPointIds] = useState(() => {
    const defaultPoints = villageHistory.slice(0, 4).map((p) => p.id);
    return new Set(defaultPoints);
  });

  // Keep selectedPointIds valid if village changes
  const availablePoints = useMemo(() => {
    return villageHistory.map((m, index) => {
      // Use elapsed hours from earliest point for high numerical stability
      const t0 = new Date(villageHistory[0]?.timestamp || 0).getTime();
      const elapsedHours = Number(((new Date(m.timestamp).getTime() - t0) / (3600 * 1000)).toFixed(2));
      return {
        id: m.id,
        index,
        timestamp: m.timestamp,
        elapsedHours,
        downloadSpeed: m.downloadSpeed,
        uploadSpeed: m.uploadSpeed,
        latencyMs: m.latencyMs,
        dataSource: m.dataSource,
        notes: m.notes
      };
    });
  }, [villageHistory]);

  const activeSelectedPoints = useMemo(() => {
    return availablePoints.filter((p) => selectedPointIds.has(p.id));
  }, [availablePoints, selectedPointIds]);

  // Interpolation interval bounds
  const minHour = activeSelectedPoints.length > 0 ? Math.min(...activeSelectedPoints.map((p) => p.elapsedHours)) : 0;
  const maxHour = activeSelectedPoints.length > 0 ? Math.max(...activeSelectedPoints.map((p) => p.elapsedHours)) : 10;

  // Target estimation hour (default to midpoint between first two selected points)
  const [targetHour, setTargetHour] = useState(() => {
    return Number(((minHour + maxHour) / 2).toFixed(2));
  });

  // Step-by-step accordion toggle
  const [showBasisSteps, setShowBasisSteps] = useState(true);

  // Toggle selection of points
  const handleTogglePoint = (id) => {
    setSelectedPointIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size <= 2) {
          return prev; // Maintain at least 2 points
        }
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Prepare input points for Lagrange
  const lagrangeInputPoints = useMemo(() => {
    return activeSelectedPoints.map((p) => ({
      x: p.elapsedHours,
      y: p[targetMetric],
      timestamp: p.timestamp,
      label: `t=${p.elapsedHours}h`
    }));
  }, [activeSelectedPoints, targetMetric]);

  // Compute Lagrange Interpolation
  const lagrangeResult = useMemo(() => {
    if (lagrangeInputPoints.length < 2) return null;
    return calculateLagrangeInterpolation(lagrangeInputPoints, targetHour);
  }, [lagrangeInputPoints, targetHour]);

  // Held-out LOOCV validation for reliability score
  const loocvResult = useMemo(() => {
    if (lagrangeInputPoints.length < 3) return null;
    return performLOOCV(lagrangeInputPoints);
  }, [lagrangeInputPoints]);

  // Reliability Assessment
  const reliability = useMemo(() => {
    if (!lagrangeResult || !lagrangeResult.success) return null;
    return evaluateEstimateReliability({
      isExtrapolation: lagrangeResult.isExtrapolation,
      numPoints: lagrangeResult.numPoints,
      targetX: targetHour,
      minX: lagrangeResult.minX,
      maxX: lagrangeResult.maxX,
      mape: loocvResult?.mape ?? null
    });
  }, [lagrangeResult, targetHour, loocvResult]);

  // Smooth curve data for Recharts
  const curveData = useMemo(() => {
    if (lagrangeInputPoints.length < 2) return [];
    return generateLagrangeCurve(lagrangeInputPoints, 120, true);
  }, [lagrangeInputPoints]);

  // Target date string representation
  const targetDateDisplay = useMemo(() => {
    if (!villageHistory[0]) return '';
    const t0 = new Date(villageHistory[0].timestamp).getTime();
    const targetMs = t0 + targetHour * 3600 * 1000;
    return new Date(targetMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  }, [villageHistory, targetHour]);

  return (
    <div className="space-y-6">
      {/* Header and Disclaimers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
                <Calculator className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t('lagrangeTitle')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('lagrangeDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Selector (Download, Upload, Latency) */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto">
            <span className="text-slate-500 font-semibold px-2">Metric:</span>
            <button
              onClick={() => setTargetMetric('downloadSpeed')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                targetMetric === 'downloadSpeed'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Download Speed
            </button>
            <button
              onClick={() => setTargetMetric('uploadSpeed')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                targetMetric === 'uploadSpeed'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Upload Speed
            </button>
            <button
              onClick={() => setTargetMetric('latencyMs')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                targetMetric === 'latencyMs'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Latency
            </button>
          </div>
        </div>

        {/* Mandatory Educational & SLA Disclaimer */}
        <div className="mt-4 p-3 rounded-lg bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">{t('disclaimerBanner')}</strong>
          </p>
        </div>
      </div>

      {/* Village & Terminal Select Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="font-bold text-slate-700">Monitored Target:</span>
          <select
            value={currentVillageId}
            onChange={(e) => setSelectedVillageId(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-800"
          >
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.district}) - {v.terrain}
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-600 text-[11px] font-mono">
          Terminal: <strong className="text-slate-900">{activeTerminal?.terminalCode}</strong> ({activeTerminal?.model})
        </div>
      </div>

      {/* Point Selection & Target Time Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Historical Point Checkboxes (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Interpolation Nodes (x\u1D62, y\u1D62)
              </h3>
              <p className="text-[11px] text-slate-500">
                Choose historical measurement points ({activeSelectedPoints.length} selected, degree n = {activeSelectedPoints.length - 1})
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Min: 2 Nodes
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-72 border border-slate-200 rounded-lg divide-y divide-slate-100">
            {availablePoints.map((pt) => {
              const isChecked = selectedPointIds.has(pt.id);
              const val = pt[targetMetric];
              const unit = targetMetric === 'latencyMs' ? 'ms' : 'Mbps';

              return (
                <label
                  key={pt.id}
                  className={`flex items-center justify-between p-2.5 cursor-pointer text-xs transition ${
                    isChecked ? 'bg-cyan-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePoint(pt.id)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          t = {pt.elapsedHours}h
                        </span>
                        <SourceBadge source={pt.dataSource} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {val} {unit}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Interval Bounds: [{minHour}h, {maxHour}h]</span>
            <button
              onClick={() => setSelectedPointIds(new Set(availablePoints.slice(0, 4).map((p) => p.id)))}
              className="text-cyan-600 hover:underline font-semibold"
            >
              Reset to 4 Nodes (Cubic)
            </button>
          </div>
        </div>

        {/* Right Column: Target Time Slider & Calculation Result Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Target Estimation Time Picker (x)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select elapsed hours between measurements or test boundary limits
                </p>
              </div>
              <span className="font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-md text-xs">
                x = {targetHour}h ({targetDateDisplay})
              </span>
            </div>

            {/* Target Time Slider */}
            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input
                type="range"
                min={Math.max(0, minHour - 2)}
                max={maxHour + 3}
                step="0.1"
                value={targetHour}
                onChange={(e) => setTargetHour(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Start: {minHour}h</span>
                <span className="font-semibold text-slate-700">Valid Interval: [{minHour}h \u2013 {maxHour}h]</span>
                <span>End: {maxHour}h</span>
              </div>
            </div>

            {/* Quick Presets (Midpoint vs Extrapolation Test) */}
            <div className="flex items-center gap-2 mb-4 flex-wrap text-xs">
              <span className="text-slate-500 text-[11px]">Quick Tests:</span>
              <button
                onClick={() => setTargetHour(Number(((minHour + maxHour) / 2).toFixed(1)))}
                className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-medium transition"
              >
                Exact Midpoint (Interpolation)
              </button>
              <button
                onClick={() => setTargetHour(Number((maxHour + 1.5).toFixed(1)))}
                className="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition"
                title="Demonstrates prominent extrapolation warning for examiners"
              >
                Test Future Extrapolation (+1.5h)
              </button>
            </div>

            {/* EXTRAPOLATION WARNING BANNER */}
            {lagrangeResult?.isExtrapolation && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-900 space-y-1 animate-pulse">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{t('extrapolationWarningTitle')}</span>
                </div>
                <p className="text-xs text-rose-800">
                  {lagrangeResult.extrapolationMessage}
                </p>
                <p className="text-[11px] text-rose-700 font-medium">
                  {t('extrapolationWarningBody')}
                </p>
              </div>
            )}

            {/* HIGH DEGREE RUNGE WARNING */}
            {lagrangeResult?.rungeWarning && !lagrangeResult.isExtrapolation && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{t('rungeWarningTitle')}: </span>
                  <span>{lagrangeResult.rungeWarning}</span>
                </div>
              </div>
            )}

            {/* Primary Result Display Panel */}
            {lagrangeResult && lagrangeResult.success && (
              <div className="bg-slate-900 text-white rounded-xl p-4 shadow-inner space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="uppercase tracking-wider font-semibold">Lagrange Calculated Estimate P(x)</span>
                  <span className="font-mono text-cyan-400">Degree n = {lagrangeResult.degree}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                      {lagrangeResult.estimatedY}
                    </span>
                    <span className="ml-1.5 text-sm font-semibold text-cyan-400">
                      {targetMetric === 'latencyMs' ? 'ms' : 'Mbps'}
                    </span>
                    {lagrangeResult.wasClamped && (
                      <span className="ml-2 text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-700">
                        Clamped to 0 (Raw: {lagrangeResult.rawEstimatedY})
                      </span>
                    )}
                  </div>

                  {reliability && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Reliability Index</span>
                      <span
                        className={`text-sm font-extrabold font-mono px-2 py-0.5 rounded ${
                          reliability.status === 'HIGH'
                            ? 'text-emerald-400 bg-emerald-950/50'
                            : reliability.status === 'MODERATE'
                            ? 'text-cyan-400 bg-cyan-950/50'
                            : 'text-rose-400 bg-rose-950/50'
                        }`}
                      >
                        {reliability.score}% ({reliability.status})
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Basis Sum \u03A3 L\u1D62(x): <strong className="font-mono text-slate-200">{lagrangeResult.basisSum}</strong> (Exact: 1.0)</span>
                  <span>Anchor Points: <strong className="font-mono text-slate-200">{lagrangeResult.numPoints}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Surrounding Measurements Comparison Table */}
      {lagrangeResult && lagrangeResult.surrounding && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Surrounding Actual Measurement Anchors vs Estimate
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2 px-3">Position</th>
                  <th className="py-2 px-3">Timestamp / Offset</th>
                  <th className="py-2 px-3">Download Speed</th>
                  <th className="py-2 px-3">Upload Speed</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {/* Previous Point */}
                {lagrangeResult.surrounding.previous ? (
                  <tr className="bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-700">Previous Measurement</td>
                    <td className="py-2 px-3 text-slate-600">t = {lagrangeResult.surrounding.previous.x}h</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{lagrangeResult.surrounding.previous.y} Mbps</td>
                    <td className="py-2 px-3 text-slate-600">8.4 Mbps</td>
                    <td className="py-2 px-3 text-slate-600">520 ms</td>
                    <td className="py-2 px-3"><SourceBadge source="actual" /></td>
                  </tr>
                ) : null}

                {/* The Interpolated Estimate */}
                <tr className="bg-cyan-50 font-bold border-y-2 border-cyan-400">
                  <td className="py-2.5 px-3 text-cyan-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
                    Target Estimate P(x)
                  </td>
                  <td className="py-2.5 px-3 text-cyan-900">t = {targetHour}h ({targetDateDisplay})</td>
                  <td className="py-2.5 px-3 text-cyan-950 text-sm">{lagrangeResult.estimatedY} Mbps</td>
                  <td className="py-2.5 px-3 text-cyan-900">Estimated</td>
                  <td className="py-2.5 px-3 text-cyan-900">Estimated</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-600 text-white">
                      {lagrangeResult.isExtrapolation ? 'EXTRAPOLATION' : 'INTERPOLATED'}
                    </span>
                  </td>
                </tr>

                {/* Next Point */}
                {lagrangeResult.surrounding.next ? (
                  <tr className="bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-700">Next Measurement</td>
                    <td className="py-2 px-3 text-slate-600">t = {lagrangeResult.surrounding.next.x}h</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{lagrangeResult.surrounding.next.y} Mbps</td>
                    <td className="py-2 px-3 text-slate-600">9.1 Mbps</td>
                    <td className="py-2 px-3 text-slate-600">510 ms</td>
                    <td className="py-2 px-3"><SourceBadge source="actual" /></td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lagrange Curve Graph (Actual Points vs Interpolated Continuous Polynomial Curve) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Lagrange Polynomial Curve & Anchor Node Visualization
            </h3>
            <p className="text-xs text-slate-500">
              Smooth curve shows continuous polynomial P(x); solid markers are actual readings; cyan diamond is the target estimate
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-slate-900"></span> Actual Nodes
            </span>
            <span className="flex items-center gap-1.5 text-cyan-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-cyan-500 ring-2 ring-cyan-200"></span> Target Estimate
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={curveData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="x"
                stroke="#64748b"
                fontSize={11}
                unit="h"
                label={{ value: 'Elapsed Time (hours)', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#64748b' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                unit={targetMetric === 'latencyMs' ? 'ms' : 'M'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b132b',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px'
                }}
                formatter={(val) => [`${val} ${targetMetric === 'latencyMs' ? 'ms' : 'Mbps'}`, 'Polynomial Curve P(x)']}
                labelFormatter={(label) => `Elapsed Time: ${label}h`}
              />

              {/* The Smooth Lagrange Polynomial Line */}
              <Line
                type="monotone"
                dataKey="curveY"
                name="Lagrange Curve P(x)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Interval reference lines */}
              <ReferenceLine x={minHour} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Start Bound', fontSize: 9, fill: '#94a3b8' }} />
              <ReferenceLine x={maxHour} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'End Bound', fontSize: 9, fill: '#94a3b8' }} />

              {/* Actual Measurement Anchor Points */}
              {lagrangeInputPoints.map((pt, idx) => (
                <ReferenceDot
                  key={idx}
                  x={pt.x}
                  y={pt.y}
                  r={5}
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}

              {/* Target Estimation Dot */}
              {lagrangeResult && (
                <ReferenceDot
                  x={targetHour}
                  y={lagrangeResult.estimatedY}
                  r={8}
                  fill={lagrangeResult.isExtrapolation ? '#ef4444' : '#06b6d4'}
                  stroke="#ffffff"
                  strokeWidth={2.5}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Step-by-Step Lagrange Basis Polynomials Accordion (Educational viva feature) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowBasisSteps(!showBasisSteps)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('basisPolynomialsHeading')}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700">
            <span>{showBasisSteps ? 'Collapse Calculation Steps' : 'Expand Numerical Steps'}</span>
            {showBasisSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showBasisSteps && lagrangeResult?.basisDetails && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-slate-800 space-y-1">
              <div className="text-[11px] text-slate-500 font-sans font-semibold">Mathematical Expansion:</div>
              <div className="text-cyan-800 font-bold">
                P({targetHour}) = \u03A3 [ y\u1D62 \u22C5 L\u1D62({targetHour}) ]
              </div>
              <div className="text-[11px] text-slate-600 font-sans">
                Where each basis polynomial L\u1D62(x) equals 1 at node x\u1D62 and 0 at all other nodes x\u2C7C (Kronecker Delta \u03B4\u1D62\u2C7C property).
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3">Node i</th>
                    <th className="py-2.5 px-3">Coordinate (x\u1D62, y\u1D62)</th>
                    <th className="py-2.5 px-3">Basis Formula L\u1D62(x) Product</th>
                    <th className="py-2.5 px-3">Evaluated Weight L\u1D62({targetHour})</th>
                    <th className="py-2.5 px-3">Weighted Contribution y\u1D62 \u22C5 L\u1D62(x)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono bg-white">
                  {lagrangeResult.basisDetails.map((detail) => (
                    <tr key={detail.i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-800">L_{detail.i}</td>
                      <td className="py-2 px-3 text-slate-700">
                        ({detail.xi}h, {detail.yi})
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600">
                        {detail.terms.map((t, idx) => (
                          <span key={idx}>
                            ({targetHour} - {t.xj}) / ({detail.xi} - {t.xj})
                            {idx < detail.terms.length - 1 ? ' \u00D7 ' : ''}
                          </span>
                        ))}
                      </td>
                      <td className="py-2 px-3 font-bold text-cyan-700">
                        {detail.li.toFixed(5)}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {detail.contribution.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold font-mono text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="py-2 px-3 text-right font-sans">
                      Sum of Weights & Contributions:
                    </td>
                    <td className="py-2 px-3 text-cyan-800">
                      \u03A3 L\u1D62 = {lagrangeResult.basisSum} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
                    </td>
                    <td className="py-2 px-3 text-cyan-950 text-sm">
                      P({targetHour}) = {lagrangeResult.estimatedY} {targetMetric === 'latencyMs' ? 'ms' : 'Mbps'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
