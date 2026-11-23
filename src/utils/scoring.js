/**
 * Transparent Village Connectivity Score Engine
 *
 * Computes a normalized 0 - 100 score based on 4 telemetry dimensions:
 * 1. Download & Upload Speed (combined, benchmarked to 50 Mbps down / 15 Mbps up)
 * 2. Latency (benchmarked: < 80ms ideal GEO/LEO, > 600ms poor)
 * 3. Packet Loss (benchmarked: 0% ideal, > 10% poor)
 * 4. Terminal Uptime (benchmarked: 100% ideal, < 90% poor)
 *
 * Score Formula:
 * Score = w_speed * S_speed + w_latency * S_latency + w_loss * S_loss + w_uptime * S_uptime
 * where \sum w_i = 1.0 (100%)
 */

export const DEFAULT_WEIGHTS = {
  speed: 0.35,     // 35% weight on bandwidth throughput
  latency: 0.25,   // 25% weight on ping/response time
  packetLoss: 0.20,// 20% weight on reliability/stability
  uptime: 0.20     // 20% weight on service availability
};

/**
 * Normalizes speed to a 0-100 sub-score.
 * Benchmark target: 50 Mbps down = 85 pts, 100 Mbps = 100 pts.
 */
export function normalizeSpeedScore(downMbps, upMbps) {
  const effectiveDown = Math.max(0, downMbps || 0);
  const effectiveUp = Math.max(0, upMbps || 0);
  
  // Weight download 70%, upload 30%
  const downScore = Math.min(100, (effectiveDown / 60) * 100);
  const upScore = Math.min(100, (effectiveUp / 15) * 100);
  return downScore * 0.7 + upScore * 0.3;
}

/**
 * Normalizes latency to a 0-100 sub-score.
 * In satellite systems:
 *   LEO: 40-90ms (Score 90-100)
 *   GEO good: 500-600ms (Score 50-70)
 *   Degraded: > 750ms (Score < 30)
 */
export function normalizeLatencyScore(latencyMs) {
  if (typeof latencyMs !== 'number' || latencyMs <= 0) return 0;
  if (latencyMs <= 60) return 100;
  if (latencyMs <= 120) return 90 - ((latencyMs - 60) / 60) * 15; // 75 - 90
  if (latencyMs <= 550) return 75 - ((latencyMs - 120) / 430) * 25; // 50 - 75
  if (latencyMs <= 900) return 50 - ((latencyMs - 550) / 350) * 35; // 15 - 50
  return Math.max(0, 15 - ((latencyMs - 900) / 300) * 15);
}

/**
 * Normalizes packet loss to a 0-100 sub-score.
 * 0% = 100, 2% = 85, 5% = 60, >= 10% = 0.
 */
export function normalizePacketLossScore(packetLossPct) {
  const loss = Math.max(0, packetLossPct || 0);
  if (loss === 0) return 100;
  if (loss <= 1) return 95;
  if (loss <= 3) return 80;
  if (loss <= 5) return 60;
  if (loss <= 10) return Math.max(0, 60 - ((loss - 5) / 5) * 60);
  return 0;
}

/**
 * Normalizes uptime percentage to a 0-100 sub-score.
 * 99.9% = 100, 95% = 80, 90% = 50, < 80% = 0.
 */
export function normalizeUptimeScore(uptimePct) {
  const uptime = Math.max(0, Math.min(100, uptimePct || 0));
  if (uptime >= 99.5) return 100;
  if (uptime >= 98.0) return 90 + ((uptime - 98.0) / 1.5) * 10;
  if (uptime >= 95.0) return 75 + ((uptime - 95.0) / 3.0) * 15;
  if (uptime >= 90.0) return 50 + ((uptime - 90.0) / 5.0) * 25;
  return Math.max(0, (uptime / 90.0) * 50);
}

/**
 * Computes composite connectivity score with full explanation breakdown.
 *
 * @param {Object} telemetry
 * @param {number} telemetry.downloadSpeed
 * @param {number} telemetry.uploadSpeed
 * @param {number} telemetry.latencyMs
 * @param {number} telemetry.packetLossPct
 * @param {number} telemetry.uptimePct
 * @param {Object} [weights]
 * @returns {Object} Composite score and sub-scores
 */
export function calculateConnectivityScore(telemetry, weights = DEFAULT_WEIGHTS) {
  const sSpeed = normalizeSpeedScore(telemetry.downloadSpeed, telemetry.uploadSpeed);
  const sLatency = normalizeLatencyScore(telemetry.latencyMs);
  const sLoss = normalizePacketLossScore(telemetry.packetLossPct);
  const sUptime = normalizeUptimeScore(telemetry.uptimePct);

  const totalWeight = weights.speed + weights.latency + weights.packetLoss + weights.uptime;
  const wSpeed = weights.speed / totalWeight;
  const wLatency = weights.latency / totalWeight;
  const wLoss = weights.packetLoss / totalWeight;
  const wUptime = weights.uptime / totalWeight;

  const composite = (sSpeed * wSpeed) + (sLatency * wLatency) + (sLoss * wLoss) + (sUptime * wUptime);
  const score = Math.round(composite * 10) / 10;

  let grade = 'A';
  let badgeColor = 'emerald';
  if (score >= 85) {
    grade = 'A+ (Optimal)';
    badgeColor = 'emerald';
  } else if (score >= 75) {
    grade = 'A (Good)';
    badgeColor = 'cyan';
  } else if (score >= 60) {
    grade = 'B (Fair)';
    badgeColor = 'amber';
  } else if (score >= 45) {
    grade = 'C (Degraded)';
    badgeColor = 'orange';
  } else {
    grade = 'D (Critical)';
    badgeColor = 'rose';
  }

  return {
    score,
    grade,
    badgeColor,
    subScores: {
      speed: Math.round(sSpeed * 10) / 10,
      latency: Math.round(sLatency * 10) / 10,
      packetLoss: Math.round(sLoss * 10) / 10,
      uptime: Math.round(sUptime * 10) / 10
    },
    weights: {
      speed: Math.round(wSpeed * 100),
      latency: Math.round(wLatency * 100),
      packetLoss: Math.round(wLoss * 100),
      uptime: Math.round(wUptime * 100)
    }
  };
}
