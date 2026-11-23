import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Brain, CheckCircle2, HelpCircle, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

export function AIInsightsView() {
  const { filteredMeasurements, events, villages, language, t } = useApp();

  // Deterministic, truthful telemetry insight generator
  const insights = useMemo(() => {
    const list = [...filteredMeasurements].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (list.length === 0) return null;

    const speeds = list.map((m) => m.downloadSpeed);
    const avgSpeed = (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1);
    const maxSpeed = Math.max(...speeds).toFixed(1);
    const minSpeed = Math.min(...speeds).toFixed(1);

    const outages = list.filter((m) => m.downloadSpeed <= 0.5 && m.packetLossPct > 50);
    const peakDrops = list.filter((m) => {
      const h = new Date(m.timestamp).getHours();
      return h >= 18 && h <= 22 && m.downloadSpeed < 20;
    });

    const isTamil = language === 'ta';

    return {
      avgSpeed,
      maxSpeed,
      minSpeed,
      totalSamples: list.length,
      outageCount: outages.length,
      peakDropCount: peakDrops.length,
      observations: isTamil ? [
        `பதிவுசெய்யப்பட்ட ${list.length} அளவீடுகளில், அதிகபட்ச பதிவிறக்க வேகம் ${maxSpeed} Mbps மற்றும் குறைந்தபட்சம் ${minSpeed} Mbps ஆகும்.`,
        outages.length > 0
          ? `மொத்தம் ${outages.length} தீவிர இணைப்பு முறிவுகள் பதிவாகியுள்ளன (பாக்கெட் இழப்பு > 50%).`
          : 'கண்காணிப்பு காலத்தில் தீவிர இணைப்பு முறிவுகள் எதுவும் பதிவாகவில்லை.',
        peakDrops.length > 0
          ? `மாலை உச்ச நேரங்களில் (18:00 - 22:00) ${peakDrops.length} வேகக்குறைவு நிகழ்வுகள் பதிவாகியுள்ளன.`
          : 'உச்ச நேரங்களில் பெரிய அளவிலான வேகக்குறைவு இல்லை.'
      ] : [
        `Across ${list.length} recorded telemetry samples, peak measured downlink reached ${maxSpeed} Mbps while minimum dropped to ${minSpeed} Mbps (mean: ${avgSpeed} Mbps).`,
        outages.length > 0
          ? `${outages.length} confirmed satellite link dropouts recorded with packet loss exceeding 50%.`
          : 'Zero total link dropouts detected across current measurement window.',
        peakDrops.length > 0
          ? `${peakDrops.length} measurements during evening peak demand (18:00 - 22:00) showed substantial downlink degradation below 20 Mbps.`
          : 'Evening traffic profiles remained stable with no major congestion dips.'
      ],
      potentialInferences: isTamil ? [
        'உச்ச நேர வேகக்குறைவு என்பது பகிரப்பட்ட செயற்கைக்கோள் டிரான்ஸ்பாண்டர் அலைவரிசை பயன்பாட்டின் அதிகரிப்பைக் குறிக்கலாம்.',
        'அதிக பாக்கெட் இழப்புடன் கூடிய முறிவுகள் வளிமண்டல சமிக்ஞை இழப்பு அல்லது முனைய சீரமைப்பு விலகலினால் ஏற்பட்டிருக்கலாம்.',
        'லாக்ராஞ்ச் இடைச்செருகல் அளவீடுகளுக்கு இடைப்பட்ட போக்கை துல்லியமாக பிரதிபலிக்கிறது; ஆனால் தீவிர அதிர்வுகளை தவிர்க்க 3-4 புள்ளிகள் சிறந்தது.'
      ] : [
        'Evening speed declines coincide with high subscriber contention on shared satellite transponders.',
        'Zero-speed events coupled with elevated packet loss suggest physical dish signal attenuation or temporary gateway switchovers rather than local router disconnects.',
        'Lagrange estimates closely approximate smooth transitions between measurements; using degree n=2 (quadratic) or n=3 (cubic) maintains highest stability without edge divergence.'
      ]
    };
  }, [filteredMeasurements, language]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            {t('aiTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            Truthful, rule-governed telemetry interpretation without hallucinated satellite anomalies
          </p>
        </div>

        <span className="text-xs font-mono bg-cyan-50 border border-cyan-200 text-cyan-900 px-3 py-1 rounded-lg">
          Deterministic Diagnostics Engine
        </span>
      </div>

      {/* Mandatory Truth & Integrity Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs border border-slate-800 space-y-1">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Factual Grounding & Distinction Policy</span>
        </div>
        <p className="text-slate-300">
          {t('aiDisclaimer')}
        </p>
      </div>

      {/* Two Column Diagnostic Breakdown: Factual Observations vs Technical Inferences */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Verified Mathematical & Telemetric Facts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-slate-900 text-sm">
                Category A: Directly Observed Empirical Facts
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-700">
              {insights.observations.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Engineering Inferences (Clearly Labeled as Hypotheses) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <h3 className="font-bold text-slate-900 text-sm">
                Category B: Plausible Telecommunication Inferences
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-700">
              {insights.potentialInferences.map((inf, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{inf}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
