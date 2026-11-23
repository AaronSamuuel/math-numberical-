import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export function VillageMap({ villages, measurements, onSelectVillage, selectedVillageId }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Tamil Nadu / South India Ghats
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [11.3, 77.8],
        zoom: 7,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers for each village
    villages.forEach((vil) => {
      const vMeas = measurements.filter((m) => m.villageId === vil.id);
      const latestMeas = vMeas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      const downSpeed = latestMeas?.downloadSpeed ?? 0;
      const isSelected = selectedVillageId === vil.id;

      // Color based on speed / connectivity health
      const color = downSpeed >= 30 ? '#10b981' : downSpeed >= 15 ? '#06b6d4' : '#ef4444';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${color};
            width: ${isSelected ? '28px' : '22px'};
            height: ${isSelected ? '28px' : '22px'};
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            transition: all 0.3s ease;
          ">
            <span>\u2699</span>
          </div>
        `,
        iconSize: isSelected ? [28, 28] : [22, 22],
        iconAnchor: isSelected ? [14, 14] : [11, 11]
      });

      const marker = L.marker([vil.latitude, vil.longitude], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #1e293b;">
          <strong style="font-size: 13px; color: #0b132b;">${vil.name}</strong><br/>
          <span style="color: #64748b;">${vil.nameTamil || ''} &bull; ${vil.district}</span>
          <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;"/>
          <div><strong>Download Speed:</strong> <span style="color: #0284c7; font-weight: bold;">${downSpeed} Mbps</span></div>
          <div><strong>Terminal:</strong> <code>${vil.terminalCode || 'VSAT-01'}</code></div>
          <div><strong>Elevation:</strong> ${vil.elevationMeters || 1200}m MSL</div>
          <div><strong>Terrain:</strong> ${vil.terrain || 'Hill ridge'}</div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectVillage) onSelectVillage(vil.id);
      });

      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup on unmount handled by ref
    };
  }, [villages, measurements, selectedVillageId, onSelectVillage]);

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 relative shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] shadow">
        <span className="font-semibold text-slate-700">OpenStreetMap &bull; Leaflet Realtime View</span>
      </div>
    </div>
  );
}
