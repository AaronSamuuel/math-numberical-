import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateLagrangeBasis } from '../../utils/lagrange';
import { SourceBadge } from '../common/Badge';
import {
  GitCompare,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  ArrowUpDown
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
  ReferenceDot
} from 'recharts';

export function ComparisonView() {
  const {
    villages,
    measurements,
    selectedVillageId,
    setSelectedVillageId,
    t
  } = useApp();

  const currentVillageId = selectedVillageId !== 'all' ? selectedVillageId : (villages[0]?.id || '');
  const villageHistory = useMemo(() => {
    return measurements
      .filter((m) => m.villageId === currentVillageId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [measurements, currentVillageId]);

  // Leave-One-Out validation pairs across all historical points
  // For each actual point k, calculate the interpolated value using the other points!
  const comparisonData = useMemo(() => {
    if (villageHistory.length < 3) return [];

    const t0 = new Date(villageHistory[0].timestamp).getTime();
    const normalizedPoints = villageHistory.map((m) => ({
      id: m.id,
      timestamp: m.timestamp,
      x: Number(((new Date(m.timestamp).getTime() - t0) / (3600 * 1000)).toFixed(2)),
      actual: m.downloadSpeed,
      source: m.dataSource
    }));

    return normalizedPoints.map((pt, k) => {
      // Training points excluding point k (Held-Out Cross Validation)
      const training = normalizedPoints.filter((_, idx) => idx !== k);
      let predicted = 0;
      for (let i = 0; i < training.length; i++) {
        const { value: li } = evaluateLagrangeBasis(pt.x, i, training);
        predicted += training[i].actual * li;
      }

      const clampedPred = Math.max(0, Number(predicted.toFixed(2)));
      const absError = Math.abs(pt.actual - clampedPred);

      // Safe division by zero for percentage error
      let pctError = null;
      let pctErrorDisplay = 'N/A';
      if (typeof pt.actual === 'number' && pt.actual > 0.05) {
        pctError = Number(((absError / pt.actual) * 100).toFixed(2));
        pctErrorDisplay = `${pctError}%`;
      } else {
        pctErrorDisplay = 'Undefined (Actual \u2248 0)';
      }

      let validationStatus = 'PASS';
      if (pctError !== null && pctError > 25) validationStatus = 'HIGH_VARIANCE';
      else if (pctError !== null && pctError > 12) validationStatus = 'MODERATE';

      return {
        id: pt.id,
        timestamp: pt.timestamp,
        x: pt.x,
        actual: pt.actual,
        predicted: clampedPred,
        absError: Number(absError.toFixed(2)),
        pctError,
        pctErrorDisplay,
        validationStatus,
        source: pt.source
      };
    });
  }, [villageHistory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-600" />
            {t('compTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            Held-out validation: compares each actual field reading against the interpolation derived from neighboring records
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Village:</span>
          <select
            value={currentVillageId}
            onChange={(e) => setSelectedVillageId(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
          >
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Chart: Actual Markers vs Interpolated Line */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Actual Measurements vs Held-Out Interpolated Speed Curve
            </h3>
            <p className="text-xs text-slate-500">
              Black solid dots represent ground-truth actual measurements; dashed blue line represents the interpolated curve
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-900 font-bold">
              <span className="w-3 h-3 rounded-full bg-slate-900"></span> Actual Measured
            </span>
            <span className="flex items-center gap-1.5 text-cyan-600 font-bold">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-cyan-600"></span> Interpolated Estimate
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={comparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
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
                formatter={(val, name) => [
                  `${val} Mbps`,
                  name === 'actual' ? 'Actual Measured' : 'Interpolated Estimate'
                ]}
              />
              {/* Dashed line for estimates */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#0284c7' }}
              />
              {/* Solid markers for actual values */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0f172a"
                strokeWidth={1.5}
                dot={{ r: 6, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Actual vs Estimated Telemetry Comparison Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Evaluates individual errors without dividing by zero on zero-throughput outages
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Timestamp / Node</th>
                <th className="py-2.5 px-3">Actual Speed</th>
                <th className="py-2.5 px-3">Interpolated Speed</th>
                <th className="py-2.5 px-3">Absolute Error |y - \u0177|</th>
                <th className="py-2.5 px-3">Percentage Error (%)</th>
                <th className="py-2.5 px-3">Data Origin</th>
                <th className="py-2.5 px-3">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {comparisonData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="font-bold text-slate-900">t = {row.x}h</span> (
                    {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {row.actual} <span className="font-normal text-slate-500 text-[11px]">Mbps</span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-cyan-700">
                    {row.predicted} <span className="font-normal text-slate-500 text-[11px]">Mbps</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {row.absError} Mbps
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        row.pctError !== null && row.pctError > 20
                          ? 'text-rose-600'
                          : row.pctError !== null && row.pctError > 10
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {row.pctErrorDisplay}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <SourceBadge source={row.source} />
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    {row.validationStatus === 'PASS' && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Valid Fit (&lt;12%)
                      </span>
                    )}
                    {row.validationStatus === 'MODERATE' && (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Moderate Deviation
                      </span>
                    )}
                    {row.validationStatus === 'HIGH_VARIANCE' && (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        High Variance Node
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
