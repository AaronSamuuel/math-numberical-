-- ==============================================================================
-- SATELLITE INTERNET SPEED ESTIMATOR FOR REMOTE VILLAGES
-- Supabase Database Schema & Setup Script
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROVIDERS TABLE
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    constellation_type VARCHAR(20) NOT NULL CHECK (constellation_type IN ('LEO', 'GEO', 'MEO')),
    frequency_band VARCHAR(20) NOT NULL DEFAULT 'Ka-Band',
    nominal_down_mbps NUMERIC(6, 2) NOT NULL DEFAULT 50.00,
    nominal_up_mbps NUMERIC(6, 2) NOT NULL DEFAULT 10.00,
    contact_support VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VILLAGES TABLE
CREATE TABLE IF NOT EXISTS villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_tamil VARCHAR(150) NOT NULL,
    state VARCHAR(50) NOT NULL DEFAULT 'Tamil Nadu',
    district VARCHAR(50) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    population INT DEFAULT 850,
    elevation_meters INT DEFAULT 1200,
    terrain_type VARCHAR(50) DEFAULT 'Mountainous / Dense Canopy',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SATELLITE TERMINALS TABLE
CREATE TABLE IF NOT EXISTS satellite_terminals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    village_id UUID NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    terminal_code VARCHAR(50) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL DEFAULT 'BharatNet VSAT-X4',
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    dish_diameter_meters NUMERIC(4, 2) DEFAULT 1.2,
    azimuth_deg NUMERIC(5, 2) DEFAULT 142.5,
    elevation_angle_deg NUMERIC(4, 2) DEFAULT 48.0,
    install_date DATE DEFAULT '2025-01-15',
    status VARCHAR(20) DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'DEGRADED', 'OFFLINE', 'MAINTENANCE')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEASUREMENTS TABLE
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    village_id UUID NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    terminal_id UUID NOT NULL REFERENCES satellite_terminals(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    download_speed NUMERIC(6, 2) NOT NULL CHECK (download_speed >= 0),
    upload_speed NUMERIC(6, 2) NOT NULL CHECK (upload_speed >= 0),
    latency_ms NUMERIC(6, 2) NOT NULL CHECK (latency_ms >= 0),
    packet_loss_pct NUMERIC(5, 2) NOT NULL CHECK (packet_loss_pct >= 0 AND packet_loss_pct <= 100),
    uptime_pct NUMERIC(5, 2) NOT NULL CHECK (uptime_pct >= 0 AND uptime_pct <= 100),
    data_source VARCHAR(20) NOT NULL DEFAULT 'actual' CHECK (data_source IN ('actual', 'simulated', 'interpolated')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_terminal_timestamp UNIQUE(terminal_id, timestamp)
);

-- 5. CONNECTIVITY ALERT EVENTS TABLE
CREATE TABLE IF NOT EXISTS alert_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    village_id UUID NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
    terminal_id UUID NOT NULL REFERENCES satellite_terminals(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('peak_slowdown', 'speed_drop', 'connection_failure', 'high_latency', 'packet_loss')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    description TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONFIGURABLE THRESHOLDS TABLE
CREATE TABLE IF NOT EXISTS alert_thresholds (
    id INT PRIMARY KEY DEFAULT 1,
    min_download_mbps NUMERIC(6, 2) DEFAULT 12.00,
    max_latency_ms NUMERIC(6, 2) DEFAULT 450.00,
    max_packet_loss_pct NUMERIC(5, 2) DEFAULT 5.00,
    speed_drop_percent_trigger NUMERIC(5, 2) DEFAULT 35.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;

-- Public can read all tables for the public transparency dashboard
CREATE POLICY "Public Read Access Providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Public Read Access Villages" ON villages FOR SELECT USING (true);
CREATE POLICY "Public Read Access Terminals" ON satellite_terminals FOR SELECT USING (true);
CREATE POLICY "Public Read Access Measurements" ON measurements FOR SELECT USING (true);
CREATE POLICY "Public Read Access Alert Events" ON alert_events FOR SELECT USING (true);
CREATE POLICY "Public Read Access Alert Thresholds" ON alert_thresholds FOR SELECT USING (true);

-- Authenticated Admin can perform all modifications
CREATE POLICY "Admin Full Access Providers" ON providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Villages" ON villages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Terminals" ON satellite_terminals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Measurements" ON measurements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Alert Events" ON alert_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Alert Thresholds" ON alert_thresholds FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- SAMPLE SEED DATA
-- ==============================================================================

INSERT INTO providers (id, name, constellation_type, frequency_band, nominal_down_mbps, nominal_up_mbps, contact_support)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'ISRO GSAT-19 / BharatNet Satellite', 'GEO', 'Ka-Band', 45.0, 10.0, 'support@isro-bharatnet.gov.in'),
  ('22222222-2222-2222-2222-222222222222', 'OneWeb LEO Network India', 'LEO', 'Ku-Band', 75.0, 15.0, 'noc@oneweb-india.in'),
  ('33333333-3333-3333-3333-333333333333', 'Starlink Direct-to-Cell Pilot', 'LEO', 'Ka/Ku', 110.0, 20.0, 'sat-support@starlink.com')
ON CONFLICT DO NOTHING;

INSERT INTO villages (id, name, name_tamil, state, district, latitude, longitude, population, elevation_meters, terrain_type)
VALUES
  ('a1111111-0000-0000-0000-000000000001', 'Valparai High Forest', 'வால்பாறை அடர்ந்த வனம்', 'Tamil Nadu', 'Coimbatore', 10.3264, 76.9554, 1140, 1190, 'High Rainfall Ridge'),
  ('a1111111-0000-0000-0000-000000000002', 'Kolli Hills - Semmedu', 'கொல்லிமலை - செம்மேடு', 'Tamil Nadu', 'Namakkal', 11.2485, 78.3385, 960, 1300, 'Cloud-Covered Escarpment'),
  ('a1111111-0000-0000-0000-000000000003', 'Jawadhu Hills - Jamunamarathur', 'ஜவாது மலை - ஜமுனாமரத்தூர்', 'Tamil Nadu', 'Tiruvannamalai', 12.5732, 78.8954, 820, 850, 'Dense Deciduous Valley'),
  ('a1111111-0000-0000-0000-000000000004', 'Kotagiri Tea Hamlet', 'கோத்தகிரி தேயிலை கிராமம்', 'Tamil Nadu', 'Nilgiris', 11.4219, 76.8676, 750, 1790, 'Foggy Plateau'),
  ('a1111111-0000-0000-0000-000000000005', 'Yelagiri - Athanavur', 'ஏலகிரி - அத்தனாவூர்', 'Tamil Nadu', 'Tirupattur', 12.5833, 78.6333, 1320, 1050, 'Isolated Hill Valley'),
  ('a1111111-0000-0000-0000-000000000006', 'Pannaikadu Foothill', 'பண்ணைக்காடு அடிவாரம்', 'Tamil Nadu', 'Dindigul', 10.2789, 77.6389, 690, 1250, 'Steep Gorge')
ON CONFLICT DO NOTHING;

INSERT INTO satellite_terminals (id, village_id, terminal_code, model, provider_id, dish_diameter_meters, azimuth_deg, elevation_angle_deg, status)
VALUES
  ('b1111111-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'SAT-VLP-01', 'BharatNet VSAT-Ka 1.2m', '11111111-1111-1111-1111-111111111111', 1.2, 142.0, 47.8, 'ONLINE'),
  ('b1111111-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002', 'SAT-KOL-02', 'OneWeb User Terminal Flat', '22222222-2222-2222-2222-222222222222', 0.8, 148.5, 51.2, 'ONLINE'),
  ('b1111111-0000-0000-0000-000000000003', 'a1111111-0000-0000-0000-000000000003', 'SAT-JAW-03', 'BharatNet VSAT-Ku 1.0m', '11111111-1111-1111-1111-111111111111', 1.0, 139.2, 45.4, 'DEGRADED'),
  ('b1111111-0000-0000-0000-000000000004', 'a1111111-0000-0000-0000-000000000004', 'SAT-KTG-04', 'Starlink Dishy v3', '33333333-3333-3333-3333-333333333333', 0.6, 135.0, 52.0, 'ONLINE'),
  ('b1111111-0000-0000-0000-000000000005', 'a1111111-0000-0000-0000-000000000005', 'SAT-YEL-05', 'BharatNet VSAT-Ka 1.2m', '11111111-1111-1111-1111-111111111111', 1.2, 143.1, 48.9, 'ONLINE'),
  ('b1111111-0000-0000-0000-000000000006', 'a1111111-0000-0000-0000-000000000006', 'SAT-PAN-06', 'OneWeb User Terminal Dual', '22222222-2222-2222-2222-222222222222', 0.8, 146.7, 49.5, 'ONLINE')
ON CONFLICT DO NOTHING;
