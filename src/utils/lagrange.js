/**
 * Lagrange Interpolation Numerical Methods Engine
 *
 * Formula:
 * P(x) = \sum_{i=0}^{n} y_i \cdot L_i(x)
 * where:
 * L_i(x) = \prod_{j=0, j \neq i}^{n} \frac{x - x_j}{x_i - x_j}
 */

/**
 * Validates the input points for Lagrange Interpolation.
 * Points must have numeric x and y values, at least 2 points,
 * and strictly distinct x coordinates.
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePoints(points) {
  if (!Array.isArray(points) || points.length < 2) {
    return { valid: false, error: 'At least 2 distinct measurement points are required for interpolation.' };
  }

  const seenX = new Set();
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (typeof pt.x !== 'number' || isNaN(pt.x)) {
      return { valid: false, error: `Point ${i + 1} has an invalid or non-numeric timestamp/x value.` };
    }
    if (typeof pt.y !== 'number' || isNaN(pt.y)) {
      return { valid: false, error: `Point ${i + 1} has an invalid or non-numeric speed/y value.` };
    }
    // Check duplicate x
    const xRounded = Math.round(pt.x * 100000) / 100000;
    if (seenX.has(xRounded)) {
      return {
        valid: false,
        error: `Duplicate timestamp detected at x = ${pt.x}. Lagrange interpolation requires distinct x coordinates to prevent division by zero.`
      };
    }
    seenX.add(xRounded);
  }

  return { valid: true };
}

/**
 * Evaluates the i-th Lagrange Basis Polynomial L_i(x)
 * L_i(x) = \prod_{j=0, j \neq i}^{n} \frac{x - x_j}{x_i - x_j}
 *
 * @param {number} x Target x coordinate
 * @param {number} i Index of the basis polynomial
 * @param {Array<{x: number, y: number}>} points
 * @returns {{ value: number, terms: Array<{ j: number, xj: number, numerator: number, denominator: number, factor: number }> }}
 */
export function evaluateLagrangeBasis(x, i, points) {
  const n = points.length;
  const xi = points[i].x;
  let liValue = 1.0;
  const terms = [];

  for (let j = 0; j < n; j++) {
    if (j === i) continue;
    const xj = points[j].x;
    const denominator = xi - xj;

    if (Math.abs(denominator) < 1e-12) {
      throw new Error(`Division by zero in Lagrange basis L_${i}: x_${i} is identical to x_${j}`);
    }

    const numerator = x - xj;
    const factor = numerator / denominator;
    liValue *= factor;

    terms.push({
      j,
      xj,
      numerator,
      denominator,
      factor
    });
  }

  return { value: liValue, terms };
}

/**
 * Computes Lagrange Interpolation at target x with full educational step breakdown.
 *
 * @param {Array<{x: number, y: number, label?: string}>} rawPoints Measurement points
 * @param {number} targetX Target x coordinate
 * @returns {Object} Interpolation result with basis polynomial steps, warnings, extrapolation check
 */
export function calculateLagrangeInterpolation(rawPoints, targetX) {
  const validation = validatePoints(rawPoints);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  if (typeof targetX !== 'number' || isNaN(targetX)) {
    return {
      success: false,
      error: 'Target estimation time/x must be a valid number.'
    };
  }

  // Sort points chronologically by x
  const points = [...rawPoints].sort((a, b) => a.x - b.x);
  const n = points.length;
  const minX = points[0].x;
  const maxX = points[n - 1].x;

  // Extrapolation detection
  const isExtrapolation = targetX < minX || targetX > maxX;
  let extrapolationMessage = null;
  if (isExtrapolation) {
    if (targetX > maxX) {
      extrapolationMessage = `Target time (${targetX.toFixed(2)}) is AFTER the latest measurement (${maxX.toFixed(2)}). This is EXTRAPOLATION. Polynomials rapidly diverge outside measured intervals; speed cannot be forecast.`;
    } else {
      extrapolationMessage = `Target time (${targetX.toFixed(2)}) is BEFORE the earliest measurement (${minX.toFixed(2)}). This is EXTRAPOLATION. Polynomial estimates outside the measured interval are unreliable.`;
    }
  }

  // High polynomial degree warning (Runge's phenomenon)
  const isHighDegree = n >= 5;
  const rungeWarning = isHighDegree
    ? `High polynomial degree (n = ${n - 1}, ${n} points). Higher-degree Lagrange polynomials are susceptible to Runge's phenomenon (wild oscillations near endpoints). Consider selecting 3 to 4 points around target time for optimal stability.`
    : null;

  // Calculate basis polynomials L_i(x) and total P(x)
  let estimatedY = 0;
  let basisSum = 0; // Should sum to ~1.0 (partition of unity)
  const basisDetails = [];

  for (let i = 0; i < n; i++) {
    const yi = points[i].y;
    const { value: li, terms } = evaluateLagrangeBasis(targetX, i, points);
    const contribution = yi * li;

    estimatedY += contribution;
    basisSum += li;

    basisDetails.push({
      i,
      point: points[i],
      xi: points[i].x,
      yi: points[i].y,
      li,
      contribution,
      terms
    });
  }

  // Physical clamp: internet speed and latency cannot physically be negative in the real world
  const rawEstimatedY = estimatedY;
  const clampedY = Math.max(0, estimatedY);
  const wasClamped = rawEstimatedY < 0;

  // Find nearest surrounding points
  let previousPoint = null;
  let nextPoint = null;
  for (let i = 0; i < n; i++) {
    if (points[i].x <= targetX) {
      previousPoint = points[i];
    }
    if (points[i].x >= targetX && !nextPoint) {
      nextPoint = points[i];
    }
  }

  return {
    success: true,
    targetX,
    estimatedY: Number(clampedY.toFixed(3)),
    rawEstimatedY: Number(rawEstimatedY.toFixed(3)),
    wasClamped,
    degree: n - 1,
    numPoints: n,
    minX,
    maxX,
    isExtrapolation,
    extrapolationMessage,
    rungeWarning,
    basisSum: Number(basisSum.toFixed(6)), // Partition of unity check
    basisDetails,
    sortedPoints: points,
    surrounding: {
      previous: previousPoint,
      next: nextPoint
    }
  };
}

/**
 * Generates an array of interpolated points to plot the smooth Lagrange curve
 * alongside actual measurement markers.
 *
 * @param {Array<{x: number, y: number}>} points
 * @param {number} samples Number of sampling steps across the interval
 * @param {boolean} extendBeyondInterval Whether to sample 10% beyond ends to show divergence
 * @returns {Array<{x: number, curveY: number, rawCurveY: number}>}
 */
export function generateLagrangeCurve(points, samples = 120, extendBeyondInterval = false) {
  if (!points || points.length < 2) return [];

  const sorted = [...points].sort((a, b) => a.x - b.x);
  const minX = sorted[0].x;
  const maxX = sorted[sorted.length - 1].x;
  const span = maxX - minX;

  const startX = extendBeyondInterval ? minX - span * 0.08 : minX;
  const endX = extendBeyondInterval ? maxX + span * 0.08 : maxX;
  const step = (endX - startX) / (samples - 1);

  const curve = [];
  for (let i = 0; i < samples; i++) {
    const curX = startX + i * step;
    let yVal = 0;
    for (let j = 0; j < sorted.length; j++) {
      const { value: lj } = evaluateLagrangeBasis(curX, j, sorted);
      yVal += sorted[j].y * lj;
    }
    curve.push({
      x: Number(curX.toFixed(2)),
      curveY: Math.max(0, Number(yVal.toFixed(2))),
      rawCurveY: Number(yVal.toFixed(2))
    });
  }

  return curve;
}
