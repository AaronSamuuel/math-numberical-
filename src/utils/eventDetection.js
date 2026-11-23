/**
 * Connectivity Event Detection Rule Engine
 */

export const DEFAULT_THRESHOLDS = {
  minDownloadSpeedMbps: 8.0,
  maxLatencyMs: 650.0,
  maxPacketLossPct: 6.0,
  speedDropPercentage: 35.0,
  peakHourStart: 18, // 6 PM
  peakHourEnd: 22    // 10 PM
};

/**
 * Detects connectivity anomalies and events across a chronological series of measurements.
 *
 * @param {Array<Object>} measurements Sorted by timestamp
 * @param {Object} [thresholds] Configurable thresholds
 * @returns {Array<Object>} Detected events with severity, timestamp, type, explanation
 */
export function detectConnectivityEvents(measurements, thresholds = DEFAULT_THRESHOLDS) {
  if (!measurements || measurements.length === 0) return [];

  const sorted = [...measurements].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const events = [];

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;
    const date = new Date(curr.timestamp);
    const hour = date.getHours();

    // 1. Connection Outage vs Measurement Failure
    if (curr.downloadSpeed <= 0.5) {
      if (curr.packetLossPct >= 90) {
        // High packet loss + zero speed = Confirmed Satellite Outage
        events.push({
          id: `evt-${curr.id || i}-outage`,
          villageId: curr.villageId,
          villageName: curr.villageName,
          terminalId: curr.terminalId,
          timestamp: curr.timestamp,
          type: 'CONFIRMED_OUTAGE',
          severity: 'critical',
          title: 'Confirmed Satellite Connection Outage',
          description: `Download speed dropped to ${curr.downloadSpeed} Mbps with ${curr.packetLossPct}% packet loss. Dish link unserviceable.`,
          metrics: { speed: curr.downloadSpeed, packetLoss: curr.packetLossPct, latency: curr.latencyMs }
        });
      } else {
        // Zero speed but low packet loss = Measurement Endpoint / Test Server failure
        events.push({
          id: `evt-${curr.id || i}-test-fail`,
          villageId: curr.villageId,
          villageName: curr.villageName,
          terminalId: curr.terminalId,
          timestamp: curr.timestamp,
          type: 'MEASUREMENT_FAILED',
          severity: 'warning',
          title: 'Measurement Test Server Unreachable',
          description: `Speed test returned 0 Mbps, but terminal ping packet loss was only ${curr.packetLossPct}%. Satellite link may still be up while speed server timed out.`,
          metrics: { speed: curr.downloadSpeed, packetLoss: curr.packetLossPct, latency: curr.latencyMs }
        });
      }
    }

    // 2. Sudden Speed Drop (> threshold % drop from immediate previous)
    if (prev && prev.downloadSpeed > 10 && curr.downloadSpeed > 0) {
      const dropPct = ((prev.downloadSpeed - curr.downloadSpeed) / prev.downloadSpeed) * 100;
      if (dropPct >= thresholds.speedDropPercentage) {
        events.push({
          id: `evt-${curr.id || i}-drop`,
          villageId: curr.villageId,
          villageName: curr.villageName,
          terminalId: curr.terminalId,
          timestamp: curr.timestamp,
          type: 'SUDDEN_SPEED_DROP',
          severity: dropPct >= 60 ? 'critical' : 'warning',
          title: `Sudden Speed Drop (-${dropPct.toFixed(1)}%)`,
          description: `Download speed fell steeply from ${prev.downloadSpeed} Mbps to ${curr.downloadSpeed} Mbps within measurement interval.`,
          metrics: { previousSpeed: prev.downloadSpeed, currentSpeed: curr.downloadSpeed, dropPct: Number(dropPct.toFixed(1)) }
        });
      }
    }

    // 3. Peak-Hour Congestion Slowdown
    const isPeakHour = hour >= thresholds.peakHourStart && hour <= thresholds.peakHourEnd;
    if (isPeakHour && curr.downloadSpeed < thresholds.minDownloadSpeedMbps && curr.downloadSpeed > 0.5) {
      events.push({
        id: `evt-${curr.id || i}-peak`,
        villageId: curr.villageId,
        villageName: curr.villageName,
        terminalId: curr.terminalId,
        timestamp: curr.timestamp,
        type: 'PEAK_SLOWDOWN',
        severity: 'info',
        title: 'Peak-Hour Shared Transponder Congestion',
        description: `Measurement at ${date.toLocaleTimeString()} fell during high traffic hours (18:00 - 22:00) with speed degraded to ${curr.downloadSpeed} Mbps.`,
        metrics: { speed: curr.downloadSpeed, hour }
      });
    }

    // 4. Excessive Latency Spike
    if (curr.latencyMs > thresholds.maxLatencyMs) {
      events.push({
        id: `evt-${curr.id || i}-lat`,
        villageId: curr.villageId,
        villageName: curr.villageName,
        terminalId: curr.terminalId,
        timestamp: curr.timestamp,
        type: 'LATENCY_SPIKE',
        severity: curr.latencyMs > 900 ? 'critical' : 'warning',
        title: `High Latency Detected (${curr.latencyMs} ms)`,
        description: `Round-trip time exceeded configured threshold of ${thresholds.maxLatencyMs} ms. Real-time applications and video calls will buffer.`,
        metrics: { latency: curr.latencyMs, threshold: thresholds.maxLatencyMs }
      });
    }
  }

  // Sort newest first
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
