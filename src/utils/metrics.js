import { evaluateLagrangeBasis } from './lagrange.js';

/**
 * Calculates Mean Absolute Error (MAE)
 * MAE = (1/n) * \sum |actual - predicted|
 *
 * @param {Array<{actual: number, predicted: number}>} pairs
 * @returns {number|null}
 */
export function calculateMAE(pairs) {
  if (!pairs || pairs.length === 0) return null;
  const sumAbsDiff = pairs.reduce((acc, p) => acc + Math.abs(p.actual - p.predicted), 0);
  return Number((sumAbsDiff / pairs.length).toFixed(3));
}

/**
 * Calculates Root Mean Squared Error (RMSE)
 * RMSE = \sqrt{ (1/n) * \sum (actual - predicted)^2 }
 *
 * @param {Array<{actual: number, predicted: number}>} pairs
 * @returns {number|null}
 */
export function calculateRMSE(pairs) {
  if (!pairs || pairs.length === 0) return null;
  const sumSqDiff = pairs.reduce((acc, p) => acc + Math.pow(p.actual - p.predicted, 2), 0);
  return Number(Math.sqrt(sumSqDiff / pairs.length).toFixed(3));
}

/**
 * Calculates Mean Absolute Percentage Error (MAPE)
 * Safely ignores or handles actual == 0 to avoid division by zero.
 * MAPE = (1/valid_count) * \sum |(actual - predicted) / actual| * 100%
 *
 * @param {Array<{actual: number, predicted: number}>} pairs
 * @returns {{ mape: number|null, zeroCount: number, validCount: number }}
 */
export function calculateMAPE(pairs) {
  if (!pairs || pairs.length === 0) return { mape: null, zeroCount: 0, validCount: 0 };
  let zeroCount = 0;
  let sumPct = 0;
  let validCount = 0;

  for (const p of pairs) {
    if (typeof p.actual !== 'number' || isNaN(p.actual) || Math.abs(p.actual) < 1e-6) {
      zeroCount++;
      continue;
    }
    const pctError = Math.abs((p.actual - p.predicted) / p.actual) * 100;
    sumPct += pctError;
    validCount++;
  }

  const mape = validCount > 0 ? Number((sumPct / validCount).toFixed(2)) : null;
  return { mape, zeroCount, validCount };
}

/**
 * Performs Leave-One-Out Cross-Validation (LOOCV) on a set of actual measurement points.
 * For each point k in {0, ..., n-1}:
 *   - Construct Lagrange polynomial from all points except k
 *   - Predict at x_k
 *   - Compute error: |actual_k - predicted_k|
 *
 * @param {Array<{x: number, y: number, timestamp?: string}>} points
 * @returns {Object} LOOCV results, errors per point, MAE, RMSE, MAPE
 */
export function performLOOCV(points) {
  if (!points || points.length < 3) {
    return {
      success: false,
      error: 'At least 3 measurement points are required for held-out cross-validation.'
    };
  }

  const sorted = [...points].sort((a, b) => a.x - b.x);
  const n = sorted.length;
  const validationPairs = [];
  const pointResults = [];

  for (let k = 0; k < n; k++) {
    const heldOut = sorted[k];
    const trainingPoints = sorted.filter((_, idx) => idx !== k);

    // Predict held-out point using trainingPoints
    let predictedY = 0;
    for (let i = 0; i < trainingPoints.length; i++) {
      const { value: li } = evaluateLagrangeBasis(heldOut.x, i, trainingPoints);
      predictedY += trainingPoints[i].y * li;
    }

    const clampedPredicted = Math.max(0, predictedY);
    const absError = Math.abs(heldOut.y - clampedPredicted);
    const pctError = heldOut.y > 0 ? (absError / heldOut.y) * 100 : null;

    validationPairs.push({ actual: heldOut.y, predicted: clampedPredicted });
    pointResults.push({
      index: k,
      x: heldOut.x,
      timestamp: heldOut.timestamp || `Point ${k + 1}`,
      actual: heldOut.y,
      predicted: Number(clampedPredicted.toFixed(2)),
      absError: Number(absError.toFixed(2)),
      pctError: pctError !== null ? Number(pctError.toFixed(2)) : null,
      trainingDegree: trainingPoints.length - 1
    });
  }

  const mae = calculateMAE(validationPairs);
  const rmse = calculateRMSE(validationPairs);
  const { mape, zeroCount } = calculateMAPE(validationPairs);

  return {
    success: true,
    numPoints: n,
    pointResults,
    mae,
    rmse,
    mape,
    zeroCount
  };
}

/**
 * Computes an overall Estimate Reliability Indicator (0-100%) and warnings
 * based on polynomial degree, point density, interval span, and held-out accuracy.
 *
 * @param {Object} params
 * @param {boolean} params.isExtrapolation
 * @param {number} params.numPoints
 * @param {number} params.targetX
 * @param {number} params.minX
 * @param {number} params.maxX
 * @param {number|null} params.mape
 * @returns {{ score: number, status: 'HIGH'|'MODERATE'|'LOW'|'CRITICAL', warnings: string[], factors: Object }}
 */
export function evaluateEstimateReliability({
  isExtrapolation,
  numPoints,
  targetX,
  minX,
  maxX,
  mape
}) {
  const warnings = [];
  let score = 95; // Starting score

  // Extrapolation penalty
  if (isExtrapolation) {
    score -= 65;
    warnings.push('Target time is outside the interpolation bounds (Extrapolation). Numerical estimate is severely unstable.');
  }

  // Polynomial degree penalty (Runge's Phenomenon)
  if (numPoints > 5) {
    const penalty = (numPoints - 5) * 8;
    score -= Math.min(30, penalty);
    warnings.push(`High polynomial degree (${numPoints - 1}). Susceptible to edge oscillations (Runge's phenomenon).`);
  } else if (numPoints === 2) {
    score -= 10;
    warnings.push('Linear interpolation (2 points). Simple linear estimate assumes constant rate of change.');
  }

  // Proximity to interval edge
  if (!isExtrapolation && maxX > minX) {
    const normalizedPos = (targetX - minX) / (maxX - minX);
    if (normalizedPos < 0.08 || normalizedPos > 0.92) {
      score -= 10;
      warnings.push('Target time is close to boundary nodes. Polynomial sensitivity is elevated near edges.');
    }
  }

  // Cross-validation MAPE penalty
  if (typeof mape === 'number') {
    if (mape > 30) {
      score -= 25;
      warnings.push(`Historical held-out error is high (MAPE: ${mape.toFixed(1)}%). Underlying telemetry has substantial variability.`);
    } else if (mape > 15) {
      score -= 12;
      warnings.push(`Historical held-out error is moderate (MAPE: ${mape.toFixed(1)}%).`);
    }
  }

  const finalScore = Math.max(5, Math.min(100, Math.round(score)));

  let status = 'HIGH';
  if (finalScore < 40 || isExtrapolation) status = 'CRITICAL';
  else if (finalScore < 65) status = 'LOW';
  else if (finalScore < 82) status = 'MODERATE';

  return {
    score: finalScore,
    status,
    warnings,
    factors: {
      degreeFactor: numPoints <= 4 ? 'Optimal (Quadratic/Cubic)' : numPoints === 2 ? 'Linear' : 'High Degree (Caution)',
      interpolationBounded: !isExtrapolation,
      crossValidationFit: mape !== null ? `${mape.toFixed(1)}% MAPE` : 'N/A'
    }
  };
}
