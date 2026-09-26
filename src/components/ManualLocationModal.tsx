import React, { useState } from 'react';
import {
  X,
  Search,
  MapPin,
  Check,
  Compass,
  Loader2,
  Navigation,
} from 'lucide-react';
import { GpsCoordinates } from '../types/exif';
import { decimalToDms } from '../utils/geoUtils';

interface ManualLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetCoordinates: (coords: GpsCoordinates) => void;
}

export const ManualLocationModal: React.FC<ManualLocationModalProps> = ({
  isOpen,
  onClose,
  onSetCoordinates,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`,
        {
          headers: {
            'Accept-Language': 'fr, en',
            'User-Agent': 'SamsungS23-ManualLocator/1.0',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = () => {
    if (!selectedCoords) return;

    const coords: GpsCoordinates = {
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lon,
      latitudeDMS: decimalToDms(selectedCoords.lat, true),
      longitudeDMS: decimalToDms(selectedCoords.lon, false),
      detectionSource: `Localisation manuelle (${selectedCoords.name})`,
      isManuallySet: true,
    };

    onSetCoordinates(coords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Assigner la position de la photo
            </h3>
            <p className="text-xs text-slate-400">
              Recherchez le lieu où la photo a été prise pour l'envoyer vers OsmAnd
            </p>
          </div>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ex: Tour Eiffel, Chamonix, Lac d'Annecy, Rue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Chercher</span>}
          </button>
        </form>

        {/* Search Results List */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/70 p-2 mb-4">
          {searchResults.length > 0 ? (
            searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedCoords({
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon),
                    name: item.display_name.split(',')[0],
                  })
                }
                className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                  selectedCoords?.lat === parseFloat(item.lat) &&
                  selectedCoords?.lon === parseFloat(item.lon)
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                    : 'hover:bg-slate-900 text-slate-300'
                }`}
              >
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-100 truncate">
                    {item.display_name.split(',')[0]}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.display_name}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              {isSearching
                ? 'Recherche sur OpenStreetMap...'
                : 'Saisissez une ville, un monument ou une adresse ci-dessus.'}
            </div>
          )}
        </div>

        {/* Selected Coords Preview */}
        {selectedCoords && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 mb-4 text-xs">
            <div className="font-semibold text-amber-300">Position sélectionnée :</div>
            <div className="text-slate-200 font-mono mt-0.5">
              Lat: {selectedCoords.lat.toFixed(6)}°, Lon: {selectedCoords.lon.toFixed(6)}°
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedCoords}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Valider et Transmettre à OsmAnd</span>
          </button>
        </div>
      </div>
    </div>
  );
};
