import React from 'react';
import { useApp } from '../../context/AppContext';
import { Filter, Calendar, MapPin, Radio, Shield } from 'lucide-react';

export function FilterBar() {
  const {
    villages,
    terminals,
    providers,
    selectedVillageId,
    setSelectedVillageId,
    selectedTerminalId,
    setSelectedTerminalId,
    selectedProviderId,
    setSelectedProviderId,
    dateRange,
    setDateRange,
    t
  } = useApp();

  // Filter terminals according to selected village if one is picked
  const availableTerminals = selectedVillageId === 'all'
    ? terminals
    : terminals.filter(t => t.villageId === selectedVillageId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 mb-6">
      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
        <Filter className="w-3.5 h-3.5 text-cyan-600" />
        <span>Telemetry Filter Controls</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Village Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            {t('filterVillage')}
          </label>
          <div className="relative">
            <select
              value={selectedVillageId}
              onChange={(e) => {
                setSelectedVillageId(e.target.value);
                setSelectedTerminalId('all'); // reset terminal selection when village changes
              }}
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="all">{t('filterAll')}</option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.district})
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>
        </div>

        {/* Terminal Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            {t('filterTerminal')}
          </label>
          <div className="relative">
            <select
              value={selectedTerminalId}
              onChange={(e) => setSelectedTerminalId(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="all">All Satellite Terminals</option>
              {availableTerminals.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.terminalCode} ({term.model.split(' ')[0]})
                </option>
              ))}
            </select>
            <Radio className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>
        </div>

        {/* Provider Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            {t('filterProvider')}
          </label>
          <div className="relative">
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="all">All Satellite Providers</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.split('/')[0]} ({p.type.split(' ')[0]})
                </option>
              ))}
            </select>
            <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>
        </div>

        {/* Date / Time Range */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            {t('timeRange')}
          </label>
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="all">{t('allTime')}</option>
              <option value="24h">{t('last24Hours')}</option>
              <option value="7d">{t('last7Days')}</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
