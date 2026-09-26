import React, { useRef } from 'react';
import {
  FolderSearch,
  UploadCloud,
  Navigation,
  ArrowRight,
} from 'lucide-react';
import { ParsedExifResult } from '../types/exif';

interface HomeIntroProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  onOpenExplorerGuide: () => void;
  onSampleSelected: (data: ParsedExifResult) => void;
  onOpenQrCode?: () => void;
  lastPhotoData?: ParsedExifResult | null;
  onRestoreLastPhoto?: () => void;
}

export const HomeIntro: React.FC<HomeIntroProps> = ({
  onFileSelected,
  isLoading,
  lastPhotoData,
  onRestoreLastPhoto,
}) => {
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Hidden file input without accept attribute to bypass Android PhotoPicker purge */}
      <input
        ref={documentFileInputRef}
        type="file"
        className="hidden"
        onChange={handleDocumentChange}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Photo Samsung S23 <span className="text-amber-400">➔ OsmAnd</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Extraction GPS directe et envoi en un clic vers votre application de navigation.
        </p>
      </div>

      {/* Main Action Card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 mx-auto mb-5 shadow-lg shadow-amber-500/20">
          <UploadCloud className="h-8 w-8 stroke-[2.5]" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          Sélectionnez votre photo ou vidéo S23
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Formats acceptés : JPG, HEIC, MP4 ou RAW
        </p>

        {/* Primary Action Button */}
        <div className="space-y-4">
          <button
            onClick={() => documentFileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer font-black text-lg disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <FolderSearch className="h-6 w-6 stroke-[2.5]" />
              <span>Ouvrir avec Cx Explorateur (ou Fichiers)</span>
            </div>
            <span className="text-xs font-semibold opacity-90 mt-1">
              Clic ➔ Fichiers ➔ Parcourir dans d'autres applis ➔ Cx Explorateur
            </span>
          </button>

          {/* Quick restore last photo if exists */}
          {lastPhotoData?.gps && onRestoreLastPhoto && (
            <button
              onClick={onRestoreLastPhoto}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-emerald-400 fill-emerald-400" />
                <div>
                  <span className="font-bold text-sm block">Reprendre la dernière photo analysée</span>
                  <span className="text-xs text-slate-400 font-mono">
                    GPS : {lastPhotoData.gps.latitude.toFixed(5)}, {lastPhotoData.gps.longitude.toFixed(5)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 font-bold text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                <span>GO TO OSMAND</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
