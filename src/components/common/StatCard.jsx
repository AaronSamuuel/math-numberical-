import React from 'react';

export function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  badgeText
}) {
  const colorMap = {
    blue: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">{value}</span>
            {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-500">{subtitle}</span>}
        {badgeText && (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            {badgeText}
          </span>
        )}
        {trend && (
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}
