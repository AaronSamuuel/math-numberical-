import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates an official, academic & executive quality PDF dossier for satellite telemetry
 * and Lagrange interpolation analysis.
 *
 * @param {Object} data
 * @param {Object} data.village
 * @param {Object} data.terminal
 * @param {Array<Object>} data.measurements
 * @param {Object} [data.lagrangeResult]
 * @param {Object} [data.accuracyMetrics]
 * @param {Object} [data.connectivityScore]
 * @param {Array<Object>} [data.events]
 */
export function generateSatelliteReport({
  village,
  terminal,
  measurements = [],
  lagrangeResult = null,
  accuracyMetrics = null,
  connectivityScore = null,
  events = []
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Header Banner & Project Title
  doc.setFillColor(11, 19, 43); // Dark Navy #0B132B
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SATELLITE INTERNET SPEED ESTIMATOR', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(6, 182, 212); // Cyan #06B6D4
  doc.text('Remote Villages Telemetry & Lagrange Numerical Methods Dossier', 14, 18);

  doc.setFontSize(8);
  doc.setTextColor(200, 210, 225);
  const reportDate = new Date().toLocaleString();
  doc.text(`Generated: ${reportDate} | Academic & Technical Evaluation`, 14, 24);

  currentY = 36;

  // Village & Terminal Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const villageName = village ? `${village.name} (${village.nameTamil || ''})` : 'All Villages Aggregated';
  doc.text(`Village: ${villageName}`, 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const terminalInfo = terminal
    ? `Terminal: ${terminal.terminalCode} | Model: ${terminal.model} | Azimuth: ${terminal.azimuth}\u00B0 | Elevation: ${terminal.elevation}\u00B0`
    : 'Terminal: Multi-terminal Aggregated';
  doc.text(terminalInfo, 18, currentY + 14);

  const locInfo = village
    ? `District: ${village.district}, ${village.state} | Terrain: ${village.terrain || 'Mountainous'} | Elevation: ${village.elevationMeters || 1200}m MSL`
    : 'Regional monitoring network coverage';
  doc.text(locInfo, 18, currentY + 20);

  const scoreText = connectivityScore ? `Connectivity Score: ${connectivityScore.score}/100 (${connectivityScore.grade})` : 'Score: Calculating';
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(scoreText, 18, currentY + 25);

  currentY += 34;

  // Telemetry Statistics Summary
  const validSpeeds = measurements.map(m => m.downloadSpeed).filter(s => typeof s === 'number' && !isNaN(s));
  const avgDown = validSpeeds.length ? (validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length).toFixed(1) : 'N/A';
  const maxDown = validSpeeds.length ? Math.max(...validSpeeds).toFixed(1) : 'N/A';
  const minDown = validSpeeds.length ? Math.min(...validSpeeds).toFixed(1) : 'N/A';

  const validLatencies = measurements.map(m => m.latencyMs).filter(l => typeof l === 'number' && !isNaN(l));
  const avgLat = validLatencies.length ? (validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length).toFixed(0) : 'N/A';

  const validLosses = measurements.map(m => m.packetLossPct).filter(p => typeof p === 'number' && !isNaN(p));
  const avgLoss = validLosses.length ? (validLosses.reduce((a, b) => a + b, 0) / validLosses.length).toFixed(1) : 'N/A';

  doc.autoTable({
    startY: currentY,
    head: [['Total Samples', 'Avg Download', 'Peak Download', 'Min Download', 'Avg Latency', 'Avg Packet Loss']],
    body: [[
      measurements.length.toString(),
      `${avgDown} Mbps`,
      `${maxDown} Mbps`,
      `${minDown} Mbps`,
      `${avgLat} ms`,
      `${avgLoss} %`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [28, 46, 74], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Lagrange Interpolation Section
  if (lagrangeResult && lagrangeResult.success) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('LAGRANGE INTERPOLATION ESTIMATE DETAILS', 14, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Calculated using: P(x) = \u03A3 [y_i \u22C5 L_i(x)], where L_i(x) = \u03A0 [(x - x_j)/(x_i - x_j)]', 14, currentY + 4);

    const estRows = [
      ['Interpolation Polynomial Degree', `n = ${lagrangeResult.degree} (${lagrangeResult.numPoints} anchor points)`],
      ['Estimated Target Download Speed', `${lagrangeResult.estimatedY} Mbps`],
      ['Target Position Status', lagrangeResult.isExtrapolation ? 'EXTRAPOLATION (Unreliable / Outside bounds)' : 'Valid In-Bounds Interpolation'],
      ['Partition of Unity Check (\u03A3 L_i(x))', `${lagrangeResult.basisSum} (Mathematically equal to 1.0)`]
    ];

    if (accuracyMetrics) {
      estRows.push(['Held-Out Validation MAE', `${accuracyMetrics.mae ?? 'N/A'} Mbps`]);
      estRows.push(['Held-Out Validation RMSE', `${accuracyMetrics.rmse ?? 'N/A'} Mbps`]);
      estRows.push(['Held-Out Validation MAPE', accuracyMetrics.mape !== null ? `${accuracyMetrics.mape}%` : 'N/A']);
    }

    doc.autoTable({
      startY: currentY + 7,
      body: estRows,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [51, 65, 85], cellWidth: 80 },
        1: { textColor: [2, 132, 199] }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // Telemetry Measurement Records Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('HISTORICAL MEASUREMENTS & DATA LABELS', 14, currentY);

  const tableData = measurements.slice(0, 12).map((m, idx) => {
    const formattedTime = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    const sourceLabel = m.dataSource === 'actual' ? 'Actual Measured' : m.dataSource === 'simulated' ? 'Simulated Demo' : 'Interpolated';
    return [
      `#${idx + 1}`,
      formattedTime,
      m.terminalCode || 'VSAT-01',
      `${m.downloadSpeed} Mbps`,
      `${m.uploadSpeed} Mbps`,
      `${m.latencyMs} ms`,
      `${m.packetLossPct}%`,
      sourceLabel
    ];
  });

  doc.autoTable({
    startY: currentY + 4,
    head: [['#', 'Timestamp', 'Terminal', 'Down', 'Up', 'Latency', 'Loss', 'Data Source']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [11, 19, 43], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Anomalies / Events Table (if any)
  if (events && events.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('DETECTED CONNECTIVITY ANOMALIES & EVENTS', 14, currentY);

    const eventRows = events.slice(0, 6).map(e => [
      new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      e.severity.toUpperCase(),
      e.title,
      e.description
    ]);

    doc.autoTable({
      startY: currentY + 4,
      head: [['Time', 'Severity', 'Event Type', 'Diagnostic Observation']],
      body: eventRows,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
      columnStyles: { 3: { cellWidth: 90 } },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // Footer Disclaimer
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, currentY, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text('CRITICAL MATHEMATICAL & TELEMETRY DISCLAIMER:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(127, 29, 29);
  const disclaimerText = 'Interpolation is a mathematical approximation between recorded measurements. It does not measure speed independently or guarantee future satellite performance. Simulated measurements are labeled for academic demonstration and do not reflect certified carrier SLAs.';
  doc.text(doc.splitTextToSize(disclaimerText, pageWidth - 36), 18, currentY + 11);

  // Save PDF
  const filename = `Satellite_Speed_Report_${village ? village.name.replace(/\s+/g, '_') : 'Overview'}_${Date.now()}.pdf`;
  doc.save(filename);
}
