import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  UserCheck,
  LogIn,
  RotateCcw,
  CheckCircle2,
  Radio,
  MapPin,
  Settings,
  Database
} from 'lucide-react';

export function AdminView({ onOpenAdminModal }) {
  const {
    isAdmin,
    adminEmail,
    villages,
    addVillage,
    deleteVillage,
    terminals,
    addTerminal,
    deleteTerminal,
    resetToMockData,
    isDemoMode,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState('villages'); // 'villages' | 'terminals' | 'system'

  // Village Form State
  const [villageForm, setVillageForm] = useState({
    name: '',
    nameTamil: '',
    district: '',
    state: 'Tamil Nadu',
    latitude: '11.0',
    longitude: '77.0',
    population: '900',
    elevationMeters: '1100',
    terrain: 'Dense Hill Forest'
  });

  // Terminal Form State
  const [terminalForm, setTerminalForm] = useState({
    villageId: villages[0]?.id || '',
    terminalCode: '',
    model: 'BharatNet VSAT-Ka 1.2m',
    azimuth: '142.0',
    elevation: '48.0',
    status: 'ONLINE'
  });

  const handleAddVillage = (e) => {
    e.preventDefault();
    if (!villageForm.name || !villageForm.district) return;
    addVillage({
      id: `vil-${Date.now()}`,
      name: villageForm.name,
      nameTamil: villageForm.nameTamil || villageForm.name,
      district: villageForm.district,
      state: villageForm.state,
      latitude: parseFloat(villageForm.latitude),
      longitude: parseFloat(villageForm.longitude),
      population: parseInt(villageForm.population, 10),
      elevationMeters: parseInt(villageForm.elevationMeters, 10),
      terrain: villageForm.terrain,
      providerId: 'prov-1',
      terminalCode: `SAT-${villageForm.name.slice(0, 3).toUpperCase()}-01`
    });
    setVillageForm({
      name: '',
      nameTamil: '',
      district: '',
      state: 'Tamil Nadu',
      latitude: '11.0',
      longitude: '77.0',
      population: '900',
      elevationMeters: '1100',
      terrain: 'Dense Hill Forest'
    });
  };

  const handleAddTerminal = (e) => {
    e.preventDefault();
    if (!terminalForm.terminalCode) return;
    addTerminal({
      id: `term-${Date.now()}`,
      villageId: terminalForm.villageId || villages[0]?.id,
      terminalCode: terminalForm.terminalCode,
      model: terminalForm.model,
      dishDiameter: '1.2 m Solid Offset',
      azimuth: parseFloat(terminalForm.azimuth),
      elevation: parseFloat(terminalForm.elevation),
      status: terminalForm.status
    });
    setTerminalForm({
      villageId: villages[0]?.id || '',
      terminalCode: '',
      model: 'BharatNet VSAT-Ka 1.2m',
      azimuth: '142.0',
      elevation: '48.0',
      status: 'ONLINE'
    });
  };

  // If not logged in as Admin, prompt login
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
          <ShieldAlert className="w-7 h-7 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Administrator Console</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access restricted to verified satellite network engineers & panchayat administrators.
          </p>
        </div>
        <button
          onClick={onOpenAdminModal}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition"
        >
          Authenticate Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Administrator Control Center
          </h2>
          <p className="text-xs text-slate-500">
            Signed in as: <strong className="text-slate-800">{adminEmail}</strong> &bull; Full CRUD privileges enabled
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg border border-slate-300 bg-slate-50 p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('villages')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              activeTab === 'villages' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Manage Villages
          </button>
          <button
            onClick={() => setActiveTab('terminals')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              activeTab === 'terminals' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Satellite Terminals
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              activeTab === 'system' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            System Maintenance
          </button>
        </div>
      </div>

      {/* Tab 1: Village Management */}
      {activeTab === 'villages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Add Village Form */}
          <form
            onSubmit={handleAddVillage}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3"
          >
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-600" /> Register Remote Village
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Village Name (English)</label>
              <input
                type="text"
                placeholder="e.g. Kolli Hills Upper"
                value={villageForm.name}
                onChange={(e) => setVillageForm({ ...villageForm, name: e.target.value })}
                required
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Village Name (தமிழ்)</label>
              <input
                type="text"
                placeholder="எ.கா. கொல்லிமலை மேல்நிலம்"
                value={villageForm.nameTamil}
                onChange={(e) => setVillageForm({ ...villageForm, nameTamil: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  placeholder="Namakkal"
                  value={villageForm.district}
                  onChange={(e) => setVillageForm({ ...villageForm, district: e.target.value })}
                  required
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Elevation (m MSL)</label>
                <input
                  type="number"
                  value={villageForm.elevationMeters}
                  onChange={(e) => setVillageForm({ ...villageForm, elevationMeters: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={villageForm.latitude}
                  onChange={(e) => setVillageForm({ ...villageForm, latitude: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={villageForm.longitude}
                  onChange={(e) => setVillageForm({ ...villageForm, longitude: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition"
            >
              Add Village Record
            </button>
          </form>

          {/* Village List */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Current Village Register ({villages.length} Villages)
            </h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {villages.map((v) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{v.name} ({v.nameTamil})</h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {v.district}, {v.state} &bull; Lat: {v.latitude}, Lon: {v.longitude}
                    </span>
                  </div>
                  {villages.length > 1 && (
                    <button
                      onClick={() => deleteVillage(v.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Delete village"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Terminal Management */}
      {activeTab === 'terminals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Add Terminal Form */}
          <form
            onSubmit={handleAddTerminal}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3"
          >
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-600" /> Register Satellite Terminal
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Village</label>
              <select
                value={terminalForm.villageId}
                onChange={(e) => setTerminalForm({ ...terminalForm, villageId: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Terminal Code</label>
              <input
                type="text"
                placeholder="e.g. SAT-NEW-07"
                value={terminalForm.terminalCode}
                onChange={(e) => setTerminalForm({ ...terminalForm, terminalCode: e.target.value })}
                required
                className="w-full p-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hardware Model</label>
              <input
                type="text"
                value={terminalForm.model}
                onChange={(e) => setTerminalForm({ ...terminalForm, model: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Azimuth (\u00B0)</label>
                <input
                  type="number"
                  step="0.1"
                  value={terminalForm.azimuth}
                  onChange={(e) => setTerminalForm({ ...terminalForm, azimuth: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Elevation (\u00B0)</label>
                <input
                  type="number"
                  step="0.1"
                  value={terminalForm.elevation}
                  onChange={(e) => setTerminalForm({ ...terminalForm, elevation: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition"
            >
              Register Terminal Hardware
            </button>
          </form>

          {/* Terminal List */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Registered Hardware Terminals ({terminals.length} Units)
            </h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {terminals.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 font-mono">{t.terminalCode}</h4>
                    <span className="text-[11px] text-slate-500">
                      Model: {t.model} &bull; Azimuth: {t.azimuth}\u00B0 &bull; Elev: {t.elevation}\u00B0
                    </span>
                  </div>
                  {terminals.length > 1 && (
                    <button
                      onClick={() => deleteTerminal(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Delete terminal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Maintenance & Reset */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-xs space-y-4 max-w-xl">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-600" /> Demo Dataset & State Operations
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Resetting returns all villages, terminals, calibrated telemetry readings, and thresholds
            to the clean initial mock dataset.
          </p>
          <button
            onClick={resetToMockData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow"
          >
            <RotateCcw className="w-4 h-4" /> Reset Database to Calibrated Demo State
          </button>
        </div>
      )}
    </div>
  );
}
