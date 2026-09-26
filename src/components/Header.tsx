import React from 'react';
import { Smartphone, ArrowLeft, FolderOpen, Compass, QrCode, Wrench, Download } from 'lucide-react';

interface HeaderProps {
  hasPhoto: boolean;
  onReset: () => void;
  onOpenExplorerGuide: () => void;
  onOpenQrCode: () => void;
  onOpenSamsungFix?: () => void;
  onOpenPermanentInstall?: () => void;
  photoName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  hasPhoto,
  onReset,
  onOpenExplorerGuide,
  onOpenQrCode,
  onOpenSamsungFix,
  onOpenPermanentInstall,
  photoName,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {hasPhoto ? (
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-amber-500/60 hover:bg-slate-800 hover:text-white cursor-pointer"
              title="Rechoisir une autre photo"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400" />
              <span>Rechoisir une photo</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-md shadow-amber-500/20">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-none text-white flex items-center gap-2">
                  Samsung S23 <span className="text-amber-400">EXIF</span> & OsmAnd
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Extracteur GPS & OsmAnd Bridge
                </p>
              </div>
            </div>
          )}

          {hasPhoto && photoName && (
            <div className="hidden md:block truncate max-w-xs text-xs text-slate-400 border-l border-slate-800 pl-3">
              <span className="text-slate-500">Fichier :</span> <span className="text-slate-300 font-mono">{photoName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenPermanentInstall && (
            <button
              onClick={onOpenPermanentInstall}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/15 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
              title="Garder l'application à vie sur votre smartphone"
            >
              <Download className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Garder sur mon S23</span>
              <span className="sm:hidden">Installer</span>
            </button>
          )}

          <button
            onClick={onOpenQrCode}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Afficher le QR Code pour ouvrir sur votre Samsung S23"
          >
            <QrCode className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};

