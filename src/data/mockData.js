/**
 * Mock & Seed Data for Satellite Internet Speed Estimator
 * Realistically represents remote hill villages across South India (Western & Eastern Ghats).
 */

export const INITIAL_PROVIDERS = [
  {
    id: 'prov-1',
    name: 'ISRO GSAT-19 / BharatNet Satellite',
    type: 'GEO (Geostationary Orbit ~35,786 km)',
    frequencyBand: 'Ka-Band (26.5–40 GHz)',
    nominalDown: 45.0,
    nominalUp: 10.0,
    nominalLatency: 520, // Typical round-trip propagation delay
    status: 'Operational'
  },
  {
    id: 'prov-2',
    name: 'OneWeb LEO Network India',
    type: 'LEO (Low Earth Orbit ~1,200 km)',
    frequencyBand: 'Ku-Band (12–18 GHz)',
    nominalDown: 75.0,
    nominalUp: 15.0,
    nominalLatency: 65,
    status: 'Operational'
  },
  {
    id: 'prov-3',
    name: 'Starlink Community Direct Pilot',
    type: 'LEO (Low Earth Orbit ~550 km)',
    frequencyBand: 'Ka/Ku Phase-Array',
    nominalDown: 110.0,
    nominalUp: 20.0,
    nominalLatency: 48,
    status: 'Pilot Deployment'
  }
];

export const INITIAL_VILLAGES = [
  {
    id: 'vil-1',
    name: 'Valparai High Forest',
    nameTamil: 'வால்பாறை அடர்ந்த வனம்',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    latitude: 10.3264,
    longitude: 76.9554,
    population: 1140,
    elevationMeters: 1190,
    terrain: 'Dense Rainforest Plateau',
    providerId: 'prov-1',
    terminalCode: 'SAT-VLP-01'
  },
  {
    id: 'vil-2',
    name: 'Kolli Hills - Semmedu',
    nameTamil: 'கொல்லிமலை - செம்மேடு',
    district: 'Namakkal',
    state: 'Tamil Nadu',
    latitude: 11.2485,
    longitude: 78.3385,
    population: 960,
    elevationMeters: 1300,
    terrain: 'Cloud Escarpment / 70 Hairpin Bends',
    providerId: 'prov-2',
    terminalCode: 'SAT-KOL-02'
  },
  {
    id: 'vil-3',
    name: 'Jawadhu Hills - Jamunamarathur',
    nameTamil: 'ஜவாது மலை - ஜமுனாமரத்தூர்',
    district: 'Tiruvannamalai',
    state: 'Tamil Nadu',
    latitude: 12.5732,
    longitude: 78.8954,
    population: 820,
    elevationMeters: 850,
    terrain: 'Deciduous Valley Basin',
    providerId: 'prov-1',
    terminalCode: 'SAT-JAW-03'
  },
  {
    id: 'vil-4',
    name: 'Kotagiri Tea Hamlet',
    nameTamil: 'கோத்தகிரி தேயிலை கிராமம்',
    district: 'Nilgiris',
    state: 'Tamil Nadu',
    latitude: 11.4219,
    longitude: 76.8676,
    population: 750,
    elevationMeters: 1790,
    terrain: 'Foggy Shola Forest Plateau',
    providerId: 'prov-3',
    terminalCode: 'SAT-KTG-04'
  },
  {
    id: 'vil-5',
    name: 'Yelagiri - Athanavur',
    nameTamil: 'ஏலகிரி - அத்தனாவூர்',
    district: 'Tirupattur',
    state: 'Tamil Nadu',
    latitude: 12.5833,
    longitude: 78.6333,
    population: 1320,
    elevationMeters: 1050,
    terrain: 'Rocky Hill Basin',
    providerId: 'prov-1',
    terminalCode: 'SAT-YEL-05'
  },
  {
    id: 'vil-6',
    name: 'Pannaikadu Foothill',
    nameTamil: 'பண்ணைக்காடு அடிவாரம்',
    district: 'Dindigul',
    state: 'Tamil Nadu',
    latitude: 10.2789,
    longitude: 77.6389,
    population: 690,
    elevationMeters: 1250,
    terrain: 'Steep Coffee Valley Gorge',
    providerId: 'prov-2',
    terminalCode: 'SAT-PAN-06'
  }
];

export const INITIAL_TERMINALS = [
  {
    id: 'term-1',
    villageId: 'vil-1',
    terminalCode: 'SAT-VLP-01',
    model: 'BharatNet VSAT-Ka 1.2m',
    dishDiameter: '1.2 m Solid Offset',
    azimuth: 142.0,
    elevation: 47.8,
    status: 'ONLINE',
    macAddress: 'D4:8A:2C:91:0F:11'
  },
  {
    id: 'term-2',
    villageId: 'vil-2',
    terminalCode: 'SAT-KOL-02',
    model: 'OneWeb Compact Flat Panel',
    dishDiameter: '0.8 m Phased Array',
    azimuth: 148.5,
    elevation: 51.2,
    status: 'ONLINE',
    macAddress: 'E2:4C:19:64:1B:7A'
  },
  {
    id: 'term-3',
    villageId: 'vil-3',
    terminalCode: 'SAT-JAW-03',
    model: 'BharatNet VSAT-Ku 1.0m',
    dishDiameter: '1.0 m Solid Dish',
    azimuth: 139.2,
    elevation: 45.4,
    status: 'DEGRADED',
    macAddress: 'C8:55:7E:10:98:32'
  },
  {
    id: 'term-4',
    villageId: 'vil-4',
    terminalCode: 'SAT-KTG-04',
    model: 'Starlink Enterprise Flat High-Performance',
    dishDiameter: '0.6 m Motorized Phased Array',
    azimuth: 135.0,
    elevation: 52.0,
    status: 'ONLINE',
    macAddress: 'A0:B1:C2:D3:E4:F5'
  },
  {
    id: 'term-5',
    villageId: 'vil-5',
    terminalCode: 'SAT-YEL-05',
    model: 'BharatNet VSAT-Ka 1.2m',
    dishDiameter: '1.2 m Solid Offset',
    azimuth: 143.1,
    elevation: 48.9,
    status: 'ONLINE',
    macAddress: 'B2:22:33:44:55:66'
  },
  {
    id: 'term-6',
    villageId: 'vil-6',
    terminalCode: 'SAT-PAN-06',
    model: 'OneWeb User Terminal Dual Dome',
    dishDiameter: '0.8 m Active Array',
    azimuth: 146.7,
    elevation: 49.5,
    status: 'ONLINE',
    macAddress: 'CC:77:88:99:AA:BB'
  }
];

// Helper to construct realistic historical points over the last 12-24 hours
export function generateInitialMeasurements() {
  const baseTime = Date.now() - 14 * 3600 * 1000; // 14 hours ago
  const records = [];

  // Valparai SAT-VLP-01: GEO satellite telemetry across 8 measurement timestamps
  // Hours: t=0 (08:00), t=2 (10:00), t=4 (12:00), t=6 (14:00), t=8 (16:00), t=10 (18:00), t=12 (20:00), t=14 (22:00)
  const valparaiData = [
    { hourOffset: 0, down: 38.4, up: 9.2, lat: 512, loss: 0.2, uptime: 99.4, source: 'actual' },
    { hourOffset: 2, down: 42.1, up: 9.8, lat: 498, loss: 0.1, uptime: 99.6, source: 'actual' },
    { hourOffset: 4, down: 34.5, up: 8.4, lat: 545, loss: 0.8, uptime: 98.9, source: 'actual' },
    { hourOffset: 6, down: 36.2, up: 8.9, lat: 520, loss: 0.4, uptime: 99.2, source: 'actual' },
    { hourOffset: 8, down: 29.8, up: 7.1, lat: 565, loss: 1.2, uptime: 98.5, source: 'actual' },
    { hourOffset: 10, down: 16.4, up: 4.8, lat: 642, loss: 2.8, uptime: 97.1, source: 'actual' }, // Evening peak slowdown
    { hourOffset: 12, down: 14.2, up: 3.9, lat: 678, loss: 3.5, uptime: 96.4, source: 'actual' }, // Heavy congestion
    { hourOffset: 14, down: 28.6, up: 7.4, lat: 535, loss: 0.6, uptime: 98.8, source: 'actual' }, // Recovery
  ];

  valparaiData.forEach((d, idx) => {
    const timestamp = new Date(baseTime + d.hourOffset * 3600 * 1000).toISOString();
    records.push({
      id: `meas-vlp-${idx + 1}`,
      villageId: 'vil-1',
      villageName: 'Valparai High Forest',
      terminalId: 'term-1',
      terminalCode: 'SAT-VLP-01',
      providerName: 'ISRO BharatNet',
      timestamp,
      downloadSpeed: d.down,
      uploadSpeed: d.up,
      latencyMs: d.lat,
      packetLossPct: d.loss,
      uptimePct: d.uptime,
      dataSource: d.source,
      notes: idx === 5 ? 'High traffic evening load detected' : 'Routine automated satellite ping check'
    });
  });

  // Kolli Hills SAT-KOL-02: LEO satellite telemetry
  const kolliData = [
    { hourOffset: 0, down: 72.4, up: 14.5, lat: 62, loss: 0.1, uptime: 99.8, source: 'actual' },
    { hourOffset: 2, down: 68.2, up: 13.9, lat: 64, loss: 0.2, uptime: 99.7, source: 'actual' },
    { hourOffset: 4, down: 74.8, up: 15.2, lat: 59, loss: 0.0, uptime: 99.9, source: 'actual' },
    { hourOffset: 6, down: 65.1, up: 12.8, lat: 71, loss: 0.4, uptime: 99.4, source: 'actual' },
    { hourOffset: 8, down: 58.7, up: 11.4, lat: 78, loss: 0.8, uptime: 99.1, source: 'actual' },
    { hourOffset: 10, down: 52.3, up: 10.6, lat: 85, loss: 1.1, uptime: 98.7, source: 'actual' },
    { hourOffset: 12, down: 48.9, up: 9.8, lat: 92, loss: 1.5, uptime: 98.2, source: 'actual' },
    { hourOffset: 14, down: 69.4, up: 14.1, lat: 61, loss: 0.1, uptime: 99.7, source: 'actual' },
  ];

  kolliData.forEach((d, idx) => {
    const timestamp = new Date(baseTime + d.hourOffset * 3600 * 1000).toISOString();
    records.push({
      id: `meas-kol-${idx + 1}`,
      villageId: 'vil-2',
      villageName: 'Kolli Hills - Semmedu',
      terminalId: 'term-2',
      terminalCode: 'SAT-KOL-02',
      providerName: 'OneWeb LEO',
      timestamp,
      downloadSpeed: d.down,
      uploadSpeed: d.up,
      latencyMs: d.lat,
      packetLossPct: d.loss,
      uptimePct: d.uptime,
      dataSource: d.source,
      notes: 'LEO constellation track switch nominal'
    });
  });

  // Jawadhu Hills SAT-JAW-03: Degraded Link / Rain Fade Scenario
  const jawadhuData = [
    { hourOffset: 0, down: 32.1, up: 7.4, lat: 540, loss: 1.1, uptime: 98.4, source: 'actual' },
    { hourOffset: 3, down: 24.6, up: 5.2, lat: 620, loss: 3.4, uptime: 95.8, source: 'actual' },
    { hourOffset: 6, down: 8.2, up: 1.8, lat: 780, loss: 7.9, uptime: 91.2, source: 'actual' }, // Degraded rain fade
    { hourOffset: 9, down: 0.2, up: 0.0, lat: 1120, loss: 94.0, uptime: 82.5, source: 'actual' }, // Outage
    { hourOffset: 12, down: 18.4, up: 4.1, lat: 660, loss: 4.2, uptime: 93.6, source: 'actual' }, // Recovery
    { hourOffset: 14, down: 29.5, up: 6.8, lat: 550, loss: 1.4, uptime: 97.9, source: 'actual' },
  ];

  jawadhuData.forEach((d, idx) => {
    const timestamp = new Date(baseTime + d.hourOffset * 3600 * 1000).toISOString();
    records.push({
      id: `meas-jaw-${idx + 1}`,
      villageId: 'vil-3',
      villageName: 'Jawadhu Hills - Jamunamarathur',
      terminalId: 'term-3',
      terminalCode: 'SAT-JAW-03',
      providerName: 'ISRO BharatNet',
      timestamp,
      downloadSpeed: d.down,
      uploadSpeed: d.up,
      latencyMs: d.lat,
      packetLossPct: d.loss,
      uptimePct: d.uptime,
      dataSource: d.source,
      notes: idx === 3 ? 'Confirmed satellite link break / heavy atmospheric attenuation' : 'VSAT dish signal test'
    });
  });

  // Kotagiri SAT-KTG-04: High Performance Starlink Pilot
  const kotagiriData = [
    { hourOffset: 1, down: 104.2, up: 21.4, lat: 46, loss: 0.1, uptime: 99.9, source: 'actual' },
    { hourOffset: 4, down: 98.5, up: 19.8, lat: 48, loss: 0.2, uptime: 99.8, source: 'actual' },
    { hourOffset: 7, down: 112.0, up: 23.1, lat: 44, loss: 0.0, uptime: 100.0, source: 'actual' },
    { hourOffset: 10, down: 89.4, up: 17.6, lat: 54, loss: 0.5, uptime: 99.5, source: 'actual' },
    { hourOffset: 13, down: 106.8, up: 22.0, lat: 45, loss: 0.1, uptime: 99.9, source: 'actual' },
  ];

  kotagiriData.forEach((d, idx) => {
    const timestamp = new Date(baseTime + d.hourOffset * 3600 * 1000).toISOString();
    records.push({
      id: `meas-ktg-${idx + 1}`,
      villageId: 'vil-4',
      villageName: 'Kotagiri Tea Hamlet',
      terminalId: 'term-4',
      terminalCode: 'SAT-KTG-04',
      providerName: 'Starlink Pilot',
      timestamp,
      downloadSpeed: d.down,
      uploadSpeed: d.up,
      latencyMs: d.lat,
      packetLossPct: d.loss,
      uptimePct: d.uptime,
      dataSource: d.source,
      notes: 'LEO phased array track locked'
    });
  });

  return records;
}

/**
 * Generates a plausible simulated telemetry reading for college demo testing.
 * Strictly labeled as 'simulated'.
 */
export function generateSimulatedReading(village, terminal, provider) {
  const isLeo = provider?.type?.includes('LEO') || false;
  const baseDown = isLeo ? 68.0 : 34.0;
  const baseUp = isLeo ? 14.0 : 7.5;
  const baseLat = isLeo ? 58 : 530;

  // Realistic random variance (+/- 15%)
  const jitterFactor = 0.85 + Math.random() * 0.3;
  const down = Number((baseDown * jitterFactor).toFixed(2));
  const up = Number((baseUp * jitterFactor).toFixed(2));
  const lat = Math.round(baseLat + (Math.random() * 40 - 20));
  const loss = Number((Math.random() * 1.5).toFixed(2));
  const uptime = Number((98.5 + Math.random() * 1.4).toFixed(1));

  return {
    id: `sim-${Date.now()}`,
    villageId: village?.id || 'vil-1',
    villageName: village?.name || 'Valparai High Forest',
    terminalId: terminal?.id || 'term-1',
    terminalCode: terminal?.terminalCode || 'SAT-VLP-01',
    providerName: provider?.name || 'ISRO BharatNet',
    timestamp: new Date().toISOString(),
    downloadSpeed: down,
    uploadSpeed: up,
    latencyMs: lat,
    packetLossPct: loss,
    uptimePct: uptime,
    dataSource: 'simulated',
    notes: 'Generated via Demo Telemetry Simulator (Clearly Labeled Simulated Data)'
  };
}
