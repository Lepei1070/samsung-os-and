import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Maximize2,
  HardDrive,
  Camera,
  ArrowLeft,
  RotateCcw,
  Zap,
  Eye,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { ParsedExifResult } from '../types/exif';

interface PhotoOverviewProps {
  data: ParsedExifResult;
  onReset: () => void;
}

export const PhotoOverview: React.FC<PhotoOverviewProps> = ({ data, onReset }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const formatDate = (timestamp?: number, dateString?: string): string => {
    if (dateString) return dateString;
    if (timestamp) return new Date(timestamp).toLocaleString('fr-FR');
    return 'Non renseignée';
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Header bar with Back button and File Name */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-500/50 hover:bg-slate-800 hover:text-white transition-all cursor-pointer shrink-0"
            title="Revenir au choix de la photo"
          >
            <ArrowLeft className="h-4 w-4 text-amber-400" />
            <span>Rechoisir une autre photo</span>
          </button>

          <div className="truncate">
            <h2 className="text-base font-bold text-white truncate flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="font-mono">{data.fileName}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {data.samsung.isSamsungDevice && (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
              <CheckCircle2 className="h-3 w-3 text-sky-400" />
              <span>Samsung Galaxy Détecté</span>
            </span>
          )}

          {data.gps ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>GPS Intact</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-300">
              <span>GPS Absent</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Photo Preview + Technical Specs */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Photo Preview Thumbnail */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="relative group w-full aspect-4/3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
            <img
              src={data.previewUrl}
              alt={data.fileName}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <button
              onClick={() => setShowFullPreview(true)}
              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-xs transition-opacity cursor-pointer"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Agrandir</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-mono">
            {data.imageWidth && data.imageHeight
              ? `${data.imageWidth} × ${data.imageHeight} px`
              : 'Résolution native'}
          </span>
        </div>

        {/* Technical Data Badges */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span>Appareil / Modèle</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1 truncate">
              {data.model || data.make || 'Samsung Galaxy'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {data.samsung.cameraSoftware || data.software || 'One UI'}
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <HardDrive className="h-3.5 w-3.5 text-sky-400" />
              <span>Taille & Format</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1 font-mono">
              {formatFileSize(data.fileSize)}
            </div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">
              {data.fileType.replace('image/', '')}
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span>Date de prise de vue</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1 truncate font-mono text-xs">
              {formatDate(data.lastModified, data.dateTimeOriginal)}
            </div>
            <div className="text-[11px] text-slate-400">
              Horodatage EXIF
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sliders className="h-3.5 w-3.5 text-amber-400" />
              <span>Ouverture & Vitesse</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1 font-mono">
              {data.fNumber ? `f/${data.fNumber}` : '—'} ·{' '}
              {data.exposureTime
                ? data.exposureTime < 1
                  ? `1/${Math.round(1 / data.exposureTime)}s`
                  : `${data.exposureTime}s`
                : '—'}
            </div>
            <div className="text-[11px] text-slate-400">
              Exposition optique
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span>Sensibilité ISO</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1 font-mono">
              {data.iso ? `ISO ${data.iso}` : 'Auto'}
            </div>
            <div className="text-[11px] text-slate-400">
              Capteur ISOCELL
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Eye className="h-3.5 w-3.5 text-rose-400" />
              <span>Focale équivalente</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1 font-mono">
              {data.focalLengthIn35mmFormat
                ? `${data.focalLengthIn35mmFormat} mm`
                : data.focalLength
                  ? `${data.focalLength} mm`
                  : '—'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {data.lensModel || 'Optique S23'}
            </div>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {showFullPreview && (
        <div
          onClick={() => setShowFullPreview(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out"
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl">
            <img
              src={data.previewUrl}
              alt={data.fileName}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 border border-slate-700 px-4 py-1 text-xs text-white">
              Cliquer pour fermer
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
