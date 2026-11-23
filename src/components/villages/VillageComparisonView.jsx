import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VillageMap } from './VillageMap';
import { calculateConnectivityScore } from '../../utils/scoring';
import {
  MapPin,
  Sliders,
  Trophy,
  Award,
  Layers,
  HelpCircle,
  Activity,
  ArrowUpDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export function VillageComparisonView() {
  const {
    villages,
    terminals,
    providers,
    measurements,
    selectedVillageId,
    setSelectedVillageId,
    scoreWeights,
    setScoreWeights,
    t
  } = useApp();

  // Local state for weight sliders
  const [weights, setWeights] = useState(scoreWeights);

  // Compute stats and scores for each village
  const villageRankings = useMemo(() => {
    return villages.map((v) => {
      const vMeas = measurements.filter((m) => m.villageId === v.id);
      const speeds = vMeas.map((m) => m.downloadSpeed);
      const uploads = vMeas.map((m) => m.uploadSpeed);
      const latencies = vMeas.map((m) => m.latencyMs);
      const losses = vMeas.map((m) => m.packetLossPct);
      const uptimes = vMeas.map((m) => m.uptimePct);

      const avgDown = speeds.length ? Number((speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1)) : 0;
      const avgUp = uploads.length ? Number((uploads.reduce((a, b) => a + b, 0) / uploads.length).toFixed(1)) : 0;
      const avgLat = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 600;
      const avgLoss = losses.length ? Number((losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(1)) : 5.0;
      const avgUptime = uptimes.length ? Number((uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(1)) : 95.0;

      const terminal = terminals.find((t) => t.villageId === v.id);
      const provider = providers.find((p) => p.id === v.providerId);

      // Multi-factor score
      const scoreObj = calculateConnectivityScore({
        downloadSpeed: avgDown,
        uploadSpeed: avgUp,
        latencyMs: avgLat,
        packetLossPct: avgLoss,
        uptimePct: avgUptime
      }, weights);

      return {
        id: v.id,
        name: v.name,
        nameTamil: v.nameTamil,
        district: v.district,
        terrain: v.terrain,
        terminalCode: terminal?.terminalCode || 'VSAT-01',
        providerName: provider?.name.split('/')[0] || 'ISRO GSAT',
        constellation: provider?.type.split(' ')[0] || 'GEO',
        avgDown,
        avgUp,
        avgLat,
        avgLoss,
        avgUptime,
        score: scoreObj.score,
        grade: scoreObj.grade,
        badgeColor: scoreObj.badgeColor,
        subScores: scoreObj.subScores
      };
    }).sort((a, b) => b.score - a.score);
  }, [villages, terminals, providers, measurements, weights]);

  // Chart data for speed & latency comparisons
  const comparisonChartData = villageRankings.map((v) => ({
    name: v.name.split(' ')[0],
    download: v.avgDown,
    upload: v.avgUp,
    latency: v.avgLat,
    loss: v.avgLoss
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-600" />
            {t('villageCompTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            Geographic Leaflet mapping and transparent multi-factor connectivity performance scoring
          </p>
        </div>

        <span className="text-xs font-mono bg-cyan-50 border border-cyan-200 text-cyan-900 px-3 py-1 rounded-lg">
          {villages.length} Remote Stations Monitored
        </span>
      </div>

      {/* Interactive Map */}
      <VillageMap
        villages={villages}
        measurements={measurements}
        selectedVillageId={selectedVillageId}
        onSelectVillage={(id) => setSelectedVillageId(id)}
      />

      {/* Transparent Multi-Factor Score Configuration Sliders */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              {t('scoreFormulaTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('scoreFormulaDesc')}
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Score = w\u2081\u22C5Speed + w\u2082\u22C5Latency + w\u2083\u22C5Loss + w\u2084\u22C5Uptime
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <div className="flex justify-between font-mono mb-1">
              <span className="text-slate-700 font-semibold">{t('weightSpeed')}:</span>
              <strong className="text-cyan-700">{Math.round(weights.speed * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={weights.speed}
              onChange={(e) => setWeights({ ...weights, speed: parseFloat(e.target.value) })}
              className="w-full accent-cyan-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-mono mb-1">
              <span className="text-slate-700 font-semibold">{t('weightLatency')}:</span>
              <strong className="text-cyan-700">{Math.round(weights.latency * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={weights.latency}
              onChange={(e) => setWeights({ ...weights, latency: parseFloat(e.target.value) })}
              className="w-full accent-cyan-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-mono mb-1">
              <span className="text-slate-700 font-semibold">{t('weightLoss')}:</span>
              <strong className="text-cyan-700">{Math.round(weights.packetLoss * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.05"
              value={weights.packetLoss}
              onChange={(e) => setWeights({ ...weights, packetLoss: parseFloat(e.target.value) })}
              className="w-full accent-cyan-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-mono mb-1">
              <span className="text-slate-700 font-semibold">{t('weightUptime')}:</span>
              <strong className="text-cyan-700">{Math.round(weights.uptime * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.05"
              value={weights.uptime}
              onChange={(e) => setWeights({ ...weights, uptime: parseFloat(e.target.value) })}
              className="w-full accent-cyan-600"
            />
          </div>
        </div>
      </div>

      {/* Village Rankings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            {t('rankingsTitle')}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Village Name</th>
                <th className="py-2.5 px-3">Terminal & Provider</th>
                <th className="py-2.5 px-3">Avg Download</th>
                <th className="py-2.5 px-3">Avg Latency</th>
                <th className="py-2.5 px-3">Packet Loss</th>
                <th className="py-2.5 px-3">Uptime</th>
                <th className="py-2.5 px-3">Connectivity Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {villageRankings.map((v, idx) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedVillageId(v.id)}
                  className={`cursor-pointer transition hover:bg-slate-50/80 ${
                    selectedVillageId === v.id ? 'bg-cyan-50/70 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{v.name}</div>
                    <div className="text-[10px] text-slate-500">{v.district} &bull; {v.terrain}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-slate-800">{v.terminalCode}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {v.providerName} ({v.constellation})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {v.avgDown} Mbps
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {v.avgLat} ms
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {v.avgLoss}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {v.avgUptime}%
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-cyan-950">
                        {v.score}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                        {v.grade}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed Throughput Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Village Bandwidth Comparison (Download & Upload)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Throughput in Mbps</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="M" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b132b',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend />
                <Bar dataKey="download" name="Download" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="upload" name="Upload" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Comparison Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Average Satellite Round-Trip Latency
          </h3>
          <p className="text-xs text-slate-500 mb-4">Propagation delay in milliseconds (GEO vs LEO)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b132b',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val) => [`${val} ms`, 'Avg Latency']}
                />
                <Bar dataKey="latency" name="Latency (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
