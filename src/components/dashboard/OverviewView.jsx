import React from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { StatCard } from '../common/StatCard';
import { SourceBadge, StatusBadge } from '../common/Badge';
import {
  MapPin,
  Radio,
  Download,
  Upload,
  Gauge,
  Activity,
  Percent,
  Clock,
  Sparkles,
  Info,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export function OverviewView({ onNavigate }) {
  const {
    overallKPIs,
    filteredMeasurements,
    villages,
    generateQuickReading,
    lastUpdated,
    t
  } = useApp();

  // Prepare chart data chronologically
  const chartData = [...filteredMeasurements]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-15)
    .map((m) => ({
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      download: m.downloadSpeed,
      upload: m.uploadSpeed,
      latency: m.latencyMs,
      source: m.dataSource,
      terminal: m.terminalCode
    }));

  // Aggregated village data for comparison bar chart
  const villageStats = villages.map((v) => {
    const vMeas = filteredMeasurements.filter((m) => m.villageId === v.id);
    const avgDown = vMeas.length
      ? Number((vMeas.reduce((a, b) => a + b.downloadSpeed, 0) / vMeas.length).toFixed(1))
      : 0;
    const avgLat = vMeas.length
      ? Math.round(vMeas.reduce((a, b) => a + b.latencyMs, 0) / vMeas.length)
      : 0;
    return {
      name: v.name.split(' ')[0],
      download: avgDown,
      latency: avgLat
    };
  });

  return (
    <div className="space-y-6">
      {/* College Project & Telemetry Truth Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-2xl p-5 shadow-lg border border-navy-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                NUMERICAL METHODS VIVA DEMO
              </span>
              <span className="text-xs text-slate-300">Western & Eastern Ghats Remote Network</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              Satellite Internet Speed Estimator & Telemetry Monitoring
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Continuous broadband velocity estimation across terrain-isolated village VSATs using
              rigorous <strong className="text-cyan-400">Lagrange Polynomial Interpolation</strong>.
              All data points are explicitly labeled as actual measured or simulated demo readings.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => onNavigate('lagrange')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition shadow-md shadow-cyan-950 active:scale-95"
            >
              Open Lagrange Engine &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={t('totalVillages')}
          value={overallKPIs.totalVillages}
          subtitle="Coverage: Tamil Nadu Hills"
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title={t('activeTerminals')}
          value={`${overallKPIs.activeTerminals} / ${villages.length}`}
          subtitle="VSAT Dishes Operational"
          icon={Radio}
          color="green"
        />
        <StatCard
          title={t('avgDownload')}
          value={overallKPIs.avgDownload}
          unit="Mbps"
          subtitle="Downlink Throughput"
          icon={Download}
          color="blue"
        />
        <StatCard
          title={t('avgUpload')}
          value={overallKPIs.avgUpload}
          unit="Mbps"
          subtitle="Uplink Throughput"
          icon={Upload}
          color="purple"
        />
        <StatCard
          title={t('avgLatency')}
          value={overallKPIs.avgLatency}
          unit="ms"
          subtitle="Round-Trip Time"
          icon={Gauge}
          color="amber"
        />
        <StatCard
          title={t('avgPacketLoss')}
          value={overallKPIs.avgPacketLoss}
          unit="%"
          subtitle="Link Reliability"
          icon={Percent}
          color={overallKPIs.avgPacketLoss > 3 ? 'rose' : 'green'}
        />
        <StatCard
          title={t('avgUptime')}
          value={overallKPIs.avgUptime}
          unit="%"
          subtitle="SLA Availability"
          icon={Activity}
          color="green"
        />
        <StatCard
          title={t('connectivityStatus')}
          value={overallKPIs.status}
          subtitle={`Updated: ${lastUpdated.toLocaleTimeString()}`}
          icon={Clock}
          color={overallKPIs.status === 'ONLINE' ? 'green' : overallKPIs.status === 'DEGRADED' ? 'amber' : 'rose'}
        />
      </div>

      {/* Telemetry Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Speed Timeline (Download & Upload) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Satellite Downlink & Uplink Telemetry Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Recorded speed variations across consecutive timestamp windows
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {chartData.length} Readings Plotted
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} unit="M" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b132b',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val, name) => [`${val} Mbps`, name === 'download' ? 'Download' : 'Upload']}
                />
                <Area
                  type="monotone"
                  dataKey="download"
                  name="download"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#downloadGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="upload"
                  name="upload"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#uploadGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Village Average Download Speed Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Village Bandwidth Comparison</h3>
            <p className="text-xs text-slate-500">Average measured download speed (Mbps)</p>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageStats} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} unit="M" />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b132b',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val) => [`${val} Mbps`, 'Avg Download']}
                />
                <Bar dataKey="download" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Measurements Table with Explicit Source Badges */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Latest Recorded Telemetry Feed</h3>
            <p className="text-xs text-slate-500">
              Transparently displaying data origins (Actual Measured vs Simulated Demo)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('monitoring')}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-800"
            >
              View Full Monitoring Log &rarr;
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Village & Location</th>
                <th className="py-2.5 px-3">Terminal Code</th>
                <th className="py-2.5 px-3">Download</th>
                <th className="py-2.5 px-3">Upload</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">Packet Loss</th>
                <th className="py-2.5 px-3">Data Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMeasurements.slice(0, 7).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {m.villageName}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{m.terminalCode}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                    {m.downloadSpeed} <span className="font-normal text-slate-500">Mbps</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700 font-mono">
                    {m.uploadSpeed} <span className="font-normal text-slate-500">Mbps</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{m.latencyMs} ms</td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className={m.packetLossPct > 3 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {m.packetLossPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <SourceBadge source={m.dataSource} />
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
