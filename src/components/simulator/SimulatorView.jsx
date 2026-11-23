import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateLagrangeInterpolation,
  generateLagrangeCurve
} from '../../utils/lagrange';
import {
  FlaskConical,
  RotateCcw,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot
} from 'recharts';

export function SimulatorView() {
  const { measurements, selectedVillageId, villages, t } = useApp();

  const currentVillageId = selectedVillageId !== 'all' ? selectedVillageId : (villages[0]?.id || '');

  // Baseline points for this village
  const baselinePoints = useMemo(() => {
    const list = measurements
      .filter((m) => m.villageId === currentVillageId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const t0 = new Date(list[0]?.timestamp || 0).getTime();
    return list.slice(0, 6).map((m, idx) => ({
      id: `sim-node-${idx}`,
      x: Number(((new Date(m.timestamp).getTime() - t0) / (3600 * 1000)).toFixed(1)),
      y: m.downloadSpeed,
      isSynthetic: false
    }));
  }, [measurements, currentVillageId]);

  // Sandboxed local state for simulator
  const [simPoints, setSimPoints] = useState(() => baselinePoints);
  const [targetSimHour, setTargetSimHour] = useState(3.0);

  // Synchronize when baseline changes if pristine
  const handleReset = () => {
    setSimPoints(baselinePoints);
    setTargetSimHour(3.0);
  };

  // Update speed of existing point
  const handleUpdateSpeed = (id, newSpeed) => {
    setSimPoints((prev) =>
      prev.map((pt) => (pt.id === id ? { ...pt, y: Math.max(0, parseFloat(newSpeed) || 0) } : pt))
    );
  };

  // Remove point
  const handleRemovePoint = (id) => {
    if (simPoints.length <= 2) return;
    setSimPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // Add synthetic point
  const handleAddSynthetic = () => {
    const lastX = simPoints.length > 0 ? Math.max(...simPoints.map((p) => p.x)) : 0;
    const newPt = {
      id: `synthetic-${Date.now()}`,
      x: Number((lastX + 2.0).toFixed(1)),
      y: Number((25.0 + Math.random() * 20).toFixed(1)),
      isSynthetic: true
    };
    setSimPoints((prev) => [...prev, newPt].sort((a, b) => a.x - b.x));
  };

  // Compute interpolation for simulator
  const simResult = useMemo(() => {
    if (simPoints.length < 2) return null;
    return calculateLagrangeInterpolation(simPoints, targetSimHour);
  }, [simPoints, targetSimHour]);

  // Compute curve
  const simCurve = useMemo(() => {
    if (simPoints.length < 2) return [];
    return generateLagrangeCurve(simPoints, 100, false);
  }, [simPoints]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-600" />
            {t('simTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('simDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSynthetic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Synthetic Node
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {t('resetToOriginal')}
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>{t('simulatedChangesNotice')}</span>
      </div>

      {/* Real-time Simulator Curve Plot */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Dynamic Lagrange Curve Response (n = {simPoints.length - 1})
            </h3>
            <p className="text-xs text-slate-500">
              Drag points or edit speeds below to observe immediate mathematical polynomial flexing
            </p>
          </div>
          {simResult && (
            <div className="font-mono text-xs bg-cyan-50 border border-cyan-200 text-cyan-900 px-3 py-1 rounded-lg">
              Estimated at x={targetSimHour}h: <strong className="text-sm text-cyan-950 font-extrabold">{simResult.estimatedY} Mbps</strong>
            </div>
          )}
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={simCurve} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="x" stroke="#64748b" fontSize={11} unit="h" />
              <YAxis stroke="#64748b" fontSize={11} unit="M" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b132b',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px'
                }}
                formatter={(val) => [`${val} Mbps`, 'What-If Curve P(x)']}
              />
              <Line
                type="monotone"
                dataKey="curveY"
                stroke="#0891b2"
                strokeWidth={2.5}
                dot={false}
              />
              {/* Simulated Nodes */}
              {simPoints.map((pt, idx) => (
                <ReferenceDot
                  key={idx}
                  x={pt.x}
                  y={pt.y}
                  r={6}
                  fill={pt.isSynthetic ? '#f59e0b' : '#0f172a'}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
              {/* Target Dot */}
              {simResult && (
                <ReferenceDot
                  x={targetSimHour}
                  y={simResult.estimatedY}
                  r={8}
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth={2.5}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Point Editor Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Interactive Node Controls (Drag Sliders to Alter Speeds)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {simPoints.map((pt, index) => (
            <div
              key={pt.id}
              className={`p-3 rounded-xl border transition ${
                pt.isSynthetic ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-slate-800">
                  Node #{index + 1} (t = {pt.x}h)
                </span>
                <div className="flex items-center gap-1">
                  {pt.isSynthetic && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                      Synthetic
                    </span>
                  )}
                  {simPoints.length > 2 && (
                    <button
                      onClick={() => handleRemovePoint(pt.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                  <span>Speed Value:</span>
                  <strong className="text-slate-900">{pt.y} Mbps</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="0.5"
                  value={pt.y}
                  onChange={(e) => handleUpdateSpeed(pt.id, e.target.value)}
                  className="w-full h-1.5 bg-slate-300 rounded appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
