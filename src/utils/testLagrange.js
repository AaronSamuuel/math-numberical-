/**
 * Test Suite for Lagrange Interpolation and Error Metrics
 * Run with: node src/utils/testLagrange.js
 */

import {
  validatePoints,
  evaluateLagrangeBasis,
  calculateLagrangeInterpolation
} from './lagrange.js';
import {
  calculateMAE,
  calculateRMSE,
  calculateMAPE,
  performLOOCV
} from './metrics.js';

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`\x1b[32m✔ PASS\x1b[0m - ${testName}`);
    passed++;
  } else {
    console.error(`\x1b[31m✖ FAIL\x1b[0m - ${testName}`);
  }
}

console.log('\n--- TESTING LAGRANGE INTERPOLATION ENGINE ---');

// Test 1: Linear Interpolation passing exactly through endpoints
const linearPoints = [
  { x: 0, y: 10 },
  { x: 10, y: 50 }
];
const resMidLinear = calculateLagrangeInterpolation(linearPoints, 5);
assert(resMidLinear.success, 'Linear: calculation succeeds');
assert(Math.abs(resMidLinear.estimatedY - 30) < 1e-3, `Linear midpoint at x=5 gives y=30 (got: ${resMidLinear.estimatedY})`);
assert(!resMidLinear.isExtrapolation, 'Linear midpoint is not extrapolation');
assert(Math.abs(resMidLinear.basisSum - 1.0) < 1e-6, 'Partition of unity property holds (\u03A3 L_i = 1.0)');

// Test 2: Quadratic Interpolation y = x^2 (Points: (0,0), (2,4), (4,16)) at x = 3 -> y = 9
const quadPoints = [
  { x: 0, y: 0 },
  { x: 2, y: 4 },
  { x: 4, y: 16 }
];
const resQuad = calculateLagrangeInterpolation(quadPoints, 3);
assert(Math.abs(resQuad.estimatedY - 9) < 1e-3, `Quadratic at x=3 for y=x^2 gives y=9 (got: ${resQuad.estimatedY})`);
assert(resQuad.degree === 2, 'Polynomial degree is quadratic (n=2)');

// Test 3: Kronecker Delta interpolation property P(x_i) = y_i exactly
for (let i = 0; i < quadPoints.length; i++) {
  const pt = quadPoints[i];
  const evalAtNode = calculateLagrangeInterpolation(quadPoints, pt.x);
  assert(
    Math.abs(evalAtNode.estimatedY - pt.y) < 1e-3,
    `Exact interpolation at node x=${pt.x} matches ground truth y=${pt.y}`
  );
}

// Test 4: Extrapolation detection
const resExtrapBefore = calculateLagrangeInterpolation(linearPoints, -2);
assert(resExtrapBefore.isExtrapolation, 'Extrapolation correctly flagged for x < minX');

const resExtrapAfter = calculateLagrangeInterpolation(linearPoints, 15);
assert(resExtrapAfter.isExtrapolation, 'Extrapolation correctly flagged for x > maxX');
assert(resExtrapAfter.extrapolationMessage.includes('EXTRAPOLATION'), 'Clear warning message present in output');

// Test 5: Rejection of duplicate timestamps
const dupPoints = [
  { x: 5, y: 20 },
  { x: 5, y: 35 }
];
const valDup = validatePoints(dupPoints);
assert(!valDup.valid, 'Duplicate timestamps rejected to prevent division by zero');
assert(valDup.error.includes('Duplicate timestamp'), 'Proper error message for duplicate timestamps');

// Test 6: Rejection of less than 2 points
const valFew = validatePoints([{ x: 1, y: 10 }]);
assert(!valFew.valid, 'Less than 2 points rejected');

// Test 7: LOOCV (Leave-One-Out Cross-Validation)
const loocvSample = [
  { x: 0, y: 10 },
  { x: 2, y: 20 },
  { x: 4, y: 30 },
  { x: 6, y: 40 }
]; // Collinear data: any 3 points predict the held-out point with zero error
const loocvRes = performLOOCV(loocvSample);
assert(loocvRes.success, 'LOOCV completes successfully');
assert(loocvRes.mae < 1e-2, `Collinear LOOCV MAE is approx 0 (got: ${loocvRes.mae})`);
assert(loocvRes.rmse < 1e-2, `Collinear LOOCV RMSE is approx 0 (got: ${loocvRes.rmse})`);

// Test 8: Safe MAPE calculation with actual = 0 (no division by zero)
const pairsWithZero = [
  { actual: 0, predicted: 10 },
  { actual: 20, predicted: 22 }
];
const mapeRes = calculateMAPE(pairsWithZero);
assert(mapeRes.zeroCount === 1, 'MAPE safely identifies zero actuals');
assert(mapeRes.validCount === 1, 'MAPE processes valid non-zero actuals');
assert(Math.abs(mapeRes.mape - 10) < 1e-2, `MAPE calculated safely as 10% on valid points (got: ${mapeRes.mape}%)`);

console.log(`\nTEST SUMMARY: ${passed} / ${total} tests passed.`);
if (passed === total) {
  console.log('\x1b[32mALL NUMERICAL METHODS TESTS PASSED PERFECTLY!\x1b[0m\n');
} else {
  process.exit(1);
}
