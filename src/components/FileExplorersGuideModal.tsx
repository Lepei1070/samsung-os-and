import React from 'react';
import {
  X,
  FolderOpen,
  ExternalLink,
  Smartphone,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  FileCheck,
} from 'lucide-react';

interface FileExplorersGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileExplorersGuideModal: React.FC<FileExplorersGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleOpenXplore = () => {
    // Attempt to launch X-plore via Android intent or market URI
    window.location.href = 'intent:#Intent;package=com.lonelycatgames.Xplore;end';
  };

  const handleOpenFileManagerPlus = () => {
    // Attempt to launch File Manager + via Android intent
    window.location.href = 'intent:#Intent;package=com.alphainventor.filemanager;end';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Guide Samsung S23 : X-plore & Gestionnaire de fichiers+
            </h3>
            <p className="text-xs text-slate-400">
              Comment contourner les filtres de confidentialité One UI pour accéder aux coordonnées GPS brutes
            </p>
          </div>
        </div>

        {/* Core explanation */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
            <h4 className="font-semibold text-amber-300 text-sm flex items-center gap-2 mb-1.5">
              <ShieldAlert className="h-4 w-4" />
              Pourquoi Samsung One UI cache ou purge parfois le GPS ?
            </h4>
            <p>
              Sur les Samsung Galaxy S23 (One UI 5.1 / 6.0 / 6.1), Samsung a introduit par défaut un mécanisme de protection de la vie privée : lorsque vous partagez une photo ou utilisez le sélecteur d'image simplifié de la Galerie, One UI peut expurger silencieusement les coordonnées GPS (<code className="text-amber-200">EXIF 0x8825</code>).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              La solution : Pointer directement sur le fichier brut
            </h4>
            <p>
              Sur le stockage interne de votre Galaxy S23, la photo originale non altérée est située dans le dossier :
            </p>
            <div className="mt-2 rounded-lg bg-slate-950 border border-slate-800 p-2.5 font-mono text-amber-300 text-xs">
              /Stockage interne/DCIM/Camera/
            </div>
          </div>

          {/* Quick jumps to Cx Explorateur, X-plore and File Manager + */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Cx Explorateur Card */}
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-300 text-sm">Cx Explorateur</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">Testé & Validé</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Recommandé : transmet 100% du bloc EXIF GPS à OsmAnd sans purge Android.
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <a
                  href="https://play.google.com/store/apps/details?id=com.cxinventor.file.explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Fiche Play Store
                </a>
              </div>
            </div>

            {/* X-plore Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-100 text-sm">X-plore File Manager</span>
                  <span className="text-[10px] text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-900/50">Double panneau</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Explorateur complet réputé pour conserver l'intégrité binaire des fichiers et métadonnées.
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <a
                  href="https://play.google.com/store/apps/details?id=com.lonelycatgames.Xplore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
                >
                  Fiche Play Store
                </a>
              </div>
            </div>

            {/* Gestionnaire de fichiers + Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-100 text-sm">Gestionnaire +</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900/50">Simple</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Application légère permettant d'accéder au dossier DCIM sans filtrage d'album.
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <a
                  href="https://play.google.com/store/apps/details?id=com.alphainventor.filemanager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                >
                  Fiche Play Store
                </a>
              </div>
            </div>
          </div>

          {/* Step by step recap */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5">
            <span className="font-semibold text-slate-200 block mb-1">
              Procédure en 3 étapes :
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Dans cette application, cliquez sur <strong>« Choisir le Fichier brut »</strong>.</li>
              <li>Dans la boîte de dialogue système Android, choisissez votre gestionnaire (X-plore ou Gestionnaire +).</li>
              <li>Accédez à <strong>DCIM &gt; Camera</strong> et sélectionnez le fichier <code className="text-slate-300">.jpg</code>, <code className="text-slate-300">.heic</code> ou <code className="text-slate-300">.dng</code>.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
