/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeIntro } from './components/HomeIntro';
import { PhotoOverview } from './components/PhotoOverview';
import { GpsOsmandCard } from './components/GpsOsmandCard';
import { FileExplorersGuideModal } from './components/FileExplorersGuideModal';
import { QrCodeModal } from './components/QrCodeModal';
import { SamsungS23FixModal } from './components/SamsungS23FixModal';
import { ManualLocationModal } from './components/ManualLocationModal';
import { PermanentInstallModal } from './components/PermanentInstallModal';
import { ParsedExifResult, GpsCoordinates } from './types/exif';
import { parsePhotoFile } from './utils/exifParser';
import { Loader2, AlertCircle, Navigation, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentPhotoData, setCurrentPhotoData] = useState<ParsedExifResult | null>(() => {
    try {
      const saved = localStorage.getItem('samsung_osmand_photo_cache');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Cache restore error:', e);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExplorerGuideOpen, setIsExplorerGuideOpen] = useState(false);
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);
  const [isSamsungFixOpen, setIsSamsungFixOpen] = useState(false);
  const [isManualLocationOpen, setIsManualLocationOpen] = useState(false);
  const [isPermanentInstallOpen, setIsPermanentInstallOpen] = useState(false);

  useEffect(() => {
    if (currentPhotoData) {
      try {
        localStorage.setItem('samsung_osmand_photo_cache', JSON.stringify(currentPhotoData));
      } catch (e) {
        console.warn('Cache save error:', e);
      }
    }
  }, [currentPhotoData]);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const parsed = await parsePhotoFile(file);
      setCurrentPhotoData(parsed);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to parse file:', err);
      setErrorMsg(
        'Erreur lors de la lecture du fichier photo. Vérifiez qu\'il s\'agit bien d\'une image valide (JPEG, HEIC, DNG ou PNG).'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleSelected = (sampleData: ParsedExifResult) => {
    setErrorMsg(null);
    setCurrentPhotoData(sampleData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setCurrentPhotoData(null);
    setErrorMsg(null);
    try {
      localStorage.removeItem('samsung_osmand_photo_cache');
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetManualCoordinates = (coords: GpsCoordinates) => {
    if (currentPhotoData) {
      setCurrentPhotoData({
        ...currentPhotoData,
        gps: coords,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header with Return Button & Guide */}
      <Header
        hasPhoto={Boolean(currentPhotoData)}
        onReset={handleReset}
        onOpenExplorerGuide={() => setIsExplorerGuideOpen(true)}
        onOpenQrCode={() => setIsQrCodeOpen(true)}
        onOpenSamsungFix={() => setIsSamsungFixOpen(true)}
        onOpenPermanentInstall={() => setIsPermanentInstallOpen(true)}
        photoName={currentPhotoData?.fileName}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isLoading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Analyse en profondeur du fichier...
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Extraction des balises EXIF, GPS et métadonnées
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="mx-auto max-w-4xl px-4 pt-6">
            <div className="rounded-xl border border-red-800 bg-red-950/50 p-4 text-xs text-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-red-300">Erreur :</strong>{' '}
                {errorMsg}
              </div>
            </div>
          </div>
        )}

        {!currentPhotoData ? (
          /* Step 1: Presentation & Photo Picker */
          <HomeIntro
            onFileSelected={handleFileSelected}
            onSampleSelected={handleSampleSelected}
            onOpenExplorerGuide={() => setIsExplorerGuideOpen(true)}
            onOpenQrCode={() => setIsQrCodeOpen(true)}
            isLoading={isLoading}
          />
        ) : (
          /* Step 2: Results Display */
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 space-y-5">
            {/* TOP GIANT OSMAND BANNER */}
            {currentPhotoData.gps && (
              <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 p-5 sm:p-6 shadow-2xl space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400 block mb-0.5">
                      Coordonnées GPS extraites avec succès
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono">
                      {currentPhotoData.gps.latitude.toFixed(6)}, {currentPhotoData.gps.longitude.toFixed(6)}
                    </div>
                  </div>

                  <a
                    href={`geo:${currentPhotoData.gps.latitude},${currentPhotoData.gps.longitude}?q=${currentPhotoData.gps.latitude},${currentPhotoData.gps.longitude}(${encodeURIComponent(currentPhotoData.fileName || 'Destination Photo')})`}
                    onClick={(e) => {
                      // Trigger direct geo location on Android
                      window.location.href = `geo:${currentPhotoData.gps!.latitude},${currentPhotoData.gps!.longitude}?q=${currentPhotoData.gps!.latitude},${currentPhotoData.gps!.longitude}(${encodeURIComponent(currentPhotoData.fileName || 'Destination Photo')})`;
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-8 py-4 text-lg font-black text-slate-950 shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all text-center tracking-wide cursor-pointer"
                  >
                    <Navigation className="h-6 w-6 fill-slate-950 stroke-[2.5]" />
                    <span>GO TO OSMAND</span>
                  </a>
                </div>

                {/* Alternate launch buttons in case device has specific app links configuration */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Autres méthodes de lancement :</span>
                  <a
                    href={`https://osmand.net/go?lat=${currentPhotoData.gps.latitude}&lon=${currentPhotoData.gps.longitude}&z=17`}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-slate-300 font-medium transition-colors"
                  >
                    Lien OsmAnd App (osmand.net/go)
                  </a>
                  <a
                    href={`intent:#Intent;action=android.intent.action.VIEW;data=geo:${currentPhotoData.gps.latitude},${currentPhotoData.gps.longitude}?q=${currentPhotoData.gps.latitude},${currentPhotoData.gps.longitude}(${encodeURIComponent(currentPhotoData.fileName || 'Destination')});package=net.osmand;end`}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-slate-300 font-medium transition-colors"
                  >
                    Intent direct Android
                  </a>
                </div>
              </div>
            )}

            {/* 1. Photo summary & specifications */}
            <PhotoOverview
              data={currentPhotoData}
              onReset={handleReset}
            />

            {/* 2. GPS Coordinates & Map */}
            <GpsOsmandCard
              gps={currentPhotoData.gps}
              fileName={currentPhotoData.fileName}
              deepScanLog={currentPhotoData.deepScanLog}
              onOpenSamsungFix={() => setIsSamsungFixOpen(true)}
              onOpenManualLocation={() => setIsManualLocationOpen(true)}
            />

            {/* Bottom Return Button */}
            <div className="pt-2 pb-6 flex justify-center">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-6 py-3 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all cursor-pointer shadow-md"
              >
                <ArrowLeft className="h-4 w-4 text-amber-400" />
                <span>Rechoisir une autre photo</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Clean minimal footer without blabla */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>Samsung Galaxy S23 & OsmAnd Bridge · Traitement 100% local</p>
      </footer>

      {/* Guide Modal for X-plore and Gestionnaire de fichiers+ */}
      <FileExplorersGuideModal
        isOpen={isExplorerGuideOpen}
        onClose={() => setIsExplorerGuideOpen(false)}
      />

      {/* QR Code Modal to test on mobile phone */}
      <QrCodeModal
        isOpen={isQrCodeOpen}
        onClose={() => setIsQrCodeOpen(false)}
      />

      {/* Samsung S23 GPS Fix Guide Modal */}
      <SamsungS23FixModal
        isOpen={isSamsungFixOpen}
        onClose={() => setIsSamsungFixOpen(false)}
        onOpenManualPicker={() => setIsManualLocationOpen(true)}
      />

      {/* Manual Location Search Modal */}
      <ManualLocationModal
        isOpen={isManualLocationOpen}
        onClose={() => setIsManualLocationOpen(false)}
        onSetCoordinates={handleSetManualCoordinates}
      />

      {/* Permanent Install & Self-Hosting Guide Modal */}
      <PermanentInstallModal
        isOpen={isPermanentInstallOpen}
        onClose={() => setIsPermanentInstallOpen(false)}
      />
    </div>
  );
}
