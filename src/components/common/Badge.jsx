import React from 'react';

/**
 * Reusable Badge for data sources and status indicators
 */
export function SourceBadge({ source }) {
  if (source === 'actual') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Actual Measured
      </span>
    );
  }
  if (source === 'simulated') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Simulated Demo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-700">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
      Lagrange Estimate
    </span>
  );
}

export function StatusBadge({ status }) {
  if (status === 'ONLINE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        ONLINE
      </span>
    );
  }
  if (status === 'DEGRADED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        DEGRADED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
      OFFLINE
    </span>
  );
}

export function ExtrapolationBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-400 animate-pulse">
      \u26A0 EXTRAPOLATION WARNING
    </span>
  );
}
