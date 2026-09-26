import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Maximize2, MapPin } from 'lucide-react';

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  title: string;
  altitude?: number;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  latitude,
  longitude,
  title,
  altitude,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [mapType, setMapType] = useState<'osm' | 'satellite'>('osm');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix standard leaflet icon path issues in bundlers
    const customIcon = L.divIcon({
      className: 'custom-osm-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(245, 158, 11, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #f59e0b; border: 2.5px solid #0f172a; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add default tile layer
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      });
      osmLayer.addTo(map);

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
          <strong style="display:block; font-size: 13px; margin-bottom: 2px;">${title}</strong>
          <div>Lat: ${latitude.toFixed(6)}</div>
          <div>Lon: ${longitude.toFixed(6)}</div>
          ${altitude ? `<div>Alt: ${altitude.toFixed(1)}m</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);
    } else {
      mapInstanceRef.current.setView([latitude, longitude], 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
    }

    return () => {
      // Clean up map when component completely unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [latitude, longitude, title, altitude]);

  // Handle layer switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }
  }, [mapType]);

  const handleCenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 17, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating map controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => setMapType(mapType === 'osm' ? 'satellite' : 'osm')}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 shadow-md backdrop-blur-sm hover:bg-slate-800 hover:text-white transition-colors"
          title="Changer de vue"
        >
          <Layers className="h-3.5 w-3.5 text-amber-400" />
          <span>{mapType === 'osm' ? 'Satellite' : 'Carte OSM'}</span>
        </button>

        <button
          onClick={handleCenterMap}
          className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700/80 bg-slate-900/90 text-slate-200 shadow-md backdrop-blur-sm hover:bg-slate-800 hover:text-white transition-colors"
          title="Recentrer sur la photo"
        >
          <MapPin className="h-4 w-4 text-emerald-400" />
        </button>
      </div>

      {/* OpenStreetMap / Esri attribution */}
      <div className="absolute bottom-1 right-2 z-10 text-[9px] text-slate-400/80 bg-slate-950/80 px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none">
        {mapType === 'osm' ? '© OpenStreetMap contributors' : '© Esri Satellite'}
      </div>
    </div>
  );
};
