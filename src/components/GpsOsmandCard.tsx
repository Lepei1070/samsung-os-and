import React, { useEffect, useState } from 'react';
import {
  Compass,
  Navigation,
  MapPin,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Clock,
  Gauge,
  Mountain,
  AlertTriangle,
  Send,
  HelpCircle,
} from 'lucide-react';
import { GpsCoordinates, ReverseGeocodeResult } from '../types/exif';
import { buildOsmAndUrls, downloadGpxFile, reverseGeocode } from '../utils/geoUtils';
import { LeafletMap } from './LeafletMap';
import { Wrench, Sparkles, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface GpsOsmandCardProps {
  gps?: GpsCoordinates;
  fileName: string;
  deepScanLog?: string[];
  onOpenSamsungFix?: () => void;
  onOpenManualLocation?: () => void;
}

export const GpsOsmandCard: React.FC<GpsOsmandCardProps> = ({
  gps,
  fileName,
  deepScanLog,
  onOpenSamsungFix,
  onOpenManualLocation,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [address, setAddress] = useState<ReverseGeocodeResult | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(true); // Open by default for immediate diagnostic!

  useEffect(() => {
    if (!gps) return;
    setLoadingAddress(true);
    reverseGeocode(gps.latitude, gps.longitude)
      .then((res) => setAddress(res))
      .finally(() => setLoadingAddress(false));
  }, [gps?.latitude, gps?.longitude]);

  if (!gps) {
    return (
      <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 text-xs font-semibold text-amber-300 mb-2">
              <span>Diagnostic Samsung S23 : Aucune balise GPS enregistrée dans ce flux</span>
            </div>

            <h3 className="text-xl font-bold text-white">
              Le fichier reçu ne contient pas de coordonnées GPS
            </h3>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Le scanner binaire n'a pas trouvé de balise GPS dans ce fichier. Comme vous avez constaté avec votre script ExifTool sur PC que le fichier original possède bien le GPS, cela confirme que <strong className="text-white">Android a purgé le bloc GPS avant de transmettre le fichier au navigateur</strong>.
            </p>

            {/* Instruction on how to use "Fichiers" */}
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
              <strong className="text-amber-300 block mb-1.5 font-bold">
                👉 Procédure exacte dans l'application « Fichiers » de votre S23 :
              </strong>
              <ol className="list-decimal list-inside space-y-1 text-slate-200">
                <li>Cliquez sur le bouton <strong>« Rechoisir une photo »</strong> en haut.</li>
                <li>Cliquez sur <strong>« Sélecteur Fichiers / Documents »</strong>.</li>
                <li>Quand l'écran <strong>« Fichiers »</strong> s'ouvre, touchez le menu <strong>☰ (les 3 traits en haut à gauche)</strong>.</li>
                <li>Choisissez <strong>Stockage interne</strong> (ou <strong>Galaxy S23</strong>, ou <strong>X-plore</strong> s'il apparaît dans la liste).</li>
                <li>Ouvrez <strong>DCIM &gt; Camera</strong> et sélectionnez votre photo.</li>
              </ol>
            </div>

            {/* Direct Action Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {onOpenManualLocation && (
                <button
                  onClick={onOpenManualLocation}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Assigner le lieu manuellement & Transmettre à OsmAnd</span>
                </button>
              )}

              {onOpenSamsungFix && (
                <button
                  onClick={onOpenSamsungFix}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>Guide Réparation S23</span>
                </button>
              )}

              {deepScanLog && deepScanLog.length > 0 && (
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Terminal className="h-3.5 w-3.5 text-sky-400" />
                  <span>Journal de scan ({deepScanLog.length} étapes)</span>
                  {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>

            {/* Permanent logs display */}
            {showLogs && deepScanLog && (
              <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-56 overflow-y-auto">
                <div className="text-amber-400 font-bold mb-2">Détail du scan binaire (ExifTool Engine) :</div>
                {deepScanLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 select-none font-bold">&gt;</span>
                    <span className="leading-snug">{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const urls = buildOsmAndUrls(gps, fileName);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleLaunchOsmAnd = (type: 'navigate' | 'point' | 'geo') => {
    // Primary: Standard Android geo: protocol which Android OS directly delegates to OsmAnd
    let targetUrl = urls.geoUri;
    if (type === 'point') targetUrl = urls.geoUri;
    if (type === 'geo') targetUrl = urls.geoUri;

    // Trigger URL
    window.location.href = targetUrl;

    setFeedbackMsg(
      `Lancement d'OsmAnd en cours... Si Android vous le demande, sélectionnez OsmAnd.`
    );
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Coordonnées GPS Photo - ${fileName}`,
          text: `Position extraite de la photo Samsung S23 :\nLatitude: ${gps.latitude.toFixed(6)}\nLongitude: ${gps.longitude.toFixed(6)}\nAdresse: ${address?.displayName || 'Inconnue'}`,
          url: urls.osmandWeb,
        });
      } catch (err) {
        console.warn('Share cancelled or failed:', err);
      }
    } else {
      copyToClipboard(`${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`, 'coords');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Transmission OsmAnd Header */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-950 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
              <Compass className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <span>Transmission vers OsmAnd</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Coordonnées GPS Validées</span>
                {gps.detectionSource && (
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-mono text-amber-300 font-normal">
                    {gps.detectionSource}
                  </span>
                )}
              </h3>
              {gps.nullIslandWarning && (
                <div className="mt-1 text-xs text-red-400 font-medium">
                  Attention : Coordonnées (0.0, 0.0) enregistrées par le Samsung S23 (déclenchement avant fixation GPS).
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleLaunchOsmAnd('navigate')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer tracking-wide"
            >
              <Navigation className="h-4 w-4 fill-slate-950 stroke-[2.5]" />
              <span>GO TO OSMAND</span>
            </button>

            <button
              onClick={() => handleLaunchOsmAnd('point')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              title="Voir le point sur la carte OsmAnd"
            >
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>Voir sur carte</span>
            </button>

            <button
              onClick={() => downloadGpxFile(gps, fileName)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              title="Télécharger le fichier waypoint GPX pour importer dans OsmAnd"
            >
              <Download className="h-4 w-4 text-sky-400" />
              <span className="hidden sm:inline">Export GPX</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                title="Partager vers OsmAnd ou autre app"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {feedbackMsg && (
          <div className="mt-4 rounded-lg bg-amber-500/15 border border-amber-500/30 p-3 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 shrink-0 text-amber-400" />
              <span>{feedbackMsg}</span>
            </div>
            <a
              href="https://play.google.com/store/apps/details?id=net.osmand"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-amber-300 hover:text-amber-100 shrink-0 ml-2"
            >
              Play Store
            </a>
          </div>
        )}
      </div>

      {/* Main Grid: Coordinates info & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Coordinates Details */}
        <div className="lg:col-span-6 space-y-4">
          {/* Decimal & DMS Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Coordonnées Brutes</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`,
                    'decimal'
                  )
                }
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                {copied === 'decimal' ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copier Décimal</span>
                  </>
                )}
              </button>
            </h4>

            {/* Latitude Row */}
            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <div>
                <span className="text-xs text-slate-400">Latitude :</span>
                <div className="text-base font-bold font-mono text-white">
                  {gps.latitude.toFixed(6)}°
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {gps.latitudeDMS}
                </div>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-amber-300">
                {gps.latitude >= 0 ? 'Nord' : 'Sud'}
              </span>
            </div>

            {/* Longitude Row */}
            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <div>
                <span className="text-xs text-slate-400">Longitude :</span>
                <div className="text-base font-bold font-mono text-white">
                  {gps.longitude.toFixed(6)}°
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {gps.longitudeDMS}
                </div>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-amber-300">
                {gps.longitude >= 0 ? 'Est' : 'Ouest'}
              </span>
            </div>

            {/* Secondary telemetry: Altitude, DOP, Time */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Mountain className="h-3.5 w-3.5 text-sky-400" />
                  <span>Altitude</span>
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {gps.altitude !== undefined
                    ? `${gps.altitude.toFixed(1)} m`
                    : 'Non spécifiée'}
                </div>
              </div>

              <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Gauge className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Précision / DOP</span>
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {gps.precision !== undefined
                    ? `±${gps.precision.toFixed(1)} m`
                    : gps.dop !== undefined
                      ? `DOP: ${gps.dop.toFixed(1)}`
                      : 'Standard S23'}
                </div>
              </div>

              {gps.timestamp && (
                <div className="col-span-2 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Horodatage GPS</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 mt-1">
                    {gps.datestamp ? `${gps.datestamp} · ` : ''}{gps.timestamp}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reverse Geocode Address */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Adresse localisée (OpenStreetMap)</span>
            </h4>
            {loadingAddress ? (
              <div className="animate-pulse space-y-1.5 py-2">
                <div className="h-3 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            ) : address ? (
              <div>
                <p className="text-sm font-medium text-slate-100 leading-snug">
                  {address.displayName}
                </p>
                {(address.city || address.country) && (
                  <p className="text-xs text-slate-400 mt-1">
                    {[address.road, address.city, address.country]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Localisation en haute mer ou zone non répertoriée dans OpenStreetMap.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map & Quick Links */}
        <div className="lg:col-span-6 space-y-4">
          <LeafletMap
            latitude={gps.latitude}
            longitude={gps.longitude}
            title={fileName}
            altitude={gps.altitude}
          />

          {/* External Map & Navigation Shortcuts */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Autres méthodes d'ouverture :
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleLaunchOsmAnd('geo')}
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                title="Déclenche l'intention Android standard geo:"
              >
                <Compass className="h-3.5 w-3.5 text-amber-400" />
                <span>Geo Intent</span>
              </button>

              <a
                href={urls.osmandWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                <span>OsmAnd Web</span>
              </a>

              <a
                href={urls.osmWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>OpenStreetMap</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
