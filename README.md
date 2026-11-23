# Satellite Internet Speed Estimator for Remote Villages

> **College Mini-Project & Technical Hackathon Platform**  
> *Numerical Methods, Satellite Telemetry Monitoring, and Polynomial Interpolation Analysis*

---

## 🛰️ 1. Project Overview & Core Concept

In remote, mountainous, and forested terrains (such as the Western and Eastern Ghats of South India), cellular towers and fiber optics are physically impractical or prohibitively expensive to deploy. Satellite Internet terminals (VSATs connected to Geostationary GEO transponders like **ISRO GSAT-19 / BharatNet Satellite** or Low Earth Orbit constellations like **OneWeb** and **Starlink**) serve as the sole communication backbone for rural panchayats, community schools, and primary health centres.

However, satellite connectivity is subject to shared transponder congestion, atmospheric rain fade, and periodic telemetry polling gaps. 

This platform continuously monitors satellite broadband telemetry and employs **Lagrange Polynomial Interpolation** to mathematically estimate connection speeds between recorded measurement points. 

### ⚠️ Mathematical Integrity & Disclaimers
* **Interpolation vs Measurement:** Interpolation is a mathematical approximation between recorded measurements. It does **not** measure speed independently or guarantee future satellite performance.
* **Extrapolation Warning:** The engine strictly distinguishes in-bounds interpolation from out-of-bounds extrapolation. Extrapolation is flagged with prominent visual alerts and cannot forecast future bandwidth.
* **Data Origin Transparency:** Every telemetry point is explicitly labeled as **`Actual Measured`**, **`Simulated Demo`**, or **`Lagrange Estimate`**.

---

## 🧮 2. Mathematical Foundation: Lagrange Interpolation

The core mathematical engine models the unknown continuous speed function $P(x)$ passing through $n+1$ distinct measurement nodes $(x_0, y_0), (x_1, y_1), \dots, (x_n, y_n)$:

$$P(x) = \sum_{i=0}^{n} y_i \cdot L_i(x)$$

where each **Lagrange Basis Polynomial** $L_i(x)$ is given by:

$$L_i(x) = \prod_{\substack{j=0 \\ j \neq i}}^{n} \frac{x - x_j}{x_i - x_j} = \frac{(x - x_0)}{(x_i - x_0)} \cdots \frac{(x - x_{i-1})}{(x_i - x_{i-1})} \cdot \frac{(x - x_{i+1})}{(x_i - x_{i+1})} \cdots \frac{(x - x_n)}{(x_i - x_n)}$$

### Key Mathematical Properties Verified in the System:
1. **Kronecker Delta Property:**
   $$L_i(x_j) = \delta_{ij} = \begin{cases} 1 & \text{if } i = j \\ 0 & \text{if } i \neq j \end{cases}$$
   Ensuring that $P(x_i) = y_i$ exactly at all anchor nodes.
2. **Partition of Unity:**
   $$\sum_{i=0}^{n} L_i(x) \equiv 1.0 \quad \forall x$$
   The UI computes and confirms this sum in real-time.
3. **Runge's Phenomenon Safeguard:**
   Using high-degree polynomials ($n \ge 5$) with equispaced nodes can cause wild oscillations near the edges of the interval. The system flags a Runge warning when $n \ge 5$ and recommends 3 to 4 points (Quadratic or Cubic splines).
4. **Physical Non-Negativity:**
   Raw polynomial evaluations are displayed, but throughput is clamped to $\ge 0$ Mbps with an explicit note when clamping occurs.

---

## 💻 3. Technology Stack

* **Frontend Framework:** React 18 + Vite 6
* **Language:** JavaScript (ES2023)
* **Styling & Design System:** Tailwind CSS (Navy/Cyan satellite theme)
* **Interactive Charting:** Recharts (ComposedChart, AreaChart, BarChart)
* **Geospatial Mapping:** Leaflet 1.9 + OpenStreetMap tiles
* **PDF Dossier Generation:** jsPDF + jspdf-autotable
* **Icons:** Lucide React
* **Backend & Authentication:** Supabase (PostgreSQL + Supabase Auth) with seamless local fallback
* **Localization:** Bilingual English & தமிழ் (Tamil)
* **Accessibility:** High-Contrast Mode, Typography Scaler (1x, 1.2x, 1.4x), and Low-Data Mode

---

## 🚀 4. Installation & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher

### Step-by-Step Instructions

1. **Clone or Navigate to the Workspace:**
   ```bash
   cd "math numercials"
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   > *Note:* The application runs out of the box in **Zero-Config Local Demo Mode** without requiring any API keys.

4. **Run Unit Tests (Lagrange Mathematical Suite):**
   ```bash
   node src/utils/testLagrange.js
   ```
   *Verifies 21/21 numerical tests including collinearity, Kronecker delta, partition of unity, extrapolation detection, and safe zero MAPE.*

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at: `http://localhost:3000`

6. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🗄️ 5. Supabase Database Setup & Schema

If you wish to link a cloud Supabase project:
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the entire contents of `supabase_schema.sql` located in the root of this project.
4. Add your project URL and anon public key to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. Restart the Vite development server (`npm run dev`).

### Database Relational Schema
* `providers`: Satellite operators (ISRO GSAT, OneWeb LEO, Starlink)
* `villages`: Remote hill hamlets (coordinates, elevation, terrain, population)
* `satellite_terminals`: VSAT dish hardware (azimuth, elevation angle, model)
* `measurements`: Telemetry feed (download, upload, latency, packet loss, uptime, data origin)
* `alert_events`: Anomaly detection records (speed drops, outages, peak congestion)
* `alert_thresholds`: Configurable threshold settings

---

## 📊 6. Platform Architecture & Modules

```
satellite-internet-speed-estimator/
├── index.html                   # HTML entry point with Leaflet & Google Fonts
├── package.json                 # Project dependencies & scripts
├── tailwind.config.js           # Navy/Cyan theme customization
├── vite.config.js               # Vite bundler configuration
├── supabase_schema.sql          # PostgreSQL DDL & RLS security policies
├── .env.example                 # Template for optional external keys
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main application routing & layout
│   ├── index.css                # Tailwind directives & custom CSS
│   ├── context/
│   │   └── AppContext.jsx       # Global telemetry state, filters, offline cache, i18n
│   ├── data/
│   │   └── mockData.js          # Calibrated Western/Eastern Ghats telemetry datasets
│   ├── translations/
│   │   └── i18n.js              # Comprehensive English and Tamil dictionaries
│   ├── utils/
│   │   ├── lagrange.js          # Core Lagrange basis polynomials & interpolation engine
│   │   ├── metrics.js           # MAE, RMSE, safe MAPE, & Leave-One-Out CV
│   │   ├── scoring.js           # Transparent 4-factor connectivity score engine
│   │   ├── eventDetection.js    # Rule engine for outages, peak drops & spikes
│   │   ├── pdfGenerator.js      # Academic PDF dossier exporter (jsPDF)
│   │   ├── supabaseClient.js    # Supabase client with local fallback
│   │   └── testLagrange.js      # 21-test Node.js numerical test runner
│   └── components/
│       ├── common/              # Header, Sidebar, StatCard, Badge, FilterBar
│       ├── dashboard/           # OverviewView (8 KPIs, Time-series, Village bars)
│       ├── monitoring/          # MonitoringView (Manual entry, scheduler, speed test)
│       ├── lagrange/            # LagrangeView (Hero calculation, basis steps, curve)
│       ├── comparison/          # ComparisonView (Actual vs Estimated matrix)
│       ├── simulator/           # SimulatorView (Interactive what-if sandbox)
│       ├── accuracy/            # AccuracyView (MAE, RMSE, MAPE, LOOCV breakdown)
│       ├── villages/            # VillageComparisonView & VillageMap (Leaflet)
│       ├── events/              # EventsView (Alerts, threshold drawer, SMS dispatch)
│       ├── ai/                  # AIInsightsView (Fact vs inference diagnostic)
│       ├── reports/             # ReportsView (PDF preview & one-click download)
│       ├── admin/               # AdminView & AdminLoginModal (Full CRUD console)
│       └── settings/            # SettingsView (Accessibility & API status)
```

---

## 🔑 7. Optional External Services

| Service | Environment Variable | Purpose | Fallback Behavior When Absent |
| :--- | :--- | :--- | :--- |
| **Supabase Cloud** | `VITE_SUPABASE_URL`<br/>`VITE_SUPABASE_ANON_KEY` | Remote cloud DB & auth | Runs locally with persistent `localStorage` and demo admin session |
| **Speed Test Server** | `VITE_SPEED_TEST_ENDPOINT` | Browser-based live throughput ping | Runs realistic simulated diagnostic test with satellite latency jitter |
| **Alert Webhook** | `VITE_NOTIFICATION_WEBHOOK_URL` | SMS/Email gateway webhook | Shows in-app simulated dispatch notification toast |
| **AI LLM API** | `VITE_AI_API_KEY` | Real-time generative reasoning | Runs the deterministic, truthful rule-based diagnostic engine |

---

## 🎓 8. College Project Presentation & Viva Voce Workflow

For an academic viva or project evaluation, follow this 5-minute demonstration sequence:

1. **Step 1: Public Dashboard (`Overview`)**
   * Point out the **8 primary KPIs**: Monitored Villages, Active Terminals, Avg Download, Avg Upload, Latency, Packet Loss, Uptime, and Link Health.
   * Demonstrate the **Language Switcher**: Click `தமிழ்` in the header to show complete Tamil translation for rural panchayat administrators.
   * Click **`Generate Demo Reading`** to show live state updates and explain the explicit **`Simulated Demo`** badge.

2. **Step 2: Speed Monitoring (`Speed Monitoring`)**
   * Open **Enter Manual Measurement** to show strict input validation (non-negative speeds, percentage ranges 0-100%, and duplicate timestamp rejection).
   * Toggle **Start Auto-Poll** on the Scheduled Telemetry Polling Simulator.

3. **Step 3: Lagrange Interpolation Engine (`Lagrange Estimator`) — *The Hero Feature***
   * Explain the formula: $P(x) = \sum y_i L_i(x)$ where $L_i(x) = \prod \frac{x - x_j}{x_i - x_j}$.
   * Select 4 nodes (Cubic degree $n=3$) on the Valparai VSAT dataset.
   * Move the target estimation slider between known timestamps (e.g., $x=3.0\text{h}$) to display the interpolated speed.
   * Expand **Step-by-Step Lagrange Basis Polynomials**: Highlight the evaluated weights $L_i(x)$ and demonstrate the **Partition of Unity** verification ($\sum L_i(x) = 1.000000$).
   * Click **Test Future Extrapolation (+1.5h)**: Show the examiner how the system actively catches out-of-bounds target times with a prominent red **`EXTRAPOLATION WARNING`** and refuses to claim it as a standard interpolation or forecast.

4. **Step 4: Actual vs Estimated & Accuracy (`Accuracy & Reliability`)**
   * Explain **Leave-One-Out Cross-Validation (LOOCV)**: Withholding each actual measurement, predicting from remaining points, and computing genuine held-out error.
   * Show **MAE**, **RMSE**, and **MAPE** (demonstrating safe handling of zero actual values during outages).

5. **Step 5: Village Comparison & Interactive Map (`Village Comparison`)**
   * Inspect the **Leaflet Map** showing Western Ghats village markers color-coded by signal health.
   * Demonstrate the **Multi-Factor Connectivity Score**: Adjust the weight sliders (Speed, Latency, Loss, Uptime) and show how the village rankings dynamically adjust.

6. **Step 6: PDF Report Dossier (`PDF Reports`)**
   * Click **Download PDF Telemetry Report**. Open the resulting branded PDF to show the examiners the complete academic dossier including metadata, statistics, formulas, and legal disclaimers.

7. **Step 7: Admin Console (`Admin Console`)**
   * Authenticate with demo admin credentials (`admin@bharatnet-satellite.gov.in` / `Admin@2025#Sat`).
   * Show administrative control to add/edit villages, register terminals, and manage system thresholds.

---

## 📜 License
Developed as an academic mini-project under the MIT License. Intended for educational and research demonstrations in Numerical Methods and Rural Telecommunication Systems.
