/**
 * Bilingual Translation Dictionary: English & Tamil
 * Covers all navigation, KPI metrics, mathematical terms, warnings, and system states.
 */

export const TRANSLATIONS = {
  en: {
    // App header & brand
    appTitle: 'Satellite Internet Speed Estimator',
    appSubtitle: 'Remote Villages Telemetry & Lagrange Interpolation',
    demoModeActive: 'Local Demo Mode Active',
    demoModeNotice: 'Using simulated and local benchmark datasets. Connect Supabase for production.',
    offlineNotice: 'Offline Mode: Serving cached local telemetry data.',
    lowDataActive: 'Low-Data Mode Enabled',

    // Navigation Sidebar
    navOverview: 'Overview Dashboard',
    navMonitoring: 'Speed Monitoring',
    navLagrange: 'Lagrange Estimator',
    navComparison: 'Actual vs Estimated',
    navSimulator: 'What-If Simulator',
    navAccuracy: 'Accuracy & Reliability',
    navVillages: 'Village Comparison & Map',
    navEvents: 'Connectivity Events',
    navAI: 'AI Insights & Analysis',
    navReports: 'PDF Reports',
    navAdmin: 'Admin Console',
    navSettings: 'System Settings',

    // Top Header
    quickSimulateBtn: 'Generate Demo Reading',
    adminLogin: 'Admin Login',
    adminLoggedAs: 'Administrator',
    logout: 'Logout',
    language: 'Language',
    contrastMode: 'High Contrast',
    lowDataMode: 'Low Data Mode',
    textSize: 'Text Size',

    // KPIs & Metrics
    totalVillages: 'Monitored Villages',
    activeTerminals: 'Active Terminals',
    avgDownload: 'Avg Download Speed',
    avgUpload: 'Avg Upload Speed',
    avgLatency: 'Average Latency',
    avgPacketLoss: 'Packet Loss',
    avgUptime: 'Network Uptime',
    connectivityStatus: 'Link Health',
    lastMeasurement: 'Latest Telemetry',

    // Status Badges & Sources
    sourceActual: 'Actual Measured',
    sourceSimulated: 'Simulated Demo',
    sourceInterpolated: 'Lagrange Estimate',
    statusOnline: 'ONLINE',
    statusDegraded: 'DEGRADED',
    statusOffline: 'OFFLINE',

    // Filters
    filterVillage: 'Select Village',
    filterTerminal: 'Select Terminal',
    filterProvider: 'Select Provider',
    filterAll: 'All Villages & Terminals',
    timeRange: 'Time Interval',
    allTime: 'All Historical',
    last24Hours: 'Past 24 Hours',
    last7Days: 'Past 7 Days',

    // Lagrange Section
    lagrangeTitle: 'Lagrange Polynomial Interpolation Engine',
    lagrangeDesc: 'Computes continuous mathematical estimates between discrete satellite speed telemetry readings.',
    selectPointsPrompt: 'Select at least 2 historical measurement points to construct the polynomial:',
    targetTimePrompt: 'Select Target Estimation Time:',
    calculateEstimate: 'Calculate Lagrange Speed Estimate',
    estimatedDownload: 'Estimated Download Speed',
    estimatedUpload: 'Estimated Upload Speed',
    estimatedLatency: 'Estimated Latency',
    basisPolynomialsHeading: 'Step-by-Step Lagrange Basis Polynomials L_i(x)',
    basisTerm: 'Basis Polynomial',
    basisWeight: 'Weight L_i(x)',
    contribution: 'Contribution y_i * L_i(x)',
    partitionOfUnity: 'Partition of Unity Check (\u03A3 L_i(x)):',
    extrapolationWarningTitle: 'WARNING: EXTRAPOLATION DETECTED',
    extrapolationWarningBody: 'The selected target time lies outside the interval of known measurements. Polynomials can diverge wildly outside this range. This estimate cannot be treated as a standard interpolation or a forecast of future performance.',
    rungeWarningTitle: 'High-Degree Polynomial Caution (Runge Phenomenon)',
    rungeWarningBody: 'Using 5 or more points can produce wild oscillations between nodes. Quadratic (3 points) or Cubic (4 points) interpolation is recommended.',
    surroundingHeading: 'Surrounding Actual Measurement Anchors',
    disclaimerBanner: 'IMPORTANT: Interpolation is a mathematical approximation between recorded measurements. It does not measure speed independently or guarantee future satellite performance.',

    // Actual vs Estimated
    compTitle: 'Actual vs Lagrange Estimated Speed Comparison',
    timestampCol: 'Timestamp',
    actualSpeedCol: 'Actual Speed (Mbps)',
    estSpeedCol: 'Estimated Speed (Mbps)',
    absErrorCol: 'Absolute Error (Mbps)',
    pctErrorCol: 'Percentage Error (%)',
    dataSourceCol: 'Data Source',
    validationCol: 'Validation Status',

    // Simulator
    simTitle: 'Interactive What-If Scenario Simulator',
    simDesc: 'Add synthetic readings, edit speed values, or simulate satellite link degradation to see how the Lagrange curve dynamically adapts.',
    addSyntheticPoint: 'Add Synthetic Reading',
    resetToOriginal: 'Reset to Original Data',
    editPoint: 'Edit Point',
    removePoint: 'Remove Point',
    simulatedChangesNotice: 'Sandbox Mode: Edits made here only alter the interactive curve and are not saved to the persistent database.',

    // Accuracy
    accuracyTitle: 'Accuracy & Reliability Analysis',
    maeDesc: 'Mean Absolute Error: Average magnitude of estimation deviation.',
    rmseDesc: 'Root Mean Squared Error: Penalizes larger prediction outliers.',
    mapeDesc: 'Mean Absolute Percentage Error (Safely ignores zero actuals).',
    loocvTitle: 'Held-Out Cross-Validation (Leave-One-Out Engine)',
    loocvDesc: 'Validates interpolation accuracy by withholding each real point, interpolating from the remaining points, and measuring error against the true held-out value.',
    reliabilityScore: 'Estimate Reliability Index',

    // Village Comparison & Map
    villageCompTitle: 'Village Telemetry & Geographic Map',
    rankingsTitle: 'Village Connectivity Rankings',
    mapLegend: 'Terminal Locations & Signal Health',
    scoreFormulaTitle: 'Configurable Multi-Factor Connectivity Score',
    scoreFormulaDesc: 'Calculated using documented, transparent weights across bandwidth, latency, loss, and availability.',
    weightSpeed: 'Speed Weight',
    weightLatency: 'Latency Weight',
    weightLoss: 'Packet Loss Weight',
    weightUptime: 'Uptime Weight',

    // Events
    eventsTitle: 'Satellite Connectivity Event Log',
    detectedAnomalies: 'Detected Anomalies & Alerts',
    outageVsFailNotice: 'Note: Connection outages with 90%+ packet loss are distinguished from measurement test server timeouts.',
    simulateAlertBtn: 'Simulate Dispatch (SMS/Email)',
    alertSuccess: 'Alert dispatched to village administration contact.',

    // AI Insights
    aiTitle: 'Automated Diagnostic & Rule-Based Telemetry Insights',
    aiDisclaimer: 'Observations are derived purely from recorded metrics. Causes are categorized as observed facts versus potential inferences.',
    generateAIInsights: 'Regenerate Telemetry Diagnostics',

    // Reports
    reportsTitle: 'Comprehensive PDF Report Generator',
    reportsDesc: 'Generates a branded, academic-grade PDF dossier with telemetry statistics, Lagrange calculations, held-out accuracy, and outage history.',
    generatePdfBtn: 'Download PDF Telemetry Report',

    // Common Buttons
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    refresh: 'Refresh Data',
    close: 'Close',
    actions: 'Actions'
  },

  ta: {
    // App header & brand
    appTitle: 'செயற்கைக்கோள் இணைய வேகக் கணிப்பான்',
    appSubtitle: 'தொலைதூர கிராமங்களின் தொலை அளவியல் மற்றும் லாக்ராஞ்ச் இடைச்செருகல்',
    demoModeActive: 'உள்ளூர் செயல்முறை முறை செயல்பாட்டில் உள்ளது',
    demoModeNotice: 'மாதிரி தரவுகளைப் பயன்படுத்துகிறது. நேரலை உற்பத்திக்கு சுபாபேஸ் இணைக்கவும்.',
    offlineNotice: 'ஆஃப்லைன் பயன்முறை: தேக்ககத் தரவு காட்டப்படுகிறது.',
    lowDataActive: 'குறைந்த தரவு பயன்முறை இயக்கப்பட்டது',

    // Navigation Sidebar
    navOverview: 'கண்ணோட்டம் முகப்புப்பலகை',
    navMonitoring: 'வேகக் கண்காணிப்பு',
    navLagrange: 'லாக்ராஞ்ச் கணக்கீட்டுக் கருவி',
    navComparison: 'உண்மை vs கணிக்கப்பட்ட வேகம்',
    navSimulator: 'செயற்கை உருவகப்படுத்துதல்',
    navAccuracy: 'துல்லியம் மற்றும் நம்பகத்தன்மை',
    navVillages: 'கிராமங்களின் ஒப்பீடு மற்றும் வரைபடம்',
    navEvents: 'இணைப்பு நிகழ்வுகள் & எச்சரிக்கைகள்',
    navAI: 'தானியங்கி நுண்ணறிவு ஆய்வுகள்',
    navReports: 'PDF அறிக்கைகள்',
    navAdmin: 'நிர்வாகக் குழு',
    navSettings: 'அமைப்பு அமைப்புகள்',

    // Top Header
    quickSimulateBtn: 'மாதிரி அளவீடு உருவாக்கு',
    adminLogin: 'நிர்வாகி உள்நுழைவு',
    adminLoggedAs: 'நிர்வாகி',
    logout: 'வெளியேறு',
    language: 'மொழி',
    contrastMode: 'உயர் மாறுபாடு',
    lowDataMode: 'குறைந்த தரவு முறை',
    textSize: 'எழுத்து அளவு',

    // KPIs & Metrics
    totalVillages: 'கண்காணிக்கப்படும் கிராமங்கள்',
    activeTerminals: 'செயல்பாட்டு முனையங்கள்',
    avgDownload: 'சராசரி பதிவிறக்க வேகம்',
    avgUpload: 'சராசரி பதிவேற்ற வேகம்',
    avgLatency: 'சராசரி தாமதம்',
    avgPacketLoss: 'பாக்கெட் இழப்பு',
    avgUptime: 'இணைப்பு இயக்க நேரம்',
    connectivityStatus: 'இணைப்பு நிலை',
    lastMeasurement: 'சமீபத்திய அளவீடு',

    // Status Badges & Sources
    sourceActual: 'உண்மையான அளவீடு',
    sourceSimulated: 'உருவகப்படுத்தப்பட்ட அளவீடு',
    sourceInterpolated: 'லாக்ராஞ்ச் கணிப்பு',
    statusOnline: 'செயல்பாட்டில்',
    statusDegraded: 'குறைந்த தரம்',
    statusOffline: 'செயலிழந்தது',

    // Filters
    filterVillage: 'கிராமத்தைத் தேர்ந்தெடுக்கவும்',
    filterTerminal: 'முனையத்தைத் தேர்ந்தெடுக்கவும்',
    filterProvider: 'வழங்குநரைத் தேர்ந்தெடுக்கவும்',
    filterAll: 'அனைத்து கிராமங்களும் முனையங்களும்',
    timeRange: 'கால இடைவெளி',
    allTime: 'முழு வரலாறு',
    last24Hours: 'கடந்த 24 மணி நேரம்',
    last7Days: 'கடந்த 7 நாட்கள்',

    // Lagrange Section
    lagrangeTitle: 'லாக்ராஞ்ச் பல்லுறுப்புக்கோவை இடைச்செருகல் இயந்திரம்',
    lagrangeDesc: 'பதிவுசெய்யப்பட்ட செயற்கைக்கோள் வேக அளவீடுகளுக்கு இடையில் தொடர்ச்சியான கணித மதிப்பீடுகளைக் கணக்கிடுகிறது.',
    selectPointsPrompt: 'குறைந்தது 2 அளவீட்டு புள்ளிகளைத் தேர்ந்தெடுக்கவும்:',
    targetTimePrompt: 'இடைப்பட்ட இலக்கு நேரத்தைத் தேர்ந்தெடுக்கவும்:',
    calculateEstimate: 'லாக்ராஞ்ச் வேகத்தைக் கணக்கிடு',
    estimatedDownload: 'கணிக்கப்பட்ட பதிவிறக்க வேகம்',
    estimatedUpload: 'கணிக்கப்பட்ட பதிவேற்ற வேகம்',
    estimatedLatency: 'கணிக்கப்பட்ட தாமதம்',
    basisPolynomialsHeading: 'படி படியான லாக்ராஞ்ச் அடிப்படைக் கோவைகள் L_i(x)',
    basisTerm: 'அடிப்படைப் பல்லுறுப்புக்கோவை',
    basisWeight: 'எடை L_i(x)',
    contribution: 'பங்களிப்பு y_i * L_i(x)',
    partitionOfUnity: 'ஒற்றுமைப் பகிர்வு சோதனை (\u03A3 L_i(x)):',
    extrapolationWarningTitle: 'எச்சரிக்கை: வெளிச்செருகல் (Extrapolation) கண்டறியப்பட்டது',
    extrapolationWarningBody: 'தேர்ந்தெடுக்கப்பட்ட இலக்கு நேரம் அறியப்பட்ட அளவீடுகளின் வரம்பிற்கு வெளியே உள்ளது. இந்த கணிப்பை சாதாரண இடைச்செருகலாகவோ அல்லது எதிர்கால செயல்திறன் முன்னறிவிப்பாகவோ கருத முடியாது.',
    rungeWarningTitle: 'உயர் பல்லுறுப்புக்கோவை எச்சரிக்கை (ரஞ்ச் நிகழ்வு)',
    rungeWarningBody: '5 அல்லது அதற்கு மேற்பட்ட புள்ளிகளைப் பயன்படுத்துவது விளிம்புகளில் விலகலை ஏற்படுத்தலாம். 3 அல்லது 4 புள்ளிகளைப் பயன்படுத்துவது பரிந்துரைக்கப்படுகிறது.',
    surroundingHeading: 'சுற்றியுள்ள உண்மையான அளவீட்டுப் புள்ளிகள்',
    disclaimerBanner: 'முக்கிய அறிவிப்பு: இடைச்செருகல் என்பது அளவீடுகளுக்கு இடையிலான ஒரு கணிதத் தோராயமாகும். இது வேகத்தை சுயாதீனமாக அளவிடாது மற்றும் எதிர்கால வேகத்தை உத்தரவாதம் செய்யாது.',

    // Actual vs Estimated
    compTitle: 'உண்மையான மற்றும் கணிக்கப்பட்ட வேக ஒப்பீடு',
    timestampCol: 'நேரமுத்திரை',
    actualSpeedCol: 'உண்மை வேகம் (Mbps)',
    estSpeedCol: 'கணிக்கப்பட்ட வேகம் (Mbps)',
    absErrorCol: 'முழுப் பிழை (Mbps)',
    pctErrorCol: 'சதவீதப் பிழை (%)',
    dataSourceCol: 'தரவு மூலம்',
    validationCol: 'சரிபார்ப்பு நிலை',

    // Simulator
    simTitle: 'செயற்கை காட்சி உருவகப்படுத்துதல்',
    simDesc: 'புதிய புள்ளிகளைச் சேர்த்து, வேகத்தை மாற்றி, லாக்ராஞ்ச் வளைவு எவ்வாறு மாறும் என்பதை நேரடியாகக் கவனியுங்கள்.',
    addSyntheticPoint: 'புதிய செயற்கை புள்ளி சேர்',
    resetToOriginal: 'அசல் தரவுக்கு மீட்டமை',
    editPoint: 'திருத்து',
    removePoint: 'நீக்கு',
    simulatedChangesNotice: 'சோதனை முறை: இங்கு செய்யப்படும் மாற்றங்கள் அசல் தரவுத்தளத்தைப் பாதிக்காது.',

    // Accuracy
    accuracyTitle: 'துல்லியம் மற்றும் நம்பகத்தன்மை பகுப்பாய்வு',
    maeDesc: 'சராசரி முழுப் பிழை (MAE): விலகலின் சராசரி அளவு.',
    rmseDesc: 'வர்க்க சராசரி மூலப் பிழை (RMSE): பெரிய பிழைகளை மிகைப்படுத்திக் காட்டும்.',
    mapeDesc: 'சராசரி முழு சதவீதப் பிழை (பூஜ்ஜியங்களை பாதுகாப்பாக கையாள்கிறது).',
    loocvTitle: 'தனிமைப்படுத்தப்பட்ட குறுக்கு சரிபார்ப்பு (LOOCV)',
    loocvDesc: 'ஒவ்வொரு உண்மையான புள்ளியையும் நீக்கிவிட்டு மீதமுள்ள புள்ளிகளிலிருந்து கணித்து உண்மையான மதிப்புடன் ஒப்பிடுகிறது.',
    reliabilityScore: 'கணிப்பு நம்பகத்தன்மை குறியீடு',

    // Village Comparison & Map
    villageCompTitle: 'கிராமங்களின் தொலை அளவியல் மற்றும் வரைபடம்',
    rankingsTitle: 'கிராம இணைப்பு தரவரிசை பட்டியல்',
    mapLegend: 'முனைய இடங்கள் மற்றும் சிக்னல் நிலை',
    scoreFormulaTitle: 'பல்வேறு காரணிகள் கொண்ட இணைப்பு மதிப்பெண்',
    scoreFormulaDesc: 'வேகம், தாமதம், பாக்கெட் இழப்பு மற்றும் இயக்க நேரம் ஆகியவற்றின் வெளிப்படையான எடையிடப்பட்ட சூத்திரம்.',
    weightSpeed: 'வேக எடை',
    weightLatency: 'தாமத எடை',
    weightLoss: 'இழப்பு எடை',
    weightUptime: 'இயக்க நேர எடை',

    // Events
    eventsTitle: 'செயற்கைக்கோள் இணைப்பு நிகழ்வுப் பதிவு',
    detectedAnomalies: 'கண்டறியப்பட்ட முரண்பாடுகள் & எச்சரிக்கைகள்',
    outageVsFailNotice: 'குறிப்பு: 90%+ பாக்கெட் இழப்புடன் கூடிய துண்டிப்புகள், வேக சேவையகத் தோல்விகளிலிருந்து வேறுபடுத்திக் காட்டப்படுகின்றன.',
    simulateAlertBtn: 'எச்சரிக்கை அனுப்பு (SMS/Email)',
    alertSuccess: 'கிராம நிர்வாகப் பொறுப்பாளருக்கு எச்சரிக்கை அனுப்பப்பட்டது.',

    // AI Insights
    aiTitle: 'தானியங்கி தொலை அளவியல் நுண்ணறிவு ஆய்வு',
    aiDisclaimer: 'அவதானிப்புகள் பதிவுசெய்யப்பட்ட அளவீடுகளிலிருந்து பெறப்படுகின்றன. உண்மைக்கும் காரண ஊகத்திற்கும் இடையில் தெளிவான வேறுபாடு உள்ளது.',
    generateAIInsights: 'மீண்டும் ஆய்வு செய்',

    // Reports
    reportsTitle: 'முழுமையான PDF அறிக்கை உருவாக்கி',
    reportsDesc: 'அனைத்து புள்ளிவிவரங்கள், லாக்ராஞ்ச் கணக்கீடுகள் மற்றும் துல்லிய அளவீடுகளுடன் கூடிய அதிகாரப்பூர்வ PDF ஆவணம்.',
    generatePdfBtn: 'PDF அறிக்கையைப் பதிவிறக்கு',

    // Common Buttons
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    delete: 'நீக்கு',
    refresh: 'புதுப்பி',
    close: 'மூடு',
    actions: 'செயல்கள்'
  }
};
